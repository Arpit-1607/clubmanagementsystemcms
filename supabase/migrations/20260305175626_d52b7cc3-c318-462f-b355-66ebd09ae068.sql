
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS enrollment_no text,
ADD COLUMN IF NOT EXISTS branch text,
ADD COLUMN IF NOT EXISTS year text;
