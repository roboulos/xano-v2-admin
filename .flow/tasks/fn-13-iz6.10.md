# fn-13-iz6.10 Create Tables/Schema Story tab with mapping visualization

## Description

## Overview

Create a Story tab that visualizes V1→V2 schema mappings, showing how tables and fields transformed during migration.

## Implementation

### File: `components/story-tabs/schema-mapping-story-tab.tsx`

### Mapping Types (from CLAUDE.md)

| Type           | Description                   | Example                                |
| -------------- | ----------------------------- | -------------------------------------- |
| **direct**     | 1:1 mapping, same name        | user → user                            |
| **renamed**    | 1:1 but different name        | roster → team_members                  |
| **split**      | V1 table → multiple V2 tables | transaction → transaction + financials |
| **merged**     | Multiple V1 → single V2       | contributors → contribution            |
| **deprecated** | V1 table has no V2 equivalent | fub_notes → (deleted)                  |
| **new**        | V2 table has no V1 source     | agent_cap_data (new)                   |

### UI Layout

```
┌────────────────────────────────────────────────────────────────┐
│ SCHEMA MAPPING - V1 (251 tables) → V2 (193 tables)            │
├────────────────────────────────────────────────────────────────┤
│ MAPPING SUMMARY                                                │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐ │
│ │ Direct  │ Renamed │ Split   │ Merged  │ Deprec. │ New     │ │
│ │   156   │   23    │   12    │    8    │   52    │   34    │ │
│ └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘ │
├────────────────────────────────────────────────────────────────┤
│ TABLE MAPPINGS                              [Search...] [▼]    │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ V1: user                                                   │ │
│ │ ↓ SPLIT                                                    │ │
│ │ V2: user, user_credentials, user_settings, user_roles      │ │
│ │                                                            │ │
│ │ Field Mapping:                                             │ │
│ │ V1 user.password → V2 user_credentials.password_hash       │ │
│ │ V1 user.settings → V2 user_settings.*                      │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Features

1. **Summary Cards**: Counts by mapping type
2. **Mapping List**: Searchable/filterable list of all mappings
3. **Field Details**: Expand to see field-level mappings
4. **Sankey Diagram**: Visual flow from V1 tables to V2 tables
5. **Search**: Find specific table by name

### Data Sources

- Use `lib/table-mappings.ts` for mapping definitions
- Use `lib/v1-data.ts` for V1 table list (251 tables)
- Use `lib/v2-data.ts` for V2 table list (193 tables)

## Acceptance

- [ ] SchemaMappingStoryTab component created at `components/story-tabs/schema-mapping-story-tab.tsx`
- [ ] Summary cards show counts by mapping type
- [ ] Mapping list is searchable
- [ ] Filter by mapping type works
- [ ] Expand mapping shows field-level details
- [ ] V1→V2 table relationship visualized
- [ ] Split mappings show all target tables
- [ ] Merged mappings show all source tables
- [ ] Deprecated tables marked clearly
- [ ] New V2-only tables shown
- [ ] Uses data from lib/table-mappings.ts
- [ ] Responsive layout
- [ ] Build passes with no type errors

## Done summary

Created SchemaMappingStoryTab component that visualizes all 267 V1-to-V2 table mappings with summary cards by type (direct/renamed/split/merged/deprecated/new), searchable and filterable mapping list grouped by 16 categories, expandable detail rows with notes and split mapping diagrams, and a mapping type reference section. Uses existing TABLE_MAPPINGS data and ShadCN components with semantic CSS tokens.

## Evidence

- Commits: d677bbf45e68714c6766c48682e5b8855b6fbdd9
- Tests: npx tsc --noEmit, pnpm lint, pnpm build
- PRs:
