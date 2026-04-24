import apiClient from './apiClient';

interface LoginData {
  email: string;
  password: string;
}

/**
 * Service for authentication related API calls
 */
export const authService = {
  /**
   * Login request
   */
  login: async (data: LoginData) => {
    try {
      const response = await apiClient.post('/auth/login', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Signup request
   */
  signup: async (data: {
    email: string;
    password: string;
    preferredLanguage?: string | null;
  }) => {
    try {
      const response = await apiClient.post("/auth/signup", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify OTP request
   */
  verifyOTP: async (data: { email: string; otp: string }) => {
    try {
      const response = await apiClient.post("/auth/verify-otp", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Resend OTP request
   */
  resendOTP: async (data: { email: string }) => {
    try {
      const response = await apiClient.post("/auth/resend-otp", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Complete user profile
   */
  completeProfile: async (data: {
    userId: number;
    fullname: string;
    username: string;
    phone: string;
    nationality: string;
    date_of_birth: string;
    heardAboutUs: string;
  }) => {
    try {
      const response = await apiClient.post("/auth/complete-profile", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },



  /**
   * Apple authentication
   */
  appleAuth: async (data: { token: string; user?: any }) => {
    try {
      const response = await apiClient.post("/auth/apple", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get available languages
   */
  getLanguages: async () => {
    try {
      const response = await apiClient.get("/languages");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user interests
   */
  updateInterests: async (data: { userId: number; interests: string[] }) => {
    try {
      const response = await apiClient.post("/auth/update-interests", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user profile
   */
  getProfile: async (token?: string) => {
    try {
      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const response = await apiClient.get('/auth/profile', config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request Password Reset OTP (Unauthenticated)
   */
  forgotPassword: async (data: { email: string }) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify Reset OTP (Unauthenticated)
   */
  verifyResetOTP: async (data: { email: string; otp: string }) => {
    try {
      const response = await apiClient.post("/auth/verify-reset-otp", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset Password (Unauthenticated)
   */
  resetPassword: async (data: { email: string; newPassword: string }) => {
    try {
      const response = await apiClient.post("/auth/reset-password", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
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

  /**
   * Get a single course by ID
   * @param courseId 
   * @param token Optional token for authorization (if not using global auth)
   */
  getCourseById: async (courseId: string, token?: string) => {
    try {
      const config: any = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`/courses/${courseId}`, config);

      console.log('Full Response:', JSON.stringify(response.data, null, 2), "where is assessments");

      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Update progress for a specific resource
   * @param data 
   */
  updateResourceProgress: async (data: {
    resourceId: number;
    userId: string;
    watchedDuration: number;
    totalDuration: number;
    isCompleted: boolean;
  }) => {
    try {
      const payload = {
        resourceId: data.resourceId,
        watchedDuration: data.watchedDuration,
        totalDuration: data.totalDuration,
        isCompleted: data.isCompleted
      };
      
      console.log('[API] POST /progress/track-resource payload:', JSON.stringify(payload, null, 2));

      // @ts-ignore - custom config property to skip global loader (silent background tracking)
      const response = await apiClient.post('/progress/track-resource', payload, { skipGlobalLoader: true });
      
      console.log('[API] POST /progress/track-resource response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error("[API] POST /progress/track-resource error:", error?.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get quiz for a specific resource
   * @param resourceId 
   */
  getResourceQuiz: async (resourceId: number) => {
    try {
      console.log('[API] getResourceQuiz called for:', resourceId);
      const response = await apiClient.get(`/resource-quizzes/${resourceId}`);
      console.log('[API] Quiz data received:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz for resource ${resourceId}:`, error);
      throw error;
    }
  },

  /**
   * Submit answers for a resource quiz
   * @param resourceId 
   * @param answers 
   */
  submitResourceQuiz: async (
    resourceId: number,
    answers: { [questionId: number]: number }
  ) => {
    try {
      const response = await apiClient.post(
        `/resource-quizzes/${resourceId}/submit`,
        { answers }
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting resource quiz:", error);
      throw error;
    }
  },

  /**
   * Skip a resource quiz
   * @param resourceId 
   */
  skipResourceQuiz: async (resourceId: number) => {
    try {
      const response = await apiClient.post(
        `/resource-quizzes/${resourceId}/skip`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error("Error skipping resource quiz:", error);
      throw error;
    }
  },

  /**
   * Submit answers for a course assessment
   * @param assessmentId 
   * @param answers 
   * @param token 
   */
  submitAssessment: async (
    assessmentId: number,
    answers: { [questionId: string]: number },
    token: string
  ) => {
    try {
      const config: any = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Authorization header set with token");
      }

      const response = await apiClient.post(
        `/assessments/submit/${assessmentId}`,
        { answers },
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting assessment:", error);
      throw error;
    }
  },
};

/**
 * Service for notification related API calls
 */
export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  getUserNotifications: async () => {
    try {
      const response = await apiClient.get(`/notifications`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param notificationId 
   */
  markNotificationAsRead: async (notificationId: number | string) => {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/read`, {});
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead: async () => {
    try {
      const response = await apiClient.post(`/notifications/mark-all-read`, {});
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
};

/**
 * Service for reporting abuse
 */
export const reportService = {
  /**
   * Submit an abuse report
   * @param data 
   * @param token Optional token for authorization
   */
  reportAbuse: async (data: {
    reported_entity: string;
    report_type: string;
    report_subject: string;
    description: string;
    evidence?: any;
    contact_preference?: 'Always' | 'Only if necessary' | 'None';
    additional_details?: string;
    keep_me_updated?: boolean;
  }, token?: string) => {
    try {
      const config: any = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const response = await apiClient.post("/reports", data, config);
      return response.data;
    } catch (error) {
      console.error("Error reporting abuse:", error);
      throw error;
    }
  },
};

/**
 * Service for user points and reward level
 */
export const pointsService = {
  /**
   * Get user points and reward level
   * @param token 
   */
  getUserPoints: async (token: string) => {
    try {
      const config: any = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const response = await apiClient.get(`/points/user-points`, config);
      return response.data;
    } catch (error) {
      console.error("Error fetching user points:", error);
      throw error;
    }
  },
};
/**
 * Service for user related API calls
 */
export const userService = {
  /**
   * Change password request
   */
  changePassword: async (data: { newPassword: string }, token: string) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await apiClient.post("/users/change-password", data, config);
      return response.data;
    } catch (error: any) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  /**
   * Request password OTP
   */
  requestPasswordOTP: async (data: { email?: string; phone?: string }, token?: string) => {
    try {
      const config: any = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const response = await apiClient.post("/users/request-password-otp", data, config);
      return response.data;
    } catch (error) {
      console.error("Error requesting password OTP:", error);
      throw error;
    }
  },

  /**
   * Verify password OTP
   */
  verifyPasswordOTP: async (data: { email?: string; phone?: string; otp: string }, token?: string) => {
    try {
      const config: any = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const response = await apiClient.post("/users/verify-password-otp", data, config);
      return response.data;
    } catch (error) {
      console.error("Error verifying password OTP:", error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (
    data: {
      userId: string;
      fullname?: string;
      username?: string;
      phoneNumber?: string;
      userImage?: string;
      nationality?: string;
      preferred_language?: string;
      notifications_enabled?: boolean;
    },
    token: string
  ) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await apiClient.put("/users/update-profile", data, config);
      return response.data;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  /**
   * Request account deletion
   */
  requestAccountDeletion: async (token: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await apiClient.post("/users/request-deletion", {}, config);
      return response.data;
    } catch (error: any) {
      console.error("Error requesting account deletion:", error);
      throw error;
    }
  },
};

/**
 * Service for subscription related API calls
 */
export const subscriptionService = {
  /**
   * Create a checkout session
   */
  createCheckoutSession: async (plan: string, token?: string) => {
    try {
      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const response = await apiClient.post("/subscriptions/create-checkout-session", { plan }, config);
      return response.data;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  },

  /**
   * Verify a subscription session
   */
  verifySubscriptionSession: async (sessionId: string, token?: string) => {
    try {
      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const response = await apiClient.get(`/subscriptions/verify-session/${sessionId}`, config);
      return response.data;
    } catch (error) {
      console.error("Error verifying subscription session:", error);
      throw error;
    }
  },

  /**
   * Verify Apple IAP Receipt
   * TODO: Connect to backend endpoint provided by user
   */
  verifyIAPReceipt: async (receipt: string, token?: string) => {
    try {
      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      // Placeholder endpoint
      const response = await apiClient.post("/subscriptions/verify-iap", { receipt }, config);
      return response.data;
    } catch (error) {
      console.error("Error verifying IAP receipt:", error);
      throw error;
    }
  },

  /**
   * Fetch Stripe PaymentIntent parameters for Android
   * TODO: Connect to backend endpoint provided by user
   */
  getStripePaymentIntent: async (plan: string, token?: string) => {
    try {
      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      // Placeholder endpoint
      const response = await apiClient.post("/subscriptions/stripe-intent", { plan }, config);
      return response.data;
    } catch (error) {
      console.error("Error fetching Stripe intent:", error);
      throw error;
    }
  },
};

/**
 * Service for job related API calls
 */
export const jobService = {
  /**
   * Get filtered jobs
   */
  getJobs: async (params?: { location?: string; roleType?: string; datePosted?: string; search?: string }) => {
    try {
      const response = await apiClient.get('/jobs', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  },

  /**
   * Get user-specific jobs (applied, saved)
   */
  getUserJobs: async (status: 'applied' | 'saved', token?: string) => {
    try {
      const config: any = {
        params: { status }
      };
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const response = await apiClient.get('/jobs/user-jobs', config);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${status} jobs:`, error);
      throw error;
    }
  },

  /**
   * Save or update job status for user
   */
  updateUserJobStatus: async (data: { job_id: string; status: 'applied' | 'saved' }, token?: string) => {
    try {
      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const response = await apiClient.post('/jobs/user-jobs', data, config);
      return response.data;
    } catch (error) {
      console.error(`Error updating job ${data.job_id} status to ${data.status}:`, error);
      throw error;
    }
  },

  /**
   * Apply for a job with CV and cover letter
   */
  applyToJob: async (data: { job_id: string; cv: string; cover_letter: string }, token?: string) => {
    try {
      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const response = await apiClient.post('/jobs/user-jobs', {
        ...data,
        status: 'applied'
      }, config);
      return response.data;
    } catch (error) {
      console.error(`Error applying for job ${data.job_id}:`, error);
      throw error;
    }
  }
};

/**
 * Service for wellbeing related API calls
 */
export const wellbeingService = {
  /**
   * Get wellbeing questions from the API
   */
  getWellbeingQuestions: async () => {
    try {
      const response = await apiClient.get('/wellbeing/questions');
      return response.data;
    } catch (error) {
      console.error("Error fetching wellbeing questions:", error);
      throw error;
    }
  },

  /**
   * Submit wellbeing check answers
   */
  submitWellbeingAnswers: async (formattedAnswers: any[]) => {
    try {
      const response = await apiClient.post('/wellbeing/answers', {
        data: formattedAnswers
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting wellbeing answers:", error);
      throw error;
    }
  }
};
