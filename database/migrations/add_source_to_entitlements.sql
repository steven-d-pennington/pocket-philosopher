-- Add source column to entitlements table to track how entitlement was granted
ALTER TABLE public.entitlements
ADD COLUMN IF NOT EXISTS source text DEFAULT 'stripe' CHECK (source IN ('stripe', 'manual_grant', 'promo', 'beta'));

-- Update existing entitlements to have source 'stripe' if they have a purchase_id
UPDATE public.entitlements
SET source = 'stripe'
WHERE purchase_id IS NOT NULL AND source IS NULL;

-- Update existing entitlements without purchase_id to 'manual_grant'
UPDATE public.entitlements
SET source = 'manual_grant'
WHERE purchase_id IS NULL AND source IS NULL;

-- Create index for faster queries by source
CREATE INDEX IF NOT EXISTS idx_entitlements_source ON public.entitlements(source);
