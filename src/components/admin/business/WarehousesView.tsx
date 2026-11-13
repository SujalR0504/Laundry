import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import { Warehouse } from '../../../business/types';
import {
  Building2,
  Plus,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Phone,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';

export const WarehousesView: React.FC = () => {
  const {
    warehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    products,
    stockTransfers,
    recordStockTransfer,
    completeStockTransfer,
  } = useBusiness();

  const { showToast } = useApp();

  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // New warehouse form
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');
  const [whCity, setWhCity] = useState('Rewa, M.P.');
  const [whPhone, setWhPhone] = useState('9893733683');

  // Stock transfer form
  const [fromWh, setFromWh] = useState(warehouses[0]?.id || '');
  const [toWh, setToWh] = useState(warehouses[1]?.id || '');
  const [transferItems, setTransferItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products.find((p) => p.trackInventory)?.id || '', quantity: 5 },
  ]);
  const [transferNotes, setTransferNotes] = useState('');

  const handleAddWarehouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim() || !whCode.trim()) {
      showToast('Please enter warehouse name and code', 'error');
      return;
    }
    addWarehouse({
      name: whName,
      code: whCode.toUpperCase(),
      address: whAddress,
      city: whCity,
      phone: whPhone,
      isDefault: false,
      active: true,
    });
    showToast(`Warehouse "${whName}" created successfully!`, 'success');
    setShowAddWarehouseModal(false);
    setWhName('');
    setWhCode('');
    setWhAddress('');
  };

  const handleStockTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWh === toWh) {
      showToast('Source and destination warehouses cannot be the same', 'error');
      return;
    }

    const itemsToTransfer = transferItems.map((ti) => {
      const prod = products.find((p) => p.id === ti.productId);
      return {
        productId: ti.productId,
        productName: prod?.name || 'Product',
        quantity: Number(ti.quantity),
        unitPrice: prod?.purchasePrice || 0,
      };
    });

    recordStockTransfer({
      date: new Date().toISOString().split('T')[0],
      fromWarehouseId: fromWh,
      toWarehouseId: toWh,
      status: 'completed',
      items: itemsToTransfer,
      notes: transferNotes || 'Internal store stock transfer',
    });

    showToast('Stock transfer challan executed & inventory transferred!', 'success');
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-brand-600" />
            <span>Multi-Warehouse &amp; Plant Network</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage physical retail outlets, centralized dry cleaning plants, and stock transfer challans.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>+ Stock Transfer Challan</span>
          </button>
          <button
            onClick={() => setShowAddWarehouseModal(true)}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Warehouse</span>
          </button>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {warehouses.map((wh) => {
          // Count total inventory items held at this warehouse
          const totalItemsCount = products
            .filter((p) => p.trackInventory)
            .reduce((sum, p) => sum + ((p.warehouseStock && p.warehouseStock[wh.id]) || 0), 0);

          return (
            <div
              key={wh.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-soft-sm space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black uppercase text-brand-700 bg-brand-50 px-2.5 py-1 rounded-xl">
                  {wh.code}
                </span>
                {wh.isDefault && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ★ Primary Hub
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{wh.name}</h3>
                <div className="flex items-start space-x-1.5 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{wh.address}, {wh.city}</span>
                </div>
                {wh.phone && (
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{wh.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Inventory Balance</div>
                  <div className="font-black text-slate-900 text-sm">{totalItemsCount} Units</div>
                </div>
                <button
                  onClick={() => {
                    setFromWh(wh.id);
                    setShowTransferModal(true);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px]"
                >
                  Dispatch →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Transfers History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-brand-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Stock Transfer Challans History</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">{stockTransfers.length} Transfers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Transfer #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">From Warehouse</th>
                <th className="py-2.5 px-3">To Warehouse</th>
                <th className="py-2.5 px-3">Items Transferred</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stockTransfers.map((t) => {
                const source = warehouses.find((w) => w.id === t.fromWarehouseId);
                const target = warehouses.find((w) => w.id === t.toWarehouseId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{t.transferNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500">{t.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">{source?.name.split('—')[0]}</td>
                    <td className="py-2.5 px-3 font-bold text-brand-700">{target?.name.split('—')[0]}</td>
                    <td className="py-2.5 px-3">
                      {t.items.map((it, idx) => (
                        <div key={idx} className="text-[11px] text-slate-600">
                          {it.productName} ({it.quantity} units)
                        </div>
                      ))}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {stockTransfers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No inter-warehouse transfers recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD WAREHOUSE MODAL */}
      {showAddWarehouseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Add New Warehouse / Outlet</h3>
              <button onClick={() => setShowAddWarehouseModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWarehouseSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Warehouse Name</label>
                <input
                  type="text"
                  placeholder="e.g. Branch 3 — Civil Lines Hub"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Warehouse Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WH-CL03"
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={whPhone}
                    onChange={(e) => setWhPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Near Bus Stand, Civil Lines"
                  value={whAddress}
                  onChange={(e) => setWhAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWarehouseModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Transfer Stock Between Hubs</h3>
              <button onClick={() => setShowTransferModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockTransferSubmit} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">From (Source)</label>
                  <select
                    value={fromWh}
                    onChange={(e) => setFromWh(e.target.value)}
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
                  <label className="block text-slate-700 mb-1">To (Destination)</label>
                  <select
                    value={toWh}
                    onChange={(e) => setToWh(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Item to Transfer</label>
                <select
                  value={transferItems[0]?.productId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setTransferItems([{ productId: id, quantity: transferItems[0]?.quantity || 1 }]);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {products
                    .filter((p) => p.trackInventory)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Quantity Units</label>
                <input
                  type="number"
                  min={1}
                  value={transferItems[0]?.quantity}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    setTransferItems([{ productId: transferItems[0]?.productId, quantity: q }]);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Transfer Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Daily plant replenishment"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm"
                >
                  Execute Transfer Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

