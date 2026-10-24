import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  Printer,
  Calendar,
  Users,
  Package,
  Receipt,
  ShoppingCart,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  BarChart3,
  Search
} from 'lucide-react';
import {
  exportReportToPDF,
  exportReportToExcel,
  exportReportToDocx,
  exportReportToCSV,
  printReportHtml,
  ReportExportOptions
} from '../utils/reportExporter';

export const Reports: React.FC = () => {
  const {
    currentBusiness,
    parties,
    items,
    salesInvoices,
    purchases,
    expenses,
    incomes,
    accounts,
    formatCurrency,
    addToast
  } = useApp();

  const [activeReportCategory, setActiveReportCategory] = useState<'financial' | 'sales' | 'purchases' | 'inventory' | 'parties'>('financial');
  const [selectedReport, setSelectedReport] = useState<string>('pnl');

  // Date filters
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Helpers
  const inRange = (d: string) => d >= startDate && d <= endDate;

  // Filtered sets
  const filteredSales = useMemo(() => salesInvoices.filter(s => inRange(s.date) && s.status !== 'cancelled'), [salesInvoices, startDate, endDate]);
  const filteredPurchases = useMemo(() => purchases.filter(p => inRange(p.date) && p.status !== 'cancelled'), [purchases, startDate, endDate]);
  const filteredExpenses = useMemo(() => expenses.filter(e => inRange(e.date)), [expenses, startDate, endDate]);
  const filteredIncomes = useMemo(() => incomes.filter(i => inRange(i.date)), [incomes, startDate, endDate]);

  // Profit & Loss calculations
  const totalRevenue = filteredSales.reduce((a, s) => a + s.total, 0);
  const totalCOGS = filteredPurchases.reduce((a, p) => a + p.total, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalOperatingExpenses = filteredExpenses.reduce((a, e) => a + e.amount, 0);
  const totalOtherIncome = filteredIncomes.reduce((a, i) => a + i.amount, 0);
  const netProfit = grossProfit + totalOtherIncome - totalOperatingExpenses;

  // Sales by Customer aggregation
  const salesByCustomer = useMemo(() => {
    const map = new Map<string, {
      customerId: string;
      customerName: string;
      customerPhone?: string;
      invoicesCount: number;
      totalInvoiced: number;
      totalPaid: number;
      balanceDue: number;
    }>();

    filteredSales.forEach(inv => {
      const key = inv.customerId || inv.customerName;
      const existing = map.get(key);
      if (existing) {
        existing.invoicesCount += 1;
        existing.totalInvoiced += inv.total;
        existing.totalPaid += inv.paidAmount;
        existing.balanceDue += inv.balance;
      } else {
        map.set(key, {
          customerId: inv.customerId,
          customerName: inv.customerName,
          customerPhone: inv.customerPhone,
          invoicesCount: 1,
          totalInvoiced: inv.total,
          totalPaid: inv.paidAmount,
          balanceDue: inv.balance
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalInvoiced - a.totalInvoiced);
  }, [filteredSales]);

  // Receivables & Payables Ledger
  const receivablesTotal = useMemo(() => parties.reduce((a, p) => a + (p.currentReceivable || 0), 0), [parties]);
  const payablesTotal = useMemo(() => parties.reduce((a, p) => a + (p.currentPayable || 0), 0), [parties]);

  // Inventory valuation
  const inventoryAssetTotal = useMemo(() => items.reduce((a, b) => a + ((b.currentStock || 0) * (b.purchasePrice || 0)), 0), [items]);
  const inventoryStockCount = useMemo(() => items.reduce((a, b) => a + (b.currentStock || 0), 0), [items]);

  // Current Report Export Options Generator
  const getCurrentReportOptions = (): ReportExportOptions => {
    const base = {
      businessName: currentBusiness.name || 'Alfatechlink Business',
      businessAddress: [currentBusiness.address, currentBusiness.city, currentBusiness.country].filter(Boolean).join(', '),
      businessTaxId: currentBusiness.taxNumber,
      startDate,
      endDate
    };

    switch (selectedReport) {
      case 'pnl': {
        const rows: (string | number)[][] = [
          ['Total Sales Revenue', formatCurrency(totalRevenue)],
          ['Cost of Goods Sold (Procurement)', formatCurrency(totalCOGS)],
          ['Gross Profit (Revenue - COGS)', formatCurrency(grossProfit)]
        ];
        filteredExpenses.forEach(e => {
          rows.push([`Operating Expense: ${e.category} (${e.description})`, `-${formatCurrency(e.amount)}`]);
        });
        rows.push(['Total Operating Overheads', `-${formatCurrency(totalOperatingExpenses)}`]);
        filteredIncomes.forEach(i => {
          rows.push([`Ancillary Income: ${i.category}`, `+${formatCurrency(i.amount)}`]);
        });
        rows.push(['Total Other Income', `+${formatCurrency(totalOtherIncome)}`]);
        rows.push(['Net Profit', formatCurrency(netProfit)]);

        return {
          ...base,
          reportTitle: 'Profit & Loss Statement',
          filenamePrefix: 'pnl_statement',
          headers: ['Financial Ledger Item', 'Amount'],
          rows,
          columnAlignments: ['left', 'right'],
          summaryRows: [
            { label: 'Gross Profit', value: formatCurrency(grossProfit) },
            { label: 'Total Operating Expenses', value: formatCurrency(totalOperatingExpenses) },
            { label: 'Net Profit', value: formatCurrency(netProfit) }
          ]
        };
      }

      case 'cashflow': {
        const rows: (string | number)[][] = [
          ['Operating Inflows (Customer Receipts)', formatCurrency(totalRevenue), '—', `+${formatCurrency(totalRevenue)}`],
          ['Operating Outflows (Supplier Disbursements)', '—', `-${formatCurrency(totalCOGS)}`, `-${formatCurrency(totalCOGS)}`],
          ['Administrative Overheads (Expenses)', '—', `-${formatCurrency(totalOperatingExpenses)}`, `-${formatCurrency(totalOperatingExpenses)}`],
          ['Ancillary Receipts (Other Incomes)', `+${formatCurrency(totalOtherIncome)}`, '—', `+${formatCurrency(totalOtherIncome)}`],
          ['Net Cash Liquidity for Period', formatCurrency(totalRevenue + totalOtherIncome), `-${formatCurrency(totalCOGS + totalOperatingExpenses)}`, formatCurrency(netProfit)]
        ];

        return {
          ...base,
          reportTitle: 'Cash Flow Statement',
          filenamePrefix: 'cashflow_statement',
          headers: ['Cash Activity Flow', 'Inflow', 'Outflow', 'Net Flow'],
          rows,
          columnAlignments: ['left', 'right', 'right', 'right'],
          summaryRows: [
            { label: 'Total Inflow', value: formatCurrency(totalRevenue + totalOtherIncome) },
            { label: 'Total Outflow', value: formatCurrency(totalCOGS + totalOperatingExpenses) },
            { label: 'Net Cash Flow', value: formatCurrency(netProfit) }
          ]
        };
      }

      case 'receivables-payables': {
        const rows = parties.map(p => [
          p.name,
          p.type.toUpperCase(),
          p.phone || '—',
          formatCurrency(p.currentReceivable || 0),
          formatCurrency(p.currentPayable || 0),
          formatCurrency((p.currentReceivable || 0) - (p.currentPayable || 0))
        ]);

        return {
          ...base,
          reportTitle: 'Receivables & Payables Ledger',
          filenamePrefix: 'receivables_payables',
          headers: ['Party Name', 'Type', 'Phone', 'Receivable (Owed)', 'Payable (Due)', 'Net Position'],
          rows: rows.length > 0 ? rows : [['No parties found', '—', '—', formatCurrency(0), formatCurrency(0), formatCurrency(0)]],
          columnAlignments: ['left', 'center', 'left', 'right', 'right', 'right'],
          summaryRows: [
            { label: 'Total Receivables (Owed to You)', value: formatCurrency(receivablesTotal) },
            { label: 'Total Payables (Due to Suppliers)', value: formatCurrency(payablesTotal) },
            { label: 'Net Balance', value: formatCurrency(receivablesTotal - payablesTotal) }
          ]
        };
      }

      case 'sales-summary': {
        const rows = filteredSales.map(inv => [
          inv.invoiceNumber,
          inv.date,
          inv.customerName,
          formatCurrency(inv.subtotal),
          formatCurrency(inv.taxTotal),
          formatCurrency(inv.total),
          formatCurrency(inv.paidAmount),
          formatCurrency(inv.balance),
          inv.status.toUpperCase()
        ]);

        const totalInvoiced = filteredSales.reduce((a, s) => a + s.total, 0);
        const totalPaid = filteredSales.reduce((a, s) => a + s.paidAmount, 0);
        const totalDue = filteredSales.reduce((a, s) => a + s.balance, 0);

        return {
          ...base,
          reportTitle: 'Sales Performance Report',
          filenamePrefix: 'sales_summary',
          headers: ['Invoice #', 'Date', 'Customer', 'Subtotal', 'Tax', 'Total', 'Paid', 'Balance Due', 'Status'],
          rows: rows.length > 0 ? rows : [['No sales recorded for this period', '—', '—', '—', '—', formatCurrency(0), formatCurrency(0), formatCurrency(0), '—']],
          columnAlignments: ['left', 'center', 'left', 'right', 'right', 'right', 'right', 'right', 'center'],
          summaryRows: [
            { label: 'Total Sales Invoiced', value: formatCurrency(totalInvoiced) },
            { label: 'Total Received / Paid', value: formatCurrency(totalPaid) },
            { label: 'Total Receivables Balance', value: formatCurrency(totalDue) }
          ]
        };
      }

      case 'sales-customer': {
        const rows = salesByCustomer.map(c => [
          c.customerName,
          c.invoicesCount,
          formatCurrency(c.totalInvoiced),
          formatCurrency(c.totalPaid),
          formatCurrency(c.balanceDue)
        ]);

        const totalInvoiced = salesByCustomer.reduce((a, c) => a + c.totalInvoiced, 0);
        const totalDue = salesByCustomer.reduce((a, c) => a + c.balanceDue, 0);

        return {
          ...base,
          reportTitle: 'Sales by Customer Report',
          filenamePrefix: 'sales_by_customer',
          headers: ['Customer Name', 'Invoices Count', 'Total Invoiced', 'Total Paid', 'Balance Due'],
          rows: rows.length > 0 ? rows : [['No customer sales recorded', 0, formatCurrency(0), formatCurrency(0), formatCurrency(0)]],
          columnAlignments: ['left', 'center', 'right', 'right', 'right'],
          summaryRows: [
            { label: 'Total Unique Customers', value: salesByCustomer.length },
            { label: 'Total Sales Volume', value: formatCurrency(totalInvoiced) },
            { label: 'Total Outstanding Balance', value: formatCurrency(totalDue) }
          ]
        };
      }

      case 'purchase-summary': {
        const rows = filteredPurchases.map(pur => [
          pur.purchaseNumber,
          pur.date,
          pur.supplierName,
          formatCurrency(pur.subtotal),
          formatCurrency(pur.taxTotal),
          formatCurrency(pur.total),
          formatCurrency(pur.paidAmount),
          formatCurrency(pur.balance),
          pur.status.toUpperCase()
        ]);

        const totalPurchased = filteredPurchases.reduce((a, p) => a + p.total, 0);
        const totalPaid = filteredPurchases.reduce((a, p) => a + p.paidAmount, 0);
        const totalDue = filteredPurchases.reduce((a, p) => a + p.balance, 0);

        return {
          ...base,
          reportTitle: 'Purchase Bills Summary Report',
          filenamePrefix: 'purchases_summary',
          headers: ['Bill #', 'Date', 'Supplier', 'Subtotal', 'Tax', 'Total', 'Paid', 'Balance Due', 'Status'],
          rows: rows.length > 0 ? rows : [['No purchases recorded for this period', '—', '—', '—', '—', formatCurrency(0), formatCurrency(0), formatCurrency(0), '—']],
          columnAlignments: ['left', 'center', 'left', 'right', 'right', 'right', 'right', 'right', 'center'],
          summaryRows: [
            { label: 'Total Purchases Procured', value: formatCurrency(totalPurchased) },
            { label: 'Total Disbursed / Paid', value: formatCurrency(totalPaid) },
            { label: 'Total Accounts Payable Due', value: formatCurrency(totalDue) }
          ]
        };
      }

      case 'stock-valuation': {
        const rows = items.map(it => [
          it.name,
          it.sku,
          it.category,
          `${it.currentStock} ${it.unit}`,
          formatCurrency(it.purchasePrice),
          formatCurrency(it.sellingPrice),
          formatCurrency(it.currentStock * it.purchasePrice)
        ]);

        return {
          ...base,
          reportTitle: 'Stock Valuation & Inventory Summary',
          filenamePrefix: 'stock_valuation',
          headers: ['Item Name', 'SKU', 'Category', 'Stock Qty', 'Cost Price', 'Selling Price', 'Inventory Valuation'],
          rows: rows.length > 0 ? rows : [['No inventory products recorded', '—', '—', '0 pcs', formatCurrency(0), formatCurrency(0), formatCurrency(0)]],
          columnAlignments: ['left', 'left', 'left', 'center', 'right', 'right', 'right'],
          summaryRows: [
            { label: 'Total Product SKUs', value: items.length },
            { label: 'Total Physical Items Count', value: inventoryStockCount },
            { label: 'Total Warehouse Asset Valuation', value: formatCurrency(inventoryAssetTotal) }
          ]
        };
      }

      case 'party-balances':
      default: {
        const rows = parties.map(p => [
          p.name,
          p.type.toUpperCase(),
          p.phone || '—',
          p.city || '—',
          formatCurrency(p.currentReceivable || 0),
          formatCurrency(p.currentPayable || 0),
          formatCurrency(p.openingBalance || 0),
          p.status.toUpperCase()
        ]);

        return {
          ...base,
          reportTitle: 'Customer & Supplier Balances Report',
          filenamePrefix: 'party_balances',
          headers: ['Party Name', 'Type', 'Phone', 'City', 'Receivable', 'Payable', 'Opening Bal', 'Status'],
          rows: rows.length > 0 ? rows : [['No parties found', '—', '—', '—', formatCurrency(0), formatCurrency(0), formatCurrency(0), '—']],
          columnAlignments: ['left', 'center', 'left', 'left', 'right', 'right', 'right', 'center'],
          summaryRows: [
            { label: 'Total Active Parties', value: parties.length },
            { label: 'Total Receivables (Owed to Us)', value: formatCurrency(receivablesTotal) },
            { label: 'Total Payables (Due to Suppliers)', value: formatCurrency(payablesTotal) }
          ]
        };
      }
    }
  };

  // Actions
  const handleDownloadPDF = () => {
    try {
      setIsExporting('pdf');
      const opts = getCurrentReportOptions();
      exportReportToPDF(opts);
      addToast({ type: 'success', title: 'PDF Export Ready', message: `Downloaded ${opts.reportTitle} as PDF document.` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'PDF Export Failed', message: 'Could not generate PDF report.' });
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadExcel = () => {
    try {
      setIsExporting('excel');
      const opts = getCurrentReportOptions();
      exportReportToExcel(opts);
      addToast({ type: 'success', title: 'Excel Export Ready', message: `Downloaded ${opts.reportTitle} as Microsoft Excel (.xlsx) sheet.` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Excel Export Failed', message: 'Could not generate Excel spreadsheet.' });
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExporting('docx');
      const opts = getCurrentReportOptions();
      await exportReportToDocx(opts);
      addToast({ type: 'success', title: 'Word Export Ready', message: `Downloaded ${opts.reportTitle} as Microsoft Word (.docx) document.` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Word Export Failed', message: 'Could not generate Word document.' });
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadCSV = () => {
    try {
      setIsExporting('csv');
      const opts = getCurrentReportOptions();
      exportReportToCSV(opts);
      addToast({ type: 'success', title: 'CSV Export Ready', message: `Exported ${opts.reportTitle} to CSV.` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'CSV Export Failed', message: 'Could not export CSV file.' });
    } finally {
      setIsExporting(null);
    }
  };

  const handlePrint = () => {
    try {
      setIsExporting('print');
      const opts = getCurrentReportOptions();
      printReportHtml(opts);
      addToast({ type: 'info', title: 'Print Dialog Initialized', message: `Printing ${opts.reportTitle} with complete formatted styling.` });
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setIsExporting(null);
    }
  };

  const reportTitleName = useMemo(() => {
    switch (selectedReport) {
      case 'pnl': return 'Profit & Loss Statement';
      case 'cashflow': return 'Cash Flow Statement';
      case 'receivables-payables': return 'Receivables & Payables Ledger';
      case 'sales-summary': return 'Sales Performance Report';
      case 'sales-customer': return 'Sales by Customer';
      case 'purchase-summary': return 'Purchase Bills Summary';
      case 'stock-valuation': return 'Inventory Valuation Report';
      case 'party-balances': return 'Customer & Supplier Balances';
      default: return 'Business Report';
    }
  }, [selectedReport]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Universal Action Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs no-print space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#16A085]/10 text-[#16A085] rounded-lg">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-800">
                Reporting & Financial Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Download any report as PDF, Excel (.xlsx), Word (.docx), or print directly with standard accounting formats.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date range picker */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs p-1 bg-white border border-slate-200 rounded font-mono"
                title="Start Date"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs p-1 bg-white border border-slate-200 rounded font-mono"
                title="End Date"
              />
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={!!isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Print formatted document"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Global Export Download Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span>Download Selected Report:</span>
            <span className="text-[#16A085] font-bold">[{reportTitleName}]</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* PDF Download */}
            <button
              onClick={handleDownloadPDF}
              disabled={!!isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Download as PDF"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>Download PDF</span>
            </button>

            {/* Excel Download */}
            <button
              onClick={handleDownloadExcel}
              disabled={!!isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Download as Microsoft Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Excel (.xlsx)</span>
            </button>

            {/* Word / Docx Download */}
            <button
              onClick={handleDownloadDocx}
              disabled={!!isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Download as Microsoft Word"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Download Word (.docx)</span>
            </button>

            {/* CSV Download */}
            <button
              onClick={handleDownloadCSV}
              disabled={!!isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg overflow-x-auto no-print">
        {[
          { id: 'financial', label: 'Financial & P&L', icon: DollarSign },
          { id: 'sales', label: 'Sales Reports', icon: Receipt },
          { id: 'purchases', label: 'Purchase Reports', icon: ShoppingCart },
          { id: 'inventory', label: 'Inventory Reports', icon: Package },
          { id: 'parties', label: 'Party Statements', icon: Users }
        ].map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveReportCategory(cat.id as any);
                if (cat.id === 'financial') setSelectedReport('pnl');
                else if (cat.id === 'sales') setSelectedReport('sales-summary');
                else if (cat.id === 'purchases') setSelectedReport('purchase-summary');
                else if (cat.id === 'inventory') setSelectedReport('stock-valuation');
                else if (cat.id === 'parties') setSelectedReport('party-balances');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeReportCategory === cat.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-slate-500" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Report Selector Buttons */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        {activeReportCategory === 'financial' && (
          <>
            <button
              onClick={() => setSelectedReport('pnl')}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                selectedReport === 'pnl' ? 'bg-[#16A085] text-white border-[#16A085]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Profit & Loss Statement
            </button>
            <button
              onClick={() => setSelectedReport('cashflow')}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                selectedReport === 'cashflow' ? 'bg-[#16A085] text-white border-[#16A085]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Cash Flow Statement
            </button>
            <button
              onClick={() => setSelectedReport('receivables-payables')}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                selectedReport === 'receivables-payables' ? 'bg-[#16A085] text-white border-[#16A085]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Receivables & Payables Ledger
            </button>
          </>
        )}

        {activeReportCategory === 'sales' && (
          <>
            <button
              onClick={() => setSelectedReport('sales-summary')}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                selectedReport === 'sales-summary' ? 'bg-[#16A085] text-white border-[#16A085]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Sales Summary
            </button>
            <button
              onClick={() => setSelectedReport('sales-customer')}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                selectedReport === 'sales-customer' ? 'bg-[#16A085] text-white border-[#16A085]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Sales by Customer
            </button>
          </>
        )}

        {activeReportCategory === 'purchases' && (
          <>
            <button
              onClick={() => setSelectedReport('purchase-summary')}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                selectedReport === 'purchase-summary' ? 'bg-[#16A085] text-white border-[#16A085]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Purchase Bills Summary
            </button>
          </>
        )}

        {activeReportCategory === 'inventory' && (
          <>
            <button
              onClick={() => setSelectedReport('stock-valuation')}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                selectedReport === 'stock-valuation' ? 'bg-[#16A085] text-white border-[#16A085]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Stock Valuation & Summary
            </button>
          </>
        )}

        {activeReportCategory === 'parties' && (
          <>
            <button
              onClick={() => setSelectedReport('party-balances')}
              className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                selectedReport === 'party-balances' ? 'bg-[#16A085] text-white border-[#16A085]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Customer & Supplier Balances
            </button>
          </>
        )}
      </div>

      {/* REPORT CONTENT VIEW */}
      <div id="printable-report-area" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 printable-area">
        {/* Report Printable Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{currentBusiness.name || 'Alfatechlink Business'}</h1>
            {currentBusiness.address && (
              <p className="text-xs text-slate-500 mt-0.5">{currentBusiness.address}, {currentBusiness.city}</p>
            )}
            <p className="text-xs text-slate-500">
              Tax ID: {currentBusiness.taxNumber || '—'} · Currency: Rs ({currentBusiness.currency || 'PKR/INR'})
            </p>
          </div>

          <div className="text-left sm:text-right mt-3 sm:mt-0">
            <span className="text-lg font-black text-[#16A085] uppercase tracking-wider block">
              {reportTitleName}
            </span>
            <span className="text-xs text-slate-500 font-mono mt-1 block">
              Period: {startDate} to {endDate}
            </span>
          </div>
        </div>

        {/* 1. PROFIT & LOSS VIEW */}
        {selectedReport === 'pnl' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 no-print">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Revenue (Sales)</span>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{formatCurrency(totalRevenue)}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">COGS (Purchases)</span>
                <div className="text-base font-bold font-mono text-slate-700 mt-0.5">{formatCurrency(totalCOGS)}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Gross Profit</span>
                <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">{formatCurrency(grossProfit)}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Net Profit</span>
                <div className="text-base font-bold font-mono text-[#16A085] mt-0.5">{formatCurrency(netProfit)}</div>
              </div>
            </div>

            {/* Structured Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Financial Ledger Item</th>
                    <th className="py-2.5 px-4 text-right">Current Period Amount</th>
                    <th className="py-2.5 px-4 text-right">Benchmark</th>
                    <th className="py-2.5 px-4 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Revenue */}
                  <tr className="bg-slate-50/50 font-bold text-slate-900">
                    <td className="py-2 px-4" colSpan={4}>Operating Revenue</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-6 text-slate-700">Total Sales Invoiced</td>
                    <td className="py-2 px-4 text-right font-mono font-medium">{formatCurrency(totalRevenue)}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">—</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">—</td>
                  </tr>

                  {/* COGS */}
                  <tr className="bg-slate-50/50 font-bold text-slate-900">
                    <td className="py-2 px-4" colSpan={4}>Cost of Goods Sold (Procurement)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-6 text-slate-700">Inventory Purchases & Stock Inward</td>
                    <td className="py-2 px-4 text-right font-mono font-medium">{formatCurrency(totalCOGS)}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">—</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">—</td>
                  </tr>

                  {/* Gross Profit Subtotal */}
                  <tr className="bg-emerald-50/60 font-bold text-emerald-900">
                    <td className="py-2.5 px-4">GROSS PROFIT (Revenue − COGS)</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800">{formatCurrency(grossProfit)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">—</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">—</td>
                  </tr>

                  {/* Operating Expenses */}
                  <tr className="bg-slate-50/50 font-bold text-slate-900">
                    <td className="py-2 px-4" colSpan={4}>Operating Expenses (Overheads)</td>
                  </tr>
                  {filteredExpenses.map(e => (
                    <tr key={e.id}>
                      <td className="py-1.5 px-6 text-slate-600">{e.category} - {e.description}</td>
                      <td className="py-1.5 px-4 text-right font-mono text-rose-700">-{formatCurrency(e.amount)}</td>
                      <td className="py-1.5 px-4 text-right font-mono text-slate-400">—</td>
                      <td className="py-1.5 px-4 text-right font-mono text-slate-400">—</td>
                    </tr>
                  ))}
                  <tr className="font-semibold text-rose-900 bg-rose-50/40">
                    <td className="py-2 px-4">Total Operating Expenses</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-rose-700">-{formatCurrency(totalOperatingExpenses)}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">—</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">—</td>
                  </tr>

                  {/* Other Income */}
                  {filteredIncomes.length > 0 && (
                    <>
                      <tr className="bg-slate-50/50 font-bold text-slate-900">
                        <td className="py-2 px-4" colSpan={4}>Ancillary Income</td>
                      </tr>
                      {filteredIncomes.map(i => (
                        <tr key={i.id}>
                          <td className="py-1.5 px-6 text-slate-600">{i.category}</td>
                          <td className="py-1.5 px-4 text-right font-mono text-emerald-700">+{formatCurrency(i.amount)}</td>
                          <td className="py-1.5 px-4 text-right font-mono text-slate-400">—</td>
                          <td className="py-1.5 px-4 text-right font-mono text-slate-400">—</td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* NET PROFIT GRAND TOTAL */}
                  <tr className="bg-slate-900 text-white font-extrabold text-sm">
                    <td className="py-3 px-4">NET PROFIT (Gross Profit − Expenses + Ancillary)</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">{formatCurrency(netProfit)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. CASH FLOW STATEMENT VIEW */}
        {selectedReport === 'cashflow' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Cash Activity Flow</th>
                  <th className="py-2.5 px-4 text-right">Inflow</th>
                  <th className="py-2.5 px-4 text-right">Outflow</th>
                  <th className="py-2.5 px-4 text-right">Net Liquidity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">Operating Inflows (Customer Receipts)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-700">{formatCurrency(totalRevenue)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">—</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-700">+{formatCurrency(totalRevenue)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">Operating Outflows (Supplier Disbursements)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">—</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-700">-{formatCurrency(totalCOGS)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-700">-{formatCurrency(totalCOGS)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">Administrative & Facility Overhead Outflows</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">—</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-700">-{formatCurrency(totalOperatingExpenses)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-700">-{formatCurrency(totalOperatingExpenses)}</td>
                </tr>
                {totalOtherIncome > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">Ancillary Operating Inflows (Other Incomes)</td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-700">+{formatCurrency(totalOtherIncome)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">—</td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-700">+{formatCurrency(totalOtherIncome)}</td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td className="py-3 px-4">NET CASH FLOW FOR PERIOD</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700">{formatCurrency(totalRevenue + totalOtherIncome)}</td>
                  <td className="py-3 px-4 text-right font-mono text-rose-700">-{formatCurrency(totalCOGS + totalOperatingExpenses)}</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#16A085]">{formatCurrency(netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 3. RECEIVABLES & PAYABLES SUMMARY VIEW */}
        {selectedReport === 'receivables-payables' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Receivables List */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800 uppercase text-[11px]">Customers Owed (Receivables)</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatCurrency(receivablesTotal)}
                  </span>
                </div>
                <div className="space-y-2">
                  {parties.filter(p => (p.currentReceivable || 0) > 0).length === 0 ? (
                    <p className="text-slate-400 py-3 text-center">No outstanding customer receivables.</p>
                  ) : (
                    parties.filter(p => (p.currentReceivable || 0) > 0).map(p => (
                      <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-100">
                        <div>
                          <span className="font-semibold text-slate-800 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.phone || p.city || '—'}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700">{formatCurrency(p.currentReceivable)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Payables List */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800 uppercase text-[11px]">Suppliers Due (Payables)</span>
                  <span className="font-mono font-bold text-rose-700">
                    {formatCurrency(payablesTotal)}
                  </span>
                </div>
                <div className="space-y-2">
                  {parties.filter(p => (p.currentPayable || 0) > 0).length === 0 ? (
                    <p className="text-slate-400 py-3 text-center">No outstanding supplier payables.</p>
                  ) : (
                    parties.filter(p => (p.currentPayable || 0) > 0).map(p => (
                      <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-100">
                        <div>
                          <span className="font-semibold text-slate-800 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.phone || p.city || '—'}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-700">{formatCurrency(p.currentPayable)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. STOCK VALUATION REPORT */}
        {selectedReport === 'stock-valuation' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">In Stock</th>
                  <th className="py-2.5 px-3 text-right">Cost Price</th>
                  <th className="py-2.5 px-3 text-right">Selling Price</th>
                  <th className="py-2.5 px-3 text-right">Inventory Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No inventory products currently registered.
                    </td>
                  </tr>
                ) : (
                  items.map(it => (
                    <tr key={it.id}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{it.name}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{it.sku}</td>
                      <td className="py-2 px-3 text-slate-600">{it.category}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{it.currentStock} {it.unit}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.purchasePrice)}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.sellingPrice)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#16A085]">
                        {formatCurrency(it.currentStock * it.purchasePrice)}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td colSpan={6} className="py-3 px-3 text-right uppercase">Total Warehouse Asset Value:</td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-[#16A085] text-sm">
                    {formatCurrency(inventoryAssetTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 5. SALES SUMMARY REPORT */}
        {selectedReport === 'sales-summary' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No sales invoices recorded for this period ({startDate} to {endDate}).
                    </td>
                  </tr>
                ) : (
                  filteredSales.map(inv => (
                    <tr key={inv.id}>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{inv.date}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{inv.customerName}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(inv.subtotal)}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(inv.taxTotal)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(inv.total)}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">{formatCurrency(inv.paidAmount)}</td>
                      <td className="py-2 px-3 text-right font-mono text-amber-700 font-semibold">{formatCurrency(inv.balance)}</td>
                      <td className="py-2 px-3 text-center font-mono text-[10px] uppercase font-bold text-slate-600">
                        {inv.status}
                      </td>
                    </tr>
                  ))
                )}
                {filteredSales.length > 0 && (
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td colSpan={5} className="py-3 px-3 text-right uppercase">Period Totals:</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">{formatCurrency(totalRevenue)}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">{formatCurrency(filteredSales.reduce((a, s) => a + s.paidAmount, 0))}</td>
                    <td className="py-3 px-3 text-right font-mono text-amber-700">{formatCurrency(filteredSales.reduce((a, s) => a + s.balance, 0))}</td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. SALES BY CUSTOMER REPORT */}
        {selectedReport === 'sales-customer' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3 text-center">Invoices Count</th>
                  <th className="py-2.5 px-3 text-right">Total Invoiced</th>
                  <th className="py-2.5 px-3 text-right">Total Paid</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesByCustomer.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No customer sales recorded for this period ({startDate} to {endDate}).
                    </td>
                  </tr>
                ) : (
                  salesByCustomer.map((c, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{c.customerName}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">{c.invoicesCount}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(c.totalInvoiced)}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">{formatCurrency(c.totalPaid)}</td>
                      <td className="py-2 px-3 text-right font-mono text-amber-700 font-semibold">{formatCurrency(c.balanceDue)}</td>
                    </tr>
                  ))
                )}
                {salesByCustomer.length > 0 && (
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="py-3 px-3 uppercase">Total ({salesByCustomer.length} Customers):</td>
                    <td className="py-3 px-3 text-center font-mono">{salesByCustomer.reduce((a, c) => a + c.invoicesCount, 0)}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">{formatCurrency(salesByCustomer.reduce((a, c) => a + c.totalInvoiced, 0))}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">{formatCurrency(salesByCustomer.reduce((a, c) => a + c.totalPaid, 0))}</td>
                    <td className="py-3 px-3 text-right font-mono text-amber-700">{formatCurrency(salesByCustomer.reduce((a, c) => a + c.balanceDue, 0))}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. PURCHASE BILLS SUMMARY REPORT */}
        {selectedReport === 'purchase-summary' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Bill #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No purchase bills recorded for this period ({startDate} to {endDate}).
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map(pur => (
                    <tr key={pur.id}>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{pur.purchaseNumber}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{pur.date}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{pur.supplierName}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(pur.subtotal)}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(pur.taxTotal)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(pur.total)}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">{formatCurrency(pur.paidAmount)}</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-700 font-semibold">{formatCurrency(pur.balance)}</td>
                      <td className="py-2 px-3 text-center font-mono text-[10px] uppercase font-bold text-slate-600">
                        {pur.status}
                      </td>
                    </tr>
                  ))
                )}
                {filteredPurchases.length > 0 && (
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td colSpan={5} className="py-3 px-3 text-right uppercase">Period Purchases Total:</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">{formatCurrency(totalCOGS)}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">{formatCurrency(filteredPurchases.reduce((a, p) => a + p.paidAmount, 0))}</td>
                    <td className="py-3 px-3 text-right font-mono text-rose-700">{formatCurrency(filteredPurchases.reduce((a, p) => a + p.balance, 0))}</td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 8. PARTY BALANCES REPORT */}
        {selectedReport === 'party-balances' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Party Name</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3 text-right">Receivable (Rs)</th>
                  <th className="py-2.5 px-3 text-right">Payable (Rs)</th>
                  <th className="py-2.5 px-3 text-right">Opening Bal</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parties.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No parties registered yet.
                    </td>
                  </tr>
                ) : (
                  parties.map(p => (
                    <tr key={p.id}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-2 px-3 text-center font-mono text-[10px] uppercase font-bold text-slate-600">{p.type}</td>
                      <td className="py-2 px-3 text-slate-500 font-mono">{p.phone || '—'}</td>
                      <td className="py-2 px-3 text-slate-600">{p.city || '—'}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">{formatCurrency(p.currentReceivable || 0)}</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-700 font-bold">{formatCurrency(p.currentPayable || 0)}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500">{formatCurrency(p.openingBalance || 0)}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                {parties.length > 0 && (
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td colSpan={4} className="py-3 px-3 uppercase text-right">Total Aggregate Balances:</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">{formatCurrency(receivablesTotal)}</td>
                    <td className="py-3 px-3 text-right font-mono text-rose-700">{formatCurrency(payablesTotal)}</td>
                    <td colSpan={2}></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
