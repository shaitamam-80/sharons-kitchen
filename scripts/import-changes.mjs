/**
 * Import recipe changes exported from the app.
 * Usage: node scripts/import-changes.mjs <path-to-changes-json>
 *
 * The JSON file is exported by tapping "שלח שינויים" in the app header.
 * It contains instructions and notes edits made on a device.
 * This script applies those edits directly to src/data/recipes.ts.
 */
import { readFileSync, writeFileSync } from 'fs';

const changesFile = process.argv[2];
if (!changesFile) {
  console.error('Usage: node scripts/import-changes.mjs <changes-file.json>');
  process.exit(1);
}

const RECIPES_TS = 'C:/Users/shait/sharons-kitchen/src/data/recipes.ts';

const { changes, exportedAt, device, changesCount } = JSON.parse(readFileSync(changesFile, 'utf-8'));
console.log(`Importing ${changesCount} changes from ${device} (exported ${exportedAt})\n`);

let recipesTs = readFileSync(RECIPES_TS, 'utf-8');
let updatedCount = 0;

for (const change of changes) {
  const { id, name, instructions, notes } = change;

  if (instructions !== undefined && instructions.length > 0) {
    // Replace instructions for this recipe ID
    const pattern = new RegExp(`(id:\\s*${id},[\\s\\S]*?instructions:\\s*)"([^"]*)"`)
    const match = recipesTs.match(pattern);
    if (match) {
      const escaped = instructions.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      recipesTs = recipesTs.replace(pattern, `$1"${escaped}"`);
      console.log(`  [${id}] ${name}: instructions updated`);
      updatedCount++;
    } else {
      console.log(`  [${id}] ${name}: WARNING - could not find instructions field`);
    }
  }

  if (notes !== undefined && notes.length > 0) {
    const pattern = new RegExp(`(id:\\s*${id},[\\s\\S]*?notes:\\s*)"([^"]*)"`)
    const match = recipesTs.match(pattern);
    if (match) {
      const escaped = notes.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      recipesTs = recipesTs.replace(pattern, `$1"${escaped}"`);
      console.log(`  [${id}] ${name}: notes updated`);
      updatedCount++;
    } else {
      console.log(`  [${id}] ${name}: WARNING - could not find notes field`);
    }
  }
}

writeFileSync(RECIPES_TS, recipesTs);
console.log(`\nDone! ${updatedCount} fields updated in recipes.ts`);
console.log('Run "npm run build" to verify, then "git add -A && git commit && git push"');
