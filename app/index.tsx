import { Text, View, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { icons } from "@/constants/icons";
import Calendar from '../components/Calendar';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const getResponsiveSize = (baseSize: number) => {
    return Math.round((baseSize * height) / 812); // 812 is iPhone X height
};

export default function Index() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white">
            {/* Top Navigation Bar */}
            <View 
                style={{
                    height: getResponsiveSize(60),
                    backgroundColor: 'white',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: getResponsiveSize(15),
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5E5',
                }}
            >
                <Text 
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: getResponsiveSize(18),
                        fontWeight: '600',
                        color: '#1A1A1A',
                    }}
                >
                    Home
                </Text>
            </View>

            {/* Main Content */}
            <ScrollView className="flex-1">
                <View style={{ padding: getResponsiveSize(20) }}>
                    <Text style={{
                        fontSize: getResponsiveSize(24),
                        fontWeight: 'bold',
                        color: '#1A1A1A',
                        marginBottom: getResponsiveSize(16),
                    }}>
                        Your Recycling Progress
                    </Text>
                    <Calendar />
                </View>
            </ScrollView>

            {/* Navigation Bar */}
            <View 
                style={{
                    height: getResponsiveSize(85),
                    paddingTop: getResponsiveSize(5),
                    paddingBottom: getResponsiveSize(10),
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5E5',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: getResponsiveSize(20),
                }}
            >
                {/* Map Tab */}
                <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/map')}
                    style={{ 
                        alignItems: 'center',
                        height: getResponsiveSize(50),
                        justifyContent: 'center',
                        width: getResponsiveSize(80),
                    }}
                >
                    <Image
                        source={icons.map}
                        style={{
                            width: getResponsiveSize(30),
                            height: getResponsiveSize(30),
                            tintColor: "#82C46B",
                        }}
                    />
                    <Text style={{ 
                        color: "#82C46B",
                        fontSize: getResponsiveSize(16),
                        marginTop: getResponsiveSize(4),
                        textAlign: 'center',
                    }}>
                        Map
                    </Text>
                </TouchableOpacity>

                {/* Recycling Tab */}
                <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/scan')}
                    style={{ 
                        alignItems: 'center',
                        height: getResponsiveSize(50),
                        justifyContent: 'center',
                        width: getResponsiveSize(80),
                    }}
                >
                    <View
                        style={{
                            width: getResponsiveSize(60),
                            height: getResponsiveSize(60),
                            borderRadius: getResponsiveSize(30),
                            backgroundColor: "#82C46B",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Image
                            source={icons.recycling}
                            style={{
                                width: getResponsiveSize(42),
                                height: getResponsiveSize(42),
                                tintColor: "white",
                            }}
                        />
                    </View>
                </TouchableOpacity>

                {/* Account Tab */}
                <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/account')}
                    style={{ 
                        alignItems: 'center',
                        height: getResponsiveSize(50),
                        justifyContent: 'center',
                        width: getResponsiveSize(80),
                    }}
                >
                    <Image
                        source={icons.account}
                        style={{
                            width: getResponsiveSize(30),
                            height: getResponsiveSize(30),
                            tintColor: "#82C46B",
                        }}
                    />
                    <Text style={{ 
                        color: "#82C46B",
                        fontSize: getResponsiveSize(16),
                        marginTop: getResponsiveSize(4),
                        textAlign: 'center',
                    }}>
                        Account
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
} 