
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS accepted_terms boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS investor_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_study_date date DEFAULT NULL;
