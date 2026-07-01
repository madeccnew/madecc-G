/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Menu, X, HardHat, Phone, Calendar, User, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
}

export default function Navbar({ currentPage, onNavigate, isAdminLoggedIn, onAdminLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Residential', id: 'residential' },
    { name: 'Commercial', id: 'commercial' },
    { name: 'Portfolio', id: 'portfolio' },
    { name: 'Blog', id: 'blog' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header id="site-header" className="sticky top-0 z-50 w-full bg-gray-950/95 backdrop-blur-md border-b border-gray-800 text-white shadow-lg">
      {/* TOP BAR */}
      <div className="hidden md:flex h-10 bg-amber-500 items-center justify-between px-8 text-[11px] font-bold tracking-widest text-gray-950 uppercase border-b border-gray-950/10">
        <div className="flex gap-6">
          <span>T: +237 671 063 511</span>
          <span>T: +237 689 115 595</span>
          <span>E: madeccco5@gmail.com</span>
        </div>
        <div className="flex gap-6">
          <span>LICENSED & INSURED</span>
          <span>ISO 9001 CERTIFIED</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => handleLinkClick('home')}>
            <img src="/logo.jpg" alt="MADECC-Group Logo" className="h-10 w-10 object-contain rounded-none border border-amber-500/20" referrerPolicy="no-referrer" />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">MADECC</span>
              <span className="text-2xl sm:text-3xl font-light text-amber-500"></span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navigationItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  id={`nav-link-${item.id}`}
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`px-3 py-2 text-xs font-semibold tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-amber-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Desktop Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  id="admin-dashboard-btn"
                  onClick={() => handleLinkClick('admin')}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500 hover:text-gray-950 transition-colors rounded-none"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
                <button
                  id="admin-logout-btn"
                  onClick={onAdminLogout}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                id="admin-login-cta"
                onClick={() => handleLinkClick('admin')}
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
                title="Admin Authentication"
              >
                <User className="w-4 h-4" />
              </button>
            )}

            <button
              id="header-consultation-btn"
              onClick={() => handleLinkClick('booking')}
              className="flex items-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-bold uppercase tracking-widest text-xs transition-all cursor-pointer shadow-lg hover:shadow-amber-500/20 rounded-none"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Request Consultation</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              id="mobile-nav-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden bg-gray-950 border-b border-gray-800 slide-in px-4 pt-2 pb-6 space-y-3 shadow-2xl transition-all">
          <div className="grid grid-cols-1 gap-2">
            {navigationItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  id={`mobile-nav-link-${item.id}`}
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-none text-sm font-semibold tracking-wider uppercase transition-all ${
                    isActive
                      ? 'text-amber-500 bg-gray-900'
                      : 'text-gray-300 hover:text-white hover:bg-gray-900/40'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          <hr className="border-gray-800 my-4" />

          <div className="flex flex-col space-y-3">
            <button
              id="mobile-consultation-btn"
              onClick={() => handleLinkClick('booking')}
              className="w-full text-center py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold uppercase tracking-wider text-xs rounded-none shadow-lg flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Consultation</span>
            </button>

            <div className="flex items-center justify-between text-xs text-gray-400 px-4 pt-1">
              <span className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-amber-500" />
                <span>+1 (800) 555-0199</span>
              </span>
              {isAdminLoggedIn ? (
                <button
                  id="mobile-admin-dashboard-btn"
                  onClick={() => handleLinkClick('admin')}
                  className="text-amber-500 font-semibold"
                >
                  Admin Panel
                </button>
              ) : (
                <button
                  id="mobile-admin-login-btn"
                  onClick={() => handleLinkClick('admin')}
                  className="text-gray-400 hover:text-white"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
