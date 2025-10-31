import React from 'react';
import { Bot, User } from 'lucide-react';

interface TypingIndicatorProps {
  senderType: 'bot' | 'agent' | 'user';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ senderType }) => {
  const senderInfo = {
    bot: { icon: <Bot className="w-5 h-5 text-gray-600" />, text: 'Bot is typing...' },
    agent: { icon: <Bot className="w-5 h-5 text-gray-600" />, text: 'Agent is typing...' },
    user: { icon: <User className="w-5 h-5 text-gray-600" />, text: 'User is typing...' },
  };

  const { icon, text } = senderInfo[senderType];

  return (
    <div className="flex items-end gap-3 my-2 animate-fade-in-up-fast">
      <div className="w-9 h-9 flex-shrink-0 self-start">
        <div className="bg-gray-200 p-2 rounded-full flex-shrink-0">
          {icon}
        </div>
      </div>
      <div className="flex flex-col items-start">
        <div className="p-3 rounded-lg bg-gray-100 text-gray-800 self-start rounded-r-lg rounded-tl-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-bounce" style={{ animationDelay: '0.15s' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-bounce" style={{ animationDelay: '0.3s' }}></span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1 px-1">{text}</p>
      </div>
    </div>
  );
};

export default TypingIndicator;