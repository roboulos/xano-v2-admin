'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const loadingStateVariants = cva('flex items-center justify-center', {
  variants: {
    size: {
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const loadingIconVariants = cva('animate-spin text-muted-foreground', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const loadingMessageVariants = cva('text-muted-foreground', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type LoadingStateSize = 'sm' | 'md' | 'lg'

export interface LoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof loadingStateVariants> {
  /** Optional message to display next to the spinner */
  message?: string
  /** Size of the loading indicator: sm, md, lg */
  size?: LoadingStateSize
}

function LoadingState({ message, size = 'md', className, ...props }: LoadingStateProps) {
  return (
    <div className={cn(loadingStateVariants({ size }), className)} {...props}>
      <Loader2 className={cn(loadingIconVariants({ size }))} />
      {message && <span className={cn(loadingMessageVariants({ size }))}>{message}</span>}
    </div>
  )
}

export { LoadingState, loadingStateVariants }
