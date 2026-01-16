"use client";

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import MarkdownRenderer from "@/helpers/OrgLLMRES";
import { type ChatMessage } from "../../context/ChatContext";

interface MessageAreaProps {
  messages: ChatMessage[];
  isMaximized: boolean;
  onSubmit: (msg: string, isRetry?: boolean) => void;
}

// ============================================================================
// TYPING ANIMATION
// ============================================================================
const PremiumTypingAnimation = memo(() => {
  return (
    <div className="flex gap-1 ml-1">
      <span className="w-2 h-2 bg-gray-400/70 rounded-full animate-pulse"></span>
      <span className="w-2 h-2 bg-gray-400/70 rounded-full animate-pulse [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-gray-400/70 rounded-full animate-pulse [animation-delay:0.4s]"></span>
    </div>
  );
});

PremiumTypingAnimation.displayName = "PremiumTypingAnimation";

// ============================================================================
// LINK COMPONENT
// ============================================================================
const Link = ({ href, children, ...props }: any) => (
  <a href={href} {...props}>
    {children}
  </a>
);

// ============================================================================
// SEARCH STAGES
// ============================================================================
const SearchStages = memo(({ searchInfo, isMaximized }: any) => {
  return (
    <div className="relative mt-1 mb-3">
      <div className="flex flex-col gap-1 text-sm text-gray-700">
        {searchInfo.stages.includes("searching") && (
          <div className="relative">
            <div className="absolute top-[0.2rem] left-[-0.75rem] w-[10px] h-[10px] bg-teal-400 rounded-full z-10 shadow-sm" />
            {searchInfo.stages.includes("reading") && (
              <div className="absolute top-[0.22rem] left-[-8px] w-[2px] h-[calc(100%+0.5rem)] bg-gradient-to-b from-teal-300 to-teal-200" />
            )}
            <div className="ml-2 mb-2 font-medium block">
              Searching the web...
            </div>
            <div className="pl-2 mt-1">
              <div className="bg-gray-100 text-xs px-3 py-1.5 rounded-md border border-gray-200 inline-flex items-center max-w-[220px] overflow-hidden whitespace-nowrap text-ellipsis transition-colors duration-200 ease-in-out hover:bg-gray-50">
                <svg
                  className="w-3 h-3 mr-1.5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchInfo.query}
              </div>
            </div>
          </div>
        )}

        {searchInfo.stages?.includes("reading") && (
          <div className="relative">
            <div className="absolute top-[0.2rem] left-[-0.75rem] w-[10px] h-[10px] bg-teal-400 rounded-full z-10 shadow-sm" />
            <div className="ml-2 mb-2 font-medium block">Reading</div>
            {searchInfo.urls && (
              <div className="pl-2 flex flex-wrap gap-2">
                {(Array.isArray(searchInfo.urls)
                  ? searchInfo.urls
                  : [searchInfo.urls]
                ).map((url: any, i: any) => (
                  <div
                    key={i}
                    className={`bg-gray-100 text-xs px-3 py-1.5 rounded-md border border-gray-200 inline-flex items-center ${
                      isMaximized ? "max-w-[300px]" : "max-w-[220px]"
                    } overflow-hidden whitespace-nowrap text-ellipsis transition-colors duration-200 ease-in-out hover:bg-gray-50`}
                  >
                    {typeof url === "string" ? (
                      <Link href={`${url}`}>{url}</Link>
                    ) : (
                      JSON.stringify(url).substring(0, 30)
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {searchInfo.stages?.includes("writing") && (
          <div className="relative">
            <div className="absolute top-[0.2rem] left-[-0.75rem] w-[10px] h-[10px] bg-teal-400 rounded-full z-10 shadow-sm" />
            <span className="ml-2 mb-2 font-medium block">Writing answer</span>
          </div>
        )}

        {searchInfo.stages?.includes("error") && (
          <div className="relative">
            <div className="absolute top-[0.2rem] left-[-0.75rem] w-[10px] h-[10px] bg-red-400 rounded-full z-10 shadow-sm" />
            <span className="ml-2 mb-2 font-medium block">Search error</span>
            <div className="pl-4 text-xs text-red-500 mt-1">
              {searchInfo.error || "An error occurred during search."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SearchStages.displayName = "SearchStages";

// ============================================================================
// IMAGE MODAL
// ============================================================================
const ImageModal = memo(
  ({ images, currentIndex, onClose, onNavigate }: any) => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft") onNavigate("prev");
        if (e.key === "ArrowRight") onNavigate("next");
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, onNavigate]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("prev");
              }}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("next");
              }}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          </>
        )}

        <div
          className="max-w-7xl max-h-[90vh] px-16"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
          {images.length > 1 && (
            <p className="text-center text-white mt-4 text-sm">
              {currentIndex + 1} / {images.length}
            </p>
          )}
        </div>
      </motion.div>
    );
  }
);

ImageModal.displayName = "ImageModal";

// ============================================================================
// MESSAGE CONTENT RENDERER
// ============================================================================
const MessageContent = ({
  message,
  handleMessageClick,
}: {
  message: ChatMessage;
  handleMessageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => {
  return (
    <div
      className="py-4 text-sm text-gray-800 leading-relaxed overflow-x-auto"
      onClick={handleMessageClick}
    >
      {message.isLoading ? (
        <PremiumTypingAnimation />
      ) : message.content ? (
        message.isStreaming ? (
          <pre className="whitespace-pre-wrap text-sm font-sans text-gray-800 leading-relaxed">
            {message.content}
          </pre>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <MarkdownRenderer text={message.content} />
          </div>
        )
      ) : (
        <span className="text-gray-400 text-xs italic">
          Waiting for response...
        </span>
      )}
    </div>
  );
};

MessageContent.displayName = "MessageContent";

// ============================================================================
// MESSAGE BUBBLE
// ============================================================================
const MessageBubble = memo(
  ({
    message,
    isMaximized,
    onSubmit,
    handleMessageClick,
  }: {
    message: ChatMessage;
    isMaximized: boolean;
    onSubmit: (msg: string, isRetry?: boolean) => void;
    handleMessageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  }) => {
    // 🔥 FIX: Properly check for error state - ensure error object exists and isLoading is false
    const hasError = !message.isUser && !!message.error && !message.isLoading;

    // Maximized Assistant Message
    if (isMaximized && !message.isUser) {
      return (
        <div className="w-full min-w-0 mb-5">
          {/* Search Stages - only show if not in error state */}
          {message.searchInfo && !hasError && (
            <SearchStages
              searchInfo={message.searchInfo}
              isMaximized={isMaximized}
            />
          )}

          {/* Main Message Content - only show if not in error state */}
          {!hasError && (
            <MessageContent
              message={message}
              handleMessageClick={handleMessageClick}
            />
          )}

          {/* Error State - 🔥 IMPROVED LOGIC */}
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700 mb-1">
                    {message.error.code === "CONNECTION_FAILED"
                      ? "Connection Failed"
                      : message.error.code === "PARTIAL_RESPONSE"
                      ? "Connection Lost"
                      : message.error.code === "TIMEOUT"
                      ? "Request Timeout"
                      : message.error.code === "PARSE_ERROR"
                      ? "Processing Error"
                      : "Error Occurred"}
                  </p>
                  <p className="text-xs text-red-600 leading-relaxed whitespace-pre-wrap">
                    {message.content || message.error.message}
                  </p>
                  {message.retryInput && (
                    <button
                      onClick={() => onSubmit(message.retryInput!, true)}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Sources */}
          {!hasError && message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-600">
                  Sources ({message.sources.length})
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {message.sources.map((source, sourceIndex) => (
                  <div
                    key={`${source}-${sourceIndex}`}
                    className="group flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-150"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                    <Link
                      href={source}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all leading-relaxed flex-1 group-hover:text-blue-700 transition-colors duration-150"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Questions */}
          {!hasError && message.followup && message.followup.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Continue the conversation
                  </p>
                  <p className="text-xs text-gray-500">
                    {message.followup.length} suggested{" "}
                    {message.followup.length === 1 ? "question" : "questions"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {message.followup.map((follow, i) => (
                  <button
                    key={i}
                    className="group w-full text-left p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300"
                    onClick={() => onSubmit(follow)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-medium group-hover:bg-purple-200 transition-all duration-300">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed transition-colors duration-300">
                          {follow}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Minimized Mode (both user and assistant)
    return (
      <div
        className={`flex mb-5 ${
          message.isUser ? "justify-end" : "justify-start"
        }`}
      >
        <div className="flex flex-col max-w-[28rem]">
          <div
            className={`rounded-2xl px-4 py-2 text-[13px] leading-relaxed shadow-sm overflow-x-auto max-w-full ${
              message.isUser
                ? "text-white self-end"
                : hasError
                ? "bg-red-50 border border-red-200 text-gray-800 self-start"
                : "bg-gray-100 text-gray-800 self-start"
            }`}
            style={
              message.isUser
                ? {
                    background:
                      "linear-gradient(135deg, hsl(45 85% 55%), hsl(40 80% 60%))",
                  }
                : {}
            }
            onClick={handleMessageClick}
          >
            {hasError ? (
              <div className="text-red-700">
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-3.5 h-3.5 text-red-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-semibold text-xs">
                    {message.error.code === "CONNECTION_FAILED"
                      ? "Connection Failed"
                      : message.error.code === "PARTIAL_RESPONSE"
                      ? "Connection Lost"
                      : message.error.code === "TIMEOUT"
                      ? "Request Timeout"
                      : message.error.code === "PARSE_ERROR"
                      ? "Processing Error"
                      : "Error"}
                  </p>
                </div>
                <p className="text-[11px] text-red-600 leading-relaxed">
                  {message.content || message.error.message}
                </p>
                {message.retryInput && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubmit(message.retryInput!, true);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Try Again
                  </button>
                )}
              </div>
            ) : message.isLoading ? (
              <PremiumTypingAnimation />
            ) : message.content ? (
              message.isStreaming ? (
                <pre className="whitespace-pre-wrap text-[13px] font-sans">
                  {message.content}
                </pre>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert min-w-0">
                  <MarkdownRenderer text={message.content} />
                </div>
              )
            ) : (
              <span className="text-gray-400 text-xs italic">
                Waiting for response...
              </span>
            )}
          </div>

          {/* Sources (Minimized) */}
          {!message.isUser &&
            !hasError &&
            message.sources &&
            message.sources.length > 0 && (
              <div className="mt-3 ml-2 border-l-2 border-gray-200 pl-3">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Sources ({message.sources.length})
                </p>
                <div className="space-y-1 overflow-x-auto">
                  {message.sources.map((source, idx) => (
                    <Link
                      key={idx}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[11px] text-blue-600 hover:text-blue-800 truncate hover:underline"
                    >
                      {source}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          {/* Follow-up (Minimized) */}
          {!message.isUser &&
            !hasError &&
            message.followup &&
            message.followup.length > 0 && (
              <div className="mt-3 ml-2 border-l-2 border-gray-100 pl-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Continue the conversation
                </p>
                <div className="grid grid-cols-1 gap-2 overflow-x-auto">
                  {message.followup.map((follow, i) => (
                    <button
                      key={i}
                      onClick={() => onSubmit(follow)}
                      className="text-left px-3 py-2 rounded-lg text-[12px] bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
                    >
                      {follow}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.isLoading === nextProps.message.isLoading &&
      prevProps.message.isStreaming === nextProps.message.isStreaming &&
      prevProps.isMaximized === nextProps.isMaximized &&
      JSON.stringify(prevProps.message.error) ===
        JSON.stringify(nextProps.message.error) &&
      JSON.stringify(prevProps.message.sources) ===
        JSON.stringify(nextProps.message.sources) &&
      JSON.stringify(prevProps.message.followup) ===
        JSON.stringify(nextProps.message.followup)
    );
  }
);

MessageBubble.displayName = "MessageBubble";

// ============================================================================
// MAIN MESSAGE AREA
// ============================================================================
const MessageArea = ({ messages, isMaximized, onSubmit }: MessageAreaProps) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  const virtuosoRef = useRef<any>(null);

  const handleMessageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;

      if (target.tagName === "IMG") {
        e.preventDefault();
        const clickedImg = target as HTMLImageElement;
        const clickedSrc = clickedImg.src;
        const messageContainer = e.currentTarget as HTMLDivElement;
        const imgElements =
          messageContainer.querySelectorAll<HTMLImageElement>("img");
        const allImages = Array.from(imgElements).map((img) => img.src);
        const index = allImages.indexOf(clickedSrc);

        setModalState({
          isOpen: true,
          images: allImages,
          currentIndex: index >= 0 ? index : 0,
        });
      }
    },
    []
  );

  const navigateModal = useCallback((direction: string) => {
    setModalState((prev) => {
      const newIndex =
        direction === "next"
          ? (prev.currentIndex + 1) % prev.images.length
          : (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
      return { ...prev, currentIndex: newIndex };
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, images: [], currentIndex: 0 });
  }, []);

  const useVirtualization = messages.length >= 50;

  return (
    <>
      <div
        className={`flex-grow overflow-y-auto bg-[#fcfcf8] border-b border-gray-100 min-h-0 ${
          isMaximized ? "pb-28" : ""
        }`}
      >
        {useVirtualization ? (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            followOutput="smooth"
            className={`mx-auto p-6 ${isMaximized ? "max-w-4xl" : "max-w-7xl"}`}
            itemContent={(index, message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMaximized={isMaximized}
                onSubmit={onSubmit}
                handleMessageClick={handleMessageClick}
              />
            )}
          />
        ) : (
          <div
            className={`mx-auto p-6 ${isMaximized ? "max-w-4xl" : "max-w-7xl"}`}
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMaximized={isMaximized}
                onSubmit={onSubmit}
                handleMessageClick={handleMessageClick}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalState.isOpen && (
          <ImageModal
            images={modalState.images}
            currentIndex={modalState.currentIndex}
            onClose={closeModal}
            onNavigate={navigateModal}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(MessageArea);