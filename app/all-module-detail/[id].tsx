import { ThemedText } from '@/components/themed-text';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { useFetchCourseById } from '@/hooks/useCourses';
import { useCoursesStore } from '@/store/courseStore';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { toast } from 'sonner-native';


export default function AllModuleDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useThemedColors();
  const [activeTab, setActiveTab] = useState<'Description' | 'Lessons' | 'Review'>('Description');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { currentUser, authToken } = useUserStore();
  const { subscribeToCourse, getUserCourseById, userCourses } = useCoursesStore();

  const { course: fetchedCourse, isLoading, error, refetch } = useFetchCourseById(typeof id === 'string' ? id : null, authToken || undefined);
  
  // Use userCourses in the dependency to ensure reactivity when the store updates
  const isSubscribed = React.useMemo(() => {
    return fetchedCourse?.id ? !!getUserCourseById(fetchedCourse.id.toString()) : false;
  }, [fetchedCourse, userCourses, getUserCourseById]);

  const handleSubscription = async () => {
    if (!fetchedCourse || !currentUser || !authToken) {
      console.log("Subscription aborted: Missing data", { fetchedCourse: !!fetchedCourse, currentUser: !!currentUser, authToken: !!authToken });
      return;
    }

    if (fetchedCourse.is_paid === 1 && !currentUser?.is_premium) {
      setShowPremiumModal(true);
      return;
    }

    try {
      console.log("Attempting subscription for course:", fetchedCourse.id, "User:", currentUser.id);
      const result = await subscribeToCourse(fetchedCourse.id.toString(), currentUser.id.toString());
      console.log("Subscription result:", result);
      
      if (result.success) {
        // Show success toast
        toast.success(result.message || "Successfully enrolled!");
        // refetch() is good to have, but the store update already triggers reactivity for isSubscribed
        refetch();
      } else {
        toast.error(result.message || "Failed to enroll");
      }
    } catch (err: any) {
      console.error("Caught error in handleSubscription:", err);
      toast.error("An error occurred during subscription");
    }
  };

  const handleStartCourse = () => {
    if (fetchedCourse) {
      router.push(`/module-detail/${fetchedCourse.id}`);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !fetchedCourse) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 }}>
        <ThemedText style={{ textAlign: 'center', color: colors.textSecondary }}>
          {error || "Course not found"}
        </ThemedText>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.subscribeButton, { backgroundColor: colors.primary, width: 'auto', paddingHorizontal: 20, marginTop: 20 }]}
        >
          <Text style={{ color: 'white' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Map fetched data to what the component expects
  const courseData = {
    title: fetchedCourse.title,
    rating: fetchedCourse.averageRating || 0,
    ratingCount: fetchedCourse.reviewCount || 0,
    studentCount: (fetchedCourse as any).students || 0,
    description: fetchedCourse.description,
    instructor: {
      name: fetchedCourse.instructor?.name || "Unknown Instructor",
      avatar: fetchedCourse.instructor?.image 
        ? { uri: fetchedCourse.instructor.image } 
        : (fetchedCourse.thumbnail ? { uri: fetchedCourse.thumbnail } : require('@/assets/images/woman.png')),
    },
    lessons: (fetchedCourse.resources || []).map((res: any, index: number) => ({
      id: res.id?.toString() || index.toString(),
      title: res.title || "Untitled Lesson",
      duration: res.duration ? `${Math.floor(res.duration / 60)}:00 mins` : "0:00 mins", 
      section: index === 0 ? 'Section 1 | Course Components' : undefined
    })),
    reviews: (fetchedCourse.reviews || []).map((rev: any) => ({
      id: rev.id?.toString() || Math.random().toString(),
      name: rev.name || "Anonymous",
      time: rev.review_date || "Recently",
      rating: rev.rating || 0,
      text: rev.comment || "",
      avatar: rev.image ? { uri: rev.image } : require('@/assets/images/woman.png'),
    }))
  };

  const renderDescription = () => (
    <View style={styles.tabContent}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>About Module</ThemedText>
      
      <View style={styles.metaRow}>
        <Ionicons name="play-circle-outline" size={20} color={colors.text} />
        <ThemedText style={styles.metaText}>{fetchedCourse.duration}hrs of Screen time</ThemedText>
      </View>
        {
          fetchedCourse.has_certificate ?
      <View style={styles.metaRow}>
          <Ionicons name="ribbon-outline" size={20} color={colors.text} />
        <ThemedText style={styles.metaText}>Certificate of Completion</ThemedText>
      </View>
        : null
        }
      <View style={styles.metaRow}>
        <Ionicons name="book-outline" size={20} color={colors.text} />
        <ThemedText style={styles.metaText}>{fetchedCourse.resources.length} Downloadable Resourse</ThemedText>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="star-outline" size={20} color={colors.text} />
        <ThemedText style={styles.metaText}>{fetchedCourse.points} Points</ThemedText>
      </View>

      <ThemedText style={styles.descriptionText} numberOfLines={isExpanded ? undefined : 2}>
        {courseData.description}
      </ThemedText>
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
        <ThemedText style={{ color: colors.primary, marginTop: 4 }}>
          {isExpanded ? 'See Less' : 'See More'}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={isSubscribed ? handleStartCourse : handleSubscription}
        style={[styles.subscribeButton, { backgroundColor: '#5B7E68' }]}
      >
        <Text style={styles.subscribeButtonText}>{isSubscribed ? 'Start Now' : 'Enroll Now'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLessons = () => (
    <View style={styles.tabContent}>
        <View style={styles.lessonsHeader}>
            <ThemedText type="subtitle">Lessons</ThemedText>
            <ThemedText style={{color: colors.textSecondary, fontSize: 12}}>{courseData.lessons.length} Modules</ThemedText>
        </View>
        
      {courseData.lessons.map((lesson: any, index: number) => (
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
                      {(lesson as any).isTrophy && <Text>🏆</Text>}
                  </View>
                  <ThemedText style={styles.lessonDuration}>Videos - {lesson.duration}</ThemedText>
              </View>
               {/* <Ionicons name="arrow-down-circle" size={24} color={colors.text} /> */}
           </View>
        </View>
      ))}

      <TouchableOpacity 
        onPress={isSubscribed ? handleStartCourse : handleSubscription}
        style={[styles.subscribeButton, { backgroundColor: '#5B7E68', marginTop: 20 }]}
      >
        <Text style={styles.subscribeButtonText}>{isSubscribed ? 'Start Now' : 'Enroll Now'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReviews = () => (
     <View style={styles.tabContent}>
       <ThemedText type="subtitle" style={{marginBottom: 16}}>Reviews</ThemedText>
      {courseData.reviews.length > 0 ? (
        courseData.reviews.map((review:any) => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <View style={styles.avatar} className='overflow-hidden'>
                <Image
                  source={review.avatar} 
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  contentFit="cover"
                />
              </View>
              <View>
                  <ThemedText style={styles.reviewName}>{review.name}</ThemedText>
              </View>
              <ThemedText style={styles.reviewTime}>{review.time}</ThemedText>
            </View>
            <ThemedText style={styles.reviewText}>{review.text}</ThemedText>
          </View>
        ))
      ) : (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ThemedText style={{ color: colors.textSecondary, textAlign: 'center' }}>
            There are no reviews for this module yet.
          </ThemedText>
        </View>
      )}
      
       <TouchableOpacity 
        onPress={isSubscribed ? handleStartCourse : handleSubscription}
        style={[styles.subscribeButton, { backgroundColor: '#5B7E68', marginTop: 20 }]}
      >
        <Text style={styles.subscribeButtonText}>{isSubscribed ? 'Start Course' : 'Enroll Now'}</Text>
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
                 source={courseData.instructor.avatar} 
                 style={{
                   width: '100%',
                   height: '100%',
                 }}
                 contentFit="cover"
                 transition={500}
               />
            </View>
            <View>
                <ThemedText className='m-0 p-0' style={{color: '#4A90E2', fontSize: 12, fontWeight: '600'}}>Mentor</ThemedText>
                <ThemedText className='-mt-2 p-0' style={{fontWeight: 'bold', fontSize: 16}}>{courseData.instructor.name}</ThemedText>
            </View>
         </View>

        {/* Hero Image */}
         <Image
          source={fetchedCourse.thumbnail ? { uri: fetchedCourse.thumbnail } : require('@/assets/images/woman.png')} 
          style={styles.heroImage}
          contentFit="cover"
          transition={500}
        />
        {/* Note: Using a placeholder if specific image not found, will rely on what's available or use a color block */}

        <View style={styles.contentContainer} className='-mt-2'>
            <ThemedText type="subtitle" style={styles.title}>{courseData.title}</ThemedText>
            
            <View style={styles.ratingRow}>
                <View style={{flexDirection: 'row', gap: 2}}>
                    {[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={16} color={i <= Math.round(courseData.rating) ? "#FBBC05" : "#CCC"} />)}
                </View>
                <ThemedText style={{fontWeight: 'bold', marginLeft: 4}}>{courseData.rating}</ThemedText>
                <ThemedText style={{color: colors.textSecondary, fontSize: 12}}>({courseData.ratingCount} ratings)</ThemedText>
                <View style={{flex:1}} />
                <ThemedText style={{color: colors.textSecondary, fontSize: 12}}>{courseData.studentCount} students</ThemedText>
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

      {/* Premium Upgrade Modal */}
      <Modal
        visible={showPremiumModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPremiumModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
             <View style={styles.modalIconContainer}>
                <Ionicons name="lock-closed" size={40} color={colors.primary} />
             </View>
            <ThemedText type="subtitle" style={styles.modalTitle}>Premium Module</ThemedText>
            <ThemedText style={styles.modalDescription}>
              This module is exclusive to premium members. Upgrade your account to access professional skills, mentor support, and more.
            </ThemedText>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => setShowPremiumModal(false)}
                style={[styles.modalButton, { backgroundColor: colors.bglight01 }]}
              >
                <ThemedText style={{ fontWeight: '600' }}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => {
                    setShowPremiumModal(false);
                    router.push("/reward-points"); // Or whichever screen handles premium
                }}
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Upgrade Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
  },
  modalContent: {
      width: '100%',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center'
  },
  modalIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#5A7C651A',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12
  },
  modalDescription: {
      textAlign: 'center',
      color: '#666',
      lineHeight: 20,
      marginBottom: 24
  },
  modalButtons: {
      flexDirection: 'row',
      gap: 12,
      width: '100%'
  },
  modalButton: {
      flex: 1,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center'
  }
});
