import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CreditCard,
  Briefcase,
  Layers,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { DailyExpenseLogger } from '../components/DailyExpenseLogger';

const PIE_COLORS = [
  '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4',
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#3b82f6',
];

export const DashboardView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
  onSelectTab: (tab: string) => void;
}> = ({ onOpenQuickAdd, onSelectTab }) => {
  const {
    incomes,
    expenses,
    budgets,
    categories,
    netWorth,
    totalAccountBalance,
    totalInvestmentValue,
    totalLoansReceivable,
    totalLoansPayable,
    formatCurrency,
    profile,
  } = useFinance();

  // Selected Month/Year Filter (defaults to August 2026)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-08');

  // Filtered dataset for selected month
  const monthIncomes = useMemo(() => incomes.filter(i => i.date.startsWith(selectedPeriod)), [incomes, selectedPeriod]);
  const monthExpenses = useMemo(() => expenses.filter(e => e.date.startsWith(selectedPeriod)), [expenses, selectedPeriod]);

  // Aggregate values
  const totalIncome = useMemo(() => monthIncomes.reduce((s, i) => s + i.convertedAmount, 0), [monthIncomes]);
  const totalExpense = useMemo(() => monthExpenses.reduce((s, e) => s + e.convertedAmount, 0), [monthExpenses]);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Previous month comparison (July 2026)
  const prevPeriod = useMemo(() => {
    const [y, m] = selectedPeriod.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const py = prevDate.getFullYear();
    const pm = String(prevDate.getMonth() + 1).padStart(2, '0');
    return `${py}-${pm}`;
  }, [selectedPeriod]);

  const prevMonthIncomes = useMemo(() => incomes.filter(i => i.date.startsWith(prevPeriod)), [incomes, prevPeriod]);
  const prevMonthExpenses = useMemo(() => expenses.filter(e => e.date.startsWith(prevPeriod)), [expenses, prevPeriod]);
  const prevTotalIncome = useMemo(() => prevMonthIncomes.reduce((s, i) => s + i.convertedAmount, 0), [prevMonthIncomes]);
  const prevTotalExpense = useMemo(() => prevMonthExpenses.reduce((s, e) => s + e.convertedAmount, 0), [prevMonthExpenses]);

  // Income Sources Breakdown (Salary vs Freelance vs Other)
  const incomeSourcesData = useMemo(() => {
    const salary = monthIncomes.filter(i => i.type === 'salary').reduce((s, i) => s + i.convertedAmount, 0);
    const freelance = monthIncomes.filter(i => i.type === 'freelance').reduce((s, i) => s + i.convertedAmount, 0);
    const other = monthIncomes.filter(i => i.type === 'other').reduce((s, i) => s + i.convertedAmount, 0);
    return [
      { name: 'Job Salary', value: salary, color: '#10b981' },
      { name: 'Freelance & Projects', value: freelance, color: '#6366f1' },
      { name: 'Other Income', value: other, color: '#f59e0b' },
    ].filter(d => d.value > 0);
  }, [monthIncomes]);

  // Expense by Category Breakdown
  const categoryExpensesData = useMemo(() => {
    const map: { [name: string]: number } = {};
    monthExpenses.forEach(e => {
      map[e.categoryName] = (map[e.categoryName] || 0) + e.convertedAmount;
    });
    return Object.entries(map)
      .map(([name, value], idx) => ({
        name,
        value,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses]);

  // Daily spend trend across the month
  const dailySpendData = useMemo(() => {
    const daysInMonth = 31;
    const daysMap: { [day: number]: { income: number; expense: number } } = {};
    for (let d = 1; d <= daysInMonth; d++) {
      daysMap[d] = { income: 0, expense: 0 };
    }
    monthExpenses.forEach(e => {
      const day = parseInt(e.date.slice(8, 10), 10);
      if (daysMap[day]) daysMap[day].expense += e.convertedAmount;
    });
    monthIncomes.forEach(i => {
      const day = parseInt(i.date.slice(8, 10), 10);
      if (daysMap[day]) daysMap[day].income += i.convertedAmount;
    });

    return Object.entries(daysMap).map(([day, val]) => ({
      day: `Day ${day}`,
      expense: val.expense,
      income: val.income,
    }));
  }, [monthExpenses, monthIncomes]);

  // Financial Health Metrics
  const avgDailySpend = totalExpense / (monthExpenses.length > 0 ? 17 : 30); // 17 days into August
  const largestExpense = useMemo(() => {
    if (monthExpenses.length === 0) return null;
    return [...monthExpenses].sort((a, b) => b.convertedAmount - a.convertedAmount)[0];
  }, [monthExpenses]);

  const largestIncome = useMemo(() => {
    if (monthIncomes.length === 0) return null;
    return [...monthIncomes].sort((a, b) => b.convertedAmount - a.convertedAmount)[0];
  }, [monthIncomes]);

  // Available Month Periods from dataset
  const availablePeriods = ['2026-08', '2026-07', '2026-06', '2026-05'];

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Executive Financial Overview</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Live Tracker
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Single-user production ledger with automated exchange rate conversion to {profile.baseCurrency}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="bg-transparent outline-none font-bold cursor-pointer"
            >
              {availablePeriods.map(p => (
                <option key={p} value={p} className="dark:bg-slate-900">
                  {new Date(p + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" /> Quick Entry
          </button>
        </div>
      </div>

      {/* 4 Key Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalIncome)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>
              {prevTotalIncome > 0 ? `${(((totalIncome - prevTotalIncome) / prevTotalIncome) * 100).toFixed(1)}% vs last month` : 'Monthly earned'}
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Expense</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalExpense)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>
              {prevTotalExpense > 0 ? `${(((totalExpense - prevTotalExpense) / prevTotalExpense) * 100).toFixed(1)}% vs last month` : 'Monthly spent'}
            </span>
          </div>
        </div>

        {/* Net Savings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Savings</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold ${netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(netSavings)}
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>Savings Rate:</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{savingsRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Net Worth */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Worth</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(netWorth)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Liq: {formatCurrency(totalAccountBalance, undefined, { compact: true })}</span>
            <span>DPS: {formatCurrency(totalInvestmentValue, undefined, { compact: true })}</span>
          </div>
        </div>
      </div>

      {/* Daily Quick Expense Logger Bar */}
      <DailyExpenseLogger />

      {/* Charts Row: Income Sources Donut + Category Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income Sources Donut (Salary vs Freelance vs Other) */}
        <div className="lg:col-span-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-500" /> Income Stream Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">{monthIncomes.length} deposits</span>
          </div>

          <div className="h-56 w-full">
            {incomeSourcesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeSourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {incomeSourcesData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No income records for this month</div>
            )}
          </div>

          <div className="space-y-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {incomeSourcesData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.value)}</span>
                  <span className="text-slate-400 text-[10px]">
                    ({totalIncome > 0 ? ((item.value / totalIncome) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="lg:col-span-7 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-500" /> Spending by Category
            </h3>
            <button
              onClick={() => onSelectTab('budgets')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
            >
              Manage Budgets <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            {categoryExpensesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryExpensesData.slice(0, 6)} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {categoryExpensesData.slice(0, 6).map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No expenses recorded yet</div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {categoryExpensesData.slice(0, 6).map(c => (
              <div key={c.name} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
                <p className="text-[11px] text-slate-500 truncate">{c.name}</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatCurrency(c.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Spend Trend Area Chart */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Cashflow Trend</h3>
            <p className="text-xs text-slate-400">Daily income credits vs expense debits throughout {selectedPeriod}</p>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySpendData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="income" name="Income Credits" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expense" name="Expense Debits" stroke="#f43f5e" fillOpacity={1} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Health Indicators & Top Spending */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Daily Spend</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(avgDailySpend)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Average daily cash burn rate</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Freelance to Salary Ratio</p>
          <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {totalIncome > 0
              ? `${((incomeSourcesData.find(i => i.name.includes('Freelance'))?.value || 0) / (incomeSourcesData.find(i => i.name.includes('Salary'))?.value || 1)).toFixed(2)}x`
              : '0.00x'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Side income multiplying factor</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Largest Expense</p>
          <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-1 truncate">
            {largestExpense ? formatCurrency(largestExpense.convertedAmount) : 'None'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 truncate">{largestExpense?.categoryName || 'No expenses'}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Largest Single Income</p>
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {largestIncome ? formatCurrency(largestIncome.convertedAmount) : 'None'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 truncate">{largestIncome?.source || 'No incomes'}</p>
        </div>
      </div>

      {/* Budget Consumption Bars */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Category Budgets</h3>
          <button
            onClick={() => onSelectTab('budgets')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            All Budgets <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.slice(0, 4).map(b => {
            const spent = monthExpenses
              .filter(e => e.categoryId === b.categoryId)
              .reduce((sum, e) => sum + e.convertedAmount, 0);
            const percent = (spent / b.monthlyLimit) * 100;
            const isOver = percent >= 100;
            const isWarning = percent >= b.alertThresholdPercent && !isOver;

            return (
              <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{b.categoryName}</span>
                  <span className={`font-bold ${isOver ? 'text-rose-600' : isWarning ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>
                    {formatCurrency(spent)} / {formatCurrency(b.monthlyLimit)} ({percent.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
