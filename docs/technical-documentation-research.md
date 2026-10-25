# GridTwin AI — Technical Documentation Dossier & Evidence Audit
**INSEVENT 2026 Fullstack Web Development Competition**

*Date of Audit:* October 23, 2026  
*Auditor Role:* Senior Full-Stack Architect, Technical Documentation Analyst, Database Architect, QA Engineer & Deployment Engineer  
*Repository Root:* `/home/herdianimmanuel/Documents/Gridtwin`  
*Current Head Commit:* `cd9410c` (`fix: use Vercel-compatible pnpm version`)  
*Target Document:* `docs/technical-documentation-research.md`  

---

## 1. Executive Summary

GridTwin AI is an energy decision and simulation platform designed for small-to-medium enterprise (SME) building owners (such as *Ruko*, residential clusters, and commercial offices) in Indonesia. The platform combines **deterministic physics- and tariff-based energy modeling**, **budget-aware discrete combinatorial multi-objective optimization**, and **guardrailed AI explanation** to allow building owners to evaluate capital allocation across solar photovoltaic (PV) arrays, battery energy storage systems (BESS), and energy-efficiency retrofits before committing capital.

### Core Architectural Principle
A strict architectural invariant governs the platform: **Simulation and optimization are 100% deterministic business logic.** Artificial Intelligence (Google Gemini 3.5 Flash Lite) is strictly quarantined to natural-language intent parsing (`/api/ai/what-if`) and contextual natural-language explanation (`/api/ai/explain`). AI is never permitted to calculate, estimate, or modify financial metrics, energy production, payback periods, or tariff rates.

### Audit Status & Quality Gates
- **Working Tree State:** Active Git branch `main`, commit `cd9410c`. Up to date with `origin/main` (`https://github.com/herdianftihsan/Gridtwin.git`).
- **Workspace Architecture:** pnpm monorepo consisting of `@gridtwin/shared`, `@gridtwin/api`, and `@gridtwin/web`.
- **Quality Gates & Verification:**
  - TypeScript Strict Typechecking (`pnpm typecheck`): **PASSED** (0 errors across all 3 workspace packages).
  - ESLint Static Code Analysis (`pnpm lint`): **PASSED** (0 warnings, 0 errors).
  - Test Suite Breakdown (31 unique test files, 206 unique tests):
    - `@gridtwin/shared`: 1 test file, 1 test passed.
    - `@gridtwin/api`: 12 test files, 116 tests passed.
    - `@gridtwin/web`: 18 test files, 89 tests passed (3 pure TypeScript unit tests [20 tests], 15 React/JSDOM component/flow tests [69 tests]).
    - Monorepo Total Unique Tests: **206 tests, 100% PASS RATE**.
    - *Dual-Invocation Reconciliation Note:* When running the root `vitest run` command (`pnpm test:api`), Vitest executes 16 `.test.ts` files (137 tests), which includes the 3 pure TypeScript test files from `apps/web/src/lib/`. When running `pnpm test:web`, Vitest executes all 18 web test files (89 tests). Adding $137 + 89 = 226$ counts the 20 web unit tests twice. The actual deduplicated monorepo total is **206 unique tests across 31 unique test files**.
  - Production Workspace Build (`pnpm build`): **PASSED** (11 static pages prerendered, dynamic routes and middleware compiled).
- **Public Cloud Deployments (Live Smoke Checks):**
  - Frontend Web: `https://gridtwin-web.vercel.app` — **VERIFIED LIVE (HTTP 200 OK)**.
  - Backend API: `https://gridtwin-api-new.vercel.app/health` — **VERIFIED LIVE (HTTP 200 OK, `{"status":"ok"}`)**.

---

## 2. Competition Requirements Compliance Matrix

The INSEVENT 2026 Fullstack Web Development Competition Guidebook establishes five core technical documentation requirements. The table below correlates each requirement with repository evidence and readiness status:

| # | Guidebook Requirement | Repository Implementation / Artifact Location | Verification Status | Required Action Before Final Submission |
|---|----------------------|-----------------------------------------------|---------------------|-----------------------------------------|
| **1** | Project title and complete identities of all team members | Git log confirms contributions by `herdianftihsan` and `AkRisMa`. Official team member identities, institution, and student IDs are not stored in source code. | **MISSING TEAM INPUT** | Complete Section 16 of this dossier with official student names, IDs, institution, and leader details. |
| **2** | Technology stack covering frontend, backend, and database | `package.json`, lockfile, and configurations verified: Next.js 15 App Router, React 19, Tailwind CSS 4, Motion, Zustand, Express 4, TypeScript 5.8, Supabase PostgreSQL, Google Gemini API via `@google/genai`. | **VERIFIED FROM SOURCE** | Transfer verified tech stack details to final submission document. |
| **3** | System architecture, ERD, flowchart, and application workflow | Source code in `apps/api/src` and `apps/web/src` inspected. Complete Mermaid diagrams generated for Architecture, Flowchart, User Journey, and ERD. | **VERIFIED FROM SOURCE** | Include generated Mermaid diagrams in competition PDF. |
| **4** | Local installation and deployment instructions for judging | Verified commands for pnpm installation, environment variable mapping, and location database seeding. Core database tables require running the provided SQL DDL (Section 7). Live Vercel deployments verified. | **PARTIALLY VERIFIED** | Provide step-by-step reproduction instructions, missing SQL DDL, and evaluation URLs to judges. |
| **5** | Official originality declaration using organizer template | Competition originality template is an external administrative requirement not contained in git repository. | **MISSING TEAM INPUT** | Team must obtain the official INSEVENT 2026 declaration template, sign it, and append to the PDF. |

---

## 3. Project Overview and Problem / Solution Statement

### The Problem
Small-to-medium enterprise (SME) building owners in Indonesia face steep energy costs and increasing pressure to adopt clean energy. However, building owners face critical barriers:
1. **Capital Allocation Uncertainty:** Solar vendors often quote oversized photovoltaic (PV) arrays without evaluating energy-efficiency retrofits (such as inverter ACs, high-efficiency refrigeration, or pump upgrades) that could achieve substantial savings at a fraction of the capital cost.
2. **Indonesian Regulatory Constraints (ESDM No. 2/2024):** Indonesian regulations prohibit solar export credits (net metering where excess energy sold back to PLN earns revenue). Any solar electricity generated beyond daytime demand is wasted unless paired with battery storage.
3. **Black-box Vendor Proposals:** Commercial proposals frequently assume unrealistic Peak Sun Hours (PSH) or ignore battery round-trip charge/discharge losses, leading to severe post-installation ROI disillusionment.

### The GridTwin Solution
GridTwin provides an objective digital twin and decision workspace:
- **Holistic Energy Sizing:** Evaluates solar PV (0–10 kWp), battery storage (0–20 kWh), inverter AC upgrades, smart LED retrofits, refrigeration, and pump VSDs simultaneously.
- **Strict Deterministic Compliance:** Models Indonesian electricity tariffs (B2/R1, Rp 1,500/kWh), city-level PSH solar irradiance tables, ESDM Jawa-Bali emission factors (0.79 kg CO₂/kWh), and zero export compensation.
- **Budget-Optimized Recommendations:** Evaluates 3,960 discrete system combinations against the user's specific capital budget and physical roof constraints to identify the optimal configuration under a weighted multi-objective scoring function.
- **What-If Natural Language Sandbox:** Allows owners to query complex trade-offs in plain Indonesian (e.g., *"Bagaimana jika kapasitas solar ditambah dan AC dinaikkan?"*), which AI parses into concrete parameters for deterministic re-simulation.
- **Shareable Decision Brief:** Produces an immutable, cryptographically secured public summary link that building owners can share with financial partners or landlords without leaking account credentials or raw project data.

---

## 4. Feature Inventory and End-to-End Workflows

### Feature 1: Authentication & Tenant Isolation
- **Purpose:** Secure building owner accounts and guarantee complete tenant isolation for sensitive utility bills and property investments.
- **Workflow:** User accesses `/login`, `/register`, or `/forgot-password`. Authentication is brokered via Supabase Auth. Sessions are synchronized into Zustand (`apps/web/src/store/auth.store.ts`) and secured on routes via Next.js Edge Middleware (`apps/web/src/middleware.ts`).
- **Entry Points:** 
  - Frontend: `apps/web/src/app/(auth)/login/page.tsx`, `components/auth/login-form.tsx`.
  - Backend: `apps/api/src/middlewares/auth.ts` (`requireAuth`), `apps/api/src/services/project-ownership.service.ts` (`assertProjectOwnership`).
- **Backend Route:** Protected routes pass `Authorization: Bearer <token>`.
- **Database:** Supabase Auth (`auth.users`) joined with `public.projects.user_id`.
- **Security:** Every project and scenario query strictly enforces `user_id` matching; unauthorized access triggers HTTP 403 `ForbiddenError` or 401 `UnauthorizedError`.

### Feature 2: Project Setup Wizard & Location Intelligence
- **Purpose:** Guide users through a 4-step intake process to collect baseline building data.
- **Workflow:**
  1. *Step 1 (Building & Location):* Select building type (`Ruko`, `Residential`, `Office`), search Indonesian city/regency via autocomplete, input roof area (m²).
  2. *Step 2 (Energy Baseline):* Input average monthly electricity bill in Rupiah (validates $> 0$).
  3. *Step 3 (Budget):* Set investment capital ceiling (validates $\ge \text{Rp } 1.000.000$).
  4. *Step 4 (Objective):* Select primary objective (`save_money`, `reduce_co2`, `independence`).
- **Entry Points:**
  - Frontend: `apps/web/src/app/(app)/setup/page.tsx`, `components/project-setup/project-setup-wizard.tsx`.
  - Backend: `POST /api/projects`, `GET /api/locations/search`.
- **Location Database & Service:** Queries `public.locations` with normalized prefix/substring ranking (`apps/api/src/services/location.service.ts`).
- **Validation:** Zod schema `createProjectSchema` (`apps/api/src/schemas/project.schema.ts`).

### Feature 3: Deterministic Energy Simulation Engine
- **Purpose:** Calculate deterministic estimates of monthly energy flows, solar generation, battery dispatch, grid import, financial return, and emissions under fixed assumptions.
- **Workflow:** Executed either on-demand as a transient preview (`persist: false`) or as a saved scenario (`persist: true`).
- **Backend Route:** `POST /api/projects/:id/simulate`.
- **Business Logic:** `simulate()` in `apps/api/src/simulation/simulate.ts`. Evaluates baseline demand, efficiency savings, 50:50 diurnal load distribution, solar irradiance based on city PSH, battery dispatch with charge/discharge losses, grid balance, and financial payback.
- **Persistence:** Saved scenarios insert into `public.scenarios` and `public.simulation_results`.

### Feature 4: Discrete Combinatorial Multi-Objective Optimization
- **Purpose:** Automatically identify the highest-scoring system configuration within budget and roof limits from a discrete search grid.
- **Workflow:** User clicks "Skenario Rekomendasi" (or selects `balanced` vs `fastest_payback` tabs).
- **Backend Route:** `POST /api/projects/:id/optimize`.
- **Business Logic:** `optimize()` in `apps/api/src/optimization/optimize.ts`. Evaluates 3,960 candidate configurations, prunes infeasible options, simulates remaining candidates, scores them across cost, CO₂, and independence, and deterministically breaks ties.

### Feature 5: Energy Twin Decision Workspace (Classic & 2.5D Views)
- **Purpose:** Interactive graphical digital twin of the building's energy ecosystem.
- **Workflow:** Main decision screen (`/projects/[id]`) showing two view modes:
  - *Classic Mode:* 2D animated SVG diagram with flow particles linking Solar, Battery, Grid, and Building Nodes, complete with real-time Energy Balance Dock.
  - *2.5D Mode:* Isometric building visualization (`EnergyTwinScene`) with rooftop panels, battery unit, HVAC, and interactive hotspots.
- **Components:** `apps/web/src/components/workspace/workspace-container.tsx`, `energy-canvas/energy-canvas.tsx`, `energy-twin/energy-twin-scene.tsx`.

### Feature 6: Natural Language "What-If" Exploration & AI Explanation
- **Purpose:** Allow non-technical owners to ask hypothetical questions and receive plain-language summaries of trade-offs.
- **Workflow:**
  - *What-If Query:* User types e.g., *"Bagaimana jika kapasitas solar dinaikkan ke 6 kWp dan pasang 1 AC?"*. Gemini parses the input into structured JSON intent; the system simulates or optimizes using deterministic code and returns the delta.
  - *AI Explanation:* Generates concise Indonesian insights into the trade-offs (CAPEX vs monthly savings) using strictly bounded numbers.
- **Backend Routes:** `POST /api/ai/what-if`, `POST /api/ai/explain`.
- **Model:** Google Gemini API (`gemini-3.5-flash-lite`) via `@google/genai`.
- **Resilience:** Graceful fallback if AI is slow or unavailable; core simulation results are never blocked.

### Feature 7: Scenario Comparison, History & Roadmap
- **Purpose:** Enable multi-scenario analysis, historical tracking, and progressive investment planning.
- **Components:**
  - *Scenario Comparison Modal (`scenario-comparison-modal.tsx`):* Side-by-side metric table comparing Baseline, Recommended, and Custom scenarios.
  - *Scenario History Modal (`scenario-history-modal.tsx`):* Historical list of simulated and saved scenarios with rename and delete actions.
  - *Investment Roadmap Modal (`investment-roadmap-modal.tsx`):* 4-stage adoption roadmap: Baseline $\rightarrow$ Energy Efficiency $\rightarrow$ Solar Addition $\rightarrow$ Battery Integration.

### Feature 8: Shareable Decision Brief & Public Token Brokerage
- **Purpose:** Generate secure, unauthenticated, read-only decision snapshots for stakeholders.
- **Workflow:**
  1. Project owner clicks "Ringkasan Keputusan" $\rightarrow$ "Bagikan Tautan".
  2. Backend generates a 256-bit cryptographically secure token (`crypto.randomBytes(32)`), computes SHA-256 hash, and stores hash in `decision_shares`.
  3. Raw token is returned in the URL: `/share/[token]`.
  4. Public viewer accesses `/share/[token]`; backend verifies token hash, active status, and expiry before returning the sanitized snapshot.
  5. Owner can revoke the link at any time via `DELETE /api/projects/:id/shares/:shareId`.
- **Backend Routes:** `POST /api/projects/:id/shares`, `GET /api/projects/:id/shares/active`, `DELETE /api/projects/:id/shares/:shareId`, `GET /api/shares/:token`.

### Feature 9: Interactive Demo Sandbox
- **Purpose:** Enable competition judges and prospective users to test the workspace immediately without signing up.
- **Route:** `/demo` (`apps/web/src/app/(app)/demo/page.tsx`).
- **Implementation:** Preloads a representative Jakarta/Bekasi commercial *Ruko* project with interactive sliders, Energy Twin canvas, What-If suggestions, and Decision Summary modal.

---

## 5. Verified Technology Stack

| Layer | Technology | Exact Version (Verified) | Responsibility in GridTwin |
|---|---|---|---|
| **Frontend Framework** | Next.js | `15.5.24` | React full-stack framework utilizing App Router (`(auth)`, `(app)`, `share`). Configured with `outputFileTracingRoot`. |
| **UI Library** | React & React DOM | `19.1.0` | Declarative UI rendering, hooks, and component lifecycle management. |
| **Styling** | Tailwind CSS | `4.1.0` | Utility-first CSS styling compiled via `@tailwindcss/postcss`. |
| **Animation Engine** | Motion | `13.1.1` | Smooth micro-interactions, stepper transitions, SVG particle flows, and modal spring animations. |
| **Client State** | Zustand | `5.0.15` | Lightweight reactive state store for user authentication session (`auth.store.ts`). |
| **Backend Framework** | Express | `4.21.2` | REST API routing, controller middleware pipelines, and HTTP error handling. |
| **Language & Runtime** | TypeScript & Node.js | TS `5.8.3` (shared/web), `5.7.3` (api); Node runtime `>=20.0.0` (engines specify `24.x`) | Strongly typed domain contracts, interfaces, and server runtime. |
| **TypeScript Execution** | tsx | `4.19.2` | High-performance TypeScript execution for local API development and seed scripts. |
| **Database & Auth** | Supabase (PostgreSQL) | `@supabase/supabase-js` `2.112.3` | Managed PostgreSQL database, Row Level Security (RLS), and JWT authentication. |
| **External AI Provider**| Google Gemini API | `@google/genai` `2.22.0` | Model `gemini-3.5-flash-lite` for natural language intent parsing and structured decision explanation. |
| **Security Middleware** | Helmet & CORS | `helmet` `8.0.0`, `cors` `2.8.5` | HTTP security headers, CSP, and cross-origin request allowlisting. |
| **Rate Limiting** | express-rate-limit | `7.5.0` | IP-based request throttling on AI endpoints (10 req/min) and share endpoints (15 create/min, 60 view/min). |
| **Validation** | Zod | `3.24.2` | Runtime schema validation for API request bodies, queries, route parameters, and environment variables. |
| **Testing Suites** | Vitest & Testing Library | `vitest` `3.2.4`, `@testing-library/react` `16.3.3` | Unit, invariant, benchmark, API integration, and frontend component testing. |
| **Package Manager** | pnpm | `10.34.7` | Workspace dependency management, deduplication, and workspace protocol (`workspace:*`). |
| **Cloud Deployment** | Vercel | Vercel Serverless / Edge | Cloud deployment platform for both Next.js frontend and Express serverless API. |

---

## 6. System Architecture & Request Flows

### Architectural Model
GridTwin enforces a layered architecture with clean trust boundaries:
1. **Presentation Layer (`apps/web`):** Client components render UI, react to user inputs, and maintain transient slider states. Never holds service-role credentials or direct database access.
2. **API Client (`apps/web/src/lib/api/api-client.ts`):** Centralized HTTP abstraction that automatically attaches Bearer tokens, normalizes endpoints, and maps standard API error envelopes.
3. **API Routing & Middleware (`apps/api/src`):** Enforces Helmet headers, CORS restrictions, body size bounding (100kb), rate limiting, Zod schema validation, and Supabase JWT authentication.
4. **Service & Domain Layer:** Separates deterministic simulation and optimization algorithms from external AI services and database repositories.
5. **Persistence Layer (`supabase`):** Service-role authenticated PostgreSQL client with table-level RLS policies and indexes.

### Mermaid System Architecture Diagram

```mermaid
graph TB
    subgraph ClientBrowser ["Client Browser (Unauthenticated & Authenticated)"]
        UI_Landing["Landing Page & Demo\n(/, /demo)"]
        UI_Auth["Auth Forms\n(/login, /register)"]
        UI_Setup["Project Setup Wizard\n(/setup)"]
        UI_Workspace["Decision Workspace\n(/projects/:id)"]
        UI_Share["Public Decision Brief\n(/share/:token)"]
        ZustandStore["Zustand Auth Store\n(In-Memory Access Token)"]
        ApiClient["Web API Client\n(Fetch Wrapper)"]
    end

    subgraph VercelEdge ["Vercel Edge & Middleware"]
        EdgeMiddleware["Next.js Route Guard\n(Cookie Token Inspection)"]
    end

    subgraph ApiGateway ["GridTwin API Gateway (Express on Vercel Serverless)"]
        SecurityHeaders["Helmet & CORS\nAllowlist"]
        RateLimiter["Rate Limiting\n(AI: 10/min, Share: 15/min)"]
        ZodValidator["Zod Schema\nValidation"]
        AuthMiddleware["requireAuth\n(Supabase Token Verification)"]
    end

    subgraph DomainServices ["Domain Services Layer"]
        ProjectService["Project & Ownership Service"]
        SimService["Simulation Service"]
        OptService["Optimization Engine\n(3,960 Combinations)"]
        AIService["AI Service Coordinator"]
        ShareService["Share & Token Service\n(SHA-256 Hashing)"]
        LocationService["Location Intelligence Service"]
    end

    subgraph DeterministicCore ["Deterministic Calculation Core (Pure TS)"]
        SimulateTS["simulate.ts\n(Solar, Battery, Loads)"]
        OptimizeTS["optimize.ts\n(Multi-Objective Scoring)"]
        IndoConstants["constants.ts\n(ESDM 2024, PLN Tariffs)"]
    end

    subgraph ExternalServices ["External Cloud Services"]
        SupabaseAuth["Supabase Auth Service"]
        SupabaseDB[("Supabase PostgreSQL\n(projects, scenarios,\nsimulation_results,\ndecision_shares, locations)")]
        GeminiAPI["Google Gemini 3.5 Flash Lite\n(Intent & Explanation Only)"]
    end

    %% Client Interactions
    UI_Auth -->|Sign In / Sign Up| SupabaseAuth
    SupabaseAuth -->|Session Token| ZustandStore
    ZustandStore -->|Attach Bearer| ApiClient
    UI_Landing --> EdgeMiddleware
    UI_Workspace --> ApiClient
    UI_Setup --> ApiClient
    UI_Share -->|Unauthenticated Fetch| ApiClient

    %% Gateway Pipeline
    ApiClient --> SecurityHeaders
    SecurityHeaders --> RateLimiter
    RateLimiter --> ZodValidator
    ZodValidator --> AuthMiddleware

    %% Service Dispatch
    AuthMiddleware --> ProjectService
    AuthMiddleware --> SimService
    AuthMiddleware --> AIService
    AuthMiddleware --> ShareService
    RateLimiter -->|Public Search| LocationService
    RateLimiter -->|Public Share Token| ShareService

    %% Domain & Calculation Links
    SimService --> SimulateTS
    OptService --> OptimizeTS
    SimulateTS --> IndoConstants
    OptimizeTS --> SimulateTS
    AIService --> IntentParser["Intent Parser Service"]
    IntentParser -->|NLP Intent Only| GeminiAPI
    AIService -->|Re-Simulate| SimulateTS
    AIService -->|Re-Optimize| OptService
    AIService --> ExplanationService["Explanation Service"]
    ExplanationService -->|Read-only Context| GeminiAPI

    %% Data Access
    ProjectService --> SupabaseDB
    SimService --> SupabaseDB
    ShareService --> SupabaseDB
    LocationService --> SupabaseDB
```

### Main Application Workflow Diagram

```mermaid
flowchart TD
    Start([User Arrives]) --> Landing{Action?}
    Landing -->|Try Demo| DemoWorkspace["Interactive Demo Workspace\n(/demo)"]
    Landing -->|Register / Login| Auth["Authenticate via Supabase\n(/login, /register)"]
    
    Auth --> Dashboard["Project Dashboard\n(/dashboard)"]
    Dashboard -->|New Project| Step1["Step 1: Building & Location\n(Select Type, Search City, Roof m²)"]
    Step1 --> Step2["Step 2: Energy Baseline\n(Input Monthly PLN Bill)"]
    Step2 --> Step3["Step 3: Capital Budget\n(Input Available Budget >= 1M)"]
    Step3 --> Step4["Step 4: Objective Selection\n(Save Money, CO2, Independence)"]
    
    Step4 --> SubmitProject["POST /api/projects\n(Create Project & Trigger Optimization)"]
    SubmitProject --> Workspace["Enter Decision Workspace\n(/projects/:id)"]
    
    Workspace --> TabChoice{Select Strategy Tab}
    TabChoice -->|Balanced / Fastest Payback| AutoOpt["Fetch Cached / Run Optimization\n(POST /api/projects/:id/optimize)"]
    TabChoice -->|Custom Slider Adjustments| StaleState["Interactive Stale State\n(Amber 'Jalankan Simulasi' button)"]
    
    StaleState --> RunCustom["POST /api/projects/:id/simulate\n(persist: false for preview)"]
    AutoOpt --> RenderCanvas["Render Energy Twin Visualizer\n(Classic Animated SVG or 2.5D Isometric)"]
    RunCustom --> RenderCanvas
    
    RenderCanvas --> SubFeatures{Explore Features}
    SubFeatures -->|Ask Natural Question| WhatIf["What-If AI Panel\n(NLP intent -> Deterministic Resimulation)"]
    SubFeatures -->|View Financials| Summary["Decision Summary Modal\n(CAPEX, ROI, Payback, Environmental)"]
    SubFeatures -->|Compare Scenarios| CompareModal["Scenario Comparison Modal\n(Side-by-side metric delta)"]
    SubFeatures -->|View Progression| RoadmapModal["Investment Roadmap Modal\n(4-Stage Transition Timeline)"]
    
    Summary --> ShareDecision["Click 'Bagikan Tautan'\n(POST /api/projects/:id/shares)"]
    ShareDecision --> CopyLink["Copy Secure Public URL\n(/share/:token)"]
    CopyLink --> PublicView["Public Stakeholder Views Decision Brief\n(Read-only, Cryptographically Verified)"]
    
    DemoWorkspace --> Summary
```

---

## 7. Database Inventory and Entity-Relationship Diagram (ERD)

### Database Architecture & Verification Status
The database layer is hosted on Supabase PostgreSQL. Inspection reveals two distinct categories of database artifacts:

1. **Tracked Repository Migrations (`supabase/migrations/`):**
   - `20260915000000_create_locations_table.sql`: Creates `public.locations` table.
   - `20261015000000_create_decision_shares_table.sql`: Creates `public.decision_shares` table.
2. **Untracked Core Domain Tables (Established on Remote Supabase Instance):**
   - The primary tables (`public.projects`, `public.scenarios`, and `public.simulation_results`) exist on the remote database and are mapped in repository TypeScript interfaces, but **no SQL migration files exist for them in the repository**.
   - *Critical Reproducibility Blocker:* A developer cloning the repository cannot initialize an empty database using `supabase db push`. To make this dossier self-contained and reproducible for judges, the verified DDL for the untracked tables is provided below.

### Foreign Key Constraints vs Logical Relationships
- **Database-Enforced Constraints:**
  - `locations.id` is a primary key (`TEXT PRIMARY KEY`).
  - `locations.code` has a `UNIQUE` constraint.
  - `decision_shares.token_hash` has a `UNIQUE` constraint.
  - `decision_shares.id` is a primary key (`TEXT PRIMARY KEY`).
- **Logical-Only Relationships (No Database Foreign Key Constraint Enforced):**
  - In `decision_shares`, `project_id`, `scenario_id`, and `created_by` are plain `TEXT` columns in the SQL migration. **There is no `REFERENCES` constraint enforced at the database level.**
  - `projects.location` stores location identifiers (e.g. `loc_3578`) or raw text strings; no foreign key to `locations.id` is enforced in the database.
  - Relational consistency and authorization checks are enforced **logically at the application service layer** (`assertProjectOwnership`).

### Database Table Inventory

#### 1. `public.locations` (Tracked in Migration `20260915000000`)
- **Columns:**
  - `id` (`TEXT`, PRIMARY KEY): Internal identifier, e.g., `loc_3578`.
  - `code` (`TEXT`, UNIQUE NOT NULL): Official ISO/BPS region code, e.g., `ID-3578`.
  - `name` (`TEXT`, NOT NULL): Display name, e.g., `Surabaya`.
  - `province` (`TEXT`, NOT NULL): Province display name, e.g., `Jawa Timur`.
  - `type` (`TEXT`, NOT NULL): Check constraint `('province', 'city', 'regency')`.
  - `latitude` / `longitude` (`DOUBLE PRECISION`, NULL): Coordinates.
  - `normalized_name` / `normalized_province` (`TEXT`, NOT NULL): Search strings.
  - `created_at` / `updated_at` (`TIMESTAMPTZ`, NOT NULL).
- **Indexes:** `idx_locations_name`, `idx_locations_normalized_name`, `idx_locations_province`.
- **Security:** RLS enabled; public read-only policy (`USING (true)`). Writes restricted to backend service-role.

#### 2. `public.decision_shares` (Tracked in Migration `20261015000000`)
- **Columns:**
  - `id` (`TEXT`, PRIMARY KEY DEFAULT `gen_random_uuid()::text`): Share record ID.
  - `project_id` (`TEXT`, NOT NULL): Logical reference to target project (no DB foreign key).
  - `scenario_id` (`TEXT`, NULL): Logical reference to target scenario (no DB foreign key).
  - `token_hash` (`TEXT`, UNIQUE NOT NULL): SHA-256 hash of the 256-bit URL token.
  - `snapshot` (`JSONB`, NOT NULL): Privacy-sanitized `DecisionBriefSnapshot`.
  - `created_by` (`TEXT`, NOT NULL): Logical reference to creator user ID (no DB foreign key).
  - `created_at` (`TIMESTAMPTZ`, NOT NULL DEFAULT `timezone('utc', now())`).
  - `expires_at` (`TIMESTAMPTZ`, NOT NULL): Expiry timestamp (default 30 days).
  - `revoked_at` (`TIMESTAMPTZ`, NULL): Timestamp if revoked by owner.
- **Indexes:** `idx_decision_shares_token_hash` (UNIQUE), `idx_decision_shares_project_id`, `idx_decision_shares_created_by`.
- **Security:** RLS enabled; owners can read, insert, and update/revoke their own shares. Public resolution is strictly mediated via backend API (`GET /api/shares/:token`).

#### 3. Core Domain Tables DDL Specification (Required for Clean Reproduction)
To allow a fresh evaluation environment to reproduce the database schema:

```sql
-- Core Schema Specification (Untracked in local migrations; established remotely)

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
```

### Mermaid Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    AUTH_USERS ||--o{ PROJECTS : "owns [Logical FK]"
    AUTH_USERS ||--o{ DECISION_SHARES : "created_by [Logical FK]"
    PROJECTS ||--o{ SCENARIOS : "contains [DB FK]"
    PROJECTS ||--o{ DECISION_SHARES : "references [Logical FK]"
    PROJECTS }o--|| LOCATIONS : "matches code [Logical Soft FK]"
    SCENARIOS ||--|| SIMULATION_RESULTS : "produces [DB FK]"
    SCENARIOS ||--o{ DECISION_SHARES : "references [Logical FK]"

    AUTH_USERS {
        uuid id PK "auth.users identifier"
        string email "user email"
        timestamptz created_at "registration date"
    }

    PROJECTS {
        uuid id PK "Project identifier"
        uuid user_id "Logical FK to auth.users(id)"
        string building_type "Ruko | Residential | Office"
        string location "Location code or city string"
        float roof_area "Usable rooftop area in m2"
        numeric monthly_bill "Baseline monthly bill (IDR)"
        numeric budget "Maximum investment budget (IDR)"
        string objective "save_money | reduce_co2 | independence"
        timestamptz created_at "Creation timestamp"
        timestamptz updated_at "Update timestamp"
    }

    SCENARIOS {
        uuid id PK "Scenario identifier"
        uuid project_id FK "DB FK to projects(id) ON DELETE CASCADE"
        string scenario_type "baseline | recommended | custom | what_if"
        string name "User-defined name"
        numeric solar_kwp "Solar PV capacity (kWp)"
        numeric battery_kwh "Battery capacity (kWh)"
        integer ac_units "Inverter AC units"
        boolean is_led_upgraded "Smart LED upgrade flag"
        integer refrigerator_units "Efficient refrigeration units"
        boolean water_pump_upgraded "Pump VSD upgrade flag"
        boolean is_recommended "Active recommendation flag"
        text what_if_query "Natural language prompt"
        text ai_explanation "Persisted Gemini explanation"
        timestamptz created_at "Creation timestamp"
        timestamptz updated_at "Update timestamp"
    }

    SIMULATION_RESULTS {
        uuid id PK "Result identifier"
        uuid scenario_id FK "DB FK to scenarios(id) ON DELETE CASCADE"
        numeric baseline_monthly_cost "Baseline cost (IDR/mo)"
        numeric baseline_monthly_kwh "Baseline energy (kWh/mo)"
        numeric monthly_demand_kwh "Demand post-efficiency (kWh)"
        numeric solar_yield_monthly "Monthly solar output (kWh)"
        numeric grid_import_monthly "Monthly grid import (kWh)"
        numeric wasted_surplus_monthly "Unusable surplus (kWh)"
        numeric capex "Total capital expenditure (IDR)"
        numeric new_monthly_cost "New monthly bill (IDR)"
        numeric monthly_savings "Monthly savings (IDR)"
        numeric payback_years "Simple payback in years"
        numeric co2_reduction_kg_yr "Annual CO2 reduction (kg)"
        numeric co2_reduction_pct "Percentage CO2 reduction"
        numeric independence_pct "Grid independence percentage"
        jsonb assumptions "Simulation constants & tariff"
        string model_version "Engine version string"
        timestamptz created_at "Execution timestamp"
    }

    DECISION_SHARES {
        text id PK "Share record UUID"
        text project_id "Logical FK to projects(id)"
        text scenario_id "Logical FK to scenarios(id)"
        text token_hash UK "SHA-256 hash of share token"
        jsonb snapshot "Sanitized immutable DecisionBrief"
        text created_by "Logical FK to auth.users(id)"
        timestamptz created_at "Creation timestamp"
        timestamptz expires_at "Expiry timestamp"
        timestamptz revoked_at "Revocation timestamp (nullable)"
    }

    LOCATIONS {
        text id PK "Location ID (loc_3578)"
        text code UK "ISO/BPS Code (ID-3578)"
        text name "City/Regency display name"
        text province "Province display name"
        text type "province | city | regency"
        float latitude "Latitude coordinate"
        float longitude "Longitude coordinate"
        text normalized_name "Search normalized name"
        text normalized_province "Search normalized province"
        timestamptz created_at "Creation timestamp"
        timestamptz updated_at "Update timestamp"
    }
```

---

## 8. Simulation Formulas & Optimization Algorithm

### Mathematical Simulation Model Structure
GridTwin's simulation engine (`apps/api/src/simulation/simulate.ts`) executes a deterministic **12-phase pipeline** in $O(1)$ time complexity without external GIS network calls.

- **Phase 1: Input Validation:** Strict bounds checking on bill ($>0$), non-negative asset inputs, and roof area constraint validation (`calculatePvConstraints`).
- **Phase 2: Assumptions Resolution:** In-memory PSH lookup for Indonesian cities with fallback to $4.5$, system losses, and tariff resolution.
- **Phases 3–11: Core Mathematical Calculations:** (Detailed below).
- **Phase 12: Output Serialization:** IEEE-754 floating point rounding and contract envelope mapping.

```
                  +-----------------------------------+
                  | Phase 3: Baseline Demand Model    |
                  | MonthlyKwh = Bill / Tariff        |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------------------------+
                  | Phase 4: Efficiency Retrofits     |
                  | Invariant: Savings <= Baseline    |
                  | Demand_post = Baseline - Savings  |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------------------------+
                  | Phase 5: Diurnal Load Split       |
                  | DayLoad = Demand_post / 2 / 30    |
                  | NightLoad = Demand_post / 2 / 30  |
                  +-----------------+-----------------+
                                    |
         +--------------------------+--------------------------+
         |                                                     |
         v                                                     v
+-------------------------------+             +-------------------------------+
| Phase 6: Solar Generation     |             | Phase 7: Battery Dispatch     |
| Yield = kWp * PSH * PR * 30   |             | Charge from Surplus (95%)     |
| Daily = Yield / 30            |             | Discharge to Night (95%)      |
+-------------------------------+             +-------------------------------+
         |                                                     |
         +--------------------------+--------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  | Phase 8: Grid Balance & Surplus   |
                  | GridImport = DayImp + NightImp    |
                  | WastedSurplus = Surplus - Stored  |
                  +-----------------+-----------------+
                                    |
         +--------------------------+--------------------------+
         |                          |                          |
         v                          v                          v
+------------------+       +------------------+       +----------------------+
| Phase 9: Finance |       | Phase 10: Carbon |       | Phase 11: Grid Indep.|
| CAPEX, Savings,  |       | CO2 Reduction kg |       | Clamped fraction     |
| Payback Years    |       | and Percentage   |       | (0% if Demand_post=0)|
+------------------+       +------------------+       +----------------------+
```

#### Mathematical Formulations

##### Phase 3: Baseline Demand Model (`baseline.ts`)
Given monthly electricity bill $B$ (IDR) and grid tariff $T$ (default Rp 1,500/kWh, representing standard PLN commercial tariff assumptions):
$$\text{Demand}_{\text{monthly, baseline}} = \frac{B}{T} \quad [\text{kWh/month}]$$
$$\text{Cost}_{\text{annual, baseline}} = B \times 12 \quad [\text{IDR/year}]$$
$$\text{CO}_{2,\text{baseline}} = \text{Demand}_{\text{monthly, baseline}} \times EF \quad [\text{kg CO}_2/\text{month}]$$
*(Where $EF = 0.79\text{ kg CO}_2/\text{kWh}$ represents the ESDM Jawa-Bali 2024 grid emission factor).*

##### Phase 4: Energy Efficiency Retrofit Model (`efficiency.ts`)
Calculates estimated energy demand reduction across four asset types:
- **Inverter AC Retrofit:** Standard 1 PK unit consumes $0.8\text{ kWh/h}$ operating $10\text{ h/day}$. Inverter technology achieves a $30\%$ reduction:
  $$\Delta E_{\text{AC}} = N_{\text{AC}} \times 10 \times 30 \times 0.8 \times 0.30 \quad [\text{kWh/month}]$$
- **Smart LED Retrofit:** Upgrades lighting lot from a baseline of $100\text{ kWh/month}$ with a $60\%$ reduction:
  $$\Delta E_{\text{LED}} = 100 \times 0.60 = 60 \quad [\text{kWh/month}]$$
- **High-Efficiency Refrigeration:** Operates $24\text{ h/day}$ consuming $0.2\text{ kWh/h}$ with a $30\%$ reduction:
  $$\Delta E_{\text{fridge}} = N_{\text{fridge}} \times 24 \times 30 \times 0.2 \times 0.30 \quad [\text{kWh/month}]$$
- **Water Pump VSD Upgrade:** Variable speed drive upgrade from a $150\text{ kWh/month}$ baseline with a $20\%$ reduction:
  $$\Delta E_{\text{pump}} = 150 \times 0.20 = 30 \quad [\text{kWh/month}]$$
- **Total Efficiency Savings:**
  $$\Delta E_{\text{eff}} = \Delta E_{\text{AC}} + \Delta E_{\text{LED}} + \Delta E_{\text{fridge}} + \Delta E_{\text{pump}}$$
- **Feasibility Invariant:** If $\Delta E_{\text{eff}} > \text{Demand}_{\text{monthly, baseline}}$, the system throws `InfeasibleEfficiencyConfigurationError`.
- **Post-Efficiency Demand:**
  $$\text{Demand}_{\text{post}} = \max(0, \text{Demand}_{\text{monthly, baseline}} - \Delta E_{\text{eff}})$$

##### Phase 5: Diurnal Load Profile Distribution (`load-profile.ts`)
Models the representative diurnal split for Indonesian commercial/office buildings:
$$\text{Load}_{\text{daily}} = \frac{\text{Demand}_{\text{post}}}{30} \quad [\text{kWh/day}]$$
$$\text{Load}_{\text{day}} = \text{Load}_{\text{daily}} \times 0.50, \quad \text{Load}_{\text{night}} = \text{Load}_{\text{daily}} \times 0.50$$

##### Phase 6: Solar Photovoltaic Generation Model (`solar.ts`)
- Rooftop physical limitation: $7\text{ m}^2/\text{kWp}$ (fallback default roof area: $50\text{ m}^2$):
  $$PV_{\text{max, physical}} = \frac{\text{Roof Area}}{7}, \quad PV_{\text{max, allowed}} = \min(10\text{ kWp}, PV_{\text{max, physical}})$$
- Monthly and daily generation using city-specific Peak Sun Hours ($PSH$) and system performance ratio ($PR = 0.75$ accounting for thermal losses, dust, and inverter conversion):
  $$E_{\text{solar, monthly}} = PV_{\text{kWp}} \times PSH \times PR \times 30 \quad [\text{kWh/month}]$$
  $$E_{\text{solar, daily}} = \frac{E_{\text{solar, monthly}}}{30} \quad [\text{kWh/day}]$$

*Static PSH Table (`constants.ts`):*
Denpasar/Bali: $4.8$ | Makassar: $4.6$ | Surabaya: $4.5$ | Semarang: $4.4$ | Yogyakarta: $4.4$ | Jakarta: $4.3$ | Bandung: $4.1$ | Medan: $4.0$ | Default: $4.5$.

##### Phase 7: Battery Storage Dispatch & Self-Consumption (`battery.ts`)
Modeled on a representative daily cycle with daily state-of-charge (SOC) reset:
1. Daytime solar self-consumption:
   $$E_{\text{self-consume, daily}} = \min(E_{\text{solar, daily}}, \text{Load}_{\text{day}})$$
2. Available daytime solar surplus:
   $$E_{\text{surplus, avail}} = E_{\text{solar, daily}} - E_{\text{self-consume, daily}}$$
3. Energy sent to battery (charge efficiency $\eta_c = 0.95$):
   $$E_{\text{batt, sent}} = \min\left(E_{\text{surplus, avail}}, \frac{\text{Batt}_{\text{kWh}}}{\eta_c}\right)$$
   $$E_{\text{batt, stored}} = E_{\text{batt, sent}} \times \eta_c$$
4. Wasted solar surplus (no export credit allowed under ESDM 2/2024):
   $$E_{\text{wasted, daily}} = \max(0, E_{\text{surplus, avail}} - E_{\text{batt, sent}})$$
5. Nighttime discharge to satisfy night load (discharge efficiency $\eta_d = 0.95$):
   $$E_{\text{batt, discharged}} = \min(E_{\text{batt, stored}} \times \eta_d, \text{Load}_{\text{night}})$$

##### Phase 8: Grid Balance & Monthly Scaling (`grid.ts`)
$$\text{Import}_{\text{day}} = \max(0, \text{Load}_{\text{day}} - E_{\text{self-consume, daily}})$$
$$\text{Import}_{\text{night}} = \max(0, \text{Load}_{\text{night}} - E_{\text{batt, discharged}})$$
$$\text{Import}_{\text{monthly}} = (\text{Import}_{\text{day}} + \text{Import}_{\text{night}}) \times 30 \quad [\text{kWh/month}]$$
$$\text{WastedSurplus}_{\text{monthly}} = E_{\text{wasted, daily}} \times 30 \quad [\text{kWh/month}]$$

##### Phase 9: Capital Expenditure (CAPEX) & Financial Returns (`financial.ts`)
Asset unit costs:
- Solar PV: Rp 15,000,000 / kWp
- Battery Storage: Rp 5,000,000 / kWh
- Inverter AC: Rp 5,000,000 / unit
- Smart LED: Rp 1,500,000 / lot
- Refrigeration: Rp 5,000,000 / unit
- Water Pump VSD: Rp 3,000,000 / unit

$$\text{CAPEX} = (PV \times 15\text{M}) + (\text{Batt} \times 5\text{M}) + (N_{\text{AC}} \times 5\text{M}) + (\text{LED} \times 1.5\text{M}) + (N_{\text{fridge}} \times 5\text{M}) + (\text{Pump} \times 3\text{M})$$
$$\text{Cost}_{\text{new, monthly}} = \text{Import}_{\text{monthly}} \times T \quad [\text{IDR/month}]$$
$$\text{Savings}_{\text{monthly}} = B - \text{Cost}_{\text{new, monthly}} \quad [\text{IDR/month}]$$
$$\text{Savings}_{\text{annual}} = \text{Savings}_{\text{monthly}} \times 12 \quad [\text{IDR/year}]$$
$$\text{Payback}_{\text{years}} = \begin{cases} \frac{\text{CAPEX}}{\text{Savings}_{\text{annual}}}, & \text{if } \text{Savings}_{\text{annual}} > 0 \\ \text{null}, & \text{otherwise} \end{cases}$$

##### Phase 10: Environmental Emissions Model (`emissions.ts`)
$$\Delta\text{CO}_{2,\text{annual}} = (\text{Demand}_{\text{monthly, baseline}} - \text{Import}_{\text{monthly}}) \times EF \times 12 \quad [\text{kg CO}_2/\text{year}]$$
$$\Delta\text{CO}_{2,\%} = \frac{\text{Demand}_{\text{monthly, baseline}} - \text{Import}_{\text{monthly}}}{\text{Demand}_{\text{monthly, baseline}}} \times 100\%$$

##### Phase 11: Grid Independence Calculation (`emissions.ts`)
Calculates independence percentage with defensive handling for edge cases:
$$\text{Independence}_{\%} = \begin{cases} 0\%, & \text{if } \text{Demand}_{\text{post}} \le 0 \\ \text{clamp}\left(1 - \frac{\text{Import}_{\text{monthly}}}{\text{Demand}_{\text{post}}}, 0, 1\right) \times 100\%, & \text{otherwise} \end{cases}$$

---

### Combinatorial Optimization Algorithm & Search Space History

#### Search Space Evolution & Git History Reconciliation
- **Historical MVP (Commit `0e19645`, Aug 20, 2026):** Initial optimization evaluated 4 asset types ($11 \text{ PV} \times 5 \text{ Battery} \times 6 \text{ AC} \times 2 \text{ LED} = 660 \text{ candidates}$).
- **Expanded Model (Commit `d607842`, Sep 14, 2026):** Refrigerator ($3$ options) and Water Pump VSD ($2$ options) were integrated, expanding the search space:
  $$\text{Total Candidates} = 11 \times 5 \times 6 \times 2 \times 3 \times 2 = 3,960$$
- *Reconciliation Finding:* In `apps/api/src/optimization/optimize.ts`, line 11 retained an outdated comment (`// 1. Generate the 660 raw candidate configurations`). The active implementation (`constants.ts`) and generator (`generate-candidates.ts`) evaluate the full **3,960 discrete candidate configurations**.

#### Discrete Search Grid Dimensions
- Solar PV ($11$ steps): $[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\text{ kWp}$
- Battery Storage ($5$ steps): $[0, 5, 10, 15, 20]\text{ kWh}$
- Inverter AC ($6$ steps): $[0, 1, 2, 3, 4, 5]\text{ units}$
- Smart LED ($2$ steps): $[\text{false}, \text{true}]$
- Efficient Refrigeration ($3$ steps): $[0, 1, 2]\text{ units}$
- Water Pump VSD ($2$ steps): $[\text{false}, \text{true}]$

#### Feasibility Pruning Pipeline (`feasibility.ts`)
Each candidate configuration is validated against 4 physical and financial filters:
1. **Non-Baseline Constraint:** Excludes the zero-asset baseline configuration ($3,959$ remaining).
2. **Physical Roof Constraint:** $\text{Solar}_{\text{kWp}} \le PV_{\text{max, allowed}}$.
3. **Investment Budget Ceiling:** $\text{CAPEX} \le \text{Budget}$.
4. **Efficiency Feasibility Invariant:** $\Delta E_{\text{eff}} \le \text{Demand}_{\text{monthly, baseline}}$.

If zero candidates satisfy these filters, optimization returns an HTTP 422 `NO_FEASIBLE_SCENARIO` error, indicating that the capital budget cannot afford even the cheapest available upgrade (Smart LED lot at Rp 1,500,000).

#### Weighted Multi-Objective Scoring Formulation (`scoring.ts`)
The algorithm uses a **linear scalarized multi-objective scoring function** (not a non-dominated Pareto-front algorithm):
$$S_{\text{cost}} = \text{clamp}\left(\frac{\text{Cost}_{\text{baseline}} - \text{Cost}_{\text{new}}}{\text{Cost}_{\text{baseline}}}, 0, 1\right)$$
$$S_{\text{CO}_2} = \text{clamp}\left(\frac{\text{Demand}_{\text{baseline}} - \text{Import}_{\text{monthly}}}{\text{Demand}_{\text{baseline}}}, 0, 1\right)$$
$$S_{\text{independence}} = \text{clamp}\left(1 - \frac{\text{Import}_{\text{monthly}}}{\text{Demand}_{\text{post}}}, 0, 1\right)$$
$$S_{\text{final}} = w_{\text{cost}} S_{\text{cost}} + w_{\text{CO}_2} S_{\text{CO}_2} + w_{\text{independence}} S_{\text{independence}}$$

*Objective Weight Matrix (`constants.ts`):*
| Objective | $w_{\text{cost}}$ | $w_{\text{CO}_2}$ | $w_{\text{independence}}$ |
|---|---|---|---|
| `save_money` | **0.70** | 0.15 | 0.15 |
| `reduce_co2` | 0.20 | **0.70** | 0.10 |
| `independence` | 0.20 | 0.10 | **0.70** |
| `balanced` | **0.34** | **0.33** | **0.33** |
| `fastest_payback` | **0.70** | 0.15 | 0.15 |

#### Deterministic Sequential Tie-Breaking (`ranking.ts`)
- For `fastest_payback`: Payback Years ASC (null is worst) $\rightarrow$ Final Score DESC $\rightarrow$ CAPEX ASC $\rightarrow$ Stable Candidate ID ASC.
- For all other objectives: Final Score DESC $\rightarrow$ Payback Years ASC $\rightarrow$ CAPEX ASC $\rightarrow$ Stable Candidate ID ASC.

---

## 9. AI Integration and External Services

### Architecture & Security Separation
GridTwin's AI integration is strictly limited to natural language processing (NLP):
1. **Google Gemini Client (`apps/api/src/ai/gemini.client.ts`):** Implements the official `@google/genai` SDK (v2.22.0) targeting model `gemini-3.5-flash-lite`.
2. **Intent Parser (`apps/api/src/ai/intent-parser.service.ts`):** Takes user inquiries and converts them to structured parameters.
   - Enforces an application-level input limit of **500 characters** on user query messages.
   - Environment-level limit `GEMINI_MAX_INPUT_CHARS` defaults to **2,000 characters** in `env.ts` to accommodate the entire formatted system prompt and context envelope.
   - Includes prompt injection defenses: prompts instructing the model to reject non-energy topics, system prompt extraction, credential requests, or code generation commands with an explicit `{"action": "reject", "rejection_reason": "..."}` response.
3. **Explanation Service (`apps/api/src/ai/explanation.service.ts`):** Takes verified numerical simulation results and requests a 2-part structured Indonesian explanation (`trade_off` and `insight`, each under 50 words).
   - Strict prompt instructions forbid Gemini from recalculating numbers or mentioning export credits.
4. **Graceful Degradation:** If the Gemini API key is missing, times out (15,000ms), or hits rate limits, the system catches the exception and returns:
   `"Simulation completed, but the AI explanation is temporarily unavailable."`
   The core simulation numbers and graphs are displayed without disruption.

---

## 10. Authentication, Authorization & Share-Link Design

### Tenant Isolation & Application-Layer Authorization
- Private endpoints require a Supabase Auth JWT token in the `Authorization: Bearer <token>` header.
- Token validity is verified by the backend through `supabaseAdmin.auth.getUser(token)`.
- The `ProjectOwnershipService` (`apps/api/src/services/project-ownership.service.ts`) executes `assertProjectOwnership(projectId, userId)`, querying the database to verify that `project.user_id === userId`. If mismatched, an HTTP 403 `ForbiddenError` is returned immediately.
- *RLS vs Service-Role Boundary:* Because the backend connects to Supabase using `SUPABASE_SERVICE_ROLE_KEY`, Postgres RLS policies are bypassed on the server. Tenant isolation is enforced **at the application gateway layer** in Express services.

### Cryptographic Share Link Architecture
1. **Entropy & Hashing:** When an owner clicks "Bagikan Tautan", the backend generates 256 bits of cryptographically strong random entropy:
   $$\text{token} = \text{crypto.randomBytes}(32).\text{toString}('base64url')$$
   $$\text{token\_hash} = \text{crypto.createHash}('sha256').\text{update}(\text{token}).\text{digest}('hex')$$
2. **At-Rest Storage:** Only `token_hash` is stored in `public.decision_shares`. The plaintext token is never stored in the database.
3. **Snapshot Immutability:** The snapshot stores an immutable, privacy-sanitized `DecisionBriefSnapshot` containing building type, city/province, and simulation metrics. User IDs, emails, and street addresses are omitted. Immutability is an **application-layer invariant** (no update endpoints exist for the snapshot payload).
4. **Expiration & Revocation:**
   - Links expire automatically after a configurable period (default 30 days).
   - Owners can revoke links instantly via `DELETE /api/projects/:id/shares/:shareId`, which updates `revoked_at`.
   - Public retrieval via `GET /api/shares/:token` hashes the incoming token and checks `revoked_at IS NULL` and `expires_at > now()`.
   - Rate limited at 60 requests/minute/IP to prevent brute-force token enumeration.

---

## 11. Local Installation and Running Instructions

### Prerequisites
- **Node.js:** `>= 20.0.0` (Repository engines specify `24.x`).
- **pnpm:** `>= 10.0.0` (Pinned in root `package.json` to `pnpm@10.34.7`).
- **Supabase Account / Instance:** Project URL, anon key, and service role key.
- **Google Gemini API Key:** (Optional for core simulation; required for AI what-if and explanation).

### Step-by-Step Local Setup

#### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/herdianftihsan/Gridtwin.git
cd Gridtwin
pnpm install
```

#### 2. Configure Environment Variables
Copy example files:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```
Populate `.env` files with appropriate keys (see Section 12 for matrix).

#### 3. Initialize Database Schema (Required Step for Clean Database)
Because core tables (`projects`, `scenarios`, `simulation_results`) are untracked in local migrations, execute the DDL script provided in **Section 7** within your Supabase SQL Editor.

Then apply tracked migrations:
- `supabase/migrations/20260915000000_create_locations_table.sql`
- `supabase/migrations/20261015000000_create_decision_shares_table.sql`

#### 4. Seed Master Location Data
Populate the 514 Indonesian cities and regencies into Supabase:
```bash
pnpm --filter @gridtwin/api exec tsx src/scripts/seed-locations.ts
```

#### 5. Run Development Servers
In separate terminals or using monorepo scripts:
```bash
# Terminal 1: Backend API (runs on http://localhost:4000)
pnpm dev:api

# Terminal 2: Next.js Frontend (runs on http://localhost:3000)
pnpm dev:web
```

#### 6. Verify Local Operation
- Backend Health Check: `curl http://localhost:4000/health` (Expects: `{"status":"ok"}`).
- Frontend Landing Page: Open browser to `http://localhost:3000`.
- Interactive Demo: Navigate to `http://localhost:3000/demo`.

---

## 12. Environment Variable Reference

### Backend API (`apps/api/.env`)
| Variable Name | Required? | Scope | Source Default | Example Value | Description |
|---|---|---|---|---|---|
| `PORT` | Optional | Server Only | `8080` (code fallback) | `4000` | HTTP listener port. `.env.example` sets `4000` to match frontend API proxy. |
| `NODE_ENV` | Optional | Server Only | `development` | `development` | Runtime environment (`development`, `test`, `production`). In `test`, mock Supabase/Gemini credentials are used automatically. |
| `FRONTEND_URL` | Required | Server Only | `http://localhost:3000,https://gridtwin-web.vercel.app` | `http://localhost:3000` | Comma-separated list of allowed CORS origins. Transformed to string array in `env.ts`. |
| `SUPABASE_URL` | Required | Server Only | None | `https://your-project.supabase.co` | Supabase project endpoint. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Server Only | None | `ey...` | Privileged service-role key for backend operations. Never expose to client. |
| `GEMINI_API_KEY` | Optional | Server Only | None | `AIza...` | Google AI Studio API key for Gemini 3.5 Flash Lite. |
| `GEMINI_MODEL` | Optional | Server Only | `gemini-3.5-flash-lite` | `gemini-3.5-flash-lite` | Target Gemini model identifier. |
| `GEMINI_TIMEOUT_MS` | Optional | Server Only | `15000` | `15000` | Request timeout in milliseconds (1,000–60,000). |
| `GEMINI_MAX_INPUT_CHARS` | Optional | Server Only | `2000` | `2000` | Environment ceiling for Gemini prompt payload. (User queries are bounded to 500 chars in `intent-parser.service.ts`). |
| `GEMINI_MAX_OUTPUT_TOKENS` | Optional | Server Only | `500` | `500` | Maximum generated tokens (50–4,000). |

### Frontend Web (`apps/web/.env`)
| Variable Name | Required? | Scope | Source Default | Example Value | Description |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Required | Public Browser | `http://localhost:4000` (dev) / `https://gridtwin-api-new.vercel.app` (prod) | `http://localhost:4000` | Base URL of GridTwin API. |
| `NEXT_PUBLIC_SUPABASE_URL` | Required | Public Browser | None | `https://your-project.supabase.co` | Public Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Public Browser | None | `ey...` | Public Supabase anonymous client key. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Public Browser | `http://localhost:3000` | `http://localhost:3000` | Canonical site origin for OAuth callback redirects. |

---

## 13. Testing and Verification Evidence

### Execution Summary & Deduplicated Test Metrics
All verification commands were executed freshly on October 23, 2026.

```
+--------------------------------------------------------------------------------------------------------+
| GridTwin Verification Test Run (October 23, 2026)                                                      |
+--------------------------+-------------------+---------------+------------------+----------------------+
| Check / Command          | Scope             | Test Files    | Tests Executed   | Outcome / Status     |
+--------------------------+-------------------+---------------+------------------+----------------------+
| pnpm typecheck           | Entire Monorepo   | 3 packages    | All TS sources   | PASSED (Exit Code 0) |
| pnpm lint                | Entire Monorepo   | All files     | ESLint rules     | PASSED (Exit Code 0) |
| pnpm test:api (vitest)   | apps/api & shared | 16 test files | 137 passed       | PASSED (Exit Code 0) |
| pnpm test:web (vitest)   | apps/web          | 18 test files | 89 passed        | PASSED (Exit Code 0) |
| Monorepo Unique Tests    | Deduplicated      | 31 test files | 206 passed       | 100% PASS RATE       |
| pnpm build               | Workspace Build   | All packages  | Static & Dynamic | PASSED (Exit Code 0) |
+--------------------------+-------------------+---------------+------------------+----------------------+
```

### Detailed Breakdown of Test Suites

#### 1. Unit Tests (Pure Domain, Simulation, Optimization & Utilities)
- `packages/shared/src/index.test.ts` (1 test): Verifies standard error codes contract.
- `apps/api/src/simulation/__tests__/invariants.test.ts`: Proves conservation of energy; solar yield cannot exceed physics limit; battery never exports to grid; total efficiency savings cannot exceed baseline demand.
- `apps/api/src/simulation/__tests__/edge-cases.test.ts`: Validates behavior at boundaries (0 bill, 0 budget, 0 roof area, 100% solar penetration).
- `apps/api/src/simulation/__tests__/benchmark.test.ts`: Verifies simulation executes in $< 1\text{ ms}$ and full 3,960 candidate optimization completes in $< 50\text{ ms}$.
- `apps/api/src/optimization/__tests__/optimize.test.ts`: Verifies discrete candidate evaluation, multi-objective score weights, and budget constraints.
- `apps/api/src/ai/__tests__/intent-parser.test.ts`: Verifies natural language intent parsing and injection rejection.
- `apps/web/src/lib/api/api-client.test.ts` (6 tests): Validates HTTP error status mapping and authentication token attachment.
- `apps/web/src/lib/auth/auth-service.test.ts` (7 tests): Validates authentication error mapping and Supabase client calls.
- `apps/web/src/lib/auth/safe-next-route.test.ts` (7 tests): Validates open-redirect attack prevention.

#### 2. Component & Integration Tests
- `apps/api/src/tests/auth.test.ts`: Verifies JWT parsing, missing authorization header rejections, and project ownership boundaries.
- `apps/api/src/tests/projects-api.test.ts` (35 tests): Verifies project CRUD, transient simulation (`persist: false`), persistent simulation (`persist: true`), rollback mechanisms on database failure, and objective override behavior.
- `apps/api/src/tests/shares-api.test.ts` (24 tests): Verifies 256-bit token generation, SHA-256 storage, sanitized snapshots, expiry enforcement, instant revocation, rate limiting (15/min create, 60/min view), and database error wrapping.
- `apps/api/src/tests/ai.test.ts`: Verifies Gemini structured output parsing, intent mapping, prompt injection rejection, and graceful fallback when Gemini is offline.
- `apps/api/src/services/__tests__/location.service.test.ts` (6 tests): Validates location search scoring and ranking.
- `apps/web/src/components/workspace/workspace.test.tsx`: Validates workspace hydration, slider adjustments, stale state triggers, and decision summary modal display.
- `apps/web/src/components/workspace/energy-twin/energy-twin.test.tsx` (10 tests): Verifies seamless switching between Classic SVG and 2.5D visual view, hotspot selection, and accessible ARIA attributes.
- `apps/web/src/components/project-setup/project-setup-wizard.test.tsx` (10 tests): Validates 4-step wizard progression, currency formatting, validation rejections for negative/zero bills or budgets $< \text{Rp } 1.000.000$, and double-submission protection.
- `apps/web/src/components/share/share-flow.test.tsx`: Verifies public snapshot rendering, revoked link state display, expired link state display, and clipboard copy interactions.
- `apps/web/src/components/workspace/what-if/what-if.test.tsx`: Verifies natural-language input dispatch, asset delta badges, and presentation metrics.

#### 3. Remote Deployment Smoke Checks
- Web Frontend: `curl -I https://gridtwin-web.vercel.app` $\rightarrow$ `HTTP/2 200 OK`.
- Backend API: `curl -i https://gridtwin-api-new.vercel.app/health` $\rightarrow$ `HTTP/2 200 OK`, `{"status":"ok"}`.
- *Evaluation Disclaimer:* Successful HTTP health and landing page responses verify server deployment and routing, but do not replace automated test suites for verifying complex authenticated end-to-end workflows.

---

## 14. Deployment and Repository Status

- **GitHub Repository:** `https://github.com/herdianftihsan/Gridtwin.git`
  - Active Branch: `main`
  - Current Head Commit: `cd9410c`
  - Tracking Remote: `origin/main` (In sync, 0 commits ahead/behind)
- **Production Web Deployment:** `https://gridtwin-web.vercel.app`
  - Status: **VERIFIED OPERATIONAL (HTTP 200 OK)**
  - Framework: Next.js 15 on Vercel Edge / Serverless
- **Production API Deployment:** `https://gridtwin-api-new.vercel.app`
  - Endpoint: `https://gridtwin-api-new.vercel.app/health`
  - Status: **VERIFIED OPERATIONAL (HTTP 200 OK, `{"status":"ok"}`)**
  - Security: Helmet headers active, Strict-Transport-Security enabled, CORS configured.

---

## 15. Known Limitations, Risks & Unresolved Inconsistencies

1. **Database Migration Tracking Gap (Critical Setup Blocker):**
   - *Fact:* Only `locations` and `decision_shares` migration files exist in `supabase/migrations/`. Core tables (`projects`, `scenarios`, `simulation_results`) exist on the remote database but do not have local migration `.sql` files in the repository.
   - *Impact on Judging:* If an evaluator clones the repository and attempts to run against a fresh database, project creation will fail until the DDL provided in Section 7 is executed manually.
2. **Simplified Model Assumptions vs Real-World Physical Accuracy:**
   - The simulation produces **deterministic estimates under fixed engineering assumptions**, not certified engineering guarantees.
   - Peak Sun Hours are derived from an in-memory lookup table of provincial capitals rather than live satellite weather APIs.
   - Diurnal load distribution assumes a fixed 50:50 day/night split, which is a representative estimate for commercial *Ruko* but does not model hourly load variations.
3. **Regulatory Net Metering Invariant:**
   - In accordance with ESDM No. 2/2024, solar surplus exported to the PLN grid receives 0 financial credit. Financial savings are exclusively derived from self-consumed solar electricity and efficiency retrofits.

---

## 16. Team Information Required for Submission

The following official metadata cannot be inferred from repository code and must be manually supplied by the team prior to final PDF submission:

- **Official Project Title:** GridTwin AI — Energy Decision Platform for Building Owners
- **Team Name:** `[ENTER OFFICIAL TEAM NAME]`
- **Home University / Institution:** `[ENTER INSTITUTION / UNIVERSITY NAME]`
- **Team Members:**
  1. **Member 1 (Team Leader):** `[FULL NAME]` — NIM / Student ID: `[STUDENT ID]` — Email: `[EMAIL]`
  2. **Member 2:** `[FULL NAME]` — NIM / Student ID: `[STUDENT ID]` — Email: `[EMAIL]`
  3. **Member 3 (if applicable):** `[FULL NAME]` — NIM / Student ID: `[STUDENT ID]` — Email: `[EMAIL]`
- **Faculty / Academic Advisor (if required):** `[ADVISOR NAME]`
- **Official Public Repository URL:** `https://github.com/herdianftihsan/Gridtwin`
- **Official Production Deployment URL:** `https://gridtwin-web.vercel.app`
- **Contact Phone / WhatsApp:** `[CONTACT NUMBER]`

---

## 17. Official Originality Declaration Template Requirements

The INSEVENT 2026 competition rules mandate an official Statement of Originality (*Surat Pernyataan Orisinalitas Karya*).

### Missing Materials Checklist
- [ ] Official INSEVENT 2026 Originality Declaration Template (DOCX/PDF).
- [ ] Physical / Digital Signatures of all team members.
- [ ] University seal / stamp or academic advisor endorsement (if required by guidebook).
- [ ] Date and location of declaration signing.

*Action Required:* Download the official template from the INSEVENT 2026 participant portal, complete all fields with the verified project title ("GridTwin AI"), sign, and bind as the final appendix of the technical documentation PDF.

---

## 18. Proposed Final Technical Documentation Outline (For PDF Compilation)

When formatting the final submission document, structure the content into the following 8 formal chapters:

1. **Cover Page & Executive Identitas Tim**
   - Project Title: GridTwin AI
   - Category: Fullstack Web Development Competition
   - Team Name, Member Names, Student IDs, University Logo
2. **Bab I: Pendahuluan & Latar Belakang**
   - Problem Statement: Tantangan Transisi Energi Pemilik Bangunan & Ruko di Indonesia
   - Kerangka Regulasi: ESDM No. 2/2024 & Kebijakan Tarif B2/R1
   - Solusi GridTwin AI: Pemodelan Deterministik + Optimasi Anggaran Diskrit + Pendamping Keputusan AI
3. **Bab II: Spesifikasi & Arsitektur Teknologi**
   - Technology Stack Matrix (Frontend, Backend, Database, AI, Tooling)
   - Diagram Arsitektur Sistem (Mermaid System Architecture)
   - Batasan Keamanan, Rate Limiting, & Isolasi Data Multi-Tenant
4. **Bab III: Model Simulasi & Algoritma Optimasi**
   - Alur Simulasi Deterministik 12 Fase (Baseline, Efisiensi, Solar, Baterai, Finansial, Emisi, Independensi)
   - Algoritma Optimasi Kombinatorial Diskrit 3.960 Konfigurasi & Weighted Scoring
   - Integrasi AI Guardrailed (Google Gemini 3.5 Flash Lite)
5. **Bab IV: Perancangan Basis Data**
   - Entity-Relationship Diagram (ERD) Membedakan Constraint Database vs Relasi Logis
   - Kamus Data & Skema DDL Core (Projects, Scenarios, Simulation Results, Decision Shares, Locations)
   - Arsitektur Berbagi Snapshot Kriptografis (SHA-256)
6. **Bab V: Implementasi Antarmuka & Alur Pengguna**
   - Alur Pengguna (User Journey Flowchart)
   - Visualisasi Energy Twin (Classic Flow Canvas & 2.5D Isometric Scene)
   - Interactive What-If Sandbox & Ringkasan Keputusan Publik
7. **Bab VI: Panduan Instalasi & Pengujian**
   - Panduan Replikasi Lokal (Node.js 24/20, pnpm, Database Seeding, Eksekusi DDL)
   - Hasil Pengujian Terverifikasi (206 Unique Tests, 100% Pass Rate, Typecheck, Lint, Build)
   - URL Repositori Publik & URL Deployment Vercel Live
8. **Lampiran: Surat Pernyataan Orisinalitas**
   - Lembar Pernyataan Orisinalitas Bertanda Tangan sesuai Format Panitia INSEVENT 2026.

---

## 19. Evidence Index (Exact File & Code References)

| Feature / Claim | File Path | Key Symbol / Line Range | Evidence Type |
|---|---|---|---|
| Pinned pnpm version | `package.json` | Lines 6–7 (`packageManager: pnpm@10.34.7...`) | VERIFIED FROM SOURCE |
| Node engine requirement | `package.json` | Lines 7–9 (`node: 24.x`) | VERIFIED FROM SOURCE |
| Monorepo packages | `pnpm-workspace.yaml` | Lines 1–4 (`packages: ['packages/*', 'apps/*']`) | VERIFIED FROM SOURCE |
| Shared contracts | `packages/shared/src/index.ts` | Lines 12–23 (`API_ERROR_CODES`), Lines 31–79 (`DecisionBriefSnapshot`) | VERIFIED FROM SOURCE |
| Deterministic simulation (12 phases) | `apps/api/src/simulation/simulate.ts` | Lines 34–212 (`export const simulate = ...`) | VERIFIED FROM SOURCE |
| Infeasible efficiency error | `apps/api/src/simulation/efficiency.ts` | Lines 41–53 (`InfeasibleEfficiencyConfigurationError`) | VERIFIED FROM SOURCE |
| Grid independence zero demand edge case | `apps/api/src/simulation/emissions.ts` | Lines 28–30 (`if (monthlyDemandPostEfficiency <= 0) return { independence_pct: 0 }`) | VERIFIED FROM SOURCE |
| City PSH static table | `apps/api/src/simulation/constants.ts` | Lines 35–45 (`STATIC_PSH_MAP`) | VERIFIED FROM SOURCE |
| Discrete combinatorial search space | `apps/api/src/optimization/constants.ts` | Lines 3–12 (`SEARCH_SPACE_STEPS`, 3960 candidates) | VERIFIED FROM SOURCE |
| Multi-objective weights | `apps/api/src/optimization/constants.ts` | Lines 21–49 (`OBJECTIVE_WEIGHTS_MAP`) | VERIFIED FROM SOURCE |
| Feasibility pruning | `apps/api/src/optimization/feasibility.ts` | Lines 27–80 (`filterFeasibleCandidates`) | VERIFIED FROM SOURCE |
| Deterministic tie-breaking | `apps/api/src/optimization/ranking.ts` | Lines 10–69 (`rankCandidates`) | VERIFIED FROM SOURCE |
| Gemini API integration | `apps/api/src/ai/gemini.client.ts` | Lines 29–131 (`OfficialGeminiClient`, model `gemini-3.5-flash-lite`) | VERIFIED FROM SOURCE |
| Application user query length guard | `apps/api/src/ai/intent-parser.service.ts` | Lines 12–14 (`userMessage.length > 500`) | VERIFIED FROM SOURCE |
| Environment query length ceiling | `apps/api/src/config/env.ts` | Lines 43–47 (`GEMINI_MAX_INPUT_CHARS: default('2000')`) | VERIFIED FROM SOURCE |
| Port default resolution | `apps/api/src/config/env.ts` | Lines 18–21 (defaults to `8080`, `.env.example` sets `4000`) | VERIFIED FROM SOURCE |
| What-If prompt guardrails | `apps/api/src/ai/prompts/what-if.ts` | Lines 7–34 (Strict JSON rules, injection rejection) | VERIFIED FROM SOURCE |
| Explain prompt rules | `apps/api/src/ai/prompts/explain.ts` | Lines 22–41 (Strict numbers only, no export credit) | VERIFIED FROM SOURCE |
| Token generation & SHA-256 | `apps/api/src/services/share.service.ts` | Lines 126–128 (`crypto.randomBytes(32)`, `sha256`) | VERIFIED FROM SOURCE |
| Share link revocation | `apps/api/src/services/share.service.ts` | Lines 181–203 (`revokeShare`) | VERIFIED FROM SOURCE |
| Project ownership check | `apps/api/src/services/project-ownership.service.ts` | Lines 12–27 (`assertProjectOwnership`) | VERIFIED FROM SOURCE |
| Locations table migration | `supabase/migrations/20260915000000_create_locations_table.sql` | Lines 4–16 (`CREATE TABLE public.locations`) | VERIFIED FROM SOURCE |
| Decision shares migration | `supabase/migrations/20261015000000_create_decision_shares_table.sql` | Lines 4–14 (`CREATE TABLE public.decision_shares`) | VERIFIED FROM SOURCE |
| Seed script (514 regions) | `apps/api/src/scripts/seed-locations.ts` | Lines 6–7 (Lokabisa OSS region-id v1.0.1) | VERIFIED FROM SOURCE |
| Edge auth route guard | `apps/web/src/middleware.ts` | Lines 4–27 (`middleware`, `AUTH_PROTECTED_ROUTES`) | VERIFIED FROM SOURCE |
| Web API client | `apps/web/src/lib/api/api-client.ts` | Lines 26–114 (`ApiClient`, Bearer attachment) | VERIFIED FROM SOURCE |
| Energy Twin 2.5D visual view | `apps/web/src/components/workspace/energy-twin/energy-twin-scene.tsx` | Lines 1–450 (`EnergyTwinScene`, isometric view) | VERIFIED FROM SOURCE |
| Interactive Demo Page | `apps/web/src/app/(app)/demo/page.tsx` | Lines 19–50 (`MOCK_PROJECT`, live playground) | VERIFIED FROM SOURCE |
| Production Web URL verification | `curl -I https://gridtwin-web.vercel.app` | HTTP Status: 200 OK | VERIFIED BY EXECUTED COMMAND |
| Production API URL verification | `curl -I https://gridtwin-api-new.vercel.app/health` | HTTP Status: 200 OK, `{"status":"ok"}` | VERIFIED BY EXECUTED COMMAND |
| Workspace Typecheck | `pnpm typecheck` | 0 errors across 3 workspace packages | VERIFIED BY EXECUTED COMMAND |
| Workspace Linter | `pnpm lint` | 0 errors, 0 warnings across workspace | VERIFIED BY EXECUTED COMMAND |
| API & Shared Test Suite | `pnpm test:api` | 16 test files passed, 137 tests passed (inclusive of 3 web unit tests) | VERIFIED BY EXECUTED COMMAND |
| Web Test Suite | `pnpm test:web` | 18 test files passed, 89 tests passed | VERIFIED BY EXECUTED COMMAND |
| Monorepo Unique Tests | Vitest execution | 31 test files, 206 unique tests passed | VERIFIED BY EXECUTED COMMAND |
| Monorepo Build Check | `pnpm build` | All packages built successfully | VERIFIED BY EXECUTED COMMAND |
