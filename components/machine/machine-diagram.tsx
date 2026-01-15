"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Database,
  Zap,
  Users,
  ArrowDown,
  Layers,
  Box,
  GitBranch,
  Play,
  Clock,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

// =============================================================================
// THE MACHINE DATA - The actual call chains and table flows
// =============================================================================

interface CallChain {
  id: string
  name: string
  type: "background" | "task" | "worker" | "utility"
  schedule?: string
  calls?: CallChain[]
  tables?: string[]
  description?: string
}

interface TableGroup {
  id: string
  name: string
  description: string
  tables: { name: string; count: string; purpose: string }[]
}

// THE CRANK - Actual call chains from the workspace
const CALL_CHAINS: CallChain[] = [
  {
    id: "rezen-transactions",
    name: "reZEN - Process Transactions",
    type: "background",
    schedule: "Every 6hr",
    description: "Sync all transaction data from reZEN API",
    calls: [
      {
        id: "task-8023",
        name: "Tasks/reZEN - Process Transactions",
        type: "task",
        description: "Orchestrates transaction sync across all agents",
        calls: [
          {
            id: "worker-8052",
            name: "Workers/reZEN - Transactions Sync",
            type: "worker",
            description: "Per-agent sync (145 parallel)",
            tables: ["agent_rezen_transactions", "transaction", "participant"],
            calls: [
              {
                id: "util-dedupe",
                name: "Workers/Dedupe by External ID",
                type: "utility",
                description: "Ensures no duplicates"
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
    calls: [
      {
        id: "task-8024",
        name: "Tasks/reZEN - Process Listings",
        type: "task",
        calls: [
          {
            id: "worker-8053",
            name: "Workers/reZEN - Listings Sync",
            type: "worker",
            tables: ["listing"]
          },
          {
            id: "worker-8054",
            name: "Workers/reZEN - Listings Update",
            type: "worker",
            tables: ["listing"]
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
    description: "Sync network downline and sponsorship",
    calls: [
      {
        id: "task-8025",
        name: "Tasks/reZEN - Process Network",
        type: "task",
        calls: [
          {
            id: "worker-8062",
            name: "Workers/reZEN - Network Downline",
            type: "worker",
            tables: ["network"]
          },
          {
            id: "worker-8070",
            name: "Workers/reZEN - Sponsor Tree",
            type: "worker",
            tables: ["network"]
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
    description: "Sync revenue share and contributions",
    calls: [
      {
        id: "task-8026",
        name: "Tasks/reZEN - Process Contributions",
        type: "task",
        calls: [
          {
            id: "worker-8056",
            name: "Workers/reZEN - Contributions",
            type: "worker",
            tables: ["contribution", "revshare_totals"]
          },
          {
            id: "worker-8071",
            name: "Workers/reZEN - RevShare Totals",
            type: "worker",
            tables: ["revshare_totals"]
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
    description: "Sync CRM data from Follow Up Boss",
    calls: [
      {
        id: "task-7960",
        name: "Tasks/FUB - Daily Update People",
        type: "task",
        calls: [
          {
            id: "worker-8118",
            name: "Workers/FUB - Lambda Coordinator",
            type: "worker",
            description: "Spawns AWS Lambda jobs",
            tables: ["fub_people", "fub_calls", "fub_appointments", "fub_events", "fub_texts"]
          }
        ]
      }
    ]
  },
  {
    id: "skyslope-sync",
    name: "SkySlope - Account Users Sync",
    type: "background",
    schedule: "On Webhook",
    description: "Sync transaction documents",
    calls: [
      {
        id: "task-skyslope",
        name: "Tasks/SkySlope - Account Users",
        type: "task",
        tables: ["closing_disclosure"]
      }
    ]
  },
  {
    id: "aggregation-daily",
    name: "Aggregation - Daily Scheduler",
    type: "background",
    schedule: "Daily 7am",
    description: "Rebuild all dashboard aggregations",
    calls: [
      {
        id: "task-agg",
        name: "Tasks/Aggregation - Daily",
        type: "task",
        description: "Triggers all agg_* table rebuilds",
        tables: ["agg_revenue_*", "agg_transactions_*", "agg_network_*", "agg_fub_*"]
      }
    ]
  }
]

// THE TABLES - Organized by zone
const TABLE_GROUPS: TableGroup[] = [
  {
    id: "staging",
    name: "STAGING",
    description: "Raw API inbox - safe to fail",
    tables: [
      { name: "agent_rezen_transactions", count: "temp", purpose: "Raw reZEN transaction data" },
      { name: "agent_rezen_listings", count: "temp", purpose: "Raw reZEN listing data" },
      { name: "staging_network", count: "temp", purpose: "Raw network imports" },
      { name: "staging_contribution", count: "temp", purpose: "Raw contribution data" },
    ]
  },
  {
    id: "live",
    name: "LIVE",
    description: "Verified truth - production data",
    tables: [
      { name: "user", count: "337", purpose: "Login accounts with roles" },
      { name: "agent", count: "35,526", purpose: "Agent profiles" },
      { name: "transaction", count: "50,000", purpose: "Closed deals" },
      { name: "participant", count: "660,000", purpose: "Commission tracking" },
      { name: "network", count: "398", purpose: "Sponsorship tree" },
      { name: "listing", count: "varies", purpose: "Property listings" },
      { name: "team", count: "300+", purpose: "Team entities" },
      { name: "team_roster", count: "270", purpose: "Team members" },
      { name: "contribution", count: "varies", purpose: "Revenue share" },
    ]
  },
  {
    id: "fub",
    name: "FUB",
    description: "Follow Up Boss CRM data",
    tables: [
      { name: "fub_people", count: "679,977", purpose: "Contacts" },
      { name: "fub_calls", count: "166,037", purpose: "Call logs" },
      { name: "fub_events", count: "897,315", purpose: "Activity events" },
      { name: "fub_appointments", count: "6,787", purpose: "Appointments" },
      { name: "fub_texts", count: "230,075", purpose: "Text messages" },
      { name: "fub_deals", count: "varies", purpose: "Deal pipeline" },
    ]
  },
  {
    id: "aggregation",
    name: "AGGREGATION",
    description: "Pre-computed dashboard cache",
    tables: [
      { name: "agg_revenue_by_month", count: "cache", purpose: "Revenue charts" },
      { name: "agg_revenue_by_agent", count: "cache", purpose: "Agent revenue" },
      { name: "agg_transactions_by_stage", count: "cache", purpose: "Pipeline" },
      { name: "agg_network_by_tier", count: "cache", purpose: "Network tiers" },
      { name: "agg_fub_calls_by_direction", count: "cache", purpose: "Call analytics" },
    ]
  },
  {
    id: "config",
    name: "CONFIG",
    description: "Settings and subscriptions",
    tables: [
      { name: "subscription", count: "varies", purpose: "Stripe subscriptions" },
      { name: "team_owners", count: "varies", purpose: "Team ownership" },
      { name: "directors", count: "varies", purpose: "Director roles" },
      { name: "leaders", count: "varies", purpose: "Leader roles" },
    ]
  }
]

// THE USER JOURNEY
const USER_JOURNEY = [
  {
    step: 1,
    title: "Agent Signs Up",
    tables: ["user", "agent", "team_roster", "subscription"],
    description: "Creates account, links to team"
  },
  {
    step: 2,
    title: "Brokerage Connects",
    tables: ["transaction", "listing", "network", "contribution"],
    description: "reZEN syncs their deals, network"
  },
  {
    step: 3,
    title: "CRM Links",
    tables: ["fub_people", "fub_calls", "fub_appointments"],
    description: "FUB syncs their contacts"
  },
  {
    step: 4,
    title: "Dashboard Loads",
    tables: ["agg_revenue_*", "agg_transactions_*", "agg_network_*"],
    description: "Queries pre-computed aggregations"
  }
]

// =============================================================================
// COMPONENTS
// =============================================================================

function CallChainNode({ chain, depth = 0 }: { chain: CallChain; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2)

  const typeColors = {
    background: "bg-orange-500/10 border-orange-500/30 text-orange-700",
    task: "bg-blue-500/10 border-blue-500/30 text-blue-700",
    worker: "bg-green-500/10 border-green-500/30 text-green-700",
    utility: "bg-gray-500/10 border-gray-500/30 text-gray-600",
  }

  const typeIcons = {
    background: Clock,
    task: Layers,
    worker: Zap,
    utility: Box,
  }

  const Icon = typeIcons[chain.type]
  const hasChildren = chain.calls && chain.calls.length > 0

  return (
    <div className={cn("relative", depth > 0 && "ml-6 mt-2")}>
      {depth > 0 && (
        <div className="absolute left-[-20px] top-0 bottom-0 w-px bg-border" />
      )}
      {depth > 0 && (
        <div className="absolute left-[-20px] top-4 w-4 h-px bg-border" />
      )}

      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
          typeColors[chain.type],
          "hover:shadow-sm"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0 mt-0.5">
          {hasChildren ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{chain.name}</span>
            {chain.schedule && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-background/50">
                {chain.schedule}
              </span>
            )}
          </div>
          {chain.description && (
            <p className="text-xs opacity-70 mt-0.5">{chain.description}</p>
          )}
          {chain.tables && chain.tables.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <Database className="h-3 w-3 opacity-50" />
              {chain.tables.map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-background/50">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="relative">
          {chain.calls!.map(child => (
            <CallChainNode key={child.id} chain={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function TableGroupCard({ group }: { group: TableGroup }) {
  const [expanded, setExpanded] = useState(false)

  const groupColors: Record<string, string> = {
    staging: "border-yellow-500/30 bg-yellow-500/5",
    live: "border-green-500/30 bg-green-500/5",
    fub: "border-purple-500/30 bg-purple-500/5",
    aggregation: "border-blue-500/30 bg-blue-500/5",
    config: "border-gray-500/30 bg-gray-500/5",
  }

  return (
    <div className={cn("rounded-lg border p-4", groupColors[group.id])}>
      <button
        className="flex items-center gap-2 w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <Database className="h-4 w-4" />
        <span className="font-semibold">{group.name}</span>
        <span className="text-xs text-muted-foreground">({group.tables.length} tables)</span>
      </button>
      <p className="text-xs text-muted-foreground mt-1 ml-6">{group.description}</p>

      {expanded && (
        <div className="mt-3 space-y-1 ml-6">
          {group.tables.map(table => (
            <div key={table.name} className="flex items-center justify-between text-sm py-1 px-2 rounded bg-background/50">
              <span className="font-mono text-xs">{table.name}</span>
              <span className="text-xs text-muted-foreground">{table.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UserJourneyStep({ step, isLast }: { step: typeof USER_JOURNEY[0]; isLast: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-sm font-semibold text-primary">
          {step.step}
        </div>
        {!isLast && <div className="w-px h-12 bg-border mt-2" />}
      </div>
      <div className="flex-1 pb-4">
        <h4 className="font-medium text-sm">{step.title}</h4>
        <p className="text-xs text-muted-foreground">{step.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {step.tables.map(t => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted font-mono">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MachineDiagram() {
  const [activeSection, setActiveSection] = useState<"crank" | "tables" | "journey">("crank")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b">
        <h2 className="text-2xl font-bold">The Machine</h2>
        <p className="text-muted-foreground text-sm mt-1">
          How data flows from external APIs → through background tasks → into tables → to the user
        </p>
      </div>

      {/* Section Toggle */}
      <div className="flex justify-center">
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setActiveSection("crank")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeSection === "crank"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GitBranch className="h-4 w-4" />
            The Crank
          </button>
          <button
            onClick={() => setActiveSection("tables")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeSection === "tables"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Database className="h-4 w-4" />
            The Tables
          </button>
          <button
            onClick={() => setActiveSection("journey")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeSection === "journey"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            The User
          </button>
        </div>
      </div>

      {/* THE CRANK - Call Chains */}
      {activeSection === "crank" && (
        <div className="space-y-4">
          <div className="flex items-center gap-6 text-sm border rounded-xl px-5 py-4 bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/50" />
              <span className="text-muted-foreground">Background Task</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/50" />
              <span className="text-muted-foreground">Tasks/ Function</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" />
              <span className="text-muted-foreground">Workers/ Function</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-500/30 border border-gray-500/50" />
              <span className="text-muted-foreground">Utility</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Click any item to expand and see what it calls. Background tasks trigger on schedule,
            call Tasks/ orchestrators, which spawn Workers/ in parallel.
          </p>

          <div className="grid gap-3">
            {CALL_CHAINS.map(chain => (
              <CallChainNode key={chain.id} chain={chain} />
            ))}
          </div>
        </div>
      )}

      {/* THE TABLES - Where Data Lives */}
      {activeSection === "tables" && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-700">
              Staging
            </span>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-700">
              Live
            </span>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700">
              Aggregation
            </span>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Data flows: Raw API data → Staging (safe to fail) → Live (verified truth) → Aggregation (dashboard cache)
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TABLE_GROUPS.map(group => (
              <TableGroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>
      )}

      {/* THE USER JOURNEY */}
      {activeSection === "journey" && (
        <div className="max-w-xl mx-auto space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            An agent's data journey from signup to seeing their dashboard
          </p>

          <div className="p-6 rounded-xl border bg-card/50">
            {USER_JOURNEY.map((step, i) => (
              <UserJourneyStep
                key={step.step}
                step={step}
                isLast={i === USER_JOURNEY.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
