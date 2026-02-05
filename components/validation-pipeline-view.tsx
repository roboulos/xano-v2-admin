'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Database,
  Code,
  Globe,
  Link as LinkIcon,
  RefreshCw,
  Download,
} from 'lucide-react'
import { AlertBanner } from '@/components/ui/alert-banner'
import { LoadingState } from '@/components/ui/loading-state'
import { ExportDropdown } from '@/components/export-dropdown'
import { exportSummaryToPDF } from '@/lib/exporters'
import { formatRelativeTime } from '@/lib/utils'
import type { ValidationConfig, ValidationStage } from '@/validation.config'

interface StageResult {
  stageId: string
  success: boolean
  startTime: Date
  endTime?: Date
  duration?: number
  report?: any
  error?: string
  meetsSuccessCriteria: boolean
}

interface PipelineStatus {
  running: boolean
  currentStage?: string
  completedStages: string[]
  results: Record<string, StageResult>
}

const ICON_MAP = {
  database: Database,
  code: Code,
  globe: Globe,
  link: LinkIcon,
}

function StageCard({
  stage,
  status,
  result,
  onRun,
}: {
  stage: ValidationStage
  status: PipelineStatus
  result?: StageResult
  onRun: () => void
}) {
  const Icon = ICON_MAP[stage.icon as keyof typeof ICON_MAP] || Database

  const isRunning = status.running && status.currentStage === stage.id
  const isComplete = status.completedStages.includes(stage.id)
  const canRun =
    !status.running && stage.dependencies.every((dep) => status.completedStages.includes(dep))

  const getStatusBadge = () => {
    if (isRunning) return <Badge className="bg-blue-500">Running</Badge>
    if (isComplete && result?.meetsSuccessCriteria)
      return <Badge className="bg-green-500">✓ Passed</Badge>
    if (isComplete && !result?.meetsSuccessCriteria)
      return <Badge className="bg-red-500">✗ Failed</Badge>
    if (canRun) return <Badge variant="outline">Ready</Badge>
    return <Badge variant="secondary">Waiting</Badge>
  }

  const getProgress = () => {
    if (!result?.report?.summary) return 0
    const { passed, total } = result.report.summary
    return (passed / total) * 100
  }

  return (
    <Card
      className={
        isRunning
          ? 'border-2 border-blue-500 shadow-lg'
          : isComplete && result?.meetsSuccessCriteria
            ? 'border-2 border-green-500 shadow-md'
            : isComplete && !result?.meetsSuccessCriteria
              ? 'border-2 border-red-500 shadow-md'
              : 'border'
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isComplete && result?.meetsSuccessCriteria ? 'bg-green-100' : isComplete && !result?.meetsSuccessCriteria ? 'bg-red-100' : isRunning ? 'bg-blue-100' : 'bg-muted'}`}
            >
              <Icon
                className={`h-5 w-5 ${isComplete && result?.meetsSuccessCriteria ? 'text-green-700' : isComplete && !result?.meetsSuccessCriteria ? 'text-red-700' : isRunning ? 'text-blue-700' : 'text-muted-foreground'}`}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{stage.name}</CardTitle>
              <CardDescription>{stage.description}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">
              {result?.report?.summary?.total || stage.metrics.total}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Target</div>
            <div className="text-2xl font-bold text-green-600">{stage.metrics.target}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Threshold</div>
            <div className="text-2xl font-bold text-orange-600">{stage.metrics.threshold}</div>
          </div>
        </div>

        {/* Progress */}
        {result?.report && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>
                {result.report.summary.passed}/{result.report.summary.total} (
                {result.report.summary.passRate}%)
              </span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}

        {/* Business Context */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">Business Value:</span>
            <p className="text-muted-foreground mt-1">{stage.businessValue}</p>
          </div>
          <div>
            <span className="font-semibold">Success Criteria:</span>
            <p className="text-muted-foreground mt-1">{stage.successCriteria}</p>
          </div>
          {stage.dependencies.length > 0 && (
            <div>
              <span className="font-semibold">Dependencies:</span>
              <div className="flex gap-2 mt-1">
                {stage.dependencies.map((dep) => (
                  <Badge
                    key={dep}
                    variant={status.completedStages.includes(dep) ? 'default' : 'secondary'}
                  >
                    {status.completedStages.includes(dep) ? '✓' : '○'} {dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {stage.blockers.length > 0 && (
            <div>
              <span className="font-semibold">Blockers:</span>
              <p className="text-muted-foreground mt-1">{stage.blockers.join(', ')}</p>
            </div>
          )}
        </div>

        {/* Duration */}
        {result?.duration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Duration: {Math.round(result.duration / 1000)}s (est. {stage.estimatedDuration}s)
            </span>
          </div>
        )}

        {/* Error */}
        {result?.error && (
          <AlertBanner variant="critical" title="Validation Error" description={result.error} />
        )}

        {/* Actions */}
        <Button onClick={onRun} disabled={!canRun || isRunning} className="w-full">
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running...
            </>
          ) : isComplete ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-run
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Validation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export function ValidationPipelineView() {
  const [config, setConfig] = useState<ValidationConfig | null>(null)
  const [status, setStatus] = useState<PipelineStatus>({
    running: false,
    completedStages: [],
    results: {},
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/validation/pipeline')
      const data = await response.json()
      setConfig(data.config)
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }, [])

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch('/api/validation/reports')
      const data = await response.json()

      if (data.reports) {
        const newResults: Record<string, StageResult> = {}

        // Map reports to stage results
        Object.entries(data.reports).forEach(([type, report]: [string, any]) => {
          if (report) {
            newResults[type] = {
              stageId: type,
              success: report.summary.passRate >= 95,
              startTime: new Date(report.timestamp),
              report,
              meetsSuccessCriteria: report.summary.passRate >= 95,
            }
          }
        })

        setStatus((prev) => ({
          ...prev,
          results: newResults,
          completedStages: Object.keys(newResults),
        }))
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/validation/status')
      const data = await response.json()

      setStatus((prev) => ({
        ...prev,
        running: data.running,
        currentStage: data.currentStage,
      }))
    } catch (error) {
      console.error('Failed to check status:', error)
    }
  }, [])

  const runStage = async (stageId: string) => {
    try {
      setStatus((prev) => ({ ...prev, running: true, currentStage: stageId }))

      const response = await fetch('/api/validation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: stageId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      // Poll for completion
      const pollInterval = setInterval(async () => {
        await checkStatus()
        await fetchReports()
      }, 2000)

      // Stop polling after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 300000)
    } catch (error: any) {
      alert(`Failed to run stage: ${error.message}`)
      setStatus((prev) => ({ ...prev, running: false, currentStage: undefined }))
    }
  }

  const runFullPipeline = async () => {
    try {
      setStatus((prev) => ({ ...prev, running: true }))

      const response = await fetch('/api/validation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      // Poll for completion
      const pollInterval = setInterval(async () => {
        await checkStatus()
        await fetchReports()
      }, 5000)

      // Stop polling after 30 minutes
      setTimeout(() => clearInterval(pollInterval), 1800000)
    } catch (error: any) {
      alert(`Failed to run pipeline: ${error.message}`)
      setStatus((prev) => ({ ...prev, running: false }))
    }
  }

  useEffect(() => {
    fetchConfig()
    fetchReports()
    checkStatus()

    const interval = setInterval(() => {
      checkStatus()
      if (status.running) {
        fetchReports()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchConfig, fetchReports, checkStatus, status.running])

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingState size="lg" message="Loading validation pipeline..." />
      </div>
    )
  }

  const overallScore =
    config.stages.reduce((acc, stage) => {
      const result = status.results[stage.id]
      if (result?.report?.summary) {
        return acc + result.report.summary.passRate
      }
      return acc
    }, 0) / config.stages.length

  const meetsCriteria =
    overallScore >= config.overallSuccessCriteria.minimumScore &&
    config.overallSuccessCriteria.criticalStagesMustPass.every(
      (id) => status.results[id]?.meetsSuccessCriteria
    )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{config.name}</h2>
            <p className="text-muted-foreground">{config.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Last updated: {formatRelativeTime(lastUpdated)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchReports()
                checkStatus()
              }}
              disabled={loading || status.running}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const sections = [
                  {
                    title: 'Overall Score',
                    content: [
                      `Score: ${overallScore.toFixed(1)}%`,
                      `Minimum Required: ${config.overallSuccessCriteria.minimumScore}%`,
                      `Status: ${meetsCriteria ? 'Production Ready' : 'Not Ready'}`,
                    ],
                  },
                  {
                    title: 'Business Context',
                    content: [
                      `Purpose: ${config.businessContext.purpose}`,
                      `Timeline: ${config.businessContext.timeline}`,
                      `Stakeholders: ${config.businessContext.stakeholders.join(', ')}`,
                      `Risks: ${config.businessContext.risks.join('; ')}`,
                    ],
                  },
                  ...config.stages.map((stage) => {
                    const result = status.results[stage.id]
                    return {
                      title: `Stage: ${stage.name}`,
                      content: [
                        `Status: ${result ? (result.meetsSuccessCriteria ? 'Passed' : 'Failed') : 'Not Run'}`,
                        `Business Value: ${stage.businessValue}`,
                        `Success Criteria: ${stage.successCriteria}`,
                        result?.report ? `Progress: ${result.report.summary.passRate}%` : '',
                        result?.report
                          ? `Passed: ${result.report.summary.passed}/${result.report.summary.total}`
                          : '',
                        result?.duration ? `Duration: ${Math.round(result.duration / 1000)}s` : '',
                      ].filter(Boolean),
                    }
                  }),
                ]

                exportSummaryToPDF(
                  sections,
                  `validation-pipeline-report_${new Date().toISOString().slice(0, 10)}.pdf`,
                  config.name,
                  {
                    title: config.name,
                    timestamp: new Date(),
                    totalRecords: config.stages.length,
                  }
                )
              }}
              disabled={loading || !config}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Overall Migration Score</CardTitle>
          <CardDescription>
            Minimum {config.overallSuccessCriteria.minimumScore}% required for production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div
              className={`text-5xl font-bold ${meetsCriteria ? 'text-green-600' : 'text-red-600'}`}
            >
              {overallScore.toFixed(1)}%
            </div>
            {meetsCriteria ? (
              <Badge className="bg-green-500 text-lg px-4 py-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                Production Ready
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-lg px-4 py-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                Not Ready
              </Badge>
            )}
          </div>
          <Progress value={overallScore} className="h-4" />

          <div className="mt-4 flex gap-4">
            <Button onClick={runFullPipeline} disabled={status.running} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Run Full Pipeline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Business Context */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-xl">Business Context</CardTitle>
          <CardDescription>Migration objectives and requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold text-foreground">Purpose:</span>
            <p className="text-muted-foreground mt-1">{config.businessContext.purpose}</p>
          </div>
          <div>
            <span className="font-semibold text-foreground">Stakeholders:</span>
            <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
              {config.businessContext.stakeholders.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-semibold text-foreground">Risks:</span>
            <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
              {config.businessContext.risks.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-semibold text-foreground">Timeline:</span>
            <p className="text-muted-foreground mt-1">{config.businessContext.timeline}</p>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Validation Stages</h2>
        {config.stages.map((stage, index) => (
          <div key={stage.id}>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-semibold text-muted-foreground">Stage {index + 1}</div>
              {stage.criticalPath && <Badge variant="destructive">Critical Path</Badge>}
            </div>
            <StageCard
              stage={stage}
              status={status}
              result={status.results[stage.id]}
              onRun={() => runStage(stage.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
