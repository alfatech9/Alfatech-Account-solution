import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardCard } from '../components/common/DashboardCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Plus,
  Eye,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SalesInvoice, PurchaseBill, DateFilterRange } from '../types';

interface DashboardProps {
  onNavigate: (route: string) => void;
  onOpenQuickAction: (actionType: 'sale' | 'purchase' | 'party' | 'item' | 'expense' | 'income' | 'payin' | 'payout') => void;
  onOpenInvoiceDetail: (inv: SalesInvoice) => void;
  onOpenPurchaseDetail: (pur: PurchaseBill) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenQuickAction,
  onOpenInvoiceDetail,
  onOpenPurchaseDetail
}) => {
  const {
    parties,
    items,
    salesInvoices,
    purchases,
    expenses,
    incomes,
    accounts,
    dateFilter,
    setDateFilter,
    customStartDate,
    customEndDate,
    formatCurrency
  } = useApp();

  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Filter records based on global date filter
  const isDateInFilter = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const now = new Date();
    const d = new Date(dateStr);

    if (dateFilter === 'today') {
      return d.toISOString().split('T')[0] === now.toISOString().split('T')[0];
    }
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return d >= oneWeekAgo && d <= now;
    }
    if (dateFilter === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'year') {
      return d.getFullYear() === 2026 || d.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'custom') {
      return dateStr >= customStartDate && dateStr <= customEndDate;
    }
    return true;
  };

  const filteredSales = useMemo(() => salesInvoices.filter(s => isDateInFilter(s.date)), [salesInvoices, dateFilter, customStartDate, customEndDate]);
  const filteredPurchases = useMemo(() => purchases.filter(p => isDateInFilter(p.date)), [purchases, dateFilter, customStartDate, customEndDate]);
  const filteredExpenses = useMemo(() => expenses.filter(e => isDateInFilter(e.date)), [expenses, dateFilter, customStartDate, customEndDate]);
  const filteredIncomes = useMemo(() => incomes.filter(i => isDateInFilter(i.date)), [incomes, dateFilter, customStartDate, customEndDate]);

  // Aggregate metrics
  const totalReceivable = parties.reduce((acc, p) => acc + (p.currentReceivable || 0), 0);
  const totalPayable = parties.reduce((acc, p) => acc + (p.currentPayable || 0), 0);
  const totalSalesVolume = filteredSales.reduce((acc, s) => acc + (s.status !== 'cancelled' ? s.total : 0), 0);
  const totalPurchasesVolume = filteredPurchases.reduce((acc, p) => acc + (p.status !== 'cancelled' ? p.total : 0), 0);
  const totalExpensesVolume = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalIncomeVolume = filteredIncomes.reduce((acc, i) => acc + i.amount, 0);

  const netGrossProfit = totalSalesVolume - totalPurchasesVolume;
  const netOperatingProfit = netGrossProfit + totalIncomeVolume - totalExpensesVolume;

  // Recent transactions list
  const recentTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      type: 'Sale' | 'Purchase' | 'Expense' | 'Income';
      txnId: string;
      partyName: string;
      amount: number;
      status: string;
      rawObj: any;
    }> = [];

    salesInvoices.slice(0, 10).forEach(inv => {
      list.push({
        id: inv.id,
        date: inv.date,
        type: 'Sale',
        txnId: inv.invoiceNumber,
        partyName: inv.customerName,
        amount: inv.total,
        status: inv.status,
        rawObj: inv
      });
    });

    purchases.slice(0, 10).forEach(pur => {
      list.push({
        id: pur.id,
        date: pur.date,
        type: 'Purchase',
        txnId: pur.purchaseNumber,
        partyName: pur.supplierName,
        amount: pur.total,
        status: pur.status,
        rawObj: pur
      });
    });

    expenses.slice(0, 6).forEach(exp => {
      list.push({
        id: exp.id,
        date: exp.date,
        type: 'Expense',
        txnId: exp.reference || 'EXP-AUTO',
        partyName: exp.category,
        amount: exp.amount,
        status: 'completed',
        rawObj: exp
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }, [salesInvoices, purchases, expenses]);

  // Real monthly aggregation from actual invoice and purchase entries
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((label, monthIdx) => {
      const sales = salesInvoices
        .filter(s => s.status !== 'cancelled' && new Date(s.date).getMonth() === monthIdx)
        .reduce((sum, s) => sum + s.total, 0);

      const purchase = purchases
        .filter(p => p.status !== 'cancelled' && new Date(p.date).getMonth() === monthIdx)
        .reduce((sum, p) => sum + p.total, 0);

      return { label, sales, purchase };
    });
  }, [salesInvoices, purchases]);

  const maxVal = Math.max(...chartData.map(d => Math.max(d.sales, d.purchase)), 100);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Business Financial Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time balance sheets, receivables, payables, and inventory movement.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenQuickAction('sale')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sale Invoice</span>
          </button>
          <button
            onClick={() => onOpenQuickAction('purchase')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Purchase</span>
          </button>
        </div>
      </div>

      {/* 5 Clickable Summary Cards: To Receive, To Pay, Sales, Purchase, Expenses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. To Receive */}
        <DashboardCard
          title="To Receive"
          amount={formatCurrency(totalReceivable)}
          subtitle={`${parties.filter(p => p.currentReceivable > 0).length} debtors pending`}
          icon={<ArrowDownLeft className="w-5 h-5" />}
          accentColor="green"
          onClick={() => onNavigate('parties')}
        />

        {/* 2. To Pay */}
        <DashboardCard
          title="To Pay"
          amount={formatCurrency(totalPayable)}
          subtitle={`${parties.filter(p => p.currentPayable > 0).length} supplier bills`}
          icon={<ArrowUpRight className="w-5 h-5" />}
          accentColor="orange"
          onClick={() => onNavigate('parties')}
        />

        {/* 3. Sales */}
        <DashboardCard
          title="Sales Volume"
          amount={formatCurrency(totalSalesVolume)}
          subtitle={`${filteredSales.length} total orders`}
          icon={<Receipt className="w-5 h-5" />}
          accentColor="blue"
          onClick={() => onNavigate('sales')}
        />

        {/* 4. Purchase */}
        <DashboardCard
          title="Purchases (COGS)"
          amount={formatCurrency(totalPurchasesVolume)}
          subtitle={`${filteredPurchases.length} stock receipts`}
          icon={<ShoppingCart className="w-5 h-5" />}
          accentColor="emerald"
          onClick={() => onNavigate('purchases')}
        />

        {/* 5. Expenses */}
        <DashboardCard
          title="Operating Expenses"
          amount={formatCurrency(totalExpensesVolume)}
          subtitle={`${filteredExpenses.length} overhead vouchers`}
          icon={<TrendingDown className="w-5 h-5" />}
          accentColor="red"
          onClick={() => onNavigate('income-expenses')}
        />
      </div>

      {/* Secondary Bar: Net Profit & Quick Cash Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Net Operating Profit
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatCurrency(netOperatingProfit)}
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span>Gross Margin:</span>
              <span className="font-mono text-emerald-400 font-semibold">{formatCurrency(netGrossProfit)}</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Sales − Purchases − Expenses</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-[#16A085] hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              <span>View P&L</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Cash & Bank Balances overview */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Cash & Bank Accounts
              </span>
              <span className="text-xs text-slate-500">Live liquid balances across all business accounts</span>
            </div>
            <button
              onClick={() => onNavigate('cash-bank')}
              className="text-xs font-semibold text-[#16A085] hover:underline"
            >
              Manage Accounts →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
            {accounts.map(acc => (
              <div key={acc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[11px] font-medium text-slate-500 block truncate">{acc.name}</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums block mt-0.5">
                  {formatCurrency(acc.balance)}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{acc.type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Total Liquid Capital:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatCurrency(accounts.reduce((a, acc) => a + acc.balance, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Sales Overview & Purchase Overview Dual Chart Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Sales vs. Purchase Performance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative analysis of sales revenue against procurement costs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                    chartPeriod === p ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-[#16A085] hover:text-[#0E7C66] px-2 py-1"
            >
              Full Report
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#16A085]" />
            <span>Sales Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#2F80ED]" />
            <span>Purchases (COGS)</span>
          </div>
        </div>

        {/* Clean Bar Chart */}
        <div className="h-64 flex items-end gap-2 pt-6 pb-2 px-2 overflow-x-auto">
          {chartData.map((d, idx) => {
            const salesHeight = Math.max(8, (d.sales / maxVal) * 100);
            const purchaseHeight = Math.max(8, (d.purchase / maxVal) * 100);

            return (
              <div key={idx} className="flex-1 min-w-[32px] flex flex-col items-center gap-2 group relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 z-20 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md whitespace-nowrap transition-opacity">
                  <div>Sales: {formatCurrency(d.sales)}</div>
                  <div>Purchase: {formatCurrency(d.purchase)}</div>
                </div>

                <div className="w-full flex items-end justify-center gap-1 h-48">
                  {/* Sales bar */}
                  <div
                    style={{ height: `${salesHeight}%` }}
                    className="w-1/2 bg-[#16A085] rounded-t-sm hover:brightness-110 transition-all cursor-pointer"
                  />
                  {/* Purchase bar */}
                  <div
                    style={{ height: `${purchaseHeight}%` }}
                    className="w-1/2 bg-[#2F80ED] rounded-t-sm hover:brightness-110 transition-all cursor-pointer"
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-medium">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any transaction row to open the complete details view.
            </p>
          </div>
          <button
            onClick={() => onNavigate('sales')}
            className="text-xs font-semibold text-[#16A085] hover:underline"
          >
            View All Sales →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Party Name</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <p className="text-xs font-semibold text-slate-600">No transactions recorded yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Create your first sales invoice, purchase receipt, or record income/expense above.
                    </p>
                  </td>
                </tr>
              ) : (
                recentTransactions.map((txn) => (
                  <tr
                  key={txn.id}
                  onClick={() => {
                    if (txn.type === 'Sale') onOpenInvoiceDetail(txn.rawObj);
                    else if (txn.type === 'Purchase') onOpenPurchaseDetail(txn.rawObj);
                  }}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-slate-500">{txn.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                      txn.type === 'Sale'
                        ? 'bg-blue-50 text-blue-700'
                        : txn.type === 'Purchase'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">{txn.txnId}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">{txn.partyName}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrency(txn.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={txn.status} type="invoice" />
                  </td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        if (txn.type === 'Sale') onOpenInvoiceDetail(txn.rawObj);
                        else if (txn.type === 'Purchase') onOpenPurchaseDetail(txn.rawObj);
                        else onNavigate('income-expenses');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
