'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const priorityBadgeVariants = cva(
  'inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      priority: {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      priority: 'medium',
    },
  }
)

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface PriorityBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof priorityBadgeVariants> {
  priority: PriorityLevel
}

export function PriorityBadge({ priority, className, ...props }: PriorityBadgeProps) {
  return (
    <span className={cn(priorityBadgeVariants({ priority }), className)} {...props}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

export { priorityBadgeVariants }
