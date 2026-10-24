import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { accounts, addExpense, formatCurrency } = useApp();

  const [category, setCategory] = useState('Office Expense');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(0);
  const [paidFromAccountId, setPaidFromAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (isOpen && accounts.length > 0 && !paidFromAccountId) {
      setPaidFromAccountId(accounts[0].id);
    }
  }, [isOpen, accounts, paidFromAccountId]);

  const categories = [
    'Rent',
    'Salary',
    'Electricity',
    'Internet',
    'Transportation',
    'Marketing',
    'Office Expense',
    'Maintenance',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidFromAccountId || amount <= 0) return;

    const acc = accounts.find(a => a.id === paidFromAccountId);
    if (!acc) return;

    addExpense({
      category,
      date,
      amount: Number(amount),
      paidFromAccountId: acc.id,
      paidFromAccountName: acc.name,
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
      title="Add Operating Expense"
      subtitle="Record commercial overheads, utility bills, or operational expenditures"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Expense Category *
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
              Amount *
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-rose-600 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Paid From Account *
          </label>
          <select
            value={paidFromAccountId}
            onChange={(e) => setPaidFromAccountId(e.target.value)}
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
            placeholder="e.g. Monthly internet bill or coffee beans"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reference / Voucher #
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="VOUCH-1002"
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
            Save Expense
          </button>
        </div>
      </form>
    </Modal>
  );
};
