import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { PaymentMethod } from '../../types';

interface PaymentOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSupplierId?: string;
  defaultPurchaseId?: string;
  onSuccess?: () => void;
}

export const PaymentOutModal: React.FC<PaymentOutModalProps> = ({
  isOpen,
  onClose,
  defaultSupplierId,
  defaultPurchaseId,
  onSuccess
}) => {
  const { parties, purchases, accounts, recordPaymentOut, formatCurrency } = useApp();

  const [supplierId, setSupplierId] = useState(defaultSupplierId || '');
  const [purchaseId, setPurchaseId] = useState(defaultPurchaseId || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank');
  const [accountId, setAccountId] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (accounts.length > 0 && !accountId) {
        setAccountId(accounts[0].id);
      }
      if (defaultSupplierId) {
        setSupplierId(defaultSupplierId);
      } else if (parties.length > 0 && !supplierId) {
        const s = parties.find(p => p.type === 'supplier' || p.type === 'both');
        if (s) setSupplierId(s.id);
      }
      if (defaultPurchaseId) {
        setPurchaseId(defaultPurchaseId);
        const pur = purchases.find(p => p.id === defaultPurchaseId);
        if (pur) setAmount(pur.balance);
      }
    }
  }, [isOpen, defaultSupplierId, defaultPurchaseId, accounts, parties, purchases]);

  const supplierPurchases = purchases.filter(
    pur => pur.supplierId === supplierId && (pur.status === 'unpaid' || pur.status === 'partially_paid')
  );

  const handlePurchaseChange = (purId: string) => {
    setPurchaseId(purId);
    const selected = purchases.find(p => p.id === purId);
    if (selected) {
      setAmount(selected.balance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !accountId || amount <= 0) return;

    const supplier = parties.find(p => p.id === supplierId);
    const account = accounts.find(a => a.id === accountId);
    const purchase = purchases.find(p => p.id === purchaseId);

    if (!supplier || !account) return;

    recordPaymentOut({
      supplierId: supplier.id,
      supplierName: supplier.name,
      purchaseId: purchase?.id,
      purchaseNumber: purchase?.purchaseNumber,
      date,
      amount: Number(amount),
      paymentMethod,
      accountId: account.id,
      accountName: account.name,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment Out (Pay Supplier)"
      subtitle="Pay vendor bill, reduce payable balance, and disburse from cash/bank account"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Supplier *
          </label>
          <select
            value={supplierId}
            onChange={(e) => {
              setSupplierId(e.target.value);
              setPurchaseId('');
            }}
            required
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          >
            <option value="">-- Select Supplier --</option>
            {parties
              .filter(p => p.type === 'supplier' || p.type === 'both')
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Payable: {formatCurrency(p.currentPayable)})
                </option>
              ))}
          </select>
        </div>

        {supplierPurchases.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apply to Purchase Bill (Optional)
            </label>
            <select
              value={purchaseId}
              onChange={(e) => handlePurchaseChange(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            >
              <option value="">-- Direct Supplier Advance / General Payment --</option>
              {supplierPurchases.map(pur => (
                <option key={pur.id} value={pur.id}>
                  {pur.purchaseNumber} - Date: {pur.date} - Balance Due: {formatCurrency(pur.balance)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount Paid *
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-rose-700 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            >
              <option value="Bank">Bank Wire / ACH</option>
              <option value="Cash">Cash</option>
              <option value="Card">Corporate Card</option>
              <option value="Mobile Banking">Mobile Wallet</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Disbursed From Account *
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatCurrency(acc.balance)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reference / Cheque #
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="e.g. ACH-99201 or Ref # 551"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment note, remittance voucher details..."
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-[#E74C3C] hover:bg-[#c0392b] rounded-lg transition-colors shadow-xs"
          >
            Record Payment Out
          </button>
        </div>
      </form>
    </Modal>
  );
};
