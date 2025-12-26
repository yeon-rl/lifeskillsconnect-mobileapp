import { ThemedText } from "@/components/themed-text";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export interface ChatConversation {
  id: string;
  title: string;
  messages: any[];
  date: Date;
}

interface HistorySidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectItem: (conversationId: string) => void;
  onNewChat: () => void;
  conversations: ChatConversation[];
}

export default function HistorySidebar({
  isVisible,
  onClose,
  onSelectItem,
  onNewChat,
  conversations,
}: HistorySidebarProps) {
  const colors = useThemedColors();
  const insets = useSafeAreaInsets();

  // Group conversations by date (Today, Yesterday, etc.) - Simplified for now
  const groupedHistory = conversations.reduce((acc, conv) => {
    const today = new Date().toDateString();
    const convDate = new Date(conv.date).toDateString();
    const key = today === convDate ? "Today" : "Previous";
    if (!acc[key]) acc[key] = [];
    acc[key].push(conv);
    return acc;
  }, {} as Record<string, ChatConversation[]>);

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Sidebar Content */}
        <View
          style={{
            width: width * 0.8,
            backgroundColor: colors.background,
            height: "100%",
            paddingTop: insets.top > 0 ? insets.top : 20,
          }}
        >
          <View className="flex-1">
            <View className="px-6 py-4">
              {/* Search */}
              <View className="flex-row items-center px-4 py-3 rounded-xl mb-6" style={{backgroundColor: colors.inputBg}}>
                <TextInput
                  className="flex-1 text-base mr-2"
                  placeholder="Search History"
                  placeholderTextColor="#9CA3AF"
                />
                <Ionicons name="search-outline" size={20} color="#9CA3AF" />
              </View>

              <View className="flex-row items-center gap-2 mb-2">
                 <ThemedText type="colorGreen" className="font-bold text-xl">Ask your Mentor</ThemedText>
                 <View className=" p-1 rounded-md">
                    <ThemedText style={{fontSize: 12}}>💭</ThemedText>
                 </View>
              </View>

              <ThemedText className="font-medium text-lg mb-4">History</ThemedText>

              {/* Start New Chat Button */}
              <TouchableOpacity
                onPress={() => {
                  onNewChat();
                  onClose();
                }}
                className="bg-[#5A7C65] flex-row items-center justify-center p-4 rounded-xl mb-6 gap-2"
              >
                <Ionicons name="add-circle-outline" size={24} color="white" />
                <ThemedText style={{ color: "white" }} className="font-bold">Start New Chat</ThemedText>
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.entries(groupedHistory).map(([sectionTitle, items]) => (
                  <View key={sectionTitle} className="mb-6">
                    <ThemedText className="font-semibold mb-3 text-xs" style={{color: colors.textSecondary}}>
                      {sectionTitle}
                    </ThemedText>
                    <View className="gap-4">
                      {items.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => {
                            onSelectItem(item.id);
                            onClose();
                          }}
                        >
                          <ThemedText className="text-gray-500 text-base" numberOfLines={1}>
                            {item.title}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Overlay background */}
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}
