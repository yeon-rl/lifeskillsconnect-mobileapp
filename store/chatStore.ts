import { create } from "zustand";
import { chatService } from "../services/api/chatService";

const safeParseDate = (dateInput: any): Date => {
  try {
    if (!dateInput) return new Date();
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return new Date();
    return date;
  } catch {
    return new Date();
  }
};

export interface ChatMessage {
  id: number | string;
  role: "user" | "ai" | "assistant";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages?: ChatMessage[];
  date: string;
  createdAt: number;
  displayDate?: string;
}

interface ChatStore {
  // Current chat session
  messages: ChatMessage[];
  currentConversationId: string | null;
  isLoading: boolean;
  isTyping: boolean;

  // Conversation history
  conversations: Conversation[];

  // Methods
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  
  // API actions
  fetchConversations: (token: string) => Promise<void>;
  loadConversation: (conversationId: string, token: string) => Promise<void>;
  sendMessage: (message: string, token: string) => Promise<void>;
  startNewChat: () => void;
  
  // Helper
  getConversationsByDate: () => { today: Conversation[]; yesterday: Conversation[]; lastWeek: Conversation[]; older: Conversation[] };
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  currentConversationId: null,
  conversations: [],
  isLoading: false,
  isTyping: false,

  setMessages: (messages: ChatMessage[]) => set({ messages }),

  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => {
    set({ messages: [], currentConversationId: null });
  },

  startNewChat: () => {
    set({ messages: [], currentConversationId: null });
  },

  fetchConversations: async (token: string) => {
    set({ isLoading: true });
    try {
      const data = await chatService.getConversations(token);
      const mappedConversations = data.map((conv: any) => {
        const date = safeParseDate(conv.createdAt || conv.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return {
          id: conv.id || conv._id,
          title: conv.title || "Untitled Conversation",
          date: `${year}-${month}-${day}`,
          createdAt: date.getTime(),
        };
      });
      set({ conversations: mappedConversations });
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadConversation: async (conversationId: string, token: string) => {
    set({ isLoading: true, currentConversationId: conversationId });
    try {
      const data = await chatService.getMessages(conversationId, token);
      const mappedMessages: ChatMessage[] = data.map((msg: any, index: number) => ({
        id: msg.id || index,
        role: msg.role === "assistant" ? "ai" : msg.role,
        content: msg.content || msg.message || msg.response || "",
        timestamp: msg.timestamp || safeParseDate(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      set({ messages: mappedMessages });
    } catch (error) {
      console.error("Failed to load conversation messages:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (text: string, token: string) => {
    const { currentConversationId, messages } = get();
    
    // 1. Optimistic Update: Add user message
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true
    }));

    try {
      // 2. Call API
      const messagesForApi = [...messages, userMessage].map(({ role, content }) => ({ 
        role: role === "ai" ? "assistant" : role, 
        content 
      }));
      const response = await chatService.sendMessage(messagesForApi, currentConversationId, token);
      console.log("Full AI Response:", response);
      
      // 3. Handle Response
      const aiMessage: ChatMessage = {
        id: response.id || Date.now() + 1,
        role: "ai",
        content: response.content || response.message || response.response || "",
        timestamp: response.timestamp || safeParseDate(response.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isTyping: false,
        currentConversationId: currentConversationId || response.conversationId
      }));

      // Refresh conversations list if it's a new chat to show the new title
      if (!currentConversationId) {
        get().fetchConversations(token);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 2,
        role: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      set((state) => ({
        messages: [...state.messages, errorMessage],
        isTyping: false
      }));
    }
  },

  getConversationsByDate: () => {
    const state = get();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groupedByDate = new Map<string, Conversation[]>();
    
    state.conversations.forEach((conv) => {
      let convDateOnly: Date;
      
      const parts = conv.date.split('-');
      if (parts.length === 3 && !parts.some(p => isNaN(Number(p)))) {
        const [year, month, day] = parts.map(Number);
        convDateOnly = new Date(year, month - 1, day);
      } else {
        convDateOnly = safeParseDate(conv.createdAt);
      }

      let dateKey: string;
      let displayLabel: string;

      if (convDateOnly.getTime() === today.getTime()) {
        dateKey = "today";
        displayLabel = "Today";
      } else if (convDateOnly.getTime() === yesterday.getTime()) {
        dateKey = "yesterday";
        displayLabel = "Yesterday";
      } else if (convDateOnly.getTime() > weekAgo.getTime()) {
        dateKey = "lastweek";
        displayLabel = "Last 7 Days";
      } else {
        dateKey = convDateOnly.toLocaleDateString();
        displayLabel = convDateOnly.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }
      groupedByDate.get(dateKey)!.push({
        ...conv,
        displayDate: displayLabel,
      });
    });

    return {
      today: groupedByDate.get("today") || [],
      yesterday: groupedByDate.get("yesterday") || [],
      lastWeek: groupedByDate.get("lastweek") || [],
      older: Array.from(groupedByDate.entries())
        .filter(([key]) => !["today", "yesterday", "lastweek"].includes(key))
        .map(([_, convs]) => convs)
        .flat(),
    };
  },
}));
