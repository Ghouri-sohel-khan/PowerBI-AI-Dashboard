import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Star, 
  Filter, 
  RotateCcw, 
  Sparkles, 
  Search, 
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import CustomDashboard from './CustomDashboard';

export default function DashboardScreen({ dataset, onChangeDataset, onBackToPreview, onSelectWorksheet }) {
  const currentDataset = dataset || SAMPLE_DATASETS.ecommerce;

  // Filter States
  const [selectedTimeRange, setSelectedTimeRange] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(true);

  // Table pagination state
  const [tablePage, setTablePage] = useState(1);
  const rowsPerPage = 5;

  // Route schema-based datasets (custom uploads or sample datasets without preset monthlyTrend arrays) to CustomDashboard
  const isSchemaDataset = Boolean(
    currentDataset.isCustomFile || 
    currentDataset.isParsed || 
    !currentDataset.monthlyTrend
  );

  if (isSchemaDataset) {
    const hasValidRowsAndCols = Boolean(
      Array.isArray(currentDataset.columns) && 
      currentDataset.columns.length > 0 && 
      Array.isArray(currentDataset.previewRows)
    );

    if (hasValidRowsAndCols) {
      return (
        <CustomDashboard 
          dataset={currentDataset} 
          onBackToPreview={onBackToPreview || (() => onChangeDataset(SAMPLE_DATASETS.ecommerce))} 
          onSelectWorksheet={onSelectWorksheet}
        />
      );
    }

    // Clear error fallback if dataset lacks both preset visuals and schema columns/rows
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-2xl shadow-xs space-y-4 text-center">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Dashboard Render Error</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          The selected dataset ("{currentDataset.displayName || currentDataset.name || 'Unknown'}") cannot be rendered because it is missing both preset dashboard visualizations and spreadsheet schema columns/rows.
        </p>
        <button
          onClick={onBackToPreview || (() => onChangeDataset(SAMPLE_DATASETS.ecommerce))}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center space-x-1.5"
        >
          <span>← Return to Data Preview</span>
        </button>
      </div>
    );
  }

  const handleResetFilters = () => {
    setSelectedTimeRange('All');
    setSelectedCategory('All');
    setSelectedRegion('All');
    setSearchQuery('');
    setTablePage(1);
  };

  // Live filter mock calculation on sample rows
  const filteredRows = currentDataset.previewRows.filter(row => {
    if (selectedCategory !== 'All' && row.category !== selectedCategory) return false;
    if (selectedRegion !== 'All' && row.region !== selectedRegion) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = Object.values(row).some(v => String(v).toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

  const totalTablePages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedTableRows = filteredRows.slice((tablePage - 1) * rowsPerPage, tablePage * rowsPerPage);

  const categoriesList = Array.from(new Set(currentDataset.previewRows.map(r => r.category)));
  const regionsList = Array.from(new Set(currentDataset.previewRows.map(r => r.region)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Power BI Inspired Workspace Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                Active Dataset: {currentDataset.displayName}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                Phase 1 Mock Analytics
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Executive Analytics Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Interactive visual breakdown of revenue trends, regional performance, and row details
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Dataset Selector Dropdown */}
            <select
              value={currentDataset.id}
              onChange={(e) => {
                const target = SAMPLE_DATASETS[e.target.value];
                if (target) onChangeDataset(target);
              }}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {Object.values(SAMPLE_DATASETS).map(ds => (
                <option key={ds.id} value={ds.id}>
                  Switch: {ds.displayName}
                </option>
              ))}
            </select>

            <button 
              onClick={() => alert('Phase 1 Preview: Exporting report bundle to PDF/Excel will be available in Phase 2 backend release.')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Mock AI Executive Summary Banner */}
        {showAiPanel && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white relative shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shrink-0 mt-0.5 text-teal-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                      Mock AI Executive Insight
                    </span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-mono">
                      Phase 1 Preview
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
                    {currentDataset.aiInsights[0]?.text || 'Strong positive sales trajectory observed with sustained margin expansions.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAiPanel(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Interactive Filter Toolbar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mr-2">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dashboard Filters:</span>
            </div>

            {/* Date Range Filter */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Timeframes</option>
              <option value="Q1">Q1 2025</option>
              <option value="Q2">Q2 2025</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setTablePage(1);
              }}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories ({categoriesList.length})</option>
              {categoriesList.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setTablePage(1);
              }}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Regions ({regionsList.length})</option>
              {regionsList.map((reg, i) => (
                <option key={i} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {(selectedCategory !== 'All' || selectedRegion !== 'All' || selectedTimeRange !== 'All' || searchQuery !== '') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}

            <span className="text-xs text-slate-400 font-mono">
              Filtered: {filteredRows.length} items
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Revenue / Metric</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {currentDataset.kpis.totalRevenue}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs font-semibold text-teal-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{currentDataset.kpis.revenueChange}</span>
              <span className="text-slate-400 font-normal">vs target</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Orders / Volume</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {currentDataset.kpis.totalOrders}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs font-semibold text-teal-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{currentDataset.kpis.ordersChange}</span>
              <span className="text-slate-400 font-normal">processed</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Average Unit Metric (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {currentDataset.kpis.avgOrderValue}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs font-semibold text-teal-600">
              <span>{currentDataset.kpis.aovChange}</span>
              <span className="text-slate-400 font-normal">efficiency</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Customer Satisfaction</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {currentDataset.kpis.avgRating}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs font-semibold text-amber-600">
              <span>{currentDataset.kpis.ratingTrend}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Time Trend Area Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Revenue & Profit Trend</h3>
              <p className="text-xs text-slate-500">Time-series performance overview across 2025</p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              Line / Area Chart
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentDataset.monthlyTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" name="Net Profit ($)" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Comparison Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Revenue by Category</h3>
              <p className="text-xs text-slate-500">Comparative breakdown of product/service segments</p>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
              Bar Chart
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentDataset.categoryComparison} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" name="Category Revenue ($)" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Category Profit ($)" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Regional Distribution Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Regional Market Share</h3>
              <p className="text-xs text-slate-500">Geographic revenue distribution percentage</p>
            </div>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
              Donut Chart
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentDataset.regionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {currentDataset.regionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val, name, entry) => [`${val}% (${entry.payload.amount})`, entry.payload.name]}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle" 
                  wrapperStyle={{ fontSize: '11px', paddingLeft: '10px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Key Insights & Recommendations List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Automated Insight Summary</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Phase 1 Preview</span>
            </div>

            <div className="mt-4 space-y-3">
              {currentDataset.aiInsights.map((insight, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-indigo-700 block">
                    ⚡ {insight.title}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Powered by Mock AI Analytics Engine</span>
            <span>Confidence: 96%</span>
          </div>
        </div>
      </div>

      {/* Detail Record Table with Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Detailed Record Table</h3>
            <p className="text-xs text-slate-500">Filtered view of underlying spreadsheet records</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search record table..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setTablePage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                {currentDataset.columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {paginatedTableRows.length > 0 ? (
                paginatedTableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="table-row-stripe transition-colors">
                    <td className="px-4 py-3 font-mono text-indigo-600 font-medium">{row.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{row.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{row.region}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-teal-700 font-medium">
                      ${row.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 font-mono">{row.quantity}</td>
                    <td className="px-4 py-3 text-amber-600 font-medium">{row.rating} ★</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={currentDataset.columns.length} className="px-4 py-8 text-center text-slate-500">
                    No records match the active filter criteria. Try clearing filters or search terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <span>
            Showing {paginatedTableRows.length} of {filteredRows.length} filtered rows
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTablePage(p => Math.max(p - 1, 1))}
              disabled={tablePage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {tablePage} of {totalTablePages}
            </span>
            <button
              onClick={() => setTablePage(p => Math.min(p + 1, totalTablePages))}
              disabled={tablePage === totalTablePages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
