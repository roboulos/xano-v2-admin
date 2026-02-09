/**
 * Blocker Tracking - Migration blockers with impact analysis and escalation.
 *
 * Tracks known blockers, their severity, resolution status, and impact on phases.
 */

export interface Blocker {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: 'technical' | 'data' | 'dependency' | 'process'
  status: 'open' | 'in-progress' | 'escalated' | 'resolved'
  owner?: string
  rootCause: string
  proposedSolution: string
  affectedComponents: string[]
  impactedPhases: string[]
  createdAt: Date
  resolutionDeadline?: Date
  estimatedResolutionDays?: number
  escalatedTo?: string
  escalationLevel?: string
  escalatedAt?: Date
  resolution?: string
  resolvedAt?: Date
}

interface BlockerImpact {
  blockerId: string
  riskIfUnresolved: string
  estimatedCost: string
  delayInDays: number
}

interface BlockerSummary {
  total: number
  critical: number
  high: number
  open: number
  escalated: number
  resolved: number
  activeBlockers: number
  avgResolutionDays: number
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const BLOCKERS: Blocker[] = [
  {
    id: 'b-1',
    title: 'V1 data tool was connecting to wrong workspace',
    description:
      'The command-line tool for accessing V1 data was always connecting to V2 instead. This caused V2 data to be displayed as if it were V1 production data.',
    severity: 'high',
    category: 'technical',
    status: 'resolved',
    owner: 'Claude',
    rootCause: 'The data tool was hardcoded to one workspace and ignored configuration settings',
    proposedSolution:
      'Bypass the broken tool entirely; use direct API calls for V1/V2 comparison data',
    affectedComponents: ['/api/v2/tables/counts', '/api/v1/tables', '/api/v1/functions'],
    impactedPhases: ['phase-3'],
    createdAt: new Date('2026-02-04'),
    resolution:
      'Built a new direct comparison route that bypasses the broken tool. V1 data now comes directly from the V1 workspace.',
    resolvedAt: new Date('2026-02-06'),
  },
  {
    id: 'b-2',
    title: 'Hardcoded incorrect user_id throughout codebase',
    description:
      'David Keener is user_id=7 in both V1 and V2 workspaces. Hardcoded references to incorrect user_id=60 throughout the codebase caused incorrect API calls.',
    severity: 'high',
    category: 'data',
    status: 'resolved',
    owner: 'Claude',
    rootCause:
      'Initial documentation incorrectly stated user_id=60 for V1. David Keener is user_id=7 in both workspaces. This error was copied into many files.',
    proposedSolution:
      'Audit all files and use the correct user_id=7 for David Keener in both workspaces',
    affectedComponents: [
      'endpoint-tester-modal',
      'parallel-comparison-tab',
      'story-tabs',
      'test scripts',
    ],
    impactedPhases: ['phase-3'],
    createdAt: new Date('2026-02-05'),
    resolution: 'Fixed across 11+ files. All endpoints now use user_id=7 for David Keener.',
    resolvedAt: new Date('2026-02-06'),
  },
  {
    id: 'b-3',
    title: 'Integration sync endpoint validation incomplete',
    description:
      'SkySlope and DotLoop sync endpoints not fully validated. Lofty integration untested.',
    severity: 'medium',
    category: 'dependency',
    status: 'open',
    owner: 'Migration Team',
    rootCause: 'Integration partners have different API rate limits and test environments',
    proposedSolution: 'Set up dedicated test accounts for each integration partner',
    affectedComponents: ['skyslope-sync', 'dotloop-sync', 'lofty-sync'],
    impactedPhases: ['phase-3', 'phase-4'],
    createdAt: new Date('2026-02-01'),
    resolutionDeadline: new Date('2026-02-20'),
    estimatedResolutionDays: 10,
  },
  {
    id: 'b-4',
    title: 'Aggregation tables not yet populated in V2',
    description:
      'V2 pre-computed summary tables (e.g. monthly transaction totals) are still empty. Need to run the data population jobs.',
    severity: 'medium',
    category: 'data',
    status: 'in-progress',
    owner: 'Migration Team',
    rootCause: 'Summary tables can only be populated after core data migration is complete',
    proposedSolution: 'Run data population jobs sequentially once core data migration is confirmed',
    affectedComponents: ['aggregation-jobs', 'dashboard-metrics'],
    impactedPhases: ['phase-3'],
    createdAt: new Date('2026-01-28'),
    estimatedResolutionDays: 5,
    notes: 'Several backfill workers already created and partially run.',
  } as Blocker & { notes: string },
]

const IMPACTS: BlockerImpact[] = [
  {
    blockerId: 'b-1',
    riskIfUnresolved: 'V1/V2 comparison data would be completely unreliable',
    estimatedCost: 'Low (workaround available)',
    delayInDays: 0,
  },
  {
    blockerId: 'b-2',
    riskIfUnresolved: 'All user-scoped API calls return wrong data or errors',
    estimatedCost: 'Low (fixed)',
    delayInDays: 0,
  },
  {
    blockerId: 'b-3',
    riskIfUnresolved: 'Cannot validate integration data integrity before cutover',
    estimatedCost: 'Medium',
    delayInDays: 7,
  },
  {
    blockerId: 'b-4',
    riskIfUnresolved: 'Dashboard metrics would show empty/zero values after cutover',
    estimatedCost: 'Medium',
    delayInDays: 3,
  },
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getAllBlockers(): Blocker[] {
  return BLOCKERS
}

export function getCriticalBlockers(): Blocker[] {
  return BLOCKERS.filter((b) => b.severity === 'critical' && b.status !== 'resolved')
}

export function getBlockersByStatus(status: Blocker['status']): Blocker[] {
  return BLOCKERS.filter((b) => b.status === status)
}

export function getBlockerSummary(): BlockerSummary {
  const resolved = BLOCKERS.filter((b) => b.status === 'resolved')
  const resolvedDays = resolved.map((b) => {
    if (!b.resolvedAt || !b.createdAt) return 0
    return Math.ceil((b.resolvedAt.getTime() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  })
  const avgDays =
    resolvedDays.length > 0
      ? Math.round(resolvedDays.reduce((a, b) => a + b, 0) / resolvedDays.length)
      : 0

  return {
    total: BLOCKERS.length,
    critical: BLOCKERS.filter((b) => b.severity === 'critical').length,
    high: BLOCKERS.filter((b) => b.severity === 'high').length,
    open: BLOCKERS.filter((b) => b.status === 'open').length,
    escalated: BLOCKERS.filter((b) => b.status === 'escalated').length,
    resolved: resolved.length,
    activeBlockers: BLOCKERS.filter((b) => b.status !== 'resolved').length,
    avgResolutionDays: avgDays,
  }
}

export function analyzeBlockerImpact(blockerId: string): BlockerImpact | null {
  return IMPACTS.find((i) => i.blockerId === blockerId) ?? null
}

export function getEscalatedBlockers(): Blocker[] {
  return BLOCKERS.filter((b) => b.status === 'escalated')
}

export function getBlockersNearingDeadline(withinDays: number): Blocker[] {
  const now = Date.now()
  const threshold = withinDays * 24 * 60 * 60 * 1000
  return BLOCKERS.filter((b) => {
    if (b.status === 'resolved' || !b.resolutionDeadline) return false
    const remaining = b.resolutionDeadline.getTime() - now
    return remaining > 0 && remaining <= threshold
  })
}

export function getDaysUntilDeadline(blocker: Blocker): number | null {
  if (!blocker.resolutionDeadline) return null
  return Math.ceil((blocker.resolutionDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}
