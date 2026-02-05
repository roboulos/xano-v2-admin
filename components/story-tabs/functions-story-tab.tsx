'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code,
  HelpCircle,
  Server,
  Shield,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  MCP_ENDPOINTS,
  MCP_BASES,
  getEndpointsByGroup,
  type MCPEndpoint,
} from '@/lib/mcp-endpoints'
import { API_GROUPS_DATA } from '@/lib/v2-data'
import { V1_TABLES } from '@/lib/v1-data'
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
  baseUrl: string
  description: string
  endpoints: MCPEndpoint[]
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

// V1 function categories for the comparison section
const V1_FUNCTION_CATEGORIES = [
  { name: 'Sync Workers', count: 28, description: 'Data sync from external APIs' },
  { name: 'Aggregation', count: 48, description: 'Pre-computed dashboard rollups' },
  { name: 'Auth & Security', count: 12, description: 'Authentication and 2FA' },
  { name: 'Utility / Helpers', count: 35, description: 'Shared helper functions' },
  { name: 'Webhooks', count: 8, description: 'Inbound webhook handlers' },
  { name: 'Page Builder', count: 22, description: 'Dynamic page/widget system' },
  { name: 'Charts / Analytics', count: 18, description: 'Chart data endpoints' },
  { name: 'Lambda / Jobs', count: 15, description: 'Background job orchestration' },
  { name: 'Other', count: 84, description: 'Misc business logic' },
]
const V1_TOTAL_FUNCTIONS = V1_FUNCTION_CATEGORIES.reduce((s, c) => s + c.count, 0)

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
        TASKS: 'MCP: Tasks',
        WORKERS: 'MCP: Workers',
        SYSTEM: 'MCP: System',
        SEEDING: 'MCP: Seeding',
        AUTH: 'Auth',
        FRONTEND: 'Frontend API v2',
      }
      const descriptions: Record<string, string> = {
        TASKS: 'Orchestrators that poll for and process background jobs',
        WORKERS: 'Individual per-user data sync processors',
        SYSTEM: 'System status, admin, and diagnostic endpoints',
        SEEDING: 'Test data seeding and cleanup utilities',
        AUTH: 'Authentication, token management, user session',
        FRONTEND: 'Production frontend data endpoints (800+ routes)',
      }
      return {
        key,
        label: friendlyNames[key] ?? key,
        baseUrl: MCP_BASES[key],
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
            {/* Base URL */}
            <p className="text-xs text-muted-foreground font-mono mb-3 truncate">{group.baseUrl}</p>
            {/* Endpoint list */}
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

  // Aggregate health stats across all tracked endpoints
  const healthStats = useMemo(() => {
    const counts: Record<HealthStatus, number> = { working: 0, broken: 0, unknown: 0 }
    for (const ep of MCP_ENDPOINTS) {
      counts[getEndpointHealth(ep)]++
    }
    return counts
  }, [])

  const totalTracked = MCP_ENDPOINTS.length
  const healthRate = totalTracked > 0 ? Math.round((healthStats.working / totalTracked) * 100) : 0

  // V2 API groups from workspace data
  const v2ApiGroupCount = API_GROUPS_DATA.length
  const v2TableCount = 193

  // V1 stats
  const v1TableCount = V1_TABLES.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Function Health</h2>
        <p className="text-sm text-muted-foreground">
          V2 function inventory grouped by API group with endpoint health status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Tracked Endpoints"
          value={totalTracked}
          sub={`across ${groups.length} API groups`}
          icon={Server}
          accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <SummaryCard
          label="Health Rate"
          value={`${healthRate}%`}
          sub={`${healthStats.working} working`}
          icon={Activity}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <SummaryCard
          label="Broken / Timeout"
          value={healthStats.broken}
          sub="known issues"
          icon={AlertCircle}
          accent="bg-red-500/10 text-red-600 dark:text-red-400"
        />
        <SummaryCard
          label="V2 API Groups"
          value={v2ApiGroupCount}
          sub={`${v2TableCount} tables`}
          icon={Code}
          accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* Health Overview Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Endpoint Health Overview</CardTitle>
          <CardDescription>
            {healthStats.working} verified working, {healthStats.broken} broken/timeout,{' '}
            {healthStats.unknown} untested of {totalTracked} tracked endpoints
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

      {/* API Group Cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground/80 mb-3">API Groups</h3>
        <div className="space-y-3">
          {groups.map((group) => (
            <APIGroupCard key={group.key} group={group} />
          ))}
        </div>
      </div>

      {/* V1 vs V2 Function Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">V1 vs V2 Function Comparison</CardTitle>
          <CardDescription>
            High-level migration coverage across function categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top-level stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">V1 Tables</p>
              <p className="text-xl font-bold tabular-nums">{v1TableCount}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">V2 Tables</p>
              <p className="text-xl font-bold tabular-nums">{v2TableCount}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                V1 Functions (est.)
              </p>
              <p className="text-xl font-bold tabular-nums">{V1_TOTAL_FUNCTIONS}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">V2 Functions</p>
              <p className="text-xl font-bold tabular-nums">270</p>
              <p className="text-[10px] text-muted-foreground">active</p>
            </div>
          </div>

          {/* Coverage bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Migration Coverage</span>
              <span className="font-medium tabular-nums">
                {Math.round((270 / V1_TOTAL_FUNCTIONS) * 100)}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.round((270 / V1_TOTAL_FUNCTIONS) * 100)}%` }}
              />
            </div>
          </div>

          {/* V1 function categories */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              V1 Function Categories
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {V1_FUNCTION_CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <Badge variant="secondary" className="tabular-nums text-xs shrink-0">
                    {cat.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* V2 API Group Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">V2 API Group Inventory</CardTitle>
          <CardDescription>All {v2ApiGroupCount} API groups from the V2 workspace</CardDescription>
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
