'use client'

/**
 * Status Badge Component
 * Visual status indicators for migration progress
 *
 * Two variants:
 * - StatusBadge: Rich component with icons and variants (pending/in_progress/completed/blocked/failed)
 * - SimpleStatusBadge: Lightweight string-based badge for arbitrary status values
 */

import * as React from 'react'
import { CheckCircle2, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// SIMPLE STATUS BADGE (String-based, lightweight)
// ============================================================================

export type SimpleStatusType =
  | 'open'
  | 'in-progress'
  | 'escalated'
  | 'resolved'
  | 'unresolved'
  | 'missing'
  | 'incomplete'
  | 'deprecated'

const simpleStatusStyles: Record<SimpleStatusType | 'default', { bg: string; text: string }> = {
  open: { bg: 'var(--status-error-bg)', text: 'var(--status-error)' },
  'in-progress': { bg: 'var(--status-info-bg)', text: 'var(--status-info)' },
  escalated: { bg: 'var(--status-warning-bg)', text: 'var(--status-warning)' },
  resolved: { bg: 'var(--status-success-bg)', text: 'var(--status-success)' },
  unresolved: { bg: 'var(--status-error-bg)', text: 'var(--status-error)' },
  missing: { bg: 'var(--status-error-bg)', text: 'var(--status-error)' },
  incomplete: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending)' },
  deprecated: { bg: 'var(--muted)', text: 'var(--muted-foreground)' },
  default: { bg: 'var(--muted)', text: 'var(--muted-foreground)' },
}

export interface SimpleStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: SimpleStatusType | string
}

export function SimpleStatusBadge({ status, className, ...props }: SimpleStatusBadgeProps) {
  const validStatuses = [
    'open',
    'in-progress',
    'escalated',
    'resolved',
    'unresolved',
    'missing',
    'incomplete',
    'deprecated',
  ]
  const validStatus = validStatuses.includes(status) ? (status as SimpleStatusType) : 'default'
  const style = simpleStatusStyles[validStatus]

  const formatLabel = (s: string) => {
    return s
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded px-2 py-1 text-xs font-semibold transition-colors',
        className
      )}
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
      {...props}
    >
      {formatLabel(status)}
    </span>
  )
}

// ============================================================================
// RICH STATUS BADGE (With icons and variants)
// ============================================================================

export type StatusType = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed'

export interface StatusBadgeProps {
  status: StatusType
  label?: string
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
  showIcon?: boolean
  onClick?: () => void
}

const statusConfig: Record<
  StatusType,
  {
    label: string
    color: string
    bgColor: string
    icon: React.ReactNode
    description?: string
  }
> = {
  pending: {
    label: 'Pending',
    color: 'var(--status-pending)',
    bgColor: 'var(--status-pending-bg)',
    icon: <Clock className="h-4 w-4" />,
    description: 'Waiting to start',
  },
  in_progress: {
    label: 'In Progress',
    color: 'var(--status-info)',
    bgColor: 'var(--status-info-bg)',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    description: 'Currently processing',
  },
  completed: {
    label: 'Completed',
    color: 'var(--status-success)',
    bgColor: 'var(--status-success-bg)',
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: 'Successfully completed',
  },
  blocked: {
    label: 'Blocked',
    color: 'var(--status-warning)',
    bgColor: 'var(--status-warning-bg)',
    icon: <AlertCircle className="h-4 w-4" />,
    description: 'Waiting on dependency',
  },
  failed: {
    label: 'Failed',
    color: 'var(--status-error)',
    bgColor: 'var(--status-error-bg)',
    icon: <XCircle className="h-4 w-4" />,
    description: 'Error occurred',
  },
}

export function StatusBadge({
  status,
  label,
  variant = 'default',
  className = '',
  showIcon = true,
  onClick,
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const displayLabel = label || config.label

  const baseStyle = {
    color: config.color,
    backgroundColor: config.bgColor,
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 font-medium transition-colors px-2 py-1 rounded text-xs',
          onClick && 'cursor-pointer hover:opacity-80',
          className
        )}
        style={baseStyle}
        onClick={onClick}
      >
        {showIcon && config.icon}
        <span>{displayLabel}</span>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div
        className={cn(
          'inline-flex flex-col items-start p-3 rounded-lg border',
          onClick && 'cursor-pointer hover:opacity-80',
          className
        )}
        style={{ backgroundColor: config.bgColor }}
        onClick={onClick}
      >
        <div className="flex items-center gap-2" style={{ color: config.color }}>
          {showIcon && config.icon}
          <span className="font-semibold">{displayLabel}</span>
        </div>
        {config.description && (
          <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 font-medium transition-colors px-3 py-1.5 rounded-full text-sm',
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      style={baseStyle}
      onClick={onClick}
    >
      {showIcon && config.icon}
      <span>{displayLabel}</span>
    </div>
  )
}

// ============================================================================
// STATUS PROGRESS INDICATOR
// ============================================================================

export interface StatusProgressProps {
  total: number
  completed: number
  inProgress?: number
  blocked?: number
  failed?: number
  className?: string
}

export function StatusProgress({
  total,
  completed,
  inProgress = 0,
  blocked = 0,
  failed = 0,
  className = '',
}: StatusProgressProps) {
  const percentage = Math.round((completed / total) * 100)

  const segments = [
    {
      value: completed,
      color: 'var(--status-success)',
      label: 'Completed',
    },
    {
      value: inProgress,
      color: 'var(--status-info)',
      label: 'In Progress',
    },
    {
      value: blocked,
      color: 'var(--status-warning)',
      label: 'Blocked',
    },
    {
      value: failed,
      color: 'var(--status-error)',
      label: 'Failed',
    },
  ]

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Overall Progress</span>
        <span className="text-2xl font-bold">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-muted gap-0.5">
        {segments.map(
          (seg) =>
            seg.value > 0 && (
              <div
                key={seg.label}
                style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
              />
            )
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs">
        {segments.map(
          (seg) =>
            seg.value > 0 && (
              <div key={seg.label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                <span>
                  {seg.label}: {seg.value}
                </span>
              </div>
            )
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-muted-foreground pt-2 border-t">
        {completed} of {total} items completed
      </div>
    </div>
  )
}

export default StatusBadge
