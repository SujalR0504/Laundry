import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Building2,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  CreditCard,
  Wallet,
  Clock,
  Plus,
  Eye,
  FileText,
  Printer,
  ChevronRight,
  Sparkles,
  UploadCloud,
} from 'lucide-react';

interface BusinessDashboardViewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenNewInvoiceModal: () => void;
}

export const BusinessDashboardView: React.FC<BusinessDashboardViewProps> = ({
  onNavigateTab,
  onOpenNewInvoiceModal,
}) => {
  const {
    documents,
    parties,
    products,
    warehouses,
    chartOfAccounts,
    stockLedger,
    subscription,
    getProfitAndLoss,
  } = useBusiness();

  const { orders } = useApp();

  // Filters
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'fy' | 'all'>('month');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');

  // Filtered documents
  const filteredDocs = useMemo(() => {
    let docs = [...documents];
    if (selectedWarehouse !== 'all') {
      docs = docs.filter((d) => d.warehouseId === selectedWarehouse);
    }
    // Date filter
    const now = new Date();
    if (dateRange === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      docs = docs.filter((d) => d.date === todayStr);
    } else if (dateRange === 'week') {
      const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      docs = docs.filter((d) => new Date(d.date) >= pastWeek);
    } else if (dateRange === 'month') {
      const pastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      docs = docs.filter((d) => new Date(d.date) >= pastMonth);
    }
    return docs;
  }, [documents, selectedWarehouse, dateRange]);

  // Financial calculations
  const salesInvoices = filteredDocs.filter(
    (d) => d.documentType === 'tax_invoice' || d.documentType === 'bill_of_supply'
  );
  const purchaseBills = filteredDocs.filter((d) => d.documentType === 'purchase_bill');

  const totalSales = salesInvoices.reduce((sum, d) => sum + d.totalAmount, 0);
  const ecommerceSales = salesInvoices
    .filter((d) => Boolean(d.sourceOrderId))
    .reduce((sum, d) => sum + d.totalAmount, 0);
  const offlineSales = totalSales - ecommerceSales;

  const totalPurchases = purchaseBills.reduce((sum, d) => sum + d.totalAmount, 0);

  // Profit and loss
  const pnl = getProfitAndLoss();

  // Receivables & Payables
  const totalReceivables = parties
    .filter((p) => p.type === 'customer' || p.type === 'both')
    .reduce((sum, p) => sum + (p.currentBalance > 0 ? p.currentBalance : 0), 0);

  const totalPayables = parties
    .filter((p) => p.type === 'supplier' || p.type === 'both')
    .reduce((sum, p) => sum + (p.currentBalance < 0 ? Math.abs(p.currentBalance) : 0), 0);

  // Cash and bank balance
  const cashAndBankTotal = chartOfAccounts
    .filter((acc) => acc.category === 'Cash in Hand' || acc.category === 'Bank Account')
    .reduce((sum, acc) => sum + acc.currentBalance, 0);

  // Total inventory value
  const inventoryValue = products
    .filter((p) => p.trackInventory)
    .reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);

  // Low stock products count
  const lowStockProducts = products.filter(
    (p) => p.trackInventory && p.currentStock <= p.minStockAlert
  );

  return (
    <div className="space-y-6">
      {/* Top Controls: Filter by Period & Warehouse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Period:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['today', 'week', 'month', 'fy', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  dateRange === range
                    ? 'bg-brand-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'fy' ? 'FY 2026-27' : range}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Branch / Hub:</span>
          </div>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-brand-500 text-slate-800"
          >
            <option value="all">All Hubs &amp; Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onNavigateTab('biz_import')}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-95 border border-indigo-200"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={onOpenNewInvoiceModal}
            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="bg-gradient-to-br from-white to-sky-50/40 p-5 rounded-3xl border border-sky-100 shadow-soft-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
              Total Sales Turnover
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 pt-2 border-t border-sky-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>🌐 Web: ₹{ecommerceSales.toLocaleString('en-IN')}</span>
            <span>🏪 Counter: ₹{offlineSales.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total Purchases Card */}
        <div className="bg-gradient-to-br from-white to-amber-50/40 p-5 rounded-3xl border border-amber-100 shadow-soft-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Total Purchases (Inward)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{totalPurchases.toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Bills: {purchaseBills.length}</span>
            <span className="text-amber-700 font-semibold">Consumables &amp; Hangers</span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-gradient-to-br from-white to-emerald-50/40 p-5 rounded-3xl border border-emerald-100 shadow-soft-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Estimated Net Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-2">
            ₹{pnl.netProfit.toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Gross: ₹{pnl.grossProfit.toLocaleString('en-IN')}</span>
            <span>Exp: ₹{pnl.totalExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Cash & Bank Balances */}
        <div className="bg-gradient-to-br from-white to-indigo-50/40 p-5 rounded-3xl border border-indigo-100 shadow-soft-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Cash &amp; Bank Balances
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{cashAndBankTotal.toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>SBI, HDFC &amp; PhonePe UPI</span>
            <button
              onClick={() => onNavigateTab('accounting')}
              className="text-indigo-600 hover:text-indigo-700 font-bold"
            >
              Ledger →
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Financial Health Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Outstanding Receivables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-soft-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">To Collect (Receivables)</div>
              <div className="text-lg font-black text-rose-600">
                ₹{totalReceivables.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('customers')}
            className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all"
          >
            Khata →
          </button>
        </div>

        {/* Outstanding Payables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-soft-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">To Pay (Payables)</div>
              <div className="text-lg font-black text-amber-600">
                ₹{totalPayables.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('suppliers')}
            className="text-xs font-bold text-amber-600 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-all"
          >
            Vendors →
          </button>
        </div>

        {/* Inventory Value & Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-soft-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Stock Asset Value</div>
              <div className="text-lg font-black text-slate-900">
                ₹{inventoryValue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          {lowStockProducts.length > 0 ? (
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full flex items-center space-x-1"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{lowStockProducts.length} Low</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-600 font-bold">Optimal</span>
          )}
        </div>
      </div>

      {/* Tables Row: Recent Invoices & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Invoices Table (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-5 shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-brand-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Recent Invoices &amp; Bills</h3>
            </div>
            <button
              onClick={() => onNavigateTab('billing')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View All Invoices</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Doc #</th>
                  <th className="py-2.5 px-3">Party / Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {documents.slice(0, 6).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-brand-700">
                      {doc.documentNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800">{doc.partyName}</div>
                      <div className="text-[10px] text-slate-400">{doc.partyPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{doc.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      ₹{doc.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3">
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
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onNavigateTab('billing')}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                        title="View & Print"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations & Low Stock Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Action Tiles */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-soft-sm space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-sky-400">
                Quick Action Launcher
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={onOpenNewInvoiceModal}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all"
              >
                <Plus className="w-4 h-4 text-sky-400" />
                <span>+ GST Invoice</span>
              </button>
              <button
                onClick={() => onNavigateTab('purchase')}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>+ Purchase Bill</span>
              </button>
              <button
                onClick={() => onNavigateTab('customers')}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>+ Add Party</span>
              </button>
              <button
                onClick={() => onNavigateTab('expenses')}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all"
              >
                <CreditCard className="w-4 h-4 text-rose-400" />
                <span>+ Add Expense</span>
              </button>
            </div>
          </div>

          {/* Low Stock Watchlist */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="font-extrabold text-xs text-slate-800">Low-Stock Watchlist</h4>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {lowStockProducts.length} Reorder
              </span>
            </div>

            <div className="space-y-2">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <div className="font-bold text-slate-800 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500">Min Alert: {p.minStockAlert} {p.unit}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-rose-600">{p.currentStock} {p.unit}</div>
                    <button
                      onClick={() => onNavigateTab('purchase')}
                      className="text-[10px] text-brand-600 hover:underline font-bold"
                    >
                      Order →
                    </button>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">All stocks at healthy levels.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

