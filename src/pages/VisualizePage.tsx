import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Activity,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { PagePurposeBanner } from '../components/PagePurposeBanner';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { CorrelationFactor, DatasetRow } from '../types';
import { formatNumber } from '../utils/dataAnalysis';

interface VisualizePageProps {
  fileName: string;
  rows: DatasetRow[];
  nums: string[];
  factors: CorrelationFactor[];
  targetKey: string;
  onAdvanceToNext?: () => void;
  showBanner?: boolean;
}

export const VisualizePage: React.FC<VisualizePageProps> = ({
  fileName: _fileName,
  rows,
  nums,
  factors,
  targetKey,
  onAdvanceToNext,
  showBanner = true
}) => {
  const [selectedX, setSelectedX] = useState<string>(nums[0] || '');
  const [selectedY, setSelectedY] = useState<string>(nums[1] || nums[0] || '');

  const displayRows = rows.slice(0, 100);

  const distributionData = displayRows.map((r, i) => ({
    record: i + 1,
    value: Number(r[selectedX]) || 0
  }));

  const scatterData = displayRows
    .map((r) => ({
      x: Number(r[selectedX]),
      y: Number(r[selectedY])
    }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

  return (
    <div className="space-y-6">
      {/* 1. PURPOSE OF THIS PAGE */}
      {showBanner && (
        <PagePurposeBanner
          pageTitle="Visual Analytics"
          stepNumber={3}
          totalSteps={7}
          purposeSummary="Explore your data visually with bar distributions, scatter plots, and correlation rankings."
          keyGoals={[
            'See how your numbers are spread out from low to high',
            'Compare any two columns side-by-side on a scatter chart',
            'Find out which columns have the strongest relationship with your target'
          ]}
        />
      )}

      {/* 2. WORKING WORKSPACE */}
      <div className="space-y-6">
        {/* Controls Toolbar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-indigo-600" />
              Variable Selection:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">
                X-Axis:
                <select
                  value={selectedX}
                  onChange={(e) => setSelectedX(e.target.value)}
                  className="ml-1.5 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {nums.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium text-slate-600">
                Y-Axis:
                <select
                  value={selectedY}
                  onChange={(e) => setSelectedY(e.target.value)}
                  className="ml-1.5 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {nums.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Plotting first {displayRows.length} observations
          </span>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Distribution Histogram */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <BarChart2 size={16} className="text-indigo-600" />
                  Distribution: {selectedX}
                </h4>
                <p className="text-xs text-slate-500">
                  Value variation across individual dataset records
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="record"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    label={{ value: 'Record Index', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val) => [formatNumber(Number(val)), selectedX]}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scatter Plot */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Activity size={16} className="text-sky-600" />
                  Pairwise Correlation: {selectedX} vs {selectedY}
                </h4>
                <p className="text-xs text-slate-500">
                  Bivariate scatter indicating linear or cluster trend
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={selectedX}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    label={{ value: selectedX, position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={selectedY}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    label={{ value: selectedY, angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(val, name) => [formatNumber(Number(val)), name]}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Scatter name="Data Points" data={scatterData} fill="#0284c7" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Feature Correlation Ranking Table */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                Feature Driver Ranking (Relative to Target: {targetKey || 'Selected Target'})
              </h4>
              <p className="text-xs text-slate-500">
                Features ordered by absolute Pearson correlation strength with the target variable.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {factors.slice(0, 8).map((factor, idx) => {
              const isPos = factor.correlation >= 0;
              const strengthPct = Math.round(factor.score * 100);

              return (
                <div
                  key={factor.name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors border border-slate-200/60"
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  <div className="w-36 font-semibold text-xs text-slate-800 truncate" title={factor.name}>
                    {factor.name}
                  </div>

                  <div className="flex-1 max-w-md">
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isPos
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                            : 'bg-gradient-to-r from-rose-400 to-rose-600'
                        }`}
                        style={{ width: `${strengthPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="w-16 font-mono text-xs text-right font-bold text-slate-700">
                    {factor.correlation > 0 ? '+' : ''}
                    {factor.correlation.toFixed(2)}
                  </div>

                  <span
                    className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
                      isPos
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isPos ? 'Positive Driver' : 'Negative Driver'}
                  </span>
                </div>
              );
            })}
          </div>

          {onAdvanceToNext && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onAdvanceToNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm cursor-pointer"
              >
                <span>Advance to Custom Charts</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {showBanner && (
        <CollapsibleSection
          title="How to Read the Feature Driver Ranking"
          subtitle="Click to expand a plain-language explanation of what this ranking means"
          badge="Guide"
          initiallyOpen={false}
        >
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              The <b>Feature Driver Ranking</b> shows which columns move together with your target the most — in other words, which numbers tend to rise or fall in step with what you're trying to predict.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <b>Longer bars</b> mean a stronger relationship — that column has more influence on the outcome.
              </li>
              <li>
                <b>Positive Driver</b> means the column tends to rise alongside the target (e.g. more advertising, more sales).
              </li>
              <li>
                <b>Negative Driver</b> means the column tends to move in the opposite direction (e.g. higher price, fewer customers).
              </li>
            </ul>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};
