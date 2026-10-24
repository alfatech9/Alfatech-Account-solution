import React, { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon: ReactNode;
  accentColor: 'green' | 'blue' | 'red' | 'orange' | 'emerald';
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  amount,
  subtitle,
  icon,
  accentColor,
  trend,
  onClick
}) => {
  const accentStyles = {
    green: {
      border: 'hover:border-[#16A085]/60',
      badgeBg: 'bg-[#16A085]/10 text-[#16A085]',
      glow: 'group-hover:bg-[#16A085]/5',
      indicator: 'bg-[#16A085]'
    },
    blue: {
      border: 'hover:border-[#2F80ED]/60',
      badgeBg: 'bg-[#2F80ED]/10 text-[#2F80ED]',
      glow: 'group-hover:bg-[#2F80ED]/5',
      indicator: 'bg-[#2F80ED]'
    },
    red: {
      border: 'hover:border-[#E74C3C]/60',
      badgeBg: 'bg-[#E74C3C]/10 text-[#E74C3C]',
      glow: 'group-hover:bg-[#E74C3C]/5',
      indicator: 'bg-[#E74C3C]'
    },
    orange: {
      border: 'hover:border-[#F39C12]/60',
      badgeBg: 'bg-[#F39C12]/10 text-[#F39C12]',
      glow: 'group-hover:bg-[#F39C12]/5',
      indicator: 'bg-[#F39C12]'
    },
    emerald: {
      border: 'hover:border-emerald-500/60',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      glow: 'group-hover:bg-emerald-50/50',
      indicator: 'bg-emerald-600'
    }
  };

  const currentAccent = accentStyles[accentColor];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 ' + currentAccent.border : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tracking-tight tabular-nums">
            {amount}
          </div>
          {subtitle && (
            <div className="text-xs text-slate-500 mt-1 truncate">
              {subtitle}
            </div>
          )}
        </div>

        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${currentAccent.badgeBg} transition-transform group-hover:scale-105`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-semibold font-mono tabular-nums ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.value}
            </span>
            <span className="text-slate-500">{trend.label || 'vs last period'}</span>
          </div>
        ) : (
          <span className="text-slate-400">Click to view records</span>
        )}

        {onClick && (
          <span className="inline-flex items-center gap-0.5 text-xs text-slate-400 group-hover:text-slate-700 transition-colors">
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
};
