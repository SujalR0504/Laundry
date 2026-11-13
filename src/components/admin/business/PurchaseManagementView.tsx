import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import { BusinessDocument, DocumentType } from '../../../business/types';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  FileText,
  RotateCcw,
  Building2,
} from 'lucide-react';

export const PurchaseManagementView: React.FC = () => {
  const {
    documents,
    createDocument,
    parties,
    products,
    warehouses,
    recordDocumentPayment,
    getNextDocumentNumber,
  } = useBusiness();

  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'purchase_bill' | 'purchase_order' | 'purchase_return'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentModalDoc, setPaymentModalDoc] = useState<BusinessDocument | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'Bank Transfer' | 'Cash' | 'UPI'>('Bank Transfer');

  // New purchase bill form state
  const [docType, setDocType] = useState<DocumentType>('purchase_bill');
  const [supplierId, setSupplierId] = useState<string>('');
  const [billDate, setBillDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [billDueDate, setBillDueDate] = useState<string>('');
  const [refBillNumber, setRefBillNumber] = useState<string>(''); // Supplier's invoice #
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0]?.id || 'wh-main');
  const [shippingCharges, setShippingCharges] = useState<number>(0);
  const [paidAdvance, setPaidAdvance] = useState<number>(0);

  const [lineItems, setLineItems] = useState<
    {
      productId: string;
      name: string;
      hsnSac: string;
      quantity: number;
      unit: string;
      purchaseRate: number;
      gstRate: number;
    }[]
  >([
    {
      productId: products[0]?.id || '',
      name: products[0]?.name || 'Consumable Item',
      hsnSac: products[0]?.hsnSac || '34029019',
      quantity: 10,
      unit: products[0]?.unit || 'Can',
      purchaseRate: products[0]?.purchasePrice || 480,
      gstRate: 18,
    },
  ]);

  // Suppliers list
  const suppliers = parties.filter((p) => p.type === 'supplier' || p.type === 'both');

  // Filtered purchase documents
  const purchaseDocs = documents.filter((doc) => {
    const isPurchase =
      doc.documentType === 'purchase_bill' ||
      doc.documentType === 'purchase_order' ||
      doc.documentType === 'purchase_return';
    if (!isPurchase) return false;
    if (activeTab !== 'all' && doc.documentType !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = doc.documentNumber.toLowerCase().includes(q);
      const matchRef = (doc.referenceNumber || '').toLowerCase().includes(q);
      const matchParty = doc.partyName.toLowerCase().includes(q);
      if (!matchNum && !matchRef && !matchParty) return false;
    }
    return true;
  });

  const totalPurchasesAmount = purchaseDocs
    .filter((d) => d.documentType === 'purchase_bill')
    .reduce((sum, d) => sum + d.totalAmount, 0);

  const totalOutstandingToSuppliers = purchaseDocs
    .filter((d) => d.documentType === 'purchase_bill')
    .reduce((sum, d) => sum + d.dueAmount, 0);

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        productId: products[0]?.id || '',
        name: products[0]?.name || 'Item',
        hsnSac: products[0]?.hsnSac || '34029019',
        quantity: 5,
        unit: products[0]?.unit || 'Can',
        purchaseRate: products[0]?.purchasePrice || 200,
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
        purchaseRate: prod.purchasePrice,
        gstRate: prod.gstRate,
      };
      return copy;
    });
  };

  const handleCreatePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = parties.find((p) => p.id === supplierId) || suppliers[0];
    if (!supplier) {
      showToast('Please select or add a supplier vendor', 'error');
      return;
    }

    const doc = createDocument({
      documentType: docType,
      partyId: supplier.id,
      partyName: supplier.name,
      partyPhone: supplier.phone,
      partyGstin: supplier.gstin,
      referenceNumber: refBillNumber || undefined,
      date: billDate,
      dueDate: billDueDate || undefined,
      warehouseId: selectedWarehouseId,
      shippingCharges: Number(shippingCharges) || 0,
      paidAmount: Number(paidAdvance) || 0,
      items: lineItems.map((li) => ({
        itemId: li.productId,
        name: li.name,
        hsnSac: li.hsnSac,
        quantity: Number(li.quantity),
        unit: li.unit,
        unitPrice: Number(li.purchaseRate),
        discountPercent: 0,
        gstRate: Number(li.gstRate),
        warehouseId: selectedWarehouseId,
      })),
      notes: `Inward Purchase Bill from ${supplier.name} with ITC credit claiming`,
    });

    showToast(`Purchase Document ${doc.documentNumber} recorded & stock updated!`, 'success');
    setShowCreateModal(false);
  };

  const handleRecordSupplierPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalDoc) return;
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    recordDocumentPayment(paymentModalDoc.id, amt, payMode);
    showToast(`Supplier payment of ₹${amt} posted successfully!`, 'success');
    setPaymentModalDoc(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
            <span>Purchase &amp; Inward Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record supplier bills, manage purchase orders, track input tax credit (ITC) and inward warehouse inventory.
          </p>
        </div>

        <button
          onClick={() => {
            setSupplierId(suppliers[0]?.id || '');
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Purchase Bill</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Inward Purchases</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{totalPurchasesAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Chemicals, Packaging, Machinery
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-amber-600 uppercase">Outstanding Supplier Dues</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ₹{totalOutstandingToSuppliers.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Payables to Vendor Accounts
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="text-xs font-bold text-emerald-600 uppercase">Input Tax Credit (ITC) Claimed</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹
            {purchaseDocs
              .reduce((sum, d) => sum + (d.totalAmount - d.subtotal), 0)
              .toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Eligible for GST Input Offset (GSTR-3B)
          </div>
        </div>
      </div>

      {/* Tabs Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Purchases ({purchaseDocs.length})
          </button>
          <button
            onClick={() => setActiveTab('purchase_bill')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'purchase_bill' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Purchase Bills
          </button>
          <button
            onClick={() => setActiveTab('purchase_order')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'purchase_order' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('purchase_return')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'purchase_return' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Purchase Returns
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search supplier, bill #, ref #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Purchase Documents Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Bill / Document #</th>
                <th className="py-3 px-4">Supplier (Vendor)</th>
                <th className="py-3 px-4">Date &amp; Due</th>
                <th className="py-3 px-4">Warehouse Received</th>
                <th className="py-3 px-4">Bill Total (₹)</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {purchaseDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-black text-amber-800 text-[13px]">
                      {doc.documentNumber}
                    </div>
                    {doc.referenceNumber && (
                      <div className="text-[10px] text-slate-500">Ref: {doc.referenceNumber}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{doc.partyName}</div>
                    {doc.partyGstin && (
                      <div className="text-[10px] text-brand-700 font-bold">GSTIN: {doc.partyGstin}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{doc.date}</div>
                    {doc.dueDate && <div className="text-[10px] text-rose-500">Due: {doc.dueDate}</div>}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-semibold">{warehouses.find((w) => w.id === doc.warehouseId)?.name || 'Main Hub'}</span>
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
                    {doc.dueAmount > 0 && (
                      <button
                        onClick={() => {
                          setPaymentModalDoc(doc);
                          setPayAmount(doc.dueAmount.toString());
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold"
                      >
                        + Pay Supplier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {purchaseDocs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No purchase bills recorded. Click "+ Record Purchase Bill" to add your first supplier bill.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PURCHASE BILL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Record Inward Purchase Bill</h3>
                <p className="text-xs text-slate-500">Document #: {getNextDocumentNumber('purchase_bill')}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchaseSubmit} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Select Supplier (Vendor)</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.companyName || s.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Vendor's Bill / Invoice #</label>
                  <input
                    type="text"
                    placeholder="e.g. DIV-INV-1092"
                    value={refBillNumber}
                    onChange={(e) => setRefBillNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Inward Warehouse</label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Bill Date</label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="uppercase text-slate-600">Purchased Items &amp; Consumables</span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-amber-600 hover:text-amber-700 font-bold"
                  >
                    + Add Item
                  </button>
                </div>

                {lineItems.map((li, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 items-center"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <select
                        value={li.productId}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (HSN: {p.hsnSac})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={li.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLineItems((prev) => {
                            const c = [...prev];
                            c[idx].quantity = Number(val);
                            return c;
                          });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        placeholder="Cost Rate ₹"
                        value={li.purchaseRate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLineItems((prev) => {
                            const c = [...prev];
                            c[idx].purchaseRate = Number(val);
                            return c;
                          });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-right"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <select
                        value={li.gstRate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLineItems((prev) => {
                            const c = [...prev];
                            c[idx].gstRate = Number(val);
                            return c;
                          });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm"
                >
                  Save Bill &amp; Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER PAYMENT MODAL */}
      {paymentModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Record Payment to {paymentModalDoc.partyName}
              </h3>
              <button
                onClick={() => setPaymentModalDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSupplierPayment} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">
                  Due Amount: ₹{paymentModalDoc.dueAmount}
                </label>
                <input
                  type="number"
                  placeholder="Enter amount paying"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm text-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS - SBI)</option>
                  <option value="UPI">UPI / PhonePe Merchant</option>
                  <option value="Cash">Cash (Counter Cash Drawer)</option>
                </select>
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  Confirm Supplier Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

