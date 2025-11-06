import React from 'react';
import { Search, Inbox, Send, Archive, CircleDot, User, Clock, Pause } from 'lucide-react';

interface ChatListPanelProps {
    chats: any[];
    onSelect: (chat: any) => void;
    activeSessionId?: string | null;
    activeInboxFilter: string;
    setActiveInboxFilter: (filter: string) => void;
    activeStatusFilter: string;
    setActiveStatusFilter: (filter: string) => void;
    counts: {
        unassigned: number;
        assignedToMe: number;
        agent: number;
        awaitingAgent: number;
        paused: number;
    }
}

const FilterItem: React.FC<{ icon: React.ElementType, label: string, count?: number, isActive?: boolean, onClick: () => void }> = ({ icon: Icon, label, count, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full flex justify-between items-center px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-100'}`}>
        <div className="flex items-center gap-3">
            <Icon size={16} />
            <span>{label}</span>
        </div>
        {count !== undefined && <span className="text-xs text-gray-500 font-semibold">{count}</span>}
    </button>
);


const ChatListItem: React.FC<{ chat: any; onSelect: (chat: any) => void; isActive: boolean }> = ({ chat, onSelect, isActive }) => {
    const isWaiting = chat.status === 'waiting' || !chat.status;
    return (
        <li
            onClick={() => onSelect(chat)}
            className={`p-3 flex gap-3 cursor-pointer rounded-lg border-l-4 ${isActive ? 'bg-blue-50 border-blue-500' : 'border-transparent hover:bg-gray-50'}`}
        >
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                {chat.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-start">
                    <p className="font-bold text-sm text-black truncate">{chat.user.name}</p>
                    {isWaiting && (
                        <span className="flex-shrink-0 ml-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">1</span>
                    )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                    {isWaiting ? "New chat request..." : `In progress with ${chat.admin?.name || 'an agent'}`}
                </p>
            </div>
        </li>
    );
};


const ChatListPanel: React.FC<ChatListPanelProps> = ({ chats, onSelect, activeSessionId, activeInboxFilter, setActiveInboxFilter, activeStatusFilter, setActiveStatusFilter, counts }) => {
    
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold text-xl text-black">Chat</h2>
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search chat..." className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
            </div>

            {/* Filters and List */}
            <div className="flex-1 overflow-y-auto p-2">
                {/* Filters */}
                <div className="px-2 mb-4">
                     <div className="flex justify-between items-center mb-2 mt-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Inbox</h3>
                     </div>
                     <FilterItem icon={Inbox} label="All" isActive={activeInboxFilter === 'All'} onClick={() => setActiveInboxFilter('All')} />
                     <FilterItem icon={Send} label="Assigned to me" count={counts.assignedToMe} isActive={activeInboxFilter === 'Assigned to me'} onClick={() => setActiveInboxFilter('Assigned to me')} />
                     <FilterItem icon={Archive} label="Unassigned" count={counts.unassigned} isActive={activeInboxFilter === 'Unassigned'} onClick={() => setActiveInboxFilter('Unassigned')} />
                </div>
                
                 <div className="px-2 mb-4">
                     <div className="flex justify-between items-center mb-2 mt-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Status</h3>
                     </div>
                     <FilterItem icon={CircleDot} label="All" count={counts.agent + counts.awaitingAgent} isActive={activeStatusFilter === 'All'} onClick={() => setActiveStatusFilter('All')} />
                     <FilterItem icon={User} label="Agent" count={counts.agent} isActive={activeStatusFilter === 'Agent'} onClick={() => setActiveStatusFilter('Agent')} />
                     <FilterItem icon={Clock} label="Awaiting agent" count={counts.awaitingAgent} isActive={activeStatusFilter === 'Awaiting agent'} onClick={() => setActiveStatusFilter('Awaiting agent')} />
                     <FilterItem icon={Pause} label="Paused" count={counts.paused} isActive={activeStatusFilter === 'Paused'} onClick={() => setActiveStatusFilter('Paused')} />
                </div>
                
                {/* Chat List */}
                <ul className="space-y-1">
                    {chats.map(chat => (
                        <ChatListItem
                            key={chat._id}
                            chat={chat}
                            onSelect={onSelect}
                            isActive={chat._id === activeSessionId}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ChatListPanel;