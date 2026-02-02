# fn-4-tkb.1 Phase 1.1: Enhance Data Fetching

## Description

Expand the SnappyClient (MCP integration) to fetch comprehensive metadata needed for documentation hub, migration tracking, and verification tools.

**Current State:** SnappyClient has basic list/get methods for tables, functions, endpoints, API groups.

**Goal:** Add methods for:

1. Function detail fetching (inputs, outputs, XanoScript content, tags, descriptions)
2. Endpoint metadata (method, path, auth requirements, parameters, response structures)
3. Table relationships and foreign keys
4. Migration status metadata (track which tables/endpoints/functions migrated to V2)

## Acceptance

- [x] New methods added to SnappyClient for function details
- [x] New methods for endpoint metadata fetching
- [x] New methods for table relationships
- [x] New methods for migration status tracking
- [x] All methods handle errors gracefully
- [x] TypeScript types updated in lib/types-v2.ts
- [x] No breaking changes to existing SnappyClient API

## Files to Create/Modify

- `lib/snappy-client.ts` - Add new metadata methods
- `lib/types-v2.ts` - Add comprehensive type definitions

## Quick Commands

```bash
npm run build           # Verify TypeScript compilation
```

## Done summary

- Task completed

## Evidence

- Commits:
- Tests:
- PRs:
