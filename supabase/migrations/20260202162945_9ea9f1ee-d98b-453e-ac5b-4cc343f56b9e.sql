-- Create information entries table
CREATE TABLE public.information_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  primary_domain TEXT NOT NULL,
  secondary_domain TEXT,
  confidence NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.information_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no auth required for this use case)
CREATE POLICY "Allow public read access" 
ON public.information_entries 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.information_entries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.information_entries 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.information_entries 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_information_entries_updated_at
BEFORE UPDATE ON public.information_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for domain filtering
CREATE INDEX idx_information_entries_primary_domain ON public.information_entries(primary_domain);
CREATE INDEX idx_information_entries_created_at ON public.information_entries(created_at DESC);