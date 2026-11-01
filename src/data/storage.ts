import { ServiceRecord, Trip, VehicleProfile } from '../types/vehicle';
import {
  INITIAL_SERVICE_RECORDS,
  INITIAL_TRIPS,
  INITIAL_VEHICLE_PROFILE,
} from './initialData';

const STORAGE_KEYS = {
  PROFILE: 'vehicle_hub_profile_v1',
  SERVICES: 'vehicle_hub_services_v1',
  TRIPS: 'vehicle_hub_trips_v1',
};

export class VehicleStorage {
  static getProfile(): VehicleProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to read vehicle profile from localStorage', e);
    }
    this.saveProfile(INITIAL_VEHICLE_PROFILE);
    return INITIAL_VEHICLE_PROFILE;
  }

  static saveProfile(profile: VehicleProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save vehicle profile', e);
    }
  }

  static updateOdometer(newOdometer: number, dateStr?: string): VehicleProfile {
    const profile = this.getProfile();
    const updated: VehicleProfile = {
      ...profile,
      currentOdometer: Math.max(profile.currentOdometer, newOdometer),
      lastOdometerUpdateDate: dateStr || new Date().toISOString().split('T')[0],
    };
    this.saveProfile(updated);
    return updated;
  }

  static getServices(): ServiceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to read service records from localStorage', e);
    }
    this.saveServices(INITIAL_SERVICE_RECORDS);
    return INITIAL_SERVICE_RECORDS;
  }

  static saveServices(services: ServiceRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {
      console.error('Failed to save service records', e);
    }
  }

  static addService(record: Omit<ServiceRecord, 'id'>): ServiceRecord {
    const services = this.getServices();
    const newRecord: ServiceRecord = {
      ...record,
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    const updated = [newRecord, ...services];
    // Sort descending by date, then odometer
    updated.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.odometer - a.odometer;
    });
    this.saveServices(updated);

    // If odometer is higher than current, update profile
    const profile = this.getProfile();
    if (newRecord.odometer > profile.currentOdometer) {
      this.updateOdometer(newRecord.odometer, newRecord.date);
    }

    return newRecord;
  }

  static updateService(record: ServiceRecord): void {
    const services = this.getServices();
    const updated = services.map((s) => (s.id === record.id ? record : s));
    updated.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.odometer - a.odometer;
    });
    this.saveServices(updated);
  }

  static deleteService(id: string): void {
    const services = this.getServices();
    this.saveServices(services.filter((s) => s.id !== id));
  }

  static getTrips(): Trip[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to read trips from localStorage', e);
    }
    this.saveTrips(INITIAL_TRIPS);
    return INITIAL_TRIPS;
  }

  static saveTrips(trips: Trip[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.error('Failed to save trips', e);
    }
  }

  static addTrip(trip: Omit<Trip, 'id' | 'createdAt'>): Trip {
    const trips = this.getTrips();
    const newTrip: Trip = {
      ...trip,
      id: `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTrip, ...trips];
    updated.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.endOdometer - a.endOdometer;
    });
    this.saveTrips(updated);

    // Advance vehicle odometer if trip endOdometer is higher
    const profile = this.getProfile();
    if (newTrip.endOdometer > profile.currentOdometer) {
      this.updateOdometer(newTrip.endOdometer, newTrip.date);
    }

    return newTrip;
  }

  static updateTrip(trip: Trip): void {
    const trips = this.getTrips();
    const updated = trips.map((t) => (t.id === trip.id ? trip : t));
    updated.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.endOdometer - a.endOdometer;
    });
    this.saveTrips(updated);
  }

  static deleteTrip(id: string): void {
    const trips = this.getTrips();
    this.saveTrips(trips.filter((t) => t.id !== id));
  }

  static resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.TRIPS);
  }

  static exportBackup(): string {
    const data = {
      profile: this.getProfile(),
      services: this.getServices(),
      trips: this.getTrips(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(data, null, 2);
  }

  static importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveProfile(data.profile);
      if (Array.isArray(data.services)) this.saveServices(data.services);
      if (Array.isArray(data.trips)) this.saveTrips(data.trips);
      return true;
    } catch (e) {
      console.error('Failed to import data', e);
      return false;
    }
  }
}
