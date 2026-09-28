import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-white/80 backdrop-blur-md border-t border-slate-200/80 py-8 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-[11px] shadow-xs">
            AI
          </div>
          <span className="font-bold text-slate-900 tracking-tight">AI Dashboard Builder</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">Spreadsheet Analytics Workspace</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-slate-500">
          <span className="flex items-center space-x-1.5 font-medium">
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            <span>React + Vite + Recharts</span>
          </span>
          <span className="flex items-center space-x-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>100% Client-Side Local Browser Privacy</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
