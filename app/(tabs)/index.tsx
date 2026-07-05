import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import CardComponent from "@/components/CardComponent";
import CardComponent2 from "@/components/CardComponent2";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import UserHeader from "@/components/userHeader";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { useFetchCourses, useFetchUserCourses } from "@/hooks/useCourses";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

const BANNERS = [
  {
    key: "premium",
    source: require("../../assets/images/premiumBg.png"),
    showContent: true,
    nonPremiumOnly: true,
  },
  {
    key: "job",
    source: require("../../assets/images/jobanner.png"),
    showContent: false,
    nonPremiumOnly: false,
  },
  {
    key: "wellbeing",
    source: require("../../assets/images/wellbeingbanner.png"),
    showContent: false,
    nonPremiumOnly: false,
  },
];

function BannerCarousel({
  colors,
  router,
  isPremium,
}: {
  colors: any;
  router: any;
  isPremium: boolean;
}) {
  const visibleBanners = isPremium
    ? BANNERS.filter((b) => !b.nonPremiumOnly)
    : BANNERS;
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnims = useRef(
    BANNERS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)),
  ).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = (nextIndex: number) => {
    const currentIndex = activeIndex;
    Animated.parallel([
      Animated.timing(fadeAnims[currentIndex], {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnims[nextIndex], {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % visibleBanners.length;
        Animated.parallel([
          Animated.timing(fadeAnims[prev], {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnims[next], {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
        return next;
      });
    }, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View style={{ height: 150, borderRadius: 16, overflow: "hidden" }}>
      {visibleBanners.map((banner, index) => (
        <Animated.View
          key={banner.key}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: fadeAnims[index],
          }}
        >
          <ImageBackground
            source={banner.source}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "flex-start",
              paddingLeft: 20,
            }}
            resizeMode="cover"
          >
            {banner.showContent && (
              <>
                <ThemedText
                  type="subtitle"
                  className="text-white font-bold text-center"
                  style={{
                    textShadowColor: "#E4EEFF",
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 8,
                    color: colors.white,
                  }}
                >
                  Level Up with Premium
                </ThemedText>
                <ThemedText
                  className="mt-2"
                  style={{ color: colors.white }}
                  type="small"
                >
                  Unlock pro skills, mentor support,
                </ThemedText>
                <ThemedText style={{ color: colors.white }} type="small">
                  and tools to grow faster.
                </ThemedText>
                <Pressable
                  onPress={() => router.push("/profile?openPremium=true")}
                  className="bg-[#4285F4] rounded-lg py-3 w-fit px-5 items-center mt-4"
                >
                  <ThemedText
                    className="text-white font-semibold text-base"
                    style={{ color: "#FFFFFF" }}
                    type="small"
                  >
                    Upgrade to Premium
                  </ThemedText>
                </Pressable>
              </>
            )}
          </ImageBackground>
        </Animated.View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const colors = useThemedColors();
  const router = useRouter();

  const { currentUser } = useUserStore();

  // Fetch all courses and store in Zustand (with caching)
  const {
    courses: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useFetchCourses();
  const courses = React.useMemo(
    () => coursesData?.courses || [],
    [coursesData],
  );

  // Fetch user's enrolled courses
  const {
    userCourses,
    isLoading: userCoursesLoading,
    error: userCoursesError,
  } = useFetchUserCourses(currentUser?.id);

  // Get up to 5 random ongoing courses
  const randomizedOngoingCourses = React.useMemo(() => {
    if (!userCourses?.subscriptions) return [];

    // Filter for ongoing courses
    const ongoing = userCourses.subscriptions.filter(
      (sub: any) => sub.status !== "completed",
    );

    // Shuffle and pick up to 5
    return [...ongoing].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [userCourses]);

  // Get up to 5 random courses
  const randomizedCourses = React.useMemo(() => {
    if (!courses) return [];

    // Filter for ongoing courses
    const course = courses.filter((sub: any) => sub.status !== "completed");

    // Shuffle and pick up to 5
    return [...course].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [courses]);

  const ongoingCoursesCount = React.useMemo(
    () =>
      userCourses?.subscriptions?.filter(
        (sub: any) => sub.status !== "completed",
      ).length || 0,
    [userCourses],
  );

  const completedCoursesCount = React.useMemo(
    () =>
      userCourses?.subscriptions?.filter(
        (sub: any) => sub.status === "completed",
      ).length || 0,
    [userCourses],
  );

  return (
    <ThemedView style={{ flex: 1 }} className="px-4">
      <SafeAreaView edges={["top"]} style={{ marginBottom: 12 }}>
        {/* User Header */}
        <UserHeader />
      </SafeAreaView>
      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View className="mb-6">
          {/* Banner Carousel */}
          <BannerCarousel
            colors={colors}
            router={router}
            isPremium={!!currentUser?.is_premium}
          />

          <View className="flex-row items-center gap-2 justify-between mt-3">
            <Pressable
              className="p-4 flex-row gap-2 items-center w-[48%]"
              style={{ backgroundColor: colors.bglight10, borderRadius: 12 }}
            >
              <View
                className="bg-white px-2 border-splash border-2 rounded-full w-fit"
                style={{ width: "auto" }}
              >
                <ThemedText
                  className="font-bold"
                  style={{ color: colors.green }}
                >
                  {ongoingCoursesCount}
                </ThemedText>
              </View>
              <ThemedText
                type="small"
                style={{ color: colors.green }}
                className="font-bold"
              >
                Ongoing {"\n"} Module(s)
              </ThemedText>
            </Pressable>
            <Pressable
              className="p-4 flex-row gap-2 items-center w-[48%]"
              style={{ backgroundColor: colors.bglight10, borderRadius: 12 }}
            >
              <View
                className="bg-white px-2 border-splash border-2 rounded-full w-fit"
                style={{ width: "auto" }}
              >
                <ThemedText
                  className="font-bold"
                  style={{ color: colors.green }}
                >
                  {completedCoursesCount}
                </ThemedText>
              </View>
              <ThemedText
                type="small"
                style={{ color: colors.green }}
                className="font-bold"
              >
                Completed {"\n"} Module(s)
              </ThemedText>
            </Pressable>
          </View>

          <View className="mt-8">
            <View className="flex-row justify-between">
              <ThemedText
                style={{ color: colors.text }}
                type="small14"
                className="font-semibold"
              >
                Pick Up Where You Left Off
              </ThemedText>
              <Pressable onPress={() => router.push("/explore")}>
                <ThemedText
                  type="small"
                  className="font-semibold"
                  style={{ color: colors.primary }}
                >
                  View all
                </ThemedText>
              </Pressable>
            </View>

            <View className="mt-3">
              {userCoursesLoading ? (
                <View className="h-[260px] justify-center items-center">
                  <ThemedText>Loading...</ThemedText>
                </View>
              ) : randomizedOngoingCourses.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                  snapToInterval={300}
                >
                  {randomizedOngoingCourses.map((sub: any, index: number) => (
                    <React.Fragment key={sub.id || index}>
                      <CardComponent
                        title={sub.course.title}
                        lessons={sub.course.resources?.length || 0}
                        progress={sub.progress || 0}
                        isPremium={sub.course.is_paid === 1}
                        image={sub.course.thumbnail}
                        onContinue={() =>
                          router.push(`/module-detail/${sub.course.id}`)
                        }
                      />
                      {index < randomizedOngoingCourses.length - 1 && (
                        <View className="w-3" />
                      )}
                    </React.Fragment>
                  ))}
                </ScrollView>
              ) : (
                <View className="h-[200px] justify-center items-center bg-gray-100 rounded-2xl p-4">
                  <ThemedText
                    type="small14"
                    className="text-center text-gray-500"
                  >
                    You haven&apos;t started any modules yet. Explore new
                    courses to begin!
                  </ThemedText>
                </View>
              )}
            </View>

            <View
              className="mt-3 bg-splash rounded-2xl"
              style={{
                position: "relative",
                overflow: "hidden",
                minHeight: 120,
              }}
            >
              <Svg
                width="159"
                height="120"
                viewBox="0 0 159 120"
                fill="none"
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                }}
                // xmlns="http://www.w3.org/2000/svg"
              >
                <Path
                  d="M28.7569 29.6293C25.8491 31.3081 23.7272 34.0733 22.8582 37.3166C21.9892 40.5599 22.4441 44.0155 24.123 46.9234C25.8018 49.8312 28.567 51.9531 31.8103 52.8221C35.0536 53.6911 38.5092 53.2362 41.4171 51.5573L52.3811 45.2272L67.5733 71.5409L21.5244 98.1272C18.6165 99.8061 15.1609 100.261 11.9176 99.392C8.67434 98.523 5.90913 96.4011 4.23029 93.4933L1.69825 89.1077C-1.79933 83.0497 0.280055 75.3078 6.33219 71.8136L25.0032 61.0339C19.7219 58.452 15.6427 53.929 13.6179 48.41C11.5931 42.8911 11.7795 36.8032 14.138 31.4184C16.4966 26.0336 20.8448 21.7686 26.2741 19.5146C31.7035 17.2605 37.7938 17.1918 43.2726 19.3228C44.1665 13.5126 47.2712 8.27249 51.9379 4.69757C56.6047 1.12265 62.4724 -0.510513 68.315 0.139321C74.1576 0.78916 79.5231 3.67172 83.2902 8.18469C87.0574 12.6977 88.9348 18.4919 88.5302 24.3566L111.587 11.0448C117.639 7.55062 125.387 9.62662 128.881 15.6788L131.413 20.0644C134.91 26.1224 132.831 33.8643 126.779 37.3585L76.3445 66.4768L61.1523 40.1632L72.1163 33.8331C74.2848 32.5811 76.0333 30.7142 77.1408 28.4685C78.2483 26.2228 78.6649 23.6991 78.3381 21.2166C78.0113 18.7341 76.9556 16.4042 75.3046 14.5217C73.6537 12.6391 71.4816 11.2884 69.0629 10.6403C66.6443 9.99224 64.0878 10.0759 61.7168 10.8808C59.3457 11.6857 57.2666 13.1756 55.7423 15.1621C54.2179 17.1486 53.3169 19.5425 53.1532 22.0411C52.9894 24.5397 53.5702 27.0307 54.8222 29.1992L61.1523 40.1632L52.3811 45.2272L46.051 34.2632C42.5534 28.2052 34.809 26.1351 28.7569 29.6293ZM72.6373 80.3121L24.3956 108.164L47.1839 147.635C49.1985 151.124 52.5168 153.671 56.4087 154.713C60.3007 155.756 64.4474 155.21 67.9369 153.196L103.022 132.939L72.6373 80.3121ZM81.4085 75.248L111.793 127.875L151.263 105.087C154.753 103.072 157.299 99.7542 158.342 95.8623C159.385 91.9703 158.839 87.8235 156.824 84.3341L134.036 44.8637L81.4085 75.248Z"
                  fill="url(#paint0_linear_808_15840)"
                  fillOpacity="0.1"
                />
                <Defs>
                  <LinearGradient
                    id="paint0_linear_808_15840"
                    x1="34.0742"
                    y1="46.068"
                    x2="132.949"
                    y2="91.7783"
                    gradientUnits="userSpaceOnUse"
                  >
                    <Stop stopColor="white" />
                    <Stop offset="1" stopColor="#999999" />
                  </LinearGradient>
                </Defs>
              </Svg>

              <View className="p-4">
                <View className="flex-row gap-2">
                  <Svg
                    width="22"
                    height="21"
                    viewBox="0 0 22 21"
                    fill="none"
                    // xmlns="http://www.w3.org/2000/svg"
                  >
                    <Path
                      d="M7.875 1.5097C7.37772 1.5097 6.9008 1.70724 6.54917 2.05887C6.19754 2.4105 6 2.88742 6 3.3847C6 3.88198 6.19754 4.35889 6.54917 4.71052C6.9008 5.06215 7.37772 5.2597 7.875 5.2597H9.75V9.7597H1.875C1.37772 9.7597 0.900805 9.56216 0.549175 9.21052C0.197544 8.85889 0 8.38198 0 7.8847V7.1347C0 6.0987 0.84 5.2597 1.875 5.2597H5.068C4.58181 4.53745 4.39354 3.65526 4.54253 2.79747C4.69152 1.93967 5.16624 1.17263 5.86749 0.656628C6.56875 0.140627 7.44228 -0.0844136 8.30557 0.0285299C9.16885 0.141473 9.95509 0.583662 10.5 1.2627C11.0449 0.583662 11.8312 0.141473 12.6944 0.0285299C13.5577 -0.0844136 14.4313 0.140627 15.1325 0.656628C15.8338 1.17263 16.3085 1.93967 16.4575 2.79747C16.6065 3.65526 16.4182 4.53745 15.932 5.2597H19.875C20.91 5.2597 21.75 6.0997 21.75 7.1347V7.8847C21.75 8.9207 20.91 9.7597 19.875 9.7597H11.25V5.2597H13.125C13.4958 5.2597 13.8584 5.14973 14.1667 4.9437C14.475 4.73768 14.7154 4.44484 14.8573 4.10223C14.9992 3.75962 15.0363 3.38262 14.964 3.0189C14.8916 2.65519 14.713 2.3211 14.4508 2.05887C14.1886 1.79665 13.8545 1.61807 13.4908 1.54573C13.1271 1.47338 12.7501 1.51051 12.4075 1.65242C12.0649 1.79434 11.772 2.03466 11.566 2.343C11.36 2.65135 11.25 3.01386 11.25 3.3847V5.2597H9.75V3.3847C9.75 2.3487 8.91 1.5097 7.875 1.5097ZM9.75 11.2597H1.5V18.0097C1.5 18.6064 1.73705 19.1787 2.15901 19.6007C2.58097 20.0226 3.15326 20.2597 3.75 20.2597H9.75V11.2597ZM11.25 11.2597V20.2597H18C18.5967 20.2597 19.169 20.0226 19.591 19.6007C20.0129 19.1787 20.25 18.6064 20.25 18.0097V11.2597H11.25Z"
                      fill="white"
                    />
                  </Svg>

                  <ThemedText style={{ color: colors.white }}>
                    Total Reward
                  </ThemedText>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="w-[70%]">
                    <ThemedText
                      type="small14"
                      className="mt-2"
                      style={{ color: colors.white }}
                    >
                      Complete modules, earn rewards, and flex your growth.
                    </ThemedText>
                    <ThemedText
                      type="subtitle"
                      className="mt-2"
                      style={{ color: colors.white }}
                    >
                      {currentUser?.total_points
                        ? currentUser?.total_points
                        : 0}{" "}
                      pts
                    </ThemedText>
                  </View>
                  <Pressable onPress={() => router.push("/reward-points")}>
                    <Image
                      source={require("../../assets/images/arrowRight.png")}
                      className="w-[50px] h-[50px] rounded-2xl"
                      resizeMode="contain"
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            <View>
              <View className="flex-row justify-between mt-8">
                <ThemedText
                  style={{ color: colors.text }}
                  type="small14"
                  className="font-semibold"
                >
                  Learn Something New
                </ThemedText>
                <Pressable onPress={() => router.push("/all-modules")}>
                  <ThemedText
                    type="small"
                    className="font-semibold"
                    style={{ color: colors.primary }}
                  >
                    View all
                  </ThemedText>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={300}
              >
                {randomizedCourses.map((course, idx) => {
                  return (
                    <CardComponent2
                      key={idx}
                      title={course.title}
                      isPremium={course.is_paid === 1}
                      image={course.thumbnail}
                      onViewModule={() =>
                        router.push(`/all-module-detail/${course.id}`)
                      }
                    />
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
