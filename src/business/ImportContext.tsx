// ============================================================================
// BULK DATA MIGRATION & IMPORT CONTEXT (STATE & CONTROLLER ENGINE)
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ImportBatch,
  ImportFileAnalysis,
  ImportCategory,
  ImportDuplicateStrategy,
  ImportTemplate,
  ImportColumnMapping,
  ImportErrorItem,
} from './importTypes';
import {
  parseCsvText,
  detectCategory,
  autoMapColumns,
  extractZipArchive,
  extractXlsxToCsv,
  validateRows,
} from './importParsers';
import {
  loadSavedTemplates,
  saveCustomTemplate,
  findMatchingTemplate,
} from './importTemplates';
import {
  THE_LAUNDRY_LOUNGE_CSV_FILENAME,
  THE_LAUNDRY_LOUNGE_CSV_CONTENT,
} from './importSeedData';
import { executeImportBatch, ImportProgressUpdate } from './importEngine';
import { useBusiness } from './BusinessContext';
import { useApp } from '../context/AppContext';

export type ImportWizardStep = 'upload' | 'analyze' | 'mapping' | 'preview' | 'executing' | 'completed';

interface ImportContextType {
  activeBatch: ImportBatch | null;
  batchHistory: ImportBatch[];
  templates: ImportTemplate[];
  currentStep: ImportWizardStep;
  setCurrentStep: (step: ImportWizardStep) => void;
  isProcessing: boolean;
  activeTab: 'wizard' | 'batches' | 'templates' | 'errors';
  setActiveTab: (tab: 'wizard' | 'batches' | 'templates' | 'errors') => void;

  // Actions
  uploadFiles: (files: FileList | File[]) => Promise<void>;
  loadPreloadedLaundryLoungeFile: () => void;
  updateFileCategory: (fileId: string, category: ImportCategory) => void;
  updateFileMapping: (fileId: string, mappingIndex: number, patch: Partial<ImportColumnMapping>) => void;
  updateFileDuplicateStrategy: (fileId: string, strategy: ImportDuplicateStrategy) => void;
  updateFileDateFormat: (fileId: string, dateFormat: ImportFileAnalysis['dateFormat']) => void;
  updateFileDefaultBranch: (fileId: string, branch: string) => void;
  selectedImportBranch: string;
  setSelectedImportBranch: (branch: string) => void;
  updateAllFilesBranch: (branch: string) => void;
  reassignBatchBranch: (newBranch: string) => void;
  saveMappingTemplate: (fileId: string, templateName: string) => void;
  startImportExecution: () => Promise<void>;
  cancelImportExecution: () => void;
  clearActiveBatch: () => void;
  downloadErrorCsv: (fileId?: string) => void;
  downloadReconciliationReport: () => void;
}

const ImportContext = createContext<ImportContextType | undefined>(undefined);

const LOCAL_STORAGE_BATCHES_KEY = 'mbb_import_batches';

export const ImportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { parties, setParties, products, setProducts, stockLedger, setStockLedger, journalEntries, setJournalEntries } =
    useBusiness();
  const { customerDues, setCustomerDues, logAuditAction, showToast } = useApp();

  const [activeBatch, setActiveBatch] = useState<ImportBatch | null>(null);
  const [batchHistory, setBatchHistory] = useState<ImportBatch[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_BATCHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [templates, setTemplates] = useState<ImportTemplate[]>(loadSavedTemplates);
  const [currentStep, setCurrentStep] = useState<ImportWizardStep>('upload');
  const [activeTab, setActiveTab] = useState<'wizard' | 'batches' | 'templates' | 'errors'>('wizard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [selectedImportBranch, setSelectedImportBranch] = useState<string>('The Laundry Lounge');

  // Sync batch history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_BATCHES_KEY, JSON.stringify(batchHistory.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to persist batch history:', e);
    }
  }, [batchHistory]);

  /**
   * Helper to analyze raw text into ImportFileAnalysis
   */
  const processRawFileContent = (
    fileName: string,
    fileSize: number,
    rawText: string,
    extractedFromZip?: string
  ): ImportFileAnalysis => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const parsed = parseCsvText(rawText);
    const headers = parsed.headers;
    const sampleRows = parsed.rows.slice(0, 10);

    // Run category detection
    const detection = detectCategory(headers, sampleRows, fileName, parsed.preHeaderMetadata);

    // Look for matching template
    const matchedTemplate = findMatchingTemplate(headers, detection.category);

    // Auto map columns or use template
    let mappings: ImportColumnMapping[] = [];
    if (matchedTemplate) {
      mappings = headers.map((h) => {
        const found = matchedTemplate.columnMappings.find((m) => m.sourceColumn.toLowerCase() === h.toLowerCase());
        return found || { sourceColumn: h, targetField: '__ignore__', required: false, transform: 'trim' };
      });
    } else {
      mappings = autoMapColumns(headers, detection.category);
    }

    // Row validation
    const validation = validateRows(parsed.rows, mappings, detection.category, fileId, fileName);

    return {
      fileId,
      fileName,
      fileSize,
      fileFormat: fileName.endsWith('.tsv') ? 'tsv' : 'csv',
      headers,
      sampleRows,
      allRows: parsed.rows,
      totalRows: parsed.rows.length,
      validRowsCount: validation.validCount,
      invalidRowsCount: validation.invalidCount,
      warningRowsCount: validation.warningCount,
      duplicateRowsCount: validation.duplicateCount,
      detectedCategory: detection.category,
      detectionConfidence: detection.confidence,
      detectionReason: detection.reason,
      validationStatus: validation.status,
      columnMappings: mappings,
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR',
      openingBalanceType: 'receivable',
      expectedFinancialTotal: validation.expectedFinancialTotal,
      duplicateStrategy: matchedTemplate?.duplicateStrategy || 'update',
      defaultBranch: selectedImportBranch,
      errors: validation.errors,
      warnings: [],
      extractedFromZip,
    };
  };

  /**
   * Upload handler for multiple files (CSV, TSV, ZIP, XLSX)
   */
  const uploadFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    const fileArray = Array.from(files);
    const analyzedFiles: ImportFileAnalysis[] = [];

    for (const file of fileArray) {
      const lowerName = file.name.toLowerCase();

      // Check if ZIP archive
      if (lowerName.endsWith('.zip')) {
        try {
          const buffer = await file.arrayBuffer();
          const extracted = await extractZipArchive(buffer, file.name);
          if (extracted.length === 0) {
            showToast(`No CSV files found inside "${file.name}"`, 'info');
          } else {
            extracted.forEach((item) => {
              const analyzed = processRawFileContent(item.fileName, item.size, item.textContent, file.name);
              analyzedFiles.push(analyzed);
            });
            showToast(`Extracted ${extracted.length} files from "${file.name}"`, 'info');
          }
        } catch (e: any) {
          showToast(`Failed to extract ZIP "${file.name}": ${e.message}`, 'error');
        }
      }
      // Check if Excel XLSX workbook
      else if (lowerName.endsWith('.xlsx')) {
        try {
          const buffer = await file.arrayBuffer();
          const extractedSheets = await extractXlsxToCsv(buffer, file.name);
          if (extractedSheets.length === 0) {
            showToast(`No readable sheets found inside "${file.name}"`, 'info');
          } else {
            extractedSheets.forEach((sheet) => {
              const analyzed = processRawFileContent(sheet.fileName, sheet.size, sheet.textContent, file.name);
              analyzedFiles.push(analyzed);
            });
            showToast(`Extracted ${extractedSheets.length} sheet(s) from Excel file "${file.name}"!`, 'success');
          }
        } catch (e: any) {
          showToast(`Failed to parse Excel file "${file.name}": ${e.message}`, 'error');
        }
      }
      // Standard CSV / TSV / Text
      else if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv') || lowerName.endsWith('.txt')) {
        try {
          const text = await file.text();
          const analyzed = processRawFileContent(file.name, file.size, text);
          analyzedFiles.push(analyzed);
        } catch (e: any) {
          showToast(`Error reading file "${file.name}": ${e.message}`, 'error');
        }
      } else {
        showToast(`Skipped unsupported format "${file.name}". Please upload CSV or ZIP.`, 'info');
      }
    }

    if (analyzedFiles.length > 0) {
      const newBatch: ImportBatch = {
        id: `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        title: `Multi-File Import (${analyzedFiles.length} file${analyzedFiles.length > 1 ? 's' : ''})`,
        status: 'awaiting_review',
        targetBranch: selectedImportBranch,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: analyzedFiles,
        totalFiles: analyzedFiles.length,
        totalRows: analyzedFiles.reduce((acc, f) => acc + f.totalRows, 0),
        importedRows: 0,
        skippedRows: 0,
        failedRows: 0,
        financialTotals: {
          receivablesTotal: analyzedFiles.reduce((acc, f) => acc + f.expectedFinancialTotal, 0),
          payablesTotal: 0,
          salesTotal: 0,
          purchaseTotal: 0,
        },
        executionProgress: {
          currentFileIndex: 0,
          currentFileName: '',
          currentRow: 0,
          totalRows: analyzedFiles.reduce((acc, f) => acc + f.totalRows, 0),
          percent: 0,
          stage: 'idle',
          logs: [],
        },
        errorLog: analyzedFiles.flatMap((f) => f.errors),
      };

      setActiveBatch(newBatch);
      setCurrentStep('analyze');
      showToast(`Analyzed ${analyzedFiles.length} files with ${newBatch.totalRows} records!`, 'success');
    }

    setIsProcessing(false);
  };

  /**
   * Loads the confirmed The Laundry Lounge party file with 110 records and ₹19,785 receivable
   */
  const loadPreloadedLaundryLoungeFile = () => {
    setIsProcessing(true);
    const analyzed = processRawFileContent(
      THE_LAUNDRY_LOUNGE_CSV_FILENAME,
      THE_LAUNDRY_LOUNGE_CSV_CONTENT.length,
      THE_LAUNDRY_LOUNGE_CSV_CONTENT
    );

    const newBatch: ImportBatch = {
      id: `BATCH-LL-CONFIRMED-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      title: 'The Laundry Lounge All Party Balance (110 Records)',
      status: 'awaiting_review',
      targetBranch: selectedImportBranch,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [analyzed],
      totalFiles: 1,
      totalRows: analyzed.totalRows,
      importedRows: 0,
      skippedRows: 0,
      failedRows: 0,
      financialTotals: {
        receivablesTotal: 19785,
        payablesTotal: 0,
        salesTotal: 0,
        purchaseTotal: 0,
      },
      executionProgress: {
        currentFileIndex: 0,
        currentFileName: '',
        currentRow: 0,
        totalRows: analyzed.totalRows,
        percent: 0,
        stage: 'idle',
        logs: [],
      },
      errorLog: analyzed.errors,
    };

    setActiveBatch(newBatch);
    setCurrentStep('analyze');
    setIsProcessing(false);
    showToast('Loaded The Laundry Lounge 110 confirmed parties (₹19,785 to collect)!', 'success');
  };

  /**
   * User re-assigns category for a file
   */
  const updateFileCategory = (fileId: string, category: ImportCategory) => {
    if (!activeBatch) return;

    setActiveBatch((prev) => {
      if (!prev) return null;
      const updatedFiles = prev.files.map((file) => {
        if (file.fileId !== fileId) return file;
        const newMappings = autoMapColumns(file.headers, category);
        const validation = validateRows(file.allRows, newMappings, category, file.fileId, file.fileName);
        return {
          ...file,
          userSelectedCategory: category,
          columnMappings: newMappings,
          validRowsCount: validation.validCount,
          invalidRowsCount: validation.invalidCount,
          warningRowsCount: validation.warningCount,
          validationStatus: validation.status,
          expectedFinancialTotal: validation.expectedFinancialTotal,
          errors: validation.errors,
        };
      });

      return {
        ...prev,
        files: updatedFiles,
        errorLog: updatedFiles.flatMap((f) => f.errors),
      };
    });
  };

  /**
   * Updates an individual column mapping
   */
  const updateFileMapping = (fileId: string, mappingIndex: number, patch: Partial<ImportColumnMapping>) => {
    if (!activeBatch) return;

    setActiveBatch((prev) => {
      if (!prev) return null;
      const updatedFiles = prev.files.map((file) => {
        if (file.fileId !== fileId) return file;
        const updatedMappings = [...file.columnMappings];
        updatedMappings[mappingIndex] = { ...updatedMappings[mappingIndex], ...patch };
        const cat = file.userSelectedCategory || file.detectedCategory;
        const validation = validateRows(file.allRows, updatedMappings, cat, file.fileId, file.fileName);

        return {
          ...file,
          columnMappings: updatedMappings,
          validRowsCount: validation.validCount,
          invalidRowsCount: validation.invalidCount,
          warningRowsCount: validation.warningCount,
          validationStatus: validation.status,
          expectedFinancialTotal: validation.expectedFinancialTotal,
          errors: validation.errors,
        };
      });

      return {
        ...prev,
        files: updatedFiles,
        errorLog: updatedFiles.flatMap((f) => f.errors),
      };
    });
  };

  const updateFileDuplicateStrategy = (fileId: string, strategy: ImportDuplicateStrategy) => {
    if (!activeBatch) return;
    setActiveBatch((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        files: prev.files.map((f) => (f.fileId === fileId ? { ...f, duplicateStrategy: strategy } : f)),
      };
    });
  };

  const updateFileDateFormat = (fileId: string, dateFormat: ImportFileAnalysis['dateFormat']) => {
    if (!activeBatch) return;
    setActiveBatch((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        files: prev.files.map((f) => (f.fileId === fileId ? { ...f, dateFormat } : f)),
      };
    });
  };

  const updateFileDefaultBranch = (fileId: string, branch: string) => {
    if (!activeBatch) return;
    setActiveBatch((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        files: prev.files.map((f) => (f.fileId === fileId ? { ...f, defaultBranch: branch } : f)),
      };
    });
  };

  const updateAllFilesBranch = (branch: string) => {
    setSelectedImportBranch(branch);
    if (activeBatch) {
      setActiveBatch((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          targetBranch: branch,
          files: prev.files.map((f) => ({ ...f, defaultBranch: branch })),
        };
      });
    }
  };

  const reassignBatchBranch = (newBranch: string) => {
    if (!activeBatch) return;
    const targetWarehouseId = newBranch === 'Hari Om Laundry' ? 'wh-hariom' : 'wh-main';

    // Collect phones and names from activeBatch files
    const batchPhones = new Set<string>();
    const batchNames = new Set<string>();
    activeBatch.files.forEach((f) => {
      const phoneCol = f.columnMappings.find((m) => m.targetField === 'phone')?.sourceColumn;
      const nameCol = f.columnMappings.find((m) => m.targetField === 'name')?.sourceColumn;
      f.allRows.forEach((r) => {
        if (phoneCol && r[phoneCol]) {
          const clean = r[phoneCol].replace(/\D/g, '');
          if (clean && clean.length >= 7 && clean !== '9893733683') batchPhones.add(clean);
        }
        if (nameCol && r[nameCol]) batchNames.add(r[nameCol].trim().toLowerCase());
      });
    });

    let affectedParties = 0;
    const updatedParties = parties.map((p) => {
      const cleanPhone = (p.phone || '').replace(/\D/g, '');
      const matches =
        (p.notes && p.notes.includes(activeBatch.id)) ||
        (cleanPhone && cleanPhone.length >= 7 && batchPhones.has(cleanPhone)) ||
        batchNames.has(p.name.trim().toLowerCase());

      if (matches) {
        affectedParties++;
        return {
          ...p,
          branch: newBranch,
          warehouseId: targetWarehouseId,
        };
      }
      return p;
    });

    let affectedDues = 0;
    const updatedDues = customerDues.map((d) => {
      const cleanPhone = (d.customerPhone || '').replace(/\D/g, '');
      const matches =
        (d.notes && d.notes.includes(activeBatch.id)) ||
        (cleanPhone && cleanPhone.length >= 7 && batchPhones.has(cleanPhone)) ||
        batchNames.has(d.customerName.trim().toLowerCase());

      if (matches) {
        affectedDues++;
        return {
          ...d,
          branch: newBranch,
        };
      }
      return d;
    });

    setParties(updatedParties);
    setCustomerDues(updatedDues);

    try {
      localStorage.setItem('mbb_business_parties', JSON.stringify(updatedParties));
      localStorage.setItem('laundry_lounge_customerDues', JSON.stringify(updatedDues));
    } catch (e) {
      console.error('Failed saving reassigned batch data', e);
    }

    const updatedBatch: ImportBatch = {
      ...activeBatch,
      targetBranch: newBranch,
      files: activeBatch.files.map((f) => ({ ...f, defaultBranch: newBranch })),
    };
    setActiveBatch(updatedBatch);
    setBatchHistory((prev) => prev.map((b) => (b.id === activeBatch.id ? updatedBatch : b)));

    showToast(`Batch moved to ${newBranch}! Updated ${affectedParties} party records & ${affectedDues} Khata dues.`, 'success');
  };

  const saveMappingTemplate = (fileId: string, templateName: string) => {
    const file = activeBatch?.files.find((f) => f.fileId === fileId);
    if (!file) return;

    const saved = saveCustomTemplate({
      name: templateName,
      category: file.userSelectedCategory || file.detectedCategory,
      description: `Saved from file "${file.fileName}"`,
      headerSignature: file.headers.map((h) => h.toLowerCase().trim()),
      columnMappings: file.columnMappings,
      dateFormat: file.dateFormat,
      duplicateStrategy: file.duplicateStrategy,
    });

    setTemplates((prev) => [saved, ...prev]);
    showToast(`Saved import template "${templateName}"!`, 'success');
  };

  /**
   * Executes the batch import using the BullMQ-style background executor
   */
  const startImportExecution = async () => {
    if (!activeBatch) return;

    setIsProcessing(true);
    setCancelRequested(false);
    setCurrentStep('executing');

    try {
      const result = await executeImportBatch(
        activeBatch,
        {
          parties,
          saveParties: setParties,
          products,
          saveProducts: setProducts,
          stockLedger,
          saveStockLedger: setStockLedger,
          journalEntries,
          saveJournalEntries: setJournalEntries,
          customerDues,
          saveCustomerDues: setCustomerDues,
          logAuditAction,
        },
        (progressUpdate: ImportProgressUpdate) => {
          setActiveBatch((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              executionProgress: {
                currentFileIndex: progressUpdate.currentFileIndex,
                currentFileName: progressUpdate.currentFileName,
                currentRow: progressUpdate.currentRow,
                totalRows: progressUpdate.totalRows,
                percent: progressUpdate.percent,
                stage: progressUpdate.stage,
                logs: [...prev.executionProgress.logs.slice(-20), progressUpdate.log],
              },
            };
          });
        },
        () => cancelRequested
      );

      setActiveBatch(result.batch);
      setBatchHistory((prev) => [result.batch, ...prev]);
      setCurrentStep('completed');
      showToast(
        `Import completed! ${result.batch.importedRows} records imported with ₹${result.report.financialAudit.actualPostedReceivables} receivables.`,
        'success'
      );
    } catch (e: any) {
      showToast(`Import batch failed: ${e.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelImportExecution = () => {
    setCancelRequested(true);
    showToast('Cancellation requested. Halting remaining records...', 'info');
  };

  const clearActiveBatch = () => {
    setActiveBatch(null);
    setCurrentStep('upload');
  };

  const downloadErrorCsv = (fileId?: string) => {
    if (!activeBatch) return;
    const errorsToExport = fileId
      ? activeBatch.errorLog.filter((e) => e.fileId === fileId)
      : activeBatch.errorLog;

    if (errorsToExport.length === 0) {
      showToast('No errors to export for this batch!', 'info');
      return;
    }

    const csvContent =
      'File Name,Row Number,Column,Value,Error,Severity\n' +
      errorsToExport
        .map((e) =>
          `"${e.fileName}",${e.rowNumber},"${e.column || ''}","${String(e.value || '').replace(/"/g, '""')}","${e.error}","${e.severity}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `import_errors_${activeBatch.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded error CSV file!', 'success');
  };

  const downloadReconciliationReport = () => {
    if (!activeBatch?.reconciliationReport) {
      showToast('No reconciliation report available yet.', 'info');
      return;
    }

    const reportJson = JSON.stringify(activeBatch.reconciliationReport, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reconciliation_report_${activeBatch.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded reconciliation audit report!', 'success');
  };

  return (
    <ImportContext.Provider
      value={{
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
      }}
    >
      {children}
    </ImportContext.Provider>
  );
};

export const useImport = () => {
  const context = useContext(ImportContext);
  if (!context) {
    throw new Error('useImport must be used within an ImportProvider');
  }
  return context;
};

