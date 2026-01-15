"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ChevronRight,
  ChevronDown,
  Search,
  ArrowRight,
  Layers,
  GitMerge,
  ArrowRightLeft,
} from "lucide-react"

import {
  ENDPOINT_MAPPINGS,
  FRONTEND_API_V2_ENDPOINTS,
  getEndpointMappingStats,
  groupByV2Target,
} from "@/lib/endpoint-mappings"
import { MAPPING_TYPE_COLORS, MAPPING_TYPE_LABELS, type MappingType } from "@/lib/table-mappings"

// Mapping type badge component
function MappingTypeBadge({ type }: { type: MappingType }) {
  const colors = MAPPING_TYPE_COLORS[type]
  const label = MAPPING_TYPE_LABELS[type]

  return (
    <Badge className={`${colors.bg} ${colors.text} ${colors.border} hover:${colors.bg}`}>
      {label}
    </Badge>
  )
}

// HTTP Method badge
function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
    PUT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
    PATCH: "bg-purple-100 text-purple-700",
  }

  return (
    <Badge variant="outline" className={`${colors[method] || "bg-gray-100 text-gray-700"} text-[10px] font-mono`}>
      {method}
    </Badge>
  )
}

// V2 Target Group Card - shows all V1 groups that merged into this V2 group
function V2TargetCard({
  v2Group,
  mappings,
  isExpanded,
  onToggle,
}: {
  v2Group: string
  mappings: typeof ENDPOINT_MAPPINGS
  isExpanded: boolean
  onToggle: () => void
}) {
  const totalV1Endpoints = mappings.reduce((sum, m) => sum + (m.endpoint_count_v1 || 0), 0)
  const v2EndpointCount = mappings[0]?.endpoint_count_v2 || 0

  // Check if this is the Frontend API v2 (the main consolidation target)
  const isFrontendAPI = v2Group === "Frontend API v2"

  return (
    <Card className={`transition-all duration-200 ${
      isExpanded
        ? "border-2 border-solid border-emerald-300 shadow-md"
        : "border-2 border-dashed border-muted hover:border-emerald-200 hover:shadow-sm"
    }`}>
      <CardHeader
        className="cursor-pointer select-none pb-3"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* V1 Sources Count */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                <Layers className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-700">{mappings.length}</div>
                <div className="text-xs text-muted-foreground">V1 Groups</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center gap-1">
              <GitMerge className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* V2 Target */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg">
                <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-emerald-700">{v2Group}</div>
                <div className="text-xs text-muted-foreground">
                  {mappings[0]?.v2_canonicals?.[0]}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm">
                <span className="text-blue-600 font-medium">{totalV1Endpoints}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-emerald-600 font-medium">{v2EndpointCount}</span>
                <span className="text-muted-foreground text-xs"> endpoints</span>
              </div>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {mappings.length}:1 consolidation
            </Badge>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* V1 Groups that merged */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-blue-700">V1 API Groups Merged:</h4>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-medium">V1 Group</TableHead>
                  <TableHead className="w-[150px] font-medium">Canonical</TableHead>
                  <TableHead className="w-[100px] font-medium">Endpoints</TableHead>
                  <TableHead className="font-medium">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.v1_id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{mapping.v1_group}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {mapping.v1_canonical}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{mapping.endpoint_count_v1}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {mapping.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Show sample V2 endpoints for Frontend API */}
          {isFrontendAPI && FRONTEND_API_V2_ENDPOINTS.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-emerald-700">Sample V2 Endpoints:</h4>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  {FRONTEND_API_V2_ENDPOINTS.slice(0, 15).map((endpoint, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 text-sm border-b last:border-b-0 hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <MethodBadge method={endpoint.method} />
                        <span className="font-mono text-xs">{endpoint.path}</span>
                      </div>
                      {endpoint.auth_required && (
                        <Badge variant="outline" className="text-[10px]">🔐 Auth</Badge>
                      )}
                    </div>
                  ))}
                  {FRONTEND_API_V2_ENDPOINTS.length > 15 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/20">
                      +{FRONTEND_API_V2_ENDPOINTS.length - 15} more endpoints
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// Direct/Renamed mapping card (1:1 mappings)
function DirectMappingCard({
  mapping,
  isExpanded,
  onToggle,
}: {
  mapping: typeof ENDPOINT_MAPPINGS[0]
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <Card className={`transition-all duration-200 ${
      isExpanded
        ? "border-2 border-solid border-primary/30 shadow-md"
        : "border-2 border-dashed border-muted hover:border-primary/20 hover:shadow-sm"
    }`}>
      <CardHeader
        className="cursor-pointer select-none pb-3"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                <Layers className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-mono text-sm font-medium text-blue-700">{mapping.v1_group}</div>
                <div className="text-xs text-muted-foreground">{mapping.v1_canonical}</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <MappingTypeBadge type={mapping.type} />
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg">
                <Layers className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-mono text-sm font-medium text-emerald-700">
                  {mapping.v2_groups[0]}
                </div>
                <div className="text-xs text-muted-foreground">{mapping.v2_canonicals[0]}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline">
              {mapping.endpoint_count_v1} endpoints
            </Badge>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{mapping.notes}</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Main Endpoints Tab component
export function EndpointsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"consolidated" | "all">("consolidated")

  const stats = useMemo(() => getEndpointMappingStats(), [])
  const groupedByV2 = useMemo(() => groupByV2Target(), [])

  // Filter mappings based on search
  const filteredMappings = useMemo(() => {
    if (!searchQuery) return ENDPOINT_MAPPINGS
    const query = searchQuery.toLowerCase()
    return ENDPOINT_MAPPINGS.filter(m =>
      m.v1_group.toLowerCase().includes(query) ||
      m.v2_groups.some(g => g.toLowerCase().includes(query)) ||
      m.notes.toLowerCase().includes(query) ||
      m.v1_canonical.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">{stats.v1_groups}</div>
              <div className="text-sm text-muted-foreground">V1 API Groups</div>
              <div className="text-xs text-indigo-600/70">{stats.v1_endpoints}+ endpoints</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <GitMerge className="h-8 w-8 text-muted-foreground" />
              <div className="text-xs text-muted-foreground font-medium">CONSOLIDATED</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-violet-600">{stats.v2_groups}</div>
              <div className="text-sm text-muted-foreground">V2 API Groups</div>
              <div className="text-xs text-violet-600/70">{stats.v2_endpoints}+ endpoints</div>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setViewMode("consolidated")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "consolidated"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              By V2 Target ({groupedByV2.size} groups)
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              All Mappings ({ENDPOINT_MAPPINGS.length})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search API groups by name, canonical path, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Consolidated View - Grouped by V2 target */}
      {viewMode === "consolidated" && (
        <div className="space-y-3">
          {Array.from(groupedByV2.entries()).map(([v2Group, mappings]) => (
            <V2TargetCard
              key={v2Group}
              v2Group={v2Group}
              mappings={mappings}
              isExpanded={expandedCard === v2Group}
              onToggle={() => setExpandedCard(expandedCard === v2Group ? null : v2Group)}
            />
          ))}
        </div>
      )}

      {/* All Mappings View */}
      {viewMode === "all" && (
        <div className="space-y-3">
          {filteredMappings.map((mapping) => (
            <DirectMappingCard
              key={mapping.v1_id}
              mapping={mapping}
              isExpanded={expandedCard === `mapping-${mapping.v1_id}`}
              onToggle={() => setExpandedCard(
                expandedCard === `mapping-${mapping.v1_id}` ? null : `mapping-${mapping.v1_id}`
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
