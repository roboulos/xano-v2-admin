'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical'

const priorityStyles: Record<PriorityLevel | 'default', { bg: string; text: string }> = {
  low: { bg: 'var(--status-info-bg)', text: 'var(--status-info)' },
  medium: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending)' },
  high: { bg: 'var(--status-warning-bg)', text: 'var(--status-warning)' },
  critical: { bg: 'var(--status-error-bg)', text: 'var(--status-error)' },
  default: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending)' },
}

export interface PriorityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  priority: PriorityLevel
}

export function PriorityBadge({ priority, className, ...props }: PriorityBadgeProps) {
  const style = priorityStyles[priority] || priorityStyles.default

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-semibold transition-colors',
        className
      )}
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
      {...props}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}
