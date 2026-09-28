import React from 'react';
import { LayoutDashboard, FileSpreadsheet, BarChart2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Header({ currentStep, setCurrentStep, selectedDataset, onReset, isParsing }) {
  if (currentStep === 'landing') {
    return (
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 shadow-md text-white">
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
                <span className="font-extrabold text-lg text-white tracking-tight">AI Dashboard Builder</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 rounded-full">
                  MVP Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Spreadsheet to Interactive Visual Analytics</p>
            </div>
          </div>

          {/* Primary CTA: Open Workspace */}
          <button
            onClick={() => setCurrentStep('upload')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
          >
            Open Workspace
          </button>
        </div>
      </header>
    );
  }

  const steps = [
    { id: 'upload', label: '1. Upload File', icon: FileSpreadsheet },
    { id: 'preview', label: '2. Inspect Data', icon: BarChart2 },
    { id: 'dashboard', label: '3. AI Dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
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
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">AI Dashboard Builder</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full">
                MVP Workspace
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Spreadsheet to Interactive Visual Analytics</p>
          </div>
        </div>

        {/* Step Progress Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 backdrop-blur-xs">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = 
              (currentStep === 'preview' && step.id === 'upload') ||
              (currentStep === 'dashboard' && (step.id === 'upload' || step.id === 'preview'));

            const isDashboardDisabled = step.id === 'dashboard' && (!selectedDataset || (selectedDataset?.isCustomFile && !selectedDataset?.isParsed));
            const isDisabled = isParsing || (step.id !== 'upload' && (!selectedDataset || isDashboardDisabled));

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    if (!isDisabled) {
                      setCurrentStep(step.id);
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
          {selectedDataset && currentStep !== 'upload' && (
            <button
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
