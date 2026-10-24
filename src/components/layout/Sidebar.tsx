import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  ShoppingCart,
  Landmark,
  ArrowDownCircle,
  FileBarChart,
  UploadCloud,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Plus
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenQuickAddModal?: (type: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { currentBusiness, businesses, switchBusiness, logout, notifications } = useApp();
  const [isBizDropdownOpen, setIsBizDropdownOpen] = useState(false);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const businessNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'parties', label: 'Parties', icon: Users },
    { id: 'items', label: 'Items & Stock', icon: Package },
    { id: 'sales', label: 'Sales Invoices', icon: Receipt },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'cash-bank', label: 'Cash & Banks', icon: Landmark },
    { id: 'income-expenses', label: 'Income & Expenses', icon: ArrowDownCircle },
  ];

  const managementNavItems = [
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'import-data', label: 'Import Data', icon: UploadCloud },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const accountNavItems = [
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <aside
      className={`no-print h-full flex flex-col bg-white border-r border-slate-200 transition-all duration-300 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          {/* Connected Link Icon Brand Logo */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#0E7C66] to-[#16A085] text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 17H7A5 5 0 0 1 7 7H9M15 7H17A5 5 0 1 1 17 17H15M8 12H16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-slate-900 tracking-tight leading-none">
                ALFATECH<span className="text-[#16A085]">LINK</span>
              </span>
              <span className="text-[10px] text-slate-600 font-medium tracking-tight mt-0.5">
                Smart Business • Simple Accounting
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Business Selector Card */}
      <div className="px-3 py-3 border-b border-slate-100 shrink-0 relative">
        <button
          onClick={() => setIsBizDropdownOpen(!isBizDropdownOpen)}
          className={`w-full flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors text-left border border-slate-200/60 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title={isCollapsed ? currentBusiness.name : undefined}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#2F80ED]/10 text-[#2F80ED] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {currentBusiness.name}
                </div>
                <div className="text-[10px] text-slate-600 truncate">
                  {currentBusiness.phone || 'Active Workspace'}
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
        </button>

        {/* Business Selector Dropdown */}
        {isBizDropdownOpen && (
          <div className="absolute top-14 left-3 right-3 z-30 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Switch Business
            </div>
            {businesses.map((biz) => (
              <button
                key={biz.id}
                onClick={() => {
                  switchBusiness(biz.id);
                  setIsBizDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  biz.id === currentBusiness.id ? 'text-[#16A085] font-semibold bg-[#16A085]/5' : 'text-slate-700'
                }`}
              >
                <span className="truncate">{biz.name}</span>
                {biz.id === currentBusiness.id && <span className="w-1.5 h-1.5 rounded-full bg-[#16A085]" />}
              </button>
            ))}
            <div className="border-t border-slate-100 my-1 pt-1">
              <button
                onClick={() => {
                  setIsBizDropdownOpen(false);
                  handleNavClick('settings');
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-[#2F80ED] hover:bg-blue-50 flex items-center gap-1.5 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add / Manage Businesses</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nav Link Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Business Navigation */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Business Operations
            </div>
          )}
          <nav className="space-y-1">
            {businessNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-[#16A085] text-white shadow-xs shadow-[#16A085]/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  {item.id === 'items' && !isCollapsed && unreadNotifsCount > 0 && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Management Navigation */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Management & Tools
            </div>
          )}
          <nav className="space-y-1">
            {managementNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-[#16A085] text-white shadow-xs shadow-[#16A085]/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Account & Billing */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Account
            </div>
          )}
          <nav className="space-y-1">
            {accountNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-[#16A085] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <button
          onClick={logout}
          title={isCollapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 z-30">
        {content}
      </div>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
