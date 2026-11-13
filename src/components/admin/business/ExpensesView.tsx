import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import { Expense } from '../../../types';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  Building2,
  Calendar,
  Trash2,
  X,
  Tag,
  Receipt,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, accounts, showToast } = useApp();
  const { chartOfAccounts, createJournalEntry } = useBusiness();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New expense form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Detergents & Chemicals');
  const [amount, setAmount] = useState('');
  const [paidViaAccountId, setPaidViaAccountId] = useState(accounts[0]?.id || '');
  const [branch, setBranch] = useState<Expense['branch']>('Branch 1 - Nehru Nagar');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [gstRate, setGstRate] = useState<number>(18);
  const [claimItc, setClaimItc] = useState<boolean>(true);

  const filteredExpenses = expenses.filter((e) => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (branchFilter !== 'all' && e.branch !== branchFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchVendor = (e.vendorName || '').toLowerCase().includes(q);
      const matchRec = (e.receiptNumber || '').toLowerCase().includes(q);
      if (!matchTitle && !matchVendor && !matchRec) return false;
    }
    return true;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (!title.trim() || !numAmt || numAmt <= 0) {
      showToast('Please enter a valid expense title and amount', 'error');
      return;
    }

    const acc = accounts.find((a) => a.id === paidViaAccountId) || accounts[0];

    // Add to AppContext expenses (which updates local accounts)
    addExpense({
      title,
      category,
      amount: numAmt,
      paidViaAccountId: acc?.id || 'acc-cash',
      accountName: acc?.name || 'Cash in Hand',
      branch,
      date,
      receiptNumber: receiptNumber || undefined,
      vendorName: vendorName || undefined,
      note: claimItc ? `Claiming ${gstRate}% GST Input Tax Credit (ITC)` : undefined,
    });

    // Also auto-post double-entry journal entry!
    const taxable = claimItc ? Math.round((numAmt / (1 + gstRate / 100)) * 100) / 100 : numAmt;
    const itcAmount = Math.round((numAmt - taxable) * 100) / 100;

    const jvLines: any[] = [
      {
        accountId: 'acc-rent', // expense
        accountName: `${category} Expense`,
        debit: taxable,
        credit: 0,
      },
    ];

    if (claimItc && itcAmount > 0) {
      jvLines.push({
        accountId: 'acc-cgst-in',
        accountName: 'Input CGST (ITC)',
        debit: Math.round((itcAmount / 2) * 100) / 100,
        credit: 0,
      });
      jvLines.push({
        accountId: 'acc-sgst-in',
        accountName: 'Input SGST (ITC)',
        debit: Math.round((itcAmount / 2) * 100) / 100,
        credit: 0,
      });
    }

    jvLines.push({
      accountId: 'acc-cash',
      accountName: acc?.name || 'Cash in Hand',
      debit: 0,
      credit: numAmt,
    });

    createJournalEntry({
      date,
      voucherType: 'payment',
      narration: `Expense: ${title} (${category}) paid via ${acc?.name}`,
      lines: jvLines,
      totalDebit: numAmt,
      totalCredit: numAmt,
    });

    setShowModal(false);
    setTitle('');
    setAmount('');
    setReceiptNumber('');
    setVendorName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-rose-600" />
            <span>Operating Expenses &amp; GST ITC</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track chemicals, machinery repairs, rent, salaries, boiler power, packaging and claim GST Input Tax Credits.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Business Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Expenses Recorded</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            ₹{totalExpenseAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {filteredExpenses.length} Expense Vouchers
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Top Expense Head</div>
          <div className="text-xl font-black text-slate-800 mt-1 truncate">
            Detergents &amp; Chemicals
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            High volume wash production consumables
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-emerald-600 uppercase">Input Tax Credit (ITC) Offsets</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{Math.round(totalExpenseAmount * 0.15).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Deductible against GST Output liability
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
          >
            <option value="all">All Expense Categories</option>
            <option value="Detergents & Chemicals">Detergents & Chemicals</option>
            <option value="Machinery & Maintenance">Machinery & Maintenance</option>
            <option value="Packaging & Hangers">Packaging & Hangers</option>
            <option value="Staff Salaries">Staff Salaries</option>
            <option value="Shop Rent">Shop Rent</option>
            <option value="Electricity & Water">Electricity & Water</option>
            <option value="Fuel & Transport">Fuel & Transport</option>
            <option value="Tea & Refreshment">Tea & Refreshment</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search expense title, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vendor &amp; Receipt #</th>
                <th className="py-3 px-4">Paid Via Account</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-500">{e.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-[13px]">{e.title}</div>
                    {e.note && <div className="text-[10px] text-emerald-600 font-bold">{e.note}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{e.vendorName || '— Store Vendor'}</div>
                    {e.receiptNumber && (
                      <div className="text-[10px] text-slate-400 font-mono">#{e.receiptNumber}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-bold">{e.accountName}</td>
                  <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                    ₹{e.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete expense "${e.title}"?`)) {
                          deleteExpense(e.id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Record Business Expense</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Expense Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Commercial Oxygen Bleach 20L"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Detergents & Chemicals">Detergents & Chemicals</option>
                    <option value="Machinery & Maintenance">Machinery & Maintenance</option>
                    <option value="Packaging & Hangers">Packaging & Hangers</option>
                    <option value="Staff Salaries">Staff Salaries</option>
                    <option value="Shop Rent">Shop Rent</option>
                    <option value="Electricity & Water">Electricity & Water</option>
                    <option value="Fuel & Transport">Fuel & Transport</option>
                    <option value="Tea & Refreshment">Tea & Refreshment</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-rose-600 font-black text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Paid From Account</label>
                  <select
                    value={paidViaAccountId}
                    onChange={(e) => setPaidViaAccountId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (₹{a.currentBalance})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. Rewa Packing Store"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Receipt / Bill #</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">Claim GST Input Tax Credit (ITC)</span>
                  <span className="text-[10px] text-emerald-700 font-normal">Offset against outward GST liability</span>
                </div>
                <input
                  type="checkbox"
                  checked={claimItc}
                  onChange={(e) => setClaimItc(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

