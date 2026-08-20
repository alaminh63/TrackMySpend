import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthLockScreen } from './components/AuthLockScreen';
import { AuthPortal } from './components/AuthPortal';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { QuickAddModal } from './components/QuickAddModal';
import { CurrencyConverterModal } from './components/CurrencyConverterModal';
import {
  Flame,
  LayoutDashboard,
  Plus,
  Landmark,
  Menu,
  ReceiptText,
  Calendar,
  Sparkles,
  Shield,
} from 'lucide-react';

import { DailyExpenseView } from './views/DailyExpenseView';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { IncomeSalaryView } from './views/IncomeSalaryView';
import { BudgetsView } from './views/BudgetsView';
import { AccountsView } from './views/AccountsView';
import { LoansView } from './views/LoansView';
import { InvestmentsView } from './views/InvestmentsView';
import { FreelanceView } from './views/FreelanceView';
import { SavingsGoalsView } from './views/SavingsGoalsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { TrashView } from './views/TrashView';
import { SecurityUsersView } from './views/SecurityUsersView';

const MainLayout: React.FC = () => {
  const { profile, isAppLocked, isAuthenticated, authModalOpen, setAuthModalOpen } = useFinance();

  const [activeTab, setActiveTab] = useState<string>('daily-expense');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [quickAddModal, setQuickAddModal] = useState<{
    isOpen: boolean;
    defaultTab: 'expense' | 'income' | 'transfer' | 'loan';
  }>({
    isOpen: false,
    defaultTab: 'expense',
  });
  const [currencyConverterOpen, setCurrencyConverterOpen] = useState<boolean>(false);

  // If user signed out, render Auth Portal
  if (!isAuthenticated) {
    return <AuthPortal isModal={false} />;
  }

  // If locked, render PIN unlock screen
  if (profile.isPinLocked && isAppLocked) {
    return <AuthLockScreen />;
  }

  const handleOpenQuickAdd = (tab: 'expense' | 'income' | 'transfer' | 'loan' = 'expense') => {
    setQuickAddModal({
      isOpen: true,
      defaultTab: tab,
    });
  };

  // Formatted current date
  const now = new Date();
  const formattedDate = now.toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedDateEn = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const renderActiveView = () => {
    switch (activeTab) {
      case 'daily-expense':
        return <DailyExpenseView onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'dashboard':
        return <DashboardView onOpenQuickAdd={handleOpenQuickAdd} onSelectTab={setActiveTab} />;
      case 'transactions':
        return <TransactionsView onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'income-salary':
        return <IncomeSalaryView onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'budgets':
        return <BudgetsView onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'accounts':
        return <AccountsView onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'loans':
        return <LoansView onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'investments':
        return <InvestmentsView onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'freelance':
        return <FreelanceView onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'goals':
        return <SavingsGoalsView onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'security-users':
        return <SecurityUsersView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'trash':
        return <TrashView />;
      default:
        return <DailyExpenseView onOpenQuickAdd={handleOpenQuickAdd} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Fixed Header */}
      <Navbar
        onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
        onOpenCurrencyConverter={() => setCurrencyConverterOpen(true)}
        onSelectTab={setActiveTab}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-24 lg:pb-8">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-3 sm:p-5 lg:p-7 min-w-0 overflow-y-auto">
          {/* Subtle Top Info Strip */}
          <div className="mb-4 pb-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium text-[11px] sm:text-xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{formattedDateEn}</span>
                <span className="text-slate-400 hidden sm:inline">|</span>
                <span className="text-slate-600 font-medium hidden sm:inline">{formattedDate}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenQuickAdd('expense')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold border border-emerald-200 flex items-center gap-1 transition active:scale-95"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" /> নতুন খরচ
              </button>
              <button
                onClick={() => handleOpenQuickAdd('income')}
                className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-[11px] font-semibold border border-sky-200 flex items-center gap-1 transition active:scale-95 hidden sm:inline-flex"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" /> আয় যোগ
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed for mobile ergonomics) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 py-2 flex items-center justify-around shadow-lg pb-[env(safe-area-inset-bottom,0.5rem)]">
        <button
          onClick={() => setActiveTab('daily-expense')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-150 ${
            activeTab === 'daily-expense'
              ? 'text-amber-700 font-semibold bg-amber-50'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Flame className={`w-4 h-4 ${activeTab === 'daily-expense' ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
          <span className="text-[10px] leading-none">দৈনিক খরচ</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-150 ${
            activeTab === 'dashboard'
              ? 'text-emerald-700 font-semibold bg-emerald-50'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-[10px] leading-none">ড্যাশবোর্ড</span>
        </button>

        {/* Center Prominent Add Button */}
        <button
          onClick={() => handleOpenQuickAdd('expense')}
          className="w-11 h-11 -mt-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-transform"
          title="Quick Add"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setActiveTab('security-users')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-150 ${
            activeTab === 'security-users'
              ? 'text-emerald-700 font-semibold bg-emerald-50'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Shield className={`w-4 h-4 ${activeTab === 'security-users' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-[10px] leading-none">নিরাপত্তা</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-150 ${
            mobileMenuOpen
              ? 'text-emerald-700 font-semibold bg-emerald-50'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Menu className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] leading-none">মেনু</span>
        </button>
      </nav>

      {/* Global Auth Modal when triggered */}
      {authModalOpen && (
        <AuthPortal isModal={true} onClose={() => setAuthModalOpen(false)} />
      )}

      {/* Global Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddModal.isOpen}
        onClose={() => setQuickAddModal(prev => ({ ...prev, isOpen: false }))}
        defaultTab={quickAddModal.defaultTab}
      />

      {/* Global Currency Exchange Converter Modal */}
      <CurrencyConverterModal
        isOpen={currencyConverterOpen}
        onClose={() => setCurrencyConverterOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}

export default App;
