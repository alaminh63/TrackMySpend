import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Lock,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  Database,
  History,
  Key,
  User,
  Globe,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CurrencyCode } from '../types';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    auditLogs,
    exportFullBackupJson,
    importFullBackupJson,
    resetToInitialData,
    clearAllCategoriesAndBudgets,
    formatCurrency,
  } = useFinance();

  // Profile Form
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(profile.baseCurrency);
  const [timezone, setTimezone] = useState(profile.timezone);

  // PIN Lock Form
  const [isPinLocked, setIsPinLocked] = useState(profile.isPinLocked);
  const [pinCode, setPinCode] = useState(profile.pinCode || '');
  const [newPinInput, setNewPinInput] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      baseCurrency,
      timezone,
      isPinLocked,
      pinCode: isPinLocked ? (newPinInput || pinCode) : undefined,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const success = importFullBackupJson(reader.result as string);
          if (success) {
            setImportStatus('Backup restored successfully!');
          } else {
            setImportStatus('Failed to restore backup: Invalid JSON schema.');
          }
        } catch (err) {
          setImportStatus('Error parsing JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" /> Settings, Security & Data Backup
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure PIN authentication, base currency, JSON export/restore, and audit logs
          </p>
        </div>

        {saveSuccess && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4" /> Preferences saved!
          </span>
        )}
      </div>

      {/* Main Settings Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile & Preferences */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" /> Profile & Base Currency
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Base Currency</label>
                <select
                  value={baseCurrency}
                  onChange={e => setBaseCurrency(e.target.value as CurrencyCode)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
                >
                  <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Save Profile Settings
            </button>
          </form>
        </div>

        {/* Security & PIN Lock */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" /> App Security & PIN Lock Screen
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">Enable 4-Digit Security PIN</p>
                <p className="text-[11px] text-slate-400">Prompts for passcode on launch or after inactivity</p>
              </div>

              <input
                type="checkbox"
                checked={isPinLocked}
                onChange={e => setIsPinLocked(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
            </div>

            {isPinLocked && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Set 4-Digit PIN Code (Current: {pinCode || 'None'})
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter 4 digits (e.g. 1234)"
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value)}
                    className="w-48 text-center text-sm font-mono tracking-widest px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                  <button
                    onClick={() => {
                      if (newPinInput.length >= 4) {
                        setPinCode(newPinInput);
                        updateProfile({ isPinLocked: true, pinCode: newPinInput });
                        setNewPinInput('');
                        alert('New PIN set successfully!');
                      } else {
                        alert('PIN must be at least 4 digits');
                      }
                    }}
                    className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                  >
                    Update PIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backup & Disaster Recovery Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" /> Complete Ledger Backup & JSON Export
        </h3>
        <p className="text-xs text-slate-500">
          Save your complete database containing all accounts, incomes, expenses, loans, invoices, budgets, and investments to an encrypted JSON backup file.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportFullBackupJson}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" /> Download JSON Backup
          </button>

          <label className="px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Restore from JSON File</span>
            <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('আপনি কি পূর্ববর্তী সব ডেমো ক্যাটাগরি ও বাজেট মুছে সম্পূর্ণ ফ্রেশ শুরু করতে চান?')) {
                clearAllCategoriesAndBudgets();
                alert('সব ক্যাটাগরি ও বাজেট মুছে ফেলা হয়েছে। এখন আপনি Budgets ট্যাব থেকে নতুন করে তৈরি করতে পারবেন।');
              }
            }}
            className="px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" /> ক্যাটাগরি ও বাজেট ফ্রেশ রিসেট
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to the default production initial state?')) {
                resetToInitialData();
              }
            }}
            className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset All Initial Demo Data
          </button>
        </div>

        {importStatus && (
          <p className="text-xs font-bold text-emerald-600 pt-1">{importStatus}</p>
        )}
      </div>

      {/* Security Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" /> Security & Modification Audit Trail ({auditLogs.length} Events)
        </h3>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] sticky top-0">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Details / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.action.includes('DELETE') ? 'bg-rose-100 text-rose-700 ' :
                      log.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-700 ' :
                      'bg-sky-100 text-sky-700 '
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{log.entityType}</td>
                  <td className="p-3 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
