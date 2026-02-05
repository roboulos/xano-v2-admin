'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, Circle, AlertCircle, Lock, Zap } from 'lucide-react'
import {
  getAllPhases,
  getPhaseProgress,
  getCriticalPath,
  getOverallCompletion,
  getBlockedItems,
  getPhaseSignOff,
  canSignOffPhase,
  type ChecklistItem,
  type Phase,
} from '@/lib/checklists'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { AlertBanner } from '@/components/ui/alert-banner'

function ChecklistItemRow({
  item,
  isBlocked,
  depth = 0,
}: {
  item: ChecklistItem
  isBlocked: boolean
  depth?: number
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div
        className="p-3 border-b hover:bg-muted/50 transition-colors"
        style={{
          paddingLeft: `${12 + depth * 20}px`,
          ...(isBlocked ? { opacity: 0.6, backgroundColor: 'var(--status-error-bg)' } : {}),
        }}
      >
        <div className="flex items-start gap-3">
          <div className="pt-1">
            {item.completed ? (
              <CheckCircle2
                className="h-5 w-5 flex-shrink-0"
                style={{ color: 'var(--status-success)' }}
              />
            ) : isBlocked ? (
              <Lock className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--status-error)' }} />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1">
                <h4
                  className={`font-medium text-sm ${
                    item.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}
                >
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={item.priority} />
                {item.subItems && item.subItems.length > 0 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              {item.completedAt && <span>Completed: {item.completedAt.toLocaleDateString()}</span>}
              {item.completedBy && <span>by {item.completedBy}</span>}
              {!item.completed && item.assignee && <span>Assigned to: {item.assignee}</span>}
              {item.estimatedHours && <span className="ml-auto">~{item.estimatedHours}h</span>}
            </div>

            {item.notes && (
              <div
                className="mt-2 p-2 rounded text-xs border"
                style={{
                  backgroundColor: 'var(--status-info-bg)',
                  borderColor: 'var(--status-info-border)',
                  color: 'var(--status-info)',
                }}
              >
                {item.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Sub-Items */}
      {expanded && item.subItems && item.subItems.length > 0 && (
        <>
          {item.subItems.map((subItem) => (
            <ChecklistItemRow key={subItem.id} item={subItem} isBlocked={false} depth={depth + 1} />
          ))}
        </>
      )}
    </>
  )
}

function PhaseCard({ phase }: { phase: Phase }) {
  const progress = getPhaseProgress(phase)
  const signOff = getPhaseSignOff(phase.id)
  const canSignOff = canSignOffPhase(phase.id)
  const completedItems = phase.items.filter((i) => i.completed).length

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-muted/50 border-b">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{phase.name}</h3>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                Phase {phase.order}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{phase.description}</p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor:
                phase.status === 'completed'
                  ? 'var(--status-success-bg)'
                  : phase.status === 'in-progress'
                    ? 'var(--status-info-bg)'
                    : 'var(--status-pending-bg)',
              color:
                phase.status === 'completed'
                  ? 'var(--status-success)'
                  : phase.status === 'in-progress'
                    ? 'var(--status-info)'
                    : 'var(--status-pending)',
            }}
          >
            {phase.status.charAt(0).toUpperCase() + phase.status.slice(1).replace('-', ' ')}
          </div>
        </div>

        <div className="space-y-2">
          <ProgressBar value={progress} label="Progress" />
          <div className="text-xs text-muted-foreground">
            {completedItems} of {phase.items.length} items completed
          </div>
        </div>
      </div>

      <div className="border-b">
        {phase.items.map((item) => (
          <ChecklistItemRow key={item.id} item={item} isBlocked={false} />
        ))}
      </div>

      <div className="p-4 bg-muted/30 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          {phase.startDate && (
            <div>
              <span className="text-muted-foreground text-xs">Started</span>
              <div className="font-semibold text-foreground">
                {phase.startDate.toLocaleDateString()}
              </div>
            </div>
          )}
          {phase.estimatedCompletion && (
            <div>
              <span className="text-muted-foreground text-xs">Est. Completion</span>
              <div className="font-semibold text-foreground">
                {phase.estimatedCompletion.toLocaleDateString()}
              </div>
            </div>
          )}
          {phase.completedDate && (
            <div>
              <span className="text-muted-foreground text-xs">Completed</span>
              <div className="font-semibold" style={{ color: 'var(--status-success)' }}>
                {phase.completedDate.toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {signOff && (
          <div
            className="p-3 rounded border"
            style={{
              backgroundColor: 'var(--status-success-bg)',
              borderColor: 'var(--status-success-border)',
            }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--status-success)' }}>
              Sign-Off Approved
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--status-success)' }}>
              Signed by {signOff.signedBy} on {signOff.signedAt.toLocaleDateString()}
            </p>
            {signOff.notes && (
              <p className="text-xs mt-1 italic" style={{ color: 'var(--status-success)' }}>
                {signOff.notes}
              </p>
            )}
          </div>
        )}

        {!signOff && canSignOff && (
          <button
            className="w-full px-4 py-2 text-white rounded text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--status-success)' }}
          >
            Sign Off Phase
          </button>
        )}

        {!signOff && !canSignOff && phase.status === 'in-progress' && (
          <div
            className="p-3 rounded border"
            style={{
              backgroundColor: 'var(--status-warning-bg)',
              borderColor: 'var(--status-warning-border)',
            }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--status-warning)' }}>
              Cannot sign off - {phase.items.filter((i) => !i.completed).length} items remaining
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export function ChecklistTab() {
  const phases = useMemo(() => getAllPhases(), [])
  const criticalPath = useMemo(() => getCriticalPath(), [])
  const overallCompletion = useMemo(() => getOverallCompletion(), [])
  const blockedItems = useMemo(() => getBlockedItems(), [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Migration Checklist</h2>
          <p className="text-muted-foreground">
            Phase-based tracking with critical path visualization and sign-off workflow
          </p>
        </div>

        {/* Blocked Items Alert */}
        {blockedItems.length > 0 && (
          <AlertBanner
            variant="warning"
            title={`${blockedItems.length} Item(s) Currently Blocked`}
            description="These items are waiting for dependencies to be resolved before they can proceed."
            icon={Lock}
          />
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-primary/50 bg-primary/5">
            <div className="text-sm text-muted-foreground mb-1">Overall Progress</div>
            <div className="text-3xl font-bold text-primary">{overallCompletion}%</div>
            <ProgressBar value={overallCompletion} showPercentage={false} className="mt-3" />
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Phases Completed</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--status-success)' }}>
              {phases.filter((p) => p.status === 'completed').length}/{phases.length}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Critical Path</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--status-warning)' }}>
              {criticalPath.estimatedDaysToCompletion}d
            </div>
            <div className="text-xs text-muted-foreground mt-1">Est. completion time</div>
          </Card>

          <Card
            className="p-4"
            style={
              blockedItems.length > 0
                ? {
                    borderColor: 'var(--status-error-border)',
                    backgroundColor: 'var(--status-error-bg)',
                  }
                : {}
            }
          >
            <div className="text-sm text-muted-foreground mb-1">Blocked Items</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--status-error)' }}>
              {blockedItems.length}
            </div>
            {blockedItems.length > 0 && (
              <div className="text-xs mt-1" style={{ color: 'var(--status-error)' }}>
                Requiring attention
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="phases" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phases">Phase Checklists</TabsTrigger>
          <TabsTrigger value="critical">
            Critical Path
            <span
              className="ml-2 text-xs text-white px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--status-warning)' }}
            >
              {criticalPath.items.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="blocked">
            Blocked Items
            {blockedItems.length > 0 && (
              <span
                className="ml-2 text-xs text-white px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--status-error)' }}
              >
                {blockedItems.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Phases Tab */}
        <TabsContent value="phases" className="space-y-6 mt-6">
          {phases.map((phase) => (
            <PhaseCard key={phase.id} phase={phase} />
          ))}
        </TabsContent>

        {/* Critical Path Tab */}
        <TabsContent value="critical" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: 'var(--status-warning-bg)',
                borderColor: 'var(--status-warning-border)',
              }}
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  style={{ color: 'var(--status-warning)' }}
                />
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--status-warning)' }}>
                    Critical Path Analysis
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--status-warning)' }}>
                    {criticalPath.items.length} items on critical path requiring{' '}
                    {criticalPath.estimatedDaysToCompletion} days to completion
                  </p>
                </div>
              </div>
            </div>

            {criticalPath.bottlenecks.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" style={{ color: 'var(--status-warning)' }} />
                  Bottlenecks
                </h4>
                <div className="space-y-3">
                  {criticalPath.bottlenecks.map((item) => (
                    <div key={item.id} className="p-3 bg-muted/50 rounded">
                      <p className="font-medium text-sm text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Blocks multiple downstream items
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {criticalPath.parallelizableGroups.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" style={{ color: 'var(--status-info)' }} />
                  Parallelizable Work
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  These items can be worked on simultaneously to accelerate completion
                </p>
                <div className="space-y-3">
                  {criticalPath.parallelizableGroups.map((group, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded border"
                      style={{
                        backgroundColor: 'var(--status-info-bg)',
                        borderColor: 'var(--status-info-border)',
                      }}
                    >
                      <p
                        className="text-xs font-semibold mb-2"
                        style={{ color: 'var(--status-info)' }}
                      >
                        Parallel Group {idx + 1}
                      </p>
                      <div className="space-y-1">
                        {group.map((item) => (
                          <p
                            key={item.id}
                            className="text-sm"
                            style={{ color: 'var(--status-info)' }}
                          >
                            • {item.title}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-3">All Critical Items</h4>
              <div className="space-y-2">
                {criticalPath.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Estimated: {item.estimatedHours}h
                        </p>
                      </div>
                      <PriorityBadge priority={item.priority} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Blocked Items Tab */}
        <TabsContent value="blocked" className="mt-6">
          {blockedItems.length > 0 ? (
            <div className="space-y-4">
              <div
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: 'var(--status-error-bg)',
                  borderColor: 'var(--status-error-border)',
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--status-error)' }}
                  />
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--status-error)' }}>
                      {blockedItems.length} Items Blocked
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--status-error)' }}>
                      These items are waiting for dependencies to be completed
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {blockedItems.map((item) => (
                  <Card
                    key={item.id}
                    className="p-4"
                    style={{
                      borderColor: 'var(--status-error-border)',
                      backgroundColor: 'var(--status-error-bg)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Lock
                        className="h-5 w-5 flex-shrink-0 mt-0.5"
                        style={{ color: 'var(--status-error)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <div className="mt-2 text-sm">
                          <p className="text-muted-foreground font-semibold">Blocked by:</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--status-error)' }}>
                            {item.dependencies.length} incomplete dependencies
                          </p>
                        </div>
                      </div>
                      <PriorityBadge priority={item.priority} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: 'var(--status-success)' }}
              />
              <h3 className="text-lg font-semibold text-foreground mb-1">No Blocked Items</h3>
              <p className="text-muted-foreground">
                All items are either completed or ready to start
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
