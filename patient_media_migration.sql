-- ============================================================================
-- DENTPRO OS - PATIENT MEDIA & FILES PERSISTENCE MIGRATION
-- ============================================================================
-- Safely adds patient_media table and registers patient-media storage bucket.
-- Also alters clinical_notes table to add author_name column for robust parsing.
-- Compatible with single-clinic architecture (no clinic_id/tenant isolation changes).
-- ============================================================================

BEGIN;

-- 1. Create patient_media table
CREATE TABLE IF NOT EXISTS public.patient_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Clinical Photos', 'Consent Video Recordings')),
    storage_path TEXT NOT NULL,
    uploaded_by TEXT,
    tooth_number TEXT,
    treatment TEXT,
    appointment TEXT,
    prescription TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Alter clinical_notes to support author_name string fallback
ALTER TABLE public.clinical_notes ADD COLUMN IF NOT EXISTS author_name TEXT;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.patient_media ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
DROP POLICY IF EXISTS "Allow authenticated read media" ON public.patient_media;
CREATE POLICY "Allow authenticated read media" ON public.patient_media
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow staff write media" ON public.patient_media;
CREATE POLICY "Allow staff write media" ON public.patient_media
    FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist', 'receptionist', 'assistant'));

-- 5. Set up Supabase Storage bucket for patient media if storage schema is present
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-media', 'patient-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow authenticated access to patient media bucket" ON storage.objects;
CREATE POLICY "Allow authenticated access to patient media bucket"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'patient-media')
WITH CHECK (bucket_id = 'patient-media');

COMMIT;
