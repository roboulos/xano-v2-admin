# fn-13-iz6.12 Update documentation (CLAUDE.md, V2_TOOLS_REFERENCE.md)

## Description

## Overview

Update project documentation to reflect the new Interactive Proof System features.

## Files to Update

### CLAUDE.md

Add section documenting:

1. **Interactive Proof System**: Overview of the new comparison capabilities
2. **User Selection**: How to use the User Picker
3. **Story Tabs**: Description of each story tab and what it reveals
4. **API Endpoints**: New endpoints added (users/list, users/[id]/comparison)

### V2_TOOLS_REFERENCE.md (if exists, or create)

Document:

1. **User Context Provider**: How to use in components
2. **Diff Utilities**: How to use diff-utils.ts
3. **Polling Hook**: How to use for real-time updates
4. **Component Reference**: All new components and their props

### README.md

Update features list and screenshots showing the new UI.

## Documentation Standards

- Include code examples for each feature
- Reference file paths with line numbers
- Show curl examples for new API endpoints
- Include TypeScript interface definitions

## Acceptance

- [ ] CLAUDE.md updated with Interactive Proof System section
- [ ] User Picker documented with usage examples
- [ ] Story tabs documented with screenshots/diagrams
- [ ] New API endpoints documented with curl examples
- [ ] UserContext usage documented
- [ ] Diff utilities documented with code examples
- [ ] Polling hook documented
- [ ] Component props documented
- [ ] README.md updated with new features
- [ ] All file paths accurate and verified

## Done summary

Updated CLAUDE.md with comprehensive Interactive Proof System documentation covering User Picker, UserContext split architecture, 4 Story Tabs, Comparison Panel, diff system, real-time polling, and 4 new API endpoints with curl examples and parameter tables.

## Evidence

- Commits: 60396570794573e00ec9bc9cd4ded595c4e1b939
- Tests: npx tsc --noEmit
- PRs:
