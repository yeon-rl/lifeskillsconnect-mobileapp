import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const LAGOS_COORDINATES = {
  latitude: 6.5244,
  longitude: 3.3792,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const SAFE_SPACES = [
  { id: 1, name: 'Ikeja Support Center', type: 'Counselling', latitude: 6.6018, longitude: 3.3515, color: '#4285F4' },
  { id: 2, name: 'Lekki Safe Haven', type: 'Emergency', latitude: 6.4474, longitude: 3.4723, color: '#FF0000' },
  { id: 3, name: 'VI Counseling Hub', type: 'Hospitals', latitude: 6.4253, longitude: 3.4215, color: '#FFCC00' },
  { id: 4, name: 'Surulere Youth Center', type: 'Youth Hub', latitude: 6.5059, longitude: 3.3619, color: '#34C759' },
  { id: 5, name: 'Yaba Safe Spot', type: 'Emergency', latitude: 6.5165, longitude: 3.3858, color: '#FF0000' },
];

export default function SafeSpaceMap() {
  const colors = useThemedColors();
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapRef = React.useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    })();
  }, []);

  const initialRegion = LAGOS_COORDINATES;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
        >
           {SAFE_SPACES.map((space) => (
             <Marker
                key={space.id}
                coordinate={{
                  latitude: space.latitude,
                  longitude: space.longitude,
                }}
                title={space.name}
                description={space.type}
             >
                <View style={[styles.mapPin, { backgroundColor: space.color }]}>
                   <Ionicons 
                    name={space.type === 'Emergency' ? 'alert-circle' : 'heart'} 
                    size={16} 
                    color="white" 
                  />
                </View>
             </Marker>
           ))}
        </MapView>

        {/* Minimal Back Button */}
        <TouchableOpacity 
          style={styles.floatingBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#5A7C65" />
        </TouchableOpacity>

        {/* Locate Button */}
        <TouchableOpacity 
          style={styles.floatingLocateButton}
          onPress={async () => {
            let loc = await Location.getCurrentPositionAsync({});
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }, 1000);
            }
          }}
        >
          <Ionicons name="locate" size={24} color="#5A7C65" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  floatingBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingLocateButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
