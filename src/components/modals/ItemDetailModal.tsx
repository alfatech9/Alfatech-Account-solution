import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Item } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Package, Sliders } from 'lucide-react';

interface ItemDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const {
    salesInvoices,
    purchases,
    stockMovements,
    adjustStock,
    formatCurrency
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'purchases' | 'stock-movement'>('overview');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Stock count verification');

  if (!item) return null;

  const currentStockValue = item.currentStock * item.purchasePrice;

  // Filter linked sales & purchases containing this item
  const linkedSales = salesInvoices.filter(inv => inv.items.some(li => li.itemId === item.id));
  const linkedPurchases = purchases.filter(pur => pur.items.some(li => li.itemId === item.id));
  const itemMovements = stockMovements.filter(sm => sm.itemId === item.id);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock(item.id, Number(newStockVal), adjustReason);
    setIsAdjusting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.name}
      subtitle={`SKU: ${item.sku} · Category: ${item.category} · Warehouse: ${item.warehouse}`}
      maxWidth="4xl"
    >
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Current Stock
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {item.currentStock}
            </span>
            <span className="text-xs text-slate-500 font-mono">{item.unit}</span>
          </div>
          {item.currentStock <= item.minimumStock && (
            <span className="text-[10px] text-amber-600 font-semibold block mt-1">
              Low Stock Alert (Min: {item.minimumStock})
            </span>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Stock Valuation
          </span>
          <div className="text-base font-bold font-mono text-[#16A085] tabular-nums mt-0.5">
            {formatCurrency(currentStockValue)}
          </div>
          <span className="text-[10px] text-slate-400">At Purchase Cost</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Purchase Price
          </span>
          <div className="text-base font-bold font-mono text-slate-800 tabular-nums mt-0.5">
            {formatCurrency(item.purchasePrice)}
          </div>
          <span className="text-[10px] text-slate-400">Cost per {item.unit}</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Selling Price
          </span>
          <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
            {formatCurrency(item.sellingPrice)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">
            Margin: {formatCurrency(item.sellingPrice - item.purchasePrice)}
          </span>
        </div>
      </div>

      {/* Tabs Row & Adjust Stock button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {(['overview', 'sales', 'purchases', 'stock-movement'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setNewStockVal(item.currentStock);
            setIsAdjusting(!isAdjusting);
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span>Adjust Stock</span>
        </button>
      </div>

      {/* Inline Adjust Stock Form */}
      {isAdjusting && (
        <form onSubmit={handleAdjustSubmit} className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-800">
            Manual Inventory Stock Adjustment
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">New Physical Quantity</label>
              <input
                type="number"
                min="0"
                value={newStockVal}
                onChange={(e) => setNewStockVal(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-600 mb-1">Reason for Adjustment</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Physical inventory recount, damaged goods writeoff, etc."
                className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdjusting(false)}
              className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded"
            >
              Update Stock
            </button>
          </div>
        </form>
      )}

      {/* Tab Panels */}
      <div className="pt-4">
        {/* 1. Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Product Specifications
                </span>
                <div className="flex justify-between text-slate-600">
                  <span>Brand:</span>
                  <span className="font-semibold text-slate-800">{item.brand || 'Unbranded'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Category:</span>
                  <span className="font-semibold text-slate-800">{item.category}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Base Unit:</span>
                  <span className="font-mono text-slate-800">{item.unit}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax Rate:</span>
                  <span className="font-mono text-slate-800">{item.taxRate}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Wholesale Rate:</span>
                  <span className="font-mono text-slate-800">{formatCurrency(item.wholesalePrice)}</span>
                </div>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Warehouse & Stock Thresholds
                </span>
                <div className="flex justify-between text-slate-600">
                  <span>Warehouse:</span>
                  <span className="font-semibold text-slate-800">{item.warehouse}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Minimum Stock Alert:</span>
                  <span className="font-mono text-slate-800">{item.minimumStock} {item.unit}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Opening Stock:</span>
                  <span className="font-mono text-slate-800">{item.openingStock} {item.unit}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Status:</span>
                  <StatusBadge status={item.status} type="item" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Sales Tab */}
        {activeTab === 'sales' && (
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-center">Qty Sold</th>
                  <th className="py-2.5 px-3 text-right">Selling Rate</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {linkedSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No sales recorded for this product
                    </td>
                  </tr>
                ) : (
                  linkedSales.map(inv => {
                    const line = inv.items.find(li => li.itemId === item.id);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{inv.date}</td>
                        <td className="py-2.5 px-3">{inv.customerName}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-rose-700">
                          -{line?.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(line?.rate || 0)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{formatCurrency(line?.amount || 0)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Purchase #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-center">Qty Received</th>
                  <th className="py-2.5 px-3 text-right">Purchase Rate</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {linkedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No purchase orders received for this product
                    </td>
                  </tr>
                ) : (
                  linkedPurchases.map(pur => {
                    const line = pur.items.find(li => li.itemId === item.id);
                    return (
                      <tr key={pur.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{pur.purchaseNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{pur.date}</td>
                        <td className="py-2.5 px-3">{pur.supplierName}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-emerald-700">
                          +{line?.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(line?.rate || 0)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{formatCurrency(line?.amount || 0)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Stock Movement */}
        {activeTab === 'stock-movement' && (
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3 text-center">Movement Qty</th>
                  <th className="py-2.5 px-3 text-center">Balance Stock</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itemMovements.map(sm => (
                  <tr key={sm.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{sm.date}</td>
                    <td className="py-2.5 px-3 font-semibold uppercase text-[10px] text-slate-700">{sm.type}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{sm.referenceNumber || '—'}</td>
                    <td className={`py-2.5 px-3 text-center font-mono font-bold ${
                      sm.quantity > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {sm.quantity > 0 ? `+${sm.quantity}` : sm.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{sm.balanceAfter}</td>
                    <td className="py-2.5 px-3 text-slate-500">{sm.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};
