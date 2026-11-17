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
  Building2,
  Wallet,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Calendar,
  Camera,
  Upload,
  UploadCloud,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Phone,
  Scale,
  Package,
  ToggleLeft,
  ToggleRight,
  EyeOff,
  Sliders,
} from 'lucide-react';
import {
  OrderStatus,
  ServiceItem,
  PriceType,
  ServiceUnit,
  CartItem,
  PaymentMethod,
  BankAccount,
  Expense,
  CustomerDueRecord,
  HeroSlideCMS,
} from '../types';
import { SEED_HERO_SLIDES } from '../data/seedData';
import { AccountingSuite } from '../components/admin/AccountingSuite';
import { ChangeServiceImageModal, compressImageFile } from '../components/admin/ChangeServiceImageModal';
import { InvoiceDesigner } from '../components/admin/InvoiceDesigner';
import { CustomerDuesManager } from '../components/admin/CustomerDuesManager';
import {
  BusinessDashboardView,
  BillingInvoicesView,
  SalesManagementView,
  PurchaseManagementView,
  ProductsServicesView,
  InventoryManagementView,
  WarehousesView,
  CustomersPartyView,
  SuppliersPartyView,
  PaymentsView,
  ExpensesView,
  AccountingLedgerView,
  GstReportsView,
  BusinessReportsView,
  BillingSettingsView,
  SubscriptionView,
  BulkImportCenterView,
} from '../components/admin/business';
import { useBusiness } from '../business/BusinessContext';

export const AdminDashboardPage: React.FC = () => {
  const { eraseAllBusinessData } = useBusiness();
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
    // Accounting & Khata
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    expenses,
    addExpense,
    deleteExpense,
    customerDues,
    recordDuePayment,
    addCustomerDue,
    getCustomerDue,
    eraseAllPlatformData,
    selectedGlobalBranch,
    setSelectedGlobalBranch,
  } = useApp();

  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);

  const handleFactoryResetAll = () => {
    eraseAllBusinessData();
    eraseAllPlatformData();
    setShowFactoryResetModal(false);
    showToast('All business records and storefront data have been completely erased!', 'success');
  };

  const [activeTab, setActiveTab] = useState<
    | 'biz_dashboard'
    | 'biz_import'
    | 'biz_billing'
    | 'biz_sales'
    | 'biz_purchase'
    | 'biz_products'
    | 'biz_inventory'
    | 'biz_warehouses'
    | 'biz_customers'
    | 'biz_suppliers'
    | 'biz_payments'
    | 'biz_expenses'
    | 'biz_accounting'
    | 'biz_gst'
    | 'biz_reports'
    | 'biz_settings'
    | 'biz_subscription'
    | 'overview'
    | 'customer_dues'
    | 'accounting'
    | 'orders'
    | 'invoicedesigner'
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
  >('biz_dashboard');

  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Service form modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [imageModalService, setImageModalService] = useState<ServiceItem | null>(null);
  const [serviceViewMode, setServiceViewMode] = useState<'grid' | 'table'>('grid');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');
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
  const [selectedSlideId, setSelectedSlideId] = useState<string>(() => {
    return cms.activeHeroSlideId || cms.heroSlides?.[0]?.id || 'slide-diwali';
  });

  // Ensure cmsForm.heroSlides is initialized
  const heroSlidesList: HeroSlideCMS[] =
    cmsForm.heroSlides && cmsForm.heroSlides.length > 0
      ? cmsForm.heroSlides
      : SEED_HERO_SLIDES;

  const currentActiveSlide: HeroSlideCMS =
    heroSlidesList.find((s) => s.id === selectedSlideId) ||
    heroSlidesList[0] ||
    SEED_HERO_SLIDES[0];

  const handleUpdateSlideField = (field: keyof HeroSlideCMS, value: any) => {
    const updated = heroSlidesList.map((s) => {
      if (s.id === currentActiveSlide.id) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setCmsForm({
      ...cmsForm,
      heroSlides: updated,
    });
  };

  const handleToggleSlidePill = (
    pillType: 'topPill' | 'featurePill' | 'cta' | 'secondaryCta'
  ) => {
    if (pillType === 'topPill') {
      const current = currentActiveSlide.showTopPill !== false;
      handleUpdateSlideField('showTopPill', !current);
      showToast(
        !current
          ? 'TOP PILL BADGE: चालू (ON) - Storefront Par Dikhega'
          : 'TOP PILL BADGE: बंद (OFF) - Storefront Se Hata Diya Gaya',
        'info'
      );
    } else if (pillType === 'featurePill') {
      const current = currentActiveSlide.showFeaturePill !== false;
      handleUpdateSlideField('showFeaturePill', !current);
      showToast(
        !current
          ? 'FEATURE PILL: चालू (ON) - Storefront Par Dikhega'
          : 'FEATURE PILL: बंद (OFF) - Storefront Se Hata Diya Gaya',
        'info'
      );
    } else if (pillType === 'cta') {
      const current = currentActiveSlide.showCta !== false;
      handleUpdateSlideField('showCta', !current);
      showToast(
        !current ? 'PRIMARY CTA: चालू (ON)' : 'PRIMARY CTA: बंद (OFF)',
        'info'
      );
    } else if (pillType === 'secondaryCta') {
      const current = currentActiveSlide.showSecondaryCta !== false;
      handleUpdateSlideField('showSecondaryCta', !current);
      showToast(
        !current ? 'SECONDARY CTA: चालू (ON)' : 'SECONDARY CTA: बंद (OFF)',
        'info'
      );
    }
  };

  // Walk-in Counter / POS Order Modal State
  const [showPosModal, setShowPosModal] = useState(false);
  const [posBranch, setPosBranch] = useState('The Laundry Lounge');
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>('UPI');
  const [posDeliveryMode, setPosDeliveryMode] = useState<'standard' | 'express'>('standard');
  const [posItems, setPosItems] = useState<{ [serviceId: string]: number }>({});
  const [posCustomPrices, setPosCustomPrices] = useState<{ [serviceId: string]: number }>({});
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posNotes, setPosNotes] = useState('');
  // Custom Payment Split & Udhar Khata State
  const [posCashPaid, setPosCashPaid] = useState<string>('');
  const [posOnlinePaid, setPosOnlinePaid] = useState<string>('');
  const [posIncludeDue, setPosIncludeDue] = useState<boolean>(true);

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

  const posItemsTotal = Object.entries(posItems).reduce((sum, [svcId, qty]) => {
    const s = services.find((x) => x.id === svcId);
    const price = posCustomPrices[svcId] !== undefined ? posCustomPrices[svcId] : (s ? s.price : 0);
    return sum + price * qty;
  }, 0);

  const existingCustomerDue = posCustomerPhone.trim() ? getCustomerDue(posCustomerPhone.trim()) : 0;
  const applicableDue = posIncludeDue ? existingCustomerDue : 0;
  const posGrandTotal = posItemsTotal + applicableDue;

  const currentCashPaid = posCashPaid === '' ? 0 : parseFloat(posCashPaid) || 0;
  const currentOnlinePaid = posOnlinePaid === '' ? 0 : parseFloat(posOnlinePaid) || 0;
  const currentTotalPaid = currentCashPaid + currentOnlinePaid;
  const remainingUdharDue = Math.max(0, posGrandTotal - currentTotalPaid);

  const handleCreatePosOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posCustomerName.trim() || !posCustomerPhone.trim()) {
      showToast('Please enter customer name and phone number', 'error');
      return;
    }
    const cartItems: CartItem[] = Object.entries(posItems).map(([svcId, qty]) => {
      const s = services.find((x) => x.id === svcId)!;
      const rate = posCustomPrices[s.id] !== undefined ? posCustomPrices[s.id] : s.price;
      return {
        serviceId: s.id,
        service: {
          ...s,
          price: rate,
        },
        quantity: qty,
        selectedPrice: rate,
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
      paymentMethod: currentOnlinePaid > 0 ? 'UPI' : 'Cash on Delivery',
      previousBalance: applicableDue,
      paidAmount: currentTotalPaid,
      remainingDue: remainingUdharDue,
      paymentBreakdown: {
        cash: currentCashPaid,
        online: currentOnlinePaid,
        due: remainingUdharDue,
      },
    });

    showToast(`Counter Order ${order.orderNumber} created successfully!`, 'success');
    setShowPosModal(false);
    setPosCustomerName('');
    setPosCustomerPhone('');
    setPosItems({});
    setPosCustomPrices({});
    setPosSearchQuery('');
    setPosNotes('');
    setPosCashPaid('');
    setPosOnlinePaid('');
    openInvoice(order);
  };

  // ==========================================
  // 💰 ACCOUNTING & KHATA CALCULATIONS (Branch-Aware)
  // ==========================================
  const isBranchMatch = (itemBranch?: string) => {
    if (!selectedGlobalBranch || selectedGlobalBranch === 'all') return true;
    if (!itemBranch) return selectedGlobalBranch === 'The Laundry Lounge';
    if (selectedGlobalBranch === 'The Laundry Lounge') {
      return itemBranch === 'The Laundry Lounge' || itemBranch.includes('Arun') || itemBranch.includes('Retail');
    }
    if (selectedGlobalBranch === 'Hari Om Laundry') {
      return itemBranch === 'Hari Om Laundry' || itemBranch.includes('Hari Om') || itemBranch.includes('Ring Road') || itemBranch.includes('Nehru');
    }
    return false;
  };

  const branchFilteredCustomerDues = customerDues.filter((d) => isBranchMatch(d.branch));
  const branchFilteredOrders = orders.filter((o) => {
    const orderBranch = (o as any).branch || (o.address?.area?.toLowerCase().includes('ring') || o.address?.street?.toLowerCase().includes('ring') ? 'Hari Om Laundry' : 'The Laundry Lounge');
    return isBranchMatch(orderBranch);
  });

  // 1. Total Customer Due
  const totalCustomerDue =
    branchFilteredCustomerDues.reduce((sum, d) => sum + d.pendingDue, 0) +
    branchFilteredOrders.filter((o) => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + (o.total || 0), 0);

  // 2. Total Offline Revenue (Walk-in Counter POS)
  const offlineOrders = orders.filter(
    (o) =>
      o.address.houseFlat.toLowerCase().includes('walk-in') ||
      o.address.houseFlat.toLowerCase().includes('pos') ||
      o.pickupSlot.toLowerCase().includes('walk-in')
  );
  const totalOfflineRevenue =
    offlineOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0) +
    customerDues.reduce((sum, d) => sum + d.totalPaid, 0);

  // 3. Total Web Revenue (Website Doorstep Pickups)
  const webOrders = orders.filter(
    (o) =>
      !o.address.houseFlat.toLowerCase().includes('walk-in') &&
      !o.address.houseFlat.toLowerCase().includes('pos') &&
      !o.pickupSlot.toLowerCase().includes('walk-in')
  );
  const totalWebRevenue = webOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);

  // 4. Total Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 5. Cash in Hand & Cash Received
  const cashAccount = accounts.find((a) => a.accountType === 'cash_drawer');
  const cashDrawerBalance = cashAccount ? cashAccount.currentBalance : 0;
  const totalCashCollected = cashAccount ? cashAccount.totalInflow : 0;

  // 6. Bank & Digital Received (Multiple Bank Accounts)
  const bankAccountsList = accounts.filter((a) => a.accountType !== 'cash_drawer');
  const totalBankBalance = bankAccountsList.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalBankReceived = bankAccountsList.reduce((sum, a) => sum + a.totalInflow, 0);

  // 7. Net Operating Profit
  const netOperatingProfit = (totalOfflineRevenue + totalWebRevenue) - totalExpenses;

  // Accounting Sub-tab state
  const [accountingSubTab, setAccountingSubTab] = useState<'overview' | 'accounts' | 'dues' | 'expenses' | 'ledger'>('overview');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [dueSearchQuery, setDueSearchQuery] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [expenseBranchFilter, setExpenseBranchFilter] = useState<string>('all');

  // Modals for Accounting
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState<{
    title: string;
    category: Expense['category'];
    amount: string;
    paidViaAccountId: string;
    branch: Expense['branch'];
    receiptNumber: string;
    vendorName: string;
    note: string;
    date: string;
  }>({
    title: '',
    category: 'Detergents & Chemicals',
    amount: '',
    paidViaAccountId: accounts[0]?.id || '',
    branch: 'Branch 1 - Nehru Nagar',
    receiptNumber: '',
    vendorName: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState<{
    name: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
    accountType: BankAccount['accountType'];
    openingBalance: string;
    upiId: string;
  }>({
    name: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: 'Nehru Nagar (Main Hub)',
    accountType: 'bank_current',
    openingBalance: '',
    upiId: '',
  });

  const [showDueCollectModal, setShowDueCollectModal] = useState(false);
  const [dueCollectData, setDueCollectData] = useState<{
    dueId: string;
    customerName: string;
    customerPhone: string;
    pendingDue: number;
    amountPaid: string;
    accountId: string;
    paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
    note: string;
  }>({
    dueId: '',
    customerName: '',
    customerPhone: '',
    pendingDue: 0,
    amountPaid: '',
    accountId: accounts[0]?.id || '',
    paymentMode: 'Cash',
    note: '',
  });

  const [showAddDueModal, setShowAddDueModal] = useState(false);
  const [addDueForm, setAddDueForm] = useState({
    customerName: '',
    customerPhone: '',
    totalBilled: '',
    totalPaid: '',
    branch: 'Branch 1 - Nehru Nagar',
    notes: '',
  });

  // Export Accounting Ledger CSV
  const handleExportAccountingCSV = () => {
    const headers = 'Type,Title,Category/Party,Amount,Account,Date,Branch,Notes\n';
    const expenseRows = expenses.map(
      (e) => `"Expense","${e.title}","${e.category}",-${e.amount},"${e.accountName}","${e.date}","${e.branch}","${e.note || ''}"`
    );
    const dueRows = customerDues.map(
      (d) => `"Customer Due","${d.customerName}","Udhar Khata",${d.pendingDue},"Pending","${d.lastPaymentDate || ''}","${d.branch}","Total Billed: ₹${d.totalBilled}, Paid: ₹${d.totalPaid}"`
    );
    const orderRows = orders.map(
      (o) => `"Order Sale","${o.orderNumber}","${o.customerName}",+${o.total},"${o.paymentMethod}","${o.pickupDate}","${o.address.area}","Status: ${o.orderStatus}"`
    );
    const allRows = [...expenseRows, ...dueRows, ...orderRows].join('\n');
    const blob = new Blob([headers + allRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thelaundrylounge_accounting_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Accounting ledger exported as CSV successfully!', 'success');
  };

  // Metrics calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'Delivered').length;

  // Filtered orders (Branch-Aware)
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    const orderBranch = (o as any).branch || (o.address?.area?.toLowerCase().includes('ring') || o.address?.street?.toLowerCase().includes('ring') ? 'Hari Om Laundry' : 'The Laundry Lounge');
    const matchBranch = isBranchMatch(orderBranch);
    return matchStatus && matchSearch && matchBranch;
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

  const navSections = [
    {
      title: 'BUSINESS MANAGEMENT',
      badge: 'My BillBook',
      items: [
        { id: 'biz_dashboard', label: 'Business Dashboard', icon: LayoutDashboard, badge: 'Live' },
        { id: 'biz_import', label: 'Bulk Import Center', icon: UploadCloud, badge: 'MIGRATE' },
        { id: 'biz_billing', label: 'Billing & Invoices', icon: Receipt },
        { id: 'biz_sales', label: 'Sales Management', icon: ShoppingBag },
        { id: 'biz_purchase', label: 'Purchase Management', icon: ShoppingCart },
        { id: 'biz_products', label: 'Products & Services', icon: Shirt },
        { id: 'biz_inventory', label: 'Inventory Management', icon: Package },
        { id: 'biz_warehouses', label: 'Warehouses', icon: Building2 },
        { id: 'biz_customers', label: 'Customers (Parties)', icon: Users },
        { id: 'biz_suppliers', label: 'Suppliers (Vendors)', icon: Building2 },
        { id: 'biz_payments', label: 'Payments & Receipts', icon: CreditCard },
        { id: 'biz_expenses', label: 'Expenses & ITC', icon: DollarSign },
        { id: 'biz_accounting', label: 'Accounting & Ledger', icon: Scale },
        { id: 'biz_gst', label: 'GST Reports (1 & 3B)', icon: FileSpreadsheet },
        { id: 'biz_reports', label: 'Business Reports', icon: FileText },
        { id: 'biz_settings', label: 'Billing Settings', icon: Settings },
        { id: 'biz_subscription', label: 'SaaS Subscription', icon: Sparkles, badge: 'Gold' },
      ],
    },
    {
      title: 'OPERATIONS & STOREFRONT',
      items: [
        { id: 'overview', label: 'Operations Overview', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders Hub', icon: ShoppingBag, badge: activeOrdersCount },
        {
          id: 'customer_dues',
          label: 'Counter Dues (खाता)',
          icon: Receipt,
          badge: totalCustomerDue > 0 ? `₹${totalCustomerDue.toLocaleString('en-IN')}` : undefined,
        },
        { id: 'services', label: 'Services Catalogue', icon: Shirt, badge: services.length },
        { id: 'customers', label: 'Customer CRM', icon: Users },
        { id: 'staff', label: 'Delivery Staff', icon: Bike },
        { id: 'coupons', label: 'Coupons & Offers', icon: Tag },
        { id: 'areas', label: 'Service Areas', icon: MapPin },
        { id: 'slots', label: 'Pickup Slots', icon: Clock },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'faqs', label: 'FAQs CMS', icon: HelpCircle },
        { id: 'cms', label: 'Website CMS', icon: Layers },
      ],
    },
    {
      title: 'SETTINGS & AUDIT',
      items: [
        { id: 'invoicedesigner', label: 'Invoice Designer', icon: Printer, badge: 'Branch 1 & 2' },
        { id: 'settings', label: 'Store Settings', icon: Settings },
        { id: 'reports', label: 'Export Orders CSV', icon: FileSpreadsheet },
        { id: 'audit', label: 'Audit Logs', icon: History },
      ],
    },
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
              <span>2 Operating Branches (The Laundry Lounge &amp; Hari Om Laundry)</span>
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
          {/* Active Store Branch Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700/80 text-xs font-bold text-slate-200">
            <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <select
              value={selectedGlobalBranch}
              onChange={(e) => setSelectedGlobalBranch(e.target.value)}
              className="bg-transparent text-white font-extrabold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Branches (Consolidated)</option>
              <option value="The Laundry Lounge" className="bg-slate-900 text-white">1. The Laundry Lounge</option>
              <option value="Hari Om Laundry" className="bg-slate-900 text-white">2. Hari Om Laundry</option>
            </select>
          </div>

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

          {/* Quick GST Invoice button */}
          <button
            onClick={() => setActiveTab('biz_billing')}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
          >
            <Receipt className="w-4 h-4 text-sky-200" />
            <span>+ GST Invoice</span>
          </button>

          {/* Dedicated Invoice Designer Button */}
          <button
            onClick={() => setActiveTab('invoicedesigner')}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
            title="Open standalone Bill & Invoice Designer"
          >
            <Printer className="w-4 h-4 text-sky-200" />
            <span>Invoice Designer</span>
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
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 border border-slate-200 shadow-soft-sm flex lg:flex-col overflow-x-auto no-scrollbar gap-2 lg:gap-0 lg:space-y-4">
            {navSections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-1 shrink-0">
                <div className="hidden lg:flex items-center justify-between px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <span>{sec.title}</span>
                  {sec.badge && (
                    <span className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-mono">
                      {sec.badge}
                    </span>
                  )}
                </div>
                <div className="flex lg:flex-col gap-1 lg:gap-0 lg:space-y-0.5">
                  {sec.items.map((item) => {
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
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* BUSINESS MANAGEMENT TABS (MY BILLBOOK SUITE) */}
          {activeTab === 'biz_dashboard' && (
            <BusinessDashboardView
              onNavigateTab={(t) => setActiveTab(t as any)}
              onOpenNewInvoiceModal={() => setActiveTab('biz_billing')}
            />
          )}

          {activeTab === 'biz_import' && <BulkImportCenterView />}
          {activeTab === 'biz_billing' && <BillingInvoicesView />}
          {activeTab === 'biz_sales' && <SalesManagementView />}
          {activeTab === 'biz_purchase' && <PurchaseManagementView />}
          {activeTab === 'biz_products' && <ProductsServicesView />}
          {activeTab === 'biz_inventory' && <InventoryManagementView />}
          {activeTab === 'biz_warehouses' && <WarehousesView />}
          {activeTab === 'biz_customers' && <CustomersPartyView />}
          {activeTab === 'biz_suppliers' && <SuppliersPartyView />}
          {activeTab === 'biz_payments' && <PaymentsView />}
          {activeTab === 'biz_expenses' && <ExpensesView />}
          {activeTab === 'biz_accounting' && <AccountingLedgerView />}
          {activeTab === 'biz_gst' && <GstReportsView />}
          {activeTab === 'biz_reports' && <BusinessReportsView />}
          {activeTab === 'biz_settings' && <BillingSettingsView />}
          {activeTab === 'biz_subscription' && <SubscriptionView />}
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

              {/* Financial Khata Quick Snapshot Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 border border-slate-700 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                        Accounts &amp; Financial Khata
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Live tracking: Customer Dues • Offline POS Cash • Website Revenue • Multi-Bank Accounts
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('accounting')}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <span>Open Full Accounts &amp; Khata</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-700/60">
                  <button
                    onClick={() => setActiveTab('customer_dues')}
                    className="bg-slate-800/90 hover:bg-slate-800 p-3 rounded-2xl border border-rose-500/50 hover:border-rose-400 text-left transition-all group cursor-pointer"
                    title="Click to view all Customer Dues & Khata"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-rose-300 font-bold uppercase flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        <span>Customer Due</span>
                      </div>
                      <span className="text-[10px] text-rose-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <div className="text-lg font-black text-rose-400 mt-0.5">₹{totalCustomerDue.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-300 font-semibold group-hover:text-white transition-colors">View All Dues ↗</div>
                  </button>

                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <div className="text-[10px] text-sky-300 font-bold uppercase">Offline Counter</div>
                    <div className="text-lg font-black text-sky-400 mt-0.5">₹{totalOfflineRevenue.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-400">POS Walk-in</div>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <div className="text-[10px] text-indigo-300 font-bold uppercase">Web Bookings</div>
                    <div className="text-lg font-black text-indigo-400 mt-0.5">₹{totalWebRevenue.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-400">Online Pickup</div>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-amber-500/30">
                    <div className="text-[10px] text-amber-300 font-bold uppercase">Total Expenses</div>
                    <div className="text-lg font-black text-amber-400 mt-0.5">₹{totalExpenses.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-400">Chemicals/Bills/Rent</div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-slate-800/80 p-3 rounded-2xl border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-300 font-bold uppercase">Cash + Banks</div>
                    <div className="text-lg font-black text-emerald-400 mt-0.5">
                      ₹{(cashDrawerBalance + totalBankBalance).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Cash ₹{cashDrawerBalance} | Bank ₹{totalBankBalance}
                    </div>
                  </div>
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

          {/* TAB: DEDICATED CUSTOMER DUES (UDHAAR KHATA) */}
          {activeTab === 'customer_dues' && (
            <CustomerDuesManager />
          )}

          {/* TAB: ACCOUNTS & KHATA (MULTI-BANK MANAGEMENT) */}
          {activeTab === 'accounting' && (
            <AccountingSuite />
          )}

          {/* TAB: DEDICATED INVOICE DESIGNER */}
          {activeTab === 'invoicedesigner' && (
            <InvoiceDesigner />
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

          {/* TAB 3: SERVICES & CATALOG CRUD WITH PHOTO MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-5">
              {/* Top Title & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
                      <Shirt className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Service Catalogue &amp; Garment Photos
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Change garment photos, manage pricing, and add new services
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {/* View Mode Switcher */}
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
                    <button
                      onClick={() => setServiceViewMode('grid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        serviceViewMode === 'grid'
                          ? 'bg-white text-brand-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Photo Cards</span>
                    </button>
                    <button
                      onClick={() => setServiceViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        serviceViewMode === 'table'
                          ? 'bg-white text-brand-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Table</span>
                    </button>
                  </div>

                  {/* Add New Service Button */}
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
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Service</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Category Pills */}
                <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 w-full md:w-auto">
                  <button
                    onClick={() => setServiceCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      serviceCategoryFilter === 'all'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Items ({services.length})
                  </button>
                  {categories.map((cat) => {
                    const count = services.filter((s) => s.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setServiceCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                          serviceCategoryFilter === cat.id
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-64 shrink-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={serviceSearchQuery}
                    onChange={(e) => setServiceSearchQuery(e.target.value)}
                    placeholder="Search garment (e.g. Saree, Kurta)..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                  {serviceSearchQuery && (
                    <button
                      onClick={() => setServiceSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* SERVICE ITEMS RENDER */}
              {(() => {
                const filteredCatalogServices = services.filter((svc) => {
                  const matchCat =
                    serviceCategoryFilter === 'all' || svc.categoryId === serviceCategoryFilter;
                  const matchQuery =
                    svc.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                    svc.description.toLowerCase().includes(serviceSearchQuery.toLowerCase());
                  return matchCat && matchQuery;
                });

                if (filteredCatalogServices.length === 0) {
                  return (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      No service items match your current filter or search query.
                    </div>
                  );
                }

                {/* 1. PHOTO CARDS / GRID VIEW (Matches Customer-facing Card Layout) */}
                if (serviceViewMode === 'grid') {
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-1">
                      {filteredCatalogServices.map((svc) => (
                        <div
                          key={svc.id}
                          className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all overflow-hidden flex flex-col justify-between group"
                        >
                          <div>
                            {/* Garment Image with Turnaround & Change Photo Button */}
                            <div className="relative h-40 bg-slate-100 overflow-hidden">
                              <img
                                src={svc.image}
                                alt={svc.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=400&q=80';
                                }}
                              />

                              {/* Turnaround Badge */}
                              <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>{svc.turnaroundHours}h</span>
                              </div>

                              {/* Change Photo Overlay Button */}
                              <button
                                onClick={() => setImageModalService(svc)}
                                className="absolute top-2.5 right-2.5 bg-slate-900/85 hover:bg-brand-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center space-x-1.5 shadow-lg backdrop-blur-xs transition-all active:scale-95"
                                title="Change garment image"
                              >
                                <Camera className="w-3.5 h-3.5 text-brand-300" />
                                <span>Change Photo</span>
                              </button>

                              {/* Category Name Tag at Bottom */}
                              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                                {categories.find((c) => c.id === svc.categoryId)?.name || svc.categoryId}
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-3.5 space-y-1.5">
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                                  {svc.name}
                                </h4>
                                <button
                                  onClick={() => toggleServiceActive(svc.id)}
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                                    svc.active
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {svc.active ? 'Active' : 'Disabled'}
                                </button>
                              </div>

                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                {svc.description || 'Gentle wash & precision steam finishing.'}
                              </p>
                            </div>
                          </div>

                          {/* Footer: Price & Edit Actions */}
                          <div className="p-3.5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                            <div>
                              <div className="text-base font-black text-slate-900">
                                {svc.priceType === 'range'
                                  ? `₹${svc.minPrice} – ₹${svc.maxPrice}`
                                  : `₹${svc.price}`}
                              </div>
                              <div className="text-[10px] text-slate-400">per {svc.unit}</div>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => setImageModalService(svc)}
                                className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                title="Change Photo"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditServiceClick(svc)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteService(svc.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                {/* 2. TABLE VIEW */}
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                          <th className="py-2.5">Service Photo &amp; Name</th>
                          <th className="py-2.5">Category</th>
                          <th className="py-2.5">Price Model</th>
                          <th className="py-2.5">Rate</th>
                          <th className="py-2.5">Unit</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCatalogServices.map((svc) => (
                          <tr key={svc.id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-semibold text-slate-900 flex items-center space-x-3">
                              {/* Clickable Image with Camera Badge */}
                              <div
                                onClick={() => setImageModalService(svc)}
                                className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group shrink-0"
                                title="Click to change photo"
                              >
                                <img
                                  src={svc.image}
                                  alt={svc.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=400&q=80';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                  <Camera className="w-4 h-4" />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{svc.name}</div>
                                <button
                                  onClick={() => setImageModalService(svc)}
                                  className="text-[10px] text-brand-600 hover:text-brand-700 font-bold flex items-center space-x-1 mt-0.5"
                                >
                                  <Camera className="w-3 h-3" />
                                  <span>Change Photo</span>
                                </button>
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
                                onClick={() => setImageModalService(svc)}
                                className="p-1 text-slate-500 hover:text-brand-600"
                                title="Change Photo"
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </button>
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
                );
              })()}
            </div>
          )}

          {/* TAB 4: CUSTOMER CRM */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-brand-600" />
                    <span>Customer CRM &amp; Financial Khata Profiles</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live directory of customer orders, lifetime spend, loyalty tiers, and pending balances.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('customer_dues')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-sm active:scale-95"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Open Customer Dues (₹{totalCustomerDue.toLocaleString('en-IN')}) →</span>
                </button>
              </div>

              {/* Customer Profiles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Profile 1: Aarav Sharma */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white hover:border-brand-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-black text-xs flex items-center justify-center">
                        A
                      </div>
                      <span className="font-bold text-sm text-slate-900">Aarav Sharma</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      VIP Segment
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>98765 12345</span>
                    </p>
                    <p>Total Orders: {orders.length} | Lifetime Spend: ₹{totalRevenue.toFixed(0)}</p>
                    <p className="text-emerald-600 font-semibold">Loyalty Points: 150 Pts</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                      Account Clear (₹0 Due)
                    </span>
                    <button
                      onClick={() => setActiveTab('customer_dues')}
                      className="text-brand-600 hover:underline font-bold text-[11px]"
                    >
                      View Khata
                    </button>
                  </div>
                </div>

                {/* Profile 2: Advocate R. P. Tiwari */}
                <div className="p-4 rounded-2xl border border-rose-200 space-y-3 bg-rose-50/20 hover:border-rose-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
                        R
                      </div>
                      <span className="font-bold text-sm text-slate-900">Advocate R. P. Tiwari</span>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      Pending Due
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>94251 83920</span>
                    </p>
                    <p>Nehru Nagar Branch • 5 Woolen Suits Dry Clean</p>
                    <p className="text-amber-700 font-semibold">Loyalty Points: 120 Pts</p>
                  </div>
                  <div className="pt-2 border-t border-rose-100 flex justify-between items-center text-xs">
                    <span className="text-rose-700 font-black bg-rose-100/80 px-2 py-0.5 rounded-md text-[11px]">
                      Due: ₹1,850
                    </span>
                    <button
                      onClick={() => setActiveTab('customer_dues')}
                      className="text-rose-600 hover:underline font-bold text-[11px]"
                    >
                      Collect Due →
                    </button>
                  </div>
                </div>

                {/* Profile 3: Dr. Neha Mishra */}
                <div className="p-4 rounded-2xl border border-rose-200 space-y-3 bg-rose-50/20 hover:border-rose-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
                        N
                      </div>
                      <span className="font-bold text-sm text-slate-900">Dr. Neha Mishra</span>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      Pending Due
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>98263 74910</span>
                    </p>
                    <p>Ring Road Branch • Silk Bridal Saree Roll Press</p>
                    <p className="text-emerald-600 font-semibold">Loyalty Points: 95 Pts</p>
                  </div>
                  <div className="pt-2 border-t border-rose-100 flex justify-between items-center text-xs">
                    <span className="text-rose-700 font-black bg-rose-100/80 px-2 py-0.5 rounded-md text-[11px]">
                      Due: ₹1,200
                    </span>
                    <button
                      onClick={() => setActiveTab('customer_dues')}
                      className="text-rose-600 hover:underline font-bold text-[11px]"
                    >
                      Collect Due →
                    </button>
                  </div>
                </div>

                {/* Profile 4: Hotel The Vijay Villas */}
                <div className="p-4 rounded-2xl border border-rose-200 space-y-3 bg-rose-50/20 hover:border-rose-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
                        H
                      </div>
                      <span className="font-bold text-sm text-slate-900">Hotel The Vijay Villas</span>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      B2B Corporate
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>93298 38804</span>
                    </p>
                    <p>Bulk Bed Linen Batch • Monthly Account</p>
                    <p className="text-sky-700 font-semibold">Contract Tier: Gold</p>
                  </div>
                  <div className="pt-2 border-t border-rose-100 flex justify-between items-center text-xs">
                    <span className="text-rose-700 font-black bg-rose-100/80 px-2 py-0.5 rounded-md text-[11px]">
                      Due: ₹4,500
                    </span>
                    <button
                      onClick={() => setActiveTab('customer_dues')}
                      className="text-rose-600 hover:underline font-bold text-[11px]"
                    >
                      Collect Due →
                    </button>
                  </div>
                </div>

                {/* Profile 5: Sunil Verma */}
                <div className="p-4 rounded-2xl border border-rose-200 space-y-3 bg-rose-50/20 hover:border-rose-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
                        S
                      </div>
                      <span className="font-bold text-sm text-slate-900">Sunil Verma</span>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      Pending Due
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>97541 28930</span>
                    </p>
                    <p>Nehru Nagar Branch • Heavy Winter Quilts</p>
                    <p className="text-amber-700 font-semibold">Loyalty Points: 45 Pts</p>
                  </div>
                  <div className="pt-2 border-t border-rose-100 flex justify-between items-center text-xs">
                    <span className="text-rose-700 font-black bg-rose-100/80 px-2 py-0.5 rounded-md text-[11px]">
                      Due: ₹850
                    </span>
                    <button
                      onClick={() => setActiveTab('customer_dues')}
                      className="text-rose-600 hover:underline font-bold text-[11px]"
                    >
                      Collect Due →
                    </button>
                  </div>
                </div>

                {/* Profile 6: Pooja Malhotra */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white hover:border-brand-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                        P
                      </div>
                      <span className="font-bold text-sm text-slate-900">Pooja Malhotra</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Repeat Customer
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>98111 88990</span>
                    </p>
                    <p>Total Orders: 4 | Lifetime Spend: ₹3,400</p>
                    <p className="text-emerald-600 font-semibold">Loyalty Points: 80 Pts</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                      Account Clear (₹0 Due)
                    </span>
                    <button
                      onClick={() => setActiveTab('customer_dues')}
                      className="text-brand-600 hover:underline font-bold text-[11px]"
                    >
                      View Khata
                    </button>
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

          {/* TAB 11: CMS CONTENT & HERO SLIDES */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        Website CMS &amp; Hero Slide Manager
                      </h3>
                      <p className="text-xs text-slate-500">
                        Festive Banners, Season Capsule Badges, Headlines &amp; Live Button On/Off (चालू / बंद) Controls
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const diwaliSlide = SEED_HERO_SLIDES[0];
                      const updated = heroSlidesList.map((s) =>
                        s.id === 'slide-diwali' ? { ...diwaliSlide } : s
                      );
                      setCmsForm({
                        ...cmsForm,
                        heroSlides: updated,
                        activeHeroSlideId: 'slide-diwali',
                      });
                      setSelectedSlideId('slide-diwali');
                      showToast('Diwali Festive 2026 Preset Loaded!', 'success');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reset Diwali Preset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateCMS(cmsForm);
                      showToast('CMS & Slide changes saved successfully to live storefront!', 'success');
                    }}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save CMS Changes</span>
                  </button>
                </div>
              </div>

              {/* SLIDE SELECTOR TABS & GLOBAL TOGGLE */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      Hero Banner Slides &amp; Festive Carousel
                    </h4>
                    <p className="text-xs text-slate-500">
                      Select a slide below to edit badges, headlines, and toggle buttons on/off (चालू / बंद).
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-slate-600">
                      Storefront Hero Slider:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = cmsForm.enableHeroSlider === false;
                        setCmsForm({ ...cmsForm, enableHeroSlider: next });
                        showToast(
                          next
                            ? 'Hero Banner Slider Enabled on Storefront'
                            : 'Hero Banner Slider Disabled',
                          'info'
                        );
                      }}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                        cmsForm.enableHeroSlider !== false
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cmsForm.enableHeroSlider !== false ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <span>Slider चालू (Active)</span>
                          <ToggleRight className="w-4 h-4 ml-0.5" />
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span>Slider बंद (Disabled)</span>
                          <ToggleLeft className="w-4 h-4 ml-0.5 text-slate-500" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Slides Picker Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {heroSlidesList.map((slide, idx) => {
                    const isSelected = slide.id === selectedSlideId;
                    return (
                      <div
                        key={slide.id || idx}
                        onClick={() => setSelectedSlideId(slide.id)}
                        className={`cursor-pointer rounded-2xl p-3 border-2 transition-all flex items-center space-x-3 relative overflow-hidden ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/40 shadow-soft-sm ring-2 ring-brand-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 relative">
                          <img
                            src={slide.image}
                            alt={slide.headline1}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/20" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold text-slate-400">
                              SLIDE #{idx + 1}
                            </span>
                            {slide.id === 'slide-diwali' && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase">
                                Festive
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-xs text-slate-900 truncate">
                            {slide.headline1} {slide.headline2}
                          </div>
                          <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-0.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                slide.showTopPill !== false
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-300'
                              }`}
                            />
                            <span>
                              Pill 1: {slide.showTopPill !== false ? 'ON' : 'OFF'}
                            </span>
                            <span>•</span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                slide.showFeaturePill !== false
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-300'
                              }`}
                            />
                            <span>
                              Pill 2: {slide.showFeaturePill !== false ? 'ON' : 'OFF'}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-600 ring-4 ring-brand-100" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* =========================================================================
                  ⭐ HERO SLIDE EDITOR (EXACT MATCH OF USER SCREENSHOT + ON/OFF BUTTON TOGGLES)
              ========================================================================= */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden border border-slate-200">
                      <img
                        src={currentActiveSlide.image}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Editing Slide: {currentActiveSlide.headline1} {currentActiveSlide.headline2}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Customize button pills, headlines, text and toggle on/off visibility.
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                    ID: {currentActiveSlide.id}
                  </span>
                </div>

                <div className="space-y-5">
                  {/* ROW 1: TOP PILL & FEATURE PILL WITH DEDICATED ON/OFF (BAND / CHALU) TOGGLES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* 1. TOP PILL SEASON / CAPSULE BADGE */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        currentActiveSlide.showTopPill !== false
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-extrabold tracking-wider text-slate-800 uppercase flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>TOP PILL SEASON / CAPSULE BADGE</span>
                        </label>

                        {/* ON/OFF TOGGLE SWITCH BUTTON (बटन चालू / बंद) */}
                        <button
                          type="button"
                          onClick={() => handleToggleSlidePill('topPill')}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
                            currentActiveSlide.showTopPill !== false
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/30'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700 ring-1 ring-slate-300'
                          }`}
                          title="Click to Turn ON / OFF (चालू या बंद करें)"
                        >
                          {currentActiveSlide.showTopPill !== false ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              <span>चालू (ON)</span>
                              <ToggleRight className="w-4 h-4 ml-0.5" />
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              <span>बंद (OFF)</span>
                              <ToggleLeft className="w-4 h-4 ml-0.5 text-slate-500" />
                            </>
                          )}
                        </button>
                      </div>

                      <input
                        type="text"
                        value={currentActiveSlide.topPill}
                        onChange={(e) =>
                          handleUpdateSlideField('topPill', e.target.value)
                        }
                        placeholder="e.g. DIWALI 2026 • FESTIVE COLLECTION"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          currentActiveSlide.showTopPill !== false
                            ? 'bg-white border border-amber-300 text-slate-900 shadow-soft-sm focus:ring-2 focus:ring-amber-500'
                            : 'bg-slate-100 border border-dashed border-slate-300 text-slate-400 line-through'
                        }`}
                      />

                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <span
                          className={`font-semibold ${
                            currentActiveSlide.showTopPill !== false
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {currentActiveSlide.showTopPill !== false
                            ? '🟢 Button चालू Hai: Storefront banner par glowing pill dikhega'
                            : '⚪ Button बंद Hai: Storefront banner se hide kar diya gaya hai'}
                        </span>
                        <span className="text-slate-400 font-mono">
                          showTopPill: {String(currentActiveSlide.showTopPill !== false)}
                        </span>
                      </div>
                    </div>

                    {/* 2. FABRIC / ORIGIN FEATURE PILL */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        currentActiveSlide.showFeaturePill !== false
                          ? 'bg-sky-50/40 border-sky-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-extrabold tracking-wider text-slate-800 uppercase flex items-center space-x-1.5">
                          <Shirt className="w-3.5 h-3.5 text-sky-600" />
                          <span>FABRIC / ORIGIN FEATURE PILL</span>
                        </label>

                        {/* ON/OFF TOGGLE SWITCH BUTTON (बटन चालू / बंद) */}
                        <button
                          type="button"
                          onClick={() => handleToggleSlidePill('featurePill')}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
                            currentActiveSlide.showFeaturePill !== false
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/30'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700 ring-1 ring-slate-300'
                          }`}
                          title="Click to Turn ON / OFF (चालू या बंद करें)"
                        >
                          {currentActiveSlide.showFeaturePill !== false ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              <span>चालू (ON)</span>
                              <ToggleRight className="w-4 h-4 ml-0.5" />
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              <span>बंद (OFF)</span>
                              <ToggleLeft className="w-4 h-4 ml-0.5 text-slate-500" />
                            </>
                          )}
                        </button>
                      </div>

                      <input
                        type="text"
                        value={currentActiveSlide.featurePill}
                        onChange={(e) =>
                          handleUpdateSlideField('featurePill', e.target.value)
                        }
                        placeholder="e.g. EMBROIDERED ETHNIC WEAR"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          currentActiveSlide.showFeaturePill !== false
                            ? 'bg-white border border-sky-300 text-slate-900 shadow-soft-sm focus:ring-2 focus:ring-sky-500'
                            : 'bg-slate-100 border border-dashed border-slate-300 text-slate-400 line-through'
                        }`}
                      />

                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <span
                          className={`font-semibold ${
                            currentActiveSlide.showFeaturePill !== false
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {currentActiveSlide.showFeaturePill !== false
                            ? '🟢 Button चालू Hai: Storefront banner par frosted feature pill dikhega'
                            : '⚪ Button बंद Hai: Storefront banner se hide kar diya gaya hai'}
                        </span>
                        <span className="text-slate-400 font-mono">
                          showFeaturePill: {String(currentActiveSlide.showFeaturePill !== false)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ROW 2: HEADLINE LINE 1 & HEADLINE LINE 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[11px] font-extrabold tracking-wider text-slate-700 uppercase block mb-1.5">
                        HEADLINE (LINE 1 WHITE)
                      </label>
                      <input
                        type="text"
                        value={currentActiveSlide.headline1}
                        onChange={(e) =>
                          handleUpdateSlideField('headline1', e.target.value)
                        }
                        placeholder="e.g. HAPPY"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-extrabold text-sm text-slate-900 bg-white focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold tracking-wider text-amber-700 uppercase block mb-1.5">
                        HEADLINE (LINE 2 GOLD HIGHLIGHT)
                      </label>
                      <input
                        type="text"
                        value={currentActiveSlide.headline2}
                        onChange={(e) =>
                          handleUpdateSlideField('headline2', e.target.value)
                        }
                        placeholder="e.g. DIWALI"
                        className="w-full px-3.5 py-2.5 border border-amber-300 rounded-xl font-extrabold text-sm text-amber-900 bg-amber-50/30 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* ROW 3: SLIDE EDITORIAL DESCRIPTION SUBTEXT */}
                  <div>
                    <label className="text-[11px] font-extrabold tracking-wider text-slate-700 uppercase block mb-1.5">
                      SLIDE EDITORIAL DESCRIPTION SUBTEXT
                    </label>
                    <textarea
                      rows={3}
                      value={currentActiveSlide.description}
                      onChange={(e) =>
                        handleUpdateSlideField('description', e.target.value)
                      }
                      placeholder="Celebrate the Festival of Lights with elegant ethnic styles..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white focus:ring-2 focus:ring-brand-500 leading-relaxed"
                    />
                  </div>

                  {/* ROW 4: PRIMARY & SECONDARY CTA BUTTON LABELS WITH DEDICATED ON/OFF (BAND / CHALU) TOGGLES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* 1. PRIMARY CTA BUTTON LABEL */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        currentActiveSlide.showCta !== false
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-extrabold tracking-wider text-slate-800 uppercase flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>PRIMARY CTA BUTTON LABEL</span>
                        </label>

                        {/* ON/OFF TOGGLE SWITCH BUTTON (बटन चालू / बंद) */}
                        <button
                          type="button"
                          onClick={() => handleToggleSlidePill('cta')}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
                            currentActiveSlide.showCta !== false
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/30'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700 ring-1 ring-slate-300'
                          }`}
                          title="Click to Turn ON / OFF (चालू या बंद करें)"
                        >
                          {currentActiveSlide.showCta !== false ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              <span>चालू (ON)</span>
                              <ToggleRight className="w-4 h-4 ml-0.5" />
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              <span>बंद (OFF)</span>
                              <ToggleLeft className="w-4 h-4 ml-0.5 text-slate-500" />
                            </>
                          )}
                        </button>
                      </div>

                      <input
                        type="text"
                        value={currentActiveSlide.ctaText || ''}
                        onChange={(e) =>
                          handleUpdateSlideField('ctaText', e.target.value)
                        }
                        placeholder="e.g. SHOP MEN"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          currentActiveSlide.showCta !== false
                            ? 'bg-white border border-amber-300 text-slate-900 shadow-soft-sm focus:ring-2 focus:ring-amber-500'
                            : 'bg-slate-100 border border-dashed border-slate-300 text-slate-400 line-through'
                        }`}
                      />

                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <span
                          className={`font-semibold ${
                            currentActiveSlide.showCta !== false
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {currentActiveSlide.showCta !== false
                            ? '🟢 Button चालू Hai: Storefront banner par Primary CTA button dikhega'
                            : '⚪ Button बंद Hai: Storefront banner se Primary button hide kar diya gaya hai'}
                        </span>
                        <span className="text-slate-400 font-mono">
                          showCta: {String(currentActiveSlide.showCta !== false)}
                        </span>
                      </div>
                    </div>

                    {/* 2. SECONDARY CTA BUTTON LABEL */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        currentActiveSlide.showSecondaryCta !== false
                          ? 'bg-sky-50/40 border-sky-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-extrabold tracking-wider text-slate-800 uppercase flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-sky-600" />
                          <span>SECONDARY CTA BUTTON LABEL</span>
                        </label>

                        {/* ON/OFF TOGGLE SWITCH BUTTON (बटन चालू / बंद) */}
                        <button
                          type="button"
                          onClick={() => handleToggleSlidePill('secondaryCta')}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
                            currentActiveSlide.showSecondaryCta !== false
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/30'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700 ring-1 ring-slate-300'
                          }`}
                          title="Click to Turn ON / OFF (चालू या बंद करें)"
                        >
                          {currentActiveSlide.showSecondaryCta !== false ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              <span>चालू (ON)</span>
                              <ToggleRight className="w-4 h-4 ml-0.5" />
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              <span>बंद (OFF)</span>
                              <ToggleLeft className="w-4 h-4 ml-0.5 text-slate-500" />
                            </>
                          )}
                        </button>
                      </div>

                      <input
                        type="text"
                        value={currentActiveSlide.secondaryCtaText || ''}
                        onChange={(e) =>
                          handleUpdateSlideField('secondaryCtaText', e.target.value)
                        }
                        placeholder="e.g. SHOP COLLECTION"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          currentActiveSlide.showSecondaryCta !== false
                            ? 'bg-white border border-sky-300 text-slate-900 shadow-soft-sm focus:ring-2 focus:ring-sky-500'
                            : 'bg-slate-100 border border-dashed border-slate-300 text-slate-400 line-through'
                        }`}
                      />

                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <span
                          className={`font-semibold ${
                            currentActiveSlide.showSecondaryCta !== false
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {currentActiveSlide.showSecondaryCta !== false
                            ? '🟢 Button चालू Hai: Storefront banner par Secondary button dikhega'
                            : '⚪ Button बंद Hai: Storefront banner se Secondary button hide kar diya gaya hai'}
                        </span>
                        <span className="text-slate-400 font-mono">
                          showSecondaryCta: {String(currentActiveSlide.showSecondaryCta !== false)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ROW 5: SLIDE BACKGROUND PHOTO */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <label className="text-[11px] font-extrabold tracking-wider text-slate-700 uppercase block">
                      SLIDE BACKGROUND PHOTO
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={currentActiveSlide.image}
                        onChange={(e) =>
                          handleUpdateSlideField('image', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-white"
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 pt-1">
                      <span>Presets:</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSlideField(
                            'image',
                            '/images/ethnic-silk-care.jpg'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold"
                      >
                        Diwali Ethnic
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSlideField(
                            'image',
                            '/images/storefront-exterior.jpg'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold"
                      >
                        Storefront Flagship
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSlideField(
                            'image',
                            '/images/industrial-washer.jpg'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold"
                      >
                        Rotary Plant
                      </button>
                    </div>
                  </div>

                  {/* =========================================================================
                      🌟 LIVE REAL-TIME STOREFRONT PREVIEW CARD (SEE EXACT ON/OFF STATUS)
                  ========================================================================= */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-brand-600" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                          Live Storefront Real-Time Preview
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Shows exactly how it renders to customers on the homepage
                      </span>
                    </div>

                    <div className="relative rounded-3xl overflow-hidden bg-slate-950 p-6 sm:p-8 text-white border border-amber-500/30 shadow-xl">
                      {/* Background with Dark Vignette */}
                      <div className="absolute inset-0">
                        <img
                          src={currentActiveSlide.image}
                          alt="Preview"
                          className="w-full h-full object-cover object-center filter brightness-[0.35]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
                      </div>

                      <div className="relative z-10 max-w-2xl space-y-4">
                        {/* Live Pill Badges Row with Visual State */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Top Pill Preview */}
                          {currentActiveSlide.showTopPill !== false ? (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              <span>{currentActiveSlide.topPill}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-semibold backdrop-blur-sm">
                              <X className="w-3 h-3 text-rose-400" />
                              <span>Top Pill: बंद (OFF) - Hidden from Customer</span>
                            </span>
                          )}

                          {/* Feature Pill Preview */}
                          {currentActiveSlide.showFeaturePill !== false ? (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold uppercase tracking-wider">
                              <Sparkles className="w-3 h-3 text-yellow-300" />
                              <span>{currentActiveSlide.featurePill}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-semibold backdrop-blur-sm">
                              <X className="w-3 h-3 text-rose-400" />
                              <span>Feature Pill: बंद (OFF) - Hidden from Customer</span>
                            </span>
                          )}
                        </div>

                        {/* Headlines */}
                        <div className="space-y-0.5">
                          <div className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md">
                            {currentActiveSlide.headline1}
                          </div>
                          <div className="text-2xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent uppercase drop-shadow-lg">
                            {currentActiveSlide.headline2}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed max-w-xl">
                          {currentActiveSlide.description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          {currentActiveSlide.showCta !== false ? (
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1.5 pointer-events-none"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                              <span>{currentActiveSlide.ctaText || 'SHOP MEN'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-semibold backdrop-blur-sm">
                              <X className="w-3 h-3 text-rose-400" />
                              <span>Primary CTA: बंद (OFF) - Hidden from Customer</span>
                            </span>
                          )}

                          {currentActiveSlide.showSecondaryCta !== false ? (
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs border border-white/20 backdrop-blur-md pointer-events-none"
                            >
                              <span>{currentActiveSlide.secondaryCtaText || 'SHOP COLLECTION'}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-semibold backdrop-blur-sm">
                              <X className="w-3 h-3 text-rose-400" />
                              <span>Secondary CTA: बंद (OFF) - Hidden from Customer</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SAVE CHANGES BAR */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Changes are saved directly to your live system &amp; browser cache.</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setCmsForm({
                            ...cmsForm,
                            activeHeroSlideId: currentActiveSlide.id,
                          });
                          updateCMS({
                            ...cmsForm,
                            activeHeroSlideId: currentActiveSlide.id,
                          });
                          showToast(
                            `Slide "${currentActiveSlide.headline1} ${currentActiveSlide.headline2}" set as Primary on Storefront!`,
                            'success'
                          );
                        }}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                      >
                        Set as Homepage Primary Slide
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateCMS(cmsForm);
                          showToast('CMS Content & Slide Buttons Saved Live!', 'success');
                        }}
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all transform hover:-translate-y-0.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save All CMS Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* GENERAL WEBSITE TEXT & POLICIES (ACCORDION) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Storewide Announcement &amp; General Text
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Top Announcement Bar (Shown in Header)
                    </label>
                    <input
                      type="text"
                      value={cmsForm.announcementBar}
                      onChange={(e) =>
                        setCmsForm({ ...cmsForm, announcementBar: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Fallback Homepage Headline
                    </label>
                    <input
                      type="text"
                      value={cmsForm.heroHeadline}
                      onChange={(e) =>
                        setCmsForm({ ...cmsForm, heroHeadline: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Fallback Hero Subheadline
                    </label>
                    <textarea
                      rows={2}
                      value={cmsForm.heroSubheadline}
                      onChange={(e) =>
                        setCmsForm({ ...cmsForm, heroSubheadline: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>
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
                    <span className="font-bold text-sky-900 block text-sm">The Laundry Lounge (Branch 1 - Arun Nagar)</span>
                    <p className="text-slate-700">Near Gaytri School Arun Nagar, Rewa (M. P.)</p>
                    <p className="text-sky-700 font-semibold pt-1">Phone: 9893733683 / 9329838804</p>
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

              {/* DANGER ZONE / FACTORY RESET */}
              <div className="mt-8 pt-6 border-t border-rose-100 bg-rose-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-rose-800 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Danger Zone: Factory Reset &amp; Erase All Data</span>
                    </h4>
                    <p className="text-xs text-rose-600/80 mt-0.5">
                      Wipes all stored orders, invoices, parties, ledger entries, expenses, customer dues, and browser cache.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFactoryResetModal(true)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-sm whitespace-nowrap self-start sm:self-auto transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Erase All Data</span>
                  </button>
                </div>
              </div>
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

              {/* Service Garment Photo Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5 text-brand-600" />
                    <span>Garment Photo</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Preview &amp; Upload</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative">
                    <img
                      src={serviceForm.image}
                      alt="Garment Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <input
                      type="file"
                      id="edit-modal-image-file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const { dataUrl } = await compressImageFile(file, 600, 600, 0.82);
                          setServiceForm({ ...serviceForm, image: dataUrl });
                          showToast('Photo selected from device!', 'success');
                        } catch (err) {
                          showToast('Failed to process image', 'error');
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="edit-modal-image-file"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-[11px] font-bold cursor-pointer transition-all border border-brand-200 active:scale-95"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Photo from Device</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={serviceForm.image}
                      onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
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
                  <option value="The Laundry Lounge">1. The Laundry Lounge</option>
                  <option value="Hari Om Laundry">2. Hari Om Laundry</option>
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
                  {existingCustomerDue > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                        <span className="text-amber-600 font-extrabold text-sm">⚠️</span>
                        <span>Previous Due: ₹{existingCustomerDue}</span>
                      </div>
                      <label className="flex items-center space-x-1 text-slate-700 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={posIncludeDue}
                          onChange={(e) => setPosIncludeDue(e.target.checked)}
                          className="w-4 h-4 text-sky-600 rounded"
                        />
                        <span className="text-[11px]">Add to Bill</span>
                      </label>
                    </div>
                  )}
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

                {/* Quick Search Garments */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={posSearchQuery}
                    onChange={(e) => setPosSearchQuery(e.target.value)}
                    placeholder="Search garment or service (e.g. Shirt, Blazer, Curtains...)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                  />
                  {posSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPosSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-2xl p-2 divide-y divide-slate-100 bg-slate-50/50">
                  {services
                    .filter(
                      (s) =>
                        s.active &&
                        (!posSearchQuery.trim() ||
                          s.name.toLowerCase().includes(posSearchQuery.toLowerCase()))
                    )
                    .map((svc) => {
                      const count = posItems[svc.id] || 0;
                      const currentPrice =
                        posCustomPrices[svc.id] !== undefined ? posCustomPrices[svc.id] : svc.price;
                      const isPriceEdited =
                        posCustomPrices[svc.id] !== undefined && posCustomPrices[svc.id] !== svc.price;

                      return (
                        <div
                          key={svc.id}
                          className="py-2.5 px-2 flex items-center justify-between hover:bg-white rounded-xl transition-colors gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 text-xs truncate">{svc.name}</div>
                            {/* Editable Price Input Option */}
                            <div className="flex items-center space-x-1.5 mt-1">
                              <span className="text-[11px] font-bold text-slate-500">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={currentPrice}
                                onChange={(e) => {
                                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                                  setPosCustomPrices((prev) => ({ ...prev, [svc.id]: val }));
                                }}
                                className={`w-16 px-1.5 py-0.5 text-xs font-bold rounded-lg border text-center transition-colors ${
                                  isPriceEdited
                                    ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400'
                                    : 'bg-white border-slate-300 text-slate-800'
                                }`}
                                title="Edit rate per item for this bill"
                              />
                              <span className="text-[10px] text-slate-500">/ {svc.unit}</span>
                              {isPriceEdited && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPosCustomPrices((prev) => {
                                      const copy = { ...prev };
                                      delete copy[svc.id];
                                      return copy;
                                    });
                                  }}
                                  className="text-[10px] font-semibold text-amber-600 hover:underline"
                                  title="Reset to default rate"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdatePosItem(svc.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-sm hover:bg-slate-100 transition-colors"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-black text-slate-900 text-xs">
                              {count}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdatePosItem(svc.id, 1)}
                              className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm hover:bg-sky-700 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Turnaround Speed */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Turnaround Speed</label>
                <select
                  value={posDeliveryMode}
                  onChange={(e) => setPosDeliveryMode(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="standard">Standard Care (48 Hours)</option>
                  <option value="express">⚡ Express Next-Day (24 Hours)</option>
                </select>
              </div>

              {/* 💰 CUSTOM AMOUNT & PAYMENT SPLIT SECTION */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs">
                    💰 Payment &amp; Split Mode
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Garments: <span className="font-bold text-slate-900">₹{posItemsTotal}</span>
                    {applicableDue > 0 && (
                      <span className="text-amber-700 font-bold"> + Previous Due: ₹{applicableDue}</span>
                    )}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setPosCashPaid(posGrandTotal.toString());
                      setPosOnlinePaid('0');
                    }}
                    className="py-1 px-1 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg text-emerald-700 text-center"
                  >
                    💵 Full Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPosOnlinePaid(posGrandTotal.toString());
                      setPosCashPaid('0');
                    }}
                    className="py-1 px-1 bg-white border border-slate-200 hover:border-sky-500 rounded-lg text-sky-700 text-center"
                  >
                    📱 Full UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const half = Math.round(posGrandTotal / 2);
                      setPosCashPaid(half.toString());
                      setPosOnlinePaid((posGrandTotal - half).toString());
                    }}
                    className="py-1 px-1 bg-white border border-slate-200 hover:border-purple-500 rounded-lg text-purple-700 text-center"
                  >
                    ⚖️ 50-50 Split
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPosCashPaid('0');
                      setPosOnlinePaid('0');
                    }}
                    className="py-1 px-1 bg-white border border-slate-200 hover:border-rose-500 rounded-lg text-rose-700 text-center"
                  >
                    📝 Full Due
                  </button>
                </div>

                {/* Inputs for Cash and Online */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      💵 Cash Paid Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={posCashPaid}
                        onChange={(e) => setPosCashPaid(e.target.value)}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      📱 Online / UPI Paid Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={posOnlinePaid}
                        onChange={(e) => setPosOnlinePaid(e.target.value)}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown summary */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div>
                    <span className="text-slate-500 text-[11px]">Total Received:</span>{' '}
                    <span className="font-extrabold text-emerald-700">₹{currentTotalPaid}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Remaining Due:</span>{' '}
                    <span className={`font-extrabold ${remainingUdharDue > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      ₹{remainingUdharDue}
                    </span>
                  </div>
                  {remainingUdharDue > 0 ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      ⚠️ ₹{remainingUdharDue} will be added to Customer Khata
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✅ Fully Settled
                    </span>
                  )}
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
                  <span className="text-[11px] text-slate-500 font-bold block">
                    Net Payable Total
                  </span>
                  <div className="text-2xl font-black text-slate-900">
                    ₹{posGrandTotal.toFixed(0)}
                    {applicableDue > 0 && (
                      <span className="text-xs font-normal text-slate-500 ml-2">
                        (₹{posItemsTotal} + ₹{applicableDue} previous)
                      </span>
                    )}
                  </div>
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

      {/* QUICK SERVICE IMAGE CHANGE MODAL */}
      <ChangeServiceImageModal
        isOpen={!!imageModalService}
        onClose={() => setImageModalService(null)}
        service={imageModalService}
        onSave={(serviceId, newImageUrl) => {
          updateService(serviceId, { image: newImageUrl });
          showToast('Service garment image updated!', 'success');
        }}
      />

      {/* FACTORY RESET & ERASE ALL DATA CONFIRMATION MODAL */}
      {showFactoryResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-5">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Confirm Factory Reset?</h4>
                <p className="text-xs text-slate-500">This action is permanent and cannot be undone</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-4 text-xs text-rose-900 space-y-2">
              <p className="font-bold text-rose-800">The following records will be permanently erased:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-700">
                <li>All GST invoices, quotations, sales orders &amp; purchase bills</li>
                <li>All parties (customers, suppliers, party khata balances)</li>
                <li>Authoritative stock ledger &amp; warehouse inventory</li>
                <li>Double-entry chart of accounts &amp; journal postings</li>
                <li>All e-commerce customer orders, cart, and delivery statuses</li>
                <li>All browser local storage under the platform prefixes</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFactoryResetModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFactoryResetAll}
                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md active:scale-95 flex items-center space-x-1.5 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Erase Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
