'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type CategoryType = 'technical' | 'resource' | 'dependency' | 'stakeholder' | 'data'

// Categories use muted variants to distinguish from status colors
// These represent domains/topics, not status levels
const categoryStyles: Record<CategoryType | 'default', { bg: string; text: string }> = {
  technical: { bg: 'oklch(0.92 0.04 285)', text: 'oklch(0.45 0.12 285)' }, // purple
  resource: { bg: 'oklch(0.92 0.04 265)', text: 'oklch(0.45 0.12 265)' }, // indigo
  dependency: { bg: 'oklch(0.92 0.04 200)', text: 'oklch(0.45 0.12 200)' }, // cyan
  stakeholder: { bg: 'oklch(0.92 0.04 340)', text: 'oklch(0.45 0.12 340)' }, // pink
  data: { bg: 'oklch(0.92 0.04 175)', text: 'oklch(0.45 0.12 175)' }, // teal
  default: { bg: 'var(--muted)', text: 'var(--muted-foreground)' },
}

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category: CategoryType | string
}

export function CategoryBadge({ category, className, ...props }: CategoryBadgeProps) {
  const validCategory = ['technical', 'resource', 'dependency', 'stakeholder', 'data'].includes(
    category
  )
    ? (category as CategoryType)
    : 'default'
  const style = categoryStyles[validCategory]

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
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  )
}
