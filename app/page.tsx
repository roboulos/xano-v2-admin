"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Database,
  Home as HomeIcon,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ArrowRight,
  Layers,
  Search,
  GitBranch,
  BarChart3,
  Sparkles,
  Code2,
  Clock,
  Loader2,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react"

import { V1_TABLES, V1_CATEGORIES, getV1Stats, type V1Table } from "@/lib/v1-data"
import { TABLES_DATA, getTableStats as getV2Stats } from "@/lib/v2-data"
import {
  getMappingStats,
  getMapping,
  getMappedV2Tables,
  MAPPING_TYPE_COLORS,
  MAPPING_TYPE_LABELS,
  type MappingType
} from "@/lib/table-mappings"
import {
  introspectionApi,
  type ComparisonSummary,
  type ApiGroupsResponse,
  type FunctionsResponse,
  type TasksResponse,
} from "@/lib/api"

type ViewMode = "live" | "mappings" | "v2only" | "stats"

// Mapping type badge component
function MappingTypeBadge({ type }: { type: MappingType }) {
  const colors = MAPPING_TYPE_COLORS[type]
  const label = MAPPING_TYPE_LABELS[type]

  return (
    <Badge className={`${colors.bg} ${colors.text} ${colors.border} hover:${colors.bg}`}>
      {label}
    </Badge>
  )
}

// Live Data Dashboard Card
function LiveDataCard({
  summary,
  apiGroups,
  functions,
  tasks,
  isLoading,
  onRefresh,
  lastUpdated,
}: {
  summary: ComparisonSummary | null
  apiGroups: ApiGroupsResponse | null
  functions: FunctionsResponse | null
  tasks: TasksResponse | null
  isLoading: boolean
  onRefresh: () => void
  lastUpdated: Date | null
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  if (isLoading && !summary) {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading live data from Xano Meta API...</p>
          <p className="text-xs text-muted-foreground">This may take up to 2 minutes for the first load</p>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card className="border-2 border-dashed border-red-300">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <WifiOff className="h-8 w-8 text-red-500" />
          <p className="text-muted-foreground">Failed to load live data</p>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const sections = [
    {
      id: "tables",
      icon: Database,
      label: "Tables",
      v1: summary.summary.tables.v1,
      v2: summary.summary.tables.v2,
      color: "blue",
    },
    {
      id: "api_groups",
      icon: Code2,
      label: "API Groups",
      v1: summary.summary.api_groups.v1,
      v2: summary.summary.api_groups.v2,
      color: "purple",
    },
    {
      id: "functions",
      icon: Zap,
      label: "Functions",
      v1: summary.summary.functions.v1,
      v2: summary.summary.functions.v2,
      color: "amber",
    },
    {
      id: "tasks",
      icon: Clock,
      label: "Background Tasks",
      v1: summary.summary.background_tasks.v1,
      v2: summary.summary.background_tasks.v2,
      color: "emerald",
    },
  ]

  return (
    <div className="space-y-4">
      {/* Live Status Header */}
      <Card className="border-2 border-solid border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
                <Wifi className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Live Workspace Comparison</h3>
                <p className="text-sm text-muted-foreground">
                  Data fetched from Xano Meta API
                  {lastUpdated && (
                    <span className="ml-2 text-xs">
                      • Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button onClick={onRefresh} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Grid */}
      <div className="grid grid-cols-4 gap-4">
        {sections.map((section) => {
          const Icon = section.icon
          const colorClasses = {
            blue: "border-l-blue-500 text-blue-600",
            purple: "border-l-purple-500 text-purple-600",
            amber: "border-l-amber-500 text-amber-600",
            emerald: "border-l-emerald-500 text-emerald-600",
          }
          return (
            <Card
              key={section.id}
              className={`border-l-4 ${colorClasses[section.color as keyof typeof colorClasses]} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-2xl font-bold">{section.v1}</div>
                    <div className="text-xs text-muted-foreground">V1</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-bold">{section.v2}</div>
                    <div className="text-xs text-muted-foreground">V2</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Expanded Section Details */}
      {expandedSection === "api_groups" && apiGroups && (
        <Card className="border-2 border-solid border-purple-300/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-purple-600" />
              API Groups Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-blue-600">V1 API Groups ({apiGroups.v1.total})</h4>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {apiGroups.v1.groups.map((g) => (
                    <div key={g.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50">
                      <Badge variant="outline" className="font-mono text-xs">{g.id}</Badge>
                      <span>{g.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-emerald-600">V2 API Groups ({apiGroups.v2.total})</h4>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {apiGroups.v2.groups.map((g) => (
                    <div key={g.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50">
                      <Badge variant="outline" className="font-mono text-xs">{g.id}</Badge>
                      <span>{g.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {expandedSection === "functions" && functions && (
        <Card className="border-2 border-solid border-amber-300/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              Functions Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-blue-600">V1 Functions ({functions.v1.total})</h4>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {functions.v1.functions.slice(0, 50).map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50">
                      <Badge variant="outline" className="font-mono text-xs">{f.id}</Badge>
                      <span className="font-mono text-xs">{f.name}</span>
                    </div>
                  ))}
                  {functions.v1.total > 50 && (
                    <p className="text-xs text-muted-foreground p-2">+{functions.v1.total - 50} more...</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-emerald-600">V2 Functions ({functions.v2.total})</h4>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {functions.v2.functions.slice(0, 50).map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50">
                      <Badge variant="outline" className="font-mono text-xs">{f.id}</Badge>
                      <span className="font-mono text-xs">{f.name}</span>
                    </div>
                  ))}
                  {functions.v2.total > 50 && (
                    <p className="text-xs text-muted-foreground p-2">+{functions.v2.total - 50} more...</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {expandedSection === "tasks" && tasks && (
        <Card className="border-2 border-solid border-emerald-300/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Background Tasks Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-blue-600">V1 Tasks ({tasks.v1.total})</h4>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {tasks.v1.tasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50">
                      <Badge variant="outline" className="font-mono text-xs">{t.id}</Badge>
                      <span className="text-xs">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-emerald-600">V2 Tasks ({tasks.v2.total})</h4>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {tasks.v2.tasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50">
                      <Badge variant="outline" className="font-mono text-xs">{t.id}</Badge>
                      <span className="text-xs">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// V1 Category Card with collapsible pattern matching demo-sync
function V1CategoryCard({
  category,
  tables,
  searchQuery
}: {
  category: typeof V1_CATEGORIES[0]
  tables: V1Table[]
  searchQuery: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const filteredTables = tables.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (filteredTables.length === 0 && searchQuery) return null

  // Count mapping types in this category
  const mappingCounts = {
    direct: 0,
    renamed: 0,
    split: 0,
    merged: 0,
    deprecated: 0,
  }

  for (const table of filteredTables) {
    const mapping = getMapping(table.name)
    if (mapping) {
      mappingCounts[mapping.type as keyof typeof mappingCounts]++
    }
  }

  return (
    <Card className={`transition-all duration-200 ${
      isOpen
        ? "border-2 border-solid border-primary/30 shadow-md"
        : "border-2 border-dashed border-muted hover:border-primary/20 hover:shadow-sm"
    }`}>
      <CardHeader
        className="cursor-pointer select-none pb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="text-xl">{category.icon}</span>
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {category.label}
                <Badge variant="secondary" className="ml-2">{filteredTables.length} tables</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {isOpen ? "Click to collapse" : "Click to expand and see V2 mappings →"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mappingCounts.direct > 0 && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">{mappingCounts.direct} direct</Badge>
            )}
            {mappingCounts.split > 0 && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">{mappingCounts.split} split</Badge>
            )}
            {mappingCounts.deprecated > 0 && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">{mappingCounts.deprecated} deprecated</Badge>
            )}
            {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[150px] font-medium">V1 Table</TableHead>
                <TableHead className="w-[100px] font-medium">Type</TableHead>
                <TableHead className="font-medium">V2 Table(s)</TableHead>
                <TableHead className="font-medium">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTables.map((table) => {
                const mapping = getMapping(table.name)
                return (
                  <TableRow key={table.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {table.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mapping && <MappingTypeBadge type={mapping.type} />}
                    </TableCell>
                    <TableCell>
                      {mapping && mapping.v2_tables.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {mapping.v2_tables.map((v2Table, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={`font-mono text-xs ${
                                v2Table === mapping.primary_v2_table
                                  ? "border-primary/50 bg-primary/10"
                                  : ""
                              }`}
                            >
                              {v2Table}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs">
                      {mapping?.notes || table.description}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  )
}

// V2 Only Tables Card
function V2OnlyTablesCard({ searchQuery }: { searchQuery: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const mappedV2Tables = getMappedV2Tables()
  const v2OnlyTables = TABLES_DATA.filter(t => !mappedV2Tables.includes(t.name))

  const filteredTables = v2OnlyTables.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (filteredTables.length === 0) return null

  // Group by first tag or "other"
  const groupedTables: Record<string, typeof filteredTables> = {}
  for (const table of filteredTables) {
    const category = table.tags[0] || "📦 other"
    if (!groupedTables[category]) groupedTables[category] = []
    groupedTables[category].push(table)
  }

  return (
    <Card className={`transition-all duration-200 ${
      isOpen
        ? "border-2 border-solid border-primary/30 shadow-md"
        : "border-2 border-dashed border-muted hover:border-primary/20 hover:shadow-sm"
    }`}>
      <CardHeader
        className="cursor-pointer select-none pb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                New in V2 (No V1 Source)
                <Badge variant="secondary" className="ml-2">{filteredTables.length} tables</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {isOpen ? "Click to collapse" : "Tables that exist only in the V2 normalized schema →"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">{filteredTables.length} new</Badge>
            {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {Object.entries(groupedTables).slice(0, 10).map(([category, tables]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-foreground mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {tables.slice(0, 15).map((table) => (
                    <Badge
                      key={table.id}
                      variant="outline"
                      className="font-mono text-xs"
                      title={table.description || ""}
                    >
                      {table.name}
                    </Badge>
                  ))}
                  {tables.length > 15 && (
                    <Badge variant="outline" className="text-muted-foreground text-xs">
                      +{tables.length - 15} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {Object.keys(groupedTables).length > 10 && (
              <p className="text-sm text-muted-foreground">
                +{Object.keys(groupedTables).length - 10} more categories...
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Main page component
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("live")

  // Live data state
  const [liveData, setLiveData] = useState<{
    summary: ComparisonSummary | null
    apiGroups: ApiGroupsResponse | null
    functions: FunctionsResponse | null
    tasks: TasksResponse | null
    isLoading: boolean
    lastUpdated: Date | null
  }>({
    summary: null,
    apiGroups: null,
    functions: null,
    tasks: null,
    isLoading: false,
    lastUpdated: null,
  })

  // Fetch live data
  const fetchLiveData = async () => {
    setLiveData(prev => ({ ...prev, isLoading: true }))
    try {
      const [summary, apiGroups, functions, tasks] = await Promise.all([
        introspectionApi.getComparisonSummary(),
        introspectionApi.getApiGroups(),
        introspectionApi.getFunctions(),
        introspectionApi.getBackgroundTasks(),
      ])
      setLiveData({
        summary,
        apiGroups,
        functions,
        tasks,
        isLoading: false,
        lastUpdated: new Date(),
      })
    } catch (error) {
      console.error("Failed to fetch live data:", error)
      setLiveData(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Fetch on mount when live view is active
  useEffect(() => {
    if (viewMode === "live" && !liveData.summary && !liveData.isLoading) {
      fetchLiveData()
    }
  }, [viewMode])

  // Static stats
  const v1Stats = getV1Stats()
  const v2Stats = getV2Stats()
  const mappingStats = getMappingStats()
  const mappedV2Tables = getMappedV2Tables()
  const v2OnlyCount = TABLES_DATA.length - mappedV2Tables.length

  // Group V1 tables by category
  const v1TablesByCategory = useMemo(() => {
    const grouped: Record<string, V1Table[]> = {}
    for (const cat of V1_CATEGORIES) {
      grouped[cat.id] = V1_TABLES.filter(t => t.category === cat.id)
    }
    return grouped
  }, [])

  const viewModes = [
    { id: "live" as ViewMode, label: "Live Data", icon: Wifi, description: "Real-time from Xano Meta API" },
    { id: "mappings" as ViewMode, label: "Table Mappings", icon: GitBranch, description: "V1 → V2 table relationships" },
    { id: "v2only" as ViewMode, label: "V2 Only", icon: Sparkles, description: "New tables in V2 schema" },
    { id: "stats" as ViewMode, label: "Statistics", icon: BarChart3, description: "Migration overview stats" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">V1 → V2 Migration</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Layers className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                V1 → V2 Migration Admin
              </h1>
              <p className="text-muted-foreground mt-1">
                Comparing AgentDashboards Xano Workspaces
              </p>
            </div>
          </div>

          {/* Dynamic Info Bar */}
          <div className="flex items-center gap-6 text-sm border rounded-xl px-5 py-4 bg-card/50 backdrop-blur-sm shadow-sm mt-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">V1:</span>
              <span className="font-semibold text-blue-600">
                {liveData.summary?.summary.tables.v1 || v1Stats.total} tables
              </span>
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground">V2:</span>
              <span className="font-semibold text-emerald-600">
                {liveData.summary?.summary.tables.v2 || v2Stats.total} tables
              </span>
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Mapped:</span>
              <span className="font-semibold text-green-600">{mappingStats.total - mappingStats.deprecated}</span>
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Split:</span>
              <span className="font-semibold text-purple-600">{mappingStats.split}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {liveData.summary && (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {v2OnlyCount} V2 only
              </Badge>
            </div>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl w-fit">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${viewMode === mode.id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
              >
                <mode.icon className="h-4 w-4" />
                {mode.label}
              </button>
            ))}
          </div>

          {viewMode !== "live" && (
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        {/* Content based on view mode */}
        <div className="space-y-4">
          {viewMode === "live" && (
            <LiveDataCard
              summary={liveData.summary}
              apiGroups={liveData.apiGroups}
              functions={liveData.functions}
              tasks={liveData.tasks}
              isLoading={liveData.isLoading}
              onRefresh={fetchLiveData}
              lastUpdated={liveData.lastUpdated}
            />
          )}

          {viewMode === "mappings" && (
            <>
              {V1_CATEGORIES.map((cat) => {
                const tables = v1TablesByCategory[cat.id] || []
                if (tables.length === 0) return null
                return (
                  <V1CategoryCard
                    key={cat.id}
                    category={cat}
                    tables={tables}
                    searchQuery={searchQuery}
                  />
                )
              })}
            </>
          )}

          {viewMode === "v2only" && (
            <V2OnlyTablesCard searchQuery={searchQuery} />
          )}

          {viewMode === "stats" && (
            <>
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-blue-700">{v1Stats.total}</div>
                    <div className="text-sm text-muted-foreground">V1 Tables</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-emerald-700">{v2Stats.total}</div>
                    <div className="text-sm text-muted-foreground">V2 Tables</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-green-700">{mappingStats.total - mappingStats.deprecated}</div>
                    <div className="text-sm text-muted-foreground">V1 → V2 Mapped</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-purple-700">{mappingStats.split}</div>
                    <div className="text-sm text-muted-foreground">Split Tables (1:N)</div>
                  </CardContent>
                </Card>
              </div>

              {/* Migration Type Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Migration Type Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-sm px-3 py-1.5">
                      {mappingStats.direct} Direct (1:1)
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-sm px-3 py-1.5">
                      {mappingStats.renamed} Renamed
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 text-sm px-3 py-1.5">
                      {mappingStats.split} Split (1:N)
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 text-sm px-3 py-1.5">
                      {mappingStats.merged} Merged (N:1)
                    </Badge>
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-sm px-3 py-1.5">
                      {mappingStats.deprecated} Deprecated
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            V1 → V2 Migration Admin • Frontend Reveals Backend
          </p>
          <p className="mt-1 text-xs">
            Comparing {liveData.summary?.summary.tables.v1 || v1Stats.total} V1 tables against {liveData.summary?.summary.tables.v2 || v2Stats.total} V2 normalized tables
          </p>
        </div>
      </div>
    </div>
  )
}
