# fn-13-iz6.6 Implement diff highlighting system with status tokens

## Description

## Overview

Implement a reusable diff highlighting system that visually indicates field-level differences between V1 and V2 data. This is a foundational utility that the Comparison Panel and all Story tabs depend on.

**IMPORTANT (Codex review):** Diff computation must be pure functions in `lib/diff-utils.ts` with ZERO React imports. Keep rendering separate so the core can be unit-tested without jsdom.

## Implementation

### Files

- `lib/diff-utils.ts` - Pure diff computation logic (NO React imports)
- `components/diff-highlight.tsx` - Visual rendering component (React)

### Diff Types

```typescript
type DiffStatus = 'match' | 'modified' | 'added' | 'removed' | 'type_mismatch'

interface FieldDiff {
  field: string
  v1Value: unknown
  v2Value: unknown
  status: DiffStatus
  v1Path?: string // V1 field path if renamed
  v2Path?: string // V2 field path if renamed
}
```

### Visual Styles

```css
/* Use semantic tokens */
.diff-match {
  color: var(--status-success);
}
.diff-modified {
  color: var(--status-warning);
  background: var(--status-warning-muted);
}
.diff-added {
  color: var(--status-info);
  background: var(--status-info-muted);
}
.diff-removed {
  color: var(--status-error);
  background: var(--status-error-muted);
}
```

### Features

1. **Field Comparison**: Deep comparison of objects with path tracking
2. **Type Coercion**: Smart comparison (e.g., "60" == 60)
3. **Date Handling**: ISO date string comparison
4. **Array Diff**: Show added/removed array items
5. **Renamed Fields**: Use table mappings to match renamed fields
6. **Accessibility**: Color-blind safe palettes (not color-only indicators)

### Integration

- Used by Comparison Panel (fn-13-iz6.5) - depends on this task
- Used by Story tabs for data displays
- References `lib/table-mappings.ts` for field name conversions

## Overview

Implement a reusable diff highlighting system that visually indicates field-level differences between V1 and V2 data.

## Implementation

### Files

- `lib/diff-utils.ts` - Diff computation logic
- `components/diff-highlight.tsx` - Visual rendering component

### Diff Types

```typescript
type DiffStatus = 'match' | 'modified' | 'added' | 'removed' | 'type_mismatch'

interface FieldDiff {
  field: string
  v1Value: unknown
  v2Value: unknown
  status: DiffStatus
  v1Path?: string // V1 field path if renamed
  v2Path?: string // V2 field path if renamed
}
```

### Visual Styles

```css
/* Use semantic tokens */
.diff-match {
  color: var(--status-success);
}
.diff-modified {
  color: var(--status-warning);
  background: var(--status-warning-muted);
}
.diff-added {
  color: var(--status-info);
  background: var(--status-info-muted);
}
.diff-removed {
  color: var(--status-error);
  background: var(--status-error-muted);
}
```

### Features

1. **Field Comparison**: Deep comparison of objects with path tracking
2. **Type Coercion**: Smart comparison (e.g., "60" == 60)
3. **Date Handling**: ISO date string comparison
4. **Array Diff**: Show added/removed array items
5. **Renamed Fields**: Use table mappings to match renamed fields

### Integration

- Used by Comparison Panel (fn-13-iz6.5)
- Used by Story tabs for data displays
- References `lib/table-mappings.ts` for field name conversions

## Acceptance

- [ ] Diff utilities created at `lib/diff-utils.ts` with ZERO React imports
- [ ] DiffHighlight component created at `components/diff-highlight.tsx`
- [ ] compareFields() function handles deep object comparison
- [ ] Handles type coercion (string "60" matches number 60)
- [ ] Date comparison works with ISO strings
- [ ] Array diff shows added/removed items
- [ ] Field name mapping applied from table-mappings.ts
- [ ] Visual styles use semantic CSS tokens
- [ ] Match/modified/added/removed states visually distinct
- [ ] Not color-only: includes icons/text for accessibility
- [ ] Inline and block display modes supported
- [ ] Tooltip shows original values on hover
- [ ] Unit tests for diff-utils.ts (no jsdom needed)
- [ ] Build passes with no type errors

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
