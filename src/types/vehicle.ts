export type ServiceCategory =
  | 'OIL_CHANGE'
  | 'TIRE_ROTATION'
  | 'TIRE_SERVICE'
  | 'WHEEL_ALIGNMENT'
  | 'TRANSMISSION_SERVICE'
  | 'BRAKE_PADS'
  | 'BRAKE_CALIPERS'
  | 'BRAKE_FLUID'
  | 'ENGINE_FILTER'
  | 'CABIN_FILTER'
  | 'WIPER_BLADES'
  | 'SPARK_PLUGS'
  | 'COOLANT_SERVICE'
  | 'MULTI_POINT_INSPECTION'
  | 'WARRANTY_REPAIR'
  | 'BATTERY'
  | 'OTHER';

export type HondaMainCode = 'A' | 'B';
export type HondaSubCode = '1' | '2' | '3' | '4' | '5' | '6';

export interface ServiceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  odometer: number;
  services: ServiceCategory[];
  notes: string;
  costUsd?: number;
  minderCodes?: string[]; // e.g. ["A", "1"], ["B", "1", "2"]
  provider?: string;
}

export type TripCategory = 'BUSINESS' | 'COMMUTE' | 'PERSONAL';

export interface Trip {
  id: string;
  date: string; // YYYY-MM-DD
  startOdometer: number;
  endOdometer: number;
  distanceMiles: number;
  category: TripCategory;
  destination: string;
  businessPurpose: string; // Required for IRC § 274 if category is BUSINESS
  tollsAndParkingUsd: number;
  notes?: string;
  createdAt: string;
}

export interface VehicleProfile {
  year: number;
  make: string;
  model: string;
  trim: string;
  vin?: string;
  currentOdometer: number;
  lastOdometerUpdateDate: string;
  drivetrain: 'FWD' | 'AWD';
  oilChangeIntervalMiles: number; // e.g. 5,000 or 7,500
  tireRotationIntervalMiles: number; // e.g. 5,000 to 7,500
  engineAndCabinFilterIntervalMiles: number; // e.g. 15,000 to 30,000
  transmissionFluidIntervalMiles: number; // e.g. 30,000 to 45,000
  sparkPlugsIntervalMiles: number; // 100,000
  coolantIntervalMiles: number; // 100,000
  brakeFluidIntervalMonths: number; // 36 months
  alignmentIntervalMonths: number; // 12 months
}

export type MinderStatus = 'OK' | 'UPCOMING' | 'DUE' | 'OVERDUE' | 'NOT_APPLICABLE';

export interface MinderItemStatus {
  code: string;
  title: string;
  description: string;
  lastServiceOdometer?: number;
  lastServiceDate?: string;
  intervalMiles?: number;
  intervalMonths?: number;
  nextDueOdometer?: number;
  nextDueDate?: string;
  milesRemaining?: number;
  daysRemaining?: number;
  percentageRemaining: number; // 0 to 100
  status: MinderStatus;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface MaintenanceMinderState {
  oilLifePercentage: number;
  activeMainCode: HondaMainCode;
  activeSubCodes: HondaSubCode[];
  minderCodeDisplay: string; // e.g. "A1" or "B12"
  overallStatus: MinderStatus;
  items: MinderItemStatus[];
  nextServiceOdometer: number;
  milesToNextService: number;
}

export interface AnnualTaxSummary {
  taxYear: number;
  totalTrips: number;
  totalMiles: number;
  businessMiles: number;
  commuteMiles: number;
  personalMiles: number;
  businessPercentage: number;
  standardRatePerMile: number;
  mileageDeductionUsd: number;
  tollsAndParkingUsd: number;
  totalVehicleDeductionUsd: number;
  trips: Trip[];
}
