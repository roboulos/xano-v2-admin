/**
 * Stub types file for legacy inventory pages
 * These pages are not part of the main 2-tab migration dashboard
 */

export type TaskDomain =
  | 'FUB'
  | 'Rezen'
  | 'SkySlope'
  | 'Network'
  | 'Transactions'
  | 'Listings'
  | 'Contributions'
  | 'System'
  | 'Other'
  | 'ad'  // Legacy domain values
  | string  // Allow any string for flexibility

export interface BackgroundTask {
  id: number
  name: string
  active?: boolean
  schedule?: string | { startsOn: string, frequency: number, frequencyLabel: string } | null
  tags?: string[]
  domain: TaskDomain
  callsFunction?: any | null
  lastModified?: string
  created?: string
  endpoint?: string
  apiGroup?: string
  requiresUserId?: boolean
  description?: string
  [key: string]: any  // Allow additional properties
}

export function parseDomainFromName(name: string): TaskDomain {
  const lower = name.toLowerCase()
  if (lower.includes('fub')) return 'FUB'
  if (lower.includes('rezen')) return 'Rezen'
  if (lower.includes('skyslope')) return 'SkySlope'
  if (lower.includes('network')) return 'Network'
  if (lower.includes('transaction')) return 'Transactions'
  if (lower.includes('listing')) return 'Listings'
  if (lower.includes('contribution')) return 'Contributions'
  if (lower.includes('system')) return 'System'
  return 'Other'
}
