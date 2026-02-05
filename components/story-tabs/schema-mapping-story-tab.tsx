'use client'

import { useMemo, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Database,
  GitMerge,
  GitBranch,
  Search,
  Trash2,
  Plus,
  ArrowRightLeft,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  TABLE_MAPPINGS,
  MAPPING_TYPE_COLORS,
  MAPPING_TYPE_LABELS,
  type MappingType,
  type TableMapping,
} from '@/lib/table-mappings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_MAPPING_TYPES: MappingType[] = [
  'direct',
  'renamed',
  'split',
  'merged',
  'deprecated',
  'new',
]

const MAPPING_TYPE_ICONS: Record<MappingType, React.ComponentType<{ className?: string }>> = {
  direct: Database,
  renamed: ArrowRightLeft,
  split: GitBranch,
  merged: GitMerge,
  deprecated: Trash2,
  new: Plus,
}

const MAPPING_TYPE_DESCRIPTIONS: Record<MappingType, string> = {
  direct: '1:1 mapping, same name',
  renamed: '1:1 but different name',
  split: 'V1 table split into multiple V2 tables',
  merged: 'Multiple V1 tables merged into one V2 table',
  deprecated: 'V1 table has no V2 equivalent',
  new: 'V2 table has no V1 source',
}

/** Friendly labels for category groupings */
const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core',
  aggregation: 'Aggregation',
  fub: 'Follow Up Boss',
  rezen: 'Rezen',
  skyslope: 'SkySlope',
  dotloop: 'DotLoop',
  lofty: 'Lofty',
  stripe: 'Stripe / Billing',
  pagebuilder: 'Page Builder',
  charts: 'Charts',
  ai: 'AI / NORA',
  lambda: 'Lambda Jobs',
  logs: 'Logs & Audit',
  config: 'Configuration',
  staging: 'Staging / Import',
  other: 'Other / Misc',
  uncategorized: 'Uncategorized',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTypeCounts(mappings: TableMapping[]): Record<MappingType, number> {
  const counts: Record<MappingType, number> = {
    direct: 0,
    renamed: 0,
    split: 0,
    merged: 0,
    deprecated: 0,
    new: 0,
  }
  for (const m of mappings) {
    counts[m.type]++
  }
  return counts
}

function getCategories(mappings: TableMapping[]): string[] {
  const catSet = new Set<string>()
  for (const m of mappings) {
    catSet.add(m.category ?? 'uncategorized')
  }
  // Sort by a fixed ordering that puts core first
  const ordering = Object.keys(CATEGORY_LABELS)
  return Array.from(catSet).sort((a, b) => ordering.indexOf(a) - ordering.indexOf(b))
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Summary card for a single mapping type */
function TypeSummaryCard({
  type,
  count,
  isActive,
  onClick,
}: {
  type: MappingType
  count: number
  isActive: boolean
  onClick: () => void
}) {
  const colors = MAPPING_TYPE_COLORS[type]
  const Icon = MAPPING_TYPE_ICONS[type]

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all',
        'hover:shadow-sm cursor-pointer',
        isActive
          ? `${colors.bg} ${colors.border} ring-2 ring-offset-1 ring-current`
          : 'bg-card border-border'
      )}
    >
      <Icon className={cn('h-4 w-4', colors.text)} />
      <span className="text-2xl font-bold tabular-nums">{count}</span>
      <span className={cn('text-xs font-medium', colors.text)}>{MAPPING_TYPE_LABELS[type]}</span>
    </button>
  )
}

/** A single mapping row with expand/collapse */
function MappingRow({ mapping }: { mapping: TableMapping }) {
  const [isOpen, setIsOpen] = useState(false)
  const colors = MAPPING_TYPE_COLORS[mapping.type]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg border transition-colors',
            'hover:bg-accent/50 cursor-pointer',
            isOpen ? 'bg-accent/30 border-border' : 'bg-card border-border/60'
          )}
        >
          {/* Expand icon */}
          {isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}

          {/* V1 table name */}
          <span className="font-mono text-sm font-medium min-w-[180px]">{mapping.v1_table}</span>

          {/* Arrow */}
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

          {/* V2 table names */}
          <span className="flex-1 flex flex-wrap gap-1.5">
            {mapping.v2_tables.length > 0 ? (
              mapping.v2_tables.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className={cn('font-mono text-xs', colors.bg, colors.text, colors.border)}
                >
                  {t}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">No V2 equivalent</span>
            )}
          </span>

          {/* Type badge */}
          <Badge
            variant="outline"
            className={cn('shrink-0 text-xs', colors.bg, colors.text, colors.border)}
          >
            {MAPPING_TYPE_LABELS[mapping.type]}
          </Badge>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="ml-7 mt-1 mb-2 rounded-lg border bg-muted/30 px-4 py-3 space-y-2">
          {/* V1 label and V2 labels */}
          <div className="flex items-start gap-6 text-sm">
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                V1 Label
              </span>
              <p className="font-medium">{mapping.v1_label}</p>
            </div>
            {mapping.v2_labels.length > 0 && (
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wide">
                  V2 Labels
                </span>
                <p className="font-medium">{mapping.v2_labels.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {mapping.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">Notes</span>
              <p className="text-foreground/80">{mapping.notes}</p>
            </div>
          )}

          {/* Primary V2 table */}
          {mapping.primary_v2_table && (
            <div className="text-sm">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                Primary V2 Table
              </span>
              <p className="font-mono font-medium text-foreground/80">{mapping.primary_v2_table}</p>
            </div>
          )}

          {/* Category */}
          {mapping.category && (
            <div className="text-sm">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                Category
              </span>
              <p className="text-foreground/80">
                {CATEGORY_LABELS[mapping.category] ?? mapping.category}
              </p>
            </div>
          )}

          {/* Visual mapping for split types */}
          {mapping.type === 'split' && mapping.v2_tables.length > 1 && (
            <div className="pt-2 border-t border-border/50">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                Mapping Visualization
              </span>
              <div className="mt-2 flex items-start gap-4">
                {/* V1 side */}
                <div className="rounded border bg-card px-3 py-2 text-center min-w-[120px]">
                  <Database className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-mono text-sm font-medium">{mapping.v1_table}</p>
                  <p className="text-xs text-muted-foreground">V1</p>
                </div>

                {/* Arrows */}
                <div className="flex flex-col items-center justify-center gap-0.5 pt-3">
                  {mapping.v2_tables.map((_, i) => (
                    <ArrowRight key={i} className="h-3.5 w-3.5 text-muted-foreground" />
                  ))}
                </div>

                {/* V2 side */}
                <div className="flex flex-col gap-1.5">
                  {mapping.v2_tables.map((table, i) => (
                    <div
                      key={table}
                      className={cn(
                        'rounded border px-3 py-1.5 text-center min-w-[140px]',
                        colors.bg,
                        colors.border
                      )}
                    >
                      <p className="font-mono text-sm font-medium">{table}</p>
                      <p className="text-xs text-muted-foreground">{mapping.v2_labels[i] || ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SchemaMappingStoryTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState<MappingType | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Compute counts from the full dataset
  const typeCounts = useMemo(() => getTypeCounts(TABLE_MAPPINGS), [])
  const categories = useMemo(() => getCategories(TABLE_MAPPINGS), [])

  // Count unique V2 tables across all mappings
  const uniqueV2Count = useMemo(() => {
    const v2Set = new Set<string>()
    for (const m of TABLE_MAPPINGS) {
      for (const t of m.v2_tables) {
        v2Set.add(t)
      }
    }
    return v2Set.size
  }, [])

  // Filter mappings based on search and active type filter
  const filteredMappings = useMemo(() => {
    let result = TABLE_MAPPINGS

    // Filter by type
    if (activeType) {
      result = result.filter((m) => m.type === activeType)
    }

    // Filter by category
    if (activeCategory) {
      result = result.filter((m) => (m.category ?? 'uncategorized') === activeCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (m) =>
          m.v1_table.toLowerCase().includes(q) ||
          m.v1_label.toLowerCase().includes(q) ||
          m.v2_tables.some((t) => t.toLowerCase().includes(q)) ||
          m.v2_labels.some((l) => l.toLowerCase().includes(q)) ||
          m.notes.toLowerCase().includes(q)
      )
    }

    return result
  }, [searchQuery, activeType, activeCategory])

  // Group filtered results by category for display
  const groupedMappings = useMemo(() => {
    const groups: Record<string, TableMapping[]> = {}
    for (const m of filteredMappings) {
      const cat = m.category ?? 'uncategorized'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(m)
    }
    // Sort by category ordering
    const ordering = Object.keys(CATEGORY_LABELS)
    return Object.entries(groups).sort(([a], [b]) => ordering.indexOf(a) - ordering.indexOf(b))
  }, [filteredMappings])

  const handleTypeClick = (type: MappingType) => {
    setActiveType((prev) => (prev === type ? null : type))
  }

  const handleCategoryClick = (cat: string) => {
    setActiveCategory((prev) => (prev === cat ? null : cat))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setActiveType(null)
    setActiveCategory(null)
  }

  const hasActiveFilters = searchQuery || activeType || activeCategory

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Schema Mapping</h2>
        <p className="text-sm text-muted-foreground">
          V1 ({TABLE_MAPPINGS.length} tables) → V2 ({uniqueV2Count} unique tables) &mdash; How
          tables and fields transformed during migration
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ALL_MAPPING_TYPES.map((type) => (
          <TypeSummaryCard
            key={type}
            type={type}
            count={typeCounts[type]}
            isActive={activeType === type}
            onClick={() => handleTypeClick(type)}
          />
        ))}
      </div>

      {/* Search and Category Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Table Mappings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables by name (V1 or V2)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="shrink-0">
                Clear filters
              </Button>
            )}
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryClick(cat)}
                className="h-7 text-xs"
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </Button>
            ))}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredMappings.length} of {TABLE_MAPPINGS.length} mappings
              {activeType && (
                <Badge
                  variant="outline"
                  className={cn(
                    'ml-2 text-xs',
                    MAPPING_TYPE_COLORS[activeType].bg,
                    MAPPING_TYPE_COLORS[activeType].text,
                    MAPPING_TYPE_COLORS[activeType].border
                  )}
                >
                  {MAPPING_TYPE_LABELS[activeType]}
                </Badge>
              )}
              {activeCategory && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {CATEGORY_LABELS[activeCategory] ?? activeCategory}
                </Badge>
              )}
            </span>
            {/* Legend */}
            <div className="hidden md:flex items-center gap-3">
              {ALL_MAPPING_TYPES.filter((t) => typeCounts[t] > 0).map((type) => {
                const colors = MAPPING_TYPE_COLORS[type]
                return (
                  <span key={type} className="flex items-center gap-1">
                    <span
                      className={cn(
                        'inline-block h-2.5 w-2.5 rounded-full',
                        colors.bg,
                        colors.border,
                        'border'
                      )}
                    />
                    <span className="text-xs">{MAPPING_TYPE_LABELS[type]}</span>
                  </span>
                )
              })}
            </div>
          </div>

          {/* Mapping List grouped by category */}
          <div className="space-y-6">
            {groupedMappings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No mappings found matching your criteria.</p>
              </div>
            ) : (
              groupedMappings.map(([category, mappings]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-foreground/80">
                      {CATEGORY_LABELS[category] ?? category}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {mappings.length}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {mappings.map((mapping) => (
                      <MappingRow key={`${mapping.v1_table}-${mapping.type}`} mapping={mapping} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mapping Type Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mapping Type Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_MAPPING_TYPES.map((type) => {
              const colors = MAPPING_TYPE_COLORS[type]
              const Icon = MAPPING_TYPE_ICONS[type]
              return (
                <div
                  key={type}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3',
                    colors.bg,
                    colors.border
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', colors.text)} />
                  <div>
                    <p className={cn('text-sm font-semibold', colors.text)}>
                      {MAPPING_TYPE_LABELS[type]}
                    </p>
                    <p className="text-xs text-foreground/70">{MAPPING_TYPE_DESCRIPTIONS[type]}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
