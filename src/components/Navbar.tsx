import React, { useState } from 'react';
import { ShoppingBag, MessageSquare, ShieldCheck, Menu, X, Sparkles, MapPin } from 'lucide-react';
import { WHATSAPP_BASE_URL } from '../utils/whatsapp.ts';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs transition-all">
      {/* Top Banner Notice */}
      <div className="bg-gray-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">Ontario, Canada</span>
            <span className="text-gray-400">•</span>
            <span>Party, Tableware & Event Rentals</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span>Refundable Deposit Required</span>
            <span>•</span>
            <a
              href={WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              WhatsApp: +234 704 364 2879
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gray-950 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:bg-blue-600 transition-colors">
              <span>M</span>
              <span className="text-blue-400 group-hover:text-white">O</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-950 block leading-tight">
                Rentals <span className="text-blue-600">BY MO</span>
              </span>
              <span className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
                Event & Party Essentials
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('catalogue')}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Browse Rentals
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('policies')}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Rental Policies
            </button>
            <button
              onClick={onOpenAdmin}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                isAdminLoggedIn
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Administrator Management"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAdminLoggedIn ? 'Admin Active' : 'Admin'}
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Direct WhatsApp Enquiries */}
            <a
              href={WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors border border-gray-200"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Quote Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-sm transition-all cursor-pointer"
              aria-label="View quote request cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xs:inline">Rental Quote</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-extrabold text-blue-600 bg-white rounded-full shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <button
            onClick={() => scrollToSection('catalogue')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold text-gray-800 hover:bg-gray-50 flex items-center justify-between"
          >
            <span>Browse Rentals</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold text-gray-800 hover:bg-gray-50"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('policies')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold text-gray-800 hover:bg-gray-50"
          >
            Rental Policies
          </button>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="py-2 px-3 text-sm font-semibold text-gray-600 hover:text-gray-950 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-gray-500" />
              <span>{isAdminLoggedIn ? 'Admin Dashboard (Active)' : 'Admin Login'}</span>
            </button>
            <a
              href={WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 text-sm font-semibold text-emerald-600 flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp MO</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
