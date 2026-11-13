import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import {
  DocumentType,
  BusinessDocument,
  DocumentStatus,
  DocumentLineItem,
} from '../../../business/types';
import {
  Plus,
  Search,
  Filter,
  Printer,
  Download,
  Share2,
  Eye,
  CheckCircle2,
  Trash2,
  Edit2,
  FileText,
  DollarSign,
  MessageCircle,
  Copy,
  Receipt,
  X,
  CreditCard,
  Building2,
  AlertCircle,
  RefreshCw,
  QrCode,
  Tag,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { numberToWordsINR } from '../../../utils/numberToWords';

export const BillingInvoicesView: React.FC = () => {
  const {
    documents,
    createDocument,
    updateDocument,
    deleteDocument,
    recordDocumentPayment,
    getNextDocumentNumber,
    parties,
    products,
    warehouses,
    billingSettings,
  } = useBusiness();

  const { showToast, businessSettings } = useApp();

  // Filters
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<BusinessDocument | null>(null);
  const [printLayout, setPrintLayout] = useState<'a4' | 'thermal'>('a4');
  const [paymentModalDoc, setPaymentModalDoc] = useState<BusinessDocument | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [paymentRef, setPaymentRef] = useState('');

  // Create document form state
  const [newDocType, setNewDocType] = useState<DocumentType>('tax_invoice');
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [docDate, setDocDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [shippingCharges, setShippingCharges] = useState<number>(0);
  const [additionalDiscount, setAdditionalDiscount] = useState<number>(0);
  const [paidAtCreation, setPaidAtCreation] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Thank you for choosing The Laundry Lounge!');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0]?.id || 'wh-main');

  // Line items state
  const [lineItems, setLineItems] = useState<
    {
      productId: string;
      name: string;
      hsnSac: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      discountPercent: number;
      gstRate: number;
    }[]
  >([
    {
      productId: products[0]?.id || '',
      name: products[0]?.name || 'Garment Dry Clean',
      hsnSac: products[0]?.hsnSac || '998714',
      quantity: 1,
      unit: products[0]?.unit || 'Piece',
      unitPrice: products[0]?.sellingPrice || 100,
      discountPercent: 0,
      gstRate: 18,
    },
  ]);

  // Document types tab configuration
  const docTypeTabs: { type: string; label: string }[] = [
    { type: 'all', label: 'All Documents' },
    { type: 'tax_invoice', label: 'GST Invoices' },
    { type: 'bill_of_supply', label: 'Non-GST Bills' },
    { type: 'quotation', label: 'Quotations' },
    { type: 'estimate', label: 'Estimates' },
    { type: 'proforma', label: 'Proforma' },
    { type: 'sales_order', label: 'Sales Orders' },
    { type: 'delivery_challan', label: 'Delivery Challans' },
    { type: 'sales_return', label: 'Sales Returns' },
    { type: 'credit_note', label: 'Credit Notes' },
  ];

  // Filtered documents list
  const filteredDocuments = documents.filter((doc) => {
    // Exclude purchase docs here (handled in Purchase Management)
    if (doc.documentType === 'purchase_bill' || doc.documentType === 'purchase_order' || doc.documentType === 'purchase_return') {
      return false;
    }
    if (docTypeFilter !== 'all' && doc.documentType !== docTypeFilter) return false;
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = doc.documentNumber.toLowerCase().includes(q);
      const matchName = doc.partyName.toLowerCase().includes(q);
      const matchPhone = (doc.partyPhone || '').includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  // Handle adding line item
  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        productId: products[0]?.id || '',
        name: products[0]?.name || 'Garment Item',
        hsnSac: products[0]?.hsnSac || '998714',
        quantity: 1,
        unit: products[0]?.unit || 'Piece',
        unitPrice: products[0]?.sellingPrice || 50,
        discountPercent: 0,
        gstRate: 18,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setLineItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        productId: prod.id,
        name: prod.name,
        hsnSac: prod.hsnSac,
        unit: prod.unit,
        unitPrice: prod.sellingPrice,
        gstRate: prod.gstRate,
      };
      return copy;
    });
  };

  // Submit create document
  const handleCreateDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      showToast('Please add at least one line item', 'error');
      return;
    }

    const party = parties.find((p) => p.id === selectedPartyId);
    const doc = createDocument({
      documentType: newDocType,
      partyId: selectedPartyId || (parties[0]?.id || 'pty-walkin'),
      partyName: party?.name || 'Walk-in Customer',
      partyPhone: party?.phone || '',
      partyGstin: party?.gstin,
      date: docDate,
      dueDate: dueDate || undefined,
      warehouseId: selectedWarehouseId,
      shippingCharges: Number(shippingCharges) || 0,
      additionalDiscount: Number(additionalDiscount) || 0,
      paidAmount: Number(paidAtCreation) || 0,
      notes,
      items: lineItems.map((li) => ({
        itemId: li.productId,
        name: li.name,
        hsnSac: li.hsnSac,
        quantity: Number(li.quantity),
        unit: li.unit,
        unitPrice: Number(li.unitPrice),
        discountPercent: Number(li.discountPercent),
        gstRate: Number(li.gstRate),
      })),
    });

    showToast(`Document ${doc.documentNumber} generated successfully!`, 'success');
    setShowCreateModal(false);
    setViewingDoc(doc);
  };

  // WhatsApp Share helper
  const handleShareWhatsApp = (doc: BusinessDocument) => {
    const cleanPhone = (doc.partyPhone || '').replace(/[^0-9]/g, '');
    const phoneParam = cleanPhone.length >= 10 ? (cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`) : '';
    const message = `Hello ${doc.partyName}!%0A%0AYour ${doc.documentType.toUpperCase().replace('_', ' ')} *#${doc.documentNumber}* dated ${doc.date} from *${businessSettings.businessName}* has been issued.%0A%0A*Bill Summary:*%0A• Total Amount: ₹${doc.totalAmount}%0A• Paid: ₹${doc.paidAmount}%0A• Balance Due: *₹${doc.dueAmount}*%0A%0APay online via UPI: ${businessSettings.upiId}%0AThank you! 🧺`;
    window.open(`https://wa.me/${phoneParam}?text=${message}`, '_blank');
  };

  // Record payment submit
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalDoc) return;
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }
    recordDocumentPayment(paymentModalDoc.id, amt, paymentMode, paymentRef);
    showToast(`Payment of ₹${amt} allocated to ${paymentModalDoc.documentNumber}!`, 'success');
    setPaymentModalDoc(null);
    setPaymentAmount('');
    setPaymentRef('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & New Document Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-brand-600" />
            <span>Billing, Invoicing &amp; Quotations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create GST &amp; Non-GST Invoices, Quotations, Proforma, Challans &amp; Credit Notes with Indian FY numbering.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPartyId(parties[0]?.id || '');
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Invoice / Quotation</span>
        </button>
      </div>

      {/* Document Types Tabs Bar */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
        {docTypeTabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setDocTypeFilter(tab.type)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              docTypeFilter === tab.type
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by invoice #, customer name, mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="issued">Unpaid / Issued</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Document Details</th>
                <th className="py-3 px-4">Party / Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date &amp; Due</th>
                <th className="py-3 px-4">Amount (₹)</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-black text-brand-700 text-[13px]">
                      {doc.documentNumber}
                    </div>
                    {doc.sourceOrderNumber && (
                      <span className="text-[10px] text-sky-600 font-bold bg-sky-50 px-1.5 py-0.5 rounded">
                        🌐 Web Order: {doc.sourceOrderNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{doc.partyName}</div>
                    <div className="text-[11px] text-slate-400">{doc.partyPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {doc.documentType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{doc.date}</div>
                    {doc.dueDate && <div className="text-[10px] text-rose-500">Due: {doc.dueDate}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-black text-slate-900 text-[13px]">
                      ₹{doc.totalAmount.toLocaleString('en-IN')}
                    </div>
                    {doc.dueAmount > 0 && (
                      <div className="text-[10px] text-rose-600 font-bold">
                        Due: ₹{doc.dueAmount.toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        doc.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'partially_paid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {doc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => {
                          setViewingDoc(doc);
                          setPrintLayout('a4');
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                        title="View / Print Tax Invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleShareWhatsApp(doc)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      {doc.dueAmount > 0 && (
                        <button
                          onClick={() => {
                            setPaymentModalDoc(doc);
                            setPaymentAmount(doc.dueAmount.toString());
                          }}
                          className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-[10px] font-bold"
                          title="Record Payment"
                        >
                          + Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DOCUMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Create Business Document ({newDocType.replace('_', ' ').toUpperCase()})
                </h3>
                <p className="text-xs text-slate-500">Next Number: {getNextDocumentNumber(newDocType)}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateDocumentSubmit} className="space-y-5">
              {/* Top Row: Type, Party, Date, Due Date, Warehouse */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Document Type</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="tax_invoice">GST Tax Invoice</option>
                    <option value="bill_of_supply">Non-GST Bill of Supply</option>
                    <option value="quotation">Quotation / Proposal</option>
                    <option value="estimate">Estimate</option>
                    <option value="proforma">Proforma Invoice</option>
                    <option value="sales_order">Sales Order</option>
                    <option value="delivery_challan">Delivery Challan</option>
                    <option value="sales_return">Sales Return</option>
                    <option value="credit_note">Credit Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Party</label>
                  <select
                    value={selectedPartyId}
                    onChange={(e) => setSelectedPartyId(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.phone}) {p.companyName ? `— ${p.companyName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse / Hub</label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Document Date</label>
                  <input
                    type="date"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Line Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-700">Line Items &amp; Taxes</span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((li, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 items-center text-xs"
                    >
                      <div className="col-span-12 sm:col-span-4">
                        <select
                          value={li.productId}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (₹{p.sellingPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          min={1}
                          value={li.quantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLineItems((prev) => {
                              const c = [...prev];
                              c[index].quantity = Number(val);
                              return c;
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center font-bold"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="number"
                          placeholder="Rate ₹"
                          value={li.unitPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLineItems((prev) => {
                              const c = [...prev];
                              c[index].unitPrice = Number(val);
                              return c;
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-right font-bold"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2">
                        <select
                          value={li.gstRate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLineItems((prev) => {
                              const c = [...prev];
                              c[index].gstRate = Number(val);
                              return c;
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold"
                        >
                          <option value={0}>0% GST</option>
                          <option value={5}>5% GST</option>
                          <option value={12}>12% GST</option>
                          <option value={18}>18% GST</option>
                          <option value={28}>28% GST</option>
                        </select>
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(index)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adjustments and Immediate Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shipping / Delivery (₹)</label>
                  <input
                    type="number"
                    value={shippingCharges}
                    onChange={(e) => setShippingCharges(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Additional Discount (₹)</label>
                  <input
                    type="number"
                    value={additionalDiscount}
                    onChange={(e) => setAdditionalDiscount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paid Amount Now (₹)</label>
                  <input
                    type="number"
                    value={paidAtCreation}
                    onChange={(e) => setPaidAtCreation(Number(e.target.value))}
                    placeholder="Enter paid advance"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Generate Document &amp; Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PRINT MODAL (A4 Modern + Thermal Receipt 80mm) */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Top Bar with Layout Switcher & Print Button */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPrintLayout('a4')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    printLayout === 'a4' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  A4 Modern Invoice
                </button>
                <button
                  onClick={() => setPrintLayout('thermal')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    printLayout === 'thermal' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Thermal Receipt (80mm)
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINT CONTENT: A4 MODERN */}
            {printLayout === 'a4' && (
              <div className="p-6 border border-slate-200 rounded-2xl bg-white text-slate-900 space-y-6 text-xs font-sans">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h1 className="text-xl font-black text-brand-900">{businessSettings.businessName}</h1>
                    <p className="text-[11px] text-slate-500">{businessSettings.tagline}</p>
                    <p className="text-[11px] text-slate-600 mt-1 max-w-sm">{businessSettings.address}</p>
                    <p className="text-[11px] text-slate-700 font-bold mt-1">
                      GSTIN: {businessSettings.gstin} | Phone: {businessSettings.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-3 py-1 rounded-lg">
                      {viewingDoc.documentType.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="font-mono font-black text-sm text-brand-700 mt-2">
                      #{viewingDoc.documentNumber}
                    </div>
                    <div className="text-slate-500 mt-0.5">Date: {viewingDoc.date}</div>
                    {viewingDoc.dueDate && <div className="text-rose-600 font-bold">Due: {viewingDoc.dueDate}</div>}
                  </div>
                </div>

                {/* Bill To Info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Bill To (Party)</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{viewingDoc.partyName}</div>
                    <div className="text-slate-600">{viewingDoc.partyPhone}</div>
                    <div className="text-slate-500 text-[11px]">
                      {viewingDoc.billingAddress?.street}, {viewingDoc.billingAddress?.city}
                    </div>
                    {viewingDoc.partyGstin && (
                      <div className="text-[10px] font-bold text-brand-700 mt-1">
                        GSTIN: {viewingDoc.partyGstin}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Place of Supply</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {viewingDoc.billingAddress?.state || 'Madhya Pradesh'} (23)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Reverse Charge: No | Inter-State: {viewingDoc.isInterstate ? 'Yes (IGST)' : 'No (CGST+SGST)'}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3">HSN/SAC</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Rate</th>
                      <th className="py-2 px-3 text-right">Taxable</th>
                      <th className="py-2 px-3 text-right">GST</th>
                      <th className="py-2 px-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingDoc.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">{item.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{item.hsnSac}</td>
                        <td className="py-2 px-3 text-center">{item.quantity} {item.unit}</td>
                        <td className="py-2 px-3 text-right">₹{item.unitPrice}</td>
                        <td className="py-2 px-3 text-right">₹{item.taxableAmount.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-[11px] text-slate-600">
                          {item.gstRate}% (₹{item.tax.totalTax.toFixed(2)})
                        </td>
                        <td className="py-2 px-3 text-right font-black text-slate-900">
                          ₹{item.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals & UPI Pay */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Amount in Words</div>
                      <div className="font-bold text-slate-700 capitalize">
                        {numberToWordsINR(viewingDoc.totalAmount)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                      <QRCodeSVG
                        value={`upi://pay?pa=${businessSettings.upiId}&pn=${encodeURIComponent(
                          businessSettings.businessName
                        )}&am=${viewingDoc.dueAmount}&cu=INR`}
                        size={64}
                      />
                      <div>
                        <div className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                          Scan to Pay via Any UPI App
                        </div>
                        <div className="text-[11px] font-mono text-emerald-900 font-bold">
                          {businessSettings.upiId}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">PhonePe • GPay • Paytm • BHIM</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-right font-medium">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal (Taxable Amount):</span>
                      <span className="font-bold">₹{viewingDoc.subtotal.toFixed(2)}</span>
                    </div>
                    {viewingDoc.shippingCharges > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Shipping / Delivery Charges:</span>
                        <span className="font-bold">₹{viewingDoc.shippingCharges.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Total GST Tax:</span>
                      <span className="font-bold">
                        ₹
                        {viewingDoc.items
                          .reduce((s, it) => s + it.tax.totalTax, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Grand Total:</span>
                      <span>₹{viewingDoc.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Paid Amount:</span>
                      <span>₹{viewingDoc.paidAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-black">
                      <span>Balance Due:</span>
                      <span>₹{viewingDoc.dueAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Terms */}
                <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                  <div>
                    <span className="font-bold text-slate-700">Terms &amp; Conditions:</span>
                    <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                      {viewingDoc.termsAndConditions?.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-800 font-bold">For {businessSettings.businessName}</div>
                    <div className="mt-8 font-semibold text-slate-400">Authorized Signatory</div>
                  </div>
                </div>
              </div>
            )}

            {/* PRINT CONTENT: THERMAL RECEIPT (80mm) */}
            {printLayout === 'thermal' && (
              <div className="max-w-[320px] mx-auto p-4 border border-dashed border-slate-300 rounded-xl bg-white text-slate-900 font-mono text-[11px] space-y-3">
                <div className="text-center space-y-1">
                  <div className="font-black text-sm uppercase">{businessSettings.businessName}</div>
                  <div className="text-[10px]">{businessSettings.address}</div>
                  <div className="text-[10px]">Ph: {businessSettings.phone}</div>
                  <div className="text-[10px]">GSTIN: {businessSettings.gstin}</div>
                  <div className="border-t border-dashed border-slate-300 my-1" />
                  <div className="font-bold uppercase">{viewingDoc.documentType.replace('_', ' ')}</div>
                  <div className="font-bold">Doc #: {viewingDoc.documentNumber}</div>
                  <div className="text-[10px]">Date: {viewingDoc.date}</div>
                </div>

                <div className="border-t border-dashed border-slate-300 my-1" />

                <div>
                  <div className="font-bold">Cust: {viewingDoc.partyName}</div>
                  <div className="text-[10px]">Mob: {viewingDoc.partyPhone}</div>
                </div>

                <div className="border-t border-dashed border-slate-300 my-1" />

                <div className="space-y-1">
                  {viewingDoc.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate pr-1">{it.name} x{it.quantity}</span>
                      <span className="font-bold shrink-0">₹{it.totalAmount.toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-300 my-1" />

                <div className="space-y-0.5 text-right font-bold">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{viewingDoc.subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST):</span>
                    <span>
                      ₹
                      {viewingDoc.items
                        .reduce((s, it) => s + it.tax.totalTax, 0)
                        .toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-black">
                    <span>TOTAL:</span>
                    <span>₹{viewingDoc.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>PAID:</span>
                    <span>₹{viewingDoc.paidAmount}</span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>DUE:</span>
                    <span>₹{viewingDoc.dueAmount}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 my-1" />

                <div className="text-center space-y-1">
                  <div className="text-[10px]">Thank you for visiting!</div>
                  <div className="text-[9px] text-slate-400">All disputes subject to Rewa jurisdiction</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {paymentModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Record Payment for #{paymentModalDoc.documentNumber}
              </h3>
              <button
                onClick={() => setPaymentModalDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Total Due: ₹{paymentModalDoc.dueAmount}</label>
                <input
                  type="number"
                  placeholder="Enter amount paid"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm text-brand-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Cash">Cash (Store Counter Drawer)</option>
                  <option value="UPI">UPI (PhonePe / GPay QR)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Reference / UTR # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / Bank Txn ID"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalDoc(null)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm"
                >
                  Confirm Payment Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

