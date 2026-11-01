import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Plus,
  ShieldCheck,
  Tag,
  Trash2,
  Wrench,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { ServiceCategory, ServiceRecord } from '../types/vehicle';

interface MaintenanceViewProps {
  services: ServiceRecord[];
  onAddService: (record: Omit<ServiceRecord, 'id'>) => void;
  onDeleteService: (id: string) => void;
  currentOdometer: number;
}

const ALL_SERVICES: { id: ServiceCategory; label: string; minder?: string }[] = [
  { id: 'OIL_CHANGE', label: 'Engine Oil Change (0W-20)', minder: 'A' },
  { id: 'MULTI_POINT_INSPECTION', label: 'Multi-Point Inspection & Filter', minder: 'B' },
  { id: 'TIRE_ROTATION', label: 'Tire Rotation', minder: '1' },
  { id: 'ENGINE_FILTER', label: 'Engine Air Cleaner Element', minder: '2' },
  { id: 'CABIN_FILTER', label: 'Cabin Dust & Pollen Filter', minder: '2' },
  { id: 'TRANSMISSION_SERVICE', label: 'Transmission Fluid (CVT / 10-Speed)', minder: '3' },
  { id: 'SPARK_PLUGS', label: 'Spark Plugs & Valve Check', minder: '4' },
  { id: 'COOLANT_SERVICE', label: 'Engine Coolant Flush', minder: '5' },
  { id: 'BRAKE_PADS', label: 'Brake Pads Replacement' },
  { id: 'BRAKE_CALIPERS', label: 'Brake Caliper Service' },
  { id: 'BRAKE_FLUID', label: 'Brake Fluid Flush (36 Mo)' },
  { id: 'WHEEL_ALIGNMENT', label: '4-Wheel Alignment Check' },
  { id: 'WIPER_BLADES', label: 'Windshield Wiper Blades' },
  { id: 'WARRANTY_REPAIR', label: 'Warranty Bulletin Repair' },
  { id: 'BATTERY', label: '12V Battery Replacement' },
  { id: 'TIRE_SERVICE', label: 'Tire Service / Repair' },
];

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  services,
  onAddService,
  onDeleteService,
  currentOdometer,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number>(currentOdometer);
  const [selectedServices, setSelectedServices] = useState<ServiceCategory[]>(['OIL_CHANGE']);
  const [minderCodes, setMinderCodes] = useState<string>('A');
  const [costUsd, setCostUsd] = useState<number>(85);
  const [provider, setProvider] = useState<string>('Honda Service');
  const [notes, setNotes] = useState<string>('');

  const toggleService = (s: ServiceCategory) => {
    if (selectedServices.includes(s)) {
      setSelectedServices(selectedServices.filter((x) => x !== s));
    } else {
      setSelectedServices([...selectedServices, s]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      alert('Please select at least one service performed.');
      return;
    }

    const codes = minderCodes
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    onAddService({
      date,
      odometer: Number(odometer) || 0,
      services: selectedServices,
      minderCodes: codes,
      costUsd: Number(costUsd) || 0,
      provider: provider.trim(),
      notes: notes.trim() || `${odometer} mi maintenance service`,
    });

    setShowAddModal(false);
    setNotes('');
  };

  const totalSpent = services.reduce((acc, s) => acc + (s.costUsd || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Maintenance History & Google Keep Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Historical vehicle maintenance records with 2019 Honda Accord factory minder mapping.
          </p>
        </div>
        <button
          onClick={() => {
            setOdometer(currentOdometer);
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Record Service
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            Total Records
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">
            {services.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Pre-seeded from Keep records
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            Recorded Spend
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            ${totalSpent.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            Parts & labor totals
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            Warranty Protection
          </div>
          <div className="text-sm font-semibold text-blue-400 flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-4 h-4 shrink-0" /> AC Condenser Bulletin
          </div>
          <div className="text-[11px] text-slate-400">
            Fixed under 10-yr Honda extension
          </div>
        </div>
      </div>

      {/* Chronological Service Ledger */}
      <div className="space-y-3">
        {services.map((record) => {
          const isWarranty =
            record.services.includes('WARRANTY_REPAIR') ||
            record.notes.toLowerCase().includes('condenser') ||
            record.notes.toLowerCase().includes('warranty');

          return (
            <div
              key={record.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                isWarranty
                  ? 'border-blue-500/40 bg-blue-950/20 shadow-md shadow-blue-950/20'
                  : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {record.date}
                    </span>
                    <span className="rounded-md bg-blue-600/20 px-2 py-0.5 font-mono text-xs font-semibold text-blue-300 border border-blue-500/30">
                      {record.odometer.toLocaleString()} mi
                    </span>

                    {isWarranty && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" /> Honda Warranty Covered ($0)
                      </span>
                    )}

                    {record.minderCodes?.map((code) => (
                      <span
                        key={code}
                        className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300 border border-amber-500/30"
                      >
                        Code {code}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100">
                    {record.notes}
                  </h3>

                  {record.provider && (
                    <div className="text-xs text-slate-400">
                      Serviced by: <span className="text-slate-300">{record.provider}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {record.services.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700/60"
                      >
                        {s.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Cost & Delete */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-slate-200">
                      {record.costUsd !== undefined ? `$${record.costUsd.toFixed(2)}` : 'N/A'}
                    </div>
                    {isWarranty && (
                      <div className="text-[10px] text-emerald-400 font-medium">
                        Covered 100%
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Delete this service record?')) {
                        onDeleteService(record.id);
                      }
                    }}
                    className="mt-2 p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Wrench className="w-5 h-5" />
                <h3 className="font-bold text-slate-100">Record Vehicle Service</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Odometer (mi)
                  </label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Service Items Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Services Performed (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 rounded-xl border border-slate-800 bg-slate-950/60">
                  {ALL_SERVICES.map((s) => {
                    const isChecked = selectedServices.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                          isChecked
                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-medium'
                            : 'text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="truncate">{s.label}</span>
                        {s.minder && (
                          <span className="ml-1 shrink-0 font-mono text-[10px] text-amber-400">
                            [{s.minder}]
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Minder Codes (e.g. A, 1, 2)
                  </label>
                  <input
                    type="text"
                    value={minderCodes}
                    onChange={(e) => setMinderCodes(e.target.value)}
                    placeholder="A, 1"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cost ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costUsd}
                    onChange={(e) => setCostUsd(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Service Provider / Facility
                </label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. Honda Dealership, Tire Center, DIY"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notes / Observations
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. multipoint inspection, oil change, tire pressure set"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95"
                >
                  Save Maintenance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
