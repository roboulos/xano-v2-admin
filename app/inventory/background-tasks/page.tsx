"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  ArrowLeft,
  Database,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface BackgroundTask {
  id: number
  name: string
  description: string
  guid: string
  active: boolean
  branch: string
  tag: string[]
  datasource: string
  created_at: string
  updated_at: string
}

interface TasksResponse {
  success: boolean
  workspace: string
  total: number
  active: number
  inactive: number
  tasks: BackgroundTask[]
  fetchedAt: string
  error?: string
}

// Domain color map
const domainColors: Record<string, string> = {
  rezen: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  fub: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  skyslope: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  title: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  aggregation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ad: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  reporting: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  metrics: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  internal: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

function inferDomain(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes("rezen") || lower.includes("reZEN")) return "rezen"
  if (lower.includes("fub")) return "fub"
  if (lower.includes("skyslope")) return "skyslope"
  if (lower.includes("title") || lower.includes("qualia")) return "title"
  if (lower.includes("aggregation") || lower.includes("leaderboard")) return "aggregation"
  if (lower.includes("ad -") || lower.includes("email") || lower.includes("upload") || lower.includes("csv") || lower.includes("linking") || lower.includes("commission")) return "ad"
  if (lower.includes("reporting") || lower.includes("slack")) return "reporting"
  if (lower.includes("metrics") || lower.includes("snapshot")) return "metrics"
  return "internal"
}

export default function BackgroundTasksInventoryPage() {
  const [tasks, setTasks] = useState<BackgroundTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/background-tasks?workspace=v2")
      const data: TasksResponse = await response.json()

      if (data.success) {
        setTasks(data.tasks)
        setStats({
          total: data.total,
          active: data.active,
          inactive: data.inactive,
        })
        setFetchedAt(data.fetchedAt)
      } else {
        setError(data.error || "Failed to fetch tasks")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Get unique domains for filter
  const domains = Array.from(new Set(tasks.map(t => inferDomain(t.name)))).sort()

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      const matchesSearch =
        task.name.toLowerCase().includes(lower) ||
        task.description.toLowerCase().includes(lower) ||
        task.id.toString().includes(lower) ||
        task.tag.some(tag => tag.toLowerCase().includes(lower))
      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter === "active" && !task.active) return false
    if (statusFilter === "inactive" && task.active) return false

    // Domain filter
    if (domainFilter !== "all") {
      const taskDomain = inferDomain(task.name)
      if (taskDomain !== domainFilter) return false
    }

    return true
  })

  // Count by domain
  const domainCounts: Record<string, number> = {}
  tasks.forEach(task => {
    const domain = inferDomain(task.name)
    domainCounts[domain] = (domainCounts[domain] || 0) + 1
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-500" />
                Background Tasks Inventory
              </h1>
              <p className="text-sm text-muted-foreground">
                V2 Workspace (Workspace 5) - Live Data from Xano
              </p>
            </div>
          </div>
          <Button onClick={fetchTasks} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Database className="h-4 w-4" />
              Total Tasks
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Active
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <XCircle className="h-4 w-4" />
              Inactive
            </div>
            <div className="text-3xl font-bold text-gray-500">{stats.inactive}</div>
          </div>
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              Last Fetched
            </div>
            <div className="text-sm font-mono">
              {fetchedAt ? new Date(fetchedAt).toLocaleTimeString() : "-"}
            </div>
          </div>
        </div>

        {/* Domain Stats */}
        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-card border rounded-lg">
          {Object.entries(domainCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([domain, count]) => (
              <Badge
                key={domain}
                variant="outline"
                className={`${domainColors[domain]} cursor-pointer`}
                onClick={() => setDomainFilter(domain === domainFilter ? "all" : domain)}
              >
                {domain}: {count}
              </Badge>
            ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks by name, ID, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </Button>
          </div>
          {domainFilter !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDomainFilter("all")}
            >
              Clear Domain: {domainFilter}
            </Button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Error: {error}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Domain</TableHead>
                <TableHead className="w-[200px]">Tags</TableHead>
                <TableHead className="w-[180px]">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading tasks...
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No tasks found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => {
                  const domain = inferDomain(task.name)
                  return (
                    <TableRow key={task.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm">{task.id}</TableCell>
                      <TableCell>
                        {task.active ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{task.name}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-md">
                            {task.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={domainColors[domain]}>
                          {domain}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {task.tag.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {task.tag.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{task.tag.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(task.updated_at).toLocaleDateString()}
                        <br />
                        {new Date(task.updated_at).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Background Tasks Inventory - V2 Workspace (ID: 5)</p>
          <p className="text-xs mt-1">
            Data fetched live from Xano Meta API
          </p>
        </div>
      </div>
    </div>
  )
}
