# fn-14-7cl.3 Build Functions story tab component

## Description

Build a Functions story tab that shows V2 function inventory with health status. This completes story line 6 of 6 from the original fn-13-iz6 spec.

### What to build

Create `components/story-tabs/functions-story-tab.tsx` exporting `FunctionsStoryTab`.

Note: There's an existing `components/functions-tab.tsx` (the "Functions Deep Dive" tab) — this new component is different. It's a story-style overview that shows function health and organization, not a deep-dive debugger.

### Content

1. **Function Inventory Summary** — Top-level metrics:
   - Total V2 functions count (from existing data in `lib/v2-data.ts` or API)
   - Grouped by API group (WORKERS, TASKS, SYSTEM, SEEDING, Auth, Frontend API)
   - Count per group with status indicators

2. **API Group Cards** — One card per API group showing:
   - Group name and base URL
   - Endpoint count
   - Known working vs unknown status
   - Key endpoints listed (from `lib/mcp-endpoints.ts`)

3. **Function Health Dashboard** — For endpoints with known status:
   - Working (green) — verified via testing
   - Unknown (gray) — not yet tested
   - Broken (red) — known 404 or error
   - Reference the endpoint audit data from CLAUDE.md (32/38 pass rate)

4. **V1 vs V2 Function Comparison** — High-level:
   - V1 function count vs V2 function count
   - Migration coverage percentage
   - Key function categories (sync, aggregation, utility, auth)

### Patterns to follow

- Follow existing story tab patterns (schema-mapping-story-tab.tsx for non-user-dependent reference)
- This tab does NOT require user selection (function inventory is system-level)
- Use semantic CSS tokens for status colors
- ShadCN components: Card, Badge, Collapsible
- Loading skeletons during data fetch

### Wire into navigation

- Add to `app/page.tsx`: ViewMode `'functions-story'`, label "Function Health", icon `HeartPulse` or `Activity` from lucide-react
- Add ErrorBoundary-wrapped render in content section

## Acceptance

- [ ] FunctionsStoryTab component renders function inventory
- [ ] Functions grouped by API group with counts
- [ ] Health status indicators (working/unknown/broken)
- [ ] V1 vs V2 comparison summary
- [ ] Wired into page.tsx navigation
- [ ] Zero TypeScript errors, zero new lint errors

## Done summary

Built FunctionsStoryTab component showing V2 function inventory grouped by API group (Tasks, Workers, System, Seeding, Auth, Frontend) with endpoint health status indicators (working/broken/unknown) derived from audit data, V1 vs V2 function comparison with migration coverage metrics, and a V2 API group inventory reference. Wired into page.tsx navigation as "Function Health" with HeartPulse icon.

## Evidence

- Commits: d28edb59c35b98ad8a8b39788083bee1202bb1b8, 52123d61d4892454ff376a29b5aed24a4ffc2bd1
- Tests: npx tsc --noEmit, pnpm lint
- PRs:
