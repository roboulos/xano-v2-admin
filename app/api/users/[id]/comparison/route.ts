/**
 * GET /api/users/[id]/comparison
 *
 * Fetches all V1 and V2 data for a specific user via Xano Meta API endpoints,
 * enabling side-by-side comparison. Both workspaces are queried through
 * dedicated Xano endpoints that bypass auth-enabled table restrictions.
 *
 * Query params:
 *   - sections?: string  (comma-separated: "user,agent,transactions,listings,network,contributions,team")
 *
 * Response shape: see UserComparisonResponse below.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Xano API endpoints (bypass auth-enabled table restrictions)
// ---------------------------------------------------------------------------

const INTROSPECTION_BASE = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O'

const V1_COMPARISON_URL = `${INTROSPECTION_BASE}/v1-user-comparison-data`
const V2_COMPARISON_URL = `${INTROSPECTION_BASE}/user-comparison-data`

interface XanoComparisonData {
  user: Record<string, unknown> | null
  agent: Record<string, unknown> | null
  counts: {
    transactions: number
    listings: number
    network: number
    contributions: number
  }
}

const EMPTY_DATA: XanoComparisonData = {
  user: null,
  agent: null,
  counts: { transactions: 0, listings: 0, network: 0, contributions: 0 },
}

async function fetchXanoData(url: string, userId: number): Promise<XanoComparisonData> {
  try {
    const res = await fetch(`${url}?user_id=${userId}`, {
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) return { ...EMPTY_DATA }
    const data = await res.json()
    return {
      user: data.user && !data.user.code ? data.user : null,
      agent: data.agent && !data.agent.code ? data.agent : null,
      counts: {
        transactions: data.counts?.transactions ?? 0,
        listings: data.counts?.listings ?? 0,
        network: data.counts?.network ?? 0,
        contributions: data.counts?.contributions ?? 0,
      },
    }
  } catch {
    return { ...EMPTY_DATA }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FieldDiff {
  field: string
  v1Value: unknown
  v2Value: unknown
  status: 'match' | 'mismatch' | 'v1_only' | 'v2_only'
}

export interface EntityDiff {
  match: boolean
  totalFields: number
  matchingFields: number
  diffs: FieldDiff[]
}

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

interface WorkspaceData {
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
  v1: Partial<WorkspaceData>
  v2: Partial<WorkspaceData>
  comparison: Partial<ComparisonResult>
  errors: string[]
  timestamp: string
}

// ---------------------------------------------------------------------------
// Diff Helpers
// ---------------------------------------------------------------------------

function getV1ToV2FieldMap(entityType: string): Map<string, string> {
  const map = new Map<string, string>()

  const commonFields: Record<string, string[]> = {
    user: [
      'id',
      'email',
      'first_name',
      'last_name',
      'full_name',
      'created_at',
      'is_agent',
      'agent_id',
      'avatar',
      'active',
      'cell_phone',
      'display_name',
      'team_id',
    ],
    agent: [
      'id',
      'first_name',
      'last_name',
      'email',
      'phone',
      'team_id',
      'created_at',
      'agent_id_raw',
      'display_name',
    ],
    team: ['id', 'name', 'created_at', 'updated_at', 'status'],
  }

  const fields = commonFields[entityType] || []
  for (const f of fields) {
    map.set(f, f)
  }

  return map
}

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

    // Fetch V1 and V2 data in parallel from Xano endpoints
    const [v1Raw, v2Raw] = await Promise.all([
      fetchXanoData(V1_COMPARISON_URL, userId),
      fetchXanoData(V2_COMPARISON_URL, userId),
    ])

    const v1: Partial<WorkspaceData> = {}
    const v2: Partial<WorkspaceData> = {}
    const comparison: Partial<ComparisonResult> = {}
    const errors: string[] = []

    // Scalar sections
    if (sections.includes('user')) {
      v1.user = v1Raw.user
      v2.user = v2Raw.user
      comparison.user = computeEntityDiff(v1Raw.user, v2Raw.user, 'user')
    }

    if (sections.includes('agent')) {
      v1.agent = v1Raw.agent
      v2.agent = v2Raw.agent
      comparison.agent = computeEntityDiff(v1Raw.agent, v2Raw.agent, 'agent')
    }

    if (sections.includes('team')) {
      // Team: derive from user records
      const v1Team = v1Raw.user?.team_id
        ? ({ id: v1Raw.user.team_id, user_id: userId, source: 'user.team_id' } as Record<
            string,
            unknown
          >)
        : null
      const v2Team = v2Raw.user?.team_id
        ? ({ id: v2Raw.user.team_id, user_id: userId, source: 'user.team_id' } as Record<
            string,
            unknown
          >)
        : null
      v1.team = v1Team
      v2.team = v2Team
      comparison.team = computeEntityDiff(v1Team, v2Team, 'team')
    }

    // Array sections: use counts from Xano endpoints
    const arraySections: Array<{
      section: SectionName
      countKey: keyof XanoComparisonData['counts']
    }> = [
      { section: 'transactions', countKey: 'transactions' },
      { section: 'listings', countKey: 'listings' },
      { section: 'network', countKey: 'network' },
      { section: 'contributions', countKey: 'contributions' },
    ]

    for (const { section, countKey } of arraySections) {
      if (!sections.includes(section)) continue

      const v1Count = v1Raw.counts[countKey]
      const v2Count = v2Raw.counts[countKey]

      ;(v1 as Record<string, unknown>)[section] = []
      ;(v2 as Record<string, unknown>)[section] = []
      ;(comparison as Record<string, unknown>)[section] = {
        v1Count,
        v2Count,
        match: v1Count === v2Count,
        delta: v2Count - v1Count,
      } satisfies CountComparison
    }

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
