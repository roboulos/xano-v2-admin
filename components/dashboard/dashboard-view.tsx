"use client"

import { useState, useEffect } from "react"
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
  TrendingUp,
  Database,
  RefreshCw,
  ChevronRight,
} from "lucide-react"
import { MachineDiagram } from "@/components/machine/machine-diagram"
import { getTaskStats } from "@/lib/api-v2"

interface RecentExecution {
  id: string
  name: string
  domain: string
  status: "success" | "failed" | "running"
  timestamp: string
  duration?: string
}

// Mock recent executions - in real app, this would come from activity log
const MOCK_RECENT: RecentExecution[] = [
  { id: "1", name: "FUB_get_fub_account_id", domain: "FUB", status: "success", timestamp: "2 min ago", duration: "1.2s" },
  { id: "2", name: "reZEN_process_transactions", domain: "reZEN", status: "success", timestamp: "5 min ago", duration: "3.4s" },
  { id: "3", name: "SkySlope_sync_listings", domain: "SkySlope", status: "failed", timestamp: "12 min ago", duration: "0.8s" },
  { id: "4", name: "Aggregation_daily_metrics", domain: "Aggregation", status: "success", timestamp: "1 hr ago", duration: "12.1s" },
  { id: "5", name: "Network_calculate_tiers", domain: "Network", status: "success", timestamp: "2 hr ago", duration: "5.7s" },
]

export function DashboardView() {
  const stats = getTaskStats()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const successRate = Math.round((MOCK_RECENT.filter(e => e.status === "success").length / MOCK_RECENT.length) * 100)

  return (
    <div className="space-y-6">
      {/* Hero Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active</p>
                <p className="text-3xl font-bold text-green-700">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Scheduled</p>
                <p className="text-3xl font-bold text-purple-700">{stats.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-amber-700">{successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-400" />
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
        {/* Recent Executions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Executions</CardTitle>
              <Badge variant="outline">{MOCK_RECENT.length} runs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MOCK_RECENT.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {execution.status === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {execution.status === "failed" && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {execution.status === "running" && (
                      <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{execution.name}</p>
                      <p className="text-xs text-muted-foreground">{execution.domain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{execution.timestamp}</p>
                    {execution.duration && (
                      <p className="text-xs font-mono">{execution.duration}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3" size="sm">
              View All Activity
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Domain Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Domains Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "reZEN", tasks: 45, color: "bg-blue-500" },
                { name: "FUB", tasks: 34, color: "bg-green-500" },
                { name: "SkySlope", tasks: 5, color: "bg-purple-500" },
                { name: "Title", tasks: 2, color: "bg-orange-500" },
                { name: "Aggregation", tasks: 8, color: "bg-pink-500" },
                { name: "AD", tasks: 10, color: "bg-cyan-500" },
              ].map((domain) => (
                <div key={domain.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${domain.color}`} />
                  <span className="flex-1 font-medium">{domain.name}</span>
                  <Badge variant="secondary">{domain.tasks} tasks</Badge>
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
