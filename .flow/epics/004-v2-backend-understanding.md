# Epic 004: Systematic V2 Backend Understanding

> **Goal**: Build complete understanding of Workspace 5's backend architecture, data flows, integrations, and business logic through systematic exploration.

## Executive Summary

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    WORKSPACE 5 - V2 BACKEND ARCHITECTURE                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Instance: x2nu-xcjc-vhax.agentdashboards.xano.io                           ║
║  Tables: 194 (normalized from 251 in V1)                                     ║
║  Functions: 971 total (Workers, Tasks, Archive, Utils)                       ║
║  Background Tasks: 200+ (active: ~30, paused: ~170)                          ║
║  API Groups: 27 (Frontend v2, MCP, Legacy, Webhooks)                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Phase 1: Data Architecture (Tables)

### 1.1 Core Business Entities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CORE ENTITIES - The Foundation                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  👤 USER DOMAIN                    🏢 AGENT DOMAIN                          │
│  ├── user                          ├── agent                                │
│  ├── user_credentials              ├── agent_cap_data                       │
│  ├── user_preferences              ├── agent_commission                     │
│  ├── user_subscriptions            └── agent_referral_code                  │
│  └── user_roles                                                             │
│                                                                              │
│  👥 TEAM DOMAIN                    💰 TRANSACTION DOMAIN                    │
│  ├── team                          ├── transaction                          │
│  ├── team_roster                   ├── transaction_financials               │
│  ├── team_owners                   ├── transaction_history                  │
│  ├── team_admins                   ├── paid_participant                     │
│  └── team_admins_permissions       └── participant                          │
│                                                                              │
│  🏠 LISTING DOMAIN                 🌐 NETWORK DOMAIN                        │
│  ├── listing                       ├── network                              │
│  ├── listing_history               ├── network_change_log                   │
│  └── listing_photos                └── sponsor_tree                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Task 1.1**: Map all core entity tables and their relationships

- [ ] Document user → agent → team relationships
- [ ] Document transaction → participant → paid_participant flow
- [ ] Document listing lifecycle and history tracking
- [ ] Document network hierarchy and sponsor relationships

### 1.2 Financial Entities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FINANCIAL DOMAIN                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  💵 CONTRIBUTIONS                  💎 EQUITY                                │
│  ├── contribution                  ├── equity_annual                        │
│  ├── contribution_pending          ├── equity_monthly                       │
│  ├── contributors                  └── equity_transactions                  │
│  └── income                                                                  │
│                                                                              │
│  💰 REVENUE SHARING                💳 BILLING (Stripe)                      │
│  ├── revshare_totals               ├── stripe_pricing                       │
│  ├── revshare_payments             ├── stripe_product                       │
│  └── outgoing_payments             ├── stripe_subscriptions                 │
│                                    └── subscription_packages                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Task 1.2**: Document financial data flow

- [ ] Trace contribution → income → revshare flow
- [ ] Document equity calculation sources
- [ ] Map Stripe integration tables

### 1.3 Integration Tables

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  INTEGRATIONS - External System Data                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🔗 FUB (Follow Up Boss)           🏘️ reZEN                                 │
│  ├── fub_accounts                  ├── rezen_webhooks                       │
│  ├── fub_people                    ├── rezen_referral_codes                 │
│  ├── fub_deals                     └── rezen_sync_state                     │
│  ├── fub_stages                                                             │
│  ├── fub_events                    📂 SkySlope                              │
│  ├── fub_calls                     ├── skyslope_connection                  │
│  ├── fub_text_messages             ├── skyslope_listing_staging             │
│  ├── fub_appointments              └── skyslope_transaction_staging         │
│  ├── fub_users                                                              │
│  └── fub_groups                    🏠 DotLoop                               │
│                                    ├── dotloop_accounts                     │
│  🏡 Lofty                          ├── dotloop_profiles                     │
│  ├── lofty_accounts                ├── dotloop_loops                        │
│  ├── lofty_leads                   └── dotloop_staging                      │
│  └── lofty_staging                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Task 1.3**: Document each integration

- [ ] FUB: OAuth flow, data sync, webhook handling
- [ ] reZEN: API integration, contribution sync
- [ ] SkySlope: Transaction/listing staging flow
- [ ] DotLoop: Profile and loop sync
- [ ] Lofty: Lead import process

### 1.4 Infrastructure Tables

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE - System Operations                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📊 SYNC STATE                     📋 JOB MANAGEMENT                        │
│  ├── sync_state (per integration)  ├── sync_jobs                            │
│  ├── staging tables                ├── onboarding_jobs                      │
│  └── temp tables                   ├── lambda_jobs_log                      │
│                                    └── lambda_jobs_status                   │
│  📝 LOGGING                                                                 │
│  ├── event_log                     🔧 CONFIGURATION                         │
│  ├── error_logs                    ├── api_keys                             │
│  ├── demo_sync_log                 ├── global_variables                     │
│  └── system_audit                  └── permissions                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Task 1.4**: Document infrastructure patterns

- [ ] Sync state management pattern
- [ ] Job queuing and status tracking
- [ ] Error logging and audit trails
- [ ] Configuration management

### 1.5 Page Builder System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PAGE BUILDER - Dynamic Dashboard Configuration                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  pages                                                                       │
│    └── page_tabs                                                            │
│          └── page_sections                                                  │
│                └── page_widgets                                             │
│                      └── page_chart_assignments                             │
│                                                                              │
│  Supporting Tables:                                                          │
│  ├── page_filters + filter_options                                          │
│  ├── page_layouts + widget_viewport_layouts                                 │
│  ├── user_filter_preferences                                                │
│  ├── user_page_layouts                                                      │
│  └── user_dashboard_sections                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Task 1.5**: Document page builder architecture

- [ ] Page → Tab → Section → Widget hierarchy
- [ ] Filter configuration system
- [ ] User personalization storage

---

## Phase 2: Function Architecture

### 2.1 Function Organization Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FUNCTION NAMING CONVENTION                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Workers/  ─────────────────────────────────────────────────────────────    │
│  │  Pure business logic, called by Tasks                                    │
│  │  Pattern: Workers/{Domain} - {Action}                                    │
│  │  Examples:                                                               │
│  │    Workers/reZEN - Agent Data                                           │
│  │    Workers/FUB - Get People                                             │
│  │    Workers/SkySlope - Upsert Transaction                                │
│  │    Workers/Network - Get Downline                                       │
│  │                                                                          │
│  Tasks/  ───────────────────────────────────────────────────────────────    │
│  │  Orchestrators that call Workers                                        │
│  │  Pattern: Tasks/{Domain} - {Workflow}                                   │
│  │  Examples:                                                               │
│  │    Tasks/reZEN - Team Roster Sync                                       │
│  │    Tasks/FUB - Daily Update People                                      │
│  │    Tasks/SkySlope - Move Transactions from Staging                      │
│  │                                                                          │
│  Archive/  ─────────────────────────────────────────────────────────────    │
│  │  Deprecated functions (keep for reference)                              │
│  │  700+ archived functions                                                │
│  │                                                                          │
│  Utils/  ───────────────────────────────────────────────────────────────    │
│  │  Shared utilities and helpers                                           │
│  │  Pattern: Utils/{Category} - {Function}                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Active Workers (Business Logic)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WORKERS BY DOMAIN (~150 active)                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🏘️ reZEN Workers (30+)                                                     │
│  ├── Agent Data (8051)                                                      │
│  ├── Team Roster Sync (8032)                                                │
│  ├── Transactions Sync (8052)                                               │
│  ├── Listings Sync (8053), Listings Update (8054)                          │
│  ├── Equity (8055)                                                          │
│  ├── Contributions (8056)                                                   │
│  ├── Network Cap Data (8058), Network Frontline (8059)                     │
│  ├── Onboarding Process * (8060-8073)                                      │
│  └── Get * helpers (Cap Data, Sponsor Tree, etc.)                          │
│                                                                              │
│  🔗 FUB Workers (25+)                                                       │
│  ├── Get People, Get Events, Get Calls, Get Deals                          │
│  ├── Get Appointments, Get Text Messages                                    │
│  ├── Webhooks Sync (8089)                                                   │
│  ├── Lambda Coordinator (8118)                                              │
│  ├── Refresh Tokens (8141)                                                  │
│  └── Onboarding * workers                                                   │
│                                                                              │
│  📂 SkySlope Workers (15+)                                                  │
│  ├── Get Listings (8050), Get Listing Data (8033)                          │
│  ├── Get Transaction Data (8031)                                            │
│  ├── Create Authentication (8048), Get Auth Session (8049)                 │
│  ├── Upsert Listing (8038), Upsert Transaction (8037)                      │
│  ├── Move Listing from Staging (8144)                                       │
│  └── Determine Stage helpers                                                │
│                                                                              │
│  🌐 Network Workers (10+)                                                   │
│  ├── Get Downline (8034)                                                    │
│  ├── Get Network Counts (8102)                                              │
│  ├── FrontLine by Tier (8115)                                               │
│  └── Update/Pull helpers                                                    │
│                                                                              │
│  📊 Metrics Workers (5+)                                                    │
│  ├── Create Snapshot (8140)                                                 │
│  ├── Network Counts (8096)                                                  │
│  ├── Listing Counts (8095)                                                  │
│  ├── Transaction Counts (8093)                                              │
│  └── Increment API Count (8042)                                             │
│                                                                              │
│  🔧 Utility Workers (10+)                                                   │
│  ├── Slack Webhook (8105)                                                   │
│  ├── Add Event To Log (8103)                                                │
│  ├── Get Geo State (8104)                                                   │
│  ├── API Wrapper (8080)                                                     │
│  └── Get API Key Data (8082)                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Task 2.1**: Document key worker functions

- [ ] Map reZEN worker data flows
- [ ] Map FUB worker data flows
- [ ] Map SkySlope worker data flows
- [ ] Document utility workers

### 2.3 Active Tasks (Orchestrators)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TASK ORCHESTRATORS (~100 active)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🏘️ reZEN Tasks                                                             │
│  ├── Daily Sync Tasks:                                                      │
│  │   ├── Team Roster Sync (7927)                                           │
│  │   ├── Agent Data (7928)                                                 │
│  │   ├── Transactions Sync (7929)                                          │
│  │   ├── Listings Sync (7930), Listings Update (7931)                      │
│  │   ├── Network Downline (7932), Cap Data (7933), Frontline (7934)        │
│  │   ├── Equity (7935)                                                     │
│  │   └── Contributions Daily Update (7936)                                 │
│  │                                                                          │
│  ├── Onboarding Tasks (7981-8025):                                         │
│  │   ├── Onboarding Start Job (7981)                                       │
│  │   ├── Load Transactions (7983), Process Transactions (7987)             │
│  │   ├── Load Network Downline (7985), Process Network (7993, 7996)        │
│  │   ├── Process Cap Data (7998)                                           │
│  │   ├── Process Contributions (8008), Contributors (8011)                 │
│  │   ├── Process Equity (8002)                                             │
│  │   └── Process Listings (7990)                                           │
│  │                                                                          │
│  └── Maintenance Tasks:                                                     │
│      ├── Process Webhooks (7995)                                           │
│      ├── Monitor Sync Locks (8000)                                         │
│      └── Remove Duplicates (8022)                                          │
│                                                                              │
│  🔗 FUB Tasks                                                               │
│  ├── Daily Update Tasks:                                                    │
│  │   ├── Daily Update People (7960)                                        │
│  │   ├── Daily Update Events (7959)                                        │
│  │   ├── Daily Update Deals (7958)                                         │
│  │   ├── Daily Update Calls (7957)                                         │
│  │   ├── Daily Update Appointments (7956)                                  │
│  │   └── Daily Update Text Messages (7961)                                 │
│  │                                                                          │
│  ├── Onboarding Tasks:                                                      │
│  │   ├── Onboarding People Worker (7977)                                   │
│  │   ├── Onboarding Calls Workers 1-4 (7979, 7994, 7997, 8001)            │
│  │   ├── Onboarding Events Worker (7982)                                   │
│  │   ├── Onboarding Appointments (7984, 7991)                              │
│  │   ├── Onboarding Text Messages (7986)                                   │
│  │   └── Onboarding Deals (7988)                                           │
│  │                                                                          │
│  └── Maintenance Tasks:                                                     │
│      ├── Refresh Tokens (7939)                                             │
│      ├── Delete Lambda Logs (7938)                                         │
│      ├── Webhook Check (7945)                                              │
│      └── Get Stages (7942), Get Users (7941)                               │
│                                                                              │
│  📂 SkySlope Tasks                                                          │
│  ├── Account Users Sync (7966)                                              │
│  ├── Listings Sync (7965)                                                   │
│  ├── Transactions Sync (7962)                                               │
│  ├── Move Listings from Staging (7964)                                      │
│  └── Move Transactions from Staging (7963)                                  │
│                                                                              │
│  📜 Title Tasks                                                             │
│  ├── Get Today's Qualia Orders (7944)                                       │
│  └── Orders (7943)                                                          │
│                                                                              │
│  📋 AD (Admin) Tasks                                                        │
│  ├── Email Network News Daily/Weekly (7972, 7973)                          │
│  ├── Upload Images to Cloud (7968, 7971)                                    │
│  ├── Missing Agent IDs Participants (7970)                                  │
│  └── CSV Insert Data (7967)                                                 │
│                                                                              │
│  📊 Metrics Tasks                                                           │
│  └── Create Snapshot (7937)                                                 │
│                                                                              │
│  🔔 Reporting Tasks                                                         │
│  └── Process Errors Send Slack (7940)                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Task 2.2**: Document task orchestration

- [ ] Map daily sync task sequence
- [ ] Document onboarding task flow
- [ ] Document webhook processing flow

---

## Phase 3: Background Tasks (Scheduled Jobs)

### 3.1 Active Background Tasks (~30)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ACTIVE SCHEDULED TASKS (V3)                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🏘️ reZEN Daily Sync (IDs 2375-2384) ✅ ACTIVE                              │
│  ├── 2375: reZEN - Team Roster - Sync V2 V3                                 │
│  ├── 2376: reZEN - Agent - Data v2 V3                                       │
│  ├── 2377: reZEN - Transactions - Sync v2 V3                                │
│  ├── 2378: reZEN - Listings - Sync v2 V3                                    │
│  ├── 2379: reZEN - Listings - Update v2 V3                                  │
│  ├── 2380: reZEN - Network - Downline v2 V3                                 │
│  ├── 2381: reZEN - Network - Cap Data - V2 V3                               │
│  ├── 2382: reZEN - Network - FrontLine - V2 V3                              │
│  ├── 2383: reZEN - Equity V2 V3                                             │
│  └── 2384: reZEN - Contributions - Daily Update v2 V3                       │
│                                                                              │
│  🔗 FUB Daily Sync (IDs 2418-2433) ✅ ACTIVE                                │
│  ├── 2418: FUB - Daily Update - Appointments V3                             │
│  ├── 2419: FUB - Daily Update - Calls V3                                    │
│  ├── 2420: FUB - Daily Update - Deals V3                                    │
│  ├── 2421: FUB - Daily Update - Events V3                                   │
│  ├── 2422: FUB - Daily Update - People V3                                   │
│  ├── 2423: FUB - Daily Update - Text Messages V3                            │
│  ├── 2428: FUB - Refresh Tokens V3                                          │
│  └── 2432: FUB - Delete Lambda Logs V3                                      │
│                                                                              │
│  📂 SkySlope Sync (IDs 2385-2389) ✅ ACTIVE                                 │
│  ├── 2385: SkySlope - Transactions Sync V3                                  │
│  ├── 2386: SkySlope - Move Transactions from Staging V3                     │
│  ├── 2387: SkySlope - Listings Sync V3                                      │
│  ├── 2388: SkySlope - Move Listings from Staging V3                         │
│  └── 2389: SkySlope - Account Users Sync V3                                 │
│                                                                              │
│  📊 Other Active Tasks                                                      │
│  ├── 2433: Metrics - Create Snapshot V3                                     │
│  ├── 2434: Reporting - Process Errors Send Slack V3                         │
│  └── 2435: Title - Get Today's Qualia Orders V3                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Paused Legacy Tasks (~170)

The ~170 paused tasks are V2 versions that have been superseded by V3 tasks. They include:

- reZEN V2 sync tasks
- FUB V2 sync and onboarding tasks
- SkySlope V2 tasks
- Various one-off and debug tasks

**Task 3.1**: Document scheduling patterns

- [ ] Map task execution schedules
- [ ] Document task dependencies
- [ ] Identify critical path tasks

---

## Phase 4: API Architecture

### 4.1 API Groups Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  API GROUPS (27 total)                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🚀 FRONTEND API v2 (ID: 515, Canonical: pe1wjL5I)                          │
│  │  Main production API for frontend applications                           │
│  │  Tags: frontend, v2, all-features                                        │
│  │                                                                          │
│  🔧 MCP GROUPS (Testing/Admin)                                              │
│  ├── MCP: Workers (536, 4UsTtl3m) - Worker function endpoints              │
│  ├── MCP: Tasks (532, 4psV7fp6) - Task orchestrator endpoints              │
│  ├── MCP: System (535, LIdBL1AN) - System oversight                        │
│  ├── MCP: Seeding (531, 2kCRUYxG) - Test data seeding                      │
│  └── MCP: SkySlope Tests (574, 6kzol9na) - SkySlope testing                │
│                                                                              │
│  📥 WEBHOOKS                                                                │
│  ├── Webhooks (646, XOwEm4wm) - Inbound webhooks                           │
│  ├── Webhook: Stripe (340, ihFeqSDq) - Stripe payment events               │
│  └── Webhook: FUB (348, sCYsDnFD) - FUB CRM events                         │
│                                                                              │
│  🔐 AUTH                                                                    │
│  ├── Auth (519, i6a062_x) - Main authentication                            │
│  └── Legacy: Auth 2FA (364, js21O_y5) - Two-factor auth                    │
│                                                                              │
│  📦 LEGACY GROUPS (V1 compatibility)                                        │
│  ├── Legacy: Auth (341, GN3xP4iV)                                          │
│  ├── Legacy: Dashboard (342, 3xoq5P6L)                                     │
│  ├── Legacy: Individual (343, YjYZueIH)                                    │
│  ├── Legacy: Charts (344, Y2N55_il)                                        │
│  ├── Legacy: Onboarding (345, LxaOlI7l)                                    │
│  ├── Legacy: Workers (346, Cmzol9bx)                                       │
│  ├── Legacy: CSV Import (349, SuvFkHvn)                                    │
│  ├── Legacy: Team (339, Dz8JDa7D)                                          │
│  ├── Legacy: Notifications (361, PFPOc_Ym)                                 │
│  ├── Legacy: Preferences (533, GavJZkAu)                                   │
│  └── Legacy: Luzmo (355, 2peMX3H6)                                         │
│                                                                              │
│  🔄 MIGRATION                                                               │
│  └── Migration: V1 to V2 (650, Lrekz_3S)                                   │
│                                                                              │
│  🔍 ADMIN                                                                   │
│  ├── Workspace Introspection (654, g79A_W7O) - V1-V2 comparison            │
│  ├── Machine 2.0 Tests (659, 20LTQtIX) - Testing                           │
│  └── BugFeedback (657, fbKIF3tp) - Bug reporting                           │
│                                                                              │
│  🗑️ DEPRECATED                                                              │
│  └── Delete: Auto CRUD (337, rC-g75e2) - Unused                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Task 4.1**: Document API architecture

- [ ] Map Frontend API v2 endpoints by domain
- [ ] Document MCP endpoints for testing
- [ ] Document webhook handlers

---

## Phase 5: Data Flow Patterns

### 5.1 Integration Sync Patterns

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DATA FLOW: EXTERNAL → XANO → FRONTEND                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  reZEN Integration Flow:                                                    │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐       │
│  │  reZEN   │───>│ Task: Sync   │───>│  Worker:    │───>│  Tables  │       │
│  │   API    │    │ Orchestrator │    │ Process Data│    │ (agent,  │       │
│  └──────────┘    └──────────────┘    └─────────────┘    │ network, │       │
│                                                          │ txn...)  │       │
│                                                          └──────────┘       │
│                                                                              │
│  FUB Integration Flow:                                                      │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐       │
│  │   FUB    │<──>│  OAuth +     │───>│  Worker:    │───>│  Tables  │       │
│  │   API    │    │  Refresh     │    │ Get/Process │    │ (fub_*)  │       │
│  └──────────┘    └──────────────┘    └─────────────┘    └──────────┘       │
│       │                                                                      │
│       └──────── Webhooks ────────────────────────────────────────>          │
│                                                                              │
│  SkySlope Integration Flow:                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐       │
│  │ SkySlope │───>│ Task: Sync   │───>│  Staging    │───>│  Main    │       │
│  │   API    │    │ + Process    │    │  Tables     │    │  Tables  │       │
│  └──────────┘    └──────────────┘    └─────────────┘    └──────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ONBOARDING SEQUENCE (New User Data Population)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 1: Team Data ──────────────────────────────────────────────────────   │
│    Task: 7927 (Team Roster Sync)                                            │
│    Worker: 8066 (Syncing - Team Roster)                                     │
│    Tables: team, team_roster, team_owners, team_admins                      │
│                                                                              │
│  Step 2: Agent Data ─────────────────────────────────────────────────────   │
│    Task: 7928 (Agent Data)                                                  │
│    Worker: 8051 (reZEN - Agent Data)                                        │
│    Tables: agent, user                                                       │
│                                                                              │
│  Step 3: Transactions ───────────────────────────────────────────────────   │
│    Task: 7929 (Transactions Sync)                                           │
│    Worker: 8052 (reZEN - Transactions Sync)                                 │
│    Tables: transaction, participant, paid_participant, transaction_history  │
│                                                                              │
│  Step 4: Listings ───────────────────────────────────────────────────────   │
│    Task: 7930, 7931 (Listings Sync, Update)                                 │
│    Worker: 8053, 8054 (reZEN - Listings Sync/Update)                        │
│    Tables: listing, listing_history                                          │
│                                                                              │
│  Step 5: Contributions ──────────────────────────────────────────────────   │
│    Task: 7936, 8008 (Contributions Daily Update, Process)                   │
│    Worker: 8056, 8060 (reZEN - Contributions, Load Contributions)           │
│    Tables: contribution, income, revshare_totals, contributors              │
│                                                                              │
│  Step 6: Network ────────────────────────────────────────────────────────   │
│    Task: 7932, 7933, 7934 (Network Downline, Cap Data, Frontline)          │
│    Worker: 8058, 8059, 8034 (Network Cap/Frontline/Downline)               │
│    Tables: network, sponsor_tree                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Task 5.1**: Document data flows

- [ ] Map complete onboarding sequence
- [ ] Document daily sync cycles
- [ ] Map webhook event handling

---

## Phase 6: Key Patterns & Conventions

### 6.1 Function Result Pattern (FP-Result-Type)

```xanoscript
// Standard response pattern used across all workers
response = {
  success: true           // boolean: did the operation succeed?
  data   : { ... }        // object: the actual result data
  error  : ""             // string: error message if failed
  step   : "step_name"    // string: which step completed
}
```

### 6.2 Tagging Convention

```
Tags used in functions:
├── 📊 v3           - V3 architecture (normalized)
├── ⚙️ worker       - Worker function
├── 🎯 orchestrator - Task orchestrator
├── fp-result-type  - Uses FP result pattern
├── ✅ verified-clean - Tested and working
├── 🔧 fixed-*      - Bug fixes with dates
├── ⚠️ legacy       - Legacy code, needs review
├── ⚠️ deprecated   - Should not be used
└── Domain tags:
    ├── 🏘️ rezen, 🔗 fub, 📂 skyslope
    ├── 🌐 network, 👥 team, 💰 transaction
    ├── 📥 onboarding, 📧 email, 📊 metrics
    └── 🔧 utility, 🛠️ helper
```

---

## Exploration Tasks Checklist

### Phase 1: Tables

- [ ] **1.1** Map core entity relationships (user, agent, team, transaction, listing, network)
- [ ] **1.2** Document financial data flow (contribution → income → revshare)
- [ ] **1.3** Document each integration (FUB, reZEN, SkySlope, DotLoop, Lofty)
- [ ] **1.4** Document infrastructure patterns (sync state, jobs, logging)
- [ ] **1.5** Document page builder architecture

### Phase 2: Functions

- [ ] **2.1** Document key worker functions by domain
- [ ] **2.2** Document task orchestration patterns

### Phase 3: Background Tasks

- [ ] **3.1** Map task execution schedules and dependencies

### Phase 4: API

- [ ] **4.1** Map Frontend API v2 endpoints
- [ ] **4.2** Document MCP testing endpoints
- [ ] **4.3** Document webhook handlers

### Phase 5: Data Flows

- [ ] **5.1** Map complete onboarding sequence
- [ ] **5.2** Document daily sync cycles
- [ ] **5.3** Map webhook event handling

### Phase 6: Deep Dives

- [ ] **6.1** Trace a transaction from reZEN to dashboard display
- [ ] **6.2** Trace a FUB contact from webhook to people table
- [ ] **6.3** Trace network hierarchy calculation
- [ ] **6.4** Trace contribution → income → revshare calculation

---

## Statistics Summary

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  WORKSPACE 5 STATISTICS                                                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  📊 TABLES: 194                                                               ║
║     ├── Core entities: ~40                                                    ║
║     ├── Integration tables: ~50                                               ║
║     ├── Staging tables: ~15                                                   ║
║     ├── Page builder: ~12                                                     ║
║     ├── Configuration: ~20                                                    ║
║     └── Logging/Audit: ~15                                                    ║
║                                                                               ║
║  🔧 FUNCTIONS: 971                                                            ║
║     ├── Workers (active): ~150                                                ║
║     ├── Tasks (orchestrators): ~100                                           ║
║     ├── Archive (deprecated): ~700                                            ║
║     └── Utils: ~20                                                            ║
║                                                                               ║
║  📅 BACKGROUND TASKS: 200+                                                    ║
║     ├── Active (V3): ~30                                                      ║
║     └── Paused (V2/legacy): ~170                                              ║
║                                                                               ║
║  🌐 API GROUPS: 27                                                            ║
║     ├── Frontend API v2: 1 (main)                                             ║
║     ├── MCP (testing): 5                                                      ║
║     ├── Webhooks: 3                                                           ║
║     ├── Auth: 2                                                               ║
║     └── Legacy: 16                                                            ║
║                                                                               ║
║  🔗 INTEGRATIONS: 5                                                           ║
║     ├── FUB (Follow Up Boss) - CRM                                            ║
║     ├── reZEN - Core brokerage data                                           ║
║     ├── SkySlope - Transactions/Listings                                      ║
║     ├── DotLoop - Transaction management                                      ║
║     └── Lofty - Lead management                                               ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Next Steps

1. **Start with Phase 1.1**: Map core entity relationships
2. **Use Xano MCP**: `get_table_schema` for detailed field analysis
3. **Use Xano MCP**: `get_function` to inspect worker logic
4. **Document findings**: Update this epic with discoveries
5. **Create sub-documents**: Break out detailed docs per domain

---

_Created: 2026-01-26_
_Status: Ready for systematic exploration_
