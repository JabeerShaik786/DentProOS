-- ============================================================================
-- DENTPRO OS - PATIENT FILES & SCANS PERSISTENCE MIGRATION
-- ============================================================================
-- Safely adds patient_files table and registers patient-files storage bucket.
-- Compatible with single-clinic architecture (no clinic_id/tenant isolation changes).
-- ============================================================================

BEGIN;

-- 1. Create patient_files table
CREATE TABLE IF NOT EXISTS public.patient_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_type TEXT,
    category TEXT,
    storage_path TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add index on patient_id for quick lookups
CREATE INDEX IF NOT EXISTS patient_files_patient_id_idx ON public.patient_files(patient_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.patient_files ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
DROP POLICY IF EXISTS "Allow authenticated read patient_files" ON public.patient_files;
CREATE POLICY "Allow authenticated read patient_files" ON public.patient_files
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow staff write patient_files" ON public.patient_files;
CREATE POLICY "Allow staff write patient_files" ON public.patient_files
    FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist', 'receptionist', 'assistant'));

-- 5. Set up Supabase Storage bucket for patient files if storage schema is present
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-files', 'patient-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow authenticated access to patient files bucket" ON storage.objects;
CREATE POLICY "Allow authenticated access to patient files bucket"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'patient-files')
WITH CHECK (bucket_id = 'patient-files');

COMMIT;
