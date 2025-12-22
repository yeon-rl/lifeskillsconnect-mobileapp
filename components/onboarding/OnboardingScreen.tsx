import { ThemedText } from "@/components/themed-text";
import React from "react";
import { Image, Pressable, View } from "react-native";

interface OnboardingScreenProps {
  imageSource: any;
  title: string;
  description: string;
  buttonText: string;
  onButtonPress: () => void;
  onSkipPress: () => void;
}

export function OnboardingScreen({
  imageSource,
  title,
  description,
  buttonText,
  onButtonPress,
  onSkipPress,
}: OnboardingScreenProps) {
  return (
    <View className="flex-1 bg-splash">
      {/* Skip Button */}
      <Pressable
        onPress={onSkipPress}
        className="absolute top-12 right-6 z-10 px-4 py-2"
      >
        <ThemedText className="text-sm font-semibold text-gray-700">
          Skip
        </ThemedText>
      </Pressable>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-6">
        <Image
          source={imageSource}
          className="w-80 h-64 mb-8"
          resizeMode="contain"
        />
        <ThemedText className="text-3xl font-bold text-black text-center mb-4">
          {title}
        </ThemedText>
        <ThemedText className="text-base text-gray-700 text-center leading-6 mb-8">
          {description}
        </ThemedText>
      </View>

      {/* Button at Bottom */}
      <View className="pb-12 px-6">
        <Pressable
          onPress={onButtonPress}
          className="bg-black rounded-lg py-4 items-center"
        >
          <ThemedText className="text-white font-semibold text-base">
            {buttonText}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
