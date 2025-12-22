import { useNotificationStore, useUserStore, type User } from '@/store';
import {
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from '@/utils/api';
import { useEffect } from 'react';

/**
 * Custom hook to fetch and manage notifications
 * Automatically fetches notifications when user is authenticated
 */
export const useNotifications = () => {
  const authToken = useUserStore((state) => state.authToken);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    setNotifications,
    setLoading,
    setError,
    markAsRead: markAsReadLocal,
    markAllAsRead: markAllAsReadLocal,
  } = useNotificationStore();

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && authToken) {
      loadNotifications();
    }
  }, [isAuthenticated, authToken]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      markAsReadLocal(notificationId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      markAllAsReadLocal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark all as read');
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh: loadNotifications,
    markAsRead,
    markAllAsRead,
  };
};

/**
 * Custom hook to manage user profile updates
 */
export const useUserProfile = () => {
  const { currentUser, updateUser, setLoading, setError } = useUserStore();

  const updateProfile = async (updates: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      // Import updateUserProfile from utils/api
      const { updateUserProfile } = await import('@/utils/api');
      const updatedUser = await updateUserProfile(updates);
      updateUser(updatedUser);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    updateProfile,
  };
};

/**
 * Custom hook to manage authentication
 */
export const useAuth = () => {
  const {
    isAuthenticated,
    authToken,
    currentUser,
    login,
    logout,
    isLoading,
    error,
    setLoading,
    setError,
    clearError,
  } = useUserStore();

  const handleLogin = async (email: string, password: string) => {
    clearError();
    setLoading(true);

    try {
      const { loginUser } = await import('@/utils/api');
      const response = await loginUser(email, password);
      login(response.user, response.token);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }) => {
    clearError();
    setLoading(true);

    try {
      const { registerUser } = await import('@/utils/api');
      const response = await registerUser(userData);
      login(response.user, response.token);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Clear notifications on logout
    useNotificationStore.getState().clearNotifications();
  };

  return {
    isAuthenticated,
    authToken,
    currentUser,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  };
};

/**
 * Custom hook to sync user premium status
 */
export const usePremiumStatus = () => {
  const isPremium = useUserStore((state) => state.currentUser?.is_premium ?? false);
  const updateUser = useUserStore((state) => state.updateUser);

  const setPremiumStatus = (status: boolean) => {
    updateUser({ is_premium: status });
  };

  return {
    isPremium,
    setPremiumStatus,
  };
};

/**
 * Custom hook to manage notification preferences
 */
export const useNotificationPreferences = () => {
  const notificationsEnabled = useUserStore(
    (state) => state.currentUser?.notifications_enabled ?? true
  );
  const { updateProfile } = useUserProfile();

  const toggleNotifications = async () => {
    const newStatus = !notificationsEnabled;
    const result = await updateProfile({ notifications_enabled: newStatus });
    return result;
  };

  return {
    notificationsEnabled,
    toggleNotifications,
  };
};
