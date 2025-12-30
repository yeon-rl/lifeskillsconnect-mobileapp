import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  userId: number;
  fullname: string;
  username: string;
  phone: string;
  date_of_birth?: string;
  notifications_enabled: boolean;
  is_premium: boolean;
  reward_level?: string;
  total_points?: number;
  howHeard: string;
  nationality: string;
  userImage: string | null;
  preferred_language: string;
  country?: {
    name: string;
    code: string;
    dial: string;
    flag: string;
  };

  totalPoints?: number;
  watchedCourses?: {
    courseId: string;
    courseName: string;
    points: number;
    completedAt: string;
  }[];
}



interface UserState {
  // State
  currentUser: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setAuthToken: (token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      currentUser: null,
      authToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) =>
        set({
          currentUser: user,
          isAuthenticated: true,
          error: null,
        }),

      setAuthToken: (token) =>
        set({
          authToken: token,
        }),

      updateUser: (updates) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates }
            : null,
        })),

      login: (user, token) =>
        set({
          currentUser: user,
          authToken: token,
          isAuthenticated: true,
          error: null,
        }),

      logout: () =>
        set({
          currentUser: null,
          authToken: null,
          isAuthenticated: false,
          error: null,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      setError: (error) =>
        set({
          error,
        }),

      clearError: () =>
        set({
          error: null,
        }),
      
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
