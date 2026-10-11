-- Update RLS Policy for public.billing to allow doctors and dentists to log billing/invoices.
-- Clinicians (doctors and dentists) complete consultations and log treatments which auto-generate billing records.
-- Restricting writes only to admin/receptionist causes RLS policy failures when clinicians complete checkouts.

DROP POLICY IF EXISTS "Allow billing staff write" ON public.billing;

CREATE POLICY "Allow billing staff write" 
ON public.billing 
FOR ALL 
TO authenticated 
USING (
  public.get_user_role() IN ('admin', 'receptionist', 'doctor', 'dentist')
);
