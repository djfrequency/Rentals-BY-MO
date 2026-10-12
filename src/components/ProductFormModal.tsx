import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, DollarSign, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Product, PriceType } from '../types.ts';
import { uploadImageFile } from '../services/api.ts';
import { INITIAL_CATEGORIES } from '../data/initialProducts.ts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
  existingCategories: string[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
  existingCategories,
}) => {
  if (!isOpen) return null;

  const isEditing = !!productToEdit;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Plates, Bowls and Cutlery');
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('fixed');
  const [price, setPrice] = useState<string>('1.00');
  const [priceMin, setPriceMin] = useState<string>('20.00');
  const [priceMax, setPriceMax] = useState<string>('30.00');
  const [pricingBasis, setPricingBasis] = useState('each/day');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [notes, setNotes] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Merge categories
  const categoriesList = Array.from(new Set([...INITIAL_CATEGORIES, ...existingCategories]));

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description || '');
      setCategory(productToEdit.category);
      setImageUrl(productToEdit.imageUrl || '');
      setPriceType(productToEdit.priceType || 'fixed');
      setPrice(productToEdit.price !== undefined ? productToEdit.price.toString() : '');
      setPriceMin(productToEdit.priceMin !== undefined ? productToEdit.priceMin.toString() : '20');
      setPriceMax(productToEdit.priceMax !== undefined ? productToEdit.priceMax.toString() : '30');
      setPricingBasis(productToEdit.pricingBasis || 'each/day');
      setIsAvailable(productToEdit.isAvailable !== false);
      setIsFeatured(!!productToEdit.isFeatured);
      setNotes(productToEdit.notes || '');
    } else {
      // Defaults for new product
      setName('');
      setDescription('');
      setCategory('Plates, Bowls and Cutlery');
      setCustomCategory('');
      setImageUrl('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80');
      setPriceType('fixed');
      setPrice('1.00');
      setPriceMin('20.00');
      setPriceMax('30.00');
      setPricingBasis('each/day');
      setIsAvailable(true);
      setIsFeatured(false);
      setNotes('');
    }
    setError('');
  }, [productToEdit, isOpen]);

  // Handle direct file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be under 5MB.');
      return;
    }

    setUploadingImage(true);
    setError('');
    try {
      const url = await uploadImageFile(file);
      setImageUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload image file.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }

    const finalCategory = category === '__NEW__' ? customCategory.trim() : category.trim();
    if (!finalCategory) {
      setError('Please select or specify a category.');
      return;
    }

    const payload: Partial<Product> = {
      name: name.trim(),
      description: description.trim(),
      category: finalCategory,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      priceType,
      pricingBasis: pricingBasis.trim() || 'each/day',
      isAvailable,
      isFeatured,
      notes: notes.trim() || undefined,
    };

    if (priceType === 'fixed') {
      const p = parseFloat(price);
      if (isNaN(p) || p < 0) {
        setError('Please provide a valid fixed price.');
        return;
      }
      payload.price = p;
    } else if (priceType === 'range') {
      const pMin = parseFloat(priceMin);
      const pMax = parseFloat(priceMax);
      if (isNaN(pMin) || isNaN(pMax) || pMin < 0 || pMax < pMin) {
        setError('Please provide valid min and max prices (min <= max).');
        return;
      }
      payload.priceMin = pMin;
      payload.priceMax = pMax;
    } else {
      payload.price = undefined;
      payload.priceMin = undefined;
      payload.priceMax = undefined;
    }

    setSaving(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 my-8 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit Product' : 'Add New Product'}
      >
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-950">
            {isEditing ? `Edit: ${productToEdit?.name}` : 'Add New Rental Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gold Rim Dinner Plates"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__NEW__">+ Add Custom Category...</option>
              </select>
            </div>

            {category === '__NEW__' && (
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  New Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tent & Canopy Accessories"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Detailed description, dimensions, material, or capacity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Image Upload & Preview */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
            <label className="block text-xs font-bold text-gray-800">Product Image</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-20 h-20 rounded-xl bg-gray-200 border border-gray-300 overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <input
                  type="text"
                  placeholder="Image URL (e.g. https://... or /uploads/...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:border-blue-500 focus:outline-hidden"
                />
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer shadow-2xs">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-gray-400">Max 5MB (JPEG, PNG, WEBP)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Controls */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
            <label className="block text-xs font-bold text-gray-800">Pricing Configuration</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriceType('fixed')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  priceType === 'fixed'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Fixed CAD Price
              </button>
              <button
                type="button"
                onClick={() => setPriceType('range')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  priceType === 'range'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Price Range (Min–Max)
              </button>
              <button
                type="button"
                onClick={() => setPriceType('on_request')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  priceType === 'on_request'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Price on Request
              </button>
            </div>

            {priceType === 'fixed' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price (CAD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pricing Basis</label>
                  <input
                    type="text"
                    placeholder="each/day, per item/day, per set/day"
                    value={pricingBasis}
                    onChange={(e) => setPricingBasis(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {priceType === 'range' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Min Price (CAD)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Price (CAD)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Basis</label>
                  <input
                    type="text"
                    value={pricingBasis}
                    onChange={(e) => setPricingBasis(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {priceType === 'on_request' && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2">
                This item will display "Price on Request" on the catalogue and "To Be Confirmed" in quotes. No price is invented.
              </p>
            )}
          </div>

          {/* Availability & Featured Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-gray-900 block">Available for Rent</span>
                <span className="text-[11px] text-gray-500">Uncheck to mark unavailable on catalogue</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-gray-900 block">Featured / Popular</span>
                <span className="text-[11px] text-gray-500">Displays a "Popular" badge on card</span>
              </div>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
