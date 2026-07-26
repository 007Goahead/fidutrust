# Formulaire de qualification client — mise en service

Ce que ce changement fait : les formulaires "Demande de devis" et "Contact" du site
n'ouvrent plus un client mail (mailto:) — ils enregistrent le lead dans Supabase et
créent automatiquement une tâche dans ClickUp (01 — CRM & Onboarding > CRM — Prospects).

## Variables d'environnement à ajouter dans Vercel

Vercel → projet fidutrust → Settings → Environment Variables :

| Nom | Valeur | Exposée au navigateur ? |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://ypfzkgogobfmagiivpwz.supabase.co` | Oui (nécessaire) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | la publishable key (sb_publishable_...) | Oui (conçue pour ça) |
| `SUPABASE_SERVICE_ROLE_KEY` | la secret key (sb_secret_...) | **Non, jamais** |
| `CLICKUP_API_TOKEN` | le token personnel ClickUp | **Non, jamais** |
| `CLICKUP_LIST_ID_CRM_PROSPECTS` | `901219609612` | Non |

Après les avoir ajoutées : redeploy sur Vercel (un redeploy est nécessaire pour que les
variables soient prises en compte).

## Ce qui a été fait côté code

- `supabase/migrations/0001_create_leads.sql` — table `leads` + bucket de stockage `lead-documents`
- `src/integrations/supabase/client.ts` — client Supabase (clé publique uniquement)
- `api/create-lead.ts` — fonction serveur Vercel : enregistre le lead + crée la tâche ClickUp
- `src/components/DemandeDevis.tsx` — vrai enregistrement au lieu du mailto, + N° TVA/BCE,
  "comment nous avez-vous connu", upload optionnel des statuts (PDF)
- `src/components/Contact.tsx` — même correction, formulaire simple

## Limite connue

Le champ ClickUp "Services souhaités" n'a que 7 options alors que le formulaire en propose 12
(ISOC, IPP, PEPPOL, plan financier, trésorerie n'ont pas d'équivalent direct). L'API ClickUp ne
permet pas de modifier les options d'un champ existant après coup (405 sur PUT et DELETE).
Ce n'est pas grave : la liste complète et exacte des besoins est toujours écrite dans la
description de la tâche. Si tu veux que le champ soit parfaitement complet, tu peux éditer ses
options toi-même dans ClickUp (Champ personnalisé → Modifier → Ajouter des options) en 1 minute.

## Test avant mise en prod

1. Ajouter les variables d'environnement dans Vercel + redeploy
2. Remplir le formulaire "Demande de devis" sur le site en preview/prod
3. Vérifier que le lead apparaît dans Supabase (table `leads`) et qu'une tâche apparaît dans
   ClickUp (01 — CRM & Onboarding > CRM — Prospects)
