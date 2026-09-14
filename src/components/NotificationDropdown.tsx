import React from 'react';
import { Bell, Check, Trash2, ExternalLink, Sparkles, Database, ShieldCheck, Info } from 'lucide-react';
import { AppNotification, AppPage } from '../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (targetPage?: AppPage) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onSelectNotification
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-3.5 px-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-indigo-600" />
            <span className="font-bold text-slate-800 text-xs tracking-tight">
              Notifications &amp; Activity
            </span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[12px] font-bold bg-indigo-600 text-white">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[13px]">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-slate-500 hover:text-indigo-600 font-medium px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
                title="Mark all as read"
              >
                <Check size={12} />
                <span>Mark read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                title="Clear all"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {!notifications.length ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No new alerts or activity notifications.
            </div>
          ) : (
            notifications.map((item) => {
              const getIcon = () => {
                switch (item.type) {
                  case 'success':
                    return <ShieldCheck size={14} className="text-emerald-500 shrink-0" />;
                  case 'warning':
                    return <Sparkles size={14} className="text-amber-500 shrink-0" />;
                  case 'system':
                    return <Database size={14} className="text-sky-500 shrink-0" />;
                  default:
                    return <Info size={14} className="text-indigo-500 shrink-0" />;
                }
              };

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.targetPage) {
                      onSelectNotification(item.targetPage);
                    }
                  }}
                  className={`p-3.5 px-4 text-xs transition-colors cursor-pointer flex items-start gap-3 ${
                    !item.read ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5">{getIcon()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-slate-800 truncate">
                        {item.title}
                      </span>
                      <span className="text-[12px] text-slate-400 font-mono shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-500 leading-snug">
                      {item.message}
                    </p>
                    {item.targetPage && (
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 mt-1">
                        <span>Open {item.targetPage}</span>
                        <ExternalLink size={10} />
                      </span>
                    )}
                  </div>
                  {!item.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2 px-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[13px] text-slate-500">
          <span>Engine Status: Connected</span>
          <span className="text-emerald-600 font-medium">100% Operational</span>
        </div>
      </div>
    </>
  );
};
