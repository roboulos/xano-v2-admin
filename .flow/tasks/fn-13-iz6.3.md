# fn-13-iz6.3 Create /api/users/list endpoint

## Description

## Overview

Create a Next.js API route that returns a list of users from both V1 and V2 workspaces for the User Picker component.

## Implementation

### File: `app/api/users/list/route.ts`

### Endpoint Spec

```
GET /api/users/list
Query params:
  - search?: string (filter by name/email)
  - limit?: number (default 50)
  - offset?: number (default 0)

Response:
{
  users: Array<{
    id: number
    name: string
    email: string
    is_agent: boolean
    agent_id: number | null
    v1_exists: boolean
    v2_exists: boolean
  }>
  total: number
  hasMore: boolean
}
```

### Data Sources

- V1: `xmpx-swi5-tlvy.n7c.xano.io` (Workspace 1) - user table
- V2: `x2nu-xcjc-vhax.agentdashboards.xano.io` (Workspace 5) - user table

### Logic

1. Query V2 users table (primary source)
2. Cross-reference with V1 to flag existence
3. Return merged list with existence flags
4. Support text search across name and email fields

### Error Handling

- Return 500 with error message if either workspace fails
- Include partial results if one workspace succeeds

## Acceptance

- [ ] API route created at `app/api/users/list/route.ts`
- [ ] Returns users from V2 workspace
- [ ] Includes v1_exists and v2_exists flags
- [ ] Search filtering works for name and email
- [ ] Pagination with limit/offset works
- [ ] Returns total count and hasMore flag
- [ ] Error handling returns proper status codes
- [ ] TypeScript types for request/response
- [ ] Tested with curl and returns valid JSON

## Done summary

Created GET /api/users/list endpoint that queries V2 workspace user table (primary source) and cross-references with V1 workspace for existence flags. Supports search, limit/offset pagination, and returns normalized user data with v1_exists/v2_exists flags, total count, and hasMore indicator.

## Evidence

- Commits: 6ab82d088930072b48c23808c9c313bace5ea06c
- Tests: pnpm build
- PRs:
