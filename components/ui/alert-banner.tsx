'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertTriangle, AlertCircle, Info, CheckCircle2, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const alertBannerVariants = cva('rounded-lg p-4 border', {
  variants: {
    variant: {
      critical: 'bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-800',
      warning: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800',
      info: 'bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-800',
      success: 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-800',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})

const alertBannerTitleVariants = cva('font-semibold', {
  variants: {
    variant: {
      critical: 'text-red-900 dark:text-red-100',
      warning: 'text-yellow-900 dark:text-yellow-100',
      info: 'text-blue-900 dark:text-blue-100',
      success: 'text-green-900 dark:text-green-100',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})

const alertBannerDescriptionVariants = cva('text-sm mt-1', {
  variants: {
    variant: {
      critical: 'text-red-800 dark:text-red-200',
      warning: 'text-yellow-800 dark:text-yellow-200',
      info: 'text-blue-800 dark:text-blue-200',
      success: 'text-green-800 dark:text-green-200',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})

const alertBannerIconVariants = cva('h-5 w-5 flex-shrink-0 mt-0.5', {
  variants: {
    variant: {
      critical: 'text-red-600 dark:text-red-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})

export type AlertBannerVariant = 'critical' | 'warning' | 'info' | 'success'

const defaultIcons: Record<AlertBannerVariant, LucideIcon> = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  success: CheckCircle2,
}

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertBannerVariants> {
  /** Variant determines color scheme: critical (red), warning (yellow), info (blue), success (green) */
  variant: AlertBannerVariant
  /** Title text displayed prominently */
  title: string
  /** Optional description text below the title */
  description?: string
  /** Optional custom icon component (defaults based on variant) */
  icon?: LucideIcon
}

function AlertBanner({ variant, title, description, icon, className, ...props }: AlertBannerProps) {
  const IconComponent = icon || defaultIcons[variant]

  return (
    <div className={cn(alertBannerVariants({ variant }), className)} {...props}>
      <div className="flex items-start gap-3">
        <IconComponent className={cn(alertBannerIconVariants({ variant }))} />
        <div>
          <h3 className={cn(alertBannerTitleVariants({ variant }))}>{title}</h3>
          {description && (
            <p className={cn(alertBannerDescriptionVariants({ variant }))}>{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export { AlertBanner, alertBannerVariants }
