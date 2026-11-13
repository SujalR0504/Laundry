import { ImportCategory, TargetFieldDef } from './importTypes';

export interface CategoryInfo {
  category: ImportCategory;
  title: string;
  description: string;
  icon: string;
  dependencyRank: number; // lower means earlier in execution order
  targetFields: TargetFieldDef[];
  detectionKeywords: string[];
}

export const CATEGORY_REGISTRY: Record<ImportCategory, CategoryInfo> = {
  customers: {
    category: 'customers',
    title: 'Customers Master',
    description: 'Customer contact details, phone numbers, addresses, and GSTIN for Khata & billing.',
    icon: 'Users',
    dependencyRank: 2,
    detectionKeywords: ['customer', 'client', 'buyer', 'debitor', 'sundry debtor', 'party name', 'phone', 'mob no'],
    targetFields: [
      { key: 'name', label: 'Customer Name', required: true, type: 'string', aliases: ['name', 'customer name', 'party name', 'client name', 'customer', 'party'] },
      { key: 'phone', label: 'Mobile Number', required: true, type: 'phone', aliases: ['mob no.', 'mob no', 'mobile', 'mobile no', 'phone', 'phone number', 'contact', 'cell'] },
      { key: 'gstin', label: 'GSTIN / Tax ID', required: false, type: 'gstin', aliases: ['gst', 'gstin', 'gst no', 'gstin/uin', 'tax number', 'vat no'] },
      { key: 'email', label: 'Email Address', required: false, type: 'email', aliases: ['email', 'email id', 'e-mail', 'mail'] },
      { key: 'street', label: 'Billing Address', required: false, type: 'string', aliases: ['address', 'street', 'billing address', 'address line 1', 'addr'] },
      { key: 'city', label: 'City', required: false, type: 'string', aliases: ['city', 'town', 'district'] },
      { key: 'state', label: 'State', required: false, type: 'string', aliases: ['state', 'province', 'state name'] },
      { key: 'pincode', label: 'Pincode / ZIP', required: false, type: 'string', aliases: ['pincode', 'pin', 'postal code', 'zip', 'zipcode'] },
      { key: 'openingBalance', label: 'Opening Balance (₹)', required: false, type: 'number', aliases: ['opening balance', 'bal.', 'bal', 'balance', 'opening due', 'due amount', 'balance amount'] },
      { key: 'creditLimit', label: 'Credit Limit (₹)', required: false, type: 'number', aliases: ['credit limit', 'max credit', 'limit'] },
      { key: 'notes', label: 'Remarks / Category Tag', required: false, type: 'string', aliases: ['party category', 'category', 'notes', 'remarks', 'tags', 'group'] },
    ],
  },

  suppliers: {
    category: 'suppliers',
    title: 'Suppliers & Vendors',
    description: 'Vendor contact information, trade terms, and GSTIN.',
    icon: 'Truck',
    dependencyRank: 2,
    detectionKeywords: ['supplier', 'vendor', 'creditor', 'sundry creditor', 'seller', 'distributor'],
    targetFields: [
      { key: 'name', label: 'Supplier Name', required: true, type: 'string', aliases: ['supplier name', 'vendor name', 'name', 'party name', 'vendor'] },
      { key: 'phone', label: 'Phone Number', required: false, type: 'phone', aliases: ['mob no.', 'mobile', 'phone', 'contact', 'telephone'] },
      { key: 'gstin', label: 'GSTIN', required: false, type: 'gstin', aliases: ['gst', 'gstin', 'tax id'] },
      { key: 'email', label: 'Email', required: false, type: 'email', aliases: ['email', 'email id'] },
      { key: 'street', label: 'Address', required: false, type: 'string', aliases: ['address', 'street'] },
      { key: 'city', label: 'City', required: false, type: 'string', aliases: ['city'] },
      { key: 'state', label: 'State', required: false, type: 'string', aliases: ['state'] },
      { key: 'pincode', label: 'Pincode', required: false, type: 'string', aliases: ['pincode', 'pin', 'zip'] },
      { key: 'openingBalance', label: 'Opening Balance (Payable ₹)', required: false, type: 'number', aliases: ['opening balance', 'balance', 'bal', 'to pay'] },
    ],
  },

  all_party_balance: {
    category: 'all_party_balance',
    title: 'All Party Balance (My BillBook / Khata)',
    description: 'Multi-party balance report with debit (receivable) or credit (payable) khata balances.',
    icon: 'Scale',
    dependencyRank: 6,
    detectionKeywords: ['all party balance', 'to collect', 'to pay', 'dated', 'party category', 'bal.', 'party balance'],
    targetFields: [
      { key: 'name', label: 'Party Name', required: true, type: 'string', aliases: ['name', 'party name', 'customer name', 'account name'] },
      { key: 'gstin', label: 'GSTIN', required: false, type: 'gstin', aliases: ['gst', 'gstin', 'gst no'] },
      { key: 'street', label: 'Address', required: false, type: 'string', aliases: ['address', 'billing address', 'addr'] },
      { key: 'state', label: 'State', required: false, type: 'string', aliases: ['state', 'province'] },
      { key: 'pincode', label: 'Pincode', required: false, type: 'string', aliases: ['pincode', 'pin', 'zip'] },
      { key: 'phone', label: 'Mobile Number', required: false, type: 'phone', aliases: ['mob no.', 'mob no', 'mobile', 'phone', 'contact'] },
      { key: 'openingBalance', label: 'Balance Amount (₹)', required: true, type: 'number', aliases: ['bal.', 'bal', 'balance', 'closing balance', 'net balance', 'amount', 'due'] },
      { key: 'partyCategory', label: 'Party Category', required: false, type: 'string', aliases: ['party category', 'category', 'type', 'group', 'tag'] },
      { key: 'balanceType', label: 'Balance Type (Receivable/Payable)', required: false, type: 'enum', aliases: ['balance type', 'type', 'dr/cr', 'dr_cr'], options: ['Receivable', 'Payable'] },
    ],
  },

  products: {
    category: 'products',
    title: 'Products & Services Master',
    description: 'Catalog items, services, selling rates, purchase rates, HSN codes, and tax rates.',
    icon: 'Package',
    dependencyRank: 3,
    detectionKeywords: ['product', 'item name', 'item code', 'selling price', 'mrp', 'hsn', 'sac', 'barcode', 'sku'],
    targetFields: [
      { key: 'name', label: 'Item / Service Name', required: true, type: 'string', aliases: ['item name', 'product name', 'name', 'item', 'description', 'service'] },
      { key: 'sku', label: 'SKU Code', required: false, type: 'string', aliases: ['sku', 'item code', 'product code', 'item id', 'code'] },
      { key: 'barcode', label: 'Barcode / UPC', required: false, type: 'string', aliases: ['barcode', 'upc', 'ean'] },
      { key: 'category', label: 'Category', required: false, type: 'string', aliases: ['category', 'group', 'item group', 'department'] },
      { key: 'unit', label: 'Unit (Pcs, Kg, Litre, etc.)', required: false, type: 'string', aliases: ['unit', 'uom', 'measurement', 'uqc'] },
      { key: 'sellingPrice', label: 'Selling Price (₹)', required: true, type: 'number', aliases: ['selling price', 'sale price', 'rate', 'price', 'mrp', 'unit price'] },
      { key: 'purchasePrice', label: 'Purchase Price (₹)', required: false, type: 'number', aliases: ['purchase price', 'purchase rate', 'cost', 'cost price'] },
      { key: 'hsnSac', label: 'HSN / SAC Code', required: false, type: 'string', aliases: ['hsn', 'hsn code', 'sac', 'sac code', 'hsn/sac'] },
      { key: 'gstRate', label: 'GST Rate (%)', required: false, type: 'number', aliases: ['gst rate', 'tax rate', 'gst %', 'tax %', 'gst'] },
      { key: 'openingStock', label: 'Opening Stock Quantity', required: false, type: 'number', aliases: ['opening stock', 'stock', 'qty', 'opening qty', 'quantity'] },
      { key: 'minStockAlert', label: 'Low Stock Alert Threshold', required: false, type: 'number', aliases: ['low stock', 'min stock', 'alert qty', 'reorder level'] },
    ],
  },

  stock_inventory: {
    category: 'stock_inventory',
    title: 'Stock & Inventory Ledger',
    description: 'Stock batch adjustments, warehouse allocations, and opening inventory.',
    icon: 'Layers',
    dependencyRank: 5,
    detectionKeywords: ['stock ledger', 'stock adjustment', 'warehouse stock', 'opening stock', 'inventory valuation'],
    targetFields: [
      { key: 'productNameOrSku', label: 'Product Name / SKU', required: true, type: 'string', aliases: ['product', 'item name', 'sku', 'product name', 'item code'] },
      { key: 'warehouse', label: 'Warehouse Code / Name', required: false, type: 'string', aliases: ['warehouse', 'location', 'godown', 'branch'] },
      { key: 'quantity', label: 'Quantity', required: true, type: 'number', aliases: ['quantity', 'qty', 'stock qty', 'adjustment qty', 'count'] },
      { key: 'unitRate', label: 'Unit Valuation Rate (₹)', required: false, type: 'number', aliases: ['unit rate', 'rate', 'purchase rate', 'cost'] },
      { key: 'movementType', label: 'Movement Type', required: false, type: 'string', aliases: ['type', 'movement', 'adjustment type', 'reason'] },
      { key: 'date', label: 'Stock Date', required: false, type: 'date', aliases: ['date', 'as on date', 'stock date'] },
    ],
  },

  sales: {
    category: 'sales',
    title: 'Sales Orders',
    description: 'E-commerce and offline sales orders with items, pricing, and buyer references.',
    icon: 'ShoppingCart',
    dependencyRank: 7,
    detectionKeywords: ['sales order', 'so number', 'order date', 'order id', 'buyer name', 'dispatch'],
    targetFields: [
      { key: 'orderNumber', label: 'Order Number', required: true, type: 'string', aliases: ['order number', 'so number', 'order id', 'order no', 'so no'] },
      { key: 'date', label: 'Order Date', required: true, type: 'date', aliases: ['order date', 'date', 'booking date'] },
      { key: 'customerNameOrPhone', label: 'Customer Name / Phone', required: true, type: 'string', aliases: ['customer name', 'buyer', 'party name', 'customer', 'customer phone'] },
      { key: 'productNameOrSku', label: 'Product Name / SKU', required: true, type: 'string', aliases: ['item', 'product', 'item name', 'sku'] },
      { key: 'quantity', label: 'Quantity', required: true, type: 'number', aliases: ['qty', 'quantity'] },
      { key: 'unitPrice', label: 'Unit Price (₹)', required: true, type: 'number', aliases: ['price', 'rate', 'unit price'] },
      { key: 'discount', label: 'Discount Amount (₹)', required: false, type: 'number', aliases: ['discount', 'disc'] },
      { key: 'taxRate', label: 'Tax Rate (%)', required: false, type: 'number', aliases: ['tax', 'gst', 'gst rate'] },
      { key: 'totalAmount', label: 'Total Amount (₹)', required: false, type: 'number', aliases: ['total', 'order total', 'grand total', 'net amount'] },
    ],
  },

  purchases: {
    category: 'purchases',
    title: 'Purchase Orders & Bills',
    description: 'Procurement bills from suppliers, raw materials, and detergent purchases.',
    icon: 'Receipt',
    dependencyRank: 7,
    detectionKeywords: ['purchase order', 'po number', 'purchase bill', 'bill no', 'vendor invoice'],
    targetFields: [
      { key: 'billNumber', label: 'Bill / PO Number', required: true, type: 'string', aliases: ['bill number', 'po number', 'bill no', 'purchase bill no', 'invoice no'] },
      { key: 'date', label: 'Bill Date', required: true, type: 'date', aliases: ['date', 'bill date', 'po date'] },
      { key: 'supplierName', label: 'Supplier Name', required: true, type: 'string', aliases: ['supplier name', 'vendor', 'supplier', 'party name'] },
      { key: 'productNameOrSku', label: 'Product / Item Name', required: true, type: 'string', aliases: ['item', 'product', 'item name', 'sku'] },
      { key: 'quantity', label: 'Quantity', required: true, type: 'number', aliases: ['qty', 'quantity'] },
      { key: 'unitCost', label: 'Unit Cost (₹)', required: true, type: 'number', aliases: ['cost', 'rate', 'unit rate', 'purchase rate'] },
      { key: 'taxRate', label: 'Tax Rate (%)', required: false, type: 'number', aliases: ['tax', 'gst %', 'gst rate'] },
      { key: 'totalAmount', label: 'Total Amount (₹)', required: false, type: 'number', aliases: ['total', 'bill amount', 'grand total'] },
    ],
  },

  expenses: {
    category: 'expenses',
    title: 'Expenses Register',
    description: 'Rent, electricity, packaging, marketing, detergent, and operational expenses.',
    icon: 'DollarSign',
    dependencyRank: 8,
    detectionKeywords: ['expense', 'expense category', 'petty cash', 'expense date', 'payment mode', 'paid to'],
    targetFields: [
      { key: 'date', label: 'Expense Date', required: true, type: 'date', aliases: ['date', 'expense date', 'voucher date'] },
      { key: 'category', label: 'Expense Category', required: true, type: 'string', aliases: ['category', 'expense category', 'expense head', 'account'] },
      { key: 'amount', label: 'Amount (₹)', required: true, type: 'number', aliases: ['amount', 'expense amount', 'total', 'paid amount'] },
      { key: 'paymentMode', label: 'Payment Mode', required: false, type: 'string', aliases: ['payment mode', 'mode', 'paid via', 'account'] },
      { key: 'paidTo', label: 'Paid To', required: false, type: 'string', aliases: ['paid to', 'beneficiary', 'vendor', 'party'] },
      { key: 'notes', label: 'Notes / Remarks', required: false, type: 'string', aliases: ['notes', 'remarks', 'description', 'narration'] },
    ],
  },

  payments: {
    category: 'payments',
    title: 'Payment Vouchers & Receipts',
    description: 'Customer payment receipts and supplier payouts.',
    icon: 'CreditCard',
    dependencyRank: 8,
    detectionKeywords: ['payment voucher', 'receipt voucher', 'receipt no', 'payment mode', 'received from', 'amount received'],
    targetFields: [
      { key: 'date', label: 'Payment Date', required: true, type: 'date', aliases: ['date', 'payment date', 'receipt date'] },
      { key: 'partyName', label: 'Party Name', required: true, type: 'string', aliases: ['party name', 'customer name', 'received from', 'paid to', 'party'] },
      { key: 'voucherType', label: 'Type (Receipt / Payment)', required: true, type: 'string', aliases: ['type', 'voucher type', 'direction', 'transaction type'] },
      { key: 'amount', label: 'Amount (₹)', required: true, type: 'number', aliases: ['amount', 'amount received', 'paid amount', 'total'] },
      { key: 'paymentMode', label: 'Payment Mode', required: false, type: 'string', aliases: ['mode', 'payment mode', 'account', 'method'] },
      { key: 'referenceNumber', label: 'Reference / UTR / Cheque #', required: false, type: 'string', aliases: ['ref no', 'reference', 'utr', 'cheque no', 'transaction id'] },
    ],
  },

  sales_invoices: {
    category: 'sales_invoices',
    title: 'GST Sales Invoices',
    description: 'B2B & B2C GST Tax Invoices with tax breakdowns (CGST, SGST, IGST).',
    icon: 'FileText',
    dependencyRank: 7,
    detectionKeywords: ['tax invoice', 'invoice no', 'invoice date', 'place of supply', 'taxable value', 'cgst', 'sgst', 'igst'],
    targetFields: [
      { key: 'invoiceNumber', label: 'Invoice Number', required: true, type: 'string', aliases: ['invoice no', 'invoice number', 'inv no', 'bill no'] },
      { key: 'invoiceDate', label: 'Invoice Date', required: true, type: 'date', aliases: ['invoice date', 'date', 'dated'] },
      { key: 'customerName', label: 'Customer Name', required: true, type: 'string', aliases: ['customer name', 'party name', 'buyer', 'billed to'] },
      { key: 'customerPhone', label: 'Customer Phone', required: false, type: 'phone', aliases: ['mobile', 'phone', 'mob no'] },
      { key: 'customerGstin', label: 'Customer GSTIN', required: false, type: 'gstin', aliases: ['gstin', 'gstin/uin', 'gst no'] },
      { key: 'subtotal', label: 'Taxable Amount (₹)', required: true, type: 'number', aliases: ['taxable value', 'subtotal', 'taxable amount'] },
      { key: 'cgst', label: 'CGST (₹)', required: false, type: 'number', aliases: ['cgst', 'central tax', 'cgst amount'] },
      { key: 'sgst', label: 'SGST (₹)', required: false, type: 'number', aliases: ['sgst', 'state tax', 'sgst amount'] },
      { key: 'igst', label: 'IGST (₹)', required: false, type: 'number', aliases: ['igst', 'integrated tax', 'igst amount'] },
      { key: 'grandTotal', label: 'Grand Total (₹)', required: true, type: 'number', aliases: ['grand total', 'invoice total', 'total amount', 'total'] },
      { key: 'paidAmount', label: 'Paid Amount (₹)', required: false, type: 'number', aliases: ['paid amount', 'received', 'amount received'] },
    ],
  },

  purchase_invoices: {
    category: 'purchase_invoices',
    title: 'Purchase Bills (Inward)',
    description: 'Supplier invoices for ITC claims and inward GST reports.',
    icon: 'FileSpreadsheet',
    dependencyRank: 7,
    detectionKeywords: ['purchase invoice', 'supplier bill', 'vendor invoice no', 'itc eligible', 'inward supply'],
    targetFields: [
      { key: 'billNumber', label: 'Bill Number', required: true, type: 'string', aliases: ['bill no', 'invoice no', 'supplier invoice no', 'bill number'] },
      { key: 'billDate', label: 'Bill Date', required: true, type: 'date', aliases: ['date', 'bill date', 'invoice date'] },
      { key: 'supplierName', label: 'Supplier Name', required: true, type: 'string', aliases: ['supplier name', 'vendor name', 'party name'] },
      { key: 'supplierGstin', label: 'Supplier GSTIN', required: false, type: 'gstin', aliases: ['supplier gstin', 'gstin', 'gst no'] },
      { key: 'subtotal', label: 'Taxable Value (₹)', required: true, type: 'number', aliases: ['taxable value', 'subtotal', 'amount'] },
      { key: 'tax', label: 'Total Tax (₹)', required: false, type: 'number', aliases: ['tax', 'total tax', 'gst amount'] },
      { key: 'grandTotal', label: 'Grand Total (₹)', required: true, type: 'number', aliases: ['grand total', 'total amount', 'bill total'] },
    ],
  },

  customer_ledger: {
    category: 'customer_ledger',
    title: 'Customer Ledger Statement',
    description: 'Debit and credit transaction log for reconciling customer khata balances.',
    icon: 'BookOpen',
    dependencyRank: 9,
    detectionKeywords: ['customer ledger', 'account statement', 'party statement', 'debit balance', 'credit balance'],
    targetFields: [
      { key: 'date', label: 'Date', required: true, type: 'date', aliases: ['date', 'trans date', 'txn date'] },
      { key: 'customerName', label: 'Customer Name', required: true, type: 'string', aliases: ['customer name', 'party name', 'account name'] },
      { key: 'voucherType', label: 'Voucher Type', required: false, type: 'string', aliases: ['voucher type', 'particulars', 'type', 'narration'] },
      { key: 'voucherNumber', label: 'Voucher Number', required: false, type: 'string', aliases: ['voucher no', 'ref no', 'doc no'] },
      { key: 'debit', label: 'Debit (₹)', required: false, type: 'number', aliases: ['debit', 'dr', 'debit amount'] },
      { key: 'credit', label: 'Credit (₹)', required: false, type: 'number', aliases: ['credit', 'cr', 'credit amount'] },
      { key: 'balance', label: 'Running Balance (₹)', required: false, type: 'number', aliases: ['balance', 'closing balance', 'net balance'] },
    ],
  },

  supplier_ledger: {
    category: 'supplier_ledger',
    title: 'Supplier Ledger Statement',
    description: 'Debit and credit transaction log for vendor payments and bill settlement.',
    icon: 'BookOpen',
    dependencyRank: 9,
    detectionKeywords: ['supplier ledger', 'vendor ledger', 'vendor statement', 'bills payable'],
    targetFields: [
      { key: 'date', label: 'Date', required: true, type: 'date', aliases: ['date', 'txn date'] },
      { key: 'supplierName', label: 'Supplier Name', required: true, type: 'string', aliases: ['supplier name', 'vendor name', 'party name'] },
      { key: 'voucherType', label: 'Voucher Type', required: false, type: 'string', aliases: ['voucher type', 'particulars', 'type'] },
      { key: 'voucherNumber', label: 'Voucher Number', required: false, type: 'string', aliases: ['voucher no', 'bill no', 'doc no'] },
      { key: 'debit', label: 'Debit (₹)', required: false, type: 'number', aliases: ['debit', 'dr', 'payment'] },
      { key: 'credit', label: 'Credit (₹)', required: false, type: 'number', aliases: ['credit', 'cr', 'bill amount'] },
      { key: 'balance', label: 'Running Balance (₹)', required: false, type: 'number', aliases: ['balance', 'closing balance'] },
    ],
  },
};

