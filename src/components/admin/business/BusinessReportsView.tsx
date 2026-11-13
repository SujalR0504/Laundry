import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  Package,
  ShieldCheck,
} from 'lucide-react';

export const BusinessReportsView: React.FC = () => {
  const { documents, products, parties, stockLedger, syncEvents } = useBusiness();
  const { orders, showToast } = useApp();

  const [reportType, setReportType] = useState<'item_sales' | 'customer_sales' | 'daybook' | 'reconciliation'>('item_sales');

  // 1. Sales by Product / Service
  const itemSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  documents
    .filter((d) => d.documentType === 'tax_invoice' || d.documentType === 'bill_of_supply')
    .forEach((doc) => {
      doc.items.forEach((it) => {
        const existing = itemSalesMap.get(it.itemId) || { name: it.name, quantity: 0, revenue: 0 };
        existing.quantity += it.quantity;
        existing.revenue += it.totalAmount;
        itemSalesMap.set(it.itemId, existing);
      });
    });
  const itemSalesReport = Array.from(itemSalesMap.values()).sort((a, b) => b.revenue - a.revenue);

  // 2. Sales by Customer
  const customerSalesMap = new Map<string, { name: string; phone: string; count: number; total: number }>();
  documents
    .filter((d) => d.documentType === 'tax_invoice' || d.documentType === 'bill_of_supply')
    .forEach((doc) => {
      const existing = customerSalesMap.get(doc.partyId) || {
        name: doc.partyName,
        phone: doc.partyPhone || '',
        count: 0,
        total: 0,
      };
      existing.count += 1;
      existing.total += doc.totalAmount;
      customerSalesMap.set(doc.partyId, existing);
    });
  const customerSalesReport = Array.from(customerSalesMap.values()).sort((a, b) => b.total - a.total);

  // 3. Reconciliation Report: Comparing e-commerce orders with generated invoices
  const reconciliationItems = orders.map((order) => {
    const linkedDoc = documents.find((d) => d.sourceOrderId === order.id);
    const linkedEvent = syncEvents.find((e) => e.sourceId === order.id);
    const amountMatches = linkedDoc ? Math.abs(linkedDoc.totalAmount - order.total) < 2 : false;
    const isReconciled = Boolean(linkedDoc && amountMatches);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderTotal: order.total,
      orderPaymentStatus: order.paymentStatus,
      invoiceNumber: linkedDoc?.documentNumber || '— Not Invoiced',
      invoiceTotal: linkedDoc?.totalAmount || 0,
      status: isReconciled ? 'reconciled' : linkedDoc ? 'discrepancy' : 'pending_sync',
    };
  });

  const handleExportCsv = () => {
    let csv = '';
    if (reportType === 'item_sales') {
      csv = 'Item_Name,Quantity_Sold,Revenue\n' + itemSalesReport.map((i) => `"${i.name}",${i.quantity},${i.revenue}`).join('\n');
    } else if (reportType === 'customer_sales') {
      csv = 'Customer_Name,Phone,Invoice_Count,Total_Spent\n' + customerSalesReport.map((c) => `"${c.name}","${c.phone}",${c.count},${c.total}`).join('\n');
    } else {
      csv = 'Order_Number,Order_Total,Invoice_Number,Invoice_Total,Status\n' + reconciliationItems.map((r) => `"${r.orderNumber}",${r.orderTotal},"${r.invoiceNumber}",${r.invoiceTotal},"${r.status}"`).join('\n');
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Business_Report_${reportType}.csv`;
    a.click();
    showToast('Report CSV exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-brand-600" />
            <span>Business Intelligence &amp; Reconciliation Reports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed item profitability, customer lifetime value, chronologic daybooks and e-commerce sync reconciliation.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel / CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
        {[
          { id: 'item_sales', label: 'Item & Service Sales' },
          { id: 'customer_sales', label: 'Party Sales Volume' },
          { id: 'reconciliation', label: 'E-Commerce Reconciliation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              reportType === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT CONTENT: ITEM SALES */}
      {reportType === 'item_sales' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden p-5">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Service / Product Name</th>
                <th className="py-2.5 px-3 text-center">Quantity Processed / Sold</th>
                <th className="py-2.5 px-3 text-right">Total Revenue Generated (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {itemSalesReport.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 text-[13px]">{it.name}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700">{it.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">
                    ₹{it.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT CONTENT: CUSTOMER SALES */}
      {reportType === 'customer_sales' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden p-5">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Customer Party Name</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3 text-center">Invoices Issued</th>
                <th className="py-2.5 px-3 text-right">Lifetime Billed Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {customerSalesReport.map((cust, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 text-[13px]">{cust.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{cust.phone}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700">{cust.count}</td>
                  <td className="py-2.5 px-3 text-right font-black text-brand-700">
                    ₹{cust.total.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT CONTENT: RECONCILIATION */}
      {reportType === 'reconciliation' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden p-5 space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700">
            <span>E-Commerce Orders vs Billed Invoices Status</span>
            <span className="text-emerald-700">
              ✓ {reconciliationItems.filter((r) => r.status === 'reconciled').length} of {reconciliationItems.length} Reconciled
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Web Order #</th>
                <th className="py-2.5 px-3">Order Value (₹)</th>
                <th className="py-2.5 px-3">Linked Tax Invoice #</th>
                <th className="py-2.5 px-3">Invoice Amount (₹)</th>
                <th className="py-2.5 px-3 text-right">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reconciliationItems.map((r) => (
                <tr key={r.orderId} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-bold text-brand-700">{r.orderNumber}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">₹{r.orderTotal}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{r.invoiceNumber}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {r.invoiceTotal > 0 ? `₹${r.invoiceTotal}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'reconciled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.status === 'reconciled' ? '✓ In Sync' : '⚠️ Pending Auto-Sync'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

