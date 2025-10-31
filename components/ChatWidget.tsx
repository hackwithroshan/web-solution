import React, { useState, useRef } from 'react';
import { HelpCircle, X } from 'lucide-react';
import ChatWindow, { ChatWindowRef } from './ChatWindow';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chatWindowRef = useRef<ChatWindowRef>(null);

  const toggleChat = () => {
    if (isOpen) {
      // Defer closing to the ChatWindow to handle confirmation logic
      chatWindowRef.current?.handleCloseAttempt();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {isOpen && <ChatWindow ref={chatWindowRef} onClose={() => setIsOpen(false)} />}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <button
          onClick={toggleChat}
          className="bg-gray-900 text-white rounded-full px-5 py-3 shadow-lg hover:bg-black transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 flex items-center gap-2"
          aria-label={isOpen ? "Close Help Center" : "Open Help Center"}
        >
          {isOpen ? (
            <>
              <X size={20} />
              <span>Close</span>
            </>
          ) : (
            <>
              <HelpCircle size={20} />
              <span>Help &amp; Support</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;