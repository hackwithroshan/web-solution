import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    // This container is full-screen but doesn't block clicks, allowing the
    // button and window to be positioned within it.
    <div className="fixed inset-0 z-50 pointer-events-none">
      {isOpen && <ChatWindow onClose={toggleChat} />}
      <div className="absolute bottom-5 right-5 pointer-events-auto">
        <button
          onClick={toggleChat}
          className="bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label={isOpen ? "Close Chat" : "Open Chat"}
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;