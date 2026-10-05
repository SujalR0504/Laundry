import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Truck,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Tag,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Navigation,
  Lock,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Address, PaymentMethod, CartItem, Order } from '../types';

export const BookingPage: React.FC = () => {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartSubtotal,
    addresses,
    addAddress,
    pickupSlots,
    businessSettings,
    checkPincodeServiceability,
    validateCoupon,
    createOrder,
    setCurrentView,
    trackOrderById,
    openInvoice,
    showToast,
    currentUser,
  } = useApp();

  // Wizard current step: 1 to 5 (grouped smoothly for conversion)
  // Step 1: Services & Items review
  // Step 2: Address & Pincode
  // Step 3: Pickup Slot & Delivery mode
  // Step 4: Summary, Coupon & Payment Selection
  // Step 5: Order Confirmed Screen
  const [currentStep, setCurrentStep] = useState<number>(cart.length > 0 ? 2 : 1);

  // Address state
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses[0]?.id || 'new'
  );
  const [newAddr, setNewAddr] = useState<Omit<Address, 'id'>>({
    name: currentUser.name || '',
    mobile: currentUser.phone || '',
    houseFlat: '',
    street: '',
    area: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    isDefault: true,
  });

  // Pickup slot state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowD = new Date();
  tomorrowD.setDate(tomorrowD.getDate() + 1);
  const tomorrowStr = tomorrowD.toISOString().split('T')[0];
  const dayAfterD = new Date();
  dayAfterD.setDate(dayAfterD.getDate() + 2);
  const dayAfterStr = dayAfterD.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(
    pickupSlots[0]?.timeRange || '10:00 AM – 12:00 PM'
  );

  // Delivery mode state
  const [deliveryMode, setDeliveryMode] = useState<'standard' | 'express'>('standard');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('WELCOME10');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Razorpay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Razorpay simulated modal
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  // Calculations
  const subtotal = getCartSubtotal();
  const currentAddress =
    selectedAddressId === 'new'
      ? (newAddr as Address)
      : addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const pincodeServiceArea = currentAddress
    ? checkPincodeServiceability(currentAddress.pincode)
    : undefined;

  let deliveryFee = pincodeServiceArea ? pincodeServiceArea.deliveryFee : businessSettings.standardDeliveryFee;
  if (subtotal >= businessSettings.freeDeliveryThreshold) {
    deliveryFee = 0;
  }
  const expressFee = deliveryMode === 'express' ? businessSettings.expressDeliveryFee : 0;
  const pickupFee = 0;

  // Coupon discount calculation
  let discount = 0;
  if (appliedCoupon) {
    const res = validateCoupon(appliedCoupon, subtotal);
    if (res.valid) {
      discount = res.discount;
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount + deliveryFee + expressFee);
  const tax = Math.round((taxableAmount * businessSettings.gstPercentage) / 100 * 100) / 100;
  const total = Math.round((taxableAmount + tax) * 100) / 100;

  // Geolocation trigger
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setNewAddr((prev) => ({
            ...prev,
            street: 'Detected GPS Location Road',
            area: 'Connaught Place',
            city: 'New Delhi',
            pincode: '110001',
          }));
          showToast('Location fetched via GPS: New Delhi (110001)', 'success');
        },
        () => {
          showToast('Could not fetch GPS location. Please type manually.', 'info');
        }
      );
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = validateCoupon(couponInput.trim(), subtotal);
    if (res.valid) {
      setAppliedCoupon(couponInput.trim().toUpperCase());
      setCouponError(null);
      showToast(`Coupon ${couponInput.trim().toUpperCase()} applied! Saved ₹${res.discount}`, 'success');
      setCouponInput('');
    } else {
      setCouponError(res.error || 'Invalid coupon');
    }
  };

  const handleExecuteOrder = (chosenPayment: PaymentMethod) => {
    let finalAddress: Address;
    if (selectedAddressId === 'new') {
      finalAddress = addAddress(newAddr);
    } else {
      finalAddress = currentAddress;
    }

    const order = createOrder({
      items: cart,
      address: finalAddress,
      pickupDate: selectedDate,
      pickupSlot: selectedSlot,
      deliveryMode,
      couponCode: appliedCoupon || undefined,
      paymentMethod: chosenPayment,
    });

    setConfirmedOrder(order);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleStartPayment = () => {
    if (subtotal < businessSettings.minOrderValue) {
      showToast(`Minimum order amount is ₹${businessSettings.minOrderValue}`, 'error');
      return;
    }

    if (paymentMethod === 'Razorpay' || paymentMethod === 'UPI') {
      setShowRazorpayModal(true);
    } else {
      // Cash on Delivery
      handleExecuteOrder('Cash on Delivery');
    }
  };

  const handleRazorpaySuccess = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowRazorpayModal(false);
      handleExecuteOrder(paymentMethod);
    }, 1200);
  };

  // Expected Delivery label
  const deliveryDays = deliveryMode === 'express' ? 1 : 2;
  const expDateObj = new Date(selectedDate);
  expDateObj.setDate(expDateObj.getDate() + deliveryDays);
  const expDateStr = expDateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Wizard Progress Stepper (hidden on final confirmation) */}
      {currentStep < 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-bold text-slate-500">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center space-x-1.5 ${
                currentStep >= 1 ? 'text-brand-600' : ''
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200'
                }`}
              >
                1
              </span>
              <span>Services</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300" />

            <button
              onClick={() => cart.length > 0 && setCurrentStep(2)}
              className={`flex items-center space-x-1.5 ${
                currentStep >= 2 ? 'text-brand-600' : ''
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200'
                }`}
              >
                2
              </span>
              <span>Address</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300" />

            <button
              onClick={() => cart.length > 0 && setCurrentStep(3)}
              className={`flex items-center space-x-1.5 ${
                currentStep >= 3 ? 'text-brand-600' : ''
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200'
                }`}
              >
                3
              </span>
              <span>Pickup Slot</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300" />

            <button
              onClick={() => cart.length > 0 && setCurrentStep(4)}
              className={`flex items-center space-x-1.5 ${
                currentStep >= 4 ? 'text-brand-600' : ''
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 4 ? 'bg-brand-600 text-white' : 'bg-slate-200'
                }`}
              >
                4
              </span>
              <span>Payment</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT & REVIEW SERVICES */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Your Garment Selection</h2>
                <p className="text-xs text-slate-500">
                  Review garments in your basket or add more from our catalogue
                </p>
              </div>
              <button
                onClick={() => setCurrentView('services')}
                className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1"
              >
                <span>+ Add More Items</span>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-slate-500 font-medium">Your basket is currently empty.</p>
                <button
                  onClick={() => setCurrentView('services')}
                  className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Browse Service Menu
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-4">
                {cart.map((item) => (
                  <div key={item.serviceId} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={item.service.image}
                        alt={item.service.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.service.name}</h4>
                        <p className="text-xs text-brand-600 font-semibold">
                          ₹{item.selectedPrice} / {item.service.unit}
                        </p>
                        {item.starchSelected && (
                          <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold">
                            With Starch
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => updateCartQuantity(item.serviceId, -1)}
                          className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.serviceId, 1)}
                          className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="w-16 text-right font-extrabold text-slate-900 text-sm">
                        ₹{item.selectedPrice * item.quantity}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.serviceId)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Subtotal: </span>
                  <span className="text-lg font-black text-slate-900">₹{subtotal}</span>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-brand-500/25"
                >
                  <span>Select Delivery Address</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: ADDRESS & PINCODE SERVICEABILITY */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Select Pickup Address</h2>
                <p className="text-xs text-slate-500">
                  Where should our rider collect your clothes from?
                </p>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-brand-600" />
                <span>Use Current GPS</span>
              </button>
            </div>

            {/* Saved Addresses List */}
            {addresses.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Saved Addresses
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const isServiceable = checkPincodeServiceability(addr.pincode);

                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-sm text-slate-900">{addr.name}</span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {addr.houseFlat}, {addr.street}, {addr.area}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          PIN: {addr.pincode} • {addr.city}
                        </p>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">{addr.mobile}</span>
                          {isServiceable ? (
                            <span className="text-emerald-700 font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>Serviceable</span>
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold">Unserviceable</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div
                    onClick={() => setSelectedAddressId('new')}
                    className={`p-4 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      selectedAddressId === 'new'
                        ? 'border-brand-600 bg-brand-50/40'
                        : 'border-slate-300 hover:border-brand-400'
                    }`}
                  >
                    <Plus className="w-5 h-5 text-brand-600 mb-1" />
                    <span className="font-bold text-xs text-slate-800">Add New Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* New Address Form if selected */}
            {selectedAddressId === 'new' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-800">Enter New Pickup Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddr.name}
                      onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={newAddr.mobile}
                      onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Flat / House / Floor</label>
                    <input
                      type="text"
                      required
                      value={newAddr.houseFlat}
                      onChange={(e) => setNewAddr({ ...newAddr, houseFlat: e.target.value })}
                      placeholder="e.g. Flat 402, Block B"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Street / Building</label>
                    <input
                      type="text"
                      required
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      placeholder="e.g. Sunshine Apartments, Main Road"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Area / Locality</label>
                    <input
                      type="text"
                      required
                      value={newAddr.area}
                      onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                      placeholder="e.g. Cyber City / Connaught Place"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      placeholder="110001"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Serviceability validation alert */}
            {currentAddress && (
              <div>
                {pincodeServiceArea ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold">
                        Pincode {currentAddress.pincode} is Serviceable!
                      </span>
                      <p className="text-[11px] text-emerald-700">
                        {pincodeServiceArea.areaName} ({pincodeServiceArea.city}) • Free Doorstep Pickup
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span>
                      Notice: Pincode {currentAddress.pincode} is outside primary coverage. Standard delivery applies.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Back & Next */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-brand-500/25"
              >
                <span>Continue to Pickup Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PICKUP SLOTS & DELIVERY SPEED */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900">Choose Pickup & Delivery</h2>
              <p className="text-xs text-slate-500">
                Select your preferred collection date and turnaround speed
              </p>
            </div>

            {/* Date Selection */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                1. Select Pickup Day
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Today', date: todayStr },
                  { label: 'Tomorrow', date: tomorrowStr },
                  { label: 'Day After', date: dayAfterStr },
                ].map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      selectedDate === d.date
                        ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="text-xs">{d.label}</div>
                    <div className="text-sm font-extrabold mt-0.5">{d.date.split('-')[2]} {new Date(d.date).toLocaleString('en-US', { month: 'short' })}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                2. Select 2-Hour Pickup Window
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pickupSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.timeRange;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.timeRange)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Clock className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                        <span className="text-xs sm:text-sm font-semibold">{slot.timeRange}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Available
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Speed / Turnaround */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                3. Delivery Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Standard */}
                <div
                  onClick={() => setDeliveryMode('standard')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    deliveryMode === 'standard'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Standard Delivery</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Turnaround: 48 Hours</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-600 flex items-center space-x-1.5 font-medium">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expected: {expDateStr}</span>
                  </div>
                </div>

                {/* Express */}
                <div
                  onClick={() => setDeliveryMode('express')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    deliveryMode === 'express'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-accent-500" />
                      <h4 className="font-bold text-sm text-slate-900">Express Priority 24h</h4>
                    </div>
                    <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
                      +₹{businessSettings.expressDeliveryFee}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Urgent event or meeting turnaround</p>
                  <div className="mt-3 text-xs text-slate-600 flex items-center space-x-1.5 font-medium">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expected Tomorrow: {expDateStr}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back & Next */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-brand-500/25"
              >
                <span>Continue to Summary & Pay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: ORDER SUMMARY, COUPONS & SECURE PAYMENT */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Payment Methods & Coupon */}
          <div className="lg:col-span-7 space-y-6">
            {/* Coupon Code Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Tag className="w-4 h-4 text-brand-600" />
                <span>Apply Promo / Coupon Code</span>
              </div>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError(null);
                  }}
                  placeholder="e.g. WELCOME10, FIRST50"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold uppercase focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between font-medium">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Code {appliedCoupon} applied (-₹{discount})</span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-slate-400 hover:text-rose-500 text-[11px] underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-xs text-rose-600 font-medium">{couponError}</p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Select Payment Method</h3>

              <div className="space-y-2.5">
                {/* Razorpay Online */}
                <div
                  onClick={() => setPaymentMethod('Razorpay')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'Razorpay'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                      Rzp
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Razorpay Secure Gateway
                      </h4>
                      <p className="text-xs text-slate-500">
                        Credit/Debit Card, Net Banking, Wallets
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>

                {/* UPI */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'UPI'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      UPI
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Instant UPI Payment</h4>
                      <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                      COD
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Cash on Delivery</h4>
                      <p className="text-xs text-slate-500">
                        Pay cash or UPI upon doorstep drop-off
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>256-bit SSL encrypted. Card details are never stored on our servers.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authoritative Bill Breakdown */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-md space-y-5 sticky top-24">
              <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100">
                Authoritative Order Summary
              </h3>

              {/* Items recap */}
              <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.serviceId} className="flex justify-between items-center text-slate-700">
                    <span className="truncate max-w-[180px]">
                      {item.quantity}x {item.service.name}
                    </span>
                    <span className="font-semibold text-slate-900">
                      ₹{item.selectedPrice * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery & Schedule details snippet */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Pickup Slot:</span>
                  <span className="font-bold text-slate-800">{selectedSlot}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery ETA:</span>
                  <span className="font-bold text-slate-800">{expDateStr}</span>
                </div>
              </div>

              {/* Line items math */}
              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Garments Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Doorstep Collection Fee</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                {expressFee > 0 && (
                  <div className="flex justify-between text-brand-600 font-bold">
                    <span>Express Priority Charge</span>
                    <span>₹{expressFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Taxes (GST {businessSettings.gstPercentage}%)</span>
                  <span className="font-bold text-slate-900">₹{tax.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-extrabold text-slate-900">Grand Total</span>
                    <span className="block text-[11px] text-slate-400">Inclusive of all taxes</span>
                  </div>
                  <span className="text-2xl font-black text-brand-900">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Final Confirm CTA */}
              <button
                onClick={handleStartPayment}
                className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white font-extrabold rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 text-sm transition-all active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {paymentMethod === 'Cash on Delivery'
                    ? 'Confirm & Pay On Delivery'
                    : `Pay ₹${total.toFixed(2)} Securely`}
                </span>
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero cancellation fee prior to rider pickup</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RAZORPAY SIMULATED CHECKOUT MODAL */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => !isProcessingPayment && setShowRazorpayModal(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  R
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Razorpay Checkout</h4>
                  <p className="text-[11px] text-slate-500">Merchant: AquaPure Cleaners</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-extrabold text-brand-900">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs space-y-2">
                <div className="flex justify-between font-semibold text-blue-900">
                  <span>Customer:</span>
                  <span>{currentAddress.name}</span>
                </div>
                <div className="flex justify-between font-semibold text-blue-900">
                  <span>Contact:</span>
                  <span>{currentAddress.mobile}</span>
                </div>
                <div className="flex justify-between font-semibold text-blue-900">
                  <span>Gateway Mode:</span>
                  <span className="font-mono uppercase">{paymentMethod}</span>
                </div>
              </div>

              {paymentMethod === 'UPI' ? (
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-inner flex items-center justify-center">
                    {/* Simulated QR Code SVG */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800 fill-current">
                      <rect x="0" y="0" width="30" height="30" />
                      <rect x="5" y="5" width="20" height="20" fill="white" />
                      <rect x="9" y="9" width="12" height="12" />
                      <rect x="70" y="0" width="30" height="30" />
                      <rect x="75" y="5" width="20" height="20" fill="white" />
                      <rect x="79" y="9" width="12" height="12" />
                      <rect x="0" y="70" width="30" height="30" />
                      <rect x="5" y="75" width="20" height="20" fill="white" />
                      <rect x="9" y="79" width="12" height="12" />
                      <rect x="40" y="20" width="20" height="20" />
                      <rect x="40" y="60" width="20" height="20" />
                      <rect x="70" y="70" width="30" height="30" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-slate-700">Scan & Pay using any UPI App</p>
                  <p className="text-[11px] text-slate-400 font-mono">{businessSettings.upiId}</p>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Simulated Card</label>
                    <input
                      type="text"
                      readOnly
                      value="4111 •••• •••• 1111 (Test Card)"
                      className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-600 font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      readOnly
                      value="12/28"
                      className="px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-600 font-mono text-xs"
                    />
                    <input
                      type="password"
                      readOnly
                      value="•••"
                      className="px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-600 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                disabled={isProcessingPayment}
                onClick={handleRazorpaySuccess}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-500/25"
              >
                {isProcessingPayment ? (
                  <span>Verifying Transaction Server-Side...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Simulate Successful Payment (₹{total.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: BEAUTIFUL ORDER CONFIRMED SCREEN (Prompt Section 48) */}
      {currentStep === 5 && confirmedOrder && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Booking Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Your Laundry Pickup is Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              We have dispatched our rider scheduling for your slot.
            </p>
          </div>

          {/* Key order card details */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs text-left space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {confirmedOrder.orderNumber}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Pickup Slot:</span>
              <span className="font-bold text-slate-800">
                {confirmedOrder.pickupDate}, {confirmedOrder.pickupSlot}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Expected Delivery:</span>
              <span className="font-bold text-slate-800">
                {confirmedOrder.expectedDeliveryDate} ({confirmedOrder.deliveryMode})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Delivery Confirmation OTP:</span>
              <span className="font-mono font-black text-brand-700 text-sm bg-brand-50 px-2 py-0.5 rounded">
                {confirmedOrder.deliveryOtp}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-500">Total Paid:</span>
              <span className="font-black text-slate-900 text-sm">
                ₹{confirmedOrder.total.toFixed(2)} ({confirmedOrder.paymentMethod})
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                trackOrderById(confirmedOrder.id);
              }}
              className="py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => openInvoice(confirmedOrder)}
              className="py-3.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-all"
            >
              <span>View & Print Invoice</span>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4 pt-2 text-xs">
            <button
              onClick={() => setCurrentView('services')}
              className="text-brand-600 font-bold hover:underline"
            >
              Continue Shopping
            </button>
            <span className="text-slate-300">•</span>
            <a
              href={`https://wa.me/${businessSettings.whatsappNumber}?text=${encodeURIComponent(
                `Hello AquaPure, I just placed order ${confirmedOrder.orderNumber}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 font-bold hover:underline flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
