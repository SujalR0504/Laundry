import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { WashingMachineSimulator } from '../components/WashingMachineSimulator';
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
  X,
  Maximize2,
  ChevronLeft,
  Building2,
  ExternalLink,
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

  // Hero Right Widget Tab (Studio Showcase / 60s Booking / Washer Simulator)
  const [heroRightTab, setHeroRightTab] = useState<'visual' | 'form' | 'simulator'>('visual');

  // Hero Gallery featuring Authentic Store & Plant Images
  const heroGallery = [
    {
      id: 'storefront',
      title: 'The Laundry Lounge Main Storefront',
      subtitle: 'Arun Nagar, Near Gayatri School, Rewa — Walk-in boutique & drop-off counter',
      badge: 'Main Storefront',
      image: '/images/storefront-exterior.jpg',
      tag: 'Arun Nagar Hub',
      stat: 'Rewa Main Center',
    },
    {
      id: 'reception',
      title: 'Customer Welcome Lounge & Counter',
      subtitle: 'Comfortable waiting lounge with computerized garment tagging & barcode tracking',
      badge: 'Executive Lounge',
      image: '/images/reception-counter.jpg',
      tag: 'The Laundry Lounge',
      stat: '5-Star Care',
    },
    {
      id: 'washer',
      title: 'Industrial Heavy Rotary Wash Plant',
      subtitle: 'High-capacity stainless steel rotary washers for deep hygienic washing',
      badge: 'Commercial Plant',
      image: '/images/industrial-washer.jpg',
      tag: 'Commercial Plant',
      stat: 'Heavy-Duty Wash',
    },
    {
      id: 'extractor',
      title: 'Centrifugal Hydro-Extractor Unit',
      subtitle: 'Precision high-speed water extraction preventing fiber stress & distortion',
      badge: 'Hydro Extraction',
      image: '/images/hydro-extractor.jpg',
      tag: 'Gentle Spin',
      stat: '100% Fiber Safe',
    },
    {
      id: 'processing',
      title: 'Sanitized Laundromat & Folding Line',
      subtitle: 'Multi-point inspection and crisp fold packaging before doorstep delivery',
      badge: 'Specialist Care',
      image: '/images/laundry-processing.png',
      tag: 'Laundromat Operations',
      stat: '100% Quality Checked',
    },
    {
      id: 'steam',
      title: 'European Steam Ironing & Pressing',
      subtitle: 'Precision collar shaping & 100% zero burn guarantee on delicate garments',
      badge: 'Veit European Press',
      image: '/images/steam-press.jpg',
      tag: 'Industrial Steam',
      stat: '100% Zero Burn',
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
      badge: 'Contactless Fleet',
      image: '/images/doorstep-delivery.jpg',
      tag: 'Free Doorstep Service',
      stat: '60s Booking',
    },
  ];

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [activeBranchPhoto, setActiveBranchPhoto] = useState<
    'storefront' | 'lounge' | 'washer' | 'extractor' | 'processing'
  >('storefront');

  // Lightbox Modal for Facility & Machinery Photos
  interface FacilityItem {
    id: string;
    name: string;
    title: string;
    badge: string;
    image: string;
    location: string;
    category: string;
    tagline: string;
    description: string;
    specs: string[];
  }

  const [facilityModalImage, setFacilityModalImage] = useState<FacilityItem | null>(null);

  // Real Facility & Machinery Showcase Dataset
  const facilityShowcase: FacilityItem[] = [
    {
      id: 'storefront',
      name: 'Main Flagship Storefront',
      title: 'The Laundry Lounge Storefront (Arun Nagar, Rewa)',
      badge: 'Official Storefront',
      image: '/images/storefront-exterior.jpg',
      location: 'Arun Nagar, Near Gayatri School, Rewa',
      category: 'Walk-In Store & Drop-Off Hub',
      tagline: 'Arun Nagar, Near Gayatri School, Rewa (M.P.)',
      description:
        'Our customer walk-in storefront featuring transparent glass doors, clear pricing menu, and expert fabric consultants. Drop off garments in person or arrange free doorstep pickup.',
      specs: [
        'Location: Arun Nagar, Near Gayatri School, Rewa (M.P.)',
        'Timings: Open 7 Days a week (8:00 AM – 9:00 PM)',
        'Services: Washing, Leather Cleaning, Dry Cleaning, Roll Press',
        'Contact: 9893733683 / 9329838804',
      ],
    },
    {
      id: 'lounge',
      name: 'Customer Welcome Lounge & Counter',
      title: 'Customer Welcome Lounge & Computerized Counter',
      badge: 'Executive Lounge',
      image: '/images/reception-counter.jpg',
      location: 'Inside The Laundry Lounge Studio',
      category: 'Customer Reception & Intake',
      tagline: 'Illuminated Brand Hallmark & Computerized Counter',
      description:
        'Air-conditioned welcome lounge equipped with our illuminated circular Laundry Lounge sign, computerized order tracking, barcode printing, and comfortable customer seating.',
      specs: [
        'Computerized garment barcode tagging & instant SMS receipts',
        'Comfortable air-conditioned customer seating area',
        'Live electronic weight scales & transparent billing',
        'Multi-point initial garment pocket & fabric check',
      ],
    },
    {
      id: 'washer',
      name: 'Industrial Heavy Rotary Washer',
      title: 'Heavy-Duty Commercial Horizontal Rotary Wash Plant',
      badge: 'Commercial Plant',
      image: '/images/industrial-washer.jpg',
      location: 'Central Processing Facility, Rewa',
      category: 'Heavy-Duty Commercial Wash',
      tagline: 'Dual-Chamber 304 Stainless Steel Drum',
      description:
        'Heavy-duty commercial horizontal rotary washing machine. Engineered for large volume hotel linens, delicate fabrics, and sanitized washing with zero fabric tearing or discoloration.',
      specs: [
        'Food-grade 304 stainless steel interior drum',
        'Reversible rotation reduces mechanical fabric stress',
        '100% RO softened mineral-free water infusion',
        'Hypoallergenic enzyme detergents safe on vibrant colors',
      ],
    },
    {
      id: 'extractor',
      name: 'Centrifugal High-Speed Hydro-Extractor',
      title: 'High-Velocity Centrifugal Spin Hydro-Extractor',
      badge: 'Hydro Extraction',
      image: '/images/hydro-extractor.jpg',
      location: 'Central Processing Facility, Rewa',
      category: 'Centrifugal Spin Drying',
      tagline: 'Centrifugal Moisture Expulsion (Zero Shrinkage)',
      description:
        'High-velocity centrifugal hydro-extractor that removes 85%+ moisture in minutes without the high-temperature dryer friction that causes shrinking and fabric pilling.',
      specs: [
        'Precision centrifugal balanced spin drum',
        'Zero thermal shrinkage or fiber distortion',
        'Safe for woolen garments, wedding silks, and delicate suits',
        'Dramatically shortens natural drying cycles',
      ],
    },
    {
      id: 'processing',
      name: 'Laundromat Line & Precision Folding',
      title: 'Commercial Laundromat Workstation & Sanitized Folding Line',
      badge: 'Quality Finishing',
      image: '/images/laundry-processing.png',
      location: 'Finishing & Inspection Floor',
      category: 'Sanitized Garment Line & Packaging',
      tagline: 'Meticulous Folding & Protective Dust Covers',
      description:
        'Our commercial laundromat workstation where every shirt, saree, and trouser is inspected for spots, crisply hand-folded, and packaged in sealed dust-proof bags for doorstep return.',
      specs: [
        'Sanitized inspection & folding tables',
        '100% individual customer load segregation (never mixed)',
        'Button reinforcement & hemline inspection',
        'Anti-static protective dust-proof garment bags',
      ],
    },
  ];

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
          🌟 1. HERO SECTION (DECENT, ELEGANT, UNCLUTTERED)
      ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/60 pt-6 sm:pt-10 pb-16 sm:pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Clean Single Trust Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-medium border border-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Premium Dry Cleaning &amp; Laundry • Rewa (M.P.)</span>
              </div>

              {/* Clean Commanding Heading */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                  Doorstep Laundry &amp; Dry Cleaning in Rewa
                </h1>
                <p className="text-base sm:text-lg text-slate-600 mt-3 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Professional garment care, gentle ozone wash, European steam pressing &amp; roll press delivered to your doorstep. Visit our Nehru Nagar &amp; Ring Road branches or schedule a free pickup in 60 seconds.
                </p>
              </div>

              {/* Clean Actions / CTAs */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <button
                  onClick={() => setCurrentView('booking')}
                  className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-colors text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Doorstep Pickup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentView('services')}
                  className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 shadow-xs transition-colors text-sm"
                >
                  Services &amp; Pricing
                </button>

                <a
                  href="tel:9893733683"
                  className="w-full sm:w-auto px-4 py-3 text-slate-700 hover:text-slate-900 font-medium text-sm flex items-center justify-center space-x-1.5"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>9893733683</span>
                </a>
              </div>

              {/* Clean Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 font-medium border-t border-slate-200">
                <span className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-slate-800">4.9/5 Rating</span>
                  <span>(5,000+ Rewa Homes)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold text-slate-800">24-48h Delivery</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Free Pickup &gt; ₹399</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="font-semibold text-slate-800">2 Branches</span>
                </span>
              </div>
            </div>

            {/* Right: Studio Showcase & Quick Booking */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-slate-200">
                {/* 2 Clean Switcher Tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setHeroRightTab('visual')}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
                      heroRightTab === 'visual'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-sky-600" />
                    <span>Store &amp; Facilities</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroRightTab('form')}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
                      heroRightTab === 'form'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    <span>Quick Booking</span>
                  </button>
                </div>

                {heroRightTab === 'visual' ? (
                  /* Visual Studio Showcase with Clean Prev/Next Controls */
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-200">
                      <img
                        src={heroGallery[activeHeroIndex].image}
                        alt={heroGallery[activeHeroIndex].title}
                        className={`w-full h-full ${heroGallery[activeHeroIndex].id === 'storefront' ? 'object-cover object-top' : 'object-cover'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium border border-white/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{heroGallery[activeHeroIndex].badge}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-[10px] font-semibold">
                          {heroGallery[activeHeroIndex].tag}
                        </span>
                      </div>

                      {/* Prev / Next Arrow Overlay */}
                      <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none">
                        <button
                          type="button"
                          onClick={() => setActiveHeroIndex((prev) => (prev > 0 ? prev - 1 : heroGallery.length - 1))}
                          className="pointer-events-auto p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
                          title="Previous photo"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveHeroIndex((prev) => (prev < heroGallery.length - 1 ? prev + 1 : 0))}
                          className="pointer-events-auto p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
                          title="Next photo"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom Caption Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px]">
                            {heroGallery[activeHeroIndex].stat}
                          </span>
                          <span className="text-[11px] text-white/80">Rewa, Madhya Pradesh</span>
                        </div>
                        <h4 className="font-semibold text-base text-white">
                          {heroGallery[activeHeroIndex].title}
                        </h4>
                        <p className="text-[11px] text-slate-200 line-clamp-1">
                          {heroGallery[activeHeroIndex].subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Clean Pagination Indicator */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Photo {activeHeroIndex + 1} of {heroGallery.length}</span>
                      <div className="flex items-center space-x-1">
                        {heroGallery.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveHeroIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                              activeHeroIndex === idx ? 'w-5 bg-sky-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                            title={`Slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentView('booking')}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Free Doorstep Pickup</span>
                    </button>
                  </div>
                ) : (
                  /* Form View */
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-semibold text-base text-slate-900">Instant Pickup Booking</h3>
                        <p className="text-xs text-slate-500">Doorstep collection across Rewa (M.P.)</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Slots Today</span>
                      </span>
                    </div>

                    <form onSubmit={handleQuickBookContinue} className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-medium text-slate-700">
                            1. Pickup Area
                          </label>
                          <span className="text-[10px] text-sky-700 font-medium bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                            Rewa City
                          </span>
                        </div>

                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            value={quickPincode}
                            onChange={(e) => setQuickPincode(e.target.value)}
                            placeholder="Enter 486001 or select area below..."
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                          />
                        </div>

                        <div className="flex flex-wrap gap-1 mt-1.5">
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
                              className={`text-[10px] font-medium px-2 py-0.5 rounded border transition-colors ${
                                quickPincode === chip.pin
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                              }`}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          2. Primary Service
                        </label>
                        <select
                          value={quickServiceId}
                          onChange={(e) => setQuickServiceId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          3. Preferred Slot
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <select
                            value={quickSlot}
                            onChange={(e) => setQuickSlot(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
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
                        className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors mt-2"
                      >
                        <span>Continue to Add Garments</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
          ✨ 2. CLEAN & DECENT LIVE BASKET CALCULATOR
      ========================================================================= */}
      {/* =========================================================================
          ✨ 2. CLEAN & DECENT LIVE BASKET CALCULATOR
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                <Sliders className="w-3.5 h-3.5 text-sky-600" />
                <span>Live Cost Estimator</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
                Estimate Your Laundry Load
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl font-normal">
                Select your everyday garments below for transparent pricing. Orders of ₹399 or more unlock 100% free doorstep pickup &amp; delivery across Rewa.
              </p>
            </div>

            {/* Voucher Pill */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleApplyVoucher}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                  couponApplied
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                <span>{couponApplied ? 'FIRSTWASH25 Applied (25% Off)' : 'Apply FIRSTWASH25 (25% Off)'}</span>
                <span className="text-[10px] font-bold text-sky-600 ml-1">
                  {couponApplied ? 'Remove' : 'Apply'}
                </span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Split: Cards (Left) + Total Card (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-6">
            {/* Garment Grid (8 cols) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {estimatorItems.map((item) => {
                const count = estimatorCounts[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-colors text-center flex flex-col justify-between ${
                      count > 0
                        ? 'bg-sky-50/60 border-sky-300 ring-1 ring-sky-200'
                        : 'bg-slate-50/50 hover:bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-xl mx-auto mb-2 shadow-2xs">
                        {item.icon}
                      </div>
                      <div className="font-semibold text-xs text-slate-900 leading-tight">
                        {item.name}
                      </div>
                      <div className="text-xs font-semibold text-sky-700 mt-1">
                        ₹{item.price}
                        <span className="text-[10px] text-slate-400 font-normal"> / pc</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2.5 mt-3 pt-2.5 border-t border-slate-200/60">
                      <button
                        onClick={() => updateEstimatorCount(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 transition-colors shadow-2xs"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 w-5 text-center">{count}</span>
                      <button
                        onClick={() => updateEstimatorCount(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center font-bold text-xs transition-colors shadow-2xs"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary Card (4 cols) */}
            <div className="lg:col-span-4 bg-slate-50/90 p-5 sm:p-6 rounded-xl border border-slate-200 space-y-4">
              <div className="text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Estimated Total
                </span>
                <div className="flex items-baseline justify-center space-x-2 mt-1">
                  {couponApplied && (
                    <span className="text-sm font-semibold text-slate-400 line-through">
                      ₹{rawEstimatedTotal}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-slate-900">
                    ₹{estimatedTotal}
                  </span>
                </div>
                {couponApplied && (
                  <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                    You save ₹{discountAmount} (25% Off)
                  </span>
                )}
              </div>

              {/* Free delivery progress meter */}
              <div className="space-y-1.5 text-left bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between text-[11px] font-medium text-slate-600">
                  <span>Free Pickup Goal (₹399)</span>
                  <span className={rawEstimatedTotal >= freeDeliveryThreshold ? 'text-emerald-600 font-semibold' : 'text-slate-700 font-medium'}>
                    {rawEstimatedTotal >= freeDeliveryThreshold ? 'Unlocked! 🚚' : `₹${freeDeliveryThreshold - rawEstimatedTotal} to go`}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressToFreeDelivery}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleAddEstimatedToCart}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Add Basket &amp; Book Pickup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* More Services Option Banner (Redirects to Services Page) */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 rounded-xl p-4 border border-dashed border-slate-300">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 hidden sm:flex">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Looking for more garments, dry cleaning, roll press, or curtains?
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal">
                  Explore our complete catalog of 50+ services with transparent rate cards across Rewa.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentView('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 hover:border-sky-400 font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 shrink-0"
            >
              <span>View More Services &amp; Full Price List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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
          📍 6. TWO RETAIL BRANCHES & REAL COMMERCIAL WORKSHOP SHOWCASE
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-sky-500/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Storefront & Machine Image with Switcher */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative group overflow-hidden rounded-3xl border border-slate-200/90 shadow-lg bg-slate-950 aspect-[4/3] sm:aspect-[16/11]">
                <img
                  src={
                    activeBranchPhoto === 'storefront'
                      ? '/images/storefront-exterior.jpg'
                      : activeBranchPhoto === 'lounge'
                      ? '/images/reception-counter.jpg'
                      : activeBranchPhoto === 'washer'
                      ? '/images/industrial-washer.jpg'
                      : activeBranchPhoto === 'extractor'
                      ? '/images/hydro-extractor.jpg'
                      : '/images/laundry-processing.png'
                  }
                  alt="The Laundry Lounge Storefront, Reception Lounge and Commercial Plant"
                  className={`w-full h-full ${activeBranchPhoto === 'storefront' ? 'object-cover object-top' : 'object-cover object-center'} group-hover:scale-105 transition-transform duration-700 cursor-pointer`}
                  onClick={() => {
                    const currentItem = facilityShowcase.find((f) => f.id === activeBranchPhoto) || facilityShowcase[0];
                    setFacilityModalImage(currentItem);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex flex-col justify-between p-4 sm:p-5 pointer-events-none">
                  {/* Top Badges & Lightbox Zoom Button */}
                  <div className="flex items-center justify-between w-full pointer-events-auto">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>
                        {activeBranchPhoto === 'storefront'
                          ? 'Main Arun Nagar Storefront'
                          : activeBranchPhoto === 'lounge'
                          ? 'Welcome Lounge & Desk'
                          : activeBranchPhoto === 'washer'
                          ? 'Commercial Rotary Washer'
                          : activeBranchPhoto === 'extractor'
                          ? 'Centrifugal Hydro-Extractor'
                          : 'Sanitized Laundromat Line'}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const currentItem = facilityShowcase.find((f) => f.id === activeBranchPhoto) || facilityShowcase[0];
                        setFacilityModalImage(currentItem);
                      }}
                      className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-slate-900 text-[10px] font-black flex items-center space-x-1 shadow-md transition-all active:scale-95"
                    >
                      <Maximize2 className="w-3 h-3 text-sky-600" />
                      <span>Inspect Photo</span>
                    </button>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="text-white space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                        {activeBranchPhoto === 'storefront'
                          ? 'Arun Nagar Hub'
                          : activeBranchPhoto === 'lounge'
                          ? 'Digital Billing Desk'
                          : activeBranchPhoto === 'washer'
                          ? 'Grade 304 Stainless Steel'
                          : activeBranchPhoto === 'extractor'
                          ? '100% Zero-Shrink Spin'
                          : 'Sanitized Packaging Hub'}
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium">Rewa, Madhya Pradesh</span>
                    </div>
                    <h4 className="font-bold text-base sm:text-lg leading-tight text-white">
                      {activeBranchPhoto === 'storefront'
                        ? 'Arun Nagar, Near Gayatri School, Rewa'
                        : activeBranchPhoto === 'lounge'
                        ? 'Executive Reception Lounge & Tagging Counter'
                        : activeBranchPhoto === 'washer'
                        ? 'Heavy-Duty Industrial Rotary Wash Plant'
                        : activeBranchPhoto === 'extractor'
                        ? 'High-Speed Centrifugal Hydro-Extractor Unit'
                        : 'Laundromat Inspection & Protective Folding'}
                    </h4>
                    <p className="text-[11px] text-slate-300 line-clamp-1">
                      {activeBranchPhoto === 'storefront'
                        ? 'Open 7 Days a week: 8:00 AM – 9:00 PM • Drop-off & Free Doorstep Pickup'
                        : activeBranchPhoto === 'lounge'
                        ? 'Air-conditioned lounge, illuminated brand hallmark & computerized garment receipts'
                        : activeBranchPhoto === 'washer'
                        ? 'Dual-chamber commercial barrel washer with 100% RO softened water'
                        : activeBranchPhoto === 'extractor'
                        ? 'Removes 85%+ moisture in minutes with zero fiber stress or thermal damage'
                        : 'Individually segregated customer loads with sealed dust-proof return covers'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 5-Photo Interactive Thumbnail Row */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Click to view our actual store &amp; machines:</span>
                  <span className="text-sky-600 font-extrabold text-[10px]">Real Rewa Facility Photos</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[
                    { id: 'storefront', label: 'Storefront', img: '/images/storefront-exterior.jpg' },
                    { id: 'lounge', label: 'Lounge', img: '/images/reception-counter.jpg' },
                    { id: 'washer', label: 'Washer', img: '/images/industrial-washer.jpg' },
                    { id: 'extractor', label: 'Extractor', img: '/images/hydro-extractor.jpg' },
                    { id: 'processing', label: 'Folding', img: '/images/laundry-processing.png' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveBranchPhoto(tab.id as any)}
                      className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all flex flex-col justify-end p-1 ${
                        activeBranchPhoto === tab.id
                          ? 'border-sky-600 ring-2 ring-sky-300 shadow-md scale-105'
                          : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                      }`}
                      title={tab.label}
                    >
                      <img src={tab.img} alt={tab.label} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/40" />
                      <span className="relative z-10 text-[9px] sm:text-[10px] font-black text-white truncate text-center w-full">
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Branch Details & Physical Location Cards */}
            <div className="lg:col-span-6 space-y-5">
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
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/90 space-y-3 shadow-2xs">
                  <div className="flex gap-3">
                    <img
                      src="/images/storefront-exterior.jpg"
                      alt="The Laundry Lounge Arun Nagar Storefront"
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover object-top shrink-0 border border-sky-300 shadow-xs cursor-pointer hover:opacity-90"
                      onClick={() => setActiveBranchPhoto('storefront')}
                      title="Click to view full photo"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-sky-900">The Laundry Lounge (Branch 1 - Arun Nagar)</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Open Today
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        Near Gayatri School, In Front of Apna Super Bazar, Arun Nagar, Rewa (M.P.) - 486001
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-1 border-t border-sky-200/60">
                    <a
                      href="tel:9893733683"
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>9893733683</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveBranchPhoto('storefront')}
                      className="px-2.5 py-1.5 bg-white text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold hover:bg-sky-100"
                    >
                      View Real Store Photo
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
                    Behind Hotel The Vijay Villas, Gadariya Ring Road, Rewa (M.P.) - 486001
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <a
                      href="tel:9329838804"
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>9329838804</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveBranchPhoto('lounge')}
                      className="px-2.5 py-1.5 bg-white text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-100"
                    >
                      View Lounge
                    </button>
                  </div>
                </div>
              </div>

              {/* Plant Highlights Badges */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-[11px]">304 Stainless Steel Washers</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="font-semibold text-[11px]">Centrifugal Hydro-Extractors</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-semibold text-[11px]">European Steam Tables</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-[11px]">Free Doorstep Pickup Above ₹399</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          🏭 6B. INSIDE THE LAUNDRY LOUNGE: REAL PLANT & COMMERCIAL MACHINES GALLERY
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 shadow-2xs">
            100% Authentic Facility Transparency
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">
            Inside The Laundry Lounge: Real Machines &amp; Processing Plant
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            No stock imagery tricks. Take an authentic visual tour of our actual commercial laundry plant, heavy rotary washers, hydro-extractors, and customer lounge in Rewa.
          </p>
        </div>

        {/* 5-Card Grid Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilityShowcase.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg shadow-sky-950/5 hover:shadow-2xl hover:border-sky-300 transition-all duration-300 flex flex-col group ${
                idx === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div
                className="relative h-60 overflow-hidden bg-slate-950 cursor-pointer"
                onClick={() => setFacilityModalImage(item)}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-amber-300 text-[10px] font-black border border-amber-400/30">
                    {item.badge}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/95 text-sky-950 text-[10px] font-black shadow-md flex items-center space-x-1">
                    <Maximize2 className="w-2.5 h-2.5 text-sky-600" />
                    <span>Zoom</span>
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-mono font-bold text-sky-300 block">{item.category}</span>
                  <h3 className="text-lg font-bold font-display text-white leading-tight">{item.name}</h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.description}</p>
                  
                  {/* Technical Specs Pills */}
                  <ul className="space-y-1.5 pt-1">
                    {item.specs.slice(0, 2).map((spec, sIdx) => (
                      <li key={sIdx} className="flex items-start space-x-2 text-[11px] text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setFacilityModalImage(item)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                  >
                    <span>View Full Specs</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentView('booking')}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs transition-colors"
                  >
                    Book Wash
                  </button>
                </div>
              </div>
            </div>
          ))}
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
              href="tel:9893733683"
              className="px-6 py-4 bg-sky-900/60 hover:bg-sky-900/80 text-white font-bold rounded-2xl border border-white/20 transition-all text-sm flex items-center space-x-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call: 9893733683</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          🔍 REAL FACILITY & MACHINERY LIGHTBOX SPEC MODAL
      ========================================================================= */}
      {facilityModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
            onClick={() => setFacilityModalImage(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl z-10 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 font-black text-xs">
                  {facilityModalImage.badge}
                </span>
                <span className="text-xs text-slate-500 font-semibold">• Authentic Facility Photo</span>
              </div>
              <button
                type="button"
                onClick={() => setFacilityModalImage(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors border border-slate-200 shadow-2xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 items-center max-h-[80vh] overflow-y-auto">
              {/* Large Image Frame */}
              <div className="md:col-span-6 relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-200 shadow-md group">
                <img
                  src={facilityModalImage.image}
                  alt={facilityModalImage.title}
                  className={`w-full h-full ${facilityModalImage.id === 'storefront' ? 'object-cover object-top' : 'object-cover'} group-hover:scale-105 transition-transform duration-500`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 text-[11px] font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded border border-white/20">
                  Rewa, Madhya Pradesh
                </span>
              </div>

              {/* Details & Specs */}
              <div className="md:col-span-6 space-y-4">
                <div>
                  <span className="text-[11px] font-mono font-bold text-sky-600 uppercase tracking-wider block">
                    {facilityModalImage.tagline}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 leading-tight mt-0.5">
                    {facilityModalImage.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {facilityModalImage.description}
                </p>

                {/* Specs List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h5 className="text-[11px] font-black uppercase text-slate-800 tracking-wider">
                    Equipment &amp; Process Features:
                  </h5>
                  <ul className="space-y-1.5">
                    {facilityModalImage.specs.map((spec, sIdx) => (
                      <li key={sIdx} className="flex items-start space-x-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFacilityModalImage(null);
                      setCurrentView('booking');
                    }}
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-sky-600/20 transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span>Book Laundry Pickup</span>
                  </button>
                  <a
                    href="tel:9893733683"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Store</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
