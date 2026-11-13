import React, { useState } from 'react';
import { useBusiness } from '../../../business/BusinessContext';
import { useApp } from '../../../context/AppContext';
import { SubscriptionPlanId, SubscriptionPlan } from '../../../business/types';
import { SUBSCRIPTION_PLANS } from '../../../business/seedData';
import {
  Sparkles,
  Check,
  ShieldCheck,
  CreditCard,
  Zap,
  ArrowRight,
  Clock,
  Layers,
  X,
  AlertCircle,
  Building2,
} from 'lucide-react';

export const SubscriptionView: React.FC = () => {
  const { subscription, upgradeSubscription, cancelSubscription } = useBusiness();
  const { showToast } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlan | null>(null);
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);

  const currentPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId) || SUBSCRIPTION_PLANS[2];

  const handleExecuteUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlanForUpgrade(plan);
  };

  const handleConfirmRazorpayCheckout = () => {
    if (!selectedPlanForUpgrade) return;
    setIsProcessingRazorpay(true);

    setTimeout(() => {
      const paymentId = `pay_rzp_${Date.now()}`;
      upgradeSubscription(selectedPlanForUpgrade.id, billingCycle, paymentId);
      setIsProcessingRazorpay(false);
      setSelectedPlanForUpgrade(null);
      showToast(
        `🎉 Successfully upgraded to ${selectedPlanForUpgrade.name} (${billingCycle.toUpperCase()})! Verified via Razorpay.`,
        'success'
      );
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Current Subscription Status */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active SaaS License</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded-full">
              {subscription.billingCycle.toUpperCase()} BILLING
            </span>
          </div>

          <h2 className="text-2xl font-black font-display tracking-tight text-white">
            Current Tier: {currentPlan.name}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            {currentPlan.tagline}. Valid until {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}.
          </p>
        </div>

        {/* Usage Counters Box */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2 text-xs min-w-[240px]">
          <div className="flex justify-between font-bold">
            <span className="text-slate-300">Invoices this month:</span>
            <span className="text-white">{subscription.usageCounters.invoicesCreatedThisMonth} / Unlimited</span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-1/4 rounded-full" />
          </div>

          <div className="flex justify-between font-bold pt-1">
            <span className="text-slate-300">Parties Created:</span>
            <span className="text-white">{subscription.usageCounters.partiesCreated} Parties</span>
          </div>

          <div className="flex justify-between font-bold">
            <span className="text-slate-300">Warehouses Active:</span>
            <span className="text-white">{subscription.usageCounters.warehousesCreated} of 10</span>
          </div>
        </div>
      </div>

      {/* Billing Cycle Switcher */}
      <div className="flex justify-center items-center space-x-3 py-2">
        <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
          Monthly Billing
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
          className="w-12 h-6 bg-slate-900 rounded-full p-1 transition-colors relative"
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex items-center space-x-1">
          <span className={`text-xs font-bold ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
            Annual Billing
          </span>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Save 20%
          </span>
        </div>
      </div>

      {/* Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = subscription.planId === plan.id;
          const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between relative ${
                isCurrent
                  ? 'bg-white border-brand-500 shadow-soft-md ring-2 ring-brand-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-soft-sm'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 right-4 text-[10px] font-black uppercase tracking-wider bg-brand-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  {plan.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-slate-900 text-base">{plan.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 min-h-[32px]">{plan.tagline}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-slate-900">₹{price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400 font-bold">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                  </div>
                  {billingCycle === 'annual' && price > 0 && (
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      Billed ₹{price} annually
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs pt-2">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-medium leading-tight">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                {isCurrent ? (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center border border-emerald-200 flex items-center justify-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Current Active Plan</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleExecuteUpgrade(plan)}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1"
                  >
                    <span>Upgrade Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Payment History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-brand-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Subscription Invoices &amp; Payment History</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">{subscription.paymentHistory.length} Payments</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Plan Subscribed</th>
              <th className="py-2.5 px-3">Amount Paid</th>
              <th className="py-2.5 px-3">Payment Method &amp; Gateway ID</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {subscription.paymentHistory.map((pay) => (
              <tr key={pay.id} className="hover:bg-slate-50/80">
                <td className="py-2.5 px-3 text-slate-600">{pay.date}</td>
                <td className="py-2.5 px-3 font-bold text-slate-900 uppercase">
                  {pay.planId} ({pay.billingCycle})
                </td>
                <td className="py-2.5 px-3 font-black text-slate-900">
                  ₹{pay.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-600">
                  {pay.paymentMethod} • {pay.razorpayPaymentId || 'Verified'}
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ✓ Success
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RAZORPAY SIMULATED SUBSCRIPTION CHECKOUT MODAL */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Razorpay Subscriptions Checkout</h3>
                  <p className="text-[10px] text-slate-400">Server-Side Verified Payment Gateway</p>
                </div>
              </div>
              <button onClick={() => setSelectedPlanForUpgrade(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-3 text-xs font-bold">
              <div className="flex justify-between text-slate-600">
                <span>Selected Plan:</span>
                <span className="text-slate-900">{selectedPlanForUpgrade.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Billing Period:</span>
                <span className="capitalize text-slate-900">{billingCycle}</span>
              </div>
              <div className="flex justify-between text-slate-900 text-sm font-black pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-brand-700">
                  ₹
                  {(billingCycle === 'annual'
                    ? selectedPlanForUpgrade.priceAnnual
                    : selectedPlanForUpgrade.priceMonthly
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Standard 256-bit encryption. UPI Auto-Pay, Debit Card &amp; NetBanking auto-renewal supported.
              </span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingRazorpay}
                onClick={handleConfirmRazorpayCheckout}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5"
              >
                {isProcessingRazorpay ? (
                  <span>Authorizing via Razorpay...</span>
                ) : (
                  <span>Pay with Razorpay</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

