# Machine 2.0 - Project Completion Plan

## Executive Summary

This plan outlines the path to completing the V2 backend admin interface ("The Machine 2.0") and the demo avatar system. The goal is to:
1. Enable investors/team to seamlessly switch between demo user personas
2. Create a visual system that proves V2 backend works
3. Use that system to migrate all users from V1 to V2
4. Generate API contracts for the frontend team

---

## Phase 1: Demo Avatar System (TODAY)

### Objective
Allow users (Tim, Brad, investors) to log into their own account and click an avatar to instantly switch to a demo user's view without separate login.

### Deliverables

#### 1.1 Backend: Get Demo Users Endpoint
```
GET /api:GROUP/demo-users
Returns: Array of 5 demo user objects with IDs from demo_data
```

**Response structure:**
```json
{
  "users": [
    { "id": 7, "name": "Michael Johnson", "type": "team-owner", "source": "David Keener" },
    { "id": 256, "name": "Sarah Williams", "type": "team-member", "source": "Katie Grow" },
    { "id": 133, "name": "James Anderson", "type": "network-builder", "source": "Brad Walton" },
    { "id": TBD, "name": "TBD", "type": "team-admin-non-producing", "source": "TBD" },
    { "id": TBD, "name": "TBD", "type": "team-admin-producing", "source": "TBD" }
  ]
}
```

#### 1.2 Backend: Get Demo Auth Token Endpoint
```
POST /api:GROUP/demo-auth
Body: { "user_id": 7 }
Returns: { "authToken": "...", "user_data": {...} }
```

**Requirements:**
- Must authenticate against demo_data datasource
- Must return valid token that works with X-Data-Source: demo_data header
- Frontend will use this token to switch user context

#### 1.3 Frontend Integration (Scott's side)
- Replace emulation dropdown names with avatar names
- On click: call demo-auth → receive token → switch auth context → reload view
- Add banner: "Switch back to original" when in demo mode

### Status
- [x] 3 demo users created (Michael, Sarah, James)
- [ ] 2 more demo users needed (await Scott for names)
- [ ] Get demo users endpoint
- [ ] Get demo auth token endpoint
- [ ] Frontend wiring (Scott)

---

## Phase 2: Machine 2.0 Restructure (THIS WEEK)

### Current Problem
The current structure shows "The Crank" first - this is backwards. It shows the machinery before explaining WHY it exists.

### New Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Tab 1: THE USERS                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Demo Users  │ │ Live Users  │ │ User Cards  │               │
│  │ (avatars)   │ │ (migration) │ │ with status │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                 │
│  Each card shows: name, type, stats, onboard status, actions   │
│  Actions: [Clear Data] [Run Onboarding] [View Dashboard]       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Tab 2: ONBOARDING (one-time data ingestion)                   │
│                                                                 │
│  Step 1: Get Team Info (if team account)                       │
│    └── Fetch team ID → Store team record                       │
│    └── Fetch roster → Store roster records                     │
│                                                                 │
│  Step 2: Get Participants (transactions they're part of)       │
│    └── Call participant endpoint per lifecycle group           │
│    └── Store: transactions, paid_participants, items           │
│                                                                 │
│  Step 3: Get Listings                                          │
│    └── Fetch listings they're participant of                   │
│                                                                 │
│  Step 4: Get Contributions (RevShare)                          │
│    └── Fetch contribution records                              │
│                                                                 │
│  Step 5: Get Network (Downline/Sponsor Tree)                   │
│    └── Fetch network hierarchy                                 │
│                                                                 │
│  Visual: Wheel spinning per step, tables being populated       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Tab 3: SYNCING (continuous data refresh)                      │
│                                                                 │
│  Job Queue Visualization:                                       │
│    ┌──────────────────────────────────────────────┐            │
│    │ Queue: [Job 1] [Job 2] [Job 3] ...           │            │
│    └──────────────────────────────────────────────┘            │
│                                                                 │
│  Task Schedules:                                                │
│    • reZEN Transactions: Every 6hr                             │
│    • reZEN Listings: Every 6hr                                 │
│    • FUB Daily Update: Nightly                                 │
│    • Aggregations: Daily 7am                                   │
│                                                                 │
│  Visual: Show tasks "picking up" jobs from queue               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Tab 4: SCHEMA COMPARISON (V1 vs V2)                           │
│                                                                 │
│  Table comparison grid:                                         │
│  ┌────────────┬────────────┬─────────┬──────────┐              │
│  │ V1 Field   │ V2 Field   │ Status  │ Action   │              │
│  ├────────────┼────────────┼─────────┼──────────┤              │
│  │ user.name  │ user.name  │ ✓ Match │          │              │
│  │ user.foo   │ -          │ Missing │ Add      │              │
│  └────────────┴────────────┴─────────┴──────────┘              │
│                                                                 │
│  Purpose: Identify ALL gaps before migration                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Tab 5: FRONTEND API (V2 → Frontend contract)                  │
│                                                                 │
│  Endpoint documentation:                                        │
│  • /auth/login                                                 │
│  • /auth/me                                                    │
│  • /transactions                                               │
│  • /listings                                                   │
│  • /network                                                    │
│  • etc.                                                        │
│                                                                 │
│  Each endpoint shows: curl, payload, response structure        │
│  [Generate API Contract] button → exports full documentation   │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### 2.1 Restructure Tab Order
1. Rename "The User" → "Users" and make it first
2. Split "The Crank" into "Onboarding" and "Syncing"
3. Add "Schema Comparison" tab
4. Add "Frontend API" tab

#### 2.2 Build User Cards Component
Each user card shows:
- Name, email, user_id
- Type (team-owner, team-member, network-builder)
- Onboarding status (not started, in progress, complete)
- Sync status (last sync time, errors)
- Data stats (transactions, listings, network count)
- Actions: Clear, Onboard, View

#### 2.3 Build Onboarding Visualization
- Step-by-step process visualization
- Real-time status as each step runs
- Tables being populated with record counts
- Error handling and retry capability

#### 2.4 Build Syncing Visualization
- Job queue display (jobs waiting to be picked up)
- Task schedule display (when each task fires)
- Visual of task "picking up" a job
- Status per job (pending, running, complete, error)

#### 2.5 Build Schema Comparison
- Load V1 workspace tables and fields
- Load V2 workspace tables and fields
- Compare and show gaps
- Allow marking fields as "intentionally different" vs "needs fixing"

#### 2.6 Build Frontend API Documentation
- List all V2 endpoints that frontend will call
- Show curl examples
- Show payload/response structures
- Generate exportable API contract

---

## Phase 3: Prove One User Works (END OF MONTH)

### Objective
Take Michael Johnson (demo user), run through entire flow, prove data appears correctly on V2 frontend.

### Steps

1. **Clear Michael's demo data**
2. **Run onboarding process** - watch it in Machine 2.0
3. **Verify tables populated** - check counts match expected
4. **Run sync cycle** - ensure continuous sync works
5. **Login as Michael on V2 frontend** - verify data displays
6. **Document any issues** - add to gap list

### Success Criteria
- [ ] Michael can login
- [ ] Dashboard shows correct stats
- [ ] Transactions display correctly
- [ ] Listings display correctly
- [ ] Network displays correctly
- [ ] Team roster displays correctly (if applicable)
- [ ] Emulation dropdown works

---

## Phase 4: Migration (AFTER MONTH END)

### Process
1. For each live user in V1:
   - Create user card in Machine 2.0
   - Run onboarding process
   - Verify data
   - Mark as migrated

2. Continuous sync takes over

3. Switch V1 frontend to V2 backend

### Rollback Plan
- Keep V1 backend running in parallel
- If issues, can switch back immediately
- Machine 2.0 provides visibility into what went wrong

---

## Technical Dependencies

### Workspace Information
- **V1 (Workspace 1):** Production data, 251 tables, demo_data datasource for demo users
- **V2 (Workspace 5):** New normalized schema, Tasks/ and Workers/ functions

### API Groups (V2)
| Group | Base URL | Purpose |
|-------|----------|---------|
| TASKS | api:4psV7fp6 | Task orchestration |
| WORKERS | api:4UsTtl3m | Worker functions |
| SYSTEM | api:LIdBL1AN | Status and admin |
| SEEDING | api:2kCRUYxG | Test data |

### Demo User Credentials
| User | Email | Password | user_id |
|------|-------|----------|---------|
| Michael Johnson | michael@demo.agentdashboards.com | AgentDashboards143! | 7 |
| Sarah Williams | sarah@demo.agentdashboards.com | AgentDashboards143! | 256 |
| James Anderson | james@demo.agentdashboards.com | AgentDashboards143! | 133 |
| TBD | TBD | TBD | TBD |
| TBD | TBD | TBD | TBD |

---

## Critical Technical Understanding

### The Participant Endpoint (Core of Everything)
Scott emphasized: **You don't "get transactions" - you get transactions a person is a PARTICIPANT of.**

```
Endpoint: GET transactions by agent ID + lifecycle group
Returns: All transactions where this agent is a participant
Includes: paid_participants, participants, items (deductions)
```

This is the PRIMARY way data comes in for a user.

### Income = 3 Sources
1. **Compensation** - Commission from closed deals (only closed deals count)
2. **RevShare** - Payments from downline closing deals
3. **Equity** - Equity program payments (not everyone has)

### Team Data Challenges
- Orphaned team IDs (old teams merged into new)
- Missing team IDs (transactions without team association)
- Roster gaps (past members not in roster)
- Real API limitations (can't look up arbitrary team IDs)

**Interim solution:** User-facing resolve wizard + backfill roster from transaction history

---

## Timeline

### Week 1 (Now)
- [ ] Demo avatar endpoints (Phase 1)
- [ ] Restructure Machine 2.0 tabs (Phase 2.1)
- [ ] User cards component (Phase 2.2)

### Week 2
- [ ] Onboarding visualization (Phase 2.3)
- [ ] Syncing visualization (Phase 2.4)

### Week 3
- [ ] Schema comparison (Phase 2.5)
- [ ] Frontend API documentation (Phase 2.6)

### Week 4
- [ ] Prove Michael Johnson works end-to-end (Phase 3)
- [ ] Document gaps and fixes needed
- [ ] Prepare for migration

---

## Success Metrics

1. **Demo System Works:** Investors can click avatar → see demo data
2. **Machine 2.0 Complete:** Visual system shows entire user journey
3. **One User Proven:** Michael Johnson works end-to-end on V2
4. **API Contract Generated:** Frontend team has complete documentation
5. **Migration Path Clear:** Can systematically move all users to V2

---

## Notes from Scott Call

Key quotes:
- "If you can get one test user to run through the gamut, get put in the database and surface that data on the front end, we can do it for all users."
- "Onboarding and syncing - onboarding is like person signed up, this all happens. Once they're in the system, then we're constantly syncing their data."
- "The first step is get team members, right? If they're team account, I get their team members."
- "This endpoint... gets you the transactions of the deals that Dave is a participant of. That's really what it is."

---

## Files Reference

### This Project (xano-v2-admin)
- `components/machine/machine-diagram.tsx` - Main Machine component
- `lib/mcp-endpoints.ts` - API endpoint definitions
- `app/page.tsx` - Main page with view modes

### Demo Sync Project (v0-demo-sync-admin-interface)
- `CLAUDE.md` - Demo user documentation, frontend integration guide
- `app/admin/demo-sync/` - Demo sync UI components

---

*Plan created: January 15, 2026*
*Based on: Scott call transcript analysis*
