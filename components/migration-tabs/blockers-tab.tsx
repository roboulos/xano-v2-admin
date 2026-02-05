'use client'

import { useMemo } from 'react'
import { AlertTriangle, Clock, TrendingDown, CheckCircle2, Zap } from 'lucide-react'
import {
  getAllBlockers,
  getCriticalBlockers,
  getBlockersByStatus,
  getBlockerSummary,
  analyzeBlockerImpact,
  getEscalatedBlockers,
  getBlockersNearingDeadline,
  getDaysUntilDeadline,
  type Blocker,
} from '@/lib/blockers'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SeverityBadge } from '@/components/ui/severity-badge'
import { SimpleStatusBadge } from '@/components/ui/status-badge'
import { CategoryBadge } from '@/components/ui/category-badge'

interface BlockerCardProps {
  blocker: Blocker
  showImpact?: boolean
}

function BlockerCard({ blocker, showImpact = false }: BlockerCardProps) {
  const impact = showImpact ? analyzeBlockerImpact(blocker.id) : null

  return (
    <Card
      className="p-4"
      style={
        blocker.severity === 'critical'
          ? { borderColor: 'var(--status-error-border)', backgroundColor: 'var(--status-error-bg)' }
          : blocker.status === 'escalated'
            ? {
                borderColor: 'var(--status-warning-border)',
                backgroundColor: 'var(--status-warning-bg)',
              }
            : {}
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground leading-tight">{blocker.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{blocker.description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <SeverityBadge severity={blocker.severity} />
            <SimpleStatusBadge status={blocker.status} />
          </div>
        </div>

        {/* Category and Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <CategoryBadge category={blocker.category} />
          {blocker.owner && <span className="text-muted-foreground">Owner: {blocker.owner}</span>}
          <span className="text-muted-foreground text-xs">
            Created: {blocker.createdAt.toLocaleDateString()}
          </span>
        </div>

        {/* Analysis */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs font-semibold mb-1">
              Root Cause
            </span>
            <p className="text-foreground text-xs">{blocker.rootCause}</p>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs font-semibold mb-1">
              Proposed Solution
            </span>
            <p className="text-foreground text-xs">{blocker.proposedSolution}</p>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs font-semibold mb-1">
              Affected Components
            </span>
            <p className="text-foreground">{blocker.affectedComponents.length}</p>
            <p className="text-xs text-muted-foreground">{blocker.affectedComponents.join(', ')}</p>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs font-semibold mb-1">
              Impacted Phases
            </span>
            <p className="text-foreground">{blocker.impactedPhases.length} phase(s)</p>
          </div>
        </div>

        {/* Detailed Impact if requested */}
        {showImpact && impact && (
          <div
            className="p-3 rounded space-y-2 border"
            style={{
              backgroundColor: 'var(--status-info-bg)',
              borderColor: 'var(--status-info-border)',
            }}
          >
            <div className="flex items-start gap-2">
              <TrendingDown
                className="h-4 w-4 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--status-info)' }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--status-info)' }}>
                  Impact Analysis
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--status-info)' }}>
                  {impact.riskIfUnresolved}
                </p>
                <div
                  className="grid grid-cols-2 gap-2 mt-2 text-xs"
                  style={{ color: 'var(--status-info)' }}
                >
                  <div>Estimated Cost: {impact.estimatedCost}</div>
                  <div>Delay: {impact.delayInDays} days</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
          {blocker.resolutionDeadline && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <span className="text-muted-foreground">Deadline: </span>
                <span className="font-semibold text-foreground">
                  {blocker.resolutionDeadline.toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
          {blocker.estimatedResolutionDays && (
            <div className="text-sm">
              <span className="text-muted-foreground">Est. Resolution: </span>
              <span className="font-semibold text-foreground">
                {blocker.estimatedResolutionDays} days
              </span>
            </div>
          )}
        </div>

        {/* Escalation Info */}
        {blocker.status === 'escalated' && (
          <div
            className="p-3 rounded border"
            style={{
              backgroundColor: 'var(--status-warning-bg)',
              borderColor: 'var(--status-warning-border)',
            }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--status-warning)' }}>
              Escalated
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--status-warning)' }}>
              Escalated to {blocker.escalatedTo} ({blocker.escalationLevel})
              {blocker.escalatedAt && ` on ${blocker.escalatedAt.toLocaleDateString()}`}
            </p>
          </div>
        )}

        {/* Resolution */}
        {blocker.status === 'resolved' && blocker.resolution && (
          <div
            className="p-3 rounded border"
            style={{
              backgroundColor: 'var(--status-success-bg)',
              borderColor: 'var(--status-success-border)',
            }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--status-success)' }}>
              Resolved
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--status-success)' }}>
              {blocker.resolution}
            </p>
            {blocker.resolvedAt && (
              <p className="text-xs mt-1" style={{ color: 'var(--status-success)' }}>
                Resolved on {blocker.resolvedAt.toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export function BlockersTab() {
  const allBlockers = useMemo(() => getAllBlockers(), [])
  const summary = useMemo(() => getBlockerSummary(), [])
  const criticalBlockers = useMemo(() => getCriticalBlockers(), [])
  const escalatedBlockers = useMemo(() => getEscalatedBlockers(), [])
  const nearingDeadline = useMemo(() => getBlockersNearingDeadline(2), [])

  const openBlockers = useMemo(() => getBlockersByStatus('open'), [])
  const inProgressBlockers = useMemo(() => getBlockersByStatus('in-progress'), [])
  const resolvedBlockers = useMemo(() => getBlockersByStatus('resolved'), [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Blocker Tracking Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor migration blockers, impact analysis, and escalation paths
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card
            className="p-3"
            style={
              summary.critical > 0
                ? {
                    borderColor: 'var(--status-error-border)',
                    backgroundColor: 'var(--status-error-bg)',
                  }
                : {}
            }
          >
            <div className="text-xs text-muted-foreground font-semibold">Critical</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--status-error)' }}>
              {summary.critical}
            </div>
          </Card>

          <Card
            className="p-3"
            style={
              summary.high > 0
                ? {
                    borderColor: 'var(--status-warning-border)',
                    backgroundColor: 'var(--status-warning-bg)',
                  }
                : {}
            }
          >
            <div className="text-xs text-muted-foreground font-semibold">High</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--status-warning)' }}>
              {summary.high}
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-xs text-muted-foreground font-semibold">Open</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--status-error)' }}>
              {summary.open}
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-xs text-muted-foreground font-semibold">In Progress</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--status-info)' }}>
              {summary.total - summary.open - summary.escalated - summary.resolved}
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-xs text-muted-foreground font-semibold">Escalated</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--status-warning)' }}>
              {summary.escalated}
            </div>
          </Card>

          <Card
            className="p-3"
            style={{
              backgroundColor: 'var(--status-success-bg)',
              borderColor: 'var(--status-success-border)',
            }}
          >
            <div className="text-xs text-muted-foreground font-semibold">Resolved</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>
              {summary.resolved}
            </div>
          </Card>
        </div>
      </div>

      {/* Alert Sections */}
      {criticalBlockers.length > 0 && (
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: 'var(--status-error-bg)',
            borderColor: 'var(--status-error-border)',
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="h-5 w-5 flex-shrink-0 mt-0.5"
              style={{ color: 'var(--status-error)' }}
            />
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--status-error)' }}>
                {criticalBlockers.length} Critical Blocker(s)
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--status-error)' }}>
                Immediate action required to prevent project delays
              </p>
            </div>
          </div>
        </div>
      )}

      {nearingDeadline.length > 0 && (
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: 'var(--status-warning-bg)',
            borderColor: 'var(--status-warning-border)',
          }}
        >
          <div className="flex items-start gap-3">
            <Clock
              className="h-5 w-5 flex-shrink-0 mt-0.5"
              style={{ color: 'var(--status-warning)' }}
            />
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--status-warning)' }}>
                {nearingDeadline.length} Blocker(s) Nearing Deadline
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--status-warning)' }}>
                Resolution deadlines within 2 days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All
            <span className="ml-2 text-xs bg-foreground/10 px-2 py-0.5 rounded-full">
              {allBlockers.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="open">
            Open
            {summary.open > 0 && (
              <span
                className="ml-2 text-xs text-white px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--status-error)' }}
              >
                {summary.open}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="escalated">
            Escalated
            {summary.escalated > 0 && (
              <span
                className="ml-2 text-xs text-white px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--status-warning)' }}
              >
                {summary.escalated}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        {/* All Blockers */}
        <TabsContent value="all" className="space-y-4 mt-4">
          {allBlockers.length > 0 ? (
            allBlockers.map((blocker) => (
              <BlockerCard key={blocker.id} blocker={blocker} showImpact={true} />
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle2
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: 'var(--status-success)' }}
              />
              <h3 className="text-lg font-semibold text-foreground mb-1">No Blockers</h3>
              <p className="text-muted-foreground">All identified blockers have been resolved</p>
            </div>
          )}
        </TabsContent>

        {/* Open Blockers */}
        <TabsContent value="open" className="space-y-4 mt-4">
          {openBlockers.length > 0 ? (
            openBlockers.map((blocker) => (
              <BlockerCard key={blocker.id} blocker={blocker} showImpact />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No open blockers</p>
            </Card>
          )}
        </TabsContent>

        {/* Escalated Blockers */}
        <TabsContent value="escalated" className="space-y-4 mt-4">
          {escalatedBlockers.length > 0 ? (
            escalatedBlockers.map((blocker) => (
              <BlockerCard key={blocker.id} blocker={blocker} showImpact />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No escalated blockers</p>
            </Card>
          )}
        </TabsContent>

        {/* In Progress */}
        <TabsContent value="inprogress" className="space-y-4 mt-4">
          {inProgressBlockers.length > 0 ? (
            inProgressBlockers.map((blocker) => <BlockerCard key={blocker.id} blocker={blocker} />)
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No blockers currently being resolved</p>
            </Card>
          )}
        </TabsContent>

        {/* Resolved */}
        <TabsContent value="resolved" className="space-y-4 mt-4">
          {resolvedBlockers.length > 0 ? (
            resolvedBlockers.map((blocker) => <BlockerCard key={blocker.id} blocker={blocker} />)
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No resolved blockers yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Section */}
      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Resolution Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs font-semibold mb-2">
              Active Blockers
            </span>
            <div className="text-3xl font-bold text-foreground">{summary.activeBlockers}</div>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs font-semibold mb-2">
              Avg Resolution Time
            </span>
            <div className="text-3xl font-bold text-foreground">{summary.avgResolutionDays}d</div>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs font-semibold mb-2">
              Resolution Rate
            </span>
            <div className="text-3xl font-bold" style={{ color: 'var(--status-success)' }}>
              {summary.total > 0 ? Math.round((summary.resolved / summary.total) * 100) : 0}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
