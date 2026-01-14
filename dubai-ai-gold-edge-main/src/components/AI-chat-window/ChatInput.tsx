import React, { useState, useRef } from "react";
import { Send, Plus, X, Paperclip, File, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatInput = ({ currentMessage, setCurrentMessage, onSubmit }) => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showActions, setShowActions] = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const quickActions = [
    "Area Risk Scan",
    "Investment Strategy Generator",
    "Price Prediction",
    "Compare Areas",
    "Cashflow Calculator",
    "Project Finder",
    "News Impact Scanner",
    "Exit Timing Advisor",
    "Red Flag Finder",
    "Document Analyzer",
  ];

  const displayedActions = showAllActions
    ? quickActions
    : quickActions.slice(0, 4);

  const handleChange = (e) => {
    setCurrentMessage(e.target.value);
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  };

  const handleQuickAction = (action) => {
    setSelectedAction(action);
    setCurrentMessage(action);
    setShowActions(false);
    setShowAllActions(false);
    textareaRef.current?.focus();
  };

  const removeQuickAction = () => {
    setSelectedAction(null);
    setCurrentMessage("");
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    }
  };

  const removeFile = () => {
    if (uploadedFile?.url) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const isImage = uploadedFile?.type.startsWith("image/");
  const hasContent = currentMessage.trim().length > 0;
  const hasTags = selectedAction || uploadedFile;

  return (
    <div>
      {/* Quick Actions Dropdown */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              className="border border-gray-200 rounded-lg shadow-lg p-2 max-w-xs bg-white"
            >
              <div className="flex items-center justify-between mb-2 px-2 pt-1">
                <span className="text-xs font-semibold text-gray-700">
                  Quick Actions
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowActions(false);
                    setShowAllActions(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {displayedActions.map((action, index) => (
                  <motion.button
                    key={action}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    type="button"
                    onClick={() => handleQuickAction(action)}
                    className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {action}
                  </motion.button>
                ))}
              </div>
              {!showAllActions && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  type="button"
                  onClick={() => setShowAllActions(true)}
                  className="w-full mt-1 px-3 py-2 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  + More Actions
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Input */}
      <div className="p-4">
        <div className="relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-300 hover:border-gray-400 transition-colors">
          {/* Textarea Container */}
          <div className="flex-1 px-4 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              value={currentMessage}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (currentMessage.trim()) {
                    onSubmit(e);
                  }
                }
              }}
              placeholder="Ask about investment opportunities..."
              className="w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400 resize-none overflow-y-auto"
              style={{
                maxHeight: "200px",
                minHeight: hasContent ? "auto" : "24px",
                lineHeight: "1.5",
              }}
            />
          </div>

          {/* Buttons Row - Sticks to bottom */}
          <div className="flex items-center justify-between px-2 pb-2 gap-2">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="flex items-center gap-1">
              {/* Quick Actions Button */}
              <motion.button
                type="button"
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                title="Quick Actions"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: showActions ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </motion.div>
              </motion.button>

              {/* File Upload Button */}
              <label
                htmlFor="fileUpload"
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                title="Upload File"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </label>
              <input
                id="fileUpload"
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />
              </div>

              {/* Tags */}
              <AnimatePresence>
                {/* Quick Action Tag */}
                {selectedAction && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300 rounded-full text-xs font-medium text-amber-800"
                  >
                    <span>{selectedAction}</span>
                    <button
                      type="button"
                      onClick={removeQuickAction}
                      className="hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}

                {/* File Preview Tag */}
                {uploadedFile && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-full text-xs font-medium text-blue-800"
                  >
                    {isImage ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={uploadedFile.url}
                          alt={uploadedFile.name}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="max-w-[120px] truncate">
                            {uploadedFile.name}
                          </span>
                          <span className="text-[10px] text-blue-600">
                            {formatFileSize(uploadedFile.size)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4" />
                        <div className="flex flex-col">
                          <span className="max-w-[120px] truncate">
                            {uploadedFile.name}
                          </span>
                          <span className="text-[10px] text-blue-600">
                            {formatFileSize(uploadedFile.size)}
                          </span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeFile}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Send Button */}
            <motion.button
              onClick={(e) => {
                if (currentMessage.trim()) {
                  onSubmit(e);
                }
              }}
              disabled={!currentMessage.trim()}
              className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: currentMessage.trim()
                  ? "linear-gradient(135deg, hsl(45 85% 55%), hsl(40 80% 60%))"
                  : "#e5e7eb",
              }}
              whileHover={
                currentMessage.trim() ? { scale: 1.05 } : {}
              }
              whileTap={
                currentMessage.trim() ? { scale: 0.95 } : {}
              }
            >
              <Send
                className={`w-4 h-4 ${
                  currentMessage.trim() ? "text-white" : "text-gray-400"
                }`}
              />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;