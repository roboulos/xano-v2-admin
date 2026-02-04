'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const categoryBadgeVariants = cva(
  'inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      category: {
        technical: 'bg-purple-100 text-purple-800',
        resource: 'bg-indigo-100 text-indigo-800',
        dependency: 'bg-cyan-100 text-cyan-800',
        stakeholder: 'bg-pink-100 text-pink-800',
        data: 'bg-teal-100 text-teal-800',
        default: 'bg-gray-100 text-gray-800',
      },
    },
    defaultVariants: {
      category: 'default',
    },
  }
)

export type CategoryType = 'technical' | 'resource' | 'dependency' | 'stakeholder' | 'data'

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category: CategoryType | string
}

export function CategoryBadge({ category, className, ...props }: CategoryBadgeProps) {
  const validCategory = ['technical', 'resource', 'dependency', 'stakeholder', 'data'].includes(
    category
  )
    ? (category as CategoryType)
    : 'default'

  return (
    <span className={cn(categoryBadgeVariants({ category: validCategory }), className)} {...props}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  )
}

export { categoryBadgeVariants }
