"use client"

import { useState, useMemo } from "react"
import { Search, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ALL_TASKS, getAllTaskStats, type CompleteTask } from "@/lib/all-tasks-complete"

const domainColors: Record<string, string> = {
  rezen: "bg-green-100 text-green-800",
  fub: "bg-blue-100 text-blue-800",
  skyslope: "bg-purple-100 text-purple-800",
  title: "bg-yellow-100 text-yellow-800",
  aggregation: "bg-orange-100 text-orange-800",
  ad: "bg-slate-100 text-slate-800",
  reporting: "bg-red-100 text-red-800",
  metrics: "bg-cyan-100 text-cyan-800",
}

const freqColors: Record<string, string> = {
  "Every 1 min": "bg-red-50 text-red-700 border-red-200",
  "Every 3 min": "bg-orange-50 text-orange-700 border-orange-200",
  "Every 5 min": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Every 1 hour": "bg-blue-50 text-blue-700 border-blue-200",
  "Every 24 hours": "bg-green-50 text-green-700 border-green-200",
  "Every 7 days": "bg-purple-50 text-purple-700 border-purple-200",
}

type SortField = "id" | "name" | "freq" | "domain"
type SortDir = "asc" | "desc"

export function AllTasksTable() {
  const [search, setSearch] = useState("")
  const [domainFilter, setDomainFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("domain")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const stats = getAllTaskStats()

  const filteredTasks = useMemo(() => {
    let tasks = [...ALL_TASKS]

    // Filter by search
    if (search) {
      const s = search.toLowerCase()
      tasks = tasks.filter(
        t =>
          t.name.toLowerCase().includes(s) ||
          t.does.toLowerCase().includes(s) ||
          t.calls.toLowerCase().includes(s) ||
          t.id.toString().includes(s)
      )
    }

    // Filter by domain
    if (domainFilter) {
      tasks = tasks.filter(t => t.domain === domainFilter)
    }

    // Sort
    tasks.sort((a, b) => {
      let cmp = 0
      if (sortField === "id") cmp = a.id - b.id
      else if (sortField === "name") cmp = a.name.localeCompare(b.name)
      else if (sortField === "freq") cmp = a.freq - b.freq
      else if (sortField === "domain") cmp = a.domain.localeCompare(b.domain)
      return sortDir === "asc" ? cmp : -cmp
    })

    return tasks
  }, [search, domainFilter, sortField, sortDir])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-1" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        <button
          onClick={() => setDomainFilter(null)}
          className={`p-3 rounded-lg border text-left transition-all ${
            !domainFilter ? "ring-2 ring-primary" : ""
          }`}
        >
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">All Tasks</div>
        </button>
        {Object.entries(stats.byDomain).map(([domain, count]) => (
          <button
            key={domain}
            onClick={() => setDomainFilter(domainFilter === domain ? null : domain)}
            className={`p-3 rounded-lg border text-left transition-all ${
              domainFilter === domain ? "ring-2 ring-primary" : ""
            } ${domainColors[domain]}`}
          >
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs uppercase font-medium">{domain}</div>
          </button>
        ))}
      </div>

      {/* Frequency breakdown */}
      <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
        <span className="text-sm font-medium mr-2">By Schedule:</span>
        {Object.entries(stats.byFreq)
          .sort(([, a], [, b]) => b - a)
          .map(([freq, count]) => (
            <Badge key={freq} variant="outline" className={freqColors[freq] || ""}>
              {freq}: {count}
            </Badge>
          ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, function, description, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTasks.length} of {ALL_TASKS.length} tasks
        {domainFilter && <span className="ml-2">(filtered by {domainFilter})</span>}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead
                className="w-[70px] cursor-pointer hover:bg-muted"
                onClick={() => toggleSort("id")}
              >
                ID <SortIcon field="id" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => toggleSort("name")}
              >
                Task Name <SortIcon field="name" />
              </TableHead>
              <TableHead
                className="w-[120px] cursor-pointer hover:bg-muted"
                onClick={() => toggleSort("freq")}
              >
                Schedule <SortIcon field="freq" />
              </TableHead>
              <TableHead
                className="w-[100px] cursor-pointer hover:bg-muted"
                onClick={() => toggleSort("domain")}
              >
                Domain <SortIcon field="domain" />
              </TableHead>
              <TableHead className="w-[50px]">Active</TableHead>
              <TableHead>Calls Function</TableHead>
              <TableHead>What It Does</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow
                key={task.id}
                className={!task.active ? "opacity-50 bg-muted/20" : ""}
              >
                <TableCell className="font-mono text-xs">#{task.id}</TableCell>
                <TableCell className="font-medium text-sm">{task.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs ${freqColors[task.freqLabel] || ""}`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {task.freqLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${domainColors[task.domain]}`}>
                    {task.domain.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.active ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {task.calls}
                  </code>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-md">
                  {task.does}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
