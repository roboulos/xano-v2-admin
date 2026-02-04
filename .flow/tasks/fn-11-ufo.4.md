# fn-11-ufo.4 Define spacing tokens in globals.css

## Description

Define consistent spacing tokens in globals.css and document usage patterns.

**Size:** S
**Files:**

- `app/globals.css` (add tokens)

## Approach

Add CSS custom properties under existing `:root` section (line 3-29):

```css
/* Spacing tokens */
--spacing-section: 1.5rem; /* space-y-6 - between major sections */
--spacing-content: 1rem; /* space-y-4 - between content items */
--spacing-card: 1.5rem; /* p-6 - standard card padding */
--spacing-card-compact: 1rem; /* p-4 - compact card padding */
--spacing-inline: 0.5rem; /* gap-2 - inline element gaps */
```

Document which Tailwind classes map to which use cases.

## Key context

- Current inconsistency: tabs use mix of space-y-4, space-y-6, space-y-8
- Current inconsistency: cards use mix of p-3, p-4, p-6
- Don't change existing tabs yet - just define the tokens

## Acceptance

- [ ] Spacing tokens defined in globals.css :root
- [ ] Tokens documented with use case comments
- [ ] Dark mode variants if needed
- [ ] `pnpm build` passes

## Done summary

Added 5 spacing tokens to globals.css :root section with comprehensive documentation. Tokens map to common Tailwind classes (space-y-6, space-y-4, p-6, p-4, gap-2) and cover section spacing, content spacing, card padding, compact card padding, and inline element gaps.

## Evidence

- Commits: cd092b107363f276bdab8091c474c9188f167437
- Tests: pnpm build
- PRs:
