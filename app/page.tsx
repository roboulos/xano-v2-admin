"use client"

import { useState, useEffect, useCallback } from "react"
import { Zap, Layers, GitBranch, Database, Clock, CheckCircle, XCircle, ListTree, LayoutGrid, List, Network, TableIcon, Sparkles, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Task Control Components
import { TaskControlHeader } from "@/components/task-control/task-control-header"
import { ActivityLogPanel } from "@/components/task-control/activity-log-panel"
import { EndpointSearch } from "@/components/task-control/endpoint-search"
import { DomainGrid } from "@/components/domains"
import { HierarchyView } from "@/components/hierarchy/hierarchy-view"
import { TaskListView } from "@/components/tasks/task-list-view"
import { TriggerChainView } from "@/components/triggers/trigger-chain-view"
import { AllTasksTable } from "@/components/tasks/all-tasks-table"
import { MasterTaskView } from "@/components/tasks/master-task-view"
import { MCPRunner } from "@/components/tasks/mcp-runner"

// Legacy tabs (kept for optional access)
import { DataFlowDiagram } from "@/components/data-flow/data-flow-diagram"

// Hooks
import { useActivityLog } from "@/hooks/use-activity-log"
import { useTaskRunner } from "@/hooks/use-task-runner"

// Types and API
import type { BackgroundTask } from "@/lib/types-v2"
import { BACKGROUND_TASKS, getTaskStats } from "@/lib/api-v2"

type ViewMode = "tasks" | "dataflow" | "legacy"
type TaskViewMode = "runner" | "master" | "all" | "list" | "hierarchy" | "domain" | "triggers"

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("tasks")
  const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>("runner")
  const [searchOpen, setSearchOpen] = useState(false)

  // Activity log state
  const activityLog = useActivityLog()

  // Task runner
  const taskRunner = useTaskRunner({
    addEntry: activityLog.addEntry,
    updateEntry: activityLog.updateEntry,
    open: activityLog.open,
  })

  // Handle task execution
  const handleRunTask = useCallback(
    (task: BackgroundTask) => {
      taskRunner.run(task)
    },
    [taskRunner]
  )

  // Global keyboard shortcut for search (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const viewModes = [
    { id: "tasks" as ViewMode, label: "Task Control", icon: Zap },
    { id: "dataflow" as ViewMode, label: "Data Flow", icon: GitBranch },
    { id: "legacy" as ViewMode, label: "Legacy View", icon: Layers },
  ]

  // Get task stats
  const stats = getTaskStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <TaskControlHeader
          runningCount={activityLog.runningCount}
          errorCount={activityLog.errorCount}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleActivityLog={activityLog.toggle}
          activityLogOpen={activityLog.isOpen}
        />

        {/* Quick Stats Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-3 bg-card border rounded-lg">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Tasks:</span>
            <Badge variant="secondary">{stats.total}</Badge>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Active:</span>
            <Badge variant="outline" className="text-green-600">{stats.active}</Badge>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-muted-foreground">Inactive:</span>
            <Badge variant="outline" className="text-gray-500">{stats.inactive}</Badge>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Scheduled:</span>
            <Badge variant="outline" className="text-blue-600">{stats.scheduled}</Badge>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Domains:</span>
            <Badge variant="outline">8</Badge>
          </div>
          <div className="ml-auto">
            <Badge variant="outline" className="text-xs">
              V2 Workspace (ID: 5)
            </Badge>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-muted/50 rounded-lg w-fit">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === mode.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <mode.icon className="h-4 w-4" />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {viewMode === "tasks" && (
          <>
            {/* Task View Mode Toggle */}
            <div className="flex items-center gap-2 mb-4 p-1 bg-muted/30 rounded-lg w-fit">
              <button
                onClick={() => setTaskViewMode("runner")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  taskViewMode === "runner"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Play className="h-4 w-4" />
                Run Endpoints
              </button>
              <button
                onClick={() => setTaskViewMode("master")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  taskViewMode === "master"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Master View
              </button>
              <button
                onClick={() => setTaskViewMode("all")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  taskViewMode === "all"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <TableIcon className="h-4 w-4" />
                All Tasks
              </button>
              <button
                onClick={() => setTaskViewMode("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  taskViewMode === "list"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <List className="h-4 w-4" />
                Detailed List
              </button>
              <button
                onClick={() => setTaskViewMode("hierarchy")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  taskViewMode === "hierarchy"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <ListTree className="h-4 w-4" />
                Execution Order
              </button>
              <button
                onClick={() => setTaskViewMode("domain")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  taskViewMode === "domain"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Domain Grid
              </button>
              <button
                onClick={() => setTaskViewMode("triggers")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  taskViewMode === "triggers"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Network className="h-4 w-4" />
                Trigger Chains
              </button>
            </div>

            {/* MCP Runner - actual endpoint testing */}
            {taskViewMode === "runner" && (
              <MCPRunner />
            )}

            {/* Master View - combines all views with business context */}
            {taskViewMode === "master" && (
              <MasterTaskView />
            )}

            {/* All Tasks Table View */}
            {taskViewMode === "all" && (
              <AllTasksTable />
            )}

            {/* Detailed List View */}
            {taskViewMode === "list" && (
              <TaskListView
                isRunning={taskRunner.isRunning}
                onRunTask={handleRunTask}
              />
            )}

            {/* Hierarchy View */}
            {taskViewMode === "hierarchy" && (
              <HierarchyView
                isRunning={taskRunner.isRunning}
                onRunTask={handleRunTask}
              />
            )}

            {/* Domain Grid View */}
            {taskViewMode === "domain" && (
              <DomainGrid
                isRunning={taskRunner.isRunning}
                onRunTask={handleRunTask}
              />
            )}

            {/* Trigger Chain View */}
            {taskViewMode === "triggers" && (
              <TriggerChainView />
            )}
          </>
        )}

        {viewMode === "dataflow" && <DataFlowDiagram />}

        {viewMode === "legacy" && (
          <div className="p-8 text-center border-2 border-dashed rounded-lg">
            <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Legacy Migration View</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              The previous V1 → V2 migration documentation interface has been
              replaced with the Task Control Center. The schema comparison and
              mapping views are still available in the codebase if needed.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>V2 Task Control Center • Trigger and monitor background tasks</p>
          <p className="text-xs mt-1">
            {stats.total} tasks across 8 domains • {stats.scheduled} scheduled • Activity log with localStorage persistence
          </p>
        </div>
      </div>

      {/* Activity Log Panel */}
      <ActivityLogPanel
        isOpen={activityLog.isOpen}
        entries={activityLog.entries}
        onClose={activityLog.close}
        onClear={activityLog.clearAll}
      />

      {/* Search Modal */}
      <EndpointSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onRunTask={handleRunTask}
        isRunning={taskRunner.isRunning}
      />
    </div>
  )
}
