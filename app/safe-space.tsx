import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

  const categories = [
    { name: 'Emergency', color: '#FF0000' },
    { name: 'Counselling', color: '#4285F4' },
    { name: 'Youth Hub', color: '#34C759' },
    { name: 'Hospitals', color: '#FFCC00' },
    { name: 'Mosque', color: '#FF9500' },
    { name: 'Church', color: '#8B00FF' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#5A7C65" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>📍 Safe Space Map</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Verified, youth-friendly, and accessible locations near you.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            placeholder="Find Safe Space Near me"
            placeholderTextColor="#8E8E93"
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* Categories Grid */}
        <View style={styles.grid}>
          {categories.map((cat, index) => (
            <CategoryCard key={index} name={cat.name} dotColor={cat.color} />
          ))}
        </View>



        {/* Dial Crisis Help Button */}
        <TouchableOpacity 
          style={styles.dialButton}
          onPress={() => setIsDialModalVisible(true)}
        >
          <Text style={styles.dialButtonEmoji}>🚨</Text>
          <Text style={styles.dialButtonText}>Dial Crisis Help</Text>
        </TouchableOpacity>

        {/* All Safe Space Toggle */}
        <View style={styles.toggleRow}>
             <View style={styles.toggleLabelContainer}>
                <Text style={styles.toggleEmoji}>📍</Text>
                <Text style={[styles.toggleText, { color: colors.text }]}>All Safe Space.</Text>
             </View>
          <Switch
            value={allSafeSpaces}
            onValueChange={setAllSafeSpaces}
            trackColor={{ false: '#767577', true: '#5A7C65' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : allSafeSpaces ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>


      </ScrollView>

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
});
