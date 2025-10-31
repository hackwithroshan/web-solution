import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutGrid, LogOut } from 'lucide-react';

interface SupportSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const SupportSidebar: React.FC<SupportSidebarProps> = ({ isOpen, setIsOpen }) => {
    const { logout } = useAuth();
    const navLinks = [
        { icon: LayoutGrid, name: 'Dashboard', path: '/support/dashboard' },
        // Future links for support can be added here
    ];

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
            
            <aside className={`fixed inset-y-0 left-0 w-64 flex-shrink-0 bg-white border-r flex flex-col z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center px-6 border-b">
                    <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_200/v1760926012/Untitled_design_3_kkkf6d.png" alt="ApexNucleus Logo" className="h-8 w-auto" loading="lazy" decoding="async" />
                </div>
                <nav className="flex-1 px-4 py-4">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            end
                            onClick={handleLinkClick}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-md transition-colors ${
                                    isActive
                                        ? 'bg-blue-700 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5 mr-3" />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-4 py-4 border-t">
                    <button onClick={logout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900">
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default React.memo(SupportSidebar);