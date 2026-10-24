import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Business,
  Party,
  Item,
  SalesInvoice,
  PurchaseBill,
  PaymentIn,
  PaymentOut,
  Account,
  AccountTransaction,
  Expense,
  Income,
  StockMovement,
  NotificationItem,
  InvoiceSettings,
  TaxSettings,
  User,
  DateFilterRange,
  PaymentMethod,
  InvoiceStatus,
  PurchaseStatus,
  ItemCategory,
  UnitOfMeasure
} from '../types';
import {
  initialBusiness,
  initialAccounts,
  initialParties,
  initialItems,
  initialSalesInvoices,
  initialPurchases,
  initialPaymentsIn,
  initialPaymentsOut,
  initialExpenses,
  initialIncomes,
  initialAccountTransactions,
  initialStockMovements,
  initialNotifications,
  initialInvoiceSettings,
  initialTaxSettings,
  initialUsers,
  initialCategories,
  initialUnitsOfMeasure
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  // Auth & Session
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, pass: string) => boolean;
  register: (name: string, email: string, phone: string, pass: string, businessName: string) => void;
  logout: () => void;
  isSetupWizardCompleted: boolean;
  completeSetupWizard: () => void;

  // Multi-Business
  currentBusiness: Business;
  businesses: Business[];
  switchBusiness: (id: string) => void;
  addBusiness: (biz: Partial<Business>) => void;
  updateBusinessSettings: (updated: Partial<Business>) => void;

  // Settings
  invoiceSettings: InvoiceSettings;
  updateInvoiceSettings: (updated: Partial<InvoiceSettings>) => void;
  taxSettings: TaxSettings;
  updateTaxSettings: (updated: Partial<TaxSettings>) => void;
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;

  // Global Date Filter
  dateFilter: DateFilterRange;
  setDateFilter: (filter: DateFilterRange) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;

  // Core Entities
  parties: Party[];
  addParty: (party: Omit<Party, 'id' | 'businessId' | 'createdAt' | 'currentReceivable' | 'currentPayable' | 'balance'> & { openingBalance?: number; balanceType?: 'receivable' | 'payable' }) => Party;
  updateParty: (id: string, updated: Partial<Party>) => void;
  deleteParty: (id: string) => void;

  items: Item[];
  addItem: (item: Omit<Item, 'id' | 'businessId' | 'createdAt' | 'currentStock' | 'openingStockValue'>) => Item;
  updateItem: (id: string, updated: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  adjustStock: (itemId: string, newStock: number, reason: string) => void;

  categories: ItemCategory[];
  addCategory: (category: Omit<ItemCategory, 'id' | 'createdAt'>) => ItemCategory;
  updateCategory: (id: string, updated: Partial<ItemCategory>) => void;
  deleteCategory: (id: string) => boolean;

  unitsOfMeasure: UnitOfMeasure[];
  addUnitOfMeasure: (uom: Omit<UnitOfMeasure, 'id' | 'createdAt'>) => UnitOfMeasure;
  updateUnitOfMeasure: (id: string, updated: Partial<UnitOfMeasure>) => void;
  deleteUnitOfMeasure: (id: string) => boolean;

  salesInvoices: SalesInvoice[];
  createSalesInvoice: (invoiceData: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'businessId' | 'createdAt' | 'balance'> & { invoiceNumber?: string }) => SalesInvoice;
  updateSalesInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  cancelSalesInvoice: (id: string) => void;

  purchases: PurchaseBill[];
  createPurchaseBill: (purchaseData: Omit<PurchaseBill, 'id' | 'purchaseNumber' | 'businessId' | 'createdAt' | 'balance'> & { purchaseNumber?: string }) => PurchaseBill;
  updatePurchaseStatus: (id: string, status: PurchaseStatus) => void;
  cancelPurchaseBill: (id: string) => void;

  paymentsIn: PaymentIn[];
  recordPaymentIn: (payment: Omit<PaymentIn, 'id' | 'paymentNumber' | 'businessId' | 'createdAt'>) => PaymentIn;

  paymentsOut: PaymentOut[];
  recordPaymentOut: (payment: Omit<PaymentOut, 'id' | 'paymentNumber' | 'businessId' | 'createdAt'>) => PaymentOut;

  accounts: Account[];
  addAccount: (account: Omit<Account, 'id' | 'businessId' | 'moneyIn' | 'moneyOut' | 'balance'> & { openingBalance?: number }) => Account;
  updateAccount: (id: string, updated: Partial<Account>) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => boolean;
  depositFunds: (accountId: string, amount: number, notes?: string) => void;
  withdrawFunds: (accountId: string, amount: number, notes?: string) => void;

  accountTransactions: AccountTransaction[];

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'businessId' | 'createdAt'>) => Expense;
  deleteExpense: (id: string) => void;

  incomes: Income[];
  addIncome: (income: Omit<Income, 'id' | 'businessId' | 'createdAt'>) => Income;
  deleteIncome: (id: string) => void;

  stockMovements: StockMovement[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Batch import helper
  importDataBatch: (type: 'parties' | 'items' | 'sales' | 'purchases' | 'expenses', records: any[]) => { successCount: number; errors: string[] };

  // UI state & helpers
  formatCurrency: (amount: number) => string;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  resetToDemoData: () => void;
  cleanAllEntryData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'alfatechlink_v3_clean_rs_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Helper for persistent local storage
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.warn(`Failed reading ${key} from storage:`, e);
      return fallback;
    }
  };

  const saveStored = (key: string, val: any) => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
    } catch (e) {
      console.warn(`Failed saving ${key} to storage:`, e);
    }
  };

  // Auth & Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadStored('currentUser', initialUsers[0]));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStored('isAuthenticated', true));
  const [isSetupWizardCompleted, setIsSetupWizardCompleted] = useState<boolean>(() => loadStored('isSetupWizardCompleted', true));

  // Multi-Business
  const [businesses, setBusinesses] = useState<Business[]>(() => loadStored('businesses', [initialBusiness]));
  const [currentBusinessId, setCurrentBusinessId] = useState<string>(() => loadStored('currentBusinessId', initialBusiness.id));

  // Date Filter
  const [dateFilter, setDateFilterState] = useState<DateFilterRange>(() => loadStored('dateFilter', 'year'));
  const [customStartDate, setCustomStartDateState] = useState<string>('2026-01-01');
  const [customEndDate, setCustomEndDateState] = useState<string>('2026-12-31');

  // Core Data
  const [parties, setParties] = useState<Party[]>(() => loadStored('parties', initialParties));
  const [items, setItems] = useState<Item[]>(() => loadStored('items', initialItems));
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(() => loadStored('salesInvoices', initialSalesInvoices));
  const [purchases, setPurchases] = useState<PurchaseBill[]>(() => loadStored('purchases', initialPurchases));
  const [paymentsIn, setPaymentsIn] = useState<PaymentIn[]>(() => loadStored('paymentsIn', initialPaymentsIn));
  const [paymentsOut, setPaymentsOut] = useState<PaymentOut[]>(() => loadStored('paymentsOut', initialPaymentsOut));
  const [accounts, setAccounts] = useState<Account[]>(() => loadStored('accounts', initialAccounts));
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>(() => loadStored('accountTransactions', initialAccountTransactions));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadStored('expenses', initialExpenses));
  const [incomes, setIncomes] = useState<Income[]>(() => loadStored('incomes', initialIncomes));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => loadStored('stockMovements', initialStockMovements));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStored('notifications', initialNotifications));
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => loadStored('invoiceSettings', initialInvoiceSettings));
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(() => loadStored('taxSettings', initialTaxSettings));
  const [users, setUsers] = useState<User[]>(() => loadStored('users', initialUsers));
  const [categories, setCategories] = useState<ItemCategory[]>(() => loadStored('categories', initialCategories));
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>(() => loadStored('unitsOfMeasure', initialUnitsOfMeasure));

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync state to LocalStorage
  useEffect(() => saveStored('currentUser', currentUser), [currentUser]);
  useEffect(() => saveStored('isAuthenticated', isAuthenticated), [isAuthenticated]);
  useEffect(() => saveStored('isSetupWizardCompleted', isSetupWizardCompleted), [isSetupWizardCompleted]);
  useEffect(() => saveStored('businesses', businesses), [businesses]);
  useEffect(() => saveStored('currentBusinessId', currentBusinessId), [currentBusinessId]);
  useEffect(() => saveStored('dateFilter', dateFilter), [dateFilter]);
  useEffect(() => saveStored('parties', parties), [parties]);
  useEffect(() => saveStored('items', items), [items]);
  useEffect(() => saveStored('salesInvoices', salesInvoices), [salesInvoices]);
  useEffect(() => saveStored('purchases', purchases), [purchases]);
  useEffect(() => saveStored('paymentsIn', paymentsIn), [paymentsIn]);
  useEffect(() => saveStored('paymentsOut', paymentsOut), [paymentsOut]);
  useEffect(() => saveStored('accounts', accounts), [accounts]);
  useEffect(() => saveStored('accountTransactions', accountTransactions), [accountTransactions]);
  useEffect(() => saveStored('expenses', expenses), [expenses]);
  useEffect(() => saveStored('incomes', incomes), [incomes]);
  useEffect(() => saveStored('stockMovements', stockMovements), [stockMovements]);
  useEffect(() => saveStored('notifications', notifications), [notifications]);
  useEffect(() => saveStored('invoiceSettings', invoiceSettings), [invoiceSettings]);
  useEffect(() => saveStored('taxSettings', taxSettings), [taxSettings]);
  useEffect(() => saveStored('users', users), [users]);
  useEffect(() => saveStored('categories', categories), [categories]);
  useEffect(() => saveStored('unitsOfMeasure', unitsOfMeasure), [unitsOfMeasure]);

  const currentBusiness = useMemo(() => {
    return businesses.find(b => b.id === currentBusinessId) || businesses[0] || initialBusiness;
  }, [businesses, currentBusinessId]);

  const setDateFilter = (filter: DateFilterRange) => {
    setDateFilterState(filter);
  };

  const setCustomStartDate = (d: string) => setCustomStartDateState(d);
  const setCustomEndDate = (d: string) => setCustomEndDateState(d);

  const formatCurrency = (amount: number): string => {
    let symbol = currentBusiness?.currencySymbol || 'Rs ';
    if (symbol === '$') symbol = 'Rs ';
    if (symbol === 'Rs') symbol = 'Rs ';
    const num = isNaN(amount) ? 0 : amount;
    return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Auth handlers
  const login = (emailOrPhone: string, _pass: string): boolean => {
    const matched = users.find(u => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone === emailOrPhone);
    if (matched) {
      setCurrentUser(matched);
      setIsAuthenticated(true);
      addToast({ type: 'success', title: 'Welcome back!', message: `Signed in as ${matched.name} (${matched.role})` });
      return true;
    }
    // Default fallback to Alexander Mitchell
    const def = users[0];
    setCurrentUser(def);
    setIsAuthenticated(true);
    addToast({ type: 'success', title: 'Welcome back!', message: `Signed in as ${def.name}` });
    return true;
  };

  const register = (name: string, email: string, phone: string, _pass: string, businessName: string) => {
    const newBiz: Business = {
      id: 'biz_' + Date.now(),
      name: businessName || 'My Business',
      phone: phone || '',
      email: email,
      address: '',
      city: '',
      country: '',
      taxNumber: '',
      currency: 'Rs',
      currencySymbol: 'Rs ',
      financialYearStart: '2026-01-01',
      financialYearEnd: '2026-12-31'
    };
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name,
      email,
      phone,
      role: 'Owner',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setBusinesses(prev => [...prev, newBiz]);
    setCurrentBusinessId(newBiz.id);
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsSetupWizardCompleted(false); // Open onboarding wizard
    addToast({ type: 'success', title: 'Account Registered', message: 'Welcome to Alfatechlink! Complete the business setup wizard.' });
  };

  const logout = () => {
    setIsAuthenticated(false);
    addToast({ type: 'info', title: 'Logged Out', message: 'You have been securely signed out.' });
  };

  const completeSetupWizard = () => {
    setIsSetupWizardCompleted(true);
    addToast({ type: 'success', title: 'Setup Complete!', message: 'Your business is now fully configured and ready.' });
  };

  const switchBusiness = (id: string) => {
    if (businesses.some(b => b.id === id)) {
      setCurrentBusinessId(id);
      addToast({ type: 'info', title: 'Business Switched', message: `Active workspace: ${businesses.find(b => b.id === id)?.name}` });
    }
  };

  const addBusiness = (biz: Partial<Business>) => {
    const created: Business = {
      id: 'biz_' + Date.now(),
      name: biz.name || 'New Enterprise',
      phone: biz.phone || '',
      email: biz.email || '',
      address: biz.address || '',
      city: biz.city || '',
      country: biz.country || '',
      taxNumber: biz.taxNumber || '',
      currency: biz.currency || 'Rs',
      currencySymbol: biz.currencySymbol || 'Rs ',
      financialYearStart: biz.financialYearStart || '2026-01-01',
      financialYearEnd: biz.financialYearEnd || '2026-12-31',
      logo: biz.logo || ''
    };
    setBusinesses(prev => [...prev, created]);
    setCurrentBusinessId(created.id);
    addToast({ type: 'success', title: 'Business Added', message: `${created.name} is now active.` });
  };

  const updateBusinessSettings = (updated: Partial<Business>) => {
    setBusinesses(prev => prev.map(b => b.id === currentBusinessId ? { ...b, ...updated } : b));
    addToast({ type: 'success', title: 'Business Profile Updated' });
  };

  const updateInvoiceSettings = (updated: Partial<InvoiceSettings>) => {
    setInvoiceSettings(prev => ({ ...prev, ...updated }));
    addToast({ type: 'success', title: 'Invoice Settings Saved' });
  };

  const updateTaxSettings = (updated: Partial<TaxSettings>) => {
    setTaxSettings(prev => ({ ...prev, ...updated }));
    addToast({ type: 'success', title: 'Tax Settings Saved' });
  };

  const addUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const u: User = {
      ...newUser,
      id: 'usr_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, u]);
    addToast({ type: 'success', title: 'User Invited', message: `${u.name} added as ${u.role}` });
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    addToast({ type: 'success', title: 'User Updated' });
  };

  // Parties
  const addParty = (data: Omit<Party, 'id' | 'businessId' | 'createdAt' | 'currentReceivable' | 'currentPayable' | 'balance'> & { openingBalance?: number; balanceType?: 'receivable' | 'payable' }): Party => {
    const ob = data.openingBalance || 0;
    const bt = data.balanceType || (data.type === 'supplier' ? 'payable' : 'receivable');
    const rec = bt === 'receivable' ? ob : 0;
    const pay = bt === 'payable' ? ob : 0;
    const bal = rec - pay;

    const newParty: Party = {
      ...data,
      id: 'party_' + Date.now(),
      businessId: currentBusinessId,
      openingBalance: ob,
      balanceType: bt,
      currentReceivable: rec,
      currentPayable: pay,
      balance: bal,
      status: data.status || 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setParties(prev => [newParty, ...prev]);
    addToast({ type: 'success', title: 'Party Created', message: `${newParty.name} (${newParty.type}) added.` });
    return newParty;
  };

  const updateParty = (id: string, updated: Partial<Party>) => {
    setParties(prev => prev.map(p => {
      if (p.id !== id) return p;
      const merged = { ...p, ...updated };
      merged.balance = merged.currentReceivable - merged.currentPayable;
      return merged;
    }));
    addToast({ type: 'success', title: 'Party Updated' });
  };

  const deleteParty = (id: string) => {
    const party = parties.find(p => p.id === id);
    setParties(prev => prev.filter(p => p.id !== id));
    addToast({ type: 'info', title: 'Party Removed', message: party ? party.name : undefined });
  };

  // Items & Stock
  const addItem = (data: Omit<Item, 'id' | 'businessId' | 'createdAt' | 'currentStock' | 'openingStockValue'>): Item => {
    const currentStock = data.openingStock || 0;
    const openingStockValue = currentStock * data.purchasePrice;
    const newItem: Item = {
      ...data,
      id: 'item_' + Date.now(),
      businessId: currentBusinessId,
      currentStock,
      openingStockValue,
      status: data.status || 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setItems(prev => [newItem, ...prev]);

    // Log opening stock movement if positive
    if (currentStock > 0) {
      const sm: StockMovement = {
        id: 'sm_' + Date.now(),
        businessId: currentBusinessId,
        itemId: newItem.id,
        itemName: newItem.name,
        date: newItem.createdAt,
        type: 'opening',
        quantity: currentStock,
        balanceAfter: currentStock,
        referenceType: 'manual',
        notes: 'Initial opening stock',
        createdAt: newItem.createdAt
      };
      setStockMovements(prev => [sm, ...prev]);
    }

    addToast({ type: 'success', title: 'Product Added', message: `${newItem.name} saved with ${newItem.currentStock} ${newItem.unit} stock.` });
    return newItem;
  };

  const updateItem = (id: string, updated: Partial<Item>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...updated } : it));
    addToast({ type: 'success', title: 'Product Updated' });
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
    addToast({ type: 'info', title: 'Product Deleted' });
  };

  const adjustStock = (itemId: string, newStock: number, reason: string) => {
    const item = items.find(it => it.id === itemId);
    if (!item) return;
    const delta = newStock - item.currentStock;
    if (delta === 0) return;

    setItems(prev => prev.map(it => it.id === itemId ? { ...it, currentStock: newStock } : it));

    const sm: StockMovement = {
      id: 'sm_' + Date.now(),
      businessId: currentBusinessId,
      itemId: item.id,
      itemName: item.name,
      date: new Date().toISOString().split('T')[0],
      type: 'adjustment',
      quantity: delta,
      balanceAfter: newStock,
      referenceType: 'manual',
      notes: reason || 'Manual stock adjustment',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setStockMovements(prev => [sm, ...prev]);
    addToast({ type: 'info', title: 'Stock Adjusted', message: `${item.name} stock set to ${newStock}` });
  };

  // Categories & Units of Measure
  const addCategory = (catData: Omit<ItemCategory, 'id' | 'createdAt'>): ItemCategory => {
    const newCat: ItemCategory = {
      id: 'cat_' + Date.now(),
      name: catData.name.trim(),
      description: catData.description?.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCategories(prev => [...prev, newCat]);
    addToast({ type: 'success', title: 'Category Added', message: `Category "${newCat.name}" is now available.` });
    return newCat;
  };

  const updateCategory = (id: string, updated: Partial<ItemCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    addToast({ type: 'success', title: 'Category Updated', message: 'Category changes saved.' });
  };

  const deleteCategory = (id: string): boolean => {
    const target = categories.find(c => c.id === id);
    if (!target) return false;
    const inUse = items.some(i => i.category.toLowerCase() === target.name.toLowerCase());
    if (inUse) {
      addToast({
        type: 'warning',
        title: 'Category in Use',
        message: `Cannot delete "${target.name}" because items are currently assigned to it.`
      });
      return false;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    addToast({ type: 'info', title: 'Category Removed', message: `Category "${target.name}" deleted.` });
    return true;
  };

  const addUnitOfMeasure = (uomData: Omit<UnitOfMeasure, 'id' | 'createdAt'>): UnitOfMeasure => {
    const newUom: UnitOfMeasure = {
      id: 'uom_' + Date.now(),
      name: uomData.name.trim(),
      code: uomData.code.trim().toLowerCase(),
      description: uomData.description?.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUnitsOfMeasure(prev => [...prev, newUom]);
    addToast({ type: 'success', title: 'Unit Added', message: `Unit "${newUom.name} (${newUom.code})" is now available.` });
    return newUom;
  };

  const updateUnitOfMeasure = (id: string, updated: Partial<UnitOfMeasure>) => {
    setUnitsOfMeasure(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    addToast({ type: 'success', title: 'Unit Updated', message: 'Unit of Measure changes saved.' });
  };

  const deleteUnitOfMeasure = (id: string): boolean => {
    const target = unitsOfMeasure.find(u => u.id === id);
    if (!target) return false;
    const inUse = items.some(i => i.unit.toLowerCase() === target.code.toLowerCase());
    if (inUse) {
      addToast({
        type: 'warning',
        title: 'Unit in Use',
        message: `Cannot delete "${target.name}" because items currently use this unit.`
      });
      return false;
    }
    setUnitsOfMeasure(prev => prev.filter(u => u.id !== id));
    addToast({ type: 'info', title: 'Unit Removed', message: `Unit "${target.name} (${target.code})" deleted.` });
    return true;
  };

  // Sales Invoice (Connected Transaction Flow)
  const createSalesInvoice = (data: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'businessId' | 'createdAt' | 'balance'> & { invoiceNumber?: string }): SalesInvoice => {
    const invCount = salesInvoices.length + 1;
    const pad = String(invCount).padStart(invoiceSettings.numberPadding, '0');
    const autoNumber = `${invoiceSettings.invoicePrefix}${pad}`;
    const invoiceNumber = data.invoiceNumber || autoNumber;
    const balance = Math.max(0, data.total - (data.paidAmount || 0));

    let status: InvoiceStatus = data.status || 'unpaid';
    if (data.paidAmount >= data.total && data.total > 0) {
      status = 'paid';
    } else if (data.paidAmount > 0) {
      status = 'partially_paid';
    }

    const newInvoice: SalesInvoice = {
      ...data,
      id: 'inv_' + Date.now(),
      invoiceNumber,
      businessId: currentBusinessId,
      balance,
      status,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // 1. Decrement Stock for all line items & record stock movements
    const updatedItems = [...items];
    const newMovements: StockMovement[] = [];
    const lowStockAlerts: string[] = [];

    data.items.forEach(li => {
      const idx = updatedItems.findIndex(it => it.id === li.itemId);
      if (idx !== -1) {
        const item = updatedItems[idx];
        const newStock = item.currentStock - li.quantity;
        updatedItems[idx] = { ...item, currentStock: newStock };

        newMovements.push({
          id: 'sm_' + Date.now() + Math.random().toString(36).substring(2, 6),
          businessId: currentBusinessId,
          itemId: item.id,
          itemName: item.name,
          date: newInvoice.date,
          type: 'sale',
          quantity: -li.quantity,
          balanceAfter: newStock,
          referenceType: 'invoice',
          referenceNumber: invoiceNumber,
          notes: `Sold on invoice ${invoiceNumber} to ${data.customerName}`,
          createdAt: newInvoice.createdAt
        });

        if (newStock <= item.minimumStock) {
          lowStockAlerts.push(`${item.name} (remaining: ${newStock} ${item.unit})`);
        }
      }
    });

    setItems(updatedItems);
    setStockMovements(prev => [...newMovements, ...prev]);

    // 2. Update Customer Balance: Receivable += balance
    setParties(prev => prev.map(p => {
      if (p.id === data.customerId) {
        const newRec = p.currentReceivable + balance;
        return {
          ...p,
          currentReceivable: newRec,
          balance: newRec - p.currentPayable
        };
      }
      return p;
    }));

    // 3. If paidAmount > 0, record Payment In & update Cash/Bank account
    if (data.paidAmount > 0 && data.paymentAccountId) {
      const payInCount = paymentsIn.length + 1;
      const payInPad = String(payInCount).padStart(invoiceSettings.numberPadding, '0');
      const payInNumber = `${invoiceSettings.paymentInPrefix}${payInPad}`;
      const targetAcc = accounts.find(a => a.id === data.paymentAccountId);
      const accName = targetAcc ? targetAcc.name : 'Primary Account';

      const newPayIn: PaymentIn = {
        id: 'payin_' + Date.now(),
        paymentNumber: payInNumber,
        businessId: currentBusinessId,
        customerId: data.customerId,
        customerName: data.customerName,
        invoiceId: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        date: newInvoice.date,
        amount: data.paidAmount,
        paymentMethod: data.paymentMethod || 'Cash',
        accountId: data.paymentAccountId,
        accountName: accName,
        referenceNumber: `INV-PAY-${invoiceNumber}`,
        notes: `Immediate payment received with ${invoiceNumber}`,
        createdAt: newInvoice.createdAt
      };

      setPaymentsIn(prev => [newPayIn, ...prev]);

      // Update Account balance
      setAccounts(prev => prev.map(a => {
        if (a.id === data.paymentAccountId) {
          return {
            ...a,
            balance: a.balance + data.paidAmount,
            moneyIn: a.moneyIn + data.paidAmount
          };
        }
        return a;
      }));

      // Account transaction log
      const atxn: AccountTransaction = {
        id: 'atxn_' + Date.now(),
        businessId: currentBusinessId,
        accountId: data.paymentAccountId,
        accountName: accName,
        date: newInvoice.date,
        type: 'payment_in',
        reference: invoiceNumber,
        description: `Payment received for ${invoiceNumber} from ${data.customerName}`,
        moneyIn: data.paidAmount,
        moneyOut: 0,
        balance: (targetAcc?.balance || 0) + data.paidAmount,
        createdAt: newInvoice.createdAt
      };
      setAccountTransactions(prev => [atxn, ...prev]);
    }

    // 4. Low stock notification
    if (lowStockAlerts.length > 0) {
      const notif: NotificationItem = {
        id: 'notif_' + Date.now(),
        title: 'Low Stock Alert',
        message: `Inventory low threshold reached for: ${lowStockAlerts.join(', ')}.`,
        type: 'low_stock',
        date: newInvoice.date,
        read: false,
        linkRoute: 'items'
      };
      setNotifications(prev => [notif, ...prev]);
    }

    setSalesInvoices(prev => [newInvoice, ...prev]);
    addToast({
      type: 'success',
      title: 'Sales Invoice Created',
      message: `${invoiceNumber} saved! Inventory & customer balance updated.`
    });

    return newInvoice;
  };

  const updateSalesInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setSalesInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    addToast({ type: 'info', title: 'Invoice Status Updated', message: `Marked as ${status}` });
  };

  const cancelSalesInvoice = (id: string) => {
    const inv = salesInvoices.find(i => i.id === id);
    if (!inv || inv.status === 'cancelled') return;

    // Restore inventory
    const updatedItems = [...items];
    const newMovements: StockMovement[] = [];

    inv.items.forEach(li => {
      const idx = updatedItems.findIndex(it => it.id === li.itemId);
      if (idx !== -1) {
        const item = updatedItems[idx];
        const newStock = item.currentStock + li.quantity;
        updatedItems[idx] = { ...item, currentStock: newStock };

        newMovements.push({
          id: 'sm_' + Date.now() + Math.random().toString(36).substring(2, 6),
          businessId: currentBusinessId,
          itemId: item.id,
          itemName: item.name,
          date: new Date().toISOString().split('T')[0],
          type: 'adjustment',
          quantity: li.quantity,
          balanceAfter: newStock,
          referenceType: 'invoice',
          referenceNumber: inv.invoiceNumber,
          notes: `Cancelled invoice ${inv.invoiceNumber} - stock reversed`,
          createdAt: new Date().toISOString().split('T')[0]
        });
      }
    });

    setItems(updatedItems);
    setStockMovements(prev => [...newMovements, ...prev]);

    // Reverse unpaid receivable
    setParties(prev => prev.map(p => {
      if (p.id === inv.customerId) {
        const newRec = Math.max(0, p.currentReceivable - inv.balance);
        return {
          ...p,
          currentReceivable: newRec,
          balance: newRec - p.currentPayable
        };
      }
      return p;
    }));

    setSalesInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'cancelled' } : i));
    addToast({ type: 'warning', title: 'Invoice Cancelled', message: `${inv.invoiceNumber} cancelled and stock restored.` });
  };

  // Purchase Bill (Connected Transaction Flow)
  const createPurchaseBill = (data: Omit<PurchaseBill, 'id' | 'purchaseNumber' | 'businessId' | 'createdAt' | 'balance'> & { purchaseNumber?: string }): PurchaseBill => {
    const purCount = purchases.length + 1;
    const pad = String(purCount).padStart(invoiceSettings.numberPadding, '0');
    const autoNumber = `${invoiceSettings.purchasePrefix}${pad}`;
    const purchaseNumber = data.purchaseNumber || autoNumber;
    const balance = Math.max(0, data.total - (data.paidAmount || 0));

    let status: PurchaseStatus = data.status || 'unpaid';
    if (data.paidAmount >= data.total && data.total > 0) {
      status = 'paid';
    } else if (data.paidAmount > 0) {
      status = 'partially_paid';
    }

    const newPurchase: PurchaseBill = {
      ...data,
      id: 'pur_' + Date.now(),
      purchaseNumber,
      businessId: currentBusinessId,
      balance,
      status,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // 1. Increment Stock for all items & record stock movements
    const updatedItems = [...items];
    const newMovements: StockMovement[] = [];

    data.items.forEach(li => {
      const idx = updatedItems.findIndex(it => it.id === li.itemId);
      if (idx !== -1) {
        const item = updatedItems[idx];
        const newStock = item.currentStock + li.quantity;
        updatedItems[idx] = { ...item, currentStock: newStock };

        newMovements.push({
          id: 'sm_' + Date.now() + Math.random().toString(36).substring(2, 6),
          businessId: currentBusinessId,
          itemId: item.id,
          itemName: item.name,
          date: newPurchase.date,
          type: 'purchase',
          quantity: li.quantity,
          balanceAfter: newStock,
          referenceType: 'purchase',
          referenceNumber: purchaseNumber,
          notes: `Purchased under bill ${purchaseNumber} from ${data.supplierName}`,
          createdAt: newPurchase.createdAt
        });
      }
    });

    setItems(updatedItems);
    setStockMovements(prev => [...newMovements, ...prev]);

    // 2. Update Supplier Balance: Payable += balance
    setParties(prev => prev.map(p => {
      if (p.id === data.supplierId) {
        const newPay = p.currentPayable + balance;
        return {
          ...p,
          currentPayable: newPay,
          balance: p.currentReceivable - newPay
        };
      }
      return p;
    }));

    // 3. If paidAmount > 0, record Payment Out & decrease account balance
    if (data.paidAmount > 0 && data.paymentAccountId) {
      const payOutCount = paymentsOut.length + 1;
      const payOutPad = String(payOutCount).padStart(invoiceSettings.numberPadding, '0');
      const payOutNumber = `${invoiceSettings.paymentOutPrefix}${payOutPad}`;
      const targetAcc = accounts.find(a => a.id === data.paymentAccountId);
      const accName = targetAcc ? targetAcc.name : 'Primary Account';

      const newPayOut: PaymentOut = {
        id: 'payout_' + Date.now(),
        paymentNumber: payOutNumber,
        businessId: currentBusinessId,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        purchaseId: newPurchase.id,
        purchaseNumber: newPurchase.purchaseNumber,
        date: newPurchase.date,
        amount: data.paidAmount,
        paymentMethod: data.paymentMethod || 'Bank',
        accountId: data.paymentAccountId,
        accountName: accName,
        referenceNumber: `PUR-PAY-${purchaseNumber}`,
        notes: `Immediate payment issued for ${purchaseNumber}`,
        createdAt: newPurchase.createdAt
      };

      setPaymentsOut(prev => [newPayOut, ...prev]);

      setAccounts(prev => prev.map(a => {
        if (a.id === data.paymentAccountId) {
          return {
            ...a,
            balance: a.balance - data.paidAmount,
            moneyOut: a.moneyOut + data.paidAmount
          };
        }
        return a;
      }));

      const atxn: AccountTransaction = {
        id: 'atxn_' + Date.now(),
        businessId: currentBusinessId,
        accountId: data.paymentAccountId,
        accountName: accName,
        date: newPurchase.date,
        type: 'payment_out',
        reference: purchaseNumber,
        description: `Payment made for ${purchaseNumber} to ${data.supplierName}`,
        moneyIn: 0,
        moneyOut: data.paidAmount,
        balance: (targetAcc?.balance || 0) - data.paidAmount,
        createdAt: newPurchase.createdAt
      };
      setAccountTransactions(prev => [atxn, ...prev]);
    }

    setPurchases(prev => [newPurchase, ...prev]);
    addToast({
      type: 'success',
      title: 'Purchase Bill Saved',
      message: `${purchaseNumber} recorded! Stock increased by line items.`
    });

    return newPurchase;
  };

  const updatePurchaseStatus = (id: string, status: PurchaseStatus) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    addToast({ type: 'info', title: 'Purchase Status Updated', message: `Marked as ${status}` });
  };

  const cancelPurchaseBill = (id: string) => {
    const pur = purchases.find(p => p.id === id);
    if (!pur || pur.status === 'cancelled') return;

    // Reduce stock
    const updatedItems = [...items];
    const newMovements: StockMovement[] = [];

    pur.items.forEach(li => {
      const idx = updatedItems.findIndex(it => it.id === li.itemId);
      if (idx !== -1) {
        const item = updatedItems[idx];
        const newStock = Math.max(0, item.currentStock - li.quantity);
        updatedItems[idx] = { ...item, currentStock: newStock };

        newMovements.push({
          id: 'sm_' + Date.now() + Math.random().toString(36).substring(2, 6),
          businessId: currentBusinessId,
          itemId: item.id,
          itemName: item.name,
          date: new Date().toISOString().split('T')[0],
          type: 'adjustment',
          quantity: -li.quantity,
          balanceAfter: newStock,
          referenceType: 'purchase',
          referenceNumber: pur.purchaseNumber,
          notes: `Purchase ${pur.purchaseNumber} cancelled - stock deducted`,
          createdAt: new Date().toISOString().split('T')[0]
        });
      }
    });

    setItems(updatedItems);
    setStockMovements(prev => [...newMovements, ...prev]);

    // Reverse payable
    setParties(prev => prev.map(p => {
      if (p.id === pur.supplierId) {
        const newPay = Math.max(0, p.currentPayable - pur.balance);
        return {
          ...p,
          currentPayable: newPay,
          balance: p.currentReceivable - newPay
        };
      }
      return p;
    }));

    setPurchases(prev => prev.map(p => p.id === id ? { ...p, status: 'cancelled' } : p));
    addToast({ type: 'warning', title: 'Purchase Bill Cancelled' });
  };

  // Payment In (Receive Payment)
  const recordPaymentIn = (data: Omit<PaymentIn, 'id' | 'paymentNumber' | 'businessId' | 'createdAt'>): PaymentIn => {
    const payInCount = paymentsIn.length + 1;
    const pad = String(payInCount).padStart(invoiceSettings.numberPadding, '0');
    const paymentNumber = `${invoiceSettings.paymentInPrefix}${pad}`;

    const newPayment: PaymentIn = {
      ...data,
      id: 'payin_' + Date.now(),
      paymentNumber,
      businessId: currentBusinessId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // 1. Update Customer Receivable: Receivable -= amount
    setParties(prev => prev.map(p => {
      if (p.id === data.customerId) {
        const newRec = Math.max(0, p.currentReceivable - data.amount);
        return {
          ...p,
          currentReceivable: newRec,
          balance: newRec - p.currentPayable
        };
      }
      return p;
    }));

    // 2. If specific invoice is targeted, update invoice paid amount & status
    if (data.invoiceId) {
      setSalesInvoices(prev => prev.map(inv => {
        if (inv.id === data.invoiceId) {
          const newPaid = inv.paidAmount + data.amount;
          const newBalance = Math.max(0, inv.total - newPaid);
          const newStatus: InvoiceStatus = newBalance === 0 ? 'paid' : 'partially_paid';
          return {
            ...inv,
            paidAmount: newPaid,
            balance: newBalance,
            status: newStatus
          };
        }
        return inv;
      }));
    }

    // 3. Update Bank/Cash Account
    const targetAcc = accounts.find(a => a.id === data.accountId);
    setAccounts(prev => prev.map(a => {
      if (a.id === data.accountId) {
        return {
          ...a,
          balance: a.balance + data.amount,
          moneyIn: a.moneyIn + data.amount
        };
      }
      return a;
    }));

    // 4. Log Account Transaction
    const atxn: AccountTransaction = {
      id: 'atxn_' + Date.now(),
      businessId: currentBusinessId,
      accountId: data.accountId,
      accountName: data.accountName,
      date: data.date,
      type: 'payment_in',
      reference: paymentNumber,
      description: `Payment received from ${data.customerName}${data.invoiceNumber ? ` for ${data.invoiceNumber}` : ''}`,
      moneyIn: data.amount,
      moneyOut: 0,
      balance: (targetAcc?.balance || 0) + data.amount,
      createdAt: newPayment.createdAt
    };
    setAccountTransactions(prev => [atxn, ...prev]);

    // 5. Notification
    const notif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: 'Payment Received',
      message: `Received ${formatCurrency(data.amount)} from ${data.customerName}.`,
      type: 'payment_received',
      date: data.date,
      read: false,
      linkRoute: 'sales'
    };
    setNotifications(prev => [notif, ...prev]);

    setPaymentsIn(prev => [newPayment, ...prev]);
    addToast({
      type: 'success',
      title: 'Payment In Recorded',
      message: `${paymentNumber}: ${formatCurrency(data.amount)} from ${data.customerName}`
    });

    return newPayment;
  };

  // Payment Out (Pay Supplier)
  const recordPaymentOut = (data: Omit<PaymentOut, 'id' | 'paymentNumber' | 'businessId' | 'createdAt'>): PaymentOut => {
    const payOutCount = paymentsOut.length + 1;
    const pad = String(payOutCount).padStart(invoiceSettings.numberPadding, '0');
    const paymentNumber = `${invoiceSettings.paymentOutPrefix}${pad}`;

    const newPayment: PaymentOut = {
      ...data,
      id: 'payout_' + Date.now(),
      paymentNumber,
      businessId: currentBusinessId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // 1. Update Supplier Payable: Payable -= amount
    setParties(prev => prev.map(p => {
      if (p.id === data.supplierId) {
        const newPay = Math.max(0, p.currentPayable - data.amount);
        return {
          ...p,
          currentPayable: newPay,
          balance: p.currentReceivable - newPay
        };
      }
      return p;
    }));

    // 2. If specific purchase targeted, update purchase bill
    if (data.purchaseId) {
      setPurchases(prev => prev.map(pur => {
        if (pur.id === data.purchaseId) {
          const newPaid = pur.paidAmount + data.amount;
          const newBalance = Math.max(0, pur.total - newPaid);
          const newStatus: PurchaseStatus = newBalance === 0 ? 'paid' : 'partially_paid';
          return {
            ...pur,
            paidAmount: newPaid,
            balance: newBalance,
            status: newStatus
          };
        }
        return pur;
      }));
    }

    // 3. Update Bank/Cash Account
    const targetAcc = accounts.find(a => a.id === data.accountId);
    setAccounts(prev => prev.map(a => {
      if (a.id === data.accountId) {
        return {
          ...a,
          balance: a.balance - data.amount,
          moneyOut: a.moneyOut + data.amount
        };
      }
      return a;
    }));

    // 4. Log Account Transaction
    const atxn: AccountTransaction = {
      id: 'atxn_' + Date.now(),
      businessId: currentBusinessId,
      accountId: data.accountId,
      accountName: data.accountName,
      date: data.date,
      type: 'payment_out',
      reference: paymentNumber,
      description: `Payment made to ${data.supplierName}${data.purchaseNumber ? ` for ${data.purchaseNumber}` : ''}`,
      moneyIn: 0,
      moneyOut: data.amount,
      balance: (targetAcc?.balance || 0) - data.amount,
      createdAt: newPayment.createdAt
    };
    setAccountTransactions(prev => [atxn, ...prev]);

    setPaymentsOut(prev => [newPayment, ...prev]);
    addToast({
      type: 'success',
      title: 'Payment Out Recorded',
      message: `${paymentNumber}: ${formatCurrency(data.amount)} paid to ${data.supplierName}`
    });

    return newPayment;
  };

  // Accounts & Banking
  const addAccount = (data: Omit<Account, 'id' | 'businessId' | 'moneyIn' | 'moneyOut' | 'balance'> & { openingBalance?: number }): Account => {
    const ob = data.openingBalance || 0;
    const newAcc: Account = {
      ...data,
      id: 'acc_' + Date.now(),
      businessId: currentBusinessId,
      openingBalance: ob,
      balance: ob,
      moneyIn: ob,
      moneyOut: 0
    };
    setAccounts(prev => [...prev, newAcc]);
    addToast({ type: 'success', title: 'Account Added', message: `${newAcc.name} created.` });
    return newAcc;
  };

  const updateAccount = (id: string, updated: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    addToast({ type: 'success', title: 'Account Updated' });
  };

  const transferFunds = (fromAccountId: string, toAccountId: string, amount: number, notes?: string): boolean => {
    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);
    if (!fromAcc || !toAcc || amount <= 0) return false;
    if (fromAcc.balance < amount) {
      addToast({ type: 'error', title: 'Transfer Failed', message: `Insufficient balance in ${fromAcc.name}` });
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    const ref = 'TRF-' + Date.now().toString().slice(-6);

    setAccounts(prev => prev.map(a => {
      if (a.id === fromAccountId) {
        return { ...a, balance: a.balance - amount, moneyOut: a.moneyOut + amount };
      }
      if (a.id === toAccountId) {
        return { ...a, balance: a.balance + amount, moneyIn: a.moneyIn + amount };
      }
      return a;
    }));

    const outTxn: AccountTransaction = {
      id: 'atxn_' + Date.now() + '_out',
      businessId: currentBusinessId,
      accountId: fromAccountId,
      accountName: fromAcc.name,
      date: today,
      type: 'transfer',
      reference: ref,
      description: `Transfer to ${toAcc.name}${notes ? ` - ${notes}` : ''}`,
      moneyIn: 0,
      moneyOut: amount,
      balance: fromAcc.balance - amount,
      createdAt: today
    };

    const inTxn: AccountTransaction = {
      id: 'atxn_' + Date.now() + '_in',
      businessId: currentBusinessId,
      accountId: toAccountId,
      accountName: toAcc.name,
      date: today,
      type: 'transfer',
      reference: ref,
      description: `Transfer from ${fromAcc.name}${notes ? ` - ${notes}` : ''}`,
      moneyIn: amount,
      moneyOut: 0,
      balance: toAcc.balance + amount,
      createdAt: today
    };

    setAccountTransactions(prev => [outTxn, inTxn, ...prev]);
    addToast({
      type: 'success',
      title: 'Funds Transferred',
      message: `${formatCurrency(amount)} from ${fromAcc.name} to ${toAcc.name}`
    });
    return true;
  };

  const depositFunds = (accountId: string, amount: number, notes?: string) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc || amount <= 0) return;
    const today = new Date().toISOString().split('T')[0];
    const ref = 'DEP-' + Date.now().toString().slice(-6);

    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: a.balance + amount, moneyIn: a.moneyIn + amount } : a));

    const txn: AccountTransaction = {
      id: 'atxn_' + Date.now(),
      businessId: currentBusinessId,
      accountId,
      accountName: acc.name,
      date: today,
      type: 'deposit',
      reference: ref,
      description: `Direct deposit: ${notes || 'Bank / cash deposit'}`,
      moneyIn: amount,
      moneyOut: 0,
      balance: acc.balance + amount,
      createdAt: today
    };
    setAccountTransactions(prev => [txn, ...prev]);
    addToast({ type: 'success', title: 'Deposit Successful', message: `${formatCurrency(amount)} deposited into ${acc.name}` });
  };

  const withdrawFunds = (accountId: string, amount: number, notes?: string) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc || amount <= 0) return;
    if (acc.balance < amount) {
      addToast({ type: 'error', title: 'Withdrawal Failed', message: 'Insufficient funds' });
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const ref = 'WTH-' + Date.now().toString().slice(-6);

    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: a.balance - amount, moneyOut: a.moneyOut + amount } : a));

    const txn: AccountTransaction = {
      id: 'atxn_' + Date.now(),
      businessId: currentBusinessId,
      accountId,
      accountName: acc.name,
      date: today,
      type: 'withdraw',
      reference: ref,
      description: `Direct withdrawal: ${notes || 'Cash / bank withdrawal'}`,
      moneyIn: 0,
      moneyOut: amount,
      balance: acc.balance - amount,
      createdAt: today
    };
    setAccountTransactions(prev => [txn, ...prev]);
    addToast({ type: 'info', title: 'Withdrawal Successful', message: `${formatCurrency(amount)} withdrawn from ${acc.name}` });
  };

  // Expenses
  const addExpense = (data: Omit<Expense, 'id' | 'businessId' | 'createdAt'>): Expense => {
    const targetAcc = accounts.find(a => a.id === data.paidFromAccountId);
    const newExp: Expense = {
      ...data,
      id: 'exp_' + Date.now(),
      businessId: currentBusinessId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Decrease account balance
    setAccounts(prev => prev.map(a => {
      if (a.id === data.paidFromAccountId) {
        return {
          ...a,
          balance: a.balance - data.amount,
          moneyOut: a.moneyOut + data.amount
        };
      }
      return a;
    }));

    // Account transaction log
    const txn: AccountTransaction = {
      id: 'atxn_' + Date.now(),
      businessId: currentBusinessId,
      accountId: data.paidFromAccountId,
      accountName: data.paidFromAccountName,
      date: data.date,
      type: 'expense',
      reference: data.reference,
      description: `Expense: ${data.category} - ${data.description}`,
      moneyIn: 0,
      moneyOut: data.amount,
      balance: (targetAcc?.balance || 0) - data.amount,
      createdAt: newExp.createdAt
    };
    setAccountTransactions(prev => [txn, ...prev]);

    setExpenses(prev => [newExp, ...prev]);
    addToast({
      type: 'success',
      title: 'Expense Recorded',
      message: `${formatCurrency(data.amount)} under ${data.category}`
    });
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    addToast({ type: 'info', title: 'Expense Removed' });
  };

  // Income
  const addIncome = (data: Omit<Income, 'id' | 'businessId' | 'createdAt'>): Income => {
    const targetAcc = accounts.find(a => a.id === data.receivedIntoAccountId);
    const newInc: Income = {
      ...data,
      id: 'inc_' + Date.now(),
      businessId: currentBusinessId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Increase account balance
    setAccounts(prev => prev.map(a => {
      if (a.id === data.receivedIntoAccountId) {
        return {
          ...a,
          balance: a.balance + data.amount,
          moneyIn: a.moneyIn + data.amount
        };
      }
      return a;
    }));

    // Account transaction log
    const txn: AccountTransaction = {
      id: 'atxn_' + Date.now(),
      businessId: currentBusinessId,
      accountId: data.receivedIntoAccountId,
      accountName: data.receivedIntoAccountName,
      date: data.date,
      type: 'income',
      reference: data.reference,
      description: `Income: ${data.category} - ${data.description}`,
      moneyIn: data.amount,
      moneyOut: 0,
      balance: (targetAcc?.balance || 0) + data.amount,
      createdAt: newInc.createdAt
    };
    setAccountTransactions(prev => [txn, ...prev]);

    setIncomes(prev => [newInc, ...prev]);
    addToast({
      type: 'success',
      title: 'Income Recorded',
      message: `${formatCurrency(data.amount)} received into ${data.receivedIntoAccountName}`
    });
    return newInc;
  };

  const deleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
    addToast({ type: 'info', title: 'Income Removed' });
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast({ type: 'info', title: 'All Notifications Cleared' });
  };

  // Batch CSV Import
  const importDataBatch = (type: 'parties' | 'items' | 'sales' | 'purchases' | 'expenses', records: any[]) => {
    const errors: string[] = [];
    let count = 0;

    try {
      if (type === 'parties') {
        const newParties: Party[] = [];
        records.forEach((row, i) => {
          if (!row.name) {
            errors.push(`Row ${i + 1}: Name is required`);
            return;
          }
          const ob = parseFloat(row.openingBalance) || 0;
          const pType = (row.type === 'supplier' || row.type === 'both') ? row.type : 'customer';
          newParties.push({
            id: 'party_' + Date.now() + '_' + i,
            businessId: currentBusinessId,
            name: row.name,
            type: pType,
            phone: row.phone || '',
            email: row.email || '',
            address: row.address || '',
            city: row.city || '',
            country: row.country || 'USA',
            openingBalance: ob,
            balanceType: row.balanceType || (pType === 'supplier' ? 'payable' : 'receivable'),
            currentReceivable: pType === 'supplier' ? 0 : ob,
            currentPayable: pType === 'supplier' ? ob : 0,
            balance: pType === 'supplier' ? -ob : ob,
            taxNumber: row.taxNumber || '',
            notes: row.notes || '',
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0]
          });
          count++;
        });
        if (newParties.length > 0) {
          setParties(prev => [...newParties, ...prev]);
        }
      } else if (type === 'items') {
        const newItems: Item[] = [];
        const newMoves: StockMovement[] = [];
        records.forEach((row, i) => {
          if (!row.name) {
            errors.push(`Row ${i + 1}: Item name is required`);
            return;
          }
          const stock = parseFloat(row.openingStock) || 0;
          const pPrice = parseFloat(row.purchasePrice) || 0;
          const sPrice = parseFloat(row.sellingPrice) || 0;
          const item: Item = {
            id: 'item_' + Date.now() + '_' + i,
            businessId: currentBusinessId,
            name: row.name,
            sku: row.sku || `SKU-${Date.now().toString().slice(-4)}-${i}`,
            category: row.category || 'General',
            brand: row.brand || '',
            unit: row.unit || 'pcs',
            purchasePrice: pPrice,
            sellingPrice: sPrice,
            wholesalePrice: parseFloat(row.wholesalePrice) || sPrice,
            taxRate: parseFloat(row.taxRate) || 10,
            openingStock: stock,
            minimumStock: parseFloat(row.minimumStock) || 5,
            warehouse: row.warehouse || 'Main Warehouse',
            openingStockValue: stock * pPrice,
            currentStock: stock,
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0]
          };
          newItems.push(item);
          if (stock > 0) {
            newMoves.push({
              id: 'sm_' + Date.now() + '_' + i,
              businessId: currentBusinessId,
              itemId: item.id,
              itemName: item.name,
              date: item.createdAt,
              type: 'opening',
              quantity: stock,
              balanceAfter: stock,
              referenceType: 'manual',
              notes: 'Imported opening stock',
              createdAt: item.createdAt
            });
          }
          count++;
        });
        if (newItems.length > 0) {
          setItems(prev => [...newItems, ...prev]);
          setStockMovements(prev => [...newMoves, ...prev]);
        }
      } else if (type === 'expenses') {
        const newExps: Expense[] = [];
        const defAcc = accounts[0];
        records.forEach((row, i) => {
          const amt = parseFloat(row.amount);
          if (!row.category || isNaN(amt) || amt <= 0) {
            errors.push(`Row ${i + 1}: Valid Category and positive Amount required`);
            return;
          }
          newExps.push({
            id: 'exp_' + Date.now() + '_' + i,
            businessId: currentBusinessId,
            category: row.category,
            date: row.date || new Date().toISOString().split('T')[0],
            amount: amt,
            paidFromAccountId: defAcc?.id || 'acc_01',
            paidFromAccountName: defAcc?.name || 'Cash in Hand',
            description: row.description || '',
            reference: row.reference || '',
            createdAt: new Date().toISOString().split('T')[0]
          });
          count++;
        });
        if (newExps.length > 0) {
          setExpenses(prev => [...newExps, ...prev]);
        }
      }
    } catch (e: any) {
      errors.push(e.message || 'Import parsing exception');
    }

    return { successCount: count, errors };
  };

  const cleanAllEntryData = () => {
    setParties([]);
    setItems([]);
    setSalesInvoices([]);
    setPurchases([]);
    setPaymentsIn([]);
    setPaymentsOut([]);
    setExpenses([]);
    setIncomes([]);
    setAccountTransactions([]);
    setStockMovements([]);
    setAccounts(initialAccounts.map(a => ({ ...a, balance: 0, openingBalance: 0, moneyIn: 0, moneyOut: 0 })));
    setBusinesses(prev => prev.map(b => ({ ...b, currency: 'Rs', currencySymbol: 'Rs ' })));
    addToast({
      type: 'success',
      title: 'Workspace Cleaned',
      message: 'All transaction and master entry data cleaned. Currency set to Rs.'
    });
  };

  const resetToDemoData = () => {
    cleanAllEntryData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        isSetupWizardCompleted,
        completeSetupWizard,
        currentBusiness,
        businesses,
        switchBusiness,
        addBusiness,
        updateBusinessSettings,
        invoiceSettings,
        updateInvoiceSettings,
        taxSettings,
        updateTaxSettings,
        users,
        addUser,
        updateUser,
        dateFilter,
        setDateFilter,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        parties,
        addParty,
        updateParty,
        deleteParty,
        items,
        addItem,
        updateItem,
        deleteItem,
        adjustStock,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        unitsOfMeasure,
        addUnitOfMeasure,
        updateUnitOfMeasure,
        deleteUnitOfMeasure,
        salesInvoices,
        createSalesInvoice,
        updateSalesInvoiceStatus,
        cancelSalesInvoice,
        purchases,
        createPurchaseBill,
        updatePurchaseStatus,
        cancelPurchaseBill,
        paymentsIn,
        recordPaymentIn,
        paymentsOut,
        recordPaymentOut,
        accounts,
        addAccount,
        updateAccount,
        transferFunds,
        depositFunds,
        withdrawFunds,
        accountTransactions,
        expenses,
        addExpense,
        deleteExpense,
        incomes,
        addIncome,
        deleteIncome,
        stockMovements,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        importDataBatch,
        formatCurrency,
        toasts,
        addToast,
        removeToast,
        resetToDemoData,
        cleanAllEntryData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
