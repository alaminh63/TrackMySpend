import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Building,
  DollarSign,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { generateFinancialReportPdf, exportTransactionsCsv } from '../utils/pdfGenerator';

export const ReportsView: React.FC = () => {
  const {
    incomes,
    expenses,
    formatCurrency,
    profile,
    salaryLogs,
  } = useFinance();

  const [reportYear, setReportYear] = useState<string>('2026');
  const [reportMonth, setReportMonth] = useState<string>('08');

  const selectedMonthKey = `${reportYear}-${reportMonth}`;

  // Monthly Data
  const monthlyIncomes = useMemo(() => incomes.filter(i => i.date.startsWith(selectedMonthKey)), [incomes, selectedMonthKey]);
  const monthlyExpenses = useMemo(() => expenses.filter(e => e.date.startsWith(selectedMonthKey)), [expenses, selectedMonthKey]);

  const monthTotalIncome = monthlyIncomes.reduce((s, i) => s + i.convertedAmount, 0);
  const monthTotalExpense = monthlyExpenses.reduce((s, e) => s + e.convertedAmount, 0);
  const monthNetSavings = monthTotalIncome - monthTotalExpense;
  const monthSavingsRate = monthTotalIncome > 0 ? (monthNetSavings / monthTotalIncome) * 100 : 0;

  // Monthly category breakdown
  const categorySummary = useMemo(() => {
    const map: { [name: string]: number } = {};
    monthlyExpenses.forEach(e => {
      map[e.categoryName] = (map[e.categoryName] || 0) + e.convertedAmount;
    });
    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      pct: monthTotalExpense > 0 ? (amount / monthTotalExpense) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [monthlyExpenses, monthTotalExpense]);

  // Annual Year-to-Date monthly trend chart (Months 01-12)
  const annualTrendData = useMemo(() => {
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return months.map((m, idx) => {
      const prefix = `${reportYear}-${m}`;
      const inc = incomes.filter(i => i.date.startsWith(prefix)).reduce((s, i) => s + i.convertedAmount, 0);
      const exp = expenses.filter(e => e.date.startsWith(prefix)).reduce((s, e) => s + e.convertedAmount, 0);
      return {
        month: monthNames[idx],
        Income: inc,
        Expense: exp,
        Savings: inc - exp,
      };
    });
  }, [incomes, expenses, reportYear]);

  // Tax Calculation Engine (Bangladesh Income Tax Act)
  // Salary Income Tax calculation
  const annualSalaryGross = (salaryLogs[0]?.grossAmount || 0) * 12;
  const annualSalaryTaxDeducted = (salaryLogs[0]?.taxDeduction || 0) * 12;
  const annualPFContribution = (salaryLogs[0]?.providentFund || 0) * 12;

  // Freelance income is generally tax-exempt for IT/software export remittances under Bangladesh IT Ordinance
  const annualFreelanceTotal = incomes
    .filter(i => i.type === 'freelance' && i.date.startsWith(reportYear))
    .reduce((s, i) => s + i.convertedAmount, 0);

  // Progressive Tax Bracket approximation (General Male: 3.5L 0%, next 1L 5%, next 4L 10%, next 5L 15%, etc.)
  const taxableSalary = Math.max(0, annualSalaryGross - Math.min(450000, annualSalaryGross / 3)); // 1/3 or 4.5L exemption
  let estimatedAnnualTaxLiability = 0;

  if (taxableSalary > 350000) {
    let rem = taxableSalary - 350000;
    const slab1 = Math.min(rem, 100000);
    estimatedAnnualTaxLiability += slab1 * 0.05;
    rem -= slab1;

    if (rem > 0) {
      const slab2 = Math.min(rem, 400000);
      estimatedAnnualTaxLiability += slab2 * 0.10;
      rem -= slab2;
    }
    if (rem > 0) {
      const slab3 = Math.min(rem, 500000);
      estimatedAnnualTaxLiability += slab3 * 0.15;
      rem -= slab3;
    }
    if (rem > 0) {
      const slab4 = Math.min(rem, 500000);
      estimatedAnnualTaxLiability += slab4 * 0.20;
      rem -= slab4;
    }
    if (rem > 0) {
      estimatedAnnualTaxLiability += rem * 0.25;
    }
  }

  const handleDownloadReportPdf = () => {
    generateFinancialReportPdf(
      selectedMonthKey,
      monthTotalIncome,
      monthTotalExpense,
      monthNetSavings,
      categorySummary,
      profile
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Financial Reports & Tax Estimation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            P&L Cashflow statements, annual tax brackets, and official PDF/CSV audit reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <select
              value={reportMonth}
              onChange={e => setReportMonth(e.target.value)}
              className="bg-transparent px-2 py-1 outline-none cursor-pointer"
            >
              <option value="08">August</option>
              <option value="07">July</option>
              <option value="06">June</option>
              <option value="05">May</option>
            </select>
            <select
              value={reportYear}
              onChange={e => setReportYear(e.target.value)}
              className="bg-transparent px-2 py-1 outline-none cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <button
            onClick={() => exportTransactionsCsv(incomes, expenses, profile.baseCurrency)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> CSV
          </button>

          <button
            onClick={handleDownloadReportPdf}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
          >
            <FileText className="w-3.5 h-3.5" /> Export PDF Statement
          </button>
        </div>
      </div>

      {/* Monthly Financial Statement Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Month Revenue</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(monthTotalIncome)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{monthlyIncomes.length} income deposits</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Month Outflow</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(monthTotalExpense)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{monthlyExpenses.length} expense items</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Net Month Savings</p>
          <p className={`text-2xl font-black mt-1 ${monthNetSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(monthNetSavings)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Surplus saved</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase text-slate-400">Savings Rate</p>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{monthSavingsRate.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Retained of earned capital</p>
        </div>
      </div>

      {/* Annual Monthly Comparison Chart */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Annual Year-to-Date Cashflow Summary ({reportYear})
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={annualTrendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Savings" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Detailed Category Outflow Distribution ({selectedMonthKey})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">% of Total Expense</th>
                <th className="p-3">Share Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {categorySummary.map(c => (
                <tr key={c.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="p-3 text-right font-extrabold text-slate-900 dark:text-white">{formatCurrency(c.amount)}</td>
                  <td className="p-3 text-right text-slate-500">{c.pct.toFixed(1)}%</td>
                  <td className="p-3 w-48">
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${c.pct}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bangladesh Tax Estimation Module */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Tax Advisory Engine
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              Bangladesh Income Tax (NBR) Liability Estimation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Based on Bangladesh Income Tax Act 2023 for individual resident taxpayers
            </p>
          </div>

          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Annualized Salary Gross</span>
            <p className="text-lg font-black text-white mt-1">{formatCurrency(annualSalaryGross)}</p>
            <p className="text-[10px] text-slate-400 mt-1">Tax exempt threshold: ৳3,50,000</p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Annual Freelance Earnings</span>
            <p className="text-lg font-black text-emerald-400 mt-1">{formatCurrency(annualFreelanceTotal)}</p>
            <p className="text-[10px] text-emerald-400 mt-1">Tax-Exempt IT/Software Export Remittance</p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Est. Annual Salary Tax</span>
            <p className="text-lg font-black text-amber-400 mt-1">{formatCurrency(estimatedAnnualTaxLiability)}</p>
            <p className="text-[10px] text-slate-400 mt-1">Deducted at source (TDS): {formatCurrency(annualSalaryTaxDeducted)}</p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-xs text-slate-300">
          <p className="font-bold text-white mb-1">Tax Return (IT-10B) Filing Note:</p>
          <p className="text-[11px] text-slate-400">
            Foreign remittance through official banking channels/MFS for software development is 100% tax-free under current statutory regulatory orders. All salary tax deducted at source by your employer should be claimed against your tax challan during annual return filing.
          </p>
        </div>
      </div>
    </div>
  );
};
