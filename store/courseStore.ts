import { courseService } from '@/services/api/apiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Category {
  id: number;
  name: string;
}

export interface Instructor {
  id: number;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  resource_type: string;
  audio: string;
  course_id: number;
  created_at: string;
  duration: number;
  transcript: string;
  updated_at: string;
  has_quiz: boolean;
  progress: {
    completed_at: string;
    is_completed: number;
    progress_id: string;
    student_id: string;
    last_watched_at: string | null;
    has_started: boolean;
    resource_id: number | null;
    totalDuration: number | null;
    watch_percentage: number | null;
    watched_duration: number | null;
  };
}

export interface Reviews {
  id: number;
  user_id: number;
  course_id: number;
  rating: number;
  image: string;
  comment: string;
  review_date: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Option {
  created_at: string;
  id: number;
  is_correct: number;
  option_text: string;
  question_id: number;
  updated_at: string;
}

export interface Question {
  assessment_id: number;
  created_at: string;
  id: number;
  options: Option[];
  points: number;
  question_text: string;
  question_type: string;
  updated_at: string;
}

export interface Assessment {
  course_id: number;
  created_at: string;
  description: string;
  id: number;
  questions: Question[];
  title: string;
  total_points: number;
  updated_at: string;
  is_passed: boolean;
  max_attempts: number;
  attempts_used: number;
}

export interface CourseData {
  courses: CourseProp[];
  count: string;
  message: string;
}

export interface CourseProp {
  id: number;
  averageRating: number;
  reviewCount: number;
  reviews: Reviews[];
  reviewContent?: Reviews[];
  assessments?: Assessment[];
  category: Category;
  category_id: number;
  created_at: string;
  defaultVideoUrl: string;
  description: string;
  duration: number;
  has_certificate: number;
  instructor: Instructor;
  instructor_id: number;
  is_paid: number;
  points: number;
  resources: Resource[];
  subscriptionCount: number;
  students: number;
  thumbnail: string;
  title: string;
  updated_at: string;
  status?: string;
}

export interface userCourseProp {
  id: number;
  course: CourseProp;
  progress: number;
  status: string;
  subscribed_at: string;
  subscription_id: string;
  assessment_status?: {
    is_passed: boolean;
    attempts_used: number;
    max_attempts: number;
  };
}

export interface UserCourseData {
  subscriptions: userCourseProp[];
  count: string;
  message: string;
}

interface CoursesStore {
  // All courses
  courses: CourseData | null;
  setCourses: (courses: CourseData) => void;
  addCourse: (course: CourseProp) => void;

  // User courses (subscribed/enrolled)
  userCourses: UserCourseData | null;
  setUserCourses: (courses: UserCourseData) => void;

  // User current course ID for navigation context
  userCurrentCourseId: number | null;
  setUserCurrentCourseId: (id: number | null) => void;

  // Current course ID (general)
  currentCourseId: number | null;
  setCurrentCourseId: (id: number | null) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Cache timestamp
  lastFetchTime: number | null;
  setLastFetchTime: (time: number) => void;

  // Cache duration in milliseconds (default: 5 minutes)
  cacheDuration: number;
  setCacheDuration: (duration: number) => void;

  // Check if cache is still valid
  isCacheValid: () => boolean;

  // Get courses by category
  getCoursesByCategory: (category: string) => CourseProp[];

  // Get single course by ID
  getCourseById: (id: string) => CourseProp | undefined;

  // Get single user course by ID
  getUserCourseById: (id: string) => userCourseProp | undefined;

  // Search courses
  searchCourses: (query: string) => CourseProp[];

  // Clear all courses
  clearCourses: () => void;

  // Update resource progress
  updateResourceProgress: (
    courseId: number,
    resourceId: number,
    userId: string,
    progress: {
      watchedDuration: number;
      totalDuration: number;
      isCompleted: number;
    }
  ) => Promise<void>;

  // Add review to a course
  addReview: (courseId: number, review: Reviews) => void;

  // Subscribe to a course
  subscribeToCourse: (courseId: string, userId: string) => Promise<{ success: boolean; message: string }>;
}



export const useCoursesStore = create<CoursesStore>()(
  persist(
    (set, get) => ({
      courses: null,
      setCourses: (courses: CourseData) => {
        set({ courses, lastFetchTime: Date.now() });
      },

      addCourse: (course: CourseProp) => {
        set((state) => {
          if (!state.courses) {
            console.log('[STORE] Creating new courses array with course:', course.id);
            console.log('[STORE] New course assessments:', JSON.stringify(course.assessments, null, 2));
            return {
              courses: {
                courses: [course],
                count: "1",
                message: "Course added"
              }
            };
          }

          const existingCourseIndex = state.courses.courses.findIndex(c => c.id === course.id);
          let updatedCoursesList = [...state.courses.courses];

          if (existingCourseIndex !== -1) {
            // Replace existing course with fresh data from API
            console.log('[STORE] Updating existing course:', course.id);
            console.log('[STORE] Existing assessments:', JSON.stringify(updatedCoursesList[existingCourseIndex].assessments, null, 2));
            console.log('[STORE] New assessments:', JSON.stringify(course.assessments, null, 2));
            
            // Always use the new course data to ensure fresh API data replaces cache
            updatedCoursesList[existingCourseIndex] = course;
            
            console.log('[STORE] Final assessments after update:', JSON.stringify(updatedCoursesList[existingCourseIndex].assessments, null, 2));
            
            return {
              courses: {
                ...state.courses,
                courses: updatedCoursesList
              }
            };
          } else {
            // Append new course
            return {
              courses: {
                ...state.courses,
                courses: [...state.courses.courses, course],
                count: (Number(state.courses.count || 0) + 1).toString()
              },
            };
          }
        });
      },

      userCourses: null,
      setUserCourses: (courses: UserCourseData) => {
        // Normalize data if it comes from API with 'courses' key instead of 'subscriptions'
        let normalizedData = courses;
        if (courses && (courses as any).courses && !courses.subscriptions) {
          normalizedData = {
            ...courses,
            subscriptions: (courses as any).courses
          };
        }
        set({ userCourses: normalizedData });
      },

      userCurrentCourseId: null,
      setUserCurrentCourseId: (id: number | null) => {
        set({ userCurrentCourseId: id });
      },

      currentCourseId: null,
      setCurrentCourseId: (id: number | null) => {
        set({ currentCourseId: id });
      },

      isLoading: false,
      setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      error: null,
      setError: (error: string | null) => {
        set({ error });
      },

      // Cache management
      lastFetchTime: null,
      setLastFetchTime: (time: number) => {
        set({ lastFetchTime: time });
      },

      cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
      setCacheDuration: (duration: number) => {
        set({ cacheDuration: duration });
      },

      isCacheValid: () => {
        const state = get();
        if (!state.lastFetchTime || !state.courses || state.courses.courses.length === 0) {
          return false;
        }
        const timeSinceLastFetch = Date.now() - state.lastFetchTime;
        return timeSinceLastFetch < state.cacheDuration;
      },

      getCoursesByCategory: (category: string) => {
        const state = get();
        return (state.courses?.courses || []).filter(
          (course) => course.category.name === category
        );
      },

      getCourseById: (id: string) => {
        const state = get();
        return (state.courses?.courses || []).find((course) => course.id === Number(id));
      },

      getUserCourseById: (id: string) => {
        const state = get();
        const subscriptions = state.userCourses?.subscriptions || (state.userCourses as any)?.courses || [];
        return subscriptions.find(
          (course: userCourseProp) => course.course.id === Number(id)
        );
      },

      searchCourses: (query: string) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        return (state.courses?.courses || []).filter(
          (course) =>
            course.title?.toLowerCase().includes(lowerQuery) ||
            course.description?.toLowerCase().includes(lowerQuery)
        );
      },

      clearCourses: () => {
        set({ courses: null, error: null });
      },
      updateResourceProgress: async (
        courseId: number,
        resourceId: number,
        userId: string,
        progress: {
          watchedDuration: number;
          totalDuration: number;
          isCompleted: number;
        }
      ) => {
        // Optimistic UI update
        set((state) => {
          if (!state.userCourses) return { userCourses: state.userCourses };

          console.log(`DEBUG: STORE - Updating progress for course ${courseId}, resource ${resourceId}`);

          const userCoursesList = [...state.userCourses.subscriptions];
          const courseIndex = userCoursesList.findIndex(
            (c) => c.course.id === courseId
          );

          if (courseIndex !== -1) {
            const course = { ...userCoursesList[courseIndex] };
            const resourceIndex = course.course.resources.findIndex(
              (r: Resource) => r.id === resourceId
            );

            if (resourceIndex !== -1) {
              const resources = [...course.course.resources];
              const resource = { ...resources[resourceIndex] };

              if (!resource.progress) {
                resource.progress = {
                  completed_at: "",
                  is_completed: 0,
                  progress_id: "",
                  student_id: userId,
                  last_watched_at: null,
                  has_started: true as any,
                  resource_id: resourceId as any,
                  totalDuration: progress.totalDuration as any,
                  watch_percentage: 0,
                  watched_duration: progress.watchedDuration as any,
                };
              }

              resource.progress = {
                ...resource.progress,
                is_completed: progress.isCompleted,
                watched_duration: progress.watchedDuration as any,
                totalDuration: progress.totalDuration as any,
                watch_percentage: ((progress.watchedDuration /
                  progress.totalDuration) *
                  100) as any,
                has_started: true as any,
              };

              resources[resourceIndex] = resource;
              course.course.resources = resources;

              const completedCount = resources.filter(
                (r: Resource) => r.progress?.is_completed === 1
              ).length;
              const totalCount = resources.length;
              course.progress = Math.round((completedCount / totalCount) * 100);

              userCoursesList[courseIndex] = course;
            }
          }
          return {
            userCourses: {
              ...state.userCourses,
              subscriptions: userCoursesList
            }
          };
        });

        // Backend Sync
        try {
          console.log(`[STORE] Syncing to backend - Resource: ${resourceId}, User: ${userId}`, {
            watchedDuration: progress.watchedDuration,
            totalDuration: progress.totalDuration,
            isCompleted: progress.isCompleted === 1
          });

          await courseService.updateResourceProgress({
            resourceId,
            userId,
            watchedDuration: progress.watchedDuration,
            totalDuration: progress.totalDuration,
            isCompleted: progress.isCompleted === 1
          });
          console.log(`[STORE] Backend sync successful for resource ${resourceId}`);
        } catch (error) {
          console.error("[STORE] Backend sync failed:", error);
          throw error;
        }
      },

      addReview: (courseId: number, review: Reviews) => {
        set((state) => {
          // Update in userCourses
          let userCourses = state.userCourses;
          if (userCourses) {
            const userCoursesList = [...userCourses.subscriptions];
            const userCourseIndex = userCoursesList.findIndex(
              (c) => c.course?.id === courseId
            );

            if (userCourseIndex !== -1) {
              const userCourse = userCoursesList[userCourseIndex];
              const updatedUserCourse = { 
                ...userCourse, 
                course: { 
                  ...userCourse.course,
                  reviews: Array.isArray(userCourse.course.reviews)
                    ? [...userCourse.course.reviews, review]
                    : [review]
                } 
              };
              userCoursesList[userCourseIndex] = updatedUserCourse;
              userCourses = {
                ...userCourses,
                subscriptions: userCoursesList
              };
            }
          }

          // Update in general courses list if it exists there
          let courses = state.courses;
          if (courses && Array.isArray(courses.courses)) {
            const courseIndex = courses.courses.findIndex((c) => c.id === courseId);
            if (courseIndex !== -1) {
              const updatedCoursesList = [...courses.courses];
              const course = updatedCoursesList[courseIndex];
              updatedCoursesList[courseIndex] = {
                ...course,
                reviews: Array.isArray(course.reviews)
                  ? [...course.reviews, review]
                  : [review]
              };
              courses = {
                ...courses,
                courses: updatedCoursesList
              };
            }
          }

          return { userCourses, courses };
        });
      },

      subscribeToCourse: async (courseId: string, userId: string) => {
        const { setIsLoading, setUserCourses } = get();
        // Loading is handled by apiClient interceptor, but we can also set it here if needed
        // but since apiClient already does it, we might just want to handle the success state
        try {
          console.log(`Store: Subscribing user ${userId} to course ${courseId}`);
          const response = await courseService.subscribeToCourse(courseId, userId);
          console.log("Store: Subscription API response:", response);
          
          // Refetch user courses to update the list
          console.log("Store: Refetching user courses...");
          const updatedUserCourses = await courseService.getUserCourses(userId);
          setUserCourses(updatedUserCourses);
          
          return { success: true, message: response.message || "Subscribed successfully" };
        } catch (error: any) {
          console.error("Store: Subscription failed with error:", error);
          if (error.response) {
            console.error("Store: Error response data:", error.response.data);
            console.error("Store: Error response status:", error.response.status);
          }
          const message = error?.response?.data?.message || error?.message || "Subscription failed";
          return { success: false, message };
        }
      },
    }),
    {
      name: "courses-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
