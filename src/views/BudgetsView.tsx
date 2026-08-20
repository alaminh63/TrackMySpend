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
  Sparkles,
  RefreshCw,
  X,
  Tag,
  Utensils,
  ShoppingBag,
  Home,
  Zap,
  HeartPulse,
  Car,
  Shield,
  Laptop,
  Coffee,
  BookOpen,
  Gift,
  Dumbbell,
  Plane,
  Film,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Category, Budget } from '../types';

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#0ea5e9', // Sky
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#64748b', // Slate
  '#3b82f6', // Blue
];

const PRESET_ICONS = [
  { name: 'Utensils', label: 'খাবার', Icon: Utensils },
  { name: 'ShoppingBag', label: 'বাজার', Icon: ShoppingBag },
  { name: 'Home', label: 'বাসা', Icon: Home },
  { name: 'Zap', label: 'বিল', Icon: Zap },
  { name: 'HeartPulse', label: 'স্বাস্থ্য', Icon: HeartPulse },
  { name: 'Car', label: 'যাতায়াত', Icon: Car },
  { name: 'Laptop', label: 'প্রযুক্তি', Icon: Laptop },
  { name: 'Coffee', label: 'স্ন্যাকস', Icon: Coffee },
  { name: 'BookOpen', label: 'শিক্ষা', Icon: BookOpen },
  { name: 'Gift', label: 'উপহার', Icon: Gift },
  { name: 'Dumbbell', label: 'ফিটনেস', Icon: Dumbbell },
  { name: 'Plane', label: 'ভ্রমণ', Icon: Plane },
  { name: 'Film', label: 'বিনোদন', Icon: Film },
  { name: 'Shield', label: 'জরুরি', Icon: Shield },
  { name: 'Tag', label: 'সাধারণ', Icon: Tag },
];

const QUICK_SUGGESTIONS = [
  { name: 'বাজার ও নিত্য মুদি', color: '#10b981', icon: 'ShoppingBag', budget: 20000, subs: ['কাঁচা বাজার', 'চাল ও তেল', 'মাছ ও মাংস'] },
  { name: 'বাসা ভাড়া ও সার্ভিস', color: '#6366f1', icon: 'Home', budget: 25000, subs: ['ফ্ল্যাট ভাড়া', 'সার্ভিস চার্জ'] },
  { name: 'বিদ্যুৎ, গ্যাস ও ওয়াইফাই', color: '#f59e0b', icon: 'Zap', budget: 6000, subs: ['বিদ্যুৎ বিল', 'ওয়াইফাই', 'মোবাইল রিচার্জ'] },
  { name: 'চিকিৎসা ও নিয়মিত ঔষধ', color: '#ef4444', icon: 'HeartPulse', budget: 5000, subs: ['মাসিক ঔষধ', 'ডাক্তার ফি'] },
  { name: 'যাতায়াত ও ফুয়েল', color: '#0ea5e9', icon: 'Car', budget: 4500, subs: ['বাস / মেট্রো', 'উবার / সিএনজি'] },
  { name: 'রেস্টুরেন্ট ও খাবার অর্ডার', color: '#f97316', icon: 'Utensils', budget: 5000, subs: ['ডাইনিং', 'ফুডপ্যান্ডা'] },
  { name: 'চা-নাস্তা ও বন্ধুদের আড্ডা', color: '#8b5cf6', icon: 'Coffee', budget: 3000, subs: ['টং চা', 'স্ন্যাকস'] },
  { name: 'শপিং ও পার্সোনাল কেয়ার', color: '#ec4899', icon: 'Gift', budget: 4000, subs: ['পোশাক', 'প্রসাধন'] },
  { name: 'জরুরি ফ্যামিলি ব্যাকআপ ফান্ড', color: '#14b8a6', icon: 'Shield', budget: 10000, subs: ['ইমার্জেন্সি'] },
];

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
    updateCategory,
    deleteCategory,
    addSubCategory,
    deleteSubCategory,
    clearAllCategoriesAndBudgets,
    resetCategoriesToDefault,
    loadCategoryPreset,
    formatCurrency,
    profile,
  } = useFinance();

  const [currentMonth, setCurrentMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Budget modal form state
  const [budgetCatId, setBudgetCatId] = useState(categories[0]?.id || '');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetRollover, setBudgetRollover] = useState(false);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(80);

  // Category modal form state
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'expense' | 'income'>('expense');
  const [catColor, setCatColor] = useState('#10b981');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catInitialSubs, setCatInitialSubs] = useState<string[]>([]);
  const [subInput, setSubInput] = useState('');
  const [catInitialBudget, setCatInitialBudget] = useState('');

  // Inline subcategory input state per category card
  const [activeInlineSubCatId, setActiveInlineSubCatId] = useState<string | null>(null);
  const [inlineSubName, setInlineSubName] = useState('');

  // Filter expenses for current month
  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const totalBudgetLimit = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalMonthSpent = monthExpenses.reduce((s, e) => s + e.convertedAmount, 0);

  const handleOpenCategoryModal = (catToEdit?: Category) => {
    if (catToEdit) {
      setEditingCategory(catToEdit);
      setCatName(catToEdit.name);
      setCatType(catToEdit.type || 'expense');
      setCatColor(catToEdit.color || '#10b981');
      setCatIcon(catToEdit.icon || 'Tag');
      setCatInitialSubs([]);
      const existingBudget = budgets.find(b => b.categoryId === catToEdit.id);
      setCatInitialBudget(existingBudget ? existingBudget.monthlyLimit.toString() : '');
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatType('expense');
      setCatColor('#10b981');
      setCatIcon('Tag');
      setCatInitialSubs([]);
      setCatInitialBudget('');
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      // Update existing category
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        type: catType,
        color: catColor,
        icon: catIcon,
      });

      // Update budget if specified
      if (catInitialBudget.trim()) {
        const limit = parseFloat(catInitialBudget);
        if (!isNaN(limit) && limit > 0) {
          const existingBudget = budgets.find(b => b.categoryId === editingCategory.id);
          if (existingBudget) {
            updateBudget(existingBudget.id, {
              monthlyLimit: limit,
              categoryName: catName.trim(),
            });
          } else {
            addBudget({
              categoryId: editingCategory.id,
              categoryName: catName.trim(),
              monthlyLimit: limit,
              rollover: false,
              alertThresholdPercent: 80,
            });
          }
        }
      }
    } else {
      // Create new category
      const subObjects = catInitialSubs.map(s => ({
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: s,
      }));

      const newCatId = `cat-${Date.now()}`;
      addCategory({
        name: catName.trim(),
        type: catType,
        icon: catIcon,
        color: catColor,
        subCategories: subObjects,
      });

      // If budget specified during category creation, add it
      if (catInitialBudget.trim()) {
        const limit = parseFloat(catInitialBudget);
        if (!isNaN(limit) && limit > 0) {
          addBudget({
            categoryId: newCatId,
            categoryName: catName.trim(),
            monthlyLimit: limit,
            rollover: false,
            alertThresholdPercent: 80,
          });
        }
      }
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(budgetLimit);
    if (isNaN(limit) || limit <= 0) {
      alert('সঠিক মাসিক বাজেট লিমিট পরিমাণ লিখুন');
      return;
    }

    const cat = categories.find(c => c.id === budgetCatId);
    if (!cat) return;

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        monthlyLimit: limit,
        rollover: budgetRollover,
        alertThresholdPercent: budgetAlertThreshold,
        categoryName: cat.name,
      });
    } else {
      const existing = budgets.find(b => b.categoryId === budgetCatId);
      if (existing) {
        updateBudget(existing.id, {
          monthlyLimit: limit,
          rollover: budgetRollover,
          alertThresholdPercent: budgetAlertThreshold,
          categoryName: cat.name,
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

  const handleAddSubInModal = () => {
    if (!subInput.trim()) return;
    setCatInitialSubs(prev => [...prev, subInput.trim()]);
    setSubInput('');
  };

  const handleRemoveSubInModal = (index: number) => {
    setCatInitialSubs(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddInlineSubCategory = (catId: string) => {
    if (!inlineSubName.trim()) return;
    addSubCategory(catId, inlineSubName.trim());
    setInlineSubName('');
    setActiveInlineSubCatId(null);
  };

  const handleQuickAddPresetChip = (item: typeof QUICK_SUGGESTIONS[0]) => {
    const existing = categories.find(c => c.name.toLowerCase() === item.name.toLowerCase());
    if (existing) {
      alert(`"${item.name}" ক্যাটাগরি ইতিমধ্যে যোগ করা আছে!`);
      return;
    }

    const newCatId = `cat-${Date.now()}`;
    addCategory({
      name: item.name,
      type: 'expense',
      icon: item.icon,
      color: item.color,
      subCategories: item.subs.map(s => ({
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: s,
      })),
    });

    if (item.budget > 0) {
      addBudget({
        categoryId: newCatId,
        categoryName: item.name,
        monthlyLimit: item.budget,
        rollover: false,
        alertThresholdPercent: 80,
      });
    }
  };

  const handleClearAllConfirm = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আগের সব ডেমো ক্যাটাগরি ও বাজেট ডিলিট করে সম্পূর্ণ ফ্রেশ শুরু করতে চান?')) {
      clearAllCategoriesAndBudgets();
    }
  };

  // Helper to render icon component
  const renderCategoryIcon = (iconName: string, className: string = 'w-4 h-4') => {
    const match = PRESET_ICONS.find(i => i.name === iconName);
    if (match) {
      const IconComponent = match.Icon;
      return <IconComponent className={className} />;
    }
    return <Tag className={className} />;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              কাস্টম ক্যাটাগরি ও বাজেট
            </h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {categories.length} টি ক্যাটাগরি
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার প্রয়োজন অনুযায়ী সম্পূর্ণ কাস্টম ক্যাটাগরি, সাব-ক্যাটাগরি তৈরি করুন এবং প্রতিটির জন্য মাসিক খরচের লিমিট সেট করুন।
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Clear / Fresh Start Button */}
          {categories.length > 0 && (
            <button
              onClick={handleClearAllConfirm}
              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition"
              title="সব আগের ডেমো ডেটা মুছে ক্লিন শুরু করুন"
            >
              <Trash2 className="w-3.5 h-3.5" /> ফ্রেশ ক্লিন শুরু
            </button>
          )}

          {/* Preset Loader */}
          <button
            onClick={() => setShowPresetModal(true)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition"
            title="রেডিমেড প্রি-সেট লোড করুন"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> প্রিসেট টেমপ্লেট
          </button>

          {/* New Category Button */}
          <button
            onClick={() => handleOpenCategoryModal()}
            className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-medium hover:bg-emerald-100 flex items-center gap-1.5 transition active:scale-95"
          >
            <FolderPlus className="w-4 h-4 text-emerald-600" /> নতুন ক্যাটাগরি
          </button>

          {/* Set Budget Limit Button */}
          {categories.length > 0 && (
            <button
              onClick={() => {
                setEditingBudget(null);
                setBudgetLimit('');
                setBudgetCatId(categories[0]?.id || '');
                setShowBudgetModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-xs shadow-emerald-600/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> বাজেট লিমিট সেট
            </button>
          )}
        </div>
      </div>

      {/* Empty State / Custom Builder Welcome Banner */}
      {categories.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-slate-50 to-teal-50/40 border border-emerald-200/80 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              আপনার কোনো ক্যাটাগরি তৈরি করা নেই (ক্লিন স্টেট)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              এখন আপনি নিজের পছন্দমতো কাস্টম ক্যাটাগরি তৈরি করে নিতে পারেন। নিচে থেকে ১-ক্লিকে প্রয়োজনীয় বিষয়গুলো যোগ করুন অথবা আপনার নিজস্ব ক্যাটাগরি লিখুন।
            </p>
          </div>

          {/* Quick Add Suggestions Grid */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              জনপ্রিয় দরকারি ক্যাটাগরি (১-ক্লিকে যোগ করতে চাপুন):
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {QUICK_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAddPresetChip(item)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-800 text-xs font-medium flex items-center gap-1.5 shadow-xs transition active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({formatCurrency(item.budget)})</span>
                  <Plus className="w-3 h-3 text-emerald-600" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleOpenCategoryModal()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm shadow-emerald-600/30 transition active:scale-95"
            >
              <FolderPlus className="w-4 h-4" /> + নিজের কাস্টম ক্যাটাগরি বানান
            </button>
            <button
              onClick={() => loadCategoryPreset('family')}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition"
            >
              👨‍👩‍👦 ফ্যামিলি কমপ্লিট সেট লোড করুন
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Monthly Budget Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100/70 shadow-xs">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-700">মোট মাসিক বাজেট লিমিট</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1 font-mono tracking-tight">
                {formatCurrency(totalBudgetLimit)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">সব ক্যাটাগরির নির্ধারিত মোট সীমা</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/60 to-rose-50/30 border border-rose-100/80 shadow-xs">
              <p className="text-xs font-medium uppercase tracking-wider text-rose-700">এই মাসে মোট খরচ হয়েছে</p>
              <p className="text-2xl font-semibold text-rose-600 mt-1 font-mono tracking-tight">
                {formatCurrency(totalMonthSpent)}
              </p>
              <p className="text-xs text-rose-600/80 font-medium mt-0.5">
                {totalBudgetLimit > 0
                  ? `${((totalMonthSpent / totalBudgetLimit) * 100).toFixed(1)}% বাজেট ব্যবহার হয়েছে`
                  : 'বাজেট নির্ধারিত নেই'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/30 border border-emerald-100/80 shadow-xs">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">অবশিষ্ট বাজেট বাফার</p>
              <p
                className={`text-2xl font-semibold mt-1 font-mono tracking-tight ${
                  totalBudgetLimit - totalMonthSpent >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatCurrency(Math.max(0, totalBudgetLimit - totalMonthSpent))}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">বাজেটের অতিরিক্ত হওয়া পর্যন্ত বাকি টাকা</p>
            </div>
          </div>

          {/* Quick Suggestions Strip when user has only few categories */}
          {categories.length < 5 && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> দ্রুত নতুন ক্যাটাগরি যোগ করুন:
              </span>
              {QUICK_SUGGESTIONS.filter(q => !categories.some(c => c.name === q.name)).slice(0, 4).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAddPresetChip(item)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 text-xs font-medium flex items-center gap-1 transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <Plus className="w-3 h-3 text-emerald-600" />
                </button>
              ))}
            </div>
          )}

          {/* Category Budgets Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> ক্যাটাগরি ও বাজেট পর্যবেক্ষণ ({categories.length})
              </h3>
              <span className="text-xs text-slate-500">
                মাস: <strong className="font-semibold text-slate-800">{currentMonth}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => {
                const budget = budgets.find(b => b.categoryId === category.id);
                const spent = monthExpenses
                  .filter(e => e.categoryId === category.id)
                  .reduce((s, e) => s + e.convertedAmount, 0);

                const limit = budget ? budget.monthlyLimit : 0;
                const percent = limit > 0 ? (spent / limit) * 100 : 0;
                const isOver = limit > 0 && percent >= 100;
                const isWarning = limit > 0 && percent >= (budget?.alertThresholdPercent || 80) && !isOver;

                return (
                  <div
                    key={category.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition group"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-medium text-white text-xs shadow-xs shrink-0"
                            style={{ backgroundColor: category.color || '#10b981' }}
                          >
                            {renderCategoryIcon(category.icon, 'w-5 h-5')}
                          </div>
                          <div className="truncate">
                            <h4 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                              {category.name}
                            </h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              {budget ? (
                                <>
                                  <span className="text-slate-600 font-medium">লিমিট: {formatCurrency(limit)}</span>
                                  {budget.rollover && <span className="text-emerald-600 font-medium">• রোলওভার</span>}
                                </>
                              ) : (
                                <span className="text-amber-600 font-medium">বাজেট সেট করা নেই</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Top Card Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenCategoryModal(category)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="ক্যাটাগরি এডিট"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`"${category.name}" ক্যাটাগরি ও এর বাজেট মুছে ফেলতে চান?`)) {
                                deleteCategory(category.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="ক্যাটাগরি ডিলিট"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar (if budget exists) */}
                      {budget ? (
                        <div className="space-y-1.5 my-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">
                              খরচ: <strong className="text-slate-900 font-semibold font-mono">{formatCurrency(spent)}</strong>
                            </span>
                            <span className="text-slate-500 font-mono">
                              লিমিট: {formatCurrency(limit)}
                            </span>
                          </div>

                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden p-0.5">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span
                              className={`px-2 py-0.2 rounded-md font-semibold text-[10px] ${
                                isOver
                                  ? 'bg-rose-100 text-rose-700'
                                  : isWarning
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {isOver
                                ? `অতিরিক্ত (+${formatCurrency(spent - limit)})`
                                : `${(100 - percent).toFixed(0)}% বাকি (${formatCurrency(limit - spent)})`}
                            </span>

                            <button
                              onClick={() => {
                                setEditingBudget(budget);
                                setBudgetCatId(category.id);
                                setBudgetLimit(budget.monthlyLimit.toString());
                                setBudgetRollover(budget.rollover);
                                setBudgetAlertThreshold(budget.alertThresholdPercent);
                                setShowBudgetModal(true);
                              }}
                              className="text-emerald-700 hover:text-emerald-800 text-[11px] font-medium"
                            >
                              বাজেট পরিবর্তন
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="my-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center justify-between">
                          <span className="text-xs text-amber-800 font-medium">মাসিক খরচের লিমিট নেই</span>
                          <button
                            onClick={() => {
                              setEditingBudget(null);
                              setBudgetCatId(category.id);
                              setBudgetLimit('10000');
                              setShowBudgetModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                          >
                            + লিমিট দিন
                          </button>
                        </div>
                      )}

                      {/* Sub-categories Chips */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            সাব-ক্যাটাগরি ({category.subCategories.length})
                          </span>
                          <button
                            onClick={() => {
                              setActiveInlineSubCatId(activeInlineSubCatId === category.id ? null : category.id);
                              setInlineSubName('');
                            }}
                            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            + সাব-ক্যাটাগরি
                          </button>
                        </div>

                        {/* Inline subcategory add input */}
                        {activeInlineSubCatId === category.id && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <input
                              type="text"
                              autoFocus
                              placeholder="নতুন সাব-ক্যাটাগরি..."
                              value={inlineSubName}
                              onChange={e => setInlineSubName(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleAddInlineSubCategory(category.id);
                              }}
                              className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 bg-white flex-1"
                            />
                            <button
                              onClick={() => handleAddInlineSubCategory(category.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                            >
                              যোগ
                            </button>
                            <button
                              onClick={() => setActiveInlineSubCatId(null)}
                              className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                            >
                              বাতিল
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                          {category.subCategories.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">কোনো সাব-ক্যাটাগরি নেই</span>
                          ) : (
                            category.subCategories.map(sub => (
                              <span
                                key={sub.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] border border-slate-200/70"
                              >
                                <span>{sub.name}</span>
                                <button
                                  onClick={() => deleteSubCategory(category.id, sub.id)}
                                  className="text-slate-400 hover:text-rose-500 ml-0.5"
                                  title="মুছে ফেলুন"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Add Expense Action */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        আইডি: {category.id.slice(0, 10)}
                      </span>
                      <button
                        onClick={() => onOpenQuickAdd('expense')}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> খরচ এন্ট্রি
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Category Creation / Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveCategory}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-5 sm:p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-600" />
                {editingCategory ? 'ক্যাটাগরি এডিট করুন' : 'নতুন কাস্টম ক্যাটাগরি তৈরি করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ক্যাটাগরির নাম *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: বাজার ও খাদ্য / বাসা ভাড়া / বিনোদন"
                value={catName}
                onChange={e => setCatName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              />
            </div>

            {/* Color Swatch Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                কালার থিম নির্বাচন করুন
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCatColor(c)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                      catColor === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {catColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={catColor}
                  onChange={e => setCatColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 ml-2"
                  title="Custom Color"
                />
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                আইকন নির্বাচন করুন
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 border border-slate-200 rounded-xl">
                {PRESET_ICONS.map(i => {
                  const IconComp = i.Icon;
                  const isSelected = catIcon === i.name;
                  return (
                    <button
                      key={i.name}
                      type="button"
                      onClick={() => setCatIcon(i.name)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="text-[10px] truncate">{i.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-categories Builder (Only on new or optional) */}
            {!editingCategory && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সাব-ক্যাটাগরি যুক্ত করুন (ঐচ্ছিক)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="যেমন: মাছ-মাংস, শাকসবজি"
                    value={subInput}
                    onChange={e => setSubInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubInModal();
                      }
                    }}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubInModal}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                  >
                    + যোগ
                  </button>
                </div>

                {catInitialSubs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {catInitialSubs.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubInModal(idx)}
                          className="text-emerald-600 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Optional Monthly Budget Limit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মাসিক বাজেট লিমিট ({profile.baseCurrency}) (ঐচ্ছিক)
              </label>
              <input
                type="number"
                placeholder="যেমন: 15000"
                value={catInitialBudget}
                onChange={e => setCatInitialBudget(e.target.value)}
                className="w-full text-sm font-semibold font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs shadow-emerald-600/30 transition active:scale-95"
              >
                {editingCategory ? 'পরিবর্তন সংরক্ষণ' : 'ক্যাটাগরি তৈরি করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Set / Edit Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveBudget}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                {editingBudget ? 'ক্যাটাগরি বাজেট এডিট' : 'মাসিক বাজেট লিমিট নির্ধারণ'}
              </h3>
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটাগরি নির্বাচন</label>
              <select
                disabled={!!editingBudget}
                value={budgetCatId}
                onChange={e => setBudgetCatId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Limit Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মাসিক বাজেট লিমিট ({profile.baseCurrency}) *
              </label>
              <input
                type="number"
                required
                placeholder="যেমন: 25000"
                value={budgetLimit}
                onChange={e => setBudgetLimit(e.target.value)}
                className="w-full text-lg font-semibold font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সতর্কীকরণ লিমিট (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={budgetAlertThreshold}
                  onChange={e => setBudgetAlertThreshold(parseInt(e.target.value) || 80)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={budgetRollover}
                    onChange={e => setBudgetRollover(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>রোলওভার চালু</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs shadow-emerald-600/30 transition active:scale-95"
              >
                বাজেট সংরক্ষণ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preset Loader Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                প্রিসেট ক্যাটাগরি সেট নির্বাচন করুন
              </h3>
              <button
                onClick={() => setShowPresetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              একটি উপযুক্ত টেমপ্লেট নির্বাচন করলে তৈরি হওয়া ক্যাটাগরিগুলো দিয়ে সাথে সাথে কাজ শুরু করতে পারবেন (পরে যেকোনো পরিবর্তন করতে পারবেন):
            </p>

            <div className="space-y-2.5">
              <div
                onClick={() => {
                  loadCategoryPreset('family');
                  setShowPresetModal(false);
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">👨‍👩‍👦 ফ্যামিলি কমপ্লিট সেট (Family Pack)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">বাজার, ফ্ল্যাট ভাড়া, বিদ্যুৎ বিল, চিকিৎসা, যাতায়াত ও ইমার্জেন্সি ফান্ড</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700">লোড করুন →</span>
              </div>

              <div
                onClick={() => {
                  loadCategoryPreset('bachelor');
                  setShowPresetModal(false);
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">🎒 মেস ও ব্যাচেলর সেট (Bachelor Pack)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">মেস মিল চার্জ, সিট ভাড়া, চা-নাস্তা আড্ডা ও বাস ভাড়া</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700">লোড করুন →</span>
              </div>

              <div
                onClick={() => {
                  loadCategoryPreset('freelancer');
                  setShowPresetModal(false);
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">💻 ফ্রিল্যান্সার ও আইটি সেট (Freelancer Pack)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">ক্লাউড সাবস্ক্রিপশন, সফটওয়্যার টুলস, ইন্টারনেট ও জীবনযাত্রা</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700">লোড করুন →</span>
              </div>

              <div
                onClick={() => {
                  resetCategoriesToDefault();
                  setShowPresetModal(false);
                }}
                className="p-3 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 cursor-pointer transition text-center"
              >
                <p className="text-xs font-medium text-slate-600">মূল ডিফল্ট ক্যাটাগরি সেট রিস্টোর করুন</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPresetModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
