import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  CheckCircle2,
  LogIn,
  UserPlus,
  X,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { UserProfile, AuthModalMode } from '../types';
import { supabase } from '../supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  currentUser?: UserProfile;
  initialMode?: AuthModalMode;
  onPasswordChanged?: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentUser,
  initialMode = 'login',
  onPasswordChanged
}) => {
  const [tab, setTab] = useState<AuthModalMode>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setTab(initialMode);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialMode]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Builds a UserProfile from a real Supabase auth user
  const profileFromSupabaseUser = (user: {
    id: string;
    email?: string | null;
    user_metadata?: { full_name?: string };
  }): UserProfile => {
    const email = user.email || '';
    const name =
      user.user_metadata?.full_name ||
      email
        .split('@')[0]
        .split(/[._-]/)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ') ||
      'Analytics User';
    const initials =
      name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'U';

    return {
      id: user.id,
      name,
      email,
      role: 'Student / Analyst',
      initials,
      avatarColor: 'bg-indigo-600',
      isLoggedIn: true
    };
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword
    });
    setIsSubmitting(false);

    if (authError || !data.user) {
      setError(authError?.message || 'Incorrect email or password.');
      return;
    }

    setSuccess('Signed in successfully! Loading your workspace...');
    setTimeout(() => {
      onLogin(profileFromSupabaseUser(data.user));
      onClose();
      setSuccess(null);
    }, 400);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must have at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regPassword,
      options: {
        data: { full_name: regName.trim() }
      }
    });
    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // If "Confirm email" is ON in Supabase, data.session will be null here —
    // the user must click the link in their inbox before they can sign in.
    if (!data.session) {
      setSuccess('Account created! Please check your email to confirm your account, then sign in.');
      setTimeout(() => {
        setTab('login');
        setSuccess(null);
      }, 2500);
      return;
    }

    setSuccess('Account created successfully! Welcome to InsightIQ.');
    setTimeout(() => {
      if (data.user) onLogin(profileFromSupabaseUser(data.user));
      onClose();
      setSuccess(null);
    }, 400);
  };

  const handleSendResetCode = async () => {
    setError(null);
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim());
    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setResetCodeSent(true);
    setSuccess('A recovery code has been emailed to you. Enter it below along with your new password.');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!enteredCode.trim()) {
      setError('Please enter the verification code from your email.');
      return;
    }

    if (newResetPassword.length < 6) {
      setError('New password must have at least 6 characters.');
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    // Verifying the emailed OTP signs the user into a temporary recovery session.
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: forgotEmail.trim(),
      token: enteredCode.trim(),
      type: 'recovery'
    });

    if (verifyError) {
      setIsSubmitting(false);
      setError(verifyError.message);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newResetPassword });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setLoginEmail(forgotEmail.trim());
    setLoginPassword('');

    setSuccess('Password updated successfully! You can now sign in.');
    onPasswordChanged?.(`Password for ${forgotEmail.trim()} was updated.`);

    setTimeout(() => {
      setTab('login');
      setResetCodeSent(false);
      setEnteredCode('');
      setNewResetPassword('');
      setConfirmResetPassword('');
    }, 1200);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const userEmail = currentUser?.email || loginEmail;
    if (!userEmail) {
      setError('You need to be signed in to change your password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must have at least 6 characters.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);

    // Re-verify the current password is correct before allowing the change.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword
    });

    if (verifyError) {
      setIsSubmitting(false);
      setError('Current password is not correct. Please try again.');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess('Password changed successfully!');
    onPasswordChanged?.('Your account password was updated successfully.');

    setTimeout(() => {
      onClose();
      setSuccess(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              IQ
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {tab === 'login' && 'Sign In to Your Workspace'}
                {tab === 'register' && 'Create Your Account'}
                {tab === 'forgot_password' && 'Reset Forgotten Password'}
                {tab === 'change_password' && 'Change Account Password'}
              </h3>
              <p className="text-xs text-slate-500">
                {tab === 'login' && 'Log in to inspect datasets and run predictions'}
                {tab === 'register' && 'Students, researchers and analysts can sign up in seconds'}
                {tab === 'forgot_password' && 'Get a recovery code and choose a new password'}
                {tab === 'change_password' && 'Update your password easily anytime'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/30 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={13} />
            <span>Sign Up</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('change_password');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'change_password'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound size={13} />
            <span>Change Pass</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-0" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTab('forgot_password');
                    setForgotEmail(loginEmail);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn size={14} />
                <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-800 flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-600 shrink-0" />
                <span>Open for all students, researchers, and dataset analysts.</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rida Parveen"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Create Password (minimum 6 characters)
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Enter a secure password"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus size={14} />
                <span>{isSubmitting ? 'Creating account...' : 'Create Account & Start Predicting'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === 'forgot_password' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <KeyRound size={15} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-semibold">Reset Your Password:</span>
                  <p className="text-[13px] text-amber-700 mt-0.5">
                    Enter your email to receive a 6-digit recovery code. Then type your new password.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Your Email Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendResetCode}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    <span>Send Code</span>
                  </button>
                </div>
              </div>

              {resetCodeSent && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 animate-fadeIn">
                  <span className="font-semibold">Check your inbox.</span> We sent a code to{' '}
                  <span className="font-mono">{forgotEmail.trim()}</span>. Enter it below with your new password.
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full px-3 py-2 text-xs font-mono tracking-widest text-center rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showResetPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      value={confirmResetPassword}
                      onChange={(e) => setConfirmResetPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="flex-1 py-2 px-3 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Sign In</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 size={13} />
                    <span>Save New Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: CHANGE PASSWORD */}
          {tab === 'change_password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <span className="font-semibold text-slate-900 block">
                  Change Password for {currentUser?.email || loginEmail}:
                </span>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  Enter your current password, then type your new password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-3 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound size={14} />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};