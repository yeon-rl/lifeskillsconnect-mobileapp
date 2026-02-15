import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SplashScreenWrapper } from "@/components/splash-screens/SplashScreenWrapper";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
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
  const { _hasHydrated: isUserHydrated, isAuthenticated } = useUserStore();
  const segments = useSegments();
  const router = useRouter();

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

  // Auth Protection Logic
  useEffect(() => {
    if (!isOnboardingHydrated || !isUserHydrated || !splashComplete) return;

    const inAuthGroup = segments[0] === "(auth)";
    
    if (!isAuthenticated && !inAuthGroup && hasCompletedOnboarding && hasCompletedLanguageSelection) {
      // Redirect to login if not authenticated and not in auth group
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and trying to access auth group
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isOnboardingHydrated, isUserHydrated, splashComplete]);

  // Navigation is now safe to render as state is ready and splash is finished

  const content = (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
    </ThemeProvider>
  );

  if (Platform.OS === 'android') {
    return (
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
      >
        {content}
      </StripeProvider>
    );
  }

  return content;
}

function RootLayoutWrapper() {
  const colorScheme = useColorScheme();
  
  useEffect(() => {
    // Initialize IAP connection (Commented out to fix E_IAP_NOT_AVAILABLE)
    /*
    const initializeIAP = async () => {
      try {
        await setup();
        if (Platform.OS === 'android') {
          await flushFailedPurchasesCachedAsPendingAndroid();
        }
      } catch (err) {
        console.warn("IAP initialization failed", err);
      }
    };
    initializeIAP();
    */
  }, []);

  return (
    <GluestackUIProvider mode={colorScheme}>
      <RootLayoutNav />
    </GluestackUIProvider>
  );
}

// const WrappedRootLayout = withIAPContext(RootLayoutWrapper);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CustomThemeProvider>
          <UserProvider>
            <OnboardingProvider>
              <RootLayoutWrapper />
            </OnboardingProvider>
          </UserProvider>
        </CustomThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
