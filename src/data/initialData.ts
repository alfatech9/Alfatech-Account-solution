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
  ItemCategory,
  UnitOfMeasure
} from '../types';

export const initialBusiness: Business = {
  id: 'biz_01',
  name: 'Alfatechlink Business',
  phone: '',
  email: 'infoalfatech9@gmail.com',
  address: '',
  city: '',
  country: '',
  website: '',
  taxNumber: '',
  currency: 'Rs',
  currencySymbol: 'Rs ',
  financialYearStart: '2026-01-01',
  financialYearEnd: '2026-12-31',
  logo: ''
};

export const initialInvoiceSettings: InvoiceSettings = {
  invoicePrefix: 'INV-',
  purchasePrefix: 'PUR-',
  paymentInPrefix: 'PAYIN-',
  paymentOutPrefix: 'PAYOUT-',
  numberPadding: 6,
  termsAndConditions: 'Payment is due as agreed. Thank you for your business.',
  signatureText: 'Authorized Signatory',
  footerText: 'Alfatechlink • Smart Business • Simple Accounting'
};

export const initialTaxSettings: TaxSettings = {
  defaultTaxRate: 0,
  vatNumber: '',
  isTaxInclusive: false
};

export const initialAccounts: Account[] = [
  {
    id: 'acc_01',
    businessId: 'biz_01',
    name: 'Cash in Hand',
    type: 'cash',
    balance: 0.00,
    openingBalance: 0.00,
    moneyIn: 0.00,
    moneyOut: 0.00,
    isDefault: true
  },
  {
    id: 'acc_02',
    businessId: 'biz_01',
    name: 'Main Bank Account',
    type: 'bank',
    bankName: 'Commercial Bank',
    accountNumber: '',
    balance: 0.00,
    openingBalance: 0.00,
    moneyIn: 0.00,
    moneyOut: 0.00
  },
  {
    id: 'acc_03',
    businessId: 'biz_01',
    name: 'Mobile Wallet / Digital Account',
    type: 'mobile_wallet',
    accountNumber: '',
    balance: 0.00,
    openingBalance: 0.00,
    moneyIn: 0.00,
    moneyOut: 0.00
  }
];

export const initialParties: Party[] = [];

export const initialItems: Item[] = [];

export const initialSalesInvoices: SalesInvoice[] = [];

export const initialPurchases: PurchaseBill[] = [];

export const initialPaymentsIn: PaymentIn[] = [];

export const initialPaymentsOut: PaymentOut[] = [];

export const initialExpenses: Expense[] = [];

export const initialIncomes: Income[] = [];

export const initialAccountTransactions: AccountTransaction[] = [];

export const initialStockMovements: StockMovement[] = [];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_welcome',
    title: 'Workspace Initialized',
    message: 'Alfatechlink accounting workspace is clean and ready with currency set to Rs.',
    type: 'system',
    date: '2026-10-03',
    read: false,
    linkRoute: 'dashboard'
  }
];

export const initialUsers: User[] = [
  {
    id: 'usr_01',
    name: 'Admin User',
    email: 'infoalfatech9@gmail.com',
    phone: '',
    role: 'Owner',
    status: 'active',
    createdAt: '2026-01-01'
  }
];

export const initialCategories: ItemCategory[] = [
  { id: 'cat_01', name: 'Computers & Hardware', description: 'Desktops, laptops, monitors, storage devices', createdAt: '2026-01-01' },
  { id: 'cat_02', name: 'Peripherals & Accessories', description: 'Keyboards, mice, docks, cables', createdAt: '2026-01-01' },
  { id: 'cat_03', name: 'Networking Equipment', description: 'Routers, switches, access points, fiber', createdAt: '2026-01-01' },
  { id: 'cat_04', name: 'Office Furniture', description: 'Ergonomic chairs, standing desks, cabinets', createdAt: '2026-01-01' },
  { id: 'cat_05', name: 'Stationery & Consumables', description: 'Paper, toner, pens, printer ink', createdAt: '2026-01-01' },
  { id: 'cat_06', name: 'Electronics & Gadgets', description: 'Smart devices, tablets, audio gear', createdAt: '2026-01-01' },
  { id: 'cat_07', name: 'Services & Licenses', description: 'IT maintenance, software licenses, consulting', createdAt: '2026-01-01' },
  { id: 'cat_08', name: 'General Products', description: 'Standard unclassified inventory items', createdAt: '2026-01-01' }
];

export const initialUnitsOfMeasure: UnitOfMeasure[] = [
  { id: 'uom_01', name: 'Pieces', code: 'pcs', description: 'Individual piece count', createdAt: '2026-01-01' },
  { id: 'uom_02', name: 'Units', code: 'unit', description: 'Single item or equipment unit', createdAt: '2026-01-01' },
  { id: 'uom_03', name: 'Boxes', code: 'box', description: 'Packaged carton or box', createdAt: '2026-01-01' },
  { id: 'uom_04', name: 'Kilograms', code: 'kg', description: 'Metric weight in kilograms', createdAt: '2026-01-01' },
  { id: 'uom_05', name: 'Sets', code: 'set', description: 'Bundled complete package or kit', createdAt: '2026-01-01' },
  { id: 'uom_06', name: 'Meters', code: 'm', description: 'Length measurement in meters', createdAt: '2026-01-01' },
  { id: 'uom_07', name: 'Liters', code: 'ltr', description: 'Liquid volume in liters', createdAt: '2026-01-01' },
  { id: 'uom_08', name: 'Packets', code: 'pkt', description: 'Small shrink-wrap or pouch', createdAt: '2026-01-01' },
  { id: 'uom_09', name: 'Dozens', code: 'dz', description: 'Pack of 12 items', createdAt: '2026-01-01' },
  { id: 'uom_10', name: 'Rolls', code: 'roll', description: 'Coiled cable or material roll', createdAt: '2026-01-01' }
];
