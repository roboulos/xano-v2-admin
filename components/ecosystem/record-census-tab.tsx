'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Database,
  Loader2,
  RefreshCw,
  ServerCrash,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SyncEntity {
  entity: string
  v1: number
  v2: number
}

interface CategoryData {
  tables: number
  records: number
  breakdown: Record<string, number>
}

interface RecordCountsResponse {
  // V1
  grand_total: number
  tables_counted: number
  total_v1_tables: number
  categories: {
    core: CategoryData
    fub: CategoryData
    logs: CategoryData
    lambda: CategoryData
  } | null
  raw_counts: Record<string, number> | null
  uncounted_tables: number
  note: string
  // V2
  v2_grand_total: number
  v2_tables_counted: number
  total_v2_tables: number
  v2_raw_counts: Record<string, number> | null
  // Sync
  sync_entities: SyncEntity[]
  sync_total_v1: number
  sync_total_v2: number
  timestamp: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n)

const CATEGORY_META: Record<string, { label: string; color: string; migrationClass: string }> = {
  core: {
    label: 'Core Business',
    color: 'bg-blue-500',
    migrationClass: 'Needs Migration',
  },
  fub: {
    label: 'Follow Up Boss (FUB)',
    color: 'bg-emerald-500',
    migrationClass: 'Integration Data',
  },
  logs: {
    label: 'Logs & Audit',
    color: 'bg-amber-500',
    migrationClass: 'Operational',
  },
  lambda: {
    label: 'Lambda Jobs',
    color: 'bg-purple-500',
    migrationClass: 'Operational',
  },
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CategoryCard({
  catKey,
  data,
  grandTotal,
}: {
  catKey: string
  data: CategoryData
  grandTotal: number
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = CATEGORY_META[catKey]
  const pct = grandTotal > 0 ? ((data.records / grandTotal) * 100).toFixed(1) : '0'

  // Sort breakdown by count descending
  const sorted = Object.entries(data.breakdown).sort(([, a], [, b]) => b - a)

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${meta.color}`} />
            <CardTitle className="text-sm">{meta.label}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {data.tables} tables
            </Badge>
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold tabular-nums">{fmt(data.records)}</span>
          <span className="text-xs text-muted-foreground">{pct}% of total</span>
        </div>

        {/* Proportional bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${meta.color}`}
            style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
          />
        </div>

        {/* Migration class badge */}
        <Badge variant="outline" className="text-[10px]">
          {meta.migrationClass}
        </Badge>

        {/* Expanded breakdown */}
        {expanded && (
          <div className="mt-2 space-y-1 border-t pt-2">
            {sorted.map(([table, count]) => (
              <div key={table} className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">{table}</span>
                <span className="tabular-nums">{fmt(count)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function RecordCensusTab() {
  const [data, setData] = useState<RecordCountsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/record-counts')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: RecordCountsResponse = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Record Census</h2>
            <p className="text-sm text-muted-foreground">
              V1 production vs V2 normalized — the full picture
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <ServerCrash className="h-5 w-5" />
              <span>API error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* V1 vs V2 Hero */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Skeleton className="h-12 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Skeleton className="h-12 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </CardContent>
          </Card>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-6 text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                V1 Production
              </p>
              <p className="text-4xl font-bold tabular-nums">{fmt(data.grand_total)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                across {data.tables_counted} of {data.total_v1_tables} tables
              </p>
              {data.uncounted_tables > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{data.note}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-500/20 bg-purple-500/5">
            <CardContent className="pt-6 text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                V2 Normalized
              </p>
              <p className="text-4xl font-bold tabular-nums">
                {data.v2_grand_total > 0 ? fmt(data.v2_grand_total) : fmt(data.sync_total_v2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {data.v2_grand_total > 0
                  ? `across ${data.v2_tables_counted} of ${data.total_v2_tables} tables`
                  : `${data.sync_entities.length} synced entities (table counts unavailable)`}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Category Breakdown */}
      {!isLoading && data?.categories && (
        <div>
          <h3 className="text-sm font-medium mb-3">Record Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.categories).map(([key, catData]) => (
              <CategoryCard key={key} catKey={key} data={catData} grandTotal={data.grand_total} />
            ))}
          </div>
        </div>
      )}

      {/* Migration Scope Analysis */}
      {!isLoading && data?.categories && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Migration Scope Analysis</CardTitle>
            <CardDescription className="text-xs">
              Not all 25.4M records need V2 migration — logs and jobs are operational
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  label: 'Needs Migration',
                  records: data.categories.core.records,
                  desc: 'Core business data (agents, users, transactions, listings, participants, network, contributions)',
                  color: 'bg-blue-500',
                },
                {
                  label: 'Integration Data',
                  records: data.categories.fub.records,
                  desc: 'FUB CRM data — synced separately via FUB integration pipeline',
                  color: 'bg-emerald-500',
                },
                {
                  label: 'Operational',
                  records: data.categories.logs.records + data.categories.lambda.records,
                  desc: 'Logs, audit trails, and job queues — operational data, not migrated',
                  color: 'bg-amber-500',
                },
                {
                  label: 'Already Synced (V1→V2)',
                  records: data.sync_total_v1,
                  desc: `${data.sync_entities.length} entities tracked by the V1→V2 sync pipeline`,
                  color: 'bg-green-500',
                },
              ].map((scope) => (
                <div key={scope.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-sm shrink-0 ${scope.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{scope.label}</span>
                      <span className="text-sm tabular-nums font-medium">{fmt(scope.records)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{scope.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* V1→V2 Sync Progress */}
      {!isLoading && data?.sync_entities && data.sync_entities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">V1→V2 Sync Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left py-2 pr-4">Entity</th>
                    <th className="text-right py-2 px-4">V1 Count</th>
                    <th className="text-right py-2 px-4">V2 Count</th>
                    <th className="text-right py-2 px-4">Delta</th>
                    <th className="text-right py-2 pl-4">Sync %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sync_entities.map((e) => {
                    const delta = e.v2 - e.v1
                    const pct = e.v1 > 0 ? ((e.v2 / e.v1) * 100).toFixed(1) : '—'
                    return (
                      <tr key={e.entity} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium capitalize">{e.entity}</td>
                        <td className="py-2 px-4 text-right tabular-nums">{fmt(e.v1)}</td>
                        <td className="py-2 px-4 text-right tabular-nums">{fmt(e.v2)}</td>
                        <td
                          className={`py-2 px-4 text-right tabular-nums ${
                            delta === 0
                              ? 'text-green-600'
                              : delta > 0
                                ? 'text-blue-600'
                                : 'text-amber-600'
                          }`}
                        >
                          {delta > 0 ? '+' : ''}
                          {fmt(delta)}
                        </td>
                        <td className="py-2 pl-4 text-right tabular-nums">
                          {pct === '—' ? pct : `${pct}%`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamp */}
      {data?.timestamp && (
        <p className="text-[10px] text-muted-foreground text-right">
          Data as of: {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
