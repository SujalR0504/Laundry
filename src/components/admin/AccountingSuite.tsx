import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Send,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Store,
  Globe,
  Users,
  Shield,
  FileSpreadsheet,
  X,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { BankAccount, Expense, CustomerDueRecord } from '../../types';
import { CustomerDuesManager } from './CustomerDuesManager';

export const AccountingSuite: React.FC = () => {
  const {
    orders,
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    expenses,
    addExpense,
    deleteExpense,
    customerDues,
    recordDuePayment,
    addCustomerDue,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'dues' | 'ledger' | 'expenses' | 'accounts' | 'overview'>('dues');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [dueSearchQuery, setDueSearchQuery] = useState('');
  const [dueBranchFilter, setDueBranchFilter] = useState<string>('all');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [expenseBranchFilter, setExpenseBranchFilter] = useState<string>('all');

  // Modals state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState<{
    title: string;
    category: Expense['category'];
    amount: string;
    paidViaAccountId: string;
    branch: Expense['branch'];
    receiptNumber: string;
    vendorName: string;
    note: string;
    date: string;
  }>({
    title: '',
    category: 'Detergents & Chemicals',
    amount: '',
    paidViaAccountId: accounts[0]?.id || '',
    branch: 'Branch 1 - Nehru Nagar',
    receiptNumber: '',
    vendorName: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState<{
    name: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
    accountType: BankAccount['accountType'];
    openingBalance: string;
    upiId: string;
  }>({
    name: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: 'Nehru Nagar (Main Hub)',
    accountType: 'bank_current',
    openingBalance: '',
    upiId: '',
  });

  const [showDueCollectModal, setShowDueCollectModal] = useState(false);
  const [dueCollectData, setDueCollectData] = useState<{
    dueId: string;
    customerName: string;
    customerPhone: string;
    pendingDue: number;
    amountPaid: string;
    accountId: string;
    paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
    note: string;
  }>({
    dueId: '',
    customerName: '',
    customerPhone: '',
    pendingDue: 0,
    amountPaid: '',
    accountId: accounts[0]?.id || '',
    paymentMode: 'Cash',
    note: '',
  });

  const [showAddDueModal, setShowAddDueModal] = useState(false);
  const [addDueForm, setAddDueForm] = useState({
    customerName: '',
    customerPhone: '',
    totalBilled: '',
    totalPaid: '',
    branch: 'Branch 1 - Nehru Nagar',
    notes: '',
  });

  // ========================================================
  // 💰 CORE FINANCIAL KPI CALCULATIONS (As Requested by User)
  // ========================================================
  // 1. Customer Due (Pending Balances)
  const totalCustomerDue =
    customerDues.reduce((sum, d) => sum + d.pendingDue, 0) +
    orders.filter((o) => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + (o.total || 0), 0);

  // 2. Offline Revenue (Walk-in Counter POS)
  const offlineOrders = orders.filter(
    (o) =>
      o.address.houseFlat.toLowerCase().includes('walk-in') ||
      o.address.houseFlat.toLowerCase().includes('pos') ||
      o.pickupSlot.toLowerCase().includes('walk-in')
  );
  const totalOfflineRevenue =
    offlineOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0) +
    customerDues.reduce((sum, d) => sum + d.totalPaid, 0);

  // 3. Web Revenue (Online Website Doorstep Pickups)
  const webOrders = orders.filter(
    (o) =>
      !o.address.houseFlat.toLowerCase().includes('walk-in') &&
      !o.address.houseFlat.toLowerCase().includes('pos') &&
      !o.pickupSlot.toLowerCase().includes('walk-in')
  );
  const totalWebRevenue = webOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);

  // 4. Total Expenses (Store Expenses)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 5. Cash in Hand & Cash Received
  const cashAccount = accounts.find((a) => a.accountType === 'cash_drawer');
  const cashDrawerBalance = cashAccount ? cashAccount.currentBalance : 0;
  const totalCashCollected = cashAccount ? cashAccount.totalInflow : 0;

  // 6. Bank & Digital Received (Across all bank & UPI accounts)
  const bankAccountsList = accounts.filter((a) => a.accountType !== 'cash_drawer');
  const totalBankBalance = bankAccountsList.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalBankReceived = bankAccountsList.reduce((sum, a) => sum + a.totalInflow, 0);

  // 7. Net Profit
  const totalIncome = totalOfflineRevenue + totalWebRevenue;
  const netProfit = totalIncome - totalExpenses;

  // Filtered Dues
  const filteredDues = customerDues.filter((d) => {
    const matchQuery =
      d.customerName.toLowerCase().includes(dueSearchQuery.toLowerCase()) ||
      d.customerPhone.includes(dueSearchQuery);
    const matchBranch = dueBranchFilter === 'all' || d.branch === dueBranchFilter;
    return matchQuery && matchBranch;
  });

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchCat = expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter;
    const matchBranch = expenseBranchFilter === 'all' || e.branch === expenseBranchFilter;
    return matchCat && matchBranch;
  });

  // Handle Submit Expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseForm.amount);
    if (!expenseForm.title.trim() || isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid expense title and amount', 'error');
      return;
    }

    const selectedAcc = accounts.find((a) => a.id === expenseForm.paidViaAccountId);
    addExpense({
      title: expenseForm.title.trim(),
      category: expenseForm.category,
      amount: amountNum,
      paidViaAccountId: expenseForm.paidViaAccountId,
      accountName: selectedAcc ? selectedAcc.name : 'Store Cash Drawer',
      branch: expenseForm.branch,
      receiptNumber: expenseForm.receiptNumber.trim() || undefined,
      vendorName: expenseForm.vendorName.trim() || undefined,
      note: expenseForm.note.trim() || undefined,
      date: expenseForm.date,
    });

    setShowExpenseModal(false);
    setExpenseForm({
      title: '',
      category: 'Detergents & Chemicals',
      amount: '',
      paidViaAccountId: accounts[0]?.id || '',
      branch: 'Branch 1 - Nehru Nagar',
      receiptNumber: '',
      vendorName: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Handle Submit Account
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name.trim() || !accountForm.bankName.trim()) {
      showToast('Please provide account name and bank name', 'error');
      return;
    }

    addAccount({
      name: accountForm.name.trim(),
      bankName: accountForm.bankName.trim(),
      accountNumber: accountForm.accountNumber.trim(),
      ifscCode: accountForm.ifscCode.trim(),
      branchName: accountForm.branchName,
      accountType: accountForm.accountType,
      openingBalance: parseFloat(accountForm.openingBalance) || 0,
      upiId: accountForm.upiId.trim() || undefined,
    });

    setShowAccountModal(false);
    setAccountForm({
      name: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: 'Nehru Nagar (Main Hub)',
      accountType: 'bank_current',
      openingBalance: '',
      upiId: '',
    });
  };

  // Handle Submit Due Collection
  const handleCollectDue = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(dueCollectData.amountPaid);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }

    if (amountNum > dueCollectData.pendingDue) {
      showToast(`Amount cannot exceed pending due of ₹${dueCollectData.pendingDue}`, 'error');
      return;
    }

    recordDuePayment(
      dueCollectData.dueId,
      amountNum,
      dueCollectData.accountId,
      dueCollectData.paymentMode,
      dueCollectData.note
    );

    setShowDueCollectModal(false);
  };

  // Handle Submit Add Due
  const handleCreateDue = (e: React.FormEvent) => {
    e.preventDefault();
    const billed = parseFloat(addDueForm.totalBilled);
    const paid = parseFloat(addDueForm.totalPaid) || 0;
    if (!addDueForm.customerName.trim() || isNaN(billed) || billed <= 0) {
      showToast('Please enter customer name and valid billed amount', 'error');
      return;
    }

    addCustomerDue({
      customerId: 'cust-' + Date.now(),
      customerName: addDueForm.customerName.trim(),
      customerPhone: addDueForm.customerPhone.trim() || '9893733683',
      totalBilled: billed,
      totalPaid: paid,
      pendingDue: Math.max(0, billed - paid),
      branch: addDueForm.branch,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      notes: addDueForm.notes.trim() || undefined,
    });

    setShowAddDueModal(false);
    setAddDueForm({
      customerName: '',
      customerPhone: '',
      totalBilled: '',
      totalPaid: '',
      branch: 'Branch 1 - Nehru Nagar',
      notes: '',
    });
  };

  // Send WhatsApp Reminder
  const handleSendWhatsAppReminder = (due: CustomerDueRecord) => {
    const cleanPhone = due.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `*THE LAUNDRY LOUNGE REWA - BILL DUE REMINDER*\n\nNamaste ${due.customerName} ji,\nThis is a gentle payment reminder regarding your laundry bill at The Laundry Lounge (${due.branch}).\n\n*Total Bill Amount:* ₹${due.totalBilled}\n*Amount Received:* ₹${due.totalPaid}\n*Pending Due Balance:* ₹${due.pendingDue}\n\nKindly clear the remaining balance at your earliest convenience via UPI or cash at our store.\n\n*UPI ID:* thelaundrylounge@upi\n*Helpline:* 9893733683 / 9329838804\nThank you for choosing The Laundry Lounge!`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Export Accounting CSV
  const handleExportCSV = () => {
    const headers = 'Type,Title,Category/Party,Amount,Account,Date,Branch,Notes\n';
    const expenseRows = expenses.map(
      (e) => `"Expense","${e.title}","${e.category}",-${e.amount},"${e.accountName}","${e.date}","${e.branch}","${e.note || ''}"`
    );
    const dueRows = customerDues.map(
      (d) => `"Customer Due","${d.customerName}","Udhar Khata",${d.pendingDue},"Pending","${d.lastPaymentDate || ''}","${d.branch}","Total Billed: ₹${d.totalBilled}, Paid: ₹${d.totalPaid}"`
    );
    const orderRows = orders.map(
      (o) => `"Order Sale","${o.orderNumber}","${o.customerName}",+${o.total},"${o.paymentMethod}","${o.pickupDate}","${o.address.area}","Status: ${o.orderStatus}"`
    );
    const allRows = [...expenseRows, ...dueRows, ...orderRows].join('\n');
    const blob = new Blob([headers + allRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thelaundrylounge_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Accounting ledger exported as CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. TOP 6 FINANCIAL MASTER KPI CARDS
      ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: Customer Due */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Customer Due</span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-700 mt-1.5">
            ₹{totalCustomerDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-rose-600/80 font-medium mt-1">
            {customerDues.length} pending accounts
          </div>
        </div>

        {/* KPI 2: Offline Counter Income */}
        <div className="bg-white p-4 rounded-2xl border border-sky-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">Offline Counter</span>
            <Store className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-sky-900 mt-1.5">
            ₹{totalOfflineRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-sky-600 font-medium mt-1">
            Walk-in POS Orders
          </div>
        </div>

        {/* KPI 3: Web / Online Income */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Web Bookings</span>
            <Globe className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-900 mt-1.5">
            ₹{totalWebRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            Doorstep Pickups
          </div>
        </div>

        {/* KPI 4: Total Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900 mt-1.5">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-amber-700 font-medium mt-1">
            {expenses.length} expense entries
          </div>
        </div>

        {/* KPI 5: Cash in Hand */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">Cash in Hand</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-900 mt-1.5">
            ₹{cashDrawerBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-indigo-600 font-medium mt-1">
            Physical Cash Register
          </div>
        </div>

        {/* KPI 6: Bank & UPI Balance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Bank &amp; UPI</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
            ₹{totalBankBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            {bankAccountsList.length} Bank &amp; QR A/cs
          </div>
        </div>
      </div>

      {/* ========================================================
          2. ACTION HEADER & SUB-NAVIGATION BAR
      ======================================================== */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Accounting &amp; Financial Khata</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking for Customer Dues, Offline vs Web Income, Multiple Bank &amp; UPI accounts, and Store Expenses.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Expense</span>
            </button>

            <button
              onClick={() => setShowAddDueModal(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Udhar Entry</span>
            </button>

            <button
              onClick={() => setShowAccountModal(true)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>+ Add Bank A/c</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200"
              title="Download Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'dues', label: '🧾 Customer Dues & Khata', count: customerDues.length },
            { id: 'ledger', label: '📜 Cashbook & Daybook', count: undefined },
            { id: 'expenses', label: '💸 Store Expenses Register', count: expenses.length },
            { id: 'accounts', label: '🏦 Bank Accounts & UPI QR', count: accounts.length },
            { id: 'overview', label: '📊 Business Summary & P&L', count: undefined },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeSubTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          SUB-TAB 1: FINANCIAL OVERVIEW & P&L
      ======================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Net Profit & Revenue Split Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clean Business Cash Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Store Inflow
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  Active Store
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-emerald-600">
                  ₹{totalIncome.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Cash in Hand (Counter Drawer):</span>
                  <span className="font-bold text-slate-900">₹{cashDrawerBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Bank &amp; UPI Accounts:</span>
                  <span className="font-bold text-sky-700">₹{totalBankBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Customer Due / Outstanding:</span>
                  <span className="font-bold text-rose-600">₹{totalCustomerDue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Store Expenses:</span>
                  <span className="font-bold text-amber-700">₹{totalExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Offline vs Web Revenue Split */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Revenue Source Breakdown (Offline vs Online)
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Store className="w-3.5 h-3.5 text-sky-600" />
                      <span>Offline Counter / POS Walk-ins</span>
                    </span>
                    <span className="font-bold text-slate-900">₹{totalOfflineRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full"
                      style={{
                        width: `${totalIncome > 0 ? (totalOfflineRevenue / totalIncome) * 100 : 50}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Website Doorstep Bookings</span>
                    </span>
                    <span className="font-bold text-slate-900">₹{totalWebRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${totalIncome > 0 ? (totalWebRevenue / totalIncome) * 100 : 50}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>The Laundry Lounge (Branch 1 - Arun Nagar) &amp; Branch 2 (Ring Road)</span>
                <span className="text-sky-700 font-semibold">{orders.length} total orders</span>
              </div>
            </div>

            {/* Cash vs Bank Collection Split */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Payment Channel Distribution (Cash vs Bank &amp; UPI)
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Physical Cash (Counter Drawer)</span>
                    </span>
                    <span className="font-bold text-indigo-900">₹{cashDrawerBalance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{
                        width: `${(cashDrawerBalance + totalBankBalance) > 0 ? (cashDrawerBalance / (cashDrawerBalance + totalBankBalance)) * 100 : 30}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Bank &amp; Merchant UPI QR</span>
                    </span>
                    <span className="font-bold text-sky-900">₹{totalBankBalance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{
                        width: `${(cashDrawerBalance + totalBankBalance) > 0 ? (totalBankBalance / (cashDrawerBalance + totalBankBalance)) * 100 : 70}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Total Liquidity Available</span>
                <span className="text-slate-900 font-bold">₹{(cashDrawerBalance + totalBankBalance).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts to Sub-Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveSubTab('dues')}
              className="p-4 bg-white hover:bg-rose-50/50 rounded-2xl border border-slate-200 hover:border-rose-300 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-rose-700">Open Customer Udhar Khata →</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Collect pending payments from {customerDues.length} customers</p>
              </div>
              <span className="text-lg font-bold text-rose-600">₹{totalCustomerDue.toLocaleString('en-IN')}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('accounts')}
              className="p-4 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200 hover:border-sky-300 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-sky-700">View Multi-Bank Accounts →</span>
                <p className="text-[11px] text-slate-500 mt-0.5">SBI, HDFC, PhonePe QR &amp; Cash drawer</p>
              </div>
              <span className="text-lg font-bold text-sky-600">{accounts.length} Accounts</span>
            </button>

            <button
              onClick={() => setActiveSubTab('expenses')}
              className="p-4 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200 hover:border-amber-300 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-amber-700">Manage Store Expenses →</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Detergent chemicals, boiler, staff &amp; bills</p>
              </div>
              <span className="text-lg font-bold text-amber-600">₹{totalExpenses.toLocaleString('en-IN')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: MULTIPLE ACCOUNTS & BANKS
      ======================================================== */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                All Configured Bank &amp; Payment Accounts
              </h4>
              <p className="text-xs text-slate-500">
                Shows exactly how much money came into and left each individual bank or cash account.
              </p>
            </div>
            <button
              onClick={() => setShowAccountModal(true)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add New Bank / QR Account</span>
            </button>
          </div>

          {/* Account Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-sky-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      {acc.accountType === 'cash_drawer' ? (
                        <Wallet className="w-5 h-5 text-indigo-600" />
                      ) : acc.accountType === 'upi_merchant' ? (
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Building2 className="w-5 h-5 text-sky-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900">{acc.name}</h4>
                        {acc.isPrimary && (
                          <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-0.2 rounded border border-sky-200">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {acc.bankName} • {acc.branchName}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {acc.accountType.replace('_', ' ')}
                  </span>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">A/C Number:</span>
                    <span className="font-bold text-slate-800">{acc.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">IFSC / UPI:</span>
                    <span className="font-bold text-slate-800">{acc.upiId || acc.ifscCode}</span>
                  </div>
                </div>

                {/* Inflow vs Outflow vs Balance */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                  <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 font-medium block">Total Received</span>
                    <span className="text-xs font-bold text-emerald-800">+₹{acc.totalInflow.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-100">
                    <span className="text-[10px] text-rose-700 font-medium block">Total Spent</span>
                    <span className="text-xs font-bold text-rose-800">-₹{acc.totalOutflow.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2 bg-sky-50/60 rounded-lg border border-sky-100">
                    <span className="text-[10px] text-sky-700 font-medium block">Net Balance</span>
                    <span className="text-xs font-bold text-sky-900">₹{acc.currentBalance.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400">Opening: ₹{acc.openingBalance.toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => {
                      setSelectedAccountFilter(acc.id);
                      setActiveSubTab('ledger');
                    }}
                    className="text-sky-600 hover:text-sky-800 font-semibold text-xs"
                  >
                    View Account Ledger →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: CUSTOMER DUES KHATA
      ======================================================== */}
      {activeSubTab === 'dues' && (
        <CustomerDuesManager />
      )}

      {/* ========================================================
          SUB-TAB 4: EXPENSE REGISTER
      ======================================================== */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Store Expense Register
              </h4>
              <p className="text-xs text-slate-500">
                Log and categorize all shop expenses (Chemicals, Boiler repairs, staff salaries, electricity bills, packaging, and fuel).
              </p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record New Expense</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Category:</span>
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Categories</option>
                <option value="Detergents & Chemicals">Detergents &amp; Chemicals</option>
                <option value="Machinery & Maintenance">Machinery &amp; Maintenance</option>
                <option value="Packaging & Hangers">Packaging &amp; Hangers</option>
                <option value="Staff Salaries">Staff Salaries</option>
                <option value="Shop Rent">Shop Rent</option>
                <option value="Electricity & Water">Electricity &amp; Water</option>
                <option value="Fuel & Transport">Fuel &amp; Transport</option>
                <option value="Tea & Refreshment">Tea &amp; Refreshment</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Branch:</span>
              <select
                value={expenseBranchFilter}
                onChange={(e) => setExpenseBranchFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Branches</option>
                <option value="Branch 1 - Nehru Nagar">Branch 1 - Nehru Nagar</option>
                <option value="Branch 2 - Ring Road">Branch 2 - Ring Road</option>
                <option value="Common / Central">Common / Central</option>
              </select>
            </div>

            <div className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 ml-auto">
              Total Expenses: ₹{totalExpenses.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Expense Title &amp; Category</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Paid From Account</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Vendor &amp; Receipt</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No expenses recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500">{exp.date}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{exp.title}</div>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-amber-700">
                            -₹{exp.amount.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {exp.accountName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {exp.branch}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {exp.vendorName ? <span>{exp.vendorName} • </span> : null}
                          <span className="font-mono">{exp.receiptNumber || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 5: COMBINED CASHBOOK & DAYBOOK
      ======================================================== */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Combined Daybook &amp; Financial Ledger
              </h4>
              <p className="text-xs text-slate-500">
                Complete chronological timeline of all income and expenses across all branches and accounts.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Filter by Account:</span>
              <select
                value={selectedAccountFilter}
                onChange={(e) => setSelectedAccountFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Accounts Combined</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (₹{a.currentBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unified Ledger Timeline Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date &amp; Type</th>
                    <th className="py-3 px-4">Transaction / Party</th>
                    <th className="py-3 px-4">Account Credited / Debited</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4 text-right">Amount (Inflow / Outflow)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Expense rows */}
                  {expenses
                    .filter((e) => selectedAccountFilter === 'all' || e.paidViaAccountId === selectedAccountFilter)
                    .map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-500 block">{exp.date}</span>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                            EXPENSE OUT
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{exp.title}</div>
                          <span className="text-[11px] text-slate-500">Category: {exp.category}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {exp.accountName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{exp.branch}</td>
                        <td className="py-3 px-4 text-right font-bold text-rose-600">
                          -₹{exp.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}

                  {/* Order sales rows */}
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-500 block">{o.pickupDate}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          ORDER SALE IN
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{o.customerName} ({o.orderNumber})</div>
                        <span className="text-[11px] text-slate-500">Mode: {o.paymentMethod}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {o.paymentMethod === 'Cash on Delivery'
                          ? 'Store Cash Drawer'
                          : o.paymentMethod === 'UPI'
                          ? 'PhonePe / GPay QR Merchant A/c'
                          : 'SBI Current A/c (Branch 1)'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{o.address.area || 'Rewa'}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        +₹{o.total.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: RECORD NEW EXPENSE
      ======================================================== */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-base text-slate-900">Record Store Expense</h4>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="e.g. Veit steam table teflon shoes & boiler chemical"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="Detergents & Chemicals">Detergents &amp; Chemicals</option>
                    <option value="Machinery & Maintenance">Machinery &amp; Maintenance</option>
                    <option value="Packaging & Hangers">Packaging &amp; Hangers</option>
                    <option value="Staff Salaries">Staff Salaries</option>
                    <option value="Shop Rent">Shop Rent</option>
                    <option value="Electricity & Water">Electricity &amp; Water</option>
                    <option value="Fuel & Transport">Fuel &amp; Transport</option>
                    <option value="Tea & Refreshment">Tea &amp; Refreshment</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="e.g. 3500"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Paid From Account *</label>
                  <select
                    value={expenseForm.paidViaAccountId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paidViaAccountId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Bal: ₹{a.currentBalance})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Branch *</label>
                  <select
                    value={expenseForm.branch}
                    onChange={(e) => setExpenseForm({ ...expenseForm, branch: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="Branch 1 - Nehru Nagar">Branch 1 - Nehru Nagar</option>
                    <option value="Branch 2 - Ring Road">Branch 2 - Ring Road</option>
                    <option value="Common / Central">Common / Central</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vendor / Shop Name</label>
                  <input
                    type="text"
                    value={expenseForm.vendorName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                    placeholder="e.g. Seitz Textile Chemicals"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Bill Number (Optional)</label>
                <input
                  type="text"
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  placeholder="e.g. Bill #8829 paid in full via counter cash"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: ADD NEW BANK / PAYMENT ACCOUNT
      ======================================================== */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                <h4 className="font-bold text-base text-slate-900">Add Bank Account or QR</h4>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account Display Name *</label>
                <input
                  type="text"
                  required
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="e.g. PNB Branch 2 Current A/c"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={accountForm.bankName}
                    onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                    placeholder="e.g. Punjab National Bank"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Account Type *</label>
                  <select
                    value={accountForm.accountType}
                    onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="bank_current">Current Account</option>
                    <option value="bank_savings">Savings Account</option>
                    <option value="upi_merchant">UPI QR Merchant</option>
                    <option value="cash_drawer">Cash Register Drawer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    value={accountForm.accountNumber}
                    onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                    placeholder="e.g. 5020003928172"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">IFSC Code / UPI ID</label>
                  <input
                    type="text"
                    value={accountForm.ifscCode}
                    onChange={(e) => setAccountForm({ ...accountForm, ifscCode: e.target.value })}
                    placeholder="e.g. PUNB0123400"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Branch / Location</label>
                  <input
                    type="text"
                    value={accountForm.branchName}
                    onChange={(e) => setAccountForm({ ...accountForm, branchName: e.target.value })}
                    placeholder="e.g. Ring Road Branch 2"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={accountForm.openingBalance}
                    onChange={(e) => setAccountForm({ ...accountForm, openingBalance: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: COLLECT CUSTOMER DUE PAYMENT
      ======================================================== */}
      {showDueCollectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-base text-slate-900">Collect Due Payment</h4>
              </div>
              <button
                onClick={() => setShowDueCollectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-rose-600 font-semibold block uppercase">Customer</span>
                <span className="font-bold text-slate-900">{dueCollectData.customerName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-rose-600 font-semibold block uppercase">Total Pending Due</span>
                <span className="font-bold text-rose-700 text-base">₹{dueCollectData.pendingDue}</span>
              </div>
            </div>

            <form onSubmit={handleCollectDue} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount Collecting Now (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={dueCollectData.pendingDue}
                  step="any"
                  value={dueCollectData.amountPaid}
                  onChange={(e) => setDueCollectData({ ...dueCollectData, amountPaid: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-lg text-emerald-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Deposit Into Account *</label>
                  <select
                    value={dueCollectData.accountId}
                    onChange={(e) => setDueCollectData({ ...dueCollectData, accountId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Mode *</label>
                  <select
                    value={dueCollectData.paymentMode}
                    onChange={(e) => setDueCollectData({ ...dueCollectData, paymentMode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="UPI">UPI (PhonePe / GPay QR)</option>
                    <option value="Bank Transfer">Bank NEFT / IMPS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Receipt Note / Remarks</label>
                <input
                  type="text"
                  value={dueCollectData.note}
                  onChange={(e) => setDueCollectData({ ...dueCollectData, note: e.target.value })}
                  placeholder="e.g. Paid in full at counter by customer"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDueCollectModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Credit Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: ADD NEW CUSTOMER DUE (MANUAL UDHAR)
      ======================================================== */}
      {showAddDueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-rose-600" />
                <h4 className="font-bold text-base text-slate-900">Add Customer Due Entry</h4>
              </div>
              <button
                onClick={() => setShowAddDueModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDue} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={addDueForm.customerName}
                  onChange={(e) => setAddDueForm({ ...addDueForm, customerName: e.target.value })}
                  placeholder="e.g. Ramesh Chandra (Nehru Nagar)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={addDueForm.customerPhone}
                  onChange={(e) => setAddDueForm({ ...addDueForm, customerPhone: e.target.value })}
                  placeholder="e.g. 9893733683"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Bill Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={addDueForm.totalBilled}
                    onChange={(e) => setAddDueForm({ ...addDueForm, totalBilled: e.target.value })}
                    placeholder="e.g. 2500"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={addDueForm.totalPaid}
                    onChange={(e) => setAddDueForm({ ...addDueForm, totalPaid: e.target.value })}
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Branch</label>
                <select
                  value={addDueForm.branch}
                  onChange={(e) => setAddDueForm({ ...addDueForm, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Branch 1 - Nehru Nagar">Branch 1 - Nehru Nagar</option>
                  <option value="Branch 2 - Ring Road">Branch 2 - Ring Road</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={addDueForm.notes}
                  onChange={(e) => setAddDueForm({ ...addDueForm, notes: e.target.value })}
                  placeholder="e.g. 3 Suits & 2 Quilts dry cleaned. Promised payment on delivery."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddDueModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Due Khata Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
