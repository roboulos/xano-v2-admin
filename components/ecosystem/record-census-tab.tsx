'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ServerCrash,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EntityRow {
  entity: string
  category: string
  v1_tid: number
  v2_tid: number
  v1_count: number
  v2_count: number
}

interface CategoryGroup {
  entities: EntityRow[]
  v1_total: number
  v2_total: number
}

interface RecordCountsResponse {
  comparable_v1_total: number
  comparable_v2_total: number
  comparable_tables: number
  comparable_gap: number
  comparable_pct: number
  v1_all_total: number
  v2_all_total: number
  total_entities: number
  categories: Record<string, CategoryGroup>
  entities: EntityRow[]
  timestamp: string
  note: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n)

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  core: { label: 'Core Business', color: 'bg-blue-500' },
  financial: { label: 'Financial', color: 'bg-green-500' },
  network: { label: 'Network', color: 'bg-indigo-500' },
  team_hierarchy: { label: 'Team Hierarchy', color: 'bg-cyan-500' },
  fub: { label: 'Follow Up Boss', color: 'bg-emerald-500' },
  logs: { label: 'Logs & Audit', color: 'bg-amber-500' },
  config: { label: 'Config & Reference', color: 'bg-purple-500' },
}

// ---------------------------------------------------------------------------
// CategorySection
// ---------------------------------------------------------------------------

function CategorySection({ catKey, group }: { catKey: string; group: CategoryGroup }) {
  const [expanded, setExpanded] = useState(false)
  const meta = CATEGORY_META[catKey] ?? { label: catKey, color: 'bg-gray-500' }
  const gap = group.v1_total - group.v2_total
  const pct = group.v1_total > 0 ? (group.v2_total / group.v1_total) * 100 : 100

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
            <Badge variant="secondary" className="text-[10px]">
              {group.entities.length} tables
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                pct >= 99.5 ? 'text-green-600' : 'text-amber-600'
              )}
            >
              {pct.toFixed(1)}%
            </span>
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Summary row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>V1: {fmt(group.v1_total)}</span>
          <span>V2: {fmt(group.v2_total)}</span>
          <span className={gap === 0 ? 'text-green-600' : 'text-amber-600'}>Gap: {fmt(gap)}</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              pct >= 99.5 ? 'bg-green-500' : meta.color
            )}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        {/* Expanded: per-table breakdown */}
        {expanded && (
          <div className="mt-2 border-t pt-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left py-1 pr-2">Table</th>
                  <th className="text-right py-1 px-2">V1</th>
                  <th className="text-right py-1 px-2">V2</th>
                  <th className="text-right py-1 px-2">Delta</th>
                  <th className="text-center py-1 pl-2">Match</th>
                </tr>
              </thead>
              <tbody>
                {group.entities
                  .sort((a, b) => b.v1_count - a.v1_count)
                  .map((e) => {
                    const delta = e.v2_count - e.v1_count
                    const isV2Only = e.v1_tid < 0
                    const isV1Only = e.v2_tid < 0
                    const match =
                      !isV1Only &&
                      !isV2Only &&
                      e.v1_count > 0 &&
                      Math.abs(delta) <= Math.max(e.v1_count * 0.001, 5)
                    return (
                      <tr key={e.entity} className="border-b last:border-0">
                        <td className="py-1 pr-2 font-mono">
                          {e.entity}
                          {isV2Only && (
                            <Badge variant="outline" className="ml-1 text-[8px]">
                              V2 only
                            </Badge>
                          )}
                          {isV1Only && (
                            <Badge variant="outline" className="ml-1 text-[8px]">
                              V1 only
                            </Badge>
                          )}
                        </td>
                        <td className="py-1 px-2 text-right tabular-nums">
                          {e.v1_tid > 0 ? fmt(e.v1_count) : '-'}
                        </td>
                        <td className="py-1 px-2 text-right tabular-nums">
                          {e.v2_tid > 0 ? fmt(e.v2_count) : '-'}
                        </td>
                        <td
                          className={cn(
                            'py-1 px-2 text-right tabular-nums',
                            delta === 0
                              ? 'text-green-600'
                              : delta > 0
                                ? 'text-blue-600'
                                : 'text-amber-600'
                          )}
                        >
                          {isV1Only || isV2Only ? '-' : `${delta > 0 ? '+' : ''}${fmt(delta)}`}
                        </td>
                        <td className="py-1 pl-2 text-center">
                          {isV1Only || isV2Only ? (
                            <span className="text-muted-foreground">-</span>
                          ) : match ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 inline" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500 inline" />
                          )}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
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
              Like-for-like V1 vs V2 comparison via cross-workspace SQL
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

      {/* Loading */}
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
          {/* Hero cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-6 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  V1 Production
                </p>
                <p className="text-3xl font-bold tabular-nums">{fmt(data.comparable_v1_total)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.comparable_tables} comparable tables
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-500/20 bg-purple-500/5">
              <CardContent className="pt-6 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  V2 Normalized
                </p>
                <p className="text-3xl font-bold tabular-nums">{fmt(data.comparable_v2_total)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.comparable_tables} comparable tables
                </p>
              </CardContent>
            </Card>
            <Card
              className={cn(
                'border-2',
                data.comparable_pct >= 99.5
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'border-amber-500/20 bg-amber-500/5'
              )}
            >
              <CardContent className="pt-6 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Coverage
                </p>
                <p
                  className={cn(
                    'text-3xl font-bold tabular-nums',
                    data.comparable_pct >= 99.5 ? 'text-green-600' : 'text-amber-600'
                  )}
                >
                  {data.comparable_pct.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gap: {fmt(data.comparable_gap)} records
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overall progress bar */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">V2 Coverage (like-for-like)</span>
                <span className="text-sm font-bold tabular-nums">
                  {data.comparable_pct.toFixed(2)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    data.comparable_pct >= 99.5 ? 'bg-green-500' : 'bg-purple-500'
                  )}
                  style={{ width: `${Math.min(data.comparable_pct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {fmt(data.comparable_v2_total)} of {fmt(data.comparable_v1_total)} V1 records exist
                in V2. Counting {data.total_entities} entities across 7 categories via
                cross-workspace SQL.
              </p>
            </CardContent>
          </Card>

          {/* Category breakdown */}
          <div>
            <h3 className="text-sm font-medium mb-3">By Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.categories).map(([key, group]) => (
                <CategorySection key={key} catKey={key} group={group} />
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Timestamp */}
      {data?.timestamp && (
        <p className="text-[10px] text-muted-foreground text-right">
          Data as of: {new Date(data.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  )
}
