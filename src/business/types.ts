// ============================================================================
// MY BILLBOOK-STYLE BUSINESS MANAGEMENT, ACCOUNTING, GST & INVENTORY TYPES
// ============================================================================

export type DocumentType =
  | 'tax_invoice'
  | 'bill_of_supply'
  | 'quotation'
  | 'estimate'
  | 'proforma'
  | 'sales_order'
  | 'delivery_challan'
  | 'sales_return'
  | 'credit_note'
  | 'debit_note'
  | 'purchase_order'
  | 'purchase_bill'
  | 'purchase_return';

export type DocumentStatus =
  | 'draft'
  | 'issued'
  | 'partially_paid'
  | 'paid'
  | 'cancelled'
  | 'overdue';

export type PartyType = 'customer' | 'supplier' | 'both';

export interface AddressSnapshot {
  name: string;
  phone: string;
  email?: string;
  street: string;
  area?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface BusinessParty {
  id: string;
  type: PartyType;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  gstin?: string;
  pan?: string;
  billingAddress: AddressSnapshot;
  shippingAddress?: AddressSnapshot;
  openingBalance: number; // positive = customer owes us (debit), negative = we owe them (credit)
  currentBalance: number;
  creditLimit?: number;
  creditPeriodDays?: number;
  notes?: string;
  branch?: string; // e.g. 'Branch 1 — Arun Nagar Main Hub', 'Branch 2 — Ring Road Facility', etc.
  warehouseId?: string; // e.g. 'wh-main', 'wh-ringroad', 'wh-central'
  createdAt: string;
  updatedAt: string;
}

export interface LineItemTax {
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
}

export interface DocumentLineItem {
  id: string;
  itemId: string;
  name: string;
  description?: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  unitPrice: number; // Selling or purchase rate before discount & tax
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number; // e.g. 18 for 18%
  isInterstate: boolean;
  tax: LineItemTax;
  totalAmount: number; // taxableAmount + totalTax
  warehouseId?: string;
}

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Razorpay' | 'Card';
  referenceNumber?: string;
}

export interface BusinessDocument {
  id: string;
  documentType: DocumentType;
  documentNumber: string; // e.g. INV/2026-27/0001
  referenceNumber?: string; // e.g. PO number, Sales order ref
  sourceOrderId?: string; // Link to e-commerce Order.id
  sourceOrderNumber?: string; // Link to e-commerce Order.orderNumber
  partyId: string;
  partyName: string;
  partyPhone: string;
  partyGstin?: string;
  billingAddress: AddressSnapshot;
  shippingAddress?: AddressSnapshot;
  date: string;
  dueDate?: string;
  status: DocumentStatus;
  items: DocumentLineItem[];
  subtotal: number;
  itemDiscountTotal: number;
  additionalDiscount: number;
  shippingCharges: number;
  packagingCharges: number;
  roundOff: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  allocations: PaymentAllocation[];
  notes?: string;
  termsAndConditions?: string[];
  bankDetails?: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
    upiId?: string;
  };
  warehouseId?: string;
  financialYear: string; // e.g. '2026-27'
  isInterstate: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INVENTORY & MULTI-WAREHOUSE TYPES
// ============================================================================

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone?: string;
  isDefault: boolean;
  active: boolean;
}

export type StockMovementType =
  | 'purchase'
  | 'purchase_return'
  | 'sale'
  | 'sales_return'
  | 'adjustment_in'
  | 'adjustment_out'
  | 'transfer_in'
  | 'transfer_out'
  | 'opening_stock';

export interface StockLedgerEntry {
  id: string;
  productId: string;
  warehouseId: string;
  movementType: StockMovementType;
  quantity: number; // positive for addition, negative for deduction
  balanceAfter: number;
  unitRate: number;
  totalValue: number;
  referenceDocumentId?: string;
  referenceDocumentNumber?: string;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface BusinessProduct {
  id: string; // matches ServiceItem.id if synced
  name: string;
  sku?: string;
  barcode?: string;
  categoryId: string;
  description?: string;
  itemType: 'product' | 'service'; // services don't maintain physical quantity
  unit: string;
  sellingPrice: number;
  purchasePrice: number;
  hsnSac: string;
  gstRate: number; // 0, 5, 12, 18, 28
  trackInventory: boolean;
  minStockAlert: number;
  openingStock: number;
  openingStockRate: number;
  currentStock: number; // aggregated across all warehouses
  warehouseStock: { [warehouseId: string]: number };
  image?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  date: string;
  warehouseId: string;
  reason: 'count_discrepancy' | 'damage' | 'spoilage' | 'theft' | 'sample' | 'other';
  items: {
    productId: string;
    productName: string;
    currentQuantity: number;
    newQuantity: number;
    adjustmentQuantity: number; // difference
    unitPrice: number;
  }[];
  totalValueImpact: number;
  notes?: string;
  createdAt: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  date: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

// ============================================================================
// DOUBLE-ENTRY ACCOUNTING TYPES
// ============================================================================

export type AccountCategory =
  | 'Current Asset'
  | 'Fixed Asset'
  | 'Bank Account'
  | 'Cash in Hand'
  | 'Accounts Receivable'
  | 'Inventory Asset'
  | 'Current Liability'
  | 'Accounts Payable'
  | 'Duties & Taxes'
  | 'Equity / Capital'
  | 'Direct Income'
  | 'Indirect Income'
  | 'Cost of Goods Sold'
  | 'Direct Expense'
  | 'Indirect Expense';

export type AccountNature = 'debit' | 'credit';

export interface ChartAccount {
  id: string;
  code: string; // e.g. "1010", "2010"
  name: string;
  category: AccountCategory;
  nature: AccountNature; // Normal balance: debit increases assets/expenses; credit increases liabilities/equity/income
  openingBalance: number;
  currentBalance: number;
  isSystem: boolean;
  active: boolean;
}

export interface JournalLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  notes?: string;
  partyId?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g. JV-2026-0001
  date: string;
  voucherType: 'journal' | 'sales' | 'purchase' | 'receipt' | 'payment' | 'contra';
  referenceId?: string; // Document ID or Order ID
  referenceNumber?: string;
  narration: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  createdAt: string;
}

// ============================================================================
// GST COMPLIANCE & REPORTS TYPES
// ============================================================================

export interface HsnSummaryRecord {
  hsnSac: string;
  description: string;
  uqc: string;
  totalQuantity: number;
  totalValue: number;
  taxableValue: number;
  integratedTaxAmount: number;
  centralTaxAmount: number;
  stateTaxAmount: number;
  totalTax: number;
}

export interface Gstr1Summary {
  financialYear: string;
  period: string; // e.g. 'November 2026'
  b2bInvoicesCount: number;
  b2bTaxableValue: number;
  b2bTaxTotal: number;
  b2csInvoicesCount: number;
  b2csTaxableValue: number;
  b2csTaxTotal: number;
  creditDebitNotesCount: number;
  creditDebitTotal: number;
  hsnSummary: HsnSummaryRecord[];
  totalTaxable: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  grandTotalTax: number;
}

export interface Gstr3bSummary {
  financialYear: string;
  period: string;
  outwardTaxableSupplies: {
    taxableValue: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
  };
  inwardSuppliesEligibleForItc: {
    allOtherItc: {
      taxableValue: number;
      igst: number;
      cgst: number;
      sgst: number;
    };
  };
  netTaxPayable: {
    igst: number;
    cgst: number;
    sgst: number;
  };
}

// ============================================================================
// SAAS SUBSCRIPTIONS & FEATURE GATING TYPES
// ============================================================================

export type SubscriptionPlanId = 'free_trial' | 'silver' | 'gold' | 'diamond';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  badge?: string;
  features: string[];
  limits: {
    invoicesPerMonth: number; // -1 = unlimited
    partiesMax: number;
    warehousesMax: number;
    multiUser: boolean;
    doubleEntryAccounting: boolean;
    gstrJsonExport: boolean;
    barcodeScanning: boolean;
    customInvoiceBranding: boolean;
    prioritySupport: boolean;
  };
}

export interface SaaSOrganizationSubscription {
  planId: SubscriptionPlanId;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  billingCycle: 'monthly' | 'annual';
  trialEndsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usageCounters: {
    invoicesCreatedThisMonth: number;
    partiesCreated: number;
    warehousesCreated: number;
  };
  paymentHistory: {
    id: string;
    date: string;
    amount: number;
    planId: SubscriptionPlanId;
    billingCycle: 'monthly' | 'annual';
    paymentMethod: string;
    razorpayPaymentId?: string;
    status: 'success' | 'failed';
    invoiceUrl?: string;
  }[];
}

// ============================================================================
// IDEMPOTENT SYNC EVENT TYPES
// ============================================================================

export type SyncEventType =
  | 'order.created'
  | 'order.confirmed'
  | 'order.dispatched'
  | 'order.delivered'
  | 'order.cancelled'
  | 'order.returned'
  | 'payment.received'
  | 'payment.refunded'
  | 'customer.created'
  | 'product.created';

export interface SyncEventRecord {
  id: string;
  eventType: SyncEventType;
  sourceId: string; // e.g. ord-1234
  sourceNumber?: string;
  status: 'pending' | 'processed' | 'failed' | 'skipped';
  error?: string;
  retryCount: number;
  createdAt: string;
  processedAt?: string;
  payloadSnapshot?: any;
}

export interface BillingSettingsConfig {
  invoicePrefix: string; // e.g. "INV"
  salesOrderPrefix: string; // e.g. "SO"
  quotationPrefix: string; // e.g. "QT"
  purchaseOrderPrefix: string; // e.g. "PO"
  purchaseBillPrefix: string; // e.g. "PB"
  creditNotePrefix: string; // e.g. "CN"
  debitNotePrefix: string; // e.g. "DN"
  deliveryChallanPrefix: string; // e.g. "DC"
  financialYear: string; // e.g. "2026-27"
  defaultGstRate: number; // e.g. 18
  defaultState: string; // e.g. "Madhya Pradesh"
  stateCode: string; // e.g. "23" for MP
  stockDeductionPolicy: 'on_invoice_creation' | 'on_order_dispatch' | 'manual';
  autoGenerateInvoiceOnConfirmedOrder: boolean;
  autoPostAccountingEntries: boolean;
  autoSyncEcommerceCustomers: boolean;
  thermalPaperWidth: '58mm' | '80mm';
  defaultPrintTemplate: 'a4_modern' | 'a4_classic' | 'thermal_receipt';
}

