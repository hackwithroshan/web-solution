import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Ticket, TicketStatus, TicketPriority, ChatMessage } from '../types';
import { fetchAllTickets, fetchAdminLiveChats } from '../services/api';
import SupportSidebar from '../components/SupportSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Search, Inbox, Edit, CheckSquare, XCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import LiveChatInterface from '../components/LiveChatInterface';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import LiveChatList from '../components/LiveChatList';

// --- Skeleton Components ---
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 ${className}`} />
);

const StatCardSkeleton: React.FC = () => (
    <div className="bg-white p-5 rounded-xl shadow-sm">
        <Skeleton className="h-6 w-1/3 mb-2 rounded" />
        <Skeleton className="h-8 w-1/4 rounded" />
    </div>
);

const TableRowSkeleton: React.FC = () => (
    <tr>
        <td className="px-6 py-4"><Skeleton className="h-5 w-4/5 rounded" /></td>
        <td className="px-6 py-4"><Skeleton className="h-5 w-2/3 rounded" /></td>
        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
        <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
        <td className="px-6 py-4"><Skeleton className="h-5 w-3/4 rounded" /></td>
        <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded" /></td>
    </tr>
);

// --- UI Components ---
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

const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
    const priorityStyles = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-orange-100 text-orange-800',
        high: 'bg-red-100 text-red-800',
    };
     const formattedPriority = priority.charAt(0).toUpperCase() + priority.slice(1);
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityStyles[priority]}`}>
            {formattedPriority}
        </span>
    );
};

const StatCard: React.FC<{ title: string; count: number; icon: React.ElementType; color: string; onClick: () => void; isActive: boolean }> = ({ title, count, icon: Icon, color, onClick, isActive }) => (
    <button onClick={onClick} className={`text-left bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-2 ${isActive ? color : 'border-transparent'}`}>
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
            <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-3xl font-bold mt-1 text-gray-800">{count}</p>
    </button>
);

const SupportDashboardPage: React.FC = () => {
    const { user: supportUser } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { addToast } = useToast();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
    const [sortBy, setSortBy] = useState('updatedAt-desc');
    
    const socketRef = useRef<Socket | null>(null);
    const [activeChats, setActiveChats] = useState<any[]>([]);
    const [activeLiveSession, setActiveLiveSession] = useState<{ id: string, user: any, history: ChatMessage[] } | null>(null);

    useEffect(() => {
        const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
        socketRef.current = io(socketUrl);
        socketRef.current.emit('adminJoinSupport');

        socketRef.current.on('chatSessionStarted', (sessionData) => {
            setActiveLiveSession(sessionData);
        });
        
        socketRef.current.on('newLiveChatRequest', (newChat) => {
            addToast(`New live chat request from ${newChat.user.name}`, 'info');
            setActiveChats(prev => {
                if (prev.some(c => c._id === newChat.id)) return prev;
                return [...prev, { ...newChat, _id: newChat.id }];
            });
        });

        socketRef.current.on('chatSessionTaken', ({ sessionId, adminName }) => {
            setActiveChats(prev => prev.map(chat => 
                chat._id === sessionId ? { ...chat, adminSocketId: 'taken', adminName } : chat
            ));
        });

        socketRef.current.on('chatSessionClosed', (sessionId) => {
            setActiveChats(prev => prev.filter(chat => chat._id !== sessionId));
        });


        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [ticketList, chatList] = await Promise.all([fetchAllTickets(), fetchAdminLiveChats()]);
                setTickets(ticketList);
                setActiveChats(chatList);
            } catch (err: any) {
                addToast(err.message || 'Failed to fetch initial support data', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadInitialData();

        const pollingInterval = setInterval(async () => {
            try {
                const chatList = await fetchAdminLiveChats();
                setActiveChats(chatList);
            } catch (error) {
                console.error("Polling for active chats failed:", error);
            }
        }, 7000);

        return () => {
            socketRef.current?.disconnect();
            clearInterval(pollingInterval);
        };
    }, [addToast]);

    const handleJoinChat = (sessionId: string) => {
        socketRef.current?.emit('adminJoinsChat', { sessionId, adminUser: supportUser });
    };

    const ticketStats = useMemo(() => {
        return tickets.reduce((acc, ticket) => {
            if (ticket.status === 'open') acc.open++;
            else if (ticket.status === 'in_progress') acc.in_progress++;
            else if (ticket.status === 'closed') acc.closed++;
            return acc;
        }, { open: 0, in_progress: 0, closed: 0 });
    }, [tickets]);
    
    const filteredAndSortedTickets = useMemo(() => {
        let filtered = [...tickets];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(ticket => ticket.status === statusFilter);
        }
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
        }

        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(ticket => 
                ticket.subject.toLowerCase().includes(lowercasedTerm) ||
                (ticket.user?.name && ticket.user.name.toLowerCase().includes(lowercasedTerm)) ||
                ticket._id.toLowerCase().includes(lowercasedTerm)
            );
        }

        filtered.sort((a, b) => {
            const dateA = new Date(sortBy.includes('updatedAt') ? a.updatedAt : a.createdAt).getTime();
            const dateB = new Date(sortBy.includes('updatedAt') ? b.updatedAt : b.createdAt).getTime();
            return sortBy.endsWith('desc') ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [tickets, searchTerm, statusFilter, priorityFilter, sortBy]);

    const renderTicketContent = () => {
        if (isLoading) {
            return (
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
                    </tbody>
                </table>
            );
        }
        if (filteredAndSortedTickets.length === 0) {
            return (
                <div className="text-center py-16">
                    <Inbox size={40} className="mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-800">No Tickets Found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                       No tickets match your current filters.
                    </p>
                </div>
            );
        }
        return (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedTickets.map(ticket => (
                        <tr key={ticket._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.user?.name || 'Deleted User'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={ticket.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><PriorityBadge priority={ticket.priority} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.updatedAt).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link to={`/admin/support/${ticket._id}`} className="text-cyan-600 hover:text-cyan-900">View</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
    
    if (activeLiveSession) {
        return (
             <div className="flex h-screen bg-gray-100 font-sans">
                <SupportSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                    <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                    <main className="flex-1 flex flex-col bg-slate-50 p-6 lg:p-8">
                         <LiveChatInterface
                            sessionId={activeLiveSession.id}
                            initialHistory={activeLiveSession.history}
                            socket={socketRef.current!}
                            onEndChat={async () => {
                                setActiveLiveSession(null);
                                addToast("Live chat ended.", "info");
                                try {
                                    const chats = await fetchAdminLiveChats();
                                    setActiveChats(chats);
                                } catch (err) {
                                    console.error("Failed to fetch active chats after ending session", err);
                                }
                            }}
                            isAdmin
                        />
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <SupportSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Support Dashboard</h1>
                        <p className="mt-1 text-gray-600">Overview and management of all support tickets and live chats.</p>
                    </div>

                    <div className="mb-8">
                        <LiveChatList chats={activeChats} onJoin={handleJoinChat} />
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-6">Support Tickets</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {isLoading ? <>
                            <StatCardSkeleton/>
                            <StatCardSkeleton/>
                            <StatCardSkeleton/>
                        </> : <>
                            <StatCard title="Open Tickets" count={ticketStats.open} icon={XCircle} color="border-blue-500" onClick={() => setStatusFilter(prev => prev === 'open' ? 'all' : 'open')} isActive={statusFilter === 'open'} />
                            <StatCard title="In Progress" count={ticketStats.in_progress} icon={Edit} color="border-yellow-500" onClick={() => setStatusFilter(prev => prev === 'in_progress' ? 'all' : 'in_progress')} isActive={statusFilter === 'in_progress'} />
                            <StatCard title="Closed" count={ticketStats.closed} icon={CheckSquare} color="border-gray-500" onClick={() => setStatusFilter(prev => prev === 'closed' ? 'all' : 'closed')} isActive={statusFilter === 'closed'} />
                        </>
                        }
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by subject, user, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                <option value="all">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                <option value="updatedAt-desc">Last Updated (Newest)</option>
                                <option value="updatedAt-asc">Last Updated (Oldest)</option>
                                <option value="createdAt-desc">Created Date (Newest)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                        {renderTicketContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SupportDashboardPage;