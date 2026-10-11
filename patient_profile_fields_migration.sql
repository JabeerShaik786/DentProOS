-- ============================================================================
-- DENTPRO OS - PATIENT PROFILE FIELDS PERSISTENCE MIGRATION (UPDATED)
-- ============================================================================
-- Safely adds genuinely missing patient profile columns to public.patients table.
-- Reuses existing name and address columns to prevent duplicate/redundant data.
-- Compatible with single-clinic architecture.
-- ============================================================================

BEGIN;

ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS current_medications TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS first_visit DATE;

-- Safely add preferred_dentist_id foreign key referencing doctors(id)
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS preferred_dentist_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL;

COMMIT;
