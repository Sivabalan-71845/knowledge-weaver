-- Add keywords column to information_entries table
ALTER TABLE public.information_entries 
ADD COLUMN keywords TEXT[] DEFAULT '{}';