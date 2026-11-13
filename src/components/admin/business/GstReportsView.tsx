import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export const GstReportsView: React.FC = () => {
  const { getGstr1Summary, getGstr3bSummary, billingSettings } = useBusiness();
  const { businessSettings, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'gstr1' | 'gstr3b' | 'hsn' | 'config'>('gstr1');

  const gstr1 = getGstr1Summary();
  const gstr3b = getGstr3bSummary();

  const handleExportGstr1Json = () => {
    const jsonBlob = new Blob([JSON.stringify(gstr1, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_${businessSettings.gstin}_${billingSettings.financialYear}.json`;
    a.click();
    showToast('GSTR-1 JSON export generated for GST offline portal tool!', 'success');
  };

  const handleExportHsnCsv = () => {
    const headers = 'HSN_SAC,Description,UQC,Quantity,Total_Value,Taxable_Value,CGST,SGST,IGST,Total_Tax\n';
    const rows = gstr1.hsnSummary
      .map(
        (h) =>
          `"${h.hsnSac}","${h.description}","${h.uqc}",${h.totalQuantity},${h.totalValue},${h.taxableValue},${h.centralTaxAmount},${h.stateTaxAmount},${h.integratedTaxAmount},${h.totalTax}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HSN_Summary_${billingSettings.financialYear}.csv`;
    a.click();
    showToast('HSN Summary CSV exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Percent className="w-5 h-5 text-emerald-600" />
            <span>GST Compliance &amp; Tax Returns (GSTR-1 &amp; GSTR-3B)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated GST filing summaries, HSN/SAC table aggregation, Input Tax Credit (ITC) reconciliation and JSON exports.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportGstr1Json}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GSTR-1 JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
        {[
          { id: 'gstr1', label: 'GSTR-1 Outward Supplies' },
          { id: 'gstr3b', label: 'GSTR-3B Summary & ITC' },
          { id: 'hsn', label: 'HSN / SAC Code Summary' },
          { id: 'config', label: 'GST Configuration' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: GSTR-1 */}
      {activeTab === 'gstr1' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Total Taxable Turnover</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{gstr1.totalTaxable.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Net value before taxes</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
              <div className="text-xs font-bold text-sky-700 uppercase">CGST (Central Tax 9%)</div>
              <div className="text-2xl font-black text-sky-800 mt-1">
                ₹{gstr1.totalCgst.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Intra-State supplies</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
              <div className="text-xs font-bold text-emerald-700 uppercase">SGST (State Tax 9%)</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">
                ₹{gstr1.totalSgst.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Madhya Pradesh (23)</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm">
              <div className="text-xs font-bold text-indigo-700 uppercase">Total GST Output Liability</div>
              <div className="text-2xl font-black text-indigo-900 mt-1">
                ₹{gstr1.grandTotalTax.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Collected from customers</div>
            </div>
          </div>

          {/* GSTR-1 Detailed Tables Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">GSTR-1 Sectional Summary Tables</h3>

            <div className="space-y-3 text-xs">
              {/* Table 4 B2B */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    4A, 4B, 4C — B2B Registered Invoices
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Invoices with customer GSTIN (Boutiques, Clinics, Commercial contracts)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-sm">
                    {gstr1.b2bInvoicesCount} Invoices
                  </div>
                  <div className="text-slate-600">
                    Taxable: ₹{gstr1.b2bTaxableValue.toLocaleString('en-IN')} | Tax: ₹{gstr1.b2bTaxTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Table 7 B2CS */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    7 — B2C Small Invoices (Unregistered Retail Consumers)
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Online laundry doorstep orders &amp; walk-in counter dry cleaning
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-sm">
                    {gstr1.b2csInvoicesCount} Invoices
                  </div>
                  <div className="text-slate-600">
                    Taxable: ₹{gstr1.b2csTaxableValue.toLocaleString('en-IN')} | Tax: ₹{gstr1.b2csTaxTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Table 9 Credit Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    9B — Credit / Debit Notes (Registered &amp; Unregistered)
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Order cancellations, garment damage refunds, and discounts
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-sm">
                    {gstr1.creditDebitNotesCount} Credit Notes
                  </div>
                  <div className="text-slate-600">
                    Impact: ₹{gstr1.creditDebitTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GSTR-3B */}
      {activeTab === 'gstr3b' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-6 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-black text-base text-slate-900">GSTR-3B Monthly Return Computation</h3>
            <p className="text-xs text-slate-500">Self-assessed summary of tax on outward supplies and eligible input tax credit.</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* 3.1 Outward Taxable */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-extrabold text-sm text-slate-900">
                3.1 Details of Outward Supplies &amp; Inward Supplies Liable to Reverse Charge
              </div>
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Total Taxable Value</div>
                  <div className="font-black text-slate-900 mt-0.5">
                    ₹{gstr3b.outwardTaxableSupplies.taxableValue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Integrated Tax (IGST)</div>
                  <div className="font-black text-slate-900 mt-0.5">
                    ₹{gstr3b.outwardTaxableSupplies.igst.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Central Tax (CGST)</div>
                  <div className="font-black text-slate-900 mt-0.5">
                    ₹{gstr3b.outwardTaxableSupplies.cgst.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">State Tax (SGST)</div>
                  <div className="font-black text-slate-900 mt-0.5">
                    ₹{gstr3b.outwardTaxableSupplies.sgst.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Eligible ITC */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="font-extrabold text-sm text-emerald-900">
                4. Eligible Input Tax Credit (ITC) Available (from Inward Purchase Bills)
              </div>
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-emerald-200 text-center">
                <div>
                  <div className="text-[10px] text-emerald-700 font-bold uppercase">Inward Taxable Base</div>
                  <div className="font-black text-emerald-950 mt-0.5">
                    ₹{gstr3b.inwardSuppliesEligibleForItc.allOtherItc.taxableValue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 font-bold uppercase">IGST ITC</div>
                  <div className="font-black text-emerald-950 mt-0.5">
                    ₹{gstr3b.inwardSuppliesEligibleForItc.allOtherItc.igst.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 font-bold uppercase">CGST ITC</div>
                  <div className="font-black text-emerald-950 mt-0.5">
                    ₹{gstr3b.inwardSuppliesEligibleForItc.allOtherItc.cgst.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 font-bold uppercase">SGST ITC</div>
                  <div className="font-black text-emerald-950 mt-0.5">
                    ₹{gstr3b.inwardSuppliesEligibleForItc.allOtherItc.sgst.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Net Payable */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="font-black text-sm uppercase text-sky-400">
                5. Net Tax Payable In Cash (Output Tax Liability Minus Eligible ITC)
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Net CGST Payable</div>
                  <div className="font-black text-base text-emerald-400 mt-1 font-mono">
                    ₹{gstr3b.netTaxPayable.cgst.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Net SGST Payable</div>
                  <div className="font-black text-base text-emerald-400 mt-1 font-mono">
                    ₹{gstr3b.netTaxPayable.sgst.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Total Cash Outflow</div>
                  <div className="font-black text-base text-white mt-1 font-mono">
                    ₹{(gstr3b.netTaxPayable.cgst + gstr3b.netTaxPayable.sgst).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HSN SUMMARY */}
      {activeTab === 'hsn' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Table 12 — HSN / SAC Summary</h3>
              <p className="text-xs text-slate-500">Summary of outward supplies categorized by statutory HSN/SAC codes.</p>
            </div>
            <button
              onClick={handleExportHsnCsv}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">HSN / SAC</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">UQC</th>
                  <th className="py-2.5 px-3 text-center">Total Qty</th>
                  <th className="py-2.5 px-3 text-right">Taxable Value (₹)</th>
                  <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total Tax (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {gstr1.hsnSummary.map((hsn) => (
                  <tr key={hsn.hsnSac} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-black text-brand-700">{hsn.hsnSac}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{hsn.description}</td>
                    <td className="py-2.5 px-3 text-slate-500">{hsn.uqc}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{hsn.totalQuantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      ₹{hsn.taxableValue.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      ₹{hsn.centralTaxAmount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      ₹{hsn.stateTaxAmount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">
                      ₹{hsn.totalTax.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: GST CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-6 space-y-4 max-w-2xl">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Statutory GST Profile Settings
          </h3>

          <div className="space-y-3 text-xs font-bold">
            <div>
              <span className="text-slate-400 block mb-0.5">GSTIN Number</span>
              <span className="font-mono text-sm text-brand-700">{businessSettings.gstin}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Legal Business Name</span>
              <span className="text-slate-900">{businessSettings.businessName}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block mb-0.5">Registered State &amp; Code</span>
                <span className="text-slate-900">Madhya Pradesh (Code: 23)</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Taxpayer Type</span>
                <span className="text-slate-900">Regular Taxpayer</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-slate-600 font-normal">
              Official GST filing is prepared using standard GSTN offline schema formats. Authorize filing credentials directly via the GST Portal.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

