import {
  HondaMainCode,
  HondaSubCode,
  MaintenanceMinderState,
  MinderItemStatus,
  MinderStatus,
  ServiceRecord,
  VehicleProfile,
} from '../types/vehicle';

export function calculateMaintenanceMinder(
  profile: VehicleProfile,
  services: ServiceRecord[]
): MaintenanceMinderState {
  const currentOdo = profile.currentOdometer;
  const now = new Date(profile.lastOdometerUpdateDate || new Date().toISOString());

  // Sort services descending by date, then odometer to always get the most recent service first
  const sortedServices = [...services].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.odometer - a.odometer;
  });

  // 1. Find last Oil Change
  const oilRecords = sortedServices.filter((s) =>
    s.services.includes('OIL_CHANGE') ||
    s.minderCodes?.includes('A') ||
    s.minderCodes?.includes('B')
  );
  const lastOil = oilRecords[0]; // Assuming sorted descending by date/odo
  const lastOilOdo = lastOil ? lastOil.odometer : 0;
  const oilInterval = profile.oilChangeIntervalMiles || 5000;
  const milesSinceOil = Math.max(0, currentOdo - lastOilOdo);
  const milesToOil = Math.max(0, oilInterval - milesSinceOil);
  const oilLifePercentage = Math.max(
    0,
    Math.min(100, Math.round(((oilInterval - milesSinceOil) / oilInterval) * 100))
  );

  // Determine Main Code (A vs B): if last was B, next is A; if last was A, next is B
  const lastWasB = lastOil?.minderCodes?.includes('B') ||
    lastOil?.services.includes('MULTI_POINT_INSPECTION') ||
    lastOil?.services.includes('ENGINE_FILTER');
  const activeMainCode: HondaMainCode = lastWasB ? 'A' : 'B';

  const items: MinderItemStatus[] = [];

  // Main Code Item
  let oilStatus: MinderStatus = 'OK';
  let oilUrgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (oilLifePercentage <= 0) {
    oilStatus = 'OVERDUE';
    oilUrgency = 'critical';
  } else if (oilLifePercentage <= 15) {
    oilStatus = 'DUE';
    oilUrgency = 'high';
  } else if (oilLifePercentage <= 30) {
    oilStatus = 'UPCOMING';
    oilUrgency = 'medium';
  }

  items.push({
    code: activeMainCode,
    title: activeMainCode === 'A' ? 'Main Code A: Engine Oil Change' : 'Main Code B: Engine Oil & Filter + Inspection',
    description:
      activeMainCode === 'A'
        ? 'Replace engine oil (Honda Genuine 0W-20 Full Synthetic).'
        : 'Replace engine oil and filter. Thoroughly inspect brakes, steering, suspension, exhaust, and fluid levels.',
    lastServiceOdometer: lastOilOdo || undefined,
    lastServiceDate: lastOil?.date,
    intervalMiles: oilInterval,
    nextDueOdometer: lastOilOdo + oilInterval,
    milesRemaining: milesToOil,
    percentageRemaining: oilLifePercentage,
    status: oilStatus,
    urgency: oilUrgency,
  });

  // Sub-code 1: Tire Rotation
  const tireRecords = sortedServices.filter((s) =>
    s.services.includes('TIRE_ROTATION') ||
    s.services.includes('TIRE_SERVICE') ||
    s.minderCodes?.includes('1')
  );
  const lastTire = tireRecords[0];
  const lastTireOdo = lastTire ? lastTire.odometer : 0;
  const tireInterval = profile.tireRotationIntervalMiles || 5000;
  const milesSinceTire = Math.max(0, currentOdo - lastTireOdo);
  const tireMilesRemaining = tireInterval - milesSinceTire;
  const tirePct = Math.max(0, Math.min(100, Math.round((tireMilesRemaining / tireInterval) * 100)));

  let tireStatus: MinderStatus = 'OK';
  let tireUrgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (tireMilesRemaining < 0) {
    tireStatus = 'OVERDUE';
    tireUrgency = 'critical';
  } else if (tireMilesRemaining <= 500) {
    tireStatus = 'DUE';
    tireUrgency = 'high';
  } else if (tireMilesRemaining <= 1500) {
    tireStatus = 'UPCOMING';
    tireUrgency = 'medium';
  }

  items.push({
    code: '1',
    title: 'Sub-code 1: Tire Rotation & Pressure Check',
    description: 'Rotate front and rear tires, check tread depth, inspect wear pattern and set cold tire pressures.',
    lastServiceOdometer: lastTireOdo || undefined,
    lastServiceDate: lastTire?.date,
    intervalMiles: tireInterval,
    nextDueOdometer: lastTireOdo + tireInterval,
    milesRemaining: tireMilesRemaining,
    percentageRemaining: tirePct,
    status: tireStatus,
    urgency: tireUrgency,
  });

  // Sub-code 2: Air Cleaner & Cabin Filter
  const filterRecords = sortedServices.filter((s) =>
    s.services.includes('ENGINE_FILTER') ||
    s.services.includes('CABIN_FILTER') ||
    s.minderCodes?.includes('2')
  );
  const lastFilter = filterRecords[0];
  const lastFilterOdo = lastFilter ? lastFilter.odometer : 0;
  const filterInterval = profile.engineAndCabinFilterIntervalMiles || 15000;
  const milesSinceFilter = Math.max(0, currentOdo - lastFilterOdo);
  const filterMilesRemaining = filterInterval - milesSinceFilter;
  const filterPct = Math.max(0, Math.min(100, Math.round((filterMilesRemaining / filterInterval) * 100)));

  let filterStatus: MinderStatus = 'OK';
  let filterUrgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (filterMilesRemaining < 0) {
    filterStatus = 'OVERDUE';
    filterUrgency = 'critical';
  } else if (filterMilesRemaining <= 1000) {
    filterStatus = 'DUE';
    filterUrgency = 'high';
  } else if (filterMilesRemaining <= 3000) {
    filterStatus = 'UPCOMING';
    filterUrgency = 'medium';
  }

  items.push({
    code: '2',
    title: 'Sub-code 2: Engine & Cabin Air Filters',
    description: 'Replace engine air cleaner element and dust/pollen cabin air filter. Check drive belt condition.',
    lastServiceOdometer: lastFilterOdo || undefined,
    lastServiceDate: lastFilter?.date,
    intervalMiles: filterInterval,
    nextDueOdometer: lastFilterOdo + filterInterval,
    milesRemaining: filterMilesRemaining,
    percentageRemaining: filterPct,
    status: filterStatus,
    urgency: filterUrgency,
  });

  // Sub-code 3: Transmission Fluid
  const transRecords = sortedServices.filter((s) =>
    s.services.includes('TRANSMISSION_SERVICE') ||
    s.minderCodes?.includes('3')
  );
  const lastTrans = transRecords[0];
  const lastTransOdo = lastTrans ? lastTrans.odometer : 0;
  const transInterval = profile.transmissionFluidIntervalMiles || 30000;
  const milesSinceTrans = Math.max(0, currentOdo - lastTransOdo);
  const transMilesRemaining = transInterval - milesSinceTrans;
  const transPct = Math.max(0, Math.min(100, Math.round((transMilesRemaining / transInterval) * 100)));

  let transStatus: MinderStatus = 'OK';
  let transUrgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (transMilesRemaining < 0) {
    transStatus = 'OVERDUE';
    transUrgency = 'critical';
  } else if (transMilesRemaining <= 1500) {
    transStatus = 'DUE';
    transUrgency = 'high';
  } else if (transMilesRemaining <= 4000) {
    transStatus = 'UPCOMING';
    transUrgency = 'medium';
  }

  items.push({
    code: '3',
    title: 'Sub-code 3: Transmission Fluid Service',
    description: 'Drain and refill Honda HCF-2 (CVT) or Honda ATF-Type 2.0 (10-speed automatic) transmission fluid.',
    lastServiceOdometer: lastTransOdo || undefined,
    lastServiceDate: lastTrans?.date,
    intervalMiles: transInterval,
    nextDueOdometer: lastTransOdo + transInterval,
    milesRemaining: transMilesRemaining,
    percentageRemaining: transPct,
    status: transStatus,
    urgency: transUrgency,
  });

  // Sub-code 4: Spark Plugs & Valve Clearance
  const sparkRecords = sortedServices.filter((s) =>
    s.services.includes('SPARK_PLUGS') ||
    s.minderCodes?.includes('4')
  );
  const lastSpark = sparkRecords[0];
  const lastSparkOdo = lastSpark ? lastSpark.odometer : 0;
  const sparkInterval = profile.sparkPlugsIntervalMiles || 100000;
  const milesSinceSpark = Math.max(0, currentOdo - lastSparkOdo);
  const sparkMilesRemaining = sparkInterval - milesSinceSpark;
  const sparkPct = Math.max(0, Math.min(100, Math.round((sparkMilesRemaining / sparkInterval) * 100)));

  let sparkStatus: MinderStatus = 'OK';
  let sparkUrgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (sparkMilesRemaining < 0) {
    sparkStatus = 'OVERDUE';
    sparkUrgency = 'critical';
  } else if (sparkMilesRemaining <= 3000) {
    sparkStatus = 'DUE';
    sparkUrgency = 'high';
  } else if (sparkMilesRemaining <= 8000) {
    sparkStatus = 'UPCOMING';
    sparkUrgency = 'medium';
  }

  items.push({
    code: '4',
    title: 'Sub-code 4: Spark Plugs & Valve Clearance',
    description: 'Replace Iridium spark plugs and inspect valve clearance (adjust if noisy/out of spec).',
    lastServiceOdometer: lastSparkOdo || undefined,
    lastServiceDate: lastSpark?.date,
    intervalMiles: sparkInterval,
    nextDueOdometer: lastSparkOdo + sparkInterval,
    milesRemaining: sparkMilesRemaining,
    percentageRemaining: sparkPct,
    status: sparkStatus,
    urgency: sparkUrgency,
  });

  // Sub-code 5: Engine Coolant
  const coolantRecords = sortedServices.filter((s) =>
    s.services.includes('COOLANT_SERVICE') ||
    s.minderCodes?.includes('5')
  );
  const lastCoolant = coolantRecords[0];
  const lastCoolantOdo = lastCoolant ? lastCoolant.odometer : 0;
  const coolantInterval = profile.coolantIntervalMiles || 100000;
  const milesSinceCoolant = Math.max(0, currentOdo - lastCoolantOdo);
  const coolantMilesRemaining = coolantInterval - milesSinceCoolant;
  const coolantPct = Math.max(0, Math.min(100, Math.round((coolantMilesRemaining / coolantInterval) * 100)));

  let coolantStatus: MinderStatus = 'OK';
  let coolantUrgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (coolantMilesRemaining < 0) {
    coolantStatus = 'OVERDUE';
    coolantUrgency = 'critical';
  } else if (coolantMilesRemaining <= 3000) {
    coolantStatus = 'DUE';
    coolantUrgency = 'high';
  } else if (coolantMilesRemaining <= 8000) {
    coolantStatus = 'UPCOMING';
    coolantUrgency = 'medium';
  }

  items.push({
    code: '5',
    title: 'Sub-code 5: Engine Coolant Replacement',
    description: 'Replace engine coolant with Honda Long Life Antifreeze/Coolant Type 2 (100k mi or 10 years).',
    lastServiceOdometer: lastCoolantOdo || undefined,
    lastServiceDate: lastCoolant?.date,
    intervalMiles: coolantInterval,
    nextDueOdometer: lastCoolantOdo + coolantInterval,
    milesRemaining: coolantMilesRemaining,
    percentageRemaining: coolantPct,
    status: coolantStatus,
    urgency: coolantUrgency,
  });

  // Sub-code 6: Rear Differential Fluid (AWD only)
  if (profile.drivetrain === 'AWD') {
    items.push({
      code: '6',
      title: 'Sub-code 6: Rear Differential Fluid',
      description: 'Replace rear differential fluid (Honda Dual Pump Fluid II).',
      percentageRemaining: 100,
      status: 'OK',
      urgency: 'low',
    });
  } else {
    items.push({
      code: '6',
      title: 'Sub-code 6: Rear Differential Fluid (AWD Only)',
      description: 'Not applicable to front-wheel drive (FWD) 2019 Honda Accord.',
      percentageRemaining: 100,
      status: 'NOT_APPLICABLE',
      urgency: 'low',
    });
  }

  // Time-based Item 1: Brake Fluid (Every 36 months)
  const brakeFluidRecords = sortedServices.filter((s) =>
    s.services.includes('BRAKE_FLUID') ||
    s.services.includes('BRAKE_PADS') ||
    s.services.includes('BRAKE_CALIPERS')
  );
  const lastBrake = brakeFluidRecords[0];
  const lastBrakeDate = lastBrake ? new Date(lastBrake.date) : new Date(2019, 5, 1);
  const brakeDueTime = new Date(lastBrakeDate);
  brakeDueTime.setMonth(brakeDueTime.getMonth() + (profile.brakeFluidIntervalMonths || 36));
  const daysUntilBrake = Math.round((brakeDueTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const brakeTotalDays = (profile.brakeFluidIntervalMonths || 36) * 30.4;
  const brakePct = Math.max(0, Math.min(100, Math.round((daysUntilBrake / brakeTotalDays) * 100)));

  let brakeStatus: MinderStatus = 'OK';
  let brakeUrgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (daysUntilBrake < 0) {
    brakeStatus = 'OVERDUE';
    brakeUrgency = 'critical';
  } else if (daysUntilBrake <= 45) {
    brakeStatus = 'DUE';
    brakeUrgency = 'high';
  } else if (daysUntilBrake <= 90) {
    brakeStatus = 'UPCOMING';
    brakeUrgency = 'medium';
  }

  items.push({
    code: 'BF',
    title: 'Time-Based: Brake Fluid Flush',
    description: 'Replace Honda Heavy Duty Brake Fluid DOT 3 every 36 months regardless of mileage.',
    lastServiceDate: lastBrake?.date || 'Factory fill',
    intervalMonths: profile.brakeFluidIntervalMonths || 36,
    nextDueDate: brakeDueTime.toISOString().split('T')[0],
    daysRemaining: daysUntilBrake,
    percentageRemaining: brakePct,
    status: brakeStatus,
    urgency: brakeUrgency,
  });

  // Time-based Item 2: Wheel Alignment (Annually / 12 months)
  const alignRecords = sortedServices.filter((s) => s.services.includes('WHEEL_ALIGNMENT'));
  const lastAlign = alignRecords[0];
  const lastAlignDate = lastAlign ? new Date(lastAlign.date) : new Date(2019, 5, 1);
  const alignDueTime = new Date(lastAlignDate);
  alignDueTime.setMonth(alignDueTime.getMonth() + (profile.alignmentIntervalMonths || 12));
  const daysUntilAlign = Math.round((alignDueTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const alignTotalDays = (profile.alignmentIntervalMonths || 12) * 30.4;
  const alignPct = Math.max(0, Math.min(100, Math.round((daysUntilAlign / alignTotalDays) * 100)));

  let alignStatus: MinderStatus = 'OK';
  let alignUrgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (daysUntilAlign < 0) {
    alignStatus = 'OVERDUE';
    alignUrgency = 'high';
  } else if (daysUntilAlign <= 30) {
    alignStatus = 'DUE';
    alignUrgency = 'medium';
  } else if (daysUntilAlign <= 60) {
    alignStatus = 'UPCOMING';
    alignUrgency = 'low';
  }

  items.push({
    code: 'AL',
    title: 'Inspection: 4-Wheel Alignment',
    description: 'Check camber, caster, toe-in and suspension geometry annually or when replacing tires.',
    lastServiceOdometer: lastAlign?.odometer,
    lastServiceDate: lastAlign?.date,
    intervalMonths: profile.alignmentIntervalMonths || 12,
    nextDueDate: alignDueTime.toISOString().split('T')[0],
    daysRemaining: daysUntilAlign,
    percentageRemaining: alignPct,
    status: alignStatus,
    urgency: alignUrgency,
  });

  // Active Sub-Codes: find numeric sub-codes that are DUE or OVERDUE (or UPCOMING if oil is due)
  const activeSubCodes: HondaSubCode[] = [];
  for (const item of items) {
    if (['1', '2', '3', '4', '5'].includes(item.code)) {
      if (item.status === 'OVERDUE' || item.status === 'DUE') {
        activeSubCodes.push(item.code as HondaSubCode);
      } else if (oilLifePercentage <= 15 && item.status === 'UPCOMING') {
        activeSubCodes.push(item.code as HondaSubCode);
      }
    }
  }

  // Construct Minder code display: e.g. "A1", "B12"
  const minderCodeDisplay = `${activeMainCode}${activeSubCodes.join('')}`;

  // Overall status
  let overallStatus: MinderStatus = 'OK';
  if (items.some((i) => i.status === 'OVERDUE')) {
    overallStatus = 'OVERDUE';
  } else if (items.some((i) => i.status === 'DUE')) {
    overallStatus = 'DUE';
  } else if (items.some((i) => i.status === 'UPCOMING') || oilLifePercentage <= 30) {
    overallStatus = 'UPCOMING';
  }

  const nextServiceOdometer = lastOilOdo + oilInterval;
  const milesToNextService = Math.max(0, nextServiceOdometer - currentOdo);

  return {
    oilLifePercentage,
    activeMainCode,
    activeSubCodes,
    minderCodeDisplay,
    overallStatus,
    items,
    nextServiceOdometer,
    milesToNextService,
  };
}
