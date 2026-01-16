"use client"

import { useState, useCallback, useEffect } from "react"
import {
  ChevronDown,
  ChevronRight,
  Database,
  Zap,
  Users,
  ArrowRight,
  Layers,
  Box,
  GitBranch,
  Play,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
  Copy,
  Check,
  Building2,
  Phone,
  FileText,
  User,
  Crown,
  Network,
  Key
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MCP_BASES } from "@/lib/mcp-endpoints"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// =============================================================================
// TYPES
// =============================================================================

interface CallChain {
  id: string
  name: string
  type: "background" | "task" | "worker" | "utility"
  schedule?: string
  calls?: CallChain[]
  tables?: string[]
  description?: string
  endpoint?: string
  apiGroup?: "TASKS" | "WORKERS" | "SYSTEM"
  requiresUserId?: boolean
}

interface TableInfo {
  name: string
  count: string
  purpose: string
  liveCount?: number
  loading?: boolean
}

// Demo user personas from v0-demo-sync-admin-interface
interface DemoUser {
  id: number
  name: string
  email: string
  sourceUser: string
  type: "team-owner" | "team-member" | "network-builder"
  role: string
  description: string
  teamName?: string
  apiKeys: {
    rezen: boolean
    fub: boolean
    skyslope: boolean
  }
  dataAccess: {
    roster: boolean
    listings: boolean
    transactions: boolean
    network: boolean
    leads: boolean
  }
  queryPattern: string
  stats: {
    teamMembers?: number
    networkAgents?: number
    transactions?: number
    listings?: number
  }
}

interface TableGroup {
  id: string
  name: string
  description: string
  color: string
  icon: string
  tables: TableInfo[]
}

interface RunStatus {
  [key: string]: "idle" | "running" | "success" | "error"
}

interface TableCounts {
  [tableName: string]: number
}

// =============================================================================
// DEMO USER DATA (from v0-demo-sync-admin-interface CLAUDE.md)
// =============================================================================

// V2 Test User - David Keener (User 60) is the primary test user for this workspace
const DEMO_USERS: DemoUser[] = [
  {
    id: 60,
    name: "David Keener",
    email: "Dave@premieregrp.com",
    sourceUser: "David Keener",
    type: "team-owner",
    role: "Admin / Team Owner",
    description: "Full access to roster, listings, transactions, network. Primary V2 test user.",
    teamName: "PREMIERE GROUP",
    apiKeys: { rezen: true, fub: true, skyslope: true },
    dataAccess: { roster: true, listings: true, transactions: true, network: true, leads: true },
    queryPattern: "Queries by team_id=1, agent_id=37208",
    stats: { teamMembers: 280, networkAgents: 399, transactions: 3743, listings: 48 }
  }
]

// =============================================================================
// THE MACHINE DATA
// =============================================================================

const CALL_CHAINS: CallChain[] = [
  {
    id: "rezen-transactions",
    name: "reZEN - Process Transactions",
    type: "background",
    schedule: "Every 6hr",
    description: "Sync all transaction data from reZEN API",
    endpoint: "/test-task-8023",
    apiGroup: "TASKS",
    calls: [
      {
        id: "task-8023",
        name: "Tasks/reZEN - Process Transactions",
        type: "task",
        description: "Orchestrates transaction sync across all agents",
        endpoint: "/test-task-8023",
        apiGroup: "TASKS",
        calls: [
          {
            id: "worker-8052",
            name: "Workers/reZEN - Transactions Sync",
            type: "worker",
            description: "Per-agent sync (145 parallel)",
            tables: ["agent_rezen_transactions", "transaction", "participant"],
            endpoint: "/test-function-8052-txn-sync",
            apiGroup: "WORKERS",
            requiresUserId: true,
            calls: [
              {
                id: "util-dedupe",
                name: "Workers/Dedupe by External ID",
                type: "utility",
                description: "Ensures no duplicates via rezen_txn_id"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "rezen-listings",
    name: "reZEN - Process Listings",
    type: "background",
    schedule: "Every 6hr",
    description: "Sync property listings from reZEN",
    endpoint: "/test-task-8024",
    apiGroup: "TASKS",
    calls: [
      {
        id: "task-8024",
        name: "Tasks/reZEN - Process Listings",
        type: "task",
        endpoint: "/test-task-8024",
        apiGroup: "TASKS",
        calls: [
          {
            id: "worker-8053",
            name: "Workers/reZEN - Listings Sync",
            type: "worker",
            tables: ["listing"],
            endpoint: "/test-function-8053-listings-sync",
            apiGroup: "WORKERS",
            requiresUserId: true
          },
          {
            id: "worker-8054",
            name: "Workers/reZEN - Listings Update",
            type: "worker",
            tables: ["listing"],
            endpoint: "/test-function-8054-listings-update",
            apiGroup: "WORKERS",
            requiresUserId: true
          }
        ]
      }
    ]
  },
  {
    id: "rezen-network",
    name: "reZEN - Process Network",
    type: "background",
    schedule: "Every 6hr",
    description: "Sync network downline and sponsorship tree",
    endpoint: "/test-task-8025",
    apiGroup: "TASKS",
    calls: [
      {
        id: "task-8025",
        name: "Tasks/reZEN - Process Network",
        type: "task",
        endpoint: "/test-task-8025",
        apiGroup: "TASKS",
        calls: [
          {
            id: "worker-8062",
            name: "Workers/reZEN - Network Downline",
            type: "worker",
            tables: ["network"],
            endpoint: "/test-function-8062-network-downline",
            apiGroup: "WORKERS",
            requiresUserId: true
          },
          {
            id: "worker-8070",
            name: "Workers/reZEN - Sponsor Tree",
            type: "worker",
            tables: ["network"],
            endpoint: "/test-function-8070-sponsor-tree",
            apiGroup: "WORKERS",
            requiresUserId: true
          }
        ]
      }
    ]
  },
  {
    id: "rezen-contributions",
    name: "reZEN - Process Contributions",
    type: "background",
    schedule: "Every 6hr",
    description: "Sync revenue share and contribution data",
    endpoint: "/test-task-8026",
    apiGroup: "TASKS",
    calls: [
      {
        id: "task-8026",
        name: "Tasks/reZEN - Process Contributions",
        type: "task",
        endpoint: "/test-task-8026",
        apiGroup: "TASKS",
        calls: [
          {
            id: "worker-8056",
            name: "Workers/reZEN - Contributions",
            type: "worker",
            tables: ["contribution", "revshare_totals"],
            endpoint: "/test-function-8056-contributions",
            apiGroup: "WORKERS",
            requiresUserId: true
          },
          {
            id: "worker-8071",
            name: "Workers/reZEN - RevShare Totals",
            type: "worker",
            tables: ["revshare_totals"],
            endpoint: "/test-function-8071-revshare-totals",
            apiGroup: "WORKERS",
            requiresUserId: true
          }
        ]
      }
    ]
  },
  {
    id: "fub-daily",
    name: "FUB - Daily Update People",
    type: "background",
    schedule: "Nightly",
    description: "Sync CRM contacts and activity from Follow Up Boss",
    endpoint: "/test-function-7960-daily-update-people",
    apiGroup: "TASKS",
    calls: [
      {
        id: "task-7960",
        name: "Tasks/FUB - Daily Update People",
        type: "task",
        endpoint: "/test-function-7960-daily-update-people",
        apiGroup: "TASKS",
        calls: [
          {
            id: "worker-8118",
            name: "Workers/FUB - Lambda Coordinator",
            type: "worker",
            description: "Spawns AWS Lambda jobs for parallel processing",
            tables: ["fub_people", "fub_calls", "fub_appointments", "fub_events", "fub_texts"],
            endpoint: "/test-function-8118-lambda-coordinator",
            apiGroup: "WORKERS",
            requiresUserId: true
          }
        ]
      }
    ]
  },
  {
    id: "skyslope-sync",
    name: "SkySlope - Account Users Sync",
    type: "background",
    schedule: "Webhook",
    description: "Sync transaction documents on webhook trigger",
    endpoint: "/test-skyslope-account-users-sync",
    apiGroup: "TASKS",
    calls: [
      {
        id: "task-skyslope",
        name: "Tasks/SkySlope - Account Users",
        type: "task",
        tables: ["closing_disclosure"],
        endpoint: "/test-skyslope-account-users-sync",
        apiGroup: "TASKS"
      }
    ]
  },
  {
    id: "aggregation-daily",
    name: "Aggregation - Daily Scheduler",
    type: "background",
    schedule: "Daily 7am",
    description: "Rebuild all pre-computed dashboard aggregations",
    calls: [
      {
        id: "task-agg",
        name: "Tasks/Aggregation - Daily",
        type: "task",
        description: "Triggers rebuilds of all agg_* tables",
        tables: ["agg_revenue_*", "agg_transactions_*", "agg_network_*", "agg_fub_*"]
      }
    ]
  }
]

const TABLE_GROUPS: TableGroup[] = [
  {
    id: "staging",
    name: "STAGING",
    description: "Raw API inbox — safe sandbox for imports",
    color: "amber",
    icon: "inbox",
    tables: [
      { name: "agent_rezen_transactions", count: "temp", purpose: "Raw reZEN transaction imports" },
      { name: "agent_rezen_listings", count: "temp", purpose: "Raw reZEN listing imports" },
      { name: "staging_network", count: "temp", purpose: "Raw network hierarchy imports" },
      { name: "staging_contribution", count: "temp", purpose: "Raw contribution imports" },
    ]
  },
  {
    id: "live",
    name: "LIVE",
    description: "Production truth — verified, deduplicated",
    color: "emerald",
    icon: "database",
    tables: [
      { name: "user", count: "337", purpose: "Login accounts with roles & permissions" },
      { name: "agent", count: "35,526", purpose: "Agent profiles & brokerage data" },
      { name: "transaction", count: "50,000", purpose: "Closed deals & commissions" },
      { name: "participant", count: "660,000", purpose: "Transaction participants & splits" },
      { name: "network", count: "398", purpose: "Sponsorship tree & downline" },
      { name: "listing", count: "varies", purpose: "Active property listings" },
      { name: "team", count: "300+", purpose: "Team entities" },
      { name: "team_roster", count: "270", purpose: "Team membership links" },
      { name: "contribution", count: "varies", purpose: "Revenue share records" },
    ]
  },
  {
    id: "fub",
    name: "FUB",
    description: "Follow Up Boss CRM — contacts & activity",
    color: "violet",
    icon: "users",
    tables: [
      { name: "fub_people", count: "679,977", purpose: "CRM contacts" },
      { name: "fub_calls", count: "166,037", purpose: "Call logs & recordings" },
      { name: "fub_events", count: "897,315", purpose: "Activity events" },
      { name: "fub_appointments", count: "6,787", purpose: "Scheduled appointments" },
      { name: "fub_texts", count: "230,075", purpose: "SMS messages" },
      { name: "fub_deals", count: "varies", purpose: "Deal pipeline" },
    ]
  },
  {
    id: "aggregation",
    name: "AGGREGATION",
    description: "Dashboard cache — pre-computed for speed",
    color: "sky",
    icon: "chart",
    tables: [
      { name: "agg_revenue_by_month", count: "cache", purpose: "Revenue trend charts" },
      { name: "agg_revenue_by_agent", count: "cache", purpose: "Agent revenue rankings" },
      { name: "agg_transactions_by_stage", count: "cache", purpose: "Pipeline visualization" },
      { name: "agg_network_by_tier", count: "cache", purpose: "Network tier breakdown" },
      { name: "agg_fub_calls_by_direction", count: "cache", purpose: "Call analytics" },
    ]
  },
  {
    id: "config",
    name: "CONFIG",
    description: "Settings & subscriptions — system config",
    color: "slate",
    icon: "settings",
    tables: [
      { name: "subscription", count: "varies", purpose: "Stripe billing subscriptions" },
      { name: "team_owners", count: "varies", purpose: "Team ownership records" },
      { name: "directors", count: "varies", purpose: "Director role assignments" },
      { name: "leaders", count: "varies", purpose: "Leader role assignments" },
    ]
  }
]

const USER_JOURNEY = [
  {
    step: 1,
    title: "Agent Signs Up",
    tables: ["user", "agent", "team_roster", "subscription"],
    description: "Creates account, links to team, starts subscription",
    icon: Users
  },
  {
    step: 2,
    title: "Brokerage Connects",
    tables: ["transaction", "listing", "network", "contribution"],
    description: "reZEN syncs their deals, listings, network tree",
    icon: RefreshCw
  },
  {
    step: 3,
    title: "CRM Links",
    tables: ["fub_people", "fub_calls", "fub_appointments"],
    description: "Follow Up Boss syncs contacts & activity",
    icon: Users
  },
  {
    step: 4,
    title: "Dashboard Loads",
    tables: ["agg_revenue_*", "agg_transactions_*", "agg_network_*"],
    description: "Queries pre-computed aggregations for instant load",
    icon: Zap
  }
]

// API Key integration info
const API_INTEGRATIONS = [
  {
    id: "rezen",
    name: "reZEN",
    description: "Real Brokerage API - transactions, listings, network, commissions",
    color: "emerald",
    tables: ["transaction", "listing", "network", "contribution", "participant"]
  },
  {
    id: "fub",
    name: "Follow Up Boss",
    description: "CRM - contacts, calls, appointments, events, texts",
    color: "violet",
    tables: ["fub_people", "fub_calls", "fub_appointments", "fub_events", "fub_texts"]
  },
  {
    id: "skyslope",
    name: "SkySlope",
    description: "Transaction management - documents, disclosures",
    color: "sky",
    tables: ["closing_disclosure"]
  }
]

// =============================================================================
// COMPONENTS
// =============================================================================

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-background/80 transition-colors"
      title="Copy endpoint"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 opacity-50 hover:opacity-100" />
      )}
    </button>
  )
}

function RunButton({
  chain,
  status,
  onRun,
  userId
}: {
  chain: CallChain
  status: "idle" | "running" | "success" | "error"
  onRun: (chain: CallChain) => void
  userId: number
}) {
  if (!chain.endpoint) return null

  const canRun = !chain.requiresUserId || userId > 0

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (canRun && status !== "running") onRun(chain)
            }}
            disabled={!canRun || status === "running"}
            className={cn(
              "p-1.5 rounded-md transition-all",
              status === "running" && "bg-primary/20",
              status === "success" && "bg-green-500/20",
              status === "error" && "bg-red-500/20",
              status === "idle" && canRun && "hover:bg-primary/10 opacity-60 hover:opacity-100",
              !canRun && "opacity-30 cursor-not-allowed"
            )}
          >
            {status === "running" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : status === "error" ? (
              <XCircle className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {!canRun ? (
            <p>Requires user_id (set in context)</p>
          ) : status === "running" ? (
            <p>Running...</p>
          ) : (
            <p>Run {chain.endpoint}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function CallChainNode({
  chain,
  depth = 0,
  runStatus,
  onRun,
  userId
}: {
  chain: CallChain
  depth?: number
  runStatus: RunStatus
  onRun: (chain: CallChain) => void
  userId: number
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const status = runStatus[chain.id] || "idle"

  const typeStyles = {
    background: {
      bg: "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
      border: "border-amber-500/30",
      text: "text-amber-700 dark:text-amber-400",
      icon: "bg-amber-500/20"
    },
    task: {
      bg: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10",
      border: "border-blue-500/30",
      text: "text-blue-700 dark:text-blue-400",
      icon: "bg-blue-500/20"
    },
    worker: {
      bg: "bg-gradient-to-r from-emerald-500/10 to-green-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: "bg-emerald-500/20"
    },
    utility: {
      bg: "bg-slate-500/5",
      border: "border-slate-500/20",
      text: "text-slate-600 dark:text-slate-400",
      icon: "bg-slate-500/10"
    },
  }

  const typeIcons = {
    background: Clock,
    task: Layers,
    worker: Zap,
    utility: Box,
  }

  const style = typeStyles[chain.type]
  const Icon = typeIcons[chain.type]
  const hasChildren = chain.calls && chain.calls.length > 0

  return (
    <div className={cn("relative", depth > 0 && "ml-8 mt-2")}>
      {/* Connection line */}
      {depth > 0 && (
        <>
          <div className="absolute left-[-24px] top-0 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
          <div className="absolute left-[-24px] top-5 w-6 h-px bg-border" />
        </>
      )}

      <div
        className={cn(
          "group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer",
          style.bg,
          style.border,
          "hover:shadow-md hover:scale-[1.01]",
          status === "running" && "ring-2 ring-primary/30",
          status === "success" && "ring-2 ring-green-500/30",
          status === "error" && "ring-2 ring-red-500/30"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Icon */}
        <div className={cn("p-2 rounded-lg flex-shrink-0", style.icon)}>
          <Icon className={cn("h-4 w-4", style.text)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {hasChildren && (
              expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            )}
            <span className={cn("font-semibold text-sm", style.text)}>{chain.name}</span>
            {chain.schedule && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-background/80 text-muted-foreground border">
                {chain.schedule}
              </span>
            )}
            {chain.requiresUserId && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 border border-violet-500/20">
                needs user_id
              </span>
            )}
          </div>

          {chain.description && (
            <p className="text-xs text-muted-foreground mt-1">{chain.description}</p>
          )}

          {/* Tables affected */}
          {chain.tables && chain.tables.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <Database className="h-3 w-3 text-muted-foreground" />
              {chain.tables.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-background/80 font-mono border">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Endpoint */}
          {chain.endpoint && (
            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-mono text-muted-foreground">
                {chain.apiGroup}: {chain.endpoint}
              </span>
              <CopyButton text={`${MCP_BASES[chain.apiGroup || "TASKS"]}${chain.endpoint}`} />
            </div>
          )}
        </div>

        {/* Run button */}
        <RunButton chain={chain} status={status} onRun={onRun} userId={userId} />
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="relative">
          {chain.calls!.map(child => (
            <CallChainNode
              key={child.id}
              chain={child}
              depth={depth + 1}
              runStatus={runStatus}
              onRun={onRun}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TableGroupCard({ group }: { group: TableGroup }) {
  const [expanded, setExpanded] = useState(false)

  const colorStyles: Record<string, { bg: string; border: string; badge: string }> = {
    amber: {
      bg: "bg-gradient-to-br from-amber-500/5 to-yellow-500/5",
      border: "border-amber-500/20",
      badge: "bg-amber-500/10 text-amber-700"
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-500/5 to-green-500/5",
      border: "border-emerald-500/20",
      badge: "bg-emerald-500/10 text-emerald-700"
    },
    violet: {
      bg: "bg-gradient-to-br from-violet-500/5 to-purple-500/5",
      border: "border-violet-500/20",
      badge: "bg-violet-500/10 text-violet-700"
    },
    sky: {
      bg: "bg-gradient-to-br from-sky-500/5 to-blue-500/5",
      border: "border-sky-500/20",
      badge: "bg-sky-500/10 text-sky-700"
    },
    slate: {
      bg: "bg-gradient-to-br from-slate-500/5 to-gray-500/5",
      border: "border-slate-500/20",
      badge: "bg-slate-500/10 text-slate-700"
    },
  }

  const style = colorStyles[group.color]

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all hover:shadow-md",
      style.bg,
      style.border
    )}>
      <button
        className="flex items-center gap-3 w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn("p-2 rounded-lg", style.badge)}>
          <Database className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{group.name}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", style.badge)}>
              {group.tables.length} tables
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-1.5">
          {group.tables.map(table => (
            <div
              key={table.name}
              className="flex items-center justify-between p-2.5 rounded-lg bg-background/80 border hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium">{table.name}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{table.purpose}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{table.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TableGroupCardWithCounts({ group, counts }: { group: TableGroup; counts: TableCounts }) {
  const [expanded, setExpanded] = useState(false)

  const colorStyles: Record<string, { bg: string; border: string; badge: string }> = {
    amber: {
      bg: "bg-gradient-to-br from-amber-500/5 to-yellow-500/5",
      border: "border-amber-500/20",
      badge: "bg-amber-500/10 text-amber-700"
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-500/5 to-green-500/5",
      border: "border-emerald-500/20",
      badge: "bg-emerald-500/10 text-emerald-700"
    },
    violet: {
      bg: "bg-gradient-to-br from-violet-500/5 to-purple-500/5",
      border: "border-violet-500/20",
      badge: "bg-violet-500/10 text-violet-700"
    },
    sky: {
      bg: "bg-gradient-to-br from-sky-500/5 to-blue-500/5",
      border: "border-sky-500/20",
      badge: "bg-sky-500/10 text-sky-700"
    },
    slate: {
      bg: "bg-gradient-to-br from-slate-500/5 to-gray-500/5",
      border: "border-slate-500/20",
      badge: "bg-slate-500/10 text-slate-700"
    },
  }

  const style = colorStyles[group.color]

  // Calculate total from live counts
  const totalLiveCount = group.tables.reduce((sum, table) => {
    const liveCount = counts[table.name]
    return sum + (liveCount || 0)
  }, 0)

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all hover:shadow-md",
      style.bg,
      style.border
    )}>
      <button
        className="flex items-center gap-3 w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn("p-2 rounded-lg", style.badge)}>
          <Database className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{group.name}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", style.badge)}>
              {group.tables.length} tables
            </span>
            {totalLiveCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {totalLiveCount.toLocaleString()} records
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-1.5">
          {group.tables.map(table => {
            const liveCount = counts[table.name]
            return (
              <div
                key={table.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-background/80 border hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium">{table.name}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{table.purpose}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                  {liveCount !== undefined ? (
                    <span className="text-xs font-mono text-primary font-medium">
                      {liveCount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground font-mono">{table.count}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function UserJourneyStep({
  step,
  isLast,
  isActive,
  onClick
}: {
  step: typeof USER_JOURNEY[0]
  isLast: boolean
  isActive: boolean
  onClick: () => void
}) {
  const Icon = step.icon

  return (
    <div
      className={cn(
        "flex items-start gap-4 cursor-pointer transition-all",
        isActive && "scale-[1.02]"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg"
            : "bg-primary/10 text-primary border border-primary/20"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        {!isLast && (
          <div className={cn(
            "w-0.5 h-16 mt-2 transition-colors",
            isActive ? "bg-primary/50" : "bg-border"
          )} />
        )}
      </div>
      <div className={cn("flex-1 pb-6 transition-opacity", isActive ? "opacity-100" : "opacity-70")}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Step {step.step}</span>
        </div>
        <h4 className="font-semibold mt-0.5">{step.title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {step.tables.map(t => (
            <span
              key={t}
              className={cn(
                "text-xs px-2.5 py-1 rounded-lg font-mono border transition-colors",
                isActive
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted border-transparent"
              )}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function DemoUserCard({
  user,
  isSelected,
  onClick
}: {
  user: DemoUser
  isSelected: boolean
  onClick: () => void
}) {
  const typeStyles = {
    "team-owner": {
      bg: "bg-gradient-to-br from-amber-500/10 to-orange-500/10",
      border: "border-amber-500/30",
      badge: "bg-amber-500/20 text-amber-700",
      icon: Crown
    },
    "team-member": {
      bg: "bg-gradient-to-br from-blue-500/10 to-indigo-500/10",
      border: "border-blue-500/30",
      badge: "bg-blue-500/20 text-blue-700",
      icon: Users
    },
    "network-builder": {
      bg: "bg-gradient-to-br from-emerald-500/10 to-green-500/10",
      border: "border-emerald-500/30",
      badge: "bg-emerald-500/20 text-emerald-700",
      icon: Network
    }
  }

  const style = typeStyles[user.type]
  const Icon = style.icon

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-xl border p-5 transition-all cursor-pointer hover:shadow-lg",
        style.bg,
        style.border,
        isSelected && "ring-2 ring-primary shadow-lg scale-[1.02]"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl", style.badge)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-background/80 font-mono border">
              user_id: {user.id}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{user.role}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Source: {user.sourceUser}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm mt-4 text-muted-foreground">
        {user.description}
      </p>

      {/* Team Name */}
      {user.teamName && (
        <div className="flex items-center gap-2 mt-3">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{user.teamName}</span>
        </div>
      )}

      {/* API Keys */}
      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <Key className="h-3 w-3" />
          API Connections
        </p>
        <div className="flex gap-2">
          {API_INTEGRATIONS.map(api => {
            const hasKey = user.apiKeys[api.id as keyof typeof user.apiKeys]
            return (
              <TooltipProvider key={api.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full border font-medium transition-all",
                        hasKey
                          ? api.id === "rezen"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                            : api.id === "fub"
                            ? "bg-violet-500/10 border-violet-500/30 text-violet-700"
                            : "bg-sky-500/10 border-sky-500/30 text-sky-700"
                          : "bg-muted/50 border-muted text-muted-foreground/50 line-through"
                      )}
                    >
                      {api.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{hasKey ? `Connected: ${api.description}` : "Not connected"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </div>

      {/* Data Access */}
      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Data Access</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(user.dataAccess).map(([key, hasAccess]) => (
            <span
              key={key}
              className={cn(
                "text-xs px-2 py-0.5 rounded-md border capitalize",
                hasAccess
                  ? "bg-background/80 border-border"
                  : "bg-muted/30 border-transparent text-muted-foreground/50 line-through"
              )}
            >
              {key}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {user.stats.teamMembers !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user.stats.teamMembers.toLocaleString()}</span>
            <span className="text-muted-foreground text-xs">team</span>
          </div>
        )}
        {user.stats.networkAgents !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Network className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user.stats.networkAgents.toLocaleString()}</span>
            <span className="text-muted-foreground text-xs">network</span>
          </div>
        )}
        {user.stats.transactions !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user.stats.transactions.toLocaleString()}</span>
            <span className="text-muted-foreground text-xs">txns</span>
          </div>
        )}
        {user.stats.listings !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user.stats.listings.toLocaleString()}</span>
            <span className="text-muted-foreground text-xs">listings</span>
          </div>
        )}
      </div>

      {/* Query Pattern */}
      <div className="mt-4 p-3 rounded-lg bg-background/80 border">
        <p className="text-xs font-mono text-muted-foreground">
          {user.queryPattern}
        </p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
      )}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MachineDiagram() {
  const [activeSection, setActiveSection] = useState<"crank" | "tables" | "journey">("journey")
  const [runStatus, setRunStatus] = useState<RunStatus>({})
  const [userId, setUserId] = useState(60) // Default to David Keener (V2 test user)
  const [activeJourneyStep, setActiveJourneyStep] = useState(1)
  const [selectedDemoUser, setSelectedDemoUser] = useState<DemoUser>(DEMO_USERS[0])
  const [tableCounts, setTableCounts] = useState<TableCounts>({})
  const [loadingCounts, setLoadingCounts] = useState(false)
  const [countsError, setCountsError] = useState<string | null>(null)

  // Fetch live table counts
  const fetchTableCounts = useCallback(async () => {
    setLoadingCounts(true)
    setCountsError(null)
    try {
      const response = await fetch(`${MCP_BASES.SYSTEM}/table-counts`)
      if (response.ok) {
        const data = await response.json()
        // Handle both array and object formats
        if (Array.isArray(data)) {
          const counts: TableCounts = {}
          data.forEach((item: { name?: string; table_name?: string; count: number }) => {
            const name = item.name || item.table_name
            if (name) counts[name] = item.count
          })
          setTableCounts(counts)
        } else if (data.tables) {
          const counts: TableCounts = {}
          data.tables.forEach((item: { name: string; count: number }) => {
            counts[item.name] = item.count
          })
          setTableCounts(counts)
        } else {
          setTableCounts(data)
        }
      } else {
        setCountsError("Failed to fetch counts")
      }
    } catch (err) {
      setCountsError("Network error")
      console.error("Error fetching table counts:", err)
    } finally {
      setLoadingCounts(false)
    }
  }, [])

  // Fetch counts on mount and when switching to tables view
  useEffect(() => {
    if (activeSection === "tables" && Object.keys(tableCounts).length === 0) {
      fetchTableCounts()
    }
  }, [activeSection, tableCounts, fetchTableCounts])

  // Update userId when demo user changes
  useEffect(() => {
    setUserId(selectedDemoUser.id)
  }, [selectedDemoUser])

  const handleRun = useCallback(async (chain: CallChain) => {
    if (!chain.endpoint || !chain.apiGroup) return

    setRunStatus(prev => ({ ...prev, [chain.id]: "running" }))

    try {
      const base = MCP_BASES[chain.apiGroup]
      const url = `${base}${chain.endpoint}`
      const body = chain.requiresUserId ? { user_id: userId } : {}

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        setRunStatus(prev => ({ ...prev, [chain.id]: "success" }))
      } else {
        setRunStatus(prev => ({ ...prev, [chain.id]: "error" }))
      }
    } catch {
      setRunStatus(prev => ({ ...prev, [chain.id]: "error" }))
    }

    // Reset after 5 seconds
    setTimeout(() => {
      setRunStatus(prev => ({ ...prev, [chain.id]: "idle" }))
    }, 5000)
  }, [userId])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          The Machine
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From the user's dashboard → through the tables → via background tasks → to external APIs
        </p>
      </div>

      {/* Section Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 p-1.5 bg-muted/50 backdrop-blur-sm rounded-xl border shadow-sm">
          {[
            { id: "journey" as const, label: "The User", icon: Users, desc: "Data journey" },
            { id: "tables" as const, label: "The Tables", icon: Database, desc: "Data zones" },
            { id: "crank" as const, label: "The Crank", icon: GitBranch, desc: "Call chains" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                activeSection === tab.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Context bar for user_id with demo user selector */}
      {activeSection === "crank" && (
        <div className="flex flex-col gap-4 p-4 rounded-xl border bg-card/50 backdrop-blur-sm">
          {/* Demo User Quick Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Running as:</span>
            <div className="flex gap-2">
              {DEMO_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedDemoUser(user)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border",
                    selectedDemoUser.id === user.id
                      ? "bg-primary/10 border-primary/30 text-primary font-medium"
                      : "bg-muted/50 border-transparent hover:bg-muted"
                  )}
                >
                  {user.type === "team-owner" && <Crown className="h-3.5 w-3.5" />}
                  {user.type === "team-member" && <Users className="h-3.5 w-3.5" />}
                  {user.type === "network-builder" && <Network className="h-3.5 w-3.5" />}
                  {user.name}
                  <span className="text-xs opacity-70">({user.id})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend and manual user_id */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" />
                <span className="text-muted-foreground">Background</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/50" />
                <span className="text-muted-foreground">Tasks/</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
                <span className="text-muted-foreground">Workers/</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">user_id:</label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-1.5 text-sm rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Workers/ functions require a user_id.<br/>
                    David Keener (60) = V2 Test User<br/>
                    team_id=1, agent_id=37208</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {/* THE CRANK */}
      {activeSection === "crank" && (
        <div className="space-y-3">
          {CALL_CHAINS.map(chain => (
            <CallChainNode
              key={chain.id}
              chain={chain}
              runStatus={runStatus}
              onRun={handleRun}
              userId={userId}
            />
          ))}
        </div>
      )}

      {/* THE TABLES */}
      {activeSection === "tables" && (
        <div className="space-y-6">
          {/* Flow visualization with refresh */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {[
                { label: "Staging", color: "bg-amber-500/20 text-amber-700 border-amber-500/30" },
                { label: "Live", color: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30" },
                { label: "Aggregation", color: "bg-sky-500/20 text-sky-700 border-sky-500/30" },
              ].map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-3">
                  <span className={cn("px-4 py-2 rounded-xl text-sm font-medium border", stage.color)}>
                    {stage.label}
                  </span>
                  {i < 2 && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
                </div>
              ))}
            </div>

            <button
              onClick={fetchTableCounts}
              disabled={loadingCounts}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-all",
                loadingCounts ? "opacity-50" : "hover:bg-muted"
              )}
            >
              <RefreshCw className={cn("h-4 w-4", loadingCounts && "animate-spin")} />
              {loadingCounts ? "Loading..." : "Refresh Counts"}
            </button>
          </div>

          {countsError && (
            <div className="text-sm text-red-500 text-center p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              {countsError}
            </div>
          )}

          {Object.keys(tableCounts).length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Loaded {Object.keys(tableCounts).length} table counts from API
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
            Data flows through three zones: <strong>Staging</strong> (safe to fail) → <strong>Live</strong> (verified truth) → <strong>Aggregation</strong> (pre-computed for speed)
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TABLE_GROUPS.map(group => (
              <TableGroupCardWithCounts key={group.id} group={group} counts={tableCounts} />
            ))}
          </div>
        </div>
      )}

      {/* THE USER JOURNEY */}
      {activeSection === "journey" && (
        <div className="space-y-8">
          {/* Demo Users Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold">Demo User Personas</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Three user types show different data access patterns. Click to select active context.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {DEMO_USERS.map(user => (
                <DemoUserCard
                  key={user.id}
                  user={user}
                  isSelected={selectedDemoUser.id === user.id}
                  onClick={() => setSelectedDemoUser(user)}
                />
              ))}
            </div>
          </div>

          {/* API Integrations Breakdown */}
          <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Integrations
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {API_INTEGRATIONS.map(api => (
                <div
                  key={api.id}
                  className={cn(
                    "p-4 rounded-xl border",
                    api.id === "rezen" && "bg-emerald-500/5 border-emerald-500/20",
                    api.id === "fub" && "bg-violet-500/5 border-violet-500/20",
                    api.id === "skyslope" && "bg-sky-500/5 border-sky-500/20"
                  )}
                >
                  <h5 className={cn(
                    "font-semibold",
                    api.id === "rezen" && "text-emerald-700",
                    api.id === "fub" && "text-violet-700",
                    api.id === "skyslope" && "text-sky-700"
                  )}>
                    {api.name}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1">{api.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {api.tables.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-background/80 font-mono border">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Journey Steps */}
          <div className="max-w-2xl mx-auto">
            <h4 className="text-center font-semibold mb-4">Data Journey: Signup to Dashboard</h4>
            <div className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm">
              {USER_JOURNEY.map((step, i) => (
                <UserJourneyStep
                  key={step.step}
                  step={step}
                  isLast={i === USER_JOURNEY.length - 1}
                  isActive={activeJourneyStep === step.step}
                  onClick={() => setActiveJourneyStep(step.step)}
                />
              ))}
            </div>
          </div>

          {/* Current Context Summary */}
          <div className="p-6 rounded-2xl border bg-primary/5 border-primary/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Current Context: {selectedDemoUser.name}
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Login Email</p>
                <p className="font-mono">{selectedDemoUser.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">user_id for API calls</p>
                <p className="font-mono text-primary font-semibold">{selectedDemoUser.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Query Pattern</p>
                <p className="font-mono text-xs">{selectedDemoUser.queryPattern}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Password (Demo)</p>
                <p className="font-mono">AgentDashboards143!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
