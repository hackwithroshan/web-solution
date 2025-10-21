import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';

interface UserMenuProps {
    onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onClose }) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        onClose();
        logout();
    };

    const menuItems = [
        { icon: User, label: "My Profile", path: "/user/profile" },
        { icon: Settings, label: "Account Settings", path: "/user/profile" },
        { icon: HelpCircle, label: "Help & Support", path: "/user/support" },
    ];

    return (
        <div className="absolute top-14 right-0 w-56 bg-white rounded-lg shadow-2xl border text-gray-800 py-2">
            {menuItems.map(item => (
                <Link
                    key={item.label}
                    to={item.path}
                    onClick={onClose}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <item.icon size={16} className="mr-3" />
                    <span>{item.label}</span>
                </Link>
            ))}
            <div className="my-2 border-t"></div>
            <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
                <LogOut size={16} className="mr-3" />
                <span>Logout</span>
            </button>
        </div>
    );
};

export default UserMenu;