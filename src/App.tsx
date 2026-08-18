import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthLockScreen } from './components/AuthLockScreen';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { QuickAddModal } from './components/QuickAddModal';
import { CurrencyConverterModal } from './components/CurrencyConverterModal';

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

const MainLayout: React.FC = () => {
  const { profile, isAppLocked, unlockApp } = useFinance();

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

  // If locked, render PIN unlock screen
  if (profile.isPinLocked && isAppLocked) {
    return <AuthLockScreen onUnlock={unlockApp} pinCode={profile.pinCode} />;
  }

  const handleOpenQuickAdd = (tab: 'expense' | 'income' | 'transfer' | 'loan' = 'expense') => {
    setQuickAddModal({
      isOpen: true,
      defaultTab: tab,
    });
  };

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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Fixed Header */}
      <Navbar
        onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
        onOpenCurrencyConverter={() => setCurrencyConverterOpen(true)}
        onSelectTab={setActiveTab}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

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
