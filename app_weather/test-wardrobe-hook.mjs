import { buildQuery } from './src/wardrobe.js';

const ITEMS = ['hat', 'shirt', 'pants', 'shoes'];

const tests = [
  {
    label: 'Tel Aviv summer, user wants "short"',
    weather: { temperature: 28, condition: 'clear' },
    preference: 'short',
    expectedBand: 'warm',
  },
  {
    label: 'London winter, user wants "formal"',
    weather: { temperature: 4, condition: 'rain' },
    preference: 'formal',
    expectedBand: 'cold',
  },
  {
    label: 'Moscow snow, user wants "casual"',
    weather: { temperature: -8, condition: 'snow' },
    preference: 'casual',
    expectedBand: 'freezing',
  },
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  console.log(`\nTest: ${test.label}`);
  for (const item of ITEMS) {
    const result = buildQuery(test.weather, test.preference, item);
    const hasPreference = result.query.includes(test.preference);
    const hasItem = result.query.includes(item);
    const correctBand = result.band === test.expectedBand;

    if (hasPreference && hasItem && correctBand) {
      console.log(`  ✅ ${item}: "${result.query}"`);
      passed++;
    } else {
      console.log(`  ❌ ${item}: "${result.query}"`);
      failed++;
    }
  }
}

console.log(`\n--- ${passed} passed, ${failed} failed ---`);
if (failed > 0) {
  console.error('Hook blocked: fix wardrobe.js before continuing.');
  process.exit(1);
}