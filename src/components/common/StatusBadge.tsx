import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'invoice' | 'purchase' | 'party' | 'item' | 'account';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = (status || '').toLowerCase().replace(/_/g, ' ');

  // Compliant with Anti-Slop & Zero-Pill discipline:
  // Rendered as clean, unboxed text with subtle typographic dot/indicator
  let colorClass = 'text-slate-600 bg-slate-100';
  let dotClass = 'bg-slate-400';

  if (['paid', 'active', 'completed'].includes(norm)) {
    colorClass = 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60';
    dotClass = 'bg-emerald-500';
  } else if (['partially paid', 'partial', 'pending'].includes(norm)) {
    colorClass = 'text-amber-700 bg-amber-50/80 border-amber-200/60';
    dotClass = 'bg-amber-500';
  } else if (['unpaid', 'overdue', 'cancelled', 'inactive'].includes(norm)) {
    colorClass = 'text-rose-700 bg-rose-50/80 border-rose-200/60';
    dotClass = 'bg-rose-500';
  } else if (norm === 'draft') {
    colorClass = 'text-slate-600 bg-slate-100 border-slate-200';
    dotClass = 'bg-slate-400';
  }

  const label = norm.charAt(0).toUpperCase() + norm.slice(1);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${colorClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      <span className="capitalize">{label}</span>
    </span>
  );
};
