"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Database,
  Home as HomeIcon,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ArrowRight,
  Layers,
  Search,
  GitBranch,
  BarChart3,
  Sparkles,
  Code2,
  Clock,
  Loader2,
  Wifi,
  WifiOff,
  Zap,
  ArrowDownRight,
  Table2,
  Key,
  Link2,
  Split,
  Columns,
} from "lucide-react"

import { V1_TABLES, V1_CATEGORIES, getV1Stats, type V1Table } from "@/lib/v1-data"
import { TABLES_DATA, getTableStats as getV2Stats } from "@/lib/v2-data"
import {
  TABLE_MAPPINGS,
  getMappingStats,
  getMapping,
  getMappedV2Tables,
  MAPPING_TYPE_COLORS,
  MAPPING_TYPE_LABELS,
  type MappingType
} from "@/lib/table-mappings"
import {
  introspectionApi,
  type ComparisonSummary,
  type ApiGroupsResponse,
  type FunctionsResponse,
  type TasksResponse,
  type TablesResponse,
  type XanoTable,
} from "@/lib/api"

type ViewMode = "live" | "mappings" | "v2only" | "stats"

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

// Schema Transformation Story Card - Shows how V1 table normalizes into V2 tables
function SchemaTransformationCard({
  v1Table,
  v2Tables,
  mapping,
  isExpanded,
  onToggle,
}: {
  v1Table: XanoTable | undefined
  v2Tables: XanoTable[]
  mapping: typeof TABLE_MAPPINGS[0]
  isExpanded: boolean
  onToggle: () => void
}) {
  const v1FieldCount = v1Table?.schema?.length || 0
  const v2TotalFields = v2Tables.reduce((sum, t) => sum + (t.schema?.length || 0), 0)

  // Find FK fields in V2 tables (fields ending with _id that reference other tables)
  const getFKFields = (table: XanoTable) => {
    return table.schema?.filter(f =>
      f.name.endsWith('_id') && f.name !== 'id'
    ) || []
  }

  return (
    <Card
      className={`transition-all duration-200 ${
        isExpanded
          ? "border-2 border-solid border-primary/30 shadow-md"
          : "border-2 border-dashed border-muted hover:border-primary/20 hover:shadow-sm"
      }`}
    >
      <CardHeader
        className="cursor-pointer select-none pb-3"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* V1 Source */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                <Table2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-mono font-semibold text-blue-700">{mapping.v1_table}</div>
                <div className="text-xs text-muted-foreground">
                  {v1FieldCount} fields
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center gap-1">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <MappingTypeBadge type={mapping.type} />
            </div>

            {/* V2 Target(s) */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg">
                {mapping.type === "split" ? (
                  <Split className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Table2 className="h-5 w-5 text-emerald-600" />
                )}
              </div>
              <div>
                {mapping.v2_tables.length > 0 ? (
                  <>
                    <div className="font-mono font-semibold text-emerald-700">
                      {mapping.v2_tables.length === 1
                        ? mapping.v2_tables[0]
                        : `${mapping.v2_tables.length} tables`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {v2TotalFields} fields total
                    </div>
                  </>
                ) : (
                  <div className="font-mono text-red-600">Deprecated</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mapping.type === "split" && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                1:{mapping.v2_tables.length} normalization
              </Badge>
            )}
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
          {/* Transformation Story */}
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{mapping.notes}</span>
            </p>
          </div>

          {mapping.type === "deprecated" ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>This table has no V2 equivalent - data merged or removed</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* V1 Schema */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
                  <Database className="h-4 w-4" />
                  V1: {mapping.v1_table}
                  <Badge variant="outline" className="ml-2">{v1FieldCount} fields</Badge>
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {v1Table?.schema?.slice(0, 20).map((field, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-1.5 text-xs border-b last:border-b-0 hover:bg-muted/30"
                      >
                        <span className="font-mono">{field.name}</span>
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {field.type}
                        </Badge>
                      </div>
                    ))}
                    {(v1Table?.schema?.length || 0) > 20 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/20">
                        +{(v1Table?.schema?.length || 0) - 20} more fields
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* V2 Schema(s) */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2 text-emerald-700">
                  <Columns className="h-4 w-4" />
                  V2: Normalized Tables
                  <Badge variant="outline" className="ml-2">{v2TotalFields} fields</Badge>
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {v2Tables.map((table) => {
                    const fkFields = getFKFields(table)
                    const isPrimary = table.name === mapping.primary_v2_table
                    return (
                      <div
                        key={table.id}
                        className={`border rounded-lg overflow-hidden ${
                          isPrimary ? "border-emerald-300 bg-emerald-50/30" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-sm">{table.name}</span>
                            {isPrimary && (
                              <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">primary</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {fkFields.length > 0 && (
                              <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                                <Key className="h-3 w-3" />
                                {fkFields.length} FK
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px]">
                              {table.schema?.length || 0} fields
                            </Badge>
                          </div>
                        </div>
                        <div className="divide-y">
                          {table.schema?.slice(0, 6).map((field, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between px-3 py-1 text-xs hover:bg-muted/20"
                            >
                              <span className={`font-mono ${field.name.endsWith('_id') && field.name !== 'id' ? 'text-amber-600' : ''}`}>
                                {field.name}
                                {field.name.endsWith('_id') && field.name !== 'id' && (
                                  <Link2 className="h-3 w-3 inline ml-1 text-amber-500" />
                                )}
                              </span>
                              <Badge variant="outline" className="text-[10px] font-normal">
                                {field.type}
                              </Badge>
                            </div>
                          ))}
                          {(table.schema?.length || 0) > 6 && (
                            <div className="px-3 py-1 text-[10px] text-muted-foreground">
                              +{(table.schema?.length || 0) - 6} more
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// Live Schema Comparison Dashboard
function LiveSchemaCard({
  v1Tables,
  v2Tables,
  isLoading,
  onRefresh,
  lastUpdated,
}: {
  v1Tables: TablesResponse | null
  v2Tables: TablesResponse | null
  isLoading: boolean
  onRefresh: () => void
  lastUpdated: Date | null
}) {
  const [expandedTable, setExpandedTable] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<MappingType | "all">("all")

  if (isLoading && !v1Tables) {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading schema data from Xano Meta API...</p>
          <p className="text-xs text-muted-foreground">Fetching field definitions for all tables</p>
        </CardContent>
      </Card>
    )
  }

  if (!v1Tables || !v2Tables) {
    return (
      <Card className="border-2 border-dashed border-red-300">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <WifiOff className="h-8 w-8 text-red-500" />
          <p className="text-muted-foreground">Failed to load schema data</p>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Create lookup maps
  const v1TableMap = new Map(v1Tables.tables.map(t => [t.name, t]))
  const v2TableMap = new Map(v2Tables.tables.map(t => [t.name, t]))

  // Filter mappings
  const filteredMappings = filterType === "all"
    ? TABLE_MAPPINGS
    : TABLE_MAPPINGS.filter(m => m.type === filterType)

  // Group by type for summary
  const mappingCounts = {
    split: TABLE_MAPPINGS.filter(m => m.type === "split").length,
    direct: TABLE_MAPPINGS.filter(m => m.type === "direct").length,
    renamed: TABLE_MAPPINGS.filter(m => m.type === "renamed").length,
    merged: TABLE_MAPPINGS.filter(m => m.type === "merged").length,
    deprecated: TABLE_MAPPINGS.filter(m => m.type === "deprecated").length,
  }

  // Calculate total field transformation
  const totalV1Fields = TABLE_MAPPINGS.reduce((sum, m) => {
    const table = v1TableMap.get(m.v1_table)
    return sum + (table?.schema?.length || 0)
  }, 0)

  const totalV2Fields = TABLE_MAPPINGS.reduce((sum, m) => {
    return sum + m.v2_tables.reduce((tSum, tName) => {
      const table = v2TableMap.get(tName)
      return tSum + (table?.schema?.length || 0)
    }, 0)
  }, 0)

  return (
    <div className="space-y-4">
      {/* Header with Summary */}
      <Card className="border-2 border-solid border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
                <Wifi className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Schema Transformation View</h3>
                <p className="text-sm text-muted-foreground">
                  How V1's denormalized schema becomes V2's clean architecture
                  {lastUpdated && (
                    <span className="ml-2 text-xs">
                      • Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button onClick={onRefresh} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* The Big Picture */}
      <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{v1Tables.total}</div>
              <div className="text-sm text-muted-foreground">V1 Tables</div>
              <div className="text-xs text-blue-600/70">~{totalV1Fields} fields</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
              <div className="text-xs text-muted-foreground font-medium">NORMALIZED</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">{v2Tables.total}</div>
              <div className="text-sm text-muted-foreground">V2 Tables</div>
              <div className="text-xs text-emerald-600/70">~{totalV2Fields} fields</div>
            </div>
          </div>

          {/* Transformation Type Summary */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              All ({TABLE_MAPPINGS.length})
            </button>
            <button
              onClick={() => setFilterType("split")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                filterType === "split"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              <Split className="h-3 w-3" />
              Split ({mappingCounts.split})
            </button>
            <button
              onClick={() => setFilterType("direct")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "direct"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Direct ({mappingCounts.direct})
            </button>
            <button
              onClick={() => setFilterType("renamed")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "renamed"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              Renamed ({mappingCounts.renamed})
            </button>
            <button
              onClick={() => setFilterType("deprecated")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "deprecated"
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              Deprecated ({mappingCounts.deprecated})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Transformation Cards */}
      <div className="space-y-3">
        {filteredMappings.map((mapping) => {
          const v1Table = v1TableMap.get(mapping.v1_table)
          const v2TablesList = mapping.v2_tables
            .map(name => v2TableMap.get(name))
            .filter((t): t is XanoTable => t !== undefined)

          return (
            <SchemaTransformationCard
              key={mapping.v1_table}
              v1Table={v1Table}
              v2Tables={v2TablesList}
              mapping={mapping}
              isExpanded={expandedTable === mapping.v1_table}
              onToggle={() => setExpandedTable(
                expandedTable === mapping.v1_table ? null : mapping.v1_table
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

// V1 Category Card with collapsible pattern matching demo-sync
function V1CategoryCard({
  category,
  tables,
  searchQuery
}: {
  category: typeof V1_CATEGORIES[0]
  tables: V1Table[]
  searchQuery: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const filteredTables = tables.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (filteredTables.length === 0 && searchQuery) return null

  // Count mapping types in this category
  const mappingCounts = {
    direct: 0,
    renamed: 0,
    split: 0,
    merged: 0,
    deprecated: 0,
  }

  for (const table of filteredTables) {
    const mapping = getMapping(table.name)
    if (mapping) {
      mappingCounts[mapping.type as keyof typeof mappingCounts]++
    }
  }

  return (
    <Card className={`transition-all duration-200 ${
      isOpen
        ? "border-2 border-solid border-primary/30 shadow-md"
        : "border-2 border-dashed border-muted hover:border-primary/20 hover:shadow-sm"
    }`}>
      <CardHeader
        className="cursor-pointer select-none pb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="text-xl">{category.icon}</span>
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {category.label}
                <Badge variant="secondary" className="ml-2">{filteredTables.length} tables</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {isOpen ? "Click to collapse" : "Click to expand and see V2 mappings →"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mappingCounts.direct > 0 && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">{mappingCounts.direct} direct</Badge>
            )}
            {mappingCounts.split > 0 && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">{mappingCounts.split} split</Badge>
            )}
            {mappingCounts.deprecated > 0 && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">{mappingCounts.deprecated} deprecated</Badge>
            )}
            {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[150px] font-medium">V1 Table</TableHead>
                <TableHead className="w-[100px] font-medium">Type</TableHead>
                <TableHead className="font-medium">V2 Table(s)</TableHead>
                <TableHead className="font-medium">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTables.map((table) => {
                const mapping = getMapping(table.name)
                return (
                  <TableRow key={table.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {table.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mapping && <MappingTypeBadge type={mapping.type} />}
                    </TableCell>
                    <TableCell>
                      {mapping && mapping.v2_tables.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {mapping.v2_tables.map((v2Table, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={`font-mono text-xs ${
                                v2Table === mapping.primary_v2_table
                                  ? "border-primary/50 bg-primary/10"
                                  : ""
                              }`}
                            >
                              {v2Table}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs">
                      {mapping?.notes || table.description}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  )
}

// V2 Only Tables Card
function V2OnlyTablesCard({ searchQuery }: { searchQuery: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const mappedV2Tables = getMappedV2Tables()
  const v2OnlyTables = TABLES_DATA.filter(t => !mappedV2Tables.includes(t.name))

  const filteredTables = v2OnlyTables.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (filteredTables.length === 0) return null

  // Group by first tag or "other"
  const groupedTables: Record<string, typeof filteredTables> = {}
  for (const table of filteredTables) {
    const category = table.tags[0] || "📦 other"
    if (!groupedTables[category]) groupedTables[category] = []
    groupedTables[category].push(table)
  }

  return (
    <Card className={`transition-all duration-200 ${
      isOpen
        ? "border-2 border-solid border-primary/30 shadow-md"
        : "border-2 border-dashed border-muted hover:border-primary/20 hover:shadow-sm"
    }`}>
      <CardHeader
        className="cursor-pointer select-none pb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                New in V2 (No V1 Source)
                <Badge variant="secondary" className="ml-2">{filteredTables.length} tables</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {isOpen ? "Click to collapse" : "Tables that exist only in the V2 normalized schema →"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">{filteredTables.length} new</Badge>
            {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {Object.entries(groupedTables).slice(0, 10).map(([category, tables]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-foreground mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {tables.slice(0, 15).map((table) => (
                    <Badge
                      key={table.id}
                      variant="outline"
                      className="font-mono text-xs"
                      title={table.description || ""}
                    >
                      {table.name}
                    </Badge>
                  ))}
                  {tables.length > 15 && (
                    <Badge variant="outline" className="text-muted-foreground text-xs">
                      +{tables.length - 15} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {Object.keys(groupedTables).length > 10 && (
              <p className="text-sm text-muted-foreground">
                +{Object.keys(groupedTables).length - 10} more categories...
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Main page component
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("live")

  // Live data state - now includes tables with schemas
  const [liveData, setLiveData] = useState<{
    summary: ComparisonSummary | null
    v1Tables: TablesResponse | null
    v2Tables: TablesResponse | null
    apiGroups: ApiGroupsResponse | null
    functions: FunctionsResponse | null
    tasks: TasksResponse | null
    isLoading: boolean
    lastUpdated: Date | null
  }>({
    summary: null,
    v1Tables: null,
    v2Tables: null,
    apiGroups: null,
    functions: null,
    tasks: null,
    isLoading: false,
    lastUpdated: null,
  })

  // Fetch live data including table schemas
  const fetchLiveData = async () => {
    setLiveData(prev => ({ ...prev, isLoading: true }))
    try {
      const [summary, v1Tables, v2Tables, apiGroups, functions, tasks] = await Promise.all([
        introspectionApi.getComparisonSummary(),
        introspectionApi.getV1Tables(),
        introspectionApi.getV2Tables(),
        introspectionApi.getApiGroups(),
        introspectionApi.getFunctions(),
        introspectionApi.getBackgroundTasks(),
      ])
      setLiveData({
        summary,
        v1Tables,
        v2Tables,
        apiGroups,
        functions,
        tasks,
        isLoading: false,
        lastUpdated: new Date(),
      })
    } catch (error) {
      console.error("Failed to fetch live data:", error)
      setLiveData(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Fetch on mount when live view is active
  useEffect(() => {
    if (viewMode === "live" && !liveData.summary && !liveData.isLoading) {
      fetchLiveData()
    }
  }, [viewMode])

  // Static stats
  const v1Stats = getV1Stats()
  const v2Stats = getV2Stats()
  const mappingStats = getMappingStats()
  const mappedV2Tables = getMappedV2Tables()
  const v2OnlyCount = TABLES_DATA.length - mappedV2Tables.length

  // Group V1 tables by category
  const v1TablesByCategory = useMemo(() => {
    const grouped: Record<string, V1Table[]> = {}
    for (const cat of V1_CATEGORIES) {
      grouped[cat.id] = V1_TABLES.filter(t => t.category === cat.id)
    }
    return grouped
  }, [])

  const viewModes = [
    { id: "live" as ViewMode, label: "Schema View", icon: Layers, description: "V1 → V2 field transformations" },
    { id: "mappings" as ViewMode, label: "Table Mappings", icon: GitBranch, description: "V1 → V2 table relationships" },
    { id: "v2only" as ViewMode, label: "V2 Only", icon: Sparkles, description: "New tables in V2 schema" },
    { id: "stats" as ViewMode, label: "Statistics", icon: BarChart3, description: "Migration overview stats" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">V1 → V2 Migration</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Layers className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                V1 → V2 Migration Admin
              </h1>
              <p className="text-muted-foreground mt-1">
                Schema Transformation & Normalization Viewer
              </p>
            </div>
          </div>

          {/* Dynamic Info Bar */}
          <div className="flex items-center gap-6 text-sm border rounded-xl px-5 py-4 bg-card/50 backdrop-blur-sm shadow-sm mt-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">V1:</span>
              <span className="font-semibold text-blue-600">
                {liveData.summary?.summary.tables.v1 || v1Stats.total} tables
              </span>
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground">V2:</span>
              <span className="font-semibold text-emerald-600">
                {liveData.summary?.summary.tables.v2 || v2Stats.total} tables
              </span>
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Split className="h-4 w-4 text-purple-500" />
              <span className="text-muted-foreground">Split:</span>
              <span className="font-semibold text-purple-600">{mappingStats.split}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {liveData.summary && (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Live Schema
                </Badge>
              )}
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {v2OnlyCount} V2 only
              </Badge>
            </div>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl w-fit">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${viewMode === mode.id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
              >
                <mode.icon className="h-4 w-4" />
                {mode.label}
              </button>
            ))}
          </div>

          {viewMode !== "live" && (
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        {/* Content based on view mode */}
        <div className="space-y-4">
          {viewMode === "live" && (
            <LiveSchemaCard
              v1Tables={liveData.v1Tables}
              v2Tables={liveData.v2Tables}
              isLoading={liveData.isLoading}
              onRefresh={fetchLiveData}
              lastUpdated={liveData.lastUpdated}
            />
          )}

          {viewMode === "mappings" && (
            <>
              {V1_CATEGORIES.map((cat) => {
                const tables = v1TablesByCategory[cat.id] || []
                if (tables.length === 0) return null
                return (
                  <V1CategoryCard
                    key={cat.id}
                    category={cat}
                    tables={tables}
                    searchQuery={searchQuery}
                  />
                )
              })}
            </>
          )}

          {viewMode === "v2only" && (
            <V2OnlyTablesCard searchQuery={searchQuery} />
          )}

          {viewMode === "stats" && (
            <>
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-blue-700">{v1Stats.total}</div>
                    <div className="text-sm text-muted-foreground">V1 Tables</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-emerald-700">{v2Stats.total}</div>
                    <div className="text-sm text-muted-foreground">V2 Tables</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-green-700">{mappingStats.total - mappingStats.deprecated}</div>
                    <div className="text-sm text-muted-foreground">V1 → V2 Mapped</div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-purple-700">{mappingStats.split}</div>
                    <div className="text-sm text-muted-foreground">Split Tables (1:N)</div>
                  </CardContent>
                </Card>
              </div>

              {/* Migration Type Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Migration Type Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-sm px-3 py-1.5">
                      {mappingStats.direct} Direct (1:1)
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-sm px-3 py-1.5">
                      {mappingStats.renamed} Renamed
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 text-sm px-3 py-1.5">
                      {mappingStats.split} Split (1:N)
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 text-sm px-3 py-1.5">
                      {mappingStats.merged} Merged (N:1)
                    </Badge>
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-sm px-3 py-1.5">
                      {mappingStats.deprecated} Deprecated
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            V1 → V2 Migration Admin • Schema Transformation Viewer
          </p>
          <p className="mt-1 text-xs">
            {liveData.summary?.summary.tables.v1 || v1Stats.total} V1 tables → {liveData.summary?.summary.tables.v2 || v2Stats.total} V2 normalized tables • {mappingStats.split} 1:N splits
          </p>
        </div>
      </div>
    </div>
  )
}
