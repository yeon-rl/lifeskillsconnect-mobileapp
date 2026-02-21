import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemedColors } from "@/hooks/use-themed-colors";
import {
    getChatHistory,
    sendSupportMessage,
    startAnonymousChat
} from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const STORAGE_KEYS = {
  CHAT_ID: "ls_anonymous_chat_id",
  MESSAGES: "ls_anonymous_messages",
  SESSION_ACTIVE: "ls_anonymous_session_active",
};

const TypingDot = ({ delay }: { delay: number }) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        )
      ),
      -1,
      false
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: 0.8 + (opacity.value * 0.2) }]
  }));

  return (
    <Animated.View 
      style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#5A7C65' }, animatedStyle]} 
    />
  );
};

interface Message {
  id: string;
  text: string;
  sender: "user" | "responder";
  timestamp: Date;
}

export default function AnonymousChatScreen() {
  const colors = useThemedColors();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string>("Ready to start a conversation");
  const [showAgentJoiningMsg, setShowAgentJoiningMsg] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const pollInterval = useRef<any>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesCount = useRef(messages.length);

  // Auto-scroll logic solely based on message array changes
  useEffect(() => {
    if (messages.length > prevMessagesCount.current) {
      if (shouldAutoScroll) {
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });
      }
    }
    prevMessagesCount.current = messages.length;
  }, [messages.length, shouldAutoScroll]);

  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    setShouldAutoScroll(isCloseToBottom);
  }, []);

  const clearChatSession = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CHAT_ID),
        AsyncStorage.removeItem(STORAGE_KEYS.SESSION_ACTIVE),
        AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES),
      ]);
      setChatId(null);
      setSessionActive(false);
      setMessages([]);
      setErrorMessage(null);
      setAgentStatus("Ready to start a conversation");
      setIsAgentTyping(false);
      setShowAgentJoiningMsg(false);
    } catch (e) {
      console.error("Failed to clear session:", e);
    }
  };

  const handleEndChat = async () => {
    await clearChatSession();
    router.back();
  };

  // Restore session from AsyncStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedChatId, savedSessionActive, savedMessages] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CHAT_ID),
          AsyncStorage.getItem(STORAGE_KEYS.SESSION_ACTIVE),
          AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
        ]);

        if (savedChatId) setChatId(savedChatId);
        if (savedSessionActive === "true") setSessionActive(true);
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })));
        }
      } catch (e) {
        console.error("Failed to restore session:", e);
      }
    };
    restoreSession();

    return () => {
      // Clear chat session when leaving the screen
      clearChatSession();
    };
  }, []);

  // Save session status whenever it changes
  useEffect(() => {
    const saveSession = async () => {
      try {
        if (chatId) {
          const stringChatId = String(chatId);
          await AsyncStorage.setItem(STORAGE_KEYS.CHAT_ID, stringChatId);
        }
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, sessionActive.toString());
        if (messages.length > 0) {
          await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
        }
      } catch (e) {
        console.error("Failed to save session:", e);
      }
    };
    saveSession();
  }, [chatId, sessionActive, messages]);

  // Determine if we should show the "agent joining" message
  useEffect(() => {
    if (sessionActive && messages.length > 0) {
      const hasAgent = messages.some(m => m.sender === "responder");
      setShowAgentJoiningMsg(!hasAgent);
    } else {
      setShowAgentJoiningMsg(false);
    }
  }, [messages, sessionActive]);

  const fetchMessages = async (id: string, isMounted: { current: boolean }) => {
    try {
      if (!id) return;
      const data = await getChatHistory(id);
      
      if (isMounted.current && data.messages && Array.isArray(data.messages)) {
        const mappedMessages: Message[] = data.messages.map((msg: any) => {
          const rawSender = msg.senderType || msg.sender_type || msg.role || msg.sender || msg.sender_role || "";
          const sType = String(rawSender).toLowerCase().trim();
          
          const isAgent = [
            "agent", "counselor", "admin", "support", "staff", "mentor", "agent_user", "counselor_user"
          ].some(role => sType.includes(role));
          
          let timestamp = new Date();
          const dateStr = msg.createdAt || msg.created_at || msg.timestamp || msg.date || msg.datetime || msg.time;
          if (dateStr) {
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              timestamp = parsedDate;
            }
          }
          
          return {
            id: (msg.id || msg._id || Math.random()).toString(),
            sender: isAgent ? "responder" : "user",
            text: msg.message || msg.content || msg.text || "",
            timestamp: timestamp,
          };
        });

        if (isMounted.current) {
          setMessages(mappedMessages);
          
          // Check for typing indicator from various possible field names
          const typStatus = data.isTyping || data.is_typing || data.agent_typing || data.typing || false;
          setIsAgentTyping(!!typStatus);
        }
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("Polling error:", error);
      }
    }
  };

  // Set up polling
  useEffect(() => {
    const isMounted = { current: true };
    
    if (chatId && sessionActive) {
      fetchMessages(chatId, isMounted);
      pollInterval.current = setInterval(() => {
        if (isMounted.current) {
          fetchMessages(chatId, isMounted);
        }
      }, 3000);
    }

    return () => {
      isMounted.current = false;
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [chatId, sessionActive]);

  const startChat = async (initialMessage?: string) => {
    try {
      setIsConnecting(true);
      setErrorMessage(null);
      
      const data = await startAnonymousChat(initialMessage);
      
      if (!data || !data.chatId) {
        throw new Error("Invalid response from startAnonymousChat: missing chatId");
      }

      const newChatId = String(data.chatId);
      
      setAgentStatus("Chat initiated. Waiting for a counselor to join...");
      setChatId(newChatId);
      setSessionActive(true);
      return newChatId;
    } catch (error: any) {
      console.error("Error starting chat:", error);
      const msg = error.response?.data?.message || error.message || "Could not start chat";
      setErrorMessage(`${msg}. Please try again later.`);
      setAgentStatus("Failed to start anonymous session");
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const sendMessage = async (text: string) => {
    const finalMessage = text.trim();
    if (!finalMessage || isConnecting) return;

    const userMessage: Message = {
      id: `local-${Date.now()}`,
      text: finalMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setShouldAutoScroll(true);

    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = await startChat(finalMessage);
    }

    if (currentChatId) {
      try {
        await sendSupportMessage(currentChatId, finalMessage);
        fetchMessages(currentChatId, { current: true });
      } catch (error: any) {
        console.error("Error sending message:", error);
        const errorMsg = error.response?.data?.message || error.message || "Failed to send message";
        setErrorMessage(`${errorMsg}. Please try again.`);
      }
    } else {
      setInputText(finalMessage);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center bg-[#5A7C651A] dark:bg-[#5A7C651A]"
            style={{ backgroundColor: colors.bglight10 }}
          >
            <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <Path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M7.01813 11.3895C6.89044 11.2616 6.81873 11.0883 6.81873 10.9076C6.81873 10.7269 6.89044 10.5537 7.01813 10.4258L13.8363 3.60763C13.8987 3.54064 13.974 3.48692 14.0576 3.44965C14.1413 3.41238 14.2316 3.39235 14.3231 3.39073C14.4147 3.38912 14.5056 3.40596 14.5905 3.44025C14.6754 3.47454 14.7525 3.52558 14.8173 3.59032C14.882 3.65507 14.933 3.73219 14.9673 3.81709C15.0016 3.90199 15.0185 3.99292 15.0168 4.08447C15.0152 4.17602 14.9952 4.2663 14.9579 4.34994C14.9207 4.43358 14.8669 4.50885 14.7999 4.57127L8.46358 10.9076L14.7999 17.244C14.8669 17.3064 14.9207 17.3817 14.9579 17.4653C14.9952 17.549 15.0152 17.6392 15.0168 17.7308C15.0185 17.8223 15.0016 17.9133 14.9673 17.9982C14.933 18.0831 14.882 18.1602 14.8173 18.2249C14.7525 18.2897 14.6754 18.3407 14.3231 18.4245C14.2316 18.4229 14.1413 18.4029 14.0576 18.3656C13.974 18.3284 13.8987 18.2746 13.8363 18.2076L7.01813 11.3895Z" 
                fill="#5A7C65" 
                fillOpacity={0.5}
              />
            </Svg>
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#5A7C65" />
            <ThemedText className="font-semibold text-gray-500">Anonymous Chat</ThemedText>
          </View>

          { (sessionActive || messages.length > 0) ? (
            <TouchableOpacity 
              onPress={handleEndChat}
              className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-50 dark:bg-red-500/10"
            >
              <ThemedText style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>
                End Chat
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <View className="w-16" />
          )}
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6"
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingBottom: 20 
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (shouldAutoScroll && messages.length > 0) {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }
          }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center py-10">
              <View className="items-center mb-8">
                <View 
                  style={{ 
                    width: 150, 
                    height: 150, 
                    borderRadius: 75, 
                    backgroundColor: '#5A7C64',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <Image 
                    source={require('@/assets/images/lifeskillsLogo.png')}
                    style={{ width: 100, height: 100 }}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View className="items-center gap-3">
                <ThemedText type="title" className="text-center" style={{color: "#5A7C64", fontWeight: 500}}>
                  Hi Zeeno! 👋🏻
                </ThemedText>
                
                <ThemedText type="small14" className="text-base text-center leading-7 px-4">
                  Welcome. You're in a safe space now. You can talk to us about anything, no pressure, no names, no judgment. We're here to listen and support you, whenever you're ready.
                </ThemedText>
                
                {errorMessage && (
                  <View className="mt-4 p-3 bg-red-100 rounded-lg">
                    <ThemedText className="text-red-600 text-center">{errorMessage}</ThemedText>
                  </View>
                )}
                
                {isConnecting && (
                  <ThemedText className="mt-4 text-[#5A7C64]">
                    Connecting to a safe space...
                  </ThemedText>
                )}
              </View>
            </View>
          ) : (
            <View className="mt-4 gap-4">
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  className={`flex-row ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                >
                  <View
                    className={`p-4 rounded-2xl max-w-[80%] ${
                      msg.sender === "user"
                        ? "rounded-tr-none"
                        : "bg-[#5A7C65] rounded-tl-none"
                    }`}
                    style={msg.sender === "user" ? { backgroundColor: colors.bglight10 } : undefined}
                  >
                    <ThemedText
                      style={msg.sender === "user" ? { color: colors.text } : { color: 'white' }}
                    >
                      {msg.text}
                    </ThemedText>
                  </View>
                </View>
              ))}
              
              {showAgentJoiningMsg && (
                <View className="items-center py-2">
                  <ThemedText type="small14" className="text-gray-400 italic">
                    Waiting for a counselor to join...
                  </ThemedText>
                </View>
              )}
              
              {isAgentTyping && (
                <View className="flex-row justify-start items-center gap-2 mb-2">
                  <View 
                    style={{ backgroundColor: colors.bglight10 }}
                    className="px-4 py-3 rounded-2xl rounded-tl-none flex-row items-center gap-1"
                  >
                    <TypingDot delay={0} />
                    <TypingDot delay={200} />
                    <TypingDot delay={400} />
                  </View>
                </View>
              )}
              
              {errorMessage && (
                <View className="p-2 bg-red-50 rounded-lg mx-10">
                  <ThemedText className="text-red-500 text-xs text-center">{errorMessage}</ThemedText>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <View className="flex-row items-center gap-3 px-6 py-4 mb-2">
            <View
              className="flex-1 flex-row items-center px-5 py-4 rounded-full"
              style={{backgroundColor: colors.inputBg}}
            >
              <TextInput
                className="flex-1 text-base py-1"
                placeholder="Enter message"
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                style={{ color: colors.text }}
                multiline
              />
              <TouchableOpacity className="ml-2">
                <Ionicons name="mic-outline" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => sendMessage(inputText)}
              className="bg-[#5A7C65] w-14 h-14 rounded-full items-center justify-center shadow-sm"
              activeOpacity={0.8}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M3.47779 2.40478C3.34782 2.36702 3.21006 2.36513 3.07911 2.39932C2.94817 2.4335 2.82891 2.50248 2.73398 2.59895C2.63906 2.69541 2.572 2.81576 2.53992 2.94724C2.50785 3.07873 2.51195 3.21644 2.55179 3.34578L4.98379 11.2508H13.4998C13.6987 11.2508 13.8895 11.3298 14.0301 11.4704C14.1708 11.6111 14.2498 11.8019 14.2498 12.0008C14.2498 12.1997 14.1708 12.3905 14.0301 12.5311C13.8895 12.6718 13.6987 12.7508 13.4998 12.7508H4.98379L2.55179 20.6558C2.51218 20.7851 2.50826 20.9226 2.54044 21.054C2.57263 21.1853 2.63971 21.3055 2.7346 21.4018C2.82949 21.4981 2.94865 21.567 3.07947 21.6011C3.2103 21.6353 3.34793 21.6334 3.47779 21.5958C10.0928 19.6721 16.3307 16.6331 21.9228 12.6098C22.0194 12.5403 22.0981 12.4489 22.1524 12.343C22.2067 12.2371 22.235 12.1198 22.235 12.0008C22.235 11.8818 22.2067 11.7645 22.1524 11.6586C22.0981 11.5527 22.0194 11.4612 21.9228 11.3918C16.3308 7.36807 10.0928 4.32873 3.47779 2.40478Z" fill="white"/>
              </Svg>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
