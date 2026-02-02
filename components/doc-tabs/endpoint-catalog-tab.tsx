'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CodeBlock } from '@/components/ui/code-block'
import {
  ENDPOINT_CATALOG,
  getEndpointsByGroup,
  searchEndpoints,
  getAllTags,
  getAllApiGroups,
  filterByMethod,
  filterByTag,
} from '@/lib/documentation/endpoint-catalog-data'
import type { EndpointDoc } from '@/lib/documentation/types'
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    PATCH: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800',
  }
  return <Badge className={colors[method] || 'bg-gray-100 text-gray-800'}>{method}</Badge>
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-2 hover:bg-muted rounded transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  )
}

interface EndpointDetailProps {
  endpoint: EndpointDoc
  isOpen: boolean
  onToggle: () => void
}

function EndpointDetailView({ endpoint, isOpen, onToggle }: EndpointDetailProps) {
  const curlCommand = `curl -X ${endpoint.method} "https://api.example.com${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`

  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex-1 text-left flex items-center gap-3">
          <MethodBadge method={endpoint.method} />
          <div className="flex-1">
            <p className="font-semibold text-sm">{endpoint.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{endpoint.path}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 py-4 border-t space-y-4 bg-muted/20">
          {/* Description */}
          {endpoint.description && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">DESCRIPTION</p>
              <p className="text-sm">{endpoint.description}</p>
            </div>
          )}

          {/* Authentication */}
          {endpoint.authentication && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">AUTHENTICATION</p>
              <Badge variant="outline">{endpoint.authentication.type}</Badge>
              {endpoint.authentication.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {endpoint.authentication.description}
                </p>
              )}
            </div>
          )}

          {/* Parameters */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">PARAMETERS</p>
              <div className="space-y-2">
                {endpoint.parameters.map((param, idx) => (
                  <div key={idx} className="p-2 bg-background rounded border text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="font-mono">{param.name}</code>
                      <Badge variant="secondary" className="text-xs">
                        {param.in}
                      </Badge>
                      <Badge className="text-xs">{param.type}</Badge>
                      {param.required && (
                        <Badge variant="destructive" className="text-xs">
                          required
                        </Badge>
                      )}
                    </div>
                    {param.description && (
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                    )}
                    {param.example && (
                      <p className="text-xs font-mono text-muted-foreground">Ex: {param.example}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body */}
          {endpoint.request_body && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">REQUEST BODY</p>
              {endpoint.request_body.description && (
                <p className="text-xs text-muted-foreground mb-2">
                  {endpoint.request_body.description}
                </p>
              )}
              <CodeBlock
                code={JSON.stringify(
                  endpoint.request_body.example || endpoint.request_body.schema,
                  null,
                  2
                )}
                language="json"
              />
            </div>
          )}

          {/* Responses */}
          {endpoint.responses && Object.keys(endpoint.responses).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">RESPONSES</p>
              <div className="space-y-2">
                {Object.entries(endpoint.responses).map(([status, response]) => (
                  <div key={status} className="p-2 bg-background rounded border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{response.status}</Badge>
                      <span className="text-sm font-semibold">{response.description}</span>
                    </div>
                    {response.example && (
                      <CodeBlock code={JSON.stringify(response.example, null, 2)} language="json" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* cURL Example */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">cURL EXAMPLE</p>
            <div className="relative">
              <CodeBlock code={curlCommand} language="bash" />
              <div className="absolute top-2 right-2">
                <CopyButton text={curlCommand} />
              </div>
            </div>
          </div>

          {/* Tags */}
          {endpoint.tags && endpoint.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">TAGS</p>
              <div className="flex flex-wrap gap-2">
                {endpoint.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Migration Notes */}
          {endpoint.migration_notes && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs font-semibold text-blue-900 mb-1">V1 → V2 MIGRATION</p>
              <p className="text-xs text-blue-800">{endpoint.migration_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function EndpointCatalogTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(null)

  const allGroups = useMemo(() => getAllApiGroups(), [])
  const allTags = useMemo(() => getAllTags(), [])
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

  const filteredEndpoints = useMemo(() => {
    let endpoints = ENDPOINT_CATALOG

    if (searchQuery) {
      endpoints = searchEndpoints(searchQuery)
    }

    if (selectedGroup) {
      endpoints = endpoints.filter((ep) => ep.api_group === selectedGroup)
    }

    if (selectedMethod) {
      endpoints = endpoints.filter((ep) => ep.method === selectedMethod)
    }

    if (selectedTag) {
      endpoints = endpoints.filter((ep) => ep.tags?.includes(selectedTag))
    }

    return endpoints
  }, [searchQuery, selectedGroup, selectedMethod, selectedTag])

  const endpointsByGroup = useMemo(() => {
    const grouped: Record<string, EndpointDoc[]> = {}
    for (const endpoint of filteredEndpoints) {
      const groupName = endpoint.api_group || 'Other'
      if (!grouped[groupName]) {
        grouped[groupName] = []
      }
      grouped[groupName].push(endpoint)
    }
    return grouped
  }, [filteredEndpoints])

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Search & Filters</CardTitle>
          <CardDescription>Find endpoints by path, name, method, or tag</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* API Groups Filter */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">API GROUPS</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedGroup === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                {allGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedGroup === group
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Methods Filter */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">METHOD</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedMethod === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                {methods.map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedMethod === method
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">TAGS</p>
              <div className="flex flex-wrap gap-2 max-h-10 overflow-y-auto">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded text-sm transition-colors flex-shrink-0 ${
                    selectedTag === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                {allTags.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded text-sm transition-colors flex-shrink-0 ${
                      selectedTag === tag
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Found {filteredEndpoints.length} endpoint{filteredEndpoints.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Endpoints List */}
      <Tabs defaultValue={Object.keys(endpointsByGroup)[0] || 'all'} className="w-full">
        <TabsList
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))` }}
        >
          {Object.keys(endpointsByGroup).map((group) => (
            <TabsTrigger key={group} value={group} className="text-xs">
              {group} ({endpointsByGroup[group].length})
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(endpointsByGroup).map(([group, endpoints]) => (
          <TabsContent key={group} value={group} className="space-y-3 mt-4">
            {endpoints.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    No endpoints found in this group
                  </p>
                </CardContent>
              </Card>
            ) : (
              endpoints.map((endpoint) => (
                <EndpointDetailView
                  key={endpoint.id}
                  endpoint={endpoint}
                  isOpen={expandedEndpoint === endpoint.id}
                  onToggle={() =>
                    setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)
                  }
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded">
              <p className="text-xs font-semibold text-muted-foreground">Total Endpoints</p>
              <p className="text-lg font-bold mt-1">{ENDPOINT_CATALOG.length}</p>
            </div>
            <div className="p-3 border rounded">
              <p className="text-xs font-semibold text-muted-foreground">API Groups</p>
              <p className="text-lg font-bold mt-1">{allGroups.length}</p>
            </div>
            <div className="p-3 border rounded">
              <p className="text-xs font-semibold text-muted-foreground">Tags</p>
              <p className="text-lg font-bold mt-1">{allTags.length}</p>
            </div>
            <div className="p-3 border rounded">
              <p className="text-xs font-semibold text-muted-foreground">Methods</p>
              <p className="text-lg font-bold mt-1">{methods.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
