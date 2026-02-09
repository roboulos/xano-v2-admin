'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Database,
  Users,
  FileText,
  Network,
  Activity,
  Server,
  Layers,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MetricCard } from '@/components/ui/metric-card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'

interface EntitySyncStatus {
  entity: string
  v1_count: number
  v2_count: number
  sync_percent: number
  delta: number
  status: 'synced' | 'partial' | 'pending'
}

interface MigrationStatusResponse {
  success: boolean
  timestamp: string
  v1: {
    workspace: string
    tables: { count: number }
    functions: { count: number | null }
    api_groups: { count: number | null }
    endpoints: { count: number | null }
  }
  v2: {
    workspace: string
    tables: { count: number; validated: number }
    functions: {
      count: number
      active: number
      breakdown: { archive: number; workers: number; tasks: number }
    }
    api_groups: { count: number }
    endpoints: { count: number }
  }
  comparison: {
    tables: { gap: number; v1_to_v2_ratio: number; description: string; explanation: string }
  }
  migration_score: {
    tables: number
    functions: number
    endpoints: number
    references: number
    overall: number
    status: string
  }
  validation_results: {
    tables: { validated: number; total: number; pass_rate: number }
    functions: { validated: number; total: number; pass_rate: number }
    endpoints: { validated: number; total: number; pass_rate: number }
    references: { validated: number; total: number; pass_rate: number }
  }
  data_sync: {
    entities: EntitySyncStatus[]
    totals: {
      v1_records: number
      v2_records: number
      sync_percent: number
      status: string
    }
  }
}

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  users: <Users className="h-4 w-4" />,
  agents: <Users className="h-4 w-4" />,
  transactions: <FileText className="h-4 w-4" />,
  participants: <Activity className="h-4 w-4" />,
  network: <Network className="h-4 w-4" />,
}

const ENTITY_LABELS: Record<string, string> = {
  users: 'Users',
  agents: 'Agents',
  transactions: 'Transactions',
  participants: 'Participants',
  network: 'Network Hierarchy',
}

export function StatusDashboardTab() {
  const [data, setData] = useState<MigrationStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/migration/status')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const entities = data?.data_sync?.entities || []
  const totals = data?.data_sync?.totals
  const v1 = data?.v1
  const v2 = data?.v2
  const comparison = data?.comparison
  const migrationScore = data?.migration_score
  const validation = data?.validation_results

  // Only show validation if at least one category has real results
  const hasValidationData =
    validation &&
    (validation.tables.validated > 0 ||
      validation.functions.validated > 0 ||
      validation.endpoints.validated > 0 ||
      validation.references.validated > 0)

  const entityCount = entities.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Migration Status</h2>
          <p className="text-muted-foreground">
            Live comparison between the current production system and the upgraded system
          </p>
          {data?.timestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-4 border-[var(--status-error-border)] bg-[var(--status-error-bg)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" style={{ color: 'var(--status-error)' }} />
            <span style={{ color: 'var(--status-error)' }}>Error: {error}</span>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <Card className="p-8 text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading live data...</p>
        </Card>
      )}

      {/* Summary Metrics */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Record Sync"
            value={totals ? `${totals.sync_percent}%` : '--'}
            subtitle={
              totals?.status === 'synced'
                ? 'All records matched'
                : `Across ${entityCount} core data types`
            }
            icon={<Database className="h-4 w-4" />}
            highlight={totals && totals.sync_percent >= 99}
          />
          <MetricCard
            title={`Core Records (${entityCount} types)`}
            value={totals?.v1_records.toLocaleString() || '--'}
            subtitle="Users, Agents, Transactions, Participants, Network"
            icon={<Server className="h-4 w-4" />}
          />
          <MetricCard
            title="Database Cleanup"
            value={v1 && v2 ? `${v1.tables.count} → ${v2.tables.count}` : '--'}
            subtitle={comparison ? `${comparison.tables.gap} redundant tables removed` : ''}
            icon={<Layers className="h-4 w-4" />}
          />
          <MetricCard
            title="Active Functions"
            value={v2?.functions.active?.toLocaleString() || '--'}
            subtitle={v2 ? `${v2.functions.count.toLocaleString()} total in system` : ''}
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            title="API Endpoints"
            value={v2?.endpoints.count.toLocaleString() || '--'}
            subtitle={v2 ? `Across ${v2.api_groups.count} service areas` : ''}
            icon={<Network className="h-4 w-4" />}
          />
        </div>
      )}

      {/* System Overview — V2 only (V1 function/endpoint counts not tracked) */}
      {v1 && v2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current System */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Current System</h3>
            </div>
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold">{v1.tables.count}</div>
                <div className="text-sm text-muted-foreground mt-1">Production Tables</div>
              </div>
              <p className="text-sm text-muted-foreground">
                The original system with {v1.tables.count} tables including redundant aggregation
                tables and denormalized data. Record counts for {entityCount} core data types are
                tracked live above.
              </p>
            </div>
          </Card>

          {/* Upgraded System */}
          <Card className="p-6 border-[var(--status-success-border)]">
            <div className="flex items-center gap-2 mb-4">
              <Server className="h-5 w-5" style={{ color: 'var(--status-success)' }} />
              <h3 className="text-lg font-semibold">Upgraded System</h3>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--status-success-bg)',
                  color: 'var(--status-success)',
                }}
              >
                Target
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{v2.tables.count}</div>
                <div className="text-xs text-muted-foreground">Tables</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{v2.functions.active}</div>
                <div className="text-xs text-muted-foreground">Active Functions</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{v2.endpoints.count}</div>
                <div className="text-xs text-muted-foreground">API Endpoints</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{v2.api_groups.count}</div>
                <div className="text-xs text-muted-foreground">Service Areas</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* What Changed — simple explanation */}
      {comparison && v1 && v2 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">What Changed</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle2
                className="h-5 w-5 mt-0.5 flex-shrink-0"
                style={{ color: 'var(--status-success)' }}
              />
              <div>
                <p className="font-medium">
                  Database reduced from {v1.tables.count} to {v2.tables.count} tables
                </p>
                <p className="text-muted-foreground mt-1">{comparison.tables.explanation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle2
                className="h-5 w-5 mt-0.5 flex-shrink-0"
                style={{ color: 'var(--status-success)' }}
              />
              <div>
                <p className="font-medium">
                  {v2.functions.active} active functions across {v2.api_groups.count} service areas
                </p>
                <p className="text-muted-foreground mt-1">
                  {v2.functions.count.toLocaleString()} total functions in the system (
                  {v2.functions.active} active, {v2.functions.breakdown.archive.toLocaleString()}{' '}
                  archived from previous iterations)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle2
                className="h-5 w-5 mt-0.5 flex-shrink-0"
                style={{ color: 'var(--status-success)' }}
              />
              <div>
                <p className="font-medium">
                  {v2.endpoints.count} API endpoints serving all frontend applications
                </p>
                <p className="text-muted-foreground mt-1">
                  Organized into {v2.api_groups.count} service areas with clear separation of
                  responsibilities
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Live Record Sync — per entity */}
      {entities.length > 0 && totals && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Record-by-Record Comparison</h3>
            <span
              className="text-sm px-3 py-1 rounded-full font-medium"
              style={{
                backgroundColor:
                  totals.status === 'synced' ? 'var(--status-success-bg)' : 'var(--status-info-bg)',
                color: totals.status === 'synced' ? 'var(--status-success)' : 'var(--status-info)',
              }}
            >
              {totals.sync_percent}% synced
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            These {entityCount} core data types are the records being migrated from the current
            system to the upgraded system. Counts are fetched live.
          </p>

          {/* Overall Progress */}
          <div className="mb-6">
            <ProgressBar value={totals.sync_percent} showPercentage={false} />
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>Current: {totals.v1_records.toLocaleString()} records</span>
              <span>Upgraded: {totals.v2_records.toLocaleString()} records</span>
            </div>
          </div>

          {/* Per-Entity Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4">Data Type</th>
                  <th className="text-right py-2 px-4">Current System</th>
                  <th className="text-right py-2 px-4">Upgraded System</th>
                  <th className="text-right py-2 px-4">Difference</th>
                  <th className="text-right py-2 px-4">Match</th>
                  <th className="text-center py-2 pl-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((entity) => (
                  <tr key={entity.entity} className="border-b last:border-b-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {ENTITY_ICONS[entity.entity] || <Database className="h-4 w-4" />}
                        <span className="font-medium">
                          {ENTITY_LABELS[entity.entity] || entity.entity}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">
                      {entity.v1_count.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-mono">
                      {entity.v2_count.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className="font-mono"
                        style={{
                          color:
                            entity.delta > 0
                              ? 'var(--status-success)'
                              : entity.delta < 0
                                ? 'var(--status-warning)'
                                : 'var(--status-pending)',
                        }}
                      >
                        {entity.delta > 0 ? '+' : ''}
                        {entity.delta.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            entity.status === 'synced'
                              ? 'var(--status-success)'
                              : entity.status === 'partial'
                                ? 'var(--status-warning)'
                                : 'var(--status-info)',
                        }}
                      >
                        {entity.sync_percent}%
                      </span>
                    </td>
                    <td className="text-center py-3 pl-4">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            entity.status === 'synced'
                              ? 'var(--status-success)'
                              : entity.status === 'partial'
                                ? 'var(--status-warning)'
                                : 'var(--status-info)',
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="py-3 pr-4">Total ({entityCount} types)</td>
                  <td className="text-right py-3 px-4 font-mono">
                    {totals.v1_records.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 font-mono">
                    {totals.v2_records.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 font-mono">
                    {(totals.v2_records - totals.v1_records).toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4" style={{ color: 'var(--status-success)' }}>
                    {totals.sync_percent}%
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--status-success)' }}
              />
              <span>Matched (≥99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--status-warning)' }}
              />
              <span>Close (90-99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--status-info)' }}
              />
              <span>In Progress (&lt;90%)</span>
            </div>
          </div>
        </Card>
      )}

      {/* Validation Results — only shown when actual reports exist */}
      {hasValidationData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quality Checks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tables', data: validation.tables },
              { label: 'Functions', data: validation.functions },
              { label: 'Endpoints', data: validation.endpoints },
              { label: 'References', data: validation.references },
            ].map(({ label, data: v }) => (
              <div key={label} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor:
                        v.pass_rate >= 95 ? 'var(--status-success-bg)' : 'var(--status-warning-bg)',
                      color: v.pass_rate >= 95 ? 'var(--status-success)' : 'var(--status-warning)',
                    }}
                  >
                    {v.pass_rate.toFixed(0)}% pass
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {v.validated}/{v.total}
                </div>
                <div className="mt-2">
                  <ProgressBar
                    value={v.total > 0 ? (v.validated / v.total) * 100 : 0}
                    showPercentage={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
