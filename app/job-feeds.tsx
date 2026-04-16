import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/use-themed-colors';

export default function JobFeeds() {
  const router = useRouter();
  const colors = useThemedColors();

  const jobs = [
    { 
      id: '1', 
      title: 'Community Outreach Coordinator', 
      company: 'GreenEarth NGO', 
      location: 'London, UK (Remote)', 
      salary: '£32k - £38k',
      type: 'Full-time',
      time: '2h ago'
    },
    { 
      id: '2', 
      title: 'Junior Web Developer', 
      company: 'TechFlow Solutions', 
      location: 'Manchester, UK', 
      salary: '£28k - £35k',
      type: 'Full-time',
      time: '5h ago'
    },
    { 
      id: '3', 
      title: 'Social Media Manager', 
      company: 'Creative Pulse', 
      location: 'Bristol, UK (Hybrid)', 
      salary: '£30k - £34k',
      type: 'Contract',
      time: '1d ago'
    },
    { 
      id: '4', 
      title: 'Youth Mentor', 
      company: 'Future Bright', 
      location: 'Birmingham, UK', 
      salary: '£25k - £29k',
      type: 'Part-time',
      time: '2d ago'
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Job Feeds</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>Search opportunities...</Text>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={styles.activeTabText}>Relevant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={[styles.tabText, { color: colors.textSecondary }]}>Recent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={[styles.tabText, { color: colors.textSecondary }]}>Saved</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.jobList}>
          {jobs.map((job) => (
            <TouchableOpacity 
              key={job.id} 
              style={[styles.jobCard, { backgroundColor: colors.modalBg }]}
            >
              <View style={styles.jobHeader}>
                <View style={styles.companyLogo}>
                  <Text style={styles.logoText}>{job.company.charAt(0)}</Text>
                </View>
                <View style={styles.jobTitleContainer}>
                  <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
                  <Text style={[styles.companyName, { color: colors.textSecondary }]}>{job.company}</Text>
                </View>
                <TouchableOpacity>
                   <Ionicons name="bookmark-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.jobMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{job.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{job.salary}</Text>
                </View>
              </View>

              <View style={styles.jobFooter}>
                <View style={[styles.typeBadge, { backgroundColor: colors.backgroundBg }]}>
                  <Text style={[styles.typeBadgeText, { color: colors.text }]}>{job.type}</Text>
                </View>
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>{job.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#5A7C65',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  tabText: {
    fontWeight: '600',
  },
  jobList: {
    gap: 16,
  },
  jobCard: {
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#5A7C6520',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5A7C65',
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 14,
  },
  jobMeta: {
    gap: 8,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
  },
});
