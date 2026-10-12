export type PriceType = 'fixed' | 'range' | 'on_request';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  priceType: PriceType;
  price?: number; // Price in CAD for 'fixed'
  priceMin?: number; // For 'range'
  priceMax?: number; // For 'range'
  pricingBasis: string; // e.g. "each/day", "per item/day", "per set/day"
  isAvailable: boolean;
  isFeatured?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface QuoteFormData {
  customerName: string;
  customerPhone: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string; // City/Town
  fullAddress: string; // Full Event/Delivery Address *
  collectionPreference: 'Pickup' | 'Delivery';
  additionalNotes: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin';
}

export interface CatalogStats {
  total: number;
  available: number;
  unavailable: number;
  priceOnRequest: number;
  categoriesCount: number;
}
