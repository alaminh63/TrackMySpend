import React from 'react';
import { X, Download, FileText } from 'lucide-react';

export const ReceiptModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  receiptUrl?: string;
  receiptName?: string;
}> = ({ isOpen, onClose, receiptUrl, receiptName }) => {
  if (!isOpen || !receiptUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {receiptName || 'Expense Receipt Attachment'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={receiptUrl}
              download={receiptName || 'receipt.png'}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center gap-1 text-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-auto flex items-center justify-center bg-slate-50">
          <img
            src={receiptUrl}
            alt="Receipt"
            referrerPolicy="no-referrer"
            className="max-h-[70vh] object-contain rounded-lg border border-slate-200 shadow-md"
          />
        </div>
      </div>
    </div>
  );
};
