import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Mail,
  DollarSign,
  Send,
  Trash2,
  Check,
  FileText,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Client, Invoice, InvoiceItem, CurrencyCode } from '../types';
import { generateInvoicePdf } from '../utils/pdfGenerator';

export const FreelanceView: React.FC<{
  onOpenQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'loan') => void;
}> = () => {
  const {
    clients,
    invoices,
    addClient,
    addInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    formatCurrency,
    profile,
    exchangeRates,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'invoices' | 'clients'>('invoices');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Client form
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCountry, setClientCountry] = useState('United States');
  const [clientCurrency, setClientCurrency] = useState<CurrencyCode>('USD');
  const [clientHourlyRate, setClientHourlyRate] = useState('45');

  // Invoice form
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${String(invoices.length + 1).padStart(3, '0')}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [invoiceCurrency, setInvoiceCurrency] = useState<CurrencyCode>('USD');
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Sprint Development & Code Review', quantity: 30, unitPrice: 45, total: 1350 },
  ]);
  const [invoiceNotes, setInvoiceNotes] = useState('Payment terms: Net 14 days. Wire transfer / Wise details attached.');

  const handleAddLineItem = () => {
    setLineItems(prev => [
      ...prev,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 45, total: 45 },
    ]);
  };

  const handleUpdateLineItem = (idx: number, field: keyof InvoiceItem, val: any) => {
    setLineItems(prev => {
      const copy = [...prev];
      const item = { ...copy[idx], [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        item.total = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      }
      copy[idx] = item;
      return copy;
    });
  };

  const handleRemoveLineItem = (idx: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    addClient({
      name: clientName.trim(),
      email: clientEmail.trim() || undefined,
      country: clientCountry,
      defaultCurrency: clientCurrency,
      hourlyRate: parseFloat(clientHourlyRate) || undefined,
    });

    setShowClientModal(false);
    setClientName('');
    setClientEmail('');
  };

  const invoiceTotalAmount = lineItems.reduce((s, item) => s + (item.total || 0), 0);

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    addInvoice({
      invoiceNumber,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      issueDate,
      dueDate,
      currency: invoiceCurrency,
      items: lineItems,
      totalAmount: invoiceTotalAmount,
      status: 'Sent',
      notes: invoiceNotes,
    });

    setShowInvoiceModal(false);
  };

  const handleDownloadPdf = (inv: Invoice) => {
    generateInvoicePdf(inv, profile);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" /> Freelance, Clients & Invoicing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Client billing records, automated invoice generation, and 1-click PDF exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowClientModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Building className="w-3.5 h-3.5 text-emerald-500" /> Add Client
          </button>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
          >
            <Plus className="w-3.5 h-3.5" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'invoices' ? 'bg-white  text-slate-900  font-bold shadow-xs' : 'text-slate-600 '
          }`}
        >
          Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'clients' ? 'bg-white  text-slate-900  font-bold shadow-xs' : 'text-slate-600 '
          }`}
        >
          Clients Directory ({clients.length})
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">Issued / Due</th>
                  <th className="p-3.5 text-right">Total Amount</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No invoices created yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map(inv => {
                    const isPaid = inv.status === 'Paid';
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{inv.clientName}</p>
                          <p className="text-[11px] text-slate-400">{inv.clientEmail || 'No email'}</p>
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          <p>{inv.issueDate}</p>
                          <p className="text-[10px] text-amber-500">Due: {inv.dueDate}</p>
                        </td>
                        <td className="p-3.5 text-right">
                          <p className="font-extrabold text-slate-900 text-sm">
                            {inv.currency} {inv.totalAmount.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-semibold">
                            ≈ {formatCurrency(inv.totalAmount * (exchangeRates[inv.currency] || 1))}
                          </p>
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-700  '
                                : inv.status === 'Sent'
                                ? 'bg-sky-100 text-sky-700 '
                                : inv.status === 'Overdue'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDownloadPdf(inv)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                              title="Download PDF"
                            >
                              <Download className="w-3 h-3 text-emerald-500" /> PDF
                            </button>

                            {!isPaid && (
                              <button
                                onClick={() => updateInvoiceStatus(inv.id, 'Paid')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Mark Paid
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                                  deleteInvoice(inv.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <div
              key={client.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{client.name}</h4>
                    <p className="text-[11px] text-slate-400">{client.country || 'Global Client'}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 my-3">
                  {client.email && (
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {client.email}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Default Rate: {client.defaultCurrency} {client.hourlyRate}/hr
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400">Currency: {client.defaultCurrency}</span>
                <button
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setInvoiceCurrency(client.defaultCurrency);
                    setShowInvoiceModal(true);
                  }}
                  className="text-emerald-600 font-bold hover:text-emerald-700"
                >
                  Create Invoice →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <form onSubmit={handleSaveClient} className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Freelance Client</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Client Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Nexus Cloud Labs"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Email</label>
              <input
                type="email"
                placeholder="billing@client.com"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={clientCountry}
                  onChange={e => setClientCountry(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Currency</label>
                <select
                  value={clientCurrency}
                  onChange={e => setClientCurrency(e.target.value as CurrencyCode)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (AED)</option>
                  <option value="BDT">BDT (৳)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Rate</label>
              <input
                type="number"
                value={clientHourlyRate}
                onChange={e => setClientHourlyRate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save Client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <form onSubmit={handleSaveInvoice} className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-4 my-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">Create Freelance Invoice</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client *</label>
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.defaultCurrency})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Number *</label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                <select
                  value={invoiceCurrency}
                  onChange={e => setInvoiceCurrency(e.target.value as CurrencyCode)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (AED)</option>
                  <option value="BDT">BDT (৳)</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">Invoice Items</label>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-xs text-emerald-600 font-bold hover:text-emerald-700"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Description of work"
                        value={item.description}
                        onChange={e => handleUpdateLineItem(idx, 'description', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Qty/Hrs"
                        value={item.quantity}
                        onChange={e => handleUpdateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.unitPrice}
                        onChange={e => handleUpdateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{item.total}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-right pt-2 text-sm font-extrabold text-slate-900">
                Total: {invoiceCurrency} {invoiceTotalAmount.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Instructions & Notes</label>
              <textarea
                rows={2}
                value={invoiceNotes}
                onChange={e => setInvoiceNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Generate & Save Invoice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
