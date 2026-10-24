import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { accounts, transferFunds, formatCurrency, addToast } = useApp();

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const sourceAccount = accounts.find(a => a.id === fromAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || fromAccountId === toAccountId || amount <= 0) {
      addToast({
        type: 'warning',
        title: 'Invalid Transfer',
        message: 'Please select two distinct accounts and specify a positive transfer amount.'
      });
      return;
    }

    const ok = transferFunds(fromAccountId, toAccountId, Number(amount), notes.trim() || undefined);
    if (ok) {
      setAmount(0);
      setNotes('');
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Funds Between Accounts"
      subtitle="Move funds between Cash in Hand, Bank Accounts, or Digital Wallets"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transfer From (Source Account) *
          </label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (Available: {formatCurrency(acc.balance)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transfer To (Destination Account) *
          </label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                {acc.name} (Current: {formatCurrency(acc.balance)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transfer Amount *
          </label>
          <input
            type="number"
            min="0.01"
            max={sourceAccount?.balance}
            step="any"
            required
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          />
          {sourceAccount && (
            <span className="text-[11px] text-slate-500 mt-1 block">
              Max available: {formatCurrency(sourceAccount.balance)}
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transfer Reference / Reason
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. ATM cash withdrawal or bank deposit"
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
            Execute Transfer
          </button>
        </div>
      </form>
    </Modal>
  );
};
