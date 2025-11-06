import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { ChatMessage, MessageSender } from '../types';
import { Send, Power, Pause, MoreVertical, Paperclip, Smile, Undo2 } from 'lucide-react';
import ChatBubble from './ui/ChatBubble';
import TypingIndicator from './ui/TypingIndicator';

interface LiveChatInterfaceProps {
    sessionId: string;
    initialHistory: ChatMessage[];
    socket: Socket;
    onEndChat: () => void;
    user: { name: string, phone?: string };
    isAdmin?: boolean;
    isReadOnly?: boolean;
    onPushChat?: () => void;
}

const LiveChatInterface: React.FC<LiveChatInterfaceProps> = ({ sessionId, initialHistory, socket, onEndChat, user, isAdmin = false, isReadOnly = false, onPushChat }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const notificationSoundRef = useRef(new Audio('https://res.cloudinary.com/dvrqft9ov/video/upload/v1761992826/mixkit-software-interface-start-2574_nsv3uq.wav'));

    useEffect(() => {
        setMessages(initialHistory);
    }, [initialHistory, sessionId]);

    useEffect(() => {
        const handleNewMessage = (message: ChatMessage) => {
            const isIncoming = message.sender !== (isAdmin ? MessageSender.BOT : MessageSender.USER);
            if (isIncoming) {
                notificationSoundRef.current.play().catch(error => console.log("Audio play failed:", error));
            }
            setMessages(prev => [...prev, message]);
        };
        const handleStartTyping = () => setIsTyping(true);
        const handleStopTyping = () => setIsTyping(false);

        socket.on('liveChatMessage', handleNewMessage);
        socket.on('isTyping', handleStartTyping);
        socket.on('hasStoppedTyping', handleStopTyping);

        return () => {
            socket.off('liveChatMessage', handleNewMessage);
            socket.off('isTyping', handleStartTyping);
            socket.off('hasStoppedTyping', handleStopTyping);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [socket, isAdmin, sessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isReadOnly) return;

        const message: ChatMessage = {
            id: Date.now().toString(),
            sender: isAdmin ? MessageSender.BOT : MessageSender.USER,
            text: input,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        
        socket.emit('liveChatMessage', { sessionId, message });
        setMessages(prev => [...prev, message]);
        setInput('');

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit('stopTyping', sessionId);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (isReadOnly) return;
        socket.emit('startTyping', sessionId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = window.setTimeout(() => socket.emit('stopTyping', sessionId), 2000);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{user.name}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <p className="text-xs text-gray-500">Online</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     {!isReadOnly && onPushChat && (
                        <button onClick={onPushChat} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors" title="Return to Queue">
                            <Undo2 size={18} />
                        </button>
                    )}
                     <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Pause size={18} /></button>
                     {!isReadOnly && <button onClick={onEndChat} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Power size={18} /></button>}
                     <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><MoreVertical size={18} /></button>
                </div>
            </div>
            
            {/* Message List */}
            <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg, index) => {
                    const prevMsg = messages[index-1];
                    const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;
                    return (
                        <ChatBubble 
                            key={msg.id || index} 
                            message={msg} 
                            isOwn={msg.sender === (isAdmin ? MessageSender.BOT : MessageSender.USER)}
                            showAvatar={showAvatar}
                        />
                    );
                })}
                {isTyping && <TypingIndicator senderType={isAdmin ? 'user' : 'agent'} />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
                {isReadOnly ? (
                     <div className="text-center text-sm text-gray-500 p-3 bg-gray-100 rounded-lg">You are viewing this chat.</div>
                ) : (
                    <form onSubmit={handleSend} className="relative">
                        <textarea
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full p-3 pr-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                            style={{ minHeight: '52px', maxHeight: '150px' }}
                            disabled={isReadOnly}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button type="button" disabled={isReadOnly} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Paperclip size={18} /></button>
                            <button type="button" disabled={isReadOnly} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Smile size={18} /></button>
                            <button type="submit" disabled={!input.trim() || isReadOnly} className="bg-black text-white rounded-md px-4 py-2 hover:bg-gray-800 disabled:bg-gray-300 transition-colors font-semibold">
                                Send
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LiveChatInterface;