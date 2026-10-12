import React from 'react';
import { Sparkles, ArrowRight, Shield, Truck, Calendar, DollarSign, MessageCircle } from 'lucide-react';
import { WHATSAPP_BASE_URL } from '../utils/whatsapp.ts';

interface HeroProps {
  onBrowseRentals: () => void;
  onRequestQuote: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBrowseRentals, onRequestQuote }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16 sm:py-24 border-b border-gray-200">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Ontario Event & Party Rentals</span>
            <span className="text-blue-300">•</span>
            <span>Direct WhatsApp Quotation</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15] mb-6">
            Everything You Need for Your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 bg-clip-text text-transparent">
              Perfect Event
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            Explore our collection of event essentials, tableware, furniture, linens, and party equipment.
            Select the items you need and request a personalized quotation directly through WhatsApp.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onBrowseRentals}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Browse Rentals</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onRequestQuote}
              className="w-full sm:w-auto px-8 py-4 bg-gray-950 hover:bg-gray-800 text-white font-bold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span>Request a Quote</span>
            </button>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-gray-200/80 pt-10">
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Pickup & Delivery</h3>
              <p className="text-xs text-gray-500 mt-0.5">Flexible collection or direct venue delivery across Ontario.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Refundable Deposit</h3>
              <p className="text-xs text-gray-500 mt-0.5">A clear refundable deposit is required for all rental items.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Clear Daily CAD Pricing</h3>
              <p className="text-xs text-gray-500 mt-0.5">Transparent per item / day rates in Canadian dollars.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Custom Party Setups</h3>
              <p className="text-xs text-gray-500 mt-0.5">Tailored event setups arranged to suit your budget.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
