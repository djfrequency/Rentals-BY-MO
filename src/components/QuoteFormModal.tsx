import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Phone, User, AlertCircle, ArrowRight, Truck, Store } from 'lucide-react';
import { CartItem, QuoteFormData } from '../types.ts';
import { calculateCartSummary } from '../utils/whatsapp.ts';

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onSubmit: (formData: QuoteFormData) => void;
  onBrowseRentals: () => void;
}

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onSubmit,
  onBrowseRentals,
}) => {
  if (!isOpen) return null;

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('14:00');
  const [eventLocation, setEventLocation] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [collectionPreference, setCollectionPreference] = useState<'Pickup' | 'Delivery'>('Delivery');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Validation errors map
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { subtotal } = calculateCartSummary(cartItems);

  // Validate form strictly
  const validateForm = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!customerName || !customerName.trim()) {
      errs.customerName = 'Customer name is required.';
    }

    if (!customerPhone || !customerPhone.trim()) {
      errs.customerPhone = 'Customer phone number is required.';
    } else if (customerPhone.trim().length < 6) {
      errs.customerPhone = 'Please provide a valid phone number.';
    }

    if (!eventDate || !eventDate.trim()) {
      errs.eventDate = 'Please select a valid event date.';
    }

    if (!eventTime || !eventTime.trim()) {
      errs.eventTime = 'Please select an event time.';
    }

    if (!eventLocation || !eventLocation.trim()) {
      errs.eventLocation = 'Event Location (City/Town) is required.';
    }

    // MANDATORY REQUIREMENT: Full Event/Delivery Address *
    // Compulsory for both pickup and delivery, trimmed, rejects empty and whitespace-only
    const trimmedAddress = fullAddress.trim();
    if (!trimmedAddress) {
      errs.fullAddress = 'Full Event/Delivery Address is required for all quotations.';
    }

    if (!collectionPreference) {
      errs.collectionPreference = 'Please select either Pickup or Delivery.';
    }

    if (cartItems.length === 0) {
      errs.cart = 'Please select at least one rental item in your quote cart.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Find the first error element and scroll to it
      const firstErrorKey = Object.keys(errors)[0];
      const errorElement = document.getElementById(`field-${firstErrorKey}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const payload: QuoteFormData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      eventDate: eventDate.trim(),
      eventTime: eventTime.trim(),
      eventLocation: eventLocation.trim(),
      fullAddress: fullAddress.trim(),
      collectionPreference,
      additionalNotes: additionalNotes.trim(),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-8 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-gray-950">
              Event Details & Quotation Request
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Please provide your event information to prepare your official quotation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">
          {/* Cart Summary Banner */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-blue-900 block text-sm">
                Selected Items: {cartItems.length} products
              </span>
              <span className="text-blue-700">
                Estimated Daily Subtotal:{' '}
                <strong className="text-blue-950 text-sm">CAD ${subtotal.toFixed(2)}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={onBrowseRentals}
              className="text-blue-600 hover:text-blue-800 font-bold underline self-start sm:self-auto cursor-pointer"
            >
              Modify Items
            </button>
          </div>

          {errors.cart && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.cart}</span>
            </div>
          )}

          {/* Customer Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div id="field-customerName">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors({ ...errors, customerName: '' });
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all ${
                      errors.customerName
                        ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.customerName && (
                  <p className="text-rose-600 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.customerName}
                  </p>
                )}
              </div>

              {/* Customer Phone */}
              <div id="field-customerPhone">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Customer Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 (416) 555-0192"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (errors.customerPhone) setErrors({ ...errors, customerPhone: '' });
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all ${
                      errors.customerPhone
                        ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.customerPhone && (
                  <p className="text-rose-600 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.customerPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
              Event Schedule & Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Event Date */}
              <div id="field-eventDate">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Event Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => {
                      setEventDate(e.target.value);
                      if (errors.eventDate) setErrors({ ...errors, eventDate: '' });
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all ${
                      errors.eventDate
                        ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.eventDate && (
                  <p className="text-rose-600 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.eventDate}
                  </p>
                )}
              </div>

              {/* Event Time */}
              <div id="field-eventTime">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Event Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => {
                      setEventTime(e.target.value);
                      if (errors.eventTime) setErrors({ ...errors, eventTime: '' });
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all ${
                      errors.eventTime
                        ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.eventTime && (
                  <p className="text-rose-600 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.eventTime}
                  </p>
                )}
              </div>
            </div>

            {/* Field E: Event Location (City/Town) */}
            <div id="field-eventLocation" className="mb-4">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Event Location (City/Town) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Toronto, Mississauga, Brampton, Ottawa..."
                  value={eventLocation}
                  onChange={(e) => {
                    setEventLocation(e.target.value);
                    if (errors.eventLocation) setErrors({ ...errors, eventLocation: '' });
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all ${
                    errors.eventLocation
                      ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.eventLocation && (
                <p className="text-rose-600 text-xs font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.eventLocation}
                </p>
              )}
            </div>

            {/* Field F: Full Event/Delivery Address * (MANDATORY REQUIREMENT - POSITIONED DIRECTLY BELOW CITY/TOWN) */}
            <div id="field-fullAddress" className="mb-4">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Full Event/Delivery Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-blue-600" />
                <textarea
                  required
                  rows={2}
                  placeholder="Enter the complete event or delivery address"
                  value={fullAddress}
                  onChange={(e) => {
                    setFullAddress(e.target.value);
                    if (errors.fullAddress) setErrors({ ...errors, fullAddress: '' });
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all resize-none ${
                    errors.fullAddress
                      ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Required for both pickup and delivery requests to verify scheduling and service arrangements.
              </p>
              {errors.fullAddress && (
                <p className="text-rose-600 text-xs font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullAddress}
                </p>
              )}
            </div>

            {/* Field G: Pickup or Delivery */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-800 mb-2">
                Collection Preference <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCollectionPreference('Pickup')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    collectionPreference === 'Pickup'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Customer Pickup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCollectionPreference('Delivery')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    collectionPreference === 'Delivery'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Venue Delivery</span>
                </button>
              </div>
            </div>

            {/* Field H: Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Additional Notes or Special Requests <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Special setup instructions, budget considerations, stairs/elevator access, or custom questions..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Review & Send on WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
