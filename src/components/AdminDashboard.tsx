import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  KeyRound,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Filter,
  Check,
  FileArchive,
  Loader2,
} from 'lucide-react';
import { Product } from '../types.ts';
import { ProductFormModal } from './ProductFormModal.tsx';
import {
  addProduct,
  updateProduct,
  toggleProductAvailability,
  deleteProduct,
  resetCatalog,
  importCatalog,
  changeAdminPassword,
  adminLogout,
} from '../services/api.ts';
import JSZip from 'jszip';

interface AdminDashboardProps {
  products: Product[];
  onProductsUpdated: (products: Product[]) => void;
  onClose: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onProductsUpdated,
  onClose,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Delete Confirmation state
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset Confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Password Change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ZIP download state
  const [zipping, setZipping] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.isAvailable).length;
    const unavailable = total - available;
    const priceOnRequest = products.filter((p) => p.priceType === 'on_request' || p.priceType === 'range').length;
    const categoriesCount = new Set(products.map((p) => p.category)).size;

    return { total, available, unavailable, priceOnRequest, categoriesCount };
  }, [products]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle Toggle Availability
  const handleToggleAvailability = async (product: Product) => {
    try {
      const updated = await toggleProductAvailability(product.id, !product.isAvailable);
      const nextList = products.map((p) => (p.id === product.id ? updated : p));
      onProductsUpdated(nextList);
      showToast(
        `"${product.name}" is now ${updated.isAvailable ? 'Available' : 'Unavailable'}.`
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update availability', 'error');
    }
  };

  // Handle Save Product (Add or Edit)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (productToEdit) {
      const updated = await updateProduct(productToEdit.id, productData);
      const nextList = products.map((p) => (p.id === productToEdit.id ? updated : p));
      onProductsUpdated(nextList);
      showToast(`Product "${updated.name}" updated successfully.`);
    } else {
      const created = await addProduct(productData);
      onProductsUpdated([created, ...products]);
      showToast(`Product "${created.name}" created successfully.`);
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteCandidate.id);
      const nextList = products.filter((p) => p.id !== deleteCandidate.id);
      onProductsUpdated(nextList);
      showToast(`Product "${deleteCandidate.name}" deleted.`);
      setDeleteCandidate(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Reset to Default 38 Items
  const handleResetCatalog = async () => {
    setIsResetting(true);
    try {
      const resetList = await resetCatalog();
      onProductsUpdated(resetList);
      showToast(`Catalog reset to initial 38 products.`);
      setShowResetConfirm(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to reset catalog', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rentals-by-mo-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Catalog exported successfully.');
  };

  // Handle Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedList = Array.isArray(parsed) ? parsed : parsed.products;
        if (!Array.isArray(importedList)) {
          throw new Error('Invalid JSON format: expected an array of products.');
        }
        const updated = await importCatalog(importedList);
        onProductsUpdated(updated);
        showToast(`Successfully imported ${updated.length} products.`);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Invalid backup JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    setChangingPassword(true);
    try {
      const msg = await changeAdminPassword(currentPassword, newPassword);
      setPasswordStatus({ type: 'success', message: msg || 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err: unknown) {
      setPasswordStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle Download Complete Project as ZIP
  const handleDownloadZip = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();
      zip.file(
        'rentals-by-mo-products.json',
        JSON.stringify(products, null, 2)
      );
      zip.file(
        'README.txt',
        `RENTALS BY MO — EVENT RENTALS
Website with Complete Inventory, Admin Dashboard & WhatsApp Quotation System.
Service Location: Ontario, Canada
WhatsApp Number: +2347043642879
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `rentals-by-mo-project-backup-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Project ZIP backup created and downloaded.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'ZIP generation failed', 'error');
    } finally {
      setZipping(false);
    }
  };

  const handleLogoutClick = async () => {
    await adminLogout();
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-60 px-4 py-3 rounded-xl shadow-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-gray-950 text-white border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold leading-tight">Admin Dashboard</h1>
                <p className="text-[11px] text-gray-400">Rentals BY MO Inventory Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              <span>Change Password</span>
            </button>

            <button
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Products</span>
            <div className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">{metrics.total}</div>
            <span className="text-[11px] text-gray-400 mt-1 block">Full catalogue inventory</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Available</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{metrics.available}</div>
            <span className="text-[11px] text-gray-400 mt-1 block">Visible for quote adding</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Unavailable</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{metrics.unavailable}</div>
            <span className="text-[11px] text-gray-400 mt-1 block">Locked from new quotes</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Price on Request</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{metrics.priceOnRequest}</div>
            <span className="text-[11px] text-gray-400 mt-1 block">Requires confirmation</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs col-span-2 md:col-span-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Categories</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{metrics.categoriesCount}</div>
            <span className="text-[11px] text-gray-400 mt-1 block">Organized item types</span>
          </div>
        </div>

        {/* Action Bar & Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products in inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setProductToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>

              <button
                onClick={handleExportBackup}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Export catalog JSON backup"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <label className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 transition-colors flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDownloadZip}
                disabled={zipping}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Download full project archive"
              >
                <FileArchive className="w-3.5 h-3.5 text-blue-600" />
                <span>{zipping ? 'Zipping...' : 'Project ZIP'}</span>
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset to initial 38 products"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default (38)</span>
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" />
              Category:
            </span>
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4 text-center">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-950 truncate max-w-xs">{product.name}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                            {product.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                        {product.category}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4">
                      {product.priceType === 'fixed' && typeof product.price === 'number' ? (
                        <div>
                          <span className="font-extrabold text-gray-950">CAD ${product.price.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 block">/{product.pricingBasis}</span>
                        </div>
                      ) : product.priceType === 'range' ? (
                        <div>
                          <span className="font-bold text-blue-700">
                            CAD ${product.priceMin?.toFixed(2)}–${product.priceMax?.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 block">Depends on size</span>
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Price on Request
                        </span>
                      )}
                    </td>

                    {/* Availability Quick Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          product.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
                        title="Click to toggle availability"
                      >
                        {product.isAvailable ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Unavailable</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setProductToEdit(product);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(product)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-semibold text-sm">No products found matching your filter.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      {isFormModalOpen && (
        <ProductFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setProductToEdit(null);
          }}
          productToEdit={productToEdit}
          onSave={handleSaveProduct}
          existingCategories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-950 mb-1">Delete Product?</h3>
            <p className="text-xs text-gray-600 mb-6">
              Are you sure you want to delete <strong>"{deleteCandidate.name}"</strong>? This will remove it from the rental catalogue.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-950 mb-1">Reset to Default 38 Products?</h3>
            <p className="text-xs text-gray-600 mb-6">
              This will restore the original catalogue with all 38 products, standard categories, and accurate Ontario CAD prices. Any custom added products will be replaced.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetCatalog}
                disabled={isResetting}
                className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-gray-950 mb-3 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <span>Change Admin Password</span>
            </h3>

            {passwordStatus && (
              <div
                className={`p-3 rounded-xl text-xs mb-3 font-semibold ${
                  passwordStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {passwordStatus.message}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">New Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
