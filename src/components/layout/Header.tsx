import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DateFilterRange } from '../../types';
import {
  Search,
  Bell,
  Plus,
  Calendar,
  Menu,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  Users,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  X
} from 'lucide-react';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenQuickAction: (actionType: 'sale' | 'purchase' | 'party' | 'item' | 'expense' | 'income' | 'payin' | 'payout') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenQuickAction
}) => {
  const {
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    currentBusiness
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAddMoreOpen, setIsAddMoreOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const addMoreRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter(n => !n.read);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (addMoreRef.current && !addMoreRef.current.contains(e.target as Node)) {
        setIsAddMoreOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const routeTitles: Record<string, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview & Key Performance Indicators' },
    parties: { title: 'Parties', subtitle: 'Customers, Suppliers & Statements' },
    items: { title: 'Items & Inventory', subtitle: 'Catalog, Stock Movement & Warehouses' },
    sales: { title: 'Sales Management', subtitle: 'Invoices, Receivables & Customer Payments' },
    purchases: { title: 'Purchases & Bills', subtitle: 'Vendor Invoices, Stock Intake & Payables' },
    'cash-bank': { title: 'Cash & Banks', subtitle: 'Accounts, Transfers & Fund Balances' },
    'income-expenses': { title: 'Income & Expenses', subtitle: 'Operating Overheads & Ancillary Revenue' },
    reports: { title: 'Financial Reports', subtitle: 'Profit & Loss, Cash Flow & Summaries' },
    'import-data': { title: 'Import Data', subtitle: 'Bulk CSV Migration Center' },
    settings: { title: 'Settings', subtitle: 'Business, Invoicing & User Permissions' },
    subscription: { title: 'Subscription & Billing', subtitle: 'Plans & Commercial Entitlements' },
    help: { title: 'Help & Support', subtitle: 'Documentation & Assistance' }
  };

  const activeMeta = routeTitles[currentRoute] || { title: 'Alfatechlink' };

  const dateFilterLabels: Record<DateFilterRange, string> = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year (2026)',
    custom: 'Custom Range'
  };

  return (
    <header className="no-print h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left Zone: Mobile hamburger & Dynamic Title / Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {activeMeta.title}
            </h1>
            <span className="hidden lg:inline text-xs text-slate-400">/</span>
            <span className="hidden lg:inline text-xs text-slate-500 truncate">
              {currentBusiness.name}
            </span>
          </div>
          {activeMeta.subtitle && (
            <p className="text-[11px] text-slate-600 truncate hidden sm:block">
              {activeMeta.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center/Right Zone: Search, Date Filter, Notifications & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search trigger button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          title="Search anything (Customers, Items, Invoices...)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search records...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Global Date Filter Selector */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            title="Filter by Date Range"
          >
            <Calendar className="w-3.5 h-3.5 text-[#16A085]" />
            <span className="hidden sm:inline">{dateFilterLabels[dateFilter]}</span>
          </button>

          {isDateMenuOpen && (
            <div className="absolute right-0 top-11 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-30 animate-in fade-in">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Filter Period
              </div>
              {(['today', 'week', 'month', 'year', 'custom'] as DateFilterRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setDateFilter(range);
                    if (range !== 'custom') setIsDateMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                    dateFilter === range ? 'bg-[#16A085]/10 text-[#16A085] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{dateFilterLabels[range]}</span>
                  {dateFilter === range && <span className="w-1.5 h-1.5 rounded-full bg-[#16A085]" />}
                </button>
              ))}

              {dateFilter === 'custom' && (
                <div className="mt-2 pt-2 border-t border-slate-100 px-2 space-y-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full text-xs p-1 border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full text-xs p-1 border border-slate-200 rounded"
                    />
                  </div>
                  <button
                    onClick={() => setIsDateMenuOpen(false)}
                    className="w-full py-1 text-center bg-[#16A085] text-white text-xs rounded hover:bg-[#0E7C66]"
                  >
                    Apply Range
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-30 animate-in fade-in">
              <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Notifications</h4>
                  <p className="text-[10px] text-slate-600">{unreadNotifs.length} unread alerts</p>
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#16A085] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications at this time
                  </div>
                ) : (
                  notifications.map(n => {
                    let Icon = AlertCircle;
                    let iconColor = 'text-rose-500';
                    if (n.type === 'payment_received') {
                      Icon = CheckCircle2;
                      iconColor = 'text-emerald-500';
                    } else if (n.type === 'low_stock' || n.type === 'customer_payment_due') {
                      Icon = AlertTriangle;
                      iconColor = 'text-amber-500';
                    }

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkRoute) {
                            onNavigate(n.linkRoute);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-2.5 ${
                          !n.read ? 'bg-[#16A085]/5' : ''
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action: + Add Sale Invoice */}
        <button
          onClick={() => onOpenQuickAction('sale')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Sale</span>
        </button>

        {/* Action: + Add Purchase */}
        <button
          onClick={() => onOpenQuickAction('purchase')}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Purchase</span>
        </button>

        {/* Dropdown: Add More */}
        <div className="relative" ref={addMoreRef}>
          <button
            onClick={() => setIsAddMoreOpen(!isAddMoreOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
            title="More Quick Actions"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add More</span>
          </button>

          {isAddMoreOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Records
              </div>
              <button
                onClick={() => {
                  onOpenQuickAction('party');
                  setIsAddMoreOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Add Customer / Supplier</span>
              </button>
              <button
                onClick={() => {
                  onOpenQuickAction('item');
                  setIsAddMoreOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Package className="w-3.5 h-3.5 text-slate-500" />
                <span>Add Product / Item</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  onOpenQuickAction('payin');
                  setIsAddMoreOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Receive Payment (Payment In)</span>
              </button>
              <button
                onClick={() => {
                  onOpenQuickAction('payout');
                  setIsAddMoreOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <ArrowUpCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Pay Supplier (Payment Out)</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  onOpenQuickAction('expense');
                  setIsAddMoreOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <ArrowDownCircle className="w-3.5 h-3.5 text-[#E74C3C]" />
                <span>Add Expense</span>
              </button>
              <button
                onClick={() => {
                  onOpenQuickAction('income');
                  setIsAddMoreOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <ArrowUpCircle className="w-3.5 h-3.5 text-[#2F80ED]" />
                <span>Add Income</span>
              </button>
            </div>
          )}
        </div>

        {/* User Avatar badge */}
        <div
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 pl-2 cursor-pointer group"
          title="Account Profile & Settings"
        >
          <div className="w-8 h-8 rounded-full bg-[#16A085] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#16A085]/20 group-hover:ring-[#16A085]/40 transition-all">
            {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-800 group-hover:text-[#16A085] transition-colors leading-none truncate max-w-[120px]">
              {currentUser?.name || 'Alexander M.'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-none">
              {currentUser?.role || 'Owner'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
