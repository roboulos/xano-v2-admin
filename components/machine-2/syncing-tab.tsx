"use client"

import { useState, useEffect, useCallback } from "react"
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
  Calendar,
  Database,
  Zap,
  List,
  RotateCcw,
  XCircle,
  Server,
} from "lucide-react"
import { MCP_BASES, MCP_ENDPOINTS, getEndpointsByGroup, type MCPEndpoint } from "@/lib/mcp-endpoints"

// Job types for the queue
type JobStatus = "queued" | "running" | "completed" | "failed"

type SyncJob = {
  id: string
  name: string
  endpoint: string
  apiGroup: "TASKS" | "WORKERS" | "SYSTEM" | "SEEDING"
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

interface SystemStatus {
  staging_unprocessed: StagingStatus[]
  last_updated: string
}

function JobCard({ job, onRetry, onRun }: { job: SyncJob; onRetry: () => void; onRun: () => void }) {
  const getStatusIcon = () => {
    switch (job.status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "queued":
        return <Clock className="h-4 w-4 text-amber-600" />
      default:
        return null
    }
  }

  const getStatusBadge = () => {
    const variants: Record<JobStatus, string> = {
      completed: "bg-green-100 text-green-700 border-green-200",
      running: "bg-blue-100 text-blue-700 border-blue-200",
      failed: "bg-red-100 text-red-700 border-red-200",
      queued: "bg-amber-100 text-amber-700 border-amber-200",
    }
    return (
      <Badge className={variants[job.status]}>
        {getStatusIcon()}
        <span className="ml-1 capitalize">{job.status}</span>
      </Badge>
    )
  }

  const formatDuration = () => {
    if (!job.duration) return null
    const seconds = Math.floor(job.duration / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-muted-foreground" />
          <div>
            <h4 className="font-medium">{job.name}</h4>
            <code className="text-xs text-muted-foreground">{job.endpoint}</code>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Progress Bar */}
      {job.status === "running" && (
        <div className="mb-3">
          <Progress value={job.progress} className="h-2" />
        </div>
      )}

      {/* Timestamps and Actions */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          {job.startedAt && (
            <span>Started: {job.startedAt.toLocaleTimeString()}</span>
          )}
          {formatDuration() && <span>Duration: {formatDuration()}</span>}
        </div>
        <div className="flex gap-2">
          {job.status === "failed" && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {job.status === "queued" && (
            <Button variant="outline" size="sm" onClick={onRun}>
              <Play className="h-3 w-3 mr-1" />
              Run Now
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {job.error && (
        <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded">
          <AlertCircle className="h-3 w-3 inline mr-1" />
          {job.error}
        </div>
      )}
    </div>
  )
}

export function SyncingTab() {
  const [jobs, setJobs] = useState<SyncJob[]>([])
  const [userId, setUserId] = useState<number>(7)
  const [stagingStatus, setStagingStatus] = useState<StagingStatus[]>([])
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [lastStatusUpdate, setLastStatusUpdate] = useState<Date | null>(null)

  // Get V2 TASKS endpoints for the queue
  const tasksEndpoints = getEndpointsByGroup("TASKS")
  const systemEndpoints = getEndpointsByGroup("SYSTEM")

  const runningJobs = jobs.filter((j) => j.status === "running").length
  const queuedJobs = jobs.filter((j) => j.status === "queued").length
  const completedJobs = jobs.filter((j) => j.status === "completed").length

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

  // Add a job to the queue
  const addJob = (endpoint: MCPEndpoint) => {
    const newJob: SyncJob = {
      id: `job-${Date.now()}`,
      name: endpoint.taskName,
      endpoint: endpoint.endpoint,
      apiGroup: endpoint.apiGroup,
      status: "queued",
      progress: 0,
    }
    setJobs((prev) => [newJob, ...prev])
  }

  // Run a queued job
  const runJob = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (!job) return

    // Update to running
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, status: "running" as const, startedAt: new Date(), progress: 0 }
          : j
      )
    )

    // Animate progress
    const progressInterval = setInterval(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId && j.status === "running"
            ? { ...j, progress: Math.min(j.progress + 10, 90) }
            : j
        )
      )
    }, 300)

    try {
      const baseUrl = MCP_BASES[job.apiGroup]
      const options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      }

      const response = await fetch(`${baseUrl}${job.endpoint}`, options)
      const data = await response.json()
      const duration = Date.now() - (job.startedAt?.getTime() || Date.now())

      clearInterval(progressInterval)

      if (data.success !== false) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  status: "completed" as const,
                  progress: 100,
                  completedAt: new Date(),
                  duration,
                  response: data,
                }
              : j
          )
        )
      } else {
        throw new Error(data.error || data.message || "Job failed")
      }
    } catch (err) {
      clearInterval(progressInterval)
      const duration = Date.now() - (job.startedAt?.getTime() || Date.now())
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: "failed" as const,
                progress: 0,
                duration,
                error: err instanceof Error ? err.message : "Unknown error",
              }
            : j
        )
      )
    }
  }

  // Retry a failed job
  const retryJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: "queued" as const, error: undefined, progress: 0 } : j
      )
    )
  }

  // Clear completed jobs
  const clearCompleted = () => {
    setJobs((prev) => prev.filter((j) => j.status !== "completed"))
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

      {/* Job Queue */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <List className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Job Queue</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Run V2 TASKS endpoints
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {runningJobs > 0 && (
                <Badge className="bg-blue-100 text-blue-700">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  {runningJobs} Running
                </Badge>
              )}
              {queuedJobs > 0 && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {queuedJobs} Queued
                </Badge>
              )}
              {completedJobs > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCompleted}>
                  Clear Completed
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* User ID Input */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
            <Label htmlFor="sync-userId" className="text-sm font-medium">User ID:</Label>
            <Input
              id="sync-userId"
              type="number"
              value={userId}
              onChange={(e) => setUserId(parseInt(e.target.value) || 7)}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground">
              For user-specific endpoints
            </span>
          </div>

          {/* Add Job Buttons */}
          <div className="mb-4 p-4 border rounded-lg bg-muted/10">
            <h4 className="text-sm font-medium mb-3">Add Job to Queue</h4>
            <div className="flex flex-wrap gap-2">
              {tasksEndpoints.slice(0, 8).map((endpoint) => (
                <Button
                  key={endpoint.endpoint}
                  variant="outline"
                  size="sm"
                  onClick={() => addJob(endpoint)}
                >
                  {endpoint.taskName.replace("reZEN - ", "").replace("FUB - ", "")}
                </Button>
              ))}
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No jobs in queue</p>
                <p className="text-xs mt-1">Add a job above to get started</p>
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onRetry={() => retryJob(job.id)}
                  onRun={() => runJob(job.id)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available V2 Tasks */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Available V2 Tasks</CardTitle>
              <p className="text-sm text-muted-foreground">
                {tasksEndpoints.length} TASKS endpoints at {MCP_BASES.TASKS}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Task Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Endpoint</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Method</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">User ID</th>
                  <th className="text-center px-4 py-3 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tasksEndpoints.map((endpoint) => (
                  <tr key={endpoint.endpoint} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{endpoint.taskName}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{endpoint.endpoint}</code>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {endpoint.method}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {endpoint.requiresUserId ? "Required" : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => addJob(endpoint)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
