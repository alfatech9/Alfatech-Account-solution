import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { PurchaseBill } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Printer, Download, CreditCard, XCircle, Copy } from 'lucide-react';
import { PaymentOutModal } from './PaymentOutModal';
import { exportReportToPDF, printReportHtml } from '../../utils/reportExporter';

interface PurchaseDetailModalProps {
  purchase: PurchaseBill | null;
  isOpen: boolean;
  onClose: () => void;
  onDuplicate?: (pur: PurchaseBill) => void;
}

export const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
  purchase,
  isOpen,
  onClose,
  onDuplicate
}) => {
  const {
    currentBusiness,
    invoiceSettings,
    cancelPurchaseBill,
    formatCurrency,
    addToast
  } = useApp();

  const [isRecordPayOutOpen, setIsRecordPayOutOpen] = useState(false);

  if (!purchase) return null;

  const getPurchaseExportOptions = () => ({
    businessName: currentBusiness.name || 'Alfatechlink Business',
    businessAddress: [currentBusiness.address, currentBusiness.city, currentBusiness.country].filter(Boolean).join(', '),
    businessTaxId: currentBusiness.taxNumber,
    reportTitle: `Purchase Bill: ${purchase.purchaseNumber}`,
    startDate: purchase.date,
    endDate: purchase.dueDate,
    filenamePrefix: `PurchaseBill_${purchase.purchaseNumber}`,
    headers: ['Item Description', 'Qty', 'Unit', 'Unit Cost', 'Tax %', 'Line Total'],
    rows: purchase.items.map(it => [
      it.itemName,
      it.quantity,
      it.unit,
      formatCurrency(it.rate),
      `${it.taxRate}%`,
      formatCurrency(it.amount)
    ]),
    columnAlignments: ['left', 'center', 'center', 'right', 'right', 'right'] as const,
    summaryRows: [
      { label: 'Subtotal', value: formatCurrency(purchase.subtotal) },
      { label: 'Tax Amount', value: formatCurrency(purchase.taxTotal) },
      { label: 'Total Purchase Amount', value: formatCurrency(purchase.total) },
      { label: 'Total Amount Disbursed', value: formatCurrency(purchase.paidAmount) },
      { label: 'Outstanding Balance Due', value: formatCurrency(purchase.balance) }
    ]
  });

  const handlePrint = () => {
    try {
      printReportHtml(getPurchaseExportOptions());
      addToast({ type: 'info', title: 'Print Dialog Initialized', message: `Printing purchase bill ${purchase.purchaseNumber}.` });
    } catch {
      window.print();
    }
  };

  const handleDownload = () => {
    try {
      exportReportToPDF(getPurchaseExportOptions());
      addToast({ type: 'success', title: 'Purchase PDF Downloaded', message: `Downloaded PDF for ${purchase.purchaseNumber}.` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'PDF Export Failed', message: 'Could not generate purchase PDF.' });
    }
  };

  const handleCancel = () => {
    cancelPurchaseBill(purchase.id);
    addToast({ type: 'info', title: 'Purchase Cancelled', message: `Purchase bill ${purchase.purchaseNumber} has been marked as cancelled.` });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Purchase Bill: ${purchase.purchaseNumber}`}
        subtitle={`Intake Date: ${purchase.date} · Due: ${purchase.dueDate}`}
        maxWidth="4xl"
      >
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <StatusBadge status={purchase.status} type="purchase" />
            <span className="text-xs text-slate-500 font-mono">Supplier: {purchase.supplierName}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {purchase.balance > 0 && purchase.status !== 'cancelled' && (
              <button
                onClick={() => setIsRecordPayOutOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Supplier</span>
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

            {onDuplicate && (
              <button
                onClick={() => {
                  onDuplicate(purchase);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Duplicate</span>
              </button>
            )}

            {purchase.status !== 'cancelled' && (
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

        {/* Printable Purchase Sheet */}
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs mt-4 printable-area">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Purchasing Company
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {currentBusiness.name}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mt-1">
                {currentBusiness.address}, {currentBusiness.city}, {currentBusiness.country}
                <br />
                Tax ID: {currentBusiness.taxNumber}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xl font-black text-slate-800 tracking-widest uppercase block">
                PURCHASE BILL
              </span>
              <span className="text-sm font-mono font-bold text-slate-800 block mt-1">
                {purchase.purchaseNumber}
              </span>
              <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                <div>Date: <span className="font-mono text-slate-700">{purchase.date}</span></div>
                <div>Due Date: <span className="font-mono text-slate-700">{purchase.dueDate}</span></div>
              </div>
            </div>
          </div>

          <div className="py-6 border-b border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Supplier / Vendor
            </span>
            <div className="text-sm font-bold text-slate-900">{purchase.supplierName}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {purchase.supplierPhone && <span>Phone: {purchase.supplierPhone} </span>}
              {purchase.supplierEmail && <span>· Email: {purchase.supplierEmail}</span>}
            </div>
          </div>

          {/* Line Items */}
          <div className="py-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2 px-1">Item</th>
                  <th className="py-2 px-2 text-center">Qty Received</th>
                  <th className="py-2 px-2 text-right">Purchase Rate</th>
                  <th className="py-2 px-2 text-right">Tax %</th>
                  <th className="py-2 px-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchase.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-1 font-semibold text-slate-800">
                      {item.itemName}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-emerald-700 font-semibold">
                      +{item.quantity} {item.unit}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {formatCurrency(item.rate)}
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

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-6">
            <div className="sm:max-w-xs flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Vendor Notes
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                {purchase.notes || 'Inventory items received into warehouse and logged in stock movements.'}
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(purchase.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax / VAT:</span>
                <span className="font-mono">{formatCurrency(purchase.taxTotal)}</span>
              </div>
              {purchase.shippingCharges > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Freight Inward:</span>
                  <span className="font-mono">{formatCurrency(purchase.shippingCharges)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Bill:</span>
                <span className="font-mono text-base">{formatCurrency(purchase.total)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Amount Paid:</span>
                <span className="font-mono">{formatCurrency(purchase.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>Payable Balance:</span>
                <span className="font-mono text-rose-700">{formatCurrency(purchase.balance)}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <PaymentOutModal
        isOpen={isRecordPayOutOpen}
        onClose={() => setIsRecordPayOutOpen(false)}
        defaultSupplierId={purchase.supplierId}
        defaultPurchaseId={purchase.id}
      />
    </>
  );
};
