import { useThemedColors } from "@/hooks/use-themed-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import { ThemedText } from "./themed-text";

interface CardComponent2Props {
  title?: string;
  rating?: number;
  reviews?: number;
  onViewModule?: () => void;
  isPremium?: boolean;
  image?: string;
}

const CardComponent2 = ({
  title = "Interview and workplace skills",
  rating = 4.5,
  reviews = 128,
  onViewModule,
  isPremium = false,
  image,
}: CardComponent2Props) => {
  const colors = useThemedColors();

  return (
    <View
      className="mt-4"
      style={{
        backgroundColor: colors.bglight01,
        borderRadius: 12,
        width: 180,
        height: 200,
        paddingBottom: 12,
      }}
    >
      {/* Course Image */}
      <View
        className="w-full h-[100px] overflow-hidden rounded-2xl p-2 relative"
        style={{ borderRadius: 12 }}
      >
        <Image
          source={image ? { uri: image } : require("../assets/images/woman.png")}
          className="rounded-xl"
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={500}
        />
        {isPremium && (
          <View 
            style={{ 
              position: 'absolute', 
              top: 6, 
              right: 6, 
              backgroundColor: '#1aa1dbff', 
              paddingHorizontal: 6, 
              paddingVertical: 1, 
              borderRadius: 5 
            }}
          >
            <ThemedText style={{ color: 'white', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>Premium</ThemedText>
          </View>
        )}
      </View>

      <View className="px-3" style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          {/* Title */}
          <ThemedText
            className="font-semibold text-base mb-1"
            numberOfLines={2}
            style={{ color: colors.text }}
            type="small"
          >
            {title}
          </ThemedText>

          {/* Rating and Reviews */}
          <View className="flex-row items-center gap-1 mb-2">
            <Ionicons name="star" size={14} color="#FBBC05" />
            <ThemedText
              className="font-semibold text-sm"
              style={{ color: colors.textSecondary }}
              type="small"
            >
              {rating}
            </ThemedText>
            <ThemedText
              className="text-xs"
              style={{ color: colors.textSecondary }}
              type="small"
            >
              - {reviews} Reviews
            </ThemedText>
          </View>
        </View>

        {/* View Module Button */}
        <Pressable
          onPress={onViewModule}
          className="px-4 py-2 rounded-lg flex-row items-center justify-center gap-1 w-fit"
          style={{ backgroundColor: colors.primary, width: "auto" }}
        >
          <ThemedText
            className="text-white font-semibold text-sm"
            style={{ color: "#FFFFFF" }}
            type="small"
          >
            View Module
          </ThemedText>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

export default CardComponent2;
