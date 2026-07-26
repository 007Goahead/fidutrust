// Pricing tiers - keep in sync with src/components/FormulesSocietes.tsx
// and src/components/FormulesIndependants.tsx. There is no shared source of
// truth on purpose (client bundle vs. serverless function) - if pricing
// changes on the site, update both places.

export interface FormulaMatch {
  key: '120' | '250' | '375' | '500' | 'custom';
  name: string; // French name, used as the ClickUp "Formule proposee" option
  price: number | null; // null for custom/sur-mesure
  monthlyInvoicesRange: string; // e.g. "10 a 20", used in the email
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

export function matchFormula(structureType: string | undefined, invoiceVolume: string | undefined): FormulaMatch | null {
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

export function buildProposalEmail(lang: string, inputs: EmailInputs): { subject: string; body: string } {
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
