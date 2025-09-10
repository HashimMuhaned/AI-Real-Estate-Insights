"use client";

import React from "react";
import "./ChatBotStyling.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FaLink } from "react-icons/fa6";
import { AnimatePresence, motion, Variants, Transition } from "framer-motion";
// as the AI is responding we display this shows animated dots like a typing indicator.
const PremiumTypingAnimation = () => {
  return (
    <div className="flex gap-1 ml-1">
      <span className="w-2 h-2 bg-gray-400/70 rounded-full animate-pulse"></span>
      <span className="w-2 h-2 bg-gray-400/70 rounded-full animate-pulse [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-gray-400/70 rounded-full animate-pulse [animation-delay:0.4s]"></span>
    </div>
  );
};

// visually represents the stages of a search process (searching, reading, writing, error)
// if the AI is searchin it display Searching...
const SearchStages = ({ searchInfo, isMaximized }) => {
  return (
    <div className="relative mt-1 mb-3">
      <div className="flex flex-col gap-1 text-sm text-gray-700">
        {/* Searching Stage */}
        {searchInfo.stages.includes("searching") && (
          <div className="relative">
            {/* Green dot */}
            <div className="absolute top-[0.2rem] left-[-0.75rem] w-[10px] h-[10px] bg-teal-400 rounded-full z-10 shadow-sm" />

            {/* Connector to next stage */}
            {searchInfo.stages.includes("reading") && (
              <div className="absolute top-[0.22rem] left-[-8px] w-[2px] h-[calc(100%+0.5rem)] bg-gradient-to-b from-teal-300 to-teal-200" />
            )}

            <div className="ml-2 mb-2 font-medium block">
              Searching the web...
            </div>

            {/* Query */}
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

        {/* Reading Stage */}
        {searchInfo.stages.includes("reading") && (
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

        {/* Writing Stage */}
        {searchInfo.stages.includes("writing") && (
          <div className="relative">
            <div className="absolute top-[0.2rem] left-[-0.75rem] w-[10px] h-[10px] bg-teal-400 rounded-full z-10 shadow-sm" />
            <span className="ml-2 mb-2 font-medium block">Writing answer</span>
          </div>
        )}

        {/* Error Stage */}
        {searchInfo.stages.includes("error") && (
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
};

type Message = {
  id: string;
  isUser: boolean;
  isLoading?: boolean;
  content?: string;
  searchInfo?: any;
  sources?: string[];
  followup?: string[];
};

interface MessageAreaProps {
  messages: Message[];
  isMaximized: boolean;
  onSubmit: (q: string) => void;
}

//  displays the list of messages in a chat, including logic to show loading, search stages, and user/AI message styling.
const MessageArea = ({ messages, isMaximized, onSubmit }) => {
  const bottomRef = useRef(null);
  const [expandedSources, setExpandedSources] = useState({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleSources = (id) => {
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.68, -0.55, 0.27, 1.55], // back-ease cubic-bezier
        delayChildren: 0.1,
        staggerChildren: 0.05,
      },
    },
  };

  const messageVariants: Variants = {
    minimized: {
      x: 15,
      opacity: 0.7,
      scale: 0.95,
      transition: { duration: 0.25, ease: "easeInOut" },
    },
    maximized: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  const maximizedVariants: Variants = {
    minimized: {
      x: 20,
      opacity: 0.9,
      scale: 0.97,
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 25,
      },
    },
    maximized: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 25,
        // ✨ cascade effect
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const layoutTransition: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  };

  // const layoutTransition: Transition = {
  //   type: "tween",
  //   duration: 0.6,
  //   ease: "easeInOut",
  // };

  return (
    <motion.div
      className={`flex-grow overflow-y-auto bg-[#fcfcf8] border-b border-gray-100 min-h-0 ${
        isMaximized ? "pb-28" : ""
      }`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layout
      transition={layoutTransition}
    >
      <motion.div
        className={`mx-auto p-6 ${isMaximized ? "max-w-4xl" : "max-w-7xl"}`}
        layout
        transition={layoutTransition}
        variants={maximizedVariants}
        animate={isMaximized ? "maximized" : "minimized"}
      >
        <AnimatePresence mode="popLayout">
          {messages?.map((message: any, index: any) => (
            <motion.div
              key={message.id}
              className={`mb-5 ${
                isMaximized
                  ? message.isUser
                    ? "flex justify-end"
                    : "w-full"
                  : `flex ${message.isUser ? "justify-end" : "justify-start"}`
              }`}
              variants={messageVariants}
              animate={isMaximized ? "maximized" : "minimized"}
              exit="hidden"
              // transition={{ delay: index * 0.05 }}
              layout
              transition={layoutTransition}
            >
              {isMaximized && !message.isUser ? (
                <motion.div
                  className="w-full"
                  layout
                  transition={layoutTransition}
                >
                  {message.searchInfo && (
                    <SearchStages
                      searchInfo={message.searchInfo}
                      isMaximized={isMaximized}
                    />
                  )}
                  <motion.div
                    className="py-4 text-sm text-gray-800 leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    layout
                  >
                    {message.isLoading ? (
                      <PremiumTypingAnimation />
                    ) : (
                      message.content || (
                        <span className="text-gray-400 text-xs italic">
                          Waiting for response...
                        </span>
                      )
                    )}
                  </motion.div>

                  {message?.sources && message.sources.length > 0 && (
                    <motion.div
                      className="mt-4 pt-4 border-t border-gray-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      layout
                    >
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
                          <motion.div
                            key={`${source}-${sourceIndex}`}
                            className="group flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-150"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + sourceIndex * 0.1 }}
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
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Enhanced Followup Section for Maximized Mode */}
                  {message?.followup && message.followup.length > 0 && (
                    <motion.div
                      className="mt-6 pt-4 border-t border-gray-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      layout
                    >
                      {/* Header */}
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
                            {message.followup.length === 1
                              ? "question"
                              : "questions"}
                          </p>
                        </div>
                      </div>

                      {/* Followup Questions Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {message.followup.map(
                          (follow: any, followIndex: any) => (
                            <motion.button
                              key={followIndex}
                              className="group w-full text-left p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300"
                              onClick={() => onSubmit(follow)}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 + followIndex * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start gap-3">
                                {/* Question number badge */}
                                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-medium group-hover:bg-purple-200 transition-all duration-300">
                                  {followIndex + 1}
                                </div>

                                {/* Question text */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed transition-colors duration-300">
                                    {follow}
                                  </p>
                                </div>

                                {/* Arrow icon */}
                                <div className="flex-shrink-0 mt-1 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1">
                                  <svg
                                    className="w-4 h-4 text-purple-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                  </svg>
                                </div>
                              </div>

                              {/* Subtle bottom accent line */}
                              <div className="mt-3 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </motion.button>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className={`flex flex-col ${
                    isMaximized ? "max-w-md pt-28 pb-12" : "max-w-[28rem]"
                  }`}
                  layout
                  transition={layoutTransition}
                >
                  {!message.isUser && message.searchInfo && (
                    <SearchStages
                      searchInfo={message.searchInfo}
                      isMaximized={isMaximized}
                    />
                  )}
                  <motion.div
                    className={`px-5 py-3 rounded-lg shadow text-[13px] ${
                      message.isUser
                        ? "text-white rounded-br-none"
                        : "bg-[#f3f3ee] text-gray-700 border border-gray-200 rounded-bl-none shadow-sm"
                    }`}
                    style={
                      message.isUser
                        ? {
                            background:
                              "linear-gradient(135deg, hsl(45 85% 55%), hsl(40 80% 60%))",
                          }
                        : {}
                    }
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    layout
                  >
                    {message.isLoading ? (
                      <PremiumTypingAnimation />
                    ) : (
                      message.content || (
                        <span className="text-gray-400 text-xs italic">
                          Waiting for response...
                        </span>
                      )
                    )}
                  </motion.div>

                  {/* Sources section with Show more / Show less */}
                  {message?.sources &&
                    message.sources.length > 0 &&
                    !isMaximized && (
                      <motion.div
                        className="mt-3 px-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        layout
                      >
                        <div className="flex items-center gap-2 mb-2">
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
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Sources ({message.sources.length})
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <AnimatePresence>
                            {(expandedSources[message.id]
                              ? message.sources
                              : message.sources.slice(0, 2)
                            ).map((source, sourceIndex) => (
                              <motion.div
                                key={`${source}-${sourceIndex}`}
                                className="group flex items-start gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors duration-150"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ delay: sourceIndex * 0.1 }}
                              >
                                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 mt-2"></div>
                                <Link
                                  href={source}
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all leading-relaxed flex-1 group-hover:text-blue-700 transition-colors duration-150"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {source}
                                </Link>
                                <svg
                                  className="w-3 h-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {message.sources.length > 2 && (
                            <motion.button
                              onClick={() => toggleSources(message.id)}
                              className="text-xs text-blue-500 hover:underline mt-1 pb-5"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {expandedSources[message.id]
                                ? "Show less sources"
                                : "Show more sources"}
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}

                  {/* Enhanced Followup Section for Minimized Mode */}
                  {message?.followup && message.followup.length > 0 && (
                    <motion.div
                      className="mt-4 px-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      layout
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                          <svg
                            className="w-3 h-3 text-purple-600"
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
                          <p className="text-xs font-semibold text-gray-800">
                            Continue the conversation
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {message.followup.length} suggested{" "}
                            {message.followup.length === 1
                              ? "question"
                              : "questions"}
                          </p>
                        </div>
                      </div>

                      {/* Followup Questions */}
                      <div className="space-y-2">
                        {message.followup.map((follow, followIndex) => (
                          <motion.button
                            key={followIndex}
                            className="group w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300"
                            onClick={() => onSubmit(follow)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + followIndex * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-start gap-3">
                              {/* Question number badge */}
                              <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium group-hover:bg-purple-100 group-hover:text-purple-700 transition-all duration-300">
                                {followIndex + 1}
                              </div>

                              {/* Question text */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 group-hover:text-gray-800 leading-relaxed transition-colors duration-300">
                                  {follow}
                                </p>
                              </div>

                              {/* Arrow icon */}
                              <div className="flex-shrink-0 mt-0.5 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1">
                                <svg
                                  className="w-3 h-3 text-purple-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </motion.div>
    </motion.div>
  );
};

export default MessageArea;
