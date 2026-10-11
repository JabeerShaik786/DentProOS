-- This script adds the missing columns clinic_name and receptionist_name to public.clinic_settings table.
-- Also adds a singleton_guard constraint to enforce a single-row design for this single-clinic application.
-- Run this in your Supabase SQL Editor before deploying/testing settings persistence.

ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS clinic_name TEXT;
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS receptionist_name TEXT;

-- Enforce a singleton guard constraint to prevent duplicate rows at database level
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS singleton_guard BOOLEAN DEFAULT TRUE UNIQUE CHECK (singleton_guard = TRUE);
