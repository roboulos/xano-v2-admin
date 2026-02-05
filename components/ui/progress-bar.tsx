import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ColorThresholds {
  /** Threshold for green color (>= this value) - defaults to 75 */
  green?: number
  /** Threshold for blue color (>= this value) - defaults to 50 */
  blue?: number
  /** Threshold for yellow color (>= this value) - defaults to 25 */
  yellow?: number
  /** Values below yellow threshold show red */
}

export interface ProgressBarProps {
  /** Progress value from 0-100 */
  value: number
  /** Optional label shown above the progress bar */
  label?: string
  /** Whether to show the percentage value - defaults to true */
  showPercentage?: boolean
  /** Custom color thresholds for the progress bar */
  colorThresholds?: ColorThresholds
  /** Additional className for the container */
  className?: string
}

const defaultThresholds: Required<ColorThresholds> = {
  green: 75,
  blue: 50,
  yellow: 25,
}

function getProgressColor(value: number, thresholds: ColorThresholds): string {
  const { green, blue, yellow } = { ...defaultThresholds, ...thresholds }

  if (value >= green) return 'var(--status-success)'
  if (value >= blue) return 'var(--status-info)'
  if (value >= yellow) return 'var(--status-warning)'
  return 'var(--status-error)'
}

function ProgressBar({
  value,
  label,
  showPercentage = true,
  colorThresholds,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const colorVar = getProgressColor(clampedValue, colorThresholds || {})

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-primary">{clampedValue}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${clampedValue}%`, backgroundColor: colorVar }}
        />
      </div>
    </div>
  )
}

export { ProgressBar, getProgressColor }
