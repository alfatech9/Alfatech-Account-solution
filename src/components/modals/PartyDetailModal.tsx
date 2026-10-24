import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Party } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileText,
  DollarSign,
  CreditCard,
  Plus,
  Printer,
  Download,
  Calendar,
  Building,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { CreateSaleInvoiceModal } from './CreateSaleInvoiceModal';
import { CreatePurchaseModal } from './CreatePurchaseModal';
import { PaymentInModal } from './PaymentInModal';
import { PaymentOutModal } from './PaymentOutModal';
import { exportReportToPDF, printReportHtml } from '../../utils/reportExporter';

interface PartyDetailModalProps {
  party: Party | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInvoice?: (id: string) => void;
  onOpenPurchase?: (id: string) => void;
}

export const PartyDetailModal: React.FC<PartyDetailModalProps> = ({
  party,
  isOpen,
  onClose
}) => {
  const {
    salesInvoices,
    purchases,
    paymentsIn,
    paymentsOut,
    currentBusiness,
    formatCurrency,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'sales' | 'purchases' | 'payments' | 'statement'>('overview');

  // Quick Action Modal states
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isPayInOpen, setIsPayInOpen] = useState(false);
  const [isPayOutOpen, setIsPayOutOpen] = useState(false);

  // Statement date range
  const [stmtStart, setStmtStart] = useState('2026-01-01');
  const [stmtEnd, setStmtEnd] = useState('2026-12-31');

  if (!party) return null;

  // Filter linked transactions
  const partySales = salesInvoices.filter(i => i.customerId === party.id);
  const partyPurchases = purchases.filter(p => p.supplierId === party.id);
  const partyPaymentsIn = paymentsIn.filter(p => p.customerId === party.id);
  const partyPaymentsOut = paymentsOut.filter(p => p.supplierId === party.id);

  const totalSalesAmount = partySales.reduce((acc, s) => acc + s.total, 0);
  const totalPurchasesAmount = partyPurchases.reduce((acc, p) => acc + p.total, 0);
  const totalReceived = partyPaymentsIn.reduce((acc, p) => acc + p.amount, 0);
  const totalPaid = partyPaymentsOut.reduce((acc, p) => acc + p.amount, 0);

  // Unified chronological transactions
  const combinedTransactions = useMemo(() => {
    const list: Array<{
      date: string;
      type: 'Sale Invoice' | 'Purchase Bill' | 'Payment In' | 'Payment Out';
      ref: string;
      description: string;
      debit: number; // receivable increment or payable decrement
      credit: number; // receivable decrement or payable increment
    }> = [];

    partySales.forEach(s => {
      list.push({
        date: s.date,
        type: 'Sale Invoice',
        ref: s.invoiceNumber,
        description: `Invoice for ${s.items.length} items`,
        debit: s.total,
        credit: 0
      });
    });

    partyPurchases.forEach(p => {
      list.push({
        date: p.date,
        type: 'Purchase Bill',
        ref: p.purchaseNumber,
        description: `Purchase order for ${p.items.length} items`,
        debit: 0,
        credit: p.total
      });
    });

    partyPaymentsIn.forEach(pin => {
      list.push({
        date: pin.date,
        type: 'Payment In',
        ref: pin.paymentNumber,
        description: `Payment received (${pin.paymentMethod})`,
        debit: 0,
        credit: pin.amount
      });
    });

    partyPaymentsOut.forEach(pout => {
      list.push({
        date: pout.date,
        type: 'Payment Out',
        ref: pout.paymentNumber,
        description: `Payment made (${pout.paymentMethod})`,
        debit: pout.amount,
        credit: 0
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [partySales, partyPurchases, partyPaymentsIn, partyPaymentsOut]);

  // Statement transactions filtered by date
  const statementTransactions = combinedTransactions.filter(
    t => t.date >= stmtStart && t.date <= stmtEnd
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={party.name}
        subtitle={`${party.type.toUpperCase()} · ${party.city || 'United States'} · Tax ID: ${party.taxNumber || 'N/A'}`}
        maxWidth="5xl"
      >
        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 no-print">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Sales
            </span>
            <div className="text-sm font-bold font-mono text-slate-800 tabular-nums mt-0.5">
              {formatCurrency(totalSalesAmount)}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Purchases
            </span>
            <div className="text-sm font-bold font-mono text-slate-800 tabular-nums mt-0.5">
              {formatCurrency(totalPurchasesAmount)}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Amount Received
            </span>
            <div className="text-sm font-bold font-mono text-emerald-700 tabular-nums mt-0.5">
              {formatCurrency(totalReceived)}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Amount Paid
            </span>
            <div className="text-sm font-bold font-mono text-rose-700 tabular-nums mt-0.5">
              {formatCurrency(totalPaid)}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white border-2 border-slate-300 rounded-lg p-3 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
              Net Balance
            </span>
            <div
              className={`text-sm font-extrabold font-mono tabular-nums mt-0.5 ${
                party.balance > 0
                  ? 'text-emerald-700'
                  : party.balance < 0
                  ? 'text-rose-700'
                  : 'text-slate-800'
              }`}
            >
              {formatCurrency(Math.abs(party.balance))}
              <span className="text-[10px] font-sans font-medium text-slate-500 ml-1">
                {party.balance > 0 ? '(Rec)' : party.balance < 0 ? '(Pay)' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(['overview', 'transactions', 'sales', 'purchases', 'payments', 'statement'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(party.type === 'customer' || party.type === 'both') && (
              <>
                <button
                  onClick={() => setIsSaleOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Sale</span>
                </button>
                <button
                  onClick={() => setIsPayInOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Receive Payment</span>
                </button>
              </>
            )}

            {(party.type === 'supplier' || party.type === 'both') && (
              <>
                <button
                  onClick={() => setIsPurchaseOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Purchase</span>
                </button>
                <button
                  onClick={() => setIsPayOutOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Supplier</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          {/* 1. Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contact & Address
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{party.phone || 'No phone provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{party.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {party.address ? `${party.address}, ${party.city}, ${party.country}` : 'No physical address'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Tax ID: {party.taxNumber || 'Not registered'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Financial Status & Notes
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <StatusBadge status={party.status} type="party" />
                    </div>
                    <div className="flex justify-between">
                      <span>Current Receivable:</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        {formatCurrency(party.currentReceivable)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Payable:</span>
                      <span className="font-mono font-semibold text-rose-700">
                        {formatCurrency(party.currentPayable)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Opening Balance:</span>
                      <span className="font-mono">
                        {formatCurrency(party.openingBalance)} ({party.balanceType})
                      </span>
                    </div>
                    {party.notes && (
                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                        "{party.notes}"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent activity summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Recent Commercial Activity
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Ref</th>
                        <th className="py-2 px-3 text-right">Debit</th>
                        <th className="py-2 px-3 text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {combinedTransactions.slice(0, 5).map((txn, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500">{txn.date}</td>
                          <td className="py-2 px-3 font-medium">{txn.type}</td>
                          <td className="py-2 px-3 font-mono text-slate-700">{txn.ref}</td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                            {txn.debit > 0 ? formatCurrency(txn.debit) : '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-emerald-700">
                            {txn.credit > 0 ? formatCurrency(txn.credit) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Reference #</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Debit</th>
                      <th className="py-2.5 px-3 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {combinedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No transactions recorded yet
                        </td>
                      </tr>
                    ) : (
                      combinedTransactions.map((txn, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-500">{txn.date}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800">{txn.type}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{txn.ref}</td>
                          <td className="py-2.5 px-3 text-slate-500">{txn.description}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                            {txn.debit > 0 ? formatCurrency(txn.debit) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                            {txn.credit > 0 ? formatCurrency(txn.credit) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Sales Tab */}
          {activeTab === 'sales' && (
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partySales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No sales invoices issued for this party
                      </td>
                    </tr>
                  ) : (
                    partySales.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{inv.date}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{inv.dueDate}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={inv.status} type="invoice" />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{formatCurrency(inv.total)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{formatCurrency(inv.paidAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">{formatCurrency(inv.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Purchases Tab */}
          {activeTab === 'purchases' && (
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Purchase #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Payable Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partyPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No purchase bills recorded for this party
                      </td>
                    </tr>
                  ) : (
                    partyPurchases.map(pur => (
                      <tr key={pur.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{pur.purchaseNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{pur.date}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{pur.dueDate}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={pur.status} type="purchase" />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{formatCurrency(pur.total)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{formatCurrency(pur.paidAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">{formatCurrency(pur.balance)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Payment #</th>
                      <th className="py-2.5 px-3">Direction</th>
                      <th className="py-2.5 px-3">Method & Account</th>
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...partyPaymentsIn.map(p => ({ ...p, dir: 'IN' as const })), ...partyPaymentsOut.map(p => ({ ...p, dir: 'OUT' as const }))]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-500">{p.date}</td>
                          <td className="py-2.5 px-3 font-mono font-semibold">{p.paymentNumber}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              p.dir === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {p.dir === 'IN' ? 'Payment In (Received)' : 'Payment Out (Paid)'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{p.paymentMethod} · {p.accountName}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{p.referenceNumber || '—'}</td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                            p.dir === 'IN' ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Statement Tab (Printable Statement of Account) */}
          {activeTab === 'statement' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 no-print">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">Statement Range:</span>
                  <input
                    type="date"
                    value={stmtStart}
                    onChange={(e) => setStmtStart(e.target.value)}
                    className="text-xs p-1 border border-slate-200 rounded bg-white"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="date"
                    value={stmtEnd}
                    onChange={(e) => setStmtEnd(e.target.value)}
                    className="text-xs p-1 border border-slate-200 rounded bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const totalDebit = statementTransactions.reduce((acc, t) => acc + t.debit, 0);
                      const totalCredit = statementTransactions.reduce((acc, t) => acc + t.credit, 0);
                      const opts = {
                        businessName: currentBusiness.name || 'Alfatechlink Business',
                        businessAddress: [currentBusiness.address, currentBusiness.city].filter(Boolean).join(', '),
                        businessTaxId: currentBusiness.taxNumber,
                        reportTitle: `Statement of Account: ${party.name}`,
                        startDate: stmtStart,
                        endDate: stmtEnd,
                        filenamePrefix: `Statement_${party.name.replace(/\s+/g, '_')}`,
                        headers: ['Date', 'Transaction Type', 'Reference #', 'Debit', 'Credit'],
                        rows: statementTransactions.length > 0
                          ? statementTransactions.map(t => [
                              t.date,
                              t.type,
                              t.ref,
                              t.debit > 0 ? formatCurrency(t.debit) : '—',
                              t.credit > 0 ? formatCurrency(t.credit) : '—'
                            ])
                          : [['No statement transactions in selected period', '—', '—', formatCurrency(0), formatCurrency(0)]],
                        columnAlignments: ['left', 'left', 'left', 'right', 'right'] as const,
                        summaryRows: [
                          { label: 'Total Debit', value: formatCurrency(totalDebit) },
                          { label: 'Total Credit', value: formatCurrency(totalCredit) },
                          { label: 'Closing Balance', value: formatCurrency(Math.abs(party.balance)) }
                        ]
                      };
                      printReportHtml(opts);
                      addToast({ type: 'info', title: 'Print Statement', message: `Printing account statement for ${party.name}.` });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Statement</span>
                  </button>

                  <button
                    onClick={() => {
                      const totalDebit = statementTransactions.reduce((acc, t) => acc + t.debit, 0);
                      const totalCredit = statementTransactions.reduce((acc, t) => acc + t.credit, 0);
                      const opts = {
                        businessName: currentBusiness.name || 'Alfatechlink Business',
                        businessAddress: [currentBusiness.address, currentBusiness.city].filter(Boolean).join(', '),
                        businessTaxId: currentBusiness.taxNumber,
                        reportTitle: `Statement of Account: ${party.name}`,
                        startDate: stmtStart,
                        endDate: stmtEnd,
                        filenamePrefix: `Statement_${party.name.replace(/\s+/g, '_')}`,
                        headers: ['Date', 'Transaction Type', 'Reference #', 'Debit', 'Credit'],
                        rows: statementTransactions.length > 0
                          ? statementTransactions.map(t => [
                              t.date,
                              t.type,
                              t.ref,
                              t.debit > 0 ? formatCurrency(t.debit) : '—',
                              t.credit > 0 ? formatCurrency(t.credit) : '—'
                            ])
                          : [['No statement transactions in selected period', '—', '—', formatCurrency(0), formatCurrency(0)]],
                        columnAlignments: ['left', 'left', 'left', 'right', 'right'] as const,
                        summaryRows: [
                          { label: 'Total Debit', value: formatCurrency(totalDebit) },
                          { label: 'Total Credit', value: formatCurrency(totalCredit) },
                          { label: 'Closing Balance', value: formatCurrency(Math.abs(party.balance)) }
                        ]
                      };
                      exportReportToPDF(opts);
                      addToast({ type: 'success', title: 'Statement PDF Downloaded', message: `Downloaded statement for ${party.name}.` });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-600" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Statement Sheet */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 text-xs space-y-6 printable-area">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{currentBusiness.name}</h3>
                    <p className="text-xs text-slate-500">{currentBusiness.address}, {currentBusiness.city}</p>
                    <p className="text-xs text-slate-500">Tax ID: {currentBusiness.taxNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#16A085] uppercase tracking-wider block">
                      STATEMENT OF ACCOUNT
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      Period: {stmtStart} to {stmtEnd}
                    </span>
                  </div>
                </div>

                <div className="border-b border-slate-200 pb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Statement For</span>
                  <div className="text-sm font-bold text-slate-800">{party.name}</div>
                  <div className="text-xs text-slate-500">{party.phone} · {party.email}</div>
                  <div className="text-xs text-slate-500">{party.address}, {party.city}</div>
                </div>

                <table className="w-full text-left">
                  <thead className="border-b border-slate-300 text-slate-600 font-bold text-[11px] uppercase">
                    <tr>
                      <th className="py-2">Date</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Reference</th>
                      <th className="py-2 text-right">Debit</th>
                      <th className="py-2 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statementTransactions.map((t, idx) => (
                      <tr key={idx} className="py-2">
                        <td className="py-2 font-mono text-slate-500">{t.date}</td>
                        <td className="py-2 font-medium">{t.type}</td>
                        <td className="py-2 font-mono">{t.ref}</td>
                        <td className="py-2 text-right font-mono">{t.debit > 0 ? formatCurrency(t.debit) : '—'}</td>
                        <td className="py-2 text-right font-mono text-emerald-700">{t.credit > 0 ? formatCurrency(t.credit) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <div className="w-64 space-y-1.5 text-right">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Debit:</span>
                      <span className="font-mono">{formatCurrency(statementTransactions.reduce((acc, t) => acc + t.debit, 0))}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Credit:</span>
                      <span className="font-mono">{formatCurrency(statementTransactions.reduce((acc, t) => acc + t.credit, 0))}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2 text-sm">
                      <span>Current Closing Balance:</span>
                      <span className="font-mono text-[#16A085]">{formatCurrency(Math.abs(party.balance))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Embedded Action Modals */}
      <CreateSaleInvoiceModal
        isOpen={isSaleOpen}
        onClose={() => setIsSaleOpen(false)}
        defaultCustomerId={party.id}
      />

      <CreatePurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        defaultSupplierId={party.id}
      />

      <PaymentInModal
        isOpen={isPayInOpen}
        onClose={() => setIsPayInOpen(false)}
        defaultCustomerId={party.id}
      />

      <PaymentOutModal
        isOpen={isPayOutOpen}
        onClose={() => setIsPayOutOpen(false)}
        defaultSupplierId={party.id}
      />
    </>
  );
};
