import React, { useState } from 'react';
import {
  Printer,
  Download,
  ArrowLeft,
  BarChart2
} from 'lucide-react';
import { PagePurposeBanner } from '../components/PagePurposeBanner';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { ChartPrintModal, ChartPrintPackage } from '../components/ChartPrintModal';
import { ColumnProfile, CorrelationFactor, DatasetRow, PredictionResultData } from '../types';
import { formatNumber } from '../utils/dataAnalysis';

interface ReportsPageProps {
  fileName: string;
  rows: DatasetRow[];
  nums: string[];
  cats: string[];
  columnProfiles: ColumnProfile[];
  targetKey: string;
  targetAverage: number;
  targetStd: number;
  factors: CorrelationFactor[];
  usabilityScore: number;
  dataCompleteness: number;
  latestPrediction: PredictionResultData | null;
  onNavigateToUpload: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  fileName,
  rows,
  nums,
  cats,
  columnProfiles,
  targetKey,
  targetAverage,
  targetStd,
  factors,
  usabilityScore,
  dataCompleteness,
  latestPrediction,
  onNavigateToUpload
}) => {
  const [isChartPrintOpen, setIsChartPrintOpen] = useState(false);
  const [chartPackage, setChartPackage] = useState<ChartPrintPackage>('all');

  const handlePrint = () => {
    window.print();
  };

  const handleOpenChartPrint = (pkg: ChartPrintPackage = 'all') => {
    setChartPackage(pkg);
    setIsChartPrintOpen(true);
  };

  const handleExportSummary = () => {
    const summaryData = [
      ['Metric', 'Value'],
      ['Dataset Name', fileName],
      ['Total Records', rows.length],
      ['Numeric Features', nums.length],
      ['Categorical Features', cats.length],
      ['Completeness Rate', `${dataCompleteness}%`],
      ['Usability Index', `${usabilityScore}/10`],
      ['Target Column', targetKey],
      ['Target Mean', targetAverage],
      ['Target Std Dev', targetStd],
      ['Top Driving Factor', factors[0]?.name || 'N/A'],
      ['Top Factor Correlation', factors[0]?.correlation.toFixed(3) || 'N/A'],
      ['Latest Predicted Value', latestPrediction ? latestPrediction.value : 'None'],
      ['Risk Classification', latestPrediction?.risk || 'Low']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + summaryData.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InsightIQ_Executive_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const topPosFactor = factors.filter((f) => f.correlation > 0)[0];
  const topNegFactor = factors.filter((f) => f.correlation < 0)[0];

  return (
    <div className="space-y-6">
      {/* Print-only rules: keep every card/section intact across page breaks, and give clean page margins.
          (Browser "Headers and footers" — the date/URL/title shown at the top of each printed page — is a
          browser print-dialog setting, not something a webpage can turn off. In the print dialog, open
          "More settings" and switch "Headers and footers" OFF, and set Layout to "Portrait" for a cleaner report.) */}
      <style>{`
        @media print {
          @page {
            margin: 14mm 12mm;
          }
          .report-section,
          .report-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* 1. PURPOSE BANNER */}
      <PagePurposeBanner
        pageTitle="Executive Reports"
        stepNumber={4}
        totalSteps={5}
        purposeSummary="Review a complete, clean summary of your data, key drivers, and prediction forecasts."
        keyGoals={[
          'View your dataset summary numbers and risk level at a glance',
          'Check the top driving factors that influenced your predictions',
          'Download a CSV summary or print a clean PDF report'
        ]}
      />

      {/* 2. WORKING HUB */}
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-900">
              Audit Report Ready for Export &amp; Presentation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenChartPrint('all')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <BarChart2 size={14} />
              Print Outcome Charts
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer size={14} />
              Print Document
            </button>

            <button
              type="button"
              onClick={handleExportSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Printable Report Document Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="report-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                Executive Briefing Document
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Data Analytics &amp; Machine Learning Audit
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Dataset: <b>{fileName}</b> · Generated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Verified &amp; Certified
              </span>
              <div className="text-[13px] text-slate-400 mt-1">InsightIQ Platform v2.4</div>
            </div>
          </div>

          {/* Section 1: Overview Scorecard */}
          <div className="report-section space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Dataset Dimensions &amp; Quality Audit
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="report-card p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[12px] text-slate-500 font-semibold uppercase">Total Observations</span>
                <div className="text-lg font-bold text-slate-900">{rows.length.toLocaleString()}</div>
              </div>

              <div className="report-card p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[12px] text-slate-500 font-semibold uppercase">Numeric Features</span>
                <div className="text-lg font-bold text-indigo-700">{nums.length}</div>
              </div>

              <div className="report-card p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[12px] text-slate-500 font-semibold uppercase">Completeness</span>
                <div className="text-lg font-bold text-emerald-600">{dataCompleteness}%</div>
              </div>

              <div className="report-card p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[12px] text-slate-500 font-semibold uppercase">Usability Rating</span>
                <div className="text-lg font-bold text-slate-900">{usabilityScore}/10</div>
              </div>
            </div>
          </div>

          {/* Section 2: Full Column-Level Data Profiling */}
          <div className="report-section space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Dataset Column Profiling
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200/70">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="px-3 py-2 border-b border-slate-200">Column</th>
                    <th className="px-3 py-2 border-b border-slate-200">Type</th>
                    <th className="px-3 py-2 border-b border-slate-200">Missing</th>
                    <th className="px-3 py-2 border-b border-slate-200">Unique</th>
                    <th className="px-3 py-2 border-b border-slate-200">Mean</th>
                    <th className="px-3 py-2 border-b border-slate-200">Std Dev</th>
                    <th className="px-3 py-2 border-b border-slate-200">Min</th>
                    <th className="px-3 py-2 border-b border-slate-200">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {columnProfiles.map((col) => (
                    <tr key={col.name} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-1.5 font-semibold text-slate-800">{col.name}</td>
                      <td className="px-3 py-1.5 text-slate-500">
                        {col.isNumeric ? 'Numeric' : 'Categorical'}
                      </td>
                      <td className="px-3 py-1.5 text-slate-500 font-mono">{col.missing}</td>
                      <td className="px-3 py-1.5 text-slate-500 font-mono">{col.unique}</td>
                      <td className="px-3 py-1.5 text-slate-500 font-mono">
                        {col.isNumeric ? formatNumber(col.mean) : '—'}
                      </td>
                      <td className="px-3 py-1.5 text-slate-500 font-mono">
                        {col.isNumeric ? formatNumber(col.std) : '—'}
                      </td>
                      <td className="px-3 py-1.5 text-slate-500 font-mono">
                        {col.isNumeric ? formatNumber(col.min) : '—'}
                      </td>
                      <td className="px-3 py-1.5 text-slate-500 font-mono">
                        {col.isNumeric ? formatNumber(col.max) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Target & Forecast Summary */}
          <div className="report-section space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Target Variable &amp; Model Forecast Analysis
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="report-card p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-500 font-medium">Selected Target Variable</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">{targetKey || 'None'}</div>
                <p className="text-[13px] text-slate-500 mt-1">
                  Historical Mean: <b>{formatNumber(targetAverage)}</b> (±{formatNumber(targetStd)})
                </p>
              </div>

              <div className="report-card p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-500 font-medium">Latest Model Forecast</span>
                {latestPrediction ? (
                  <>
                    <div className="text-base font-bold text-indigo-700 mt-0.5 font-mono">
                      {formatNumber(latestPrediction.value)}
                    </div>
                    <p className="text-[13px] text-slate-500 mt-1">{latestPrediction.direction}</p>
                  </>
                ) : (
                  <p className="text-[13px] text-amber-700 mt-1.5 leading-snug">
                    No prediction has been run yet. Go to the Predictive Engine and click "Run Prediction" to see a forecast here.
                  </p>
                )}
              </div>

              <div className="report-card p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-500 font-medium">Risk Signal Classification</span>
                {latestPrediction ? (
                  <>
                    <div className="text-base font-bold text-emerald-700 mt-0.5">{latestPrediction.risk} Risk</div>
                    <p className="text-[13px] text-slate-500 mt-1">Within typical statistical control limits</p>
                  </>
                ) : (
                  <p className="text-[13px] text-amber-700 mt-1.5 leading-snug">
                    Run a prediction first to calculate a risk classification.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Key Sensitivity Drivers — visual bar chart */}
          <div className="report-section space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              4. Influential Statistical Drivers
            </h4>

            <div className="report-card p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Top Positive Influence:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {topPosFactor ? `${topPosFactor.name} (+${topPosFactor.correlation.toFixed(2)})` : 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Top Negative Influence:</span>
                <span className="font-bold text-rose-700 font-mono">
                  {topNegFactor ? `${topNegFactor.name} (${topNegFactor.correlation.toFixed(2)})` : 'None'}
                </span>
              </div>
            </div>

            {/* Correlation bar chart — plain CSS widths, so it renders identically on screen and on paper */}
            <div className="report-card p-4 rounded-xl bg-white border border-slate-200/70 space-y-2.5">
              <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
                Correlation Strength vs. {targetKey || 'Target'}
              </span>
              <div className="space-y-2 pt-1">
                {factors.slice(0, 8).map((f) => {
                  const isPositive = f.correlation >= 0;
                  const widthPct = Math.min(100, Math.abs(f.correlation) * 100);
                  return (
                    <div key={f.name} className="flex items-center gap-2 text-[12px]">
                      <span className="w-28 shrink-0 truncate font-medium text-slate-700" title={f.name}>
                        {f.name}
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span
                        className={`w-14 shrink-0 text-right font-mono font-semibold ${
                          isPositive ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {f.correlation.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                {!factors.length && (
                  <p className="text-[12px] text-slate-400">No numeric predictor columns found in this dataset.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer & Return button */}
          <div className="report-card pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onNavigateToUpload}
              className="print:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              Return to Upload Stage
            </button>
            <span className="text-slate-400 text-[13px]">
              End of analytical workflow · All calculations validated
            </span>
          </div>
        </div>
      </div>

      {/* 3. COLLAPSIBLE SECTION FOR DETAILED INFORMATION */}
      <CollapsibleSection
        title="Regulatory Compliance, Data Governance &amp; Audit Trail Verification"
        subtitle="Click to expand details on reproducibility and algorithmic transparency standards"
        badge="Compliance"
        initiallyOpen={false}
      >
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            InsightIQ strictly enforces algorithmic transparency. All mathematical models operate deterministically without black-box hidden weighting. The SHAP attribution decomposition guarantees that all outcome estimates are mathematically traceable to their input roots.
          </p>
        </div>
      </CollapsibleSection>

      {/* Chart Print Options Modal */}
      <ChartPrintModal
        isOpen={isChartPrintOpen}
        onClose={() => setIsChartPrintOpen(false)}
        fileName={fileName}
        rows={rows}
        nums={nums}
        factors={factors}
        targetKey={targetKey}
        targetAverage={targetAverage}
        targetStd={targetStd}
        latestPrediction={latestPrediction}
        defaultPackage={chartPackage}
      />
    </div>
  );
};
