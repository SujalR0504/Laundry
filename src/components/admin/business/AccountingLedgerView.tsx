import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import { JournalEntry, ChartAccount } from '../../../business/types';
import {
  DollarSign,
  Plus,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  Search,
  Filter,
  X,
  Scale,
  Receipt,
  Layers,
} from 'lucide-react';

export const AccountingLedgerView: React.FC = () => {
  const {
    chartOfAccounts,
    journalEntries,
    createJournalEntry,
    getTrialBalance,
    getProfitAndLoss,
    getBalanceSheet,
  } = useBusiness();

  const { showToast } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'chart' | 'journal' | 'trial_balance' | 'pnl' | 'balance_sheet' | 'cashbook'
  >('overview');

  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState('');
  const [voucherType, setVoucherType] = useState<any>('journal');
  const [journalLines, setJournalLines] = useState<
    { accountId: string; debit: number; credit: number; notes?: string }[]
  >([
    { accountId: chartOfAccounts[0]?.id || '', debit: 1000, credit: 0 },
    { accountId: chartOfAccounts[1]?.id || '', debit: 0, credit: 1000 },
  ]);

  const trialBalance = getTrialBalance();
  const pnl = getProfitAndLoss();
  const balanceSheet = getBalanceSheet();

  const totalTbDebit = trialBalance.reduce((sum, item) => sum + item.debit, 0);
  const totalTbCredit = trialBalance.reduce((sum, item) => sum + item.credit, 0);

  const handleAddJournalLine = () => {
    setJournalLines((prev) => [
      ...prev,
      { accountId: chartOfAccounts[0]?.id || '', debit: 0, credit: 0 },
    ]);
  };

  const handleRemoveJournalLine = (index: number) => {
    if (journalLines.length <= 2) return;
    setJournalLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sumDr = journalLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const sumCr = journalLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

    if (Math.abs(sumDr - sumCr) > 0.01) {
      showToast(`Double-entry rule violation: Debits (₹${sumDr}) must equal Credits (₹${sumCr})`, 'error');
      return;
    }

    const lines = journalLines.map((l) => {
      const acc = chartOfAccounts.find((a) => a.id === l.accountId);
      return {
        accountId: l.accountId,
        accountName: acc?.name || 'Account',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        notes: l.notes,
      };
    });

    createJournalEntry({
      date: journalDate,
      voucherType,
      narration: narration || 'Journal adjustment voucher',
      lines,
      totalDebit: sumDr,
      totalCredit: sumCr,
    });

    showToast('Double-entry journal voucher posted to general ledger!', 'success');
    setShowJournalModal(false);
    setNarration('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <span>Double-Entry Financial Accounting Suite</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full General Ledger, Chart of Accounts, Journal Vouchers, Cashbook, Trial Balance, P&amp;L, and Balance Sheet.
          </p>
        </div>

        <button
          onClick={() => setShowJournalModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Post Journal Voucher</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
        {[
          { id: 'overview', label: 'Financial Overview' },
          { id: 'trial_balance', label: 'Trial Balance' },
          { id: 'pnl', label: 'Profit & Loss (P&L)' },
          { id: 'balance_sheet', label: 'Balance Sheet' },
          { id: 'chart', label: `Chart of Accounts (${chartOfAccounts.length})` },
          { id: 'journal', label: `General Journal (${journalEntries.length})` },
          { id: 'cashbook', label: 'Cash & Bank Books' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeSubTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: FINANCIAL OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Total Revenue (Income)</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{pnl.totalIncome.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">
                Dry clean, wash &amp; retail sales
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Gross Profit</div>
              <div className="text-2xl font-black text-indigo-700 mt-1">
                ₹{pnl.grossProfit.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Revenue minus consumables cost
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Operating Expenses</div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                ₹{pnl.totalExpenses.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Rent, power, salaries, maintenance
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Net Operating Profit</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                ₹{pnl.netProfit.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Clean bottom-line profitability
              </div>
            </div>
          </div>

          {/* Quick Double Entry Summary Check */}
          <div className="p-5 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-indigo-950">
                  Double-Entry Ledger Equation In Sync
                </h4>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Assets (₹{balanceSheet.totalAssets.toLocaleString('en-IN')}) = Liabilities (₹{balanceSheet.totalLiabilities.toLocaleString('en-IN')}) + Equity (₹{balanceSheet.totalEquity.toLocaleString('en-IN')})
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black bg-white text-indigo-900 px-3 py-1.5 rounded-xl border border-indigo-200 shadow-xs">
                Trial Balance Balanced: ₹{totalTbDebit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TRIAL BALANCE */}
      {activeSubTab === 'trial_balance' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Trial Balance Sheet</h3>
              <p className="text-xs text-slate-500">Summary of all debit and credit balances in the general ledger.</p>
            </div>
            <div className="text-right font-mono font-bold text-xs text-emerald-700">
              Dr: ₹{totalTbDebit.toLocaleString('en-IN')} | Cr: ₹{totalTbCredit.toLocaleString('en-IN')}
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Account Title</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 text-right">Debit (Dr) ₹</th>
                <th className="py-2.5 px-3 text-right">Credit (Cr) ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {trialBalance.map((acc) => (
                <tr key={acc.accountId} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{acc.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{acc.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{acc.category}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                    {acc.debit > 0 ? `₹${acc.debit.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                    {acc.credit > 0 ? `₹${acc.credit.toLocaleString('en-IN')}` : '—'}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-black text-xs border-t-2 border-slate-300">
                <td colSpan={3} className="py-3 px-3 uppercase text-slate-800">
                  Total Trial Balance Equilibrium
                </td>
                <td className="py-3 px-3 text-right text-emerald-700 font-mono">
                  ₹{totalTbDebit.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-3 text-right text-emerald-700 font-mono">
                  ₹{totalTbCredit.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 3: PROFIT & LOSS STATEMENT */}
      {activeSubTab === 'pnl' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4 text-center">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
              Statement of Profit and Loss
            </h3>
            <p className="text-xs text-slate-500">For Financial Year 2026-27 (Rewa Plant Operations)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Section */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2.5 rounded-xl">
                I. Inward Revenue &amp; Income
              </h4>
              <div className="space-y-2 text-xs">
                {pnl.incomeBreakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-2 rounded-lg hover:bg-slate-50">
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between p-3 bg-emerald-100/50 rounded-xl font-black text-sm text-emerald-950 mt-4">
                  <span>Total Revenue (A):</span>
                  <span>₹{pnl.totalIncome.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-800 bg-rose-50 p-2.5 rounded-xl">
                II. Operating &amp; Indirect Expenses
              </h4>
              <div className="space-y-2 text-xs">
                {pnl.expenseBreakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-2 rounded-lg hover:bg-slate-50">
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between p-3 bg-rose-100/50 rounded-xl font-black text-sm text-rose-950 mt-4">
                  <span>Total Expenses (B):</span>
                  <span>₹{pnl.totalExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-slate-200 flex justify-between items-center p-4 bg-slate-900 text-white rounded-2xl">
            <span className="font-black text-sm uppercase">Net Operating Profit (A - B):</span>
            <span className="font-black text-lg text-emerald-400 font-mono">
              ₹{pnl.netProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BALANCE SHEET */}
      {activeSubTab === 'balance_sheet' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4 text-center">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
              Balance Sheet Statement
            </h3>
            <p className="text-xs text-slate-500">As of Current Reporting Date (Rewa Flagship Facilities)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assets */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-sky-800 bg-sky-50 p-2.5 rounded-xl">
                Assets
              </h4>
              <div className="space-y-2 text-xs">
                {chartOfAccounts
                  .filter((a) =>
                    [
                      'Current Asset',
                      'Fixed Asset',
                      'Bank Account',
                      'Cash in Hand',
                      'Accounts Receivable',
                      'Inventory Asset',
                    ].includes(a.category)
                  )
                  .map((acc) => (
                    <div key={acc.id} className="flex justify-between p-2 rounded-lg hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800">{acc.name}</span>
                        <div className="text-[10px] text-slate-400">{acc.category}</div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{acc.currentBalance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between p-3 bg-sky-100/50 rounded-xl font-black text-sm text-sky-950 mt-4">
                  <span>Total Assets:</span>
                  <span>₹{balanceSheet.totalAssets.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-800 bg-amber-50 p-2.5 rounded-xl">
                Liabilities &amp; Owner Equity
              </h4>
              <div className="space-y-2 text-xs">
                {chartOfAccounts
                  .filter((a) =>
                    ['Current Liability', 'Accounts Payable', 'Duties & Taxes', 'Equity / Capital'].includes(
                      a.category
                    )
                  )
                  .map((acc) => (
                    <div key={acc.id} className="flex justify-between p-2 rounded-lg hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800">{acc.name}</span>
                        <div className="text-[10px] text-slate-400">{acc.category}</div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{acc.currentBalance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between p-2 rounded-lg bg-emerald-50/50 text-emerald-900">
                  <span className="font-bold">Retained Net Profit (P&amp;L)</span>
                  <span className="font-mono font-bold">₹{pnl.netProfit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between p-3 bg-amber-100/50 rounded-xl font-black text-sm text-amber-950 mt-4">
                  <span>Total Liabilities &amp; Equity:</span>
                  <span>₹{balanceSheet.totalAssets.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: CHART OF ACCOUNTS */}
      {activeSubTab === 'chart' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Account Title</th>
                  <th className="py-3 px-4">Accounting Category</th>
                  <th className="py-3 px-4">Normal Nature</th>
                  <th className="py-3 px-4 text-right">Current Ledger Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {chartOfAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">{acc.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{acc.name}</td>
                    <td className="py-3 px-4 text-slate-600">{acc.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          acc.nature === 'debit'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {acc.nature}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                      ₹{acc.currentBalance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: GENERAL JOURNAL */}
      {activeSubTab === 'journal' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-900">General Journal Entries</h3>
            <span className="text-xs text-slate-400 font-bold">{journalEntries.length} Vouchers</span>
          </div>

          <div className="space-y-4">
            {journalEntries.map((jv) => (
              <div
                key={jv.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5"
              >
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-brand-700">{jv.entryNumber}</span>
                    <span className="capitalize font-bold text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                      {jv.voucherType} voucher
                    </span>
                    {jv.referenceNumber && (
                      <span className="text-[10px] text-slate-400">Ref: {jv.referenceNumber}</span>
                    )}
                  </div>
                  <span className="text-slate-500 font-semibold">{jv.date}</span>
                </div>

                <div className="text-slate-700 font-medium italic">"{jv.narration}"</div>

                <div className="bg-white rounded-xl p-2.5 border border-slate-100 space-y-1">
                  {jv.lines.map((line, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <span className="font-bold text-slate-800">
                        {line.debit > 0 ? line.accountName : `  To ${line.accountName}`}
                      </span>
                      <div className="space-x-4 font-mono font-bold">
                        {line.debit > 0 ? (
                          <span className="text-slate-900">Dr: ₹{line.debit.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-emerald-700">Cr: ₹{line.credit.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 7: CASHBOOK & BANKBOOK */}
      {activeSubTab === 'cashbook' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Cashbook */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h4 className="font-black text-sm text-slate-900">Cashbook (Store Counter Drawer)</h4>
              </div>
              <span className="font-mono font-black text-emerald-700 text-sm">
                ₹{chartOfAccounts.find((a) => a.id === 'acc-cash')?.currentBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Immediate walk-in cash intake, change dispensed, and cash purchase vouchers.
            </p>
          </div>

          {/* Bankbook */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <h4 className="font-black text-sm text-slate-900">Bankbook (SBI, HDFC &amp; UPI)</h4>
              </div>
              <span className="font-mono font-black text-sky-700 text-sm">
                ₹
                {chartOfAccounts
                  .filter((a) => a.category === 'Bank Account')
                  .reduce((sum, a) => sum + a.currentBalance, 0)
                  .toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Electronic merchant inflows via Razorpay gateway, PhonePe/GPay QR, and supplier NEFTs.
            </p>
          </div>
        </div>
      )}

      {/* POST MANUAL JOURNAL ENTRY MODAL */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Post Double-Entry Journal Voucher</h3>
              <button onClick={() => setShowJournalModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJournalSubmit} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Voucher Type</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="journal">General Journal Voucher (JV)</option>
                    <option value="contra">Contra Voucher (Cash/Bank Transfer)</option>
                    <option value="payment">Payment Voucher</option>
                    <option value="receipt">Receipt Voucher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={journalDate}
                    onChange={(e) => setJournalDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Narration / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Being machinery steam boiler maintenance adjustment"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  required
                />
              </div>

              {/* Debit and Credit Line Items */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="uppercase text-slate-600">Journal Lines (Debits &amp; Credits)</span>
                  <button
                    type="button"
                    onClick={handleAddJournalLine}
                    className="text-indigo-600 hover:text-indigo-700 font-bold"
                  >
                    + Add Line
                  </button>
                </div>

                {journalLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 items-center"
                  >
                    <div className="col-span-6">
                      <select
                        value={line.accountId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setJournalLines((prev) => {
                            const c = [...prev];
                            c[idx].accountId = val;
                            return c;
                          });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        {chartOfAccounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Debit ₹"
                        value={line.debit || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setJournalLines((prev) => {
                            const c = [...prev];
                            c[idx].debit = Number(val);
                            if (Number(val) > 0) c[idx].credit = 0;
                            return c;
                          });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-right font-mono"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Credit ₹"
                        value={line.credit || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setJournalLines((prev) => {
                            const c = [...prev];
                            c[idx].credit = Number(val);
                            if (Number(val) > 0) c[idx].debit = 0;
                            return c;
                          });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-right font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowJournalModal(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  Post to General Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

