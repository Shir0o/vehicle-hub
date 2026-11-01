import { describe, it } from 'node:test';
import assert from 'node:assert';
import { INITIAL_SERVICE_RECORDS, INITIAL_TRIPS, INITIAL_VEHICLE_PROFILE } from '../data/initialData';
import { calculateMaintenanceMinder } from './maintenanceMinder';
import {
  calculateAnnualTaxSummary,
  generateIrsMileageCsv,
  generateTaxHubExportJson,
  validateIrc274Compliance,
} from './irsCalculator';

describe('2019 Honda Accord Maintenance Minder Engine', () => {
  it('correctly calculates oil life and next service based on 58,620 mi last oil change', () => {
    const minder = calculateMaintenanceMinder(INITIAL_VEHICLE_PROFILE, INITIAL_SERVICE_RECORDS);

    // Current odometer is 62,100. Last oil was at 58,620.
    // Driven: 62,100 - 58,620 = 3,480 mi.
    // Interval: 5,000 mi. Next oil due: 58,620 + 5,000 = 63,620 mi.
    assert.strictEqual(minder.nextServiceOdometer, 63620);
    assert.strictEqual(minder.milesToNextService, 1520);
    assert.strictEqual(minder.oilLifePercentage, 30);
  });

  it('correctly detects overdue tire rotation (Sub-code 1) from 47,277 mi record', () => {
    const minder = calculateMaintenanceMinder(INITIAL_VEHICLE_PROFILE, INITIAL_SERVICE_RECORDS);
    const sub1 = minder.items.find((i) => i.code === '1');
    assert.ok(sub1);
    assert.strictEqual(sub1.status, 'OVERDUE');
    assert.ok(minder.activeSubCodes.includes('1'));
    assert.ok(minder.minderCodeDisplay.includes('1'));
  });

  it('marks Sub-code 6 (Rear differential) as NOT_APPLICABLE for FWD Accord', () => {
    const minder = calculateMaintenanceMinder(INITIAL_VEHICLE_PROFILE, INITIAL_SERVICE_RECORDS);
    const sub6 = minder.items.find((i) => i.code === '6');
    assert.ok(sub6);
    assert.strictEqual(sub6.status, 'NOT_APPLICABLE');
  });

  it('contains exactly the 6 pre-seeded records from Google Keep', () => {
    assert.strictEqual(INITIAL_SERVICE_RECORDS.length, 6);
    const odometers = INITIAL_SERVICE_RECORDS.map((r) => r.odometer);
    assert.ok(odometers.includes(4189));
    assert.ok(odometers.includes(41242));
    assert.ok(odometers.includes(47277));
    assert.ok(odometers.includes(47394));
    assert.ok(odometers.includes(58620));
    assert.ok(odometers.includes(62100));
  });
});

describe('IRC § 274 Mileage and Tax Summary Engine', () => {
  it('calculates 2026 tax year mileage summary and standard deduction', () => {
    const summary = calculateAnnualTaxSummary(INITIAL_TRIPS, 2026);
    assert.strictEqual(summary.taxYear, 2026);
    // 2026 business trips: 65 mi + 42 mi + 55 mi = 162 business miles
    assert.strictEqual(summary.businessMiles, 162);
    // Personal trip: 25 mi
    assert.strictEqual(summary.personalMiles, 25);
    assert.strictEqual(summary.totalMiles, 187);
    // 2026 standard rate is $0.70/mi -> 162 * 0.70 = $113.40
    assert.strictEqual(summary.standardRatePerMile, 0.70);
    assert.strictEqual(summary.mileageDeductionUsd, 113.40);
    // Tolls: $12.00 + $6.50 + $7.00 = $25.50
    assert.strictEqual(summary.tollsAndParkingUsd, 25.50);
    // Total vehicle deduction: 113.40 + 25.50 = $138.90
    assert.strictEqual(summary.totalVehicleDeductionUsd, 138.90);
  });

  it('validates IRC § 274 compliance for seed trips', () => {
    const summary = calculateAnnualTaxSummary(INITIAL_TRIPS, 2026);
    const compliance = validateIrc274Compliance(summary.trips);
    assert.strictEqual(compliance.complianceRate, 100);
    assert.strictEqual(compliance.nonCompliantCount, 0);
  });

  it('generates compliant CSV and Tax-Hub JSON exports', () => {
    const summary = calculateAnnualTaxSummary(INITIAL_TRIPS, 2026);
    const csv = generateIrsMileageCsv(summary);
    assert.ok(csv.includes('IRC § 274'));
    assert.ok(csv.includes('Date,Start Odometer,End Odometer,Distance (mi)'));

    const json = generateTaxHubExportJson(summary);
    const parsed = JSON.parse(json);
    assert.strictEqual(parsed.app, 'vehicle-hub');
    assert.strictEqual(parsed.tax_year, 2026);
    assert.strictEqual(parsed.totals.business_miles, 162);
  });
});
