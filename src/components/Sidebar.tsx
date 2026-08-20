import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Layers,
  Sparkles,
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
    currentUser,
  } = useFinance();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayExpenseCount = expenses.filter(e => !e.isDeleted && e.date === todayStr).length;

  const totalTrashCount =
    trashItems.incomes.length +
    trashItems.expenses.length +
    trashItems.transfers.length +
    trashItems.loans.length;

  const navGroups = [
    {
      groupTitle: 'দৈনিক ট্র্যাকিং ও খতিয়ান',
      groupSubtitle: 'Daily Logging & Overview',
      items: [
        {
          id: 'daily-expense',
          label: 'দৈনিক খরচ ট্র্যাকার',
          sublabel: 'Daily Micro Expense',
          icon: Flame,
          badge: todayExpenseCount > 0 ? `${todayExpenseCount} আজ` : null,
          isPrimaryHighlight: true,
        },
        {
          id: 'dashboard',
          label: 'মূল ড্যাশবোর্ড',
          sublabel: 'Finance Overview',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'transactions',
          label: 'লেনদেন খতিয়ান',
          sublabel: 'All Transactions',
          icon: ReceiptText,
          badge: null,
        },
      ],
    },
    {
      groupTitle: 'টাকা ও ওয়ালেট ব্যবস্থাপনা',
      groupSubtitle: 'Cash Flow & Accounts',
      items: [
        {
          id: 'accounts',
          label: 'অ্যাকাউন্ট ও ওয়ালেট',
          sublabel: 'Cash, Bank, bKash',
          icon: Landmark,
          badge: null,
        },
        {
          id: 'budgets',
          label: 'বাজেট ও ক্যাটাগরি',
          sublabel: 'Spending Limits',
          icon: PieChart,
          badge: null,
        },
        {
          id: 'income-salary',
          label: 'আয় ও চাকরি বেতন',
          sublabel: 'Salary & Earnings',
          icon: Briefcase,
          badge: null,
        },
        {
          id: 'loans',
          label: 'ধার-দেনা ও ঋণ',
          sublabel: 'Lend & Borrow',
          icon: Handshake,
          badge: loans.length > 0 ? loans.length : null,
        },
      ],
    },
    {
      groupTitle: 'ভবিষ্যত সঞ্চয় ও ক্যারিয়ার',
      groupSubtitle: 'Growth & Invoicing',
      items: [
        {
          id: 'goals',
          label: 'সঞ্চয়ের লক্ষ্য',
          sublabel: 'Savings Goals',
          icon: Target,
          badge: null,
        },
        {
          id: 'investments',
          label: 'ইনভেস্টমেন্ট ও ডিপিএস',
          sublabel: 'DPS & Assets',
          icon: TrendingUp,
          badge: investments.length > 0 ? investments.length : null,
        },
        {
          id: 'freelance',
          label: 'ফ্রিল্যান্সিং ও ইনভয়েস',
          sublabel: 'Clients & Invoicing',
          icon: FileCheck2,
          badge: null,
        },
      ],
    },
    {
      groupTitle: 'নিরাপত্তা ও অডিট',
      groupSubtitle: 'Security & User Roles',
      items: [
        {
          id: 'security-users',
          label: 'রোল ও নিরাপত্তা (RBAC)',
          sublabel: 'User Roles & Access',
          icon: Shield,
          badge: currentUser.role.toUpperCase(),
        },
        {
          id: 'reports',
          label: 'রিপোর্ট ও ট্যাক্স সামারি',
          sublabel: 'Reports & NBR Tax',
          icon: FileSpreadsheet,
          badge: null,
        },
        {
          id: 'settings',
          label: 'সেটিংস ও ব্যাকআপ',
          sublabel: 'Preferences & Backup',
          icon: Settings,
          badge: null,
        },
        {
          id: 'trash',
          label: 'ট্র্যাশ বিন',
          sublabel: 'Deleted Records',
          icon: Trash2,
          badge: totalTrashCount > 0 ? totalTrashCount : null,
          isDangerBadge: true,
        },
      ],
    },
  ];

  const renderItem = (item: any) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <motion.button
        key={item.id}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          onSelectTab(item.id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 relative group ${
          isActive
            ? item.isPrimaryHighlight
              ? 'bg-amber-50 text-amber-900 font-medium shadow-2xs border border-amber-300'
              : 'bg-emerald-50 text-emerald-900 font-medium shadow-2xs border border-emerald-300'
            : item.isPrimaryHighlight
            ? 'bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 font-normal border border-amber-200/60'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isActive
                ? item.isPrimaryHighlight
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-emerald-600 text-white shadow-xs'
                : item.isPrimaryHighlight
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-sm font-medium tracking-tight truncate leading-tight">
              {item.label}
            </p>
            <p className="text-xs text-slate-400 font-normal truncate leading-tight mt-0.5">
              {item.sublabel}
            </p>
          </div>
        </div>

        {item.badge !== null && (
          <span
            className={`shrink-0 ml-1.5 px-2 py-0.5 text-xs font-medium rounded-md ${
              item.isDangerBadge
                ? 'bg-rose-100 text-rose-700'
                : item.isPrimaryHighlight
                ? 'bg-amber-200/80 text-amber-950 font-semibold'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {item.badge}
          </span>
        )}
      </motion.button>
    );
  };

  const content = (
    <aside className="w-full lg:w-72 flex flex-col h-full bg-white border-r border-slate-200/90 select-none">
      {/* Mobile Drawer Header */}
      {isOpenMobile && (
        <div className="lg:hidden p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-semibold text-xs">
              FC
            </div>
            <span className="text-sm font-semibold text-slate-800">FinanceCore মেনু</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            aria-label="Close menu"
          >
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="p-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2 pb-1 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {group.groupTitle}
              </span>
            </div>
            <div className="space-y-0.5">
              {group.items.map(renderItem)}
            </div>
          </div>
        ))}
      </div>

      {/* Account Liquid Balance Card */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-medium text-slate-500 tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> মোট তরল ক্যাশ
            </p>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Synced" />
          </div>
          <p className="text-base font-semibold text-slate-900 mt-1.5 font-mono tracking-tight">
            {formatCurrency(totalAccountBalance)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Cash, bKash & Bank মিলিয়ে</p>
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onCloseMobile} />
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl bg-white"
          >
            {content}
          </motion.div>
        </div>
      )}
    </>
  );
};
