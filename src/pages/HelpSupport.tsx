import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HelpCircle, BookOpen, MessageSquare, Send, CheckCircle2, FileQuestion } from 'lucide-react';

export const HelpSupport: React.FC = () => {
  const { addToast } = useApp();

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const faqs = [
    {
      q: 'How does inventory stock automatically update in Alfatechlink?',
      a: 'When you create and save a Sales Invoice, the quantity of each line item is automatically deducted from current stock and a "sale" movement is recorded. When you create and save a Purchase Bill, stock quantities automatically increase and an inward "purchase" movement is logged.'
    },
    {
      q: 'How do Customer and Supplier balances calculate?',
      a: 'Customer Receivable = Opening Balance + Total Invoiced Amount − Payments Received. Supplier Payable = Opening Balance + Total Purchase Bills − Payments Disbursed. You can view chronological statements anytime from the Parties module.'
    },
    {
      q: 'Can I customize invoice numbering and prefixes?',
      a: 'Yes! Navigate to Settings → Invoice Series & Format. You can customize prefixes (e.g. INV-, PUR-, PAYIN-, PAYOUT-) and zero-padding digits.'
    },
    {
      q: 'How does Profit & Loss calculate in the Financial Reports?',
      a: 'Revenue equals total invoiced sales (excluding cancelled invoices). Cost of Goods Sold (COGS) equals total inventory purchases. Gross Profit = Revenue − COGS. Operating Profit = Gross Profit + Ancillary Income − Operating Expenses.'
    }
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSent(true);
    addToast({
      type: 'success',
      title: 'Ticket Submitted',
      message: 'Support ticket dispatched to Alfatechlink customer engineering.'
    });
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h2 className="text-base font-bold text-slate-800">
          Help, Knowledge Base & Technical Support
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Learn how to streamline accounting workflows, reconcile ledgers, and manage multi-warehouse stock.
        </p>
      </div>

      {/* FAQs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#16A085]" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-1">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support Ticket Form */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#2F80ED]" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Contact Priority Support
          </h3>
        </div>

        {ticketSent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Your request has been received. Our support engineers respond within 2 business hours.</span>
            </div>
            <button
              onClick={() => setTicketSent(false)}
              className="text-xs font-bold text-emerald-900 hover:underline"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject / Issue Title *
              </label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Question about VAT tax calculations on exports"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Message *
              </label>
              <textarea
                rows={4}
                required
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Provide steps to reproduce or describe your question..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
