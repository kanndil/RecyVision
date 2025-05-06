interface RecyclingInstruction {
    category: string;
    instructions: string[];
    tips: string[];
    disposal: string;
  }
  
  const classIdToCategory: Record<number, string> = {
    0: "battery",
    1: "biological",
    2: "blister_pack",
    3: "can",
    4: "carton",
    5: "chip_bag",
    6: "clear_plastic_bottle",
    7: "condiment_container",
    8: "cup",
    9: "drink_can",
    10: "food_waste",
    11: "glass",
    12: "glass_bottle",
    13: "hard_plastic",
    14: "lid",
    15: "magazine_paper",
    16: "metal",
    17: "other_plastic",
    18: "paper",
    19: "paper_bag",
    20: "paper_cup",
    21: "plastic_bag",
    22: "plastic_container",
    23: "plastic_cup",
    24: "plastic_utensils",
    25: "straw",
    26: "styrofoam",
    27: "aluminium_foil",
    28: "blister_pack",
    29: "cardboard"
  };
  
  const recyclingInstructions: Record<string, RecyclingInstruction> = {
    battery: {
      category: "Battery",
      instructions: [
        "Do not throw in regular trash",
        "Place in a sealed plastic bag",
        "Label clearly if rechargeable or lithium"
      ],
      tips: [
        "Use collection boxes at electronics or grocery stores",
        "Avoid puncturing batteries",
        "Store in a cool, dry place until disposal"
      ],
      disposal: "Take to designated battery recycling bins or electronic waste collection points"
    },
    biological: {
      category: "Biological Waste",
      instructions: [
        "Wrap securely to avoid leakage",
        "Label if medical waste",
        "Do not place in recycling bins"
      ],
      tips: [
        "Use compost bins for food-related biological waste",
        "Dispose of medical waste at health centers"
      ],
      disposal: "Place in general waste or bio-waste bins if available"
    },
    blister_pack: {
      category: "Blister Pack",
      instructions: [
        "Separate plastic from foil if possible",
        "Clean before disposal"
      ],
      tips: [
        "May not be recyclable curbside",
        "Take to special collection if available"
      ],
      disposal: "Dispose in general waste unless specialty recycling exists"
    },
    can: {
      category: "Can",
      instructions: [
        "Rinse thoroughly",
        "Crush if possible to save space"
      ],
      tips: [
        "Cans are usually aluminum or steel — both recyclable",
        "Check for deposit refunds"
      ],
      disposal: "Place in metal recycling bins"
    },
    carton: {
      category: "Carton",
      instructions: [
        "Rinse and flatten",
        "Remove plastic caps"
      ],
      tips: [
        "Check local rules — not all cartons are recyclable",
        "Can be part of beverage container recycling"
      ],
      disposal: "Place in designated carton recycling if available"
    },
    chip_bag: {
      category: "Chip Bag",
      instructions: [
        "Empty all crumbs",
        "Do not tear"
      ],
      tips: [
        "Usually made of mixed materials — often non-recyclable",
        "Can be used in eco-brick projects"
      ],
      disposal: "Dispose in general waste bin"
    },
    clear_plastic_bottle: {
      category: "Clear Plastic Bottle",
      instructions: [
        "Empty and rinse",
        "Remove labels and caps"
      ],
      tips: [
        "PET bottles are widely accepted",
        "Check for recycling logos"
      ],
      disposal: "Place in plastic recycling bin"
    },
    condiment_container: {
      category: "Condiment Container",
      instructions: [
        "Rinse well to remove residue",
        "Check for recycling symbol"
      ],
      tips: [
        "May be recyclable depending on plastic type",
        "Avoid oily containers if not cleanable"
      ],
      disposal: "Recycle if accepted locally, otherwise dispose as general waste"
    },
    cup: {
      category: "Cup",
      instructions: [
        "Rinse before disposal",
        "Separate lid if different material"
      ],
      tips: [
        "Paper cups often have plastic lining — check local rules",
        "Plastic cups are more widely accepted"
      ],
      disposal: "Recycle if compatible, or dispose in general waste"
    },
    drink_can: {
      category: "Drink Can",
      instructions: ["Rinse and crush"],
      tips: ["Often part of deposit refund programs"],
      disposal: "Place in aluminum recycling bin"
    },
    food_waste: {
      category: "Food Waste",
      instructions: ["Remove packaging", "Drain liquids"],
      tips: ["Compost if possible", "Avoid mixing with recyclables"],
      disposal: "Place in organic waste bin or compost"
    },
    glass: {
      category: "Glass",
      instructions: ["Rinse and sort by color"],
      tips: ["No ceramics or mirrors"],
      disposal: "Place in color-coded glass recycling bins"
    },
    glass_bottle: {
      category: "Glass Bottle",
      instructions: ["Remove lid", "Rinse"],
      tips: ["Refundable in some regions"],
      disposal: "Recycle in glass bin by color"
    },
    hard_plastic: {
      category: "Hard Plastic",
      instructions: ["Rinse and dry", "Remove labels"],
      tips: ["Check for type (HDPE, LDPE, etc.)"],
      disposal: "Recycle if accepted"
    },
    lid: {
      category: "Lid",
      instructions: ["Separate from container", "Sort by material"],
      tips: ["Small lids can get lost in recycling — collect in a larger container"],
      disposal: "Recycle with appropriate material or general waste"
    },
    magazine_paper: {
      category: "Magazine Paper",
      instructions: ["Bundle together", "Keep dry"],
      tips: ["Remove plastic covers"],
      disposal: "Place in paper recycling bin"
    },
    metal: {
      category: "Metal",
      instructions: ["Clean and dry", "Separate types if possible"],
      tips: ["Aluminum is widely recycled"],
      disposal: "Take to metal recycling"
    },
    other_plastic: {
      category: "Other Plastic",
      instructions: ["Check for recycling code", "Clean thoroughly"],
      tips: ["Mixed plastics may not be accepted"],
      disposal: "Recycle if accepted, otherwise general waste"
    },
    paper: {
      category: "Paper",
      instructions: ["Remove staples", "Keep clean and dry"],
      tips: ["Bundle or place in bags"],
      disposal: "Paper recycling bin"
    },
    paper_bag: {
      category: "Paper Bag",
      instructions: ["Remove food residue", "Flatten"],
      tips: ["Compost if food-stained"],
      disposal: "Recycle or compost"
    },
    paper_cup: {
      category: "Paper Cup",
      instructions: ["Check for lining", "Rinse"],
      tips: ["May not be recyclable everywhere"],
      disposal: "Recycle or general waste"
    },
    plastic_bag: {
      category: "Plastic Bag",
      instructions: ["Empty and flatten"],
      tips: ["Often recyclable at grocery stores"],
      disposal: "Special collection or general waste"
    },
    plastic_container: {
      category: "Plastic Container",
      instructions: ["Rinse and dry", "Remove labels"],
      tips: ["Check for recycling code"],
      disposal: "Recycle if accepted"
    },
    plastic_cup: {
      category: "Plastic Cup",
      instructions: ["Clean before recycling"],
      tips: ["Not always accepted"],
      disposal: "Recycle or general waste"
    },
    plastic_utensils: {
      category: "Plastic Utensils",
      instructions: ["Clean thoroughly"],
      tips: ["Often non-recyclable"],
      disposal: "Dispose in general waste"
    },
    straw: {
      category: "Straw",
      instructions: ["Dispose directly"],
      tips: ["Not recyclable"],
      disposal: "General waste bin"
    },
    styrofoam: {
      category: "Styrofoam",
      instructions: ["Break into smaller pieces"],
      tips: ["Usually non-recyclable"],
      disposal: "Dispose in general waste"
    },
    aluminium_foil: {
      category: "Aluminium Foil",
      instructions: ["Clean off food residue", "Ball it up"],
      tips: ["Small pieces should be balled together"],
      disposal: "Recycle if clean"
    },
    cardboard: {
      category: "Cardboard",
      instructions: ["Flatten and keep dry", "Remove tape"],
      tips: ["Tie in bundles"],
      disposal: "Cardboard recycling bin"
    }
  };
  
  export const getRecyclingInstructions = (classId: number): RecyclingInstruction => {
    const category = classIdToCategory[classId] || "non_recyclable";
    return recyclingInstructions[category] || recyclingInstructions["non_recyclable"];
  };
  