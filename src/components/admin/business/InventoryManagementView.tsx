import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import {
  Package,
  Layers,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Building2,
  DollarSign,
  Barcode,
  X,
  Sliders,
} from 'lucide-react';

export const InventoryManagementView: React.FC = () => {
  const {
    products,
    warehouses,
    stockLedger,
    stockAdjustments,
    recordStockAdjustment,
  } = useBusiness();

  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'summary' | 'ledger' | 'adjustments'>('summary');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  // Stock adjustment form state
  const [adjWarehouseId, setAdjWarehouseId] = useState(warehouses[0]?.id || 'wh-main');
  const [adjReason, setAdjReason] = useState<any>('damage');
  const [adjProductId, setAdjProductId] = useState(products.find((p) => p.trackInventory)?.id || '');
  const [adjDelta, setAdjDelta] = useState<number>(-1);
  const [adjNotes, setAdjNotes] = useState('');

  // Physical inventory products only
  const trackableProducts = products.filter((p) => p.trackInventory);

  const filteredProducts = trackableProducts.filter((p) => {
    if (showLowStockOnly && p.currentStock > p.minStockAlert) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  // Total valuation
  const totalStockValue = trackableProducts.reduce(
    (sum, p) => sum + p.currentStock * p.purchasePrice,
    0
  );

  const lowStockCount = trackableProducts.filter((p) => p.currentStock <= p.minStockAlert).length;

  const handleStockAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === adjProductId);
    if (!prod) return;

    recordStockAdjustment({
      date: new Date().toISOString().split('T')[0],
      warehouseId: adjWarehouseId,
      reason: adjReason,
      notes: adjNotes || `Manual stock adjustment: ${adjReason}`,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          currentQuantity: prod.currentStock,
          newQuantity: Math.max(0, prod.currentStock + adjDelta),
          adjustmentQuantity: adjDelta,
          unitPrice: prod.purchasePrice,
        },
      ],
      totalValueImpact: Math.abs(adjDelta * prod.purchasePrice),
    });

    showToast(`Stock adjustment for ${prod.name} recorded!`, 'success');
    setShowAdjustmentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <span>Authoritative Inventory &amp; Stock Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single authoritative inventory ledger maintaining real-time stock deductions, batch receipts, transfers, and valuation.
          </p>
        </div>

        <button
          onClick={() => setShowAdjustmentModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>+ Stock Count Adjustment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Inventory Valuation</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{totalStockValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Weighted Average Cost Basis across all hubs
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Tracked Product SKUs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {trackableProducts.length} Active SKUs
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Commercial detergents, softeners, suit covers
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-rose-600 uppercase flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low-Stock Warning Alerts</span>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {lowStockCount} Products
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            At or below minimum reorder thresholds
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            📦 Stock Status Summary
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ledger' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            📑 Complete Movement Ledger ({stockLedger.length})
          </button>
          <button
            onClick={() => setActiveTab('adjustments')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'adjustments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            ⚖️ Adjustments Log ({stockAdjustments.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              showLowStockOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            ⚠️ Low Stock Only
          </button>

          <div className="relative max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search items, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: STOCK STATUS SUMMARY */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Product Name &amp; SKU</th>
                  <th className="py-3 px-4">HSN Code</th>
                  <th className="py-3 px-4">Total Stock</th>
                  <th className="py-3 px-4">Warehouse Distribution</th>
                  <th className="py-3 px-4">Cost Rate</th>
                  <th className="py-3 px-4">Total Asset Value</th>
                  <th className="py-3 px-4">Reorder Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-[13px]">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">{p.hsnSac}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                          {p.currentStock} {p.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-[11px] text-slate-600">
                          {warehouses.map((wh) => (
                            <div key={wh.id} className="flex justify-between max-w-[200px]">
                              <span className="truncate text-slate-500">{wh.name.split('—')[0]}:</span>
                              <span className="font-bold">
                                {(p.warehouseStock && p.warehouseStock[wh.id]) || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">₹{p.purchasePrice}</td>
                      <td className="py-3 px-4 font-black text-slate-900">
                        ₹{(p.currentStock * p.purchasePrice).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low (Min: {p.minStockAlert})</span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[11px]">Healthy</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLETE STOCK MOVEMENT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Quantity Changed</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Reference Doc #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stockLedger.map((entry) => {
                  const prod = products.find((p) => p.id === entry.productId);
                  const wh = warehouses.find((w) => w.id === entry.warehouseId);
                  const isInward = entry.quantity > 0;
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{entry.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{prod?.name || 'Item'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isInward ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {entry.movementType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{wh?.name.split('—')[0] || 'Main Hub'}</td>
                      <td className="py-3 px-4">
                        <span className={`font-black ${isInward ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isInward ? `+${entry.quantity}` : entry.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{entry.balanceAfter}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {entry.referenceDocumentNumber || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ADJUSTMENTS LOG */}
      {activeTab === 'adjustments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden p-4 space-y-3">
          {stockAdjustments.map((adj) => (
            <div key={adj.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-slate-800">#{adj.adjustmentNumber}</span>
                <span className="text-slate-400">{adj.date}</span>
              </div>
              <div className="font-bold text-slate-700">Reason: {adj.reason.toUpperCase().replace('_', ' ')}</div>
              <div className="text-slate-600">Notes: {adj.notes}</div>
              <div className="font-semibold text-slate-900">
                Value Impact: ₹{adj.totalValueImpact.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
          {stockAdjustments.length === 0 && (
            <p className="text-slate-400 text-center py-8">No adjustments recorded yet.</p>
          )}
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Record Stock Count Adjustment</h3>
              <button onClick={() => setShowAdjustmentModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Select Item</label>
                <select
                  value={adjProductId}
                  onChange={(e) => setAdjProductId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  {trackableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Warehouse</label>
                <select
                  value={adjWarehouseId}
                  onChange={(e) => setAdjWarehouseId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Adjustment Reason</label>
                <select
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="damage">Spillage / Container Damage</option>
                  <option value="count_discrepancy">Physical Audit Discrepancy</option>
                  <option value="spoilage">Expired / Degraded Chemical</option>
                  <option value="sample">Free Promotional Customer Sample</option>
                  <option value="theft">Lost or Missing</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Quantity Adjustment (+/-)</label>
                <input
                  type="number"
                  placeholder="e.g. -2 or +5"
                  value={adjDelta}
                  onChange={(e) => setAdjDelta(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Notes / Explanation</label>
                <input
                  type="text"
                  placeholder="e.g. Broken seal during delivery"
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm"
                >
                  Confirm Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

