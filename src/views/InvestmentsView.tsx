import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Calendar,
  Layers,
  Award,
  DollarSign,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Investment, InvestmentType } from '../types';

export const InvestmentsView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
}> = () => {
  const {
    investments,
    totalInvestmentValue,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    formatCurrency,
    profile,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'all' | 'DPS' | 'FDR' | 'Sanchayapatra' | 'Stocks' | 'Gold'>('all');
  const [showModal, setShowModal] = useState(false);

  // Investment Form
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('DPS');
  const [institution, setInstitution] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [maturityDate, setMaturityDate] = useState('');
  const [maturityAmount, setMaturityAmount] = useState('');
  const [monthlyInstallment, setMonthlyInstallment] = useState('');
  const [installmentsPaid, setInstallmentsPaid] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [dividendProfit, setDividendProfit] = useState('');
  const [notes, setNotes] = useState('');

  const filteredInvestments = investments.filter(i => {
    if (activeTab !== 'all' && i.type !== activeTab) return false;
    return true;
  });

  const totalInvestedPrincipal = investments.reduce((s, i) => s + (i.investedAmount ?? (i as any).principalAmount ?? 0), 0);
  const totalProfits = (totalInvestmentValue || 0) - (totalInvestedPrincipal || 0);

  const handleSaveInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const invAmt = parseFloat(investedAmount);
    const currVal = parseFloat(currentValue) || invAmt;

    if (isNaN(invAmt) || invAmt <= 0) {
      alert('Please enter valid invested amount');
      return;
    }

    addInvestment({
      name,
      type,
      institutionName: institution,
      investedAmount: invAmt,
      currentValue: currVal,
      interestRateAnnual: interestRate ? parseFloat(interestRate) : undefined,
      startDate,
      maturityDate: maturityDate || undefined,
      maturityAmount: maturityAmount ? parseFloat(maturityAmount) : undefined,
      monthlyInstallment: monthlyInstallment ? parseFloat(monthlyInstallment) : undefined,
      installmentsPaid: installmentsPaid ? parseInt(installmentsPaid) : undefined,
      totalInstallments: totalInstallments ? parseInt(totalInstallments) : undefined,
      dividendEarned: dividendProfit ? parseFloat(dividendProfit) : undefined,
      notes,
    });

    setShowModal(false);
    // Reset
    setName('');
    setInstitution('');
    setInvestedAmount('');
    setCurrentValue('');
    setInterestRate('');
    setMaturityDate('');
    setMaturityAmount('');
    setMonthlyInstallment('');
    setInstallmentsPaid('');
    setTotalInstallments('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Investments, DPS & Fixed Schemes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track DPS installments, Bangladesh Sanchayapatra, Bank FDRs, Stocks, and Gold assets
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {/* Investment Portfolio Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100/70 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-700">Total Portfolio Valuation</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1 font-mono tracking-tight">
            {formatCurrency(totalInvestmentValue)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Live estimated market & maturity value</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-600">Principal Invested</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1 font-mono tracking-tight">
            {formatCurrency(totalInvestedPrincipal)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total self-funded capital</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/30 border border-emerald-100/80 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">Accrued Profit / Returns</p>
          <p className={`text-2xl font-semibold mt-1 font-mono tracking-tight ${totalProfits >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            +{formatCurrency(totalProfits)}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">
            {totalInvestedPrincipal > 0 ? `+${((totalProfits / totalInvestedPrincipal) * 100).toFixed(1)}% total ROI` : '0% ROI'}
          </p>
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl w-fit text-xs sm:text-sm font-medium overflow-x-auto max-w-full">
        {['all', 'DPS', 'FDR', 'Sanchayapatra', 'Stocks', 'Gold'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`px-3.5 py-1.5 rounded-xl transition capitalize whitespace-nowrap ${
              activeTab === t
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t === 'all' ? `All (${investments.length})` : t}
          </button>
        ))}
      </div>

      {/* Investments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInvestments.map(inv => {
          const isDps = inv.type === 'DPS';
          const isFdrOrSanchaya = inv.type === 'FDR' || inv.type === 'Sanchayapatra';
          const invAmt = inv.investedAmount ?? (inv as any).principalAmount ?? 0;
          const currVal = inv.currentValue ?? invAmt;
          const profit = currVal - invAmt;
          const roi = invAmt > 0 ? (profit / invAmt) * 100 : 0;
          const dpsProgress = isDps && inv.totalInstallments ? ((inv.installmentsPaid || 0) / inv.totalInstallments) * 100 : 0;

          return (
            <div
              key={inv.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 uppercase tracking-wider border border-emerald-200/60">
                      {inv.type}
                    </span>
                    <h4 className="font-semibold text-base sm:text-lg text-slate-900 mt-1.5">{inv.name}</h4>
                    <p className="text-xs text-slate-400">{inv.institutionName || 'Self Managed'}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Value</span>
                    <p className="text-lg sm:text-xl font-semibold text-emerald-600 font-mono tracking-tight mt-0.5">
                      {formatCurrency(inv.currentValue)}
                    </p>
                  </div>
                </div>

                {/* Investment Spec Metric Grid */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Invested Principal:</span>
                    <p className="font-bold text-slate-800">{formatCurrency(inv.investedAmount)}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px]">Annual Interest / Yield:</span>
                    <p className="font-bold text-emerald-600">{inv.interestRateAnnual ? `${inv.interestRateAnnual}% p.a.` : 'Market Value'}</p>
                  </div>

                  {inv.maturityDate && (
                    <div>
                      <span className="text-slate-400 text-[10px]">Maturity Date:</span>
                      <p className="font-bold text-slate-800">{inv.maturityDate}</p>
                    </div>
                  )}

                  {inv.maturityAmount && (
                    <div>
                      <span className="text-slate-400 text-[10px]">Expected Maturity:</span>
                      <p className="font-bold text-slate-800">{formatCurrency(inv.maturityAmount)}</p>
                    </div>
                  )}
                </div>

                {/* DPS Specific Installment Progress */}
                {isDps && inv.totalInstallments && (
                  <div className="space-y-1 my-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Installments Paid:</span>
                      <strong className="text-slate-900">{inv.installmentsPaid} / {inv.totalInstallments} ({dpsProgress.toFixed(0)}%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, dpsProgress)}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold">
                  +{formatCurrency(profit)} profit ({roi.toFixed(1)}%)
                </span>

                <button
                  onClick={() => {
                    if (confirm(`Delete investment ${inv.name}?`)) {
                      deleteInvestment(inv.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-500 text-[11px]"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Investment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <form onSubmit={handleSaveInvestment} className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-4 my-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">Add Investment / Fixed Scheme</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset / Scheme Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Yr DPS Scheme / 3-Month FDR"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as InvestmentType)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  <option value="DPS">DPS (Monthly Deposit Pension)</option>
                  <option value="FDR">FDR (Fixed Deposit Receipt)</option>
                  <option value="Sanchayapatra">Sanchayapatra (Savings Certificate)</option>
                  <option value="Stocks">Stocks / Equities (DSE)</option>
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="Gold">Gold Asset</option>
                  <option value="Real Estate">Real Estate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank / Institution</label>
                <input
                  type="text"
                  placeholder="e.g. Eastern Bank / Post Office"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 9.5"
                  value={interestRate}
                  onChange={e => setInterestRate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invested Capital Amount *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 100000"
                  value={investedAmount}
                  onChange={e => setInvestedAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Estimated Value</label>
                <input
                  type="number"
                  placeholder="e.g. 112000"
                  value={currentValue}
                  onChange={e => setCurrentValue(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold text-emerald-600"
                />
              </div>
            </div>

            {type === 'DPS' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600">Monthly Installment</label>
                    <input
                      type="number"
                      placeholder="e.g. 10000"
                      value={monthlyInstallment}
                      onChange={e => setMonthlyInstallment(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Installments Paid</label>
                    <input
                      type="number"
                      placeholder="e.g. 12"
                      value={installmentsPaid}
                      onChange={e => setInstallmentsPaid(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Total Tenure (Mos)</label>
                    <input
                      type="number"
                      placeholder="e.g. 60"
                      value={totalInstallments}
                      onChange={e => setTotalInstallments(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maturity Date</label>
                <input
                  type="date"
                  value={maturityDate}
                  onChange={e => setMaturityDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Maturity Value</label>
                <input
                  type="number"
                  placeholder="e.g. 750000"
                  value={maturityAmount}
                  onChange={e => setMaturityAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save Investment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
