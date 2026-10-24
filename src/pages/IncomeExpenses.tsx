import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Expense, Income } from '../types';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Trash2,
  PieChart
} from 'lucide-react';
import { ExpenseModal } from '../components/modals/ExpenseModal';
import { IncomeModal } from '../components/modals/IncomeModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const IncomeExpenses: React.FC = () => {
  const {
    expenses,
    incomes,
    deleteExpense,
    deleteIncome,
    formatCurrency,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'expense' | 'income'; id: string; desc: string } | null>(null);

  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const totalIncomes = incomes.reduce((a, b) => a + b.amount, 0);

  const expenseColumns: Column<Expense>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (e) => <span className="font-mono text-slate-500">{e.date}</span>
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (e) => (
        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {e.category}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (e) => <span className="text-slate-700">{e.description}</span>
    },
    {
      key: 'paidFromAccountName',
      header: 'Paid From Account',
      render: (e) => <span className="text-slate-500">{e.paidFromAccountName}</span>
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (e) => <span className="font-mono text-slate-500">{e.reference || '—'}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (e) => (
        <span className="font-mono tabular-nums font-bold text-rose-700">
          -{formatCurrency(e.amount)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (e) => (
        <button
          onClick={() => {
            setItemToDelete({ type: 'expense', id: e.id, desc: `${e.category} (${e.description || 'Record'})` });
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
          title="Delete Expense"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  const incomeColumns: Column<Income>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (i) => <span className="font-mono text-slate-500">{i.date}</span>
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (i) => (
        <span className="font-bold text-slate-900 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
          {i.category}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (i) => <span className="text-slate-700">{i.description}</span>
    },
    {
      key: 'receivedIntoAccountName',
      header: 'Received Into Account',
      render: (i) => <span className="text-slate-500">{i.receivedIntoAccountName}</span>
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (i) => <span className="font-mono text-slate-500">{i.reference || '—'}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (i) => (
        <span className="font-mono tabular-nums font-bold text-emerald-700">
          +{formatCurrency(i.amount)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (i) => (
        <button
          onClick={() => {
            setItemToDelete({ type: 'income', id: i.id, desc: `${i.category} (${i.description || 'Record'})` });
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
          title="Delete Income"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Income & Expenses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log overhead operating expenditures and non-invoice ancillary business revenue.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsExpenseOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#E74C3C] hover:bg-[#c0392b] rounded-lg shadow-xs transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => setIsIncomeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2F80ED] hover:bg-blue-600 rounded-lg shadow-xs transition-colors"
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Operating Expenses
            </span>
            <div className="text-2xl font-bold font-mono text-rose-700 tabular-nums mt-1">
              {formatCurrency(totalExpenses)}
            </div>
            <span className="text-[11px] text-slate-400">{expenses.length} expense entries recorded</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Ancillary Income
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums mt-1">
              {formatCurrency(totalIncomes)}
            </div>
            <span className="text-[11px] text-slate-400">{incomes.length} revenue transactions</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Segmented Tab */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'expenses'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Expenses List ({expenses.length})
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'income'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Income Entries ({incomes.length})
        </button>
      </div>

      {/* Tables */}
      {activeTab === 'expenses' ? (
        <DataTable
          data={expenses}
          columns={expenseColumns}
          keyExtractor={(e) => e.id}
          searchPlaceholder="Search by category, description, account..."
          searchFields={['category', 'description', 'paidFromAccountName', 'reference']}
          itemsPerPage={10}
          emptyTitle="No expenses logged"
          emptyMessage="Record business overheads like rent, electricity, and salaries."
        />
      ) : (
        <DataTable
          data={incomes}
          columns={incomeColumns}
          keyExtractor={(i) => i.id}
          searchPlaceholder="Search by income category, description..."
          searchFields={['category', 'description', 'receivedIntoAccountName', 'reference']}
          itemsPerPage={10}
          emptyTitle="No ancillary income recorded"
          emptyMessage="Record services fees, consultation revenues, and dividends."
        />
      )}

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
      />

      <IncomeModal
        isOpen={isIncomeOpen}
        onClose={() => setIsIncomeOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (!itemToDelete) return;
          if (itemToDelete.type === 'expense') {
            deleteExpense(itemToDelete.id);
            addToast({ type: 'success', title: 'Expense Removed', message: `Expense record removed.` });
          } else {
            deleteIncome(itemToDelete.id);
            addToast({ type: 'success', title: 'Income Removed', message: `Income record removed.` });
          }
        }}
        title={`Delete ${itemToDelete?.type === 'expense' ? 'Expense' : 'Income'} Record`}
        message={`Are you sure you want to delete "${itemToDelete?.desc}"? This transaction will be deducted from your accounts.`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
