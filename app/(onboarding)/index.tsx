import { ThemedText } from "@/components/themed-text";
import { useOnboarding } from "@/context/OnboardingContext";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

interface OnboardingData {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  imageSource?: any;
}

const ONBOARDING_DATA: OnboardingData[] = [
  {
    id: "1",
    title: "Welcome to \n Life Skills Connect",
    description:
      "Gain real-world skills, guidance, and support to thrive in your journey to Independence.",
    buttonText: "Let's Go",
    imageSource: require("@/assets/images/1.png"),
  },
  {
    id: "2",
    title: "Learn. Level Up. Get Support.",
    description:
      "Get 24/7 crisis support, abuse reporting, safe space maps, and anonymous chat.",
    buttonText: "Next",
    imageSource: require("@/assets/images/2.png"),
  },
  {
    id: "3",
    title: "Your Life. Your Journey.",
    description:
      "Choose your learning path, pick your language, and track your growth — Your way.",
    buttonText: "Get Started",
    imageSource: require("@/assets/images/3.png"),
  },
];

export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setHasCompletedOnboarding } = useOnboarding();
  const router = useRouter();

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    router.push("/(auth)/language-selection");
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      setHasCompletedOnboarding(true);
      router.push("/(auth)/language-selection");
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndexValue = Math.round(
      contentOffsetX / event.nativeEvent.layoutMeasurement.width
    );
    setCurrentIndex(currentIndexValue);
  };

  const renderOnboardingItem = ({
    item,
    index,
  }: {
    item: OnboardingData;
    index: number;
  }) => (
    <Animated.View
      key={item.id}
      entering={FadeInDown.duration(500)}
      exiting={FadeOutUp.duration(500)}
      layout={Layout}
      className="w-screen h-screen bg-white flex-1"
    >
      {/* Progress Dots and Skip Button */}
      <View className="flex-row justify-between items-center px-6 pt-6 mt-5 relative z-50">
        {/* Progress Dots */}
        <View className="flex-row gap-2">
          {ONBOARDING_DATA.map((_, dotIndex) => (
            <View
              key={dotIndex}
              className="rounded-full h-1.5"
              style={{
                width: dotIndex === currentIndex ? 24 : 8,
                backgroundColor:
                  dotIndex === currentIndex ? "#5A7C65" : "#5A7C6580",
              }}
            />
          ))}
        </View>

        {/* Skip Button */}
        <Pressable onPress={handleSkip} className="px-4 py-2">
          <ThemedText
            style={{ color: "#5A7C65" }}
            className="text-sm font-semibold"
          >
            Skip
          </ThemedText>
        </Pressable>
      </View>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-6">
        <View className="mb-8 absolute left-0 z-0 -top-10 right-0">
          <Svg width="393" height="652" viewBox="0 0 393 652" fill="none">
            <Path
              d="M92.0312 437.206C281.953 374.632 436.677 92.6942 454 -166.93L30.2135 -377L-118 651C-96.2341 570.662 -97.8907 499.78 92.0312 437.206Z"
              stroke="#4A90E2"
              strokeOpacity="0.5"
            />
          </Svg>
        </View>

        <View className="absolute bottom-0 left-0 z-0">
          <Svg width="393" height="852" viewBox="0 0 393 852" fill="none">
            <Path
              d="M62.7968 842.246C358.305 744.855 599.047 306.042 626 -98.0435L-33.388 -425L-264 1175C-230.133 1049.96 -232.711 939.638 62.7968 842.246Z"
              stroke="#5A7C65"
              strokeOpacity="0.5"
            />
          </Svg>
        </View>

        {/* Centered Content Stack */}
        <View className="items-center gap-6 z-10 w-full px-6">
          {/* Title */}
          <ThemedText
            className="text-3xl font-bold text-black text-center"
            style={{ color: "#5A7C65", fontSize: 24 }}
          >
            {item.title}
          </ThemedText>

          {/* Image */}
          <Image
            source={item.imageSource}
            className="w-[350px] h-[350px] rounded-2xl"
            resizeMode="contain"
          />

          {/* Description */}
          <ThemedText
            className="text-base text-black text-center leading-6 max-w-sm"
            style={{ color: "black" }}
          >
            {item.description}
          </ThemedText>

          {/* Button */}
          <Pressable
            onPress={handleNext}
            className="bg-splash rounded-lg py-4 w-full items-center mt-4"
          >
            <ThemedText
              className="text-white font-semibold text-base"
              style={{ color: "#FFFFFF" }}
            >
              {item.buttonText}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={ONBOARDING_DATA}
      renderItem={renderOnboardingItem}
      keyExtractor={(item) => item.id}
      horizontal
      pagingEnabled
      scrollEventThrottle={16}
      onScroll={handleScroll}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}
