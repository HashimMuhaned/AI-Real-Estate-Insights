import React from "react";
// import { useState } from "react";
import "./ChatBotStyling.css"; // Link the CSS file
import { Send } from "lucide-react";

const ChatInput = ({ currentMessage, setCurrentMessage, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="p-4 bg-white">
      <div className="flex items-center bg-gray-50 rounded-sm px-3 py-2 shadow-md border border-gray-200">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Ask about investment opportunities..."
          className="flex-grow bg-transparent border-none outline-none text-sm text-gray-700 px-2"
        />
        <button
          type="submit"
          disabled={!currentMessage.trim()}
          className="p-2 ml-1 rounded-sm shadow-md transition-transform disabled:opacity-50 active:scale-120"
          style={{
            background:
              "linear-gradient(135deg, hsl(45 85% 55%), hsl(40 80% 60%))",
          }}
        >
          <Send className="w-4 h-4 text-white transform rotate-45 transition-transform group-hover:scale-110" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
