import React, { useState, useMemo } from 'react';
import {
  Flame,
  Calendar,
  Search,
  Filter,
  Trash2,
  Copy,
  Edit2,
  Plus,
  TrendingDown,
  Clock,
  Tag,
  Wallet,
  Coffee,
  Car,
  ShoppingBag,
  Smartphone,
  Pill,
  Utensils,
  Zap,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Expense, Category } from '../types';
import { DailyExpenseLogger } from '../components/DailyExpenseLogger';

export const DailyExpenseView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
}> = ({ onOpenQuickAdd }) => {
  const {
    expenses,
    deleteExpense,
    duplicateExpense,
    updateExpense,
    formatCurrency,
    categories,
    accounts,
    profile,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedWalletFilter, setSelectedWalletFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | 'this_month' | 'all'>('today');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  // Filter expenses (ignoring deleted)
  const activeExpenses = useMemo(() => {
    return expenses.filter(e => !e.isDeleted);
  }, [expenses]);

  // Daily statistics
  const todayExpenses = useMemo(() => {
    return activeExpenses.filter(e => e.date === todayStr);
  }, [activeExpenses, todayStr]);

  const yesterdayExpenses = useMemo(() => {
    return activeExpenses.filter(e => e.date === yesterdayStr);
  }, [activeExpenses, yesterdayStr]);

  const currentMonthStr = todayStr.slice(0, 7);
  const thisMonthExpenses = useMemo(() => {
    return activeExpenses.filter(e => e.date.startsWith(currentMonthStr));
  }, [activeExpenses, currentMonthStr]);

  const todayTotal = useMemo(() => todayExpenses.reduce((s, e) => s + e.convertedAmount, 0), [todayExpenses]);
  const yesterdayTotal = useMemo(() => yesterdayExpenses.reduce((s, e) => s + e.convertedAmount, 0), [yesterdayExpenses]);
  const thisMonthTotal = useMemo(() => thisMonthExpenses.reduce((s, e) => s + e.convertedAmount, 0), [thisMonthExpenses]);

  // Filtered dataset for listing
  const filteredList = useMemo(() => {
    return activeExpenses.filter(item => {
      // Date filter
      if (dateFilter === 'today' && item.date !== todayStr) return false;
      if (dateFilter === 'yesterday' && item.date !== yesterdayStr) return false;
      if (dateFilter === '7days') {
        const itemDate = new Date(item.date).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (itemDate < sevenDaysAgo) return false;
      }
      if (dateFilter === 'this_month' && !item.date.startsWith(currentMonthStr)) return false;

      // Category filter
      if (selectedCategoryFilter !== 'all' && item.categoryId !== selectedCategoryFilter) return false;

      // Account/Wallet filter
      if (selectedWalletFilter !== 'all' && item.accountId !== selectedWalletFilter) return false;

      // Search query (matches note, categoryName, tag, amount)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = item.notes?.toLowerCase().includes(q);
        const matchCat = item.categoryName.toLowerCase().includes(q);
        const matchTag = item.tags?.some(t => t.toLowerCase().includes(q));
        const matchAmt = item.amount.toString().includes(q);
        if (!matchNote && !matchCat && !matchTag && !matchAmt) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  }, [activeExpenses, dateFilter, todayStr, yesterdayStr, currentMonthStr, selectedCategoryFilter, selectedWalletFilter, searchQuery]);

  // Group by Date for Ledger display
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Expense[] } = {};
    filteredList.forEach(item => {
      if (!groups[item.date]) {
        groups[item.date] = [];
      }
      groups[item.date].push(item);
    });
    return groups;
  }, [filteredList]);

  const handleStartEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setEditNotes(exp.notes || '');
    setEditAmount(exp.amount.toString());
  };

  const handleSaveEdit = () => {
    if (!editingExpense) return;
    const numAmt = parseFloat(editAmount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    updateExpense(editingExpense.id, {
      amount: numAmt,
      notes: editNotes,
    });
    setEditingExpense(null);
  };

  const formatFriendlyDate = (d: string) => {
    if (d === todayStr) return 'আজ (Today)';
    if (d === yesterdayStr) return 'গতকাল (Yesterday)';
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('bn-BD', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>দৈনিক খরচ ও ইনস্ট্যান্ট ট্র্যাকার</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            প্রতিটি ১০ টাকা, ২০ টাকা, চা-নাস্তা বা রিকশা ভাড়ার সুনির্দিষ্ট নোট ও ইনস্ট্যান্ট এন্ট্রি
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" /> অ্যাডভান্সড এন্ট্রি
          </button>
        </div>
      </div>

      {/* 1. Dedicated Fast Logger Component */}
      <DailyExpenseLogger />

      {/* 2. Today & Daily Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-950/40 p-4 rounded-2xl">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            আজকের মোট খরচ (Today)
          </p>
          <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1 font-mono">
            {formatCurrency(todayTotal)}
          </h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            মোট <strong>{todayExpenses.length}</strong> টি এন্ট্রি আজ
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            গতকালকের খরচ (Yesterday)
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {formatCurrency(yesterdayTotal)}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {yesterdayExpenses.length} টি এন্ট্রি
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            এই মাসের মোট খরচ (This Month)
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {formatCurrency(thisMonthTotal)}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {thisMonthExpenses.length} টি লেনদেন
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            দৈনিক গড় খরচ (Daily Average)
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {formatCurrency(thisMonthExpenses.length > 0 ? thisMonthTotal / Math.max(1, new Date().getDate()) : 0)}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            প্রতি দিনে আনুমানিক
          </p>
        </div>
      </div>

      {/* 3. Daily Ledger & Expenses Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Date Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'today'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              আজকের খরচ ({todayExpenses.length})
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'yesterday'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              গতকাল
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === '7days'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              গত ৭ দিন
            </button>
            <button
              onClick={() => setDateFilter('this_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'this_month'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              এই মাস
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              সব সময়
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নোট বা খরচ খুঁজুন (যেমন: চা, রিকশা)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* Categories & Wallet filter pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400">ক্যাটাগরি:</span>
          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <span className="text-[11px] font-bold text-slate-400 ml-2">ওয়ালেট:</span>
          <select
            value={selectedWalletFilter}
            onChange={e => setSelectedWalletFilter(e.target.value)}
            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">সব ওয়ালেট/অ্যাকাউন্ট</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.type})
              </option>
            ))}
          </select>
        </div>

        {/* List of Entries grouped by Day */}
        <div className="space-y-6 pt-2">
          {Object.keys(groupedByDate).length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Coffee className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                এই ফিল্টারে কোনো খরচ পাওয়া যায়নি
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                উপরে ইনস্ট্যান্ট লগারের মাধ্যমে ১০ টাকা বা যেকোনো খরচের এন্ট্রি দিন।
              </p>
            </div>
          ) : (
            Object.keys(groupedByDate)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map(dateKey => {
                const dayItems = groupedByDate[dateKey];
                const daySubtotal = dayItems.reduce((s, item) => s + item.convertedAmount, 0);

                return (
                  <div key={dateKey} className="space-y-2.5">
                    {/* Day Group Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {formatFriendlyDate(dateKey)}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          ({dateKey})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {dayItems.length} টি খরচ
                        </span>
                        <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60">
                          -{formatCurrency(daySubtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Day Items */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                      {dayItems.map(item => {
                        const acc = accounts.find(a => a.id === item.accountId);
                        const isBeingEdited = editingExpense?.id === item.id;

                        return (
                          <div
                            key={item.id}
                            className="p-3 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              {/* Category / Icon Avatar */}
                              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                                <TrendingDown className="w-4 h-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                {isBeingEdited ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={editNotes}
                                      onChange={e => setEditNotes(e.target.value)}
                                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                      placeholder="খরচের বিবরণ..."
                                    />
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        value={editAmount}
                                        onChange={e => setEditAmount(e.target.value)}
                                        className="w-24 text-xs font-mono font-bold px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                      />
                                      <button
                                        onClick={handleSaveEdit}
                                        className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingExpense(null)}
                                        className="px-2 py-1 text-xs text-slate-500"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                                        {item.notes || item.categoryName}
                                      </h4>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                        {item.categoryName}
                                      </span>
                                      {item.tags?.map(t => (
                                        <span
                                          key={t}
                                          className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium"
                                        >
                                          #{t}
                                        </span>
                                      ))}
                                    </div>

                                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                      <span className="flex items-center gap-1">
                                        <Wallet className="w-3 h-3 text-slate-400" />
                                        <span>{acc?.name || item.paymentMethod}</span>
                                      </span>
                                      {item.createdAt && (
                                        <span className="flex items-center gap-1 font-mono text-[10px]">
                                          <Clock className="w-3 h-3 text-slate-400" />
                                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Right Amount & Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                              <span className="text-base sm:text-lg font-black font-mono text-rose-600 dark:text-rose-400">
                                -{formatCurrency(item.amount, item.currency)}
                              </span>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => duplicateExpense(item.id)}
                                  title="আরেকবার যোগ করুন (Repeat Expense)"
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  title="Edit Note / Amount"
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteExpense(item.id)}
                                  title="Delete"
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};
