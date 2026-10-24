import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Users, Package, FileText, ShoppingCart, DollarSign, CreditCard } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string, id?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { parties, items, salesInvoices, purchases, paymentsIn, paymentsOut, expenses, formatCurrency } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const results: Array<{
      category: 'Customer' | 'Supplier' | 'Item' | 'Sales Invoice' | 'Purchase Bill' | 'Payment' | 'Expense';
      title: string;
      subtitle: string;
      meta?: string;
      icon: any;
      route: string;
      id: string;
    }> = [];

    // Parties
    parties.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.email.toLowerCase().includes(q)) {
        results.push({
          category: p.type === 'supplier' ? 'Supplier' : 'Customer',
          title: p.name,
          subtitle: `${p.phone || p.email || 'No contact'} · Balance: ${formatCurrency(p.balance)}`,
          meta: p.city,
          icon: Users,
          route: 'parties',
          id: p.id
        });
      }
    });

    // Items
    items.forEach(it => {
      if (it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q) || it.category.toLowerCase().includes(q)) {
        results.push({
          category: 'Item',
          title: it.name,
          subtitle: `SKU: ${it.sku} · Stock: ${it.currentStock} ${it.unit}`,
          meta: formatCurrency(it.sellingPrice),
          icon: Package,
          route: 'items',
          id: it.id
        });
      }
    });

    // Sales Invoices
    salesInvoices.forEach(inv => {
      if (inv.invoiceNumber.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q)) {
        results.push({
          category: 'Sales Invoice',
          title: `${inv.invoiceNumber} - ${inv.customerName}`,
          subtitle: `Date: ${inv.date} · Status: ${inv.status}`,
          meta: formatCurrency(inv.total),
          icon: FileText,
          route: 'sales',
          id: inv.id
        });
      }
    });

    // Purchases
    purchases.forEach(pur => {
      if (pur.purchaseNumber.toLowerCase().includes(q) || pur.supplierName.toLowerCase().includes(q)) {
        results.push({
          category: 'Purchase Bill',
          title: `${pur.purchaseNumber} - ${pur.supplierName}`,
          subtitle: `Date: ${pur.date} · Status: ${pur.status}`,
          meta: formatCurrency(pur.total),
          icon: ShoppingCart,
          route: 'purchases',
          id: pur.id
        });
      }
    });

    // Payments In & Out
    paymentsIn.forEach(pin => {
      if (pin.paymentNumber.toLowerCase().includes(q) || pin.customerName.toLowerCase().includes(q) || (pin.referenceNumber && pin.referenceNumber.toLowerCase().includes(q))) {
        results.push({
          category: 'Payment',
          title: `${pin.paymentNumber} - Received from ${pin.customerName}`,
          subtitle: `Method: ${pin.paymentMethod} · Account: ${pin.accountName}`,
          meta: formatCurrency(pin.amount),
          icon: DollarSign,
          route: 'cash-bank',
          id: pin.id
        });
      }
    });

    paymentsOut.forEach(pout => {
      if (pout.paymentNumber.toLowerCase().includes(q) || pout.supplierName.toLowerCase().includes(q)) {
        results.push({
          category: 'Payment',
          title: `${pout.paymentNumber} - Paid to ${pout.supplierName}`,
          subtitle: `Method: ${pout.paymentMethod} · Account: ${pout.accountName}`,
          meta: formatCurrency(pout.amount),
          icon: CreditCard,
          route: 'cash-bank',
          id: pout.id
        });
      }
    });

    // Expenses
    expenses.forEach(exp => {
      if (exp.category.toLowerCase().includes(q) || exp.description.toLowerCase().includes(q)) {
        results.push({
          category: 'Expense',
          title: `${exp.category} - ${exp.description}`,
          subtitle: `Date: ${exp.date} · From: ${exp.paidFromAccountName}`,
          meta: formatCurrency(exp.amount),
          icon: CreditCard,
          route: 'income-expenses',
          id: exp.id
        });
      }
    });

    return results.slice(0, 15);
  }, [query, parties, items, salesInvoices, purchases, paymentsIn, paymentsOut, expenses, formatCurrency]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, items, invoices, purchases, payments, expenses..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim().length < 2 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Type at least 2 characters to search across all Alfatechlink records...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((res, idx) => {
                const IconComponent = res.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onNavigate(res.route, res.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-slate-100 group-hover:bg-[#16A085]/10 group-hover:text-[#16A085] text-slate-500 flex items-center justify-center shrink-0 transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-[#16A085] truncate">
                            {res.title}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                            {res.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {res.subtitle}
                        </div>
                      </div>
                    </div>

                    {res.meta && (
                      <div className="text-xs font-mono font-medium text-slate-700 tabular-nums shrink-0 pl-3">
                        {res.meta}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
