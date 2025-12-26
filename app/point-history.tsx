import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemedColors } from "@/hooks/use-themed-colors";
import Svg, { Path } from "react-native-svg";

const HISTORY_DATA = [
  {
    id: "1",
    title: "Financial literacy and Budgeting",
    mentor: "Andrew Dickson",
    timestamp: "2days ago",
    points: 20,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    title: "Investment Strategies",
    mentor: "Jessica Lee",
    timestamp: "3 days ago",
    points: 15,
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    title: "Understanding Credit Scores",
    mentor: "Michael Smith",
    timestamp: "1 week ago",
    points: 25,
    image: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "4",
    title: "Retirement Planning Basics",
    mentor: "Samantha Johnson",
    timestamp: "5 days ago",
    points: 30,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "5",
    title: "Real Estate Investment",
    mentor: "David Kim",
    timestamp: "2 weeks ago",
    points: 18,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "6",
    title: "Debt Management Strategies",
    mentor: "Emily Davis",
    timestamp: "4 days ago",
    points: 22,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "7",
    title: "Tax Planning Tips",
    mentor: "Robert Brown",
    timestamp: "1 week ago",
    points: 28,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=60",
  },
];

export default function PointHistoryScreen() {
  const colors = useThemedColors();

  const renderItem = ({ item }: { item: typeof HISTORY_DATA[0] }) => (
    <View style={styles.historyItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.itemMentor}>{item.mentor}</ThemedText>
        <ThemedText style={styles.itemTime}>{item.timestamp}</ThemedText>
      </View>
      <ThemedText style={styles.itemPoints}>{item.points}pts</ThemedText>
    </View>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.bglight10 }]}
          >
            <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <Path fill-rule="evenodd" clip-rule="evenodd" d="M7.01813 11.3914C6.89044 11.2636 6.81873 11.0903 6.81873 10.9096C6.81873 10.7289 6.89044 10.5556 7.01813 10.4278L13.8363 3.60959C13.8987 3.5426 13.974 3.48887 14.0576 3.4516C14.1413 3.41434 14.2316 3.3943 14.3231 3.39268C14.4147 3.39107 14.5056 3.40791 14.5905 3.4422C14.6754 3.47649 14.7525 3.52753 14.8173 3.59228C14.882 3.65702 14.933 3.73414 14.9673 3.81904C15.0016 3.90394 15.0185 3.99488 15.0168 4.08642C15.0152 4.17797 14.9952 4.26826 14.9579 4.35189C14.9207 4.43553 14.8669 4.5108 14.7999 4.57322L8.46358 10.9096L14.7999 17.2459C14.8669 17.3084 14.9207 17.3836 14.9579 17.4673C14.9952 17.5509 15.0152 17.6412 15.0168 17.7327C15.0185 17.8243 15.0016 17.9152 14.9673 18.0001C14.933 18.085 14.882 18.1621 14.8173 18.2269C14.7525 18.2916 14.6754 18.3427 14.5905 18.377C14.5056 18.4113 14.4147 18.4281 14.3231 18.4265C14.2316 18.4249 14.1413 18.4048 14.0576 18.3676C13.974 18.3303 13.8987 18.2766 13.8363 18.2096L7.01813 11.3914Z" fill="#5A7C65" fill-opacity="0.5"/>
            </Svg>
          </Pressable>
        </View>

        <FlatList
          data={HISTORY_DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <ThemedText type="subtitle" style={styles.pageTitle}>
              Point History
            </ThemedText>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 5,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 24,
    marginTop: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 1,
  },
  itemMentor: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 1,
  },
  itemTime: {
    fontSize: 12,
    color: "#5A7C65",
    fontWeight: 500,
  },
  itemPoints: {
    fontSize: 14,
    fontWeight: 600,
    color: "#5A7C65",
  },
});
