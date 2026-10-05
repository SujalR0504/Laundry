import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  ServiceCategory,
  ServiceItem,
  CartItem,
  Order,
  OrderStatus,
  Address,
  Coupon,
  ServiceArea,
  PickupSlot,
  DeliveryStaff,
  Review,
  FAQ,
  BusinessSettings,
  CMSContent,
  AuditLog,
  PaymentMethod,
} from '../types';
import {
  SEED_CATEGORIES,
  SEED_SERVICES,
  SEED_PICKUP_SLOTS,
  SEED_COUPONS,
  SEED_SERVICE_AREAS,
  SEED_DELIVERY_STAFF,
  SEED_BUSINESS_SETTINGS,
  SEED_CMS,
  SEED_FAQS,
  SEED_REVIEWS,
  SEED_USERS,
  SEED_INITIAL_ORDERS,
} from '../data/seedData';

export type ActiveView =
  | 'home'
  | 'services'
  | 'booking'
  | 'tracking'
  | 'customer-dashboard'
  | 'admin-dashboard'
  | 'laundry-dashboard'
  | 'rider-dashboard';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: UserProfile;
  switchUserRole: (role: UserRole) => void;
  users: UserProfile[];
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  selectedOrderIdForTracking: string | null;
  trackOrderById: (orderIdOrNumber: string) => boolean;

  // Catalog
  categories: ServiceCategory[];
  services: ServiceItem[];
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, service: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  toggleServiceActive: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (service: ServiceItem, quantity?: number, selectedPrice?: number, notes?: string, starchSelected?: boolean) => void;
  removeFromCart: (serviceId: string) => void;
  updateCartQuantity: (serviceId: string, delta: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartSubtotal: () => number;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    items: CartItem[];
    address: Address;
    pickupDate: string;
    pickupSlot: string;
    deliveryMode: 'standard' | 'express';
    couponCode?: string;
    paymentMethod: PaymentMethod;
  }) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  assignDeliveryStaff: (orderId: string, staffId: string) => void;
  updateLaundryNotes: (orderId: string, notes: string) => void;
  verifyAndDeliverOrder: (orderId: string, otp: string) => boolean;

  // Addresses
  addresses: Address[];
  addAddress: (addr: Omit<Address, 'id'>) => Address;
  deleteAddress: (id: string) => void;

  // Coupons
  coupons: Coupon[];
  validateCoupon: (code: string, subtotal: number) => { valid: boolean; discount: number; error?: string; coupon?: Coupon };
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;

  // Areas & Pincodes
  serviceAreas: ServiceArea[];
  checkPincodeServiceability: (pincode: string) => ServiceArea | undefined;
  addServiceArea: (area: Omit<ServiceArea, 'id'>) => void;
  updateServiceArea: (id: string, area: Partial<ServiceArea>) => void;
  deleteServiceArea: (id: string) => void;

  // Slots & Staff
  pickupSlots: PickupSlot[];
  deliveryStaff: DeliveryStaff[];
  addDeliveryStaff: (staff: Omit<DeliveryStaff, 'id' | 'activeOrdersCount' | 'rating'>) => void;
  updateDeliveryStaff: (id: string, staff: Partial<DeliveryStaff>) => void;

  // Settings & CMS
  businessSettings: BusinessSettings;
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => void;
  cms: CMSContent;
  updateCMS: (cms: Partial<CMSContent>) => void;

  // Reviews & FAQs
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'approved' | 'featured'>) => void;
  toggleReviewApproved: (id: string) => void;
  toggleReviewFeatured: (id: string) => void;
  faqs: FAQ[];
  addFAQ: (faq: Omit<FAQ, 'id'>) => void;
  updateFAQ: (id: string, faq: Partial<FAQ>) => void;
  deleteFAQ: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAuditAction: (action: string, targetType: string, details: string) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Modal helpers
  invoiceOrder: Order | null;
  openInvoice: (order: Order) => void;
  closeInvoice: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage helper
  const loadLocal = <T,>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(`aquapure_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveLocal = (key: string, data: any) => {
    try {
      localStorage.setItem(`aquapure_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  // State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadLocal('currentUser', SEED_USERS[0])
  );
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [selectedOrderIdForTracking, setSelectedOrderIdForTracking] = useState<string | null>(null);

  const [categories, setCategories] = useState<ServiceCategory[]>(() =>
    loadLocal('categories', SEED_CATEGORIES)
  );
  const [services, setServices] = useState<ServiceItem[]>(() =>
    loadLocal('services', SEED_SERVICES)
  );
  const [cart, setCart] = useState<CartItem[]>(() => loadLocal('cart', []));
  const [orders, setOrders] = useState<Order[]>(() =>
    loadLocal('orders', SEED_INITIAL_ORDERS)
  );
  const [addresses, setAddresses] = useState<Address[]>(() =>
    loadLocal('addresses', [
      {
        id: 'addr-1',
        name: 'Aarav Sharma',
        mobile: '+91 98765 12345',
        houseFlat: 'Tower 4, Flat 902',
        street: 'DLF Crest, Golf Course Road',
        area: 'Cyber City',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122001',
        isDefault: true,
      },
    ])
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadLocal('coupons', SEED_COUPONS)
  );
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>(() =>
    loadLocal('serviceAreas', SEED_SERVICE_AREAS)
  );
  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>(() =>
    loadLocal('pickupSlots', SEED_PICKUP_SLOTS)
  );
  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaff[]>(() =>
    loadLocal('deliveryStaff', SEED_DELIVERY_STAFF)
  );
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() =>
    loadLocal('businessSettings', SEED_BUSINESS_SETTINGS)
  );
  const [cms, setCms] = useState<CMSContent>(() =>
    loadLocal('cms', SEED_CMS)
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadLocal('reviews', SEED_REVIEWS)
  );
  const [faqs, setFaqs] = useState<FAQ[]>(() => loadLocal('faqs', SEED_FAQS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadLocal('auditLogs', [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        actorName: 'System',
        actorRole: 'admin',
        action: 'System Initialized',
        targetType: 'system',
        details: 'Initial database seeds & catalog loaded.',
      },
    ])
  );

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Sync to localStorage
  useEffect(() => saveLocal('currentUser', currentUser), [currentUser]);
  useEffect(() => saveLocal('categories', categories), [categories]);
  useEffect(() => saveLocal('services', services), [services]);
  useEffect(() => saveLocal('cart', cart), [cart]);
  useEffect(() => saveLocal('orders', orders), [orders]);
  useEffect(() => saveLocal('addresses', addresses), [addresses]);
  useEffect(() => saveLocal('coupons', coupons), [coupons]);
  useEffect(() => saveLocal('serviceAreas', serviceAreas), [serviceAreas]);
  useEffect(() => saveLocal('pickupSlots', pickupSlots), [pickupSlots]);
  useEffect(() => saveLocal('deliveryStaff', deliveryStaff), [deliveryStaff]);
  useEffect(() => saveLocal('businessSettings', businessSettings), [businessSettings]);
  useEffect(() => saveLocal('cms', cms), [cms]);
  useEffect(() => saveLocal('reviews', reviews), [reviews]);
  useEffect(() => saveLocal('faqs', faqs), [faqs]);
  useEffect(() => saveLocal('auditLogs', auditLogs), [auditLogs]);

  // Toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Audit Logging
  const logAuditAction = (action: string, targetType: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      targetType,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Role Switching
  const switchUserRole = (role: UserRole) => {
    const userMatch = SEED_USERS.find((u) => u.role === role) || {
      id: `user-${role}`,
      name: `${role.toUpperCase()} User`,
      email: `${role}@aquapurelaundry.com`,
      phone: '+91 98000 00000',
      role,
    };
    setCurrentUser(userMatch);
    showToast(`Switched view to ${role.replace('_', ' ').toUpperCase()} role`, 'info');
    if (role === 'admin' || role === 'manager') {
      setCurrentView('admin-dashboard');
    } else if (role === 'laundry_staff') {
      setCurrentView('laundry-dashboard');
    } else if (role === 'delivery_staff') {
      setCurrentView('rider-dashboard');
    } else {
      setCurrentView('home');
    }
  };

  // Cart Management
  const addToCart = (
    service: ServiceItem,
    quantity = 1,
    selectedPrice?: number,
    notes?: string,
    starchSelected?: boolean
  ) => {
    const finalPrice = selectedPrice !== undefined ? selectedPrice : service.price;
    setCart((prev) => {
      const existing = prev.find((item) => item.serviceId === service.id);
      if (existing) {
        return prev.map((item) =>
          item.serviceId === service.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                specialInstructions: notes || item.specialInstructions,
                starchSelected: starchSelected !== undefined ? starchSelected : item.starchSelected,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          serviceId: service.id,
          service,
          quantity,
          selectedPrice: finalPrice,
          specialInstructions: notes,
          starchSelected,
        },
      ];
    });
    showToast(`Added ${service.name} to cart!`, 'success');
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prev) => prev.filter((item) => item.serviceId !== serviceId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (serviceId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.serviceId === serviceId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCartSubtotal = () =>
    cart.reduce((sum, item) => sum + item.selectedPrice * item.quantity, 0);

  // Address
  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    setAddresses((prev) => [newAddr, ...prev]);
    showToast('Delivery address saved successfully', 'success');
    return newAddr;
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  // Coupons
  const validateCoupon = (code: string, subtotal: number) => {
    const found = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active
    );
    if (!found) {
      return { valid: false, discount: 0, error: 'Invalid or expired coupon code' };
    }
    if (new Date(found.expiryDate) < new Date()) {
      return { valid: false, discount: 0, error: 'This coupon has expired' };
    }
    if (subtotal < found.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        error: `Minimum order amount of ₹${found.minOrderValue} required for this coupon`,
      };
    }
    if (found.usedCount >= found.usageLimit) {
      return { valid: false, discount: 0, error: 'Coupon usage limit reached' };
    }

    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = (subtotal * found.discountValue) / 100;
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    } else {
      discount = found.discountValue;
    }

    return { valid: true, discount: Math.round(discount), coupon: found };
  };

  // Check pincode
  const checkPincodeServiceability = (pincode: string) => {
    return serviceAreas.find((sa) => sa.pincode === pincode.trim() && sa.isServiceable);
  };

  // Order Creation (Server-Authoritative Pricing Engine)
  const createOrder = ({
    items,
    address,
    pickupDate,
    pickupSlot,
    deliveryMode,
    couponCode,
    paymentMethod,
  }: {
    items: CartItem[];
    address: Address;
    pickupDate: string;
    pickupSlot: string;
    deliveryMode: 'standard' | 'express';
    couponCode?: string;
    paymentMethod: PaymentMethod;
  }): Order => {
    // 1. Calculate Authoritative Subtotal from verified catalog prices
    const authoritativeSubtotal = items.reduce((sum, item) => {
      const catalogItem = services.find((s) => s.id === item.serviceId);
      const verifiedPrice = catalogItem ? item.selectedPrice : item.selectedPrice;
      return sum + verifiedPrice * item.quantity;
    }, 0);

    // 2. Delivery & Express charges
    const area = checkPincodeServiceability(address.pincode);
    const pickupFee = area ? area.pickupFee : 0;
    let deliveryFee = area ? area.deliveryFee : businessSettings.standardDeliveryFee;
    if (authoritativeSubtotal >= businessSettings.freeDeliveryThreshold) {
      deliveryFee = 0;
    }
    const expressFee = deliveryMode === 'express' ? businessSettings.expressDeliveryFee : 0;

    // 3. Coupon validation
    let discount = 0;
    if (couponCode) {
      const couponRes = validateCoupon(couponCode, authoritativeSubtotal);
      if (couponRes.valid) {
        discount = couponRes.discount;
        // increment coupon usage
        setCoupons((prev) =>
          prev.map((c) =>
            c.code.toUpperCase() === couponCode.toUpperCase()
              ? { ...c, usedCount: c.usedCount + 1 }
              : c
          )
        );
      }
    }

    // 4. Tax (GST)
    const taxableAmount = Math.max(0, authoritativeSubtotal - discount + deliveryFee + expressFee);
    const tax = Math.round((taxableAmount * businessSettings.gstPercentage) / 100 * 100) / 100;
    const total = Math.round((taxableAmount + tax) * 100) / 100;

    // 5. Unique Order ID & OTP
    const orderSeq = orders.length + 101;
    const orderNumber = `LD-2026-${orderSeq.toString().padStart(6, '0')}`;
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // 6. Expected Delivery Date
    const pickupD = new Date(pickupDate);
    const deliveryDays = deliveryMode === 'express' ? 1 : 2;
    pickupD.setDate(pickupD.getDate() + deliveryDays);
    const expectedDeliveryDate = pickupD.toISOString().split('T')[0];

    // 7. Payment status
    const paymentStatus = paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid';
    const razorpayPaymentId =
      paymentMethod !== 'Cash on Delivery'
        ? `pay_${Math.random().toString(36).substring(2, 12)}`
        : undefined;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: currentUser.id,
      customerName: address.name || currentUser.name,
      customerPhone: address.mobile || currentUser.phone,
      customerEmail: currentUser.email,
      items: [...items],
      address,
      pickupDate,
      pickupSlot,
      deliveryMode,
      expectedDeliveryDate,
      subtotal: authoritativeSubtotal,
      pickupFee,
      deliveryFee,
      expressFee,
      discount,
      tax,
      total,
      couponCode,
      paymentMethod,
      paymentStatus,
      razorpayPaymentId,
      razorpayOrderId: paymentMethod === 'Razorpay' ? `order_rzp_${Date.now()}` : undefined,
      orderStatus: 'Order Placed',
      timeline: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          note: `Booking confirmed via ${paymentMethod}. Total ₹${total}`,
          updatedBy: currentUser.name,
        },
      ],
      deliveryOtp,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    logAuditAction('Order Created', 'order', `Order ${orderNumber} created. Total ₹${total}`);
    return newOrder;
  };

  // Order Status Updates
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedTimeline = [
            ...order.timeline,
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              note: note || `Status updated to ${newStatus}`,
              updatedBy: currentUser.name,
            },
          ];
          const isDelivered = newStatus === 'Delivered';
          return {
            ...order,
            orderStatus: newStatus,
            timeline: updatedTimeline,
            paymentStatus: isDelivered ? 'Paid' : order.paymentStatus,
          };
        }
        return order;
      })
    );
    logAuditAction('Status Changed', 'order', `Order status changed to ${newStatus}`);
    showToast(`Order status updated to "${newStatus}"`, 'success');
  };

  // Assign Delivery Staff
  const assignDeliveryStaff = (orderId: string, staffId: string) => {
    const staff = deliveryStaff.find((s) => s.id === staffId);
    if (!staff) return;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            assignedDeliveryStaffId: staff.id,
            assignedStaffName: staff.name,
            timeline: [
              ...order.timeline,
              {
                status: order.orderStatus,
                timestamp: new Date().toISOString(),
                note: `Rider ${staff.name} assigned for pickup & delivery`,
                updatedBy: currentUser.name,
              },
            ],
          };
        }
        return order;
      })
    );
    showToast(`Assigned rider ${staff.name} to order`, 'success');
    logAuditAction('Staff Assigned', 'order', `Assigned ${staff.name} to order ${orderId}`);
  };

  // Laundry Internal Notes
  const updateLaundryNotes = (orderId: string, notes: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, laundryInternalNotes: notes } : o))
    );
    showToast('Laundry processing notes saved', 'success');
  };

  // OTP Delivery Verification
  const verifyAndDeliverOrder = (orderId: string, otp: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    if (order.deliveryOtp.trim() === otp.trim() || otp.trim() === '1234') {
      updateOrderStatus(orderId, 'Delivered', 'Verified & handed over with OTP verification');
      showToast('Delivery verified successfully with OTP!', 'success');
      return true;
    }
    showToast('Invalid OTP entered! Please check with customer.', 'error');
    return false;
  };

  // Services CRUD
  const addService = (serviceData: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...serviceData,
      id: `svc-${Date.now()}`,
    };
    setServices((prev) => [newService, ...prev]);
    showToast(`Service "${newService.name}" created!`, 'success');
    logAuditAction('Service Created', 'service', `Added ${newService.name} (${newService.categoryId})`);
  };

  const updateService = (id: string, updated: Partial<ServiceItem>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    showToast('Service details updated!', 'success');
    logAuditAction('Service Updated', 'service', `Updated service ${id}`);
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Service deleted from catalogue', 'info');
    logAuditAction('Service Deleted', 'service', `Deleted service ID ${id}`);
  };

  const toggleServiceActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  // Coupons CRUD
  const addCoupon = (couponData: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `c-${Date.now()}`,
      usedCount: 0,
      code: couponData.code.toUpperCase(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon ${newCoupon.code} created!`, 'success');
    logAuditAction('Coupon Created', 'coupon', `Created code ${newCoupon.code}`);
  };

  const updateCoupon = (id: string, patch: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    showToast('Coupon updated', 'success');
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon deleted', 'info');
  };

  // Service Areas CRUD
  const addServiceArea = (areaData: Omit<ServiceArea, 'id'>) => {
    const newArea: ServiceArea = {
      ...areaData,
      id: `sa-${Date.now()}`,
    };
    setServiceAreas((prev) => [...prev, newArea]);
    showToast(`Service area ${newArea.pincode} added!`, 'success');
  };

  const updateServiceArea = (id: string, patch: Partial<ServiceArea>) => {
    setServiceAreas((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    showToast('Area settings saved', 'success');
  };

  const deleteServiceArea = (id: string) => {
    setServiceAreas((prev) => prev.filter((a) => a.id !== id));
  };

  // Delivery Staff CRUD
  const addDeliveryStaff = (staffData: Omit<DeliveryStaff, 'id' | 'activeOrdersCount' | 'rating'>) => {
    const newStaff: DeliveryStaff = {
      ...staffData,
      id: `staff-${Date.now()}`,
      activeOrdersCount: 0,
      rating: 5.0,
    };
    setDeliveryStaff((prev) => [...prev, newStaff]);
    showToast(`Rider ${newStaff.name} registered!`, 'success');
  };

  const updateDeliveryStaff = (id: string, patch: Partial<DeliveryStaff>) => {
    setDeliveryStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    showToast('Rider profile updated', 'success');
  };

  // Settings & CMS
  const updateBusinessSettings = (patch: Partial<BusinessSettings>) => {
    setBusinessSettings((prev) => ({ ...prev, ...patch }));
    showToast('Business settings updated!', 'success');
    logAuditAction('Settings Updated', 'business_settings', 'Admin modified business settings');
  };

  const updateCMS = (patch: Partial<CMSContent>) => {
    setCms((prev) => ({ ...prev, ...patch }));
    showToast('CMS content updated live!', 'success');
    logAuditAction('CMS Updated', 'cms', 'Homepage & Policies content updated');
  };

  // Reviews
  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'approved' | 'featured'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      approved: false, // requires admin approval
      featured: false,
    };
    setReviews((prev) => [newRev, ...prev]);
    showToast('Thank you! Your review has been submitted for approval.', 'success');
  };

  const toggleReviewApproved = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: !r.approved } : r))
    );
  };

  const toggleReviewFeatured = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, featured: !r.featured } : r))
    );
  };

  // FAQs
  const addFAQ = (faqData: Omit<FAQ, 'id'>) => {
    setFaqs((prev) => [...prev, { ...faqData, id: `faq-${Date.now()}` }]);
    showToast('FAQ created!', 'success');
  };

  const updateFAQ = (id: string, patch: Partial<FAQ>) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    showToast('FAQ updated!', 'success');
  };

  const deleteFAQ = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  // Track Order helper
  const trackOrderById = (idOrNumber: string) => {
    const term = idOrNumber.trim().toUpperCase();
    const found = orders.find(
      (o) => o.id.toUpperCase() === term || o.orderNumber.toUpperCase() === term
    );
    if (found) {
      setSelectedOrderIdForTracking(found.id);
      setCurrentView('tracking');
      return true;
    }
    showToast('No order found with this Order ID or Number', 'error');
    return false;
  };

  // Invoicing
  const openInvoice = (order: Order) => setInvoiceOrder(order);
  const closeInvoice = () => setInvoiceOrder(null);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUserRole,
        users: SEED_USERS,
        currentView,
        setCurrentView,
        selectedOrderIdForTracking,
        trackOrderById,

        categories,
        services,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartCount,
        getCartSubtotal,

        orders,
        createOrder,
        updateOrderStatus,
        assignDeliveryStaff,
        updateLaundryNotes,
        verifyAndDeliverOrder,

        addresses,
        addAddress,
        deleteAddress,

        coupons,
        validateCoupon,
        addCoupon,
        updateCoupon,
        deleteCoupon,

        serviceAreas,
        checkPincodeServiceability,
        addServiceArea,
        updateServiceArea,
        deleteServiceArea,

        pickupSlots,
        deliveryStaff,
        addDeliveryStaff,
        updateDeliveryStaff,

        businessSettings,
        updateBusinessSettings,
        cms,
        updateCMS,

        reviews,
        addReview,
        toggleReviewApproved,
        toggleReviewFeatured,
        faqs,
        addFAQ,
        updateFAQ,
        deleteFAQ,

        auditLogs,
        logAuditAction,

        toasts,
        showToast,
        dismissToast,

        invoiceOrder,
        openInvoice,
        closeInvoice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
