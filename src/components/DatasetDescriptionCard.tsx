import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Database, Layers, Target } from 'lucide-react';

interface DatasetDescriptionCardProps {
  fileName: string;
  rowCount: number;
  columnCount: number;
  numericCount: number;
  categoricalCount: number;
  usabilityScore: number;
  suggestedTarget?: string;
}

export const DatasetDescriptionCard: React.FC<DatasetDescriptionCardProps> = ({
  fileName,
  rowCount,
  columnCount,
  numericCount,
  categoricalCount,
  usabilityScore,
  suggestedTarget
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Database size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {fileName}
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {usabilityScore}/10 Usability
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {expanded
                ? `This dataset contains ${rowCount.toLocaleString()} records across ${columnCount} columns — ${numericCount} numeric feature${numericCount === 1 ? '' : 's'} and ${categoricalCount} categorical field${categoricalCount === 1 ? '' : 's'}. It is well suited for regression-style forecasting${suggestedTarget ? `, with "${suggestedTarget}" as a natural target column` : ''}. Use the schema table below to review each column's type, missing values, and summary statistics before moving on to visual analytics and prediction.`
                : `${rowCount.toLocaleString()} rows · ${columnCount} columns · ${numericCount} numeric, ${categoricalCount} categorical.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shrink-0"
        >
          <Info size={14} />
          <span>{expanded ? 'Show less' : 'See more'}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 grid sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
            <Layers size={16} className="text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">Structure</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {rowCount.toLocaleString()} rows, {columnCount} columns — a clean tabular dataset ready for schema profiling.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
            <Database size={16} className="text-sky-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">Column mix</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {numericCount} numeric column{numericCount === 1 ? '' : 's'} for modeling, {categoricalCount} categorical column{categoricalCount === 1 ? '' : 's'} for grouping and labels.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
            <Target size={16} className="text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">Suggested use</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {suggestedTarget
                  ? `Try predicting "${suggestedTarget}" from the remaining numeric columns in the Predictive Engine.`
                  : 'Pick a numeric target column in the Predictive Engine to start forecasting.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
