-- Migration: Create Locations Master Table
-- Description: Foundation table for GridTwin administrative locations

CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    province TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('province', 'city', 'regency')),
    latitude DOUBLE PRECISION NULL,
    longitude DOUBLE PRECISION NULL,
    normalized_name TEXT NOT NULL,
    normalized_province TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Search Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_locations_name ON public.locations USING btree (name);
CREATE INDEX IF NOT EXISTS idx_locations_normalized_name ON public.locations USING btree (normalized_name);
CREATE INDEX IF NOT EXISTS idx_locations_province ON public.locations USING btree (province);

-- Row Level Security (RLS)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Required for frontend autocomplete)
CREATE POLICY "Allow public read access on locations" 
    ON public.locations FOR SELECT 
    USING (true);

-- NOTE: No INSERT/UPDATE/DELETE policies are created.
-- The table acts as a read-only master data reference for clients.
-- Writes are performed exclusively by the backend service-role during the seed process.
