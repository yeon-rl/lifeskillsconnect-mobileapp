import { useUiStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import axios from 'axios';
import { toast } from 'sonner-native';

// Get API URL from environment variables
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://lsc-api.accordiaharmony.org/api';

console.log('🚀 API Client Initialized with BASE_URL:', BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // 'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request Interceptor: Add auth tokens or secret keys here
apiClient.interceptors.request.use(
  (config) => {
    // Example: Add a secret key from env to every request
    const secretKey = process.env.EXPO_PUBLIC_API_SECRET_KEY;
    if (secretKey) {
      config.headers['X-Api-Key'] = secretKey;
    }
    
    // Add Auth Token from userStore if available
    const { authToken, updateLastActive } = useUserStore.getState();
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
      updateLastActive();
    }
    
    // Start global loading only if not explicitly skipped
    // @ts-ignore - custom config property
    if (!config.skipGlobalLoader) {
      useUiStore.getState().setIsLoading(true);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors
apiClient.interceptors.response.use(
  (response) => {
    // Stop global loading on success only if it was started
    // @ts-ignore - custom config property
    if (!response.config.skipGlobalLoader) {
      useUiStore.getState().setIsLoading(false);
    }
    
    // Log successful response for debugging
    console.log(`API Response [${response.config.method?.toUpperCase()}] ${response.config.url}:`, response.data);
    
    return response;
  },
  (error) => {
    // Stop global loading on error only if it was started
    // @ts-ignore - custom config property
    if (!error.config?.skipGlobalLoader) {
      useUiStore.getState().setIsLoading(false);
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
      
      // ONLY show toast for specific auth errors as requested
      const authErrorMessages = ['invalid email or password', 'invalid credentials', 'user not found', 'already subscribed', 'subscription failed'];
      if (authErrorMessages.some(msg => errorMessage.toLowerCase().includes(msg))) {
        toast.error(errorMessage);
      }
      
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      // toast.error('No response from server. Please check your connection.');
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      // toast.error(error.message);
      console.error('API setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
