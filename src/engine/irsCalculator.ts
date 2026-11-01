import { AnnualTaxSummary, Trip } from '../types/vehicle';

export const IRS_STANDARD_MILEAGE_RATES: Record<number, number> = {
  2024: 0.67,
  2025: 0.67,
  2026: 0.70,
};

export function getStandardMileageRate(year: number): number {
  return IRS_STANDARD_MILEAGE_RATES[year] || 0.67;
}

export function calculateAnnualTaxSummary(trips: Trip[], year: number): AnnualTaxSummary {
  const yearTrips = trips.filter((t) => {
    if (!t.date) return false;
    const tripYear = parseInt(t.date.split('-')[0], 10);
    return tripYear === year;
  });

  let totalMiles = 0;
  let businessMiles = 0;
  let commuteMiles = 0;
  let personalMiles = 0;
  let tollsAndParkingUsd = 0;

  for (const t of yearTrips) {
    const dist = t.distanceMiles || Math.max(0, t.endOdometer - t.startOdometer);
    totalMiles += dist;
    if (t.category === 'BUSINESS') {
      businessMiles += dist;
      tollsAndParkingUsd += t.tollsAndParkingUsd || 0;
    } else if (t.category === 'COMMUTE') {
      commuteMiles += dist;
    } else {
      personalMiles += dist;
    }
  }

  const businessPercentage = totalMiles > 0 ? (businessMiles / totalMiles) * 100 : 0;
  const standardRatePerMile = getStandardMileageRate(year);
  const mileageDeductionUsd = Math.round(businessMiles * standardRatePerMile * 100) / 100;
  const totalVehicleDeductionUsd = Math.round((mileageDeductionUsd + tollsAndParkingUsd) * 100) / 100;

  return {
    taxYear: year,
    totalTrips: yearTrips.length,
    totalMiles,
    businessMiles,
    commuteMiles,
    personalMiles,
    businessPercentage: Math.round(businessPercentage * 10) / 10,
    standardRatePerMile,
    mileageDeductionUsd,
    tollsAndParkingUsd: Math.round(tollsAndParkingUsd * 100) / 100,
    totalVehicleDeductionUsd,
    trips: yearTrips,
  };
}

export interface ComplianceIssue {
  tripId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export function validateIrc274Compliance(trips: Trip[]): {
  compliantCount: number;
  nonCompliantCount: number;
  complianceRate: number;
  issues: ComplianceIssue[];
} {
  const issues: ComplianceIssue[] = [];
  let compliantCount = 0;

  for (const trip of trips) {
    let tripHasError = false;

    if (!trip.date) {
      issues.push({ tripId: trip.id, field: 'date', message: 'Missing trip date', severity: 'error' });
      tripHasError = true;
    }

    if (trip.startOdometer <= 0 && trip.endOdometer <= 0) {
      issues.push({ tripId: trip.id, field: 'odometer', message: 'Missing odometer readings', severity: 'error' });
      tripHasError = true;
    } else if (trip.endOdometer < trip.startOdometer) {
      issues.push({ tripId: trip.id, field: 'odometer', message: 'End odometer is less than start odometer', severity: 'error' });
      tripHasError = true;
    }

    if (!trip.destination || trip.destination.trim().length === 0) {
      issues.push({ tripId: trip.id, field: 'destination', message: 'Missing destination location / name', severity: 'error' });
      tripHasError = true;
    }

    if (trip.category === 'BUSINESS') {
      if (!trip.businessPurpose || trip.businessPurpose.trim().length === 0) {
        issues.push({ tripId: trip.id, field: 'businessPurpose', message: 'IRC § 274 requires explicit business purpose for business trips', severity: 'error' });
        tripHasError = true;
      } else if (trip.businessPurpose.trim().length < 8) {
        issues.push({ tripId: trip.id, field: 'businessPurpose', message: 'Business purpose description is too vague for IRS audit defense', severity: 'warning' });
      }
    }

    if (!tripHasError) {
      compliantCount++;
    }
  }

  const total = trips.length;
  const nonCompliantCount = total - compliantCount;
  const complianceRate = total > 0 ? Math.round((compliantCount / total) * 100) : 100;

  return { compliantCount, nonCompliantCount, complianceRate, issues };
}

export function generateIrsMileageCsv(summary: AnnualTaxSummary): string {
  const headers = [
    'Date',
    'Start Odometer',
    'End Odometer',
    'Distance (mi)',
    'Category',
    'Destination',
    'Business Purpose (IRC § 274)',
    'Tolls & Parking ($)',
    'Standard Rate ($/mi)',
    'Mileage Deduction ($)',
    'Total Deductible ($)',
    'Notes',
  ];

  const rows = summary.trips.map((t) => {
    const isBusiness = t.category === 'BUSINESS';
    const dist = t.distanceMiles;
    const mileageDeduction = isBusiness ? (dist * summary.standardRatePerMile).toFixed(2) : '0.00';
    const tolls = isBusiness ? (t.tollsAndParkingUsd || 0).toFixed(2) : '0.00';
    const totalDeductible = isBusiness
      ? ((dist * summary.standardRatePerMile) + (t.tollsAndParkingUsd || 0)).toFixed(2)
      : '0.00';

    return [
      `"${t.date}"`,
      t.startOdometer,
      t.endOdometer,
      dist,
      `"${t.category}"`,
      `"${(t.destination || '').replace(/"/g, '""')}"`,
      `"${(t.businessPurpose || '').replace(/"/g, '""')}"`,
      tolls,
      isBusiness ? summary.standardRatePerMile.toFixed(2) : '0.00',
      mileageDeduction,
      totalDeductible,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  // Summary lines at top
  const metadata = [
    `# Vehicle Hub - IRS Form 1040 Schedule C Mileage & Travel Log`,
    `# Tax Year: ${summary.taxYear}`,
    `# Vehicle: 2019 Honda Accord`,
    `# Total Miles: ${summary.totalMiles}`,
    `# Business Miles: ${summary.businessMiles} (${summary.businessPercentage}% business use)`,
    `# Commuting Miles: ${summary.commuteMiles}`,
    `# Personal Miles: ${summary.personalMiles}`,
    `# Standard Mileage Rate: $${summary.standardRatePerMile}/mile`,
    `# Mileage Deduction: $${summary.mileageDeductionUsd.toFixed(2)}`,
    `# Parking and Tolls: $${summary.tollsAndParkingUsd.toFixed(2)}`,
    `# Total IRC § 274 Tax Deduction: $${summary.totalVehicleDeductionUsd.toFixed(2)}`,
    ``,
  ];

  return metadata.join('\n') + headers.join(',') + '\n' + rows.join('\n');
}

export function generateTaxHubExportJson(summary: AnnualTaxSummary): string {
  const exportPayload = {
    app: 'vehicle-hub',
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    vehicle: {
      year: 2019,
      make: 'Honda',
      model: 'Accord',
      drivetrain: 'FWD',
    },
    tax_year: summary.taxYear,
    totals: {
      total_miles: summary.totalMiles,
      business_miles: summary.businessMiles,
      commute_miles: summary.commuteMiles,
      personal_miles: summary.personalMiles,
      business_percentage: summary.businessPercentage / 100,
      standard_mileage_rate: summary.standardRatePerMile,
      mileage_deduction_usd: summary.mileageDeductionUsd,
      tolls_and_parking_usd: summary.tollsAndParkingUsd,
      total_vehicle_deduction_usd: summary.totalVehicleDeductionUsd,
    },
    trips_count: summary.trips.length,
    trips: summary.trips.map((t) => ({
      date: t.date,
      start_odometer: t.startOdometer,
      end_odometer: t.endOdometer,
      distance_miles: t.distanceMiles,
      category: t.category,
      destination: t.destination,
      business_purpose: t.businessPurpose,
      tolls_and_parking_usd: t.tollsAndParkingUsd,
      deductible_usd:
        t.category === 'BUSINESS'
          ? Math.round(((t.distanceMiles * summary.standardRatePerMile) + (t.tollsAndParkingUsd || 0)) * 100) / 100
          : 0,
      notes: t.notes || null,
    })),
  };

  return JSON.stringify(exportPayload, null, 2);
}
