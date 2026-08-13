// One-off backup of tips/heroes before the Old Gods restructure migration.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
const envText = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const { data: tips, error: tipsError } = await supabase.from('tips').select('*');
if (tipsError) throw tipsError;
const { data: heroes, error: heroesError } = await supabase.from('heroes').select('*');
if (heroesError) throw heroesError;
const { data: log, error: logError } = await supabase.from('performance_log').select('*');
if (logError) throw logError;
const { data: logTips, error: logTipsError } = await supabase.from('performance_log_tips').select('*');
if (logTipsError) throw logTipsError;

const backup = { tips, heroes, performance_log: log, performance_log_tips: logTips, backed_up_at: new Date().toISOString() };
const outPath = join(__dirname, 'backups', `pre-old-gods-migration-${Date.now()}.json`);
writeFileSync(outPath, JSON.stringify(backup, null, 2));
console.log(`Backed up ${tips.length} tips, ${heroes.length} heroes, ${log.length} log entries, ${logTips.length} log tags to ${outPath}`);
