"use client";

import InputBar from "../AI-chat-window/ChatInput";
import MessageArea from "../AI-chat-window/MessageArea";
import React, { useState, useEffect, useRef } from "react";
import { TbMessageChatbot } from "react-icons/tb";
// import { CheckUserContext } from "../../context/CheckUserToken";
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
  images?: any[]; // image objects or urls
  followup?: string[] | string;
  [k: string]: any;
};

// const LOCAL_STORAGE_KEY = "chat_messages_v1";

const ChatMainHome = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Chat context
  const { messages, setMessages } = useChat();

  const [currentMessage, setCurrentMessage] = useState("");

  // Checkpoint ID returned by backend
  const [checkpointId, setCheckpointId] = useState<string | null>(null);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Keep a ref for the last submitted userInput (for reconnects)
  const pendingInputRef = useRef<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  // // Restore messages from localStorage on mount (if your useChat doesn't do this already)
  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  //     if (raw) {
  //       const parsed = JSON.parse(raw);
  //       if (Array.isArray(parsed) && parsed.length > 0) {
  //         setMessages(parsed);
  //       }
  //     }
  //   } catch (e) {
  //     console.warn("Failed to restore messages:", e);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // // Persist messages to localStorage whenever they change
  // useEffect(() => {
  //   try {
  //     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages || []));
  //   } catch (e) {
  //     console.warn("Failed to save messages:", e);
  //   }
  // }, [messages]);

  const handleFollowupClick = (follow: string) => {
    setCurrentMessage(follow);
    // call handleSubmit with the string version
    handleSubmit(follow);
  };

  // Helper to create a robust unique id
  const makeId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  // Safely parse possibly-stringified JSON fields
  const safeJsonParse = (maybe: any, fallback: any = []) => {
    if (maybe === null || maybe === undefined) return fallback;
    if (typeof maybe === "string") {
      try {
        return JSON.parse(maybe);
      } catch {
        // try basic JSON-ish (single quotes) — don't overdo it
        try {
          // eslint-disable-next-line no-eval
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
              // ensure we merge nested objects rather than clobber
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

  let backendErrorReceived = false;

  const handleSubmit = async (eOrMessage: any) => {
    let userInput = "";

    if (typeof eOrMessage === "string") {
      userInput = eOrMessage;
    } else {
      eOrMessage.preventDefault();
      if (!currentMessage.trim()) return;
      userInput = currentMessage;
      setCurrentMessage("");
    }

    // Use robust id to avoid collisions
    const newMessageId = makeId();

    // Append user message
    setMessages((prev: ChatMsg[]) => [
      ...prev,
      {
        id: newMessageId,
        content: userInput,
        isUser: true,
        type: "message",
      },
    ]);

    // Prepare AI placeholder
    const aiResponseId = makeId();

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

    // Keep track of pending input for reconnect attempts
    pendingInputRef.current = userInput;
    reconnectAttemptsRef.current = 0;

    // Build SSE URL with query params instead of path param
    const base = "http://localhost:8000";
    const sseUrl = new URL("/chat_stream", base);
    sseUrl.searchParams.append("query", userInput);
    if (userId) sseUrl.searchParams.append("user_id", String(userId));
    if (checkpointId)
      sseUrl.searchParams.append("checkpoint_id", String(checkpointId));

    // close any previous event source
    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch {}
      eventSourceRef.current = null;
    }

    // Create EventSource
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(sseUrl.toString());
      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error("Failed to create EventSource:", err);
      mergeMessageUpdate(aiResponseId, {
        content: "Sorry, there was an error connecting to the server.",
        isLoading: false,
      });
      return;
    }

    let streamedContent = "";
    let searchData: any = null;
    let sawAnyData = false;

    // Helper to close and cleanup
    const cleanup = () => {
      try {
        if (eventSource) eventSource.close();
      } catch {}

      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }

      mergeMessageUpdate(aiResponseId, {
        isLoading: false,
      });
    };

    eventSource.onmessage = (ev: MessageEvent) => {
      sawAnyData = true;
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

        // Checkpoint
        if (type === "checkpoint") {
          const cp = parsed.checkpoint_id ?? parsed.checkpointId ?? null;
          if (cp) setCheckpointId(cp);
          return;
        }

        // Content streaming
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

        // Search start
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
            // isLoading: false,
          });
          return;
        }

        // Search results
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
            // isLoading: false,
          });
          return;
        }

        // Search error
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
            // isLoading: false,
          });
          return;
        }

        // Followups
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

        // Images: support multiple shapes
        // - {"type":"images", "images": [...]}
        // - {"type":"image_results","payload": {"images": [...], "query": "..."}}
        if (
          type === "images" ||
          type === "image_results" ||
          type === "image_result"
        ) {
          let imgs: any[] = [];

          if (type === "images") {
            imgs = parsed.images ?? parsed.payload ?? [];
          } else {
            // image_results expected to have payload.images or payload
            const payload = parsed.payload ?? parsed;
            imgs = payload.images ?? payload.images ?? [];
          }

          // Normalize images to array of objects {url, title, source} or simple urls
          if (Array.isArray(imgs)) {
            const normalized = imgs
              .map((it: any) => {
                if (!it) return null;
                if (typeof it === "string") return { url: it };
                // an object from your backend: prefer {url,imageUrl} names
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
              // isLoading: false,
            });
          }
          return;
        }

        // Query DB results (optional)
        if (type === "query_db_results" || type === "db_results") {
          const payload = parsed.payload ?? parsed;
          // keep sample rows in searchInfo or in special field
          mergeMessageUpdate(aiResponseId, {
            dbResults: payload,
            content: streamedContent || "",
            // isLoading: false,
          });
          return;
        }

        // End (finalize)
        if (type === "end") {
          mergeMessageUpdate(aiResponseId, {
            isLoading: false,
          });
          cleanup();
          return;
        }

        // Unknown / fallback: try to merge any payload fields
        // If backend sends a raw payload with content/images in different keys.
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

    eventSource.onerror = (err) => {
      console.error("EventSource transport error:", err);

      // If backend already sent a logical error, do nothing
      if (backendErrorReceived) {
        cleanup();
        return;
      }

      // Retry only if:
      // - no SSE data was ever received
      // - no content streamed
      // - only retry once
      if (
        !sawAnyData &&
        !streamedContent &&
        reconnectAttemptsRef.current < 1 &&
        pendingInputRef.current
      ) {
        reconnectAttemptsRef.current += 1;

        try {
          eventSource.close();
        } catch {}
        eventSourceRef.current = null;

        setTimeout(() => {
          handleSubmit(pendingInputRef.current as any);
        }, 600);

        return;
      }

      // Handle case where request was too large / no content received
      if (!sawAnyData && !streamedContent) {
        mergeMessageUpdate(aiResponseId, {
          content:
            "⚠️ Your message is too long for the model or the connection failed. Try sending a shorter message.",
          isLoading: false,
          error: {
            code: "REQUEST_TOO_LARGE_OR_TRANSPORT_ERROR",
            message:
              "The input may have exceeded the model token limit or the SSE connection failed. Reduce message size and try again.",
          },
        });
      }

      // Handle mid-stream transport failure (partial content)
      if (sawAnyData && streamedContent) {
        mergeMessageUpdate(aiResponseId, {
          content:
            streamedContent +
            "\n\n⚠️ Connection lost before completion. Partial response displayed.",
          isLoading: false,
          error: {
            code: "PARTIAL_RESPONSE",
            message: "Connection lost mid-stream. Partial response shown.",
          },
        });
      }

      cleanup();
    };

    // some backends send a named 'end' event, keep that handler too
    eventSource.addEventListener("end", () => {
      try {
        eventSource.close();
      } catch {}
    });

    // cleanup on unmount (or when user issues another request)
    // Note: we do not await anything here; this is immediate cleanup
    const cleanupOnNavigation = () => {
      try {
        if (eventSource) eventSource.close();
      } catch {}
      eventSourceRef.current = null;
    };
    window.addEventListener("beforeunload", cleanupOnNavigation);

    // remove the beforeunload listener when done (we can't await end but we'll remove in finally)
    // We don't have a finally here since onmessage/onerror/`end` will drive closure.
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
            {/* Header */}
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

            {/* Messages */}
            <MessageArea
              messages={messages}
              isMaximized={isMaximized}
              onSubmit={handleSubmit}
            />

            {/* Input */}
            <InputBar
              currentMessage={currentMessage}
              setCurrentMessage={setCurrentMessage}
              onSubmit={handleSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
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
