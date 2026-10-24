import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Account, AccountTransaction, AccountType } from '../types';
import {
  Landmark,
  Wallet,
  Smartphone,
  Plus,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { TransferModal } from '../components/modals/TransferModal';

export const CashBank: React.FC = () => {
  const {
    accounts,
    accountTransactions,
    addAccount,
    depositFunds,
    withdrawFunds,
    formatCurrency
  } = useApp();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  // Add Account form
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('bank');
  const [accBankName, setAccBankName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accOpeningBal, setAccOpeningBal] = useState<number>(0);

  // Deposit/Withdraw form
  const [actionAmount, setActionAmount] = useState<number>(0);
  const [actionNotes, setActionNotes] = useState('');

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;

    addAccount({
      name: accName.trim(),
      type: accType,
      bankName: accBankName.trim() || undefined,
      accountNumber: accNumber.trim() || undefined,
      openingBalance: Number(accOpeningBal) || 0
    });

    setAccName('');
    setAccBankName('');
    setAccNumber('');
    setAccOpeningBal(0);
    setIsAddAccountOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || actionAmount <= 0) return;
    depositFunds(selectedAccountId, Number(actionAmount), actionNotes.trim() || undefined);
    setActionAmount(0);
    setActionNotes('');
    setIsDepositOpen(false);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || actionAmount <= 0) return;
    withdrawFunds(selectedAccountId, Number(actionAmount), actionNotes.trim() || undefined);
    setActionAmount(0);
    setActionNotes('');
    setIsWithdrawOpen(false);
  };

  const columns: Column<AccountTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (t) => <span className="font-mono text-slate-500">{t.date}</span>
    },
    {
      key: 'accountName',
      header: 'Account',
      sortable: true,
      render: (t) => <span className="font-semibold text-slate-800">{t.accountName}</span>
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (t) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          t.moneyIn > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {t.type.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (t) => <span className="font-mono text-slate-600">{t.reference || '—'}</span>
    },
    {
      key: 'description',
      header: 'Description',
      render: (t) => <span className="text-slate-600">{t.description}</span>
    },
    {
      key: 'moneyIn',
      header: 'Money In',
      sortable: true,
      align: 'right',
      render: (t) => (
        <span className="font-mono tabular-nums font-semibold text-emerald-700">
          {t.moneyIn > 0 ? `+${formatCurrency(t.moneyIn)}` : '—'}
        </span>
      )
    },
    {
      key: 'moneyOut',
      header: 'Money Out',
      sortable: true,
      align: 'right',
      render: (t) => (
        <span className="font-mono tabular-nums font-semibold text-rose-700">
          {t.moneyOut > 0 ? `-${formatCurrency(t.moneyOut)}` : '—'}
        </span>
      )
    },
    {
      key: 'balance',
      header: 'Balance After',
      sortable: true,
      align: 'right',
      render: (t) => (
        <span className="font-mono tabular-nums font-bold text-slate-900">
          {formatCurrency(t.balance)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Banking Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Cash & Bank Accounts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time liquid assets, deposit funds, process withdrawals, and transfer between accounts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>

          <button
            onClick={() => setIsTransferOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#2F80ED]" />
            <span>Transfer</span>
          </button>

          <button
            onClick={() => setIsDepositOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => {
          let Icon = Landmark;
          let badgeColor = 'bg-blue-50 text-blue-700';

          if (acc.type === 'cash') {
            Icon = Wallet;
            badgeColor = 'bg-emerald-50 text-emerald-700';
          } else if (acc.type === 'mobile_wallet') {
            Icon = Smartphone;
            badgeColor = 'bg-purple-50 text-purple-700';
          }

          return (
            <div
              key={acc.id}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4 hover:shadow-xs transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {acc.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      {acc.accountNumber || acc.bankName || 'Liquid Cash Pool'}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${badgeColor}`}>
                  {acc.type.replace('_', ' ')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Current Available Balance
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                  {formatCurrency(acc.balance)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Money In</span>
                  <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                    +{formatCurrency(acc.moneyIn)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Money Out</span>
                  <span className="font-mono font-semibold text-rose-700 tabular-nums">
                    -{formatCurrency(acc.moneyOut)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Transactions Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Cash & Bank Ledger Transactions
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail of all money in, disbursements, payments, and transfers.
            </p>
          </div>
        </div>

        <DataTable
          data={accountTransactions}
          columns={columns}
          keyExtractor={(t) => t.id}
          searchPlaceholder="Search by account, description, reference..."
          searchFields={['accountName', 'description', 'reference', 'type']}
          itemsPerPage={10}
          emptyTitle="No banking transactions"
          emptyMessage="Transactions will automatically appear as you record sales, purchases, income, and expenses."
        />
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        title="Add Bank / Cash Account"
        subtitle="Configure an account for financial ledgers and transaction settlements"
        maxWidth="md"
      >
        <form onSubmit={handleAddAccountSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Display Name *
            </label>
            <input
              type="text"
              required
              value={accName}
              onChange={(e) => setAccName(e.target.value)}
              placeholder="e.g. Chase Commercial Checking"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Type *
            </label>
            <select
              value={accType}
              onChange={(e) => setAccType(e.target.value as AccountType)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            >
              <option value="bank">Bank Account</option>
              <option value="cash">Cash in Hand / Drawer</option>
              <option value="mobile_wallet">Mobile Wallet / Digital Platform</option>
              <option value="other">Other Asset Account</option>
            </select>
          </div>

          {accType === 'bank' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={accBankName}
                  onChange={(e) => setAccBankName(e.target.value)}
                  placeholder="e.g. JPMorgan Chase"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Number / Masked IBAN
                </label>
                <input
                  type="text"
                  value={accNumber}
                  onChange={(e) => setAccNumber(e.target.value)}
                  placeholder="•••• 4892"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Opening Balance
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={accOpeningBal || ''}
              onChange={(e) => setAccOpeningBal(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddAccountOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg transition-colors shadow-xs"
            >
              Save Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        title="Direct Deposit into Account"
        subtitle="Add cash or external capital into your ledger"
        maxWidth="sm"
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination Account *
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatCurrency(a.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Amount *
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={actionAmount || ''}
              onChange={(e) => setActionAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Notes / Reference
            </label>
            <input
              type="text"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Owner capital injection"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDepositOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
            >
              Confirm Deposit
            </button>
          </div>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Direct Withdrawal from Account"
        subtitle="Disburse funds from your liquid account"
        maxWidth="sm"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Account *
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatCurrency(a.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Withdrawal Amount *
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={actionAmount || ''}
              onChange={(e) => setActionAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-rose-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Notes
            </label>
            <input
              type="text"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Owner drawings or petty cash replenishment"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded"
            >
              Confirm Withdrawal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
