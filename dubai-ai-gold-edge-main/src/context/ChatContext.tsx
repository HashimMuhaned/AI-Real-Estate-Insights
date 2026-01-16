"use client";

// context/ChatContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export type ChatMessage = {
  id: number | string;
  content?: string;
  isUser?: boolean;
  type?: string;
  isLoading?: boolean;

  isStreaming?: boolean;
  retryInput?: string;

  searchInfo?: {
    stage?: string;
    stages?: string[];
    query?: string;
    urls?: string[];
    error?: string;
  };

  toolResults?: {
    db?: any; // 👈 DB query results
    web?: any; // future
    charts?: any;
  };

  sources?: string[];
  followup?: string[];
  images?: any[];

  error?: {
    code: string;
    message: string;
  };
};

type ChatContextType = {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  loading: boolean;
  error: string | null;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only load messages once when session is ready and messages are empty
    if (
      status === "authenticated" &&
      messages.length === 0 &&
      session?.user?.id
    ) {
      setLoading(true);
      const url = `http://localhost:8000/chat_boot?user_id=${session.user.id}&fname=${session.user.name}`;

      axios
        .get(url)
        .then((res) => {
          console.log("Chat history loaded:", res.data);

          // Filter to show only AI and user messages (exclude system messages)
          const filtered = res.data.messages.filter(
            (m: any) => m.role === "ai" || m.role === "user"
          );

          // Map to frontend format with all necessary fields
          const loaded: ChatMessage[] = filtered.map((m: any, i: number) => ({
            id: m.id || `history-${i}`,
            content: m.content,
            isUser: m.role === "user",
            type: "message",
            isLoading: false,
            retryInput: m.role === "user" ? m.content : "", // Store user input for potential retry
            sources: m.sources?.web?.urls || [],
            followup: m.followups || [],
            images: m.images || [],
            searchInfo: m.sources?.web
              ? {
                  stages: ["reading"],
                  query: "",
                  urls: m.sources.web.urls || [],
                }
              : undefined,
            // Preserve error information if it exists
            error: m.error
              ? {
                  code: m.error.code || "UNKNOWN_ERROR",
                  message: m.error.message || "An error occurred",
                }
              : undefined,
          }));

          setMessages(loaded);
          console.log("Loaded messages:", loaded);
        })
        .catch((err) => {
          console.error("Failed to load chat history:", err.message);
          setError("Failed to load chat history.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session, status, messages.length]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        loading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
