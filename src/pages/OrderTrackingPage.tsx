import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Package,
  Calendar,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  Circle,
  FileText,
  User,
  Phone,
  MessageCircle,
  AlertCircle,
  Navigation,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { OrderStatus } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const {
    orders,
    selectedOrderIdForTracking,
    trackOrderById,
    openInvoice,
    businessSettings,
    deliveryStaff,
    showToast,
  } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active tracked order
  const activeOrder =
    (selectedOrderIdForTracking &&
      orders.find((o) => o.id === selectedOrderIdForTracking)) ||
    orders[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      trackOrderById(searchInput.trim());
      setSearchInput('');
    }
  };

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Live tracking status synchronized with facility sensors', 'info');
    }, 800);
  };

  const ALL_STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'Order Placed', label: 'Order Placed', desc: 'Booking confirmed and logged in system' },
    { status: 'Pickup Scheduled', label: 'Pickup Scheduled', desc: 'Rider assigned for collection' },
    { status: 'Picked Up', label: 'Picked Up', desc: 'Garments collected from customer doorstep' },
    { status: 'Received at Laundry', label: 'Received at Laundry', desc: 'Checked in & barcoded at facility' },
    { status: 'Inspection', label: 'Inspection', desc: 'Fabric & stain analysis by wash master' },
    { status: 'Cleaning / Washing', label: 'Cleaning / Washing', desc: 'In specialized wash or dry clean cycle' },
    { status: 'Quality Check', label: 'Quality Check', desc: 'Inspected under high illumination' },
    { status: 'Ready for Delivery', label: 'Ready for Delivery', desc: 'Packaged on hanger with dust cover' },
    { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Rider enroute to your doorstep' },
    { status: 'Delivered', label: 'Delivered', desc: 'Handed over and verified via OTP' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    return ALL_STATUS_STEPS.findIndex((s) => s.status === status);
  };

  const currentIdx = activeOrder ? getStepIndex(activeOrder.orderStatus) : -1;

  // Find rider if assigned
  const rider = activeOrder?.assignedDeliveryStaffId
    ? deliveryStaff.find((s) => s.id === activeOrder.assignedDeliveryStaffId)
    : deliveryStaff[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header & Search */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Live Realtime Tracking
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Track Your Laundry Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Enter your Order ID (e.g. {orders[0]?.orderNumber || 'LD-2026-000101'}) to see live stages
          from wash line to doorstep.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. LD-2026-000101"
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-brand-500 shadow-soft-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {activeOrder ? (
        <div className="space-y-6">
          {/* SIMULATED LIVE GPS DISPATCH & RADAR MAP */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-slate-800">
            {/* Ambient map glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                    Live Dispatch Feed
                  </span>
                  <button
                    onClick={handleRefreshStatus}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Refresh Status"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {activeOrder.orderStatus === 'Delivered'
                      ? 'Garments Delivered Successfully'
                      : activeOrder.orderStatus === 'Out for Delivery'
                      ? 'Rider is 1.4 km away • Arriving in ~12 mins'
                      : activeOrder.orderStatus === 'Cleaning / Washing'
                      ? 'In Italian Hydrocarbon Wash Drum'
                      : `Status: ${activeOrder.orderStatus}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Destination: {activeOrder.address.houseFlat}, {activeOrder.address.street},{' '}
                    {activeOrder.address.city} - {activeOrder.address.pincode}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-accent-300" />
                    <span className="text-slate-300">Pickup Slot:</span>
                    <span className="font-bold text-white">{activeOrder.pickupSlot}</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-accent-300" />
                    <span className="text-slate-300">Expected Delivery:</span>
                    <span className="font-bold text-white">{activeOrder.expectedDeliveryDate}</span>
                  </div>
                </div>
              </div>

              {/* Simulated Map Visual Box */}
              <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-4 border border-white/10 relative overflow-hidden">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center justify-between mb-2">
                  <span>GPS Telemetry Mock</span>
                  <span className="text-emerald-400">● 4G Connected</span>
                </div>

                {/* SVG Route Simulation Graphic */}
                <div className="h-32 w-full bg-slate-950 rounded-xl relative flex items-center justify-center overflow-hidden border border-white/5">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

                  {/* Curving Route Path */}
                  <svg className="w-full h-full absolute inset-0" viewBox="0 0 300 120">
                    <path
                      d="M 30,90 Q 120,20 180,80 T 270,30"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                      strokeDasharray="6,4"
                      className="animate-pulse"
                    />
                    <circle cx="30" cy="90" r="6" fill="#3b82f6" />
                    <circle cx="270" cy="30" r="7" fill="#10b981" />
                  </svg>

                  {/* Rider icon pulse */}
                  <div className="absolute left-[56%] top-[58%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-accent-400/30 animate-ping" />
                    <div className="w-7 h-7 rounded-full bg-accent-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-glow">
                      🛵
                    </div>
                  </div>

                  {/* Customer Pin */}
                  <div className="absolute right-4 top-4 flex items-center space-x-1 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-emerald-400 border border-emerald-500/30">
                    <MapPin className="w-3 h-3" />
                    <span>Your Doorstep</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2">
                  <span>Rider: {rider?.name || 'Rajesh Kumar'}</span>
                  <a
                    href={`tel:${rider?.phone || '+91 98112 34567'}`}
                    className="text-accent-300 hover:underline flex items-center space-x-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Rider</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Visual Status Timeline */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-500">Live Stage:</span>
                  <h3 className="text-lg font-black text-slate-900">{activeOrder.orderStatus}</h3>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                    activeOrder.orderStatus === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-brand-100 text-brand-800 animate-pulse'
                  }`}
                >
                  {activeOrder.orderStatus === 'Delivered' ? 'Completed' : 'In Progress'}
                </span>
              </div>

              {/* Stepper Timeline */}
              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {ALL_STATUS_STEPS.map((step, idx) => {
                  const isPassed = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  const logEvent = activeOrder.timeline.find((t) => t.status === step.status);

                  return (
                    <div key={step.status} className="relative flex items-start space-x-4 pl-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                          isPassed
                            ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 fill-brand-600 text-white" />
                        ) : (
                          <Circle className="w-2.5 h-2.5" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isCurrent
                                ? 'text-brand-700'
                                : isPassed
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {logEvent && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(logEvent.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>

                        {logEvent?.note && (
                          <p className="text-[11px] text-brand-700 bg-brand-50/70 p-2 rounded-lg mt-1 font-medium italic border border-brand-100">
                            {logEvent.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Order Metadata Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-bold">Order ID</div>
                    <div className="font-mono text-base font-extrabold text-brand-900">
                      {activeOrder.orderNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => openInvoice(activeOrder)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>Tax Invoice</span>
                  </button>
                </div>

                {/* Delivery OTP Notice */}
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-600 block">
                      Delivery Confirmation OTP
                    </span>
                    <span className="font-mono font-black text-xl text-amber-900">
                      {activeOrder.deliveryOtp}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 max-w-[150px] text-right">
                    Share this code with the rider when receiving your fresh garments
                  </p>
                </div>

                {/* Rider card */}
                {rider && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">
                        Assigned Delivery Partner
                      </span>
                      <span className="text-emerald-700 font-bold text-[10px]">On Route</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">
                          {rider.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{rider.name}</div>
                          <div className="text-[10px] text-slate-500">{rider.vehicleType}</div>
                        </div>
                      </div>
                      <a
                        href={`tel:${rider.phone}`}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        title="Call Rider"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Specifications */}
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Pickup Date:</span>
                    <span className="font-bold text-slate-800">
                      {activeOrder.pickupDate} ({activeOrder.pickupSlot})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Delivery:</span>
                    <span className="font-bold text-slate-800">
                      {activeOrder.expectedDeliveryDate} ({activeOrder.deliveryMode})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pickup Address:</span>
                    <span className="font-bold text-slate-800 text-right max-w-[180px] truncate">
                      {activeOrder.address.houseFlat}, {activeOrder.address.street}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className="font-bold text-emerald-600">
                      {activeOrder.paymentStatus} ({activeOrder.paymentMethod})
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Amount:</span>
                    <span className="text-brand-900">₹{activeOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">
                    Garments in this Order ({activeOrder.items.length})
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700 max-h-36 overflow-y-auto">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.service.name}
                        </span>
                        <span className="font-semibold">₹{item.selectedPrice * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WhatsApp Support CTA */}
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${businessSettings.whatsappNumber}?text=${encodeURIComponent(
                      `Inquiring regarding order ${activeOrder.orderNumber}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Care Regarding this Order</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-medium">No order found.</p>
        </div>
      )}
    </div>
  );
};
