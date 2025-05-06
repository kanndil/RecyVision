import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Linking, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface RecyclingCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  type: string;
  acceptedItems: string[];
  openingHours?: string;
}

const Map = () => {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const getAcceptedItems = (element: any): string[] => {
    const items: string[] = [];
    console.log('Processing element tags:', element.tags);
    
    // Check all possible recycling types
    const recyclingTypes: Record<string, string> = {
      'recycling:glass': 'Glass',
      'recycling:paper': 'Paper',
      'recycling:plastic': 'Plastic',
      'recycling:clothes': 'Clothes',
      'recycling:metal': 'Metal',
      'recycling:electronics': 'Electronics',
      'recycling:batteries': 'Batteries',
      'recycling:cardboard': 'Cardboard',
      'recycling:aluminium': 'Aluminium',
      'recycling:tin': 'Tin',
      'recycling:green_waste': 'Green Waste',
      'recycling:organic': 'Organic Waste'
    };

    // Check each recycling type
    Object.entries(recyclingTypes).forEach(([key, label]) => {
      if (element.tags[key] === 'yes') {
        items.push(label);
      }
    });

    // If no specific items are found but it's a general recycling center
    if (items.length === 0 && element.tags.amenity === 'recycling') {
      return [
        'Glass Bottles & Jars',
        'Paper & Cardboard',
        'Plastic Bottles',
        'Metal Cans',
        'Aluminium Foil',
        'Newspapers & Magazines',
        'Cardboard Boxes',
        'Plastic Containers',
        'Metal Containers',
        'Mixed Paper'
      ];
    }

    console.log('Found accepted items:', items);
    return items;
  };

  const fetchRecyclingCenters = async (city: string) => {
    try {
      if (!location) {
        console.log('No location available yet');
        return;
      }

      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
      // 0.1 degrees is approximately 10km radius
      // You can adjust this value to change the search radius:
      // 0.05 = ~5km
      // 0.1 = ~10km
      // 0.2 = ~20km
      const radius = 0.1;

      console.log('Searching for recycling centers around:', { lat, lon, radiusKm: '10km' });

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="recycling"](${lat - radius},${lon - radius},${lat + radius},${lon + radius});
          node["recycling:glass"="yes"](${lat - radius},${lon - radius},${lat + radius},${lon + radius});
          node["recycling:paper"="yes"](${lat - radius},${lon - radius},${lat + radius},${lon + radius});
          node["recycling:plastic"="yes"](${lat - radius},${lon - radius},${lat + radius},${lon + radius});
          node["recycling_type"](${lat - radius},${lon - radius},${lat + radius},${lon + radius});
          node["recycling:clothes"="yes"](${lat - radius},${lon - radius},${lat + radius},${lon + radius});
          node["recycling:metal"="yes"](${lat - radius},${lon - radius},${lat + radius},${lon + radius});
          node["recycling:electronics"="yes"](${lat - radius},${lon - radius},${lat + radius},${lon + radius});
          node["recycling:batteries"="yes"](${lat - radius},${lon - radius},${lat + radius},${lon + radius});
        );
        out body;
        >;
        out skel qt;
      `;

      console.log('Sending query to Overpass API...');
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.elements || data.elements.length === 0) {
        console.log('No recycling centers found in the area');
        return;
      }

      const centers = data.elements.map((element: any) => ({
        id: element.id.toString(),
        name: element.tags.name || 'Recycling Center',
        latitude: element.lat,
        longitude: element.lon,
        address: element.tags['addr:street'] 
          ? `${element.tags['addr:street']} ${element.tags['addr:housenumber'] || ''}, ${city}`
          : city,
        type: element.tags.amenity === 'recycling' ? 'general' :
              element.tags['recycling:glass'] === 'yes' ? 'glass' :
              element.tags['recycling:paper'] === 'yes' ? 'paper' :
              element.tags['recycling:plastic'] === 'yes' ? 'plastic' : 'other',
        acceptedItems: getAcceptedItems(element),
        openingHours: element.tags.opening_hours || 'Hours not specified'
      }));

      console.log('Processed recycling centers:', centers);
      setRecyclingCenters(centers);
    } catch (error) {
      console.error('Error fetching recycling centers:', error);
    }
  };

  const refreshRecyclingCenters = async () => {
    if (!location || !userCity) return;
    setIsLoading(true);
    try {
      await fetchRecyclingCenters(userCity);
    } finally {
      setIsLoading(false);
    }
  };

  const centerOnUserLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000); // 1000ms animation duration
    }
  };

  const openInMaps = (latitude: number, longitude: number, name: string) => {
    console.log('Get Directions button pressed');
    console.log('Location:', { latitude, longitude, name });
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    console.log('Opening URL:', url);
    
    Linking.openURL(url).catch(err => {
      console.error('Error opening Google Maps:', err);
    });
  };

  const showBottomSheet = (center: RecyclingCenter) => {
    setSelectedCenter(center);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const hideBottomSheet = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setSelectedCenter(null);
    });
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        if (address) {
          console.log('City:', address.city);
          setUserCity(address.city);
          // Fetch recycling centers for the city
          if (address.city) {
            await fetchRecyclingCenters(address.city);
          }
        }
      } catch (error) {
        console.error('Error getting address:', error);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
        initialRegion={location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } : undefined}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        onMapReady={() => setMapReady(true)}
      >
        {mapReady && location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
          />
        )}
        {mapReady && recyclingCenters.map((center) => (
          <Marker
            key={center.id}
            coordinate={{
              latitude: center.latitude,
              longitude: center.longitude,
            }}
            title={center.name}
            description={center.address}
            pinColor="green"
            onPress={() => {
              if (Platform.OS === 'android') {
                showBottomSheet(center);
              }
            }}
          >
            {Platform.OS === 'ios' && (
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{center.name}</Text>
                  <Text style={styles.calloutText}>{center.address}</Text>
                  <Text style={styles.calloutSubtitle}>Accepts:</Text>
                  {center.acceptedItems.map((item, index) => (
                    <Text key={index} style={styles.calloutText}>• {item}</Text>
                  ))}
                  <Text style={styles.calloutSubtitle}>Opening Hours:</Text>
                  <Text style={styles.calloutText}>{center.openingHours}</Text>
                </View>
              </Callout>
            )}
          </Marker>
        ))}
      </MapView>
      {/* Android Bottom Sheet */}
      {Platform.OS === 'android' && selectedCenter && (
        <Animated.View 
          style={[
            styles.bottomSheet,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>{selectedCenter.name}</Text>
              <TouchableOpacity onPress={hideBottomSheet} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.bottomSheetText}>{selectedCenter.address}</Text>
            <Text style={styles.bottomSheetSubtitle}>Accepts:</Text>
            {selectedCenter.acceptedItems.map((item, index) => (
              <Text key={index} style={styles.bottomSheetText}>• {item}</Text>
            ))}
            <Text style={styles.bottomSheetSubtitle}>Opening Hours:</Text>
            <Text style={styles.bottomSheetText}>{selectedCenter.openingHours}</Text>
          </View>
        </Animated.View>
      )}
      <TouchableOpacity 
        style={[
          styles.refreshButton,
          Platform.OS === 'android' && styles.androidRefreshButton
        ]}
        onPress={refreshRecyclingCenters}
        disabled={isLoading}
      >
        <Ionicons 
          name="refresh" 
          size={24} 
          color="white"
          style={[
            styles.refreshIcon,
            isLoading && styles.refreshing
          ]} 
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.locationButton,
          Platform.OS === 'android' && styles.androidLocationButton
        ]}
        onPress={centerOnUserLocation}
      >
        <Ionicons 
          name="locate" 
          size={24} 
          color="white"
        />
      </TouchableOpacity>
      {Platform.OS === 'ios' && (
        <TouchableOpacity 
          style={styles.navigationButton}
          onPress={() => {
            if (location && recyclingCenters.length > 0) {
              console.log('Opening maps with recycling centers');
              
              const url = `maps://?q=${recyclingCenters.map(center => 
                `${center.name}@${center.latitude},${center.longitude}`
              ).join('|')}`;
              
              if (url) {
                Linking.openURL(url).catch(err => {
                  const webUrl = `https://maps.apple.com/?q=${recyclingCenters.map(center => 
                    `${center.name}@${center.latitude},${center.longitude}`
                  ).join('|')}`;
                  Linking.openURL(webUrl).catch(webErr => console.error('Error opening maps:', webErr));
                });
              }
            }
          }}
        >
          <Ionicons 
            name="navigate" 
            size={24} 
            color="white"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default Map;

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      width: '100%',
      height: '100%',
    },
    callout: {
      padding: 10,
      maxWidth: 200,
      backgroundColor: 'white',
      borderRadius: 8,
      ...Platform.select({
        android: {
          elevation: 5,
        },
        ios: {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
      }),
    },
    calloutTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#333',
    },
    calloutSubtitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 5,
      marginBottom: 2,
      color: '#333',
    },
    calloutText: {
      fontSize: 12,
      marginBottom: 2,
      color: '#666',
    },
    refreshButton: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      backgroundColor: '#4CAF50',
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    locationButton: {
      position: 'absolute',
      bottom: 30,
      right: 80,
      backgroundColor: '#4CAF50',
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    navigationButton: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      backgroundColor: '#4CAF50',
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    androidRefreshButton: {
      bottom: 30,
      top: undefined,
      left: 20,
    },
    androidLocationButton: {
      bottom: undefined,
      top: 50,
      right: 20,
    },
    refreshIcon: {
      color: 'white',
    },
    refreshing: {
      transform: [{ rotate: '45deg' }],
    },
    directionsButton: {
      backgroundColor: '#4CAF50',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
      minHeight: 44, // iOS minimum touch target size
      width: '100%',
    },
    directionsButtonText: {
      color: 'white',
      marginLeft: 8,
      fontSize: 14,
      fontWeight: 'bold',
    },
    bottomSheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    bottomSheetContent: {
      padding: 20,
    },
    bottomSheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    bottomSheetTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
    },
    closeButton: {
      padding: 5,
    },
    bottomSheetText: {
      fontSize: 14,
      color: '#666',
      marginBottom: 5,
    },
    bottomSheetSubtitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 10,
      marginBottom: 5,
    },
  });
