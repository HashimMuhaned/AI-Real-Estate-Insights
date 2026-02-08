"use client";

import InputBar from "../AI-chat-window/ChatInput";
import MessageArea from "../AI-chat-window/MessageArea";
import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useChat, type ChatMessage } from "../../context/ChatContext";
import { Maximize2, Minimize2, MapPin, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SmartChatButton from "./SmartChatButton";
import CoachMark from "./CoachMark";

type ChatMainHomeProps = {
  // Optional: community context to show smart button
  communityName?: string;
  communitySlug?: string;
};

const ChatMainHome = ({ communityName, communitySlug }: ChatMainHomeProps) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showCoachMark, setShowCoachMark] = useState(false);
  const [isButtonExpanded, setIsButtonExpanded] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  
  const {
    messages,
    setMessages,
    isAnonymous,
    areaContext,
    setAreaContext,
    isChatOpen,
    openChat,
    closeChat,
    contextPrompt,
    setContextPrompt,
  } = useChat();
  
  const [currentMessage, setCurrentMessage] = useState("");
  const [checkpointId, setCheckpointId] = useState<string | null>(null);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const pendingInputRef = useRef<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const isRetryingRef = useRef<boolean>(false);
  const textRotationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Smart button expansion logic with user activity tracking
  useEffect(() => {
    if (!communityName) {
      setIsButtonExpanded(false);
      if (textRotationTimerRef.current) {
        clearInterval(textRotationTimerRef.current);
        textRotationTimerRef.current = null;
      }
      return;
    }

    let inactivityTimer: NodeJS.Timeout;

    const startExpansion = () => {
      setIsButtonExpanded(true);

      // Start text rotation timer - change text every 8 seconds (loops continuously)
      if (!textRotationTimerRef.current) {
        textRotationTimerRef.current = setInterval(() => {
          setCurrentTextIndex((prev) => (prev + 1) % 4);
        }, 8000);
      }
    };

    const stopExpansion = () => {
      setIsButtonExpanded(false);
      
      // Clear text rotation
      if (textRotationTimerRef.current) {
        clearInterval(textRotationTimerRef.current);
        textRotationTimerRef.current = null;
      }
    };

    const resetInactivityTimer = () => {
      // Clear existing timer
      clearTimeout(inactivityTimer);
      
      // Only collapse if chat is open
      if (isChatOpen) {
        stopExpansion();
        return;
      }

      // Expand after 5 seconds of inactivity
      inactivityTimer = setTimeout(() => {
        if (!isChatOpen) {
          startExpansion();
        }
      }, 5000);
    };

    // Initial setup - start inactivity timer
    resetInactivityTimer();

    // Track scroll activity (collapses button and resets timer)
    const handleScroll = () => {
      stopExpansion();
      resetInactivityTimer();
    };

    // Track chat opening (collapses button)
    if (isChatOpen) {
      stopExpansion();
    }

    // Listen only for scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(inactivityTimer);
      if (textRotationTimerRef.current) {
        clearInterval(textRotationTimerRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [communityName, isChatOpen]);

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

  const failMessage = (
    id: string | number,
    message: string,
    error?: { code: string; message: string }
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              content: message || "⚠️ An unexpected error occurred.",
              isLoading: false,
              error,
            }
          : m
      )
    );
  };

  const mergeMessageUpdate = (
    id: string | number,
    patch: Partial<ChatMessage>
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              ...patch,

              content:
                patch.content !== undefined ? patch.content : m.content ?? "",

              isLoading:
                patch.isLoading !== undefined ? patch.isLoading : !!m.isLoading,

              searchInfo:
                patch.searchInfo !== undefined
                  ? { ...(m.searchInfo || {}), ...(patch.searchInfo || {}) }
                  : m.searchInfo,

              images:
                patch.images !== undefined ? patch.images : m.images ?? [],

              followup:
                patch.followup !== undefined ? patch.followup : m.followup,
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

    if (!isRetry) {
      const newMessageId = makeId();

      setMessages((prev: ChatMessage[]) => [
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

    if (isRetry) {
      setMessages((prev: ChatMessage[]) => {
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

    setMessages((prev: ChatMessage[]) => [
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

    if (userId) {
      sseUrl.searchParams.append("user_id", String(userId));
      console.log("✅ Authenticated user - messages will be saved");
    } else {
      console.log("ℹ️ Anonymous user - messages will not be saved");
    }

    // Add area context if available
    if (areaContext) {
      sseUrl.searchParams.append("area_context", JSON.stringify(areaContext));
      console.log("📍 Area context added:", areaContext.areaName);
    }

    if (checkpointId) {
      sseUrl.searchParams.append("checkpoint_id", String(checkpointId));
    }

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
      failMessage(aiResponseId, "⚠️ Unable to connect to the server.", {
        code: "CONNECTION_FAILED",
        message: "Failed to create EventSource connection.",
      });

      pendingInputRef.current = null;
      return;
    }

    let streamedContent = "";
    let searchData: any = null;
    let sawAnyData = false;
    let backendErrorReceived = false;
    let isCleanedUp = false;

    const watchdogTimeout = setTimeout(() => {
      if (!sawAnyData && !isCleanedUp) {
        console.warn("SSE watchdog triggered — no data received within 5s");

        failMessage(
          aiResponseId,
          "⚠️ No response from server. Please try again.",
          {
            code: "TIMEOUT",
            message: "No data received from server.",
          }
        );

        if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
        cleanup();
      }
    }, 5000);

    const globalTimeout = setTimeout(() => {
      if (!isCleanedUp) {
        console.error("Global timeout reached - forcing cleanup");

        if (!backendErrorReceived) {
          failMessage(
            aiResponseId,
            streamedContent
              ? streamedContent +
                  "\n\n⚠️ Request timeout. The response took too long."
              : "⚠️ Request timeout. Please try again.",
            {
              code: "TIMEOUT",
              message: "Request exceeded maximum time limit.",
            }
          );
        }

        cleanup();
      }
    }, 120000);

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;

      clearTimeout(globalTimeout);
      clearTimeout(watchdogTimeout);

      try {
        if (eventSource) eventSource.close();
      } catch {}

      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiResponseId
            ? {
                ...m,
                isLoading: false,
              }
            : m
        )
      );

      pendingInputRef.current = null;
      isRetryingRef.current = false;
    };

    eventSource.onmessage = (ev: MessageEvent) => {
      if (!sawAnyData) {
        sawAnyData = true;
        clearTimeout(watchdogTimeout);
      }

      try {
        const parsed = JSON.parse(ev.data);
        const type = parsed.type;

        if (type === "error") {
          backendErrorReceived = true;

          const msg =
            parsed.message ||
            "Something went wrong while generating the response.";

          failMessage(
            aiResponseId,
            streamedContent ? streamedContent + "\n\n⚠️ " + msg : "⚠️ " + msg,
            {
              code: parsed.code ?? "STREAM_ERROR",
              message: msg,
            }
          );

          cleanup();
          return;
        }

        if (type === "stage") {
          mergeMessageUpdate(aiResponseId, {
            searchInfo: {
              stage: parsed.stage,
            },
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
            toolResults: {
              db: payload,
            },
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
        failMessage(aiResponseId, "⚠️ Error processing server response.", {
          code: "PARSE_ERROR",
          message: "Failed to parse server message.",
        });
        cleanup();
      }
    };

    eventSource.onerror = () => {
      console.error("EventSource transport error");

      if (isCleanedUp) {
        console.log("Already cleaned up, ignoring onerror");
        return;
      }

      if (backendErrorReceived) {
        console.log("Backend already sent error, skipping retry logic");
        cleanup();
        return;
      }

      if (isRetryingRef.current) {
        console.log("Already retrying, ignoring duplicate onerror");
        cleanup();
        return;
      }

      const noDataAtAll = !sawAnyData && !streamedContent;
      const partialData = sawAnyData && streamedContent;

      const canRetry =
        !isRetry &&
        reconnectAttemptsRef.current === 0 &&
        pendingInputRef.current &&
        noDataAtAll;

      if (canRetry) {
        isRetryingRef.current = true;
        reconnectAttemptsRef.current = 1;

        console.log("Attempting one retry...");

        mergeMessageUpdate(aiResponseId, {
          content: "⚠️ Connection lost. Retrying...",
          isLoading: true,
        });

        try {
          eventSource.close();
        } catch {}

        eventSourceRef.current = null;

        const retryInput = pendingInputRef.current;

        setTimeout(() => {
          if (retryInput) {
            handleSubmit(retryInput, true);
          }
        }, 300);

        return;
      }

      console.log(
        `Showing final error. Retry: ${isRetry}, Attempts: ${reconnectAttemptsRef.current}`
      );

      if (partialData) {
        failMessage(
          aiResponseId,
          streamedContent + "\n\n⚠️ Connection lost before completion.",
          {
            code: "PARTIAL_RESPONSE",
            message: "Connection lost mid-stream.",
          }
        );
      } else {
        failMessage(
          aiResponseId,
          reconnectAttemptsRef.current > 0
            ? "⚠️ Unable to connect after retry. Please try again."
            : "⚠️ Unable to connect to the server.",
          {
            code: "CONNECTION_FAILED",
            message: "Failed to establish SSE connection.",
          }
        );
      }

      cleanup();
    };

    eventSource.addEventListener("end", () => {
      cleanup();
    });
  };

  const handleCloseChat = () => {
    closeChat();
  };

  const handleClearContext = () => {
    setAreaContext(null);
  };

  const handleOpenChatWithContext = () => {
    openChat();
    setShowCoachMark(false);
  };

  // Generate contextual button text based on current rotation index
  const getContextText = (): string | null => {
    if (!isButtonExpanded || !communityName) return null;
    
    const textOptions = [
      `Ask about ${communityName}`,
      "What are the best projects here?",
      "Compare with other areas",
      "Is this a good investment?",
    ];
    
    return textOptions[currentTextIndex];
  };

  return (
    <>
      {/* Coach Mark */}
      {communitySlug && communityName && (
        <CoachMark
          communitySlug={communitySlug}
          communityName={communityName}
          onDismiss={() => setShowCoachMark(false)}
          onOpenChat={handleOpenChatWithContext}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
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
              {/* Header */}
              <div
                className="h-12 px-4 flex items-center justify-between text-sm font-medium"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(35 25% 88%), hsl(25 20% 92%))",
                }}
              >
                <span className="text-gray-700">
                  AI Assistant {isAnonymous && "(Guest Mode)"}
                </span>
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
                    onClick={handleCloseChat}
                    className="p-1 rounded hover:bg-gray-100 transition"
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Context Banner */}
              {areaContext && (
                <div className="bg-gradient-to-r from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)] px-4 py-3 flex items-center justify-between text-white text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        Analyzing {areaContext.areaName}
                      </span>
                      <span className="text-xs text-white/90">
                        Using community-specific data to answer your questions
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleClearContext}
                    className="p-1 hover:bg-white/20 rounded transition flex-shrink-0"
                    aria-label="Ask globally"
                    title="Ask globally"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

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

        {!isChatOpen && (
          <div data-smart-chat-button>
            <SmartChatButton
              isExpanded={isButtonExpanded}
              contextText={getContextText()}
              communityName={communityName}
              onClick={handleOpenChatWithContext}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ChatMainHome;