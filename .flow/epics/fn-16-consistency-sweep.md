# Epic: Full Consistency & Client-Clarity Sweep

## Problem Statement

This dashboard is a **client deliverable** — every page, every number, every label must communicate clearly to a non-technical stakeholder while preserving all factual detail. Two systemic problems exist:

### 1. Record Counts Are Inconsistent Across Pages

The same data is reported differently depending on which tab you're on:

| Location                                    | Claims                                                        | Source                                                              |
| ------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `page.tsx` subtitle                         | **32.8M records**                                             | Hardcoded string (recently updated from 25.4M)                      |
| `ecosystem-hub-tab.tsx` Quick Stats         | **25.4M** Total Records                                       | Hardcoded — STALE, contradicts page.tsx                             |
| `ecosystem-hub-tab.tsx` V1 Workspace card   | **25.4M+** Records                                            | Hardcoded — STALE                                                   |
| `ecosystem-hub-tab.tsx` V2 Workspace card   | **~887K** V1→V2 Sync                                          | Hardcoded approximation — STALE                                     |
| `ecosystem-hub-tab.tsx` project description | **23 tabs**                                                   | Hardcoded — WRONG (actually 26 now)                                 |
| `record-census-tab.tsx`                     | Live from API                                                 | Computed from `/api/v1/record-counts` — THIS IS THE SOURCE OF TRUTH |
| `status-dashboard-tab.tsx`                  | Live from API                                                 | Computed from `/api/v1-v2-comparison`                               |
| `transformation-story-tab.tsx`              | Live from sync endpoint                                       | Computed from sync-v1-to-v2-direct                                  |
| `live-migration-status.tsx`                 | **ARCH constant**: 109 Tasks, 194 Workers, 324 Test Endpoints | HARDCODED STALE SNAPSHOT with comment "update when Xano changes"    |

**The record-census API (`/api/v1/record-counts`) returns the authoritative totals.** Every other page must either call that same API or reference consistent numbers.

### 2. Jargon Quality Is Uneven

The first sweep cleaned up Story and Proof tabs, but significant jargon remains in:

| File                                                  | Jargon                                        | User-Visible? |
| ----------------------------------------------------- | --------------------------------------------- | ------------- |
| `ecosystem-hub-tab.tsx`                               | "SWR", "React Query", "Vitest" in tech badges | YES           |
| `ecosystem-hub-tab.tsx`                               | Xano instance URLs shown in mono font         | YES           |
| `ecosystem-hub-tab.tsx`                               | "Workspace ID: 1" / "Workspace ID: 5"         | YES           |
| `function-code-modal.tsx:208`                         | "The snappy CLI's get_function tool..."       | YES           |
| `live-migration-status.tsx:1798`                      | "Validating foreign keys..."                  | YES           |
| `live-migration-status.tsx:1998`                      | "API groups" label                            | YES           |
| `status-dashboard-tab.tsx:322,369`                    | "API Groups" label                            | YES           |
| `transformation-story-tab.tsx:35,53,71`               | "JSON blob" (kept from prior sweep)           | YES           |
| `doc-tabs/architecture-tab.tsx:354`                   | "foreign keys, indexes, and audit trails"     | YES           |
| Endpoint paths like `/test-function-8066-team-roster` | Shown in code blocks in onboarding, webhooks  | YES           |

---

## Tasks

### Task 1: Create a shared constants file for authoritative counts

**File:** `lib/dashboard-constants.ts` (NEW)

Create a single source of truth file that exports:

- `V1_TABLE_COUNT` = computed from `V1_TABLES.length`
- `V2_TABLE_COUNT` = computed from `TABLES_DATA` filtered for unique
- `NAV_TAB_COUNT` = computed from `NAV_ITEMS` filtered for non-separators
- `PROJECT_COUNT` = 3 (static, unlikely to change)
- `WORKSPACE_COUNT` = 2 (static)

These constants will be imported wherever hardcoded numbers currently exist.

**Note:** Record totals (25.4M, 32.8M, ~887K) CANNOT be constants — they change as migration progresses. These must come from live API data or be removed as static claims.

### Task 2: Fix ecosystem-hub-tab.tsx — the worst offender

This file has the most inconsistencies and jargon. Changes:

**Numbers:**

- Remove hardcoded "25.4M" from Quick Stats → replace with "See Record Census" or fetch from `/api/v1/record-counts`
- Remove hardcoded "25.4M+" from V1 Workspace card → same approach
- Remove hardcoded "~887K" from V2 Workspace card → either fetch live or remove the approximation entirely
- Fix "23 tabs" → import `NAV_TAB_COUNT` from constants
- Fix "251" → import `V1_TABLE_COUNT` from constants

**Jargon:**

- Tech badges: Replace "SWR" → "Real-time Data", "React Query" → "Data Caching", "Vitest" → "Automated Tests"
- Xano instance URLs (`xmpx-swi5-tlvy.n7c.xano.io`): Hide behind a "Show technical details" toggle or remove entirely
- "Workspace ID: 1" / "Workspace ID: 5" → Hide or relabel as "Environment: Production" / "Environment: V2 Target"
- "GitHub API error" → "Could not load project status"
- "GitHub rate limit: X remaining" → Remove this from the UI entirely (operational detail, not client info)

### Task 3: Fix page.tsx subtitle

- Import counts from `lib/dashboard-constants.ts`
- Change from hardcoded `32.8M records` to dynamic count OR remove the record claim entirely (since it changes) and use: `3 projects · 2 workspaces · 251 V1 tables → 193 V2 tables`
- The table counts are stable and verifiable. Record counts change daily.

### Task 4: Fix live-migration-status.tsx stale ARCH constant

The `ARCH` constant (lines 36-53) is a stale snapshot. Two options:

**Option A (Preferred):** Remove the hardcoded constant entirely. The data this tab shows already comes from `/api/v1-v2-comparison` — use the API response data to compute task/worker/endpoint counts dynamically.

**Option B (Quick fix):** Add a visible "Last verified:" date stamp next to the ARCH numbers so the client knows these are point-in-time snapshots, not live.

Also fix:

- "Validating foreign keys..." → "Checking data relationships..."
- "API groups" label → "Service Groups"

### Task 5: Fix status-dashboard-tab.tsx labels

- "API Groups" (lines 322, 369, 415) → "Service Groups"
- This tab already fetches live data from the API — the numbers are dynamic and correct. Only the labels need updating.

### Task 6: Fix function-code-modal.tsx snappy reference

- Line 208: "The snappy CLI's get_function tool has a parameter issue..." → "The code retrieval service has a parameter issue that prevents viewing full function source code"
- Remove any reference to "snappy" as a tool name — the client doesn't know or care what internal tools are called.

### Task 7: Fix transformation-story-tab.tsx remaining jargon

- Lines 35, 53, 71: "fields stored as a single JSON blob" → "fields crammed into a single data column" (the word "JSON" is still technical jargon even after the first sweep)
- "Typed columns" label (line 263) → "Properly structured columns"

### Task 8: Fix doc-tabs references

- `architecture-tab.tsx:354`: "foreign keys, indexes, and audit trails" → "enforced relationships, fast lookups, and change history"
- `data-model-tab.tsx:541`: "Complex relationship structure with proper foreign keys" → "Complex relationships properly enforced between tables"
- `architecture-tab.tsx`: "API Groups" section title and references → "Service Groups" (multiple locations)

### Task 9: Make endpoint paths human-readable in onboarding & webhooks

Currently the expanded detail cards show raw endpoint paths like:

```
POST /test-function-8066-team-roster
```

These should be reformatted as:

```
Backend: Team Roster Import (Function #8066)
```

**Files:** `onboarding-story-tab.tsx`, `webhooks-story-tab.tsx`

The `endpoint` field in step/webhook definitions stays the same (it's used for API calls), but the DISPLAY in the "Backend Endpoint" section should use a human-readable format with the raw path shown smaller/dimmer below if needed for debugging.

### Task 10: Build verification and end-to-end walkthrough

After all changes:

1. `pnpm build` — zero errors
2. Page-by-page walkthrough verifying:
   - Every number shown matches the authoritative source
   - No developer jargon visible in any user-facing text
   - The story is coherent: V1 (production, 251 tables) → V2 (normalized, 193 tables), with record counts shown consistently
   - Every tab that shows V1/V2 counts uses the same terms and framing

---

## Implementation Order

1. **Task 1** (constants file) — no dependencies, enables all other tasks
2. **Task 3** (page.tsx) — quick, sets the tone for the rest
3. **Task 2** (ecosystem-hub) — biggest bang, most visible inconsistencies
4. **Task 7** (transformation) — quick text fix
5. **Task 6** (function-code-modal) — quick text fix
6. **Task 5** (status-dashboard) — quick label fix
7. **Task 4** (live-migration-status) — needs more thought on ARCH constant
8. **Task 8** (doc-tabs) — lower traffic pages
9. **Task 9** (endpoint display format) — polish
10. **Task 10** (build + walkthrough) — verification

---

## Success Criteria

- A client can navigate from tab 1 to tab 26 and see ONE consistent story
- Record counts either come from the same API or are not claimed as static facts
- Zero instances of: MCP, CLI, xdo, JSONB, JSON blob, foreign key, API group, backfill, seeding, snappy, mvpw, SWR, React Query in user-visible text
- Every label, description, error message, and loading state uses language a non-technical person understands
- `pnpm build` passes clean
