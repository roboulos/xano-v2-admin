'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  ArrowRight,
  Database,
  Layers,
  ChevronDown,
  ChevronRight,
  Zap,
  Shield,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertBanner } from '@/components/ui/alert-banner'
import { LoadingState } from '@/components/ui/loading-state'
import { getV1Stats } from '@/lib/v1-data'
import { TABLES_DATA } from '@/lib/v2-data'

// Transformation examples for deep dives
const TRANSFORMATION_EXAMPLES = [
  {
    id: 'user',
    title: 'User Identity',
    v1: {
      table: 'user',
      columns: '111 JSONB fields in xdo',
      example: 'email, password, stripe_id, settings, roles all mixed',
    },
    v2: [
      { table: 'user', purpose: 'Core identity (id, email, name)', columns: 8 },
      { table: 'user_credentials', purpose: 'Auth & API keys', columns: 6 },
      { table: 'user_subscriptions', purpose: 'Billing & Stripe', columns: 7 },
      { table: 'user_settings', purpose: 'Preferences', columns: 12 },
      { table: 'user_roles', purpose: 'Permissions & teams', columns: 5 },
    ],
    benefit:
      'Security: Credentials isolated. Performance: Load only needed data. Clarity: Clear responsibility per table.',
  },
  {
    id: 'agent',
    title: 'Agent Profile',
    v1: {
      table: 'agent',
      columns: '132 JSONB fields in xdo',
      example: 'profile, caps, commissions, hierarchy, metrics jumbled',
    },
    v2: [
      { table: 'agent', purpose: 'Core profile (id, name, status)', columns: 15 },
      { table: 'agent_cap_data', purpose: 'Annual cap tracking', columns: 8 },
      { table: 'agent_commission', purpose: 'Commission splits', columns: 6 },
      { table: 'agent_hierarchy', purpose: 'Sponsor tree links', columns: 5 },
      { table: 'agent_performance', purpose: 'Metrics & rankings', columns: 12 },
    ],
    benefit:
      'Analytics: Query performance without loading profiles. Caps: Year-over-year tracking simplified.',
  },
  {
    id: 'transaction',
    title: 'Transaction Records',
    v1: {
      table: 'transaction',
      columns: '119 JSONB fields in xdo',
      example: 'deal info, financials, parties, history, tags in one blob',
    },
    v2: [
      { table: 'transaction', purpose: 'Core deal record', columns: 20 },
      { table: 'transaction_financials', purpose: 'Money & splits', columns: 15 },
      { table: 'transaction_history', purpose: 'Audit trail', columns: 6 },
      { table: 'transaction_participants', purpose: 'Agents junction', columns: 4 },
      { table: 'transaction_tags', purpose: 'Categorization', columns: 3 },
    ],
    benefit:
      'Audit: Complete history without bloating main record. Reports: Fast financial queries.',
  },
]

// Why normalization matters
const NORMALIZATION_BENEFITS = [
  {
    icon: Zap,
    title: 'Query Performance',
    description: 'Load 5 user columns instead of extracting from 111-field JSON blob',
  },
  {
    icon: Shield,
    title: 'Data Integrity',
    description: 'Foreign keys enforce relationships. No orphaned records.',
  },
  {
    icon: TrendingUp,
    title: 'Analytics Ready',
    description: 'JOIN tables for reports. No JSON parsing in SQL.',
  },
  {
    icon: Layers,
    title: 'Maintainability',
    description: 'Clear schema documentation. Self-describing structure.',
  },
]

interface SyncStatus {
  entity: string
  v1: number
  v2: number
}

// SWR fetcher for sync data
const syncFetcher = async () => {
  const res = await fetch(
    'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/sync-v1-to-v2-direct',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  )
  return res.json()
}

export function TransformationStoryTab() {
  const [openSections, setOpenSections] = useState<string[]>(['user'])

  // Fetch live sync data with SWR
  const {
    data: syncResponse,
    isLoading: loading,
    mutate,
  } = useSWR('transformation-sync-data', syncFetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  const syncData: SyncStatus[] = syncResponse?.entity_counts || []
  const lastUpdated = syncResponse ? new Date() : null

  const toggleSection = (id: string) => {
    setOpenSections((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  // Calculate stats
  const v1Stats = getV1Stats()
  const v2TableCount = TABLES_DATA.length

  // Calculate transformation stats
  const splitCount = 5 // user, agent, team, network, transaction
  const normalizedTables = 14 // All the split target tables

  // Check for sync warnings (entities not at 100%)
  const syncWarnings = syncData.filter((entity) => {
    const ratio = entity.v1 > 0 ? (entity.v2 / entity.v1) * 100 : 0
    return ratio < 99
  })

  // Export transformation data
  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      v1_tables: v1Stats.total,
      v2_tables: v2TableCount,
      transformations: TRANSFORMATION_EXAMPLES,
      sync_status: syncData,
      benefits: NORMALIZATION_BENEFITS.map((b) => ({ title: b.title, description: b.description })),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transformation-story-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6" />
            V1 to V2 Transformation Story
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            How 251 JSONB tables became 193 normalized, typed tables
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Sync Warning Alert */}
      {syncWarnings.length > 0 && (
        <AlertBanner
          variant="warning"
          title={`${syncWarnings.length} Entit${syncWarnings.length > 1 ? 'ies' : 'y'} Not Fully Synced`}
          description={`The following entities are below 99% sync: ${syncWarnings.map((e) => e.entity).join(', ')}`}
          icon={AlertTriangle}
        />
      )}

      {/* Hero Section - The Big Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="p-6 border"
          style={{
            backgroundColor: 'var(--status-warning-bg)',
            borderColor: 'var(--status-warning-border)',
          }}
        >
          <div className="text-center">
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--status-warning)' }}>
              V1 PRODUCTION
            </div>
            <div className="text-5xl font-bold mb-1" style={{ color: 'var(--status-warning)' }}>
              {v1Stats.total}
            </div>
            <div className="text-lg text-muted-foreground">Tables</div>
            <div className="mt-3 text-xs" style={{ color: 'var(--status-warning)' }}>
              JSONB xdo columns
            </div>
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-center">
          <div className="text-center">
            <ArrowRight className="h-12 w-12 text-primary mx-auto mb-2" />
            <div className="text-lg font-semibold text-primary">Normalized</div>
            <div className="text-sm text-muted-foreground">Split & Typed</div>
          </div>
        </Card>

        <Card
          className="p-6 border"
          style={{
            backgroundColor: 'var(--status-success-bg)',
            borderColor: 'var(--status-success-border)',
          }}
        >
          <div className="text-center">
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--status-success)' }}>
              V2 REFACTORED
            </div>
            <div className="text-5xl font-bold mb-1" style={{ color: 'var(--status-success)' }}>
              {v2TableCount}
            </div>
            <div className="text-lg text-muted-foreground">Tables</div>
            <div className="mt-3 text-xs" style={{ color: 'var(--status-success)' }}>
              Typed columns
            </div>
          </div>
        </Card>
      </div>

      {/* Key Transformation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{splitCount}</div>
          <div className="text-sm text-muted-foreground">Core Entities Split</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{normalizedTables}</div>
          <div className="text-sm text-muted-foreground">Normalized Tables</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">449</div>
          <div className="text-sm text-muted-foreground">Fields Mapped</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">5</div>
          <div className="text-sm text-muted-foreground">Domains Synced</div>
        </Card>
      </div>

      {/* Live Sync Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Live Sync Status</h3>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => mutate()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {syncData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {syncData.map((entity) => {
              const ratio = entity.v1 > 0 ? (entity.v2 / entity.v1) * 100 : 0
              const isComplete = ratio >= 99
              return (
                <div
                  key={entity.entity}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: isComplete
                      ? 'var(--status-success-bg)'
                      : 'var(--status-warning-bg)',
                    borderColor: isComplete
                      ? 'var(--status-success-border)'
                      : 'var(--status-warning-border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{entity.entity}</span>
                    {isComplete && (
                      <CheckCircle2
                        className="h-4 w-4"
                        style={{ color: 'var(--status-success)' }}
                      />
                    )}
                  </div>
                  <div className="text-2xl font-bold">{ratio.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {entity.v2.toLocaleString()} / {entity.v1.toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8">
            {loading ? (
              <LoadingState message="Loading sync status..." size="md" />
            ) : (
              <div className="text-center text-muted-foreground">
                Click Refresh to load sync status
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Transformation Deep Dives */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Transformation Examples</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          See how V1&apos;s monolithic JSONB tables became V2&apos;s normalized structure
        </p>

        <div className="space-y-4">
          {TRANSFORMATION_EXAMPLES.map((example) => (
            <Collapsible
              key={example.id}
              open={openSections.includes(example.id)}
              onOpenChange={() => toggleSection(example.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  {openSections.includes(example.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-medium">{example.title}</span>
                  <Badge variant="outline" className="text-orange-600">
                    1 → {example.v2.length} tables
                  </Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 border border-t-0 rounded-b-lg space-y-4">
                  {/* V1 Side */}
                  <div
                    className="p-3 rounded border"
                    style={{
                      backgroundColor: 'var(--status-warning-bg)',
                      borderColor: 'var(--status-warning-border)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge style={{ backgroundColor: 'var(--status-warning)' }}>V1</Badge>
                      <span className="font-mono text-sm">{example.v1.table}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{example.v1.columns}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--status-warning)' }}>
                      Problem: {example.v1.example}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>

                  {/* V2 Side */}
                  <div
                    className="p-3 rounded border"
                    style={{
                      backgroundColor: 'var(--status-success-bg)',
                      borderColor: 'var(--status-success-border)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Badge style={{ backgroundColor: 'var(--status-success)' }}>V2</Badge>
                      <span className="text-sm">{example.v2.length} normalized tables</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {example.v2.map((table) => (
                        <div
                          key={table.table}
                          className="flex items-center justify-between p-2 bg-background rounded text-sm"
                        >
                          <span className="font-mono">{table.table}</span>
                          <span className="text-muted-foreground">{table.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefit */}
                  <div className="p-3 bg-primary/5 rounded border border-primary/20">
                    <div className="text-sm font-medium text-primary mb-1">Why This Matters</div>
                    <div className="text-sm text-muted-foreground">{example.benefit}</div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </Card>

      {/* Why Normalization Matters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Why Normalization Matters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {NORMALIZATION_BENEFITS.map((benefit, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg">
              <benefit.icon className="h-8 w-8 text-primary mb-3" />
              <div className="font-medium mb-1">{benefit.title}</div>
              <div className="text-sm text-muted-foreground">{benefit.description}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Technical Summary */}
      <Card className="p-6 bg-muted/20">
        <h3 className="text-lg font-semibold mb-4">Technical Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2" style={{ color: 'var(--status-warning)' }}>
              V1 Architecture
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                • 251 tables with JSONB <code className="bg-muted px-1 rounded">xdo</code> columns
              </li>
              <li>
                • 2 PostgreSQL columns per table: <code className="bg-muted px-1 rounded">id</code>{' '}
                + <code className="bg-muted px-1 rounded">xdo</code>
              </li>
              <li>• All business data in untyped JSON blobs</li>
              <li>• No foreign key enforcement</li>
              <li>• Full blob load for any query</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: 'var(--status-success)' }}>
              V2 Architecture
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {v2TableCount} tables with typed columns</li>
              <li>• Proper data types: int, text, boolean, timestamp</li>
              <li>• Foreign key relationships enforced</li>
              <li>• Split tables for different concerns</li>
              <li>• Query only what you need</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
