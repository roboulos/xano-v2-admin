"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Zap, Clock, ExternalLink } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface BackgroundTask {
  id: number
  name: string
  path: string
  method: string
  group: 'WORKERS' | 'TASKS'
  group_id: number
  function_id?: number
  description?: string
  last_modified?: string
}

const GROUP_COLORS = {
  'WORKERS': 'bg-blue-100 text-blue-800',
  'TASKS': 'bg-purple-100 text-purple-800',
}

export function BackgroundTasksTab() {
  const [selectedGroup, setSelectedGroup] = useState<'workers' | 'tasks' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const { data, error, isLoading } = useSWR(
    `/api/v2/background-tasks?${selectedGroup ? `group=${selectedGroup}&` : ''}page=${page}&limit=50`,
    fetcher,
    { refreshInterval: 0 }
  )

  const filteredTasks = data?.tasks?.filter((task: BackgroundTask) => {
    const matchesSearch = !searchQuery ||
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.path.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  }) || []

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
      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 gap-4">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedGroup === 'workers' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedGroup(selectedGroup === 'workers' ? null : 'workers')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">WORKERS</p>
                  <p className="text-2xl font-bold">{data.summary.workers}</p>
                  <p className="text-xs text-muted-foreground mt-1">Background sync jobs</p>
                </div>
                <Badge className={GROUP_COLORS.WORKERS}>
                  <Zap className="h-3 w-3 mr-1" />
                  WORKERS
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedGroup === 'tasks' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedGroup(selectedGroup === 'tasks' ? null : 'tasks')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">TASKS</p>
                  <p className="text-2xl font-bold">{data.summary.tasks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Orchestration endpoints</p>
                </div>
                <Badge className={GROUP_COLORS.TASKS}>
                  <Clock className="h-3 w-3 mr-1" />
                  TASKS
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search background tasks by name or path..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedGroup && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGroup(null)}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Background Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Background Tasks
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Showing {filteredTasks.length} of {data?.total || 0} background tasks
            {selectedGroup && ` in ${selectedGroup.toUpperCase()}`}
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
                No background tasks found matching your criteria
              </div>
            ) : (
              filteredTasks.map((task: BackgroundTask) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {task.group === 'WORKERS' ? (
                            <Zap className="h-4 w-4 text-blue-600 shrink-0" />
                          ) : (
                            <Clock className="h-4 w-4 text-purple-600 shrink-0" />
                          )}
                          <h3 className="font-mono text-sm font-medium truncate">
                            {task.name}
                          </h3>
                          <Badge className={GROUP_COLORS[task.group]}>
                            {task.group}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {task.method}
                          </Badge>
                          <code className="text-xs text-muted-foreground truncate">
                            {task.path}
                          </code>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        )}
                        {task.last_modified && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Modified: {new Date(task.last_modified).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const baseUrl = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io'
                          window.open(`${baseUrl}/admin/#/5/api/${task.group_id}/endpoint/${task.id}`, '_blank')
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
                onClick={() => setPage(p => p - 1)}
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
                onClick={() => setPage(p => p + 1)}
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
