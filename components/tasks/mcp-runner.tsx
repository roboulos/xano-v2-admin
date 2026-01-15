"use client"

import { useState, useEffect } from "react"
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Settings,
  Loader2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Zap,
  Database,
  Server,
  Beaker,
  AlertTriangle,
  Info,
  Code,
  Copy,
  Check,
  Activity,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  MCP_ENDPOINTS,
  MCP_BASES,
  getEndpointsByGroup,
  getStandaloneEndpoints,
  getEndpointsNeedingUserId,
  type MCPEndpoint,
} from "@/lib/mcp-endpoints"
import {
  normalizeXanoResponse,
  isXanoSuccess,
  isXanoFailure,
  type XanoResult,
} from "@/lib/types-v2"

// Enhanced result with FP-style data
interface RunResult {
  endpoint: string
  taskName: string
  success: boolean
  // FP Result fields
  step?: string           // WHERE in pipeline (for debugging)
  data?: unknown          // Response data
  error?: string          // Error message
  code?: string           // Machine-readable error code
  // Metadata
  duration: number
  timestamp: Date
  rawResponse?: unknown   // Original response for debugging
  responseType: "fp-result" | "raw-data" | "validation-error" | "network-error"
}

const groupIcons = {
  TASKS: Zap,
  WORKERS: Server,
  SYSTEM: Settings,
  SEEDING: Beaker,
}

const groupColors = {
  TASKS: "bg-purple-500",
  WORKERS: "bg-green-500",
  SYSTEM: "bg-blue-500",
  SEEDING: "bg-orange-500",
}

const groupBgColors = {
  TASKS: "bg-purple-50 border-purple-200",
  WORKERS: "bg-green-50 border-green-200",
  SYSTEM: "bg-blue-50 border-blue-200",
  SEEDING: "bg-orange-50 border-orange-200",
}

// Format time ago helper
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  if (diffSecs < 5) return "just now"
  if (diffSecs < 60) return `${diffSecs}s ago`
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  return `${diffHours}h ago`
}

export function MCPRunner() {
  // Context settings (persisted)
  const [userId, setUserId] = useState<number>(7) // Default to David Keener
  const [showSettings, setShowSettings] = useState(false)

  // Run state
  const [running, setRunning] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<RunResult[]>([])
  // Track last result for each endpoint (for inline indicators)
  const [lastResults, setLastResults] = useState<Map<string, RunResult>>(new Map())

  // Copy to clipboard state
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  // Computed stats
  const totalEndpoints = MCP_ENDPOINTS.length
  const passedCount = results.filter(r => r.success).length
  const failedCount = results.filter(r => !r.success).length
  const runningCount = running.size
  const avgDuration = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)
    : 0

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mcp-runner-settings")
    if (saved) {
      const settings = JSON.parse(saved)
      if (settings.userId) setUserId(settings.userId)
    }
  }, [])

  // Save settings
  const saveSettings = () => {
    localStorage.setItem("mcp-runner-settings", JSON.stringify({ userId }))
    setShowSettings(false)
  }

  // Run an endpoint and normalize response to FP Result pattern
  const runEndpoint = async (endpoint: MCPEndpoint) => {
    const key = endpoint.endpoint
    setRunning(prev => new Set(prev).add(key))
    const startTime = Date.now()

    try {
      const baseUrl = MCP_BASES[endpoint.apiGroup]
      let url = `${baseUrl}${endpoint.endpoint}`

      // Add query params for GET requests that need user_id
      if (endpoint.method === "GET" && endpoint.requiresUserId) {
        url += `?user_id=${userId}`
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      // Add body for POST requests that need user_id
      if (endpoint.method === "POST" && endpoint.requiresUserId) {
        options.body = JSON.stringify({ user_id: userId })
      }

      const response = await fetch(url, options)
      const rawData = await response.json()
      const duration = Date.now() - startTime

      // Normalize to FP Result pattern
      const normalized = normalizeXanoResponse(rawData, endpoint.endpoint)

      // Determine response type for UI display
      let responseType: RunResult["responseType"] = "fp-result"
      if (rawData.code && rawData.message && !('success' in rawData)) {
        responseType = "validation-error"
      } else if (!('success' in rawData)) {
        responseType = "raw-data"
      }

      const result: RunResult = {
        endpoint: endpoint.endpoint,
        taskName: endpoint.taskName,
        success: normalized.success,
        step: normalized.step,
        data: normalized.data,
        error: isXanoFailure(normalized) ? normalized.error : undefined,
        code: isXanoFailure(normalized) ? normalized.code : undefined,
        duration,
        timestamp: new Date(),
        rawResponse: rawData,
        responseType,
      }

      setResults(prev => [result, ...prev.slice(0, 49)])
      // Track last result for inline indicator
      setLastResults(prev => new Map(prev).set(endpoint.endpoint, result))
    } catch (error) {
      const duration = Date.now() - startTime
      const errorResult: RunResult = {
        endpoint: endpoint.endpoint,
        taskName: endpoint.taskName,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        step: "network",
        duration,
        timestamp: new Date(),
        responseType: "network-error",
      }
      setResults(prev => [errorResult, ...prev.slice(0, 49)])
      // Track last result for inline indicator
      setLastResults(prev => new Map(prev).set(endpoint.endpoint, errorResult))
    } finally {
      setRunning(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  // Run all endpoints in a group (sequentially to avoid overwhelming the server)
  const runAllEndpoints = async (endpoints: MCPEndpoint[]) => {
    for (const endpoint of endpoints) {
      await runEndpoint(endpoint)
    }
  }

  // Group endpoints by API group
  const groups = ["TASKS", "WORKERS", "SYSTEM", "SEEDING"] as const

  return (
    <div className="space-y-6">
      {/* Context Settings Card */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <Collapsible open={showSettings} onOpenChange={setShowSettings}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-black/5 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-500 text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Context Settings</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      User ID: <strong>{userId}</strong> (used for endpoints that require user context)
                    </p>
                  </div>
                </div>
                {showSettings ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 border-t">
              <div className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(parseInt(e.target.value) || 7)}
                    placeholder="7"
                  />
                  <p className="text-xs text-muted-foreground">
                    Common IDs: 7 (David Keener), 256 (Katie Grow), 133 (Brad Walton)
                  </p>
                </div>
                <Button onClick={saveSettings} className="w-fit">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Database className="h-4 w-4 text-slate-600" />
              <span className="font-medium text-sm text-slate-600">Total</span>
            </div>
            <p className="text-2xl font-bold">{totalEndpoints}</p>
            <p className="text-xs text-muted-foreground">endpoints</p>
          </CardContent>
        </Card>
        <Card className={`border-2 ${passedCount > 0 ? "bg-green-50 border-green-300" : "bg-slate-50 border-slate-200"}`}>
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className={`h-4 w-4 ${passedCount > 0 ? "text-green-600" : "text-slate-400"}`} />
              <span className={`font-medium text-sm ${passedCount > 0 ? "text-green-600" : "text-slate-400"}`}>Passed</span>
            </div>
            <p className={`text-2xl font-bold ${passedCount > 0 ? "text-green-600" : "text-slate-400"}`}>{passedCount}</p>
            <p className="text-xs text-muted-foreground">tests</p>
          </CardContent>
        </Card>
        <Card className={`border-2 ${failedCount > 0 ? "bg-red-50 border-red-300" : "bg-slate-50 border-slate-200"}`}>
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className={`h-4 w-4 ${failedCount > 0 ? "text-red-600" : "text-slate-400"}`} />
              <span className={`font-medium text-sm ${failedCount > 0 ? "text-red-600" : "text-slate-400"}`}>Failed</span>
            </div>
            <p className={`text-2xl font-bold ${failedCount > 0 ? "text-red-600" : "text-slate-400"}`}>{failedCount}</p>
            <p className="text-xs text-muted-foreground">tests</p>
          </CardContent>
        </Card>
        <Card className={`border-2 ${runningCount > 0 ? "bg-blue-50 border-blue-300 animate-pulse" : "bg-slate-50 border-slate-200"}`}>
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {runningCount > 0 ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              ) : (
                <Activity className="h-4 w-4 text-slate-400" />
              )}
              <span className={`font-medium text-sm ${runningCount > 0 ? "text-blue-600" : "text-slate-400"}`}>Running</span>
            </div>
            <p className={`text-2xl font-bold ${runningCount > 0 ? "text-blue-600" : "text-slate-400"}`}>{runningCount}</p>
            <p className="text-xs text-muted-foreground">active</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm text-purple-600">Avg Time</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{avgDuration || "-"}</p>
            <p className="text-xs text-muted-foreground">{avgDuration ? "ms" : "no data"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Group Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {groups.map(group => {
          const endpoints = getEndpointsByGroup(group)
          const Icon = groupIcons[group]
          const groupResults = endpoints.map(e => lastResults.get(e.endpoint)).filter(Boolean)
          const groupPassed = groupResults.filter(r => r?.success).length
          const groupTested = groupResults.length
          return (
            <Card key={group} className={`${groupBgColors[group]} transition-all hover:shadow-md cursor-pointer`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${groupColors[group]} text-white`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-sm">{group}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {groupTested > 0 && (
                      <Badge variant="outline" className={`text-xs ${groupPassed === groupTested ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {groupPassed}/{groupTested}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">{endpoints.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Results - FP-Style Display (Sticky) */}
      {results.length > 0 && (
        <Card className="sticky top-4 z-10 shadow-lg border-2 border-slate-300">
          <CardHeader className="py-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Results
                <Badge variant="outline" className={`text-xs ml-2 ${
                  passedCount === results.length
                    ? "bg-green-100 text-green-700 border-green-300"
                    : failedCount > 0
                      ? "bg-red-100 text-red-700 border-red-300"
                      : "bg-white"
                }`}>
                  {passedCount}/{results.length} passed
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-3">
                {/* Data freshness indicator */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white px-2 py-1 rounded border">
                  <RefreshCw className="h-3 w-3" />
                  <span>Last run: {formatTimeAgo(results[0].timestamp)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setResults([])
                    setLastResults(new Map())
                  }}
                  className="text-muted-foreground hover:text-red-600"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {results.map((result, idx) => (
                <ResultCard key={idx} result={result} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endpoints by Group */}
      {groups.map(group => {
        const endpoints = getEndpointsByGroup(group)
        const Icon = groupIcons[group]

        return (
          <EndpointGroup
            key={group}
            group={group}
            endpoints={endpoints}
            icon={Icon}
            color={groupColors[group]}
            bgColor={groupBgColors[group]}
            running={running}
            lastResults={lastResults}
            onRun={runEndpoint}
            onRunAll={runAllEndpoints}
            userId={userId}
            copiedUrl={copiedUrl}
            onCopyUrl={copyToClipboard}
          />
        )
      })}
    </div>
  )
}

// FP-Style Result Card - Shows error chains and step information
function ResultCard({ result }: { result: RunResult }) {
  const [expanded, setExpanded] = useState(false)

  // Response type badge colors
  const responseTypeColors = {
    "fp-result": "bg-purple-100 text-purple-700",
    "raw-data": "bg-blue-100 text-blue-700",
    "validation-error": "bg-orange-100 text-orange-700",
    "network-error": "bg-red-100 text-red-700",
  }

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className={`rounded-lg border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-black/5">
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{result.taskName}</span>
                {result.step && (
                  <Badge variant="outline" className="text-xs font-mono">
                    step: {result.step}
                  </Badge>
                )}
              </div>
              <code className="text-xs text-muted-foreground">{result.endpoint}</code>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={`text-xs ${responseTypeColors[result.responseType]}`}>
                {result.responseType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {result.duration}ms
              </Badge>
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Error message preview */}
        {!expanded && result.error ? (
          <div className="px-3 pb-2 -mt-1">
            <div className="flex items-center gap-2 text-xs text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span className="truncate">{result.error}</span>
            </div>
          </div>
        ) : null}

        <CollapsibleContent>
          <div className="px-3 pb-3 pt-1 border-t space-y-3">
            {/* Error Details */}
            {result.error ? (
              <div className="p-2 bg-red-100 rounded border border-red-200">
                <div className="flex items-center gap-2 text-sm font-medium text-red-700 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Error at step: <code className="font-mono">{result.step || "unknown"}</code>
                </div>
                <p className="text-sm text-red-600">{result.error}</p>
                {result.code ? (
                  <p className="text-xs text-red-500 mt-1 font-mono">Code: {result.code}</p>
                ) : null}
              </div>
            ) : null}

            {/* Success Data Preview */}
            {result.success && result.data ? (
              <div className="p-2 bg-green-100 rounded border border-green-200">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-1">
                  <CheckCircle className="h-4 w-4" />
                  Completed at step: <code className="font-mono">{result.step || "unknown"}</code>
                </div>
              </div>
            ) : null}

            {/* Raw Response */}
            <div className="p-2 bg-slate-100 rounded border">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1">
                <Code className="h-3 w-3" />
                Raw Response
              </div>
              <pre className="text-xs font-mono overflow-x-auto max-h-48 text-slate-700">
                {JSON.stringify(result.rawResponse || result.data, null, 2)}
              </pre>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function EndpointGroup({
  group,
  endpoints,
  icon: Icon,
  color,
  bgColor,
  running,
  lastResults,
  onRun,
  onRunAll,
  userId,
  copiedUrl,
  onCopyUrl,
}: {
  group: string
  endpoints: MCPEndpoint[]
  icon: React.ElementType
  color: string
  bgColor: string
  running: Set<string>
  lastResults: Map<string, RunResult>
  onRun: (e: MCPEndpoint) => void
  onRunAll: (endpoints: MCPEndpoint[]) => void
  userId: number
  copiedUrl: string | null
  onCopyUrl: (url: string) => void
}) {
  const [isOpen, setIsOpen] = useState(group === "TASKS")
  const standaloneCount = endpoints.filter(e => !e.requiresUserId).length
  const needsUserCount = endpoints.filter(e => e.requiresUserId).length
  const runningCount = endpoints.filter(e => running.has(e.endpoint)).length
  const isAnyRunning = runningCount > 0

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={bgColor}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-black/5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">MCP: {group}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {endpoints.length} endpoints ({standaloneCount} standalone, {needsUserCount} need user_id)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{endpoints.length}</Badge>
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 border-t">
            {/* Run All Button */}
            <div className="flex items-center justify-between mt-4 mb-3 p-2 bg-white/50 rounded-lg border border-dashed">
              <span className="text-sm text-muted-foreground">
                {isAnyRunning
                  ? `Running ${runningCount} of ${endpoints.length} endpoints...`
                  : `Run all ${endpoints.length} endpoints in this group`
                }
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onRunAll(endpoints)
                }}
                disabled={isAnyRunning}
                className="shrink-0"
              >
                {isAnyRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Running {runningCount}/{endpoints.length}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Run All ({endpoints.length})
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {endpoints.map(endpoint => {
                const isRunning = running.has(endpoint.endpoint)
                const lastResult = lastResults.get(endpoint.endpoint)
                const hasResult = !!lastResult

                return (
                  <div
                    key={endpoint.endpoint}
                    className={`flex items-center gap-3 p-3 bg-white rounded-lg border transition-colors ${
                      hasResult
                        ? lastResult.success
                          ? "border-l-4 border-l-green-500"
                          : "border-l-4 border-l-red-500"
                        : ""
                    }`}
                  >
                    <Button
                      size="sm"
                      variant={isRunning ? "secondary" : "default"}
                      onClick={() => onRun(endpoint)}
                      disabled={isRunning}
                      className="shrink-0 min-w-[70px]"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-1">Running</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span className="ml-1">Run</span>
                        </>
                      )}
                    </Button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{endpoint.taskName}</span>
                        {endpoint.requiresUserId && (
                          <Badge variant="outline" className="text-xs">
                            user_id: {userId}
                          </Badge>
                        )}
                        {/* Inline result indicator */}
                        {hasResult && (
                          <span className={`inline-flex items-center gap-1 text-xs ${
                            lastResult.success ? "text-green-600" : "text-red-600"
                          }`}>
                            {lastResult.success ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            <span>{lastResult.duration}ms</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-muted-foreground">
                          {endpoint.method} {endpoint.endpoint}
                        </code>
                        {/* Copy URL button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            const baseUrl = MCP_BASES[endpoint.apiGroup]
                            onCopyUrl(`${baseUrl}${endpoint.endpoint}`)
                          }}
                          title="Copy URL"
                        >
                          {copiedUrl?.endsWith(endpoint.endpoint) ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {endpoint.description}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={endpoint.method === "GET" ? "text-blue-600" : "text-green-600"}
                    >
                      {endpoint.method}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
