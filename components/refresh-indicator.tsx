'use client'

/**
 * RefreshIndicator - Visual component showing polling/refresh status
 *
 * Features:
 * - Pulsing indicator when refreshing (isFetching)
 * - Last updated timestamp displayed
 * - Change count badge showing number of changes since load
 * - Auto-refresh toggle (enable/disable polling)
 * - Manual refresh button
 * - Uses semantic CSS tokens
 *
 * Designed to integrate with the existing UserContext's polling data
 * (isFetching, lastUpdated, refreshData) or the usePolling hook.
 */

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RefreshIndicatorProps {
  /** Whether a fetch is currently in progress */
  isFetching: boolean
  /** Timestamp of last successful data update */
  lastUpdated: Date | null
  /** Number of detected changes since initial load */
  changeCount?: number
  /** Whether auto-refresh is currently enabled */
  autoRefreshEnabled?: boolean
  /** Callback to toggle auto-refresh on/off */
  onAutoRefreshToggle?: (enabled: boolean) => void
  /** Callback to trigger a manual refresh */
  onRefresh: () => void
  /** Optional label for the indicator (e.g., "Comparison Data") */
  label?: string
  /** Compact mode renders a smaller indicator suitable for inline use */
  compact?: boolean
  /** Additional CSS class names */
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable relative time string for how long ago a date was.
 */
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 5) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHour = Math.floor(diffMin / 60)
  return `${diffHour}h ago`
}

// ---------------------------------------------------------------------------
// RefreshIndicator
// ---------------------------------------------------------------------------

export function RefreshIndicator({
  isFetching,
  lastUpdated,
  changeCount = 0,
  autoRefreshEnabled,
  onAutoRefreshToggle,
  onRefresh,
  label,
  compact = false,
  className,
}: RefreshIndicatorProps) {
  // Re-render every 10 seconds to keep the "Xs ago" label current
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10_000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = useCallback(() => {
    onRefresh()
  }, [onRefresh])

  if (compact) {
    return (
      <CompactIndicator
        isFetching={isFetching}
        lastUpdated={lastUpdated}
        changeCount={changeCount}
        onRefresh={handleRefresh}
        className={className}
      />
    )
  }

  return (
    <div className={cn('flex items-center gap-3 rounded-lg border bg-card px-3 py-2', className)}>
      {/* Pulsing status dot */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="relative flex h-3 w-3 shrink-0">
              {isFetching && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--status-info)] opacity-75" />
              )}
              <span
                className={cn(
                  'relative inline-flex h-3 w-3 rounded-full',
                  isFetching ? 'bg-[var(--status-info)]' : 'bg-[var(--status-success)]'
                )}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isFetching ? 'Refreshing data...' : 'Connected'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Label (optional) */}
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}

      {/* Last updated timestamp */}
      {lastUpdated && (
        <span className="text-xs text-muted-foreground">{formatRelativeTime(lastUpdated)}</span>
      )}

      {/* Change count badge */}
      {changeCount > 0 && (
        <Badge
          variant="outline"
          className="border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info)] text-[10px] px-1.5 py-0"
        >
          {changeCount} {changeCount === 1 ? 'change' : 'changes'}
        </Badge>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Auto-refresh toggle */}
      {onAutoRefreshToggle !== undefined && autoRefreshEnabled !== undefined && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Auto</span>
                <Switch
                  checked={autoRefreshEnabled}
                  onCheckedChange={onAutoRefreshToggle}
                  aria-label="Toggle auto-refresh"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {autoRefreshEnabled ? 'Auto-refresh is on' : 'Auto-refresh is off'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Manual refresh button */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRefresh}
              disabled={isFetching}
              aria-label="Refresh data"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Refresh now</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CompactIndicator - Smaller inline version
// ---------------------------------------------------------------------------

interface CompactIndicatorProps {
  isFetching: boolean
  lastUpdated: Date | null
  changeCount: number
  onRefresh: () => void
  className?: string
}

function CompactIndicator({
  isFetching,
  lastUpdated,
  changeCount,
  onRefresh,
  className,
}: CompactIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Status dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        {isFetching && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--status-info)] opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            isFetching ? 'bg-[var(--status-info)]' : 'bg-[var(--status-success)]'
          )}
        />
      </span>

      {/* Last updated */}
      {lastUpdated && (
        <span className="text-[10px] text-muted-foreground">{formatRelativeTime(lastUpdated)}</span>
      )}

      {/* Change count */}
      {changeCount > 0 && (
        <Badge
          variant="outline"
          className="border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info)] text-[10px] px-1 py-0 h-4"
        >
          {changeCount}
        </Badge>
      )}

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        disabled={isFetching}
        className="text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
        aria-label="Refresh data"
      >
        <RefreshCw className={cn('h-3 w-3', isFetching && 'animate-spin')} />
      </button>
    </div>
  )
}
