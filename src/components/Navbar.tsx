import React, { useState } from 'react';
import {
  Wallet,
  Bell,
  Plus,
  Lock,
  Search,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCheck,
  ExternalLink,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const Navbar: React.FC<{
  onOpenQuickAdd: () => void;
  onOpenCurrencyConverter: () => void;
  onSelectTab: (tab: string) => void;
  onToggleMobileMenu: () => void;
}> = ({ onOpenQuickAdd, onOpenCurrencyConverter, onSelectTab, onToggleMobileMenu }) => {
  const {
    profile,
    netWorth,
    formatCurrency,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    lockApp,
  } = useFinance();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Finance<span className="text-emerald-600 dark:text-emerald-400">Core</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {profile.baseCurrency}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Production Personal Wealth Manager</p>
            </div>
          </button>
        </div>

        {/* Center Net Worth Pill */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => onSelectTab('accounts')}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition"
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Total Net Worth:
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(netWorth)}
            </span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-Currency Converter button */}
          <button
            onClick={() => onSelectTab('daily-expense')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 text-xs font-bold transition"
            title="Daily Micro Expense Tracker"
          >
            <span className="text-amber-500 font-black">⚡</span>
            <span>দৈনিক খরচ</span>
          </button>

          <button
            onClick={onOpenCurrencyConverter}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 text-xs font-semibold"
            title="Currency Rates & Converter"
          >
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">FX</span>
          </button>

          {/* Notifications Drawer */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 relative"
              title="Notifications & Reminders"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-emerald-500" /> Alerts & Reminders ({notifications.length})
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 my-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No alerts at this time.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkTab) {
                            onSelectTab(n.linkTab);
                            setShowNotifications(false);
                          }
                        }}
                        className={`py-2.5 px-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition ${
                          !n.isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>

          {/* PIN Lock Button */}
          {profile.isPinLocked && (
            <button
              onClick={lockApp}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700/80"
              title="Lock Application Now"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* User Profile Pill */}
          <button
            onClick={() => onSelectTab('settings')}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="User Profile & Settings"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              {profile.name.charAt(0)}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden lg:inline">
              {profile.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
