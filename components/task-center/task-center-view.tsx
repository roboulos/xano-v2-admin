"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  ChevronUp,
  Play,
  Zap,
  LayoutGrid,
  List,
  Network,
  ListTree,
  Sparkles,
  TableIcon,
} from "lucide-react"

// Import existing task views
import { MCPRunner } from "@/components/tasks/mcp-runner"
import { MasterTaskView } from "@/components/tasks/master-task-view"
import { AllTasksTable } from "@/components/tasks/all-tasks-table"
import { TaskListView } from "@/components/tasks/task-list-view"
import { HierarchyView } from "@/components/hierarchy/hierarchy-view"
import { DomainGrid } from "@/components/domains"
import { TriggerChainView } from "@/components/triggers/trigger-chain-view"

type PrimaryView = "run" | "monitor"
type AdvancedView = "master" | "all" | "list" | "hierarchy" | "domain" | "triggers"

interface AdvancedViewOption {
  id: AdvancedView
  label: string
  icon: typeof Sparkles
  description: string
}

const ADVANCED_VIEWS: AdvancedViewOption[] = [
  { id: "master", label: "Master View", icon: Sparkles, description: "Grouped by data source" },
  { id: "all", label: "All Tasks", icon: TableIcon, description: "Full table view" },
  { id: "list", label: "Detailed List", icon: List, description: "Expanded task details" },
  { id: "hierarchy", label: "Execution Order", icon: ListTree, description: "Dependency sequence" },
  { id: "domain", label: "Domain Grid", icon: LayoutGrid, description: "Visual domain cards" },
  { id: "triggers", label: "Trigger Chains", icon: Network, description: "Task dependencies" },
]

export function TaskCenterView() {
  const [primaryView, setPrimaryView] = useState<PrimaryView>("run")
  const [advancedView, setAdvancedView] = useState<AdvancedView | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // If an advanced view is selected, show it
  if (advancedView) {
    return (
      <div className="space-y-4">
        {/* Back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setAdvancedView(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Task Center
          </button>
          <Badge variant="outline">
            {ADVANCED_VIEWS.find(v => v.id === advancedView)?.label}
          </Badge>
        </div>

        {/* Render the selected advanced view */}
        {advancedView === "master" && <MasterTaskView />}
        {advancedView === "all" && <AllTasksTable />}
        {advancedView === "list" && <TaskListView isRunning={() => false} onRunTask={() => {}} />}
        {advancedView === "hierarchy" && <HierarchyView isRunning={() => false} onRunTask={() => {}} />}
        {advancedView === "domain" && <DomainGrid isRunning={() => false} onRunTask={() => {}} />}
        {advancedView === "triggers" && <TriggerChainView />}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Primary View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setPrimaryView("run")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              primaryView === "run"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Play className="h-4 w-4" />
            Run Endpoints
          </button>
          <button
            onClick={() => setPrimaryView("monitor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              primaryView === "monitor"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="h-4 w-4" />
            Monitor Tasks
          </button>
        </div>

        {/* Advanced Views Dropdown */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          Advanced Views
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Advanced Views Dropdown Panel */}
      {showAdvanced && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Advanced Views (6 additional perspectives)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {ADVANCED_VIEWS.map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    setAdvancedView(view.id)
                    setShowAdvanced(false)
                  }}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all text-left"
                >
                  <view.icon className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="font-medium text-sm">{view.label}</p>
                  <p className="text-xs text-muted-foreground">{view.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary View Content */}
      {primaryView === "run" && (
        <Suspense fallback={<div className="p-8 text-center">Loading endpoints...</div>}>
          <MCPRunner />
        </Suspense>
      )}

      {primaryView === "monitor" && (
        <MasterTaskView />
      )}
    </div>
  )
}
