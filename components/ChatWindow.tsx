import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSender, ChatMessage, FAQ } from '../types';
import { Send, X, Loader, Bot, Search, ChevronRight, MessageSquare, ArrowLeft, Headset, Phone } from 'lucide-react';
import { getChatbotResponse } from '../services/geminiService';
import { fetchPublicFAQs, createTicket, requestCallback } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import ChatBubble from './ui/ChatBubble';
import { useToast } from '../hooks/useToast';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import LiveChatInterface from './LiveChatInterface';

// --- SUB-COMPONENTS (Moved outside main component to prevent re-creation on re-render) ---

const HomeView: React.FC<{
  faqs: FAQ[];
  onFaqClick: (faq: FAQ) => void;
  onContactClick: () => void;
}> = ({ faqs, onFaqClick, onContactClick }) => (
    <>
      <main className="flex-1 p-5 overflow-y-auto">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <h3 className="mt-6 mb-3 font-semibold text-gray-800">Popular FAQs</h3>
        <div className="space-y-2">
            {faqs.length > 0 ? faqs.map((faq) => (
                <button onClick={() => onFaqClick(faq)} key={faq._id} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex justify-between items-center group">
                    <span className="text-sm text-gray-700">{faq.question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
            )) : <p className="text-sm text-gray-500">Could not load FAQs.</p>}
        </div>
      </main>
      <footer className="p-5 border-t bg-gray-50 text-center">
        <p className="text-gray-600 text-sm mb-3">Need more help?</p>
        <button onClick={onContactClick} className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full">
          <MessageSquare size={18} /> Contact Us
        </button>
      </footer>
    </>
);

const ContactView: React.FC<{
  liveChatStatus: 'waiting' | 'idle' | 'active';
  onRequestLiveChat: () => void;
  onCallbackClick: () => void;
  onTicketClick: () => void;
}> = ({ liveChatStatus, onRequestLiveChat, onCallbackClick, onTicketClick }) => (
    <div className="p-5 flex flex-col justify-center h-full">
        {liveChatStatus === 'waiting' ? (
            <div className="text-center p-8">
                <Loader className="animate-spin mx-auto text-blue-600 mb-4 h-8 w-8" />
                <p className="font-semibold text-gray-800">Connecting you to an agent...</p>
                <p className="text-sm text-gray-500 mt-1">Please wait a moment.</p>
            </div>
        ) : (
            <div className="space-y-3 text-center">
                <p className="text-gray-600 mb-4">How would you like to get in touch?</p>
                <button onClick={onRequestLiveChat} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition text-left">
                    <Headset className="text-blue-600 text-xl flex-shrink-0" />
                    <div>
                        <p className="font-medium text-gray-800">Live Chat</p>
                        <p className="text-xs text-gray-500">Available 10 AM - 10 PM</p>
                    </div>
                </button>
                <button onClick={onCallbackClick} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition text-left">
                    <Phone className="text-green-600 text-xl flex-shrink-0" />
                    <div>
                        <p className="font-medium text-gray-800">Request a Callback</p>
                        <p className="text-xs text-gray-500">We’ll contact you soon</p>
                    </div>
                </button>
                <button onClick={onTicketClick} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition text-left">
                    <MessageSquare className="text-purple-600 text-xl flex-shrink-0" />
                    <div>
                        <p className="font-medium text-gray-800">Create a Support Ticket</p>
                        <p className="text-xs text-gray-500">Get assistance for your issue</p>
                    </div>
                </button>
            </div>
        )}
    </div>
);
  
const CallbackView: React.FC<{
  callbackData: { phone: string; message: string };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}> = ({ callbackData, onFormChange, onSubmit, isLoading }) => (
    <main className="flex-1 p-5 overflow-y-auto">
        <form onSubmit={onSubmit} className="space-y-4">
            <input name="phone" type="tel" placeholder="Your Phone Number" value={callbackData.phone} onChange={onFormChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea name="message" placeholder="Briefly describe your issue..." value={callbackData.message} onChange={onFormChange} required rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Submit Request'}
            </Button>
        </form>
    </main>
);
  
const TicketView: React.FC<{
  newTicketData: { subject: string; message: string };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}> = ({ newTicketData, onFormChange, onSubmit, isLoading }) => (
     <main className="flex-1 p-5 overflow-y-auto">
        <form onSubmit={onSubmit} className="space-y-4">
            <input name="subject" type="text" placeholder="Subject" value={newTicketData.subject} onChange={onFormChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea name="message" placeholder="Describe your issue in detail..." value={newTicketData.message} onChange={onFormChange} required rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Create Ticket'}
            </Button>
        </form>
    </main>
);

const ChatView: React.FC<{
    messages: ChatMessage[];
    input: string;
    onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}> = ({ messages, input, onInputChange, onKeyDown, onSubmit, isLoading, textareaRef, messagesEndRef }) => (
    <>
        <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => {
                const prevMsg = messages[index-1];
                const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;
                return (
                    <ChatBubble key={msg.id} message={msg} isOwn={msg.sender === MessageSender.USER} showAvatar={showAvatar} />
                )
            })}
            {isLoading && (
                <div className="flex items-end gap-3 my-1 justify-start">
                    <div className="w-9 h-9 flex-shrink-0">
                        <div className="bg-gray-200 p-2 rounded-full flex-shrink-0">
                            <Bot className="w-5 h-5 text-gray-600" />
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
        </main>
        <footer className="p-3 border-t bg-white">
            <form onSubmit={onSubmit} className="flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    placeholder="Ask a question..."
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto bg-white"
                    style={{ maxHeight: '120px' }}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:bg-blue-300 self-end mb-1 flex-shrink-0">
                    {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5"/>}
                </button>
            </form>
        </footer>
    </>
);

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  type View = 'home' | 'chat' | 'contact' | 'callback' | 'ticket' | 'live_chat';
  const [view, setView] = useState<View>('home');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addToast } = useToast();
  const { user } = useAuth();
  
  // Live Chat State
  const socketRef = useRef<Socket | null>(null);
  const [liveChatStatus, setLiveChatStatus] = useState<'idle' | 'waiting' | 'active'>('idle');
  const [activeLiveSession, setActiveLiveSession] = useState<{ id: string, user: any, history: ChatMessage[] } | null>(null);

  // Form states
  const [callbackData, setCallbackData] = useState({ phone: user?.phone || '', message: '' });
  const [newTicketData, setNewTicketData] = useState({ subject: '', message: '' });

  const handleCallbackFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCallbackData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleTicketFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewTicketData(prev => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    if(view === 'home') {
        const loadFAQs = async () => {
          try {
            const faqData = await fetchPublicFAQs();
            setFaqs(faqData);
          } catch (error) {
            addToast('Could not load FAQs.', 'error');
          }
        };
        loadFAQs();
    }
  }, [view, addToast]);

  useEffect(() => {
    if (!user) return;
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    socketRef.current = io(socketUrl);
    socketRef.current.on('connect', () => {});
    
    socketRef.current.on('chatSessionStarted', (sessionData) => {
      const systemMessage: ChatMessage = {
          id: `system-join-${uuidv4()}`,
          sender: MessageSender.BOT,
          text: "An agent has joined the chat. You are now connected.",
          timestamp: new Date().toISOString()
      };
      const updatedSessionData = {
          ...sessionData,
          history: [...sessionData.history, systemMessage]
      };
      setActiveLiveSession(updatedSessionData);
      setLiveChatStatus('active');
      setView('live_chat');
    });

    socketRef.current.on('chatSessionEnded', () => {
        addToast("The live chat session has ended.", "info");
        setLiveChatStatus('idle');
        setActiveLiveSession(null);
        setView('home');
    });
    return () => { socketRef.current?.disconnect(); };
  }, [user, addToast]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
    }
  }, [input]);
  
  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: ChatMessage = { id: uuidv4(), sender: MessageSender.USER, text: input, timestamp: new Date().toISOString(), status: 'sent' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const botResponseText = await getChatbotResponse(input, messages);
      const botMessage: ChatMessage = { id: uuidv4(), sender: MessageSender.BOT, text: botResponseText, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
       const errorMessage: ChatMessage = { id: uuidv4(), sender: MessageSender.BOT, text: "Sorry, I couldn't process that. Please try again.", timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [input, isLoading, messages]);
  
  const handleFaqClick = useCallback((faq: FAQ) => {
    const userMessage: ChatMessage = { id: uuidv4(), sender: MessageSender.USER, text: faq.question, timestamp: new Date().toISOString(), status: 'sent' };
    const botMessage: ChatMessage = { id: uuidv4(), sender: MessageSender.BOT, text: faq.answer, timestamp: new Date().toISOString() };
    const initialMessages = messages.length > 0 ? messages : [{ id: uuidv4(), sender: MessageSender.BOT, text: "Hello! Here is the answer to your selected question.", timestamp: new Date().toISOString() }];
    setMessages([...initialMessages, userMessage, botMessage]);
    setView('chat');
  }, [messages]);

  const handleCallbackSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        await requestCallback(callbackData.phone, callbackData.message);
        addToast("We've received your request and will call you back shortly.", 'success');
        setCallbackData({ phone: user?.phone || '', message: '' });
        setView('home');
    } catch (error: any) {
        addToast(error.message || 'Failed to send request.', 'error');
    } finally {
        setIsLoading(false);
    }
  }, [callbackData, addToast, user]);

  const handleTicketSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        await createTicket(newTicketData.subject, newTicketData.message);
        addToast("Support ticket created successfully!", 'success');
        setNewTicketData({ subject: '', message: '' });
        setView('home');
    } catch (error: any) {
        addToast(error.message || 'Failed to create ticket.', 'error');
    } finally {
        setIsLoading(false);
    }
  }, [newTicketData, addToast]);

  const handleRequestLiveChat = useCallback(() => {
    if (socketRef.current && user) {
      socketRef.current.emit('requestLiveChat', { user: { _id: user._id, name: user.name }, history: messages });
      setLiveChatStatus('waiting');
    } else {
        addToast('Could not connect to live chat. Please refresh and try again.', 'error');
    }
  }, [user, messages, addToast]);

  const handleBack = useCallback(() => {
      if (view === 'live_chat') return;
      setLiveChatStatus('idle');
      setView('home');
  }, [view]);

  const handleChatInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleChatInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        (e.currentTarget.form as HTMLFormElement).requestSubmit();
      }
    }
  }, [isLoading, input]);

  const renderView = () => {
    switch(view) {
        case 'home': return <HomeView faqs={faqs} onFaqClick={handleFaqClick} onContactClick={() => setView('contact')} />;
        case 'chat': return <ChatView messages={messages} input={input} onInputChange={handleChatInputChange} onKeyDown={handleChatInputKeyDown} onSubmit={handleSend} isLoading={isLoading} textareaRef={textareaRef} messagesEndRef={messagesEndRef} />;
        case 'contact': return <ContactView liveChatStatus={liveChatStatus} onRequestLiveChat={handleRequestLiveChat} onCallbackClick={() => setView('callback')} onTicketClick={() => setView('ticket')} />;
        case 'callback': return <CallbackView callbackData={callbackData} onFormChange={handleCallbackFormChange} onSubmit={handleCallbackSubmit} isLoading={isLoading} />;
        case 'ticket': return <TicketView newTicketData={newTicketData} onFormChange={handleTicketFormChange} onSubmit={handleTicketSubmit} isLoading={isLoading} />;
        case 'live_chat': 
            if (!activeLiveSession || !socketRef.current) {
                setView('home');
                setLiveChatStatus('idle');
                addToast('Live chat session ended unexpectedly.', 'error');
                return null;
            }
            return (
              <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
                <LiveChatInterface
                    sessionId={activeLiveSession.id}
                    initialHistory={activeLiveSession.history}
                    socket={socketRef.current}
                    onEndChat={() => {
                        setActiveLiveSession(null);
                        setLiveChatStatus('idle');
                        setView('home');
                    }}
                />
              </div>
            );
        default: return <HomeView faqs={faqs} onFaqClick={handleFaqClick} onContactClick={() => setView('contact')} />;
    }
  };

  const viewTitles: Record<View, string> = { home: 'Help Center', chat: 'Support Bot', contact: 'Contact Us', callback: 'Request a Callback', ticket: 'Create a Ticket', live_chat: 'Live Chat' };
  const Subtitle = () => {
    if (view === 'home') return <p className="text-xs opacity-80">How can we help you today?</p>;
    if (view === 'contact') return <p className="text-xs opacity-80">Select an option below</p>;
    if (view === 'live_chat' && activeLiveSession) return <p className="text-xs opacity-80">You are chatting with an agent</p>;
    return null;
  };

  return (
    <div className="absolute bottom-20 right-5 w-[350px] h-[550px] bg-white rounded-xl shadow-2xl flex flex-col pointer-events-auto animate-slide-in-up">
      <header className="p-4 bg-gray-800 text-white rounded-t-xl flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          {view !== 'home' && (
            <button onClick={handleBack} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="font-bold text-lg">{viewTitles[view]}</h2>
            <Subtitle />
          </div>
        </div>
        <button onClick={onClose} aria-label="Close chat">
          <X size={20} />
        </button>
      </header>
      {renderView()}
    </div>
  );
};

export default ChatWindow;