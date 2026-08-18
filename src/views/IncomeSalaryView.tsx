import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  Plus,
  Calendar,
  Layers,
  Award,
  DollarSign,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SalaryLog, Income, CurrencyCode } from '../types';

export const IncomeSalaryView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
}> = ({ onOpenQuickAdd }) => {
  const {
    salaryLogs,
    addSalaryLog,
    incomes,
    formatCurrency,
    profile,
    exchangeRates,
  } = useFinance();

  const [showSalaryModal, setShowSalaryModal] = useState(false);

  // New salary raise form state
  const [designation, setDesignation] = useState('');
  const [employerName, setEmployerName] = useState('Apex Digital Technologies Ltd.');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [grossAmount, setGrossAmount] = useState('');
  const [netAmount, setNetAmount] = useState('');
  const [taxDeduction, setTaxDeduction] = useState('');
  const [providentFund, setProvidentFund] = useState('');
  const [payDay, setPayDay] = useState(1);
  const [salaryNotes, setSalaryNotes] = useState('');

  const currentSalary = salaryLogs[0];

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    const gross = parseFloat(grossAmount);
    const net = parseFloat(netAmount);
    if (isNaN(gross) || isNaN(net)) {
      alert('Please enter valid salary amounts');
      return;
    }

    addSalaryLog({
      effectiveFrom,
      employerName,
      designation,
      grossAmount: gross,
      netAmount: net,
      taxDeduction: parseFloat(taxDeduction) || 0,
      providentFund: parseFloat(providentFund) || 0,
      payDay,
      currency: profile.baseCurrency,
      notes: salaryNotes,
    });

    setShowSalaryModal(false);
    setDesignation('');
    setGrossAmount('');
    setNetAmount('');
    setTaxDeduction('');
    setProvidentFund('');
    setSalaryNotes('');
  };

  const freelanceIncomes = incomes.filter(i => i.type === 'freelance');
  const salaryIncomes = incomes.filter(i => i.type === 'salary');
  const otherIncomes = incomes.filter(i => i.type === 'other');

  const totalFreelanceEarned = freelanceIncomes.reduce((s, i) => s + i.convertedAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" /> Income & Salary Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fixed corporate salary logs, automated recurring entries, and multi-currency freelance contracts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSalaryModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-emerald-500" /> Record Salary Increment
          </button>
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
          >
            <Plus className="w-3.5 h-3.5" /> Add Income Entry
          </button>
        </div>
      </div>

      {/* Corporate Salary Overview Card */}
      {currentSalary && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Current Active Package
                </span>
                <h3 className="text-lg font-extrabold mt-1">{currentSalary.designation}</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-emerald-400" /> {currentSalary.employerName}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">Net Take-Home Salary</p>
                <p className="text-2xl font-black text-emerald-400">
                  {formatCurrency(currentSalary.netAmount, currentSalary.currency)}
                </p>
                <p className="text-[10px] text-slate-400">Disbursed on Day {currentSalary.payDay} of each month</p>
              </div>
            </div>

            {/* Salary Breakdown Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Gross Salary</p>
                <p className="text-base font-bold text-white mt-0.5">{formatCurrency(currentSalary.grossAmount, currentSalary.currency)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Tax Deduction</p>
                <p className="text-base font-bold text-rose-400 mt-0.5">-{formatCurrency(currentSalary.taxDeduction, currentSalary.currency)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Provident Fund (PF)</p>
                <p className="text-base font-bold text-sky-400 mt-0.5">-{formatCurrency(currentSalary.providentFund, currentSalary.currency)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Effective From</p>
                <p className="text-base font-bold text-slate-200 mt-0.5">{currentSalary.effectiveFrom}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary History & Raise Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" /> Career Salary Increment Log
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {salaryLogs.map((log, index) => (
            <div key={log.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{log.designation}</p>
                <p className="text-[11px] text-slate-500">{log.employerName} • Effective {log.effectiveFrom}</p>
                {log.notes && <p className="text-[10px] text-slate-400 mt-0.5 italic">{log.notes}</p>}
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {formatCurrency(log.netAmount, log.currency)} Net
                </p>
                <p className="text-[10px] text-slate-400">
                  Gross {formatCurrency(log.grossAmount, log.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Freelance & Project Earnings Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Freelance & Multi-Currency Contracts
            </h3>
            <p className="text-xs text-slate-400">Cumulative freelance revenue: {formatCurrency(totalFreelanceEarned)}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Client & Project</th>
                <th className="p-3">Platform</th>
                <th className="p-3 text-right">Original Amt</th>
                <th className="p-3 text-right">Converted ({profile.baseCurrency})</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {freelanceIncomes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">No freelance entries recorded.</td>
                </tr>
              ) : (
                freelanceIncomes.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-[11px] text-slate-500">{f.date}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900 dark:text-white">{f.clientName || f.source}</p>
                      <p className="text-[11px] text-slate-500">{f.projectName || f.notes || '-'}</p>
                    </td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300">{f.paymentPlatform || 'Direct'}</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      {f.currency} {f.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(f.convertedAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.status === 'received' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Raise / Package Log Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form onSubmit={handleSaveSalary} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Record Salary Package / Increment
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Principal Architect"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Employer *</label>
                <input
                  type="text"
                  required
                  value={employerName}
                  onChange={e => setEmployerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gross Salary Amount ({profile.baseCurrency}) *</label>
                <input
                  type="number"
                  required
                  placeholder="200000"
                  value={grossAmount}
                  onChange={e => setGrossAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Net Take-Home ({profile.baseCurrency}) *</label>
                <input
                  type="number"
                  required
                  placeholder="178000"
                  value={netAmount}
                  onChange={e => setNetAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tax Deduction</label>
                <input
                  type="number"
                  placeholder="14000"
                  value={taxDeduction}
                  onChange={e => setTaxDeduction(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Provident Fund</label>
                <input
                  type="number"
                  placeholder="8000"
                  value={providentFund}
                  onChange={e => setProvidentFund(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pay Day (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={payDay}
                  onChange={e => setPayDay(parseInt(e.target.value) || 1)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Effective Date</label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={e => setEffectiveFrom(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Annual merit promotion"
                  value={salaryNotes}
                  onChange={e => setSalaryNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSalaryModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save Increment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
