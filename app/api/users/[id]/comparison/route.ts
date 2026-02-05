/**
 * GET /api/users/[id]/comparison
 *
 * Fetches all V1 and V2 data for a specific user, enabling side-by-side comparison.
 * Uses Promise.allSettled for resilient parallel fetching -- partial results
 * are returned when one workspace is unreachable.
 *
 * Query params:
 *   - sections?: string  (comma-separated: "user,agent,transactions,listings,network,contributions,team")
 *   - limit?: number     (max records per array section, default 100)
 *   - offset?: number    (pagination offset for array sections, default 0)
 *
 * Response shape: see UserComparisonResponse below.
 */

import { NextResponse } from 'next/server'
import { v1Client, v2Client } from '@/lib/snappy-client'
import { TABLE_MAPPINGS } from '@/lib/table-mappings'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Field-level diff for scalar record comparisons (user, agent, team). */
export interface FieldDiff {
  field: string
  v1Value: unknown
  v2Value: unknown
  status: 'match' | 'mismatch' | 'v1_only' | 'v2_only'
}

/** Diff summary for a scalar entity. */
export interface EntityDiff {
  match: boolean
  totalFields: number
  matchingFields: number
  diffs: FieldDiff[]
}

/** Count-based comparison for array entities. */
export interface CountComparison {
  v1Count: number
  v2Count: number
  match: boolean
  delta: number
}

type SectionName =
  | 'user'
  | 'agent'
  | 'transactions'
  | 'listings'
  | 'network'
  | 'contributions'
  | 'team'

const ALL_SECTIONS: SectionName[] = [
  'user',
  'agent',
  'transactions',
  'listings',
  'network',
  'contributions',
  'team',
]

interface V1Data {
  user: Record<string, unknown> | null
  agent: Record<string, unknown> | null
  transactions: Record<string, unknown>[]
  listings: Record<string, unknown>[]
  network: Record<string, unknown>[]
  contributions: Record<string, unknown>[]
  team: Record<string, unknown> | null
}

interface V2Data {
  user: Record<string, unknown> | null
  agent: Record<string, unknown> | null
  transactions: Record<string, unknown>[]
  listings: Record<string, unknown>[]
  network: Record<string, unknown>[]
  contributions: Record<string, unknown>[]
  team: Record<string, unknown> | null
}

interface ComparisonResult {
  user: EntityDiff | null
  agent: EntityDiff | null
  transactions: CountComparison | null
  listings: CountComparison | null
  network: CountComparison | null
  contributions: CountComparison | null
  team: EntityDiff | null
}

export interface UserComparisonResponse {
  user_id: number
  sections: SectionName[]
  v1: Partial<V1Data>
  v2: Partial<V2Data>
  comparison: Partial<ComparisonResult>
  errors: string[]
  timestamp: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a field-name mapping from V1 -> V2 for a given entity type.
 * E.g. for "user", we know V1 "name" maps to V2 "name" (direct),
 * but V1 "dailyDash_transactions" maps to V2 "daily_dash_transactions" (in user_settings).
 *
 * For the core user/agent comparison we compare common fields on the
 * primary V2 table using the TABLE_MAPPINGS + known patterns.
 */
function getV1ToV2FieldMap(entityType: string): Map<string, string> {
  const map = new Map<string, string>()

  // Common identity fields that share names across V1 and V2
  const commonFields: Record<string, string[]> = {
    user: [
      'id',
      'name',
      'email',
      'phone',
      'first_name',
      'last_name',
      'created_at',
      'updated_at',
      'is_agent',
      'agent_id',
      'status',
      'avatar',
      'timezone',
    ],
    agent: [
      'id',
      'user_id',
      'first_name',
      'last_name',
      'email',
      'phone',
      'license_number',
      'license_state',
      'team_id',
      'status',
      'created_at',
      'updated_at',
      'agent_id_raw',
      'display_name',
    ],
    team: ['id', 'name', 'created_at', 'updated_at', 'status'],
  }

  // Known V1->V2 renames
  const renames: Record<string, Record<string, string>> = {
    user: {
      subscription_type: 'subscription_type', // in user_subscriptions but same name
    },
    agent: {
      rezen_agent_id: 'agent_id_raw',
    },
  }

  const fields = commonFields[entityType] || []
  for (const f of fields) {
    map.set(f, f)
  }

  const entityRenames = renames[entityType] || {}
  for (const [v1, v2] of Object.entries(entityRenames)) {
    map.set(v1, v2)
  }

  return map
}

/**
 * Compute field-level diffs between a V1 and V2 record.
 * Only compares fields present in the known field map so we
 * avoid noise from workspace-specific metadata fields.
 */
function computeEntityDiff(
  v1Record: Record<string, unknown> | null,
  v2Record: Record<string, unknown> | null,
  entityType: string
): EntityDiff {
  if (!v1Record && !v2Record) {
    return { match: true, totalFields: 0, matchingFields: 0, diffs: [] }
  }

  const fieldMap = getV1ToV2FieldMap(entityType)
  const diffs: FieldDiff[] = []
  let matchCount = 0

  // If only one side exists, all mapped fields are missing on the other side
  if (!v1Record) {
    for (const [, v2Field] of fieldMap) {
      const v2Val = v2Record?.[v2Field]
      if (v2Val !== undefined && v2Val !== null) {
        diffs.push({ field: v2Field, v1Value: undefined, v2Value: v2Val, status: 'v2_only' })
      }
    }
    return { match: false, totalFields: fieldMap.size, matchingFields: 0, diffs }
  }

  if (!v2Record) {
    for (const [v1Field] of fieldMap) {
      const v1Val = v1Record[v1Field]
      if (v1Val !== undefined && v1Val !== null) {
        diffs.push({ field: v1Field, v1Value: v1Val, v2Value: undefined, status: 'v1_only' })
      }
    }
    return { match: false, totalFields: fieldMap.size, matchingFields: 0, diffs }
  }

  // Both exist -- compare each mapped field
  for (const [v1Field, v2Field] of fieldMap) {
    const v1Val = v1Record[v1Field]
    const v2Val = v2Record[v2Field]

    const v1Defined = v1Val !== undefined && v1Val !== null
    const v2Defined = v2Val !== undefined && v2Val !== null

    if (!v1Defined && !v2Defined) {
      matchCount++
      continue
    }

    if (!v1Defined) {
      diffs.push({ field: v2Field, v1Value: v1Val, v2Value: v2Val, status: 'v2_only' })
      continue
    }

    if (!v2Defined) {
      diffs.push({ field: v1Field, v1Value: v1Val, v2Value: v2Val, status: 'v1_only' })
      continue
    }

    // Loose equality after string coercion for cross-workspace comparison
    // (Xano may return numbers as strings depending on the field type)
    if (String(v1Val) === String(v2Val)) {
      matchCount++
    } else {
      diffs.push({ field: v2Field, v1Value: v1Val, v2Value: v2Val, status: 'mismatch' })
    }
  }

  return {
    match: diffs.length === 0,
    totalFields: fieldMap.size,
    matchingFields: matchCount,
    diffs,
  }
}

/** Extract records array from snappy queryTable response. */
function extractRecords(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== 'object') return []
  const d = data as Record<string, unknown>
  if (Array.isArray(d)) return d as Record<string, unknown>[]
  if (Array.isArray(d.items)) return d.items as Record<string, unknown>[]
  if (Array.isArray(d.records)) return d.records as Record<string, unknown>[]
  return []
}

/** Extract a single record from snappy queryTable response. */
function extractSingleRecord(data: unknown): Record<string, unknown> | null {
  const records = extractRecords(data)
  return records.length > 0 ? records[0] : null
}

/**
 * Look up the V2 table name for a V1 entity type using TABLE_MAPPINGS.
 * Falls back to the same name if no mapping is found.
 */
function getV2TableName(v1Entity: string): string {
  const mapping = TABLE_MAPPINGS.find((m) => m.v1_table === v1Entity)
  return mapping?.primary_v2_table || v1Entity
}

// ---------------------------------------------------------------------------
// Data fetchers per section
// ---------------------------------------------------------------------------

async function fetchUserSection(userId: number): Promise<{
  v1: Record<string, unknown> | null
  v2: Record<string, unknown> | null
}> {
  const [v1Res, v2Res] = await Promise.allSettled([
    v1Client.queryTable('user', { filters: { id: userId }, limit: 1 }),
    v2Client.queryTable('user', { filters: { id: userId }, limit: 1 }),
  ])

  return {
    v1: v1Res.status === 'fulfilled' ? extractSingleRecord(v1Res.value) : null,
    v2: v2Res.status === 'fulfilled' ? extractSingleRecord(v2Res.value) : null,
  }
}

async function fetchAgentSection(userId: number): Promise<{
  v1: Record<string, unknown> | null
  v2: Record<string, unknown> | null
}> {
  const v2TableName = getV2TableName('agent')
  const [v1Res, v2Res] = await Promise.allSettled([
    v1Client.queryTable('agent', { filters: { user_id: userId }, limit: 1 }),
    v2Client.queryTable(v2TableName, { filters: { user_id: userId }, limit: 1 }),
  ])

  return {
    v1: v1Res.status === 'fulfilled' ? extractSingleRecord(v1Res.value) : null,
    v2: v2Res.status === 'fulfilled' ? extractSingleRecord(v2Res.value) : null,
  }
}

async function fetchTeamSection(userId: number): Promise<{
  v1: Record<string, unknown> | null
  v2: Record<string, unknown> | null
}> {
  // First find team membership via agent or team_members, then get team
  const v2TableName = getV2TableName('team')
  const [v1Res, v2Res] = await Promise.allSettled([
    v1Client.queryTable('team', { filters: { user_id: userId }, limit: 1 }),
    v2Client.queryTable(v2TableName, { filters: { user_id: userId }, limit: 1 }),
  ])

  return {
    v1: v1Res.status === 'fulfilled' ? extractSingleRecord(v1Res.value) : null,
    v2: v2Res.status === 'fulfilled' ? extractSingleRecord(v2Res.value) : null,
  }
}

async function fetchArraySection(
  v1Table: string,
  userId: number,
  limit: number,
  offset: number,
  filterField: string = 'user_id'
): Promise<{
  v1Records: Record<string, unknown>[]
  v2Records: Record<string, unknown>[]
  v1Error: string | null
  v2Error: string | null
}> {
  const v2TableName = getV2TableName(v1Table)
  const [v1Res, v2Res] = await Promise.allSettled([
    v1Client.queryTable(v1Table, {
      filters: { [filterField]: userId },
      limit,
    }),
    v2Client.queryTable(v2TableName, {
      filters: { [filterField]: userId },
      limit,
    }),
  ])

  return {
    v1Records: v1Res.status === 'fulfilled' ? extractRecords(v1Res.value) : [],
    v2Records: v2Res.status === 'fulfilled' ? extractRecords(v2Res.value) : [],
    v1Error: v1Res.status === 'rejected' ? String(v1Res.reason) : null,
    v2Error: v2Res.status === 'rejected' ? String(v2Res.reason) : null,
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UserComparisonResponse | { success: false; error: string }>> {
  try {
    const { id: idStr } = await params
    const userId = parseInt(idStr, 10)

    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false as const, error: 'Invalid user ID. Must be a positive integer.' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sectionsParam = searchParams.get('sections')
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '100', 10) || 100, 1),
      1000
    )
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)

    // Parse requested sections (default: all)
    let sections: SectionName[]
    if (sectionsParam) {
      const requested = sectionsParam.split(',').map((s) => s.trim().toLowerCase()) as SectionName[]
      sections = requested.filter((s) => ALL_SECTIONS.includes(s))
      if (sections.length === 0) {
        return NextResponse.json(
          {
            success: false as const,
            error: `Invalid sections. Valid options: ${ALL_SECTIONS.join(', ')}`,
          },
          { status: 400 }
        )
      }
    } else {
      sections = [...ALL_SECTIONS]
    }

    const v1: Partial<V1Data> = {}
    const v2: Partial<V2Data> = {}
    const comparison: Partial<ComparisonResult> = {}
    const errors: string[] = []

    // Build promise map for requested sections
    const fetchers: Array<() => Promise<void>> = []

    if (sections.includes('user')) {
      fetchers.push(async () => {
        try {
          const result = await fetchUserSection(userId)
          v1.user = result.v1
          v2.user = result.v2
          comparison.user = computeEntityDiff(result.v1, result.v2, 'user')
        } catch (e) {
          errors.push(`user: ${e instanceof Error ? e.message : String(e)}`)
          comparison.user = { match: false, totalFields: 0, matchingFields: 0, diffs: [] }
        }
      })
    }

    if (sections.includes('agent')) {
      fetchers.push(async () => {
        try {
          const result = await fetchAgentSection(userId)
          v1.agent = result.v1
          v2.agent = result.v2
          comparison.agent = computeEntityDiff(result.v1, result.v2, 'agent')
        } catch (e) {
          errors.push(`agent: ${e instanceof Error ? e.message : String(e)}`)
          comparison.agent = { match: false, totalFields: 0, matchingFields: 0, diffs: [] }
        }
      })
    }

    if (sections.includes('team')) {
      fetchers.push(async () => {
        try {
          const result = await fetchTeamSection(userId)
          v1.team = result.v1
          v2.team = result.v2
          comparison.team = computeEntityDiff(result.v1, result.v2, 'team')
        } catch (e) {
          errors.push(`team: ${e instanceof Error ? e.message : String(e)}`)
          comparison.team = { match: false, totalFields: 0, matchingFields: 0, diffs: [] }
        }
      })
    }

    // Array sections: transactions, listings, network, contributions
    const arraySections: Array<{
      section: SectionName
      v1Table: string
      filterField?: string
    }> = [
      { section: 'transactions', v1Table: 'transaction' },
      { section: 'listings', v1Table: 'listing' },
      { section: 'network', v1Table: 'network', filterField: 'user_id' },
      { section: 'contributions', v1Table: 'contribution', filterField: 'user_id' },
    ]

    for (const { section, v1Table, filterField } of arraySections) {
      if (!sections.includes(section)) continue

      fetchers.push(async () => {
        try {
          const result = await fetchArraySection(
            v1Table,
            userId,
            limit,
            offset,
            filterField || 'user_id'
          )

          // Store records in v1/v2 response
          ;(v1 as Record<string, unknown>)[section] = result.v1Records
          ;(v2 as Record<string, unknown>)[section] = result.v2Records

          // Count-based comparison
          const v1Count = result.v1Records.length
          const v2Count = result.v2Records.length
          ;(comparison as Record<string, unknown>)[section] = {
            v1Count,
            v2Count,
            match: v1Count === v2Count,
            delta: v2Count - v1Count,
          } satisfies CountComparison

          if (result.v1Error) errors.push(`${section} (V1): ${result.v1Error}`)
          if (result.v2Error) errors.push(`${section} (V2): ${result.v2Error}`)
        } catch (e) {
          errors.push(`${section}: ${e instanceof Error ? e.message : String(e)}`)
          ;(comparison as Record<string, unknown>)[section] = {
            v1Count: 0,
            v2Count: 0,
            match: false,
            delta: 0,
          } satisfies CountComparison
        }
      })
    }

    // Execute all section fetchers in parallel
    await Promise.allSettled(fetchers.map((fn) => fn()))

    const response: UserComparisonResponse = {
      user_id: userId,
      sections,
      v1,
      v2,
      comparison,
      errors,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[User Comparison API] Error:', message)
    return NextResponse.json({ success: false as const, error: message }, { status: 500 })
  }
}
