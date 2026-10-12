import { CartItem, QuoteFormData } from '../types.ts';

export const BUSINESS_PHONE = '+2347043642879';
export const WHATSAPP_BASE_URL = 'https://wa.me/2347043642879';

/**
 * Calculates estimated daily subtotal for products with known fixed prices.
 * Returns { subtotal: number, hasUnknownPrices: boolean }
 */
export function calculateCartSummary(cartItems: CartItem[]) {
  let subtotal = 0;
  let hasUnknownPrices = false;

  for (const item of cartItems) {
    if (item.product.priceType === 'fixed' && typeof item.product.price === 'number') {
      subtotal += item.product.price * item.quantity;
    } else {
      hasUnknownPrices = true;
    }
  }

  return {
    subtotal: Number(subtotal.toFixed(2)),
    hasUnknownPrices,
  };
}

/**
 * Builds the URL-encoded WhatsApp message for a quotation request
 */
export function buildQuotationWhatsAppUrl(
  formData: QuoteFormData,
  cartItems: CartItem[]
): string {
  const { subtotal, hasUnknownPrices } = calculateCartSummary(cartItems);

  let message = `Hello Rentals BY MO,\n\n`;
  message += `I would like to request a quotation for my event.\n\n`;

  message += `CUSTOMER DETAILS\n\n`;
  message += `Name: ${formData.customerName.trim()}\n`;
  message += `Phone: ${formData.customerPhone.trim()}\n\n`;

  message += `EVENT DETAILS\n\n`;
  message += `Event Date: ${formData.eventDate}\n`;
  message += `Event Time: ${formData.eventTime}\n`;
  message += `Event Location: ${formData.eventLocation.trim()}\n`;
  message += `Full Event/Delivery Address: ${formData.fullAddress.trim()}\n`;
  message += `Collection Preference: ${formData.collectionPreference}\n\n`;

  message += `SELECTED RENTAL ITEMS\n\n`;

  cartItems.forEach((item, index) => {
    message += `${index + 1}. ${item.product.name}\n`;
    message += `   Quantity: ${item.quantity}\n`;

    if (item.product.priceType === 'fixed' && typeof item.product.price === 'number') {
      const lineSubtotal = (item.product.price * item.quantity).toFixed(2);
      message += `   Price per item/day: CAD ${item.product.price.toFixed(2)}\n`;
      message += `   Estimated daily line subtotal: CAD ${lineSubtotal}\n\n`;
    } else if (item.product.priceType === 'range' && item.product.priceMin && item.product.priceMax) {
      message += `   Price per item/day: CAD ${item.product.priceMin.toFixed(2)} - CAD ${item.product.priceMax.toFixed(2)} (depending on size)\n`;
      message += `   Estimated daily line subtotal: Price on confirmation\n\n`;
    } else {
      message += `   Price: To Be Confirmed\n`;
      message += `   Estimated daily line subtotal: Price on confirmation\n\n`;
    }
  });

  message += `ESTIMATED DAILY SUBTOTAL\n\n`;
  message += `CAD ${subtotal.toFixed(2)}\n\n`;

  if (hasUnknownPrices) {
    message += `Some selected items require price confirmation. Please include them in the final quotation.\n\n`;
  }

  if (formData.additionalNotes && formData.additionalNotes.trim()) {
    message += `ADDITIONAL NOTES\n\n`;
    message += `${formData.additionalNotes.trim()}\n\n`;
  }

  message += `Please confirm:\n`;
  message += `- Product availability.\n`;
  message += `- Final rental prices.\n`;
  message += `- Rental duration and return arrangements.\n`;
  message += `- Any applicable delivery charges.\n`;
  message += `- The required refundable deposit.\n`;
  message += `- Any other applicable rental conditions.\n\n`;
  message += `Thank you.`;

  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds the URL-encoded WhatsApp message for an empty-cart general enquiry
 */
export function buildGeneralEnquiryWhatsAppUrl(optionalFormData?: Partial<QuoteFormData>): string {
  let message = `Hello Rentals BY MO,\n\n`;
  message += `I would like to make a general enquiry about your rental services.\n\n`;

  if (optionalFormData?.customerName || optionalFormData?.eventLocation) {
    message += `ENQUIRY DETAILS\n\n`;
    if (optionalFormData.customerName) message += `Name: ${optionalFormData.customerName.trim()}\n`;
    if (optionalFormData.customerPhone) message += `Phone: ${optionalFormData.customerPhone.trim()}\n`;
    if (optionalFormData.eventDate) message += `Tentative Date: ${optionalFormData.eventDate}\n`;
    if (optionalFormData.eventLocation) message += `Location: ${optionalFormData.eventLocation.trim()}\n`;
    if (optionalFormData.fullAddress) message += `Full Event/Delivery Address: ${optionalFormData.fullAddress.trim()}\n`;
    if (optionalFormData.collectionPreference) message += `Preference: ${optionalFormData.collectionPreference}\n`;
    if (optionalFormData.additionalNotes) message += `Notes: ${optionalFormData.additionalNotes.trim()}\n`;
    message += `\n`;
  }

  message += `Please provide more information about your available rental products, pricing, availability, and rental requirements.\n\n`;
  message += `Thank you.`;

  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
