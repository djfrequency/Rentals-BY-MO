import React from 'react';
import { ShieldAlert, Truck, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { WHATSAPP_BASE_URL } from '../utils/whatsapp.ts';

export const BusinessPolicies: React.FC = () => {
  return (
    <section id="policies" className="py-16 sm:py-20 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Transparent Terms
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-3 tracking-tight">
            Rental Policies & Service Information
          </h2>
          <p className="text-gray-600 text-base mt-2">
            Clear guidelines for a smooth, dependable rental experience with Rentals BY MO.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Policy 1: Refundable Deposit */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-950 mb-2">Refundable Security Deposit</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              A refundable security deposit is required for all equipment and tableware rentals. The exact deposit amount is confirmed directly with you based on your selected items and returned in full upon safe return of undamaged goods.
            </p>
          </div>

          {/* Policy 2: Pickup and Delivery */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-950 mb-2">Pickup & Delivery Options</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Both self-pickup and direct venue delivery services are available across Ontario. Applicable delivery charges will be calculated and confirmed transparently based on your event location and scheduling needs.
            </p>
          </div>

          {/* Policy 3: Custom Party Setups */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-950 mb-2">Custom Setups Within Budget</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Planning a wedding, milestone birthday, or banquet? We can coordinate custom party setups and decor arrangements tailored specifically within your planned budget.
            </p>
          </div>

          {/* Policy 4: Pricing Basis */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-950 mb-2">Daily CAD Pricing Basis</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              All displayed prices are in Canadian dollars (CAD) per rental item per day unless otherwise specified. Multi-day rental periods and return dates are scheduled directly with Rentals BY MO.
            </p>
          </div>

          {/* Policy 5: Price on Request Items */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-950 mb-2">Items on Request & Ranges</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Certain specialty items (such as tables and chairs) are priced on request, while large cooking pots depend on pot capacity. These are added to your quotation and verified directly via WhatsApp.
            </p>
          </div>

          {/* Policy 6: Booking Confirmation */}
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">Questions or Special Requests?</h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                Submitting a quotation request sends your item list to our team. Final bookings, delivery fees, and security deposits are confirmed directly with you on WhatsApp.
              </p>
            </div>
            <div className="mt-5">
              <a
                href={WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-sm transition-colors shadow-xs"
              >
                Chat on WhatsApp (+234 704 364 2879)
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
