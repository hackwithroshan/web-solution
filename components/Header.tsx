import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { Phone, Lock, ChevronRight, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location]);

  const MobileMenu = () => (
    <div className="fixed inset-0 bg-[#1E1E2C] z-50 flex flex-col p-6">
      <div className="flex justify-end">
        <button onClick={() => setIsMobileMenuOpen(false)}>
          <X className="w-8 h-8 text-white" />
        </button>
      </div>
      <nav className="flex flex-col items-center justify-center flex-grow gap-8">
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `text-3xl font-bold ${isActive ? 'text-blue-500' : 'text-white'} hover:text-blue-400 transition-colors`
            }
          >
            {link.name}
          </NavLink>
        ))}
        {user ? (
          <Link to={dashboardPath} className="bg-blue-600 text-white font-bold px-8 py-4 rounded-md flex items-center space-x-2 text-xl mt-4">
            <Lock size={20} />
            <span>DASHBOARD</span>
          </Link>
        ) : (
          <Link to="/login" className="bg-blue-600 text-white font-bold px-8 py-4 rounded-md flex items-center space-x-2 text-xl mt-4">
            <Lock size={20} />
            <span>LOGIN</span>
          </Link>
        )}
      </nav>
    </div>
  );

  return (
    <div className="sticky top-0 z-40">
      {isMobileMenuOpen && <MobileMenu />}
      {/* Top Bar */}
      <div className="bg-[#252535] text-center p-2 text-xs sm:text-sm text-gray-300 flex items-center justify-center">
        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-sm mr-2">NEWS</span>
        <span className="hidden sm:inline">Announcing our new AI-powered development services.</span>
        <a href="#" className="text-white font-semibold ml-2 flex items-center group">
          Learn More <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
      
      {/* Main Header */}
      <header className="bg-[#1E1E2C]/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center">
              <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/v1760926899/Untitled_design_10_kf8buw.png" alt="ApexNucleus Logo" className="h-7 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative text-gray-300 hover:text-white font-medium transition-colors duration-300 py-2
                     after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300
                     ${isActive ? 'text-white after:w-full' : 'after:w-0 hover:after:w-full'}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-gray-300">
                <a href="#" className="hover:text-white flex items-center transition-colors"><Phone size={20} className="mr-2" /> Contact Us</a>
            </div>
            {user ? (
              <Link to={dashboardPath} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                <Lock size={16} />
                <span>DASHBOARD</span>
              </Link>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white font-bold px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                <Lock size={16} />
                <span>LOGIN</span>
              </Link>
            )}
          </div>
          
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;