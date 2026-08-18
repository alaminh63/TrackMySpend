import React, { useState } from 'react';
import {
  X,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  Handshake,
  Upload,
  Calendar,
  Layers,
  CreditCard,
  User,
  Check,
  Tag,
  FileText,
  DollarSign,
  Users,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CurrencyCode, IncomeType, PaymentMethod, PaymentPlatform, LoanType } from '../types';

export const QuickAddModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'expense' | 'income' | 'transfer' | 'loan';
}> = ({ isOpen, onClose, defaultTab = 'expense' }) => {
  const {
    profile,
    categories,
    accounts,
    clients,
    exchangeRates,
    addExpense,
    addIncome,
    addTransfer,
    addLoan,
    formatCurrency,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'transfer' | 'loan'>(defaultTab);

  // Common fields
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>(profile.baseCurrency);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');

  // Expense fields
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [subCategoryId, setSubCategoryId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [receiptName, setReceiptName] = useState<string>('');
  const [isRecurringExpense, setIsRecurringExpense] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [isShared, setIsShared] = useState<boolean>(false);
  const [sharedWith, setSharedWith] = useState<string>('');
  const [myShareAmount, setMyShareAmount] = useState<string>('');

  // Income fields
  const [incomeType, setIncomeType] = useState<IncomeType>('salary');
  const [source, setSource] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [paymentPlatform, setPaymentPlatform] = useState<PaymentPlatform>('Bank Transfer');
  const [incomeStatus, setIncomeStatus] = useState<'received' | 'pending'>('received');
  const [taxDeduction, setTaxDeduction] = useState<string>('');
  const [pfDeduction, setPfDeduction] = useState<string>('');

  // Transfer fields
  const [fromAccountId, setFromAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || '');

  // Loan fields
  const [loanType, setLoanType] = useState<LoanType>('lent');
  const [loanPerson, setLoanPerson] = useState<string>('');
  const [loanContact, setLoanContact] = useState<string>('');
  const [loanDueDate, setLoanDueDate] = useState<string>('');

  if (!isOpen) return null;

  const currencies: CurrencyCode[] = ['BDT', 'USD', 'EUR', 'GBP', 'AED', 'CAD', 'INR', 'SAR', 'AUD', 'SGD'];
  const selectedCat = categories.find(c => c.id === categoryId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    if (activeTab === 'expense') {
      const cat = categories.find(c => c.id === categoryId);
      const sub = cat?.subCategories.find(s => s.id === subCategoryId);
      addExpense({
        userId: profile.email,
        categoryId,
        categoryName: cat?.name || 'General Expense',
        subCategoryId: subCategoryId || undefined,
        subCategoryName: sub?.name || undefined,
        amount: numAmount,
        currency,
        exchangeRate: exchangeRates[currency] || 1,
        date,
        accountId: accountId || accounts[0]?.id,
        paymentMethod,
        notes,
        tags,
        receiptUrl: receiptUrl || undefined,
        receiptName: receiptName || undefined,
        isRecurring: isRecurringExpense,
        recurringFrequency: isRecurringExpense ? recurringFrequency : undefined,
        isShared,
        sharedWith: isShared ? sharedWith : undefined,
        myShareAmount: isShared && myShareAmount ? parseFloat(myShareAmount) : undefined,
      });
    } else if (activeTab === 'income') {
      addIncome({
        userId: profile.email,
        type: incomeType,
        source: source || (incomeType === 'salary' ? 'Job Salary' : clientName ? `${clientName} Freelance` : 'Other Income'),
        clientName: incomeType === 'freelance' ? clientName : undefined,
        projectName: incomeType === 'freelance' ? projectName : undefined,
        amount: numAmount,
        currency,
        exchangeRate: exchangeRates[currency] || 1,
        date,
        isRecurring: incomeType === 'salary',
        recurringFrequency: incomeType === 'salary' ? 'monthly' : undefined,
        status: incomeStatus,
        accountId: accountId || accounts[0]?.id,
        paymentPlatform,
        deductions: {
          tax: taxDeduction ? parseFloat(taxDeduction) : undefined,
          providentFund: pfDeduction ? parseFloat(pfDeduction) : undefined,
        },
        notes,
        tags,
      });
    } else if (activeTab === 'transfer') {
      if (fromAccountId === toAccountId) {
        alert('Source and destination accounts must be different');
        return;
      }
      addTransfer({
        fromAccountId,
        toAccountId,
        amount: numAmount,
        date,
        notes,
      });
    } else if (activeTab === 'loan') {
      if (!loanPerson.trim()) {
        alert('Please specify the person name');
        return;
      }
      addLoan({
        type: loanType,
        person: loanPerson.trim(),
        personContact: loanContact.trim() || undefined,
        amount: numAmount,
        currency,
        date,
        dueDate: loanDueDate || undefined,
        status: 'Pending',
        accountId: accountId || accounts[0]?.id,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        {/* Header with 4 Tab Selector */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Entry</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'expense'
                ? 'bg-rose-500 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" /> Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Income
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transfer')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'transfer'
                ? 'bg-sky-600 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('loan')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'loan'
                ? 'bg-amber-600 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700'
            }`}
          >
            <Handshake className="w-3.5 h-3.5" /> Loan / ধার
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full text-xl font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>
              {/* Quick Amount Chips */}
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                {[10, 20, 30, 50, 100, 200, 500].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white transition"
                  >
                    ৳{val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as CurrencyCode)}
                className="w-full text-sm font-bold px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {currency !== profile.baseCurrency && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 -mt-2">
              Auto converts to ≈ {formatCurrency((parseFloat(amount) || 0) * (exchangeRates[currency] || 1), profile.baseCurrency)} ({exchangeRates[currency]} {profile.baseCurrency}/{currency})
            </p>
          )}

          {/* EXPENSE SPECIFIC FIELDS */}
          {activeTab === 'expense' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => {
                      setCategoryId(e.target.value);
                      setSubCategoryId('');
                    }}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sub-Category
                  </label>
                  <select
                    value={subCategoryId}
                    onChange={e => setSubCategoryId(e.target.value)}
                    disabled={!selectedCat?.subCategories?.length}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">None / General</option>
                    {selectedCat?.subCategories?.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid From Account
                  </label>
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Shared Expense / Split Toggle */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isShared}
                      onChange={e => setIsShared(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Split / Shared Expense (Family / Friends)
                  </label>
                </div>

                {isShared && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      placeholder="Shared with (e.g. Fahim, Tanvir)"
                      value={sharedWith}
                      onChange={e => setSharedWith(e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="My portion amount"
                      value={myShareAmount}
                      onChange={e => setMyShareAmount(e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Receipt Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Receipt Image (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-lg p-2.5 flex items-center justify-center gap-2 text-xs text-slate-500 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <span>{receiptName ? receiptName : 'Upload receipt file'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {receiptUrl && (
                    <button
                      type="button"
                      onClick={() => { setReceiptUrl(''); setReceiptName(''); }}
                      className="p-2 text-xs text-rose-500 hover:bg-rose-50 rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* INCOME SPECIFIC FIELDS */}
          {activeTab === 'income' && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {(['salary', 'freelance', 'other'] as IncomeType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setIncomeType(t)}
                    className={`py-2 text-xs font-bold capitalize rounded-lg border transition ${
                      incomeType === t
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {incomeType === 'freelance' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Client</label>
                    <input
                      type="text"
                      list="clients-list"
                      placeholder="e.g. Nexus Cloud Labs"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <datalist id="clients-list">
                      {clients.map(c => <option key={c.id} value={c.name} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. React Migration"
                      value={projectName}
                      onChange={e => setProjectName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder={incomeType === 'salary' ? 'e.g. Apex Digital Monthly Salary' : 'e.g. Freelance Sprint Payment / Bonus'}
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deposit To</label>
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform</label>
                  <select
                    value={paymentPlatform}
                    onChange={e => setPaymentPlatform(e.target.value as PaymentPlatform)}
                    className="w-full text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Wise">Wise</option>
                    <option value="Payoneer">Payoneer</option>
                    <option value="Upwork">Upwork</option>
                    <option value="Fiverr">Fiverr</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Cash</option>
                    <option value="Direct">Direct</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={incomeStatus}
                    onChange={e => setIncomeStatus(e.target.value as any)}
                    className="w-full text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="received">Received</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {incomeType === 'salary' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Tax Deduction (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 12000"
                      value={taxDeduction}
                      onChange={e => setTaxDeduction(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Provident Fund (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 8000"
                      value={pfDeduction}
                      onChange={e => setPfDeduction(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* TRANSFER SPECIFIC FIELDS */}
          {activeTab === 'transfer' && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">From Account (Source)</label>
                <select
                  value={fromAccountId}
                  onChange={e => setFromAccountId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">To Account (Destination)</label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* LOAN SPECIFIC FIELDS */}
          {activeTab === 'loan' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLoanType('lent')}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    loanType === 'lent'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Money Lent (I gave / Receivable)
                </button>
                <button
                  type="button"
                  onClick={() => setLoanType('borrowed')}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    loanType === 'borrowed'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Money Borrowed (I took / Payable)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariqul Islam"
                    value={loanPerson}
                    onChange={e => setLoanPerson(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="+88017..."
                    value={loanContact}
                    onChange={e => setLoanContact(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Linked Account</label>
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={loanDueDate}
                    onChange={e => setLoanDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* Date, Notes & Tags (Common to all) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. food, client, urgent"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Description
            </label>
            <textarea
              rows={2}
              placeholder="Add optional notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm shadow-emerald-500/30"
            >
              <Check className="w-3.5 h-3.5" /> Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
