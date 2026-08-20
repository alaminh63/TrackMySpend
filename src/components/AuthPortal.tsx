import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  User,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  KeyRound,
  Users,
  Briefcase,
  Eye as ViewIcon,
  FileCheck,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { UserRole } from '../types';
import { ROLE_DEFINITIONS } from '../utils/rbac';

interface AuthPortalProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ isModal = false, onClose }) => {
  const { login, register, users, switchUser, setAuthModalOpen } = useFinance();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('alamin.cloudgen@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('admin123');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register form state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('viewer');
  const [regPin, setRegPin] = useState<string>('1234');
  const [regDesignation, setRegDesignation] = useState<string>('');

  // UI feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const passStrength = getPasswordStrength(regPassword);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(loginEmail, loginPassword, rememberMe);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage('Signed in successfully! Welcome back.');
        setTimeout(() => {
          if (onClose) onClose();
          setAuthModalOpen(false);
        }, 600);
      } else {
        setErrorMessage(res.message || 'Invalid email or password credentials.');
      }
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (regPassword.length < 6) {
      setIsLoading(false);
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setTimeout(() => {
      const res = register(regName, regEmail, regPassword, regRole, regPin, regDesignation);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(`Account created successfully as ${ROLE_DEFINITIONS[regRole].name}!`);
        setTimeout(() => {
          if (onClose) onClose();
          setAuthModalOpen(false);
        }, 700);
      } else {
        setErrorMessage(res.message || 'Registration failed. Please check your details.');
      }
    }, 350);
  };

  const handleQuickLogin = (user: typeof users[0]) => {
    setErrorMessage(null);
    switchUser(user.id);
    setSuccessMessage(`Switched session to ${user.name} (${ROLE_DEFINITIONS[user.role].name})`);
    setTimeout(() => {
      if (onClose) onClose();
      setAuthModalOpen(false);
    }, 500);
  };

  return (
    <div
      className={`${
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto'
          : 'min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/70 to-emerald-50/40 flex items-center justify-center p-4'
      }`}
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-xl p-6 sm:p-8 my-8 text-slate-900">
        {/* Modal Close Button */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Secure Account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {mode === 'login'
              ? 'Sign in to access your personal finance dashboard & role permissions'
              : 'Join the workspace with dedicated role-based financial access control'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition ${
              mode === 'login' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In (লগইন)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition ${
              mode === 'register' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register (নতুন একাউন্ট)
          </button>
        </div>

        {/* Notification Banners */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <span className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline">
                  Default PIN: 1234
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span>Remember this browser</span>
              </label>
              <span className="text-slate-400 text-xs">256-bit Encrypted Session</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 transition active:scale-[0.99] mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Tariqul Islam"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="tariqul@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {regPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passStrength === 1
                          ? 'w-1/4 bg-rose-500'
                          : passStrength === 2
                          ? 'w-2/4 bg-amber-500'
                          : passStrength === 3
                          ? 'w-3/4 bg-blue-500'
                          : 'w-full bg-emerald-500'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>Password Strength:</span>
                    <span className="font-semibold text-slate-700">
                      {passStrength <= 1 ? 'Weak' : passStrength === 2 ? 'Fair' : passStrength === 3 ? 'Good' : 'Strong'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Role Picker (RBAC) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Assign System Role (RBAC Access Level)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['viewer', 'manager', 'admin', 'auditor'] as UserRole[]).map(roleKey => {
                  const def = ROLE_DEFINITIONS[roleKey];
                  const isSelected = regRole === roleKey;
                  return (
                    <div
                      key={roleKey}
                      onClick={() => setRegRole(roleKey)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">{def.name.split(' ')[0]}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${def.badgeBg} ${def.badgeText}`}>
                          {roleKey}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{def.bengaliName}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {ROLE_DEFINITIONS[regRole].description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Security PIN (4-digit)</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={4}
                    value={regPin}
                    onChange={e => setRegPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono tracking-widest rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Designation / Title</label>
                <input
                  type="text"
                  value={regDesignation}
                  onChange={e => setRegDesignation(e.target.value)}
                  placeholder="e.g. Lead Accountant"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 transition active:scale-[0.99] mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account & Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Demo Role Switcher */}
        <div className="mt-7 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> One-Click Role Simulator
            </span>
            <span className="text-[11px] text-slate-400">Instant RBAC Switch</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {users.map(user => {
              const def = ROLE_DEFINITIONS[user.role];
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white text-left transition flex items-center gap-2.5 group"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-700">
                      {user.name.split(' ')[0]}
                    </p>
                    <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-medium ${def.badgeBg} ${def.badgeText}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
