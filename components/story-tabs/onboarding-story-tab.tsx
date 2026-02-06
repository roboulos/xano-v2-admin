'use client'

import { useCallback, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Loader2,
  Play,
  Users,
  UserCheck,
  ArrowLeftRight,
  Home,
  HandCoins,
  Network,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSelectedUserId, useUserData } from '@/contexts/UserContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StepStatus = 'complete' | 'processing' | 'pending' | 'error'

interface OnboardingStep {
  id: number
  name: string
  endpoint: string
  tables: string[]
  /** Keys into V1UserData / V2UserData to derive counts */
  dataKeys: DataKey[]
  icon: React.ComponentType<{ className?: string }>
  description: string
}

/** Keys that exist on V1UserData / V2UserData with { count: number } shape */
type DataKey = 'transactions' | 'listings' | 'network' | 'contributions'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WORKERS_BASE = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m'

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    name: 'Team Data',
    endpoint: '/test-function-8066-team-roster',
    tables: ['team', 'team_roster', 'team_owners'],
    dataKeys: [],
    icon: Users,
    description: 'Sync team roster data from reZEN API. Processes team memberships and roles.',
  },
  {
    id: 2,
    name: 'Agent Data',
    endpoint: '/test-function-8051-agent-data',
    tables: ['agent', 'user'],
    dataKeys: [],
    icon: UserCheck,
    description: 'Fetch agent profile data from reZEN. Includes credentials and agent hierarchy.',
  },
  {
    id: 3,
    name: 'Transactions',
    endpoint: '/test-function-8052-txn-sync',
    tables: ['transaction', 'participant'],
    dataKeys: ['transactions'],
    icon: ArrowLeftRight,
    description: 'Sync transactions from reZEN API. Includes participants and financial data.',
  },
  {
    id: 4,
    name: 'Listings',
    endpoint: '/test-function-8053-listings-sync',
    tables: ['listing'],
    dataKeys: ['listings'],
    icon: Home,
    description: 'Sync property listings. Includes listing history and status tracking.',
  },
  {
    id: 5,
    name: 'Contributions',
    endpoint: '/test-function-8056-contributions',
    tables: ['contribution', 'income', 'revshare_totals'],
    dataKeys: ['contributions'],
    icon: HandCoins,
    description: 'Sync contribution records and revenue share data.',
  },
  {
    id: 6,
    name: 'Network',
    endpoint: '/test-function-8062-network-downline',
    tables: ['network', 'connections'],
    dataKeys: ['network'],
    icon: Network,
    description: 'Sync network downline. Processes 100 records per call. May need multiple runs.',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive step status from UserContext data.
 *
 * Logic:
 * - Steps 1 & 2 (Team / Agent): check if scalar record exists in V2
 * - Steps 3-6: check V2 array counts vs V1 array counts
 */
function deriveStepStatus(
  step: OnboardingStep,
  v1Data: ReturnType<typeof useUserData>['v1Data'],
  v2Data: ReturnType<typeof useUserData>['v2Data'],
  triggerState: TriggerState
): StepStatus {
  // If we are currently triggering, show processing
  if (triggerState.status === 'processing') return 'processing'
  // If there was a trigger error, show error
  if (triggerState.status === 'error') return 'error'
  // If trigger just succeeded, show complete
  if (triggerState.status === 'success') return 'complete'

  // No data yet => pending
  if (!v2Data) return 'pending'

  // Steps 1 & 2 are scalar (team/agent). Check V2 record presence.
  if (step.id === 1) {
    // Team data: no direct key in UserContext, so check if user exists (team is loaded as part of user)
    // We approximate: if v2Data.user exists, team data was likely loaded
    return v2Data.user ? 'complete' : 'pending'
  }
  if (step.id === 2) {
    return v2Data.agent ? 'complete' : 'pending'
  }

  // Steps 3-6 have array data keys
  if (step.dataKeys.length > 0) {
    const key = step.dataKeys[0]
    const v2Section = v2Data[key]
    if (!v2Section || v2Section.count === 0) return 'pending'

    // If V1 data exists, compare counts
    if (v1Data) {
      const v1Section = v1Data[key]
      if (v1Section && v1Section.count > 0 && v2Section.count >= v1Section.count) {
        return 'complete'
      }
      if (
        v2Section.count > 0 &&
        v1Section &&
        v1Section.count > 0 &&
        v2Section.count < v1Section.count
      ) {
        return 'processing' // partial sync
      }
    }

    // V2 has data but no V1 to compare -- assume complete
    return v2Section.count > 0 ? 'complete' : 'pending'
  }

  return 'pending'
}

function getStatusConfig(status: StepStatus) {
  switch (status) {
    case 'complete':
      return {
        icon: CheckCircle2,
        color: 'text-[var(--status-success)]',
        bg: 'bg-[var(--status-success-bg)]',
        border: 'border-[var(--status-success-border)]',
        label: 'Complete',
        dot: 'bg-[var(--status-success)]',
      }
    case 'processing':
      return {
        icon: Loader2,
        color: 'text-[var(--status-warning)]',
        bg: 'bg-[var(--status-warning-bg)]',
        border: 'border-[var(--status-warning-border)]',
        label: 'Processing',
        dot: 'bg-[var(--status-warning)]',
      }
    case 'error':
      return {
        icon: AlertCircle,
        color: 'text-[var(--status-error)]',
        bg: 'bg-[var(--status-error-bg)]',
        border: 'border-[var(--status-error-border)]',
        label: 'Error',
        dot: 'bg-[var(--status-error)]',
      }
    case 'pending':
    default:
      return {
        icon: Clock,
        color: 'text-[var(--status-pending)]',
        bg: 'bg-[var(--status-pending-bg)]',
        border: 'border-[var(--status-pending-border)]',
        label: 'Pending',
        dot: 'bg-[var(--status-pending)]',
      }
  }
}

/**
 * Get V1 and V2 counts for a step's data keys.
 */
function getStepCounts(
  step: OnboardingStep,
  v1Data: ReturnType<typeof useUserData>['v1Data'],
  v2Data: ReturnType<typeof useUserData>['v2Data']
): { key: string; v1: number | null; v2: number | null }[] {
  if (step.dataKeys.length === 0) {
    // Scalar steps: report presence as 1 or 0
    if (step.id === 1) {
      return [
        {
          key: 'user (team owner)',
          v1: v1Data?.user ? 1 : 0,
          v2: v2Data?.user ? 1 : 0,
        },
      ]
    }
    if (step.id === 2) {
      return [
        { key: 'user', v1: v1Data?.user ? 1 : 0, v2: v2Data?.user ? 1 : 0 },
        { key: 'agent', v1: v1Data?.agent ? 1 : 0, v2: v2Data?.agent ? 1 : 0 },
      ]
    }
    return []
  }

  return step.dataKeys.map((key) => ({
    key,
    v1: v1Data?.[key]?.count ?? null,
    v2: v2Data?.[key]?.count ?? null,
  }))
}

// ---------------------------------------------------------------------------
// Trigger State
// ---------------------------------------------------------------------------

interface TriggerState {
  status: 'idle' | 'processing' | 'success' | 'error'
  message: string | null
}

const INITIAL_TRIGGER_STATE: TriggerState = { status: 'idle', message: null }

// ---------------------------------------------------------------------------
// OnboardingStoryTab (Main Export)
// ---------------------------------------------------------------------------

export function OnboardingStoryTab() {
  const { selectedUserId } = useSelectedUserId()
  const { v1Data, v2Data, isLoading, error } = useUserData()

  // Per-step trigger states
  const [triggerStates, setTriggerStates] = useState<Record<number, TriggerState>>({})

  const getTriggerState = useCallback(
    (stepId: number): TriggerState => triggerStates[stepId] ?? INITIAL_TRIGGER_STATE,
    [triggerStates]
  )

  const setStepTriggerState = useCallback((stepId: number, state: TriggerState) => {
    setTriggerStates((prev) => ({ ...prev, [stepId]: state }))
  }, [])

  // Handle trigger sync for a step
  const handleTriggerSync = useCallback(
    async (step: OnboardingStep) => {
      if (!selectedUserId) return

      setStepTriggerState(step.id, { status: 'processing', message: 'Triggering sync...' })

      try {
        const body: Record<string, unknown> = { user_id: selectedUserId }

        // Network downline needs skip_job_check for standalone testing
        if (step.id === 6) {
          body.skip_job_check = true
        }

        const res = await fetch(`${WORKERS_BASE}${step.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const text = await res.text().catch(() => 'Unknown error')
          setStepTriggerState(step.id, {
            status: 'error',
            message: `HTTP ${res.status}: ${text.slice(0, 200)}`,
          })
          return
        }

        const data = await res.json()
        const resultMessage =
          data?.function_result?.data?.message ??
          data?.function_result?.message ??
          'Sync triggered successfully'

        setStepTriggerState(step.id, { status: 'success', message: resultMessage })

        // Reset to idle after a few seconds so subsequent checks use live data
        setTimeout(() => {
          setStepTriggerState(step.id, INITIAL_TRIGGER_STATE)
        }, 5000)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Network error'
        setStepTriggerState(step.id, { status: 'error', message })
      }
    },
    [selectedUserId, setStepTriggerState]
  )

  // -- No user selected --
  if (selectedUserId === null) {
    return <EmptyState />
  }

  // -- Error --
  if (error && !isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-error-bg)]">
            <AlertCircle className="h-6 w-6 text-[var(--status-error)]" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Failed to Load User Data</h3>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // -- Loading --
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Compute statuses for all steps
  const stepStatuses = ONBOARDING_STEPS.map((step) => ({
    step,
    status: deriveStepStatus(step, v1Data, v2Data, getTriggerState(step.id)),
  }))

  const completedCount = stepStatuses.filter((s) => s.status === 'complete').length
  const overallProgress = Math.round((completedCount / ONBOARDING_STEPS.length) * 100)

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Onboarding Journey - User #{selectedUserId}</CardTitle>
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-mono tabular-nums',
                overallProgress === 100
                  ? 'border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]'
                  : 'border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info)]'
              )}
            >
              {completedCount}/{ONBOARDING_STEPS.length} steps
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Overall Progress</span>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {overallProgress}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Step indicator row */}
          <div className="flex items-center justify-between">
            {stepStatuses.map(({ step, status }, idx) => {
              const config = getStatusConfig(status)
              const StatusIcon = config.icon
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                        status === 'complete' &&
                          'border-[var(--status-success)] bg-[var(--status-success-bg)]',
                        status === 'processing' &&
                          'border-[var(--status-warning)] bg-[var(--status-warning-bg)]',
                        status === 'error' &&
                          'border-[var(--status-error)] bg-[var(--status-error-bg)]',
                        status === 'pending' &&
                          'border-[var(--status-pending)] bg-[var(--status-pending-bg)]'
                      )}
                    >
                      <StatusIcon
                        className={cn(
                          'h-4 w-4',
                          config.color,
                          status === 'processing' && 'animate-spin'
                        )}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight max-w-[60px]">
                      {step.name}
                    </span>
                  </div>
                  {/* Connector line */}
                  {idx < stepStatuses.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 w-8 mx-1 mt-[-14px]',
                        status === 'complete'
                          ? 'bg-[var(--status-success)]'
                          : 'bg-[var(--status-pending-border)]'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step details (collapsible cards) */}
      <div className="space-y-2">
        {stepStatuses.map(({ step, status }) => (
          <StepCard
            key={step.id}
            step={step}
            status={status}
            triggerState={getTriggerState(step.id)}
            v1Data={v1Data}
            v2Data={v2Data}
            onTriggerSync={() => handleTriggerSync(step)}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StepCard - Collapsible card for each onboarding step
// ---------------------------------------------------------------------------

interface StepCardProps {
  step: OnboardingStep
  status: StepStatus
  triggerState: TriggerState
  v1Data: ReturnType<typeof useUserData>['v1Data']
  v2Data: ReturnType<typeof useUserData>['v2Data']
  onTriggerSync: () => void
}

function StepCard({ step, status, triggerState, v1Data, v2Data, onTriggerSync }: StepCardProps) {
  const [open, setOpen] = useState(false)
  const config = getStatusConfig(status)
  const StepIcon = step.icon
  const counts = getStepCounts(step, v1Data, v2Data)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={cn('transition-colors', open && config.border)}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors rounded-xl">
            {open ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}

            {/* Step icon with status background */}
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full shrink-0',
                config.bg
              )}
            >
              <StepIcon className={cn('h-3.5 w-3.5', config.color)} />
            </div>

            {/* Step label */}
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">
                Step {step.id}: {step.name}
              </span>
            </div>

            {/* Status badge */}
            <Badge
              variant="outline"
              className={cn('text-xs shrink-0', config.border, config.bg, config.color)}
            >
              {config.label}
            </Badge>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-4 py-4 space-y-4">
            {/* Description */}
            <p className="text-sm text-muted-foreground">{step.description}</p>

            {/* Tables involved */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Tables</h4>
              <div className="flex flex-wrap gap-1.5">
                {step.tables.map((table) => (
                  <Badge key={table} variant="secondary" className="text-xs font-mono">
                    <Database className="h-3 w-3" />
                    {table}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Endpoint */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Worker Endpoint</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                POST {step.endpoint}
              </code>
            </div>

            {/* V1/V2 Record Counts */}
            {counts.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Record Counts</h4>
                <div className="rounded-lg border overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 text-xs px-3 py-2 bg-muted/30">
                    <span className="font-medium text-muted-foreground">Entity</span>
                    <span className="font-medium text-muted-foreground text-right">V1</span>
                    <span className="font-medium text-muted-foreground text-right">V2</span>
                    <span className="font-medium text-muted-foreground text-right">Delta</span>
                  </div>
                  {counts.map((c) => {
                    const delta = c.v1 !== null && c.v2 !== null ? c.v2 - c.v1 : null
                    return (
                      <div
                        key={c.key}
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 text-xs px-3 py-1.5 border-t"
                      >
                        <span className="font-medium capitalize">{c.key}</span>
                        <span className="font-mono tabular-nums text-right text-muted-foreground">
                          {c.v1 !== null ? c.v1.toLocaleString() : '--'}
                        </span>
                        <span className="font-mono tabular-nums text-right text-muted-foreground">
                          {c.v2 !== null ? c.v2.toLocaleString() : '--'}
                        </span>
                        <span
                          className={cn(
                            'font-mono tabular-nums text-right',
                            delta === null
                              ? 'text-muted-foreground'
                              : delta === 0
                                ? 'text-[var(--status-success)]'
                                : 'text-[var(--status-warning)]'
                          )}
                        >
                          {delta === null
                            ? '--'
                            : delta === 0
                              ? '0'
                              : delta > 0
                                ? `+${delta}`
                                : delta}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Error message */}
            {triggerState.status === 'error' && triggerState.message && (
              <div className="rounded-lg border border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-3 py-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-[var(--status-error)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[var(--status-error)]">Sync Error</p>
                    <p className="text-xs text-[var(--status-error)] mt-0.5 break-all">
                      {triggerState.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success message */}
            {triggerState.status === 'success' && triggerState.message && (
              <div className="rounded-lg border border-[var(--status-success-border)] bg-[var(--status-success-bg)] px-3 py-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-success)] mt-0.5 shrink-0" />
                  <p className="text-xs text-[var(--status-success)]">{triggerState.message}</p>
                </div>
              </div>
            )}

            {/* Trigger Sync button */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onTriggerSync()
                }}
                disabled={triggerState.status === 'processing'}
                className="gap-1.5"
              >
                {triggerState.status === 'processing' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                {triggerState.status === 'processing' ? 'Syncing...' : 'Trigger Sync'}
              </Button>
              {step.id === 6 && (
                <span className="text-[10px] text-muted-foreground">
                  Processes 100 records per call
                </span>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No User Selected</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Select a user from the picker above to view their onboarding journey. The 6-step process
          tracks team data, agent profiles, transactions, listings, contributions, and network
          synchronization.
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

// ---------------------------------------------------------------------------
// LoadingSkeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-2 w-full mb-4 rounded-full" />
          <div className="flex items-center justify-between">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step card skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <div className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}
