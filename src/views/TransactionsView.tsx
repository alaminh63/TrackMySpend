import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Copy,
  Trash2,
  Edit2,
  FileText,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  Users,
  CheckCircle2,
  Clock,
  ChevronDown,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Income, Expense, Transfer, CurrencyCode } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import { exportTransactionsCsv } from '../utils/pdfGenerator';
import { DailyExpenseLogger } from '../components/DailyExpenseLogger';

export const TransactionsView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
}> = ({ onOpenQuickAdd }) => {
  const {
    incomes,
    expenses,
    transfers,
    deleteIncome,
    deleteExpense,
    deleteTransfer,
    duplicateIncome,
    duplicateExpense,
    formatCurrency,
    categories,
    accounts,
    profile,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Receipt Modal State
  const [viewReceipt, setViewReceipt] = useState<{ url: string; name: string } | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showQuickLogger, setShowQuickLogger] = useState(false);

  // Unified list
  type UnifiedTx = {
    id: string;
    type: 'income' | 'expense' | 'transfer';
    title: string;
    subTitle: string;
    date: string;
    amount: number;
    currency: CurrencyCode;
    convertedAmount: number;
    accountId: string;
    accountName: string;
    categoryOrPlatform: string;
    statusOrMethod: string;
    receiptUrl?: string;
    receiptName?: string;
    isShared?: boolean;
    sharedWith?: string;
    myShareAmount?: number;
    tags: string[];
    raw: Income | Expense | Transfer;
  };

  const unifiedList: UnifiedTx[] = useMemo(() => {
    const list: UnifiedTx[] = [];

    incomes.forEach(i => {
      const acc = accounts.find(a => a.id === i.accountId);
      list.push({
        id: i.id,
        type: 'income',
        title: i.source,
        subTitle: i.clientName ? `Client: ${i.clientName}` : i.type.toUpperCase(),
        date: i.date,
        amount: i.amount,
        currency: i.currency,
        convertedAmount: i.convertedAmount,
        accountId: i.accountId,
        accountName: acc?.name || 'Account',
        categoryOrPlatform: i.paymentPlatform || 'Deposit',
        statusOrMethod: i.status,
        tags: i.tags || [],
        raw: i,
      });
    });

    expenses.forEach(e => {
      const acc = accounts.find(a => a.id === e.accountId);
      list.push({
        id: e.id,
        type: 'expense',
        title: e.categoryName,
        subTitle: e.subCategoryName ? `${e.subCategoryName}${e.notes ? ` • ${e.notes}` : ''}` : e.notes || 'Expense',
        date: e.date,
        amount: e.amount,
        currency: e.currency,
        convertedAmount: e.convertedAmount,
        accountId: e.accountId,
        accountName: acc?.name || 'Account',
        categoryOrPlatform: e.categoryName,
        statusOrMethod: e.paymentMethod,
        receiptUrl: e.receiptUrl,
        receiptName: e.receiptName,
        isShared: e.isShared,
        sharedWith: e.sharedWith,
        myShareAmount: e.myShareAmount,
        tags: e.tags || [],
        raw: e,
      });
    });

    transfers.forEach(t => {
      const fromAcc = accounts.find(a => a.id === t.fromAccountId);
      const toAcc = accounts.find(a => a.id === t.toAccountId);
      list.push({
        id: t.id,
        type: 'transfer',
        title: `Transfer: ${fromAcc?.name || 'Account'} → ${toAcc?.name || 'Account'}`,
        subTitle: t.notes || 'Internal Account Transfer',
        date: t.date,
        amount: t.amount,
        currency: profile.baseCurrency,
        convertedAmount: t.amount,
        accountId: t.fromAccountId,
        accountName: fromAcc?.name || 'Account',
        categoryOrPlatform: 'Transfer',
        statusOrMethod: 'Completed',
        tags: ['transfer'],
        raw: t,
      });
    });

    return list;
  }, [incomes, expenses, transfers, accounts, profile.baseCurrency]);

  // Filtering
  const filteredList = useMemo(() => {
    return unifiedList.filter(item => {
      if (activeTab !== 'all' && item.type !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSub = item.subTitle.toLowerCase().includes(q);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));
        const matchesAcc = item.accountName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSub && !matchesTags && !matchesAcc) return false;
      }
      if (selectedCategory !== 'all' && item.categoryOrPlatform !== selectedCategory) return false;
      if (selectedAccount !== 'all' && item.accountId !== selectedAccount) return false;
      if (dateFrom && item.date < dateFrom) return false;
      if (dateTo && item.date > dateTo) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount_desc') return b.convertedAmount - a.convertedAmount;
      if (sortBy === 'amount_asc') return a.convertedAmount - b.convertedAmount;
      return 0;
    });
  }, [unifiedList, activeTab, searchQuery, selectedCategory, selectedAccount, dateFrom, dateTo, sortBy]);

  const filteredIncomeTotal = useMemo(() => {
    return filteredList.filter(i => i.type === 'income').reduce((s, i) => s + (i.convertedAmount || 0), 0);
  }, [filteredList]);

  const filteredExpenseTotal = useMemo(() => {
    return filteredList.filter(i => i.type === 'expense').reduce((s, i) => s + (i.convertedAmount || 0), 0);
  }, [filteredList]);

  const handleDeleteItem = (item: UnifiedTx) => {
    if (confirm(`Move "${item.title}" to trash?`)) {
      if (item.type === 'income') deleteIncome(item.id);
      else if (item.type === 'expense') deleteExpense(item.id);
      else if (item.type === 'transfer') deleteTransfer(item.id);
    }
  };

  const handleDuplicateItem = (item: UnifiedTx) => {
    if (item.type === 'income') duplicateIncome(item.id);
    else if (item.type === 'expense') duplicateExpense(item.id);
  };

  const handleBulkDelete = () => {
    if (confirm(`Move ${selectedIds.length} selected items to trash?`)) {
      selectedIds.forEach(id => {
        const item = unifiedList.find(u => u.id === id);
        if (item) {
          if (item.type === 'income') deleteIncome(id);
          else if (item.type === 'expense') deleteExpense(id);
          else if (item.type === 'transfer') deleteTransfer(id);
        }
      });
      setSelectedIds([]);
    }
  };

  const handleExportCsv = () => {
    exportTransactionsCsv(incomes, expenses, profile.baseCurrency);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Transactions & Ledgers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete transaction record with multi-currency receipts, split expenses, and soft-delete trash protection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickLogger(!showQuickLogger)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              showQuickLogger
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-700  hover:bg-amber-500/20'
            }`}
          >
            <span>⚡ দৈনিক ইনস্ট্যান্ট এন্ট্রি</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
            title="Download CSV statement"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" /> Export CSV
          </button>
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Optional Inline Quick Daily Logger */}
      {showQuickLogger && (
        <div className="animate-fadeIn">
          <DailyExpenseLogger />
        </div>
      )}

      {/* Tabs & Search Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Type Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'all' ? 'bg-white  text-slate-900  font-bold shadow-xs' : 'text-slate-600 '
              }`}
            >
              All ({unifiedList.length})
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                activeTab === 'expense' ? 'bg-rose-500 text-white font-bold shadow-xs' : 'text-slate-600 '
              }`}
            >
              <TrendingDown className="w-3 h-3" /> Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                activeTab === 'income' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 '
              }`}
            >
              <TrendingUp className="w-3 h-3" /> Income ({incomes.length})
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                activeTab === 'transfer' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 '
              }`}
            >
              <ArrowRightLeft className="w-3 h-3" /> Transfers ({transfers.length})
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">{selectedIds.length} selected</span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Move to Trash
              </button>
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description, tag, client..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={e => setSelectedAccount(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
          >
            <option value="all">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            placeholder="From date"
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            placeholder="To date"
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
          />

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
          >
            <option value="date_desc">Latest First (Date ↓)</option>
            <option value="date_asc">Oldest First (Date ↑)</option>
            <option value="amount_desc">Highest Amount (Amt ↓)</option>
            <option value="amount_asc">Lowest Amount (Amt ↑)</option>
          </select>
        </div>

        {/* Live Filter Summary Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-medium">Filtered Results: <strong>{filteredList.length}</strong> items</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              +{formatCurrency(filteredIncomeTotal)} Inflow
            </span>
            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              -{formatCurrency(filteredExpenseTotal)} Outflow
            </span>
          </div>

          {(searchQuery || selectedCategory !== 'all' || selectedAccount !== 'all' || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedAccount('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transaction Records Table (Desktop) & Card List (Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No transactions match your search filter criteria.
            </div>
          ) : (
            filteredList.map(item => {
              const isSelected = selectedIds.includes(item.id);
              const isExpense = item.type === 'expense';
              const isIncome = item.type === 'income';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 flex flex-col gap-2.5 transition ${
                    isSelected ? 'bg-emerald-50/40' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          if (e.target.checked) setSelectedIds(prev => [...prev, item.id]);
                          else setSelectedIds(prev => prev.filter(id => id !== item.id));
                        }}
                        className="rounded text-emerald-600 mt-1"
                      />
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-600'
                            : isExpense
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-sky-100 text-sky-600'
                        }`}
                      >
                        {isIncome && <TrendingUp className="w-4 h-4" />}
                        {isExpense && <TrendingDown className="w-4 h-4" />}
                        {item.type === 'transfer' && <ArrowRightLeft className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.subTitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-extrabold block ${
                          isIncome
                            ? 'text-emerald-600'
                            : isExpense
                            ? 'text-rose-600'
                            : 'text-sky-600'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(item.convertedAmount)}
                      </span>
                      {item.currency !== profile.baseCurrency && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {item.currency} {item.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row: Date, Account & Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-[11px] text-slate-500">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {item.date}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {item.accountName}
                      </span>

                      {item.receiptUrl && (
                        <button
                          onClick={() => setViewReceipt({ url: item.receiptUrl!, name: item.receiptName || 'Receipt' })}
                          className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> Receipt
                        </button>
                      )}

                      {item.isShared && (
                        <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 text-[10px] font-bold">
                          Split
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.type !== 'transfer' && (
                        <button
                          onClick={() => handleDuplicateItem(item)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                    onChange={e => {
                      if (e.target.checked) setSelectedIds(filteredList.map(i => i.id));
                      else setSelectedIds([]);
                    }}
                    className="rounded text-emerald-600"
                  />
                </th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Description & Category</th>
                <th className="p-3.5">Account / Platform</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Status / Badges</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No transactions match your search filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  const isExpense = item.type === 'expense';
                  const isIncome = item.type === 'income';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            if (e.target.checked) setSelectedIds(prev => [...prev, item.id]);
                            else setSelectedIds(prev => prev.filter(id => id !== item.id));
                          }}
                          className="rounded text-emerald-600"
                        />
                      </td>

                      {/* Date */}
                      <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {item.date}
                      </td>

                      {/* Title & Sub */}
                      <td className="p-3.5">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isIncome
                                ? 'bg-emerald-100 text-emerald-600'
                                : isExpense
                                ? 'bg-rose-100 text-rose-600'
                                : 'bg-sky-100 text-sky-600'
                            }`}
                          >
                            {isIncome && <TrendingUp className="w-3.5 h-3.5" />}
                            {isExpense && <TrendingDown className="w-3.5 h-3.5" />}
                            {item.type === 'transfer' && <ArrowRightLeft className="w-3.5 h-3.5" />}
                          </div>

                          <div>
                            <p className="font-bold text-slate-900 text-xs">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {item.subTitle}
                            </p>

                            {/* Tags */}
                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.map(t => (
                                  <span
                                    key={t}
                                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Account */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">
                          {item.accountName}
                        </span>
                        <span className="block text-[10px] text-slate-400">{item.categoryOrPlatform}</span>
                      </td>

                      {/* Amount */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <span
                          className={`text-sm font-extrabold ${
                            isIncome
                              ? 'text-emerald-600'
                              : isExpense
                              ? 'text-rose-600'
                              : 'text-sky-600'
                          }`}
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''}
                          {formatCurrency(item.convertedAmount)}
                        </span>
                        {item.currency !== profile.baseCurrency && (
                          <span className="block text-[10px] text-slate-400">
                            ({item.currency} {item.amount.toLocaleString()})
                          </span>
                        )}
                      </td>

                      {/* Badges / Receipt / Split */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.receiptUrl && (
                            <button
                              onClick={() => setViewReceipt({ url: item.receiptUrl!, name: item.receiptName || 'Receipt' })}
                              className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] font-bold flex items-center gap-1"
                              title="View Attached Receipt"
                            >
                              <FileText className="w-3 h-3" /> Receipt
                            </button>
                          )}

                          {item.isShared && (
                            <span
                              className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center gap-0.5"
                              title={`Shared with: ${item.sharedWith || 'Family'}`}
                            >
                              <Users className="w-3 h-3" /> Split
                            </span>
                          )}

                          {item.statusOrMethod === 'pending' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          {item.type !== 'transfer' && (
                            <button
                              onClick={() => handleDuplicateItem(item)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700"
                              title="Duplicate Entry"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Viewer Modal */}
      <ReceiptModal
        isOpen={!!viewReceipt}
        onClose={() => setViewReceipt(null)}
        receiptUrl={viewReceipt?.url}
        receiptName={viewReceipt?.name}
      />
    </div>
  );
};
