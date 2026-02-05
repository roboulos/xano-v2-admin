# fn-13-iz6.5 Build Comparison Panel with V1/V2 side-by-side view

## Description

## Overview

Build the main UI component that displays V1 and V2 data side-by-side with visual comparison indicators.

## Implementation

### File: `components/comparison-panel.tsx`

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  User: David Keener (#60)                    🔄 Refresh         │
├───────────────────────────────┬─────────────────────────────────┤
│           V1 DATA             │            V2 DATA              │
│ (xmpx-swi5-tlvy.n7c.xano.io) │ (x2nu-xcjc-vhax.xano.io)        │
├───────────────────────────────┼─────────────────────────────────┤
│ user                          │ user                            │
│ ├── id: 60                    │ ├── id: 60            ✓ MATCH   │
│ ├── email: david@...          │ ├── email: david@...  ✓ MATCH   │
│ └── created_at: 2024-01-15    │ └── created_at: ...   ⚠ DIFF    │
├───────────────────────────────┼─────────────────────────────────┤
│ TRANSACTIONS: 156             │ TRANSACTIONS: 156     ✓ MATCH   │
├───────────────────────────────┼─────────────────────────────────┤
│ LISTINGS: 23                  │ LISTINGS: 23          ✓ MATCH   │
└───────────────────────────────┴─────────────────────────────────┘
```

### Features

1. **Split View**: V1 left, V2 right with synchronized scrolling
2. **Section Toggles**: Expand/collapse each data section
3. **Status Indicators**: Match (green), Diff (amber), Missing (red)
4. **Record Drilldown**: Click to expand individual records
5. **Copy Values**: Click to copy any value to clipboard

### Styling

Use semantic CSS tokens from `globals.css`:

- `--status-success` for matches
- `--status-warning` for diffs
- `--status-error` for missing data
- `--status-info` for informational

### Integration

- Consumes UserContext for selected user data
- Uses diff highlighting system (fn-13-iz6.6)

## Acceptance

- [ ] ComparisonPanel component created at `components/comparison-panel.tsx`
- [ ] Side-by-side layout with V1 left, V2 right
- [ ] Synchronized scrolling between panels
- [ ] Section headers show record counts
- [ ] Expand/collapse toggles for each section
- [ ] Status indicators use semantic CSS tokens
- [ ] Match/diff/missing states visually distinct
- [ ] Click to copy values works
- [ ] Loading skeleton while data fetches
- [ ] Empty state when no user selected
- [ ] Refresh button triggers data reload
- [ ] Responsive layout (stacks on mobile)
- [ ] Build passes with no type errors

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
