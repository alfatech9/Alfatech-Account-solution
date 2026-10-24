import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { PurchaseBill, PaymentOut } from '../types';
import {
  ShoppingCart,
  Plus,
  Download,
  Eye,
  CreditCard,
  Copy
} from 'lucide-react';
import { CreatePurchaseModal } from '../components/modals/CreatePurchaseModal';
import { PurchaseDetailModal } from '../components/modals/PurchaseDetailModal';
import { PaymentOutModal } from '../components/modals/PaymentOutModal';

interface PurchasesProps {
  onNavigate: (route: string) => void;
  openPurchaseId?: string;
}

export const Purchases: React.FC<PurchasesProps> = ({ onNavigate, openPurchaseId }) => {
  const { purchases, paymentsOut, formatCurrency, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'bills' | 'payments-out'>('bills');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseBill | null>(() => {
    if (openPurchaseId) {
      return purchases.find(p => p.id === openPurchaseId) || null;
    }
    return null;
  });
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(!!openPurchaseId);

  // Payment Out Modal
  const [isPaymentOutOpen, setIsPaymentOutOpen] = useState(false);
  const [payOutPurchase, setPayOutPurchase] = useState<PurchaseBill | null>(null);

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    if (statusFilter === 'all') return purchases;
    return purchases.filter(p => p.status === statusFilter);
  }, [purchases, statusFilter]);

  // Aggregate metrics
  const totalPurchasesSum = purchases.reduce((a, b) => a + (b.status !== 'cancelled' ? b.total : 0), 0);
  const totalPaidSum = purchases.reduce((a, b) => a + b.paidAmount, 0);
  const totalPendingSum = purchases.reduce((a, b) => a + (b.status !== 'cancelled' ? b.balance : 0), 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Purchase #', 'Supplier', 'Date', 'Due Date', 'Status', 'Total', 'Paid', 'Balance'];
    const rows = filteredPurchases.map(p => [
      p.purchaseNumber,
      `"${p.supplierName.replace(/"/g, '""')}"`,
      p.date,
      p.dueDate,
      p.status,
      p.total,
      p.paidAmount,
      p.balance
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alfatechlink_purchases_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Export Complete', message: `Exported ${filteredPurchases.length} purchase bills to CSV.` });
  };

  const purchaseColumns: Column<PurchaseBill>[] = [
    {
      key: 'purchaseNumber',
      header: 'Purchase #',
      sortable: true,
      render: (p) => (
        <span className="font-mono font-bold text-slate-900 hover:text-[#16A085] transition-colors">
          {p.purchaseNumber}
        </span>
      )
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortable: true,
      render: (p) => (
        <div>
          <span className="font-semibold text-slate-800">{p.supplierName}</span>
          {p.supplierPhone && (
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">{p.supplierPhone}</div>
          )}
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (p) => <span className="font-mono text-slate-500">{p.date}</span>
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (p) => <span className="font-mono text-slate-500">{p.dueDate}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => <StatusBadge status={p.status} type="purchase" />
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono tabular-nums font-bold text-slate-900">
          {formatCurrency(p.total)}
        </span>
      )
    },
    {
      key: 'paidAmount',
      header: 'Paid',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono tabular-nums font-semibold text-emerald-700">
          {formatCurrency(p.paidAmount)}
        </span>
      )
    },
    {
      key: 'balance',
      header: 'Balance',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span
          className={`font-mono tabular-nums font-bold ${
            p.balance > 0 ? 'text-rose-700' : 'text-slate-400'
          }`}
        >
          {formatCurrency(p.balance)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedPurchase(p);
              setIsDetailOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
            title="View Purchase Bill"
          >
            <Eye className="w-4 h-4" />
          </button>

          {p.balance > 0 && p.status !== 'cancelled' && (
            <button
              onClick={() => {
                setPayOutPurchase(p);
                setIsPaymentOutOpen(true);
              }}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Record Payment Out"
            >
              <CreditCard className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const paymentOutColumns: Column<PaymentOut>[] = [
    {
      key: 'paymentNumber',
      header: 'Payment #',
      sortable: true,
      render: (p) => <span className="font-mono font-bold text-slate-900">{p.paymentNumber}</span>
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (p) => <span className="font-mono text-slate-500">{p.date}</span>
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortable: true,
      render: (p) => <span className="font-semibold text-slate-800">{p.supplierName}</span>
    },
    {
      key: 'purchaseNumber',
      header: 'Applied Bill #',
      render: (p) => <span className="font-mono text-slate-600">{p.purchaseNumber || 'General Advance'}</span>
    },
    {
      key: 'paymentMethod',
      header: 'Method & Account',
      render: (p) => (
        <span className="text-slate-600">
          {p.paymentMethod} · {p.accountName}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono tabular-nums font-bold text-rose-700">
          {formatCurrency(p.amount)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Purchases & Supplier Bills
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log vendor receipts, automatically increase stock, and track payable obligations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Purchase Bill</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Incurred Purchases
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {formatCurrency(totalPurchasesSum)}
          </div>
          <span className="text-[11px] text-slate-400">{purchases.length} total procurement orders</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Disbursed to Suppliers
          </span>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums mt-1">
            {formatCurrency(totalPaidSum)}
          </div>
          <span className="text-[11px] text-slate-400">Total settled payments out</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Supplier Payables Pending
          </span>
          <div className="text-xl font-bold font-mono text-rose-700 tabular-nums mt-1">
            {formatCurrency(totalPendingSum)}
          </div>
          <span className="text-[11px] text-slate-400">Obligations due to vendors</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'bills'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Purchase Bills ({purchases.length})
          </button>

          <button
            onClick={() => setActiveTab('payments-out')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'payments-out'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payments Out ({paymentsOut.length})
          </button>
        </div>

        {activeTab === 'bills' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            >
              <option value="all">All Bills</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid in Full</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {/* Purchases Table */}
      {activeTab === 'bills' && (
        <DataTable
          data={filteredPurchases}
          columns={purchaseColumns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Search by purchase #, supplier, date..."
          searchFields={['purchaseNumber', 'supplierName', 'date', 'dueDate', 'status']}
          itemsPerPage={10}
          emptyTitle="No purchase bills recorded"
          emptyMessage="Record purchases to restock items and maintain supplier payables."
          emptyAction={{
            label: '+ Record First Purchase',
            onClick: () => setIsCreateOpen(true)
          }}
          onRowClick={(p) => {
            setSelectedPurchase(p);
            setIsDetailOpen(true);
          }}
        />
      )}

      {/* Payments Out Table */}
      {activeTab === 'payments-out' && (
        <DataTable
          data={paymentsOut}
          columns={paymentOutColumns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Search by payment #, supplier, account..."
          searchFields={['paymentNumber', 'supplierName', 'paymentMethod', 'referenceNumber']}
          itemsPerPage={10}
          emptyTitle="No outgoing payments recorded"
          emptyMessage="Outgoing payments to suppliers will appear here."
        />
      )}

      {/* Modals */}
      <CreatePurchaseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(id) => {
          const p = purchases.find(pur => pur.id === id);
          if (p) {
            setSelectedPurchase(p);
            setIsDetailOpen(true);
          }
        }}
      />

      <PurchaseDetailModal
        purchase={selectedPurchase}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDuplicate={(pur) => {
          setIsCreateOpen(true);
        }}
      />

      {payOutPurchase && (
        <PaymentOutModal
          isOpen={isPaymentOutOpen}
          onClose={() => {
            setIsPaymentOutOpen(false);
            setPayOutPurchase(null);
          }}
          defaultSupplierId={payOutPurchase.supplierId}
          defaultPurchaseId={payOutPurchase.id}
        />
      )}
    </div>
  );
};
