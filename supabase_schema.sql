-- ==========================================================================
-- CJ TECH: project_inquiries Table Schema Migration
-- Run this query in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lnauqmxaozkxrnxuiour/sql
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.project_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT NOT NULL,
    budget TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (used by server-side /api/contact)
CREATE POLICY "Service role full access" ON public.project_inquiries
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Index on created_at for fast admin sorting
CREATE INDEX IF NOT EXISTS idx_project_inquiries_created_at 
    ON public.project_inquiries (created_at DESC);
