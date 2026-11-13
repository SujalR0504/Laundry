import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BusinessDocument,
  BusinessParty,
  BusinessProduct,
  Warehouse,
  StockLedgerEntry,
  StockAdjustment,
  StockTransfer,
  ChartAccount,
  JournalEntry,
  SaaSOrganizationSubscription,
  SubscriptionPlanId,
  BillingSettingsConfig,
  SyncEventRecord,
  SyncEventType,
  DocumentType,
  DocumentStatus,
  Gstr1Summary,
  Gstr3bSummary,
  HsnSummaryRecord,
} from './types';
import {
  SEED_CHART_OF_ACCOUNTS,
  SEED_WAREHOUSES,
  SEED_BUSINESS_PRODUCTS,
  SEED_BUSINESS_PARTIES,
  SEED_BUSINESS_DOCUMENTS,
  SEED_STOCK_LEDGER,
  SEED_JOURNAL_ENTRIES,
  SUBSCRIPTION_PLANS,
  DEFAULT_SAAS_SUBSCRIPTION,
  DEFAULT_BILLING_SETTINGS,
} from './seedData';
import { Order } from '../types';
import { useApp } from '../context/AppContext';

interface BusinessContextType {
  // Documents & Invoices
  documents: BusinessDocument[];
  createDocument: (data: Omit<Partial<BusinessDocument>, 'items'> & { documentType: DocumentType; partyId: string; items: any[] }) => BusinessDocument;
  updateDocument: (id: string, patch: Partial<BusinessDocument>) => void;
  deleteDocument: (id: string) => void;
  recordDocumentPayment: (documentId: string, amount: number, mode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Razorpay' | 'Card', refNo?: string) => void;
  getNextDocumentNumber: (type: DocumentType) => string;

  // Parties (Customers & Suppliers)
  parties: BusinessParty[];
  setParties: React.Dispatch<React.SetStateAction<BusinessParty[]>>;
  addParty: (party: Omit<BusinessParty, 'id' | 'createdAt' | 'updatedAt'>) => BusinessParty;
  updateParty: (id: string, patch: Partial<BusinessParty>) => void;
  deleteParty: (id: string) => void;
  getPartyById: (id: string) => BusinessParty | undefined;

  // Products & Inventory
  products: BusinessProduct[];
  setProducts: React.Dispatch<React.SetStateAction<BusinessProduct[]>>;
  addProduct: (product: Omit<BusinessProduct, 'id' | 'createdAt' | 'updatedAt'>) => BusinessProduct;
  updateProduct: (id: string, patch: Partial<BusinessProduct>) => void;
  deleteProduct: (id: string) => void;
  warehouses: Warehouse[];
  addWarehouse: (wh: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, patch: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;
  stockLedger: StockLedgerEntry[];
  setStockLedger: React.Dispatch<React.SetStateAction<StockLedgerEntry[]>>;
  stockAdjustments: StockAdjustment[];
  recordStockAdjustment: (adj: Omit<StockAdjustment, 'id' | 'adjustmentNumber' | 'createdAt'>) => void;
  stockTransfers: StockTransfer[];
  recordStockTransfer: (transfer: Omit<StockTransfer, 'id' | 'transferNumber' | 'createdAt'>) => void;
  completeStockTransfer: (transferId: string) => void;

  // Accounting (Double Entry)
  chartOfAccounts: ChartAccount[];
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  createJournalEntry: (entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdAt'>) => JournalEntry;
  getTrialBalance: () => { accountId: string; code: string; name: string; category: string; debit: number; credit: number }[];
  getProfitAndLoss: () => { totalIncome: number; totalExpenses: number; grossProfit: number; netProfit: number; incomeBreakdown: any[]; expenseBreakdown: any[] };
  getBalanceSheet: () => { totalAssets: number; totalLiabilities: number; totalEquity: number; isBalanced: boolean };

  // GST & Compliance
  getGstr1Summary: (financialYear?: string) => Gstr1Summary;
  getGstr3bSummary: (financialYear?: string) => Gstr3bSummary;

  // SaaS Subscriptions
  subscription: SaaSOrganizationSubscription;
  upgradeSubscription: (planId: SubscriptionPlanId, cycle: 'monthly' | 'annual', razorpayPaymentId?: string) => boolean;
  cancelSubscription: () => void;
  checkFeatureAccess: (featureKey: keyof typeof SUBSCRIPTION_PLANS[0]['limits']) => boolean;

  // Settings & Sync Bus
  billingSettings: BillingSettingsConfig;
  updateBillingSettings: (patch: Partial<BillingSettingsConfig>) => void;
  syncEvents: SyncEventRecord[];
  syncEcommerceOrder: (order: Order, eventType: SyncEventType) => boolean;
  retrySyncEvent: (eventId: string) => void;
  eraseAllBusinessData: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { orders, services: appServices } = useApp();

  const loadLocal = <T,>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(`mbb_business_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveLocal = (key: string, data: any) => {
    try {
      localStorage.setItem(`mbb_business_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }
  };

  // State initialization
  const [documents, setDocuments] = useState<BusinessDocument[]>(() =>
    loadLocal('documents', SEED_BUSINESS_DOCUMENTS)
  );
  const [parties, setParties] = useState<BusinessParty[]>(() => {
    const loaded = loadLocal<BusinessParty[]>('parties', SEED_BUSINESS_PARTIES);
    return loaded.map((p) => {
      const text = ((p.name || '') + ' ' + (p.notes || '') + ' ' + (p.branch || '') + ' ' + (p.billingAddress?.street || '') + ' ' + (p.billingAddress?.city || '')).toLowerCase();
      let branch = 'The Laundry Lounge';
      let warehouseId = 'wh-main';
      if (p.branch === 'Hari Om Laundry' || text.includes('hari om') || text.includes('hariom') || text.includes('ring road')) {
        branch = 'Hari Om Laundry';
        warehouseId = 'wh-hariom';
      }
      return { ...p, branch, warehouseId };
    });
  });
  const [products, setProducts] = useState<BusinessProduct[]>(() =>
    loadLocal('products', SEED_BUSINESS_PRODUCTS)
  );
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() =>
    loadLocal('warehouses', SEED_WAREHOUSES)
  );
  const [stockLedger, setStockLedger] = useState<StockLedgerEntry[]>(() =>
    loadLocal('stockLedger', SEED_STOCK_LEDGER)
  );
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() =>
    loadLocal('stockAdjustments', [])
  );
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() =>
    loadLocal('stockTransfers', [])
  );
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartAccount[]>(() =>
    loadLocal('chartOfAccounts', SEED_CHART_OF_ACCOUNTS)
  );
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() =>
    loadLocal('journalEntries', SEED_JOURNAL_ENTRIES)
  );
  const [subscription, setSubscription] = useState<SaaSOrganizationSubscription>(() =>
    loadLocal('subscription', DEFAULT_SAAS_SUBSCRIPTION)
  );
  const [billingSettings, setBillingSettings] = useState<BillingSettingsConfig>(() =>
    loadLocal('billingSettings', DEFAULT_BILLING_SETTINGS)
  );
  const [syncEvents, setSyncEvents] = useState<SyncEventRecord[]>(() =>
    loadLocal('syncEvents', [])
  );

  // Synchronization with localStorage
  useEffect(() => saveLocal('documents', documents), [documents]);
  useEffect(() => saveLocal('parties', parties), [parties]);
  useEffect(() => saveLocal('products', products), [products]);
  useEffect(() => saveLocal('warehouses', warehouses), [warehouses]);
  useEffect(() => saveLocal('stockLedger', stockLedger), [stockLedger]);
  useEffect(() => saveLocal('stockAdjustments', stockAdjustments), [stockAdjustments]);
  useEffect(() => saveLocal('stockTransfers', stockTransfers), [stockTransfers]);
  useEffect(() => saveLocal('chartOfAccounts', chartOfAccounts), [chartOfAccounts]);
  useEffect(() => saveLocal('journalEntries', journalEntries), [journalEntries]);
  useEffect(() => saveLocal('subscription', subscription), [subscription]);
  useEffect(() => saveLocal('billingSettings', billingSettings), [billingSettings]);
  useEffect(() => saveLocal('syncEvents', syncEvents), [syncEvents]);

  // E-Commerce Order Auto-Sync Hook (Idempotent)
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    orders.forEach((order) => {
      // 1. Order Confirmation sync
      const orderConfirmedEventProcessed = syncEvents.some(
        (e) => e.sourceId === order.id && e.eventType === 'order.confirmed' && e.status === 'processed'
      );
      if (!orderConfirmedEventProcessed && billingSettings.autoGenerateInvoiceOnConfirmedOrder) {
        syncEcommerceOrder(order, 'order.confirmed');
      }

      // 2. Payment Received sync
      if (order.paymentStatus === 'Paid') {
        const paymentProcessed = syncEvents.some(
          (e) => e.sourceId === order.id && e.eventType === 'payment.received' && e.status === 'processed'
        );
        if (!paymentProcessed) {
          syncEcommerceOrder(order, 'payment.received');
        }
      }

      // 3. Order Cancelled sync
      if (order.orderStatus === 'Cancelled') {
        const cancelProcessed = syncEvents.some(
          (e) => e.sourceId === order.id && e.eventType === 'order.cancelled' && e.status === 'processed'
        );
        if (!cancelProcessed) {
          syncEcommerceOrder(order, 'order.cancelled');
        }
      }
    });
  }, [orders, billingSettings.autoGenerateInvoiceOnConfirmedOrder]);

  // Product Catalog Auto-Sync Hook
  useEffect(() => {
    if (!appServices || appServices.length === 0) return;
    appServices.forEach((svc) => {
      const exists = products.some((p) => p.id === svc.id);
      if (!exists) {
        addProduct({
          name: svc.name,
          sku: `SVC-${svc.id.toUpperCase()}`,
          barcode: `89088${svc.id.replace(/[^0-9]/g, '').padStart(7, '0')}`,
          categoryId: svc.categoryId,
          description: svc.description,
          itemType: 'service',
          unit: svc.unit || 'Piece',
          sellingPrice: svc.price,
          purchasePrice: Math.round(svc.price * 0.35),
          hsnSac: '998714',
          gstRate: 18,
          trackInventory: false,
          minStockAlert: 0,
          openingStock: 0,
          openingStockRate: 0,
          currentStock: 9999,
          warehouseStock: { 'wh-main': 9999 },
          image: svc.image,
          active: svc.active,
        });
      }
    });
  }, [appServices]);

  // ==========================================================================
  // DOCUMENT NUMBERING ENGINE
  // ==========================================================================
  const getNextDocumentNumber = (type: DocumentType): string => {
    let prefix = billingSettings.invoicePrefix;
    if (type === 'sales_order') prefix = billingSettings.salesOrderPrefix;
    else if (type === 'quotation') prefix = billingSettings.quotationPrefix;
    else if (type === 'purchase_order') prefix = billingSettings.purchaseOrderPrefix;
    else if (type === 'purchase_bill') prefix = billingSettings.purchaseBillPrefix;
    else if (type === 'credit_note') prefix = billingSettings.creditNotePrefix;
    else if (type === 'debit_note') prefix = billingSettings.debitNotePrefix;
    else if (type === 'delivery_challan') prefix = billingSettings.deliveryChallanPrefix;
    else if (type === 'sales_return') prefix = 'SR';
    else if (type === 'purchase_return') prefix = 'PR';
    else if (type === 'proforma') prefix = 'PI';
    else if (type === 'estimate') prefix = 'EST';
    else if (type === 'bill_of_supply') prefix = 'BOS';

    const count = documents.filter((d) => d.documentType === type).length + 1;
    return `${prefix}/${billingSettings.financialYear}/${count.toString().padStart(4, '0')}`;
  };

  // ==========================================================================
  // DOCUMENT CRUD & WORKFLOW
  // ==========================================================================
  const createDocument = (
    data: Omit<Partial<BusinessDocument>, 'items'> & { documentType: DocumentType; partyId: string; items: any[] }
  ): BusinessDocument => {
    const party = parties.find((p) => p.id === data.partyId);
    const docNumber = data.documentNumber || getNextDocumentNumber(data.documentType);
    const date = data.date || new Date().toISOString().split('T')[0];
    const isInterstate = data.isInterstate !== undefined
      ? data.isInterstate
      : Boolean(party?.billingAddress?.state && party.billingAddress.state !== billingSettings.defaultState);

    // Compute line items, taxes & discounts
    let subtotal = 0;
    let itemDiscountTotal = 0;
    let totalTaxAmount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const computedItems = data.items.map((item, index) => {
      const qty = Number(item.quantity) || 1;
      const rate = Number(item.unitPrice) || 0;
      const discPct = Number(item.discountPercent) || 0;
      const discAmt = Number(item.discountAmount) || (rate * qty * discPct) / 100;
      const taxable = Math.max(0, rate * qty - discAmt);
      const gstRate = Number(item.gstRate) !== undefined ? Number(item.gstRate) : billingSettings.defaultGstRate;

      let cgstRate = 0;
      let cgstAmount = 0;
      let sgstRate = 0;
      let sgstAmount = 0;
      let igstRate = 0;
      let igstAmount = 0;

      if (isInterstate) {
        igstRate = gstRate;
        igstAmount = Math.round(((taxable * igstRate) / 100) * 100) / 100;
      } else {
        cgstRate = gstRate / 2;
        cgstAmount = Math.round(((taxable * cgstRate) / 100) * 100) / 100;
        sgstRate = gstRate / 2;
        sgstAmount = Math.round(((taxable * sgstRate) / 100) * 100) / 100;
      }
      const lineTax = cgstAmount + sgstAmount + igstAmount;
      const lineTotal = taxable + lineTax;

      subtotal += taxable;
      itemDiscountTotal += discAmt;
      totalTaxAmount += lineTax;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
      totalIgst += igstAmount;

      return {
        id: item.id || `li-${Date.now()}-${index}`,
        itemId: item.itemId || `item-${index}`,
        name: item.name || 'Item',
        description: item.description,
        hsnSac: item.hsnSac || '998714',
        quantity: qty,
        unit: item.unit || 'Piece',
        unitPrice: rate,
        discountPercent: discPct,
        discountAmount: discAmt,
        taxableAmount: taxable,
        gstRate,
        isInterstate,
        tax: {
          cgstRate,
          cgstAmount,
          sgstRate,
          sgstAmount,
          igstRate,
          igstAmount,
          totalTax: lineTax,
        },
        totalAmount: lineTotal,
        warehouseId: item.warehouseId || data.warehouseId || warehouses[0]?.id || 'wh-main',
      };
    });

    const shipping = Number(data.shippingCharges) || 0;
    const packaging = Number(data.packagingCharges) || 0;
    const additionalDiscount = Number(data.additionalDiscount) || 0;
    const grossTotal = subtotal + totalTaxAmount + shipping + packaging - additionalDiscount;
    const roundedTotal = Math.round(grossTotal);
    const roundOff = Math.round((roundedTotal - grossTotal) * 100) / 100;

    const paidAmount = Number(data.paidAmount) || 0;
    const dueAmount = Math.max(0, roundedTotal - paidAmount);
    let docStatus: DocumentStatus = data.status || 'issued';
    if (paidAmount >= roundedTotal && roundedTotal > 0) docStatus = 'paid';
    else if (paidAmount > 0 && paidAmount < roundedTotal) docStatus = 'partially_paid';

    const defaultAddress = party?.billingAddress || {
      name: party?.name || 'Walk-in Customer',
      phone: party?.phone || '',
      street: 'Counter Store Walk-in',
      city: 'Rewa',
      state: 'Madhya Pradesh',
      pincode: '486001',
    };

    const newDoc: BusinessDocument = {
      id: data.id || `doc-${Date.now()}`,
      documentType: data.documentType,
      documentNumber: docNumber,
      referenceNumber: data.referenceNumber,
      sourceOrderId: data.sourceOrderId,
      sourceOrderNumber: data.sourceOrderNumber,
      partyId: data.partyId,
      partyName: party?.name || data.partyName || 'Walk-in Customer',
      partyPhone: party?.phone || data.partyPhone || '',
      partyGstin: party?.gstin || data.partyGstin,
      billingAddress: data.billingAddress || defaultAddress,
      shippingAddress: data.shippingAddress || defaultAddress,
      date,
      dueDate: data.dueDate,
      status: docStatus,
      items: computedItems,
      subtotal,
      itemDiscountTotal,
      additionalDiscount,
      shippingCharges: shipping,
      packagingCharges: packaging,
      roundOff,
      totalAmount: roundedTotal,
      paidAmount,
      dueAmount,
      allocations: data.allocations || (paidAmount > 0 ? [{
        id: `alloc-${Date.now()}`,
        paymentId: `pay-${Date.now()}`,
        paymentNumber: `RCP-${Date.now().toString().slice(-4)}`,
        amount: paidAmount,
        paymentDate: date,
        paymentMode: 'Cash',
      }] : []),
      notes: data.notes || '',
      termsAndConditions: data.termsAndConditions || [
        'Payment is due within credit period.',
        'Please quote invoice number in all communications.',
        'Subject to Rewa jurisdiction.',
      ],
      warehouseId: data.warehouseId || warehouses[0]?.id || 'wh-main',
      financialYear: billingSettings.financialYear,
      isInterstate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // 1. Update party current balance
    if (party) {
      const balanceImpact =
        newDoc.documentType === 'tax_invoice' || newDoc.documentType === 'bill_of_supply' || newDoc.documentType === 'debit_note'
          ? dueAmount
          : newDoc.documentType === 'purchase_bill' || newDoc.documentType === 'credit_note'
          ? -dueAmount
          : 0;

      if (balanceImpact !== 0) {
        setParties((prev) =>
          prev.map((p) => (p.id === party.id ? { ...p, currentBalance: p.currentBalance + balanceImpact } : p))
        );
      }
    }

    // 2. Authoritative Stock Movements (Single Authoritative Ledger)
    const isSaleMovement = newDoc.documentType === 'tax_invoice' || newDoc.documentType === 'bill_of_supply' || newDoc.documentType === 'delivery_challan';
    const isPurchaseMovement = newDoc.documentType === 'purchase_bill';
    const isSalesReturn = newDoc.documentType === 'sales_return';
    const isPurchaseReturn = newDoc.documentType === 'purchase_return';

    if (isSaleMovement || isPurchaseMovement || isSalesReturn || isPurchaseReturn) {
      computedItems.forEach((line) => {
        const prod = products.find((p) => p.id === line.itemId);
        if (prod && prod.trackInventory) {
          const whId = line.warehouseId || newDoc.warehouseId || 'wh-main';
          let qtyDelta = 0;
          let mType: any = 'sale';

          if (isSaleMovement) {
            qtyDelta = -line.quantity;
            mType = 'sale';
          } else if (isPurchaseMovement) {
            qtyDelta = line.quantity;
            mType = 'purchase';
          } else if (isSalesReturn) {
            qtyDelta = line.quantity;
            mType = 'sales_return';
          } else if (isPurchaseReturn) {
            qtyDelta = -line.quantity;
            mType = 'purchase_return';
          }

          const currentProdStock = prod.currentStock || 0;
          const newProdStock = Math.max(0, currentProdStock + qtyDelta);
          const currentWhStock = (prod.warehouseStock && prod.warehouseStock[whId]) || 0;
          const newWhStock = Math.max(0, currentWhStock + qtyDelta);

          // Append to stock ledger
          const newLedgerEntry: StockLedgerEntry = {
            id: `stk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: prod.id,
            warehouseId: whId,
            movementType: mType,
            quantity: qtyDelta,
            balanceAfter: newProdStock,
            unitRate: line.unitPrice,
            totalValue: Math.abs(qtyDelta * line.unitPrice),
            referenceDocumentId: newDoc.id,
            referenceDocumentNumber: newDoc.documentNumber,
            notes: `${newDoc.documentType.toUpperCase()} ${newDoc.documentNumber}`,
            date,
            createdAt: new Date().toISOString(),
          };

          setStockLedger((prev) => [newLedgerEntry, ...prev]);

          // Update product stock counters
          setProducts((prev) =>
            prev.map((p) =>
              p.id === prod.id
                ? {
                    ...p,
                    currentStock: newProdStock,
                    warehouseStock: {
                      ...p.warehouseStock,
                      [whId]: newWhStock,
                    },
                  }
                : p
            )
          );
        }
      });
    }

    // 3. Double-Entry Accounting Posting
    if (billingSettings.autoPostAccountingEntries) {
      if (newDoc.documentType === 'tax_invoice' || newDoc.documentType === 'bill_of_supply') {
        // Sales Voucher
        const lines = [
          {
            accountId: 'acc-ar',
            accountName: 'Accounts Receivable (Customer Dues)',
            debit: newDoc.totalAmount,
            credit: 0,
            partyId: newDoc.partyId,
          },
          {
            accountId: 'acc-sales-wash',
            accountName: 'Sales / Service Revenue',
            debit: 0,
            credit: newDoc.subtotal,
          },
        ];
        if (totalCgst > 0) {
          lines.push({
            accountId: 'acc-cgst-out',
            accountName: 'Output CGST Payable',
            debit: 0,
            credit: totalCgst,
          });
        }
        if (totalSgst > 0) {
          lines.push({
            accountId: 'acc-sgst-out',
            accountName: 'Output SGST Payable',
            debit: 0,
            credit: totalSgst,
          });
        }
        if (totalIgst > 0) {
          lines.push({
            accountId: 'acc-igst-out',
            accountName: 'Output IGST Payable',
            debit: 0,
            credit: totalIgst,
          });
        }

        const jvSales: JournalEntry = {
          id: `jv-sales-${Date.now()}`,
          entryNumber: `JV-${Date.now().toString().slice(-4)}`,
          date,
          voucherType: 'sales',
          referenceId: newDoc.id,
          referenceNumber: newDoc.documentNumber,
          narration: `Invoice ${newDoc.documentNumber} issued to ${newDoc.partyName}`,
          lines,
          totalDebit: newDoc.totalAmount,
          totalCredit: newDoc.totalAmount,
          createdAt: new Date().toISOString(),
        };
        setJournalEntries((prev) => [jvSales, ...prev]);

        // If paid immediately, post Receipt voucher
        if (paidAmount > 0) {
          const jvReceipt: JournalEntry = {
            id: `jv-rcp-${Date.now()}`,
            entryNumber: `JV-${(Date.now() + 1).toString().slice(-4)}`,
            date,
            voucherType: 'receipt',
            referenceId: newDoc.id,
            referenceNumber: newDoc.documentNumber,
            narration: `Payment received for ${newDoc.documentNumber}`,
            lines: [
              {
                accountId: 'acc-cash',
                accountName: 'Cash / Bank Balance',
                debit: paidAmount,
                credit: 0,
              },
              {
                accountId: 'acc-ar',
                accountName: 'Accounts Receivable (Customer Dues)',
                debit: 0,
                credit: paidAmount,
                partyId: newDoc.partyId,
              },
            ],
            totalDebit: paidAmount,
            totalCredit: paidAmount,
            createdAt: new Date().toISOString(),
          };
          setJournalEntries((prev) => [jvReceipt, ...prev]);
        }
      } else if (newDoc.documentType === 'purchase_bill') {
        // Purchase Voucher
        const jvPurchase: JournalEntry = {
          id: `jv-purch-${Date.now()}`,
          entryNumber: `JV-${Date.now().toString().slice(-4)}`,
          date,
          voucherType: 'purchase',
          referenceId: newDoc.id,
          referenceNumber: newDoc.documentNumber,
          narration: `Purchase Bill ${newDoc.documentNumber} from ${newDoc.partyName}`,
          lines: [
            {
              accountId: 'acc-cogs',
              accountName: 'Cost of Consumables & Goods',
              debit: newDoc.subtotal,
              credit: 0,
            },
            {
              accountId: 'acc-cgst-in',
              accountName: 'Input CGST Credit (ITC)',
              debit: totalCgst,
              credit: 0,
            },
            {
              accountId: 'acc-sgst-in',
              accountName: 'Input SGST Credit (ITC)',
              debit: totalSgst,
              credit: 0,
            },
            {
              accountId: 'acc-ap',
              accountName: 'Accounts Payable (Supplier Dues)',
              debit: 0,
              credit: newDoc.totalAmount,
              partyId: newDoc.partyId,
            },
          ].filter((l) => l.debit > 0 || l.credit > 0),
          totalDebit: newDoc.totalAmount,
          totalCredit: newDoc.totalAmount,
          createdAt: new Date().toISOString(),
        };
        setJournalEntries((prev) => [jvPurchase, ...prev]);
      }
    }

    // 4. Update SaaS usage counter
    setSubscription((prev) => ({
      ...prev,
      usageCounters: {
        ...prev.usageCounters,
        invoicesCreatedThisMonth: prev.usageCounters.invoicesCreatedThisMonth + 1,
      },
    }));

    return newDoc;
  };

  const updateDocument = (id: string, patch: Partial<BusinessDocument>) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)));
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const recordDocumentPayment = (
    documentId: string,
    amount: number,
    mode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Razorpay' | 'Card',
    refNo?: string
  ) => {
    const doc = documents.find((d) => d.id === documentId);
    if (!doc) return;

    const newPaid = doc.paidAmount + amount;
    const newDue = Math.max(0, doc.totalAmount - newPaid);
    const newStatus: DocumentStatus = newDue <= 0 ? 'paid' : 'partially_paid';

    const newAlloc: any = {
      id: `alloc-${Date.now()}`,
      paymentId: `pay-${Date.now()}`,
      paymentNumber: `RCP-${Date.now().toString().slice(-4)}`,
      amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: mode,
      referenceNumber: refNo,
    };

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === documentId
          ? {
              ...d,
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newStatus,
              allocations: [...d.allocations, newAlloc],
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );

    // Update party balance
    if (doc.partyId) {
      setParties((prev) =>
        prev.map((p) =>
          p.id === doc.partyId
            ? { ...p, currentBalance: Math.max(0, p.currentBalance - amount) }
            : p
        )
      );
    }

    // Post Receipt Journal Entry
    const jvReceipt: JournalEntry = {
      id: `jv-rcp-${Date.now()}`,
      entryNumber: `JV-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      voucherType: 'receipt',
      referenceId: doc.id,
      referenceNumber: doc.documentNumber,
      narration: `Payment received of ₹${amount} via ${mode} against ${doc.documentNumber}`,
      lines: [
        {
          accountId: mode === 'Cash' ? 'acc-cash' : 'acc-bank-sbi',
          accountName: mode === 'Cash' ? 'Cash in Hand' : 'Bank Balance',
          debit: amount,
          credit: 0,
        },
        {
          accountId: 'acc-ar',
          accountName: 'Accounts Receivable (Customer Dues)',
          debit: 0,
          credit: amount,
          partyId: doc.partyId,
        },
      ],
      totalDebit: amount,
      totalCredit: amount,
      createdAt: new Date().toISOString(),
    };
    setJournalEntries((prev) => [jvReceipt, ...prev]);
  };

  // ==========================================================================
  // PARTIES (CUSTOMERS & SUPPLIERS)
  // ==========================================================================
  const addParty = (data: Omit<BusinessParty, 'id' | 'createdAt' | 'updatedAt'>): BusinessParty => {
    const newParty: BusinessParty = {
      ...data,
      id: `pty-${Date.now()}`,
      currentBalance: data.openingBalance || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setParties((prev) => [newParty, ...prev]);
    setSubscription((prev) => ({
      ...prev,
      usageCounters: {
        ...prev.usageCounters,
        partiesCreated: prev.usageCounters.partiesCreated + 1,
      },
    }));
    return newParty;
  };

  const updateParty = (id: string, patch: Partial<BusinessParty>) => {
    setParties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)));
  };

  const deleteParty = (id: string) => {
    setParties((prev) => prev.filter((p) => p.id !== id));
  };

  const getPartyById = (id: string) => parties.find((p) => p.id === id);

  // ==========================================================================
  // PRODUCTS & INVENTORY
  // ==========================================================================
  const addProduct = (data: Omit<BusinessProduct, 'id' | 'createdAt' | 'updatedAt'>): BusinessProduct => {
    const newProd: BusinessProduct = {
      ...data,
      id: `prod-${Date.now()}`,
      currentStock: data.openingStock || 0,
      warehouseStock: data.warehouseStock || { 'wh-main': data.openingStock || 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, patch: Partial<BusinessProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addWarehouse = (whData: Omit<Warehouse, 'id'>) => {
    const newWh: Warehouse = {
      ...whData,
      id: `wh-${Date.now()}`,
    };
    setWarehouses((prev) => [...prev, newWh]);
    setSubscription((prev) => ({
      ...prev,
      usageCounters: {
        ...prev.usageCounters,
        warehousesCreated: prev.usageCounters.warehousesCreated + 1,
      },
    }));
  };

  const updateWarehouse = (id: string, patch: Partial<Warehouse>) => {
    setWarehouses((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  };

  const deleteWarehouse = (id: string) => {
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
  };

  const recordStockAdjustment = (adjData: Omit<StockAdjustment, 'id' | 'adjustmentNumber' | 'createdAt'>) => {
    const adjNumber = `ADJ-${Date.now().toString().slice(-4)}`;
    const newAdj: StockAdjustment = {
      ...adjData,
      id: `adj-${Date.now()}`,
      adjustmentNumber: adjNumber,
      createdAt: new Date().toISOString(),
    };
    setStockAdjustments((prev) => [newAdj, ...prev]);

    // Apply adjustments to stock ledger & product quantities
    adjData.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const delta = item.adjustmentQuantity;
        const newTotal = Math.max(0, prod.currentStock + delta);
        const whStock = (prod.warehouseStock && prod.warehouseStock[adjData.warehouseId]) || 0;
        const newWhStock = Math.max(0, whStock + delta);

        const ledger: StockLedgerEntry = {
          id: `stk-adj-${Date.now()}`,
          productId: prod.id,
          warehouseId: adjData.warehouseId,
          movementType: delta >= 0 ? 'adjustment_in' : 'adjustment_out',
          quantity: delta,
          balanceAfter: newTotal,
          unitRate: item.unitPrice,
          totalValue: Math.abs(delta * item.unitPrice),
          referenceDocumentNumber: adjNumber,
          notes: `Stock count adjustment: ${adjData.reason}`,
          date: adjData.date,
          createdAt: new Date().toISOString(),
        };

        setStockLedger((prev) => [ledger, ...prev]);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === prod.id
              ? {
                  ...p,
                  currentStock: newTotal,
                  warehouseStock: { ...p.warehouseStock, [adjData.warehouseId]: newWhStock },
                }
              : p
          )
        );
      }
    });
  };

  const recordStockTransfer = (transferData: Omit<StockTransfer, 'id' | 'transferNumber' | 'createdAt'>) => {
    const transferNumber = `TRF-${Date.now().toString().slice(-4)}`;
    const newTransfer: StockTransfer = {
      ...transferData,
      id: `trf-${Date.now()}`,
      transferNumber,
      createdAt: new Date().toISOString(),
    };
    setStockTransfers((prev) => [newTransfer, ...prev]);

    // If completed immediately, update stock
    if (transferData.status === 'completed') {
      transferData.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          const fromWh = transferData.fromWarehouseId;
          const toWh = transferData.toWarehouseId;
          const fromQty = (prod.warehouseStock && prod.warehouseStock[fromWh]) || 0;
          const toQty = (prod.warehouseStock && prod.warehouseStock[toWh]) || 0;

          setProducts((prev) =>
            prev.map((p) =>
              p.id === prod.id
                ? {
                    ...p,
                    warehouseStock: {
                      ...p.warehouseStock,
                      [fromWh]: Math.max(0, fromQty - item.quantity),
                      [toWh]: toQty + item.quantity,
                    },
                  }
                : p
            )
          );
        }
      });
    }
  };

  const completeStockTransfer = (transferId: string) => {
    const transfer = stockTransfers.find((t) => t.id === transferId);
    if (!transfer || transfer.status === 'completed') return;

    transfer.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const fromWh = transfer.fromWarehouseId;
        const toWh = transfer.toWarehouseId;
        const fromQty = (prod.warehouseStock && prod.warehouseStock[fromWh]) || 0;
        const toQty = (prod.warehouseStock && prod.warehouseStock[toWh]) || 0;

        setProducts((prev) =>
          prev.map((p) =>
            p.id === prod.id
              ? {
                  ...p,
                  warehouseStock: {
                    ...p.warehouseStock,
                    [fromWh]: Math.max(0, fromQty - item.quantity),
                    [toWh]: toQty + item.quantity,
                  },
                }
              : p
          )
        );
      }
    });

    setStockTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
          : t
      )
    );
  };

  // ==========================================================================
  // DOUBLE-ENTRY ACCOUNTING ENGINE
  // ==========================================================================
  const createJournalEntry = (
    entryData: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdAt'>
  ): JournalEntry => {
    const entryNumber = `JV-${Date.now().toString().slice(-4)}`;
    const newEntry: JournalEntry = {
      ...entryData,
      id: `jv-${Date.now()}`,
      entryNumber,
      createdAt: new Date().toISOString(),
    };
    setJournalEntries((prev) => [newEntry, ...prev]);

    // Update account balances
    entryData.lines.forEach((line) => {
      setChartOfAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === line.accountId) {
            const netChange = acc.nature === 'debit' ? line.debit - line.credit : line.credit - line.debit;
            return { ...acc, currentBalance: acc.currentBalance + netChange };
          }
          return acc;
        })
      );
    });

    return newEntry;
  };

  const getTrialBalance = () => {
    return chartOfAccounts.map((acc) => {
      // Calculate net debits and credits from all journal entries
      let totalDr = 0;
      let totalCr = 0;
      journalEntries.forEach((jv) => {
        jv.lines.forEach((l) => {
          if (l.accountId === acc.id) {
            totalDr += l.debit;
            totalCr += l.credit;
          }
        });
      });

      if (acc.nature === 'debit') {
        const net = acc.openingBalance + totalDr - totalCr;
        return {
          accountId: acc.id,
          code: acc.code,
          name: acc.name,
          category: acc.category,
          debit: net >= 0 ? net : 0,
          credit: net < 0 ? Math.abs(net) : 0,
        };
      } else {
        const net = acc.openingBalance + totalCr - totalDr;
        return {
          accountId: acc.id,
          code: acc.code,
          name: acc.name,
          category: acc.category,
          debit: net < 0 ? Math.abs(net) : 0,
          credit: net >= 0 ? net : 0,
        };
      }
    });
  };

  const getProfitAndLoss = () => {
    const incomeCategories = ['Direct Income', 'Indirect Income'];
    const expenseCategories = ['Cost of Goods Sold', 'Direct Expense', 'Indirect Expense'];

    let totalIncome = 0;
    const incomeBreakdown: any[] = [];
    let totalExpenses = 0;
    const expenseBreakdown: any[] = [];

    chartOfAccounts.forEach((acc) => {
      if (incomeCategories.includes(acc.category)) {
        let earned = 0;
        journalEntries.forEach((jv) => {
          jv.lines.forEach((l) => {
            if (l.accountId === acc.id) earned += l.credit - l.debit;
          });
        });
        const total = acc.openingBalance + earned;
        totalIncome += total;
        incomeBreakdown.push({ name: acc.name, category: acc.category, amount: total });
      } else if (expenseCategories.includes(acc.category)) {
        let spent = 0;
        journalEntries.forEach((jv) => {
          jv.lines.forEach((l) => {
            if (l.accountId === acc.id) spent += l.debit - l.credit;
          });
        });
        const total = acc.openingBalance + spent;
        totalExpenses += total;
        expenseBreakdown.push({ name: acc.name, category: acc.category, amount: total });
      }
    });

    const grossProfit = totalIncome - (expenseBreakdown.find((e) => e.category === 'Cost of Goods Sold')?.amount || 0);
    const netProfit = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, grossProfit, netProfit, incomeBreakdown, expenseBreakdown };
  };

  const getBalanceSheet = () => {
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    const assetCategories = ['Current Asset', 'Fixed Asset', 'Bank Account', 'Cash in Hand', 'Accounts Receivable', 'Inventory Asset'];
    const liabilityCategories = ['Current Liability', 'Accounts Payable', 'Duties & Taxes'];
    const equityCategories = ['Equity / Capital'];

    const pnl = getProfitAndLoss();

    chartOfAccounts.forEach((acc) => {
      let netDr = 0;
      let netCr = 0;
      journalEntries.forEach((jv) => {
        jv.lines.forEach((l) => {
          if (l.accountId === acc.id) {
            netDr += l.debit;
            netCr += l.credit;
          }
        });
      });

      if (assetCategories.includes(acc.category)) {
        totalAssets += acc.openingBalance + netDr - netCr;
      } else if (liabilityCategories.includes(acc.category)) {
        totalLiabilities += acc.openingBalance + netCr - netDr;
      } else if (equityCategories.includes(acc.category)) {
        totalEquity += acc.openingBalance + netCr - netDr;
      }
    });

    totalEquity += pnl.netProfit;
    const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 10;

    return { totalAssets, totalLiabilities, totalEquity, isBalanced };
  };

  // ==========================================================================
  // GST COMPLIANCE & REPORTS ENGINE
  // ==========================================================================
  const getGstr1Summary = (financialYear = billingSettings.financialYear): Gstr1Summary => {
    const salesDocs = documents.filter(
      (d) =>
        (d.documentType === 'tax_invoice' || d.documentType === 'bill_of_supply' || d.documentType === 'credit_note') &&
        d.financialYear === financialYear &&
        d.status !== 'cancelled'
    );

    let b2bCount = 0;
    let b2bTaxable = 0;
    let b2bTax = 0;
    let b2csCount = 0;
    let b2csTaxable = 0;
    let b2csTax = 0;
    let cnCount = 0;
    let cnTotal = 0;

    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const hsnMap = new Map<string, HsnSummaryRecord>();

    salesDocs.forEach((doc) => {
      const isB2B = Boolean(doc.partyGstin && doc.partyGstin.length >= 15);
      const isCreditNote = doc.documentType === 'credit_note';

      if (isCreditNote) {
        cnCount += 1;
        cnTotal += doc.totalAmount;
      } else if (isB2B) {
        b2bCount += 1;
        b2bTaxable += doc.subtotal;
        b2bTax += doc.totalAmount - doc.subtotal;
      } else {
        b2csCount += 1;
        b2csTaxable += doc.subtotal;
        b2csTax += doc.totalAmount - doc.subtotal;
      }

      doc.items.forEach((item) => {
        totalCgst += item.tax.cgstAmount;
        totalSgst += item.tax.sgstAmount;
        totalIgst += item.tax.igstAmount;

        const hsnKey = item.hsnSac || '998714';
        const existing = hsnMap.get(hsnKey);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalValue += item.totalAmount;
          existing.taxableValue += item.taxableAmount;
          existing.centralTaxAmount += item.tax.cgstAmount;
          existing.stateTaxAmount += item.tax.sgstAmount;
          existing.integratedTaxAmount += item.tax.igstAmount;
          existing.totalTax += item.tax.totalTax;
        } else {
          hsnMap.set(hsnKey, {
            hsnSac: hsnKey,
            description: item.name || 'Laundry & Care Service',
            uqc: item.unit || 'NOS',
            totalQuantity: item.quantity,
            totalValue: item.totalAmount,
            taxableValue: item.taxableAmount,
            centralTaxAmount: item.tax.cgstAmount,
            stateTaxAmount: item.tax.sgstAmount,
            integratedTaxAmount: item.tax.igstAmount,
            totalTax: item.tax.totalTax,
          });
        }
      });
    });

    const totalTaxable = b2bTaxable + b2csTaxable;
    const grandTotalTax = totalCgst + totalSgst + totalIgst;

    return {
      financialYear,
      period: 'FY ' + financialYear,
      b2bInvoicesCount: b2bCount,
      b2bTaxableValue: Math.round(b2bTaxable * 100) / 100,
      b2bTaxTotal: Math.round(b2bTax * 100) / 100,
      b2csInvoicesCount: b2csCount,
      b2csTaxableValue: Math.round(b2csTaxable * 100) / 100,
      b2csTaxTotal: Math.round(b2csTax * 100) / 100,
      creditDebitNotesCount: cnCount,
      creditDebitTotal: cnTotal,
      hsnSummary: Array.from(hsnMap.values()),
      totalTaxable: Math.round(totalTaxable * 100) / 100,
      totalCgst: Math.round(totalCgst * 100) / 100,
      totalSgst: Math.round(totalSgst * 100) / 100,
      totalIgst: Math.round(totalIgst * 100) / 100,
      grandTotalTax: Math.round(grandTotalTax * 100) / 100,
    };
  };

  const getGstr3bSummary = (financialYear = billingSettings.financialYear): Gstr3bSummary => {
    const gstr1 = getGstr1Summary(financialYear);

    // Calculate Eligible Input Tax Credit from Purchase Bills & Expenses
    let itcTaxable = 0;
    let itcCgst = 0;
    let itcSgst = 0;
    let itcIgst = 0;

    documents
      .filter((d) => d.documentType === 'purchase_bill' && d.financialYear === financialYear && d.status !== 'cancelled')
      .forEach((pb) => {
        itcTaxable += pb.subtotal;
        pb.items.forEach((item) => {
          itcCgst += item.tax.cgstAmount;
          itcSgst += item.tax.sgstAmount;
          itcIgst += item.tax.igstAmount;
        });
      });

    return {
      financialYear,
      period: 'FY ' + financialYear,
      outwardTaxableSupplies: {
        taxableValue: gstr1.totalTaxable,
        cgst: gstr1.totalCgst,
        sgst: gstr1.totalSgst,
        igst: gstr1.totalIgst,
        cess: 0,
      },
      inwardSuppliesEligibleForItc: {
        allOtherItc: {
          taxableValue: Math.round(itcTaxable * 100) / 100,
          cgst: Math.round(itcCgst * 100) / 100,
          sgst: Math.round(itcSgst * 100) / 100,
          igst: Math.round(itcIgst * 100) / 100,
        },
      },
      netTaxPayable: {
        cgst: Math.max(0, Math.round((gstr1.totalCgst - itcCgst) * 100) / 100),
        sgst: Math.max(0, Math.round((gstr1.totalSgst - itcSgst) * 100) / 100),
        igst: Math.max(0, Math.round((gstr1.totalIgst - itcIgst) * 100) / 100),
      },
    };
  };

  // ==========================================================================
  // SAAS SUBSCRIPTION & FEATURE GATING
  // ==========================================================================
  const upgradeSubscription = (planId: SubscriptionPlanId, cycle: 'monthly' | 'annual', razorpayPaymentId?: string): boolean => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) return false;

    const amount = cycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
    const now = new Date();
    const expiry = new Date(now);
    if (cycle === 'annual') expiry.setFullYear(expiry.getFullYear() + 1);
    else expiry.setMonth(expiry.getMonth() + 1);

    const newPayment = {
      id: `sub-pay-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      amount,
      planId,
      billingCycle: cycle,
      paymentMethod: razorpayPaymentId ? 'Razorpay Auto-Debit' : 'Direct Verification',
      razorpayPaymentId: razorpayPaymentId || `pay_sim_${Date.now()}`,
      status: 'success' as const,
      invoiceUrl: '#',
    };

    setSubscription((prev) => ({
      ...prev,
      planId,
      status: 'active',
      billingCycle: cycle,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: expiry.toISOString(),
      paymentHistory: [newPayment, ...prev.paymentHistory],
    }));

    return true;
  };

  const cancelSubscription = () => {
    setSubscription((prev) => ({
      ...prev,
      cancelAtPeriodEnd: true,
    }));
  };

  const checkFeatureAccess = (featureKey: keyof typeof SUBSCRIPTION_PLANS[0]['limits']): boolean => {
    const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId) || SUBSCRIPTION_PLANS[0];
    const limit = currentPlan.limits[featureKey];
    if (typeof limit === 'boolean') return limit;
    if (typeof limit === 'number') {
      if (limit === -1) return true; // unlimited
      if (featureKey === 'invoicesPerMonth') return subscription.usageCounters.invoicesCreatedThisMonth < limit;
      if (featureKey === 'partiesMax') return subscription.usageCounters.partiesCreated < limit;
      if (featureKey === 'warehousesMax') return subscription.usageCounters.warehousesCreated < limit;
    }
    return true;
  };

  const updateBillingSettings = (patch: Partial<BillingSettingsConfig>) => {
    setBillingSettings((prev) => ({ ...prev, ...patch }));
  };

  // ==========================================================================
  // IDEMPOTENT E-COMMERCE SYNCHRONIZATION BUS
  // ==========================================================================
  const syncEcommerceOrder = (order: Order, eventType: SyncEventType): boolean => {
    // 1. Idempotency Check: Prevent duplicate processing
    const isAlreadyProcessed = syncEvents.some(
      (ev) => ev.sourceId === order.id && ev.eventType === eventType && ev.status === 'processed'
    );
    if (isAlreadyProcessed) {
      console.log(`[SyncBus] Idempotent skip: ${eventType} already processed for Order ${order.orderNumber}`);
      return true;
    }

    const eventRecord: SyncEventRecord = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventType,
      sourceId: order.id,
      sourceNumber: order.orderNumber,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString(),
      payloadSnapshot: { orderId: order.id, orderNumber: order.orderNumber, total: order.total },
    };

    try {
      // 2. Find or synchronize Customer in Business Parties
      const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
      let party = parties.find(
        (p) => (p.phone || '').replace(/[^0-9]/g, '').slice(-10) === cleanPhone
      );

      if (!party && billingSettings.autoSyncEcommerceCustomers) {
        party = addParty({
          type: 'customer',
          name: order.customerName || 'Online Customer',
          phone: order.customerPhone || '',
          email: order.customerEmail || '',
          billingAddress: {
            name: order.address?.name || order.customerName,
            phone: order.address?.mobile || order.customerPhone,
            street: order.address?.street || 'Doorstep Pickup',
            city: order.address?.city || 'Rewa',
            state: order.address?.state || 'Madhya Pradesh',
            pincode: order.address?.pincode || '486001',
          },
          openingBalance: 0,
          currentBalance: 0,
          notes: 'Auto-synchronized from E-commerce Storefront',
        });
      }

      // 3. Process event types
      if (eventType === 'order.created' || eventType === 'order.confirmed') {
        // Generate Sales Order or Tax Invoice
        const docType: DocumentType = billingSettings.autoGenerateInvoiceOnConfirmedOrder ? 'tax_invoice' : 'sales_order';

        // Check if invoice already exists for this order
        const existingDoc = documents.find((d) => d.sourceOrderId === order.id && d.documentType === docType);
        if (!existingDoc) {
          createDocument({
            documentType: docType,
            sourceOrderId: order.id,
            sourceOrderNumber: order.orderNumber,
            partyId: party ? party.id : 'pty-walkin',
            partyName: order.customerName,
            partyPhone: order.customerPhone,
            date: order.createdAt ? order.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            items: order.items.map((it) => ({
              itemId: it.serviceId,
              name: it.service.name,
              quantity: it.quantity,
              unit: it.service.unit || 'Piece',
              unitPrice: it.selectedPrice,
              gstRate: billingSettings.defaultGstRate,
            })),
            shippingCharges: order.deliveryFee || 0,
            paidAmount: order.paymentStatus === 'Paid' ? order.total : (order.paidAmount || 0),
            notes: `Auto-generated from E-commerce Order #${order.orderNumber} (${order.paymentMethod})`,
          });
        }
      } else if (eventType === 'payment.received') {
        const targetDoc = documents.find((d) => d.sourceOrderId === order.id);
        if (targetDoc && targetDoc.status !== 'paid') {
          recordDocumentPayment(
            targetDoc.id,
            order.paidAmount || order.total,
            order.paymentMethod === 'Cash on Delivery' ? 'Cash' : 'Razorpay',
            order.razorpayPaymentId || order.orderNumber
          );
        }
      } else if (eventType === 'order.cancelled') {
        // Find document and mark cancelled, reverse stock if applied
        const targetDoc = documents.find((d) => d.sourceOrderId === order.id);
        if (targetDoc) {
          updateDocument(targetDoc.id, { status: 'cancelled' });
          // Create Credit Note reversal if paid
          if (targetDoc.paidAmount > 0) {
            createDocument({
              documentType: 'credit_note',
              referenceNumber: targetDoc.documentNumber,
              partyId: targetDoc.partyId,
              date: new Date().toISOString().split('T')[0],
              items: targetDoc.items,
              notes: `Order cancellation refund for ${order.orderNumber}`,
            });
          }
        }
      }

      eventRecord.status = 'processed';
      eventRecord.processedAt = new Date().toISOString();
      setSyncEvents((prev) => [eventRecord, ...prev]);
      return true;
    } catch (err: any) {
      console.error('[SyncBus] Error processing event', err);
      eventRecord.status = 'failed';
      eventRecord.error = err?.message || 'Unknown synchronization error';
      setSyncEvents((prev) => [eventRecord, ...prev]);
      return false;
    }
  };

  const retrySyncEvent = (eventId: string) => {
    const ev = syncEvents.find((e) => e.id === eventId);
    if (!ev) return;
    // Reset status to pending and re-trigger
    setSyncEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: 'pending', retryCount: e.retryCount + 1 } : e))
    );
  };

  const eraseAllBusinessData = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('laundry_lounge_') || key.startsWith('mbb_business_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error(e);
    }

    setDocuments([]);
    setParties([]);
    setStockLedger([]);
    setStockAdjustments([]);
    setStockTransfers([]);
    setJournalEntries([]);
    setSyncEvents([]);

    setChartOfAccounts((prev) =>
      prev.map((acc) => ({ ...acc, openingBalance: 0, currentBalance: 0 }))
    );

    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        openingStock: 0,
        currentStock: 0,
        warehouseStock: {},
      }))
    );

    setSubscription((prev) => ({
      ...prev,
      usageCounters: {
        invoicesCreatedThisMonth: 0,
        partiesCreated: 0,
        warehousesCreated: warehouses.length,
      },
    }));
  };

  return (
    <BusinessContext.Provider
      value={{
        documents,
        createDocument,
        updateDocument,
        deleteDocument,
        recordDocumentPayment,
        getNextDocumentNumber,

        parties,
        setParties,
        addParty,
        updateParty,
        deleteParty,
        getPartyById,

        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        warehouses,
        addWarehouse,
        updateWarehouse,
        deleteWarehouse,
        stockLedger,
        setStockLedger,
        stockAdjustments,
        recordStockAdjustment,
        stockTransfers,
        recordStockTransfer,
        completeStockTransfer,

        chartOfAccounts,
        journalEntries,
        setJournalEntries,
        createJournalEntry,
        getTrialBalance,
        getProfitAndLoss,
        getBalanceSheet,

        getGstr1Summary,
        getGstr3bSummary,

        subscription,
        upgradeSubscription,
        cancelSubscription,
        checkFeatureAccess,

        billingSettings,
        updateBillingSettings,
        syncEvents,
        syncEcommerceOrder,
        retrySyncEvent,
        eraseAllBusinessData,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
