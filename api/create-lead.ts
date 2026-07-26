import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Server-only env vars (never prefixed with VITE_, never shipped to the browser).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLICKUP_TOKEN = process.env.CLICKUP_API_TOKEN;
const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID_CRM_PROSPECTS || '901219609612';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

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

// Pricing tiers - keep in sync with src/components/FormulesSocietes.tsx
// and src/components/FormulesIndependants.tsx. No shared source of truth on
// purpose (client bundle vs. serverless function) - update both places if
// pricing changes. Inlined here (rather than a separate ./_lib/pricing module)
// after a cross-file import caused FUNCTION_INVOCATION_FAILED on Vercel.
interface FormulaMatch {
  key: '120' | '250' | '375' | '500' | 'custom';
  name: string;
  price: number | null;
  monthlyInvoicesRange: string;
}

const TIERS: Record<'societe' | 'independant', FormulaMatch[]> = {
  societe: [
    { key: '120', name: 'Essentiel', price: 119, monthlyInvoicesRange: '0 a 10' },
    { key: '250', name: 'Standard', price: 239, monthlyInvoicesRange: '10 a 20' },
    { key: '375', name: 'Avance', price: 359, monthlyInvoicesRange: '20 a 31' },
    { key: '500', name: 'Premium', price: 599, monthlyInvoicesRange: '31 a 42' },
  ],
  independant: [
    { key: '120', name: 'Essentiel', price: 95, monthlyInvoicesRange: '0 a 10' },
    { key: '250', name: 'Standard', price: 191, monthlyInvoicesRange: '10 a 20' },
    { key: '375', name: 'Avance', price: 299, monthlyInvoicesRange: '20 a 31' },
    { key: '500', name: 'Premium', price: 395, monthlyInvoicesRange: '31 a 42' },
  ],
};

function matchFormula(structureType: string | undefined, invoiceVolume: string | undefined): FormulaMatch | null {
  if (!invoiceVolume) return null;
  if (invoiceVolume === 'plus500') {
    return { key: 'custom', name: 'Sur mesure', price: null, monthlyInvoicesRange: '' };
  }
  const tiers = TIERS[structureType === 'independant' ? 'independant' : 'societe'];
  return tiers.find((t) => t.key === invoiceVolume) ?? null;
}

interface EmailInputs {
  contactName: string;
  companyName?: string;
  structureType?: string;
  phone?: string;
  formula: FormulaMatch;
}

const SIGNATURE: Record<'fr' | 'nl' | 'en', string> = {
  fr: 'Bien cordialement,\n\nPascal NOTERMANS\nDirecteur operationnel\nFIDUTRUST SRL\n+32 477 508 232\npascal@fidutrust.eu\nwww.fidutrust.eu',
  nl: 'Met vriendelijke groeten,\n\nPascal NOTERMANS\nOperationeel directeur\nFIDUTRUST SRL\n+32 477 508 232\npascal@fidutrust.eu\nwww.fidutrust.eu',
  en: 'Kind regards,\n\nPascal NOTERMANS\nOperations Director\nFIDUTRUST SRL\n+32 477 508 232\npascal@fidutrust.eu\nwww.fidutrust.eu',
};

function buildProposalEmail(lang: string, inputs: EmailInputs): { subject: string; body: string } {
  const language: 'fr' | 'nl' | 'en' = lang === 'nl' || lang === 'en' ? lang : 'fr';
  const firstName = inputs.contactName.trim().split(/\s+/)[0] || inputs.contactName;
  const company = inputs.companyName?.trim();
  const isIndependant = inputs.structureType === 'independant';
  const phoneNote = inputs.phone ? '' : language === 'fr' ? ' et votre numero de gsm' : language === 'nl' ? ' en uw gsm-nummer' : ' and your mobile number';

  if (inputs.formula.key === 'custom') {
    if (language === 'nl') {
      return {
        subject: 'Uw FIDUTRUST-voorstel - offerte op maat',
        body: [
          `Beste ${firstName},`,
          '',
          `Hartelijk dank voor de informatie die u ons bezorgde${company ? ` met betrekking tot ${company}` : ''}.`,
          '',
          'Gezien het opgegeven activiteitsvolume (meer dan 500 facturen per jaar), valt uw dossier buiten onze standaardformules en verdient het een offerte op maat, specifiek afgestemd op uw behoeften.',
          '',
          'Ik stel voor een telefonische afspraak of videogesprek (WhatsApp) in te plannen om uw activiteit te bespreken en u snel een gepersonaliseerd voorstel te bezorgen.',
          '',
          `Aarzel niet om mij uw beschikbaarheid${inputs.phone ? '' : ' en gsm-nummer'} door te geven.`,
          '',
          'Hartelijk dank voor uw vertrouwen, ik blijf volledig tot uw beschikking.',
          '',
          SIGNATURE.nl,
        ].join('\n'),
      };
    }
    if (language === 'en') {
      return {
        subject: 'Your FIDUTRUST proposal - tailor-made quote',
        body: [
          `Dear ${firstName},`,
          '',
          `Thank you for the information you shared with us${company ? ` regarding ${company}` : ''}.`,
          '',
          'Given the volume of activity indicated (more than 500 invoices per year), your file falls outside our standard packages and calls for a tailor-made offer built specifically around your needs.',
          '',
          'I would suggest scheduling a call or video conference (WhatsApp) to discuss your activity and quickly put together a personalized proposal for you.',
          '',
          `Please let me know your availability${phoneNote}.`,
          '',
          'Thank you for your trust - I remain fully at your disposal.',
          '',
          SIGNATURE.en,
        ].join('\n'),
      };
    }
    return {
      subject: 'Votre proposition FIDUTRUST - devis sur mesure',
      body: [
        `Bonjour ${firstName},`,
        '',
        `Je vous remercie pour les informations que vous nous avez transmises${company ? ` concernant ${company}` : ''}.`,
        '',
        "Compte tenu du volume d'activite annonce (plus de 500 factures par an), votre dossier sort du cadre de nos formules standards et merite une offre sur mesure, adaptee precisement a vos besoins.",
        '',
        "Je vous propose de fixer un rendez-vous telephonique ou en visioconference (WhatsApp) afin d'echanger sur votre activite et de vous soumettre rapidement une proposition personnalisee.",
        '',
        `N'hesitez pas a me communiquer vos disponibilites${phoneNote}.`,
        '',
        'Je vous remercie pour votre confiance et reste a votre entiere disposition.',
        '',
        SIGNATURE.fr,
      ].join('\n'),
    };
  }

  const { name, price, monthlyInvoicesRange } = inputs.formula;

  if (language === 'nl') {
    const profileLine = isIndependant ? 'een zelfstandige activiteit' : 'een bedrijfsleider';
    return {
      subject: `Uw FIDUTRUST-voorstel - ${name}`,
      body: [
        `Beste ${firstName},`,
        '',
        `Hartelijk dank voor de informatie en documenten die u ons bezorgde${company ? ` met betrekking tot ${company}` : ''}.`,
        '',
        `Na analyse van uw activiteit en het opgegeven volume, denken wij dat onze formule ${name} aan ${price} € excl. btw per maand perfect aansluit bij uw huidige behoeften.`,
        '',
        'Deze formule omvat de diensten beschreven op onze website en is afgestemd op een structuur met onder meer:',
        '',
        `* een volume van ongeveer ${monthlyInvoicesRange} facturen per maand;`,
        `* ${profileLine};`,
        '* een klassieke commerciële activiteit;',
        '* de gebruikelijke boekhoudkundige en fiscale verplichtingen.',
        '',
        'Dit voorstel is uiteraard gebaseerd op de tot nu toe meegedeelde informatie. Indien uw activiteit evolueert of uw behoeften wijzigen, bekijken we graag samen de meest geschikte formule.',
        '',
        'Ik stel voor een telefonische afspraak of videogesprek (WhatsApp) in te plannen om onze werkwijze toe te lichten, uw vragen te beantwoorden en, indien gewenst, snel van start te gaan.',
        '',
        `Aarzel niet om mij uw beschikbaarheid door te geven${inputs.phone ? '' : ' en uw gsm-nummer'}.`,
        '',
        'Hartelijk dank voor uw vertrouwen, ik blijf volledig tot uw beschikking.',
        '',
        SIGNATURE.nl,
      ].join('\n'),
    };
  }

  if (language === 'en') {
    const profileLine = isIndependant ? 'an independent professional activity' : 'a company director';
    return {
      subject: `Your FIDUTRUST proposal - ${name}`,
      body: [
        `Dear ${firstName},`,
        '',
        `Thank you for the information and documents you shared with us${company ? ` regarding ${company}` : ''}.`,
        '',
        `Based on our analysis of your activity and the estimated volume, we believe our ${name} package at €${price} excl. VAT per month is perfectly suited to your current needs.`,
        '',
        'This package includes the services described on our website and is designed for a structure with, in particular:',
        '',
        `* a volume of approximately ${monthlyInvoicesRange} invoices per month;`,
        `* ${profileLine};`,
        '* standard commercial activity;',
        '* the usual accounting and tax filing obligations.',
        '',
        'This proposal is of course based on the information provided so far. Should your activity evolve or your needs change, we will be happy to review the most suitable package together.',
        '',
        'I would suggest scheduling a call or video conference (WhatsApp) to walk you through how we work, answer any questions, and, if you wish, get started quickly.',
        '',
        `Please let me know your availability${phoneNote}.`,
        '',
        'Thank you for your trust - I remain fully at your disposal.',
        '',
        SIGNATURE.en,
      ].join('\n'),
    };
  }

  const profileLine = isIndependant ? 'une activite independante' : 'un dirigeant';
  return {
    subject: `Votre proposition FIDUTRUST - ${name}`,
    body: [
      `Bonjour ${firstName},`,
      '',
      `Je vous remercie pour les informations et documents que vous nous avez transmis${company ? ` concernant ${company}` : ''}.`,
      '',
      `Après analyse de votre activité et du volume annoncé, nous pensons que notre offre ${name} à ${price} € HTVA par mois correspond parfaitement à vos besoins actuels.`,
      '',
      'Cette formule comprend les prestations décrites sur notre site internet et est adaptée à une structure présentant notamment :',
      '',
      `* un volume d'environ ${monthlyInvoicesRange} factures par mois ;`,
      `* ${profileLine} ;`,
      '* une activité commerciale classique ;',
      '* les obligations comptables et déclaratives courantes.',
      '',
      'Cette proposition est bien entendu basée sur les informations communiquées à ce jour. Si votre activité évolue ou si vos besoins venaient à changer, nous réévaluerons ensemble la formule la plus adaptée.',
      '',
      'Je vous propose de fixer un rendez-vous téléphonique ou en visioconférence (WhatsApp) afin de vous présenter notre mode de fonctionnement, répondre à vos questions et, si vous le souhaitez, démarrer rapidement notre collaboration.',
      '',
      `N'hésitez pas à me communiquer vos disponibilités${phoneNote}.`,
      '',
      'Je vous remercie pour votre confiance et reste à votre entière disposition.',
      '',
      SIGNATURE.fr,
    ].join('\n'),
  };
}

// AI refinement layer: reads the prospect's free-text message and (if provided)
// their uploaded document to sanity-check the mechanical volume-based formula
// match and personalize the proposal email. Best-effort and fully optional -
// if ANTHROPIC_API_KEY is missing or the call fails for any reason, the caller
// falls back to the deterministic buildProposalEmail() output. Never throws.
interface AIAnalysis {
  analysisSummary: string;
  emailSubject: string;
  emailBody: string;
  formulaOverride: string | null;
  overrideReasoning: string;
}

async function getAIAnalysis(params: {
  contactName: string;
  companyName?: string;
  structureType?: string;
  invoiceVolume?: string;
  message?: string;
  baselineFormula: FormulaMatch;
  targetLang: string;
  documentBlocks?: Array<Record<string, unknown>>;
}): Promise<AIAnalysis | null> {
  if (!ANTHROPIC_KEY) return null;
  const hasDocs = params.documentBlocks && params.documentBlocks.length > 0;
  if (!params.message && !hasDocs) return null; // nothing extra to analyze

  try {
    const langLabel = params.targetLang === 'nl' ? 'Dutch' : params.targetLang === 'en' ? 'English' : 'French';
    const promptText = [
      "You are assisting Pascal Notermans, operational director of FIDUTRUST SRL, a Belgian accounting firm (fiduciaire), in qualifying a new lead from the website's quote-request form.",
      '',
      `Prospect: ${params.contactName}${params.companyName ? ` (${params.companyName})` : ''}`,
      `Structure type: ${params.structureType || 'unknown'}`,
      `Declared invoice volume bracket: ${params.invoiceVolume || 'unknown'}`,
      `Mechanical volume-based formula match: ${params.baselineFormula.name}${params.baselineFormula.price ? ` at ${params.baselineFormula.price} EUR/month excl. VAT` : ' (tailor-made quote, no fixed price)'}.`,
      '',
      "Prospect's message:",
      params.message || '(no message provided)',
      '',
      hasDocs ? `${params.documentBlocks!.length} document(s) attached (likely Articles of Association, ID, or similar) - read them for relevant details (company purpose, share capital, incorporation date, directors, etc.).` : '',
      '',
      'Task:',
      '1. Decide whether the message and/or document change the picture enough to warrant a different formula than the mechanical match above (e.g. the prospect explicitly states a very different volume, an unusually complex structure, multiple entities, urgency, or something the invoice-count bracket alone would not capture). Only override if there is a clear, specific reason - do not override on vague impressions.',
      '2. Write a short internal analysis (2-4 sentences, in French, for Pascal only - never shown to the prospect) noting anything noteworthy: red flags, opportunities, special requirements, inconsistencies between the message and the declared volume.',
      `3. Write the full proposal email in ${langLabel}, addressed to the prospect. Follow this exact structure and professional-but-warm tone (this is Pascal's own template, adapt the wording naturally to weave in any relevant specifics from the message, but keep the structure and sign-off intact):`,
      '',
      '"""',
      `Bonjour {firstName},\n\nJe vous remercie pour les informations et documents que vous nous avez transmis concernant {company}.\n\nAprès analyse de votre activité et du volume annoncé, nous pensons que notre offre {formula} à {price} € HTVA par mois correspond parfaitement à vos besoins actuels.\n\nCette formule comprend les prestations décrites sur notre site internet et est adaptée à une structure présentant notamment :\n\n* un volume d'environ {range} factures par mois ;\n* un dirigeant ;\n* une activité commerciale classique ;\n* les obligations comptables et déclaratives courantes.\n\nCette proposition est bien entendu basée sur les informations communiquées à ce jour. Si votre activité évolue ou si vos besoins venaient à changer, nous réévaluerons ensemble la formule la plus adaptée.\n\nJe vous propose de fixer un rendez-vous téléphonique ou en visioconférence (WhatsApp) afin de vous présenter notre mode de fonctionnement, répondre à vos questions et, si vous le souhaitez, démarrer rapidement notre collaboration.\n\nN'hésitez pas à me communiquer vos disponibilités.\n\nJe vous remercie pour votre confiance et reste à votre entière disposition.\n\nBien cordialement,\n\nPascal NOTERMANS\nDirecteur opérationnel\nFIDUTRUST SRL\n+32 477 508 232\npascal@fidutrust.eu\nwww.fidutrust.eu`,
      '"""',
      '',
      `Translate/adapt naturally into ${langLabel} if it isn't French - do not do a literal word-for-word translation, write as a native professional speaker would. Use the OVERRIDDEN formula/price if you decided to override in step 1, otherwise use the mechanical match given above.`,
    ]
      .filter(Boolean)
      .join('\n');

    const content: Array<Record<string, unknown>> = [...(params.documentBlocks ?? []), { type: 'text', text: promptText }];

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        tools: [
          {
            name: 'submit_lead_analysis',
            description: 'Submit the internal analysis and the drafted proposal email for this lead.',
            input_schema: {
              type: 'object',
              properties: {
                formula_override: {
                  type: ['string', 'null'],
                  enum: ['Essentiel', 'Standard', 'Avance', 'Premium', 'Sur mesure', null],
                  description: 'Different formula than the mechanical match, only if clearly warranted. Otherwise null.',
                },
                override_reasoning: { type: 'string', description: 'One sentence why, in French. Empty string if no override.' },
                analysis_summary: { type: 'string', description: '2-4 sentence internal note for Pascal, in French.' },
                email_subject: { type: 'string' },
                email_body: { type: 'string', description: 'Full email body in the target language, matching the template structure.' },
              },
              required: ['analysis_summary', 'email_subject', 'email_body'],
            },
          },
        ],
        tool_choice: { type: 'tool', name: 'submit_lead_analysis' },
        messages: [{ role: 'user', content }],
      }),
    });

    if (!resp.ok) {
      console.error('Anthropic API error', resp.status, await resp.text());
      return null;
    }
    const data = await resp.json();
    const toolUse = (data.content as Array<Record<string, unknown>> | undefined)?.find((b) => b.type === 'tool_use');
    if (!toolUse || !toolUse.input) return null;
    const input = toolUse.input as Record<string, unknown>;

    return {
      analysisSummary: String(input.analysis_summary || ''),
      emailSubject: String(input.email_subject || ''),
      emailBody: String(input.email_body || ''),
      formulaOverride: (input.formula_override as string | null) || null,
      overrideReasoning: String(input.override_reasoning || ''),
    };
  } catch (err) {
    console.error('AI analysis failed', err);
    return null;
  }
}

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
  documentPaths?: string[];
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
      document_paths: body.documentPaths ?? null,
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

  // Optional AI refinement: reads the free-text message + uploaded document (if any)
  // to sanity-check the mechanical formula match and personalize the email. Never
  // blocks or fails the lead - falls back to the deterministic email below.
  let aiAnalysis: AIAnalysis | null = null;
  if (ANTHROPIC_KEY && formula) {
    const documentBlocks: Array<Record<string, unknown>> = [];
    for (const path of body.documentPaths ?? []) {
      try {
        const { data: fileData } = await supabase.storage.from('lead-documents').download(path);
        if (!fileData) continue;
        const ext = path.split('.').pop()?.toLowerCase();
        const mediaType = ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : null;
        if (!mediaType) continue; // .doc/.docx etc. aren't readable by the API - skipped, still listed for Pascal below
        const buf = Buffer.from(await fileData.arrayBuffer());
        const base64 = buf.toString('base64');
        documentBlocks.push(
          mediaType === 'application/pdf'
            ? { type: 'document', source: { type: 'base64', media_type: mediaType, data: base64 } }
            : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } }
        );
      } catch (err) {
        console.error('Could not download document for AI analysis', path, err);
      }
    }
    aiAnalysis = await getAIAnalysis({
      contactName: body.contactName,
      companyName: body.companyName,
      structureType: body.structureType,
      invoiceVolume: body.invoiceVolume,
      message: body.message,
      baselineFormula: formula,
      targetLang: body.contactLanguage || body.language || 'fr',
      documentBlocks,
    });
    if (aiAnalysis) {
      await supabase.from('leads').update({ ai_analysis: aiAnalysis.analysisSummary }).eq('id', lead.id);
    }
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
        body.documentPaths?.length ? `Documents joints (${body.documentPaths.length}) : ${body.documentPaths.join(', ')}` : '',
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
        const finalFormulaName = aiAnalysis?.formulaOverride || formula?.name;
        if (finalFormulaName && FORMULE_OPTIONS[finalFormulaName]) {
          customFields.push({ id: FIELD_FORMULE, value: FORMULE_OPTIONS[finalFormulaName] });
        }
        const finalPrice = aiAnalysis?.formulaOverride
          ? TIERS.societe.concat(TIERS.independant).find((t) => t.name === aiAnalysis.formulaOverride)?.price
          : formula?.price;
        if (finalPrice) customFields.push({ id: FIELD_PRIX, value: finalPrice });
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
        // nothing is ever emailed automatically to the prospect. Prefer the AI-refined
        // version (personalized from the message/document) when available, otherwise
        // fall back to the deterministic template.
        let commentWrite: Promise<unknown> = Promise.resolve();
        if (aiAnalysis) {
          const commentLines = [
            '🤖 Analyse IA (message + document) :',
            aiAnalysis.analysisSummary,
          ];
          if (aiAnalysis.formulaOverride && aiAnalysis.formulaOverride !== formula?.name) {
            commentLines.push(
              '',
              `⚠️ Formule ajustée par rapport au volume déclaré : ${aiAnalysis.formulaOverride}. Raison : ${aiAnalysis.overrideReasoning}`
            );
          }
          commentLines.push(
            '',
            '📧 Brouillon de proposition (à relire et adapter avant envoi) :',
            '',
            `Objet : ${aiAnalysis.emailSubject}`,
            '',
            aiAnalysis.emailBody
          );
          commentWrite = fetch(`https://api.clickup.com/api/v2/task/${taskId}/comment`, {
            method: 'POST',
            headers: { Authorization: CLICKUP_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment_text: commentLines.join('\n'), notify_all: false }),
          });
        } else if (formula) {
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
