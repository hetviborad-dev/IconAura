import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envText = readFileSync(path.join(root, '.env'), 'utf8');
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => line.split('=').map((part, index) => (index === 0 ? part.trim() : part.trim())))
    .filter(parts => parts.length === 2)
    .map(([key, value]) => [key, value])
);

const supabaseUrl = env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

const headers = {
  apikey: serviceRoleKey,
  authorization: `Bearer ${serviceRoleKey}`,
  'content-type': 'application/json',
};

async function request(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return data;
}

const normalizeWallpaper = (input) => {
  if (typeof input === 'string') return { url: input };
  const preview = (input?.preview || '').replace(',e_blur:300', '');
  return { url: input?.url, preview: preview || undefined };
};

async function main() {
  const themes = await request('/themes?select=id,config&is_public=eq.true');
  const wallpaperRows = (await request('/wallpapers?select=id,url,preview_url')) || [];
  const byUrl = new Map(wallpaperRows.map(row => [row.url, row]));

  const assignments = [];

  for (const theme of themes) {
    const config = typeof theme.config === 'string' ? JSON.parse(theme.config) : theme.config || {};
    const wallpapers = (config.wallpapers || []).map(normalizeWallpaper).filter(item => item.url);

    for (const wallpaper of wallpapers) {
      let row = byUrl.get(wallpaper.url);
      if (!row) {
        const inserted = await request('/wallpapers', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify([{ url: wallpaper.url, preview_url: wallpaper.preview || null }]),
        });
        row = inserted[0];
        byUrl.set(wallpaper.url, row);
      }

      assignments.push({ theme_id: theme.id, wallpaper_id: row.id });
    }
  }

  for (const assignment of assignments) {
    try {
      await request('/theme_wallpapers', {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates' },
        body: JSON.stringify([assignment]),
      });
    } catch (error) {
      if (!String(error.message).includes('duplicate')) throw error;
    }
  }

  console.log(`Backfilled ${assignments.length} wallpaper assignments.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
