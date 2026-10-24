import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  MapPin,
  Percent,
  Wallet,
  Users,
  Package,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const {
    currentBusiness,
    updateBusinessSettings,
    addParty,
    addItem,
    depositFunds,
    accounts,
    completeSetupWizard,
    addToast
  } = useApp();

  const [step, setStep] = useState(1);

  // Step 1: Business Name
  const [bizName, setBizName] = useState(currentBusiness.name || 'Alfatech Solutions');
  const [industry, setIndustry] = useState('Technology & Retail');

  // Step 2: Contact Info
  const [phone, setPhone] = useState(currentBusiness.phone || '');
  const [email, setEmail] = useState(currentBusiness.email || 'infoalfatech9@gmail.com');
  const [address, setAddress] = useState(currentBusiness.address || '');
  const [city, setCity] = useState(currentBusiness.city || '');
  const [country, setCountry] = useState(currentBusiness.country || '');

  // Step 3: Currency & Tax
  const [currency, setCurrency] = useState('Rs');
  const [currencySymbol, setCurrencySymbol] = useState('Rs ');
  const [taxNumber, setTaxNumber] = useState('');
  const [taxRate, setTaxRate] = useState(0);

  // Step 4: Opening Balance
  const [openingCash, setOpeningCash] = useState(0);
  const [openingBank, setOpeningBank] = useState(0);

  // Step 5: First Customer
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custBalance, setCustBalance] = useState(0);

  // Step 6: First Product
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPurchase, setProdPurchase] = useState(0);
  const [prodSelling, setProdSelling] = useState(0);
  const [prodStock, setProdStock] = useState(0);

  const handleNext = () => {
    if (step < 7) {
      setStep(s => s + 1);
    } else {
      handleFinalize();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
    }
  };

  const handleFinalize = () => {
    // 1. Update business
    updateBusinessSettings({
      name: bizName,
      phone,
      email,
      address,
      city,
      country,
      taxNumber,
      currency,
      currencySymbol
    });

    // 2. Deposit opening balances if configured
    if (openingCash > 0 && accounts[0]) {
      depositFunds(accounts[0].id, openingCash, 'Setup wizard opening cash balance');
    }
    if (openingBank > 0 && accounts[1]) {
      depositFunds(accounts[1].id, openingBank, 'Setup wizard opening bank balance');
    }

    // 3. Create first customer
    if (custName.trim()) {
      addParty({
        name: custName.trim(),
        type: 'customer',
        phone: custPhone.trim(),
        email: custEmail.trim(),
        address: city,
        city,
        country,
        openingBalance: Number(custBalance) || 0,
        balanceType: 'receivable',
        status: 'active'
      });
    }

    // 4. Create first product
    if (prodName.trim()) {
      addItem({
        name: prodName.trim(),
        sku: prodSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        category: 'Services',
        brand: bizName,
        unit: 'unit',
        purchasePrice: Number(prodPurchase) || 0,
        sellingPrice: Number(prodSelling) || 0,
        wholesalePrice: Number(prodSelling) || 0,
        taxRate: Number(taxRate) || 10,
        openingStock: Number(prodStock) || 0,
        minimumStock: 2,
        warehouse: 'Main Warehouse',
        status: 'active'
      });
    }

    completeSetupWizard();
    onComplete();
  };

  const stepTitles = [
    'Create Your Business',
    'Business Information',
    'Currency & Tax',
    'Opening Balance',
    'Create First Customer',
    'Create First Product',
    'Complete Setup'
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Wizard Progress Bar */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#16A085] flex items-center justify-center font-bold text-xs">
                AL
              </div>
              <span className="font-bold text-sm tracking-tight">ALFATECHLINK ONBOARDING</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Step {step} of 7
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#16A085] h-full transition-all duration-300"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>

          <h2 className="text-lg font-bold text-white mt-4">
            {stepTitles[step - 1]}
          </h2>
        </div>

        {/* Step Body */}
        <div className="p-6 sm:p-8">
          {/* Step 1: Create Your Business */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Let's set up your brand and primary workspace name.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="e.g. Alfatech Solutions Ltd."
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry / Business Type
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Technology & IT">Technology & IT Services</option>
                  <option value="Retail & Wholesale">Retail & Wholesale Distribution</option>
                  <option value="Manufacturing">Manufacturing & Assembly</option>
                  <option value="Professional Services">Professional Consulting</option>
                  <option value="General Trading">General Commercial Trading</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Contact information for your invoices, receipts, and letterheads.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Currency & Tax */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Choose the currency and standard tax rate for your invoicing.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      if (e.target.value === 'Rs' || e.target.value === 'PKR' || e.target.value === 'INR') setCurrencySymbol('Rs ');
                      else if (e.target.value === 'USD') setCurrencySymbol('$');
                      else if (e.target.value === 'EUR') setCurrencySymbol('€');
                      else if (e.target.value === 'GBP') setCurrencySymbol('£');
                      else if (e.target.value === 'BDT') setCurrencySymbol('৳');
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Rs">Rs - Rupee (Rs)</option>
                    <option value="PKR">PKR - Pakistani Rupee (Rs)</option>
                    <option value="INR">INR - Indian Rupee (Rs)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                    <option value="BDT">BDT - Bangladeshi Taka (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax / VAT Number</label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Opening Balance */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Enter your starting liquid balances in Cash and Bank.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Cash in Hand</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={openingCash || ''}
                    onChange={(e) => setOpeningCash(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full text-sm font-bold font-mono px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-[#2F80ED]" />
                    <span className="text-xs font-bold text-slate-800">Primary Bank Account</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={openingBank || ''}
                    onChange={(e) => setOpeningBank(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full text-sm font-bold font-mono px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Create First Customer */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Add your primary client or wholesale partner to test transactions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Create First Product */}
          {step === 6 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Add your primary product or catalog item.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Rate ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={prodPurchase || ''}
                    onChange={(e) => setProdPurchase(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Rate ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={prodSelling || ''}
                    onChange={(e) => setProdSelling(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Starting Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={prodStock || ''}
                    onChange={(e) => setProdStock(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Complete Setup */}
          {step === 7 && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#16A085] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                All Set & Ready to Go!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your company profile for <strong>{bizName}</strong> is configured. Your opening accounts, customer, and product are saved.
              </p>
            </div>
          )}

          {/* Wizard Footer Navigation */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-md transition-colors"
            >
              <span>{step === 7 ? 'Go to Dashboard' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
