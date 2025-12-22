import { useThemedColors } from "@/hooks/use-themed-colors";
import React from "react";
import { Image, Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";

interface CardComponentProps {
  title?: string;
  image?: any;
  lessons?: number;
  progress?: number;
  onContinue?: () => void;
}

const CardComponent: React.FC<CardComponentProps> = ({
  title = "Financial literacy and budgeting",
  image = require("@/assets/images/woman.png"),
  lessons = 12,
  progress = 65,
  onContinue = () => {},
}) => {
  const colors = useThemedColors();

  return (
    <View
      style={{
        backgroundColor: colors.bglight01,
        padding: 12,
        borderRadius: 12,
        width: 280,
      }}
    >
      {/* Course Image */}
      <View className="w-full h-[140px] overflow-hidden rounded-2xl mb-3">
        <Image source={image} className="w-full h-full" resizeMode="cover" />
      </View>

      {/* Course Title */}
      <ThemedText
        className="font-semibold text-base mb-2"
        numberOfLines={1}
        type="small14"
      >
        {title}
      </ThemedText>

      {/* Progress Bar */}
      <View className="mb-3">
        {/* <View className="flex-row justify-between mb-1">
          <ThemedText type="small" className="font-semibold">
            Progress
          </ThemedText>
          <ThemedText type="small" style={{ color: colors.primary }}>
            {progress}%
          </ThemedText>
        </View> */}
        <View
          style={{
            height: 6,
            backgroundColor: colors.gray300,
            borderRadius: 3,
            overflow: "hidden",
          }}
          className="mt-2"
        >
          <View
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: colors.primary,
              borderRadius: 3,
            }}
          />
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        {/* Continue Button */}
        <Pressable
          onPress={onContinue}
          className="rounded-lg py-3 items-center flex-row justify-center gap-2"
          style={{ backgroundColor: colors.primary }}
        >
          <ThemedText
            className="text-white font-semibold px-5"
            type="small"
            style={{ color: colors.background }}
          >
            Continue
          </ThemedText>
          {/* <Ionicons name="arrow-forward" size={16} color="white" /> */}
        </Pressable>
        {/* Lessons Count */}
        <View className="flex-row items-center gap-1 mb-3">
          {/* <Ionicons name="book" size={14} color={colors.gray700} /> */}
          <ThemedText
            type="small14"
            style={{ color: colors.green }}
            className="font-semibold"
          >
            {lessons} lessons
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

export default CardComponent;
