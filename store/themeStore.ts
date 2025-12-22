import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  // State
  themeMode: ThemeMode;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // Initial state
      themeMode: 'light',

      // Actions
      setThemeMode: (mode) =>
        set({
          themeMode: mode,
        }),

      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hook to get the computed isDark value
export const useIsDark = () => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const systemColorScheme = useColorScheme();

  return (
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark')
  );
};
