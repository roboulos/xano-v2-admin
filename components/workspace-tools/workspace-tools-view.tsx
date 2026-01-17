"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Rocket,
  RefreshCw,
  GitCompare,
  Code,
  Archive,
  Database,
  ClipboardCheck,
  GitBranch,
  ChevronRight,
  Folder,
} from "lucide-react"
import Link from "next/link"

// Import stats from task data
import { getTaskStats, getTasksByDomain } from "@/lib/api-v2"

// Import archived views
import { Machine2View } from "@/components/machine-2"
import { DataFlowDiagram } from "@/components/data-flow/data-flow-diagram"
import { AuditResults } from "@/components/verification/audit-results"

type WorkspaceSection = "overview" | "machine2" | "inventory" | "dataflow" | "verification"

interface ToolCard {
  id: WorkspaceSection
  title: string
  description: string
  icon: typeof Users
  badge?: string
  color: string
}

// Tool cards - badge is computed dynamically in component for inventory
const TOOL_CARDS_BASE: Omit<ToolCard, 'badge'>[] = [
  {
    id: "machine2",
    title: "Machine 2.0",
    description: "User onboarding, syncing, schema comparison, and API docs",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "inventory",
    title: "Function Inventory",
    description: "Catalog of Workers, Tasks, Background Tasks, and Endpoints",
    icon: Archive,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "dataflow",
    title: "Data Flow",
    description: "Visual diagram of data sources, processing, and outputs",
    icon: GitBranch,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "verification",
    title: "Verification",
    description: "Playwright audit results and screenshot gallery",
    icon: ClipboardCheck,
    color: "bg-amber-100 text-amber-600",
  },
]

const MACHINE2_TOOLS = [
  { name: "The Users", description: "Test user (User 60) and V2 table counts", icon: Users },
  { name: "Onboarding", description: "6-step data ingestion workflow", icon: Rocket },
  { name: "Syncing", description: "Job queue and staging status", icon: RefreshCw },
  { name: "Schema", description: "V1 vs V2 field comparison", icon: GitCompare },
  { name: "Frontend API", description: "51 endpoints documentation", icon: Code },
]

// Real function counts from V2 Xano Workspace (queried 2026-01-16 via Xano MCP)
const INVENTORY_LINKS = [
  { name: "Background Tasks", count: 218, href: "/inventory/background-tasks" },
  { name: "Tasks/", count: 109, href: "/inventory/tasks" },
  { name: "Workers/", count: 203, href: "/inventory/workers" },
  { name: "Test Endpoints", count: 38, href: "/inventory/test-endpoints" },
]

export function WorkspaceToolsView() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("overview")

  // Get computed stats from task data
  const stats = getTaskStats()
  const tasksByDomain = getTasksByDomain()
  const domainCount = Object.keys(tasksByDomain).length

  // Compute total functions: 218 BG Tasks + 109 Tasks/ + 203 Workers/ = 530
  // But we only have snapshot data for BG tasks, so show what we have
  const totalFunctions = 218 + 109 + 203 // Real counts from Xano MCP query

  // Build tool cards with dynamic badges
  const toolCards: ToolCard[] = TOOL_CARDS_BASE.map(card => ({
    ...card,
    badge: card.id === "inventory" ? `${totalFunctions} functions` :
           card.id === "machine2" ? "5 tools" :
           card.id === "dataflow" ? "Reference" :
           card.id === "verification" ? "11 checks" : undefined
  }))

  if (activeSection === "machine2") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveSection("overview")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Workspace Tools
        </button>
        <Machine2View />
      </div>
    )
  }

  if (activeSection === "dataflow") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveSection("overview")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Workspace Tools
        </button>
        <DataFlowDiagram />
      </div>
    )
  }

  if (activeSection === "verification") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveSection("overview")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Workspace Tools
        </button>
        <AuditResults />
      </div>
    )
  }

  if (activeSection === "inventory") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveSection("overview")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Workspace Tools
        </button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Function Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INVENTORY_LINKS.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div className="p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.count}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Overview - show all tool cards
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-bold">Workspace Tools</h2>
          <p className="text-sm text-muted-foreground">
            Reference materials, inventory, and advanced configuration
          </p>
        </div>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toolCards.map((tool) => (
          <Card
            key={tool.id}
            className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
            onClick={() => setActiveSection(tool.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${tool.color}`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-lg">{tool.title}</h3>
                    {tool.badge && (
                      <Badge variant="outline">{tool.badge}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Reference: Machine 2.0 Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Machine 2.0 Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {MACHINE2_TOOLS.map((tool) => (
              <div
                key={tool.name}
                className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setActiveSection("machine2")}
              >
                <tool.icon className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="font-medium text-sm">{tool.name}</p>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Real counts from V2 Xano Workspace (queried 2026-01-16) */}
      {/* Note: 218 BG Tasks = 109 V3 (active, call Tasks/) + 109 legacy (inactive) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-2xl font-bold">218</p>
          <p className="text-sm text-muted-foreground">Background Tasks</p>
          <p className="text-xs text-muted-foreground/60">109 V3 + 109 legacy</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-2xl font-bold">109</p>
          <p className="text-sm text-muted-foreground">Tasks/</p>
          <p className="text-xs text-muted-foreground/60">orchestrators</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-2xl font-bold">203</p>
          <p className="text-sm text-muted-foreground">Workers/</p>
          <p className="text-xs text-muted-foreground/60">reusable logic</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-2xl font-bold">{domainCount}</p>
          <p className="text-sm text-muted-foreground">Domains</p>
          <p className="text-xs text-muted-foreground/60">task categories</p>
        </div>
      </div>
    </div>
  )
}
