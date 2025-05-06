import {
  CameraType,
  CameraView,
  useCameraPermissions,
  Camera,
} from "expo-camera";
import * as Location from 'expo-location';
import * as ImageManipulator from 'expo-image-manipulator'; // ✅ Added
import { useEffect, useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View, Dimensions, Alert, ActivityIndicator, ScrollView } from "react-native";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recordScanEvent } from "../../services/scanEvents";
import { getRecyclingInstructions } from "../../services/recyclingInstructions";
import { useRouter } from 'expo-router';

interface Prediction {
  prediction: string;
  confidence: number;
}

const CLASS_MAPPING: Record<string, string> = {
  '0': 'aerosol_cans',
  '1': 'aluminum_food_cans',
  '2': 'aluminum_soda_cans',
  '3': 'cardboard_boxes',
  '4': 'cardboard_packaging',
  '5': 'clothing',
  '6': 'coffee_grounds',
  '7': 'disposable_plastic_cutlery',
  '8': 'eggshells',
  '9': 'food_waste',
  '10': 'glass_beverage_bottles',
  '11': 'glass_cosmetic_containers',
  '12': 'glass_food_jars',
  '13': 'magazines',
  '14': 'newspaper',
  '15': 'office_paper',
  '16': 'paper_cups',
  '17': 'plastic_cup_lids',
  '18': 'plastic_detergent_bottles',
  '19': 'plastic_food_containers',
  '20': 'plastic_shopping_bags',
  '21': 'plastic_soda_bottles',
  '22': 'plastic_straws',
  '23': 'plastic_trash_bags',
  '24': 'plastic_water_bottles',
  '25': 'shoes',
  '26': 'steel_food_cans',
  '27': 'styrofoam_cups',
  '28': 'styrofoam_food_containers',
  '29': 'tea_bags'
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [uri, setUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const ref = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const cameraStatus = await requestPermission();
      console.log("Camera permission status:", cameraStatus);

      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      console.log("Location permission status:", status);

      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission is required for this app to work properly.", [{ text: "OK" }]);
      }
    })();
  }, []);

  const takePicture = async () => {
    try {
      if (!ref.current) return;

      const photo = await ref.current.takePictureAsync({ quality: 1, exif: true });
      console.log("Picture taken:", photo);

      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 256, height: 256 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log("Resized image URI:", resized.uri);
      setUri(resized.uri);

      try {
        await recordScanEvent();
        console.log("Scan event recorded successfully");
      } catch (error) {
        console.error("Error recording scan event:", error);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };

  const handleCheck = async () => {
    if (!uri) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: uri,
        name: filename,
        type: type
      } as any);

      // First try the custom model
      const customResponse = await fetch('http://10.18.18.193:5001/predict', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!customResponse.ok) {
        throw new Error('Custom model prediction failed');
      }

      const customData = await customResponse.json();

      // Then try Gemini
      let geminiData;
      try {
        const geminiResponse = await fetch('http://10.18.18.193:5001/predict-gemini', {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (!geminiResponse.ok) {
          console.warn('Gemini prediction failed, continuing with custom model only');
          geminiData = {
            prediction: customData.prediction,
            confidence: customData.confidence,
            explanation: 'Gemini model is currently unavailable'
          };
        } else {
          geminiData = await geminiResponse.json();
        }
      } catch (geminiError) {
        console.warn('Gemini error:', geminiError);
        geminiData = {
          prediction: customData.prediction,
          confidence: customData.confidence,
          explanation: 'Gemini model is currently unavailable'
        };
      }

      // Navigate to model selection page
      router.push({
        pathname: '/model-selection',
        params: {
          imageUri: uri,
          customPrediction: JSON.stringify({
            prediction: customData.prediction,
            confidence: customData.confidence || 1
          }),
          geminiPrediction: JSON.stringify({
            prediction: geminiData.prediction,
            confidence: geminiData.confidence || 1,
            explanation: geminiData.explanation
          })
        }
      });

    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert(
        "Prediction Error",
        "Failed to get predictions. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const renderInstructions = () => {
    if (!prediction) return null;

    const classId = Object.entries(CLASS_MAPPING).find(([_, value]) => value === prediction.prediction)?.[0];
    const instructions = classId ? getRecyclingInstructions(parseInt(classId)) : null;

    if (!instructions) {
      return (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Unknown Material</Text>
          <Text style={styles.instructionText}>We couldn't determine the recycling instructions for this item.</Text>
          <Pressable onPress={() => {
            setShowInstructions(false); setPrediction(null); setUri(null);
          }} style={({ pressed }) => [
            styles.closeButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.instructionsContainer}>
        <ScrollView style={styles.instructionsScroll}>
          <Text style={styles.instructionsTitle}>{instructions.category} Recycling Instructions</Text>
          <Text style={styles.confidenceText}>
            Confidence: {Math.round(prediction.confidence * 100)}%
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Steps:</Text>
            {instructions.instructions.map((instruction, index) => (
              <Text key={index} style={styles.instructionText}>• {instruction}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips:</Text>
            {instructions.tips.map((tip, index) => (
              <Text key={index} style={styles.instructionText}>• {tip}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disposal:</Text>
            <Text style={styles.instructionText}>{instructions.disposal}</Text>
          </View>
        </ScrollView>

        <Pressable onPress={() => {
          setShowInstructions(false); setPrediction(null); setUri(null);
        }} style={({ pressed }) => [
          styles.closeButton,
          { opacity: pressed ? 0.7 : 1 }
        ]}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
    );
  };

  const renderPicture = () => {
    if (!uri) return null;
    if (showInstructions) return renderInstructions();

    return (
      <View style={styles.previewContainer}>
        <View style={styles.topSpacer} />
        <View style={styles.imageContainer}>
          <Image source={uri} contentFit="contain" style={styles.previewImage} />
        </View>
        <View style={styles.middleSpacer} />
        <View style={styles.photoActionContainer}>
          <Pressable onPress={() => setUri(null)} style={styles.actionButton}>
            <View style={styles.greenCircle}>
              <AntDesign name="close" size={24} color="white" />
            </View>
          </Pressable>
          <Pressable onPress={handleCheck} disabled={isProcessing} style={styles.actionButton}>
            <View style={styles.greenCircle}>
              {isProcessing ? <ActivityIndicator color="white" /> :
                <AntDesign name="check" size={24} color="white" />}
            </View>
          </Pressable>
        </View>
        <View style={styles.bottomSpacer} />
      </View>
    );
  };

  const renderCamera = () => (
    <CameraView style={styles.camera} ref={ref} facing={facing}>
      <View style={styles.shutterContainer}>
        <View style={styles.cameraControlButton} />
        <Pressable onPress={takePicture}>
          {({ pressed }) => (
            <View style={[styles.shutterBtn, { opacity: pressed ? 0.5 : 1 }]}>
              <View style={styles.shutterBtnInner} />
            </View>
          )}
        </Pressable>
        <Pressable onPress={toggleFacing} style={styles.cameraControlButton}>
          <FontAwesome6 name="rotate-left" size={28} color="white" />
        </Pressable>
      </View>
    </CameraView>
  );

  if (!permission || !locationPermission) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant camera permission" />
      </View>
    );
  }

  if (locationPermission !== 'granted') {
    return (
      <View style={styles.container}>
        <Text>We need your permission to access your location</Text>
        <Button onPress={async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status);
        }} title="Grant location permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const windowHeight = Dimensions.get('window').height;

// (Keep your styles here as-is)
  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    camera: { flex: 1, width: "100%" },
    shutterContainer: {
      position: "absolute", bottom: 40, width: "100%", paddingHorizontal: 24,
      flexDirection: "row", justifyContent: "space-between", alignItems: "center"
    },
    cameraControlButton: {
      width: 60, height: 60, borderRadius: 30, backgroundColor: 'transparent',
      justifyContent: 'center', alignItems: 'center'
    },
    shutterBtn: {
      height: 80, width: 80, borderRadius: 40, borderWidth: 4,
      borderColor: "white", justifyContent: "center", alignItems: "center"
    },
    shutterBtnInner: { height: 64, width: 64, borderRadius: 32, backgroundColor: "white" },
    previewContainer: { flex: 1, width: "100%", justifyContent: "center", alignItems: "center" },
    topSpacer: { flex: 0.2 }, imageContainer: { justifyContent: "center", alignItems: "center", flex: 0.4 },
    previewImage: { width: 300, height: 300, aspectRatio: 1 },
    middleSpacer: { flex: 0.05 }, bottomSpacer: { flex: 0.15 },
    photoActionContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '70%', alignItems: 'center', flex: 0.2 },
    actionButton: { justifyContent: 'center', alignItems: 'center', margin: 20 },
    greenCircle: {
      width: 70, height: 70, borderRadius: 35, backgroundColor: '#4CAF50',
      justifyContent: 'center', alignItems: 'center', elevation: 3,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25, shadowRadius: 3.84,
    },
    instructionsContainer: { flex: 1, width: "100%", backgroundColor: "white", padding: 20 },
    instructionsScroll: { flex: 1 },
    instructionsTitle: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 10 },
    confidenceText: { fontSize: 16, color: "#666", marginBottom: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 10 },
    instructionText: { fontSize: 16, color: "#444", marginBottom: 8, lineHeight: 22 },
    closeButton: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
    closeButtonText: { color: "white", fontSize: 16, fontWeight: "600" }
  });