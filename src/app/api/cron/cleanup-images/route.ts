import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Scheduled cleanup of orphaned property images.
 *
 * An "orphan" is a file in the `property-images` bucket that no property's
 * images[] references. Images are uploaded the moment they're added to the admin
 * form (before the property is saved), so an abandoned edit leaves files behind.
 * This route deletes any bucket file that is BOTH:
 *   1. older than ORPHAN_TTL (72h) — a grace window so a freshly uploaded photo
 *      being worked on right now is never touched, and
 *   2. not referenced by any property row.
 *
 * Triggered by Vercel Cron (see vercel.json). Vercel adds an
 * `Authorization: Bearer ${CRON_SECRET}` header to scheduled requests, which we
 * verify. Append `?dry=1` (with the same auth) to preview without deleting.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'property-images';
const PREFIX = 'properties';
const ORPHAN_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours
const PAGE = 100;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // No secret configured → allow (Vercel Cron still works); set CRON_SECRET to lock it down.
  if (!secret) return true;
  const header = request.headers.get('authorization') ?? '';
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const db = supabaseAdmin;
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  }

  const dryRun = new URL(request.url).searchParams.get('dry') === '1';
  const now = Date.now();

  try {
    // ── 1. Every bucket path referenced by a property ──
    const { data: rows, error: rowsErr } = await db.from('properties').select('images');
    if (rowsErr) throw rowsErr;
    const referenced = new Set<string>();
    for (const row of rows ?? []) {
      for (const url of (row.images as string[] | null) ?? []) {
        if (typeof url !== 'string') continue;
        const idx = url.indexOf(`/${BUCKET}/`);
        if (idx !== -1) referenced.add(url.slice(idx + BUCKET.length + 2)); // path within the bucket
      }
    }

    // ── 2. Walk the bucket, collect orphans older than the TTL ──
    const orphans: string[] = [];
    let scanned = 0;
    for (let offset = 0; ; offset += PAGE) {
      const { data: files, error: listErr } = await db.storage
        .from(BUCKET)
        .list(PREFIX, { limit: PAGE, offset, sortBy: { column: 'created_at', order: 'asc' } });
      if (listErr) throw listErr;
      if (!files || files.length === 0) break;
      scanned += files.length;

      for (const f of files) {
        const path = `${PREFIX}/${f.name}`;
        if (referenced.has(path)) continue; // in use → keep
        const createdAt = f.created_at ? new Date(f.created_at).getTime() : now;
        if (now - createdAt > ORPHAN_TTL_MS) orphans.push(path);
      }

      if (files.length < PAGE) break;
    }

    // ── 3. Delete (unless dry run) ──
    let deleted = 0;
    if (orphans.length > 0 && !dryRun) {
      const { error: delErr } = await db.storage.from(BUCKET).remove(orphans);
      if (delErr) throw delErr;
      deleted = orphans.length;
    }

    const summary = {
      ok: true,
      dryRun,
      scanned,
      referenced: referenced.size,
      orphans: orphans.length,
      deleted,
      paths: orphans,
    };
    console.log('[cron/cleanup-images]', JSON.stringify({ ...summary, paths: undefined }));
    return NextResponse.json(summary);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'cleanup failed';
    console.error('[cron/cleanup-images]', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
