-- =====================================================================
-- Solar Buy-Side — Migration 0003: telefone no perfil (cole e Run)
-- Idempotente.
-- =====================================================================

alter table public.profiles
  add column if not exists phone text;
