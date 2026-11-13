import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerDueRecord } from '../../types';
import {
  Search,
  Plus,
  Download,
  Phone,
  MessageCircle,
  Receipt,
  User,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  TrendingDown,
  Printer,
  Trash2,
  X,
  CreditCard,
  Wallet,
  ArrowRight,
  Send,
  Users,
  Clock,
  Filter,
  Check,
  QrCode,
  RefreshCw,
} from 'lucide-react';

export const CustomerDuesManager: React.FC = () => {
  const {
    customerDues,
    orders,
    accounts,
    recordDuePayment,
    addCustomerDue,
    deleteCustomerDue,
    resetToMyBillBookDues,
    businessSettings,
    showToast,
    selectedGlobalBranch,
    setSelectedGlobalBranch,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const branchFilter = selectedGlobalBranch;
  const setBranchFilter = setSelectedGlobalBranch;
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'cleared'>('pending');
  const [sortBy, setSortBy] = useState<'due_desc' | 'due_asc' | 'name_asc' | 'date_desc'>('due_desc');
  const [viewMode, setViewMode] = useState<'all_records' | 'customer_summary'>('all_records');

  // Modals state
  const [showAddDueModal, setShowAddDueModal] = useState(false);
  const [newDueForm, setNewDueForm] = useState({
    customerName: '',
    customerPhone: '',
    totalBilled: '',
    totalPaid: '0',
    branch: 'The Laundry Lounge',
    notes: '',
  });

  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectData, setCollectData] = useState<{
    dueId: string;
    customerName: string;
    customerPhone: string;
    pendingDue: number;
    amountPaid: string;
    accountId: string;
    paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
    note: string;
  }>({
    dueId: '',
    customerName: '',
    customerPhone: '',
    pendingDue: 0,
    amountPaid: '',
    accountId: accounts[0]?.id || '',
    paymentMode: 'Cash',
    note: '',
  });

  // Statement / Slip Modal state
  const [selectedSlipRecord, setSelectedSlipRecord] = useState<CustomerDueRecord | null>(null);

  // 1. KPI Calculations
  const totalPendingDue = customerDues.reduce((sum, d) => sum + (d.pendingDue || 0), 0);
  const totalCollected = customerDues.reduce((sum, d) => sum + (d.totalPaid || 0), 0);
  const totalBilled = customerDues.reduce((sum, d) => sum + (d.totalBilled || 0), 0);
  const customersWithPendingDueCount = customerDues.filter((d) => (d.pendingDue || 0) > 0).length;

  // 2. Filtered & Sorted Dues
  const filteredDues = useMemo(() => {
    return customerDues
      .filter((d) => {
        const matchesSearch =
          d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.customerPhone.includes(searchQuery) ||
          (d.notes && d.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesBranch =
          branchFilter === 'all' ||
          d.branch === branchFilter ||
          (branchFilter === 'The Laundry Lounge' && (!d.branch || d.branch === 'The Laundry Lounge' || d.branch.includes('Arun') || d.branch.includes('Retail'))) ||
          (branchFilter === 'Hari Om Laundry' && (d.branch === 'Hari Om Laundry' || d.branch.includes('Hari Om') || d.branch.includes('Ring Road') || d.branch.includes('Nehru')));

        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'pending'
            ? (d.pendingDue || 0) > 0
            : (d.pendingDue || 0) <= 0;

        return matchesSearch && matchesBranch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'due_desc') return (b.pendingDue || 0) - (a.pendingDue || 0);
        if (sortBy === 'due_asc') return (a.pendingDue || 0) - (b.pendingDue || 0);
        if (sortBy === 'name_asc') return a.customerName.localeCompare(b.customerName);
        if (sortBy === 'date_desc') {
          return new Date(b.lastPaymentDate || 0).getTime() - new Date(a.lastPaymentDate || 0).getTime();
        }
        return 0;
      });
  }, [customerDues, searchQuery, branchFilter, statusFilter, sortBy]);

  // 3. Customer Summary (Aggregated per customer phone)
  const customerSummaries = useMemo(() => {
    const map = new Map<
      string,
      {
        customerName: string;
        customerPhone: string;
        branches: Set<string>;
        totalBilled: number;
        totalPaid: number;
        pendingDue: number;
        records: CustomerDueRecord[];
        lastPaymentDate?: string;
      }
    >();

    customerDues.forEach((d) => {
      const phoneKey = d.customerPhone.trim() || d.customerName.trim();
      const existing = map.get(phoneKey);
      if (existing) {
        existing.branches.add(d.branch);
        existing.totalBilled += d.totalBilled || 0;
        existing.totalPaid += d.totalPaid || 0;
        existing.pendingDue += d.pendingDue || 0;
        existing.records.push(d);
        if (d.lastPaymentDate && (!existing.lastPaymentDate || d.lastPaymentDate > existing.lastPaymentDate)) {
          existing.lastPaymentDate = d.lastPaymentDate;
        }
      } else {
        map.set(phoneKey, {
          customerName: d.customerName,
          customerPhone: d.customerPhone,
          branches: new Set([d.branch]),
          totalBilled: d.totalBilled || 0,
          totalPaid: d.totalPaid || 0,
          pendingDue: d.pendingDue || 0,
          records: [d],
          lastPaymentDate: d.lastPaymentDate,
        });
      }
    });

    return Array.from(map.values())
      .filter((c) => {
        const matchesSearch =
          c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.customerPhone.includes(searchQuery);
        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'pending'
            ? c.pendingDue > 0
            : c.pendingDue <= 0;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'due_desc') return b.pendingDue - a.pendingDue;
        if (sortBy === 'due_asc') return a.pendingDue - b.pendingDue;
        if (sortBy === 'name_asc') return a.customerName.localeCompare(b.customerName);
        return 0;
      });
  }, [customerDues, searchQuery, statusFilter, sortBy]);

  // Handle Add Due Submission
  const handleCreateDue = (e: React.FormEvent) => {
    e.preventDefault();
    const billed = parseFloat(newDueForm.totalBilled);
    const paid = parseFloat(newDueForm.totalPaid) || 0;

    if (!newDueForm.customerName.trim()) {
      showToast('Please enter customer name', 'error');
      return;
    }
    if (isNaN(billed) || billed <= 0) {
      showToast('Please enter a valid billed amount', 'error');
      return;
    }
    if (paid > billed) {
      showToast('Paid amount cannot exceed billed amount', 'error');
      return;
    }

    addCustomerDue({
      customerId: 'cust-' + Date.now(),
      customerName: newDueForm.customerName.trim(),
      customerPhone: newDueForm.customerPhone.trim() || '9893733683',
      totalBilled: billed,
      totalPaid: paid,
      pendingDue: Math.max(0, billed - paid),
      branch: newDueForm.branch,
      lastPaymentDate: paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
      notes: newDueForm.notes.trim() || 'Offline Counter Khata order',
    });

    setShowAddDueModal(false);
    setNewDueForm({
      customerName: '',
      customerPhone: '',
      totalBilled: '',
      totalPaid: '0',
      branch: 'Branch 1 - Nehru Nagar',
      notes: '',
    });
  };

  // Handle Collect Due Submission
  const handleCollectDue = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(collectData.amountPaid);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid amount to collect', 'error');
      return;
    }
    if (amountNum > collectData.pendingDue) {
      showToast(`Amount cannot exceed pending due of ₹${collectData.pendingDue}`, 'error');
      return;
    }

    recordDuePayment(
      collectData.dueId,
      amountNum,
      collectData.accountId,
      collectData.paymentMode,
      collectData.note || 'Payment received against due'
    );

    setShowCollectModal(false);
  };

  // WhatsApp Reminder Handler
  const handleSendWhatsAppReminder = (due: CustomerDueRecord) => {
    const cleanPhone = due.customerPhone.replace(/\D/g, '');
    const upiId = businessSettings?.upiId || 'thelaundrylounge@upi';
    const msg = `नमस्ते ${due.customerName} जी,

The Laundry Lounge (Rewa) से आपकी ₹${due.pendingDue.toLocaleString('en-IN')} की बकाया राशि लंबित है।

📋 विवरण: ${due.notes || 'कपड़े धुलाई / ड्राई क्लीनिंग बिल'}
🏢 शाखा: ${due.branch}
💵 कुल बिल: ₹${due.totalBilled.toLocaleString('en-IN')}
✅ अब तक जमा: ₹${due.totalPaid.toLocaleString('en-IN')}
⚠️ शेष बकाया: ₹${due.pendingDue.toLocaleString('en-IN')}

कृपया शीघ्र भुगतान हेतु नीचे दिए गए UPI ID पर भेजें:
📲 UPI ID: ${upiId}

दुकान पता: The Laundry Lounge, Nehru Nagar / Ring Road, Rewa (M.P.)
हेल्पलाइन: 9893733683 / 9329838804

धन्यवाद! 🙏`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/91${cleanPhone}?text=${encoded}`, '_blank');
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Customer Name', 'Phone', 'Branch', 'Total Billed (INR)', 'Total Paid (INR)', 'Pending Due (INR)', 'Last Payment Date', 'Notes'];
    const rows = filteredDues.map((d) => [
      `"${d.customerName}"`,
      `"${d.customerPhone}"`,
      `"${d.branch}"`,
      d.totalBilled,
      d.totalPaid,
      d.pendingDue,
      d.lastPaymentDate || 'N/A',
      `"${(d.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LaundryLounge_Customer_Dues_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customer Dues CSV downloaded successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. HEADER & HERO KPI CARDS
      ======================================================== */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-rose-900/40 relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 text-[11px] font-black uppercase tracking-wider text-rose-300 bg-rose-950/90 border border-rose-500/40 px-3 py-1 rounded-full">
                <Receipt className="w-3.5 h-3.5 text-rose-400" />
                <span>Customer Udhaar &amp; Dues Khata</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-rose-200 font-semibold">
                {customersWithPendingDueCount} Pending Customers
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              All Customer Dues &amp; Outstanding Balances
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Live tracking for all customer credit balances across Rewa hubs. Collect payments directly into bank/cash drawers and send 1-click WhatsApp reminders.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>MyBillBook Integrated (110 Parties • Dated: 01/12/2023 - 31/10/2026)</span>
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                Target To Collect: <strong className="text-rose-400">₹{totalPendingDue.toLocaleString('en-IN')}</strong>
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={resetToMyBillBookDues}
              className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
              title="Sync & Reset All 110 Parties from MyBillBook (₹19,785 Total Balance)"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync MyBillBook (110)</span>
            </button>

            <button
              onClick={() => setShowAddDueModal(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Customer Due</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border border-slate-700"
              title="Download CSV / Excel Report"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
          {/* Card 1: Total Pending Due */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-rose-500/40 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                Total Pending Due
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
              ₹{totalPendingDue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <Users className="w-3 h-3 text-rose-400" />
              <span>{customersWithPendingDueCount} customers have dues</span>
            </div>
          </div>

          {/* Card 2: Total Collected */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/30 shadow-sm">
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
              Total Dues Collected
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Received in Accounts</span>
            </div>
          </div>

          {/* Card 3: Total Billed */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 shadow-sm">
            <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
              Total Credit Invoiced
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-400 mt-1">
              ₹{totalBilled.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <Receipt className="w-3 h-3 text-sky-400" />
              <span>{customerDues.length} total entries</span>
            </div>
          </div>

          {/* Card 4: Recovery Rate */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 shadow-sm">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Khata Recovery Rate
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {totalBilled - totalCollected <= 0 ? 'All Cleared' : 'Pending Recovery'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. FILTERS, SEARCH & VIEW SWITCHER
      ======================================================== */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name, phone number, or notes..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Branch Filter */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-semibold">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500 bg-white"
              >
                <option value="all">All Branches (Consolidated)</option>
                <option value="The Laundry Lounge">1. The Laundry Lounge</option>
                <option value="Hari Om Laundry">2. Hari Om Laundry</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500 bg-white"
            >
              <option value="pending">Pending Due Only (&gt; ₹0)</option>
              <option value="all">All Records (Pending &amp; Paid)</option>
              <option value="cleared">Cleared / Nil Due (₹0)</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500 bg-white"
            >
              <option value="due_desc">Highest Due First</option>
              <option value="due_asc">Lowest Due First</option>
              <option value="name_asc">Customer Name (A-Z)</option>
              <option value="date_desc">Recent Payment Date</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setViewMode('all_records')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'all_records'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Entries ({filteredDues.length})
              </button>
              <button
                onClick={() => setViewMode('customer_summary')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'customer_summary'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Customer Ledger ({customerSummaries.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MAIN DUE LIST VIEW (TABLE / CARDS)
      ======================================================== */}
      {viewMode === 'all_records' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft-sm">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Customer Due Entries Register</span>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {filteredDues.length} records
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click &quot;Collect Payment&quot; to deposit dues or &quot;WhatsApp Reminder&quot; to request payment.
              </p>
            </div>

            <div className="text-xs font-extrabold text-rose-600 bg-rose-50/80 px-3 py-1 rounded-xl border border-rose-200">
              Filtered Total Due: ₹{filteredDues.reduce((s, d) => s + (d.pendingDue || 0), 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Branch</th>
                  <th className="py-3.5 px-4">Total Billed</th>
                  <th className="py-3.5 px-4">Paid Amount</th>
                  <th className="py-3.5 px-4 text-rose-700 font-black">Pending Due</th>
                  <th className="py-3.5 px-4">Notes / History</th>
                  <th className="py-3.5 px-4">Last Payment</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <span className="font-bold text-sm text-slate-700">No matching customer dues found!</span>
                        <span className="text-xs text-slate-400">All customer accounts are clear or match your search criteria.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDues.map((d) => {
                    const isFullyPaid = (d.pendingDue || 0) <= 0;
                    return (
                      <tr
                        key={d.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !isFullyPaid ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                      >
                        {/* Customer Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                              {d.customerName.charAt(0)}
                            </span>
                            <span className="truncate max-w-[160px] sm:max-w-none">{d.customerName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-1">
                            <a
                              href={`tel:${d.customerPhone}`}
                              className="inline-flex items-center space-x-1 hover:text-emerald-600 transition-colors"
                              title="Click to call"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{d.customerPhone}</span>
                            </a>
                          </div>
                        </td>

                        {/* Branch */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {d.branch}
                          </span>
                        </td>

                        {/* Total Billed */}
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          ₹{(d.totalBilled || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Total Paid */}
                        <td className="py-3.5 px-4 text-emerald-700 font-bold">
                          ₹{(d.totalPaid || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Pending Due Badge */}
                        <td className="py-3.5 px-4">
                          {isFullyPaid ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                              <Check className="w-3 h-3" />
                              <span>Nil / Clear</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-black text-xs border border-rose-300 shadow-2xs">
                              <span>₹{(d.pendingDue || 0).toLocaleString('en-IN')}</span>
                            </span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="py-3.5 px-4 max-w-xs text-slate-600 text-[11px]">
                          <div className="line-clamp-2" title={d.notes}>
                            {d.notes || 'Counter dry cleaning & laundry order'}
                          </div>
                        </td>

                        {/* Last Payment Date */}
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {d.lastPaymentDate ? (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{d.lastPaymentDate}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No payments yet</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Collect Due Button */}
                            {!isFullyPaid && (
                              <button
                                onClick={() => {
                                  setCollectData({
                                    dueId: d.id,
                                    customerName: d.customerName,
                                    customerPhone: d.customerPhone,
                                    pendingDue: d.pendingDue,
                                    amountPaid: d.pendingDue.toString(),
                                    accountId: accounts[0]?.id || '',
                                    paymentMode: 'Cash',
                                    note: 'Payment received against pending bill',
                                  });
                                  setShowCollectModal(true);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-colors shadow-2xs active:scale-95 flex items-center space-x-1"
                                title="Collect Due Payment"
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>Collect</span>
                              </button>
                            )}

                            {/* WhatsApp Reminder Button */}
                            {!isFullyPaid && (
                              <button
                                onClick={() => handleSendWhatsAppReminder(d)}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors active:scale-95"
                                title="Send WhatsApp Payment Reminder (तकादा)"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Print / View Slip Button */}
                            <button
                              onClick={() => setSelectedSlipRecord(d)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                              title="Print Khata Bill Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Record Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove due record for "${d.customerName}"?`)) {
                                  deleteCustomerDue(d.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CUSTOMER SUMMARY / AGGREGATED LEDGER CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customerSummaries.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400">
              No customer dues match the filter criteria.
            </div>
          ) : (
            customerSummaries.map((c, idx) => {
              const isCleared = c.pendingDue <= 0;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-5 border shadow-soft-sm transition-all hover:shadow-md ${
                    isCleared ? 'border-slate-200 opacity-80' : 'border-rose-200 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 font-extrabold flex items-center justify-center text-sm border border-rose-200">
                        {c.customerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{c.customerName}</h4>
                        <a
                          href={`tel:${c.customerPhone}`}
                          className="text-xs text-slate-500 hover:text-emerald-600 flex items-center space-x-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{c.customerPhone}</span>
                        </a>
                      </div>
                    </div>

                    {isCleared ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        All Cleared
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-black border border-rose-300 shadow-2xs">
                        ₹{c.pendingDue.toLocaleString('en-IN')} Due
                      </span>
                    )}
                  </div>

                  {/* Branches */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {Array.from(c.branches).map((b) => (
                      <span key={b} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {b}
                      </span>
                    ))}
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                      {c.records.length} {c.records.length === 1 ? 'order' : 'orders'}
                    </span>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Billed</div>
                      <div className="font-extrabold text-slate-800">₹{c.totalBilled.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Paid</div>
                      <div className="font-extrabold text-emerald-600">₹{c.totalPaid.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-rose-500 font-bold uppercase">Pending</div>
                      <div className="font-extrabold text-rose-600">₹{c.pendingDue.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  {!isCleared && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          const primaryRecord = c.records[0];
                          setCollectData({
                            dueId: primaryRecord.id,
                            customerName: c.customerName,
                            customerPhone: c.customerPhone,
                            pendingDue: c.pendingDue,
                            amountPaid: c.pendingDue.toString(),
                            accountId: accounts[0]?.id || '',
                            paymentMode: 'Cash',
                            note: 'Full customer ledger clearance payment',
                          });
                          setShowCollectModal(true);
                        }}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Collect Due</span>
                      </button>

                      <button
                        onClick={() => handleSendWhatsAppReminder(c.records[0])}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs transition-colors flex items-center space-x-1"
                        title="WhatsApp Reminder"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remind</span>
                      </button>

                      <button
                        onClick={() => setSelectedSlipRecord(c.records[0])}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                        title="Print Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================
          4. MODAL: COLLECT CUSTOMER DUE PAYMENT
      ======================================================== */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Collect Due Payment</h3>
                  <p className="text-xs text-slate-500">Record received payment into account</p>
                </div>
              </div>
              <button
                onClick={() => setShowCollectModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectDue} className="space-y-4 text-xs">
              {/* Customer Info Box */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{collectData.customerName}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{collectData.customerPhone}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-rose-500 uppercase font-bold">Pending Due</div>
                  <div className="font-black text-rose-600 text-base">
                    ₹{collectData.pendingDue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Amount to Collect Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700">Amount Received (₹):</label>
                  <button
                    type="button"
                    onClick={() => setCollectData({ ...collectData, amountPaid: collectData.pendingDue.toString() })}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    Full Due (₹{collectData.pendingDue})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={collectData.pendingDue}
                    value={collectData.amountPaid}
                    onChange={(e) => setCollectData({ ...collectData, amountPaid: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 text-sm font-extrabold border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Payment Mode:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cash', 'UPI', 'Bank Transfer'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setCollectData({ ...collectData, paymentMode: mode })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        collectData.paymentMode === mode
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Into Account */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Deposit / Credit Into Account:</label>
                <select
                  value={collectData.accountId}
                  onChange={(e) => setCollectData({ ...collectData, accountId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.bankName} - ₹{acc.currentBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Note */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Remarks / Receipt Note (Optional):</label>
                <input
                  type="text"
                  value={collectData.note}
                  onChange={(e) => setCollectData({ ...collectData, note: e.target.value })}
                  placeholder="e.g. Received cash from counter / PhonePe payment"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          5. MODAL: ADD MANUAL CUSTOMER DUE
      ======================================================== */}
      {showAddDueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  +
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Add Customer Due (उधार एंट्री)</h3>
                  <p className="text-xs text-slate-500">Record offline walk-in credit or pending balance</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDueModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDue} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newDueForm.customerName}
                    onChange={(e) => setNewDueForm({ ...newDueForm, customerName: e.target.value })}
                    placeholder="e.g. Advocate R. P. Tiwari"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newDueForm.customerPhone}
                    onChange={(e) => setNewDueForm({ ...newDueForm, customerPhone: e.target.value })}
                    placeholder="e.g. 9826374910"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Billed (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDueForm.totalBilled}
                    onChange={(e) => setNewDueForm({ ...newDueForm, totalBilled: e.target.value })}
                    placeholder="e.g. 3500"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Amount Paid Now (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newDueForm.totalPaid}
                    onChange={(e) => setNewDueForm({ ...newDueForm, totalPaid: e.target.value })}
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-rose-700">Net Pending Due (₹)</label>
                  <div className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl font-black text-rose-600 text-sm">
                    ₹{Math.max(0, (parseFloat(newDueForm.totalBilled) || 0) - (parseFloat(newDueForm.totalPaid) || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Branch Location</label>
                <select
                  value={newDueForm.branch}
                  onChange={(e) => setNewDueForm({ ...newDueForm, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold bg-white focus:outline-none focus:border-rose-500"
                >
                  <option value="The Laundry Lounge">1. The Laundry Lounge</option>
                  <option value="Hari Om Laundry">2. Hari Om Laundry</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Service Items &amp; Notes</label>
                <textarea
                  rows={2}
                  value={newDueForm.notes}
                  onChange={(e) => setNewDueForm({ ...newDueForm, notes: e.target.value })}
                  placeholder="e.g. 5 Woolen Blazers Dry Cleaned, promised to clear payment on Sunday"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddDueModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Due Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          6. MODAL: PRINT / VIEW KHATA BILL SLIP
      ======================================================== */}
      {selectedSlipRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-slate-700" />
                <h3 className="font-extrabold text-base text-slate-900">Customer Udhaar Slip / Statement</h3>
              </div>
              <button
                onClick={() => setSelectedSlipRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Paper */}
            <div id="printable-due-slip" className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/80 space-y-4 text-xs font-mono">
              <div className="text-center border-b border-amber-200/80 pb-3">
                <h4 className="font-extrabold text-base text-slate-900 font-sans tracking-tight">
                  THE LAUNDRY LOUNGE
                </h4>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                  Premium Dry Cleaning &amp; Wet Wash Hub
                </p>
                <p className="text-[10px] text-slate-500">
                  {selectedSlipRecord.branch} • Rewa (M.P.) • Ph: 9893733683
                </p>
              </div>

              {/* Customer & Bill details */}
              <div className="space-y-1.5 pt-1 text-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold">{selectedSlipRecord.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-bold">{selectedSlipRecord.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{selectedSlipRecord.lastPaymentDate || new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Record Ref:</span>
                  <span>{selectedSlipRecord.id}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="p-2.5 bg-white/70 rounded-xl border border-amber-200/60 text-[11px] text-slate-700">
                <span className="font-bold">Remarks: </span>
                <span>{selectedSlipRecord.notes || 'Counter service charges'}</span>
              </div>

              {/* Amounts summary */}
              <div className="border-t border-b border-amber-200/80 py-2.5 space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Total Billed Amount:</span>
                  <span className="font-bold">₹{selectedSlipRecord.totalBilled.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Total Amount Paid:</span>
                  <span className="font-bold">₹{selectedSlipRecord.totalPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold text-sm pt-1 border-t border-amber-200/60">
                  <span>BALANCE DUE:</span>
                  <span>₹{selectedSlipRecord.pendingDue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500 space-y-1">
                <p>UPI ID: {businessSettings?.upiId || 'thelaundrylounge@upi'}</p>
                <p>Thank you for choosing The Laundry Lounge!</p>
              </div>
            </div>

            {/* Slip Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleSendWhatsAppReminder(selectedSlipRecord)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedSlipRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
