'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code,
  HelpCircle,
  Server,
  Shield,
  Wrench,
  Layers,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  MCP_ENDPOINTS,
  MCP_BASES,
  getEndpointsByGroup,
  type MCPEndpoint,
} from '@/lib/mcp-endpoints'
import { API_GROUPS_DATA } from '@/lib/v2-data'
import { ALL_FRONTEND_ENDPOINTS } from '@/lib/frontend-api-v2-endpoints'
import { validationConfig } from '@/validation.config'
import {
  V2_TASKS_TOTAL,
  V2_TASKS_PASSING,
  V2_WORKERS_TOTAL,
  V2_ACTIVE_FUNCTIONS,
} from '@/lib/dashboard-constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// ---------------------------------------------------------------------------
// Constants & Types
// ---------------------------------------------------------------------------

type HealthStatus = 'working' | 'broken' | 'unknown'

interface APIGroupInfo {
  key: keyof typeof MCP_BASES
  label: string
  description: string
  endpoints: MCPEndpoint[]
}

// Derive function/endpoint counts from validation.config.ts (single source of truth)
const fnStage = validationConfig.stages.find((s) => s.id === 'functions')!
const epStage = validationConfig.stages.find((s) => s.id === 'endpoints')!

const V2_FN = {
  TOTAL_ALL: fnStage.metrics.total, // From validation.config.ts
  ACTIVE: fnStage.metrics.tested!, // Active functions tested (from validation.config.ts)
  TASKS_TOTAL: V2_TASKS_TOTAL, // From dashboard-constants.ts
  TASKS_PASSING: V2_TASKS_PASSING, // From dashboard-constants.ts
  WORKERS_TOTAL: V2_WORKERS_TOTAL, // From dashboard-constants.ts
  TOTAL_ENDPOINTS: epStage.metrics.total, // From validation.config.ts
  CRITICAL_FIXES: 3, // From known fixes documentation
  get ACTIVE_TOTAL() {
    return V2_ACTIVE_FUNCTIONS
  },
  get TASKS_PASS_RATE() {
    return Math.round((V2_TASKS_PASSING / V2_TASKS_TOTAL) * 100)
  },
}

/** Endpoints known to be broken from CLAUDE.md / mcp-endpoints.ts gap notes */
const KNOWN_BROKEN_ENDPOINTS = new Set([
  '/job-queue-status', // 404 - Xano function not created
  '/seed/demo-dataset', // 500 - Invalid name: mvpw5:0
  '/seed/team/count', // 500 - Invalid name: mvpw5:365
  '/clear/all', // 500 - Seeding function issue
  '/test-task-7977', // Timeout issues
  '/backfill-all-updated-at', // Timeout issues
])

/** Endpoints verified working from audit (32/38 pass rate) */
const KNOWN_WORKING_ENDPOINTS = new Set([
  '/test-function-8066-team-roster',
  '/test-function-8062-network-downline',
  '/test-function-8052-txn-sync',
  '/test-function-8053-listings-sync',
  '/test-function-8054-listings-update',
  '/test-function-8051-agent-data',
  '/test-function-8055-equity',
  '/test-function-8056-contributions',
  '/test-function-8057-stage-contributions',
  '/test-function-8058-network-cap',
  '/test-function-8059-network-frontline',
  '/test-function-8060-load-contributions',
  '/test-function-8061-contributors',
  '/test-function-8065-fub-calls',
  '/test-rezen-team-roster-sync',
  '/test-function-8067-onboarding-appointments',
  '/test-function-8068-cap-data',
  '/test-function-8069-equity-ob',
  '/test-function-8070-sponsor-tree',
  '/test-function-8071-revshare-totals',
  '/test-function-8072-pending-contributions',
  '/test-function-8073-contributions',
  '/test-function-8118-lambda-coordinator',
  '/test-function-10022-get-deals',
  '/test-task-8022',
  '/test-task-8023',
  '/test-task-8024',
  '/test-task-8025',
  '/test-task-8026',
  '/test-task-8027',
  '/test-task-8028',
  '/test-task-8029',
  '/test-task-8030',
  '/test-skyslope-account-users-sync',
  '/test-function-7960-daily-update-people',
  '/table-counts',
  '/staging-status',
  '/onboarding-status',
  '/staging-unprocessed',
  '/reset-transaction-errors',
  '/trigger-sponsor-tree',
  '/clear-user-data',
  '/seed/user/count',
  '/seed/agent/count',
  '/seed/transaction/count',
  '/seed/network/count',
  '/seed/listing/count',
  '/auth/login',
  '/auth/me',
  '/auth/logout',
  '/auth/refresh',
  '/trigger-rezen-create-onboarding-job',
  '/admin/trigger-onboarding',
  '/trigger-rezen-onboarding-orchestrator',
])

const HEALTH_CONFIG: Record<
  HealthStatus,
  { label: string; bg: string; text: string; border: string; icon: typeof CheckCircle2 }
> = {
  working: {
    label: 'Working',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  broken: {
    label: 'Broken',
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/20',
    icon: AlertCircle,
  },
  unknown: {
    label: 'Unknown',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-500 dark:text-zinc-400',
    border: 'border-zinc-500/20',
    icon: HelpCircle,
  },
}

const BUG_FIX_STORIES = [
  {
    title: 'Team Roster Sync',
    function: '#8066',
    date: 'February 2026',
    rootCause:
      'V2 function was querying a table named "user_credentials" that had been renamed to "credentials" during normalization. Additionally, it was reading agent_id from the user record (always 1) instead of the credentials record (37208).',
    fix: 'Updated table reference to "credentials", corrected agent_id lookup path, and added safe property access for lambda error results.',
    result: 'Successfully returns team roster with teams_processed count. Tested with User #7.',
  },
  {
    title: 'Network Downline Import',
    function: '#8062',
    date: 'February 2026',
    rootCause:
      'The Worker function (#5530) was using V1 table names ("network") that don\'t exist in V2, and the JOIN syntax had an empty table reference causing "missing bind parameter" errors.',
    fix: 'Created new Worker function #11253 using V2 schema (network_member table). Added skip_job_check parameter for standalone testing. Processes in batches of 100 records.',
    result:
      'Can now import full network downlines by calling repeatedly. Handles networks of 1,000+ members.',
  },
  {
    title: 'FUB Lambda Coordinator',
    function: '#8118',
    date: 'January 2026',
    rootCause:
      'Endpoint required "ad_user_id" parameter (Agent Dashboards user ID) instead of the standard "user_id", plus an "endpoint_type" parameter that wasn\'t documented.',
    fix: 'Discovered correct parameter names through testing. Endpoint now accepts ad_user_id + endpoint_type (people, events, calls, appointments, deals, textMessages).',
    result: 'All 6 FUB data types can now be synced through the lambda coordinator.',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEndpointHealth(endpoint: MCPEndpoint): HealthStatus {
  if (KNOWN_BROKEN_ENDPOINTS.has(endpoint.endpoint)) return 'broken'
  if (KNOWN_WORKING_ENDPOINTS.has(endpoint.endpoint)) return 'working'
  return 'unknown'
}

function buildGroupInfoList(): APIGroupInfo[] {
  const groups: APIGroupInfo[] = (Object.keys(MCP_BASES) as Array<keyof typeof MCP_BASES>).map(
    (key) => {
      const endpoints = getEndpointsByGroup(key)
      const friendlyNames: Record<string, string> = {
        TASKS: 'Background Tasks',
        WORKERS: 'Data Sync Workers',
        SYSTEM: 'System & Diagnostics',
        SEEDING: 'Test Data & Cleanup',
        AUTH: 'Authentication',
        FRONTEND: 'Frontend API v2',
      }
      const descriptions: Record<string, string> = {
        TASKS: 'Manage and process background jobs (imports, syncs, aggregations)',
        WORKERS: 'Per-user data synchronization from external sources (reZEN, FUB)',
        SYSTEM: 'System health, admin tools, and diagnostic endpoints',
        SEEDING: 'Set up test data and clean up for fresh testing',
        AUTH: 'User login, sessions, and token management',
        FRONTEND: 'Production frontend data endpoints (800+ routes)',
      }
      return {
        key,
        label: friendlyNames[key] ?? key,
        description: descriptions[key] ?? '',
        endpoints,
      }
    }
  )
  return groups
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HealthBadge({ status }: { status: HealthStatus }) {
  const cfg = HEALTH_CONFIG[status]
  const Icon = cfg.icon
  return (
    <Badge variant="outline" className={cn('text-xs gap-1', cfg.bg, cfg.text, cfg.border)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: number | string
  sub?: string
  icon: typeof Activity
  accent: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={cn('rounded-lg p-2', accent)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ArchitectureSplitCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Tasks/ vs Workers/ — The Architecture Split
        </CardTitle>
        <CardDescription>
          The key structural improvement in V2: separating orchestration from execution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* V1 Pattern */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs"
              >
                V1 Pattern
              </Badge>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Problem
              </span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
                <span>Everything in one pile — sync, transform, orchestrate mixed together</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
                <span>Cron jobs directly call complex functions</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
                <span>When one breaks, hard to isolate which layer failed</span>
              </li>
            </ul>
          </div>

          {/* V2 Pattern */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
              >
                V2 Pattern
              </Badge>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Solution
              </span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>{V2_FN.TASKS_TOTAL} Tasks/</strong> — lightweight orchestrators (validate,
                  dispatch)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>{V2_FN.WORKERS_TOTAL} Workers/</strong> — pure business logic (transform,
                  write)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                <span>Clear 1:1 mapping: each cron job calls 1 Task, which calls 1+ Workers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Execution Flow
          </p>
          <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
            <span className="rounded-md border bg-card px-3 py-1.5 font-medium">Scheduled Job</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 font-medium text-blue-600 dark:text-blue-400">
              Task/ (orchestrate)
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 font-medium text-violet-600 dark:text-violet-400">
              Worker/ (execute)
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="rounded-md border bg-card px-3 py-1.5 font-medium">Database</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BugFixCard({ story }: { story: (typeof BUG_FIX_STORIES)[number] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-base">
                      {story.title}{' '}
                      <span className="text-muted-foreground font-normal text-sm">
                        (Function {story.function})
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">{story.date}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Fixed
                </Badge>
              </div>
            </CardHeader>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Root Cause
              </p>
              <p className="text-sm text-muted-foreground">{story.rootCause}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Fix Applied
              </p>
              <p className="text-sm text-muted-foreground">{story.fix}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Result
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{story.result}</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function APIGroupCard({ group }: { group: APIGroupInfo }) {
  const [isOpen, setIsOpen] = useState(false)
  const healthCounts = useMemo(() => {
    const counts: Record<HealthStatus, number> = { working: 0, broken: 0, unknown: 0 }
    for (const ep of group.endpoints) {
      counts[getEndpointHealth(ep)]++
    }
    return counts
  }, [group.endpoints])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-base">{group.label}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {group.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs tabular-nums shrink-0">
                  {group.endpoints.length} endpoints
                </Badge>
              </div>
              {/* Health summary bar */}
              <div className="flex items-center gap-3 mt-2 ml-6">
                {healthCounts.working > 0 && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {healthCounts.working}
                  </span>
                )}
                {healthCounts.broken > 0 && (
                  <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    {healthCounts.broken}
                  </span>
                )}
                {healthCounts.unknown > 0 && (
                  <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <HelpCircle className="h-3 w-3" />
                    {healthCounts.unknown}
                  </span>
                )}
              </div>
            </CardHeader>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Endpoint list — no base URL exposed */}
            <div className="space-y-1.5">
              {group.endpoints.map((ep) => {
                const health = getEndpointHealth(ep)
                return (
                  <div
                    key={ep.endpoint}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg border text-sm',
                      HEALTH_CONFIG[health].bg,
                      HEALTH_CONFIG[health].border
                    )}
                  >
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] font-mono w-12 justify-center"
                    >
                      {ep.method}
                    </Badge>
                    <span className="font-mono text-xs flex-1 truncate">{ep.endpoint}</span>
                    <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[200px]">
                      {ep.taskName}
                    </span>
                    <HealthBadge status={health} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function FunctionsStoryTab() {
  const groups = useMemo(() => buildGroupInfoList(), [])

  // Aggregate health stats across all tracked MCP endpoints
  const healthStats = useMemo(() => {
    const counts: Record<HealthStatus, number> = { working: 0, broken: 0, unknown: 0 }
    for (const ep of MCP_ENDPOINTS) {
      counts[getEndpointHealth(ep)]++
    }
    return counts
  }, [])

  const totalTracked = MCP_ENDPOINTS.length
  const healthRate = totalTracked > 0 ? Math.round((healthStats.working / totalTracked) * 100) : 0
  const frontendEndpointCount = ALL_FRONTEND_ENDPOINTS.length
  const testableTotal = frontendEndpointCount + totalTracked

  // V2 API groups from workspace data
  const v2ApiGroupCount = API_GROUPS_DATA.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Function Health</h2>
        <p className="text-sm text-muted-foreground">
          V2 backend functions, architecture patterns, and endpoint health — sourced from
          validation.config.ts
        </p>
      </div>

      {/* Section 1: Hero Cards — The Scale */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard
          label="Total Functions"
          value={V2_FN.TOTAL_ALL}
          sub="V2 workspace (active + archived)"
          icon={Code}
          accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <SummaryCard
          label="Active Functions"
          value={V2_FN.ACTIVE_TOTAL}
          sub={`${V2_FN.TASKS_TOTAL} Tasks/ + ${V2_FN.WORKERS_TOTAL} Workers/`}
          icon={Layers}
          accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <SummaryCard
          label="API Endpoints"
          value={V2_FN.TOTAL_ENDPOINTS}
          sub={`${testableTotal} testable (${frontendEndpointCount} Frontend + ${totalTracked} Admin)`}
          icon={Server}
          accent="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
        />
        <SummaryCard
          label="Admin Health"
          value={`${healthStats.working}/${totalTracked}`}
          sub={`${healthRate}% verified working`}
          icon={Activity}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <SummaryCard
          label="Bug Fixes Shipped"
          value={V2_FN.CRITICAL_FIXES}
          sub="Jan-Feb 2026 production fixes"
          icon={Wrench}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Section 2: Architecture Split */}
      <ArchitectureSplitCard />

      {/* Section 3: Bug Fix Stories */}
      <div>
        <h3 className="text-sm font-semibold text-foreground/80 mb-3">
          Production Bug Fixes — The Proof
        </h3>
        <div className="space-y-3">
          {BUG_FIX_STORIES.map((story) => (
            <BugFixCard key={story.function} story={story} />
          ))}
        </div>
      </div>

      {/* Section 4: Endpoint Health Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Endpoint Health Overview</CardTitle>
          <CardDescription>
            {healthStats.working} verified working, {healthStats.broken} broken/timeout,{' '}
            {healthStats.unknown} untested of {totalTracked} admin endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stacked bar */}
          <div className="flex h-4 w-full overflow-hidden rounded-full">
            {healthStats.working > 0 && (
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${(healthStats.working / totalTracked) * 100}%` }}
              />
            )}
            {healthStats.broken > 0 && (
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${(healthStats.broken / totalTracked) * 100}%` }}
              />
            )}
            {healthStats.unknown > 0 && (
              <div
                className="bg-zinc-300 dark:bg-zinc-600 transition-all"
                style={{ width: `${(healthStats.unknown / totalTracked) * 100}%` }}
              />
            )}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Working ({healthStats.working})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              Broken ({healthStats.broken})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              Unknown ({healthStats.unknown})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Service Group Cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground/80 mb-3">Service Groups</h3>
        <div className="space-y-3">
          {groups.map((group) => (
            <APIGroupCard key={group.key} group={group} />
          ))}
        </div>
      </div>

      {/* Section 6: V2 Service Group Inventory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">V2 Service Group Inventory</CardTitle>
          <CardDescription>
            All {v2ApiGroupCount} service groups in the V2 workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {API_GROUPS_DATA.map((group) => {
              const isLegacy = group.name.includes('Legacy')
              const isDelete = group.name.includes('Delete')
              const isMcp = group.name.includes('MCP')
              const isWebhook = group.name.includes('Webhook')
              return (
                <div
                  key={group.api_group_id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg border text-sm',
                    isDelete
                      ? 'bg-red-500/5 border-red-500/10'
                      : isLegacy
                        ? 'bg-amber-500/5 border-amber-500/10'
                        : isMcp
                          ? 'bg-blue-500/5 border-blue-500/10'
                          : isWebhook
                            ? 'bg-violet-500/5 border-violet-500/10'
                            : 'bg-card border-border/60'
                  )}
                >
                  <Shield className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 font-medium truncate">{group.name}</span>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    api:{group.canonical}
                  </span>
                  {isLegacy && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20"
                    >
                      Legacy
                    </Badge>
                  )}
                  {isDelete && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-red-500/10 text-red-600 border-red-500/20"
                    >
                      Deprecated
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
