import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import { BusinessParty } from '../../../business/types';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Receipt,
  X,
  CreditCard,
  Building2,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Calendar,
  Share2,
  UploadCloud,
  Check,
  Edit2,
  MapPin,
} from 'lucide-react';
import { useImport } from '../../../business/ImportContext';

export interface BranchOption {
  id: string;
  name: string;
  label: string;
  code: string;
  shortArea: string;
}

export const AVAILABLE_BRANCHES: BranchOption[] = [
  { id: 'all', name: 'All Branches', label: 'All Branches (Consolidated)', code: 'ALL', shortArea: 'Both Branches' },
  { id: 'wh-main', name: 'The Laundry Lounge', label: '1. The Laundry Lounge', code: 'TLL', shortArea: 'Primary Branch' },
  { id: 'wh-hariom', name: 'Hari Om Laundry', label: '2. Hari Om Laundry', code: 'HOL', shortArea: 'Secondary Branch' },
];

export const getPartyBranchName = (party: BusinessParty): string => {
  if (party.branch === 'Hari Om Laundry' || party.branch === 'The Laundry Lounge') {
    return party.branch;
  }
  const text = (party.name + ' ' + (party.notes || '') + ' ' + (party.billingAddress?.street || '')).toLowerCase();
  if (text.includes('hari om') || text.includes('hariom')) {
    return 'Hari Om Laundry';
  }
  return 'The Laundry Lounge';
};

export const CustomersPartyView: React.FC = () => {
  const { parties, addParty, updateParty, deleteParty, documents, recordDocumentPayment } = useBusiness();
  const { showToast, businessSettings, customerDues, setCustomerDues, selectedGlobalBranch, setSelectedGlobalBranch } = useApp();
  const { loadPreloadedLaundryLoungeFile, setActiveTab: setImportActiveTab } = useImport();

  // Branch filter state bound globally
  const selectedBranch = selectedGlobalBranch;
  const setSelectedBranch = setSelectedGlobalBranch;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'due' | 'settled'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPartyForLedger, setSelectedPartyForLedger] = useState<BusinessParty | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reassigningParty, setReassigningParty] = useState<BusinessParty | null>(null);
  const [newAssignedBranch, setNewAssignedBranch] = useState<string>('');

  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');

  // New party form state
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [partyCompany, setPartyCompany] = useState('');
  const [partyGstin, setPartyGstin] = useState('');
  const [partyStreet, setPartyStreet] = useState('');
  const [partyCity, setPartyCity] = useState('Rewa');
  const [partyBranch, setPartyBranch] = useState<string>('The Laundry Lounge');
  const [partyOpeningBalance, setPartyOpeningBalance] = useState<number>(0);
  const [partyCreditLimit, setPartyCreditLimit] = useState<number>(5000);

  // All customers
  const customers = parties.filter((p) => p.type === 'customer' || p.type === 'both');

  // 1. Branch-filtered customer set
  const branchFilteredCustomers = customers.filter((c) => {
    if (selectedBranch === 'all') return true;
    return getPartyBranchName(c) === selectedBranch;
  });

  // 2. Status & search filtered subset
  const filteredCustomers = branchFilteredCustomers.filter((c) => {
    if (balanceFilter === 'due' && c.currentBalance <= 0) return false;
    if (balanceFilter === 'settled' && c.currentBalance > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = (c.phone || '').includes(q);
      const matchComp = (c.companyName || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchComp) return false;
    }
    return true;
  });

  // Dynamic branch metrics
  const totalOutstandingToCollect = branchFilteredCustomers.reduce(
    (sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0),
    0
  );

  const pendingDuesCount = branchFilteredCustomers.filter((c) => c.currentBalance > 0).length;
  const clearedAccountsCount = branchFilteredCustomers.filter((c) => c.currentBalance <= 0).length;

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim() || !partyPhone.trim()) {
      showToast('Please enter customer name and mobile number', 'error');
      return;
    }

    addParty({
      type: 'customer',
      name: partyName.trim(),
      phone: partyPhone.trim(),
      companyName: partyCompany.trim() || undefined,
      gstin: partyGstin.trim() || undefined,
      branch: partyBranch,
      warehouseId: partyBranch === 'Hari Om Laundry' ? 'wh-hariom' : 'wh-main',
      billingAddress: {
        name: partyName.trim(),
        phone: partyPhone.trim(),
        street: partyStreet.trim() || partyBranch,
        city: partyCity.trim(),
        state: 'Madhya Pradesh',
        pincode: '486001',
      },
      openingBalance: Number(partyOpeningBalance) || 0,
      currentBalance: Number(partyOpeningBalance) || 0,
      creditLimit: Number(partyCreditLimit) || 5000,
    });

    showToast(`Customer "${partyName}" added to ${partyBranch}!`, 'success');
    setShowAddModal(false);
    setPartyName('');
    setPartyPhone('');
    setPartyCompany('');
    setPartyGstin('');
    setPartyStreet('');
    setPartyOpeningBalance(0);
  };

  const handleReassignBranch = () => {
    if (!reassigningParty || !newAssignedBranch) return;

    updateParty(reassigningParty.id, {
      branch: newAssignedBranch,
      warehouseId: newAssignedBranch === 'Hari Om Laundry' ? 'wh-hariom' : 'wh-main',
    });

    // Also update matching due in customerDues
    setCustomerDues((prev) =>
      prev.map((d) =>
        d.customerPhone === reassigningParty.phone
          ? { ...d, branch: newAssignedBranch }
          : d
      )
    );

    showToast(`Moved ${reassigningParty.name} to ${newAssignedBranch}!`, 'success');
    setReassigningParty(null);
  };

  const handleWhatsAppReminder = (party: BusinessParty) => {
    const cleanPhone = (party.phone || '').replace(/[^0-9]/g, '');
    const phoneParam =
      cleanPhone.length >= 10 ? (cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`) : '';
    const message = `Namaste ${party.name}!%0A%0AThis is a gentle payment reminder from *${businessSettings.businessName}* (${getPartyBranchName(party)}).%0A%0AYour outstanding balance is *₹${party.currentBalance.toLocaleString('en-IN')}*.%0A%0APlease pay online via UPI: *${businessSettings.upiId}* or visit our counter.%0A%0AThank you! 🧺`;
    window.open(`https://wa.me/${phoneParam}?text=${message}`, '_blank');
  };

  const handleCollectDueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyForLedger) return;
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;

    const unpaidDoc = documents.find((d) => d.partyId === selectedPartyForLedger.id && d.dueAmount > 0);

    if (unpaidDoc) {
      recordDocumentPayment(unpaidDoc.id, amt, payMode);
    } else {
      updateParty(selectedPartyForLedger.id, {
        currentBalance: Math.max(0, selectedPartyForLedger.currentBalance - amt),
      });
    }

    // Update customer due in AppContext
    setCustomerDues((prev) =>
      prev.map((d) =>
        d.customerPhone === selectedPartyForLedger.phone
          ? { ...d, pendingDue: Math.max(0, d.pendingDue - amt), totalPaid: d.totalPaid + amt }
          : d
      )
    );

    showToast(`Payment of ₹${amt} collected from ${selectedPartyForLedger.name}!`, 'success');
    setShowPaymentModal(false);
    setPayAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-brand-600" />
            <span>Customers &amp; Party Ledgers (उधार खाता)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Branch-wise party master with credit limits, WhatsApp payment reminders, and live Khata dues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setImportActiveTab('wizard');
              loadPreloadedLaundryLoungeFile();
            }}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-emerald-200 active:scale-95 transition-all shadow-xs"
            title="Import 110 confirmed parties from The Laundry Lounge file"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Load 110 Parties File</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Customer Party</span>
          </button>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 🏢 BRANCH / STORE LOCATION SELECTOR BAR */}
      {/* ====================================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-300 block">
                Store Location / Hub Filter
              </span>
              <h3 className="text-sm font-black text-white">Select Active Business Branch</h3>
            </div>
          </div>

          <div className="text-xs text-slate-300 font-semibold">
            Viewing: <strong className="text-amber-400">{AVAILABLE_BRANCHES.find((b) => b.name === selectedBranch || b.id === selectedBranch)?.label || 'All Branches'}</strong>
          </div>
        </div>

        {/* Branch Filter Tabs (Exactly 2 Operating Branches + Consolidated) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {AVAILABLE_BRANCHES.map((b) => {
            const isSelected = selectedBranch === (b.id === 'all' ? 'all' : b.name);
            const count =
              b.id === 'all'
                ? customers.length
                : customers.filter((c) => getPartyBranchName(c) === b.name).length;
            const branchDueTotal =
              b.id === 'all'
                ? customers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0)
                : customers
                    .filter((c) => getPartyBranchName(c) === b.name)
                    .reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0);

            return (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id === 'all' ? 'all' : b.name)}
                className={`p-3 rounded-2xl text-left transition-all relative overflow-hidden border ${
                  isSelected
                    ? 'bg-brand-600 border-brand-400 text-white shadow-lg shadow-brand-600/30 ring-2 ring-brand-400/50'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                  <span className={isSelected ? 'text-brand-200' : 'text-slate-400'}>{b.code}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {count} Parties
                  </span>
                </div>
                <div className="font-extrabold text-xs truncate">{b.label}</div>
                <div className="text-[11px] font-bold mt-1.5 flex items-center justify-between">
                  <span className={isSelected ? 'text-brand-100' : 'text-slate-400'}>Due:</span>
                  <span className={`font-black ${isSelected ? 'text-amber-300' : 'text-amber-400'}`}>
                    ₹{branchDueTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards (Dynamic for Active Branch) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">
            {selectedBranch === 'all' ? 'Total Customer Accounts' : 'Branch Customers'}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {branchFilteredCustomers.length} Parties
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {selectedBranch === 'all' ? 'Consolidated Across All Locations' : `Assigned to ${selectedBranch}`}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-rose-600 uppercase">
            {selectedBranch === 'all' ? 'Total Receivables To Collect' : 'Branch Receivables To Collect'}
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            ₹{totalOutstandingToCollect.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {pendingDuesCount} parties with pending dues
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-emerald-600 uppercase">
            {selectedBranch === 'all' ? 'Settled Accounts' : 'Branch Settled Accounts'}
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {clearedAccountsCount} Parties
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Zero outstanding balance</div>
        </div>
      </div>

      {/* Status & Search Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setBalanceFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              balanceFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All in Branch ({branchFilteredCustomers.length})
          </button>
          <button
            onClick={() => setBalanceFilter('due')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              balanceFilter === 'due' ? 'bg-white text-rose-700 shadow-xs font-black' : 'text-slate-600'
            }`}
          >
            ⚠️ Pending Dues ({pendingDuesCount})
          </button>
          <button
            onClick={() => setBalanceFilter('settled')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              balanceFilter === 'settled' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Cleared Accounts ({clearedAccountsCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customer name, mobile, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Party Details</th>
                <th className="py-3 px-4">Branch Location</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">GSTIN / Company</th>
                <th className="py-3 px-4">Credit Limit</th>
                <th className="py-3 px-4">Current Due (₹)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <span>No customer records found in this branch matching criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const hasDue = c.currentBalance > 0;
                  const partyBranchName = getPartyBranchName(c);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-[13px] flex items-center space-x-1.5">
                          <span>{c.name}</span>
                          {hasDue && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              partyBranchName === 'Hari Om Laundry'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {partyBranchName}
                          </span>
                          <span className="text-[10px] text-slate-400">Rewa</span>
                        </div>
                      </td>

                      {/* Branch Badge with Quick-Change Action */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setReassigningParty(c);
                            setNewAssignedBranch(partyBranchName);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-800 text-[10px] font-bold inline-flex items-center space-x-1.5 border border-slate-200 transition-colors group"
                          title="Click to change customer branch"
                        >
                          <Building2 className="w-3 h-3 text-slate-400 group-hover:text-brand-600" />
                          <span className="truncate max-w-[130px]">{partyBranchName}</span>
                          <Edit2 className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-bold">{c.phone}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{c.companyName || '— Individual'}</div>
                        {c.gstin && <div className="text-[10px] text-brand-700 font-mono font-bold">{c.gstin}</div>}
                      </td>
                      <td className="py-3 px-4 text-slate-500">₹{c.creditLimit || 5000}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[13px] font-black ${hasDue ? 'text-rose-600' : 'text-slate-400'}`}>
                          {hasDue ? `₹${c.currentBalance.toLocaleString('en-IN')}` : '₹0'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {hasDue && (
                            <>
                              <button
                                onClick={() => handleWhatsAppReminder(c)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all"
                                title="Send WhatsApp Payment Reminder"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPartyForLedger(c);
                                  setPayAmount(c.currentBalance.toString());
                                  setShowPaymentModal(true);
                                }}
                                className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[10px] font-bold"
                              >
                                + Collect Due
                              </button>
                            </>
                          )}
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

      {/* REASSIGN BRANCH MODAL */}
      {reassigningParty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Change Customer Branch</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{reassigningParty.name}</p>
              </div>
              <button onClick={() => setReassigningParty(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Select New Branch Location</label>
                <select
                  value={newAssignedBranch}
                  onChange={(e) => setNewAssignedBranch(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  {AVAILABLE_BRANCHES.filter((b) => b.id !== 'all').map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 font-normal">
                Moving this customer will update their party profile and Khata receivables to reflect under the new branch.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassigningParty(null)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReassignBranch}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm font-bold"
                >
                  Update Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Add Customer Party</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Mobile Number (10 digits)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9893733683"
                  value={partyPhone}
                  onChange={(e) => setPartyPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Operating Branch Location</label>
                <select
                  value={partyBranch}
                  onChange={(e) => setPartyBranch(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {AVAILABLE_BRANCHES.filter((b) => b.id !== 'all').map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={partyCompany}
                    onChange={(e) => setPartyCompany(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 23AABCS1429B1Z8"
                    value={partyGstin}
                    onChange={(e) => setPartyGstin(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Near Gayatri Public School, Arun Nagar"
                  value={partyStreet}
                  onChange={(e) => setPartyStreet(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Opening Due Balance (₹)</label>
                  <input
                    type="number"
                    value={partyOpeningBalance}
                    onChange={(e) => setPartyOpeningBalance(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-rose-600 font-black"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={partyCreditLimit}
                    onChange={(e) => setPartyCreditLimit(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLECT DUE MODAL */}
      {showPaymentModal && selectedPartyForLedger && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Collect Payment from {selectedPartyForLedger.name}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectDueSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">
                  Pending Due: ₹{selectedPartyForLedger.currentBalance} ({getPartyBranchName(selectedPartyForLedger)})
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Received Via</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
