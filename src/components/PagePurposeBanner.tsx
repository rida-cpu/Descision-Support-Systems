import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

interface PagePurposeBannerProps {
  pageTitle: string;
  stepNumber: number;
  totalSteps: number;
  purposeSummary: string;
  keyGoals: string[];
  detailedPurpose?: string;
  onJumpToNext?: () => void;
  nextPageName?: string;
}

export const PagePurposeBanner: React.FC<PagePurposeBannerProps> = ({
  pageTitle,
  purposeSummary,
  keyGoals
}) => {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
      <div className="space-y-2.5 max-w-3xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Target size={12} />
            Overview
          </span>
          <span className="text-sm font-semibold text-slate-700">
            {pageTitle}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {purposeSummary}
        </h2>

        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-sm text-slate-600">
          {keyGoals.map((goal, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 font-medium px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md"
            >
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span>{goal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
