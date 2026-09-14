export type AppPage =
  | 'upload'
  | 'profile'
  | 'visualize'
  | 'custom'
  | 'prediction'
  | 'history'
  | 'reports';

export type AppFunctionId = 'ingestion' | 'analytics' | 'prediction_ai';

export interface AppFunctionPillar {
  id: AppFunctionId;
  number: number;
  title: string;
  subtitle: string;
  pages: AppPage[];
  badge: string;
}

export type DatasetRow = Record<string, string | number>;

export interface ColumnProfile {
  name: string;
  isNumeric: boolean;
  missing: number;
  unique: number;
  mean: number;
  std: number;
  min: number;
  max: number;
}

export interface CorrelationFactor {
  name: string;
  correlation: number;
  score: number;
}

export interface ShapContributionItem {
  feature: string;
  value: number;
  average: number;
  shapValue: number;
  direction: 'up' | 'down';
}

export interface PredictionResultData {
  value: number;
  direction: string;
  risk: 'Low' | 'Medium' | 'High';
  contributions: ShapContributionItem[];
  backend: boolean;
  source: 'backend' | 'frontend';
}

export interface PredictionHistoryEntry {
  id: string;
  timestamp: number;
  datasetName: string;
  targetKey: string;
  predictedValue: number;
  direction: string;
  risk: 'Low' | 'Medium' | 'High';
  source: 'backend' | 'frontend';
  inputs: Record<string, number>;
}

export interface DatasetHistoryEntry {
  id: string;
  name: string;
  size: number;
  timestamp: number;
  rowCount: number;
  columnCount: number;
  rows: DatasetRow[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarColor: string;
  isLoggedIn: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'system';
  targetPage?: AppPage;
}

export type AuthModalMode = 'login' | 'register' | 'forgot_password' | 'change_password';

export type ChartType = 'bar' | 'line' | 'area' | 'scatter' | 'pie';

export interface CustomChartItem {
  id: number;
  title: string;
  type: ChartType;
  xColumn: string;
  yColumn: string;
  rowLimit: number;
}

export interface AlgorithmModelPrediction {
  id: string;
  name: string;
  shortName: string;
  type: string;
  predictedValue: number;
  r2Score: number;
  rmse: number;
  speed: string;
  confidence: number;
  color: string;
  simpleExplanation: string;
  bestFor: string;
  description: string;
}
