-- ==============================================================================
-- GridTwin AI — Core Database Schema Setup (Development & Evaluation Reference)
-- ==============================================================================
-- Provenance:
--   Reconstructed from application domain repositories (project.repository.ts,
--   scenario.repository.ts, simulation-result.repository.ts, and simulation.maper.ts)
--   and verified against technical dossier audit.
--
-- Purpose:
--   The repository tracks migrations for 'locations' and 'decision_shares' in
--   supabase/migrations/, but the initial core domain tables ('projects',
--   'scenarios', 'simulation_results') were established directly on the remote
--   database instance.
--
--   For judges and developers setting up a fresh, clean Supabase database, execute
--   this script FIRST in the Supabase SQL Editor before applying tracked migrations.
-- ==============================================================================

-- 1. Table: public.projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    building_type TEXT NOT NULL CHECK (building_type IN ('Ruko', 'Residential', 'Office')),
    location TEXT NOT NULL,
    roof_area DOUBLE PRECISION NULL,
    monthly_bill NUMERIC NOT NULL,
    budget NUMERIC NOT NULL,
    objective TEXT NOT NULL CHECK (objective IN ('save_money', 'reduce_co2', 'independence')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects USING btree (created_at DESC);

-- RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
CREATE POLICY "Users can manage their own projects"
    ON public.projects FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Table: public.scenarios
CREATE TABLE IF NOT EXISTS public.scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    scenario_type TEXT NOT NULL CHECK (scenario_type IN ('baseline', 'recommended', 'custom', 'what_if')),
    name TEXT NULL,
    solar_kwp NUMERIC NOT NULL DEFAULT 0,
    battery_kwh NUMERIC NOT NULL DEFAULT 0,
    ac_units INTEGER NOT NULL DEFAULT 0,
    is_led_upgraded BOOLEAN NOT NULL DEFAULT false,
    refrigerator_units INTEGER NOT NULL DEFAULT 0,
    water_pump_upgraded BOOLEAN NOT NULL DEFAULT false,
    is_recommended BOOLEAN NOT NULL DEFAULT false,
    what_if_query TEXT NULL,
    ai_explanation TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for scenarios
CREATE INDEX IF NOT EXISTS idx_scenarios_project_id ON public.scenarios USING btree (project_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_created_at ON public.scenarios USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenarios_project_recommended ON public.scenarios USING btree (project_id, is_recommended);

-- RLS for scenarios
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage scenarios for their projects" ON public.scenarios;
CREATE POLICY "Users can manage scenarios for their projects"
    ON public.scenarios FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.projects 
        WHERE projects.id = scenarios.project_id AND projects.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.projects 
        WHERE projects.id = scenarios.project_id AND projects.user_id = auth.uid()
    ));

-- 3. Table: public.simulation_results
CREATE TABLE IF NOT EXISTS public.simulation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
    baseline_monthly_cost NUMERIC NOT NULL,
    baseline_monthly_kwh NUMERIC NOT NULL,
    monthly_demand_kwh NUMERIC NOT NULL,
    solar_yield_monthly NUMERIC NOT NULL,
    grid_import_monthly NUMERIC NOT NULL,
    wasted_surplus_monthly NUMERIC NOT NULL,
    capex NUMERIC NOT NULL,
    new_monthly_cost NUMERIC NOT NULL,
    monthly_savings NUMERIC NOT NULL,
    payback_years NUMERIC NULL,
    co2_reduction_kg_yr NUMERIC NOT NULL,
    co2_reduction_pct NUMERIC NOT NULL,
    independence_pct NUMERIC NOT NULL,
    assumptions JSONB NOT NULL,
    model_version TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for simulation_results
CREATE UNIQUE INDEX IF NOT EXISTS idx_simulation_results_scenario_id ON public.simulation_results USING btree (scenario_id);

-- RLS for simulation_results
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view simulation results for their scenarios" ON public.simulation_results;
CREATE POLICY "Users can view simulation results for their scenarios"
    ON public.simulation_results FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.scenarios 
        JOIN public.projects ON projects.id = scenarios.project_id 
        WHERE scenarios.id = simulation_results.scenario_id AND projects.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.scenarios 
        JOIN public.projects ON projects.id = scenarios.project_id 
        WHERE scenarios.id = simulation_results.scenario_id AND projects.user_id = auth.uid()
    ));
