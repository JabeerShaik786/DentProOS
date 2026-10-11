-- ============================================================================
-- DENTPRO OS — COMPLETE SINGLE-CLINIC DATABASE SCHEMA INITIALIZATION
-- ============================================================================
-- Architecture: Single-Clinic Per Installation Model
-- Canonical Roles: 'owner' (Dentist / Practice Owner), 'receptionist' (Front Desk)
-- Security: Row Level Security (RLS) on all tables with strict role boundaries
-- Concurrency: Atomic pg_advisory_xact_lock for initial owner bootstrapping
-- Re-runnable: Fully idempotent DDL using IF NOT EXISTS and DROP POLICY IF EXISTS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. RBAC HELPER FUNCTIONS (SECURITY DEFINER to prevent RLS recursion)
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
-- 3. PROFILES TABLE & AUTH USER SYNCHRONIZATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'receptionist' CHECK (role IN ('owner', 'receptionist')),
    phone TEXT,
    custom_title TEXT,
    has_login BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- First user bootstrap: First registered auth account becomes Active Owner;
-- subsequent uninvited signups default to Inactive Receptionist (requiring Owner activation).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_owner_count INT;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('dentpro_single_clinic_owner_bootstrap_lock'));

    SELECT COUNT(*) INTO v_owner_count FROM public.profiles WHERE role = 'owner';
    
    IF v_owner_count = 0 THEN
        INSERT INTO public.profiles (id, full_name, role, has_login, status)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'owner', true, 'Active')
        ON CONFLICT (id) DO UPDATE SET role = 'owner', status = 'Active';
    ELSE
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

-- ----------------------------------------------------------------------------
-- 4. CLINIC SETTINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_name TEXT NOT NULL DEFAULT 'DentPro Dental Clinic',
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    tax_percentage NUMERIC DEFAULT 18,
    currency_symbol TEXT DEFAULT '₹',
    working_hours JSONB DEFAULT '{"weekdays": "9:00 AM - 8:00 PM", "sunday": "Closed"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. DOCTORS / PRACTITIONERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    specialty TEXT DEFAULT 'General Dentist',
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'In Surgery', 'Off Duty', 'Active')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. PATIENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group TEXT,
    address TEXT,
    visit TEXT,
    medical_notes TEXT,
    medical_conditions TEXT,
    balance TEXT DEFAULT '₹0',
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Waiting', 'In-Chair', 'Completed')),
    token TEXT,
    patient_type TEXT DEFAULT 'New' CHECK (patient_type IN ('New', 'Returning')),
    dental_chart JSONB DEFAULT '{}'::jsonb,
    treatment_advised JSONB DEFAULT '[]'::jsonb,
    prescriptions TEXT[] DEFAULT ARRAY[]::TEXT[],
    files JSONB DEFAULT '[]'::jsonb,
    notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);

-- ----------------------------------------------------------------------------
-- 7. APPOINTMENTS & CALENDAR BLOCKED SLOTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT,
    patient_uuid UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    phone TEXT,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    doctor_name TEXT,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    treatment TEXT,
    status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Waiting', 'In Consultation', 'Completed', 'Cancelled', 'No Show')),
    notes TEXT,
    token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Prevent double-booking for the same active doctor at the same slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_double_booking 
ON public.appointments (doctor_id, appointment_date, time_slot) 
WHERE (status != 'Cancelled' AND status != 'No Show' AND doctor_id IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.blocked_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocked_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON public.blocked_slots(blocked_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_slots_unique 
ON public.blocked_slots (blocked_date, time_slot, COALESCE(doctor_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- ----------------------------------------------------------------------------
-- 8. CLINICAL DATA (DENTAL CHART, TREATMENTS, PRESCRIPTIONS, NOTES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dental_chart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    tooth_number INTEGER NOT NULL,
    condition TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT,
    treatment_name TEXT NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    doctor_name TEXT,
    teeth_numbers INTEGER[],
    cost NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'In Progress' CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Cancelled')),
    notes TEXT,
    treatment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    doctor_name TEXT,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    advice TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 9. MEDICINES & INVENTORY STOCK TRANSACTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    stock_unit TEXT DEFAULT 'Strips',
    opening_stock NUMERIC NULL,
    available_quantity NUMERIC NULL,
    low_stock_threshold NUMERIC DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    is_configured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('opening_stock', 'stock_in', 'stock_out', 'dispense', 'adjustment')),
    quantity NUMERIC NOT NULL,
    previous_quantity NUMERIC DEFAULT 0,
    new_quantity NUMERIC NOT NULL,
    reference TEXT,
    notes TEXT,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 10. BILLING & INVOICES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    doctor TEXT,
    treatment TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    balance NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Card', 'UPI', 'Bank Transfer', 'Split', 'Insurance')),
    payment_logs JSONB DEFAULT '[]'::jsonb,
    payment_date TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'Paid' CHECK (status IN ('Paid', 'Partial', 'Unpaid', 'Refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 11. NOTIFICATIONS & ACTIVITIES LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 12. BACKUP HISTORY TABLE (Owner Access Only)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.backup_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL CHECK (status IN ('triggered', 'completed', 'failed')),
    backup_size BIGINT NULL,
    file_name TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL
);

-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- A. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_profiles" ON public.profiles;
CREATE POLICY "rbac_select_profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "rbac_insert_profiles" ON public.profiles;
CREATE POLICY "rbac_insert_profiles" ON public.profiles FOR INSERT TO authenticated 
WITH CHECK (
    (public.get_user_role() = 'owner' AND role = 'receptionist')
    OR (auth.uid() = id AND role = 'receptionist')
);

DROP POLICY IF EXISTS "rbac_update_profiles" ON public.profiles;
CREATE POLICY "rbac_update_profiles" ON public.profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id OR public.get_user_role() = 'owner') 
WITH CHECK (
    public.get_user_role() = 'owner' 
    OR (auth.uid() = id AND role = 'receptionist')
);

DROP POLICY IF EXISTS "rbac_delete_profiles" ON public.profiles;
CREATE POLICY "rbac_delete_profiles" ON public.profiles FOR DELETE TO authenticated 
USING (public.get_user_role() = 'owner');

-- B. PATIENTS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_patients" ON public.patients;
CREATE POLICY "rbac_select_patients" ON public.patients FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "rbac_insert_patients" ON public.patients;
CREATE POLICY "rbac_insert_patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "rbac_update_patients" ON public.patients;
CREATE POLICY "rbac_update_patients" ON public.patients FOR UPDATE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist')) WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "rbac_delete_patients" ON public.patients;
CREATE POLICY "rbac_delete_patients" ON public.patients FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- C. APPOINTMENTS & BLOCKED SLOTS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_appointments" ON public.appointments;
CREATE POLICY "rbac_select_appointments" ON public.appointments FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "rbac_insert_appointments" ON public.appointments;
CREATE POLICY "rbac_insert_appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "rbac_update_appointments" ON public.appointments;
CREATE POLICY "rbac_update_appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist')) WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "rbac_delete_appointments" ON public.appointments;
CREATE POLICY "rbac_delete_appointments" ON public.appointments FOR DELETE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));

ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_blocked_slots" ON public.blocked_slots;
CREATE POLICY "rbac_select_blocked_slots" ON public.blocked_slots FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "rbac_insert_blocked_slots" ON public.blocked_slots;
CREATE POLICY "rbac_insert_blocked_slots" ON public.blocked_slots FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "rbac_update_blocked_slots" ON public.blocked_slots;
CREATE POLICY "rbac_update_blocked_slots" ON public.blocked_slots FOR UPDATE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist')) WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));

DROP POLICY IF EXISTS "rbac_delete_blocked_slots" ON public.blocked_slots;
CREATE POLICY "rbac_delete_blocked_slots" ON public.blocked_slots FOR DELETE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));

-- D. CLINICAL DATA (DENTAL CHART, TREATMENTS, PRESCRIPTIONS, NOTES) - OWNER EDIT ONLY
ALTER TABLE public.dental_chart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_dental_chart" ON public.dental_chart;
CREATE POLICY "rbac_select_dental_chart" ON public.dental_chart FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_dental_chart" ON public.dental_chart;
CREATE POLICY "rbac_insert_dental_chart" ON public.dental_chart FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_update_dental_chart" ON public.dental_chart;
CREATE POLICY "rbac_update_dental_chart" ON public.dental_chart FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_delete_dental_chart" ON public.dental_chart;
CREATE POLICY "rbac_delete_dental_chart" ON public.dental_chart FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_treatments" ON public.treatments;
CREATE POLICY "rbac_select_treatments" ON public.treatments FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_treatments" ON public.treatments;
CREATE POLICY "rbac_insert_treatments" ON public.treatments FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_update_treatments" ON public.treatments;
CREATE POLICY "rbac_update_treatments" ON public.treatments FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_delete_treatments" ON public.treatments;
CREATE POLICY "rbac_delete_treatments" ON public.treatments FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_prescriptions" ON public.prescriptions;
CREATE POLICY "rbac_select_prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_prescriptions" ON public.prescriptions;
CREATE POLICY "rbac_insert_prescriptions" ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_update_prescriptions" ON public.prescriptions;
CREATE POLICY "rbac_update_prescriptions" ON public.prescriptions FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_delete_prescriptions" ON public.prescriptions;
CREATE POLICY "rbac_delete_prescriptions" ON public.prescriptions FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

ALTER TABLE public.patient_prescriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_patient_prescriptions" ON public.patient_prescriptions;
CREATE POLICY "rbac_select_patient_prescriptions" ON public.patient_prescriptions FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_patient_prescriptions" ON public.patient_prescriptions;
CREATE POLICY "rbac_insert_patient_prescriptions" ON public.patient_prescriptions FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_update_patient_prescriptions" ON public.patient_prescriptions;
CREATE POLICY "rbac_update_patient_prescriptions" ON public.patient_prescriptions FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_delete_patient_prescriptions" ON public.patient_prescriptions;
CREATE POLICY "rbac_delete_patient_prescriptions" ON public.patient_prescriptions FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_clinical_notes" ON public.clinical_notes;
CREATE POLICY "rbac_select_clinical_notes" ON public.clinical_notes FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_clinical_notes" ON public.clinical_notes;
CREATE POLICY "rbac_insert_clinical_notes" ON public.clinical_notes FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_update_clinical_notes" ON public.clinical_notes;
CREATE POLICY "rbac_update_clinical_notes" ON public.clinical_notes FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_delete_clinical_notes" ON public.clinical_notes;
CREATE POLICY "rbac_delete_clinical_notes" ON public.clinical_notes FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- E. MEDICINES & INVENTORY (Owner Manage Only)
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_medicines" ON public.medicines;
CREATE POLICY "rbac_select_medicines" ON public.medicines FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_medicines" ON public.medicines;
CREATE POLICY "rbac_insert_medicines" ON public.medicines FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_update_medicines" ON public.medicines;
CREATE POLICY "rbac_update_medicines" ON public.medicines FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_delete_medicines" ON public.medicines;
CREATE POLICY "rbac_delete_medicines" ON public.medicines FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_stock_transactions" ON public.stock_transactions;
CREATE POLICY "rbac_select_stock_transactions" ON public.stock_transactions FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_stock_transactions" ON public.stock_transactions;
CREATE POLICY "rbac_insert_stock_transactions" ON public.stock_transactions FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_update_stock_transactions" ON public.stock_transactions;
CREATE POLICY "rbac_update_stock_transactions" ON public.stock_transactions FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_delete_stock_transactions" ON public.stock_transactions;
CREATE POLICY "rbac_delete_stock_transactions" ON public.stock_transactions FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- F. BILLING & INVOICES
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_billing" ON public.billing;
CREATE POLICY "rbac_select_billing" ON public.billing FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_billing" ON public.billing;
CREATE POLICY "rbac_insert_billing" ON public.billing FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_update_billing" ON public.billing;
CREATE POLICY "rbac_update_billing" ON public.billing FOR UPDATE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist')) WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_delete_billing" ON public.billing;
CREATE POLICY "rbac_delete_billing" ON public.billing FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- G. CLINIC SETTINGS & DOCTORS (Owner Write Only)
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_clinic_settings" ON public.clinic_settings;
CREATE POLICY "rbac_select_clinic_settings" ON public.clinic_settings FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_clinic_settings" ON public.clinic_settings;
CREATE POLICY "rbac_insert_clinic_settings" ON public.clinic_settings FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_update_clinic_settings" ON public.clinic_settings;
CREATE POLICY "rbac_update_clinic_settings" ON public.clinic_settings FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_delete_clinic_settings" ON public.clinic_settings;
CREATE POLICY "rbac_delete_clinic_settings" ON public.clinic_settings FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_doctors" ON public.doctors;
CREATE POLICY "rbac_select_doctors" ON public.doctors FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_doctors" ON public.doctors;
CREATE POLICY "rbac_insert_doctors" ON public.doctors FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_update_doctors" ON public.doctors;
CREATE POLICY "rbac_update_doctors" ON public.doctors FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_delete_doctors" ON public.doctors;
CREATE POLICY "rbac_delete_doctors" ON public.doctors FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- H. NOTIFICATIONS & ACTIVITIES
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_notifications" ON public.notifications;
CREATE POLICY "rbac_select_notifications" ON public.notifications FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_notifications" ON public.notifications;
CREATE POLICY "rbac_insert_notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_update_notifications" ON public.notifications;
CREATE POLICY "rbac_update_notifications" ON public.notifications FOR UPDATE TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist')) WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_delete_notifications" ON public.notifications;
CREATE POLICY "rbac_delete_notifications" ON public.notifications FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rbac_select_activities" ON public.activities;
CREATE POLICY "rbac_select_activities" ON public.activities FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_insert_activities" ON public.activities;
CREATE POLICY "rbac_insert_activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('owner', 'receptionist'));
DROP POLICY IF EXISTS "rbac_update_activities" ON public.activities;
CREATE POLICY "rbac_update_activities" ON public.activities FOR UPDATE TO authenticated USING (public.get_user_role() = 'owner') WITH CHECK (public.get_user_role() = 'owner');
DROP POLICY IF EXISTS "rbac_delete_activities" ON public.activities;
CREATE POLICY "rbac_delete_activities" ON public.activities FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- I. BACKUP HISTORY (Owner Access Only)
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner full access on backup_history" ON public.backup_history;
CREATE POLICY "Owner full access on backup_history" ON public.backup_history
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'owner')
    WITH CHECK (public.get_user_role() = 'owner');

-- Grant permissions to authenticated and service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
