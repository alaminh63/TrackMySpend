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
  Users,
  LogOut,
  UserCircle2,
  Shield,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ROLE_DEFINITIONS } from '../utils/rbac';

export const Navbar: React.FC<{
  onOpenQuickAdd: () => void;
  onOpenCurrencyConverter: () => void;
  onSelectTab: (tab: string) => void;
  onToggleMobileMenu: () => void;
}> = ({ onOpenQuickAdd, onOpenCurrencyConverter, onSelectTab, onToggleMobileMenu }) => {
  const {
    profile,
    currentUser,
    users,
    switchUser,
    logout,
    netWorth,
    formatCurrency,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    lockApp,
    setAuthModalOpen,
  } = useFinance();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const roleDef = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.viewer;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight text-slate-900">
                  Finance<span className="text-emerald-600">Core</span>
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {profile.baseCurrency}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal hidden sm:block">Production Personal Wealth Manager</p>
            </div>
          </button>
        </div>

        {/* Center Net Worth Pill */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => onSelectTab('accounts')}
            className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 hover:border-emerald-300 transition"
          >
            <span className="text-xs font-normal text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Total Net Worth:
            </span>
            <span className="text-sm font-semibold text-slate-900 font-mono">
              {formatCurrency(netWorth)}
            </span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Micro Expense Tracker button */}
          <button
            onClick={() => onSelectTab('daily-expense')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/80 flex items-center gap-1.5 text-xs font-medium transition"
            title="Daily Micro Expense Tracker"
          >
            <span className="text-amber-600">⚡</span>
            <span>দৈনিক খরচ</span>
          </button>

          <button
            onClick={onOpenCurrencyConverter}
            className="px-3 py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 text-xs font-medium"
            title="Currency Rates & Converter"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">FX Rates</span>
          </button>

          {/* Notifications Drawer */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 relative"
              title="Notifications & Reminders"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
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

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 my-2">
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
                        className={`py-2.5 px-1.5 cursor-pointer hover:bg-slate-50 rounded-lg transition ${
                          !n.isRead ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
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
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>

          {/* PIN Lock Button */}
          {profile.isPinLocked && (
            <button
              onClick={lockApp}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
              title="Lock Application Now"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* User Account & Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              title="User Profile & Role Settings"
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.name.split(' ')[0]}
                </p>
                <span className={`text-[10px] font-semibold ${roleDef.badgeText}`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
                {/* Active User Header */}
                <div className="p-2.5 bg-slate-50 rounded-xl mb-2 flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold mt-1 ${roleDef.badgeBg} ${roleDef.badgeText} border ${roleDef.badgeBorder}`}>
                      {roleDef.name}
                    </span>
                  </div>
                </div>

                {/* Quick Role Switcher */}
                <div className="mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                    Switch Test Account (RBAC)
                  </span>
                  <div className="space-y-1">
                    {users.map(u => {
                      const isCurrent = u.id === currentUser.id;
                      const uDef = ROLE_DEFINITIONS[u.role];
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full p-1.5 rounded-lg text-left text-xs flex items-center justify-between transition ${
                            isCurrent ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img
                              src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="truncate">{u.name.split(' ')[0]}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${uDef.badgeBg} ${uDef.badgeText}`}>
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <button
                    onClick={() => {
                      onSelectTab('security-users');
                      setShowUserMenu(false);
                    }}
                    className="w-full py-2 px-2.5 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Roles & Security Matrix</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full py-2 px-2.5 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                  >
                    <UserCircle2 className="w-4 h-4 text-slate-500" />
                    <span>Profile Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full py-2 px-2.5 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Login with another account</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full py-2 px-2.5 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

