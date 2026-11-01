import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Filter,
  MapPin,
  Navigation,
  Plus,
  Search,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Trip, TripCategory } from '../types/vehicle';
import { getStandardMileageRate } from '../engine/irsCalculator';

interface TripListViewProps {
  trips: Trip[];
  onDeleteTrip: (id: string) => void;
  onNavigateNewTrip: () => void;
}

export const TripListView: React.FC<TripListViewProps> = ({
  trips,
  onDeleteTrip,
  onNavigateNewTrip,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const years = Array.from(
    new Set(trips.map((t) => (t.date ? t.date.split('-')[0] : '')))
  )
    .filter(Boolean)
    .sort()
    .reverse();

  const filteredTrips = trips.filter((t) => {
    if (selectedYear !== 'ALL') {
      const yr = t.date ? t.date.split('-')[0] : '';
      if (yr !== selectedYear) return false;
    }
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDest = t.destination?.toLowerCase().includes(q);
      const matchPurpose = t.businessPurpose?.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      if (!matchDest && !matchPurpose && !matchNotes) return false;
    }
    return true;
  });

  const totalFilteredMiles = filteredTrips.reduce((acc, t) => acc + (t.distanceMiles || 0), 0);
  const businessFilteredMiles = filteredTrips
    .filter((t) => t.category === 'BUSINESS')
    .reduce((acc, t) => acc + (t.distanceMiles || 0), 0);
  const totalFilteredTolls = filteredTrips
    .filter((t) => t.category === 'BUSINESS')
    .reduce((acc, t) => acc + (t.tollsAndParkingUsd || 0), 0);

  const totalFilteredDeduction = filteredTrips
    .filter((t) => t.category === 'BUSINESS')
    .reduce((acc, t) => {
      const yr = parseInt(t.date?.split('-')[0] || '2026', 10);
      const rate = getStandardMileageRate(yr);
      return acc + (t.distanceMiles * rate) + (t.tollsAndParkingUsd || 0);
    }, 0);

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Trip & Mileage Ledger
          </h2>
          <p className="text-xs text-slate-400">
            IRC § 274 compliant travel logs with contemporaneous odometers.
          </p>
        </div>
        <button
          onClick={onNavigateNewTrip}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Log New Trip
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search purpose, destination, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Year Filter */}
        <div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Tax Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                Tax Year {y}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="BUSINESS">Business Only</option>
            <option value="COMMUTE">Commute Only</option>
            <option value="PERSONAL">Personal Only</option>
          </select>
        </div>
      </div>

      {/* Filtered Aggregates Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            Total Trips
          </div>
          <div className="text-lg font-bold text-slate-200">
            {filteredTrips.length}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            Total Miles
          </div>
          <div className="text-lg font-bold font-mono text-slate-200">
            {totalFilteredMiles.toLocaleString()} mi
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            Business Miles
          </div>
          <div className="text-lg font-bold font-mono text-blue-400">
            {businessFilteredMiles.toLocaleString()} mi
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            Est. Deduction
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            ${totalFilteredDeduction.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-2.5">
        {filteredTrips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
            No trips match the current filter criteria.
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const yr = parseInt(trip.date?.split('-')[0] || '2026', 10);
            const rate = getStandardMileageRate(yr);
            const isBusiness = trip.category === 'BUSINESS';
            const deduction = isBusiness
              ? (trip.distanceMiles * rate) + (trip.tollsAndParkingUsd || 0)
              : 0;

            const isCompliant =
              trip.destination &&
              trip.startOdometer > 0 &&
              trip.endOdometer >= trip.startOdometer &&
              (!isBusiness || (trip.businessPurpose && trip.businessPurpose.trim().length >= 5));

            return (
              <div
                key={trip.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 transition-all hover:border-slate-700/80 hover:bg-slate-900/70 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-300">
                        {trip.date}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                          trip.category === 'BUSINESS'
                            ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                            : trip.category === 'COMMUTE'
                            ? 'bg-amber-600/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {trip.category}
                      </span>
                      {isCompliant ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Audit-Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                          <AlertTriangle className="w-3 h-3" /> Needs Detail
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {trip.destination}
                    </h3>

                    {trip.businessPurpose && (
                      <p className="text-xs text-slate-300 leading-relaxed pl-5">
                        <span className="text-slate-500 font-medium">Purpose: </span>
                        {trip.businessPurpose}
                      </p>
                    )}

                    {trip.notes && (
                      <p className="text-[11px] text-slate-400 italic pl-5">
                        {trip.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Mileage & Tax Capsule */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-extrabold font-mono text-slate-100">
                        {trip.distanceMiles} mi
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {trip.startOdometer.toLocaleString()} → {trip.endOdometer.toLocaleString()}
                      </div>
                    </div>

                    {isBusiness && (
                      <div className="text-right mt-1">
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          +${deduction.toFixed(2)}
                        </div>
                        {trip.tollsAndParkingUsd > 0 && (
                          <div className="text-[9px] text-slate-400">
                            inc. ${trip.tollsAndParkingUsd.toFixed(2)} tolls
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this trip record?')) {
                          onDeleteTrip(trip.id);
                        }
                      }}
                      className="mt-1 p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
