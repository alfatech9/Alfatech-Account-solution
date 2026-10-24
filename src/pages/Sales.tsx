import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SalesInvoice, PaymentIn } from '../types';
import {
  Receipt,
  Plus,
  Download,
  Eye,
  DollarSign,
  Copy,
  Printer
} from 'lucide-react';
import { CreateSaleInvoiceModal } from '../components/modals/CreateSaleInvoiceModal';
import { InvoiceDetailModal } from '../components/modals/InvoiceDetailModal';
import { PaymentInModal } from '../components/modals/PaymentInModal';

interface SalesProps {
  onNavigate: (route: string) => void;
  openInvoiceId?: string;
}

export const Sales: React.FC<SalesProps> = ({ onNavigate, openInvoiceId }) => {
  const { salesInvoices, paymentsIn, formatCurrency, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'invoices' | 'payments-in'>('invoices');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(() => {
    if (openInvoiceId) {
      return salesInvoices.find(i => i.id === openInvoiceId) || null;
    }
    return null;
  });
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(!!openInvoiceId);

  // Payment In Modal
  const [isPaymentInOpen, setIsPaymentInOpen] = useState(false);
  const [payInInvoice, setPayInInvoice] = useState<SalesInvoice | null>(null);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return salesInvoices;
    return salesInvoices.filter(i => i.status === statusFilter);
  }, [salesInvoices, statusFilter]);

  // Aggregate metrics
  const totalSalesSum = salesInvoices.reduce((a, b) => a + (b.status !== 'cancelled' ? b.total : 0), 0);
  const totalPaidSum = salesInvoices.reduce((a, b) => a + b.paidAmount, 0);
  const totalPendingSum = salesInvoices.reduce((a, b) => a + (b.status !== 'cancelled' ? b.balance : 0), 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Invoice #', 'Customer', 'Date', 'Due Date', 'Status', 'Total', 'Paid', 'Balance', 'Terms'];
    const rows = filteredInvoices.map(i => [
      i.invoiceNumber,
      `"${i.customerName.replace(/"/g, '""')}"`,
      i.date,
      i.dueDate,
      i.status,
      i.total,
      i.paidAmount,
      i.balance,
      i.paymentTerms
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alfatechlink_sales_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Export Complete', message: `Exported ${filteredInvoices.length} invoices to CSV.` });
  };

  const invoiceColumns: Column<SalesInvoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (inv) => (
        <span className="font-mono font-bold text-slate-900 hover:text-[#16A085] transition-colors">
          {inv.invoiceNumber}
        </span>
      )
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (inv) => (
        <div>
          <span className="font-semibold text-slate-800">{inv.customerName}</span>
          {inv.customerPhone && (
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">{inv.customerPhone}</div>
          )}
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (inv) => <span className="font-mono text-slate-500">{inv.date}</span>
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (inv) => <span className="font-mono text-slate-500">{inv.dueDate}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (inv) => <StatusBadge status={inv.status} type="invoice" />
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      align: 'right',
      render: (inv) => (
        <span className="font-mono tabular-nums font-bold text-slate-900">
          {formatCurrency(inv.total)}
        </span>
      )
    },
    {
      key: 'paidAmount',
      header: 'Paid',
      sortable: true,
      align: 'right',
      render: (inv) => (
        <span className="font-mono tabular-nums font-semibold text-emerald-700">
          {formatCurrency(inv.paidAmount)}
        </span>
      )
    },
    {
      key: 'balance',
      header: 'Balance',
      sortable: true,
      align: 'right',
      render: (inv) => (
        <span
          className={`font-mono tabular-nums font-bold ${
            inv.balance > 0 ? 'text-amber-700' : 'text-slate-400'
          }`}
        >
          {formatCurrency(inv.balance)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (inv) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedInvoice(inv);
              setIsDetailOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
            title="View Invoice & Print"
          >
            <Eye className="w-4 h-4" />
          </button>

          {inv.balance > 0 && inv.status !== 'cancelled' && (
            <button
              onClick={() => {
                setPayInInvoice(inv);
                setIsPaymentInOpen(true);
              }}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
              title="Record Payment"
            >
              <DollarSign className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const paymentColumns: Column<PaymentIn>[] = [
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
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (p) => <span className="font-semibold text-slate-800">{p.customerName}</span>
    },
    {
      key: 'invoiceNumber',
      header: 'Applied Invoice',
      render: (p) => <span className="font-mono text-slate-600">{p.invoiceNumber || 'Account Credit'}</span>
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
      header: 'Amount Received',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono tabular-nums font-bold text-emerald-700">
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
            Sales & Revenue Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create professional invoices, track payment status, and manage collections.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Sales Invoice</span>
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

      {/* Aggregate Statistics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Invoiced Amount
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {formatCurrency(totalSalesSum)}
          </div>
          <span className="text-[11px] text-slate-400">{salesInvoices.length} total orders issued</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Collected Cash / Wire
          </span>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums mt-1">
            {formatCurrency(totalPaidSum)}
          </div>
          <span className="text-[11px] text-slate-400">Total settled payments in</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Outstanding Due Balance
          </span>
          <div className="text-xl font-bold font-mono text-amber-700 tabular-nums mt-1">
            {formatCurrency(totalPendingSum)}
          </div>
          <span className="text-[11px] text-slate-400">Customer receivables awaiting collection</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'invoices'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Invoices List ({salesInvoices.length})
          </button>

          <button
            onClick={() => setActiveTab('payments-in')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'payments-in'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payments In ({paymentsIn.length})
          </button>
        </div>

        {activeTab === 'invoices' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            >
              <option value="all">All Invoices</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid in Full</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      {activeTab === 'invoices' && (
        <DataTable
          data={filteredInvoices}
          columns={invoiceColumns}
          keyExtractor={(inv) => inv.id}
          searchPlaceholder="Search by invoice #, customer name, date..."
          searchFields={['invoiceNumber', 'customerName', 'date', 'dueDate', 'status']}
          itemsPerPage={10}
          emptyTitle="No invoices found"
          emptyMessage="Create your first invoice to bill customers, manage receivables, and track inventory."
          emptyAction={{
            label: '+ Create First Invoice',
            onClick: () => setIsCreateOpen(true)
          }}
          onRowClick={(inv) => {
            setSelectedInvoice(inv);
            setIsDetailOpen(true);
          }}
        />
      )}

      {/* Payments In Table */}
      {activeTab === 'payments-in' && (
        <DataTable
          data={paymentsIn}
          columns={paymentColumns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Search payments by number, customer, method..."
          searchFields={['paymentNumber', 'customerName', 'paymentMethod', 'referenceNumber']}
          itemsPerPage={10}
          emptyTitle="No payment receipts recorded"
          emptyMessage="Record incoming funds from customer orders and invoices."
        />
      )}

      {/* Modals */}
      <CreateSaleInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(id) => {
          const inv = salesInvoices.find(i => i.id === id);
          if (inv) {
            setSelectedInvoice(inv);
            setIsDetailOpen(true);
          }
        }}
      />

      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDuplicate={(inv) => {
          setIsCreateOpen(true);
        }}
      />

      {payInInvoice && (
        <PaymentInModal
          isOpen={isPaymentInOpen}
          onClose={() => {
            setIsPaymentInOpen(false);
            setPayInInvoice(null);
          }}
          defaultCustomerId={payInInvoice.customerId}
          defaultInvoiceId={payInInvoice.id}
        />
      )}
    </div>
  );
};
