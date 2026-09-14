import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  initiallyOpen?: boolean;
  children: React.ReactNode;
  id?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  badge,
  initiallyOpen = false,
  children,
  id
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <div
      id={id}
      className="border border-slate-200 bg-white rounded-xl overflow-hidden transition-all duration-150 shadow-2xs mb-6"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-full text-left px-5 py-3.5 flex items-center justify-between gap-4 bg-slate-50/90 hover:bg-slate-100/90 transition-colors cursor-pointer ${
          isOpen ? 'border-b border-slate-200' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md ${isOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/80 text-slate-600'} transition-colors`}>
            {isOpen ? <EyeOff size={14} /> : <Eye size={14} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight">
                {title}
              </h3>
              {badge && (
                <span className="text-[12px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[13px] text-slate-400 mt-0.5 font-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-indigo-600 hidden sm:inline-block">
            {isOpen ? 'Show less information' : 'See more information'}
          </span>
          <div className="p-1 rounded text-slate-400 hover:text-slate-700">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-5 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};
