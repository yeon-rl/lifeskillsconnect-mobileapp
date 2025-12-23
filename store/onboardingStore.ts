import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt';

interface OnboardingState {
  // State
  hasCompletedOnboarding: boolean;
  hasCompletedLanguageSelection: boolean;
  selectedLanguage: Language;
  isLoading: boolean;

  // Actions
  setHasCompletedOnboarding: (value: boolean) => void;
  setHasCompletedLanguageSelection: (value: boolean) => void;
  setSelectedLanguage: (language: Language) => void;
  setLoading: (loading: boolean) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Initial state
      hasCompletedOnboarding: false,
      hasCompletedLanguageSelection: false,
      selectedLanguage: 'en',
      isLoading: false,

      // Actions
      setHasCompletedOnboarding: (value) =>
        set({
          hasCompletedOnboarding: value,
        }),

      setHasCompletedLanguageSelection: (value) =>
        set({
          hasCompletedLanguageSelection: value,
        }),

      setSelectedLanguage: (language) =>
        set({
          selectedLanguage: language,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          hasCompletedLanguageSelection: false,
          selectedLanguage: 'en',
        }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
