import React, { useState } from 'react';
import {
  Landmark,
  CreditCard,
  Smartphone,
  Wallet,
  ArrowRightLeft,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Clock,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Account, AccountType, CurrencyCode } from '../types';

export const AccountsView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
}> = ({ onOpenQuickAdd }) => {
  const {
    accounts,
    addAccount,
    updateAccount,
    transfers,
    formatCurrency,
    profile,
    totalAccountBalance,
  } = useFinance();

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [institutionName, setInstitutionName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(profile.baseCurrency);
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [billingCycleDay, setBillingCycleDay] = useState('15');
  const [dueDay, setDueDay] = useState('5');
  const [color, setColor] = useState('#0284c7');

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInstitutionName(acc.institutionName || '');
    setAccountNumber(acc.accountNumber || '');
    setCurrency(acc.currency);
    setBalance(acc.currentBalance.toString());
    setCreditLimit(acc.creditLimit?.toString() || '');
    setBillingCycleDay(acc.billingCycleDay?.toString() || '15');
    setDueDay(acc.paymentDueDay?.toString() || '5');
    setColor(acc.color || '#0284c7');
    setShowAccountModal(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseFloat(balance) || 0;
    const numLimit = creditLimit ? parseFloat(creditLimit) : undefined;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name,
        type,
        institutionName,
        accountNumber,
        currency,
        currentBalance: numBalance,
        creditLimit: numLimit,
        billingCycleDay: billingCycleDay ? parseInt(billingCycleDay) : undefined,
        paymentDueDay: dueDay ? parseInt(dueDay) : undefined,
        color,
      });
    } else {
      addAccount({
        name,
        type,
        institutionName,
        accountNumber,
        currency,
        currentBalance: numBalance,
        creditLimit: numLimit,
        billingCycleDay: billingCycleDay ? parseInt(billingCycleDay) : undefined,
        paymentDueDay: dueDay ? parseInt(dueDay) : undefined,
        color,
      });
    }

    setShowAccountModal(false);
    setEditingAccount(null);
  };

  const getAccountIcon = (t: AccountType) => {
    switch (t) {
      case 'bank': return Landmark;
      case 'card':
      case 'credit': return CreditCard;
      case 'mfs': return Smartphone;
      default: return Wallet;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600" /> Accounts & Multi-Wallet Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Banks, MFS (bKash/Nagad), Cash wallets, and Credit Card limits with instant reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickAdd('transfer')}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-500" /> Transfer Funds
          </button>
          <button
            onClick={() => {
              setEditingAccount(null);
              setName('');
              setInstitutionName('');
              setAccountNumber('');
              setBalance('');
              setCreditLimit('');
              setShowAccountModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
          >
            <Plus className="w-3.5 h-3.5" /> Add Account
          </button>
        </div>
      </div>

      {/* Liquid Net Worth Total Card */}
      <div className="p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" /> Total Liquid Working Capital
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-1">
            {formatCurrency(totalAccountBalance)}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Spread across {accounts.length} active liquid accounts and cards</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onOpenQuickAdd('transfer')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" /> Make Transfer
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => {
          const Icon = getAccountIcon(acc.type);
          const isCard = acc.type === 'Credit Card';
          const cardLimit = acc.creditLimit || 0;
          const availableLimit = Math.max(0, cardLimit - Math.abs(acc.currentBalance));
          const limitUsedPct = cardLimit > 0 ? (Math.abs(acc.currentBalance) / cardLimit) * 100 : 0;

          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: acc.color || '#0284c7' }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{acc.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {acc.institutionName || acc.type} {acc.accountNumber ? `• ${acc.accountNumber}` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    title="Edit account details / Reconcile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Balance View */}
                <div className="my-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isCard ? 'Outstanding Balance' : 'Current Liquid Balance'}
                  </span>
                  <div className={`text-2xl font-black ${isCard ? 'text-rose-600' : 'text-slate-900 '}`}>
                    {formatCurrency(acc.currentBalance, acc.currency)}
                  </div>
                </div>

                {/* Credit Card Specific Progress */}
                {isCard && cardLimit > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Available Credit:</span>
                      <strong className="text-emerald-600">{formatCurrency(availableLimit, acc.currency)}</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${limitUsedPct > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, limitUsedPct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Cycle Day: {acc.billingCycleDay || 15}th</span>
                      <span>Payment Due: {acc.paymentDueDay || 5}th</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-400">Currency: {acc.currency}</span>
                <button
                  onClick={() => onOpenQuickAdd('expense')}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Pay from here
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer History Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-sky-500" /> Internal Account Transfer Log
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {transfers.length === 0 ? (
            <p className="py-6 text-center text-slate-400">No account transfers logged yet.</p>
          ) : (
            transfers.map(t => {
              const from = accounts.find(a => a.id === t.fromAccountId);
              const to = accounts.find(a => a.id === t.toAccountId);
              return (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {from?.name || 'Account'} → {to?.name || 'Account'}
                      </p>
                      <p className="text-[11px] text-slate-400">{t.date} • {t.notes || 'Fund Transfer'}</p>
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-sky-600 text-sm">
                    {formatCurrency(t.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Account Add/Edit Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form onSubmit={handleSaveAccount} className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingAccount ? 'Edit Account / Reconcile Balance' : 'Add New Liquid Account'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Bank Salary A/C"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Type *</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as AccountType)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  <option value="bank">Bank Account</option>
                  <option value="mfs">Mobile Banking (bKash/Nagad/Rocket)</option>
                  <option value="cash">Physical Cash Wallet</option>
                  <option value="card">Credit Card / Debit Card</option>
                  <option value="credit">Credit Line</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank / Institution Name</label>
                <input
                  type="text"
                  placeholder="e.g. BRAC Bank Ltd."
                  value={institutionName}
                  onChange={e => setInstitutionName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account / Card Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1501... or 017..."
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Balance *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  className="w-full text-sm font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
                >
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {(type === 'card' || type === 'credit') && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Limit Amount</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={creditLimit}
                    onChange={e => setCreditLimit(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600">Statement Cutoff Day (1-31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={billingCycleDay}
                      onChange={e => setBillingCycleDay(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Payment Due Day (1-31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dueDay}
                      onChange={e => setDueDay(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Card / Badge Color</label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full h-9 rounded-lg cursor-pointer border border-slate-300 bg-white p-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
