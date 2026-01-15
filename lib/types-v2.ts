// V2 Task Control Center Types - Real Xano Workspace Structure
// Following Functional Programming patterns (Result/Either monad)

export type ActivityStatus = "pending" | "running" | "success" | "error"

// =============================================================================
// FP-STYLE RESULT TYPES (Either Monad Pattern)
// =============================================================================
// All MCP endpoints SHOULD return this shape for consistent error handling
// and composable pipelines. This enables error bubbling and clear debugging.

/**
 * Success result - operation completed successfully
 */
export interface XanoResultSuccess<T = unknown> {
  success: true
  data: T
  step: string              // Last successful step for debugging
  metadata?: {
    duration_ms?: number
    records_processed?: number
    timestamp?: number
  }
}

/**
 * Failure result - operation failed with error context
 */
export interface XanoResultFailure {
  success: false
  error: string             // Human-readable error message
  step: string              // WHERE in the pipeline it failed
  data?: unknown            // Partial data for debugging
  code?: string             // Machine-readable error code
}

/**
 * Unified Result type (Either monad)
 * Use: XanoResult<MyDataType>
 */
export type XanoResult<T = unknown> = XanoResultSuccess<T> | XanoResultFailure

/**
 * Xano validation error format (system-level, not our format)
 */
export interface XanoValidationError {
  code: string              // e.g., "ERROR_CODE_INPUT_ERROR"
  message: string           // e.g., "Missing param: user_id"
  payload?: {
    param?: string
    [key: string]: unknown
  }
}

/**
 * Type guard to check if response follows FP Result pattern
 */
export function isXanoResult(response: unknown): response is XanoResult {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    typeof (response as XanoResult).success === 'boolean'
  )
}

/**
 * Type guard for success result
 */
export function isXanoSuccess<T>(result: XanoResult<T>): result is XanoResultSuccess<T> {
  return result.success === true
}

/**
 * Type guard for failure result
 */
export function isXanoFailure(result: XanoResult): result is XanoResultFailure {
  return result.success === false
}

/**
 * Type guard for Xano validation errors
 */
export function isXanoValidationError(response: unknown): response is XanoValidationError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'code' in response &&
    'message' in response &&
    typeof (response as XanoValidationError).code === 'string'
  )
}

/**
 * Normalize any Xano response to our Result type
 * Handles: FP-style results, raw data, validation errors
 */
export function normalizeXanoResponse<T = unknown>(
  response: unknown,
  endpoint: string
): XanoResult<T> {
  // Already in FP format
  if (isXanoResult(response)) {
    return response as XanoResult<T>
  }

  // Xano validation error
  if (isXanoValidationError(response)) {
    return {
      success: false,
      error: response.message,
      step: 'validation',
      code: response.code,
      data: response.payload
    }
  }

  // Raw data response (no wrapper) - wrap it as success
  return {
    success: true,
    data: response as T,
    step: endpoint
  }
}

// =============================================================================
// EXISTING TYPES (kept for backward compatibility)
// =============================================================================

// Alias for backward compatibility with UI components
// TaskDefinition = BackgroundTask (legacy name)

// Domain categories based on actual task prefixes in the workspace
export type TaskDomain =
  | "fub"           // FUB - Follow Up Boss integration
  | "rezen"         // reZEN - Real brokerage API
  | "skyslope"      // SkySlope - Transaction management
  | "aggregation"   // Aggregation - Data aggregation tasks
  | "title"         // Title - Title company integration
  | "ad"            // AD - AgentDashboards internal
  | "reporting"     // Reporting - Slack, metrics
  | "metrics"       // Metrics - Snapshots, analytics

// A real background task from Xano workspace
export interface BackgroundTask {
  id: number                          // Xano task ID (e.g., 3132)
  name: string                        // Task name (e.g., "Aggregation - Daily Scheduler")
  active: boolean                     // Is the task active?
  schedule: ScheduleInfo | null       // Schedule if present
  tags: string[]                      // Task tags
  domain: TaskDomain                  // Parsed domain from name
  callsFunction: string | null        // Function path it calls (e.g., "Tasks/Aggregation - Daily Scheduler")
  lastModified: string               // Last modified timestamp
  created: string                    // Created timestamp
}

// Alias for backward compatibility
export type TaskDefinition = BackgroundTask

// Schedule information parsed from XanoScript
export interface ScheduleInfo {
  startsOn: string                   // Start datetime
  frequency: number                  // Frequency in seconds (86400 = daily, 60 = every minute)
  frequencyLabel: string             // Human readable (e.g., "Daily", "Every minute")
}

// A function that a task calls
export interface TaskFunction {
  id: number                         // Function ID
  name: string                       // Full path (e.g., "Tasks/Aggregation - Daily Scheduler")
  shortName: string                  // Just the name part
  folder: string                     // Folder (Tasks, Workers, Utils, etc.)
  tags: string[]                     // Function tags
  callsFunctions: string[]           // Other functions this calls
  callsWorkers: string[]             // Workers this calls
  lastModified: string
}

// Worker function
export interface WorkerFunction {
  id: number
  name: string                       // Full path (e.g., "Workers/Income - Aggregate All Agents")
  shortName: string
  tags: string[]
  callsWorkers: string[]             // Other workers this calls
  lastModified: string
}

// The call chain from Task down to Workers
export interface TaskCallChain {
  task: BackgroundTask
  taskFunction: TaskFunction | null
  functions: TaskFunction[]
  workers: WorkerFunction[]
}

// Activity log entry
export interface ActivityLogEntry {
  id: string
  taskId: number                     // Real Xano task ID
  taskName: string
  domain: TaskDomain
  status: ActivityStatus
  startTime: number
  endTime?: number
  duration?: number
  result?: unknown
  error?: string
  callChain?: string[]               // What got triggered downstream
}

export interface TaskResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  startTime: number
  endTime: number
  duration: number
}

// For triggering tasks via MCP API endpoints
export interface TaskTriggerConfig {
  taskId: number
  endpoint: string                   // MCP API endpoint to trigger this task
  method: "GET" | "POST"
  apiGroup: string
  requiresParams?: boolean
  params?: Record<string, unknown>
}

// Domain configuration for UI
export interface DomainConfig {
  id: TaskDomain
  name: string
  description: string
  icon: string
  color: string
  taskCount: number
  activeCount: number
}

// Quick stats for the header
export interface SystemStats {
  totalTasks: number
  activeTasks: number
  inactiveTasks: number
  lastUpdated: string
  domainsBreakdown: Record<TaskDomain, number>
}

// API Response types
export interface StagingStatusResponse {
  tables: Array<{
    table_name: string
    staging_count: number
    processed_count: number
    error_count: number
  }>
  total_staging: number
  total_errors: number
}

export interface OnboardingStatusResponse {
  total_users: number
  onboarded: number
  pending: number
  failed: number
}

export interface TableCountsResponse {
  tables: Array<{
    name: string
    count: number
  }>
}

export interface BackgroundTaskResponse {
  task_id: string
  status: "queued" | "running" | "completed" | "failed"
  started_at?: string
  completed_at?: string
  result?: unknown
  error?: string
}

export interface SyncResult {
  records_processed: number
  records_created: number
  records_updated: number
  records_skipped: number
  errors: number
  duration_ms: number
}

// Helper to parse frequency to human readable
export function formatFrequency(seconds: number): string {
  if (seconds === 60) return "Every minute"
  if (seconds === 300) return "Every 5 minutes"
  if (seconds === 600) return "Every 10 minutes"
  if (seconds === 900) return "Every 15 minutes"
  if (seconds === 1800) return "Every 30 minutes"
  if (seconds === 3600) return "Hourly"
  if (seconds === 7200) return "Every 2 hours"
  if (seconds === 14400) return "Every 4 hours"
  if (seconds === 21600) return "Every 6 hours"
  if (seconds === 43200) return "Every 12 hours"
  if (seconds === 86400) return "Daily"
  if (seconds === 604800) return "Weekly"
  return `Every ${seconds}s`
}

// Helper to parse domain from task name
export function parseDomainFromName(name: string): TaskDomain {
  const lower = name.toLowerCase()
  if (lower.startsWith("fub")) return "fub"
  if (lower.startsWith("rezen") || lower.includes("rezen")) return "rezen"
  if (lower.startsWith("skyslope") || lower.includes("skyslope")) return "skyslope"
  if (lower.startsWith("aggregation")) return "aggregation"
  if (lower.startsWith("title")) return "title"
  if (lower.startsWith("ad ") || lower.startsWith("ad-")) return "ad"
  if (lower.startsWith("reporting")) return "reporting"
  if (lower.startsWith("metrics")) return "metrics"
  // Default to AD for AgentDashboards internal tasks
  return "ad"
}

// Helper to parse function call from XanoScript
export function parseFunctionCall(xanoscript: string): string | null {
  // Look for: function.run "Tasks/Something" or function.run "Workers/Something"
  const match = xanoscript.match(/function\.run\s+"([^"]+)"/)
  return match ? match[1] : null
}

// Helper to parse schedule from XanoScript
export function parseSchedule(xanoscript: string): ScheduleInfo | null {
  // Look for: schedule = [{starts_on: 2025-12-26 07:00:00+0000, freq: 86400}]
  const scheduleMatch = xanoscript.match(/schedule\s*=\s*\[\{starts_on:\s*([^,]+),\s*freq:\s*(\d+)\}\]/)
  if (!scheduleMatch) return null

  const startsOn = scheduleMatch[1].trim()
  const frequency = parseInt(scheduleMatch[2], 10)

  return {
    startsOn,
    frequency,
    frequencyLabel: formatFrequency(frequency)
  }
}
