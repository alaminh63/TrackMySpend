import React, { useState } from 'react';
import {
  Handshake,
  TrendingUp,
  TrendingDown,
  Plus,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Calendar,
  DollarSign,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Loan, LoanType } from '../types';

export const LoansView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
}> = ({ onOpenQuickAdd }) => {
  const {
    loans,
    totalLoansReceivable,
    totalLoansPayable,
    addLoanRepayment,
    deleteLoan,
    formatCurrency,
    accounts,
  } = useFinance();

  const [activeFilter, setActiveFilter] = useState<'all' | 'lent' | 'borrowed' | 'settled'>('all');
  const [repayingLoan, setRepayingLoan] = useState<Loan | null>(null);

  // Repayment form state
  const [repayAmount, setRepayAmount] = useState('');
  const [repayDate, setRepayDate] = useState(new Date().toISOString().slice(0, 10));
  const [repayAccountId, setRepayAccountId] = useState(accounts[0]?.id || '');
  const [repayNotes, setRepayNotes] = useState('');

  const filteredLoans = loans.filter(l => {
    if (activeFilter === 'lent') return l.type === 'lent' && l.status !== 'Paid';
    if (activeFilter === 'borrowed') return l.type === 'borrowed' && l.status !== 'Paid';
    if (activeFilter === 'settled') return l.status === 'Paid';
    return true;
  });

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayingLoan) return;

    const amt = parseFloat(repayAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid repayment amount');
      return;
    }

    addLoanRepayment(repayingLoan.id, {
      amount: amt,
      date: repayDate,
      accountId: repayAccountId,
      notes: repayNotes,
    });

    setRepayingLoan(null);
    setRepayAmount('');
    setRepayNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Handshake className="w-5 h-5 text-amber-500" /> Loans & Debt Ledger (ধার-দেনা)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track money lent to friends/family and money borrowed with partial repayment schedules
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('loan')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
        >
          <Plus className="w-3.5 h-3.5" /> Record Loan / ধার
        </button>
      </div>

      {/* Summary Cards: Lent vs Borrowed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Money Lent (Receivable) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Money Lent (I gave / Receivable)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalLoansReceivable)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Pending to be collected from borrowers</p>
        </div>

        {/* Money Borrowed (Payable) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Borrowed (I took / Payable)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalLoansPayable)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Outstanding debt to be repaid</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
        >
          All Records ({loans.length})
        </button>
        <button
          onClick={() => setActiveFilter('lent')}
          className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'lent' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Money Lent (Receivable)
        </button>
        <button
          onClick={() => setActiveFilter('borrowed')}
          className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'borrowed' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Money Borrowed (Payable)
        </button>
        <button
          onClick={() => setActiveFilter('settled')}
          className={`px-3 py-1.5 rounded-lg transition ${activeFilter === 'settled' ? 'bg-slate-700 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Fully Settled
        </button>
      </div>

      {/* Loans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLoans.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No loan records found for this category.
          </div>
        ) : (
          filteredLoans.map(loan => {
            const isLent = loan.type === 'lent';
            const totalRepaid = loan.repayments.reduce((s, r) => s + r.amount, 0);
            const remaining = Math.max(0, loan.amount - totalRepaid);
            const progress = (totalRepaid / loan.amount) * 100;
            const isPaid = loan.status === 'Paid' || remaining === 0;

            return (
              <div
                key={loan.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                          isLent ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      >
                        {loan.person.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{loan.person}</h4>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isLent ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950' : 'bg-rose-100 text-rose-700 dark:bg-rose-950'
                            }`}
                          >
                            {isLent ? 'Lent / Receivable' : 'Borrowed / Payable'}
                          </span>
                        </div>
                        {loan.personContact && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {loan.personContact}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950'
                          : loan.status === 'Partially Paid'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      {isPaid ? 'Settled' : loan.status}
                    </span>
                  </div>

                  {/* Amounts & Progress */}
                  <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-slate-500 font-medium">Principal Loan:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(loan.amount, loan.currency)}</span>
                    </div>

                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs text-slate-500 font-medium">Outstanding Balance:</span>
                      <span className={`text-base font-extrabold ${isLent ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(remaining, loan.currency)}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>

                  {/* Date & Repayment Logs */}
                  <div className="text-xs text-slate-400 space-y-1 mb-2">
                    <div className="flex justify-between">
                      <span>Given: {loan.date}</span>
                      {loan.dueDate && <span className="text-amber-500 font-medium">Due: {loan.dueDate}</span>}
                    </div>

                    {loan.repayments.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Repayment History ({loan.repayments.length}):</p>
                        <div className="space-y-1">
                          {loan.repayments.map(r => (
                            <div key={r.id} className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                              <span>{r.date} {r.notes ? `(${r.notes})` : ''}</span>
                              <span className="font-bold text-emerald-600">+{formatCurrency(r.amount, loan.currency)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (confirm(`Delete loan record with ${loan.person}?`)) {
                        deleteLoan(loan.id);
                      }
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-500"
                  >
                    Delete
                  </button>

                  {!isPaid && (
                    <button
                      onClick={() => {
                        setRepayingLoan(loan);
                        setRepayAmount(remaining.toString());
                        setRepayAccountId(accounts[0]?.id || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Record Repayment
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Repayment Modal */}
      {repayingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form onSubmit={handleRepaySubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-500" />
              Record Loan Repayment ({repayingLoan.person})
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Repayment Amount ({repayingLoan.currency}) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={repayAmount}
                onChange={e => setRepayAmount(e.target.value)}
                className="w-full text-lg font-bold px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deposit / Pay From</label>
                <select
                  value={repayAccountId}
                  onChange={e => setRepayAccountId(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={repayDate}
                  onChange={e => setRepayDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. bKash partial return"
                value={repayNotes}
                onChange={e => setRepayNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRepayingLoan(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Confirm Repayment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
