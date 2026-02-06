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
    migrationClass: 'Agents, Users, Transactions, Listings, Network',
  },
  fub: {
    label: 'Follow Up Boss (FUB)',
    color: 'bg-emerald-500',
    migrationClass: 'CRM — People, Calls, Events, Deals',
  },
  logs: {
    label: 'Logs & Audit',
    color: 'bg-amber-500',
    migrationClass: 'Audit Trails, System Events',
  },
  lambda: {
    label: 'Lambda Jobs',
    color: 'bg-purple-500',
    migrationClass: 'Background Jobs, Worker Logs',
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
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-6 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  V1 Production
                </p>
                <p className="text-3xl font-bold tabular-nums">{fmt(data.grand_total)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.tables_counted} of {data.total_v1_tables} tables counted
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-500/20 bg-purple-500/5">
              <CardContent className="pt-6 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  V2 Normalized
                </p>
                <p className="text-3xl font-bold tabular-nums">
                  {data.v2_grand_total > 0 ? fmt(data.v2_grand_total) : fmt(data.sync_total_v2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.v2_grand_total > 0
                    ? `${data.v2_tables_counted} of ${data.total_v2_tables} tables counted`
                    : `${data.sync_entities.length} entities via sync pipeline`}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-amber-500/20 bg-amber-500/5">
              <CardContent className="pt-6 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Gap
                </p>
                <p className="text-3xl font-bold tabular-nums text-amber-600">
                  {fmt(
                    data.grand_total -
                      (data.v2_grand_total > 0 ? data.v2_grand_total : data.sync_total_v2)
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">records not yet in V2</p>
              </CardContent>
            </Card>
          </div>

          {/* Overall progress bar */}
          {(() => {
            const v2Total = data.v2_grand_total > 0 ? data.v2_grand_total : data.sync_total_v2
            const pct = data.grand_total > 0 ? (v2Total / data.grand_total) * 100 : 0
            return (
              <Card>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall V2 Coverage</span>
                    <span className="text-sm font-bold tabular-nums">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {fmt(v2Total)} of {fmt(data.grand_total)} V1 records have corresponding V2 data.
                    V2 needs all historical data for a seamless transition.
                  </p>
                </CardContent>
              </Card>
            )
          })()}
        </>
      ) : null}

      {/* V1 Data Breakdown — what's in V1 that needs to come over */}
      {!isLoading && data?.categories && (
        <div>
          <h3 className="text-sm font-medium mb-3">V1 Data Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.categories).map(([key, catData]) => (
              <CategoryCard key={key} catKey={key} data={catData} grandTotal={data.grand_total} />
            ))}
          </div>
        </div>
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
