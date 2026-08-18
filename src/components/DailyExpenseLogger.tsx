import React, { useState } from 'react';
import {
  Coffee,
  Car,
  ShoppingBag,
  Smartphone,
  Pill,
  Utensils,
  Zap,
  Wallet,
  Landmark,
  CreditCard,
  Plus,
  CheckCircle2,
  Tag,
  ArrowRight,
  Flame,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PaymentMethod } from '../types';

interface DailyExpenseLoggerProps {
  onSuccess?: () => void;
  compact?: boolean;
}

// Common Bangladeshi & Universal Daily Micro-Expense Presets
const QUICK_DAILY_PRESETS = [
  {
    id: 'tea',
    label: 'চা / নাস্তা (Tea/Snacks)',
    shortLabel: '☕ চা ও নাস্তা',
    defaultAmount: 15,
    categoryKeyword: 'Food',
    defaultNote: 'চা ও বিস্কুট / নাস্তা',
    icon: Coffee,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  {
    id: 'rickshaw',
    label: 'রিকশা / বাস ভাড়া (Transport)',
    shortLabel: '🛺 রিকশা / ভাড়া',
    defaultAmount: 40,
    categoryKeyword: 'Transport',
    defaultNote: 'রিকশা / বাস ভাড়া',
    icon: Car,
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  },
  {
    id: 'kacha-bazaar',
    label: 'কাঁচাবাজার (Groceries)',
    shortLabel: '🛒 কাঁচাবাজার',
    defaultAmount: 150,
    categoryKeyword: 'Groceries',
    defaultNote: 'কাঁচাবাজার (সবজি/মাছ/ডিম)',
    icon: ShoppingBag,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'recharge',
    label: 'মোবাইল রিচার্জ (Recharge)',
    shortLabel: '📱 রিচার্জ',
    defaultAmount: 50,
    categoryKeyword: 'Bills',
    defaultNote: 'মোবাইল ফ্লেক্সিলোড / ডাটা প্যাক',
    icon: Smartphone,
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  },
  {
    id: 'medicine',
    label: 'ওষুধ (Medicine)',
    shortLabel: '💊 ওষুধ',
    defaultAmount: 30,
    categoryKeyword: 'Health',
    defaultNote: 'ফার্মেসি থেকে ওষুধ',
    icon: Pill,
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
  {
    id: 'meal',
    label: 'লাঞ্চ / ডিনার (Lunch/Food)',
    shortLabel: '🍽️ দুপুরের খাবার',
    defaultAmount: 120,
    categoryKeyword: 'Food',
    defaultNote: 'অফিস লাঞ্চ / খাবার',
    icon: Utensils,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  },
  {
    id: 'misc',
    label: 'অন্যান্য ছোট খরচ (Misc)',
    shortLabel: '⚡ অন্যান্য',
    defaultAmount: 20,
    categoryKeyword: 'Misc',
    defaultNote: 'দৈনিক সাধারণ খরচ',
    icon: Zap,
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
  },
];

const QUICK_AMOUNT_CHIPS = [10, 20, 30, 50, 100, 200, 500, 1000];

export const DailyExpenseLogger: React.FC<DailyExpenseLoggerProps> = ({ onSuccess, compact = false }) => {
  const { categories, accounts, addExpense, formatCurrency, profile } = useFinance();

  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('tea');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    const cashAcc = accounts.find(a => a.type === 'cash') || accounts[0];
    return cashAcc?.id || '';
  });
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState<string[]>(['দৈনিক']);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [lastSavedSummary, setLastSavedSummary] = useState<string | null>(null);

  // Find matching category based on current preset
  const currentPreset = QUICK_DAILY_PRESETS.find(p => p.id === selectedPresetId) || QUICK_DAILY_PRESETS[0];

  const matchedCategory = categories.find(c =>
    c.name.toLowerCase().includes(currentPreset.categoryKeyword.toLowerCase()) ||
    c.id.toLowerCase().includes(currentPreset.categoryKeyword.toLowerCase())
  ) || categories[0];

  const handleSelectPreset = (preset: typeof QUICK_DAILY_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    if (!amount || amount === '0') {
      setAmount(preset.defaultAmount.toString());
    }
    if (!note || QUICK_DAILY_PRESETS.some(p => p.defaultNote === note)) {
      setNote(preset.defaultNote);
    }
  };

  const handleAddAmount = (addValue: number) => {
    const currentNum = parseFloat(amount) || 0;
    setAmount((currentNum + addValue).toString());
  };

  const handleSetExactAmount = (exactValue: number) => {
    setAmount(exactValue.toString());
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    // Pick payment method according to account type
    const chosenAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
    let paymentMethod: PaymentMethod = 'Cash';
    if (chosenAccount) {
      if (chosenAccount.type === 'mfs') {
        paymentMethod = chosenAccount.name.toLowerCase().includes('nagad') ? 'Nagad' : 'bKash';
      } else if (chosenAccount.type === 'bank') {
        paymentMethod = 'Bank';
      } else if (chosenAccount.type === 'card' || chosenAccount.type === 'credit') {
        paymentMethod = 'Credit Card';
      }
    }

    const finalNote = note.trim() || currentPreset.defaultNote;
    const finalTags = Array.from(new Set([...tags, currentPreset.shortLabel.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '')].filter(Boolean)));

    addExpense({
      userId: 'user-default',
      categoryId: matchedCategory.id,
      categoryName: matchedCategory.name,
      amount: numAmount,
      currency: profile.baseCurrency,
      exchangeRate: 1,
      date: selectedDate,
      accountId: chosenAccount ? chosenAccount.id : (accounts[0]?.id || ''),
      paymentMethod,
      notes: finalNote,
      tags: finalTags,
      isRecurring: false,
      isShared: false,
    });

    setLastSavedSummary(`${formatCurrency(numAmount)} - ${finalNote} (${chosenAccount?.name || 'Cash'})`);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);

    // Reset fields for next fast entry
    setAmount('');
    setNote('');

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div
      id="daily-expense-logger"
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      }`}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>দৈনিক খরচ ও ইনস্ট্যান্ট এন্ট্রি</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                1-Tap Fast Logger
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ১০ টাকা চা-নাস্তা থেকে যেকোনো ছোট-বড় খরচের সুনির্দিষ্ট হিসাব রাখুন
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-emerald-500"
          />
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">খরচ সফলভাবে এন্ট্রি হয়েছে! 🎉</span>
          <span className="opacity-90 font-normal">({lastSavedSummary})</span>
        </div>
      )}

      {/* 1. Quick Expense Presets (Icons) */}
      <div className="mb-4">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          আইটেম নির্বাচন করুন (Quick Categories)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {QUICK_DAILY_PRESETS.map(preset => {
            const Icon = preset.icon;
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 relative group ${
                  isSelected
                    ? `${preset.color} border-current ring-2 ring-emerald-500/40 font-bold scale-[1.02] shadow-xs`
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-current' : 'text-slate-500'}`} />
                  <span className="text-[10px] opacity-75 font-mono">~৳{preset.defaultAmount}</span>
                </div>
                <span className="text-xs truncate block font-medium group-hover:font-semibold">
                  {preset.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 2. Amount Input & Quick Chips */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              খরচের পরিমাণ (Amount in ৳) *
            </label>
            {amount && parseFloat(amount) > 0 && (
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(parseFloat(amount))}
              </span>
            )}
          </div>

          <div className="relative mb-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
              ৳
            </span>
            <input
              type="number"
              step="any"
              required
              placeholder="0 (যেমন: 10, 20, 50, 150)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-lg font-extrabold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-mono"
            />
          </div>

          {/* Quick Amount Chips (10, 20, 30, 50, 100...) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 mr-1">ট্যাপ করুন:</span>
            {QUICK_AMOUNT_CHIPS.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleSetExactAmount(val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  parseFloat(amount) === val
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600'
                }`}
              >
                ৳{val}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleAddAmount(10)}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300"
              title="Add 10 Tk"
            >
              +১০
            </button>
            <button
              type="button"
              onClick={() => handleAddAmount(50)}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300"
              title="Add 50 Tk"
            >
              +৫০
            </button>
          </div>
        </div>

        {/* 3. Note / Description (বিবরণ) & Account Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              খরচের বিবরণ / নোট (Expense Note)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={currentPreset.defaultNote}
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {/* Common note suggestions */}
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              {['দোকানের চা', 'রিকশা ভাড়া', 'বাস ভাড়া', 'সিগারেট/পান', 'নাপা ট্যাবলেট', 'বিকেলের নাস্তা'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNote(s)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              কোন ওয়ালেট/অ্যাকাউন্ট থেকে গেছে? (Payment Source)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {accounts.slice(0, 6).map(acc => {
                const isSelected = selectedAccountId === acc.id;
                let Icon = Wallet;
                if (acc.type === 'bank') Icon = Landmark;
                if (acc.type === 'card' || acc.type === 'credit') Icon = CreditCard;
                if (acc.type === 'mfs') Icon = Smartphone;

                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition-all text-xs ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div className="truncate min-w-0">
                      <p className="truncate font-semibold text-[11px] leading-tight">{acc.name}</p>
                      <p className="text-[10px] opacity-75 font-mono">{formatCurrency(acc.currentBalance)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Action Button */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ক্যাটাগরি: <strong>{matchedCategory.name}</strong></span>
          </div>

          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              !amount || parseFloat(amount) <= 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-600/30'
            }`}
          >
            <span>খরচ সেভ করুন</span>
            {amount && parseFloat(amount) > 0 && (
              <span className="font-mono bg-emerald-700/60 px-1.5 py-0.5 rounded text-xs">
                ৳{amount}
              </span>
            )}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
