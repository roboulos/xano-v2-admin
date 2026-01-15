"use client"

import { useState, useMemo } from "react"
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  Loader2,
  GitBranch,
  Pause,
  CheckCircle,
  Search,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BACKGROUND_TASKS, getTaskStats, DOMAIN_INFO } from "@/lib/task-data"
import type { BackgroundTask, TaskDomain } from "@/lib/types-v2"

interface TaskListViewProps {
  isRunning: (taskId: number) => boolean
  onRunTask: (task: BackgroundTask) => void
}

type FilterMode = "all" | "scheduled" | "active" | "inactive"

// Domain colors
const domainColors: Record<TaskDomain, string> = {
  fub: "bg-blue-100 text-blue-700 border-blue-200",
  rezen: "bg-green-100 text-green-700 border-green-200",
  skyslope: "bg-purple-100 text-purple-700 border-purple-200",
  aggregation: "bg-orange-100 text-orange-700 border-orange-200",
  title: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ad: "bg-slate-100 text-slate-700 border-slate-200",
  reporting: "bg-red-100 text-red-700 border-red-200",
  metrics: "bg-cyan-100 text-cyan-700 border-cyan-200",
}

function TaskRow({
  task,
  isRunning,
  onRunTask,
}: {
  task: BackgroundTask
  isRunning: boolean
  onRunTask: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasSchedule = task.schedule !== null
  const isInactive = !task.active

  return (
    <div
      className={`border rounded-lg transition-all ${
        isInactive ? "opacity-60 bg-gray-50" : "bg-white hover:border-primary/30"
      }`}
    >
      {/* Main row - always visible */}
      <div className="p-3 flex items-start gap-3">
        {/* Run button */}
        <Button
          variant={isInactive ? "ghost" : "outline"}
          size="sm"
          onClick={onRunTask}
          disabled={isRunning || isInactive}
          className="shrink-0 h-8 w-8 p-0"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Task info - grows to fill space */}
        <div className="flex-1 min-w-0">
          {/* Task name - full width, no truncation */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{task.name}</span>
            {/* Domain badge */}
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 ${domainColors[task.domain]}`}
            >
              {DOMAIN_INFO[task.domain].name}
            </Badge>
            {/* Status indicators */}
            {isInactive && (
              <Badge variant="secondary" className="text-[10px] px-1.5 bg-gray-200 text-gray-600">
                <Pause className="h-3 w-3 mr-0.5" />
                Inactive
              </Badge>
            )}
            {hasSchedule && (
              <Badge variant="secondary" className="text-[10px] px-1.5 bg-blue-100 text-blue-700">
                <Clock className="h-3 w-3 mr-0.5" />
                {task.schedule!.frequencyLabel}
              </Badge>
            )}
          </div>

          {/* Function call - always visible */}
          {task.callsFunction && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <GitBranch className="h-3 w-3 shrink-0" />
              <code className="font-mono bg-muted px-1 rounded">{task.callsFunction}</code>
            </div>
          )}
        </div>

        {/* Task ID + expand */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">#{task.id}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t mx-3 mt-0">
          <div className="pt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">Schedule</p>
              {task.schedule ? (
                <div className="space-y-1">
                  <p><strong>Frequency:</strong> {task.schedule.frequencyLabel} ({task.schedule.frequency}s)</p>
                  <p><strong>Starts:</strong> {task.schedule.startsOn}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">Not scheduled - triggered by other tasks</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Timestamps</p>
              <p><strong>Created:</strong> {task.created}</p>
              <p><strong>Modified:</strong> {task.lastModified}</p>
            </div>
            {task.tags.length > 0 && (
              <div className="col-span-2">
                <p className="text-muted-foreground mb-1">Tags</p>
                <div className="flex gap-1 flex-wrap">
                  {task.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-[10px] px-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function TaskListView({ isRunning, onRunTask }: TaskListViewProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterMode>("all")
  const [expandedDomains, setExpandedDomains] = useState<Set<TaskDomain>>(
    new Set(["aggregation", "fub", "rezen", "skyslope", "title", "ad", "reporting", "metrics"])
  )

  const stats = getTaskStats()

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let tasks = [...BACKGROUND_TASKS]

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      tasks = tasks.filter(
        t =>
          t.name.toLowerCase().includes(searchLower) ||
          (t.callsFunction && t.callsFunction.toLowerCase().includes(searchLower)) ||
          t.id.toString().includes(searchLower)
      )
    }

    // Apply filter
    switch (filter) {
      case "scheduled":
        tasks = tasks.filter(t => t.schedule !== null)
        break
      case "active":
        tasks = tasks.filter(t => t.active)
        break
      case "inactive":
        tasks = tasks.filter(t => !t.active)
        break
    }

    return tasks
  }, [search, filter])

  // Group by domain
  const tasksByDomain = useMemo(() => {
    const grouped: Record<TaskDomain, BackgroundTask[]> = {
      aggregation: [],
      fub: [],
      rezen: [],
      skyslope: [],
      title: [],
      ad: [],
      reporting: [],
      metrics: [],
    }
    for (const task of filteredTasks) {
      grouped[task.domain].push(task)
    }
    return grouped
  }, [filteredTasks])

  const toggleDomain = (domain: TaskDomain) => {
    setExpandedDomains(prev => {
      const next = new Set(prev)
      if (next.has(domain)) {
        next.delete(domain)
      } else {
        next.add(domain)
      }
      return next
    })
  }

  const domainOrder: TaskDomain[] = [
    "aggregation",
    "rezen",
    "fub",
    "skyslope",
    "title",
    "ad",
    "reporting",
    "metrics",
  ]

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="p-3 bg-muted/50 rounded-lg border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold">
              {filteredTasks.length} of {BACKGROUND_TASKS.length} tasks
            </span>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{stats.active} active</span>
            </div>
            <div className="flex items-center gap-1">
              <Pause className="h-4 w-4 text-gray-400" />
              <span>{stats.inactive} inactive</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{stats.scheduled} scheduled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by name, function, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "scheduled", "active", "inactive"] as FilterMode[]).map(f => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "all" ? "All" : f}
            </Button>
          ))}
        </div>
      </div>

      {/* Task list by domain */}
      <div className="space-y-3">
        {domainOrder.map(domain => {
          const tasks = tasksByDomain[domain]
          if (tasks.length === 0) return null

          const info = DOMAIN_INFO[domain]
          const isExpanded = expandedDomains.has(domain)
          const scheduledCount = tasks.filter(t => t.schedule !== null).length
          const activeCount = tasks.filter(t => t.active).length

          return (
            <Card key={domain}>
              <CardHeader
                className="cursor-pointer py-3 px-4"
                onClick={() => toggleDomain(domain)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{info.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {tasks.length} tasks
                    </Badge>
                    {scheduledCount > 0 && (
                      <Badge variant="outline" className="text-xs text-blue-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {scheduledCount} scheduled
                      </Badge>
                    )}
                    {activeCount < tasks.length && (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        <Pause className="h-3 w-3 mr-1" />
                        {tasks.length - activeCount} inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{info.description}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isRunning={isRunning(task.id)}
                        onRunTask={() => onRunTask(task)}
                      />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
