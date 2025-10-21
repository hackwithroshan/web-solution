

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { Ticket, Message, TicketStatus } from '../types';
import { fetchTicketById, sendTicketMessage, uploadAttachment } from '../services/api';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, Send, Paperclip, ArrowLeft, Image as ImageIcon, FileText } from 'lucide-react';
import { useToast } from '../hooks/useToast';

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

const ChatBubble: React.FC<{ message: Message; isOwn: boolean }> = ({ message, isOwn }) => {
    const bubbleClasses = isOwn
        ? 'bg-blue-600 text-white self-end rounded-l-lg rounded-br-lg'
        : 'bg-white text-gray-800 self-start rounded-r-lg rounded-bl-lg shadow-sm';
    
    const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

    return (
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} my-2`}>
            <div className={`max-w-md p-3 ${bubbleClasses}`}>
                {message.attachmentUrl ? (
                    message.attachmentType === 'image' ? (
                        <a href={`${API_URL}${message.attachmentUrl}`} target="_blank" rel="noopener noreferrer">
                            <img src={`${API_URL}${message.attachmentUrl}`} alt="attachment" className="rounded-md max-w-xs cursor-pointer" />
                             {message.text && <p className="mt-2 text-sm">{message.text}</p>}
                        </a>
                    ) : (
                        <a href={`${API_URL}${message.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm p-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
                           <FileText size={24} className="mr-2 flex-shrink-0" />
                           <div className="flex-grow">
                                <p className="font-semibold truncate">{message.attachmentUrl.split('/').pop()}</p>
                                {message.text && <p className="mt-1 text-xs">{message.text}</p>}
                           </div>
                        </a>
                    )
                ) : (
                    <p className="text-sm">{message.text}</p>
                )}
            </div>
            <p className="text-xs text-gray-400 mt-1 px-1">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    );
};

const UserTicketViewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { addToast } = useToast();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!id) return;

        const loadTicket = async () => {
            try {
                const data = await fetchTicketById(id);
                setTicket(data);
                setMessages(data.messages);
            } catch (error: any) {
                addToast(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadTicket();

        // Socket.IO connection
        const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
        socketRef.current = io(socketUrl);
        socketRef.current?.emit('joinTicket', id);

        socketRef.current?.on('newMessage', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [id, addToast]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !id || isSending) return;

        setIsSending(true);
        try {
            const sentMessage = await sendTicketMessage(id, newMessage);
            socketRef.current?.emit('sendMessage', { ticketId: id, message: sentMessage });
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsSending(false);
        }
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !id) return;
        const file = e.target.files[0];
        setIsSending(true);
        try {
            const sentMessage = await uploadAttachment(id, file);
            socketRef.current?.emit('sendMessage', { ticketId: id, message: sentMessage });
            setMessages(prev => [...prev, sentMessage]);
            addToast('File uploaded successfully.', 'success');
        } catch (error: any) {
             addToast(error.message || 'Failed to upload file.', 'error');
        } finally {
            setIsSending(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader className="w-12 h-12 animate-spin text-blue-700" /></div>;
    }

    if (!ticket) {
        return <div className="text-center p-8">Ticket not found.</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 flex flex-col bg-slate-50 p-4 sm:p-6 lg:p-8">
                    <div className="mb-4">
                        <Link to="/user/support" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-800">
                            <ArrowLeft size={16} className="mr-2" /> Back to Support Home
                        </Link>
                    </div>
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm flex flex-col h-full">
                            <div className="p-4 border-b">
                                <h2 className="font-bold text-lg">{ticket.subject}</h2>
                                <p className="text-sm text-gray-500">Ticket #{ticket._id.substring(ticket._id.length - 8).toUpperCase()}</p>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto">
                                {isLoading ? <div className="flex justify-center items-center h-full"><Loader className="animate-spin" /></div> : messages.map(msg => (
                                    <ChatBubble key={msg._id} message={msg} isOwn={msg.sender._id === user?._id} />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t bg-gray-50">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isSending} className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50">
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 p-2 border rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isSending || ticket.status === 'closed'}
                                    />
                                    <button type="submit" disabled={isSending || !newMessage.trim() || ticket.status === 'closed'} className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:bg-blue-300">
                                        {isSending ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 self-start">
                            <h3 className="font-bold text-lg border-b pb-3">Ticket Details</h3>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-600">Status</p>
                                <StatusBadge status={ticket.status} />
                            </div>
                             <div className="text-sm">
                                <p className="font-semibold text-gray-600">Created</p>
                                <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                            </div>
                             <div className="text-sm">
                                <p className="font-semibold text-gray-600">Assigned To</p>
                                <p>{ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserTicketViewPage;