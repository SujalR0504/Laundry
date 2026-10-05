export type UserRole = 'customer' | 'admin' | 'manager' | 'laundry_staff' | 'delivery_staff';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  loyaltyPoints?: number;
  customerSegment?: 'New' | 'Active' | 'Repeat' | 'VIP' | 'Inactive';
}

export type PriceType = 'fixed' | 'range' | 'starting_from' | 'custom_quote';

export type ServiceUnit = 'Piece' | 'Pair' | 'Set' | 'Square Feet' | 'Kg';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image?: string;
  badge?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  priceType: PriceType;
  price: number; // base / fixed price
  minPrice?: number;
  maxPrice?: number;
  unit: ServiceUnit;
  turnaroundHours: number;
  image: string;
  active: boolean;
  featured?: boolean;
  customQuoteRequired?: boolean;
  hasStarchOption?: boolean;
}

export interface CartItem {
  serviceId: string;
  service: ServiceItem;
  quantity: number;
  selectedPrice: number;
  specialInstructions?: string;
  starchSelected?: boolean;
}

export interface Address {
  id: string;
  name: string;
  mobile: string;
  houseFlat: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface PickupSlot {
  id: string;
  timeRange: string;
  maxCapacity: number;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday...
  active: boolean;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Pickup Scheduled'
  | 'Picked Up'
  | 'Received at Laundry'
  | 'Inspection'
  | 'Cleaning / Washing'
  | 'Quality Check'
  | 'Ready for Delivery'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded'
  | 'On Hold';

export type PaymentMethod = 'Razorpay' | 'Cash on Delivery' | 'UPI';

export type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Paid'
  | 'Failed'
  | 'Refund Initiated'
  | 'Refunded';

export interface TimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. LD-2026-000123
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: CartItem[];
  address: Address;
  pickupDate: string;
  pickupSlot: string;
  deliveryMode: 'standard' | 'express';
  expectedDeliveryDate: string;
  subtotal: number;
  pickupFee: number;
  deliveryFee: number;
  expressFee: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  orderStatus: OrderStatus;
  timeline: TimelineEvent[];
  assignedDeliveryStaffId?: string;
  assignedStaffName?: string;
  laundryInternalNotes?: string;
  deliveryOtp: string;
  deliveryProofPhoto?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  description: string;
}

export interface DeliveryStaff {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'on_delivery' | 'inactive';
  activeOrdersCount: number;
  vehicleType: string;
  rating: number;
}

export interface ServiceArea {
  id: string;
  pincode: string;
  areaName: string;
  city: string;
  isServiceable: boolean;
  minOrder: number;
  pickupFee: number;
  deliveryFee: number;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  serviceCategory: string;
  date: string;
  approved: boolean;
  featured: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  gstin: string;
  phone: string;
  email: string;
  supportHours: string;
  address: string;
  gstPercentage: number;
  minOrderValue: number;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  enableCod: boolean;
  enableRazorpay: boolean;
  enableUpi: boolean;
  razorpayKeyId: string;
  upiId: string;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
}

export interface CMSContent {
  heroHeadline: string;
  heroSubheadline: string;
  heroBadge: string;
  heroImage: string;
  announcementBar: string;
  aboutText: string;
  termsConditions: string;
  privacyPolicy: string;
  cancellationPolicy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  details: string;
}
