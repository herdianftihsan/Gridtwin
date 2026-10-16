-- Migration: Create Decision Shares Table
-- Description: Foundation table for shareable, read-only snapshots of energy investment decision summaries

CREATE TABLE IF NOT EXISTS public.decision_shares (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL,
    scenario_id TEXT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    snapshot JSONB NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE NULL
);

-- Search and Lookup Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_decision_shares_token_hash ON public.decision_shares USING btree (token_hash);
CREATE INDEX IF NOT EXISTS idx_decision_shares_project_id ON public.decision_shares USING btree (project_id);
CREATE INDEX IF NOT EXISTS idx_decision_shares_created_by ON public.decision_shares USING btree (created_by);

-- Row Level Security (RLS)
ALTER TABLE public.decision_shares ENABLE ROW LEVEL SECURITY;

-- Allow authenticated owners to view their own created shares
DROP POLICY IF EXISTS "Allow owners to read their own shares" ON public.decision_shares;
CREATE POLICY "Allow owners to read their own shares"
    ON public.decision_shares FOR SELECT
    USING (auth.uid()::text = created_by);

-- Allow authenticated owners to insert shares for their projects
DROP POLICY IF EXISTS "Allow owners to insert their own shares" ON public.decision_shares;
CREATE POLICY "Allow owners to insert their own shares"
    ON public.decision_shares FOR INSERT
    WITH CHECK (auth.uid()::text = created_by);

-- Allow authenticated owners to update/revoke their own shares
DROP POLICY IF EXISTS "Allow owners to update/revoke their own shares" ON public.decision_shares;
CREATE POLICY "Allow owners to update/revoke their own shares"
    ON public.decision_shares FOR UPDATE
    USING (auth.uid()::text = created_by);

-- Note: Unauthenticated public access is brokered through the backend service-role API
-- to ensure cryptographic token hashing at rest, expiration verification, immediate revocation,
-- and strict rate-limiting before delivering the read-only snapshot.
