import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import HistorySidebar from "@/components/HistorySidebar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";

const { width } = Dimensions.get("window");

export default function MentorChatScreen() {
  const colors = useThemedColors();
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  
  const { 
    messages: chatMessages, 
    startNewChat,
    loadConversation,
    fetchConversations,
    currentConversationId,
    conversations,
    sendMessage,
    isTyping
  } = useChatStore();
  
  const { authToken } = useUserStore();
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch conversations on mount
  React.useEffect(() => {
    if (authToken) {
      fetchConversations(authToken);
    }
  }, [authToken, fetchConversations]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !authToken) return;
    setInputText("");
    await sendMessage(text, authToken);
  };

  const handleSuggestedPress = (question: string) => {
    handleSendMessage(question);
  };

  const handleNewChat = () => {
    startNewChat();
    setIsSidebarVisible(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    if (authToken) {
      loadConversation(conversationId, authToken);
      setIsSidebarVisible(false);
    }
  };

  // Map store conversations to HistorySidebar format
  const mappedConversations = conversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    messages: conv.messages || [],
    date: new Date(conv.createdAt)
  }));

  return (
    <ThemedView style={{ flex: 1 }} className="bg-white">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Background Blob */}
        <View style={{ position: "absolute", top: -50, right: -50, zIndex: -1 }}>
          {/* <Svg width="345" height="262" viewBox="0 0 345 262" fill="none">
            <G opacity="0.2" filter="url(#filter0_f_394_2369)">
            <Circle cx="197.4" cy="64" r="114" fill="#2B59FC"/>
            </G>
          </Svg> */}
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full" style={{backgroundColor: colors.bglight10}}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View className="bg-[#5A7C64] px-4 py-2 rounded-lg">
            <ThemedText className="text-white! font-bold" style={{color: "white"}} type="small">100 LScPoints</ThemedText>
          </View>

          <TouchableOpacity className="p-2" onPress={() => setIsSidebarVisible(true)}>
            <Ionicons name="menu-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        <HistorySidebar
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
          onSelectItem={handleSelectConversation}
          onNewChat={handleNewChat}
          conversations={mappedConversations}
        />

        {/* Chat Content */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {chatMessages.length === 0 ? (
            <View className="items-center justify-center mt-40">
              <View className="mb-10 items-center">
                 <Svg width="120" height="120" viewBox="0 0 60 60" fill="none">
                    <Defs>
                        <LinearGradient id="paint0_linear" x1="30" y1="0" x2="30" y2="60" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="#86D99C"/>
                            <Stop offset="1" stopColor="#5BB974"/>
                        </LinearGradient>
                    </Defs>
                    <Circle cx="30" cy="30" r="30" fill="url(#paint0_linear)"/>
                    <Path d="M20 25C20 22.2386 22.2386 20 25 20H35C37.7614 20 40 22.2386 40 25V35C40 37.7614 37.7614 40 35 40H25C22.2386 40 20 37.7614 20 35V25Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
                    <Circle cx="26" cy="28" r="2.5" fill="white"/>
                    <Circle cx="34" cy="28" r="2.5" fill="white"/>
                    <Path d="M27 34C27 34 28.5 35.5 30 35.5C31.5 35.5 33 34 33 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M30 20V16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    <Circle cx="30" cy="14" r="2" fill="white"/>
                </Svg>
              </View>

              <View className="gap-3 w-full">
                {[
                  "How do I budget £100 for the week?",
                  "What career paths fit someone who enjoys art and technology?",
                  "What should I do if I feel unsafe at home?",
                ].map((q, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSuggestedPress(q)}
                    className="p-4 rounded-xl w-fit items-center "
                    style={{backgroundColor: colors.bglight10}}
                  >
                    <ThemedText className="text-center text-sm opacity-80" style={{ color: colors.text }}>{q}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View className="mt-4 gap-4">
              {chatMessages.map((msg) => (
                <View
                  key={msg.id}
                  className={`flex-row ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                >
                  {msg.role !== "user" && (
                     <View className="mb-1">
                        <Svg width="36" height="36" viewBox="0 0 60 60" fill="none">
                            <Defs>
                                <LinearGradient id="paint0_linear_small" x1="30" y1="0" x2="30" y2="60" gradientUnits="userSpaceOnUse">
                                    <Stop stopColor="#5A7C65"/>
                                    <Stop offset="1" stopColor="#5A7C65"/>
                                </LinearGradient>
                            </Defs>
                            <Circle cx="30" cy="30" r="30" fill="url(#paint0_linear_small)"/>
                            <Path d="M20 25C20 22.2386 22.2386 20 25 20H35C37.7614 20 40 22.2386 40 25V35C40 37.7614 37.7614 40 35 40H25C22.2386 40 20 37.7614 20 35V25Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
                            <Circle cx="26" cy="28" r="2.5" fill="white"/>
                            <Circle cx="34" cy="28" r="2.5" fill="white"/>
                            <Path d="M27 34C27 34 28.5 35.5 30 35.5C31.5 35.5 33 34 33 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <Path d="M30 20V16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                            <Circle cx="30" cy="14" r="2" fill="white"/>
                        </Svg>
                     </View>
                  )}
                  <View
                    className={`p-4 rounded-2xl max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-[#F2F6F3] dark:bg-[#5A7C6533] rounded-tr-none"
                        : "bg-[#4285F4] rounded-tl-none"
                    }`}
                  >
                    <ThemedText
                      className={`${msg.role === "user" ? "text-gray-800" : ""}`}
                      style={msg.role !== "user" ? { color: "white" } : undefined}
                    >
                      {msg.content}
                    </ThemedText>
                  </View>
                </View>
              ))}
              
              {isTyping && (
                <View className="flex-row justify-start items-center gap-2">
                   <View className="mb-1">
                      <Svg width="36" height="36" viewBox="0 0 60 60" fill="none">
                          <Circle cx="30" cy="30" r="30" fill="#5A7C65"/>
                      </Svg>
                   </View>
                   <View className="p-4 bg-[#4285F4] rounded-2xl rounded-tl-none">
                      <ThemedText style={{color: "white"}}>Mentor is typing...</ThemedText>
                   </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <View className="flex-row items-center gap-2 px-4 py-4 mb-3 bg-white dark:bg-black">
            <View
              className="flex-1 flex-row items-center bg-[#F2F6F3] dark:bg-[#5A7C6533] dark:border-none px-4 py-3 rounded-full border border-gray-100 dark:border-[#5A7C6533]"
            >
              <TextInput
                className="flex-1 text-base py-1"
                placeholder="Enter message"
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity className="ml-2">
                <Ionicons name="mic-outline" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => handleSendMessage(inputText)}
              className="bg-[#5A7C65] w-14 h-14 rounded-full items-center justify-center"
              disabled={isTyping}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M3.47803 2.40478C3.34807 2.36702 3.21031 2.36513 3.07936 2.39932C2.94841 2.4335 2.82915 2.50248 2.73423 2.59895C2.6393 2.69541 2.57224 2.81576 2.54017 2.94724C2.50809 3.07873 2.51219 3.21644 2.55203 3.34578L4.98403 11.2508H13.5C13.6989 11.2508 13.8897 11.3298 14.0304 11.4704C14.171 11.6111 14.25 11.8019 14.25 12.0008C14.25 12.1997 14.171 12.3905 14.0304 12.5311C13.8897 12.6718 13.6989 12.7508 13.5 12.7508H4.98403L2.55203 20.6558C2.51243 20.7851 2.50851 20.9226 2.54069 21.054C2.57287 21.1853 2.63995 21.3055 2.73484 21.4018C2.82973 21.4981 2.94889 21.567 3.07972 21.6011C3.21055 21.6353 3.34817 21.6334 3.47803 21.5958C10.093 19.6721 16.331 16.6331 21.923 12.6098C22.0197 12.5403 22.0984 12.4489 22.1527 12.343C22.207 12.2371 22.2353 12.1198 22.2353 12.0008C22.2353 11.8818 22.207 11.7645 22.1527 11.6586C22.0984 11.5527 22.0197 11.4612 21.923 11.3918C16.331 7.36807 10.0931 4.32873 3.47803 2.40478Z" fill="white"/>
              </Svg>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
