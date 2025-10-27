import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { Phone, Lock, Menu, X } from 'lucide-react';
import GooeyNav from './GooeyNav'; // Import the new component

const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
  
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Sync activeIndex with the current route
    const currentIndex = NAV_LINKS.findIndex(link => link.path === location.pathname);
    setActiveIndex(currentIndex > -1 ? currentIndex : 0); // Default to home if no match
  }, [location.pathname]);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = NAV_LINKS.map(link => ({
    label: link.name,
    href: `#${link.path}` // for HashRouter
  }));

  const MobileMenu = () => (
    <div className="fixed inset-0 bg-[#1E1E2C]/95 backdrop-blur-lg z-50 flex flex-col p-6 animate-slide-in-down">
      <div className="flex justify-end">
        <button onClick={() => setIsMobileMenuOpen(false)}>
          <X className="w-8 h-8 text-white" />
        </button>
      </div>
      <nav className="flex flex-col items-center justify-center flex-grow gap-8 stagger-in">
        {NAV_LINKS.map((link, index) => (
          <NavLink
            key={link.name}
            to={link.path}
            style={{ animationDelay: `${150 + index * 75}ms` }}
            className={({ isActive }) =>
              `text-3xl font-bold ${isActive ? 'text-blue-500' : 'text-white'} hover:text-blue-400 transition-colors`
            }
          >
            {link.name}
          </NavLink>
        ))}
        {user ? (
          <Link 
            to={dashboardPath} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-4 rounded-full flex items-center space-x-2 text-xl mt-4 shadow-lg"
            style={{ animationDelay: `${150 + NAV_LINKS.length * 75}ms` }}
          >
            <Lock size={20} />
            <span>DASHBOARD</span>
          </Link>
        ) : (
          <Link 
            to="/login" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-4 rounded-full flex items-center space-x-2 text-xl mt-4 shadow-lg"
            style={{ animationDelay: `${150 + NAV_LINKS.length * 75}ms` }}
          >
            <Lock size={20} />
            <span>LOGIN</span>
          </Link>
        )}
      </nav>
    </div>
  );

  return (
    <div className="fixed top-6 w-full z-40 px-6">
      {isMobileMenuOpen && <MobileMenu />}
      
      {/* Main Header */}
      <header className={`transition-all duration-300 bg-black/20 backdrop-blur-lg border border-white/10 rounded-full max-w-7xl mx-auto ${isScrolled ? 'bg-black/40 backdrop-blur-xl' : ''}`}>
        <div className={`px-6 flex justify-between items-center transition-all duration-300 ${isScrolled ? 'py-1' : 'py-2'}`}>
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_200/v1760926899/Untitled_design_10_kf8buw.png" alt="ApexNucleus Logo" className="h-7 w-auto" loading="lazy" decoding="async" />
            </Link>
            <div className="hidden md:flex items-center">
              <GooeyNav
                key={location.pathname} // Remount on navigation to update active state
                items={navItems}
                initialActiveIndex={activeIndex}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <Link to={dashboardPath} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-4 py-2 rounded-full flex items-center space-x-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md">
                <Lock size={16} />
                <span>DASHBOARD</span>
              </Link>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-4 py-2 rounded-full flex items-center space-x-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md">
                <Lock size={16} />
                <span>LOGIN</span>
              </Link>
            )}
          </div>
          
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="transition-transform duration-200 hover:scale-110 active:scale-95">
              <Menu className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default React.memo(Header);