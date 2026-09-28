import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  Layers, 
  Table as TableIcon, 
  Filter, 
  RotateCcw, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Hash,
  Download,
  Sparkles,
  Check,
  Bookmark,
  FolderInput,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  Palette,
  Maximize2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { isNonAggregatableColumnName, isSensitiveColumnName, maskSensitiveValue } from '../utils/fileParser';

/**
 * Utility function to compare two values for sort order.
 * Sorts numbers numerically, dates chronologically, strings alphabetically.
 * Blank/empty values are always placed at the end regardless of sort direction.
 */
function compareValues(aRaw, bRaw, sortDirection, columnType) {
  const isNullOrEmpty = (val) => val === null || val === undefined || String(val).trim() === '';

  const aEmpty = isNullOrEmpty(aRaw);
  const bEmpty = isNullOrEmpty(bRaw);

  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;

  let cmp = 0;
  const aStr = String(aRaw).trim();
  const bStr = String(bRaw).trim();

  const aClean = aStr.replace(/[$,]/g, '');
  const bClean = bStr.replace(/[$,]/g, '');
  const aNum = Number(aClean);
  const bNum = Number(bClean);
  const isBothNumeric = !isNaN(aNum) && !isNaN(bNum) && aClean.length > 0 && bClean.length > 0;

  if (columnType === 'Numeric' || columnType === 'Currency' || isBothNumeric) {
    if (isBothNumeric) {
      cmp = aNum - bNum;
    } else {
      cmp = aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
    }
  } else if (columnType === 'Date') {
    const aDateMs = Date.parse(aStr);
    const bDateMs = Date.parse(bStr);
    const isBothDate = !isNaN(aDateMs) && !isNaN(bDateMs);
    if (isBothDate) {
      cmp = aDateMs - bDateMs;
    } else {
      cmp = aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
    }
  } else {
    const aDateMs = Date.parse(aStr);
    const bDateMs = Date.parse(bStr);
    const isBothDate = !isNaN(aDateMs) && !isNaN(bDateMs) && /[-/.\s]/.test(aStr) && /[-/.\s]/.test(bStr) && aStr.length > 5;

    if (isBothNumeric) {
      cmp = aNum - bNum;
    } else if (isBothDate) {
      cmp = aDateMs - bDateMs;
    } else {
      cmp = aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
    }
  }

  return sortDirection === 'asc' ? cmp : -cmp;
}

/**
 * Derive stable storage key for dataset configuration, scoped by file identity, worksheet name, and header row index
 */
function getSetupStorageKey(dataset) {
  if (!dataset || (!dataset.name && !dataset.displayName)) return null;
  const namePart = String(dataset.name || dataset.displayName).trim().toLowerCase();
  const sheetPart = dataset.selectedSheet ? String(dataset.selectedSheet).trim().toLowerCase() : '';
  const headerPart = dataset.headerRowIndex ? `header${dataset.headerRowIndex}` : 'header1';
  const sizePart = String(dataset.fileSize || '').trim();
  const rawKey = `${namePart}_${sheetPart}_${headerPart}_${sizePart}`;
  const safeSlug = rawKey.replace(/[^a-z0-9_]/g, '_');
  return `dashboard_setup_${safeSlug}`;
}

/**
 * Centralized Dashboard Theme Preset Tokens (Phase 25)
 */
const THEME_PRESETS = {
  'Midnight Indigo': {
    id: 'Midnight Indigo',
    name: 'Midnight Indigo',
    isDark: true,
    swatch: { bg: '#0f172a', card: '#1e293b', accent: '#6366f1' },
    bgClass: 'bg-slate-950 text-slate-100',
    cardBg: 'bg-slate-900/95 border-slate-800',
    cardHeaderBorder: 'border-slate-800',
    panelBg: 'bg-slate-900/95 border-slate-800',
    panelSectionBg: 'bg-slate-950/60 border-slate-800',
    inputBg: 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500',
    buttonSecondaryBg: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700',
    accentText: 'text-indigo-400',
    accentBg: 'bg-indigo-950/60 border-indigo-800/60 text-indigo-300',
    kpiBorder: 'border-slate-800 hover:border-indigo-500/50',
    kpiGlow: 'shadow-indigo-500/5',
    tableHeaderBg: 'bg-slate-800/80 text-slate-200 border-slate-700',
    tableRowEven: 'bg-slate-900/60',
    tableRowOdd: 'bg-slate-800/20',
    tableRowHover: 'hover:bg-slate-800/60',
    tableBorder: 'border-slate-800',
    tableDivide: 'divide-slate-800',
    mutedText: 'text-slate-400',
    subtleText: 'text-slate-300',
    headerText: 'text-white',
    chartGrid: '#334155',
    chartAxis: '#94a3b8',
    chartTooltipBg: '#1e293b',
    chartTooltipBorder: '#475569',
    chartTooltipText: '#ffffff',
    barFill: '#6366f1',
    lineStroke: '#818cf8',
    piePalette: ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6']
  },
  'Ocean Blue': {
    id: 'Ocean Blue',
    name: 'Ocean Blue',
    isDark: true,
    swatch: { bg: '#0b192c', card: '#1e2e4a', accent: '#06b6d4' },
    bgClass: 'bg-[#070f1e] text-slate-100',
    cardBg: 'bg-[#0f1d33]/95 border-[#1e304d]',
    cardHeaderBorder: 'border-[#1e304d]',
    panelBg: 'bg-[#0f1d33]/95 border-[#1e304d]',
    panelSectionBg: 'bg-[#081326]/60 border-[#1e304d]',
    inputBg: 'bg-[#0b182d] border-[#1e355b] text-slate-100 placeholder-slate-500 focus:border-cyan-500',
    buttonSecondaryBg: 'bg-[#182945] hover:bg-[#20365b] text-slate-200 border-[#243d66]',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300',
    kpiBorder: 'border-[#1e304d] hover:border-cyan-500/50',
    kpiGlow: 'shadow-cyan-500/5',
    tableHeaderBg: 'bg-[#162744] text-slate-200 border-[#20375d]',
    tableRowEven: 'bg-[#0d1a2f]',
    tableRowOdd: 'bg-[#13223d]',
    tableRowHover: 'hover:bg-[#1b2f52]',
    tableBorder: 'border-[#1e304d]',
    tableDivide: 'divide-[#1e304d]',
    mutedText: 'text-cyan-200/60',
    subtleText: 'text-slate-300',
    headerText: 'text-white',
    chartGrid: '#1e355b',
    chartAxis: '#7dd3fc',
    chartTooltipBg: '#091427',
    chartTooltipBorder: '#1e355b',
    chartTooltipText: '#f0f9ff',
    barFill: '#0284c7',
    lineStroke: '#38bdf8',
    piePalette: ['#0284c7', '#06b6d4', '#3b82f6', '#0d9488', '#f59e0b', '#6366f1', '#14b8a6', '#38bdf8']
  },
  'Emerald Graphite': {
    id: 'Emerald Graphite',
    name: 'Emerald Graphite',
    isDark: true,
    swatch: { bg: '#121816', card: '#1c2421', accent: '#10b981' },
    bgClass: 'bg-[#0d1210] text-emerald-50',
    cardBg: 'bg-[#161e1b]/95 border-[#23312c]',
    cardHeaderBorder: 'border-[#23312c]',
    panelBg: 'bg-[#161e1b]/95 border-[#23312c]',
    panelSectionBg: 'bg-[#0e1412]/60 border-[#23312c]',
    inputBg: 'bg-[#101714] border-[#253630] text-emerald-50 placeholder-emerald-700/60 focus:border-emerald-500',
    buttonSecondaryBg: 'bg-[#1d2925] hover:bg-[#273832] text-emerald-100 border-[#2c3f38]',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300',
    kpiBorder: 'border-[#23312c] hover:border-emerald-500/50',
    kpiGlow: 'shadow-emerald-500/5',
    tableHeaderBg: 'bg-[#1e2c27] text-emerald-100 border-[#2a3e37]',
    tableRowEven: 'bg-[#121a17]',
    tableRowOdd: 'bg-[#18231f]',
    tableRowHover: 'hover:bg-[#202f2a]',
    tableBorder: 'border-[#23312c]',
    tableDivide: 'divide-[#23312c]',
    mutedText: 'text-emerald-300/60',
    subtleText: 'text-emerald-200/80',
    headerText: 'text-white',
    chartGrid: '#253630',
    chartAxis: '#6ee7b7',
    chartTooltipBg: '#0b110f',
    chartTooltipBorder: '#253630',
    chartTooltipText: '#ecfdf5',
    barFill: '#059669',
    lineStroke: '#34d399',
    piePalette: ['#059669', '#0d9488', '#10b981', '#06b6d4', '#84cc16', '#3b82f6', '#f59e0b', '#2dd4bf']
  },
  'Pearl Light': {
    id: 'Pearl Light',
    name: 'Pearl Light',
    isDark: false,
    swatch: { bg: '#f8fafc', card: '#ffffff', accent: '#4f46e5' },
    bgClass: 'bg-slate-50 text-slate-900',
    cardBg: 'bg-white border-slate-200 shadow-xs',
    cardHeaderBorder: 'border-slate-100',
    panelBg: 'bg-white/95 border-slate-200 shadow-xs',
    panelSectionBg: 'bg-slate-50/80 border-slate-200/80',
    inputBg: 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500',
    buttonSecondaryBg: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300',
    accentText: 'text-indigo-600',
    accentBg: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    kpiBorder: 'border-slate-200 hover:border-indigo-400',
    kpiGlow: 'shadow-slate-200/50',
    tableHeaderBg: 'bg-slate-100 text-slate-700 border-slate-200',
    tableRowEven: 'bg-white',
    tableRowOdd: 'bg-slate-50/50',
    tableRowHover: 'hover:bg-slate-100/70',
    tableBorder: 'border-slate-200',
    tableDivide: 'divide-slate-200',
    mutedText: 'text-slate-500',
    subtleText: 'text-slate-600',
    headerText: 'text-slate-900',
    chartGrid: '#e2e8f0',
    chartAxis: '#64748b',
    chartTooltipBg: '#ffffff',
    chartTooltipBorder: '#cbd5e1',
    chartTooltipText: '#0f172a',
    barFill: '#4f46e5',
    lineStroke: '#6366f1',
    piePalette: ['#4f46e5', '#0284c7', '#0d9488', '#16a34a', '#d97706', '#db2777', '#7c3aed', '#2563eb']
  }
};

/**
 * Validate and migrate saved theme preferences
 */
function getValidatedTheme(savedValue) {
  if (!savedValue) return 'Midnight Indigo';
  if (savedValue === 'light') return 'Pearl Light';
  if (savedValue === 'dark') return 'Midnight Indigo';
  if (THEME_PRESETS[savedValue]) return savedValue;
  return 'Midnight Indigo';
}

/**
 * Custom Data-Driven Dashboard for Parsed Spreadsheets (Phase 3)
 */
export default function CustomDashboard({ dataset, onBackToPreview }) {
  // Sensitive values reveal state (memory-only in React state, default: Hidden)
  const [showSensitiveValues, setShowSensitiveValues] = useState(false);

  // Sticky Dashboard Controls & Inspector Panel UX (Phase 23 & 26A)
  const [showSuggestedVisuals, setShowSuggestedVisuals] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Chart Focus / Expand Mode State (Phase 26B)
  const [focusedChart, setFocusedChart] = useState(null); // null | 'distribution' | 'category' | 'timeTrend'

  // Handle body scroll lock and Escape key listener for Chart Focus Modal
  useEffect(() => {
    if (!focusedChart) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setFocusedChart(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedChart]);

  // Find available column options by type (excluding contact numbers / IDs / sensitive columns)
  const numericColumns = useMemo(() => 
    (dataset.columns || []).filter(c => 
      (c.type === 'Numeric' || c.type === 'Currency') && 
      !isNonAggregatableColumnName(c.name) &&
      !isSensitiveColumnName(c.name)
    ),
    [dataset.columns]
  );

  const categoryColumns = useMemo(() => 
    (dataset.columns || []).filter(c => 
      (c.type === 'Categorical' || c.type === 'String') &&
      !isNonAggregatableColumnName(c.name) &&
      !isSensitiveColumnName(c.name)
    ),
    [dataset.columns]
  );

  const dateColumns = useMemo(() => 
    (dataset.columns || []).filter(c => c.type === 'Date'),
    [dataset.columns]
  );

  // Filterable categorical columns (excludes phone numbers, IDs, postal codes, sensitive data, and high-cardinality person-name or unique text columns)
  const suitableCategoryColumns = useMemo(() => {
    const rows = dataset.previewRows || [];
    return (dataset.columns || []).filter(c => {
      if (isNonAggregatableColumnName(c.name) || isSensitiveColumnName(c.name)) return false;
      if (c.type !== 'Categorical' && c.type !== 'String') return false;
      
      const uniqueVals = new Set(
        rows.map(r => String(r[c.name] || '').trim()).filter(Boolean)
      );
      if (uniqueVals.size === 0) return false;

      // Do not offer person-name columns as filter dropdowns when most values are unique
      const isNameColumn = /name/i.test(c.name) || /person/i.test(c.name) || /customer/i.test(c.name);
      if (isNameColumn && uniqueVals.size > 10) return false;

      // Exclude high-cardinality unique record text identifiers
      if (uniqueVals.size > 30 || uniqueVals.size > Math.max(15, Math.floor(rows.length * 0.4))) return false;

      return true;
    });
  }, [dataset.columns, dataset.previewRows]);

  // Pre-calculated unique options for each suitable categorical column
  const categoryColumnOptions = useMemo(() => {
    const map = {};
    const rows = dataset.previewRows || [];
    suitableCategoryColumns.forEach(c => {
      const vals = Array.from(
        new Set(rows.map(r => String(r[c.name] || '').trim()).filter(Boolean))
      ).sort();
      map[c.name] = vals;
    });
    return map;
  }, [suitableCategoryColumns, dataset.previewRows]);

  // Setup state selection (defaults to None for optional grouping)
  const [selectedKpiCol, setSelectedKpiCol] = useState(
    numericColumns.length > 0 ? numericColumns[0].name : 'None'
  );
  const [selectedAggregation, setSelectedAggregation] = useState('Sum'); // 'Sum' | 'Average' | 'Minimum' | 'Maximum'
  const [selectedCategoryCol, setSelectedCategoryCol] = useState('None');
  const [selectedDateCol, setSelectedDateCol] = useState('None');
  const [categoryChartType, setCategoryChartType] = useState('Bar'); // 'Bar' | 'Column' | 'Donut'
  const [dateGroupingPeriod, setDateGroupingPeriod] = useState('Month'); // 'Day' | 'Month' | 'Year'

  // Interactive Filter States (defaults set to 'All' / empty date bounds)
  const [categoryFilters, setCategoryFilters] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Search and Pagination for Detail Table
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Sort State for Detail Table
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Detail Table & PDF Report Column Visibility State (Phase 15: default all visible, not persisted)
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const initial = {};
    (dataset.columns || []).forEach(c => {
      initial[c.name] = true;
    });
    return initial;
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const visibleColumnList = useMemo(() => {
    return (dataset.columns || []).filter(c => visibleColumns[c.name] !== false);
  }, [dataset.columns, visibleColumns]);

  const toggleColumnVisibility = (colName) => {
    setVisibleColumns(prev => {
      const isCurrentlyVisible = prev[colName] !== false;
      const currentVisibleCount = (dataset.columns || []).filter(c => prev[c.name] !== false).length;

      // Keep at least one column visible
      if (isCurrentlyVisible && currentVisibleCount <= 1) {
        return prev;
      }

      return {
        ...prev,
        [colName]: !isCurrentlyVisible
      };
    });
  };

  const handleSelectAllColumns = () => {
    const next = {};
    (dataset.columns || []).forEach(c => {
      next[c.name] = true;
    });
    setVisibleColumns(next);
  };

  const handleResetColumns = () => {
    const next = {};
    (dataset.columns || []).forEach(c => {
      next[c.name] = true;
    });
    setVisibleColumns(next);
  };

  const handleSort = (colName) => {
    if (sortColumn === colName) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Dashboard Theme Preference State (Restored from localStorage, defaults to 'Midnight Indigo')
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboard_theme_preference');
      return getValidatedTheme(saved);
    } catch (err) {
      console.warn('Failed to read theme preference from localStorage:', err);
      return 'Midnight Indigo';
    }
  });

  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const selectTheme = (themeId) => {
    const validTheme = getValidatedTheme(themeId);
    setTheme(validTheme);
    try {
      localStorage.setItem('dashboard_theme_preference', validTheme);
    } catch (e) {
      console.warn('Failed to persist theme preference:', e);
    }
  };

  const t = THEME_PRESETS[theme] || THEME_PRESETS['Midnight Indigo'];
  const isDark = t.isDark;

  // LocalStorage Dashboard Setup Initial Check
  const initialSetupInfo = useMemo(() => {
    const storageKey = getSetupStorageKey(dataset);
    if (!storageKey) return null;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          let dateStr = null;
          if (parsed.savedAt) {
            const dateObj = new Date(parsed.savedAt);
            if (!isNaN(dateObj.getTime())) {
              dateStr = dateObj.toLocaleString();
            }
          }
          return { parsed, dateStr };
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved dashboard setup:', err);
    }
    return null;
  }, [dataset]);

  const [hasSavedSetup, setHasSavedSetup] = useState(Boolean(initialSetupInfo));
  const [savedSetupDate, setSavedSetupDate] = useState(initialSetupInfo?.dateStr || null);
  const [setupStatusMessage, setSetupStatusMessage] = useState(
    initialSetupInfo
      ? { type: 'info', text: 'Saved setup detected for this dataset. Click "Restore Setup" to apply your saved configuration.' }
      : null
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveSetup = () => {
    const storageKey = getSetupStorageKey(dataset);
    if (!storageKey) {
      setSetupStatusMessage({ type: 'error', text: 'Cannot save setup: dataset identity not recognized.' });
      return;
    }

    const payload = {
      selectedKpiCol,
      selectedAggregation,
      selectedCategoryCol,
      categoryChartType,
      selectedDateCol,
      dateGroupingPeriod,
      categoryFilters,
      startDate,
      endDate,
      searchQuery,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setHasSavedSetup(true);
      const dateObj = new Date(payload.savedAt);
      setSavedSetupDate(dateObj.toLocaleString());
      setShowClearConfirm(false);
      setSetupStatusMessage({
        type: 'success',
        text: 'Dashboard setup saved successfully to browser storage.'
      });
    } catch (err) {
      console.error('Error saving dashboard setup:', err);
      setSetupStatusMessage({
        type: 'error',
        text: 'Failed to save setup to browser localStorage.'
      });
    }
  };

  const handleRestoreSetup = () => {
    const storageKey = getSetupStorageKey(dataset);
    if (!storageKey) return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setSetupStatusMessage({ type: 'error', text: 'No saved setup found for this dataset.' });
        return;
      }

      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') {
        setSetupStatusMessage({ type: 'error', text: 'Saved setup data is invalid or corrupted.' });
        return;
      }

      // Validate KPI Column
      const numColNames = numericColumns.map(c => c.name);
      if (saved.selectedKpiCol === 'None' || numColNames.includes(saved.selectedKpiCol)) {
        setSelectedKpiCol(saved.selectedKpiCol);
      } else {
        setSelectedKpiCol(numColNames.length > 0 ? numColNames[0] : 'None');
      }

      // Validate Aggregation Method
      if (['Sum', 'Average', 'Minimum', 'Maximum'].includes(saved.selectedAggregation)) {
        setSelectedAggregation(saved.selectedAggregation);
      } else {
        setSelectedAggregation('Sum');
      }

      // Validate Category Column
      const catColNames = categoryColumns.map(c => c.name);
      if (saved.selectedCategoryCol === 'None' || catColNames.includes(saved.selectedCategoryCol)) {
        setSelectedCategoryCol(saved.selectedCategoryCol);
      } else {
        setSelectedCategoryCol('None');
      }

      // Validate Chart Type
      if (['Bar', 'Column', 'Donut'].includes(saved.categoryChartType)) {
        setCategoryChartType(saved.categoryChartType);
      } else {
        setCategoryChartType('Bar');
      }

      // Validate Date Column
      const dateColNames = dateColumns.map(c => c.name);
      if (saved.selectedDateCol === 'None' || dateColNames.includes(saved.selectedDateCol)) {
        setSelectedDateCol(saved.selectedDateCol);
      } else {
        setSelectedDateCol('None');
      }

      // Validate Date Grouping Period
      if (['Day', 'Month', 'Year'].includes(saved.dateGroupingPeriod)) {
        setDateGroupingPeriod(saved.dateGroupingPeriod);
      } else {
        setDateGroupingPeriod('Month');
      }

      // Validate Category Filters against dataset suitable category columns and options
      const validCategoryFilters = {};
      const suitCatColNames = suitableCategoryColumns.map(c => c.name);
      if (saved.categoryFilters && typeof saved.categoryFilters === 'object') {
        Object.entries(saved.categoryFilters).forEach(([col, val]) => {
          if (suitCatColNames.includes(col)) {
            const validOptions = categoryColumnOptions[col] || [];
            if (val === 'All' || validOptions.includes(val)) {
              validCategoryFilters[col] = val;
            }
          }
        });
      }
      setCategoryFilters(validCategoryFilters);

      // Validate Date Range
      const validStartDate = typeof saved.startDate === 'string' && (saved.startDate === '' || !isNaN(Date.parse(saved.startDate)))
        ? saved.startDate
        : '';
      const validEndDate = typeof saved.endDate === 'string' && (saved.endDate === '' || !isNaN(Date.parse(saved.endDate)))
        ? saved.endDate
        : '';
      setStartDate(validStartDate);
      setEndDate(validEndDate);

      // Validate Search Query
      const validSearch = typeof saved.searchQuery === 'string' ? saved.searchQuery : '';
      setSearchQuery(validSearch);

      setCurrentPage(1);

      setSetupStatusMessage({
        type: 'success',
        text: 'Saved dashboard setup restored successfully!'
      });
    } catch (err) {
      console.error('Error restoring setup:', err);
      setSetupStatusMessage({
        type: 'error',
        text: 'Error restoring setup from browser storage.'
      });
    }
  };

  const handleClearSavedSetup = () => {
    const storageKey = getSetupStorageKey(dataset);
    if (!storageKey) return;

    try {
      localStorage.removeItem(storageKey);
      setHasSavedSetup(false);
      setSavedSetupDate(null);
      setShowClearConfirm(false);
      setSetupStatusMessage({
        type: 'info',
        text: 'Saved dashboard setup deleted.'
      });
    } catch (err) {
      console.error('Error clearing saved setup:', err);
    }
  };

  const handleCategoryFilterChange = (colName, val) => {
    setCategoryFilters(prev => ({
      ...prev,
      [colName]: val
    }));
    setCurrentPage(1);
  };

  const handleChartCategoryClick = (categoryName) => {
    if (!selectedCategoryCol || selectedCategoryCol === 'None' || !categoryName) return;

    const currentVal = categoryFilters[selectedCategoryCol] || 'All';
    const nextVal = currentVal === categoryName ? 'All' : categoryName;

    handleCategoryFilterChange(selectedCategoryCol, nextVal);
  };

  const hasActiveFilters = useMemo(() => {
    const hasCategoryFilter = Object.values(categoryFilters).some(v => v && v !== 'All');
    return hasCategoryFilter || Boolean(startDate) || Boolean(endDate) || Boolean(searchQuery);
  }, [categoryFilters, startDate, endDate, searchQuery]);

  // Active filter chips list for summary bar (Phase 26A)
  const activeFilterChips = useMemo(() => {
    const chips = [];

    // 1. Category Filters
    Object.entries(categoryFilters).forEach(([colName, val]) => {
      if (val && val !== 'All') {
        chips.push({
          id: `cat-${colName}`,
          label: `${colName}: ${val}`,
          onClear: () => handleCategoryFilterChange(colName, 'All')
        });
      }
    });

    // 2. Date Range Filters
    if (startDate || endDate) {
      let dateText = '';
      if (startDate && endDate) {
        dateText = `Date: ${startDate} → ${endDate}`;
      } else if (startDate) {
        dateText = `Date: From ${startDate}`;
      } else {
        dateText = `Date: Until ${endDate}`;
      }
      chips.push({
        id: 'date-range',
        label: dateText,
        onClear: () => {
          setStartDate('');
          setEndDate('');
        }
      });
    }

    // 3. Global Search Query Filter
    if (searchQuery.trim()) {
      chips.push({
        id: 'search-query',
        label: `Search: "${searchQuery.trim()}"`,
        onClear: () => setSearchQuery('')
      });
    }

    return chips;
  }, [categoryFilters, startDate, endDate, searchQuery]);

  // Active filter change signature to trigger brief soft KPI visual emphasis (Phase 28)
  const filterSignature = useMemo(() => {
    return JSON.stringify(categoryFilters) + startDate + endDate + searchQuery;
  }, [categoryFilters, startDate, endDate, searchQuery]);

  const isInitialFilterRef = useRef(true);
  const [kpiEmphasized, setKpiEmphasized] = useState(false);

  useEffect(() => {
    if (isInitialFilterRef.current) {
      isInitialFilterRef.current = false;
      return;
    }
    setKpiEmphasized(true);
    const timer = setTimeout(() => setKpiEmphasized(false), 300);
    return () => clearTimeout(timer);
  }, [filterSignature]);

  const handleResetFilters = () => {
    const resetCats = {};
    suitableCategoryColumns.forEach(c => {
      resetCats[c.name] = 'All';
    });
    setCategoryFilters(resetCats);
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setSortColumn(null);
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const handleResetSetup = () => {
    setSelectedKpiCol(numericColumns.length > 0 ? numericColumns[0].name : 'None');
    setSelectedAggregation('Sum');
    setSelectedCategoryCol('None');
    setSelectedDateCol('None');
    setCategoryChartType('Bar');
    setDateGroupingPeriod('Month');
    handleResetFilters();
  };

  // Master reactive dataset filtered by active category, date-range, and search filters
  const filteredRows = useMemo(() => {
    let rows = dataset.previewRows || [];

    // 1. Category Filters
    suitableCategoryColumns.forEach(c => {
      const selectedVal = categoryFilters[c.name];
      if (selectedVal && selectedVal !== 'All') {
        rows = rows.filter(r => String(r[c.name] || 'Unspecified').trim() === selectedVal);
      }
    });

    // 2. Date Range Filter
    if (dateColumns.length > 0) {
      const dateColName = selectedDateCol !== 'None' ? selectedDateCol : dateColumns[0].name;
      
      if (startDate) {
        const startMs = Date.parse(startDate);
        if (!isNaN(startMs)) {
          rows = rows.filter(r => {
            const raw = r[dateColName];
            if (!raw) return false;
            const parsed = Date.parse(raw);
            return !isNaN(parsed) && parsed >= startMs;
          });
        }
      }

      if (endDate) {
        const endMs = Date.parse(endDate) + 86399999; // Include full end day
        if (!isNaN(endMs)) {
          rows = rows.filter(r => {
            const raw = r[dateColName];
            if (!raw) return false;
            const parsed = Date.parse(raw);
            return !isNaN(parsed) && parsed <= endMs;
          });
        }
      }
    }

    // 3. Global Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter(r =>
        Object.values(r).some(v => String(v).toLowerCase().includes(q))
      );
    }

    return rows;
  }, [dataset.previewRows, suitableCategoryColumns, categoryFilters, dateColumns, selectedDateCol, startDate, endDate, searchQuery]);

  // Compute KPI aggregation value on active filtered rows
  const kpiValueFormatted = useMemo(() => {
    if (selectedKpiCol === 'None' || !filteredRows || filteredRows.length === 0) {
      return null;
    }

    const validNums = filteredRows
      .map(r => {
        const val = r[selectedKpiCol];
        if (val === null || val === undefined) return NaN;
        const num = Number(String(val).replace(/[$,]/g, ''));
        return isNaN(num) ? NaN : num;
      })
      .filter(n => !isNaN(n));

    if (validNums.length === 0) return '0';

    let res = 0;
    if (selectedAggregation === 'Sum') {
      res = validNums.reduce((acc, curr) => acc + curr, 0);
    } else if (selectedAggregation === 'Average') {
      res = validNums.reduce((acc, curr) => acc + curr, 0) / validNums.length;
    } else if (selectedAggregation === 'Minimum') {
      res = Math.min(...validNums);
    } else if (selectedAggregation === 'Maximum') {
      res = Math.max(...validNums);
    }

    if (!isFinite(res)) return '0';

    return res.toLocaleString(undefined, { 
      maximumFractionDigits: 2 
    });
  }, [filteredRows, selectedKpiCol, selectedAggregation]);

  // Phase 18: Extract valid numeric values from filteredRows for selectedKpiCol
  const validNumericValues = useMemo(() => {
    if (selectedKpiCol === 'None' || !filteredRows || filteredRows.length === 0) {
      return [];
    }
    return filteredRows
      .map(r => {
        const raw = r[selectedKpiCol];
        if (raw === null || raw === undefined) return NaN;
        const str = String(raw).replace(/[$,]/g, '').trim();
        if (str === '') return NaN;
        const num = Number(str);
        return isFinite(num) ? num : NaN;
      })
      .filter(n => !isNaN(n));
  }, [filteredRows, selectedKpiCol]);

  // Phase 18: Compute summary statistics (Count, Min, Max, Avg, Median)
  const numericStats = useMemo(() => {
    const count = validNumericValues.length;
    if (count === 0) return null;

    const min = Math.min(...validNumericValues);
    const max = Math.max(...validNumericValues);
    const sum = validNumericValues.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / count;

    const sorted = [...validNumericValues].sort((a, b) => a - b);
    let median = 0;
    if (count % 2 === 1) {
      median = sorted[Math.floor(count / 2)];
    } else {
      median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
    }

    const formatStat = (val) => {
      if (val === null || val === undefined || !isFinite(val)) return 'N/A';
      return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    return {
      count: count.toLocaleString(),
      min: formatStat(min),
      max: formatStat(max),
      avg: formatStat(avg),
      median: formatStat(median),
      rawMin: min,
      rawMax: max
    };
  }, [validNumericValues]);

  // Phase 18: Compute automatic histogram buckets from validNumericValues
  const numericHistogramData = useMemo(() => {
    const count = validNumericValues.length;
    if (count === 0) return [];

    const min = Math.min(...validNumericValues);
    const max = Math.max(...validNumericValues);

    if (min === max) {
      return [{
        range: `${min.toLocaleString()}`,
        count: count
      }];
    }

    let bucketCount = 5;
    if (count <= 10) bucketCount = 3;
    else if (count <= 30) bucketCount = 5;
    else if (count <= 100) bucketCount = 6;
    else bucketCount = 8;

    const width = (max - min) / bucketCount;
    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      min: min + i * width,
      max: min + (i + 1) * width,
      count: 0
    }));

    validNumericValues.forEach(val => {
      let bIdx = Math.floor((val - min) / width);
      if (bIdx >= bucketCount) bIdx = bucketCount - 1;
      if (bIdx < 0) bIdx = 0;
      buckets[bIdx].count += 1;
    });

    const isAllInteger = validNumericValues.every(n => Number.isInteger(n));

    return buckets.map((b, i) => {
      let label = '';
      if (isAllInteger && Number.isInteger(width)) {
        const bMin = Math.round(b.min);
        const bMax = Math.round(b.max);
        label = i === bucketCount - 1 ? `${bMin} - ${bMax}` : `${bMin} - ${Math.max(bMin, bMax - 1)}`;
      } else {
        label = `${b.min.toFixed(1)} - ${b.max.toFixed(1)}`;
      }
      return {
        range: label,
        count: b.count
      };
    });
  }, [validNumericValues]);

  // Rows for Category Comparison Chart: filtered by Date, Search, and ALL category filters EXCEPT selectedCategoryCol
  const rowsForCategoryChart = useMemo(() => {
    let rows = dataset.previewRows || [];

    // 1. Category Filters (excluding selectedCategoryCol's own filter)
    suitableCategoryColumns.forEach(c => {
      if (c.name === selectedCategoryCol) return;
      const selectedVal = categoryFilters[c.name];
      if (selectedVal && selectedVal !== 'All') {
        rows = rows.filter(r => String(r[c.name] || 'Unspecified').trim() === selectedVal);
      }
    });

    // 2. Date Range Filter
    if (dateColumns.length > 0) {
      const dateColName = selectedDateCol !== 'None' ? selectedDateCol : dateColumns[0].name;
      if (startDate) {
        const startMs = Date.parse(startDate);
        if (!isNaN(startMs)) {
          rows = rows.filter(r => {
            const raw = r[dateColName];
            if (!raw) return false;
            const parsed = Date.parse(raw);
            return !isNaN(parsed) && parsed >= startMs;
          });
        }
      }
      if (endDate) {
        const endMs = Date.parse(endDate) + 86399999;
        if (!isNaN(endMs)) {
          rows = rows.filter(r => {
            const raw = r[dateColName];
            if (!raw) return false;
            const parsed = Date.parse(raw);
            return !isNaN(parsed) && parsed <= endMs;
          });
        }
      }
    }

    // 3. Global Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter(r =>
        Object.values(r).some(v => String(v).toLowerCase().includes(q))
      );
    }

    return rows;
  }, [dataset.previewRows, suitableCategoryColumns, selectedCategoryCol, categoryFilters, dateColumns, selectedDateCol, startDate, endDate, searchQuery]);

  // Compute Category Comparison Chart Data on rowsForCategoryChart
  const categoryChartData = useMemo(() => {
    if (selectedCategoryCol === 'None' || !rowsForCategoryChart || rowsForCategoryChart.length === 0) {
      return [];
    }

    const groups = {};
    rowsForCategoryChart.forEach(row => {
      const catVal = String(row[selectedCategoryCol] || 'Unspecified').trim();
      if (!groups[catVal]) {
        groups[catVal] = { count: 0, sum: 0, values: [] };
      }
      groups[catVal].count += 1;

      if (selectedKpiCol !== 'None') {
        const val = Number(String(row[selectedKpiCol] || '').replace(/[$,]/g, ''));
        if (!isNaN(val)) {
          groups[catVal].sum += val;
          groups[catVal].values.push(val);
        }
      }
    });

    return Object.keys(groups).slice(0, 12).map(cat => {
      const g = groups[cat];
      let val = g.count; // Default to frequency count if no KPI measure

      if (selectedKpiCol !== 'None' && g.values.length > 0) {
        if (selectedAggregation === 'Sum') val = g.sum;
        else if (selectedAggregation === 'Average') val = g.sum / g.values.length;
        else if (selectedAggregation === 'Minimum') val = Math.min(...g.values);
        else if (selectedAggregation === 'Maximum') val = Math.max(...g.values);
      }

      return {
        category: cat,
        value: isFinite(val) ? Number(val.toFixed(2)) : 0,
        count: g.count
      };
    });
  }, [rowsForCategoryChart, selectedCategoryCol, selectedKpiCol, selectedAggregation]);

  // Compute Date Line Chart Data on active filtered rows
  const timeTrendChartData = useMemo(() => {
    if (selectedDateCol === 'None' || !filteredRows || filteredRows.length === 0) {
      return [];
    }

    const dateGroups = {};
    filteredRows.forEach(row => {
      const rawDate = row[selectedDateCol];
      if (!rawDate) return;
      const parsedTime = Date.parse(rawDate);
      if (isNaN(parsedTime)) return;

      const d = new Date(parsedTime);
      let periodKey = '';
      if (dateGroupingPeriod === 'Day') {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        periodKey = `${y}-${m}-${day}`;
      } else if (dateGroupingPeriod === 'Year') {
        periodKey = `${d.getFullYear()}`;
      } else {
        // Month (default)
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        periodKey = `${y}-${m}`;
      }

      if (!dateGroups[periodKey]) {
        dateGroups[periodKey] = { sum: 0, count: 0, values: [] };
      }
      dateGroups[periodKey].count += 1;

      if (selectedKpiCol !== 'None') {
        const val = Number(String(row[selectedKpiCol] || '').replace(/[$,]/g, ''));
        if (!isNaN(val)) {
          dateGroups[periodKey].sum += val;
          dateGroups[periodKey].values.push(val);
        }
      }
    });

    const sortedPeriods = Object.keys(dateGroups).sort();

    return sortedPeriods.map(period => {
      const g = dateGroups[period];
      let val = g.count;

      if (selectedKpiCol !== 'None' && g.values.length > 0) {
        if (selectedAggregation === 'Sum') val = g.sum;
        else if (selectedAggregation === 'Average') val = g.sum / g.values.length;
        else if (selectedAggregation === 'Minimum') val = Math.min(...g.values);
        else if (selectedAggregation === 'Maximum') val = Math.max(...g.values);
      }

      return {
        period: period,
        value: isFinite(val) ? Number(val.toFixed(2)) : 0,
        count: g.count
      };
    });
  }, [filteredRows, selectedDateCol, selectedKpiCol, selectedAggregation, dateGroupingPeriod]);

  // Master sorted dataset for detail table (sorting applied after filters & search, before pagination)
  const sortedRows = useMemo(() => {
    if (!sortColumn || !filteredRows || filteredRows.length === 0) {
      return filteredRows;
    }

    const colMeta = (dataset.columns || []).find(c => c.name === sortColumn);
    const colType = colMeta ? colMeta.type : 'String';

    return [...filteredRows].sort((a, b) =>
      compareValues(a[sortColumn], b[sortColumn], sortDirection, colType)
    );
  }, [filteredRows, sortColumn, sortDirection, dataset.columns]);

  // Pagination for Detail Table
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage) || 1;
  const paginatedRows = sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Determine whether to display chart cards
  const showCategoryChart = selectedCategoryCol !== 'None' && categoryChartData.length > 0;
  const showTimeTrendChart = selectedDateCol !== 'None' && timeTrendChartData.length > 0;

  // Generate max 2 conservative data-driven chart suggestions based strictly on parsed columns
  const suggestedVisuals = useMemo(() => {
    const suggestions = [];

    // 1. Suggest Category Bar Chart if a suitable low-cardinality categorical column exists
    const bestCategoryCol = suitableCategoryColumns.find(c => {
      const isName = /name/i.test(c.name) || /person/i.test(c.name) || /customer/i.test(c.name);
      const uniqueCount = (categoryColumnOptions[c.name] || []).length;
      return !isName && uniqueCount >= 2 && uniqueCount <= 25;
    });

    if (bestCategoryCol) {
      const uniqueCount = (categoryColumnOptions[bestCategoryCol.name] || []).length;
      suggestions.push({
        id: `suggest-category-${bestCategoryCol.name}`,
        title: `Record count grouped by ${bestCategoryCol.name}`,
        description: `Uses category column "${bestCategoryCol.name}" (${uniqueCount} unique groups) to display row distribution.`,
        type: 'Bar Chart',
        targetCategoryCol: bestCategoryCol.name,
        targetKpiCol: selectedKpiCol,
        targetDateCol: selectedDateCol
      });
    }

    // 2. Suggest Date Trend Line Chart if a valid Date column exists
    if (dateColumns.length > 0) {
      const dateCol = dateColumns[0];
      const hasNumeric = numericColumns.length > 0;
      const measureCol = hasNumeric ? (selectedKpiCol !== 'None' ? selectedKpiCol : numericColumns[0].name) : 'None';
      const aggText = measureCol !== 'None' ? `${selectedAggregation} of ${measureCol}` : 'record volume';

      suggestions.push({
        id: `suggest-date-${dateCol.name}`,
        title: `Time trend over ${dateCol.name}`,
        description: `Uses date column "${dateCol.name}" to track ${aggText} chronologically.`,
        type: 'Line Chart',
        targetDateCol: dateCol.name,
        targetKpiCol: measureCol,
        targetCategoryCol: selectedCategoryCol
      });
    }

    return suggestions.slice(0, 2);
  }, [suitableCategoryColumns, categoryColumnOptions, dateColumns, numericColumns, selectedKpiCol, selectedAggregation, selectedCategoryCol, selectedDateCol]);

  // Apply suggestion to existing setup controls
  const handleApplySuggestion = (suggestion) => {
    if (!suggestion) return;

    if (suggestion.type === 'Bar Chart' && suggestion.targetCategoryCol) {
      setSelectedCategoryCol(suggestion.targetCategoryCol);
    } else if (suggestion.type === 'Line Chart' && suggestion.targetDateCol) {
      setSelectedDateCol(suggestion.targetDateCol);
      if (suggestion.targetKpiCol && suggestion.targetKpiCol !== 'None') {
        setSelectedKpiCol(suggestion.targetKpiCol);
      }
    } else {
      if (suggestion.targetCategoryCol) {
        setSelectedCategoryCol(suggestion.targetCategoryCol);
      }
      if (suggestion.targetDateCol && suggestion.targetDateCol !== 'None') {
        setSelectedDateCol(suggestion.targetDateCol);
      }
      if (suggestion.targetKpiCol && suggestion.targetKpiCol !== 'None') {
        setSelectedKpiCol(suggestion.targetKpiCol);
      }
    }
  };

  // CSV Cell escaping and formula injection neutralization helper
  const escapeCsvCell = (value) => {
    if (value === null || value === undefined) {
      return '""';
    }

    let str = String(value);

    // Neutralize formula injection risk (=, +, -, @) without altering source data in state
    if (/^[=+\-@]/.test(str)) {
      str = "'" + str;
    }

    // Double any embedded double quotes
    const escaped = str.replace(/"/g, '""');

    return `"${escaped}"`;
  };

  // Export all filtered rows matching active dashboard filters & search to CSV
  const handleExportCsv = () => {
    if (!filteredRows || filteredRows.length === 0) return;

    const cols = (dataset.columns || []).map(c => c.name);

    // Header row with original parsed column names
    const headerRow = cols.map(escapeCsvCell).join(',');

    // Data rows for all matching filtered rows
    const dataRows = filteredRows.map(row => 
      cols.map(colName => escapeCsvCell(row[colName])).join(',')
    );

    // UTF-8 BOM + CRLF formatted CSV content
    const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

    // Create Blob & trigger browser file download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Derive filename with .csv extension from dataset name
    const baseName = (dataset.name || 'exported_data').replace(/\.[^/.]+$/, '');
    const fileName = `${baseName}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Derive active filter summary text for PDF export header
  const activeFiltersSummary = useMemo(() => {
    const parts = [];

    // Category filters
    suitableCategoryColumns.forEach(c => {
      const val = categoryFilters[c.name];
      if (val && val !== 'All') {
        parts.push(`${c.name}: "${val}"`);
      }
    });

    // Date range filter
    if (startDate) parts.push(`Start Date: ${startDate}`);
    if (endDate) parts.push(`End Date: ${endDate}`);

    // Search query
    if (searchQuery.trim()) parts.push(`Search Query: "${searchQuery.trim()}"`);

    return parts.length > 0 ? parts.join(' • ') : 'None (Full Dataset)';
  }, [suitableCategoryColumns, categoryFilters, startDate, endDate, searchQuery]);

  // Export current dashboard configuration, KPI summary, active filters, charts, & matching rows to PDF via browser print
  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* PDF Print Report Header (Visible only in Print / PDF Mode) */}
      <div className="print-only mb-6 p-5 border-b-2 border-slate-900 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Spreadsheet Analytics Executive Report</h1>
            <p className="text-xs text-slate-600 font-mono">Dataset File: {dataset.name} ({dataset.fileSize})</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Export Date: {new Date().toLocaleString()}</p>
            <p>Total File Records: {dataset.rowCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-700">Active Dashboard Filters: </span>
            <span className="text-slate-900 font-medium">{activeFiltersSummary}</span>
          </div>
          <div>
            <span className="font-bold text-slate-700">Filtered Records: </span>
            <span className="font-bold text-indigo-700">{filteredRows.length.toLocaleString()} of {dataset.rowCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Header & Dashboard Title */}
      <div className={`p-6 rounded-2xl border space-y-4 transition-colors duration-200 animate-dashboard-fade-up animate-stagger-1 ${t.cardBg}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${t.cardHeaderBorder}`}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${t.accentBg}`}>
                Custom Spreadsheet Dashboard
              </span>
              <span className={t.mutedText}>•</span>
              <span className={`text-xs font-mono ${t.mutedText}`}>
                {dataset.name} ({dataset.fileSize})
              </span>
            </div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${t.headerText}`}>
              Data-Driven Analytics
            </h1>
            <p className={`text-xs ${t.mutedText}`}>
              Aggregated statistics generated strictly from your parsed spreadsheet columns
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sensitive Values Privacy Control (Memory-only state) */}
            <button
              type="button"
              onClick={() => setShowSensitiveValues(prev => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors inline-flex items-center space-x-1.5 cursor-pointer border hover:scale-[1.01] active:scale-[0.99] ${
                showSensitiveValues
                  ? isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/80' : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : t.buttonSecondaryBg
              }`}
              title={showSensitiveValues ? "Hide sensitive personal values in dashboard tables" : "Show original unmasked sensitive values"}
            >
              {showSensitiveValues ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-indigo-500" />}
              <span>Sensitive values: {showSensitiveValues ? 'Shown' : 'Hidden'}</span>
              <span className="font-bold underline ml-0.5">
                {showSensitiveValues ? 'Hide values' : 'Show values'}
              </span>
            </button>

            {/* Compact Appearance Theme Selection Menu */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                id="appearance-menu-button"
                onClick={() => setShowThemeMenu(prev => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors inline-flex items-center space-x-1.5 cursor-pointer border hover:scale-[1.01] active:scale-[0.99] ${t.buttonSecondaryBg}`}
                aria-expanded={showThemeMenu}
                aria-haspopup="true"
                aria-label="Dashboard appearance theme selector"
                title="Change Dashboard Appearance Theme"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Appearance:</span>
                <span className="font-bold">{t.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showThemeMenu ? 'rotate-180' : ''}`} />
              </button>

              {showThemeMenu && (
                <>
                  {/* Backdrop overlay for closing dropdown on click outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowThemeMenu(false)} 
                  />

                  <div 
                    className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border z-50 p-2 space-y-1 ${t.panelBg}`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="appearance-menu-button"
                  >
                    <div className={`px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${t.mutedText}`}>
                      Theme Presets
                    </div>
                    {Object.values(THEME_PRESETS).map((preset) => {
                      const isSelected = theme === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            selectTheme(preset.id);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? `${t.accentBg} font-bold shadow-xs`
                              : `${t.buttonSecondaryBg} hover:opacity-90`
                          }`}
                          aria-label={`Select ${preset.name} theme`}
                        >
                          <div className="flex items-center space-x-2.5">
                            {/* Color Swatch */}
                            <div className="flex items-center space-x-1 p-1 bg-slate-950/20 rounded-md border border-slate-700/50 shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: preset.swatch.bg }} title="Background color" />
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: preset.swatch.card }} title="Card surface color" />
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: preset.swatch.accent }} title="Accent color" />
                            </div>
                            <span className={isSelected ? 'font-bold' : ''}>{preset.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={filteredRows.length === 0}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] inline-flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none"
              title="Export current dashboard report as printable PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={onBackToPreview}
              className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto cursor-pointer ${
                isDark
                  ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              ← Back to Data Preview
            </button>
          </div>
        </div>
      </div>

      {/* Power BI Workspace Layout: Main Canvas (Left) + Sticky Inspector & Filter Panel (Right) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Main Canvas Area (Left Column) */}
        <div className="flex-1 min-w-0 w-full space-y-6">

          {/* Active Filters Summary Bar (Phase 26A) */}
          <div className={`no-print p-4 rounded-2xl border space-y-3 transition-colors duration-200 animate-dashboard-fade-up animate-stagger-2 ${t.cardBg}`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 ${t.cardHeaderBorder}`}>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-indigo-400 shrink-0" />
                <h2 className={`text-xs font-extrabold tracking-tight ${t.headerText}`}>
                  Active Filters
                </h2>
                <span className={`text-[11px] font-mono ${t.mutedText}`}>
                  (Showing {filteredRows.length.toLocaleString()} of {dataset.rowCount.toLocaleString()} rows)
                </span>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start sm:self-auto ${
                    isDark 
                      ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/60' 
                      : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  }`}
                  title="Reset all category, date, and search filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear all filters</span>
                </button>
              )}
            </div>

            {/* Active Chips Container */}
            {hasActiveFilters ? (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {activeFilterChips.map((chip) => (
                  <span
                    key={chip.id}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold border shadow-2xs transition-all animate-chip-in ${t.accentBg}`}
                  >
                    <span className="truncate max-w-[240px]">{chip.label}</span>
                    <button
                      type="button"
                      onClick={chip.onClear}
                      className="p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-all hover:scale-110 active:scale-90 cursor-pointer shrink-0"
                      aria-label={`Clear ${chip.label} filter`}
                      title={`Clear ${chip.label} filter`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${t.mutedText} italic`}>
                No active filters applied. Select categories or date ranges in the right panel to filter dashboard results.
              </p>
            )}
          </div>

          {/* Dynamic KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Row Count Card */}
            <div className={`border rounded-2xl p-5 shadow-xs space-y-2 transition-all duration-200 border-t-4 border-t-teal-500 hover:shadow-md hover:-translate-y-0.5 ${
              kpiEmphasized ? 'animate-kpi-emphasis' : ''
            } ${
              isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Record Volume</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs ${
                  isDark ? 'bg-teal-950/80 text-teal-300 border border-teal-800/60' : 'bg-teal-50 text-teal-600 border border-teal-100'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {filteredRows.length.toLocaleString()} <span className="text-sm font-semibold opacity-75">Rows</span>
                </div>
                <p className={`text-[11px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Showing {filteredRows.length} of {dataset.rowCount.toLocaleString()} total rows
                </p>
              </div>
            </div>

            {/* Selected KPI Aggregation Card */}
            <div className={`border rounded-2xl p-5 shadow-xs space-y-2 transition-all duration-200 border-t-4 border-t-indigo-500 hover:shadow-md hover:-translate-y-0.5 ${
              kpiEmphasized ? 'animate-kpi-emphasis' : ''
            } ${
              isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider truncate pr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title={selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Primary KPI Measure'}>
                  {selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Primary KPI Measure'}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isDark ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}>
                  <Hash className="w-4 h-4" />
                </div>
              </div>
              <div>
                {selectedKpiCol !== 'None' ? (
                  <div className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {kpiValueFormatted !== null ? kpiValueFormatted : '0'}
                  </div>
                ) : (
                  <div className={`text-sm font-semibold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No Numeric Measure Selected
                  </div>
                )}
                <p className={`text-[11px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {selectedKpiCol !== 'None' ? `Aggregated from ${filteredRows.length} matching rows` : 'Select a numeric measure column in controls'}
                </p>
              </div>
            </div>

            {/* Column Fields Count Card */}
            <div className={`border rounded-2xl p-5 shadow-xs space-y-2 transition-all duration-200 border-t-4 border-t-violet-500 hover:shadow-md hover:-translate-y-0.5 ${
              isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Data Fields</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-sky-950/80 text-sky-300' : 'bg-sky-50 text-sky-600'
                }`}>
                  <TableIcon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {dataset.columnCount} Columns
                </div>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Parsed headers</p>
              </div>
            </div>
          </div>

          {/* Zero Matching Records Filter Empty State Alert (Phase 26A) */}
          {filteredRows.length === 0 && (
            <div className={`p-8 rounded-2xl border text-center space-y-4 transition-colors duration-200 ${t.cardBg}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${t.accentBg}`}>
                <Filter className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className={`font-extrabold text-base tracking-tight ${t.headerText}`}>
                  No matching records
                </h3>
                <p className={`text-xs max-w-md mx-auto ${t.mutedText}`}>
                  No records match your active category, date range, or search criteria. Try clearing or adjusting your filters.
                </p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear all filters</span>
                </button>
              </div>
            </div>
          )}

          {/* No Numeric Column Explanation Banner */}
          {numericColumns.length === 0 && (
            <div className={`p-4 rounded-xl border text-xs flex items-start space-x-3 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <p className="leading-relaxed">
                <strong>No Suitable Numeric Measure Found:</strong> No suitable numeric measure column was found in this file (phone numbers, contact identifiers, and postal codes are excluded from metric aggregations). Row counts and detailed record tables are displayed below. To calculate numeric aggregations or value-based charts, select or upload a file containing measure fields (such as Age, Quantity, Price, Salary, or Revenue).
              </p>
            </div>
          )}

          {/* Phase 18: Numeric Distribution and Basic Statistics Card */}
          {selectedKpiCol !== 'None' && numericStats && numericHistogramData.length > 0 && (
            <div className={`border rounded-2xl p-6 shadow-xs space-y-5 chart-card-print print-avoid-break transition-colors duration-200 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Distribution of {selectedKpiCol}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Frequency histogram and summary statistics for {selectedKpiCol} ({numericStats.count} valid records)
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${t.accentBg}`}>
                    Numeric Measure Stats
                  </span>
                  <button
                    type="button"
                    onClick={() => setFocusedChart('distribution')}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${t.buttonSecondaryBg}`}
                    title="Expand chart into focus mode"
                    aria-label="Expand Distribution chart into focus mode"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                </div>
              </div>

              {/* Real Summary Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className={`p-3 rounded-xl border space-y-0.5 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[11px] font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Valid Count</span>
                  <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{numericStats.count}</span>
                </div>
                <div className={`p-3 rounded-xl border space-y-0.5 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[11px] font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Minimum</span>
                  <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{numericStats.min}</span>
                </div>
                <div className={`p-3 rounded-xl border space-y-0.5 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[11px] font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Maximum</span>
                  <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{numericStats.max}</span>
                </div>
                <div className={`p-3 rounded-xl border space-y-0.5 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[11px] font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Average</span>
                  <span className={`text-sm font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{numericStats.avg}</span>
                </div>
                <div className={`p-3 rounded-xl border space-y-0.5 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[11px] font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Median</span>
                  <span className={`text-sm font-black ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{numericStats.median}</span>
                </div>
              </div>

              {/* Histogram Chart */}
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={numericHistogramData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="range" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: isDark ? '1px solid #475569' : 'none' }}
                      formatter={(val) => [`${val} record(s)`, 'Frequency Count']}
                      labelFormatter={(label) => `Value Range: ${label}`}
                    />
                    <Bar dataKey="count" name="Record Count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Charts Grid - Rendered only when at least one chart is explicitly selected with data */}
          {(showCategoryChart || showTimeTrendChart) && (
            <div className={`grid grid-cols-1 ${showCategoryChart && showTimeTrendChart ? 'lg:grid-cols-2' : ''} gap-6 animate-dashboard-fade-up animate-stagger-3`}>
              
              {/* Category Comparison Chart with Type Selector (Bar, Column, Donut) */}
              {showCategoryChart && (() => {
                const isDonutSuitable = categoryChartData.length >= 2 && categoryChartData.length <= 6;
                const activeChartType = (categoryChartType === 'Donut' && !isDonutSuitable) ? 'Bar' : categoryChartType;
                const DONUT_COLORS = ['#6366f1', '#14b8a6', '#38bdf8', '#f43f5e', '#fbbf24', '#a855f7', '#10b981'];
                const activeCategoryFilterVal = selectedCategoryCol !== 'None' ? (categoryFilters[selectedCategoryCol] || 'All') : 'All';
                const isChartFilterActive = activeCategoryFilterVal && activeCategoryFilterVal !== 'All';

                return (
                  <div className={`border rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between chart-card-print print-avoid-break transition-colors duration-200 ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Breakdown by {selectedCategoryCol}
                          </h3>
                          {isChartFilterActive && (
                            <button
                              type="button"
                              onClick={() => handleChartCategoryClick(activeCategoryFilterVal)}
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                                isDark 
                                  ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300 hover:bg-indigo-900' 
                                  : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                              }`}
                              title="Click to clear category filter"
                            >
                              <span>Filtered: <strong>{activeCategoryFilterVal}</strong></span>
                              <span className="text-xs font-bold leading-none ml-0.5">×</span>
                            </button>
                          )}
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Record count per category'} • <span className="italic font-medium text-indigo-500">Click chart category to filter</span>
                        </p>
                      </div>

                      {/* Chart Visual Type Controls & Focus Expand Button */}
                      <div className="flex items-center space-x-1.5 shrink-0 self-start sm:self-auto">
                        <div className={`flex items-center space-x-1 p-1 rounded-lg border ${
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                        }`}>
                          <button
                            type="button"
                            onClick={() => setCategoryChartType('Bar')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                              activeChartType === 'Bar'
                                ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-indigo-700 shadow-xs'
                                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Bar
                          </button>
                          <button
                            type="button"
                            onClick={() => setCategoryChartType('Column')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                              activeChartType === 'Column'
                                ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-indigo-700 shadow-xs'
                                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Column
                          </button>
                          {isDonutSuitable && (
                            <button
                              type="button"
                              onClick={() => setCategoryChartType('Donut')}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                                activeChartType === 'Donut'
                                  ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-indigo-700 shadow-xs'
                                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Donut
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setFocusedChart('category')}
                          className={`p-1.5 rounded-lg border transition-transform duration-150 hover:scale-110 active:scale-95 cursor-pointer ${t.buttonSecondaryBg}`}
                          title="Expand chart into focus mode"
                          aria-label="Expand Category Breakdown chart into focus mode"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                      </div>
                    </div>

                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        {activeChartType === 'Bar' ? (
                          /* Horizontal Bar Chart */
                          <BarChart 
                            layout="vertical" 
                            data={categoryChartData} 
                            margin={{ top: 10, right: 25, left: 35, bottom: 10 }}
                            onClick={(state) => {
                              if (state && state.activePayload && state.activePayload.length > 0) {
                                const cat = state.activePayload[0].payload?.category;
                                if (cat) handleChartCategoryClick(cat);
                              }
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                            <XAxis type="number" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                            <YAxis type="category" dataKey="category" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} width={85} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: isDark ? '1px solid #475569' : 'none' }}
                              formatter={(val) => [val.toLocaleString(), selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Row Count']}
                            />
                            <Bar 
                              dataKey="value" 
                              name={selectedCategoryCol} 
                              fill="#6366f1" 
                              radius={[0, 6, 6, 0]}
                              style={{ cursor: 'pointer' }}
                              onClick={(entry) => {
                                if (entry && entry.category) {
                                  handleChartCategoryClick(entry.category);
                                }
                              }}
                            >
                              {categoryChartData.map((entry, index) => {
                                const isSelected = isChartFilterActive && entry.category === activeCategoryFilterVal;
                                return (
                                  <Cell 
                                    key={`bar-cell-${index}`} 
                                    fill={isSelected ? '#4f46e5' : '#6366f1'} 
                                    opacity={isChartFilterActive ? (isSelected ? 1 : 0.35) : 1}
                                    stroke={isSelected ? (isDark ? '#38bdf8' : '#312e81') : 'none'}
                                    strokeWidth={isSelected ? 2 : 0}
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                      e?.stopPropagation?.();
                                      handleChartCategoryClick(entry.category);
                                    }}
                                  />
                                );
                              })}
                            </Bar>
                          </BarChart>
                        ) : activeChartType === 'Donut' && isDonutSuitable ? (
                          /* Donut Chart */
                          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                            <Tooltip 
                              contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: isDark ? '1px solid #475569' : 'none' }}
                              formatter={(val) => [val.toLocaleString(), selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Row Count']}
                            />
                            <Pie
                              data={categoryChartData}
                              dataKey="value"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                              fill={isDark ? '#e2e8f0' : '#334155'}
                              style={{ cursor: 'pointer' }}
                              onClick={(entry) => {
                                if (entry && entry.category) {
                                  handleChartCategoryClick(entry.category);
                                }
                              }}
                            >
                              {categoryChartData.map((entry, index) => {
                                const isSelected = isChartFilterActive && entry.category === activeCategoryFilterVal;
                                return (
                                  <Cell 
                                    key={`pie-cell-${index}`} 
                                    fill={DONUT_COLORS[index % DONUT_COLORS.length]} 
                                    opacity={isChartFilterActive ? (isSelected ? 1 : 0.35) : 1}
                                    stroke={isSelected ? (isDark ? '#ffffff' : '#0f172a') : 'none'}
                                    strokeWidth={isSelected ? 3 : 0}
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                      e?.stopPropagation?.();
                                      handleChartCategoryClick(entry.category);
                                    }}
                                  />
                                );
                              })}
                            </Pie>
                          </PieChart>
                        ) : (
                          /* Vertical Column Chart */
                          <BarChart 
                            data={categoryChartData} 
                            margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                            onClick={(state) => {
                              if (state && state.activePayload && state.activePayload.length > 0) {
                                const cat = state.activePayload[0].payload?.category;
                                if (cat) handleChartCategoryClick(cat);
                              }
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                            <XAxis dataKey="category" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} angle={-15} textAnchor="end" />
                            <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: isDark ? '1px solid #475569' : 'none' }}
                              formatter={(val) => [val.toLocaleString(), selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Row Count']}
                            />
                            <Bar 
                              dataKey="value" 
                              name={selectedCategoryCol} 
                              fill="#6366f1" 
                              radius={[6, 6, 0, 0]}
                              style={{ cursor: 'pointer' }}
                              onClick={(entry) => {
                                if (entry && entry.category) {
                                  handleChartCategoryClick(entry.category);
                                }
                              }}
                            >
                              {categoryChartData.map((entry, index) => {
                                const isSelected = isChartFilterActive && entry.category === activeCategoryFilterVal;
                                return (
                                  <Cell 
                                    key={`col-cell-${index}`} 
                                    fill={isSelected ? '#4f46e5' : '#6366f1'} 
                                    opacity={isChartFilterActive ? (isSelected ? 1 : 0.35) : 1}
                                    stroke={isSelected ? (isDark ? '#38bdf8' : '#312e81') : 'none'}
                                    strokeWidth={isSelected ? 2 : 0}
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                      e?.stopPropagation?.();
                                      handleChartCategoryClick(entry.category);
                                    }}
                                  />
                                );
                              })}
                            </Bar>
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })()}

              {/* Time Trend Line Chart */}
              {showTimeTrendChart && (
                <div className={`border rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between chart-card-print print-avoid-break transition-colors duration-200 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div>
                      <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Time Trend over {selectedDateCol}
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {selectedKpiCol !== 'None' 
                          ? `${selectedAggregation} of ${selectedKpiCol} (${dateGroupingPeriod.toLowerCase()}ly)` 
                          : `Record volume per ${dateGroupingPeriod.toLowerCase()}`}
                      </p>
                    </div>

                    {/* Time Grouping Period Controls & Focus Expand Button */}
                    <div className="flex items-center space-x-1.5 shrink-0 self-start sm:self-auto">
                      <div className={`flex items-center space-x-1 p-1 rounded-lg border ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setDateGroupingPeriod('Day')}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                            dateGroupingPeriod === 'Day'
                              ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-teal-700 shadow-xs'
                              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Day
                        </button>
                        <button
                          type="button"
                          onClick={() => setDateGroupingPeriod('Month')}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                            dateGroupingPeriod === 'Month'
                              ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-teal-700 shadow-xs'
                              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Month
                        </button>
                        <button
                          type="button"
                          onClick={() => setDateGroupingPeriod('Year')}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                            dateGroupingPeriod === 'Year'
                              ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-teal-700 shadow-xs'
                              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Year
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFocusedChart('timeTrend')}
                        className={`p-1.5 rounded-lg border transition-transform duration-150 hover:scale-110 active:scale-95 cursor-pointer ${t.buttonSecondaryBg}`}
                        title="Expand chart into focus mode"
                        aria-label="Expand Time Trend chart into focus mode"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                    </div>
                  </div>

                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeTrendChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                        <XAxis dataKey="period" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                        <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: isDark ? '1px solid #475569' : 'none' }}
                          formatter={(val) => [val.toLocaleString(), selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Row Count']}
                        />
                        <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Searchable Record Detail Table */}
          <div className={`no-print border rounded-2xl p-6 space-y-4 shadow-xs transition-colors duration-200 animate-dashboard-fade-up animate-stagger-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Parsed Spreadsheet Detail Table</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Search and inspect all underlying rows from {dataset.name}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Choose Columns Control (Phase 15) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColumnSelector(prev => !prev)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Choose which columns appear in the detail table and PDF report"
                  >
                    <Columns className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Choose Columns</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isDark ? 'bg-slate-700 text-indigo-300' : 'bg-slate-200 text-indigo-700'
                    }`}>
                      {visibleColumnList.length}/{dataset.columns?.length || 0}
                    </span>
                  </button>

                  {showColumnSelector && (
                    <div 
                      className={`absolute right-0 sm:right-auto sm:left-0 mt-2 w-72 rounded-xl shadow-xl border p-3 z-30 transition-colors duration-150 ${
                        isDark ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-slate-950/80' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-bold flex items-center space-x-1.5">
                          <Columns className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Select Visible Columns</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowColumnSelector(false)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Action buttons: Select All & Reset to All */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80 text-xs">
                        <button
                          type="button"
                          onClick={handleSelectAllColumns}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleResetColumns}
                          className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline cursor-pointer"
                        >
                          Reset to All
                        </button>
                      </div>

                      {/* Scrollable list of column checkboxes */}
                      <div className="max-h-56 overflow-y-auto py-1 space-y-1">
                        {(dataset.columns || []).map((col) => {
                          const isChecked = visibleColumns[col.name] !== false;
                          const isLastVisible = isChecked && visibleColumnList.length === 1;

                          return (
                            <label
                              key={col.name}
                              className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors select-none ${
                                isLastVisible 
                                  ? 'opacity-70 cursor-not-allowed' 
                                  : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={isLastVisible ? "At least one column must remain visible" : `Toggle visibility for ${col.name}`}
                            >
                              <div className="flex items-center space-x-2.5 truncate mr-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isLastVisible}
                                  onChange={() => toggleColumnVisibility(col.name)}
                                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <span className={`truncate font-medium ${isChecked ? (isDark ? 'text-slate-100' : 'text-slate-900') : (isDark ? 'text-slate-500' : 'text-slate-400 line-through')}`}>
                                  {col.name}
                                </span>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                                isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {col.type}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="Search table rows..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                {(hasActiveFilters || sortColumn !== null) && (
                  <button
                    onClick={handleResetFilters}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer border ${
                      isDark ? 'text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border-indigo-800' : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 border-indigo-100'
                    }`}
                  >
                    Clear Search & Sort
                  </button>
                )}
                <button
                  onClick={handleExportCsv}
                  disabled={sortedRows.length === 0}
                  title={sortedRows.length === 0 ? "No matching rows to export" : "CSV export includes original source values"}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV (Original Source Values • {sortedRows.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={sortedRows.length === 0}
                  title={sortedRows.length === 0 ? "No matching rows to export" : "Export current dashboard report as printable PDF"}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Scrollable Table */}
            <div className={`overflow-x-auto border rounded-xl ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <table className="w-full text-left text-xs">
                <thead className={`font-semibold border-b ${
                  isDark ? 'bg-slate-800/80 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  <tr>
                    <th className={`px-4 py-3 whitespace-nowrap font-mono w-12 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>#</th>
                    {visibleColumnList.map((col, idx) => {
                      const isSorted = sortColumn === col.name;
                      return (
                        <th key={idx} className="p-0 font-semibold text-left">
                          <button
                            type="button"
                            onClick={() => handleSort(col.name)}
                            className={`w-full px-4 py-3 text-left flex items-center justify-between space-x-2 whitespace-nowrap cursor-pointer select-none transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset ${
                              isDark ? 'hover:bg-slate-700/80 text-slate-200' : 'hover:bg-slate-200/80 text-slate-700'
                            }`}
                            title={`Click to sort by ${col.name} (${isSorted && sortDirection === 'asc' ? 'descending' : 'ascending'})`}
                            aria-label={`Sort by ${col.name}, ${isSorted ? `currently sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}` : 'unsorted'}`}
                          >
                            <span className={isSorted ? 'font-extrabold text-indigo-600 dark:text-indigo-400' : ''}>
                              {col.name}
                            </span>
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                            )}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, rIdx) => {
                      const absoluteIdx = (currentPage - 1) * rowsPerPage + rIdx + 1;
                      return (
                        <tr key={rIdx} className={`transition-colors ${
                          isDark ? 'even:bg-slate-900/60 odd:bg-slate-800/20 hover:bg-slate-800/60' : 'table-row-stripe'
                        }`}>
                          <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{absoluteIdx}</td>
                          {visibleColumnList.map((col, cIdx) => {
                            const cellVal = row[col.name];
                            let displayVal = cellVal !== undefined && cellVal !== null ? String(cellVal) : '';
                            if (!showSensitiveValues && isSensitiveColumnName(col.name)) {
                              displayVal = maskSensitiveValue(displayVal, col.name);
                            }
                            return (
                              <td key={cIdx} className={`px-4 py-3 whitespace-nowrap font-medium max-w-xs truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`} title={displayVal}>
                                {displayVal}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={visibleColumnList.length + 1} className={`px-4 py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {hasActiveFilters ? 'No matching records found for active filters' : 'No rows available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className={`flex items-center justify-between pt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>
                Showing {paginatedRows.length} of {sortedRows.length} rows (Page {currentPage} of {totalPages})
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div> {/* Close Main Canvas Area */}

        {/* Sticky Right-Side Inspector Panel (Power BI Style Controls & Filters) */}
        <div className="w-full lg:w-80 lg:shrink-0 space-y-4 no-print lg:sticky lg:top-20 z-20 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto pr-0.5">
          
          {/* Section 1: Dashboard Controls */}
          <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${t.panelBg}`}>
            <div className={`flex items-center justify-between border-b pb-2.5 ${t.cardHeaderBorder}`}>
              <button
                type="button"
                onClick={() => setIsControlsOpen(prev => !prev)}
                className="flex items-center justify-between w-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-0.5 text-left"
                aria-expanded={isControlsOpen}
                aria-label="Toggle Dashboard Controls section"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${t.accentBg}`}>
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <h3 className={`font-extrabold text-xs tracking-tight ${t.headerText}`}>
                    Dashboard Controls
                  </h3>
                </div>
                {isControlsOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0" />
                )}
              </button>
            </div>

            {/* Delete confirmation prompt */}
            {showClearConfirm && (
              <div className={`p-2.5 border rounded-xl flex flex-col space-y-2 text-xs ${
                isDark ? 'bg-rose-950/40 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center space-x-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Clear saved setup for this file?</span>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClearSavedSetup}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors text-[11px] cursor-pointer"
                  >
                    Yes, Clear Setup
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className={`px-2.5 py-1 border font-medium rounded-lg transition-colors text-[11px] cursor-pointer ${t.buttonSecondaryBg}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Status / Restore notification banner */}
            {setupStatusMessage && !showClearConfirm && (
              <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                setupStatusMessage.type === 'success'
                  ? isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : setupStatusMessage.type === 'error'
                  ? isDark ? 'bg-rose-950/40 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-800'
                  : isDark ? 'bg-indigo-950/40 border-indigo-800 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-800'
              }`}>
                <div className="flex items-center space-x-1.5 font-medium min-w-0">
                  {setupStatusMessage.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  {setupStatusMessage.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  {setupStatusMessage.type === 'info' && <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  <span className="truncate">
                    {setupStatusMessage.text}
                    {hasSavedSetup && savedSetupDate && setupStatusMessage.type === 'info' && (
                      <span className={`font-mono text-[10px] ml-1 ${t.mutedText}`}>(Saved at {savedSetupDate})</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  {setupStatusMessage.type === 'info' && hasSavedSetup && (
                    <button
                      type="button"
                      onClick={handleRestoreSetup}
                      className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded-md transition-colors cursor-pointer"
                    >
                      Restore
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSetupStatusMessage(null)}
                    className={`p-0.5 rounded-md cursor-pointer ${t.mutedText} hover:text-white`}
                    title="Dismiss notice"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Setup Controls Stack */}
            <div className={`accordion-content ${isControlsOpen ? 'is-open' : ''}`}>
              <div className="accordion-inner space-y-3 pt-1">
              {/* Primary KPI Measure Selection */}
              <div className={`p-2.5 border rounded-xl space-y-1 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                <label className={`text-[11px] font-bold block truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Primary KPI Measure
                </label>
                <select
                  value={selectedKpiCol}
                  onChange={(e) => setSelectedKpiCol(e.target.value)}
                  className={`w-full text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="None">None (Count Rows Only)</option>
                  {numericColumns.map((c, i) => (
                    <option key={i} value={c.name}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              {/* Aggregation Function */}
              <div className={`p-2.5 border rounded-xl space-y-1 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                <label className={`text-[11px] font-bold block truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Aggregation Function
                </label>
                <select
                  value={selectedAggregation}
                  disabled={selectedKpiCol === 'None'}
                  onChange={(e) => setSelectedAggregation(e.target.value)}
                  className={`w-full text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold disabled:opacity-50 border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Sum">Sum</option>
                  <option value="Average">Average</option>
                  <option value="Minimum">Minimum</option>
                  <option value="Maximum">Maximum</option>
                </select>
              </div>

              {/* Category Grouping */}
              <div className={`p-2.5 border rounded-xl space-y-1 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                <label className={`text-[11px] font-bold block truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Category Grouping
                </label>
                <select
                  value={selectedCategoryCol}
                  onChange={(e) => setSelectedCategoryCol(e.target.value)}
                  className={`w-full text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="None">None (Skip Bar Chart)</option>
                  {categoryColumns.map((c, i) => (
                    <option key={i} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Time Trend Date */}
              <div className={`p-2.5 border rounded-xl space-y-1 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                <label className={`text-[11px] font-bold block truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Time Trend Date
                </label>
                <select
                  value={selectedDateCol}
                  onChange={(e) => setSelectedDateCol(e.target.value)}
                  className={`w-full text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold border ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="None">None (Skip Line Chart)</option>
                  {dateColumns.map((c, i) => (
                    <option key={i} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Setup Actions Buttons Row */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSaveSetup}
                  className="inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  title="Save current setup controls and filters to local browser storage"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Setup</span>
                </button>

                <button
                  type="button"
                  disabled={!hasSavedSetup}
                  onClick={handleRestoreSetup}
                  className={`inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                    hasSavedSetup
                      ? isDark ? 'text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border-indigo-800 hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                      : isDark ? 'text-slate-500 bg-slate-800/50 border-slate-700 cursor-not-allowed opacity-60' : 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
                  }`}
                  title={hasSavedSetup ? "Restore saved configuration for this file" : "No saved setup available"}
                >
                  <FolderInput className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>

                <button
                  type="button"
                  disabled={!hasSavedSetup}
                  onClick={() => setShowClearConfirm(true)}
                  className={`inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                    hasSavedSetup
                      ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                      : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed opacity-50'
                  }`}
                  title={hasSavedSetup ? "Clear saved setup from browser storage" : "No saved setup to clear"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetSetup}
                  className={`inline-flex items-center justify-center space-x-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    isDark ? 'text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700' : 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Reset setup controls and active filters to defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
              </div>
            </div>
        </div>

          {/* Section 2: Suggested Visuals (Collapsible Panel) */}
          {suggestedVisuals.length > 0 && (
            <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
              isDark ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-indigo-50/60 border-indigo-200/80'
            }`}>
              <button
                type="button"
                onClick={() => setShowSuggestedVisuals(prev => !prev)}
                className="flex items-center justify-between text-xs font-extrabold text-indigo-700 dark:text-indigo-300 cursor-pointer w-full"
              >
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Suggested Visuals ({suggestedVisuals.length})</span>
                </span>
                {showSuggestedVisuals ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <div className={`accordion-content ${showSuggestedVisuals ? 'is-open' : ''}`}>
                <div className="accordion-inner space-y-2.5 pt-1">
                  {suggestedVisuals.map((suggestion) => (
                    <div 
                      key={suggestion.id}
                      className={`p-3 border rounded-xl space-y-2 flex flex-col justify-between ${
                        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-indigo-100 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`} title={suggestion.title}>
                            {suggestion.title}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shrink-0 ${
                            isDark ? 'bg-indigo-900/80 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {suggestion.type}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {suggestion.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleApplySuggestion(suggestion);
                        }}
                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] self-start cursor-pointer mt-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Suggestion</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Interactive Dashboard Filters */}
          {(suitableCategoryColumns.length > 0 || dateColumns.length > 0) && (
            <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${t.panelBg}`}>
              <div className={`flex items-center justify-between border-b pb-2.5 ${t.cardHeaderBorder}`}>
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(prev => !prev)}
                  className="flex items-center justify-between w-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-0.5 text-left"
                  aria-expanded={isFiltersOpen}
                  aria-label="Toggle Filters section"
                >
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-indigo-400" />
                    <h3 className={`font-extrabold text-xs tracking-tight ${t.headerText}`}>
                      Filters
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasActiveFilters && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${t.accentBg}`}>
                        Active
                      </span>
                    )}
                    {isFiltersOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0" />
                    )}
                  </div>
                </button>
              </div>

              <div className={`accordion-content ${isFiltersOpen ? 'is-open' : ''}`}>
                <div className="accordion-inner space-y-3 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span>Showing {filteredRows.length.toLocaleString()} of {dataset.rowCount.toLocaleString()} rows</span>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border ${
                          isDark
                            ? 'text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border-indigo-800'
                            : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
                        }`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  {/* Suitable Category Dropdown Filters Stack */}
                  <div className="space-y-2.5">
                    {suitableCategoryColumns.map((col) => {
                      const options = categoryColumnOptions[col.name] || [];
                      const currentValue = categoryFilters[col.name] || 'All';
                      return (
                        <div key={col.name} className={`p-2.5 border rounded-xl space-y-1 ${t.panelSectionBg}`}>
                          <label className={`text-[11px] font-semibold block truncate ${t.subtleText}`} title={col.name}>
                            Filter by {col.name}
                          </label>
                          <select
                            value={currentValue}
                            onChange={(e) => handleCategoryFilterChange(col.name, e.target.value)}
                            className={`w-full text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 font-medium border ${t.inputBg}`}
                          >
                            <option value="All">All ({col.name})</option>
                            {options.map((val, idx) => (
                              <option key={idx} value={val}>{val}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}

                    {/* Date Range Filters Stack */}
                    {dateColumns.length > 0 && (
                      <>
                        <div className={`p-2.5 border rounded-xl space-y-1 ${t.panelSectionBg}`}>
                          <label className={`text-[11px] font-semibold block truncate ${t.subtleText}`}>
                            Start Date ({selectedDateCol !== 'None' ? selectedDateCol : dateColumns[0].name})
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                              setStartDate(e.target.value);
                              setCurrentPage(1);
                            }}
                            className={`w-full text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 font-medium border ${t.inputBg}`}
                          />
                        </div>
                        <div className={`p-2.5 border rounded-xl space-y-1 ${t.panelSectionBg}`}>
                          <label className={`text-[11px] font-semibold block truncate ${t.subtleText}`}>
                            End Date ({selectedDateCol !== 'None' ? selectedDateCol : dateColumns[0].name})
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                              setEndDate(e.target.value);
                              setCurrentPage(1);
                            }}
                            className={`w-full text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 font-medium border ${t.inputBg}`}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Print Detail Table (Capped at 100 rows for printable PDF report) */}
      <div className="print-only mt-6 space-y-3 print-avoid-break">
        <div className="flex items-center justify-between border-b border-slate-300 pb-2">
          <h3 className="font-bold text-slate-900 text-sm">Filtered Dataset Record Detail Table</h3>
          <span className="text-xs text-slate-600 font-mono">
            {filteredRows.length > 100 
              ? `Showing top 100 of ${filteredRows.length.toLocaleString()} matching rows` 
              : `Showing all ${filteredRows.length.toLocaleString()} matching rows`}
          </span>
        </div>

        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-left text-[10px] divide-y divide-slate-200">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="px-2.5 py-1.5 font-mono text-slate-500 w-8">#</th>
                {visibleColumnList.map((col, idx) => (
                  <th key={idx} className="px-2.5 py-1.5 whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredRows.slice(0, 100).length > 0 ? (
                filteredRows.slice(0, 100).map((row, rIdx) => (
                  <tr key={rIdx} className="odd:bg-white even:bg-slate-50">
                    <td className="px-2.5 py-1 font-mono text-slate-400 text-[9px]">{rIdx + 1}</td>
                    {visibleColumnList.map((col, cIdx) => {
                      const cellVal = row[col.name];
                      let displayVal = cellVal !== undefined && cellVal !== null ? String(cellVal) : '';
                      if (!showSensitiveValues && isSensitiveColumnName(col.name)) {
                        displayVal = maskSensitiveValue(displayVal, col.name);
                      }
                      return (
                        <td key={cIdx} className="px-2.5 py-1 whitespace-nowrap truncate max-w-[150px]">
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={visibleColumnList.length + 1} className="px-4 py-4 text-center text-slate-500">
                    No matching records found for active filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PDF Table Omission Footnote Notice */}
        <div className="text-[11px] text-slate-600 italic pt-1">
          {filteredRows.length > 100 ? (
            <p>* Showing top 100 of {filteredRows.length.toLocaleString()} matching rows. {filteredRows.length - 100} matching rows were omitted from this printable PDF summary.</p>
          ) : filteredRows.length > 0 ? (
            <p>* Showing all {filteredRows.length.toLocaleString()} matching rows.</p>
          ) : (
            <p>* No matching records found for active filters.</p>
          )}
        </div>
      </div>

      {/* Chart Focus Overlay Modal (Phase 26B) */}
      {focusedChart && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 no-print bg-black/75 backdrop-blur-xs animate-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="focused-chart-title"
          onClick={() => setFocusedChart(null)}
        >
          <div 
            className={`w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 animate-modal-content ${t.panelBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-5 border-b flex flex-wrap items-center justify-between gap-3 ${t.cardHeaderBorder}`}>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${t.accentBg}`}>
                    {focusedChart === 'distribution' && 'Histogram & Statistics Focus'}
                    {focusedChart === 'category' && 'Category Breakdown Focus'}
                    {focusedChart === 'timeTrend' && 'Time Trend Focus'}
                  </span>
                  <span className={`text-xs font-mono ${t.mutedText}`}>
                    (Showing {filteredRows.length.toLocaleString()} of {dataset.rowCount.toLocaleString()} rows)
                  </span>
                </div>
                <h2 id="focused-chart-title" className={`text-lg font-extrabold tracking-tight mt-1 ${t.headerText}`}>
                  {focusedChart === 'distribution' && `Distribution of ${selectedKpiCol}`}
                  {focusedChart === 'category' && `Breakdown by ${selectedCategoryCol}`}
                  {focusedChart === 'timeTrend' && `Time Trend over ${selectedDateCol}`}
                </h2>
                <p className={`text-xs ${t.mutedText}`}>
                  {focusedChart === 'distribution' && `Frequency histogram and summary statistics for ${selectedKpiCol}`}
                  {focusedChart === 'category' && (selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Record count per category')}
                  {focusedChart === 'timeTrend' && (selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol} (${dateGroupingPeriod.toLowerCase()}ly)` : `Record volume per ${dateGroupingPeriod.toLowerCase()}`)}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Visual type controls inside focus modal for Category chart */}
                {focusedChart === 'category' && (() => {
                  const isDonutSuitable = categoryChartData.length >= 2 && categoryChartData.length <= 6;
                  const activeChartType = (categoryChartType === 'Donut' && !isDonutSuitable) ? 'Bar' : categoryChartType;
                  return (
                    <div className={`flex items-center space-x-1 p-1 rounded-lg border ${t.panelSectionBg}`}>
                      <button
                        type="button"
                        onClick={() => setCategoryChartType('Bar')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                          activeChartType === 'Bar'
                            ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-indigo-700 shadow-xs'
                            : t.mutedText
                        }`}
                      >
                        Bar
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryChartType('Column')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                          activeChartType === 'Column'
                            ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-indigo-700 shadow-xs'
                            : t.mutedText
                        }`}
                      >
                        Column
                      </button>
                      {isDonutSuitable && (
                        <button
                          type="button"
                          onClick={() => setCategoryChartType('Donut')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                            activeChartType === 'Donut'
                              ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-indigo-700 shadow-xs'
                              : t.mutedText
                          }`}
                        >
                          Donut
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Time period controls inside focus modal for Time Trend chart */}
                {focusedChart === 'timeTrend' && (
                  <div className={`flex items-center space-x-1 p-1 rounded-lg border ${t.panelSectionBg}`}>
                    <button
                      type="button"
                      onClick={() => setDateGroupingPeriod('Day')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        dateGroupingPeriod === 'Day'
                          ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-teal-700 shadow-xs'
                          : t.mutedText
                      }`}
                    >
                      Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateGroupingPeriod('Month')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        dateGroupingPeriod === 'Month'
                          ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-teal-700 shadow-xs'
                          : t.mutedText
                      }`}
                    >
                      Month
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateGroupingPeriod('Year')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        dateGroupingPeriod === 'Year'
                          ? isDark ? 'bg-slate-700 text-teal-300 shadow-xs' : 'bg-white text-teal-700 shadow-xs'
                          : t.mutedText
                      }`}
                    >
                      Year
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setFocusedChart(null)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${t.buttonSecondaryBg}`}
                  aria-label="Close chart focus mode"
                  title="Close focus mode (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Render Distribution Stats + Expanded Histogram */}
              {focusedChart === 'distribution' && numericStats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className={`p-3 rounded-xl border space-y-0.5 ${t.panelSectionBg}`}>
                      <span className={`text-[11px] font-semibold block ${t.mutedText}`}>Valid Count</span>
                      <span className={`text-base font-black ${t.headerText}`}>{numericStats.count}</span>
                    </div>
                    <div className={`p-3 rounded-xl border space-y-0.5 ${t.panelSectionBg}`}>
                      <span className={`text-[11px] font-semibold block ${t.mutedText}`}>Minimum</span>
                      <span className={`text-base font-black ${t.headerText}`}>{numericStats.min}</span>
                    </div>
                    <div className={`p-3 rounded-xl border space-y-0.5 ${t.panelSectionBg}`}>
                      <span className={`text-[11px] font-semibold block ${t.mutedText}`}>Maximum</span>
                      <span className={`text-base font-black ${t.headerText}`}>{numericStats.max}</span>
                    </div>
                    <div className={`p-3 rounded-xl border space-y-0.5 ${t.panelSectionBg}`}>
                      <span className={`text-[11px] font-semibold block ${t.mutedText}`}>Average</span>
                      <span className="text-base font-black text-indigo-400">{numericStats.avg}</span>
                    </div>
                    <div className={`p-3 rounded-xl border space-y-0.5 ${t.panelSectionBg}`}>
                      <span className={`text-[11px] font-semibold block ${t.mutedText}`}>Median</span>
                      <span className="text-base font-black text-teal-400">{numericStats.median}</span>
                    </div>
                  </div>

                  <div className="h-[360px] sm:h-[480px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={numericHistogramData} margin={{ top: 10, right: 15, left: 15, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                        <XAxis dataKey="range" stroke={t.chartAxis} fontSize={12} tickLine={false} />
                        <YAxis stroke={t.chartAxis} fontSize={12} tickLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: t.chartTooltipBg, borderRadius: '8px', color: t.chartTooltipText, fontSize: '13px', border: `1px solid ${t.chartTooltipBorder}` }}
                          formatter={(val) => [`${val} record(s)`, 'Frequency Count']}
                          labelFormatter={(label) => `Value Range: ${label}`}
                        />
                        <Bar dataKey="count" name="Record Count" fill={t.barFill} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Render Category Breakdown Expanded Chart */}
              {focusedChart === 'category' && (() => {
                const isDonutSuitable = categoryChartData.length >= 2 && categoryChartData.length <= 6;
                const activeChartType = (categoryChartType === 'Donut' && !isDonutSuitable) ? 'Bar' : categoryChartType;
                const activeCategoryFilterVal = selectedCategoryCol !== 'None' ? (categoryFilters[selectedCategoryCol] || 'All') : 'All';
                const isChartFilterActive = activeCategoryFilterVal && activeCategoryFilterVal !== 'All';

                return (
                  <div className="h-[360px] sm:h-[480px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      {activeChartType === 'Bar' ? (
                        <BarChart 
                          layout="vertical" 
                          data={categoryChartData} 
                          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                          onClick={(state) => {
                            if (state && state.activePayload && state.activePayload.length > 0) {
                              const cat = state.activePayload[0].payload?.category;
                              if (cat) handleChartCategoryClick(cat);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={t.chartGrid} />
                          <XAxis type="number" stroke={t.chartAxis} fontSize={12} tickLine={false} />
                          <YAxis type="category" dataKey="category" stroke={t.chartAxis} fontSize={12} tickLine={false} width={110} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: t.chartTooltipBg, borderRadius: '8px', color: t.chartTooltipText, fontSize: '13px', border: `1px solid ${t.chartTooltipBorder}` }}
                            formatter={(val) => [val.toLocaleString(), selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Row Count']}
                          />
                          <Bar 
                            dataKey="value" 
                            name={selectedCategoryCol} 
                            fill={t.barFill} 
                            radius={[0, 6, 6, 0]}
                            style={{ cursor: 'pointer' }}
                          >
                            {categoryChartData.map((entry, index) => {
                              const isSelected = isChartFilterActive && entry.category === activeCategoryFilterVal;
                              return (
                                <Cell 
                                  key={`focused-bar-cell-${index}`} 
                                  fill={isSelected ? '#4f46e5' : t.barFill} 
                                  opacity={isChartFilterActive ? (isSelected ? 1 : 0.35) : 1}
                                  stroke={isSelected ? t.lineStroke : 'none'}
                                  strokeWidth={isSelected ? 2 : 0}
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => {
                                    e?.stopPropagation?.();
                                    handleChartCategoryClick(entry.category);
                                  }}
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      ) : activeChartType === 'Donut' && isDonutSuitable ? (
                        <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                          <Tooltip 
                            contentStyle={{ backgroundColor: t.chartTooltipBg, borderRadius: '8px', color: t.chartTooltipText, fontSize: '13px', border: `1px solid ${t.chartTooltipBorder}` }}
                            formatter={(val) => [val.toLocaleString(), selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Row Count']}
                          />
                          <Pie
                            data={categoryChartData}
                            dataKey="value"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={140}
                            paddingAngle={4}
                            label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                            fill={t.chartAxis}
                            style={{ cursor: 'pointer' }}
                          >
                            {categoryChartData.map((entry, index) => {
                              const isSelected = isChartFilterActive && entry.category === activeCategoryFilterVal;
                              return (
                                <Cell 
                                  key={`focused-pie-cell-${index}`} 
                                  fill={t.piePalette[index % t.piePalette.length]} 
                                  opacity={isChartFilterActive ? (isSelected ? 1 : 0.35) : 1}
                                  stroke={isSelected ? '#ffffff' : 'none'}
                                  strokeWidth={isSelected ? 3 : 0}
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => {
                                    e?.stopPropagation?.();
                                    handleChartCategoryClick(entry.category);
                                  }}
                                />
                              );
                            })}
                          </Pie>
                        </PieChart>
                      ) : (
                        <BarChart 
                          data={categoryChartData} 
                          margin={{ top: 10, right: 15, left: 15, bottom: 35 }}
                          onClick={(state) => {
                            if (state && state.activePayload && state.activePayload.length > 0) {
                              const cat = state.activePayload[0].payload?.category;
                              if (cat) handleChartCategoryClick(cat);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                          <XAxis dataKey="category" stroke={t.chartAxis} fontSize={12} tickLine={false} angle={-15} textAnchor="end" />
                          <YAxis stroke={t.chartAxis} fontSize={12} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: t.chartTooltipBg, borderRadius: '8px', color: t.chartTooltipText, fontSize: '13px', border: `1px solid ${t.chartTooltipBorder}` }}
                            formatter={(val) => [val.toLocaleString(), selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Row Count']}
                          />
                          <Bar 
                            dataKey="value" 
                            name={selectedCategoryCol} 
                            fill={t.barFill} 
                            radius={[6, 6, 0, 0]}
                            style={{ cursor: 'pointer' }}
                          >
                            {categoryChartData.map((entry, index) => {
                              const isSelected = isChartFilterActive && entry.category === activeCategoryFilterVal;
                              return (
                                <Cell 
                                  key={`focused-col-cell-${index}`} 
                                  fill={isSelected ? '#4f46e5' : t.barFill} 
                                  opacity={isChartFilterActive ? (isSelected ? 1 : 0.35) : 1}
                                  stroke={isSelected ? t.lineStroke : 'none'}
                                  strokeWidth={isSelected ? 2 : 0}
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => {
                                    e?.stopPropagation?.();
                                    handleChartCategoryClick(entry.category);
                                  }}
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                );
              })()}

              {/* Render Time Trend Expanded Chart */}
              {focusedChart === 'timeTrend' && (
                <div className="h-[360px] sm:h-[480px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeTrendChartData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                      <XAxis dataKey="period" stroke={t.chartAxis} fontSize={12} tickLine={false} />
                      <YAxis stroke={t.chartAxis} fontSize={12} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: t.chartTooltipBg, borderRadius: '8px', color: t.chartTooltipText, fontSize: '13px', border: `1px solid ${t.chartTooltipBorder}` }}
                        formatter={(val) => [val.toLocaleString(), selectedKpiCol !== 'None' ? `${selectedAggregation} of ${selectedKpiCol}` : 'Row Count']}
                      />
                      <Line type="monotone" dataKey="value" stroke={t.lineStroke} strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

