import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Layers,
  ChevronRight,
  Plus,
  ArrowRightLeft,
  DollarSign,
  AlertCircle,
  Clock,
  Landmark,
  Smartphone,
  CreditCard,
  Percent,
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
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { DailyExpenseLogger } from '../components/DailyExpenseLogger';

const CATEGORY_COLORS = [
  '#059669', // emerald-600
  '#2563eb', // blue-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#e11d48', // rose-600
  '#0891b2', // cyan-600
  '#ea580c', // orange-600
  '#4f46e5', // indigo-600
];

export const DashboardView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
  onSelectTab: (tab: string) => void;
}> = ({ onOpenQuickAdd, onSelectTab }) => {
  const {
    incomes,
    expenses,
    accounts,
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

  // Selected Month/Year Filter (defaults to 2026-08)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-08');

  // Filtered dataset for selected month
  const monthIncomes = useMemo(() => incomes.filter(i => i.date.startsWith(selectedPeriod)), [incomes, selectedPeriod]);
  const monthExpenses = useMemo(() => expenses.filter(e => e.date.startsWith(selectedPeriod)), [expenses, selectedPeriod]);

  // Aggregate values
  const totalIncome = useMemo(() => monthIncomes.reduce((s, i) => s + i.convertedAmount, 0), [monthIncomes]);
  const totalExpense = useMemo(() => monthExpenses.reduce((s, e) => s + e.convertedAmount, 0), [monthExpenses]);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Previous month comparison
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

  // Income Sources Breakdown
  const incomeSourcesData = useMemo(() => {
    const salary = monthIncomes.filter(i => i.type === 'salary').reduce((s, i) => s + i.convertedAmount, 0);
    const freelance = monthIncomes.filter(i => i.type === 'freelance').reduce((s, i) => s + i.convertedAmount, 0);
    const other = monthIncomes.filter(i => i.type === 'other').reduce((s, i) => s + i.convertedAmount, 0);
    return [
      { name: 'Salary & Employment', value: salary, color: '#059669' },
      { name: 'Freelance & Contracts', value: freelance, color: '#2563eb' },
      { name: 'Other Inflows', value: other, color: '#d97706' },
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
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
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
      day: `D${day}`,
      expense: val.expense,
      income: val.income,
    }));
  }, [monthExpenses, monthIncomes]);

  // Financial Health Metrics
  const avgDailySpend = totalExpense / (monthExpenses.length > 0 ? 17 : 30);
  const largestExpense = useMemo(() => {
    if (monthExpenses.length === 0) return null;
    return [...monthExpenses].sort((a, b) => b.convertedAmount - a.convertedAmount)[0];
  }, [monthExpenses]);

  const largestIncome = useMemo(() => {
    if (monthIncomes.length === 0) return null;
    return [...monthIncomes].sort((a, b) => b.convertedAmount - a.convertedAmount)[0];
  }, [monthIncomes]);

  // Recent transactions (merged top 5)
  const recentTransactions = useMemo(() => {
    const inc = monthIncomes.map(i => ({
      id: i.id,
      title: i.source,
      category: i.categoryName,
      date: i.date,
      time: i.time,
      amount: i.convertedAmount,
      type: 'income' as const,
      account: accounts.find(a => a.id === i.accountId)?.name || 'Account',
    }));
    const exp = monthExpenses.map(e => ({
      id: e.id,
      title: e.title,
      category: e.categoryName,
      date: e.date,
      time: e.time,
      amount: e.convertedAmount,
      type: 'expense' as const,
      account: accounts.find(a => a.id === e.accountId)?.name || 'Account',
    }));

    return [...inc, ...exp]
      .sort((a, b) => new Date(`${b.date}T${b.time || '12:00'}`).getTime() - new Date(`${a.date}T${a.time || '12:00'}`).getTime())
      .slice(0, 5);
  }, [monthIncomes, monthExpenses, accounts]);

  // Available Month Periods from dataset
  const availablePeriods = ['2026-08', '2026-07', '2026-06', '2026-05'];

  return (
    <div className="space-y-6">
      {/* Top Header & Period Control Panel */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Executive Financial Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Ledger
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personal wealth management & real-time daily expenditure in <span className="font-medium text-slate-700">{profile.baseCurrency}</span>
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Period Selector */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 shadow-2xs">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="bg-transparent outline-none font-medium text-slate-800 cursor-pointer"
            >
              {availablePeriods.map(p => (
                <option key={p} value={p} className="text-slate-800">
                  {new Date(p + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <button
            id="dashboard-quick-income"
            onClick={() => onOpenQuickAdd('income')}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition active:scale-[0.98]"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            + Income
          </button>

          <button
            id="dashboard-quick-expense"
            onClick={() => onOpenQuickAdd('expense')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-xs transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* 4 Core Financial KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:border-emerald-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Inflow / Income
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-semibold text-slate-900 font-mono tracking-tight">
              {formatCurrency(totalIncome)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              <span>
                {prevTotalIncome > 0
                  ? `${(((totalIncome - prevTotalIncome) / prevTotalIncome) * 100).toFixed(1)}% vs previous month`
                  : `${monthIncomes.length} deposits logged`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Total Expense Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:border-rose-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Outflow / Expense
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shadow-2xs">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-semibold text-rose-600 font-mono tracking-tight">
              {formatCurrency(totalExpense)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
              <span>
                {prevTotalExpense > 0
                  ? `${(((totalExpense - prevTotalExpense) / prevTotalExpense) * 100).toFixed(1)}% vs previous month`
                  : `${monthExpenses.length} expense debits`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Net Savings Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Net Savings Balance
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs border ${
              netSavings >= 0
                ? 'bg-emerald-50 border-emerald-200/80 text-emerald-600'
                : 'bg-rose-50 border-rose-200/80 text-rose-600'
            }`}>
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-semibold font-mono tracking-tight ${
              netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {formatCurrency(netSavings)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Savings Rate:</span>
              <span className={`font-mono font-medium ${netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Total Net Worth Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Consolidated Net Worth
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-semibold text-slate-900 font-mono tracking-tight">
              {formatCurrency(netWorth)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="text-emerald-600 font-medium">Liquid: {formatCurrency(totalAccountBalance, undefined, { compact: true })}</span>
              <span className="text-slate-600 font-normal">DPS: {formatCurrency(totalInvestmentValue, undefined, { compact: true })}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Daily Quick Expense Logger Bar */}
      <div className="rounded-2xl overflow-hidden border border-slate-200/90">
        <DailyExpenseLogger />
      </div>

      {/* Primary Analytics Grid (Cashflow Trend + Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Cashflow Trend Area Chart (8 Columns) */}
        <div className="lg:col-span-8 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Daily Cashflow Timeline
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Income credits (<span className="text-emerald-600 font-medium">Emerald</span>) vs Expense debits (<span className="text-rose-600 font-medium">Rose</span>)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-normal text-slate-700">
                <div className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                <span>Credits</span>
              </div>
              <div className="flex items-center gap-1.5 font-normal text-slate-700">
                <div className="w-2.5 h-2.5 rounded-xs bg-rose-600" />
                <span>Debits</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySpendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income Credits"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#emeraldGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense Debits"
                  stroke="#e11d48"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#roseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Sources Donut (4 Columns) */}
        <div className="lg:col-span-4 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Income Stream Breakdown
              </h3>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono">
                {monthIncomes.length} Entries
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">Source allocations for {selectedPeriod}</p>

            <div className="h-44 w-full mt-2">
              {incomeSourcesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeSourcesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {incomeSourcesData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatCurrency(val), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '13px',
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No income entries for this month
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
            {incomeSourcesData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-normal">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-medium text-slate-900">{formatCurrency(item.value)}</span>
                  <span className="text-slate-400 text-xs">
                    ({totalIncome > 0 ? ((item.value / totalIncome) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Category Spending & Quick Account Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Expense Breakdown (7 Columns) */}
        <div className="lg:col-span-7 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-600" />
                Spending by Category
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Top expenditure categories this period</p>
            </div>
            <button
              onClick={() => onSelectTab('budgets')}
              className="text-xs sm:text-sm text-emerald-600 hover:underline font-medium flex items-center gap-1"
            >
              Budgets & Limits <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-52 w-full">
            {categoryExpensesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryExpensesData.slice(0, 5)} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), 'Spent']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryExpensesData.slice(0, 5).map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense entries recorded yet
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-100">
            {categoryExpensesData.slice(0, 6).map(c => (
              <div key={c.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm">
                <p className="text-xs text-slate-500 truncate">{c.name}</p>
                <p className="font-medium text-slate-900 font-mono mt-0.5">{formatCurrency(c.value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Wallets & Balances (5 Columns) */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                Connected Accounts & Wallets
              </h3>
              <button
                onClick={() => onSelectTab('accounts')}
                className="text-xs sm:text-sm text-emerald-600 hover:underline font-medium flex items-center gap-0.5"
              >
                All Accounts <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-3">Live balances per funding instrument</p>

            <div className="space-y-2.5">
              {accounts.slice(0, 4).map(acc => {
                const isMobileWallet = acc.type === 'bkash' || acc.type === 'nagad' || acc.type === 'rocket';
                const isBank = acc.type === 'bank';
                const isCash = acc.type === 'cash';

                return (
                  <div
                    key={acc.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                        {isMobileWallet ? (
                          <Smartphone className="w-4 h-4 text-pink-600" />
                        ) : isBank ? (
                          <Landmark className="w-4 h-4 text-blue-600" />
                        ) : isCash ? (
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-violet-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-900">{acc.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{acc.type} • {acc.currency}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-medium font-mono text-slate-900">
                        {formatCurrency(acc.balance, acc.currency)}
                      </p>
                      <span className="text-xs font-normal text-emerald-600">Active</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-normal">Total Liquid Capital:</span>
            <span className="font-semibold font-mono text-emerald-600 text-sm sm:text-base">
              {formatCurrency(totalAccountBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Health Indicators & Micro-Analytics (4 Grid Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Burn Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Daily Burn Rate</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-rose-600 font-mono mt-1.5">
            {formatCurrency(avgDailySpend)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Average daily cash burn speed</p>
        </div>

        {/* Side Income Multiplier */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Side Income Ratio</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-emerald-600 font-mono mt-1.5">
            {totalIncome > 0
              ? `${((incomeSourcesData.find(i => i.name.includes('Freelance'))?.value || 0) / (incomeSourcesData.find(i => i.name.includes('Salary'))?.value || 1)).toFixed(2)}x`
              : '0.00x'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Freelance vs base salary multiplier</p>
        </div>

        {/* Largest Single Expense in Rose-600 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Largest Expense</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-rose-600 font-mono mt-1.5 truncate">
            {largestExpense ? formatCurrency(largestExpense.convertedAmount) : 'None'}
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {largestExpense ? `${largestExpense.title} (${largestExpense.categoryName})` : 'No expenses logged'}
          </p>
        </div>

        {/* Largest Single Income in Emerald-600 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Largest Inflow</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-emerald-600 font-mono mt-1.5 truncate">
            {largestIncome ? formatCurrency(largestIncome.convertedAmount) : 'None'}
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {largestIncome ? `${largestIncome.source}` : 'No deposits logged'}
          </p>
        </div>
      </div>

      {/* Lower Row: Active Category Budgets & Recent Transactions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Budgets (6 Columns) */}
        <div className="lg:col-span-6 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Active Category Budgets
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Budget threshold consumption monitoring</p>
            </div>
            <button
              onClick={() => onSelectTab('budgets')}
              className="text-xs sm:text-sm font-medium text-emerald-600 hover:underline flex items-center gap-1"
            >
              All Budgets <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {budgets.slice(0, 4).map(b => {
              const spent = monthExpenses
                .filter(e => e.categoryId === b.categoryId)
                .reduce((sum, e) => sum + e.convertedAmount, 0);
              const percent = (spent / b.monthlyLimit) * 100;
              const isOver = percent >= 100;
              const isWarning = percent >= b.alertThresholdPercent && !isOver;

              return (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                    <span className="font-medium text-slate-800">{b.categoryName}</span>
                    <span
                      className={`font-mono font-medium ${
                        isOver
                          ? 'text-rose-600'
                          : isWarning
                          ? 'text-amber-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {formatCurrency(spent)} / {formatCurrency(b.monthlyLimit)} ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions Feed (6 Columns) */}
        <div className="lg:col-span-6 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                Recent Ledger Activity
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Latest chronological transactions</p>
            </div>
            <button
              onClick={() => onSelectTab('expenses')}
              className="text-xs sm:text-sm font-medium text-emerald-600 hover:underline flex items-center gap-1"
            >
              Full Ledger <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[180px] sm:max-w-[240px]">
                        {tx.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tx.category} • {tx.account} • {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs sm:text-sm font-mono font-medium ${
                        tx.type === 'income'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <span className="text-xs text-slate-400 capitalize">{tx.type}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs sm:text-sm text-slate-400">No transactions recorded for this period</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
