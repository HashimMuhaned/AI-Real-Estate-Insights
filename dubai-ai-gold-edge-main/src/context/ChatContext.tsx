"use client";

// context/ChatContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

type ChatContextType = {
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  loading: boolean;
  error: string | null;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (messages.length === 0) {
      const url = `http://localhost:8000/chat_boot?user_id=${session?.user?.id}&fname=${session?.user?.name}`;

      axios
        .get(url)
        .then((res) => {
          const filtered = res.data.messages.filter(
            (m: any) => m.role === "ai" || m.role === "user" // show only AI and real user messages
          );

          // Map to your frontend format, but exclude system and fake user messages
          const loaded = filtered.map((m: any, i: any) => ({
            id: i,
            content: m.content,
            isUser: m.role === "user",
            type: "message",
            sources: m.sources?.web?.urls,
            followup: m.followups || [], 
          }));

          setMessages(loaded);
        })
        .catch((err) => {
          console.error("Greeting boot error:", err.message);
          setError("Failed to greet or load history.");
        });
    }
  }, [session]);

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
