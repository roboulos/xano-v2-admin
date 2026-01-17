"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Crown,
  Briefcase,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  Play,
  Eye,
  Database,
  Trash2,
  Rocket,
  AlertTriangle,
} from "lucide-react"
import { MCP_BASES } from "@/lib/mcp-endpoints"

// Demo API base URL (different from MCP_BASES)
const DEMO_BASE = "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:FhhBIJA0:v1.5"

// Demo user type matching Xano response
interface DemoUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  view: string
  account_type: string
  is_team_owner: boolean
  is_director: boolean
  team_id: number
  team_name: string
}

interface DemoPersona {
  type: string
  label: string
  description: string
  source_user: string
}

interface DemoUsersResponse {
  success: boolean
  users: DemoUser[]
  personas: Record<string, DemoPersona>
}

interface DemoAuthResponse {
  success: boolean
  authToken: string
  user: DemoUser
}

interface TableCountsResponse {
  core_tables: {
    agent: number
    listing: number
    transaction: number
    user: number
  }
  network_tables: {
    network_hierarchy: number
    network_member: number
    contribution: number
  }
  staging_tables: {
    rezen_onboarding_jobs: number
    stage_listings: number
    stage_transactions: number
  }
}

// Icon mapping based on persona type
const personaIcons: Record<string, typeof Crown> = {
  "team-owner": Crown,
  "team-member": Briefcase,
  "network-builder": TrendingUp,
}

const personaColors: Record<string, { text: string; bg: string }> = {
  "team-owner": { text: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  "team-member": { text: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  "network-builder": { text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
}

type UserCardProps = {
  user: DemoUser
  persona?: DemoPersona
  onTest: () => void
  onClear: () => void
  onOnboard: () => void
  onView: () => void
  isLoading: boolean
  isClearingOrOnboarding: "clearing" | "onboarding" | null
  testResult: { success: boolean; token?: string; error?: string } | null
}

function DemoUserCard({ user, persona, onTest, onClear, onOnboard, onView, isLoading, isClearingOrOnboarding, testResult }: UserCardProps) {
  const [copied, setCopied] = useState(false)
  const personaType = persona?.type || "team-owner"
  const Icon = personaIcons[personaType] || Crown
  const colors = personaColors[personaType] || personaColors["team-owner"]

  // Determine status for pulsing indicator
  const status = isClearingOrOnboarding
    ? "syncing"
    : isLoading
    ? "syncing"
    : testResult?.success
    ? "ready"
    : testResult?.error
    ? "error"
    : "pending"

  const copyEmail = async () => {
    await navigator.clipboard.writeText(user.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={`${colors.bg} transition-all hover:shadow-md animate-fade-in`}>
      <CardContent className="p-5">
        {/* Header with Avatar and Status Indicator */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-3 rounded-xl bg-white shadow-sm border relative`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
            {/* Pulsing Status Dot */}
            <div
              className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                status === "ready"
                  ? "bg-green-500 animate-pulse-dot"
                  : status === "syncing"
                  ? "bg-amber-500 animate-pulse"
                  : status === "error"
                  ? "bg-red-500"
                  : "bg-gray-400"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <Badge className={`${colors.bg} ${colors.text} border mb-2`}>
              {persona?.label || user.view}
            </Badge>
            <h3 className="text-lg font-bold truncate">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-xs text-muted-foreground">{persona?.description || user.account_type}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="bg-white/60 rounded-lg p-2">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono ml-2">{user.id}</span>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            <span className="text-muted-foreground">Source:</span>
            <span className="ml-2 truncate">{persona?.source_user || "N/A"}</span>
          </div>
        </div>

        {/* Team Info */}
        <div className="bg-white/60 rounded-lg p-2 mb-4 text-sm">
          <span className="text-muted-foreground">Team:</span>
          <span className="ml-2 font-medium">{user.team_name || "N/A"}</span>
          <span className="text-xs text-muted-foreground ml-2">(ID: {user.team_id})</span>
        </div>

        {/* Email with Copy */}
        <div className="flex items-center gap-2 mb-4">
          <code className="text-xs bg-white/60 px-2 py-1.5 rounded flex-1 truncate font-mono">
            {user.email}
          </code>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={copyEmail}>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Actions - Machine 2.0 Style */}
        <div className="space-y-2">
          {/* Row 1: CLEAR and ONBOARD */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onClear}
              disabled={isClearingOrOnboarding !== null}
            >
              {isClearingOrOnboarding === "clearing" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              onClick={onOnboard}
              disabled={isClearingOrOnboarding !== null}
            >
              {isClearingOrOnboarding === "onboarding" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Onboarding...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-1" />
                  Onboard
                </>
              )}
            </Button>
          </div>
          {/* Row 2: TEST and VIEW */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 ${
                testResult?.success ? "bg-green-50 border-green-200 text-green-700" :
                testResult?.error ? "bg-red-50 border-red-200 text-red-700" : ""
              }`}
              onClick={onTest}
              disabled={isLoading || isClearingOrOnboarding !== null}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : testResult?.success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Auth OK
                </>
              ) : testResult?.error ? (
                <>
                  <XCircle className="h-4 w-4 mr-1" />
                  Failed
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Test
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              disabled={isClearingOrOnboarding !== null || !testResult?.token}
              onClick={onView}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </div>

        {/* Token display if successful */}
        {testResult?.success && testResult?.token && (
          <div className="mt-3 p-2 bg-green-100 rounded text-xs">
            <span className="font-medium text-green-700">Token:</span>
            <code className="ml-1 text-green-800 break-all">{testResult.token.substring(0, 50)}...</code>
          </div>
        )}

        {/* Error display */}
        {testResult?.error && (
          <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-700">
            {testResult.error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function UsersTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([])
  const [personas, setPersonas] = useState<Record<string, DemoPersona>>({})
  const [testStates, setTestStates] = useState<Record<number, { loading: boolean; result: { success: boolean; token?: string; error?: string } | null }>>({})
  const [tableCounts, setTableCounts] = useState<TableCountsResponse | null>(null)
  const [isLoadingCounts, setIsLoadingCounts] = useState(false)
  const [actionStates, setActionStates] = useState<Record<number, "clearing" | "onboarding" | null>>({})

  // Fetch demo users from the real API endpoint
  const fetchDemoUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${DEMO_BASE}/demo-users`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data: DemoUsersResponse = await response.json()

      if (data.success && data.users) {
        setDemoUsers(data.users)
        setPersonas(data.personas || {})
      } else {
        throw new Error("Invalid response from demo-users endpoint")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load demo users")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch table counts from V2 SYSTEM endpoint
  const fetchTableCounts = useCallback(async () => {
    setIsLoadingCounts(true)
    try {
      const response = await fetch(`${MCP_BASES.SYSTEM}/table-counts`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setTableCounts(data)
    } catch (err) {
      console.error("Failed to fetch table counts:", err)
    } finally {
      setIsLoadingCounts(false)
    }
  }, [])

  useEffect(() => {
    fetchDemoUsers()
    fetchTableCounts()
  }, [fetchDemoUsers, fetchTableCounts])

  // Test demo auth endpoint - returns auth token for the user
  const handleTestAuth = async (userId: number) => {
    setTestStates(prev => ({ ...prev, [userId]: { loading: true, result: null } }))

    try {
      const response = await fetch(`${DEMO_BASE}/demo-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })
      const data: DemoAuthResponse = await response.json()

      if (response.ok && data.success && data.authToken) {
        setTestStates(prev => ({
          ...prev,
          [userId]: { loading: false, result: { success: true, token: data.authToken } }
        }))
      } else {
        throw new Error(data.success === false ? "Auth failed" : "No token returned")
      }
    } catch (err) {
      setTestStates(prev => ({
        ...prev,
        [userId]: { loading: false, result: { success: false, error: err instanceof Error ? err.message : "Auth test failed" } }
      }))
    }
  }

  // Clear user data - endpoint not yet available
  const handleClearUser = async (userId: number) => {
    const user = demoUsers.find(u => u.id === userId)
    const userName = user ? `${user.first_name} ${user.last_name}` : `User ${userId}`
    alert(`Clear endpoint not available - needs backend implementation.\n\nUser: ${userName} (ID: ${userId})`)
    // Reset test result to allow re-testing
    setTestStates(prev => ({ ...prev, [userId]: { loading: false, result: null } }))
  }

  // Onboard user - shows alert for now (full implementation in Spec 4)
  const handleOnboardUser = async (userId: number) => {
    const user = demoUsers.find(u => u.id === userId)
    const userName = user ? `${user.first_name} ${user.last_name}` : `User ${userId}`
    alert(`Starting onboarding for user ${userId}...\n\nUser: ${userName}\n\n(Full implementation will be done in Spec 4)`)
  }

  // View user - copy token to clipboard
  const handleViewUser = async (userId: number) => {
    const testResult = testStates[userId]?.result
    if (testResult?.token) {
      try {
        await navigator.clipboard.writeText(testResult.token)
        alert(`Auth token copied to clipboard!\n\nToken preview:\n${testResult.token.substring(0, 80)}...`)
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        alert(`Auth token:\n\n${testResult.token}`)
      }
    } else {
      alert("No auth token available. Please run Test first.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Demo Users */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Demo Users</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live from {DEMO_BASE}/demo-users
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {demoUsers.length} users loaded
              </Badge>
              <Button variant="outline" size="sm" onClick={fetchDemoUsers} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <XCircle className="h-4 w-4 inline mr-2" />
              {error}
              <Button variant="outline" size="sm" className="ml-4" onClick={fetchDemoUsers}>
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoUsers.map(user => (
                <DemoUserCard
                  key={user.id}
                  user={user}
                  persona={personas[String(user.id)]}
                  onTest={() => handleTestAuth(user.id)}
                  onClear={() => handleClearUser(user.id)}
                  onOnboard={() => handleOnboardUser(user.id)}
                  onView={() => handleViewUser(user.id)}
                  isLoading={testStates[user.id]?.loading || false}
                  isClearingOrOnboarding={actionStates[user.id] || null}
                  testResult={testStates[user.id]?.result || null}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: V2 Table Counts */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">V2 Table Counts</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live from {MCP_BASES.SYSTEM}/table-counts
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchTableCounts} disabled={isLoadingCounts}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingCounts ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tableCounts ? (
            <div className="space-y-4">
              {/* Core Tables */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Core Tables</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(tableCounts.core_tables).map(([key, value]) => (
                    <div key={key} className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold">{value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Network Tables */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Network Tables</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(tableCounts.network_tables).map(([key, value]) => (
                    <div key={key} className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold">{value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{key.replace(/_/g, " ")}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Staging Tables */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Staging Tables</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(tableCounts.staging_tables).map(([key, value]) => (
                    <div key={key} className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold">{value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{key.replace(/_/g, " ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isLoadingCounts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Failed to load table counts</p>
          )}
        </CardContent>
      </Card>

      {/* Section 3: V1 vs V2 User Reference */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg">V1 vs V2 Test Users</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Different users for different purposes
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Project</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">User ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="bg-purple-50/50">
                  <td className="px-4 py-3 font-medium">V2 Migration (this project)</td>
                  <td className="px-4 py-3">David Keener</td>
                  <td className="px-4 py-3 font-mono text-sm font-bold">60</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs bg-purple-100">
                      WORKERS endpoint testing
                    </Badge>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">V1 Demo Sync</td>
                  <td className="px-4 py-3 text-muted-foreground">Michael Johnson</td>
                  <td className="px-4 py-3 font-mono text-sm text-muted-foreground">7</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      Demo avatar (Team Owner)
                    </Badge>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">V1 Demo Sync</td>
                  <td className="px-4 py-3 text-muted-foreground">Sarah Williams</td>
                  <td className="px-4 py-3 font-mono text-sm text-muted-foreground">256</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      Demo avatar (Team Member)
                    </Badge>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">V1 Demo Sync</td>
                  <td className="px-4 py-3 text-muted-foreground">James Anderson</td>
                  <td className="px-4 py-3 font-mono text-sm text-muted-foreground">133</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      Demo avatar (Network Builder)
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>V2 Migration:</strong> Uses User 60 for WORKERS endpoint testing (agent_id: 37208, team_id: 1).
            <br />
            <strong>V1 Demo Sync:</strong> Uses demo avatars (7, 133, 256) for investor demonstrations.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
