import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#12121A] text-white pt-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-2">
            <h3 className="font-semibold tracking-wider uppercase text-gray-400">Services</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <ul className="space-y-2">
                <li><a href="#/services" className="text-gray-400 hover:text-white">Web Development</a></li>
                <li><a href="#/services" className="text-gray-400 hover:text-white">AI Development</a></li>
                <li><a href="#/services" className="text-gray-400 hover:text-white">Hosting Solutions</a></li>
                <li><a href="#/services" className="text-gray-400 hover:text-white">Domain Names</a></li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold tracking-wider uppercase text-gray-400">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white">Services</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold tracking-wider uppercase text-gray-400">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Refund Policy</a></li>
            </ul>
          </div>
          
          <div className="text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start">
              <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/v1760926899/Untitled_design_10_kf8buw.png" alt="ApexNucleus Logo" className="h-7 w-auto" />
            </div>
            <p className="mt-4 text-sm text-gray-400">© Copyright 2024 ApexNucleus</p>
            <div className="flex space-x-3 mt-4 justify-center md:justify-start">
                <a href="#" className="bg-gray-700 hover:bg-blue-600 p-2 rounded-full transition-colors"><Facebook size={16} /></a>
                <a href="#" className="bg-gray-700 hover:bg-blue-600 p-2 rounded-full transition-colors"><Youtube size={16} /></a>
                <a href="#" className="bg-gray-700 hover:bg-blue-600 p-2 rounded-full transition-colors"><Twitter size={16} /></a>
                <a href="#" className="bg-gray-700 hover:bg-blue-600 p-2 rounded-full transition-colors"><Instagram size={16} /></a>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-center md:text-left">
                    <p className="font-semibold">Stay Updated</p>
                    <p className="text-gray-400 text-sm">Subscribe to our newsletter for the latest news.</p>
                </div>
                <form className="mt-4 md:mt-0 flex w-full max-w-sm">
                    <input type="email" placeholder="Your Email" className="bg-gray-700 text-white w-full px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-r-md hover:bg-blue-700 transition-colors">SUBSCRIBE</button>
                </form>
            </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 pb-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
           <p>Design by Inebur with ♥</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;