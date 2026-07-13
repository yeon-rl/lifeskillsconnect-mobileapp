import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, TextInput, Modal, TouchableWithoutFeedback, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { useJobs, Job } from '@/hooks/use-jobs';
import { useUserStore } from '@/store/userStore';
import * as Location from 'expo-location';



export default function JobsScreen() {
  const router = useRouter();
  const colors = useThemedColors();
  const [activeTab, setActiveTab] = useState<'Active' | 'Applied' | 'Saved'>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [selectedRoleType, setSelectedRoleType] = useState<string>('All');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('All');
  const [activePicker, setActivePicker] = useState<'role' | 'date' | null>(null);

  const { currentUser } = useUserStore();
  const profileCity = currentUser?.city || '';
  const profileCountry = currentUser?.nationality || '';
  const displayLocation = detectedLocation || 
                         (profileCity && profileCountry ? `${profileCity}, ${profileCountry}` : profileCity || profileCountry);

  const { jobs, isLoading, error, toggleSaveJob, refresh } = useJobs(activeTab, {
    location: displayLocation || undefined,
    roleType: selectedRoleType,
    datePosted: selectedDateRange,
    search: searchQuery
  });

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        let location = await Location.getCurrentPositionAsync({});
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const item = reverseGeocode[0];
          // Use city or subregion (county/state area) — avoid district which maps to local gov areas
          const city = item.city || item.subregion || item.region || '';
          const country = item.country || '';
          if (city) {
            setDetectedLocation(country ? `${city}, ${country}` : city);
          }
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);

  // Filter out expired jobs (0 days left)
  const filteredJobs = jobs.filter(job => job.daysLeft > 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.modalBg }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Job Feeds</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading && jobs.length > 0} onRefresh={refresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.modalBg }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['Active', 'Applied', 'Saved'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === tab ? colors.text : colors.textSecondary },
                activeTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersScrollView}
          contentContainerStyle={styles.filtersScrollContent}
        >
          <View style={[styles.filterChip, { backgroundColor: displayLocation ? colors.tagBg : colors.modalBg, borderColor: displayLocation ? '#4285F4' : colors.gray250 }]}>
            <Ionicons name="location-outline" size={16} color={displayLocation ? "#4285F4" : colors.textSecondary} />
            <Text style={[styles.filterText, { color: displayLocation ? '#4285F4' : colors.textSecondary }]}>
              {displayLocation || 'Location not set'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.filterChip, { backgroundColor: selectedRoleType !== 'All' ? colors.tagBg : colors.modalBg, borderColor: selectedRoleType !== 'All' ? '#4285F4' : colors.gray250 }]}
            onPress={() => setActivePicker('role')}
          >
            <Text style={[styles.filterText, { color: selectedRoleType !== 'All' ? '#4285F4' : colors.textSecondary }]}>
              {selectedRoleType === 'All' ? 'Role Type' : selectedRoleType}
            </Text>
            <Ionicons name="chevron-down" size={16} color={selectedRoleType !== 'All' ? "#4285F4" : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, { backgroundColor: selectedDateRange !== 'All' ? colors.tagBg : colors.modalBg, borderColor: selectedDateRange !== 'All' ? '#4285F4' : colors.gray250 }]}
            onPress={() => setActivePicker('date')}
          >
            <Text style={[styles.filterText, { color: selectedDateRange !== 'All' ? '#4285F4' : colors.textSecondary }]}>
              {selectedDateRange === 'All' ? 'Date Posted' : selectedDateRange}
            </Text>
            <Ionicons name="chevron-down" size={16} color={selectedDateRange !== 'All' ? "#4285F4" : colors.textSecondary} />
          </TouchableOpacity>
        </ScrollView>

        <FilterPicker
          visible={activePicker !== null}
          onClose={() => setActivePicker(null)}
          title={activePicker === 'role' ? 'Select Role Type' : 'Select Date Posted'}
          options={activePicker === 'role' 
            ? ['All', 'Full-Time', 'Part-Time', 'Contract', 'Internship'] 
            : ['All', 'Today', 'Yesterday', 'Last 7 days', 'Last one month']
          }
          selectedValue={activePicker === 'role' ? selectedRoleType : selectedDateRange}
          onSelect={(value) => {
            if (activePicker === 'role') setSelectedRoleType(value);
            else setSelectedDateRange(value);
            setActivePicker(null);
          }}
        />

        {/* Result Summary */}
        <View style={styles.resultSummary}>
          <Text style={[styles.resultCount, { color: colors.textSecondary }]}>{filteredJobs.length} result</Text>
        </View>

        {/* Job List */}
        <View style={styles.jobList}>
          {isLoading && jobs.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 10, color: colors.textSecondary }}>Loading jobs...</Text>
            </View>
          ) : error ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
              <Text style={{ marginTop: 10, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 }}>{error}</Text>
              <TouchableOpacity onPress={refresh} style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.primary }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredJobs.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Ionicons name="briefcase-outline" size={48} color={colors.textSecondary} />
              <Text style={{ marginTop: 10, color: colors.textSecondary }}>No jobs found</Text>
            </View>
          ) : (
            filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onPress={() => router.push(`/job-details/${job.id}`)}
                onSave={() => toggleSaveJob(job.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}


function FilterPicker({ 
  visible, 
  onClose, 
  title, 
  options, 
  selectedValue, 
  onSelect 
}: { 
  visible: boolean, 
  onClose: () => void, 
  title: string, 
  options: string[], 
  selectedValue: string,
  onSelect: (value: string) => void
}) {
  const colors = useThemedColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.dropdownOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dropdownContainer, { backgroundColor: colors.background, borderColor: '#E1E4E8' }]}>
              {options.map((option) => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.optionItem}
                  onPress={() => onSelect(option)}
                >
                  <Text style={[
                    styles.optionText, 
                    { color: selectedValue === option ? colors.primary : colors.text },
                    selectedValue === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {selectedValue === option && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function JobCard({ job, onPress, onSave }: { job: Job, onPress: () => void, onSave: () => void }) {
  const colors = useThemedColors();

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.card, { borderColor: colors.gray250, backgroundColor: colors.bglight01 }]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.logoAndHeader}>
          <View style={[styles.jobLogoContainer, { backgroundColor: job.id === '1' ? '#FF0000' : '#D4A373' }]}>
             <Image source={{ uri: job.logo }} style={styles.jobLogo} resizeMode="contain" />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.badgeRow}>
                <View style={styles.typeBadge}>
                    <Ionicons name="briefcase-outline" size={12} color="white" style={{ marginRight: 4 }} />
                    <Text style={styles.typeBadgeText}>{job.type}</Text>
                </View>
            </View>
            <Text style={[styles.companyName, { color: colors.text }]}>{job.company}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
      
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{job.location}</Text>
      </View>
      
      <View style={styles.metaRow}>
        <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{job.salary}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.daysToApplyBadge}>
            <Text style={styles.daysToApplyText}>
              {job.daysLeft === 1 ? '1 day to apply' : `${job.daysLeft} days to apply`}
            </Text>
        </View>
        <TouchableOpacity onPress={onSave} style={[styles.bookmarkButton, { backgroundColor: colors.bglight01, borderColor: colors.gray250 }]}>
            <Ionicons name={job.isSaved ? "bookmark" : "bookmark-outline"} size={20} color={job.isSaved ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F4F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1A1C1E',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
  },
  tab: {
    paddingBottom: 8,
    position: 'relative',
  },
  activeTab: {
    // borderBottomWidth: 2,
    // borderBottomColor: '#5BB974',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#5BB974',
    borderRadius: 1,
  },
  filtersScrollView: {
    marginBottom: 20,
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    gap: 5,
  },
  filterText: {
    fontSize: 14,
    color: '#6C7278',
  },
  resultSummary: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultCount: {
    fontSize: 14,
    color: '#6C7278',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortByText: {
    fontSize: 14,
    color: '#6C7278',
  },
  sortValue: {
    color: '#1A1C1E',
    fontWeight: '600',
  },
  jobList: {
    paddingHorizontal: 20,
    gap: 15,
  },
  // Dropdown Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)', // Very light overlay
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 245 : 225, // Position below filters
    paddingHorizontal: 20,
  },
  dropdownContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 15,
  },
  selectedOptionText: {
    fontWeight: '700',
  },
  // Card Styles
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#F8FAF9', // Very light greenish tint
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logoAndHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  jobLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  jobLogo: {
    width: '80%',
    height: '80%',
  },
  headerInfo: {
    justifyContent: 'space-around',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  typeBadge: {
    backgroundColor: '#4E95FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  companyName: {
    fontSize: 14,
    color: '#1A1C1E',
    fontWeight: '500',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#6C7278',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  daysToApplyBadge: {
    backgroundColor: '#5A7C65',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  daysToApplyText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  bookmarkButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  }
});
