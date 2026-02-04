import * as React from 'react'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export interface MetricCardProps {
  /** Title label shown above the value */
  title: string
  /** Main metric value (can be string or number) */
  value: string | number
  /** Optional subtitle/subtext shown below the value */
  subtitle?: string
  /** Icon to display in the top-right corner */
  icon?: React.ReactNode
  /** Optional trend indicator: up (green), down (red), stable (gray) */
  trend?: 'up' | 'down' | 'stable'
  /** Whether to highlight the card with primary accent */
  highlight?: boolean
  /** Additional className for the card container */
  className?: string
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('p-4', highlight && 'border-primary/50 bg-primary/5', className)}>
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {icon && <div className="text-primary/60">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <TrendingUp
            className={cn(
              'h-4 w-4',
              trend === 'up' && 'text-green-500',
              trend === 'down' && 'text-red-500',
              trend === 'stable' && 'text-muted-foreground'
            )}
          />
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </Card>
  )
}

export { MetricCard }
