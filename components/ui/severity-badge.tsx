'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

const severityStyles: Record<SeverityLevel | 'default', { bg: string; text: string }> = {
  low: { bg: 'var(--status-info-bg)', text: 'var(--status-info)' },
  medium: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending)' },
  high: { bg: 'var(--status-warning-bg)', text: 'var(--status-warning)' },
  critical: { bg: 'var(--status-error-bg)', text: 'var(--status-error)' },
  default: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending)' },
}

export interface SeverityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity: SeverityLevel
}

export function SeverityBadge({ severity, className, ...props }: SeverityBadgeProps) {
  const style = severityStyles[severity] || severityStyles.default

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
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}
