// One-off seed importer. Reads seed data (embedded below) and inserts into Supabase.
// Run with: node scripts/seed.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars from .env manually (no dotenv dependency)
const envPath = join(__dirname, '..', '.env');
const envText = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const seedPath = join(__dirname, 'seed-data.json');
const seed = JSON.parse(readFileSync(seedPath, 'utf-8'));

const CURRENT_PATCH_TITLES = new Set([
  'Current Patch: Ranked/Standard Split (July 30, 2026)',
  'Current Patch: Soul Urn Rework',
  'Current Patch: Unstable Rift',
]);

async function main() {
  console.log(`Seeding ${seed.tips.length} tips...`);
  const tipsRows = seed.tips.map((t) => ({
    text: t.text,
    category: t.category,
    hero: t.hero ?? null,
    source: t.source ?? null,
    status: t.status,
  }));

  // Insert in batches to keep payload sizes reasonable
  const batchSize = 25;
  for (let i = 0; i < tipsRows.length; i += batchSize) {
    const batch = tipsRows.slice(i, i + batchSize);
    const { error } = await supabase.from('tips').insert(batch);
    if (error) throw new Error(`tips insert failed at batch ${i}: ${error.message}`);
    console.log(`  inserted tips ${i + 1}-${i + batch.length}`);
  }

  console.log(`Seeding ${seed.reading.length} reading entries...`);
  const readingRows = seed.reading.map((r) => ({
    title: r.title,
    body: r.body,
    is_current_patch: CURRENT_PATCH_TITLES.has(r.title),
  }));
  const { error: readingError } = await supabase.from('reading').insert(readingRows);
  if (readingError) throw new Error(`reading insert failed: ${readingError.message}`);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
