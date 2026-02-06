'use client'

/**
 * WebhooksStoryTab - Webhook configuration and recent delivery events
 *
 * Shows:
 * 1. Webhook Configuration Summary - known Rezen webhooks from MCP endpoints
 * 2. Webhook Health Status - active/inactive badges, last received timestamps
 * 3. Recent Events Feed - staging status as proxy for webhook activity (user-scoped)
 * 4. Architecture Diagram - static visual of the webhook pipeline
 *
 * Gracefully handles 404 from the /staging-status endpoint with fallback UI.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Loader2,
  RefreshCw,
  ServerCrash,
  Webhook,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSelectedUserId } from '@/contexts/UserContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { MCP_ENDPOINTS, MCP_BASES } from '@/lib/mcp-endpoints'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WebhookConfig {
  id: string
  name: string
  source: string
  description: string
  endpoint: string
  /** Human-readable name for the backend service */
  backendLabel: string
  targetTables: string[]
  status: 'active' | 'inactive' | 'unknown'
}

interface StagingStatusResponse {
  success?: boolean
  [key: string]: unknown
}

interface FetchState {
  data: StagingStatusResponse | null
  isLoading: boolean
  error: string | null
  is404: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SYSTEM_BASE_URL = MCP_BASES.SYSTEM

/**
 * Known webhook configurations derived from CLAUDE.md documentation
 * and the WORKERS endpoints that handle webhook payloads.
 */
const WEBHOOK_CONFIGS: WebhookConfig[] = [
  {
    id: 'rezen-txn',
    name: 'reZEN Transaction Updates',
    source: 'reZEN API',
    description:
      'Receives transaction create/update/close events from reZEN. Triggers staging and processing pipeline for transaction, participant, and financial data.',
    endpoint: '/test-function-8052-txn-sync',
    backendLabel: 'Transaction Sync Service',
    targetTables: ['transaction', 'participant', 'paid_participant'],
    status: 'active',
  },
  {
    id: 'rezen-agent',
    name: 'reZEN Agent Changes',
    source: 'reZEN API',
    description:
      'Receives agent profile updates including credentials, hierarchy changes, and cap data updates.',
    endpoint: '/test-function-8051-agent-data',
    backendLabel: 'Agent Profile Service',
    targetTables: ['agent', 'credentials', 'agent_cap_data'],
    status: 'active',
  },
  {
    id: 'rezen-network',
    name: 'reZEN Network Changes',
    source: 'reZEN API',
    description:
      'Receives network downline changes, sponsor tree updates, and frontline modifications. Processes 100 records per batch.',
    endpoint: '/test-function-8062-network-downline',
    backendLabel: 'Network Import Service',
    targetTables: ['network_member', 'sponsor_tree'],
    status: 'active',
  },
  {
    id: 'rezen-listings',
    name: 'reZEN Listings Sync',
    source: 'reZEN API',
    description:
      'Receives listing create/update events. Handles listing status transitions and property data.',
    endpoint: '/test-function-8053-listings-sync',
    backendLabel: 'Listings Service',
    targetTables: ['listing'],
    status: 'active',
  },
  {
    id: 'rezen-contributions',
    name: 'reZEN Contributions',
    source: 'reZEN API',
    description:
      'Receives contribution and revenue share data. Processes income records and revshare totals.',
    endpoint: '/test-function-8056-contributions',
    backendLabel: 'Contributions Service',
    targetTables: ['contribution', 'income', 'revshare_totals'],
    status: 'active',
  },
  {
    id: 'rezen-team',
    name: 'reZEN Team Roster',
    source: 'reZEN API',
    description:
      'Receives team membership changes. Syncs team roster, owners, and admin permissions.',
    endpoint: '/test-function-8066-team-roster',
    backendLabel: 'Team Roster Service',
    targetTables: ['team', 'team_roster', 'team_owners'],
    status: 'active',
  },
  {
    id: 'fub-people',
    name: 'Follow Up Boss People Sync',
    source: 'Follow Up Boss',
    description:
      'Receives people/contact updates from Follow Up Boss CRM. Processes through background job coordinator.',
    endpoint: '/test-function-8118-lambda-coordinator',
    backendLabel: 'Contact Sync Service',
    targetTables: ['fub_people', 'fub_users'],
    status: 'active',
  },
  {
    id: 'fub-calls',
    name: 'Follow Up Boss Calls Sync',
    source: 'Follow Up Boss',
    description:
      'Receives call activity data from FUB. Tracks call direction, duration, and outcomes.',
    endpoint: '/test-function-8065-fub-calls',
    backendLabel: 'Call Activity Service',
    targetTables: ['fub_calls'],
    status: 'active',
  },
]

/**
 * Count how many MCP_ENDPOINTS reference a given webhook endpoint path.
 * This validates the webhook is actually backed by a real endpoint.
 */
function getEndpointMatch(endpointPath: string) {
  return MCP_ENDPOINTS.find((e) => e.endpoint === endpointPath)
}

// ---------------------------------------------------------------------------
// Data Fetching Hook
// ---------------------------------------------------------------------------

function useStagingStatus(userId: number | null) {
  const [state, setState] = useState<FetchState>({
    data: null,
    isLoading: false,
    error: null,
    is404: false,
  })

  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    if (userId === null) return

    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const url = new URL(`${SYSTEM_BASE_URL}/staging-status`)
      url.searchParams.set('user_id', String(userId))

      const res = await fetch(url.toString(), { signal: controller.signal })

      if (res.status === 404) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          is404: true,
          error: null,
        }))
        return
      }

      if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error')
        throw new Error(`${res.status}: ${text}`)
      }

      const json: StagingStatusResponse = await res.json()
      setState({
        data: json,
        isLoading: false,
        error: null,
        is404: false,
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

  useEffect(() => {
    if (userId !== null) {
      fetchData()
    } else {
      setState({ data: null, isLoading: false, error: null, is404: false })
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

function NoUserSelected() {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Webhook className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No User Selected</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Select a user from the picker above to view webhook delivery events and staging table
          activity. Webhook configuration is shown for all users.
        </p>
        <div className="mt-4 flex justify-center">
          <Badge variant="outline" className="text-xs">
            Tip: User #7 (David Keener) is a verified test user
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}

/** Single webhook configuration card (collapsible) */
function WebhookConfigCard({ webhook }: { webhook: WebhookConfig }) {
  const [open, setOpen] = useState(false)
  const endpointMatch = getEndpointMatch(webhook.endpoint)
  const isVerified = !!endpointMatch

  const statusColor =
    webhook.status === 'active'
      ? {
          text: 'text-[var(--status-success)]',
          bg: 'bg-[var(--status-success-bg)]',
          border: 'border-[var(--status-success-border)]',
          dot: 'bg-[var(--status-success)]',
        }
      : webhook.status === 'inactive'
        ? {
            text: 'text-[var(--status-error)]',
            bg: 'bg-[var(--status-error-bg)]',
            border: 'border-[var(--status-error-border)]',
            dot: 'bg-[var(--status-error)]',
          }
        : {
            text: 'text-[var(--status-pending)]',
            bg: 'bg-[var(--status-pending-bg)]',
            border: 'border-[var(--status-pending-border)]',
            dot: 'bg-[var(--status-pending)]',
          }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={cn('transition-colors', open && statusColor.border)}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors rounded-xl">
            {open ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}

            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full shrink-0',
                statusColor.bg
              )}
            >
              <Webhook className={cn('h-3.5 w-3.5', statusColor.text)} />
            </div>

            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">{webhook.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{webhook.source}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isVerified && (
                <Badge
                  variant="outline"
                  className="text-xs border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info)]"
                >
                  Verified
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn('text-xs', statusColor.border, statusColor.bg, statusColor.text)}
              >
                <span
                  className={cn('mr-1.5 h-1.5 w-1.5 rounded-full inline-block', statusColor.dot)}
                />
                {webhook.status === 'active'
                  ? 'Active'
                  : webhook.status === 'inactive'
                    ? 'Inactive'
                    : 'Unknown'}
              </Badge>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-4 py-4 space-y-4">
            <p className="text-sm text-muted-foreground">{webhook.description}</p>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Target Tables</h4>
              <div className="flex flex-wrap gap-1.5">
                {webhook.targetTables.map((table) => (
                  <Badge key={table} variant="secondary" className="text-xs font-mono">
                    <Database className="h-3 w-3" />
                    {table}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Data Service</h4>
              <span className="text-xs bg-muted px-2 py-1 rounded">{webhook.backendLabel}</span>
            </div>

            {endpointMatch && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1.5">
                  Service Details
                </h4>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                  <span className="font-medium">Task Name:</span>
                  <span>{endpointMatch.taskName}</span>
                  <span className="font-medium">Service Group:</span>
                  <span className="font-mono">{endpointMatch.apiGroup}</span>
                  <span className="font-medium">User-Specific:</span>
                  <span>{endpointMatch.requiresUserId ? 'Yes' : 'No'}</span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

/** Architecture diagram showing webhook data flow */
function ArchitectureDiagram() {
  const steps = [
    { label: 'External API', sublabel: 'reZEN / FUB', color: 'var(--status-info)' },
    { label: 'Webhook', sublabel: 'HTTP POST', color: 'var(--status-warning)' },
    { label: 'V2 Staging', sublabel: 'Holding Area', color: 'var(--status-pending)' },
    { label: 'Processing', sublabel: 'Transform & Validate', color: 'var(--status-info)' },
    { label: 'V2 Final', sublabel: 'Production Tables', color: 'var(--status-success)' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Webhook Data Flow</CardTitle>
        <CardDescription>How external data flows through the V2 webhook pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-1 overflow-x-auto py-4">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5 min-w-[90px]">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg border-2"
                  style={{
                    borderColor: step.color,
                    backgroundColor: `color-mix(in srgb, ${step.color} 10%, transparent)`,
                  }}
                >
                  {idx === 0 && <Webhook className="h-5 w-5" style={{ color: step.color }} />}
                  {idx === 1 && <ArrowRight className="h-5 w-5" style={{ color: step.color }} />}
                  {idx === 2 && <Database className="h-5 w-5" style={{ color: step.color }} />}
                  {idx === 3 && <Loader2 className="h-5 w-5" style={{ color: step.color }} />}
                  {idx === 4 && <CheckCircle2 className="h-5 w-5" style={{ color: step.color }} />}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium leading-tight">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{step.sublabel}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mx-1 mt-[-18px]" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/** Recent staging activity derived from /staging-status response */
function StagingActivityFeed({
  data,
  is404,
  error,
  isLoading,
  userId,
  onRefresh,
}: {
  data: StagingStatusResponse | null
  is404: boolean
  error: string | null
  isLoading: boolean
  userId: number
  onRefresh: () => void
}) {
  // Parse staging status data into displayable entries
  const entries = parseStagingEntries(data)

  if (is404) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Webhook Events</CardTitle>
          <CardDescription>User #{userId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-start gap-3 rounded-lg border px-4 py-3"
            style={{
              backgroundColor: 'var(--status-warning-bg)',
              borderColor: 'var(--status-warning-border)',
            }}
          >
            <ServerCrash
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color: 'var(--status-warning)' }}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--status-warning)' }}>
                Staging Status Unavailable
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                The staging status service is not yet available. Once implemented, recent webhook
                delivery events will appear here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Webhook Events</CardTitle>
          <CardDescription>User #{userId}</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--status-error-bg)]">
            <AlertCircle className="h-5 w-5 text-[var(--status-error)]" />
          </div>
          <p className="mb-3 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between py-4">
        <div>
          <CardTitle className="text-base">Recent Webhook Events</CardTitle>
          <CardDescription>Staging table activity for User #{userId}</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="gap-1.5"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No Staging Activity</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No recent webhook events detected in staging tables for this user.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.key} className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      entry.count > 0 ? 'var(--status-success-bg)' : 'var(--status-pending-bg)',
                  }}
                >
                  <Database
                    className="h-3.5 w-3.5"
                    style={{
                      color: entry.count > 0 ? 'var(--status-success)' : 'var(--status-pending)',
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{entry.label}</p>
                  <p className="text-xs text-muted-foreground">{entry.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-mono tabular-nums shrink-0',
                    entry.count > 0
                      ? 'border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]'
                      : 'border-[var(--status-pending-border)] bg-[var(--status-pending-bg)] text-[var(--status-pending)]'
                  )}
                >
                  {entry.count} records
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StagingEntry {
  key: string
  label: string
  description: string
  count: number
}

/**
 * Parse the staging-status response into displayable entries.
 * The response structure varies, so we handle it defensively.
 */
function parseStagingEntries(data: StagingStatusResponse | null): StagingEntry[] {
  if (!data) return []

  const entries: StagingEntry[] = []

  // The staging-status endpoint may return different shapes.
  // We look for common patterns: objects with count/total fields, or arrays.
  for (const [key, value] of Object.entries(data)) {
    if (key === 'success' || key === 'user_id' || key === 'timestamp') continue

    if (typeof value === 'number') {
      entries.push({
        key,
        label: formatStagingKey(key),
        description: `Staging records in ${key}`,
        count: value,
      })
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>
      const count =
        typeof obj.count === 'number'
          ? obj.count
          : typeof obj.total === 'number'
            ? obj.total
            : typeof obj.unprocessed === 'number'
              ? obj.unprocessed
              : 0
      entries.push({
        key,
        label: formatStagingKey(key),
        description: typeof obj.status === 'string' ? obj.status : `Staging records in ${key}`,
        count,
      })
    } else if (Array.isArray(value)) {
      entries.push({
        key,
        label: formatStagingKey(key),
        description: `Staged items in ${key}`,
        count: value.length,
      })
    }
  }

  return entries
}

/** Format a staging table key into a human-readable label */
function formatStagingKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Fub/g, 'FUB')
    .replace(/Rezen/g, 'reZEN')
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function WebhooksStoryTab() {
  const { selectedUserId } = useSelectedUserId()
  const { data, isLoading, error, is404, refresh } = useStagingStatus(selectedUserId)

  return (
    <div className="space-y-4">
      {/* Header card */}
      <Card>
        <CardHeader className="flex-row items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Webhook className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                Webhook Configuration
                {selectedUserId && (
                  <span className="text-muted-foreground font-normal">
                    {' '}
                    &mdash; User #{selectedUserId}
                  </span>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {WEBHOOK_CONFIGS.length} configured webhooks |{' '}
                {WEBHOOK_CONFIGS.filter((w) => w.status === 'active').length} active
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-xs border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]"
          >
            {WEBHOOK_CONFIGS.filter((w) => w.status === 'active').length}/{WEBHOOK_CONFIGS.length}{' '}
            Active
          </Badge>
        </CardHeader>
      </Card>

      {/* Architecture diagram */}
      <ArchitectureDiagram />

      {/* Webhook configuration list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configured Webhooks</CardTitle>
          <CardDescription>
            reZEN and Follow Up Boss integrations that feed incoming data into V2
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {WEBHOOK_CONFIGS.map((webhook) => (
            <WebhookConfigCard key={webhook.id} webhook={webhook} />
          ))}
        </CardContent>
      </Card>

      {/* User-scoped events section */}
      {selectedUserId === null ? (
        <NoUserSelected />
      ) : isLoading && !data ? (
        <LoadingSkeleton />
      ) : (
        <StagingActivityFeed
          data={data}
          is404={is404}
          error={error}
          isLoading={isLoading}
          userId={selectedUserId}
          onRefresh={refresh}
        />
      )}
    </div>
  )
}

export default WebhooksStoryTab
