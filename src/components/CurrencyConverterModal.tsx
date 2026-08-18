import React, { useState } from 'react';
import { RefreshCw, ArrowRightLeft, DollarSign, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CurrencyCode } from '../types';

export const CurrencyConverterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { exchangeRates, updateExchangeRate, profile, convertCurrency, formatCurrency } = useFinance();
  const [amount, setAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState<CurrencyCode>('USD');
  const [toCurr, setToCurr] = useState<CurrencyCode>(profile.baseCurrency);
  const [editCurrency, setEditCurrency] = useState<string | null>(null);
  const [newRate, setNewRate] = useState<string>('');

  if (!isOpen) return null;

  const currencies: CurrencyCode[] = ['BDT', 'USD', 'EUR', 'GBP', 'AED', 'CAD', 'INR', 'SAR', 'AUD', 'SGD'];
  const converted = convertCurrency(amount, fromCurr, toCurr);

  const handleSwap = () => {
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  };

  const handleSaveRate = (curr: string) => {
    const num = parseFloat(newRate);
    if (!isNaN(num) && num > 0) {
      updateExchangeRate(curr, num);
      setEditCurrency(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Multi-Currency Exchange Hub</h3>
              <p className="text-xs text-slate-500">Live base rate linked to 1 {profile.baseCurrency}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Converter Inputs */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Enter Amount</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-lg font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">From</label>
              <select
                value={fromCurr}
                onChange={e => setFromCurr(e.target.value as CurrencyCode)}
                className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="mt-5 p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition"
              title="Swap Currencies"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">To</label>
              <select
                value={toCurr}
                onChange={e => setToCurr(e.target.value as CurrencyCode)}
                className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <p className="text-xs text-emerald-800 font-medium">
              {amount} {fromCurr} =
            </p>
            <p className="text-2xl font-extrabold text-emerald-700">
              {formatCurrency(converted, toCurr)}
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5">
              1 {fromCurr} = {(exchangeRates[fromCurr] / (exchangeRates[toCurr] || 1)).toFixed(4)} {toCurr}
            </p>
          </div>
        </div>

        {/* Currency Rates Table */}
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Current Exchange Rates (to {profile.baseCurrency})
        </h4>
        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
          {currencies.filter(c => c !== profile.baseCurrency).map(curr => (
            <div key={curr} className="flex items-center justify-between py-2 px-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{curr}</span>
                <span className="text-slate-400">1 {curr} = {exchangeRates[curr]} {profile.baseCurrency}</span>
              </div>
              {editCurrency === curr ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={newRate}
                    onChange={e => setNewRate(e.target.value)}
                    className="w-20 px-2 py-0.5 text-xs rounded border border-emerald-500 bg-white text-slate-900"
                  />
                  <button
                    onClick={() => handleSaveRate(curr)}
                    className="px-2 py-0.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditCurrency(null)}
                    className="px-1.5 py-0.5 text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditCurrency(curr);
                    setNewRate(exchangeRates[curr]?.toString() || '1');
                  }}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-[11px]"
                >
                  Edit Rate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
