import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, SafeAreaView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { useJobs } from '@/hooks/use-jobs';
import { ApplicationModal } from '@/components/ApplicationModal';
import { useState } from 'react';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useThemedColors();
  const { jobs, toggleSaveJob, applyForJob } = useJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const job = jobs.find(j => j.id === id);

  const handleApplySuccess = async (cvUrl: string, coverLetter: string) => {
    if (job) {
      await applyForJob(job.id, cvUrl, coverLetter);
    }
  };

  if (!job) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Job not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1A1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Job Header Info */}
        <View style={styles.jobTopInfo}>
          <View style={[styles.logoContainer, { backgroundColor: job.id === '1' ? '#FF0000' : '#D4A373' }]}>
            <Image source={{ uri: job.logo }} style={styles.logo} resizeMode="contain" />
          </View>
          
          <View style={styles.typeBadgeRow}>
            <View style={styles.typeBadge}>
               <Ionicons name="briefcase-outline" size={14} color="white" style={{ marginRight: 6 }} />
               <Text style={styles.typeBadgeText}>{job.type}</Text>
            </View>
          </View>
          
          <Text style={styles.companyNameSmall}>{job.company}</Text>
          <Text style={styles.jobTitle}>{job.title}</Text>
          
          <View style={styles.metaRow}>
             <Ionicons name="location-outline" size={32} color="#1A1C1E" />
             <Text style={styles.metaLabelText}>{job.location}</Text>
          </View>
          
          <View style={styles.metaRow}>
             <Ionicons name="cash-outline" size={32} color="#1A1C1E" />
             <Text style={styles.metaLabelText}>{job.salary}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.applyButton, job.isApplied && styles.appliedButton]} 
            onPress={() => setIsModalOpen(true)}
            disabled={job.isApplied}
          >
            <Feather name="external-link" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.applyButtonText}>{job.isApplied ? "Applied" : "Apply Now"}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, job.isSaved && styles.savedButton]} 
            onPress={() => toggleSaveJob(job.id)}
          >
            <Ionicons name={job.isSaved ? "bookmark" : "bookmark-outline"} size={20} color="#5A7C65" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>{job.isSaved ? "Saved" : "Save"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Content Sections */}
        <Section title="Job Summary" content={job.summary} />
        
        <SectionList title="Key Responsibilities" items={job.responsibilities} />
        
        <SectionList title="Requirements & Skills" items={job.requirements} />
        
        <SectionList title="Key Competencies" items={job.competencies} />
        
        <SectionList title="Benefits (may vary by location)" items={job.benefits} />

        {/* Footer Info Pills */}
        <View style={styles.footerPills}>
            <View style={styles.pill}>
                <Ionicons name="location-outline" size={18} color="#5A7C65" />
                <Text style={styles.pillText}>{job.location}</Text>
            </View>
            <View style={styles.pill}>
                <Ionicons name="cash-outline" size={18} color="#5A7C65" />
                <Text style={styles.pillText}>{job.salary}</Text>
            </View>
            <View style={styles.pill}>
                <Ionicons name="briefcase-outline" size={18} color="#5A7C65" />
                <Text style={styles.pillText}>{job.type}</Text>
            </View>
        </View>

        {/* External Links */}
        <View style={styles.linksRow}>
            <TouchableOpacity style={styles.linkButton}>
                <Text style={styles.linkText}>Report Job</Text>
                <Ionicons name="share-social-outline" size={20} color="#4E95FF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => job.website && job.website !== '#' && Linking.openURL(job.website)}
            >
                <Text style={styles.linkText}>Company website</Text>
                <Ionicons name="link-outline" size={20} color="#4E95FF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
        </View>
      </ScrollView>

      <ApplicationModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={job}
        onSuccess={handleApplySuccess}
      />
    </SafeAreaView>
  );
}

function Section({ title, content }: { title: string, content: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );
}

function SectionList({ title, items }: { title: string, items: string[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.sectionContent}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  jobTopInfo: {
    paddingVertical: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '70%',
    height: '70%',
  },
  typeBadgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: '#4E95FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  companyNameSmall: {
    fontSize: 18,
    color: '#1A1C1E',
    fontWeight: '600',
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  metaLabelText: {
    fontSize: 16,
    color: '#6C7278',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  applyButton: {
    flex: 1,
    height: 54,
    backgroundColor: '#5A7C65',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appliedButton: {
    backgroundColor: '#9EA3A7',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    height: 54,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedButton: {
    borderColor: '#5BB974',
  },
  saveButtonText: {
    color: '#1A1C1E',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F4F5',
    marginVertical: 10,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 15,
    color: '#6C7278',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    paddingLeft: 5,
    marginBottom: 5,
    gap: 10,
  },
  bullet: {
    fontSize: 15,
    color: '#6C7278',
  },
  footerPills: {
    marginTop: 30,
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5A7C65',
    gap: 10,
  },
  pillText: {
    fontSize: 16,
    color: '#5A7C65',
    fontWeight: '600',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#4E95FF',
    fontWeight: '600',
  }
});
