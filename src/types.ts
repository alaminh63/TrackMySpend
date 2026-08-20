export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'INR' | 'SAR' | 'AUD' | 'SGD';

export interface ExchangeRates {
  [currency: string]: number; // Rate to BDT (e.g. USD: 120, EUR: 130, BDT: 1)
}

export type IncomeType = 'salary' | 'freelance' | 'other';
export type PaymentPlatform = 'Payoneer' | 'Wise' | 'Bank Transfer' | 'Upwork' | 'Fiverr' | 'Direct' | 'Cash' | 'bKash' | 'Nagad' | 'Other';
export type TransactionStatus = 'received' | 'pending' | 'partially_paid';

export interface Income {
  id: string;
  userId: string;
  type: IncomeType;
  source: string; // Job employer / Freelance client / Other description
  clientName?: string;
  projectName?: string;
  amount: number;
  currency: CurrencyCode;
  convertedAmount: number; // in base currency (BDT)
  exchangeRate: number;
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
  status: TransactionStatus;
  accountId: string;
  paymentPlatform?: PaymentPlatform;
  deductions?: {
    tax?: number;
    providentFund?: number;
    other?: number;
  };
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface SalaryLog {
  id: string;
  effectiveFrom: string; // YYYY-MM-DD
  employerName: string;
  designation: string;
  grossAmount: number;
  netAmount: number;
  taxDeduction: number;
  providentFund: number;
  payDay: number; // Day of month (e.g. 1st)
  currency: CurrencyCode;
  notes?: string;
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  subCategories: SubCategory[];
  isDefault?: boolean;
}

export type PaymentMethod = 'Cash' | 'Bank' | 'bKash' | 'Nagad' | 'Credit Card' | 'Debit Card' | 'Other';

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  subCategoryId?: string;
  categoryName: string;
  subCategoryName?: string;
  amount: number;
  currency: CurrencyCode;
  convertedAmount: number; // in base currency
  exchangeRate: number;
  date: string; // YYYY-MM-DD
  accountId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  tags: string[];
  receiptUrl?: string; // base64 / blob
  receiptName?: string;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
  isShared: boolean;
  sharedWith?: string;
  myShareAmount?: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
  rollover: boolean;
  alertThresholdPercent: number; // e.g. 80
}

export type AccountType = 'cash' | 'bank' | 'mfs' | 'card' | 'credit';

export interface Account {
  id: string;
  name: string;
  type: AccountType; // mfs = bKash/Nagad/Rocket
  institutionName?: string;
  accountNumber?: string;
  accountNumberMasked?: string;
  currency: CurrencyCode;
  initialBalance: number;
  currentBalance: number;
  creditLimit?: number;
  billingCycleDay?: number;
  paymentDueDay?: number;
  isArchived: boolean;
  color: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export type LoanType = 'lent' | 'borrowed';
export type LoanStatus = 'Pending' | 'Partially Paid' | 'Settled';

export interface LoanRepayment {
  id: string;
  amount: number;
  date: string;
  accountId: string;
  notes?: string;
}

export interface Loan {
  id: string;
  type: LoanType; // lent (receivable) vs borrowed (payable)
  person: string;
  personContact?: string;
  amount: number;
  amountRepaid: number;
  currency: CurrencyCode;
  date: string;
  dueDate?: string;
  status: LoanStatus;
  accountId: string;
  notes?: string;
  repayments: LoanRepayment[];
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export type InvestmentType = 'DPS' | 'FDR' | 'Stocks' | 'Mutual Funds' | 'Savings Certificate' | 'Other';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  institution: string;
  principalAmount: number;
  monthlyContribution?: number; // for DPS
  currentValue: number;
  interestRatePercent: number;
  startDate: string;
  maturityDate: string;
  currency: CurrencyCode;
  notes?: string;
  isMatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  country: string;
  defaultCurrency: CurrencyCode;
  paymentTerms?: string;
  hourlyRate?: number;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent?: number;
  taxPercent?: number;
  totalAmount: number;
  notes?: string;
  paymentInstructions?: string;
  status: InvoiceStatus;
  paidDate?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  category: 'Emergency Fund' | 'Travel' | 'Gadget' | 'Investment' | 'Vehicle' | 'Haj/Umrah' | 'Other';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  currency: CurrencyCode;
  color: string;
  icon: string;
  isCompleted: boolean;
  history: {
    id: string;
    amount: number;
    type: 'deposit' | 'withdraw';
    date: string;
    accountId?: string;
    notes?: string;
  }[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  date: string;
  isRead: boolean;
  linkTab?: string;
}

export type UserRole = 'admin' | 'manager' | 'viewer' | 'auditor';

export interface UserPermissions {
  canAddExpense: boolean;
  canEditExpense: boolean;
  canDeleteExpense: boolean;
  canManageIncomeSalary: boolean;
  canManageBudgets: boolean;
  canManageAccounts: boolean;
  canManageLoans: boolean;
  canManageInvestments: boolean;
  canManageInvoices: boolean;
  canExportReports: boolean;
  canManageUsersAndRoles: boolean;
  canManageSettings: boolean;
  canEmptyTrash: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string;
  avatarUrl?: string;
  isLocked?: boolean;
  phone?: string;
  pinCode?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface SecurityEvent {
  id: string;
  type: 'auth_login' | 'auth_logout' | 'auth_register' | 'role_change' | 'pin_reset' | 'permission_denied' | 'security_update';
  userId: string;
  userName: string;
  userRole: UserRole;
  description: string;
  ipAddress?: string;
  timestamp: string;
  status: 'success' | 'warning' | 'danger';
}

export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'transfer' | 'repayment' | 'backup_restore' | 'auth_login' | 'role_change';
  entityType: 'income' | 'expense' | 'transfer' | 'loan' | 'budget' | 'account' | 'investment' | 'goal' | 'invoice' | 'system' | 'user' | 'security';
  entityId: string;
  summary: string;
  details?: string;
  timestamp: string;
  performedBy?: {
    userId: string;
    userName: string;
    userRole: UserRole;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  baseCurrency: CurrencyCode;
  timezone: string;
  isPinLocked: boolean;
  pinCode: string; // 4 or 6 digit
  twoFactorEnabled: boolean;
  avatarUrl?: string;
  autoLockMinutes: number;
  sessionTimeoutMinutes?: number;
  phone?: string;
}
