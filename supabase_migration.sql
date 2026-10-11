-- Supabase Schema Migration File for DentPro OS
-- Enables Row Level Security and creates isolated public clinic workspace tables

-- 1. Create Clinics Table
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'dentist', 'receptionist', 'assistant')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    age INTEGER,
    gender TEXT CHECK (gender IN ('Male', 'Female')),
    address TEXT,
    visit TEXT,
    medical_notes TEXT,
    balance TEXT DEFAULT '₹0',
    status TEXT CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    dental_chart JSONB DEFAULT '{}'::jsonb,
    prescriptions TEXT[] DEFAULT ARRAY[]::TEXT[],
    files JSONB DEFAULT '[]'::jsonb,
    notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    email TEXT,
    blood_group TEXT,
    patient_type TEXT CHECK (patient_type IN ('New', 'Returning')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Billing Table
CREATE TABLE IF NOT EXISTS public.billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id TEXT NOT NULL, -- Match frontend Invoice ID format (INV-XXXX)
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    doctor TEXT,
    treatment TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    discount NUMERIC DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT CHECK (status IN ('Paid', 'Partially Paid', 'Unpaid', 'Pending')) DEFAULT 'Unpaid',
    payment_date TEXT,
    payment_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Clinics policies
CREATE POLICY "Allow users to read their own clinic details"
    ON public.clinics
    FOR SELECT
    TO authenticated
    USING (
        id = (SELECT clinic_id FROM public.profiles WHERE profiles.id = auth.uid() LIMIT 1)
    );

CREATE POLICY "Allow authenticated users to create a clinic"
    ON public.clinics
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Profiles policies
CREATE POLICY "Allow users to read profiles in their clinic"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR
        clinic_id = (SELECT clinic_id FROM public.profiles WHERE profiles.id = auth.uid() LIMIT 1)
    );

CREATE POLICY "Allow users to insert their own profile details"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

CREATE POLICY "Allow users to update their own profile details"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- Patients policies
CREATE POLICY "Allow users to read patients from their clinic"
    ON public.patients
    FOR SELECT
    TO authenticated
    USING (
        clinic_id = (SELECT clinic_id FROM public.profiles WHERE profiles.id = auth.uid() LIMIT 1)
    );

CREATE POLICY "Allow users to insert patients in their clinic"
    ON public.patients
    FOR INSERT
    TO authenticated
    WITH CHECK (
        clinic_id = (SELECT clinic_id FROM public.profiles WHERE profiles.id = auth.uid() LIMIT 1)
    );

CREATE POLICY "Allow users to update patients in their clinic"
    ON public.patients
    FOR UPDATE
    TO authenticated
    USING (
        clinic_id = (SELECT clinic_id FROM public.profiles WHERE profiles.id = auth.uid() LIMIT 1)
    );

CREATE POLICY "Allow users to delete patients in their clinic"
    ON public.patients
    FOR DELETE
    TO authenticated
    USING (
        clinic_id = (SELECT clinic_id FROM public.profiles WHERE profiles.id = auth.uid() LIMIT 1)
    );

-- Billing policies
CREATE POLICY "Allow users to read billing from their clinic"
    ON public.billing
    FOR SELECT
    TO authenticated
    USING (
        clinic_id = (SELECT clinic_id FROM public.profiles WHERE profiles.id = auth.uid() LIMIT 1)
    );

CREATE POLICY "Allow users to insert billing in their clinic"
    ON public.billing
    FOR INSERT
    TO authenticated
    WITH CHECK (
        clinic_id = (SELECT clinic_id FROM public.profiles WHERE profiles.id = auth.uid() LIMIT 1)
    );

CREATE POLICY "Allow users to update billing in their clinic"
    ON public.billing
    FOR UPDATE
    TO authenticated
    USING (
        clinic_id = (SELECT clinic_id FROM public.profiles WHERE profiles.id = auth.uid() LIMIT 1)
    );

CREATE POLICY "Allow users to delete billing in their clinic"
    ON public.billing
    FOR DELETE
    TO authenticated
    USING (
        clinic_id = (SELECT clinic_id FROM public.profiles WHERE profiles.id = auth.uid() LIMIT 1)
    );
