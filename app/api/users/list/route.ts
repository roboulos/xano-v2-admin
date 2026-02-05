/**
 * GET /api/users/list
 *
 * Returns a list of users from V2 workspace (primary source),
 * cross-referenced with V1 workspace for existence flags.
 *
 * Query params:
 *   - search?: string  (filter by name/email)
 *   - limit?: number   (default 50)
 *   - offset?: number  (default 0)
 *
 * Response:
 * {
 *   users: Array<UserListItem>
 *   total: number
 *   hasMore: boolean
 * }
 */

import { NextResponse } from 'next/server'
import { v1Client, v2Client } from '@/lib/snappy-client'

export const dynamic = 'force-dynamic'

interface UserRecord {
  id: number
  name?: string
  first_name?: string
  last_name?: string
  email?: string
  agent_id?: number
  is_agent?: boolean
  [key: string]: unknown
}

export interface UserListItem {
  id: number
  name: string
  email: string
  is_agent: boolean
  agent_id: number | null
  v1_exists: boolean
  v2_exists: boolean
}

interface UsersListResponse {
  users: UserListItem[]
  total: number
  hasMore: boolean
}

/**
 * Derive display name from a user record.
 * Tries `name` first, then combines `first_name` + `last_name`.
 */
function getUserName(user: UserRecord): string {
  if (user.name && typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim()
  }
  const parts: string[] = []
  if (user.first_name) parts.push(String(user.first_name))
  if (user.last_name) parts.push(String(user.last_name))
  return parts.join(' ') || `User #${user.id}`
}

/**
 * Normalize a raw user record into a UserListItem.
 */
function normalizeUser(user: UserRecord, v1Exists: boolean, v2Exists: boolean): UserListItem {
  return {
    id: user.id,
    name: getUserName(user),
    email: user.email || '',
    is_agent: Boolean(user.is_agent || user.agent_id),
    agent_id: user.agent_id ?? null,
    v1_exists: v1Exists,
    v2_exists: v2Exists,
  }
}

export async function GET(
  request: Request
): Promise<NextResponse<UsersListResponse | { success: false; error: string }>> {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 200)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)

    // Query V2 users (primary source) and V1 users (for cross-reference) in parallel
    const [v2Result, v1Result] = await Promise.allSettled([
      v2Client.queryTable('user', {
        limit: limit + 1, // Fetch one extra to determine hasMore
        ...(search ? { search } : {}),
      }),
      v1Client.queryTable('user', {
        limit: 1000, // Fetch a wide range for cross-referencing by ID
        ...(search ? { search } : {}),
      }),
    ])

    // Extract V2 users - this is the primary data source
    let v2Users: UserRecord[] = []
    let v2Total = 0
    if (v2Result.status === 'fulfilled') {
      const v2Data = v2Result.value
      v2Users = (v2Data.items || v2Data.records || v2Data || []) as UserRecord[]
      v2Total = v2Data.total ?? v2Data.itemsTotal ?? v2Users.length
    } else {
      console.error('[Users List API] V2 query failed:', v2Result.reason)
      return NextResponse.json(
        {
          success: false as const,
          error: `V2 workspace query failed: ${v2Result.reason?.message || 'Unknown error'}`,
        },
        { status: 500 }
      )
    }

    // Extract V1 user IDs for existence check
    const v1UserIds = new Set<number>()
    if (v1Result.status === 'fulfilled') {
      const v1Data = v1Result.value
      const v1Users = (v1Data.items || v1Data.records || v1Data || []) as UserRecord[]
      for (const user of v1Users) {
        if (user.id) v1UserIds.add(user.id)
      }
    } else {
      console.warn(
        '[Users List API] V1 cross-reference failed (continuing with V2 only):',
        v1Result.reason
      )
    }

    // Apply offset (snappy queryTable may not support offset natively)
    const slicedUsers = v2Users.slice(offset, offset + limit + 1)
    const hasMore = slicedUsers.length > limit
    const pageUsers = slicedUsers.slice(0, limit)

    // Normalize and merge with V1 existence flags
    const users: UserListItem[] = pageUsers.map((user) =>
      normalizeUser(user, v1UserIds.has(user.id), true)
    )

    return NextResponse.json({
      users,
      total: v2Total,
      hasMore,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Users List API] Error:', message)
    return NextResponse.json({ success: false as const, error: message }, { status: 500 })
  }
}
