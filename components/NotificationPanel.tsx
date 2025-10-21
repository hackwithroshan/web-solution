import React from 'react';
import { Notification } from '../types';
import { Bell, Info, CreditCard, HelpCircle, Server } from 'lucide-react';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

interface NotificationPanelProps {
    notifications: Notification[];
    onUpdate: (updatedNotifications: Notification[]) => void;
    onClose: () => void;
}

const typeIcons = {
    announcement: <Info className="w-5 h-5 text-blue-500" />,
    billing: <CreditCard className="w-5 h-5 text-green-500" />,
    support: <HelpCircle className="w-5 h-5 text-yellow-500" />,
    service: <Server className="w-5 h-5 text-purple-500" />,
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onUpdate, onClose }) => {

    const handleMarkAsRead = async (id: string) => {
        const optimisticUpdate = notifications.map(n => n._id === id ? { ...n, isRead: true } : n);
        onUpdate(optimisticUpdate);
        try {
            await markNotificationAsRead(id);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            // Optionally revert the optimistic update on error
            onUpdate(notifications);
        }
    };

    const handleMarkAllAsRead = async () => {
        const optimisticUpdate = notifications.map(n => ({...n, isRead: true}));
        onUpdate(optimisticUpdate);
        try {
            await markAllNotificationsAsRead();
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            onUpdate(notifications);
        }
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="absolute top-14 right-0 w-80 bg-white rounded-lg shadow-2xl border text-gray-800">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:underline">Mark all as read</button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n._id} className={`p-4 border-b hover:bg-gray-50 flex items-start gap-3 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                            <div className="flex-shrink-0 mt-1">{typeIcons[n.type]}</div>
                            <div className="flex-grow">
                                <p className="font-semibold text-sm">{n.title}</p>
                                <p className="text-xs text-gray-500">{n.message}</p>
                            </div>
                            {!n.isRead && (
                                <button onClick={() => handleMarkAsRead(n._id)} className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full mt-1.5" title="Mark as read"></button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-sm text-gray-500">
                        <Bell size={32} className="mx-auto mb-2" />
                        You have no new notifications.
                    </div>
                )}
            </div>
             <div className="p-2 text-center border-t">
                <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">View all notifications</a>
            </div>
        </div>
    );
};

export default NotificationPanel;