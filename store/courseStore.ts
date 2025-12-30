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
  progress: {
    completed_at: string;
    is_completed: number;
    progress_id: string;
    student_id: string;
    last_watched_at: null;
    has_started: false;
    resource_id: null;
    totalDuration: null;
    watch_percentage: null;
    watched_duration: null;
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

interface CoursesStore {
  // All courses
  courses: CourseProp[];
  setCourses: (courses: CourseProp[]) => void;
  addCourse: (course: CourseProp) => void;

  // User courses (subscribed/enrolled)
  userCourses: userCourseProp[];
  setUserCourses: (courses: userCourseProp[]) => void;

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
    progress: {
      watchedDuration: number;
      totalDuration: number;
      isCompleted: number;
    }
  ) => void;

  // Add review to a course
  addReview: (courseId: number, review: Reviews) => void;
}



export const useCoursesStore = create<CoursesStore>()(
  persist(
    (set, get) => ({
      courses: [],
      setCourses: (courses: CourseProp[]) => {
        set({ courses, lastFetchTime: Date.now() });
      },

      addCourse: (course: CourseProp) => {
        set((state) => ({
          courses: [...state.courses, course],
        }));
      },

      userCourses: [],
      setUserCourses: (courses: userCourseProp[]) => {
        set({ userCourses: courses });
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
        if (!state.lastFetchTime || state.courses.length === 0) {
          return false;
        }
        const timeSinceLastFetch = Date.now() - state.lastFetchTime;
        return timeSinceLastFetch < state.cacheDuration;
      },

      getCoursesByCategory: (category: string) => {
        const state = get();
        return state.courses.filter(
          (course) => course.category.name === category
        );
      },

      getCourseById: (id: string) => {
        const state = get();
        return state.courses.find((course) => course.id === Number(id));
      },

      getUserCourseById: (id: string) => {
        const state = get();
        return state.userCourses.find(
          (course) => course.course.id === Number(id)
        );
      },

      searchCourses: (query: string) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        return state.courses.filter(
          (course) =>
            course.title?.toLowerCase().includes(lowerQuery) ||
            course.description?.toLowerCase().includes(lowerQuery)
        );
      },

      clearCourses: () => {
        set({ courses: [], error: null });
      },
      updateResourceProgress: (
        courseId: number,
        resourceId: number,
        progress: {
          watchedDuration: number;
          totalDuration: number;
          isCompleted: number;
        }
      ) => {
        set((state) => {
          const userCourses = [...state.userCourses];
          const courseIndex = userCourses.findIndex(
            (c) => c.course.id === courseId
          );

          if (courseIndex !== -1) {
            const course = { ...userCourses[courseIndex] };
            const resourceIndex = course.course.resources.findIndex(
              (r) => r.id === resourceId
            );

            if (resourceIndex !== -1) {
              const resources = [...course.course.resources];
              const resource = { ...resources[resourceIndex] };

              // Initialize progress object if it doesn't exist
              if (!resource.progress) {
                resource.progress = {
                  completed_at: "",
                  is_completed: 0,
                  progress_id: "",
                  student_id: "",
                  last_watched_at: null,
                  has_started: false as any,
                  resource_id: null,
                  totalDuration: null,
                  watch_percentage: null,
                  watched_duration: null,
                };
              }

              resource.progress = {
                ...resource.progress,
                is_completed: progress.isCompleted,
                watched_duration: progress.watchedDuration as any,
                totalDuration: progress.totalDuration as any,
                // Calculate percentage
                watch_percentage: ((progress.watchedDuration /
                  progress.totalDuration) *
                  100) as any,
                has_started: true as any,
              };

              resources[resourceIndex] = resource;
              course.course.resources = resources;

              // Update overall course progress could be calculated here
              // For now simpler logic: count completed resources
              const completedCount = resources.filter(
                (r) => r.progress?.is_completed === 1
              ).length;
              const totalCount = resources.length;
              course.progress = Math.round((completedCount / totalCount) * 100);

              userCourses[courseIndex] = course;
            }
          }
          return { userCourses };
        });
      },

      addReview: (courseId: number, review: Reviews) => {
        set((state) => {
          // Update in userCourses
          const userCourses = [...state.userCourses];
          const userCourseIndex = userCourses.findIndex(
            (c) => c.course?.id === courseId
          );

          if (userCourseIndex !== -1) {
            const userCourse = userCourses[userCourseIndex];
            const updatedUserCourse = { 
              ...userCourse, 
              course: { 
                ...userCourse.course,
                reviews: Array.isArray(userCourse.course.reviews)
                  ? [...userCourse.course.reviews, review]
                  : [review]
              } 
            };
            userCourses[userCourseIndex] = updatedUserCourse;
          }

          // Update in general courses list if it exists there
          const courses = [...state.courses];
          const courseIndex = courses.findIndex((c) => c.id === courseId);
          if (courseIndex !== -1) {
            const course = courses[courseIndex];
            const updatedCourse = {
              ...course,
              reviews: Array.isArray(course.reviews)
                ? [...course.reviews, review]
                : [review]
            };
            courses[courseIndex] = updatedCourse;
          }

          return { userCourses, courses };
        });
      },
    }),
    {
      name: "courses-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
