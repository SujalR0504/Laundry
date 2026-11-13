import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  Save,
  RotateCcw,
  Building2,
  Palette,
  QrCode,
  FileText,
  Check,
  Eye,
  Sliders,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  CheckCircle2,
  FileCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BranchInvoiceConfig } from '../../types';
import { numberToWordsINR } from '../../utils/numberToWords';

// Authentic Payment App Badges
const UpiLogos: React.FC = () => (
  <div className="flex items-center space-x-2 my-1">
    <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#5f259f] text-white text-[10px] font-bold shadow-xs">
      <span className="w-3.5 h-3.5 rounded-full bg-white text-[#5f259f] flex items-center justify-center text-[9px] font-black leading-none">
        ₹
      </span>
      <span>PhonePe</span>
    </div>

    <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-bold shadow-xs">
      <span className="font-extrabold text-[11px] leading-none">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">o</span>
        <span className="text-[#FBBC05]">o</span>
        <span className="text-[#4285F4]">g</span>
        <span className="text-[#34A853]">l</span>
        <span className="text-[#EA4335]">e</span>
      </span>
      <span className="text-slate-800 ml-0.5">Pay</span>
    </div>

    <div className="flex items-center px-1.5 py-0.5 rounded bg-[#002e6e] text-white text-[10px] font-black tracking-tight shadow-xs">
      <span>Paytm</span>
    </div>

    <div className="flex items-center px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold shadow-xs">
      <span className="text-emerald-400 font-black">UPI</span>
      <span className="text-amber-400 text-[8px] ml-0.5 font-bold">▶▶</span>
    </div>
  </div>
);

// Sample Order Presets for Testing
const SAMPLE_ORDERS = {
  standard: {
    customerName: 'Aarav Sharma',
    customerPhone: '9826182910',
    date: '2026-10-31',
    invoiceNumber: '001048',
    previousDue: 0,
    items: [
      { name: "Men's Formal Cotton Shirt (Steam Press)", qty: 4, rate: 25, total: 100 },
      { name: 'Formal Trouser / Pant (Dry Clean)', qty: 2, rate: 80, total: 160 },
      { name: 'Designer Kurta Pajama (Dry Clean)', qty: 1, rate: 150, total: 150 },
    ],
  },
  premium: {
    customerName: 'Smt. Priya Singh',
    customerPhone: '9425178293',
    date: '2026-10-31',
    invoiceNumber: '001049',
    previousDue: 450,
    items: [
      { name: 'Pure Silk Saree (Roll Press & Dry Clean)', qty: 2, rate: 250, total: 500 },
      { name: 'Bridal Heavy Lehenga (Specialty Care)', qty: 1, rate: 650, total: 650 },
      { name: 'Gentleman Blazer / 2-Piece Suit (Dry Clean)', qty: 1, rate: 280, total: 280 },
    ],
  },
  blankets: {
    customerName: 'Vikram Patel',
    customerPhone: '9630528171',
    date: '2026-10-31',
    invoiceNumber: '001050',
    previousDue: 200,
    items: [
      { name: 'Double Bed Heavy Quilt / Blanket (Dry Clean)', qty: 2, rate: 350, total: 700 },
      { name: 'Winter Woolen Jacket / Overcoat', qty: 2, rate: 200, total: 400 },
      { name: 'Window Curtains (Per Panel)', qty: 4, rate: 90, total: 360 },
    ],
  },
};

const COLOR_PRESETS = [
  { name: 'Royal Navy', hex: '#3b479b', desc: 'Branch 1 Classic' },
  { name: 'Forest Emerald', hex: '#064e3b', desc: 'Branch 2 Ring Road' },
  { name: 'Deep Indigo', hex: '#4338ca', desc: 'Modern Luxe' },
  { name: 'Ruby Crimson', hex: '#991b1b', desc: 'High Contrast' },
  { name: 'Slate Midnight', hex: '#0f172a', desc: 'Monochrome Executive' },
  { name: 'Amber Bronze', hex: '#b45309', desc: 'Artisan Warm' },
];

const LOGO_PRESETS = [
  {
    name: 'Transparent Brand Logo',
    url: '/logo-transparent.png',
    desc: 'Signature wordmark with transparent background',
  },
  {
    name: 'Circular Emblem Badge',
    url: '/logo-icon.png',
    desc: 'Washing machine insignia in circular seal',
  },
  {
    name: 'High-Contrast Full Banner',
    url: '/the-laundry-lounge-logo.png',
    desc: 'Full typography brand crest with subtitle',
  },
  {
    name: 'Solid Brand Square',
    url: '/logo-full.jpg',
    desc: 'Deep square mark with dark background',
  },
];

export const InvoiceDesigner: React.FC = () => {
  const { businessSettings, updateBusinessSettings, showToast } = useApp();

  // Branch selected for designing: branch1 or branch2
  const [activeBranch, setActiveBranch] = useState<'branch1' | 'branch2'>('branch1');

  // Active designer customization tab
  const [activeTab, setActiveTab] = useState<'header' | 'logo' | 'theme' | 'bank' | 'terms' | 'signatory' | 'toggles'>('header');

  // Sample order for live preview
  const [samplePresetKey, setSamplePresetKey] = useState<'standard' | 'premium' | 'blankets'>('standard');

  // Local draft state for Branch 1 & Branch 2
  const defaultBranch1: BranchInvoiceConfig = {
    branchId: 'branch-1',
    businessTitle: 'The Laundry Lounge',
    tagline: 'Professional Laundry & Dry Cleaning Services — Rewa (M.P.)',
    address: 'Near Gaytri School Arun Nagar, Rewa, Madhya Pradesh, 486001',
    phone: '9893733683',
    secondaryPhone: '9329838804',
    email: 'thelaundrylounge0896@gmail.com',
    gstin: '23AAAAA0000A1Z5',
    invoicePrefix: 'TL/SL/26-27/',
    invoiceTitle: 'RETAIL INVOICE / CASH MEMO',
    primaryColor: '#3b479b',
    accountHolderName: 'The Laundry Lounge',
    ifscCode: 'AUBL0002329',
    accountNumber: '2502232998286289',
    bankName: 'AU Small Finance Bank ,REWA',
    upiId: 'thelaundrylounge0896@aubank',
    terms: [
      '1- Please keep the count of clothes with you while giving clothes.',
      '2- Please take the clothes after 15 day otherwise there will be no compulsion for the shopkeeper.',
      '3- In this era of fashion, there is no guarantee that the color of raw clothes will go.',
    ],
    signatoryTitle: 'AUTHORISED SIGNATORY FOR The Laundry Lounge',
    signatureText: 'Jindam.',
    logoUrl: '/logo-transparent.png',
    showLogo: true,
    logoHeight: 56,
    logoContainerStyle: 'card',
    showQrCode: true,
    showBankDetails: true,
    showTerms: true,
    showPreviousDue: true,
    showAmountInWords: true,
    footerNote: 'Thank you for trusting The Laundry Lounge with your fine fabrics!',
  };

  const defaultBranch2: BranchInvoiceConfig = {
    branchId: 'branch-2',
    businessTitle: 'The Laundry Lounge',
    tagline: 'Ring Road Commercial Laundromat & Precision Finishing Hub',
    address: 'Behind Hotel The Vijay Villas Gadariya Ring Road, Rewa, Madhya Pradesh, 486001',
    phone: '9329838804',
    secondaryPhone: '9893733683',
    email: 'thelaundrylounge0896@gmail.com',
    gstin: '23AAAAA0000A1Z5',
    invoicePrefix: 'TL/B2/26-27/',
    invoiceTitle: 'RETAIL INVOICE / CASH MEMO',
    primaryColor: '#064e3b',
    accountHolderName: 'The Laundry Lounge',
    ifscCode: 'AUBL0002329',
    accountNumber: '2502232998286289',
    bankName: 'AU Small Finance Bank ,REWA',
    upiId: 'thelaundrylounge0896@aubank',
    terms: [
      '1- Please keep the count of clothes with you while giving clothes.',
      '2- Please take the clothes after 15 day otherwise there will be no compulsion for the shopkeeper.',
      '3- In this era of fashion, there is no guarantee that the color of raw clothes will go.',
    ],
    signatoryTitle: 'AUTHORISED SIGNATORY FOR The Laundry Lounge',
    signatureText: 'Jindam.',
    logoUrl: '/logo-transparent.png',
    showLogo: true,
    logoHeight: 56,
    logoContainerStyle: 'card',
    showQrCode: true,
    showBankDetails: true,
    showTerms: true,
    showPreviousDue: true,
    showAmountInWords: true,
    footerNote: 'Thank you for choosing The Laundry Lounge — Ring Road Branch!',
  };

  // State
  const [config, setConfig] = useState<BranchInvoiceConfig>(() => {
    return (
      businessSettings.invoiceSettings?.[activeBranch] ||
      (activeBranch === 'branch1' ? defaultBranch1 : defaultBranch2)
    );
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Sync when switching activeBranch
  useEffect(() => {
    const loaded =
      businessSettings.invoiceSettings?.[activeBranch] ||
      (activeBranch === 'branch1' ? defaultBranch1 : defaultBranch2);
    setConfig(loaded);
    setHasUnsavedChanges(false);
  }, [activeBranch, businessSettings.invoiceSettings]);

  const handleChange = (field: keyof BranchInvoiceConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    const existing = businessSettings.invoiceSettings || {
      branch1: defaultBranch1,
      branch2: defaultBranch2,
    };

    const updatedSettings = {
      ...existing,
      [activeBranch]: config,
    };

    updateBusinessSettings({
      invoiceSettings: updatedSettings,
    });

    setHasUnsavedChanges(false);
    showToast(
      `Invoice template for ${activeBranch === 'branch1' ? 'Branch 1 (Arun Nagar)' : 'Branch 2 (Ring Road)'} saved successfully!`,
      'success'
    );
  };

  const handleReset = () => {
    const def = activeBranch === 'branch1' ? defaultBranch1 : defaultBranch2;
    setConfig(def);
    setHasUnsavedChanges(true);
    showToast('Reset template to default settings', 'info');
  };

  // Terms helpers
  const handleTermChange = (idx: number, val: string) => {
    const next = [...config.terms];
    next[idx] = val;
    handleChange('terms', next);
  };

  const handleAddTerm = () => {
    handleChange('terms', [...config.terms, `${config.terms.length + 1}- New clause / term...`]);
  };

  const handleRemoveTerm = (idx: number) => {
    const next = config.terms.filter((_, i) => i !== idx);
    handleChange('terms', next);
  };

  // File upload for custom store logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('logoUrl', event.target?.result as string);
      handleChange('showLogo', true);
      showToast('Custom store logo uploaded and applied to bill header!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // File upload for QR code
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('customQrUrl', event.target?.result as string);
      showToast('Custom QR image loaded for preview', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Test Print via isolated iframe
  const handleTestPrint = () => {
    if (!printAreaRef.current) {
      window.print();
      return;
    }

    try {
      const printFrame = document.createElement('iframe');
      printFrame.setAttribute(
        'style',
        'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;'
      );
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
      if (!frameDoc) {
        window.print();
        return;
      }

      const sample = SAMPLE_ORDERS[samplePresetKey];
      const itemsTotal = sample.items.reduce((sum, item) => sum + item.total, 0);
      const totalQty = sample.items.reduce((sum, item) => sum + item.qty, 0);
      const effectiveTotal = itemsTotal + (config.showPreviousDue ? sample.previousDue : 0);
      const totalWords = numberToWordsINR(effectiveTotal);

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sample Invoice - ${config.businessTitle}</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
            <style>
              @page {
                size: A4 portrait;
                margin: 6mm;
              }
              body {
                font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                background-color: white !important;
                color: #0f172a !important;
                margin: 0 !important;
                padding: 10px !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            </style>
          </head>
          <body class="bg-white">
            <div style="max-width: 760px; margin: 0 auto;">
              ${printAreaRef.current.innerHTML}
            </div>
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (err) {
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 2000);
        }
      }, 500);
    } catch (err) {
      window.print();
    }
  };

  // Sample data computations
  const currentSample = SAMPLE_ORDERS[samplePresetKey];
  const sampleItemsSubtotal = currentSample.items.reduce((sum, i) => sum + i.total, 0);
  const sampleTotalQty = currentSample.items.reduce((sum, i) => sum + i.qty, 0);
  const sampleEffectiveTotal = sampleItemsSubtotal + (config.showPreviousDue ? currentSample.previousDue : 0);
  const sampleInWords = numberToWordsINR(sampleEffectiveTotal);

  const primaryColor = config.primaryColor || (activeBranch === 'branch2' ? '#064e3b' : '#3b479b');

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. TOP BAR: TITLE, BRANCH SWITCHER & ACTIONS
      ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-brand-50 text-brand-600 rounded-xl">
              <Printer className="w-5 h-5 text-sky-600" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Invoice &amp; Bill Template Designer
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              Dedicated Studio
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Customize print headers, bank accounts, UPI QR codes, color themes, terms &amp; conditions for Branch 1 and Branch 2.
          </p>
        </div>

        {/* Branch Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Branch Switcher Pills */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setActiveBranch('branch1')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeBranch === 'branch1'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Branch 1 (Arun Nagar)</span>
            </button>

            <button
              onClick={() => setActiveBranch('branch2')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeBranch === 'branch2'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Branch 2 (Ring Road)</span>
            </button>
          </div>

          {/* Test Print Button */}
          <button
            onClick={handleTestPrint}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
            title="Preview or test print bill with sample data"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Test Print Bill</span>
          </button>

          {/* Reset Template */}
          <button
            onClick={handleReset}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            title="Reset to default template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95 ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. WORKSPACE GRID: LEFT CONTROLS + RIGHT LIVE PREVIEW
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN: CUSTOMIZER STUDIO (5 Cols)
        ======================================================== */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
          {/* Section Navigation Tabs */}
          <div className="flex items-center overflow-x-auto no-scrollbar gap-1 pb-2 border-b border-slate-100">
            {[
              { id: 'header', label: 'Header & Shop', icon: Building2 },
              { id: 'logo', label: 'Store Logo', icon: ImageIcon },
              { id: 'theme', label: 'Theme & Color', icon: Palette },
              { id: 'bank', label: 'Bank & UPI', icon: QrCode },
              { id: 'terms', label: 'Terms & Rules', icon: FileText },
              { id: 'signatory', label: 'Signature', icon: ShieldCheck },
              { id: 'toggles', label: 'Layout Options', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: HEADER & SHOP DETAILS */}
          {activeTab === 'header' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Business Title / Heading *</label>
                <input
                  type="text"
                  value={config.businessTitle}
                  onChange={(e) => handleChange('businessTitle', e.target.value)}
                  placeholder="e.g. The Laundry Lounge"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Quick Brand Logo Bar */}
              <div className="p-3 bg-gradient-to-r from-sky-50/70 to-indigo-50/50 border border-sky-100 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                    {config.logoUrl || '/logo-transparent.png' ? (
                      <img
                        src={config.logoUrl || '/logo-transparent.png'}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 flex items-center space-x-1.5 truncate">
                      <span>Header Brand Logo</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        config.showLogo !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {config.showLogo !== false ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {config.showLogo !== false ? 'Rendered in top banner' : 'Currently hidden from print'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('logo')}
                  className="px-3 py-1.5 bg-white border border-sky-200 hover:border-sky-500 text-sky-700 hover:bg-sky-50 rounded-xl font-bold text-xs shrink-0 transition-all shadow-2xs"
                >
                  Edit Logo →
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Invoice Banner Title *</label>
                <input
                  type="text"
                  value={config.invoiceTitle || 'RETAIL INVOICE / CASH MEMO'}
                  onChange={(e) => handleChange('invoiceTitle', e.target.value)}
                  placeholder="e.g. RETAIL INVOICE / CASH MEMO"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-sky-500 uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline / Sub-heading</label>
                <input
                  type="text"
                  value={config.tagline || ''}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="e.g. Premium Laundry & Dry Cleaning Services — Rewa"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Physical Store Address *</label>
                <textarea
                  rows={2}
                  value={config.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Full street address..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Phone *</label>
                  <input
                    type="tel"
                    value={config.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="9893733683"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secondary Phone</label>
                  <input
                    type="tel"
                    value={config.secondaryPhone || ''}
                    onChange={(e) => handleChange('secondaryPhone', e.target.value)}
                    placeholder="9329838804"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email ID</label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@laundrylounge.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bill Serial Prefix *</label>
                  <input
                    type="text"
                    value={config.invoicePrefix}
                    onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                    placeholder="TL/SL/26-27/"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GSTIN Number (Optional)</label>
                <input
                  type="text"
                  value={config.gstin || ''}
                  onChange={(e) => handleChange('gstin', e.target.value)}
                  placeholder="23AAAAA0000A1Z5"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB: STORE LOGO & BRANDING */}
          {activeTab === 'logo' && (
            <div className="space-y-4 text-xs">
              {/* Header with Master Toggle */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Display Logo on Bill Header</div>
                  <p className="text-slate-500 text-[11px]">
                    Show your business logo alongside company title on printed and PDF invoices
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showLogo !== false}
                    onChange={(e) => handleChange('showLogo', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Current Active Logo Preview Box */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Current Active Logo</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* On Dark / Header Banner Color */}
                  <div
                    className="p-4 rounded-2xl flex flex-col items-center justify-center min-h-[110px] relative transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="text-[10px] uppercase font-bold text-white/70 absolute top-2 left-2">
                      On Bill Header
                    </span>
                    {config.logoUrl || '/logo-transparent.png' ? (
                      <div className={`p-1.5 rounded-xl ${config.logoContainerStyle === 'frameless' ? '' : 'bg-white shadow-sm'}`}>
                        <img
                          src={config.logoUrl || '/logo-transparent.png'}
                          alt="Invoice Logo"
                          style={{ maxHeight: `${config.logoHeight || 56}px`, width: 'auto' }}
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <span className="text-white/60 text-xs">No logo chosen</span>
                    )}
                  </div>

                  {/* On Light / Paper Background */}
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center min-h-[110px] relative">
                    <span className="text-[10px] uppercase font-bold text-slate-400 absolute top-2 left-2">
                      Original Asset
                    </span>
                    {config.logoUrl || '/logo-transparent.png' ? (
                      <img
                        src={config.logoUrl || '/logo-transparent.png'}
                        alt="Invoice Logo"
                        style={{ maxHeight: `${config.logoHeight || 56}px`, width: 'auto' }}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 text-xs">No logo chosen</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Custom Logo Button & Actions */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Upload Custom Logo from Device</label>
                <input
                  type="file"
                  ref={logoFileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleChange('logoUrl', '/logo-transparent.png');
                      handleChange('showLogo', true);
                      showToast('Reset to default transparent brand logo', 'info');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Default Brand Logo</span>
                  </button>

                  {config.logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('logoUrl', '');
                        handleChange('showLogo', false);
                        showToast('Logo removed from invoice header', 'info');
                      }}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supported formats: PNG (recommended with transparent background), JPG, SVG, WEBP. Max size: 5MB.
                </p>
              </div>

              {/* Official Laundry Lounge Presets */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Official Brand Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {LOGO_PRESETS.map((preset) => {
                    const isSelected = (config.logoUrl || '/logo-transparent.png') === preset.url;
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => {
                          handleChange('logoUrl', preset.url);
                          handleChange('showLogo', true);
                          showToast(`Applied preset: ${preset.name}`, 'success');
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate text-[11px]">
                            {preset.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {preset.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logo Sizing Controls */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Logo Size / Height</label>
                  <span className="font-mono font-bold text-slate-500">{config.logoHeight || 56}px</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    { label: 'Compact', h: 44 },
                    { label: 'Standard', h: 56 },
                    { label: 'Large', h: 70 },
                    { label: 'Extra Lg', h: 84 },
                  ].map((size) => (
                    <button
                      key={size.h}
                      type="button"
                      onClick={() => handleChange('logoHeight', size.h)}
                      className={`py-1.5 px-2 rounded-xl font-bold text-[11px] border text-center transition-all ${
                        (config.logoHeight || 56) === size.h
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="32"
                  max="96"
                  step="2"
                  value={config.logoHeight || 56}
                  onChange={(e) => handleChange('logoHeight', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              {/* Logo Badge Styling */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Logo Background Badge Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('logoContainerStyle', 'card')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      (config.logoContainerStyle || 'card') === 'card'
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">White Rounded Badge</div>
                    <div className="text-[10px] text-slate-500">
                      Clean white pill background for maximum legibility on dark banners
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('logoContainerStyle', 'frameless')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      config.logoContainerStyle === 'frameless'
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">Frameless / Direct</div>
                    <div className="text-[10px] text-slate-500">
                      Renders directly onto banner without white card wrapper
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THEME & COLOR ACCENT */}
          {activeTab === 'theme' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-2">Preset Accent Color Palettes</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => handleChange('primaryColor', p.hex)}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                        primaryColor === p.hex
                          ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-lg shrink-0 shadow-xs"
                        style={{ backgroundColor: p.hex }}
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-[11px]">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.hex}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Custom Brand Hex Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    placeholder="#3b479b"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANK & UPI QR SETUP */}
          {activeTab === 'bank' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank Name *</label>
                <input
                  type="text"
                  value={config.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  placeholder="e.g. AU Small Finance Bank ,REWA"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  value={config.accountHolderName}
                  onChange={(e) => handleChange('accountHolderName', e.target.value)}
                  placeholder="The Laundry Lounge"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={config.accountNumber}
                    onChange={(e) => handleChange('accountNumber', e.target.value)}
                    placeholder="2502232998286289"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    value={config.ifscCode}
                    onChange={(e) => handleChange('ifscCode', e.target.value)}
                    placeholder="AUBL0002329"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Merchant UPI ID *</label>
                <input
                  type="text"
                  value={config.upiId}
                  onChange={(e) => handleChange('upiId', e.target.value)}
                  placeholder="thelaundrylounge0896@aubank"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-emerald-800 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Custom Static QR Image (Optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="hidden"
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Standee QR</span>
                  </button>
                  {config.customQrUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('customQrUrl', undefined)}
                      className="text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Printed Terms &amp; Conditions</label>
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg font-bold flex items-center space-x-1 hover:bg-sky-100"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="space-y-2">
                {config.terms.map((term, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="font-bold text-slate-400 font-mono w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => handleTermChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTerm(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SIGNATURE & FOOTER */}
          {activeTab === 'signatory' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Authorised Signatory Title *</label>
                <input
                  type="text"
                  value={config.signatoryTitle}
                  onChange={(e) => handleChange('signatoryTitle', e.target.value)}
                  placeholder="AUTHORISED SIGNATORY FOR The Laundry Lounge"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold uppercase text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Signature Cursive Text</label>
                <input
                  type="text"
                  value={config.signatureText || ''}
                  onChange={(e) => handleChange('signatureText', e.target.value)}
                  placeholder="Jindam."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-serif italic text-base font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Invoice Footer Courtesy Note</label>
                <input
                  type="text"
                  value={config.footerNote || ''}
                  onChange={(e) => handleChange('footerNote', e.target.value)}
                  placeholder="Thank you for trusting The Laundry Lounge with your fine fabrics!"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>
          )}

          {/* TAB 6: LAYOUT & VISIBILITY TOGGLES */}
          {activeTab === 'toggles' && (
            <div className="space-y-3 text-xs">
              {[
                { field: 'showLogo', label: 'Show Brand Logo in Header Banner', defaultVal: true },
                { field: 'showQrCode', label: 'Show UPI QR Code in Payment Box', defaultVal: true },
                { field: 'showBankDetails', label: 'Show Bank Account Details (NEFT/IMPS)', defaultVal: true },
                { field: 'showTerms', label: 'Show Terms & Conditions List at Bottom', defaultVal: true },
                { field: 'showPreviousDue', label: 'Show Previous Customer Due (Khata line if any)', defaultVal: true },
                { field: 'showAmountInWords', label: 'Show Total Amount in Words (INR)', defaultVal: true },
              ].map((item) => {
                const isChecked = config[item.field as keyof BranchInvoiceConfig] !== false;
                return (
                  <label
                    key={item.field}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleChange(item.field as any, e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            RIGHT COLUMN: REAL-TIME WYSIWYG PRINT PREVIEW (7 Cols)
        ======================================================== */}
        <div className="lg:col-span-7 space-y-3">
          {/* Preview Controls Bar */}
          <div className="flex items-center justify-between p-2.5 bg-slate-900 text-white rounded-2xl shadow-sm">
            <div className="flex items-center space-x-2 text-xs">
              <Eye className="w-4 h-4 text-sky-400" />
              <span className="font-bold">Live Print Preview</span>
              <span className="text-[10px] text-slate-400 font-mono">(A4 Canvas)</span>
            </div>

            {/* Sample Selector */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 text-[11px]">Test Data:</span>
              <select
                value={samplePresetKey}
                onChange={(e) => setSamplePresetKey(e.target.value as any)}
                className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value="standard">Standard Shirts &amp; Pants</option>
                <option value="premium">Silk Sarees &amp; Suits (with Due)</option>
                <option value="blankets">Heavy Blankets &amp; Jackets</option>
              </select>
            </div>
          </div>

          {/* REAL PAPER CANVAS CONTAINER */}
          <div className="bg-slate-200/80 p-2 sm:p-5 rounded-3xl border border-slate-300 shadow-inner overflow-x-auto">
            <div
              ref={printAreaRef}
              className="bg-white mx-auto shadow-2xl p-6 sm:p-8 max-w-[760px] text-slate-900 font-sans border border-slate-200 rounded-xl"
              style={{ minHeight: '800px' }}
            >
              {/* BILL HEADER BANNER */}
              <div
                className="text-white p-5 rounded-2xl shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    {config.showLogo !== false && (config.logoUrl || '/logo-transparent.png') && (
                      <div
                        className={`shrink-0 flex items-center justify-center transition-all ${
                          config.logoContainerStyle === 'frameless'
                            ? ''
                            : 'bg-white p-1.5 rounded-2xl shadow-sm border border-white/20'
                        }`}
                      >
                        <img
                          src={config.logoUrl || '/logo-transparent.png'}
                          alt={config.businessTitle}
                          style={{
                            height: `${config.logoHeight || 56}px`,
                            maxHeight: '90px',
                            width: 'auto',
                            objectFit: 'contain',
                          }}
                          className="block"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo-icon.png';
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">
                        {config.businessTitle}
                      </h1>
                      <p className="text-xs text-white/90 font-medium mt-1">
                        {config.tagline || (activeBranch === 'branch2' ? 'Ring Road Branch' : 'Arun Nagar Hub')}
                      </p>
                      <p className="text-[11px] text-white/80 mt-1 max-w-md">
                        {config.address}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-semibold text-white/95">
                        <span>Phone: {config.phone}{config.secondaryPhone ? ` / ${config.secondaryPhone}` : ''}</span>
                        <span>•</span>
                        <span>Email: {config.email}</span>
                        {config.gstin && (
                          <>
                            <span>•</span>
                            <span>GSTIN: {config.gstin}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Branch Hallmark Badge */}
                  <div className="text-right shrink-0 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/20">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block">
                      {config.invoiceTitle || 'RETAIL INVOICE / CASH MEMO'}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {config.invoicePrefix}{currentSample.invoiceNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* CUSTOMER & DATE META BAR */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Billed To (Customer)
                  </span>
                  <div className="font-extrabold text-sm text-slate-900 mt-0.5">
                    {currentSample.customerName}
                  </div>
                  <div className="text-slate-600 font-mono mt-0.5">+91 {currentSample.customerPhone}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Date &amp; Details
                  </span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {currentSample.date}
                  </div>
                  <div className="text-slate-500 text-[11px] font-semibold">
                    Branch: {activeBranch === 'branch1' ? 'Branch 1 (Arun Nagar)' : 'Branch 2 (Ring Road)'}
                  </div>
                </div>
              </div>

              {/* GARMENTS TABLE */}
              <div className="py-4">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr
                      className="border-b-2 text-white text-[11px] uppercase font-extrabold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Service &amp; Garment Details</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentSample.items.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{item.name}</td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">{item.qty} PCS</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">₹{item.rate}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 font-mono">
                          ₹{item.total.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAYMENT INFO (LEFT) + BILL TOTALS (RIGHT) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2 pb-4 border-t-2 border-slate-200 text-xs">
                {/* Left: Bank & UPI QR Code */}
                <div className="sm:col-span-7 space-y-3">
                  {config.showBankDetails !== false && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                      <div className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">
                        Bank &amp; Digital Payment Information
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 pt-1">
                        <div>
                          <span className="text-slate-500 block">Bank Name:</span>
                          <span className="font-bold text-slate-800">{config.bankName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">A/c Holder:</span>
                          <span className="font-bold text-slate-800">{config.accountHolderName}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-slate-500 block">A/c Number:</span>
                          <span className="font-bold font-mono text-slate-900">{config.accountNumber}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-slate-500 block">IFSC Code:</span>
                          <span className="font-bold font-mono text-slate-900">{config.ifscCode}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {config.showQrCode !== false && (
                    <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="p-1 bg-white rounded border border-slate-200 shrink-0">
                        {config.customQrUrl ? (
                          <img
                            src={config.customQrUrl}
                            alt="Custom UPI QR"
                            className="w-18 h-18 object-contain"
                          />
                        ) : (
                          <QRCodeSVG
                            value={`upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.businessTitle)}&am=${sampleEffectiveTotal}&cu=INR`}
                            size={72}
                            level="M"
                          />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Scan to Pay via Any UPI App
                        </span>
                        <UpiLogos />
                        <div className="text-[10px] font-mono font-bold text-slate-700">
                          UPI ID: {config.upiId}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Subtotal, Previous Due & Net Total */}
                <div className="sm:col-span-5 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100 font-semibold text-slate-600">
                    <span>Garments Subtotal:</span>
                    <span className="font-mono text-slate-900">₹{sampleItemsSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {config.showPreviousDue !== false && currentSample.previousDue > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-amber-800 font-bold">
                      <span>Previous Due (Khata):</span>
                      <span className="font-mono">+₹{currentSample.previousDue.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div
                    className="flex justify-between py-2 px-2 rounded-xl text-white font-extrabold text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>Net Payable Total:</span>
                    <span className="font-mono font-black">₹{sampleEffectiveTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {config.showAmountInWords !== false && (
                    <div className="pt-2 text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                        Amount in Words
                      </span>
                      <span className="text-[11px] font-bold italic text-slate-800">
                        {sampleInWords}
                      </span>
                    </div>
                  )}

                  {/* Signatory Seal */}
                  <div className="pt-6 text-right">
                    <div className="font-serif italic font-bold text-xl text-slate-800 -rotate-3 mb-0.5">
                      {config.signatureText || 'Jindam.'}
                    </div>
                    <div className="text-[9px] font-black uppercase text-slate-600 tracking-wider">
                      {config.signatoryTitle || 'AUTHORISED SIGNATORY'}
                    </div>
                  </div>
                </div>
              </div>

              {/* TERMS & CONDITIONS (FOOTER) */}
              {config.showTerms !== false && config.terms.length > 0 && (
                <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                  <div className="font-bold text-slate-700 uppercase tracking-wider">
                    Terms &amp; Conditions:
                  </div>
                  <ul className="space-y-0.5">
                    {config.terms.map((t, idx) => (
                      <li key={idx}>• {t}</li>
                    ))}
                  </ul>
                  {config.footerNote && (
                    <p className="pt-1.5 text-center font-semibold text-slate-600 italic">
                      "{config.footerNote}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
