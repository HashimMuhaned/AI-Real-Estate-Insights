"use client";

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, LogIn, AlertCircle } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import MarkdownRenderer from "@/helpers/OrgLLMRES";
import { type ChatMessage, useChat } from "../../context/ChatContext";
import { useSession, signIn } from "next-auth/react";

// ============================================================================
// RESPONSIVE HOOK
// ============================================================================
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    const resizeObserver = new ResizeObserver(checkMobile);
    resizeObserver.observe(document.documentElement);
    return () => resizeObserver.disconnect();
  }, []);

  return isMobile;
};

interface MessageAreaProps {
  messages: ChatMessage[];
  isMaximized: boolean;
  onSubmit: (msg: string, isRetry?: boolean) => void;
}

// ============================================================================
// ANONYMOUS USER WARNING BANNER
// ============================================================================
const AnonymousWarningBanner = memo(
  ({
    isSyncing,
    syncSuccess,
  }: {
    isSyncing: boolean;
    syncSuccess: boolean;
  }) => {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) return null;

    if (syncSuccess) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="sticky top-0 z-10 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 shadow-sm"
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  Chat History Saved!
                </p>
                <p className="text-xs text-green-700">
                  Your previous conversation has been saved to your account.
                </p>
              </div>
              <button
                onClick={() => setIsDismissed(true)}
                className="flex-shrink-0 p-1 rounded hover:bg-green-100 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    if (isSyncing) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 shadow-sm"
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Saving Your Chat History...
                </p>
                <p className="text-xs text-blue-700">
                  We're saving your conversation to your account.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="sticky top-0 z-10 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 shadow-sm"
      >
        <div className="px-3 py-2.5 md:px-4 md:py-3">
          <div className="flex items-start gap-2.5 md:gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-amber-900 mb-0.5 md:mb-1">
                Guest Mode – Chat Not Saved
              </p>
              <p className="text-[11px] md:text-xs text-amber-700 leading-relaxed mb-1.5 md:mb-2">
                Your conversation will be lost when you close this window. Sign
                in to save your history.
              </p>
              <button
                onClick={() => signIn("google")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] md:text-xs font-medium hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-sm touch-manipulation"
              >
                <LogIn className="w-3 h-3 md:w-3.5 md:h-3.5" />
                Sign In with Google
              </button>
            </div>
            <button
              onClick={() => setIsDismissed(true)}
              className="flex-shrink-0 p-1 rounded hover:bg-amber-100 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  },
);

AnonymousWarningBanner.displayName = "AnonymousWarningBanner";

// ============================================================================
// TYPING ANIMATION
// ============================================================================
const PremiumTypingAnimation = memo(() => (
  <div className="flex gap-1 ml-1">
    <span className="w-2 h-2 bg-gray-400/70 rounded-full animate-pulse" />
    <span className="w-2 h-2 bg-gray-400/70 rounded-full animate-pulse [animation-delay:0.2s]" />
    <span className="w-2 h-2 bg-gray-400/70 rounded-full animate-pulse [animation-delay:0.4s]" />
  </div>
));

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
const SearchStages = memo(({ searchInfo, isMaximized }: any) => (
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
            <div className="bg-gray-100 text-xs px-3 py-1.5 rounded-md border border-gray-200 inline-flex items-center max-w-[200px] md:max-w-[220px] overflow-hidden whitespace-nowrap text-ellipsis transition-colors duration-200 hover:bg-gray-50">
              <svg
                className="w-3 h-3 mr-1.5 text-gray-500 flex-shrink-0"
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
              <span className="truncate">{searchInfo.query}</span>
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
                    isMaximized
                      ? "max-w-[280px] md:max-w-[300px]"
                      : "max-w-[180px] md:max-w-[220px]"
                  } overflow-hidden whitespace-nowrap text-ellipsis transition-colors hover:bg-gray-50`}
                >
                  {typeof url === "string" ? (
                    <Link href={url}>{url}</Link>
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
));

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
          className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors touch-manipulation"
        >
          <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("prev");
              }}
              className="absolute left-2 md:left-4 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors touch-manipulation"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("next");
              }}
              className="absolute right-2 md:right-4 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors touch-manipulation"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </button>
          </>
        )}

        <div
          className="w-full max-w-7xl max-h-[90vh] px-10 md:px-16"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] w-full object-contain rounded-lg"
          />
          {images.length > 1 && (
            <p className="text-center text-white mt-3 text-sm">
              {currentIndex + 1} / {images.length}
            </p>
          )}
        </div>
      </motion.div>
    );
  },
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
}) => (
  <div
    className="py-3 md:py-4 text-sm text-gray-800 leading-relaxed overflow-x-auto"
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

MessageContent.displayName = "MessageContent";

// ============================================================================
// RETRY BUTTON (shared)
// ============================================================================
const RetryButton = ({
  retryInput,
  onSubmit,
  small = false,
}: {
  retryInput?: string;
  onSubmit: (msg: string, isRetry?: boolean) => void;
  small?: boolean;
}) => {
  if (!retryInput) return null;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSubmit(retryInput, true);
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm touch-manipulation ${
        small ? "mt-2 px-2.5 py-1.5 text-[10px]" : "mt-3 px-4 py-2 text-xs"
      }`}
    >
      <svg
        className={small ? "w-2.5 h-2.5" : "w-3.5 h-3.5"}
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
  );
};

// ============================================================================
// ERROR LABEL MAP
// ============================================================================
const errorLabel = (code?: string) => {
  switch (code) {
    case "CONNECTION_FAILED":
      return "Connection Failed";
    case "PARTIAL_RESPONSE":
      return "Connection Lost";
    case "TIMEOUT":
      return "Request Timeout";
    case "PARSE_ERROR":
      return "Processing Error";
    default:
      return "Error Occurred";
  }
};

// ============================================================================
// MESSAGE BUBBLE
// ============================================================================
const MessageBubble = memo(
  ({
    message,
    isMaximized,
    isMobile,
    onSubmit,
    handleMessageClick,
  }: {
    message: ChatMessage;
    isMaximized: boolean;
    isMobile: boolean;
    onSubmit: (msg: string, isRetry?: boolean) => void;
    handleMessageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  }) => {
    const hasError = !message.isUser && !!message.error && !message.isLoading;

    // On mobile, always use the "maximized" (full-width) layout for assistant messages
    const useFullWidth = isMaximized || isMobile;

    // ── FULL-WIDTH ASSISTANT MESSAGE (maximized desktop OR any mobile) ────────
    if (useFullWidth && !message.isUser) {
      return (
        <div className="w-full min-w-0 mb-4 md:mb-5">
          {message.searchInfo && !hasError && (
            <SearchStages
              searchInfo={message.searchInfo}
              isMaximized={isMaximized}
            />
          )}

          {!hasError && (
            <MessageContent
              message={message}
              handleMessageClick={handleMessageClick}
            />
          )}

          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 md:mt-4 p-3 md:p-4 rounded-xl border border-red-200 bg-red-50"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 text-red-500"
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
                    {errorLabel(message.error?.code)}
                  </p>
                  <p className="text-xs text-red-600 leading-relaxed whitespace-pre-wrap">
                    {message.content || message.error?.message}
                  </p>
                  <RetryButton
                    retryInput={message.retryInput}
                    onSubmit={onSubmit}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Sources */}
          {!hasError && message.sources && message.sources.length > 0 && (
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
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
                    className="group flex items-start gap-3 p-2.5 md:p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 transition-all duration-150"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2" />
                    <Link
                      href={source}
                      className="text-xs md:text-sm text-blue-600 hover:text-blue-800 hover:underline break-all leading-relaxed flex-1 transition-colors duration-150"
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
            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
                  <svg
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600"
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
                  <p className="text-xs md:text-sm font-semibold text-gray-800">
                    Continue the conversation
                  </p>
                  <p className="text-[11px] md:text-xs text-gray-500">
                    {message.followup.length} suggested{" "}
                    {message.followup.length === 1 ? "question" : "questions"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                {message.followup.map((follow, i) => (
                  <button
                    key={i}
                    className="group w-full text-left p-3 md:p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 active:bg-purple-50 transition-all duration-300 touch-manipulation"
                    onClick={() => onSubmit(follow)}
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-100 text-purple-700 text-[10px] md:text-xs font-medium group-hover:bg-purple-200 transition-all duration-300">
                        {i + 1}
                      </div>
                      <p className="text-xs md:text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed transition-colors duration-300">
                        {follow}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── BUBBLE MODE (minimized desktop only) ─────────────────────────────────
    return (
      <div
        className={`flex mb-4 md:mb-5 ${message.isUser ? "justify-end" : "justify-start"}`}
      >
        <div className="flex flex-col max-w-[85vw] md:max-w-[28rem]">
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
                    {errorLabel(message.error?.code)}
                  </p>
                </div>
                <p className="text-[11px] text-red-600 leading-relaxed">
                  {message.content || message.error?.message}
                </p>
                <RetryButton
                  retryInput={message.retryInput}
                  onSubmit={onSubmit}
                  small
                />
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

          {/* Sources (minimized) */}
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

          {/* Follow-up (minimized) */}
          {!message.isUser &&
            !hasError &&
            message.followup &&
            message.followup.length > 0 && (
              <div className="mt-3 ml-2 border-l-2 border-gray-100 pl-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Continue the conversation
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {message.followup.map((follow, i) => (
                    <button
                      key={i}
                      onClick={() => onSubmit(follow)}
                      className="text-left px-3 py-2 rounded-lg text-[12px] bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md active:bg-purple-50 transition-all duration-200 touch-manipulation"
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
  (prevProps, nextProps) =>
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isLoading === nextProps.message.isLoading &&
    prevProps.message.isStreaming === nextProps.message.isStreaming &&
    prevProps.isMaximized === nextProps.isMaximized &&
    prevProps.isMobile === nextProps.isMobile &&
    JSON.stringify(prevProps.message.error) ===
      JSON.stringify(nextProps.message.error) &&
    JSON.stringify(prevProps.message.sources) ===
      JSON.stringify(nextProps.message.sources) &&
    JSON.stringify(prevProps.message.followup) ===
      JSON.stringify(nextProps.message.followup),
);

MessageBubble.displayName = "MessageBubble";

// ============================================================================
// MAIN MESSAGE AREA
// ============================================================================
const MessageArea = ({ messages, isMaximized, onSubmit }: MessageAreaProps) => {
  const { status } = useSession();
  const { isSyncing, syncSuccess } = useChat();
  const isAnonymous = status === "unauthenticated";
  const isMobile = useIsMobile();

  // On mobile, behave as if always maximized (full-width layout)
  const effectivelyMaximized = isMaximized || isMobile;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
  }>({ isOpen: false, images: [], currentIndex: 0 });

  const virtuosoRef = useRef<any>(null);

  const handleMessageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        e.preventDefault();
        const clickedSrc = (target as HTMLImageElement).src;
        const allImages = Array.from(
          e.currentTarget.querySelectorAll<HTMLImageElement>("img"),
        ).map((img) => img.src);
        const index = allImages.indexOf(clickedSrc);
        setModalState({
          isOpen: true,
          images: allImages,
          currentIndex: index >= 0 ? index : 0,
        });
      }
    },
    [],
  );

  const navigateModal = useCallback((direction: string) => {
    setModalState((prev) => ({
      ...prev,
      currentIndex:
        direction === "next"
          ? (prev.currentIndex + 1) % prev.images.length
          : (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, images: [], currentIndex: 0 });
  }, []);

  const useVirtualization = messages.length >= 50;

  return (
    <>
      {/*
        KEY RESPONSIVE STRATEGY:
        - Desktop (non-maximized): normal flex-grow with overflow-y-auto
        - Desktop (maximized): same, parent handles the full-screen container
        - Mobile: flex-grow + h-full so it fills whatever container wraps it.
          The parent container should be `h-[100dvh] flex flex-col` on mobile.
      */}
      <div
        className={`
          flex flex-col flex-grow min-h-0 bg-[#fcfcf8] border-b border-gray-100
          overflow-y-auto overscroll-contain
          ${effectivelyMaximized ? "pb-24 md:pb-28" : ""}
        `}
        style={{
          // Use dvh on mobile for accurate viewport height (accounts for browser chrome)
          WebkitOverflowScrolling: "touch",
          height: "73dvh"
        }}
      >
        {/* Warning / sync banner */}
        {(isAnonymous || isSyncing || syncSuccess) && (
          <AnonymousWarningBanner
            isSyncing={isSyncing}
            syncSuccess={syncSuccess}
          />
        )}

        {useVirtualization ? (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            followOutput="smooth"
            className={`
              flex-1 mx-auto w-full
              ${effectivelyMaximized ? "max-w-4xl" : "max-w-7xl"}
              px-3 md:px-6 py-3 md:py-4
            `}
            itemContent={(_, message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMaximized={isMaximized}
                isMobile={isMobile}
                onSubmit={onSubmit}
                handleMessageClick={handleMessageClick}
              />
            )}
          />
        ) : (
          <div
            className={`
              mx-auto w-full
              ${effectivelyMaximized ? "max-w-4xl" : "max-w-7xl"}
              px-3 md:px-6 py-3 md:py-4
            `}
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMaximized={isMaximized}
                isMobile={isMobile}
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
