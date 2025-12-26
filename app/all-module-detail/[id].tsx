import { ThemedText } from '@/components/themed-text';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Mock Data for the details page (can be moved to a separate file later)
const MOCK_DETAILS = {
  title: 'Financial literacy and budgeting',
  rating: 4.6,
  ratingCount: 1265,
  studentCount: 3547,
  description: 'Learn how to make smart money moves! This module teaches you the basics of budgeting, saving, spending wisely, and understanding things like credit, debt, and banking. You will gain the skills to manage your personal finances confidently.',
  instructor: {
    name: 'Andrew Dickson',
    avatar: require('@/assets/images/woman.png'),
  },
  lessons: [
    { id: '1', title: 'Course Outline', duration: '07:00 mins', section: 'Section 1 | Intro to Financial Literacy' },
    { id: '2', title: 'Intro to finances', duration: '07:00 mins' },
    { id: '3', title: 'Advanced budgeting', duration: '10:00 mins' },
    { id: '4', title: 'Investing basics', duration: '15:00 mins' },
    { id: '5', title: 'Retirement planning', duration: '12:00 mins', isTrophy: true },
    { id: '6', title: 'Assessment', duration: '07:00 mins', section: 'Section 2 | Assessment' },
  ],
  reviews: [
    { id: '1', name: 'Tracy Evans', time: '1 day Ago', rating: 4.6, text: 'Learn how to make smart money moves! This module teaches you the basics of budgeting, saving, spending wisely, and understanding things like credit.', avatar: require('@/assets/images/woman.png'), },
    { id: '2', name: 'Tracy Evans', time: '1 day Ago', rating: 4.6, text: 'Learn how to make smart money moves! This module teaches you the basics of budgeting, saving, spending wisely, and understanding things like credit.', avatar: require('@/assets/images/woman.png'), },
  ]
};

export default function AllModuleDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useThemedColors();
  const [activeTab, setActiveTab] = useState<'Description' | 'Lessons' | 'Review'>('Description');

  const renderDescription = () => (
    <View style={styles.tabContent}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>About Module</ThemedText>
      
      <View style={styles.metaRow}>
        <Ionicons name="play-circle-outline" size={20} color={colors.text} />
        <ThemedText style={styles.metaText}>24hrs of Screen time</ThemedText>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="ribbon-outline" size={20} color={colors.text} />
        <ThemedText style={styles.metaText}>Certificate of Completion</ThemedText>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="book-outline" size={20} color={colors.text} />
        <ThemedText style={styles.metaText}>15 Downloadable Resourse</ThemedText>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="star-outline" size={20} color={colors.text} />
        <ThemedText style={styles.metaText}>15 Points</ThemedText>
      </View>

      <ThemedText style={styles.descriptionText}>
        {MOCK_DETAILS.description}
      </ThemedText>
      <ThemedText style={{ color: colors.primary, marginTop: 4 }}>See More</ThemedText>

      <TouchableOpacity style={[styles.subscribeButton, { backgroundColor: '#5B7E68' }]}>
        <Text style={styles.subscribeButtonText}>Subscribe</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLessons = () => (
    <View style={styles.tabContent}>
        <View style={styles.lessonsHeader}>
            <ThemedText type="subtitle">Lessons</ThemedText>
            <ThemedText style={{color: colors.textSecondary, fontSize: 12}}>7 Sections</ThemedText>
        </View>
        
      {MOCK_DETAILS.lessons.map((lesson, index) => (
        <View key={lesson.id} style={{marginBottom: 16}}>
            {lesson.section && (
                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitleText}>{lesson.section}</ThemedText>
                    {/* <Ionicons name="arrow-down-circle" size={20} color={colors.text} /> */}
                </View>
            )}
           
           <View style={styles.lessonItem}>
              <ThemedText style={styles.lessonIndex}>{index + 1}</ThemedText>
              <View style={{flex: 1}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                      <ThemedText style={styles.lessonTitle}>{lesson.title}</ThemedText>
                      {lesson.isTrophy && <Text>🏆</Text>}
                  </View>
                  <ThemedText style={styles.lessonDuration}>Videos - {lesson.duration}</ThemedText>
              </View>
               {/* <Ionicons name="arrow-down-circle" size={24} color={colors.text} /> */}
           </View>
        </View>
      ))}

      <TouchableOpacity style={[styles.subscribeButton, { backgroundColor: '#5B7E68', marginTop: 20 }]}>
        <Text style={styles.subscribeButtonText}>Subscribe</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
       <ThemedText type="subtitle" style={{marginBottom: 16}}>Reviews</ThemedText>
      {MOCK_DETAILS.reviews.map((review) => (
        <View key={review.id} style={styles.reviewItem}>
          <View style={styles.reviewHeader}>
            <View style={styles.avatar} className='overflow-hidden'>
              <Image
                source={review.avatar} 
                style={{
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="cover"
              />
            </View>
            <View>
                <ThemedText style={styles.reviewName}>{review.name}</ThemedText>
                {/* <View style={{flexDirection:'row', alignItems:'center', gap: 4}}>
                    <ThemedText>{review.rating}</ThemedText>
                    <Ionicons name="star" size={14} color="#FBBC05" />
                </View> */}
            </View>
            <ThemedText style={styles.reviewTime}>{review.time}</ThemedText>
          </View>
          <ThemedText style={styles.reviewText}>{review.text}</ThemedText>
        </View>
      ))}
      
       <TouchableOpacity style={[styles.subscribeButton, { backgroundColor: '#5B7E68', marginTop: 20 }]}>
        <Text style={styles.subscribeButtonText}>Subscribe</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} 
          className="w-10 h-10 rounded-full items-center justify-center bg-[#5A7C651A] dark:bg-[#5A7C651A]">
            <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <Path fill-rule="evenodd" clip-rule="evenodd" d="M7.01813 11.3895C6.89044 11.2616 6.81873 11.0883 6.81873 10.9076C6.81873 10.7269 6.89044 10.5537 7.01813 10.4258L13.8363 3.60763C13.8987 3.54064 13.974 3.48692 14.0576 3.44965C14.1413 3.41238 14.2316 3.39235 14.3231 3.39073C14.4147 3.38912 14.5056 3.40596 14.5905 3.44025C14.6754 3.47454 14.7525 3.52558 14.8173 3.59032C14.882 3.65507 14.933 3.73219 14.9673 3.81709C15.0016 3.90199 15.0185 3.99292 15.0168 4.08447C15.0152 4.17602 14.9952 4.2663 14.9579 4.34994C14.9207 4.43358 14.8669 4.50885 14.7999 4.57127L8.46358 10.9076L14.7999 17.244C14.8669 17.3064 14.9207 17.3817 14.9579 17.4653C14.9952 17.549 15.0152 17.6392 15.0168 17.7308C15.0185 17.8223 15.0016 17.9133 14.9673 17.9982C14.933 18.0831 14.882 18.1602 14.8173 18.2249C14.7525 18.2897 14.6754 18.3407 14.5905 18.375C14.5056 18.4093 14.4147 18.4261 14.3231 18.4245C14.2316 18.4229 14.1413 18.4029 14.0576 18.3656C13.974 18.3284 13.8987 18.2746 13.8363 18.2076L7.01813 11.3895Z" fill="#5A7C65" fill-opacity="0.5"/>
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Instructor Info */}
        <View style={styles.instructorContainer}>
           <View style={styles.instructorAvatar} className='overflow-hidden'>
              <Image
                source={MOCK_DETAILS.instructor.avatar} 
                style={{
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="cover"
              />
           </View>
           <View>
               <ThemedText style={{color: '#4A90E2', fontSize: 12, fontWeight: '600'}}>Instructor</ThemedText>
               <ThemedText style={{fontWeight: 'bold', fontSize: 16}}>{MOCK_DETAILS.instructor.name}</ThemedText>
           </View>
        </View>

        {/* Hero Image */}
        <Image
          source={require('@/assets/images/woman.png')} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        {/* Note: Using a placeholder if specific image not found, will rely on what's available or use a color block */}

        <View style={styles.contentContainer}>
            <ThemedText type="title" style={styles.title}>{MOCK_DETAILS.title}</ThemedText>
            
            <View style={styles.ratingRow}>
                <View style={{flexDirection: 'row', gap: 2}}>
                    {[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={16} color="#FBBC05" />)}
                </View>
                <ThemedText style={{fontWeight: 'bold', marginLeft: 4}}>4.6</ThemedText>
                <ThemedText style={{color: colors.textSecondary, fontSize: 12}}>({MOCK_DETAILS.ratingCount} ratings)</ThemedText>
                <View style={{flex:1}} />
                <ThemedText style={{color: colors.textSecondary, fontSize: 12}}>{MOCK_DETAILS.studentCount}students</ThemedText>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {(['Description', 'Lessons', 'Review'] as const).map((tab) => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <ThemedText style={[styles.tabText, activeTab === tab && {color: '#4A90E2'}]}>{tab}</ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'Description' && renderDescription()}
            {activeTab === 'Lessons' && renderLessons()}
            {activeTab === 'Review' && renderReviews()}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 5,
    marginBottom: 10,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#F0F0F0', // Light gray background for back button
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 16,
      gap: 12
  },
  instructorAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#D9D9D9'
  },
  heroImage: {
    width: '90%',
    height: 200,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#333' // Placeholder color
  },
  contentContainer: {
      paddingHorizontal: 20,
  },
  title: {
      fontSize: 22,
      marginBottom: 8,
  },
  ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 20,
  },
  tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
  },
  tabButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
  },
  activeTabButton: {
      backgroundColor: '#E8F1FF'
  },
  tabText: {
      fontWeight: '600',
      color: '#888'
  },
  tabContent: {
      marginTop: 0,
  },
  sectionTitle: {
      fontSize: 18,
      marginBottom: 16
  },
  metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
  },
  metaText: {
      fontSize: 14,
      fontWeight: '500'
  },
  descriptionText: {
      lineHeight: 22,
      color: '#555',
      marginTop: 8
  },
  subscribeButton: {
      height: 50,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 20
  },
  subscribeButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600'
  },
  // Lessons Styles
  lessonsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
  },
  sectionTitleText: {
      fontSize: 12,
      color: '#666',
      fontWeight: '500'
  },
  lessonItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 16
  },
  lessonIndex: {
      fontSize: 24, 
      fontWeight: 'bold', 
      width: 30
  },
  lessonTitle: {
      fontSize: 16,
      fontWeight: '600'
  },
  lessonDuration: {
      fontSize: 12,
      color: '#888'
  },
  // Review Styles
  reviewItem: {
      marginBottom: 24
  },
  reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between', 
      alignItems: 'center', // Changed from flex-start to center for better alignment
      marginBottom: 8
  },
  avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#D9D9D9',
      marginRight: 12
  },
  reviewName: {
      fontWeight: 'bold',
      fontSize: 14
  },
  reviewTime: {
      marginLeft: 'auto',
      fontSize: 12,
      color: '#888'
  },
  reviewText: {
      color: '#444',
      lineHeight: 20,
      fontSize: 14, 
      marginTop: 4
  }
});
