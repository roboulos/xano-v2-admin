"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  RefreshCw,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Database,
  Zap,
  RotateCcw,
  XCircle,
  Server,
  Cog,
  Trash2,
  Users,
  UserPlus,
  Home,
  DollarSign,
  Network,
  ListPlus,
  SkipForward,
} from "lucide-react"
import { MCP_BASES } from "@/lib/mcp-endpoints"

// The 6 Onboarding Sync Jobs - based on actual V2 WORKERS endpoints
const SYNC_JOBS_CONFIG = [
  {
    id: "team",
    name: "Team Roster Sync",
    endpoint: "/test-rezen-team-roster-sync",
    icon: Users,
    tables: ["team", "team_roster", "team_owners", "team_admins"],
  },
  {
    id: "agent",
    name: "Agent Data Sync",
    endpoint: "/test-function-8051-agent-data",
    icon: UserPlus,
    tables: ["agent", "user"],
  },
  {
    id: "txn",
    name: "Transaction Sync",
    endpoint: "/test-function-8052-txn-sync",
    icon: DollarSign,
    tables: ["transaction", "participant", "paid_participant"],
  },
  {
    id: "listings",
    name: "Listings Sync",
    endpoint: "/test-function-8053-listings-sync",
    icon: Home,
    tables: ["listing"],
  },
  {
    id: "contrib",
    name: "Contributions Sync",
    endpoint: "/test-function-8056-contributions",
    icon: DollarSign,
    tables: ["contribution", "income", "revshare_totals"],
  },
  {
    id: "network",
    name: "Network Sync",
    endpoint: "/test-function-8062-network-downline",
    icon: Network,
    tables: ["network", "connections"],
  },
] as const

// Job types for the queue
type JobStatus = "queued" | "running" | "completed" | "failed"

type SyncJob = {
  id: string
  jobId: string // unique instance id
  name: string
  endpoint: string
  icon: React.ElementType
  tables: readonly string[]
  status: JobStatus
  progress: number
  startedAt?: Date
  completedAt?: Date
  duration?: number
  response?: unknown
  error?: string
}

// System status from V2 backend
interface StagingStatus {
  table: string
  unprocessed_count: number
  total_count: number
}

export function SyncingTab() {
  const [jobs, setJobs] = useState<SyncJob[]>([])
  const [completedJobsList, setCompletedJobsList] = useState<SyncJob[]>([])
  const [failedJobsList, setFailedJobsList] = useState<SyncJob[]>([])
  const [userId, setUserId] = useState<number>(60) // V2 test user: David Keener
  const [stagingStatus, setStagingStatus] = useState<StagingStatus[]>([])
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [lastStatusUpdate, setLastStatusUpdate] = useState<Date | null>(null)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const autoModeRef = useRef(false)
  const isRunningRef = useRef(false)

  const runningJob = jobs.find((j) => j.status === "running")
  const queuedJobs = jobs.filter((j) => j.status === "queued")
  const isProcessing = isAutoMode || !!runningJob

  // Fetch staging status from V2 SYSTEM endpoint
  const fetchStagingStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const response = await fetch(`${MCP_BASES.SYSTEM}/staging-unprocessed`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()

      // Handle different response formats
      if (Array.isArray(data)) {
        setStagingStatus(data)
      } else if (data.data && Array.isArray(data.data)) {
        setStagingStatus(data.data)
      } else if (data.staging_unprocessed) {
        setStagingStatus(data.staging_unprocessed)
      }
      setLastStatusUpdate(new Date())
    } catch (err) {
      console.error("Failed to fetch staging status:", err)
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    fetchStagingStatus()
  }, [fetchStagingStatus])

  // Queue All - add all 6 sync jobs to the queue
  const queueAllJobs = () => {
    const timestamp = Date.now()
    const newJobs: SyncJob[] = SYNC_JOBS_CONFIG.map((config, index) => ({
      id: config.id,
      jobId: `${config.id}-${timestamp}-${index}`,
      name: config.name,
      endpoint: config.endpoint,
      icon: config.icon,
      tables: config.tables,
      status: "queued" as const,
      progress: 0,
    }))
    setJobs(newJobs)
    setCompletedJobsList([])
    setFailedJobsList([])
  }

  // Add a single job to the queue
  const addJobToQueue = (configId: string) => {
    const config = SYNC_JOBS_CONFIG.find((c) => c.id === configId)
    if (!config) return

    const newJob: SyncJob = {
      id: config.id,
      jobId: `${config.id}-${Date.now()}`,
      name: config.name,
      endpoint: config.endpoint,
      icon: config.icon,
      tables: config.tables,
      status: "queued",
      progress: 0,
    }
    setJobs((prev) => [...prev, newJob])
  }

  // Run a queued job (real API call)
  const runJob = useCallback(async (jobId: string) => {
    const job = jobs.find(j => j.jobId === jobId)
    if (!job || isRunningRef.current) return

    isRunningRef.current = true

    // Update to running
    setJobs((prev) =>
      prev.map((j) =>
        j.jobId === jobId
          ? { ...j, status: "running" as const, startedAt: new Date(), progress: 0 }
          : j
      )
    )

    // Animate progress
    const progressInterval = setInterval(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.jobId === jobId && j.status === "running"
            ? { ...j, progress: Math.min(j.progress + 15, 85) }
            : j
        )
      )
    }, 200)

    const startTime = Date.now()

    try {
      const response = await fetch(`${MCP_BASES.WORKERS}${job.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })
      const data = await response.json()
      const duration = Date.now() - startTime

      clearInterval(progressInterval)
      isRunningRef.current = false

      if (data.success !== false) {
        const completedJob: SyncJob = {
          ...job,
          status: "completed",
          progress: 100,
          completedAt: new Date(),
          duration,
          response: data,
        }
        // Move to completed list and remove from queue
        setJobs((prev) => prev.filter((j) => j.jobId !== jobId))
        setCompletedJobsList((prev) => [...prev, completedJob])
      } else {
        throw new Error(data.error || data.message || "Job failed")
      }
    } catch (err) {
      clearInterval(progressInterval)
      isRunningRef.current = false
      const duration = Date.now() - startTime
      const failedJob: SyncJob = {
        ...job,
        status: "failed",
        progress: 0,
        duration,
        error: err instanceof Error ? err.message : "Unknown error",
      }
      // Move to failed list and remove from queue
      setJobs((prev) => prev.filter((j) => j.jobId !== jobId))
      setFailedJobsList((prev) => [...prev, failedJob])
    }
  }, [jobs, userId])

  // Run Next - process the next queued job
  const runNextJob = useCallback(() => {
    const nextJob = queuedJobs[0]
    if (nextJob && !runningJob && !isRunningRef.current) {
      runJob(nextJob.jobId)
    }
  }, [queuedJobs, runningJob, runJob])

  // Retry a failed job
  const retryFailedJob = (job: SyncJob) => {
    setFailedJobsList((prev) => prev.filter((j) => j.jobId !== job.jobId))
    const retryJob: SyncJob = { ...job, status: "queued", error: undefined, progress: 0, jobId: `${job.id}-${Date.now()}` }
    setJobs((prev) => [...prev, retryJob])
  }

  // Clear queue
  const clearQueue = () => {
    setJobs((prev) => prev.filter((j) => j.status === "running"))
  }

  // Reset all
  const resetAll = () => {
    setIsAutoMode(false)
    setCompletedJobsList([])
    setFailedJobsList([])
    setJobs([])
  }

  // Auto mode ref sync
  useEffect(() => {
    autoModeRef.current = isAutoMode
  }, [isAutoMode])

  // Auto mode effect - 2s delay between jobs
  useEffect(() => {
    if (!isAutoMode || runningJob || queuedJobs.length === 0 || isRunningRef.current) return

    const timer = setTimeout(() => {
      if (autoModeRef.current && queuedJobs.length > 0 && !isRunningRef.current) {
        runNextJob()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [isAutoMode, runningJob, queuedJobs.length, runNextJob])

  // Toggle auto mode
  const toggleAutoMode = () => {
    setIsAutoMode((prev) => !prev)
  }

  return (
    <div className="space-y-6">
      {/* Staging Status */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Server className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">V2 Staging Status</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live from {MCP_BASES.SYSTEM}/staging-unprocessed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastStatusUpdate && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastStatusUpdate.toLocaleTimeString()}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={fetchStagingStatus} disabled={isLoadingStatus}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStatus ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stagingStatus.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stagingStatus.map((table) => (
                <div key={table.table} className="bg-muted/30 rounded-lg p-4">
                  <div className="text-lg font-bold">
                    {table.unprocessed_count.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">{table.table}</div>
                  {table.total_count > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      of {table.total_count.toLocaleString()} total
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {isLoadingStatus ? "Loading..." : "No staging records found"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* The Crank - Visual Conveyor Belt */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Cog className={`h-6 w-6 text-amber-600 ${isProcessing ? "animate-spin-gear" : ""}`} />
              </div>
              <div>
                <CardTitle className="text-xl">The Crank</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Visual job queue with conveyor belt
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{queuedJobs.length}</div>
                <div className="text-xs text-muted-foreground">in queue</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{completedJobsList.length}</div>
                <div className="text-xs text-muted-foreground">completed</div>
              </div>
              {failedJobsList.length > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{failedJobsList.length}</div>
                  <div className="text-xs text-muted-foreground">failed</div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* User ID and Queue All Controls */}
          <div className="p-4 border-b bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label htmlFor="sync-userId" className="text-sm font-medium">User ID:</Label>
                <Input
                  id="sync-userId"
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(parseInt(e.target.value) || 60)}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground">V2 Test User: David Keener (60)</span>
              </div>
              <Button
                onClick={queueAllJobs}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ListPlus className="h-4 w-4 mr-2" />
                Queue All (6 Jobs)
              </Button>
            </div>
            {/* Individual Job Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {SYNC_JOBS_CONFIG.map((config) => {
                const Icon = config.icon
                const isQueued = jobs.some(j => j.id === config.id && j.status === "queued")
                return (
                  <Button
                    key={config.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addJobToQueue(config.id)}
                    disabled={isQueued || isProcessing}
                    className={isQueued ? "opacity-50" : ""}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {config.name.replace(" Sync", "")}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Conveyor Belt Visualization */}
          <div className="flex items-stretch min-h-[350px]">
            {/* Queue (Left) */}
            <div className="w-1/3 p-4 bg-muted/30 border-r">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Queue
                </h3>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {queuedJobs.length} jobs
                </Badge>
              </div>
              <div className="space-y-2 max-h-72 overflow-auto">
                {queuedJobs.map((job, index) => {
                  const Icon = job.icon
                  return (
                    <div
                      key={job.jobId}
                      className="bg-white border rounded-lg p-3 shadow-sm animate-slide-in-left"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm flex items-center gap-2">
                          <Icon className="h-4 w-4 text-amber-600" />
                          {job.name}
                        </span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => runJob(job.jobId)}>
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {job.endpoint}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.tables.map((table) => (
                          <Badge key={table} variant="outline" className="text-[10px] py-0">
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {queuedJobs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Queue is empty
                    <p className="text-xs mt-1">Click "Queue All" to add jobs</p>
                  </div>
                )}
              </div>
            </div>

            {/* The Crank (Center) */}
            <div className="w-1/3 flex flex-col items-center justify-center p-6 relative">
              {/* Conveyor Belt Effect */}
              <div className={`absolute top-0 left-0 right-0 h-2 conveyor-belt ${!isProcessing && !isAutoMode ? "paused" : ""}`} />
              <div className={`absolute bottom-0 left-0 right-0 h-2 conveyor-belt ${!isProcessing && !isAutoMode ? "paused" : ""}`} />

              {/* The Giant Gear */}
              <div className="relative mb-6">
                <Cog
                  className={`h-32 w-32 text-amber-500 transition-all ${
                    runningJob ? "animate-spin-gear" : ""
                  }`}
                />
                {runningJob && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold">{runningJob.progress}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Job */}
              {runningJob ? (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 w-full animate-bounce-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold flex items-center gap-2">
                      <runningJob.icon className="h-4 w-4" />
                      {runningJob.name}
                    </span>
                    <Badge className="bg-blue-500">Processing</Badge>
                  </div>
                  <Progress value={runningJob.progress} className="h-2 mb-2" />
                  <div className="text-xs text-muted-foreground font-mono text-center truncate">
                    {runningJob.endpoint}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">No job processing</p>
                  <p className="text-xs">Click "Run Next" or enable Auto Run</p>
                </div>
              )}

              {/* Auto Mode Indicator */}
              {isAutoMode && (
                <div className="mt-4 flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Auto Run Active (2s delay)</span>
                </div>
              )}
            </div>

            {/* Completed + Failed (Right) */}
            <div className="w-1/3 p-4 bg-green-50/50 border-l">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Results
                </h3>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    {completedJobsList.length} done
                  </Badge>
                  {failedJobsList.length > 0 && (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                      {failedJobsList.length} failed
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2 max-h-72 overflow-auto">
                {/* Completed Jobs */}
                {completedJobsList.map((job) => {
                  const Icon = job.icon
                  return (
                    <div
                      key={job.jobId}
                      className="bg-white border border-green-200 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          {job.name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Completed in {job.duration ? (job.duration / 1000).toFixed(1) : 0}s
                      </div>
                    </div>
                  )
                })}

                {/* Failed Jobs */}
                {failedJobsList.map((job) => {
                  const Icon = job.icon
                  return (
                    <div
                      key={job.jobId}
                      className="bg-white border border-red-200 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          {job.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => retryFailedJob(job)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      </div>
                      {job.error && (
                        <div className="text-xs text-red-600 mt-1">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          {job.error}
                        </div>
                      )}
                    </div>
                  )
                })}

                {completedJobsList.length === 0 && failedJobsList.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No results yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Bar */}
      <Card className="border-2 bg-gradient-to-r from-slate-50 to-slate-100 sticky bottom-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Controls:</span>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={runNextJob}
                  disabled={queuedJobs.length === 0 || !!runningJob}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Run Next
                </Button>
                <Button
                  variant={isAutoMode ? "default" : "outline"}
                  onClick={toggleAutoMode}
                  className={isAutoMode ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isAutoMode ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Auto
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Auto Run
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearQueue}
                  disabled={!!runningJob || queuedJobs.length === 0}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Queue
                </Button>
                <Button
                  variant="outline"
                  onClick={resetAll}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${runningJob ? "bg-blue-500 animate-pulse" : isAutoMode ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                <span>
                  {runningJob
                    ? "Processing..."
                    : isAutoMode
                    ? queuedJobs.length > 0
                      ? "Waiting (2s)"
                      : "Auto Idle"
                    : "Idle"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6 Sync Jobs Reference */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Onboarding Sync Endpoints</CardTitle>
              <p className="text-sm text-muted-foreground">
                6 V2 WORKERS endpoints at {MCP_BASES.WORKERS}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Job</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Endpoint</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Tables</th>
                  <th className="text-center px-4 py-3 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {SYNC_JOBS_CONFIG.map((config) => {
                  const Icon = config.icon
                  const isQueued = jobs.some(j => j.id === config.id && j.status === "queued")
                  const isCompleted = completedJobsList.some(j => j.id === config.id)
                  const isFailed = failedJobsList.some(j => j.id === config.id)
                  return (
                    <tr key={config.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{config.name}</span>
                          {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          {isFailed && <XCircle className="h-4 w-4 text-red-600" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{config.endpoint}</code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {config.tables.map((table) => (
                            <Badge key={table} variant="outline" className="text-xs">
                              {table}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addJobToQueue(config.id)}
                          disabled={isQueued || !!runningJob}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
