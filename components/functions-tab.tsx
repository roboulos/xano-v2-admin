"use client"

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Code, FolderTree } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Function {
  id: number
  name: string
  type: string
  category: string
  tags: string[]
  last_modified: string
  created: string
}

const CATEGORY_COLORS: Record<string, string> = {
  'Workers': 'bg-blue-100 text-blue-800',
  'Tasks': 'bg-purple-100 text-purple-800',
  'Utils': 'bg-green-100 text-green-800',
  'Archive': 'bg-gray-100 text-gray-800',
  'FUB': 'bg-orange-100 text-orange-800',
  'reZEN': 'bg-pink-100 text-pink-800',
  'SkySlope': 'bg-yellow-100 text-yellow-800',
  'DotLoop': 'bg-indigo-100 text-indigo-800',
  'Lofty': 'bg-red-100 text-red-800',
  'Title/Qualia': 'bg-teal-100 text-teal-800',
  'Other': 'bg-slate-100 text-slate-800',
}

export function FunctionsTab() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const { data, error, isLoading } = useSWR(
    `/api/v2/functions?page=${page}&limit=100`,
    fetcher,
    { refreshInterval: 0 } // Don't auto-refresh
  )

  const filteredFunctions = data?.functions?.filter((func: Function) => {
    const matchesCategory = !selectedCategory || func.category === selectedCategory
    const matchesSearch = !searchQuery ||
      func.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      func.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  }) || []

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
      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.summary.map((cat: { category: string, count: number }) => (
            <Card
              key={cat.category}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === cat.category ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(
                selectedCategory === cat.category ? null : cat.category
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{cat.category}</p>
                    <p className="text-2xl font-bold">{cat.count}</p>
                  </div>
                  <Badge className={CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other}>
                    {cat.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredFunctions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No functions found matching your criteria
              </div>
            ) : (
              filteredFunctions.map((func: Function) => (
                <Card key={func.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="h-4 w-4 text-muted-foreground shrink-0" />
                          <h3 className="font-mono text-sm font-medium truncate">
                            {func.name}
                          </h3>
                          <Badge variant="outline" className="shrink-0">
                            {func.type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge className={CATEGORY_COLORS[func.category] || CATEGORY_COLORS.Other}>
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
                        <p className="text-xs text-muted-foreground">
                          Modified: {new Date(func.last_modified).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Open function details modal with code
                          window.open(`/function/${func.id}`, '_blank')
                        }}
                      >
                        View Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {data && data.total > 100 && (
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
                Page {page} of {Math.ceil(data.total / 100)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(data.total / 100)}
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
