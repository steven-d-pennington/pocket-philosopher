-- Add source column to entitlements table
-- This tracks where the entitlement came from (purchase, admin_grant, promotion, etc.)

ALTER TABLE public.entitlements
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'admin_grant';

-- Add a comment to document the column
COMMENT ON COLUMN public.entitlements.source IS 'Source of the entitlement: purchase, admin_grant, promotion, migration, etc.';

-- Add a check constraint for valid source values (optional but recommended)
ALTER TABLE public.entitlements
ADD CONSTRAINT entitlements_source_check
CHECK (source IN ('purchase', 'admin_grant', 'manual_grant', 'promotion', 'migration', 'trial', 'refund_reversal'));
