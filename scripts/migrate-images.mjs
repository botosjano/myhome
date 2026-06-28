// One-off migration: move base64 data-URL images stored in properties.images[]
// into the public `property-images` Supabase Storage bucket, and replace each
// with its permanent public URL. Idempotent — http(s) URLs are left untouched.
//
// Run from the project root with the portable node:
//   node scripts/migrate-images.mjs
//
// Safe to delete after a successful run.

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

// supabase-js eagerly constructs a realtime client which needs a WebSocket ctor
// on Node < 22. We never use realtime here, so a dummy satisfies the check.
globalThis.WebSocket = globalThis.WebSocket || class {};

// ── Load .env.local (simple KEY=VALUE parser) ──
const env = {};
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secret = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secret) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const BUCKET = 'property-images';
const EXT = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };

const db = createClient(url, secret, { auth: { persistSession: false } });

async function uploadDataUrl(dataUrl) {
  const m = dataUrl.match(/^data:([^;]+);base64,(.*)$/s);
  if (!m) throw new Error('Not a base64 data URL');
  const contentType = m[1];
  const buffer = Buffer.from(m[2], 'base64');
  const ext = EXT[contentType] ?? 'webp';
  const path = `properties/${randomUUID()}.${ext}`;
  const { error } = await db.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

const { data: rows, error } = await db
  .from('properties')
  .select('id, reference_number, images');
if (error) {
  console.error('Fetch failed:', error.message);
  process.exit(1);
}

let migratedProps = 0;
let migratedImgs = 0;

for (const row of rows ?? []) {
  const images = Array.isArray(row.images) ? row.images : [];
  const dataUrls = images.filter((s) => typeof s === 'string' && s.startsWith('data:'));
  if (dataUrls.length === 0) {
    console.log(`${row.reference_number}: ${images.length} kép, mind URL — kihagyva.`);
    continue;
  }

  const next = [];
  for (const img of images) {
    if (typeof img === 'string' && img.startsWith('data:')) {
      const publicUrl = await uploadDataUrl(img);
      next.push(publicUrl);
      migratedImgs++;
      process.stdout.write('.');
    } else {
      next.push(img);
    }
  }

  const { error: upErr } = await db.from('properties').update({ images: next }).eq('id', row.id);
  if (upErr) {
    console.error(`\n${row.reference_number}: DB update failed:`, upErr.message);
    process.exit(1);
  }
  migratedProps++;
  console.log(`\n${row.reference_number}: ${dataUrls.length} kép áthelyezve Storage-ba.`);
}

console.log(`\nKész. ${migratedProps} ingatlan, ${migratedImgs} kép migrálva.`);
