import React, { useState } from 'react';
import {
  Database,
  BarChart3,
  BrainCircuit,
  Bell,
  User,
  LogOut,
  LogIn,
  ChevronDown,
  UserPlus,
  KeyRound
} from 'lucide-react';
import { AppFunctionId, AppPage, UserProfile, AppNotification, AuthModalMode } from '../types';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  activePillar: AppFunctionId;
  currentPage: AppPage;
  fileName: string;
  rowCount: number;
  colCount: number;
  onSelectPillar: (pillar: AppFunctionId) => void;
  currentUser: UserProfile;
  onOpenAuth: (mode?: AuthModalMode) => void;
  onLogout: () => void;
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  onClearNotifications: () => void;
  onNavigateToPage: (page: AppPage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePillar,
  currentPage: _currentPage,
  fileName,
  rowCount,
  colCount,
  onSelectPillar,
  currentUser,
  onOpenAuth,
  onLogout,
  notifications,
  onMarkNotificationsRead,
  onClearNotifications,
  onNavigateToPage
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const functionsList: {
    id: AppFunctionId;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'ingestion',
      label: 'Ingestion & Profiling',
      desc: 'Dataset schema audit and quality check',
      icon: <Database size={15} />
    },
    {
      id: 'prediction_ai',
      label: 'Predictive Engine',
      desc: 'Machine learning algorithms and explainability',
      icon: <BrainCircuit size={15} />
    },
    {
      id: 'analytics',
      label: 'Audit & History',
      desc: 'Reports and saved history runs',
      icon: <BarChart3 size={15} />
    }
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900 border-b border-slate-800 print:hidden">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-18 gap-6">
          {/* Left: Brand (click to go to Home) */}
          <button
            type="button"
            onClick={() => onNavigateToPage('upload')}
            className="flex items-center gap-2.5 shrink-0 justify-self-start cursor-pointer group"
            title="Go to Home"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500 group-hover:bg-indigo-400 flex items-center justify-center text-white font-black text-sm shadow-xs transition-colors">
              IQ
            </div>
            <span className="font-bold text-white tracking-tight text-lg">
              Insight<span className="text-indigo-400">_IQ</span>
            </span>
          </button>

          {/* Center: Navigation Tabs */}
          <nav className="hidden md:flex items-center justify-center gap-6 text-sm">
            {functionsList.map((fn) => {
              const isActive = activePillar === fn.id;
              return (
                <button
                  key={fn.id}
                  type="button"
                  onClick={() => onSelectPillar(fn.id)}
                  className={`h-18 flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-indigo-400 border-indigo-400'
                      : 'text-slate-400 hover:text-slate-100 border-transparent'
                  }`}
                  title={fn.desc}
                >
                  <span>{fn.icon}</span>
                  <span>{fn.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Dataset Info + Notifications + User Profile */}
          <div className="flex items-center gap-3 justify-self-end">
            {/* Active Dataset Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-slate-100 truncate max-w-[140px]" title={fileName}>
                {fileName}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 font-mono text-[13px]">
                {rowCount.toLocaleString()} r · {colCount} c
              </span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                className={`p-2 rounded-lg border transition-colors cursor-pointer relative ${
                  isNotificationOpen
                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
                }`}
                title="View Notifications & Activity"
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileMenuOpen(false);
                }}
              >
                <Bell size={16} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-indigo-500 text-white rounded-full text-[12px] font-bold flex items-center justify-center border-2 border-slate-900">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                notifications={notifications}
                onMarkAllRead={onMarkNotificationsRead}
                onClearAll={onClearNotifications}
                onSelectNotification={(page) => {
                  setIsNotificationOpen(false);
                  if (page) onNavigateToPage(page);
                }}
              />
            </div>

            {/* User Profile Logo */}
            <div className="relative">
              {currentUser.isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                    setIsNotificationOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Account profile settings"
                >
                  <div className={`w-8 h-8 rounded-md ${currentUser.avatarColor || 'bg-indigo-500'} text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}>
                    {currentUser.initials || 'RP'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-bold text-slate-100 leading-tight truncate max-w-[140px]">
                      {currentUser.name}
                    </div>
                  </div>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </button>
              )}

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && currentUser.isLoggedIn && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${currentUser.avatarColor || 'bg-indigo-600'} text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}>
                          {currentUser.initials || 'RP'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {currentUser.email}
                          </p>
                          <span className="inline-block px-1.5 py-0.2 rounded text-[12px] font-bold bg-indigo-100 text-indigo-700 mt-1">
                            {currentUser.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1 text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenAuth('login');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <User size={15} className="text-slate-400" />
                        <span>Switch Account / Sign In</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenAuth('register');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <UserPlus size={15} className="text-slate-400" />
                        <span>Register New User</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenAuth('change_password');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <KeyRound size={15} className="text-slate-400" />
                        <span>Change Password</span>
                      </button>
                    </div>

                    <div className="p-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer font-medium text-sm"
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between gap-1 py-1.5 border-t border-slate-800 overflow-x-auto">
          {functionsList.map((fn) => {
            const isActive = activePillar === fn.id;
            return (
              <button
                key={fn.id}
                type="button"
                onClick={() => onSelectPillar(fn.id)}
                className={`flex-1 min-w-[90px] text-center py-1 px-2 rounded text-sm font-semibold truncate transition-colors ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {fn.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
