import React, { useState } from 'react';
import {
  Flame,
  LayoutDashboard,
  ReceiptText,
  Briefcase,
  PieChart,
  Landmark,
  Handshake,
  TrendingUp,
  FileCheck2,
  Target,
  FileSpreadsheet,
  Settings,
  Trash2,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const {
    trashItems,
    expenses,
    loans,
    investments,
    formatCurrency,
    totalAccountBalance,
  } = useFinance();

  const [showMoreTools, setShowMoreTools] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayExpenseCount = expenses.filter(e => !e.isDeleted && e.date === todayStr).length;

  const totalTrashCount =
    trashItems.incomes.length +
    trashItems.expenses.length +
    trashItems.transfers.length +
    trashItems.loans.length;

  // Essential primary navigation items
  const primaryNavItems = [
    {
      id: 'daily-expense',
      label: 'দৈনিক খরচ (Daily Expense)',
      icon: Flame,
      badge: todayExpenseCount > 0 ? `${todayExpenseCount} আজ` : null,
      isPrimaryHighlight: true,
    },
    { id: 'dashboard', label: 'ড্যাশবোর্ড (Dashboard)', icon: LayoutDashboard, badge: null },
    { id: 'transactions', label: 'সব লেনদেন (Transactions)', icon: ReceiptText, badge: null },
    { id: 'accounts', label: 'অ্যাকাউন্ট ও ওয়ালেট (Wallets)', icon: Landmark, badge: null },
    { id: 'budgets', label: 'বাজেট ও ক্যাটাগরি (Budgets)', icon: PieChart, badge: null },
    { id: 'income-salary', label: 'আয় ও বেতন (Income)', icon: Briefcase, badge: null },
    { id: 'loans', label: 'ধার-দেনা (Loans)', icon: Handshake, badge: loans.length > 0 ? loans.length : null },
    { id: 'reports', label: 'রিপোর্ট ও সামারি (Reports)', icon: FileSpreadsheet, badge: null },
    { id: 'settings', label: 'সেটিংস ও ব্যাকআপ (Settings)', icon: Settings, badge: null },
  ];

  // Secondary / Advanced tools
  const secondaryNavItems = [
    { id: 'investments', label: 'Investments / DPS', icon: TrendingUp, badge: investments.length > 0 ? investments.length : null },
    { id: 'freelance', label: 'Freelance & Invoices', icon: FileCheck2, badge: null },
    { id: 'goals', label: 'Savings Goals', icon: Target, badge: null },
    { id: 'trash', label: 'Trash Bin', icon: Trash2, badge: totalTrashCount > 0 ? totalTrashCount : null, isDangerBadge: true },
  ];

  const renderItem = (item: any) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => {
          onSelectTab(item.id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
          isActive
            ? item.isPrimaryHighlight
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold shadow-xs border border-amber-300 dark:border-amber-700/80'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs border border-emerald-200/80 dark:border-emerald-800/80'
            : item.isPrimaryHighlight
            ? 'bg-amber-500/5 hover:bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold border border-amber-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon
            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
              item.isPrimaryHighlight
                ? 'text-amber-500 animate-pulse'
                : isActive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>

        {item.badge !== null && (
          <span
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
              item.isDangerBadge
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : item.isPrimaryHighlight
                ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const content = (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none">
      <div className="p-3.5 space-y-1 overflow-y-auto flex-1">
        <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          প্রধান মেনু (Essential)
        </p>

        {primaryNavItems.map(renderItem)}

        {/* Optional / More Tools Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowMoreTools(!showMoreTools)}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <span>অন্যান্য ফিচার (More Tools)</span>
            {showMoreTools ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showMoreTools && (
            <div className="space-y-1 pt-1 pl-1 border-l-2 border-slate-100 dark:border-slate-800 ml-3">
              {secondaryNavItems.map(renderItem)}
            </div>
          )}
        </div>
      </div>

      {/* Account Liquid Balance Card */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-500" /> মোট নগদ ও ব্যাংক ব্যালেন্স
          </p>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {formatCurrency(totalAccountBalance)}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cash, bKash & Bank মিলিয়ে</p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10 w-72 max-w-[80vw] h-full shadow-2xl animate-slide-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
