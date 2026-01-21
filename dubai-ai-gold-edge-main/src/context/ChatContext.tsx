"use client";

// context/ChatContext.tsx
import { createContext, useContext, useState, useEffect, useRef } from "react";
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
  isAnonymous: boolean;
  isSyncing: boolean;
  syncSuccess: boolean;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const { data: session, status } = useSession();

  // Determine if user is anonymous (not authenticated)
  const isAnonymous = status === "unauthenticated";
  
  const hasSyncedRef = useRef<boolean>(false);
  const hasLoadedFromDBRef = useRef<boolean>(false);

  // 🔥 STEP 1: On mount, check if we need to sync messages after OAuth login
  useEffect(() => {
    if (hasSyncedRef.current) return; // Already synced this session
    if (status !== "authenticated" || !session?.user?.id) return; // Not logged in yet

    // Check if there are messages waiting to be synced
    const needsSync = sessionStorage.getItem("needs_sync");
    const savedMessages = sessionStorage.getItem("anonymous_chat_messages");

    console.log("🔍 Sync check on mount:", { needsSync, hasMessages: !!savedMessages, status });

    if (needsSync === "true" && savedMessages) {
      console.log("🔄 Found messages to sync after OAuth login");
      
      hasSyncedRef.current = true;
      setIsSyncing(true);

      try {
        const parsedMessages = JSON.parse(savedMessages);
        
        // Restore messages to UI first
        setMessages(parsedMessages);
        console.log(`📱 Restored ${parsedMessages.length} messages to UI`);

        // Filter messages for syncing
        const messagesToSync = parsedMessages.filter(
          (msg: ChatMessage) => msg.type === "message" && !msg.isLoading
        );

        if (messagesToSync.length === 0) {
          console.log("ℹ️ No messages to sync");
          sessionStorage.removeItem("anonymous_chat_messages");
          sessionStorage.removeItem("needs_sync");
          setIsSyncing(false);
          return;
        }

        // Transform to backend format
        const formattedMessages = messagesToSync.map((msg: ChatMessage) => ({
          role: msg.isUser ? "user" : "ai",
          content: msg.content,
          user_id: msg.isUser ? session.user.id : null,
          sources: msg.sources
            ? {
                web: {
                  engine: "tavily",
                  urls: msg.sources,
                },
              }
            : undefined,
          followups: msg.followup,
          images: msg.images,
        }));

        console.log(`📤 Syncing ${formattedMessages.length} messages to database...`);

        // Sync to backend
        axios
          .post("http://localhost:8000/sync_anonymous_messages", {
            user_id: session.user.id,
            messages: formattedMessages,
          })
          .then((res) => {
            console.log("✅ Successfully synced anonymous messages to database");
            console.log("Backend response:", res.data);

            // Clear sessionStorage after successful sync
            sessionStorage.removeItem("anonymous_chat_messages");
            sessionStorage.removeItem("needs_sync");
            console.log("🗑️ Cleared sessionStorage after successful sync");

            // 🔥 NEW: Fetch messages from database to get proper IDs
            console.log("📥 Fetching messages from database...");
            
            const params = new URLSearchParams();
            params.append("user_id", session.user.id);
            if (session.user.name) {
              params.append("fname", session.user.name);
            }
            
            const url = `http://localhost:8000/chat_boot?${params.toString()}`;
            
            return axios.get(url);
          })
          .then((bootRes) => {
            if (bootRes) {
              console.log("Chat history fetched from DB:", bootRes.data);

              // Filter to show only AI and user messages
              const filtered = bootRes.data.messages.filter(
                (m: any) => m.role === "ai" || m.role === "user"
              );

              // Map to frontend format
              const loaded: ChatMessage[] = filtered.map((m: any, i: number) => ({
                id: m.id || `history-${i}`,
                content: m.content,
                isUser: m.role === "user",
                type: "message",
                isLoading: false,
                retryInput: m.role === "user" ? m.content : "",
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
                error: m.error
                  ? {
                      code: m.error.code || "UNKNOWN_ERROR",
                      message: m.error.message || "An error occurred",
                    }
                  : undefined,
              }));

              // Update messages with DB versions (with proper IDs)
              setMessages(loaded);
              console.log(`✅ Replaced with ${loaded.length} messages from database`);

              // Show success banner
              setSyncSuccess(true);
              setTimeout(() => {
                setSyncSuccess(false);
              }, 5000);
            }
          })
          .catch((err) => {
            console.error("❌ Failed to sync or fetch messages:", err);
            console.error("Error details:", err.response?.data);
            // Keep messages in sessionStorage for retry
          })
          .finally(() => {
            setIsSyncing(false);
          });
      } catch (err) {
        console.error("Error parsing saved messages:", err);
        setIsSyncing(false);
      }
    }
  }, [status, session]);

  // 🔥 STEP 2: Load chat history (only if we didn't restore from sessionStorage)
  useEffect(() => {
    // Skip if already loaded, still loading, or if we have messages from sessionStorage
    if (hasLoadedFromDBRef.current || status === "loading" || messages.length > 0) {
      return;
    }

    setLoading(true);
    hasLoadedFromDBRef.current = true;

    // Build URL - make user_id and fname optional
    const params = new URLSearchParams();
    
    // Only add user_id and fname if authenticated
    if (status === "authenticated" && session?.user?.id) {
      params.append("user_id", session.user.id);
      if (session.user.name) {
        params.append("fname", session.user.name);
      }
      
      // 🔥 NEW: Check if we're about to sync anonymous messages
      // If so, skip the greeting to avoid duplicate greetings
      const needsSync = sessionStorage.getItem("needs_sync");
      if (needsSync === "true") {
        params.append("skip_greeting", "true");
        console.log("⏭️ Skipping greeting - will sync anonymous messages");
      }
    }

    const url = `http://localhost:8000/chat_boot${params.toString() ? `?${params.toString()}` : ""}`;

    console.log(`📥 Loading chat (${isAnonymous ? "anonymous" : "authenticated"}):`, url);

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
          retryInput: m.role === "user" ? m.content : "",
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
          error: m.error
            ? {
                code: m.error.code || "UNKNOWN_ERROR",
                message: m.error.message || "An error occurred",
              }
            : undefined,
        }));

        // Only set messages if we got some (skip empty greeting)
        if (loaded.length > 0) {
          setMessages(loaded);
          console.log(`✅ Loaded ${loaded.length} messages (${isAnonymous ? "anonymous" : "authenticated"})`);
        } else {
          console.log(`ℹ️ No messages to load (greeting skipped or empty history)`);
        }
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err.message);
        if (!isAnonymous) {
          setError("Failed to load chat history.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session, status, isAnonymous, messages.length]);

  // 🔥 STEP 3: Auto-save anonymous messages to sessionStorage
  useEffect(() => {
    if (isAnonymous && messages.length > 0) {
      try {
        // Only save actual conversation messages, not loading states
        const messagesToSave = messages.filter(
          (msg) => msg.type === "message" && !msg.isLoading
        );
        
        if (messagesToSave.length > 0) {
          sessionStorage.setItem(
            "anonymous_chat_messages",
            JSON.stringify(messagesToSave)
          );
          // Mark that these messages need syncing when user logs in
          sessionStorage.setItem("needs_sync", "true");
          console.log(`💾 Saved ${messagesToSave.length} messages to sessionStorage (needs_sync=true)`);
        }
      } catch (err) {
        console.error("Error saving messages to sessionStorage:", err);
      }
    }
  }, [messages, isAnonymous]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        loading,
        error,
        isAnonymous,
        isSyncing,
        syncSuccess,
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