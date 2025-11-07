import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import { MessageSender, ChatMessage, FAQ } from '../types';
import { Send, X, Loader, Bot, Search, ChevronRight, MessageSquare, ArrowLeft, Headset, Phone, Paperclip } from 'lucide-react';
import { getChatbotResponse } from '../services/geminiService';
import { fetchPublicFAQs, createTicket, requestCallback, submitChatFeedback } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import ChatBubble from './ui/ChatBubble';
import { useToast } from '../hooks/useToast';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import LiveChatInterface from './LiveChatInterface';
import TypingIndicator from './ui/TypingIndicator';
import FeedbackView from './ui/FeedbackView';
import Input from './ui/Input';

// --- SUB-COMPONENTS ---

const GuestFormView: React.FC<{
  guestData: { name: string; phone: string };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}> = ({ guestData, onFormChange, onSubmit, isLoading }) => (
    <main className="flex-1 p-5 overflow-y-auto flex flex-col justify-center">
      <h3 className="font-semibold text-gray-800 text-center">Let's get you connected</h3>
      <p className="text-sm text-gray-500 text-center mb-6">Please provide your details to start a chat.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input name="name" placeholder="Your Name" value={guestData.name} onChange={onFormChange} required variant="light" />
        <Input name="phone" type="tel" placeholder="Your Phone Number" value={guestData.phone} onChange={onFormChange} required variant="light" />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Start Chat'}
        </Button>
      </form>
    </main>
);

const HomeView: React.FC<{
  faqs: FAQ[];
  onFaqClick: (faq: FAQ) => void;
  onContactClick: () => void;
  onRequestLiveChat: () => void;
  isConnecting: boolean;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ faqs, onFaqClick, onContactClick, onRequestLiveChat, isConnecting, searchTerm, onSearchChange }) => (
    <>
      <main className="flex-1 p-5 overflow-y-auto">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search FAQs..." 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={onSearchChange}
              aria-label="Search FAQs"
            />
        </div>
        
        <h3 className="mt-6 mb-3 font-semibold text-gray-800">Popular FAQs</h3>
        <div className="space-y-2">
            {faqs.length > 0 ? faqs.map((faq) => (
                <button onClick={() => onFaqClick(faq)} key={faq._id} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex justify-between items-center group">
                    <span className="text-sm text-gray-700">{faq.question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
            )) : <p className="text-sm text-gray-500 text-center py-4">{searchTerm ? 'No FAQs match your search.' : 'Could not load FAQs.'}</p>}
        </div>
      </main>
      <footer className="p-5 border-t bg-gray-50 text-center space-y-3">
        <button 
          onClick={onRequestLiveChat}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-2.5 rounded-full hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 w-full shadow-md disabled:from-blue-400 disabled:to-purple-400 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <Loader size={18} className="animate-spin" /> Connecting...
            </>
          ) : (
            <>
              <Headset size={18} /> Start Live Chat
            </>
          )}
        </button>
        <p className="text-gray-500 text-xs">or</p>
        <button onClick={onContactClick} className="text-blue-600 font-semibold text-sm hover:underline">
          See other contact options
        </button>
      </footer>
    </>
);

const ContactView: React.FC<{
  onRequestLiveChat: () => void;
  onCallbackClick: () => void;
  onTicketClick: () => void;
  isConnecting: boolean;
}> = ({ onRequestLiveChat, onCallbackClick, onTicketClick, isConnecting }) => (
    <div className="p-5 flex flex-col justify-center h-full">
        <div className="space-y-3 text-center">
            <p className="text-gray-600 mb-4">How would you like to get in touch?</p>
            <button onClick={onRequestLiveChat} disabled={isConnecting} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed">
                <Headset className="text-blue-600 text-xl flex-shrink-0" />
                <div>
                    <p className="font-medium text-gray-800">{isConnecting ? 'Connecting...' : 'Chat with an Agent'}</p>
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

const FilePreview: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => (
    <div className="p-2 border-t bg-white flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
            <img src={URL.createObjectURL(file)} alt="preview" className="w-10 h-10 rounded object-cover flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">{file.name}</span>
        </div>
        <button onClick={onRemove} className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-2">
            <X size={18} />
        </button>
    </div>
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
    selectedFile: File | null;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileRemove: () => void;
}> = ({ messages, input, onInputChange, onKeyDown, onSubmit, isLoading, textareaRef, messagesEndRef, selectedFile, onFileSelect, onFileRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
    <>
        <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => {
                const prevMsg = messages[index-1];
                const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;
                return (
                    <ChatBubble key={msg.id} message={msg} isOwn={msg.sender === MessageSender.USER} showAvatar={showAvatar} />
                )
            })}
            {isLoading && <TypingIndicator senderType="bot" />}
            <div ref={messagesEndRef} />
        </main>
        <footer className="border-t bg-white">
            {selectedFile && <FilePreview file={selectedFile} onRemove={onFileRemove} />}
            <div className="p-3">
                <form onSubmit={onSubmit} className="flex items-end gap-2">
                    <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" accept="image/*" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="p-2 text-gray-500 hover:text-blue-600 self-end mb-1 flex-shrink-0" aria-label="Attach file">
                        <Paperclip size={20} />
                    </button>
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
                        aria-label="Chat input"
                    />
                    <button type="submit" disabled={isLoading || (!input.trim() && !selectedFile)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-300 disabled:to-purple-300 self-end mb-1 flex-shrink-0 shadow" aria-label="Send message">
                        {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5"/>}
                    </button>
                </form>
            </div>
        </footer>
    </>
    );
};

interface ChatWindowProps {
  onClose: () => void;
}

export interface ChatWindowRef {
  handleCloseAttempt: () => void;
}

const ChatWindow = forwardRef<ChatWindowRef, ChatWindowProps>(({ onClose }, ref) => {
  type View = 'guest_form' | 'home' | 'chat' | 'contact' | 'callback' | 'ticket' | 'live_chat' | 'feedback';
  
  const { user } = useAuth();
  const [view, setView] = useState<View>(user ? 'live_chat' : 'guest_form');
  const [isConnecting, setIsConnecting] = useState(!!user);

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqSearchTerm, setFaqSearchTerm] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addToast } = useToast();
  
  const socketRef = useRef<Socket | null>(null);
  const [activeLiveSession, setActiveLiveSession] = useState<{ id: string, user: any, history: ChatMessage[] } | null>(null);
  const [chatTypeForFeedback, setChatTypeForFeedback] = useState<'bot' | 'live_chat' | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const [guestData, setGuestData] = useState({ name: '', phone: '' });
  const [callbackData, setCallbackData] = useState({ phone: user?.phone || '', message: '' });
  const [newTicketData, setNewTicketData] = useState({ subject: '', message: '' });

  const filteredFaqs = useMemo(() => {
    if (!faqSearchTerm.trim()) return faqs;
    return faqs.filter(faq => faq.question.toLowerCase().includes(faqSearchTerm.toLowerCase()));
  }, [faqs, faqSearchTerm]);

  const triggerFeedback = (chatType: 'bot' | 'live_chat') => {
    setChatTypeForFeedback(chatType);
    setView('feedback');
  };
  
  const handleRequestLiveChat = useCallback(() => {
    if (!socketRef.current || !user) return;
    
    setIsConnecting(true);
    
    socketRef.current.emit('requestLiveChat', { user: { _id: user._id, name: user.name }, history: messagesRef.current }, (sessionData: any) => {
        setIsConnecting(false);
        if (sessionData) {
            const initialSystemMessage: ChatMessage = {
                id: `system-initial-${Date.now()}`,
                sender: MessageSender.BOT,
                text: "You've been connected for live chat. An agent will be with you shortly.",
                timestamp: new Date().toISOString()
            };
            setActiveLiveSession({
                ...sessionData,
                history: [...sessionData.history, initialSystemMessage]
            });
            setView('live_chat');
        } else {
            addToast('Could not start a live chat session. No agents seem to be available. Please try again later.', 'error');
            setView('home');
        }
    });
  }, [user, addToast]);

  const handleGuestSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!socketRef.current) return;
      setIsConnecting(true);

      socketRef.current.emit('requestGuestLiveChat', { guestInfo: guestData, history: messagesRef.current }, (sessionData: any) => {
          setIsConnecting(false);
          if (sessionData) {
              const initialSystemMessage: ChatMessage = {
                  id: `system-initial-${Date.now()}`,
                  sender: MessageSender.BOT,
                  text: "You've been connected for live chat. An agent will be with you shortly.",
                  timestamp: new Date().toISOString()
              };
              setActiveLiveSession({
                  ...sessionData,
                  history: [...sessionData.history, initialSystemMessage]
              });
              setView('live_chat');
          } else {
              addToast('Could not start a live chat session. No agents seem to be available. Please try again later.', 'error');
              setView('home');
          }
      });
  };

  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    const socket = io(socketUrl);
    socketRef.current = socket;

    const handleSessionEnded = () => {
        addToast("The live chat session has ended.", "info");
        setActiveLiveSession(null);
        triggerFeedback('live_chat');
    };

    socket.on('chatSessionEnded', handleSessionEnded);
    
    if (user) {
        handleRequestLiveChat();
    } else {
        setIsConnecting(false);
    }
    
    return () => { 
        socket.off('chatSessionEnded', handleSessionEnded);
        socket.disconnect(); 
    };
  }, [user, addToast, handleRequestLiveChat]);


  const handleCallbackFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setCallbackData(prev => ({ ...prev, [e.target.name]: e.target.value })); }, []);
  const handleTicketFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setNewTicketData(prev => ({ ...prev, [e.target.name]: e.target.value })); }, []);

  const handleCloseAttempt = useCallback(() => {
    const isChattingWithBot = view === 'chat' && (messages.length > 1 || selectedFile);
    const isLiveChatting = view === 'live_chat';

    if (isChattingWithBot) { triggerFeedback('bot'); } 
    else if (isLiveChatting) {
        if (window.confirm('Are you sure you want to end this chat session?')) {
            if (socketRef.current && activeLiveSession) {
                socketRef.current.emit('endLiveChat', activeLiveSession.id);
            }
        }
    } else {
        onClose();
    }
  }, [view, messages, activeLiveSession, onClose, selectedFile]);

  useImperativeHandle(ref, () => ({ handleCloseAttempt }));

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
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);
  
  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    let userMessage: ChatMessage;
    if (selectedFile) {
        userMessage = { 
            id: uuidv4(), sender: MessageSender.USER, text: input, timestamp: new Date().toISOString(), status: 'sent',
            attachment: { url: URL.createObjectURL(selectedFile), name: selectedFile.name, type: 'image' }
        };
    } else {
        userMessage = { id: uuidv4(), sender: MessageSender.USER, text: input, timestamp: new Date().toISOString(), status: 'sent' };
    }
    setMessages(prev => [...prev, userMessage]);
    
    const fileToSend = selectedFile;
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const botResponseText = await getChatbotResponse(input, messages, fileToSend);
      setMessages(prev => [...prev, { id: uuidv4(), sender: MessageSender.BOT, text: botResponseText, timestamp: new Date().toISOString() }]);
    } catch (error) {
       setMessages(prev => [...prev, { id: uuidv4(), sender: MessageSender.BOT, text: "Sorry, I couldn't process that. Please try again.", timestamp: new Date().toISOString() }]);
    } finally {
        setIsLoading(false);
    }
  }, [input, isLoading, messages, selectedFile]);
  
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
    } catch (error: any) { addToast(error.message || 'Failed to send request.', 'error'); } 
    finally { setIsLoading(false); }
  }, [callbackData, addToast, user]);

  const handleTicketSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        await createTicket(newTicketData.subject, newTicketData.message);
        addToast("Support ticket created successfully!", 'success');
        setNewTicketData({ subject: '', message: '' });
        setView('home');
    } catch (error: any) { addToast(error.message || 'Failed to create ticket.', 'error'); }
    finally { setIsLoading(false); }
  }, [newTicketData, addToast]);

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!chatTypeForFeedback) return;
    setIsSubmittingFeedback(true);
    try {
        await submitChatFeedback({
            chatType: chatTypeForFeedback, rating, comment,
            sessionId: (chatTypeForFeedback === 'live_chat' && activeLiveSession) ? activeLiveSession.id : undefined
        });
        addToast("Thank you for your feedback!", 'success');
    } catch (error: any) { addToast(error.message || 'Could not submit feedback.', 'error'); }
    finally {
        setIsSubmittingFeedback(false);
        onClose();
    }
  };

  const handleBack = useCallback(() => {
      if (view === 'live_chat' || view === 'feedback' || view === 'guest_form') return;
      setView(user ? 'home' : 'guest_form'); // Go back to guest form if not logged in
  }, [view, user]);

  const handleChatInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => { setInput(e.target.value); }, []);
  const handleChatInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (input.trim() || selectedFile)) {
        (e.currentTarget.form as HTMLFormElement).requestSubmit();
      }
    }
  }, [isLoading, input, selectedFile]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) { setSelectedFile(file); } 
    else if (file) { addToast('Please select an image file.', 'error'); }
  };

  const renderView = () => {
    switch(view) {
        case 'guest_form': return <GuestFormView guestData={guestData} onFormChange={(e) => setGuestData(prev => ({...prev, [e.target.name]: e.target.value}))} onSubmit={handleGuestSubmit} isLoading={isConnecting} />;
        case 'home': return <HomeView faqs={filteredFaqs} onFaqClick={handleFaqClick} onContactClick={() => setView('contact')} onRequestLiveChat={handleRequestLiveChat} isConnecting={isConnecting} searchTerm={faqSearchTerm} onSearchChange={e => setFaqSearchTerm(e.target.value)} />;
        case 'chat': return <ChatView messages={messages} input={input} onInputChange={handleChatInputChange} onKeyDown={handleChatInputKeyDown} onSubmit={handleSend} isLoading={isLoading} textareaRef={textareaRef} messagesEndRef={messagesEndRef} selectedFile={selectedFile} onFileSelect={handleFileSelect} onFileRemove={() => setSelectedFile(null)} />;
        case 'contact': return <ContactView onRequestLiveChat={handleRequestLiveChat} onCallbackClick={() => setView('callback')} onTicketClick={() => setView('ticket')} isConnecting={isConnecting} />;
        case 'callback': return <CallbackView callbackData={callbackData} onFormChange={handleCallbackFormChange} onSubmit={handleCallbackSubmit} isLoading={isLoading} />;
        case 'ticket': return <TicketView newTicketData={newTicketData} onFormChange={handleTicketFormChange} onSubmit={handleTicketSubmit} isLoading={isLoading} />;
        case 'live_chat': 
            if (isConnecting) {
                return (
                    <div className="flex-1 flex flex-col justify-center items-center p-5">
                        <Loader className="animate-spin w-8 h-8 text-blue-500" />
                        <p className="mt-4 text-gray-600">Connecting to a support agent...</p>
                    </div>
                );
            }
            if (!activeLiveSession || !socketRef.current) {
                // This state can happen if connection fails after initial attempt. Fall back to home.
                return <HomeView faqs={filteredFaqs} onFaqClick={handleFaqClick} onContactClick={() => setView('contact')} onRequestLiveChat={handleRequestLiveChat} isConnecting={false} searchTerm={faqSearchTerm} onSearchChange={e => setFaqSearchTerm(e.target.value)} />;
            }
            return (
              <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
                <LiveChatInterface
                    sessionId={activeLiveSession.id}
                    initialHistory={activeLiveSession.history}
                    socket={socketRef.current}
                    onEndChat={handleCloseAttempt}
                    user={activeLiveSession.user}
                />
              </div>
            );
        case 'feedback': 
            if (!chatTypeForFeedback) { onClose(); return null; }
            return <FeedbackView chatType={chatTypeForFeedback} onSubmit={handleFeedbackSubmit} onSkip={onClose} isSubmitting={isSubmittingFeedback} />;
        default: return <HomeView faqs={faqs} onFaqClick={handleFaqClick} onContactClick={() => setView('contact')} onRequestLiveChat={handleRequestLiveChat} isConnecting={isConnecting} searchTerm={faqSearchTerm} onSearchChange={e => setFaqSearchTerm(e.target.value)} />;
    }
  };

  const viewTitles: Record<View, string> = { guest_form: 'Live Support', home: 'Help Center', chat: 'Support Bot', contact: 'Contact Us', callback: 'Request a Callback', ticket: 'Create a Ticket', live_chat: 'Live Chat', feedback: 'Provide Feedback' };
  const Subtitle = () => {
    if (view === 'home') return <p className="text-xs opacity-80">How can we help you today?</p>;
    if (view === 'guest_form') return <p className="text-xs opacity-80">Connect with an agent</p>;
    if (view === 'contact') return <p className="text-xs opacity-80">Select an option below</p>;
    if (view === 'live_chat' && activeLiveSession) return <p className="text-xs opacity-80">You are chatting with an agent</p>;
    if (view === 'live_chat' && isConnecting) return <p className="text-xs opacity-80">Please wait a moment...</p>;
    if (view === 'feedback') return <p className="text-xs opacity-80">Your opinion is important to us</p>;
    return null;
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:absolute sm:bottom-20 sm:right-5 sm:w-[350px] sm:h-[550px] bg-white sm:rounded-xl shadow-2xl flex flex-col pointer-events-auto animate-slide-in-up">
      <header className="p-4 bg-gray-800 text-white sm:rounded-t-xl flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          {view !== 'home' && view !== 'live_chat' && view !== 'feedback' && view !== 'guest_form' && (
            <button onClick={handleBack} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="font-bold text-lg">{viewTitles[view]}</h2>
            <Subtitle />
          </div>
        </div>
        {view !== 'feedback' && (
            <button onClick={handleCloseAttempt} aria-label="Close chat">
              <X size={20} />
            </button>
        )}
      </header>
      {renderView()}
    </div>
  );
});

export default ChatWindow;