'use client'

import { useEffect, useState } from 'react'
import {
  Building2,
  Database,
  ExternalLink,
  GitBranch,
  GitCommit,
  Loader2,
  RefreshCw,
  ServerCrash,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LastCommit {
  message: string
  author: string
  date: string
  sha: string
}

interface RepoInfo {
  name: string
  full_name: string
  html_url: string
  description: string | null
  default_branch: string
  updated_at: string
  open_issues_count: number
  last_commit: LastCommit | null
  branches: string[]
  error?: string
}

interface GitHubStatusResponse {
  repos: Record<string, RepoInfo>
  rate_limit: { remaining: number; reset: number }
  timestamp: string
}

// ---------------------------------------------------------------------------
// Static project config
// ---------------------------------------------------------------------------

const PROJECTS = [
  {
    key: 'dashboards',
    name: 'dashboards2.0',
    description: 'Production BI frontend, 22+ dashboard pages',
    tech: ['Next.js 16', 'React 19', 'SWR', 'Vercel'],
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  {
    key: 'demo-sync',
    name: 'v0-demo-sync-admin',
    description: 'Demo data management, 7 tabs, 188+ endpoints tested',
    tech: ['Next.js 16', 'React 19', 'Vitest'],
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  {
    key: 'migration-admin',
    name: 'xano-v2-admin',
    description: 'V1→V2 migration admin, 23 tabs, proof system',
    tech: ['Next.js 16', 'React 19', 'React Query'],
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(dateStr: string): string {
  if (!dateStr) return 'unknown'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EcosystemHubTab() {
  const [data, setData] = useState<GitHubStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ecosystem/github-status')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: GitHubStatusResponse = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Ecosystem Command Center</h2>
            <p className="text-sm text-muted-foreground">
              Three projects, two Xano workspaces, one unified view
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <ServerCrash className="h-5 w-5" />
              <span>GitHub API error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROJECTS.map((project) => {
          const repo = data?.repos[project.key]
          return (
            <Card key={project.key} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  {repo?.html_url && (
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <CardDescription className="text-xs">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {/* Tech badges */}
                <div className="flex flex-wrap gap-1">
                  {project.tech.map((t) => (
                    <Badge key={t} variant="outline" className={`text-[10px] ${project.color}`}>
                      {t}
                    </Badge>
                  ))}
                </div>

                {/* Last commit */}
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ) : repo?.last_commit ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <GitCommit className="h-3 w-3" />
                      <span className="font-mono">{repo.last_commit.sha}</span>
                      <span>&middot;</span>
                      <span>{relativeTime(repo.last_commit.date)}</span>
                    </div>
                    <p className="text-xs truncate" title={repo.last_commit.message}>
                      {repo.last_commit.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      by {repo.last_commit.author}
                    </p>
                  </div>
                ) : repo?.error ? (
                  <p className="text-xs text-destructive">{repo.error}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">No commit data</p>
                )}

                {/* Branches */}
                {!isLoading && repo?.branches && repo.branches.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <GitBranch className="h-3 w-3 text-muted-foreground shrink-0" />
                    {repo.branches.slice(0, 4).map((b) => (
                      <Badge
                        key={b}
                        variant={b === repo.default_branch ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {b}
                      </Badge>
                    ))}
                    {repo.branches.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{repo.branches.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Shared Backend */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Shared Xano Backend</CardTitle>
          </div>
          <CardDescription className="text-xs">
            All three projects connect to the same V1 and V2 Xano workspaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">V1 Workspace (Production)</span>
                <Badge variant="outline" className="text-[10px]">
                  Workspace 1
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">xmpx-swi5-tlvy.n7c.xano.io</p>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>251 tables</span>
                <span>&middot;</span>
                <span>25.4M+ records</span>
              </div>
            </div>
            <div className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">V2 Workspace (Normalized)</span>
                <Badge variant="outline" className="text-[10px]">
                  Workspace 5
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                x2nu-xcjc-vhax.agentdashboards.xano.io
              </p>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>193 tables</span>
                <span>&middot;</span>
                <span>V1→V2 sync: 5 entities, ~887K records</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamp */}
      {data?.timestamp && (
        <p className="text-[10px] text-muted-foreground text-right">
          Last fetched: {new Date(data.timestamp).toLocaleTimeString()}
          {data.rate_limit.remaining >= 0 &&
            ` · GitHub rate limit: ${data.rate_limit.remaining} remaining`}
        </p>
      )}
    </div>
  )
}
