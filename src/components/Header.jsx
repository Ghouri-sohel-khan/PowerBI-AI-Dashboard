import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, FileSpreadsheet, BarChart2, Sparkles, CheckCircle2, Palette, ChevronDown, Check } from 'lucide-react';
import { THEME_PRESETS } from '../utils/themePresets';

export default function Header({ 
  currentStep, 
  setCurrentStep, 
  selectedDataset, 
  onReset, 
  isParsing, 
  fileInputRef,
  themeId,
  onThemeChange,
  activeTheme
}) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
    };
    if (showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showThemeMenu]);

  const renderAppearanceMenu = () => (
    <div className="relative" ref={themeMenuRef}>
      <button
        type="button"
        onClick={() => setShowThemeMenu(prev => !prev)}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold shadow-xs cursor-pointer ${
          currentStep === 'landing' || activeTheme?.isDark
            ? 'bg-slate-900/90 border-slate-700/90 text-slate-200 hover:bg-slate-800'
            : 'bg-white/90 border-slate-200/90 text-slate-700 hover:bg-slate-50'
        }`}
        aria-expanded={showThemeMenu}
        aria-label="Appearance theme selector"
        title="Change Appearance Theme"
      >
        <Palette className="w-3.5 h-3.5 text-indigo-500" />
        <span className="hidden sm:inline font-medium">Appearance</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showThemeMenu ? 'rotate-180' : ''}`} />
      </button>

      {showThemeMenu && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-2 z-50 text-xs font-sans animate-chip-in text-slate-900">
          <div className="px-3 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100">
            Appearance Themes
          </div>
          <div className="py-1 space-y-0.5">
            {Object.values(THEME_PRESETS).map((preset) => {
              const isSelected = themeId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    if (onThemeChange) onThemeChange(preset.id);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: preset.swatch.bg }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.swatch.accent }} />
                    </div>
                    <span>{preset.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (currentStep === 'landing') {
    return (
      <header className={`${activeTheme?.headerBg || 'bg-slate-950/90'} sticky top-0 z-30 transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-[1.03] transition-all duration-200">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight">AI Dashboard Builder</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 rounded-full">
                  MVP Workspace
                </span>
              </div>
              <p className="text-xs opacity-70 hidden sm:block">Spreadsheet to Interactive Visual Analytics</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {renderAppearanceMenu()}

            {/* Primary CTA: Browse File */}
            <button
              type="button"
              onClick={() => {
                if (!isParsing && fileInputRef?.current) {
                  fileInputRef.current.click();
                }
              }}
              disabled={isParsing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            >
              Browse File
            </button>
          </div>
        </div>
      </header>
    );
  }

  const steps = [
    { id: 'landing', label: '1. Upload File', icon: FileSpreadsheet },
    { id: 'preview', label: '2. Inspect Data', icon: BarChart2 },
    { id: 'dashboard', label: '3. AI Dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className={`${activeTheme?.headerBg || 'bg-white/90'} sticky top-0 z-30 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div 
          onClick={() => !isParsing && onReset && onReset()}
          className={`flex items-center space-x-3 group ${isParsing ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-[1.03] transition-all duration-200">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight">AI Dashboard Builder</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full">
                MVP Workspace
              </span>
            </div>
            <p className="text-xs opacity-70 hidden sm:block">Spreadsheet to Interactive Visual Analytics</p>
          </div>
        </div>

        {/* Step Progress Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 backdrop-blur-xs">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = 
              (currentStep === 'preview' && step.id === 'landing') ||
              (currentStep === 'dashboard' && (step.id === 'landing' || step.id === 'preview'));

            const isDashboardDisabled = step.id === 'dashboard' && (!selectedDataset || (selectedDataset?.isCustomFile && !selectedDataset?.isParsed));
            const isDisabled = isParsing || (step.id !== 'landing' && (!selectedDataset || isDashboardDisabled));

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDisabled) {
                      if (step.id === 'landing') {
                        if (onReset) onReset();
                      } else {
                        setCurrentStep(step.id);
                      }
                    }
                  }}
                  disabled={isDisabled}
                  title={isDashboardDisabled && selectedDataset?.isCustomFile ? "Dashboard requires parsed dataset" : ""}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-xs font-bold ring-1 ring-slate-200'
                      : isCompleted
                      ? 'text-slate-700 hover:text-indigo-600 hover:bg-slate-200/60'
                      : 'text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span>{step.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <span className="text-slate-300 px-0.5 text-xs">/</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Actions / Status */}
        <div className="flex items-center space-x-3">
          {renderAppearanceMenu()}

          {selectedDataset && currentStep !== 'landing' && (
            <button
              type="button"
              onClick={() => !isParsing && onReset && onReset()}
              disabled={isParsing}
              className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3.5 py-1.5 rounded-xl border border-slate-200/90 hover:border-indigo-300 bg-white hover:bg-slate-50 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              + New File
            </button>
          )}

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-50/80 border border-teal-200/80 text-teal-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Rule-Based AI Suggestions</span>
            <span className="sm:hidden">Rules</span>
          </div>
        </div>
      </div>
    </header>
  );
}
