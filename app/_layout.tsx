import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="model-selection"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="recycling-tips"
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
