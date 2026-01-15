"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Loader2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Zap,
  Database,
  Server,
  Settings,
  Beaker,
  AlertCircle,
  Code,
  Copy,
  Check,
  Download,
  Inbox,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  MCP_ENDPOINTS,
  MCP_BASES,
  getEndpointsByGroup,
  type MCPEndpoint,
} from "@/lib/mcp-endpoints"
import {
  normalizeXanoResponse,
  isXanoFailure,
} from "@/lib/types-v2"

// Enhanced result with FP-style data
interface RunResult {
  endpoint: string
  taskName: string
  success: boolean
  step?: string
  data?: unknown
  error?: string
  code?: string
  duration: number
  timestamp: Date
  rawResponse?: unknown
  responseType: "fp-result" | "raw-data" | "validation-error" | "network-error"
}

const groupIcons = {
  TASKS: Zap,
  WORKERS: Server,
  SYSTEM: Settings,
  SEEDING: Beaker,
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

// Format duration helper
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function MCPRunner() {
  const searchParams = useSearchParams()

  // Context settings
  const [userId, setUserId] = useState<number>(7)
  const [showSettings, setShowSettings] = useState(false)

  // Run state
  const [running, setRunning] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<RunResult[]>([])
  const [lastResults, setLastResults] = useState<Map<string, RunResult>>(new Map())

  // UI state
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [showClearedToast, setShowClearedToast] = useState(false)
  const [resultsCollapsed, setResultsCollapsed] = useState(false)
  const cancelRef = useRef(false)

  // Computed stats
  const totalEndpoints = MCP_ENDPOINTS.length
  const passedCount = results.filter(r => r.success).length
  const failedCount = results.filter(r => !r.success).length
  const runningCount = running.size

  // Load settings
  useEffect(() => {
    const urlUserId = searchParams.get("userId")
    if (urlUserId) {
      const parsed = parseInt(urlUserId, 10)
      if (!isNaN(parsed)) {
        setUserId(parsed)
        return
      }
    }
    const saved = localStorage.getItem("mcp-runner-settings")
    if (saved) {
      const settings = JSON.parse(saved)
      if (settings.userId) setUserId(settings.userId)
    }
    const collapsedState = localStorage.getItem("mcp-runner-results-collapsed")
    if (collapsedState !== null) {
      setResultsCollapsed(collapsedState === "true")
    }
  }, [searchParams])

  const saveSettings = () => {
    localStorage.setItem("mcp-runner-settings", JSON.stringify({ userId }))
    setShowSettings(false)
  }

  const toggleResultsCollapsed = () => {
    const newState = !resultsCollapsed
    setResultsCollapsed(newState)
    localStorage.setItem("mcp-runner-results-collapsed", String(newState))
  }

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  // Run an endpoint
  const runEndpoint = async (endpoint: MCPEndpoint) => {
    const key = endpoint.endpoint
    setRunning(prev => new Set(prev).add(key))
    const startTime = Date.now()

    try {
      const baseUrl = MCP_BASES[endpoint.apiGroup]
      let url = `${baseUrl}${endpoint.endpoint}`

      if (endpoint.method === "GET" && endpoint.requiresUserId) {
        url += `?user_id=${userId}`
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
      }

      if (endpoint.method === "POST" && endpoint.requiresUserId) {
        options.body = JSON.stringify({ user_id: userId })
      }

      const response = await fetch(url, options)
      const rawData = await response.json()
      const duration = Date.now() - startTime
      const normalized = normalizeXanoResponse(rawData, endpoint.endpoint)

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
      setLastResults(prev => new Map(prev).set(endpoint.endpoint, errorResult))
    } finally {
      setRunning(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  const runAllEndpoints = async (endpoints: MCPEndpoint[]) => {
    cancelRef.current = false
    for (const endpoint of endpoints) {
      if (cancelRef.current) break
      await runEndpoint(endpoint)
    }
  }

  const exportResults = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      summary: { total: results.length, passed: passedCount, failed: failedCount },
      results: results.map(r => ({
        endpoint: r.endpoint,
        taskName: r.taskName,
        success: r.success,
        duration: r.duration,
        timestamp: r.timestamp.toISOString(),
        responseType: r.responseType,
        step: r.step,
        error: r.error,
        data: r.data,
      })),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mcp-results-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [results, userId, passedCount, failedCount])

  const groups = ["TASKS", "WORKERS", "SYSTEM", "SEEDING"] as const

  return (
    <div className="space-y-6">
      {/* Info Bar - matches demo-sync style */}
      <div className="flex items-center gap-6 text-sm border rounded-xl px-5 py-4 bg-card/50 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Endpoints:</span>
          <span className="font-semibold">{totalEndpoints}</span>
        </div>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Passed:</span>
          <span className={`font-semibold ${passedCount > 0 ? "text-green-600" : ""}`}>{passedCount}</span>
        </div>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Failed:</span>
          <span className={`font-semibold ${failedCount > 0 ? "text-red-600" : ""}`}>{failedCount}</span>
        </div>
        {runningCount > 0 && (
          <>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <span className="text-blue-600 font-semibold">{runningCount} running</span>
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {results.length} results
          </Badge>
        </div>
      </div>

      {/* Context Settings - Collapsible */}
      <Collapsible open={showSettings} onOpenChange={setShowSettings}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-4 w-4" />
            <span>User ID: <strong className="text-foreground">{userId}</strong></span>
            {showSettings ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-3 border-dashed">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-end gap-4">
                <div className="grid gap-2 flex-1 max-w-xs">
                  <Label htmlFor="userId" className="text-sm">User ID for context-aware endpoints</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(parseInt(e.target.value) || 7)}
                    placeholder="7"
                  />
                  <p className="text-xs text-muted-foreground">
                    Common: 7 (David), 256 (Katie), 133 (Brad)
                  </p>
                </div>
                <Button onClick={saveSettings} size="sm">Save</Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Recent Results */}
      {results.length > 0 ? (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleResultsCollapsed}
                className="flex items-center gap-2 hover:bg-muted/50 rounded px-2 py-1 -ml-2 transition-colors"
              >
                {resultsCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Results
                  <Badge variant="outline" className="ml-2">
                    {passedCount}/{results.length} passed
                  </Badge>
                </CardTitle>
              </button>
              <div className="flex items-center gap-3">
                {!resultsCollapsed && (
                  <span className="text-xs text-muted-foreground">
                    Last run: {formatTimeAgo(results[0].timestamp)}
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={exportResults} className="h-8">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-destructive">
                      Clear
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all results?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear all {results.length} test results.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setResults([])
                          setLastResults(new Map())
                          setShowClearedToast(true)
                          setTimeout(() => setShowClearedToast(false), 2000)
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          {!resultsCollapsed && (
            <CardContent className="pt-0 max-h-80 overflow-y-auto">
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <ResultCard key={idx} result={result} />
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Inbox className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No test results yet. Run an endpoint to see results.</p>
          </CardContent>
        </Card>
      )}

      {/* Toast */}
      {showClearedToast && (
        <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="h-4 w-4" />
          <span className="text-sm">Results cleared</span>
        </div>
      )}

      {/* Endpoint Groups */}
      <div className="space-y-4">
        {groups.map(group => (
          <EndpointGroup
            key={group}
            group={group}
            endpoints={getEndpointsByGroup(group)}
            icon={groupIcons[group]}
            running={running}
            lastResults={lastResults}
            onRun={runEndpoint}
            onRunAll={runAllEndpoints}
            userId={userId}
            copiedUrl={copiedUrl}
            onCopyUrl={copyToClipboard}
          />
        ))}
      </div>
    </div>
  )
}

function ResultCard({ result }: { result: RunResult }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className={`rounded-lg border ${result.success ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-black/5 transition-colors">
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">{result.taskName}</span>
              {result.step && (
                <Badge variant="outline" className="ml-2 text-xs font-mono">
                  {result.step}
                </Badge>
              )}
              <p className="text-xs text-muted-foreground truncate">{result.endpoint}</p>
            </div>
            <span className="text-xs text-muted-foreground">{formatDuration(result.duration)}</span>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </CollapsibleTrigger>

        {!expanded && result.error && (
          <p className="px-3 pb-2 text-xs text-red-600 truncate">{result.error}</p>
        )}

        <CollapsibleContent>
          <div className="px-3 pb-3 border-t space-y-2">
            {result.error && (
              <div className="p-2 bg-red-100 rounded text-sm text-red-700 mt-2">
                <strong>Error:</strong> {result.error}
              </div>
            )}
            <div className="p-2 bg-muted rounded mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Code className="h-3 w-3" />
                Response
              </div>
              <pre className="text-xs font-mono overflow-x-auto max-h-40">
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
  running: Set<string>
  lastResults: Map<string, RunResult>
  onRun: (e: MCPEndpoint) => void
  onRunAll: (endpoints: MCPEndpoint[]) => void
  userId: number
  copiedUrl: string | null
  onCopyUrl: (url: string) => void
}) {
  const [isOpen, setIsOpen] = useState(group === "TASKS")
  const runningCount = endpoints.filter(e => running.has(e.endpoint)).length
  const testedCount = endpoints.filter(e => lastResults.has(e.endpoint)).length
  const passedCount = endpoints.filter(e => lastResults.get(e.endpoint)?.success).length

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{group}</CardTitle>
                  <p className="text-sm text-muted-foreground">{endpoints.length} endpoints</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {testedCount > 0 && (
                  <span className={`text-sm ${passedCount === testedCount ? "text-green-600" : "text-amber-600"}`}>
                    {passedCount}/{testedCount} passed
                  </span>
                )}
                {runningCount > 0 && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    {runningCount}
                  </Badge>
                )}
                {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 border-t">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">
                {runningCount > 0 ? `Running ${runningCount}/${endpoints.length}...` : `Run all ${endpoints.length} endpoints`}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRunAll(endpoints)}
                disabled={runningCount > 0}
              >
                {runningCount > 0 ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Running</>
                ) : (
                  <><Play className="h-4 w-4 mr-1" /> Run All</>
                )}
              </Button>
            </div>

            <div className="space-y-1">
              {endpoints.map(endpoint => {
                const isRunning = running.has(endpoint.endpoint)
                const lastResult = lastResults.get(endpoint.endpoint)

                return (
                  <div
                    key={endpoint.endpoint}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors ${
                      lastResult ? (lastResult.success ? "bg-green-50/50" : "bg-red-50/50") : ""
                    }`}
                  >
                    <Button
                      size="sm"
                      variant={isRunning ? "secondary" : "ghost"}
                      onClick={() => onRun(endpoint)}
                      disabled={isRunning}
                      className="h-7 px-2"
                    >
                      {isRunning ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{endpoint.taskName}</span>
                        {endpoint.requiresUserId && (
                          <Badge variant="outline" className="text-xs h-5">user: {userId}</Badge>
                        )}
                        {lastResult && (
                          <span className={`text-xs ${lastResult.success ? "text-green-600" : "text-red-600"}`}>
                            {lastResult.success ? "✓" : "✗"} {formatDuration(lastResult.duration)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <code className="text-xs text-muted-foreground">{endpoint.method} {endpoint.endpoint}</code>
                        <button
                          onClick={() => onCopyUrl(`${MCP_BASES[endpoint.apiGroup]}${endpoint.endpoint}`)}
                          className="opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity p-0.5"
                        >
                          {copiedUrl?.endsWith(endpoint.endpoint) ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-xs shrink-0">
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
