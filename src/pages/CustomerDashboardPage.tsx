import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Package,
  Calendar,
  Clock,
  MapPin,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  Tag,
  User,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  QrCode,
  Phone,
  MessageCircle,
  DollarSign,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Order } from '../types';

export const CustomerDashboardPage: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    orders,
    customerDues,
    businessSettings,
    addresses,
    addAddress,
    deleteAddress,
    coupons,
    addToCart,
    setCurrentView,
    trackOrderById,
    openInvoice,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'coupons' | 'profile' | 'dues'>('orders');
  const [showUpiModal, setShowUpiModal] = useState(false);

  // New address mini state
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: currentUser.name,
    mobile: currentUser.phone,
    houseFlat: '',
    street: '',
    area: '',
    city: 'Rewa',
    state: 'Madhya Pradesh',
    pincode: '486001',
    isDefault: false,
  });

  const myOrders = orders.filter(
    (o) => o.customerId === currentUser.id || o.customerEmail === currentUser.email
  );
  const activeOrders = myOrders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');
  const pastOrders = myOrders.filter((o) => o.orderStatus === 'Delivered' || o.orderStatus === 'Cancelled');

  const myDues = customerDues.filter(
    (d) =>
      (d.customerPhone && currentUser.phone && d.customerPhone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '')) ||
      (d.customerId && d.customerId === currentUser.id) ||
      (currentUser.name && d.customerName.toLowerCase().includes(currentUser.name.toLowerCase()))
  );
  const myTotalDue = myDues.reduce((sum, d) => sum + (d.pendingDue || 0), 0);

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(item.service, item.quantity, item.selectedPrice, item.specialInstructions, item.starchSelected);
    });
    showToast(`Items from order ${order.orderNumber} added to basket!`, 'success');
    setCurrentView('booking');
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.houseFlat || !newAddr.pincode) return;
    addAddress(newAddr);
    setShowAddAddr(false);
    setNewAddr({
      name: currentUser.name,
      mobile: currentUser.phone,
      houseFlat: '',
      street: '',
      area: '',
      city: 'Rewa',
      state: 'Madhya Pradesh',
      pincode: '486001',
      isDefault: false,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-xl sm:text-2xl text-accent-300 shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-2xl font-black">{currentUser.name}</h1>
              <span className="bg-accent-400 text-brand-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                {currentUser.customerSegment || 'VIP Member'}
              </span>
            </div>
            <p className="text-xs text-brand-200 mt-0.5">
              {currentUser.phone} • {currentUser.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/15 w-full sm:w-auto justify-around sm:justify-start">
          <div className="text-center">
            <div className="text-[11px] sm:text-xs text-brand-200">Lounge Rewards</div>
            <div className="text-base sm:text-lg font-black text-accent-300 flex items-center justify-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline" />
              <span>{currentUser.loyaltyPoints || 150} Pts</span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-[11px] sm:text-xs text-brand-200">Total Bookings</div>
            <div className="text-base sm:text-lg font-black">{myOrders.length}</div>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block" />
          <button
            onClick={() => {
              switchUserRole('admin');
              setCurrentView('admin-dashboard');
              showToast('Switched to Admin Portal', 'success');
            }}
            className="px-3.5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold text-white transition-all border border-white/20 active:scale-95"
            title="Switch to Admin Dashboard"
          >
            Admin Login →
          </button>
        </div>
      </div>

      {/* Tabs (horizontally scrollable on mobile) */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-4 text-xs sm:text-sm font-bold shrink-0 whitespace-nowrap">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors shrink-0 ${
            activeTab === 'orders'
              ? 'border-b-2 border-brand-600 text-brand-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Orders ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 transition-colors ${
            activeTab === 'addresses'
              ? 'border-b-2 border-brand-600 text-brand-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Saved Addresses ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 transition-colors ${
            activeTab === 'coupons'
              ? 'border-b-2 border-brand-600 text-brand-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Coupons ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('dues')}
          className={`pb-3 transition-colors flex items-center space-x-1.5 shrink-0 ${
            activeTab === 'dues'
              ? 'border-b-2 border-rose-600 text-rose-600 font-extrabold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>My Dues &amp; Khata</span>
          {myTotalDue > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px]">
              ₹{myTotalDue.toLocaleString('en-IN')}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition-colors ${
            activeTab === 'profile'
              ? 'border-b-2 border-brand-600 text-brand-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Profile Settings
        </button>
      </div>

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-8">
          {/* Active Orders */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-3">
              Active Orders in Progress ({activeOrders.length})
            </h3>
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-500">
                No active pickups or wash cycles right now.
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-brand-200 shadow-soft-sm hover:shadow-soft-md transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-sm text-slate-900">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full font-bold">
                              {order.orderStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Booked on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => trackOrderById(order.id)}
                          className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          Track Live
                        </button>
                        <button
                          onClick={() => openInvoice(order)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                        >
                          Invoice
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Pickup Date</span>
                        <span className="font-bold text-slate-800">{order.pickupDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Pickup Slot</span>
                        <span className="font-bold text-slate-800">{order.pickupSlot}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Delivery OTP</span>
                        <span className="font-mono font-bold text-brand-700">{order.deliveryOtp}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Amount</span>
                        <span className="font-extrabold text-slate-900">₹{order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Garments preview */}
                    <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="bg-white px-2 py-1 rounded-lg border border-slate-200">
                          {item.quantity}x {item.service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Orders */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-3">
              Order History ({pastOrders.length})
            </h3>
            {pastOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-500">
                No delivered orders yet.
              </div>
            ) : (
              <div className="space-y-4">
                {pastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                          <span>{order.orderStatus}</span>
                        </span>
                      </div>
                      <div className="font-black text-slate-900 text-sm">
                        ₹{order.total.toFixed(2)}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>Delivered on {order.expectedDeliveryDate}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reorder</span>
                        </button>
                        <button
                          onClick={() => openInvoice(order)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                        >
                          Invoice PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-base">Your Saved Delivery Addresses</h3>
            <button
              onClick={() => setShowAddAddr(!showAddAddr)}
              className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {showAddAddr && (
            <form onSubmit={handleCreateAddress} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-4">
              <h4 className="font-bold text-sm text-slate-900">Add New Doorstep Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newAddr.name}
                    onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.mobile}
                    onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">House / Flat</label>
                  <input
                    type="text"
                    required
                    value={newAddr.houseFlat}
                    onChange={(e) => setNewAddr({ ...newAddr, houseFlat: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Street</label>
                  <input
                    type="text"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area</label>
                  <input
                    type="text"
                    required
                    value={newAddr.area}
                    onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddr(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm space-y-2 relative"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm text-slate-900">{addr.name}</span>
                  {addresses.length > 1 && (
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {addr.houseFlat}, {addr.street}, {addr.area}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  PIN: {addr.pincode} • {addr.city}
                </p>
                <p className="text-xs text-slate-500">{addr.mobile}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Available Discount Coupons</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-xl text-xs">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Active</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">{c.description}</p>
                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
                  <span>Min Order: ₹{c.minOrderValue}</span>
                  <span>Exp: {c.expiryDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-sm max-w-xl space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Customer Account Profile</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Full Name</label>
              <input
                type="text"
                readOnly
                value={currentUser.name}
                className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Email</label>
              <input
                type="email"
                readOnly
                value={currentUser.email}
                className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Phone</label>
              <input
                type="tel"
                readOnly
                value={currentUser.phone}
                className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MY DUES & KHATA */}
      {activeTab === 'dues' && (
        <div className="space-y-6">
          {/* Due Summary Card */}
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-rose-900/40 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-950/90 border border-rose-500/40 px-3 py-1 rounded-full">
                  Customer Udhar Khata Ledger
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  My Pending Dues &amp; Khata Statement
                </h3>
                <p className="text-xs text-slate-300 max-w-lg mt-1">
                  Check your pending balances for counter orders, dry cleaning, and doorstep delivery. You can pay anytime via UPI QR.
                </p>
              </div>

              <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-rose-500/50 text-right sm:min-w-[180px]">
                <div className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                  Total Outstanding
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
                  ₹{myTotalDue.toLocaleString('en-IN')}
                </div>
                {myTotalDue > 0 ? (
                  <button
                    onClick={() => setShowUpiModal(true)}
                    className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pay via UPI QR</span>
                  </button>
                ) : (
                  <span className="inline-block mt-2 text-[11px] font-bold text-emerald-400">
                    ✓ All Bills Clear
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dues List */}
          {myDues.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">All Accounts Clear!</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have no pending dues or credit balance with The Laundry Lounge. Thank you for being a valued customer!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft-sm">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-rose-600" />
                  <span>Itemized Due Records ({myDues.length})</span>
                </h4>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Total: ₹{myTotalDue.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {myDues.map((d) => (
                  <div key={d.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-sm">{d.branch}</span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          Ref: {d.id}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs">{d.notes || 'Counter order and dry cleaning services'}</p>
                      <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-1">
                        <span>Total Billed: <strong className="text-slate-800">₹{d.totalBilled.toLocaleString('en-IN')}</strong></span>
                        <span>Paid: <strong className="text-emerald-700">₹{d.totalPaid.toLocaleString('en-IN')}</strong></span>
                        {d.lastPaymentDate && <span>Last Payment: {d.lastPaymentDate}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Pending Due</div>
                        <div className="text-base font-black text-rose-600">₹{d.pendingDue.toLocaleString('en-IN')}</div>
                      </div>

                      <button
                        onClick={() => setShowUpiModal(true)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Store Banner */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">Have questions about your bills? Call our Rewa hubs: <strong>9893733683 / 9329838804</strong></span>
            </div>
            <a
              href="https://wa.me/919893733683?text=Hello%20The%20Laundry%20Lounge,%20I%20have%20a%20query%20about%20my%20bill%20due."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Store</span>
            </a>
          </div>
        </div>
      )}

      {/* UPI QR PAYMENT MODAL */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-extrabold text-sm text-slate-900">Pay via UPI QR Code</span>
              <button
                onClick={() => setShowUpiModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500">Scan to pay pending balance of</div>
              <div className="text-3xl font-black text-slate-900">₹{myTotalDue.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-emerald-700 font-bold">The Laundry Lounge Rewa</div>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${encodeURIComponent(businessSettings?.upiId || 'thelaundrylounge@upi')}%26pn=The%20Laundry%20Lounge%26am=${myTotalDue}%26cu=INR`}
                alt="UPI QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <span className="font-mono text-slate-700">{businessSettings?.upiId || 'thelaundrylounge@upi'}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(businessSettings?.upiId || 'thelaundrylounge@upi');
                  showToast('UPI ID copied to clipboard!', 'success');
                }}
                className="text-brand-600 hover:underline font-bold text-[11px]"
              >
                Copy
              </button>
            </div>

            <p className="text-[10px] text-slate-400">
              Works with PhonePe, Google Pay, Paytm, BHIM or any UPI App. After payment, take a screenshot and send on WhatsApp.
            </p>

            <button
              onClick={() => {
                showToast('Thank you! Store notified of your payment.', 'success');
                setShowUpiModal(false);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              I Have Completed Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
