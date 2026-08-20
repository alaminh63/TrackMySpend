import { UserRole, UserPermissions } from '../types';

export const ROLE_DEFINITIONS: Record<
  UserRole,
  {
    name: string;
    bengaliName: string;
    description: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    color: string;
  }
> = {
  admin: {
    name: 'Super Admin (Owner)',
    bengaliName: 'সুপার অ্যাডমিন (মালিক)',
    description: 'Full access: Can create, update, delete any financial record, manage users & change roles, adjust security & PIN settings, and clear trash.',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200/80',
    color: '#059669',
  },
  manager: {
    name: 'Financial Manager',
    bengaliName: 'ফাইন্যান্স ম্যানেজার (হিসাবরক্ষক)',
    description: 'Operational access: Can manage daily expenses, income, salary, budgets, accounts, loans, and investments. Cannot modify user roles or security settings.',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200/80',
    color: '#2563eb',
  },
  viewer: {
    name: 'Family Contributor (Viewer)',
    bengaliName: 'পারিবারিক সদস্য (ভিউয়ার)',
    description: 'Standard access: Can log daily family expenses and view budgets/goals. Cannot edit salaries, investments, bank accounts, or system settings.',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200/80',
    color: '#d97706',
  },
  auditor: {
    name: 'Audit & Tax Specialist',
    bengaliName: 'অডিট ও ট্যাক্স স্পেশালিস্ট',
    description: 'Audit access: Read-only access to all income, expenses, accounts, audit trails, and tax calculation engines. Can export official PDF/CSV statements.',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200/80',
    color: '#9333ea',
  },
};

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canAddExpense: true,
    canEditExpense: true,
    canDeleteExpense: true,
    canManageIncomeSalary: true,
    canManageBudgets: true,
    canManageAccounts: true,
    canManageLoans: true,
    canManageInvestments: true,
    canManageInvoices: true,
    canExportReports: true,
    canManageUsersAndRoles: true,
    canManageSettings: true,
    canEmptyTrash: true,
  },
  manager: {
    canAddExpense: true,
    canEditExpense: true,
    canDeleteExpense: true,
    canManageIncomeSalary: true,
    canManageBudgets: true,
    canManageAccounts: true,
    canManageLoans: true,
    canManageInvestments: true,
    canManageInvoices: true,
    canExportReports: true,
    canManageUsersAndRoles: false,
    canManageSettings: false,
    canEmptyTrash: false,
  },
  viewer: {
    canAddExpense: true, // Can log daily family expenses
    canEditExpense: true,
    canDeleteExpense: false,
    canManageIncomeSalary: false,
    canManageBudgets: false,
    canManageAccounts: false,
    canManageLoans: false,
    canManageInvestments: false,
    canManageInvoices: false,
    canExportReports: false,
    canManageUsersAndRoles: false,
    canManageSettings: false,
    canEmptyTrash: false,
  },
  auditor: {
    canAddExpense: false,
    canEditExpense: false,
    canDeleteExpense: false,
    canManageIncomeSalary: false,
    canManageBudgets: false,
    canManageAccounts: false,
    canManageLoans: false,
    canManageInvestments: false,
    canManageInvoices: false,
    canExportReports: true,
    canManageUsersAndRoles: false,
    canManageSettings: false,
    canEmptyTrash: false,
  },
};

export function getRolePermissions(role: UserRole): UserPermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
}

export function hasPermission(role: UserRole, permission: keyof UserPermissions): boolean {
  const perms = getRolePermissions(role);
  return perms[permission] === true;
}
