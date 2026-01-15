"use client"

import { useState } from "react"
import {
  Clock,
  Zap,
  Database,
  Users,
  Home,
  FileText,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Play,
  Building2,
  TrendingUp,
  Megaphone,
  LineChart,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ALL_TASKS, getAllTaskStats, type CompleteTask } from "@/lib/all-tasks-complete"

// Domain configuration with business context
const DOMAINS = {
  rezen: {
    name: "reZEN",
    icon: Building2,
    color: "bg-green-500",
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-800",
    description: "Real Brokerage platform sync - agents, transactions, network, commissions",
    businessValue: "Core revenue data, agent hierarchy, commission tracking",
  },
  fub: {
    name: "Follow Up Boss",
    icon: Users,
    color: "bg-blue-500",
    bgColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-800",
    description: "CRM integration - contacts, calls, texts, appointments, deals",
    businessValue: "Lead management, client communication, deal pipeline",
  },
  skyslope: {
    name: "SkySlope",
    icon: FileText,
    color: "bg-purple-500",
    bgColor: "bg-purple-50 border-purple-200",
    textColor: "text-purple-800",
    description: "Transaction management - listings, documents, compliance",
    businessValue: "Active listings, transaction documents, compliance tracking",
  },
  title: {
    name: "Title",
    icon: Home,
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-800",
    description: "Title company integration - escrow, closing data",
    businessValue: "Closing coordination, title insurance, escrow tracking",
  },
  aggregation: {
    name: "Aggregation",
    icon: BarChart3,
    color: "bg-orange-500",
    bgColor: "bg-orange-50 border-orange-200",
    textColor: "text-orange-800",
    description: "Pre-computed dashboards - leaderboards, metrics, rollups",
    businessValue: "Fast dashboard loading, pre-calculated KPIs, rankings",
  },
  ad: {
    name: "AgentDashboards",
    icon: Megaphone,
    color: "bg-slate-500",
    bgColor: "bg-slate-50 border-slate-200",
    textColor: "text-slate-800",
    description: "Internal platform operations - user sync, notifications",
    businessValue: "Platform health, user management, system notifications",
  },
  reporting: {
    name: "Reporting",
    icon: TrendingUp,
    color: "bg-red-500",
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-800",
    description: "Report generation - scheduled reports, exports",
    businessValue: "Automated reporting, data exports, scheduled deliveries",
  },
  metrics: {
    name: "Metrics",
    icon: LineChart,
    color: "bg-cyan-500",
    bgColor: "bg-cyan-50 border-cyan-200",
    textColor: "text-cyan-800",
    description: "Performance metrics - tracking, analytics",
    businessValue: "Performance monitoring, analytics, trend analysis",
  },
}

const freqColors: Record<string, string> = {
  "Every 1 min": "bg-red-100 text-red-700 border-red-300",
  "Every 3 min": "bg-orange-100 text-orange-700 border-orange-300",
  "Every 5 min": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Every 1 hour": "bg-blue-100 text-blue-700 border-blue-300",
  "Every 24 hours": "bg-green-100 text-green-700 border-green-300",
  "Every 7 days": "bg-purple-100 text-purple-700 border-purple-300",
}

// Group tasks by what they DO (business function)
function groupByFunction(tasks: CompleteTask[]) {
  const groups: Record<string, CompleteTask[]> = {
    "Onboarding & Initial Sync": [],
    "Continuous Data Sync": [],
    "Processing & Transformation": [],
    "Aggregation & Rollups": [],
    "Notifications & Alerts": [],
    "Maintenance & Cleanup": [],
  }

  tasks.forEach(task => {
    const name = task.name.toLowerCase()
    const does = task.does.toLowerCase()

    if (name.includes("onboarding") || does.includes("onboard") || does.includes("initial")) {
      groups["Onboarding & Initial Sync"].push(task)
    } else if (name.includes("agg") || does.includes("aggregate") || does.includes("leaderboard") || does.includes("rollup")) {
      groups["Aggregation & Rollups"].push(task)
    } else if (does.includes("process") || does.includes("transform") || does.includes("move") || does.includes("staged")) {
      groups["Processing & Transformation"].push(task)
    } else if (does.includes("sync") || does.includes("pull") || does.includes("fetch") || does.includes("load")) {
      groups["Continuous Data Sync"].push(task)
    } else if (does.includes("notification") || does.includes("alert") || does.includes("email")) {
      groups["Notifications & Alerts"].push(task)
    } else {
      groups["Maintenance & Cleanup"].push(task)
    }
  })

  return groups
}

function TaskRow({ task }: { task: CompleteTask }) {
  const domainConfig = DOMAINS[task.domain]
  const DomainIcon = domainConfig?.icon || Database

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${task.active ? "bg-white" : "bg-gray-50 opacity-60"}`}>
      {/* Domain icon */}
      <div className={`p-2 rounded-lg ${domainConfig?.color || "bg-gray-500"} text-white shrink-0`}>
        <DomainIcon className="h-4 w-4" />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{task.name}</span>
          <Badge variant="outline" className="text-[10px] px-1.5">
            #{task.id}
          </Badge>
          {task.active ? (
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-400" />
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-1">
          {task.does}
        </p>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="outline" className={`text-xs ${freqColors[task.freqLabel] || ""}`}>
            <Clock className="h-3 w-3 mr-1" />
            {task.freqLabel}
          </Badge>
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
            → {task.calls}
          </code>
        </div>
      </div>
    </div>
  )
}

function DomainSection({
  domain,
  tasks,
  defaultOpen = false
}: {
  domain: keyof typeof DOMAINS
  tasks: CompleteTask[]
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const config = DOMAINS[domain]
  const Icon = config.icon
  const activeCount = tasks.filter(t => t.active).length

  // Group by frequency
  const byFreq = tasks.reduce((acc, t) => {
    acc[t.freqLabel] = (acc[t.freqLabel] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`${config.bgColor} overflow-hidden`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-black/5 transition-colors py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${config.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {config.name}
                    <Badge variant="secondary" className="text-sm">
                      {tasks.length} tasks
                    </Badge>
                    <Badge variant="outline" className="text-xs text-green-600">
                      {activeCount} active
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {config.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    💼 {config.businessValue}
                  </p>

                  {/* Frequency summary */}
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {Object.entries(byFreq)
                      .sort(([a], [b]) => {
                        const order = ["Every 1 min", "Every 3 min", "Every 5 min", "Every 1 hour", "Every 24 hours", "Every 7 days"]
                        return order.indexOf(a) - order.indexOf(b)
                      })
                      .map(([freq, count]) => (
                        <Badge key={freq} variant="outline" className={`text-[10px] ${freqColors[freq] || ""}`}>
                          {freq}: {count}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="border-t pt-4 space-y-2">
              {tasks
                .sort((a, b) => a.freq - b.freq) // Sort by frequency (fastest first)
                .map(task => (
                  <TaskRow key={task.id} task={task} />
                ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function BusinessFunctionSection({
  title,
  tasks,
  icon: Icon,
  description,
}: {
  title: string
  tasks: CompleteTask[]
  icon: React.ElementType
  description: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (tasks.length === 0) return null

  // Group by domain within this function
  const byDomain = tasks.reduce((acc, t) => {
    acc[t.domain] = acc[t.domain] || []
    acc[t.domain].push(t)
    return acc
  }, {} as Record<string, CompleteTask[]>)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {title}
                    <Badge variant="secondary">{tasks.length}</Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="border-t pt-3 space-y-3">
              {Object.entries(byDomain).map(([domain, domainTasks]) => {
                const config = DOMAINS[domain as keyof typeof DOMAINS]
                return (
                  <div key={domain}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${config?.bgColor} ${config?.textColor} text-xs`}>
                        {config?.name || domain}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {domainTasks.length} tasks
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-2">
                      {domainTasks.map(task => (
                        <div key={task.id} className="text-sm flex items-start gap-2">
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${freqColors[task.freqLabel] || ""}`}>
                            {task.freqLabel}
                          </Badge>
                          <span className="text-muted-foreground">{task.name}</span>
                        </div>
                      ))}
                    </div>
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

export function MasterTaskView() {
  const [viewBy, setViewBy] = useState<"domain" | "function">("domain")
  const stats = getAllTaskStats()

  // Group tasks by domain
  const tasksByDomain = ALL_TASKS.reduce((acc, task) => {
    acc[task.domain] = acc[task.domain] || []
    acc[task.domain].push(task)
    return acc
  }, {} as Record<string, CompleteTask[]>)

  // Group by business function
  const tasksByFunction = groupByFunction(ALL_TASKS)

  const functionIcons: Record<string, React.ElementType> = {
    "Onboarding & Initial Sync": Play,
    "Continuous Data Sync": RefreshCw,
    "Processing & Transformation": Zap,
    "Aggregation & Rollups": BarChart3,
    "Notifications & Alerts": Megaphone,
    "Maintenance & Cleanup": Database,
  }

  const functionDescriptions: Record<string, string> = {
    "Onboarding & Initial Sync": "First-time data import when users connect integrations",
    "Continuous Data Sync": "Ongoing data pulls from external APIs (reZEN, FUB, SkySlope)",
    "Processing & Transformation": "Moving staged data to production tables, data cleanup",
    "Aggregation & Rollups": "Pre-computing dashboards, leaderboards, metrics",
    "Notifications & Alerts": "Email notifications, system alerts, user messaging",
    "Maintenance & Cleanup": "System maintenance, error handling, cleanup jobs",
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Total Tasks</span>
            </div>
            <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-xs text-blue-600">Background jobs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">Active</span>
            </div>
            <p className="text-3xl font-bold text-green-700">{stats.active}</p>
            <p className="text-xs text-green-600">Currently running</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-900">High Frequency</span>
            </div>
            <p className="text-3xl font-bold text-orange-700">
              {ALL_TASKS.filter(t => t.freq <= 300).length}
            </p>
            <p className="text-xs text-orange-600">≤5 min intervals</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Domains</span>
            </div>
            <p className="text-3xl font-bold text-purple-700">{Object.keys(stats.byDomain).length}</p>
            <p className="text-xs text-purple-600">Data sources</p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="py-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            How Background Tasks Work
          </h3>
          <div className="flex items-center gap-2 text-sm flex-wrap mb-2">
            <Badge variant="outline" className="bg-blue-100">
              <Clock className="h-3 w-3 mr-1" />
              Scheduled Task
            </Badge>
            <span className="text-muted-foreground">runs every X min/hours →</span>
            <Badge variant="outline" className="bg-purple-100">
              <FileText className="h-3 w-3 mr-1" />
              Tasks/ Function
            </Badge>
            <span className="text-muted-foreground">orchestrates work →</span>
            <Badge variant="outline" className="bg-green-100">
              <Zap className="h-3 w-3 mr-1" />
              Workers/ Function
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Each of the {stats.total} background tasks runs on a schedule (1 min to 7 days) and calls a Tasks/ function.
            The Tasks/ function either does work directly or coordinates Workers/ functions for heavy lifting.
          </p>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        <button
          onClick={() => setViewBy("domain")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewBy === "domain"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          By Data Source
        </button>
        <button
          onClick={() => setViewBy("function")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewBy === "function"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          By Business Function
        </button>
      </div>

      {/* Domain View */}
      {viewBy === "domain" && (
        <div className="space-y-4">
          {(Object.keys(DOMAINS) as Array<keyof typeof DOMAINS>).map(domain => {
            const tasks = tasksByDomain[domain] || []
            if (tasks.length === 0) return null
            return (
              <DomainSection
                key={domain}
                domain={domain}
                tasks={tasks}
                defaultOpen={domain === "rezen"}
              />
            )
          })}
        </div>
      )}

      {/* Function View */}
      {viewBy === "function" && (
        <div className="space-y-3">
          {Object.entries(tasksByFunction).map(([funcName, tasks]) => (
            <BusinessFunctionSection
              key={funcName}
              title={funcName}
              tasks={tasks}
              icon={functionIcons[funcName] || Database}
              description={functionDescriptions[funcName] || ""}
            />
          ))}
        </div>
      )}

      {/* Frequency Summary Footer */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Schedule Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.byFreq)
              .sort(([, a], [, b]) => b - a)
              .map(([freq, count]) => (
                <div key={freq} className={`px-3 py-2 rounded-lg border ${freqColors[freq] || "bg-gray-50"}`}>
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs">{freq}</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
