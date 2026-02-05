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
  Code,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
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
    instance: string
    workspace_id: number
    tables: { count: number; total_records: string }
    functions: { count: number }
    api_groups: { count: number }
    endpoints: { count: number }
  }
  v2: {
    workspace: string
    instance: string
    workspace_id: number
    tables: { count: number; total_records: string; validated: number }
    functions: {
      count: number
      breakdown: { archive: number; workers: number; tasks: number; endpoints: number }
    }
    api_groups: { count: number; major: number }
    endpoints: {
      count: number
      breakdown: {
        frontend_api_v2: number
        workers: number
        tasks: number
        system: number
        seeding: number
      }
    }
  }
  comparison: {
    tables: { gap: number; v1_to_v2_ratio: number; description: string; explanation: string }
    functions: { gap: number; v1_to_v2_ratio: number; description: string }
    endpoints: { gap: number; v1_to_v2_ratio: number; description: string }
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
    source: string
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

function ComparisonRow({
  label,
  v1Value,
  v2Value,
  delta,
  description,
}: {
  label: string
  v1Value: number | string
  v2Value: number | string
  delta?: number
  description?: string
}) {
  const numDelta = typeof delta === 'number' ? delta : 0
  return (
    <div className="grid grid-cols-12 gap-4 py-3 border-b last:border-b-0 items-center">
      <div className="col-span-3 font-medium">{label}</div>
      <div className="col-span-2 text-center font-mono">{v1Value.toLocaleString()}</div>
      <div className="col-span-1 flex justify-center">
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="col-span-2 text-center font-mono">{v2Value.toLocaleString()}</div>
      <div className="col-span-2 text-center">
        {numDelta !== 0 && (
          <span
            className="inline-flex items-center gap-1 text-sm font-medium"
            style={{
              color:
                numDelta > 0
                  ? 'var(--status-success)'
                  : numDelta < 0
                    ? 'var(--status-info)'
                    : 'var(--status-pending)',
            }}
          >
            {numDelta > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {numDelta > 0 ? '+' : ''}
            {numDelta}
          </span>
        )}
        {numDelta === 0 && (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Minus className="h-3 w-3" /> 0
          </span>
        )}
      </div>
      <div className="col-span-2 text-xs text-muted-foreground truncate" title={description}>
        {description || '—'}
      </div>
    </div>
  )
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">V1 → V2 Migration Status</h2>
          <p className="text-muted-foreground">
            Live comparison of V1 (Production) and V2 (Normalized) Xano workspaces
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
          <p className="text-muted-foreground">Loading live data from Xano...</p>
        </Card>
      )}

      {/* Summary Metrics */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Data Sync"
            value={totals ? `${totals.sync_percent}%` : '--'}
            subtitle={totals?.status === 'synced' ? 'Fully synced' : 'In progress'}
            icon={<Database className="h-4 w-4" />}
            highlight={totals && totals.sync_percent >= 99}
          />
          <MetricCard
            title="V1 Records"
            value={totals?.v1_records.toLocaleString() || '--'}
            subtitle="Production source"
            icon={<Server className="h-4 w-4" />}
          />
          <MetricCard
            title="V2 Records"
            value={totals?.v2_records.toLocaleString() || '--'}
            subtitle="Normalized target"
            icon={<Server className="h-4 w-4" />}
          />
          <MetricCard
            title="Table Reduction"
            value={
              comparison ? `${Math.round((1 - comparison.tables.v1_to_v2_ratio) * 100)}%` : '--'
            }
            subtitle={v1 && v2 ? `${v1.tables.count} → ${v2.tables.count}` : ''}
            icon={<Layers className="h-4 w-4" />}
          />
          <MetricCard
            title="Migration Score"
            value={migrationScore ? `${migrationScore.overall}%` : '--'}
            subtitle={migrationScore?.status || 'Calculating...'}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Workspace Comparison */}
      {v1 && v2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* V1 Workspace */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{v1.workspace}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Instance</span>
                <span className="font-mono text-xs">{v1.instance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Workspace ID</span>
                <span className="font-mono">{v1.workspace_id}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{v1.tables.count}</div>
                    <div className="text-xs text-muted-foreground">Tables</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{v1.functions.count}</div>
                    <div className="text-xs text-muted-foreground">Functions</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{v1.endpoints.count}</div>
                    <div className="text-xs text-muted-foreground">Endpoints</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{v1.api_groups.count}</div>
                    <div className="text-xs text-muted-foreground">API Groups</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* V2 Workspace */}
          <Card className="p-6 border-[var(--status-success-border)]">
            <div className="flex items-center gap-2 mb-4">
              <Server className="h-5 w-5" style={{ color: 'var(--status-success)' }} />
              <h3 className="text-lg font-semibold">{v2.workspace}</h3>
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
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Instance</span>
                <span className="font-mono text-xs">{v2.instance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Workspace ID</span>
                <span className="font-mono">{v2.workspace_id}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{v2.tables.count}</div>
                    <div className="text-xs text-muted-foreground">Tables</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{v2.functions.count}</div>
                    <div className="text-xs text-muted-foreground">Functions</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{v2.endpoints.count}</div>
                    <div className="text-xs text-muted-foreground">Endpoints</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{v2.api_groups.count}</div>
                    <div className="text-xs text-muted-foreground">API Groups</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Architecture Comparison Table */}
      {v1 && v2 && comparison && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Architecture Comparison</h3>
          <div className="text-sm">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 py-2 border-b font-medium text-muted-foreground">
              <div className="col-span-3">Component</div>
              <div className="col-span-2 text-center">V1</div>
              <div className="col-span-1"></div>
              <div className="col-span-2 text-center">V2</div>
              <div className="col-span-2 text-center">Delta</div>
              <div className="col-span-2">Notes</div>
            </div>
            {/* Rows */}
            <ComparisonRow
              label="Tables"
              v1Value={v1.tables.count}
              v2Value={v2.tables.count}
              delta={v2.tables.count - v1.tables.count}
              description="23% reduction via normalization"
            />
            <ComparisonRow
              label="Functions"
              v1Value={v1.functions.count}
              v2Value={v2.functions.count}
              delta={comparison.functions.gap}
              description="Reorganized by domain"
            />
            <ComparisonRow
              label="Endpoints"
              v1Value={v1.endpoints.count}
              v2Value={v2.endpoints.count}
              delta={comparison.endpoints.gap}
              description="Clearer API separation"
            />
            <ComparisonRow
              label="API Groups"
              v1Value={v1.api_groups.count}
              v2Value={v2.api_groups.count}
              delta={v2.api_groups.count - v1.api_groups.count}
              description={`${v2.api_groups.major} major groups`}
            />
          </div>
        </Card>
      )}

      {/* V2 Function Breakdown */}
      {v2 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">V2 Function Organization</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Code className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{v2.functions.breakdown.archive}</div>
              <div className="text-xs text-muted-foreground">Archive/*</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Activity className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{v2.functions.breakdown.workers}</div>
              <div className="text-xs text-muted-foreground">Workers/</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <FileText className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{v2.functions.breakdown.tasks}</div>
              <div className="text-xs text-muted-foreground">Tasks/</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Layers className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{v2.functions.breakdown.endpoints}</div>
              <div className="text-xs text-muted-foreground">Endpoint Handlers</div>
            </div>
          </div>
        </Card>
      )}

      {/* Live Data Sync Status */}
      {entities.length > 0 && totals && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Live Record Sync Status</h3>
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

          {/* Overall Progress */}
          <div className="mb-6">
            <ProgressBar value={totals.sync_percent} showPercentage={false} />
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>V1: {totals.v1_records.toLocaleString()} records</span>
              <span>V2: {totals.v2_records.toLocaleString()} records</span>
            </div>
          </div>

          {/* Per-Entity Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4">Entity</th>
                  <th className="text-right py-2 px-4">V1 Count</th>
                  <th className="text-right py-2 px-4">V2 Count</th>
                  <th className="text-right py-2 px-4">Delta</th>
                  <th className="text-right py-2 px-4">Sync %</th>
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
                  <td className="py-3 pr-4">Total</td>
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
        </Card>
      )}

      {/* Validation Results */}
      {validation && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Tables</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor:
                      validation.tables.pass_rate >= 95
                        ? 'var(--status-success-bg)'
                        : 'var(--status-warning-bg)',
                    color:
                      validation.tables.pass_rate >= 95
                        ? 'var(--status-success)'
                        : 'var(--status-warning)',
                  }}
                >
                  {validation.tables.pass_rate.toFixed(0)}% pass
                </span>
              </div>
              <div className="text-2xl font-bold">
                {validation.tables.validated}/{validation.tables.total}
              </div>
              <div className="mt-2">
                <ProgressBar
                  value={(validation.tables.validated / validation.tables.total) * 100}
                  showPercentage={false}
                />
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Functions</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor:
                      validation.functions.pass_rate >= 95
                        ? 'var(--status-success-bg)'
                        : 'var(--status-warning-bg)',
                    color:
                      validation.functions.pass_rate >= 95
                        ? 'var(--status-success)'
                        : 'var(--status-warning)',
                  }}
                >
                  {validation.functions.pass_rate.toFixed(0)}% pass
                </span>
              </div>
              <div className="text-2xl font-bold">
                {validation.functions.validated}/{validation.functions.total}
              </div>
              <div className="mt-2">
                <ProgressBar
                  value={(validation.functions.validated / validation.functions.total) * 100}
                  showPercentage={false}
                />
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Endpoints</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor:
                      validation.endpoints.pass_rate >= 95
                        ? 'var(--status-success-bg)'
                        : 'var(--status-warning-bg)',
                    color:
                      validation.endpoints.pass_rate >= 95
                        ? 'var(--status-success)'
                        : 'var(--status-warning)',
                  }}
                >
                  {validation.endpoints.pass_rate.toFixed(0)}% pass
                </span>
              </div>
              <div className="text-2xl font-bold">
                {validation.endpoints.validated}/{validation.endpoints.total}
              </div>
              <div className="mt-2">
                <ProgressBar
                  value={(validation.endpoints.validated / validation.endpoints.total) * 100}
                  showPercentage={false}
                />
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">References</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor:
                      validation.references.pass_rate >= 95
                        ? 'var(--status-success-bg)'
                        : 'var(--status-warning-bg)',
                    color:
                      validation.references.pass_rate >= 95
                        ? 'var(--status-success)'
                        : 'var(--status-warning)',
                  }}
                >
                  {validation.references.pass_rate.toFixed(0)}% pass
                </span>
              </div>
              <div className="text-2xl font-bold">
                {validation.references.validated}/{validation.references.total}
              </div>
              <div className="mt-2">
                <ProgressBar
                  value={(validation.references.validated / validation.references.total) * 100}
                  showPercentage={false}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Data Source Info */}
      {data?.data_sync?.source && (
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--status-success)' }}
                />
                <span>Synced (≥99%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--status-warning)' }}
                />
                <span>Partial (90-99%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--status-info)' }}
                />
                <span>In Progress (&lt;90%)</span>
              </div>
            </div>
            <span className="text-xs">Live data from: {data.data_sync.source}</span>
          </div>
        </Card>
      )}
    </div>
  )
}
