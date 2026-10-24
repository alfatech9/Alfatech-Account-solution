import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { SubscriptionPlan } from '../types';

export const Subscription: React.FC = () => {
  const { currentBusiness, addToast, formatCurrency } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlanId, setCurrentPlanId] = useState<string>('pro');

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free Starter',
      tagline: 'For solo entrepreneurs testing accounting workflows',
      priceMonthly: 0,
      priceYearly: 0,
      usersLimit: '1 User',
      invoicesLimit: '50 Invoices / mo',
      productsLimit: '100 Products',
      reportsLimit: 'Standard Reports',
      storageLimit: '500 MB',
      supportLevel: 'Community Support',
      features: [
        'Single user workspace',
        'Sales invoice generation',
        'Basic party management',
        'Manual stock tracking',
        'Standard export to CSV'
      ]
    },
    {
      id: 'basic',
      name: 'Basic Growth',
      tagline: 'For growing retail shops & local service companies',
      priceMonthly: 1999,
      priceYearly: 19990,
      usersLimit: '3 Users',
      invoicesLimit: '500 Invoices / mo',
      productsLimit: '1,000 Products',
      reportsLimit: 'Standard + P&L',
      storageLimit: '5 GB',
      supportLevel: 'Email Support (24h)',
      features: [
        'Up to 3 team members',
        'Sales & Purchase module',
        'Multi-currency support',
        'Automated inventory deduction',
        'Basic Profit & Loss reports',
        'Cash & Bank ledger'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      tagline: 'For established mid-market businesses & distributors',
      priceMonthly: 4999,
      priceYearly: 49990,
      usersLimit: '10 Users',
      invoicesLimit: 'Unlimited Invoices',
      productsLimit: '10,000 Products',
      reportsLimit: 'Full Financial Suite',
      storageLimit: '25 GB',
      supportLevel: 'Priority 24/7 Support',
      isPopular: true,
      features: [
        'Up to 10 user accounts',
        'Unlimited sales & purchase bills',
        'Automated stock movement audit',
        'Complete Profit & Loss & Cash Flow',
        'Custom invoice series & templates',
        'Role-based permissions matrix',
        'Multi-warehouse tracking',
        'Bulk CSV import & export'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      tagline: 'For large commercial enterprises with multi-subsidiary requirements',
      priceMonthly: 9999,
      priceYearly: 99990,
      usersLimit: 'Unlimited Users',
      invoicesLimit: 'Unlimited Invoices',
      productsLimit: 'Unlimited Products',
      reportsLimit: 'Audit-Grade Suite & API',
      storageLimit: '100 GB',
      supportLevel: 'Dedicated Account Manager',
      features: [
        'Unlimited users & businesses',
        'Multi-business consolidation',
        'Custom workflow integrations',
        'Automated backup & high availability',
        'Dedicated account director',
        'Custom SLA & security hardening'
      ]
    }
  ];

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setCurrentPlanId(plan.id);
    addToast({
      type: 'success',
      title: 'Plan Updated',
      message: `Your workspace is now on the ${plan.name} (${billingCycle}) tier.`
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Flexible Plans for Every Business Stage
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Scale your accounting, multi-warehouse stock management, and team access with no hidden fees.
        </p>

        {/* Billing cycle toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              billingCycle === 'yearly' ? 'bg-[#16A085]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
              Yearly Billing
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => {
          const isCurrent = currentPlanId === plan.id;
          const price = billingCycle === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl p-5 border flex flex-col justify-between transition-all ${
                plan.isPopular
                  ? 'border-[#16A085] shadow-md ring-1 ring-[#16A085]'
                  : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#16A085] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 min-h-[36px]">{plan.tagline}</p>

                <div className="my-4 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                      {formatCurrency(price)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ month</span>
                  </div>
                  {billingCycle === 'yearly' && plan.priceYearly > 0 && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Billed annually ({formatCurrency(plan.priceYearly)}/yr)
                    </span>
                  )}
                </div>

                {/* Metric Limits Summary */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-5 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Team:</span>
                    <span className="font-semibold text-slate-800">{plan.usersLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoicing:</span>
                    <span className="font-semibold text-slate-800">{plan.invoicesLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Products:</span>
                    <span className="font-semibold text-slate-800">{plan.productsLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reports:</span>
                    <span className="font-semibold text-slate-800">{plan.reportsLimit}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Included Features
                  </div>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-[#16A085] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : plan.isPopular
                      ? 'bg-[#16A085] hover:bg-[#0E7C66] text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 'Choose Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#16A085] shrink-0" />
          <div>
            <span className="font-bold text-slate-800 block">30-Day Money-Back Guarantee</span>
            <span>Switch plans or cancel subscription anytime with 1-click ledger export.</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Need custom volume?</span>
          <button
            onClick={() => addToast({ type: 'info', title: 'Enterprise Inquiries', message: 'Enterprise sales team contacted.' })}
            className="text-xs font-semibold text-[#16A085] hover:underline"
          >
            Contact Sales →
          </button>
        </div>
      </div>
    </div>
  );
};
