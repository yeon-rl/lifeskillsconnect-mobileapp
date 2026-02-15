import { courseService } from '@/services/api/apiServices';
import { useCoursesStore } from '@/store/courseStore';
import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook to fetch all courses and store them in Zustand
 * Includes caching logic to avoid unnecessary API calls
 */
export const useFetchCourses = (forceRefresh: boolean = false) => {
  const {
    courses,
    setCourses,
    isLoading,
    setIsLoading,
    error,
    setError,
    isCacheValid,
  } = useCoursesStore();

  const fetchCourses = useCallback(async () => {
    // Skip if cache is valid and not forcing refresh
    if (!forceRefresh && isCacheValid()) {
      console.log('Using cached courses data');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await courseService.getAllCourses();
      // console.log('API Response for getAllCourses:', JSON.stringify(data, null, 2));
      setCourses(data);
      // console.log('Courses fetched and stored successfully:', Array.isArray(data) ? data.length : 'NOT AN ARRAY');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch courses';
      setError(errorMessage);
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [forceRefresh, isCacheValid, setCourses, setIsLoading, setError]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses,
  };
};

/**
 * Custom hook to fetch a single course by ID and optionally store it
 * @param courseId - The ID of the course to fetch
 * @param token - Optional authorization token
 * @param forceRefresh - If false, uses cached data; if true (default), fetches fresh data from API
 */
export const useFetchCourseById = (courseId: string | null, token?: string, forceRefresh: boolean = true) => {
  const {
    getCourseById: getCachedCourse,
    addCourse,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useCoursesStore();

  const [fetchedCourse, setFetchedCourse] = useState<any>(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return null;

    // Check if course exists in cache first (skip cache if forceRefresh is true)
    if (!forceRefresh) {
      const cachedCourse = getCachedCourse(courseId);
      if (cachedCourse) {
        console.log('Using cached course data for ID:', courseId);
        setFetchedCourse(cachedCourse);
        return cachedCourse;
      }
    } else {
      console.log('Force refresh enabled, fetching fresh course data for ID:', courseId);
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await courseService.getCourseById(courseId, token);
      
      // The API now returns a wrapper { message, course, ... } 
      // We need to store just the course object in our general courses store
      const courseData = data.course || data;
      
      // Add to store (will update existing course if already there)
      addCourse(courseData);
      setFetchedCourse(courseData);
      console.log('Course fetched and stored successfully:', courseId);
      return courseData;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch course';
      setError(errorMessage);
      console.error(`Error fetching course ${courseId}:`, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [courseId, token, forceRefresh, getCachedCourse, addCourse, setIsLoading, setError]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return {
    course: fetchedCourse,
    isLoading,
    error,
    refetch: fetchCourse,
  };
};

/**
 * Custom hook to fetch user's enrolled courses
 * @param userId - The ID of the user to fetch courses for
 */
export const useFetchUserCourses = (userId: string | number | null | undefined) => {
  const {
    userCourses,
    setUserCourses,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useCoursesStore();

  const fetchUserCourses = useCallback(async () => {
    if (!userId) {
      console.log('No userId provided, skipping user courses fetch');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await courseService.getUserCourses(userId.toString());
      
      // Normalize data: if it comes back as { courses: [...] }, map it to subscriptions
      let normalizedData = data;
      if (data && data.courses && !data.subscriptions) {
        normalizedData = {
          ...data,
          subscriptions: data.courses
        };
      }
      
      setUserCourses(normalizedData);
      console.log('User courses fetched and stored successfully:', normalizedData?.subscriptions?.length || 0);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch user courses';
      setError(errorMessage);
      console.error('Error fetching user courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, setUserCourses, setIsLoading, setError]);

  useEffect(() => {
    fetchUserCourses();
  }, [fetchUserCourses]);

  return {
    userCourses,
    isLoading,
    error,
    refetch: fetchUserCourses,
  };
};

