import React from 'react';
import { Tabs } from "expo-router";
import { ImageBackground, Image, Text, View } from 'react-native';

import { icons } from "@/constants/icons";

function TabIcon({ focused, icon, title }: any) {
    const tintColor = focused ? "#82C46B" : "#B4B4B4";
    const iconSize = 30; // Increase size
    const translateY = -5; // Adjust positioning if necessary

    return (
        <View className="justify-center items-center mt-4 rounded-full">
            <Image
                source={icon}
                style={{
                    tintColor,
                    width: iconSize,
                    height: iconSize,
                    transform: [{ translateY }],
                }}
            />
        </View>
    );
}

function TabText({ focused, title }: { focused: boolean; title: string }) {
    const textColor = focused ? "#82C46B" : "#B4B4B4";
    const fontSize = 16; // Increase the font size

    return (
        <Text style={{ color: textColor, fontSize }}>
            {title}
        </Text>
    );
}




const _Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    height: 85, // Increase height
                    paddingTop: 5, // Adjust padding if needed
                    paddingBottom: 10, // Add more spacing at the bottom
                }
            }}
            >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.home} title="Home" />
                    ),
                    tabBarLabel: ({ focused }) => (
                        <TabText focused={focused} title="Home" /> // Use TabText here
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Map',
                    headerShown: false,

                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.map} title="Map" />
                    ),
                    tabBarLabel: ({ focused }) => (
                        <TabText focused={focused} title="Map" /> // Use TabText here
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Recycling',
                    headerShown: false,
                    tabBarIcon: () => {
                        const size = 60; // Adjust this size as needed (diameter of the circle)
                        const iconSize = size * 0.7; // Icon size proportional to the circle (e.g., 50% of the circle)

                        return (
                            <View
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    transform: [{ translateY: 10 }], // Adjust Y-coordinate if needed
                                }}
                            >
                                {/* Always Visible Green Circle */}
                                <View
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: size, // Circle width
                                        height: size, // Circle height
                                        borderRadius: size / 2, // Half of the size for a perfect circle
                                        backgroundColor: "#82C46B", // Green background
                                    }}
                                >
                                    {/* Icon (White Color) */}
                                    <Image
                                        source={icons.recycling}
                                        style={{
                                            width: iconSize, // Icon width based on size
                                            height: iconSize, // Icon height based on size
                                            tintColor: "white", // Icon is always white
                                        }}
                                    />
                                </View>
                            </View>
                        );
                    },
                    tabBarLabel: ({ focused }) => (
                        <TabText focused={focused} title="" />
                    ),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: 'Calendar',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.calendar} title="Calendar" />
                    ),
                    tabBarLabel: ({ focused }) => (
                        <TabText focused={focused} title="Calendar" /> // Use TabText here
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Account',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.account} title="Account" />
                    ),
                    tabBarLabel: ({ focused }) => (
                        <TabText focused={focused} title="Account" /> // Use TabText here
                    ),
                }}
            />
        </Tabs>
    )
}

export default _Layout;
