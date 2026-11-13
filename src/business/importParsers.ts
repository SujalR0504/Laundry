// ============================================================================
// BULK IMPORT PARSERS & CATEGORY DETECTION ENGINE (ZERO EXTERNAL DEPENDENCIES)
// ============================================================================

import {
  ImportCategory,
  ImportColumnMapping,
  ImportFileAnalysis,
  FileValidationStatus,
  ImportErrorItem,
} from './importTypes';
import { CATEGORY_REGISTRY } from './importRegistry';

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
  preHeaderMetadata: Record<string, string>;
  totalLines: number;
}

/**
 * Robust RFC 4180 CSV / TSV parser.
 * Handles quoted cells with embedded commas, quotes, and newlines.
 * Automatically identifies metadata lines before the actual table header.
 */
export function parseCsvText(rawText: string): ParsedCsvResult {
  // Strip BOM if present
  let cleanText = rawText;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  // Detect delimiter: comma, tab, or semicolon
  const firstSample = cleanText.slice(0, 2048);
  const commaCount = (firstSample.match(/,/g) || []).length;
  const tabCount = (firstSample.match(/\t/g) || []).length;
  const semiCount = (firstSample.match(/;/g) || []).length;
  let delimiter = ',';
  if (tabCount > commaCount && tabCount > semiCount) delimiter = '\t';
  else if (semiCount > commaCount && semiCount > tabCount) delimiter = ';';

  // State machine for RFC 4180 CSV parsing
  const parsedGrid: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  let i = 0;
  const len = cleanText.length;

  while (i < len) {
    const char = cleanText[i];
    const nextChar = i + 1 < len ? cleanText[i + 1] : '';

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentCell += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentCell += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === delimiter) {
        currentRow.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      } else if (char === '\r' || char === '\n') {
        // End of line
        currentRow.push(currentCell.trim());
        currentCell = '';
        // Skip consecutive CRLF
        if (char === '\r' && nextChar === '\n') {
          i += 2;
        } else {
          i++;
        }
        if (currentRow.some((c) => c.length > 0)) {
          parsedGrid.push(currentRow);
        }
        currentRow = [];
        continue;
      } else {
        currentCell += char;
        i++;
        continue;
      }
    }
  }

  // Flush last cell/row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      parsedGrid.push(currentRow);
    }
  }

  // Pre-header detection (e.g. The Laundry Lounge header: Company Name, Phone No, To Pay, To Collect)
  const preHeaderMetadata: Record<string, string> = {};
  let headerRowIndex = 0;

  // Search for the true table header row
  // A table header row typically has multiple non-empty columns with typical column names (Name, GST, Date, Item, etc.)
  for (let r = 0; r < Math.min(parsedGrid.length, 15); r++) {
    const row = parsedGrid[r];
    const joined = row.join(' ').toLowerCase();

    // Check if this row looks like metadata (e.g. "To Collect: 19785.0", "Phone No: 9893733683")
    for (const cell of row) {
      if (cell.includes(':')) {
        const [k, ...v] = cell.split(':');
        if (k && v.length) {
          preHeaderMetadata[k.trim()] = v.join(':').trim();
        }
      }
    }

    // Check for strong header signals
    const hasNameOrDate = row.some((c) => {
      const lower = c.toLowerCase();
      return (
        lower === 'name' ||
        lower === 'party name' ||
        lower === 'customer name' ||
        lower === 'item name' ||
        lower === 'product name' ||
        lower === 'invoice no' ||
        lower === 'order number' ||
        lower === 'bill no' ||
        lower === 'date'
      );
    });

    const populatedCols = row.filter((c) => c.length > 0).length;
    if (hasNameOrDate && populatedCols >= 3) {
      headerRowIndex = r;
      break;
    }
  }

  const headerRow = parsedGrid[headerRowIndex] || [];
  const rawHeaders = headerRow.map((h, idx) => (h ? h.trim() : `Column_${idx + 1}`));

  // Ensure unique headers
  const seenHeaders: Record<string, number> = {};
  const headers = rawHeaders.map((h) => {
    if (!seenHeaders[h]) {
      seenHeaders[h] = 1;
      return h;
    } else {
      seenHeaders[h]++;
      return `${h}_${seenHeaders[h]}`;
    }
  });

  // Extract data rows
  const rows: Record<string, string>[] = [];
  for (let r = headerRowIndex + 1; r < parsedGrid.length; r++) {
    const gridRow = parsedGrid[r];
    // Skip empty lines or footer summary lines
    if (!gridRow || gridRow.length === 0 || !gridRow.some((c) => c.length > 0)) {
      continue;
    }
    // Skip explicit footer lines like "Total", "Grand Total" if alone
    if (gridRow[0] && ['total', 'grand total', 'subtotal'].includes(gridRow[0].toLowerCase())) {
      continue;
    }

    const rowObj: Record<string, string> = {};
    headers.forEach((hdr, colIdx) => {
      rowObj[hdr] = gridRow[colIdx] !== undefined ? gridRow[colIdx] : '';
    });
    rows.push(rowObj);
  }

  return {
    headers,
    rows,
    preHeaderMetadata,
    totalLines: parsedGrid.length,
  };
}

/**
 * Category detection algorithm based on headers, sample row values, and pre-header signals.
 * Never relies solely on filename.
 */
export function detectCategory(
  headers: string[],
  sampleRows: Record<string, string>[],
  fileName: string,
  preHeaderMetadata: Record<string, string> = {}
): { category: ImportCategory; confidence: number; reason: string } {
  const normHeaders = headers.map((h) => h.toLowerCase().trim());
  const headerText = normHeaders.join(' ');
  const metaText = Object.keys(preHeaderMetadata).join(' ').toLowerCase();

  const scores: { category: ImportCategory; score: number; reasons: string[] }[] = [];

  // Special Check: The Laundry Lounge / My BillBook "All Party Balance" format
  const hasToCollectOrPay =
    metaText.includes('to collect') ||
    metaText.includes('to pay') ||
    normHeaders.includes('to collect') ||
    normHeaders.includes('to pay');

  const hasBalColumn = normHeaders.some((h) => h === 'bal.' || h === 'bal' || h === 'balance');
  const hasPartyCategory = normHeaders.some((h) => h.includes('party category'));

  if (hasToCollectOrPay || (hasBalColumn && hasPartyCategory)) {
    return {
      category: 'all_party_balance',
      confidence: 98,
      reason: 'Matched My BillBook / Laundry Lounge All Party Balance format (Headers: Bal, Party Category, To Collect/Pay).',
    };
  }

  // Iterate over all categories in registry
  (Object.keys(CATEGORY_REGISTRY) as ImportCategory[]).forEach((catKey) => {
    const cat = CATEGORY_REGISTRY[catKey];
    let score = 0;
    const reasons: string[] = [];

    // 1. Header keyword matches
    cat.detectionKeywords.forEach((kw) => {
      if (headerText.includes(kw)) {
        score += 15;
        reasons.push(`Header matches keyword "${kw}"`);
      }
    });

    // 2. Field alias matches
    cat.targetFields.forEach((field) => {
      const match = normHeaders.some((h) => field.aliases.some((alias) => h === alias || h.includes(alias)));
      if (match) {
        score += field.required ? 20 : 8;
      }
    });

    // 3. Sample values shape analysis
    if (sampleRows.length > 0) {
      // Check for phone numbers (10 digits)
      const hasPhoneValues = sampleRows.some((r) =>
        Object.values(r).some((v) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')))
      );
      if (hasPhoneValues && (catKey === 'customers' || catKey === 'suppliers' || catKey === 'all_party_balance')) {
        score += 12;
      }

      // Check for GST numbers (15 alphanumeric)
      const hasGstValues = sampleRows.some((r) =>
        Object.values(r).some((v) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(v.trim()))
      );
      if (hasGstValues && (catKey === 'sales_invoices' || catKey === 'purchase_invoices' || catKey === 'customers')) {
        score += 10;
      }

      // Check for currency / numerical amounts
      const hasAmounts = sampleRows.some((r) =>
        Object.values(r).some((v) => /^-?\d+(\.\d+)?$/.test(v.replace(/,/g, '').trim()) && Number(v.replace(/,/g, '')) > 0)
      );
      if (hasAmounts && (catKey === 'expenses' || catKey === 'payments' || catKey === 'sales_invoices')) {
        score += 6;
      }
    }

    // Secondary slight tie-breaker from filename (max 10 points)
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes(catKey.replace('_', ' ')) || lowerName.includes(catKey.replace('_', ''))) {
      score += 10;
    }

    scores.push({
      category: catKey,
      score,
      reasons,
    });
  });

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  if (best.score >= 50) {
    const confidence = Math.min(Math.round((best.score / 90) * 100), 99);
    return {
      category: best.category,
      confidence,
      reason: best.reasons.slice(0, 3).join('; ') || 'High pattern similarity with schema definition.',
    };
  }

  // Low confidence fallback: default to customers but flag for user review
  return {
    category: best.score > 20 ? best.category : 'customers',
    confidence: Math.max(best.score, 35),
    reason: 'Low automatic match confidence. Please verify or reassign the category.',
  };
}

/**
 * Smart automatic column mapper for a selected category
 */
export function autoMapColumns(headers: string[], category: ImportCategory): ImportColumnMapping[] {
  const targetFields = CATEGORY_REGISTRY[category]?.targetFields || [];
  const mappings: ImportColumnMapping[] = [];

  headers.forEach((sourceCol) => {
    const norm = sourceCol.toLowerCase().trim();

    // Find best target field
    let matchedField = '__ignore__';
    let isRequired = false;
    let transformType: ImportColumnMapping['transform'] = 'trim';

    for (const f of targetFields) {
      const isExactMatch = f.aliases.some((alias) => norm === alias);
      const isPartialMatch = f.aliases.some((alias) => norm.includes(alias) || alias.includes(norm));

      if (isExactMatch || isPartialMatch) {
        matchedField = f.key;
        isRequired = f.required;
        if (f.type === 'phone') transformType = 'phone_normalize';
        else if (f.type === 'number') transformType = 'number';
        else if (f.type === 'date') transformType = 'date';
        else if (f.type === 'gstin') transformType = 'uppercase';
        break;
      }
    }

    mappings.push({
      sourceColumn: sourceCol,
      targetField: matchedField,
      required: isRequired,
      transform: transformType,
    });
  });

  return mappings;
}

/**
 * ZIP file extractor using native Web Streams (DecompressionStream('deflate-raw'))
 * Reads PKZip header (0x04034b50) and extracts CSV, TSV, and XLSX entries.
 */
export async function extractZipArchive(
  arrayBuffer: ArrayBuffer,
  zipFileName: string
): Promise<{ fileName: string; textContent: string; size: number }[]> {
  const extractedFiles: { fileName: string; textContent: string; size: number }[] = [];
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  let offset = 0;

  while (offset + 30 < bytes.length) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) {
      // Not a local file header, advance or stop
      offset++;
      continue;
    }

    const compression = view.getUint16(offset + 8, true);
    const compSize = view.getUint32(offset + 18, true);
    const uncompSize = view.getUint32(offset + 22, true);
    const fnLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);

    const fnBytes = bytes.slice(offset + 30, offset + 30 + fnLen);
    const fileName = new TextDecoder().decode(fnBytes);
    const dataOffset = offset + 30 + fnLen + extraLen;

    // Check if entry is a file (not folder, not Mac OS X __MACOSX metadata)
    if (
      !fileName.endsWith('/') &&
      !fileName.includes('__MACOSX') &&
      !fileName.startsWith('.') &&
      (fileName.endsWith('.csv') || fileName.endsWith('.tsv') || fileName.endsWith('.txt'))
    ) {
      const fileData = bytes.slice(dataOffset, dataOffset + compSize);
      let text = '';

      if (compression === 0) {
        // Stored (no compression)
        text = new TextDecoder().decode(fileData);
      } else if (compression === 8 && typeof DecompressionStream !== 'undefined') {
        // Deflate compression
        try {
          const ds = new DecompressionStream('deflate-raw');
          const decompressedStream = new Response(fileData).body!.pipeThrough(ds);
          text = await new Response(decompressedStream).text();
        } catch (e) {
          console.warn(`Failed to deflate ${fileName}:`, e);
        }
      }

      if (text) {
        extractedFiles.push({
          fileName: fileName.split('/').pop() || fileName,
          textContent: text,
          size: uncompSize || text.length,
        });
      }
    }

    // Advance to next entry (using compressed size if known)
    if (compSize > 0) {
      offset = dataOffset + compSize;
    } else {
      offset += 30 + fnLen + extraLen;
    }
  }

  return extractedFiles;
}

function unescapeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function colLetterToIndex(col: string): number {
  let idx = 0;
  for (let i = 0; i < col.length; i++) {
    idx = idx * 26 + col.charCodeAt(i) - 64;
  }
  return idx - 1;
}

function rowToCsv(cells: string[]): string {
  return cells
    .map((c) => {
      const val = c || '';
      if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    })
    .join(',');
}

/**
 * Extracts and converts an .xlsx (Excel) workbook into CSV in pure JS.
 * Zero external npm dependencies. Handles sharedStrings and multiple worksheets.
 */
export async function extractXlsxToCsv(
  arrayBuffer: ArrayBuffer,
  fileName: string
): Promise<{ fileName: string; textContent: string; size: number }[]> {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  let offset = 0;

  let sharedStringsXml = '';
  const sheetXmls: { sheetName: string; xml: string }[] = [];

  while (offset + 30 < bytes.length) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) {
      offset++;
      continue;
    }

    const compression = view.getUint16(offset + 8, true);
    const compSize = view.getUint32(offset + 18, true);
    const fnLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);

    const fnBytes = bytes.slice(offset + 30, offset + 30 + fnLen);
    const entryName = new TextDecoder().decode(fnBytes);
    const dataOffset = offset + 30 + fnLen + extraLen;

    const isSharedStrings = entryName.includes('sharedStrings.xml');
    const isSheet = entryName.includes('worksheets/sheet') && entryName.endsWith('.xml');

    if (isSharedStrings || isSheet) {
      const fileData = bytes.slice(dataOffset, dataOffset + compSize);
      let text = '';

      if (compression === 0) {
        text = new TextDecoder().decode(fileData);
      } else if (compression === 8 && typeof DecompressionStream !== 'undefined') {
        try {
          const ds = new DecompressionStream('deflate-raw');
          const decompressedStream = new Response(fileData).body!.pipeThrough(ds);
          text = await new Response(decompressedStream).text();
        } catch (e) {
          console.warn(`Failed to decompress ${entryName}:`, e);
        }
      }

      if (isSharedStrings) {
        sharedStringsXml = text;
      } else if (isSheet) {
        sheetXmls.push({ sheetName: entryName.split('/').pop()?.replace('.xml', '') || 'sheet', xml: text });
      }
    }

    if (compSize > 0) {
      offset = dataOffset + compSize;
    } else {
      offset += 30 + fnLen + extraLen;
    }
  }

  // Parse shared strings table
  const sharedStrings: string[] = [];
  if (sharedStringsXml) {
    const siMatches = sharedStringsXml.matchAll(/<si>(.*?)<\/si>/gs);
    for (const match of siMatches) {
      const siContent = match[1];
      const tMatches = siContent.matchAll(/<t[^>]*>(.*?)<\/t>/gs);
      let cellText = '';
      for (const t of tMatches) {
        cellText += unescapeXml(t[1]);
      }
      sharedStrings.push(cellText);
    }
  }

  // Parse worksheets into CSV
  const results: { fileName: string; textContent: string; size: number }[] = [];
  for (let sIdx = 0; sIdx < sheetXmls.length; sIdx++) {
    const sheet = sheetXmls[sIdx];
    const rowMatches = sheet.xml.matchAll(/<row[^>]*>(.*?)<\/row>/gs);
    const csvRows: string[] = [];

    for (const rMatch of rowMatches) {
      const rowContent = rMatch[1];
      const cellMatches = rowContent.matchAll(/<c\s+r="([A-Z]+)[0-9]+"([^>]*)>(.*?)<\/c>/gs);
      const cells: string[] = [];

      for (const cMatch of cellMatches) {
        const colLetter = cMatch[1];
        const colIdx = colLetterToIndex(colLetter);
        const attrs = cMatch[2];
        const cellBody = cMatch[3];

        const isString = attrs.includes('t="s"');
        const isInlineString = attrs.includes('t="inlineStr"');

        let cellValue = '';
        if (isString) {
          const vMatch = cellBody.match(/<v>(.*?)<\/v>/);
          if (vMatch) {
            const strIdx = parseInt(vMatch[1], 10);
            cellValue = sharedStrings[strIdx] || '';
          }
        } else if (isInlineString) {
          const tMatch = cellBody.match(/<t[^>]*>(.*?)<\/t>/s);
          if (tMatch) cellValue = unescapeXml(tMatch[1]);
        } else {
          const vMatch = cellBody.match(/<v>(.*?)<\/v>/);
          if (vMatch) cellValue = vMatch[1];
        }

        while (cells.length < colIdx) {
          cells.push('');
        }
        cells[colIdx] = cellValue;
      }

      if (cells.length > 0 && cells.some((c) => c.trim().length > 0)) {
        csvRows.push(rowToCsv(cells));
      }
    }

    if (csvRows.length > 0) {
      const csvText = csvRows.join('\n');
      const baseName = fileName.replace(/\.[^.]+$/, '');
      const sheetSuffix = sheetXmls.length > 1 ? `_${sheet.sheetName}` : '';
      results.push({
        fileName: `${baseName}${sheetSuffix}.csv`,
        textContent: csvText,
        size: csvText.length,
      });
    }
  }

  return results;
}

/**
 * Validates parsed rows against category schema and mappings
 */
export function validateRows(
  rows: Record<string, string>[],
  mappings: ImportColumnMapping[],
  category: ImportCategory,
  fileId: string,
  fileName: string
): {
  validCount: number;
  invalidCount: number;
  warningCount: number;
  duplicateCount: number;
  errors: ImportErrorItem[];
  expectedFinancialTotal: number;
  status: FileValidationStatus;
} {
  const errors: ImportErrorItem[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let warningCount = 0;
  let duplicateCount = 0;
  let expectedFinancialTotal = 0;

  const seenKeys = new Set<string>();
  const targetDefMap = new Map(CATEGORY_REGISTRY[category]?.targetFields.map((f) => [f.key, f]) || []);

  rows.forEach((row, idx) => {
    const rowNum = idx + 1;
    let hasCriticalError = false;

    // Check required fields
    mappings.forEach((m) => {
      if (m.targetField === '__ignore__') return;
      const def = targetDefMap.get(m.targetField);
      const val = (row[m.sourceColumn] || '').trim();

      if (def?.required && !val) {
        hasCriticalError = true;
        errors.push({
          id: `err-${fileId}-${rowNum}-${m.targetField}`,
          fileId,
          fileName,
          rowNumber: rowNum,
          column: m.sourceColumn,
          value: '',
          error: `Missing required field "${def.label}"`,
          severity: 'critical',
        });
      }

      // Format validations
      if (val && def?.type === 'number') {
        const num = parseFloat(val.replace(/,/g, ''));
        if (isNaN(num)) {
          hasCriticalError = true;
          errors.push({
            id: `err-${fileId}-${rowNum}-${m.targetField}`,
            fileId,
            fileName,
            rowNumber: rowNum,
            column: m.sourceColumn,
            value: val,
            error: `Invalid number format "${val}" for ${def.label}`,
            severity: 'critical',
          });
        }
      }

      // Sum expected financial total
      if (
        (m.targetField === 'openingBalance' ||
          m.targetField === 'grandTotal' ||
          m.targetField === 'totalAmount' ||
          m.targetField === 'amount') &&
        val
      ) {
        const num = parseFloat(val.replace(/,/g, ''));
        if (!isNaN(num)) expectedFinancialTotal += num;
      }
    });

    // Check duplicate key inside file (phone, gstin, or sku)
    const phoneCol = mappings.find((m) => m.targetField === 'phone')?.sourceColumn;
    const skuCol = mappings.find((m) => m.targetField === 'sku' || m.targetField === 'invoiceNumber')?.sourceColumn;
    const checkKey = phoneCol ? row[phoneCol]?.replace(/\D/g, '') : skuCol ? row[skuCol]?.trim() : '';

    if (checkKey && checkKey.length >= 4) {
      if (seenKeys.has(checkKey)) {
        duplicateCount++;
        warningCount++;
        errors.push({
          id: `warn-${fileId}-${rowNum}-dup`,
          fileId,
          fileName,
          rowNumber: rowNum,
          column: phoneCol || skuCol,
          value: checkKey,
          error: `Duplicate identifier "${checkKey}" found in this file`,
          severity: 'warning',
        });
      } else {
        seenKeys.add(checkKey);
      }
    }

    if (hasCriticalError) {
      invalidCount++;
    } else {
      validCount++;
    }
  });

  let status: FileValidationStatus = 'valid';
  if (invalidCount > 0) status = 'invalid';
  else if (warningCount > 0) status = 'warnings';

  return {
    validCount,
    invalidCount,
    warningCount,
    duplicateCount,
    errors,
    expectedFinancialTotal: Math.round(expectedFinancialTotal * 100) / 100,
    status,
  };
}

