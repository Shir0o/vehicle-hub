import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Droplet,
  Flame,
  Info,
  Layers,
  Sparkles,
  Wrench,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { MaintenanceMinderState, ServiceRecord, Trip, VehicleProfile } from '../types/vehicle';

interface DashboardViewProps {
  profile: VehicleProfile;
  minder: MaintenanceMinderState;
  services: ServiceRecord[];
  trips: Trip[];
  onNavigateTab: (tab: 'logger' | 'trips' | 'maintenance' | 'tax') => void;
  onOpenOdometer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  minder,
  services,
  trips,
  onNavigateTab,
  onOpenOdometer,
}) => {
  const getStatusBadge = (status: string, urgency: string) => {
    switch (status) {
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3 h-3" /> Overdue
          </span>
        );
      case 'DUE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Due Soon
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-400 border border-sky-500/30">
            <Clock className="w-3 h-3" /> Upcoming
          </span>
        );
      case 'NOT_APPLICABLE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400 border border-slate-700">
            FWD N/A
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Good
          </span>
        );
    }
  };

  const getOilGaugeColor = (pct: number) => {
    if (pct <= 0) return 'text-rose-500 stroke-rose-500';
    if (pct <= 15) return 'text-amber-500 stroke-amber-500';
    if (pct <= 30) return 'text-yellow-400 stroke-yellow-400';
    return 'text-blue-500 stroke-blue-500';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero: Honda Maintenance Minder Cluster Display */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-b from-slate-900 via-slate-900/90 to-slate-950 p-5 sm:p-6 shadow-2xl">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Honda MID Cluster Gauge */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
            {/* Circular Gauge */}
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className={`transition-all duration-700 ease-out ${getOilGaugeColor(
                    minder.oilLifePercentage
                  )}`}
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={
                    2 * Math.PI * 50 * (1 - Math.max(0, minder.oilLifePercentage) / 100)
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                  Oil Life
                </span>
                <span className="text-3xl font-extrabold font-mono text-slate-100 tracking-tight">
                  {minder.oilLifePercentage}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {minder.oilLifePercentage <= 15 ? 'Service Due' : 'Remaining'}
                </span>
              </div>
            </div>

            {/* MID Active Code Pill and Alert */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 border border-slate-700/60 font-mono">
                <span>Honda MID Code:</span>
                <span className="font-bold text-amber-400 text-sm tracking-wider">
                  {minder.minderCodeDisplay || minder.activeMainCode}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
                2019 Honda Accord
              </h2>

              <p className="text-xs text-slate-400 max-w-sm">
                Next oil change due at{' '}
                <span className="font-mono font-semibold text-slate-200">
                  {minder.nextServiceOdometer.toLocaleString()} mi
                </span>{' '}
                ({minder.milesToNextService.toLocaleString()} miles remaining).
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <button
                  onClick={onOpenOdometer}
                  className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs font-medium text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                >
                  Odometer: {profile.currentOdometer.toLocaleString()} mi ✏️
                </button>
                <button
                  onClick={() => onNavigateTab('logger')}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                >
                  + Log Trip
                </button>
              </div>
            </div>
          </div>

          {/* Right: Active Service Warning Box */}
          <div className="w-full md:w-80 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 backdrop-blur-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-400" /> Minder Active Items
              </span>
              {getStatusBadge(minder.overallStatus, 'high')}
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Main code item */}
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <div>
                  <div className="font-semibold text-slate-200">
                    Main Code {minder.activeMainCode}: Engine Oil
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Due at {minder.nextServiceOdometer.toLocaleString()} mi
                  </div>
                </div>
                <div className="font-mono text-slate-300">
                  {minder.milesToNextService.toLocaleString()} mi left
                </div>
              </div>

              {/* Sub items active */}
              {minder.items
                .filter((item) => item.status === 'OVERDUE' || item.status === 'DUE')
                .map((item) => (
                  <div key={item.code} className="flex items-start justify-between pb-1">
                    <div>
                      <div className="font-semibold text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.milesRemaining !== undefined && item.milesRemaining < 0
                          ? `${Math.abs(item.milesRemaining).toLocaleString()} mi overdue`
                          : item.daysRemaining !== undefined && item.daysRemaining < 0
                          ? `${Math.abs(item.daysRemaining)} days overdue`
                          : 'Due now'}
                      </div>
                    </div>
                    {getStatusBadge(item.status, item.urgency)}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2019 Honda Accord Maintenance Minder Matrix */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-400" />
              Honda Maintenance Minder Codes (A/B, 1–6)
            </h3>
            <p className="text-xs text-slate-400">
              Factory service algorithms, intervals, and component health for 10th Gen Accord.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('maintenance')}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            History <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {minder.items.map((item) => {
            return (
              <div
                key={item.code}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600/20 text-xs font-mono font-bold text-blue-400 border border-blue-500/30">
                        {item.code}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-100">
                        {item.title}
                      </h4>
                    </div>
                    {getStatusBadge(item.status, item.urgency)}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Progress bar and details */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>
                      {item.lastServiceOdometer
                        ? `Last: ${item.lastServiceOdometer.toLocaleString()} mi (${item.lastServiceDate || ''})`
                        : item.lastServiceDate
                        ? `Last: ${item.lastServiceDate}`
                        : 'Factory original fill'}
                    </span>
                    <span className="font-mono font-medium text-slate-300">
                      {item.nextDueOdometer
                        ? `Next: ${item.nextDueOdometer.toLocaleString()} mi`
                        : item.nextDueDate
                        ? `Next: ${item.nextDueDate}`
                        : ''}
                    </span>
                  </div>

                  {item.status !== 'NOT_APPLICABLE' && (
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.percentageRemaining <= 10
                            ? 'bg-rose-500'
                            : item.percentageRemaining <= 25
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.max(4, item.percentageRemaining)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Action Cards & Recent Records */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Keep Service Records */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              Recent Service Records
            </h4>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              View All ({services.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {services.slice(0, 3).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 p-2.5 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">
                    {record.notes}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{record.date}</span>
                    <span>•</span>
                    <span className="font-mono">{record.odometer.toLocaleString()} mi</span>
                    {record.costUsd !== undefined && record.costUsd > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400">${record.costUsd.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {record.services.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-300 border border-slate-700/60"
                    >
                      {s.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent IRC § 274 Trips */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Recent Logged Trips
            </h4>
            <button
              onClick={() => onNavigateTab('trips')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              View All ({trips.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {trips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 p-2.5 text-xs"
              >
                <div className="max-w-[70%]">
                  <div className="font-semibold text-slate-200 truncate">
                    {trip.destination}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {trip.businessPurpose || trip.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-200">
                    {trip.distanceMiles} mi
                  </div>
                  <span
                    className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-semibold ${
                      trip.category === 'BUSINESS'
                        ? 'bg-blue-500/20 text-blue-300'
                        : trip.category === 'COMMUTE'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {trip.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
