import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import {
  Settings,
  Save,
  Printer,
  Layers,
  Building2,
  CheckCircle2,
  RotateCcw,
  Sliders,
  DollarSign,
  Tag,
  Shield,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

export const BillingSettingsView: React.FC = () => {
  const { billingSettings, updateBillingSettings, eraseAllBusinessData } = useBusiness();
  const { showToast, eraseAllPlatformData } = useApp();

  const [form, setForm] = useState({ ...billingSettings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBillingSettings(form);
    showToast('Billing & Invoicing configuration saved successfully!', 'success');
  };

  const handleFactoryReset = () => {
    eraseAllBusinessData();
    eraseAllPlatformData();
    setShowResetConfirm(false);
    showToast('All business documents, orders, parties, and ledger data have been completely erased!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Settings className="w-5 h-5 text-brand-600" />
            <span>Billing, Invoicing &amp; Sync Engine Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure financial-year numbering sequences, automated e-commerce invoice rules, stock deduction policies and print layouts.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Document Numbering Prefixes */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Tag className="w-4 h-4 text-brand-600" />
            <span>Document Numbering &amp; Financial Year Sequences</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">Tax Invoice Prefix</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
              <span className="text-[10px] text-slate-400">e.g. {form.invoicePrefix}/{form.financialYear}/0001</span>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Sales Order Prefix</label>
              <input
                type="text"
                value={form.salesOrderPrefix}
                onChange={(e) => setForm({ ...form, salesOrderPrefix: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Quotation Prefix</label>
              <input
                type="text"
                value={form.quotationPrefix}
                onChange={(e) => setForm({ ...form, quotationPrefix: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Financial Year Code</label>
              <input
                type="text"
                value={form.financialYear}
                onChange={(e) => setForm({ ...form, financialYear: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
              <span className="text-[10px] text-slate-400">e.g. 2026-27</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold pt-2">
            <div>
              <label className="block text-slate-700 mb-1">Purchase Order Prefix</label>
              <input
                type="text"
                value={form.purchaseOrderPrefix}
                onChange={(e) => setForm({ ...form, purchaseOrderPrefix: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Purchase Bill Prefix</label>
              <input
                type="text"
                value={form.purchaseBillPrefix}
                onChange={(e) => setForm({ ...form, purchaseBillPrefix: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Credit Note Prefix</label>
              <input
                type="text"
                value={form.creditNotePrefix}
                onChange={(e) => setForm({ ...form, creditNotePrefix: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Delivery Challan Prefix</label>
              <input
                type="text"
                value={form.deliveryChallanPrefix}
                onChange={(e) => setForm({ ...form, deliveryChallanPrefix: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* E-Commerce Synchronization & Accounting Policy */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-brand-600" />
            <span>E-Commerce Integration &amp; Automation Policies</span>
          </h3>

          <div className="space-y-3 text-xs font-bold">
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900 block">
                  Automatic Invoice Generation on Order Confirmation
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  When a customer books online or admin confirms an order, immediately create a GST Tax Invoice.
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.autoGenerateInvoiceOnConfirmedOrder}
                onChange={(e) =>
                  setForm({ ...form, autoGenerateInvoiceOnConfirmedOrder: e.target.checked })
                }
                className="w-5 h-5 text-brand-600 rounded"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900 block">
                  Auto-Synchronize E-Commerce Customers as Business Parties
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Creates party profile in My BillBook Khata ledger with addresses and mobile tracking.
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.autoSyncEcommerceCustomers}
                onChange={(e) =>
                  setForm({ ...form, autoSyncEcommerceCustomers: e.target.checked })
                }
                className="w-5 h-5 text-brand-600 rounded"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900 block">
                  Double-Entry Automatic Journal Posting
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Automatically posts debit/credit vouchers for sales, purchases, and customer receipts.
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.autoPostAccountingEntries}
                onChange={(e) =>
                  setForm({ ...form, autoPostAccountingEntries: e.target.checked })
                }
                className="w-5 h-5 text-brand-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Stock Deduction Policy & Printing Settings */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Printer className="w-4 h-4 text-brand-600" />
            <span>Inventory Deduction &amp; Thermal Printing Layouts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">Authoritative Stock Deduction Policy</label>
              <select
                value={form.stockDeductionPolicy}
                onChange={(e) => setForm({ ...form, stockDeductionPolicy: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="on_invoice_creation">Deduct on Invoice / Challan Creation (Recommended)</option>
                <option value="on_order_dispatch">Deduct on Order Dispatch to Rider</option>
                <option value="manual">Manual Stock Deduction Only</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Thermal Receipt Paper Width</label>
              <select
                value={form.thermalPaperWidth}
                onChange={(e) => setForm({ ...form, thermalPaperWidth: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="80mm">80mm Standard POS Thermal Paper (3-inch)</option>
                <option value="58mm">58mm Compact POS Thermal Paper (2-inch)</option>
              </select>
            </div>
          </div>
        </div>

        {/* DANGER ZONE / FACTORY RESET */}
        <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-6 space-y-4 shadow-soft-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-rose-800 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Danger Zone — Factory Reset &amp; Erase All Data</span>
              </h3>
              <p className="text-xs text-rose-600/80">
                Permanently wipes all invoices, sales orders, purchase bills, parties, ledger entries, e-commerce orders, and stored browser data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-sm whitespace-nowrap self-start sm:self-auto transition-transform"
            >
              <Trash2 className="w-4 h-4" />
              <span>Erase All Data</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-5">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Confirm Factory Reset?</h4>
                <p className="text-xs text-slate-500">This action is permanent and cannot be undone</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-4 text-xs text-rose-900 space-y-2">
              <p className="font-bold text-rose-800">The following records will be erased:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-700">
                <li>All GST invoices, quotations, sales orders &amp; purchase bills</li>
                <li>All parties (customers, suppliers, party khata balances)</li>
                <li>Authoritative stock ledger &amp; warehouse inventory</li>
                <li>Double-entry chart of accounts &amp; journal postings</li>
                <li>All e-commerce customer orders, cart, and delivery statuses</li>
                <li>All browser storage under platform keys</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFactoryReset}
                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md active:scale-95 flex items-center space-x-1.5 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Erase Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

