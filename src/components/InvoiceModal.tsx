import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { invoiceOrder, closeInvoice, businessSettings } = useApp();

  if (!invoiceOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeInvoice} />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden z-10 my-8 border border-slate-200">
        {/* Top Control Bar (hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">Tax Invoice: {invoiceOrder.orderNumber}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                invoiceOrder.paymentStatus === 'Paid'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {invoiceOrder.paymentStatus}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={closeInvoice}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 text-slate-800 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src="/logo-icon.png"
                    alt="The Laundry Lounge"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo-icon.jpg';
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-sky-700 leading-tight">
                    The Laundry <span className="text-red-600">Lounge</span>
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">Professional Laundry & Dry Cleaning — Rewa (M.P.)</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 mt-3 space-y-1">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-800">Branch 1 (Nehru Nagar):</p>
                  <p>Near Gaytri School Nehru Nagar In FRONT Of Apna Super Bazar Rewa (M. P.)</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-800">Branch 2 — Hari Om (Ring Road):</p>
                  <p>Behind Hotel The Vijay Villas Gadariya Ring Road Rewa (M. P.)</p>
                </div>
                <p className="pt-0.5 font-semibold text-slate-700">
                  Phone: 9329838804, 9893733683 | Landline: 07662-334849
                </p>
                <p className="text-slate-500 font-mono">GSTIN: {businessSettings.gstin}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-1 rounded">
                ORIGINAL TAX INVOICE
              </span>
              <p className="font-mono text-sm font-bold text-slate-900 mt-2">
                INV-{invoiceOrder.orderNumber.replace('LD-', '')}
              </p>
              <p className="text-xs text-slate-500">
                Date: {new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Order Ref: {invoiceOrder.orderNumber}
              </p>
            </div>
          </div>

          {/* Billed To / Delivery Info */}
          <div className="grid grid-cols-2 gap-6 my-6 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Billed & Delivered To
              </h4>
              <p className="font-bold text-slate-900 text-sm">{invoiceOrder.customerName}</p>
              <p className="text-slate-600">{invoiceOrder.customerPhone}</p>
              <p className="text-slate-600 mt-1">
                {invoiceOrder.address.houseFlat}, {invoiceOrder.address.street}
              </p>
              <p className="text-slate-600">
                {invoiceOrder.address.area}, {invoiceOrder.address.city} - {invoiceOrder.address.pincode}
              </p>
            </div>

            <div className="text-right space-y-1">
              <div>
                <span className="text-slate-500">Pickup Slot: </span>
                <span className="font-semibold text-slate-800">
                  {invoiceOrder.pickupDate} ({invoiceOrder.pickupSlot})
                </span>
              </div>
              <div>
                <span className="text-slate-500">Delivery Mode: </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {invoiceOrder.deliveryMode}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Payment Mode: </span>
                <span className="font-semibold text-slate-800">
                  {invoiceOrder.paymentMethod}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Payment Status: </span>
                <span className="font-bold text-emerald-600">
                  {invoiceOrder.paymentStatus}
                </span>
              </div>
              {invoiceOrder.razorpayPaymentId && (
                <div className="font-mono text-[11px] text-slate-400">
                  Ref: {invoiceOrder.razorpayPaymentId}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Unit</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Rate</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceOrder.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-900">
                      <div>{item.service.name}</div>
                      {item.specialInstructions && (
                        <div className="text-[11px] text-slate-400 font-normal italic">
                          Note: {item.specialInstructions}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center text-slate-600">{item.service.unit}</td>
                    <td className="py-3 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-600">₹{item.selectedPrice.toFixed(2)}</td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      ₹{(item.selectedPrice * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t-2 border-slate-200 pt-4 mt-2">
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{invoiceOrder.subtotal.toFixed(2)}</span>
                </div>

                {invoiceOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({invoiceOrder.couponCode})</span>
                    <span>-₹{invoiceOrder.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Doorstep Pickup Fee</span>
                  <span>{invoiceOrder.pickupFee === 0 ? 'FREE' : `₹${invoiceOrder.pickupFee.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges</span>
                  <span>{invoiceOrder.deliveryFee === 0 ? 'FREE' : `₹${invoiceOrder.deliveryFee.toFixed(2)}`}</span>
                </div>

                {invoiceOrder.expressFee > 0 && (
                  <div className="flex justify-between text-brand-600 font-medium">
                    <span>Express Priority Charge</span>
                    <span>₹{invoiceOrder.expressFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>GST ({businessSettings.gstPercentage}%)</span>
                  <span className="font-semibold text-slate-800">₹{invoiceOrder.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-brand-900 text-base">₹{invoiceOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer & Terms */}
          <div className="border-t border-slate-200 mt-8 pt-4 text-[10px] text-slate-500 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-700">Terms & Conditions:</p>
              <p>1. This is a computer generated invoice and does not require a physical signature.</p>
              <p>2. Report any discrepancies or stain queries within 24 hours of delivery.</p>
              <p>3. The Laundry Lounge standard liability applies to all fabric treatments as per care labels.</p>
            </div>

            <div className="text-right flex items-center space-x-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Verified & Authorized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
