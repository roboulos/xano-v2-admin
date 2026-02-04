'use client'

import * as React from 'react'
import { LucideIcon, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon to display above the text */
  icon?: LucideIcon
  /** Title text displayed prominently */
  title: string
  /** Optional description text below the title */
  description?: string
  /** Optional action element (e.g., button) below the description */
  action?: React.ReactNode
}

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)} {...props}>
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export { EmptyState }
