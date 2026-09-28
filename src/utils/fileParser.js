import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Check if a header name indicates a date column (e.g. Order Date, Payment Date, Date)
 */
function isDateHeaderName(name) {
  if (!name) return false;
  const h = String(name).toLowerCase().trim();
  return /(^|[\s_/\-#])date($|[\s_/\-#])|order\s*date|payment\s*date|ship\s*date|created\s*date|modified\s*date|due\s*date|birth\s*date|dob/i.test(h);
}

/**
 * Check if a cell value represents a date entry
 */
function isDateValue(val, isHeaderDate) {
  if (val === null || val === undefined) return false;
  if (val instanceof Date) return !isNaN(val.getTime());

  const str = String(val).trim();
  if (!str) return false;

  // Standard date pattern (e.g. 2024-01-15, 01/15/2024, 2024/01/15, 15-Jan-2024, 2024-01-15T00:00:00)
  const dateParsed = Date.parse(str);
  if (!isNaN(dateParsed) && (str.length >= 6 && /[-/.]/.test(str))) {
    return true;
  }

  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(str) || /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(str)) {
    return true;
  }

  // Excel serial date (e.g. 45290) when header indicates a date column
  if (isHeaderDate) {
    const num = Number(str.replace(/[$,]/g, ''));
    if (!isNaN(num) && num > 1000 && num < 100000) {
      return true;
    }
  }

  return false;
}

/**
 * Infer data type of a column based on cell values and header name
 */
function inferColumnType(values, headerName = '') {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  if (nonNullValues.length === 0) return 'String';

  const isHeaderDate = isDateHeaderName(headerName);

  let isDate = true;
  let isNumeric = true;
  let isCurrency = true;

  for (const val of nonNullValues) {
    const str = String(val).trim();

    // Check Currency format e.g. $100, $1,234.50, €50
    if (!/^[$€£¥]?\s*-?\d+(?:,\d{3})*(?:\.\d+)?$/.test(str)) {
      isCurrency = false;
    }

    // Check Numeric format e.g. 100, -25.5
    if (isNaN(Number(str.replace(/[$,]/g, '')))) {
      isNumeric = false;
    }

    // Check Date format
    if (!isDateValue(val, isHeaderDate)) {
      isDate = false;
    }
  }

  // Date priority: If all values match date formats OR if header has clear date evidence and values are date-parsable
  if (isDate || (isHeaderDate && nonNullValues.some(v => isDateValue(v, isHeaderDate)))) {
    return 'Date';
  }

  if (isCurrency && !isNumeric) return 'Currency';
  if (isNumeric) return 'Numeric';

  const uniqueCount = new Set(nonNullValues.map(v => String(v).toLowerCase())).size;
  if (uniqueCount <= Math.max(10, Math.floor(nonNullValues.length * 0.4))) {
    return 'Categorical';
  }

  return 'String';
}

/**
 * Exclude column names that represent phone numbers, contact numbers, or identifiers from numeric aggregations.
 */
export function isNonAggregatableColumnName(name) {
  if (!name) return false;
  const n = String(name).toLowerCase().trim();

  const phoneOrIdPatterns = [
    /phone/i,
    /mobile/i,
    /telephone/i,
    /contact\s*_?\s*n(o|umber)/i,
    /cell/i,
    /fax/i,
    /zip\s*code/i,
    /postal/i,
    /pincode/i,
    /(^|[\s_\-#])id($|[\s_\-#\d])/i,
    /uuid/i
  ];

  return phoneOrIdPatterns.some(pattern => pattern.test(n));
}

/**
 * Check if a column name represents sensitive data (e.g. Email, Phone, Mobile, Aadhaar, PAN, Passport, Card, Account, SSN, IDs)
 */
export function isSensitiveColumnName(columnName) {
  if (!columnName) return false;
  const n = String(columnName).toLowerCase().trim();

  // Generic Contact (or Contact Name / Person) is NOT sensitive per requirements
  if (n === 'contact' || n === 'contact name' || n === 'contact person' || n === 'contact person name') {
    return false;
  }

  // 1. email, email address
  if (/e-?mail/i.test(n)) return true;

  // 2. phone, mobile, telephone, cell, fax, contact number
  if (/phone/i.test(n)) return true;
  if (/mobile/i.test(n)) return true;
  if (/telephone/i.test(n)) return true;
  if (/cell/i.test(n)) return true;
  if (/fax/i.test(n)) return true;
  if (/contact\s*_?\s*n(o|umber)/i.test(n)) return true;

  // 3. aadhaar, aadhar, pan, passport
  if (/aadh?aar/i.test(n)) return true;
  if (/(^|[\s_/\-#])pan($|[\s_/\-#\d]|_card|card)/i.test(n)) return true;
  if (/passport/i.test(n)) return true;

  // 4. credit card, debit card, card number
  if (/credit\s*card|debit\s*card|card\s*n(o|umber)/i.test(n)) return true;

  // 5. bank account, account number, iban
  if (/bank\s*account|account\s*n(o|umber)|iban/i.test(n)) return true;

  // 6. ssn
  if (/(^|[\s_/\-#])ssn($|[\s_/\-#\d])/i.test(n)) return true;

  // 7. identifier columns already recognised as IDs
  if (isNonAggregatableColumnName(n)) return true;

  return false;
}

/**
 * Mask sensitive values according to Privacy Controls specifications.
 * Phone/Number/IDs/Cards/Passports: ••••1234 (last 4 chars)
 * Email: a•••@domain.com
 * Short/unavailable: ••••
 */
export function maskSensitiveValue(val, columnName) {
  if (val === null || val === undefined) return val;
  const str = String(val).trim();
  if (!str) return val;

  const colNameLower = String(columnName || '').toLowerCase().trim();
  const isEmail = /e-?mail/i.test(colNameLower) || (str.includes('@') && /^[^@]+@[^@]+\.[^@]+$/.test(str));

  if (isEmail) {
    const parts = str.split('@');
    if (parts.length === 2 && parts[0].length > 0) {
      return `${parts[0][0]}•••@${parts[1]}`;
    }
    return '••••';
  }

  if (str.length >= 4) {
    return '••••' + str.slice(-4);
  }

  return '••••';
}

/**
 * Assign icon name based on inferred type
 */
function getIconForType(type) {
  switch (type) {
    case 'Currency': return 'DollarSign';
    case 'Numeric': return 'Hash';
    case 'Date': return 'Calendar';
    case 'Categorical': return 'Tag';
    default: return 'FileText';
  }
}

/**
 * Trim whitespace and generate clear, unique column names for header labels (e.g. Column 2, Column 2 (2))
 */
export function buildUniqueHeaders(rawHeaderCells) {
  const seenCounts = {};
  return rawHeaderCells.map((cell, idx) => {
    let name = cell !== null && cell !== undefined ? String(cell).trim() : '';
    if (name === '') {
      name = `Column ${idx + 1}`;
    }
    if (seenCounts[name]) {
      seenCounts[name] += 1;
      return `${name} (${seenCounts[name]})`;
    } else {
      seenCounts[name] = 1;
      return name;
    }
  });
}

/**
 * Formats file size in readable units
 */
export function formatFileSize(sizeInBytes) {
  const sizeInMB = sizeInBytes / (1024 * 1024);
  if (sizeInMB >= 1) {
    return `${sizeInMB.toFixed(2)} MB`;
  }
  return `${(sizeInBytes / 1024).toFixed(1)} KB`;
}

/**
 * Parse CSV or Excel file client-side
 */
export async function parseSpreadsheetFile(file, options = {}) {
  const startTime = performance.now();

  if (!file) {
    throw new Error('No file provided for parsing.');
  }

  if (file.size === 0) {
    throw new Error('The uploaded file is empty (0 bytes). Please upload a valid spreadsheet file.');
  }

  // Reject files larger than 25 MB
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File size (${sizeInMB} MB) exceeds the maximum allowed limit of 25 MB. Please upload a smaller file.`);
  }

  const fileName = file.name.toLowerCase();
  const isCsv = fileName.endsWith('.csv');
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

  if (!isCsv && !isExcel) {
    throw new Error('Unsupported file format. Please upload a valid .csv, .xlsx, or .xls file.');
  }

  const MAX_PARSED_ROWS = 50000;
  const MAX_PARSED_CELLS = 500000;

  let rawHeaders = [];
  let rawRows = [];
  let sheetMeta = {};
  let totalAvailableRows = 0;
  const targetHeaderRowIndex = typeof options.headerRowIndex === 'number' && options.headerRowIndex > 0
    ? options.headerRowIndex
    : 1;

  if (isCsv) {
    const text = await file.text();
    if (!text.trim()) {
      throw new Error('The uploaded CSV file is empty.');
    }

    const parseResult = Papa.parse(text, {
      header: false,
      skipEmptyLines: false,
      dynamicTyping: false,
    });

    if (parseResult.errors && parseResult.errors.length > 0 && (!parseResult.data || parseResult.data.length === 0)) {
      throw new Error(`CSV Parsing Failure: ${parseResult.errors[0].message}`);
    }

    const allMatrix = parseResult.data || [];
    totalAvailableRows = allMatrix.length;

    if (totalAvailableRows === 0) {
      throw new Error('The uploaded CSV file is empty.');
    }

    const hIdx = targetHeaderRowIndex - 1;
    if (hIdx < 0 || hIdx >= totalAvailableRows) {
      throw new Error(`Header row ${targetHeaderRowIndex} is out of range (file has ${totalAvailableRows} rows).`);
    }

    const headerCells = allMatrix[hIdx];
    if (!headerCells || !Array.isArray(headerCells) || headerCells.every(c => c === null || c === undefined || String(c).trim() === '')) {
      throw new Error(`Header row ${targetHeaderRowIndex} is empty or invalid.`);
    }

    const dataRowsCount = totalAvailableRows - (hIdx + 1);
    const headerColCount = headerCells.length;
    const totalCellsCount = dataRowsCount * headerColCount;

    if (dataRowsCount > MAX_PARSED_ROWS || totalCellsCount > MAX_PARSED_CELLS) {
      throw new Error(
        `Dataset volume limit exceeded: CSV contains ${dataRowsCount.toLocaleString()} data rows and ${totalCellsCount.toLocaleString()} cells. The maximum supported limits are ${MAX_PARSED_ROWS.toLocaleString()} rows or ${MAX_PARSED_CELLS.toLocaleString()} data cells. Please filter or split the source file before uploading.`
      );
    }

    rawHeaders = buildUniqueHeaders(headerCells);

    const dataRowsMatrix = allMatrix.slice(hIdx + 1);

    rawRows = dataRowsMatrix
      .filter(row => row && Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''))
      .map((row, rIdx) => {
        const rowObj = { id: `ROW-${String(rIdx + 1).padStart(3, '0')}` };
        rawHeaders.forEach((header, cIdx) => {
          rowObj[header] = row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]) : '';
        });
        return rowObj;
      });

  } else if (isExcel) {
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new Error('The uploaded Excel file is empty.');
    }

    let workbook;
    try {
      workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd' });
    } catch (err) {
      throw new Error(`Failed to parse Excel workbook: ${err.message}`);
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('The Excel workbook contains no worksheets.');
    }

    const sheetNames = workbook.SheetNames;
    let targetSheetName = options.selectedSheet;

    if (!targetSheetName || !sheetNames.includes(targetSheetName)) {
      targetSheetName = sheetNames[0];
    }

    const sheet = workbook.Sheets[targetSheetName];
    if (!sheet) {
      throw new Error(`Worksheet "${targetSheetName}" not found in workbook.`);
    }

    // Inspect worksheet dimensions prior to full row conversion
    if (sheet['!ref']) {
      try {
        const range = XLSX.utils.decode_range(sheet['!ref']);
        const totalSheetRows = range.e.r - range.s.r + 1;
        const totalSheetCols = range.e.c - range.s.c + 1;
        const estimatedDataRows = Math.max(0, totalSheetRows - targetHeaderRowIndex);
        const estimatedTotalCells = estimatedDataRows * totalSheetCols;

        if (estimatedDataRows > MAX_PARSED_ROWS || estimatedTotalCells > MAX_PARSED_CELLS) {
          throw new Error(
            `Dataset volume limit exceeded: Sheet "${targetSheetName}" contains ${estimatedDataRows.toLocaleString()} data rows and ${estimatedTotalCells.toLocaleString()} cells. The maximum supported limits are ${MAX_PARSED_ROWS.toLocaleString()} rows or ${MAX_PARSED_CELLS.toLocaleString()} data cells. Please filter or split the source file before uploading.`
          );
        }
      } catch (err) {
        if (err.message && err.message.includes('Dataset volume limit exceeded')) {
          throw err;
        }
      }
    }

    // Convert sheet to array of arrays to safely inspect headers and rows
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false, dateNF: 'yyyy-mm-dd' });
    totalAvailableRows = sheetData.length;

    if (!sheetData || sheetData.length === 0) {
      throw new Error(`Worksheet "${targetSheetName}" is empty.`);
    }

    const hIdx = targetHeaderRowIndex - 1;
    if (hIdx < 0 || hIdx >= totalAvailableRows) {
      throw new Error(`Header row ${targetHeaderRowIndex} is out of range (worksheet "${targetSheetName}" has ${totalAvailableRows} rows).`);
    }

    const headerCells = sheetData[hIdx];
    if (!headerCells || !Array.isArray(headerCells) || headerCells.every(c => c === null || c === undefined || String(c).trim() === '')) {
      throw new Error(`Header row ${targetHeaderRowIndex} in worksheet "${targetSheetName}" is empty or invalid.`);
    }

    const dataRowsCount = totalAvailableRows - (hIdx + 1);
    const headerColCount = headerCells.length;
    const totalCellsCount = dataRowsCount * headerColCount;

    if (dataRowsCount > MAX_PARSED_ROWS || totalCellsCount > MAX_PARSED_CELLS) {
      throw new Error(
        `Dataset volume limit exceeded: Sheet "${targetSheetName}" contains ${dataRowsCount.toLocaleString()} data rows and ${totalCellsCount.toLocaleString()} cells. The maximum supported limits are ${MAX_PARSED_ROWS.toLocaleString()} rows or ${MAX_PARSED_CELLS.toLocaleString()} data cells. Please filter or split the source file before uploading.`
      );
    }

    rawHeaders = buildUniqueHeaders(headerCells);

    const dataRows = sheetData.slice(hIdx + 1);

    rawRows = dataRows
      .filter(row => row && Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''))
      .map((row, rIdx) => {
        const rowObj = { id: `ROW-${String(rIdx + 1).padStart(3, '0')}` };
        rawHeaders.forEach((header, cIdx) => {
          rowObj[header] = row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]) : '';
        });
        return rowObj;
      });

    sheetMeta = {
      sheetNames: sheetNames,
      selectedSheet: targetSheetName
    };
  }

  // Header validation
  if (!rawHeaders || rawHeaders.length === 0) {
    throw new Error('File validation failed: No column headers detected.');
  }

  // Row validation
  if (!rawRows || rawRows.length === 0) {
    throw new Error('File validation failed: The spreadsheet contains column headers but 0 data rows.');
  }

  // Construct column metadata with type inference
  const columns = rawHeaders.map(header => {
    const colValues = rawRows.map(r => r[header]);
    const type = inferColumnType(colValues, header);
    const sampleVal = colValues.find(v => v !== null && v !== undefined && String(v).trim() !== '');

    return {
      name: header,
      type: type,
      sample: sampleVal !== undefined ? String(sampleVal) : 'N/A',
      icon: getIconForType(type)
    };
  });

  const parseDurationMs = Math.max(1, Math.round(performance.now() - startTime));

  return {
    id: `parsed-${Date.now()}`,
    name: file.name,
    displayName: file.name,
    category: 'Custom Upload',
    rowCount: rawRows.length,
    columnCount: columns.length,
    fileSize: formatFileSize(file.size),
    columns: columns,
    previewRows: rawRows,
    isCustomFile: true,
    isParsed: true,
    sheetNames: sheetMeta.sheetNames,
    selectedSheet: sheetMeta.selectedSheet,
    headerRowIndex: targetHeaderRowIndex,
    maxAvailableHeaderRows: Math.min(20, totalAvailableRows),
    rawFile: file,
    parseDurationMs: parseDurationMs
  };
}
