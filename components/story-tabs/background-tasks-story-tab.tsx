'use client'

/**
 * BackgroundTasksStoryTab - Job queue status for a selected user
 *
 * Shows background task/job queue status across 4 queue types:
 *   - fub_onboarding_jobs: FUB initial data import
 *   - fub_sync_jobs: Ongoing FUB data sync
 *   - rezen_sync_jobs: reZEN API sync
 *   - job_status: General job tracking
 *
 * The /job-queue-status SYSTEM endpoint queries 4 job tables
 * (job_status, fub_onboarding_jobs, fub_sync_jobs, rezen_sync_jobs)
 * and returns counts by status. Supports optional user_id filter.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  Timer,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSelectedUserId } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SYSTEM_BASE_URL = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN'

type JobType = 'all' | 'fub_onboarding_jobs' | 'fub_sync_jobs' | 'rezen_sync_jobs' | 'job_status'

const JOB_TYPE_LABELS: Record<Exclude<JobType, 'all'>, string> = {
  fub_onboarding_jobs: 'FUB Onboarding',
  fub_sync_jobs: 'FUB Sync',
  rezen_sync_jobs: 'reZEN Sync',
  job_status: 'General',
}

const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: 'all', label: 'All Queues' },
  { value: 'fub_onboarding_jobs', label: 'FUB Onboarding' },
  { value: 'fub_sync_jobs', label: 'FUB Sync' },
  { value: 'rezen_sync_jobs', label: 'reZEN Sync' },
  { value: 'job_status', label: 'General' },
]

type JobStatus = 'pending' | 'processing' | 'complete' | 'error'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QueueCounts {
  pending: number
  processing: number
  complete: number
  error: number
}

interface QueueData {
  queue: Exclude<JobType, 'all'>
  label: string
  counts: QueueCounts
}

interface RecentJob {
  id: string
  queue: Exclude<JobType, 'all'>
  status: JobStatus
  summary: string
  detail: string
  timestamp: string
}

interface JobQueueResponse {
  success: boolean
  queues: Record<string, QueueCounts>
  total_pending: number
  oldest_pending_minutes: number
  tables_checked: string[]
  tables_missing: string[]
}

interface FetchState {
  data: JobQueueResponse | null
  isLoading: boolean
  error: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a timestamp into a human-readable "time ago" string.
 * Extracted as a standalone function to avoid calling Date.now() inside useMemo.
 */
function formatTimeAgo(timestamp: string): string {
  try {
    const now = Date.now()
    const diff = now - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} min ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Status Styling Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  JobStatus,
  {
    color: string
    bg: string
    border: string
    icon: React.ReactNode
    label: string
  }
> = {
  pending: {
    color: 'var(--status-pending)',
    bg: 'var(--status-pending-bg)',
    border: 'var(--status-pending-border)',
    icon: <Clock className="h-3.5 w-3.5" />,
    label: 'Pending',
  },
  processing: {
    color: 'var(--status-info)',
    bg: 'var(--status-info-bg)',
    border: 'var(--status-info-border)',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    label: 'Processing',
  },
  complete: {
    color: 'var(--status-success)',
    bg: 'var(--status-success-bg)',
    border: 'var(--status-success-border)',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: 'Complete',
  },
  error: {
    color: 'var(--status-error)',
    bg: 'var(--status-error-bg)',
    border: 'var(--status-error-border)',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    label: 'Error',
  },
}

function StatusIndicator({ status }: { status: JobStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium"
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: config.border,
      }}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Data Fetching Hook
// ---------------------------------------------------------------------------

function useJobQueueStatus(userId: number | null) {
  const [state, setState] = useState<FetchState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    if (userId === null) return

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const url = new URL(`${SYSTEM_BASE_URL}/job-queue-status`)
      url.searchParams.set('user_id', String(userId))

      const res = await fetch(url.toString(), { signal: controller.signal })

      if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error')
        throw new Error(`${res.status}: ${text}`)
      }

      const json: JobQueueResponse = await res.json()
      setState({
        data: json,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }, [userId])

  // Fetch on mount and when userId changes
  useEffect(() => {
    if (userId !== null) {
      fetchData()
    } else {
      setState({
        data: null,
        isLoading: false,
        error: null,
      })
    }
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [userId, fetchData])

  return { ...state, refresh: fetchData }
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

/** Empty state when no user is selected */
function NoUserSelected() {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Timer className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No User Selected</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Select a user from the picker above to view their background task queue status, including
          FUB sync, reZEN sync, and general processing jobs.
        </p>
      </CardContent>
    </Card>
  )
}

/** Loading skeleton for the queue summary */
function QueueSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/** Queue Summary Table */
function QueueSummaryTable({ queues, filterType }: { queues: QueueData[]; filterType: JobType }) {
  const filtered = useMemo(() => {
    if (filterType === 'all') return queues
    return queues.filter((q) => q.queue === filterType)
  }, [queues, filterType])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, q) => ({
        pending: acc.pending + q.counts.pending,
        processing: acc.processing + q.counts.processing,
        complete: acc.complete + q.counts.complete,
        error: acc.error + q.counts.error,
      }),
      { pending: 0, processing: 0, complete: 0, error: 0 }
    )
  }, [filtered])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Job Queues</CardTitle>
        <CardDescription>
          {`${filtered.length} queue${filtered.length !== 1 ? 's' : ''} monitored`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Queue</TableHead>
              <TableHead className="text-right">
                <span
                  className="inline-flex items-center gap-1"
                  style={{ color: 'var(--status-pending)' }}
                >
                  <Clock className="h-3 w-3" />
                  Pending
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span
                  className="inline-flex items-center gap-1"
                  style={{ color: 'var(--status-info)' }}
                >
                  <Loader2 className="h-3 w-3" />
                  Processing
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span
                  className="inline-flex items-center gap-1"
                  style={{ color: 'var(--status-success)' }}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span
                  className="inline-flex items-center gap-1"
                  style={{ color: 'var(--status-error)' }}
                >
                  <AlertCircle className="h-3 w-3" />
                  Error
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((q) => {
              return (
                <TableRow key={q.queue}>
                  <TableCell className="font-medium">{q.label}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {q.counts.pending > 0 ? (
                      <span style={{ color: 'var(--status-pending)' }}>
                        {q.counts.pending.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {q.counts.processing > 0 ? (
                      <span style={{ color: 'var(--status-info)' }}>
                        {q.counts.processing.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {q.counts.complete > 0 ? (
                      <span style={{ color: 'var(--status-success)' }}>
                        {q.counts.complete.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {q.counts.error > 0 ? (
                      <span style={{ color: 'var(--status-error)' }}>
                        {q.counts.error.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}

            {/* Totals row */}
            <TableRow className="border-t-2 font-semibold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {totals.pending > 0 ? (
                  <span style={{ color: 'var(--status-pending)' }}>
                    {totals.pending.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {totals.processing > 0 ? (
                  <span style={{ color: 'var(--status-info)' }}>
                    {totals.processing.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {totals.complete > 0 ? (
                  <span style={{ color: 'var(--status-success)' }}>
                    {totals.complete.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {totals.error > 0 ? (
                  <span style={{ color: 'var(--status-error)' }}>
                    {totals.error.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/** Recent Jobs List with expandable details */
function RecentJobsList({ jobs, filterType }: { jobs: RecentJob[]; filterType: JobType }) {
  const filtered = useMemo(() => {
    if (filterType === 'all') return jobs
    return jobs.filter((j) => j.queue === filterType)
  }, [jobs, filterType])

  if (filtered.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Jobs</CardTitle>
          <CardDescription>{'No recent jobs found for the selected filter'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No jobs to display</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Jobs</CardTitle>
        <CardDescription>
          {`${filtered.length} recent job${filtered.length !== 1 ? 's' : ''}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {filtered.map((job) => (
          <RecentJobRow key={job.id} job={job} />
        ))}
      </CardContent>
    </Card>
  )
}

/** Single expandable job row */
function RecentJobRow({ job }: { job: RecentJob }) {
  const [open, setOpen] = useState(false)
  const config = STATUS_CONFIG[job.status]

  const timeAgo = formatTimeAgo(job.timestamp)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="rounded-lg border transition-colors"
        style={{
          borderColor: open ? config.border : undefined,
        }}
      >
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors rounded-lg">
            {open ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <StatusIndicator status={job.status} />
            <span className="flex-1 text-sm font-medium truncate">{job.summary}</span>
            <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-4 py-3 text-sm text-muted-foreground">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
              <span className="font-medium text-foreground">Queue:</span>
              <span>{JOB_TYPE_LABELS[job.queue]}</span>
              <span className="font-medium text-foreground">Job ID:</span>
              <span className="font-mono">{job.id}</span>
              <span className="font-medium text-foreground">Detail:</span>
              <span>{job.detail}</span>
              <span className="font-medium text-foreground">Timestamp:</span>
              <span className="font-mono">{new Date(job.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function BackgroundTasksStoryTab() {
  const { selectedUserId } = useSelectedUserId()
  const { data, isLoading, error, refresh } = useJobQueueStatus(selectedUserId)
  const [filterType, setFilterType] = useState<JobType>('all')

  // Derive queue data from API response
  const queues: QueueData[] = useMemo(() => {
    if (!data?.queues) return []
    return Object.entries(data.queues).map(([key, counts]) => ({
      queue: key as Exclude<JobType, 'all'>,
      label: JOB_TYPE_LABELS[key as Exclude<JobType, 'all'>] ?? key,
      counts,
    }))
  }, [data])

  // Derive recent jobs from API response
  const recentJobs: RecentJob[] = useMemo(() => {
    if (!data) return []
    // The API may include a recent_jobs array in the response
    const raw = (data as any).recent_jobs
    if (Array.isArray(raw)) return raw
    return []
  }, [data])

  // ---- No user selected ----
  if (selectedUserId === null) {
    return <NoUserSelected />
  }

  // ---- Loading ----
  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <QueueSummarySkeleton />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---- Error ----
  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--status-error-bg)' }}
          >
            <AlertCircle className="h-6 w-6" style={{ color: 'var(--status-error)' }} />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Failed to Load Job Queue Status</h3>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => refresh()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ---- Main View ----
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="flex-row items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                Background Tasks{' '}
                <span className="text-muted-foreground font-normal">
                  &mdash; User #{selectedUserId}
                </span>
              </CardTitle>
              {data && (
                <p className="text-xs text-muted-foreground">
                  {data.total_pending} pending
                  {data.oldest_pending_minutes > 0 &&
                    ` | oldest: ${data.oldest_pending_minutes} min`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter dropdown */}
            <div className="relative">
              <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as JobType)}
                className="h-8 appearance-none rounded-md border bg-background pl-8 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                {JOB_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Queue Summary Table */}
      <QueueSummaryTable queues={queues} filterType={filterType} />

      {/* Recent Jobs List */}
      <RecentJobsList jobs={recentJobs} filterType={filterType} />
    </div>
  )
}

export default BackgroundTasksStoryTab
