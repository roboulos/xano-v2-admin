'use client'

import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LoadingState } from '@/components/ui/loading-state'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Shield,
  TrendingDown,
  Code,
  ChevronDown,
  Layers,
  Bug,
  Sparkles,
  RefreshCw,
  Play,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface FailurePattern {
  category: string
  count: number
  rootCause: string
  v2Fix: string
  v2Fixed: boolean
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface DefensivePattern {
  name: string
  description: string
  example: string
  coverage: string
}

interface LiveTest {
  name: string
  endpoint: string
  expectedPattern: string
  success: boolean
  error: string | null
  step: string | null
  hasStructuredResponse: boolean
  defensivePatternWorking: boolean
}

interface ComparisonData {
  aggregateTables: {
    v1: { count: number; tables: string[] }
    v2: { count: number; tables: string[] }
    reduction: string
  }
  failurePatterns: {
    v1TotalFailures: number
    patterns: FailurePattern[]
    v2FixedCount: number
    v2TotalPatterns: number
  }
  defensivePatterns: DefensivePattern[]
  liveTests?: {
    testUserId: number
    tests: LiveTest[]
    totalTests: number
    defensivePatternsWorking: number
    allStructured: boolean
    timestamp: string
  }
  liveStatus: {
    tableCounts: {
      core_tables: Record<string, number>
      network_tables: Record<string, number>
      staging_tables: Record<string, number>
    } | null
    jobStatus: Record<string, unknown> | null
    timestamp: string
  }
  summary: {
    v1Issues: number
    v2IssuesExpected: number
    architectureImprovement: string
    codeQuality: string
    liveTestResult?: string
  }
}

function SeverityBadge({ severity }: { severity: string }) {
  const getStyles = () => {
    switch (severity) {
      case 'critical':
        return {
          backgroundColor: 'var(--status-error-bg)',
          color: 'var(--status-error)',
          borderColor: 'var(--status-error-border)',
        }
      case 'high':
        return {
          backgroundColor: 'var(--status-warning-bg)',
          color: 'var(--status-warning)',
          borderColor: 'var(--status-warning-border)',
        }
      case 'medium':
        return {
          backgroundColor: 'var(--status-warning-bg)',
          color: 'var(--status-warning)',
          borderColor: 'var(--status-warning-border)',
        }
      case 'low':
        return {
          backgroundColor: 'var(--status-info-bg)',
          color: 'var(--status-info)',
          borderColor: 'var(--status-info-border)',
        }
      default:
        return {
          backgroundColor: 'var(--status-pending-bg)',
          color: 'var(--status-pending)',
          borderColor: 'var(--status-pending-border)',
        }
    }
  }
  return (
    <Badge variant="outline" style={getStyles()}>
      {severity}
    </Badge>
  )
}

export function ArchitectureComparisonTab() {
  const [v1TablesOpen, setV1TablesOpen] = useState(false)
  const [v2TablesOpen, setV2TablesOpen] = useState(false)
  const [patternsOpen, setPatternsOpen] = useState(true)

  const { data, error, isLoading, mutate } = useSWR<ComparisonData>(
    '/api/v1-v2-comparison',
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  )

  if (isLoading) return <LoadingState />
  if (error)
    return <div style={{ color: 'var(--status-error)' }}>Error loading comparison data</div>
  if (!data) return null

  const fixedPercentage = Math.round(
    (data.failurePatterns.v2FixedCount / data.failurePatterns.v2TotalPatterns) * 100
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="border"
          style={{
            borderColor: 'var(--status-success-border)',
            backgroundColor: 'var(--status-success-bg)',
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div
                className="p-1.5 rounded"
                style={{ backgroundColor: 'var(--status-success-border)' }}
              >
                <TrendingDown className="h-4 w-4" style={{ color: 'var(--status-success)' }} />
              </div>
              Aggregate Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: 'var(--status-success)' }}>
              {data.aggregateTables.reduction}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.aggregateTables.v1.count} → {data.aggregateTables.v2.count} tables
            </p>
            <div
              className="mt-3 pt-3 border-t"
              style={{ borderColor: 'var(--status-success-border)' }}
            >
              <Progress value={88} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{
            borderColor: 'var(--status-error-border)',
            backgroundColor: 'var(--status-error-bg)',
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div
                className="p-1.5 rounded"
                style={{ backgroundColor: 'var(--status-error-border)' }}
              >
                <Bug className="h-4 w-4" style={{ color: 'var(--status-error)' }} />
              </div>
              V1 Failures Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: 'var(--status-error)' }}>
              {data.failurePatterns.v1TotalFailures}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.failurePatterns.v2TotalPatterns} failure patterns
            </p>
            <div className="mt-3 flex gap-1">
              {data.failurePatterns.patterns.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className="h-1.5 flex-1 rounded"
                  style={{ backgroundColor: 'var(--status-error-border)' }}
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{
            borderColor: 'var(--status-success-border)',
            backgroundColor: 'var(--status-success-bg)',
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div
                className="p-1.5 rounded"
                style={{ backgroundColor: 'var(--status-success-border)' }}
              >
                <Shield className="h-4 w-4" style={{ color: 'var(--status-success)' }} />
              </div>
              V2 Fixes Applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: 'var(--status-success)' }}>
              {fixedPercentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.failurePatterns.v2FixedCount}/{data.failurePatterns.v2TotalPatterns} patterns
              fixed
            </p>
            <div
              className="mt-3 pt-3 border-t"
              style={{ borderColor: 'var(--status-success-border)' }}
            >
              <Progress value={fixedPercentage} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{
            borderColor: 'var(--status-info-border)',
            backgroundColor: 'var(--status-info-bg)',
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div
                className="p-1.5 rounded"
                style={{ backgroundColor: 'var(--status-info-border)' }}
              >
                <Sparkles className="h-4 w-4" style={{ color: 'var(--status-info)' }} />
              </div>
              Defensive Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: 'var(--status-info)' }}>
              {data.defensivePatterns.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">New V2 code patterns</p>
            <div className="mt-3 flex gap-1">
              {data.defensivePatterns.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1.5 flex-1 rounded"
                  style={{ backgroundColor: 'var(--status-info-border)' }}
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aggregate Tables Comparison */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Aggregate Tables Comparison
                </CardTitle>
                <CardDescription>
                  V2 uses {data.aggregateTables.reduction} fewer pre-computed tables
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* V1 Tables */}
            <Collapsible open={v1TablesOpen} onOpenChange={setV1TablesOpen}>
              <CollapsibleTrigger className="w-full">
                <div
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--status-error-bg)',
                    borderColor: 'var(--status-error-border)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" style={{ color: 'var(--status-error)' }} />
                    <span className="font-medium">V1: {data.aggregateTables.v1.count} Tables</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${v1TablesOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                    {data.aggregateTables.v1.tables.map((table) => (
                      <div key={table} className="text-muted-foreground truncate">
                        {table}
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* V2 Tables */}
            <Collapsible open={v2TablesOpen} onOpenChange={setV2TablesOpen}>
              <CollapsibleTrigger className="w-full">
                <div
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--status-success-bg)',
                    borderColor: 'var(--status-success-border)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--status-success)' }} />
                    <span className="font-medium">V2: {data.aggregateTables.v2.count} Tables</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${v2TablesOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-1 text-xs font-mono">
                    {data.aggregateTables.v2.tables.map((table) => (
                      <div key={table} style={{ color: 'var(--status-success)' }}>
                        {table}
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* V1 Failure Patterns & V2 Fixes */}
      <Card className="border" style={{ borderColor: 'var(--status-warning-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--status-warning-bg)' }}>
              <AlertCircle className="h-5 w-5" style={{ color: 'var(--status-warning)' }} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                V1 Failure Patterns → V2 Fixes
              </CardTitle>
              <CardDescription>
                All {data.failurePatterns.v1TotalFailures} V1 onboarding failures are handled in V2
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Collapsible open={patternsOpen} onOpenChange={setPatternsOpen}>
            <CollapsibleTrigger className="w-full mb-4">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">
                  {patternsOpen ? 'Hide' : 'Show'} All Patterns
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${patternsOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3">
                {data.failurePatterns.patterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex-shrink-0">
                      {pattern.v2Fixed ? (
                        <CheckCircle2
                          className="h-5 w-5"
                          style={{ color: 'var(--status-success)' }}
                        />
                      ) : (
                        <AlertCircle className="h-5 w-5" style={{ color: 'var(--status-error)' }} />
                      )}
                    </div>
                    <div className="flex-grow space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pattern.category}</span>
                        <SeverityBadge severity={pattern.severity} />
                        <Badge variant="outline" className="text-xs">
                          {pattern.count} occurrences
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Root Cause:</strong> {pattern.rootCause}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--status-success)' }}>
                        <strong>V2 Fix:</strong> {pattern.v2Fix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* V2 Defensive Patterns */}
      <Card className="border" style={{ borderColor: 'var(--status-info-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--status-info-bg)' }}>
              <Code className="h-5 w-5" style={{ color: 'var(--status-info)' }} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                V2 Defensive Coding Patterns
              </CardTitle>
              <CardDescription>
                New patterns in V2 that prevent the V1 failures from occurring
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.defensivePatterns.map((pattern, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border space-y-2"
                style={{
                  backgroundColor: 'var(--status-info-bg)',
                  borderColor: 'var(--status-info-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: 'var(--status-info)' }}>
                    {pattern.name}
                  </span>
                  <Badge
                    variant="outline"
                    style={{
                      color: 'var(--status-success)',
                      borderColor: 'var(--status-success-border)',
                      backgroundColor: 'var(--status-success-bg)',
                    }}
                  >
                    {pattern.coverage}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{pattern.description}</p>
                <pre
                  className="text-xs bg-black/80 p-3 rounded-md overflow-x-auto border font-mono"
                  style={{
                    color: 'var(--status-success)',
                    borderColor: 'var(--status-success-border)',
                  }}
                >
                  {pattern.example}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live V2 Worker Tests */}
      {data.liveTests && (
        <Card className="border" style={{ borderColor: 'var(--status-info-border)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" style={{ color: 'var(--status-info)' }} />
              Live V2 Worker Tests
            </CardTitle>
            <CardDescription>
              Real-time tests against V2 onboarding endpoints (User ID: {data.liveTests.testUserId})
              {' - '}
              {data.liveTests.defensivePatternsWorking}/{data.liveTests.totalTests} return
              structured responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.liveTests.tests.map((test, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{
                    backgroundColor: test.defensivePatternWorking
                      ? 'var(--status-success-bg)'
                      : 'var(--status-error-bg)',
                    borderColor: test.defensivePatternWorking
                      ? 'var(--status-success-border)'
                      : 'var(--status-error-border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {test.defensivePatternWorking ? (
                      <CheckCircle2
                        className="h-5 w-5"
                        style={{ color: 'var(--status-success)' }}
                      />
                    ) : (
                      <XCircle className="h-5 w-5" style={{ color: 'var(--status-error)' }} />
                    )}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{test.endpoint}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.step && (
                      <Badge variant="outline" className="text-xs">
                        {test.step}
                      </Badge>
                    )}
                    {test.success ? (
                      <Badge style={{ backgroundColor: 'var(--status-success)' }}>Success</Badge>
                    ) : test.error ? (
                      <Badge
                        variant="outline"
                        className="text-xs max-w-48 truncate"
                        style={{
                          color: 'var(--status-warning)',
                          borderColor: 'var(--status-warning-border)',
                        }}
                      >
                        {test.error}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No data</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mt-4 p-3 rounded-lg"
              style={{ backgroundColor: 'var(--status-info-bg)' }}
            >
              <p className="text-sm" style={{ color: 'var(--status-info)' }}>
                <strong>Key Insight:</strong> Even when endpoints return &quot;failure&quot; (e.g.,
                missing API key), they return structured responses with clear error messages. This
                is V2&apos;s defensive pattern in action - V1 would crash with &quot;Unable to
                locate var&quot; errors instead.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live V2 Status */}
      {data.liveStatus.tableCounts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Live V2 Table Counts
            </CardTitle>
            <CardDescription>
              Current record counts from V2 workspace (Updated:{' '}
              {new Date(data.liveStatus.timestamp).toLocaleTimeString()})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Core Tables */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--status-info-bg)',
                  borderColor: 'var(--status-info-border)',
                }}
              >
                <h4 className="font-medium mb-2" style={{ color: 'var(--status-info)' }}>
                  Core Tables
                </h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(data.liveStatus.tableCounts.core_tables || {}).map(
                    ([table, count]) => (
                      <div key={table} className="flex justify-between">
                        <span className="text-muted-foreground">{table}</span>
                        <span className="font-mono">{count.toLocaleString()}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Network Tables */}
              <div className="p-3 bg-muted/50 rounded-lg border">
                <h4 className="font-medium mb-2 text-primary">Network Tables</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(data.liveStatus.tableCounts.network_tables || {}).map(
                    ([table, count]) => (
                      <div key={table} className="flex justify-between">
                        <span className="text-muted-foreground">{table}</span>
                        <span className="font-mono">{count.toLocaleString()}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Staging Tables */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--status-warning-bg)',
                  borderColor: 'var(--status-warning-border)',
                }}
              >
                <h4 className="font-medium mb-2" style={{ color: 'var(--status-warning)' }}>
                  Staging Tables
                </h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(data.liveStatus.tableCounts.staging_tables || {}).map(
                    ([table, count]) => (
                      <div key={table} className="flex justify-between">
                        <span className="text-muted-foreground">{table}</span>
                        <span className="font-mono">{count.toLocaleString()}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Architecture Summary */}
      <Card
        className="border"
        style={{
          borderColor: 'var(--status-success-border)',
          backgroundColor: 'var(--status-success-bg)',
        }}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--status-success-border)' }}
            >
              <Sparkles className="h-5 w-5" style={{ color: 'var(--status-success)' }} />
            </div>
            <CardTitle style={{ color: 'var(--status-success)' }}>V2 Architecture Wins</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className="text-center p-5 bg-white/50 dark:bg-black/20 rounded-lg border"
              style={{ borderColor: 'var(--status-success-border)' }}
            >
              <TrendingDown
                className="h-6 w-6 mx-auto mb-2"
                style={{ color: 'var(--status-success)' }}
              />
              <div className="text-4xl font-bold mb-1" style={{ color: 'var(--status-success)' }}>
                88%
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Fewer aggregate tables
              </div>
            </div>
            <div
              className="text-center p-5 bg-white/50 dark:bg-black/20 rounded-lg border"
              style={{ borderColor: 'var(--status-success-border)' }}
            >
              <CheckCircle2
                className="h-6 w-6 mx-auto mb-2"
                style={{ color: 'var(--status-success)' }}
              />
              <div className="text-4xl font-bold mb-1" style={{ color: 'var(--status-success)' }}>
                100%
              </div>
              <div className="text-sm font-medium text-muted-foreground">V1 failures fixed</div>
            </div>
            <div
              className="text-center p-5 bg-white/50 dark:bg-black/20 rounded-lg border"
              style={{ borderColor: 'var(--status-success-border)' }}
            >
              <Shield className="h-6 w-6 mx-auto mb-2" style={{ color: 'var(--status-success)' }} />
              <div className="text-4xl font-bold mb-1" style={{ color: 'var(--status-success)' }}>
                5
              </div>
              <div className="text-sm font-medium text-muted-foreground">Defensive patterns</div>
            </div>
            <div
              className="text-center p-5 bg-white/50 dark:bg-black/20 rounded-lg border"
              style={{ borderColor: 'var(--status-success-border)' }}
            >
              <Database
                className="h-6 w-6 mx-auto mb-2"
                style={{ color: 'var(--status-success)' }}
              />
              <div className="text-4xl font-bold mb-1" style={{ color: 'var(--status-success)' }}>
                16
              </div>
              <div className="text-sm font-medium text-muted-foreground">Staging tables</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
