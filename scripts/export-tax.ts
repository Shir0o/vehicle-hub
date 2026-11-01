import { INITIAL_TRIPS } from '../src/data/initialData';
import { calculateAnnualTaxSummary, generateTaxHubExportJson } from '../src/engine/irsCalculator';

function parseArgs(): { year: number } {
  const args = process.argv.slice(2);
  let year = new Date().getFullYear();
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--year' && args[i + 1]) {
      year = parseInt(args[i + 1], 10);
    }
  }
  return { year };
}

const { year } = parseArgs();
const summary = calculateAnnualTaxSummary(INITIAL_TRIPS, year);
const output = generateTaxHubExportJson(summary);

console.log(output);
