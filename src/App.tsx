import React, { useState, useMemo, useEffect } from 'react';
import {
  DatasetRow,
  AppPage,
  AppFunctionPillar,
  PredictionResultData,
  PredictionHistoryEntry,
  DatasetHistoryEntry,
  UserProfile,
  AppNotification,
  AuthModalMode
} from './types';
import {
  INITIAL_DATASET,
  parseCSV,
  parseExcelBuffer,
  numericKeys,
  categoricalKeys,
  calculateAverage,
  calculateStd,
  calculateCorrelation,
  computeColumnProfiles,
  buildShapContributions
} from './utils/dataAnalysis';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Breadcrumb } from './components/Breadcrumb';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { AuthModal } from './components/AuthModal';
import { DatasetLoadingModal } from './components/DatasetLoadingModal';

// Stage Pages: Visual & Custom charts are embedded inside DataProfilePage!
// History is at the end of the sidebar!
import { UploadPage } from './pages/UploadPage';
import { DataProfilePage } from './pages/DataProfilePage';
import { PredictionPage } from './pages/PredictionPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { VisualizePage } from './pages/VisualizePage';
import { CustomChartsPage } from './pages/CustomChartsPage';

const PILLARS: AppFunctionPillar[] = [
  {
    id: 'ingestion',
    number: 1,
    title: 'Data Ingestion & Profiling',
    subtitle: 'Upload spreadsheets, inspect schema & explore charts',
    pages: ['upload', 'profile'],
    badge: 'Function 1'
  },
  {
    id: 'prediction_ai',
    number: 2,
    title: 'Predictive ML Engine',
    subtitle: 'Multi-model algorithms, sensitivity curves & forecasts',
    pages: ['prediction'],
    badge: 'Function 2'
  },
  {
    id: 'analytics',
    number: 3,
    title: 'Audit & History',
    subtitle: 'Executive reports and saved dataset history catalog',
    pages: ['reports', 'history'],
    badge: 'Function 3'
  }
];

// Sidebar & Stage Order: History is AT THE END!
const STAGE_ORDER: AppPage[] = [
  'upload',
  'profile',
  'prediction',
  'reports',
  'history'
];

const STAGE_TITLES: Record<AppPage, string> = {
  upload: 'Upload Dataset',
  profile: 'Data Profiling & Schema',
  visualize: 'Visual Analytics',
  custom: 'Custom Chart Studio',
  prediction: 'Predictive Engine',
  reports: 'Executive Reports',
  history: 'History'
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('upload');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('insightiq_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      id: 'usr_rida',
      name: 'Rida Parveen',
      email: 'ridaparveen116@gmail.com',
      role: 'Student / Analyst',
      initials: 'RP',
      avatarColor: 'bg-indigo-600',
      isLoggedIn: true
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  // In-App Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Dataset Ingested',
      message: 'sales_performance_q1_q4.csv parsed with 16 rows and 9 dimensions.',
      time: '1m ago',
      timestamp: Date.now() - 60000,
      read: false,
      type: 'success',
      targetPage: 'profile'
    },
    {
      id: 'notif-2',
      title: 'ML Models Ready',
      message: 'Random Forest and Gradient Boost models initialized with >95% confidence.',
      time: '3m ago',
      timestamp: Date.now() - 180000,
      read: false,
      type: 'info',
      targetPage: 'prediction'
    },
    {
      id: 'notif-3',
      title: 'Data Health Score',
      message: 'Dataset quality scored at 9.5/10 with 100% completeness rate.',
      time: '8m ago',
      timestamp: Date.now() - 480000,
      read: true,
      type: 'system',
      targetPage: 'history'
    }
  ]);

  const addNotification = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'system' = 'info',
    targetPage?: AppPage
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      type,
      targetPage
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('insightiq_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    addNotification('Signed In Successfully', `Welcome back, ${user.name}!`, 'success');
  };

  const handleLogout = () => {
    const guest: UserProfile = {
      id: 'guest',
      name: 'Guest User',
      email: '',
      role: 'Guest Analyst',
      initials: 'GU',
      avatarColor: 'bg-slate-500',
      isLoggedIn: false
    };
    setCurrentUser(guest);
    try {
      localStorage.removeItem('insightiq_user');
    } catch {
      // ignore
    }
    addNotification('Signed Out', 'You are now browsing in guest mode.', 'system');
  };

  // Dataset State
  const [rows, setRows] = useState<DatasetRow[]>(INITIAL_DATASET.rows);
  const [fileName, setFileName] = useState<string>(INITIAL_DATASET.name);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Reopen loading animation modal
  const [isReopenLoading, setIsReopenLoading] = useState(false);
  const [reopenTarget, setReopenTarget] = useState<DatasetHistoryEntry | null>(null);

  // Prediction State
  const [targetKey, setTargetKey] = useState<string>('Profit');
  const [predictionInputs, setPredictionInputs] = useState<Record<string, number>>({});
  const [predictionResult, setPredictionResult] = useState<PredictionResultData | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  // Histories State
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('insightiq_pred_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [datasetHistory, setDatasetHistory] = useState<DatasetHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('insightiq_data_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'ds-init',
        name: INITIAL_DATASET.name,
        size: 14200,
        timestamp: Date.now() - 3600000,
        rowCount: INITIAL_DATASET.rows.length,
        columnCount: Object.keys(INITIAL_DATASET.rows[0] || {}).length,
        rows: INITIAL_DATASET.rows
      }
    ];
  });

  // AI Assistant Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Derive Numeric & Categorical Keys
  const nums = useMemo(() => numericKeys(rows), [rows]);
  const cats = useMemo(() => categoricalKeys(rows), [rows]);

  // The "default" target variable for whichever dataset is currently loaded.
  // Used by "Reset Scenarios" so a full reset also restores the original target,
  // not just the slider/input values.
  const defaultTargetKey = useMemo(() => {
    if (!nums.length) return 'Profit';
    return nums.includes('Profit') ? 'Profit' : nums[nums.length - 1] || nums[0];
  }, [nums]);

  // Ensure Target Key is valid
  useEffect(() => {
    if (!nums.length) return;
    if (!nums.includes(targetKey)) {
      setTargetKey(nums[nums.length - 1] || nums[0]);
    }
  }, [nums, targetKey]);

  // Derived Column Profiles
  const columnProfiles = useMemo(() => computeColumnProfiles(rows, nums), [rows, nums]);

  // Feature Averages
  const featureAverages = useMemo(() => {
    const map: Record<string, number> = {};
    nums.forEach((col) => {
      map[col] = calculateAverage(rows, col);
    });
    return map;
  }, [rows, nums]);

  // Initialize prediction inputs when features or target change
  useEffect(() => {
    const initial: Record<string, number> = {};
    nums.filter((c) => c !== targetKey).forEach((col) => {
      initial[col] = featureAverages[col] ?? 0;
    });
    setPredictionInputs(initial);
    setPredictionResult(null);
  }, [nums, targetKey, featureAverages]);

  // Correlation Factors with respect to targetKey
  const factors = useMemo(() => {
    if (!targetKey) return [];
    return nums
      .filter((c) => c !== targetKey)
      .map((name) => {
        const c = calculateCorrelation(rows, name, targetKey);
        return {
          name,
          correlation: c,
          score: Math.abs(c)
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [rows, nums, targetKey]);

  // Target metrics
  const targetAverage = targetKey ? calculateAverage(rows, targetKey) : 0;
  const targetStd = targetKey ? calculateStd(rows, targetKey) : 0;

  // Usability & Completeness Scores
  const usabilityScore = useMemo(() => {
    if (!rows.length) return 0;
    let filled = 0;
    let total = 0;
    rows.forEach((r) => {
      Object.values(r).forEach((v) => {
        total++;
        if (v !== '' && v != null) filled++;
      });
    });
    const completenessRatio = total ? filled / total : 0;
    let score = 5.5 + completenessRatio * 2.5;
    if (nums.length >= 3) score += 1.0;
    if (cats.length >= 1) score += 0.5;
    return Math.min(10, Math.round(score * 10) / 10);
  }, [rows, nums, cats]);

  const dataCompleteness = useMemo(() => {
    if (!rows.length) return 100;
    let filled = 0;
    let total = 0;
    rows.forEach((r) => {
      Object.values(r).forEach((v) => {
        total++;
        if (v !== '' && v != null) filled++;
      });
    });
    return total ? Math.round((filled / total) * 100) : 100;
  }, [rows]);

  // SHAP Contributions
  const shapItems = useMemo(() => {
    return buildShapContributions(
      rows,
      targetKey,
      factors,
      predictionInputs,
      featureAverages
    );
  }, [rows, targetKey, factors, predictionInputs, featureAverages]);

  // Navigation handlers
  const handleNavigate = (page: AppPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentIndex = STAGE_ORDER.indexOf(currentPage);
  const previousPage = currentIndex > 0 ? STAGE_ORDER[currentIndex - 1] : null;
  const nextPage = currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentIndex + 1] : null;

  const previousPageName = previousPage ? STAGE_TITLES[previousPage] : undefined;
  const nextPageName = nextPage ? STAGE_TITLES[nextPage] : undefined;

  const handlePrevious = previousPage ? () => handleNavigate(previousPage) : undefined;
  const handleNext = nextPage ? () => handleNavigate(nextPage) : undefined;

  // Active Pillar calculation
  const activePillar = useMemo(() => {
    return (
      PILLARS.find((p) => p.pages.includes(currentPage)) || PILLARS[0]
    );
  }, [currentPage]);

  const handleSelectPillar = (pillarId: string) => {
    const pillar = PILLARS.find((p) => p.id === pillarId);
    if (pillar && pillar.pages.length > 0) {
      handleNavigate(pillar.pages[0]);
    }
  };

  // File loading logic
  const handleFileLoaded = (file: File) => {
    const reader = new FileReader();
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    reader.onload = (event) => {
      try {
        let parsed: DatasetRow[] = [];
        if (isCsv) {
          parsed = parseCSV(event.target?.result as string);
        } else {
          parsed = parseExcelBuffer(event.target?.result as ArrayBuffer);
        }

        if (!parsed.length) {
          alert('Could not find any rows in this spreadsheet. Please ensure headers are on row 1.');
          return;
        }

        setRows(parsed);
        setFileName(file.name);
        setUploadedFile(file);

        // Record into dataset history
        const newEntry: DatasetHistoryEntry = {
          id: `upload-${Date.now()}`,
          name: file.name,
          size: file.size,
          timestamp: Date.now(),
          rowCount: parsed.length,
          columnCount: Object.keys(parsed[0] || {}).length,
          rows: parsed
        };

        const updatedHistory = [newEntry, ...datasetHistory.filter((d) => d.name !== file.name)].slice(0, 15);
        setDatasetHistory(updatedHistory);
        try {
          localStorage.setItem('insightiq_data_history', JSON.stringify(updatedHistory));
        } catch {
          // ignore quota error
        }

        // FIX: notification + navigation now both point to 'profile' —
        // a freshly loaded dataset must always open Data Profiling first,
        // never jump straight to the Predictive Engine.
        addNotification(
          'Dataset Loaded Successfully',
          `${file.name} loaded with ${parsed.length} rows and ${Object.keys(parsed[0] || {}).length} columns.`,
          'success',
          'profile'
        );

        handleNavigate('profile');
      } catch {
        alert('Error parsing the file. Please verify it is a valid CSV or Excel file.');
      }
    };

    if (isCsv) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Handle dataset reopening with circular loading modal
  const handleReopenDatasetWithAnimation = (entry: DatasetHistoryEntry) => {
    setReopenTarget(entry);
    setIsReopenLoading(true);
  };

  const handleReopenComplete = () => {
    setIsReopenLoading(false);
    if (reopenTarget) {
      setRows(reopenTarget.rows);
      setFileName(reopenTarget.name);
      setReopenTarget(null);
      handleNavigate('profile');
      addNotification('Dataset Loaded', `Opened ${reopenTarget.name} into active workspace.`, 'info', 'profile');
    }
  };

  // Prediction Inference Execution
  const handleRunPrediction = async () => {
    if (!targetKey || !factors.length) return;
    setPredictionLoading(true);

    let sumDelta = 0;
    factors.slice(0, 7).forEach((factor) => {
      const inputVal = predictionInputs[factor.name] ?? featureAverages[factor.name] ?? 0;
      const avgVal = featureAverages[factor.name] ?? 0;
      const stdVal = calculateStd(rows, factor.name) || 1;
      const z = (inputVal - avgVal) / stdVal;
      const weight = factor.correlation;
      sumDelta += z * weight * (targetStd * 0.35);
    });
    const finalVal = targetAverage + sumDelta;

    const direction =
      finalVal > targetAverage * 1.02
        ? 'Above average'
        : finalVal < targetAverage * 0.98
        ? 'Below average'
        : 'Near baseline average';

    const risk: 'Low' | 'Medium' | 'High' =
      finalVal <= 0
        ? 'High'
        : finalVal < targetAverage * 0.85
        ? 'Medium'
        : 'Low';

    const contributions = buildShapContributions(
      rows,
      targetKey,
      factors,
      predictionInputs,
      featureAverages
    );

    const result: PredictionResultData = {
      value: finalVal,
      direction,
      risk,
      contributions,
      backend: false,
      source: 'frontend'
    };

    setPredictionResult(result);
    setPredictionLoading(false);

    // Save into history
    const historyItem: PredictionHistoryEntry = {
      id: `pred-${Date.now()}`,
      timestamp: Date.now(),
      datasetName: fileName,
      targetKey,
      predictedValue: finalVal,
      direction,
      risk,
      source: 'frontend',
      inputs: { ...predictionInputs }
    };

    const updatedPredHistory = [historyItem, ...predictionHistory].slice(0, 50);
    setPredictionHistory(updatedPredHistory);
    try {
      localStorage.setItem('insightiq_pred_history', JSON.stringify(updatedPredHistory));
    } catch {
      // ignore
    }

    addNotification(
      'New Prediction Calculated',
      `Target ${targetKey} forecasted at ${finalVal.toFixed(2)} (${direction}).`,
      'success',
      'history'
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased">
      {/* 1. TOP NAVBAR (hidden when printing) */}
      <Navbar
        activePillar={activePillar.id}
        currentPage={currentPage}
        fileName={fileName}
        rowCount={rows.length}
        colCount={Object.keys(rows[0] || {}).length}
        onSelectPillar={handleSelectPillar}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onClearNotifications={() => setNotifications([])}
        onNavigateToPage={handleNavigate}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* 2. SIDEBAR (hidden when printing; Visual & Custom charts removed; History placed at the end) */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          fileName={fileName}
          rowCount={rows.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          previousPageName={previousPageName}
          nextPageName={nextPageName}
        />

        {/* 3. WORKSPACE AREA */}
        <main className="flex-1 overflow-y-auto bg-slate-100/90 p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb Navigation (hidden when printing) */}
            <Breadcrumb
              currentPage={currentPage}
              pageTitle={STAGE_TITLES[currentPage] || 'Workspace'}
              pillarTitle={activePillar.title}
              onNavigate={handleNavigate}
              onPrevious={handlePrevious}
              onNext={handleNext}
              previousPageName={previousPageName}
              nextPageName={nextPageName}
            />

            {/* Stage 1: Upload Dataset (with animated circular loading) */}
            {currentPage === 'upload' && (
              <UploadPage
                fileName={fileName}
                rows={rows}
                uploadedFile={uploadedFile}
                onFileLoaded={handleFileLoaded}
                onAdvanceToNext={() => handleNavigate('profile')}
              />
            )}

            {/* Stage 2: Data Profiling (includes collapsible Visual Analytics & Custom Charts!) */}
            {currentPage === 'profile' && (
              <DataProfilePage
                fileName={fileName}
                rows={rows}
                nums={nums}
                cats={cats}
                columnProfiles={columnProfiles}
                usabilityScore={usabilityScore}
                dataCompleteness={dataCompleteness}
                factors={factors}
                targetKey={targetKey}
                onAdvanceToNext={() => handleNavigate('prediction')}
              />
            )}

            {/* Direct fallback routes if opened via URL/link */}
            {currentPage === 'visualize' && (
              <VisualizePage
                fileName={fileName}
                rows={rows}
                nums={nums}
                factors={factors}
                targetKey={targetKey}
                onAdvanceToNext={() => handleNavigate('prediction')}
              />
            )}

            {currentPage === 'custom' && (
              <CustomChartsPage
                rows={rows}
                allColumns={Object.keys(rows[0] || {})}
                nums={nums}
                onAdvanceToNext={() => handleNavigate('prediction')}
              />
            )}

            {/* Stage 3: Predictive Engine (First graphs, then concise working with collapsible, adjust scenarios, then 6 feature records) */}
            {currentPage === 'prediction' && (
              <PredictionPage
                fileName={fileName}
                rows={rows}
                nums={nums}
                factors={factors}
                targetKey={targetKey}
                onTargetChange={(t) => setTargetKey(t)}
                predictionInputs={predictionInputs}
                onInputChange={(key, val) =>
                  setPredictionInputs((prev) => ({ ...prev, [key]: val }))
                }
                onResetInputs={() => {
                  const initial: Record<string, number> = {};
                  nums.filter((c) => c !== defaultTargetKey).forEach((col) => {
                    initial[col] = calculateAverage(rows, col);
                  });
                  setTargetKey(defaultTargetKey);
                  setPredictionInputs(initial);
                  setPredictionResult(null);
                  setResetSignal((prev) => prev + 1);
                }}
                resetSignal={resetSignal}
                predictionResult={predictionResult}
                predictionLoading={predictionLoading}
                onRunPrediction={handleRunPrediction}
                shapItems={shapItems}
                targetAverage={targetAverage}
                targetStd={targetStd}
                onAdvanceToNext={() => handleNavigate('reports')}
              />
            )}

            {/* Stage 4: Executive Reports */}
            {currentPage === 'reports' && (
              <ReportsPage
                fileName={fileName}
                rows={rows}
                nums={nums}
                cats={cats}
                targetKey={targetKey}
                targetAverage={targetAverage}
                targetStd={targetStd}
                factors={factors}
                usabilityScore={usabilityScore}
                dataCompleteness={dataCompleteness}
                latestPrediction={predictionResult}
                onNavigateToUpload={() => handleNavigate('upload')}
              />
            )}

            {/* Stage 5: History (AT THE END OF THE WORKFLOW & SIDEBAR) */}
            {currentPage === 'history' && (
              <HistoryPage
                predictionHistory={predictionHistory}
                datasetHistory={datasetHistory}
                onRestorePrediction={(entry) => {
                  setTargetKey(entry.targetKey);
                  setPredictionInputs(entry.inputs);
                  handleNavigate('prediction');
                }}
                onRemovePrediction={(id) => {
                  setPredictionHistory((prev) => prev.filter((p) => p.id !== id));
                }}
                onClearPredictions={() => setPredictionHistory([])}
                onReopenDataset={(entry) => {
                  handleReopenDatasetWithAnimation(entry);
                }}
                onRemoveDataset={(id) => {
                  setDatasetHistory((prev) => prev.filter((d) => d.id !== id));
                }}
                onClearDatasets={() => setDatasetHistory([])}
                onAdvanceToNext={() => handleNavigate('upload')}
                onNavigateToPage={handleNavigate}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating AI Analytics Assistant */}
      <AiAssistantDrawer
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((v) => !v)}
        fileName={fileName}
        rows={rows}
        targetKey={targetKey}
        targetAverage={targetAverage}
        targetStd={targetStd}
        factors={factors}
      />

      {/* User Login / Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        currentUser={currentUser}
        initialMode={authModalMode}
        onPasswordChanged={(msg) => {
          addNotification('Security Alert', msg, 'success');
        }}
      />

      {/* Dataset Reopening Circular Animation Modal */}
      <DatasetLoadingModal
        isOpen={isReopenLoading}
        fileName={reopenTarget?.name || 'dataset.csv'}
        rowCount={reopenTarget?.rowCount || rows.length}
        colCount={reopenTarget?.columnCount || Object.keys(rows[0] || {}).length}
        onComplete={handleReopenComplete}
      />
    </div>
  );
}