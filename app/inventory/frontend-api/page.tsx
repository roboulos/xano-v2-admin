"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Play,
  CheckCircle2,
  XCircle,
  Circle,
  Loader2,
  Copy,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Search,
  Filter,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import {
  ALL_FRONTEND_ENDPOINTS,
  API_BASE,
  CATEGORY_LABELS,
  getTestStats,
  getEndpointsByCategory,
  buildTestUrl,
  generateCurlCommand,
  type FrontendEndpoint,
} from "@/lib/frontend-api-v2-endpoints"

function StatusBadge({ result }: { result?: "pending" | "running" | "success" | "error" }) {
  if (result === "success") {
    return (
      <Badge className="bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Pass
      </Badge>
    )
  }
  if (result === "error") {
    return (
      <Badge className="bg-red-100 text-red-700">
        <XCircle className="h-3 w-3 mr-1" />
        Fail
      </Badge>
    )
  }
  if (result === "running") {
    return (
      <Badge className="bg-blue-100 text-blue-700">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Running
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <Circle className="h-3 w-3 mr-1" />
      Untested
    </Badge>
  )
}

function EndpointRow({
  endpoint,
  token,
  onTest,
  isRunning,
}: {
  endpoint: FrontendEndpoint
  token: string
  onTest: (endpoint: FrontendEndpoint) => Promise<void>
  isRunning: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [localResult, setLocalResult] = useState<"pending" | "success" | "error" | "running">(
    endpoint.status
  )
  const [testOutput, setTestOutput] = useState<string | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCurlCommand(endpoint, token))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTest = async () => {
    setTestOutput(null)
    setLocalResult("running")
    setResponseTime(null)

    const startTime = Date.now()

    try {
      const url = buildTestUrl(endpoint)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (endpoint.authRequired && token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: endpoint.method,
        headers,
        ...(endpoint.testBody && { body: JSON.stringify(endpoint.testBody) }),
      })

      const endTime = Date.now()
      setResponseTime(endTime - startTime)

      const data = await response.json()

      if (response.ok && data.success !== false) {
        setLocalResult("success")
        setTestOutput(JSON.stringify(data, null, 2).slice(0, 1000))
      } else {
        setLocalResult("error")
        setTestOutput(JSON.stringify(data, null, 2).slice(0, 1000))
      }
    } catch (err) {
      const endTime = Date.now()
      setResponseTime(endTime - startTime)
      setLocalResult("error")
      setTestOutput(err instanceof Error ? err.message : "Network error")
    }
  }

  const categoryInfo = CATEGORY_LABELS[endpoint.category]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="font-mono text-xs">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell className="font-mono text-xs">{endpoint.id}</TableCell>
        <TableCell>
          <code className="text-xs bg-muted px-1 py-0.5 rounded">{endpoint.path}</code>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-xs">
            {endpoint.method}
          </Badge>
        </TableCell>
        <TableCell className="text-sm">{endpoint.name}</TableCell>
        <TableCell>
          <Badge className={`text-xs ${categoryInfo.color}`}>{categoryInfo.label}</Badge>
        </TableCell>
        <TableCell>
          <StatusBadge result={localResult} />
        </TableCell>
        <TableCell>
          {responseTime !== null && (
            <span className="text-xs text-muted-foreground">{responseTime}ms</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isRunning}
              className="h-7 px-2"
            >
              {localResult === "running" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2"
              title="Copy curl command"
            >
              {copied ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <TableRow>
          <TableCell colSpan={9} className="bg-muted/30 p-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Description:</span>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Auth Required:</span>
                <span className="ml-2 text-sm">
                  {endpoint.authRequired ? `Yes (${endpoint.authRequired})` : "No"}
                </span>
              </div>
              {endpoint.tags.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Tags:</span>
                  <div className="flex gap-1 mt-1">
                    {endpoint.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {endpoint.testParams && (
                <div>
                  <span className="text-sm font-medium">Test Params:</span>
                  <code className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                    ?{endpoint.testParams}
                  </code>
                </div>
              )}
              {endpoint.testBody && (
                <div>
                  <span className="text-sm font-medium">Test Body:</span>
                  <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(endpoint.testBody, null, 2)}
                  </pre>
                </div>
              )}
              {testOutput && (
                <div>
                  <span className="text-sm font-medium">Test Output:</span>
                  <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto max-h-48">
                    {testOutput}
                  </pre>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">curl Command:</span>
                <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                  {generateCurlCommand(endpoint, token)}
                </pre>
              </div>
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function FrontendApiPage() {
  const [token, setToken] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<FrontendEndpoint["category"] | "all">("all")
  const [isRunningAll, setIsRunningAll] = useState(false)

  const stats = getTestStats()

  // Filter endpoints based on search and category
  const filteredEndpoints = ALL_FRONTEND_ENDPOINTS.filter((endpoint) => {
    const matchesSearch =
      searchQuery === "" ||
      endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" || endpoint.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleTestEndpoint = useCallback(async (endpoint: FrontendEndpoint) => {
    // Placeholder - actual test happens in EndpointRow
  }, [])

  const handleRunAll = async () => {
    setIsRunningAll(true)
    // In a real implementation, this would run all tests
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRunningAll(false)
  }

  const progressPercent = stats.total > 0 ? (stats.testedCount / stats.total) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/inventory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Frontend API v2 - Endpoint Coverage</h1>
            <p className="text-sm text-muted-foreground">
              API Group 515 (🚀 Frontend API v2) - Testing dashboards2.0 compatibility
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Testing Workspace 5 Backend Compatibility
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Goal: 100% pass rate - backend returns EXACTLY what dashboards2.0 frontend expects.
                  When tests fail, FIX IN XANO (not frontend) using FP patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Endpoints</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.passing}</div>
              <div className="text-sm text-muted-foreground">Passing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{stats.failing}</div>
              <div className="text-sm text-muted-foreground">Failing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-400">{stats.untested}</div>
              <div className="text-sm text-muted-foreground">Untested</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.passRate}%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.testedCount}</div>
              <div className="text-sm text-muted-foreground">Tested</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {stats.testedCount > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Testing Progress</span>
                  <span className="text-muted-foreground">
                    {stats.testedCount}/{stats.total} endpoints
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Test Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              {/* Auth Token Input */}
              <div className="flex items-center gap-2">
                <Label htmlFor="token" className="text-sm">Auth Token:</Label>
                <Input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste auth token here"
                  className="w-48"
                />
              </div>

              <div className="h-8 w-px bg-border" />

              {/* Search */}
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as FrontendEndpoint["category"] | "all")}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label} ({getEndpointsByCategory(key as FrontendEndpoint["category"]).length})
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-auto">
                <Button onClick={handleRunAll} disabled={isRunningAll}>
                  {isRunningAll ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run All Tests
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Endpoints ({filteredEndpoints.length})
              </CardTitle>
              <Badge variant="outline" className="font-mono text-xs">
                {API_BASE}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead className="w-64">Path</TableHead>
                    <TableHead className="w-20">Method</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-24">Category</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-20">Time</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEndpoints.map((endpoint) => (
                    <EndpointRow
                      key={endpoint.id}
                      endpoint={endpoint}
                      token={token}
                      onTest={handleTestEndpoint}
                      isRunning={isRunningAll}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Frontend API v2 Endpoint Coverage - Testing dashboards2.0 Compatibility</p>
          <p className="text-xs mt-1">
            {stats.passing}/{stats.testedCount} tests passing ({stats.passRate}%) • {stats.untested} untested
          </p>
        </div>
      </div>
    </div>
  )
}
