import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Base width for design (iPhone 12/13)
const BASE_WIDTH = 390;

export const getResponsiveSize = (size: number): number => {
    return Math.round((size * SCREEN_WIDTH) / BASE_WIDTH);
}; 