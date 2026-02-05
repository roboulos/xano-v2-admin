# fn-13-iz6.4 Create /api/users/[id]/comparison endpoint

## Description

## Overview

Create a comprehensive API endpoint that fetches all V1 and V2 data for a specific user, enabling side-by-side comparison.

## Implementation

### File: `app/api/users/[id]/comparison/route.ts`

### Endpoint Spec

```
GET /api/users/:id/comparison
Query params:
  - sections?: string (comma-separated: "user,agent,transactions,listings,network,contributions")

Response:
{
  user_id: number
  v1: {
    user: V1User
    agent: V1Agent | null
    transactions: V1Transaction[]
    listings: V1Listing[]
    network: V1NetworkMember[]
    contributions: V1Contribution[]
    team: V1Team | null
  }
  v2: {
    user: V2User
    agent: V2Agent | null
    transactions: V2Transaction[]
    listings: V2Listing[]
    network: V2NetworkMember[]
    contributions: V2Contribution[]
    team: V2Team | null
  }
  comparison: {
    user: { match: boolean, diffs: FieldDiff[] }
    agent: { match: boolean, diffs: FieldDiff[] }
    transactions: { v1Count: number, v2Count: number, match: boolean }
    listings: { v1Count: number, v2Count: number, match: boolean }
    network: { v1Count: number, v2Count: number, match: boolean }
    contributions: { v1Count: number, v2Count: number, match: boolean }
  }
  timestamp: string
}
```

### Codex Review Fixes Applied

1. **Sections filter** - Each story tab requests ONLY what it needs (not full graph)
2. **Pagination** - Array fields paginated with `limit`/`offset` for 50k+ record users
3. **Compression** - Response compressed via Next.js built-in gzip
4. **Auth guard** - Admin-only endpoint (check session/role)

### Data Fetching Strategy

1. Parallel fetch from both workspaces via Promise.allSettled
2. Include partial results if one workspace fails
3. Compute field-level diffs for user/agent records
4. Count-based comparison for arrays (paginated detail on expand)

### Field Mapping

Reference `lib/table-mappings.ts` for V1→V2 field name conversions when comparing.

## Overview

Create a comprehensive API endpoint that fetches all V1 and V2 data for a specific user, enabling side-by-side comparison.

## Implementation

### File: `app/api/users/[id]/comparison/route.ts`

### Endpoint Spec

```
GET /api/users/:id/comparison
Query params:
  - sections?: string[] (filter to specific sections)

Response:
{
  user_id: number
  v1: {
    user: V1User
    agent: V1Agent | null
    transactions: V1Transaction[]
    listings: V1Listing[]
    network: V1NetworkMember[]
    contributions: V1Contribution[]
    team: V1Team | null
  }
  v2: {
    user: V2User
    agent: V2Agent | null
    transactions: V2Transaction[]
    listings: V2Listing[]
    network: V2NetworkMember[]
    contributions: V2Contribution[]
    team: V2Team | null
  }
  comparison: {
    user: { match: boolean, diffs: FieldDiff[] }
    agent: { match: boolean, diffs: FieldDiff[] }
    transactions: { v1Count: number, v2Count: number, match: boolean }
    listings: { v1Count: number, v2Count: number, match: boolean }
    network: { v1Count: number, v2Count: number, match: boolean }
    contributions: { v1Count: number, v2Count: number, match: boolean }
  }
  timestamp: string
}
```

### Data Fetching Strategy

1. Parallel fetch from both workspaces
2. Use Promise.allSettled for resilience
3. Include partial results if one fails
4. Compute field-level diffs for user/agent records
5. Count-based comparison for arrays

### Field Mapping

Reference `lib/table-mappings.ts` for V1→V2 field name conversions when comparing.

## Acceptance

- [ ] API route created at `app/api/users/[id]/comparison/route.ts`
- [ ] Sections filter reduces payload per request
- [ ] Pagination for array fields (transactions, listings, network, contributions)
- [ ] Fetches user record from both V1 and V2
- [ ] Fetches agent record if user is an agent
- [ ] Computes field-level diffs using table mappings
- [ ] Returns count comparison for array fields
- [ ] Handles missing data gracefully (partial response)
- [ ] Response compressed (gzip)
- [ ] TypeScript types for all response shapes
- [ ] Tested with verified user 60 (David Keener)

## Done summary

Created GET /api/users/[id]/comparison endpoint that fetches V1 and V2 data in parallel via Promise.allSettled, computes field-level diffs for scalar entities (user, agent, team) and count-based comparisons for array entities (transactions, listings, network, contributions). Supports sections filter and pagination. Also fixed a self-referencing variable bug in lib/diff-utils.ts.

## Evidence

- Commits: 5813dafac778cc6f753556d11f587c9b05702e9e
- Tests: pnpm build
- PRs:
