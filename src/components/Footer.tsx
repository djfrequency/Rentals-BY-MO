import React from 'react';
import { MessageSquare, ShieldCheck, MapPin, Sparkles, ArrowUp } from 'lucide-react';
import { WHATSAPP_BASE_URL, BUSINESS_PHONE } from '../utils/whatsapp.ts';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-950 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                <span>M</span>
                <span>O</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Rentals <span className="text-blue-500">BY MO</span>
              </span>
            </div>

            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Your premier partner for party, banquet, tableware, furniture, and event equipment rentals in Ontario, Canada. High quality essentials delivered for unforgettable celebrations.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900 border border-gray-800">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Ontario, Canada</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900 border border-gray-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Refundable Deposit Policy</span>
              </span>
            </div>
          </div>

          {/* Quick Enquiries & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Direct Contact
            </h4>
            <p className="text-xs text-gray-400">
              We coordinate quotations, item availability, rental periods, and custom setups directly via WhatsApp:
            </p>
            <div>
              <a
                href={WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <span className="block text-[11px] text-gray-400 mt-1.5">
                {BUSINESS_PHONE}
              </span>
            </div>
          </div>

          {/* Business Terms & Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Rental Essentials
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>All prices in Canadian Dollars (CAD)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Rates quoted per item / rental day</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Pickup and delivery across Ontario</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Custom party setups within budget</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="text-xs font-semibold text-gray-500 hover:text-gray-300 underline cursor-pointer"
              >
                Admin Management Portal
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} Rentals BY MO. All rights reserved. Prices are estimates based on 1 rental day; final confirmation by Rentals BY MO.
          </p>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
