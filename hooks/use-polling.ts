'use client'

/**
 * usePolling - React Query-based polling hook with exponential backoff
 *
 * Wraps React Query's useQuery with:
 * - Configurable polling interval
 * - Enable/disable toggle
 * - Exponential backoff after consecutive failures (10s -> 20s -> 40s -> ... -> 5min max)
 * - Backoff reset on successful response
 * - Change detection comparing previous and current data
 * - onDataChange callback when data changes
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UsePollingOptions<T> {
  /** Milliseconds between polls (default: 30000) */
  interval?: number
  /** Toggle polling on/off (default: true) */
  enabled?: boolean
  /** Callback fired when data changes between polls */
  onDataChange?: (prev: T | undefined, next: T) => void
  /** Enable exponential backoff on errors (default: true) */
  backoffOnError?: boolean
  /** Maximum backoff interval in ms (default: 300000 = 5 minutes) */
  maxBackoff?: number
}

export interface ChangeIndicator {
  field: string
  previousValue: unknown
  currentValue: unknown
  timestamp: Date
}

export interface UsePollingResult<T> {
  data: T | undefined
  isLoading: boolean
  isFetching: boolean
  isRefreshing: boolean
  error: Error | null
  lastUpdated: Date | null
  changes: ChangeIndicator[]
  changeCount: number
  consecutiveErrors: number
  currentInterval: number
  refresh: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_INTERVAL = 30_000
const DEFAULT_MAX_BACKOFF = 300_000 // 5 minutes
const BACKOFF_THRESHOLD = 3 // Start backoff after this many consecutive failures
const BASE_BACKOFF = 10_000 // 10 seconds base for backoff

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Deep-compare two values and return a list of changed fields.
 * Works for objects (shallow top-level comparison) and primitives.
 */
function detectChanges<T>(prev: T | undefined, next: T): ChangeIndicator[] {
  if (prev === undefined || prev === null) return []
  if (typeof prev !== 'object' || typeof next !== 'object') {
    if (prev !== next) {
      return [
        {
          field: 'value',
          previousValue: prev,
          currentValue: next,
          timestamp: new Date(),
        },
      ]
    }
    return []
  }

  const changes: ChangeIndicator[] = []
  const prevObj = prev as Record<string, unknown>
  const nextObj = next as Record<string, unknown>
  const allKeys = new Set([...Object.keys(prevObj), ...Object.keys(nextObj)])

  for (const key of allKeys) {
    const prevVal = prevObj[key]
    const nextVal = nextObj[key]

    // Use JSON.stringify for deep comparison of nested objects
    if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
      changes.push({
        field: key,
        previousValue: prevVal,
        currentValue: nextVal,
        timestamp: new Date(),
      })
    }
  }

  return changes
}

/**
 * Calculate the backoff interval using exponential backoff.
 * After BACKOFF_THRESHOLD failures: BASE_BACKOFF * 2^(failures - threshold)
 * Capped at maxBackoff.
 */
function calculateBackoffInterval(consecutiveErrors: number, maxBackoff: number): number {
  if (consecutiveErrors < BACKOFF_THRESHOLD) return 0 // No backoff yet
  const exponent = consecutiveErrors - BACKOFF_THRESHOLD
  const backoff = BASE_BACKOFF * Math.pow(2, exponent)
  return Math.min(backoff, maxBackoff)
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePolling<T>(
  queryKey: QueryKey,
  queryFn: (context: { signal: AbortSignal }) => Promise<T>,
  options: UsePollingOptions<T> = {},
  queryOptions?: Omit<
    UseQueryOptions<T, Error>,
    'queryKey' | 'queryFn' | 'refetchInterval' | 'enabled'
  >
): UsePollingResult<T> {
  const {
    interval = DEFAULT_INTERVAL,
    enabled = true,
    onDataChange,
    backoffOnError = true,
    maxBackoff = DEFAULT_MAX_BACKOFF,
  } = options

  // Track consecutive errors for backoff
  const [consecutiveErrors, setConsecutiveErrors] = useState(0)
  // Accumulate all changes since component mounted
  const [changes, setChanges] = useState<ChangeIndicator[]>([])

  // Refs for callbacks and previous data to avoid stale closures
  const prevDataRef = useRef<T | undefined>(undefined)
  const onDataChangeRef = useRef(onDataChange)
  onDataChangeRef.current = onDataChange

  // Calculate current polling interval (with backoff if applicable)
  const backoffInterval = backoffOnError
    ? calculateBackoffInterval(consecutiveErrors, maxBackoff)
    : 0
  const currentInterval = backoffInterval > 0 ? backoffInterval : interval

  const query = useQuery<T, Error>({
    queryKey,
    queryFn,
    enabled,
    refetchInterval: enabled ? currentInterval : false,
    staleTime: Math.floor(interval / 2),
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
  })

  // Track success/failure for backoff and change detection
  useEffect(() => {
    if (query.isError && query.error) {
      setConsecutiveErrors((prev) => prev + 1)
    }
  }, [query.isError, query.error])

  useEffect(() => {
    if (query.data !== undefined && !query.isError) {
      // Reset consecutive errors on success
      if (consecutiveErrors > 0) {
        setConsecutiveErrors(0)
      }

      // Change detection
      const prev = prevDataRef.current
      if (prev !== undefined) {
        const newChanges = detectChanges(prev, query.data)
        if (newChanges.length > 0) {
          setChanges((existing) => [...existing, ...newChanges])
          onDataChangeRef.current?.(prev, query.data)
        }
      }

      prevDataRef.current = query.data
    }
    // We intentionally depend on query.data and query.dataUpdatedAt to catch
    // every new successful fetch, including refetches with the same data shape.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, query.dataUpdatedAt])

  const refresh = useCallback(() => {
    query.refetch()
  }, [query])

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error ?? null,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    changes,
    changeCount: changes.length,
    consecutiveErrors,
    currentInterval,
    refresh,
  }
}
