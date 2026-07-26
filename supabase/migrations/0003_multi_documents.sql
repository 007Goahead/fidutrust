-- Support multiple uploaded documents per lead (was single statuts_file_path).
alter table public.leads
  add column if not exists document_paths text[];
