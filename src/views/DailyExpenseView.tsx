import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Flame className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                দৈনিক খরচ ও ইনস্ট্যান্ট ট্র্যাকার
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <Zap className="w-3.5 h-3.5 text-emerald-600" /> Live Ledger
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              চা-নাস্তা, রিকশা ভাড়া, কাঁচাবাজার কিংবা দৈনন্দিন ছোট-বড় সকল খরচের স্বচ্ছ ও তাৎক্ষণিক হিসাব
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-sm font-medium text-slate-700 flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <Receipt className="w-4 h-4 text-emerald-600" /> অ্যাডভান্সড খরচ
          </button>
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-1.5 transition-colors active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2]" /> আয় যোগ
          </button>
        </div>
      </div>

      {/* 1. Fast Micro-Expense Logger */}
      <DailyExpenseLogger />

      {/* 2. Key Daily Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Total */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          whileHover={{ y: -2 }}
          className="bg-white border border-emerald-200/80 p-4 sm:p-5 rounded-2xl shadow-xs relative overflow-hidden transition-all hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-700">
              আজকের মোট খরচ (Today)
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold text-emerald-700 mt-2 font-mono tracking-tight">
            {formatCurrency(todayTotal)}
          </h3>
          <div className="flex items-center justify-between text-xs text-emerald-700/80 mt-2 pt-2 border-t border-emerald-100/80">
            <span>আজকের এন্ট্রি:</span>
            <span className="font-medium font-mono bg-emerald-100/70 px-2 py-0.5 rounded text-xs text-emerald-800">
              {todayExpenses.length} টি
            </span>
          </div>
        </motion.div>

        {/* Yesterday's Total */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-xs transition-all hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              গতকালকের খরচ (Yesterday)
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold text-slate-800 mt-2 font-mono tracking-tight">
            {formatCurrency(yesterdayTotal)}
          </h3>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>গতকালের এন্ট্রি:</span>
            <span className="font-medium font-mono bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700">
              {yesterdayExpenses.length} টি
            </span>
          </div>
        </motion.div>

        {/* This Month Total */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-xs transition-all hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              চলতি মাসের খরচ (This Month)
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold text-slate-800 mt-2 font-mono tracking-tight">
            {formatCurrency(thisMonthTotal)}
          </h3>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>মাসিক লেনদেন:</span>
            <span className="font-medium font-mono bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700">
              {thisMonthExpenses.length} টি
            </span>
          </div>
        </motion.div>

        {/* Daily Average */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-xs transition-all hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              দৈনিক গড় খরচ (Daily Avg)
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold text-slate-800 mt-2 font-mono tracking-tight">
            {formatCurrency(thisMonthExpenses.length > 0 ? thisMonthTotal / Math.max(1, new Date().getDate()) : 0)}
          </h3>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>প্রতিদিন আনুমানিক:</span>
            <span className="font-medium text-xs text-slate-600">
              চলতি মাসের গতি
            </span>
          </div>
        </motion.div>
      </div>

      {/* 3. Daily Ledger & Expenses Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Date Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                dateFilter === 'today'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              আজকের খরচ ({todayExpenses.length})
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                dateFilter === 'yesterday'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              গতকাল ({yesterdayExpenses.length})
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                dateFilter === '7days'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              গত ৭ দিন
            </button>
            <button
              onClick={() => setDateFilter('this_month')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                dateFilter === 'this_month'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              এই মাস
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                dateFilter === 'all'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সব সময়
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নোট বা খরচ খুঁজুন (যেমন: চা, রিকশা)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Categories & Wallet filter pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">ক্যাটাগরি:</span>
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
            >
              <option value="all">সব ক্যাটাগরি</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <span className="text-xs font-medium text-slate-400 ml-2">ওয়ালেট:</span>
            <select
              value={selectedWalletFilter}
              onChange={e => setSelectedWalletFilter(e.target.value)}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
            >
              <option value="all">সব ওয়ালেট/অ্যাকাউন্ট</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedCategoryFilter !== 'all' || selectedWalletFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryFilter('all');
                setSelectedWalletFilter('all');
              }}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-800 font-medium underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> ফিল্টার রিসেট
            </button>
          )}
        </div>

        {/* List of Entries grouped by Day */}
        <div className="space-y-5 pt-2">
          {Object.keys(groupedByDate).length === 0 ? (
            <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
              <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-slate-700">
                এই ফিল্টারে কোনো খরচ পাওয়া যায়নি
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
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
                  <div key={dateKey} className="space-y-2">
                    {/* Day Group Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-800">
                          {formatFriendlyDate(dateKey)}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({dateKey})
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs sm:text-sm text-slate-500 font-normal hidden sm:inline">
                          {dayItems.length} টি খরচ
                        </span>
                        <span className="text-xs sm:text-sm font-medium font-mono text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200/80">
                          -{formatCurrency(daySubtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Day Items */}
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                      {dayItems.map(item => {
                        const acc = accounts.find(a => a.id === item.accountId);
                        const isBeingEdited = editingExpense?.id === item.id;

                        return (
                          <div
                            key={item.id}
                            className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              {/* Category / Icon Avatar */}
                              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200/70 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                <TrendingDown className="w-4 h-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                {isBeingEdited ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={editNotes}
                                      onChange={e => setEditNotes(e.target.value)}
                                      className="w-full text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                                      placeholder="খরচের বিবরণ..."
                                    />
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        value={editAmount}
                                        onChange={e => setEditAmount(e.target.value)}
                                        className="w-28 text-xs sm:text-sm font-mono font-medium px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                                      />
                                      <button
                                        onClick={handleSaveEdit}
                                        className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingExpense(null)}
                                        className="px-2.5 py-1 text-xs text-slate-500"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-sm sm:text-base font-medium text-slate-900">
                                        {item.notes || item.categoryName}
                                      </h4>
                                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-normal">
                                        {item.categoryName}
                                      </span>
                                      {item.tags?.map(t => (
                                        <span
                                          key={t}
                                          className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-normal border border-emerald-100"
                                        >
                                          #{t}
                                        </span>
                                      ))}
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                      <span className="flex items-center gap-1 font-normal text-slate-600">
                                        <Wallet className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{acc?.name || item.paymentMethod}</span>
                                      </span>
                                      {item.createdAt && (
                                        <span className="flex items-center gap-1 font-mono text-xs text-slate-400">
                                          <Clock className="w-3 h-3" />
                                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Right Amount & Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <span className="text-base sm:text-lg font-semibold font-mono text-rose-600">
                                -{formatCurrency(item.amount, item.currency)}
                              </span>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => duplicateExpense(item.id)}
                                  title="আরেকবার যোগ করুন (Repeat Expense)"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  title="Edit Note / Amount"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteExpense(item.id)}
                                  title="Delete"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
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
