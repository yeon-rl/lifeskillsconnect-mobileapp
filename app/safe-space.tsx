import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';

const CategoryCard = ({ name, dotColor }: { name: string; dotColor: string }) => {
  const colors = useThemedColors();
  return (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.categoryName, { color: colors.text }]}>{name}</Text>
    </TouchableOpacity>
  );
};

export default function SafeSpace() {
  const colors = useThemedColors();
  const router = useRouter();
  const [isDialModalVisible, setIsDialModalVisible] = useState(false);
  const [allSafeSpaces, setAllSafeSpaces] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [activeSpace, setActiveSpace] = useState<any>(null);
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  // Navigation States
  const [showRoute, setShowRoute] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [navigationData, setNavigationData] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showFullSteps, setShowFullSteps] = useState(false);

  const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  React.useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Initial location
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      setLoading(false);

      // Watch for movement
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5, // update every 5 meters
        },
        (newLocation) => {
          setUserLocation(newLocation);
        }
      );
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const mockSafeSpaces = userLocation ? [
    { 
      id: '1', 
      name: 'City Hospital', 
      type: 'Hospital', 
      latitude: userLocation.coords.latitude + 0.002, 
      longitude: userLocation.coords.longitude + 0.002,
      description: '24/7 Emergency unit with verified youth support staff and accessible entrance.',
      address: 'Central Avenue, Sector 4',
      phone: '+1 234 567 890'
    },
    { 
      id: '2', 
      name: 'Police Station A', 
      type: 'Police Station', 
      latitude: userLocation.coords.latitude - 0.002, 
      longitude: userLocation.coords.longitude + 0.002,
      description: 'Designated Safe Space point with 24-hour reception and immediate assistance.',
      address: 'Safety Square, West End',
      phone: '+1 234 567 891'
    },
    { 
      id: '3', 
      name: 'General Hospital', 
      type: 'Hospital', 
      latitude: userLocation.coords.latitude + 0.002, 
      longitude: userLocation.coords.longitude - 0.002,
      description: 'Full medical services including a specialized youth counselling unit.',
      address: 'North Park Road',
      phone: '+1 234 567 892'
    },
    { 
      id: '4', 
      name: 'Police Station B', 
      type: 'Police Station', 
      latitude: userLocation.coords.latitude - 0.002, 
      longitude: userLocation.coords.longitude - 0.002,
      description: 'Community outreach hub and verified reporting center for youth safety.',
      address: 'Bridge Street, East Side',
      phone: '+1 234 567 893'
    },
    { 
      id: '5', 
      name: 'Central Clinic', 
      type: 'Hospital', 
      latitude: userLocation.coords.latitude + 0.003, 
      longitude: userLocation.coords.longitude,
      description: 'Walk-in clinic with friendly staff focused on primary care and mental wellbeing.',
      address: 'Main St Mall, Ground Floor',
      phone: '+1 234 567 894'
    },
  ] : [];

  const startNavigation = () => {
    if (!activeSpace) return;
    setIsNavigating(true);
    setShowRoute(true);
    setCurrentStepIndex(0);
    
    if (!isMuted) {
      Speech.speak("Starting navigation to " + activeSpace.name + ". Follow the highlighted path on your map.", {
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setShowRoute(false);
    setNavigationData(null);
    setActiveSpace(null);
    Speech.stop();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      Speech.stop();
    }
  };

  const onDirectionsReady = (result: any) => {
    setNavigationData(result);
    // Extract steps from HTML instructions if available, or just use the summarized distance/duration
    if (result.legs && result.legs[0]) {
      // Directions API result includes legs[0].steps
      // We'll simplify the steps for the UI
    }
  };

  const categories = [
    { name: 'Hospital', color: '#5A7C65', icon: 'medical' },
    { name: 'Police Station', color: '#5A7C65', icon: 'shield-checkmark' },
    { name: 'Church', color: '#5A7C65', icon: 'sunny' },
  ];

  const filteredSafeSpaces = mockSafeSpaces.filter(space => {
    const matchesFilter = selectedFilters.length === 0 || selectedFilters.includes(space.type);
    return matchesFilter;
  });

  const toggleFilter = (type: string) => {
    if (selectedFilters.includes(type)) {
      setSelectedFilters(selectedFilters.filter(f => f !== type));
    } else {
      setSelectedFilters([...selectedFilters, type]);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNearbySpaces = (currentSpace: any) => {
    return mockSafeSpaces
      .filter(s => s.id !== currentSpace.id)
      .map(s => ({
        ...s,
        distance: calculateDistance(currentSpace.latitude, currentSpace.longitude, s.latitude, s.longitude)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, showMap && styles.overlayHeader, { backgroundColor: showMap ? 'rgba(255,255,255,0.9)' : colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#5A7C65" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>📍 Safe Space Map</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {!showMap ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Verified, youth-friendly, and accessible locations near you.
          </Text>

          {/* Filter Tags */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContainer}
          >
            {categories.map((cat, index) => {
              const isSelected = selectedFilters.includes(cat.name);
              return (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => toggleFilter(cat.name)}
                  style={[
                    styles.filterTag, 
                    { 
                      backgroundColor: isSelected ? '#5A7C65' : colors.modalBg,
                      borderColor: isSelected ? '#5A7C65' : colors.bglight10
                    }
                  ]}
                >
                  <Ionicons 
                    name={cat.icon as any} 
                    size={14} 
                    color={isSelected ? 'white' : colors.textSecondary} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[
                    styles.filterTagText, 
                    { color: isSelected ? 'white' : colors.text }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Safe Spaces List */}
          <View style={styles.listContainer}>
            {filteredSafeSpaces.length > 0 ? (
              filteredSafeSpaces.map((space) => (
                <TouchableOpacity 
                  key={space.id} 
                  style={[styles.listCard, { backgroundColor: colors.modalBg }]}
                  onPress={() => {
                    setSelectedSpace(space);
                    setActiveSpace(space);
                    setShowRoute(false);
                    setShowMap(true);
                    setIsCardMinimized(false);
                  }}
                >
                  <View style={[styles.listCardIcon, { backgroundColor: space.type === 'Hospital' ? '#FFB80010' : '#4285F410' }]}>
                    <Ionicons name={space.type === 'Hospital' ? "medical" : "shield-checkmark"} size={22} color={space.type === 'Hospital' ? '#FFB800' : '#4285F4'} />
                  </View>
                  <View style={styles.listCardInfo}>
                    <Text style={[styles.listCardName, { color: colors.text }]}>{space.name}</Text>
                    <View style={styles.listCardMeta}>
                      <Ionicons name="location-outline" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.listCardAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                        {space.address}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.listCardDirectButton}
                    onPress={() => {
                      setSelectedSpace(space);
                      setActiveSpace(space);
                      setShowRoute(true);
                      setShowMap(true);
                      setIsCardMinimized(false);
                    }}
                  >
                    <Ionicons name="navigate-outline" size={20} color="#5A7C65" />
                    <Text style={styles.listCardDirectText}>Direct</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color="#D1D1D6" />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No safe spaces found matching your search.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.fullMapContainer}>
          {loading ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color="#5A7C65" />
              <Text style={{ marginTop: 10, color: colors.textSecondary }}>Locating safe spaces...</Text>
            </View>
          ) : userLocation ? (
            <>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                showsUserLocation={true}
                followsUserLocation={isNavigating}
                initialRegion={{
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                  }}
                  title="You are here"
                  pinColor="#4285F4"
                />
                <Circle
                  center={{
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                  }}
                  radius={500}
                  fillColor="rgba(90, 124, 101, 0.1)"
                  strokeColor="rgba(90, 124, 101, 0.3)"
                  strokeWidth={1}
                />
                
                { (showRoute || isNavigating) && activeSpace && (
                  <MapViewDirections
                    origin={{
                      latitude: userLocation.coords.latitude,
                      longitude: userLocation.coords.longitude,
                    }}
                    destination={{
                      latitude: activeSpace.latitude,
                      longitude: activeSpace.longitude,
                    }}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={4}
                    strokeColor="#2C64C6"
                    optimizeWaypoints={true}
                    onReady={onDirectionsReady}
                  />
                )}

                {filteredSafeSpaces.map(space => (
                  <Marker
                    key={space.id}
                    coordinate={{
                      latitude: space.latitude,
                      longitude: space.longitude,
                    }}
                    onPress={() => {
                      setSelectedSpace(space);
                      setActiveSpace(space);
                      setIsCardMinimized(false);
                    }}
                  >
                    <View style={[styles.customMarker, { backgroundColor: space.type === 'Hospital' ? '#FF0000' : '#4285F4' }]}>
                      <Ionicons name={space.type === 'Hospital' ? "medical" : "shield-checkmark"} size={16} color="white" />
                    </View>
                  </Marker>
                ))}
              </MapView>

              {/* Map UI Overlays */}
              <View style={styles.mapOverlayControls}>
                <TouchableOpacity 
                  style={styles.viewAllFAB}
                  onPress={() => setShowMap(false)}
                >
                  <Ionicons name="list" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.viewAllFABText}>View All Safe Spaces</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.mapListToggleButton}
                  onPress={() => setShowMap(false)}
                >
                  <Ionicons name="list" size={24} color="#5A7C65" />
                </TouchableOpacity>
              </View>

              {/* Space Details Modal/Sheet Overlay */}
              {selectedSpace && (
                <View style={[styles.detailCardWrapper, isCardMinimized && styles.detailCardWrapperMinimized]}>
                  <View style={[styles.detailCard, { backgroundColor: colors.modalBg }]}>
                    <View style={styles.detailCardHeader}>
                      <TouchableOpacity 
                        style={styles.minimizeButton}
                        onPress={() => setIsCardMinimized(!isCardMinimized)}
                      >
                        <Ionicons name={isCardMinimized ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.closeDetailButton}
                        onPress={() => setSelectedSpace(null)}
                      >
                        <Ionicons name="close" size={22} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                    
                    {!isCardMinimized && (
                      <View style={styles.detailContent}>
                        {!isNavigating ? (
                          <>
                            <View style={styles.detailHeader}>
                              <View style={[styles.typeBadge, { backgroundColor: selectedSpace.type === 'Hospital' ? '#FFB80015' : '#4285F415' }]}>
                                <Text style={[styles.typeBadgeText, { color: selectedSpace.type === 'Hospital' ? '#FFB800' : '#4285F4' }]}>{selectedSpace.type}</Text>
                              </View>
                              <View style={styles.nameRow}>
                                <Text style={[styles.detailName, { color: colors.text }]}>{selectedSpace.name}</Text>
                                {(showRoute || isNavigating) && (
                                  <TouchableOpacity 
                                    style={styles.stopNavButtonSmall}
                                    onPress={stopNavigation}
                                  >
                                    <Ionicons name="stop-circle" size={24} color="#FF0000" />
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>

                            <Text style={[styles.detailAddress, { color: colors.textSecondary }]}>
                              <Ionicons name="location" size={14} /> {selectedSpace.address}
                            </Text>

                            {/* Summary View if Route is Shown but Navigation Not Started */}
                            {showRoute && navigationData && !isNavigating ? (
                               <View style={styles.previewStatsRow}>
                                  <View style={styles.previewStat}>
                                    <Text style={styles.previewStatLabel}>Distance</Text>
                                    <Text style={[styles.previewStatValue, { color: colors.text }]}>{navigationData.distance.toFixed(1)} km</Text>
                                  </View>
                                  <View style={styles.previewStat}>
                                    <Text style={styles.previewStatLabel}>Time</Text>
                                    <Text style={[styles.previewStatValue, { color: colors.text }]}>{Math.round(navigationData.duration)} min</Text>
                                  </View>
                               </View>
                            ) : (
                              <>
                                <Text style={[styles.detailDescription, { color: colors.text }]}>
                                  {selectedSpace.description}
                                </Text>
                                
                                {/* Nearby Safe Spaces */}
                                <View style={styles.nearbySection}>
                                  <Text style={[styles.nearbyTitle, { color: colors.text }]}>Nearby Safe Spaces</Text>
                                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbyScroll}>
                                    {getNearbySpaces(selectedSpace).map((nearby) => (
                                      <TouchableOpacity 
                                        key={nearby.id} 
                                        style={[styles.nearbyCard, { backgroundColor: colors.background }]}
                                        onPress={() => {
                                          setSelectedSpace(nearby);
                                          setActiveSpace(nearby);
                                        }}
                                      >
                                        <View style={[styles.nearbyIcon, { backgroundColor: nearby.type === 'Hospital' ? '#FFB80015' : '#4285F415' }]}>
                                          <Ionicons name={nearby.type === 'Hospital' ? "medical" : "shield-checkmark"} size={16} color={nearby.type === 'Hospital' ? '#FFB800' : '#4285F4'} />
                                        </View>
                                        <Text style={[styles.nearbyName, { color: colors.text }]} numberOfLines={1}>{nearby.name}</Text>
                                        <Text style={styles.nearbyDistance}>{nearby.distance.toFixed(1)} km away</Text>
                                      </TouchableOpacity>
                                    ))}
                                  </ScrollView>
                                </View>
                              </>
                            )}

                            <View style={styles.detailActions}>
                              {!showRoute ? (
                                <>
                                  <TouchableOpacity style={styles.detailActionButton}>
                                    <Ionicons name="call" size={20} color="white" />
                                    <Text style={styles.detailActionButtonText}>Call</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={[styles.detailActionButton, { backgroundColor: '#F2F2F7' }]} onPress={() => setShowRoute(true)}>
                                    <Ionicons name="navigate" size={20} color="#5A7C65" />
                                    <Text style={[styles.detailActionButtonText, { color: '#5A7C65' }]}>Direct</Text>
                                  </TouchableOpacity>
                                </>
                              ) : (
                                <TouchableOpacity style={styles.detailActionButton} onPress={startNavigation}>
                                  <Ionicons name="navigate" size={20} color="white" />
                                  <Text style={styles.detailActionButtonText}>Start Navigation</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </>
                        ) : (
                          <View style={styles.compactNavOverlay}>
                            {/* Compact Stats Row */}
                            <View style={styles.compactStatsRow}>
                               <View style={styles.compactStat}>
                                  <Text style={styles.compactStatValue}>{navigationData?.distance.toFixed(1)} km</Text>
                                  <Text style={styles.compactStatLabel}>Distance</Text>
                               </View>
                               <View style={styles.compactStatDivider} />
                               <View style={styles.compactStat}>
                                  <Text style={styles.compactStatValue}>{Math.round(navigationData?.duration)} min</Text>
                                  <Text style={styles.compactStatLabel}>Arrival</Text>
                               </View>
                               <View style={styles.compactStatDivider} />
                               <TouchableOpacity style={styles.muteToggleButton} onPress={toggleMute}>
                                  <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={22} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Top Step Banner (Overlay on Map) */}
                            <View style={styles.topNavBanner}>
                               <View style={styles.topNavIcon}>
                                  <Ionicons 
                                     name={navigationData?.legs?.[0]?.steps?.[currentStepIndex]?.maneuver?.includes('left') ? 'arrow-back' : 'arrow-up'} 
                                     size={24} 
                                     color="white" 
                                  />
                               </View>
                               <View style={styles.topNavTextContainer}>
                                  <Text style={styles.topNavDistance}>Next turn in {navigationData?.legs?.[0]?.steps?.[currentStepIndex]?.distance.text}</Text>
                                  <Text style={styles.topNavInstruction} numberOfLines={2}>
                                     {navigationData?.legs?.[0]?.steps?.[currentStepIndex]?.instructions 
                                        ? navigationData.legs[0].steps[currentStepIndex].instructions.replace(/<[^>]*>?/gm, '') 
                                        : 'Keep moving forward'}
                                  </Text>
                               </View>
                            </View>

                            {/* Full steps toggle */}
                            <TouchableOpacity 
                               style={styles.stepsToggleRow} 
                               onPress={() => setShowFullSteps(!showFullSteps)}
                            >
                               <Text style={[styles.stepsToggleText, { color: colors.text }]}>{showFullSteps ? 'Hide steps' : 'View all steps'}</Text>
                               <Ionicons name={showFullSteps ? "chevron-down" : "chevron-up"} size={18} color="#5A7C65" />
                            </TouchableOpacity>

                            {showFullSteps && (
                               <ScrollView style={styles.stepsScrollCompact} nestedScrollEnabled={true}>
                                  {navigationData?.legs?.[0]?.steps?.map((step: any, idx: number) => (
                                     <View key={idx} style={styles.stepRowCompact}>
                                     <Ionicons 
                                        name={step.maneuver?.includes('left') ? 'arrow-back' : step.maneuver?.includes('right') ? 'arrow-forward' : 'arrow-up'} 
                                        size={16} 
                                        color="#5A7C65" 
                                     />
                                     <Text style={[styles.stepTextCompact, { color: colors.text }]}>
                                        {step.instructions ? step.instructions.replace(/<[^>]*>?/gm, '') : 'Proceed forward'}
                                     </Text>
                                     </View>
                                  ))}
                               </ScrollView>
                            )}

                            <TouchableOpacity 
                               style={[styles.detailActionButton, { backgroundColor: '#FF0000', height: 45, marginTop: 10 }]} 
                               onPress={stopNavigation}
                            >
                              <Text style={styles.detailActionButtonText}>Stop Navigation</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}

                    {isCardMinimized && (
                      <View style={styles.minimizedContent}>
                        <Text style={[styles.minimizedName, { color: colors.text }]} numberOfLines={1}>{selectedSpace.name}</Text>
                        <View style={styles.minimizedActions}>
                          {(showRoute || isNavigating) && (
                             <TouchableOpacity 
                                style={styles.stopNavButtonSmall}
                                onPress={stopNavigation}
                             >
                               <Ionicons name="stop-circle" size={22} color="#FF0000" />
                             </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => setIsCardMinimized(false)}>
                            <Ionicons name="chevron-up" size={24} color="#5A7C65" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.mapError}>
              <Ionicons name="location-outline" size={48} color="#FF0000" />
              <Text style={[styles.errorText, { color: colors.text }]}>{errorMsg || 'Could not load map'}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => setLoading(true)}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Dial Modal */}
      <Modal
        visible={isDialModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDialModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
            <View style={styles.modalIconCircle}>
                <Ionicons name="call" size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Dial Emergency Location</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Do you want to call this emergency services?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsDialModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmDialButton}
                onPress={() => {
                  setIsDialModalVisible(false);
                  // Implement actual dialing logic if needed
                }}
              >
                <Text style={styles.confirmDialButtonText}>Dial</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5A7C651A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    // Add subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  nearMeBanner: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  nearMeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  nearMeTextContainer: {
    flex: 1,
  },
  nearMeTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearMeDistance: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  dialButton: {
    backgroundColor: '#E10000',
    borderRadius: 12,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dialButtonEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  dialButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 40,
    // Add subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  toggleLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  toggleText: {
    fontSize: 18,
    fontWeight: '600',
  },
  goToMapButton: {
    backgroundColor: '#5A7C65',
    borderRadius: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goToMapButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A00000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
  },
  confirmDialButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#A00000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDialButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  viewToggleTextActive: {
    color: '#5A7C65',
  },
  mapWrapper: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  mapError: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  customMarker: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingBottom: 15,
  },
  fullMapContainer: {
    flex: 1,
    width: '100%',
  },
  mapOverlayControls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  viewAllFAB: {
    backgroundColor: '#5A7C65',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  viewAllFABText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  mapListToggleButton: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 20,
  },
  detailCardWrapperMinimized: {
    padding: 10,
    bottom: 20,
  },
  detailCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  minimizeButton: {
    padding: 4,
  },
  closeDetailButton: {
    padding: 4,
  },
  detailContent: {
    marginTop: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  stopNavButtonSmall: {
    padding: 4,
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  minimizedName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  minimizedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  detailHeader: {
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailName: {
    fontSize: 22,
    fontWeight: '700',
  },
  detailAddress: {
    fontSize: 14,
    marginBottom: 15,
  },
  detailDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5A7C65',
    height: 50,
    borderRadius: 12,
    gap: 8,
  },
  detailActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  previewStatsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  previewStat: {
    flex: 1,
  },
  previewStatLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  previewStatValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#5A7C65',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  navigationOverlay: {
    width: '100%',
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepsScroll: {
    maxHeight: 200,
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    gap: 12,
  },
  stepText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  compactNavOverlay: {
    width: '100%',
  },
  compactStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
  },
  compactStat: {
    flex: 1,
    alignItems: 'center',
  },
  compactStatValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  compactStatLabel: {
    color: '#94A3B8',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  compactStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#475569',
  },
  muteToggleButton: {
    padding: 8,
  },
  topNavBanner: {
    position: 'absolute',
    top: -380, // Offset to push it to the top of the map
    left: 0,
    right: 0,
    backgroundColor: '#5A7C65',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  topNavIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  topNavTextContainer: {
    flex: 1,
  },
  topNavDistance: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  topNavInstruction: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  stepsToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  stepsToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepsScrollCompact: {
    maxHeight: 120,
    marginBottom: 10,
  },
  stepRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  stepTextCompact: {
    fontSize: 13,
    flex: 1,
  },
  filtersScroll: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  listCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  listCardInfo: {
    flex: 1,
  },
  listCardName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listCardAddress: {
    fontSize: 13,
    flex: 1,
  },
  listCardDirectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A7C6510',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  listCardDirectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A7C65',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.6,
  },
  nearbySection: {
    marginTop: 10,
    marginBottom: 20,
  },
  nearbyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  nearbyScroll: {
    gap: 12,
  },
  nearbyCard: {
    width: 140,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: 'white',
  },
  nearbyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  nearbyName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  nearbyDistance: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
