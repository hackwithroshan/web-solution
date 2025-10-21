import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageSender } from '../types';
import { streamMessageFromBackend } from '../services/geminiService';
import { Send, Bot, User, Loader, Home, MessageCircle, HelpCircle, CheckSquare, CheckCircle as GreenCheck, ChevronRight, X, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';


// --- Internal Sub-components for better organization ---

const HomeView: React.FC<{ onQuickLink: (prompt: string) => void }> = ({ onQuickLink }) => {
    const { user } = useAuth();
    return (
        <>
            <h1 className="text-3xl font-bold">Hello {user?.name.split(' ')[0] || 'there'}!</h1>
            <h2 className="text-3xl font-light text-gray-600">How can we help?</h2>
            
            <div className="bg-white p-4 rounded-lg shadow-sm my-4 flex items-center space-x-3">
                <GreenCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                    <p className="font-semibold">Status: All Systems Operational</p>
                    <p className="text-xs text-gray-500">Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</p>
                </div>
            </div>
             <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-bold mb-3 flex items-center"><Search size={18} className="mr-2 text-gray-500"/> Quick Help</h3>
                 <div className="space-y-2 text-sm text-gray-700">
                     <button onClick={() => onQuickLink("How do I reset my password?")} className="w-full flex justify-between items-center cursor-pointer hover:text-green-600"><span>Reset Your Password</span> <ChevronRight size={16}/></button>
                     <button onClick={() => onQuickLink("How do I see my active services?")} className="w-full flex justify-between items-center cursor-pointer hover:text-green-600"><span>View My Services</span> <ChevronRight size={16}/></button>
                     <button onClick={() => onQuickLink("How do I check my payment history?")} className="w-full flex justify-between items-center cursor-pointer hover:text-green-600"><span>Check Payment History</span> <ChevronRight size={16}/></button>
                 </div>
             </div>
         </>
    );
};

const MessagesView: React.FC<{ messages: ChatMessage[], isLoading: boolean }> = ({ messages, isLoading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <>
            {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3 my-3 ${msg.sender === MessageSender.USER ? 'justify-end' : ''}`}>
                    {msg.sender === MessageSender.BOT && <div className="bg-gray-200 p-2 rounded-full"><Bot className="w-5 h-5 text-gray-600"/></div>}
                    <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === MessageSender.USER ? 'bg-cyan-500 text-white' : 'bg-white shadow-sm'}`}>
                    <p className="text-sm">{msg.text}</p>
                    </div>
                    {msg.sender === MessageSender.USER && <div className="bg-gray-200 p-2 rounded-full"><User className="w-5 h-5 text-gray-600"/></div>}
                </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3 my-3">
                    <div className="bg-gray-200 p-2 rounded-full"><Bot className="w-5 h-5 text-gray-600"/></div>
                    <div className="max-w-[80%] p-3 rounded-lg bg-white shadow-sm flex items-center">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse mr-1" style={{ animationDelay: '0s' }}></span>
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </>
    );
};


const ChatWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'help' | 'tasks'>('home');
  const { addToast } = useToast();
  
  const readStream = async (reader: ReadableStreamDefaultReader<Uint8Array>, botMessageId: string) => {
    const decoder = new TextDecoder();
    let isFirstChunk = true;
    let fullText = '';
    
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        fullText += decoder.decode(value, { stream: true });
        
        if (isFirstChunk) {
            setMessages(prev => [...prev, { id: botMessageId, sender: MessageSender.BOT, text: fullText }]);
            isFirstChunk = false;
        } else {
            setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: fullText } : m));
        }
    }
  };

  const handleSend = async (quickPrompt?: string) => {
    const messageText = quickPrompt || input;
    if (!messageText.trim() || isLoading) return;

    setActiveTab('messages'); // Switch to messages view
    const userMessage: ChatMessage = { id: Date.now().toString(), sender: MessageSender.USER, text: messageText };
    const currentHistory = [...messages, userMessage];
    
    setMessages(currentHistory);
    setInput('');
    setIsLoading(true);

    try {
      const reader = await streamMessageFromBackend(messageText, currentHistory);
      const botMessageId = (Date.now() + 1).toString();
      await readStream(reader, botMessageId);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: MessageSender.BOT,
        text: "Apologies, an error occurred. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const BottomNavItem: React.FC<{ label: string, icon: React.ElementType, tabName: 'home' | 'messages' | 'help' | 'tasks' }> = ({ label, icon: Icon, tabName }) => (
    <button 
        onClick={() => {
            if (tabName === 'help' || tabName === 'tasks') {
                addToast('This feature is coming soon!', 'info');
            } else {
                setActiveTab(tabName)
            }
        }}
        className={`flex flex-col items-center text-sm transition-colors ${activeTab === tabName ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </button>
  );

  return (
    <div className="pointer-events-auto absolute inset-0 bg-gray-100 flex flex-col font-sans text-gray-800 sm:w-96 sm:h-[40rem] sm:rounded-lg sm:shadow-2xl sm:inset-auto sm:bottom-20 sm:right-0 sm:animate-slide-in-up">
        <div className="bg-[#122423] text-white p-4 rounded-t-lg flex justify-between items-center flex-shrink-0">
            <div className="flex items-center">
               <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/v1760926899/Untitled_design_10_kf8buw.png" alt="ApexNucleus Logo" className="h-6 w-auto" />
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white sm:hidden"><X size={24} /></button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
           {activeTab === 'home' && <HomeView onQuickLink={handleSend} />}
           {activeTab === 'messages' && <MessagesView messages={messages} isLoading={isLoading} />}
        </div>

        <div className="flex-shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t flex items-center bg-white">
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="bg-cyan-500 text-white p-2 rounded-r-md hover:bg-cyan-600 disabled:bg-gray-400">
                {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
            </form>

            <div className="bg-white p-2 border-t rounded-b-lg flex justify-around items-center text-gray-600">
                <BottomNavItem label="Home" icon={Home} tabName="home" />
                <BottomNavItem label="Messages" icon={MessageCircle} tabName="messages" />
                <BottomNavItem label="Help" icon={HelpCircle} tabName="help" />
                <BottomNavItem label="Tasks" icon={CheckSquare} tabName="tasks" />
            </div>
        </div>
    </div>
  );
};

export default ChatWindow;