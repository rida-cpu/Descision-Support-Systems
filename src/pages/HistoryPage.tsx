import React, { useState } from 'react';
import {
  Trash2,
  Database,
  ArrowRight,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Info,
  BarChart3,
  FileCheck2,
  BrainCircuit,
  Tag
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { PagePurposeBanner } from '../components/PagePurposeBanner';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { DatasetHistoryEntry, PredictionHistoryEntry, AppPage } from '../types';
import {
  formatFileSize,
  formatNumber,
  numericKeys,
  categoricalKeys,
  computeColumnProfiles
} from '../utils/dataAnalysis';

interface HistoryPageProps {
  predictionHistory: PredictionHistoryEntry[];
  datasetHistory: DatasetHistoryEntry[];
  onRestorePrediction: (entry: PredictionHistoryEntry) => void;
  onRemovePrediction: (id: string) => void;
  onClearPredictions: () => void;
  onReopenDataset: (entry: DatasetHistoryEntry) => void;
  onRemoveDataset: (id: string) => void;
  onClearDatasets: () => void;
  onAdvanceToNext: () => void;
  onNavigateToPage?: (page: AppPage) => void;
}

type SectionKey = 'detail' | 'visualize' | 'profiling' | 'prediction';

export const HistoryPage: React.FC<HistoryPageProps> = ({
  predictionHistory,
  datasetHistory,
  onRestorePrediction,
  onRemovePrediction,
  onClearPredictions,
  onReopenDataset,
  onRemoveDataset,
  onClearDatasets,
  onAdvanceToNext,
  onNavigateToPage
}) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const sectionKey = (datasetId: string, section: SectionKey) => `${datasetId}__${section}`;

  const toggleSection = (datasetId: string, section: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      const key = sectionKey(datasetId, section);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isSectionOpen = (datasetId: string, section: SectionKey) =>
    openSections.has(sectionKey(datasetId, section));

  return (
    <div className="space-y-6">
      {/* 1. PURPOSE BANNER */}
      <PagePurposeBanner
        pageTitle="History & Saved Catalogs"
        stepNumber={5}
        totalSteps={5}
        purposeSummary="Every dataset you've loaded, listed one by one — expand any one to view, visualize, profile, or predict on it."
        keyGoals={[
          'See every loaded dataset by name in one clean list',
          'Expand Detail, Visualize, Data Profiling, or Prediction Engine independently',
          'Re-run any previous prediction with exact saved settings'
        ]}
      />

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-sm font-semibold text-slate-500 uppercase">
            Loaded Datasets
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {datasetHistory.length}
          </div>
          <span className="text-sm text-sky-600 font-medium">Ready to inspect</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-sm font-semibold text-slate-500 uppercase">
            Saved Predictions
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {predictionHistory.length}
          </div>
          <span className="text-sm text-indigo-600 font-medium">Re-runnable snapshots</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-sm font-semibold text-slate-500 uppercase">
            Active Target
          </span>
          <div
            className="text-base font-bold text-slate-900 mt-1 truncate"
            title={predictionHistory[0]?.targetKey || 'Sales / Profit'}
          >
            {predictionHistory[0]?.targetKey || 'Target Variable'}
          </div>
          <span className="text-sm text-slate-400 font-mono">Latest run</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-sm font-semibold text-slate-500 uppercase">
            Current Dataset
          </span>
          <div
            className="text-base font-bold text-slate-900 mt-1 truncate"
            title={datasetHistory[0]?.name || 'sales.csv'}
          >
            {datasetHistory[0]?.name || 'None'}
          </div>
          <span className="text-sm text-emerald-600 font-mono font-medium">Active session</span>
        </div>
      </div>

      {/* 3. DATASETS LISTED ONE BY ONE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet size={17} className="text-sky-600" />
              Loaded Datasets
            </h4>
            <p className="text-sm text-slate-500">
              Every file loaded this session. Expand <b>Detail</b>, <b>Visualize</b>, <b>Data Profiling</b>, or <b>Prediction Engine</b> for any dataset independently.
            </p>
          </div>

          {datasetHistory.length > 0 && (
            <button
              type="button"
              onClick={onClearDatasets}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
            >
              Clear Catalog
            </button>
          )}
        </div>

        {!datasetHistory.length ? (
          <div className="text-center py-10 text-sm text-slate-400">
            No datasets in history yet. Upload a CSV or Excel spreadsheet on the Upload page to catalog it here.
          </div>
        ) : (
          <div className="space-y-3">
            {datasetHistory.map((dataset) => {
              const numCols = numericKeys(dataset.rows);
              const catCols = categoricalKeys(dataset.rows);
              const columns = Object.keys(dataset.rows[0] || {});
              const sampleRows = dataset.rows.slice(0, 5);
              const columnProfiles = computeColumnProfiles(dataset.rows, numCols);
              const relatedPredictions = predictionHistory.filter(
                (p) => !p.datasetName || p.datasetName === dataset.name
              );
              const firstNumericCol = numCols[0];
              const chartData = firstNumericCol
                ? dataset.rows.slice(0, 12).map((row, idx) => ({
                    record: `#${idx + 1}`,
                    value: Number(row[firstNumericCol]) || 0
                  }))
                : [];

              return (
                <div
                  key={dataset.id}
                  className="rounded-xl border border-slate-200 overflow-hidden bg-white"
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                        <Database size={15} />
                      </div>
                      <h5 className="font-bold text-sm text-slate-900 truncate">
                        {dataset.name}
                      </h5>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onReopenDataset(dataset)}
                        className="px-2.5 py-1 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                        title="Set this dataset as the active dataset in the app"
                      >
                        Load Dataset
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveDataset(dataset.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete dataset"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 4 INDEPENDENT COLLAPSIBLES */}
                  <div className="divide-y divide-slate-100 border-t border-slate-200">
                    {/* 1. DETAIL */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection(dataset.id, 'detail')}
                        className="w-full p-3 px-4 bg-white hover:bg-slate-50 flex items-center justify-between text-sm font-bold text-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Info size={15} className="text-slate-500" />
                          <span>Detail</span>
                          <span className="px-1.5 py-0.2 rounded text-xs font-normal bg-slate-100 text-slate-600">
                            {dataset.rowCount.toLocaleString()} rows · {dataset.columnCount} columns
                          </span>
                        </div>
                        {isSectionOpen(dataset.id, 'detail') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isSectionOpen(dataset.id, 'detail') && (
                        <div className="p-4 bg-slate-50/50 space-y-4 animate-fadeIn">
                          <p className="text-sm text-slate-500 font-mono">
                            Size: {formatFileSize(dataset.size)} · Loaded {new Date(dataset.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>

                          <div>
                            <span className="text-sm font-bold text-slate-800 block mb-2">
                              Columns &amp; Feature Types ({columns.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {columns.map((col) => {
                                const isNum = numCols.includes(col);
                                return (
                                  <span
                                    key={col}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-mono border ${
                                      isNum
                                        ? 'bg-indigo-50/70 text-indigo-700 border-indigo-200'
                                        : 'bg-amber-50/70 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    <Tag size={10} />
                                    <span className="font-semibold">{col}</span>
                                    <span className="text-xs text-slate-400 uppercase">
                                      {isNum ? 'num' : 'cat'}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                            <table className="w-full text-left text-sm border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                  {columns.map((c) => (
                                    <th key={c} className="p-2.5 whitespace-nowrap">{c}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {sampleRows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50/80">
                                    {columns.map((c) => (
                                      <td key={c} className="p-2.5 px-3 text-slate-800 border-r border-slate-100 last:border-r-0">
                                        {typeof row[c] === 'number'
                                          ? formatNumber(row[c] as number)
                                          : String(row[c] ?? '—')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. VISUALIZE */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection(dataset.id, 'visualize')}
                        className="w-full p-3 px-4 bg-white hover:bg-slate-50 flex items-center justify-between text-sm font-bold text-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <BarChart3 size={15} className="text-sky-600" />
                          <span>Visualize</span>
                          <span className="px-1.5 py-0.2 rounded text-xs font-normal bg-sky-100 text-sky-700">
                            {firstNumericCol ? `${firstNumericCol} distribution` : 'No numeric column'}
                          </span>
                        </div>
                        {isSectionOpen(dataset.id, 'visualize') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isSectionOpen(dataset.id, 'visualize') && (
                        <div className="p-4 bg-slate-50/50 space-y-3 animate-fadeIn">
                          {chartData.length ? (
                            <ResponsiveContainer width="100%" height={220}>
                              <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="record" tick={{ fontSize: 11, fill: '#64748b' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Tooltip />
                                <Bar dataKey="value" name={firstNumericCol} fill="#4f46e5" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <p className="text-sm text-slate-400 py-2">
                              This dataset has no numeric columns to chart.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 3. DATA PROFILING */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection(dataset.id, 'profiling')}
                        className="w-full p-3 px-4 bg-white hover:bg-slate-50 flex items-center justify-between text-sm font-bold text-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileCheck2 size={15} className="text-emerald-600" />
                          <span>Data Profiling</span>
                          <span className="px-1.5 py-0.2 rounded text-xs font-normal bg-emerald-100 text-emerald-700">
                            {numCols.length} numeric · {catCols.length} categorical
                          </span>
                        </div>
                        {isSectionOpen(dataset.id, 'profiling') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isSectionOpen(dataset.id, 'profiling') && (
                        <div className="p-4 bg-slate-50/50 space-y-3 animate-fadeIn">
                          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                            <table className="w-full text-left text-sm border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                  <th className="p-2.5">Column</th>
                                  <th className="p-2.5">Type</th>
                                  <th className="p-2.5">Missing</th>
                                  <th className="p-2.5">Unique</th>
                                  <th className="p-2.5">Mean</th>
                                  <th className="p-2.5">Std Dev</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {columnProfiles.slice(0, 6).map((col) => (
                                  <tr key={col.name} className="hover:bg-slate-50/80">
                                    <td className="p-2.5 font-semibold text-slate-800">{col.name}</td>
                                    <td className="p-2.5">
                                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                                        col.isNumeric
                                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                      }`}>
                                        {col.isNumeric ? 'Numeric' : 'Categorical'}
                                      </span>
                                    </td>
                                    <td className="p-2.5">{col.missing}</td>
                                    <td className="p-2.5 font-mono">{col.unique.toLocaleString()}</td>
                                    <td className="p-2.5 font-mono">{col.isNumeric ? formatNumber(col.mean) : '—'}</td>
                                    <td className="p-2.5 font-mono">{col.isNumeric ? formatNumber(col.std) : '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 4. PREDICTION ENGINE */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection(dataset.id, 'prediction')}
                        className="w-full p-3 px-4 bg-white hover:bg-slate-50 flex items-center justify-between text-sm font-bold text-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <BrainCircuit size={15} className="text-indigo-600" />
                          <span>Prediction Engine</span>
                          <span className="px-1.5 py-0.2 rounded text-xs font-normal bg-indigo-100 text-indigo-700">
                            {relatedPredictions.length} runs
                          </span>
                        </div>
                        {isSectionOpen(dataset.id, 'prediction') ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isSectionOpen(dataset.id, 'prediction') && (
                        <div className="p-4 bg-slate-50/50 space-y-3 animate-fadeIn">
                          {!relatedPredictions.length ? (
                            <p className="text-sm text-slate-400 py-2">
                              No predictions recorded yet for this dataset. Go to the Predictive Engine to run one.
                            </p>
                          ) : (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                              <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                    <th className="p-2.5">Target</th>
                                    <th className="p-2.5">Predicted Value</th>
                                    <th className="p-2.5">Direction</th>
                                    <th className="p-2.5">Risk</th>
                                    <th className="p-2.5">Time</th>
                                    <th className="p-2.5 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {relatedPredictions.map((pred) => (
                                    <tr key={pred.id} className="hover:bg-slate-50/70">
                                      <td className="p-2.5 font-bold text-slate-800">{pred.targetKey}</td>
                                      <td className="p-2.5 font-mono font-bold text-indigo-700">
                                        {formatNumber(pred.predictedValue)}
                                      </td>
                                      <td className="p-2.5 text-slate-600">{pred.direction}</td>
                                      <td className="p-2.5">
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                          pred.risk === 'Low'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-amber-50 text-amber-700'
                                        }`}>
                                          {pred.risk}
                                        </span>
                                      </td>
                                      <td className="p-2.5 text-slate-400 font-mono text-sm">
                                        {new Date(pred.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="p-2.5 text-right">
                                        <button
                                          type="button"
                                          onClick={() => onRestorePrediction(pred)}
                                          className="px-2.5 py-1 text-sm font-semibold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                                        >
                                          Restore &amp; Re-run
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ALL PREDICTION RUNS TABLE (collapsed by default — expand only if the user wants to see it) */}
      <CollapsibleSection
        title="All Saved Prediction Runs"
        subtitle={`Complete log of scenarios tested across all models${
          predictionHistory.length ? ` · ${predictionHistory.length} runs recorded` : ''
        }`}
        badge={predictionHistory.length ? `${predictionHistory.length} Runs` : undefined}
        initiallyOpen={false}
      >
        <div className="space-y-4">
          {predictionHistory.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClearPredictions}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
              >
                Clear All Predictions
              </button>
            </div>
          )}

          {!predictionHistory.length ? (
            <div className="text-center py-8 text-sm text-slate-400">
              No prediction runs logged yet. Calculate a prediction on the Predictive Engine page to record historical entries.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3">Target</th>
                    <th className="p-3">Predicted Value</th>
                    <th className="p-3">Direction</th>
                    <th className="p-3">Variance Risk</th>
                    <th className="p-3">Time</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {predictionHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-bold text-slate-800">{item.targetKey}</td>
                      <td className="p-3 font-mono font-bold text-indigo-700">
                        {formatNumber(item.predictedValue)}
                      </td>
                      <td className="p-3 text-slate-600">{item.direction}</td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            item.risk === 'Low'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.risk === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.risk} Risk
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-sm">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onRestorePrediction(item)}
                            className="px-2.5 py-1 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                          >
                            Restore &amp; Re-run
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemovePrediction(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onAdvanceToNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-xs cursor-pointer"
            >
              <span>Return to Upload Stage</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* 5. COLLAPSIBLE SPECS */}
      <CollapsibleSection
        title="Session Persistence & Cache Protocol"
        subtitle="Click to expand details on local storage serialization"
        badge="Persistence"
        initiallyOpen={false}
      >
        <p className="text-sm text-slate-500 leading-relaxed">
          InsightIQ automatically caches datasets and prediction snapshots in your browser session.
          You can inspect prior runs, restore input parameters, or delete files at any time with zero data loss.
        </p>
      </CollapsibleSection>
    </div>
  );
};
