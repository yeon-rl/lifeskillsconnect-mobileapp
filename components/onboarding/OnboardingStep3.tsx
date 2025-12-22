import { ThemedText } from "@/components/themed-text";
import { useOnboarding } from "@/context/OnboardingContext";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

export function OnboardingStep3({ onNext }: { onNext: () => void }) {
  const { setHasCompletedOnboarding } = useOnboarding();
  const router = useRouter();

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    router.push("/(auth)/language-selection");
  };

  const handleGetStarted = () => {
    setHasCompletedOnboarding(true);
    router.push("/(auth)/language-selection");
  };

  return (
    <View className="flex-1 bg-splash">
      {/* Skip Button */}
      <Pressable
        onPress={handleSkip}
        className="absolute top-12 right-6 z-10 px-4 py-2"
      >
        <ThemedText className="text-sm font-semibold text-gray-700">
          Skip
        </ThemedText>
      </Pressable>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-20 h-20 bg-black rounded-full mb-8" />
        <ThemedText className="text-3xl font-bold text-black text-center mb-4">
          Transform Your Future
        </ThemedText>
        <ThemedText className="text-base text-gray-700 text-center leading-6">
          Track your progress, celebrate milestones, and join a community of
          learners committed to personal growth.
        </ThemedText>
      </View>

      {/* Button at Bottom */}
      <View className="pb-12 px-6">
        <Pressable
          onPress={handleGetStarted}
          className="bg-black rounded-lg py-4 items-center"
        >
          <ThemedText className="text-white font-semibold text-base">
            Get Started
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
