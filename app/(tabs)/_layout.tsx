import React from 'react';
import { Tabs } from "expo-router";
import { Image, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { icons } from "@/constants/icons";

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const getResponsiveSize = (baseSize: number) => {
    return Math.round((baseSize * height) / 812);
};

function TabIcon({ focused, icon, title }: any) {
    const tintColor = focused ? "#82C46B" : "#B4B4B4";
    const iconSize = getResponsiveSize(30);

    return (
        <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: getResponsiveSize(50),
        }}>
            <Image
                source={icon}
                style={{
                    tintColor,
                    width: iconSize,
                    height: iconSize,
                }}
            />
        </View>
    );
}

function TabText({ focused, title }: { focused: boolean; title: string }) {
    const textColor = focused ? "#82C46B" : "#B4B4B4";
    const fontSize = getResponsiveSize(16);

    return (
        <Text style={{ 
            color: textColor, 
            fontSize,
            textAlign: 'center',
            marginTop: getResponsiveSize(4)
        }}>
            {title}
        </Text>
    );
}

const _Layout = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    tabBarStyle: {
                        height: getResponsiveSize(85),
                        paddingTop: getResponsiveSize(5),
                        paddingBottom: getResponsiveSize(10),
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#E5E5E5',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                    },
                    headerStyle: {
                        backgroundColor: 'white',
                        height: getResponsiveSize(60) + insets.top,
                        paddingTop: insets.top,
                        borderBottomWidth: 1,
                        borderBottomColor: '#E5E5E5',
                    },
                    headerTitleStyle: {
                        color: '#1A1A1A',
                        fontSize: getResponsiveSize(18),
                        fontWeight: '600',
                        textAlign: 'center',
                    },
                    headerTitleAlign: 'center',
                    headerLeft: () => (
                        <TouchableOpacity 
                            onPress={() => router.push('/')}
                            style={{ 
                                marginLeft: getResponsiveSize(15),
                                width: getResponsiveSize(24),
                                height: getResponsiveSize(24),
                            }}
                        >
                            <Image
                                source={icons.home}
                                style={{
                                    width: getResponsiveSize(24),
                                    height: getResponsiveSize(24),
                                    tintColor: "#82C46B"
                                }}
                            />
                        </TouchableOpacity>
                    ),
                }}
            >
                <Tabs.Screen
                    name="map"
                    options={{
                        title: 'Map',
                        headerShown: true,
                        tabBarButton: () => (
                            <TouchableOpacity 
                                onPress={() => router.push('/(tabs)/map')}
                                style={{ 
                                    alignItems: 'center',
                                    height: getResponsiveSize(50),
                                    justifyContent: 'center',
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
                        ),
                    }}
                />
                <Tabs.Screen
                    name="scan"
                    options={{
                        title: 'Recycling',
                        headerShown: true,
                        tabBarButton: () => (
                            <TouchableOpacity 
                                onPress={() => router.push('/(tabs)/scan')}
                                style={{ 
                                    alignItems: 'center',
                                    height: getResponsiveSize(50),
                                    justifyContent: 'center',
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
                        ),
                    }}
                />
                <Tabs.Screen
                    name="account"
                    options={{
                        title: 'Account',
                        headerShown: true,
                        tabBarButton: () => (
                            <TouchableOpacity 
                                onPress={() => router.push('/(tabs)/account')}
                                style={{ 
                                    alignItems: 'center',
                                    height: getResponsiveSize(50),
                                    justifyContent: 'center',
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
                        ),
                    }}
                />
            </Tabs>
        </View>
    )
}

export default _Layout;
