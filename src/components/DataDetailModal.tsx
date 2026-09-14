import React from 'react';
import { X } from 'lucide-react';
import { ColumnProfile, DatasetRow } from '../types';
import { formatNumber } from '../utils/dataAnalysis';

export type DetailModalKind = 'rows' | 'columns' | 'numeric' | 'categorical' | null;

interface DataDetailModalProps {
  kind: DetailModalKind;
  onClose: () => void;
  rows: DatasetRow[];
  columnProfiles: ColumnProfile[];
}

export const DataDetailModal: React.FC<DataDetailModalProps> = ({
  kind,
  onClose,
  rows,
  columnProfiles
}) => {
  if (!kind) return null;

  const headers = rows.length ? Object.keys(rows[0]) : [];

  const titles: Record<Exclude<DetailModalKind, null>, string> = {
    rows: 'All Dataset Rows',
    columns: 'All Columns',
    numeric: 'Numeric Feature Columns',
    categorical: 'Categorical Columns'
  };

  const subtitles: Record<Exclude<DetailModalKind, null>, string> = {
    rows: `Every record currently loaded — ${rows.length.toLocaleString()} rows in total.`,
    columns: `Every column detected in this dataset — ${columnProfiles.length} in total.`,
    numeric: `Columns used as model predictors and prediction targets.`,
    categorical: `Text / label columns used for grouping and segmentation.`
  };

  const filteredColumns =
    kind === 'numeric'
      ? columnProfiles.filter((c) => c.isNumeric)
      : kind === 'categorical'
      ? columnProfiles.filter((c) => !c.isNumeric)
      : columnProfiles;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {titles[kind]}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {subtitles[kind]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {kind === 'rows' ? (
            <div className="border border-slate-200 rounded-xl overflow-auto max-h-full">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold sticky top-0">
                    <th className="p-2.5 font-mono text-slate-400 w-14 text-center">#</th>
                    {headers.map((h) => (
                      <th key={h} className="p-2.5 font-bold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-mono text-slate-400 text-center">{i + 1}</td>
                      {headers.map((h) => (
                        <td key={h} className="p-2.5 whitespace-nowrap text-slate-700">
                          {String(r[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-auto max-h-full">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold sticky top-0">
                    <th className="p-2.5">Column Name</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Missing</th>
                    <th className="p-2.5">Unique</th>
                    <th className="p-2.5">Mean</th>
                    <th className="p-2.5">Std Dev</th>
                    <th className="p-2.5">Min</th>
                    <th className="p-2.5">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredColumns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-semibold text-slate-800">{col.name}</td>
                      <td className="p-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            col.isNumeric
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}
                        >
                          {col.isNumeric ? 'Numeric' : 'Categorical'}
                        </span>
                      </td>
                      <td className="p-2.5">{col.missing}</td>
                      <td className="p-2.5 font-mono text-slate-600">{col.unique.toLocaleString()}</td>
                      <td className="p-2.5 font-mono text-slate-700">{col.isNumeric ? formatNumber(col.mean) : '—'}</td>
                      <td className="p-2.5 font-mono text-slate-700">{col.isNumeric ? formatNumber(col.std) : '—'}</td>
                      <td className="p-2.5 font-mono text-slate-700">{col.isNumeric ? formatNumber(col.min) : '—'}</td>
                      <td className="p-2.5 font-mono text-slate-700">{col.isNumeric ? formatNumber(col.max) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
