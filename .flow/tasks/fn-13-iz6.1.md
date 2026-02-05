# fn-13-iz6.1 Create UserContext Provider for selected user state

## Description

## Overview

Create a React Context provider that manages the currently selected user state across all Interactive Proof System components. This is the foundational piece that enables all other comparison and story tab features.

## Implementation

### Architecture (per Codex review)

Split into two contexts to avoid unnecessary re-renders:

1. **`SelectedUserIdContext`** - Tiny, frequent updates (just the user ID + setter)
2. **`UserDataQueryContext`** - Heavy, cacheable (V1/V2 data via React Query)

### File: `contexts/UserContext.tsx`

```typescript
// Lightweight context - only ID selection
interface SelectedUserIdState {
  selectedUserId: number | null
  setSelectedUserId: (id: number | null) => void
}

// Heavy data context - backed by React Query
interface UserDataQueryState {
  v1Data: V1UserData | null
  v2Data: V2UserData | null
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
}
```

### Key Features

1. **Split Contexts**: Tiny ID context + heavy data context to minimize re-renders
2. **React Query Backing**: Use React Query for caching, deduplication, and SWR
3. **Centralized Polling**: Provider owns the polling interval, tabs get immutable snapshots
4. **AbortController**: Cancel in-flight requests on rapid user switching (monotonic request ID)
5. **LocalStorage Persistence**: Remember last selected user across sessions
6. **Error Handling**: Capture and expose errors from both workspaces

### Integration Points

- Used by User Picker component (fn-13-iz6.2)
- Used by Comparison Panel (fn-13-iz6.5)
- Used by all Story tabs (fn-13-iz6.7 through fn-13-iz6.10)
- Uses comparison API endpoint (fn-13-iz6.4)

### Pattern Reference

Follow existing provider pattern at `app/providers.tsx` for React Query integration.

## Overview

Create a React Context provider that manages the currently selected user state across all Interactive Proof System components. This is the foundational piece that enables all other comparison and story tab features.

## Implementation

### File: `contexts/UserContext.tsx`

```typescript
interface UserContextState {
  selectedUserId: number | null
  selectedUser: User | null
  v1Data: V1UserData | null
  v2Data: V2UserData | null
  isLoading: boolean
  error: string | null
  setSelectedUserId: (id: number | null) => void
  refreshData: () => Promise<void>
}
```

### Key Features

1. **State Management**: Track selected user ID and both V1/V2 data sets
2. **Data Fetching**: Auto-fetch V1/V2 data when user selection changes
3. **Loading States**: Provide granular loading states for UI feedback
4. **Error Handling**: Capture and expose errors from both workspaces
5. **Refresh Capability**: Allow manual refresh without changing selection

### Integration Points

- Used by User Picker component (fn-13-iz6.2)
- Used by Comparison Panel (fn-13-iz6.5)
- Used by all Story tabs (fn-13-iz6.7 through fn-13-iz6.10)
- Uses comparison API endpoint (fn-13-iz6.4)

### Pattern Reference

Follow existing provider pattern at `app/providers.tsx` for React Query integration.

## Acceptance

- [ ] Two contexts created: SelectedUserIdContext + UserDataQueryContext
- [ ] useSelectedUserId hook exported (lightweight)
- [ ] useUserData hook exported (heavy data)
- [ ] Selected user ID persisted to localStorage
- [ ] V1 and V2 data fetched via React Query (not raw state)
- [ ] AbortController cancels in-flight requests on user switch
- [ ] Centralized polling in provider (tabs get immutable snapshots)
- [ ] Loading and error states properly tracked
- [ ] TypeScript interfaces for all state shapes
- [ ] Provider wrapped in `app/layout.tsx`
- [ ] Build passes with no type errors

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
