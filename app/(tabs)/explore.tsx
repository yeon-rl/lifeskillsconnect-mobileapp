import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// Module data type
type ModuleStatus = "in-progress" | "not-started" | "completed";

interface Module {
  id: string;
  title: string;
  instructor: string;
  image: any;
  progress?: number;
  status: ModuleStatus;
}

export default function ExploreScreen() {
  const colors = useThemedColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Sample module data
  const modules: Module[] = [
    {
      id: "1",
      title: "Financial literacy and Budgeting",
      instructor: "Andrew Dickson",
      image: require("../../assets/images/woman.png"),
      progress: 27,
      status: "in-progress",
    },
    {
      id: "2",
      title: "Financial literacy and Budgeting",
      instructor: "Andrew Dickson",
      image: require("../../assets/images/woman.png"),
      status: "not-started",
    },
    {
      id: "3",
      title: "Financial literacy and Budgeting",
      instructor: "Andrew Dickson",
      image: require("../../assets/images/woman.png"),
      status: "completed",
    },
  ];

  const renderModuleCard = (module: Module) => {
    return (
      <View
        key={module.id}
        style={{
          backgroundColor: colors.background,
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
          flexDirection: "row",
          gap: 12,
          borderWidth: 1,
          borderColor: colors.gray300,
        }}
      >
        {/* Module Image */}
        <Image
          source={module.image}
          style={{
            width: 60,
            height: 60,
            borderRadius: 8,
          }}
          resizeMode="cover"
        />

        {/* Module Info */}
        <View style={{ flex: 1 }}>
          <ThemedText
            type="small14"
            style={{ color: colors.text, fontWeight: "600", marginBottom: 4 }}
          >
            {module.title}
          </ThemedText>
          <ThemedText
            type="small"
            style={{ color: colors.textSecondary, marginBottom: 8 }}
          >
            {module.instructor}
          </ThemedText>

          {/* Status based rendering */}
          {module.status === "in-progress" && (
            <View>
              {/* Progress bar */}
              <View
                style={{
                  height: 4,
                  backgroundColor: colors.gray300,
                  borderRadius: 2,
                  overflow: "hidden",
                  marginBottom: 4,
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${module.progress ?? 0}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
              <ThemedText
                type="small"
                style={{ color: colors.textSecondary }}
              >
                {module.progress ?? 0}% Complete
              </ThemedText>
            </View>
          )}

          {module.status === "not-started" && (
            <ThemedText
              type="small"
              style={{ color: colors.primary, fontWeight: "600" }}
            >
              Start Now
            </ThemedText>
          )}

          {module.status === "completed" && (
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM11.7071 6.70711L7.70711 10.7071C7.31658 11.0976 6.68342 11.0976 6.29289 10.7071L4.29289 8.70711C3.90237 8.31658 3.90237 7.68342 4.29289 7.29289C4.68342 6.90237 5.31658 6.90237 5.70711 7.29289L7 8.58579L10.2929 5.29289C10.6834 4.90237 11.3166 4.90237 11.7071 5.29289C12.0976 5.68342 12.0976 6.31658 11.7071 6.70711Z"
                    fill={colors.primary}
                  />
                </Svg>
                <ThemedText
                  type="small"
                  style={{ color: colors.primary, fontWeight: "600" }}
                >
                  Completed
                </ThemedText>
              </View>
              <Pressable
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  alignSelf: "flex-start",
                }}
              >
                <ThemedText
                  type="small"
                  style={{ color: colors.white, fontWeight: "600" }}
                >
                  View Certificate
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Header with back button */}
        <View style={{ paddingTop: 8, paddingBottom: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 25,
              height: 25,
              borderRadius: 20,
              backgroundColor: colors.bglight10,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke={colors.input50}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>

          <ThemedText
            type="subtitle"
            style={{ color: colors.text, marginBottom: 16 }}
          >
            My Modules
          </ThemedText>

          {/* Search Bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.input,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              gap: 8,
            }}
          >
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path
                d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                stroke={colors.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M19 19L14.65 14.65"
                stroke={colors.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <TextInput
              placeholder="Search Modules"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 14,
                color: colors.text,
              }}
            />
          </View>
        </View>

        {/* Modules List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {modules.map((module) => renderModuleCard(module))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
