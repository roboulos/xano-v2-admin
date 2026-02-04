'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const severityBadgeVariants = cva(
  'inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      severity: {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      severity: 'medium',
    },
  }
)

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface SeverityBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof severityBadgeVariants> {
  severity: SeverityLevel
}

export function SeverityBadge({ severity, className, ...props }: SeverityBadgeProps) {
  return (
    <span className={cn(severityBadgeVariants({ severity }), className)} {...props}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}

export { severityBadgeVariants }
