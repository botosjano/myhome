/**
 * Lead submission helper. Form data goes straight to the Cloudflare Worker
 * (myhome-ghl-leads), which creates the contact + opportunity in GoHighLevel.
 * GHL is the single source of truth for leads — we don't persist them here.
 */

export type PipelineType = 'vevo' | 'berlo' | 'elado' | 'berbeado';

/** Canonical source values sent to GHL (the option labels are localised in the UI). */
export const LEAD_SOURCES = ['Google', 'Facebook', 'Instagram', 'Ajánlás', 'Egyéb'] as const;

export interface LeadPayload {
  formType: 'contact' | 'property_inquiry';
  pipelineType: PipelineType;
  name: string;
  email: string;
  phone: string;
  message?: string;
  source?: string;
  propertyId?: string;
  propertyName?: string;
  propertyUrl?: string;
}

const WORKER_URL = process.env.NEXT_PUBLIC_GHL_WORKER_URL;

/**
 * POST a lead to the Worker. Throws on misconfiguration or a non-ok response so
 * the form can show its error state (the lead is never silently dropped).
 */
export async function submitLead(payload: LeadPayload): Promise<void> {
  if (!WORKER_URL) {
    throw new Error('NEXT_PUBLIC_GHL_WORKER_URL is not set');
  }
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.json())?.error ?? '';
    } catch {
      /* ignore */
    }
    throw new Error(`Lead submit failed (${res.status}) ${detail}`.trim());
  }
}
