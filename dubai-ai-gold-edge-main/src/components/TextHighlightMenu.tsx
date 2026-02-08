"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useChat } from "@/context/ChatContext";

const TextHighlightMenu = () => {
  const [selectedText, setSelectedText] = useState("");
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const { setContextPrompt, openChat, isChatOpen } = useChat();

  // Store last pointer position
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePointer = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e && e.touches.length > 0) {
        pointerRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else if ("changedTouches" in e && e.changedTouches.length > 0) {
        pointerRef.current = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY,
        };
      } else if ("clientX" in e) {
        pointerRef.current = {
          x: e.clientX,
          y: e.clientY,
        };
      }
    };

    const handleSelection = () => {
      if (isChatOpen) {
        setShowMenu(false);
        return;
      }

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!selection || !text || text.length < 3 || selection.rangeCount === 0) {
        setShowMenu(false);
        return;
      }

      setSelectedText(text);

      // 👉 Position based on where user released mouse
      const x = pointerRef.current.x;
      const y = pointerRef.current.y - 12;

      const menuWidth = 140;

      const adjustedX = Math.max(
        menuWidth / 2 + 12,
        Math.min(x, window.innerWidth - menuWidth / 2 - 12)
      );

      setMenuPosition({ x: adjustedX, y });
      setShowMenu(true);
    };

    let selectionTimeout: NodeJS.Timeout;

    const debouncedHandleSelection = () => {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(handleSelection, 40);
    };

    document.addEventListener("mousemove", updatePointer);
    document.addEventListener("touchmove", updatePointer);

    document.addEventListener("mouseup", (e) => {
      updatePointer(e);
      debouncedHandleSelection();
    });

    document.addEventListener("touchend", (e) => {
      updatePointer(e);
      debouncedHandleSelection();
    });

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-highlight-menu]")) {
        setTimeout(() => setShowMenu(false), 80);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearTimeout(selectionTimeout);
      document.removeEventListener("mousemove", updatePointer);
      document.removeEventListener("touchmove", updatePointer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  const handleAskAI = () => {
    if (!selectedText) return;

    setContextPrompt({
      topic: "Selected Text",
      question: selectedText,
    });

    openChat();
    setShowMenu(false);

    setTimeout(() => {
      window.getSelection()?.removeAllRanges();
    }, 200);
  };

  return (
    <AnimatePresence>
      {showMenu && selectedText && !isChatOpen && (
        <motion.div
          data-highlight-menu
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-[100] pointer-events-auto"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent"
            style={{
              borderTopColor: "hsl(45 85% 55%)",
            }}
          />

          <motion.button
            onClick={handleAskAI}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-lg whitespace-nowrap"
            style={{
              background:
                "linear-gradient(135deg, hsl(45 85% 55%), hsl(40 80% 60%))",
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Ask AI
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextHighlightMenu;
