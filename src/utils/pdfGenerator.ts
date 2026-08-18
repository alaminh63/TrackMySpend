import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Income, Expense, UserProfile } from '../types';

export function exportInvoicePdf(invoice: Invoice, profile: UserProfile) {
  const doc = new jsPDF();
  const currencySymbol = invoice.currency === 'BDT' ? 'BDT ' : invoice.currency === 'USD' ? '$' : invoice.currency === 'EUR' ? 'EUR ' : `${invoice.currency} `;

  // Header Brand & Title
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 38, 'F');

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', 14, 24);

  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(invoice.invoiceNumber, 14, 32);

  // Status Badge in Header
  const statusColor: [number, number, number] = invoice.status === 'Paid' ? [34, 197, 94] : invoice.status === 'Sent' ? [59, 130, 246] : [234, 179, 8];
  doc.setFillColor(...statusColor);
  doc.roundedRect(160, 16, 36, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(invoice.status.toUpperCase(), 178, 24, { align: 'center' });

  // From (Issuer) Details
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('FROM:', 14, 50);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.name, 14, 56);
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(profile.email, 14, 62);
  doc.text(`Dhaka, Bangladesh (${profile.timezone})`, 14, 67);

  // Bill To (Client) Details
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO:', 120, 50);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.clientName, 120, 56);
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  if (invoice.clientEmail) doc.text(invoice.clientEmail, 120, 62);
  if (invoice.clientAddress) {
    const splitAddr = doc.splitTextToSize(invoice.clientAddress, 75);
    doc.text(splitAddr, 120, 67);
  }

  // Invoice Dates
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 82, 196, 82);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Issue Date:', 14, 90);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.issueDate, 40, 90);

  doc.setTextColor(100, 116, 139);
  doc.text('Due Date:', 80, 90);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.dueDate, 105, 90);

  doc.setTextColor(100, 116, 139);
  doc.text('Currency:', 145, 90);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.currency, 168, 90);

  // Table of Items
  const tableRows = invoice.items.map((item, idx) => [
    idx + 1,
    item.description,
    item.quantity.toString(),
    `${currencySymbol}${item.unitPrice.toFixed(2)}`,
    `${currencySymbol}${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 98,
    head: [['#', 'Description', 'Qty / Hrs', 'Unit Price', 'Total']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 95 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    styles: { fontSize: 9, cellPadding: 4 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Subtotal & Total Box
  const subtotalVal = invoice.subtotal || invoice.totalAmount || 0;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', 135, finalY);
  doc.setTextColor(15, 23, 42);
  doc.text(`${currencySymbol}${subtotalVal.toFixed(2)}`, 196, finalY, { align: 'right' });

  let offset = finalY + 7;
  if (invoice.discountPercent && invoice.discountPercent > 0) {
    doc.setTextColor(71, 85, 105);
    doc.text(`Discount (${invoice.discountPercent}%):`, 135, offset);
    const discAmount = (subtotalVal * invoice.discountPercent) / 100;
    doc.setTextColor(239, 68, 68);
    doc.text(`-${currencySymbol}${discAmount.toFixed(2)}`, 196, offset, { align: 'right' });
    offset += 7;
  }

  if (invoice.taxPercent && invoice.taxPercent > 0) {
    doc.setTextColor(71, 85, 105);
    doc.text(`Tax (${invoice.taxPercent}%):`, 135, offset);
    const taxAmount = (subtotalVal * invoice.taxPercent) / 100;
    doc.setTextColor(15, 23, 42);
    doc.text(`+${currencySymbol}${taxAmount.toFixed(2)}`, 196, offset, { align: 'right' });
    offset += 7;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(135, offset, 196, offset);
  offset += 6;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Total Amount:', 135, offset);
  doc.setTextColor(16, 185, 129);
  doc.text(`${currencySymbol}${invoice.totalAmount.toFixed(2)}`, 196, offset, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  // Notes & Payment Instructions
  if (invoice.paymentInstructions || invoice.notes) {
    const bottomY = Math.max(offset + 15, finalY + 15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Payment Instructions & Notes:', 14, bottomY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);

    let textY = bottomY + 5;
    if (invoice.paymentInstructions) {
      const splitPay = doc.splitTextToSize(invoice.paymentInstructions, 115);
      doc.text(splitPay, 14, textY);
      textY += splitPay.length * 4.5;
    }
    if (invoice.notes) {
      const splitNotes = doc.splitTextToSize(invoice.notes, 115);
      doc.text(splitNotes, 14, textY);
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by Personal Finance Manager', 105, 285, { align: 'center' });

  doc.save(`${invoice.invoiceNumber}-${invoice.clientName.replace(/\s+/g, '_')}.pdf`);
}

export const generateInvoicePdf = exportInvoicePdf;

export function generateFinancialReportPdf(
  period: string,
  totalIncome: number,
  totalExpense: number,
  netSavings: number,
  categorySummary: { name: string; amount: number; pct: number }[],
  profile: UserProfile
) {
  exportFinancialReportPdf({
    title: 'Monthly Cash Flow & Income Statement',
    period,
    profile,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate: totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0,
    incomes: [],
    expenses: [],
    categorySummary: categorySummary.map(c => ({ category: c.name, amount: c.amount, percent: c.pct })),
  });
}

export function exportFinancialReportPdf({
  title,
  period,
  profile,
  totalIncome,
  totalExpense,
  netSavings,
  savingsRate,
  incomes,
  expenses,
  categorySummary,
}: {
  title: string;
  period: string;
  profile: UserProfile;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  incomes: Income[];
  expenses: Expense[];
  categorySummary: { category: string; amount: number; percent: number }[];
}) {
  const doc = new jsPDF();
  const curr = profile.baseCurrency;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Personal Financial Performance Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(`${title} | Period: ${period} | Currency: ${curr}`, 14, 28);
  doc.text(`User: ${profile.name}`, 196, 28, { align: 'right' });

  // Summary Metrics Box
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);

  const metricsY = 46;
  // Income card
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, metricsY, 42, 24, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text('TOTAL INCOME', 18, metricsY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${curr} ${totalIncome.toLocaleString()}`, 18, metricsY + 18);

  // Expense card
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(60, metricsY, 42, 24, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(153, 27, 27);
  doc.text('TOTAL EXPENSE', 64, metricsY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${curr} ${totalExpense.toLocaleString()}`, 64, metricsY + 18);

  // Net Savings
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(106, metricsY, 46, 24, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 64, 175);
  doc.text('NET SAVINGS', 110, metricsY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${curr} ${netSavings.toLocaleString()}`, 110, metricsY + 18);

  // Savings Rate
  doc.setFillColor(250, 245, 255);
  doc.roundedRect(156, metricsY, 40, 24, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 33, 168);
  doc.text('SAVINGS RATE', 160, metricsY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${savingsRate.toFixed(1)}%`, 160, metricsY + 18);
  doc.setFont('helvetica', 'normal');

  // Category Breakdown Table
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Spending by Category', 14, 80);
  doc.setFont('helvetica', 'normal');

  const catRows = categorySummary.map(c => [
    c.category,
    `${curr} ${c.amount.toLocaleString()}`,
    `${c.percent.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: 84,
    head: [['Category', `Amount (${curr})`, '% of Total']],
    body: catRows,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50, halign: 'right' },
      2: { cellWidth: 32, halign: 'right' },
    },
    styles: { fontSize: 8.5, cellPadding: 3 },
  });

  const nextY = (doc as any).lastAutoTable.finalY + 12;

  // Recent Incomes Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Income Transactions Record', 14, nextY);
  doc.setFont('helvetica', 'normal');

  const incRows = incomes.map(i => [
    i.date,
    i.type.toUpperCase(),
    i.source,
    i.paymentPlatform || '-',
    `${i.currency} ${i.amount.toLocaleString()}`,
    `${curr} ${i.convertedAmount.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    head: [['Date', 'Type', 'Source', 'Platform', 'Original Amt', `Converted (${curr})`]],
    body: incRows,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 22 },
      2: { cellWidth: 60 },
      3: { cellWidth: 25 },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
    },
    styles: { fontSize: 8, cellPadding: 2.5 },
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on ${new Date().toLocaleDateString()} | Personal Finance Manager`, 105, 285, { align: 'center' });

  doc.save(`Finance-Report-${period.replace(/\s+/g, '_')}.pdf`);
}

export function exportTransactionsCsv(incomes: Income[], expenses: Expense[], baseCurrency: string) {
  const rows: string[][] = [
    ['Transaction ID', 'Type', 'Date', 'Category / Source', 'Original Amount', 'Currency', 'Exchange Rate', `Amount in ${baseCurrency}`, 'Payment Method / Platform', 'Status / SubCategory', 'Notes'],
  ];

  incomes.forEach(i => {
    rows.push([
      i.id,
      'Income',
      i.date,
      `"${(i.source || '').replace(/"/g, '""')}"`,
      i.amount.toString(),
      i.currency,
      i.exchangeRate.toString(),
      i.convertedAmount.toString(),
      `"${i.paymentPlatform || ''}"`,
      i.status,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
    ]);
  });

  expenses.forEach(e => {
    rows.push([
      e.id,
      'Expense',
      e.date,
      `"${e.categoryName}"`,
      e.amount.toString(),
      e.currency,
      e.exchangeRate.toString(),
      e.convertedAmount.toString(),
      `"${e.paymentMethod}"`,
      `"${e.subCategoryName || ''}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Transactions_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
