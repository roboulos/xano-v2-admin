"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  ChevronDown,
  Database,
  ArrowRight,
  ArrowDown,
  Layers,
  Box,
  Webhook,
  Clock,
  Users,
  Building2,
  DollarSign,
  Home,
  Network,
  FileText,
  CreditCard,
  Phone,
  Calendar,
  Mail,
  Activity,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

// =============================================================================
// DATA FLOW TYPES & DEFINITIONS
// =============================================================================

interface DataSource {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  description: string
  tables: string[]
  stagingTables: string[]
  webhookEndpoint?: string
  syncType: "webhook" | "scheduled" | "manual"
}

interface CoreDomain {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  description: string
  primaryTable: string
  relatedTables: string[]
  dataFlowsFrom: string[]
}

interface FinancialOutput {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  tables: string[]
  calculatedFrom: string[]
}

// =============================================================================
// DATA SOURCE DEFINITIONS
// =============================================================================

const DATA_SOURCES: DataSource[] = [
  {
    id: "rezen",
    name: "Rezen",
    icon: <Building2 className="h-5 w-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950/30",
    borderColor: "border-blue-300",
    description: "Core brokerage platform - agents, transactions, network hierarchy, equity",
    tables: ["agent", "transaction", "network_hierarchy", "contribution", "equity_transactions"],
    stagingTables: [
      "stage_transactions_rezen_onboarding",
      "stage_contributions_rezen_onboarding",
      "stage_contributions_rezen_daily_sync",
      "stage_network_downline_rezen_onboarding",
      "stage_listings_rezen_onboarding",
      "stage_pending_contribution_rezen",
    ],
    webhookEndpoint: "/webhook/rezen",
    syncType: "webhook",
  },
  {
    id: "fub",
    name: "Follow Up Boss",
    icon: <Users className="h-5 w-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-950/30",
    borderColor: "border-purple-300",
    description: "CRM platform - contacts, calls, appointments, events, deals",
    tables: [
      "fub_people", "fub_calls", "fub_appointments", "fub_events",
      "fub_deals", "fub_text_messages", "fub_groups", "fub_users",
    ],
    stagingTables: [
      "stage_appointments_fub_onboarding",
      "stage_text_messages_fub_onboarding",
    ],
    webhookEndpoint: "/webhook/fub",
    syncType: "webhook",
  },
  {
    id: "skyslope",
    name: "SkySlope",
    icon: <FileText className="h-5 w-5" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-950/30",
    borderColor: "border-orange-300",
    description: "Transaction management - listings, transactions, documents",
    tables: ["skyslope_connection"],
    stagingTables: [
      "stage_listing_skyslope",
      "stage_transactions_skyslope",
    ],
    syncType: "scheduled",
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: <CreditCard className="h-5 w-5" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-950/30",
    borderColor: "border-indigo-300",
    description: "Payment processing - subscriptions, billing, products",
    tables: [
      "stripe_subscriptions", "stripe_pricing", "stripe_product",
      "stripe_events", "stripe_sync_state",
    ],
    stagingTables: [],
    webhookEndpoint: "/webhook/stripe",
    syncType: "webhook",
  },
  {
    id: "dotloop",
    name: "DotLoop",
    icon: <RefreshCw className="h-5 w-5" />,
    color: "text-teal-600",
    bgColor: "bg-teal-100 dark:bg-teal-950/30",
    borderColor: "border-teal-300",
    description: "Document management - loops (transactions), contacts",
    tables: [
      "dotloop_accounts", "dotloop_profiles", "dotloop_loops",
      "dotloop_contacts", "dotloop_sync_state", "dotloop_staging",
    ],
    stagingTables: ["dotloop_staging"],
    syncType: "scheduled",
  },
  {
    id: "lofty",
    name: "Lofty",
    icon: <Activity className="h-5 w-5" />,
    color: "text-pink-600",
    bgColor: "bg-pink-100 dark:bg-pink-950/30",
    borderColor: "border-pink-300",
    description: "Lead management - accounts, leads",
    tables: ["lofty_accounts", "lofty_leads", "lofty_sync_state"],
    stagingTables: ["lofty_staging"],
    syncType: "scheduled",
  },
]

// =============================================================================
// CORE DOMAIN DEFINITIONS
// =============================================================================

const CORE_DOMAINS: CoreDomain[] = [
  {
    id: "transaction",
    name: "TRANSACTION",
    icon: <DollarSign className="h-6 w-6" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-950/30",
    description: "The center of everything - real estate deals with participants and financials",
    primaryTable: "transaction",
    relatedTables: [
      "transaction_financials",
      "transaction_participants",
      "transaction_history",
      "transaction_tags",
    ],
    dataFlowsFrom: ["rezen", "skyslope", "fub"],
  },
  {
    id: "agent",
    name: "AGENT",
    icon: <Users className="h-6 w-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950/30",
    description: "Agent identity, performance, commissions, and cap tracking",
    primaryTable: "agent",
    relatedTables: [
      "agent_cap_data",
      "agent_commission",
      "agent_hierarchy",
      "agent_performance",
      "agent_rezen",
    ],
    dataFlowsFrom: ["rezen"],
  },
  {
    id: "participant",
    name: "PARTICIPANT",
    icon: <Users className="h-6 w-6" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/30",
    description: "Links transactions to agents - who gets paid, how much",
    primaryTable: "participant",
    relatedTables: ["participant_paid"],
    dataFlowsFrom: ["rezen", "skyslope"],
  },
  {
    id: "listing",
    name: "LISTING",
    icon: <Home className="h-6 w-6" />,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-950/30",
    description: "Property listings with photos and history",
    primaryTable: "listing",
    relatedTables: ["listing_history", "listing_photos"],
    dataFlowsFrom: ["rezen", "skyslope"],
  },
  {
    id: "team",
    name: "TEAM",
    icon: <Building2 className="h-6 w-6" />,
    color: "text-violet-600",
    bgColor: "bg-violet-100 dark:bg-violet-950/30",
    description: "Team structure - directors, leaders, mentors, members",
    primaryTable: "team",
    relatedTables: [
      "team_members",
      "team_settings",
      "director",
      "leader",
      "mentor",
      "team_director_assignments",
      "team_leader_assignments",
      "team_mentor_assignments",
    ],
    dataFlowsFrom: ["rezen"],
  },
  {
    id: "network",
    name: "NETWORK",
    icon: <Network className="h-6 w-6" />,
    color: "text-rose-600",
    bgColor: "bg-rose-100 dark:bg-rose-950/30",
    description: "Rev share hierarchy - downline/upline relationships",
    primaryTable: "network_hierarchy",
    relatedTables: ["network_member", "network_user_prefs", "frontline_stats"],
    dataFlowsFrom: ["rezen"],
  },
]

// =============================================================================
// FINANCIAL OUTPUT DEFINITIONS
// =============================================================================

const FINANCIAL_OUTPUTS: FinancialOutput[] = [
  {
    id: "income",
    name: "Income",
    icon: <DollarSign className="h-5 w-5" />,
    description: "Unified income tracking across all revenue sources",
    tables: ["income"],
    calculatedFrom: ["transaction", "participant", "contribution"],
  },
  {
    id: "contribution",
    name: "Contributions",
    icon: <Activity className="h-5 w-5" />,
    description: "Rev share contribution records from network transactions",
    tables: ["contribution", "contribution_tiers", "contributions_pending"],
    calculatedFrom: ["transaction", "network"],
  },
  {
    id: "equity",
    name: "Equity",
    icon: <CreditCard className="h-5 w-5" />,
    description: "Agent equity positions - annual, monthly tracking",
    tables: ["equity_annual", "equity_monthly", "equity_transactions"],
    calculatedFrom: ["transaction", "agent"],
  },
  {
    id: "revshare",
    name: "RevShare",
    icon: <Network className="h-5 w-5" />,
    description: "Revenue sharing payments and distributions",
    tables: ["revshare_payment", "revshare_payments", "revshare_totals", "revshare_plans"],
    calculatedFrom: ["network", "contribution", "transaction"],
  },
]

// =============================================================================
// COMPONENT: Data Source Card
// =============================================================================

function DataSourceCard({
  source,
  isExpanded,
  onToggle,
}: {
  source: DataSource
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${source.borderColor} ${
        isExpanded ? "border-2 shadow-md" : "border hover:shadow-sm"
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${source.bgColor}`}>
              <span className={source.color}>{source.icon}</span>
            </div>
            <div>
              <div className={`font-semibold ${source.color}`}>{source.name}</div>
              <div className="text-xs text-muted-foreground">
                {source.tables.length} tables
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs ${
                source.syncType === "webhook"
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-blue-50 text-blue-600 border-blue-200"
              }`}
            >
              {source.syncType === "webhook" ? (
                <Webhook className="h-3 w-3 mr-1" />
              ) : (
                <Clock className="h-3 w-3 mr-1" />
              )}
              {source.syncType}
            </Badge>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <p className="text-sm text-muted-foreground">{source.description}</p>

            {source.stagingTables.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Staging Tables ({source.stagingTables.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {source.stagingTables.map((table) => (
                    <Badge
                      key={table}
                      variant="outline"
                      className="text-xs font-mono bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      {table.replace("stage_", "").slice(0, 20)}...
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Core Tables ({source.tables.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {source.tables.slice(0, 6).map((table) => (
                  <Badge key={table} variant="outline" className="text-xs font-mono">
                    {table}
                  </Badge>
                ))}
                {source.tables.length > 6 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{source.tables.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// COMPONENT: Core Domain Card
// =============================================================================

function CoreDomainCard({
  domain,
  isExpanded,
  onToggle,
  isHighlighted,
}: {
  domain: CoreDomain
  isExpanded: boolean
  onToggle: () => void
  isHighlighted: boolean
}) {
  const isPrimaryTransaction = domain.id === "transaction"

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isPrimaryTransaction
          ? "border-2 border-amber-400 shadow-lg ring-2 ring-amber-200/50"
          : isHighlighted
          ? "border-2 border-primary/50 shadow-md"
          : isExpanded
          ? "border-2 border-primary/30 shadow-md"
          : "border hover:shadow-sm"
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${domain.bgColor}`}>
              <span className={domain.color}>{domain.icon}</span>
            </div>
            <div>
              <div className={`font-bold ${domain.color}`}>
                {domain.name}
                {isPrimaryTransaction && (
                  <Badge className="ml-2 bg-amber-500 text-white text-xs">CENTER</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {domain.primaryTable}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {domain.relatedTables.length + 1} tables
            </Badge>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <p className="text-sm text-muted-foreground">{domain.description}</p>

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Data flows from:
              </div>
              <div className="flex flex-wrap gap-1">
                {domain.dataFlowsFrom.map((sourceId) => {
                  const source = DATA_SOURCES.find((s) => s.id === sourceId)
                  return source ? (
                    <Badge
                      key={sourceId}
                      variant="outline"
                      className={`text-xs ${source.bgColor} ${source.color}`}
                    >
                      {source.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Related Tables ({domain.relatedTables.length})
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant="outline"
                  className="text-xs font-mono bg-primary/10 border-primary/30"
                >
                  {domain.primaryTable} (primary)
                </Badge>
                {domain.relatedTables.map((table) => (
                  <Badge key={table} variant="outline" className="text-xs font-mono">
                    {table}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// COMPONENT: Financial Output Card
// =============================================================================

function FinancialOutputCard({
  output,
  isExpanded,
  onToggle,
}: {
  output: FinancialOutput
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isExpanded ? "border-2 border-emerald-300 shadow-md" : "border hover:shadow-sm"
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600">
              {output.icon}
            </div>
            <div>
              <div className="font-medium text-emerald-700 text-sm">{output.name}</div>
              <div className="text-xs text-muted-foreground">
                {output.tables.length} tables
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <p className="text-xs text-muted-foreground">{output.description}</p>
            <div className="flex flex-wrap gap-1">
              {output.tables.map((table) => (
                <Badge key={table} variant="outline" className="text-xs font-mono">
                  {table}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT: DataFlowDiagram
// =============================================================================

export function DataFlowDiagram() {
  const [expandedSource, setExpandedSource] = useState<string | null>(null)
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)
  const [expandedOutput, setExpandedOutput] = useState<string | null>(null)
  const [highlightedDomains, setHighlightedDomains] = useState<string[]>([])

  // When a source is clicked, highlight the domains it feeds into
  const handleSourceClick = (sourceId: string) => {
    if (expandedSource === sourceId) {
      setExpandedSource(null)
      setHighlightedDomains([])
    } else {
      setExpandedSource(sourceId)
      const source = DATA_SOURCES.find((s) => s.id === sourceId)
      if (source) {
        const domainsToHighlight = CORE_DOMAINS.filter((d) =>
          d.dataFlowsFrom.includes(sourceId)
        ).map((d) => d.id)
        setHighlightedDomains(domainsToHighlight)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              V2 System Data Flow
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              How data enters from external sources, flows through staging, normalizes into
              core domain tables, and produces financial outputs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* The Flow Diagram */}
      <div className="relative">
        {/* LAYER 1: External Sources */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-950/30">
              <Webhook className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm text-blue-700">
              EXTERNAL DATA SOURCES
            </h3>
            <div className="flex-1 h-px bg-blue-200" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {DATA_SOURCES.map((source) => (
              <DataSourceCard
                key={source.id}
                source={source}
                isExpanded={expandedSource === source.id}
                onToggle={() => handleSourceClick(source.id)}
              />
            ))}
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center my-4">
          <div className="flex flex-col items-center">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              STAGING &amp; PROCESSING
            </span>
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>

        {/* LAYER 2: Core Domain Tables */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-amber-100 dark:bg-amber-950/30">
              <Database className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="font-semibold text-sm text-amber-700">
              CORE DOMAIN TABLES
            </h3>
            <Badge className="bg-amber-500 text-white text-xs">
              Transaction is the center
            </Badge>
            <div className="flex-1 h-px bg-amber-200" />
          </div>

          {/* Transaction at center, others around it */}
          <div className="grid grid-cols-3 gap-3">
            {/* Left column */}
            <div className="space-y-3">
              {CORE_DOMAINS.filter((d) => ["agent", "team"].includes(d.id)).map(
                (domain) => (
                  <CoreDomainCard
                    key={domain.id}
                    domain={domain}
                    isExpanded={expandedDomain === domain.id}
                    onToggle={() =>
                      setExpandedDomain(expandedDomain === domain.id ? null : domain.id)
                    }
                    isHighlighted={highlightedDomains.includes(domain.id)}
                  />
                )
              )}
            </div>

            {/* Center column - Transaction + Participant */}
            <div className="space-y-3">
              {CORE_DOMAINS.filter((d) =>
                ["transaction", "participant"].includes(d.id)
              ).map((domain) => (
                <CoreDomainCard
                  key={domain.id}
                  domain={domain}
                  isExpanded={expandedDomain === domain.id}
                  onToggle={() =>
                    setExpandedDomain(expandedDomain === domain.id ? null : domain.id)
                  }
                  isHighlighted={highlightedDomains.includes(domain.id)}
                />
              ))}
            </div>

            {/* Right column */}
            <div className="space-y-3">
              {CORE_DOMAINS.filter((d) => ["listing", "network"].includes(d.id)).map(
                (domain) => (
                  <CoreDomainCard
                    key={domain.id}
                    domain={domain}
                    isExpanded={expandedDomain === domain.id}
                    onToggle={() =>
                      setExpandedDomain(expandedDomain === domain.id ? null : domain.id)
                    }
                    isHighlighted={highlightedDomains.includes(domain.id)}
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center my-4">
          <div className="flex flex-col items-center">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              CALCULATIONS &amp; AGGREGATIONS
            </span>
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>

        {/* LAYER 3: Financial Outputs */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-emerald-100 dark:bg-emerald-950/30">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-sm text-emerald-700">
              FINANCIAL OUTPUTS
            </h3>
            <div className="flex-1 h-px bg-emerald-200" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {FINANCIAL_OUTPUTS.map((output) => (
              <FinancialOutputCard
                key={output.id}
                output={output}
                isExpanded={expandedOutput === output.id}
                onToggle={() =>
                  setExpandedOutput(expandedOutput === output.id ? null : output.id)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/30 mt-0.5">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-400">
                The Transaction-Participant-Agent Triangle
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                Every transaction has participants (who get paid). Each participant links to
                an agent. The agent's network position determines rev share distribution.
                This triangle is the core business logic - data from Rezen, SkySlope, and
                FUB must reconcile to get the complete picture of who did what deal and who
                gets paid.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DataFlowDiagram
