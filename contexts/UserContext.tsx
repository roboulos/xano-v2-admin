'use client'

/**
 * UserContext - Split context architecture for selected user state
 *
 * Two contexts to minimize re-renders:
 * 1. SelectedUserIdContext - tiny, frequent updates (user ID + setter)
 * 2. UserDataQueryContext - heavy, cacheable (V1/V2 data via React Query)
 *
 * Features:
 * - LocalStorage persistence for selected user
 * - AbortController to cancel in-flight requests on rapid user switching
 * - Centralized polling in provider (tabs get immutable snapshots)
 * - React Query for caching, deduplication, and stale-while-revalidate
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** V1 workspace user data snapshot */
export interface V1UserData {
  user: Record<string, unknown> | null
  agent: Record<string, unknown> | null
  transactions: { count: number; records?: Record<string, unknown>[] }
  listings: { count: number; records?: Record<string, unknown>[] }
  network: { count: number; records?: Record<string, unknown>[] }
  contributions: { count: number; records?: Record<string, unknown>[] }
}

/** V2 workspace user data snapshot */
export interface V2UserData {
  user: Record<string, unknown> | null
  agent: Record<string, unknown> | null
  transactions: { count: number; records?: Record<string, unknown>[] }
  listings: { count: number; records?: Record<string, unknown>[] }
  network: { count: number; records?: Record<string, unknown>[] }
  contributions: { count: number; records?: Record<string, unknown>[] }
}

/** Combined comparison result from the API */
export interface UserComparisonData {
  v1: V1UserData
  v2: V2UserData
  totals: {
    entity: string
    v1_count: number
    v2_count: number
    delta: number
    status: 'synced' | 'partial' | 'missing'
  }[]
  timestamp: string
}

// ---------------------------------------------------------------------------
// Context #1: Selected User ID (lightweight)
// ---------------------------------------------------------------------------

interface SelectedUserIdState {
  selectedUserId: number | null
  setSelectedUserId: (id: number | null) => void
}

const SelectedUserIdContext = createContext<SelectedUserIdState | null>(null)

// ---------------------------------------------------------------------------
// Context #2: User Data Query (heavy, cacheable)
// ---------------------------------------------------------------------------

interface UserDataQueryState {
  v1Data: V1UserData | null
  v2Data: V2UserData | null
  totals: UserComparisonData['totals'] | null
  isLoading: boolean
  isFetching: boolean
  error: string | null
  refreshData: () => Promise<void>
  lastUpdated: Date | null
}

const UserDataQueryContext = createContext<UserDataQueryState | null>(null)

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOCAL_STORAGE_KEY = 'xano-v2-admin-selected-user-id'
const POLLING_INTERVAL_MS = 10_000 // 10 seconds, matches existing SWR pattern
const COMPARISON_QUERY_KEY = 'user-comparison'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readPersistedUserId(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored === null) return null
    const parsed = parseInt(stored, 10)
    return Number.isNaN(parsed) ? null : parsed
  } catch {
    return null
  }
}

function persistUserId(id: number | null): void {
  if (typeof window === 'undefined') return
  try {
    if (id === null) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, String(id))
    }
  } catch {
    // Silently ignore storage errors (private browsing, quota exceeded, etc.)
  }
}

/**
 * Transform a raw API section value into the expected { count, records? } shape.
 * The API returns raw arrays for array sections; the context expects { count: number }.
 */
function normalizeArraySection(raw: unknown): {
  count: number
  records?: Record<string, unknown>[]
} {
  if (Array.isArray(raw)) {
    return { count: raw.length, records: raw as Record<string, unknown>[] }
  }
  if (raw && typeof raw === 'object' && 'count' in raw) {
    return raw as { count: number; records?: Record<string, unknown>[] }
  }
  return { count: 0 }
}

/**
 * Build totals array from the comparison response.
 */
function buildTotals(
  v1: V1UserData,
  v2: V2UserData,
  comparison: Record<string, unknown>
): UserComparisonData['totals'] {
  const entities = [
    'user',
    'agent',
    'transactions',
    'listings',
    'network',
    'contributions',
  ] as const
  return entities.map((entity) => {
    let v1Count: number
    let v2Count: number

    if (entity === 'user' || entity === 'agent') {
      v1Count = v1[entity] ? 1 : 0
      v2Count = v2[entity] ? 1 : 0
    } else {
      v1Count = v1[entity]?.count ?? 0
      v2Count = v2[entity]?.count ?? 0
    }

    // Use comparison data if available (may have real V2 counts from Xano endpoint)
    const comp = comparison[entity] as Record<string, unknown> | undefined
    if (comp && 'v1Count' in comp && 'v2Count' in comp) {
      v1Count = (comp.v1Count as number) ?? v1Count
      v2Count = (comp.v2Count as number) ?? v2Count
    }

    const delta = v2Count - v1Count
    const status: 'synced' | 'partial' | 'missing' =
      v1Count === v2Count ? 'synced' : v2Count > 0 ? 'partial' : 'missing'

    return { entity, v1_count: v1Count, v2_count: v2Count, delta, status }
  })
}

/**
 * Fetch user comparison data from the API with AbortController support.
 * Transforms the raw API response to match the expected UserComparisonData shape.
 */
async function fetchUserComparison(
  userId: number,
  signal?: AbortSignal
): Promise<UserComparisonData> {
  const res = await fetch(`/api/users/${userId}/comparison`, { signal })
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`Failed to fetch comparison data: ${res.status} - ${text}`)
  }
  const raw = await res.json()

  // Transform v1/v2 sections to expected shape
  const v1: V1UserData = {
    user: raw.v1?.user ?? null,
    agent: raw.v1?.agent ?? null,
    transactions: normalizeArraySection(raw.v1?.transactions),
    listings: normalizeArraySection(raw.v1?.listings),
    network: normalizeArraySection(raw.v1?.network),
    contributions: normalizeArraySection(raw.v1?.contributions),
  }

  const v2: V2UserData = {
    user: raw.v2?.user ?? null,
    agent: raw.v2?.agent ?? null,
    transactions: normalizeArraySection(raw.v2?.transactions),
    listings: normalizeArraySection(raw.v2?.listings),
    network: normalizeArraySection(raw.v2?.network),
    contributions: normalizeArraySection(raw.v2?.contributions),
  }

  const totals = buildTotals(v1, v2, raw.comparison ?? {})

  return {
    v1,
    v2,
    totals,
    timestamp: raw.timestamp ?? new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Provider Component
// ---------------------------------------------------------------------------

interface UserProviderProps {
  children: React.ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  // ---- Selected User ID state (Context #1) ----
  // Lazy initializer reads from localStorage on first render (client-side only).
  // Since this is a 'use client' component, window is always available at render time.
  const [selectedUserId, setSelectedUserIdRaw] = useState<number | null>(readPersistedUserId)

  // Monotonic request counter to handle race conditions
  const requestIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const queryClient = useQueryClient()

  // Wrapped setter that persists to localStorage and cancels in-flight requests
  const setSelectedUserId = useCallback(
    (id: number | null) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }

      // Increment monotonic request ID to invalidate stale responses
      requestIdRef.current += 1

      // Persist and update state
      persistUserId(id)
      setSelectedUserIdRaw(id)

      // Invalidate any cached query for the previous user
      queryClient.cancelQueries({ queryKey: [COMPARISON_QUERY_KEY] })
    },
    [queryClient]
  )

  const selectedUserIdState = useMemo<SelectedUserIdState>(
    () => ({ selectedUserId, setSelectedUserId }),
    [selectedUserId, setSelectedUserId]
  )

  // ---- User Data Query state (Context #2) ----

  // Only enable the query when a user is selected
  const queryEnabled = selectedUserId !== null

  const {
    data: comparisonData,
    error: queryError,
    isLoading,
    isFetching,
    dataUpdatedAt,
  } = useQuery<UserComparisonData>({
    queryKey: [COMPARISON_QUERY_KEY, selectedUserId],
    queryFn: ({ signal }) => {
      // Track this request's ID for race condition detection
      const currentRequestId = ++requestIdRef.current

      // Create a new AbortController that merges React Query's signal
      const controller = new AbortController()
      abortControllerRef.current = controller

      // If React Query's signal fires, also abort our controller
      signal?.addEventListener('abort', () => controller.abort())

      return fetchUserComparison(selectedUserId!, controller.signal).then((result) => {
        // Discard if a newer request has been initiated
        if (requestIdRef.current !== currentRequestId) {
          throw new Error('Stale request discarded')
        }
        return result
      })
    },
    enabled: queryEnabled,
    refetchInterval: POLLING_INTERVAL_MS,
    staleTime: 5_000, // Consider data stale after 5 seconds
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const refreshData = useCallback(async () => {
    if (selectedUserId !== null) {
      await queryClient.invalidateQueries({
        queryKey: [COMPARISON_QUERY_KEY, selectedUserId],
      })
    }
  }, [queryClient, selectedUserId])

  const userDataState = useMemo<UserDataQueryState>(() => {
    const errorMessage = queryError
      ? queryError instanceof Error
        ? queryError.message
        : 'An unknown error occurred'
      : null

    return {
      v1Data: comparisonData?.v1 ?? null,
      v2Data: comparisonData?.v2 ?? null,
      totals: comparisonData?.totals ?? null,
      isLoading: queryEnabled && isLoading,
      isFetching,
      error: errorMessage,
      refreshData,
      lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    }
  }, [comparisonData, queryError, queryEnabled, isLoading, isFetching, refreshData, dataUpdatedAt])

  return (
    <SelectedUserIdContext.Provider value={selectedUserIdState}>
      <UserDataQueryContext.Provider value={userDataState}>
        {children}
      </UserDataQueryContext.Provider>
    </SelectedUserIdContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Lightweight hook - only re-renders when the selected user ID changes.
 * Use this in components that only need to read/write the selection (e.g., User Picker).
 */
export function useSelectedUserId(): SelectedUserIdState {
  const ctx = useContext(SelectedUserIdContext)
  if (ctx === null) {
    throw new Error('useSelectedUserId must be used within a <UserProvider>')
  }
  return ctx
}

/**
 * Heavy data hook - re-renders when V1/V2 data changes.
 * Use this in components that display comparison data (e.g., Story tabs, Comparison Panel).
 */
export function useUserData(): UserDataQueryState {
  const ctx = useContext(UserDataQueryContext)
  if (ctx === null) {
    throw new Error('useUserData must be used within a <UserProvider>')
  }
  return ctx
}
