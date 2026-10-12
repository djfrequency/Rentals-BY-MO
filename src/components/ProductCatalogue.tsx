import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw, PackageX } from 'lucide-react';
import { Product, CartItem } from '../types.ts';
import { ProductCard } from './ProductCard.tsx';
import { INITIAL_CATEGORIES } from '../data/initialProducts.ts';

interface ProductCatalogueProps {
  products: Product[];
  categories: string[];
  cartItems: CartItem[];
  onAddToQuote: (product: Product, quantity: number) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const ProductCatalogue: React.FC<ProductCatalogueProps> = ({
  products,
  categories,
  cartItems,
  onAddToQuote,
  isLoading,
  onRefresh,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available_only'>('all');

  // Compute quantity in cart for each product id
  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cartItems) {
      map.set(item.product.id, item.quantity);
    }
    return map;
  }, [cartItems]);

  // Combine categories
  const allCategories = useMemo(() => {
    const set = new Set<string>(['All', ...INITIAL_CATEGORIES, ...categories]);
    return Array.from(set);
  }, [categories]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category match
      if (selectedCategory !== 'All' && prod.category !== selectedCategory) {
        return false;
      }
      // Availability match
      if (availabilityFilter === 'available_only' && !prod.isAvailable) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = prod.name.toLowerCase().includes(query);
        const descMatch = prod.description?.toLowerCase().includes(query);
        const catMatch = prod.category.toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !catMatch) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategory, availabilityFilter, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setAvailabilityFilter('all');
  };

  return (
    <section id="catalogue" className="py-16 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Full Rental Inventory
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-2 tracking-tight">
              Rental Product Catalogue
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl">
              Select items, adjust quantities for your guest count, and prepare an instant WhatsApp quote request.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <span>Showing <strong className="text-gray-900">{filteredProducts.length}</strong> of {products.length} items</span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, description, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Availability Filter Toggle */}
            <div className="flex items-center gap-1.5 self-start md:self-auto bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => setAvailabilityFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  availabilityFilter === 'all'
                    ? 'bg-white text-gray-950 shadow-xs'
                    : 'text-gray-600 hover:text-gray-950'
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('available_only')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  availabilityFilter === 'available_only'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-950'
                }`}
              >
                Available Only
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Categories:
            </span>
            {allCategories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gray-950 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-semibold text-gray-600">Loading rental inventory...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToQuote={onAddToQuote}
                inCartQuantity={cartQuantityMap.get(product.id) || 0}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <PackageX className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No rental items match your filters</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Try adjusting your search terms or selecting a different category to see available items.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
