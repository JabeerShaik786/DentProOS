-- ============================================================================
-- DENTPRO OS - REVISED SINGLE CLINIC SIMPLIFICATION MIGRATION
-- ============================================================================
-- Consolidates multi-clinic architecture to a single-clinic model.
-- Migrates staff data securely without fake auth users, handles clinic_id removal,
-- drops clinics and staff tables, and secures doctors/appointments/patients/billing.
-- ============================================================================

BEGIN;

-- 1. Create Role-Resolution Helper Function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- 2. Modify Profiles Table (Drop strict auth FK to allow non-login staff profiles)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey1;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('Active', 'Inactive', 'On Leave')) DEFAULT 'Active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_login BOOLEAN DEFAULT FALSE;

-- Update Profiles Role Constraints to match allowed roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'doctor', 'receptionist', 'staff', 'dentist', 'assistant'));

-- 3. Create Trigger to Automatically Manage has_login Column
CREATE OR REPLACE FUNCTION public.handle_profile_has_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.has_login := EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_profile_has_login ON public.profiles;
CREATE TRIGGER tr_profile_has_login
    BEFORE INSERT OR UPDATE OF id ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_profile_has_login();

-- 4. Create Trigger to Preserve On-Delete-Cascade for Login Profiles
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.profiles WHERE id = OLD.id;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS tr_user_delete ON auth.users;
CREATE TRIGGER tr_user_delete
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_delete();

-- 5. Migrate Staff Records (Both Login and Non-Login Accounts)
DO $$
DECLARE
    r RECORD;
    v_profile_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff' AND table_schema = 'public') THEN
        FOR r IN SELECT * FROM public.staff LOOP
            -- Determine profile ID (generate a new UUID for non-login accounts)
            IF r.profile_id IS NOT NULL THEN
                v_profile_id := r.profile_id;
            ELSE
                v_profile_id := gen_random_uuid();
                -- Link the staff record to the generated ID for validation
                UPDATE public.staff SET profile_id = v_profile_id WHERE id = r.id;
            END IF;

            -- Insert or update the profile record
            IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_profile_id) THEN
                UPDATE public.profiles
                SET 
                    phone = COALESCE(profiles.phone, r.phone),
                    status = COALESCE(r.status, 'Active'),
                    role = COALESCE(profiles.role, 
                        CASE
                            WHEN LOWER(r.role) LIKE '%nurse%' THEN 'staff'
                            WHEN LOWER(r.role) LIKE '%hygienist%' THEN 'staff'
                            WHEN LOWER(r.role) LIKE '%desk%' THEN 'receptionist'
                            WHEN LOWER(r.role) LIKE '%billing%' THEN 'receptionist'
                            WHEN LOWER(r.role) LIKE '%assistant%' THEN 'staff'
                            WHEN LOWER(r.role) LIKE '%dentist%' THEN 'doctor'
                            WHEN LOWER(r.role) LIKE '%doctor%' THEN 'doctor'
                            WHEN LOWER(r.role) LIKE '%admin%' THEN 'admin'
                            ELSE 'staff'
                        END
                    )
                WHERE id = v_profile_id;
            ELSE
                INSERT INTO public.profiles (
                    id,
                    full_name,
                    role,
                    phone,
                    status,
                    created_at
                ) VALUES (
                    v_profile_id,
                    r.name,
                    CASE
                        WHEN LOWER(r.role) LIKE '%nurse%' THEN 'staff'
                        WHEN LOWER(r.role) LIKE '%hygienist%' THEN 'staff'
                        WHEN LOWER(r.role) LIKE '%desk%' THEN 'receptionist'
                        WHEN LOWER(r.role) LIKE '%billing%' THEN 'receptionist'
                        WHEN LOWER(r.role) LIKE '%assistant%' THEN 'staff'
                        WHEN LOWER(r.role) LIKE '%dentist%' THEN 'doctor'
                        WHEN LOWER(r.role) LIKE '%doctor%' THEN 'doctor'
                        WHEN LOWER(r.role) LIKE '%admin%' THEN 'admin'
                        ELSE 'staff'
                    END,
                    r.phone,
                    r.status,
                    r.created_at
                );
            END IF;
        END LOOP;
    END IF;
END;
$$;

-- 6. Direct Update for Existing Non-Staff Profiles
UPDATE public.profiles p
SET has_login = TRUE
WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);

-- 7. Validation Check: Ensure all staff records have been migrated successfully
DO $$
DECLARE
    v_unmigrated_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff' AND table_schema = 'public') THEN
        SELECT COUNT(*) INTO v_unmigrated_count
        FROM public.staff s
        LEFT JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.id IS NULL OR p.phone IS NULL OR p.status IS NULL;

        IF v_unmigrated_count > 0 THEN
            RAISE EXCEPTION 'Validation failed: % staff records not successfully migrated to profiles.', v_unmigrated_count;
        END IF;
    END IF;
END;
$$;

-- 8. Drop Dependent RLS Policies (Including custom insert notifications policy)
DROP POLICY IF EXISTS "Allow users to read profiles in their clinic" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile details" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile details" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read patients from their clinic" ON public.patients;
DROP POLICY IF EXISTS "Allow users to insert patients in their clinic" ON public.patients;
DROP POLICY IF EXISTS "Allow users to update patients in their clinic" ON public.patients;
DROP POLICY IF EXISTS "Allow users to delete patients in their clinic" ON public.patients;
DROP POLICY IF EXISTS "Allow users to read billing from their clinic" ON public.billing;
DROP POLICY IF EXISTS "Allow users to insert billing in their clinic" ON public.billing;
DROP POLICY IF EXISTS "Allow users to update billing in their clinic" ON public.billing;
DROP POLICY IF EXISTS "Allow users to delete billing in their clinic" ON public.billing;
DROP POLICY IF EXISTS "Allow users to read their own clinic details" ON public.clinics;
DROP POLICY IF EXISTS "Allow users to read doctors in their clinic" ON public.doctors;
DROP POLICY IF EXISTS "Allow users to insert doctors in their clinic" ON public.doctors;
DROP POLICY IF EXISTS "Allow users to update doctors in their clinic" ON public.doctors;
DROP POLICY IF EXISTS "Allow users to delete doctors in their clinic" ON public.doctors;
DROP POLICY IF EXISTS "Allow users to read staff in their clinic" ON public.staff;
DROP POLICY IF EXISTS "Allow users to insert staff in their clinic" ON public.staff;
DROP POLICY IF EXISTS "Allow users to update staff in their clinic" ON public.staff;
DROP POLICY IF EXISTS "Allow users to delete staff in their clinic" ON public.staff;
DROP POLICY IF EXISTS "Allow users to read settings in their clinic" ON public.clinic_settings;
DROP POLICY IF EXISTS "Allow users to insert settings in their clinic" ON public.clinic_settings;
DROP POLICY IF EXISTS "Allow users to update settings in their clinic" ON public.clinic_settings;
DROP POLICY IF EXISTS "Allow users to read appointments in their clinic" ON public.appointments;
DROP POLICY IF EXISTS "Allow users to insert appointments in their clinic" ON public.appointments;
DROP POLICY IF EXISTS "Allow users to update appointments in their clinic" ON public.appointments;
DROP POLICY IF EXISTS "Allow users to delete appointments in their clinic" ON public.appointments;
DROP POLICY IF EXISTS "Allow users to read dental chart in their clinic" ON public.dental_chart;
DROP POLICY IF EXISTS "Allow users to insert dental chart in their clinic" ON public.dental_chart;
DROP POLICY IF EXISTS "Allow users to update dental chart in their clinic" ON public.dental_chart;
DROP POLICY IF EXISTS "Allow users to read treatments in their clinic" ON public.treatments;
DROP POLICY IF EXISTS "Allow users to insert treatments in their clinic" ON public.treatments;
DROP POLICY IF EXISTS "Allow users to update treatments in their clinic" ON public.treatments;
DROP POLICY IF EXISTS "Allow users to read prescriptions in their clinic" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow users to insert prescriptions in their clinic" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow users to update prescriptions in their clinic" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow users to read clinical notes in their clinic" ON public.clinical_notes;
DROP POLICY IF EXISTS "Allow users to insert clinical notes in their clinic" ON public.clinical_notes;
DROP POLICY IF EXISTS "Allow users to update clinical notes in their clinic" ON public.clinical_notes;
DROP POLICY IF EXISTS "Allow users to read invoices in their clinic" ON public.invoices;
DROP POLICY IF EXISTS "Allow users to insert invoices in their clinic" ON public.invoices;
DROP POLICY IF EXISTS "Allow users to update invoices in their clinic" ON public.invoices;
DROP POLICY IF EXISTS "Allow users to read invoice items in their clinic" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow users to insert invoice items in their clinic" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow users to read payments in their clinic" ON public.payments;
DROP POLICY IF EXISTS "Allow users to insert payments in their clinic" ON public.payments;
DROP POLICY IF EXISTS "Allow users to read notifications in their clinic" ON public.notifications;
DROP POLICY IF EXISTS "Allow users to insert notifications in their clinic" ON public.notifications;
DROP POLICY IF EXISTS "Allow users to update notifications in their clinic" ON public.notifications;
DROP POLICY IF EXISTS "Allow users to read activities in their clinic" ON public.activities;
DROP POLICY IF EXISTS "Allow users to insert activities in their clinic" ON public.activities;

-- 9. Drop clinic_id Indexes
DROP INDEX IF EXISTS public.idx_doctors_clinic_id;
DROP INDEX IF EXISTS public.idx_staff_clinic_id;
DROP INDEX IF EXISTS public.idx_appointments_clinic_id;
DROP INDEX IF EXISTS public.idx_patients_clinic_patient;
DROP INDEX IF EXISTS public.idx_appointments_clinic_date;
DROP INDEX IF EXISTS public.idx_appointments_clinic_status;
DROP INDEX IF EXISTS public.idx_invoices_clinic_status;

-- 10. Drop foreign keys referencing clinics
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_clinic_id_fkey;
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_clinic_id_fkey;
ALTER TABLE public.billing DROP CONSTRAINT IF EXISTS billing_clinic_id_fkey;
ALTER TABLE public.doctors DROP CONSTRAINT IF EXISTS doctors_clinic_id_fkey;
ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_clinic_id_fkey;
ALTER TABLE public.clinic_settings DROP CONSTRAINT IF EXISTS clinic_settings_clinic_id_fkey;
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_clinic_id_fkey;
ALTER TABLE public.dental_chart DROP CONSTRAINT IF EXISTS dental_chart_clinic_id_fkey;
ALTER TABLE public.treatments DROP CONSTRAINT IF EXISTS treatments_clinic_id_fkey;
ALTER TABLE public.prescriptions DROP CONSTRAINT IF EXISTS prescriptions_clinic_id_fkey;
ALTER TABLE public.clinical_notes DROP CONSTRAINT IF EXISTS clinical_notes_clinic_id_fkey;
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_clinic_id_fkey;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_clinic_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_clinic_id_fkey;
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_clinic_id_fkey;

-- 11. Drop clinic_id Columns From All Tables
ALTER TABLE public.profiles DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.patients DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.billing DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.doctors DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.clinic_settings DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.appointments DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.dental_chart DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.treatments DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.prescriptions DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.clinical_notes DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.invoices DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.payments DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE public.activities DROP COLUMN IF EXISTS clinic_id;

-- 12. Drop get_user_clinic_id function
DROP FUNCTION IF EXISTS public.get_user_clinic_id() CASCADE;

-- 13. Drop Tables
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.clinics CASCADE;

-- 14. Secure doctor profile mapping (ON DELETE SET NULL)
ALTER TABLE public.doctors DROP CONSTRAINT IF EXISTS doctors_profile_id_fkey;
ALTER TABLE public.doctors ADD CONSTRAINT doctors_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 15. Enable RLS and Create Secure Role-Based Access Policies

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert own profile" ON public.profiles;
CREATE POLICY "Allow authenticated insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Allow authenticated update own profile or admin" ON public.profiles;
CREATE POLICY "Allow authenticated update own profile or admin" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.get_user_role() = 'admin');

-- patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read patients" ON public.patients;
CREATE POLICY "Allow staff read patients" ON public.patients FOR SELECT TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'receptionist', 'staff', 'dentist', 'assistant'));
DROP POLICY IF EXISTS "Allow staff write patients" ON public.patients;
CREATE POLICY "Allow staff write patients" ON public.patients FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'receptionist', 'staff', 'dentist', 'assistant'));

-- billing
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read billing" ON public.billing;
CREATE POLICY "Allow staff read billing" ON public.billing FOR SELECT TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'receptionist', 'staff', 'dentist', 'assistant'));
DROP POLICY IF EXISTS "Allow billing staff write" ON public.billing;
CREATE POLICY "Allow billing staff write" ON public.billing FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'receptionist'));

-- doctors
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read doctors" ON public.doctors;
CREATE POLICY "Allow authenticated read doctors" ON public.doctors FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow admin edit doctors" ON public.doctors;
CREATE POLICY "Allow admin edit doctors" ON public.doctors FOR ALL TO authenticated USING (public.get_user_role() = 'admin');

-- clinic_settings
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read settings" ON public.clinic_settings;
CREATE POLICY "Allow authenticated read settings" ON public.clinic_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow admin write settings" ON public.clinic_settings;
CREATE POLICY "Allow admin write settings" ON public.clinic_settings FOR ALL TO authenticated USING (public.get_user_role() = 'admin');

-- appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read appointments" ON public.appointments;
CREATE POLICY "Allow staff read appointments" ON public.appointments FOR SELECT TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'receptionist', 'staff', 'dentist', 'assistant'));
DROP POLICY IF EXISTS "Allow staff write appointments" ON public.appointments;
CREATE POLICY "Allow staff write appointments" ON public.appointments FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'receptionist', 'staff', 'dentist', 'assistant'));

-- dental_chart
ALTER TABLE public.dental_chart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read dental charts" ON public.dental_chart;
CREATE POLICY "Allow staff read dental charts" ON public.dental_chart FOR SELECT TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist'));
DROP POLICY IF EXISTS "Allow staff write dental charts" ON public.dental_chart;
CREATE POLICY "Allow staff write dental charts" ON public.dental_chart FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist'));

-- treatments
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read treatments" ON public.treatments;
CREATE POLICY "Allow staff read treatments" ON public.treatments FOR SELECT TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist'));
DROP POLICY IF EXISTS "Allow staff write treatments" ON public.treatments;
CREATE POLICY "Allow staff write treatments" ON public.treatments FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist'));

-- prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read prescriptions" ON public.prescriptions;
CREATE POLICY "Allow staff read prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist'));
DROP POLICY IF EXISTS "Allow staff write prescriptions" ON public.prescriptions;
CREATE POLICY "Allow staff write prescriptions" ON public.prescriptions FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist'));

-- clinical_notes
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read clinical notes" ON public.clinical_notes;
CREATE POLICY "Allow staff read clinical notes" ON public.clinical_notes FOR SELECT TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist'));
DROP POLICY IF EXISTS "Allow staff write clinical notes" ON public.clinical_notes;
CREATE POLICY "Allow staff write clinical notes" ON public.clinical_notes FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist'));

-- invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read invoices" ON public.invoices;
CREATE POLICY "Allow staff read invoices" ON public.invoices FOR SELECT TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'receptionist', 'staff', 'dentist', 'assistant'));
DROP POLICY IF EXISTS "Allow staff write invoices" ON public.invoices;
CREATE POLICY "Allow staff write invoices" ON public.invoices FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'receptionist'));

-- invoice_items
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read invoice items" ON public.invoice_items;
CREATE POLICY "Allow staff read invoice items" ON public.invoice_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow staff write invoice items" ON public.invoice_items;
CREATE POLICY "Allow staff write invoice items" ON public.invoice_items FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'receptionist'));

-- payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read payments" ON public.payments;
CREATE POLICY "Allow staff read payments" ON public.payments FOR SELECT TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'receptionist', 'staff', 'dentist', 'assistant'));
DROP POLICY IF EXISTS "Allow staff write payments" ON public.payments;
CREATE POLICY "Allow staff write payments" ON public.payments FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'receptionist'));

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users read own notifications" ON public.notifications;
CREATE POLICY "Allow users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON public.notifications;
CREATE POLICY "Allow authenticated insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow users update own notifications" ON public.notifications;
CREATE POLICY "Allow users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Allow users delete own notifications" ON public.notifications;
CREATE POLICY "Allow users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff read activities" ON public.activities;
CREATE POLICY "Allow staff read activities" ON public.activities FOR SELECT TO authenticated USING (public.get_user_role() IN ('admin', 'receptionist'));
DROP POLICY IF EXISTS "Allow authenticated insert activities" ON public.activities;
CREATE POLICY "Allow authenticated insert activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (true);

COMMIT;
