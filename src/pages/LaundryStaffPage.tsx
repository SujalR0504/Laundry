import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shirt,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Save,
  Tag,
  Filter,
} from 'lucide-react';
import { OrderStatus } from '../types';

export const LaundryStaffPage: React.FC = () => {
  const { orders, updateOrderStatus, updateLaundryNotes, openInvoice, showToast } = useApp();
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [internalNoteInput, setInternalNoteInput] = useState('');

  // Orders that are relevant to the laundry facility
  const laundryOrders = orders.filter((o) =>
    [
      'Received at Laundry',
      'Inspection',
      'Cleaning / Washing',
      'Quality Check',
      'Ready for Delivery',
      'Picked Up',
    ].includes(o.orderStatus)
  );

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || laundryOrders[0] || orders[0];

  const handleStatusChange = (status: OrderStatus) => {
    if (!activeOrder) return;
    updateOrderStatus(activeOrder.id, status, `Updated on wash line to ${status}`);
  };

  const handleSaveNotes = () => {
    if (!activeOrder) return;
    updateLaundryNotes(activeOrder.id, internalNoteInput);
    setInternalNoteInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-accent-300">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
              Facility Wash Line Master
            </span>
            <h1 className="text-xl sm:text-2xl font-black">Garment Intake & Processing Station</h1>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-emerald-200">Active Garments on Line</div>
          <div className="text-xl font-black text-white">{laundryOrders.length} Orders</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue of Orders */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-soft-sm space-y-3">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Incoming & Washing Queue ({laundryOrders.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {laundryOrders.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No active orders at facility right now.
              </div>
            ) : (
              laundryOrders.map((o) => {
                const isSelected = activeOrder?.id === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => {
                      setSelectedOrderId(o.id);
                      setInternalNoteInput(o.laundryInternalNotes || '');
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {o.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {o.orderStatus}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-1 flex justify-between">
                      <span>{o.customerName}</span>
                      <span className="font-semibold">{o.items.length} garments</span>
                    </div>

                    {o.items.some((i) => i.specialInstructions) && (
                      <div className="mt-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded truncate font-medium">
                        ⚠️ Special Wash Instructions Included
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Order Garments & Inspection Station */}
        {activeOrder && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-base font-black text-slate-900">
                  {activeOrder.orderNumber}
                </span>
                <p className="text-xs text-slate-500">
                  Customer: {activeOrder.customerName} ({activeOrder.customerPhone})
                </p>
              </div>

              <button
                onClick={() => openInvoice(activeOrder)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Job Ticket</span>
              </button>
            </div>

            {/* Quick Status Advance Stepper */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Advance Processing Stage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold">
                {[
                  { status: 'Received at Laundry', label: '1. Mark Received' },
                  { status: 'Inspection', label: '2. In Inspection' },
                  { status: 'Cleaning / Washing', label: '3. In Wash Cycle' },
                  { status: 'Quality Check', label: '4. Quality Check' },
                  { status: 'Ready for Delivery', label: '5. Pack & Ready' },
                ].map((s) => {
                  const isCurrent = activeOrder.orderStatus === s.status;
                  return (
                    <button
                      key={s.status}
                      onClick={() => handleStatusChange(s.status as OrderStatus)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Itemized Garment List for checking */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Garments Inspection Checklist ({activeOrder.items.length})
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {activeOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.service.image}
                        alt={item.service.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{item.service.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Unit: {item.service.unit} • Qty: {item.quantity}
                        </div>
                        {item.specialInstructions && (
                          <div className="text-[10px] text-amber-700 font-semibold italic">
                            Instruction: "{item.specialInstructions}"
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-slate-700">
                      ₹{item.selectedPrice * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Laundry Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <label className="font-bold text-slate-700 block">
                Wash Master / Technician Internal Log Notes
              </label>
              <textarea
                rows={3}
                value={internalNoteInput}
                onChange={(e) => setInternalNoteInput(e.target.value)}
                placeholder="Log stain pre-treatment, fabric fragility notes, or solvent details here..."
                className="w-full p-3 rounded-2xl border border-slate-300 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Log Notes</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
