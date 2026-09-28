import React, { useState } from 'react';
import { 
  FileText, 
  Table as TableIcon, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  Database,
  Hash,
  Calendar,
  Tag,
  Globe,
  DollarSign,
  TrendingUp,
  Star,
  Clock,
  Info,
  ShieldCheck
} from 'lucide-react';

const ICON_MAP = {
  Hash: Hash,
  Calendar: Calendar,
  Tag: Tag,
  Globe: Globe,
  DollarSign: DollarSign,
  TrendingUp: TrendingUp,
  Star: Star,
  Clock: Clock,
  FileText: FileText,
};

export default function DataPreviewScreen({ dataset, onContinue, onBack, onSelectWorksheet, onSelectHeaderRow }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const isCustom = Boolean(dataset?.isCustomFile);

  // Compute Read-Only Data Quality Metrics for Custom Files
  const dataQuality = React.useMemo(() => {
    if (!dataset || !isCustom || !dataset.previewRows || !dataset.columns || dataset.columns.length === 0) {
      return null;
    }

    const rows = dataset.previewRows;
    const cols = dataset.columns.map(c => c.name);
    const totalRows = rows.length;
    const totalCols = cols.length;
    const totalCells = totalRows * totalCols;

    let totalMissingCells = 0;
    const colMissingCounts = {};
    cols.forEach(c => { colMissingCounts[c] = 0; });

    const seenRowSignatures = new Set();
    let duplicateRowCount = 0;

    rows.forEach(row => {
      // Missing values check (null, undefined, or whitespace-only)
      cols.forEach(c => {
        const val = row[c];
        if (val === null || val === undefined || String(val).trim() === '') {
          totalMissingCells += 1;
          colMissingCounts[c] += 1;
        }
      });

      // Full duplicate row check (matching across ALL parsed columns)
      const rowVals = cols.map(c => {
        const v = row[c];
        return v !== null && v !== undefined ? String(v).trim() : '';
      });
      const signature = JSON.stringify(rowVals);

      if (seenRowSignatures.has(signature)) {
        duplicateRowCount += 1;
      } else {
        seenRowSignatures.add(signature);
      }
    });

    const missingPercentage = totalCells > 0 ? (totalMissingCells / totalCells) * 100 : 0;

    return {
      totalRows,
      totalCols,
      totalCells,
      totalMissingCells,
      missingPercentage: Number(missingPercentage.toFixed(1)),
      duplicateRowCount,
      colMissingCounts
    };
  }, [dataset, isCustom]);

  if (!dataset) return null;

  // Filter rows by search query
  const rawRows = dataset.previewRows || [];
  const filteredRows = rawRows.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={onBack}
              className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to Upload</span>
            </button>
            <span className="text-slate-300">•</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
              isCustom 
                ? 'text-teal-700 bg-teal-50 border-teal-200' 
                : 'text-indigo-700 bg-indigo-50 border-indigo-200'
            }`}>
              {isCustom ? 'Phase 3 Custom Dashboard Ready' : 'Sample Dataset Inspected'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Data Structure & Preview
          </h1>
          <p className="text-xs text-slate-500">
            {isCustom 
              ? 'Review parsed spreadsheet columns, detected types, and actual row records before creating your dashboard' 
              : 'Review sample columns and data types before generating the visual dashboard'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Choose Different File
          </button>

          <button
            onClick={onContinue}
            disabled={Boolean(dataset.error)}
            className={`inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
              dataset.error
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-100 transform hover:scale-[1.02] cursor-pointer'
            }`}
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Custom File Parse Controls (Worksheet Selector & Header Row Selector) */}
      {isCustom && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Excel Worksheet Selector */}
          {dataset.sheetNames && dataset.sheetNames.length > 0 && (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">Select Excel Worksheet</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {dataset.sheetNames.length} {dataset.sheetNames.length === 1 ? 'Sheet' : 'Sheets'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <select
                    id="worksheet-select"
                    value={dataset.selectedSheet || dataset.sheetNames[0]}
                    onChange={(e) => onSelectWorksheet && onSelectWorksheet(e.target.value)}
                    className="text-xs font-semibold rounded-xl px-3 py-1.5 bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
                  >
                    {dataset.sheetNames.map((sheetName) => (
                      <option key={sheetName} value={sheetName}>
                        Worksheet: {sheetName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Header Row Selector (Phase 17) */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
              <TableIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">Header Row Selection</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Header: Row {dataset.headerRowIndex || 1}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <label htmlFor="header-row-select" className="text-xs text-slate-500">
                  Headers on:
                </label>
                <select
                  id="header-row-select"
                  value={dataset.headerRowIndex || 1}
                  onChange={(e) => onSelectHeaderRow && onSelectHeaderRow(Number(e.target.value))}
                  className="text-xs font-semibold rounded-xl px-3 py-1.5 bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer shadow-2xs"
                >
                  {Array.from({ length: dataset.maxAvailableHeaderRows || 20 }, (_, i) => i + 1).map((rowNum) => (
                    <option key={rowNum} value={rowNum}>
                      Row {rowNum}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty / Invalid Worksheet Error Alert Notice */}
      {dataset.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-3 text-xs">
          <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-950 block">Worksheet Parsing Notice</span>
            <p className="text-rose-800 leading-relaxed">
              {dataset.error} Please select a different worksheet from the dropdown above to view data.
            </p>
          </div>
        </div>
      )}

      {/* Dataset Metadata Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Source File</span>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-extrabold text-slate-900 text-sm truncate" title={dataset.name}>
              {dataset.name}
            </span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Row Count</span>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-extrabold text-slate-900 text-sm">
              {dataset.rowCount?.toLocaleString()} Rows
            </span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Detected Columns</span>
          <div className="flex items-center space-x-2">
            <TableIcon className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-extrabold text-slate-900 text-sm">
              {dataset.columnCount} Columns
            </span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Parsing Status</span>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-extrabold text-slate-900 text-sm">
              {isCustom 
                ? (dataset.error 
                    ? 'Worksheet Error' 
                    : dataset.parseDurationMs !== undefined 
                    ? `Parsed in ${(dataset.parseDurationMs / 1000).toFixed(1)}s` 
                    : '100% Parsed') 
                : 'Sample Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Phase 3 Custom File Status Explanation Banner */}
      {isCustom && (
        <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-900 flex items-start space-x-3 text-xs">
          <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-teal-950 block">
              File Parsed Successfully
              {dataset.parseDurationMs !== undefined && (
                <span className="font-mono text-xs font-semibold text-teal-800 ml-1.5 border-l border-teal-300 pl-2">
                  Parsed locally in {(dataset.parseDurationMs / 1000).toFixed(1)} seconds
                </span>
              )}
            </span>
            <p className="text-teal-800 leading-relaxed">
              Your spreadsheet <strong>{dataset.name}</strong> ({dataset.fileSize}) was parsed locally in browser memory{dataset.parseDurationMs !== undefined ? ` in ${(dataset.parseDurationMs / 1000).toFixed(1)} seconds` : ''}. Column headers and row records are displayed in the preview below. Click <strong>Continue to Dashboard</strong> to configure your data-driven visual dashboard based strictly on your spreadsheet's columns.
            </p>
          </div>
        </div>
      )}

      {/* Read-Only Data Quality Assessment Card (Custom Files Only) */}
      {isCustom && dataQuality && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">Read-Only Data Quality Summary</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
              Assessed as Parsed (Unmodified Data)
            </span>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500 block">Total Structure</span>
              <span className="text-sm font-black text-slate-900">
                {dataQuality.totalRows.toLocaleString()} Rows × {dataQuality.totalCols} Cols
              </span>
              <span className="text-[10px] text-slate-400 block">{dataQuality.totalCells.toLocaleString()} Total Cells</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500 block">Blank / Missing Cells</span>
              <span className="text-sm font-black text-slate-900">
                {dataQuality.totalMissingCells.toLocaleString()} Cells
              </span>
              <span className={`text-[10px] block font-semibold ${dataQuality.totalMissingCells > 0 ? 'text-amber-600' : 'text-teal-600'}`}>
                {dataQuality.missingPercentage}% of all cells
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500 block">Duplicate Rows</span>
              <span className="text-sm font-black text-slate-900">
                {dataQuality.duplicateRowCount.toLocaleString()} Full Duplicates
              </span>
              <span className="text-[10px] text-slate-400 block">Full-row exact matches</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500 block">Overall Completeness</span>
              <span className="text-sm font-black text-teal-700">
                {(100 - dataQuality.missingPercentage).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block">Non-blank data density</span>
            </div>
          </div>

          {/* Per-Column Missing Value Counts Breakdown */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-700 block">Per-Column Missing Values:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(dataset.columns || []).map((col) => {
                const missingCount = dataQuality.colMissingCounts[col.name] || 0;
                const colPct = dataQuality.totalRows > 0 ? ((missingCount / dataQuality.totalRows) * 100).toFixed(1) : '0';
                return (
                  <div key={col.name} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate mr-2" title={col.name}>{col.name}</span>
                    <span className={`font-mono text-[11px] shrink-0 ${missingCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-400'}`}>
                      {missingCount} missing ({colPct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Read-Only Transparency Note */}
          <div className="pt-2 flex items-start space-x-2 text-[11px] text-slate-500 border-t border-slate-100">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong>Data Quality Note:</strong> Values are assessed strictly as parsed from the source spreadsheet. The application does not alter, remove, fill, or silently clean any uploaded data rows.
            </p>
          </div>
        </div>
      )}

      {/* Detected Column Names & Data Types Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Detected Column Headers & Inferred Data Types</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {dataset.columns?.length || 0} Columns Parsed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(dataset.columns || []).map((col, idx) => {
            const IconComponent = ICON_MAP[col.icon] || FileText;
            return (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-200 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate" title={col.name}>
                    {col.name}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100/70 text-indigo-700 rounded-md">
                    {col.type}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                  <IconComponent className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate" title={String(col.sample)}>Sample: {col.sample}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actual Data Table Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span>Actual Spreadsheet Rows Preview</span>
              <span className="text-xs font-normal text-slate-500">
                ({isCustom ? `Showing real parsed data from ${dataset.name}` : 'Showing Sample Mock Data'})
              </span>
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search spreadsheet rows..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono w-12">#</th>
                {(dataset.columns || []).map((col, idx) => (
                  <th key={idx} className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <span>{col.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({col.type})</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row, rIdx) => {
                  const absoluteIndex = (currentPage - 1) * rowsPerPage + rIdx + 1;
                  return (
                    <tr key={rIdx} className="table-row-stripe transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{absoluteIndex}</td>
                      {(dataset.columns || []).map((col, cIdx) => {
                        const cellVal = row[col.name];
                        const displayVal = cellVal !== undefined && cellVal !== null ? String(cellVal) : '';
                        return (
                          <td key={cIdx} className="px-4 py-3 whitespace-nowrap text-slate-800 font-medium max-w-xs truncate" title={displayVal}>
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={(dataset.columns?.length || 0) + 1} className="px-4 py-8 text-center text-slate-500">
                    No matching spreadsheet records found for "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <span>
            Showing {paginatedRows.length} of {filteredRows.length} rows (Page {currentPage} of {totalPages})
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          ← Choose Different File
        </button>

        <button
          onClick={onContinue}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all transform hover:scale-[1.02]"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
