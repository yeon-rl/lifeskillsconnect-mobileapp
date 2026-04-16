
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { AppState, AppStateStatus, GestureResponderEvent, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { SplashScreenWrapper } from "@/components/splash-screens/SplashScreenWrapper";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider/index";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { ThemeProvider as CustomThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import "@/global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserStore } from "@/store/userStore";
import { Toaster } from "sonner-native";



export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { hasCompletedOnboarding, hasCompletedLanguageSelection, isHydrated: isOnboardingHydrated } =
    useOnboarding();
  const segments = useSegments();
  const router = useRouter();
  const { lastActiveAt, updateLastActive, logout, isAuthenticated, _hasHydrated: isUserHydrated } = useUserStore();

  const SESSION_TIMEOUT = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

  const [splashComplete, setSplashComplete] = useState(false);
  const [appReady, setAppReady] = useState(false);



  // Prevent the native splash from auto-hiding
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
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
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  // Auth Protection Logic
  useEffect(() => {
    if (!isOnboardingHydrated || !isUserHydrated || !splashComplete) return;

    const inAuthGroup = segments[0] === "(auth)";
    
    if (!isAuthenticated && !inAuthGroup && hasCompletedOnboarding && hasCompletedLanguageSelection) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isOnboardingHydrated, isUserHydrated, splashComplete, hasCompletedLanguageSelection, hasCompletedOnboarding, router]);

  // Session Timeout Logic
  useEffect(() => {
    if (!isAuthenticated || !isUserHydrated) return;

    const checkSession = () => {
      if (lastActiveAt) {
        const now = Date.now();
        const elapsed = now - lastActiveAt;
        if (elapsed >= SESSION_TIMEOUT) {
          logout();
          router.replace("/(auth)/login");
        }
      }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        checkSession();
        updateLastActive();
      } else {
        // App is backgrounded or inactive, update last active so we know when they left
        updateLastActive();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    // Periodic check while app is active
    const interval = setInterval(() => {
      if (AppState.currentState === "active") {
        updateLastActive();
      }
    }, 60000); // Update every minute while active

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [isAuthenticated, isUserHydrated, lastActiveAt, logout, router, updateLastActive]);

  const handleTouch = () => {
    if (isAuthenticated) {
      updateLastActive();
    }
  };

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={() => {
        handleTouch();
        return false;
      }}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GluestackUIProvider mode={colorScheme}>
          {!splashComplete ? (
            <SplashScreenWrapper
              isReady={appReady && isOnboardingHydrated && isUserHydrated}
              onSplashHide={() => setSplashComplete(true)}
              splashDuration={2500}
            />
          ) : !hasCompletedOnboarding ? (
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
          <StatusBar hidden={true} />
          <Toaster />
          <GlobalLoader />
        </GluestackUIProvider>
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CustomThemeProvider>
          <UserProvider>
            <OnboardingProvider>
              <RootLayoutNav />
            </OnboardingProvider>
          </UserProvider>
        </CustomThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
