import apiClient from './apiClient';

export const chatService = {
  // 1. Send message and get AI response
  sendMessage: async (messages: { role: string; content: string }[], conversationId: string | null = null, token: string) => {
    try {
      const response = await apiClient.post(
        "/chat",
        { messages, conversationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // @ts-ignore - custom config property to skip global loader
          skipGlobalLoader: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in chatService.sendMessage:", error);
      throw error;
    }
  },

  // 2. Get list of past conversations (for Sidebar)
  getConversations: async (token: string) => {
    try {
      const response = await apiClient.get("/chat/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in chatService.getConversations:", error);
      throw error;
    }
  },

  // 3. Get all messages for a specific session
  getMessages: async (id: string, token: string) => {
    try {
      const response = await apiClient.get(`/chat/conversations/${id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in chatService.getMessages:", error);
      throw error;
    }
  },
};
