import React, { useState } from 'react';
import {
  TableProperties,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { PagePurposeBanner } from '../components/PagePurposeBanner';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { DatasetDescriptionCard } from '../components/DatasetDescriptionCard';
import { DataDetailModal, DetailModalKind } from '../components/DataDetailModal';
import { ColumnProfile, CorrelationFactor, DatasetRow } from '../types';
import { formatNumber } from '../utils/dataAnalysis';
import { VisualizePage } from './VisualizePage';
import { CustomChartsPage } from './CustomChartsPage';

interface DataProfilePageProps {
  fileName: string;
  rows: DatasetRow[];
  nums: string[];
  cats: string[];
  columnProfiles: ColumnProfile[];
  usabilityScore: number;
  dataCompleteness: number;
  factors: CorrelationFactor[];
  targetKey: string;
  onAdvanceToNext: () => void;
}

const INITIAL_COLUMNS_SHOWN = 6;

export const DataProfilePage: React.FC<DataProfilePageProps> = ({
  fileName,
  rows,
  nums,
  cats,
  columnProfiles,
  usabilityScore,
  dataCompleteness,
  factors,
  targetKey,
  onAdvanceToNext
}) => {
  const [filterType, setFilterType] = useState<'all' | 'numeric' | 'categorical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [detailModal, setDetailModal] = useState<DetailModalKind>(null);

  // Collapsible states for Visual Analytics & Custom Charts within Data Profiling
  const [isVisualAnalyticsOpen, setIsVisualAnalyticsOpen] = useState(false);
  const [isCustomChartsOpen, setIsCustomChartsOpen] = useState(false);

  const filteredColumns = columnProfiles.filter((col) => {
    if (filterType === 'numeric' && !col.isNumeric) return false;
    if (filterType === 'categorical' && col.isNumeric) return false;
    if (searchQuery && !col.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const visibleColumns = showAllColumns ? filteredColumns : filteredColumns.slice(0, INITIAL_COLUMNS_SHOWN);
  const hiddenCount = filteredColumns.length - visibleColumns.length;

  return (
    <div className="space-y-6">
      {/* 1. PURPOSE BANNER */}
      <PagePurposeBanner
        pageTitle="Data Profiling & Inspection"
        stepNumber={2}
        totalSteps={5}
        purposeSummary="Check how clean and complete your dataset is, and explore visual and custom charts right here."
        keyGoals={[
          'See which columns are numbers vs text categories',
          'Check for any empty or missing cells',
          'Expand Visual Analytics or Custom Charts below whenever desired',
          'View your dataset health and quality rating (1 to 10)'
        ]}
      />

      {/* 2. WORKING PAGE / ACTIVE WORKSPACE */}
      <div className="space-y-6">
        {/* Kaggle-style dataset description card */}
        <DatasetDescriptionCard
          fileName={fileName}
          rowCount={rows.length}
          columnCount={columnProfiles.length}
          numericCount={nums.length}
          categoricalCount={cats.length}
          usabilityScore={usabilityScore}
          suggestedTarget={nums[nums.length - 1]}
        />

        {/* KPI Scorecard Grid — every card is clickable and drills into detail */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setDetailModal('rows')}
            className="text-left p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <span className="text-sm font-semibold text-slate-500 uppercase">Total Rows</span>
            <div className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
              {rows.length.toLocaleString()}
            </div>
            <span className="text-sm text-emerald-600 font-medium">Click to view all rows</span>
          </button>

          <button
            type="button"
            onClick={() => setDetailModal('columns')}
            className="text-left p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <span className="text-sm font-semibold text-slate-500 uppercase">Columns</span>
            <div className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
              {columnProfiles.length}
            </div>
            <span className="text-sm text-slate-500 font-medium">Click to view all columns</span>
          </button>

          <button
            type="button"
            onClick={() => setDetailModal('numeric')}
            className="text-left p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <span className="text-sm font-semibold text-slate-500 uppercase">Numeric Features</span>
            <div className="text-2xl md:text-3xl font-black text-indigo-600 mt-1">
              {nums.length}
            </div>
            <span className="text-sm text-indigo-600 font-medium">Click to view details</span>
          </button>

          <button
            type="button"
            onClick={() => setDetailModal('categorical')}
            className="text-left p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <span className="text-sm font-semibold text-slate-500 uppercase">Categorical</span>
            <div className="text-2xl md:text-3xl font-black text-sky-600 mt-1">
              {cats.length}
            </div>
            <span className="text-sm text-sky-600 font-medium">Click to view details</span>
          </button>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-sm font-semibold text-slate-500 uppercase">Completeness</span>
            <div className="text-2xl md:text-3xl font-black text-emerald-600 mt-1">
              {dataCompleteness}%
            </div>
            <span className="text-sm text-slate-500 font-medium">Non-empty cells</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-sm font-semibold text-slate-500 uppercase">Data Health Score</span>
            <div className="text-2xl md:text-3xl font-black text-indigo-700 mt-1">
              {usabilityScore}<span className="text-sm font-normal text-slate-400">/10</span>
            </div>
            <span className="text-sm text-emerald-600 font-medium">High Quality</span>
          </div>
        </div>

        {/* Schema Profiling Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TableProperties size={19} className="text-indigo-600" />
                Column-by-Column Schema Profile
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Summary of detected data types, unique values, missing rates, and descriptive statistics.
              </p>
            </div>

            {/* Filter and search controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter columns..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAllColumns(false);
                  }}
                  className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
                />
              </div>

              <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-sm">
                <button
                  type="button"
                  onClick={() => { setFilterType('all'); setShowAllColumns(false); }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    filterType === 'all' ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  All ({columnProfiles.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterType('numeric'); setShowAllColumns(false); }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    filterType === 'numeric' ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  Numeric ({nums.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterType('categorical'); setShowAllColumns(false); }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    filterType === 'categorical' ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  Categorical ({cats.length})
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-3">Column Name</th>
                  <th className="p-3">Detected Type</th>
                  <th className="p-3">Missing</th>
                  <th className="p-3">Unique Values</th>
                  <th className="p-3">Mean</th>
                  <th className="p-3">Std Dev</th>
                  <th className="p-3">Min</th>
                  <th className="p-3">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleColumns.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">
                      {col.name}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          col.isNumeric
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {col.isNumeric ? 'Numeric (float/int)' : 'Categorical (string)'}
                      </span>
                    </td>
                    <td className="p-3">
                      {col.missing === 0 ? (
                        <span className="text-emerald-600 font-medium">0 (0%)</span>
                      ) : (
                        <span className="text-rose-600 font-bold">{col.missing}</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {col.unique.toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {col.isNumeric ? formatNumber(col.mean) : '—'}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {col.isNumeric ? formatNumber(col.std) : '—'}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {col.isNumeric ? formatNumber(col.min) : '—'}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {col.isNumeric ? formatNumber(col.max) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Show more / show less columns control */}
          {filteredColumns.length > INITIAL_COLUMNS_SHOWN && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setShowAllColumns((v) => !v)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                {showAllColumns ? (
                  <>
                    <span>Show fewer columns</span>
                    <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    <span>See {hiddenCount} more column{hiddenCount === 1 ? '' : 's'}</span>
                    <ChevronDown size={14} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 3. COLLAPSIBLE SECTIONS: VISUAL ANALYTICS & CUSTOM CHARTS INSIDE DATA PROFILING */}
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Dataset Visualization &amp; Custom Charts
                </h4>
                <p className="text-xs text-slate-600">
                  Expand below to view distributions, correlations, or build custom graphs directly on this page.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVisualAnalyticsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isVisualAnalyticsOpen
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <BarChart2 size={14} />
                <span>{isVisualAnalyticsOpen ? 'Hide Visualization' : 'View in Visualization'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCustomChartsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isCustomChartsOpen
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <Sliders size={14} />
                <span>{isCustomChartsOpen ? 'Hide Custom Charts' : 'View in Custom Charts'}</span>
              </button>
            </div>
          </div>

          {/* Collapsible 1: Visual Analytics */}
          <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setIsVisualAnalyticsOpen((prev) => !prev)}
              className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 bg-slate-50/80 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Visual Analytics: Distributions, Scatter Plots &amp; Driver Rankings
                  </h4>
                  <p className="text-xs text-slate-500">
                    Click to {isVisualAnalyticsOpen ? 'collapse' : 'view'} bivariate correlation graphs and top driving factors
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-600">
                  {isVisualAnalyticsOpen ? 'Hide Visualization' : 'View in Visualization'}
                </span>
                {isVisualAnalyticsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {isVisualAnalyticsOpen && (
              <div className="p-5 sm:p-6 border-t border-slate-200 bg-white animate-fadeIn">
                <VisualizePage
                  fileName={fileName}
                  rows={rows}
                  nums={nums}
                  factors={factors}
                  targetKey={targetKey}
                  showBanner={false}
                />
              </div>
            )}
          </div>

          {/* Collapsible 2: Custom Chart Studio */}
          <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setIsCustomChartsOpen((prev) => !prev)}
              className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 bg-slate-50/80 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                  <Sliders size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Custom Chart Studio: Multi-Axis Bar, Line, Area, Scatter &amp; Donut Charts
                  </h4>
                  <p className="text-xs text-slate-500">
                    Click to {isCustomChartsOpen ? 'collapse' : 'add and configure'} custom plots for any column pair
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-600">
                  {isCustomChartsOpen ? 'Hide Custom Charts' : 'View in Custom Charts'}
                </span>
                {isCustomChartsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {isCustomChartsOpen && (
              <div className="p-5 sm:p-6 border-t border-slate-200 bg-white animate-fadeIn">
                <CustomChartsPage
                  rows={rows}
                  allColumns={Object.keys(rows[0] || {})}
                  nums={nums}
                  showBanner={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM NAVIGATION: Next page button is at the bottom */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Showing all columns and profiling metrics for <b>{fileName}</b>
          </span>
          <button
            type="button"
            onClick={onAdvanceToNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
          >
            <span>Proceed to Predictive Engine</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* 4. METHODOLOGY COLLAPSIBLE */}
      <CollapsibleSection
        title="Deep Dive: How the Data Health Score Is Calculated"
        subtitle="Click to expand a plain-language explanation of the 10-point quality rating"
        badge="Methodology"
        initiallyOpen={false}
      >
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            The <b>Data Health Score</b> measures how ready your dataset is for analysis, on a scale from 0 to 10:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <b>Completeness:</b> datasets with very few empty cells score higher — few or no gaps means more reliable statistics.
            </li>
            <li>
              <b>Numeric depth:</b> having several numeric columns available makes correlation analysis and predictions more meaningful.
            </li>
            <li>
              <b>Categorical context:</b> at least one grouping column (like Region or Quarter) adds useful context for comparisons.
            </li>
            <li>
              <b>Sample size:</b> larger datasets (50+ rows) give steadier, more trustworthy averages and relationships.
            </li>
          </ul>
        </div>
      </CollapsibleSection>

      {/* Drill-down modal opened by clicking a KPI card */}
      <DataDetailModal
        kind={detailModal}
        onClose={() => setDetailModal(null)}
        rows={rows}
        columnProfiles={columnProfiles}
      />
    </div>
  );
};
