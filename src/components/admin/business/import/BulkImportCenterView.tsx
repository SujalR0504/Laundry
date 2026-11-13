import React, { useState, useRef } from 'react';
import { useImport } from '../../../../business/ImportContext';
import { CATEGORY_REGISTRY } from '../../../../business/importRegistry';
import { ImportCategory, ImportDuplicateStrategy } from '../../../../business/importTypes';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  Settings,
  Database,
  Eye,
  Download,
  Trash2,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
  History,
  FileText,
  Users,
  ShieldCheck,
  Zap,
  Building2,
} from 'lucide-react';

export const BulkImportCenterView: React.FC = () => {
  const {
    activeBatch,
    batchHistory,
    templates,
    currentStep,
    setCurrentStep,
    isProcessing,
    activeTab,
    setActiveTab,
    uploadFiles,
    loadPreloadedLaundryLoungeFile,
    updateFileCategory,
    updateFileMapping,
    updateFileDuplicateStrategy,
    updateFileDateFormat,
    updateFileDefaultBranch,
    selectedImportBranch,
    setSelectedImportBranch,
    updateAllFilesBranch,
    reassignBatchBranch,
    saveMappingTemplate,
    startImportExecution,
    cancelImportExecution,
    clearActiveBatch,
    downloadErrorCsv,
    downloadReconciliationReport,
  } = useImport();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileIdForMapping, setSelectedFileIdForMapping] = useState<string>('');
  const [previewSampleRowFileId, setPreviewSampleRowFileId] = useState<string>('');
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const activeMappingFile =
    activeBatch?.files.find((f) => f.fileId === (selectedFileIdForMapping || activeBatch.files[0]?.fileId)) ||
    activeBatch?.files[0];

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Database className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-brand-300 uppercase tracking-widest mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Multi-File Migration &amp; BullMQ Queue Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bulk Data Migration &amp; Import Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Upload multiple CSV, TSV, or ZIP archives simultaneously. Automatic format detection, field mapping,
              dependency resolution, and double-entry reconciliation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('wizard')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'wizard'
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>New Import</span>
            </button>

            <button
              onClick={() => setActiveTab('batches')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'batches'
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Batch History ({batchHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'templates'
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Templates ({templates.length})</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Total Batches Run</span>
            <span className="text-lg font-black text-white">{batchHistory.length}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Total Records Migrated</span>
            <span className="text-lg font-black text-emerald-400">
              {batchHistory.reduce((acc, b) => acc + b.importedRows, 0)}
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Supported Categories</span>
            <span className="text-lg font-black text-cyan-400">13 Modules</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Active System Engine</span>
            <span className="text-lg font-black text-amber-300">BullMQ Virtual Worker</span>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* TAB 1: NEW IMPORT WIZARD */}
      {/* ====================================================================== */}
      {activeTab === 'wizard' && (
        <div className="space-y-6">
          {/* Target Operating Branch Selector for this Import */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 border border-slate-700/80 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30 flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  TARGET OPERATING BRANCH / डेटा किस शाखा में डालना है
                </span>
                <h3 className="text-sm font-black text-white">
                  Select Target Branch to Receive this Import Data:
                </h3>
                <p className="text-[11px] text-slate-300">
                  इस इम्पोर्ट का समस्त डेटा (Customer Masters, Khata Dues &amp; Balances) चुनी गई शाखा में दर्ज होगा।
                </p>
              </div>
            </div>

            {/* Branch Selection Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => updateAllFilesBranch('The Laundry Lounge')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all border ${
                  selectedImportBranch === 'The Laundry Lounge'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-300/50'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>1. The Laundry Lounge</span>
                {selectedImportBranch === 'The Laundry Lounge' && <Check className="w-3.5 h-3.5 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => updateAllFilesBranch('Hari Om Laundry')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all border ${
                  selectedImportBranch === 'Hari Om Laundry'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-300/50'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>2. Hari Om Laundry</span>
                {selectedImportBranch === 'Hari Om Laundry' && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          </div>

          {/* Wizard Step Progression Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft-sm">
            <div className="flex items-center justify-between max-w-4xl mx-auto text-xs font-bold">
              {[
                { id: 'upload', label: '1. Multi-File Upload' },
                { id: 'analyze', label: '2. Auto-Detection' },
                { id: 'mapping', label: '3. Column Mapping' },
                { id: 'preview', label: '4. Preview & Review' },
                { id: 'executing', label: '5. Queue Execution' },
                { id: 'completed', label: '6. Reconciliation' },
              ].map((step, idx) => {
                const isCurrent = currentStep === step.id;
                const isPassed =
                  ['upload', 'analyze', 'mapping', 'preview', 'executing', 'completed'].indexOf(currentStep) > idx;

                return (
                  <div key={step.id} className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                          : isPassed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`hidden md:inline text-xs ${
                        isCurrent ? 'font-black text-slate-900' : isPassed ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    {idx < 5 && <div className="hidden sm:block w-6 h-[2px] bg-slate-200 ml-2" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* STEP 1: MULTI-FILE UPLOAD & PRELOADED LAUNDRY LOUNGE BUTTON */}
          {/* ------------------------------------------------------------------ */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              {/* Confirmed The Laundry Lounge Import Card */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-3xl p-6 shadow-soft-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-extrabold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>The Laundry Lounge Initial Customer Data</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900">
                      Confirmed Party Import: the_laundry_lounge_all_party1.csv
                    </h3>
                    <p className="text-xs text-slate-600 max-w-2xl">
                      Pre-configured with exactly <strong>110 customer records</strong>, dated <strong>31/10/2026</strong>,{' '}
                      <strong>₹19,785 total receivable</strong> (To Collect) and ₹0 payable. Ready for instant 1-click loading.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-white/80 px-3 py-2 rounded-xl border border-emerald-200">
                      <span>Target Branch:</span>
                      <select
                        value={selectedImportBranch}
                        onChange={(e) => updateAllFilesBranch(e.target.value)}
                        className="bg-transparent font-black text-xs text-emerald-900 focus:outline-none cursor-pointer"
                      >
                        <option value="The Laundry Lounge">1. The Laundry Lounge</option>
                        <option value="Hari Om Laundry">2. Hari Om Laundry</option>
                      </select>
                    </div>

                    <button
                      onClick={loadPreloadedLaundryLoungeFile}
                      disabled={isProcessing}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-2xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 whitespace-nowrap transition-transform"
                    >
                      <Users className="w-4 h-4" />
                      <span>Load 110 Confirmed Parties (₹19,785)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dual-Branch Direct Upload Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. The Laundry Lounge Upload Box */}
                <div
                  onClick={() => {
                    updateAllFilesBranch('The Laundry Lounge');
                    fileInputRef.current?.click();
                  }}
                  className="p-6 rounded-3xl bg-blue-50/60 hover:bg-blue-50 border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all cursor-pointer text-center space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">BRANCH 1</span>
                    <h4 className="text-sm font-black text-slate-900">Upload The Laundry Lounge Sheet</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click to upload .CSV / .XLSX for <strong>The Laundry Lounge</strong>
                    </p>
                  </div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Select Laundry Lounge File</span>
                  </div>
                </div>

                {/* 2. Hari Om Laundry Upload Box */}
                <div
                  onClick={() => {
                    updateAllFilesBranch('Hari Om Laundry');
                    fileInputRef.current?.click();
                  }}
                  className="p-6 rounded-3xl bg-emerald-50/60 hover:bg-emerald-50 border-2 border-dashed border-emerald-300 hover:border-emerald-500 transition-all cursor-pointer text-center space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">BRANCH 2</span>
                    <h4 className="text-sm font-black text-slate-900">Upload Hari Om Laundry Sheet</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click to upload .CSV / .XLSX for <strong>Hari Om Laundry</strong>
                    </p>
                  </div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Select Hari Om Laundry File</span>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Multi-File Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-brand-500 bg-brand-50/60 scale-[1.01]'
                    : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv,.tsv,.txt,.zip,.xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-3xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-2.5 shadow-soft-sm">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Target Branch: <strong>{selectedImportBranch}</strong></span>
                </div>

                <h3 className="text-base font-black text-slate-900 mb-1">
                  Or drag and drop multiple files together (CSV, Excel .XLSX, ZIP)
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-3">
                  Upload both branch files simultaneously. You can set the branch for each file in Step 2.
                </p>

                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Excel (.XLSX) &bull; CSV &bull; ZIP Supported &bull; Zero External Dependencies</span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 2: AUTO-DETECTION & CATEGORY SELECTION */}
          {/* ------------------------------------------------------------------ */}
          {currentStep === 'analyze' && activeBatch && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
                      <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                      <span>Automatic File Detection &amp; Analysis ({activeBatch.files.length} Files)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review detected categories and confidence scores. Reassign any category if needed before mapping.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={clearActiveBatch}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Clear Batch
                    </button>
                    <button
                      onClick={() => setCurrentStep('mapping')}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-md transition-transform"
                    >
                      <span>Proceed to Column Mapping</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File Cards List */}
                <div className="grid grid-cols-1 gap-4">
                  {activeBatch.files.map((file, idx) => {
                    const currentCategory = file.userSelectedCategory || file.detectedCategory;
                    const catInfo = CATEGORY_REGISTRY[currentCategory];
                    const isPreviewOpen = previewSampleRowFileId === file.fileId;

                    return (
                      <div
                        key={file.fileId}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-black flex items-center justify-center flex-shrink-0 text-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-black text-sm text-slate-900">{file.fileName}</span>
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[10px] font-mono font-bold uppercase">
                                  {file.fileFormat}
                                </span>
                                {file.extractedFromZip && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                                    ZIP: {file.extractedFromZip}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 space-x-3 mt-0.5">
                                <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                                <span>&bull;</span>
                                <span className="font-bold text-slate-700">{file.totalRows} data rows</span>
                                <span>&bull;</span>
                                <span>{file.headers.length} columns</span>
                                {file.expectedFinancialTotal > 0 && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="font-extrabold text-emerald-600">
                                      Financial Sum: ₹{file.expectedFinancialTotal.toLocaleString('en-IN')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Category Selector with Confidence Score */}
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-semibold">Detected Category</span>
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    file.detectionConfidence >= 80
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {file.detectionConfidence}% Confidence
                                </span>
                              </div>
                            </div>

                            <select
                              value={currentCategory}
                              onChange={(e) => updateFileCategory(file.fileId, e.target.value as ImportCategory)}
                              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-brand-500"
                            >
                              {Object.values(CATEGORY_REGISTRY).map((c) => (
                                <option key={c.category} value={c.category}>
                                  {c.title}
                                </option>
                              ))}
                            </select>

                            {/* Branch Selector for file */}
                            <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-bold shadow-xs">
                              <Building2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              <select
                                value={file.defaultBranch || selectedImportBranch}
                                onChange={(e) => updateFileDefaultBranch(file.fileId, e.target.value)}
                                className="bg-transparent font-bold text-xs text-slate-800 focus:outline-none cursor-pointer"
                              >
                                <option value="The Laundry Lounge">1. The Laundry Lounge</option>
                                <option value="Hari Om Laundry">2. Hari Om Laundry</option>
                              </select>
                            </div>

                            <button
                              onClick={() => setPreviewSampleRowFileId(isPreviewOpen ? '' : file.fileId)}
                              className="p-2 hover:bg-slate-200/70 rounded-xl text-slate-600 transition-colors"
                              title="Toggle Sample Rows Preview"
                            >
                              {isPreviewOpen ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Detection Reason */}
                        <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                          <span>
                            <strong>Reason:</strong> {file.detectionReason}
                          </span>
                          <span className="text-slate-400">
                            {catInfo.targetFields.filter((f) => f.required).length} required schema fields
                          </span>
                        </div>

                        {/* Collapsible Sample Rows Preview */}
                        {isPreviewOpen && (
                          <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 overflow-x-auto space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-800">First 5 Sample Records</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Total {file.allRows.length} rows parsed
                              </span>
                            </div>
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px]">
                                  {file.headers.map((h) => (
                                    <th key={h} className="p-2 font-bold whitespace-nowrap">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {file.sampleRows.slice(0, 5).map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50 font-mono text-[11px]">
                                    {file.headers.map((h) => (
                                      <td key={h} className="p-2 text-slate-700 whitespace-nowrap">
                                        {row[h] || <span className="text-slate-300 italic">null</span>}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 3: FILE-WISE COLUMN MAPPING */}
          {/* ------------------------------------------------------------------ */}
          {currentStep === 'mapping' && activeBatch && activeMappingFile && (
            <div className="space-y-6">
              {/* File Selection Tabs if multiple files */}
              {activeBatch.files.length > 1 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {activeBatch.files.map((f, idx) => (
                    <button
                      key={f.fileId}
                      onClick={() => setSelectedFileIdForMapping(f.fileId)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        activeMappingFile.fileId === f.fileId
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>
                        File {idx + 1}: {f.fileName}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-6">
                {/* Header & Settings Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-brand-600" />
                      <span>
                        Column Mapping for &quot;{activeMappingFile.fileName}&quot; (
                        {CATEGORY_REGISTRY[activeMappingFile.userSelectedCategory || activeMappingFile.detectedCategory].title}
                        )
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Map headers from this file to entity master fields. Required fields must be mapped.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Duplicate Strategy Dropdown */}
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="font-bold text-slate-600">Duplicates:</span>
                      <select
                        value={activeMappingFile.duplicateStrategy}
                        onChange={(e) =>
                          updateFileDuplicateStrategy(activeMappingFile.fileId, e.target.value as ImportDuplicateStrategy)
                        }
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value="update">Update Existing</option>
                        <option value="skip">Skip Duplicate</option>
                        <option value="merge">Merge Fields</option>
                        <option value="separate">Import Separate</option>
                      </select>
                    </div>

                    {/* Operating Branch Dropdown */}
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="font-bold text-slate-600">Branch:</span>
                      <select
                        value={activeMappingFile.defaultBranch || selectedImportBranch}
                        onChange={(e) => updateFileDefaultBranch(activeMappingFile.fileId, e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value="The Laundry Lounge">1. The Laundry Lounge</option>
                        <option value="Hari Om Laundry">2. Hari Om Laundry</option>
                      </select>
                    </div>

                    {/* Date Format Dropdown */}
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="font-bold text-slate-600">Date:</span>
                      <select
                        value={activeMappingFile.dateFormat}
                        onChange={(e) => updateFileDateFormat(activeMappingFile.fileId, e.target.value as any)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setShowSaveTemplateModal(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save as Template</span>
                    </button>
                  </div>
                </div>

                {/* Mapping Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                        <th className="p-3 font-extrabold">Source CSV Column</th>
                        <th className="p-3 font-extrabold">Sample Values</th>
                        <th className="p-3 font-extrabold">Target Entity Field</th>
                        <th className="p-3 font-extrabold">Data Transform</th>
                        <th className="p-3 font-extrabold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeMappingFile.columnMappings.map((m, mIdx) => {
                        const targetFields =
                          CATEGORY_REGISTRY[
                            activeMappingFile.userSelectedCategory || activeMappingFile.detectedCategory
                          ].targetFields;
                        const sampleVals = activeMappingFile.sampleRows
                          .map((r) => r[m.sourceColumn])
                          .filter(Boolean)
                          .slice(0, 3)
                          .join(', ');

                        const isMapped = m.targetField !== '__ignore__';
                        const targetDef = targetFields.find((f) => f.key === m.targetField);

                        return (
                          <tr key={m.sourceColumn} className="hover:bg-slate-50/70">
                            <td className="p-3 font-mono font-bold text-slate-900">{m.sourceColumn}</td>
                            <td className="p-3 text-slate-500 max-w-xs truncate text-[11px]">
                              {sampleVals || <span className="text-slate-300 italic">empty</span>}
                            </td>
                            <td className="p-3">
                              <select
                                value={m.targetField}
                                onChange={(e) =>
                                  updateFileMapping(activeMappingFile.fileId, mIdx, {
                                    targetField: e.target.value,
                                    required: targetFields.find((f) => f.key === e.target.value)?.required || false,
                                  })
                                }
                                className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                                  isMapped
                                    ? targetDef?.required
                                      ? 'border-brand-500 bg-brand-50/40 text-brand-900'
                                      : 'border-slate-300 bg-white text-slate-800'
                                    : 'border-slate-200 bg-slate-50 text-slate-400'
                                }`}
                              >
                                <option value="__ignore__">&lt; Ignore Column &gt;</option>
                                <optgroup label="Required Fields">
                                  {targetFields
                                    .filter((f) => f.required)
                                    .map((f) => (
                                      <option key={f.key} value={f.key}>
                                        {f.label} *
                                      </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Optional Fields">
                                  {targetFields
                                    .filter((f) => !f.required)
                                    .map((f) => (
                                      <option key={f.key} value={f.key}>
                                        {f.label}
                                      </option>
                                    ))}
                                </optgroup>
                              </select>
                            </td>
                            <td className="p-3">
                              <select
                                value={m.transform}
                                onChange={(e) =>
                                  updateFileMapping(activeMappingFile.fileId, mIdx, {
                                    transform: e.target.value as any,
                                  })
                                }
                                disabled={!isMapped}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 disabled:opacity-40"
                              >
                                <option value="trim">Trim Whitespace</option>
                                <option value="phone_normalize">Normalize Phone (10-Digit)</option>
                                <option value="number">Parse Number / Currency</option>
                                <option value="uppercase">Uppercase (GSTIN/SKU)</option>
                                <option value="lowercase">Lowercase (Email)</option>
                                <option value="date">Parse Date</option>
                              </select>
                            </td>
                            <td className="p-3 text-right">
                              {isMapped ? (
                                <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Mapped</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Ignored</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Validation Status & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-bold text-slate-700">Validation Status:</span>
                    {activeMappingFile.validRowsCount === activeMappingFile.totalRows ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>All {activeMappingFile.validRowsCount} Rows Valid</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>
                          {activeMappingFile.validRowsCount} Valid, {activeMappingFile.invalidRowsCount} Errors
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setCurrentStep('analyze')}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Back to Files
                    </button>
                    <button
                      onClick={() => setCurrentStep('preview')}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-md transition-transform"
                    >
                      <span>Proceed to Preview &amp; Review</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 4: PREVIEW, DEPENDENCY TOPOLOGY & FINANCIAL AUDIT TOTALS */}
          {/* ------------------------------------------------------------------ */}
          {currentStep === 'preview' && activeBatch && (
            <div className="space-y-6">
              {/* Dependency Sequence Banner */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400">
                      Topological Dependency Management
                    </span>
                    <h3 className="text-base font-black">Recommended Execution Pipeline Order</h3>
                  </div>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-slate-300">
                    Safe Relational Import
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-brand-300 font-bold block">1. Party Masters</span>
                    <span className="font-extrabold text-white">Customers &amp; Suppliers</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-brand-300 font-bold block">2. Item Catalog</span>
                    <span className="font-extrabold text-white">Products &amp; Stock</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-brand-300 font-bold block">3. Opening Balances</span>
                    <span className="font-extrabold text-white">Khata Dues &amp; Ledger</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-brand-300 font-bold block">4. Double-Entry Vouchers</span>
                    <span className="font-extrabold text-white">Balanced Journal Entries</span>
                  </div>
                </div>
              </div>

              {/* Batch Financial Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm space-y-1">
                  <span className="text-xs text-slate-500 font-semibold block">Total Files</span>
                  <span className="text-2xl font-black text-slate-900">{activeBatch.totalFiles}</span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm space-y-1">
                  <span className="text-xs text-slate-500 font-semibold block">Total Rows to Import</span>
                  <span className="text-2xl font-black text-brand-600">{activeBatch.totalRows}</span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm space-y-1">
                  <span className="text-xs text-slate-500 font-semibold block">Expected Receivables</span>
                  <span className="text-2xl font-black text-emerald-600">
                    ₹{activeBatch.financialTotals.receivablesTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-sm space-y-1">
                  <span className="text-xs text-slate-500 font-semibold block">Row Validation Status</span>
                  <span className="text-2xl font-black text-slate-800">
                    {activeBatch.files.every((f) => f.invalidRowsCount === 0) ? (
                      <span className="text-emerald-600">100% Ready</span>
                    ) : (
                      <span className="text-amber-600">Warnings</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Target Branch Confirmation Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3 text-amber-950 font-bold">
                  <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-700 font-black block">Target Branch for this Import Batch</span>
                    <span className="text-sm font-black text-slate-900">
                      🏢 {selectedImportBranch}
                    </span>
                    <p className="text-[11px] font-normal text-amber-800">
                      All valid records will be posted to this branch's Master and Khata accounts.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-600">Change:</span>
                  <select
                    value={selectedImportBranch}
                    onChange={(e) => updateAllFilesBranch(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="The Laundry Lounge">1. The Laundry Lounge</option>
                    <option value="Hari Om Laundry">2. Hari Om Laundry</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons to trigger execution */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft-sm">
                <div className="space-y-0.5">
                  <h4 className="font-black text-sm text-slate-900">Ready to execute import?</h4>
                  <p className="text-xs text-slate-500">
                    Import operates idempotently using batch tracking. No duplicates will be created.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentStep('mapping')}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Back to Mapping
                  </button>
                  <button
                    onClick={startImportExecution}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-brand-600/30 transition-transform"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Confirm &amp; Execute Import Batch</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 5: ASYNC QUEUE EXECUTION & REAL-TIME LOGS (BULLMQ STYLE) */}
          {/* ------------------------------------------------------------------ */}
          {currentStep === 'executing' && activeBatch && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft-sm space-y-6 max-w-3xl mx-auto">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center animate-pulse shadow-md">
                  <Zap className="w-8 h-8 text-brand-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Processing Import Batch in Background Queue</h3>
                <p className="text-xs text-slate-500">
                  Executing row validations, database writes, and double-entry ledger postings...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{activeBatch.executionProgress.currentFileName || 'Processing records...'}</span>
                  <span>{activeBatch.executionProgress.percent}%</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(activeBatch.executionProgress.percent, 5)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Row {activeBatch.executionProgress.currentRow} of {activeBatch.executionProgress.totalRows}</span>
                  <span className="capitalize">Stage: {activeBatch.executionProgress.stage}</span>
                </div>
              </div>

              {/* Live Terminal Log */}
              <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-4 rounded-2xl h-48 overflow-y-auto space-y-1 shadow-inner">
                {activeBatch.executionProgress.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-brand-400 select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={cancelImportExecution}
                  className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel Import
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 6: RECONCILIATION AUDIT & FINAL SUMMARY REPORT */}
          {/* ------------------------------------------------------------------ */}
          {currentStep === 'completed' && activeBatch && activeBatch.reconciliationReport && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-emerald-900 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-950">
                      Import Batch Completed Successfully!
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Batch ID: <strong>{activeBatch.id}</strong> &bull; Completed in{' '}
                      {activeBatch.reconciliationReport.durationSeconds} seconds
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={downloadReconciliationReport}
                    className="px-4 py-2.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200 flex items-center space-x-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Audit Report (JSON)</span>
                  </button>

                  {activeBatch.failedRows > 0 && (
                    <button
                      onClick={() => downloadErrorCsv()}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Error CSV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Branch Allocation & 1-Click Reassignment Card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30 flex-shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                      BRANCH ALLOCATION / किस शाखा में डेटा गया है
                    </span>
                    <div className="text-base font-black text-white flex items-center space-x-2">
                      <span>Batch Data Currently in:</span>
                      <span className={`px-3 py-1 rounded-xl font-black text-xs border ${
                        (activeBatch.targetBranch || activeBatch.files[0]?.defaultBranch) === 'Hari Om Laundry'
                          ? 'bg-emerald-600/90 border-emerald-400 text-white'
                          : 'bg-blue-600/90 border-blue-400 text-white'
                      }`}>
                        🏢 {activeBatch.targetBranch || activeBatch.files[0]?.defaultBranch || 'The Laundry Lounge'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      अगर यह डेटा दूसरी शाखा में डालना था, तो 1-Click से पूरी बैच का डेटा तुरंत ट्रांसफर करें:
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => reassignBatchBranch('The Laundry Lounge')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all border flex items-center space-x-2 ${
                      (activeBatch.targetBranch || activeBatch.files[0]?.defaultBranch) === 'The Laundry Lounge'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-300/50'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Move to 1. The Laundry Lounge</span>
                    {(activeBatch.targetBranch || activeBatch.files[0]?.defaultBranch) === 'The Laundry Lounge' && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => reassignBatchBranch('Hari Om Laundry')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all border flex items-center space-x-2 ${
                      (activeBatch.targetBranch || activeBatch.files[0]?.defaultBranch) === 'Hari Om Laundry'
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-300/50'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Move to 2. Hari Om Laundry</span>
                    {(activeBatch.targetBranch || activeBatch.files[0]?.defaultBranch) === 'Hari Om Laundry' && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Financial Reconciliation Audit Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
                <h4 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Financial Data Reconciliation Audit</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Expected Receivables</span>
                    <span className="text-lg font-black text-slate-900">
                      ₹{activeBatch.reconciliationReport.financialAudit.expectedReceivables.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-emerald-700 font-semibold block">Actual Posted to Khata</span>
                    <span className="text-lg font-black text-emerald-700">
                      ₹{activeBatch.reconciliationReport.financialAudit.actualPostedReceivables.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Variance / Discrepancy</span>
                    <span className="text-lg font-black text-emerald-600">
                      ₹{activeBatch.reconciliationReport.financialAudit.varianceReceivables} (Zero Variance)
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Double-entry balance verified: Balanced debit vouchers posted to Accounts Receivable (Debtors) with
                    matching credit vouchers in Opening Balance Equity.
                  </span>
                </div>
              </div>

              {/* Breakdown by Category */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
                <h4 className="font-black text-sm text-slate-900">Import Summary by Category</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                        <th className="p-3 font-bold">Category</th>
                        <th className="p-3 font-bold">Total Rows</th>
                        <th className="p-3 font-bold">Imported</th>
                        <th className="p-3 font-bold">Skipped</th>
                        <th className="p-3 font-bold">Errors</th>
                        <th className="p-3 font-bold text-right">Financial Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {activeBatch.reconciliationReport.categoriesProcessed.map((cat) => (
                        <tr key={cat.category} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{CATEGORY_REGISTRY[cat.category]?.title}</td>
                          <td className="p-3 text-slate-700">{cat.rowsTotal}</td>
                          <td className="p-3 text-emerald-600 font-bold">{cat.rowsSuccess}</td>
                          <td className="p-3 text-slate-400">{cat.rowsSkipped}</td>
                          <td className="p-3 text-rose-600 font-bold">{cat.rowsFailed}</td>
                          <td className="p-3 text-right font-extrabold text-slate-900">
                            ₹{cat.financialImpact.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reset to Start New Import */}
              <div className="text-center pt-2">
                <button
                  onClick={clearActiveBatch}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-xl text-xs shadow-md transition-colors"
                >
                  Start Another Import Batch
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 2: BATCH HISTORY */}
      {/* ====================================================================== */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Import Batches History</h3>
              <p className="text-xs text-slate-500">Audit trail of all previous multi-file import runs.</p>
            </div>
          </div>

          {batchHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <span>No import batches executed yet. Click &quot;New Import&quot; to begin.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="p-3 font-bold">Batch ID &amp; Title</th>
                    <th className="p-3 font-bold">Executed Date</th>
                    <th className="p-3 font-bold">Files</th>
                    <th className="p-3 font-bold">Rows Imported</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold text-right">Receivables</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batchHistory.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-extrabold text-slate-900 block">{batch.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{batch.id}</span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(batch.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 font-bold text-slate-700">{batch.totalFiles} files</td>
                      <td className="p-3">
                        <span className="font-extrabold text-emerald-600">{batch.importedRows}</span>
                        {batch.failedRows > 0 && (
                          <span className="text-rose-500 text-[11px] ml-1">({batch.failedRows} err)</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            batch.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {batch.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        ₹{batch.financialTotals.receivablesTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 3: SAVED IMPORT TEMPLATES */}
      {/* ====================================================================== */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-black text-base text-slate-900">Saved Mapping Templates</h3>
            <p className="text-xs text-slate-500">
              Reusable header matching configurations for automatic one-click column mapping.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900">{tpl.name}</span>
                  <span className="px-2 py-0.5 bg-brand-100 text-brand-800 rounded-md text-[10px] font-bold">
                    {CATEGORY_REGISTRY[tpl.category]?.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{tpl.description || 'Pre-configured mapping template.'}</p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{tpl.columnMappings.length} column rules</span>
                  <span className="capitalize">Policy: {tpl.duplicateStrategy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h4 className="text-sm font-black text-slate-900">Save Column Mapping as Template</h4>
            <p className="text-xs text-slate-500">
              Give this mapping preset a name so future files with similar headers can be mapped automatically.
            </p>
            <input
              type="text"
              placeholder="e.g. My BillBook Custom Export"
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeMappingFile && templateNameInput.trim()) {
                    saveMappingTemplate(activeMappingFile.fileId, templateNameInput.trim());
                    setShowSaveTemplateModal(false);
                    setTemplateNameInput('');
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold bg-brand-600 text-white rounded-lg shadow-sm"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

