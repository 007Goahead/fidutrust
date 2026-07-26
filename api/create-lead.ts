import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { matchFormula, buildProposalEmail } from './_lib/pricing';

// Server-only env vars (never prefixed with VITE_, never shipped to the browser).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLICKUP_TOKEN = process.env.CLICKUP_API_TOKEN;
const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID_CRM_PROSPECTS || '901219609612';

// Pascal Notermans' ClickUp user id - assigned to every new lead so ClickUp actually
// notifies someone (unassigned tasks generate no notification/email at all).
const PASCAL_ID = 222257946;

// ClickUp custom field IDs on "01 - CRM & Onboarding > CRM - Prospects".
// See memory/fidutrust_clickup_setup.md if these ever need to be re-derived.
const FIELD_FORME = '01160224-123a-4ddc-ba4c-db234fa0759a';
const FIELD_SERVICES = 'd911915f-1c43-4dcb-9ac2-63501c50db41'; // "Services souhaites (complet)" - 12/12 options, see below
const FIELD_TVA = 'c31b69d2-d7f8-4429-a919-9e1b038838c9';
const FIELD_PHONE = 'ca118566-57e1-4a45-aaa9-da76a82d325f';
const FIELD_LANGUE = 'de0514d3-59d3-4456-89dc-dd828f2cfa5e';
const FIELD_SOURCE = 'ecd85646-a771-4d87-9942-858b4a0dbcf7';
const FIELD_IBAN = '0e5c3a78-ba14-4c91-b640-ff078cf7059b';
const FIELD_BANQUE = '8e3fe5e6-1339-4e37-b163-0037f400f373';
const FIELD_LANGUE_CONTACT = '6cec93bb-a8fe-49b2-a083-a70b33007ab6';
const FIELD_FORMULE = '96f97285-198c-4714-a9d9-3b63672f7f7b';
const FIELD_PRIX = '28d12e23-1849-4f72-8a65-3e9062bbc055';

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

const LANGUE_CONTACT_OPTIONS: Record<string, string> = {
  fr: 'fe67e096-b3c4-462c-9088-6a80268e1769',
  nl: 'c9a12d53-1d4b-4bcf-aac1-4e1b98de3257',
  en: 'f47f8368-8f0e-4afe-9fc2-0923625178b5',
};

const FORMULE_OPTIONS: Record<string, string> = {
  Essentiel: 'd4e02f84-ada1-4095-bf7e-97d011746a7c',
  Standard: '5151e43f-c86d-4add-9c41-997b916321d3',
  Avance: '51700cb8-02d8-46a1-b36c-939f1ba83f15',
  Premium: '86e29c33-a276-46af-9bb9-4d2c28cddd60',
  'Sur mesure': '03df388d-39d7-4d14-bbe6-6b8d9ab113c3',
};

// 1:1 with the form's 12 needs (FIELD_SERVICES above) - ClickUp doesn't support
// editing/deleting a field after creation (PUT and DELETE both return 405), so the
// original 7-option field was abandoned in favor of this complete one.
const NEEDS_LABELS: Record<string, string> = {
  comptabilite: 'ac777ad8-4a97-4e53-88f8-8fccf291476b',
  tva: 'aadc43be-ec5a-4cdd-b7e4-331ff823345c',
  comptesAnnuels: '1868a5de-9861-43a8-98b5-6df944e6ffa5',
  isoc: 'c9e6084c-df32-4b8d-aadb-d5993e463ac5',
  ipp: 'a23f08d1-3883-49ee-9ad8-da41d50e4d0c',
  ubo: '29a4b6de-fa91-4958-ba02-63ac136113ce',
  peppol: 'f6719979-23b1-4c22-8a3e-1cd3bc3cfa9c',
  conseilFiscal: 'b68bb926-6d72-4351-a956-002764ce55a1',
  conseilSocial: '5740e37d-ae24-42e6-becb-8166c6bf0bc0',
  conseilJuridique: 'ba669035-e404-47f3-9585-9a7ed0c6a3f1',
  planFinancier: 'e4aaaf84-36cd-4e13-8666-c8a647266e75',
  tresorerie: '00416d69-d66d-45d1-bd6e-2155e4e3b437',
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
  iban?: string;
  bankName?: string;
  contactLanguage?: string;
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
  const formula = matchFormula(body.structureType, body.invoiceVolume);

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
      iban: body.iban,
      bank_name: body.bankName,
      contact_language: body.contactLanguage,
      proposed_formula: formula?.name ?? null,
      proposed_price: formula?.price ?? null,
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
        `Langue du site : ${body.language || '-'}`,
        `Langue de contact souhaitée : ${body.contactLanguage || '-'}`,
        `IBAN : ${body.iban || '-'}`,
        `Banque : ${body.bankName || '-'}`,
        `Formule proposée : ${formula ? `${formula.name}${formula.price ? ` (${formula.price} €/mois)` : ' (sur mesure)'}` : '-'}`,
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
          assignees: [PASCAL_ID],
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
        if (body.iban) customFields.push({ id: FIELD_IBAN, value: body.iban });
        if (body.bankName) customFields.push({ id: FIELD_BANQUE, value: body.bankName });
        if (body.contactLanguage && LANGUE_CONTACT_OPTIONS[body.contactLanguage]) {
          customFields.push({ id: FIELD_LANGUE_CONTACT, value: LANGUE_CONTACT_OPTIONS[body.contactLanguage] });
        }
        if (formula && FORMULE_OPTIONS[formula.name]) {
          customFields.push({ id: FIELD_FORMULE, value: FORMULE_OPTIONS[formula.name] });
        }
        if (formula?.price) customFields.push({ id: FIELD_PRIX, value: formula.price });
        const labelIds = Array.from(new Set(needs.map((k) => NEEDS_LABELS[k]).filter(Boolean)));
        if (labelIds.length) customFields.push({ id: FIELD_SERVICES, value: labelIds });

        // ClickUp has no bulk custom-field endpoint - set them one by one.
        const fieldWrites = customFields.map(({ id, value }) =>
          fetch(`https://api.clickup.com/api/v2/task/${taskId}/field/${id}`, {
            method: 'POST',
            headers: { Authorization: CLICKUP_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ value }),
          })
        );

        // Draft proposal email as a comment - Pascal reviews/adapts/sends it himself,
        // nothing is ever emailed automatically to the prospect.
        let commentWrite: Promise<unknown> = Promise.resolve();
        if (formula) {
          const email = buildProposalEmail(body.contactLanguage || body.language || 'fr', {
            contactName: body.contactName,
            companyName: body.companyName,
            structureType: body.structureType,
            phone: body.phone,
            formula,
          });
          const commentText = [
            '📧 Brouillon de proposition (à relire et adapter avant envoi) :',
            '',
            `Objet : ${email.subject}`,
            '',
            email.body,
          ].join('\n');
          commentWrite = fetch(`https://api.clickup.com/api/v2/task/${taskId}/comment`, {
            method: 'POST',
            headers: { Authorization: CLICKUP_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment_text: commentText, notify_all: false }),
          });
        }

        await Promise.all([...fieldWrites, commentWrite]);

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
