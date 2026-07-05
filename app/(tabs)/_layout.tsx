import { Tabs, useRouter } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = useThemedColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const TAB_BAR_HEIGHT = 60;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary, // Primary green color
          tabBarInactiveTintColor: colors.gray700,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: false, // Hide labels under icons
          tabBarPosition: "bottom", // Ensure bottom tabs on Android
          tabBarHideOnKeyboard: true, // Optional but usually better on Android
          tabBarStyle: {
            position: "absolute",
            bottom: Platform.OS === "android" ? insets.bottom + 20 : 25,
            left: 40,
            right: 40,
            marginLeft: 45,
            marginRight: 45,
            borderRadius: 30,
            paddingTop: 10,
            height: TAB_BAR_HEIGHT,
            paddingBottom: 0,
            // paddingTop: 0,
            borderTopWidth: 0, // Cleaner look
            backgroundColor: "#5A7C6517",
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 15,
          },
          tabBarBackground: () => (
            <View style={[StyleSheet.absoluteFill, { borderRadius: 30, overflow: 'hidden' }]}>
              <BlurView intensity={60} style={StyleSheet.absoluteFill} tint={colorScheme === "dark" ? "dark" : "light"} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: "#5A7C6517" }]} />
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Svg width="22" height="23" viewBox="0 0 22 23" fill="none">
                <Path
                  d="M21.0001 17.6781V10.7431C21.0001 10.0752 20.9995 9.74107 20.9183 9.43027C20.8464 9.15484 20.7282 8.89419 20.5683 8.65866C20.3879 8.39287 20.1371 8.17247 19.6344 7.73264L13.6344 2.48264C12.7011 1.66603 12.2345 1.25794 11.7094 1.10263C11.2466 0.965789 10.7534 0.965789 10.2906 1.10263C9.76589 1.25782 9.29993 1.66553 8.36808 2.4809L2.36609 7.73264C1.86342 8.17247 1.61267 8.39287 1.43225 8.65866C1.27236 8.89419 1.15331 9.15484 1.08134 9.43027C1.00012 9.74107 1.00012 10.0752 1.00012 10.7431V17.6781C1.00012 18.8429 1.00012 19.4251 1.19042 19.8845C1.44416 20.4971 1.93052 20.9844 2.54309 21.2381C3.00252 21.4284 3.58495 21.4284 4.7498 21.4284C5.91465 21.4284 6.49773 21.4284 6.95715 21.2381C7.56972 20.9844 8.05596 20.4972 8.30969 19.8847C8.49999 19.4252 8.50012 18.8428 8.50012 17.678V16.428C8.50012 15.0472 9.61941 13.928 11.0001 13.928C12.3808 13.928 13.5001 15.0472 13.5001 16.428V17.678C13.5001 18.8428 13.5001 19.4252 13.6904 19.8847C13.9442 20.4972 14.4305 20.9844 15.0431 21.2381C15.5025 21.4284 16.0849 21.4284 17.2498 21.4284C18.4147 21.4284 18.9977 21.4284 19.4572 21.2381C20.0697 20.9844 20.556 20.4971 20.8097 19.8845C21 19.4251 21.0001 18.8429 21.0001 17.6781Z"
                  fill={focused ? color : "none"}
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            ),
          }}
        />
        <Tabs.Screen
          name="all-modules"
          options={{
            title: "Modules",
            tabBarIcon: ({ color, focused }) => (
              <Svg
                width="20"
                height="18"
                viewBox="0 0 20 18"
                fill={focused ? color : "none"}
                // xmlns="http://www.w3.org/2000/svg"
              >
                <Path
                  d="M3.75 3.878V3C3.75 2.40326 3.98705 1.83097 4.40901 1.40901C4.83097 0.987053 5.40326 0.75 6 0.75H13.5C14.0967 0.75 14.669 0.987053 15.091 1.40901C15.5129 1.83097 15.75 2.40326 15.75 3V3.878M3.75 3.878C3.985 3.795 4.237 3.75 4.5 3.75H15C15.263 3.75 15.515 3.795 15.75 3.878M3.75 3.878C3.31121 4.03313 2.93133 4.32052 2.66269 4.70056C2.39404 5.0806 2.24986 5.5346 2.25 6V6.878M15.75 3.878C16.1888 4.03313 16.5687 4.32052 16.8373 4.70056C17.106 5.0806 17.2501 5.5346 17.25 6V6.878M2.25 6.878C2.485 6.795 2.737 6.75 3 6.75H16.5C16.7555 6.7497 17.0091 6.79299 17.25 6.878M2.25 6.878C1.376 7.187 0.75 8.02 0.75 9V15C0.75 15.5967 0.987053 16.169 1.40901 16.591C1.83097 17.0129 2.40326 17.25 3 17.25H16.5C17.0967 17.25 17.669 17.0129 18.091 16.591C18.5129 16.169 18.75 15.5967 18.75 15V9C18.7501 8.5346 18.606 8.0806 18.3373 7.70056C18.0687 7.32052 17.6888 7.03313 17.25 6.878"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill={focused ? color : "none"}
                // xmlns="http://www.w3.org/2000/svg"
              >
                <Path
                  d="M15.7325 16.4747C15.0338 15.5496 14.1298 14.7993 13.0917 14.2831C12.0536 13.7668 10.9099 13.4987 9.7505 13.4997C8.59115 13.4987 7.44739 13.7668 6.40932 14.2831C5.37125 14.7993 4.46724 15.5496 3.7685 16.4747M15.7325 16.4747C17.096 15.2619 18.0576 13.6633 18.4917 11.8908C18.9258 10.1183 18.8108 8.25579 18.162 6.55018C17.5132 4.84457 16.3612 3.37648 14.8589 2.3406C13.3566 1.30472 11.5748 0.75 9.75 0.75C7.92516 0.75 6.14343 1.30472 4.64111 2.3406C3.13878 3.37648 1.98683 4.84457 1.33804 6.55018C0.689242 8.25579 0.574253 10.1183 1.00832 11.8908C1.44239 13.6633 2.405 15.2619 3.7685 16.4747M15.7325 16.4747C14.0865 17.9429 11.9561 18.7528 9.7505 18.7497C7.54453 18.7531 5.41474 17.9431 3.7685 16.4747M12.7505 7.49971C12.7505 8.29535 12.4344 9.05842 11.8718 9.62103C11.3092 10.1836 10.5462 10.4997 9.7505 10.4997C8.95485 10.4997 8.19179 10.1836 7.62918 9.62103C7.06657 9.05842 6.7505 8.29535 6.7505 7.49971C6.7505 6.70406 7.06657 5.94099 7.62918 5.37838C8.19179 4.81578 8.95485 4.49971 9.7505 4.49971C10.5462 4.49971 11.3092 4.81578 11.8718 5.37838C12.4344 5.94099 12.7505 6.70406 12.7505 7.49971Z"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="jobs"
          options={{
            href: null,
          }}
        />
      </Tabs>
      
      {/* Floating Chatbot Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: Platform.OS === "android" ? insets.bottom + TAB_BAR_HEIGHT + 35 : TAB_BAR_HEIGHT + 45,
          right: 20,
          width: 58,
          height: 58,
          borderRadius: 29,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
          zIndex: 1000,
        }}
        onPress={() => {
             router.push("/mentor-chat");
        }}
        activeOpacity={0.8}
      >
        <Svg width="58" height="58" viewBox="0 0 60 60" fill="none">
            <Defs>
                <LinearGradient id="paint0_linear" x1="30" y1="0" x2="30" y2="60" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#86D99C"/>
                    <Stop offset="1" stopColor="#5BB974"/>
                </LinearGradient>
            </Defs>
            <Circle cx="30" cy="30" r="30" fill="url(#paint0_linear)"/>
            
            {/* Robot Face Logic - matching the style of the image somewhat */}
             <Path d="M20 25C20 22.2386 22.2386 20 25 20H35C37.7614 20 40 22.2386 40 25V35C40 37.7614 37.7614 40 35 40H25C22.2386 40 20 37.7614 20 35V25Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
            
            {/* Eyes */}
            <Circle cx="26" cy="28" r="2.5" fill="white"/>
            <Circle cx="34" cy="28" r="2.5" fill="white"/>
            
            {/* Smile */}
            <Path d="M27 34C27 34 28.5 35.5 30 35.5C31.5 35.5 33 34 33 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Antennas */}
            <Path d="M30 20V16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <Circle cx="30" cy="14" r="2" fill="white"/>

        </Svg>
      </TouchableOpacity>
    </View>
  );
}
