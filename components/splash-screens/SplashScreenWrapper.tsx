import { useUser } from "@/context/UserContext";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { NormalUserSplash } from "./NormalUserSplash";
import { PremiumUserSplash } from "./PremiumUserSplash";

interface SplashScreenWrapperProps {
  onSplashHide?: () => void;
  splashDuration?: number;
}

export function SplashScreenWrapper({
  onSplashHide,
  splashDuration = 2500,
}: SplashScreenWrapperProps) {
  const { isPremium } = useUser();

  useEffect(() => {
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
  }, [splashDuration, onSplashHide]);

  return (
    <View style={{ flex: 1 }}>
      {isPremium ? <PremiumUserSplash /> : <NormalUserSplash />}
    </View>
  );
}
