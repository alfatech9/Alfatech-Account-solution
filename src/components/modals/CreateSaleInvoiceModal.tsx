import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { InvoiceItem, PaymentMethod } from '../../types';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { AddPartyModal } from './AddPartyModal';

interface CreateSaleInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
  onSuccess?: (invoiceId: string) => void;
}

export const CreateSaleInvoiceModal: React.FC<CreateSaleInvoiceModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerId,
  onSuccess
}) => {
  const {
    parties,
    items,
    accounts,
    invoiceSettings,
    taxSettings,
    salesInvoices,
    createSalesInvoice,
    formatCurrency,
    addToast
  } = useApp();

  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);

  // Form fields
  const [customerId, setCustomerId] = useState(defaultCustomerId || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [shippingCharges, setShippingCharges] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Payment
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank');
  const [paymentAccountId, setPaymentAccountId] = useState('');

  // Line Items
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);

  // Initialize auto-number
  useEffect(() => {
    if (isOpen) {
      const invCount = salesInvoices.length + 1;
      const pad = String(invCount).padStart(invoiceSettings.numberPadding, '0');
      setInvoiceNumber(`${invoiceSettings.invoicePrefix}${pad}`);

      if (accounts.length > 0 && !paymentAccountId) {
        setPaymentAccountId(accounts[0].id);
      }

      if (defaultCustomerId) {
        setCustomerId(defaultCustomerId);
      } else if (parties.length > 0 && !customerId) {
        const firstCust = parties.find(p => p.type === 'customer' || p.type === 'both');
        if (firstCust) setCustomerId(firstCust.id);
      }

      // Add 1 default empty line item if empty
      if (lineItems.length === 0 && items.length > 0) {
        const it = items[0];
        setLineItems([{
          id: 'li_' + Date.now(),
          itemId: it.id,
          itemName: it.name,
          description: '',
          quantity: 1,
          unit: it.unit,
          rate: it.sellingPrice,
          discount: 0,
          taxRate: it.taxRate || taxSettings.defaultTaxRate,
          amount: it.sellingPrice
        }]);
      }
    }
  }, [isOpen, defaultCustomerId, salesInvoices.length, invoiceSettings, items, parties, accounts]);

  const handleItemSelect = (index: number, itemId: string) => {
    const it = items.find(i => i.id === itemId);
    if (!it) return;

    setLineItems(prev => {
      const copy = [...prev];
      const qty = copy[index].quantity || 1;
      const rate = it.sellingPrice;
      const disc = copy[index].discount || 0;
      const base = qty * rate;
      const discounted = Math.max(0, base - disc);
      const taxAmt = (discounted * (it.taxRate || taxSettings.defaultTaxRate)) / 100;
      const total = discounted + taxAmt;

      copy[index] = {
        ...copy[index],
        itemId: it.id,
        itemName: it.name,
        unit: it.unit,
        rate,
        taxRate: it.taxRate || taxSettings.defaultTaxRate,
        amount: total
      };
      return copy;
    });
  };

  const handleLineItemChange = (index: number, field: keyof InvoiceItem, val: any) => {
    setLineItems(prev => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: val };

      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const disc = Number(item.discount) || 0;
      const taxRate = Number(item.taxRate) || 0;

      const base = qty * rate;
      const discounted = Math.max(0, base - disc);
      const taxAmt = (discounted * taxRate) / 100;
      item.amount = discounted + taxAmt;

      copy[index] = item;
      return copy;
    });
  };

  const addLineItem = () => {
    if (items.length === 0) return;
    const it = items[0];
    setLineItems(prev => [
      ...prev,
      {
        id: 'li_' + Date.now() + Math.random().toString(36).substring(2, 5),
        itemId: it.id,
        itemName: it.name,
        description: '',
        quantity: 1,
        unit: it.unit,
        rate: it.sellingPrice,
        discount: 0,
        taxRate: it.taxRate || taxSettings.defaultTaxRate,
        amount: it.sellingPrice
      }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = lineItems.reduce((acc, li) => acc + (li.quantity * li.rate), 0);
  const discountTotal = lineItems.reduce((acc, li) => acc + (Number(li.discount) || 0), 0);
  const taxTotal = lineItems.reduce((acc, li) => {
    const discounted = Math.max(0, (li.quantity * li.rate) - (Number(li.discount) || 0));
    return acc + (discounted * (Number(li.taxRate) || 0) / 100);
  }, 0);
  const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal + (Number(shippingCharges) || 0));
  const outstandingBalance = Math.max(0, grandTotal - (Number(paidAmount) || 0));

  const handleSave = (action: 'save' | 'print' | 'send') => {
    if (!customerId) return;
    const cust = parties.find(p => p.id === customerId);
    if (!cust) return;

    if (lineItems.length === 0 || lineItems.some(li => li.quantity <= 0)) {
      addToast({
        type: 'warning',
        title: 'Line Item Required',
        message: 'Please add at least one line item with a quantity greater than zero.'
      });
      return;
    }

    const created = createSalesInvoice({
      invoiceNumber: invoiceNumber.trim(),
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerEmail: cust.email,
      customerAddress: cust.address ? `${cust.address}, ${cust.city}` : undefined,
      date,
      dueDate,
      paymentTerms,
      items: lineItems,
      subtotal,
      discountTotal,
      taxTotal,
      shippingCharges: Number(shippingCharges) || 0,
      total: grandTotal,
      paidAmount: Number(paidAmount) || 0,
      status: Number(paidAmount) >= grandTotal ? 'paid' : Number(paidAmount) > 0 ? 'partially_paid' : 'unpaid',
      paymentMethod: Number(paidAmount) > 0 ? paymentMethod : undefined,
      paymentAccountId: Number(paidAmount) > 0 ? paymentAccountId : undefined,
      notes: notes.trim()
    });

    onClose();
    if (onSuccess) onSuccess(created.id);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create Sales Invoice"
        subtitle="Issue an invoice to a customer, adjust stock, and record receivables"
        maxWidth="5xl"
      >
        <div className="space-y-5">
          {/* Top Form Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
            {/* Customer selector */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Customer *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddPartyOpen(true)}
                  className="text-[11px] text-[#16A085] hover:underline font-semibold flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ New Customer</span>
                </button>
              </div>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              >
                <option value="">-- Choose Customer --</option>
                {parties
                  .filter(p => p.type === 'customer' || p.type === 'both')
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.phone ? `(${p.phone})` : ''} - Bal: {formatCurrency(p.balance)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Invoice Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            {/* Terms */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => {
                  setPaymentTerms(e.target.value);
                  const days = e.target.value === 'Immediate' ? 0 : e.target.value === 'Net 15' ? 15 : e.target.value === 'Net 60' ? 60 : 30;
                  const d = new Date(date);
                  d.setDate(d.getDate() + days);
                  setDueDate(d.toISOString().split('T')[0]);
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              >
                <option value="Immediate">Immediate / Due on Receipt</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Product Items & Rates
              </span>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A085] hover:text-[#0E7C66]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Row</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3 w-5/12">Item & Description</th>
                    <th className="py-2.5 px-3 w-1/12 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-1/12">Unit</th>
                    <th className="py-2.5 px-3 w-2/12 text-right">Rate</th>
                    <th className="py-2.5 px-3 w-1/12 text-right">Discount</th>
                    <th className="py-2.5 px-3 w-1/12 text-right">Tax %</th>
                    <th className="py-2.5 px-3 w-2/12 text-right">Amount</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((li, idx) => {
                    const matchedItem = items.find(i => i.id === li.itemId);
                    return (
                      <tr key={li.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3">
                          <select
                            value={li.itemId}
                            onChange={(e) => handleItemSelect(idx, e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white font-medium focus:ring-1 focus:ring-[#16A085]"
                          >
                            {items.map(it => (
                              <option key={it.id} value={it.id}>
                                {it.name} (Stock: {it.currentStock} {it.unit})
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Optional item notes / serial numbers"
                            value={li.description || ''}
                            onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                            className="w-full text-[11px] px-2 py-1 mt-1 border border-slate-200 rounded text-slate-600 placeholder-slate-400"
                          />
                          {matchedItem && matchedItem.currentStock < li.quantity && (
                            <span className="text-[10px] text-amber-600 font-medium mt-0.5 block">
                              Warning: Order quantity exceeds current stock ({matchedItem.currentStock} available)
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={li.quantity}
                            onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-16 text-center text-xs p-1.5 border border-slate-200 rounded font-mono"
                          />
                        </td>

                        <td className="py-2 px-3 text-slate-500 font-mono text-center">
                          {li.unit}
                        </td>

                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="any"
                            value={li.rate}
                            onChange={(e) => handleLineItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-24 text-right text-xs p-1.5 border border-slate-200 rounded font-mono"
                          />
                        </td>

                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="any"
                            value={li.discount}
                            onChange={(e) => handleLineItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-16 text-right text-xs p-1.5 border border-slate-200 rounded font-mono"
                          />
                        </td>

                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="any"
                            value={li.taxRate}
                            onChange={(e) => handleLineItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                            className="w-14 text-right text-xs p-1.5 border border-slate-200 rounded font-mono"
                          />
                        </td>

                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                          {formatCurrency(li.amount)}
                        </td>

                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLineItem(idx)}
                            disabled={lineItems.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Calculations & Immediate Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left: Immediate Payment & Notes */}
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment Collection (Optional)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount Received Now
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-mono font-semibold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setPaidAmount(grandTotal)}
                      className="text-[10px] text-blue-600 hover:underline font-medium"
                    >
                      Pay Full ({formatCurrency(grandTotal)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(0)}
                      className="text-[10px] text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Wire / Transfer</option>
                    <option value="Mobile Banking">Mobile Banking / Wallet</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deposit Into Account
                  </label>
                  <select
                    value={paymentAccountId}
                    onChange={(e) => setPaymentAccountId(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} - Bal: {formatCurrency(acc.balance)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Notes & Special Terms
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thank you for your business. Please quote invoice number on bank transfers."
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>
            </div>

            {/* Right: Totals Breakdown */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Invoice Summary
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Total Discount</span>
                <span className="font-mono font-medium text-rose-600">-{formatCurrency(discountTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Estimated Tax / VAT</span>
                <span className="font-mono font-medium">{formatCurrency(taxTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>Shipping & Delivery Charges</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={shippingCharges || ''}
                  onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-24 text-right text-xs px-2 py-1 border border-slate-200 rounded bg-white font-mono"
                />
              </div>

              <div className="border-t border-slate-200 my-2 pt-2 flex items-center justify-between text-sm font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="font-mono text-base text-[#16A085]">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Immediate Payment</span>
                <span className="font-mono font-semibold text-emerald-700">{formatCurrency(paidAmount || 0)}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>Outstanding Balance Due</span>
                <span className="font-mono text-amber-700">{formatCurrency(outstandingBalance)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave('save')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave('print')}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg transition-colors shadow-xs"
              >
                Save & Open Invoice
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Embedded inline Add Party modal if customer clicks + New Customer */}
      <AddPartyModal
        isOpen={isAddPartyOpen}
        onClose={() => setIsAddPartyOpen(false)}
        defaultType="customer"
        onSuccess={(id) => setCustomerId(id)}
      />
    </>
  );
};
