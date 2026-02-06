'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
  GitCompare,
  Copy,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { AlertBanner } from '@/components/ui/alert-banner'
import { MetricCard } from '@/components/ui/metric-card'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface EndpointInfo {
  id: string
  name: string
  description: string
  method: string
  requires_user_id: boolean
  requires_team_id: boolean
}

interface ComparisonResult {
  success: boolean
  endpoint: {
    id: string
    name: string
    description: string
  }
  v1: {
    url: string
    status: number
    duration_ms: number
    data: unknown
    error?: string
    record_count?: number
  }
  v2: {
    url: string
    status: number
    duration_ms: number
    data: unknown
    error?: string
    record_count?: number
  }
  comparison: {
    structures_match: boolean
    record_count_match: boolean
    v1_fields: string[]
    v2_fields: string[]
    differences: string[]
    similarity_score: number
  }
  timestamp: string
}

// Test user (verified with extensive data)
const TEST_USER_ID = 7
const TEST_TEAM_ID = 1

export function ParallelComparisonTab() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [results, setResults] = useState<Map<string, ComparisonResult>>(new Map())
  const [loading, setLoading] = useState<Set<string>>(new Set())
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())
  const [showRawData, setShowRawData] = useState<Map<string, 'v1' | 'v2' | null>>(new Map())

  // Fetch available endpoints
  const { data: endpointsData, error: endpointsError } = useSWR<{
    success: boolean
    endpoints: EndpointInfo[]
    test_user: { id: number; name: string }
    test_team: { id: number }
  }>('/api/parallel-compare', fetcher)

  const runComparison = async (endpointId: string) => {
    setLoading((prev) => new Set(prev).add(endpointId))

    try {
      const endpoint = endpointsData?.endpoints.find((e) => e.id === endpointId)
      const body: Record<string, unknown> = { endpoint_id: endpointId }

      if (endpoint?.requires_user_id) {
        body.user_id = TEST_USER_ID
      }
      if (endpoint?.requires_team_id) {
        body.team_id = TEST_TEAM_ID
      }

      const response = await fetch('/api/parallel-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result: ComparisonResult = await response.json()

      setResults((prev) => {
        const next = new Map(prev)
        next.set(endpointId, result)
        return next
      })

      // Auto-expand results
      setExpandedResults((prev) => new Set(prev).add(endpointId))
    } catch (error) {
      console.error('Comparison failed:', error)
    } finally {
      setLoading((prev) => {
        const next = new Set(prev)
        next.delete(endpointId)
        return next
      })
    }
  }

  const runAllComparisons = async () => {
    if (!endpointsData?.endpoints) return

    for (const endpoint of endpointsData.endpoints) {
      await runComparison(endpoint.id)
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedResults((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const copyToClipboard = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }

  if (endpointsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Endpoints</CardTitle>
          <CardDescription>{endpointsError.message}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!endpointsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Parallel Comparison...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const endpoints = endpointsData.endpoints
  const completedCount = results.size
  const matchCount = Array.from(results.values()).filter(
    (r) => r.comparison.structures_match && r.comparison.record_count_match
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitCompare className="h-6 w-6" />
            V1/V2 Parallel Comparison
          </h2>
          <p className="text-sm text-muted-foreground">
            Run the same API calls against both workspaces and compare responses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllComparisons}
            disabled={loading.size > 0}
            className="flex items-center gap-2"
          >
            {loading.size > 0 ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run All ({endpoints.length})
          </Button>
        </div>
      </div>

      {/* Alert Banner for Significant Mismatches */}
      {completedCount > 0 && completedCount - matchCount > 0 && (
        <AlertBanner
          variant={completedCount - matchCount > 3 ? 'critical' : 'warning'}
          title={`${completedCount - matchCount} Endpoint${completedCount - matchCount > 1 ? 's' : ''} with Differences`}
          description="Review the mismatched endpoints below to ensure V2 returns equivalent data to V1."
          icon={AlertTriangle}
        />
      )}

      {/* Summary Stats using MetricCard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Comparable Endpoints"
          value={endpoints.length}
          icon={<GitCompare className="h-5 w-5" />}
        />
        <MetricCard
          title="Tested"
          value={completedCount}
          subtitle={`${completedCount > 0 ? Math.round((completedCount / endpoints.length) * 100) : 0}% coverage`}
        />
        <MetricCard
          title="Full Match"
          value={matchCount}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          highlight={matchCount > 0}
        />
        <MetricCard
          title="Differences"
          value={completedCount - matchCount}
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          className={completedCount - matchCount > 0 ? 'border-amber-200 bg-amber-50' : ''}
        />
      </div>

      {/* Test User Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Test Context:</span>
            <Badge variant="secondary">User ID: {TEST_USER_ID}</Badge>
            <Badge variant="secondary">Team ID: {TEST_TEAM_ID}</Badge>
            <span className="text-muted-foreground">(David Keener - verified test user)</span>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints List */}
      <div className="space-y-4">
        {endpoints.map((endpoint) => {
          const result = results.get(endpoint.id)
          const isLoading = loading.has(endpoint.id)
          const isExpanded = expandedResults.has(endpoint.id)
          const rawDataView = showRawData.get(endpoint.id)

          return (
            <Card key={endpoint.id} className="overflow-hidden">
              {/* Endpoint Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => result && toggleExpanded(endpoint.id)}
              >
                <div className="flex items-center gap-3">
                  {result ? (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  ) : (
                    <div className="w-4" />
                  )}
                  <Badge variant="outline" className="font-mono">
                    {endpoint.method}
                  </Badge>
                  <div>
                    <span className="font-medium">{endpoint.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {endpoint.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status badges */}
                  {result && (
                    <>
                      {result.comparison.structures_match &&
                      result.comparison.record_count_match ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Match
                        </Badge>
                      ) : result.comparison.similarity_score >= 80 ? (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {result.comparison.similarity_score}% Similar
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          {result.comparison.differences.length} Differences
                        </Badge>
                      )}

                      {/* Record counts */}
                      <Badge variant="outline" className="text-xs">
                        V1: {result.v1.record_count} | V2: {result.v2.record_count}
                      </Badge>

                      {/* Timing */}
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {result.v1.duration_ms}ms / {result.v2.duration_ms}ms
                      </Badge>
                    </>
                  )}

                  {/* Run button */}
                  <Button
                    size="sm"
                    variant={result ? 'outline' : 'default'}
                    onClick={(e) => {
                      e.stopPropagation()
                      runComparison(endpoint.id)
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : result ? (
                      <RefreshCw className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Result Details */}
              {result && isExpanded && (
                <div className="border-t bg-muted/20">
                  {/* Side-by-side comparison */}
                  <div className="grid grid-cols-2 divide-x">
                    {/* V1 Column */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-600">V1 (Production)</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={result.v1.status === 200 ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {result.v1.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setShowRawData((prev) => {
                                const next = new Map(prev)
                                next.set(endpoint.id, rawDataView === 'v1' ? null : 'v1')
                                return next
                              })
                            }
                          >
                            <Database className="h-3 w-3 mr-1" />
                            {rawDataView === 'v1' ? 'Hide' : 'Raw'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(result.v1.data)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 font-mono truncate">
                        {result.v1.url}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          <Database className="h-4 w-4 inline mr-1" />
                          {result.v1.record_count} records
                        </span>
                        <span>
                          <Clock className="h-4 w-4 inline mr-1" />
                          {result.v1.duration_ms}ms
                        </span>
                      </div>
                      {result.v1.error && (
                        <p className="text-sm text-red-500 mt-2">{result.v1.error}</p>
                      )}
                      {rawDataView === 'v1' && (
                        <pre className="mt-3 p-3 bg-muted rounded-md text-xs overflow-auto max-h-64">
                          {JSON.stringify(result.v1.data, null, 2)}
                        </pre>
                      )}
                    </div>

                    {/* V2 Column */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-600">V2 (Normalized)</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={result.v2.status === 200 ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {result.v2.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setShowRawData((prev) => {
                                const next = new Map(prev)
                                next.set(endpoint.id, rawDataView === 'v2' ? null : 'v2')
                                return next
                              })
                            }
                          >
                            <Database className="h-3 w-3 mr-1" />
                            {rawDataView === 'v2' ? 'Hide' : 'Raw'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(result.v2.data)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 font-mono truncate">
                        {result.v2.url}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          <Database className="h-4 w-4 inline mr-1" />
                          {result.v2.record_count} records
                        </span>
                        <span>
                          <Clock className="h-4 w-4 inline mr-1" />
                          {result.v2.duration_ms}ms
                        </span>
                      </div>
                      {result.v2.error && (
                        <p className="text-sm text-red-500 mt-2">{result.v2.error}</p>
                      )}
                      {rawDataView === 'v2' && (
                        <pre className="mt-3 p-3 bg-muted rounded-md text-xs overflow-auto max-h-64">
                          {JSON.stringify(result.v2.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>

                  {/* Differences Section */}
                  {result.comparison.differences.length > 0 && (
                    <div className="border-t p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Structure Differences ({result.comparison.differences.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-blue-600 mb-2">V1 Only Fields</p>
                          <ul className="text-sm space-y-1">
                            {result.comparison.differences
                              .filter((d) => d.startsWith('V1 only:'))
                              .map((d, i) => (
                                <li
                                  key={i}
                                  className="font-mono text-xs bg-blue-50 px-2 py-1 rounded"
                                >
                                  {d.replace('V1 only: ', '')}
                                </li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-2">V2 Only Fields</p>
                          <ul className="text-sm space-y-1">
                            {result.comparison.differences
                              .filter((d) => d.startsWith('V2 only:'))
                              .map((d, i) => (
                                <li
                                  key={i}
                                  className="font-mono text-xs bg-green-50 px-2 py-1 rounded"
                                >
                                  {d.replace('V2 only: ', '')}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
