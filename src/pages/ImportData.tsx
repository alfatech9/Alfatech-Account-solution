import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowRight,
  RefreshCw,
  Users,
  Package,
  ArrowDownCircle
} from 'lucide-react';

export const ImportData: React.FC = () => {
  const { importDataBatch, addToast } = useApp();

  const [importType, setImportType] = useState<'parties' | 'items' | 'expenses'>('parties');
  const [csvText, setCsvText] = useState('');
  const [validationResults, setValidationResults] = useState<{
    validRows: any[];
    errors: string[];
    parsed: boolean;
  } | null>(null);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // Sample CSV templates
  const sampleData: Record<string, { filename: string; content: string }> = {
    parties: {
      filename: 'sample_parties.csv',
      content: `name,type,phone,email,address,city,country,openingBalance,balanceType,taxNumber,notes
"Apex Tech Solutions","customer","+1 (555) 234-9900","contact@apextech.com","500 Broadway","New York","USA","1500","receivable","TAX-NY-102","Wholesale client"
"Silicon Wholesale Vendors","supplier","+1 (555) 902-1100","sales@siliconvendors.com","12 Harbor Way","San Francisco","USA","2200","payable","TAX-CA-993","Hardware distributor"`
    },
    items: {
      filename: 'sample_items.csv',
      content: `name,sku,category,unit,purchasePrice,sellingPrice,wholesalePrice,taxRate,openingStock,minimumStock,warehouse
"Apple MacBook Pro 14","LAP-MBP14-01","Computers & Hardware","unit","1599","1999","1850","10","8","3","Main Warehouse"
"Keychron K2 Mechanical Keyboard","KEY-K2-02","Peripherals","pcs","75","110","95","10","20","5","Bay 2 Shelf"`
    },
    expenses: {
      filename: 'sample_expenses.csv',
      content: `category,date,amount,description,reference
"Rent","2026-03-01","2500","Monthly commercial lease fee","LEASE-03"
"Electricity","2026-03-05","420","Utility power and air conditioning","UTIL-03"`
    }
  };

  const handleDownloadSample = () => {
    const sample = sampleData[importType];
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + sample.content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', sample.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'info', title: 'Sample CSV Downloaded', message: `Downloaded ${sample.filename}` });
  };

  const handleLoadSample = () => {
    setCsvText(sampleData[importType].content);
    setValidationResults(null);
    setImportSuccessCount(null);
  };

  // Parse & Validate CSV
  const handleValidate = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setValidationResults({
        validRows: [],
        errors: ['CSV must have a header row and at least one data row.'],
        parsed: true
      });
      return;
    }

    // Parse CSV line handling quoted values
    const parseLine = (text: string) => {
      const re_value = /(?!\s*$)\s*(?:"([^"]*(?:""[^"]*)*)"|([^,\"]*))\s*(?:,|$)/g;
      const result: string[] = [];
      let m;
      while ((m = re_value.exec(text)) !== null) {
        if (m[1] !== undefined) {
          result.push(m[1].replace(/""/g, '"'));
        } else if (m[2] !== undefined) {
          result.push(m[2]);
        }
      }
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.trim());
    const validRows: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = parseLine(line);
      const rowObj: any = {};
      headers.forEach((h, colIdx) => {
        rowObj[h] = values[colIdx] || '';
      });

      // Basic validation checks
      if (importType === 'parties' && !rowObj.name) {
        errors.push(`Row ${i}: Missing party "name"`);
      } else if (importType === 'items' && !rowObj.name) {
        errors.push(`Row ${i}: Missing item "name"`);
      } else if (importType === 'expenses' && (!rowObj.category || !rowObj.amount)) {
        errors.push(`Row ${i}: Expense requires "category" and "amount"`);
      } else {
        validRows.push(rowObj);
      }
    }

    setValidationResults({
      validRows,
      errors,
      parsed: true
    });
    setImportSuccessCount(null);
  };

  const handleCommitImport = () => {
    if (!validationResults || validationResults.validRows.length === 0) return;

    const res = importDataBatch(importType, validationResults.validRows);
    setImportSuccessCount(res.successCount);
    addToast({
      type: 'success',
      title: 'Import Successful',
      message: `Imported ${res.successCount} records into Alfatechlink live state.`
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h2 className="text-base font-bold text-slate-800">
          Data Import & Migration Center
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Migrate your legacy customer books, vendor accounts, inventory stock, and historical transactions directly via CSV.
        </p>
      </div>

      {/* Step 1: Select Type */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#16A085] text-white flex items-center justify-center text-xs font-bold">1</span>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Select Data Type to Import
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setImportType('parties');
              setValidationResults(null);
              setImportSuccessCount(null);
            }}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              importType === 'parties'
                ? 'border-[#16A085] bg-[#16A085]/5 ring-1 ring-[#16A085]'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Users className="w-5 h-5 text-[#16A085] mb-2" />
            <div className="text-xs font-bold text-slate-800">Parties (Customers & Vendors)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Contacts, addresses, opening balances</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setImportType('items');
              setValidationResults(null);
              setImportSuccessCount(null);
            }}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              importType === 'items'
                ? 'border-[#16A085] bg-[#16A085]/5 ring-1 ring-[#16A085]'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Package className="w-5 h-5 text-[#2F80ED] mb-2" />
            <div className="text-xs font-bold text-slate-800">Inventory Products & SKUs</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Product catalog, prices, opening stock</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setImportType('expenses');
              setValidationResults(null);
              setImportSuccessCount(null);
            }}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              importType === 'expenses'
                ? 'border-[#16A085] bg-[#16A085]/5 ring-1 ring-[#16A085]'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <ArrowDownCircle className="w-5 h-5 text-rose-600 mb-2" />
            <div className="text-xs font-bold text-slate-800">Operating Expenses</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Rent, utility payments, overhead costs</div>
          </button>
        </div>
      </div>

      {/* Step 2: Sample Format & CSV Editor */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#16A085] text-white flex items-center justify-center text-xs font-bold">2</span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Paste or Load CSV Data
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download Sample CSV</span>
            </button>

            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#16A085] bg-[#16A085]/10 hover:bg-[#16A085]/20 rounded-lg"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Fill Sample Data</span>
            </button>
          </div>
        </div>

        <div>
          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setValidationResults(null);
            }}
            placeholder="name,type,phone,email... (Paste comma-separated rows here)"
            className="w-full text-xs font-mono p-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-[#16A085] leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleValidate}
            disabled={!csvText.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] disabled:opacity-40 rounded-lg shadow-xs transition-colors"
          >
            <span>Validate Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step 3: Validation & Commit */}
      {validationResults && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#16A085] text-white flex items-center justify-center text-xs font-bold">3</span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Data Validation & Verification
            </h3>
          </div>

          {validationResults.errors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Validation Errors Encountered:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5">
                {validationResults.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-700">
              <span className="font-bold text-emerald-700 font-mono text-sm">{validationResults.validRows.length}</span> records ready to import into Alfatechlink.
            </div>

            <button
              onClick={handleCommitImport}
              disabled={validationResults.validRows.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#16A085] hover:bg-[#0E7C66] disabled:opacity-40 rounded-lg shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Import Records</span>
            </button>
          </div>

          {/* Success Banner */}
          {importSuccessCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Success!</strong> Successfully imported {importSuccessCount} {importType} into live state.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
