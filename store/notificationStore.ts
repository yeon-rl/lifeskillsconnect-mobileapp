import { notificationService } from '@/services/api/apiServices';
import { create } from 'zustand';

export type NotificationCategory = 'GENERAL' | 'ACTIVITY' | 'SAFEGUARDING' | 'SAFE_SPACE';

export interface Notification {
  id: string | number;
  user_id: string | number;
  title: string;
  message: string;
  category: NotificationCategory;
  is_read: boolean | number;
  created_at: string;
  metadata?: Record<string, any>;
  icon?: string;
}

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: string | number) => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Actions
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationService.getUserNotifications();
      // Ensure notifications is an array
      const notificationsArray = Array.isArray(notifications) ? notifications : 
                               (notifications?.notifications && Array.isArray(notifications.notifications)) ? notifications.notifications : 
                               (notifications?.data && Array.isArray(notifications.data)) ? notifications.data : [];
      
      const unreadCount = notificationsArray.filter((n: Notification) => !n.is_read).length;
      set({ 
        notifications: notificationsArray, 
        unreadCount, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch notifications', 
        isLoading: false 
      });
    }
  },

  // Actions
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    set({
      notifications,
      unreadCount,
      error: null,
    });
  },

  addNotification: (notification) =>
    set((state) => {
      const notifications = [notification, ...state.notifications];
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return {
        notifications,
        unreadCount,
      };
    }),

  markAsRead: async (notificationId) => {
    // Optimistic update
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return {
        notifications,
        unreadCount,
      };
    });

    try {
      await notificationService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read on server:", error);
      // We don't necessarily want to revert the UI immediately for a "read" status
      // but we could refresh if needed.
    }
  },

  markAllAsRead: async () => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));

    try {
      await notificationService.markAllNotificationsAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read on server:", error);
    }
  },

  removeNotification: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.filter(
        (n) => n.id !== notificationId
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return {
        notifications,
        unreadCount,
      };
    }),

  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  updateUnreadCount: () => {
    const state = get();
    const unreadCount = state.notifications.filter((n) => !n.is_read).length;
    set({ unreadCount });
  },
}));
