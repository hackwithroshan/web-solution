import React from 'react';
import { ChatMessage, MessageSender } from '../../types';
import { Bot, User, Check } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn, showAvatar }) => {
  const bubbleClasses = isOwn
    ? 'bg-blue-600 text-white self-end rounded-l-lg rounded-tr-lg'
    : 'bg-gray-100 text-gray-800 self-start rounded-r-lg rounded-tl-lg';

  const senderIcon = isOwn ? (
    <div className="bg-gray-200 p-2 rounded-full flex-shrink-0"><User className="w-5 h-5 text-gray-600" /></div>
  ) : (
    <div className="bg-gray-200 p-2 rounded-full flex-shrink-0"><Bot className="w-5 h-5 text-gray-600" /></div>
  );

  const alignment = isOwn ? 'justify-end' : 'justify-start';

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-end gap-3 my-1 ${alignment}`}>
      {!isOwn && (
        <div className="w-9 h-9 flex-shrink-0">
          {showAvatar && senderIcon}
        </div>
      )}
      <div className={`max-w-[80%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`p-3 rounded-lg ${bubbleClasses}`}>
          <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{message.text}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
          {isOwn && message.status === 'sent' && <Check size={14} className="text-gray-400" />}
        </div>
      </div>
      {isOwn && (
        <div className="w-9 h-9 flex-shrink-0">
          {showAvatar && senderIcon}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;