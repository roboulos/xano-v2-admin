# Epic: Professional Delivery Cleanup - Agent Dashboards Ecosystem

## Summary

Clean up and professionally deliver the entire Agent Dashboards ecosystem across three repositories. Remove cruft, verify all functionality, standardize documentation, run comprehensive frontend tests, and ensure cohesive professional delivery.

## Repositories

1. **xano-v2-admin** - V1→V2 Migration Admin Interface
2. **v0-demo-sync-admin-interface** - Demo Data Sync & Storytelling
3. **dashboards2.0** - Main Frontend BI Platform

## Problem Statement

The ecosystem works but needs professional polish:

- dashboards2.0 has 4 old version directories + 6 backup directories (50MB+ artifacts)
- Scattered documentation across 53+ markdown files
- No comprehensive E2E test suite covering all frontend functionality
- Test coverage not explicitly configured/tracked
- Screenshot/artifact files mixed with source code
- Some XanoScript test files at root level in xano-v2-admin

## Success Criteria

- [ ] All three repositories build without errors (`pnpm build`)
- [ ] All three repositories pass linting (`pnpm lint`)
- [ ] Frontend E2E tests cover critical user flows
- [ ] Documentation consolidated (single source of truth per topic)
- [ ] Cruft removed from all repositories
- [ ] Test coverage reports generated for each repo
- [ ] All demo accounts verified working
- [ ] V1/V2 compatibility verified end-to-end

## Non-Goals

- No new features
- No architectural changes
- No Xano backend changes (except verification)

---

## Phase 1: Repository Cleanup (Non-Breaking)

### Task 1.1: Clean xano-v2-admin Cruft

**Files to remove:**

- `fix-job-checkpoint*.xanoscript` (7 files)
- `optimized-roster*.xanoscript`
- `test-roster-endpoint.sh`
- Add `EXECUTION_TRACKER.json` to `.gitignore`

**Verification:** `pnpm build && pnpm lint`

### Task 1.2: Clean v0-demo-sync-admin-interface Artifacts

**Actions:**

- Create `docs/screenshots/` directory
- Move all root-level `.png` files to `docs/screenshots/`
- Update any references in markdown files

**Verification:** `pnpm build && pnpm lint`

### Task 1.3: Clean dashboards2.0 Major Cruft

**Directories to archive (move to `_archive/` with .gitignore):**

- `v1/`, `v2/`, `v3-consolidation-old/`, `v0-agent-dashboards-2-0/`
- `docs.backup/`, `examples.backup/`, `backups/`
- `debug-logs/`, `rebuild/`

**Files to remove or archive:**

- `*.pdf` (7 validation reports, 2MB+ each)
- `AgentDashboards-Demo-Video.mp4` (32MB)
- `webhook_data.csv` (1.9MB)
- `slack_messages.json` (7.8MB)

**Add to .gitignore:**

- `.cursor/`
- `.cursorrules*`
- `.env.local`
- `_archive/`

**Verification:** `pnpm build && pnpm lint`

---

## Phase 2: Documentation Consolidation

### Task 2.1: Create dashboards2.0 Comprehensive CLAUDE.md

Current CLAUDE.md is only 402 lines. Create comprehensive version that:

- Summarizes \_brain/ folder structure with clear navigation
- Lists all 22 dashboard pages with their purpose
- Documents V1/V2 compatibility layer
- Lists demo accounts with credentials
- Provides quick-start development commands
- References PROJECT_HISTORY from xano-v2-admin

### Task 2.2: Create Cross-Project Navigation Document

Add to each repository's CLAUDE.md:

```
## Related Projects
- xano-v2-admin: Migration tracking & validation
- v0-demo-sync-admin-interface: Demo data generation
- dashboards2.0: Production frontend
```

### Task 2.3: Archive Obsolete Documentation

**dashboards2.0 files to archive:**

- `*_COMPLETE.md` files (work already done)
- Phase-specific docs that are outdated
- Duplicate information (consolidate)

Keep `_brain/` folder intact (it's well-organized).

---

## Phase 3: Test Suite Verification & Enhancement

### Task 3.1: Configure Test Coverage for All Repos

**xano-v2-admin:**

- Update vitest.config.ts with coverage thresholds
- Generate coverage report

**v0-demo-sync-admin-interface:**

- Update vitest.config.ts with coverage thresholds
- Generate coverage report

**dashboards2.0:**

- Update vitest.config.ts with coverage thresholds
- Generate coverage report
- Run Playwright E2E tests

### Task 3.2: Create Critical Path E2E Tests (dashboards2.0)

Test the following user flows:

1. Login flow (demo accounts)
2. Dashboard navigation (all 22 pages load)
3. Transaction Overview displays data (verify V1/V2 fix)
4. KPI cards show correct values
5. Demo mode toggle works
6. Chart rendering (at least 1 chart type per page)

### Task 3.3: Verify Demo Accounts

Test all three demo accounts in v0-demo-sync-admin-interface:

- Michael Johnson (ID: 7) - Team Owner
- Sarah Williams (ID: 256) - Team Member
- James Anderson (ID: 133) - Network Builder

Verify:

- Login works
- Correct data displayed
- Demo mode header visible
- Data isolation working (demo_data vs live)

### Task 3.4: Run Full Validation Suite (xano-v2-admin)

Execute all 4 validators:

```bash
npm run validate:tables      # 193 tables
npm run validate:functions   # 270 functions
npm run validate:endpoints   # 801 endpoints
npm run validate:references  # 156 foreign keys
```

Target: Tables 100%, Functions 95%+, Endpoints 96%+, References 100%

---

## Phase 4: End-to-End Verification

### Task 4.1: Full Build Verification

All three repositories must:

- `pnpm install` succeeds
- `pnpm build` succeeds with zero errors
- `pnpm lint` passes
- TypeScript strict mode passes

### Task 4.2: V1/V2 Compatibility Test

Using dashboards2.0:

1. Login as David Keener (User 60) - verified test user
2. Navigate to Transaction Overview
3. Verify KPIs display correctly (Closed Units: ~537, Volume: ~$197M, GCI: ~$5.3M)
4. Test timeframe filters (MTD, QTD, YTD)
5. Test transaction type filters

### Task 4.3: Cross-Repository Integration Test

1. Start xano-v2-admin dev server
2. Start dashboards2.0 dev server
3. Verify both can connect to Xano workspaces
4. Run xano-v2-admin validation while dashboards2.0 is active
5. Verify no conflicts or race conditions

### Task 4.4: Final Documentation Review

- All README files have working setup instructions
- All CLAUDE.md files are accurate
- No references to deleted/archived files
- Demo credentials documented and working

---

## Phase 5: Professional Delivery Package

### Task 5.1: Create Delivery Manifest

Document what's being delivered:

- Repository list with descriptions
- Current status (all green/passing)
- Known limitations
- Maintenance requirements

### Task 5.2: Final Commit & Tag

- Commit all cleanup changes
- Create release tags (e.g., `v2.0.0-delivery`)
- Update any CI/CD badges

### Task 5.3: Delivery Verification Checklist

Final sign-off:

- [ ] All repos build successfully
- [ ] All tests pass
- [ ] Documentation is accurate
- [ ] Demo accounts verified
- [ ] No secrets committed
- [ ] .gitignore properly configured
- [ ] Cross-project navigation documented

---

## Risk Mitigation

### Before Any Deletions

1. Create backup branch: `git checkout -b pre-cleanup-backup`
2. Push backup: `git push origin pre-cleanup-backup`
3. Then proceed with cleanup on main branch

### Recovery Path

If anything breaks after cleanup:

1. Check git diff against backup branch
2. Restore specific files if needed
3. All old versions preserved in git history

---

## Dependencies

```
Phase 1 (Cleanup) → Phase 2 (Docs) → Phase 3 (Tests) → Phase 4 (Verify) → Phase 5 (Deliver)
```

Each phase depends on the previous completing successfully.

## Estimated Scope

- **Tasks:** 16 total
- **Repositories:** 3
- **Critical paths:** Build, test, document, verify
