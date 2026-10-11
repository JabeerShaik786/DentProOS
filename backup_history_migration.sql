-- ============================================================================
-- DENTPRO OS - BACKUP HISTORY TABLE & RLS MIGRATION
-- Single-Clinic Model: Persistent database backup history for clinic Owners.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.backup_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL CHECK (status IN ('triggered', 'completed', 'failed')),
    backup_size BIGINT NULL,
    file_name TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL
);

-- Enable Row Level Security
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

-- Idempotency: Drop policy if exists
DROP POLICY IF EXISTS "Owner full access on backup_history" ON public.backup_history;

-- Policy: Only authenticated Owner users can access backup history
CREATE POLICY "Owner full access on backup_history" ON public.backup_history
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'owner')
    WITH CHECK (public.get_user_role() = 'owner');

-- Privileges
GRANT ALL ON TABLE public.backup_history TO authenticated;
GRANT ALL ON TABLE public.backup_history TO service_role;
