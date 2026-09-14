import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowRight,
  Palette
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { PagePurposeBanner } from '../components/PagePurposeBanner';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { ChartType, CustomChartItem, DatasetRow } from '../types';
import { formatNumber } from '../utils/dataAnalysis';

interface CustomChartsPageProps {
  rows: DatasetRow[];
  allColumns: string[];
  nums: string[];
  onAdvanceToNext?: () => void;
  showBanner?: boolean;
}

const PALETTE = ['#4f46e5', '#0284c7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const CustomChartsPage: React.FC<CustomChartsPageProps> = ({
  rows,
  allColumns,
  nums,
  onAdvanceToNext,
  showBanner = true
}) => {
  const [charts, setCharts] = useState<CustomChartItem[]>([
    {
      id: 1,
      title: 'Primary Comparison',
      type: 'bar',
      xColumn: allColumns[0] || '',
      yColumn: nums[0] || '',
      rowLimit: Math.min(rows.length, 25)
    },
    {
      id: 2,
      title: 'Trend Trajectory',
      type: 'line',
      xColumn: allColumns[0] || '',
      yColumn: nums[1] || nums[0] || '',
      rowLimit: Math.min(rows.length, 25)
    }
  ]);

  const addChart = () => {
    setCharts((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: `Custom Plot #${prev.length + 1}`,
        type: 'bar',
        xColumn: allColumns[0] || '',
        yColumn: nums[0] || '',
        rowLimit: Math.min(rows.length, 25)
      }
    ]);
  };

  const removeChart = (id: number) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
  };

  const updateChart = (id: number, patch: Partial<CustomChartItem>) => {
    setCharts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-6">
      {/* 1. PURPOSE BANNER (shown when page is viewed standalone) */}
      {showBanner && (
        <PagePurposeBanner
          pageTitle="Custom Chart Studio"
          stepNumber={4}
          totalSteps={7}
          purposeSummary="Build custom charts easily by picking any columns and graph styles you like."
          keyGoals={[
            'Choose between Bar, Line, Scatter, Area, and Pie charts',
            'Pick any column for the horizontal (X) and vertical (Y) axes',
            'Add new chart cards or remove charts with a single click'
          ]}
        />
      )}

      {/* 2. WORKING CANVAS */}
      <div className="space-y-6">
        {/* Top bar: ONLY contains Add New Chart button — "Advance" button moved to bottom */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Palette size={16} className="text-indigo-600" />
              Active Visualization Canvas
            </h3>
            <p className="text-xs text-slate-500">
              Configured {charts.length} dynamic chart {charts.length === 1 ? 'card' : 'cards'}
            </p>
          </div>

          <button
            type="button"
            onClick={addChart}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer w-fit"
          >
            <Plus size={14} />
            Add New Chart
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {charts.map((chart, idx) => {
            const chartData = rows.slice(0, chart.rowLimit);

            return (
              <div
                key={chart.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4"
              >
                {/* Chart Header & Controls */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {chart.yColumn || 'Metric'} by {chart.xColumn || 'Dimension'}
                      </h4>
                      <span className="text-[13px] text-slate-400 uppercase font-semibold">
                        {chart.type} chart · {chart.rowLimit} rows
                      </span>
                    </div>
                  </div>

                  {charts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChart(chart.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Chart"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Configuration Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="block text-[12px] font-semibold text-slate-500 uppercase">Type</span>
                    <select
                      value={chart.type}
                      onChange={(e) => updateChart(chart.id, { type: e.target.value as ChartType })}
                      className="w-full mt-0.5 p-1 rounded-md border border-slate-200 bg-white font-medium text-slate-700 text-xs"
                    >
                      <option value="bar">Bar</option>
                      <option value="line">Line</option>
                      <option value="area">Area</option>
                      <option value="scatter">Scatter</option>
                      <option value="pie">Donut / Pie</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-[12px] font-semibold text-slate-500 uppercase">X-Axis</span>
                    <select
                      value={chart.xColumn}
                      onChange={(e) => updateChart(chart.id, { xColumn: e.target.value })}
                      className="w-full mt-0.5 p-1 rounded-md border border-slate-200 bg-white font-medium text-slate-700 text-xs"
                    >
                      {allColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-[12px] font-semibold text-slate-500 uppercase">Y-Axis</span>
                    <select
                      value={chart.yColumn}
                      onChange={(e) => updateChart(chart.id, { yColumn: e.target.value })}
                      className="w-full mt-0.5 p-1 rounded-md border border-slate-200 bg-white font-medium text-slate-700 text-xs"
                    >
                      {nums.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-[12px] font-semibold text-slate-500 uppercase">Rows Shown</span>
                    <input
                      type="number"
                      min={2}
                      max={rows.length}
                      value={chart.rowLimit}
                      onChange={(e) => updateChart(chart.id, { rowLimit: Math.max(2, Number(e.target.value) || 2) })}
                      className="w-full mt-0.5 p-1 rounded-md border border-slate-200 bg-white font-medium text-slate-700 text-xs"
                    />
                  </div>
                </div>

                {/* Render Selected Chart Type */}
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.type === 'bar' ? (
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey={chart.xColumn} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip
                          formatter={(v) => [formatNumber(Number(v)), chart.yColumn]}
                          contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                        />
                        <Bar dataKey={chart.yColumn} fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : chart.type === 'line' ? (
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey={chart.xColumn} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip
                          formatter={(v) => [formatNumber(Number(v)), chart.yColumn]}
                          contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                        />
                        <Line type="monotone" dataKey={chart.yColumn} stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    ) : chart.type === 'area' ? (
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey={chart.xColumn} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip
                          formatter={(v) => [formatNumber(Number(v)), chart.yColumn]}
                          contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                        />
                        <Area type="monotone" dataKey={chart.yColumn} stroke="#10b981" fill="#d1fae5" fillOpacity={0.6} />
                      </AreaChart>
                    ) : chart.type === 'scatter' ? (
                      <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis type="number" dataKey={chart.xColumn} name={chart.xColumn} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis type="number" dataKey={chart.yColumn} name={chart.yColumn} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          formatter={(v, name) => [formatNumber(Number(v)), name]}
                          contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                        />
                        <Scatter name="Points" data={chartData} fill="#f59e0b" />
                      </ScatterChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey={chart.yColumn}
                          nameKey={chart.xColumn}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={45}
                          paddingAngle={2}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) => [formatNumber(Number(v)), chart.yColumn]}
                          contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                        />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showBanner && (
        <CollapsibleSection
          title="Visualization Best Practices & Geometry Guidelines"
          subtitle="Click to expand recommendations on chart types based on data attributes"
          badge="Design Guidance"
          initiallyOpen={false}
        >
          <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <b className="text-slate-800 block mb-1">Bar &amp; Column Charts</b>
              Best for discrete comparisons across categorical dimensions (e.g. Sales by Region or Quarter).
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <b className="text-slate-800 block mb-1">Line &amp; Area Charts</b>
              Ideal for sequential, temporal, or index-ordered trajectories (e.g. Monthly Revenue, Units Sold).
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <b className="text-slate-800 block mb-1">Scatter &amp; Donut Plots</b>
              Scatter isolates outliers and bivariate linearity. Donut charts represent proportional shares.
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};
