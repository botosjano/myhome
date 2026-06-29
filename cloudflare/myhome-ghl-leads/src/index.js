/**
 * myhome-ghl-leads — Cloudflare Worker
 *
 * Receives form submissions from the MyHome Budapest website (contact page +
 * property-detail inquiry form) and creates a Contact + Opportunity in the
 * GoHighLevel CRM (LeadConnector API v2).
 *
 * The GHL Private Integration token lives ONLY here, as a Worker secret
 * (GHL_TOKEN) — it never reaches the browser. The site calls this Worker
 * directly (CORS-allowed origins below).
 *
 * Env (set in Cloudflare):
 *   GHL_TOKEN        secret  — GHL Private Integration API token
 *   GHL_LOCATION_ID  var     — B1iKfxKj65UywKnJvYHz
 */

const GHL = 'https://services.leadconnectorhq.com';
const VERSION = '2021-07-28';

// pipelineType → GHL pipeline id
const PIPELINES = {
  vevo: 'BbOiPfaGrNjmYsDgS8ih', // Vevők
  berlo: '2u0QVPbHogIFRBbIsfr7', // Bérlők
  elado: 'nbc1tbFh05O0G6tYhiUo', // Eladók
  berbeado: '78CABqULTMkN29iWKvrS', // Bérbeadók
};

// Origins allowed to call this Worker from a browser.
const ALLOWED_ORIGINS = [
  'https://www.myhomebudapest.hu',
  'https://myhomebudapest.hu',
  'http://localhost:3000',
];

// Per-isolate caches (warm invocations reuse them; recycle clears them).
let stageCache = null; // { [pipelineId]: firstStageId }
let fieldCache = null; // { [customFieldName]: customFieldId }

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

function ghlHeaders(env) {
  return {
    Authorization: `Bearer ${env.GHL_TOKEN}`,
    Version: VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

/** Resolve the first stage id of every pipeline (cached). */
async function loadStages(env) {
  if (stageCache) return stageCache;
  const res = await fetch(`${GHL}/opportunities/pipelines?locationId=${env.GHL_LOCATION_ID}`, {
    headers: ghlHeaders(env),
  });
  if (!res.ok) throw new Error(`pipelines fetch ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const map = {};
  for (const p of data.pipelines ?? []) {
    const stages = [...(p.stages ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    if (stages[0]) map[p.id] = stages[0].id;
  }
  stageCache = map;
  return map;
}

/** Resolve custom-field name → id for both contact and opportunity models (cached). */
async function loadFields(env) {
  if (fieldCache) return fieldCache;
  const map = {};
  for (const model of ['contact', 'opportunity']) {
    try {
      const res = await fetch(
        `${GHL}/locations/${env.GHL_LOCATION_ID}/customFields?model=${model}`,
        { headers: ghlHeaders(env) },
      );
      if (!res.ok) {
        console.log(`customFields(${model}) ${res.status}: ${await res.text()}`);
        continue;
      }
      const data = await res.json();
      for (const f of data.customFields ?? []) {
        if (f.name) map[f.name] = f.id;
      }
    } catch (e) {
      console.log(`customFields(${model}) error: ${e.message}`);
    }
  }
  fieldCache = map;
  return map;
}

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] || '', lastName: '' };
  // First token = first name, remainder = last name. The full name is also sent
  // (so display is always correct regardless of HU/EN ordering).
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

async function upsertContact(env, body, fields) {
  const { firstName, lastName } = splitName(body.name);
  const customFields = [];
  const sourceFieldId = fields['Honnan talált ránk'];
  if (body.source && sourceFieldId) {
    customFields.push({ id: sourceFieldId, field_value: body.source });
  } else if (body.source) {
    console.log('custom field not found: Honnan talált ránk');
  }

  const payload = {
    locationId: env.GHL_LOCATION_ID,
    firstName,
    lastName,
    name: body.name,
    email: body.email,
    phone: body.phone,
    source: body.source || undefined,
    customFields,
  };

  const res = await fetch(`${GHL}/contacts/upsert`, {
    method: 'POST',
    headers: ghlHeaders(env),
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`contact upsert ${res.status}: ${text}`);
  const data = JSON.parse(text);
  return data.contact?.id ?? data.id ?? null;
}

/** Best-effort parse of model output: strip ``` fences, take the first {…} block. */
function parseJsonLoose(text) {
  if (!text) return null;
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Extract structured property data from a free-text message with Gemini Flash.
 * Returns { tipus, meret_m2, ar, helyszin, allapot } or null on ANY failure
 * (missing key, HTTP error, bad JSON) — the caller then just saves the message.
 */
async function extractWithGemini(env, message) {
  if (!env.GEMINI_API_KEY || !message) return null;
  const prompt = `Az alábbi üzenetből szedd ki az ingatlan adatokat JSON formátumban.
Ha valamit nem találsz, az értéke legyen null.
Csak JSON-t adj vissza, semmi mást.

Üzenet: ${message}

Válasz formátuma:
{
  "tipus": "Lakás/Ház/Villa/Penthouse/Telek/Nyaraló/Iroda/Üzlethelyiség/Fejlesztési terület vagy null",
  "meret_m2": szám vagy null,
  "ar": "szöveg vagy null (pl. 150 MFt vagy 200000 EUR)",
  "helyszin": "szöveg vagy null (pl. II. kerület vagy Balaton)",
  "allapot": "Új/Felújított/Felújítandó vagy null"
}`;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, responseMimeType: 'application/json' },
        }),
      },
    );
    if (!res.ok) {
      console.log(`gemini ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return parseJsonLoose(text);
  } catch (e) {
    console.log(`gemini error: ${e.message}`);
    return null;
  }
}

function opportunityName(body) {
  if (body.formType === 'property_inquiry') return `${body.propertyId} | ${body.name}`;
  const labels = { vevo: 'Vásárlás', berlo: 'Bérlés', elado: 'Eladás', berbeado: 'Bérbeadás' };
  return `${body.name} | ${labels[body.pipelineType] ?? ''}`.trim();
}

function opportunityFields(body, fields, extracted) {
  const out = [];
  const add = (name, value) => {
    if (value == null || value === '') return;
    const id = fields[name];
    if (id) out.push({ id, field_value: value });
    else console.log(`custom field not found: ${name}`);
  };
  const e = extracted ?? {}; // Gemini-extracted data (contact form only)

  const isProp = body.formType === 'property_inquiry';
  switch (body.pipelineType) {
    case 'vevo':
      add('Vevő - Érdeklődés jellege', isProp ? 'Konkrét ingatlan' : 'Megbízásos keresés');
      if (isProp) {
        add('Vevő - Ingatlan ref.száma', body.propertyId);
        add('Vevő - Ingatlan neve', body.propertyName);
        add('Vevő - Ingatlan URL', body.propertyUrl);
      } else {
        add('Vevő - Keresett típus', e.tipus);
        add('Vevő - Keresett méret m²-től', e.meret_m2);
        add('Vevő - Max vételár', e.ar);
        add('Vevő - Keresett helyszín', e.helyszin);
      }
      add('Vevő - Üzenet', body.message);
      break;
    case 'berlo':
      add('Bérlő - Érdeklődés jellege', isProp ? 'Konkrét ingatlan' : 'Megbízásos keresés');
      if (isProp) {
        add('Bérlő - Ingatlan ref.száma', body.propertyId);
        add('Bérlő - Ingatlan neve', body.propertyName);
        add('Bérlő - Ingatlan URL', body.propertyUrl);
      } else {
        add('Bérlő - Keresett típus', e.tipus);
        add('Bérlő - Keresett méret m²', e.meret_m2);
        add('Bérlő - Max bérleti díj', e.ar);
        add('Bérlő - Keresett helyszín', e.helyszin);
      }
      add('Bérlő - Üzenet', body.message);
      break;
    case 'elado':
      add('Eladó - Ingatlan típusa', e.tipus);
      add('Eladó - Méret m²', e.meret_m2);
      add('Eladó - Becsült ár', e.ar);
      add('Eladó - Helyszín', e.helyszin);
      add('Eladó - Állapot', e.allapot);
      add('Eladó - Üzenet', body.message);
      break;
    case 'berbeado':
      add('Bérbeadó - Ingatlan típusa', e.tipus);
      add('Bérbeadó - Méret m²', e.meret_m2);
      add('Bérbeadó - Elvárt bérleti díj', e.ar);
      add('Bérbeadó - Helyszín', e.helyszin);
      add('Bérbeadó - Állapot', e.allapot);
      add('Bérbeadó - Üzenet', body.message);
      break;
  }
  return out;
}

async function createOpportunity(env, body, contactId, stages, fields, extracted) {
  const pipelineId = PIPELINES[body.pipelineType];
  const pipelineStageId = stages[pipelineId];
  if (!pipelineStageId) throw new Error(`no first stage for pipeline ${pipelineId}`);

  const payload = {
    locationId: env.GHL_LOCATION_ID,
    pipelineId,
    pipelineStageId,
    name: opportunityName(body),
    status: 'open',
    contactId,
    customFields: opportunityFields(body, fields, extracted),
  };

  const res = await fetch(`${GHL}/opportunities/`, {
    method: 'POST',
    headers: ghlHeaders(env),
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`opportunity create ${res.status}: ${text}`);
  const data = JSON.parse(text);
  return data.opportunity?.id ?? data.id ?? null;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'method not allowed' }, 405, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: 'invalid json' }, 400, cors);
    }

    // Validate
    if (!body.name || !body.email || !body.phone) {
      return json({ ok: false, error: 'missing required fields (name, email, phone)' }, 422, cors);
    }
    if (!PIPELINES[body.pipelineType]) {
      return json({ ok: false, error: `invalid pipelineType: ${body.pipelineType}` }, 422, cors);
    }

    try {
      const [stages, fields] = await Promise.all([loadStages(env), loadFields(env)]);
      // AI extraction runs only for the general contact form (property inquiries
      // already carry the property data). It never throws — null on any failure,
      // so the lead is still created, just without the extracted fields.
      const [contactId, extracted] = await Promise.all([
        upsertContact(env, body, fields),
        body.formType === 'contact' ? extractWithGemini(env, body.message) : Promise.resolve(null),
      ]);
      if (!contactId) throw new Error('contact upsert returned no id');
      const opportunityId = await createOpportunity(env, body, contactId, stages, fields, extracted);
      return json({ ok: true, contactId, opportunityId }, 200, cors);
    } catch (e) {
      console.error('lead error:', e.message);
      return json({ ok: false, error: e.message }, 500, cors);
    }
  },
};
