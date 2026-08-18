import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Layers,
  Edit2,
  Trash2,
  RotateCw,
  FolderPlus,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Category, Budget } from '../types';

export const BudgetsView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
}> = ({ onOpenQuickAdd }) => {
  const {
    categories,
    budgets,
    expenses,
    addBudget,
    updateBudget,
    deleteBudget,
    addCategory,
    addSubCategory,
    deleteCategory,
    formatCurrency,
    profile,
  } = useFinance();

  const [currentMonth, setCurrentMonth] = useState<string>('2026-08');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Budget modal form state
  const [budgetCatId, setBudgetCatId] = useState(categories[0]?.id || '');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetRollover, setBudgetRollover] = useState(false);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(80);

  // Category modal form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10b981');
  const [newSubCatName, setNewSubCatName] = useState('');
  const [targetCatIdForSub, setTargetCatIdForSub] = useState('');

  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const totalBudgetLimit = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalMonthSpent = monthExpenses.reduce((s, e) => s + e.convertedAmount, 0);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(budgetLimit);
    if (isNaN(limit) || limit <= 0) {
      alert('Please enter a valid monthly budget limit');
      return;
    }

    const cat = categories.find(c => c.id === budgetCatId);
    if (!cat) return;

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        monthlyLimit: limit,
        rollover: budgetRollover,
        alertThresholdPercent: budgetAlertThreshold,
      });
    } else {
      // Check if budget exists for this category
      const existing = budgets.find(b => b.categoryId === budgetCatId);
      if (existing) {
        updateBudget(existing.id, {
          monthlyLimit: limit,
          rollover: budgetRollover,
          alertThresholdPercent: budgetAlertThreshold,
        });
      } else {
        addBudget({
          categoryId: budgetCatId,
          categoryName: cat.name,
          monthlyLimit: limit,
          rollover: budgetRollover,
          alertThresholdPercent: budgetAlertThreshold,
        });
      }
    }

    setShowBudgetModal(false);
    setEditingBudget(null);
    setBudgetLimit('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      type: 'expense',
      icon: 'Tag',
      color: newCatColor,
      subCategories: [],
    });

    setNewCatName('');
    setShowCategoryModal(false);
  };

  const handleAddSubCategory = (catId: string) => {
    if (!newSubCatName.trim()) return;
    addSubCategory(catId, newSubCatName.trim());
    setNewSubCatName('');
    setTargetCatIdForSub('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-600" /> Category Budgets & Spending Caps
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure monthly ceiling limits per category with 80% warning badges and rollover balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-500" /> New Category
          </button>
          <button
            onClick={() => {
              setEditingBudget(null);
              setBudgetLimit('');
              setShowBudgetModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
          >
            <Plus className="w-3.5 h-3.5" /> Set Budget Limit
          </button>
        </div>
      </div>

      {/* Monthly Budget Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Monthly Budget</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(totalBudgetLimit)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Sum of all planned category limits</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Spent So Far</p>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(totalMonthSpent)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {totalBudgetLimit > 0 ? `${((totalMonthSpent / totalBudgetLimit) * 100).toFixed(1)}% of total budget used` : '0%'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Remaining Budget Buffer</p>
          <p className={`text-xl font-extrabold mt-1 ${totalBudgetLimit - totalMonthSpent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(Math.max(0, totalBudgetLimit - totalMonthSpent))}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Available before over-budget</p>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map(budget => {
          const category = categories.find(c => c.id === budget.categoryId);
          const spent = monthExpenses
            .filter(e => e.categoryId === budget.categoryId)
            .reduce((s, e) => s + e.convertedAmount, 0);

          const percent = (spent / budget.monthlyLimit) * 100;
          const isOver = percent >= 100;
          const isWarning = percent >= budget.alertThresholdPercent && !isOver;

          return (
            <div
              key={budget.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                      style={{ backgroundColor: category?.color || '#10b981' }}
                    >
                      {budget.categoryName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{budget.categoryName}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        {budget.rollover && <span className="text-emerald-600 font-semibold">• Rollover enabled</span>}
                        <span>• Alert @ {budget.alertThresholdPercent}%</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBudget(budget);
                        setBudgetCatId(budget.categoryId);
                        setBudgetLimit(budget.monthlyLimit.toString());
                        setBudgetRollover(budget.rollover);
                        setBudgetAlertThreshold(budget.alertThresholdPercent);
                        setShowBudgetModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove budget for ${budget.categoryName}?`)) {
                          deleteBudget(budget.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(spent)}</strong>
                    </span>
                    <span className="font-semibold text-slate-500">
                      Limit: {formatCurrency(budget.monthlyLimit)}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    isOver
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : isWarning
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {isOver ? `Over Budget (+${formatCurrency(spent - budget.monthlyLimit)})` : `${(100 - percent).toFixed(0)}% Left (${formatCurrency(budget.monthlyLimit - spent)})`}
                </span>

                <button
                  onClick={() => onOpenQuickAdd('expense')}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  + Add Expense
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Manager with Subcategories */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" /> Categories & Sub-Categories Hierarchy
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{cat.name}</span>
                </div>
                {!cat.isDefault && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-slate-400 hover:text-rose-500 text-[10px]"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Sub-categories */}
              <div className="space-y-1 pl-4 border-l-2 border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                {cat.subCategories.length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">No sub-categories</span>
                ) : (
                  cat.subCategories.map(sub => (
                    <p key={sub.id} className="text-slate-600 dark:text-slate-400">• {sub.name}</p>
                  ))
                )}

                {targetCatIdForSub === cat.id ? (
                  <div className="flex items-center gap-1 pt-1">
                    <input
                      type="text"
                      placeholder="Subcategory name"
                      value={newSubCatName}
                      onChange={e => setNewSubCatName(e.target.value)}
                      className="text-xs px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <button
                      onClick={() => handleAddSubCategory(cat.id)}
                      className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setTargetCatIdForSub('')}
                      className="text-slate-400 text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setTargetCatIdForSub(cat.id)}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold block pt-1"
                  >
                    + Add Sub-category
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Set Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form onSubmit={handleSaveBudget} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingBudget ? 'Edit Category Budget' : 'Set Category Budget Limit'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Category</label>
              <select
                disabled={!!editingBudget}
                value={budgetCatId}
                onChange={e => setBudgetCatId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Limit Amount ({profile.baseCurrency}) *
              </label>
              <input
                type="number"
                required
                placeholder="25000"
                value={budgetLimit}
                onChange={e => setBudgetLimit(e.target.value)}
                className="w-full text-lg font-bold px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Trigger Threshold (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={budgetAlertThreshold}
                  onChange={e => setBudgetAlertThreshold(parseInt(e.target.value) || 80)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetRollover}
                    onChange={e => setBudgetRollover(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  Rollover Unused
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form onSubmit={handleAddCategory} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Custom Category</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Pet Care / Vehicle Maintenance"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Color Marker</label>
              <input
                type="color"
                value={newCatColor}
                onChange={e => setNewCatColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
