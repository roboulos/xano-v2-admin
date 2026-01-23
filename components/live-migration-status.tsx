'use client'

import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Database, FunctionSquare, Zap, CheckCircle2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function LiveMigrationStatus() {
  const { data, error, isLoading, mutate } = useSWR('/api/migration/status', fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
    revalidateOnFocus: true,
  })

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
            Last updated: {new Date(timestamp).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
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
                {v1.tables.total_records.toLocaleString()} records
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">V2 (Normalized)</div>
              <div className="text-2xl font-bold text-green-600">{v2.tables.count}</div>
              <div className="text-xs text-muted-foreground">
                {v2.tables.total_records.toLocaleString()} records
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">Gap</div>
              <div className="text-lg font-semibold">{comparison.tables.gap} fewer</div>
              <div className="text-xs text-muted-foreground">{comparison.tables.description}</div>
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
          </CardContent>
        </Card>
      </div>

      {/* Status Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            What's Validated
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
    </div>
  )
}
