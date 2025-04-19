import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
    title: string;
    showBackButton?: boolean;
}

export default function Header({ title, showBackButton = true }: HeaderProps) {
    const router = useRouter();

    return (
        <View className="flex-row items-center justify-between px-6 py-6 bg-white border-b border-gray-200">
            <View className="flex-row items-center">
                {showBackButton && (
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="mr-4"
                    >
                        <Ionicons name="arrow-back" size={28} color="#82C46B" />
                    </TouchableOpacity>
                )}
                <Text className="text-2xl font-bold text-dark-100">{title}</Text>
            </View>
        </View>
    );
} 