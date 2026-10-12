import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, MessageSquare, ShoppingBag, AlertCircle, Sparkles } from 'lucide-react';
import { CartItem } from '../types.ts';
import { calculateCartSummary, buildGeneralEnquiryWhatsAppUrl } from '../utils/whatsapp.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToQuoteForm: () => void;
  onBrowseRentals: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToQuoteForm,
  onBrowseRentals,
}) => {
  if (!isOpen) return null;

  const { subtotal, hasUnknownPrices } = calculateCartSummary(cartItems);

  // General enquiry action for empty cart
  const handleEmptyCartWhatsAppEnquiry = () => {
    const url = buildGeneralEnquiryWhatsAppUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Rental Quote Selection"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-950">Rental Quote Cart</h2>
              <p className="text-xs text-gray-500">
                {cartItems.length} {cartItems.length === 1 ? 'item selected' : 'items selected'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {cartItems.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Estimate Notice */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Displayed prices are estimates based on <strong>one rental day</strong>. Final pricing, rental duration, availability, delivery charges, deposits, and other conditions will be confirmed by Rentals BY MO.
              </p>
            </div>

            {/* Item List */}
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => {
                const { product, quantity } = item;
                const isFixed = product.priceType === 'fixed' && typeof product.price === 'number';
                const lineTotal = isFixed ? (product.price! * quantity).toFixed(2) : null;

                return (
                  <div key={product.id} className="py-4 flex gap-4 items-center">
                    {/* Thumbnail */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-18 h-18 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-200"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-950 truncate">{product.name}</h4>
                        <button
                          onClick={() => onRemoveItem(product.id)}
                          className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 mb-2">
                        {isFixed ? (
                          <>CAD ${product.price!.toFixed(2)} /{product.pricingBasis}</>
                        ) : product.priceType === 'range' ? (
                          <span className="text-blue-700 font-medium">CAD $20–$30 (Confirm on size)</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Price to be confirmed</span>
                        )}
                      </p>

                      {/* Controls and line subtotal */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 border border-gray-200">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          {isFixed ? (
                            <span className="text-sm font-extrabold text-gray-950">
                              CAD ${lineTotal}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              To Be Confirmed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasUnknownPrices && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Notice:</strong> Your quote includes items requiring price confirmation. Rentals BY MO will verify exact prices for these items directly on WhatsApp.
              </div>
            )}
          </div>
        ) : (
          /* EMPTY CART VIEW WITH TWO MANDATORY ACTION BUTTONS */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-950 mb-2">Your Rental Quote Cart is Empty</h3>
            <p className="text-sm text-gray-600 max-w-sm mb-8 leading-relaxed">
              You haven't added any rental items yet. Browse our catalogue to choose tableware, furniture, and equipment, or send us a general enquiry on WhatsApp right now.
            </p>

            {/* The TWO Clearly Visible Buttons */}
            <div className="w-full space-y-3 max-w-xs">
              {/* PRIMARY BUTTON: Request on WhatsApp (Works even when cart is empty!) */}
              <button
                type="button"
                onClick={handleEmptyCartWhatsAppEnquiry}
                className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Request on WhatsApp</span>
              </button>

              {/* SECONDARY BUTTON: Browse Rentals */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBrowseRentals();
                }}
                className="w-full py-3.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-gray-500" />
                <span>Browse Rentals</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer (When items are in cart) */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50/80 space-y-4">
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold text-gray-700">Estimated Daily Subtotal:</span>
              <div className="text-right">
                <span className="text-xl font-black text-gray-950">CAD ${subtotal.toFixed(2)}</span>
                <span className="block text-[11px] text-gray-500 font-normal">/ rental day</span>
              </div>
            </div>

            {/* TWO clearly visible action buttons */}
            <div className="space-y-2.5">
              {/* Primary: Proceed to Quote Form */}
              <button
                type="button"
                onClick={onProceedToQuoteForm}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Event Details & Request Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary: Browse Rentals (Preserves cart!) */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBrowseRentals();
                }}
                className="w-full py-3 px-6 bg-white hover:bg-gray-100 text-gray-800 font-bold text-sm rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Browse Rentals</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
