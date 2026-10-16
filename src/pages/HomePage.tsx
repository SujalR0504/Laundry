import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
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
  Sliders,
  Droplets,
  Wind,
  Sun,
  ShieldAlert,
  Percent,
  Search,
  ChevronDown,
  Gift,
  HelpCircle,
  Sparkle,
  BadgePercent,
  Shirt,
  Volume2,
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

  // Hero Right Widget Tab (Interactive Washing Drum Simulator / Visual Studio / 60s Booking)
  const [heroRightTab, setHeroRightTab] = useState<'simulator' | 'visual' | 'form'>('simulator');
  const [activeDrumCycle, setActiveDrumCycle] = useState<'ozone' | 'steam' | 'silk' | 'eco'>('ozone');
  const [isDrumSpinning, setIsDrumSpinning] = useState(true);

  // Hero Gallery
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
  const [activeBranchPhoto, setActiveBranchPhoto] = useState<'hub1' | 'hub2' | 'mockup'>('hub1');

  // Interactive Live Price Estimator State
  const [estimatorCounts, setEstimatorCounts] = useState<{ [key: string]: number }>({
    'dc-shirt': 2,
    'dc-pant': 2,
    'ir-saree': 1,
    'dc-blazer': 1,
  });
  const [couponApplied, setCouponApplied] = useState(false);

  // Interactive Before/After Garment Transformation Slider State
  const [activeTransformationTab, setActiveTransformationTab] = useState<'shirt' | 'sherwani' | 'saree'>('shirt');
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // 7-Stage Garment Spa Active Step
  const [activeSpaStep, setActiveSpaStep] = useState(0);

  // Pincode Checker tool state
  const [checkerPincode, setCheckerPincode] = useState('');
  const [checkerResult, setCheckerResult] = useState<{
    checked: boolean;
    area?: any;
  }>({ checked: false });

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<string | null>(faqs[0]?.id || null);
  const [faqFilter, setFaqFilter] = useState<'all' | 'pricing' | 'delicate' | 'pickup'>('all');

  // Coupon Card State
  const [claimedVoucher, setClaimedVoucher] = useState(false);
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

  // Cycle simulator options
  const cycleInfo = {
    ozone: {
      name: 'Sanitized Ozone Eco-Wash',
      temp: '30°C Cold Shield',
      rpm: '800 RPM Gentle Hydro-Cushion',
      benefit: 'Eliminates 99.9% germs, zero color fading',
      detergent: 'German Biodegradable Bio-Enzymes',
      accent: 'from-sky-500 to-cyan-500',
    },
    steam: {
      name: 'Veit European 3D Steam Spa',
      temp: '140°C Purified Dry Steam',
      rpm: 'Static Vacuum Forming',
      benefit: 'Relaxes stubborn fibers, restores fabric loft',
      detergent: 'Demineralized Distilled Steam Flow',
      accent: 'from-amber-500 to-orange-500',
    },
    silk: {
      name: 'Bridal Silk & Zari Roll-Press',
      temp: 'Gentle Warm Heated Cylinders',
      rpm: '120 RPM Micro Roller Tension',
      benefit: 'Preserves gold embroidery & zero shrinkage',
      detergent: 'Zero-Moisture Hydrocarbon Solvent',
      accent: 'from-rose-500 to-pink-500',
    },
    eco: {
      name: 'Organic Daily Wash & Tumble',
      temp: '40°C Sanitized Soft Water',
      rpm: '1200 RPM Moisture Extraction',
      benefit: 'Crisp everyday comfort, hypoallergenic',
      detergent: '5-Stage RO Filtered Fresh Soft Water',
      accent: 'from-emerald-500 to-teal-500',
    },
  };

  // Draggable slider handler
  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleSliderMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    }
  };

  // Estimator items & calculation
  const estimatorItems = [
    { id: 'dc-shirt', name: 'Dry Clean Shirt', price: 50, icon: '👔', tag: 'Collar Care' },
    { id: 'dc-pant', name: 'Dry Clean Pant', price: 50, icon: '👖', tag: 'Crease Lock' },
    { id: 'ir-saree', name: 'Roll Press Saree', price: 50, icon: '🥻', tag: 'Silk Finish' },
    { id: 'dc-blazer', name: 'Suit Blazer', price: 150, icon: '🧥', tag: 'Lapel Press' },
    { id: 'dc-kurta', name: 'Kurta / Pajama', price: 60, icon: '👕', tag: 'Gentle Wash' },
    { id: 'dc-quilt', name: 'Heavy Blanket / Quilt', price: 250, icon: '🛏️', tag: 'Ozone sanitized' },
  ];

  const updateEstimatorCount = (id: string, delta: number) => {
    setEstimatorCounts((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const rawEstimatedTotal = estimatorItems.reduce(
    (sum, item) => sum + (estimatorCounts[item.id] || 0) * item.price,
    0
  );

  const discountAmount = couponApplied ? Math.round(rawEstimatedTotal * 0.25) : 0;
  const estimatedTotal = rawEstimatedTotal - discountAmount;

  const freeDeliveryThreshold = 399;
  const progressToFreeDelivery = Math.min(100, Math.round((rawEstimatedTotal / freeDeliveryThreshold) * 100));

  const handleApplyVoucher = () => {
    setCouponApplied(!couponApplied);
    if (!couponApplied) {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0284c7', '#06b6d4', '#f59e0b', '#10b981'],
      });
      showToast('Coupon FIRSTWASH25 applied: 25% OFF!', 'success');
    } else {
      showToast('Coupon removed', 'info');
    }
  };

  const handleClaimTopVoucher = () => {
    setClaimedVoucher(true);
    navigator.clipboard?.writeText('FIRSTWASH25');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#fbbf24', '#f43f5e', '#34d399'],
    });
    showToast('Code FIRSTWASH25 Copied! 25% Off Unlocked 🎉', 'success');
  };

  const handleAddEstimatedToCart = () => {
    let addedCount = 0;
    estimatorItems.forEach((item) => {
      const count = estimatorCounts[item.id] || 0;
      if (count > 0) {
        const fullService = services.find((s) => s.id === item.id) || {
          id: item.id,
          name: item.name,
          categoryId: 'cat-dry-clean',
          description: `Professional care for ${item.name}`,
          priceType: 'fixed',
          price: item.price,
          unit: 'Piece',
          turnaroundHours: 48,
          image: '/images/steam-press.jpg',
          active: true,
          featured: true,
        };
        addToCart(fullService as any, count);
        addedCount += count;
      }
    });

    if (addedCount > 0) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 },
      });
      showToast(`Added ${addedCount} garments to your laundry hamper!`, 'success');
      setCurrentView('booking');
    } else {
      showToast('Please select at least 1 garment to proceed', 'info');
    }
  };

  const handleQuickBookContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPincode) {
      showToast('Please enter your pickup pincode or select an area', 'error');
      return;
    }
    const servArea = checkPincodeServiceability(quickPincode);
    if (!servArea) {
      showToast('We currently do not have scheduled routes for this pincode yet.', 'error');
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

  // 7-Stage Garment Spa Steps (Inspired by Pressto & WashODry)
  const spaSteps = [
    {
      num: '01',
      title: 'Optical Tagging & Fabric Diagnostic',
      subtitle: 'Barcoded garment tracking with fiber inspection & colorfastness check',
      icon: Eye,
      tag: 'Zero Misplacement',
      detail: 'Every shirt, saree, or suit receives an individual QR code and high-resolution camera log. Pockets are searched, buttons checked, and stains graded before washing.',
    },
    {
      num: '02',
      title: 'Ultrasonic Stain Eradication',
      subtitle: 'Targeted spot treatment for wine, grease, oil, and sweat rings',
      icon: Droplets,
      tag: 'Safe on Fibers',
      detail: 'German gentle bio-enzymatic agents dissolve oxidation and stubborn collar rings without harsh chlorine bleach, preserving fabric strength and color richness.',
    },
    {
      num: '03',
      title: 'Sanitized Ozone Micro-Bubble Wash',
      subtitle: 'Hospital-grade cold ozone sterilization with 5-stage RO softened water',
      icon: Wind,
      tag: '99.9% Bacteria Free',
      detail: 'Ozone gas infusion penetrates deep into the weave to destroy odours, sweat bacteria, and allergens. Separate dedicated wash loads—never mixed with other customers clothes.',
    },
    {
      num: '04',
      title: 'Veit European 3D Steam Sculpting',
      subtitle: 'Form-finishing mannequins & industrial vacuum tables for crisp edges',
      icon: Flame,
      tag: 'Zero Scorch Guarantee',
      detail: 'Purified dry steam relaxes inner fibers while vacuum suction locks in sharp creases. Safe for delicate silks, wool suits, and cashmere with 100% zero burn risk.',
    },
    {
      num: '05',
      title: 'UV-C Antimicrobial Sanitization',
      subtitle: 'Final germ-shield cycle inside our clean-room finishing chamber',
      icon: Sun,
      tag: 'Allergen Shield',
      detail: 'A short UV-C beam exposure neutralizes dust mites, seasonal pathogens, and mildew spores so garments remain hygienic even after days in your wardrobe.',
    },
    {
      num: '06',
      title: 'Multi-Point Master Quality Audit',
      subtitle: 'Scrutiny of buttons, hemlines, cuffs, collar symmetry, and fragrance',
      icon: Award,
      tag: '100% Showroom Pass',
      detail: 'If a stain has even 1% residue or a crease is misaligned, the garment goes back for complimentary re-processing. Only showroom-grade items are approved.',
    },
    {
      num: '07',
      title: 'Luxury Garment Shield & Hanger Delivery',
      subtitle: 'Sealed breathable dust covers, custom wooden hangers, and delivery to your door',
      icon: Truck,
      tag: 'Doorstep Perfection',
      detail: 'Suits and sarees are hung in anti-static garment bags to maintain zero wrinkles during transit. Delivered by uniformed riders in sanitized hampers.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    if (faqFilter === 'all') return true;
    if (faqFilter === 'pricing') return faq.category === 'Pricing' || faq.question.toLowerCase().includes('price') || faq.question.toLowerCase().includes('cost');
    if (faqFilter === 'delicate') return faq.category === 'Garment Care' || faq.question.toLowerCase().includes('silk') || faq.question.toLowerCase().includes('stain');
    if (faqFilter === 'pickup') return faq.category === 'Pickup & Delivery' || faq.question.toLowerCase().includes('pickup') || faq.question.toLowerCase().includes('delivery');
    return true;
  });

  const featuredServices = services.filter((s) => s.featured && s.active).slice(0, 8);
  const featuredReviews = reviews.filter((r) => r.approved && r.featured);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 overflow-x-hidden selection:bg-sky-500 selection:text-white">
      {/* =========================================================================
          🔥 0. HIGH-ENERGY LIVE NOTIFICATION & VALUE TICKER (WashODry Inspired)
      ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 text-white text-xs py-2.5 px-4 border-b border-sky-800/40 relative overflow-hidden shadow-inner">
        <div className="animate-marquee whitespace-nowrap flex items-center space-x-10 text-slate-200 font-semibold tracking-wide">
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-emerald-300 font-black uppercase text-[11px] tracking-wider">Live Activity:</span>
            <span>Over 12,480+ garments freshly delivered across MP this month</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center space-x-1.5 text-amber-300">
            <Gift className="w-3.5 h-3.5" />
            <span className="font-bold">WELCOME25:</span>
            <span className="text-white">Flat 25% Off on your 1st Doorstep Booking!</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center space-x-1.5 text-sky-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>100% German Bio-Detergents &amp; Pure RO Soft Water</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center space-x-1.5 text-rose-300">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Veit European Steam Table: 0% Fabric Scorch Guarantee</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center space-x-1.5 text-emerald-300">
            <Truck className="w-3.5 h-3.5" />
            <span>Free Doorstep Collection &amp; Delivery on Orders Above ₹399</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center space-x-1.5 text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Express 24h &amp; Standard 48h Turnaround Available</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          🌟 1. HERO SECTION (DYNAMIC WASHING DRUM SIMULATOR & FLOATING BUBBLES)
      ========================================================================= */}
      <section className="relative overflow-hidden gradient-mesh pt-6 sm:pt-12 pb-16 sm:pb-24 border-b border-slate-200/60">
        {/* Animated Background Atmospheric Light Blooms & Bubbles */}
        <div className="absolute top-0 right-1/4 w-[520px] h-[520px] bg-sky-300/35 rounded-full blur-3xl pointer-events-none animate-float-delayed" />
        <div className="absolute top-1/3 left-4 w-[460px] h-[460px] bg-rose-200/30 rounded-full blur-3xl pointer-events-none animate-float" />
        
        {/* Floating Bubble Micro-Elements */}
        <div className="bubble-particle w-8 h-8 top-12 left-10" style={{ animationDelay: '0s' }} />
        <div className="bubble-particle w-5 h-5 top-36 right-20" style={{ animationDelay: '1.2s' }} />
        <div className="bubble-particle w-12 h-12 bottom-16 left-1/3" style={{ animationDelay: '2.5s' }} />
        <div className="bubble-particle w-6 h-6 top-1/2 right-1/4" style={{ animationDelay: '3.1s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Pill Announcement Bar */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-colors">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Next-Day Delivery Cutoff:</span>
              <span className="font-mono font-bold text-amber-300">
                {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>

            <button
              onClick={handleClaimTopVoucher}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 text-rose-700 text-xs font-black border border-rose-200/80 shadow-2xs transition-all active:scale-95 group"
            >
              <BadgePercent className="w-3.5 h-3.5 text-rose-600 group-hover:rotate-12 transition-transform" />
              <span>Claim Flat 25% Off Code:</span>
              <span className="underline decoration-rose-400 font-mono">FIRSTWASH25</span>
              <Copy className="w-3 h-3 text-rose-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100/90 text-sky-900 text-xs font-bold border border-sky-200/80 shadow-xs backdrop-blur-xs">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Rated 4.9/5 by 5,000+ Happy Households • European Fabric Care</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-slate-900 leading-[1.04]">
                The Laundry{' '}
                <span className="text-gradient-red drop-shadow-xs">Lounge</span>
                <span className="block text-2xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-800 via-sky-600 to-cyan-600 mt-2 sm:mt-3">
                  European Boutique Garment Spa &amp; Doorstep Care
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Veit European steam pressing, 5-stage RO ozone washing, and delicate Banarasi silk roll press delivered to your doorstep. Visit our 2 flagship retail studios or schedule an express doorstep pickup in 60 seconds.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => setCurrentView('booking')}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 hover:from-sky-500 hover:to-sky-700 active:scale-[0.99] text-white font-black rounded-2xl shadow-xl shadow-sky-600/30 flex items-center justify-center space-x-2.5 transition-all text-base group"
                >
                  <Calendar className="w-5 h-5 text-amber-300" />
                  <span>Schedule Free Pickup</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>

                {/* Direct Dial Branch 1 */}
                <a
                  href="tel:9329838804"
                  className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-sky-50 text-sky-950 font-bold rounded-2xl border border-sky-200/90 shadow-soft-sm flex items-center justify-center space-x-2 transition-all text-sm group"
                  title="Call Nehru Nagar Branch"
                >
                  <Phone className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>Call Nehru Nagar: 9329838804</span>
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
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2">
                <span className="px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Zero Fabric Damage</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Express 24h Turnaround</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>Free Pickup on ₹399+</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/95 border border-rose-200 text-xs font-bold text-rose-700 shadow-2xs flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>2 Central Studios in Rewa</span>
                </span>
              </div>
            </div>

            {/* Right: Interactive High-Tech Drum Simulator & Quick Booking Console */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-4 sm:p-7 shadow-2xl relative border border-white/80 backdrop-blur-xl">
                {/* 3 Interactive Switcher Tabs */}
                <div className="grid grid-cols-3 p-1 bg-slate-100/90 rounded-2xl mb-4 text-[11px] sm:text-xs font-bold border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setHeroRightTab('simulator')}
                    className={`py-2 px-1 sm:px-2 rounded-xl flex items-center justify-center space-x-1 transition-all ${
                      heroRightTab === 'simulator'
                        ? 'bg-white text-sky-950 shadow-sm font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 ${isDrumSpinning ? 'animate-spin' : ''}`} />
                    <span><span className="hidden sm:inline">Drum </span>Simulator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroRightTab('visual')}
                    className={`py-2 px-1 sm:px-2 rounded-xl flex items-center justify-center space-x-1 transition-all ${
                      heroRightTab === 'visual'
                        ? 'bg-white text-sky-950 shadow-sm font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600" />
                    <span>Studio<span className="hidden sm:inline"> Hub</span></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroRightTab('form')}
                    className={`py-2 px-1 sm:px-2 rounded-xl flex items-center justify-center space-x-1 transition-all ${
                      heroRightTab === 'form'
                        ? 'bg-white text-sky-950 shadow-sm font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600" />
                    <span>Instant<span className="hidden sm:inline"> (60s)</span></span>
                  </button>
                </div>

                {heroRightTab === 'simulator' ? (
                  /* ========================================================
                     WASHING DRUM INTERACTIVE SIMULATOR (HIGH ENGAGEMENT)
                  ======================================================== */
                  <div className="space-y-4">
                    {/* Simulator Drum Visual Screen */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 p-4 border border-slate-800 shadow-inner flex flex-col justify-between">
                      {/* Top HUD Display */}
                      <div className="flex items-center justify-between text-white text-[11px] font-mono z-10">
                        <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-sky-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold text-sky-300">EUROPEAN SPA SYSTEM</span>
                        </div>
                        <button
                          onClick={() => setIsDrumSpinning(!isDrumSpinning)}
                          className="px-2.5 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 font-bold transition-all text-[10px]"
                        >
                          {isDrumSpinning ? '⏸ Pause Drum' : '▶ Spin Drum'}
                        </button>
                      </div>

                      {/* Center Washing Machine Drum Portal with Real Spin Effect */}
                      <div className="relative mx-auto my-auto w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                        {/* Outer Chrome Bezel */}
                        <div className="absolute inset-0 rounded-full border-4 border-slate-700/80 shadow-[0_0_30px_rgba(14,165,233,0.3)] animate-pulse-ring" />
                        
                        {/* Water Vortex Glass */}
                        <div className="absolute inset-2 rounded-full bg-sky-900/40 backdrop-blur-xs overflow-hidden border border-sky-400/40">
                          {/* Animated Water Bubbles & Foam inside Drum */}
                          <div className={`w-full h-full relative ${isDrumSpinning ? 'animate-drum-active' : ''}`}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/30 via-cyan-400/20 to-transparent" />
                            {/* Realistic Perforated Drum Ribs */}
                            <div className={`absolute inset-4 rounded-full border-2 border-dashed border-sky-200/40 ${isDrumSpinning ? 'animate-drum-spin' : ''}`} />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white">
                              <span className="text-3xl filter drop-shadow-md">
                                {activeDrumCycle === 'ozone' && '🫧'}
                                {activeDrumCycle === 'steam' && '💨'}
                                {activeDrumCycle === 'silk' && '🥻'}
                                {activeDrumCycle === 'eco' && '🌿'}
                              </span>
                              <div className="text-[10px] font-mono font-bold text-sky-200 mt-0.5 uppercase tracking-wider">
                                {activeDrumCycle} Active
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Live Telemetry Overlay */}
                      <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-2.5 border border-slate-800 text-white z-10 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-sky-300">{cycleInfo[activeDrumCycle].name}</span>
                          <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-500/30">
                            {cycleInfo[activeDrumCycle].temp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                          <span className="truncate pr-2">{cycleInfo[activeDrumCycle].benefit}</span>
                          <span className="font-mono text-[10px] text-cyan-300 shrink-0">{cycleInfo[activeDrumCycle].rpm}</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Cycle Mode Selector */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                        <span>Select Fabric Cycle to Test:</span>
                        <span className="text-sky-700 font-black">Click to change mode</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'ozone', label: 'Ozone Wash', icon: '🫧' },
                          { id: 'steam', label: 'Steam Spa', icon: '💨' },
                          { id: 'silk', label: 'Silk Roll', icon: '🥻' },
                          { id: 'eco', label: 'Pure RO Soft', icon: '🌿' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setActiveDrumCycle(c.id as any);
                              setIsDrumSpinning(true);
                            }}
                            className={`p-2 rounded-xl text-center border transition-all ${
                              activeDrumCycle === c.id
                                ? 'bg-sky-600 text-white border-sky-600 shadow-md scale-[1.03]'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <div className="text-base">{c.icon}</div>
                            <div className="text-[10px] font-bold mt-0.5 truncate">{c.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Book for this cycle */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentView('booking')}
                        className="flex-1 py-3 bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 hover:from-sky-500 hover:to-sky-700 text-white font-extrabold rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center space-x-2 text-xs transition-all active:scale-[0.99]"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>Book Pickup with {cycleInfo[activeDrumCycle].name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : heroRightTab === 'visual' ? (
                  /* Visual Studio Showcase with Interactive Switcher */
                  <div className="space-y-4">
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
                        <span>Click to explore facilities &amp; fabric care:</span>
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

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentView('booking')}
                        className="flex-1 py-3.5 bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 hover:from-sky-500 hover:to-sky-700 text-white font-extrabold rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center space-x-2 text-xs transition-all active:scale-[0.99]"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>Schedule Free Pickup Here</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form View */
                  <div>
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
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ✨ 2. INTERACTIVE "BUILD YOUR BASKET" LIVE CALCULATOR (WashODry Inspired)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-sky-950/5 relative overflow-hidden">
          {/* Subtle Ambient Background Water Wave Glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center lg:text-left max-w-md">
              <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 shadow-2xs">
                <Sliders className="w-3.5 h-3.5 text-sky-600" />
                <span>Interactive Cost Calculator</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight leading-tight">
                Build Your Laundry Load &amp; Unlock Free Delivery
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Add or subtract garments below to see live transparent pricing. Reach ₹399 to unlock 100% Free Doorstep Pickup &amp; Return!
              </p>

              {/* Promo code badge */}
              <div className="pt-1 flex items-center justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    couponApplied
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>{couponApplied ? 'FIRSTWASH25 (25% OFF) Active!' : 'Click to Apply FIRSTWASH25 (25% Off)'}</span>
                  <span className="text-[10px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-white border">
                    {couponApplied ? 'Remove' : 'Apply'}
                  </span>
                </button>
              </div>
            </div>

            {/* Garment Grid with Interactive + / - counters */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl">
              {estimatorItems.map((item) => {
                const count = estimatorCounts[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col justify-between ${
                      count > 0
                        ? 'bg-sky-50/70 border-sky-300 shadow-md shadow-sky-500/10 scale-[1.02]'
                        : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-3xl mb-1 filter drop-shadow-xs">{item.icon}</div>
                      <div className="font-bold text-xs text-slate-800 leading-tight">{item.name}</div>
                      <span className="inline-block text-[9px] font-bold text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded mt-0.5">
                        {item.tag}
                      </span>
                      <div className="text-xs text-sky-700 font-black mt-1">
                        ₹{item.price}
                        <span className="text-[10px] text-slate-500 font-semibold">/pc</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 mt-3 pt-2 border-t border-slate-200/80">
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

            {/* Total Tally & Milestone Action Card */}
            <div className="bg-gradient-to-br from-sky-50 via-white to-sky-50/50 p-6 rounded-3xl border border-sky-200/90 text-center min-w-[270px] shadow-lg shadow-sky-900/5 space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Total</span>
                <div className="flex items-baseline justify-center space-x-2 mt-1">
                  {couponApplied && (
                    <span className="text-sm font-bold text-slate-400 line-through">₹{rawEstimatedTotal}</span>
                  )}
                  <span className="text-4xl font-black font-display text-sky-950">₹{estimatedTotal}</span>
                </div>
                {couponApplied && (
                  <span className="text-[11px] text-emerald-600 font-extrabold block mt-0.5">
                    🎉 You save ₹{discountAmount} (25% Off)!
                  </span>
                )}
              </div>

              {/* Free delivery progress meter */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Free Doorstep Pickup Goal</span>
                  <span className={rawEstimatedTotal >= freeDeliveryThreshold ? 'text-emerald-600 font-black' : 'text-slate-700'}>
                    {rawEstimatedTotal >= freeDeliveryThreshold ? 'Unlocked! 🚚🎉' : `₹${freeDeliveryThreshold - rawEstimatedTotal} more needed`}
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
                <span>Add Basket &amp; Book Pickup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          💎 3. 7-STAGE GARMENT WELLNESS JOURNEY (Pressto Inspired Interactive Stepper)
      ========================================================================= */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 text-white py-16 sm:py-24 rounded-3xl mx-4 sm:mx-6 lg:mx-8 relative overflow-hidden shadow-2xl">
        {/* Subtle Background Glow Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-sky-300 bg-sky-900/60 px-3.5 py-1.5 rounded-full border border-sky-400/30">
              European Atelier Process
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-display mt-3 tracking-tight">
              The 7-Stage Garment Spa Experience
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-normal leading-relaxed">
              Inspired by luxury European dry cleaners like Pressto. Click each stage to see how your precious garments are treated with zero fabric degradation.
            </p>
          </div>

          {/* Connected Step Pills Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-8">
            {spaSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = activeSpaStep === idx;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveSpaStep(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-black ${isActive ? 'text-amber-300' : 'text-slate-400'}`}>
                      {step.num}
                    </span>
                    <StepIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div className="font-bold text-xs line-clamp-2 leading-tight">
                    {step.title.split('&')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Magnified Inspection Card */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 border border-white/10 shadow-lg group">
                <img
                  src={
                    activeSpaStep === 0
                      ? '/images/hero-studio.jpg'
                      : activeSpaStep === 1
                      ? '/images/before-after-shirt.jpg'
                      : activeSpaStep === 2
                      ? '/images/hero-studio.jpg'
                      : activeSpaStep === 3
                      ? '/images/steam-press.jpg'
                      : activeSpaStep === 4
                      ? '/images/ethnic-silk-care.jpg'
                      : activeSpaStep === 5
                      ? '/images/steam-press.jpg'
                      : '/images/doorstep-delivery.jpg'
                  }
                  alt={spaSteps[activeSpaStep].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-sky-500 text-slate-950 font-black text-xs">
                  Stage {spaSteps[activeSpaStep].num} of 07
                </span>
                <span className="absolute bottom-3 left-3 text-xs font-bold text-amber-300">
                  {spaSteps[activeSpaStep].tag}
                </span>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-black text-amber-300 bg-amber-950/70 px-2.5 py-1 rounded-full border border-amber-500/30">
                    STEP {spaSteps[activeSpaStep].num}
                  </span>
                  <span className="text-xs text-sky-300 font-bold">
                    {spaSteps[activeSpaStep].subtitle}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                  {spaSteps[activeSpaStep].title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {spaSteps[activeSpaStep].detail}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveSpaStep((prev) => (prev + 1) % spaSteps.length)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center space-x-2 transition-all"
                  >
                    <span>Next Stage: {spaSteps[(activeSpaStep + 1) % spaSteps.length].title.split('&')[0]}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setCurrentView('booking')}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-sky-500/20"
                  >
                    <span>Book with this 7-Stage Spa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          🔥 4. INTERACTIVE DRAG-TO-COMPARE BEFORE/AFTER STAIN REMOVER (Pressto Inspired)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-3.5 py-1.5 rounded-full border border-amber-500/30">
              Interactive Fabric Restoration Slider
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display mt-3 tracking-tight">
              Drag to Reveal the Showroom Transformation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-normal">
              Slide left or right across the image to see yellowed oxidation, grease, and deep wrinkles disappear under our Veit European steam table.
            </p>
          </div>

          {/* Garment Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              { id: 'shirt', label: '👔 Collar & Coffee Stain (Shirt)' },
              { id: 'sherwani', label: '🥻 Wedding Sherwani (Zari Care)' },
              { id: 'saree', label: '✨ Banarasi Silk Saree (Roll Press)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTransformationTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTransformationTab === tab.id
                    ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20 scale-105'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Split Drag Comparison Container */}
          <div
            ref={sliderRef}
            onMouseDown={() => setIsDraggingSlider(true)}
            onMouseUp={() => setIsDraggingSlider(false)}
            onMouseLeave={() => setIsDraggingSlider(false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative max-w-4xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-slate-700 shadow-2xl bg-slate-900"
          >
            {/* "After" Pristine Image (Full Width Background) */}
            <img
              src={
                activeTransformationTab === 'shirt'
                  ? '/images/before-after-shirt.jpg'
                  : activeTransformationTab === 'sherwani'
                  ? '/images/steam-press.jpg'
                  : '/images/ethnic-silk-care.jpg'
              }
              alt="After Showroom Restoration"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-emerald-600/90 text-white text-[11px] font-black font-mono px-3 py-1 rounded-full backdrop-blur-md shadow-md z-10">
              AFTER: SHOWROOM CRISP
            </div>

            {/* "Before" Stained Image (Clipped by slider percentage) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={
                  activeTransformationTab === 'shirt'
                    ? '/images/before-after-shirt.jpg'
                    : activeTransformationTab === 'sherwani'
                    ? '/images/steam-press.jpg'
                    : '/images/ethnic-silk-care.jpg'
                }
                alt="Before Washing"
                className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-50"
                style={{
                  width: sliderRef.current?.getBoundingClientRect().width || '100%',
                  maxWidth: 'none',
                }}
              />
              {/* Artificial Wrinkle/Stain Simulation Overlay for Before Side */}
              <div className="absolute inset-0 bg-amber-950/30 backdrop-blur-[0.5px]" />
              <div className="absolute top-4 left-4 bg-red-600/90 text-white text-[11px] font-black font-mono px-3 py-1 rounded-full backdrop-blur-md shadow-md">
                BEFORE: STAINED &amp; CREASED
              </div>
            </div>

            {/* Draggable Vertical Divider Bar with Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center font-bold text-xs pointer-events-auto border-2 border-sky-500">
                <Sliders className="w-4 h-4 text-sky-600 rotate-90" />
              </div>
            </div>

            {/* Bottom Floating Caption Pill */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs z-10 border border-white/10">
              <span className="text-amber-300 font-bold truncate pr-2">
                {activeTransformationTab === 'shirt' && 'Yellowed collar oxidation & deep coffee splash wiped out 100%'}
                {activeTransformationTab === 'sherwani' && 'Hand spot-treated, gold zari thread shine restored without water bleed'}
                {activeTransformationTab === 'saree' && 'European roller steam pressed for seamless soft sheen & zero shrink'}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                ✨ Zero Fabric Burn
              </span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <span>Tip: Drag the white slider knob back and forth to inspect fabric fibers</span>
            <button
              onClick={() => setCurrentView('booking')}
              className="font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center space-x-1"
            >
              <span>Schedule Pickup for this Garment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ⚖️ 5. "WHY SETTLE FOR LOCAL DHOBI?" COMPARISON MATRIX (CleanDive & Pressto Inspired)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200">
            Uncompromising Standards
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-900 mt-2 tracking-tight">
            Traditional Dhobi vs. The Laundry Lounge
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Why Bhopal &amp; Rewa households trust us with their high-value wardrobe.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-sky-950/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-black text-slate-600 uppercase tracking-wider">
                  <th className="py-4 px-5">Garment Safety Parameter</th>
                  <th className="py-4 px-5 text-red-600">Street Dhobi / Local Iron</th>
                  <th className="py-4 px-5 bg-sky-50/80 text-sky-900 font-extrabold border-l border-r border-sky-200">
                    ✨ The Laundry Lounge (European Standard)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">1. Washing Water Quality</td>
                  <td className="py-4 px-5 text-slate-500">Hard tap/borewell water with mineral scale that stiffens clothes</td>
                  <td className="py-4 px-5 bg-sky-50/40 text-sky-950 font-bold border-l border-r border-sky-200">
                    5-Stage RO Softened &amp; Filtered Water (Preserves fiber silkiness)
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">2. Customer Load Separation</td>
                  <td className="py-4 px-5 text-slate-500">Washed together in large shared vats with stranger clothes</td>
                  <td className="py-4 px-5 bg-sky-50/40 text-sky-950 font-bold border-l border-r border-sky-200">
                    100% Dedicated Individual Cycles (Zero clothes mixing guarantee)
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">3. Ironing Equipment</td>
                  <td className="py-4 px-5 text-slate-500">Unregulated heavy coal iron (Frequent yellow burns &amp; scorched synthetic fibers)</td>
                  <td className="py-4 px-5 bg-sky-50/40 text-sky-950 font-bold border-l border-r border-sky-200">
                    Veit European Steam Vacuum Tables (Dry steam, 0% fabric burn guarantee)
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">4. Detergent Chemistry</td>
                  <td className="py-4 px-5 text-slate-500">Caustic soda &amp; chlorine bleach (Fades colors and breaks threads)</td>
                  <td className="py-4 px-5 bg-sky-50/40 text-sky-950 font-bold border-l border-r border-sky-200">
                    German Bio-Enzymatic Eco Solvents (Gentle on skin and colors)
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">5. Order Tracking &amp; Loss Safety</td>
                  <td className="py-4 px-5 text-slate-500">Pen-paper diary notes, frequent misplaced clothes</td>
                  <td className="py-4 px-5 bg-sky-50/40 text-sky-950 font-bold border-l border-r border-sky-200">
                    Barcode Tagging, WhatsApp Live GPS Tracking &amp; Instant Invoices
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">6. Return Packaging</td>
                  <td className="py-4 px-5 text-slate-500">Wrapped in old newspaper and tied with twine/rope</td>
                  <td className="py-4 px-5 bg-sky-50/40 text-sky-950 font-bold border-l border-r border-sky-200">
                    Sealed breathable dust covers, collar inserts &amp; custom hangers
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          📍 6. TWO RETAIL BRANCHES FLAGSHIP SHOWCASE BANNER
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-sky-500/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Storefront Image with Switcher */}
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
                    Hub 2: Hari Om Ring Road
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
                    Packaging Studio
                  </button>
                </div>

                <div className="text-white space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-300">
                    Flagship Retail Branch
                  </span>
                  <h4 className="font-bold text-base leading-tight">
                    {activeBranchPhoto === 'hub1'
                      ? 'Nehru Nagar (In Front of P.K. School)'
                      : activeBranchPhoto === 'hub2'
                      ? 'Hari Om, Ring Road (Near Old Bus Stand)'
                      : 'High-Speed Finishing & Packaging Hub'}
                  </h4>
                  <p className="text-[11px] text-slate-300">Open 7 Days a week: 8:00 AM – 9:00 PM</p>
                </div>
              </div>
            </div>

            {/* Branch Details & Fast Direct Actions */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-2xs">
                  Physical Stores &amp; Workshop Hubs
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                  Visit Our 2 Dedicated Studios in Rewa
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Drop off your clothing in person or enjoy 100% free doorstep pickup across Rewa. Our retail hubs feature transparent viewing windows so you can watch our European steam and roll press stations in action!
                </p>
              </div>

              {/* 2 Branch Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Branch 1 */}
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/90 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-900">Branch 1: Nehru Nagar</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Open Today
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    In Front of P.K. School, Nehru Nagar, Rewa (M.P.) - 486001
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <a
                      href="tel:9329838804"
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>9329838804</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveBranchPhoto('hub1')}
                      className="px-2.5 py-1.5 bg-white text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold hover:bg-sky-100"
                    >
                      View Photo
                    </button>
                  </div>
                </div>

                {/* Branch 2 */}
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/90 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-900">Branch 2: Ring Road</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Open Today
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    Hari Om, Ring Road, Rewa (M.P.) - 486001
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <a
                      href="tel:9893733683"
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>9893733683</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveBranchPhoto('hub2')}
                      className="px-2.5 py-1.5 bg-white text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-100"
                    >
                      View Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          🎯 7. CORE SERVICE SHOWCASE & INSTANT BASKET ADD
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 shadow-2xs">
            Curated Garment Care
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-900 mt-2 tracking-tight">
            Our Core Service Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            European steam tables, ozone stain eradication, and sanitized packaging for all fabric types.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const itemCount = services.filter((s) => s.categoryId === cat.id && s.active).length;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg shadow-sky-950/5 hover:shadow-2xl hover:border-sky-300 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-52 overflow-hidden bg-slate-900">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-black border border-amber-400/30">
                    {cat.badge || 'Popular'}
                  </span>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-bold font-display text-white">{cat.name}</h3>
                    <p className="text-[11px] text-sky-200 font-medium">{itemCount} specialized garment treatments</p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{cat.description}</p>
                  <button
                    onClick={() => setCurrentView('services')}
                    className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-sky-900 font-bold text-xs border border-slate-200 hover:border-sky-300 flex items-center justify-center space-x-1 transition-all"
                  >
                    <span>Explore Rates &amp; Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          🚚 8. LIVE PINCODE & DOORSTEP SERVICE RADAR (CleanDive Inspired)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-sky-950/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Live Coverage Radar
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                Check Instant Pickup in Your Neighborhood
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We operate active doorstep collection routes across Rewa and surrounding areas with 2-hour pickup windows. Enter your 6-digit pincode below to check today&apos;s slot availability.
              </p>

              <form onSubmit={handleTestPincode} className="flex gap-2 pt-2 max-w-md">
                <input
                  type="text"
                  value={checkerPincode}
                  onChange={(e) => setCheckerPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode (e.g. 486001)"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 text-sm font-semibold shadow-xs"
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
                          Doorstep pickup van nearby. Min order: ₹{checkerResult.area.minOrder}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold">Area currently not in daily regular route.</span>
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
              <div className="flex items-center justify-between">
                <h4 className="font-bold font-display text-sm text-slate-800">Verified Service Areas</h4>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  🟢 Vans Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {serviceAreas.map((sa) => (
                  <div
                    key={sa.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs hover:border-sky-300 transition-colors"
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
          ⭐ 9. CUSTOMER REVIEWS (AUTHENTIC TESTIMONIALS)
      ========================================================================= */}
      {featuredReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
              Verified Feedback
            </span>
            <h2 className="text-3xl font-black font-display text-slate-900 mt-2">
              Loved by Households in Rewa &amp; Bhopal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Over 5,000+ satisfied customers trust us every week</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-400 space-x-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{rev.customerName}</span>
                    <span className="text-slate-400 text-[11px]">{rev.serviceCategory}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Order
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          ❓ 10. INTERACTIVE FAQ ACCORDION (WashODry & Laundrywala Inspired)
      ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black font-display text-slate-900 mt-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Everything you need to know about our fabric care &amp; pickup policy</p>

          {/* Quick FAQ Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'pricing', label: 'Pricing & Delivery' },
              { id: 'delicate', label: 'Delicate & Silk Care' },
              { id: 'pickup', label: 'Pickup Slots' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFaqFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  faqFilter === f.id
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between space-x-3 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-sky-50/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          🎁 11. BOTTOM CONVERTING BANNER WITH APP PROMO (WashODry Style)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-xl">
            <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-xs">
              Instant 60s Booking
            </span>
            <h3 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white leading-tight">
              Ready for Showroom Fresh Garments?
            </h3>
            <p className="text-xs sm:text-sm text-sky-100 font-medium leading-relaxed">
              Experience the difference of European steam tables, RO sanitized cycles, and fragrant hanger return. Use code <span className="underline font-mono font-bold text-amber-300">FIRSTWASH25</span> for 25% Off.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('booking')}
              className="px-8 py-4 bg-white hover:bg-sky-50 text-sky-900 font-black rounded-2xl shadow-xl transition-all text-sm flex items-center space-x-2 active:scale-95"
            >
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Schedule Free Pickup</span>
              <ArrowRight className="w-4 h-4 text-sky-600" />
            </button>
            <a
              href="tel:9329838804"
              className="px-6 py-4 bg-sky-900/60 hover:bg-sky-900/80 text-white font-bold rounded-2xl border border-white/20 transition-all text-sm flex items-center space-x-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call: 9329838804</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
