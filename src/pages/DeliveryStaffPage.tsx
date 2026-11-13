import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bike,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  AlertCircle,
  KeyRound,
  MapPin,
  Package,
  Search,
  QrCode,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Wallet,
  Store,
  User,
  Shield,
  MessageCircle,
  ArrowRight,
  Receipt,
  FileCheck,
  AlertTriangle,
  Send,
  Calendar,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Order, OrderStatus } from '../types';

export const DeliveryStaffPage: React.FC = () => {
  const {
    orders,
    deliveryStaff,
    updateOrderStatus,
    verifyAndDeliverOrder,
    accounts,
    showToast,
    businessSettings,
  } = useApp();

  // Active rider selector (Default to Rajesh Kumar)
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    deliveryStaff[0]?.id || 'staff-del-1'
  );

  // Rider duty status
  const [dutyStatus, setDutyStatus] = useState<'on_duty' | 'on_break' | 'off_duty'>('on_duty');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'all' | 'pickups' | 'deliveries' | 'completed' | 'cash'>('all');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [slotFilter, setSlotFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'express' | 'standard'>('all');

  // Order action states
  const [otpInputs, setOtpInputs] = useState<{ [orderId: string]: string }>({});
  const [bagSealInputs, setBagSealInputs] = useState<{ [orderId: string]: string }>({});
  const [expandedOrderIds, setExpandedOrderIds] = useState<{ [orderId: string]: boolean }>({});

  // Modals
  const [qrModalOrder, setQrModalOrder] = useState<Order | null>(null);
  const [issueModalOrder, setIssueModalOrder] = useState<Order | null>(null);
  const [issueReason, setIssueReason] = useState<string>('Customer Not Reachable');
  const [issueCustomNote, setIssueCustomNote] = useState('');
  const [showCashHandoverModal, setShowCashHandoverModal] = useState(false);
  const [handedOverCash, setHandedOverCash] = useState<number>(0);

  // Current active staff object
  const currentRider = useMemo(() => {
    return (
      deliveryStaff.find((s) => s.id === selectedStaffId) ||
      deliveryStaff[0] || {
        id: 'staff-del-1',
        name: 'Rajesh Kumar',
        phone: '9329838804',
        email: 'rajesh.rider@thelaundrylounge.in',
        status: 'active',
        activeOrdersCount: 4,
        vehicleType: 'Electric Scooter (Hero Electric)',
        rating: 4.9,
      }
    );
  }, [deliveryStaff, selectedStaffId]);

  // Tasks categorisation
  const pickupTasks = useMemo(() => {
    return orders.filter(
      (o) => o.orderStatus === 'Order Placed' || o.orderStatus === 'Pickup Scheduled'
    );
  }, [orders]);

  const deliveryTasks = useMemo(() => {
    return orders.filter(
      (o) => o.orderStatus === 'Ready for Delivery' || o.orderStatus === 'Out for Delivery'
    );
  }, [orders]);

  const completedTodayTasks = useMemo(() => {
    return orders.filter(
      (o) => o.orderStatus === 'Delivered' || o.orderStatus === 'Picked Up'
    );
  }, [orders]);

  // COD Cash collected calculation
  const codCollectedOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.orderStatus === 'Delivered' &&
        o.paymentMethod === 'Cash on Delivery'
    );
  }, [orders]);

  const totalCodCollected = useMemo(() => {
    const rawTotal = codCollectedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return Math.max(0, rawTotal - handedOverCash);
  }, [codCollectedOrders, handedOverCash]);

  // Filtered task list based on active tab & search
  const displayedOrders = useMemo(() => {
    let list: Order[] = [];
    if (activeTab === 'all') {
      list = [...pickupTasks, ...deliveryTasks];
    } else if (activeTab === 'pickups') {
      list = pickupTasks;
    } else if (activeTab === 'deliveries') {
      list = deliveryTasks;
    } else if (activeTab === 'completed') {
      list = completedTodayTasks;
    }

    return list.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        order.address.area.toLowerCase().includes(q) ||
        order.address.street.toLowerCase().includes(q);

      const matchSlot = slotFilter === 'all' || order.pickupSlot === slotFilter;
      const matchPriority = priorityFilter === 'all' || order.deliveryMode === priorityFilter;

      return matchQuery && matchSlot && matchPriority;
    });
  }, [activeTab, pickupTasks, deliveryTasks, completedTodayTasks, searchQuery, slotFilter, priorityFilter]);

  // Handlers
  const handleMarkPickedUp = (orderId: string) => {
    const bagTag = bagSealInputs[orderId] || '';
    const note = bagTag.trim()
      ? `Garments picked up from doorstep. Sealed with Bag Tag #${bagTag.trim()}`
      : 'Garments picked up from customer doorstep';
    updateOrderStatus(orderId, 'Picked Up', note);
    showToast(`Order #${orderId.slice(-6)} picked up successfully!`, 'success');
  };

  const handleMarkOutForDelivery = (orderId: string) => {
    updateOrderStatus(
      orderId,
      'Out for Delivery',
      `Rider ${currentRider.name} is on the way with fresh garments`
    );
  };

  const handleVerifyOtpAndDeliver = (orderId: string) => {
    const otp = otpInputs[orderId] || '';
    if (!otp.trim()) {
      showToast('Please enter customer 4-digit handover OTP', 'error');
      return;
    }
    const success = verifyAndDeliverOrder(orderId, otp);
    if (success) {
      setOtpInputs((prev) => ({ ...prev, [orderId]: '' }));
    }
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalOrder) return;
    const finalNote = issueCustomNote.trim()
      ? `${issueReason}: ${issueCustomNote.trim()}`
      : issueReason;

    updateOrderStatus(
      issueModalOrder.id,
      'On Hold',
      `Delivery Attempted by ${currentRider.name} - ${finalNote}`
    );
    showToast(`Delivery issue logged: ${issueReason}`, 'info');
    setIssueModalOrder(null);
    setIssueCustomNote('');
  };

  const handleCashHandoverSubmit = () => {
    setHandedOverCash((prev) => prev + totalCodCollected);
    setShowCashHandoverModal(false);
    showToast(`₹${totalCodCollected.toLocaleString('en-IN')} handed over to Store Cash Drawer!`, 'success');
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderIds((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const generateWhatsAppDirectLink = (order: Order, type: 'pickup' | 'delivery') => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '').slice(-10);
    const text =
      type === 'pickup'
        ? `Hello ${order.customerName}! I am ${currentRider.name} from The Laundry Lounge. I am reaching your address in 10-15 minutes for your laundry pickup (Order #${order.orderNumber}). Please keep your clothes ready.`
        : `Hello ${order.customerName}! I am ${currentRider.name} from The Laundry Lounge. I am on the way with your freshly cleaned garments (Order #${order.orderNumber}). Total payable is ₹${order.total}. See you shortly!`;

    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Primary UPI Account for QR
  const primaryUpiAccount = accounts.find((a) => a.accountType === 'upi_merchant') || accounts[0];
  const upiId = primaryUpiAccount?.ifscCode || '9329838804@okaxis';

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* ========================================================
          1. TOP RIDER HERO HEADER & DUTY STATUS
      ======================================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white shadow-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:py-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Rider Profile & Info */}
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 border-2 border-white/20">
                  <Bike className="w-7 h-7" />
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
                    dutyStatus === 'on_duty'
                      ? 'bg-emerald-400 animate-pulse'
                      : dutyStatus === 'on_break'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                  title={dutyStatus}
                />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-extrabold bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-500/30">
                    Rider Console • Rewa
                  </span>
                  <span className="text-amber-400 text-xs font-bold flex items-center space-x-0.5">
                    <span>★</span>
                    <span>{currentRider.rating}</span>
                  </span>
                </div>

                {/* Rider Name Dropdown */}
                <div className="relative mt-0.5">
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="bg-transparent font-black text-lg sm:text-xl text-white appearance-none cursor-pointer pr-6 focus:outline-none focus:ring-1 focus:ring-sky-500 rounded"
                  >
                    {deliveryStaff.map((staff) => (
                      <option key={staff.id} value={staff.id} className="bg-slate-900 text-white">
                        {staff.name} — {staff.vehicleType.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-0 top-1.5 pointer-events-none" />
                </div>

                <p className="text-xs text-slate-300 flex items-center space-x-1.5">
                  <span>{currentRider.vehicleType}</span>
                  <span>•</span>
                  <span>+91 {currentRider.phone}</span>
                </p>
              </div>
            </div>

            {/* Right: Duty Mode Selector Toggle */}
            <div className="flex items-center space-x-2 self-start sm:self-auto bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700">
              <button
                onClick={() => {
                  setDutyStatus('on_duty');
                  showToast('You are now ON DUTY (Ready for tasks)', 'success');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                  dutyStatus === 'on_duty'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>On Duty</span>
              </button>

              <button
                onClick={() => {
                  setDutyStatus('on_break');
                  showToast('You are on break', 'info');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dutyStatus === 'on_break'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Break</span>
              </button>

              <button
                onClick={() => {
                  setDutyStatus('off_duty');
                  showToast('You are OFF DUTY', 'info');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dutyStatus === 'off_duty'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Off Duty</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
            {/* Pickups */}
            <div
              onClick={() => setActiveTab('pickups')}
              className="bg-slate-800/60 hover:bg-slate-800 p-2.5 rounded-2xl border border-slate-700/80 cursor-pointer transition-all"
            >
              <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                <Package className="w-3 h-3" />
                <span>Pending Pickups</span>
              </div>
              <div className="text-xl font-black text-white mt-0.5">{pickupTasks.length}</div>
              <div className="text-[10px] text-slate-400">Doorstep pickups</div>
            </div>

            {/* Deliveries */}
            <div
              onClick={() => setActiveTab('deliveries')}
              className="bg-slate-800/60 hover:bg-slate-800 p-2.5 rounded-2xl border border-slate-700/80 cursor-pointer transition-all"
            >
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                <Bike className="w-3 h-3" />
                <span>Out for Delivery</span>
              </div>
              <div className="text-xl font-black text-white mt-0.5">{deliveryTasks.length}</div>
              <div className="text-[10px] text-slate-400">Garments in bag</div>
            </div>

            {/* Completed */}
            <div
              onClick={() => setActiveTab('completed')}
              className="bg-slate-800/60 hover:bg-slate-800 p-2.5 rounded-2xl border border-slate-700/80 cursor-pointer transition-all"
            >
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Done Today</span>
              </div>
              <div className="text-xl font-black text-white mt-0.5">{completedTodayTasks.length}</div>
              <div className="text-[10px] text-slate-400">Verified runs</div>
            </div>

            {/* Cash in Pocket */}
            <div
              onClick={() => setShowCashHandoverModal(true)}
              className="bg-slate-800/60 hover:bg-slate-800 p-2.5 rounded-2xl border border-emerald-500/30 cursor-pointer transition-all"
            >
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                <Wallet className="w-3 h-3" />
                <span>Cash in Pocket</span>
              </div>
              <div className="text-xl font-black text-emerald-300 mt-0.5">
                ₹{totalCodCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-400/80 underline font-semibold">
                Click to Handover
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. SEARCH, SLOT FILTER & TABS
      ======================================================== */}
      <div className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Active Runs ({pickupTasks.length + deliveryTasks.length})
          </button>

          <button
            onClick={() => setActiveTab('pickups')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
              activeTab === 'pickups'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Doorstep Pickups</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'pickups' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {pickupTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
              activeTab === 'deliveries'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Deliveries &amp; Drop-offs</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'deliveries' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {deliveryTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
              activeTab === 'completed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Completed Today</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {completedTodayTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cash')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
              activeTab === 'cash'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Cash Handover (₹{totalCodCollected})</span>
          </button>
        </div>

        {/* Search & Slot Filters Bar */}
        {activeTab !== 'cash' && (
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer, phone, street or order ID..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-sky-500 shadow-2xs"
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

            {/* Time Slot Filter */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={slotFilter}
                onChange={(e) => setSlotFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-700 shadow-2xs"
              >
                <option value="all">All Pickup Slots</option>
                <option value="9:00 AM - 12:00 PM">Morning (9 AM - 12 PM)</option>
                <option value="12:00 PM - 3:00 PM">Afternoon (12 PM - 3 PM)</option>
                <option value="3:00 PM - 6:00 PM">Evening (3 PM - 6 PM)</option>
                <option value="6:00 PM - 9:00 PM">Night (6 PM - 9 PM)</option>
              </select>

              {/* Express Speed Filter */}
              <button
                onClick={() =>
                  setPriorityFilter((prev) => (prev === 'express' ? 'all' : 'express'))
                }
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-2xs ${
                  priorityFilter === 'express'
                    ? 'bg-amber-500 text-white shadow-amber-500/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Filter 24-Hour Express Orders"
              >
                <span>⚡ Express</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            3. MAIN TASK LIST / RUNS CARDS
        ======================================================== */}
        {activeTab === 'cash' ? (
          /* CASH SETTLEMENT TAB */
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <span>Rider Daily Cash Handover &amp; Wallet</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All Cash on Delivery (COD) collected by you during deliveries must be handed over to store cashier.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500 block">Total Unsettled Cash</span>
                <span className="text-2xl font-black text-emerald-700">
                  ₹{totalCodCollected.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Handover action card */}
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-900">Counter Drawer Settlement</div>
                <p className="text-xs text-emerald-700">
                  Click below when you are back at Arun Nagar or Ring Road workshop and deposit the physical cash.
                </p>
              </div>

              <button
                onClick={() => setShowCashHandoverModal(true)}
                disabled={totalCodCollected <= 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap active:scale-95"
              >
                Deposit ₹{totalCodCollected.toLocaleString('en-IN')} Cash
              </button>
            </div>

            {/* Collected Orders Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Delivered COD Orders ({codCollectedOrders.length})
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4 text-right">Cash Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {codCollectedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">
                          No Cash on Delivery collections recorded today.
                        </td>
                      </tr>
                    ) : (
                      codCollectedOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{o.customerName}</div>
                            <div className="text-[11px] text-slate-500">{o.customerPhone}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{o.address.area}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              COD
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-700">
                            ₹{o.total.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : displayedOrders.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">No Pending Runs in This Queue</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Great work! All doorstep pickups and deliveries are up to date for this section.
            </p>
          </div>
        ) : (
          /* ORDERS LIST */
          <div className="space-y-4">
            {displayedOrders.map((order) => {
              const isPickup =
                order.orderStatus === 'Order Placed' || order.orderStatus === 'Pickup Scheduled';
              const isDelivery =
                order.orderStatus === 'Ready for Delivery' || order.orderStatus === 'Out for Delivery';
              const isDelivered = order.orderStatus === 'Delivered';
              const isPickedUp = order.orderStatus === 'Picked Up';
              const isExpanded = !!expandedOrderIds[order.id];

              const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl border transition-all shadow-xs overflow-hidden ${
                    order.deliveryMode === 'express'
                      ? 'border-amber-300 ring-1 ring-amber-200/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* CARD TOP BAR: Status & Priority Badges */}
                  <div className="p-4 sm:p-5 pb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-xs sm:text-sm text-slate-900">
                        {order.orderNumber}
                      </span>

                      {/* Pickup vs Delivery Tag */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isPickup
                            ? 'bg-sky-100 text-sky-800'
                            : isDelivery
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isPickup ? 'Doorstep Pickup' : isDelivery ? 'Drop-off Delivery' : order.orderStatus}
                      </span>

                      {/* Express Badge */}
                      {order.deliveryMode === 'express' && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center space-x-1 shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Express 24h</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      {/* Pickup Slot / Scheduled Time */}
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.pickupSlot}</span>
                      </span>

                      {/* Branch Source Tag */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {order.address.area.includes('Ring') ? 'Branch 2' : 'Branch 1 (Arun Nagar)'}
                      </span>
                    </div>
                  </div>

                  {/* CARD BODY: Customer, Address & Actions */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Customer Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                            {order.customerName}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 pl-6 font-mono font-medium">
                          +91 {order.customerPhone}
                        </p>
                      </div>

                      {/* 1-Click Call, WhatsApp, and Navigation Buttons */}
                      <div className="flex items-center space-x-2">
                        {/* 1-Click Phone Call */}
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-emerald-200 transition-colors shadow-2xs active:scale-95"
                          title="Call Customer directly"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call</span>
                        </a>

                        {/* WhatsApp Quick Message */}
                        <a
                          href={generateWhatsAppDirectLink(order, isPickup ? 'pickup' : 'delivery')}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs active:scale-95"
                          title="Send WhatsApp arrival alert"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Google Maps Navigation */}
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(
                            `${order.address.houseFlat} ${order.address.street} ${order.address.area} Rewa ${order.address.pincode}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-sky-200 transition-colors shadow-2xs active:scale-95"
                          title="Open in Google Maps"
                        >
                          <Navigation className="w-3.5 h-3.5 text-sky-600" />
                          <span>Maps</span>
                        </a>
                      </div>
                    </div>

                    {/* Address Box */}
                    <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 flex items-start space-x-2 border border-slate-100">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">
                          {order.address.houseFlat}, {order.address.street}
                        </div>
                        <div className="text-slate-500">
                          {order.address.area}, Rewa (PIN: {order.address.pincode})
                        </div>
                        {order.address.landmark && (
                          <div className="text-amber-800 text-[11px] font-bold">
                            📍 Landmark: {order.address.landmark}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Garments Summary & Expand toggle */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.id)}
                        className="text-slate-600 hover:text-slate-900 font-bold flex items-center space-x-1 text-xs"
                      >
                        <Package className="w-3.5 h-3.5 text-sky-600" />
                        <span>
                          {totalItemsCount} Garment{totalItemsCount > 1 ? 's' : ''} ({order.items.length} service types)
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Payment Status indicator */}
                      <div className="text-right">
                        {order.paymentStatus === 'Paid' ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            ✅ Prepaid (₹{order.total.toFixed(0)})
                          </span>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md">
                              💵 Collect COD: ₹{order.total.toFixed(0)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQrModalOrder(order)}
                              className="p-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100"
                              title="Show UPI QR Code to Customer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Garment Items List */}
                    {isExpanded && (
                      <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2 text-xs animate-in fade-in">
                        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                          Garment Manifest
                        </div>
                        <div className="divide-y divide-slate-200/70">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-1.5 flex justify-between items-center text-xs">
                              <span className="font-medium text-slate-800">
                                {item.quantity}x {item.service?.name || 'Garment'}
                              </span>
                              <span className="font-mono text-slate-500">
                                ₹{(item.selectedPrice || item.service?.price || 0) * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                        {order.laundryInternalNotes && (
                          <div className="pt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                            <strong>Note:</strong> {order.laundryInternalNotes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ========================================================
                        RIDER ACTION BUTTONS (Context-Aware)
                    ======================================================== */}
                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      {/* ACTION TYPE 1: PENDING PICKUP */}
                      {isPickup && (
                        <div className="space-y-2.5">
                          {/* Bag Seal Tag ID Input */}
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={bagSealInputs[order.id] || ''}
                                onChange={(e) =>
                                  setBagSealInputs({ ...bagSealInputs, [order.id]: e.target.value })
                                }
                                placeholder="Bag Seal Tag # (e.g. BAG-8821)..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-sky-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleMarkPickedUp(order.id)}
                              className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-sky-600/20 active:scale-98 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Confirm Garments Picked Up ({totalItemsCount} pcs)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setIssueModalOrder(order)}
                              className="px-3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                              title="Report Issue"
                            >
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ACTION TYPE 2: READY FOR DELIVERY (Start Run) */}
                      {order.orderStatus === 'Ready for Delivery' && (
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleMarkOutForDelivery(order.id)}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                          >
                            <Bike className="w-4 h-4" />
                            <span>Start Delivery Run (Mark Out for Delivery)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIssueModalOrder(order)}
                            className="px-3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold"
                            title="Report Issue"
                          >
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                          </button>
                        </div>
                      )}

                      {/* ACTION TYPE 3: OUT FOR DELIVERY (OTP Verification & Payment Collection) */}
                      {order.orderStatus === 'Out for Delivery' && (
                        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-950">
                              <KeyRound className="w-4 h-4 text-emerald-600" />
                              <span>Customer Handover OTP Verification</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                              Test OTP: {order.deliveryOtp}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              value={otpInputs[order.id] || ''}
                              onChange={(e) =>
                                setOtpInputs({ ...otpInputs, [order.id]: e.target.value })
                              }
                              placeholder="4-digit OTP"
                              className="w-32 px-3 py-2.5 bg-white rounded-xl border border-emerald-300 font-mono font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />

                            <button
                              type="button"
                              onClick={() => handleVerifyOtpAndDeliver(order.id)}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify OTP &amp; Deliver</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setIssueModalOrder(order)}
                              className="p-2.5 border border-emerald-300 bg-white hover:bg-emerald-100/50 text-slate-700 rounded-xl text-xs font-bold"
                              title="Report Issue"
                            >
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ACTION TYPE 4: COMPLETED RUNS */}
                      {(isDelivered || isPickedUp) && (
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <div className="flex items-center space-x-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {isDelivered
                                ? 'Handed over to customer & verified'
                                : 'Received at Laundry Lounge'}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {order.timeline.slice(-1)[0]?.timestamp?.slice(11, 16) || 'Today'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: STORE UPI QR CODE FOR CUSTOMER PAYMENT
      ======================================================== */}
      {qrModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Instant UPI Scan &amp; Pay
              </span>
              <button
                onClick={() => setQrModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900">
                The Laundry Lounge (UPI QR)
              </h3>
              <p className="text-xs text-slate-500">
                Show this QR code to {qrModalOrder.customerName} on your phone screen
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner">
              <QRCodeSVG
                value={`upi://pay?pa=${upiId}&pn=TheLaundryLounge&am=${qrModalOrder.total.toFixed(0)}&cu=INR&tn=Order-${qrModalOrder.orderNumber}`}
                size={180}
                level="M"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Amount to Receive:</span>
                <span className="text-emerald-700 text-sm">₹{qrModalOrder.total.toFixed(0)}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500">UPI ID: {upiId}</div>
            </div>

            <button
              onClick={() => {
                updateOrderStatus(
                  qrModalOrder.id,
                  qrModalOrder.orderStatus,
                  `Payment received via Customer UPI QR scan (₹${qrModalOrder.total})`
                );
                setQrModalOrder(null);
                showToast(`Payment marked as collected via UPI!`, 'success');
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Customer Paid via UPI</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: REPORT DELIVERY PROBLEM / DELAY
      ======================================================== */}
      {issueModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-extrabold text-slate-900 text-base">
                  Report Delivery / Pickup Issue
                </h4>
              </div>
              <button
                onClick={() => setIssueModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl text-xs space-y-1 text-amber-900">
              <div className="font-bold">Order: {issueModalOrder.orderNumber}</div>
              <div>Customer: {issueModalOrder.customerName} (+91 {issueModalOrder.customerPhone})</div>
            </div>

            <form onSubmit={handleReportIssue} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Category *</label>
                <select
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Customer Not Reachable">Customer Not Reachable / Phone Switched Off</option>
                  <option value="House Locked / Nobody Home">House Locked / Nobody Home</option>
                  <option value="Customer Requested Later Reschedule">Customer Requested Later Reschedule</option>
                  <option value="Inaccessible Location / Rain">Heavy Rain / Inaccessible Waterlogged Road</option>
                  <option value="Customer Refused Handover">Customer Refused Handover</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Additional Note for Store Manager (Optional)
                </label>
                <textarea
                  rows={2}
                  value={issueCustomNote}
                  onChange={(e) => setIssueCustomNote(e.target.value)}
                  placeholder="e.g. Rang bell 3 times, neighbor says customer will return after 7 PM..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOrder(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Log Issue &amp; Notify Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: CASH HANDOVER TO STORE DRAWER
      ======================================================== */}
      {showCashHandoverModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Store className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900">
                Deposit Cash to Store Drawer
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You are depositing COD cash collected from your completed delivery runs today.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-black text-2xl">
              ₹{totalCodCollected.toLocaleString('en-IN')}
            </div>

            <div className="text-[11px] text-slate-500 text-left space-y-1">
              <div>• Rider: <strong>{currentRider.name}</strong></div>
              <div>• Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
              <div>• Target: <strong>Central Counter Drawer</strong></div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCashHandoverModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCashHandoverSubmit}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
