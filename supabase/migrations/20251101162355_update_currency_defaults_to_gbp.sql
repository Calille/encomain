-- Update default currency from USD to GBP for UK-based system

-- Update billing table default
ALTER TABLE public.billing 
  ALTER COLUMN currency SET DEFAULT 'GBP';

-- Update invoices table default  
ALTER TABLE public.invoices 
  ALTER COLUMN currency SET DEFAULT 'GBP';;
