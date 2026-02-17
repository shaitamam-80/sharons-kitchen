import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SCRIPTS_DIR = 'C:/Users/shait/sharons-kitchen/scripts';
const RECIPES_TS = 'C:/Users/shait/sharons-kitchen/src/data/recipes.ts';

// Read all batch files
const batchFiles = readdirSync(SCRIPTS_DIR)
  .filter(f => f.startsWith('batch-') && f.endsWith('.json'))
  .sort();

console.log(`Found ${batchFiles.length} batch files`);

let allImageResults = [];
for (const file of batchFiles) {
  const data = JSON.parse(readFileSync(join(SCRIPTS_DIR, file), 'utf-8'));
  allImageResults.push(...data);
  console.log(`  ${file}: ${data.length} images, ${data.reduce((sum, img) => sum + (img.recipes?.length || 0), 0)} recipes`);
}

// Separate existing matches from new recipes
const existingUpdates = new Map(); // id -> best update data
const newRecipes = []; // all new recipes

for (const img of allImageResults) {
  if (img.unreadable) continue;
  for (const recipe of (img.recipes || [])) {
    if (recipe.matchesExistingId != null) {
      const id = recipe.matchesExistingId;
      const existing = existingUpdates.get(id);
      // Keep the version with more info (longer instructions)
      if (!existing || (recipe.instructions || '').length > (existing.instructions || '').length) {
        existingUpdates.set(id, recipe);
      }
    } else {
      // Skip low-confidence unidentified entries
      if (recipe.confidence === 'low' && (!recipe.name || recipe.name.includes('לא ברור') || recipe.name.includes('חלקי'))) {
        continue;
      }
      newRecipes.push({ ...recipe, fromImage: img.image });
    }
  }
}

console.log(`\nExisting recipe updates: ${existingUpdates.size}`);
for (const [id, r] of existingUpdates) {
  console.log(`  ID ${id}: ${r.name} - instructions: ${(r.instructions || '').length > 0 ? 'YES' : 'no'}, notes: ${(r.notes || '').length > 0 ? 'YES' : 'no'}, temp: ${r.temp || '-'}, time: ${r.time || '-'}`);
}

// Deduplicate new recipes by normalized name
function normalizeName(name) {
  return name
    .replace(/[()\/\-\s]+/g, ' ')
    .replace(/גרסה [אב]/g, '')
    .replace(/המשך/g, '')
    .replace(/מס' \d+/g, '')
    .trim();
}

const deduped = new Map();
for (const r of newRecipes) {
  const key = normalizeName(r.name);
  const existing = deduped.get(key);
  if (!existing) {
    deduped.set(key, r);
  } else {
    // Keep version with more ingredients or longer instructions
    const scoreNew = (r.ingredients?.length || 0) + (r.instructions?.length || 0);
    const scoreOld = (existing.ingredients?.length || 0) + (existing.instructions?.length || 0);
    if (scoreNew > scoreOld) {
      deduped.set(key, r);
    }
  }
}

console.log(`\nNew recipes (after dedup): ${deduped.size}`);
for (const [key, r] of deduped) {
  console.log(`  [${r.category}] ${r.name} (confidence: ${r.confidence})`);
}

// Read current recipes.ts to parse existing recipes
const recipesTs = readFileSync(RECIPES_TS, 'utf-8');

// Apply updates to existing recipes
let updatedTs = recipesTs;
for (const [id, update] of existingUpdates) {
  // Find the recipe block by id
  const idPattern = new RegExp(`(id:\\s*${id},\\s*name:)`, 'g');
  if (!idPattern.test(updatedTs)) {
    console.log(`  WARNING: Could not find recipe ID ${id} in recipes.ts`);
    continue;
  }

  // Update instructions if currently empty and we have new ones
  if (update.instructions && update.instructions.length > 5) {
    const instrPattern = new RegExp(
      `(id:\\s*${id},[\\s\\S]*?instructions:\\s*)"()"`,
    );
    const match = updatedTs.match(instrPattern);
    if (match) {
      const escaped = update.instructions
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n');
      updatedTs = updatedTs.replace(instrPattern, `$1"${escaped}"`);
      console.log(`  Updated instructions for ID ${id}`);
    }
  }

  // Update notes if currently empty
  if (update.notes && update.notes.length > 3) {
    const notesPattern = new RegExp(
      `(id:\\s*${id},[\\s\\S]*?notes:\\s*)"()"`,
    );
    const match = updatedTs.match(notesPattern);
    if (match) {
      const escaped = update.notes
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n');
      updatedTs = updatedTs.replace(notesPattern, `$1"${escaped}"`);
      console.log(`  Updated notes for ID ${id}`);
    }
  }

  // Update temp if currently empty
  if (update.temp && update.temp.length > 0) {
    const tempPattern = new RegExp(
      `(id:\\s*${id},[\\s\\S]*?temp:\\s*)"()"`,
    );
    if (tempPattern.test(updatedTs)) {
      const cleanTemp = update.temp.replace(/[°C]/g, '').trim();
      updatedTs = updatedTs.replace(tempPattern, `$1"${cleanTemp}"`);
      console.log(`  Updated temp for ID ${id}`);
    }
  }

  // Update time if currently empty
  if (update.time && update.time.length > 0) {
    const timePattern = new RegExp(
      `(id:\\s*${id},[\\s\\S]*?time:\\s*)"()"`,
    );
    if (timePattern.test(updatedTs)) {
      updatedTs = updatedTs.replace(timePattern, `$1"${update.time}"`);
      console.log(`  Updated time for ID ${id}`);
    }
  }
}

// Add new recipes at the end before the closing bracket
let nextId = 66;
const newRecipeLines = [];
for (const [key, r] of deduped) {
  const ingredients = (r.ingredients || [])
    .map(i => `"${i.replace(/"/g, '\\"')}"`)
    .join(', ');

  const instructions = (r.instructions || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');

  const notes = (r.notes || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');

  const source = (r.source || '')
    .replace(/"/g, '\\"');

  const temp = (r.temp || '').replace(/[°C]/g, '').trim();
  const time = (r.time || '').trim();

  const line = `  {
    id: ${nextId}, name: "${r.name.replace(/"/g, '\\"')}", ${source ? `source: "${source}", ` : ''}category: "${r.category}",
    ingredients: [${ingredients}],
    temp: "${temp}", time: "${time}", instructions: "${instructions}", notes: "${notes}"
  },`;

  newRecipeLines.push(line);
  nextId++;
}

if (newRecipeLines.length > 0) {
  // Find the closing bracket of the recipes array
  const closingIndex = updatedTs.lastIndexOf(']');
  const beforeClosing = updatedTs.substring(0, closingIndex);
  const afterClosing = updatedTs.substring(closingIndex);

  const newSection = `\n  // ===== מתכונים חדשים מהמחברת =====\n${newRecipeLines.join('\n')}\n`;
  updatedTs = beforeClosing + newSection + afterClosing;
}

writeFileSync(RECIPES_TS, updatedTs);
console.log(`\nDone! Updated recipes.ts with ${existingUpdates.size} updates and ${deduped.size} new recipes.`);
console.log(`Total recipes now: ${65 + deduped.size}`);
