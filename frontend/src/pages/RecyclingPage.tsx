import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, FormControl, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';
import { useRouter } from 'expo-router';
import { useCamera } from '../contexts/CameraContext';
import { useRecycling } from '../contexts/RecyclingContext';

const RecyclingPage: React.FC = () => {
  const router = useRouter();
  const { capturedImage, setCapturedImage } = useCamera();
  const { addRecyclingItem } = useRecycling();
  const [selectedModel, setSelectedModel] = useState<'custom' | 'gemini'>('custom');
  const [prediction, setPrediction] = useState<{
    prediction: string;
    confidence: number;
    explanation?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedModel(event.target.value as 'custom' | 'gemini');
  };

  const handlePredict = async () => {
    if (!capturedImage) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', capturedImage);

      const endpoint = selectedModel === 'custom' ? '/predict' : '/predict-gemini';
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (prediction) {
      addRecyclingItem({
        type: prediction.prediction,
        confidence: prediction.confidence,
        timestamp: new Date().toISOString(),
        model: selectedModel,
      });
      
      // Clear the captured image
      setCapturedImage(null);
      
      // Navigate to dashboard
      router.replace('/');
    }
  };

  const handleCancel = () => {
    setCapturedImage(null);
    router.replace('/(tabs)/scan');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Recycling Classification
      </Typography>

      {capturedImage && (
        <Box sx={{ mb: 3 }}>
          <img
            src={URL.createObjectURL(capturedImage)}
            alt="Captured"
            style={{ width: '100%', borderRadius: 8 }}
          />
        </Box>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl component="fieldset">
            <Typography variant="h6" gutterBottom>
              Select Model
            </Typography>
            <RadioGroup value={selectedModel} onChange={handleModelChange}>
              <FormControlLabel
                value="custom"
                control={<Radio />}
                label="Custom Model"
              />
              <FormControlLabel
                value="gemini"
                control={<Radio />}
                label="Google Gemini"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handlePredict}
        disabled={loading || !capturedImage}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Get Prediction'}
      </Button>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {prediction && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Prediction Results
            </Typography>
            <Typography>
              Category: {prediction.prediction}
            </Typography>
            <Typography>
              Confidence: {(prediction.confidence * 100).toFixed(1)}%
            </Typography>
            {prediction.explanation && (
              <Typography sx={{ mt: 1 }}>
                Explanation: {prediction.explanation}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          fullWidth
          onClick={handleConfirm}
          disabled={!prediction}
        >
          Confirm and Add to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default RecyclingPage; 