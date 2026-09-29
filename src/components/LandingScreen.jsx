import React, { useState, useRef } from 'react';
import { 
  ArrowRight, 
  FileSpreadsheet, 
  BarChart2, 
  LayoutDashboard, 
  ShieldCheck, 
  Eye, 
  Download, 
  Sparkles, 
  Sliders, 
  Palette, 
  Table, 
  Lock, 
  Filter, 
  Maximize2, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  UploadCloud,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';

export default function LandingScreen({ 
  onSelectDataset, 
  onCustomFileUpload, 
  isParsing, 
  parseStatusText, 
  parsingError, 
  lastUploadedFile, 
  onRetry, 
  clearError,
  fileInputRef,
  activeTheme
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState(null);
  const internalRef = useRef(null);
  const activeFileInputRef = fileInputRef || internalRef;

  const handleScrollToSamples = (e) => {
    if (e) e.preventDefault();
    const elem = document.getElementById('samples');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
    e.target.value = '';
  };

  const displayError = parsingError || dragError;
  const statusMessage = parseStatusText || 'Reading file…';

  return (
    <div className={`min-h-screen ${activeTheme?.bgClass || 'bg-slate-950 text-slate-100'} selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans transition-colors duration-200`}>
      {/* Dynamic Midnight Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-landing-glow" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none animate-landing-glow" />
      <div className="absolute bottom-10 left-1/3 w-[550px] h-[550px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none animate-landing-glow" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-14 md:pt-16 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Local Spreadsheet Analytics</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Turn spreadsheets into{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-teal-300 bg-clip-text text-transparent">
                interactive dashboards.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-normal">
              Upload CSV or Excel workbooks, inspect raw column structures, configure custom KPI aggregations, and explore rich visual charts—all processed safely inside your local browser.
            </p>

            {/* Premium AI Data Intake Console */}
            <div className="pt-2">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300 border ${
                  isParsing
                    ? 'bg-indigo-950/60 border-indigo-500/50 shadow-xl shadow-indigo-500/10 cursor-wait'
                    : isDragging 
                    ? 'bg-indigo-950/80 border-indigo-400 scale-[1.01] shadow-2xl shadow-indigo-500/30' 
                    : 'bg-slate-900/90 border-slate-800/90 hover:border-indigo-500/40 shadow-xl backdrop-blur-xl'
                }`}
              >
                {/* Low-contrast Console Digital Grid Overlay */}
                <div className="absolute inset-0 console-grid-pattern opacity-40 pointer-events-none" />

                {/* Subtle CSS Scanning Glow Line */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-indigo-500/10 via-teal-500/5 to-transparent pointer-events-none animate-console-scan" />

                {/* Hidden Native File Input */}
                <input
                  type="file"
                  ref={activeFileInputRef}
                  onChange={handleFileChange}
                  accept=".csv, .xlsx, .xls"
                  className="hidden"
                  disabled={isParsing}
                />

                {/* Panel Content */}
                <div className="relative z-10 space-y-4">
                  
                  {/* Console Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-console-pulse" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                      </span>
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-indigo-300">
                        DATA INTAKE CONSOLE
                      </span>
                    </div>

                    {/* Format Chips */}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/80">CSV</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/80">XLSX</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/80">XLS</span>
                    </div>
                  </div>

                  {/* Main Console Body */}
                  <div className="space-y-1 text-left">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {isDragging ? 'Drop file to inspect data' : 'Upload your spreadsheet'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      CSV, XLSX, or XLS • Processed locally in your browser
                    </p>
                  </div>

                  {/* Primary & Secondary Action Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={isParsing}
                      onClick={() => !isParsing && activeFileInputRef.current?.click()}
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                    >
                      {isParsing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
                      <span>{isParsing ? statusMessage : 'Browse File'}</span>
                    </button>

                    <a
                      href="#samples"
                      onClick={handleScrollToSamples}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-slate-700/80 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                    >
                      <span>Try a demo dataset</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>

                  {/* Privacy Badge Footer inside panel */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Local processing • No cloud upload</span>
                    </span>
                    <span className="hidden sm:inline-block text-slate-500 font-mono text-[10px]">
                      PapaParse & SheetJS Engine
                    </span>
                  </div>

                  {/* Inline Parsing Error / Retry Controls */}
                  {displayError && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{displayError}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {lastUploadedFile && onRetry && (
                          <button
                            type="button"
                            onClick={onRetry}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                          >
                            Retry File
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (clearError) clearError();
                            setDragError(null);
                            activeFileInputRef.current?.click();
                          }}
                          className="px-2.5 py-1 bg-slate-900 border border-rose-700/80 hover:bg-slate-800 text-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Choose Another File
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" /> No server uploads
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" /> 100% Free & Open
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" /> Instant PDF Report
              </span>
            </div>
          </div>

          {/* Right CSS-only Animated Dashboard Visualization */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Decorative Glow Ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-teal-500/30 rounded-2xl blur-xl opacity-75" />

              {/* Glass Visual Workspace Mockup */}
              <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-2xl p-5 space-y-4 overflow-hidden">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">Quarterly_Financials.xlsx</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-950/80 text-teal-300 border border-teal-800/60">
                    50,000 Rows Safe
                  </span>
                </div>

                {/* Animated Mini KPI Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 animate-landing-float">
                    <p className="text-[11px] font-medium text-slate-400">Total Revenue</p>
                    <p className="text-lg font-bold text-white tracking-tight mt-0.5">$1,248,500</p>
                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full w-[78%]" />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 animate-landing-float-delayed">
                    <p className="text-[11px] font-medium text-slate-400">Profit Margin</p>
                    <p className="text-lg font-bold text-teal-300 tracking-tight mt-0.5">34.2%</p>
                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-teal-400 h-full w-[64%]" />
                    </div>
                  </div>
                </div>

                {/* CSS Animated Bar Graphic */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Category Sales Breakdown</span>
                    <span className="text-[10px] text-indigo-400 font-mono">Live Visual Canvas</span>
                  </div>
                  <div className="h-28 flex items-end justify-between gap-2 pt-2 px-2 border-b border-slate-700/60">
                    <div className="w-1/5 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md animate-bar-1" />
                    <div className="w-1/5 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-md animate-bar-2" />
                    <div className="w-1/5 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md animate-bar-3" />
                    <div className="w-1/5 bg-gradient-to-t from-indigo-600 to-teal-400 rounded-t-md animate-bar-1" />
                    <div className="w-1/5 bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t-md animate-bar-2" />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Q1 Tech</span>
                    <span>Q2 Retail</span>
                    <span>Q3 SaaS</span>
                    <span>Q4 Energy</span>
                    <span>Q4 Auto</span>
                  </div>
                </div>

                {/* Floating Node Badge */}
                <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Sensitive Value Masking Active
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-800/60 rounded-md">
                    PapaParse Engine
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Sample Datasets Section */}
      <section id="samples" className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16 border-t border-slate-800/80">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">Try a Sample Dataset</h3>
              <p className="text-xs text-slate-400">Select a pre-loaded sample spreadsheet to immediately preview data and explore the dashboard workspace</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 rounded-lg self-start sm:self-auto">
              3 Sample Spreadsheets Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(SAMPLE_DATASETS).map((dataset) => (
              <div
                key={dataset.id}
                onClick={() => !isParsing && onSelectDataset(dataset)}
                className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between group shadow-lg ${
                  isParsing ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500/60 hover:bg-slate-900 cursor-pointer hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                      {dataset.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {dataset.fileSize}
                    </span>
                  </div>

                  <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between tracking-tight text-sm">
                    <span>{dataset.displayName}</span>
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {dataset.description}
                  </p>

                  <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>{dataset.rowCount.toLocaleString()} rows</span>
                    <span>•</span>
                    <span>{dataset.columnCount} columns</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Load Sample & Inspect</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Capability Strip */}
      <section className="border-y border-slate-800/80 bg-slate-900/50 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors">
            <FileSpreadsheet className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">CSV, XLSX & XLS</h3>
            <p className="text-xs text-slate-400 mt-1">Multi-sheet support up to 25MB</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors">
            <ShieldCheck className="w-6 h-6 text-teal-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">Local Browser Processing</h3>
            <p className="text-xs text-slate-400 mt-1">Zero server data transmission</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors">
            <BarChart2 className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">Interactive Charts & PDF</h3>
            <p className="text-xs text-slate-400 mt-1">KPIs, trends & print reports</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors">
            <Lock className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">Sensitive-Value Controls</h3>
            <p className="text-xs text-slate-400 mt-1">On-demand data privacy masking</p>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Streamlined Workflow</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How It Works</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Go from raw spreadsheet rows to executive visual analytics in three straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 group space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center font-extrabold text-lg group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-slate-700 group-hover:text-indigo-400 transition-colors">01</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">Upload your file</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Select or drag any CSV, XLSX, or XLS file up to 25MB. Seamlessly switch between Excel worksheets or select custom header rows.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/50 transition-all duration-200 group space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-violet-950 text-violet-400 border border-violet-800/60 flex items-center justify-center font-extrabold text-lg group-hover:scale-105 transition-transform">
                <Eye className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-slate-700 group-hover:text-violet-400 transition-colors">02</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">Inspect your data</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Verify row counts, audit column data types, filter out unneeded columns, and review raw data previews before dashboard building.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/50 transition-all duration-200 group space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/60 flex items-center justify-center font-extrabold text-lg group-hover:scale-105 transition-transform">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-slate-700 group-hover:text-teal-400 transition-colors">03</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">Explore your dashboard</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Interact with KPI cards, category breakdowns, time trends, active filter chips, chart focus mode, 4 theme presets, and print PDF reports.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">Core Engine Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Built for Spreadsheet Analysts</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every feature is designed specifically for fast, responsive, and private data exploration in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-200 space-y-3">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">KPI Setup & Aggregations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose primary metrics and calculate Sum, Average, or Count grouped by categorical and date dimensions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/40 hover:bg-slate-900 transition-all duration-200 space-y-3">
            <Maximize2 className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Chart Focus Expand Mode</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Expand any active visual card into a full focus mode modal with detailed hover tooltips and keyboard support.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900 transition-all duration-200 space-y-3">
            <Layers className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Worksheet & Header Selector</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switch multi-sheet Excel files effortlessly and select non-standard header row starting indexes.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-200 space-y-3">
            <Filter className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Active Filter Inspector</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filter by category, date range, or search query with live active filter chips and one-click clear actions.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900 transition-all duration-200 space-y-3">
            <Table className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Data Volume Guardrails</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Protects browser responsiveness with a 50,000 max row / 500,000 cell guardrail and safe error recovery.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/40 hover:bg-slate-900 transition-all duration-200 space-y-3">
            <Lock className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Sensitive Value Masking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mask sensitive values or figures across KPI cards, chart labels, and print exports for privacy.
            </p>
          </div>

          {/* Feature 7 */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-200 space-y-3">
            <Download className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">CSV & Executive PDF Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export filtered datasets to CSV or print executive multi-page PDF reports formatted for presentation.
            </p>
          </div>

          {/* Feature 8 */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900 transition-all duration-200 space-y-3">
            <Palette className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">4 Theme Presets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switch themes between Midnight Indigo, Ocean Blue, Emerald Graphite, and Pearl Light.
            </p>
          </div>

        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/60 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">100% In-Browser Privacy Architecture</h2>
              <p className="text-xs text-slate-400">Strict local processing and privacy controls</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> Zero Server Storage
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Files are parsed client-side using PapaParse and SheetJS. No dataset content is transmitted to external servers.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> Deterministic Rules Engine
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No live AI API credentials are required. Smart column suggestions use local heuristic scoring algorithms.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> On-Demand Masking
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toggle sensitive value masking at any time to obscure confidential figures during live reviews or PDF exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="relative rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-teal-950/80 border border-slate-800 shadow-2xl overflow-hidden space-y-6">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to explore your data?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Transform your raw spreadsheets into executive-ready visual insights in seconds.
          </p>

          <div className="pt-2">
            <button
              type="button"
              disabled={isParsing}
              onClick={() => !isParsing && activeFileInputRef.current?.click()}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] inline-flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Browse File</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
