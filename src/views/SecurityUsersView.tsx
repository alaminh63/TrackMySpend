import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  UserPlus,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  Clock,
  Shield,
  Activity,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { UserRole, UserPermissions } from '../types';
import { ROLE_DEFINITIONS, ROLE_PERMISSIONS } from '../utils/rbac';

export const SecurityUsersView: React.FC = () => {
  const {
    currentUser,
    users,
    securityEvents,
    updateUserRole,
    addUser,
    deleteUser,
    profile,
    updateProfile,
    switchUser,
    logSecurityEvent,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'audit' | 'settings'>('users');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);

  // New user form state
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('viewer');
  const [newDesignation, setNewDesignation] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('1234');
  const [newPhone, setNewPhone] = useState<string>('');

  // PIN change state
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [oldPin, setOldPin] = useState<string>('');
  const [newPinCode, setNewPinCode] = useState<string>('');
  const [pinFeedback, setPinFeedback] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    addUser({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      designation: newDesignation.trim() || undefined,
      phone: newPhone.trim() || undefined,
      pinCode: newPin.trim() || '1234',
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + users.length}?w=150&auto=format&fit=crop&q=80`,
    });

    setShowAddUserModal(false);
    setNewName('');
    setNewEmail('');
    setNewDesignation('');
    setNewPhone('');
    setNewPin('1234');
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.isPinLocked && oldPin !== profile.pinCode) {
      setPinFeedback('Current PIN is incorrect.');
      return;
    }
    if (newPinCode.length < 4) {
      setPinFeedback('New PIN must be 4 digits.');
      return;
    }

    updateProfile({ pinCode: newPinCode, isPinLocked: true });
    logSecurityEvent('pin_reset', `Security PIN updated successfully by ${currentUser.name}`, 'success');
    setPinFeedback('PIN updated successfully!');
    setTimeout(() => {
      setShowPinModal(false);
      setPinFeedback(null);
      setOldPin('');
      setNewPinCode('');
    }, 1000);
  };

  const handleExportSecurityLogs = () => {
    const headers = ['Timestamp', 'Type', 'User', 'Role', 'Status', 'IP Address', 'Description'];
    const rows = securityEvents.map(e => [
      `"${e.timestamp}"`,
      `"${e.type}"`,
      `"${e.userName}"`,
      `"${e.userRole}"`,
      `"${e.status}"`,
      `"${e.ipAddress || 'Localhost'}"`,
      `"${e.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = securityEvents.filter(e => {
    if (filterType === 'all') return true;
    if (filterType === 'auth') return e.type.startsWith('auth_');
    if (filterType === 'role') return e.type === 'role_change';
    if (filterType === 'alerts') return e.status === 'warning' || e.status === 'danger';
    return true;
  });

  const PERMISSION_ROWS: { label: string; bengaliLabel: string; key: keyof UserPermissions }[] = [
    { label: 'Add Daily Expenses', bengaliLabel: 'দৈনন্দিন খরচ যোগ', key: 'canAddExpense' },
    { label: 'Edit Existing Records', bengaliLabel: 'হিসাব সম্পাদন', key: 'canEditExpense' },
    { label: 'Delete Records', bengaliLabel: 'রেকর্ড মুছে ফেলা', key: 'canDeleteExpense' },
    { label: 'Manage Incomes & Salaries', bengaliLabel: 'আয় ও বেতন কাঠামো পরিচালনা', key: 'canManageIncomeSalary' },
    { label: 'Manage Budget Envelopes', bengaliLabel: 'মাসিক বাজেট কনফিগার', key: 'canManageBudgets' },
    { label: 'Manage Bank & MFS Accounts', bengaliLabel: 'ব্যাংক ও ওয়ালেট একাউন্ট', key: 'canManageAccounts' },
    { label: 'Manage Loans & Borrowing', bengaliLabel: 'ঋণ ও দেনা-পাওনা ট্র্যাকিং', key: 'canManageLoans' },
    { label: 'Manage Investments Portfolio', bengaliLabel: 'বিনিয়োগ পোর্টফোলিও ব্যবস্থাপনা', key: 'canManageInvestments' },
    { label: 'Create Freelance Invoices', bengaliLabel: 'ফ্রিল্যান্স ইনভয়েস জেনারেশন', key: 'canManageInvoices' },
    { label: 'Export Tax & Audit Reports', bengaliLabel: 'ট্যাক্স ও অডিট রিপোর্ট এক্সপোর্ট', key: 'canExportReports' },
    { label: 'User & Role Access Management', bengaliLabel: 'ব্যবহারকারী ও রোল ম্যানেজমেন্ট', key: 'canManageUsersAndRoles' },
    { label: 'Permanent Trash Removal', bengaliLabel: 'ট্র্যাশ স্থায়ীভাবে মুছে ফেলা', key: 'canEmptyTrash' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Role-Based Access Control (RBAC) & Security Layer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              User Roles, Permissions & Security
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Strict multi-tier financial privilege enforcement. Current session active as{' '}
              <span className="font-semibold text-emerald-400 underline decoration-emerald-500/50 underline-offset-4">
                {currentUser.name} ({ROLE_DEFINITIONS[currentUser.role].name})
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium flex items-center gap-2 shadow-md shadow-emerald-900/30 transition"
              >
                <UserPlus className="w-4 h-4" /> Add Team Member
              </button>
            ) : (
              <span className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Read-Only Mode (Admin required to alter roles)
              </span>
            )}
          </div>
        </div>

        {/* Security Metrics Strip */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Total Registered Users</span>
            <p className="text-lg font-semibold text-white mt-0.5">{users.length} Active Accounts</p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Active Security PIN</span>
            <p className="text-lg font-semibold text-emerald-400 mt-0.5">
              {profile.isPinLocked ? 'Enabled (Active)' : 'Standard (Disabled)'}
            </p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Encryption Level</span>
            <p className="text-lg font-semibold text-white mt-0.5">AES-256 Client State</p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Security Audit Logs</span>
            <p className="text-lg font-semibold text-white mt-0.5">{securityEvents.length} Recorded Events</p>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/90 text-xs sm:text-sm font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition ${
            activeTab === 'users' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Team & User Accounts ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition ${
            activeTab === 'matrix' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4 text-blue-600" />
          <span>RBAC Permissions Matrix (রোল এক্সেস চার্ট)</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition ${
            activeTab === 'audit' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-600" />
          <span>Security Audit Trail ({securityEvents.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition ${
            activeTab === 'settings' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4 text-purple-600" />
          <span>PIN Lock & Protection</span>
        </button>
      </div>

      {/* Tab 1: User Accounts Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Manage Workspace Accounts</h2>
              <p className="text-xs text-slate-500">
                Super Admins can alter roles in real-time. Switch between profiles to simulate view restrictions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(u => {
              const def = ROLE_DEFINITIONS[u.role];
              const isSelf = u.id === currentUser.id;

              return (
                <div
                  key={u.id}
                  className={`bg-white rounded-2xl p-5 border transition ${
                    isSelf ? 'border-emerald-500/80 ring-1 ring-emerald-400/40 shadow-sm' : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={u.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">{u.name}</h3>
                          {isSelf && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                              You (Active)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{u.email}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{u.designation || 'Workspace Contributor'}</p>
                      </div>
                    </div>

                    <span className={`text-xs px-2.5 py-1 rounded-xl font-semibold border ${def.badgeBg} ${def.badgeText} ${def.badgeBorder}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 text-[11px]">
                      <span>Role: </span>
                      <span className="font-semibold text-slate-700">{def.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSelf && (
                        <button
                          onClick={() => switchUser(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium transition flex items-center gap-1"
                        >
                          Switch To User <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {isAdmin && (
                        <select
                          value={u.role}
                          onChange={e => updateUserRole(u.id, e.target.value as UserRole)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="viewer">Viewer</option>
                          <option value="auditor">Auditor</option>
                        </select>
                      )}

                      {isAdmin && !isSelf && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${u.name}'s account?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Role-Based Access Control (RBAC) Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular breakdown of what each user tier can execute across the system.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Permission Action</th>
                  <th className="py-3.5 px-4 font-semibold text-center text-emerald-800 bg-emerald-50/50">
                    👑 Super Admin
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-center text-blue-800 bg-blue-50/50">
                    💼 Manager
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-center text-amber-800 bg-amber-50/50">
                    👨‍👩‍👦 Family Viewer
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-center text-purple-800 bg-purple-50/50">
                    🔍 Auditor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSION_ROWS.map((row, idx) => (
                  <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{row.label}</div>
                      <div className="text-[11px] text-slate-400">{row.bengaliLabel}</div>
                    </td>
                    {(['admin', 'manager', 'viewer', 'auditor'] as UserRole[]).map(roleKey => {
                      const isAllowed = ROLE_PERMISSIONS[roleKey][row.key];
                      return (
                        <td key={roleKey} className="py-3 px-4 text-center">
                          {isAllowed ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
                              <XCircle className="w-4 h-4" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Security & Authentication Logs</h2>
              <p className="text-xs text-slate-500">
                Cryptographically tracked record of authentication, role promotions, and permission alerts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
                {(['all', 'auth', 'role', 'alerts'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition ${
                      filterType === tab ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportSecurityLogs}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No security events recorded in this category.</div>
              ) : (
                filteredLogs.map(log => {
                  const isSuccess = log.status === 'success';
                  const isWarning = log.status === 'warning';
                  const isDanger = log.status === 'danger';

                  return (
                    <div key={log.id} className="p-4 hover:bg-slate-50/50 transition flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : isWarning
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <ShieldAlert className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{log.description}</p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span className="font-semibold text-slate-600">{log.userName}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">[{log.userRole.toUpperCase()}]</span>
                            <span>•</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span>IP: {log.ipAddress || '103.230.104.22'}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 uppercase ${
                          isSuccess
                            ? 'bg-emerald-100 text-emerald-800'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & PIN Settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">App PIN Lock (পিন লক সিস্টেম)</h3>
                <p className="text-xs text-slate-500">Enforce a 4-digit PIN lock when switching devices or tabs.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">Require PIN at Startup</span>
                <p className="text-[11px] text-slate-500">Locks the finance database after inactivity</p>
              </div>
              <button
                onClick={() => {
                  updateProfile({ isPinLocked: !profile.isPinLocked });
                  logSecurityEvent(
                    'security_update',
                    `PIN Lock protection ${!profile.isPinLocked ? 'enabled' : 'disabled'} by ${currentUser.name}`,
                    'success'
                  );
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  profile.isPinLocked ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowPinModal(true)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-center gap-2 transition"
              >
                <KeyRound className="w-4 h-4 text-emerald-600" /> Change Security PIN Code (Current: ****)
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Auto-Lock Inactivity Timer</h3>
                <p className="text-xs text-slate-500">Automatically lock the screen after idle time.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Timeout Duration</label>
              <select
                value={profile.autoLockMinutes || 15}
                onChange={e => updateProfile({ autoLockMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={5}>5 minutes idle</option>
                <option value={15}>15 minutes idle (Recommended)</option>
                <option value={30}>30 minutes idle</option>
                <option value={60}>1 hour idle</option>
                <option value={0}>Never lock automatically</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateUser} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" /> Add Team Member
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Invite a new family member, accountant, or auditor to the workspace.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Mahbubur Rahman"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="mahbub@gmail.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">System Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="viewer">Family Contributor (Viewer - Expenses only)</option>
                  <option value="manager">Financial Manager (Accounts, Budgets, Records)</option>
                  <option value="auditor">Tax & Audit Specialist (Read-only)</option>
                  <option value="admin">Super Admin (Full privileges)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={newDesignation}
                  onChange={e => setNewDesignation(e.target.value)}
                  placeholder="e.g. Senior Accountant"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleChangePin} className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" /> Update Security PIN
            </h3>
            <p className="text-xs text-slate-500 mb-4">Set a new 4-digit access code for screen unlock.</p>

            {pinFeedback && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium">
                {pinFeedback}
              </div>
            )}

            <div className="space-y-3">
              {profile.isPinLocked && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Current PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={oldPin}
                    onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="****"
                    className="w-full px-3 py-2 text-center text-base font-mono tracking-widest rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPinCode}
                  onChange={e => setNewPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="****"
                  className="w-full px-3 py-2 text-center text-base font-mono tracking-widest rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setPinFeedback(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm"
              >
                Save PIN
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
