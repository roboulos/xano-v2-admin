'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Badge } from './badge'

const methodBadgeVariants = cva('', {
  variants: {
    method: {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      PATCH: 'bg-orange-100 text-orange-800',
      DELETE: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800',
    },
  },
  defaultVariants: {
    method: 'default',
  },
})

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface MethodBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  method: HttpMethod | string
}

export function MethodBadge({ method, className, ...props }: MethodBadgeProps) {
  const validMethod = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    ? (method as HttpMethod)
    : 'default'

  return (
    <Badge className={cn(methodBadgeVariants({ method: validMethod }), className)} {...props}>
      {method}
    </Badge>
  )
}

export { methodBadgeVariants }
