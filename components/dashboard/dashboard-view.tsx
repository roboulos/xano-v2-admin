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
import { getTaskStats, getScheduledTasks } from "@/lib/api-v2"

// Real function counts from V2 Xano Workspace (queried 2026-01-16 via Xano MCP)
const WORKSPACE_STATS = {
  backgroundTasks: 218, // Background Tasks - scheduled jobs (list_tasks)
  tasks: 109,           // Tasks/ folder - orchestrator functions (search "Tasks/")
  workers: 203,         // Workers/ folder - reusable logic functions (search "Workers/")
  domains: 10,          // reZEN, FUB, SkySlope, Title, Aggregation, AD, Metrics, Reporting, Network, System
}

// Real domain breakdown from task-data.ts
const DOMAIN_COUNTS = [
  { name: "reZEN", tasks: 28, color: "bg-blue-500" },
  { name: "FUB", tasks: 34, color: "bg-green-500" },
  { name: "SkySlope", tasks: 12, color: "bg-purple-500" },
  { name: "Aggregation", tasks: 8, color: "bg-pink-500" },
  { name: "AD", tasks: 10, color: "bg-cyan-500" },
  { name: "Network", tasks: 4, color: "bg-orange-500" },
  { name: "Title", tasks: 2, color: "bg-yellow-500" },
  { name: "Metrics", tasks: 2, color: "bg-indigo-500" },
]

export function DashboardView() {
  const stats = getTaskStats()
  const scheduledTasks = getScheduledTasks().slice(0, 5) // Top 5 scheduled tasks
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Hero Stats Row - Real V2 Workspace Counts (queried from Xano MCP) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Background Tasks</p>
                <p className="text-3xl font-bold text-purple-700">{WORKSPACE_STATS.backgroundTasks}</p>
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
                <p className="text-3xl font-bold text-green-700">{WORKSPACE_STATS.tasks}</p>
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
                <p className="text-3xl font-bold text-blue-700">{WORKSPACE_STATS.workers}</p>
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
                <p className="text-3xl font-bold text-amber-700">{WORKSPACE_STATS.domains}</p>
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
        {/* Scheduled Jobs - Real Data */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Scheduled Jobs</CardTitle>
              <Badge variant="outline">{stats.scheduled} active</Badge>
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
              View All {stats.total} Background Jobs
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Domain Summary - Real Counts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Background Jobs by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DOMAIN_COUNTS.map((domain) => (
                <div key={domain.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${domain.color}`} />
                  <span className="flex-1 font-medium">{domain.name}</span>
                  <Badge variant="secondary">{domain.tasks} jobs</Badge>
                </div>
              ))}
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
