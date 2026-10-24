import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { InvoiceItem, PaymentMethod } from '../../types';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { AddPartyModal } from './AddPartyModal';

interface CreatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSupplierId?: string;
  onSuccess?: (purchaseId: string) => void;
}

export const CreatePurchaseModal: React.FC<CreatePurchaseModalProps> = ({
  isOpen,
  onClose,
  defaultSupplierId,
  onSuccess
}) => {
  const {
    parties,
    items,
    accounts,
    invoiceSettings,
    taxSettings,
    purchases,
    createPurchaseBill,
    formatCurrency,
    addToast
  } = useApp();

  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);

  const [supplierId, setSupplierId] = useState(defaultSupplierId || '');
  const [purchaseNumber, setPurchaseNumber] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [shippingCharges, setShippingCharges] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Payment
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank');
  const [paymentAccountId, setPaymentAccountId] = useState('');

  // Line Items
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const purCount = purchases.length + 1;
      const pad = String(purCount).padStart(invoiceSettings.numberPadding, '0');
      setPurchaseNumber(`${invoiceSettings.purchasePrefix}${pad}`);

      if (accounts.length > 0 && !paymentAccountId) {
        setPaymentAccountId(accounts[0].id);
      }

      if (defaultSupplierId) {
        setSupplierId(defaultSupplierId);
      } else if (parties.length > 0 && !supplierId) {
        const firstSupp = parties.find(p => p.type === 'supplier' || p.type === 'both');
        if (firstSupp) setSupplierId(firstSupp.id);
      }

      if (lineItems.length === 0 && items.length > 0) {
        const it = items[0];
        setLineItems([{
          id: 'pli_' + Date.now(),
          itemId: it.id,
          itemName: it.name,
          description: '',
          quantity: 1,
          unit: it.unit,
          rate: it.purchasePrice,
          discount: 0,
          taxRate: it.taxRate || taxSettings.defaultTaxRate,
          amount: it.purchasePrice
        }]);
      }
    }
  }, [isOpen, defaultSupplierId, purchases.length, invoiceSettings, items, parties, accounts]);

  const handleItemSelect = (index: number, itemId: string) => {
    const it = items.find(i => i.id === itemId);
    if (!it) return;

    setLineItems(prev => {
      const copy = [...prev];
      const qty = copy[index].quantity || 1;
      const rate = it.purchasePrice;
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
        id: 'pli_' + Date.now() + Math.random().toString(36).substring(2, 5),
        itemId: it.id,
        itemName: it.name,
        description: '',
        quantity: 1,
        unit: it.unit,
        rate: it.purchasePrice,
        discount: 0,
        taxRate: it.taxRate || taxSettings.defaultTaxRate,
        amount: it.purchasePrice
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

  const handleSave = () => {
    if (!supplierId) return;
    const supp = parties.find(p => p.id === supplierId);
    if (!supp) return;

    if (lineItems.length === 0 || lineItems.some(li => li.quantity <= 0)) {
      addToast({
        type: 'warning',
        title: 'Line Item Required',
        message: 'Please add at least one line item with a quantity greater than zero.'
      });
      return;
    }

    const created = createPurchaseBill({
      purchaseNumber: purchaseNumber.trim(),
      supplierId: supp.id,
      supplierName: supp.name,
      supplierPhone: supp.phone,
      supplierEmail: supp.email,
      date,
      dueDate,
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
        title="Record Purchase Bill"
        subtitle="Intake inventory stock, calculate payables, and record supplier invoices"
        maxWidth="5xl"
      >
        <div className="space-y-5">
          {/* Top Form Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
            {/* Supplier selector */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Supplier *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddPartyOpen(true)}
                  className="text-[11px] text-[#16A085] hover:underline font-semibold flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ New Supplier</span>
                </button>
              </div>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              >
                <option value="">-- Choose Supplier --</option>
                {parties
                  .filter(p => p.type === 'supplier' || p.type === 'both')
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.phone ? `(${p.phone})` : ''} - Payable: {formatCurrency(p.currentPayable)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Purchase Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Order / Bill # *
              </label>
              <input
                type="text"
                value={purchaseNumber}
                onChange={(e) => setPurchaseNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            {/* Bill Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bill Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Supplied Items & Quantities (Auto Increases Stock)
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
                    <th className="py-2.5 px-3 w-5/12">Item</th>
                    <th className="py-2.5 px-3 w-1/12 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-1/12">Unit</th>
                    <th className="py-2.5 px-3 w-2/12 text-right">Purchase Rate</th>
                    <th className="py-2.5 px-3 w-1/12 text-right">Discount</th>
                    <th className="py-2.5 px-3 w-1/12 text-right">Tax %</th>
                    <th className="py-2.5 px-3 w-2/12 text-right">Amount</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((li, idx) => (
                    <tr key={li.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <select
                          value={li.itemId}
                          onChange={(e) => handleItemSelect(idx, e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white font-medium focus:ring-1 focus:ring-[#16A085]"
                        >
                          {items.map(it => (
                            <option key={it.id} value={it.id}>
                              {it.name} (Current: {it.currentStock} {it.unit})
                            </option>
                          ))}
                        </select>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Calculations & Immediate Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left: Immediate Payment Out */}
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Immediate Supplier Payment (Optional)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount Paid Now
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-mono font-semibold text-rose-700 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
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
                    <option value="Bank">Bank Wire / ACH</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Corporate Card</option>
                    <option value="Mobile Banking">Mobile Wallet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Paid From Account
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
                  Purchase Order Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Carrier reference, intake bay notes, etc."
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>
            </div>

            {/* Right: Totals */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Purchase Summary
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Discount</span>
                <span className="font-mono font-medium text-emerald-600">-{formatCurrency(discountTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Tax / VAT</span>
                <span className="font-mono font-medium">{formatCurrency(taxTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>Freight & Inbound Handling</span>
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
                <span className="font-mono text-base text-slate-900">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Paid Now</span>
                <span className="font-mono font-semibold text-rose-600">{formatCurrency(paidAmount || 0)}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>Supplier Payable Balance</span>
                <span className="font-mono text-rose-700">{formatCurrency(outstandingBalance)}</span>
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

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg transition-colors shadow-xs"
            >
              Save & Intake Inventory
            </button>
          </div>
        </div>
      </Modal>

      <AddPartyModal
        isOpen={isAddPartyOpen}
        onClose={() => setIsAddPartyOpen(false)}
        defaultType="supplier"
        onSuccess={(id) => setSupplierId(id)}
      />
    </>
  );
};
