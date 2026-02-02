'use client'

import { useMemo } from 'react'
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, AlertCircle, Target } from 'lucide-react'
import {
  getMockMigrationData,
  calculateOverallProgress,
  getTimelineEstimate,
  getRiskSummary,
  getBlockerSummary,
  getCriticalPath,
} from '@/lib/migration-tracker'
import { Card } from '@/components/ui/card'

interface ProgressBarProps {
  progress: number
  label?: string
  showLabel?: boolean
}

function ProgressBar({ progress, label, showLabel = true }: ProgressBarProps) {
  const getColor = (percent: number) => {
    if (percent >= 75) return 'bg-green-500'
    if (percent >= 50) return 'bg-blue-500'
    if (percent >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-sm font-semibold text-primary">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${getColor(progress)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  subtext?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'stable'
  highlight?: boolean
}

function MetricCard({ title, value, subtext, icon, trend, highlight }: MetricCardProps) {
  return (
    <Card className={`p-4 ${highlight ? 'border-primary/50 bg-primary/5' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-primary/60">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <TrendingUp
            className={`h-4 w-4 ${
              trend === 'up'
                ? 'text-green-500'
                : trend === 'down'
                  ? 'text-red-500'
                  : 'text-muted-foreground'
            }`}
          />
        )}
      </div>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </Card>
  )
}

export function StatusDashboardTab() {
  const { phases, risks } = getMockMigrationData()

  const metrics = useMemo(() => {
    const overallProgress = calculateOverallProgress(phases)
    const timeline = getTimelineEstimate(phases)
    const riskSummary = getRiskSummary(risks)
    const blockerSummary = getBlockerSummary(phases)
    const criticalPath = getCriticalPath(phases)

    // Prepare progress data for chart
    const progressData = phases.map((phase) => ({
      name: phase.name.substring(0, 12),
      progress: phase.progress,
      target: 100,
    }))

    // Prepare timeline data
    const timelineData = phases.flatMap((phase) =>
      phase.components
        .filter((comp) => comp.startDate)
        .map((comp) => ({
          date: comp.startDate?.toLocaleDateString() || '',
          completed: comp.status === 'completed' ? 1 : 0,
          inProgress: comp.status === 'in-progress' ? 1 : 0,
          pending: comp.status === 'pending' ? 1 : 0,
        }))
    )

    return {
      overallProgress,
      timeline,
      riskSummary,
      blockerSummary,
      criticalPath,
      progressData,
      timelineData: timelineData.slice(0, 10), // Last 10 data points
    }
  }, [phases, risks])

  const completedPhases = phases.filter((p) => p.status === 'completed').length
  const inProgressPhases = phases.filter((p) => p.status === 'in-progress').length

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Migration Progress Dashboard</h2>
          <p className="text-muted-foreground">
            Track overall progress, timeline, and risks across all migration phases
          </p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Overall Progress"
            value={`${metrics.overallProgress}%`}
            subtext="All phases combined"
            icon={<Target className="h-4 w-4" />}
            trend="up"
            highlight
          />
          <MetricCard
            title="Completed Phases"
            value={`${completedPhases}/${phases.length}`}
            subtext="Fully finished"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <MetricCard
            title="Timeline"
            value={`${metrics.timeline.remainingDays}d`}
            subtext={metrics.timeline.completionDate.toLocaleDateString()}
            icon={<Clock className="h-4 w-4" />}
          />
          <MetricCard
            title="Critical Risks"
            value={metrics.riskSummary.critical + metrics.riskSummary.high}
            subtext={`${metrics.riskSummary.critical} critical`}
            icon={<AlertTriangle className="h-4 w-4" />}
            highlight={metrics.riskSummary.critical > 0 || metrics.riskSummary.high > 1}
          />
          <MetricCard
            title="Blockers"
            value={metrics.blockerSummary.totalBlockers}
            subtext={`${metrics.blockerSummary.affectedComponents.length} components affected`}
            icon={<AlertCircle className="h-4 w-4" />}
            highlight={metrics.blockerSummary.totalBlockers > 0}
          />
        </div>
      </div>

      {/* Overall Progress Bar */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Migration Status</h3>
        <ProgressBar progress={metrics.overallProgress} showLabel={false} />
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-green-600">{completedPhases} Completed</div>
            <div className="text-muted-foreground text-xs">phases finished</div>
          </div>
          <div>
            <div className="font-semibold text-blue-600">{inProgressPhases} In Progress</div>
            <div className="text-muted-foreground text-xs">phases active</div>
          </div>
          <div>
            <div className="font-semibold text-yellow-600">
              {phases.length - completedPhases - inProgressPhases} Pending
            </div>
            <div className="text-muted-foreground text-xs">phases queued</div>
          </div>
        </div>
      </Card>

      {/* Phase Progress Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Progress by Phase</h3>
        <div className="space-y-4">
          {metrics.progressData.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-primary font-semibold">{item.progress}%</span>
              </div>
              <div className="flex gap-1">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <div className="w-12 h-2 bg-muted/50 rounded-full flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Phase Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {phases.map((phase) => (
          <Card key={phase.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{phase.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {phase.components.length} components
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    phase.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : phase.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {phase.status.charAt(0).toUpperCase() + phase.status.slice(1).replace('-', ' ')}
                </div>
              </div>

              <ProgressBar progress={phase.progress} label="Phase Progress" />

              <div className="space-y-2 text-sm">
                {phase.startDate && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Started:</span>
                    <span>{phase.startDate.toLocaleDateString()}</span>
                  </div>
                )}
                {phase.completedDate && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Completed:</span>
                    <span>{phase.completedDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Component Summary */}
              <div className="pt-2 border-t">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {phase.components.filter((c) => c.status === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">
                      {phase.components.filter((c) => c.status === 'in-progress').length}
                    </div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-600">
                      {
                        phase.components.filter(
                          (c) => c.status === 'pending' || c.status === 'blocked'
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Critical Path */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Critical Path</h3>
        </div>
        <div className="space-y-2">
          {metrics.criticalPath.length > 0 ? (
            metrics.criticalPath.slice(0, 8).map((comp) => (
              <div
                key={comp.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium text-foreground">{comp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {comp.dependencies.length > 0 &&
                      `Depends on: ${comp.dependencies.length} tasks`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">{comp.progress}%</div>
                  <div className="text-xs text-muted-foreground capitalize">{comp.status}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No critical path items identified</p>
          )}
        </div>
      </Card>
    </div>
  )
}
