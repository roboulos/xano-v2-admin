"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Phone,
  Building,
  FileText,
  Settings,
  DollarSign,
  BarChart,
  Shield,
  Wrench,
  Link2,
  Layers,
  Network,
  FileCheck,
  Loader2,
  Tag,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  WORKERS_FUNCTIONS,
  getWorkersFunctionsStats,
  WORKER_DOMAIN_CONFIG,
  WORKER_CATEGORY_CONFIG,
  type WorkerFunction,
  type WorkerDomain,
  type WorkerCategory,
} from "@/lib/workers-inventory"

// Domain icon map
const DOMAIN_ICONS: Record<WorkerDomain, React.ReactNode> = {
  fub: <Phone className="h-4 w-4" />,
  rezen: <Building className="h-4 w-4" />,
  skyslope: <FileText className="h-4 w-4" />,
  network: <Network className="h-4 w-4" />,
  title: <FileCheck className="h-4 w-4" />,
  ad: <Settings className="h-4 w-4" />,
  income: <DollarSign className="h-4 w-4" />,
  metrics: <BarChart className="h-4 w-4" />,
  auth: <Shield className="h-4 w-4" />,
  utility: <Wrench className="h-4 w-4" />,
  linking: <Link2 className="h-4 w-4" />,
  aggregation: <Layers className="h-4 w-4" />,
}

// Status configuration
const STATUS_CONFIG = {
  tested: { color: "text-green-600 bg-green-100", icon: <CheckCircle className="h-4 w-4" /> },
  untested: { color: "text-gray-600 bg-gray-100", icon: <Clock className="h-4 w-4" /> },
  broken: { color: "text-red-600 bg-red-100", icon: <XCircle className="h-4 w-4" /> },
}

export default function WorkersInventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [fpPatternFilter, setFpPatternFilter] = useState(false)
  const [sortField, setSortField] = useState<"name" | "domain" | "category" | "status" | "id">("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [testingFunction, setTestingFunction] = useState<number | null>(null)
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; message: string; time: number }>>({})

  const stats = useMemo(() => getWorkersFunctionsStats(), [])

  // Filter and sort functions
  const filteredFunctions = useMemo(() => {
    let result = [...WORKERS_FUNCTIONS]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        f =>
          f.name.toLowerCase().includes(query) ||
          f.shortName.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query) ||
          f.id.toString().includes(query)
      )
    }

    // Apply domain filter
    if (domainFilter !== "all") {
      result = result.filter(f => f.domain === domainFilter)
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(f => f.category === categoryFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(f => f.status === statusFilter)
    }

    // Apply FP pattern filter
    if (fpPatternFilter) {
      result = result.filter(f =>
        f.tags.some(t => t.toLowerCase().includes("fp-pattern") || t.toLowerCase().includes("fp-result-type"))
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "id":
          comparison = a.id - b.id
          break
        case "name":
          comparison = a.shortName.localeCompare(b.shortName)
          break
        case "domain":
          comparison = a.domain.localeCompare(b.domain)
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [searchQuery, domainFilter, categoryFilter, statusFilter, fpPatternFilter, sortField, sortDirection])

  // Toggle row expansion
  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Handle sort toggle
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Simulate testing a function
  const handleTestFunction = async (fn: WorkerFunction) => {
    setTestingFunction(fn.id)
    const startTime = Date.now()

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Random success/failure for demo
      const success = Math.random() > 0.3

      setTestResults(prev => ({
        ...prev,
        [fn.id]: {
          success,
          message: success ? "Function executed successfully" : "Function returned an error",
          time: Date.now() - startTime,
        },
      }))
    } catch {
      setTestResults(prev => ({
        ...prev,
        [fn.id]: {
          success: false,
          message: "Network error",
          time: Date.now() - startTime,
        },
      }))
    } finally {
      setTestingFunction(null)
    }
  }

  // Get sort icon
  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    )
  }

  // Check if function has FP pattern
  const hasFpTag = (fn: WorkerFunction) =>
    fn.tags.some(t => t.toLowerCase().includes("fp-pattern") || t.toLowerCase().includes("fp-result-type"))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Workers/ Function Inventory</h1>
            <p className="text-sm text-muted-foreground">
              All {stats.total} Workers/ functions from V2 Workspace (Workspace 5)
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            V2 Workspace
          </Badge>
        </div>

        {/* Stats Summary - Top Domains */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {/* Show top domains by count */}
          {(Object.entries(stats.byDomain) as [WorkerDomain, number][])
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([domain, count]) => (
              <div
                key={domain}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  domainFilter === domain ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setDomainFilter(domainFilter === domain ? "all" : domain)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {DOMAIN_ICONS[domain]}
                  <span className="text-sm font-medium">{WORKER_DOMAIN_CONFIG[domain].name}</span>
                </div>
                <div className="text-2xl font-bold">{count}</div>
              </div>
            ))}
        </div>

        {/* Category & Status Stats */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Categories:</span>
            {(Object.entries(stats.byCategory) as [WorkerCategory, number][])
              .filter(([, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <Badge
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
                >
                  {WORKER_CATEGORY_CONFIG[cat].name}: {count}
                </Badge>
              ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {(["tested", "untested", "broken"] as const).map(status => (
              <Badge
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                className={`cursor-pointer ${STATUS_CONFIG[status].color}`}
                onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
              >
                {status}: {stats.byStatus[status]}
              </Badge>
            ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <Badge
              variant={fpPatternFilter ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFpPatternFilter(!fpPatternFilter)}
            >
              FP Pattern: {stats.hasFpPattern}
            </Badge>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
            className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="all">All Domains</option>
            {(Object.entries(WORKER_DOMAIN_CONFIG) as [WorkerDomain, { name: string; color: string }][]).map(([domain, config]) => (
              <option key={domain} value={domain}>
                {config.name}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="all">All Categories</option>
            {(Object.entries(WORKER_CATEGORY_CONFIG) as [WorkerCategory, { name: string }][]).map(([cat, config]) => (
              <option key={cat} value={cat}>
                {config.name}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setDomainFilter("all")
              setCategoryFilter("all")
              setStatusFilter("all")
              setFpPatternFilter(false)
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredFunctions.length} of {stats.total} functions
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-[80px] cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("id")}
                >
                  ID
                  <SortIcon field="id" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("name")}
                >
                  Function Name
                  <SortIcon field="name" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("domain")}
                >
                  Domain
                  <SortIcon field="domain" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("category")}
                >
                  Category
                  <SortIcon field="category" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <SortIcon field="status" />
                </TableHead>
                <TableHead className="w-[80px]">FP</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFunctions.map((fn) => (
                <>
                  <TableRow
                    key={fn.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      expandedRows.has(fn.id) ? "bg-muted/30" : ""
                    }`}
                    onClick={() => toggleRow(fn.id)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {fn.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{fn.shortName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-full w-fit ${WORKER_DOMAIN_CONFIG[fn.domain].color}`}>
                        {DOMAIN_ICONS[fn.domain]}
                        <span className="text-xs font-medium">{WORKER_DOMAIN_CONFIG[fn.domain].name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {WORKER_CATEGORY_CONFIG[fn.category].name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${STATUS_CONFIG[fn.status].color} px-2 py-1 rounded-full w-fit`}>
                        {STATUS_CONFIG[fn.status].icon}
                        <span className="text-xs font-medium capitalize">{fn.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasFpTag(fn) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Zap className="h-4 w-4 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>FP Result Type Pattern</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={testResults[fn.id]?.success ? "default" : "outline"}
                        onClick={e => {
                          e.stopPropagation()
                          handleTestFunction(fn)
                        }}
                        disabled={testingFunction === fn.id}
                      >
                        {testingFunction === fn.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : testResults[fn.id] ? (
                          testResults[fn.id].success ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        <span className="ml-1">Test</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                  {/* Expanded Row Details */}
                  {expandedRows.has(fn.id) && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/20 p-4">
                        <div className="grid gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Full Path</h4>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{fn.name}</code>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">{fn.description}</p>
                          </div>
                          {fn.tags.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-1 flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Tags
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {fn.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium mb-1">Last Updated</h4>
                            <p className="text-sm text-muted-foreground">{fn.updatedAt}</p>
                          </div>
                          {fn.expectedInputs.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-1">Expected Inputs</h4>
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {fn.expectedInputs.join(", ")}
                              </code>
                            </div>
                          )}
                          {fn.notes && (
                            <div>
                              <h4 className="font-medium mb-1">Notes</h4>
                              <p className="text-sm text-muted-foreground">{fn.notes}</p>
                            </div>
                          )}
                          {testResults[fn.id] && (
                            <div className={`p-3 rounded ${testResults[fn.id].success ? "bg-green-100" : "bg-red-100"}`}>
                              <h4 className="font-medium mb-1">Test Result</h4>
                              <p className="text-sm">
                                {testResults[fn.id].message} ({testResults[fn.id].time}ms)
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Workers/ Function Inventory - V2 Workspace (Workspace 5)</p>
          <p className="text-xs mt-1">
            {stats.total} functions across {Object.keys(WORKER_DOMAIN_CONFIG).length} domains |{" "}
            {stats.hasFpPattern} with FP Result Type pattern
          </p>
        </div>
      </div>
    </div>
  )
}
