import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { SalesInvoice } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Printer, Download, Send, DollarSign, XCircle, Copy } from 'lucide-react';
import { PaymentInModal } from './PaymentInModal';
import { exportReportToPDF, printReportHtml } from '../../utils/reportExporter';

interface InvoiceDetailModalProps {
  invoice: SalesInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onDuplicate?: (inv: SalesInvoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onDuplicate
}) => {
  const {
    currentBusiness,
    invoiceSettings,
    cancelSalesInvoice,
    formatCurrency,
    addToast
  } = useApp();

  const [isRecordPayOpen, setIsRecordPayOpen] = useState(false);

  if (!invoice) return null;

  const getInvoiceExportOptions = () => ({
    businessName: currentBusiness.name || 'Alfatechlink Business',
    businessAddress: [currentBusiness.address, currentBusiness.city, currentBusiness.country].filter(Boolean).join(', '),
    businessTaxId: currentBusiness.taxNumber,
    reportTitle: `Tax Invoice: ${invoice.invoiceNumber}`,
    startDate: invoice.date,
    endDate: invoice.dueDate,
    filenamePrefix: `Invoice_${invoice.invoiceNumber}`,
    headers: ['Item Description', 'Qty', 'Unit', 'Unit Price', 'Tax %', 'Line Total'],
    rows: invoice.items.map(it => [
      it.itemName,
      it.quantity,
      it.unit,
      formatCurrency(it.rate),
      `${it.taxRate}%`,
      formatCurrency(it.amount)
    ]),
    columnAlignments: ['left', 'center', 'center', 'right', 'right', 'right'] as const,
    summaryRows: [
      { label: 'Subtotal', value: formatCurrency(invoice.subtotal) },
      { label: 'Tax Amount', value: formatCurrency(invoice.taxTotal) },
      { label: 'Total Invoiced Amount', value: formatCurrency(invoice.total) },
      { label: 'Total Amount Paid', value: formatCurrency(invoice.paidAmount) },
      { label: 'Balance Due', value: formatCurrency(invoice.balance) }
    ]
  });

  const handlePrint = () => {
    try {
      printReportHtml(getInvoiceExportOptions());
      addToast({ type: 'info', title: 'Print Dialog Initialized', message: `Printing invoice ${invoice.invoiceNumber}.` });
    } catch {
      window.print();
    }
  };

  const handleDownload = () => {
    try {
      exportReportToPDF(getInvoiceExportOptions());
      addToast({ type: 'success', title: 'Invoice PDF Downloaded', message: `Downloaded PDF for ${invoice.invoiceNumber}.` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'PDF Export Failed', message: 'Could not generate invoice PDF.' });
    }
  };

  const handleSend = () => {
    addToast({
      type: 'success',
      title: 'Invoice Sent',
      message: `Invoice ${invoice.invoiceNumber} emailed to ${invoice.customerEmail || invoice.customerName}.`
    });
  };

  const handleCancel = () => {
    cancelSalesInvoice(invoice.id);
    addToast({ type: 'info', title: 'Invoice Cancelled', message: `Invoice ${invoice.invoiceNumber} has been marked as cancelled.` });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Sales Invoice: ${invoice.invoiceNumber}`}
        subtitle={`Created on ${invoice.date} · Due ${invoice.dueDate}`}
        maxWidth="4xl"
      >
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} type="invoice" />
            <span className="text-xs text-slate-500 font-mono">Terms: {invoice.paymentTerms}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {invoice.balance > 0 && invoice.status !== 'cancelled' && (
              <button
                onClick={() => setIsRecordPayOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleSend}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>Send</span>
            </button>

            {onDuplicate && (
              <button
                onClick={() => {
                  onDuplicate(invoice);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Duplicate</span>
              </button>
            )}

            {invoice.status !== 'cancelled' && (
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs mt-4 printable-area">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-md bg-[#16A085] text-white flex items-center justify-center font-bold text-xs">
                  AL
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {currentBusiness.name}
                </h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                {currentBusiness.address}, {currentBusiness.city}, {currentBusiness.country}
                <br />
                Phone: {currentBusiness.phone} · Email: {currentBusiness.email}
                <br />
                Tax/VAT ID: {currentBusiness.taxNumber}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xl font-black text-[#16A085] tracking-widest uppercase block">
                TAX INVOICE
              </span>
              <span className="text-sm font-mono font-bold text-slate-800 block mt-1">
                {invoice.invoiceNumber}
              </span>
              <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                <div>Date: <span className="font-mono text-slate-700">{invoice.date}</span></div>
                <div>Due Date: <span className="font-mono text-slate-700">{invoice.dueDate}</span></div>
                <div>Payment Terms: <span className="font-medium text-slate-700">{invoice.paymentTerms}</span></div>
              </div>
            </div>
          </div>

          {/* Bill To Info */}
          <div className="py-6 border-b border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billed To
            </span>
            <div className="text-sm font-bold text-slate-900">{invoice.customerName}</div>
            {invoice.customerAddress && (
              <div className="text-xs text-slate-600 mt-0.5">{invoice.customerAddress}</div>
            )}
            <div className="text-xs text-slate-500 mt-0.5">
              {invoice.customerPhone && <span>Phone: {invoice.customerPhone} </span>}
              {invoice.customerEmail && <span>· Email: {invoice.customerEmail}</span>}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2 px-1">Item & Description</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Rate</th>
                  <th className="py-2 px-2 text-right">Discount</th>
                  <th className="py-2 px-2 text-right">Tax</th>
                  <th className="py-2 px-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2.5 px-1">
                      <div className="font-semibold text-slate-800">{item.itemName}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500">{item.description}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-500">
                      {item.discount ? `-${formatCurrency(item.discount)}` : '—'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-500">
                      {item.taxRate}%
                    </td>
                    <td className="py-2.5 px-1 text-right font-mono font-bold text-slate-800 tabular-nums">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Signatures */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-6">
            <div className="sm:max-w-xs flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Terms & Bank Instructions
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                {invoice.notes || invoiceSettings.termsAndConditions}
              </p>

              <div className="mt-8 pt-4 border-t border-slate-200 inline-block min-w-[160px]">
                <span className="text-xs font-semibold text-slate-700 block">
                  {invoiceSettings.signatureText}
                </span>
                <span className="text-[10px] text-slate-400">Authorized Signature</span>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatCurrency(invoice.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax / VAT:</span>
                <span className="font-mono">{formatCurrency(invoice.taxTotal)}</span>
              </div>
              {invoice.shippingCharges > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Shipping & Handling:</span>
                  <span className="font-mono">{formatCurrency(invoice.shippingCharges)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total:</span>
                <span className="font-mono text-base text-[#16A085]">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Amount Paid:</span>
                <span className="font-mono">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>Balance Due:</span>
                <span className="font-mono text-amber-700">{formatCurrency(invoice.balance)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
            {invoiceSettings.footerText}
          </div>
        </div>
      </Modal>

      {/* Record Payment In Modal */}
      <PaymentInModal
        isOpen={isRecordPayOpen}
        onClose={() => setIsRecordPayOpen(false)}
        defaultCustomerId={invoice.customerId}
        defaultInvoiceId={invoice.id}
      />
    </>
  );
};
