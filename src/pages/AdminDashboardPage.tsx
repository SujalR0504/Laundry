import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Shirt,
  Layers,
  Clock,
  Bike,
  Tag,
  MapPin,
  Star,
  HelpCircle,
  Settings,
  FileSpreadsheet,
  History,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  AlertCircle,
  Eye,
  CheckCircle2,
  Store,
  Receipt,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Printer,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { OrderStatus, ServiceItem, PriceType, ServiceUnit, CartItem, PaymentMethod } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const {
    orders,
    createOrder,
    setCurrentView,
    switchUserRole,
    currentUser,
    updateOrderStatus,
    assignDeliveryStaff,
    deliveryStaff,
    services,
    addService,
    updateService,
    deleteService,
    toggleServiceActive,
    categories,
    coupons,
    addCoupon,
    deleteCoupon,
    serviceAreas,
    addServiceArea,
    deleteServiceArea,
    pickupSlots,
    reviews,
    toggleReviewApproved,
    toggleReviewFeatured,
    faqs,
    addFAQ,
    deleteFAQ,
    businessSettings,
    updateBusinessSettings,
    cms,
    updateCMS,
    auditLogs,
    openInvoice,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'orders'
    | 'services'
    | 'customers'
    | 'staff'
    | 'coupons'
    | 'areas'
    | 'slots'
    | 'reviews'
    | 'faqs'
    | 'cms'
    | 'settings'
    | 'reports'
    | 'audit'
  >('overview');

  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Service form modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<{
    name: string;
    categoryId: string;
    description: string;
    priceType: PriceType;
    price: number;
    minPrice: number;
    maxPrice: number;
    unit: ServiceUnit;
    turnaroundHours: number;
    image: string;
    active: boolean;
    featured: boolean;
    customQuoteRequired: boolean;
  }>({
    name: '',
    categoryId: categories[0]?.id || 'cat-dry-clean',
    description: '',
    priceType: 'fixed',
    price: 50,
    minPrice: 50,
    maxPrice: 100,
    unit: 'Piece',
    turnaroundHours: 48,
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=400&q=80',
    active: true,
    featured: false,
    customQuoteRequired: false,
  });

  // Coupon form modal state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderValue: 200,
    maxDiscount: 100,
    expiryDate: '2027-12-31',
    usageLimit: 500,
    active: true,
    description: '',
  });

  // Area form modal state
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [areaForm, setAreaForm] = useState({
    pincode: '',
    areaName: '',
    city: 'New Delhi',
    isServiceable: true,
    minOrder: 199,
    pickupFee: 0,
    deliveryFee: 0,
  });

  // FAQ form modal state
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'General',
  });

  // Staff form modal state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    phone: '+91 ',
    email: '',
    status: 'active' as const,
    vehicleType: 'Electric Scooter',
  });

  // Settings form states
  const [settingsForm, setSettingsForm] = useState({ ...businessSettings });
  const [cmsForm, setCmsForm] = useState({ ...cms });

  // Walk-in Counter / POS Order Modal State
  const [showPosModal, setShowPosModal] = useState(false);
  const [posBranch, setPosBranch] = useState('Nehru Nagar (Branch 1)');
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>('UPI');
  const [posDeliveryMode, setPosDeliveryMode] = useState<'standard' | 'express'>('standard');
  const [posItems, setPosItems] = useState<{ [serviceId: string]: number }>({});
  const [posNotes, setPosNotes] = useState('');

  const handleUpdatePosItem = (svcId: string, delta: number) => {
    setPosItems((prev) => {
      const current = prev[svcId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[svcId];
        return copy;
      }
      return { ...prev, [svcId]: next };
    });
  };

  const posTotal = Object.entries(posItems).reduce((sum, [svcId, qty]) => {
    const s = services.find((x) => x.id === svcId);
    return sum + (s ? s.price * qty : 0);
  }, 0);

  const handleCreatePosOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posCustomerName.trim() || !posCustomerPhone.trim()) {
      showToast('Please enter customer name and phone number', 'error');
      return;
    }
    const cartItems: CartItem[] = Object.entries(posItems).map(([svcId, qty]) => {
      const s = services.find((x) => x.id === svcId)!;
      return {
        serviceId: s.id,
        service: s,
        quantity: qty,
        selectedPrice: s.price,
        specialInstructions: posNotes || undefined,
      };
    });

    if (cartItems.length === 0) {
      showToast('Please select at least 1 garment item for the counter order', 'error');
      return;
    }

    const order = createOrder({
      items: cartItems,
      address: {
        id: 'pos-' + Date.now(),
        name: posCustomerName.trim(),
        mobile: posCustomerPhone.trim(),
        houseFlat: `Walk-in Store POS: ${posBranch}`,
        street: 'Retail Counter Drop-off',
        area: posBranch,
        city: 'Rewa',
        state: 'Madhya Pradesh',
        pincode: '486001',
        isDefault: false,
      },
      pickupDate: new Date().toISOString().split('T')[0],
      pickupSlot: `Walk-in Store: ${posBranch}`,
      deliveryMode: posDeliveryMode,
      paymentMethod: posPaymentMethod,
    });

    showToast(`Counter Order ${order.orderNumber} created successfully!`, 'success');
    setShowPosModal(false);
    setPosCustomerName('');
    setPosCustomerPhone('');
    setPosItems({});
    setPosNotes('');
    openInvoice(order);
  };

  // Metrics calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'Delivered').length;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    return matchStatus && matchSearch;
  });

  // Handle service save
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name) return;

    if (editingServiceId) {
      updateService(editingServiceId, serviceForm);
    } else {
      addService(serviceForm);
    }
    setShowServiceModal(false);
    setEditingServiceId(null);
  };

  const handleEditServiceClick = (svc: ServiceItem) => {
    setEditingServiceId(svc.id);
    setServiceForm({
      name: svc.name,
      categoryId: svc.categoryId,
      description: svc.description,
      priceType: svc.priceType,
      price: svc.price,
      minPrice: svc.minPrice || svc.price,
      maxPrice: svc.maxPrice || svc.price,
      unit: svc.unit,
      turnaroundHours: svc.turnaroundHours,
      image: svc.image,
      active: svc.active,
      featured: !!svc.featured,
      customQuoteRequired: !!svc.customQuoteRequired,
    });
    setShowServiceModal(true);
  };

  // Handle coupon save
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;
    addCoupon(couponForm);
    setShowCouponModal(false);
    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 200,
      maxDiscount: 100,
      expiryDate: '2027-12-31',
      usageLimit: 500,
      active: true,
      description: '',
    });
  };

  // Handle area save
  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaForm.pincode) return;
    addServiceArea(areaForm);
    setShowAreaModal(false);
    setAreaForm({
      pincode: '',
      areaName: '',
      city: 'New Delhi',
      isServiceable: true,
      minOrder: 199,
      pickupFee: 0,
      deliveryFee: 0,
    });
  };

  // Handle FAQ save
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question) return;
    addFAQ(faqForm);
    setShowFaqModal(false);
    setFaqForm({ question: '', answer: '', category: 'General' });
  };

  // Export CSV
  const handleExportOrdersCSV = () => {
    const headers = 'Order Number,Customer,Phone,Amount,Payment,Status,Pickup Date,Created At\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.orderNumber}","${o.customerName}","${o.customerPhone}",${o.total},"${o.paymentStatus}","${o.orderStatus}","${o.pickupDate}","${o.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thelaundrylounge_orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Orders exported as CSV successfully!', 'success');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders Hub', icon: ShoppingBag, badge: activeOrdersCount },
    { id: 'services', label: 'Services & Pricing', icon: Shirt, badge: services.length },
    { id: 'customers', label: 'Customer CRM', icon: Users },
    { id: 'staff', label: 'Delivery Staff', icon: Bike },
    { id: 'coupons', label: 'Coupons & Offers', icon: Tag },
    { id: 'areas', label: 'Service Areas', icon: MapPin },
    { id: 'slots', label: 'Pickup Slots', icon: Clock },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'faqs', label: 'FAQs CMS', icon: HelpCircle },
    { id: 'cms', label: 'Website CMS', icon: Layers },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'audit', label: 'Audit Logs', icon: History },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-sky-300 bg-sky-950/80 border border-sky-500/30 px-2.5 py-0.5 rounded-full font-bold">
              🛡️ Operations Admin Suite
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Rewa Hubs Live (Nehru Nagar &amp; Ring Road)</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white mt-1">
            The Laundry Lounge Operations Control
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Real-time management for catalog services, order pipeline, walk-in counter POS, delivery fleet, pricing, and live website CMS.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Back to Customer Storefront */}
          <button
            onClick={() => setCurrentView('home')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border border-white/15 shadow-sm active:scale-95"
            title="View customer-facing storefront"
          >
            <Eye className="w-4 h-4 text-sky-400" />
            <span>Storefront View</span>
          </button>

          {/* New Walk-in Counter POS Order */}
          <button
            onClick={() => setShowPosModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
          >
            <Receipt className="w-4 h-4 text-emerald-200" />
            <span>+ Walk-in POS Order</span>
          </button>

          {/* Add Service */}
          <button
            onClick={() => {
              setEditingServiceId(null);
              setServiceForm({
                name: '',
                categoryId: categories[0]?.id || 'cat-dry-clean',
                description: '',
                priceType: 'fixed',
                price: 50,
                minPrice: 50,
                maxPrice: 100,
                unit: 'Piece',
                turnaroundHours: 48,
                image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=400&q=80',
                active: true,
                featured: false,
                customQuoteRequired: false,
              });
              setShowServiceModal(true);
            }}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Service</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportOrdersCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border border-slate-700"
            title="Download Excel / CSV of all orders"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-slate-200 shadow-soft-sm flex lg:flex-col overflow-x-auto no-scrollbar gap-1.5 lg:gap-0 lg:space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-auto lg:w-full p-2 sm:p-2.5 rounded-xl text-left font-bold text-xs flex items-center justify-between space-x-2 lg:space-x-0 transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1.5 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW & KPIS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Gross Revenue</div>
                  <div className="text-2xl font-black text-brand-900 mt-1">
                    ₹{totalRevenue.toFixed(0)}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18.4% vs last week</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Total Orders</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{totalOrdersCount}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1">All time</div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">In Processing</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">{activeOrdersCount}</div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-1">Active on floor</div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Delivered Orders</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{deliveredOrdersCount}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">Verified via OTP</div>
                </div>
              </div>

              {/* VISUAL SVG REVENUE & BOOKING TRAJECTORY CHART */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Weekly Revenue & Processing Velocity
                    </h3>
                    <p className="text-xs text-slate-500">Live order intake per weekday</p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-semibold">
                    <span className="flex items-center space-x-1 text-brand-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                      <span>Revenue (₹)</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Deliveries Completed</span>
                    </span>
                  </div>
                </div>

                {/* SVG Line / Bar chart visual representation */}
                <div className="h-48 w-full relative pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160">
                    <defs>
                      <linearGradient id="gradBrand" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    <line x1="0" y1="30" x2="700" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="70" x2="700" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="110" x2="700" y2="110" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Smooth Area fill */}
                    <path
                      d="M 50,120 Q 150,50 250,80 T 450,40 T 650,25 L 650,150 L 50,150 Z"
                      fill="url(#gradBrand)"
                    />

                    {/* Curve Line */}
                    <path
                      d="M 50,120 Q 150,50 250,80 T 450,40 T 650,25"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {[
                      { x: 50, y: 120, label: 'Mon', val: '₹1.2k' },
                      { x: 150, y: 65, label: 'Tue', val: '₹2.4k' },
                      { x: 250, y: 80, label: 'Wed', val: '₹2.1k' },
                      { x: 350, y: 55, label: 'Thu', val: '₹3.2k' },
                      { x: 450, y: 40, label: 'Fri', val: '₹4.8k' },
                      { x: 550, y: 35, label: 'Sat', val: '₹5.4k' },
                      { x: 650, y: 25, label: 'Sun', val: '₹6.8k' },
                    ].map((pt, i) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          fill="#ffffff"
                          stroke="#2563eb"
                          strokeWidth="3"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#1e293b"
                        >
                          {pt.val}
                        </text>
                        <text
                          x={pt.x}
                          y="155"
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="600"
                          fill="#94a3b8"
                        >
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Recent Orders in processing */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-slate-900">Live Orders Pipeline</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-slate-900">{o.orderNumber}</div>
                        <div className="text-slate-500">
                          {o.customerName} • {o.items.length} garments • ₹{o.total.toFixed(0)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                          {o.orderStatus}
                        </span>
                        <button
                          onClick={() => openInvoice(o)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                        >
                          Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-3">
                  <h3 className="font-extrabold text-base text-slate-900">Order Management Hub</h3>
                  <button
                    onClick={() => setShowPosModal(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-sm active:scale-95"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-200" />
                    <span>+ Walk-in POS Order</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search Order ID, Name..."
                      className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200"
                    />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Pickup Scheduled">Pickup Scheduled</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Received at Laundry">Received at Laundry</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Cleaning / Washing">Cleaning / Washing</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Ready for Delivery">Ready for Delivery</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                      <th className="py-2.5">Order</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Slot / Date</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5">Assign Rider</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-mono font-bold text-brand-900">{order.orderNumber}</td>
                        <td className="py-3">
                          <div className="font-semibold text-slate-800">{order.customerName}</div>
                          <div className="text-[10px] text-slate-400">{order.customerPhone}</div>
                        </td>
                        <td className="py-3 text-slate-600">
                          <div>{order.pickupDate}</div>
                          <div className="text-[10px] text-slate-400">{order.pickupSlot}</div>
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-slate-900">₹{order.total.toFixed(0)}</div>
                          <div className="text-[10px] text-emerald-600 font-semibold">{order.paymentStatus}</div>
                        </td>
                        <td className="py-3">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Pickup Scheduled">Pickup Scheduled</option>
                            <option value="Picked Up">Picked Up</option>
                            <option value="Received at Laundry">Received at Laundry</option>
                            <option value="Inspection">Inspection</option>
                            <option value="Cleaning / Washing">Cleaning / Washing</option>
                            <option value="Quality Check">Quality Check</option>
                            <option value="Ready for Delivery">Ready for Delivery</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3">
                          <select
                            value={order.assignedDeliveryStaffId || ''}
                            onChange={(e) => assignDeliveryStaff(order.id, e.target.value)}
                            className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="">Unassigned</option>
                            {deliveryStaff.map((staff) => (
                              <option key={staff.id} value={staff.id}>
                                {staff.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <a
                              href={`https://wa.me/91${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hello ${order.customerName}! Update from The Laundry Lounge Rewa: Your order ${order.orderNumber} is currently: ${order.orderStatus}. Thank you!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs"
                              title="Send WhatsApp update to customer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => openInvoice(order)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center space-x-1"
                            >
                              <Printer className="w-3 h-3 text-slate-500" />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES & CATALOG CRUD */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Service Catalogue Manager</h3>
                  <p className="text-xs text-slate-500">
                    Add, edit price ranges, change units, toggle active status
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingServiceId(null);
                    setServiceForm({
                      name: '',
                      categoryId: categories[0]?.id || 'cat-dry-clean',
                      description: '',
                      priceType: 'fixed',
                      price: 50,
                      minPrice: 50,
                      maxPrice: 100,
                      unit: 'Piece',
                      turnaroundHours: 48,
                      image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=400&q=80',
                      active: true,
                      featured: false,
                      customQuoteRequired: false,
                    });
                    setShowServiceModal(true);
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Service</span>
                </button>
              </div>

              {/* Services Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                      <th className="py-2.5">Service Item</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Price Model</th>
                      <th className="py-2.5">Rate</th>
                      <th className="py-2.5">Unit</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map((svc) => (
                      <tr key={svc.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-slate-900 flex items-center space-x-2.5">
                          <img
                            src={svc.image}
                            alt={svc.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <div>{svc.name}</div>
                            {svc.customQuoteRequired && (
                              <span className="text-[10px] text-amber-600 font-bold">Quote Required</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-slate-600">
                          {categories.find((c) => c.id === svc.categoryId)?.name || svc.categoryId}
                        </td>
                        <td className="py-3 text-slate-600 uppercase font-mono text-[10px]">
                          {svc.priceType}
                        </td>
                        <td className="py-3 font-bold text-slate-900">
                          {svc.priceType === 'range'
                            ? `₹${svc.minPrice} – ₹${svc.maxPrice}`
                            : `₹${svc.price}`}
                        </td>
                        <td className="py-3 text-slate-600">{svc.unit}</td>
                        <td className="py-3">
                          <button
                            onClick={() => toggleServiceActive(svc.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              svc.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {svc.active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditServiceClick(svc)}
                            className="p-1 text-slate-500 hover:text-brand-600"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteService(svc.id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER CRM */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Customer CRM & Loyalty Segments</h3>
              <p className="text-xs text-slate-500">
                Segment customers by RFM (Recency, Frequency, Monetary spend)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900">Aarav Sharma</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      VIP Segment
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p>Phone: +91 98765 12345 | Email: aarav@example.com</p>
                    <p>Total Orders: {orders.length} | Lifetime Spend: ₹{totalRevenue.toFixed(0)}</p>
                    <p>Loyalty Points: 150 Pts</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900">Pooja Malhotra</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Repeat Customer
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p>Phone: +91 98111 88990 | Email: pooja@example.com</p>
                    <p>Total Orders: 4 | Lifetime Spend: ₹3,400</p>
                    <p>Loyalty Points: 80 Pts</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DELIVERY STAFF */}
          {activeTab === 'staff' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-base text-slate-900">Delivery Fleet & Riders</h3>
                <button
                  onClick={() => setShowStaffModal(true)}
                  className="px-3.5 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Rider</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {deliveryStaff.map((staff) => (
                  <div key={staff.id} className="p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{staff.name}</div>
                        <div className="text-[11px] text-slate-500">{staff.vehicleType}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {staff.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p>Phone: {staff.phone}</p>
                      <p>Rating: ⭐ {staff.rating} / 5.0</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-base text-slate-900">Promotions & Coupons</h3>
                <button
                  onClick={() => setShowCouponModal(true)}
                  className="px-3.5 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-xl text-xs">
                        {c.code}
                      </span>
                      <button onClick={() => deleteCoupon(c.id)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold">{c.description}</p>
                    <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                      <span>Redeemed: {c.usedCount} times</span>
                      <span>Min: ₹{c.minOrderValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SERVICE AREAS */}
          {activeTab === 'areas' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-base text-slate-900">Serviceable Pincodes & Hubs</h3>
                <button
                  onClick={() => setShowAreaModal(true)}
                  className="px-3.5 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pincode</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceAreas.map((sa) => (
                  <div key={sa.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-sm text-brand-900">{sa.pincode}</div>
                      <div className="text-xs font-semibold text-slate-800">{sa.areaName} ({sa.city})</div>
                      <div className="text-[10px] text-slate-500">Min Order: ₹{sa.minOrder} • Delivery Fee: ₹{sa.deliveryFee}</div>
                    </div>
                    <button onClick={() => deleteServiceArea(sa.id)} className="text-slate-400 hover:text-rose-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: PICKUP SLOTS */}
          {activeTab === 'slots' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Pickup Slot Capacity & Timings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pickupSlots.map((slot) => (
                  <div key={slot.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{slot.timeRange}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Max Bookings: {slot.maxCapacity} riders</div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Customer Reviews Moderation</h3>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900">{r.customerName} ({r.serviceCategory})</span>
                      <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{r.comment}"</p>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => toggleReviewApproved(r.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {r.approved ? 'Approved' : 'Pending Approval'}
                      </button>
                      <button
                        onClick={() => toggleReviewFeatured(r.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          r.featured ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.featured ? 'Featured on Home' : 'Not Featured'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: FAQS CMS */}
          {activeTab === 'faqs' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-base text-slate-900">FAQ Content Manager</h3>
                <button
                  onClick={() => setShowFaqModal(true)}
                  className="px-3.5 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((f) => (
                  <div key={f.id} className="p-4 rounded-2xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-slate-900">{f.question}</span>
                      <button onClick={() => deleteFAQ(f.id)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: CMS CONTENT */}
          {activeTab === 'cms' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Website CMS (Edit Without Code)</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Homepage Headline</label>
                  <input
                    type="text"
                    value={cmsForm.heroHeadline}
                    onChange={(e) => setCmsForm({ ...cmsForm, heroHeadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hero Subheadline</label>
                  <textarea
                    rows={2}
                    value={cmsForm.heroSubheadline}
                    onChange={(e) => setCmsForm({ ...cmsForm, heroSubheadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Top Announcement Banner</label>
                  <input
                    type="text"
                    value={cmsForm.announcementBar}
                    onChange={(e) => setCmsForm({ ...cmsForm, announcementBar: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <button
                  onClick={() => updateCMS(cmsForm)}
                  className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs"
                >
                  Save CMS Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 12: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Store Settings & Business Identity</h3>
                <p className="text-xs text-slate-500">Configure business information, contact channels, and pricing rules.</p>
              </div>

              {/* Business Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Name</label>
                  <input
                    type="text"
                    value={settingsForm.businessName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, businessName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Mobile (WhatsApp)</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secondary Mobile</label>
                  <input
                    type="text"
                    value={settingsForm.secondaryPhone || '9893733683'}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, secondaryPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Landline Number</label>
                  <input
                    type="text"
                    value={settingsForm.landline || '07662-334849'}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, landline: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="text"
                    value={settingsForm.email}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Branches Information */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="font-bold text-sm text-slate-800 mb-3">Store Branches (Rewa, M.P.)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-1">
                    <span className="font-bold text-sky-900 block text-sm">Branch 1 — Nehru Nagar (Main)</span>
                    <p className="text-slate-700">Near Gaytri School Nehru Nagar In FRONT Of Apna Super Bazar Rewa (M. P.)</p>
                    <p className="text-sky-700 font-semibold pt-1">Phone: 9329838804 / 07662-334849</p>
                  </div>
                  <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-1">
                    <span className="font-bold text-red-900 block text-sm">Branch 2 — Hari Om (Ring Road)</span>
                    <p className="text-slate-700">Behind Hotel The Vijay Villas Gadariya Ring Road Rewa (M. P.)</p>
                    <p className="text-red-700 font-semibold pt-1">Phone: 9893733683 / 9329838804</p>
                  </div>
                </div>
              </div>

              {/* Pricing & GST */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="font-bold text-sm text-slate-800 mb-3">Taxes & Delivery Rules</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GST Percentage (%)</label>
                    <input
                      type="number"
                      value={settingsForm.gstPercentage}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, gstPercentage: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Free Delivery Threshold (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.freeDeliveryThreshold}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          freeDeliveryThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Minimum Order Value (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.minOrderValue}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, minOrderValue: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Express Delivery Fee (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.expressDeliveryFee}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          expressDeliveryFee: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => updateBusinessSettings(settingsForm)}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Save Settings
              </button>
            </div>
          )}

          {/* TAB 13: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Analytics & Financial Reports</h3>
              <p className="text-xs text-slate-500">
                Detailed breakdowns by payment method and order volume
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800">Payment Methods Breakdown</span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>UPI Payments:</span>
                      <span className="font-bold">60%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Razorpay Cards:</span>
                      <span className="font-bold">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cash on Delivery:</span>
                      <span className="font-bold">15%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800">Top Service Category</span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Dry Cleaning:</span>
                      <span className="font-bold">52% volume</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wash & Iron:</span>
                      <span className="font-bold">33% volume</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Only Ironing:</span>
                      <span className="font-bold">15% volume</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">System Audit Logs</h3>
              <p className="text-xs text-slate-500">
                Immutable trace of admin actions, status changes, and catalog updates
              </p>

              <div className="divide-y divide-slate-100 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">
                        {log.action} <span className="font-normal text-slate-500">({log.targetType})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{log.details}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-700">{log.actorName}</span>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SERVICE MODAL (Add / Edit) */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60" onClick={() => setShowServiceModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 border border-slate-200">
            <h4 className="font-extrabold text-base text-slate-900 mb-4">
              {editingServiceId ? 'Edit Service Details' : 'Add New Service Item'}
            </h4>
            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="e.g. Silk Kurta, Blazer"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={serviceForm.categoryId}
                    onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price Model</label>
                  <select
                    value={serviceForm.priceType}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, priceType: e.target.value as PriceType })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="range">Range</option>
                    <option value="custom_quote">Custom Quote Required</option>
                  </select>
                </div>
              </div>

              {serviceForm.priceType === 'fixed' ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Min Price (₹)</label>
                    <input
                      type="number"
                      value={serviceForm.minPrice}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, minPrice: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Price (₹)</label>
                    <input
                      type="number"
                      value={serviceForm.maxPrice}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, maxPrice: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit</label>
                  <select
                    value={serviceForm.unit}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, unit: e.target.value as ServiceUnit })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Piece">Piece</option>
                    <option value="Pair">Pair</option>
                    <option value="Set">Set</option>
                    <option value="Square Feet">Square Feet</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Turnaround (Hours)</label>
                  <input
                    type="number"
                    value={serviceForm.turnaroundHours}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, turnaroundHours: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-white font-bold rounded-xl"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60" onClick={() => setShowCouponModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 border border-slate-200">
            <h4 className="font-extrabold text-base text-slate-900 mb-4">Create New Coupon</h4>
            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  placeholder="e.g. SUPER20"
                  className="w-full px-3 py-2 border rounded-xl uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountType: e.target.value as 'percentage' | 'fixed',
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={couponForm.discountValue}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Min Order Value (₹)</label>
                <input
                  type="number"
                  value={couponForm.minOrderValue}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="e.g. 10% OFF on all pickups"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-white font-bold rounded-xl"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE AREA MODAL */}
      {showAreaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60" onClick={() => setShowAreaModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 border border-slate-200">
            <h4 className="font-extrabold text-base text-slate-900 mb-4">Add Serviceable Pincode</h4>
            <form onSubmit={handleSaveArea} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pincode (6 Digits)</label>
                <input
                  type="text"
                  required
                  value={areaForm.pincode}
                  onChange={(e) => setAreaForm({ ...areaForm, pincode: e.target.value })}
                  placeholder="e.g. 110020"
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Area Name</label>
                <input
                  type="text"
                  required
                  value={areaForm.areaName}
                  onChange={(e) => setAreaForm({ ...areaForm, areaName: e.target.value })}
                  placeholder="e.g. Okhla Phase 3"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAreaModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-white font-bold rounded-xl"
                >
                  Save Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60" onClick={() => setShowFaqModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 border border-slate-200">
            <h4 className="font-extrabold text-base text-slate-900 mb-4">Add FAQ Item</h4>
            <form onSubmit={handleSaveFaq} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Answer</label>
                <textarea
                  rows={3}
                  required
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-white font-bold rounded-xl"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WALK-IN POS COUNTER ORDER INTAKE MODAL */}
      {showPosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setShowPosModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">Walk-In Counter Order Intake</h4>
                  <p className="text-xs text-slate-500">Retail branch Point-of-Sale (POS) order generator</p>
                </div>
              </div>
              <button
                onClick={() => setShowPosModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePosOrder} className="space-y-4 text-xs">
              {/* Branch Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Retail Branch</label>
                <select
                  value={posBranch}
                  onChange={(e) => setPosBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="Nehru Nagar (Branch 1)">Branch 1: Nehru Nagar (In Front of P.K. School)</option>
                  <option value="Ring Road Hari Om (Branch 2)">Branch 2: Hari Om Ring Road (Behind Hotel Vijay Villas)</option>
                </select>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={posCustomerPhone}
                    onChange={(e) => setPosCustomerPhone(e.target.value)}
                    placeholder="e.g. 9893733683"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Garment Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Add Garments &amp; Treatment</label>
                  <span className="text-[11px] font-bold text-sky-600">
                    {Object.values(posItems).reduce((a, b) => a + b, 0)} items selected
                  </span>
                </div>
                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-2xl p-2 divide-y divide-slate-100 bg-slate-50/50">
                  {services.filter((s) => s.active).map((svc) => {
                    const count = posItems[svc.id] || 0;
                    return (
                      <div key={svc.id} className="py-2 px-2 flex items-center justify-between hover:bg-white rounded-xl transition-colors">
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{svc.name}</div>
                          <div className="text-[10px] text-slate-500">₹{svc.price} / {svc.unit}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleUpdatePosItem(svc.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-black text-slate-900">{count}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdatePosItem(svc.id, 1)}
                            className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs hover:bg-sky-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Speed & Payment Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Turnaround Speed</label>
                  <select
                    value={posDeliveryMode}
                    onChange={(e) => setPosDeliveryMode(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="standard">Standard Care (48 Hours)</option>
                    <option value="express">⚡ Express Next-Day (24 Hours)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={posPaymentMethod}
                    onChange={(e) => setPosPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm QR)</option>
                    <option value="Cash on Delivery">Cash at Counter (Instant Receipt)</option>
                    <option value="Razorpay">Card / NetBanking / Razorpay POS</option>
                  </select>
                </div>
              </div>

              {/* Special Garment Instructions / Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Stain Notes / Customer Instructions (Optional)</label>
                <input
                  type="text"
                  value={posNotes}
                  onChange={(e) => setPosNotes(e.target.value)}
                  placeholder="e.g. Food stain on front pocket, roll press saree with soft sheen"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Order Summary & Submit */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">Estimated Bill Total</span>
                  <div className="text-2xl font-black text-slate-900">₹{posTotal.toFixed(0)}</div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowPosModal(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Create &amp; Print Bill</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
