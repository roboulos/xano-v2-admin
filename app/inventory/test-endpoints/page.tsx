'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
} from 'lucide-react'
import Link from 'next/link'
import {
  TEST_ENDPOINTS,
  TEST_API_BASE,
  VERIFIED_TEST_USER,
  getTestStats,
  getEndpointsByCategory,
  buildTestUrl,
  generateCurlCommand,
  type TestEndpoint,
  type TestEndpointCategory,
} from '@/lib/test-endpoints-inventory'

const CATEGORY_LABELS: Record<TestEndpointCategory, { label: string; color: string }> = {
  fub: { label: 'FUB', color: 'bg-purple-100 text-purple-700' },
  rezen: { label: 'reZEN', color: 'bg-blue-100 text-blue-700' },
  skyslope: { label: 'SkySlope', color: 'bg-green-100 text-green-700' },
  metrics: { label: 'Metrics', color: 'bg-orange-100 text-orange-700' },
  network: { label: 'Network', color: 'bg-cyan-100 text-cyan-700' },
  utility: { label: 'Utility', color: 'bg-gray-100 text-gray-700' },
  aggregation: { label: 'Aggregation', color: 'bg-yellow-100 text-yellow-700' },
  system: { label: 'System', color: 'bg-red-100 text-red-700' },
  seeding: { label: 'Seeding', color: 'bg-pink-100 text-pink-700' },
}

function StatusBadge({ result }: { result?: 'pass' | 'fail' | 'untested' }) {
  if (result === 'pass') {
    return (
      <Badge className="bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Pass
      </Badge>
    )
  }
  if (result === 'fail') {
    return (
      <Badge className="bg-red-100 text-red-700">
        <XCircle className="h-3 w-3 mr-1" />
        Fail
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
  userId,
  onTest,
  isRunning,
}: {
  endpoint: TestEndpoint
  userId: number
  onTest: (endpoint: TestEndpoint) => Promise<void>
  isRunning: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [localResult, setLocalResult] = useState<'pass' | 'fail' | 'untested' | undefined>(
    endpoint.testResult
  )
  const [testOutput, setTestOutput] = useState<string | null>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCurlCommand(endpoint, userId))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTest = async () => {
    setTestOutput(null)
    try {
      const url = buildTestUrl(endpoint)
      const inputs = endpoint.requiresUserId
        ? { ...endpoint.defaultInputs, user_id: userId }
        : endpoint.defaultInputs

      const response = await fetch(url, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      })
      const data = await response.json()

      if (response.ok && data.success !== false) {
        setLocalResult('pass')
        setTestOutput(JSON.stringify(data, null, 2).slice(0, 1000))
      } else {
        setLocalResult('fail')
        setTestOutput(JSON.stringify(data, null, 2).slice(0, 1000))
      }
    } catch (err) {
      setLocalResult('fail')
      setTestOutput(err instanceof Error ? err.message : 'Network error')
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
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isRunning}
              className="h-7 px-2"
            >
              {isRunning ? (
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
          <TableCell colSpan={8} className="bg-muted/30 p-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Description:</span>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              </div>
              {endpoint.functionId && (
                <div>
                  <span className="text-sm font-medium">Worker Function ID:</span>
                  <code className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                    #{endpoint.functionId}
                  </code>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">Requires User ID:</span>
                <span className="ml-2 text-sm">{endpoint.requiresUserId ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Default Inputs:</span>
                <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(endpoint.defaultInputs, null, 2)}
                </pre>
              </div>
              {endpoint.testNote && (
                <div>
                  <span className="text-sm font-medium">Notes:</span>
                  <p className="text-sm text-muted-foreground">{endpoint.testNote}</p>
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
                  {generateCurlCommand(endpoint, userId)}
                </pre>
              </div>
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function TestEndpointsPage() {
  const [userId, setUserId] = useState<number>(VERIFIED_TEST_USER.v1_id) // Default to V1 ID for migration endpoints
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<TestEndpointCategory | 'all'>('all')
  const [isRunningAll, setIsRunningAll] = useState(false)

  const stats = getTestStats()

  // Filter endpoints based on search and category
  const filteredEndpoints = TEST_ENDPOINTS.filter((endpoint) => {
    const matchesSearch =
      searchQuery === '' ||
      endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || endpoint.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleTestEndpoint = useCallback(async (endpoint: TestEndpoint) => {
    // Placeholder - actual test happens in EndpointRow
  }, [])

  const handleRunAll = async () => {
    setIsRunningAll(true)
    // In a real implementation, this would run all tests
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRunningAll(false)
  }

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
            <h1 className="text-2xl font-bold">Test Endpoints Inventory</h1>
            <p className="text-sm text-muted-foreground">
              Machine 2.0 Tests API Group (ID: 659) - Workspace 5
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Test Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              {/* User ID Input */}
              <div className="flex items-center gap-2">
                <Label htmlFor="userId" className="text-sm">
                  Test User ID:
                </Label>
                <Input
                  id="userId"
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(parseInt(e.target.value) || VERIFIED_TEST_USER.v1_id)}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground">
                  Verified: {VERIFIED_TEST_USER.name} (V1 ID: {VERIFIED_TEST_USER.v1_id} | V2 ID:{' '}
                  {VERIFIED_TEST_USER.v2_id})
                </span>
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
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as TestEndpointCategory | 'all')
                  }
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label} ({getEndpointsByCategory(key as TestEndpointCategory).length})
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
              <CardTitle className="text-lg">Endpoints ({filteredEndpoints.length})</CardTitle>
              <Badge variant="outline" className="font-mono text-xs">
                {TEST_API_BASE}
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
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEndpoints.map((endpoint) => (
                    <EndpointRow
                      key={endpoint.id}
                      endpoint={endpoint}
                      userId={userId}
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
          <p>Test Endpoints Inventory - Machine 2.0 Tests API Group</p>
          <p className="text-xs mt-1">
            Based on TRIGGER_ENDPOINTS_AUDIT.md - {stats.passing}/{stats.testedCount} tests passing
            ({stats.passRate}%)
          </p>
        </div>
      </div>
    </div>
  )
}
