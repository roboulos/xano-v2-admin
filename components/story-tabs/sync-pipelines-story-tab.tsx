'use client'

/**
 * SyncPipelinesStoryTab - Visualizes the V1 -> V2 sync pipeline status.
 *
 * Shows a 4-stage pipeline flow (Source -> Staging -> Processing -> Target)
 * for each integration: FUB, reZEN, SkySlope, DotLoop, Lofty.
 *
 * Data sources:
 * - /api/staging/status?user_id=X   (staging table counts)
 * - /api/staging/unprocessed?user_id=X (unprocessed backlog)
 * - UserContext comparison data (V1/V2 record totals as fallback)
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Database,
  GitBranch,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  Server,
  Zap,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { useSelectedUserId, useUserData } from '@/contexts/UserContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PipelineStatus = 'healthy' | 'warning' | 'error' | 'inactive'

interface PipelineStage {
  label: string
  count: number | null
  icon: React.ReactNode
}

interface PipelineDef {
  id: string
  name: string
  description: string
  /** Tables in staging that belong to this pipeline */
  stagingTables: string[]
  /** V2 target tables */
  targetTables: string[]
  /** Color for the pipeline accent */
  accentColor: string
}

interface StagingStatusData {
  [tableName: string]: {
    total: number
    processed: number
    unprocessed: number
    last_sync?: string
  }
}

interface UnprocessedData {
  [tableName: string]: {
    count: number
    oldest?: string
  }
}

// ---------------------------------------------------------------------------
// Pipeline Definitions
// ---------------------------------------------------------------------------

const PIPELINES: PipelineDef[] = [
  {
    id: 'fub',
    name: 'FUB (Follow Up Boss)',
    description: 'CRM contacts, deals, events, calls, and text messages',
    stagingTables: [
      'fub_people_staging',
      'fub_events_staging',
      'fub_calls_staging',
      'fub_deals_staging',
      'appointments_staging',
      'text_messages_staging',
    ],
    targetTables: [
      'fub_people',
      'fub_events',
      'fub_calls',
      'fub_deals',
      'fub_appointments',
      'fub_text_messages',
    ],
    accentColor: 'var(--status-info)',
  },
  {
    id: 'rezen',
    name: 'reZEN',
    description: 'Agents, transactions, listings, network, contributions',
    stagingTables: [
      'rezen_transactions_staging',
      'rezen_listings_staging',
      'rezen_network_staging',
      'rezen_contributions_staging',
      'rezen_contributions_daily_staging',
      'rezen_contributions_onboarding_staging',
      'rezen_pending_staging',
    ],
    targetTables: ['transaction', 'listing', 'network_member', 'contribution'],
    accentColor: 'var(--status-success)',
  },
  {
    id: 'skyslope',
    name: 'SkySlope',
    description: 'Transaction documents and listing data',
    stagingTables: ['skyslope_transaction_staging', 'skyslope_listing_staging'],
    targetTables: ['transaction', 'listing'],
    accentColor: 'var(--chart-1)',
  },
  {
    id: 'dotloop',
    name: 'DotLoop',
    description: 'Loops, contacts, and profiles',
    stagingTables: ['dotloop_staging'],
    targetTables: ['dotloop_loops', 'dotloop_contacts', 'dotloop_profiles'],
    accentColor: 'var(--chart-2)',
  },
  {
    id: 'lofty',
    name: 'Lofty',
    description: 'Lead data and account information',
    stagingTables: ['lofty_staging'],
    targetTables: ['lofty_leads', 'lofty_accounts'],
    accentColor: 'var(--chart-5)',
  },
]

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

function derivePipelineStatus(
  stagingData: StagingStatusData | null,
  unprocessedData: UnprocessedData | null,
  pipeline: PipelineDef
): PipelineStatus {
  // If no staging data at all, consider inactive
  if (!stagingData) return 'inactive'

  let totalUnprocessed = 0
  let hasAnyData = false

  for (const table of pipeline.stagingTables) {
    const staging = stagingData[table]
    if (staging) {
      hasAnyData = true
      totalUnprocessed += staging.unprocessed ?? 0
    }

    const unprocessed = unprocessedData?.[table]
    if (unprocessed) {
      hasAnyData = true
      totalUnprocessed += unprocessed.count ?? 0
    }
  }

  if (!hasAnyData) return 'inactive'
  if (totalUnprocessed > 100) return 'error'
  if (totalUnprocessed > 0) return 'warning'
  return 'healthy'
}

function getStagingCount(stagingData: StagingStatusData | null, tables: string[]): number {
  if (!stagingData) return 0
  let total = 0
  for (const table of tables) {
    total += stagingData[table]?.total ?? 0
  }
  return total
}

function getUnprocessedCount(
  stagingData: StagingStatusData | null,
  unprocessedData: UnprocessedData | null,
  tables: string[]
): number {
  let total = 0
  for (const table of tables) {
    total += stagingData?.[table]?.unprocessed ?? 0
    total += unprocessedData?.[table]?.count ?? 0
  }
  return total
}

function getLastSyncTime(stagingData: StagingStatusData | null, tables: string[]): string | null {
  if (!stagingData) return null
  let latest: string | null = null
  for (const table of tables) {
    const sync = stagingData[table]?.last_sync
    if (sync && (!latest || sync > latest)) {
      latest = sync
    }
  }
  return latest
}

const STATUS_CONFIG: Record<
  PipelineStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  healthy: {
    label: 'Healthy',
    dotClass: 'bg-[var(--status-success)]',
    badgeClass:
      'border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]',
  },
  warning: {
    label: 'Backlog',
    dotClass: 'bg-[var(--status-warning)]',
    badgeClass:
      'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning)]',
  },
  error: {
    label: 'Error',
    dotClass: 'bg-[var(--status-error)]',
    badgeClass:
      'border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error)]',
  },
  inactive: {
    label: 'Inactive',
    dotClass: 'bg-[var(--status-pending)]',
    badgeClass:
      'border-[var(--status-pending-border)] bg-[var(--status-pending-bg)] text-[var(--status-pending)]',
  },
}

// ---------------------------------------------------------------------------
// Fetcher hooks
// ---------------------------------------------------------------------------

interface StagingFetchState {
  stagingData: StagingStatusData | null
  unprocessedData: UnprocessedData | null
  isLoading: boolean
  error: string | null
  fetchedAt: Date | null
}

function useStagingData(userId: number | null): StagingFetchState & { refresh: () => void } {
  const [state, setState] = useState<StagingFetchState>({
    stagingData: null,
    unprocessedData: null,
    isLoading: false,
    error: null,
    fetchedAt: null,
  })

  const fetchData = useCallback(async () => {
    if (userId === null) return

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const [statusRes, unprocessedRes] = await Promise.allSettled([
        fetch(`/api/staging/status?user_id=${userId}`).then((r) => {
          if (!r.ok) throw new Error(`Status ${r.status}`)
          return r.json()
        }),
        fetch(`/api/staging/unprocessed?user_id=${userId}`).then((r) => {
          if (!r.ok) throw new Error(`Status ${r.status}`)
          return r.json()
        }),
      ])

      const stagingData =
        statusRes.status === 'fulfilled' && !statusRes.value?.error ? statusRes.value : null
      const unprocessedData =
        unprocessedRes.status === 'fulfilled' && !unprocessedRes.value?.error
          ? unprocessedRes.value
          : null

      // Build a combined error message only if both failed
      let error: string | null = null
      if (!stagingData && !unprocessedData) {
        const parts: string[] = []
        if (statusRes.status === 'rejected') {
          parts.push(`Staging status: ${statusRes.reason}`)
        }
        if (unprocessedRes.status === 'rejected') {
          parts.push(`Unprocessed: ${unprocessedRes.reason}`)
        }
        error = parts.length > 0 ? parts.join('; ') : 'Staging endpoints unavailable'
      }

      setState({
        stagingData,
        unprocessedData,
        isLoading: false,
        error,
        fetchedAt: new Date(),
      })
    } catch (e) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      }))
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refresh: fetchData }
}

// ---------------------------------------------------------------------------
// SyncPipelinesStoryTab (Main Export)
// ---------------------------------------------------------------------------

export function SyncPipelinesStoryTab() {
  const { selectedUserId } = useSelectedUserId()
  const { totals, isLoading: isUserDataLoading } = useUserData()
  const {
    stagingData,
    unprocessedData,
    isLoading: isStagingLoading,
    error: stagingError,
    fetchedAt,
    refresh,
  } = useStagingData(selectedUserId)

  const isLoading = isStagingLoading || isUserDataLoading

  // If no user selected, show empty state
  if (selectedUserId === null) {
    return <EmptyState />
  }

  // Loading skeleton
  if (isLoading && !stagingData) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <PipelineHeader
        userId={selectedUserId}
        fetchedAt={fetchedAt}
        isRefreshing={isStagingLoading}
        onRefresh={refresh}
        stagingData={stagingData}
        unprocessedData={unprocessedData}
      />

      {/* Pipeline flow legend */}
      <FlowLegend />

      {/* Staging error notice (non-blocking) */}
      {stagingError && (
        <Card className="border-[var(--status-warning-border)]">
          <CardContent className="py-3">
            <p className="text-sm text-[var(--status-warning)]">
              Staging endpoints returned partial or no data. Pipeline status may be incomplete.
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stagingError}</p>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Cards */}
      <div className="space-y-3">
        {PIPELINES.map((pipeline) => (
          <PipelineCard
            key={pipeline.id}
            pipeline={pipeline}
            stagingData={stagingData}
            unprocessedData={unprocessedData}
            totals={totals}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PipelineHeader
// ---------------------------------------------------------------------------

interface PipelineHeaderProps {
  userId: number
  fetchedAt: Date | null
  isRefreshing: boolean
  onRefresh: () => void
  stagingData: StagingStatusData | null
  unprocessedData: UnprocessedData | null
}

function PipelineHeader({
  userId,
  fetchedAt,
  isRefreshing,
  onRefresh,
  stagingData,
  unprocessedData,
}: PipelineHeaderProps) {
  // Compute overall status summary
  const statusSummary = useMemo(() => {
    const counts = { healthy: 0, warning: 0, error: 0, inactive: 0 }
    for (const pipeline of PIPELINES) {
      const status = derivePipelineStatus(stagingData, unprocessedData, pipeline)
      counts[status]++
    }
    return counts
  }, [stagingData, unprocessedData])

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Sync Pipelines - User #{userId}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {fetchedAt && (
                <span className="text-xs text-muted-foreground">
                  Updated: {formatRelativeTime(fetchedAt)}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                {statusSummary.healthy > 0 && (
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0', STATUS_CONFIG.healthy.badgeClass)}
                  >
                    {statusSummary.healthy} healthy
                  </Badge>
                )}
                {statusSummary.warning > 0 && (
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0', STATUS_CONFIG.warning.badgeClass)}
                  >
                    {statusSummary.warning} backlog
                  </Badge>
                )}
                {statusSummary.error > 0 && (
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0', STATUS_CONFIG.error.badgeClass)}
                  >
                    {statusSummary.error} error
                  </Badge>
                )}
                {statusSummary.inactive > 0 && (
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0', STATUS_CONFIG.inactive.badgeClass)}
                  >
                    {statusSummary.inactive} inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-1.5"
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </CardHeader>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// FlowLegend - Shows the 4-stage pipeline legend
// ---------------------------------------------------------------------------

function FlowLegend() {
  const stages = [
    { label: 'V1 Source', icon: <Server className="h-3.5 w-3.5" /> },
    { label: 'Staging', icon: <Inbox className="h-3.5 w-3.5" /> },
    { label: 'Processing', icon: <Zap className="h-3.5 w-3.5" /> },
    { label: 'V2 Target', icon: <Database className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
      {stages.map((stage, i) => (
        <div key={stage.label} className="contents">
          <div className="flex items-center gap-1">
            {stage.icon}
            <span className="font-medium">{stage.label}</span>
          </div>
          {i < stages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/50" />}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PipelineCard - One card per integration pipeline
// ---------------------------------------------------------------------------

interface PipelineCardProps {
  pipeline: PipelineDef
  stagingData: StagingStatusData | null
  unprocessedData: UnprocessedData | null
  totals:
    | { entity: string; v1_count: number; v2_count: number; delta: number; status: string }[]
    | null
}

function PipelineCard({ pipeline, stagingData, unprocessedData, totals }: PipelineCardProps) {
  const status = derivePipelineStatus(stagingData, unprocessedData, pipeline)
  const statusConfig = STATUS_CONFIG[status]

  const stagingCount = getStagingCount(stagingData, pipeline.stagingTables)
  const unprocessedCount = getUnprocessedCount(stagingData, unprocessedData, pipeline.stagingTables)
  const lastSync = getLastSyncTime(stagingData, pipeline.stagingTables)

  // Try to derive source/target counts from UserContext totals as fallback
  const v1Count = useMemo(() => {
    if (!totals) return null
    // Map pipeline target tables to entities in the totals
    const entityMap: Record<string, string[]> = {
      fub: [],
      rezen: ['transactions', 'listings', 'network', 'contributions'],
      skyslope: ['transactions', 'listings'],
      dotloop: [],
      lofty: [],
    }
    const entities = entityMap[pipeline.id] ?? []
    if (entities.length === 0) return null
    let total = 0
    for (const entity of entities) {
      const t = totals.find((tt) => tt.entity === entity)
      if (t) total += t.v1_count
    }
    return total > 0 ? total : null
  }, [totals, pipeline.id])

  const v2Count = useMemo(() => {
    if (!totals) return null
    const entityMap: Record<string, string[]> = {
      fub: [],
      rezen: ['transactions', 'listings', 'network', 'contributions'],
      skyslope: ['transactions', 'listings'],
      dotloop: [],
      lofty: [],
    }
    const entities = entityMap[pipeline.id] ?? []
    if (entities.length === 0) return null
    let total = 0
    for (const entity of entities) {
      const t = totals.find((tt) => tt.entity === entity)
      if (t) total += t.v2_count
    }
    return total > 0 ? total : null
  }, [totals, pipeline.id])

  // Build the 4-stage flow
  const stages: PipelineStage[] = [
    {
      label: 'V1 Source',
      count: v1Count,
      icon: <Server className="h-4 w-4" />,
    },
    {
      label: 'Staging',
      count: stagingCount > 0 ? stagingCount : null,
      icon: <Inbox className="h-4 w-4" />,
    },
    {
      label: 'Processing',
      count: unprocessedCount,
      icon: <Zap className="h-4 w-4" />,
    },
    {
      label: 'V2 Target',
      count: v2Count,
      icon: <Database className="h-4 w-4" />,
    },
  ]

  return (
    <Card
      className={cn(
        'transition-colors',
        status === 'error' && 'border-[var(--status-error-border)]',
        status === 'warning' && 'border-[var(--status-warning-border)]'
      )}
    >
      <CardContent className="py-4">
        {/* Pipeline header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'inline-block h-2.5 w-2.5 rounded-full shrink-0',
                statusConfig.dotClass
              )}
            />
            <div>
              <h3 className="text-sm font-semibold">{pipeline.name}</h3>
              <p className="text-xs text-muted-foreground">{pipeline.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastSync && (
              <span className="text-[10px] text-muted-foreground">
                Last sync: {formatRelativeTime(lastSync)}
              </span>
            )}
            <Badge variant="outline" className={cn('text-xs', statusConfig.badgeClass)}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* 4-stage pipeline flow */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2">
          {stages.map((stage, i) => (
            <div key={stage.label} className="contents">
              <StageBox
                stage={stage}
                pipeline={pipeline}
                isBacklog={i === 2 && unprocessedCount > 0}
              />
              {i < stages.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 justify-self-center" />
              )}
            </div>
          ))}
        </div>

        {/* Backlog warning */}
        {unprocessedCount > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] px-3 py-2">
            <Loader2 className="h-3.5 w-3.5 text-[var(--status-warning)] animate-spin" />
            <span className="text-xs text-[var(--status-warning)] font-medium">
              {unprocessedCount.toLocaleString()} unprocessed record
              {unprocessedCount !== 1 ? 's' : ''} in staging
            </span>
          </div>
        )}

        {/* Staging table breakdown (collapsed detail) */}
        {stagingData && <StagingTableBreakdown pipeline={pipeline} stagingData={stagingData} />}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// StageBox - Single stage in the pipeline flow
// ---------------------------------------------------------------------------

interface StageBoxProps {
  stage: PipelineStage
  pipeline: PipelineDef
  isBacklog: boolean
}

function StageBox({ stage, pipeline, isBacklog }: StageBoxProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-center min-w-[100px]',
        isBacklog
          ? 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)]'
          : 'border-border bg-muted/20'
      )}
    >
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full',
          isBacklog
            ? 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {stage.icon}
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">{stage.label}</span>
      <span className="text-sm font-bold tabular-nums">
        {stage.count !== null ? stage.count.toLocaleString() : '--'}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StagingTableBreakdown - Shows per-table staging details
// ---------------------------------------------------------------------------

interface StagingTableBreakdownProps {
  pipeline: PipelineDef
  stagingData: StagingStatusData
}

function StagingTableBreakdown({ pipeline, stagingData }: StagingTableBreakdownProps) {
  const [expanded, setExpanded] = useState(false)

  // Filter to only tables that have data
  const tablesWithData = pipeline.stagingTables.filter(
    (table) => stagingData[table] && stagingData[table].total > 0
  )

  if (tablesWithData.length === 0) return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? 'Hide' : 'Show'} staging table details ({tablesWithData.length} table
        {tablesWithData.length !== 1 ? 's' : ''})
      </button>
      {expanded && (
        <div className="mt-2 grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-1 text-xs">
          <div className="font-medium text-muted-foreground">Table</div>
          <div className="font-medium text-muted-foreground text-right">Total</div>
          <div className="font-medium text-muted-foreground text-right">Processed</div>
          <div className="font-medium text-muted-foreground text-right">Pending</div>
          {tablesWithData.map((table) => {
            const data = stagingData[table]
            const pending = data.unprocessed ?? 0
            return (
              <div key={table} className="contents">
                <div className="py-0.5 font-mono truncate">{table}</div>
                <div className="py-0.5 text-right font-mono tabular-nums">
                  {data.total.toLocaleString()}
                </div>
                <div className="py-0.5 text-right font-mono tabular-nums">
                  {data.processed.toLocaleString()}
                </div>
                <div
                  className={cn(
                    'py-0.5 text-right font-mono tabular-nums',
                    pending > 0 && 'text-[var(--status-warning)]'
                  )}
                >
                  {pending.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// EmptyState - Shown when no user is selected
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No User Selected</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Select a user from the picker above to view their sync pipeline status. Each pipeline
          shows the flow of data from V1 through staging tables to the V2 target.
        </p>
        <div className="mt-4 flex justify-center">
          <Badge variant="outline" className="text-xs">
            Tip: User #60 (David Keener) is a verified test user with extensive data
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// LoadingSkeleton - Pulsing skeleton while data loads
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <Card>
        <CardHeader className="flex-row items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </CardHeader>
      </Card>

      {/* Flow legend skeleton */}
      <div className="flex items-center justify-center gap-2 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-16" />
            {i < 3 && <Skeleton className="h-3 w-3 rounded mx-1" />}
          </div>
        ))}
      </div>

      {/* Pipeline card skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2">
              {Array.from({ length: 7 }).map((_, j) =>
                j % 2 === 0 ? (
                  <Skeleton key={j} className="h-[72px] w-full rounded-lg" />
                ) : (
                  <Skeleton key={j} className="h-4 w-4 justify-self-center" />
                )
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
