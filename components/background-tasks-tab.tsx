'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Loader2,
  Search,
  Clock,
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { ExportDropdown } from '@/components/export-dropdown'
import { AlertBanner } from '@/components/ui/alert-banner'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { MetricCard } from '@/components/ui/metric-card'
import { formatRelativeTime } from '@/lib/utils'
import { getAdminUrl } from '@/lib/workspace-config'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface BackgroundTask {
  id: number
  name: string
  type: string
  active: boolean
  schedule: string
  draft: boolean
  last_modified: string
  created: string
}

export function BackgroundTasksTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const { data, error, isLoading, mutate } = useSWR(
    `/api/v2/background-tasks?page=${page}&limit=50&search=${searchQuery}`,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  )

  const filteredTasks = data?.tasks || []

  // Calculate task metrics
  const taskMetrics = useMemo(() => {
    const tasks = data?.tasks || []
    const active = tasks.filter((t: BackgroundTask) => t.active).length
    const inactive = tasks.filter((t: BackgroundTask) => !t.active).length
    const drafts = tasks.filter((t: BackgroundTask) => t.draft).length
    return { total: tasks.length, active, inactive, drafts }
  }, [data?.tasks])

  // Check for inactive critical tasks (tasks that should be running but aren't)
  const inactiveCount = taskMetrics.inactive

  if (error) {
    return (
      <Card style={{ borderColor: 'var(--status-error-border)' }}>
        <CardContent className="p-6">
          <p style={{ color: 'var(--status-error)' }}>
            Error loading background tasks: {error.message}
          </p>
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
            <Clock className="h-6 w-6" />
            Background Tasks
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Scheduled Xano tasks for automated data processing and sync jobs
          </p>
          {data?.timestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {formatRelativeTime(data.timestamp)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <ExportDropdown
            data={filteredTasks.map((t: BackgroundTask) => ({
              id: t.id,
              name: t.name,
              type: t.type,
              active: t.active,
              schedule: t.schedule,
              draft: t.draft,
              last_modified: t.last_modified,
              created: t.created,
            }))}
            filename="v2-background-tasks"
            title="V2 Background Tasks Export"
            metadata={{
              filters: {
                search: searchQuery || 'none',
              },
            }}
            disabled={isLoading || filteredTasks.length === 0}
          />
        </div>
      </div>

      {/* Alert Banner for Inactive Tasks */}
      {inactiveCount > 0 && (
        <AlertBanner
          variant="info"
          title={`${inactiveCount} Task${inactiveCount > 1 ? 's' : ''} Inactive`}
          description="Some scheduled tasks are currently disabled. Review if they should be activated."
          icon={AlertTriangle}
        />
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Tasks"
          value={taskMetrics.total}
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricCard
          title="Active"
          value={taskMetrics.active}
          icon={<Play className="h-5 w-5" />}
          highlight={taskMetrics.active > 0}
        />
        <MetricCard
          title="Inactive"
          value={taskMetrics.inactive}
          icon={<Pause className="h-5 w-5" />}
        />
        <MetricCard title="Drafts" value={taskMetrics.drafts} subtitle="Not published" />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search background tasks by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1) // Reset to page 1 when searching
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Background Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Background Tasks
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Showing {filteredTasks.length} of {data?.total || 0} background tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              <div className="py-12">
                <LoadingState message="Loading background tasks..." size="lg" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No background tasks found"
                description={
                  searchQuery
                    ? `No tasks matching "${searchQuery}"`
                    : 'No scheduled tasks in this workspace'
                }
              />
            ) : (
              filteredTasks.map((task: BackgroundTask) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {task.active ? (
                            <Play
                              className="h-4 w-4 shrink-0"
                              style={{ color: 'var(--status-success)' }}
                            />
                          ) : (
                            <Pause className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <h3 className="font-mono text-sm font-medium truncate">{task.name}</h3>
                          {task.active ? (
                            <Badge
                              style={{
                                backgroundColor: 'var(--status-success-bg)',
                                color: 'var(--status-success)',
                              }}
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Inactive
                            </Badge>
                          )}
                          {task.draft && (
                            <Badge variant="outline" style={{ color: 'var(--status-warning)' }}>
                              Draft
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span>
                            Type: <code className="bg-muted px-1 rounded">{task.type}</code>
                          </span>
                          <span>•</span>
                          <span>
                            Schedule: <code className="bg-muted px-1 rounded">{task.schedule}</code>
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Modified: {new Date(task.last_modified).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.open(getAdminUrl('5', `task/${task.id}`), '_blank')
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
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
    </div>
  )
}
