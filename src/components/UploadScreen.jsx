import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Info,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';

export default function UploadScreen({ onSelectDataset, onCustomFileUpload, isParsing, parseStatusText, parsingError, lastUploadedFile, onRetry, clearError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (isParsing) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file) => {
    if (isParsing) return;
    setDragError(null);
    if (clearError) clearError();
    if (!file) return;

    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setDragError('Unsupported file format. Please upload a .csv, .xlsx, or .xls file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setDragError(`File size (${sizeMB} MB) exceeds maximum 25 MB limit.`);
      return;
    }

    onCustomFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isParsing) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (isParsing) return;
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const displayError = parsingError || dragError;
  const statusMessage = parseStatusText || 'Reading file…';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-2xs backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Instant Spreadsheet Analytics</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Turn Excel & CSV Data into <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 bg-clip-text text-transparent">Interactive Dashboards</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
          Upload any spreadsheet to inspect column schemas, preview row records, and build interactive dashboards locally in your browser.
        </p>
      </div>

      {/* Main Upload Dropzone */}
      <div className="max-w-2xl mx-auto">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isParsing && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 group ${
            isParsing
              ? 'border-indigo-300 bg-indigo-50/40 cursor-wait opacity-90'
              : isDragging 
              ? 'border-indigo-600 bg-indigo-50/60 scale-[1.01] shadow-lg shadow-indigo-500/10 cursor-pointer' 
              : 'border-slate-300/80 hover:border-indigo-500/80 bg-white/90 shadow-sm hover:shadow-md cursor-pointer'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv, .xlsx, .xls"
            className="hidden"
            disabled={isParsing}
          />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-50 to-teal-50 group-hover:from-indigo-100 group-hover:to-teal-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 transition-all duration-200 border border-indigo-100/80 shadow-2xs">
            {isParsing ? (
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 mb-1 tracking-tight">
            {isParsing ? statusMessage : 'Drag & Drop your spreadsheet here'}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {isParsing ? 'Processing data locally in browser memory…' : 'or click to browse from your computer'}
          </p>

          <button
            type="button"
            disabled={isParsing}
            onClick={(e) => {
              e.stopPropagation();
              if (!isParsing) fileInputRef.current?.click();
            }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isParsing ? statusMessage : 'Browse Files'}</span>
          </button>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Supports .XLSX, .XLS, .CSV</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>Max file size 25 MB</span>
            <span className="text-slate-300">•</span>
            <span className="text-teal-700 font-bold">100% Client-Side Local Privacy</span>
          </div>

          {displayError && (
            <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-left flex items-start justify-between space-x-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-rose-900 block">Parsing / File Error</span>
                  <p className="leading-relaxed">{displayError}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                {lastUploadedFile && onRetry && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry();
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    title={`Retry parsing ${lastUploadedFile.name}`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry File</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (clearError) clearError();
                    setDragError(null);
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Choose Another File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Try Sample Datasets Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-3 gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Try a Sample Dataset</h2>
            <p className="text-sm text-slate-500">Select one of our curated mock datasets to explore the dashboard immediately</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-lg self-start sm:self-auto shadow-2xs">
            Sample Spreadsheets Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(SAMPLE_DATASETS).map((dataset) => (
            <div
              key={dataset.id}
              onClick={() => !isParsing && onSelectDataset(dataset)}
              className={`bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 p-5 transition-all duration-200 flex flex-col justify-between group shadow-xs ${
                isParsing ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400 hover:shadow-md cursor-pointer hover:-translate-y-0.5'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                    {dataset.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    {dataset.fileSize}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between tracking-tight">
                  <span>{dataset.displayName}</span>
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {dataset.description}
                </p>

                <div className="flex items-center space-x-4 text-xs font-mono text-slate-600 pt-2 border-t border-slate-100">
                  <span>{dataset.rowCount.toLocaleString()} rows</span>
                  <span>•</span>
                  <span>{dataset.columnCount} columns</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                <span>Load Sample & Inspect</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Browser Privacy Architecture Banner */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
          <Info className="w-6 h-6 text-teal-600" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2 tracking-tight">
            <span>100% Client-Side Local Browser Privacy</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Uploaded CSV and Excel (.xlsx, .xls) files are parsed entirely client-side in browser memory using PapaParse and SheetJS. Column schemas and row records remain strictly local without external server transmission.
          </p>
        </div>
      </div>
    </div>
  );
}
