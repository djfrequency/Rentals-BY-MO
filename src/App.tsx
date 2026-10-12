import React, { useState, useEffect } from 'react';
import { Product, CartItem, QuoteFormData } from './types.ts';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data/initialProducts.ts';
import { fetchProducts, fetchCategories, checkAdminSession } from './services/api.ts';
import { buildQuotationWhatsAppUrl } from './utils/whatsapp.ts';

import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ProductCatalogue } from './components/ProductCatalogue.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { BusinessPolicies } from './components/BusinessPolicies.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { QuoteFormModal } from './components/QuoteFormModal.tsx';
import { QuoteCompletionModal } from './components/QuoteCompletionModal.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Footer } from './components/Footer.tsx';

const CART_STORAGE_KEY = 'rentals_by_mo_cart_items';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<string[]>([...INITIAL_CATEGORIES]);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionWhatsAppUrl, setCompletionWhatsAppUrl] = useState('');

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  // Load products from server & check admin session
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const [prods, cats, isAuthed] = await Promise.all([
          fetchProducts().catch(() => INITIAL_PRODUCTS),
          fetchCategories().catch(() => [...INITIAL_CATEGORIES]),
          checkAdminSession().catch(() => false),
        ]);

        if (prods && prods.length > 0) {
          setProducts(prods);
        }
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
        setIsAdminLoggedIn(isAuthed);

        // Check if user navigated to /admin
        if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
          if (isAuthed) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // Cart actions
  const handleAddToQuote = (product: Product, quantityToAdd: number) => {
    if (!product.isAvailable) return;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantityToAdd,
        };
        return next;
      } else {
        return [...prev, { product, quantity: quantityToAdd }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Workflow transitions
  const handleProceedToQuoteForm = () => {
    setIsCartOpen(false);
    setIsQuoteFormOpen(true);
  };

  const handleSubmitQuoteForm = (formData: QuoteFormData) => {
    const url = buildQuotationWhatsAppUrl(formData, cartItems);
    setCompletionWhatsAppUrl(url);
    setIsQuoteFormOpen(false);
    setIsCompletionModalOpen(true);

    // Also directly launch WhatsApp window/app
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBrowseRentals = () => {
    setIsCartOpen(false);
    setIsQuoteFormOpen(false);
    setIsCompletionModalOpen(false);

    const catalogueElem = document.getElementById('catalogue');
    if (catalogueElem) {
      catalogueElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Admin triggers
  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminDashboardOpen(false);
  };

  // Total quantity in cart
  const cartItemCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        cartCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onBrowseRentals={handleBrowseRentals}
          onRequestQuote={() => setIsCartOpen(true)}
        />

        {/* Product Catalogue */}
        <ProductCatalogue
          products={products}
          categories={categories}
          cartItems={cartItems}
          onAddToQuote={handleAddToQuote}
          isLoading={isLoading}
          onRefresh={async () => {
            const prods = await fetchProducts();
            setProducts(prods);
          }}
        />

        {/* How Renting Works */}
        <HowItWorks />

        {/* Business Policies */}
        <BusinessPolicies />
      </main>

      {/* Footer */}
      <Footer onOpenAdmin={handleOpenAdmin} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToQuoteForm={handleProceedToQuoteForm}
        onBrowseRentals={handleBrowseRentals}
      />

      {/* Quotation Request Form Modal */}
      <QuoteFormModal
        isOpen={isQuoteFormOpen}
        onClose={() => setIsQuoteFormOpen(false)}
        cartItems={cartItems}
        onSubmit={handleSubmitQuoteForm}
        onBrowseRentals={handleBrowseRentals}
      />

      {/* Quote Completion Reassurance Modal */}
      <QuoteCompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onBrowseRentals={handleBrowseRentals}
        whatsAppUrl={completionWhatsAppUrl}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Dashboard */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          products={products}
          onProductsUpdated={(updatedList) => setProducts(updatedList)}
          onClose={() => setIsAdminDashboardOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
