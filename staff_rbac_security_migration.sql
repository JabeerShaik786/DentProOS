-- Incremental migration for Staff and Doctor RBAC & Security fixes

-- 1. Update get_user_role to check for status = 'Active'
-- Deactivated or on-leave staff will immediately return NULL role, triggering RLS access rejection.
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid() AND status = 'Active');
END;
$$;

-- 2. Modify doctors status CHECK constraint to permit 'Inactive' status for deactivation
ALTER TABLE public.doctors DROP CONSTRAINT IF EXISTS doctors_status_check;
ALTER TABLE public.doctors ADD CONSTRAINT doctors_status_check CHECK (status IN ('Available', 'In Consultation', 'On Break', 'Finished Today', 'Inactive'));
