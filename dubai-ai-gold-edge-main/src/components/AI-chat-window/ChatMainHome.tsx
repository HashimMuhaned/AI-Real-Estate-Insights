"use client";

import InputBar from "../AI-chat-window/ChatInput";
import MessageArea from "../AI-chat-window/MessageArea";
import React, { useState, useContext, useEffect } from "react";
import { TbMessageChatbot } from "react-icons/tb";
// import { CheckUserContext } from "../../context/CheckUserToken";
import { useSession } from "next-auth/react";
import { useChat } from "../../context/ChatContext";
import { Maximize2, Minimize2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ChatMainHome = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  //  State Definitions
  const { messages, setMessages } = useChat();
  // Holds the text currently being typed into the input box.
  const [currentMessage, setCurrentMessage] = useState("");

  // Used for contextual memory — stores a checkpoint ID returned by the backend.
  // Passed in the URL on future messages to help the backend understand the conversation history.
  const [checkpointId, setCheckpointId] = useState(null);
  //   const { userInfo } = useContext(CheckUserContext);
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const handleFollowupClick = (follow: string) => {
    setCurrentMessage(follow);
    handleSubmit({
      preventDefault: () => {},
    });
  };

  const handleSubmit = async (eOrMessage: any) => {
    let userInput = "";

    if (typeof eOrMessage === "string") {
      // Case: follow-up clicked
      userInput = eOrMessage;
    } else {
      // Case: form submitted
      eOrMessage.preventDefault();
      if (!currentMessage.trim()) return;
      userInput = currentMessage;
      setCurrentMessage(""); // Clear input field immediately
    }

    // Dynamically generate the next unique message ID
    const newMessageId =
      messages.length > 0 ? Math.max(...messages.map((msg) => msg.id)) + 1 : 1;

    // Add the user message
    setMessages((prev) => [
      ...prev,
      {
        id: newMessageId,
        content: userInput,
        isUser: true,
        type: "message",
      },
    ]);

    try {
      // Add empty AI message placeholder
      const aiResponseId = newMessageId + 1;
      setMessages((prev) => [
        ...prev,
        {
          id: aiResponseId,
          content: "",
          isUser: false,
          type: "message",
          isLoading: true,
          searchInfo: {
            stages: [],
            query: "",
            urls: [],
          },
        },
      ]);

      // Create URL with checkpoint ID if it exists
      let url = `http://localhost:8000/chat_stream/${encodeURIComponent(
        userInput
      )}`;
      if (userId) {
        url += `?user_id=${encodeURIComponent(userId)}`;
      }

      // Connect to SSE endpoint using EventSource
      const eventSource = new EventSource(url);
      let streamedContent = "";
      let searchData: any = null;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "checkpoint") {
            setCheckpointId(data.checkpoint_id);
          } else if (data.type === "content") {
            streamedContent += data.content;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiResponseId
                  ? { ...msg, content: streamedContent, isLoading: false }
                  : msg
              )
            );
          } else if (data.type === "search_start") {
            const newSearchInfo = {
              stages: ["searching"],
              query: data.query,
              urls: [],
            };
            searchData = newSearchInfo;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiResponseId
                  ? {
                      ...msg,
                      content: streamedContent,
                      searchInfo: newSearchInfo,
                      isLoading: false,
                    }
                  : msg
              )
            );
          } else if (data.type === "search_results") {
            try {
              const urls =
                typeof data.urls === "string"
                  ? JSON.parse(data.urls)
                  : data.urls;

              const newSearchInfo = {
                stages: searchData
                  ? [...searchData.stages, "reading"]
                  : ["reading"],
                query: searchData?.query || "",
                urls,
              };
              searchData = newSearchInfo;

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponseId
                    ? {
                        ...msg,
                        content: streamedContent,
                        searchInfo: newSearchInfo,
                        isLoading: false,
                      }
                    : msg
                )
              );
            } catch (err) {
              console.error("Error parsing search results:", err);
            }
          } else if (data.type === "search_error") {
            const newSearchInfo = {
              stages: searchData ? [...searchData.stages, "error"] : ["error"],
              query: searchData?.query || "",
              error: data.error,
              urls: [],
            };
            searchData = newSearchInfo;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiResponseId
                  ? {
                      ...msg,
                      content: streamedContent,
                      searchInfo: newSearchInfo,
                      isLoading: false,
                    }
                  : msg
              )
            );
          } else if (data.type === "followup") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiResponseId ? { ...msg, followup: data.items } : msg
              )
            );
          } else if (data.type === "end") {
            if (searchData) {
              const finalSearchInfo = {
                ...searchData,
                stages: [...searchData.stages, "writing"],
              };

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponseId
                    ? {
                        ...msg,
                        searchInfo: finalSearchInfo,
                        isLoading: false,
                      }
                    : msg
                )
              );
            }

            eventSource.close();
          }
        } catch (error) {
          console.error("Error parsing event data:", error, event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        eventSource.close();

        if (!streamedContent) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiResponseId
                ? {
                    ...msg,
                    content:
                      "Sorry, there was an error processing your request.",
                    isLoading: false,
                  }
                : msg
            )
          );
        }
      };

      eventSource.addEventListener("end", () => {
        eventSource.close();
      });
    } catch (error) {
      console.error("Error setting up EventSource:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: newMessageId + 1,
          content: "Sorry, there was an error connecting to the server.",
          isUser: false,
          type: "message",
          isLoading: false,
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.25 }}
            className={`bg-white shadow-2xl border border-gray-200 rounded-2xl overflow-hidden flex flex-col 
            ${
              isMaximized
                ? "fixed inset-4 w-auto h-auto z-50"
                : "w-[32rem] h-[41rem]"
            }`}
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
