import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ModelPrediction {
  prediction: string;
  confidence: number;
  explanation?: string;
}

type ModelType = 'custom' | 'gemini';

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

export default function ModelSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    imageUri: string;
    customPrediction: string;
    geminiPrediction: string;
  }>();

  const customPrediction: ModelPrediction = JSON.parse(params.customPrediction);
  const geminiPrediction: ModelPrediction = JSON.parse(params.geminiPrediction);

  const handleModelSelect = (prediction: ModelPrediction, model: ModelType) => {
    router.push({
      pathname: '/recycling-tips',
      params: {
        prediction: JSON.stringify(prediction),
        model: model,
        imageUri: params.imageUri
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#82C46B" />
        </Pressable>
        <Text style={styles.title}>Choose Model</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: params.imageUri }} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.modelsContainer}>
        <Text style={styles.modelsTitle}>Select a Model</Text>
        <View style={styles.predictionsContainer}>
          <Pressable 
            style={({ pressed }) => [
              styles.predictionCard,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => handleModelSelect(customPrediction, 'custom')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#82C46B" />
              <Text style={styles.modelTitle}>Custom Model</Text>
            </View>
            <Text style={styles.predictionText}>
              {customPrediction.prediction}
            </Text>
            <Text style={styles.confidenceText}>
              Confidence: {(customPrediction.confidence * 100).toFixed(1)}%
            </Text>
          </Pressable>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.predictionCard,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => handleModelSelect(geminiPrediction, 'gemini')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="logo-google" size={24} color="#82C46B" />
              <Text style={styles.modelTitle}>Google Gemini</Text>
            </View>
            <Text style={styles.predictionText}>
              {geminiPrediction.prediction}
            </Text>
            <Text style={styles.confidenceText}>
              Confidence: {(geminiPrediction.confidence * 100).toFixed(1)}%
            </Text>
            {geminiPrediction.explanation && (
              <Text style={styles.explanationText}>
                {geminiPrediction.explanation}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  imageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 20,
    backgroundColor: '#F5F5F5',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modelsContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modelsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  predictionsContainer: {
    padding: 16,
    gap: 16,
  },
  predictionCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  modelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#82C46B',
  },
  predictionText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#666666',
  },
  explanationText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 10,
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
}); 