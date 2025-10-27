import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { ChatMessage, MessageSender } from '../types';
import { Send, Power, User, Bot } from 'lucide-react';
import Button from './ui/Button';
import ChatBubble from './ui/ChatBubble';

interface LiveChatInterfaceProps {
    sessionId: string;
    initialHistory: ChatMessage[];
    socket: Socket;
    onEndChat: () => void;
    isAdmin?: boolean;
}

const LiveChatInterface: React.FC<LiveChatInterfaceProps> = ({ sessionId, initialHistory, socket, onEndChat, isAdmin = false }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    // FIX: Replaced NodeJS.Timeout with 'number' type for browser compatibility.
    const typingTimeoutRef = useRef<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleNewMessage = (message: ChatMessage) => {
            const expectedSender = isAdmin ? MessageSender.USER : MessageSender.BOT;
            if (message.sender === expectedSender) {
                 setMessages(prev => [...prev, message]);
            }
        };
        const handleSessionEnd = () => onEndChat();
        const handleStartTyping = () => setIsTyping(true);
        const handleStopTyping = () => setIsTyping(false);

        socket.on('liveChatMessage', handleNewMessage);
        socket.on('chatSessionEnded', handleSessionEnd);
        socket.on('isTyping', handleStartTyping);
        socket.on('hasStoppedTyping', handleStopTyping);

        return () => {
            socket.off('liveChatMessage', handleNewMessage);
            socket.off('chatSessionEnded', handleSessionEnd);
            socket.off('isTyping', handleStartTyping);
            socket.off('hasStoppedTyping', handleStopTyping);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [socket, onEndChat, isAdmin]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

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

        // Ensure stop typing is emitted on send
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit('stopTyping', sessionId);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);

        socket.emit('startTyping', sessionId);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // FIX: Replaced NodeJS.Timeout with 'number' type for browser compatibility.
        typingTimeoutRef.current = window.setTimeout(() => {
            socket.emit('stopTyping', sessionId);
        }, 2000); // 2 seconds of inactivity
    };

    const handleEndChat = () => {
        socket.emit('endLiveChat', sessionId);
        onEndChat();
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Live Chat Session</h3>
                <Button onClick={handleEndChat} variant="secondary" className="!text-sm !py-1.5 !px-3 !bg-red-50 hover:!bg-red-100 !text-red-700">
                    <Power size={14} className="mr-1.5" /> End Chat
                </Button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-center text-xs text-gray-400 pb-4 border-b mb-4">This is the beginning of your live chat session.</p>
                {messages.map((msg, index) => {
                    const prevMsg = messages[index-1];
                    const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;
                    return (
                        <ChatBubble 
                            key={index} 
                            message={msg} 
                            isOwn={msg.sender === (isAdmin ? MessageSender.BOT : MessageSender.USER)}
                            showAvatar={showAvatar}
                        />
                    );
                })}
                 {isTyping && (
                    <div className="flex items-end gap-3 my-1 justify-start">
                        <div className="w-9 h-9 flex-shrink-0">
                             <div className="bg-gray-200 p-2 rounded-full flex-shrink-0">
                                {isAdmin ? <User className="w-5 h-5 text-gray-600" /> : <Bot className="w-5 h-5 text-gray-600" />}
                            </div>
                        </div>
                        <div className="max-w-[80%] flex flex-col items-start">
                            <div className="p-3 rounded-lg bg-gray-100 text-gray-800 self-start rounded-r-lg rounded-tl-lg">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-bounce" style={{ animationDelay: '0s' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-bounce" style={{ animationDelay: '0.15s' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-bounce" style={{ animationDelay: '0.3s' }}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-gray-50">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="flex-1 p-2 border rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" disabled={!input.trim()} className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:bg-blue-300">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LiveChatInterface;