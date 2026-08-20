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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" /> Income & Salary Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fixed corporate salary logs, automated recurring entries, and multi-currency freelance contracts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSalaryModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition"
          >
            <Award className="w-4 h-4 text-emerald-600" /> Record Increment
          </button>
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Add Income
          </button>
        </div>
      </div>

      {/* Corporate Salary Overview Card */}
      {currentSalary && (
        <div className="p-6 rounded-2xl bg-white text-slate-900 border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Current Active Package
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mt-2">{currentSalary.designation}</h3>
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-4 h-4 text-emerald-600" /> {currentSalary.employerName}
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Net Take-Home Salary</p>
                <p className="text-2xl sm:text-3xl font-semibold text-emerald-600 font-mono tracking-tight mt-0.5">
                  {formatCurrency(currentSalary.netAmount, currentSalary.currency)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Disbursed on Day {currentSalary.payDay} of each month</p>
              </div>
            </div>

            {/* Salary Breakdown Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Gross Salary</p>
                <p className="text-base sm:text-lg font-semibold text-slate-900 mt-1 font-mono">{formatCurrency(currentSalary.grossAmount, currentSalary.currency)}</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
                <p className="text-xs text-rose-700 font-medium uppercase tracking-wider">Tax Deduction</p>
                <p className="text-base sm:text-lg font-semibold text-rose-600 mt-1 font-mono">-{formatCurrency(currentSalary.taxDeduction, currentSalary.currency)}</p>
              </div>
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
                <p className="text-xs text-sky-700 font-medium uppercase tracking-wider">Provident Fund (PF)</p>
                <p className="text-base sm:text-lg font-semibold text-sky-700 mt-1 font-mono">-{formatCurrency(currentSalary.providentFund, currentSalary.currency)}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Effective From</p>
                <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1 font-mono">{currentSalary.effectiveFrom}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary History & Raise Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3.5 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" /> Career Salary Increment Log
        </h3>
        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          {salaryLogs.map((log, index) => (
            <div key={log.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{log.designation}</p>
                <p className="text-xs text-slate-500">{log.employerName} • Effective {log.effectiveFrom}</p>
                {log.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{log.notes}</p>}
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900 text-sm sm:text-base font-mono">
                  {formatCurrency(log.netAmount, log.currency)} <span className="text-xs text-emerald-600 font-sans">Net</span>
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Gross {formatCurrency(log.grossAmount, log.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Freelance & Project Earnings Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Freelance & Multi-Currency Contracts
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Cumulative freelance revenue: <span className="text-slate-800 font-semibold font-mono">{formatCurrency(totalFreelanceEarned)}</span></p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Client & Project</th>
                <th className="p-3">Platform</th>
                <th className="p-3 text-right">Original Amt</th>
                <th className="p-3 text-right">Converted ({profile.baseCurrency})</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {freelanceIncomes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">No freelance entries recorded.</td>
                </tr>
              ) : (
                freelanceIncomes.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-[11px] text-slate-500">{f.date}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{f.clientName || f.source}</p>
                      <p className="text-[11px] text-slate-500">{f.projectName || f.notes || '-'}</p>
                    </td>
                    <td className="p-3 font-medium text-slate-600">{f.paymentPlatform || 'Direct'}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {f.currency} {f.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-600">
                      {formatCurrency(f.convertedAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.status === 'received' ? 'bg-emerald-100 text-emerald-700  ' : 'bg-amber-100 text-amber-700'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form onSubmit={handleSaveSalary} className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Record Salary Package / Increment
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Principal Architect"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Employer *</label>
                <input
                  type="text"
                  required
                  value={employerName}
                  onChange={e => setEmployerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Salary Amount ({profile.baseCurrency}) *</label>
                <input
                  type="number"
                  required
                  placeholder="200000"
                  value={grossAmount}
                  onChange={e => setGrossAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Net Take-Home ({profile.baseCurrency}) *</label>
                <input
                  type="number"
                  required
                  placeholder="178000"
                  value={netAmount}
                  onChange={e => setNetAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold text-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Deduction</label>
                <input
                  type="number"
                  placeholder="14000"
                  value={taxDeduction}
                  onChange={e => setTaxDeduction(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provident Fund</label>
                <input
                  type="number"
                  placeholder="8000"
                  value={providentFund}
                  onChange={e => setProvidentFund(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Day (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={payDay}
                  onChange={e => setPayDay(parseInt(e.target.value) || 1)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Effective Date</label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={e => setEffectiveFrom(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Annual merit promotion"
                  value={salaryNotes}
                  onChange={e => setSalaryNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowSalaryModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600"
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
