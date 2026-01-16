"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Code2,
  Copy,
  Check,
  Search,
  FileJson,
  Download,
  Play,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  Server,
  Settings,
  Beaker,
} from "lucide-react"
import { MCP_ENDPOINTS, MCP_BASES, getEndpointsByGroup, type MCPEndpoint } from "@/lib/mcp-endpoints"

// Group icons
const groupIcons = {
  TASKS: Zap,
  WORKERS: Server,
  SYSTEM: Settings,
  SEEDING: Beaker,
}

function getMethodColor(method: string) {
  switch (method) {
    case "GET":
      return "bg-green-100 text-green-700"
    case "POST":
      return "bg-blue-100 text-blue-700"
    case "PUT":
      return "bg-amber-100 text-amber-700"
    case "DELETE":
      return "bg-red-100 text-red-700"
    case "PATCH":
      return "bg-purple-100 text-purple-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

interface EndpointTestResult {
  success: boolean
  duration: number
  data?: unknown
  error?: string
}

function EndpointCard({
  endpoint,
  userId,
  onCopy,
}: {
  endpoint: MCPEndpoint
  userId: number
  onCopy: (text: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<EndpointTestResult | null>(null)

  const baseUrl = MCP_BASES[endpoint.apiGroup]
  const fullUrl = `${baseUrl}${endpoint.endpoint}`

  const handleCopy = () => {
    const curlCommand = generateCurl(endpoint, userId)
    navigator.clipboard.writeText(curlCommand)
    setCopied(true)
    onCopy(curlCommand)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateCurl = (ep: MCPEndpoint, uid: number) => {
    let cmd = `curl -X ${ep.method} "${MCP_BASES[ep.apiGroup]}${ep.endpoint}"`
    if (ep.method === "POST") {
      if (ep.requiresUserId) {
        cmd += ` \\\n  -H "Content-Type: application/json" \\\n  -d '{"user_id": ${uid}}'`
      } else {
        cmd += ` \\\n  -H "Content-Type: application/json" \\\n  -d '{}'`
      }
    } else if (ep.method === "GET" && ep.requiresUserId) {
      cmd = `curl -X GET "${MCP_BASES[ep.apiGroup]}${ep.endpoint}?user_id=${uid}"`
    }
    return cmd
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const startTime = Date.now()

    try {
      let url = fullUrl
      const options: RequestInit = {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
      }

      if (endpoint.method === "GET" && endpoint.requiresUserId) {
        url += `?user_id=${userId}`
      } else if (endpoint.method === "POST") {
        options.body = endpoint.requiresUserId
          ? JSON.stringify({ user_id: userId })
          : JSON.stringify({})
      }

      const response = await fetch(url, options)
      const data = await response.json()
      const duration = Date.now() - startTime

      setTestResult({
        success: data.success !== false && !data.code,
        duration,
        data,
      })
    } catch (err) {
      const duration = Date.now() - startTime
      setTestResult({
        success: false,
        duration,
        error: err instanceof Error ? err.message : "Network error",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden hover:border-primary/30 transition-colors">
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Badge className={`${getMethodColor(endpoint.method)} font-mono text-xs`}>
          {endpoint.method}
        </Badge>
        <code className="font-mono text-sm flex-1 truncate">{endpoint.endpoint}</code>
        <div className="flex items-center gap-2">
          {endpoint.requiresUserId ? (
            <Badge variant="outline" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              user_id
            </Badge>
          ) : (
            <Unlock className="h-3 w-3 text-green-600" />
          )}
          {testResult && (
            testResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t bg-muted/20 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
            <Badge variant="outline">{endpoint.apiGroup}</Badge>
          </div>

          {/* Full URL */}
          <div>
            <h4 className="text-sm font-medium mb-2">Full URL</h4>
            <code className="text-xs bg-background border rounded p-2 block overflow-x-auto">
              {fullUrl}
            </code>
          </div>

          {/* Curl Example */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Curl Example</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-background border rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {generateCurl(endpoint, userId)}
            </pre>
          </div>

          {/* Test Result */}
          {testResult && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Test Result
                <span className={`ml-2 text-xs ${testResult.success ? "text-green-600" : "text-red-600"}`}>
                  {testResult.success ? "Success" : "Failed"} ({testResult.duration}ms)
                </span>
              </h4>
              <pre className="bg-background border rounded p-3 text-xs font-mono overflow-x-auto max-h-40">
                {JSON.stringify(testResult.data || testResult.error, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleTest} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Test Endpoint
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ApiContractTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [groupFilter, setGroupFilter] = useState<string>("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const [userId, setUserId] = useState<number>(7)

  const groups = ["TASKS", "WORKERS", "SYSTEM", "SEEDING"] as const

  const filteredEndpoints = MCP_ENDPOINTS.filter((ep) => {
    const matchesSearch =
      ep.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGroup = groupFilter === "all" || ep.apiGroup === groupFilter
    return matchesSearch && matchesGroup
  })

  const handleGenerateContract = useCallback(async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate OpenAPI spec from MCP_ENDPOINTS
    const contract = {
      openapi: "3.0.0",
      info: {
        title: "AgentDashboards V2 API",
        version: "2.0.0",
        description: "V2 backend API endpoints for AgentDashboards",
      },
      servers: Object.entries(MCP_BASES).map(([name, url]) => ({
        url,
        description: `${name} API Group`,
      })),
      paths: MCP_ENDPOINTS.reduce((acc, ep) => {
        const key = ep.endpoint
        if (!acc[key]) {
          acc[key] = {}
        }
        acc[key][ep.method.toLowerCase()] = {
          summary: ep.taskName,
          description: ep.description,
          tags: [ep.apiGroup],
          parameters: ep.requiresUserId
            ? [
                {
                  name: "user_id",
                  in: ep.method === "GET" ? "query" : "body",
                  required: true,
                  schema: { type: "integer" },
                },
              ]
            : [],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        }
        return acc
      }, {} as Record<string, Record<string, unknown>>),
    }

    const blob = new Blob([JSON.stringify(contract, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "agentdashboards-v2-api-contract.json"
    a.click()
    URL.revokeObjectURL(url)

    setIsGenerating(false)
  }, [])

  const handleCopy = useCallback((text: string) => {
    console.log("Copied:", text)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Code2 className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-lg">V2 API Contract</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {MCP_ENDPOINTS.length} endpoints from lib/mcp-endpoints.ts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{MCP_ENDPOINTS.length} Endpoints</Badge>
              <Button
                onClick={handleGenerateContract}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileJson className="h-4 w-4 mr-2" />
                    Export OpenAPI
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* User ID and Search */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">User ID:</span>
              <Input
                type="number"
                value={userId}
                onChange={(e) => setUserId(parseInt(e.target.value) || 7)}
                className="w-20"
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Groups</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group} ({getEndpointsByGroup(group).length})
                </option>
              ))}
            </select>
          </div>

          {/* API Base URLs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.entries(MCP_BASES).map(([name, url]) => {
              const Icon = groupIcons[name as keyof typeof groupIcons]
              return (
                <div key={name} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{name}</span>
                  </div>
                  <code className="text-xs text-muted-foreground break-all">
                    {url.replace("https://x2nu-xcjc-vhax.agentdashboards.xano.io/", "")}
                  </code>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Endpoints by Group */}
      {groups
        .filter((group) => groupFilter === "all" || group === groupFilter)
        .map((group) => {
          const groupEndpoints = filteredEndpoints.filter((e) => e.apiGroup === group)
          if (groupEndpoints.length === 0) return null

          const Icon = groupIcons[group]

          return (
            <Card key={group}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group}</CardTitle>
                      <code className="text-xs text-muted-foreground">
                        {MCP_BASES[group]}
                      </code>
                    </div>
                  </div>
                  <Badge variant="outline">{groupEndpoints.length} endpoints</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupEndpoints.map((endpoint) => (
                    <EndpointCard
                      key={endpoint.endpoint}
                      endpoint={endpoint}
                      userId={userId}
                      onCopy={handleCopy}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

      {/* Important Header Note */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">
                V2 Backend - Workspace 5
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                All endpoints use the V2 backend at{" "}
                <code className="bg-amber-200 px-1 rounded">
                  x2nu-xcjc-vhax.agentdashboards.xano.io
                </code>
                . For demo user auth, include{" "}
                <code className="bg-amber-200 px-1 rounded">
                  X-Data-Source: demo_data
                </code>{" "}
                header.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
