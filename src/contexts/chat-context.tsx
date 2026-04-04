"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useConversation } from "@/hooks/use-conversation";
import { useChat } from "@/hooks/use-chat";
import { useConversationStore } from "@/store/conversation-store";
import { StreamEventPayload } from "@/lib/stream/stream";

type SendMessagePayload = StreamEventPayload | {
  query: string;
  conversationId?: string;
  filters?: Record<string, unknown>;
  pipeline?: "research" | "agent";
  clientMessageId?: string;
};

interface ChatContextValue {
  // Conversation state
  currentConversationId: string | null;
  isLoadingMessages: boolean;
  
  // Conversation actions
  loadConversation: (conversationId: string) => Promise<void>;
  resetConversation: () => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  
  // Message actions
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const {
    currentConversationId,
    isLoadingMessages,
    loadConversation,
    resetConversation,
    deleteConversation,
  } = useConversation();

  const { sendMessage, clearMessages } = useChat({
    onConversationCreated: (conversationId: string) => {
      useConversationStore.getState().setCurrentConversationId(conversationId);
      useConversationStore.getState().incrementRefreshTrigger();
    },
  });

  const value: ChatContextValue = {
    currentConversationId,
    isLoadingMessages,
    loadConversation: async (id: string) => {
      await loadConversation(id);
    },
    resetConversation,
    deleteConversation: async (id: string) => {
      await deleteConversation(id);
    },
    sendMessage,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
