import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppPage } from '../types';

interface BreadcrumbProps {
  currentPage: AppPage;
  pageTitle: string;
  pillarTitle: string;
  onNavigate: (page: AppPage) => void;
  onPrevious?: () => void;
  previousPageName?: string;
  onNext?: () => void;
  nextPageName?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentPage: _currentPage,
  pageTitle,
  pillarTitle,
  onNavigate,
  onPrevious,
  previousPageName
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="h-13 bg-white border border-slate-200 px-4 sm:px-6 mb-6 flex items-center justify-between text-sm rounded-xl shadow-2xs print:hidden"
    >
      <div className="flex items-center gap-2 text-slate-400">
        <button
          type="button"
          onClick={() => onNavigate('upload')}
          className="hover:text-slate-700 transition-colors cursor-pointer"
        >
          Workspace
        </button>

        <span>/</span>

        <span className="text-slate-500 font-medium hidden sm:inline">
          {pillarTitle}
        </span>

        <span className="hidden sm:inline">/</span>

        <span className="text-slate-900 font-semibold">
          {pageTitle}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onPrevious && previousPageName ? (
          <button
            type="button"
            onClick={onPrevious}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-sm font-medium transition-colors cursor-pointer"
            title={`Go back to ${previousPageName}`}
          >
            <ArrowLeft size={13} />
            <span className="hidden md:inline">Back:</span>
            <span className="truncate max-w-[90px]">{previousPageName}</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400 italic px-1">Start</span>
        )}
      </div>
    </nav>
  );
};
