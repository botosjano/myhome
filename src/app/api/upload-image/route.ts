import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Server-side image upload. The admin uploader sends an already-optimised WebP
 * blob (resized + re-encoded in the browser — see {@link optimizeImage}); this
 * route stores it in the public `property-images` Supabase Storage bucket with
 * the secret key and returns the permanent public URL. We persist that URL in
 * the property's `images[]` instead of a multi-MB base64 data URL.
 *
 * Token-gated with the same ADMIN_API_SECRET the /api/admin RPC uses, so only a
 * logged-in admin can upload.
 */
export const runtime = 'nodejs';

const TOKEN = process.env.ADMIN_API_SECRET;
const BUCKET = 'property-images';
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB safety cap (optimised WebPs are ~300 KB)

const EXT_BY_TYPE: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid form data' }, { status: 400 });
  }

  // ── Auth ──
  const token = String(form.get('token') ?? '');
  if (!TOKEN || token !== TOKEN) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const db = supabaseAdmin;
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  }

  const file = form.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'File too large or empty' }, { status: 400 });
  }

  const contentType = file.type || 'image/webp';
  const ext = EXT_BY_TYPE[contentType] ?? 'webp';
  // Group uploads under properties/ with a random name so two uploads never collide.
  const path = `properties/${randomUUID()}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await db.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      cacheControl: '31536000', // 1 year — images are immutable (unique filename per upload)
      upsert: false,
    });
    if (error) throw error;

    const { data } = db.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'upload failed';
    console.error('[upload-image]', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
