/**
 * Migration Tracker Library
 * Manages migration status, progress tracking, and component migration state
 */

export interface ComponentMigration {
  id: string
  name: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  progress: number // 0-100
  startDate?: Date
  completedDate?: Date
  estimatedCompletion?: Date
  dependencies: string[]
  blockers: string[]
  notes: string
}

export interface MigrationPhase {
  id: string
  name: string
  description: string
  components: ComponentMigration[]
  status: 'pending' | 'in-progress' | 'completed'
  progress: number
  startDate?: Date
  completedDate?: Date
}

export interface MigrationTimeline {
  phase: MigrationPhase
  estimatedDuration: number // days
  actualDuration?: number
  criticalPath: ComponentMigration[]
}

export interface RiskItem {
  id: string
  component: string
  risk: 'low' | 'medium' | 'high' | 'critical'
  description: string
  mitigation: string
  owner?: string
}

// Mock data structure for migration state
const mockMigrationPhases: MigrationPhase[] = [
  {
    id: 'phase-1',
    name: 'Schema Foundation',
    description: 'Database schema and core data models',
    status: 'completed',
    progress: 100,
    startDate: new Date('2024-01-15'),
    completedDate: new Date('2024-01-25'),
    components: [
      {
        id: 'comp-users',
        name: 'Users & Authentication',
        status: 'completed',
        progress: 100,
        startDate: new Date('2024-01-15'),
        completedDate: new Date('2024-01-18'),
        dependencies: [],
        blockers: [],
        notes: 'Successfully migrated user tables and auth schemas',
      },
      {
        id: 'comp-permissions',
        name: 'Permissions & Roles',
        status: 'completed',
        progress: 100,
        startDate: new Date('2024-01-18'),
        completedDate: new Date('2024-01-22'),
        dependencies: ['comp-users'],
        blockers: [],
        notes: 'Role-based access control fully implemented',
      },
      {
        id: 'comp-config',
        name: 'Configuration Tables',
        status: 'completed',
        progress: 100,
        startDate: new Date('2024-01-20'),
        completedDate: new Date('2024-01-25'),
        dependencies: [],
        blockers: [],
        notes: 'System configuration tables and defaults established',
      },
    ],
  },
  {
    id: 'phase-2',
    name: 'API Endpoints',
    description: 'RESTful API implementation and routing',
    status: 'in-progress',
    progress: 65,
    startDate: new Date('2024-01-26'),
    components: [
      {
        id: 'comp-auth-api',
        name: 'Authentication API',
        status: 'completed',
        progress: 100,
        startDate: new Date('2024-01-26'),
        completedDate: new Date('2024-01-29'),
        dependencies: ['comp-users', 'comp-permissions'],
        blockers: [],
        notes: 'Login, logout, token refresh endpoints ready',
      },
      {
        id: 'comp-data-api',
        name: 'Data Endpoints',
        status: 'in-progress',
        progress: 70,
        startDate: new Date('2024-01-29'),
        estimatedCompletion: new Date('2024-02-05'),
        dependencies: ['comp-config'],
        blockers: ['blocker-1'],
        notes: 'CRUD endpoints 70% complete, pagination needed',
      },
      {
        id: 'comp-file-api',
        name: 'File Upload API',
        status: 'pending',
        progress: 0,
        dependencies: ['comp-data-api'],
        blockers: [],
        notes: 'Awaiting data API completion',
      },
      {
        id: 'comp-webhook-api',
        name: 'Webhook System',
        status: 'pending',
        progress: 0,
        dependencies: ['comp-data-api'],
        blockers: [],
        notes: 'Scheduled after core endpoints',
      },
    ],
  },
  {
    id: 'phase-3',
    name: 'Data Migration',
    description: 'V1 to V2 data sync - users, agents, transactions, network',
    status: 'completed',
    progress: 100,
    startDate: new Date('2024-12-05'),
    completedDate: new Date('2025-02-04'),
    components: [
      {
        id: 'comp-user-data',
        name: 'Users & Agents Sync',
        status: 'completed',
        progress: 100,
        startDate: new Date('2024-12-05'),
        completedDate: new Date('2025-01-15'),
        dependencies: [],
        blockers: [],
        notes: '335 users, 37,041 agents synced (100%)',
      },
      {
        id: 'comp-transactions',
        name: 'Transactions Sync',
        status: 'completed',
        progress: 100,
        startDate: new Date('2025-01-15'),
        completedDate: new Date('2025-01-28'),
        dependencies: ['comp-user-data'],
        blockers: [],
        notes: '55,038 transactions synced (100%)',
      },
      {
        id: 'comp-participants',
        name: 'Participants Sync',
        status: 'completed',
        progress: 100,
        startDate: new Date('2025-01-20'),
        completedDate: new Date('2025-02-01'),
        dependencies: ['comp-transactions'],
        blockers: [],
        notes: '701,551 participants synced (99.9%)',
      },
      {
        id: 'comp-network',
        name: 'Network Hierarchy Sync',
        status: 'completed',
        progress: 100,
        startDate: new Date('2025-01-25'),
        completedDate: new Date('2025-02-04'),
        dependencies: ['comp-user-data'],
        blockers: [],
        notes: '86,628 network records synced (100%)',
      },
    ],
  },
]

const mockRisks: RiskItem[] = [
  {
    id: 'risk-1',
    component: 'comp-data-api',
    risk: 'high',
    description: 'Pagination implementation blocking file upload API',
    mitigation: 'Prioritize pagination work, allocate additional resources',
    owner: 'Dev Team A',
  },
  {
    id: 'risk-2',
    component: 'comp-historical',
    risk: 'medium',
    description: 'Data volume may exceed batch processing capacity',
    mitigation: 'Implement chunked processing, test with production data',
  },
  {
    id: 'risk-3',
    component: 'comp-webhook-api',
    risk: 'low',
    description: 'Webhook event schema compatibility',
    mitigation: 'Comprehensive event testing suite planned',
  },
]

/**
 * Calculate overall migration progress across all phases
 */
export function calculateOverallProgress(phases: MigrationPhase[]): number {
  if (phases.length === 0) return 0
  const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0)
  return Math.round(totalProgress / phases.length)
}

/**
 * Get critical path components (blockers on main timeline)
 */
export function getCriticalPath(phases: MigrationPhase[]): ComponentMigration[] {
  const criticalComponents: ComponentMigration[] = []

  phases.forEach((phase) => {
    phase.components.forEach((comp) => {
      if (comp.blockers.length > 0 || comp.status === 'blocked') {
        criticalComponents.push(comp)
      }
      // Components with dependencies are on critical path
      if (comp.dependencies.length > 0) {
        criticalComponents.push(comp)
      }
    })
  })

  return criticalComponents
}

/**
 * Get timeline estimate for remaining work
 */
export function getTimelineEstimate(phases: MigrationPhase[]): {
  remainingDays: number
  completionDate: Date
  criticalPath: string[]
} {
  const now = new Date()
  let maxEstimatedDays = 0
  const criticalPaths: string[] = []

  phases.forEach((phase) => {
    phase.components.forEach((comp) => {
      if (comp.status === 'pending' || comp.status === 'in-progress') {
        const remainingPercent = 100 - comp.progress
        const estimatedDays = Math.ceil((remainingPercent / 100) * 5) // Assume 5 days per component base
        if (estimatedDays > maxEstimatedDays) {
          maxEstimatedDays = estimatedDays
          criticalPaths.push(comp.name)
        }
      }
    })
  })

  const completionDate = new Date(now)
  completionDate.setDate(completionDate.getDate() + maxEstimatedDays)

  return {
    remainingDays: maxEstimatedDays,
    completionDate,
    criticalPath: criticalPaths,
  }
}

/**
 * Get risk summary
 */
export function getRiskSummary(risks: RiskItem[]): {
  critical: number
  high: number
  medium: number
  low: number
} {
  return {
    critical: risks.filter((r) => r.risk === 'critical').length,
    high: risks.filter((r) => r.risk === 'high').length,
    medium: risks.filter((r) => r.risk === 'medium').length,
    low: risks.filter((r) => r.risk === 'low').length,
  }
}

/**
 * Get blocker summary
 */
export function getBlockerSummary(phases: MigrationPhase[]): {
  totalBlockers: number
  affectedComponents: string[]
} {
  const blockers = new Set<string>()
  const affectedComponents: string[] = []

  phases.forEach((phase) => {
    phase.components.forEach((comp) => {
      if (comp.blockers.length > 0) {
        comp.blockers.forEach((b) => blockers.add(b))
        affectedComponents.push(comp.name)
      }
    })
  })

  return {
    totalBlockers: blockers.size,
    affectedComponents,
  }
}

/**
 * Export mock data for use in components
 */
export function getMockMigrationData() {
  return {
    phases: mockMigrationPhases,
    risks: mockRisks,
  }
}

/**
 * Get a specific phase by ID
 */
export function getPhaseById(
  phases: MigrationPhase[],
  phaseId: string
): MigrationPhase | undefined {
  return phases.find((p) => p.id === phaseId)
}

/**
 * Get all blocked components
 */
export function getBlockedComponents(phases: MigrationPhase[]): ComponentMigration[] {
  const blocked: ComponentMigration[] = []

  phases.forEach((phase) => {
    phase.components.forEach((comp) => {
      if (comp.status === 'blocked') {
        blocked.push(comp)
      }
    })
  })

  return blocked
}
