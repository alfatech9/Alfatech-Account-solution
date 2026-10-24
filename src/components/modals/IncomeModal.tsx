import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { accounts, addIncome, formatCurrency } = useApp();

  const [category, setCategory] = useState('Consulting & Services');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(0);
  const [receivedIntoAccountId, setReceivedIntoAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (isOpen && accounts.length > 0 && !receivedIntoAccountId) {
      setReceivedIntoAccountId(accounts[0].id);
    }
  }, [isOpen, accounts, receivedIntoAccountId]);

  const categories = [
    'Consulting & Services',
    'Maintenance Contract',
    'Interest Income',
    'Commission',
    'Rental Income',
    'Asset Disposal',
    'Other Revenue'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivedIntoAccountId || amount <= 0) return;

    const acc = accounts.find(a => a.id === receivedIntoAccountId);
    if (!acc) return;

    addIncome({
      category,
      date,
      amount: Number(amount),
      receivedIntoAccountId: acc.id,
      receivedIntoAccountName: acc.name,
      description: description.trim() || category,
      reference: reference.trim() || undefined
    });

    setDescription('');
    setReference('');
    setAmount(0);

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Ancillary Income"
      subtitle="Record service revenue, consulting fees, or other direct cash receipts"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Income Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date *
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
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-emerald-600 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deposit Into Account *
          </label>
          <select
            value={receivedIntoAccountId}
            onChange={(e) => setReceivedIntoAccountId(e.target.value)}
            required
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (Balance: {formatCurrency(acc.balance)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Server installation service"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reference / Receipt #
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="REC-1002"
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
            className="px-5 py-2 text-xs font-semibold text-white bg-[#2F80ED] hover:bg-blue-600 rounded-lg transition-colors shadow-xs"
          >
            Save Income
          </button>
        </div>
      </form>
    </Modal>
  );
};
