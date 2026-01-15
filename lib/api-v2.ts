// V2 Task Control Center API Client
// Triggers background tasks and functions in V2 Xano workspace

import type { TaskResult, BackgroundTask } from "./types-v2"
import { BACKGROUND_TASKS, getTasksByDomain, getTaskStats, DOMAIN_INFO } from "./task-data"

// V2 Xano Workspace Base URL
const V2_BASE = "https://x2nu-xcjc-vhax.agentdashboards.xano.io"

// MCP API Groups - Real canonical IDs from workspace 5
export const API_GROUPS = {
  TASKS: "api:4psV7fp6",      // MCP: Tasks (100+ endpoints)
  WORKERS: "api:4UsTtl3m",    // MCP: Workers (100+ endpoints)
  SYSTEM: "api:LIdBL1AN",     // MCP: System (37 endpoints)
  SEEDING: "api:2kCRUYxG",    // MCP: Seeding (23 endpoints)
} as const

// Build full URL for an endpoint
function buildUrl(apiGroup: string, endpoint: string): string {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  return `${V2_BASE}/${apiGroup}${path}`
}

// Generic task runner with timeout handling
export async function runTaskEndpoint<T = unknown>(
  apiGroup: string,
  endpoint: string,
  method: "GET" | "POST" = "POST",
  params?: Record<string, unknown>,
  timeoutMs = 120000
): Promise<TaskResult<T>> {
  const startTime = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const url = buildUrl(apiGroup, endpoint)
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    }

    if (method !== "GET" && params) {
      options.body = JSON.stringify(params)
    }

    const response = await fetch(url, options)
    const endTime = Date.now()

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        startTime,
        endTime,
        duration: endTime - startTime,
      }
    }

    const data = await response.json() as T
    return {
      success: true,
      data,
      startTime,
      endTime,
      duration: endTime - startTime,
    }
  } catch (error) {
    const endTime = Date.now()
    const errorMessage = error instanceof Error
      ? error.name === "AbortError"
        ? `Timeout after ${timeoutMs}ms`
        : error.message
      : "Unknown error"

    return {
      success: false,
      error: errorMessage,
      startTime,
      endTime,
      duration: endTime - startTime,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

// Quick helper for GET requests
export async function getStatus<T>(apiGroup: string, endpoint: string): Promise<T | null> {
  const url = buildUrl(apiGroup, endpoint)
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return response.json() as Promise<T>
  } catch {
    return null
  }
}

// =============================================================================
// RE-EXPORT TASK DATA
// =============================================================================

export { BACKGROUND_TASKS, getTasksByDomain, getTaskStats, DOMAIN_INFO }
export type { BackgroundTask }

// Alias for backward compatibility with UI
export const ALL_TASKS = BACKGROUND_TASKS

// Domain-specific task arrays for UI components
const tasksByDomain = getTasksByDomain()
export const FUB_TASKS = tasksByDomain.fub
export const REZEN_TASKS = tasksByDomain.rezen
export const SKYSLOPE_TASKS = tasksByDomain.skyslope
export const AGGREGATION_TASKS = tasksByDomain.aggregation
export const TITLE_TASKS = tasksByDomain.title
export const AD_TASKS = tasksByDomain.ad
export const SYSTEM_TASKS: BackgroundTask[] = [] // System endpoints are not background tasks
export const SEEDING_TASKS: BackgroundTask[] = [] // Seeding endpoints are not background tasks
export const REPORTING_TASKS = tasksByDomain.reporting
export const METRICS_TASKS = tasksByDomain.metrics

// =============================================================================
// MCP ENDPOINT MAPPING
// The MCP API groups expose endpoints to trigger tasks/workers
// Format: /run-task/{task_id} or /run-worker/{function_id}
// =============================================================================

// Run a background task by ID
export async function runBackgroundTask(taskId: number): Promise<TaskResult> {
  // MCP: Tasks group has endpoints to run tasks
  return runTaskEndpoint(
    API_GROUPS.TASKS,
    `/run-task/${taskId}`,
    "POST"
  )
}

// Run a worker function by ID
export async function runWorker(functionId: number): Promise<TaskResult> {
  // MCP: Workers group has endpoints to run workers
  return runTaskEndpoint(
    API_GROUPS.WORKERS,
    `/run-worker/${functionId}`,
    "POST"
  )
}

// =============================================================================
// SYSTEM ENDPOINTS (MCP: System group)
// =============================================================================

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

export interface TableCountsResponse {
  tables: Array<{
    name: string
    count: number
  }>
}

export interface OnboardingStatusResponse {
  total_users: number
  onboarded: number
  pending: number
  failed: number
}

// Get staging table status
export async function getStagingStatus(): Promise<StagingStatusResponse | null> {
  return getStatus<StagingStatusResponse>(API_GROUPS.SYSTEM, "/staging-status")
}

// Get table counts
export async function getTableCounts(): Promise<TableCountsResponse | null> {
  return getStatus<TableCountsResponse>(API_GROUPS.SYSTEM, "/table-counts")
}

// Get onboarding status
export async function getOnboardingStatus(): Promise<OnboardingStatusResponse | null> {
  return getStatus<OnboardingStatusResponse>(API_GROUPS.SYSTEM, "/onboarding-status")
}

// Health check
export async function healthCheck(): Promise<{ status: string } | null> {
  return getStatus<{ status: string }>(API_GROUPS.SYSTEM, "/health")
}

// =============================================================================
// SEEDING ENDPOINTS (MCP: Seeding group)
// =============================================================================

// Seed demo data
export async function seedDemoData(): Promise<TaskResult> {
  return runTaskEndpoint(API_GROUPS.SEEDING, "/seed/demo-dataset", "POST")
}

// Clear staging data
export async function clearStaging(): Promise<TaskResult> {
  return runTaskEndpoint(API_GROUPS.SEEDING, "/clear/staging", "POST")
}

// Clear all data (dangerous!)
export async function clearAll(): Promise<TaskResult> {
  return runTaskEndpoint(API_GROUPS.SEEDING, "/clear/all", "POST")
}

// =============================================================================
// SEARCH FUNCTIONS
// =============================================================================

// Search tasks by name or description
export function searchTasks(query: string): BackgroundTask[] {
  const lower = query.toLowerCase()
  return BACKGROUND_TASKS.filter(
    task =>
      task.name.toLowerCase().includes(lower) ||
      (task.callsFunction?.toLowerCase().includes(lower) ?? false) ||
      task.tags.some(tag => tag.toLowerCase().includes(lower))
  )
}

// Get task by ID
export function getTaskById(taskId: number): BackgroundTask | undefined {
  return BACKGROUND_TASKS.find(task => task.id === taskId)
}

// Get tasks with schedules (sorted by frequency)
export function getScheduledTasks(): BackgroundTask[] {
  return BACKGROUND_TASKS
    .filter(task => task.schedule !== null)
    .sort((a, b) => (a.schedule?.frequency ?? 0) - (b.schedule?.frequency ?? 0))
}

// Get active tasks
export function getActiveTasks(): BackgroundTask[] {
  return BACKGROUND_TASKS.filter(task => task.active)
}

// Get inactive tasks
export function getInactiveTasks(): BackgroundTask[] {
  return BACKGROUND_TASKS.filter(task => !task.active)
}
