import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Admin RPC endpoint. All property/inquiry writes go through here so the secret
 * Supabase key stays server-side. Every action except `login` requires the
 * token issued at login (checked against ADMIN_API_SECRET).
 */
const TOKEN = process.env.ADMIN_API_SECRET;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'admin@myhomebudapest.hu').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'myhome2026';

export async function POST(request: Request) {
  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const action = String(body.action ?? '');

  // ── Login: validate credentials, hand back the API token ──
  if (action === 'login') {
    const ok =
      String(body.email ?? '').trim().toLowerCase() === ADMIN_EMAIL &&
      String(body.password ?? '') === ADMIN_PASSWORD;
    if (!ok) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 401 });
    return NextResponse.json({ ok: true, token: TOKEN });
  }

  // ── Everything else requires the token ──
  if (!TOKEN || body.token !== TOKEN) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const db = supabaseAdmin;
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    switch (action) {
      case 'listProperties': {
        const { data, error } = await db
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ ok: true, data });
      }
      case 'getProperty': {
        const { data, error } = await db
          .from('properties')
          .select('*')
          .eq('id', body.id)
          .maybeSingle();
        if (error) throw error;
        return NextResponse.json({ ok: true, data });
      }
      case 'createProperty': {
        const draft = (body.draft ?? {}) as Record<string, unknown>;
        // The reference number is system-generated, sequentially — never set by the
        // admin. Always compute the next MH-#### server-side (ignore any client value).
        const { data: refs } = await db.from('properties').select('reference_number');
        const max = (refs ?? [])
          .map((r) => Number(String(r.reference_number).replace(/\D/g, '')))
          .filter((n) => Number.isFinite(n))
          .reduce((a, b) => Math.max(a, b), 1040);
        draft.reference_number = `MH-${max + 1}`;
        const { data, error } = await db.from('properties').insert(draft).select().single();
        if (error) throw error;
        revalidateTag('properties');
        return NextResponse.json({ ok: true, data });
      }
      case 'updateProperty': {
        const { error } = await db.from('properties').update(body.draft).eq('id', body.id);
        if (error) throw error;
        revalidateTag('properties');
        return NextResponse.json({ ok: true });
      }
      case 'deleteProperty': {
        const { error } = await db.from('properties').delete().eq('id', body.id);
        if (error) throw error;
        revalidateTag('properties');
        return NextResponse.json({ ok: true });
      }
      case 'setPropertyStatus': {
        const { error } = await db.from('properties').update({ status: body.status }).eq('id', body.id);
        if (error) throw error;
        revalidateTag('properties');
        return NextResponse.json({ ok: true });
      }
      case 'toggleFeatured': {
        const { data: cur, error: e1 } = await db
          .from('properties')
          .select('featured')
          .eq('id', body.id)
          .single();
        if (e1) throw e1;
        const { error } = await db
          .from('properties')
          .update({ featured: !cur.featured })
          .eq('id', body.id);
        if (error) throw error;
        revalidateTag('properties');
        return NextResponse.json({ ok: true });
      }
      case 'nextReference': {
        const { data, error } = await db.from('properties').select('reference_number');
        if (error) throw error;
        const max = (data ?? [])
          .map((r) => Number(String(r.reference_number).replace(/\D/g, '')))
          .filter((n) => Number.isFinite(n))
          .reduce((a, b) => Math.max(a, b), 1040);
        return NextResponse.json({ ok: true, data: `MH-${max + 1}` });
      }
      default:
        return NextResponse.json({ ok: false, error: 'unknown action' }, { status: 400 });
    }
  } catch (e) {
    let msg =
      e instanceof Error
        ? e.message
        : e && typeof e === 'object' && 'message' in e
          ? String((e as { message: unknown }).message)
          : 'error';
    // Surface the low-level reason (e.g. ENOTFOUND/ECONNREFUSED) for "fetch failed".
    const cause = (e as { cause?: { code?: string; message?: string } })?.cause;
    if (cause) msg += ` (${cause.code ?? cause.message ?? ''})`;
    console.error('[admin]', action, msg, cause ?? '');
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
