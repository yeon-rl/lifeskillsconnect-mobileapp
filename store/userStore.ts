import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  profile_picture?: string;
  notifications_enabled: boolean;
  is_premium: boolean;
  reward_level?: string;
  total_points?: number;
  created_at?: string;
  updated_at?: string;
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
