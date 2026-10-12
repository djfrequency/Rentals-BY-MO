import React from 'react';
import { Search, ShoppingBag, MessageSquare, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: Search,
      title: 'Browse & Choose Items',
      description:
        'Explore our catalogue of tableware, chairs, tables, chafing dishes, and linens. Select exact quantities for your event guest count.',
    },
    {
      step: '02',
      icon: ShoppingBag,
      title: 'Review Quote Cart',
      description:
        'Check estimated daily subtotals in CAD. Products with custom sizing or custom tables are flagged for instant manual confirmation.',
    },
    {
      step: '03',
      icon: MessageSquare,
      title: 'Submit Details & Address',
      description:
        'Enter your event date, time, city/town, and compulsory Full Event/Delivery Address with your pickup or delivery preference.',
    },
    {
      step: '04',
      icon: CheckCircle2,
      title: 'Confirm on WhatsApp',
      description:
        'Our WhatsApp integration prepares a structured request. Rentals BY MO verifies item availability, deposits, and delivery arrangements.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-3 tracking-tight">
            How Renting Works
          </h2>
          <p className="text-gray-600 text-base mt-3">
            Fast, hassle-free event equipment rentals tailored to your schedule and venue requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-gray-50/70 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-gray-300 group-hover:text-blue-500 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-950 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
