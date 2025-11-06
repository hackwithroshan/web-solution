import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '../types';
import { fetchAdminLiveChats, fetchAdminLiveChatById } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, MessageSquareText, User as UserIcon } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import LiveChatInterface from '../components/LiveChatInterface';
import ChatListPanel from '../components/ChatListPanel';
import UserDetailsPanel from '../components/UserDetailsPanel';
import { useAuth } from '../hooks/useAuth';

const AdminSupportPage: React.FC = () => {
    const { user: adminUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { addToast } = useToast();
    
    const socketRef = useRef<Socket | null>(null);
    const [liveChats, setLiveChats] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<{ id: string, user: any, history: ChatMessage[], admin?: any } | null>(null);
    const notificationSoundRef = useRef(new Audio('https://res.cloudinary.com/dvrqft9ov/video/upload/v1761992826/mixkit-software-interface-start-2574_nsv3uq.wav'));
    const [isRinging, setIsRinging] = useState(false);

    // State for filters
    const [activeInboxFilter, setActiveInboxFilter] = useState('All');
    const [activeStatusFilter, setActiveStatusFilter] = useState('All');

    // Request notification permission on mount
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const showBrowserNotification = (title: string, body: string) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body });
        }
    };
    
    const handleSelectChat = useCallback(async (chat: any) => {
        if (chat.status === 'waiting') {
            socketRef.current?.emit('adminJoinsChat', { sessionId: chat._id, adminUser });
        } else {
            // It's an active chat, being handled by someone (maybe this agent, maybe another)
            // Fetch the full history to view it
            try {
                const fullSession = await fetchAdminLiveChatById(chat._id);
                setSelectedSession({
                    id: fullSession._id,
                    user: fullSession.user,
                    history: fullSession.history,
                    admin: fullSession.admin
                });
            } catch (err: any) {
                addToast(err.message || 'Could not load chat history.', 'error');
            }
        }
    }, [adminUser, addToast]);

    const handleEndChat = useCallback(() => {
        if (socketRef.current && selectedSession) {
            socketRef.current.emit('endLiveChat', selectedSession.id);
        }
        // UI will update via 'chatSessionEnded' event from server
    }, [selectedSession]);
    
    const handlePushChat = useCallback(() => {
        if (socketRef.current && selectedSession) {
            if (window.confirm('Are you sure you want to return this chat to the queue?')) {
                socketRef.current.emit('adminLeavesChat', selectedSession.id);
            }
        }
    }, [selectedSession]);

    useEffect(() => {
        const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
        const socket = io(socketUrl);
        socketRef.current = socket;
        
        socket.emit('adminJoinSupport');

        const handleNewChat = (newChat: any) => {
            addToast(`New chat request from ${newChat.user.name}`, 'info');
            showBrowserNotification('New Chat Request', `From: ${newChat.user.name}`);
            setLiveChats(prev => {
                if (prev.some(c => c._id === newChat._id)) return prev;
                return [...prev, newChat];
            });
        };

        const handleChatTaken = ({ sessionId, admin }: { sessionId: string; admin: any }) => {
            setLiveChats(prev => prev.map(c => 
                c._id === sessionId ? { ...c, status: 'active', admin: admin } : c
            ));
        };

        const handleChatClosed = (sessionId: string) => {
            setLiveChats(prev => prev.filter(c => c._id !== sessionId));
            setSelectedSession(prev => (prev?.id === sessionId ? null : prev));
        };

        const handleSessionStart = (sessionData: any) => {
            setSelectedSession(sessionData);
            setLiveChats(prev => prev.filter(c => c._id !== sessionData.id));
        };

        const handleSessionEnded = () => {
            addToast("The live chat session has ended.", "info");
            setSelectedSession(null);
        };
        
        socket.on('newLiveChatRequest', handleNewChat);
        socket.on('chatSessionTaken', handleChatTaken);
        socket.on('chatSessionClosed', handleChatClosed);
        socket.on('chatSessionStarted', handleSessionStart);
        socket.on('chatSessionEnded', handleSessionEnded);

        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const chatList = await fetchAdminLiveChats();
                setLiveChats(chatList);
            } catch (err: any) {
                addToast(err.message || 'Failed to fetch support data', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadInitialData();

        return () => {
            socket.off('newLiveChatRequest', handleNewChat);
            socket.off('chatSessionTaken', handleChatTaken);
            socket.off('chatSessionClosed', handleChatClosed);
            socket.off('chatSessionStarted', handleSessionStart);
            socket.off('chatSessionEnded', handleSessionEnded);
            socket.disconnect();
        };
    }, [addToast]);

    // Effect to control the looping notification sound
    useEffect(() => {
        const waitingChats = liveChats.filter(c => c.status === 'waiting').length;
        const isAdminInChat = !!selectedSession;

        if (waitingChats > 0 && !isAdminInChat) {
            setIsRinging(true);
        } else {
            setIsRinging(false);
        }
    }, [liveChats, selectedSession]);

    // Effect to play/pause audio based on isRinging state
    useEffect(() => {
        const audio = notificationSoundRef.current;
        audio.loop = true;

        if (isRinging) {
            audio.play().catch(error => console.log("Audio loop failed:", error));
        } else {
            audio.pause();
            audio.currentTime = 0;
        }

        return () => { // Cleanup on unmount
            audio.pause();
            audio.currentTime = 0;
        };
    }, [isRinging]);

    const counts = useMemo(() => ({
        unassigned: liveChats.filter(c => c.status === 'waiting').length,
        assignedToMe: liveChats.filter(c => c.status === 'active' && c.admin?._id === adminUser?._id).length,
        agent: liveChats.filter(c => c.status === 'active').length,
        awaitingAgent: liveChats.filter(c => c.status === 'waiting').length,
        paused: 0,
    }), [liveChats, adminUser]);

    const filteredChats = useMemo(() => {
        let chats = [...liveChats];

        // Apply Inbox Filter
        switch (activeInboxFilter) {
            case 'Assigned to me':
                chats = chats.filter(chat => chat.admin?._id === adminUser?._id && chat.status === 'active');
                break;
            case 'Unassigned':
                chats = chats.filter(chat => chat.status === 'waiting');
                break;
        }

        // Apply Status Filter
        switch (activeStatusFilter) {
            case 'Agent':
                chats = chats.filter(chat => chat.status === 'active');
                break;
            case 'Awaiting agent':
                chats = chats.filter(chat => chat.status === 'waiting');
                break;
            case 'Paused':
                chats = []; 
                break;
        }
        
        return chats;
    }, [liveChats, activeInboxFilter, activeStatusFilter, adminUser]);

    const isReadOnly = useMemo(() => {
        if (!selectedSession || !adminUser) return true;
        // If the chat is active but has no admin assigned (e.g., due to a disconnect), the current admin should be able to take it.
        if (!selectedSession.admin) return false; 
        return selectedSession.admin._id !== adminUser._id;
    }, [selectedSession, adminUser]);

    return (
        <div className="flex h-screen bg-dashboard">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-hidden">
                    <div className="h-full grid grid-cols-12">
                        {/* Left Panel: Chat List */}
                        <div className="col-span-12 md:col-span-4 lg:col-span-3 h-full border-r border-gray-200 bg-white overflow-y-auto">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader className="animate-spin w-8 h-8 text-gray-400" />
                                </div>
                            ) : (
                                <ChatListPanel
                                    chats={filteredChats}
                                    onSelect={handleSelectChat}
                                    activeSessionId={selectedSession?.id}
                                    activeInboxFilter={activeInboxFilter}
                                    setActiveInboxFilter={setActiveInboxFilter}
                                    activeStatusFilter={activeStatusFilter}
                                    setActiveStatusFilter={setActiveStatusFilter}
                                    counts={counts}
                                />
                            )}
                        </div>

                        {/* Center Panel: Conversation */}
                        <div className="col-span-12 md:col-span-8 lg:col-span-6 h-full flex flex-col bg-slate-50">
                            {selectedSession && socketRef.current ? (
                                <LiveChatInterface
                                    key={selectedSession.id}
                                    sessionId={selectedSession.id}
                                    initialHistory={selectedSession.history}
                                    socket={socketRef.current}
                                    onEndChat={handleEndChat}
                                    user={selectedSession.user}
                                    isAdmin
                                    isReadOnly={isReadOnly}
                                    onPushChat={handlePushChat}
                                />
                            ) : (
                                <div className="flex flex-col justify-center items-center h-full text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="p-4 bg-gray-200 rounded-full mb-4">
                                        <MessageSquareText size={32} className="text-gray-500" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800">Select a conversation</h2>
                                    <p className="text-sm text-gray-500 max-w-xs mt-1">
                                        Choose a chat from the left panel to start a conversation or view details.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Panel: User Details */}
                        <div className="hidden lg:block lg:col-span-3 h-full border-l border-gray-200 bg-white">
                            {selectedSession ? (
                                <UserDetailsPanel user={selectedSession.user} />
                            ) : (
                                 <div className="flex flex-col justify-center items-center h-full text-center p-4">
                                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                                        <UserIcon size={32} className="text-gray-400" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-700">User Details</h2>
                                    <p className="text-sm text-gray-500 max-w-xs mt-1">
                                        Details will appear here when you select a chat.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminSupportPage;