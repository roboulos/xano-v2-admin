"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  UserPlus,
  Home,
  DollarSign,
  Network,
  CheckCircle2,
  Circle,
  ArrowRight,
  Play,
  RotateCcw,
  Clock,
  AlertCircle,
  Loader2,
  Database,
  Cog,
  Pause,
  XCircle,
} from "lucide-react"
import { MCP_BASES, MCP_ENDPOINTS, type MCPEndpoint } from "@/lib/mcp-endpoints"

// Onboarding steps mapped to actual V2 WORKERS endpoints
type OnboardingStep = {
  id: number
  name: string
  description: string
  icon: React.ElementType
  endpoints: string[] // Endpoint paths from MCP_ENDPOINTS
  tables: string[]
  status: "pending" | "in_progress" | "complete" | "error"
  recordsProcessed: number
  error?: string
  duration?: number
}

// Map step names to actual V2 WORKERS endpoints
// Each step uses a single primary endpoint verified to work with user_id: 60
const INITIAL_STEPS: OnboardingStep[] = [
  {
    id: 1,
    name: "Team Data",
    description: "Fetch team roster and structure",
    icon: Users,
    endpoints: ["/test-function-8066-team-roster"],
    tables: ["team", "team_roster", "team_owners", "team_admins"],
    status: "pending",
    recordsProcessed: 0,
  },
  {
    id: 2,
    name: "Agent Data",
    description: "Sync agent profile information",
    icon: UserPlus,
    endpoints: ["/test-function-8051-agent-data"],
    tables: ["agent", "user"],
    status: "pending",
    recordsProcessed: 0,
  },
  {
    id: 3,
    name: "Transactions",
    description: "Sync transactions from reZEN API",
    icon: DollarSign,
    endpoints: ["/test-function-8052-txn-sync"],
    tables: ["transaction", "participant", "paid_participant"],
    status: "pending",
    recordsProcessed: 0,
  },
  {
    id: 4,
    name: "Listings",
    description: "Sync property listings",
    icon: Home,
    endpoints: ["/test-function-8053-listings-sync"],
    tables: ["listing"],
    status: "pending",
    recordsProcessed: 0,
  },
  {
    id: 5,
    name: "Contributions",
    description: "Sync revenue share and contribution data",
    icon: DollarSign,
    endpoints: ["/test-function-8056-contributions"],
    tables: ["contribution", "income", "revshare_totals", "contributors"],
    status: "pending",
    recordsProcessed: 0,
  },
  {
    id: 6,
    name: "Network",
    description: "Build sponsored network and downline",
    icon: Network,
    endpoints: ["/test-function-8062-network-downline"],
    tables: ["network", "connections"],
    status: "pending",
    recordsProcessed: 0,
  },
]

function StepCard({
  step,
  isActive,
  onRun,
}: {
  step: OnboardingStep
  isActive: boolean
  onRun: () => void
}) {
  const Icon = step.icon

  const getStatusColor = () => {
    switch (step.status) {
      case "complete":
        return "bg-green-50 border-green-200"
      case "in_progress":
        return "bg-blue-50 border-blue-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getStatusBadge = () => {
    switch (step.status) {
      case "complete":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Running
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Circle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${getStatusColor()} ${
        isActive ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold">
              Step {step.id}: {step.name}
            </h4>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

          {/* V2 Endpoints */}
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">V2 Endpoints:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {step.endpoints.map((ep) => (
                <Badge key={ep} variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700">
                  {ep}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tables involved */}
          <div className="flex flex-wrap gap-1 mb-3">
            {step.tables.map((table) => (
              <Badge key={table} variant="outline" className="text-xs font-mono">
                {table}
              </Badge>
            ))}
          </div>

          {/* Record count and duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {step.recordsProcessed > 0 && (
                <span>{step.recordsProcessed.toLocaleString()} records</span>
              )}
              {step.duration && (
                <span>{(step.duration / 1000).toFixed(1)}s</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRun}
              disabled={step.status === "in_progress"}
            >
              {step.status === "in_progress" ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Running...
                </>
              ) : step.status === "complete" ? (
                <>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Re-run
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Run Step
                </>
              )}
            </Button>
          </div>

          {/* Error message */}
          {step.error && (
            <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
              {step.error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function OnboardingTab() {
  const [steps, setSteps] = useState<OnboardingStep[]>(INITIAL_STEPS)
  const [userId, setUserId] = useState<number>(60) // User 60 (David Keener) is the verified test user - see TRIGGER_ENDPOINTS_AUDIT.md
  const [isRunningAll, setIsRunningAll] = useState(false)

  const completedSteps = steps.filter((s) => s.status === "complete").length
  const totalSteps = steps.length
  const progressPercent = (completedSteps / totalSteps) * 100

  // Run a single step by calling its V2 WORKERS endpoint
  const handleRunStep = useCallback(async (stepId: number) => {
    const step = steps.find(s => s.id === stepId)
    if (!step) return

    // Update step to in_progress
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status: "in_progress" as const, error: undefined } : s))
    )

    const startTime = Date.now()
    let totalRecords = 0
    let hasError = false
    let errorMessage = ""

    // Run all endpoints for this step
    for (const endpointPath of step.endpoints) {
      try {
        const response = await fetch(`${MCP_BASES.WORKERS}${endpointPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        })
        const data = await response.json()

        if (data.success) {
          // Try to extract record count from various response formats
          if (data.data?.records_processed) totalRecords += data.data.records_processed
          if (data.data?.count) totalRecords += data.data.count
          if (data.data?.total) totalRecords += data.data.total
          if (typeof data.data === "number") totalRecords += data.data
        } else {
          hasError = true
          errorMessage = data.error || data.message || `Endpoint ${endpointPath} failed`
          break
        }
      } catch (err) {
        hasError = true
        errorMessage = err instanceof Error ? err.message : "Network error"
        break
      }
    }

    const duration = Date.now() - startTime

    // Update step with results
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              status: hasError ? ("error" as const) : ("complete" as const),
              recordsProcessed: totalRecords,
              error: hasError ? errorMessage : undefined,
              duration,
            }
          : s
      )
    )
  }, [steps, userId])

  const handleRunAll = async () => {
    setIsRunningAll(true)
    for (const step of steps) {
      await handleRunStep(step.id)
    }
    setIsRunningAll(false)
  }

  const handleReset = () => {
    setSteps(INITIAL_STEPS)
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">V2 Onboarding Progress</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Step-by-step data sync using real V2 WORKERS endpoints
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {completedSteps}/{totalSteps} Steps Complete
              </Badge>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
              <Button onClick={handleRunAll} disabled={isRunningAll}>
                {isRunningAll ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run All Steps
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* User ID Input */}
          <div className="flex items-center gap-4 mb-6 p-3 bg-muted/30 rounded-lg">
            <Label htmlFor="onboard-userId" className="text-sm font-medium">User ID:</Label>
            <Input
              id="onboard-userId"
              type="number"
              value={userId}
              onChange={(e) => setUserId(parseInt(e.target.value) || 60)}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground">
              Verified test user: 60 (David Keener) - see TRIGGER_ENDPOINTS_AUDIT.md for full testing history
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {/* Visual Factory Pipeline */}
          <div className="relative mb-6">
            {/* Conveyor Belt Track */}
            <div className={`absolute top-1/2 left-4 right-4 h-2 -translate-y-1/2 conveyor-belt rounded ${isRunningAll ? "" : "paused"}`} />

            <div className="relative flex items-center justify-between px-4 py-6">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isComplete = step.status === "complete"
                const isActive = step.status === "in_progress"
                const hasError = step.status === "error"

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex flex-col items-center relative z-10 ${
                        isComplete
                          ? "text-green-600"
                          : isActive
                          ? "text-blue-600"
                          : hasError
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    >
                      {/* Spinning gear behind the step when active */}
                      {isActive && (
                        <Cog className="absolute h-20 w-20 text-amber-200 -z-10 animate-spin-gear-slow" />
                      )}

                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-3 shadow-md transition-all ${
                          isComplete
                            ? "bg-green-100 border-green-500 animate-success-glow"
                            : isActive
                            ? "bg-blue-100 border-blue-500 animate-bounce-in"
                            : hasError
                            ? "bg-red-100 border-red-500 animate-shake"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-7 w-7 animate-rotate-in" />
                        ) : isActive ? (
                          <Cog className="h-7 w-7 animate-spin-gear" />
                        ) : hasError ? (
                          <XCircle className="h-7 w-7" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-semibold whitespace-nowrap ${isActive ? "animate-pulse-subtle" : ""}`}>
                        {step.name}
                      </span>
                      {step.recordsProcessed > 0 && (
                        <Badge variant="outline" className={`mt-1 text-[10px] ${isComplete ? "bg-green-50 text-green-700" : ""}`}>
                          {step.recordsProcessed.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex items-center mx-1">
                        <ArrowRight
                          className={`h-6 w-6 shrink-0 transition-colors ${
                            steps[index].status === "complete"
                              ? "text-green-500"
                              : steps[index].status === "in_progress"
                              ? "text-blue-400 animate-pulse"
                              : "text-gray-300"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Steps */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Step Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Each step calls real V2 WORKERS endpoints at {MCP_BASES.WORKERS}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step) => (
              <StepCard
                key={step.id}
                step={step}
                isActive={step.status === "in_progress"}
                onRun={() => handleRunStep(step.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
