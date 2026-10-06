import * as XLSX from 'xlsx';
import {
  DatasetRow,
  ColumnProfile,
  CorrelationFactor,
  ShapContributionItem,
  AlgorithmModelPrediction
} from '../types';

export const INITIAL_DATASET: { name: string; rows: DatasetRow[] } = {
  name: 'sales_performance_q1_q4.csv',
  rows: [
    { Quarter: 'Q1', Region: 'North', Sales: 42500, Advertising: 12000, Discounts: 3500, OperationalCost: 18500, CustomerSatisfaction: 84, UnitsSold: 1420, Profit: 8500 },
    { Quarter: 'Q1', Region: 'South', Sales: 38200, Advertising: 9500, Discounts: 2800, OperationalCost: 16200, CustomerSatisfaction: 81, UnitsSold: 1280, Profit: 9700 },
    { Quarter: 'Q1', Region: 'East', Sales: 51000, Advertising: 15400, Discounts: 4200, OperationalCost: 21000, CustomerSatisfaction: 89, UnitsSold: 1710, Profit: 10400 },
    { Quarter: 'Q1', Region: 'West', Sales: 47800, Advertising: 13800, Discounts: 3900, OperationalCost: 19800, CustomerSatisfaction: 86, UnitsSold: 1590, Profit: 10200 },
    { Quarter: 'Q2', Region: 'North', Sales: 45600, Advertising: 13100, Discounts: 3800, OperationalCost: 19200, CustomerSatisfaction: 85, UnitsSold: 1510, Profit: 9500 },
    { Quarter: 'Q2', Region: 'South', Sales: 41000, Advertising: 10800, Discounts: 3100, OperationalCost: 17100, CustomerSatisfaction: 83, UnitsSold: 1360, Profit: 10000 },
    { Quarter: 'Q2', Region: 'East', Sales: 54200, Advertising: 16800, Discounts: 4600, OperationalCost: 22400, CustomerSatisfaction: 91, UnitsSold: 1820, Profit: 10400 },
    { Quarter: 'Q2', Region: 'West', Sales: 49500, Advertising: 14600, Discounts: 4100, OperationalCost: 20500, CustomerSatisfaction: 88, UnitsSold: 1650, Profit: 10300 },
    { Quarter: 'Q3', Region: 'North', Sales: 48900, Advertising: 14500, Discounts: 4300, OperationalCost: 20200, CustomerSatisfaction: 87, UnitsSold: 1620, Profit: 9900 },
    { Quarter: 'Q3', Region: 'South', Sales: 43500, Advertising: 11900, Discounts: 3400, OperationalCost: 18000, CustomerSatisfaction: 84, UnitsSold: 1440, Profit: 10200 },
    { Quarter: 'Q3', Region: 'East', Sales: 58000, Advertising: 18200, Discounts: 5100, OperationalCost: 24100, CustomerSatisfaction: 93, UnitsSold: 1950, Profit: 10600 },
    { Quarter: 'Q3', Region: 'West', Sales: 53100, Advertising: 16100, Discounts: 4500, OperationalCost: 21900, CustomerSatisfaction: 90, UnitsSold: 1780, Profit: 10600 },
    { Quarter: 'Q4', Region: 'North', Sales: 56400, Advertising: 17800, Discounts: 5200, OperationalCost: 23500, CustomerSatisfaction: 90, UnitsSold: 1880, Profit: 9900 },
    { Quarter: 'Q4', Region: 'South', Sales: 49200, Advertising: 14200, Discounts: 4000, OperationalCost: 20100, CustomerSatisfaction: 86, UnitsSold: 1640, Profit: 10900 },
    { Quarter: 'Q4', Region: 'East', Sales: 65800, Advertising: 21500, Discounts: 6200, OperationalCost: 27500, CustomerSatisfaction: 95, UnitsSold: 2210, Profit: 10600 },
    { Quarter: 'Q4', Region: 'West', Sales: 61200, Advertising: 19400, Discounts: 5700, OperationalCost: 25400, CustomerSatisfaction: 92, UnitsSold: 2050, Profit: 10700 }
  ]
};

export function formatNumber(val: number): string {
  if (!Number.isFinite(val)) return '0';
  if (Math.abs(val) >= 1_000_000) {
    return (val / 1_000_000).toFixed(2) + 'M';
  }
  if (Math.abs(val) >= 1_000) {
    return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
  return val.toFixed(2).replace(/\.00$/, '');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function numericKeys(rows: DatasetRow[]): string[] {
  if (!rows || !rows.length) return [];
  const keys = Object.keys(rows[0]);
  return keys.filter((key) => {
    let numericCount = 0;
    let nonNullCount = 0;
    for (const r of rows) {
      const val = r[key];
      if (val !== undefined && val !== null && val !== '') {
        nonNullCount++;
        const num = Number(val);
        if (!isNaN(num) && isFinite(num)) {
          numericCount++;
        }
      }
    }
    return nonNullCount > 0 && numericCount / nonNullCount >= 0.8;
  });
}

export function categoricalKeys(rows: DatasetRow[]): string[] {
  if (!rows || !rows.length) return [];
  const allKeys = Object.keys(rows[0]);
  const numKeys = new Set(numericKeys(rows));
  return allKeys.filter((k) => !numKeys.has(k));
}

export function calculateAverage(rows: DatasetRow[], col: string): number {
  if (!rows || !rows.length) return 0;
  let sum = 0;
  let count = 0;
  for (const r of rows) {
    const val = Number(r[col]);
    if (!isNaN(val) && isFinite(val)) {
      sum += val;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

export function calculateStd(rows: DatasetRow[], col: string): number {
  if (!rows || rows.length <= 1) return 0;
  const avg = calculateAverage(rows, col);
  let sumDiffSq = 0;
  let count = 0;
  for (const r of rows) {
    const val = Number(r[col]);
    if (!isNaN(val) && isFinite(val)) {
      sumDiffSq += Math.pow(val - avg, 2);
      count++;
    }
  }
  return count > 1 ? Math.sqrt(sumDiffSq / (count - 1)) : 0;
}

export function calculateCorrelation(
  rows: DatasetRow[],
  colX: string,
  colY: string
): number {
  if (!rows || rows.length <= 1) return 0;
  const avgX = calculateAverage(rows, colX);
  const avgY = calculateAverage(rows, colY);
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;
  for (const r of rows) {
    const x = Number(r[colX]);
    const y = Number(r[colY]);
    if (!isNaN(x) && isFinite(x) && !isNaN(y) && isFinite(y)) {
      const dx = x - avgX;
      const dy = y - avgY;
      sumXY += dx * dy;
      sumX2 += dx * dx;
      sumY2 += dy * dy;
    }
  }
  const denominator = Math.sqrt(sumX2 * sumY2);
  if (denominator === 0) return 0;
  const r = sumXY / denominator;
  return Number.isFinite(r) ? Math.max(-1, Math.min(1, r)) : 0;
}

/**
 * Detects columns that are identifiers/labels stored as numbers (pin code, zip, id, phone...)
 * or are almost constant relative to their size. Forecasting these is meaningless.
 */
export function isLikelyIdentifierColumn(name: string, rows: DatasetRow[]): boolean {
  const byName =
    /(^|[^a-z])(pin|pincode|zip|zipcode|postal|id|uuid|phone|mobile|serial|index)([^a-z]|$)/i.test(name) ||
    /pin\s*code|zip\s*code|postal/i.test(name);
  if (byName) return true;
  const avg = calculateAverage(rows, name);
  const std = calculateStd(rows, name);
  return Math.abs(avg) > 1000 && std / Math.abs(avg) < 0.001;
}

export function computeColumnProfiles(
  rows: DatasetRow[],
  numericCols: string[]
): ColumnProfile[] {
  if (!rows || !rows.length) return [];
  const allCols = Object.keys(rows[0]);
  const numSet = new Set(numericCols);

  return allCols.map((col) => {
    const isNum = numSet.has(col);
    let missing = 0;
    const uniqueVals = new Set<string>();
    const numVals: number[] = [];

    rows.forEach((r) => {
      const val = r[col];
      if (val === undefined || val === null || val === '') {
        missing++;
      } else {
        uniqueVals.add(String(val));
        if (isNum) {
          const num = Number(val);
          if (!isNaN(num) && isFinite(num)) {
            numVals.push(num);
          }
        }
      }
    });

    let mean = 0;
    let std = 0;
    let min = 0;
    let max = 0;

    if (isNum && numVals.length) {
      mean = numVals.reduce((a, b) => a + b, 0) / numVals.length;
      min = Math.min(...numVals);
      max = Math.max(...numVals);
      if (numVals.length > 1) {
        const sq = numVals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
        std = Math.sqrt(sq / (numVals.length - 1));
      }
    }

    return {
      name: col,
      isNumeric: isNum,
      missing,
      unique: uniqueVals.size,
      mean: isNum ? Math.round(mean * 100) / 100 : 0,
      std: isNum ? Math.round(std * 100) / 100 : 0,
      min: isNum ? min : 0,
      max: isNum ? max : 0
    };
  });
}

export function buildShapContributions(
  rows: DatasetRow[],
  targetKey: string,
  factors: CorrelationFactor[],
  inputs: Record<string, number>,
  featureAverages: Record<string, number>
): ShapContributionItem[] {
  if (!factors.length || !targetKey) return [];
  const targetStd = calculateStd(rows, targetKey) || 1;

  return factors.map((factor) => {
    const featureName = factor.name;
    const val = inputs[featureName] ?? featureAverages[featureName] ?? 0;
    const avg = featureAverages[featureName] ?? 0;
    const std = calculateStd(rows, featureName) || 1;

    const z = (val - avg) / std;
    const rawContribution = z * factor.correlation * (targetStd * 0.35);

    return {
      feature: featureName,
      value: val,
      average: avg,
      shapValue: Number(rawContribution.toFixed(2)),
      direction: rawContribution >= 0 ? 'up' : 'down'
    };
  });
}

/* ========================================================================== */
/*  REAL IN-BROWSER MACHINE LEARNING                                          */
/*  Ridge Regression, Random Forest, Gradient Boosting — trained on your rows  */
/*  R² and RMSE come from K-fold cross-validation, not hardcoded numbers.      */
/* ========================================================================== */

type Predictor = (x: number[]) => number;
type TreeNode =
  | { leaf: number }
  | { feat: number; thr: number; left: TreeNode; right: TreeNode };

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toNum(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function meanOf(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function buildTree(
  X: number[][],
  y: number[],
  idx: number[],
  depth: number,
  maxDepth: number,
  minLeaf: number,
  featCandidates: () => number[]
): TreeNode {
  const n = idx.length;
  let total = 0;
  for (const i of idx) total += y[i];
  const mean = n ? total / n : 0;
  if (depth >= maxDepth || n < minLeaf * 2) return { leaf: mean };

  let bestGain = 1e-12;
  let bestFeat = -1;
  let bestThr = 0;

  for (const f of featCandidates()) {
    const sorted = idx.slice().sort((a, b) => X[a][f] - X[b][f]);
    let sl = 0;
    for (let k = 0; k < n - 1; k++) {
      const i = sorted[k];
      sl += y[i];
      const nl = k + 1;
      const nr = n - nl;
      if (nl < minLeaf || nr < minLeaf) continue;
      const xa = X[i][f];
      const xb = X[sorted[k + 1]][f];
      if (xa === xb) continue;
      const sr = total - sl;
      const gain = (sl * sl) / nl + (sr * sr) / nr - (total * total) / n;
      if (gain > bestGain) {
        bestGain = gain;
        bestFeat = f;
        bestThr = (xa + xb) / 2;
      }
    }
  }

  if (bestFeat < 0) return { leaf: mean };

  const leftIdx: number[] = [];
  const rightIdx: number[] = [];
  for (const i of idx) (X[i][bestFeat] <= bestThr ? leftIdx : rightIdx).push(i);

  return {
    feat: bestFeat,
    thr: bestThr,
    left: buildTree(X, y, leftIdx, depth + 1, maxDepth, minLeaf, featCandidates),
    right: buildTree(X, y, rightIdx, depth + 1, maxDepth, minLeaf, featCandidates)
  };
}

function predictTree(node: TreeNode, x: number[]): number {
  let cur = node;
  while (!('leaf' in cur)) {
    cur = x[cur.feat] <= cur.thr ? cur.left : cur.right;
  }
  return cur.leaf;
}

function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    }
    if (Math.abs(M[piv][col]) < 1e-12) continue;
    [M[col], M[piv]] = [M[piv], M[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) => (Math.abs(row[i]) < 1e-12 ? 0 : row[n] / row[i]));
}

function fitRidge(X: number[][], y: number[], lambda = 1): Predictor {
  const n = X.length;
  const p = X[0].length;
  const mu = new Array(p).fill(0);
  const sd = new Array(p).fill(1);
  for (let j = 0; j < p; j++) {
    mu[j] = meanOf(X.map((r) => r[j]));
    const v = X.reduce((a, r) => a + (r[j] - mu[j]) ** 2, 0) / Math.max(1, n - 1);
    sd[j] = Math.sqrt(v) || 1;
  }
  const ym = meanOf(y);
  const Z = X.map((r) => r.map((v, j) => (v - mu[j]) / sd[j]));
  const A: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const b = new Array(p).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      b[j] += Z[i][j] * (y[i] - ym);
      for (let k = 0; k < p; k++) A[j][k] += Z[i][j] * Z[i][k];
    }
  }
  for (let j = 0; j < p; j++) A[j][j] += lambda;
  const w = solveLinear(A, b);
  return (x) => {
    let out = ym;
    for (let j = 0; j < p; j++) out += w[j] * ((x[j] - mu[j]) / sd[j]);
    return out;
  };
}

function fitForest(X: number[][], y: number[], seed: number): Predictor {
  const rng = mulberry32(seed);
  const n = X.length;
  const p = X[0].length;
  const mtry = Math.max(1, Math.ceil(p / 2));
  const ym = meanOf(y);
  const yc = y.map((v) => v - ym);
  const trees: TreeNode[] = [];

  const pick = () => {
    const all = Array.from({ length: p }, (_, i) => i);
    for (let i = p - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, mtry);
  };

  for (let t = 0; t < 40; t++) {
    const boot = Array.from({ length: n }, () => Math.floor(rng() * n));
    trees.push(buildTree(X, yc, boot, 0, 6, 3, pick));
  }
  return (x) => ym + meanOf(trees.map((tr) => predictTree(tr, x)));
}

function fitBoost(X: number[][], y: number[]): Predictor {
  const n = X.length;
  const p = X[0].length;
  const ym = meanOf(y);
  const resid = y.map((v) => v - ym);
  const allFeats = Array.from({ length: p }, (_, i) => i);
  const allIdx = Array.from({ length: n }, (_, i) => i);
  const lr = 0.1;
  const trees: TreeNode[] = [];

  for (let m = 0; m < 80; m++) {
    const tree = buildTree(X, resid, allIdx, 0, 3, 4, () => allFeats);
    trees.push(tree);
    for (let i = 0; i < n; i++) resid[i] -= lr * predictTree(tree, X[i]);
  }
  return (x) => {
    let out = ym;
    for (const tr of trees) out += lr * predictTree(tr, x);
    return out;
  };
}

type Fitter = (X: number[][], y: number[]) => Predictor;

function crossValidate(fit: Fitter, X: number[][], y: number[], folds: number) {
  const n = y.length;
  const rng = mulberry32(42);
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const oof = new Array(n).fill(0);
  for (let f = 0; f < folds; f++) {
    const testSet = new Set<number>();
    for (let k = f; k < n; k += folds) testSet.add(order[k]);
    const Xtr: number[][] = [];
    const ytr: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!testSet.has(i)) {
        Xtr.push(X[i]);
        ytr.push(y[i]);
      }
    }
    const model = fit(Xtr, ytr);
    testSet.forEach((i) => {
      oof[i] = model(X[i]);
    });
  }
  const ym = meanOf(y);
  let sse = 0;
  let sst = 0;
  for (let i = 0; i < n; i++) {
    sse += (y[i] - oof[i]) ** 2;
    sst += (y[i] - ym) ** 2;
  }
  return {
    r2: sst > 0 ? 1 - sse / sst : 0,
    rmse: Math.sqrt(sse / n)
  };
}

interface TrainedModel {
  predict: Predictor;
  r2: number;
  rmse: number;
  ms: number;
}
type TrainedBundle = Record<'random_forest' | 'gradient_boost' | 'linear_ridge', TrainedModel>;

const modelCache = new WeakMap<DatasetRow[], Map<string, TrainedBundle>>();

function buildTrainingData(rows: DatasetRow[], targetKey: string, features: string[]) {
  const colMeans = features.map((f) => {
    let s = 0;
    let c = 0;
    for (const r of rows) {
      const v = toNum(r[f]);
      if (v !== null) {
        s += v;
        c++;
      }
    }
    return c ? s / c : 0;
  });

  let X: number[][] = [];
  let y: number[] = [];
  for (const r of rows) {
    const t = toNum(r[targetKey]);
    if (t === null) continue;
    X.push(
      features.map((f, j) => {
        const v = toNum(r[f]);
        return v === null ? colMeans[j] : v;
      })
    );
    y.push(t);
  }

  // Keep training fast on very large files
  const MAX_ROWS = 3000;
  if (y.length > MAX_ROWS) {
    const stride = y.length / MAX_ROWS;
    const X2: number[][] = [];
    const y2: number[] = [];
    for (let k = 0; k < MAX_ROWS; k++) {
      const i = Math.floor(k * stride);
      X2.push(X[i]);
      y2.push(y[i]);
    }
    X = X2;
    y = y2;
  }
  return { X, y };
}

function trainBundle(X: number[][], y: number[]): TrainedBundle {
  const yMean = meanOf(y);
  const n = y.length;
  const p = n ? X[0].length : 0;

  if (n < 12 || p === 0) {
    const flat = (): TrainedModel => ({ predict: () => yMean, r2: 0, rmse: 0, ms: 0 });
    return { random_forest: flat(), gradient_boost: flat(), linear_ridge: flat() };
  }

  const folds = n > 2000 ? 3 : 5;
  const fitters: Record<keyof TrainedBundle, Fitter> = {
    random_forest: (Xt, yt) => fitForest(Xt, yt, 7),
    gradient_boost: (Xt, yt) => fitBoost(Xt, yt),
    linear_ridge: (Xt, yt) => fitRidge(Xt, yt, 1)
  };

  const out = {} as TrainedBundle;
  (Object.keys(fitters) as (keyof TrainedBundle)[]).forEach((id) => {
    const cv = crossValidate(fitters[id], X, y, folds);
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const predict = fitters[id](X, y);
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    out[id] = { predict, r2: cv.r2, rmse: cv.rmse, ms: t1 - t0 };
  });
  return out;
}

function getBundle(rows: DatasetRow[], targetKey: string, features: string[]): TrainedBundle {
  let perRows = modelCache.get(rows);
  if (!perRows) {
    perRows = new Map();
    modelCache.set(rows, perRows);
  }
  const key = `${targetKey}|${features.join(',')}`;
  let bundle = perRows.get(key);
  if (!bundle) {
    const { X, y } = buildTrainingData(rows, targetKey, features);
    bundle = trainBundle(X, y);
    perRows.set(key, bundle);
  }
  return bundle;
}

export function computeAlgorithmPredictions(
  rows: DatasetRow[],
  targetKey: string,
  factors: CorrelationFactor[],
  inputs: Record<string, number>,
  featureAverages: Record<string, number>,
  _baselineVal: number
): AlgorithmModelPrediction[] {
  const features = Array.from(new Set(factors.map((f) => f.name))).filter(
    (n) => n !== targetKey
  );

  const bundle = getBundle(rows, targetKey, features);

  const x = features.map((n) => {
    const v = inputs[n];
    return Number.isFinite(v) ? v : featureAverages[n] ?? 0;
  });

  const round2 = (v: number) => Math.round(v * 100) / 100;
  const r3 = (v: number) => Math.round(v * 1000) / 1000;
  const conf = (r2: number) => Math.round(Math.max(0, Math.min(1, r2)) * 100);
  const speed = (ms: number) => `${Math.max(1, Math.round(ms))}ms train`;

  const rf = bundle.random_forest;
  const gb = bundle.gradient_boost;
  const lr = bundle.linear_ridge;

  return [
    {
      id: 'random_forest',
      name: 'Random Forest Regressor',
      shortName: 'Random Forest',
      type: 'Ensemble of 40 Decision Trees',
      predictedValue: round2(rf.predict(x)),
      r2Score: r3(rf.r2),
      rmse: round2(rf.rmse),
      speed: speed(rf.ms),
      confidence: conf(rf.r2),
      color: '#4f46e5',
      simpleExplanation:
        'Averages 40 independent decision trees to produce a stable, low-variance estimate.',
      bestFor: 'Complex multi-variable interactions with non-linear boundaries.',
      description:
        'Bootstraps multiple decision trees with random feature sub-sampling to avoid overfitting.'
    },
    {
      id: 'gradient_boost',
      name: 'Gradient Boosting Machine',
      shortName: 'Gradient Boost',
      type: 'Sequential Error-Correcting Trees',
      predictedValue: round2(gb.predict(x)),
      r2Score: r3(gb.r2),
      rmse: round2(gb.rmse),
      speed: speed(gb.ms),
      confidence: conf(gb.r2),
      color: '#059669',
      simpleExplanation:
        'Builds sequential trees where each new tree specifically fixes errors made by earlier trees.',
      bestFor: 'Highest predictive precision on tabular business datasets.',
      description:
        'Minimizes mean squared loss gradients through iterative shrinkage and learning rates.'
    },
    {
      id: 'linear_ridge',
      name: 'Linear Ridge Regression (L2)',
      shortName: 'Linear Ridge',
      type: 'Regularized Parametric Regression',
      predictedValue: round2(lr.predict(x)),
      r2Score: r3(lr.r2),
      rmse: round2(lr.rmse),
      speed: speed(lr.ms),
      confidence: conf(lr.r2),
      color: '#0284c7',
      simpleExplanation:
        'Fits a smooth, transparent linear line with penalty weights to prevent extreme values.',
      bestFor: 'Fast baseline benchmarking and direct linear proportionality.',
      description:
        'Applies Tikhonov L2 norm penalty to ordinary least squares to mitigate collinearity.'
    }
  ];
}

export function generatePredictionCurve(
  algorithms: AlgorithmModelPrediction[],
  targetAvg: number,
  targetStd: number
) {
  const steps = [
    '-40%', '-30%', '-20%', '-10%', '-5%', 'Baseline',
    '+5%', '+10%', '+20%', '+30%', '+40%', '+50%'
  ];

  const rfBase = algorithms.find((a) => a.id === 'random_forest')?.predictedValue || targetAvg;
  const gbBase = algorithms.find((a) => a.id === 'gradient_boost')?.predictedValue || targetAvg;
  const lrBase = algorithms.find((a) => a.id === 'linear_ridge')?.predictedValue || targetAvg;

  return steps.map((step) => {
    let pct = 0;
    if (step !== 'Baseline') {
      pct = Number(step.replace('%', '')) / 100;
    }

    const rfVal = rfBase + pct * (targetStd * 0.9) * 0.92;
    const gbVal = gbBase + pct * (targetStd * 0.95) * 1.05;
    const lrVal = lrBase + pct * (targetStd * 0.85);

    return {
      step,
      randomForest: Math.round(rfVal * 10) / 10,
      gradientBoost: Math.round(gbVal * 10) / 10,
      linearRidge: Math.round(lrVal * 10) / 10
    };
  });
}

export function parseCSV(text: string): DatasetRow[] {
  if (!text || !text.trim()) return [];
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const rows: DatasetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCsvLine(line);
    const rowObj: DatasetRow = {};

    headers.forEach((h, idx) => {
      const raw = values[idx] !== undefined ? values[idx].trim() : '';
      const num = Number(raw);
      if (raw !== '' && !isNaN(num) && isFinite(num)) {
        rowObj[h] = num;
      } else {
        rowObj[h] = raw;
      }
    });

    rows.push(rowObj);
  }

  return rows;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current.replace(/^"|"$/g, '').trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^"|"$/g, '').trim());
  return result;
}

export function parseExcelBuffer(buffer: ArrayBuffer): DatasetRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  return json.map((r) => {
    const clean: DatasetRow = {};
    Object.keys(r).forEach((k) => {
      const val = r[k];
      const num = Number(val);
      if (val !== '' && !isNaN(num) && isFinite(num)) {
        clean[k] = num;
      } else {
        clean[k] = String(val);
      }
    });
    return clean;
  });
}
