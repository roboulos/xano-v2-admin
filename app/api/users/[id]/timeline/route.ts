/**
 * GET /api/users/[id]/timeline
 *
 * Returns chronological events for a specific user, aggregated from multiple
 * data sources (onboarding status, staging activity, sync status).
 *
 * Uses Promise.allSettled for resilient parallel fetching -- partial results
 * are returned when some sources fail or return 404.
 *
 * Query params:
 *   - limit?: number   (default 50, max 200)
 *   - offset?: number  (default 0)
 *   - type?: string    (filter by event type: sync | onboarding | staging | error | system)
 *   - source?: string  (filter by source: rezen | fub | skyslope | system)
 *
 * Response shape: see TimelineResponse below.
 */

import { NextResponse } from 'next/server'
import { MCP_BASES } from '@/lib/mcp-endpoints'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimelineEvent {
  id: string
  timestamp: string // ISO 8601
  type: 'sync' | 'onboarding' | 'staging' | 'error' | 'system'
  source: string // e.g., 'rezen', 'fub', 'skyslope', 'system'
  title: string // Human-readable event title
  details?: string // Optional additional detail
  status: 'success' | 'error' | 'pending' | 'processing'
}

interface TimelineResponse {
  user_id: number
  events: TimelineEvent[]
  total: number
  has_more: boolean
}

// ---------------------------------------------------------------------------
// Xano Fetch Helpers
// ---------------------------------------------------------------------------

/** Fetch onboarding status from SYSTEM /onboarding-status */
async function fetchOnboardingStatus(userId: number): Promise<Record<string, unknown> | null> {
  const url = `${MCP_BASES.SYSTEM}/onboarding-status?user_id=${userId}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) return null
  return res.json()
}

/** Fetch staging status from SYSTEM /staging-status */
async function fetchStagingStatus(userId: number): Promise<Record<string, unknown> | null> {
  const url = `${MCP_BASES.SYSTEM}/staging-status?user_id=${userId}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) return null
  return res.json()
}

/** Fetch table counts from SYSTEM /table-counts */
async function fetchTableCounts(): Promise<Record<string, unknown> | null> {
  const url = `${MCP_BASES.SYSTEM}/table-counts`
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) return null
  return res.json()
}

// ---------------------------------------------------------------------------
// Event Extraction
// ---------------------------------------------------------------------------

/**
 * Map a status string from Xano to a normalized TimelineEvent status.
 */
function normalizeStatus(status: string | undefined | null): TimelineEvent['status'] {
  if (!status) return 'pending'
  const lower = String(status).toLowerCase()
  if (lower === 'complete' || lower === 'completed' || lower === 'success') return 'success'
  if (lower === 'error' || lower === 'failed') return 'error'
  if (lower === 'processing' || lower === 'in_progress') return 'processing'
  return 'pending'
}

/**
 * Extract timeline events from onboarding status response.
 * The SYSTEM /onboarding-status endpoint returns job records with statuses.
 */
function extractOnboardingEvents(data: Record<string, unknown>, userId: number): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // Handle top-level job info
  if (data.rezen_sync_job || data.fub_sync_job || data.jobs) {
    // Process rezen sync job
    const rezenJob = data.rezen_sync_job as Record<string, unknown> | undefined
    if (rezenJob) {
      events.push({
        id: `onboarding-rezen-${userId}-${rezenJob.id || 'unknown'}`,
        timestamp:
          (rezenJob.updated_at as string) ||
          (rezenJob.created_at as string) ||
          new Date().toISOString(),
        type: 'onboarding',
        source: 'rezen',
        title: `reZEN Onboarding Job ${rezenJob.status ? `(${rezenJob.status})` : ''}`.trim(),
        details: rezenJob.step ? `Current step: ${rezenJob.step}` : undefined,
        status: normalizeStatus(rezenJob.status as string),
      })
    }

    // Process FUB sync job
    const fubJob = data.fub_sync_job as Record<string, unknown> | undefined
    if (fubJob) {
      events.push({
        id: `onboarding-fub-${userId}-${fubJob.id || 'unknown'}`,
        timestamp:
          (fubJob.updated_at as string) ||
          (fubJob.created_at as string) ||
          new Date().toISOString(),
        type: 'onboarding',
        source: 'fub',
        title: `FUB Onboarding Job ${fubJob.status ? `(${fubJob.status})` : ''}`.trim(),
        details: fubJob.step ? `Current step: ${fubJob.step}` : undefined,
        status: normalizeStatus(fubJob.status as string),
      })
    }

    // Process jobs array if present
    const jobs = data.jobs as Record<string, unknown>[] | undefined
    if (Array.isArray(jobs)) {
      for (const job of jobs) {
        const source = inferSource(job)
        events.push({
          id: `onboarding-job-${userId}-${job.id || events.length}`,
          timestamp:
            (job.updated_at as string) || (job.created_at as string) || new Date().toISOString(),
          type: 'onboarding',
          source,
          title:
            `${job.job_type || job.type || 'Onboarding'} Job ${job.status ? `(${job.status})` : ''}`.trim(),
          details: job.message ? String(job.message) : job.step ? `Step: ${job.step}` : undefined,
          status: normalizeStatus(job.status as string),
        })
      }
    }
  }

  // Handle flat response where the data IS the status object
  if (events.length === 0 && data.status) {
    events.push({
      id: `onboarding-status-${userId}`,
      timestamp:
        (data.updated_at as string) || (data.created_at as string) || new Date().toISOString(),
      type: 'onboarding',
      source: 'system',
      title: `Onboarding Status: ${data.status}`,
      details: data.message ? String(data.message) : undefined,
      status: normalizeStatus(data.status as string),
    })
  }

  return events
}

/**
 * Extract timeline events from staging status response.
 * The SYSTEM /staging-status endpoint returns staging table counts/statuses.
 */
function extractStagingEvents(data: Record<string, unknown>, userId: number): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // Staging status returns table-level counts. Each table with records is an event.
  const tables = (data.tables || data.staging_tables) as
    | Record<string, unknown>[]
    | Record<string, unknown>
    | undefined

  if (Array.isArray(tables)) {
    for (const table of tables) {
      const tableName = (table.table_name || table.name || 'unknown') as string
      const count =
        (table.unprocessed_count as number) ||
        (table.count as number) ||
        (table.total as number) ||
        0
      const source = inferSourceFromTableName(tableName)

      if (count > 0) {
        events.push({
          id: `staging-${tableName}-${userId}`,
          timestamp:
            (table.updated_at as string) ||
            (table.last_processed as string) ||
            new Date().toISOString(),
          type: 'staging',
          source,
          title: `${tableName}: ${count} record${count !== 1 ? 's' : ''} in staging`,
          details: table.status ? `Status: ${table.status}` : undefined,
          status: count > 0 ? 'pending' : 'success',
        })
      }
    }
  } else if (tables && typeof tables === 'object') {
    // Object format: { table_name: { count, status, ... } }
    for (const [tableName, tableData] of Object.entries(tables)) {
      const td = tableData as Record<string, unknown>
      const count =
        (td.unprocessed_count as number) || (td.count as number) || (td.total as number) || 0
      const source = inferSourceFromTableName(tableName)

      if (count > 0) {
        events.push({
          id: `staging-${tableName}-${userId}`,
          timestamp:
            (td.updated_at as string) || (td.last_processed as string) || new Date().toISOString(),
          type: 'staging',
          source,
          title: `${tableName}: ${count} record${count !== 1 ? 's' : ''} in staging`,
          details: td.status ? `Status: ${td.status}` : undefined,
          status: count > 0 ? 'pending' : 'success',
        })
      }
    }
  }

  // If response has a summary/status field at top level
  if (events.length === 0 && (data.total_unprocessed || data.summary)) {
    events.push({
      id: `staging-summary-${userId}`,
      timestamp: new Date().toISOString(),
      type: 'staging',
      source: 'system',
      title: `Staging: ${data.total_unprocessed || 0} unprocessed records`,
      status: (data.total_unprocessed as number) > 0 ? 'pending' : 'success',
    })
  }

  return events
}

/**
 * Extract timeline events from table counts response (system-level sync status).
 */
function extractSyncEvents(data: Record<string, unknown>, userId: number): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // Table counts returns { tables: [ { name, count } ] } or similar
  const counts = (data.counts || data.tables || data) as
    | Record<string, unknown>
    | Record<string, unknown>[]

  if (Array.isArray(counts)) {
    // Only report a system-level summary event
    const totalTables = counts.length
    events.push({
      id: `sync-table-counts-${userId}`,
      timestamp: new Date().toISOString(),
      type: 'system',
      source: 'system',
      title: `V2 workspace has ${totalTables} table${totalTables !== 1 ? 's' : ''} with data`,
      status: 'success',
    })
  } else if (counts && typeof counts === 'object') {
    const entries = Object.entries(counts).filter(
      ([, v]) => typeof v === 'number' && (v as number) > 0
    )
    if (entries.length > 0) {
      events.push({
        id: `sync-table-summary-${userId}`,
        timestamp: new Date().toISOString(),
        type: 'sync',
        source: 'system',
        title: `V2 sync status: ${entries.length} table${entries.length !== 1 ? 's' : ''} populated`,
        details: entries
          .slice(0, 10)
          .map(([name, count]) => `${name}: ${count}`)
          .join(', '),
        status: 'success',
      })
    }
  }

  return events
}

// ---------------------------------------------------------------------------
// Source Inference Helpers
// ---------------------------------------------------------------------------

function inferSource(job: Record<string, unknown>): string {
  const type = String(job.job_type || job.type || '').toLowerCase()
  if (type.includes('rezen') || type.includes('rez')) return 'rezen'
  if (type.includes('fub') || type.includes('follow')) return 'fub'
  if (type.includes('skyslope') || type.includes('sky')) return 'skyslope'
  if (type.includes('dotloop') || type.includes('dot')) return 'dotloop'
  if (type.includes('lofty')) return 'lofty'
  return 'system'
}

function inferSourceFromTableName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('rezen') || lower.includes('rez_')) return 'rezen'
  if (lower.includes('fub') || lower.includes('fub_')) return 'fub'
  if (lower.includes('skyslope') || lower.includes('sky_')) return 'skyslope'
  if (lower.includes('dotloop') || lower.includes('dot_')) return 'dotloop'
  if (lower.includes('lofty')) return 'lofty'
  return 'system'
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<TimelineResponse | { success: false; error: string }>> {
  try {
    const { id: idStr } = await params
    const userId = parseInt(idStr, 10)

    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false as const,
          error: 'Invalid user ID. Must be a positive integer.',
        },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 200)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)
    const typeFilter = searchParams.get('type') || null
    const sourceFilter = searchParams.get('source') || null

    // Fetch all data sources in parallel with resilient error handling
    const [onboardingResult, stagingResult, tableCountsResult] = await Promise.allSettled([
      fetchOnboardingStatus(userId),
      fetchStagingStatus(userId),
      fetchTableCounts(),
    ])

    // Aggregate events from all sources
    let allEvents: TimelineEvent[] = []

    // Onboarding events
    if (onboardingResult.status === 'fulfilled' && onboardingResult.value) {
      allEvents.push(...extractOnboardingEvents(onboardingResult.value, userId))
    } else if (onboardingResult.status === 'rejected') {
      allEvents.push({
        id: `error-onboarding-${userId}`,
        timestamp: new Date().toISOString(),
        type: 'error',
        source: 'system',
        title: 'Failed to fetch onboarding status',
        details:
          onboardingResult.reason instanceof Error
            ? onboardingResult.reason.message
            : String(onboardingResult.reason),
        status: 'error',
      })
    }

    // Staging events
    if (stagingResult.status === 'fulfilled' && stagingResult.value) {
      allEvents.push(...extractStagingEvents(stagingResult.value, userId))
    } else if (stagingResult.status === 'rejected') {
      allEvents.push({
        id: `error-staging-${userId}`,
        timestamp: new Date().toISOString(),
        type: 'error',
        source: 'system',
        title: 'Failed to fetch staging status',
        details:
          stagingResult.reason instanceof Error
            ? stagingResult.reason.message
            : String(stagingResult.reason),
        status: 'error',
      })
    }

    // Sync / table count events
    if (tableCountsResult.status === 'fulfilled' && tableCountsResult.value) {
      allEvents.push(...extractSyncEvents(tableCountsResult.value, userId))
    } else if (tableCountsResult.status === 'rejected') {
      allEvents.push({
        id: `error-sync-${userId}`,
        timestamp: new Date().toISOString(),
        type: 'error',
        source: 'system',
        title: 'Failed to fetch table counts',
        details:
          tableCountsResult.reason instanceof Error
            ? tableCountsResult.reason.message
            : String(tableCountsResult.reason),
        status: 'error',
      })
    }

    // Apply filters
    if (typeFilter) {
      allEvents = allEvents.filter((e) => e.type === typeFilter)
    }
    if (sourceFilter) {
      allEvents = allEvents.filter((e) => e.source === sourceFilter)
    }

    // Sort by timestamp descending (newest first)
    allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Total before pagination
    const total = allEvents.length

    // Apply pagination
    const paginatedEvents = allEvents.slice(offset, offset + limit)

    const response: TimelineResponse = {
      user_id: userId,
      events: paginatedEvents,
      total,
      has_more: offset + limit < total,
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[User Timeline API] Error:', message)
    return NextResponse.json({ success: false as const, error: message }, { status: 500 })
  }
}
