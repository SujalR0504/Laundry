import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import { Order } from '../../../types';
import {
  ShoppingBag,
  Globe,
  Store,
  RefreshCw,
  Plus,
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Search,
  Filter,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const SalesManagementView: React.FC = () => {
  const {
    documents,
    createDocument,
    syncEcommerceOrder,
    syncEvents,
    retrySyncEvent,
  } = useBusiness();

  const { orders, showToast } = useApp();

  const [channelFilter, setChannelFilter] = useState<'all' | 'ecommerce' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Find linked invoice for each online order
  const getOrderSyncStatus = (order: Order) => {
    const doc = documents.find((d) => d.sourceOrderId === order.id);
    const syncEv = syncEvents.find((e) => e.sourceId === order.id);
    return { doc, syncEv };
  };

  const handleManualSyncInvoice = (order: Order) => {
    const success = syncEcommerceOrder(order, 'order.confirmed');
    if (success) {
      showToast(`Tax invoice generated for ${order.orderNumber}!`, 'success');
    } else {
      showToast(`Failed syncing order ${order.orderNumber}.`, 'error');
    }
  };

  const handleCreateSalesReturn = (order: Order) => {
    const doc = documents.find((d) => d.sourceOrderId === order.id);
    if (!doc) {
      showToast('No issued invoice found for this order to return.', 'error');
      return;
    }
    createDocument({
      documentType: 'sales_return',
      referenceNumber: doc.documentNumber,
      sourceOrderId: order.id,
      partyId: doc.partyId,
      partyName: doc.partyName,
      partyPhone: doc.partyPhone,
      items: doc.items,
      notes: `Sales Return for Order ${order.orderNumber}`,
    });
    showToast(`Sales Return recorded & stock movement posted for ${order.orderNumber}!`, 'success');
  };

  // Channel calculations
  const onlineOrders = orders;
  const offlineInvoices = documents.filter(
    (d) => !d.sourceOrderId && (d.documentType === 'tax_invoice' || d.documentType === 'bill_of_supply')
  );

  const totalOnlineValue = onlineOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOfflineValue = offlineInvoices.reduce((sum, d) => sum + d.totalAmount, 0);
  const grossSalesVolume = totalOnlineValue + totalOfflineValue;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <span>Omnichannel Sales Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single control tower uniting online customer bookings, counter POS drops, B2B contracts &amp; sales returns.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-Sync Active (Idempotent)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Total Sales Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{grossSalesVolume.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Combined Online + Counter Revenue
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs font-bold text-sky-600 uppercase">
            <span>E-Commerce Online Hub</span>
            <Globe className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{totalOnlineValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {onlineOrders.length} Online Bookings placed
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs font-bold text-amber-600 uppercase">
            <span>Walk-in Counter POS</span>
            <Store className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{totalOfflineValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {offlineInvoices.length} Counter Invoices issued
          </div>
        </div>
      </div>

      {/* Channel Switcher & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setChannelFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              channelFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Sales Channels ({orders.length + offlineInvoices.length})
          </button>
          <button
            onClick={() => setChannelFilter('ecommerce')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              channelFilter === 'ecommerce' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            🌐 E-Commerce Web ({orders.length})
          </button>
          <button
            onClick={() => setChannelFilter('offline')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              channelFilter === 'offline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            🏪 Retail POS Counter ({offlineInvoices.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search orders, invoice #, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Sales Transactions Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Sales Order / Invoice #</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Customer &amp; Mobile</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Invoice Sync Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Render E-Commerce Orders if included */}
              {(channelFilter === 'all' || channelFilter === 'ecommerce') &&
                orders
                  .filter((o) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      o.orderNumber.toLowerCase().includes(q) ||
                      o.customerName.toLowerCase().includes(q) ||
                      o.customerPhone.includes(q)
                    );
                  })
                  .map((order) => {
                    const { doc, syncEv } = getOrderSyncStatus(order);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-black text-brand-700 text-[13px]">
                            {order.orderNumber}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.items.length} items • {order.deliveryMode.toUpperCase()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                            <Globe className="w-3 h-3" />
                            <span>Web Store</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {order.createdAt ? order.createdAt.split('T')[0] : 'Today'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.orderStatus === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-brand-100 text-brand-800'
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900 text-[13px]">
                          ₹{order.total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          {doc ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{doc.documentNumber}</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleManualSyncInvoice(order)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold flex items-center space-x-1 border border-amber-200"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Generate Invoice</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {order.orderStatus === 'Delivered' && (
                              <button
                                onClick={() => handleCreateSalesReturn(order)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold flex items-center space-x-0.5"
                                title="Create Sales Return"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Return</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

              {/* Render Offline POS Invoices if included */}
              {(channelFilter === 'all' || channelFilter === 'offline') &&
                offlineInvoices
                  .filter((doc) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      doc.documentNumber.toLowerCase().includes(q) ||
                      doc.partyName.toLowerCase().includes(q) ||
                      (doc.partyPhone || '').includes(q)
                    );
                  })
                  .map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors bg-amber-50/20">
                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-amber-800 text-[13px]">
                          {doc.documentNumber}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Counter POS • {doc.items.length} items
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Store className="w-3 h-3" />
                          <span>Counter POS</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{doc.partyName}</div>
                        <div className="text-[11px] text-slate-500">{doc.partyPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{doc.date}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Completed
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 text-[13px]">
                        ₹{doc.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Billed &amp; Posted</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] text-slate-400 font-bold">POS Cash/UPI</span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

