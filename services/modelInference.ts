import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';

// Load the model
let model: tf.LayersModel | null = null;

export const loadModel = async () => {
    try {
        // Load the model from the converted TensorFlow.js files
        const modelJson = require('../backend/models/tfjs_model/model.json');
        const modelWeights = require('../backend/models/tfjs_model/weights.bin');
        model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Error loading model:', error);
        throw error;
    }
};

export const predictImage = async (imageUri: string) => {
    if (!model) {
        throw new Error('Model not loaded');
    }

    try {
        // Read the image file
        const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
        const raw = new Uint8Array(imgBuffer);
        let imgTensor = decodeJpeg(raw);

        // Preprocess the image
        imgTensor = tf.image.resizeBilinear(imgTensor, [224, 224]);
        imgTensor = imgTensor.expandDims(0);
        imgTensor = imgTensor.div(255.0);

        // Make prediction
        const prediction = await model.predict(imgTensor) as tf.Tensor;
        const scores = await prediction.data();
        
        // Get the class with highest probability
        const maxScore = Math.max(...scores);
        const predictedClass = scores.indexOf(maxScore);

        // Map class index to category (you'll need to adjust these based on your model's classes)
        const categories = ['plastic', 'paper', 'glass', 'metal', 'cardboard', 'non_recyclable'];
        const category = categories[predictedClass];

        return {
            prediction: category,
            confidence: maxScore,
            details: {
                material: category,
                category: category
            }
        };
    } catch (error) {
        console.error('Error making prediction:', error);
        throw error;
    }
}; 