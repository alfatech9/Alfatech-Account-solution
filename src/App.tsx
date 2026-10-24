/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Parties } from './pages/Parties';
import { Items } from './pages/Items';
import { Sales } from './pages/Sales';
import { Purchases } from './pages/Purchases';
import { CashBank } from './pages/CashBank';
import { IncomeExpenses } from './pages/IncomeExpenses';
import { Reports } from './pages/Reports';
import { ImportData } from './pages/ImportData';
import { Settings } from './pages/Settings';
import { Subscription } from './pages/Subscription';
import { HelpSupport } from './pages/HelpSupport';
import { SetupWizard } from './pages/SetupWizard';
import { Auth } from './pages/Auth';

// Global Quick Action Modals
import { CreateSaleInvoiceModal } from './components/modals/CreateSaleInvoiceModal';
import { CreatePurchaseModal } from './components/modals/CreatePurchaseModal';
import { AddPartyModal } from './components/modals/AddPartyModal';
import { AddItemModal } from './components/modals/AddItemModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { IncomeModal } from './components/modals/IncomeModal';
import { PaymentInModal } from './components/modals/PaymentInModal';
import { PaymentOutModal } from './components/modals/PaymentOutModal';
import { InvoiceDetailModal } from './components/modals/InvoiceDetailModal';
import { PurchaseDetailModal } from './components/modals/PurchaseDetailModal';
import { SalesInvoice, PurchaseBill } from './types';

function MainAppShell() {
  const { isAuthenticated, isSetupWizardCompleted, completeSetupWizard } = useApp();

  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Global Quick Action Modals
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const [quickPurchaseOpen, setQuickPurchaseOpen] = useState(false);
  const [quickPartyOpen, setQuickPartyOpen] = useState(false);
  const [quickItemOpen, setQuickItemOpen] = useState(false);
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
  const [quickIncomeOpen, setQuickIncomeOpen] = useState(false);
  const [quickPayInOpen, setQuickPayInOpen] = useState(false);
  const [quickPayOutOpen, setQuickPayOutOpen] = useState(false);

  // Active Detail Views
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseBill | null>(null);
  const [isPurchaseDetailOpen, setIsPurchaseDetailOpen] = useState(false);

  // Keyboard shortcut for global search: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. If not authenticated, show Auth (Login / Register)
  if (!isAuthenticated) {
    return <Auth />;
  }

  // 2. If authenticated but business wizard pending, show SetupWizard
  if (!isSetupWizardCompleted) {
    return <SetupWizard onComplete={() => setCurrentRoute('dashboard')} />;
  }

  const handleOpenQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'sale':
        setQuickSaleOpen(true);
        break;
      case 'purchase':
        setQuickPurchaseOpen(true);
        break;
      case 'party':
        setQuickPartyOpen(true);
        break;
      case 'item':
        setQuickItemOpen(true);
        break;
      case 'expense':
        setQuickExpenseOpen(true);
        break;
      case 'income':
        setQuickIncomeOpen(true);
        break;
      case 'payin':
        setQuickPayInOpen(true);
        break;
      case 'payout':
        setQuickPayOutOpen(true);
        break;
      default:
        break;
    }
  };

  const handleSearchNavigate = (route: string, id?: string) => {
    setCurrentRoute(route);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F9FB] text-[#263238]">
      {/* Left Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(c => !c)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenQuickAddModal={handleOpenQuickAction}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          currentRoute={currentRoute}
          onNavigate={(route) => setCurrentRoute(route)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickAction={handleOpenQuickAction}
        />

        {/* Dynamic Route Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentRoute === 'dashboard' && (
              <Dashboard
                onNavigate={(route) => setCurrentRoute(route)}
                onOpenQuickAction={handleOpenQuickAction}
                onOpenInvoiceDetail={(inv) => {
                  setSelectedInvoice(inv);
                  setIsInvoiceDetailOpen(true);
                }}
                onOpenPurchaseDetail={(pur) => {
                  setSelectedPurchase(pur);
                  setIsPurchaseDetailOpen(true);
                }}
              />
            )}

            {currentRoute === 'parties' && (
              <Parties onNavigate={(route) => setCurrentRoute(route)} />
            )}

            {currentRoute === 'items' && (
              <Items onNavigate={(route) => setCurrentRoute(route)} />
            )}

            {currentRoute === 'sales' && (
              <Sales onNavigate={(route) => setCurrentRoute(route)} />
            )}

            {currentRoute === 'purchases' && (
              <Purchases onNavigate={(route) => setCurrentRoute(route)} />
            )}

            {currentRoute === 'cash-bank' && (
              <CashBank />
            )}

            {currentRoute === 'income-expenses' && (
              <IncomeExpenses />
            )}

            {currentRoute === 'reports' && (
              <Reports />
            )}

            {currentRoute === 'import-data' && (
              <ImportData />
            )}

            {currentRoute === 'settings' && (
              <Settings />
            )}

            {currentRoute === 'subscription' && (
              <Subscription />
            )}

            {currentRoute === 'help' && (
              <HelpSupport />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleSearchNavigate}
      />

      <CreateSaleInvoiceModal
        isOpen={quickSaleOpen}
        onClose={() => setQuickSaleOpen(false)}
        onSuccess={(id) => {
          // Can navigate or open invoice
        }}
      />

      <CreatePurchaseModal
        isOpen={quickPurchaseOpen}
        onClose={() => setQuickPurchaseOpen(false)}
      />

      <AddPartyModal
        isOpen={quickPartyOpen}
        onClose={() => setQuickPartyOpen(false)}
      />

      <AddItemModal
        isOpen={quickItemOpen}
        onClose={() => setQuickItemOpen(false)}
      />

      <ExpenseModal
        isOpen={quickExpenseOpen}
        onClose={() => setQuickExpenseOpen(false)}
      />

      <IncomeModal
        isOpen={quickIncomeOpen}
        onClose={() => setQuickIncomeOpen(false)}
      />

      <PaymentInModal
        isOpen={quickPayInOpen}
        onClose={() => setQuickPayInOpen(false)}
      />

      <PaymentOutModal
        isOpen={quickPayOutOpen}
        onClose={() => setQuickPayOutOpen(false)}
      />

      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={isInvoiceDetailOpen}
        onClose={() => setIsInvoiceDetailOpen(false)}
      />

      <PurchaseDetailModal
        purchase={selectedPurchase}
        isOpen={isPurchaseDetailOpen}
        onClose={() => setIsPurchaseDetailOpen(false)}
      />

      {/* Global Toast System */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
