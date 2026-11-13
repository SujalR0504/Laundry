// ============================================================================
// BULK MULTI-FILE DATA MIGRATION & IMPORT SYSTEM TYPES
// ============================================================================

export type ImportCategory =
  | 'customers'
  | 'suppliers'
  | 'all_party_balance'
  | 'products'
  | 'stock_inventory'
  | 'sales'
  | 'purchases'
  | 'expenses'
  | 'payments'
  | 'sales_invoices'
  | 'purchase_invoices'
  | 'customer_ledger'
  | 'supplier_ledger';

export type ImportBatchStatus =
  | 'uploaded'
  | 'analyzing'
  | 'awaiting_review'
  | 'ready_to_import'
  | 'processing'
  | 'completed'
  | 'completed_with_errors'
  | 'failed'
  | 'cancelled';

export type FileValidationStatus = 'pending' | 'valid' | 'warnings' | 'invalid';

export type ImportDuplicateStrategy = 'skip' | 'update' | 'merge' | 'separate';

export type FieldTransformType =
  | 'trim'
  | 'lowercase'
  | 'uppercase'
  | 'phone_normalize'
  | 'number'
  | 'date'
  | 'boolean'
  | 'raw';

export interface TargetFieldDef {
  key: string;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'phone' | 'email' | 'gstin' | 'boolean' | 'enum';
  description?: string;
  options?: string[];
  aliases: string[]; // known variations in CSV headers
}

export interface ImportColumnMapping {
  sourceColumn: string;
  targetField: string; // key of target field, or '__ignore__'
  required: boolean;
  transform: FieldTransformType;
  defaultValue?: string;
}

export interface ImportErrorItem {
  id: string;
  fileId: string;
  fileName: string;
  rowNumber: number;
  column?: string;
  value?: any;
  error: string;
  severity: 'critical' | 'warning';
}

export interface ImportFileAnalysis {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileFormat: 'csv' | 'tsv' | 'xlsx' | 'xls';
  headers: string[];
  sampleRows: Record<string, string>[];
  allRows: Record<string, string>[]; // In-memory parsed rows
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  warningRowsCount: number;
  duplicateRowsCount: number;
  detectedCategory: ImportCategory;
  detectionConfidence: number; // 0 to 100
  detectionReason: string;
  userSelectedCategory?: ImportCategory;
  validationStatus: FileValidationStatus;
  columnMappings: ImportColumnMapping[];
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD-MM-YYYY';
  currency: string;
  openingBalanceType: 'receivable' | 'payable' | 'auto_column';
  expectedFinancialTotal: number;
  duplicateStrategy: ImportDuplicateStrategy;
  defaultBranch?: string;
  errors: ImportErrorItem[];
  warnings: string[];
  extractedFromZip?: string;
}

export interface ImportReconciliationReport {
  batchId: string;
  executedAt: string;
  durationSeconds: number;
  categoriesProcessed: {
    category: ImportCategory;
    rowsTotal: number;
    rowsSuccess: number;
    rowsSkipped: number;
    rowsFailed: number;
    financialImpact: number;
  }[];
  entitiesCreated: {
    customers: number;
    suppliers: number;
    products: number;
    invoices: number;
    stockEntries: number;
    journalEntries: number;
  };
  financialAudit: {
    expectedReceivables: number;
    actualPostedReceivables: number;
    varianceReceivables: number;
    expectedPayables: number;
    actualPostedPayables: number;
    variancePayables: number;
    balancedDoubleEntry: boolean;
  };
}

export interface ImportBatch {
  id: string;
  title: string;
  status: ImportBatchStatus;
  targetBranch?: string;
  createdAt: string;
  updatedAt: string;
  files: ImportFileAnalysis[];
  totalFiles: number;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  financialTotals: {
    receivablesTotal: number;
    payablesTotal: number;
    salesTotal: number;
    purchaseTotal: number;
  };
  executionProgress: {
    currentFileIndex: number;
    currentFileName: string;
    currentRow: number;
    totalRows: number;
    percent: number;
    stage: 'idle' | 'validating' | 'dependencies' | 'committing' | 'reconciling' | 'completed' | 'cancelled';
    logs: string[];
  };
  reconciliationReport?: ImportReconciliationReport;
  errorLog: ImportErrorItem[];
}

export interface ImportTemplate {
  id: string;
  name: string;
  category: ImportCategory;
  description?: string;
  headerSignature: string[]; // Headers to auto-match
  columnMappings: ImportColumnMapping[];
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD-MM-YYYY';
  duplicateStrategy: ImportDuplicateStrategy;
  createdAt: string;
}

