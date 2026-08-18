import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Handshake,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const TrashView: React.FC = () => {
  const {
    trashItems,
    restoreFromTrash,
    permanentDelete,
    emptyTrash,
    formatCurrency,
    profile,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income' | 'transfer' | 'loan'>('all');

  const totalTrashCount =
    trashItems.incomes.length +
    trashItems.expenses.length +
    trashItems.transfers.length +
    trashItems.loans.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" /> Soft-Delete Trash Bin
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Safely review and restore deleted financial transactions or permanently purge records
          </p>
        </div>

        {totalTrashCount > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to PERMANENTLY delete all items in the trash bin? This action cannot be undone.')) {
                emptyTrash();
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-rose-600/30"
          >
            <Trash2 className="w-3.5 h-3.5" /> Empty Trash Bin
          </button>
        )}
      </div>

      {totalTrashCount === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Trash2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Trash Bin is Empty</h3>
          <p className="text-xs text-slate-400 mt-1">Deleted income, expenses, and loans will be safely preserved here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Deleted Expenses */}
          {trashItems.expenses.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" /> Deleted Expenses ({trashItems.expenses.length})
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {trashItems.expenses.map(e => (
                  <div key={e.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{e.categoryName}</p>
                      <p className="text-[11px] text-slate-400">{e.date} • {e.notes || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-rose-600 text-sm">
                        -{formatCurrency(e.convertedAmount)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => restoreFromTrash('expense', e.id)}
                          className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                        <button
                          onClick={() => permanentDelete('expense', e.id)}
                          className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deleted Incomes */}
          {trashItems.incomes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Deleted Incomes ({trashItems.incomes.length})
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {trashItems.incomes.map(i => (
                  <div key={i.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{i.source}</p>
                      <p className="text-[11px] text-slate-400">{i.date} • {i.clientName ? `Client: ${i.clientName}` : i.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-emerald-600 text-sm">
                        +{formatCurrency(i.convertedAmount)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => restoreFromTrash('income', i.id)}
                          className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                        <button
                          onClick={() => permanentDelete('income', i.id)}
                          className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deleted Transfers */}
          {trashItems.transfers.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-500 mb-3 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4" /> Deleted Transfers ({trashItems.transfers.length})
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {trashItems.transfers.map(t => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Internal Transfer</p>
                      <p className="text-[11px] text-slate-400">{t.date} • {t.notes || 'Transfer'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-sky-600 text-sm">
                        {formatCurrency(t.amount)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => restoreFromTrash('transfer', t.id)}
                          className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                        <button
                          onClick={() => permanentDelete('transfer', t.id)}
                          className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deleted Loans */}
          {trashItems.loans.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-2">
                <Handshake className="w-4 h-4" /> Deleted Loan Records ({trashItems.loans.length})
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {trashItems.loans.map(l => (
                  <div key={l.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{l.person} ({l.type})</p>
                      <p className="text-[11px] text-slate-400">{l.date} • {l.notes || 'Loan Record'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-amber-600 text-sm">
                        {formatCurrency(l.amount, l.currency)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => restoreFromTrash('loan', l.id)}
                          className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                        <button
                          onClick={() => permanentDelete('loan', l.id)}
                          className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
