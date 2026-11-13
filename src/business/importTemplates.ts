import { ImportTemplate, ImportCategory, ImportColumnMapping } from './importTypes';

export const BUILTIN_TEMPLATES: ImportTemplate[] = [
  {
    id: 'tpl-laundry-lounge-parties',
    name: 'The Laundry Lounge / My BillBook Party Balance',
    category: 'all_party_balance',
    description: 'Auto-maps Name, GST, Address, State, Pincode, Mob No., Bal., Party Category with Receivable debit direction.',
    headerSignature: ['name', 'gst', 'address', 'state', 'pincode', 'mob no.', 'bal.', 'party category'],
    dateFormat: 'DD/MM/YYYY',
    duplicateStrategy: 'update',
    createdAt: '2026-10-31T00:00:00.000Z',
    columnMappings: [
      { sourceColumn: 'Name', targetField: 'name', required: true, transform: 'trim' },
      { sourceColumn: 'GST', targetField: 'gstin', required: false, transform: 'uppercase' },
      { sourceColumn: 'Address', targetField: 'street', required: false, transform: 'trim' },
      { sourceColumn: 'State', targetField: 'state', required: false, transform: 'trim' },
      { sourceColumn: 'Pincode', targetField: 'pincode', required: false, transform: 'trim' },
      { sourceColumn: 'Mob No.', targetField: 'phone', required: false, transform: 'phone_normalize' },
      { sourceColumn: 'Bal.', targetField: 'openingBalance', required: true, transform: 'number' },
      { sourceColumn: 'Party Category', targetField: 'partyCategory', required: false, transform: 'trim' },
    ],
  },
  {
    id: 'tpl-standard-customers',
    name: 'Standard Customer Contact List',
    category: 'customers',
    description: 'Imports customer contacts, phones, emails, and billing addresses.',
    headerSignature: ['customer name', 'phone', 'email', 'address', 'city', 'state'],
    dateFormat: 'DD/MM/YYYY',
    duplicateStrategy: 'skip',
    createdAt: '2026-11-01T00:00:00.000Z',
    columnMappings: [
      { sourceColumn: 'Customer Name', targetField: 'name', required: true, transform: 'trim' },
      { sourceColumn: 'Phone', targetField: 'phone', required: true, transform: 'phone_normalize' },
      { sourceColumn: 'Email', targetField: 'email', required: false, transform: 'lowercase' },
      { sourceColumn: 'Address', targetField: 'street', required: false, transform: 'trim' },
      { sourceColumn: 'City', targetField: 'city', required: false, transform: 'trim' },
      { sourceColumn: 'State', targetField: 'state', required: false, transform: 'trim' },
    ],
  },
  {
    id: 'tpl-ecommerce-products',
    name: 'E-Commerce Product Catalog',
    category: 'products',
    description: 'Imports product items with SKU, selling price, unit, HSN/SAC, and tax rates.',
    headerSignature: ['item name', 'sku', 'selling price', 'unit', 'hsn code', 'gst rate'],
    dateFormat: 'DD/MM/YYYY',
    duplicateStrategy: 'update',
    createdAt: '2026-11-01T00:00:00.000Z',
    columnMappings: [
      { sourceColumn: 'Item Name', targetField: 'name', required: true, transform: 'trim' },
      { sourceColumn: 'SKU', targetField: 'sku', required: false, transform: 'uppercase' },
      { sourceColumn: 'Selling Price', targetField: 'sellingPrice', required: true, transform: 'number' },
      { sourceColumn: 'Unit', targetField: 'unit', required: false, transform: 'trim' },
      { sourceColumn: 'HSN Code', targetField: 'hsnSac', required: false, transform: 'trim' },
      { sourceColumn: 'GST Rate', targetField: 'gstRate', required: false, transform: 'number' },
    ],
  },
  {
    id: 'tpl-gst-sales-register',
    name: 'GST Sales Invoice Register',
    category: 'sales_invoices',
    description: 'Imports tax invoices with taxable values, CGST, SGST, IGST, and customer identifiers.',
    headerSignature: ['invoice no', 'invoice date', 'customer name', 'taxable value', 'grand total'],
    dateFormat: 'DD/MM/YYYY',
    duplicateStrategy: 'skip',
    createdAt: '2026-11-01T00:00:00.000Z',
    columnMappings: [
      { sourceColumn: 'Invoice No', targetField: 'invoiceNumber', required: true, transform: 'uppercase' },
      { sourceColumn: 'Invoice Date', targetField: 'invoiceDate', required: true, transform: 'date' },
      { sourceColumn: 'Customer Name', targetField: 'customerName', required: true, transform: 'trim' },
      { sourceColumn: 'Taxable Value', targetField: 'subtotal', required: true, transform: 'number' },
      { sourceColumn: 'CGST', targetField: 'cgst', required: false, transform: 'number' },
      { sourceColumn: 'SGST', targetField: 'sgst', required: false, transform: 'number' },
      { sourceColumn: 'Grand Total', targetField: 'grandTotal', required: true, transform: 'number' },
    ],
  },
];

const LOCAL_STORAGE_TEMPLATES_KEY = 'mbb_import_templates';

export function loadSavedTemplates(): ImportTemplate[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TEMPLATES_KEY);
    if (!raw) return BUILTIN_TEMPLATES;
    const custom = JSON.parse(raw) as ImportTemplate[];
    return [...BUILTIN_TEMPLATES, ...custom];
  } catch (e) {
    return BUILTIN_TEMPLATES;
  }
}

export function saveCustomTemplate(template: Omit<ImportTemplate, 'id' | 'createdAt'>): ImportTemplate {
  const newTemplate: ImportTemplate = {
    ...template,
    id: `tpl-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TEMPLATES_KEY);
    const existing: ImportTemplate[] = raw ? JSON.parse(raw) : [];
    const updated = [newTemplate, ...existing];
    localStorage.setItem(LOCAL_STORAGE_TEMPLATES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save import template to localStorage:', e);
  }

  return newTemplate;
}

export function findMatchingTemplate(headers: string[], category: ImportCategory): ImportTemplate | undefined {
  const templates = loadSavedTemplates().filter((t) => t.category === category);
  const normHeaders = headers.map((h) => h.toLowerCase().trim());

  return templates.find((tpl) => {
    const matchCount = tpl.headerSignature.filter((sig) => normHeaders.some((h) => h === sig || h.includes(sig))).length;
    return matchCount >= Math.min(tpl.headerSignature.length, 3);
  });
}

