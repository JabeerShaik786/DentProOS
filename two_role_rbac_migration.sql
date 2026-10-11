-- ============================================================================
-- AUDITED TWO-ROLE RBAC PRODUCTION MIGRATION SCRIPT
-- Canonical Roles: 'owner', 'receptionist'
-- Architecture: Single-Clinic Model
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: DROP EXISTING ROLE CHECK CONSTRAINT FIRST
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- ----------------------------------------------------------------------------
-- STEP 2: CONVERT KNOWN LEGACY ROLES TO CANONICAL ROLES
-- ----------------------------------------------------------------------------
UPDATE public.profiles SET role = 'owner' WHERE role IN ('admin', 'doctor', 'dentist');
UPDATE public.profiles SET role = 'receptionist' WHERE role IN ('staff', 'assistant', 'frontdesk', 'billing');

-- ----------------------------------------------------------------------------
-- STEP 3: VALIDATE THAT ONLY CANONICAL ROLES REMAIN (FAIL FAST IF UNMAPPED)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_unmapped_count INT;
    v_unmapped_roles TEXT;
BEGIN
    SELECT COUNT(*), STRING_AGG(DISTINCT role, ', ')
    INTO v_unmapped_count, v_unmapped_roles
    FROM public.profiles
    WHERE role NOT IN ('owner', 'receptionist');

    IF v_unmapped_count > 0 THEN
        RAISE EXCEPTION 'Migration Aborted: Found % profile(s) with unmapped role value(s): [%]. Please inspect and map these roles before re-running.', v_unmapped_count, v_unmapped_roles;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 4: ADD NEW STRICT TWO-ROLE CHECK CONSTRAINT AFTER VALIDATION
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('owner', 'receptionist'));

-- ----------------------------------------------------------------------------
-- STEP 5: SECURITY DEFINER HELPER FUNCTION (Prevents RLS Recursion)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'receptionist');
$$;

-- ----------------------------------------------------------------------------
-- STEP 6: ATOMIC OWNER BOOTSTRAP & SECURE POST-BOOTSTRAP REGISTRATION TRIGGER
-- Concurrency Lock: Uses pg_advisory_xact_lock to guarantee atomic serialization.
-- Account Lifecycle: First registration becomes Active Owner; subsequent uninvited
-- public signups default to Inactive Receptionist (requiring Owner activation).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_owner_count INT;
BEGIN
    -- Acquire exclusive transaction-level advisory lock for atomic serialization
    PERFORM pg_advisory_xact_lock(hashtext('single_clinic_owner_bootstrap_lock'));

    -- Count existing Owner profiles
    SELECT COUNT(*) INTO v_owner_count FROM public.profiles WHERE role = 'owner';
    
    IF v_owner_count = 0 THEN
        -- Initial bootstrap: first account created in system becomes Active Owner / Dentist
        INSERT INTO public.profiles (id, full_name, role, has_login, status)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'owner', true, 'Active')
        ON CONFLICT (id) DO UPDATE SET role = 'owner', status = 'Active';
    ELSE
        -- Subsequent uninvited public signups default to Inactive Receptionist (Requires Owner activation)
        INSERT INTO public.profiles (id, full_name, role, has_login, status)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'receptionist', true, 'Inactive')
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- CLEANUP: DROP ALL LEGACY PERMISSIVE POLICIES TO PREVENT ACCESS BYPASS
-- ============================================================================

-- Profiles
DROP POLICY IF EXISTS "Allow users read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated update own profile or admin" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow owner write profiles" ON public.profiles;
DROP POLICY IF EXISTS "rbac_select_profiles" ON public.profiles;
DROP POLICY IF EXISTS "rbac_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "rbac_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "rbac_delete_profiles" ON public.profiles;

-- Patients
DROP POLICY IF EXISTS "Allow staff read patients" ON public.patients;
DROP POLICY IF EXISTS "Allow staff write patients" ON public.patients;
DROP POLICY IF EXISTS "rbac_select_patients" ON public.patients;
DROP POLICY IF EXISTS "rbac_insert_patients" ON public.patients;
DROP POLICY IF EXISTS "rbac_update_patients" ON public.patients;
DROP POLICY IF EXISTS "rbac_delete_patients" ON public.patients;

-- Appointments & Blocked Slots
DROP POLICY IF EXISTS "Allow staff read appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow staff write appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow authenticated read blocked_slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Allow staff read blocked_slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Allow staff write blocked_slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "rbac_select_appointments" ON public.appointments;
DROP POLICY IF EXISTS "rbac_insert_appointments" ON public.appointments;
DROP POLICY IF EXISTS "rbac_update_appointments" ON public.appointments;
DROP POLICY IF EXISTS "rbac_delete_appointments" ON public.appointments;
DROP POLICY IF EXISTS "rbac_select_blocked_slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "rbac_insert_blocked_slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "rbac_update_blocked_slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "rbac_delete_blocked_slots" ON public.blocked_slots;

-- Clinical Data
DROP POLICY IF EXISTS "Allow staff read dental charts" ON public.dental_chart;
DROP POLICY IF EXISTS "Allow staff write dental charts" ON public.dental_chart;
DROP POLICY IF EXISTS "Allow owner write dental charts" ON public.dental_chart;
DROP POLICY IF EXISTS "rbac_select_dental_chart" ON public.dental_chart;
DROP POLICY IF EXISTS "rbac_insert_dental_chart" ON public.dental_chart;
DROP POLICY IF EXISTS "rbac_update_dental_chart" ON public.dental_chart;
DROP POLICY IF EXISTS "rbac_delete_dental_chart" ON public.dental_chart;

DROP POLICY IF EXISTS "Allow staff read treatments" ON public.treatments;
DROP POLICY IF EXISTS "Allow staff write treatments" ON public.treatments;
DROP POLICY IF EXISTS "Allow owner write treatments" ON public.treatments;
DROP POLICY IF EXISTS "rbac_select_treatments" ON public.treatments;
DROP POLICY IF EXISTS "rbac_insert_treatments" ON public.treatments;
DROP POLICY IF EXISTS "rbac_update_treatments" ON public.treatments;
DROP POLICY IF EXISTS "rbac_delete_treatments" ON public.treatments;

DROP POLICY IF EXISTS "Allow staff read prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow staff write prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow owner write prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "rbac_select_prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "rbac_insert_prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "rbac_update_prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "rbac_delete_prescriptions" ON public.prescriptions;

DROP POLICY IF EXISTS "Allow staff read clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Allow staff write clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "Allow owner write clinical notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "rbac_select_clinical_notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "rbac_insert_clinical_notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "rbac_update_clinical_notes" ON public.clinical_notes;
DROP POLICY IF EXISTS "rbac_delete_clinical_notes" ON public.clinical_notes;

-- Billing & Invoices
DROP POLICY IF EXISTS "Allow staff read billing" ON public.billing;
DROP POLICY IF EXISTS "Allow staff write billing" ON public.billing;
DROP POLICY IF EXISTS "Allow billing staff write" ON public.billing;
DROP POLICY IF EXISTS "Allow staff read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow staff write invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow staff read invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow staff write invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow staff read payments" ON public.payments;
DROP POLICY IF EXISTS "Allow staff write payments" ON public.payments;
DROP POLICY IF EXISTS "rbac_select_billing" ON public.billing;
DROP POLICY IF EXISTS "rbac_insert_billing" ON public.billing;
DROP POLICY IF EXISTS "rbac_update_billing" ON public.billing;
DROP POLICY IF EXISTS "rbac_delete_billing" ON public.billing;

-- Settings & Doctors
DROP POLICY IF EXISTS "Allow authenticated read settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Allow staff read settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Allow admin write settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Allow owner write settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "rbac_select_clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "rbac_insert_clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "rbac_update_clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "rbac_delete_clinic_settings" ON public.clinic_settings;

DROP POLICY IF EXISTS "Allow authenticated read doctors" ON public.doctors;
DROP POLICY IF EXISTS "Allow staff read doctors" ON public.doctors;
DROP POLICY IF EXISTS "Allow admin edit doctors" ON public.doctors;
DROP POLICY IF EXISTS "Allow owner write doctors" ON public.doctors;
DROP POLICY IF EXISTS "rbac_select_doctors" ON public.doctors;
DROP POLICY IF EXISTS "rbac_insert_doctors" ON public.doctors;
DROP POLICY IF EXISTS "rbac_update_doctors" ON public.doctors;
DROP POLICY IF EXISTS "rbac_delete_doctors" ON public.doctors;

-- Activities & Notifications
DROP POLICY IF EXISTS "Allow staff read activities" ON public.activities;
DROP POLICY IF EXISTS "Allow authenticated insert activities" ON public.activities;
DROP POLICY IF EXISTS "Allow users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow users delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "rbac_select_activities" ON public.activities;
DROP POLICY IF EXISTS "rbac_insert_activities" ON public.activities;
DROP POLICY IF EXISTS "rbac_update_activities" ON public.activities;
DROP POLICY IF EXISTS "rbac_delete_activities" ON public.activities;
DROP POLICY IF EXISTS "rbac_select_notifications" ON public.notifications;
DROP POLICY IF EXISTS "rbac_insert_notifications" ON public.notifications;
DROP POLICY IF EXISTS "rbac_update_notifications" ON public.notifications;
DROP POLICY IF EXISTS "rbac_delete_notifications" ON public.notifications;

-- ============================================================================
-- EXPLICIT TWO-ROLE RLS POLICIES (STRICT OWNER vs RECEPTIONIST)
-- ============================================================================

-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_profiles" ON public.profiles 
    FOR SELECT TO authenticated 
    USING (true);

-- Strict Insert Policy: Client-side inserts restricted to self-receptionist or Owner creating Receptionist
CREATE POLICY "rbac_insert_profiles" ON public.profiles 
    FOR INSERT TO authenticated 
    WITH CHECK (
        (public.get_user_role() = 'owner' AND role = 'receptionist')
        OR (auth.uid() = id AND role = 'receptionist')
    );

-- Strict Update Policy: Owner can update any profile; Receptionist can update own profile WITHOUT changing role to owner
CREATE POLICY "rbac_update_profiles" ON public.profiles 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id OR public.get_user_role() = 'owner') 
    WITH CHECK (
        public.get_user_role() = 'owner' 
        OR (auth.uid() = id AND role = 'receptionist')
    );

CREATE POLICY "rbac_delete_profiles" ON public.profiles 
    FOR DELETE TO authenticated 
    USING (public.get_user_role() = 'owner');

-- 2. PATIENTS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_patients" ON public.patients FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_update_patients" ON public.patients FOR UPDATE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist')) WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_delete_patients" ON public.patients FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- 3. APPOINTMENTS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_appointments" ON public.appointments FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_update_appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist')) WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_delete_appointments" ON public.appointments FOR DELETE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));

-- 4. BLOCKED SLOTS
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_blocked_slots" ON public.blocked_slots FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_blocked_slots" ON public.blocked_slots FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_update_blocked_slots" ON public.blocked_slots FOR UPDATE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist')) WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_delete_blocked_slots" ON public.blocked_slots FOR DELETE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));

-- 5. DENTAL CHART (Owner Edit Only)
ALTER TABLE public.dental_chart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_dental_chart" ON public.dental_chart FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_dental_chart" ON public.dental_chart FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_update_dental_chart" ON public.dental_chart FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_delete_dental_chart" ON public.dental_chart FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- 6. TREATMENTS (Owner Edit Only)
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_treatments" ON public.treatments FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_treatments" ON public.treatments FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_update_treatments" ON public.treatments FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_delete_treatments" ON public.treatments FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- 7. PRESCRIPTIONS (Owner Edit Only)
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_prescriptions" ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_update_prescriptions" ON public.prescriptions FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_delete_prescriptions" ON public.prescriptions FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- 8. CLINICAL NOTES (Owner Edit Only)
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_clinical_notes" ON public.clinical_notes FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_clinical_notes" ON public.clinical_notes FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_update_clinical_notes" ON public.clinical_notes FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_delete_clinical_notes" ON public.clinical_notes FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- 9. BILLING & PAYMENTS
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_billing" ON public.billing FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_billing" ON public.billing FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_update_billing" ON public.billing FOR UPDATE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist')) WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_delete_billing" ON public.billing FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- 10. CLINIC SETTINGS (Owner Write Only)
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_clinic_settings" ON public.clinic_settings FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_clinic_settings" ON public.clinic_settings FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_update_clinic_settings" ON public.clinic_settings FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_delete_clinic_settings" ON public.clinic_settings FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- 11. DOCTORS (Owner Write Only)
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_doctors" ON public.doctors FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_doctors" ON public.doctors FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_update_doctors" ON public.doctors FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_delete_doctors" ON public.doctors FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- 12. NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_notifications" ON public.notifications FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_update_notifications" ON public.notifications FOR UPDATE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist')) WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_delete_notifications" ON public.notifications FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- 13. ACTIVITIES
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbac_select_activities" ON public.activities FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_insert_activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
CREATE POLICY "rbac_update_activities" ON public.activities FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY "rbac_delete_activities" ON public.activities FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');
