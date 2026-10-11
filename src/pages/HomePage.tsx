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
  MessageCircle,
  Zap,
  Tag,
  Copy,
  Check,
  Layers,
  Award,
  RefreshCw,
  Phone,
  Flame,
  Camera,
  Eye,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    setCurrentView,
    categories,
    services,
    addToCart,
    cms,
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

  // Live interactive instant cost estimator
  const [estimatorCounts, setEstimatorCounts] = useState<{ [key: string]: number }>({
    'dc-shirt': 2,
    'dc-pant': 2,
    'ir-saree': 1,
    'dc-blazer': 1,
  });

  // Fabric Transformation Before/After State
  const [activeTransformationTab, setActiveTransformationTab] = useState<'shirt' | 'sherwani' | 'saree'>('shirt');

  // Hero Interactive Visual Gallery State
  const heroGallery = [
    {
      id: 'studio',
      title: 'Rewa Flagship Fabric Care Studio',
      subtitle: 'European steam stations & sanitized ozone cycles in Nehru Nagar & Ring Road',
      badge: 'Boutique Storefront',
      image: '/images/hero-studio.jpg',
      tag: 'Flagship Studio',
      stat: 'Rewa #1 Studio',
    },
    {
      id: 'steam',
      title: 'European Steam Ironing & Pressing',
      subtitle: 'Precision collar shaping & 100% zero burn guarantee on delicate garments',
      badge: 'Veit European Press',
      image: '/images/steam-press.jpg',
      tag: 'Industrial Steam',
      stat: '100% Zero Fabric Burn',
    },
    {
      id: 'ethnic',
      title: 'Banarasi Saree & Wedding Sherwani Care',
      subtitle: 'Gentle roll press polishing & gold zari preservation for bridal wear',
      badge: 'Bridal & Ethnic Hub',
      image: '/images/ethnic-silk-care.jpg',
      tag: 'Zari & Silk Care',
      stat: 'Pure Silk Finish',
    },
    {
      id: 'doorstep',
      title: 'Fast Doorstep Pickup & Delivery in Rewa',
      subtitle: 'Punctual collection in hygienic garment covers across all Rewa localities',
      badge: 'Contactless Rider Fleet',
      image: '/images/doorstep-delivery.jpg',
      tag: 'Free Doorstep Service',
      stat: '60s Booking',
    },
  ];

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [heroRightTab, setHeroRightTab] = useState<'visual' | 'form'>('visual');
  const [activeBranchPhoto, setActiveBranchPhoto] = useState<'hub1' | 'hub2' | 'mockup'>('hub1');

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
      showToast('Please enter your pickup pincode in Rewa', 'error');
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

  const freeDeliveryThreshold = 399;
  const progressToFreeDelivery = Math.min(100, Math.round((estimatedTotal / freeDeliveryThreshold) * 100));

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
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* =========================================================================
          1. HERO SECTION (ATMOSPHERIC GRADIENT MESH & HIGH-END TYPOGRAPHY)
      ========================================================================= */}
      <section className="relative overflow-hidden gradient-mesh pt-6 sm:pt-14 pb-16 sm:pb-24 border-b border-slate-200/60">
        {/* Soft background ambient light blooms */}
        <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-6 w-[420px] h-[420px] bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Top Pill Bar */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-md shadow-slate-900/10">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Next-Day Delivery Cutoff:</span>
              <span className="font-mono font-bold text-amber-300">
                {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-extrabold border border-rose-200 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-rose-600 fill-current" />
              <span>Rewa’s #1 Fabric Care Studio</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100/90 text-sky-900 text-xs font-bold border border-sky-200/80 shadow-xs backdrop-blur-xs">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Rated 4.9/5 by 5,000+ Happy Households in Rewa</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-slate-900 leading-[1.05]">
                The Laundry{' '}
                <span className="text-gradient-red drop-shadow-xs">Lounge</span>
                <span className="block text-2xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-800 via-sky-600 to-cyan-600 mt-2 sm:mt-3">
                  Luxury Fabric Care Delivered in Rewa
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                European steam pressing, sanitized ozone washing, and crisp saree roll press delivered to your doorstep. Visit our 2 modern retail branches in Rewa or book a doorstep collection in under 60 seconds.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => setCurrentView('booking')}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 hover:from-sky-500 hover:to-sky-700 active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-xl shadow-sky-600/30 flex items-center justify-center space-x-2.5 transition-all text-base group"
                >
                  <Calendar className="w-5 h-5 text-amber-300" />
                  <span>Schedule Free Pickup</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Direct Dial Branch 1 */}
                <a
                  href="tel:9329838804"
                  className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-sky-50 text-sky-900 font-bold rounded-2xl border border-sky-200 shadow-soft-sm flex items-center justify-center space-x-2 transition-all text-sm group"
                  title="Call Nehru Nagar Branch"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Call Nehru Nagar: 9329838804</span>
                </a>

                {/* Direct Dial Branch 2 */}
                <a
                  href="tel:9893733683"
                  className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-rose-50 text-rose-900 font-bold rounded-2xl border border-rose-200 shadow-soft-sm flex items-center justify-center space-x-2 transition-all text-sm group"
                  title="Call Hari Om Ring Road Branch"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Call Ring Road: 9893733683</span>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/919329838804"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Care</span>
                </a>
              </div>

              {/* Floating perk badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-3">
                <span className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-slate-200/90 text-xs font-bold text-slate-700 shadow-2xs flex items-center space-x-1.5 backdrop-blur-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Zero Fabric Damage</span>
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-slate-200/90 text-xs font-bold text-slate-700 shadow-2xs flex items-center space-x-1.5 backdrop-blur-xs">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Express 24h Delivery</span>
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-slate-200/90 text-xs font-bold text-slate-700 shadow-2xs flex items-center space-x-1.5 backdrop-blur-xs">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>Free Doorstep Pickup</span>
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-rose-200/90 text-xs font-bold text-rose-700 shadow-2xs flex items-center space-x-1.5 backdrop-blur-xs">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>2 Branches in Rewa</span>
                </span>
              </div>
            </div>

            {/* Right: Interactive Studio Experience & Quick Booking Console */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-2xl relative border border-white/80 backdrop-blur-xl">
                {/* Switcher Tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl mb-4 text-xs font-bold border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setHeroRightTab('visual')}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                      heroRightTab === 'visual'
                        ? 'bg-white text-sky-900 shadow-sm font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-sky-600" />
                    <span>Studio Experience</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroRightTab('form')}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                      heroRightTab === 'form'
                        ? 'bg-white text-sky-900 shadow-sm font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    <span>Instant Pickup (60s)</span>
                  </button>
                </div>

                {heroRightTab === 'visual' ? (
                  /* Visual Studio Showcase with Interactive Switcher */
                  <div className="space-y-4">
                    {/* Active Studio Image with Floating Badges */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-inner border border-slate-200/80 bg-slate-950">
                      <img
                        src={heroGallery[activeHeroIndex].image}
                        alt={heroGallery[activeHeroIndex].title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                      {/* Top Floating Badge */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>{heroGallery[activeHeroIndex].badge}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-sky-950 text-[10px] font-black shadow-md">
                          {heroGallery[activeHeroIndex].tag}
                        </span>
                      </div>

                      {/* Bottom Caption Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px]">
                            {heroGallery[activeHeroIndex].stat}
                          </span>
                          <span className="text-[10px] text-white/80 font-medium">Rewa, Madhya Pradesh</span>
                        </div>
                        <h4 className="font-display font-black text-base sm:text-lg text-white leading-tight">
                          {heroGallery[activeHeroIndex].title}
                        </h4>
                        <p className="text-[11px] text-sky-200/90 line-clamp-1 font-medium">
                          {heroGallery[activeHeroIndex].subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Thumbnail Selector */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                        <span>Click to explore facilities & fabric care:</span>
                        <span className="text-sky-600 font-extrabold">{activeHeroIndex + 1} of {heroGallery.length}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {heroGallery.map((item, idx) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveHeroIndex(idx)}
                            className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                              activeHeroIndex === idx
                                ? 'border-sky-600 ring-2 ring-sky-300 scale-[1.03] shadow-md'
                                : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300'
                            }`}
                            title={item.title}
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-950/20" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar below Visual Showcase */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHeroRightTab('form')}
                        className="flex-1 py-3.5 bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 hover:from-sky-500 hover:to-sky-700 text-white font-extrabold rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center space-x-2 text-xs transition-all active:scale-[0.99]"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>Book Free Pickup Here</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href="tel:9329838804"
                        className="px-3.5 py-3.5 bg-white hover:bg-sky-50 text-sky-900 border border-sky-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
                        title="Direct Call Nehru Nagar"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Form View */
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-black font-display text-lg text-slate-900">Instant Pickup Booking</h3>
                        <p className="text-xs text-slate-500 font-medium">Doorstep collection across Rewa (M.P.)</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center space-x-1 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>Slots Today</span>
                      </span>
                    </div>

                    <form onSubmit={handleQuickBookContinue} className="space-y-3.5">
                      {/* Step 1: Pincode */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            1. Pickup Pincode / Area
                          </label>
                          <span className="text-[10px] text-sky-700 font-extrabold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/70">
                            Rewa City Live
                          </span>
                        </div>

                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            value={quickPincode}
                            onChange={(e) => setQuickPincode(e.target.value)}
                            placeholder="Enter 486001 or select area below..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all shadow-xs"
                          />
                        </div>

                        {/* Fast Rewa Area Chips */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {[
                            { label: 'Nehru Nagar', pin: '486001' },
                            { label: 'Ring Road', pin: '486001' },
                            { label: 'Civil Lines', pin: '486001' },
                            { label: 'Bodabag', pin: '486003' },
                            { label: 'Saman', pin: '486001' },
                          ].map((chip) => (
                            <button
                              key={chip.label}
                              type="button"
                              onClick={() => setQuickPincode(chip.pin)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${
                                quickPincode === chip.pin
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                              }`}
                            >
                              {chip.label} ({chip.pin})
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 2: Primary Category */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          2. Primary Service
                        </label>
                        <select
                          value={quickServiceId}
                          onChange={(e) => setQuickServiceId(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-xs"
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          3. Preferred 2-Hour Slot
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <select
                            value={quickSlot}
                            onChange={(e) => setQuickSlot(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-xs"
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
                        className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 hover:from-sky-500 hover:to-sky-700 text-white font-black rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] text-sm mt-2"
                      >
                        <span>Continue to Add Garments</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setHeroRightTab('visual')}
                          className="text-[11px] text-sky-700 hover:text-sky-900 font-bold hover:underline flex items-center space-x-1"
                        >
                          <Camera className="w-3 h-3" />
                          <span>View Studio & Facilities Gallery</span>
                        </button>
                        <span className="text-[10px] text-slate-400 font-medium">Cash / UPI on Delivery</span>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================================
              2. TWO RETAIL BRANCHES FLAGSHIP SHOWCASE BANNER
          ========================================================================= */}
          <div className="mt-14 bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-sky-500/5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Brand Storefront & Workshop Image with Switcher */}
              <div className="lg:col-span-5 relative group overflow-hidden rounded-3xl border border-slate-200/90 shadow-lg bg-slate-950">
                <img
                  src={
                    activeBranchPhoto === 'hub1'
                      ? '/images/hero-studio.jpg'
                      : activeBranchPhoto === 'hub2'
                      ? '/images/steam-press.jpg'
                      : '/laundry-lounge-mockup.jpg'
                  }
                  alt="The Laundry Lounge Storefront and Workshop"
                  className="w-full h-72 sm:h-84 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-between p-5">
                  {/* Photo Switcher Chips */}
                  <div className="flex flex-wrap gap-1.5 self-start">
                    <button
                      type="button"
                      onClick={() => setActiveBranchPhoto('hub1')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all backdrop-blur-md ${
                        activeBranchPhoto === 'hub1'
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      Hub 1: Nehru Nagar
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBranchPhoto('hub2')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all backdrop-blur-md ${
                        activeBranchPhoto === 'hub2'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      Hub 2: Ring Road
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBranchPhoto('mockup')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all backdrop-blur-md ${
                        activeBranchPhoto === 'mockup'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      Storefront
                    </button>
                  </div>

                  <div className="text-white space-y-1">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span>Both Hubs Open Daily: 8 AM – 9 PM</span>
                    </div>
                    <p className="font-display font-black text-2xl text-white">The Laundry Lounge</p>
                    <p className="text-xs text-sky-200 font-medium">
                      {activeBranchPhoto === 'hub1'
                        ? 'Nehru Nagar Main Hub • Modern Retail Studio & Counter'
                        : activeBranchPhoto === 'hub2'
                        ? 'Hari Om Ring Road Hub • European Industrial Steam Press Unit'
                        : 'Official Storefront Branding • Rewa, Madhya Pradesh'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Branch Details & Contacts */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                      Our 2 Retail Branches in Rewa
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
                      Drop-in Anytime or Request Doorstep Pickup
                    </h3>
                  </div>
                  <a
                    href="https://wa.me/919329838804"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all hover:scale-105"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Care</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Branch 1 Card */}
                  <div className="p-5 gradient-card-sky rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sky-950 font-bold text-sm">
                        <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-black">
                          1
                        </span>
                        <span className="font-display font-black text-base">Branch 1 — Nehru Nagar</span>
                      </div>
                      <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                        Main Branch
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      Near Gaytri School Nehru Nagar In FRONT Of Apna Super Bazar Rewa (M. P.)
                    </p>

                    <div className="pt-2 border-t border-sky-200/80 flex flex-wrap items-center justify-between text-xs font-bold gap-2">
                      <a
                        href="tel:9329838804"
                        className="inline-flex items-center space-x-1 text-sky-900 hover:text-sky-950 bg-white px-2.5 py-1.5 rounded-xl border border-sky-200 shadow-2xs hover:bg-sky-50"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>9329838804</span>
                      </a>
                      <a
                        href="tel:07662334849"
                        className="text-slate-700 hover:text-slate-900 bg-white px-2.5 py-1.5 rounded-xl border border-sky-200 hover:bg-slate-50"
                      >
                        07662-334849
                      </a>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=Gayatri+School+Nehru+Nagar+Rewa+Madhya+Pradesh"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-sky-700 hover:text-sky-900 bg-sky-100/70 hover:bg-sky-100 px-2 py-1.5 rounded-xl text-[11px]"
                      >
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>

                  {/* Branch 2 Card */}
                  <div className="p-5 gradient-card-red rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-rose-950 font-bold text-sm">
                        <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black">
                          2
                        </span>
                        <span className="font-display font-black text-base">Branch 2 — Hari Om</span>
                      </div>
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                        Ring Road
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      Behind Hotel The Vijay Villas Gadariya Ring Road Rewa (M. P.) with name hari om
                    </p>

                    <div className="pt-2 border-t border-rose-200/80 flex flex-wrap items-center justify-between text-xs font-bold gap-2">
                      <a
                        href="tel:9893733683"
                        className="inline-flex items-center space-x-1 text-rose-900 hover:text-rose-950 bg-white px-2.5 py-1.5 rounded-xl border border-rose-200 shadow-2xs hover:bg-rose-50"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>9893733683</span>
                      </a>
                      <a
                        href="tel:9329838804"
                        className="text-slate-700 hover:text-slate-900 bg-white px-2.5 py-1.5 rounded-xl border border-rose-200 hover:bg-slate-50"
                      >
                        9329838804
                      </a>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=Hotel+The+Vijay+Villas+Gadariya+Ring+Road+Rewa+Madhya+Pradesh"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-rose-700 hover:text-rose-900 bg-rose-100/70 hover:bg-rose-100 px-2 py-1.5 rounded-xl text-[11px]"
                      >
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* All phones contact strip */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-slate-700 font-bold">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Customer Support & Order Queries:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-bold text-slate-900">
                    <a href="tel:9329838804" className="text-sky-700 hover:text-sky-900 hover:underline">
                      9329838804
                    </a>
                    <span className="text-slate-300">•</span>
                    <a href="tel:9893733683" className="text-sky-700 hover:text-sky-900 hover:underline">
                      9893733683
                    </a>
                    <span className="text-slate-300">•</span>
                    <a href="tel:07662334849" className="text-slate-700 hover:text-black hover:underline">
                      Landline: 07662-334849
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. INTERACTIVE INSTANT PRICE ESTIMATOR WITH FREE DELIVERY PROGRESS BAR
      ========================================================================= */}
      {/* =========================================================================
          3. INTERACTIVE INSTANT PRICE ESTIMATOR WITH FREE DELIVERY PROGRESS BAR
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-sky-950/5 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left">
              <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 shadow-2xs">
                ⚡ Instant Cost Calculator
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
                Quick Household Price Estimator
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md font-normal leading-relaxed">
                Adjust garment quantities below to see an instant doorstep cost estimate in Rewa with 100% itemized transparency.
              </p>
            </div>

            {/* Quick Counters */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
              {estimatorItems.map((item) => {
                const count = estimatorCounts[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all text-center flex flex-col justify-between ${
                      count > 0
                        ? 'bg-sky-50/70 border-sky-300 shadow-md shadow-sky-500/10'
                        : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-3xl mb-1.5 filter drop-shadow-xs">{item.icon}</div>
                      <div className="font-bold text-xs text-slate-800 leading-tight">{item.name}</div>
                      <div className="text-xs text-sky-700 font-black mt-1">₹{item.price}<span className="text-[10px] text-slate-500 font-semibold">/pc</span></div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 mt-3 pt-2.5 border-t border-slate-200/80">
                      <button
                        onClick={() => updateEstimatorCount(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs hover:bg-slate-100 active:scale-95 transition-transform border border-slate-200"
                        title="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-black text-slate-900 w-5 text-center">{count}</span>
                      <button
                        onClick={() => updateEstimatorCount(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs hover:bg-sky-700 active:scale-95 transition-transform"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total & Action Card with Progress Bar */}
            <div className="bg-gradient-to-br from-sky-50 via-white to-sky-50/50 p-6 rounded-3xl border border-sky-200/90 text-center min-w-[260px] shadow-lg shadow-sky-900/5 space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Total</span>
                <div className="text-4xl font-black font-display text-sky-950 mt-1">₹{estimatedTotal}</div>
              </div>

              {/* Free delivery progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Free Pickup Goal</span>
                  <span className={estimatedTotal >= freeDeliveryThreshold ? 'text-emerald-600 font-black' : 'text-slate-700'}>
                    {estimatedTotal >= freeDeliveryThreshold ? 'Unlocked! 🎉' : `₹${freeDeliveryThreshold - estimatedTotal} to Free`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200/90 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressToFreeDelivery}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleAddEstimatedToCart}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 hover:from-sky-500 hover:to-sky-700 text-white font-black rounded-xl text-xs shadow-lg shadow-sky-600/25 transition-all active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <span>Add & Book Pickup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. TRUST BADGES STRIP
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-card-interactive p-5 rounded-2xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center flex-shrink-0 shadow-2xs border border-sky-200/50">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black font-display text-slate-900 text-sm">Doorstep Pickup</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Flexible 2-hour slots in Rewa</p>
            </div>
          </div>

          <div className="glass-card-interactive p-5 rounded-2xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-2xs border border-rose-200/50">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black font-display text-slate-900 text-sm">Eco & Hypoallergenic</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">German organic solvents</p>
            </div>
          </div>

          <div className="glass-card-interactive p-5 rounded-2xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-2xs border border-amber-200/50">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black font-display text-slate-900 text-sm">24h Express Delivery</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Urgent event turnaround</p>
            </div>
          </div>

          <div className="glass-card-interactive p-5 rounded-2xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-2xs border border-emerald-200/50">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black font-display text-slate-900 text-sm">Live GPS Tracking</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Real-time WhatsApp updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CORE SERVICE CATEGORIES
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 shadow-2xs">
            Bespoke Fabric Care
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-900 mt-3 tracking-tight">
            Our Core Service Categories
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 font-normal leading-relaxed">
            Each garment is individually tagged, stain-analyzed, and processed with European steam and sanitized ozone cycles in Rewa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const itemCount = services.filter((s) => s.categoryId === cat.id && s.active).length;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg shadow-sky-950/5 hover:shadow-2xl hover:border-sky-300 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                  <span className="absolute top-4 left-4 bg-sky-600/95 backdrop-blur-xs text-white text-xs font-black px-3.5 py-1 rounded-full shadow-md border border-white/20">
                    {cat.badge}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-black font-display">{cat.name}</h3>
                    <p className="text-xs text-sky-200 font-semibold">{itemCount} items available in Rewa</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {cat.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => setCurrentView('services')}
                      className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors"
                    >
                      <span>Browse {cat.name} Catalogue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentView('booking')}
                      className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-sky-600/20 active:scale-[0.99]"
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

      {/* =========================================================================
          6. BEFORE & AFTER FABRIC TRANSFORMATION
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-8 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-3 py-1 rounded-full">
              European Finishing & Stain Removal
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-white">
              Before & After Garment Transformation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              See how our master spotters and Italian steam polishers restore clothes to showroom condition.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex flex-wrap justify-center gap-2">
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
                    ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Split Comparison Card */}
          <div className="max-w-3xl mx-auto bg-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden p-5 sm:p-7 border border-white/10 space-y-5 shadow-2xl">
            {/* Real Photographic Transformation Visual */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 group shadow-2xl bg-slate-950 aspect-[16/9]">
              <img
                src={
                  activeTransformationTab === 'shirt'
                    ? '/images/before-after-shirt.jpg'
                    : '/images/ethnic-silk-care.jpg'
                }
                alt={
                  activeTransformationTab === 'shirt'
                    ? 'Before and After Collar & Coffee Stain Removal'
                    : 'Luxury Ethnic Wear Silk & Sherwani Finishing'
                }
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40 pointer-events-none" />

              {/* Dynamic Callout Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-md">
                  {activeTransformationTab === 'shirt' && 'Before: Stained & Wrinkled'}
                  {activeTransformationTab === 'sherwani' && 'Delicate Royal Fabric'}
                  {activeTransformationTab === 'saree' && 'Silk Zari Preservation'}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-md">
                  After: 100% Showroom Finish
                </span>
              </div>

              {/* Bottom Caption Pill */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                <div className="text-xs">
                  <span className="text-amber-300 font-bold">
                    {activeTransformationTab === 'shirt' && 'Collar & Coffee Eradication: '}
                    {activeTransformationTab === 'sherwani' && 'Wedding Sherwani Care: '}
                    {activeTransformationTab === 'saree' && 'Kanjivaram & Silk Saree: '}
                  </span>
                  <span className="text-slate-200">
                    {activeTransformationTab === 'shirt' && 'Deep yellow oxidation removed without damaging collar stiffener.'}
                    {activeTransformationTab === 'sherwani' && 'Hand spot-cleaned, zari gold luster restored, bead safe.'}
                    {activeTransformationTab === 'saree' && 'European roller steam pressed for seamless soft sheen & zero shrink.'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  ✨ Rewa Lab Verified
                </span>
              </div>
            </div>

            {/* Split Comparison Spec Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-red-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-red-400 bg-red-950/80 px-2 py-0.5 rounded-md border border-red-500/20">
                    Common Problem
                  </span>
                  <span className="text-xs text-slate-400">Home / Local Wash</span>
                </div>
                <div className="text-xs font-bold text-slate-200 pt-1">
                  {activeTransformationTab === 'shirt' && 'Deep Yellowed Collar & Coffee Splash'}
                  {activeTransformationTab === 'sherwani' && 'Dull Zari, Crushed Fabric & Sweat Rings'}
                  {activeTransformationTab === 'saree' && 'Severe Creases, Water Marks & Wrinkled Borders'}
                </div>
                <p className="text-[11px] text-slate-400">Ordinary detergent strips color fibers and leaves stains set.</p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    The Laundry Lounge Standard
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">European Care</span>
                </div>
                <div className="text-xs font-bold text-emerald-300 pt-1">
                  {activeTransformationTab === 'shirt' && 'Spotless White & Stiff Crisp Collar'}
                  {activeTransformationTab === 'sherwani' && 'Restored Gold Luster & Protected Beads'}
                  {activeTransformationTab === 'saree' && 'Silk Sheen Roll Press & Zero Shrinkage'}
                </div>
                <p className="text-[11px] text-emerald-400/90">Sanitized ozone cycle, steam polish & sealed hanger delivery.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10 gap-2">
              <span className="flex items-center space-x-1.5 text-center sm:text-left">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>100% Guaranteed stain removal without fabric fiber damage</span>
              </span>
              <button
                onClick={() => setCurrentView('booking')}
                className="font-bold text-sky-400 hover:text-sky-300 hover:underline shrink-0 flex items-center space-x-1"
              >
                <span>Book for this Garment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. HOW IT WORKS (4 STEPS WITH RICH PHOTOGRAPHY)
      ========================================================================= */}
      <section className="bg-gradient-to-b from-slate-900 via-sky-950 to-slate-950 text-white py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-3.5 py-1 rounded-full">
              Hassle-Free Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display mt-3">How The Laundry Lounge Works</h2>
            <p className="text-sm text-slate-300 mt-2 font-medium">
              From your wardrobe back to your doorstep in four easy steps across Rewa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative bg-white/5 rounded-3xl p-5 border border-white/10 hover:border-sky-400/50 transition-all flex flex-col group">
              <div className="relative rounded-2xl overflow-hidden h-40 mb-4 bg-slate-900">
                <img
                  src="/images/hero-studio.jpg"
                  alt="Book Online or Call"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <span className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-sky-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                  01
                </span>
                <span className="absolute bottom-2.5 left-3 text-[11px] font-bold text-sky-200">
                  Instant Online / Call
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1 text-white">Book Online or Call</h3>
              <p className="text-xs text-slate-300 leading-relaxed flex-1">
                Choose garments from dry clean, wash & iron, or steam press, and pick your preferred 2-hour slot.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white/5 rounded-3xl p-5 border border-white/10 hover:border-sky-400/50 transition-all flex flex-col group">
              <div className="relative rounded-2xl overflow-hidden h-40 mb-4 bg-slate-900">
                <img
                  src="/images/doorstep-delivery.jpg"
                  alt="Doorstep Rider Pickup"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <span className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-sky-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                  02
                </span>
                <span className="absolute bottom-2.5 left-3 text-[11px] font-bold text-sky-200">
                  Tagged Collection Hamper
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1 text-white">Doorstep Rider Pickup</h3>
              <p className="text-xs text-slate-300 leading-relaxed flex-1">
                Our uniformed rider collects your garments in sealed bags and delivers them to our nearest Rewa hub.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white/5 rounded-3xl p-5 border border-white/10 hover:border-sky-400/50 transition-all flex flex-col group">
              <div className="relative rounded-2xl overflow-hidden h-40 mb-4 bg-slate-900">
                <img
                  src="/images/steam-press.jpg"
                  alt="Expert Fabric Care"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <span className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                  03
                </span>
                <span className="absolute bottom-2.5 left-3 text-[11px] font-bold text-amber-200">
                  Veit European Steam Press
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1 text-white">Expert Fabric Care</h3>
              <p className="text-xs text-slate-300 leading-relaxed flex-1">
                Eco-safe cleaning, gentle organic solvents, precision spot treatment, and Italian steam roll pressing.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative bg-white/5 rounded-3xl p-5 border border-white/10 hover:border-sky-400/50 transition-all flex flex-col group">
              <div className="relative rounded-2xl overflow-hidden h-40 mb-4 bg-slate-900">
                <img
                  src="/images/ethnic-silk-care.jpg"
                  alt="Punctual Return"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <span className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                  04
                </span>
                <span className="absolute bottom-2.5 left-3 text-[11px] font-bold text-emerald-200">
                  Crisp Hanger Delivery
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1 text-white">Punctual Return</h3>
              <p className="text-xs text-slate-300 leading-relaxed flex-1">
                Delivered back to your doorstep in Rewa, fragrant, pristine, and ready-to-wear on hangers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. REWA PINCODE & SERVICE AREA CHECKER
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Rewa Coverage Checker
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                Do We Serve Your Neighborhood in Rewa?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The Laundry Lounge operates dedicated doorstep pickup and delivery fleets across Rewa (M.P.) from our 2 central branches (Nehru Nagar & Ring Road). Check your pincode below to view instant pickup availability.
              </p>

              <form onSubmit={handleTestPincode} className="flex gap-2 pt-2 max-w-md">
                <input
                  type="text"
                  value={checkerPincode}
                  onChange={(e) => setCheckerPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode (e.g. 486001)"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 text-sm font-semibold"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
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
                        <span className="font-bold">Area currently not in scheduled route.</span>
                        <p className="text-[11px] text-rose-600 mt-0.5">
                          Call us directly at 9329838804 for special bulk pickup requests!
                        </p>
                      </div>
                      <a
                        href="tel:9329838804"
                        className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-[11px]"
                      >
                        Call Care
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold font-display text-sm text-slate-800">Verified Service Areas in Rewa (M.P.)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {serviceAreas.map((sa) => (
                  <div
                    key={sa.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs"
                  >
                    <span className="font-semibold text-slate-700 truncate pr-2">{sa.areaName}</span>
                    <span className="font-mono text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-bold border border-sky-200">
                      {sa.pincode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. CUSTOMER REVIEWS
      ========================================================================= */}
      {featuredReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Customer Testimonials
            </span>
            <h2 className="text-3xl font-black font-display text-slate-900 mt-2">Loved by Rewa Households</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-400 space-x-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{rev.customerName}</span>
                    <span className="text-slate-400 text-[11px]">{rev.serviceCategory}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Customer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
