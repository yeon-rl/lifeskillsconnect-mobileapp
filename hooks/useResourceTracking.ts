import { useCoursesStore } from '@/store/courseStore';
import { useUserStore } from '@/store/userStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface TrackingData {
  resourceId: number;
  courseId: number;
  totalDuration: number;
  watchedDuration: number;
  isCompleted: boolean;
}

export const useResourceTracking = (courseId: number, initialResourceId: number | null, passedUserId?: string) => {
  const { updateResourceProgress, getUserCourseById } = useCoursesStore();
  const { currentUser } = useUserStore();

  // Resolve userId: 1. passed argument, 2. store.userId, 3. store.id (fallback)
  const userId = passedUserId || currentUser?.userId?.toString() || (currentUser as any)?.id?.toString();

  // Debug log for userId resolution
  // console.log(`[TRACKING] Resolved userId: ${userId || 'UNDEFINED'}`, {
  //   passedUserId,
  //   storeUserId: currentUser?.userId,
  //   storeId: (currentUser as any)?.id
  // });

  const [currentResourceId, setCurrentResourceId] = useState<number | null>(initialResourceId);
  const [isPlaying, setIsPlaying] = useState(false);
  const trackingDataRef = useRef<TrackingData | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to ref for callbacks/intervals
  const updateTrackingData = useCallback((data: Partial<TrackingData>) => {
    if (!trackingDataRef.current && currentResourceId) {
      trackingDataRef.current = {
        resourceId: currentResourceId,
        courseId,
        totalDuration: 0,
        watchedDuration: 0,
        isCompleted: false,
        ...data
      };
    } else if (trackingDataRef.current) {
      trackingDataRef.current = { ...trackingDataRef.current, ...data };
    }
  }, [courseId, currentResourceId]);

  const saveProgress = useCallback(async (force = false) => {
    const data = trackingDataRef.current;
    
    // Level 0: Log every single call entrance
    // console.log(`[TRACKING] saveProgress called (force: ${force})`, {
    //     hasData: !!data,
    //     userId: userId || 'UNDEFINED',
    //     resourceId: data?.resourceId || 'UNDEFINED',
    //     timeSinceLastSave: Date.now() - lastSavedTimeRef.current
    // });
    
    if (!data || !userId || !data.resourceId) {
        return;
    }

    // Only allow background tracking if playing, unless it's a forced save (completion, app background)
    if (!isPlaying && !force) {
        return;
    }

    const now = Date.now();
    
    // Level 1: Data validation
    if (data.totalDuration <= 0) {
        // Only log this specifically once to avoid spam, but still prevent sync
        if (lastSavedTimeRef.current === 0) {
            // console.log(`[TRACKING] Skipping sync: Total duration is 0 for Resource: ${data.resourceId}`);
        }
        return;
    }

    // Pulse check: save every 5 seconds OR if forced
    if (!force && now - lastSavedTimeRef.current < 5000) {
        return;
    }

    const watchedSeconds = Math.min(Math.floor(data.watchedDuration), Math.floor(data.totalDuration));
    const totalSeconds = Math.floor(data.totalDuration);

    // console.log(`[TRACKING] >> TRIGGERING BACKEND SYNC for Resource: ${data.resourceId}`, {
    //   watchedSeconds,
    //   totalSeconds,
    //   isCompleted: data.isCompleted
    // });

    try {
      await updateResourceProgress(data.courseId, data.resourceId, userId, {
        watchedDuration: watchedSeconds,
        totalDuration: totalSeconds,
        isCompleted: data.isCompleted ? 1 : 0,
      });
      console.log(`[TRACKING] Sync successful for Resource: ${data.resourceId}`);
      lastSavedTimeRef.current = now;
    } catch (error) {
      console.error('[TRACKING] Sync failed:', error);
    }
  }, [userId, updateResourceProgress, isPlaying]);

  // Handle resource change
  useEffect(() => {
    if (currentResourceId !== trackingDataRef.current?.resourceId) {
      console.log(`DEBUG: Resource changed to ${currentResourceId}. Previous was ${trackingDataRef.current?.resourceId}`);
      // Save previous resource progress before switching
      if (trackingDataRef.current) {
        saveProgress(true);
      }
      
      // Initialize new tracking data
      if (currentResourceId) {
        const userCourse = getUserCourseById(courseId.toString());
        const courseData = (userCourse?.course || userCourse) as any;

        // API structure: course.lessons[].resources[] — search all lessons for this resource
        let resource: any = null;
        if (Array.isArray(courseData?.lessons)) {
          for (const lesson of courseData.lessons) {
            if (Array.isArray(lesson.resources)) {
              const found = lesson.resources.find((r: any) => r.id === currentResourceId);
              if (found) { resource = found; break; }
            }
          }
        }
        
        // console.log(`DEBUG: Initializing tracking for resource ${currentResourceId}. Cached progress:`, resource?.progress);

        trackingDataRef.current = {
          resourceId: currentResourceId,
          courseId,
          totalDuration: resource?.duration || 0,
          watchedDuration: Number(resource?.progress?.watched_duration) || 0,
          isCompleted: resource?.progress?.is_completed === true || resource?.progress?.is_completed === 1,
        };
      } else {
        trackingDataRef.current = null;
      }
    }
  }, [currentResourceId, courseId, saveProgress, getUserCourseById]);


  // Pulse Timer
  useEffect(() => {
    pulseIntervalRef.current = setInterval(() => {
      saveProgress();
    }, 5000) as any;

    return () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    };
  }, [saveProgress]);

  // Handle App State Changes (Background/Terminate)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        // console.log('DEBUG: App state changed to', nextAppState, '- forcing progress save');
        saveProgress(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [saveProgress]);

  // Video Progress Update Handler
  const handleVideoProgress = useCallback((millis: number, duration: number) => {
    if (!currentResourceId) return;

    const watchedSec = millis / 1000;
    const totalSec = duration / 1000;
    const isCompleted = watchedSec / totalSec >= 0.95;

    // Only log periodically or on major changes to avoid spam
    if (Math.floor(watchedSec) % 5 === 0 && Math.floor(watchedSec) !== Math.floor(trackingDataRef.current?.watchedDuration || 0)) {
        // console.log(`DEBUG: Video progress tracking: ${watchedSec.toFixed(1)}s / ${totalSec.toFixed(1)}s (${(watchedSec/totalSec*100).toFixed(1)}%)`, {
        //     resourceId: currentResourceId,
        //     courseId,
        //     watchedDuration: watchedSec,
        //     totalDuration: totalSec,
        //     isCompleted: isCompleted || (trackingDataRef.current?.isCompleted ?? false)
        // });
    }

    updateTrackingData({
      watchedDuration: watchedSec,
      totalDuration: totalSec,
      isCompleted: isCompleted || (trackingDataRef.current?.isCompleted ?? false)
    });

    // If just hit 95%, force save
    if (isCompleted && !trackingDataRef.current?.isCompleted) {
        console.log('DEBUG: Video hit 95% completion threshold - forcing save');
        saveProgress(true);
    }
  }, [currentResourceId, updateTrackingData, saveProgress]);

  // Manual completion (for articles/non-video)
  const markAsComplete = useCallback(async () => {
    if (!currentResourceId || !userId) return;
    
    updateTrackingData({ isCompleted: true });
    await saveProgress(true);
  }, [currentResourceId, userId, updateTrackingData, saveProgress]);

  return {
    setCurrentResourceId,
    handleVideoProgress,
    markAsComplete,
    setIsPlaying,
    currentProgress: trackingDataRef.current,
  };
};
