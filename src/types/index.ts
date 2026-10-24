export type UserRole = 'Owner' | 'Admin' | 'Accountant' | 'Sales' | 'Purchase' | 'Viewer';

export interface UserPermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  website?: string;
  taxNumber: string;
  currency: string;
  currencySymbol: string;
  financialYearStart: string;
  financialYearEnd: string;
  logo?: string;
}

export type PartyType = 'customer' | 'supplier' | 'both';
export type BalanceType = 'receivable' | 'payable';

export interface Party {
  id: string;
  businessId: string;
  name: string;
  type: PartyType;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  openingBalance: number;
  balanceType: BalanceType;
  currentReceivable: number;
  currentPayable: number;
  balance: number; // positive = net receivable, negative = net payable
  taxNumber?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ItemCategory {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  code: string; // e.g. 'pcs', 'kg', 'box', 'unit', 'set', 'm', 'ltr', 'pkt', 'dz'
  description?: string;
  createdAt?: string;
}

export interface Item {
  id: string;
  businessId: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  unit: string; // 'pcs', 'box', 'kg', 'set', 'unit'
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  taxRate: number; // e.g. 5, 10, 15
  openingStock: number;
  minimumStock: number;
  warehouse: string;
  openingStockValue: number;
  currentStock: number;
  status: 'active' | 'inactive';
  image?: string;
  createdAt: string;
}

export type StockMovementType = 'opening' | 'purchase' | 'sale' | 'adjustment' | 'return';

export interface StockMovement {
  id: string;
  businessId: string;
  itemId: string;
  itemName: string;
  date: string;
  type: StockMovementType;
  quantity: number; // positive for addition, negative for reduction
  balanceAfter: number;
  referenceType?: 'invoice' | 'purchase' | 'manual';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'cancelled';
export type PaymentMethod = 'Cash' | 'Bank' | 'Mobile Banking' | 'Card' | 'Other';

export interface InvoiceItem {
  id: string;
  itemId: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number; // percentage or fixed
  taxRate: number;
  amount: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  date: string;
  dueDate: string;
  paymentTerms: string; // 'Immediate', 'Net 15', 'Net 30', 'Net 60'
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCharges: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  paymentAccountId?: string;
  notes?: string;
  createdAt: string;
}

export type PurchaseStatus = 'unpaid' | 'partially_paid' | 'paid' | 'cancelled';

export interface PurchaseBill {
  id: string;
  purchaseNumber: string;
  businessId: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCharges: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: PurchaseStatus;
  paymentMethod?: PaymentMethod;
  paymentAccountId?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentIn {
  id: string;
  paymentNumber: string;
  businessId: string;
  customerId: string;
  customerName: string;
  invoiceId?: string;
  invoiceNumber?: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountId: string;
  accountName: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentOut {
  id: string;
  paymentNumber: string;
  businessId: string;
  supplierId: string;
  supplierName: string;
  purchaseId?: string;
  purchaseNumber?: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountId: string;
  accountName: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export type AccountType = 'cash' | 'bank' | 'mobile_wallet' | 'other';

export interface Account {
  id: string;
  businessId: string;
  name: string;
  type: AccountType;
  accountNumber?: string;
  bankName?: string;
  balance: number;
  openingBalance: number;
  moneyIn: number;
  moneyOut: number;
  isDefault?: boolean;
}

export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'payment_in' | 'payment_out' | 'expense' | 'income';

export interface AccountTransaction {
  id: string;
  businessId: string;
  accountId: string;
  accountName: string;
  date: string;
  type: TransactionType;
  reference?: string;
  description: string;
  moneyIn: number;
  moneyOut: number;
  balance: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  category: string;
  date: string;
  amount: number;
  paidFromAccountId: string;
  paidFromAccountName: string;
  description: string;
  reference?: string;
  attachment?: string;
  createdAt: string;
}

export interface Income {
  id: string;
  businessId: string;
  category: string;
  date: string;
  amount: number;
  receivedIntoAccountId: string;
  receivedIntoAccountName: string;
  description: string;
  reference?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'invoice_overdue' | 'payment_received' | 'low_stock' | 'purchase_due' | 'customer_payment_due' | 'system';
  date: string;
  read: boolean;
  linkRoute?: string;
}

export interface InvoiceSettings {
  invoicePrefix: string;
  purchasePrefix: string;
  paymentInPrefix: string;
  paymentOutPrefix: string;
  numberPadding: number;
  termsAndConditions: string;
  signatureText: string;
  footerText: string;
}

export interface TaxSettings {
  defaultTaxRate: number;
  vatNumber: string;
  isTaxInclusive: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  usersLimit: string;
  invoicesLimit: string;
  productsLimit: string;
  reportsLimit: string;
  storageLimit: string;
  supportLevel: string;
  isPopular?: boolean;
  features: string[];
}

export type DateFilterRange = 'today' | 'week' | 'month' | 'year' | 'custom';
