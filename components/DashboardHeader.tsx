import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bell, Menu, Search, Gift, LayoutGrid, Server, Layers, CreditCard, Settings, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Notification } from '../types';
import { fetchNotifications } from '../services/api';
import useOutsideClick from '../hooks/useOutsideClick';
import UserMenu from './UserMenu';
import NotificationPanel from './NotificationPanel';

interface SearchableItem {
    name: string;
    path: string;
    icon: React.ElementType;
}

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // State for search functionality
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchableItem[]>([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const searchRef = useRef(null);
    useOutsideClick(searchRef, () => setIsSuggestionsOpen(false));


    const userMenuRef = useRef(null);
    const notificationsRef = useRef(null);
    useOutsideClick(userMenuRef, () => setIsUserMenuOpen(false));
    useOutsideClick(notificationsRef, () => setIsNotificationsOpen(false));
    
    const notificationSoundRef = useRef(new Audio('https://res.cloudinary.com/dvrqft9ov/video/upload/v1761992826/mixkit-software-interface-start-2574_nsv3uq.wav'));
    const prevUnreadCountRef = useRef<number>(0);


    useEffect(() => {
        fetchNotifications()
            .then(setNotifications)
            .catch(err => console.error("Failed to fetch notifications:", err));
        
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    useEffect(() => {
        if (unreadCount > prevUnreadCountRef.current) {
            notificationSoundRef.current.play().catch(error => console.log("Audio play failed:", error));
        }
        prevUnreadCountRef.current = unreadCount;
    }, [unreadCount]);


    const handleNotificationsUpdate = (updatedNotifications: Notification[]) => {
        setNotifications(updatedNotifications);
    };

    const searchableItems: SearchableItem[] = [
        { name: 'Dashboard', path: '/user/dashboard', icon: LayoutGrid },
        { name: 'My Services', path: '/user/my-services', icon: Server },
        { name: 'All Services', path: '/user/all-services', icon: Layers },
        { name: 'Payment History', path: '/user/payment-history', icon: CreditCard },
        { name: 'Account Settings', path: '/user/profile', icon: Settings },
        { name: 'Support Tickets', path: '/user/support', icon: HelpCircle },
        { name: 'Refer & Earn', path: '/user/refer-earn', icon: Gift },
    ];

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            const filtered = searchableItems.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered);
            setIsSuggestionsOpen(true);
        } else {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
        }
    };

    return (
        <header className="relative z-10 flex justify-between items-center px-6 py-3 bg-white border-b">
            {/* Left Side */}
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden text-gray-600">
                    <Menu size={24} />
                </button>
                <div className="hidden lg:block">
                     <Link to="/" className="flex items-center">
                        <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/v1760926012/Untitled_design_3_kkkf6d.png" alt="ApexNucleus Logo" className="h-7 w-auto" />
                    </Link>
                </div>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-xl mx-6 hidden md:block">
                <div className="relative" ref={searchRef}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search for services, help, settings..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => { if (searchQuery) setIsSuggestionsOpen(true); }}
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                     {isSuggestionsOpen && suggestions.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border z-20">
                            <ul className="py-2">
                                {suggestions.map(item => (
                                    <li key={item.path}>
                                        <Link 
                                            to={item.path} 
                                            onClick={() => {
                                                setIsSuggestionsOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <item.icon size={16} className="mr-3 text-gray-400" />
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3 md:space-x-5">
                 <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-700">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs text-gray-500">
                        {currentTime.toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric' })}
                    </span>
                </div>
                 <Link to="/user/refer-earn" className="hidden sm:flex items-center gap-2 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors">
                    <Gift size={14} />
                    <span>Refer & Earn</span>
                 </Link>
                 
                 {/* Notifications */}
                 <div className="relative" ref={notificationsRef}>
                     <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="relative text-gray-500 hover:text-gray-700">
                        <Bell size={22}/>
                        {unreadCount > 0 && (
                             <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                {unreadCount}
                            </span>
                        )}
                     </button>
                     {isNotificationsOpen && <NotificationPanel notifications={notifications} onUpdate={handleNotificationsUpdate} onClose={() => setIsNotificationsOpen(false)} />}
                 </div>

                 {/* User Menu */}
                 <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="flex items-center space-x-3">
                         <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                            {user?.name.charAt(0).toUpperCase()}
                         </div>
                         <span className="font-semibold text-sm hidden sm:block">{user?.name}</span>
                    </button>
                    {isUserMenuOpen && <UserMenu onClose={() => setIsUserMenuOpen(false)} />}
                 </div>
            </div>
        </header>
    );
};

export default DashboardHeader;