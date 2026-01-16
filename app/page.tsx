"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { Zap, Layers, GitBranch, Database, Clock, CheckCircle, XCircle, ListTree, LayoutGrid, List, Network, TableIcon, Sparkles, Play, Cog, Users, Archive, ExternalLink, ClipboardCheck } from "lucide-react"
import Link from "next/link"

// Verification
import { AuditResults } from "@/components/verification/audit-results"
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

// Machine Diagram - The unified visualization
import { MachineDiagram } from "@/components/machine/machine-diagram"

// Machine 2.0 - The new 5-tab user-centric view
import { Machine2View } from "@/components/machine-2"

// Hooks
import { useActivityLog } from "@/hooks/use-activity-log"
import { useTaskRunner } from "@/hooks/use-task-runner"

// Types and API
import type { BackgroundTask } from "@/lib/types-v2"
import { BACKGROUND_TASKS, getTaskStats } from "@/lib/api-v2"

type ViewMode = "machine2" | "machine" | "tasks" | "inventory" | "dataflow" | "verification" | "legacy"
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
    { id: "machine2" as ViewMode, label: "Machine 2.0", icon: Users },
    { id: "machine" as ViewMode, label: "The Machine", icon: Cog },
    { id: "tasks" as ViewMode, label: "Task Control", icon: Zap },
    { id: "inventory" as ViewMode, label: "Inventory", icon: Archive },
    { id: "dataflow" as ViewMode, label: "Data Flow", icon: GitBranch },
    { id: "verification" as ViewMode, label: "Verification", icon: ClipboardCheck },
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
        {viewMode === "machine2" && <Machine2View />}

        {viewMode === "machine" && <MachineDiagram />}

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
              <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                <MCPRunner />
              </Suspense>
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

        {viewMode === "inventory" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Archive className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Function Inventory</h2>
                <p className="text-sm text-muted-foreground">Complete catalog of all V2 workspace functions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Workers */}
              <Link href="/inventory/workers" className="group">
                <div className="p-6 border rounded-lg bg-card hover:bg-accent/50 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cog className="h-5 w-5 text-blue-600" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Workers/</h3>
                  <p className="text-sm text-muted-foreground mb-3">Reusable worker functions</p>
                  <Badge variant="secondary" className="text-lg">194</Badge>
                  <p className="text-xs text-muted-foreground mt-2">FUB, reZEN, SkySlope, Title, AD...</p>
                </div>
              </Link>

              {/* Background Tasks */}
              <Link href="/inventory/background-tasks" className="group">
                <div className="p-6 border rounded-lg bg-card hover:bg-accent/50 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Background Tasks</h3>
                  <p className="text-sm text-muted-foreground mb-3">Scheduled & triggered tasks</p>
                  <Badge variant="secondary" className="text-lg">100</Badge>
                  <p className="text-xs text-muted-foreground mt-2">44 reZEN, 35 FUB, 10 AD...</p>
                </div>
              </Link>

              {/* Tasks */}
              <Link href="/inventory/tasks" className="group">
                <div className="p-6 border rounded-lg bg-card hover:bg-accent/50 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Tasks/</h3>
                  <p className="text-sm text-muted-foreground mb-3">Orchestration functions</p>
                  <Badge variant="secondary" className="text-lg">~50</Badge>
                  <p className="text-xs text-muted-foreground mt-2">Sync, process, aggregate...</p>
                </div>
              </Link>

              {/* Test Endpoints */}
              <Link href="/inventory/test-endpoints" className="group">
                <div className="p-6 border rounded-lg bg-card hover:bg-accent/50 hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Play className="h-5 w-5 text-orange-600" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Test Endpoints</h3>
                  <p className="text-sm text-muted-foreground mb-3">WORKERS trigger endpoints</p>
                  <Badge variant="secondary" className="text-lg">38</Badge>
                  <p className="text-xs text-muted-foreground mt-2">84% pass rate with User 60</p>
                </div>
              </Link>
            </div>

            {/* Summary Stats */}
            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Functions:</span>
                  <span className="font-bold ml-2">~382</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>
                  <span className="text-muted-foreground">Domains:</span>
                  <span className="font-bold ml-2">10</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>
                  <span className="text-muted-foreground">V2 Workspace ID:</span>
                  <span className="font-mono ml-2">5</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>
                  <span className="text-muted-foreground">Test User:</span>
                  <span className="font-mono ml-2">User 60</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "dataflow" && <DataFlowDiagram />}

        {viewMode === "verification" && <AuditResults />}

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
