'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Loader2,
  Search,
  Code,
  FolderTree,
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
} from 'lucide-react'
import { FunctionCodeModal } from '@/components/function-code-modal'
import { ExportDropdown } from '@/components/export-dropdown'
import { AlertBanner } from '@/components/ui/alert-banner'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { formatRelativeTime } from '@/lib/utils'
import {
  getTestResults,
  saveTestResult,
  saveTestResults,
  getTestStats,
  FunctionTestResult,
} from '@/lib/test-results-storage'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Function {
  id: number
  name: string
  type: string
  category: string
  folder?: string
  subFolder?: string
  tags: string[]
  last_modified: string
  created: string
}

// Category badge styles using inline styles for consistency
// These are domain categories, not status indicators
const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  Workers: { bg: 'var(--status-info-bg)', text: 'var(--status-info)' },
  Tasks: { bg: 'oklch(0.92 0.04 285)', text: 'oklch(0.45 0.12 285)' }, // purple
  Utils: { bg: 'var(--status-success-bg)', text: 'var(--status-success)' },
  Archive: { bg: 'var(--muted)', text: 'var(--muted-foreground)' },
  FUB: { bg: 'var(--status-warning-bg)', text: 'var(--status-warning)' },
  reZEN: { bg: 'oklch(0.92 0.04 340)', text: 'oklch(0.45 0.12 340)' }, // pink
  SkySlope: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending)' },
  DotLoop: { bg: 'oklch(0.92 0.04 265)', text: 'oklch(0.45 0.12 265)' }, // indigo
  Lofty: { bg: 'var(--status-error-bg)', text: 'var(--status-error)' },
  'Title/Qualia': { bg: 'oklch(0.92 0.04 175)', text: 'oklch(0.45 0.12 175)' }, // teal
  Other: { bg: 'var(--muted)', text: 'var(--muted-foreground)' },
}

export function FunctionsTab() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hideArchive, setHideArchive] = useState(true) // Hide Archive by default
  const [selectedFunction, setSelectedFunction] = useState<{ id: number; name: string } | null>(
    null
  )
  const [testResults, setTestResults] = useState<Record<number, FunctionTestResult>>({})
  const [testingFunction, setTestingFunction] = useState<number | null>(null)
  const [testingAll, setTestingAll] = useState(false)

  // Build URL with all filters
  const buildApiUrl = () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '50',
    })
    if (selectedCategory) params.set('category', selectedCategory)
    if (hideArchive) params.set('hideArchive', 'true')
    return `/api/v2/functions?${params.toString()}`
  }

  const { data, error, isLoading, mutate } = useSWR(buildApiUrl(), fetcher, {
    refreshInterval: 0, // Don't auto-refresh
    revalidateOnFocus: false,
  })

  // Load test results from localStorage on mount
  useEffect(() => {
    setTestResults(getTestResults())
  }, [])

  // Apply client-side search (category filtering is done server-side)
  const filteredFunctions =
    data?.functions?.filter((func: Function) => {
      const matchesSearch =
        !searchQuery ||
        func.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        func.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesSearch
    }) || []

  // Reset page when filters change
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    setPage(1)
  }

  const handleArchiveToggle = () => {
    setHideArchive(!hideArchive)
    setPage(1)
  }

  // Test a single function
  const testFunction = async (functionId: number) => {
    setTestingFunction(functionId)
    try {
      const response = await fetch(`/api/v2/functions/${functionId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testParams: { user_id: 7 } }), // V2 user (David Keener)
      })
      const result = await response.json()
      saveTestResult(result)
      setTestResults(getTestResults())
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setTestingFunction(null)
    }
  }

  // Test all visible functions
  const testAllVisible = async () => {
    setTestingAll(true)
    const functionIds = filteredFunctions.map((f: Function) => f.id)

    try {
      const response = await fetch('/api/v2/functions/test-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ functionIds, testParams: { user_id: 7 } }), // V2 user (David Keener)
      })
      const result = await response.json()
      if (result.success && result.results) {
        saveTestResults(result.results)
        setTestResults(getTestResults())
      }
    } catch (error) {
      console.error('Batch test failed:', error)
    } finally {
      setTestingAll(false)
    }
  }

  // Get status badge for a function
  const getStatusBadge = (functionId: number) => {
    const result = testResults[functionId]
    if (!result) {
      return (
        <Badge variant="outline" className="text-xs">
          Not Tested
        </Badge>
      )
    }

    if (result.status === 'passed') {
      return (
        <Badge
          className="text-xs"
          style={{
            backgroundColor: 'var(--status-success-bg)',
            color: 'var(--status-success)',
          }}
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Passing
        </Badge>
      )
    } else if (result.status === 'failed') {
      return (
        <Badge
          className="text-xs"
          style={{
            backgroundColor: 'var(--status-error-bg)',
            color: 'var(--status-error)',
          }}
        >
          <XCircle className="h-3 w-3 mr-1" />
          Failing
        </Badge>
      )
    } else {
      return (
        <Badge
          className="text-xs"
          style={{
            backgroundColor: 'var(--status-pending-bg)',
            color: 'var(--status-pending)',
          }}
        >
          <Clock className="h-3 w-3 mr-1" />
          Simulated
        </Badge>
      )
    }
  }

  const testStats = getTestStats()

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <p className="text-red-600">Error loading functions: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="h-6 w-6" />
            V2 Functions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and test V2 workspace functions by category
          </p>
          {data?.timestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {formatRelativeTime(data.timestamp)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={hideArchive ? 'outline' : 'default'}
            size="sm"
            onClick={handleArchiveToggle}
          >
            {hideArchive ? 'Show Archive' : 'Hide Archive'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={testAllVisible}
            disabled={testingAll || isLoading || filteredFunctions.length === 0}
          >
            <Play className={`h-4 w-4 mr-2 ${testingAll ? 'animate-spin' : ''}`} />
            Test All Visible ({filteredFunctions.length})
          </Button>
          <Button variant="outline" size="sm" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <ExportDropdown
            data={filteredFunctions.map((f: Function) => ({
              id: f.id,
              name: f.name,
              type: f.type,
              category: f.category,
              tags: f.tags.join(', '),
              test_status: testResults[f.id]?.status || 'not_tested',
              last_modified: f.last_modified,
              created: f.created,
            }))}
            filename="v2-functions"
            title="V2 Functions Export"
            metadata={{
              filters: {
                category: selectedCategory || 'all',
                search: searchQuery || 'none',
                hideArchive,
              },
            }}
            disabled={isLoading || filteredFunctions.length === 0}
          />
        </div>
      </div>

      {/* Alert Banner for Test Failures */}
      {testStats.failed > 0 && (
        <AlertBanner
          variant="warning"
          title={`${testStats.failed} Function${testStats.failed > 1 ? 's' : ''} Failing`}
          description={`${testStats.failed} of ${testStats.total} tested functions are failing. Review and fix before deployment.`}
        />
      )}

      {/* Summary Stats */}
      {data?.totalAll && (
        <div className="text-sm text-muted-foreground">
          Showing {data.total} of {data.totalAll} total functions
          {hideArchive && <span> (Archive hidden)</span>}
          {testStats.total > 0 && (
            <span className="ml-2">
              | Test Results: {testStats.passed} passed, {testStats.failed} failed,{' '}
              {testStats.simulated} simulated ({testStats.pass_rate}% pass rate)
            </span>
          )}
        </div>
      )}

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {data.summary.map((cat: { category: string; count: number }) => {
            // Skip Archive category if it's hidden (it won't be in the filtered data anyway)
            if (hideArchive && cat.category === 'Archive') {
              return null
            }

            return (
              <Card
                key={cat.category}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory === cat.category ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() =>
                  handleCategoryChange(selectedCategory === cat.category ? null : cat.category)
                }
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{cat.category}</p>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor:
                            CATEGORY_STYLES[cat.category]?.bg || CATEGORY_STYLES.Other.bg,
                          color: CATEGORY_STYLES[cat.category]?.text || CATEGORY_STYLES.Other.text,
                        }}
                      >
                        {cat.count}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">{cat.count}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search functions by name or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedCategory && (
              <Button variant="outline" size="sm" onClick={() => handleCategoryChange(null)}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Functions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            V2 Functions
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Showing {filteredFunctions.length} of {data?.total || 0} functions
            {selectedCategory && ` in ${selectedCategory}`}
            {data?.total && !selectedCategory && !searchQuery && (
              <span className="ml-2 text-muted-foreground">
                • Page {page} of {Math.ceil(data.total / 50)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              <div className="py-12">
                <LoadingState message="Loading functions..." size="lg" />
              </div>
            ) : filteredFunctions.length === 0 ? (
              <EmptyState
                icon={Code}
                title="No functions found"
                description={
                  searchQuery || selectedCategory
                    ? 'Try adjusting your search or filters'
                    : 'No functions available in this workspace'
                }
              />
            ) : (
              filteredFunctions.map((func: Function) => {
                const testResult = testResults[func.id]
                return (
                  <Card key={func.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {func.folder === 'Archive' ? (
                              <Archive className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <Code className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <h3 className="font-mono text-sm font-medium truncate">{func.name}</h3>
                            <Badge variant="outline" className="shrink-0">
                              {func.type}
                            </Badge>
                            {getStatusBadge(func.id)}
                          </div>
                          {func.subFolder && (
                            <div className="flex items-center gap-1 mb-2">
                              <FolderTree className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {func.folder}/{func.subFolder}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge
                              style={{
                                backgroundColor:
                                  CATEGORY_STYLES[func.category]?.bg || CATEGORY_STYLES.Other.bg,
                                color:
                                  CATEGORY_STYLES[func.category]?.text ||
                                  CATEGORY_STYLES.Other.text,
                              }}
                            >
                              {func.category}
                            </Badge>
                            {func.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {func.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{func.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Modified: {new Date(func.last_modified).toLocaleDateString()}</p>
                            {testResult && (
                              <p>
                                Last tested: {formatRelativeTime(testResult.tested_at)} (
                                {testResult.execution_time_ms}ms)
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testFunction(func.id)}
                            disabled={testingFunction === func.id}
                          >
                            {testingFunction === func.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFunction({ id: func.id, name: func.name })}
                          >
                            <Code className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {data && data.total > 50 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(data.total / 50)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(data.total / 50)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Function Code Modal */}
      {selectedFunction && (
        <FunctionCodeModal
          functionId={selectedFunction.id}
          workspace="5"
          functionName={selectedFunction.name}
          isOpen={!!selectedFunction}
          onClose={() => setSelectedFunction(null)}
        />
      )}
    </div>
  )
}
