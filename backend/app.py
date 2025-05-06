from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
from PIL import Image
from torchvision import transforms
import io
import numpy as np
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
print("Initializing Gemini model...")
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
try:
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini model initialized successfully")
except Exception as e:
    print("Error initializing Gemini model:", str(e))
    raise

app = Flask(__name__)
CORS(app)

# Define your model
class WasteClassificationModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.mobnet = mobilenet_v3_small(weights=MobileNet_V3_Small_Weights.IMAGENET1K_V1)
        self.mobnet.classifier = nn.Identity()
        self.bn1 = nn.BatchNorm2d(576, momentum=0.1)
        self.conv1 = nn.Conv2d(576, 300, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(300, momentum=0.1)
        self.pool = nn.AdaptiveAvgPool2d((6, 6))
        self.dropout = nn.Dropout(0.5)
        self.fc1 = nn.Linear(300 * 6 * 6, 30)

        # Initialize the final layer with smaller weights
        nn.init.xavier_uniform_(self.fc1.weight, gain=0.1)
        nn.init.zeros_(self.fc1.bias)

    def forward(self, x):
        if x.dim() == 3:
            x = x.unsqueeze(0)
        x = self.mobnet.features(x)
        x = self.bn1(x)
        x = F.relu(x)
        x = self.conv1(x)
        x = self.bn2(x)
        x = F.relu(x)
        x = self.pool(x)
        x = x.flatten(start_dim=1)
        x = self.dropout(x)
        x = self.fc1(x)
        return x

# Initialize and load model
waste_model = WasteClassificationModel()
checkpoint_path = "mobilenet_transfer_learning_checkpoint.pth"
checkpoint = torch.load(checkpoint_path, map_location="cpu")

# Print checkpoint keys and shapes
print("\nCheckpoint keys:", checkpoint.keys())
if "model_state_dict" in checkpoint:
    print("\nModel state dict keys:", checkpoint["model_state_dict"].keys())
    for key, value in checkpoint["model_state_dict"].items():
        if "fc1" in key:
            print(f"\nCheckpoint {key} shape:", value.shape)
            print(f"Checkpoint {key} stats: min={value.min().item():.3f}, max={value.max().item():.3f}, mean={value.mean().item():.3f}")

# Load state dict with strict=False to handle any minor mismatches
waste_model.load_state_dict(checkpoint["model_state_dict"], strict=False)
waste_model.eval()

# Verify model parameters
print("\nVerifying model parameters:")
for name, param in waste_model.named_parameters():
    if 'fc1' in name:  # Check the final classification layer
        print(f"\n{name}")
        print(f"Shape: {param.shape}")
        print(f"Stats: min={param.min().item():.3f}, max={param.max().item():.3f}, mean={param.mean().item():.3f}")

# Reinitialize the final layer with better weights
with torch.no_grad():
    nn.init.xavier_uniform_(waste_model.fc1.weight, gain=1.0)  # Increased gain
    nn.init.zeros_(waste_model.fc1.bias)

# Preprocessing
transform = transforms.Compose([
    transforms.Resize(size=(256, 256)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # ImageNet normalization
])

# Define class mapping
CLASS_MAPPING = {
    0: "aerosol_cans",
    1: "aluminum_food_cans",
    2: "aluminum_soda_cans",
    3: "cardboard_boxes",
    4: "cardboard_packaging",
    5: "clothing",
    6: "coffee_grounds",
    7: "disposable_plastic_cutlery",
    8: "eggshells",
    9: "food_waste",
    10: "glass_beverage_bottles",
    11: "glass_cosmetic_containers",
    12: "glass_food_jars",
    13: "magazines",
    14: "newspaper",
    15: "office_paper",
    16: "paper_cups",
    17: "plastic_cup_lids",
    18: "plastic_detergent_bottles",
    19: "plastic_food_containers",
    20: "plastic_shopping_bags",
    21: "plastic_soda_bottles",
    22: "plastic_straws",
    23: "plastic_trash_bags",
    24: "plastic_water_bottles",
    25: "shoes",
    26: "steel_food_cans",
    27: "styrofoam_cups",
    28: "styrofoam_food_containers",
    29: "tea_bags",
    30: "unknown"  # Added unknown category
}

# Define higher-level category mapping
HIGHER_CLASS_MAPPING = {
    # Metal items
    "aerosol_cans": "metal",
    "aluminum_food_cans": "metal",
    "aluminum_soda_cans": "metal",
    "steel_food_cans": "metal",
    
    # Paper items
    "cardboard_boxes": "paper",
    "cardboard_packaging": "paper",
    "magazines": "paper",
    "newspaper": "paper",
    "office_paper": "paper",
    "paper_cups": "paper",
    
    # Glass items
    "glass_beverage_bottles": "glass",
    "glass_cosmetic_containers": "glass",
    "glass_food_jars": "glass",
    
    # Plastic items
    "disposable_plastic_cutlery": "plastic",
    "plastic_cup_lids": "plastic",
    "plastic_detergent_bottles": "plastic",
    "plastic_food_containers": "plastic",
    "plastic_shopping_bags": "plastic",
    "plastic_soda_bottles": "plastic",
    "plastic_straws": "plastic",
    "plastic_trash_bags": "plastic",
    "plastic_water_bottles": "plastic",
    
    # Styrofoam items
    "styrofoam_cups": "styrofoam",
    "styrofoam_food_containers": "styrofoam",
    
    # Organic waste
    "coffee_grounds": "organic",
    "eggshells": "organic",
    "food_waste": "organic",
    "tea_bags": "organic",
    
    # Textile items
    "clothing": "textile",
    "shoes": "textile",
    
    # Unknown items
    "unknown": "unknown"
}

# Define recycling instructions for Switzerland
RECYCLING_INSTRUCTIONS = {
    # Metal items
    "aerosol_cans": {
        "category": "Metal",
        "instructions": [
            "Empty the can completely",
            "Remove any plastic caps or nozzles",
            "Place in metal recycling bin"
        ],
        "tips": [
            "Ensure the can is completely empty before recycling",
            "Do not puncture or crush the can",
            "Remove any remaining product by spraying until empty"
        ],
        "disposal": "Place in metal recycling collection points or household metal waste bins"
    },
    "aluminum_food_cans": {
        "category": "Metal",
        "instructions": [
            "Rinse the can to remove food residues",
            "Flatten the can if possible",
            "Place in aluminum recycling bin"
        ],
        "tips": [
            "Clean cans thoroughly to prevent odors",
            "Remove any paper labels if possible",
            "Separate aluminum from other metals"
        ],
        "disposal": "Place in aluminum collection points or household metal waste bins"
    },
    "aluminum_soda_cans": {
        "category": "Metal",
        "instructions": [
            "Empty the can completely",
            "Rinse with water",
            "Place in aluminum recycling bin"
        ],
        "tips": [
            "Flatten cans to save space",
            "Remove any plastic rings",
            "Clean to prevent attracting pests"
        ],
        "disposal": "Place in aluminum collection points or household metal waste bins"
    },
    "steel_food_cans": {
        "category": "Metal",
        "instructions": [
            "Rinse the can to remove food residues",
            "Remove any paper labels",
            "Place in metal recycling bin"
        ],
        "tips": [
            "Clean thoroughly to prevent odors",
            "Flatten if possible to save space",
            "Remove any plastic or paper components"
        ],
        "disposal": "Place in metal recycling collection points or household metal waste bins"
    },

    # Paper items
    "cardboard_boxes": {
        "category": "Paper",
        "instructions": [
            "Flatten the box",
            "Remove any plastic tape or labels",
            "Place in paper recycling bin"
        ],
        "tips": [
            "Break down large boxes",
            "Remove any plastic or metal components",
            "Keep dry to prevent mold"
        ],
        "disposal": "Place in paper collection points or household paper waste bins"
    },
    "cardboard_packaging": {
        "category": "Paper",
        "instructions": [
            "Flatten the packaging",
            "Remove any plastic or metal components",
            "Place in paper recycling bin"
        ],
        "tips": [
            "Remove any food residues",
            "Separate different types of packaging",
            "Keep dry and clean"
        ],
        "disposal": "Place in paper collection points or household paper waste bins"
    },
    "magazines": {
        "category": "Paper",
        "instructions": [
            "Remove any plastic wrapping",
            "Remove any metal staples",
            "Place in paper recycling bin"
        ],
        "tips": [
            "Keep dry and clean",
            "Remove any plastic inserts",
            "Bundle similar items together"
        ],
        "disposal": "Place in paper collection points or household paper waste bins"
    },
    "newspaper": {
        "category": "Paper",
        "instructions": [
            "Remove any plastic wrapping",
            "Bundle newspapers together",
            "Place in paper recycling bin"
        ],
        "tips": [
            "Keep dry and clean",
            "Remove any plastic inserts",
            "Bundle in manageable sizes"
        ],
        "disposal": "Place in paper collection points or household paper waste bins"
    },
    "office_paper": {
        "category": "Paper",
        "instructions": [
            "Remove any staples or paper clips",
            "Remove any plastic components",
            "Place in paper recycling bin"
        ],
        "tips": [
            "Keep confidential documents separate",
            "Remove any plastic covers",
            "Bundle similar items together"
        ],
        "disposal": "Place in paper collection points or household paper waste bins"
    },
    "paper_cups": {
        "category": "Paper",
        "instructions": [
            "Rinse to remove any liquid",
            "Remove any plastic lids",
            "Place in paper recycling bin"
        ],
        "tips": [
            "Ensure cups are clean and dry",
            "Remove any plastic or wax coatings",
            "Separate from other paper products"
        ],
        "disposal": "Place in paper collection points or household paper waste bins"
    },

    # Glass items
    "glass_beverage_bottles": {
        "category": "Glass",
        "instructions": [
            "Rinse the bottle",
            "Remove any caps or lids",
            "Place in glass recycling bin"
        ],
        "tips": [
            "Separate by color if required",
            "Remove any labels if possible",
            "Check for any cracks or damage"
        ],
        "disposal": "Place in glass collection points or household glass waste bins"
    },
    "glass_cosmetic_containers": {
        "category": "Glass",
        "instructions": [
            "Empty and clean the container",
            "Remove any plastic components",
            "Place in glass recycling bin"
        ],
        "tips": [
            "Remove any remaining product",
            "Clean thoroughly",
            "Remove any plastic pumps or caps"
        ],
        "disposal": "Place in glass collection points or household glass waste bins"
    },
    "glass_food_jars": {
        "category": "Glass",
        "instructions": [
            "Rinse the jar",
            "Remove any lids or caps",
            "Place in glass recycling bin"
        ],
        "tips": [
            "Remove any food residues",
            "Remove any labels if possible",
            "Check for any cracks or damage"
        ],
        "disposal": "Place in glass collection points or household glass waste bins"
    },

    # Plastic items
    "disposable_plastic_cutlery": {
        "category": "Plastic",
        "instructions": [
            "Clean the cutlery",
            "Remove any food residues",
            "Place in plastic recycling bin"
        ],
        "tips": [
            "Check if the plastic is recyclable",
            "Clean thoroughly",
            "Bundle similar items together"
        ],
        "disposal": "Place in plastic collection points or household plastic waste bins"
    },
    "plastic_cup_lids": {
        "category": "Plastic",
        "instructions": [
            "Clean the lid",
            "Remove any paper components",
            "Place in plastic recycling bin"
        ],
        "tips": [
            "Check the recycling number",
            "Clean thoroughly",
            "Remove any paper or metal components"
        ],
        "disposal": "Place in plastic collection points or household plastic waste bins"
    },
    "plastic_detergent_bottles": {
        "category": "Plastic",
        "instructions": [
            "Empty and rinse the bottle",
            "Remove any caps or pumps",
            "Place in plastic recycling bin"
        ],
        "tips": [
            "Check the recycling number",
            "Remove any labels",
            "Clean thoroughly"
        ],
        "disposal": "Place in plastic collection points or household plastic waste bins"
    },
    "plastic_food_containers": {
        "category": "Plastic",
        "instructions": [
            "Clean the container",
            "Remove any food residues",
            "Place in plastic recycling bin"
        ],
        "tips": [
            "Check the recycling number",
            "Remove any labels",
            "Clean thoroughly"
        ],
        "disposal": "Place in plastic collection points or household plastic waste bins"
    },
    "plastic_shopping_bags": {
        "category": "Plastic",
        "instructions": [
            "Clean the bag",
            "Remove any paper receipts",
            "Place in plastic recycling bin"
        ],
        "tips": [
            "Check if the bag is recyclable",
            "Remove any paper or metal components",
            "Bundle similar items together"
        ],
        "disposal": "Place in plastic collection points or household plastic waste bins"
    },
    "plastic_soda_bottles": {
        "category": "Plastic",
        "instructions": [
            "Empty and rinse the bottle",
            "Remove the cap",
            "Place in plastic recycling bin"
        ],
        "tips": [
            "Check the recycling number",
            "Remove any labels",
            "Clean thoroughly"
        ],
        "disposal": "Place in plastic collection points or household plastic waste bins"
    },
    "plastic_straws": {
        "category": "Plastic",
        "instructions": [
            "Clean the straw",
            "Remove any paper wrapping",
            "Place in plastic recycling bin"
        ],
        "tips": [
            "Check if the straw is recyclable",
            "Clean thoroughly",
            "Bundle similar items together"
        ],
        "disposal": "Place in plastic collection points or household plastic waste bins"
    },
    "plastic_trash_bags": {
        "category": "Plastic",
        "instructions": [
            "Empty the bag",
            "Remove any contents",
            "Place in plastic recycling bin"
        ],
        "tips": [
            "Check if the bag is recyclable",
            "Clean thoroughly",
            "Remove any paper or metal components"
        ],
        "disposal": "Place in plastic collection points or household plastic waste bins"
    },
    "plastic_water_bottles": {
        "category": "Plastic",
        "instructions": [
            "Empty and rinse the bottle",
            "Remove the cap",
            "Place in plastic recycling bin"
        ],
        "tips": [
            "Check the recycling number",
            "Remove any labels",
            "Clean thoroughly"
        ],
        "disposal": "Place in plastic collection points or household plastic waste bins"
    },

    # Styrofoam items
    "styrofoam_cups": {
        "category": "Styrofoam",
        "instructions": [
            "Empty the cup",
            "Remove any liquid",
            "Place in styrofoam recycling bin"
        ],
        "tips": [
            "Check if the styrofoam is recyclable",
            "Remove any paper or plastic components",
            "Clean thoroughly"
        ],
        "disposal": "Place in styrofoam collection points or household styrofoam waste bins"
    },
    "styrofoam_food_containers": {
        "category": "Styrofoam",
        "instructions": [
            "Empty the container",
            "Remove any food residues",
            "Place in styrofoam recycling bin"
        ],
        "tips": [
            "Check if the styrofoam is recyclable",
            "Remove any paper or plastic components",
            "Clean thoroughly"
        ],
        "disposal": "Place in styrofoam collection points or household styrofoam waste bins"
    },

    # Organic waste
    "coffee_grounds": {
        "category": "Organic",
        "instructions": [
            "Collect the coffee grounds",
            "Remove any paper filters",
            "Place in organic waste bin"
        ],
        "tips": [
            "Let cool before disposal",
            "Remove any non-organic materials",
            "Keep dry if possible"
        ],
        "disposal": "Place in organic waste collection points or household organic waste bins"
    },
    "eggshells": {
        "category": "Organic",
        "instructions": [
            "Clean the shells",
            "Remove any egg residue",
            "Place in organic waste bin"
        ],
        "tips": [
            "Let dry before disposal",
            "Remove any non-organic materials",
            "Crush if desired"
        ],
        "disposal": "Place in organic waste collection points or household organic waste bins"
    },
    "food_waste": {
        "category": "Organic",
        "instructions": [
            "Collect the food waste",
            "Remove any packaging",
            "Place in organic waste bin"
        ],
        "tips": [
            "Remove any non-organic materials",
            "Keep dry if possible",
            "Separate different types of food waste"
        ],
        "disposal": "Place in organic waste collection points or household organic waste bins"
    },
    "tea_bags": {
        "category": "Organic",
        "instructions": [
            "Remove any staples",
            "Remove any paper tags",
            "Place in organic waste bin"
        ],
        "tips": [
            "Let cool before disposal",
            "Remove any non-organic materials",
            "Keep dry if possible"
        ],
        "disposal": "Place in organic waste collection points or household organic waste bins"
    },

    # Textile items
    "clothing": {
        "category": "Textile",
        "instructions": [
            "Clean the clothing",
            "Remove any non-textile components",
            "Place in textile recycling bin"
        ],
        "tips": [
            "Check if the clothing is in good condition",
            "Remove any buttons or zippers",
            "Bundle similar items together"
        ],
        "disposal": "Place in textile collection points or household textile waste bins"
    },
    "shoes": {
        "category": "Textile",
        "instructions": [
            "Clean the shoes",
            "Remove any non-textile components",
            "Place in textile recycling bin"
        ],
        "tips": [
            "Check if the shoes are in good condition",
            "Remove any metal or plastic components",
            "Bundle similar items together"
        ],
        "disposal": "Place in textile collection points or household textile waste bins"
    },

    # Unknown items
    "unknown": {
        "category": "Unknown",
        "instructions": [
            "Check for any recycling symbols or labels on the item",
            "Look for material type indicators (plastic, metal, paper, etc.)",
            "If unsure, check with local recycling center"
        ],
        "tips": [
            "Take a photo of any recycling symbols or labels",
            "Note the item's material and shape",
            "Check if the item can be disassembled into recyclable parts"
        ],
        "disposal": "If the item cannot be identified or recycled, please contact your local recycling center for proper disposal instructions. Many items that seem non-recyclable can be recycled through special programs."
    }
}

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        # Load and preprocess image
        image_file = request.files['image']
        image = Image.open(image_file.stream).convert("RGB")
        
        # Print image information
        print("\nInput image info:")
        print(f"Size: {image.size}")
        print(f"Mode: {image.mode}")
        
        # Convert to numpy array for debugging
        img_array = np.array(image)
        print(f"Image array shape: {img_array.shape}")
        print(f"Image array min/max: {img_array.min()}/{img_array.max()}")
        
        tensor = transform(image).unsqueeze(0)
        print(f"\nPreprocessed tensor shape: {tensor.shape}")
        print(f"Preprocessed tensor min/max: {tensor.min().item():.3f}/{tensor.max().item():.3f}")
        print(f"Preprocessed tensor mean/std: {tensor.mean().item():.3f}/{tensor.std().item():.3f}")

        # Predict
        with torch.no_grad():
            outputs = waste_model(tensor)
            print("\nRaw model outputs (logits):")
            print(outputs[0].tolist())
            
            # Clip logits to prevent extreme values
            outputs = torch.clamp(outputs, min=-20, max=20)
            
            # Add label smoothing to prevent overconfident predictions
            smoothing = 0.1
            probs = F.softmax(outputs, dim=1)
            probs = probs * (1 - smoothing) + smoothing / outputs.size(1)
            
            print("\nProbabilities after softmax and smoothing:")
            print(probs[0].tolist())
            
            # Get top 3 predictions
            values, indices = torch.topk(probs[0], k=3)
            top_predictions = [(CLASS_MAPPING[idx.item()], val.item()) for idx, val in zip(indices, values)]
            
            print("\nTop 3 predictions:")
            for pred, conf in top_predictions:
                print(f"{pred}: {conf:.4f}")

            # Get all probabilities
            all_probs = probs[0].tolist()
            class_probs = {CLASS_MAPPING[i]: float(prob) for i, prob in enumerate(all_probs)}
            
            # Print raw logits for top 3 predictions
            print("\nRaw logits for top 3 predictions:")
            for idx in indices:
                print(f"{CLASS_MAPPING[idx.item()]}: {outputs[0][idx].item():.4f}")

        return jsonify({
            "prediction": top_predictions[0][0],
            "confidence": top_predictions[0][1],
            "second_prediction": top_predictions[1][0],
            "second_confidence": top_predictions[1][1],
            "all_probabilities": class_probs
        })

    except Exception as e:
        print("Prediction error:", repr(e))
        return jsonify({"error": "Server error occurred"}), 500

@app.route('/predict-gemini', methods=['POST'])
def predict_gemini():
    print("\n=== Starting Gemini Prediction ===")
    if 'image' not in request.files:
        print("Error: No image uploaded")
        return jsonify({"error": "No image uploaded"}), 400

    try:
        # Get the image file and convert it to PIL Image
        print("Getting image from request...")
        image_file = request.files['image']
        image = Image.open(image_file.stream)
        print(f"Image loaded. Size: {image.size}, Format: {image.format}")
        
        # Prepare the prompt for Gemini
        print("\nPreparing prompt for Gemini...")
        prompt = """You are a waste classification AI. Your task is to analyze this image and classify the waste item.

        First, analyze the image carefully. Look for:
        1. Material type (plastic, paper, metal, glass, etc.)
        2. Item shape and form
        3. Any visible labels or markings
        4. Overall condition

        Then, classify the item into EXACTLY ONE of these categories:
        aerosol_cans, aluminum_food_cans, aluminum_soda_cans, cardboard_boxes, cardboard_packaging, 
        clothing, coffee_grounds, disposable_plastic_cutlery, eggshells, food_waste, glass_beverage_bottles, 
        glass_cosmetic_containers, glass_food_jars, magazines, newspaper, office_paper, paper_cups, plastic_cup_lids, 
        plastic_detergent_bottles, plastic_food_containers, plastic_shopping_bags, plastic_soda_bottles, plastic_straws, 
        plastic_trash_bags, plastic_water_bottles, shoes, steel_food_cans, styrofoam_cups, styrofoam_food_containers, 
        tea_bags, unknown.

        If the item doesn't match any of the specific categories above, respond with 'unknown'.
        Respond with ONLY the category name from the list above, nothing else."""

        # Send to Gemini API with the PIL Image
        print("\nSending request to Gemini API...")
        try:
            # Send the PIL Image to Gemini
            response = gemini_model.generate_content([prompt, image])
            print("Waiting for response resolution...")
            response.resolve()
            print("Response received and resolved successfully")
            
            # Log the raw response for debugging
            print("\nRaw Gemini Response:")
            print(f"Response text: {response.text}")
            
            # Process the response
            print("\nProcessing Gemini response...")
            prediction = response.text.strip().lower()
            print(f"Cleaned prediction: '{prediction}'")
            
            # Validate against our categories
            valid_categories = [cat.lower() for cat in CLASS_MAPPING.values()]
            print(f"\nValidating against categories: {valid_categories}")
            
            if prediction not in valid_categories:
                print(f"Invalid prediction: '{prediction}' not in valid categories")
                print("Gemini prediction failed, continuing with custom model only")
                return jsonify({
                    "error": "Gemini prediction failed",
                    "message": "Continuing with custom model only"
                }), 200  # Changed to 200 to indicate we're handling the error gracefully

            print(f"Valid prediction received: {prediction}")
            
            # Prepare the final result
            result = {
                "prediction": prediction,
                "confidence": 0.95,  # Default confidence for Gemini predictions
                "model": "gemini"
            }
            print(f"\nReturning result: {result}")
            return jsonify(result)

        except Exception as e:
            print("\nError during Gemini API call:")
            print(f"Error type: {type(e)}")
            print(f"Error message: {str(e)}")
            print("Gemini prediction failed, continuing with custom model only")
            return jsonify({
                "error": "Gemini prediction failed",
                "message": "Continuing with custom model only"
            }), 200  # Changed to 200 to indicate we're handling the error gracefully

    except Exception as e:
        print("\nGemini prediction error:")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        print(f"Full error details: {repr(e)}")
        print("Gemini prediction failed, continuing with custom model only")
        return jsonify({
            "error": "Gemini prediction failed",
            "message": "Continuing with custom model only"
        }), 200  # Changed to 200 to indicate we're handling the error gracefully

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)