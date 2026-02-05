'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Database,
  Users,
  FileText,
  Network,
  Activity,
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

interface DataSyncResponse {
  success: boolean
  timestamp: string
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
  migration_score: {
    overall: number
    status: string
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
  const [data, setData] = useState<DataSyncResponse | null>(null)
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
  const migrationScore = data?.migration_score

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Live Data Sync Status</h2>
          <p className="text-muted-foreground">Real-time V1 → V2 record counts from Xano</p>
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
          <p className="text-muted-foreground">Loading live sync data...</p>
        </Card>
      )}

      {/* Summary Metrics */}
      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Overall Sync"
            value={`${totals.sync_percent}%`}
            subtitle={totals.status === 'synced' ? 'Fully synced' : 'In progress'}
            icon={<Database className="h-4 w-4" />}
            highlight={totals.sync_percent >= 99}
          />
          <MetricCard
            title="V1 Records"
            value={totals.v1_records.toLocaleString()}
            subtitle="Source (production)"
            icon={<FileText className="h-4 w-4" />}
          />
          <MetricCard
            title="V2 Records"
            value={totals.v2_records.toLocaleString()}
            subtitle="Target (normalized)"
            icon={<FileText className="h-4 w-4" />}
          />
          <MetricCard
            title="Migration Score"
            value={migrationScore?.overall ? `${migrationScore.overall}%` : '--'}
            subtitle={migrationScore?.status || 'Calculating...'}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Overall Progress Bar */}
      {totals && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Overall Data Sync Progress</h3>
          <ProgressBar value={totals.sync_percent} showPercentage={false} />
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>V1: {totals.v1_records.toLocaleString()} records</span>
            <span
              className="font-semibold"
              style={{
                color:
                  totals.sync_percent >= 99
                    ? 'var(--status-success)'
                    : totals.sync_percent >= 90
                      ? 'var(--status-warning)'
                      : 'var(--status-info)',
              }}
            >
              {totals.sync_percent}% synced
            </span>
            <span>V2: {totals.v2_records.toLocaleString()} records</span>
          </div>
        </Card>
      )}

      {/* Entity-by-Entity Breakdown */}
      {entities.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Entity Sync Status</h3>
          <div className="space-y-4">
            {entities.map((entity) => (
              <div key={entity.entity} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ENTITY_ICONS[entity.entity] || <Database className="h-4 w-4" />}
                    <span className="font-medium">
                      {ENTITY_LABELS[entity.entity] || entity.entity}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      V1: {entity.v1_count.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      V2: {entity.v2_count.toLocaleString()}
                    </span>
                    <span
                      className="font-semibold min-w-[60px] text-right"
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
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min(entity.sync_percent, 100)}%`,
                        backgroundColor:
                          entity.status === 'synced'
                            ? 'var(--status-success)'
                            : entity.status === 'partial'
                              ? 'var(--status-warning)'
                              : 'var(--status-info)',
                      }}
                    />
                  </div>
                  {entity.delta !== 0 && (
                    <span
                      className="text-xs min-w-[60px] text-right"
                      style={{
                        color: entity.delta > 0 ? 'var(--status-success)' : 'var(--status-warning)',
                      }}
                    >
                      {entity.delta > 0 ? '+' : ''}
                      {entity.delta.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Status Legend */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--status-success)' }}
              />
              <span className="text-muted-foreground">Synced (≥99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--status-warning)' }}
              />
              <span className="text-muted-foreground">Partial (90-99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--status-info)' }}
              />
              <span className="text-muted-foreground">In Progress (&lt;90%)</span>
            </div>
          </div>
          {data?.data_sync?.source && (
            <span className="text-xs text-muted-foreground">Source: {data.data_sync.source}</span>
          )}
        </div>
      </Card>
    </div>
  )
}
