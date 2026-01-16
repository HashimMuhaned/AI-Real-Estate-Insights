"use client";

import InputBar from "../AI-chat-window/ChatInput";
import MessageArea from "../AI-chat-window/MessageArea";
import React, { useState, useRef } from "react";
import { TbMessageChatbot } from "react-icons/tb";
import { useSession } from "next-auth/react";
import { useChat } from "../../context/ChatContext";
import { Maximize2, Minimize2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ChatMsg = {
  id: number | string;
  content?: string;
  isUser?: boolean;
  type?: string;
  isLoading?: boolean;
  retryInput: string;
  searchInfo?: {
    stages: string[];
    query: string;
    urls: string[];
    error?: string;
  };
  images?: any[];
  followup?: string[] | string;
  error?: {
    code: string;
    message: string;
  };
  [k: string]: any;
};

const ChatMainHome = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { messages, setMessages } = useChat();
  const [currentMessage, setCurrentMessage] = useState("");
  const [checkpointId, setCheckpointId] = useState<string | null>(null);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const pendingInputRef = useRef<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const isRetryingRef = useRef<boolean>(false); // 🔥 NEW: Prevent duplicate retries

  const makeId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  const safeJsonParse = (maybe: any, fallback: any = []) => {
    if (maybe === null || maybe === undefined) return fallback;
    if (typeof maybe === "string") {
      try {
        return JSON.parse(maybe);
      } catch {
        try {
          return eval(maybe);
        } catch {
          return fallback;
        }
      }
    }
    return maybe;
  };

  const mergeMessageUpdate = (id: string | number, patch: Partial<ChatMsg>) => {
    setMessages((prev: ChatMsg[]) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              content:
                patch.content !== undefined ? patch.content : m.content || "",
              isLoading:
                patch.isLoading !== undefined ? patch.isLoading : !!m.isLoading,
              searchInfo:
                patch.searchInfo !== undefined
                  ? { ...(m.searchInfo || {}), ...(patch.searchInfo || {}) }
                  : m.searchInfo,
              images:
                patch.images !== undefined
                  ? patch.images
                  : m.images !== undefined
                  ? m.images
                  : [],
              followup:
                patch.followup !== undefined ? patch.followup : m.followup,
              ...patch,
            }
          : m
      )
    );
  };

  const handleSubmit = async (eOrMessage: any, isRetry: boolean = false) => {
    let userInput = "";

    if (typeof eOrMessage === "string") {
      userInput = eOrMessage;
    } else {
      eOrMessage.preventDefault();
      if (!currentMessage.trim()) return;
      userInput = currentMessage;
      setCurrentMessage("");
    }

    // 🔥 NEW: Only create user message if this is NOT a retry
    if (!isRetry) {
      const newMessageId = makeId();

      setMessages((prev: ChatMsg[]) => [
        ...prev,
        {
          id: newMessageId,
          content: userInput,
          isUser: true,
          type: "message",
          retryInput: "",
        },
      ]);
    }

    const aiResponseId = makeId();

    // 🔥 NEW: If retry, remove the old AI message first
    if (isRetry) {
      setMessages((prev: ChatMsg[]) => {
        // Remove the last AI message (the failed one)
        const filtered = [...prev];
        for (let i = filtered.length - 1; i >= 0; i--) {
          if (!filtered[i].isUser) {
            filtered.splice(i, 1);
            break;
          }
        }
        return filtered;
      });
    }

    setMessages((prev: ChatMsg[]) => [
      ...prev,
      {
        id: aiResponseId,
        content: "",
        isUser: false,
        type: "message",
        isLoading: true,
        retryInput: userInput,
        searchInfo: {
          stages: [],
          query: "",
          urls: [],
        },
        images: [],
      },
    ]);

    pendingInputRef.current = userInput;
    if (!isRetry) {
      reconnectAttemptsRef.current = 0;
      isRetryingRef.current = false;
    }

    const base = "http://localhost:8000";
    const sseUrl = new URL("/chat_stream", base);
    sseUrl.searchParams.append("query", userInput);
    if (userId) sseUrl.searchParams.append("user_id", String(userId));
    if (checkpointId)
      sseUrl.searchParams.append("checkpoint_id", String(checkpointId));

    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch {}
      eventSourceRef.current = null;
    }

    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(sseUrl.toString());
      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error("Failed to create EventSource:", err);
      mergeMessageUpdate(aiResponseId, {
        content: "Sorry, there was an error connecting to the server.",
        isLoading: false,
        error: {
          code: "CONNECTION_FAILED",
          message: "Failed to create EventSource connection.",
        },
      });
      pendingInputRef.current = null;
      return;
    }

    const watchdogTimeout = setTimeout(() => {
      if (!sawAnyData && !isCleanedUp) {
        console.warn("SSE watchdog triggered — no data received");
        eventSource.onerror?.(new Event("watchdog-timeout"));
      }
    }, 2000); // ⏱️ 2 seconds

    let streamedContent = "";
    let searchData: any = null;
    let sawAnyData = false;
    let backendErrorReceived = false;
    let isCleanedUp = false;

    // 🔥 NEW: Add a global timeout to prevent infinite hanging
    const globalTimeout = setTimeout(() => {
      if (!isCleanedUp) {
        console.error("Global timeout reached - forcing cleanup");

        if (!backendErrorReceived) {
          const errorMsg = streamedContent
            ? streamedContent +
              "\n\n⚠️ Request timeout. The response took too long to complete."
            : "⚠️ Request timeout. The server is taking too long to respond. Please try again.";

          mergeMessageUpdate(aiResponseId, {
            content: errorMsg,
            isLoading: false,
            error: {
              code: "TIMEOUT",
              message: "Request exceeded maximum time limit.",
            },
          });
        }

        cleanup();
      }
    }, 120000); // 2 minute global timeout

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;

      clearTimeout(globalTimeout); // 🔥 Clear the global timeout

      clearTimeout(watchdogTimeout); // 🔥 CLEAR WATCHDOG

      try {
        if (eventSource) eventSource.close();
      } catch {}

      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }

      mergeMessageUpdate(aiResponseId, {
        isLoading: false,
      });

      pendingInputRef.current = null;
      isRetryingRef.current = false;
    };

    eventSource.onmessage = (ev: MessageEvent) => {
      sawAnyData = true;
      if (!sawAnyData) {
        sawAnyData = true;
        clearTimeout(watchdogTimeout); // 🔥 CLEAR WATCHDOG
      }
      try {
        const parsed = JSON.parse(ev.data);
        const type = parsed.type;

        if (type === "error") {
          backendErrorReceived = true;
          const message =
            parsed.message ||
            "Something went wrong while generating the response.";

          mergeMessageUpdate(aiResponseId, {
            content: streamedContent
              ? streamedContent + "\n\n⚠️ " + message
              : "⚠️ " + message,
            isLoading: false,
            error: {
              code: parsed.code ?? "STREAM_ERROR",
              message,
            },
          });

          cleanup();
          return;
        }

        if (type === "stage") {
          mergeMessageUpdate(aiResponseId, {
            stage: parsed.stage,
            isLoading: parsed.stage !== "writing",
          });
          return;
        }

        if (type === "checkpoint") {
          const cp = parsed.checkpoint_id ?? parsed.checkpointId ?? null;
          if (cp) setCheckpointId(cp);
          return;
        }

        if (type === "content") {
          const incoming = parsed.content ?? "";
          if (incoming) {
            streamedContent += incoming;
            mergeMessageUpdate(aiResponseId, {
              content: streamedContent,
              isLoading: false,
            });
          }
          return;
        }

        if (type === "search_start") {
          const newSearchInfo = {
            stages: ["searching"],
            query: parsed.query ?? "",
            urls: [],
          };
          searchData = newSearchInfo;
          mergeMessageUpdate(aiResponseId, {
            searchInfo: newSearchInfo,
            content: streamedContent || "",
          });
          return;
        }

        if (type === "search_results") {
          const rawUrls = parsed.urls ?? parsed.payload ?? [];
          const urls = safeJsonParse(
            rawUrls,
            rawUrls instanceof Array ? rawUrls : []
          );
          const newSearchInfo = {
            stages: searchData
              ? [...(searchData.stages || []), "reading"]
              : ["reading"],
            query: searchData?.query || parsed.query || "",
            urls: Array.isArray(urls) ? urls : [],
          };
          searchData = newSearchInfo;
          mergeMessageUpdate(aiResponseId, {
            searchInfo: newSearchInfo,
            content: streamedContent || "",
          });
          return;
        }

        if (type === "search_error") {
          const newSearchInfo = {
            stages: searchData
              ? [...(searchData.stages || []), "error"]
              : ["error"],
            query: searchData?.query || parsed.query || "",
            error: parsed.error || parsed.message || "Search error",
            urls: [],
          };
          searchData = newSearchInfo;
          mergeMessageUpdate(aiResponseId, {
            searchInfo: newSearchInfo,
            content: streamedContent || "",
          });
          return;
        }

        if (type === "followup") {
          const items = parsed.items ?? parsed.followups ?? [];
          const safeItems = Array.isArray(items)
            ? items
            : safeJsonParse(items, []);
          mergeMessageUpdate(aiResponseId, {
            followup: safeItems,
          });
          return;
        }

        if (
          type === "images" ||
          type === "image_results" ||
          type === "image_result"
        ) {
          let imgs: any[] = [];

          if (type === "images") {
            imgs = parsed.images ?? parsed.payload ?? [];
          } else {
            const payload = parsed.payload ?? parsed;
            imgs = payload.images ?? payload.images ?? [];
          }

          if (Array.isArray(imgs)) {
            const normalized = imgs
              .map((it: any) => {
                if (!it) return null;
                if (typeof it === "string") return { url: it };
                return {
                  url: it.url ?? it.imageUrl ?? it.src ?? it.link ?? null,
                  title: it.title ?? it.name ?? null,
                  source: it.source ?? it.domain ?? null,
                  raw: it,
                };
              })
              .filter(Boolean);
            mergeMessageUpdate(aiResponseId, {
              images: normalized,
            });
          }
          return;
        }

        if (type === "query_db_results" || type === "db_results") {
          const payload = parsed.payload ?? parsed;
          mergeMessageUpdate(aiResponseId, {
            dbResults: payload,
            content: streamedContent || "",
          });
          return;
        }

        if (type === "end") {
          mergeMessageUpdate(aiResponseId, {
            isLoading: false,
          });
          cleanup();
          return;
        }

        if (parsed.content || parsed.images || parsed.payload) {
          const fallbackImages = parsed.images ?? parsed.payload?.images ?? [];
          const fallbackContent =
            parsed.content ?? parsed.payload?.content ?? "";
          if (fallbackImages && fallbackImages.length) {
            mergeMessageUpdate(aiResponseId, {
              images: Array.isArray(fallbackImages)
                ? fallbackImages
                : [fallbackImages],
              isLoading: false,
            });
          }
          if (fallbackContent) {
            streamedContent += fallbackContent;
            mergeMessageUpdate(aiResponseId, {
              content: streamedContent,
              isLoading: false,
            });
          }
        }
      } catch (err) {
        console.error("Error parsing SSE message:", err, ev.data);
      }
    };

    eventSource.onerror = () => {
      console.error("EventSource transport error");

      // ─────────────────────────────────────────────
      // 1. HARD STOPS (nothing else should run)
      // ─────────────────────────────────────────────
      if (isCleanedUp) return;

      if (backendErrorReceived) {
        cleanup();
        return;
      }

      if (isRetryingRef.current) {
        // 🔥 Prevent recursive retry submission (developer note)
        cleanup();
        return;
      }

      // ─────────────────────────────────────────────
      // 2. FAIL FAST UI UPDATE (immediate feedback)
      // ─────────────────────────────────────────────
      const noDataAtAll = !sawAnyData && !streamedContent;
      const partialData = sawAnyData && streamedContent;

      // Show provisional error immediately
      if (noDataAtAll) {
        mergeMessageUpdate(aiResponseId, {
          content: "⚠️ Connection lost. Attempting one retry...",
          isLoading: false,
        });
      }

      // ─────────────────────────────────────────────
      // 3. ONE-TIME RETRY LOGIC
      // ─────────────────────────────────────────────
      const canRetry =
        !isRetry &&
        reconnectAttemptsRef.current === 0 &&
        pendingInputRef.current;

      if (canRetry) {
        isRetryingRef.current = true;
        reconnectAttemptsRef.current = 1;

        try {
          eventSource.close();
        } catch {}

        eventSourceRef.current = null;

        const retryInput = pendingInputRef.current;

        // Retry quickly (UX improvement)
        setTimeout(() => {
          if (!retryInput) return;

          handleSubmit(retryInput, true);
        }, 300);

        return;
      }

      // ─────────────────────────────────────────────
      // 4. FINAL ERROR STATE (NO MORE RETRIES)
      // ─────────────────────────────────────────────
      if (partialData) {
        mergeMessageUpdate(aiResponseId, {
          content:
            streamedContent +
            "\n\n⚠️ Connection lost before completion. Partial response shown.",
          isLoading: false,
          error: {
            code: "PARTIAL_RESPONSE",
            message: "Connection lost mid-stream.",
          },
        });
      } else {
        mergeMessageUpdate(aiResponseId, {
          content:
            "⚠️ Unable to connect to the server. Please try again in a moment.",
          isLoading: false,
          error: {
            code: "CONNECTION_FAILED",
            message: "Failed to establish SSE connection.",
          },
        });
      }

      cleanup();
    };

    eventSource.addEventListener("end", () => {
      try {
        if (eventSource) eventSource.close();
      } catch {}
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              width: isMaximized ? "97vw" : "32rem",
              height: isMaximized ? "95vh" : "41.2rem",
              right: 12,
            }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={`bg-white shadow-2xl border border-gray-200 rounded-2xl overflow-hidden flex flex-col fixed bottom-6 z-50`}
            style={{
              originX: isMaximized ? 1 : 0,
              originY: 1,
            }}
          >
            <div
              className="h-12 px-4 flex items-center justify-between text-sm font-medium"
              style={{
                background:
                  "linear-gradient(135deg, hsl(35 25% 88%), hsl(25 20% 92%))",
              }}
            >
              <span className="text-gray-700">AI Assistant</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMaximized((prev) => !prev)}
                  className="p-1 rounded hover:bg-gray-100 transition"
                >
                  {isMaximized ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 transition"
                >
                  &times;
                </button>
              </div>
            </div>

            <MessageArea
              messages={messages}
              isMaximized={isMaximized}
              onSubmit={(msg, isRetry) => handleSubmit(msg, isRetry || false)}
            />

            <InputBar
              currentMessage={currentMessage}
              setCurrentMessage={setCurrentMessage}
              onSubmit={handleSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
          style={{
            background:
              "linear-gradient(135deg, hsl(45 85% 55%), hsl(40 80% 60%))",
          }}
        >
          <TbMessageChatbot className="text-2xl" />
        </motion.button>
      )}
    </div>
  );
};

export default ChatMainHome;
