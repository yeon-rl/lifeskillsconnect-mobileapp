import apiClient from './apiClient';

interface LoginData {
  email: string;
  password: string;
}

/**
 * Example service for authentication related API calls
 */
export const authService = {
  /**
   * Login request example
   * @param data 
   */
  login: async (data: LoginData) => {
    try {
      const response = await apiClient.post('/auth/login', data);
      return response.data;
    } catch (error) {
      // Errors are already logged in apiClient interceptors
      throw error;
    }
  },

  /**
   * Get user profile example
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update profile example
   */
//   updateProfile: async (userData) => {
//     try {
//       const response = await apiClient.patch('/auth/profile', userData);
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   }
};

/**
 * Service for course related API calls
 */
export const courseService = {
  /**
   * Get all available courses
   */
  getAllCourses: async () => {
    try {
      const response = await apiClient.get('/courses/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Subscribe a user to a course
   * @param courseId 
   * @param userId 
   */
  subscribeToCourse: async (courseId: string, userId: string) => {
    try {
      const response = await apiClient.post('/courses/subscribe', { 
        courseId, 
        userId 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get courses for a specific user
   * @param userId 
   */
  getUserCourses: async (userId: string) => {
    try {
      // Using params for GET request as it's standard for Axios
      const response = await apiClient.get('/courses/my-courses', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
