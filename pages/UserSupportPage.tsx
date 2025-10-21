

import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../hooks/useAuth';
import { Ticket, TicketStatus, ChatMessage, MessageSender } from '../types';
import { fetchUserTickets, createTicket } from '../services/api';
import { streamMessageFromBackend } from '../services/geminiService';
import { Loader, MessageCircle, Bot, User, Send, Users, Power, List } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const statusStyles = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        closed: 'bg-gray-100 text-gray-800',
    };
    const formattedStatus = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {formattedStatus}
        </span>
    );
};


const UserSupportPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
    
    // AI Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isHandingOver, setIsHandingOver] = useState(false);


    useEffect(() => {
        if (activeTab === 'history') {
            const loadTickets = async () => {
                if (user) {
                    setIsLoadingHistory(true);
                    try {
                        const data = await fetchUserTickets();
                        setTickets(data);
                    } catch (err: any) {
                        addToast(err.message || 'Failed to fetch tickets', 'error');
                    } finally {
                        setIsLoadingHistory(false);
                    }
                }
            };
            loadTickets();
        }
    }, [user, addToast, activeTab]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const initiateHandover = async () => {
        if (isHandingOver) return;
        setIsHandingOver(true);
        addToast("Connecting you to a human agent...", "info");

        const chatHistoryText = messages.map(m => `${m.sender === 'user' ? 'User' : 'Bot'}: ${m.text}`).join('\n');
        const lastUserMessage = messages.filter(m => m.sender === 'user').pop()?.text || 'Support Request';

        try {
            const newTicket = await createTicket(lastUserMessage, `The following conversation with the AI assistant led to this request:\n\n${chatHistoryText}`);
            addToast("You are connected! A ticket has been created.", 'success');
            navigate(`/user/support/${newTicket._id}`);
        } catch (error: any) {
            addToast(error.message || 'Failed to create a ticket.', 'error');
            setIsHandingOver(false);
        }
    };


    const readStream = async (reader: ReadableStreamDefaultReader<Uint8Array>, botMessageId: string) => {
        const decoder = new TextDecoder();
        let isFirstChunk = true;
        let fullText = '';
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            fullText += decoder.decode(value, { stream: true });
            
            if (fullText.includes('[HUMAN_HANDOVER]')) {
                // Do not display the handover command
                fullText = fullText.replace('[HUMAN_HANDOVER]', '');
                setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: fullText } : m));
                initiateHandover();
                return; // Stop processing stream
            }

            if (isFirstChunk) {
                setMessages(prev => [...prev, { id: botMessageId, sender: MessageSender.BOT, text: fullText }]);
                isFirstChunk = false;
            } else {
                setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: fullText } : m));
            }
        }
    };

    const handleSend = async (prompt?: string) => {
        const messageText = prompt || input;
        if (!messageText.trim() || isLoading) return;

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
            text: "Apologies, I'm having trouble connecting. Please try again.",
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
    };
    
    const handleEndChat = () => {
        setMessages([]);
        setInput('');
        addToast("Chat session ended.", "info");
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-4 sm:p-6 lg:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Support Center</h1>
                    <div className="flex border-b border-gray-200 mb-4">
                        <button onClick={() => setActiveTab('chat')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'chat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            AI Assistant
                        </button>
                         <button onClick={() => setActiveTab('history')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            My Tickets
                        </button>
                    </div>

                    {activeTab === 'chat' && (
                        <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
                           <div className="p-4 border-b flex justify-between items-center">
                               <h2 className="font-bold text-lg text-gray-800">Chat with our AI Assistant</h2>
                               {messages.length > 0 && (
                                   <div className="flex items-center gap-2">
                                       <Button onClick={initiateHandover} variant="secondary" className="!text-sm !py-1.5 !px-3 flex items-center" disabled={isHandingOver}>
                                          <Users size={14} className="mr-1.5" /> Talk to an Agent
                                       </Button>
                                       <Button onClick={handleEndChat} variant="secondary" className="!text-sm !py-1.5 !px-3 !bg-red-50 hover:!bg-red-100 !text-red-700 flex items-center">
                                           <Power size={14} className="mr-1.5" /> End Chat
                                       </Button>
                                   </div>
                               )}
                           </div>
                           <div className="flex-1 p-4 overflow-y-auto">
                               {messages.length === 0 && (
                                   <div className="text-center text-gray-500 h-full flex flex-col justify-center items-center">
                                        <MessageCircle size={48} className="text-gray-300 mb-4" />
                                        <h3 className="font-semibold text-lg text-gray-700">Welcome to ApexNucleus Support!</h3>
                                       <p>Ask a question below to get started.</p>
                                   </div>
                               )}
                               {messages.map((msg) => (
                                    <div key={msg.id} className={`flex items-start gap-3 my-3 ${msg.sender === MessageSender.USER ? 'justify-end' : ''}`}>
                                        {msg.sender === MessageSender.BOT && <div className="bg-gray-200 p-2 rounded-full flex-shrink-0"><Bot className="w-5 h-5 text-gray-600"/></div>}
                                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === MessageSender.USER ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                        {msg.sender === MessageSender.USER && <div className="bg-gray-200 p-2 rounded-full flex-shrink-0"><User className="w-5 h-5 text-gray-600"/></div>}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-start gap-3 my-3">
                                        <div className="bg-gray-200 p-2 rounded-full"><Bot className="w-5 h-5 text-gray-600"/></div>
                                        <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 flex items-center">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" style={{ animationDelay: '0s' }}></span>
                                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></span>
                                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                           </div>
                            <div className="p-4 border-t bg-gray-50">
                                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask a question..."
                                        className="flex-1 p-2 border rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isLoading || isHandingOver}
                                    />
                                    <button type="submit" disabled={isLoading || !input.trim() || isHandingOver} className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:bg-blue-300">
                                        {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                           </div>
                        </div>
                    )}
                    
                    {activeTab === 'history' && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1">
                             {isLoadingHistory ? <div className="flex justify-center p-8 h-full items-center"><Loader className="animate-spin" /></div> : (
                                tickets.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 overflow-y-auto h-full">
                                        {tickets.map(ticket => (
                                            <li key={ticket._id}>
                                                <Link to={`/user/support/${ticket._id}`} className="block hover:bg-gray-50 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold truncate pr-2 text-gray-800">{ticket.subject}</p>
                                                        <StatusBadge status={ticket.status} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Last update: {new Date(ticket.updatedAt).toLocaleString()}</p>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center text-gray-500 h-full flex flex-col justify-center items-center">
                                        <List size={48} className="text-gray-300 mb-4" />
                                        <h3 className="font-semibold text-lg text-gray-700">No Tickets Found</h3>
                                        <p>You haven't created any support tickets yet.</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default UserSupportPage;