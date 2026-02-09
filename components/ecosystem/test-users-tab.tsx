'use client'

import { useState } from 'react'
import { Eye, EyeOff, ExternalLink, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// ---------------------------------------------------------------------------
// Static test user data
// ---------------------------------------------------------------------------

interface TestUser {
  name: string
  role: string
  v1_user_id: number | null
  v2_user_id: number | null
  v1_agent_id: number | null
  email: string | null
  password: string | null
  projects: string[]
  notes: string
}

const TEST_USERS: TestUser[] = [
  {
    name: 'David Keener',
    role: 'Migration Test User',
    v1_user_id: 7,
    v2_user_id: 7,
    v1_agent_id: 37208,
    email: null,
    password: null,
    projects: ['xano-v2-admin'],
    notes:
      'PRIMARY test user for V1→V2 migration. user_id=7 in both workspaces. Same agent_id (37208) in both.',
  },
  {
    name: 'Michael Johnson',
    role: 'Team Owner (Admin)',
    v1_user_id: null,
    v2_user_id: null,
    v1_agent_id: null,
    email: 'michael@demo.agentdashboards.com',
    password: 'AgentDashboards143!',
    projects: ['v0-demo-sync-admin', 'dashboards2.0'],
    notes: 'Demo account. ID 7 is in the demo workspace, not V2 workspace 5.',
  },
  {
    name: 'Sarah Williams',
    role: 'Team Member',
    v1_user_id: null,
    v2_user_id: 256,
    v1_agent_id: null,
    email: 'sarah@demo.agentdashboards.com',
    password: 'AgentDashboards143!',
    projects: ['v0-demo-sync-admin', 'dashboards2.0'],
    notes: 'Demo account. Team member role.',
  },
  {
    name: 'James Anderson',
    role: 'Network Builder',
    v1_user_id: null,
    v2_user_id: 133,
    v1_agent_id: null,
    email: 'james@demo.agentdashboards.com',
    password: 'AgentDashboards143!',
    projects: ['v0-demo-sync-admin', 'dashboards2.0'],
    notes: 'Demo account. Network-focused role.',
  },
]

const PROJECT_LABELS: Record<string, { label: string; color: string }> = {
  'dashboards2.0': { label: 'Dashboards', color: 'bg-blue-500/10 text-blue-600' },
  'v0-demo-sync-admin': { label: 'Demo Sync', color: 'bg-emerald-500/10 text-emerald-600' },
  'xano-v2-admin': { label: 'Migration Admin', color: 'bg-purple-500/10 text-purple-600' },
}

const ALL_PROJECTS = ['dashboards2.0', 'v0-demo-sync-admin', 'xano-v2-admin']

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TestUsersTab() {
  const [showPasswords, setShowPasswords] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Test User Matrix</h2>
            <p className="text-sm text-muted-foreground">
              Unified view of all test and demo users across the ecosystem
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowPasswords(!showPasswords)}>
          {showPasswords ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showPasswords ? 'Hide' : 'Show'} Credentials
        </Button>
      </div>

      {/* User Matrix Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">User Details</CardTitle>
          <CardDescription className="text-xs">
            {TEST_USERS.length} test/demo users across 3 projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 px-4">Role</th>
                  <th className="text-center py-2 px-4">V1 ID</th>
                  <th className="text-center py-2 px-4">V2 ID</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-left py-2 px-4">Projects</th>
                </tr>
              </thead>
              <tbody>
                {TEST_USERS.map((user) => (
                  <tr key={user.name} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div>
                        <span className="font-medium">{user.name}</span>
                        {user.password && showPasswords && (
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            pw: {user.password}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.v1_user_id != null ? (
                        <Badge className="bg-green-500/10 text-green-600 text-[10px]">
                          #{user.v1_user_id}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.v2_user_id != null ? (
                        <Badge className="bg-blue-500/10 text-blue-600 text-[10px]">
                          #{user.v2_user_id}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.email ? (
                        <span className="text-xs font-mono">{user.email}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.projects.map((p) => {
                          const meta = PROJECT_LABELS[p]
                          return (
                            <Badge
                              key={p}
                              variant="outline"
                              className={`text-[10px] ${meta?.color ?? ''}`}
                            >
                              {meta?.label ?? p}
                            </Badge>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Project Coverage Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Project Coverage Matrix</CardTitle>
          <CardDescription className="text-xs">
            Which users are used in which projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-4">User</th>
                  {ALL_PROJECTS.map((p) => (
                    <th key={p} className="text-center py-2 px-3">
                      {PROJECT_LABELS[p]?.label ?? p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEST_USERS.map((user) => (
                  <tr key={user.name} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{user.name}</td>
                    {ALL_PROJECTS.map((p) => (
                      <td key={p} className="py-2 px-3 text-center">
                        {user.projects.includes(p) ? (
                          <span className="inline-block w-5 h-5 rounded-full bg-green-500/20 text-green-600 text-xs leading-5">
                            ✓
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">User Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {TEST_USERS.map((user) => (
            <div key={user.name} className="flex gap-3 text-xs">
              <span className="font-medium shrink-0 w-32">{user.name}</span>
              <span className="text-muted-foreground">{user.notes}</span>
              {user.v1_agent_id != null && (
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  Agent #{user.v1_agent_id}
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
