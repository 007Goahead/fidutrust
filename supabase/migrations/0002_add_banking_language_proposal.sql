-- Banking details, preferred contact language, and the auto-computed pricing
-- proposal (formula match + optional AI-refined analysis of message/documents).

alter table public.leads
  add column if not exists iban text,
  add column if not exists bank_name text,
  add column if not exists contact_language text,
  add column if not exists proposed_formula text,
  add column if not exists proposed_price numeric,
  add column if not exists ai_analysis text;
