import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import { BusinessProduct } from '../../../business/types';
import {
  Package,
  Shirt,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Barcode,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  DollarSign,
  Tag,
} from 'lucide-react';

export const ProductsServicesView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, warehouses } = useBusiness();
  const { categories, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'product' | 'service'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BusinessProduct | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    itemType: 'product' | 'service';
    categoryId: string;
    sku: string;
    barcode: string;
    unit: string;
    sellingPrice: number;
    purchasePrice: number;
    hsnSac: string;
    gstRate: number;
    trackInventory: boolean;
    minStockAlert: number;
    openingStock: number;
    description: string;
  }>({
    name: '',
    itemType: 'product',
    categoryId: categories[0]?.id || 'cat-wash-iron',
    sku: '',
    barcode: '',
    unit: 'Piece',
    sellingPrice: 150,
    purchasePrice: 90,
    hsnSac: '34029019',
    gstRate: 18,
    trackInventory: true,
    minStockAlert: 10,
    openingStock: 25,
    description: '',
  });

  const handleOpenAddModal = (type: 'product' | 'service' = 'product') => {
    setEditingProduct(null);
    setFormData({
      name: '',
      itemType: type,
      categoryId: categories[0]?.id || 'cat-dry-clean',
      sku: `${type === 'service' ? 'SVC' : 'PRD'}-${Date.now().toString().slice(-4)}`,
      barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      unit: type === 'service' ? 'Piece' : 'Can',
      sellingPrice: type === 'service' ? 180 : 450,
      purchasePrice: type === 'service' ? 50 : 280,
      hsnSac: type === 'service' ? '998714' : '34029019',
      gstRate: 18,
      trackInventory: type === 'product',
      minStockAlert: type === 'product' ? 10 : 0,
      openingStock: type === 'product' ? 20 : 0,
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (p: BusinessProduct) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      itemType: p.itemType,
      categoryId: p.categoryId,
      sku: p.sku || '',
      barcode: p.barcode || '',
      unit: p.unit,
      sellingPrice: p.sellingPrice,
      purchasePrice: p.purchasePrice,
      hsnSac: p.hsnSac,
      gstRate: p.gstRate,
      trackInventory: p.trackInventory,
      minStockAlert: p.minStockAlert,
      openingStock: p.openingStock,
      description: p.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter an item name', 'error');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
      });
      showToast(`Updated "${formData.name}" successfully!`, 'success');
    } else {
      addProduct({
        ...formData,
        currentStock: formData.trackInventory ? formData.openingStock : 9999,
        openingStockRate: formData.purchasePrice,
        warehouseStock: { 'wh-main': formData.trackInventory ? formData.openingStock : 9999 },
        active: true,
      });
      showToast(`Added "${formData.name}" to business master!`, 'success');
    }
    setShowModal(false);
  };

  const filteredProducts = products.filter((p) => {
    if (activeTab !== 'all' && p.itemType !== activeTab) return false;
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      const matchHsn = (p.hsnSac || '').toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchHsn) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Package className="w-5 h-5 text-brand-600" />
            <span>Products &amp; Services Master</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage commercial laundry service rates, retail supplies, chemicals, HSN/SAC codes and tax slabs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenAddModal('service')}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>+ Add Service</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('product')}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Product / Item</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('service')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'service' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            🧺 Laundry Services ({products.filter((p) => p.itemType === 'service').length})
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'product' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            📦 Retail &amp; Consumables ({products.filter((p) => p.itemType === 'product').length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search items, SKU, HSN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">HSN / SAC</th>
                <th className="py-3 px-4">Selling Rate</th>
                <th className="py-3 px-4">Cost Rate</th>
                <th className="py-3 px-4">GST Slab</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-[13px]">{p.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span>SKU: {p.sku || 'N/A'}</span>
                      {p.barcode && <span>• Barcode: {p.barcode}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.itemType === 'service'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.itemType === 'service' ? 'Service' : 'Product'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">{p.hsnSac}</td>
                  <td className="py-3 px-4 font-black text-slate-900 text-[13px]">
                    ₹{p.sellingPrice} <span className="text-[10px] text-slate-400 font-normal">/{p.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">₹{p.purchasePrice}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-700">{p.gstRate}%</span>
                  </td>
                  <td className="py-3 px-4">
                    {p.trackInventory ? (
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`font-black ${
                            p.currentStock <= p.minStockAlert ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {p.currentStock} {p.unit}
                        </span>
                        {p.currentStock <= p.minStockAlert && (
                          <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full flex items-center space-x-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Low</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">— Unlimited</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                            deleteProduct(p.id);
                            showToast(`Deleted ${p.name}`, 'info');
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingProduct ? 'Edit Item' : 'Add New Item / Service'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Item Type</label>
                  <select
                    value={formData.itemType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setFormData((prev) => ({
                        ...prev,
                        itemType: t,
                        trackInventory: t === 'product',
                        hsnSac: t === 'service' ? '998714' : '34029019',
                      }));
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="product">Physical Product (Track Stock)</option>
                    <option value="service">Laundry Service (No physical stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Item / Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Silk Saree Roll Press or Eco Detergent Can"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Barcode / EAN</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Measurement Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Piece">Piece</option>
                    <option value="Can">Can (5L)</option>
                    <option value="Bottle">Bottle (1L/2L)</option>
                    <option value="Pack">Pack</option>
                    <option value="Pair">Pair</option>
                    <option value="Set">Set</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Selling Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={formData.hsnSac}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hsnSac: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">GST Rate (%)</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, gstRate: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value={0}>0% GST</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>
              </div>

              {formData.trackInventory && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <div>
                    <label className="block text-slate-700 mb-1">Opening Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.openingStock}
                      onChange={(e) => setFormData((prev) => ({ ...prev, openingStock: Number(e.target.value) }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Low-Stock Alert Level</label>
                    <input
                      type="number"
                      value={formData.minStockAlert}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minStockAlert: Number(e.target.value) }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

