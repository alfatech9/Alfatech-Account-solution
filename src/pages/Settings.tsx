import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  FileText,
  Percent,
  Users,
  UserCheck,
  Shield,
  Save,
  RotateCcw,
  Check,
  Plus
} from 'lucide-react';
import { UserRole } from '../types';

export const Settings: React.FC = () => {
  const {
    currentBusiness,
    updateBusinessSettings,
    invoiceSettings,
    updateInvoiceSettings,
    taxSettings,
    updateTaxSettings,
    users,
    addUser,
    resetToDemoData,
    cleanAllEntryData,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'business' | 'invoice' | 'tax' | 'users' | 'profile'>('business');

  // Business state
  const [bizName, setBizName] = useState(currentBusiness.name);
  const [bizPhone, setBizPhone] = useState(currentBusiness.phone);
  const [bizEmail, setBizEmail] = useState(currentBusiness.email);
  const [bizAddress, setBizAddress] = useState(currentBusiness.address);
  const [bizCity, setBizCity] = useState(currentBusiness.city);
  const [bizCountry, setBizCountry] = useState(currentBusiness.country);
  const [bizTaxNumber, setBizTaxNumber] = useState(currentBusiness.taxNumber);
  const [bizCurrency, setBizCurrency] = useState(currentBusiness.currency);
  const [bizCurrencySymbol, setBizCurrencySymbol] = useState(currentBusiness.currencySymbol);

  // Invoice state
  const [invPrefix, setInvPrefix] = useState(invoiceSettings.invoicePrefix);
  const [purPrefix, setPurPrefix] = useState(invoiceSettings.purchasePrefix);
  const [payInPrefix, setPayInPrefix] = useState(invoiceSettings.paymentInPrefix);
  const [payOutPrefix, setPayOutPrefix] = useState(invoiceSettings.paymentOutPrefix);
  const [numberPadding, setNumberPadding] = useState(invoiceSettings.numberPadding);
  const [terms, setTerms] = useState(invoiceSettings.termsAndConditions);
  const [signature, setSignature] = useState(invoiceSettings.signatureText);
  const [footer, setFooter] = useState(invoiceSettings.footerText);

  // Tax state
  const [taxRate, setTaxRate] = useState(taxSettings.defaultTaxRate);
  const [vatNumber, setVatNumber] = useState(taxSettings.vatNumber);
  const [isInclusive, setIsInclusive] = useState(taxSettings.isTaxInclusive);

  // New User Form State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Accountant');

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessSettings({
      name: bizName,
      phone: bizPhone,
      email: bizEmail,
      address: bizAddress,
      city: bizCity,
      country: bizCountry,
      taxNumber: bizTaxNumber,
      currency: bizCurrency,
      currencySymbol: bizCurrencySymbol
    });
  };

  const handleSaveInvoiceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateInvoiceSettings({
      invoicePrefix: invPrefix,
      purchasePrefix: purPrefix,
      paymentInPrefix: payInPrefix,
      paymentOutPrefix: payOutPrefix,
      numberPadding: Number(numberPadding),
      termsAndConditions: terms,
      signatureText: signature,
      footerText: footer
    });
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    updateTaxSettings({
      defaultTaxRate: Number(taxRate),
      vatNumber,
      isTaxInclusive: isInclusive
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim(),
      role: newUserRole,
      status: 'active'
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setIsAddUserOpen(false);
  };

  // Role permissions matrix
  const permissionsMatrix: Record<UserRole, { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean }> = {
    Owner: { view: true, create: true, edit: true, delete: true, export: true },
    Admin: { view: true, create: true, edit: true, delete: true, export: true },
    Accountant: { view: true, create: true, edit: true, delete: false, export: true },
    Sales: { view: true, create: true, edit: true, delete: false, export: false },
    Purchase: { view: true, create: true, edit: true, delete: false, export: false },
    Viewer: { view: true, create: false, edit: false, delete: false, export: true }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            System Settings & Administration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure business profiles, invoice series, tax regimes, and multi-user roles.
          </p>
        </div>

        <button
          onClick={() => {
            cleanAllEntryData();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clean All Entry Data (Rs)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'business', label: 'Business Profile', icon: Building2 },
          { id: 'invoice', label: 'Invoice Series & Format', icon: FileText },
          { id: 'tax', label: 'Tax & VAT', icon: Percent },
          { id: 'users', label: 'Users & Permissions', icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Business Profile */}
      {activeTab === 'business' && (
        <form onSubmit={handleSaveBusiness} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Business Profile & Legal Entity</h3>
              <p className="text-xs text-slate-500">Official information printed on invoices and balance sheets.</p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Legal Business Name *
              </label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Phone
              </label>
              <input
                type="text"
                value={bizPhone}
                onChange={(e) => setBizPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={bizEmail}
                onChange={(e) => setBizEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Street Address
              </label>
              <input
                type="text"
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={bizCity}
                onChange={(e) => setBizCity(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={bizCountry}
                onChange={(e) => setBizCountry(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tax / VAT Registration ID
              </label>
              <input
                type="text"
                value={bizTaxNumber}
                onChange={(e) => setBizTaxNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={bizCurrencySymbol}
                  onChange={(e) => setBizCurrencySymbol(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Currency Code
                </label>
                <input
                  type="text"
                  value={bizCurrency}
                  onChange={(e) => setBizCurrency(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Invoice Settings */}
      {activeTab === 'invoice' && (
        <form onSubmit={handleSaveInvoiceSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Invoice Series & Numbering Rules</h3>
              <p className="text-xs text-slate-500">Configure auto-incrementing serial prefixes for documents.</p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Rules</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sales Invoice Prefix
              </label>
              <input
                type="text"
                value={invPrefix}
                onChange={(e) => setInvPrefix(e.target.value)}
                placeholder="INV-"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">e.g. INV-000001</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Order / Bill Prefix
              </label>
              <input
                type="text"
                value={purPrefix}
                onChange={(e) => setPurPrefix(e.target.value)}
                placeholder="PUR-"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">e.g. PUR-000001</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment In (Receipt) Prefix
              </label>
              <input
                type="text"
                value={payInPrefix}
                onChange={(e) => setPayInPrefix(e.target.value)}
                placeholder="PAYIN-"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Out Prefix
              </label>
              <input
                type="text"
                value={payOutPrefix}
                onChange={(e) => setPayOutPrefix(e.target.value)}
                placeholder="PAYOUT-"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Terms & Conditions
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Signature Title
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Footer Notice
              </label>
              <input
                type="text"
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Tax Settings */}
      {activeTab === 'tax' && (
        <form onSubmit={handleSaveTax} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tax Rates & VAT Configuration</h3>
              <p className="text-xs text-slate-500">Configure global sales tax and VAT accounting rules.</p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Tax Settings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Default Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                VAT Registration Number
              </label>
              <input
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInclusive}
                  onChange={(e) => setIsInclusive(e.target.checked)}
                  className="rounded text-[#16A085] focus:ring-[#16A085]"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Selling prices are Tax-Inclusive by default
                </span>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: Users & Permissions Matrix */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Team Users & Permissions</h3>
              <p className="text-xs text-slate-500">Manage account access and role-based permissions.</p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(!isAddUserOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite User</span>
            </button>
          </div>

          {/* Add user form */}
          {isAddUserOpen && (
            <form onSubmit={handleCreateUser} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800">Invite New Staff Member</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Sales">Sales</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded"
                >
                  Confirm Invite
                </button>
              </div>
            </form>
          )}

          {/* User List Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono">{u.phone || '—'}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{u.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Permissions Matrix as specified in PDF */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-5 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Role Permissions Matrix
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-configured security enforcement across system operations.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg text-xs">
              <table className="w-full text-center">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Role</th>
                    <th className="py-2.5 px-3">View</th>
                    <th className="py-2.5 px-3">Create</th>
                    <th className="py-2.5 px-3">Edit</th>
                    <th className="py-2.5 px-3">Delete</th>
                    <th className="py-2.5 px-3">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(['Owner', 'Admin', 'Accountant', 'Sales', 'Purchase', 'Viewer'] as UserRole[]).map(role => {
                    const p = permissionsMatrix[role];
                    return (
                      <tr key={role} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 text-left font-bold text-slate-800">{role}</td>
                        <td className="py-2.5 px-3 text-emerald-600">{p.view ? '✓' : '—'}</td>
                        <td className="py-2.5 px-3 text-emerald-600">{p.create ? '✓' : '—'}</td>
                        <td className="py-2.5 px-3 text-emerald-600">{p.edit ? '✓' : '—'}</td>
                        <td className="py-2.5 px-3 text-emerald-600">{p.delete ? '✓' : '—'}</td>
                        <td className="py-2.5 px-3 text-emerald-600">{p.export ? '✓' : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
