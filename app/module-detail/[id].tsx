import { CertificateModal } from "@/components/CertificateModal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { useFetchCourseById } from "@/hooks/useCourses";
import { useResourceTracking } from "@/hooks/useResourceTracking";
import { courseService } from '@/services/api/apiServices';
import { useUserStore } from "@/store";
import { useCoursesStore } from '@/store/courseStore';
import Slider from '@react-native-community/slider';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { toast } from 'sonner-native';
import { CourseProp, Resource, Assessment, userCourseProp } from '@/store/courseStore';

// --- Types ---
type Tab = "lessons" | "resources" | "reviews";

interface LocalLesson {
  id: string;
  title: string;
  duration: string;
  status: "completed" | "current" | "locked";
  isSectionHeader?: boolean;
}

interface LocalUIResource {
  id: string;
  title: string;
  content: string;
}

interface LocalLessonResource extends LocalUIResource {
  status: 'completed' | 'not-started' | 'locked' | 'in-progress' | 'current';
  url?: string;
  has_quiz?: boolean;
  duration?: string;
  progress?: {
    is_completed: number;
    watched_duration: number;
  };
  parent_lesson_id?: number;
  parent_lesson_title?: string;
  has_module_quiz?: boolean;
  module_quiz_data?: any;
}

interface LocalReview {
  id: string;
  user: string;
  rating: number;
  time: string;
  comment: string;
  avatar: any;
}

// --- Icons ---
const BackIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlayIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <Path d="M8 5V19L19 12L8 5Z" fill={color} />
  </Svg>
);

const PauseIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <Path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill={color} />
  </Svg>
);

const ReplayIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 4v6h-6" />
    <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </Svg>
);

// Custom Rewind Icon matching the image style roughly
const RotateLeftIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
     <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
     <Path d="M3 3v5h5" />
  </Svg>
);


const FullScreenIcon = ({ color }: { color: string }) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </Svg>
);

const CheckCircleIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
  </Svg>
);

const XCircleIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
     <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
  </Svg>
);

const ChevronDownIcon = ({ color }: { color: string }) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M6 9l6 6 6-6" />
    </Svg>
);

const ChevronUpIcon = ({ color }: { color: string }) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 15l-6-6-6 6" />
    </Svg>
);

const NavigateFullscreenIcon = ({ color }: { color: string }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </Svg>
);

const NavigateMinimizeIcon = ({ color }: { color: string }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
    </Svg>
);


export default function ModuleDetailScreen() {
  const { id, justEnrolled } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemedColors();
  const [activeTab, setActiveTab] = useState<Tab>("lessons");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showEnrolledModal, setShowEnrolledModal] = useState(justEnrolled === 'true');
  
  const { currentUser, authToken } = useUserStore();

  // Dynamic course fetching
  const { course: fetchedCourse, isLoading, error, refetch } = useFetchCourseById(typeof id === 'string' ? id : null, authToken || undefined);
  const { getUserCourseById } = useCoursesStore();

  
  // State for Lessons/Resources
  const [lessons, setLessons] = useState<LocalLessonResource[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<{ [moduleId: string]: boolean }>({});

  // --- Resource Quiz State ---
  const [showResourceQuizInstructions, setShowResourceQuizInstructions] = useState(false);
  const [showResourceQuiz, setShowResourceQuiz] = useState(false);
  const [showResourceQuizSuccess, setShowResourceQuizSuccess] = useState(false);
  const [resourceQuizQuestionIndex, setResourceQuizQuestionIndex] = useState(0);
  const [resourceQuizSelectedOption, setResourceQuizSelectedOption] = useState<number | null>(null);
  const [activeQuizResource, setActiveQuizResource] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: number }>({});
  const [rewardedPoints, setRewardedPoints] = useState<number>(0);
  const [showResourceQuizFailure, setShowResourceQuizFailure] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<{ [questionId: string]: number }>({});
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [assessmentSelectedOption, setAssessmentSelectedOption] = useState<number | null>(null);
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  
  // --- Timer State for "Mark Complete" ---
  const [resourceViewTime, setResourceViewTime] = useState(0);
  const [canMarkComplete, setCanMarkComplete] = useState(false);

  const allResourcesWatched = useMemo(() => {
    return lessons.length > 0 && lessons.every(l => l.status === 'completed');
  }, [lessons]);

  const isCoursePassed = useMemo(() => {
    const userCourse = getUserCourseById(id?.toString() || "");
    const courseDetail = fetchedCourse?.course || fetchedCourse;
    const courseAssessments = Array.isArray(courseDetail?.assessments) 
      ? courseDetail.assessments 
      : (courseDetail?.assessments ? [courseDetail.assessments] : []);
    const anyAssessmentPassed = courseAssessments.some((a: any) => a.is_passed === 1 || a.is_passed === true);

    return !!(assessmentResult?.course_completed || userCourse?.assessment_status?.is_passed || anyAssessmentPassed);
  }, [assessmentResult, id, getUserCourseById, fetchedCourse]);

  const hasAttemptsLeft = useMemo(() => {
    // 1. Most accurate: result from a just-submitted assessment
    if (assessmentResult) {
      return (assessmentResult.remaining_attempts || 0) > 0;
    }

    // 2. Try reading from the course detail fetch (getCourseById) — most reliable on page load
    const courseDetail = fetchedCourse?.course || fetchedCourse;
    const courseAssessments = Array.isArray(courseDetail?.assessments)
      ? courseDetail.assessments
      : courseDetail?.assessments ? [courseDetail.assessments] : [];
    if (courseAssessments.length > 0) {
      const assessment = courseAssessments[0];
      // Backend typically returns attempts_used and max_attempts on the assessment object
      if (assessment?.max_attempts != null && assessment?.attempts_used != null) {
        return assessment.attempts_used < assessment.max_attempts;
      }
      // Alternatively, remaining_attempts might be directly on the assessment
      if (assessment?.remaining_attempts != null) {
        return (assessment.remaining_attempts || 0) > 0;
      }
    }

    // 3. Fallback: store data from /my-courses (least reliable — often missing counts)
    const userCourse = getUserCourseById(id?.toString() || "");
    const status = userCourse?.assessment_status;
    if (!status) return true;
    return status.max_attempts > 0 ? status.attempts_used < status.max_attempts : true;
  }, [assessmentResult, id, getUserCourseById, fetchedCourse]);


  // --- Resource Tracking ---
  const { handleVideoProgress, setCurrentResourceId, markAsComplete, setIsPlaying } = useResourceTracking(
    Number(id),
    currentLessonId ? Number(currentLessonId) : null,
    currentUser?.userId?.toString()
  );

  // Video State - MUST be declared before any conditional returns
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [shouldVideoPlay, setShouldVideoPlay] = useState(false);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    if (currentLessonId) {
      setCurrentResourceId(Number(currentLessonId));
      // Reset timer when lesson changes
      setResourceViewTime(0);
      setCanMarkComplete(false);
      
      const lesson = lessons.find(l => l.id === currentLessonId);
      if (lesson && lesson.parent_lesson_id) {
          setExpandedModules(prev => ({ ...prev, [lesson.parent_lesson_id!.toString()]: true }));
      }
    }
  }, [currentLessonId, lessons]);

  // --- Timer Effect ---
  useEffect(() => {
    let interval: any = null;
    
    if (status.isLoaded && status.isPlaying && !canMarkComplete) {
      interval = setInterval(() => {
        setResourceViewTime(prev => {
          const next = prev + 1;
          if (next >= 30) { // 30 seconds
            setCanMarkComplete(true);
            if (interval) clearInterval(interval);
          }
          return next;
        });
      }, 1000);
    } else if (status.isLoaded && !status.isPlaying && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [(status as any).isLoaded, (status as any).isPlaying, canMarkComplete]);

  // Update local lessons state when course is fetched
  useEffect(() => {
    if (fetchedCourse) {
      console.log('DEBUG: fetchedCourse updated:', JSON.stringify(fetchedCourse, null, 2));
    }
    
    // Flatten course.lessons (modules) -> lesson.resources (videos) into a flat array.
    // API shape:
    //   course.lessons[]         = modules (accordion headers)
    //   course.lessons[].resources[] = individual video resources to play
    const getAllResources = (sourceDetail: any) => {
      if (!sourceDetail) return [];
      const allResources: any[] = [];
      
      if (Array.isArray(sourceDetail.lessons)) {
        sourceDetail.lessons.forEach((lesson: any) => {
          if (Array.isArray(lesson.resources)) {
            lesson.resources.forEach((res: any) => {
              allResources.push({
                ...res,
                parent_lesson_id: lesson.id,
                parent_lesson_title: lesson.title,
                has_module_quiz: !!lesson.quiz,
                module_quiz_data: lesson.quiz || null,
              });
            });
          }
        });
      }

      // Also handle any uncategorised top-level resources
      if (Array.isArray(sourceDetail.uncategorizedResources)) {
        allResources.push(...sourceDetail.uncategorizedResources);
      }
      return allResources;
    };

    const courseDetail = fetchedCourse?.course || fetchedCourse;
    const courseResources = getAllResources(courseDetail);

    if (courseResources.length > 0) {
      // Map course resources, merging in progress data
      // Note: progress is embedded directly on each resource from the API
      const transformedLessons = courseResources.map((res: any, index: number) => {
        // is_completed comes back as boolean true/false from API
        const isCompleted = res.progress?.is_completed === true || res.progress?.is_completed === 1;
        const prevResource = index > 0 ? courseResources[index - 1] : null;
        const prevCompleted = index === 0 || 
          prevResource?.progress?.is_completed === true ||
          prevResource?.progress?.is_completed === 1;
        
        return {
          ...res,
          id: res.id.toString(),
          status: isCompleted ? 'completed' : prevCompleted ? 'not-started' : 'locked',
        };
      });

      setLessons(transformedLessons);
      
      // Auto-expand the module that contains the first active (not yet completed) lesson
      const firstActiveLesson = transformedLessons.find(
        (l: any) => l.status === 'in-progress' || l.status === 'not-started'
      ) || transformedLessons[0];
      
      if (firstActiveLesson?.parent_lesson_id) {
        setExpandedModules({ [firstActiveLesson.parent_lesson_id.toString()]: true });
      }

      // If all lessons are completed, show the completion overlay
      const allCompleted = transformedLessons.every((l: any) => l.status === 'completed');
      if (allCompleted && !isCoursePassed && !isReviewing) {
        setShowCompletionOverlay(true);
      }

      // Set the first lesson as current if nothing is active yet
      if (transformedLessons.length > 0 && !currentLessonId) {
        // Prefer the first non-completed lesson, else fall back to lesson 0
        const firstIncomplete = transformedLessons.find((l: any) => l.status !== 'completed');
        setCurrentLessonId(firstIncomplete ? firstIncomplete.id : transformedLessons[0].id);
      }
    }
  }, [fetchedCourse, id, getUserCourseById, assessmentResult]);



  useEffect(() => {
    if (videoRef.current) {
        // Ensure loader shows immediately when switching lessons
        setIsVideoLoading(true);
    }
  }, [currentLessonId]);

  // Hide controls after timeout
  useEffect(() => {
    if (status.isLoaded && status.isPlaying && showControls) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, status]);

  // --- Helper to resolve relative image URIs ---
  const resolveImageUri = (uri: string | null | undefined) => {
    if (!uri) return null;
    if (uri.startsWith('http')) return { uri };
    
    // Derive base URL from API URL (e.g., https://lsc-api.accordiaharmony.org/api -> https://lsc-api.accordiaharmony.org/)
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://lsc-api.accordiaharmony.org/api';
    const baseUrl = apiUrl.replace(/\/api$/, '/');
    
    // Ensure we don't have double slashes
    const cleanUri = uri.startsWith('/') ? uri.substring(1) : uri;
    return { uri: `${baseUrl}${cleanUri}` };
  };

  const resolveVideoUri = (uri: string | null | undefined) => {
    if (!uri) return undefined;
    if (uri.startsWith('http')) return { uri };
    
    // Derive base URL from API URL
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://lsc-api.accordiaharmony.org/api';
    const baseUrl = apiUrl.replace(/\/api$/, '/');
    
    const cleanUri = uri.startsWith('/') ? uri.substring(1) : uri;
    return { uri: `${baseUrl}${cleanUri}` };
  };

  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];
  const videoSource = React.useMemo(() => resolveVideoUri(currentLesson?.url), [currentLesson?.url]);
  
  // Derived course object to maintain compatibility with existing render code
  const course = fetchedCourse ? { 
    ...fetchedCourse, 
    ...(fetchedCourse.course || {}),
    id: fetchedCourse.course?.id || fetchedCourse.id,
    instructor: fetchedCourse.course?.instructor?.name || fetchedCourse.instructor?.name || "Unknown Instructor",
    image: resolveImageUri(fetchedCourse.course?.thumbnail || fetchedCourse.thumbnail) || require("../../assets/images/woman.png"),
    assessments: Array.isArray(fetchedCourse.course?.assessments || fetchedCourse.assessments) 
      ? (fetchedCourse.course?.assessments || fetchedCourse.assessments) 
      : ((fetchedCourse.course?.assessments || fetchedCourse.assessments) 
          ? [fetchedCourse.course?.assessments || fetchedCourse.assessments] 
          : []),
    resources: lessons,
    reviews: (fetchedCourse.course?.reviews || fetchedCourse.reviews)?.map((r: any) => ({
      id: r.id.toString(),
      user: r.name || "Anonymous",
      time: r.review_date || "Recently",
      comment: r.comment,
      avatar: resolveImageUri(r.image) || require("../../assets/images/woman.png")
    })) || []
  } : null;


  console.log('[MODULE-DETAIL] course:', JSON.stringify(course, null, 2) , 'wherss');

  // Debug logging for assessments
  // console.log('[MODULE-DETAIL] fetchedCourse.assessments:', JSON.stringify(fetchedCourse?.assessments, null, 2));
  // console.log('[MODULE-DETAIL] course.assessments:', JSON.stringify(course?.assessments, null, 2));
  // console.log('[MODULE-DETAIL] course.assessments[0]?.questions:', JSON.stringify(course?.assessments?.[0]?.questions, null, 2));

  // Early returns AFTER all hooks
  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (error || !fetchedCourse || !course) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ThemedText style={{ textAlign: 'center', color: colors.textSecondary }}>
          {error || "Course not found"}
        </ThemedText>
        <Pressable 
          onPress={() => router.back()}
          style={[styles.primaryButton, { marginTop: 20, backgroundColor: colors.primary, width: 'auto', paddingHorizontal: 20 }]}
        >
          <Text style={{ color: 'white' }}>Go Back</Text>
        </Pressable>
      </ThemedView>
    );
  }


  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    // Check if video finished or is near end, if so replay
    if (status.isLoaded && (status.didJustFinish || (status.positionMillis >= status.durationMillis! - 100))) {
        await videoRef.current.replayAsync();
        setShouldVideoPlay(true);
        setIsPlaying(true);
        return;
    }

    if (status.isLoaded && status.isPlaying) {
        await videoRef.current.pauseAsync();
        setShouldVideoPlay(false);
        setIsPlaying(false);
    } else {
        await videoRef.current.playAsync();
        setShouldVideoPlay(true);
        setIsPlaying(true);
    }
  };


  const formatTime = (millis: number) => {
    if (!millis) return "0:00";
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleFullscreenToggle = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsFullscreen(false);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
      setIsFullscreen(true);
    }
  };

  const handleSeek = async (value: number) => {
    if (videoRef.current && status.isLoaded) {
        // Prevent seeking forward: only seek if value is less than current position
        // OR allow seeking anywhere but only UP TO what strictly requested?
        // Requirement: "prevent user from fast forwarding".
        // Usually means you can't jump ahead of where you are.
        // But if I already watched it, I might want to seek.
        // Simplest interpretation: Disable forward seeking relative to CURRENT playback time.
        
        if (value > status.positionMillis) {
            // Logic to prevent forward seek.
            // check if we want to allow forward seeking if it's within "buffered" or "watched"?
            // Simplest strict implementation:
             return; 
        }
        await videoRef.current.setPositionAsync(value);
    }
  };


  // Handle back with orientation reset
  const handleBack = async () => {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
      } else {
        router.back();
      }
  };
  // --- Logic ---
    const updateLessonStatus = (lessonId: string, newStatus: LocalLessonResource['status']) => {
        setLessons(prevLessons => prevLessons.map(l => 
            l.id === lessonId ? { ...l, status: newStatus } : l
        ));
    };

    const handlePlaybackStatusUpdate = async (newStatus: AVPlaybackStatus) => {
        setStatus(newStatus);
        if (!newStatus.isLoaded) {
            if ('error' in newStatus && (newStatus as any).error) {
                console.error(`Encountered a fatal error during playback: ${(newStatus as any).error}`);
            }
            return;
        }

        // console.log(`DEBUG: Video playback status updated: ${newStatus.positionMillis} / ${newStatus.durationMillis} (playing: ${newStatus.isPlaying})`);

        setIsBuffering(newStatus.isBuffering);
        setIsPlaying(newStatus.isPlaying);

        if (newStatus.isPlaying) {
            handleVideoProgress(newStatus.positionMillis, newStatus.durationMillis || 0);
        }

        if (newStatus.isPlaying && currentLessonId && (currentLesson.status === 'not-started' || currentLesson.status === 'current')) {
             updateLessonStatus(currentLessonId, 'in-progress');
        }

        if (newStatus.didJustFinish) {
            const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
            const currentLesson = lessons[currentIndex];
            const nextIndex = currentIndex + 1;
            const nextLesson = nextIndex < lessons.length ? lessons[nextIndex] : null;
            const isLastInModule = !nextLesson || nextLesson.parent_lesson_id !== currentLesson.parent_lesson_id;
            
            if (currentLesson.has_quiz) {
                setShouldVideoPlay(false);
                setActiveQuizResource(currentLesson);
                setShowResourceQuizInstructions(true);
            } else if (isLastInModule && currentLesson.has_module_quiz && currentLesson.module_quiz_data) {
                setShouldVideoPlay(false);
                setActiveQuizResource({
                    ...currentLesson,
                    title: `${currentLesson.parent_lesson_title} Quiz`,
                });
                setShowResourceQuizInstructions(true);
            } else {
                // No quiz - mark as completed and move to next
                setLessons(prevLessons => {
                    const newLessons = [...prevLessons];
                    newLessons[currentIndex] = { ...newLessons[currentIndex], status: 'completed' };
                    if (nextIndex < newLessons.length) {
                        newLessons[nextIndex] = { ...newLessons[nextIndex], status: 'in-progress' };
                    }
                    return newLessons;
                });

                if (nextIndex < lessons.length) {
                    setShowLoader(true);
                    setShouldVideoPlay(false);
                    setTimeout(() => {
                        setCurrentLessonId(lessons[nextIndex].id);
                        setShowLoader(false);
                        setShouldVideoPlay(true);
                    }, 2000);
                } else {
                    // Course completed
                    setShouldVideoPlay(false);
                    if (!isCoursePassed || isReviewing) {
                        setShowCompletionOverlay(true);
                    }
                }
            }
        }
    };
    
    const handleLessonPress = (lessonId: string) => {
        const targetLesson = lessons.find(l => l.id === lessonId);
        if (!targetLesson || targetLesson.status === 'locked') return;
        
        if (currentLesson.status === 'in-progress' && lessonId !== currentLessonId) {
             return;
        }

        // Disable module clicking if all resources watched but not reviewing
        if (allResourcesWatched && !isReviewing) {
            return;
        }

        setCurrentLessonId(lessonId);
        setShouldVideoPlay(true);
    };

  // const rewind15s = () => {
  //   if (videoRef.current && status.isLoaded) {
  //       videoRef.current.setPositionAsync(Math.max(0, status.positionMillis - 15000));
  //   }
  // };

  const onResourcePress = async (resId: string) => {
    // Check if previous resource watched logic
    const index = lessons.findIndex(l => l.id === resId);
    if (index > 0 && lessons[index-1].status !== 'completed') {
        // Optional: show a toast or alert that it's locked
        return;
    }

    setExpandedResource(expandedResource === resId ? null : resId);
    
    // If it's the current one and not completed, maybe we want to mark it as complete if it's text?
    // In this UI, 'resources' tab seems to be for non-video files/articles.
  };

  const handleManualComplete = async (resId: string) => {
      const targetLesson = lessons.find(l => l.id === resId);
      if (!targetLesson) return;

      const currentIndex = lessons.findIndex(l => l.id === resId);
      const nextIndex = currentIndex + 1;
      const nextLesson = nextIndex < lessons.length ? lessons[nextIndex] : null;
      const isLastInModule = !nextLesson || nextLesson.parent_lesson_id !== targetLesson.parent_lesson_id;

      // Check for quiz
      if (targetLesson.has_quiz) {
          setShouldVideoPlay(false);
          setActiveQuizResource(targetLesson);
          setShowResourceQuizInstructions(true);
      } else if (isLastInModule && targetLesson.has_module_quiz && targetLesson.module_quiz_data) {
          setShouldVideoPlay(false);
          setActiveQuizResource({
              ...targetLesson,
              title: `${targetLesson.parent_lesson_title} Quiz`,
          });
          setShowResourceQuizInstructions(true);
      } else {
          // Mark the resource as complete in the tracking hook
          await markAsComplete();
          
          // Update local status
          updateLessonStatus(resId, 'completed');
          
          moveToNextResource();
      }
  };

  const handleFinishCourse = () => {
     setShowInstructions(true);
  };

  const startAssessment = () => {
      setShowInstructions(false);
      setShowAssessment(true);
  };

  // --- Resource Quiz Handlers ---
  const handleSkipQuiz = async () => {
    try {
      if (activeQuizResource) {
        if (activeQuizResource.has_module_quiz) {
          await courseService.skipLessonQuiz(activeQuizResource.parent_lesson_id);
        } else {
          await courseService.skipResourceQuiz(activeQuizResource.id);
        }
      }
    } catch (error) {
      console.error('Failed to skip quiz:', error);
    }
    setShowResourceQuizInstructions(false);
    moveToNextResource();
  };

  const handleStartResourceQuiz = async () => {
    if (!activeQuizResource) return;
    
    try {
      if (activeQuizResource.has_module_quiz && activeQuizResource.module_quiz_data?.questions) {
        setQuizQuestions(activeQuizResource.module_quiz_data.questions);
        setResourceQuizQuestionIndex(0);
        setResourceQuizSelectedOption(null);
        setUserAnswers({});
        setShowResourceQuizInstructions(false);
        setShowResourceQuiz(true);
      } else {
        const response = await courseService.getResourceQuiz(activeQuizResource.id);
        if (response && response.questions) {
          setQuizQuestions(response.questions);
          setResourceQuizQuestionIndex(0);
          setResourceQuizSelectedOption(null);
          setUserAnswers({});
          setShowResourceQuizInstructions(false);
          setShowResourceQuiz(true);
        } else {
          console.error('No questions found for this quiz');
          moveToNextResource();
        }
      }
    } catch (error) {
      console.error('Failed to start resource quiz:', error);
    }
  };

  const handleResourceQuizNext = async () => {
    const currentQuestionData = quizQuestions[resourceQuizQuestionIndex];
    if (resourceQuizSelectedOption === null || !currentQuestionData) return;

    // Save answer
    const newUserAnswers = { 
      ...userAnswers, 
      [currentQuestionData.id]: resourceQuizSelectedOption 
    };
    setUserAnswers(newUserAnswers);

    if (resourceQuizQuestionIndex < quizQuestions.length - 1) {
      setResourceQuizQuestionIndex(prev => prev + 1);
      setResourceQuizSelectedOption(null);
    } else {
      // Quiz finished - Submit
      try {
        let response;
        if (activeQuizResource.has_module_quiz) {
          response = await courseService.submitLessonQuiz(activeQuizResource.parent_lesson_id, newUserAnswers);
        } else {
          response = await courseService.submitResourceQuiz(activeQuizResource.id, newUserAnswers);
        }
        console.log('[QUIZ] Submit response:', response);
        
        setQuizResult(response);
        
        if (response && (response.isPassed || response.passed)) {
          setRewardedPoints(response.pointsAwarded || response.points_rewarded || 0);
          setShowResourceQuiz(false);
          setShowResourceQuizSuccess(true);
        } else {
          setShowResourceQuiz(false);
          setShowResourceQuizFailure(true);
        }
      } catch (error) {
        console.error('Failed to submit resource quiz:', error);
      }
    }
  };

  const handleAssessmentNext = async () => {
    const activeAssessment = course.assessments?.[0];
    if (!activeAssessment || !activeAssessment.questions) return;
    
    const currentQ = activeAssessment.questions[currentQuestion];
    if (assessmentSelectedOption === null || !currentQ) return;

    // Save answer
    const newAnswers = { 
      ...assessmentAnswers, 
      [currentQ.id.toString()]: assessmentSelectedOption 
    };
    setAssessmentAnswers(newAnswers);

    if (currentQuestion < activeAssessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setAssessmentSelectedOption(null);
    } else {
      // Assessment finished - Submit
      await handleAssessmentSubmit(newAnswers);
    }
  };

  const handleAssessmentSubmit = async (answers: { [questionId: string]: number }) => {
    const activeAssessment = course.assessments?.[0];
    if (!activeAssessment || !authToken) return;

    setIsSubmittingAssessment(true);
    try {
      const result = await courseService.submitAssessment(
        activeAssessment.id,
        answers,
        authToken
      );
      console.log('[ASSESSMENT] Submit response:', result);
      setAssessmentResult(result);
      setShowAssessment(false);
      
      if (result.course_completed) {
        // Cascade completion to all resources
        try {
          console.log('[ASSESSMENT] Course completed. Marking all resources as complete...');
          await Promise.all(lessons.map(async (lesson) => {
            if (lesson.status !== 'completed') {
              return courseService.updateResourceProgress({
                resourceId: Number(lesson.id),
                userId: currentUser?.userId?.toString() || "",
                watchedDuration: Number(lesson.duration) || 0,
                totalDuration: Number(lesson.duration) || 0,
                isCompleted: true
              });
            }
            return Promise.resolve();
          }));
          console.log('[ASSESSMENT] All resources marked as complete.');
        } catch (error) {
          console.error('[ASSESSMENT] Failed to cascade resource completion:', error);
        }

        // Refresh course list to update global state
        if (currentUser?.userId) {
          // You might want to call refetch from hook or update store directly
        }
      }
    } catch (error: any) {
      console.error('Failed to submit assessment:', error);
      // Extract the backend's reason message if available
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to submit assessment. Please try again.";
      toast.error(backendMessage);
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  const handleRetakeAssessment = () => {
    setCurrentQuestion(0);
    setAssessmentSelectedOption(null);
    setAssessmentAnswers({});
    setAssessmentResult(null);
    setShowAssessment(true);
  };

  const handleRetakeCourse = async () => {
    try {
      if (!id || !authToken) return;
      
      const res = await courseService.retakeCourse(id.toString(), authToken);
      toast.success(res.message || "Course retake granted!");
      
      // Refresh course data from backend
      await refetch();
      
      setAssessmentResult(null);
      setIsReviewing(true);
      setCurrentLessonId(lessons[0]?.id || null);
      if (videoRef.current) {
        videoRef.current.setPositionAsync(0);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Failed to retake course. Please try again.";
      toast.error(msg);
      console.error("Failed to retake course:", error);
    }
  };

  const handleRetakeQuiz = () => {
    setResourceQuizQuestionIndex(0);
    setResourceQuizSelectedOption(null);
    setUserAnswers({});
    setShowResourceQuizFailure(false);
    setShowResourceQuiz(true);
  };

  const moveToNextResource = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < lessons.length) {
      setShowLoader(true);
      setShouldVideoPlay(false);
      setTimeout(() => {
        setCurrentLessonId(lessons[nextIndex].id);
        setShowLoader(false);
        setShouldVideoPlay(true);
      }, 2000);
    } else {
      setShouldVideoPlay(false);
      setShowCompletionOverlay(true);
    }
  };

  // console.dir(JSON.stringify(, null, 2), "course console");


  // --- Assessment Result View ---
  if (assessmentResult) {
    const isPassed = assessmentResult.is_passed;
    const remainingAttempts = assessmentResult.remaining_attempts;
    
    return (
      <ThemedView style={{ flex: 1 }}>
        <View style={[styles.videoHeader, { paddingTop: Math.max(insets.top, 10), backgroundColor: 'rgba(0,0,0,0.3)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }]}>
            <Pressable onPress={() => setAssessmentResult(null)} style={styles.videoBackButton}>
                <BackIcon color="white" />
            </Pressable>
        </View>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <View style={{ padding: 32, backgroundColor: colors.bglight01, borderRadius: 16, width: '100%', alignItems: 'center' }}>
            <View style={{ 
              width: 80, height: 80, borderRadius: 40, 
              backgroundColor: isPassed ? '#34A85322' : '#D32F2F22', 
              justifyContent: 'center', alignItems: 'center', marginBottom: 24 
            }}>
              {isPassed ? <CheckCircleIcon color="#34A853" /> : <XCircleIcon color="#D32F2F" />}
            </View>
            
            <ThemedText type="subtitle" style={{ marginBottom: 16, textAlign: 'center', color: isPassed ? '#34A853' : '#D32F2F' }}>
              {isPassed ? "Assessment Passed!" : "Assessment Failed"}
            </ThemedText>
            
            <ThemedText style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 8 }}>
              You scored {assessmentResult.score}/{assessmentResult.total_points} ({assessmentResult.percentage}%).
            </ThemedText>
            
            {!isPassed && (
              <ThemedText style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 24 }}>
                Remaining attempts: <ThemedText style={{ fontWeight: 'bold' }}>{remainingAttempts}</ThemedText>
              </ThemedText>
            )}

            <View style={{ gap: 16, width: '100%', marginTop: 16 }}>
              {isPassed ? (
                <>
                  <Pressable 
                    onPress={() => setAssessmentResult(null)}
                    style={[styles.primaryButton, { backgroundColor: colors.primary, width: '100%' }] as any}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Continue</Text>
                  </Pressable>
                  
                  {assessmentResult.certificate_issued && course.has_certificate === 1 && (
                    <Pressable 
                      onPress={() => { /* Logic to view certificate */ }}
                      style={[styles.primaryButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#527c65', width: '100%' }]}
                    >
                      <Text style={{ color: '#527c65', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>View Certificate</Text>
                    </Pressable>
                  )}
                </>
              ) : (
                <>
                  {remainingAttempts > 0 ? (
                    <Pressable 
                      onPress={handleRetakeAssessment}
                      style={[styles.primaryButton, { backgroundColor: '#527c65', width: '100%' }] as any}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Retake Assessment</Text>
                    </Pressable>
                  ) : (
                    <Pressable 
                      onPress={handleRetakeCourse}
                      style={[styles.primaryButton, { backgroundColor: '#527c65', width: '100%' }]}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Retake Course</Text>
                    </Pressable>
                  )}
                  
                  <Pressable 
                    onPress={() => setAssessmentResult(null)}
                    style={[styles.primaryButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#527c65', width: '100%' }]}
                  >
                    <Text style={{ color: '#527c65', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Close</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // --- Assessment Question View ---
  if (showAssessment) {
    const activeAssessment = course?.assessments?.[0];
    const questions = activeAssessment?.questions || [];
    const currentQ = questions[currentQuestion];
    
    if (!currentQ) {
      console.log("[ASSESSMENT] No question found at index", currentQuestion, "ActiveAssessment:", JSON.stringify(activeAssessment, null, 2));
      return (
        <ThemedView style={{ flex: 1, padding: 16 }}>
          <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ padding: 24, backgroundColor: colors.bglight01, borderRadius: 16, width: '100%', alignItems: 'center' }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
                <ThemedText style={{ fontSize: 40 }}>😕</ThemedText>
              </View>
              <ThemedText type="subtitle" style={{ marginBottom: 16, textAlign: 'center' }}>No Questions Found</ThemedText>
              <ThemedText style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 24 }}>
                Sorry, there are no questions available for this assessment yet.
              </ThemedText>
              <Pressable 
                onPress={() => setShowAssessment(false)}
                style={[styles.primaryButton, { backgroundColor: '#527c65', width: '100%' }]}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Go Back</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Pressable onPress={() => setShowAssessment(false)} style={styles.backButton}>
                 <BackIcon color={colors.text} />
            </Pressable>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
             <ThemedText type="subtitle" style={{ fontWeight: 'bold' }}>Course Assessment 📝</ThemedText>
             <ThemedText style={{ color: colors.textSecondary }}>
               Question <ThemedText style={{ fontWeight: 'bold', color: '#34A853' }}>{currentQuestion + 1}</ThemedText>/{activeAssessment?.questions.length}
             </ThemedText>
          </View>
          
          <View style={{ backgroundColor: '#527c65', padding: 20, borderRadius: 12, marginBottom: 20 }}>
             <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
               {currentQ.question_text}
             </ThemedText>
          </View>
          
          {(currentQ.options || []).map((opt: any, idx: number) => {
             const optionText = typeof opt === 'string' ? opt : opt.option_text;
             const optionId = typeof opt === 'string' ? idx : opt.id;
             
             return (
               <Pressable 
                  key={idx} 
                  onPress={() => setAssessmentSelectedOption(optionId)}
                  style={[
                      styles.optionCard, 
                      assessmentSelectedOption === optionId && { backgroundColor: '#E8F5E9', borderColor: '#527c65', borderWidth: 1 }
                  ]}
               >
                   <View style={[
                       styles.optionLetter, 
                       assessmentSelectedOption === optionId && { backgroundColor: '#527c65' }
                   ]}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>{String.fromCharCode(97 + idx)}</Text>
                   </View>
                   <ThemedText style={{ flex: 1, color: colors.textSecondary }}>{optionText}</ThemedText>
               </Pressable>
             );
          })}
          
          <View style={{ flex: 1 }} />
          
          <Pressable 
             onPress={handleAssessmentNext}
             disabled={assessmentSelectedOption === null || isSubmittingAssessment}
             style={[styles.primaryButton, { backgroundColor: '#527c65', opacity: (assessmentSelectedOption === null || isSubmittingAssessment) ? 0.6 : 1 }]}
          >
             {isSubmittingAssessment ? (
               <ActivityIndicator color="white" />
             ) : (
               <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                  {currentQuestion === questions.length - 1 ? "Submit Assessment" : "Next"}
               </Text>
             )}
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (showInstructions) {
      return (
        <ThemedView style={{ flex: 1, padding: 16 }}>
            <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{padding: 24, backgroundColor: colors.bglight01, borderRadius: 16, width: '100%', alignItems: 'center'}}>
                    <ThemedText type="subtitle" style={{marginBottom: 16, textAlign: 'center'}}>Assessment Instructions</ThemedText>
                    <ThemedText style={{textAlign: 'center', color: colors.textSecondary, marginBottom: 24}}>
                        Please read the questions carefully and answer carefully before going to the next question because there won't be able to go back to the previous question.
                    </ThemedText>
                    
                    <View style={{flexDirection: 'row', gap: 16, width: '100%'}}>
                        <Pressable 
                            onPress={() => setShowInstructions(false)}
                            style={[styles.primaryButton, {flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#527c65'}]}
                        >
                            <Text style={{color: '#527c65', fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>Cancel</Text>
                        </Pressable>
                        <Pressable 
                            onPress={startAssessment}
                            style={[styles.primaryButton, {flex: 1, backgroundColor: '#527c65'}]}
                        >
                            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>Start</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </ThemedView>
      );
  }

  if (showResourceQuizInstructions && activeQuizResource) {
    return (
        <ThemedView style={{ flex: 1, padding: 16 }}>
            <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{padding: 24, backgroundColor: colors.bglight01, borderRadius: 16, width: '100%', alignItems: 'center'}}>
                    <ThemedText type="subtitle" style={{marginBottom: 16, textAlign: 'center'}}>Resource Quiz</ThemedText>
                    <ThemedText style={{fontWeight: 'bold', marginBottom: 8, textAlign: 'center'}}>{activeQuizResource.title}</ThemedText>
                    <ThemedText style={{textAlign: 'center', color: colors.textSecondary, marginBottom: 24}}>
                        This resource has a quick quiz to test your knowledge. You can take it now or skip to the next lesson.
                    </ThemedText>
                    
                    <View style={{flexDirection: 'row', gap: 16, width: '100%'}}>
                        <Pressable 
                            onPress={handleSkipQuiz}
                            style={[styles.outlineButton, {flex: 1}]}
                        >
                            <Text style={{color: colors.primary, fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>Skip</Text>
                        </Pressable>
                        <Pressable 
                            onPress={handleStartResourceQuiz}
                            style={[styles.primaryButton, {flex: 1, backgroundColor: colors.primary}] as any}
                        >
                            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>Start Quiz</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </ThemedView>
    );
  }

  if (showResourceQuiz && activeQuizResource) {
    const currentQ = quizQuestions[resourceQuizQuestionIndex];
    if (!currentQ) return null;
    
    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <SafeAreaView style={{flex: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
            <Pressable onPress={() => {
                setShowResourceQuiz(false);
                setActiveQuizResource(null);
            }} style={styles.backButton}>
                 <BackIcon color={colors.text} />
            </Pressable>
          </View>
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
             <ThemedText type="subtitle" style={{fontWeight: 'bold'}}>Resource Quiz 📝</ThemedText>
             <ThemedText style={{color: colors.textSecondary}}>Question <ThemedText style={{fontWeight: 'bold', color: '#34A853'}}>{resourceQuizQuestionIndex + 1}</ThemedText>/{quizQuestions.length}</ThemedText>
          </View>
          
          <View style={{backgroundColor: colors.primary, padding: 20, borderRadius: 12, marginBottom: 20}}>
             <ThemedText style={{color: colors.white, fontWeight: 'bold', fontSize: 16}}>
               {currentQ.question_text || currentQ.question}
             </ThemedText>
          </View>
          
          {(currentQ.options || []).map((opt: any, idx: number) => {
             const optionText = typeof opt === 'string' ? opt : opt.option_text;
             const optionId = typeof opt === 'string' ? idx : opt.id;
             
             return (
               <Pressable 
                  key={idx} 
                  onPress={() => setResourceQuizSelectedOption(optionId)}
                  style={[
                      styles.optionCard, 
                      resourceQuizSelectedOption === optionId && { backgroundColor: '#34A85311', borderColor: colors.primary, borderWidth: 1 }
                  ]}
               >
                   <View style={[
                       styles.optionLetter, 
                       resourceQuizSelectedOption === optionId && { backgroundColor: '#527c65' }
                   ]}>
                      <Text style={{color: 'white', fontWeight: 'bold'}}>{String.fromCharCode(97 + idx)}</Text>
                   </View>
                   <ThemedText style={{flex: 1, color: colors.textSecondary}}>{optionText}</ThemedText>
               </Pressable>
             );
          })}
          
          <View style={{flex: 1}} />
          
          <Pressable 
             onPress={handleResourceQuizNext}
             disabled={resourceQuizSelectedOption === null}
             style={[styles.primaryButton, {backgroundColor: colors.primary, opacity: resourceQuizSelectedOption === null ? 0.6 : 1}]}
          >
             <Text style={{color: colors.white, fontWeight: 'bold', fontSize: 16}}>
                {resourceQuizQuestionIndex === quizQuestions.length - 1 ? "Finish" : "Next"}
             </Text>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (showResourceQuizSuccess) {
    return (
        <ThemedView style={{ flex: 1, padding: 16 }}>
            <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{padding: 32, backgroundColor: colors.bglight01, borderRadius: 16, width: '100%', alignItems: 'center'}}>
                    <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#34A85322', justifyContent: 'center', alignItems: 'center', marginBottom: 24}}>
                        <CheckCircleIcon color="#34A853" />
                    </View>
                    <ThemedText type="subtitle" style={{marginBottom: 16, textAlign: 'center'}}>
                      {quizResult?.message || "Quiz Passed!"}
                    </ThemedText>
                    <ThemedText style={{textAlign: 'center', color: colors.textSecondary, marginBottom: 16}}>
                        Great job! You scored {quizResult?.score}/{quizResult?.total}.
                    </ThemedText>
                    
                    {rewardedPoints > 0 && (
                      <View style={{backgroundColor: '#34A85311', padding: 16, borderRadius: 12, marginBottom: 20, alignItems: 'center', width: '100%'}}>
                        <ThemedText style={{color: '#34A853', fontWeight: 'bold', fontSize: 18}}>+{rewardedPoints} Points Awarded!</ThemedText>
                        <ThemedText style={{color: colors.primary, fontSize: 12}}>Successfully Added to your account</ThemedText>
                      </View>
                    )}

                    {quizResult?.newTotal && (
                      <View style={{ marginBottom: 32, alignItems: 'center' }}>
                         <ThemedText style={{ color: colors.textSecondary, fontSize: 14 }}>
                           New Balance: <ThemedText style={{ fontWeight: 'bold' }}>{quizResult.newTotal} pts</ThemedText>
                         </ThemedText>
                         {quizResult.newLevel && (
                           <ThemedText style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16, marginTop: 4 }}>
                             Level Up: {quizResult.newLevel}
                           </ThemedText>
                         )}
                      </View>
                    )}
                    
                    <Pressable 
                        onPress={async () => {
                            setShowResourceQuizSuccess(false);
                            
                            // Mark current resource as complete AFTER passing the quiz
                            await markAsComplete();
                            
                            const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
                            const nextIndex = currentIndex + 1;
                            
                            setLessons(prevLessons => {
                                const newLessons = [...prevLessons];
                                newLessons[currentIndex] = { ...newLessons[currentIndex], status: 'completed' };
                                if (nextIndex < newLessons.length) {
                                    newLessons[nextIndex] = { ...newLessons[nextIndex], status: 'in-progress' };
                                }
                                return newLessons;
                            });

                            moveToNextResource();
                        }}
                        style={[styles.primaryButton, {backgroundColor: colors.primary, width: '100%'}]}
                    >
                        <Text style={{color: colors.white, fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>Continue</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </ThemedView>
    );
  }

  if (showResourceQuizFailure) {
    return (
        <ThemedView style={{ flex: 1, padding: 16 }}>
            <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{padding: 32, backgroundColor: colors.bglight01, borderRadius: 16, width: '100%', alignItems: 'center'}}>
                    <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginBottom: 24}}>
                        <ThemedText style={{fontSize: 40}}>😕</ThemedText>
                    </View>
                    <ThemedText type="subtitle" style={{marginBottom: 16, textAlign: 'center', color: '#D32F2F'}}>
                      {quizResult?.message || "Quiz Not Passed"}
                    </ThemedText>
                    <ThemedText style={{textAlign: 'center', color: colors.textSecondary, marginBottom: 32}}>
                        You scored {quizResult?.score}/{quizResult?.total}. Try again to earn points or skip to continue.
                    </ThemedText>
                    
                    <View style={{ gap: 16, width: '100%' }}>
                        <Pressable 
                            onPress={handleRetakeQuiz}
                            style={([styles.primaryButton, {backgroundColor: '#527c65', width: '100%'}] as any)}
                        >
                            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center'}}>Take Quiz Again</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Custom Header Area (Video Player or Passed State) */}
      <Pressable onPress={() => (!isCoursePassed || isReviewing) && setShowControls(!showControls)} style={[{ backgroundColor: 'black', position: 'relative' }, (isFullscreen ? { width: '100%', height: '100%', position: 'absolute', zIndex: 999 } : { height: 300 }) as any]}>
        {isCoursePassed && !isReviewing ? (
          <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#1A1A1A' }]}>
            <View style={[styles.videoHeader, { paddingTop: isFullscreen ? insets.top : 10 }]}>
                <Pressable onPress={handleBack} style={styles.videoBackButton}>
                    <BackIcon color="white" />
                </Pressable>
            </View>

            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#34A85322', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <CheckCircleIcon color="#34A853" />
            </View>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              Module Completed!
            </Text>
            <Text style={{ color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
              Congratulations! You have successfully passed this module and earned your points.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable 
                onPress={() => {
                  setIsReviewing(true);
                  setCurrentLessonId(lessons[0]?.id || "");
                }}
                style={[styles.primaryButton, { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'white' } as any]}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Rewatch Videos</Text>
              </Pressable>
              <Pressable 
                onPress={() => setShowCertificateModal(true)}
                style={[styles.primaryButton, { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.primary } as any]}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>View Certificate</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Video
              ref={videoRef}
              style={{ width: '100%', height: '100%' }}
              source={videoSource}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={shouldVideoPlay}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              onLoadStart={() => setIsVideoLoading(true)}
              onLoad={(status) => {
                  setIsVideoLoading(false);
                  if (status.isLoaded && videoRef.current) {
                      // Get the most up-to-date progress from the store
                      const userCourse = getUserCourseById(id?.toString() || "");
                      const userRes = userCourse?.course?.resources?.find((ur: any) => ur.id.toString() === currentLessonId);
                      
                      const savedProgress = userRes?.progress?.watched_duration || currentLesson?.progress?.watched_duration;
                      const lastPosition = savedProgress ? Number(savedProgress) * 1000 : 0;
                      
                      // console.log(`DEBUG: Video loaded. Seeking to saved position: ${lastPosition}ms (watched_duration: ${savedProgress}s)`);
                      videoRef.current.setPositionAsync(lastPosition);
                  }
              }}
              usePoster={true}
              posterSource={course.image}
              posterStyle={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />

            {(showLoader || isBuffering || isVideoLoading) && (
                <View style={[styles.loaderContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <ActivityIndicator size="large" color="white" />
                    <ThemedText style={{color: 'white', fontWeight: 'bold', marginTop: 10}}>
                        {isVideoLoading ? "Loading video..." : isBuffering ? "Buffering..." : "Loading..."}
                    </ThemedText>
                </View>
            )}
            
            {/* Controls Overlay */}
            {showControls && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10, elevation: 10 }]}>
                    {/* Top Bar: Back Button */}
                     <View style={[styles.videoHeader, { paddingTop: isFullscreen ? insets.top : 10 }]}>
                        <Pressable onPress={handleBack} style={styles.videoBackButton}>
                            <BackIcon color="white" />
                        </Pressable>
                    </View>

                    {/* Center Controls: Play/Pause */}
                    <View style={styles.playControls}>
                        {/* Backward 15s */}
                         <Pressable style={styles.controlBtn} onPress={() => {
                             if (videoRef.current && status.isLoaded) {
                                videoRef.current.setPositionAsync(Math.max(0, status.positionMillis - 15000));
                             }
                         }}>
                            <RotateLeftIcon color="white" />
                            <Text style={{color: 'white', fontSize: 10, marginTop: 10}}>-15s</Text>
                         </Pressable>

                        <Pressable onPress={togglePlayPause} style={styles.playBtn}>
                            {status.isLoaded && status.isPlaying ? (
                                <PauseIcon color="white" />
                            ) : (status.isLoaded && status.didJustFinish) ? (
                                <ReplayIcon color="white" />
                            ) : (
                                <PlayIcon color="white" />
                            )}
                        </Pressable>

                         {/* Forward Button REMOVED as per request */}
                        {/* <Pressable style={styles.controlBtn}> ... </Pressable> */}
                    </View>

                    {/* Bottom Bar: Slider and Maximize */}
                    <View style={styles.videoFooter}>
                        <Text style={{color: 'white', fontSize: 12}}>
                            {status.isLoaded ? formatTime(status.positionMillis) : "0:00"}
                        </Text>
                        <Slider
                            style={{flex: 1, height: 40}}
                            minimumValue={0}
                            maximumValue={status.isLoaded ? status.durationMillis : 1}
                            value={status.isLoaded ? status.positionMillis : 0}
                            onSlidingComplete={handleSeek}
                            minimumTrackTintColor="#FFFFFF"
                            maximumTrackTintColor="rgba(255, 255, 255, 0.5)"
                            thumbTintColor="#FFFFFF"
                        />
                         <Text style={{color: 'white', fontSize: 12}}>
                            {status.isLoaded ? formatTime(status.durationMillis || 0) : "0:00"}
                        </Text>
                        
                        <Pressable onPress={handleFullscreenToggle} style={{padding: 8}}>
                            {isFullscreen ? <NavigateMinimizeIcon color="white" /> : <NavigateFullscreenIcon color="white" />}
                        </Pressable>
                    </View>
                </View>
            )}
          </>
        )}

        {/* Completion Overlay */}
        {showCompletionOverlay && (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 20 }]}>
                <View style={[styles.videoHeader, { paddingTop: isFullscreen ? insets.top : 10 }]}>
                    <Pressable onPress={() => setShowCompletionOverlay(false)} style={styles.videoBackButton}>
                        <BackIcon color="white" />
                    </Pressable>
                </View>

                <View style={{ width: '80%', alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
                        {isCoursePassed ? "Module Completed!" : "Congratulations!"}
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
                        {isCoursePassed 
                            ? "You have already completed this course successfully." 
                            : "You have completed this course. You can take the assessment or rewatch the videos."}
                    </Text>
                    
                    <View style={{ gap: 12, width: '100%' }}>
                        <Pressable 
                            onPress={async () => {
                                setShowCompletionOverlay(false);
                                if (isCoursePassed) {
                                    setShowCertificateModal(true);
                                } else if (!hasAttemptsLeft) {
                                    await handleRetakeCourse();
                                } else {
                                    startAssessment();
                                }
                            }}
                            style={[styles.primaryButton, { backgroundColor: colors.primary, width: '100%' } as any]}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                {isCoursePassed 
                                    ? "View Certificate" 
                                    : (!hasAttemptsLeft ? "Retake Course" : "Take Assessment")}
                            </Text>
                        </Pressable>
                        
                        <Pressable 
                            onPress={() => {
                                setShowCompletionOverlay(false);
                                setIsReviewing(true);
                                setCurrentLessonId(lessons[0]?.id || "");
                                if (videoRef.current) {
                                    videoRef.current.setPositionAsync(0);
                                }
                            }}
                            style={([styles.primaryButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'white', width: '100%' }] as any)}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Rewatch Videos</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        )}
      </Pressable>
      
      {/* Certificate Modal */}
      <CertificateModal
        visible={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        courseName={course.title}
        studentName={currentUser?.fullname || "User"}
        date={new Date().toLocaleDateString()}
        certificateImage={assessmentResult?.certificate_image || course.thumbnail}
      />
      
      {/* Instruction Modal for First-time Enrollment */}
      <Modal
        visible={showEnrolledModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.instructionIconContainer}>
                    <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
                        <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <Path d="M12 16v-4" />
                        <Path d="M12 8h.01" />
                    </Svg>
                </View>
                <ThemedText type="subtitle" style={styles.modalTitle}>Welcome to the Module!</ThemedText>
                <ThemedText style={styles.modalDescription}>
                    We're excited to have you here! Here are some tips to get started:
                    {"\n\n"}
                    • Watch the videos in sequence to unlock lessons.
                    {"\n"}
                    • You cannot skip forward on videos you haven't watched.
                    {"\n"}
                    • Complete the assessment at the end to earn your points.
                </ThemedText>
                
                <Pressable 
                    onPress={() => setShowEnrolledModal(false)}
                    style={([styles.instructionButton, { backgroundColor: colors.primary }] as any)}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Continue</Text>
                </Pressable>
            </View>
        </View>
      </Modal>

      {!isFullscreen && (
        <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
           <ThemedText type="subtitle" style={{marginBottom: 8}}>{course.title}</ThemedText>
           
           <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd', overflow: 'hidden'}}>
                    <Image
                      source={course.image}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  <ThemedText style={{fontWeight: '600'}}>{course.instructor}</ThemedText>
               </View>
                <Pressable 
                  onPress={() => router.push(`/course-chat/${id}`)}
                  style={styles.messageBtn}
                >
                    <Text style={{color: 'white' }}>Chat</Text>
                </Pressable>
           </View>
           
           <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <Path d="M11.8007 7.80208L9.54267 6.33203C9.46033 6.27843 9.36517 6.25 9.26808 6.25C8.98192 6.25 8.75 6.49162 8.75 6.78967V9.877C8.75 10.1751 8.98192 10.4167 9.26808 10.4167C9.36517 10.4167 9.46033 10.3882 9.54267 10.3347L11.8007 8.86458C11.9765 8.75008 12.0833 8.54933 12.0833 8.33333C12.0833 8.11733 11.9765 7.91657 11.8007 7.80208Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M17.0832 13.7493V7.08268C17.0832 5.1185 17.0832 4.13641 16.4729 3.52621C15.8628 2.91602 14.8807 2.91602 12.9165 2.91602H7.08317C5.11899 2.91602 4.13689 2.91602 3.5267 3.52621C2.9165 4.13641 2.9165 5.1185 2.9165 7.08268V13.7493" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M18.3202 17.0833H1.67983C1.36071 17.0833 1.15316 16.7573 1.29588 16.4803L2.91667 13.75H17.0834L18.7041 16.4803C18.8469 16.7573 18.6393 17.0833 18.3202 17.0833Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <ThemedText type="small"> 24hrs</ThemedText>
              </View>
              <View style={styles.statItem}>
                <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <Path d="M8.1775 13.2533L7.5 15.625L6.8225 13.2533C6.64739 12.6407 6.31908 12.0828 5.86855 11.6323C5.41802 11.1818 4.86012 10.8534 4.2475 10.6783L1.875 10L4.24667 9.3225C4.85928 9.14739 5.41718 8.81908 5.86772 8.36855C6.31825 7.91802 6.64656 7.36012 6.82167 6.7475L7.5 4.375L8.1775 6.74667C8.35261 7.35928 8.68092 7.91718 9.13145 8.36772C9.58198 8.81825 10.1399 9.14656 10.7525 9.32167L13.125 10L10.7533 10.6775C10.1407 10.8526 9.58282 11.1809 9.13228 11.6315C8.68175 12.082 8.35344 12.6399 8.17833 13.2525L8.1775 13.2533ZM15.2158 7.2625L15 8.125L14.7842 7.2625C14.6606 6.76799 14.405 6.31635 14.0447 5.95586C13.6843 5.59537 13.2328 5.33958 12.7383 5.21583L11.875 5L12.7383 4.78417C13.2328 4.66042 13.6843 4.40463 14.0447 4.04414C14.405 3.68365 14.6606 3.23201 14.7842 2.7375L15 1.875L15.2158 2.7375C15.3394 3.23211 15.5952 3.68382 15.9557 4.04432C16.3162 4.40482 16.7679 4.66056 17.2625 4.78417L18.125 5L17.2625 5.21583C16.7679 5.33944 16.3162 5.59518 15.9557 5.95568C15.5952 6.31618 15.3394 6.76789 15.2158 7.2625ZM14.0783 17.1392L13.75 18.125L13.4217 17.1392C13.3296 16.863 13.1745 16.6121 12.9687 16.4063C12.7629 16.2005 12.512 16.0454 12.2358 15.9533L11.25 15.625L12.2358 15.2967C12.512 15.2046 12.7629 15.0495 12.9687 14.8437C13.1745 14.6379 13.3296 14.387 13.4217 14.1108L13.75 13.125L14.0783 14.1108C14.1704 14.387 14.3255 14.6379 14.5313 14.8437C14.7371 15.0495 14.988 15.2046 15.2642 15.2967L16.25 15.625L15.2642 15.9533C14.988 16.0454 14.7371 16.2005 14.5313 16.4063C14.3255 16.6121 14.1704 16.863 14.0783 17.1392Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <ThemedText type="small">15 Points</ThemedText>
              </View>
              <View style={styles.statItem}>
                <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <Path d="M15.4167 14.8643C16.2755 14.7383 16.8857 14.4944 17.3571 14.023C18.3334 13.0468 18.3334 11.4753 18.3334 8.33268C18.3334 5.18998 18.3334 3.61864 17.3571 2.64232C16.3808 1.66602 14.8094 1.66602 11.6667 1.66602H8.33341C5.19071 1.66602 3.61937 1.66602 2.64306 2.64232C1.66675 3.61864 1.66675 5.18998 1.66675 8.33268C1.66675 11.4753 1.66675 13.0468 2.64306 14.023C3.31654 14.6965 4.27316 14.9054 5.83341 14.9702" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                  <Path d="M14.1666 5.83398H5.83325" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M12.0834 12.0833C12.0834 13.2339 11.1507 14.1667 10.0001 14.1667C8.8495 14.1667 7.91675 13.2339 7.91675 12.0833C7.91675 10.9327 8.8495 10 10.0001 10C11.1507 10 12.0834 10.9327 12.0834 12.0833Z" stroke="black" strokeWidth="1.5"/>
                  <Path d="M7.91675 12.084C7.91675 15.4722 9.35191 17.3928 10.0001 18.334L11.2501 15.834L12.7084 16.6673L14.1667 17.5007C13.5545 16.908 12.9216 15.0399 12.9216 15.0399" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <ThemedText type="small">Certificate</ThemedText>
              </View>
              <View style={styles.statItem}>
                <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <Path d="M1.66675 5.83333C1.66675 4.66656 1.66675 4.08317 1.89381 3.63752C2.09356 3.24552 2.41226 2.92681 2.80426 2.72707C3.24991 2.5 3.83331 2.5 5.00008 2.5C6.16686 2.5 6.75025 2.5 7.1959 2.72707C7.5879 2.92681 7.90661 3.24552 8.10635 3.63752C8.33341 4.08317 8.33341 4.66656 8.33341 5.83333V14.1667C8.33341 15.3334 8.33341 15.9168 8.10635 16.3625C7.90661 16.7545 7.5879 17.0732 7.1959 17.2729C6.75025 17.5 6.16686 17.5 5.00008 17.5C3.83331 17.5 3.24991 17.5 2.80426 17.2729C2.41226 17.0732 2.09356 16.7545 1.89381 16.3625C1.66675 15.9168 1.66675 15.3334 1.66675 14.1667V5.83333Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M5 14.166H5.00748" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M1.66675 5.83398H8.33341" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M9.54057 6.89036C9.24482 5.78198 9.09699 5.2278 9.19882 4.74666C9.2884 4.32343 9.50907 3.93956 9.82932 3.65004C10.1933 3.3209 10.7452 3.17241 11.849 2.87542C12.9527 2.57843 13.5047 2.42994 13.9837 2.53221C14.4052 2.62217 14.7875 2.8438 15.0758 3.16534C15.4036 3.53088 15.5515 4.08507 15.8472 5.19344L17.9596 13.1097C18.2553 14.218 18.4032 14.7722 18.3013 15.2533C18.2117 15.6766 17.9911 16.0604 17.6708 16.35C17.3068 16.6791 16.7549 16.8276 15.6512 17.1246C14.5474 17.4216 13.9955 17.5701 13.5164 17.4678C13.0949 17.3778 12.7127 17.1562 12.4243 16.8347C12.0966 16.4691 11.9487 15.9149 11.6529 14.8066L9.54057 6.89036Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M14.8176 13.9121L14.8249 13.9102" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M10 6.66682L15.4167 5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <ThemedText type="small">15 Resource</ThemedText>
              </View>
           </View>

           <ThemedText type="default" style={{fontWeight: 'bold', marginBottom: 4}}>Description</ThemedText>
           <ThemedText 
                style={{color: colors.textSecondary, marginBottom: isDescriptionExpanded ? 8 : 4}}
                numberOfLines={isDescriptionExpanded ? undefined : 2}
           >
               {course.description}
           </ThemedText>
           <Pressable onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)} style={{ marginBottom: 20 }}>
                <Text style={{color: '#5A7C65', fontWeight: 'bold', fontSize: 14}}>
                    {isDescriptionExpanded ? "See Less" : "See More"}
                </Text>
           </Pressable>

           {/* Tabs */}
           <View style={styles.tabContainer}>
               {(['lessons', 'resources', 'reviews'] as Tab[]).map((tab) => (
                   <Pressable 
                      key={tab} 
                      onPress={() => setActiveTab(tab)}
                      style={[styles.tab, activeTab === tab && { backgroundColor: '#D1E4FF' }]} // Using a light blue for active
                   >
                       <Text style={{ 
                           color: activeTab === tab ? '#0056D2' : '#0056D2', 
                           fontWeight: activeTab === tab ? 'bold' : 'normal',
                           textTransform: 'capitalize'
                        }}>
                           {tab}
                       </Text>
                   </Pressable>
               ))}
           </View>
           
           {/* Tab Content */}
           {activeTab === 'lessons' && (
               <View>
                 {lessons.reduce((acc: any[], lesson: any, idx: number) => {
                     const isNewModule = idx === 0 || lesson.parent_lesson_id !== lessons[idx - 1].parent_lesson_id;
                     const moduleId = lesson.parent_lesson_id?.toString() || 'unknown';
                     const isExpanded = expandedModules[moduleId];
                     
                     if (isNewModule) {
                         acc.push(
                            <Pressable 
                                key={`header-${moduleId}`} 
                                onPress={() => setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }))}
                                style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, marginTop: idx > 0 ? 16 : 0, backgroundColor: isExpanded ? colors.bglight01 : 'transparent', paddingHorizontal: 12, borderRadius: 8}}
                             >
                                 <Text style={{color: colors.textSecondary, fontSize: 14, fontWeight: 'bold'}}>
                                     {lesson.parent_lesson_title || course.title}
                                 </Text>
                                 {isExpanded ? <ChevronUpIcon color={colors.textSecondary} /> : <ChevronDownIcon color={colors.textSecondary} />}
                             </Pressable>
                         );
                     }

                     if (isExpanded) {
                         acc.push(
                             <Pressable 
                               key={lesson.id} 
                               onPress={() => handleLessonPress(lesson.id)}
                               style={[
                                   styles.lessonRow, 
                                   currentLessonId === lesson.id ? {backgroundColor: colors.bglight10} : { backgroundColor: 'transparent' },
                                   lesson.status === 'locked' && { opacity: 0.5 },
                                   (allResourcesWatched && !isReviewing) && { opacity: 0.6 }
                               ]}
                               disabled={lesson.status === 'locked' || (currentLesson?.status === 'in-progress' && lesson.id !== currentLessonId) || (allResourcesWatched && !isReviewing)}
                             >
                                <ThemedText type="title" style={{fontSize: 24, marginRight: 16, width: 20}}>
                                    {
                                        lesson.status === "completed" ?
                                        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <Path d="M19.8438 11.128C19.3389 12.9185 16.9523 14.1839 12.1798 16.7148C7.56574 19.1611 5.25888 20.3845 3.39973 19.8928C2.63115 19.6894 1.93086 19.3034 1.36606 18.7716C-4.25749e-07 17.4851 0 14.9899 0 9.99996C0 5.00998 -4.25749e-07 2.51479 1.36606 1.22842C1.93086 0.696592 2.63115 0.310509 3.39973 0.107224C5.25888 -0.38446 7.56574 0.838763 12.1798 3.28521C16.9523 5.81597 19.3389 7.0814 19.8438 8.87196C20.0521 9.6111 20.0521 10.3888 19.8438 11.128Z" fill="#5A7C65"/>
                                        </Svg>
                                        : lesson.status === "in-progress" ?
                                        <Svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                            <Path d="M19.9999 36.6673C29.2047 36.6673 36.6666 29.2054 36.6666 20.0007C36.6666 10.7959 29.2047 3.33398 19.9999 3.33398C10.7952 3.33398 3.33325 10.7959 3.33325 20.0007C3.33325 29.2054 10.7952 36.6673 19.9999 36.6673Z" fill="#5A7C65" stroke="#5A7C65" strokeWidth="2.5"/>
                                            <Path d="M15.8333 15V25V15ZM24.1666 15V25V15Z" fill="white"/>
                                            <Path d="M15.8333 15V25M24.1666 15V25" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                        </Svg>
                                        :
                                        <>
                                            {idx + 1}
                                        </>
                                    }
                                </ThemedText>
                                <View style={{flex: 1}}>
                                    <ThemedText style={{fontWeight: '600'}}>{lesson.title}</ThemedText>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                      {lesson.duration ? <Text style={{color: colors.textSecondary, fontSize: 12}}>Videos - {lesson.duration}</Text> : null}
                                      
                                      {/* Mark Complete Button for active lesson after 30 secs */}
                                      {currentLessonId === lesson.id && canMarkComplete && lesson.status !== 'completed' && (
                                        <Pressable 
                                          onPress={() => handleManualComplete(lesson.id)}
                                          style={{ backgroundColor: colors.primary + '22', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: colors.primary }}
                                        >
                                          <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold' }}>Mark Complete</Text>
                                        </Pressable>
                                      )}
                                    </View>
                                 </View>
                                {lesson.status === 'completed' ? 
                                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <Path d="M15.8255 15.8327H15.8334H15.8255ZM15.8255 15.8327C15.3066 16.3473 14.3662 16.2191 13.7067 16.2191C12.8972 16.2191 12.5073 16.3774 11.9296 16.9552C11.4377 17.4472 10.7782 18.3327 10.0001 18.3327C9.222 18.3327 8.5625 17.4472 8.07056 16.9552C7.49282 16.3774 7.10299 16.2191 6.29346 16.2191C5.63398 16.2191 4.69356 16.3473 4.17466 15.8327C3.65159 15.314 3.78031 14.3697 3.78031 13.7059C3.78031 12.8672 3.59688 12.4815 2.99956 11.8842C2.11103 10.9957 1.66676 10.5513 1.66675 9.99935C1.66676 9.44727 2.11101 9.00302 2.99954 8.11449C3.53275 7.58128 3.78031 7.05292 3.78031 6.29273C3.78031 5.63322 3.65216 4.6928 4.16675 4.17388C4.68544 3.65083 5.62975 3.77957 6.29348 3.77957C7.05364 3.77957 7.58201 3.53202 8.11521 2.99882C9.00375 2.11028 9.448 1.66602 10.0001 1.66602C10.5522 1.66602 10.9964 2.11028 11.8849 2.99882C12.418 3.53191 12.9463 3.77957 13.7067 3.77957C14.3662 3.77957 15.3067 3.65141 15.8256 4.16602C16.3486 4.68471 16.2198 5.62901 16.2198 6.29273C16.2198 7.1315 16.4033 7.51716 17.0006 8.11449C17.8892 9.00302 18.3334 9.44727 18.3334 9.99935C18.3334 10.5513 17.8892 10.9957 17.0006 11.8842C16.4032 12.4815 16.2198 12.8672 16.2198 13.7059C16.2198 14.3697 16.3486 15.314 15.8255 15.8327Z" fill="#34A853"/>
                                        <Path d="M15.8255 15.8327H15.8334M15.8255 15.8327C15.3066 16.3473 14.3662 16.2191 13.7067 16.2191C12.8972 16.2191 12.5073 16.3774 11.9296 16.9552C11.4377 17.4472 10.7782 18.3327 10.0001 18.3327C9.222 18.3327 8.5625 17.4472 8.07056 16.9552C7.49281 16.3774 7.10299 16.2191 6.29346 16.2191C5.63398 16.2191 4.69356 16.3473 4.17466 15.8327C3.65159 15.314 3.78031 14.3697 3.78031 13.7059C3.78031 12.8672 3.59688 12.4815 2.99956 11.8842C2.11103 10.9957 1.66676 10.5513 1.66675 9.99935C1.66676 9.44727 2.11101 9.00302 2.99954 8.11449C3.53275 7.58128 3.78031 7.05292 3.78031 6.29273C3.78031 5.63322 3.65216 4.6928 4.16675 4.17388C4.68544 3.65083 5.62975 3.77957 6.29348 3.77957C7.05364 3.77957 7.58201 3.53202 8.11521 2.99882C9.00375 2.11028 9.448 1.66602 10.0001 1.66602C10.5522 1.66602 10.9964 2.11028 11.8849 2.99882C12.418 3.53191 12.9463 3.77957 13.7067 3.77957C14.3662 3.77957 15.3067 3.65141 15.8256 4.16602C16.3486 4.68471 16.2198 5.62901 16.2198 6.29273C16.2198 7.1315 16.4033 7.51716 17.0006 8.11449C17.8892 9.00302 18.3334 9.44727 18.3334 9.99935C18.3334 10.5513 17.8892 10.9957 17.0006 11.8842C16.4032 12.4815 16.2198 12.8672 16.2198 13.7059C16.2198 14.3697 16.3486 15.314 15.8255 15.8327Z" stroke="#34A853" strokeWidth="1.25"/>
                                        <Path d="M7.5 10.7434L9 12.0827L12.5 7.91602" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                                    </Svg>
                                    :
                                    <Pressable>
                                      <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <Path fillRule="evenodd" clipRule="evenodd" d="M10 1.875C5.5125 1.875 1.875 5.5125 1.875 10C1.875 14.4875 5.5125 18.125 10 18.125C14.4875 18.125 18.125 14.4875 18.125 10C18.125 5.5125 14.4875 1.875 10 1.875ZM9.55833 13.5667C9.67552 13.6837 9.83437 13.7494 10 13.7494C10.1656 13.7494 10.3245 13.6837 10.4417 13.5667L12.9417 11.0667C13.0031 11.0094 13.0523 10.9404 13.0865 10.8638C13.1206 10.7871 13.139 10.7044 13.1405 10.6204C13.142 10.5365 13.1265 10.4532 13.0951 10.3753C13.0637 10.2975 13.0169 10.2268 12.9575 10.1675C12.8982 10.1081 12.8275 10.0613 12.7497 10.0299C12.6718 9.99846 12.5885 9.98303 12.5046 9.98451C12.4206 9.98599 12.3379 10.0044 12.2612 10.0385C12.1846 10.0727 12.1156 10.1219 12.0583 10.1833L10.625 11.6167V6.875C10.625 6.70924 10.5592 6.55027 10.4419 6.43306C10.3247 6.31585 10.1658 6.25 10 6.25C9.83424 6.25 9.67527 6.31585 9.55806 6.43306C9.44085 6.55027 9.375 6.70924 9.375 6.875V11.6167L7.94167 10.1833C7.82319 10.0729 7.66648 10.0128 7.50456 10.0157C7.34265 10.0185 7.18816 10.0841 7.07365 10.1986C6.95914 10.3132 6.89354 10.4676 6.89069 10.6296C6.88783 10.7915 6.94793 10.9482 7.05833 11.0667L9.55833 13.5667Z" fill="black"/>
                                      </Svg>
                                    </Pressable>
                                }
                             </Pressable>
                         );
                     }
                     return acc;
                 }, [])}
                 {/* Simulate finish course button for demo */}
                 <Pressable 
                    onPress={
                        isCoursePassed 
                            ? () => setShowCertificateModal(true) 
                            : (!hasAttemptsLeft ? handleRetakeCourse : handleFinishCourse)
                    } 
                    disabled={(!lessons.every(l => l.status === 'completed')) && !isCoursePassed}
                    style={[
                        styles.primaryButton, 
                        {marginTop: 20},
                        (!lessons.every(l => l.status === 'completed') && !isCoursePassed) && { opacity: 0.5, backgroundColor: '#ccc' }
                    ]}
                 >
                     <Text style={{color: 'white', textAlign: 'center'}}>
                        {isCoursePassed 
                            ? "View Certificate" 
                            : (!hasAttemptsLeft ? "Retake Course" : "Take Assessment")}
                     </Text>
                 </Pressable>
               </View>
           )}

           {activeTab === 'resources' && (
               <View>
                   {course.resources.map((res: any, idx: number) => (
                       <View key={res.id} style={{marginBottom: 0, backgroundColor: expandedResource === res.id ? colors.bglight01 : 'transparent', borderRadius: 8}}>
                           <Pressable 
                              onPress={() => onResourcePress(res.id)}
                              style={{flexDirection: 'row', padding: 16, alignItems: 'center'}}
                            >
                               <ThemedText style={{fontSize: 24, fontWeight: 'bold', marginRight: 16}}>{idx + 1}</ThemedText>
                               <View style={{flex: 1}}>
                                   <ThemedText style={{fontWeight: '600'}}>{res.title}</ThemedText>
                                   <Text style={{color: colors.textSecondary, fontSize: 12}} numberOfLines={1}>{res.description}</Text>
                               </View>
                               {expandedResource === res.id ? <ChevronUpIcon color={colors.textSecondary} /> : <ChevronDownIcon color={colors.textSecondary} />}
                           </Pressable>
                           {expandedResource === res.id && (
                               <View style={{padding: 16, paddingTop: 0, paddingLeft: 48}}>
                                   <Text style={{color: colors.textSecondary, marginBottom: 12}}>{res.description}</Text>
                                   <Pressable style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                                       <View style={{width: 24, height: 24, borderRadius: 12, backgroundColor: '#5A7C65', justifyContent: 'center', alignItems: 'center'}}>
                                            <PlayIcon color="white" />
                                       </View>
                                       <Text style={{color: '#5A7C65', fontWeight: '600'}}>Play Audio</Text>
                                   </Pressable>
                               </View>
                           )}
                       </View>
                   ))}
               </View>
           )}

           {activeTab === 'reviews' && (
               <View>
                   {course.reviews.map((review: any) => (
                       <View key={review.id} style={{marginBottom: 20, flexDirection: 'column', gap: 12}}>
                          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                           <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd', overflow: 'hidden'}}>
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
                              <ThemedText style={{fontWeight: '600'}}>{review.user}</ThemedText>
                              <Text style={{color: colors.textSecondary, fontSize: 10, marginTop: 2, marginBottom: 4}}>{review.time}</Text>
                            </View>
                          </View>
                           <View style={{flex: 1}}>
                               <Text style={{color: colors.textSecondary}}>{review.comment}</Text>
                           </View>
                       </View>
                   ))}
               </View>
           )}

        </View>
      </ScrollView>
      )}
    </ThemedView>
  );
}

const styles: any = StyleSheet.create({
  videoHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      paddingHorizontal: 16,
      zIndex: 10,
  },
  videoBackButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
  },
  playControls: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{translateX: -75}, {translateY: 0}], // Adjusted to bring controls down
      flexDirection: 'row',
      alignItems: 'center',
      gap: 30,
      width: 150,
      justifyContent: 'center',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  instructionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5A7C651A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
  },
  instructionButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
      width: 40,
      height: 40, 
      justifyContent: 'center',
      alignItems: 'center'
  },
  controlBtn: {
      alignItems: 'center'
  },
  videoFooter: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      gap: 10,
  },
  progressBarBg: {
      flex: 1,
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 2,
  },
  progressBarFill: {
      height: '100%',
      backgroundColor: 'white', // Color from image
      borderRadius: 2,
  },
  messageBtn: {
      backgroundColor: '#527c65', 
      paddingHorizontal: 16, 
      paddingVertical: 8, 
      borderRadius: 6
  },
  statsRow: {
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 20,
      flexWrap: 'wrap',
      gap: 10
  },
  statItem: {
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 4
  },
  tabContainer: {
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 20
  },
  tab: {
      flex: 1, 
      alignItems: 'center', 
      paddingVertical: 10, 
      borderRadius: 8 // Rounded like image? Actually Image 1 shows text only but active has background.
      // Image 1 active tab "Lessons" has light blue bg.
  },
  lessonRow: {
      flexDirection: 'row', 
      alignItems: 'center', 
      padding: 16, 
      borderRadius: 12, 
      marginBottom: 12, 
      backgroundColor: '#f9f9f9' // Default light
  },
  backButton: {
      width: 40, height: 40, backgroundColor: '#f0f0f0', borderRadius: 20, justifyContent: 'center', alignItems: 'center'
  },
  optionCard: {
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: 'white', 
      padding: 16, 
      marginBottom: 12, 
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#eee'
  },
  optionLetter: {
      width: 24, 
      height: 24, 
      backgroundColor: '#527c65', 
      borderRadius: 4, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginRight: 12
  },
  primaryButton: {
      backgroundColor: '#527c65', // Matching the green in image
      padding: 16,
      borderRadius: 8,
      alignItems: 'center'
  }
});
