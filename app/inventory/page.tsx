"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  Database,
  Cog,
  Timer,
  TestTube2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
} from "lucide-react"
import { BACKGROUND_TASKS, getTaskStats, DOMAIN_INFO } from "@/lib/task-data"
import { MCP_ENDPOINTS } from "@/lib/mcp-endpoints"
import { TEST_ENDPOINTS, getTestStats } from "@/lib/test-endpoints-inventory"

// Inventory categories with their routes and stats
function getInventoryStats() {
  const taskStats = getTaskStats()
  const testStats = getTestStats()

  // Count Workers from MCP_ENDPOINTS (those in WORKERS group)
  const workerEndpoints = MCP_ENDPOINTS.filter((e) => e.apiGroup === "WORKERS")
  const taskEndpoints = MCP_ENDPOINTS.filter((e) => e.apiGroup === "TASKS")

  return {
    workers: {
      total: workerEndpoints.length,
      description: "WORKERS API endpoints that process data",
      route: "/inventory/workers",
      icon: Cog,
      color: "bg-blue-100 text-blue-700",
      groups: {
        reZEN: workerEndpoints.filter((e) => e.taskName.includes("reZEN")).length,
        FUB: workerEndpoints.filter((e) => e.taskName.includes("FUB")).length,
        Other: workerEndpoints.filter(
          (e) => !e.taskName.includes("reZEN") && !e.taskName.includes("FUB")
        ).length,
      },
    },
    tasks: {
      total: taskEndpoints.length,
      description: "TASKS API endpoints (orchestrators)",
      route: "/inventory/tasks",
      icon: Timer,
      color: "bg-green-100 text-green-700",
      scheduled: taskEndpoints.filter((e) => e.description.includes("process")).length,
    },
    backgroundTasks: {
      total: taskStats.total,
      active: taskStats.active,
      inactive: taskStats.inactive,
      scheduled: taskStats.scheduled,
      description: "Background tasks with schedules",
      route: "/inventory/background-tasks",
      icon: Clock,
      color: "bg-purple-100 text-purple-700",
      byDomain: taskStats.byDomain,
    },
    testEndpoints: {
      total: testStats.total,
      passing: testStats.passing,
      failing: testStats.failing,
      untested: testStats.untested,
      passRate: testStats.passRate,
      coverageRate: testStats.coverageRate,
      description: "Machine 2.0 Tests API Group (ID: 659)",
      route: "/inventory/test-endpoints",
      icon: TestTube2,
      color: "bg-orange-100 text-orange-700",
      byCategory: testStats.byCategory,
    },
  }
}

function InventoryCard({
  title,
  description,
  total,
  route,
  icon: Icon,
  color,
  stats,
}: {
  title: string
  description: string
  total: number
  route: string
  icon: React.ElementType
  color: string
  stats?: React.ReactNode
}) {
  return (
    <Link href={route}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-3">{total}</div>
          {stats}
        </CardContent>
      </Card>
    </Link>
  )
}

export default function InventoryPage() {
  const stats = getInventoryStats()

  // Calculate overall test coverage
  const totalItems =
    stats.workers.total +
    stats.tasks.total +
    stats.backgroundTasks.total +
    stats.testEndpoints.total
  const testedItems = stats.testEndpoints.passing + stats.testEndpoints.failing
  const overallCoverage = Math.round((testedItems / stats.testEndpoints.total) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">V2 System Inventory</h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Complete inventory of Workers, Tasks, Background Tasks, and Test Endpoints in Workspace 5
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-4xl font-bold text-primary">{totalItems}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-4xl font-bold text-green-600">{stats.testEndpoints.passing}</div>
              <div className="text-sm text-muted-foreground">Tests Passing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-4xl font-bold text-red-600">{stats.testEndpoints.failing}</div>
              <div className="text-sm text-muted-foreground">Tests Failing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="text-4xl font-bold">{stats.testEndpoints.passRate}%</span>
              </div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Test Coverage */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Test Coverage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {testedItems} of {stats.testEndpoints.total} test endpoints executed
              </span>
              <span className="text-sm text-muted-foreground">{overallCoverage}% coverage</span>
            </div>
            <Progress value={overallCoverage} className="h-3" />
            <div className="flex items-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{stats.testEndpoints.passing} passing</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>{stats.testEndpoints.failing} failing</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{stats.testEndpoints.untested} untested</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Workers */}
          <InventoryCard
            title="Workers"
            description={stats.workers.description}
            total={stats.workers.total}
            route={stats.workers.route}
            icon={stats.workers.icon}
            color={stats.workers.color}
            stats={
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  reZEN: {stats.workers.groups.reZEN}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  FUB: {stats.workers.groups.FUB}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Other: {stats.workers.groups.Other}
                </Badge>
              </div>
            }
          />

          {/* Tasks */}
          <InventoryCard
            title="Tasks"
            description={stats.tasks.description}
            total={stats.tasks.total}
            route={stats.tasks.route}
            icon={stats.tasks.icon}
            color={stats.tasks.color}
            stats={
              <div className="text-sm text-muted-foreground">
                Orchestrator endpoints for batch processing
              </div>
            }
          />

          {/* Background Tasks */}
          <InventoryCard
            title="Background Tasks"
            description={stats.backgroundTasks.description}
            total={stats.backgroundTasks.total}
            route={stats.backgroundTasks.route}
            icon={stats.backgroundTasks.icon}
            color={stats.backgroundTasks.color}
            stats={
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    Active: {stats.backgroundTasks.active}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700 text-xs">
                    Inactive: {stats.backgroundTasks.inactive}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    Scheduled: {stats.backgroundTasks.scheduled}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(DOMAIN_INFO).map(([domain, info]) => {
                    const domainStats = stats.backgroundTasks.byDomain[domain] as
                      | { total: number; active: number }
                      | undefined
                    if (!domainStats || domainStats.total === 0) return null
                    return (
                      <Badge key={domain} variant="outline" className="text-xs">
                        {info.name}: {domainStats.total}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            }
          />

          {/* Test Endpoints */}
          <InventoryCard
            title="Test Endpoints"
            description={stats.testEndpoints.description}
            total={stats.testEndpoints.total}
            route={stats.testEndpoints.route}
            icon={stats.testEndpoints.icon}
            color={stats.testEndpoints.color}
            stats={
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Pass: {stats.testEndpoints.passing}
                  </Badge>
                  <Badge className="bg-red-100 text-red-700 text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    Fail: {stats.testEndpoints.failing}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700 text-xs">
                    Untested: {stats.testEndpoints.untested}
                  </Badge>
                </div>
                <Progress value={stats.testEndpoints.passRate} className="h-2" />
                <div className="flex flex-wrap gap-1">
                  {Object.entries(stats.testEndpoints.byCategory).map(([category, count]) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            }
          />
        </div>

        {/* Quick Links */}
        <Card className="mt-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">API Groups (Workspace 5)</h4>
                <div className="space-y-1 text-muted-foreground font-mono text-xs">
                  <p>TASKS: api:4psV7fp6</p>
                  <p>WORKERS: api:4UsTtl3m</p>
                  <p>SYSTEM: api:LIdBL1AN</p>
                  <p>SEEDING: api:2kCRUYxG</p>
                  <p>
                    <strong>Machine 2.0 Tests: api:20LTQtIX (ID: 659)</strong>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Verified Test User</h4>
                <div className="space-y-1 text-muted-foreground text-xs">
                  <p>
                    <strong>User ID: 60</strong> (David Keener)
                  </p>
                  <p>Agent ID: 37208</p>
                  <p>Team ID: 1</p>
                  <p className="text-green-600">
                    Primary test user - 84% pass rate verified
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>V2 System Inventory - Machine 2.0 Admin Interface</p>
          <p className="text-xs mt-1">
            Workspace 5: x2nu-xcjc-vhax.agentdashboards.xano.io
          </p>
        </div>
      </div>
    </div>
  )
}
