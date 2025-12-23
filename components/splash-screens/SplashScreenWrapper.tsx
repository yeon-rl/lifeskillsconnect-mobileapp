import { useUser } from "@/context/UserContext";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { NormalUserSplash } from "./NormalUserSplash";
import { PremiumUserSplash } from "./PremiumUserSplash";

interface SplashScreenWrapperProps {
  onSplashHide?: () => void;
  splashDuration?: number;
  isReady?: boolean;
}

export function SplashScreenWrapper({
  onSplashHide,
  splashDuration = 2500,
  isReady = true,
}: SplashScreenWrapperProps) {
  const { isPremium } = useUser();

  useEffect(() => {
    if (!isReady) return;

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
        onSplashHide?.();
      } catch (error) {
        console.error("Failed to hide splash screen:", error);
      }
    };

    const timer = setTimeout(hideSplash, splashDuration);

    return () => clearTimeout(timer);
  }, [splashDuration, onSplashHide, isReady]);

  return (
    <View style={{ flex: 1 }}>
      {isPremium ? <PremiumUserSplash /> : <NormalUserSplash />}
    </View>
  );
}
