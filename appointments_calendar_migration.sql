-- ============================================================================
-- DENTPRO OS - APPOINTMENTS & CALENDAR BLOCKED SLOTS PERSISTENCE MIGRATION
-- ============================================================================
-- Safely creates blocked_slots table and configures index/RLS for single-clinic.
-- Normalizes existing time slots and resolves duplicate appointment conflicts.
-- Adds constraints to prevent active doctor double booking.
-- ============================================================================

BEGIN;

-- 1. Create blocked_slots table
CREATE TABLE IF NOT EXISTS public.blocked_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocked_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add indices on blocked_slots
CREATE INDEX IF NOT EXISTS blocked_slots_date_idx ON public.blocked_slots(blocked_date);

DROP INDEX IF EXISTS public.blocked_slots_unique_idx;
CREATE UNIQUE INDEX IF NOT EXISTS blocked_slots_unique_idx 
ON public.blocked_slots (blocked_date, time_slot, COALESCE(doctor_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- 3. Enable RLS on blocked_slots
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
DROP POLICY IF EXISTS "Allow authenticated read blocked_slots" ON public.blocked_slots;
CREATE POLICY "Allow authenticated read blocked_slots" ON public.blocked_slots
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow staff write blocked_slots" ON public.blocked_slots;
CREATE POLICY "Allow staff write blocked_slots" ON public.blocked_slots
    FOR ALL TO authenticated USING (public.get_user_role() IN ('admin', 'doctor', 'dentist', 'receptionist', 'assistant'));

-- 5. Normalize existing time slots in public.appointments (e.g., convert '10.30 am', '9:30 AM', or '09:30 am' to '09:30 AM')
UPDATE public.appointments
SET time_slot = TO_CHAR(REPLACE(TRIM(time_slot), '.', ':')::TIME, 'HH12:MI AM')
WHERE time_slot IS NOT NULL AND TRIM(time_slot) != '';

-- 6. Safely resolve duplicate active appointments by marking older ones as 'Cancelled'
WITH duplicate_appts AS (
    SELECT id, 
           ROW_NUMBER() OVER (
               PARTITION BY doctor_id, appointment_date, time_slot 
               ORDER BY created_at DESC
           ) as rn
    FROM public.appointments
    WHERE status != 'Cancelled' AND status != 'No Show' AND doctor_id IS NOT NULL
)
UPDATE public.appointments
SET status = 'Cancelled', notes = COALESCE(notes, '') || ' [System Cancelled: Duplicate booking conflict]'
WHERE id IN (SELECT id FROM duplicate_appts WHERE rn > 1);

-- 7. Add unique index to public.appointments to prevent double-booking on same slot
DROP INDEX IF EXISTS public.idx_appointments_no_double_booking;
CREATE UNIQUE INDEX idx_appointments_no_double_booking 
ON public.appointments (doctor_id, appointment_date, time_slot) 
WHERE (status != 'Cancelled' AND status != 'No Show');

COMMIT;
