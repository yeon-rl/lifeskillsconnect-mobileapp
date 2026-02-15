import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  TextInput,
  View
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { useFetchUserCourses } from "@/hooks/useCourses";
import { userCourseProp } from "@/store/courseStore";
import { useUserStore } from "@/store/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const SEARCH_HISTORY_KEY = "explore_search_history";
const DEFAULT_SUGGESTIONS = [
  "Career Guidance",
  "Professional Development",
  "Financial literacy and Budgeting",
  "Health",
  "Interview and workplace skills",
];

export default function ExploreScreen() {
  const colors = useThemedColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");

  const { currentUser } = useUserStore();
  const { userCourses, isLoading, error } = useFetchUserCourses(currentUser?.id);

  // Load search history on mount
  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (historyJson) {
          setSearchHistory(JSON.parse(historyJson));
        }
      } catch (e) {
        console.error("Failed to load search history", e);
      }
    };
    loadHistory();
  }, []);

  // Derive unique categories from userCourses
  const categories = useMemo(() => {
    const subs = userCourses?.subscriptions || [];
    const catSet = new Set<string>();
    catSet.add("All");
    subs.forEach(sub => {
      if (sub.course?.category?.name) {
        catSet.add(sub.course.category.name);
      }
    });
    return Array.from(catSet);
  }, [userCourses]);

  const saveToHistory = async (query: string) => {
    if (!query || query.trim() === "") return;
    
    const trimmedQuery = query.trim();
    try {
      // Move to front, keep unique, limit to 10
      const newHistory = [
        trimmedQuery,
        ...searchHistory.filter((h) => h.toLowerCase() !== trimmedQuery.toLowerCase()),
      ].slice(0, 10);
      
      setSearchHistory(newHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save search history", e);
    }
  };

  const suggestions = searchHistory.length > 0 ? searchHistory : DEFAULT_SUGGESTIONS;

  // Filter modules based on search query, category, and price
  const filteredModules = useMemo(() => {
    let subscriptions = userCourses?.subscriptions || [];
    
    // 1. Search Query Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      subscriptions = subscriptions.filter((sub) => {
        const titleMatch = sub.course?.title?.toLowerCase().includes(lowerQuery);
        const categoryMatch = sub.course?.category?.name?.toLowerCase().includes(lowerQuery);
        return titleMatch || categoryMatch;
      });
    }

    // 2. Category Filter
    if (selectedCategory !== "All") {
      subscriptions = subscriptions.filter(sub => sub.course?.category?.name === selectedCategory);
    }

    // 3. Price Filter
    if (priceFilter !== "all") {
      subscriptions = subscriptions.filter(sub => {
        const isPaid = sub.course?.is_paid === 1;
        return priceFilter === "paid" ? isPaid : !isPaid;
      });
    }
    
    return subscriptions;
  }, [userCourses, searchQuery, selectedCategory, priceFilter]);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleBackPress = () => {
    if (isSearchFocused) {
      setIsSearchFocused(false);
      setSearchQuery(""); // Clear search when canceling interaction
      Keyboard.dismiss();
    } else if (searchQuery.length > 0) {
       // If we are seeing results (searchQuery set but not focused), clear search to show full list
       setSearchQuery("");
    } else {
      router.back();
    }
  };
  
  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    setIsSearchFocused(false); // Show results
    Keyboard.dismiss();
    saveToHistory(suggestion);
  };

  const handleSearchSubmit = () => {
    setIsSearchFocused(false); // Show results
    Keyboard.dismiss();
    saveToHistory(searchQuery);
  };


  const renderModuleCard = (sub: userCourseProp) => {
    const module = sub.course;
    if (!module) return null;

    // console.log(module.thumbnail, "module here")

    return (
      <Pressable
        key={module.id}
        onPress={() => {
          router.push(`/module-detail/${module.id}`);
        }}
        style={{
          padding: 12,
          marginBottom: 16,
          flexDirection: "row",
          gap: 12,
        }}
      >
        {/* Module Image */}
        <Image
          source={
            module.thumbnail
              ? { uri: module.thumbnail }
              : require("../../assets/images/woman.png")
          }
          style={{
            width: 70,
            height: 70,
            borderRadius: 8,
            backgroundColor: colors.bglight10,
          }}
          resizeMode="cover"
        />

        {/* Module Info */}
        <View style={{ flex: 1 }}>
          <ThemedText
            type="small14"
            style={{ color: colors.text, fontWeight: "600", marginBottom: 3 }}
          >
            {module.title}
          </ThemedText>
          <ThemedText
            type="small"
            style={{ color: colors.textSecondary, marginBottom: 2 }}
          >
            {module.instructor?.name || "Unknown Instructor"}
          </ThemedText>
          
          {/* Category Tag */}
          {module.category?.name && (
            <ThemedText
              type="small"
              style={{ 
                color: colors.primary, 
                backgroundColor: colors.bglight10, 
                paddingHorizontal: 6, 
                paddingVertical: 2, 
                borderRadius: 4,
                alignSelf: "flex-start",
                marginBottom: 5,
                fontSize: 10,
                fontWeight: "600"
              }}
            >
              {module.category.name}
            </ThemedText>
          )}

          {/* Status based rendering */}
          {sub.status !== "completed" && (
            <View>
              {/* Progress bar */}
              <View
                style={{
                  height: 5,
                  backgroundColor: colors.gray250,
                  borderRadius: 2,
                  overflow: "hidden",
                  marginBottom: 4,
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${sub.progress ?? 0}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
              <ThemedText
                type="small"
                style={{ color: colors.textSecondary }}
              >
                {sub.progress ?? 0}% Complete
              </ThemedText>
            </View>
          )}

          {sub.status === "completed" && (
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M4.50004 1.09721C4.79893 0.752413 5.16851 0.475969 5.5837 0.286649C5.99888 0.0973298 6.44994 -0.000432304 6.90625 1.43698e-06C7.86746 1.43698e-06 8.72879 0.425001 9.31246 1.09721C9.7677 1.0647 10.2246 1.13056 10.6521 1.29031C11.0797 1.45005 11.4678 1.69994 11.7902 2.023C12.1131 2.34534 12.363 2.73337 12.5227 3.16077C12.6824 3.58816 12.7484 4.04492 12.716 4.50004C13.0607 4.799 13.337 5.16861 13.5262 5.58379C13.7154 5.99897 13.813 6.45 13.8125 6.90625C13.8129 7.36256 13.7152 7.81362 13.5259 8.22881C13.3365 8.64399 13.0601 9.01357 12.7153 9.31246C12.7476 9.76758 12.6817 10.2243 12.522 10.6517C12.3622 11.0791 12.1124 11.4672 11.7895 11.7895C11.4672 12.1124 11.0791 12.3622 10.6517 12.522C10.2243 12.6817 9.76758 12.7476 9.31246 12.7153C9.01357 13.0601 8.64399 13.3365 8.22881 13.5259C7.81362 13.7152 7.36256 13.8129 6.90625 13.8125C6.44994 13.8129 5.99888 13.7152 5.5837 13.5259C5.16851 13.3365 4.79893 13.0601 4.50004 12.7153C4.04485 12.7479 3.58798 12.6821 3.16045 12.5225C2.73292 12.3629 2.34474 12.1131 2.02229 11.7902C1.69927 11.4678 1.44941 11.0796 1.28966 10.6521C1.12992 10.2246 1.06404 9.7677 1.0965 9.31246C0.751834 9.01351 0.475524 8.64389 0.286328 8.22871C0.097132 7.81353 -0.000519642 7.36251 2.07956e-06 6.90625C2.07956e-06 5.94504 0.425002 5.08371 1.09721 4.50004C1.06481 4.04492 1.13072 3.58814 1.29046 3.16074C1.4502 2.73334 1.70003 2.34531 2.023 2.023C2.34531 1.70003 2.73334 1.4502 3.16074 1.29046C3.58815 1.13072 4.04492 1.06481 4.50004 1.09721ZM9.46334 5.62133C9.50583 5.5647 9.53659 5.50015 9.55378 5.43146C9.57097 5.36278 9.57427 5.29135 9.56346 5.22138C9.55265 5.1514 9.52797 5.08429 9.49086 5.02399C9.45374 4.9637 9.40495 4.91143 9.34735 4.87025C9.28975 4.82908 9.22449 4.79984 9.15543 4.78425C9.08636 4.76865 9.01488 4.76702 8.94517 4.77945C8.87547 4.79188 8.80895 4.81812 8.74953 4.85663C8.69011 4.89513 8.63899 4.94512 8.59917 5.00367L6.307 8.21242L5.15667 7.06208C5.05596 6.96824 4.92276 6.91716 4.78513 6.91959C4.64750 6.92201 4.51619 6.97777 4.41885 7.0751C4.32152 7.17244 4.26576 7.30375 4.26334 7.44138C4.26091 7.57901 4.312 7.71221 4.40584 7.81292L5.99959 9.40667C6.05412 9.46116 6.11986 9.50313 6.19224 9.52967C6.26463 9.5562 6.34192 9.56666 6.41875 9.56033C6.49558 9.55399 6.57012 9.53101 6.63718 9.49298C6.70424 9.45495 6.76221 9.40277 6.80709 9.34008L9.46334 5.62133Z" fill="#34A853"/>
                </Svg>

                <ThemedText
                  type="small"
                  style={{ color: colors.primary, fontWeight: "600" }}
                >
                  Completed
                </ThemedText>
              </View>
              <Pressable
                onPress={() => router.push("/modal") /* Using existing modal as placeholder for certificate */}
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
      </Pressable>
    );
  };


  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Header with back button */}
        <View style={{ paddingTop: 5, paddingBottom: 16 }}>
          <Pressable
            onPress={handleBackPress}
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
              backgroundColor: isSearchFocused ? colors.bglight10 : colors.input,
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
              placeholder="Search Modules or Categories"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              style={{
                flex: 1,
                fontSize: 14,
                color: colors.text,
              }}
            />
          </View>

        </View>

        {/* Conditional Rendering */}
        {isSearchFocused ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ marginTop: 10 }}>
              <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: 10 }}>
                {searchHistory.length > 0 ? "Recent Searches" : "Suggestions"}
              </ThemedText>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {suggestions.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleSuggestionPress(suggestion)}
                    style={{
                      backgroundColor: colors.background, 
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 4, 
                    }}
                  >
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      {suggestion}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          /* Modules List */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {isLoading ? (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText style={{ marginTop: 10, color: colors.textSecondary }}>
                  Loading your modules...
                </ThemedText>
              </View>
            ) : error ? (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <ThemedText style={{ color: "red" }}>{error}</ThemedText>
              </View>
            ) : filteredModules.length > 0 ? (
              filteredModules.map((sub) => renderModuleCard(sub))
            ) : (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <ThemedText type="small14" style={{ color: colors.textSecondary }} className="text-center">
                  {searchQuery ? "No modules match your search" : "You do not have any ongoing module at the moment, explore modules to find a perfect fit for you!"}
                </ThemedText>

                <Pressable
                  onPress={() => router.push("/(tabs)/all-modules")}
                  className="mt-6 rounded-lg py-3 px-6"
                  style={{ backgroundColor: colors.primary }}
                >
                  <ThemedText
                    style={{ color: colors.background, fontWeight: "600" }}
                  >
                    Explore Modules
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
