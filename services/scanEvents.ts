import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScanEvent {
    id: string;
    timestamp: Date;
}

const STORAGE_KEY = '@RecyVision:scanEvents';

export const recordScanEvent = async (): Promise<void> => {
    try {
        const events = await getScanEvents();
        const newEvent: ScanEvent = {
            id: Date.now().toString(),
            timestamp: new Date()
        };
        events.push(newEvent);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
        console.error('Error recording scan event:', error);
        throw error;
    }
};

export const getScanEvents = async (): Promise<ScanEvent[]> => {
    try {
        const eventsJson = await AsyncStorage.getItem(STORAGE_KEY);
        if (!eventsJson) return [];
        
        const events = JSON.parse(eventsJson);
        return events.map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp)
        }));
    } catch (error) {
        console.error('Error getting scan events:', error);
        return [];
    }
}; 