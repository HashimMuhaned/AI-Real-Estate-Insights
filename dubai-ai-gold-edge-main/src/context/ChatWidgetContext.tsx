// "use client"


// import React, { createContext, useContext, useState } from "react";

// type ChatWidgetContextType = {
//   isOpen: boolean;
//   openChat: () => void;
//   closeChat: () => void;
//   toggleChat: () => void;
// };

// const ChatWidgetContext = createContext<ChatWidgetContextType | undefined>(undefined);

// export const ChatWidgetProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const openChat = () => setIsOpen(true);
//   const closeChat = () => setIsOpen(false);
//   const toggleChat = () => setIsOpen((prev) => !prev);

//   return (
//     <ChatWidgetContext.Provider value={{ isOpen, openChat, closeChat, toggleChat }}>
//       {children}
//     </ChatWidgetContext.Provider>
//   );
// };

// export const useChatWidget = () => {
//   const context = useContext(ChatWidgetContext);
//   if (!context) throw new Error("useChatWidget must be used inside ChatWidgetProvider");
//   return context;
// };
