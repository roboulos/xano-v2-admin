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
      className={`p-4 ${
        blocker.severity === 'critical'
          ? 'border-red-300 bg-red-50'
          : blocker.status === 'escalated'
            ? 'border-orange-300 bg-orange-50'
            : ''
      }`}
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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded space-y-2">
            <div className="flex items-start gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Impact Analysis</p>
                <p className="text-xs text-blue-800 mt-1">{impact.riskIfUnresolved}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-blue-800">
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
          <div className="p-3 bg-orange-50 border border-orange-200 rounded">
            <p className="text-xs font-semibold text-orange-900">Escalated</p>
            <p className="text-xs text-orange-800 mt-1">
              Escalated to {blocker.escalatedTo} ({blocker.escalationLevel})
              {blocker.escalatedAt && ` on ${blocker.escalatedAt.toLocaleDateString()}`}
            </p>
          </div>
        )}

        {/* Resolution */}
        {blocker.status === 'resolved' && blocker.resolution && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-xs font-semibold text-green-900">Resolved</p>
            <p className="text-xs text-green-800 mt-1">{blocker.resolution}</p>
            {blocker.resolvedAt && (
              <p className="text-xs text-green-700 mt-1">
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
          <Card className={`p-3 ${summary.critical > 0 ? 'border-red-300 bg-red-50' : ''}`}>
            <div className="text-xs text-muted-foreground font-semibold">Critical</div>
            <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
          </Card>

          <Card className={`p-3 ${summary.high > 0 ? 'border-orange-300 bg-orange-50' : ''}`}>
            <div className="text-xs text-muted-foreground font-semibold">High</div>
            <div className="text-2xl font-bold text-orange-600">{summary.high}</div>
          </Card>

          <Card className="p-3">
            <div className="text-xs text-muted-foreground font-semibold">Open</div>
            <div className="text-2xl font-bold text-red-600">{summary.open}</div>
          </Card>

          <Card className="p-3">
            <div className="text-xs text-muted-foreground font-semibold">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {summary.total - summary.open - summary.escalated - summary.resolved}
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-xs text-muted-foreground font-semibold">Escalated</div>
            <div className="text-2xl font-bold text-orange-600">{summary.escalated}</div>
          </Card>

          <Card className="p-3 bg-green-50 border-green-300">
            <div className="text-xs text-muted-foreground font-semibold">Resolved</div>
            <div className="text-2xl font-bold text-green-600">{summary.resolved}</div>
          </Card>
        </div>
      </div>

      {/* Alert Sections */}
      {criticalBlockers.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                {criticalBlockers.length} Critical Blocker(s)
              </h3>
              <p className="text-sm text-red-800 mt-1">
                Immediate action required to prevent project delays
              </p>
            </div>
          </div>
        </div>
      )}

      {nearingDeadline.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">
                {nearingDeadline.length} Blocker(s) Nearing Deadline
              </h3>
              <p className="text-sm text-yellow-800 mt-1">Resolution deadlines within 2 days</p>
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
              <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                {summary.open}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="escalated">
            Escalated
            {summary.escalated > 0 && (
              <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
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
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
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
            <div className="text-3xl font-bold text-green-600">
              {summary.total > 0 ? Math.round((summary.resolved / summary.total) * 100) : 0}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
