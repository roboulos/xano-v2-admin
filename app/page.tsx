"use client"

import { useState, useEffect } from "react"
import { LayoutDashboard, Zap, Wrench, Cog } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// New 4-tab views
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { TaskCenterView } from "@/components/task-center/task-center-view"
import { WorkspaceToolsView } from "@/components/workspace-tools/workspace-tools-view"
import { MachineDiagram } from "@/components/machine/machine-diagram"

// Hooks
import { useActivityLog } from "@/hooks/use-activity-log"

// Task Control Components (kept for activity log)
import { TaskControlHeader } from "@/components/task-control/task-control-header"
import { ActivityLogPanel } from "@/components/task-control/activity-log-panel"
import { EndpointSearch } from "@/components/task-control/endpoint-search"
import { useTaskRunner } from "@/hooks/use-task-runner"
import type { BackgroundTask } from "@/lib/types-v2"
import { getTaskStats } from "@/lib/api-v2"

// 4-tab navigation structure
type ViewMode = "dashboard" | "tasks" | "tools" | "machine"

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard")
  const [searchOpen, setSearchOpen] = useState(false)

  // Activity log state
  const activityLog = useActivityLog()

  // Task runner
  const taskRunner = useTaskRunner({
    addEntry: activityLog.addEntry,
    updateEntry: activityLog.updateEntry,
    open: activityLog.open,
  })

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

  // Simplified 4-tab navigation
  const viewModes = [
    { id: "dashboard" as ViewMode, label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks" as ViewMode, label: "Task Center", icon: Zap },
    { id: "tools" as ViewMode, label: "Workspace Tools", icon: Wrench },
    { id: "machine" as ViewMode, label: "The Machine", icon: Cog },
  ]

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

        {/* Simplified 4-Tab Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
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
          <Badge variant="outline" className="text-xs">
            V2 Workspace • {stats.total} tasks • {stats.active} active
          </Badge>
        </div>

        {/* Main Content - Clean and Simple */}
        {viewMode === "dashboard" && <DashboardView />}
        {viewMode === "tasks" && <TaskCenterView />}
        {viewMode === "tools" && <WorkspaceToolsView />}
        {viewMode === "machine" && <MachineDiagram />}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>V2 Admin Control Center</p>
          <p className="text-xs mt-1">
            Reorganized: Dashboard → Task Center → Workspace Tools → The Machine
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
        onRunTask={(task: BackgroundTask) => taskRunner.run(task)}
        isRunning={taskRunner.isRunning}
      />
    </div>
  )
}
