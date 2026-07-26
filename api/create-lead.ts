import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Server-only env vars (never prefixed with VITE_, never shipped to the browser).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLICKUP_TOKEN = process.env.CLICKUP_API_TOKEN;
const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID_CRM_PROSPECTS || '901219609612';

// ClickUp custom field IDs on "01 - CRM & Onboarding > CRM - Prospects".
// See memory/fidutrust_clickup_setup.md if these ever need to be re-derived.
const FIELD_FORME = '01160224-123a-4ddc-ba4c-db234fa0759a';
const FIELD_SERVICES = '756e8605-e6cd-4535-8985-ab8bbb69380f';
const FIELD_TVA = 'c31b69d2-d7f8-4429-a919-9e1b038838c9';
const FIELD_PHONE = 'ca118566-57e1-4a45-aaa9-da76a82d325f';
const FIELD_LANGUE = 'de0514d3-59d3-4456-89dc-dd828f2cfa5e';
const FIELD_SOURCE = 'ecd85646-a771-4d87-9942-858b4a0dbcf7';

const FORME_OPTIONS: Record<string, string> = {
  independant: 'b67670dd-0a6c-4cd6-b09f-9b1ecb76d05f',
  // 'societe' left unmapped on purpose: we don't know SRL/SA/ASBL yet at lead stage.
};

const LANGUE_OPTIONS: Record<string, string> = {
  fr: '6a2209f6-1354-423c-af40-fe591e5a61a3',
  nl: 'cd20e6bc-cf7a-46a5-8647-c58011df3f3f',
  en: 'b207ef3c-40c9-4c5b-badc-60b94ba54e3f',
};

const SOURCE_OPTIONS: Record<string, string> = {
  'bouche-a-oreille': '13af2066-f3ca-4e42-929b-242fe31b893d',
  google: '493cf68d-3f7c-4d97-94a2-2de99bfc6743',
  recommandation: '0c6bf933-1a04-46c9-a71c-ca5ee88b7698',
  'site-web': '2357e105-1454-4bb2-8ad0-608560231233',
  autre: '17f4d555-0695-4b93-bae5-157a56d4690f',
};

// The ClickUp "Services souhaités" labels field only has 7 options (API doesn't support
// editing/deleting fields after creation - PUT and DELETE both return 405). Best-effort
// map onto the closest existing label; the full, exact list always goes in the task
// description regardless, so nothing is ever lost - this only affects the quick-glance tag.
const NEEDS_LABELS: Record<string, string> = {
  comptabilite: '5c05d19f-abaa-49e5-8ce7-5329526d6de6', // Comptabilité
  tva: 'b2310a19-4dc9-475e-8cbf-7b034ece2d39', // TVA
  comptesAnnuels: 'a6cf3225-d9fa-4cb8-abfe-b4f01d59b648', // Bilan annuel
  conseilFiscal: '6f1c2b86-dcee-4647-a373-32a09573d985', // Conseil
  conseilSocial: 'cfc3bcbc-ba6f-48f4-bf23-f41ec4ff3a82', // Secrétariat social
  conseilJuridique: '6f1c2b86-dcee-4647-a373-32a09573d985', // Conseil
};

const NEEDS_TEXT: Record<string, string> = {
  comptabilite: 'Comptabilité',
  tva: 'TVA',
  comptesAnnuels: 'Comptes annuels',
  isoc: 'ISOC',
  ipp: 'IPP',
  ubo: 'UBO',
  peppol: 'PEPPOL',
  conseilFiscal: 'Conseil fiscal',
  conseilSocial: 'Conseil social',
  conseilJuridique: 'Conseil juridique',
  planFinancier: 'Plan financier',
  tresorerie: 'Trésorerie',
};

interface LeadPayload {
  sourceForm?: 'devis' | 'contact';
  companyName?: string;
  contactName: string;
  email: string;
  phone?: string;
  vatNumber?: string;
  structureType?: string;
  invoiceVolume?: string;
  needs?: string[];
  currentSituation?: string;
  message?: string;
  preferredContact?: string;
  urgency?: string;
  leadSource?: string;
  language?: string;
  statutsFilePath?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Server misconfigured: Supabase env vars missing' });
    return;
  }

  const body = req.body as LeadPayload;

  if (!body?.contactName || !body?.email) {
    res.status(400).json({ error: 'contactName and email are required' });
    return;
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const needs = body.needs ?? [];

  const { data: lead, error: dbError } = await supabase
    .from('leads')
    .insert({
      source_form: body.sourceForm ?? 'devis',
      company_name: body.companyName,
      contact_name: body.contactName,
      email: body.email,
      phone: body.phone,
      vat_number: body.vatNumber,
      structure_type: body.structureType,
      invoice_volume: body.invoiceVolume,
      needs,
      current_situation: body.currentSituation,
      message: body.message,
      preferred_contact: body.preferredContact,
      urgency: body.urgency,
      lead_source: body.leadSource,
      language: body.language,
      statuts_file_path: body.statutsFilePath,
    })
    .select()
    .single();

  if (dbError || !lead) {
    res.status(500).json({ error: 'Database error', detail: dbError?.message });
    return;
  }

  // ClickUp sync is best-effort: the lead is already safely stored in Supabase,
  // so a ClickUp hiccup must never fail the visitor's submission.
  let clickupTaskUrl: string | null = null;
  let clickupError: string | null = null;

  if (!CLICKUP_TOKEN) {
    clickupError = 'CLICKUP_API_TOKEN is not set in the server environment';
    console.error(clickupError);
  } else {
    try {
      const needsText = needs.map((k) => NEEDS_TEXT[k] || k).join(', ') || '-';

      const description = [
        `Nouveau lead via le site (${body.sourceForm ?? 'devis'}).`,
        '',
        `Société : ${body.companyName || '-'}`,
        `Contact : ${body.contactName}`,
        `Email : ${body.email}`,
        `Téléphone : ${body.phone || '-'}`,
        `N° TVA/BCE : ${body.vatNumber || '-'}`,
        `Type : ${body.structureType || '-'}`,
        `Volume de factures/an : ${body.invoiceVolume || '-'}`,
        `Besoins : ${needsText}`,
        `Situation actuelle : ${body.currentSituation || '-'}`,
        `Urgence : ${body.urgency || '-'}`,
        `Contact préféré : ${body.preferredContact || '-'}`,
        `Comment nous a connu : ${body.leadSource || '-'}`,
        `Langue : ${body.language || '-'}`,
        body.statutsFilePath ? `Document joint : ${body.statutsFilePath}` : '',
        '',
        'Message :',
        body.message || '(aucun)',
      ]
        .filter(Boolean)
        .join('\n');

      const createResp = await fetch(`https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`, {
        method: 'POST',
        headers: { Authorization: CLICKUP_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${body.companyName || body.contactName} — nouveau lead site web`,
          description,
        }),
      });
      const created = await createResp.json();

      if (createResp.ok && created?.id) {
        const taskId = created.id as string;
        clickupTaskUrl = created.url as string;

        const customFields: Array<{ id: string; value: unknown }> = [];
        if (body.vatNumber) customFields.push({ id: FIELD_TVA, value: body.vatNumber });
        if (body.phone) customFields.push({ id: FIELD_PHONE, value: body.phone });
        if (body.language && LANGUE_OPTIONS[body.language]) {
          customFields.push({ id: FIELD_LANGUE, value: LANGUE_OPTIONS[body.language] });
        }
        if (body.structureType && FORME_OPTIONS[body.structureType]) {
          customFields.push({ id: FIELD_FORME, value: FORME_OPTIONS[body.structureType] });
        }
        if (body.leadSource && SOURCE_OPTIONS[body.leadSource]) {
          customFields.push({ id: FIELD_SOURCE, value: SOURCE_OPTIONS[body.leadSource] });
        }
        const labelIds = Array.from(new Set(needs.map((k) => NEEDS_LABELS[k]).filter(Boolean)));
        if (labelIds.length) customFields.push({ id: FIELD_SERVICES, value: labelIds });

        // ClickUp has no bulk custom-field endpoint - set them one by one.
        await Promise.all(
          customFields.map(({ id, value }) =>
            fetch(`https://api.clickup.com/api/v2/task/${taskId}/field/${id}`, {
              method: 'POST',
              headers: { Authorization: CLICKUP_TOKEN, 'Content-Type': 'application/json' },
              body: JSON.stringify({ value }),
            })
          )
        );

        await supabase
          .from('leads')
          .update({
            clickup_task_id: taskId,
            clickup_task_url: clickupTaskUrl,
            clickup_synced_at: new Date().toISOString(),
          })
          .eq('id', lead.id);
      } else {
        clickupError = `ClickUp task creation failed (HTTP ${createResp.status}): ${JSON.stringify(created).slice(0, 300)}`;
        console.error(clickupError);
      }
    } catch (err) {
      clickupError = `ClickUp sync threw: ${err instanceof Error ? err.message : String(err)}`;
      console.error(clickupError);
    }
  }

  res.status(200).json({ ok: true, leadId: lead.id, clickupTaskUrl, clickupError });
}
