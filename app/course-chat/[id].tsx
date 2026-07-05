import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { useFetchCourseById } from "@/hooks/useCourses";
import socketClient from "@/services/socket/socketClient";
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://lsc-api.accordiaharmony.org/api";

interface Message {
  id: string | number;
  sender_name: string;
  role: "student" | "instructor" | "admin" | string;
  sender_photo?: string;
  message: string;
  created_at: string | Date;
  message_type?: string;
  reply_to_id?: number | string | null;
  is_pinned?: number;
  reply_message?: string | null;
  reply_sender_name?: string | null;
}

export default function CourseChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useThemedColors();
  const { course, isLoading } = useFetchCourseById(typeof id === 'string' ? id : null);
  const { currentUser, authToken } = useUserStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const courseId = typeof id === 'string' ? id : '';

  // Determine if current user can pin messages (instructor or admin)
  const canPin = !!currentUser && (
    (course as any)?.instructor_id === currentUser.userId ||
    ["admin", "subadmin"].includes(((currentUser as any)?.role || "").toString().toLowerCase())
  );

  // Fetch chat history
  const fetchHistory = useCallback(async (pageNum: number, prepend = false) => {
    if (isLoadingRef.current || (!hasMoreRef.current && pageNum > 1)) return;

    try {
      isLoadingRef.current = true;
      setIsLoadingHistory(true);
      
      const token = authToken;
      const response = await fetch(`${API_BASE_URL}/course-chat/${courseId}/chat-history?page=${pageNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch history");

      const data = await response.json();
      const newMessages = data.messages || [];

      if (newMessages.length === 0) {
        setHasMore(false);
        hasMoreRef.current = false;
      } else {
        setMessages(prev => prepend ? [...newMessages, ...prev] : newMessages);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Could not load chat history");
    } finally {
      isLoadingRef.current = false;
      setIsLoadingHistory(false);
    }
  }, [courseId, authToken]);

  // Socket, Reconnection Handler, and Initial History
  useEffect(() => {
    if (!courseId) return;

    // 1. Fetch initial history
    fetchHistory(1);

    // 2. Define reconnection handler — re-joins the room when socket reconnects
    const onConnect = () => {
      console.log(`Re-joining course chat room on reconnect: ${courseId}`);
      socketClient.emit("join_course_chat", { courseId });
    };

    // 3. Connect and Join room (async)
    const initializeSocket = async () => {
      await socketClient.connect({ token: authToken });
      await socketClient.emit("join_course_chat", { courseId });

      // 4. Listen for new messages
      const handleReceiveMessage = (newMessage: Message) => {
        setMessages((prev) => {
          const isOptimisticDuplicate = prev.some(
            (msg) =>
              msg.id.toString().startsWith("temp-") &&
              msg.message === newMessage.message &&
              msg.sender_name === newMessage.sender_name
          );

          if (isOptimisticDuplicate) {
            let replaced = false;
            return prev.map((msg) => {
              if (!replaced && msg.id.toString().startsWith("temp-") && 
                  msg.message === newMessage.message && 
                  msg.sender_name === newMessage.sender_name) {
                replaced = true;
                return newMessage;
              }
              return msg;
            });
          }

          if (prev.some((msg) => msg.id === newMessage.id)) {
            return prev;
          }

          return [...prev, newMessage];
        });
        
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 100);
      };

      // 5. Listen for pin updates
      const handlePinnedUpdated = (data: { messageId: number | string; isPinned: number }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, is_pinned: data.isPinned } : msg
          )
        );
      };

      const handleErrorMessage = (data: { message: string }) => {
        toast.error(data.message);
      };

      await socketClient.on("receive_course_message", handleReceiveMessage);
      await socketClient.on("message_pinned_updated", handlePinnedUpdated);
      await socketClient.on("error_message", handleErrorMessage);

      // 6. Bind reconnect handler so the room is re-joined if socket drops and reconnects
      await socketClient.on("connect", onConnect);
    };

    initializeSocket();

    // 7. Cleanup on unmount
    return () => {
      socketClient.emit("leave_course_chat", { courseId });
      socketClient.off("receive_course_message");
      socketClient.off("message_pinned_updated");
      socketClient.off("error_message");
      socketClient.off("connect");
    };
  }, [courseId, fetchHistory, authToken]);

  const scrollToBottom = useCallback((animated: boolean = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y === 0 && hasMore && !isLoadingHistory) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage, true);
    }
  };

  const handleTogglePin = (messageId: string | number, currentlyPinned?: number) => {
    const nextPinned = currentlyPinned === 1 ? 0 : 1;
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, is_pinned: nextPinned } : msg))
    );
    socketClient.emit("pin_course_message", {
      courseId,
      messageId,
      isPinned: nextPinned === 1,
    });
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyTo(message);
  };

  const clearReply = () => setReplyTo(null);

  const handleVoiceInput = () => {
    toast("Use the microphone on your keyboard to dictate a message 🎙️");
  };

  const sendMessage = () => {
    if (!inputText.trim() || !currentUser) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_name: currentUser.fullname || currentUser.username || "You",
      role: "student",
      sender_photo: currentUser.userImage || undefined,
      message: inputText.trim(),
      created_at: new Date().toISOString(),
      message_type: "text",
      reply_to_id: replyTo?.id ?? null,
      reply_message: replyTo?.message ?? null,
      reply_sender_name: replyTo?.sender_name ?? null,
      is_pinned: 0,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    
    const messageToSend = inputText.trim();
    setInputText("");
    setReplyTo(null);
    
    scrollToBottom(true);

    socketClient.emit("send_course_message", {
      courseId,
      message: messageToSend,
      messageType: 'text',
      replyToId: replyTo?.id ?? null,
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.bglight10 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bglight10 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <ThemedText type="defaultSemiBold" numberOfLines={1}>
              {course?.title || "Course Group Chat"}
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34A853', marginRight: 4 }} />
                <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Group Chat</ThemedText>
            </View>
          </View>

          <TouchableOpacity style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          {isLoadingHistory && page > 1 && (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                Loading older messages...
              </ThemedText>
            </View>
          )}

          {messages.length === 0 && !isLoadingHistory ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary + '80'} />
              <ThemedText style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginTop: 12 }}>
                No messages yet
              </ThemedText>
              <ThemedText style={{ fontSize: 14, color: colors.textSecondary + 'A0', marginTop: 4 }}>
                Start a discussion!
              </ThemedText>
            </View>
          ) : (
            <>
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <View style={{ backgroundColor: colors.bglight10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                    <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Today</ThemedText>
                </View>
              </View>

              {messages.map((msg, index) => {
                const currentUserName = (currentUser?.fullname || currentUser?.username || "").trim().toLowerCase();
                const msgSenderName = (msg.sender_name || "").trim().toLowerCase();
                const isMe = msgSenderName === currentUserName || msg.sender_name === "You";

                return (
                  <View
                    key={msg.id || `msg-${index}-${msg.created_at}`}
                    style={{
                      flexDirection: 'row',
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      alignItems: 'flex-end',
                      gap: 8,
                      marginBottom: 16
                    }}
                  >
                    {!isMe && (
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '20', overflow: 'hidden', borderWidth: 1, borderColor: colors.primary + '30' }}>
                          {msg.sender_photo ? (
                              <Image source={{ uri: msg.sender_photo }} style={{ width: '100%', height: '100%' }} />
                          ) : (
                              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                 <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary }}>{msg.sender_name[0]?.toUpperCase()}</ThemedText>
                              </View>
                          )}
                      </View>
                    )}

                    <View style={{ maxWidth: '75%' }}>
                      {!isMe && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4, marginBottom: 2, gap: 6 }}>
                          <ThemedText style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 'bold' }}>
                              {msg.sender_name}
                          </ThemedText>
                          {msg.role === "instructor" && (
                            <View style={{ backgroundColor: colors.primary + '30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                              <ThemedText style={{ fontSize: 9, color: colors.primary, fontWeight: 'bold' }}>
                                INSTRUCTOR
                              </ThemedText>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Reply preview bubble */}
                      {msg.reply_to_id && msg.reply_message && (
                        <View style={{
                          backgroundColor: colors.bglight10,
                          borderLeftWidth: 3,
                          borderLeftColor: colors.primary,
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          marginBottom: 4,
                          opacity: 0.85,
                        }}>
                          <ThemedText style={{ fontSize: 10, color: colors.primary, fontWeight: 'bold', marginBottom: 1 }}>
                            Replying to {msg.reply_sender_name || "Someone"}
                          </ThemedText>
                          <ThemedText style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>
                            {msg.reply_message}
                          </ThemedText>
                        </View>
                      )}

                      <View
                        style={{
                          padding: 12,
                          borderRadius: 16,
                          backgroundColor: isMe ? colors.primary : (msg.role === 'instructor' ? colors.primary + '15' : colors.bglight10),
                          borderBottomLeftRadius: isMe ? 16 : 4,
                          borderBottomRightRadius: isMe ? 4 : 16,
                          borderWidth: msg.role === 'instructor' && !isMe ? 1 : 0,
                          borderColor: msg.role === 'instructor' ? colors.primary + '30' : 'transparent',
                          position: 'relative',
                        }}
                      >
                        {/* Pinned badge */}
                        {msg.is_pinned === 1 && (
                          <View style={{
                            position: 'absolute',
                            top: 4,
                            right: 8,
                            backgroundColor: '#FBBF24' + '30',
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}>
                            <ThemedText style={{ fontSize: 9, color: '#92400E', fontWeight: 'bold' }}>📌 PINNED</ThemedText>
                          </View>
                        )}
                        <ThemedText style={{ color: isMe ? "white" : colors.text, paddingTop: msg.is_pinned === 1 ? 16 : 0 }}>
                          {msg.message}
                        </ThemedText>
                      </View>

                      {/* Time + Reply + Pin actions */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginHorizontal: 4, gap: 8, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>
                          {new Date(msg.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </ThemedText>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          <Pressable
                            onPress={() => handleReplyToMessage(msg)}
                            style={{ backgroundColor: colors.bglight10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}
                          >
                            <ThemedText style={{ fontSize: 10, color: colors.text }}>Reply</ThemedText>
                          </Pressable>
                          {canPin && (
                            <Pressable
                              onPress={() => handleTogglePin(msg.id, msg.is_pinned)}
                              style={{ backgroundColor: colors.bglight10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}
                            >
                              <ThemedText style={{ fontSize: 10, color: colors.text }}>
                                {msg.is_pinned === 1 ? "Unpin" : "Pin"}
                              </ThemedText>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        {/* Reply Preview Bar */}
        {replyTo && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: colors.primary + '30',
            backgroundColor: colors.primary + '08',
          }}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 11, color: colors.primary, fontWeight: 'bold' }}>
                Replying to {replyTo.sender_name}
              </ThemedText>
              <ThemedText style={{ fontSize: 13, color: colors.textSecondary }} numberOfLines={1}>
                {replyTo.message}
              </ThemedText>
            </View>
            <Pressable
              onPress={clearReply}
              style={{ padding: 8 }}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8, borderTopWidth: 1, borderTopColor: colors.bglight10 }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.bglight10,
                borderRadius: 25,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <TextInput
                style={{ flex: 1, color: colors.text, fontSize: 16, maxHeight: 100 }}
                placeholder="Type a message..."
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity onPress={handleVoiceInput} style={{ marginLeft: 4 }}>
                <Ionicons name="mic-outline" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={sendMessage}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: inputText.trim() === "" ? 0.6 : 1
              }}
              disabled={inputText.trim() === ""}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
