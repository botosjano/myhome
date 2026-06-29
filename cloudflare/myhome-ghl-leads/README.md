# myhome-ghl-leads — Cloudflare Worker

Receives lead form submissions from the MyHome Budapest site and creates a
**Contact + Opportunity** in GoHighLevel (LeadConnector API v2).

## How it works

```
Browser form → this Worker → GHL API v2
```

The GHL Private Integration token stays in the Worker as a **secret**
(`GHL_TOKEN`) and never reaches the browser. The site calls the Worker directly;
CORS is restricted to the MyHome origins (see `ALLOWED_ORIGINS` in `src/index.js`).

Pipeline ids and the GHL location id are baked in / set as env. **Custom-field
ids and the first stage of each pipeline are resolved at runtime** by name from
the GHL API (`/locations/{id}/customFields` + `/opportunities/pipelines`), so you
never have to paste field ids. Field names must match exactly (e.g.
`Vevő - Üzenet`, `Honnan talált ránk`).

## Environment

| Name | Type | Value |
|------|------|-------|
| `GHL_TOKEN` | **Secret** | GHL Private Integration token |
| `GHL_LOCATION_ID` | Variable | `B1iKfxKj65UywKnJvYHz` (no trailing space!) |
| `GEMINI_API_KEY` | **Secret** | Google Gemini API key (for AI extraction) |

## AI extraction (Gemini Flash)

For the **contact form only** (`formType: "contact"`), the message is sent to
**gemini-2.0-flash** to extract `{ tipus, meret_m2, ar, helyszin, allapot }`,
which is mapped to per-pipeline GHL custom fields (e.g. `Eladó - Becsült ár`,
`Vevő - Keresett helyszín`). Property inquiries skip this (the data is already
known). If Gemini fails or returns invalid JSON, the lead is still created — just
without the extracted fields. The Gemini call runs in parallel with the contact
upsert, so it adds little latency.

## Deploy

**Dashboard:** paste `src/index.js` into the Worker editor and Save & Deploy.
Make sure `GHL_TOKEN` (Secret) and `GHL_LOCATION_ID` (Variable) are set under
Settings → Variables and Secrets.

**CLI:**
```
cd cloudflare/myhome-ghl-leads
wrangler secret put GHL_TOKEN      # paste the token when prompted
wrangler deploy
```

## Request body

```json
{
  "formType": "contact" | "property_inquiry",
  "pipelineType": "vevo" | "berlo" | "elado" | "berbeado",
  "name": "Kovács János",
  "email": "kovacs@email.com",
  "phone": "+36301234567",
  "message": "…",
  "source": "Google" | "Facebook" | "Instagram" | "Ajánlás" | "Egyéb",
  "propertyId": "MH-1042",          // property_inquiry only
  "propertyName": "…",              // property_inquiry only
  "propertyUrl": "https://…"        // property_inquiry only
}
```

Returns `{ ok: true, contactId, opportunityId }` on success, `{ ok: false, error }`
otherwise. Errors are logged (`wrangler tail` to watch live).

## Test

```bash
curl -X POST https://<worker-url> \
  -H "Content-Type: application/json" \
  -d '{"formType":"contact","pipelineType":"vevo","name":"Teszt Elek","email":"teszt@example.com","phone":"+36301234567","message":"próba","source":"Google"}'
```
