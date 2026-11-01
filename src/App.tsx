import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { TripLoggerView } from './components/TripLoggerView';
import { TripListView } from './components/TripListView';
import { MaintenanceView } from './components/MaintenanceView';
import { TaxExportView } from './components/TaxExportView';
import { VehicleStorage } from './data/storage';
import { calculateMaintenanceMinder } from './engine/maintenanceMinder';
import { ServiceRecord, Trip, VehicleProfile } from './types/vehicle';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [profile, setProfile] = useState<VehicleProfile>(() => VehicleStorage.getProfile());
  const [services, setServices] = useState<ServiceRecord[]>(() => VehicleStorage.getServices());
  const [trips, setTrips] = useState<Trip[]>(() => VehicleStorage.getTrips());

  // Maintenance Minder calculation engine
  const minderState = useMemo(() => {
    return calculateMaintenanceMinder(profile, services);
  }, [profile, services]);

  const handleUpdateOdometer = (newOdo: number) => {
    const updated = VehicleStorage.updateOdometer(newOdo);
    setProfile(updated);
  };

  const handleSaveTrip = (tripData: Omit<Trip, 'id' | 'createdAt'>) => {
    VehicleStorage.addTrip(tripData);
    setTrips(VehicleStorage.getTrips());
    setProfile(VehicleStorage.getProfile());
  };

  const handleDeleteTrip = (id: string) => {
    VehicleStorage.deleteTrip(id);
    setTrips(VehicleStorage.getTrips());
  };

  const handleAddService = (serviceData: Omit<ServiceRecord, 'id'>) => {
    VehicleStorage.addService(serviceData);
    setServices(VehicleStorage.getServices());
    setProfile(VehicleStorage.getProfile());
  };

  const handleDeleteService = (id: string) => {
    VehicleStorage.deleteService(id);
    setServices(VehicleStorage.getServices());
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Reset vehicle data to original pre-seeded Google Keep maintenance and trips?'
      )
    ) {
      VehicleStorage.resetToDefaults();
      setProfile(VehicleStorage.getProfile());
      setServices(VehicleStorage.getServices());
      setTrips(VehicleStorage.getTrips());
    }
  };

  const handleExportBackup = () => {
    const jsonStr = VehicleStorage.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehicle-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const lastTripEndOdometer = trips[0]?.endOdometer;

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      profile={profile}
      onUpdateOdometer={handleUpdateOdometer}
      onResetData={handleResetData}
      onExportBackup={handleExportBackup}
    >
      {activeTab === 'dashboard' && (
        <DashboardView
          profile={profile}
          minder={minderState}
          services={services}
          trips={trips}
          onNavigateTab={setActiveTab}
          onOpenOdometer={() => handleUpdateOdometer(profile.currentOdometer)}
        />
      )}

      {activeTab === 'logger' && (
        <TripLoggerView
          profile={profile}
          lastTripEndOdometer={lastTripEndOdometer}
          onSaveTrip={handleSaveTrip}
          onDone={() => setActiveTab('trips')}
        />
      )}

      {activeTab === 'trips' && (
        <TripListView
          trips={trips}
          onDeleteTrip={handleDeleteTrip}
          onNavigateNewTrip={() => setActiveTab('logger')}
        />
      )}

      {activeTab === 'maintenance' && (
        <MaintenanceView
          services={services}
          onAddService={handleAddService}
          onDeleteService={handleDeleteService}
          currentOdometer={profile.currentOdometer}
        />
      )}

      {activeTab === 'tax' && <TaxExportView trips={trips} />}
    </Layout>
  );
}

export default App;
