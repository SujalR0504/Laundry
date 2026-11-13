import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import { BusinessParty } from '../../../business/types';
import {
  Building2,
  Plus,
  Search,
  Filter,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  ShoppingCart,
} from 'lucide-react';

export const SuppliersPartyView: React.FC = () => {
  const { parties, addParty, updateParty, deleteParty, documents, recordDocumentPayment } = useBusiness();
  const { showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [payModalSupplier, setPayModalSupplier] = useState<BusinessParty | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'Bank Transfer' | 'Cash' | 'UPI'>('Bank Transfer');

  // New supplier form
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('Bhopal');
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  const suppliers = parties.filter((p) => p.type === 'supplier' || p.type === 'both');

  const filteredSuppliers = suppliers.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchComp = (s.companyName || '').toLowerCase().includes(q);
      const matchPhone = (s.phone || '').includes(q);
      if (!matchName && !matchComp && !matchPhone) return false;
    }
    return true;
  });

  const totalPayables = suppliers.reduce(
    (sum, s) => sum + (s.currentBalance < 0 ? Math.abs(s.currentBalance) : 0),
    0
  );

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Please enter supplier name and phone number', 'error');
      return;
    }

    addParty({
      type: 'supplier',
      name: name.trim(),
      companyName: companyName.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      gstin: gstin.trim() || undefined,
      billingAddress: {
        name: name.trim(),
        phone: phone.trim(),
        street: 'Industrial Zone Area',
        city,
        state: 'Madhya Pradesh',
        pincode: '462001',
      },
      openingBalance: -Math.abs(Number(openingBalance) || 0), // negative means we owe them
      currentBalance: -Math.abs(Number(openingBalance) || 0),
      creditLimit: 50000,
    });

    showToast(`Supplier "${name}" added to master!`, 'success');
    setShowAddModal(false);
    setName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setGstin('');
    setOpeningBalance(0);
  };

  const handlePaySupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalSupplier) return;
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;

    // Allocate against unpaid purchase bill if exists
    const unpaidBill = documents.find(
      (d) => d.partyId === payModalSupplier.id && d.dueAmount > 0
    );

    if (unpaidBill) {
      recordDocumentPayment(unpaidBill.id, amt, payMode);
    } else {
      updateParty(payModalSupplier.id, {
        currentBalance: Math.min(0, payModalSupplier.currentBalance + amt),
      });
    }

    showToast(`Payment of ₹${amt} made to ${payModalSupplier.name}!`, 'success');
    setPayModalSupplier(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <span>Suppliers &amp; Vendors Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage raw material vendors, chemical manufacturers, packaging distributors and accounts payable.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Supplier Vendor</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Registered Suppliers</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{suppliers.length} Vendors</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Chemicals, Packaging, Spare Parts &amp; Fuel
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-amber-600 uppercase">Total Outstanding Payables</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ₹{totalPayables.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total amount owed to active suppliers
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search supplier name, company, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Supplier Firm &amp; Contact</th>
                <th className="py-3 px-4">Phone &amp; Email</th>
                <th className="py-3 px-4">GSTIN Number</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Amount Owed (₹)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSuppliers.map((s) => {
                const owes = s.currentBalance < 0 ? Math.abs(s.currentBalance) : 0;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-[13px]">{s.name}</div>
                      {s.companyName && (
                        <div className="text-[11px] text-slate-500">{s.companyName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-bold">{s.phone}</div>
                      {s.email && <div className="text-[10px] text-slate-400">{s.email}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {s.gstin || '— Unregistered'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.billingAddress?.city || 'Madhya Pradesh'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[13px] font-black ${owes > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {owes > 0 ? `₹${owes.toLocaleString('en-IN')}` : 'Settled (₹0)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {owes > 0 && (
                        <button
                          onClick={() => {
                            setPayModalSupplier(s);
                            setPayAmount(owes.toString());
                          }}
                          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold"
                        >
                          + Make Payment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SUPPLIER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Add Supplier Vendor</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Supplier / Firm Name</label>
                <input
                  type="text"
                  placeholder="e.g. Diversey Bhopal Depot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Contact Person / Trade Name</label>
                <input
                  type="text"
                  placeholder="e.g. Diversey India Hygiene Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9891002233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 23AABCD1234E1ZX"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">City / Supply Depot</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Opening Payable Balance (₹)</label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-amber-700 font-bold"
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAKE PAYMENT MODAL */}
      {payModalSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Pay Supplier: {payModalSupplier.name}
              </h3>
              <button onClick={() => setPayModalSupplier(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySupplierSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">
                  Amount to Pay (Due: ₹{Math.abs(payModalSupplier.currentBalance)})
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-amber-700 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Pay From Account</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Bank Transfer">SBI Current A/c (Net Banking)</option>
                  <option value="UPI">PhonePe Merchant UPI</option>
                  <option value="Cash">Cash in Hand (Store Drawer)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalSupplier(null)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm"
                >
                  Confirm Payment Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

