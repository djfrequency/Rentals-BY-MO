import React, { useState } from 'react';
import { Plus, Minus, Check, AlertCircle, Sparkles, ImageOff } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  product: Product;
  onAddToQuote: (product: Product, quantity: number) => void;
  inCartQuantity?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToQuote,
  inCartQuantity = 0,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAdd = () => {
    if (!product.isAvailable) return;
    onAddToQuote(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1500);
  };

  // Render price element cleanly
  const renderPriceBadge = () => {
    if (product.priceType === 'fixed' && typeof product.price === 'number') {
      return (
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-gray-950">CAD ${product.price.toFixed(2)}</span>
          <span className="text-xs text-gray-500 font-medium">/{product.pricingBasis}</span>
        </div>
      );
    }

    if (product.priceType === 'range' && product.priceMin && product.priceMax) {
      return (
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-gray-950">
              CAD ${product.priceMin.toFixed(2)}–${product.priceMax.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 font-medium">/{product.pricingBasis}</span>
          </div>
          <p className="text-[11px] font-semibold text-blue-600 mt-0.5">Price varies by size</p>
        </div>
      );
    }

    // Price on Request
    return (
      <div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Price on Request
        </span>
        <p className="text-[11px] text-gray-400 mt-0.5">Confirmed via WhatsApp</p>
      </div>
    );
  };

  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl bg-white border transition-all duration-200 overflow-hidden ${
        product.isAvailable
          ? 'border-gray-200 hover:border-blue-400 hover:shadow-lg'
          : 'border-gray-200/60 bg-gray-50/50 opacity-85'
      }`}
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
          {!imgError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              loading="lazy"
              className={`h-full w-full object-cover object-center transition-transform duration-500 ${
                product.isAvailable ? 'group-hover:scale-105' : 'grayscale-50'
              }`}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
              <ImageOff className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium">{product.name}</span>
            </div>
          )}

          {/* Badges on Image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-xs">
                <Sparkles className="w-3 h-3" />
                Popular
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-xs text-gray-700 shadow-xs">
              {product.category}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            {product.isAvailable ? (
              <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-50/95 text-emerald-700 border border-emerald-200 backdrop-blur-xs shadow-xs">
                Available
              </span>
            ) : (
              <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-rose-50/95 text-rose-700 border border-rose-200 backdrop-blur-xs shadow-xs">
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-5">
          <div className="mb-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-950 group-hover:text-blue-600 transition-colors leading-snug">
              {product.name}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 min-h-[2.5rem] leading-relaxed mb-4">
            {product.description || 'Premium rental item available for events across Ontario.'}
          </p>

          {/* Price Container */}
          <div className="pt-3 border-t border-gray-100 mb-4">{renderPriceBadge()}</div>
        </div>
      </div>

      {/* Action Area: Quantity Controls & Add Button */}
      <div className="p-5 pt-0">
        {product.isAvailable ? (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-1.5">
              <span className="text-xs font-semibold text-gray-500 pl-2">Quantity:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) {
                      setQuantity(val);
                    } else if (e.target.value === '') {
                      setQuantity(1);
                    }
                  }}
                  className="w-12 text-center text-sm font-bold text-gray-900 bg-transparent focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Add to Quote Button */}
            <button
              type="button"
              onClick={handleAdd}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-md'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Quote!</span>
                </>
              ) : inCartQuantity > 0 ? (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add More (In Quote: {inCartQuantity})</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Quote</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span>Currently Unavailable</span>
            </div>
            <button
              disabled
              className="w-full mt-2 py-2 px-3 bg-gray-200 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed"
            >
              Cannot Add to Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
