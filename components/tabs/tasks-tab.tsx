"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ChevronRight,
  ChevronDown,
  Search,
  ArrowRight,
  Clock,
  Calendar,
} from "lucide-react"

import {
  TASK_MAPPINGS,
  getTaskMappingsByCategory,
  getTaskMappingStats,
  searchTaskMappings,
  describeCronSchedule,
} from "@/lib/task-mappings"
import {
  TASK_CATEGORY_LABELS,
  TASK_CATEGORY_ICONS,
  type TaskCategory,
} from "@/types/mappings"
import { MAPPING_TYPE_COLORS, MAPPING_TYPE_LABELS, type MappingType } from "@/lib/table-mappings"

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

// Schedule badge component
function ScheduleBadge({ schedule }: { schedule?: string }) {
  if (!schedule) return <span className="text-muted-foreground text-xs">—</span>

  const description = describeCronSchedule(schedule)

  // Color code by frequency
  let colorClass = "bg-gray-100 text-gray-700"
  if (schedule.includes("* * * * *")) {
    colorClass = "bg-red-100 text-red-700" // Every minute
  } else if (schedule.includes("*/2") || schedule.includes("*/5") || schedule.includes("*/10") || schedule.includes("*/15")) {
    colorClass = "bg-orange-100 text-orange-700" // Every few minutes
  } else if (schedule.includes("*/30") || schedule.startsWith("0 *") || schedule.startsWith("30 *")) {
    colorClass = "bg-yellow-100 text-yellow-700" // Hourly or half-hourly
  } else if (schedule.includes("0 */")) {
    colorClass = "bg-blue-100 text-blue-700" // Every few hours
  } else if (schedule.includes("0 ") && !schedule.includes("*/")) {
    colorClass = "bg-green-100 text-green-700" // Daily at specific time
  }

  return (
    <Badge variant="outline" className={`${colorClass} text-[10px] flex items-center gap-1`}>
      <Clock className="h-3 w-3" />
      {description}
    </Badge>
  )
}

// Category card with collapsible task list
function TaskCategoryCard({
  category,
  searchQuery
}: {
  category: TaskCategory
  searchQuery: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const allTasks = getTaskMappingsByCategory(category)
  const filteredTasks = searchQuery
    ? searchTaskMappings(searchQuery).filter(t => t.category === category)
    : allTasks

  if (filteredTasks.length === 0) return null

  // Count mapping types
  const mappingCounts = {
    direct: filteredTasks.filter(t => t.type === "direct").length,
    renamed: filteredTasks.filter(t => t.type === "renamed").length,
    deprecated: filteredTasks.filter(t => t.type === "deprecated").length,
    new: filteredTasks.filter(t => t.type === "new").length,
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
              <span className="text-xl">{TASK_CATEGORY_ICONS[category]}</span>
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {TASK_CATEGORY_LABELS[category]}
                <Badge variant="secondary" className="ml-2">{filteredTasks.length} tasks</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {isOpen ? "Click to collapse" : "Click to see task mappings →"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mappingCounts.direct > 0 && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                {mappingCounts.direct} direct
              </Badge>
            )}
            {mappingCounts.renamed > 0 && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                {mappingCounts.renamed} renamed
              </Badge>
            )}
            {mappingCounts.deprecated > 0 && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {mappingCounts.deprecated} deprecated
              </Badge>
            )}
            {mappingCounts.new > 0 && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                {mappingCounts.new} new
              </Badge>
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
                <TableHead className="w-[200px] font-medium">V1 Task</TableHead>
                <TableHead className="w-[80px] font-medium">Type</TableHead>
                <TableHead className="w-[120px] font-medium">Schedule</TableHead>
                <TableHead className="font-medium">V2 Task(s)</TableHead>
                <TableHead className="font-medium">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.v1_id} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-sm font-medium">
                    {task.v1_task}
                  </TableCell>
                  <TableCell>
                    <MappingTypeBadge type={task.type} />
                  </TableCell>
                  <TableCell>
                    <ScheduleBadge schedule={task.schedule} />
                  </TableCell>
                  <TableCell>
                    {task.v2_tasks.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {task.v2_tasks.map((v2Task, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {v2Task}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    {task.notes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  )
}

// Main Tasks Tab component
export function TasksTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<MappingType | "all">("all")

  const stats = useMemo(() => getTaskMappingStats(), [])

  // Get unique categories from mappings
  const categories = useMemo(() => {
    const cats = new Set<TaskCategory>()
    TASK_MAPPINGS.forEach(m => {
      if (m.category) cats.add(m.category)
    })
    return Array.from(cats)
  }, [])

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">V1 Tasks</div>
              <div className="text-xs text-amber-600/70 flex items-center justify-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                125 scheduled
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
              <div className="text-xs text-muted-foreground font-medium">MAPPED</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">{stats.total - stats.deprecated}</div>
              <div className="text-sm text-muted-foreground">V2 Tasks</div>
              <div className="text-xs text-orange-600/70 flex items-center justify-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                200 scheduled
              </div>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilterType("direct")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "direct"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Direct ({stats.direct})
            </button>
            <button
              onClick={() => setFilterType("renamed")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "renamed"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              Renamed ({stats.renamed})
            </button>
            <button
              onClick={() => setFilterType("deprecated")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "deprecated"
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              Deprecated ({stats.deprecated})
            </button>
            <button
              onClick={() => setFilterType("new")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "new"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              New ({stats.new || 0})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks by name, schedule, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Cards */}
      <div className="space-y-3">
        {categories.map((category) => (
          <TaskCategoryCard
            key={category}
            category={category}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  )
}
