import { NextResponse } from 'next/server';

/**
 * Server-side DeepL proxy for the admin "Fordítás angolra" button.
 * Set DEEPL_API_KEY in the environment to enable it. Without a key the route
 * responds with { configured: false } so the UI can show a helpful message
 * instead of failing.
 */
export async function POST(request: Request) {
  const key = process.env.DEEPL_API_KEY;

  let body: { text?: string; target?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const text = (body.text ?? '').trim();
  if (!text) return NextResponse.json({ error: 'Empty text' }, { status: 400 });

  if (!key) {
    return NextResponse.json({ configured: false });
  }

  // Free keys end with ":fx" and use the api-free host.
  const host = key.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';

  try {
    const res = await fetch(`${host}/v2/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        source_lang: (body.source ?? 'HU').toUpperCase(),
        target_lang: (body.target ?? 'EN').toUpperCase(),
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `DeepL error ${res.status}` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { translations?: { text: string }[] };
    return NextResponse.json({
      configured: true,
      translated: data.translations?.[0]?.text ?? '',
    });
  } catch {
    return NextResponse.json({ error: 'DeepL request failed' }, { status: 502 });
  }
}
