# fn-3-lv0.4 Audit background task schedules

## Description

Audit background tasks - why do 100+ tasks have empty schedule strings?

**Size:** S
**Files:** lib/background-tasks-inventory.ts, lib/background-tasks-cache.json

## Approach

1. Query Xano Meta API for all background tasks in workspace 5
2. Check which tasks have actual schedules vs empty strings
3. Determine if schedules are set in Xano UI but not exposed via API
4. Identify which tasks SHOULD be scheduled for daily sync
5. Document the expected schedule for each critical task

## Key context

- 100+ tasks defined but only 10 in cache
- "Snappy CLI's list_tasks is broken (returns 404)" noted in code
- Need to use direct Xano Meta API: `/api:meta/workspace/5/task`

## Acceptance

- [ ] Retrieved full background task list from Xano Meta API
- [ ] Identified tasks with schedules vs empty
- [ ] Documented which tasks should run daily/hourly
- [ ] Updated background-tasks-cache.json if needed

## Done summary

Audited all 100 background tasks in V2 workspace. Key finding: list_tasks API returns empty "schedule" field, but schedules ARE defined in XanoScript code. All tasks have schedules properly configured. Updated background-tasks-cache.json with full schedule data (freq_seconds, domain, human-readable schedule labels). Added audit script and npm run audit:tasks command.

## Evidence

- Commits: b53b41cea085fe6805c50ed5366c0f89f9ff3bbe, 6e9a803a474de3f3c00f7a1f8084eca0f4638548
- Tests: npm run audit:tasks
- PRs:
