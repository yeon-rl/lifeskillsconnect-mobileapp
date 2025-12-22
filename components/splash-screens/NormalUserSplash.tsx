import { ThemedText } from "@/components/themed-text";
import React from "react";
import { Image, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export function NormalUserSplash() {
  return (
    <View className="flex-1 bg-splash justify-between items-center py-[60]">
      <View className="flex-1 justify-center items-center gap-6">
        <Animated.View entering={FadeInDown.duration(800)}>
          <Image
            source={require("@/assets/images/lifeskillsLogo.png")}
            className="w-[180px] h-[74px] rounded-[30]"
          />
        </Animated.View>

        {/* <Animated.View
          entering={FadeInUp.duration(800).delay(200)}
          className="items-center gap-2"
        >
          <ThemedText className="text-[28px] font-bold text-black">
            Life Skills Connect
          </ThemedText>
          <ThemedText className="text-sm text-gray-600 text-center max-w-[280]">
            Develop essential skills for everyday success
          </ThemedText>
        </Animated.View> */}
      </View>

      <Animated.View
        entering={FadeInUp.duration(800).delay(400)}
        className="items-center"
      >
        <ThemedText className="text-xs text-gray-400">
          Loading your journey...
        </ThemedText>
      </Animated.View>
    </View>
  );
}
