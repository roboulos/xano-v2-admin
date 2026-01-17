"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Database,
  RefreshCw,
  ChevronRight,
  Layers,
  Cog,
} from "lucide-react"
import { MachineDiagram } from "@/components/machine/machine-diagram"
import { getTaskStats, getScheduledTasks, getTasksByDomain, DOMAIN_INFO } from "@/lib/api-v2"

// V2 Architecture (verified 2026-01-16 via Xano MCP):
// - 218 Background Tasks total: 109 V3 (active, call Tasks/) + 109 legacy (inactive)
// - 109 Tasks/ functions: orchestrators called by V3 background tasks
// - 203 Workers/ functions: reusable logic called by Tasks/
//
// The 1:1 mapping: Background Task (V3) → Tasks/ function → Workers/ functions

// Real counts from Xano MCP query (2026-01-16)
const V2_ARCHITECTURE = {
  bgTasksTotal: 218,      // Total background tasks
  bgTasksV3: 109,         // Active V3 tasks (call Tasks/)
  bgTasksLegacy: 109,     // Legacy inactive tasks
  tasksFunctions: 109,    // Tasks/ orchestrator functions
  workersFunctions: 203,  // Workers/ reusable logic
} as const

export function DashboardView() {
  const snapshotStats = getTaskStats() // From 100-task snapshot
  const tasksByDomain = getTasksByDomain()
  const scheduledTasks = getScheduledTasks().slice(0, 5) // Top 5 scheduled tasks
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Computed from real data
  const domainCount = Object.keys(tasksByDomain).length

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Hero Stats Row - Real V2 Architecture Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">V3 Tasks</p>
                <p className="text-3xl font-bold text-purple-700">{V2_ARCHITECTURE.bgTasksV3}</p>
                <p className="text-xs text-purple-500">active, call Tasks/</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Tasks/</p>
                <p className="text-3xl font-bold text-green-700">{V2_ARCHITECTURE.tasksFunctions}</p>
                <p className="text-xs text-green-500">orchestrators</p>
              </div>
              <Layers className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Workers/</p>
                <p className="text-3xl font-bold text-blue-700">{V2_ARCHITECTURE.workersFunctions}</p>
                <p className="text-xs text-blue-500">reusable logic</p>
              </div>
              <Cog className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Domains</p>
                <p className="text-3xl font-bold text-amber-700">{domainCount}</p>
                <p className="text-xs text-amber-500">task categories</p>
              </div>
              <Database className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-4 w-4 mr-2" />
              Run All Endpoints
            </Button>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              View Activity Log
            </Button>
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Check Table Counts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Jobs - From Snapshot */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Scheduled Jobs</CardTitle>
              <Badge variant="outline">{snapshotStats.scheduled} in snapshot</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {task.active ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{task.name}</p>
                      <p className="text-xs text-muted-foreground">{task.domain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {task.schedule?.frequencyLabel || "Manual"}
                    </p>
                    {task.callsFunction && (
                      <p className="text-xs font-mono text-muted-foreground truncate max-w-[150px]">
                        {task.callsFunction.split("/").pop()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3" size="sm">
              View All {V2_ARCHITECTURE.bgTasksV3} V3 Background Jobs
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Domain Summary - Computed from task-data.ts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Background Jobs by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(tasksByDomain)
                .sort(([, a], [, b]) => b.length - a.length)
                .map(([domain, tasks]) => {
                  const info = DOMAIN_INFO[domain as keyof typeof DOMAIN_INFO]
                  return (
                    <div key={domain} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${info?.color || 'gray'}-500`} />
                      <span className="flex-1 font-medium">{info?.name || domain}</span>
                      <Badge variant="secondary">{tasks.length} jobs</Badge>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* The Machine Diagram - Collapsed by Default */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">System Architecture</CardTitle>
            <Badge variant="outline">The Machine</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-auto">
            <MachineDiagram />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
