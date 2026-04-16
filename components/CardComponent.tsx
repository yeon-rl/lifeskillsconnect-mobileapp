import { useThemedColors } from "@/hooks/use-themed-colors";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";

interface CardComponentProps {
  title?: string;
  image?: any;
  lessons?: number;
  progress?: number;
  onContinue?: () => void;
  isPremium?: boolean;
}

const CardComponent: React.FC<CardComponentProps> = ({
  title,
  image,
  lessons,
  progress = 0,
  onContinue,
  isPremium = false,
}) => {
  const colors = useThemedColors();


  return (
    <View
      style={{
        backgroundColor: colors.bglight01,
        padding: 12,
        borderRadius: 12,
        width: 280,
        height: 260,
      }}
    >
      {/* Course Image */}
      <View className="w-full h-[120px] overflow-hidden rounded-2xl mb-3 relative">
        <Image
          source={image || require("../assets/images/woman.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={500}
        />
        {isPremium && (
          <View 
            style={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              backgroundColor: colors.primary, 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 4 
            }}
          >
            <ThemedText style={{ color: colors.white, fontSize: 10, fontWeight: 'bold' }}>PREMIUM</ThemedText>
          </View>
        )}
      </View>

      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          {/* Course Title */}
          <ThemedText
            className="font-semibold text-base mb-2"
            numberOfLines={2}
            type="small14"
          >
            {title}
          </ThemedText>

          {/* Progress Bar */}
          <View className="mb-1">
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
          </Pressable>
          {/* Lessons Count */}
          <View className="flex-row items-center gap-1">
            <ThemedText
              type="small14"
              style={{ color: colors.green }}
              className="font-semibold"
            >
              {lessons} {lessons === 1 ? "lesson" : "lessons"}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CardComponent;
