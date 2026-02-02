/**
 * Blockers Library
 * Tracks migration blockers, impact analysis, and escalation paths
 */

export interface Blocker {
  id: string
  title: string
  description: string
  category: 'technical' | 'resource' | 'dependency' | 'stakeholder' | 'data'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'escalated' | 'resolved'
  createdAt: Date
  owner?: string
  affectedComponents: string[]
  impactedPhases: string[]
  rootCause: string
  proposedSolution: string
  estimatedResolutionDays?: number
  resolutionDeadline?: Date
  escalationLevel?: 'team' | 'manager' | 'executive'
  escalatedTo?: string
  escalatedAt?: Date
  resolution?: string
  resolvedAt?: Date
}

export interface BlockerImpactAnalysis {
  blocker: Blocker
  directlyAffectedComponents: number
  transitivelyAffectedComponents: number
  delayInDays: number
  estimatedCost: string // e.g., "3 developer-days"
  riskIfUnresolved: string
}

export interface BlockerTimeline {
  blocker: Blocker
  daysUntilDeadline: number
  escalationPoints: {
    days: number
    level: string
    action: string
  }[]
}

export interface EscalationPath {
  blockerId: string
  currentLevel: string
  nextLevel: string
  criterion: string
  contact: string
  notificationRequired: boolean
}

// Mock blocker data
const mockBlockers: Blocker[] = [
  {
    id: 'blocker-1',
    title: 'Pagination implementation blocked',
    description:
      'Data API endpoints require pagination for large datasets, but complex sorting logic not yet defined',
    category: 'technical',
    severity: 'high',
    status: 'in-progress',
    createdAt: new Date('2024-01-28'),
    owner: 'API Team Lead',
    affectedComponents: ['Data API', 'File Upload API', 'Webhook System'],
    impactedPhases: ['phase-2', 'phase-3'],
    rootCause: 'Original pagination design insufficient for V2 query patterns',
    proposedSolution: 'Implement cursor-based pagination with configurable page size',
    estimatedResolutionDays: 3,
    resolutionDeadline: new Date('2024-02-05'),
  },
  {
    id: 'blocker-2',
    title: 'Third-party API integration timeout',
    description:
      'External payment processor API responding slowly (>30s), causing data migration timeouts',
    category: 'dependency',
    severity: 'critical',
    status: 'escalated',
    createdAt: new Date('2024-01-26'),
    owner: 'Integration Team',
    affectedComponents: ['Payment Processing', 'Webhook System'],
    impactedPhases: ['phase-2', 'phase-3'],
    rootCause: 'Third-party API infrastructure issues on their end',
    proposedSolution: 'Implement request timeout with retry logic and fallback',
    estimatedResolutionDays: 2,
    escalationLevel: 'manager',
    escalatedTo: 'VP Engineering',
    escalatedAt: new Date('2024-01-27'),
    resolutionDeadline: new Date('2024-02-03'),
  },
  {
    id: 'blocker-3',
    title: 'Database resource constraints',
    description:
      'Production database running at 85% capacity; migration requires additional resources',
    category: 'resource',
    severity: 'high',
    status: 'in-progress',
    createdAt: new Date('2024-01-29'),
    owner: 'Infrastructure Team',
    affectedComponents: ['Database', 'Data Migration'],
    impactedPhases: ['phase-4'],
    rootCause: 'V1 data size larger than estimated; growth patterns underestimated',
    proposedSolution: 'Provision additional database cluster and implement sharding strategy',
    estimatedResolutionDays: 5,
    resolutionDeadline: new Date('2024-02-10'),
  },
  {
    id: 'blocker-4',
    title: 'Legacy system API incompatibility',
    description: 'V1 API responses use deprecated format incompatible with V2 data models',
    category: 'data',
    severity: 'high',
    status: 'open',
    createdAt: new Date('2024-01-30'),
    owner: 'Data Integration',
    affectedComponents: ['Data Transformation', 'ETL Scripts'],
    impactedPhases: ['phase-4'],
    rootCause: 'V1 API schema changes made after V2 design document finalized',
    proposedSolution: 'Create V1 API adapter layer to normalize responses',
    estimatedResolutionDays: 4,
    resolutionDeadline: new Date('2024-02-08'),
  },
  {
    id: 'blocker-5',
    title: 'Stakeholder sign-off delay',
    description: 'Business stakeholders unable to commit review time for UAT phase',
    category: 'stakeholder',
    severity: 'medium',
    status: 'escalated',
    createdAt: new Date('2024-01-25'),
    owner: 'Project Manager',
    affectedComponents: ['User Acceptance Testing'],
    impactedPhases: ['phase-5'],
    rootCause: 'Competing project priorities and resource constraints',
    proposedSolution: 'Schedule dedicated review sessions and allocate dedicated testers',
    estimatedResolutionDays: 3,
    escalationLevel: 'executive',
    escalatedTo: 'CEO',
    escalatedAt: new Date('2024-01-28'),
    resolutionDeadline: new Date('2024-02-07'),
  },
]

/**
 * Get all blockers
 */
export function getAllBlockers(): Blocker[] {
  return mockBlockers
}

/**
 * Get blockers by status
 */
export function getBlockersByStatus(status: Blocker['status']): Blocker[] {
  return mockBlockers.filter((b) => b.status === status)
}

/**
 * Get critical blockers
 */
export function getCriticalBlockers(): Blocker[] {
  return mockBlockers.filter((b) => b.severity === 'critical')
}

/**
 * Get blockers by category
 */
export function getBlockersByCategory(category: Blocker['category']): Blocker[] {
  return mockBlockers.filter((b) => b.category === category)
}

/**
 * Analyze impact of a blocker
 */
export function analyzeBlockerImpact(blockerId: string): BlockerImpactAnalysis | undefined {
  const blocker = mockBlockers.find((b) => b.id === blockerId)
  if (!blocker) return undefined

  // Calculate transitive impact (components affected by affected components)
  const allComponentNames = mockBlockers
    .filter(
      (b) =>
        b.affectedComponents.some((c) => blocker.affectedComponents.includes(c)) &&
        b.id !== blockerId
    )
    .flatMap((b) => b.affectedComponents)

  const uniqueTransitiveComponents = new Set(allComponentNames).size

  // Estimate delay in days
  let delayInDays = 0
  blocker.impactedPhases.forEach((phaseId) => {
    // Each blocked phase adds estimated days
    delayInDays += blocker.estimatedResolutionDays || 3
  })

  return {
    blocker,
    directlyAffectedComponents: blocker.affectedComponents.length,
    transitivelyAffectedComponents: uniqueTransitiveComponents,
    delayInDays,
    estimatedCost: `${Math.ceil(delayInDays * 0.8)} developer-days`,
    riskIfUnresolved: `Could delay project completion by ${delayInDays} days and impact ${blocker.impactedPhases.length} phases`,
  }
}

/**
 * Get blockers affecting a specific phase
 */
export function getBlockersForPhase(phaseId: string): Blocker[] {
  return mockBlockers.filter((b) => b.impactedPhases.includes(phaseId))
}

/**
 * Get escalated blockers
 */
export function getEscalatedBlockers(): Blocker[] {
  return mockBlockers.filter((b) => b.status === 'escalated')
}

/**
 * Get blocker summary statistics
 */
export function getBlockerSummary() {
  const total = mockBlockers.length
  const critical = mockBlockers.filter((b) => b.severity === 'critical').length
  const high = mockBlockers.filter((b) => b.severity === 'high').length
  const escalated = mockBlockers.filter((b) => b.status === 'escalated').length
  const resolved = mockBlockers.filter((b) => b.status === 'resolved').length
  const open = mockBlockers.filter((b) => b.status === 'open').length

  // Calculate average resolution time for resolved blockers
  const resolvedBlockers = mockBlockers.filter(
    (b) => b.status === 'resolved' && b.resolvedAt && b.createdAt
  )
  const avgResolutionDays =
    resolvedBlockers.length > 0
      ? Math.round(
          resolvedBlockers.reduce((sum, b) => {
            const days = Math.floor(
              (b.resolvedAt!.getTime() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            )
            return sum + days
          }, 0) / resolvedBlockers.length
        )
      : 0

  return {
    total,
    critical,
    high,
    escalated,
    resolved,
    open,
    avgResolutionDays,
    activeBlockers: total - resolved,
  }
}

/**
 * Get escalation recommendation for a blocker
 */
export function getEscalationPath(blockerId: string): EscalationPath | undefined {
  const blocker = mockBlockers.find((b) => b.id === blockerId)
  if (!blocker) return undefined

  let nextLevel = blocker.escalationLevel || 'team'

  if (nextLevel === 'team') {
    nextLevel = 'manager'
  } else if (nextLevel === 'manager') {
    nextLevel = 'executive'
  }

  return {
    blockerId,
    currentLevel: blocker.escalationLevel || 'unescalated',
    nextLevel,
    criterion:
      blocker.severity === 'critical'
        ? 'Critical severity or unresolved after 2 days'
        : 'High severity and affecting multiple phases',
    contact: blocker.escalatedTo || 'Project Manager',
    notificationRequired:
      blocker.status === 'escalated' ||
      (blocker.severity === 'critical' && blocker.status !== 'resolved'),
  }
}

/**
 * Calculate days until deadline for blocker
 */
export function getDaysUntilDeadline(blockerId: string): number {
  const blocker = mockBlockers.find((b) => b.id === blockerId)
  if (!blocker || !blocker.resolutionDeadline) return -1

  const now = new Date()
  const days = Math.floor(
    (blocker.resolutionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  return days
}

/**
 * Get blockers nearing deadline
 */
export function getBlockersNearingDeadline(daysThreshold: number = 2): Blocker[] {
  return mockBlockers.filter((blocker) => {
    if (!blocker.resolutionDeadline || blocker.status === 'resolved') {
      return false
    }
    const daysLeft = getDaysUntilDeadline(blocker.id)
    return daysLeft >= 0 && daysLeft <= daysThreshold
  })
}

/**
 * Get blocker timeline for a specific blocker
 */
export function getBlockerTimeline(blockerId: string): BlockerTimeline | undefined {
  const blocker = mockBlockers.find((b) => b.id === blockerId)
  if (!blocker || !blocker.resolutionDeadline) return undefined

  const daysUntilDeadlineValue = getDaysUntilDeadline(blockerId)

  const escalationPoints = [
    {
      days: 2,
      level: 'manager',
      action: 'Escalate to manager if unresolved',
    },
    {
      days: 1,
      level: 'executive',
      action: 'Escalate to executive level',
    },
    {
      days: 0,
      level: 'critical',
      action: 'Critical: requires immediate intervention',
    },
  ].filter((p) => p.days >= daysUntilDeadlineValue)

  return {
    blocker,
    daysUntilDeadline: daysUntilDeadlineValue,
    escalationPoints,
  }
}
