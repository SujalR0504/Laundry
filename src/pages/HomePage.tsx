import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Truck,
  CheckCircle2,
  Calendar,
  MapPin,
  ChevronRight,
  Star,
  Plus,
  Minus,
  HelpCircle,
  MessageCircle,
  Zap,
  Tag,
  Copy,
  Check,
  Sliders,
  Layers,
  Award,
  RefreshCw,
  Flame,
  Shirt,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    setCurrentView,
    categories,
    services,
    addToCart,
    cms,
    businessSettings,
    serviceAreas,
    checkPincodeServiceability,
    reviews,
    faqs,
    coupons,
    pickupSlots,
    showToast,
  } = useApp();

  // Quick booking widget state
  const [quickPincode, setQuickPincode] = useState('');
  const [quickServiceId, setQuickServiceId] = useState(categories[0]?.id || '');
  const [quickSlot, setQuickSlot] = useState(pickupSlots[0]?.timeRange || '');

  // Live interactive instant cost estimator in Hero
  const [estimatorCounts, setEstimatorCounts] = useState<{ [key: string]: number }>({
    'dc-shirt': 2,
    'dc-pant': 2,
    'ir-saree': 1,
  });

  // Fabric Transformation Before/After State
  const [activeTransformationTab, setActiveTransformationTab] = useState<'shirt' | 'sherwani' | 'saree'>('shirt');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Pincode Checker tool state
  const [checkerPincode, setCheckerPincode] = useState('');
  const [checkerResult, setCheckerResult] = useState<{
    checked: boolean;
    area?: any;
  }>({ checked: false });

  const [activeFaq, setActiveFaq] = useState<string | null>(faqs[0]?.id || null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Live countdown timer for Next-Day Express cut-off
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 24, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickBookContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPincode) {
      showToast('Please enter your pickup pincode', 'error');
      return;
    }
    const servArea = checkPincodeServiceability(quickPincode);
    if (!servArea) {
      showToast('Sorry, we currently do not serve this pincode yet.', 'error');
      return;
    }
    setCurrentView('booking');
  };

  const handleTestPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkerPincode.trim()) return;
    const res = checkPincodeServiceability(checkerPincode.trim());
    setCheckerResult({ checked: true, area: res });
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    showToast(`Coupon code ${code} copied!`, 'success');
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  // Estimator helpers
  const updateEstimatorCount = (id: string, delta: number) => {
    setEstimatorCounts((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const estimatorItems = [
    { id: 'dc-shirt', name: 'Dry Clean Shirt', price: 50, icon: '👔' },
    { id: 'dc-pant', name: 'Dry Clean Pant', price: 50, icon: '👖' },
    { id: 'ir-saree', name: 'Roll Press Saree', price: 50, icon: '🥻' },
    { id: 'dc-blazer', name: 'Suit Blazer', price: 150, icon: '🧥' },
  ];

  const estimatedTotal = estimatorItems.reduce(
    (sum, item) => sum + (estimatorCounts[item.id] || 0) * item.price,
    0
  );

  const handleAddEstimatedToCart = () => {
    let addedCount = 0;
    estimatorItems.forEach((item) => {
      const count = estimatorCounts[item.id] || 0;
      if (count > 0) {
        const fullService = services.find((s) => s.id === item.id);
        if (fullService) {
          addToCart(fullService, count);
          addedCount += count;
        }
      }
    });
    if (addedCount > 0) {
      showToast(`Added ${addedCount} estimated garments to basket!`, 'success');
      setCurrentView('booking');
    } else {
      showToast('Please select at least 1 garment', 'info');
    }
  };

  const featuredServices = services.filter((s) => s.featured && s.active).slice(0, 8);
  const featuredReviews = reviews.filter((r) => r.approved && r.featured);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-slate-50 pt-6 sm:pt-14 pb-16 sm:pb-24">
        {/* Soft background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-80 h-80 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Live Urgency Countdown Pill */}
          <div className="flex justify-center lg:justify-start mb-6">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-900 to-indigo-900 text-white text-xs font-semibold shadow-md shadow-brand-900/15">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-ping" />
              <span>Next-Day Delivery Cutoff:</span>
              <span className="font-mono font-bold text-accent-300">
                {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {cms.heroBadge && (
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100/90 text-brand-900 text-xs font-bold border border-brand-200 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>{cms.heroBadge}</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Professional Laundry & Dry Cleaning,{' '}
                <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                  Delivered
                </span>{' '}
                to Your Door
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {cms.heroSubheadline}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setCurrentView('booking')}
                  className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-xl shadow-brand-600/30 flex items-center justify-center space-x-2.5 transition-all text-base group"
                >
                  <Calendar className="w-5 h-5 text-accent-300" />
                  <span>Schedule Free Pickup</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setCurrentView('services')}
                  className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-200 hover:border-slate-300 shadow-soft-sm flex items-center justify-center space-x-2 transition-all text-base"
                >
                  <span>Explore 60+ Garments</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Floating perk badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Zero Fabric Damage</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Express 24h Available</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-brand-600" />
                  <span>Free Doorstep Pickup</span>
                </span>
              </div>
            </div>

            {/* Right: Quick Booking Widget & Estimator Tabs */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Instant Pickup Booking</h3>
                    <p className="text-xs text-slate-500">Pick slots in under 60 seconds</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Slots Today</span>
                  </span>
                </div>

                <form onSubmit={handleQuickBookContinue} className="space-y-4">
                  {/* Step 1: Pincode */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        1. Pickup Pincode
                      </label>
                      <span className="text-[10px] text-brand-600 font-semibold">Delhi NCR Live</span>
                    </div>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={quickPincode}
                        onChange={(e) => setQuickPincode(e.target.value)}
                        placeholder="e.g. 110001, 122001, 201301"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Step 2: Primary Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      2. Primary Service
                    </label>
                    <select
                      value={quickServiceId}
                      onChange={(e) => setQuickServiceId(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-500 focus:bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 3: Slot */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      3. Preferred 2-Hour Slot
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <select
                        value={quickSlot}
                        onChange={(e) => setQuickSlot(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-500 focus:bg-white"
                      >
                        {pickupSlots.map((slot) => (
                          <option key={slot.id} value={slot.timeRange}>
                            Today: {slot.timeRange}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white font-black rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] text-sm mt-2"
                  >
                    <span>Continue to Add Garments</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Pay online or via Cash on Delivery</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE INSTANT PRICE ESTIMATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-soft-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                Live Calculator
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Quick Household Price Estimator
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md">
                Adjust garment quantities below to see an instant doorstep cost estimate.
              </p>
            </div>

            {/* Quick Counters */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
              {estimatorItems.map((item) => {
                const count = estimatorCounts[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="font-bold text-xs text-slate-800 leading-tight">{item.name}</div>
                      <div className="text-[11px] text-brand-600 font-bold">₹{item.price}/pc</div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 mt-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => updateEstimatorCount(item.id, -1)}
                        className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black text-slate-900">{count}</span>
                      <button
                        onClick={() => updateEstimatorCount(item.id, 1)}
                        className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total & Action */}
            <div className="bg-brand-50 p-5 rounded-2xl border border-brand-200 text-center min-w-[200px] space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Estimated Total</span>
                <div className="text-2xl font-black text-brand-900">₹{estimatedTotal}</div>
                <span className="text-[10px] text-emerald-700 font-semibold block">Free Doorstep Pickup</span>
              </div>
              <button
                onClick={handleAddEstimatedToCart}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-sm transition-transform active:scale-95"
              >
                Add All to Basket
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm flex items-center space-x-4 hover:border-brand-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Doorstep Pickup</h4>
              <p className="text-xs text-slate-500 mt-0.5">Flexible 2-hour slots</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm flex items-center space-x-4 hover:border-brand-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Eco & Hypoallergenic</h4>
              <p className="text-xs text-slate-500 mt-0.5">German hydrocarbon tech</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm flex items-center space-x-4 hover:border-brand-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">24h Express Available</h4>
              <p className="text-xs text-slate-500 mt-0.5">Urgent event delivery</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm flex items-center space-x-4 hover:border-brand-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Real-time Tracking</h4>
              <p className="text-xs text-slate-500 mt-0.5">Live SMS & WhatsApp updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE CATEGORIES (Dry Cleaning, Normal Wash & Iron, Only Ironing) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Care for Every Fabric
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Our Core Service Categories
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Each garment is tagged, inspected for stains, and processed with bespoke chemical or steam cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const itemCount = services.filter((s) => s.categoryId === cat.id && s.active).length;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-soft-md hover:shadow-soft-lg transition-all flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow">
                    {cat.badge}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-black">{cat.name}</h3>
                    <p className="text-xs text-slate-200">{itemCount} items available</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => setCurrentView('services')}
                      className="w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>Browse {cat.name} Catalogue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentView('booking')}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>Book Pickup for {cat.name}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BEFORE / AFTER FABRIC TRANSFORMATION SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-400 bg-white/10 px-3 py-1 rounded-full">
              European Finishing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Before & After Garment Transformation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Drag the interactive slider to see how our master spotters and steam polishers restore garments.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex justify-center space-x-3">
            {[
              { id: 'shirt', label: 'Collar & Coffee Stain (Shirt)' },
              { id: 'sherwani', label: 'Wedding Sherwani (Zari Care)' },
              { id: 'saree', label: 'Silk Saree (Steam Roll Press)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTransformationTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTransformationTab === tab.id
                    ? 'bg-accent-500 text-slate-950 font-black'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Split Comparison Card */}
          <div className="max-w-2xl mx-auto bg-slate-950 rounded-2xl overflow-hidden p-6 border border-white/10 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/80 p-5 rounded-xl border border-red-500/20 text-center space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-red-400 bg-red-950/80 px-2 py-0.5 rounded">
                  Before Treatment
                </span>
                <div className="text-3xl">🧺</div>
                <div className="text-xs font-bold text-slate-200">
                  {activeTransformationTab === 'shirt' && 'Deep Yellowed Collar & Coffee Splash'}
                  {activeTransformationTab === 'sherwani' && 'Dull Zari & Sweat Rings'}
                  {activeTransformationTab === 'saree' && 'Severe Creases & Wrinkled Borders'}
                </div>
                <p className="text-[11px] text-slate-400">Regular home washing causes fabric fading</p>
              </div>

              <div className="bg-brand-950/80 p-5 rounded-xl border border-emerald-500/30 text-center space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                  After AquaPure Care
                </span>
                <div className="text-3xl">✨</div>
                <div className="text-xs font-bold text-accent-300">
                  {activeTransformationTab === 'shirt' && 'Spotless White & Stiff Crisp Collar'}
                  {activeTransformationTab === 'sherwani' && 'Restored Gold Luster & Protected Beads'}
                  {activeTransformationTab === 'saree' && 'Silk Sheen Roll Press & Zero Shrinkage'}
                </div>
                <p className="text-[11px] text-emerald-400/80">Sanitized, scented & hanger packed</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                <span>100% Guaranteed stain removal without fabric fiber damage</span>
              </span>
              <button
                onClick={() => setCurrentView('booking')}
                className="font-bold text-accent-300 hover:underline"
              >
                Book for this Garment →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (4 STEPS) */}
      <section className="bg-gradient-to-b from-slate-900 to-brand-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-400 bg-white/10 px-3 py-1 rounded-full">
              Hassle-Free Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold mt-3">How AquaPure Works</h2>
            <p className="text-sm text-slate-300 mt-2">
              From your closet back to your wardrobe in four easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-accent-400/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-accent-500/20 text-accent-400 font-black text-xl flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="font-bold text-lg mb-2">Book Online</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose garments from dry clean, wash & iron, or steam press, and pick a convenient 2-hour slot.
              </p>
            </div>

            <div className="relative bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-accent-400/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-300 font-black text-xl flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="font-bold text-lg mb-2">We Pick Up</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our uniformed rider arrives at your doorstep with sanitized laundry bags and counts every item digitally.
              </p>
            </div>

            <div className="relative bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-accent-400/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 font-black text-xl flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="font-bold text-lg mb-2">We Clean & Care</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Garments undergo barcode tagging, spot treatment, Italian drum washing, and vacuum steam finishing.
              </p>
            </div>

            <div className="relative bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-accent-400/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="font-bold text-lg mb-2">We Deliver</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Delivered crisp on premium hangers or protective packs, verified securely with customer OTP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES / PRICING PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Transparent Rates
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Popular Laundry & Dry Cleaning Items
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('services')}
            className="mt-3 sm:mt-0 font-bold text-sm text-brand-600 hover:text-brand-800 flex items-center space-x-1"
          >
            <span>View Full 60+ Item Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredServices.map((service) => {
            const displayPrice =
              service.priceType === 'range'
                ? `₹${service.minPrice} – ₹${service.maxPrice}`
                : service.priceType === 'custom_quote'
                ? `₹${service.minPrice}+ (Quote)`
                : `₹${service.price}`;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    {service.customQuoteRequired && (
                      <span className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Custom Quote
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm truncate">{service.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm">{displayPrice}</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">
                      / {service.unit}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(service)}
                    className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center space-x-1 text-xs font-bold transition-transform active:scale-95"
                    title="Add to Basket"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* OFFERS STRIP WITH 1-CLICK COPY */}
      {coupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 via-brand-800 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="bg-accent-400 text-brand-950 font-black text-xs uppercase px-3 py-1 rounded-full">
                  Special Offers
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold">
                  Save More on Every Household Pickup
                </h3>
                <p className="text-xs sm:text-sm text-brand-100 max-w-xl">
                  Click any coupon code below to copy instantly and apply at checkout!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {coupons.map((coupon) => (
                  <button
                    key={coupon.id}
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 rounded-2xl p-3.5 text-center min-w-[140px] transition-all hover:scale-105 active:scale-95 text-left"
                  >
                    <div className="flex items-center justify-between space-x-2">
                      <span className="font-mono text-sm font-black text-accent-300 tracking-wider">
                        {coupon.code}
                      </span>
                      {copiedCoupon === coupon.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-white/60" />
                      )}
                    </div>
                    <div className="text-[11px] text-white font-semibold mt-1">
                      {coupon.description.split('on')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PINCODE & SERVICE AREA CHECKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                Coverage Checker
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Do We Serve Your Neighborhood?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                AquaPure operates high-frequency pickup vans and electric rider fleets across Delhi NCR.
                Check your exact pincode below to view instant pickup availability.
              </p>

              <form onSubmit={handleTestPincode} className="flex gap-2 pt-2 max-w-md">
                <input
                  type="text"
                  value={checkerPincode}
                  onChange={(e) => setCheckerPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode (e.g. 110001)"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500 text-sm font-semibold"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Verify
                </button>
              </form>

              {checkerResult.checked && (
                <div className="pt-2 animate-in fade-in">
                  {checkerResult.area ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold">
                          Hooray! We serve {checkerResult.area.areaName} ({checkerResult.area.city})!
                        </span>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Pickup available today. Min order: ₹{checkerResult.area.minOrder}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold">Sorry, we currently don't serve this pincode yet.</span>
                        <p className="text-[11px] text-rose-600">
                          We are expanding rapidly to your sector soon!
                        </p>
                      </div>
                      <button
                        onClick={() => showToast('Thank you! You will be notified when active.', 'info')}
                        className="px-2.5 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-[10px]"
                      >
                        Notify Me
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-sm text-slate-800 mb-3">Popular Active Hubs</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {serviceAreas.map((sa) => (
                  <div key={sa.id} className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="font-bold text-slate-900">{sa.areaName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      PIN: {sa.pincode} • {sa.city}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Real Feedback
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Loved by 12,000+ Happy Households
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{rev.customerName}</span>
                  <span className="text-[10px] text-slate-400 block">{rev.serviceCategory}</span>
                </div>
                <span className="text-[10px] text-slate-400">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQS ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft-sm transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-800 flex items-center justify-between space-x-4"
                >
                  <span>{faq.question}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-90 text-brand-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-accent-900 rounded-3xl p-8 sm:p-16 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              Ready for Spotless, Fresh Laundry?
            </h2>
            <p className="text-sm sm:text-base text-brand-100">
              Schedule your pickup now. Free doorstep collection, transparent piece rates, and expert care.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setCurrentView('booking')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-brand-900 hover:bg-brand-50 font-extrabold rounded-2xl shadow-lg transition-transform active:scale-95 text-sm"
              >
                Book Doorstep Pickup
              </button>
              <a
                href={`https://wa.me/${businessSettings.whatsappNumber}?text=${encodeURIComponent(
                  businessSettings.whatsappMessageTemplate
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-95 text-sm"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Book via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
