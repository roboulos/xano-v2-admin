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
import { V1_TABLE_COUNT, V2_TABLE_COUNT, NAV_TAB_COUNT } from '@/lib/dashboard-constants'

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
    tech: ['Next.js 16', 'React 19', 'Real-time Data', 'Vercel'],
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  {
    key: 'demo-sync',
    name: 'v0-demo-sync-admin',
    description: 'Demo data management, 7 tabs, 188+ endpoints tested',
    tech: ['Next.js 16', 'React 19', 'Automated Tests'],
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  {
    key: 'migration-admin',
    name: 'xano-v2-admin',
    description: `V1→V2 migration admin, ${NAV_TAB_COUNT} tabs, proof system`,
    tech: ['Next.js 16', 'React 19', 'Data Caching'],
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Ecosystem Command Center</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Three projects, two Xano workspaces, one unified view
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Frontend Projects</p>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Backend Systems</p>
          <p className="text-2xl font-bold">2</p>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">V1 Tables</p>
          <p className="text-2xl font-bold">{V1_TABLE_COUNT}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">V2 Tables</p>
          <p className="text-2xl font-bold">{V2_TABLE_COUNT}</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <ServerCrash className="h-5 w-5" />
              <span>Could not load project status</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-border" />
          <h3 className="text-sm font-semibold text-muted-foreground">Frontend Projects</h3>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROJECTS.map((project) => {
            const repo = data?.repos[project.key]
            return (
              <Card key={project.key} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg font-bold">{project.name}</CardTitle>
                    {repo?.html_url && !repo?.error && (
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
                  <CardDescription className="text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {/* Tech badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <Badge key={t} variant="outline" className={`text-[11px] ${project.color}`}>
                        {t}
                      </Badge>
                    ))}
                  </div>

                  {/* Last commit */}
                  <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </>
                    ) : repo?.last_commit ? (
                      <>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <GitCommit className="h-3.5 w-3.5 shrink-0" />
                          <span className="font-mono font-semibold">{repo.last_commit.sha}</span>
                          <span>&middot;</span>
                          <span>{relativeTime(repo.last_commit.date)}</span>
                        </div>
                        <p
                          className="text-sm font-medium line-clamp-2"
                          title={repo.last_commit.message}
                        >
                          {repo.last_commit.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {repo.last_commit.author}
                        </p>
                      </>
                    ) : repo?.error ? (
                      <div className="flex items-center gap-2">
                        <ServerCrash className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Project status temporarily unavailable
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No commit data</p>
                    )}
                  </div>

                  {/* Branches */}
                  {!isLoading && repo?.branches && repo.branches.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <GitBranch className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
      </div>

      {/* Shared Backend */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-border" />
          <h3 className="text-sm font-semibold text-muted-foreground">Shared Backend</h3>
          <div className="h-px flex-1 bg-border" />
        </div>
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Unified Data Layer</CardTitle>
                <CardDescription className="text-sm">
                  All three projects connect to the same V1 and V2 backend systems
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border-2 border-blue-500/20 bg-blue-500/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">V1 System</span>
                  <Badge variant="outline" className="text-xs bg-background">
                    Production
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Current production environment</p>
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tables</span>
                    <span className="font-bold">{V1_TABLE_COUNT}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-bold">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Environment</span>
                    <span className="text-xs">Production</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border-2 border-purple-500/20 bg-purple-500/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">V2 System</span>
                  <Badge variant="outline" className="text-xs bg-background">
                    Upgraded
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Upgraded production system</p>
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tables</span>
                    <span className="font-bold">{V2_TABLE_COUNT}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-bold">Migration Target</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Environment</span>
                    <span className="text-xs">V2 Normalized</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timestamp */}
      {data?.timestamp && (
        <p className="text-[10px] text-muted-foreground text-right">
          Last fetched: {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
