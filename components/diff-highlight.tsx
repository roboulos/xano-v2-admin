'use client'

import * as React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  type DiffStatus,
  type FieldDiff,
  type DiffSummary,
  formatValue,
  statusLabel,
  statusIcon,
  summarizeDiffs,
} from '@/lib/diff-utils'

// ---------------------------------------------------------------------------
// Style Mappings (using semantic CSS tokens from globals.css)
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<DiffStatus, { className: string; badgeClass: string }> = {
  match: {
    className: 'text-[var(--status-success)]',
    badgeClass:
      'border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]',
  },
  modified: {
    className: 'text-[var(--status-warning)] bg-[var(--status-warning-bg)]',
    badgeClass:
      'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning)]',
  },
  added: {
    className: 'text-[var(--status-info)] bg-[var(--status-info-bg)]',
    badgeClass:
      'border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info)]',
  },
  removed: {
    className: 'text-[var(--status-error)] bg-[var(--status-error-bg)]',
    badgeClass:
      'border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error)]',
  },
  type_mismatch: {
    className: 'text-[var(--status-error)] bg-[var(--status-error-bg)]',
    badgeClass:
      'border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error)]',
  },
}

// ---------------------------------------------------------------------------
// DiffStatusBadge - Inline indicator for a single status
// ---------------------------------------------------------------------------

interface DiffStatusBadgeProps {
  status: DiffStatus
  className?: string
}

export function DiffStatusBadge({ status, className }: DiffStatusBadgeProps) {
  const style = STATUS_STYLES[status]
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 font-mono text-[11px] font-medium', style.badgeClass, className)}
    >
      <span aria-hidden="true">{statusIcon(status)}</span>
      <span>{statusLabel(status)}</span>
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// DiffValue - Shows a single value with tooltip for original
// ---------------------------------------------------------------------------

interface DiffValueProps {
  value: unknown
  /** Full original value shown in tooltip */
  originalValue?: unknown
  status: DiffStatus
  className?: string
}

export function DiffValue({ value, originalValue, status, className }: DiffValueProps) {
  const style = STATUS_STYLES[status]
  const formatted = formatValue(value)
  const fullValue = originalValue !== undefined ? formatValue(originalValue, 500) : formatted

  const needsTooltip = fullValue !== formatted || originalValue !== undefined

  const content = (
    <span
      className={cn(
        'inline-block rounded px-1.5 py-0.5 font-mono text-xs',
        style.className,
        className
      )}
    >
      {formatted}
    </span>
  )

  if (!needsTooltip) return content

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm break-all font-mono text-xs">
          {fullValue}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ---------------------------------------------------------------------------
// DiffFieldRow - Block display of a single field diff
// ---------------------------------------------------------------------------

interface DiffFieldRowProps {
  diff: FieldDiff
  /** "inline" shows values side-by-side; "block" stacks them */
  displayMode?: 'inline' | 'block'
  className?: string
}

export function DiffFieldRow({ diff, displayMode = 'inline', className }: DiffFieldRowProps) {
  const isRenamed = diff.v1Path && diff.v2Path && diff.v1Path !== diff.v2Path

  return (
    <div
      className={cn(
        'flex gap-3 rounded border px-3 py-2 text-sm',
        STATUS_STYLES[diff.status].className,
        'border-transparent',
        className
      )}
      role="row"
      aria-label={`${diff.field}: ${statusLabel(diff.status)}`}
    >
      {/* Status icon (not colour-only) */}
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-xs font-bold"
        aria-label={statusLabel(diff.status)}
      >
        {statusIcon(diff.status)}
      </span>

      {/* Field name */}
      <span className="min-w-[120px] shrink-0 font-medium text-foreground">
        {diff.field}
        {isRenamed && (
          <span className="ml-1 text-xs text-muted-foreground">
            (V1: {diff.v1Path} / V2: {diff.v2Path})
          </span>
        )}
      </span>

      {/* Values */}
      {displayMode === 'inline' ? (
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          {diff.status !== 'added' && (
            <DiffValue
              value={diff.v1Value}
              originalValue={diff.v1Value}
              status={diff.status === 'match' ? 'match' : 'removed'}
            />
          )}
          {diff.status !== 'added' && diff.status !== 'removed' && (
            <span className="text-muted-foreground" aria-hidden="true">
              {'\u2192'}
            </span>
          )}
          {diff.status !== 'removed' && (
            <DiffValue
              value={diff.v2Value}
              originalValue={diff.v2Value}
              status={diff.status === 'match' ? 'match' : 'added'}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          {diff.status !== 'added' && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">V1:</span>
              <DiffValue
                value={diff.v1Value}
                originalValue={diff.v1Value}
                status={diff.status === 'match' ? 'match' : 'removed'}
              />
            </div>
          )}
          {diff.status !== 'removed' && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">V2:</span>
              <DiffValue
                value={diff.v2Value}
                originalValue={diff.v2Value}
                status={diff.status === 'match' ? 'match' : 'added'}
              />
            </div>
          )}
        </div>
      )}

      {/* Status badge */}
      <DiffStatusBadge status={diff.status} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// DiffHighlight - Full diff display for an array of FieldDiffs
// ---------------------------------------------------------------------------

interface DiffHighlightProps {
  diffs: FieldDiff[]
  /** "inline" shows values side-by-side; "block" stacks them */
  displayMode?: 'inline' | 'block'
  /** Whether to show matched fields (default true) */
  showMatches?: boolean
  /** Optional className for the container */
  className?: string
}

export function DiffHighlight({
  diffs,
  displayMode = 'inline',
  showMatches = true,
  className,
}: DiffHighlightProps) {
  const filteredDiffs = showMatches ? diffs : diffs.filter((d) => d.status !== 'match')

  const summary = summarizeDiffs(diffs)

  return (
    <div className={cn('space-y-2', className)} role="table" aria-label="Field diff comparison">
      {/* Summary header */}
      <DiffSummaryBar summary={summary} />

      {/* Field rows */}
      <div className="space-y-1" role="rowgroup">
        {filteredDiffs.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No differences found</p>
        ) : (
          filteredDiffs.map((diff, i) => (
            <DiffFieldRow key={`${diff.field}-${i}`} diff={diff} displayMode={displayMode} />
          ))
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DiffSummaryBar - Shows counts of each diff status
// ---------------------------------------------------------------------------

interface DiffSummaryBarProps {
  summary: DiffSummary
  className?: string
}

export function DiffSummaryBar({ summary, className }: DiffSummaryBarProps) {
  const isFullMatch = summary.matchPercent === 100

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2',
        isFullMatch
          ? 'border-[var(--status-success-border)] bg-[var(--status-success-bg)]'
          : 'border-border bg-card',
        className
      )}
    >
      {isFullMatch ? (
        <Badge
          variant="outline"
          className="border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]"
        >
          = 100% Aligned
        </Badge>
      ) : (
        <>
          <span className="text-sm font-medium text-foreground">{summary.matchPercent}% match</span>
          <span className="text-muted-foreground">|</span>
          {summary.matches > 0 && <DiffStatusBadge status="match" />}
          {summary.matches > 0 && (
            <span className="text-xs text-muted-foreground">{summary.matches}</span>
          )}
          {summary.modified > 0 && (
            <>
              <DiffStatusBadge status="modified" />
              <span className="text-xs text-muted-foreground">{summary.modified}</span>
            </>
          )}
          {summary.added > 0 && (
            <>
              <DiffStatusBadge status="added" />
              <span className="text-xs text-muted-foreground">{summary.added}</span>
            </>
          )}
          {summary.removed > 0 && (
            <>
              <DiffStatusBadge status="removed" />
              <span className="text-xs text-muted-foreground">{summary.removed}</span>
            </>
          )}
          {summary.typeMismatches > 0 && (
            <>
              <DiffStatusBadge status="type_mismatch" />
              <span className="text-xs text-muted-foreground">{summary.typeMismatches}</span>
            </>
          )}
        </>
      )}
    </div>
  )
}
