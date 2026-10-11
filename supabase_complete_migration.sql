-- ============================================================================
-- DENTPRO OS - COMPLETE SCHEMA MIGRATION
-- ============================================================================
-- Complete, single-file DDL script creating all required tables, RLS policies,
-- functions, and default seed data for the DentPro OS dental practice management application.
--
-- Design Principles:
-- 1. UUID primary keys for all new tables.
-- 2. Tenant isolation via clinic_id foreign key referencing public.clinics(id).
-- 3. Row-Level Security (RLS) on all tables using non-recursive security definer helper.
-- 4. Database-safe patient display ID (DS-xxxx) sequence generation.
-- 5. Safe, additive changes preserving existing data.
-- 6. Production-safe re-runnability (DROP POLICY IF EXISTS & DROP TRIGGER IF EXISTS).
-- 7. Focused strictly on structured clinic records (No file/media/binary storage).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- A. get_user_clinic_id()
-- Resolves the authenticated user's clinic_id from public.profiles.
-- Configured with SECURITY DEFINER and a fixed search_path to prevent execution-context
-- hijacking and eliminate infinite recursion loops during RLS policy evaluations.
CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clinic_id UUID;
BEGIN
    SELECT clinic_id INTO v_clinic_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN v_clinic_id;
END;
$$;

-- Security Hardening: Revoke default PUBLIC privileges and grant selectively.
REVOKE ALL ON FUNCTION public.get_user_clinic_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_clinic_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_clinic_id() TO service_role;

COMMENT ON FUNCTION public.get_user_clinic_id() IS 
'Retrieves the authenticated user''s clinic_id securely, avoiding RLS policy recursion on profiles.';

-- B. handle_updated_at()
-- Triggers automatic timestamp update on modification.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. SEQUENCES & GENERATORS FOR PATIENT DISPLAY ID (DS-xxxx)
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.patient_id_seq START 1001;

-- Reset sequence to the highest existing sequence number if patients already exist
SELECT setval(
    'public.patient_id_seq', 
    COALESCE(
        (SELECT MAX(SUBSTRING(patient_id FROM '[0-9]+')::integer) FROM public.patients WHERE patient_id LIKE 'DS-%'),
        1000
    )
);

-- Trigger function to atomically assign display IDs on insert
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.patient_id IS NULL OR NEW.patient_id = '' OR NEW.patient_id LIKE 'DS-%' THEN
        NEW.patient_id := 'DS-' || nextval('public.patient_id_seq')::text;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_generate_patient_id ON public.patients;
CREATE TRIGGER tr_generate_patient_id
    BEFORE INSERT ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_patient_id();

-- ----------------------------------------------------------------------------
-- 4. NEW TABLES DECLARATION
-- ----------------------------------------------------------------------------

-- A. Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    specialty TEXT,
    phone TEXT,
    status TEXT CHECK (status IN ('Available', 'In Consultation', 'On Break', 'Finished Today')) DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- B. Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT,
    phone TEXT,
    status TEXT CHECK (status IN ('Active', 'Inactive', 'On Leave')) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- C. Clinic Settings Table
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID UNIQUE NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    address TEXT,
    phone TEXT,
    primary_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    receptionist_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    whatsapp_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    google_calendar_enabled BOOLEAN DEFAULT FALSE,
    dental_lab_enabled BOOLEAN DEFAULT TRUE,
    auto_backup_enabled BOOLEAN DEFAULT TRUE,
    backup_frequency TEXT DEFAULT 'Daily',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- D. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    procedure_name TEXT,
    status TEXT CHECK (status IN ('Scheduled', 'Waiting', 'Checked In', 'In Consultation', 'In Procedure', 'Completed', 'Cancelled', 'No Show')) DEFAULT 'Scheduled',
    queue_token TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- E. Dental Chart (Odontogram) Table
CREATE TABLE IF NOT EXISTS public.dental_chart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    tooth_number INTEGER NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    status TEXT CHECK (status IN ('Planned', 'In Progress', 'Completed')) DEFAULT 'Planned',
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    treatment_date DATE,
    estimated_cost NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- F. Treatments Table
CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    stage TEXT CHECK (stage IN ('Planned', 'In Progress', 'Completed')) DEFAULT 'Planned',
    tooth_number INTEGER,
    cost NUMERIC NOT NULL DEFAULT 0,
    diagnosis TEXT,
    notes TEXT,
    treatment_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- G. Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    prescription_date DATE DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    advice TEXT,
    medicines JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- H. Clinical Notes Table
CREATE TABLE IF NOT EXISTS public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- I. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    invoice_id TEXT NOT NULL,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) DEFAULT 'percentage',
    discount_value NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT CHECK (status IN ('Paid', 'Partially Paid', 'Unpaid', 'Pending')) DEFAULT 'Unpaid',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- J. Invoice Items Table
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES public.treatments(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- K. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('Cash', 'UPI', 'Card')) DEFAULT 'Cash',
    payment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- L. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- M. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. SAFE ALTERATIONS TO EXISTING TABLES
-- ----------------------------------------------------------------------------

-- Alter Patients Table
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ----------------------------------------------------------------------------
-- 6. AUTOMATED TIMESTAMPS TRIGGERS
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tr_updated_at_patients ON public.patients;
CREATE TRIGGER tr_updated_at_patients BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_doctors ON public.doctors;
CREATE TRIGGER tr_updated_at_doctors BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_staff ON public.staff;
CREATE TRIGGER tr_updated_at_staff BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_clinic_settings ON public.clinic_settings;
CREATE TRIGGER tr_updated_at_clinic_settings BEFORE UPDATE ON public.clinic_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_appointments ON public.appointments;
CREATE TRIGGER tr_updated_at_appointments BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_dental_chart ON public.dental_chart;
CREATE TRIGGER tr_updated_at_dental_chart BEFORE UPDATE ON public.dental_chart FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_treatments ON public.treatments;
CREATE TRIGGER tr_updated_at_treatments BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_prescriptions ON public.prescriptions;
CREATE TRIGGER tr_updated_at_prescriptions BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_clinical_notes ON public.clinical_notes;
CREATE TRIGGER tr_updated_at_clinical_notes BEFORE UPDATE ON public.clinical_notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_invoices ON public.invoices;
CREATE TRIGGER tr_updated_at_invoices BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------

-- A. Generic Single-Column Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON public.doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_clinic_id ON public.staff(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_dental_chart_patient_id ON public.dental_chart(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatments_patient_id ON public.treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient_id ON public.clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON public.payments(patient_id);

-- B. Optimization Composite Indexes
CREATE INDEX IF NOT EXISTS idx_patients_clinic_patient ON public.patients(clinic_id, id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON public.appointments(clinic_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_status ON public.appointments(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_clinic_status ON public.invoices(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) ACTIVATION
-- ----------------------------------------------------------------------------
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dental_chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- A. Update existing clinics Select policy to avoid recursion
DROP POLICY IF EXISTS "Allow users to read their own clinic details" ON public.clinics;
CREATE POLICY "Allow users to read their own clinic details"
    ON public.clinics
    FOR SELECT
    TO authenticated
    USING (id = public.get_user_clinic_id());

-- B. Doctors policies
DROP POLICY IF EXISTS "Allow users to read doctors in their clinic" ON public.doctors;
CREATE POLICY "Allow users to read doctors in their clinic"
    ON public.doctors FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert doctors in their clinic" ON public.doctors;
CREATE POLICY "Allow users to insert doctors in their clinic"
    ON public.doctors FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to update doctors in their clinic" ON public.doctors;
CREATE POLICY "Allow users to update doctors in their clinic"
    ON public.doctors FOR UPDATE TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to delete doctors in their clinic" ON public.doctors;
CREATE POLICY "Allow users to delete doctors in their clinic"
    ON public.doctors FOR DELETE TO authenticated USING (clinic_id = public.get_user_clinic_id());

-- C. Staff policies
DROP POLICY IF EXISTS "Allow users to read staff in their clinic" ON public.staff;
CREATE POLICY "Allow users to read staff in their clinic"
    ON public.staff FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert staff in their clinic" ON public.staff;
CREATE POLICY "Allow users to insert staff in their clinic"
    ON public.staff FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to update staff in their clinic" ON public.staff;
CREATE POLICY "Allow users to update staff in their clinic"
    ON public.staff FOR UPDATE TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to delete staff in their clinic" ON public.staff;
CREATE POLICY "Allow users to delete staff in their clinic"
    ON public.staff FOR DELETE TO authenticated USING (clinic_id = public.get_user_clinic_id());

-- D. Clinic Settings policies
DROP POLICY IF EXISTS "Allow users to read settings in their clinic" ON public.clinic_settings;
CREATE POLICY "Allow users to read settings in their clinic"
    ON public.clinic_settings FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert settings in their clinic" ON public.clinic_settings;
CREATE POLICY "Allow users to insert settings in their clinic"
    ON public.clinic_settings FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to update settings in their clinic" ON public.clinic_settings;
CREATE POLICY "Allow users to update settings in their clinic"
    ON public.clinic_settings FOR UPDATE TO authenticated USING (clinic_id = public.get_user_clinic_id());

-- E. Appointments policies
DROP POLICY IF EXISTS "Allow users to read appointments in their clinic" ON public.appointments;
CREATE POLICY "Allow users to read appointments in their clinic"
    ON public.appointments FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert appointments in their clinic" ON public.appointments;
CREATE POLICY "Allow users to insert appointments in their clinic"
    ON public.appointments FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to update appointments in their clinic" ON public.appointments;
CREATE POLICY "Allow users to update appointments in their clinic"
    ON public.appointments FOR UPDATE TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to delete appointments in their clinic" ON public.appointments;
CREATE POLICY "Allow users to delete appointments in their clinic"
    ON public.appointments FOR DELETE TO authenticated USING (clinic_id = public.get_user_clinic_id());

-- F. Dental Chart policies
DROP POLICY IF EXISTS "Allow users to read dental chart in their clinic" ON public.dental_chart;
CREATE POLICY "Allow users to read dental chart in their clinic"
    ON public.dental_chart FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert dental chart in their clinic" ON public.dental_chart;
CREATE POLICY "Allow users to insert dental chart in their clinic"
    ON public.dental_chart FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to update dental chart in their clinic" ON public.dental_chart;
CREATE POLICY "Allow users to update dental chart in their clinic"
    ON public.dental_chart FOR UPDATE TO authenticated USING (clinic_id = public.get_user_clinic_id());

-- G. Treatments policies
DROP POLICY IF EXISTS "Allow users to read treatments in their clinic" ON public.treatments;
CREATE POLICY "Allow users to read treatments in their clinic"
    ON public.treatments FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert treatments in their clinic" ON public.treatments;
CREATE POLICY "Allow users to insert treatments in their clinic"
    ON public.treatments FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to update treatments in their clinic" ON public.treatments;
CREATE POLICY "Allow users to update treatments in their clinic"
    ON public.treatments FOR UPDATE TO authenticated USING (clinic_id = public.get_user_clinic_id());

-- H. Prescriptions policies
DROP POLICY IF EXISTS "Allow users to read prescriptions in their clinic" ON public.prescriptions;
CREATE POLICY "Allow users to read prescriptions in their clinic"
    ON public.prescriptions FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert prescriptions in their clinic" ON public.prescriptions;
CREATE POLICY "Allow users to insert prescriptions in their clinic"
    ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to update prescriptions in their clinic" ON public.prescriptions;
CREATE POLICY "Allow users to update prescriptions in their clinic"
    ON public.prescriptions FOR UPDATE TO authenticated USING (clinic_id = public.get_user_clinic_id());

-- I. Clinical Notes policies
DROP POLICY IF EXISTS "Allow users to read clinical notes in their clinic" ON public.clinical_notes;
CREATE POLICY "Allow users to read clinical notes in their clinic"
    ON public.clinical_notes FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert clinical notes in their clinic" ON public.clinical_notes;
CREATE POLICY "Allow users to insert clinical notes in their clinic"
    ON public.clinical_notes FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to update clinical notes in their clinic" ON public.clinical_notes;
CREATE POLICY "Allow users to update clinical notes in their clinic"
    ON public.clinical_notes FOR UPDATE TO authenticated USING (clinic_id = public.get_user_clinic_id());

-- J. Invoices policies
DROP POLICY IF EXISTS "Allow users to read invoices in their clinic" ON public.invoices;
CREATE POLICY "Allow users to read invoices in their clinic"
    ON public.invoices FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert invoices in their clinic" ON public.invoices;
CREATE POLICY "Allow users to insert invoices in their clinic"
    ON public.invoices FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to update invoices in their clinic" ON public.invoices;
CREATE POLICY "Allow users to update invoices in their clinic"
    ON public.invoices FOR UPDATE TO authenticated USING (clinic_id = public.get_user_clinic_id());

-- K. Invoice Items policies
DROP POLICY IF EXISTS "Allow users to read invoice items in their clinic" ON public.invoice_items;
CREATE POLICY "Allow users to read invoice items in their clinic"
    ON public.invoice_items FOR SELECT TO authenticated 
    USING (invoice_id IN (SELECT id FROM public.invoices WHERE clinic_id = public.get_user_clinic_id()));

DROP POLICY IF EXISTS "Allow users to insert invoice items in their clinic" ON public.invoice_items;
CREATE POLICY "Allow users to insert invoice items in their clinic"
    ON public.invoice_items FOR INSERT TO authenticated 
    WITH CHECK (invoice_id IN (SELECT id FROM public.invoices WHERE clinic_id = public.get_user_clinic_id()));

-- L. Payments policies
DROP POLICY IF EXISTS "Allow users to read payments in their clinic" ON public.payments;
CREATE POLICY "Allow users to read payments in their clinic"
    ON public.payments FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert payments in their clinic" ON public.payments;
CREATE POLICY "Allow users to insert payments in their clinic"
    ON public.payments FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());

-- M. Notifications policies
DROP POLICY IF EXISTS "Allow users to read notifications in their clinic" ON public.notifications;
CREATE POLICY "Allow users to read notifications in their clinic"
    ON public.notifications FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to update notifications in their clinic" ON public.notifications;
CREATE POLICY "Allow users to update notifications in their clinic"
    ON public.notifications FOR UPDATE TO authenticated USING (clinic_id = public.get_user_clinic_id());

-- N. Activities policies
DROP POLICY IF EXISTS "Allow users to read activities in their clinic" ON public.activities;
CREATE POLICY "Allow users to read activities in their clinic"
    ON public.activities FOR SELECT TO authenticated USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "Allow users to insert activities in their clinic" ON public.activities;
CREATE POLICY "Allow users to insert activities in their clinic"
    ON public.activities FOR INSERT TO authenticated WITH CHECK (clinic_id = public.get_user_clinic_id());
