-- Create manufacturing records table
CREATE TABLE public.manufacturing_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_count INTEGER NOT NULL CHECK (production_count >= 0),
  scrap_count INTEGER NOT NULL CHECK (scrap_count >= 0),
  shift TEXT NOT NULL,
  machine_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testing records table
CREATE TABLE public.testing_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT NOT NULL,
  passed INTEGER NOT NULL CHECK (passed >= 0),
  failed INTEGER NOT NULL CHECK (failed >= 0),
  defect_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create field service records table
CREATE TABLE public.field_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_issue TEXT NOT NULL,
  solution_given TEXT NOT NULL,
  technician_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales records table
CREATE TABLE public.sales_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  dispatch_date DATE NOT NULL,
  payment_status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (these are public forms, no user restriction)
ALTER TABLE public.manufacturing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public insert (for form submissions)
CREATE POLICY "Anyone can insert manufacturing records"
ON public.manufacturing_records
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anyone can insert testing records"
ON public.testing_records
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anyone can insert field records"
ON public.field_records
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anyone can insert sales records"
ON public.sales_records
FOR INSERT
TO anon
WITH CHECK (true);