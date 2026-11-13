import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  X,
  MessageCircle,
  Sliders,
  Check,
  Copy,
  RotateCcw,
  Save,
  Building2,
  CreditCard,
  QrCode,
  FileText,
  Upload,
  CheckCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { numberToWordsINR } from '../utils/numberToWords';
import { BranchInvoiceConfig } from '../types';

// Authentic Payment App Badges matching the template
const UpiLogos: React.FC = () => (
  <div className="flex items-center space-x-2 my-1">
    {/* PhonePe */}
    <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#5f259f] text-white text-[10px] font-bold shadow-xs">
      <span className="w-3.5 h-3.5 rounded-full bg-white text-[#5f259f] flex items-center justify-center text-[9px] font-black leading-none">
        ₹
      </span>
      <span>PhonePe</span>
    </div>

    {/* GPay */}
    <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-bold shadow-xs">
      <span className="font-extrabold text-[11px] leading-none">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">o</span>
        <span className="text-[#FBBC05]">o</span>
        <span className="text-[#4285F4]">g</span>
        <span className="text-[#34A853]">l</span>
        <span className="text-[#EA4335]">e</span>
      </span>
      <span className="text-slate-600 font-semibold text-[10px]">Pay</span>
    </div>

    {/* Paytm */}
    <div className="px-1.5 py-0.5 rounded bg-[#002e6e] text-white text-[10px] font-black tracking-tight shadow-xs">
      <span className="text-[#00baf2]">pay</span>tm
    </div>

    {/* BHIM UPI */}
    <div className="flex items-center px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold shadow-xs">
      <span className="text-emerald-400 font-black">UPI</span>
      <span className="text-amber-400 text-[8px] ml-0.5 font-bold">▶▶</span>
    </div>
  </div>
);

export const InvoiceModal: React.FC = () => {
  const { invoiceOrder, closeInvoice, businessSettings, updateBusinessSettings, showToast } = useApp();

  // Selected Branch for Bill Generation: branch1 or branch2
  const [selectedBranch, setSelectedBranch] = useState<'branch1' | 'branch2'>('branch1');

  // Drawer / Customizer State
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<'branch' | 'bank' | 'amounts' | 'terms'>('bank');

  // Editable bill state for current invoice session
  const [branchConfig, setBranchConfig] = useState<BranchInvoiceConfig>(() => {
    return (
      businessSettings.invoiceSettings?.branch1 || {
        branchId: 'branch-1',
        businessTitle: 'The Laundry Lounge',
        address: 'Near Gaytri School Arun Nagar, Rewa, Madhya Pradesh, 486001',
        phone: '9893733683',
        email: 'thelaundrylounge0896@gmail.com',
        invoicePrefix: 'TL/SL/26-27/',
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
      }
    );
  });

  // Financial fields
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [customInvoiceNumber, setCustomInvoiceNumber] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>('');
  const [customCustomerName, setCustomCustomerName] = useState<string>('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState<string>('');

  // WhatsApp send state
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [copiedWa, setCopiedWa] = useState(false);

  // File input ref for QR code image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or update fields when invoiceOrder changes
  useEffect(() => {
    if (!invoiceOrder) return;

    // Detect if order belongs to Branch 2
    const isBranch2 =
      invoiceOrder.address.houseFlat?.toLowerCase().includes('branch 2') ||
      invoiceOrder.address.houseFlat?.toLowerCase().includes('hari om') ||
      invoiceOrder.address.area?.toLowerCase().includes('branch 2') ||
      invoiceOrder.address.area?.toLowerCase().includes('hari om') ||
      invoiceOrder.pickupSlot?.toLowerCase().includes('branch 2') ||
      invoiceOrder.pickupSlot?.toLowerCase().includes('hari om');

    const branchKey = isBranch2 ? 'branch2' : 'branch1';
    setSelectedBranch(branchKey);

    const cfg =
      businessSettings.invoiceSettings?.[branchKey] ||
      (branchKey === 'branch2'
        ? {
            branchId: 'branch-2',
            businessTitle: 'The Laundry Lounge',
            address: 'Behind Hotel The Vijay Villas Gadariya Ring Road, Rewa, Madhya Pradesh, 486001',
            phone: '9329838804',
            email: 'thelaundrylounge0896@gmail.com',
            invoicePrefix: 'TL/B2/26-27/',
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
          }
        : {
            branchId: 'branch-1',
            businessTitle: 'The Laundry Lounge',
            address: 'Near Gaytri School Arun Nagar, Rewa, Madhya Pradesh, 486001',
            phone: '9893733683',
            email: 'thelaundrylounge0896@gmail.com',
            invoicePrefix: 'TL/SL/26-27/',
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
          });

    setBranchConfig(cfg);

    // Initial sequence number from orderNumber e.g. LD-2026-000123 -> 123
    const orderSeq = invoiceOrder.orderNumber.replace(/[^0-9]/g, '').slice(-3) || '128';
    setCustomInvoiceNumber(`${cfg.invoicePrefix}${orderSeq}`);

    // Format date as DD/MM/YYYY
    const d = new Date(invoiceOrder.createdAt);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    setCustomDate(`${day}/${month}/${year}`);

    setCustomCustomerName(invoiceOrder.customerName);
    setCustomCustomerPhone(invoiceOrder.customerPhone);
    setWaPhone(invoiceOrder.customerPhone);

    // Initial received amount and previous balance
    const initialDue =
      invoiceOrder.previousBalance !== undefined ? invoiceOrder.previousBalance : 0;
    const initialPaid =
      invoiceOrder.paidAmount !== undefined
        ? invoiceOrder.paidAmount
        : invoiceOrder.paymentStatus === 'Paid'
        ? invoiceOrder.total
        : 0;

    setReceivedAmount(initialPaid);
    setPreviousBalance(initialDue);
  }, [invoiceOrder]);

  // Handle switching branch
  const handleSelectBranch = (branchKey: 'branch1' | 'branch2') => {
    setSelectedBranch(branchKey);
    const cfg =
      businessSettings.invoiceSettings?.[branchKey] ||
      (branchKey === 'branch2'
        ? {
            branchId: 'branch-2',
            businessTitle: 'The Laundry Lounge',
            address: 'Behind Hotel The Vijay Villas Gadariya Ring Road, Rewa, Madhya Pradesh, 486001',
            phone: '9329838804',
            email: 'thelaundrylounge0896@gmail.com',
            invoicePrefix: 'TL/B2/26-27/',
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
          }
        : {
            branchId: 'branch-1',
            businessTitle: 'The Laundry Lounge',
            address: 'Near Gaytri School Arun Nagar, Rewa, Madhya Pradesh, 486001',
            phone: '9893733683',
            email: 'thelaundrylounge0896@gmail.com',
            invoicePrefix: 'TL/SL/26-27/',
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
          });

    setBranchConfig(cfg);
    if (invoiceOrder) {
      const orderSeq = invoiceOrder.orderNumber.replace(/[^0-9]/g, '').slice(-3) || '128';
      setCustomInvoiceNumber(`${cfg.invoicePrefix}${orderSeq}`);
    }
  };

  if (!invoiceOrder) return null;

  // Calculation of totals
  const totalQty = invoiceOrder.items.reduce((sum, it) => sum + it.quantity, 0);
  const itemsSubtotal = invoiceOrder.subtotal || invoiceOrder.items.reduce((sum, it) => sum + (it.selectedPrice * it.quantity), 0);
  const effectiveTotalAmount = itemsSubtotal + previousBalance;
  const currentBalance = Math.max(0, effectiveTotalAmount - receivedAmount);
  const totalInWords = numberToWordsINR(effectiveTotalAmount);

  // Dynamic UPI URL with auto-filled total or remaining balance
  const upiPayAmount = currentBalance > 0 ? currentBalance : effectiveTotalAmount;
  const upiUrl = `upi://pay?pa=${branchConfig.upiId}&pn=${encodeURIComponent(
    branchConfig.accountHolderName
  )}&am=${upiPayAmount}&cu=INR&tn=${encodeURIComponent('Bill ' + customInvoiceNumber)}`;

  // Save current branch config to persistent businessSettings
  const handleSaveToDefaults = () => {
    const existing = businessSettings.invoiceSettings || {
      branch1: branchConfig,
      branch2: branchConfig,
    };
    const updated = {
      ...existing,
      [selectedBranch]: branchConfig,
    };
    updateBusinessSettings({
      invoiceSettings: updated,
    });
    showToast(`Bank & QR details saved as default for ${selectedBranch === 'branch1' ? 'Branch 1' : 'Branch 2'}!`, 'success');
  };

  // Image Upload handler for QR Code
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBranchConfig((prev) => ({
            ...prev,
            customQrUrl: event.target!.result as string,
          }));
          showToast('Custom QR Code uploaded successfully!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // WhatsApp Message Generator (Includes full bill breakdown and digital bill link)
  const generateWhatsAppMessage = () => {
    const itemsText = invoiceOrder.items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.service.name.toUpperCase()}* - ${it.quantity} PCS @ ₹${it.selectedPrice} = ₹${(
            it.selectedPrice * it.quantity
          ).toFixed(0)}`
      )
      .join('\n');

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://thelaundrylounge.in';
    const digitalBillLink = `${origin}/#track-${invoiceOrder.orderNumber}`;

    return `*THE LAUNDRY LOUNGE* 🧺
*BILL OF SUPPLY (Original for Recipient)*
━━━━━━━━━━━━━━━━━━━━
🏢 *${branchConfig.businessTitle}* (${selectedBranch === 'branch1' ? 'Branch 1 - Arun Nagar / Nehru Nagar' : 'Branch 2 - Hari Om Ring Road'})
📄 *Invoice No:* ${customInvoiceNumber}
📅 *Invoice Date:* ${customDate}
👤 *Billed To:* ${customCustomerName}
📞 *Mobile:* ${customCustomerPhone}
━━━━━━━━━━━━━━━━━━━━
*SERVICES:*
${itemsText}
━━━━━━━━━━━━━━━━━━━━
*Total Quantity:* ${totalQty} PCS
*Garments Subtotal:* ₹${itemsSubtotal.toFixed(0)}
${previousBalance > 0 ? `*Previous Due:* ₹${previousBalance.toFixed(0)}\n` : ''}*Total Payable Amount:* ₹${effectiveTotalAmount.toFixed(0)}
*Amount Received:* ₹${receivedAmount.toFixed(0)}
*Current Balance Due:* ₹${currentBalance.toFixed(0)}
(${totalInWords})
━━━━━━━━━━━━━━━━━━━━
🏦 *BANK & UPI PAYMENT:*
Bank: ${branchConfig.bankName}
A/C Name: ${branchConfig.accountHolderName}
A/C No: ${branchConfig.accountNumber}
IFSC: ${branchConfig.ifscCode}
UPI ID: ${branchConfig.upiId}
━━━━━━━━━━━━━━━━━━━━
🔗 *View & Print Official Bill:*
${digitalBillLink}
━━━━━━━━━━━━━━━━━━━━
📍 ${branchConfig.address}
📞 Contact: ${branchConfig.phone}
Thank you for choosing The Laundry Lounge! ✨`;
  };

  // Handle direct WhatsApp opening
  const handleSendWhatsApp = () => {
    const cleanPhone = (waPhone || customCustomerPhone).replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      showToast('Please enter a valid phone number for WhatsApp', 'error');
      return;
    }
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = generateWhatsAppMessage();
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setShowWhatsAppModal(false);
  };

  const handleCopyWhatsAppMessage = () => {
    const msg = generateWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setCopiedWa(true);
    showToast('WhatsApp bill copied to clipboard!', 'success');
    setTimeout(() => setCopiedWa(false), 2500);
  };

  // Dedicated isolated print handler - Prevents blank page previews
  const handlePrint = () => {
    const printElem = document.getElementById('printable-invoice');
    if (!printElem) {
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

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${customInvoiceNumber} - The Laundry Lounge</title>
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
              ${printElem.innerHTML}
            </div>
            <script>
              setTimeout(() => {
                window.focus();
                window.print();
              }, 400);
            </script>
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch (e) {}
      }, 5000);
    } catch (e) {
      console.error('Print iframe fallback:', e);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={closeInvoice} />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden z-10 my-2 sm:my-6 border border-slate-200 max-h-[96vh] flex flex-col">
        {/* Top Control Bar (Hidden during Print) */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 shrink-0 print:hidden border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-sky-400">Bill of Supply</span>

            {/* Branch Selector Switcher */}
            <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => handleSelectBranch('branch1')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedBranch === 'branch1'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                The Laundry Lounge (Branch 1 - Arun Nagar)
              </button>
              <button
                type="button"
                onClick={() => handleSelectBranch('branch2')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedBranch === 'branch2'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                The Laundry Lounge (Branch 2 - Ring Road)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* WhatsApp Send Button */}
            <button
              type="button"
              onClick={() => setShowWhatsAppModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-900/30"
              title="Send bill on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Bill</span>
            </button>

            {/* Customize / Edit Button */}
            <button
              type="button"
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all border ${
                showCustomizer
                  ? 'bg-amber-500 border-amber-400 text-slate-950 font-black'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
              title="Edit QR, Bank Details, Balances, Terms"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showCustomizer ? 'Close Editor' : 'Edit Bill & Details'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeInvoice}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CUSTOMIZE BILL DRAWER (Hidden in print) */}
        {showCustomizer && (
          <div className="bg-slate-900/95 border-b border-slate-800 p-4 text-white print:hidden transition-all max-h-72 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3 text-xs font-bold">
                <span className="text-amber-400 uppercase tracking-wider">Customizer:</span>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('bank')}
                  className={`px-2.5 py-1 rounded-lg ${
                    customizerTab === 'bank' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bank &amp; QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('branch')}
                  className={`px-2.5 py-1 rounded-lg ${
                    customizerTab === 'branch' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Shop &amp; Invoice No.
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('amounts')}
                  className={`px-2.5 py-1 rounded-lg ${
                    customizerTab === 'amounts' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Balances &amp; Payment
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('terms')}
                  className={`px-2.5 py-1 rounded-lg ${
                    customizerTab === 'terms' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Terms &amp; Sign
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveToDefaults}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                title="Save as permanent default for this branch"
              >
                <Save className="w-3 h-3" />
                <span>Save for {selectedBranch === 'branch1' ? 'Branch 1' : 'Branch 2'}</span>
              </button>
            </div>

            {/* TAB: Bank & QR */}
            {customizerTab === 'bank' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={branchConfig.accountHolderName}
                    onChange={(e) => setBranchConfig({ ...branchConfig, accountHolderName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Bank Name &amp; Branch</label>
                  <input
                    type="text"
                    value={branchConfig.bankName}
                    onChange={(e) => setBranchConfig({ ...branchConfig, bankName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Account Number</label>
                  <input
                    type="text"
                    value={branchConfig.accountNumber}
                    onChange={(e) => setBranchConfig({ ...branchConfig, accountNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={branchConfig.ifscCode}
                    onChange={(e) => setBranchConfig({ ...branchConfig, ifscCode: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">UPI ID (Updates QR live)</label>
                  <input
                    type="text"
                    value={branchConfig.upiId}
                    onChange={(e) => setBranchConfig({ ...branchConfig, upiId: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Custom QR Image</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleQrImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{branchConfig.customQrUrl ? 'Change Image' : 'Upload Image'}</span>
                    </button>
                    {branchConfig.customQrUrl && (
                      <button
                        type="button"
                        onClick={() => setBranchConfig({ ...branchConfig, customQrUrl: undefined })}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Reset to Auto-QR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Branch & Invoice */}
            {customizerTab === 'branch' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Shop Title</label>
                  <input
                    type="text"
                    value={branchConfig.businessTitle}
                    onChange={(e) => setBranchConfig({ ...branchConfig, businessTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={customInvoiceNumber}
                    onChange={(e) => setCustomInvoiceNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Invoice Date</label>
                  <input
                    type="text"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Branch Address</label>
                  <input
                    type="text"
                    value={branchConfig.address}
                    onChange={(e) => setBranchConfig({ ...branchConfig, address: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Shop Mobile Phone</label>
                  <input
                    type="text"
                    value={branchConfig.phone}
                    onChange={(e) => setBranchConfig({ ...branchConfig, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div className="sm:col-span-3 pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <label className="text-slate-300 font-semibold flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={branchConfig.showLogo !== false}
                      onChange={(e) => setBranchConfig({ ...branchConfig, showLogo: e.target.checked })}
                      className="rounded text-sky-500"
                    />
                    <span>Show Logo on Bill Header</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setBranchConfig({ ...branchConfig, logoUrl: '/logo-transparent.png', showLogo: true })}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                    >
                      Transparent
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranchConfig({ ...branchConfig, logoUrl: '/logo-icon.png', showLogo: true })}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                    >
                      Emblem
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranchConfig({ ...branchConfig, logoUrl: '/the-laundry-lounge-logo.png', showLogo: true })}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                    >
                      Full Banner
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Balances & Payment */}
            {customizerTab === 'amounts' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customCustomerName}
                    onChange={(e) => setCustomCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Customer Mobile</label>
                  <input
                    type="text"
                    value={customCustomerPhone}
                    onChange={(e) => setCustomCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Received Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Previous Balance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={previousBalance}
                    onChange={(e) => setPreviousBalance(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
              </div>
            )}

            {/* TAB: Terms & Sign */}
            {customizerTab === 'terms' && (
              <div className="space-y-2 text-xs">
                {branchConfig.terms.map((term, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => {
                        const updated = [...branchConfig.terms];
                        updated[idx] = e.target.value;
                        setBranchConfig({ ...branchConfig, terms: updated });
                      }}
                      className="flex-1 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Signatory Title</label>
                    <input
                      type="text"
                      value={branchConfig.signatoryTitle}
                      onChange={(e) => setBranchConfig({ ...branchConfig, signatoryTitle: e.target.value })}
                      className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Signature Text / Name</label>
                    <input
                      type="text"
                      value={branchConfig.signatureText || 'Jindam.'}
                      onChange={(e) => setBranchConfig({ ...branchConfig, signatureText: e.target.value })}
                      className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRINTABLE BILL CONTAINER (Supports 2 distinct branch designs) */}
        <div
          id="printable-invoice"
          className={`p-6 sm:p-10 text-slate-900 bg-white overflow-y-auto max-w-3xl mx-auto w-full select-text transition-all ${
            selectedBranch === 'branch2'
              ? 'border-t-8 border-[#064e3b] shadow-xs'
              : 'border-t-8 border-[#3b479b]'
          }`}
          style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
        >
          {/* TOP TAGS */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 tracking-tight pb-3">
            <div className="flex items-center space-x-2">
              <span className="uppercase text-[13px] tracking-wide font-black">
                BILL OF SUPPLY
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                  selectedBranch === 'branch2'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-sky-100 text-sky-900 border border-sky-300'
                }`}
              >
                {selectedBranch === 'branch2'
                  ? 'Hari Om Laundry'
                  : 'The Laundry Lounge'}
              </span>
            </div>
            <div className="border border-slate-400 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
              ORIGINAL FOR RECIPIENT
            </div>
          </div>

          {/* HEADER: LOGO & SHOP INFO */}
          <div className="flex items-start space-x-4 py-2">
            {branchConfig.showLogo !== false && (branchConfig.logoUrl || '/logo-transparent.png') && (
              <div
                className={`shrink-0 flex items-center justify-center ${
                  branchConfig.logoContainerStyle === 'frameless'
                    ? ''
                    : 'bg-white p-1.5 rounded-xl shadow-2xs border border-slate-200'
                }`}
              >
                <img
                  src={branchConfig.logoUrl || '/logo-transparent.png'}
                  alt={branchConfig.businessTitle}
                  style={{
                    height: `${branchConfig.logoHeight || 60}px`,
                    maxHeight: '85px',
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
            <div className="flex-1">
              <h1
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight ${
                  selectedBranch === 'branch2' ? 'text-[#064e3b]' : 'text-[#3b479b]'
                }`}
              >
                {branchConfig.businessTitle}
              </h1>
              <p className="text-xs text-slate-800 font-medium mt-0.5 leading-snug">
                {branchConfig.address}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-800 font-medium mt-0.5">
                <p>
                  <span className="font-bold">Mobile:</span> {branchConfig.phone}
                </p>
                <p>
                  <span className="font-bold">Email:</span> {branchConfig.email}
                </p>
              </div>
            </div>
          </div>

          {/* BANNER BAR (Royal Blue for Branch 1, Emerald for Branch 2) */}
          <div
            className={`text-white px-4 py-2 rounded-sm mt-3 flex items-center justify-between text-xs font-bold shadow-xs ${
              selectedBranch === 'branch2' ? 'bg-[#064e3b]' : 'bg-[#595e9b]'
            }`}
          >
            <div>
              <span className="text-slate-200">Invoice No.:</span>{' '}
              <span className="font-extrabold">{customInvoiceNumber}</span>
            </div>
            <div>
              <span className="text-slate-200">Invoice Date:</span>{' '}
              <span className="font-extrabold">{customDate}</span>
            </div>
          </div>

          {/* BILL TO SECTION */}
          <div className="py-4 text-xs flex justify-between items-start">
            <div>
              <h4 className="font-extrabold text-slate-900 tracking-wide text-[11px] uppercase">
                BILL TO
              </h4>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{customCustomerName}</div>
              <div className="text-slate-700 font-medium">Mobile: {customCustomerPhone}</div>
            </div>
            {previousBalance > 0 && (
              <div className="text-right bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">
                  Previous Due
                </span>
                <span className="font-extrabold text-amber-900 text-sm">
                  ₹ {previousBalance.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* SERVICES TABLE */}
          <div
            className={`border-t-2 border-b border-slate-300 ${
              selectedBranch === 'branch2' ? 'border-t-[#064e3b]' : 'border-t-[#595e9b]'
            }`}
          >
            <table className="w-full text-xs">
              <thead>
                <tr
                  className={`border-b text-slate-900 font-black tracking-wider uppercase text-[11px] ${
                    selectedBranch === 'branch2' ? 'border-b-[#064e3b]' : 'border-b-[#595e9b]'
                  }`}
                >
                  <th className="py-2 text-left">SERVICES</th>
                  <th className="py-2 text-center">QTY.</th>
                  <th className="py-2 text-right">RATE</th>
                  <th className="py-2 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceOrder.items.map((item, idx) => {
                  const itemAmount = item.selectedPrice * item.quantity;
                  return (
                    <tr key={idx} className="align-top">
                      <td className="py-2.5 text-left pr-2">
                        <div className="font-extrabold text-slate-900 tracking-wide">
                          {item.service.name.toUpperCase()}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {item.specialInstructions || 'Dry-Clean'}
                        </div>
                      </td>
                      <td className="py-2.5 text-center font-bold text-slate-800">
                        {item.quantity} PCS
                      </td>
                      <td className="py-2.5 text-right font-medium text-slate-800">
                        {item.selectedPrice.toFixed(0)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        {itemAmount.toFixed(0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* SUBTOTAL ROW */}
          <div className="border-b-2 border-slate-900 py-2.5 flex items-center justify-between text-xs font-black text-slate-900 uppercase">
            <div className="w-1/3">SUBTOTAL (CURRENT ITEMS)</div>
            <div className="w-1/3 text-center">{totalQty} PCS</div>
            <div className="w-1/3 text-right text-sm">₹ {itemsSubtotal.toLocaleString('en-IN')}</div>
          </div>

          {/* LOWER SECTION: 2 COLUMNS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 text-xs">
            {/* LEFT COLUMN: BANK DETAILS, PAYMENT QR CODE, TERMS */}
            <div className="space-y-4">
              {/* Bank Details */}
              <div>
                <h4
                  className={`font-black text-xs tracking-wide uppercase mb-1 ${
                    selectedBranch === 'branch2' ? 'text-[#064e3b]' : 'text-slate-900'
                  }`}
                >
                  BANK DETAILS
                </h4>
                <div className="text-[11px] space-y-0.5 text-slate-800 font-medium leading-relaxed">
                  <div className="flex">
                    <span className="w-24 text-slate-600">Name:</span>
                    <span className="font-bold text-slate-900">{branchConfig.accountHolderName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-600">IFSC Code:</span>
                    <span className="font-bold font-mono text-slate-900">{branchConfig.ifscCode}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-600">Account No:</span>
                    <span className="font-bold font-mono text-slate-900">{branchConfig.accountNumber}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-600">Bank:</span>
                    <span className="font-bold text-slate-900">{branchConfig.bankName}</span>
                  </div>
                </div>
              </div>

              {/* Payment QR Code */}
              <div>
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-black text-xs tracking-wide uppercase mb-1 ${
                      selectedBranch === 'branch2' ? 'text-[#064e3b]' : 'text-slate-900'
                    }`}
                  >
                    PAYMENT QR CODE
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Scan for ₹{upiPayAmount}
                  </span>
                </div>
                <div className="text-[11px] text-slate-800 mb-1">
                  <span className="font-medium text-slate-600">UPI ID: </span>
                  <span className="font-bold font-mono text-slate-900">{branchConfig.upiId}</span>
                </div>

                {/* App logos */}
                <UpiLogos />

                {/* QR Code Container */}
                <div className="mt-2 inline-block p-1.5 border border-slate-300 rounded-lg bg-white shadow-2xs">
                  {branchConfig.customQrUrl ? (
                    <img
                      src={branchConfig.customQrUrl}
                      alt="Payment QR"
                      className="w-28 h-28 object-contain"
                    />
                  ) : (
                    <QRCodeSVG
                      value={upiUrl}
                      size={105}
                      level="M"
                      includeMargin={false}
                    />
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <h4 className="font-black text-slate-900 text-[11px] tracking-wide uppercase mb-1">
                  TERMS AND CONDITIONS
                </h4>
                <ol className="text-[10px] text-slate-700 space-y-0.5 leading-tight font-medium">
                  {branchConfig.terms.map((term, i) => (
                    <li key={i}>{term}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* RIGHT COLUMN: FINANCIAL BREAKDOWN, IN WORDS, SIGNATORY */}
            <div className="flex flex-col justify-between">
              {/* Financial Summary Table */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-bold text-slate-700">Current Items Amount</span>
                  <span className="font-extrabold text-slate-900">
                    ₹ {itemsSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {previousBalance > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200 text-amber-800">
                    <span className="font-bold">Previous Due</span>
                    <span className="font-extrabold">
                      + ₹ {previousBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-200 bg-slate-50 px-1 rounded">
                  <span className="font-black text-slate-900">Net Total Amount</span>
                  <span className="font-black text-slate-900">
                    ₹ {effectiveTotalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-medium text-slate-600">Received Amount</span>
                  <span className="font-bold text-emerald-700">
                    ₹ {receivedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b-2 border-slate-900 text-sm">
                  <span className="font-black text-slate-900">Current Balance Due</span>
                  <span className={`font-black ${currentBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    ₹ {currentBalance.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Total in words */}
                <div className="pt-3 text-center sm:text-right">
                  <div className="text-[11px] font-bold text-slate-600">Total Amount (in words)</div>
                  <div className="text-xs font-extrabold text-slate-900 italic mt-0.5">
                    {totalInWords}
                  </div>
                </div>
              </div>

              {/* Authorised Signatory */}
              <div className="pt-10 sm:pt-14 text-center sm:text-right">
                <div className="inline-block text-center">
                  <div className="font-serif italic font-bold text-2xl text-slate-800 -rotate-3 select-none mb-1">
                    {branchConfig.signatureText || 'Jindam.'}
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                    {branchConfig.signatoryTitle || 'AUTHORISED SIGNATORY FOR'}
                  </div>
                  <div
                    className={`text-[11px] font-extrabold ${
                      selectedBranch === 'branch2' ? 'text-[#064e3b]' : 'text-[#3b479b]'
                    }`}
                  >
                    {branchConfig.businessTitle} ({selectedBranch === 'branch2' ? 'Ring Road Branch' : 'Arun Nagar'})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WHATSAPP SHARE POPUP MODAL (Hidden during print) */}
        {showWhatsAppModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-emerald-600">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="font-extrabold text-base text-slate-900">Direct WhatsApp Bill</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Customer WhatsApp Number
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="e.g. 9630528171"
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 max-h-36 overflow-y-auto font-mono whitespace-pre-wrap">
                  {generateWhatsAppMessage()}
                </div>

                {/* PDF Bill download notice */}
                <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-900 flex items-center justify-between">
                  <span>📄 Want to send official PDF bill to customer?</span>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="font-bold text-sky-700 hover:underline flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-2 border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded-xl flex items-center space-x-1 text-xs transition-colors"
                  title="Download and print PDF invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download PDF Bill</span>
                </button>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleCopyWhatsAppMessage}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center space-x-1 text-xs transition-colors"
                  >
                    {copiedWa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWa ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center space-x-1.5 text-xs shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
