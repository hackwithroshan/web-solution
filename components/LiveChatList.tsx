import React from 'react';
import Button from './ui/Button';

interface LiveChatListProps {
  chats: any[];
  onJoin: (sessionId: string) => void;
}

const LiveChatList: React.FC<LiveChatListProps> = ({ chats, onJoin }) => {
    const unassignedChats = chats.filter(c => !c.adminSocketId);
    const assignedChats = chats.filter(c => c.adminSocketId);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Active Live Chats ({unassignedChats.length} waiting)</h2>
            {chats.length > 0 ? (
                <div className="space-y-4">
                    {unassignedChats.length > 0 && 
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">Waiting for Agent</h3>
                            <ul className="space-y-3">
                                {unassignedChats.map(chat => (
                                    <li key={chat._id} className="p-3 border border-blue-200 rounded-lg flex justify-between items-center bg-blue-50">
                                        <div>
                                            <p className="font-semibold">{chat.user.name}</p>
                                            <p className="text-xs text-gray-500">Waiting since {new Date(chat.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                        <Button onClick={() => onJoin(chat._id)}>Join Chat</Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    }
                    {assignedChats.length > 0 && 
                        <div>
                             <h3 className="text-sm font-semibold text-gray-500 mb-2 mt-4">In Progress</h3>
                             <ul className="space-y-3">
                                {assignedChats.map(chat => (
                                    <li key={chat._id} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                                        <div>
                                            <p className="font-semibold">{chat.user.name}</p>
                                            <p className="text-xs text-gray-500">Chat in progress with {chat.adminName || 'an agent'}</p>
                                        </div>
                                        <Button variant="secondary" disabled>Joined</Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    }
                </div>
            ) : (
                <p className="text-gray-500 text-center py-4">There are no active chats at the moment.</p>
            )}
        </div>
    );
};

export default LiveChatList;