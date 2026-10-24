import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { PaymentMethod } from '../../types';

interface PaymentInModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
  defaultInvoiceId?: string;
  onSuccess?: () => void;
}

export const PaymentInModal: React.FC<PaymentInModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerId,
  defaultInvoiceId,
  onSuccess
}) => {
  const { parties, salesInvoices, accounts, recordPaymentIn, formatCurrency } = useApp();

  const [customerId, setCustomerId] = useState(defaultCustomerId || '');
  const [invoiceId, setInvoiceId] = useState(defaultInvoiceId || '');
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
      if (defaultCustomerId) {
        setCustomerId(defaultCustomerId);
      } else if (parties.length > 0 && !customerId) {
        const c = parties.find(p => p.type === 'customer' || p.type === 'both');
        if (c) setCustomerId(c.id);
      }
      if (defaultInvoiceId) {
        setInvoiceId(defaultInvoiceId);
        const inv = salesInvoices.find(i => i.id === defaultInvoiceId);
        if (inv) setAmount(inv.balance);
      }
    }
  }, [isOpen, defaultCustomerId, defaultInvoiceId, accounts, parties, salesInvoices]);

  const customerInvoices = salesInvoices.filter(
    inv => inv.customerId === customerId && (inv.status === 'unpaid' || inv.status === 'partially_paid')
  );

  const handleInvoiceChange = (invId: string) => {
    setInvoiceId(invId);
    const selected = salesInvoices.find(i => i.id === invId);
    if (selected) {
      setAmount(selected.balance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !accountId || amount <= 0) return;

    const customer = parties.find(p => p.id === customerId);
    const account = accounts.find(a => a.id === accountId);
    const invoice = salesInvoices.find(i => i.id === invoiceId);

    if (!customer || !account) return;

    recordPaymentIn({
      customerId: customer.id,
      customerName: customer.name,
      invoiceId: invoice?.id,
      invoiceNumber: invoice?.invoiceNumber,
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
      title="Record Payment In (Receive Payment)"
      subtitle="Collect payment from customer, reduce receivable balance, and credit cash/bank account"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer *
          </label>
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setInvoiceId('');
            }}
            required
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          >
            <option value="">-- Select Customer --</option>
            {parties
              .filter(p => p.type === 'customer' || p.type === 'both')
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Receivable: {formatCurrency(p.currentReceivable)})
                </option>
              ))}
          </select>
        </div>

        {customerInvoices.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apply to Pending Invoice (Optional)
            </label>
            <select
              value={invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            >
              <option value="">-- General Account Receipt (No specific invoice) --</option>
              {customerInvoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - Date: {inv.date} - Balance Due: {formatCurrency(inv.balance)}
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
              Amount Received *
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
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
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Wire / ACH</option>
              <option value="Mobile Banking">Mobile Wallet / bKash</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Account *
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
            Reference / Transaction #
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="e.g. WIRE-884920 or Cheque # 104"
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
            placeholder="Payment details, receipt notes..."
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
            className="px-5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg transition-colors shadow-xs"
          >
            Record Payment In
          </button>
        </div>
      </form>
    </Modal>
  );
};
