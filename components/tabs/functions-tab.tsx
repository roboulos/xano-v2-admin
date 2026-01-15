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
  FolderOpen,
} from "lucide-react"

import {
  FUNCTION_MAPPINGS,
  getFunctionMappingsByCategory,
  getFunctionMappingStats,
  searchFunctionMappings,
} from "@/lib/function-mappings"
import {
  FUNCTION_CATEGORY_LABELS,
  FUNCTION_CATEGORY_ICONS,
  type FunctionCategory,
} from "@/types/mappings"
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

// Category card with collapsible function list
function FunctionCategoryCard({
  category,
  searchQuery
}: {
  category: FunctionCategory
  searchQuery: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const allFunctions = getFunctionMappingsByCategory(category)
  const filteredFunctions = searchQuery
    ? searchFunctionMappings(searchQuery).filter(f => f.category === category)
    : allFunctions

  if (filteredFunctions.length === 0) return null

  // Count mapping types
  const mappingCounts = {
    direct: filteredFunctions.filter(f => f.type === "direct").length,
    renamed: filteredFunctions.filter(f => f.type === "renamed").length,
    deprecated: filteredFunctions.filter(f => f.type === "deprecated").length,
    new: filteredFunctions.filter(f => f.type === "new").length,
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
              <span className="text-xl">{FUNCTION_CATEGORY_ICONS[category]}</span>
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {FUNCTION_CATEGORY_LABELS[category]}
                <Badge variant="secondary" className="ml-2">{filteredFunctions.length} functions</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {isOpen ? "Click to collapse" : "Click to see function mappings →"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mappingCounts.direct > 0 && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                {mappingCounts.direct} direct
              </Badge>
            )}
            {mappingCounts.renamed > 0 && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                {mappingCounts.renamed} renamed
              </Badge>
            )}
            {mappingCounts.deprecated > 0 && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {mappingCounts.deprecated} deprecated
              </Badge>
            )}
            {mappingCounts.new > 0 && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                {mappingCounts.new} new
              </Badge>
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
                <TableHead className="w-[250px] font-medium">V1 Function</TableHead>
                <TableHead className="w-[80px] font-medium">Type</TableHead>
                <TableHead className="font-medium">V2 Function(s)</TableHead>
                <TableHead className="font-medium">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFunctions.map((func) => (
                <TableRow key={func.v1_id} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      {func.folder && (
                        <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {func.folder}
                        </Badge>
                      )}
                      <span className="font-medium">{func.v1_function.split('/').pop()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <MappingTypeBadge type={func.type} />
                  </TableCell>
                  <TableCell>
                    {func.v2_functions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {func.v2_functions.map((v2Func, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {v2Func}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    {func.notes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  )
}

// Main Functions Tab component
export function FunctionsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<MappingType | "all">("all")

  const stats = useMemo(() => getFunctionMappingStats(), [])

  // Get unique categories from mappings
  const categories = useMemo(() => {
    const cats = new Set<FunctionCategory>()
    FUNCTION_MAPPINGS.forEach(m => {
      if (m.category) cats.add(m.category)
    })
    return Array.from(cats)
  }, [])

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">V1 Functions</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
              <div className="text-xs text-muted-foreground font-medium">MAPPED</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">{stats.total - stats.deprecated}</div>
              <div className="text-sm text-muted-foreground">V2 Equivalents</div>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilterType("direct")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "direct"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Direct ({stats.direct})
            </button>
            <button
              onClick={() => setFilterType("renamed")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "renamed"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              Renamed ({stats.renamed})
            </button>
            <button
              onClick={() => setFilterType("deprecated")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "deprecated"
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              Deprecated ({stats.deprecated})
            </button>
            <button
              onClick={() => setFilterType("new")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === "new"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              New ({stats.new || 0})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search functions by name, notes, or folder..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Cards */}
      <div className="space-y-3">
        {categories.map((category) => (
          <FunctionCategoryCard
            key={category}
            category={category}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  )
}
