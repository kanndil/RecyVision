import axios from 'axios';

const API_URL = 'http://10.18.18.193:8000';

export interface PredictionResponse {
    prediction: string;
    confidence: number;
    details: {
        material: string;
        category: string;
    };
}

export const api = {
    async predictImage(imageUri: string): Promise<PredictionResponse> {
        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'photo.jpg',
        } as any);

        try {
            const response = await axios.post(`${API_URL}/predict`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error making prediction:', error);
            throw error;
        }
    },
}; 