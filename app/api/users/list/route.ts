/**
 * GET /api/users/list
 *
 * Returns a list of users from V2 workspace via Xano Meta API endpoint.
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

export const dynamic = 'force-dynamic'

const V2_USER_LIST_URL = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O/user-list'

interface V2UserRecord {
  id: number
  full_name?: string
  first_name?: string
  last_name?: string
  email?: string
  email2?: string
  agent_id?: number | null
  is_agent?: boolean
  active?: boolean
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

function getUserName(user: V2UserRecord): string {
  if (user.full_name && typeof user.full_name === 'string' && user.full_name.trim()) {
    return user.full_name.trim()
  }
  const parts: string[] = []
  if (user.first_name) parts.push(String(user.first_name))
  if (user.last_name) parts.push(String(user.last_name))
  return parts.join(' ') || `User #${user.id}`
}

function normalizeUser(user: V2UserRecord): UserListItem {
  return {
    id: user.id,
    name: getUserName(user),
    email: user.email || user.email2 || '',
    is_agent: Boolean(user.is_agent || user.agent_id),
    agent_id: user.agent_id ?? null,
    v1_exists: true, // Assume V1 exists for now (cross-ref not critical for picker)
    v2_exists: true,
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

    // Convert offset/limit to page/per_page for the Xano endpoint
    const page = Math.floor(offset / limit) + 1
    const perPage = limit + 1 // Fetch one extra to determine hasMore

    const url = new URL(V2_USER_LIST_URL)
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('page', String(page))

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[Users List API] Xano endpoint failed:', res.status, text)
      return NextResponse.json(
        { success: false as const, error: `V2 user list failed: ${res.status}` },
        { status: 500 }
      )
    }

    const data = await res.json()

    // The endpoint returns { users: [...] } with raw user records
    let rawUsers: V2UserRecord[] = Array.isArray(data.users)
      ? data.users
      : Array.isArray(data)
        ? data
        : []

    // Client-side search filter if search param is provided
    if (search) {
      const q = search.toLowerCase()
      rawUsers = rawUsers.filter((u) => {
        const name = getUserName(u).toLowerCase()
        const email = (u.email || u.email2 || '').toLowerCase()
        const idStr = String(u.id)
        return name.includes(q) || email.includes(q) || idStr.includes(q)
      })
    }

    const hasMore = rawUsers.length > limit
    const pageUsers = rawUsers.slice(0, limit)
    const users: UserListItem[] = pageUsers.map(normalizeUser)

    return NextResponse.json({
      users,
      total: rawUsers.length,
      hasMore,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Users List API] Error:', message)
    return NextResponse.json({ success: false as const, error: message }, { status: 500 })
  }
}
