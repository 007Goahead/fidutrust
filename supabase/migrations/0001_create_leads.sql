-- Leads table: fed by the DemandeDevis and Contact forms on fidutrust.eu
-- Public (anon) can INSERT only. Reads/updates happen server-side (service_role),
-- from the /api/create-lead function and any future back-office tooling.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  source_form text not null default 'devis', -- 'devis' | 'contact'
  language text,                              -- 'fr' | 'nl' | 'en'

  -- Identity
  company_name text,
  contact_name text not null,
  email text not null,
  phone text,
  vat_number text,                            -- N° TVA / BCE, optional at this stage

  -- Qualification (from DemandeDevis)
  structure_type text,                        -- 'societe' | 'independant'
  invoice_volume text,                        -- '120' | '250' | '375' | '500' | 'plus500'
  needs text[],                                -- selected need keys, e.g. {tva,comptabilite,ubo}
  current_situation text,                     -- 'creation' | 'changement' | 'reprise' | 'optimisation' | 'autre'
  preferred_contact text,                     -- 'email' | 'phone'
  urgency text,                                -- 'urgent' | 'normal' | 'flexible'
  message text,
  lead_source text,                            -- how they heard about Fidutrust

  -- Optional document upload (Articles of Association etc.)
  statuts_file_path text,                     -- path inside the lead-documents storage bucket

  -- ClickUp sync (filled in server-side after task creation)
  clickup_task_id text,
  clickup_task_url text,
  clickup_synced_at timestamptz
);

alter table public.leads enable row level security;

create policy "Public can submit a lead"
  on public.leads
  for insert
  to anon
  with check (true);

-- No select/update/delete policy for anon: only service_role (used server-side) can read/modify.

-- Storage bucket for optional document uploads (Articles of Association, ID, etc.)
insert into storage.buckets (id, name, public)
values ('lead-documents', 'lead-documents', false)
on conflict (id) do nothing;

create policy "Public can upload lead documents"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'lead-documents');

-- No select policy for anon on storage.objects: uploaded files are not publicly listable/readable.
-- Staff access them via signed URLs generated server-side (service_role) when reviewing a lead.
