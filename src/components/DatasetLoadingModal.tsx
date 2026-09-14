import React, { useEffect, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Sparkles, Database } from 'lucide-react';

interface DatasetLoadingModalProps {
  isOpen: boolean;
  fileName: string;
  rowCount: number;
  colCount: number;
  onComplete: () => void;
}

export const DatasetLoadingModal: React.FC<DatasetLoadingModalProps> = ({
  isOpen,
  fileName,
  rowCount,
  colCount,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('Initializing dataset stream...');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsCompleted(false);
      return;
    }

    setProgress(12);
    setStageText('Reading spreadsheet bytes & verifying headers...');

    const t1 = setTimeout(() => {
      setProgress(38);
      setStageText('Parsing tabular rows and column schemas...');
    }, 280);

    const t2 = setTimeout(() => {
      setProgress(67);
      setStageText('Detecting numeric metrics & categorical groups...');
    }, 560);

    const t3 = setTimeout(() => {
      setProgress(88);
      setStageText('Calculating Pearson correlations & statistics...');
    }, 840);

    const t4 = setTimeout(() => {
      setProgress(100);
      setStageText('Data loaded successfully!');
      setIsCompleted(true);
    }, 1120);

    const t5 = setTimeout(() => {
      onComplete();
    }, 1850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  // SVG circle calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 py-1 px-3 rounded-full mx-auto w-fit">
          <Sparkles size={13} />
          <span>Ingestion Engine</span>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
            {/* Background track circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={isCompleted ? '#10b981' : '#4f46e5'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isCompleted ? (
              <div className="text-emerald-500 animate-fadeIn">
                <CheckCircle2 size={42} className="mx-auto" />
                <span className="text-xs font-bold text-emerald-700 block mt-1">Ready</span>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-black font-mono text-slate-900">
                  {progress}%
                </span>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Loading
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status text */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 truncate px-2" title={fileName}>
            {fileName}
          </h4>
          <p className="text-xs text-slate-500 min-h-[36px] flex items-center justify-center leading-relaxed">
            {stageText}
          </p>
        </div>

        {/* Dataset dimensions badges */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1">
            <FileSpreadsheet size={13} className="text-slate-400" />
            {rowCount.toLocaleString()} Rows
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Database size={13} className="text-slate-400" />
            {colCount} Columns
          </span>
        </div>

        {isCompleted && (
          <button
            type="button"
            onClick={onComplete}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Open Predictive Engine &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
