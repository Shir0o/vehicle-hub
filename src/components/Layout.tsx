import React, { useState } from 'react';
import {
  Gauge,
  PlusCircle,
  Clock,
  Wrench,
  ReceiptText,
  RotateCcw,
  Download,
  Car,
} from 'lucide-react';
import { VehicleProfile } from '../types/vehicle';
import { OdometerModal } from './OdometerModal';

export type ActiveTab = 'dashboard' | 'logger' | 'trips' | 'maintenance' | 'tax';

interface LayoutProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  profile: VehicleProfile;
  onUpdateOdometer: (newOdometer: number) => void;
  onResetData: () => void;
  onExportBackup: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  onTabChange,
  profile,
  onUpdateOdometer,
  onResetData,
  onExportBackup,
  children,
}) => {
  const [showOdoModal, setShowOdoModal] = useState(false);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: Gauge },
    { id: 'logger' as ActiveTab, label: 'Log Trip', icon: PlusCircle },
    { id: 'trips' as ActiveTab, label: 'Trips', icon: Clock },
    { id: 'maintenance' as ActiveTab, label: 'Service', icon: Wrench },
    { id: 'tax' as ActiveTab, label: 'IRS Tax', icon: ReceiptText },
  ];

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <header className="z-30 shrink-0 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md pt-safe px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-blue-400 uppercase">
                  Vehicle Hub
                </span>
                <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700/60">
                  {profile.year} Accord
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {profile.trim}
              </div>
            </div>
          </div>

          {/* Odometer Capsule & Header Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOdoModal(true)}
              className="group flex items-center gap-1.5 rounded-xl border border-slate-700/70 bg-slate-800/80 px-2.5 py-1.5 transition-all hover:border-blue-500/50 hover:bg-slate-800"
              title="Click to update odometer"
            >
              <Gauge className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
              <div className="text-left leading-none">
                <div className="font-mono text-xs font-semibold text-slate-200">
                  {profile.currentOdometer.toLocaleString()}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">mi</span>
                </div>
              </div>
            </button>

            <button
              onClick={onExportBackup}
              title="Export JSON Backup"
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-800/50"
            >
              <Download className="h-4 w-4" />
            </button>

            <button
              onClick={onResetData}
              title="Reset to Demo Data"
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-rose-400 hover:bg-slate-800/50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden sm:block mt-3 border-t border-slate-800/60 pt-2">
          <div className="mx-auto flex max-w-5xl gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:py-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden z-30 shrink-0 border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-lg pb-safe">
        <div className="grid grid-cols-5 px-1 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                    isActive ? 'bg-blue-600/20 shadow-xs shadow-blue-500/20' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Odometer Modal */}
      <OdometerModal
        isOpen={showOdoModal}
        onClose={() => setShowOdoModal(false)}
        currentOdometer={profile.currentOdometer}
        onSave={onUpdateOdometer}
      />
    </div>
  );
};
