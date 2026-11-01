import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldCheck,
  AlertTriangle,
  ReceiptText,
  Sparkles,
  Info,
} from 'lucide-react';
import { Trip } from '../types/vehicle';
import {
  calculateAnnualTaxSummary,
  generateIrsMileageCsv,
  generateTaxHubExportJson,
  getStandardMileageRate,
  validateIrc274Compliance,
} from '../engine/irsCalculator';

interface TaxExportViewProps {
  trips: Trip[];
}

export const TaxExportView: React.FC<TaxExportViewProps> = ({ trips }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [copyStatus, setCopyStatus] = useState<string>('');

  const summary = calculateAnnualTaxSummary(trips, selectedYear);
  const compliance = validateIrc274Compliance(summary.trips);

  const handleDownloadCsv = () => {
    const csvContent = generateIrsMileageCsv(summary);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `irs-mileage-log-${selectedYear}-honda-accord.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const jsonContent = generateTaxHubExportJson(summary);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vehicle-hub-tax-export-${selectedYear}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyJson = async () => {
    const jsonContent = generateTaxHubExportJson(summary);
    try {
      await navigator.clipboard.writeText(jsonContent);
      setCopyStatus('Copied JSON payload to clipboard!');
      setTimeout(() => setCopyStatus(''), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      {/* Header and Year Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" /> IRS Form 1040 Schedule C & IRC § 274
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 mt-1">
            Annual Mileage Summary & Tax Export
          </h2>
          <p className="text-xs text-slate-400">
            Audit-ready vehicle expense reports, standard mileage calculations, and Tax-Hub JSON export.
          </p>
        </div>

        {/* Tax Year Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Tax Year:</span>
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            {[2026, 2025, 2024].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">
          IRS Form 1040 Schedule C — Contemporaneous Vehicle Mileage Log
        </h1>
        <div className="text-sm text-slate-600 mt-1 flex gap-4">
          <span>Tax Year: {selectedYear}</span>
          <span>Vehicle: 2019 Honda Accord (FWD)</span>
          <span>Generated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tax Deduction Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Vehicle Deduction */}
        <div className="col-span-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
              Total Tax Deduction (Sched C Line 9)
            </span>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              Tax Year {selectedYear}
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-300 mt-2">
            ${summary.totalVehicleDeductionUsd.toFixed(2)}
          </div>

          <div className="text-xs text-slate-400 mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Standard Mileage:{' '}
              <strong className="text-slate-200 font-mono">
                ${summary.mileageDeductionUsd.toFixed(2)}
              </strong>{' '}
              ({summary.businessMiles.toLocaleString()} mi × ${summary.standardRatePerMile}/mi)
            </span>
            <span>
              Tolls & Parking:{' '}
              <strong className="text-slate-200 font-mono">
                ${summary.tollsAndParkingUsd.toFixed(2)}
              </strong>
            </span>
          </div>
        </div>

        {/* Business Use % */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            Business Use Ratio
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-400 mt-1">
            {summary.businessPercentage}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {summary.businessMiles.toLocaleString()} of {summary.totalMiles.toLocaleString()} mi
          </div>
        </div>

        {/* Audit Compliance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            IRC § 274 Compliance
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-2xl font-extrabold font-mono text-emerald-400">
              {compliance.complianceRate}%
            </div>
            {compliance.nonCompliantCount === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {compliance.compliantCount} of {summary.trips.length} trips compliant
          </div>
        </div>
      </div>

      {/* Mileage Breakdown Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">
            {selectedYear} Vehicle Mileage Breakdown
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            IRS Standard Rate: ${summary.standardRatePerMile}/mi
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-800 text-center p-4">
          <div>
            <div className="text-xs font-semibold text-blue-400">Business</div>
            <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
              {summary.businessMiles.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">
              {summary.businessPercentage}% of total
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-amber-400">Commuting</div>
            <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
              {summary.commuteMiles.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">Non-deductible</div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400">Personal</div>
            <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
              {summary.personalMiles.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">Non-deductible</div>
          </div>
        </div>
      </div>

      {/* Export Action Buttons (hidden in print) */}
      <div className="space-y-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-100 border border-slate-700 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Download IRS CSV Log
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-100 border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Download Tax-Hub JSON
          </button>

          <button
            onClick={handleCopyJson}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-100 border border-slate-700 transition-colors shadow-sm"
          >
            <Copy className="w-4 h-4 text-sky-400" />
            Copy JSON Payload
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-100 border border-slate-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-purple-400" />
            Print / Save PDF
          </button>
        </div>

        {copyStatus && (
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {copyStatus}
          </div>
        )}
      </div>

      {/* Cross-App Integration Explainer */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-950/10 p-4 text-xs text-slate-300 space-y-2 print:hidden">
        <div className="font-semibold text-blue-300 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-400" />
          Integration with ~/tax-hub & ~/budget (Schedule C Aggregator)
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          As specified in <code className="text-blue-300">04-cross-app-integration.md</code>, <code className="text-blue-300">~/tax-hub</code> ingests this annual export to contrast <strong>Option 1 (Standard Mileage)</strong> against <strong>Option 2 (Actual Vehicle Expenses)</strong> by combining business miles from <code className="text-blue-300">vehicle-hub</code> with gas, repairs, insurance, and maintenance records tagged in <code className="text-blue-300">~/budget</code>.
        </p>
      </div>

      {/* Trip Log Table (Print & Screen audit log) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100">
            Contemporaneous Trip Ledger ({summary.trips.length} Entries in {selectedYear})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-mono text-slate-400 uppercase">
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Odometer (Start → End)</th>
                <th className="px-4 py-2.5">Distance</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Destination & Business Purpose</th>
                <th className="px-4 py-2.5 text-right">Tolls</th>
                <th className="px-4 py-2.5 text-right">Deduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {summary.trips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    No trips recorded in tax year {selectedYear}.
                  </td>
                </tr>
              ) : (
                summary.trips.map((t) => {
                  const isBiz = t.category === 'BUSINESS';
                  const deduction = isBiz
                    ? (t.distanceMiles * summary.standardRatePerMile) + (t.tollsAndParkingUsd || 0)
                    : 0;

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 font-mono text-slate-200 whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-400 whitespace-nowrap">
                        {t.startOdometer.toLocaleString()} → {t.endOdometer.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-semibold text-slate-200 whitespace-nowrap">
                        {t.distanceMiles} mi
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            isBiz
                              ? 'bg-blue-600/20 text-blue-300'
                              : t.category === 'COMMUTE'
                              ? 'bg-amber-600/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-200">
                          {t.destination}
                        </div>
                        {t.businessPurpose && (
                          <div className="text-[11px] text-slate-400">
                            {t.businessPurpose}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-300">
                        {t.tollsAndParkingUsd > 0 ? `$${t.tollsAndParkingUsd.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-400">
                        {isBiz ? `$${deduction.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
