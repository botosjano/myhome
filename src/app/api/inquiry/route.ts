import { NextResponse } from 'next/server';

// Where inquiry notifications will be sent once Resend is wired up.
const NOTIFY_EMAIL = process.env.INQUIRY_NOTIFICATION_EMAIL ?? 'myhome@olahkrisztina.hu';

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

  // TODO (backend phase): persist to Supabase `inquiries` and send via Resend to NOTIFY_EMAIL.
  console.info('[inquiry]', { name, email, phone, message, propertyId, reference, notify: NOTIFY_EMAIL });

  return NextResponse.json({ ok: true });
}
