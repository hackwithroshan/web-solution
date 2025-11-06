import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Twitter, Instagram, Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { subscribeToNewsletter } from '../services/api';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter a valid email address.', 'info');
      return;
    }
    setIsSubscribing(true);
    try {
      const result = await subscribeToNewsletter(email);
      addToast(result.message, 'success');
      setEmail('');
    } catch (error: any) {
      addToast(error.message || 'Subscription failed. Please try again.', 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#12121A] text-white pt-16 relative z-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-2">
            <h3 className="font-semibold tracking-wider uppercase text-gray-400">Services</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
              <ul className="space-y-2">
                <li><Link to="/services#website-development" className="text-gray-400 hover:text-white">Website Development</Link></li>
                <li><Link to="/services#app-development" className="text-gray-400 hover:text-white">App Development</Link></li>
                <li><Link to="/services#cloud-hosting" className="text-gray-400 hover:text-white">Cloud Hosting</Link></li>
              </ul>
              <ul className="space-y-2">
                <li><Link to="/services#domain-registration" className="text-gray-400 hover:text-white">Domain Registration</Link></li>
                <li><Link to="/services#managed-security" className="text-gray-400 hover:text-white">Managed Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold tracking-wider uppercase text-gray-400">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white">Services</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold tracking-wider uppercase text-gray-400">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="text-gray-400 hover:text-white">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="text-gray-400 hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>
          
          <div className="text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start">
              <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_200/v1760926899/Untitled_design_10_kf8buw.png" alt="ApexNucleus Logo" className="h-7 w-auto" loading="lazy" decoding="async" />
            </div>
            <p className="mt-4 text-sm text-gray-400">© Copyright 2024 ApexNucleus</p>
            <div className="flex space-x-3 mt-4 justify-center md:justify-start">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-blue-600 p-2 rounded-full transition-colors"><Facebook size={16} /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-red-600 p-2 rounded-full transition-colors"><Youtube size={16} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-sky-500 p-2 rounded-full transition-colors"><Twitter size={16} /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-pink-600 p-2 rounded-full transition-colors"><Instagram size={16} /></a>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-center md:text-left">
                    <p className="font-semibold">Stay Updated</p>
                    <p className="text-gray-400 text-sm">Subscribe to our newsletter for the latest news.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 md:mt-0 flex w-full max-w-sm">
                    <input 
                      type="email" 
                      placeholder="Your Email" 
                      className="bg-gray-700 text-white w-full px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubscribing}
                      required
                    />
                    <button 
                      type="submit" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-2 rounded-r-md hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center w-36 disabled:from-blue-400 disabled:to-purple-400"
                      disabled={isSubscribing}
                    >
                        {isSubscribing ? <Loader className="animate-spin h-5 w-5" /> : 'SUBSCRIBE'}
                    </button>
                </form>
            </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 pb-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
           <p>Design by apexnucles</p>
        </div>

      </div>
    </footer>
  );
};

export default React.memo(Footer);