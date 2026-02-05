'use client'

/**
 * UserPicker - Searchable combobox for selecting a user.
 *
 * Features:
 * - Type-ahead search filtering by name, email, or user ID
 * - Recently selected users shown at top (max 5, persisted to localStorage)
 * - Verified test users highlighted (user 60 = David Keener)
 * - Loading skeleton while fetching
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Updates UserContext on selection change
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Clock, ShieldCheck, User, UserCheck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { useSelectedUserId } from '@/contexts/UserContext'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserListItem {
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RECENT_USERS_KEY = 'xano-v2-admin-recent-users'
const MAX_RECENT_USERS = 5

/** Known verified test users. User 60 (David Keener) is the primary. */
const VERIFIED_USER_IDS = new Set([60])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readRecentUserIds(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_USERS_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id: unknown) => typeof id === 'number').slice(0, MAX_RECENT_USERS)
  } catch {
    return []
  }
}

function persistRecentUserIds(ids: number[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(ids.slice(0, MAX_RECENT_USERS)))
  } catch {
    // Silently ignore storage errors
  }
}

function addToRecent(userId: number, current: number[]): number[] {
  const filtered = current.filter((id) => id !== userId)
  return [userId, ...filtered].slice(0, MAX_RECENT_USERS)
}

async function fetchUsers(search?: string): Promise<UsersListResponse> {
  const params = new URLSearchParams()
  params.set('limit', '100')
  if (search && search.trim()) {
    params.set('search', search.trim())
  }
  const res = await fetch(`/api/users/list?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserPicker() {
  const { selectedUserId, setSelectedUserId } = useSelectedUserId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [recentIds, setRecentIds] = useState<number[]>(readRecentUserIds)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const listboxId = useId()

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  // Fetch users via React Query
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery<UsersListResponse>({
    queryKey: ['users-list', debouncedSearch],
    queryFn: () => fetchUsers(debouncedSearch),
    staleTime: 30_000, // 30 seconds
    enabled: open, // Only fetch when popover is open
  })

  const allUsers = useMemo(() => usersData?.users ?? [], [usersData])

  // Build the recent users list from IDs that exist in the fetched data
  const recentUsers = useMemo(() => {
    if (!allUsers.length) return []
    const userMap = new Map(allUsers.map((u) => [u.id, u]))
    return recentIds.map((id) => userMap.get(id)).filter(Boolean) as UserListItem[]
  }, [allUsers, recentIds])

  // Build the "all users" list, excluding recent users from the main list
  const nonRecentUsers = useMemo(() => {
    const recentSet = new Set(recentIds)
    return allUsers.filter((u) => !recentSet.has(u.id))
  }, [allUsers, recentIds])

  // Find the currently selected user for the trigger label
  const selectedUser = useMemo(() => {
    if (selectedUserId === null) return null
    return allUsers.find((u) => u.id === selectedUserId) ?? null
  }, [allUsers, selectedUserId])

  const handleSelect = useCallback(
    (userId: number) => {
      setSelectedUserId(userId)
      const updated = addToRecent(userId, recentIds)
      setRecentIds(updated)
      persistRecentUserIds(updated)
      setOpen(false)
      setSearch('')
    },
    [setSelectedUserId, recentIds]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label="Select user"
          className={cn(
            'flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'transition-colors min-w-[220px] max-w-[320px]'
          )}
        >
          <User className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate flex-1 text-left">
            {selectedUser
              ? `${selectedUser.name} (#${selectedUser.id})`
              : selectedUserId !== null
                ? `User #${selectedUserId}`
                : 'Select user...'}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, email, or ID..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList id={listboxId}>
            {/* Loading state */}
            {isLoading && (
              <div className="p-2 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <div className="py-6 text-center text-sm text-destructive">Failed to load users</div>
            )}

            {/* Empty state */}
            {!isLoading && !error && <CommandEmpty>No users found.</CommandEmpty>}

            {/* Recent users section */}
            {!isLoading && recentUsers.length > 0 && (
              <>
                <CommandGroup heading="Recent">
                  {recentUsers.map((user) => (
                    <UserPickerItem
                      key={`recent-${user.id}`}
                      user={user}
                      isSelected={selectedUserId === user.id}
                      isRecent
                      onSelect={handleSelect}
                    />
                  ))}
                </CommandGroup>
                {nonRecentUsers.length > 0 && <CommandSeparator />}
              </>
            )}

            {/* All users section */}
            {!isLoading && nonRecentUsers.length > 0 && (
              <CommandGroup heading={recentUsers.length > 0 ? 'All Users' : undefined}>
                {nonRecentUsers.map((user) => (
                  <UserPickerItem
                    key={user.id}
                    user={user}
                    isSelected={selectedUserId === user.id}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// UserPickerItem - individual user row
// ---------------------------------------------------------------------------

interface UserPickerItemProps {
  user: UserListItem
  isSelected: boolean
  isRecent?: boolean
  onSelect: (userId: number) => void
}

function UserPickerItem({ user, isSelected, isRecent, onSelect }: UserPickerItemProps) {
  const isVerified = VERIFIED_USER_IDS.has(user.id)

  return (
    <CommandItem
      value={`${user.name} ${user.email} ${user.id}`}
      onSelect={() => onSelect(user.id)}
      className="flex items-center gap-2"
    >
      {/* Selection check */}
      <Check className={cn('h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />

      {/* User icon */}
      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted shrink-0">
        {isVerified ? (
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
        ) : user.is_agent ? (
          <UserCheck className="h-3.5 w-3.5 text-blue-600" />
        ) : (
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>

      {/* User details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'text-sm font-medium truncate',
              isVerified && 'text-green-700 dark:text-green-400'
            )}
          >
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">#{user.id}</span>
        </div>
        {user.email && <div className="text-xs text-muted-foreground truncate">{user.email}</div>}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1 shrink-0">
        {isRecent && <Clock className="h-3 w-3 text-muted-foreground" />}
        {isVerified && (
          <Badge
            variant="outline"
            className="text-[10px] px-1 py-0 h-4 border-green-300 text-green-700 dark:text-green-400 dark:border-green-700"
          >
            Verified
          </Badge>
        )}
        {user.is_agent && !isVerified && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
            Agent
          </Badge>
        )}
      </div>
    </CommandItem>
  )
}
