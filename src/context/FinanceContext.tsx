import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  Category,
  Account,
  Income,
  Expense,
  Transfer,
  SalaryLog,
  Budget,
  Loan,
  Investment,
  Client,
  Invoice,
  SavingsGoal,
  ExchangeRates,
  AppNotification,
  AuditLog,
  CurrencyCode,
} from '../types';
import {
  DEFAULT_EXCHANGE_RATES,
  INITIAL_PROFILE,
  INITIAL_SALARY_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_ACCOUNTS,
  INITIAL_CLIENTS,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_TRANSFERS,
  INITIAL_BUDGETS,
  INITIAL_LOANS,
  INITIAL_INVESTMENTS,
  INITIAL_INVOICES,
  INITIAL_GOALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

interface FinanceContextType {
  // Profile & Auth
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isLocked: boolean;
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  
  // Currency & Rates
  exchangeRates: ExchangeRates;
  updateExchangeRate: (currency: string, rate: number) => void;
  convertCurrency: (amount: number, from: CurrencyCode, to?: CurrencyCode) => number;
  formatCurrency: (amount: number, currency?: CurrencyCode, options?: { compact?: boolean }) => string;

  // Incomes
  incomes: Income[];
  addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt' | 'convertedAmount'>) => Income;
  updateIncome: (id: string, updates: Partial<Income>) => void;
  deleteIncome: (id: string, permanent?: boolean) => void;
  duplicateIncome: (id: string) => void;

  // Salary
  salaryLogs: SalaryLog[];
  addSalaryLog: (log: Omit<SalaryLog, 'id'>) => void;
  updateSalaryLog: (id: string, updates: Partial<SalaryLog>) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'convertedAmount'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string, permanent?: boolean) => void;
  duplicateExpense: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubCategory: (categoryId: string, name: string) => void;

  // Accounts & Transfers
  accounts: Account[];
  addAccount: (acc: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transfers: Transfer[];
  addTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt'>) => void;
  deleteTransfer: (id: string, permanent?: boolean) => void;

  // Budgets
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Loans (ধার-দেনা)
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'repayments' | 'amountRepaid'>) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string, permanent?: boolean) => void;
  addLoanRepayment: (loanId: string, amount: number, accountId: string, notes?: string) => void;

  // Investments
  investments: Investment[];
  addInvestment: (inv: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;

  // Clients & Invoices
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  // Savings Goals
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount' | 'history' | 'isCompleted'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, type: 'deposit' | 'withdraw', accountId?: string, notes?: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAuditAction: (action: AuditLog['action'], entityType: AuditLog['entityType'], entityId: string, summary: string, details?: string) => void;

  // Trash Bin
  trashItems: {
    incomes: Income[];
    expenses: Expense[];
    transfers: Transfer[];
    loans: Loan[];
  };
  restoreTrashItem: (type: 'income' | 'expense' | 'transfer' | 'loan', id: string) => void;
  emptyTrash: () => void;

  // Net Worth & Aggregates
  netWorth: number;
  totalAccountBalance: number;
  totalInvestmentValue: number;
  totalLoansReceivable: number;
  totalLoansPayable: number;

  // Backup, Restore & CSV import
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => { success: boolean; message: string };
  resetToSampleData: () => void;
  batchImportTransactions: (transactions: {
    type: 'income' | 'expense';
    date: string;
    amount: number;
    currency: CurrencyCode;
    categoryOrSource: string;
    notes?: string;
    accountId: string;
    paymentMethodOrPlatform?: string;
  }[]) => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'pfm_profile_v1',
  RATES: 'pfm_exchange_rates_v1',
  SALARY: 'pfm_salary_logs_v1',
  CATEGORIES: 'pfm_categories_v1',
  ACCOUNTS: 'pfm_accounts_v1',
  CLIENTS: 'pfm_clients_v1',
  INCOMES: 'pfm_incomes_v1',
  EXPENSES: 'pfm_expenses_v1',
  TRANSFERS: 'pfm_transfers_v1',
  BUDGETS: 'pfm_budgets_v1',
  LOANS: 'pfm_loans_v1',
  INVESTMENTS: 'pfm_investments_v1',
  INVOICES: 'pfm_invoices_v1',
  GOALS: 'pfm_goals_v1',
  NOTIFICATIONS: 'pfm_notifications_v1',
  AUDIT: 'pfm_audit_v1',
  LOCKED_STATE: 'pfm_locked_v1',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => loadStorage(STORAGE_KEYS.PROFILE, INITIAL_PROFILE));
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const prof = loadStorage(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    return prof.isPinLocked;
  });
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(() => loadStorage(STORAGE_KEYS.RATES, DEFAULT_EXCHANGE_RATES));
  const [salaryLogs, setSalaryLogs] = useState<SalaryLog[]>(() => loadStorage(STORAGE_KEYS.SALARY, INITIAL_SALARY_LOGS));
  const [categories, setCategories] = useState<Category[]>(() => loadStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES));
  const [accounts, setAccounts] = useState<Account[]>(() => loadStorage(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS));
  const [clients, setClients] = useState<Client[]>(() => loadStorage(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS));
  const [incomes, setIncomes] = useState<Income[]>(() => loadStorage(STORAGE_KEYS.INCOMES, INITIAL_INCOMES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadStorage(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES));
  const [transfers, setTransfers] = useState<Transfer[]>(() => loadStorage(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS));
  const [budgets, setBudgets] = useState<Budget[]>(() => loadStorage(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS));
  const [loans, setLoans] = useState<Loan[]>(() => loadStorage(STORAGE_KEYS.LOANS, INITIAL_LOANS));
  const [investments, setInvestments] = useState<Investment[]>(() => loadStorage(STORAGE_KEYS.INVESTMENTS, INITIAL_INVESTMENTS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStorage(STORAGE_KEYS.INVOICES, INITIAL_INVOICES));
  const [goals, setGoals] = useState<SavingsGoal[]>(() => loadStorage(STORAGE_KEYS.GOALS, INITIAL_GOALS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStorage(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS));

  // Sync to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(exchangeRates)); }, [exchangeRates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SALARY, JSON.stringify(salaryLogs)); }, [salaryLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes)); }, [incomes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers)); }, [transfers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans)); }, [loans]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments)); }, [investments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs)); }, [auditLogs]);

  // Currency Converter
  const convertCurrency = (amount: number, from: CurrencyCode, to: CurrencyCode = profile.baseCurrency): number => {
    if (from === to) return amount;
    const fromRateToBDT = exchangeRates[from] || 1;
    const toRateToBDT = exchangeRates[to] || 1;
    // Amount in BDT
    const amountInBDT = amount * fromRateToBDT;
    // Converted to target currency
    return amountInBDT / toRateToBDT;
  };

  const updateExchangeRate = (currency: string, rate: number) => {
    setExchangeRates(prev => ({ ...prev, [currency]: rate }));
  };

  const formatCurrency = (amount: number, currency: CurrencyCode = profile.baseCurrency, options?: { compact?: boolean }): string => {
    const isBDT = currency === 'BDT';
    const symbol = isBDT ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;
    
    if (options?.compact && Math.abs(amount) >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(2)}M`;
    }
    if (options?.compact && Math.abs(amount) >= 100000 && isBDT) {
      return `${symbol}${(amount / 100000).toFixed(2)} Lakh`;
    }
    if (options?.compact && Math.abs(amount) >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}k`;
    }

    const formattedNum = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);

    return `${symbol}${formattedNum}`;
  };

  const logAuditAction = (action: AuditLog['action'], entityType: AuditLog['entityType'], entityId: string, summary: string, details?: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action,
      entityType,
      entityId,
      summary,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 199)]);
  };

  // Auth
  const unlockApp = (pin: string): boolean => {
    if (!profile.isPinLocked || pin === profile.pinCode) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    setIsLocked(true);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      logAuditAction('update', 'system', 'profile', 'User Profile Settings Updated');
      return updated;
    });
  };

  // Income Methods
  const addIncome = (incomeData: Omit<Income, 'id' | 'createdAt' | 'updatedAt' | 'convertedAmount'>): Income => {
    const rate = incomeData.exchangeRate || exchangeRates[incomeData.currency] || 1;
    const converted = convertCurrency(incomeData.amount, incomeData.currency, profile.baseCurrency);
    const newIncome: Income = {
      ...incomeData,
      id: `inc-${Date.now()}`,
      exchangeRate: rate,
      convertedAmount: converted,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIncomes(prev => [newIncome, ...prev]);

    // Update account balance if received
    if (newIncome.status === 'received' && newIncome.accountId) {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === newIncome.accountId) {
          const addedInAccCurrency = convertCurrency(newIncome.amount, newIncome.currency, acc.currency);
          return { ...acc, currentBalance: acc.currentBalance + addedInAccCurrency };
        }
        return acc;
      }));
    }

    logAuditAction('create', 'income', newIncome.id, `Income Added: ${formatCurrency(newIncome.amount, newIncome.currency)} (${newIncome.source})`);
    return newIncome;
  };

  const updateIncome = (id: string, updates: Partial<Income>) => {
    setIncomes(prev => prev.map(inc => {
      if (inc.id === id) {
        const rate = updates.exchangeRate ?? inc.exchangeRate;
        const cur = updates.currency ?? inc.currency;
        const amt = updates.amount ?? inc.amount;
        const converted = convertCurrency(amt, cur, profile.baseCurrency);
        const updated = { ...inc, ...updates, exchangeRate: rate, convertedAmount: converted, updatedAt: new Date().toISOString() };
        logAuditAction('update', 'income', id, `Income Updated: ${updated.source}`);
        return updated;
      }
      return inc;
    }));
  };

  const deleteIncome = (id: string, permanent: boolean = false) => {
    if (permanent) {
      setIncomes(prev => prev.filter(inc => inc.id !== id));
      logAuditAction('delete', 'income', id, 'Income permanently deleted');
    } else {
      setIncomes(prev => prev.map(inc => inc.id === id ? { ...inc, isDeleted: true, deletedAt: new Date().toISOString() } : inc));
      logAuditAction('delete', 'income', id, 'Income moved to trash');
    }
  };

  const duplicateIncome = (id: string) => {
    const target = incomes.find(i => i.id === id);
    if (!target) return;
    const { id: _, createdAt: __, updatedAt: ___, isDeleted: ____, ...rest } = target;
    addIncome({ ...rest, source: `${rest.source} (Copy)`, date: new Date().toISOString().slice(0, 10) });
  };

  // Salary Logs
  const addSalaryLog = (log: Omit<SalaryLog, 'id'>) => {
    const newLog: SalaryLog = { ...log, id: `sal-${Date.now()}` };
    setSalaryLogs(prev => [newLog, ...prev]);
    logAuditAction('create', 'income', newLog.id, `Salary Record added: ${newLog.designation} (${formatCurrency(newLog.grossAmount, newLog.currency)})`);
  };

  const updateSalaryLog = (id: string, updates: Partial<SalaryLog>) => {
    setSalaryLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  // Expense Methods
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'convertedAmount'>): Expense => {
    const rate = expenseData.exchangeRate || exchangeRates[expenseData.currency] || 1;
    const converted = convertCurrency(expenseData.amount, expenseData.currency, profile.baseCurrency);
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      exchangeRate: rate,
      convertedAmount: converted,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Deduct from account balance
    if (newExpense.accountId) {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === newExpense.accountId) {
          const deductedInAccCurrency = convertCurrency(newExpense.amount, newExpense.currency, acc.currency);
          return { ...acc, currentBalance: acc.currentBalance - deductedInAccCurrency };
        }
        return acc;
      }));
    }

    // Check budget alert
    const categoryBudget = budgets.find(b => b.categoryId === newExpense.categoryId);
    if (categoryBudget) {
      const currentMonth = newExpense.date.slice(0, 7);
      const totalMonthSpent = [...expenses.filter(e => !e.isDeleted && e.categoryId === newExpense.categoryId && e.date.startsWith(currentMonth)), newExpense]
        .reduce((sum, e) => sum + e.convertedAmount, 0);

      const percent = (totalMonthSpent / categoryBudget.monthlyLimit) * 100;
      if (percent >= categoryBudget.alertThresholdPercent) {
        const notif: AppNotification = {
          id: `notif-b-${Date.now()}`,
          title: `Budget Alert: ${categoryBudget.categoryName}`,
          message: `${categoryBudget.categoryName} has reached ${percent.toFixed(1)}% of its limit (${formatCurrency(totalMonthSpent)} / ${formatCurrency(categoryBudget.monthlyLimit)}).`,
          type: percent > 100 ? 'alert' : 'warning',
          date: new Date().toISOString().slice(0, 10),
          isRead: false,
          linkTab: 'budgets',
        };
        setNotifications(prev => [notif, ...prev]);
      }
    }

    logAuditAction('create', 'expense', newExpense.id, `Expense Added: ${formatCurrency(newExpense.amount, newExpense.currency)} (${newExpense.categoryName})`);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        const rate = updates.exchangeRate ?? exp.exchangeRate;
        const cur = updates.currency ?? exp.currency;
        const amt = updates.amount ?? exp.amount;
        const converted = convertCurrency(amt, cur, profile.baseCurrency);
        const updated = { ...exp, ...updates, exchangeRate: rate, convertedAmount: converted, updatedAt: new Date().toISOString() };
        logAuditAction('update', 'expense', id, `Expense Updated: ${updated.categoryName}`);
        return updated;
      }
      return exp;
    }));
  };

  const deleteExpense = (id: string, permanent: boolean = false) => {
    if (permanent) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      logAuditAction('delete', 'expense', id, 'Expense permanently deleted');
    } else {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: true, deletedAt: new Date().toISOString() } : e));
      logAuditAction('delete', 'expense', id, 'Expense moved to trash');
    }
  };

  const duplicateExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    if (!target) return;
    const { id: _, createdAt: __, updatedAt: ___, isDeleted: ____, ...rest } = target;
    addExpense({ ...rest, notes: `${rest.notes || ''} (Copy)`, date: new Date().toISOString().slice(0, 10) });
  };

  // Categories
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
    logAuditAction('create', 'system', newCat.id, `Category created: ${newCat.name}`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addSubCategory = (categoryId: string, name: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) {
        const newSub = { id: `sub-${Date.now()}`, name };
        return { ...c, subCategories: [...c.subCategories, newSub] };
      }
      return c;
    }));
  };

  // Accounts & Transfers
  const addAccount = (acc: Omit<Account, 'id' | 'createdAt'>) => {
    const newAcc: Account = { ...acc, id: `acc-${Date.now()}`, createdAt: new Date().toISOString() };
    setAccounts(prev => [...prev, newAcc]);
    logAuditAction('create', 'account', newAcc.id, `Account opened: ${newAcc.name}`);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addTransfer = (transferData: Omit<Transfer, 'id' | 'createdAt'>) => {
    const newTransfer: Transfer = {
      ...transferData,
      id: `tr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransfers(prev => [newTransfer, ...prev]);

    // Update balances
    setAccounts(prev => prev.map(acc => {
      if (acc.id === newTransfer.fromAccountId) {
        return { ...acc, currentBalance: acc.currentBalance - newTransfer.amount };
      }
      if (acc.id === newTransfer.toAccountId) {
        return { ...acc, currentBalance: acc.currentBalance + newTransfer.amount };
      }
      return acc;
    }));

    logAuditAction('transfer', 'transfer', newTransfer.id, `Transferred ${formatCurrency(newTransfer.amount)} between accounts`, newTransfer.notes);
  };

  const deleteTransfer = (id: string, permanent: boolean = false) => {
    if (permanent) {
      setTransfers(prev => prev.filter(t => t.id !== id));
    } else {
      setTransfers(prev => prev.map(t => t.id === id ? { ...t, isDeleted: true, deletedAt: new Date().toISOString() } : t));
    }
  };

  // Budgets
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = { ...budget, id: `bg-${Date.now()}` };
    setBudgets(prev => [...prev, newBudget]);
    logAuditAction('create', 'budget', newBudget.id, `Budget set for ${newBudget.categoryName}: ${formatCurrency(newBudget.monthlyLimit)}`);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Loans
  const addLoan = (loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'repayments' | 'amountRepaid'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      amountRepaid: 0,
      repayments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLoans(prev => [newLoan, ...prev]);

    // Adjust account balance based on lent or borrowed
    if (newLoan.accountId) {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === newLoan.accountId) {
          // If lent money -> cash goes down; if borrowed money -> cash goes up
          const delta = newLoan.type === 'lent' ? -newLoan.amount : newLoan.amount;
          return { ...acc, currentBalance: acc.currentBalance + delta };
        }
        return acc;
      }));
    }

    logAuditAction('create', 'loan', newLoan.id, `Loan Record (${newLoan.type === 'lent' ? 'Lent' : 'Borrowed'}): ${formatCurrency(newLoan.amount, newLoan.currency)} with ${newLoan.person}`);
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
  };

  const deleteLoan = (id: string, permanent: boolean = false) => {
    if (permanent) {
      setLoans(prev => prev.filter(l => l.id !== id));
    } else {
      setLoans(prev => prev.map(l => l.id === id ? { ...l, isDeleted: true, deletedAt: new Date().toISOString() } : l));
    }
  };

  const addLoanRepayment = (loanId: string, amount: number, accountId: string, notes?: string) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        const newAmountRepaid = loan.amountRepaid + amount;
        const newStatus = newAmountRepaid >= loan.amount ? 'Settled' : 'Partially Paid';
        const newRepayment = {
          id: `rep-${Date.now()}`,
          amount,
          date: new Date().toISOString().slice(0, 10),
          accountId,
          notes,
        };

        // Update account balance
        setAccounts(accs => accs.map(acc => {
          if (acc.id === accountId) {
            // If loan was lent: receiving money increases balance
            // If loan was borrowed: paying back decreases balance
            const delta = loan.type === 'lent' ? amount : -amount;
            return { ...acc, currentBalance: acc.currentBalance + delta };
          }
          return acc;
        }));

        logAuditAction('repayment', 'loan', loan.id, `Loan Repayment (${formatCurrency(amount, loan.currency)}) recorded for ${loan.person}`);

        return {
          ...loan,
          amountRepaid: newAmountRepaid,
          status: newStatus,
          repayments: [newRepayment, ...loan.repayments],
          updatedAt: new Date().toISOString(),
        };
      }
      return loan;
    }));
  };

  // Investments
  const addInvestment = (inv: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInv: Investment = {
      ...inv,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvestments(prev => [newInv, ...prev]);
    logAuditAction('create', 'investment', newInv.id, `Investment added: ${newInv.name} (${formatCurrency(newInv.principalAmount, newInv.currency)})`);
  };

  const updateInvestment = (id: string, updates: Partial<Investment>) => {
    setInvestments(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv));
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
  };

  // Clients & Invoices
  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = { ...client, id: `client-${Date.now()}`, createdAt: new Date().toISOString() };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [newInvoice, ...prev]);
    logAuditAction('create', 'invoice', newInvoice.id, `Invoice created: ${newInvoice.invoiceNumber} for ${newInvoice.clientName}`);
    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // Savings Goals
  const addGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount' | 'history' | 'isCompleted'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
      isCompleted: false,
      history: [],
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);
    logAuditAction('create', 'goal', newGoal.id, `Savings Goal created: ${newGoal.name} (${formatCurrency(newGoal.targetAmount, newGoal.currency)})`);
  };

  const updateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const contributeToGoal = (goalId: string, amount: number, type: 'deposit' | 'withdraw', accountId?: string, notes?: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const delta = type === 'deposit' ? amount : -amount;
        const newCurrent = Math.max(0, g.currentAmount + delta);
        const isCompleted = newCurrent >= g.targetAmount;
        const newHistory = {
          id: `gh-${Date.now()}`,
          amount,
          type,
          date: new Date().toISOString().slice(0, 10),
          accountId,
          notes,
        };

        if (accountId) {
          // If deposited into goal -> deduce from account; if withdrawn from goal -> return to account
          setAccounts(accs => accs.map(acc => {
            if (acc.id === accountId) {
              return { ...acc, currentBalance: acc.currentBalance - delta };
            }
            return acc;
          }));
        }

        logAuditAction('update', 'goal', g.id, `Goal ${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${formatCurrency(amount, g.currency)} for "${g.name}"`);

        return {
          ...g,
          currentAmount: newCurrent,
          isCompleted,
          history: [newHistory, ...g.history],
        };
      }
      return g;
    }));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Trash & Soft Delete
  const trashItems = useMemo(() => ({
    incomes: incomes.filter(i => i.isDeleted),
    expenses: expenses.filter(e => e.isDeleted),
    transfers: transfers.filter(t => t.isDeleted),
    loans: loans.filter(l => l.isDeleted),
  }), [incomes, expenses, transfers, loans]);

  const restoreTrashItem = (type: 'income' | 'expense' | 'transfer' | 'loan', id: string) => {
    if (type === 'income') {
      setIncomes(prev => prev.map(i => i.id === id ? { ...i, isDeleted: false, deletedAt: undefined } : i));
    } else if (type === 'expense') {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: false, deletedAt: undefined } : e));
    } else if (type === 'transfer') {
      setTransfers(prev => prev.map(t => t.id === id ? { ...t, isDeleted: false, deletedAt: undefined } : t));
    } else if (type === 'loan') {
      setLoans(prev => prev.map(l => l.id === id ? { ...l, isDeleted: false, deletedAt: undefined } : l));
    }
    logAuditAction('restore', type, id, `Restored ${type} from trash`);
  };

  const emptyTrash = () => {
    setIncomes(prev => prev.filter(i => !i.isDeleted));
    setExpenses(prev => prev.filter(e => !e.isDeleted));
    setTransfers(prev => prev.filter(t => !t.isDeleted));
    setLoans(prev => prev.filter(l => !l.isDeleted));
    logAuditAction('delete', 'system', 'trash', 'Trash permanently emptied');
  };

  // Net worth & totals
  const totalAccountBalance = useMemo(() => {
    return accounts
      .filter(a => !a.isArchived)
      .reduce((sum, a) => sum + convertCurrency(a.currentBalance, a.currency, profile.baseCurrency), 0);
  }, [accounts, exchangeRates, profile.baseCurrency]);

  const totalInvestmentValue = useMemo(() => {
    return investments.reduce((sum, inv) => sum + convertCurrency(inv.currentValue, inv.currency, profile.baseCurrency), 0);
  }, [investments, exchangeRates, profile.baseCurrency]);

  const totalLoansReceivable = useMemo(() => {
    return loans
      .filter(l => !l.isDeleted && l.type === 'lent')
      .reduce((sum, l) => sum + convertCurrency(l.amount - l.amountRepaid, l.currency, profile.baseCurrency), 0);
  }, [loans, exchangeRates, profile.baseCurrency]);

  const totalLoansPayable = useMemo(() => {
    return loans
      .filter(l => !l.isDeleted && l.type === 'borrowed')
      .reduce((sum, l) => sum + convertCurrency(l.amount - l.amountRepaid, l.currency, profile.baseCurrency), 0);
  }, [loans, exchangeRates, profile.baseCurrency]);

  const netWorth = useMemo(() => {
    return totalAccountBalance + totalInvestmentValue + totalLoansReceivable - totalLoansPayable;
  }, [totalAccountBalance, totalInvestmentValue, totalLoansReceivable, totalLoansPayable]);

  // JSON Database Export & Restore
  const exportDatabaseJson = (): string => {
    const data = {
      exportedAt: new Date().toISOString(),
      app: 'Personal Finance Manager',
      version: '1.0.0',
      profile,
      exchangeRates,
      salaryLogs,
      categories,
      accounts,
      clients,
      incomes,
      expenses,
      transfers,
      budgets,
      loans,
      investments,
      invoices,
      goals,
      notifications,
      auditLogs,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDatabaseJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.incomes && !data.expenses && !data.accounts) {
        return { success: false, message: 'Invalid backup JSON schema. Required collections missing.' };
      }
      if (data.profile) setProfile(data.profile);
      if (data.exchangeRates) setExchangeRates(data.exchangeRates);
      if (data.salaryLogs) setSalaryLogs(data.salaryLogs);
      if (data.categories) setCategories(data.categories);
      if (data.accounts) setAccounts(data.accounts);
      if (data.clients) setClients(data.clients);
      if (data.incomes) setIncomes(data.incomes);
      if (data.expenses) setExpenses(data.expenses);
      if (data.transfers) setTransfers(data.transfers);
      if (data.budgets) setBudgets(data.budgets);
      if (data.loans) setLoans(data.loans);
      if (data.investments) setInvestments(data.investments);
      if (data.invoices) setInvoices(data.invoices);
      if (data.goals) setGoals(data.goals);
      if (data.notifications) setNotifications(data.notifications);
      if (data.auditLogs) setAuditLogs(data.auditLogs);

      logAuditAction('backup_restore', 'system', 'restore', 'Full database restored from backup JSON');
      return { success: true, message: 'Database restored successfully!' };
    } catch (err: any) {
      return { success: false, message: `Failed to parse JSON: ${err?.message || 'Unknown error'}` };
    }
  };

  const resetToSampleData = () => {
    setProfile(INITIAL_PROFILE);
    setExchangeRates(DEFAULT_EXCHANGE_RATES);
    setSalaryLogs(INITIAL_SALARY_LOGS);
    setCategories(INITIAL_CATEGORIES);
    setAccounts(INITIAL_ACCOUNTS);
    setClients(INITIAL_CLIENTS);
    setIncomes(INITIAL_INCOMES);
    setExpenses(INITIAL_EXPENSES);
    setTransfers(INITIAL_TRANSFERS);
    setBudgets(INITIAL_BUDGETS);
    setLoans(INITIAL_LOANS);
    setInvestments(INITIAL_INVESTMENTS);
    setInvoices(INITIAL_INVOICES);
    setGoals(INITIAL_GOALS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAuditAction('backup_restore', 'system', 'reset', 'Reset database to realistic sample data');
  };

  const batchImportTransactions = (transactions: {
    type: 'income' | 'expense';
    date: string;
    amount: number;
    currency: CurrencyCode;
    categoryOrSource: string;
    notes?: string;
    accountId: string;
    paymentMethodOrPlatform?: string;
  }[]): number => {
    let count = 0;
    transactions.forEach(t => {
      if (t.type === 'income') {
        addIncome({
          userId: profile.email,
          type: 'other',
          source: t.categoryOrSource || 'CSV Import',
          amount: Math.abs(t.amount),
          currency: t.currency,
          exchangeRate: exchangeRates[t.currency] || 1,
          date: t.date,
          isRecurring: false,
          status: 'received',
          accountId: t.accountId,
          paymentPlatform: (t.paymentMethodOrPlatform as any) || 'Direct',
          notes: t.notes || 'Imported from CSV statement',
          tags: ['csv-import'],
        });
        count++;
      } else {
        // Find matching category or fallback to misc
        const matchedCat = categories.find(c => c.name.toLowerCase().includes((t.categoryOrSource || '').toLowerCase())) ||
          categories.find(c => c.id === 'cat-misc') || categories[0];
        
        addExpense({
          userId: profile.email,
          categoryId: matchedCat.id,
          categoryName: matchedCat.name,
          amount: Math.abs(t.amount),
          currency: t.currency,
          exchangeRate: exchangeRates[t.currency] || 1,
          date: t.date,
          accountId: t.accountId,
          paymentMethod: (t.paymentMethodOrPlatform as any) || 'Other',
          notes: `${t.categoryOrSource ? `${t.categoryOrSource} - ` : ''}${t.notes || 'Imported via CSV statement'}`,
          tags: ['csv-import'],
          isRecurring: false,
          isShared: false,
        });
        count++;
      }
    });

    logAuditAction('create', 'system', 'csv-import', `Batch imported ${count} transactions from CSV statement`);
    return count;
  };

  return (
    <FinanceContext.Provider
      value={{
        profile,
        updateProfile,
        isLocked,
        unlockApp,
        lockApp,
        exchangeRates,
        updateExchangeRate,
        convertCurrency,
        formatCurrency,
        incomes: incomes.filter(i => !i.isDeleted),
        addIncome,
        updateIncome,
        deleteIncome,
        duplicateIncome,
        salaryLogs,
        addSalaryLog,
        updateSalaryLog,
        expenses: expenses.filter(e => !e.isDeleted),
        addExpense,
        updateExpense,
        deleteExpense,
        duplicateExpense,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubCategory,
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        transfers: transfers.filter(t => !t.isDeleted),
        addTransfer,
        deleteTransfer,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        loans: loans.filter(l => !l.isDeleted),
        addLoan,
        updateLoan,
        deleteLoan,
        addLoanRepayment,
        investments,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        clients,
        addClient,
        updateClient,
        deleteClient,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotification,
        auditLogs,
        logAuditAction,
        trashItems,
        restoreTrashItem,
        emptyTrash,
        netWorth,
        totalAccountBalance,
        totalInvestmentValue,
        totalLoansReceivable,
        totalLoansPayable,
        exportDatabaseJson,
        importDatabaseJson,
        resetToSampleData,
        batchImportTransactions,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
