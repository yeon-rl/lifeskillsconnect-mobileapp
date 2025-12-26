import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SplashScreenWrapper } from "@/components/splash-screens/SplashScreenWrapper";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { ThemeProvider as CustomThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import "@/global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserStore } from "@/store/userStore";



export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { hasCompletedOnboarding, hasCompletedLanguageSelection, isHydrated: isOnboardingHydrated } =
    useOnboarding();
  const { _hasHydrated: isUserHydrated } = useUserStore();

  const [splashComplete, setSplashComplete] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Prevent the native splash from auto-hiding
  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we prepare the app
        await SplashScreen.preventAutoHideAsync();
        // App is ready to show custom splash
        setAppReady(true);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  // Hide native splash when custom splash is ready to show
  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors if splash screen is already hidden
      });
    }
  }, [appReady]);

  // Show custom splash screen first, then navigate based on onboarding status
  if (!splashComplete) {
    return (
      <SplashScreenWrapper
        isReady={appReady && isOnboardingHydrated && isUserHydrated}
        onSplashHide={() => setSplashComplete(true)}
        splashDuration={2500}
      />
    );
  }

  // Navigation is now safe to render as state is ready and splash is finished

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {!hasCompletedOnboarding ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" />
        </Stack>
      ) : !hasCompletedLanguageSelection ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
        </Stack>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="crisis-help" options={{ headerShown: false }} />
          <Stack.Screen name="support" options={{ headerShown: false }} />
          <Stack.Screen name="module-detail/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function RootLayoutWrapper() {
  const colorScheme = useColorScheme();
  
  return (
    <GluestackUIProvider mode={colorScheme}>
      <RootLayoutNav />
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <UserProvider>
          <OnboardingProvider>
            <RootLayoutWrapper />
          </OnboardingProvider>
        </UserProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
