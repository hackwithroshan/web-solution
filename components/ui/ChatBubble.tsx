import React from 'react';
import { ChatMessage } from '../../types';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwn, showAvatar }) => {
  const bubbleClasses = isOwn
    ? 'bg-black text-white self-end rounded-lg'
    : 'bg-white text-gray-800 self-start rounded-lg border border-gray-200';

  const senderIcon = isOwn ? (
    <div className="bg-gray-800 p-2 rounded-full flex-shrink-0"><User className="w-5 h-5 text-white" /></div>
  ) : (
    <div className="bg-gray-200 p-2 rounded-full flex-shrink-0"><User className="w-5 h-5 text-gray-600" /></div>
  );
  
  // Use a bot icon for system messages
  const systemIcon = <div className="bg-gray-200 p-2 rounded-full flex-shrink-0"><Bot className="w-5 h-5 text-gray-600" /></div>;
  const isSystemMessage = message.sender === 'bot' && !isOwn; // A message from 'bot' that is NOT the agent's own message

  const alignment = isOwn ? 'justify-end' : 'justify-start';

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSystemMessage) {
    return (
        <div className="text-center my-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{message.text}</span>
        </div>
    )
  }

  return (
    <div className={`flex items-end gap-3 my-2 ${alignment}`}>
      {!isOwn && (
        <div className="w-9 h-9 flex-shrink-0">
          {showAvatar && senderIcon}
        </div>
      )}
      <div className={`max-w-[80%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`px-3 py-2 ${bubbleClasses}`}>
          {message.attachment && message.attachment.type === 'image' && (
            <img 
              src={message.attachment.url} 
              alt={message.attachment.name} 
              className="rounded-md max-w-xs mb-2 cursor-pointer" 
              onClick={() => window.open(message.attachment.url, '_blank')}
            />
          )}
          {message.text && (
            <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{message.text}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
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
