# Vehicle Hub

Mobile-first PWA for 2019 Honda Accord (10th Generation) algorithmic Maintenance Minder tracking and IRC § 274 contemporaneous business mileage logging.

## Features

1. **2019 Honda Accord Maintenance Minder Engine**:
   - Factory Main codes (A: Oil change, B: Oil & filter + inspection) and Sub-codes (1: Tire rotation, 2: Air filters, 3: Transmission fluid, 4: Spark plugs, 5: Coolant, 6: Rear differential [FWD N/A]).
   - Time-based items: 36-month brake fluid flush, annual alignment check.
   - Oil Life gauge with service due alert (e.g. Next oil due at 63,620 mi).
   - Pre-seeded with 6 Google Keep maintenance records (including tire service, alignment, transmission, multipoint inspection, and AC condenser warranty bulletin repair).

2. **IRC § 274 Statutory Mileage Logging**:
   - Contemporaneous start/end odometer entries, auto-calculated distances.
   - Classification: `BUSINESS`, `COMMUTE`, `PERSONAL`.
   - Explicit Business Purpose presets for IRS audit compliance.
   - Tolls & Parking out-of-pocket tracking (100% deductible).

3. **IRS Form 1040 Schedule C Mileage Summary & Tax-Hub Export**:
   - Annual breakdown (2024, 2025, 2026) with IRS standard rates ($0.67 for 2024–2025, $0.70 for 2026).
   - Standard mileage deduction + parking/tolls totals.
   - One-click CSV export, print-ready audit ledger, and JSON export schema consumable by `tax-hub`.
   - CLI export command: `npm run export-tax -- --year 2025`.

## Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run targeted unit tests
npm test

# Typecheck and build
npm run build
```
