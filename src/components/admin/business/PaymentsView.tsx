import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Building2,
  CheckCircle2,
  Clock,
  Receipt,
  X,
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { documents, parties, recordDocumentPayment } = useBusiness();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all payment allocations across all documents
  const allPayments: {
    id: string;
    type: 'inflow' | 'outflow';
    documentNumber: string;
    documentType: string;
    partyName: string;
    date: string;
    amount: number;
    paymentMode: string;
    referenceNumber?: string;
  }[] = [];

  documents.forEach((doc) => {
    const isOutflow =
      doc.documentType === 'purchase_bill' ||
      doc.documentType === 'purchase_order' ||
      doc.documentType === 'debit_note';

    doc.allocations?.forEach((alloc) => {
      allPayments.push({
        id: alloc.id,
        type: isOutflow ? 'outflow' : 'inflow',
        documentNumber: doc.documentNumber,
        documentType: doc.documentType,
        partyName: doc.partyName,
        date: alloc.paymentDate || doc.date,
        amount: alloc.amount,
        paymentMode: alloc.paymentMode,
        referenceNumber: alloc.referenceNumber,
      });
    });
  });

  const filteredPayments = allPayments.filter((p) => {
    if (activeTab !== 'all' && p.type !== activeTab) return false;
    if (paymentModeFilter !== 'all' && p.paymentMode !== paymentModeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDoc = p.documentNumber.toLowerCase().includes(q);
      const matchParty = p.partyName.toLowerCase().includes(q);
      const matchRef = (p.referenceNumber || '').toLowerCase().includes(q);
      if (!matchDoc && !matchParty && !matchRef) return false;
    }
    return true;
  });

  const totalInflow = allPayments
    .filter((p) => p.type === 'inflow')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOutflow = allPayments
    .filter((p) => p.type === 'outflow')
    .reduce((sum, p) => sum + p.amount, 0);

  const netCashFlow = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-brand-600" />
            <span>Payments &amp; Cashflow Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking for customer receipts (Cash, UPI, Razorpay) and supplier voucher disbursements.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 uppercase">
            <span>Total Collections (Inflows)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            +₹{totalInflow.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Received from Customer Invoices
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs font-bold text-rose-600 uppercase">
            <span>Total Payouts (Outflows)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            -₹{totalOutflow.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Disbursed to Suppliers &amp; Vendors
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Net Operating Cash Flow</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{netCashFlow.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            Healthy Inflow Surplus
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Transactions ({allPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('inflow')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'inflow' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-slate-600'
            }`}
          >
            ↓ Collections (Inflows)
          </button>
          <button
            onClick={() => setActiveTab('outflow')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'outflow' ? 'bg-white text-rose-800 shadow-xs font-black' : 'text-slate-600'
            }`}
          >
            ↑ Payouts (Outflows)
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5"
          >
            <option value="all">All Modes</option>
            <option value="Cash">Cash Drawer</option>
            <option value="UPI">UPI / PhonePe</option>
            <option value="Bank Transfer">Bank Transfer (NEFT)</option>
            <option value="Razorpay">Razorpay Gateway</option>
          </select>

          <div className="relative max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search party, doc #, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Party / Contact</th>
                <th className="py-3 px-4">Linked Document #</th>
                <th className="py-3 px-4">Payment Mode &amp; Ref</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-500">{p.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.type === 'inflow'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.type === 'inflow' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      <span>{p.type === 'inflow' ? 'Receipt In' : 'Payment Out'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.partyName}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">
                    {p.documentNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-bold">{p.paymentMode}</div>
                    {p.referenceNumber && (
                      <div className="text-[10px] text-slate-400 font-mono">{p.referenceNumber}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-sm">
                    <span className={p.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700'}>
                      {p.type === 'inflow' ? `+₹${p.amount.toLocaleString('en-IN')}` : `-₹${p.amount.toLocaleString('en-IN')}`}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No payment transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

