import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Party, PartyType } from '../types';
import {
  UserPlus,
  Download,
  Upload,
  Eye,
  Plus,
  DollarSign,
  CreditCard,
  Trash2,
  Phone,
  Mail
} from 'lucide-react';
import { AddPartyModal } from '../components/modals/AddPartyModal';
import { PartyDetailModal } from '../components/modals/PartyDetailModal';
import { CreateSaleInvoiceModal } from '../components/modals/CreateSaleInvoiceModal';
import { CreatePurchaseModal } from '../components/modals/CreatePurchaseModal';
import { PaymentInModal } from '../components/modals/PaymentInModal';
import { PaymentOutModal } from '../components/modals/PaymentOutModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface PartiesProps {
  onNavigate: (route: string) => void;
}

export const Parties: React.FC<PartiesProps> = ({ onNavigate }) => {
  const { parties, deleteParty, formatCurrency, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'customer' | 'supplier' | 'both'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);

  // Quick Action target states
  const [actionParty, setActionParty] = useState<Party | null>(null);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isPayInOpen, setIsPayInOpen] = useState(false);
  const [isPayOutOpen, setIsPayOutOpen] = useState(false);

  // Filter parties by tab & status
  const filteredParties = useMemo(() => {
    return parties.filter(p => {
      const matchType =
        activeTab === 'all'
          ? true
          : activeTab === 'customer'
          ? p.type === 'customer' || p.type === 'both'
          : activeTab === 'supplier'
          ? p.type === 'supplier' || p.type === 'both'
          : p.type === 'both';

      const matchStatus =
        statusFilter === 'all' ? true : p.status === statusFilter;

      return matchType && matchStatus;
    });
  }, [parties, activeTab, statusFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Party Name', 'Type', 'Phone', 'Email', 'Address', 'Receivable', 'Payable', 'Net Balance', 'Status'];
    const rows = filteredParties.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.type,
      `"${p.phone || ''}"`,
      `"${p.email || ''}"`,
      `"${(p.address || '') + ' ' + (p.city || '')}"`,
      p.currentReceivable,
      p.currentPayable,
      p.balance,
      p.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alfatechlink_parties_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Export Complete', message: `Exported ${filteredParties.length} parties to CSV.` });
  };

  const columns: Column<Party>[] = [
    {
      key: 'name',
      header: 'Party Name',
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 hover:text-[#16A085] transition-colors">
            {p.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {p.city ? `${p.city}, ${p.country}` : 'No location specified'}
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (p) => (
        <div className="space-y-0.5 text-[11px] text-slate-600">
          {p.phone && (
            <div className="flex items-center gap-1.5 font-mono">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{p.phone}</span>
            </div>
          )}
          {p.email && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Mail className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[150px]">{p.email}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (p) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
          p.type === 'customer'
            ? 'bg-blue-50 text-blue-700'
            : p.type === 'supplier'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-emerald-50 text-emerald-700'
        }`}>
          {p.type}
        </span>
      )
    },
    {
      key: 'currentReceivable',
      header: 'Receivable',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono tabular-nums font-semibold text-emerald-700">
          {p.currentReceivable > 0 ? formatCurrency(p.currentReceivable) : '—'}
        </span>
      )
    },
    {
      key: 'currentPayable',
      header: 'Payable',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono tabular-nums font-semibold text-rose-700">
          {p.currentPayable > 0 ? formatCurrency(p.currentPayable) : '—'}
        </span>
      )
    },
    {
      key: 'balance',
      header: 'Net Balance',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span
          className={`font-mono tabular-nums font-bold ${
            p.balance > 0
              ? 'text-emerald-700'
              : p.balance < 0
              ? 'text-rose-700'
              : 'text-slate-500'
          }`}
        >
          {formatCurrency(Math.abs(p.balance))}
          <span className="text-[10px] font-normal text-slate-400 ml-1">
            {p.balance > 0 ? 'Dr' : p.balance < 0 ? 'Cr' : ''}
          </span>
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => <StatusBadge status={p.status} type="party" />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedParty(p);
              setIsDetailOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
            title="View full statement and history"
          >
            <Eye className="w-4 h-4" />
          </button>

          {(p.type === 'customer' || p.type === 'both') && (
            <>
              <button
                onClick={() => {
                  setActionParty(p);
                  setIsSaleOpen(true);
                }}
                className="p-1.5 text-[#16A085] hover:bg-[#16A085]/10 rounded-md transition-colors"
                title="Create Sale Invoice"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActionParty(p);
                  setIsPayInOpen(true);
                }}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                title="Receive Payment"
              >
                <DollarSign className="w-4 h-4" />
              </button>
            </>
          )}

          {(p.type === 'supplier' || p.type === 'both') && (
            <>
              <button
                onClick={() => {
                  setActionParty(p);
                  setIsPurchaseOpen(true);
                }}
                className="p-1.5 text-[#2F80ED] hover:bg-[#2F80ED]/10 rounded-md transition-colors"
                title="Create Purchase Bill"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActionParty(p);
                  setIsPayOutOpen(true);
                }}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                title="Pay Supplier"
              >
                <CreditCard className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => {
              setPartyToDelete(p);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
            title="Delete Party"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Parties Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer accounts, supplier ledgers, outstanding credit, and statements.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddPartyOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Party</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onNavigate('import-data')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['all', 'customer', 'supplier', 'both'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? 'All Parties' : tab === 'both' ? 'Dual Role' : `${tab}s`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        data={filteredParties}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search by name, phone, email, city..."
        searchFields={['name', 'phone', 'email', 'city', 'taxNumber']}
        itemsPerPage={10}
        emptyTitle="No parties found"
        emptyMessage="Create your first customer or vendor to begin invoicing and recording ledger balances."
        emptyAction={{
          label: '+ Add First Party',
          onClick: () => setIsAddPartyOpen(true)
        }}
        onRowClick={(p) => {
          setSelectedParty(p);
          setIsDetailOpen(true);
        }}
      />

      {/* Modals */}
      <AddPartyModal
        isOpen={isAddPartyOpen}
        onClose={() => setIsAddPartyOpen(false)}
        defaultType={activeTab === 'supplier' ? 'supplier' : 'customer'}
      />

      <PartyDetailModal
        party={selectedParty}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {actionParty && (
        <>
          <CreateSaleInvoiceModal
            isOpen={isSaleOpen}
            onClose={() => setIsSaleOpen(false)}
            defaultCustomerId={actionParty.id}
          />
          <CreatePurchaseModal
            isOpen={isPurchaseOpen}
            onClose={() => setIsPurchaseOpen(false)}
            defaultSupplierId={actionParty.id}
          />
          <PaymentInModal
            isOpen={isPayInOpen}
            onClose={() => setIsPayInOpen(false)}
            defaultCustomerId={actionParty.id}
          />
          <PaymentOutModal
            isOpen={isPayOutOpen}
            onClose={() => setIsPayOutOpen(false)}
            defaultSupplierId={actionParty.id}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={!!partyToDelete}
        onClose={() => setPartyToDelete(null)}
        onConfirm={() => {
          if (partyToDelete) {
            deleteParty(partyToDelete.id);
            addToast({ type: 'success', title: 'Party Deleted', message: `Party "${partyToDelete.name}" has been deleted.` });
          }
        }}
        title="Delete Party Contact"
        message={`Are you sure you want to delete "${partyToDelete?.name}"? All past invoices will remain, but this contact will be removed.`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
