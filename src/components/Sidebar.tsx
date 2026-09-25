import React from 'react';
import {
  UploadCloud,
  FileCheck2,
  BrainCircuit,
  FileSpreadsheet,
  History,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { AppPage } from '../types';

interface SidebarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  fileName: string;
  rowCount: number;
  onPrevious?: () => void;
  onNext?: () => void;
  previousPageName?: string;
  nextPageName?: string;
}

interface NavItem {
  id: AppPage;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  fileName,
  rowCount
}) => {
  // Navigation items: Visual and Custom charts removed from sidebar (they are now inside Data Profiling)
  // and History is placed AT THE END of the sidebar as requested!
  const navItems: NavItem[] = [
    {
      id: 'upload',
      title: 'Upload Dataset',
      description: 'Import CSV or Excel spreadsheet',
      icon: <UploadCloud size={17} />
    },
    {
      id: 'profile',
      title: 'Data Profiling',
      description: 'Schema inspection & chart studio',
      icon: <FileCheck2 size={17} />
    },
    {
      id: 'prediction',
      title: 'Predictive Engine',
      description: 'Forecast values with AI models',
      icon: <BrainCircuit size={17} />
    },
    {
      id: 'reports',
      title: 'Executive Reports',
      description: 'Summary tables & PDF export',
      icon: <FileSpreadsheet size={17} />
    },
    {
      id: 'history',
      title: 'History',
      description: 'Saved runs & dataset catalog',
      icon: <History size={17} />
    }
  ];

  const PAGE_PURPOSES: Record<AppPage, string> = {
    upload: 'Upload your spreadsheet (CSV or Excel) to get started.',
    profile: 'Review columns, data types, and access visual & custom charts.',
    visualize: 'Explore visual charts and driver rankings.',
    custom: 'Build custom multi-axis charts and plots.',
    prediction: 'Run AI algorithms to predict future values with zoomable graphs.',
    reports: 'Read the complete project summary and print or save as PDF.',
    history: 'See every dataset you have loaded and restore past prediction runs.'
  };

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900 flex flex-col h-full shrink-0 select-none print:hidden">
      {/* Brand Header: Logo mark only since full name is displayed in Navbar */}
      <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('upload')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Go to Home"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white font-black flex items-center justify-center text-base shadow-sm ring-1 ring-indigo-400/30 transition-colors">
            IQ
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-slate-400 font-semibold tracking-wide">Workspace Ready</span>
          </div>
        </button>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Active
        </span>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3">
        {/* Current Task Box */}
        <div className="px-4 mb-4">
          <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-lg">
            <p className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span>Current Task:</span>
              <span className="text-xs text-indigo-400 font-bold capitalize">
                {currentPage === 'profile' ? 'Profiling & Charts' : currentPage}
              </span>
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mt-1">
              {PAGE_PURPOSES[currentPage] || 'Dataset analytics and predictive modeling.'}
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-5 mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Navigation
        </div>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              currentPage === item.id ||
              (item.id === 'profile' && (currentPage === 'visualize' || currentPage === 'custom'));

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-500/15 border-r-4 border-indigo-400 text-indigo-300 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-7 h-7 rounded flex items-center justify-center text-sm shrink-0 ${
                      isActive
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className={`truncate text-sm font-medium ${isActive ? 'text-indigo-200' : 'text-slate-200'}`}>
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {item.description}
                    </div>
                  </div>
                </div>

                {isActive ? (
                  <CheckCircle2 size={14} className="text-indigo-400 shrink-0 ml-1" />
                ) : (
                  <ChevronRight size={14} className="text-slate-600 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer - Active Dataset Status */}
      <div className="p-4 border-t border-slate-800 mt-auto space-y-2">
        <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Active Dataset
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <p className="font-semibold text-slate-100 text-sm truncate" title={fileName}>
            {fileName}
          </p>
          <p className="text-sm text-slate-500 font-mono mt-0.5">
            {rowCount.toLocaleString()} records loaded
          </p>
        </div>
      </div>
    </aside>
  );
};