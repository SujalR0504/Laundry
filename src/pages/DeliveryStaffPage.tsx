import React, { useState } from 'react';
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
} from 'lucide-react';
import { Order } from '../types';

export const DeliveryStaffPage: React.FC = () => {
  const { orders, updateOrderStatus, verifyAndDeliverOrder, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'pickups' | 'deliveries'>('pickups');
  const [otpInputs, setOtpInputs] = useState<{ [orderId: string]: string }>({});

  // Filter tasks
  const pickupTasks = orders.filter(
    (o) => o.orderStatus === 'Order Placed' || o.orderStatus === 'Pickup Scheduled'
  );

  const deliveryTasks = orders.filter(
    (o) => o.orderStatus === 'Ready for Delivery' || o.orderStatus === 'Out for Delivery'
  );

  const handleMarkPickedUp = (orderId: string) => {
    updateOrderStatus(orderId, 'Picked Up', 'Garments picked up from customer doorstep');
  };

  const handleMarkOutForDelivery = (orderId: string) => {
    updateOrderStatus(orderId, 'Out for Delivery', 'Rider is on the way with fresh garments');
  };

  const handleVerifyOtpAndDeliver = (orderId: string) => {
    const otp = otpInputs[orderId] || '';
    if (!otp.trim()) {
      showToast('Please enter the customer 4-digit OTP', 'error');
      return;
    }
    const success = verifyAndDeliverOrder(orderId, otp);
    if (success) {
      setOtpInputs((prev) => ({ ...prev, [orderId]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Rider Header Card */}
      <div className="bg-gradient-to-r from-cyan-900 to-brand-900 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-accent-300">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-accent-300">
              Rider Dispatch Console
            </span>
            <h1 className="text-lg font-black">Today's Assigned Route</h1>
            <p className="text-[11px] text-brand-200">Rajesh Kumar • Hero Electric</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold">
            On Duty
          </span>
        </div>
      </div>

      {/* Tabs: Pickups vs Deliveries */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveTab('pickups')}
          className={`py-2.5 rounded-xl transition-all ${
            activeTab === 'pickups'
              ? 'bg-white text-brand-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pickups ({pickupTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`py-2.5 rounded-xl transition-all ${
            activeTab === 'deliveries'
              ? 'bg-white text-brand-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Drop-offs ({deliveryTasks.length})
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {activeTab === 'pickups' ? (
          pickupTasks.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
              No pending pickups assigned for your zone today.
            </div>
          ) : (
            pickupTasks.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-xs text-brand-900">
                      {order.orderNumber}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">{order.customerName}</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                    {order.pickupSlot}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600">
                  <div className="flex items-start space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {order.address.houseFlat}, {order.address.street}, {order.address.area} (PIN:{' '}
                      {order.address.pincode})
                    </span>
                  </div>
                </div>

                {/* Rider Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-bold">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${order.address.street} ${order.address.area} ${order.address.pincode}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center space-x-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-brand-600" />
                    <span>Navigate</span>
                  </a>

                  <a
                    href={`tel:${order.customerPhone}`}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center space-x-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Customer</span>
                  </a>
                </div>

                <button
                  onClick={() => handleMarkPickedUp(order.id)}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Garments Picked Up ({order.items.length} items)</span>
                </button>
              </div>
            ))
          )
        ) : deliveryTasks.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
            No drop-offs ready in your bag right now.
          </div>
        ) : (
          deliveryTasks.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-xs text-brand-900">
                    {order.orderNumber}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">{order.customerName}</h3>
                </div>
                <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                  {order.orderStatus}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600">
                <div className="flex items-start space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {order.address.houseFlat}, {order.address.street}, {order.address.area} (PIN:{' '}
                    {order.address.pincode})
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-semibold text-slate-800">
                  <span>To Collect:</span>
                  <span>
                    {order.paymentStatus === 'Paid'
                      ? '₹0 (Paid Online)'
                      : `₹${order.total.toFixed(2)} (Cash on Delivery)`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${order.address.street} ${order.address.area} ${order.address.pincode}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center space-x-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-brand-600" />
                  <span>Navigate</span>
                </a>

                <a
                  href={`tel:${order.customerPhone}`}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center space-x-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Customer</span>
                </a>
              </div>

              {order.orderStatus === 'Ready for Delivery' ? (
                <button
                  onClick={() => handleMarkOutForDelivery(order.id)}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2"
                >
                  <Bike className="w-4 h-4" />
                  <span>Start Delivery Run (Mark Out for Delivery)</span>
                </button>
              ) : (
                /* OTP Verification form for Handover */
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Enter Customer Handover OTP</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Ask customer for the 4-digit code shown on their tracking screen (Test: {order.deliveryOtp})
                  </p>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpInputs[order.id] || ''}
                      onChange={(e) =>
                        setOtpInputs({ ...otpInputs, [order.id]: e.target.value })
                      }
                      placeholder="e.g. 4829"
                      className="w-32 px-3 py-2 bg-white rounded-xl border border-emerald-300 font-mono font-bold text-center text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => handleVerifyOtpAndDeliver(order.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify & Hand Over</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
