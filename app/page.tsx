"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

// Icons as simple components
function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
      <path d="M3 12A9 3 0 0 0 21 12"/>
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
      <path d="m12 5 7 7-7 7"/>
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  )
}

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

// V1 Category Card with mappings
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`transition-all duration-200 ${
        isOpen
          ? "border-2 border-solid border-teal-200 shadow-md"
          : "border-2 border-dashed border-gray-200 hover:border-teal-200 hover:shadow-sm"
      }`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <CardTitle className="text-lg">{category.label}</CardTitle>
                  <CardDescription className="text-sm">
                    {filteredTables.length} V1 tables
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {mappingCounts.direct > 0 && (
                  <Badge className="bg-green-100 text-green-700">{mappingCounts.direct} direct</Badge>
                )}
                {mappingCounts.split > 0 && (
                  <Badge className="bg-purple-100 text-purple-700">{mappingCounts.split} split</Badge>
                )}
                {mappingCounts.deprecated > 0 && (
                  <Badge className="bg-red-100 text-red-700">{mappingCounts.deprecated} deprecated</Badge>
                )}
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
            {!isOpen && (
              <p className="text-xs text-muted-foreground mt-2">Click to expand and see V2 mappings →</p>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">V1 Table</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>V2 Table(s)</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.map((table) => {
                  const mapping = getMapping(table.name)
                  return (
                    <TableRow key={table.id}>
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
                                    ? "border-teal-300 bg-teal-50"
                                    : ""
                                }`}
                              >
                                {v2Table}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs">
                        {mapping?.notes || table.description}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// V2 Only Tables Card - tables that exist in V2 but have no V1 source
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`transition-all duration-200 ${
        isOpen
          ? "border-2 border-solid border-gray-300 shadow-md"
          : "border-2 border-dashed border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <CardTitle className="text-lg">New in V2 (No V1 Source)</CardTitle>
                  <CardDescription className="text-sm">
                    {filteredTables.length} tables exist only in V2
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-700">{filteredTables.length} new</Badge>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
            {!isOpen && (
              <p className="text-xs text-muted-foreground mt-2">Click to expand and see V2-only tables →</p>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {Object.entries(groupedTables).slice(0, 10).map(([category, tables]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
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
                      <Badge variant="outline" className="text-gray-400 text-xs">
                        +{tables.length - 15} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {Object.keys(groupedTables).length > 10 && (
                <p className="text-sm text-gray-500">
                  +{Object.keys(groupedTables).length - 10} more categories...
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// Main page component
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("mapping")

  // Stats
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
                <DatabaseIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">V1 → V2 Migration Admin</h1>
                <p className="text-sm text-gray-500">Comparing AgentDashboards Workspaces</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <RefreshIcon className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid gap-4 md:grid-cols-6">
          {/* V1 Stats */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-blue-700">{v1Stats.total}</div>
              <div className="text-sm text-gray-500">V1 Tables</div>
            </CardContent>
          </Card>

          {/* Arrow */}
          <Card className="border-none shadow-none bg-transparent flex items-center justify-center">
            <ArrowRightIcon className="h-8 w-8 text-gray-400" />
          </Card>

          {/* V2 Stats */}
          <Card className="border-l-4 border-l-teal-500">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-teal-700">{v2Stats.total}</div>
              <div className="text-sm text-gray-500">V2 Tables</div>
            </CardContent>
          </Card>

          {/* Mapped */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-green-700">{mappingStats.total - mappingStats.deprecated}</div>
              <div className="text-sm text-gray-500">V1 Mapped</div>
            </CardContent>
          </Card>

          {/* Split */}
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-purple-700">{mappingStats.split}</div>
              <div className="text-sm text-gray-500">Split Tables</div>
            </CardContent>
          </Card>

          {/* V2 Only */}
          <Card className="border-l-4 border-l-gray-400">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-gray-600">{v2OnlyCount}</div>
              <div className="text-sm text-gray-500">V2 Only</div>
            </CardContent>
          </Card>
        </div>

        {/* Migration Type Summary */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">
            {mappingStats.direct} Direct (1:1)
          </Badge>
          <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1">
            {mappingStats.renamed} Renamed
          </Badge>
          <Badge className="bg-purple-100 text-purple-700 text-sm px-3 py-1">
            {mappingStats.split} Split (1:N)
          </Badge>
          <Badge className="bg-amber-100 text-amber-700 text-sm px-3 py-1">
            {mappingStats.merged} Merged (N:1)
          </Badge>
          <Badge className="bg-red-100 text-red-700 text-sm px-3 py-1">
            {mappingStats.deprecated} Deprecated
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="mapping" className="gap-2">
                <ArrowRightIcon className="h-4 w-4" />
                Table Mappings
              </TabsTrigger>
              <TabsTrigger value="v2only" className="gap-2">
                ✨ V2 Only
              </TabsTrigger>
            </TabsList>

            <div className="relative w-80">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="mapping" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="v2only" className="space-y-4">
            <V2OnlyTablesCard searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          V1 → V2 Migration Admin - Revealing the complete migration state
        </div>
      </footer>
    </div>
  )
}
