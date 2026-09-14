import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Check,
  TrendingUp,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { PagePurposeBanner } from '../components/PagePurposeBanner';
import { CollapsibleSection } from '../components/CollapsibleSection';
import {
  CorrelationFactor,
  DatasetRow,
  PredictionResultData,
  ShapContributionItem
} from '../types';
import {
  formatNumber,
  computeAlgorithmPredictions,
  generatePredictionCurve
} from '../utils/dataAnalysis';

interface PredictionPageProps {
  fileName: string;
  rows: DatasetRow[];
  nums: string[];
  factors: CorrelationFactor[];
  targetKey: string;
  onTargetChange: (target: string) => void;
  predictionInputs: Record<string, number>;
  onInputChange: (key: string, val: number) => void;
  onResetInputs: () => void;
  resetSignal?: number;
  predictionResult: PredictionResultData | null;
  predictionLoading: boolean;
  onRunPrediction: () => void;
  shapItems: ShapContributionItem[];
  targetAverage: number;
  targetStd: number;
  onAdvanceToNext: () => void;
}

const INITIAL_FEATURE_LIMIT = 6;

export const PredictionPage: React.FC<PredictionPageProps> = ({
  fileName: _fileName,
  rows,
  nums,
  factors,
  targetKey,
  onTargetChange,
  predictionInputs,
  onInputChange,
  onResetInputs,
  resetSignal,
  predictionResult,
  predictionLoading,
  onRunPrediction,
  shapItems,
  targetAverage,
  targetStd,
  onAdvanceToNext
}) => {
  // Graph controls state
  const [graphType, setGraphType] = useState<'comparison' | 'curve'>('comparison');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedAlgoId, setSelectedAlgoId] = useState<string | null>(null);

  // Algorithmic working details collapsible state ("show less" by default, expandable)
  const [isWorkingDetailsOpen, setIsWorkingDetailsOpen] = useState<boolean>(false);

  // Scenario input mode: 'sliders' or 'inputs'
  const [scenarioMode, setScenarioMode] = useState<'sliders' | 'inputs'>('sliders');

  // Feature Importance collapsible state: show first 6 by default, expandable if user wishes
  const [showAllFeatures, setShowAllFeatures] = useState<boolean>(false);

  // Full reset: whenever the parent's "Reset Scenarios" button fires (resetSignal changes),
  // also clear any locally-held UI selection so the page returns to a truly clean state.
  React.useEffect(() => {
    if (resetSignal === undefined) return;
    setSelectedAlgoId(null);
    setGraphType('comparison');
    setZoomLevel(100);
  }, [resetSignal]);

  const availableFeatures = nums.filter((n) => n !== targetKey);

  // Derive base prediction value
  const baseVal = predictionResult ? predictionResult.value : targetAverage;

  // Feature averages for model calculators
  const featureAverages = useMemo(() => {
    const map: Record<string, number> = {};
    availableFeatures.forEach((col) => {
      const vals = rows.map((r) => Number(r[col])).filter(Number.isFinite);
      map[col] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    });
    return map;
  }, [rows, availableFeatures]);

  // Compute multi-algorithm predictions
  const algorithmModels = useMemo(() => {
    return computeAlgorithmPredictions(
      rows,
      targetKey,
      factors,
      predictionInputs,
      featureAverages,
      baseVal
    );
  }, [rows, targetKey, factors, predictionInputs, featureAverages, baseVal]);

  // Determine which of the 3 algorithms is the best decision-making fit for this dataset,
  // based on the highest R² score (goodness of fit) among the computed models.
  const bestAlgorithm = useMemo(() => {
    if (!algorithmModels.length) return null;
    return algorithmModels.reduce((best, m) => (m.r2Score > best.r2Score ? m : best), algorithmModels[0]);
  }, [algorithmModels]);
  const predictionCurveData = useMemo(() => {
    return generatePredictionCurve(algorithmModels, targetAverage, targetStd);
  }, [algorithmModels, targetAverage, targetStd]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(220, prev + 25));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(60, prev - 25));
  const handleResetZoom = () => setZoomLevel(100);

  // Comparison chart data
  const comparisonChartData = useMemo(() => {
    return algorithmModels.map((m) => ({
      name: m.shortName,
      fullName: m.name,
      prediction: m.predictedValue,
      baseline: Number(targetAverage.toFixed(2)),
      difference: Number((m.predictedValue - targetAverage).toFixed(2)),
      color: m.color,
      r2Score: m.r2Score,
      id: m.id
    }));
  }, [algorithmModels, targetAverage]);

  // Dynamic Y-axis domain based on zoom level
  const yDomain = useMemo(() => {
    const values = algorithmModels.map((m) => m.predictedValue).concat([targetAverage]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const center = (minVal + maxVal) / 2;
    const span = Math.max(10, maxVal - minVal);

    const factor = 100 / zoomLevel;
    const zoomedHalfSpan = (span * 0.75 + targetStd * 0.25) * factor;

    return [
      Math.max(0, Math.floor(center - zoomedHalfSpan)),
      Math.ceil(center + zoomedHalfSpan)
    ];
  }, [algorithmModels, targetAverage, targetStd, zoomLevel]);

  // Risk calculation
  const risk =
    predictionResult?.risk ||
    (targetAverage <= 0
      ? 'High'
      : targetStd > Math.abs(targetAverage) * 0.75
      ? 'Medium'
      : 'Low');

  // Slice feature importance items: first 6 records or all if expanded
  const visibleShapItems = showAllFeatures
    ? shapItems
    : shapItems.slice(0, INITIAL_FEATURE_LIMIT);
  const hiddenFeatureCount = shapItems.length - INITIAL_FEATURE_LIMIT;

  return (
    <div className="space-y-6">
      {/* 1. PURPOSE BANNER */}
      <PagePurposeBanner
        pageTitle="Predictive Engine & Model Forecasts"
        stepNumber={3}
        totalSteps={5}
        purposeSummary="Inspect model predictions in interactive graphs, review algorithmic mechanics, adjust scenario inputs, and analyze feature drivers."
        keyGoals={[
          'First view algorithm prediction charts with interactive Zoom In (+) and Zoom Out (-)',
          'Review how algorithms calculate the output, with a collapsible for more depth',
          'Adjust scenario inputs to see real-time forecast outcomes',
          'Inspect top feature drivers with first 6 records shown and expandable view'
        ]}
      />

      {/* Target Variable Selector Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
            <BrainCircuit size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Target Variable to Forecast:
              </span>
              <select
                value={targetKey}
                onChange={(e) => onTargetChange(e.target.value)}
                className="px-3 py-1 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {nums.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Historical Dataset Mean: <b className="text-slate-800">{formatNumber(targetAverage)}</b> (Standard Dev: ±{formatNumber(targetStd)})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetInputs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Reset scenario inputs to dataset averages"
          >
            <RotateCcw size={13} />
            <span>Reset Scenarios</span>
          </button>
        </div>
      </div>

      {/* 2. FIRST: ALGORITHM PREDICTION GRAPHS (With Zoom Controls) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Stage 1: Visual Graphs
              </span>
              <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-600" />
                Algorithm Prediction Visualizer
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Model prediction graph showing forecasts from evaluated machine learning algorithms with interactive zoom controls.
            </p>
          </div>

          {/* Graph Switcher + Zoom Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setGraphType('comparison')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  graphType === 'comparison'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Model Comparison
              </button>
              <button
                type="button"
                onClick={() => setGraphType('curve')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  graphType === 'curve'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sensitivity Curve
              </button>
            </div>

            {/* ZOOM TOOLBAR */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <span className="text-[12px] font-mono text-slate-500 px-1 font-semibold">
                Zoom: {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs border border-slate-200 transition-colors cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs border border-slate-200 transition-colors cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut size={14} />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs border border-slate-200 transition-colors cursor-pointer"
                title="Reset Zoom (100%)"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Graph Display Area */}
        <div className="h-80 w-full pt-2">
          {graphType === 'comparison' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                  interval={0}
                />
                <YAxis
                  domain={yDomain}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => formatNumber(val)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-900">{data.fullName}</p>
                        <p className="text-indigo-600 font-mono font-bold text-sm">
                          Predicted Value: {formatNumber(data.prediction)}
                        </p>
                        <p className="text-slate-500 font-mono text-[13px]">
                          Baseline Mean: {formatNumber(data.baseline)}
                        </p>
                        <p
                          className={`font-semibold text-[13px] ${
                            data.difference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          Shift: {data.difference >= 0 ? '+' : ''}
                          {formatNumber(data.difference)}
                        </p>
                        <p className="text-[12px] text-slate-400">
                          Estimated Fit (R²): {(data.r2Score * 100).toFixed(1)}%
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={targetAverage}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{
                    value: `Baseline (${formatNumber(targetAverage)})`,
                    fill: '#64748b',
                    fontSize: 11,
                    position: 'top'
                  }}
                />
                <Bar
                  dataKey="prediction"
                  radius={[6, 6, 0, 0]}
                  onClick={(entry) => entry?.id && setSelectedAlgoId(entry.id)}
                  cursor="pointer"
                >
                  {comparisonChartData.map((entry) => {
                    const isBest = bestAlgorithm?.id === entry.id;
                    const isSelected = selectedAlgoId === entry.id;
                    return (
                      <Cell
                        key={entry.id}
                        fill={entry.color}
                        stroke={isSelected ? '#0f172a' : isBest ? '#f59e0b' : 'none'}
                        strokeWidth={isSelected ? 2.5 : isBest ? 3 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={predictionCurveData}
                margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="step" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis
                  domain={yDomain}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => formatNumber(val)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-800">{label}</p>
                        {payload.map((p) => (
                          <div
                            key={p.name}
                            className="flex items-center justify-between gap-3 text-[13px]"
                          >
                            <span style={{ color: p.color }} className="font-medium">
                              {p.name}:
                            </span>
                            <span className="font-mono font-bold text-slate-800">
                              {formatNumber(Number(p.value))}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="randomForest"
                  name="Random Forest"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="gradientBoost"
                  name="Gradient Boost"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="linearRidge"
                  name="Linear Ridge"
                  stroke="#0284c7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                />
                <ReferenceLine
                  y={targetAverage}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Baseline',
                    fill: '#94a3b8',
                    fontSize: 10,
                    position: 'insideBottomRight'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
          <span>
            Use <b>Zoom In (+)</b> / <b>Zoom Out (-)</b> above to inspect detailed prediction variances up close.
          </span>
          <span className="font-mono text-indigo-600 font-medium">
            Forecast Baseline: {formatNumber(targetAverage)}
          </span>
        </div>
      </div>

      {/* 3. NEXT: ALGORITHM WORKING FOR THAT OUTPUT (Shown in "less" summary with collapsible for more) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Stage 2: Model Mechanics
              </span>
              <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers size={17} className="text-emerald-600" />
                Algorithm Working &amp; Forecast Explanation
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Summary of how the models derived this prediction from historical feature patterns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsWorkingDetailsOpen((v) => !v)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer w-fit"
          >
            <span>{isWorkingDetailsOpen ? 'Show Less Details' : 'View More Working Details'}</span>
            {isWorkingDetailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Compact ("less") summary view */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" />
              Consensus Prediction: <span className="text-indigo-700 font-mono text-sm">{formatNumber(baseVal)}</span>
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                risk === 'Low'
                  ? 'bg-emerald-100 text-emerald-800'
                  : risk === 'Medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {risk} Variance Risk
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The machine learning engine evaluated historical correlations across {factors.length} predictors.
            Key driving features pushed the baseline average of {formatNumber(targetAverage)} to a projected outcome of{' '}
            <b>{formatNumber(baseVal)}</b> ({baseVal >= targetAverage ? 'above' : 'below'} historical benchmark).
          </p>
        </div>

        {/* Collapsible ("more") working details */}
        {isWorkingDetailsOpen && (
          <div className="space-y-3 pt-2 animate-fadeIn border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Detailed Algorithmic Mechanics &amp; Scoring:
            </h5>

            <div className="grid md:grid-cols-3 gap-3 text-xs">
              {algorithmModels.map((algo) => {
                const isBest = bestAlgorithm?.id === algo.id;
                return (
                  <div
                    key={algo.id}
                    className={`relative p-3.5 rounded-xl bg-white space-y-2 shadow-2xs ${
                      isBest
                        ? 'border-2 border-amber-400 ring-1 ring-amber-200'
                        : 'border border-slate-200'
                    }`}
                  >
                    {isBest && (
                      <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold shadow-sm">
                        ★ Best Fit
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{algo.name}</span>
                      <span className="font-mono text-indigo-600 font-bold">
                        {formatNumber(algo.predictedValue)}
                      </span>
                    </div>
                    <p className="text-slate-500 leading-snug text-[12px]">
                      {algo.simpleExplanation}
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Fit (R²): {(algo.r2Score * 100).toFixed(1)}%</span>
                      <span>Speed: {algo.speed}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {bestAlgorithm && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold">★ Recommended for This Dataset:</span>{' '}
                <span className="font-semibold">{bestAlgorithm.name}</span>
                <p className="text-[12px] text-amber-800 leading-relaxed">
                  With an R² of {(bestAlgorithm.r2Score * 100).toFixed(1)}% and RMSE of {bestAlgorithm.rmse}, this model gives
                  the strongest, most reliable fit on your loaded data — {bestAlgorithm.bestFor.toLowerCase()}
                </p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <span className="font-bold">Model Confidence &amp; Convergence:</span>
              <p className="text-[12px] text-indigo-800 leading-relaxed">
                Convergence reached with an average R² of {(
                  algorithmModels.reduce((acc, m) => acc + m.r2Score, 0) /
                  algorithmModels.length * 100
                ).toFixed(1)}%. Ensemble weighting combines independent tree splits with regularized linear boundaries to safeguard against extreme outliers.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. NEXT: ADJUST SCENARIOS SECTION (Sliders/inputs to change values & immediately observe outcomes) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                Stage 3: What-If Simulation
              </span>
              <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sliders size={18} className="text-sky-600" />
                Adjust Scenarios &amp; Test Live Outcomes
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Change the values below to simulate scenarios and see how predicted outcomes shift immediately.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setScenarioMode('sliders')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  scenarioMode === 'sliders'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sliders View
              </button>
              <button
                type="button"
                onClick={() => setScenarioMode('inputs')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  scenarioMode === 'inputs'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Numeric Inputs
              </button>
            </div>

            <button
              type="button"
              onClick={onResetInputs}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
              title="Reset to dataset average values"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Live Scenario Outcome Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Simulated Forecast for {targetKey}
            </span>
            <div className="text-3xl font-black font-mono text-slate-900 mt-0.5">
              {formatNumber(baseVal)}
            </div>
            <span className="text-xs text-slate-500">
              Historical baseline: <b>{formatNumber(targetAverage)}</b>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                Variance from Mean
              </span>
              <span
                className={`font-mono font-bold text-sm ${
                  baseVal >= targetAverage ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {baseVal >= targetAverage ? '+' : ''}
                {formatNumber(baseVal - targetAverage)}
              </span>
            </div>

            <button
              type="button"
              onClick={onRunPrediction}
              disabled={predictionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={14} />
              <span>{predictionLoading ? 'Recalculating...' : 'Recalculate Models'}</span>
            </button>
          </div>
        </div>

        {/* Feature Sliders / Inputs */}
        {scenarioMode === 'sliders' ? (
          <div className="grid sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto p-1">
            {availableFeatures.map((col) => {
              const val = predictionInputs[col] ?? 0;
              const avg = featureAverages[col] ?? 0;
              const min = Math.min(0, Math.floor(avg * 1.5));
              const max = Math.max(100, Math.round(avg * 2.5));

              return (
                <div
                  key={col}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 truncate" title={col}>
                      {col}
                    </span>
                    <span className="font-mono text-indigo-600 font-bold">
                      {formatNumber(val)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={1}
                    value={val}
                    onChange={(e) => onInputChange(col, Number(e.target.value) || 0)}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>{min}</span>
                    <span>Avg: {formatNumber(avg)}</span>
                    <span>{formatNumber(max)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto p-1">
            {availableFeatures.map((col) => {
              const val = predictionInputs[col] ?? 0;
              const avg = featureAverages[col] ?? 0;

              return (
                <div
                  key={col}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                >
                  <label
                    htmlFor={`input-${col}`}
                    className="block text-xs font-bold text-slate-700 truncate"
                    title={col}
                  >
                    {col}
                  </label>
                  <input
                    id={`input-${col}`}
                    type="number"
                    value={val}
                    onChange={(e) => onInputChange(col, Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="block text-[11px] text-slate-400 font-mono">
                    Dataset Avg: {formatNumber(avg)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. NEXT: FEATURE IMPORTANCE (First 6 records shown, then collapsible for more!) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                Stage 4: Feature Influence
              </span>
              <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles size={17} className="text-amber-500" />
                Feature Importance (What Influenced the Prediction Most)
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked feature contributions displaying initial {INITIAL_FEATURE_LIMIT} records, expandable on demand.
            </p>
          </div>

          {shapItems.length > INITIAL_FEATURE_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAllFeatures((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-indigo-700 transition-colors cursor-pointer w-fit"
            >
              <span>{showAllFeatures ? 'Show First 6 Features' : `See ${hiddenFeatureCount} More Features`}</span>
              {showAllFeatures ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {/* Feature Importance List */}
        <div className="space-y-2">
          {visibleShapItems.map((item, idx) => {
            const isPositive = item.shapValue >= 0;
            const absVal = Math.abs(item.shapValue);

            return (
              <div
                key={item.feature}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{item.feature}</span>
                    <span className="text-slate-400 font-mono text-[12px] ml-2">
                      Input: {formatNumber(item.value)} (Mean: {formatNumber(item.average)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-28 hidden sm:block">
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(15, (absVal / (Math.abs(targetAverage) || 1)) * 100)
                          )}%`
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={`font-mono font-bold text-right w-20 ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isPositive ? '+' : '-'}
                    {formatNumber(absVal)}
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isPositive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isPositive ? 'Pushed Up' : 'Pushed Down'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Expand / Collapse Toggle if length > 6 */}
        {shapItems.length > INITIAL_FEATURE_LIMIT && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowAllFeatures((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              {showAllFeatures ? (
                <>
                  <span>Collapse to First 6 Records</span>
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  <span>View All {shapItems.length} Feature Importance Records</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 6. BOTTOM NAVIGATION */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <span className="text-xs text-slate-500">
          Target forecasted at <b>{formatNumber(baseVal)}</b> ({risk} variance)
        </span>
        <button
          type="button"
          onClick={onAdvanceToNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
        >
          <span>Advance to Executive Reports</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* 7. METHODOLOGY COLLAPSIBLE */}
      <CollapsibleSection
        title="Technical Architecture & Python ML Microservice Specs"
        subtitle="Click to expand detailed information on mathematical equations and background services"
        badge="Specifications"
        initiallyOpen={false}
      >
        <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Cpu size={14} className="text-indigo-600" />
              Decision Tree &amp; Boosting Mechanics
            </h5>
            <p className="text-[13px] text-slate-500">
              Tree-based algorithms partition input feature spaces along hierarchical decision boundaries.
              By combining multiple trees, they cancel out individual model variance and provide robust forecasts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
              <BrainCircuit size={14} className="text-sky-600" />
              Client-Side Fast Mode
            </h5>
            <p className="text-[13px] text-slate-500">
              In-browser inference executes instantaneously so you can drag sliders and test what-if scenarios
              smoothly without server lag.
            </p>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};
