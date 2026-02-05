'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  Database,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  useSelectedUserId,
  useUserData,
  type V1UserData,
  type V2UserData,
} from '@/contexts/UserContext'
import { DiffHighlight, DiffStatusBadge, DiffSummaryBar } from '@/components/diff-highlight'
import { compareFields, summarizeDiffs, formatValue, type FieldDiff } from '@/lib/diff-utils'
import { RefreshIndicator } from '@/components/refresh-indicator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Section definition for organizing the comparison view */
interface SectionDef {
  key: SectionKey
  label: string
  /** 'scalar' = single record (user, agent), 'array' = list of records */
  kind: 'scalar' | 'array'
}

type SectionKey = 'user' | 'agent' | 'transactions' | 'listings' | 'network' | 'contributions'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const V1_INSTANCE = 'xmpx-swi5-tlvy.n7c.xano.io'
const V2_INSTANCE = 'x2nu-xcjc-vhax.xano.io'

const SECTIONS: SectionDef[] = [
  { key: 'user', label: 'User', kind: 'scalar' },
  { key: 'agent', label: 'Agent', kind: 'scalar' },
  { key: 'transactions', label: 'Transactions', kind: 'array' },
  { key: 'listings', label: 'Listings', kind: 'array' },
  { key: 'network', label: 'Network', kind: 'array' },
  { key: 'contributions', label: 'Contributions', kind: 'array' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    // Silently ignore clipboard errors (e.g. permissions denied)
  })
}

/**
 * Returns the count for an array section from V1/V2 data.
 */
function getArrayCount(data: V1UserData | V2UserData | null, key: SectionKey): number | null {
  if (!data) return null
  const section = data[key]
  if (section && typeof section === 'object' && 'count' in section) {
    return (section as { count: number }).count
  }
  return null
}

/**
 * Returns the scalar record for a scalar section from V1/V2 data.
 */
function getScalarRecord(
  data: V1UserData | V2UserData | null,
  key: SectionKey
): Record<string, unknown> | null {
  if (!data) return null
  const section = data[key]
  if (section && typeof section === 'object' && !('count' in section)) {
    return section as Record<string, unknown>
  }
  return null
}

/**
 * Compute a status for a section given v1 and v2 data.
 */
function getSectionStatus(
  v1Data: V1UserData | null,
  v2Data: V2UserData | null,
  section: SectionDef
): 'match' | 'diff' | 'missing' | 'loading' {
  if (!v1Data || !v2Data) return 'loading'

  if (section.kind === 'array') {
    const v1Count = getArrayCount(v1Data, section.key)
    const v2Count = getArrayCount(v2Data, section.key)
    if (v1Count === null && v2Count === null) return 'missing'
    if (v1Count === v2Count) return 'match'
    return 'diff'
  }

  // Scalar: compare field-by-field
  const v1Record = getScalarRecord(v1Data, section.key)
  const v2Record = getScalarRecord(v2Data, section.key)
  if (!v1Record && !v2Record) return 'missing'
  if (!v1Record || !v2Record) return 'diff'

  const diffs = compareFields(v1Record, v2Record, section.key)
  const summary = summarizeDiffs(diffs)
  return summary.matchPercent === 100 ? 'match' : 'diff'
}

const SECTION_STATUS_STYLES = {
  match: {
    dot: 'bg-[var(--status-success)]',
    label: 'Match',
    border: 'border-[var(--status-success-border)]',
  },
  diff: {
    dot: 'bg-[var(--status-warning)]',
    label: 'Diff',
    border: 'border-[var(--status-warning-border)]',
  },
  missing: {
    dot: 'bg-[var(--status-error)]',
    label: 'Missing',
    border: 'border-[var(--status-error-border)]',
  },
  loading: {
    dot: 'bg-[var(--status-pending)]',
    label: 'Loading',
    border: 'border-[var(--status-pending-border)]',
  },
}

// ---------------------------------------------------------------------------
// ComparisonPanel (Main Export)
// ---------------------------------------------------------------------------

export function ComparisonPanel() {
  const { selectedUserId } = useSelectedUserId()
  const { v1Data, v2Data, totals, isLoading, isFetching, error, refreshData, lastUpdated } =
    useUserData()

  // If no user selected, show empty state
  if (selectedUserId === null) {
    return <EmptyState />
  }

  // Error state
  if (error && !isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-error-bg)]">
            <Database className="h-6 w-6 text-[var(--status-error)]" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Failed to Load Data</h3>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => refreshData()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Loading skeleton
  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <PanelHeader
        userId={selectedUserId}
        isFetching={isFetching}
        lastUpdated={lastUpdated}
        onRefresh={refreshData}
      />

      {/* Totals Summary */}
      {totals && totals.length > 0 && <TotalsSummary totals={totals} />}

      {/* Side-by-side comparison by section */}
      <div className="space-y-3">
        {SECTIONS.map((section) => (
          <SectionRow key={section.key} section={section} v1Data={v1Data} v2Data={v2Data} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PanelHeader
// ---------------------------------------------------------------------------

interface PanelHeaderProps {
  userId: number
  isFetching: boolean
  lastUpdated: Date | null
  onRefresh: () => Promise<void>
}

function PanelHeader({ userId, isFetching, lastUpdated, onRefresh }: PanelHeaderProps) {
  return (
    <div className="space-y-2">
      <Card>
        <CardHeader className="flex-row items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">User #{userId}</CardTitle>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            Refresh
          </Button>
        </CardHeader>
      </Card>
      <RefreshIndicator
        isFetching={isFetching}
        lastUpdated={lastUpdated}
        onRefresh={onRefresh}
        label="Comparison Data"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// TotalsSummary - Shows entity counts and alignment at a glance
// ---------------------------------------------------------------------------

interface TotalsSummaryProps {
  totals: {
    entity: string
    v1_count: number
    v2_count: number
    delta: number
    status: 'synced' | 'partial' | 'missing'
  }[]
}

function TotalsSummary({ totals }: TotalsSummaryProps) {
  const allSynced = totals.every((t) => t.status === 'synced')

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-3 flex items-center gap-2">
          {allSynced ? (
            <Badge
              variant="outline"
              className="border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]"
            >
              = 100% Aligned
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning)]"
            >
              ~ Partial Alignment
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{totals.length} entities compared</span>
        </div>

        {/* Responsive side-by-side header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-1 text-xs">
          <div className="font-medium text-muted-foreground">Entity</div>
          <div className="font-medium text-muted-foreground text-right">V1</div>
          <div className="font-medium text-muted-foreground text-right">V2</div>
          <div className="font-medium text-muted-foreground text-right">Delta</div>

          {totals.map((t) => {
            const statusStyle =
              t.status === 'synced'
                ? 'text-[var(--status-success)]'
                : t.status === 'partial'
                  ? 'text-[var(--status-warning)]'
                  : 'text-[var(--status-error)]'

            return (
              <div key={t.entity} className="contents">
                <div className="flex items-center gap-1.5 py-1 font-medium capitalize">
                  <span
                    className={cn(
                      'inline-block h-2 w-2 rounded-full',
                      t.status === 'synced'
                        ? 'bg-[var(--status-success)]'
                        : t.status === 'partial'
                          ? 'bg-[var(--status-warning)]'
                          : 'bg-[var(--status-error)]'
                    )}
                  />
                  {t.entity}
                </div>
                <div className="py-1 text-right font-mono tabular-nums">
                  {t.v1_count.toLocaleString()}
                </div>
                <div className="py-1 text-right font-mono tabular-nums">
                  {t.v2_count.toLocaleString()}
                </div>
                <div className={cn('py-1 text-right font-mono tabular-nums', statusStyle)}>
                  {t.delta === 0 ? '0' : t.delta > 0 ? `+${t.delta}` : t.delta}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// SectionRow - Collapsible section with side-by-side V1/V2 view
// ---------------------------------------------------------------------------

interface SectionRowProps {
  section: SectionDef
  v1Data: V1UserData | null
  v2Data: V2UserData | null
}

function SectionRow({ section, v1Data, v2Data }: SectionRowProps) {
  const [open, setOpen] = useState(false)
  const status = getSectionStatus(v1Data, v2Data, section)
  const statusStyle = SECTION_STATUS_STYLES[status]

  // Compute delta for array sections
  const v1Count = section.kind === 'array' ? getArrayCount(v1Data, section.key) : null
  const v2Count = section.kind === 'array' ? getArrayCount(v2Data, section.key) : null
  const delta = v1Count !== null && v2Count !== null ? v2Count - v1Count : null

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={cn('transition-colors', open && statusStyle.border)}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-muted/30 transition-colors rounded-xl">
            {/* Expand icon */}
            {open ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}

            {/* Status dot */}
            <span
              className={cn('inline-block h-2.5 w-2.5 rounded-full shrink-0', statusStyle.dot)}
            />

            {/* Section label */}
            <span className="font-medium flex-1">{section.label}</span>

            {/* Count comparison for array sections */}
            {section.kind === 'array' && v1Count !== null && v2Count !== null && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-muted-foreground tabular-nums">
                  V1: {v1Count.toLocaleString()}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="font-mono text-muted-foreground tabular-nums">
                  V2: {v2Count.toLocaleString()}
                </span>
                {delta !== null && delta !== 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-mono text-xs tabular-nums',
                      delta === 0
                        ? 'border-[var(--status-success-border)] text-[var(--status-success)]'
                        : 'border-[var(--status-warning-border)] text-[var(--status-warning)]'
                    )}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </Badge>
                )}
              </div>
            )}

            {/* Scalar status */}
            {section.kind === 'scalar' && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  status === 'match'
                    ? 'border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]'
                    : status === 'diff'
                      ? 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning)]'
                      : 'border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error)]'
                )}
              >
                {statusStyle.label}
              </Badge>
            )}

            {/* Array match badge */}
            {section.kind === 'array' && delta !== null && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  delta === 0
                    ? 'border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]'
                    : 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning)]'
                )}
              >
                {delta === 0 ? 'Match' : 'Diff'}
              </Badge>
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-6 py-4">
            {section.kind === 'scalar' ? (
              <ScalarDrilldown sectionKey={section.key} v1Data={v1Data} v2Data={v2Data} />
            ) : (
              <ArrayDrilldown sectionKey={section.key} v1Data={v1Data} v2Data={v2Data} />
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ---------------------------------------------------------------------------
// ScalarDrilldown - Field-level diff for scalar entities (user, agent)
// ---------------------------------------------------------------------------

interface ScalarDrilldownProps {
  sectionKey: SectionKey
  v1Data: V1UserData | null
  v2Data: V2UserData | null
}

function ScalarDrilldown({ sectionKey, v1Data, v2Data }: ScalarDrilldownProps) {
  const v1Record = getScalarRecord(v1Data, sectionKey)
  const v2Record = getScalarRecord(v2Data, sectionKey)

  if (!v1Record && !v2Record) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No data available in either V1 or V2.
      </p>
    )
  }

  if (!v1Record) {
    return (
      <p className="text-sm text-[var(--status-error)] py-4 text-center">
        Record missing in V1. V2 has data.
      </p>
    )
  }

  if (!v2Record) {
    return (
      <p className="text-sm text-[var(--status-error)] py-4 text-center">
        Record missing in V2. V1 has data.
      </p>
    )
  }

  const diffs = compareFields(v1Record, v2Record, sectionKey)

  return (
    <div className="space-y-3">
      {/* Side-by-side header */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Database className="h-3 w-3" />
            <span className="font-medium">V1</span>
            <span className="text-[10px] opacity-70">{V1_INSTANCE}</span>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Database className="h-3 w-3" />
            <span className="font-medium">V2</span>
            <span className="text-[10px] opacity-70">{V2_INSTANCE}</span>
          </div>
        </div>
      </div>

      {/* Diff display using existing DiffHighlight component */}
      <DiffHighlight diffs={diffs} displayMode="inline" showMatches />
    </div>
  )
}

// ---------------------------------------------------------------------------
// ArrayDrilldown - Count comparison for array sections
// ---------------------------------------------------------------------------

interface ArrayDrilldownProps {
  sectionKey: SectionKey
  v1Data: V1UserData | null
  v2Data: V2UserData | null
}

function ArrayDrilldown({ sectionKey, v1Data, v2Data }: ArrayDrilldownProps) {
  const v1Count = getArrayCount(v1Data, sectionKey)
  const v2Count = getArrayCount(v2Data, sectionKey)
  const delta = v1Count !== null && v2Count !== null ? v2Count - v1Count : null

  return (
    <div className="space-y-3">
      {/* Side-by-side count cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CountCard label="V1" instance={V1_INSTANCE} count={v1Count} sectionKey={sectionKey} />
        <CountCard label="V2" instance={V2_INSTANCE} count={v2Count} sectionKey={sectionKey} />
      </div>

      {/* Delta row */}
      {delta !== null && (
        <div
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border px-4 py-2',
            delta === 0
              ? 'border-[var(--status-success-border)] bg-[var(--status-success-bg)]'
              : 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)]'
          )}
        >
          <span className="text-sm font-medium">
            {delta === 0
              ? 'Records match perfectly'
              : `Delta: ${delta > 0 ? '+' : ''}${delta} records`}
          </span>
          {delta === 0 && <DiffStatusBadge status="match" />}
          {delta !== 0 && <DiffStatusBadge status="modified" />}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CountCard - Shows a single count with copy-to-clipboard
// ---------------------------------------------------------------------------

interface CountCardProps {
  label: string
  instance: string
  count: number | null
  sectionKey: string
}

function CountCard({ label, instance, count, sectionKey }: CountCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (count === null) return
    copyToClipboard(String(count))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [count])

  return (
    <div className="rounded-lg border bg-muted/20 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Database className="h-3 w-3" />
            <span className="font-medium">{label}</span>
            <span className="text-[10px] opacity-70">{instance}</span>
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {count !== null ? count.toLocaleString() : '--'}
          </div>
          <div className="text-xs text-muted-foreground capitalize">{sectionKey} records</div>
        </div>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                onClick={handleCopy}
                disabled={count === null}
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{copied ? 'Copied!' : 'Copy count'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EmptyState - Shown when no user is selected
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No User Selected</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Select a user from the picker above to compare their V1 and V2 data side by side. The
          comparison will show record counts, field-level diffs, and alignment status for each data
          section.
        </p>
        <div className="mt-4 flex justify-center">
          <Badge variant="outline" className="text-xs">
            Tip: User #60 (David Keener) is a verified test user with extensive data
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// LoadingSkeleton - Pulsing skeleton while data loads
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <Card>
        <CardHeader className="flex-row items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </CardHeader>
      </Card>

      {/* Totals skeleton */}
      <Card>
        <CardContent className="py-4">
          <Skeleton className="mb-3 h-5 w-32 rounded-full" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section skeletons */}
      {SECTIONS.map((section) => (
        <Card key={section.key}>
          <div className="flex items-center gap-3 px-6 py-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-4 w-24 flex-1" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}
