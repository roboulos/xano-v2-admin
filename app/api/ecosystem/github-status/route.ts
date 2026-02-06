/**
 * GET /api/ecosystem/github-status
 *
 * Proxies GitHub REST API to fetch repo status for all three
 * Agent Dashboards ecosystem projects. Server-side to avoid CORS.
 * Unauthenticated: 60 req/hr rate limit from GitHub.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const REPOS = [
  { key: 'dashboards', owner: 'scottman1078', repo: 'dashboards2.0' },
  { key: 'demo-sync', owner: 'roboulos', repo: 'v0-demo-sync-admin-interface' },
  { key: 'migration-admin', owner: 'roboulos', repo: 'xano-v2-admin' },
] as const

const GH = 'https://api.github.com'

interface RepoInfo {
  name: string
  full_name: string
  html_url: string
  description: string | null
  default_branch: string
  updated_at: string
  open_issues_count: number
  last_commit: {
    message: string
    author: string
    date: string
    sha: string
  } | null
  branches: string[]
  error?: string
}

async function fetchRepo(owner: string, repo: string, signal: AbortSignal): Promise<RepoInfo> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'xano-v2-admin',
  }

  const [repoRes, commitsRes, branchesRes] = await Promise.allSettled([
    fetch(`${GH}/repos/${owner}/${repo}`, { headers, signal }),
    fetch(`${GH}/repos/${owner}/${repo}/commits?per_page=1`, {
      headers,
      signal,
    }),
    fetch(`${GH}/repos/${owner}/${repo}/branches`, { headers, signal }),
  ])

  // Parse repo info
  let repoData: Record<string, unknown> = {}
  if (repoRes.status === 'fulfilled' && repoRes.value.ok) {
    repoData = await repoRes.value.json()
  } else {
    const reason =
      repoRes.status === 'rejected' ? repoRes.reason?.message : `HTTP ${repoRes.value.status}`
    return {
      name: repo,
      full_name: `${owner}/${repo}`,
      html_url: `https://github.com/${owner}/${repo}`,
      description: null,
      default_branch: 'main',
      updated_at: '',
      open_issues_count: 0,
      last_commit: null,
      branches: [],
      error: `Repo fetch failed: ${reason}`,
    }
  }

  // Parse last commit
  let lastCommit: RepoInfo['last_commit'] = null
  if (commitsRes.status === 'fulfilled' && commitsRes.value.ok) {
    const commits: Array<Record<string, unknown>> = await commitsRes.value.json()
    if (commits.length > 0) {
      const c = commits[0] as {
        sha: string
        commit: {
          message: string
          author: { name: string; date: string }
        }
      }
      lastCommit = {
        message: c.commit.message.split('\n')[0],
        author: c.commit.author.name,
        date: c.commit.author.date,
        sha: c.sha.slice(0, 7),
      }
    }
  }

  // Parse branches
  let branches: string[] = []
  if (branchesRes.status === 'fulfilled' && branchesRes.value.ok) {
    const branchData: Array<{ name: string }> = await branchesRes.value.json()
    branches = branchData.map((b) => b.name)
  }

  return {
    name: repoData.name as string,
    full_name: repoData.full_name as string,
    html_url: repoData.html_url as string,
    description: (repoData.description as string) ?? null,
    default_branch: (repoData.default_branch as string) ?? 'main',
    updated_at: repoData.updated_at as string,
    open_issues_count: (repoData.open_issues_count as number) ?? 0,
    last_commit: lastCommit,
    branches,
  }
}

export async function GET() {
  try {
    const signal = AbortSignal.timeout(15_000)
    const results = await Promise.allSettled(REPOS.map((r) => fetchRepo(r.owner, r.repo, signal)))

    const repos: Record<string, RepoInfo> = {}
    for (let i = 0; i < REPOS.length; i++) {
      const r = results[i]
      if (r.status === 'fulfilled') {
        repos[REPOS[i].key] = r.value
      } else {
        repos[REPOS[i].key] = {
          name: REPOS[i].repo,
          full_name: `${REPOS[i].owner}/${REPOS[i].repo}`,
          html_url: `https://github.com/${REPOS[i].owner}/${REPOS[i].repo}`,
          description: null,
          default_branch: 'main',
          updated_at: '',
          open_issues_count: 0,
          last_commit: null,
          branches: [],
          error: r.reason?.message ?? 'Unknown error',
        }
      }
    }

    // Extract rate limit from any successful response header
    let rateLimit = { remaining: -1, reset: 0 }
    for (const r of results) {
      if (r.status === 'fulfilled') break
    }
    // Rate limit is per-IP for unauthenticated, we can't easily read it
    // from allSettled results. Include placeholder.
    rateLimit = { remaining: -1, reset: 0 }

    const response = NextResponse.json({
      repos,
      rate_limit: rateLimit,
      timestamp: new Date().toISOString(),
    })
    response.headers.set('Cache-Control', 'public, s-maxage=300')
    return response
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
