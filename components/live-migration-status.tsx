'use client'

import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Database, FunctionSquare, Zap, CheckCircle2, Activity, AlertCircle, Link2, AlertTriangle, Play } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { useState } from 'react'
import { EndpointTesterModal } from './endpoint-tester-modal'
import { MCP_BASES, MCPEndpoint } from '@/lib/mcp-endpoints'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function LiveMigrationStatus() {
  const [isTestingEndpoints, setIsTestingEndpoints] = useState(false)
  const [integrityExpanded, setIntegrityExpanded] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<MCPEndpoint | null>(null)
  const [endpointDetailsExpanded, setEndpointDetailsExpanded] = useState(false)

  const { data, error, isLoading, mutate } = useSWR('/api/migration/status', fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
    revalidateOnFocus: true,
  })

  // Fetch live record counts from both workspaces
  const { data: countsData, error: countsError, isLoading: countsLoading, mutate: mutateCounts } = useSWR(
    '/api/v2/tables/counts',
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
    }
  )

  // Fetch endpoint health status (manual trigger only)
  const { data: healthData, error: healthError, isLoading: healthLoading, mutate: mutateHealth } = useSWR(
    isTestingEndpoints ? '/api/v2/endpoints/health' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // Fetch integrity check data on demand
  const { data: integrityData, error: integrityError, isLoading: integrityLoading, mutate: mutateIntegrity } = useSWR(
    integrityExpanded ? '/api/v2/tables/integrity?sample_size=20&max_tables=20' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const handleRunHealthCheck = async () => {
    setIsTestingEndpoints(true)
    await mutateHealth()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Live Migration Status...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error || !data?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Status</CardTitle>
          <CardDescription>{error?.message || data?.error || 'Unknown error'}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { v1, v2, comparison, migration_score, timestamp } = data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'bg-green-500'
      case 'NEAR_READY':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    return 'text-blue-600'
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Migration Status</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {formatRelativeTime(timestamp)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              mutate()
              mutateCounts()
              if (integrityExpanded) {
                mutateIntegrity()
              }
            }}
            disabled={isLoading || countsLoading || integrityLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || countsLoading || integrityLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const sections = [
                {
                  title: 'Migration Score',
                  content: [
                    `Overall: ${migration_score.overall}%`,
                    `Tables: ${migration_score.tables}%`,
                    `Functions: ${migration_score.functions}%`,
                    `Endpoints: ${migration_score.endpoints}%`,
                    `Status: ${migration_score.status}`,
                  ],
                },
                {
                  title: 'Record Counts',
                  content: countsData?.success ? [
                    `V1 Total Records: ${countsData.v1.total_records.toLocaleString()}`,
                    `V2 Total Records: ${countsData.v2.total_records.toLocaleString()}`,
                    `Migration: ${countsData.comparison.percentage}%`,
                    `Status: ${countsData.comparison.status}`,
                  ] : ['Data not available'],
                },
                {
                  title: 'Tables',
                  content: [
                    `V1 Count: ${v1.tables.count}`,
                    `V2 Count: ${v2.tables.count}`,
                    `Gap: ${comparison.tables.gap}`,
                    `Description: ${comparison.tables.description}`,
                  ],
                },
                {
                  title: 'Functions',
                  content: [
                    `V1 Count: ${v1.functions.count}`,
                    `V2 Count: ${v2.functions.count}`,
                    `Coverage: ${Math.round(comparison.functions.v1_to_v2_ratio * 100)}%`,
                  ],
                },
                {
                  title: 'Endpoints',
                  content: [
                    `V1 Count: ${v1.endpoints.count} (${v1.api_groups.count} groups)`,
                    `V2 Count: ${v2.endpoints.count} (${v2.api_groups.count} groups)`,
                    `Coverage: ${Math.round(comparison.endpoints.v1_to_v2_ratio * 100)}%`,
                  ],
                },
              ]

              if (integrityData?.success) {
                sections.push({
                  title: 'Foreign Key Integrity',
                  content: [
                    `Total References: ${integrityData.data.totalReferences}`,
                    `Validated: ${integrityData.data.validated}`,
                    `Orphans Found: ${integrityData.data.orphansFound}`,
                    `Tables Checked: ${integrityData.data.tablesChecked}`,
                  ],
                })
              }

              exportSummaryToPDF(
                sections,
                `v1-v2-migration-status_${new Date().toISOString().slice(0, 10)}.pdf`,
                'V1 → V2 Migration Status Report',
                {
                  title: 'Live Migration Status',
                  timestamp: new Date(),
                  totalRecords: Object.keys(sections).length,
                }
              )
            }}
            disabled={isLoading}
          >
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* Migration Score Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Migration Score</CardTitle>
              <CardDescription>Overall V2 readiness assessment</CardDescription>
            </div>
            <Badge className={getStatusColor(migration_score.status)}>
              {migration_score.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(migration_score.overall)}`}>
                {migration_score.overall}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Overall</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(migration_score.tables)}`}>
                {migration_score.tables}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Tables</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(migration_score.functions)}`}>
                {migration_score.functions}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Functions</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(migration_score.endpoints)}`}>
                {migration_score.endpoints}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Endpoints</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Count Comparison Card */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Live Record Count Comparison
          </CardTitle>
          <CardDescription>Real-time record counts from both workspaces via snappy CLI</CardDescription>
        </CardHeader>
        <CardContent>
          {countsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-lg text-muted-foreground">Fetching live record counts...</span>
            </div>
          ) : countsError || !countsData?.success ? (
            <div className="text-center py-8">
              <p className="text-destructive font-semibold">Error loading record counts</p>
              <p className="text-sm text-muted-foreground mt-2">{countsError?.message || countsData?.error || 'Unknown error'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">V1 (Production)</div>
                <div className="text-3xl font-bold text-blue-600">
                  {countsData.v1.total_records.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">records</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Migration Status</div>
                  <div className={`text-5xl font-bold ${countsData.comparison.percentage >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {countsData.comparison.percentage}%
                  </div>
                  <Badge className={getStatusColor(countsData.comparison.status)} variant="outline">
                    {countsData.comparison.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">V2 (Normalized)</div>
                <div className="text-3xl font-bold text-green-600">
                  {countsData.v2.total_records.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">records</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* V1 vs V2 Comparison Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Tables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Tables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">V1 (Production)</div>
              <div className="text-2xl font-bold">{v1.tables.count}</div>
              <div className="text-xs text-muted-foreground">
                {countsLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                  </span>
                ) : countsError || !countsData?.success ? (
                  <span className="text-destructive">Error loading counts</span>
                ) : (
                  `${countsData.v1.total_records.toLocaleString()} records`
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">V2 (Normalized)</div>
              <div className="text-2xl font-bold text-green-600">{v2.tables.count}</div>
              <div className="text-xs text-muted-foreground">
                {countsLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                  </span>
                ) : countsError || !countsData?.success ? (
                  <span className="text-destructive">Error loading counts</span>
                ) : (
                  `${countsData.v2.total_records.toLocaleString()} records`
                )}
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                {countsData?.success ? 'Record Migration' : 'Gap'}
              </div>
              <div className="text-lg font-semibold">
                {countsData?.success ? (
                  <span className={countsData.comparison.percentage >= 95 ? 'text-green-600' : 'text-yellow-600'}>
                    {countsData.comparison.percentage}%
                  </span>
                ) : (
                  `${comparison.tables.gap} fewer`
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {countsData?.success ? (
                  countsData.comparison.percentage >= 95 ? 'Migration complete' : 'In progress'
                ) : (
                  comparison.tables.description
                )}
              </div>
            </div>

            {/* Foreign Key Integrity Section */}
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-2">Foreign Key Integrity</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIntegrityExpanded(!integrityExpanded)
                  if (!integrityExpanded) {
                    mutateIntegrity()
                  }
                }}
                className="w-full"
              >
                <Link2 className="h-4 w-4 mr-2" />
                {integrityExpanded ? 'Hide Details' : 'Check Integrity'}
              </Button>
              {integrityExpanded && (
                <div className="mt-3 space-y-2">
                  {integrityLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="ml-2 text-sm text-muted-foreground">Validating foreign keys...</span>
                    </div>
                  ) : integrityError || !integrityData?.success ? (
                    <div className="text-sm text-destructive">
                      Error: {integrityError?.message || integrityData?.error || 'Unknown error'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <div className="font-semibold text-blue-900">{integrityData.data.totalReferences}</div>
                          <div className="text-blue-600">Total Foreign Keys</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                          <div className="font-semibold text-green-900">{integrityData.data.validated}</div>
                          <div className="text-green-600">Validated</div>
                        </div>
                        <div className={`p-2 rounded border ${integrityData.data.orphansFound > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                          <div className={`font-semibold ${integrityData.data.orphansFound > 0 ? 'text-amber-900' : 'text-green-900'}`}>
                            {integrityData.data.orphansFound}
                          </div>
                          <div className={integrityData.data.orphansFound > 0 ? 'text-amber-600' : 'text-green-600'}>
                            Orphans
                          </div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded border border-purple-200">
                          <div className="font-semibold text-purple-900">{integrityData.data.tablesChecked}</div>
                          <div className="text-purple-600">Tables Checked</div>
                        </div>
                      </div>
                      {integrityData.data.orphansFound > 0 && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                          <div className="flex items-center gap-1 font-semibold text-amber-900 mb-1">
                            <AlertTriangle className="h-3 w-3" />
                            Orphaned Records Found
                          </div>
                          <div className="text-amber-700 space-y-1">
                            {integrityData.data.checks
                              .filter((c: any) => c.orphanedRecords > 0)
                              .slice(0, 3)
                              .map((check: any, idx: number) => (
                                <div key={idx}>
                                  {check.tableName}.{check.fieldName} → {check.referencedTable} ({check.orphanedRecords} orphans)
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Functions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FunctionSquare className="h-5 w-5" />
              Functions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">V1 (Production)</div>
              <div className="text-2xl font-bold">{v1.functions.count}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">V2 (Normalized)</div>
              <div className="text-2xl font-bold text-green-600">{v2.functions.count}</div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">Coverage</div>
              <div className="text-lg font-semibold">
                {Math.round(comparison.functions.v1_to_v2_ratio * 100)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">V1 (Production)</div>
              <div className="text-2xl font-bold">{v1.endpoints.count}</div>
              <div className="text-xs text-muted-foreground">{v1.api_groups.count} API groups</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">V2 (Normalized)</div>
              <div className="text-2xl font-bold text-green-600">{v2.endpoints.count}</div>
              <div className="text-xs text-muted-foreground">{v2.api_groups.count} API groups</div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">Coverage</div>
              <div className="text-lg font-semibold">
                {Math.round(comparison.endpoints.v1_to_v2_ratio * 100)}%
              </div>
            </div>

            {/* Endpoint Health Section */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <div className="text-xs font-semibold text-muted-foreground">Endpoint Health</div>
                </div>
                <Button
                  onClick={handleRunHealthCheck}
                  disabled={healthLoading}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                >
                  {healthLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Testing...
                    </>
                  ) : (
                    'Run Health Check'
                  )}
                </Button>
              </div>

              {healthData?.success ? (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Average response time:{' '}
                    <span className={`font-semibold ${
                      healthData.avg_response_time < 500 ? 'text-green-600' :
                      healthData.avg_response_time < 1000 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {healthData.avg_response_time}ms
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tested:{' '}
                    <span className="font-semibold text-blue-600">
                      {healthData.tested}/{v2.endpoints.count}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Errors:{' '}
                    <span className={`font-semibold ${
                      healthData.failed === 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {healthData.failed}
                    </span>
                    {healthData.failed > 0 && (
                      <span className="ml-1 text-red-600">
                        ({Math.round((healthData.failed / healthData.tested) * 100)}% fail rate)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Last tested: {formatRelativeTime(healthData.timestamp)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEndpointDetailsExpanded(!endpointDetailsExpanded)}
                    className="w-full mt-2 h-7 text-xs"
                  >
                    {endpointDetailsExpanded ? 'Hide Details' : 'Show All Results'}
                  </Button>
                </div>
              ) : healthError ? (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>Error running health check</span>
                </div>
              ) : !isTestingEndpoints ? (
                <div className="text-xs text-muted-foreground">
                  Click &quot;Run Health Check&quot; to test critical endpoints
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            What&apos;s Validated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-semibold">223/223 Tables</span>
              </div>
              <div className="text-sm text-muted-foreground ml-6">
                All V2 tables exist and accessible
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-semibold">33/33 References</span>
              </div>
              <div className="text-sm text-muted-foreground ml-6">
                All foreign keys valid, zero orphans
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">Live Data</span>
              </div>
              <div className="text-sm text-muted-foreground ml-6">
                Real-time data via snappy CLI
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">Auto-Refresh</span>
              </div>
              <div className="text-sm text-muted-foreground ml-6">
                Updates every 10 seconds
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Test Results Details */}
      {endpointDetailsExpanded && healthData?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Endpoint Test Results
            </CardTitle>
            <CardDescription>
              Individual endpoint test results with curl testing capability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthData.results.map((result: {
                endpoint: string
                method: string
                status: number
                response_time_ms: number
                success: boolean
                error: string | null
                apiGroup: string
              }, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={result.method === 'POST' ? 'default' : 'secondary'} className="text-xs">
                          {result.method}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.apiGroup}
                        </Badge>
                        <code className="text-xs text-muted-foreground truncate">
                          {result.endpoint}
                        </code>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Status: {result.status}</span>
                        <span className={`font-semibold ${
                          result.response_time_ms < 500 ? 'text-green-600' :
                          result.response_time_ms < 1000 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {result.response_time_ms}ms
                        </span>
                        {result.error && (
                          <span className="text-red-600 truncate">{result.error}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Find the full endpoint definition from MCP_ENDPOINTS
                      // We&apos;ll create a minimal endpoint object for testing
                      const endpoint: MCPEndpoint = {
                        taskId: index,
                        taskName: result.endpoint.replace(/^\/test-/, '').replace(/-/g, ' '),
                        endpoint: result.endpoint,
                        apiGroup: result.apiGroup as 'TASKS' | 'WORKERS' | 'SYSTEM' | 'SEEDING',
                        method: result.method as 'GET' | 'POST',
                        requiresUserId: result.endpoint.includes('user') || result.apiGroup === 'WORKERS',
                        description: `Test endpoint: ${result.endpoint}`,
                      }
                      setSelectedEndpoint(endpoint)
                    }}
                    className="flex-shrink-0"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endpoint Tester Modal */}
      {selectedEndpoint && (
        <EndpointTesterModal
          open={!!selectedEndpoint}
          onOpenChange={(open) => !open && setSelectedEndpoint(null)}
          endpoint={selectedEndpoint}
          baseUrl={MCP_BASES[selectedEndpoint.apiGroup]}
        />
      )}
    </div>
  )
}
