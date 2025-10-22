import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {isOpen && <ChatWindow onClose={toggleChat} />}
      <div className="absolute bottom-5 right-5 pointer-events-auto">
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
