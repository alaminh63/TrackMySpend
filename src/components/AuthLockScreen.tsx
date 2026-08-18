import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const AuthLockScreen: React.FC = () => {
  const { unlockApp, profile, updateProfile } = useFinance();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetAnswer, setResetAnswer] = useState('');

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === profile.pinCode.length) {
        if (!unlockApp(nextPin)) {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetAnswer.trim().toLowerCase() === profile.email.toLowerCase()) {
      updateProfile({ isPinLocked: false, pinCode: '1234' });
      unlockApp('1234');
      setShowForgot(false);
    } else {
      alert('Security email does not match registered email.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-8 text-center text-slate-900 dark:text-white">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight">Personal Finance Locked</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Enter PIN for <span className="font-semibold text-slate-700 dark:text-slate-200">{profile.name}</span>
        </p>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-4 mb-6">
          {Array.from({ length: profile.pinCode.length || 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                i < pin.length
                  ? 'bg-emerald-600 border-emerald-600 scale-110 shadow-sm shadow-emerald-500/50'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
              } ${error ? 'bg-rose-500 border-rose-500 animate-shake' : ''}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-medium mb-4 flex items-center justify-center gap-1">
            <ShieldAlert className="w-4 h-4" /> Incorrect PIN. Please try again.
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-lg font-bold text-slate-800 dark:text-slate-100 transition active:scale-95 border border-slate-200/50 dark:border-slate-700/50"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="h-14 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition"
          >
            Forgot?
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-lg font-bold text-slate-800 dark:text-slate-100 transition active:scale-95 border border-slate-200/50 dark:border-slate-700/50"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition active:scale-95"
          >
            Delete
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Default test PIN is <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-600">1234</code>
        </p>

        {showForgot && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <form onSubmit={handleResetPin} className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 text-left">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-500" /> Reset PIN Access
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                To reset your security lock, confirm your registered account email address:
              </p>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account Email ({profile.email})
              </label>
              <input
                type="email"
                required
                value={resetAnswer}
                onChange={e => setResetAnswer(e.target.value)}
                placeholder="alamin.cloudgen@gmail.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"
                >
                  Reset to 1234 <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
