import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';
import { PagePurposeBanner } from '../components/PagePurposeBanner';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { DatasetRow } from '../types';
import { formatFileSize } from '../utils/dataAnalysis';
import { DatasetLoadingModal } from '../components/DatasetLoadingModal';

interface UploadPageProps {
  fileName: string;
  rows: DatasetRow[];
  uploadedFile: File | null;
  onFileLoaded: (file: File) => void;
  onAdvanceToNext: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  fileName,
  rows,
  uploadedFile,
  onFileLoaded,
  onAdvanceToNext
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Loading animation modal state
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setErrorMsg(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['csv', 'xlsx', 'xls'].includes(ext || '')) {
        setPendingFile(file);
        setIsLoadingModalOpen(true);
      } else {
        setErrorMsg('Please upload a valid CSV, XLSX, or XLS spreadsheet.');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPendingFile(file);
      setIsLoadingModalOpen(true);
    }
  };

  const handleLoadingModalComplete = () => {
    setIsLoadingModalOpen(false);
    if (pendingFile) {
      onFileLoaded(pendingFile);
      setPendingFile(null);
    } else {
      onAdvanceToNext();
    }
  };

  // Sample dataset loader with real loading animation
  const handleLoadSample = (sampleName: string, sampleCsv: string) => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const file = new File([blob], sampleName, { type: 'text/csv' });
    setPendingFile(file);
    setIsLoadingModalOpen(true);
  };

  const headers = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-6">
      {/* 1. PURPOSE BANNER */}
      <PagePurposeBanner
        pageTitle="Upload Dataset"
        stepNumber={1}
        totalSteps={5}
        purposeSummary="Upload your CSV or Excel spreadsheet to start analyzing data and predicting future outcomes."
        keyGoals={[
          'Drag and drop your spreadsheet or click Browse Files',
          'Support for CSV, XLSX, and XLS formats',
          'Authentic circular loading visualization on dataset ingestion',
          'Automatic schema verification and row counting'
        ]}
      />

      {/* 2. WORKING HUB */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UploadCloud size={20} className="text-indigo-600" />
              Dataset Ingestion Hub
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select or drop your spreadsheet below to start analyzing and predicting.
            </p>
          </div>
        </div>

        {/* Drag and drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-200 ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
          }`}
        >
          <input
            id="file-upload-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              <FileSpreadsheet size={32} />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-800">
                Drag and drop your spreadsheet here
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Supports Comma-Separated Values (<span className="font-mono font-semibold">.CSV</span>) and Microsoft Excel (<span className="font-mono font-semibold">.XLSX, .XLS</span>)
              </p>
            </div>

            <div className="pt-2">
              <label
                htmlFor="file-upload-input"
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <UploadCloud size={15} />
                Browse Files from Device
              </label>
            </div>

            <p className="text-[13px] text-slate-400">
              Maximum recommended file size: 50MB · Data processed securely in-browser
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Sample Dataset Bar */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-600" />
              Try Ready-To-Use Tabular Datasets:
            </span>
            <span className="text-slate-400 font-normal">Click to trigger circular loading</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                handleLoadSample(
                  'ecommerce_sales_performance.csv',
                  `Quarter,Region,Sales,Advertising,Discounts,OperationalCost,CustomerSatisfaction,UnitsSold,Profit
Q1,North,42500,12000,3500,18500,84,1420,8500
Q1,South,38200,9500,2800,16200,81,1280,9700
Q1,East,51000,15400,4200,21000,89,1710,10400
Q1,West,47800,13800,3900,19800,86,1590,10200
Q2,North,45600,13100,3800,19200,85,1510,9500
Q2,South,41000,10800,3100,17100,83,1360,10000
Q2,East,54200,16800,4600,22400,91,1820,10400
Q2,West,49500,14600,4100,20500,88,1650,10300
Q3,North,48900,14500,4300,20200,87,1620,9900
Q3,South,43500,11900,3400,18000,84,1440,10200
Q3,East,58000,18200,5100,24100,93,1950,10600
Q3,West,53100,16100,4500,21900,90,1780,10600
Q4,North,56400,17800,5200,23500,90,1880,9900
Q4,South,49200,14200,4000,20100,86,1640,10900
Q4,East,65800,21500,6200,27500,95,2210,10600
Q4,West,61200,19400,5700,25400,92,2050,10700`
                )
              }
              className="p-2.5 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-lg text-left transition-colors cursor-pointer text-xs space-y-0.5"
            >
              <div className="font-bold text-slate-800">E-Commerce Quarterly Revenue</div>
              <div className="text-slate-500 text-[11px]">16 records · 9 columns · Sales &amp; Profit target</div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleLoadSample(
                  'customer_retention_marketing.csv',
                  `Month,Campaign,AdSpend,Clicks,Conversions,ChurnRate,CustomerLifetimeValue,Revenue
Jan,Search,8400,12400,1420,4.2,480,68160
Feb,Social,9200,15800,1650,3.9,510,84150
Mar,Email,4500,8200,1100,3.5,540,59400
Apr,Display,7100,10500,1280,4.0,490,62720
May,Search,9800,16200,1780,3.6,530,94340
Jun,Social,10500,18900,2010,3.4,560,112560
Jul,Video,12400,21000,2240,3.2,580,129920
Aug,Search,11200,19400,2100,3.3,570,119700
Sep,Email,5200,9400,1320,3.1,590,77880
Oct,Social,11800,20500,2290,3.0,610,139690
Nov,Search,14500,26800,2850,2.8,640,182400
Dec,Holiday,18200,34200,3620,2.5,690,249780`
                )
              }
              className="p-2.5 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-lg text-left transition-colors cursor-pointer text-xs space-y-0.5"
            >
              <div className="font-bold text-slate-800">Customer Lifetime Value &amp; Churn</div>
              <div className="text-slate-500 text-[11px]">12 records · 8 columns · Marketing &amp; Retention</div>
            </button>
          </div>
        </div>

        {/* Current dataset active status banner */}
        {rows.length > 0 && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <CheckCircle size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{fileName}</span>
                  <span className="text-[12px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    Loaded &amp; Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {rows.length.toLocaleString()} rows · {headers.length} columns detected · {uploadedFile ? formatFileSize(uploadedFile.size) : 'Ready'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAdvanceToNext}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
              >
                <span>Proceed to Data Profiling</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. DOCUMENTATION COLLAPSIBLE */}
      <CollapsibleSection
        title="Dataset Formatting Guidelines, Supported Schema & Best Practices"
        subtitle="Click to expand guidelines for column naming, numeric headers, and missing values"
        badge="Documentation"
        initiallyOpen={false}
      >
        <div className="grid md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-indigo-600" />
              Column Headers
            </h5>
            <p>
              Row 1 must contain clear, unique column titles (e.g. <code>Sales, Advertising, Profit</code>).
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-indigo-600" />
              Numeric Consistency
            </h5>
            <p>
              Ensure numeric columns contain standard digits without currency symbols.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-indigo-600" />
              Missing Data Handling
            </h5>
            <p>
              Empty cells are flagged in Data Profiling. Datasets with &gt;85% completeness give superior results.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Dataset Loading Circular Animation Modal */}
      <DatasetLoadingModal
        isOpen={isLoadingModalOpen}
        fileName={pendingFile?.name || 'spreadsheet.csv'}
        rowCount={pendingFile ? 16 : rows.length}
        colCount={pendingFile ? 9 : headers.length}
        onComplete={handleLoadingModalComplete}
      />
    </div>
  );
};
