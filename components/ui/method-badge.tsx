'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// HTTP methods use semantic status colors:
// GET = info (read), POST = success (create), PUT/PATCH = warning (update), DELETE = error (destructive)
const methodStyles: Record<HttpMethod | 'default', { bg: string; text: string }> = {
  GET: { bg: 'var(--status-info-bg)', text: 'var(--status-info)' },
  POST: { bg: 'var(--status-success-bg)', text: 'var(--status-success)' },
  PUT: { bg: 'var(--status-pending-bg)', text: 'var(--status-pending)' },
  PATCH: { bg: 'var(--status-warning-bg)', text: 'var(--status-warning)' },
  DELETE: { bg: 'var(--status-error-bg)', text: 'var(--status-error)' },
  default: { bg: 'var(--muted)', text: 'var(--muted-foreground)' },
}

export interface MethodBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  method: HttpMethod | string
}

export function MethodBadge({ method, className, ...props }: MethodBadgeProps) {
  const validMethod = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    ? (method as HttpMethod)
    : 'default'
  const style = methodStyles[validMethod]

  return (
    <Badge
      className={cn(className)}
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
      {...props}
    >
      {method}
    </Badge>
  )
}
