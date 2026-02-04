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
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// SIMPLE STATUS BADGE (String-based, lightweight)
// ============================================================================

const simpleStatusBadgeVariants = cva(
  'inline-flex items-center justify-center rounded px-2 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      status: {
        open: 'bg-red-100 text-red-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        escalated: 'bg-orange-100 text-orange-800',
        resolved: 'bg-green-100 text-green-800',
        unresolved: 'bg-red-100 text-red-800',
        missing: 'bg-red-100 text-red-800',
        incomplete: 'bg-yellow-100 text-yellow-800',
        deprecated: 'bg-gray-100 text-gray-800',
        default: 'bg-gray-100 text-gray-800',
      },
    },
    defaultVariants: {
      status: 'default',
    },
  }
)

export type SimpleStatusType =
  | 'open'
  | 'in-progress'
  | 'escalated'
  | 'resolved'
  | 'unresolved'
  | 'missing'
  | 'incomplete'
  | 'deprecated'

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

  const formatLabel = (s: string) => {
    return s
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <span className={cn(simpleStatusBadgeVariants({ status: validStatus }), className)} {...props}>
      {formatLabel(status)}
    </span>
  )
}

export { simpleStatusBadgeVariants }

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
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    icon: <Clock className="h-4 w-4" />,
    description: 'Waiting to start',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    description: 'Currently processing',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: 'Successfully completed',
  },
  blocked: {
    label: 'Blocked',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: <AlertCircle className="h-4 w-4" />,
    description: 'Waiting on dependency',
  },
  failed: {
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
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

  const baseClasses = `inline-flex items-center gap-2 font-medium transition-colors ${className}`

  if (variant === 'compact') {
    return (
      <div
        className={`${baseClasses} px-2 py-1 rounded text-xs ${config.color} ${config.bgColor} ${
          onClick ? 'cursor-pointer hover:opacity-80' : ''
        }`}
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
        className={`${baseClasses} flex-col items-start p-3 rounded-lg border ${config.bgColor} ${
          onClick ? 'cursor-pointer hover:opacity-80' : ''
        }`}
        onClick={onClick}
      >
        <div className={`flex items-center gap-2 ${config.color}`}>
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
      className={`${baseClasses} px-3 py-1.5 rounded-full text-sm ${config.color} ${config.bgColor} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
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
      color: 'bg-green-500',
      label: 'Completed',
    },
    {
      value: inProgress,
      color: 'bg-blue-500',
      label: 'In Progress',
    },
    {
      value: blocked,
      color: 'bg-orange-500',
      label: 'Blocked',
    },
    {
      value: failed,
      color: 'bg-red-500',
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
                className={seg.color}
                style={{ width: `${(seg.value / total) * 100}%` }}
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
                <div className={`w-2 h-2 rounded-full ${seg.color}`} />
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
