import React from 'react';
import { MessageSquare, ArrowLeft, CheckCircle2, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

interface QuoteCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrowseRentals: () => void;
  whatsAppUrl: string;
}

export const QuoteCompletionModal: React.FC<QuoteCompletionModalProps> = ({
  isOpen,
  onClose,
  onBrowseRentals,
  whatsAppUrl,
}) => {
  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 text-center p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Quote request prepared"
      >
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight mb-3">
          Your rental request is ready!
        </h2>

        {/* Supporting Text */}
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md mx-auto mb-6">
          Continue to WhatsApp to send your request to <strong>Rentals BY MO</strong>. Product availability, final pricing, rental duration, delivery arrangements, and deposits will be confirmed by our team.
        </p>

        {/* Reassurance Notice */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left text-xs text-gray-600 space-y-2 mb-8">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>A refundable deposit is required for all confirmed rentals.</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>Rentals BY MO will reply promptly to verify item availability.</span>
          </div>
        </div>

        {/* THE TWO MANDATORY ACTIONS */}
        <div className="space-y-3">
          {/* PRIMARY BUTTON: Request on WhatsApp */}
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Request on WhatsApp</span>
            <ExternalLink className="w-4 h-4 opacity-75" />
          </button>

          {/* SECONDARY BUTTON: Browse Rentals */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onBrowseRentals();
            }}
            className="w-full py-3.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-2xl border border-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Rentals</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mt-4">
          Opening WhatsApp launches your WhatsApp application or web messenger with your pre-filled enquiry.
        </p>
      </div>
    </div>
  );
};
