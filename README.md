# 🧺 The Laundry Lounge — Commercial Laundry & Dry Cleaning Platform (Rewa, M.P.)

A production-ready, fully responsive, and dynamic **Laundry & Dry Cleaning Pickup, Delivery & Payment Platform** built with **React**, **TypeScript**, **Tailwind CSS**, and modern component architecture.

---

## 🚀 Live Dev Server
The application is running live at:
```
http://localhost:3000/
```

---

## 🌟 Key Architecture & Features

### 1. Dynamic Service Catalogue & Seed Data
Pre-seeded with **all 60+ commercial laundry & dry cleaning items** across categories:
- **Dry Cleaning**: Shirts, Kurtas, T-Shirts, Pants, Blazers (₹150–₹200 range), Sherwanis (₹250–₹500 range), Jackets, Footwear (₹150/pair), Gowns & Lehengas (Custom Quote), Sarees, Bedding, Blankets, Carpets (₹15–₹30/sq.ft), Kids Wear, etc.
- **Normal Wash & Iron**: Daily casual shirts, t-shirts, kurtas (with & without starch), bedding, and towels.
- **Only Ironing**: Regular garments at ₹15/piece, Saree Roll Press at ₹50 (with/without starch options), Lehenga 3-piece set, Blazers, and Rajasthani Poshak sets.
- **Pricing Models**: Fixed, Price Range, Starting From, and Custom Quote required with inspection tags.

### 2. Multi-Step Checkout & Authoritative Pricing Engine
- **Step 1 — Garment Basket**: Quantity controls, starch options, special instructions.
- **Step 2 — Doorstep Address**: Saved address selector, GPS geolocation detection, real-time pincode serviceability validation.
- **Step 3 — Pickup Slot & Delivery**: Dynamic 2-hour collection slots (Today, Tomorrow, Day After), capacity tracking, Standard (48h) vs Express 24h Turnaround (+₹99).
- **Step 4 — Summary & Taxes**: Server-authoritative subtotal, coupon discount, doorstep collection (FREE), GST 18%, grand total.
- **Step 5 — Payment**: Razorpay simulated checkout modal (Credit/Debit Cards, UPI QR, Wallets) and Cash on Delivery.
- **Step 6 — Instant Order Confirmation**: Order ID generation (`LD-2026-000101`), Delivery OTP (`4829`), expected delivery date, and instant tracking links.

### 3. Order Status Timeline & Real-Time Tracking
- Visual 10-stage timeline:
  `Order Placed` ➔ `Pickup Scheduled` ➔ `Picked Up` ➔ `Received at Laundry` ➔ `Inspection` ➔ `Cleaning / Washing` ➔ `Quality Check` ➔ `Ready for Delivery` ➔ `Out for Delivery` ➔ `Delivered`
- Assigned rider contact & vehicle details.
- OTP verification requirement for delivery completion.

### 4. Role-Based Access Control (RBAC) & 1-Click Role Switcher
Test any role instantly from the user badge in the navigation bar:
1. **Customer** (Aarav Sharma): Book pickups, track orders, view past history, manage addresses, apply coupons, reorder, download invoices.
2. **Business Admin / Owner**: Complete operations control:
   - Order management (assign riders, change status, invoice preview)
   - Service catalogue full CRUD (add, edit price ranges/turnaround/units, disable, delete)
   - Customer CRM with RFM segments (New, Active, Repeat, VIP)
   - Delivery fleet management
   - Coupon engine (percentage, fixed, min order, expiry)
   - Service areas & pincodes configuration
   - Pickup slots capacity manager
   - Reviews moderation (Approve, reject, feature on home)
   - FAQs CMS
   - Live Website CMS (Headline, subheadline, notice banner, business info)
   - Store settings (GST %, delivery fee rules, WhatsApp number)
   - Export orders as CSV
   - Real-time audit logs
3. **Operations Manager**: Delivery dispatching and queue monitoring.
4. **Laundry Master Staff**: Facility garment intake, barcode checking, fabric inspection notes, washing stage advancer.
5. **Delivery Partner / Rider**: Mobile-first dispatch console with Today's Pickups, Google Maps GPS navigation link, 1-click calling, and OTP handover verification.

### 5. Professional Printable Tax Invoice
- Includes Business Name, Tagline, Full Address, GSTIN, Original Tax Invoice badge, Customer details, Itemized garment rates, Subtotal, Discount, Delivery fees, Express fee, GST 18%, Payment status, and Terms & conditions.
- Direct **Print / Save as PDF** support.

### 6. WhatsApp Integration & Mobile-First Experience
- Floating WhatsApp support button with instant prefilled templates.
- Mobile bottom navigation bar (Home, Services, Book Pickup, Orders, Profile).
- Sticky mobile CTAs and responsive design.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Tooling**: Vite 6, Bun
- **State & Storage**: Authoritative centralized store with persistent `localStorage` synchronization.
