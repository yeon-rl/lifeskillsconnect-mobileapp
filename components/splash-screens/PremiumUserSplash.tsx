import { ThemedText } from "@/components/themed-text";
import React from "react";
import { Image, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export function PremiumUserSplash() {
  return (
    <View className="flex-1 bg-splash justify-between items-center py-[60]">
      <View className="flex-1 justify-center items-center gap-6">
        <Animated.View entering={FadeInDown.duration(800)}>
          <View className="relative items-center justify-center">
            <Image
              source={require("@/assets/images/lifeskillsLogo.png")}
              className="w-[180px] h-[74px] rounded-[30]"
            />
            <ThemedText className="absolute -bottom-4 right-1 text-xs">
              Premium
            </ThemedText>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
