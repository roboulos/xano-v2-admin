'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Clock, ExternalLink, Play, Pause, RefreshCw } from 'lucide-react'
import { ExportDropdown } from '@/components/export-dropdown'
import { formatRelativeTime } from '@/lib/utils'

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

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <p className="text-red-600">Error loading background tasks: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Timestamp and Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Background Tasks</h2>
          {data?.timestamp && (
            <p className="text-sm text-muted-foreground">
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

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{data?.total || 0}</h3>
              <p className="text-sm text-muted-foreground">
                Scheduled Background Tasks (Xano Tasks)
              </p>
              {data?.cache_updated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Cache updated: {new Date(data.cache_updated).toLocaleString()}
                </p>
              )}
            </div>
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

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
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No background tasks found{searchQuery && ` matching "${searchQuery}"`}
              </div>
            ) : (
              filteredTasks.map((task: BackgroundTask) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {task.active ? (
                            <Play className="h-4 w-4 text-green-600 shrink-0" />
                          ) : (
                            <Pause className="h-4 w-4 text-gray-400 shrink-0" />
                          )}
                          <h3 className="font-mono text-sm font-medium truncate">{task.name}</h3>
                          {task.active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              Inactive
                            </Badge>
                          )}
                          {task.draft && (
                            <Badge variant="outline" className="text-orange-600">
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
                          const baseUrl = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io'
                          window.open(`${baseUrl}/admin/#/5/task/${task.id}`, '_blank')
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Xano
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
