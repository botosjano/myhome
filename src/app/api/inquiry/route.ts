import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Where inquiry notifications will be sent once Resend is wired up.
const NOTIFY_EMAIL = process.env.INQUIRY_NOTIFICATION_EMAIL ?? 'myhome@olahkrisztina.hu';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, phone, message, propertyId, reference } = body as Record<string, string>;
  if (!name || !email || !phone) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 422 });
  }

  // Persist to Supabase when configured. property_id must be a uuid (mock ids → null).
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from('inquiries').insert({
      name,
      email,
      phone,
      message: message ?? '',
      property_id: propertyId && UUID_RE.test(propertyId) ? propertyId : null,
      property_ref: reference || null,
    });
    if (error) {
      console.error('[inquiry] Supabase insert failed:', error.message);
      return NextResponse.json({ ok: false, error: 'Could not save inquiry' }, { status: 500 });
    }
  } else {
    console.info('[inquiry]', { name, email, phone, message, propertyId, reference, notify: NOTIFY_EMAIL });
  }

  // TODO (Resend phase): email NOTIFY_EMAIL on new inquiry.
  return NextResponse.json({ ok: true });
}
