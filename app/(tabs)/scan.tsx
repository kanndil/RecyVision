import {
    CameraType,
    CameraView,
    FlashMode,
    useCameraPermissions,
} from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null>(null);
    const [facing, setFacing] = useState<CameraType>("back");
    const [flash, setFlash] = useState<FlashMode>("off");
    const [hasFlash, setHasFlash] = useState(false);

    // Request permissions on component mount
    useEffect(() => {
        (async () => {
            const cameraStatus = await requestPermission();
            console.log("Camera permission status:", cameraStatus);

            // Check if device has flash capability
            if (ref.current) {
                try {
                    // This is a simplified check - ideally you would check device capabilities
                    // For now, we'll just assume back camera has flash
                    setHasFlash(facing === "back");
                } catch (e) {
                    console.error("Error checking flash availability:", e);
                    setHasFlash(false);
                }
            }
        })();
    }, []);

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text>Requesting permissions...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: "center" }}>
                    We need your permission to use the camera
                </Text>
                <Button onPress={requestPermission} title="Grant permission" />
            </View>
        );
    }

    const takePicture = async () => {
        try {
            if (!ref.current) {
                console.error("Camera ref is not available");
                return;
            }

            console.log("Taking picture with flash mode:", flash);

            // Set specific takePictureAsync options for flash
            const options = {
                quality: 1,
                exif: true,
                flash: flash
            };

            const photo = await ref.current.takePictureAsync(options);
            console.log("Picture taken:", photo);
            setUri((photo as any)?.uri);
        } catch (error) {
            console.error("Error taking picture:", error);
        }
    };

    const toggleFlash = () => {
        // Keep it simple for debugging - just toggle between off and on
        setFlash(prev => prev === "off" ? "on" : "off");
    };

    const toggleFacing = () => {
        setFacing((prev) => {
            const newFacing = prev === "back" ? "front" : "back";
            // Update flash availability when camera is flipped
            setHasFlash(newFacing === "back");
            // Reset flash to off when switching to front camera (which typically doesn't have flash)
            if (newFacing === "front") {
                setFlash("off");
            }
            return newFacing;
        });
    };

    const renderPicture = () => {
        return (
            <View style={styles.previewContainer}>
                {/* Top spacer to push content down from top */}
                <View style={styles.topSpacer} />

                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri }}
                        contentFit="contain"
                        style={styles.previewImage}
                    />
                </View>

                {/* Spacer between image and buttons */}
                <View style={styles.middleSpacer} />

                <View style={styles.photoActionContainer}>
                    <Pressable
                        onPress={() => setUri(null)}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { opacity: pressed ? 0.7 : 1 }
                        ]}
                    >
                        <View style={styles.greenCircle}>
                            <AntDesign name="close" size={24} color="white" />
                        </View>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            // Add your navigation logic here
                            console.log("Proceed to next page with photo:", uri);
                            // For example: router.push('/next-screen', { photo: uri });
                        }}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { opacity: pressed ? 0.7 : 1 }
                        ]}
                    >
                        <View style={styles.greenCircle}>
                            <AntDesign name="check" size={24} color="white" />
                        </View>
                    </Pressable>
                </View>

                {/* Bottom spacer */}
                <View style={styles.bottomSpacer} />
            </View>
        );
    };

    const renderCamera = () => {
        return (
            <CameraView
                style={styles.camera}
                ref={ref}
                facing={facing}
                flashMode={flash}
                enableZoomGesture
            >
                <View style={styles.shutterContainer}>
                    {hasFlash ? (
                        <Pressable onPress={toggleFlash} style={styles.cameraControlButton}>
                            <Ionicons
                                name={flash === "on" ? "flash" : "flash-off"}
                                size={28}
                                color="white"
                            />
                        </Pressable>
                    ) : (
                        <View style={styles.cameraControlButton}>
                            <Ionicons name="flash-off" size={28} color="rgba(255,255,255,0.5)" />
                        </View>
                    )}

                    <Pressable onPress={takePicture}>
                        {({ pressed }) => (
                            <View
                                style={[
                                    styles.shutterBtn,
                                    {
                                        opacity: pressed ? 0.5 : 1,
                                    },
                                ]}
                            >
                                <View style={styles.shutterBtnInner} />
                            </View>
                        )}
                    </Pressable>

                    <Pressable onPress={toggleFacing} style={styles.cameraControlButton}>
                        <FontAwesome6 name="rotate-left" size={28} color="white" />
                    </Pressable>
                </View>
            </CameraView>
        );
    };

    return (
        <View style={styles.container}>
            {uri ? renderPicture() : renderCamera()}
        </View>
    );
}

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    camera: {
        flex: 1,
        width: "100%",
    },
    shutterContainer: {
        position: "absolute",
        bottom: 40,
        width: "100%",
        paddingHorizontal: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cameraControlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterBtn: {
        height: 80,
        width: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    shutterBtnInner: {
        height: 64,
        width: 64,
        borderRadius: 32,
        backgroundColor: "white",
    },
    previewContainer: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    topSpacer: {
        flex: 0.2,
    },
    imageContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 0.4,
    },
    previewImage: {
        width: 300,
        height: 300,
        aspectRatio: 1,
    },
    middleSpacer: {
        flex: 0.05,
    },
    bottomSpacer: {
        flex: 0.15,
    },
    photoActionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '70%',
        alignItems: 'center',
        flex: 0.2,
    },
    actionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    },
    greenCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});