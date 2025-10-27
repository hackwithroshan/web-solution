import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutGrid, Users, Server, Settings, LogOut, Package, List, HelpCircle, Megaphone, Bot, FileText, Rss } from 'lucide-react';

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
    const { logout } = useAuth();
    const navLinks = [
        { icon: LayoutGrid, name: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, name: 'Users', path: '/admin/users' },
        { icon: Server, name: 'Services', path: '/admin/services' },
        { icon: HelpCircle, name: 'Support', path: '/admin/support' },
    ];

    const settingsLinks = [
        { icon: Package, name: 'Manage Plans', path: '/admin/manage-plans' },
        { icon: List, name: 'Manage Categories', path: '/admin/manage-categories' },
        { icon: FileText, name: 'Manage Pages', path: '/admin/manage-pages' },
        { icon: Rss, name: 'Manage Blog', path: '/admin/manage-blog' },
        { icon: HelpCircle, name: 'Manage FAQs', path: '/admin/manage-faqs' },
        { icon: Bot, name: 'Manage Chatbot', path: '/admin/manage-chatbot' },
        { icon: Megaphone, name: 'Announcements', path: '/admin/announcements' },
        { icon: Settings, name: 'Settings', path: '/admin/settings' },
    ]

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    }

    return (
        <>
            {/* Backdrop for mobile */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>

            <aside className={`fixed inset-y-0 left-0 w-64 flex-shrink-0 bg-gray-800 text-gray-200 flex flex-col z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center justify-center border-b border-gray-700">
                    <Link to="/" className="flex items-center">
                        <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_200/v1760926899/Untitled_design_10_kf8buw.png" alt="ApexNucleus Logo" className="h-7 w-auto" loading="lazy" decoding="async" />
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-4">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</p>
                    {navLinks.map(link => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            end
                            onClick={handleLinkClick}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 mt-2 text-sm font-medium rounded-md transition-colors ${
                                    isActive
                                        ? 'bg-cyan-500 text-white shadow-md'
                                        : 'hover:bg-gray-700'
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5 mr-3" />
                            {link.name}
                        </NavLink>
                    ))}
                    <p className="mt-6 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</p>
                    {settingsLinks.map(link => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            end
                            onClick={handleLinkClick}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 mt-2 text-sm font-medium rounded-md transition-colors ${
                                    isActive
                                        ? 'bg-cyan-500 text-white shadow-md'
                                        : 'hover:bg-gray-700'
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5 mr-3" />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-gray-700">
                    <button onClick={logout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md hover:bg-gray-700">
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default React.memo(AdminSidebar);