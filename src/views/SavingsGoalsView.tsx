import React, { useState } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoal } from '../types';

export const SavingsGoalsView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
}> = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    depositToSavingsGoal,
    withdrawFromSavingsGoal,
    deleteSavingsGoal,
    formatCurrency,
    accounts,
    profile,
  } = useFinance();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);
  const [activeWithdrawGoal, setActiveWithdrawGoal] = useState<SavingsGoal | null>(null);

  // New Goal Form
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Emergency Fund');
  const [notes, setNotes] = useState('');

  // Deposit/Withdraw form
  const [amountInput, setAmountInput] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  const goalsList = savingsGoals || [];
  const totalTarget = goalsList.reduce((s, g) => s + (g.targetAmount || 0), 0);
  const totalSaved = goalsList.reduce((s, g) => s + (g.currentAmount || 0), 0);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const curr = parseFloat(currentAmount) || 0;
    if (isNaN(target) || target <= 0) {
      alert('Please enter a valid target amount');
      return;
    }

    addSavingsGoal({
      name,
      targetAmount: target,
      currentAmount: curr,
      targetDate: deadline || undefined,
      category,
      color: '#10b981',
      notes,
    });

    setShowGoalModal(false);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setNotes('');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepositGoal) return;
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) return;

    depositToSavingsGoal(activeDepositGoal.id, num, selectedAccountId);

    if (activeDepositGoal.currentAmount + num >= activeDepositGoal.targetAmount) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setActiveDepositGoal(null);
    setAmountInput('');
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWithdrawGoal) return;
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) return;

    withdrawFromSavingsGoal(activeWithdrawGoal.id, num, selectedAccountId);
    setActiveWithdrawGoal(null);
    setAmountInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" /> Savings Goals & Emergency Reserve
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Set visual targets for emergency funds, vacations, tech upgrades, and retirement milestones
          </p>
        </div>

        <button
          onClick={() => setShowGoalModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
        >
          <Plus className="w-3.5 h-3.5" /> Create Savings Goal
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Goals Target</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalTarget)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Cumulative goal target sum</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Saved So Far</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalSaved)}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            {totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(1)}% of total targets reached` : '0%'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <p className="text-[11px] font-bold uppercase text-slate-400">Remaining Gap</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {formatCurrency(Math.max(0, totalTarget - totalSaved))}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Remaining to full milestone completion</p>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goalsList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No savings goals set yet. Click "Create Savings Goal" to start tracking your targets.
          </div>
        ) : (
          goalsList.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isCompleted = progress >= 100;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{goal.name}</h4>
                        {isCompleted && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Completed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{goal.category} {goal.targetDate ? `• Target: ${goal.targetDate}` : ''}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete savings goal ${goal.name}?`)) {
                        deleteSavingsGoal(goal.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress Bar & Amounts */}
                <div className="space-y-2 my-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Accumulated:</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-600">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-xs text-slate-400"> / {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold pt-1">
                    <span>{progress.toFixed(1)}% Achieved</span>
                    <span>Gap: {formatCurrency(remaining)}</span>
                  </div>
                </div>

                {goal.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg mb-2">
                    "{goal.notes}"
                  </p>
                )}
              </div>

              {/* Deposit / Withdraw Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActiveWithdrawGoal(goal);
                    setAmountInput('');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" /> Withdraw
                </button>

                <button
                  onClick={() => {
                    setActiveDepositGoal(goal);
                    setAmountInput('');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Deposit Funds
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Goal Creation Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form onSubmit={handleSaveGoal} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Savings Goal</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. 6-Month Emergency Buffer"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount ({profile.baseCurrency}) *</label>
                <input
                  type="number"
                  required
                  placeholder="500000"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Saved ({profile.baseCurrency})</label>
                <input
                  type="number"
                  placeholder="0"
                  value={currentAmount}
                  onChange={e => setCurrentAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  <option value="Emergency Fund">Emergency Fund</option>
                  <option value="Travel">Travel & Vacation</option>
                  <option value="Tech Upgrade">Tech / Hardware Upgrade</option>
                  <option value="Real Estate">Land / Property Downpayment</option>
                  <option value="Education">Higher Education</option>
                  <option value="Retirement">Retirement Wealth</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Motivation / Notes</label>
              <input
                type="text"
                placeholder="e.g. Keep untouched for emergency security"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deposit Modal */}
      {activeDepositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form onSubmit={handleDepositSubmit} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              Deposit to: {activeDepositGoal.name}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deposit Amount ({profile.baseCurrency}) *</label>
              <input
                type="number"
                step="any"
                required
                placeholder="25000"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                className="w-full text-lg font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Debit From Account</label>
              <select
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveDepositGoal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Confirm Deposit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Withdraw Modal */}
      {activeWithdrawGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form onSubmit={handleWithdrawSubmit} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
              Withdraw from: {activeWithdrawGoal.name}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Withdraw Amount ({profile.baseCurrency}) *</label>
              <input
                type="number"
                step="any"
                required
                placeholder="10000"
                value={amountInput}
                onChange={e => setAmountInput(e.target.value)}
                className="w-full text-lg font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Into Account</label>
              <select
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveWithdrawGoal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Confirm Withdrawal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
