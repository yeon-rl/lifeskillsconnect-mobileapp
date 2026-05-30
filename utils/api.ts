import { useUserStore } from '@/store';
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://lsc-api.accordiaharmony.org/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().authToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;

// Example API functions

/**
 * Login user
 */
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Register user
 */
export const registerUser = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Get current user profile
 */
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates: {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  profile_picture?: string;
  notifications_enabled?: boolean;
}) => {
  const response = await api.put('/users/profile', updates);
  return response.data;
};

/**
 * Change password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await api.post('/users/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
};

/**
 * Delete user account
 */
export const deleteUserAccount = async () => {
  const response = await api.delete('/users/account');
  return response.data;
};

/**
 * Fetch notifications
 */
export const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

/**
 * Get all crisis help services
 */
export const getCrisesHelp = async () => {
  try {
    const response = await api.get('/crisis-help');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Start an anonymous chat session
 */
export const startAnonymousChat = async (initialMessage?: string) => {
  const body = initialMessage ? { message: initialMessage } : {};
  const response = await api.post('/support/start', body);
  return response.data;
};

/**
 * Send a message in an anonymous chat
 */
export const sendSupportMessage = async (chatId: string, message: string) => {
  const response = await api.post('/support/message', {
    chatId,
    message,
    senderType: 'user',
  });
  return response.data;
};

/**
 * Fetch chat history for a session
 */
export const getChatHistory = async (chatId: string) => {
  const response = await api.get(`/support/history/${chatId}`);
  return response.data;
};
