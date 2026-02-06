/**
 * Migration Checklists - Phase-based tracking with critical path analysis.
 *
 * Tracks migration progress across phases with dependencies and sign-off workflow.
 */

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  completed: boolean
  completedAt?: Date
  completedBy?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  assignee?: string
  estimatedHours?: number
  notes?: string
  dependencies: string[]
  subItems?: ChecklistItem[]
}

export interface Phase {
  id: string
  name: string
  description: string
  order: number
  status: 'not-started' | 'in-progress' | 'completed'
  items: ChecklistItem[]
  startDate?: Date
  estimatedCompletion?: Date
  completedDate?: Date
}

interface PhaseSignOff {
  phaseId: string
  signedBy: string
  signedAt: Date
  notes?: string
}

interface CriticalPath {
  items: ChecklistItem[]
  estimatedDaysToCompletion: number
  bottlenecks: ChecklistItem[]
  parallelizableGroups: ChecklistItem[][]
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PHASES: Phase[] = [
  {
    id: 'phase-1',
    name: 'Schema Migration',
    description: 'V2 normalized schema created and validated against V1',
    order: 1,
    status: 'completed',
    startDate: new Date('2025-12-05'),
    completedDate: new Date('2026-01-10'),
    items: [
      {
        id: 'p1-1',
        title: 'Create V2 normalized schema',
        completed: true,
        completedAt: new Date('2025-12-20'),
        completedBy: 'Claude',
        priority: 'critical',
        estimatedHours: 40,
        dependencies: [],
      },
      {
        id: 'p1-2',
        title: 'Validate all 193 V2 tables exist',
        completed: true,
        completedAt: new Date('2026-01-05'),
        completedBy: 'Validation Script',
        priority: 'high',
        estimatedHours: 4,
        dependencies: ['p1-1'],
      },
      {
        id: 'p1-3',
        title: 'Verify foreign key references (156 FKs)',
        completed: true,
        completedAt: new Date('2026-01-10'),
        completedBy: 'Validation Script',
        priority: 'high',
        estimatedHours: 8,
        dependencies: ['p1-2'],
      },
    ],
  },
  {
    id: 'phase-2',
    name: 'Core Data Migration',
    description: 'Bulk copy of core entities: users, agents, transactions, listings, network',
    order: 2,
    status: 'completed',
    startDate: new Date('2026-01-10'),
    completedDate: new Date('2026-02-01'),
    items: [
      {
        id: 'p2-1',
        title: 'Users & Agents bulk copy (37K agents)',
        completed: true,
        completedAt: new Date('2026-01-15'),
        completedBy: 'Bulk Migration',
        priority: 'critical',
        estimatedHours: 8,
        dependencies: ['p1-3'],
      },
      {
        id: 'p2-2',
        title: 'Transactions bulk copy (55K records)',
        completed: true,
        completedAt: new Date('2026-01-20'),
        completedBy: 'Bulk Migration',
        priority: 'critical',
        estimatedHours: 12,
        dependencies: ['p2-1'],
      },
      {
        id: 'p2-3',
        title: 'Network & Contributions (86K + 50K records)',
        completed: true,
        completedAt: new Date('2026-01-25'),
        completedBy: 'Bulk Migration',
        priority: 'high',
        estimatedHours: 16,
        dependencies: ['p2-1'],
      },
      {
        id: 'p2-4',
        title: 'Participants bulk copy (700K records)',
        completed: true,
        completedAt: new Date('2026-02-01'),
        completedBy: 'Bulk Migration',
        priority: 'high',
        estimatedHours: 20,
        dependencies: ['p2-2'],
      },
    ],
  },
  {
    id: 'phase-3',
    name: 'API Validation',
    description: 'Validate all V2 endpoints return correct data matching V1 contracts',
    order: 3,
    status: 'in-progress',
    startDate: new Date('2026-01-20'),
    estimatedCompletion: new Date('2026-02-15'),
    items: [
      {
        id: 'p3-1',
        title: 'Frontend API v2 endpoints (174 endpoints)',
        completed: true,
        completedAt: new Date('2026-01-28'),
        completedBy: 'Endpoint Test Runner',
        priority: 'critical',
        estimatedHours: 16,
        dependencies: ['p2-4'],
      },
      {
        id: 'p3-2',
        title: 'V1/V2 response structure comparison (10 key endpoints)',
        completed: true,
        completedAt: new Date('2026-02-01'),
        completedBy: 'compare-response-structures.ts',
        priority: 'high',
        estimatedHours: 8,
        dependencies: ['p3-1'],
      },
      {
        id: 'p3-3',
        title: 'Integration sync endpoints (FUB, reZEN, SkySlope)',
        completed: false,
        priority: 'high',
        assignee: 'Migration Team',
        estimatedHours: 24,
        dependencies: ['p2-4'],
        notes: 'FUB sync endpoints working. reZEN partially validated. SkySlope pending.',
      },
      {
        id: 'p3-4',
        title: 'Aggregation endpoint parity check',
        completed: false,
        priority: 'medium',
        estimatedHours: 16,
        dependencies: ['p3-1'],
      },
    ],
  },
  {
    id: 'phase-4',
    name: 'Production Readiness',
    description: 'Final validation, monitoring setup, and cutover planning',
    order: 4,
    status: 'not-started',
    estimatedCompletion: new Date('2026-03-01'),
    items: [
      {
        id: 'p4-1',
        title: 'Set up continuous sync monitoring',
        completed: false,
        priority: 'critical',
        estimatedHours: 16,
        dependencies: ['p3-3'],
      },
      {
        id: 'p4-2',
        title: 'Cutover runbook creation',
        completed: false,
        priority: 'high',
        estimatedHours: 8,
        dependencies: ['p3-4'],
      },
      {
        id: 'p4-3',
        title: 'Rollback procedure documentation',
        completed: false,
        priority: 'high',
        estimatedHours: 4,
        dependencies: ['p4-2'],
      },
    ],
  },
]

const SIGN_OFFS: PhaseSignOff[] = [
  {
    phaseId: 'phase-1',
    signedBy: 'Robert',
    signedAt: new Date('2026-01-12'),
    notes: 'Schema looks good. All 193 tables validated.',
  },
  {
    phaseId: 'phase-2',
    signedBy: 'Robert',
    signedAt: new Date('2026-02-03'),
    notes: 'Core data migration complete. Counts match within 99.9%.',
  },
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getAllPhases(): Phase[] {
  return PHASES
}

export function getPhaseProgress(phase: Phase): number {
  if (phase.items.length === 0) return 0
  const completed = phase.items.filter((i) => i.completed).length
  return Math.round((completed / phase.items.length) * 100)
}

export function getCriticalPath(): CriticalPath {
  const incompleteItems = PHASES.flatMap((p) => p.items).filter((i) => !i.completed)
  const criticalItems = incompleteItems.filter(
    (i) => i.priority === 'critical' || i.priority === 'high'
  )
  const bottlenecks = incompleteItems.filter((i) => i.priority === 'critical')

  // Group parallelizable items (items with same dependencies)
  const depGroups = new Map<string, ChecklistItem[]>()
  for (const item of incompleteItems) {
    const key = item.dependencies.sort().join(',') || 'none'
    if (!depGroups.has(key)) depGroups.set(key, [])
    depGroups.get(key)!.push(item)
  }
  const parallelizableGroups = Array.from(depGroups.values()).filter((g) => g.length > 1)

  const totalHours = criticalItems.reduce((sum, i) => sum + (i.estimatedHours || 0), 0)

  return {
    items: criticalItems,
    estimatedDaysToCompletion: Math.ceil(totalHours / 8),
    bottlenecks,
    parallelizableGroups,
  }
}

export function getOverallCompletion(): number {
  const allItems = PHASES.flatMap((p) => p.items)
  if (allItems.length === 0) return 0
  const completed = allItems.filter((i) => i.completed).length
  return Math.round((completed / allItems.length) * 100)
}

export function getBlockedItems(): ChecklistItem[] {
  const allItems = PHASES.flatMap((p) => p.items)
  const completedIds = new Set(allItems.filter((i) => i.completed).map((i) => i.id))

  return allItems.filter(
    (item) => !item.completed && item.dependencies.some((dep) => !completedIds.has(dep))
  )
}

export function getPhaseSignOff(phaseId: string): PhaseSignOff | undefined {
  return SIGN_OFFS.find((s) => s.phaseId === phaseId)
}

export function canSignOffPhase(phaseId: string): boolean {
  const phase = PHASES.find((p) => p.id === phaseId)
  if (!phase) return false
  return phase.items.every((i) => i.completed)
}
