/**
 * Checklists Library
 * Manages migration checklists, phase-based tracking, and sign-offs
 */

export interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  completedBy?: string
  completedAt?: Date
  assignee?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  dependencies: string[] // IDs of items that must be completed first
  estimatedHours: number
  notes: string
  subItems?: ChecklistItem[]
}

export interface Phase {
  id: string
  name: string
  description: string
  order: number
  status: 'pending' | 'in-progress' | 'completed'
  items: ChecklistItem[]
  startDate?: Date
  completedDate?: Date
  owner?: string
  estimatedCompletion?: Date
}

export interface CriticalPath {
  items: ChecklistItem[]
  estimatedDaysToCompletion: number
  bottlenecks: ChecklistItem[]
  parallelizableGroups: ChecklistItem[][]
}

export interface SignOff {
  id: string
  phaseId: string
  signedBy: string
  signedAt: Date
  notes: string
  status: 'pending' | 'approved' | 'rejected'
}

// Mock checklist data
const mockPhases: Phase[] = [
  {
    id: 'phase-1',
    name: 'Planning & Assessment',
    description: 'Assess current state and plan migration approach',
    order: 1,
    status: 'completed',
    owner: 'Project Manager',
    completedDate: new Date('2024-01-15'),
    items: [
      {
        id: 'item-1-1',
        title: 'Audit V1 system architecture',
        description: 'Document all components, databases, APIs',
        completed: true,
        completedBy: 'John Smith',
        completedAt: new Date('2024-01-10'),
        priority: 'critical',
        dependencies: [],
        estimatedHours: 16,
        notes: 'Complete documentation created',
        subItems: [
          {
            id: 'item-1-1-1',
            title: 'Database schema review',
            description: 'Review all tables and relationships',
            completed: true,
            completedAt: new Date('2024-01-10'),
            priority: 'critical',
            dependencies: [],
            estimatedHours: 8,
            notes: 'Schema audit complete',
          },
          {
            id: 'item-1-1-2',
            title: 'API endpoint inventory',
            description: 'List all endpoints and methods',
            completed: true,
            completedAt: new Date('2024-01-10'),
            priority: 'critical',
            dependencies: [],
            estimatedHours: 4,
            notes: '47 endpoints documented',
          },
        ],
      },
      {
        id: 'item-1-2',
        title: 'Create V2 architecture design',
        description: 'Design new system structure',
        completed: true,
        completedBy: 'Sarah Johnson',
        completedAt: new Date('2024-01-12'),
        priority: 'critical',
        dependencies: ['item-1-1'],
        estimatedHours: 24,
        notes: 'Design document approved by stakeholders',
      },
      {
        id: 'item-1-3',
        title: 'Risk assessment and mitigation plan',
        description: 'Identify risks and plan mitigations',
        completed: true,
        completedBy: 'Risk Team',
        completedAt: new Date('2024-01-13'),
        priority: 'high',
        dependencies: ['item-1-2'],
        estimatedHours: 12,
        notes: '5 high-risk areas identified and mitigations planned',
      },
    ],
  },
  {
    id: 'phase-2',
    name: 'Infrastructure Setup',
    description: 'Set up V2 infrastructure and environments',
    order: 2,
    status: 'in-progress',
    owner: 'Infrastructure Team',
    startDate: new Date('2024-01-16'),
    estimatedCompletion: new Date('2024-02-05'),
    items: [
      {
        id: 'item-2-1',
        title: 'Provision V2 database',
        description: 'Create databases, schemas, and initial tables',
        completed: true,
        completedBy: 'DBA Team',
        completedAt: new Date('2024-01-18'),
        priority: 'critical',
        dependencies: [],
        estimatedHours: 12,
        notes: 'Database provisioned in production environment',
      },
      {
        id: 'item-2-2',
        title: 'Configure development environment',
        description: 'Set up dev VM, install required tools',
        completed: true,
        completedBy: 'DevOps',
        completedAt: new Date('2024-01-20'),
        priority: 'critical',
        dependencies: ['item-2-1'],
        estimatedHours: 8,
        notes: 'All developers have access to dev environment',
      },
      {
        id: 'item-2-3',
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        completed: false,
        assignee: 'DevOps Lead',
        priority: 'high',
        dependencies: ['item-2-2'],
        estimatedHours: 16,
        notes: 'In progress - 60% complete',
      },
      {
        id: 'item-2-4',
        title: 'Implement monitoring and logging',
        description: 'Set up performance monitoring, logging, alerting',
        completed: false,
        priority: 'high',
        dependencies: ['item-2-1'],
        estimatedHours: 12,
        notes: 'Waiting for CI/CD setup completion',
      },
    ],
  },
  {
    id: 'phase-3',
    name: 'Core API Development',
    description: 'Develop core API endpoints',
    order: 3,
    status: 'pending',
    items: [
      {
        id: 'item-3-1',
        title: 'Implement authentication API',
        description: 'Login, logout, token refresh endpoints',
        completed: false,
        priority: 'critical',
        dependencies: ['item-2-2'],
        estimatedHours: 20,
        notes: 'Ready to start',
      },
      {
        id: 'item-3-2',
        title: 'Implement CRUD API endpoints',
        description: 'Create, read, update, delete operations',
        completed: false,
        priority: 'critical',
        dependencies: ['item-3-1'],
        estimatedHours: 40,
        notes: 'Blocked until auth API is complete',
      },
      {
        id: 'item-3-3',
        title: 'Add validation and error handling',
        description: 'Input validation, error responses',
        completed: false,
        priority: 'high',
        dependencies: ['item-3-2'],
        estimatedHours: 20,
        notes: 'Will run in parallel with CRUD development',
      },
    ],
  },
  {
    id: 'phase-4',
    name: 'Data Migration',
    description: 'Migrate historical data from V1 to V2',
    order: 4,
    status: 'pending',
    items: [
      {
        id: 'item-4-1',
        title: 'Create data transformation scripts',
        description: 'Write ETL scripts for data transformation',
        completed: false,
        priority: 'critical',
        dependencies: ['item-3-2'],
        estimatedHours: 30,
        notes: 'Blocked until CRUD API endpoints are ready',
      },
      {
        id: 'item-4-2',
        title: 'Test data migration with sample data',
        description: 'Dry run with 10% of data',
        completed: false,
        priority: 'high',
        dependencies: ['item-4-1'],
        estimatedHours: 16,
        notes: 'Blocked until transformation scripts complete',
      },
      {
        id: 'item-4-3',
        title: 'Perform full production data migration',
        description: 'Migrate all historical data',
        completed: false,
        priority: 'critical',
        dependencies: ['item-4-2'],
        estimatedHours: 12,
        notes: 'Blocked until test migration successful',
      },
    ],
  },
  {
    id: 'phase-5',
    name: 'Testing & Verification',
    description: 'Comprehensive testing and sign-off',
    order: 5,
    status: 'pending',
    items: [
      {
        id: 'item-5-1',
        title: 'Integration testing',
        description: 'Test all components together',
        completed: false,
        priority: 'critical',
        dependencies: ['item-4-3'],
        estimatedHours: 24,
        notes: 'Blocked until data migration complete',
      },
      {
        id: 'item-5-2',
        title: 'User acceptance testing',
        description: 'Business stakeholder verification',
        completed: false,
        priority: 'critical',
        dependencies: ['item-5-1'],
        estimatedHours: 20,
        notes: 'Blocked until integration testing passes',
      },
      {
        id: 'item-5-3',
        title: 'Performance testing',
        description: 'Load testing, stress testing, optimization',
        completed: false,
        priority: 'high',
        dependencies: ['item-5-1'],
        estimatedHours: 16,
        notes: 'Can run in parallel with UAT',
      },
    ],
  },
]

const mockSignOffs: SignOff[] = [
  {
    id: 'signoff-1',
    phaseId: 'phase-1',
    signedBy: 'Project Manager',
    signedAt: new Date('2024-01-15'),
    notes: 'Planning phase complete, approved for infrastructure setup',
    status: 'approved',
  },
]

/**
 * Get all phases
 */
export function getAllPhases(): Phase[] {
  return mockPhases
}

/**
 * Get phase by ID
 */
export function getPhaseById(phaseId: string): Phase | undefined {
  return mockPhases.find((p) => p.id === phaseId)
}

/**
 * Get phase progress (0-100)
 */
export function getPhaseProgress(phase: Phase): number {
  if (phase.items.length === 0) return 0
  const completedItems = phase.items.filter((item) => item.completed).length
  return Math.round((completedItems / phase.items.length) * 100)
}

/**
 * Get all checklist items for a phase
 */
export function getPhaseItems(phaseId: string): ChecklistItem[] {
  const phase = getPhaseById(phaseId)
  return phase?.items || []
}

/**
 * Get critical path for migration
 */
export function getCriticalPath(): CriticalPath {
  const allItems: ChecklistItem[] = []

  // Flatten all items from all phases
  mockPhases.forEach((phase) => {
    phase.items.forEach((item) => {
      allItems.push(item)
      if (item.subItems) {
        allItems.push(...item.subItems)
      }
    })
  })

  // Find items on critical path (those with dependencies or blocking other items)
  const criticalItems = allItems.filter(
    (item) => item.dependencies.length > 0 || item.priority === 'critical'
  )

  // Calculate estimated days to completion
  const pendingItems = allItems.filter((item) => !item.completed)
  const totalHours = pendingItems.reduce((sum, item) => sum + item.estimatedHours, 0)
  const estimatedDays = Math.ceil(totalHours / 8) // Assume 8-hour workdays

  // Find bottlenecks (items that block many others)
  const bottlenecks = criticalItems.filter((item) => {
    const dependentItems = allItems.filter((i) => i.dependencies.includes(item.id))
    return dependentItems.length > 2
  })

  // Find parallelizable groups (items with no dependencies or same dependencies)
  const parallelizableGroups: ChecklistItem[][] = []
  const processedIds = new Set<string>()

  criticalItems.forEach((item) => {
    if (!processedIds.has(item.id)) {
      const group = criticalItems.filter(
        (i) =>
          !processedIds.has(i.id) &&
          JSON.stringify(i.dependencies) === JSON.stringify(item.dependencies)
      )
      group.forEach((i) => processedIds.add(i.id))
      if (group.length > 1) {
        parallelizableGroups.push(group)
      }
    }
  })

  return {
    items: criticalItems,
    estimatedDaysToCompletion: estimatedDays,
    bottlenecks,
    parallelizableGroups,
  }
}

/**
 * Get overall completion percentage
 */
export function getOverallCompletion(): number {
  let totalItems = 0
  let completedItems = 0

  mockPhases.forEach((phase) => {
    phase.items.forEach((item) => {
      totalItems++
      if (item.completed) {
        completedItems++
      }
      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          totalItems++
          if (subItem.completed) {
            completedItems++
          }
        })
      }
    })
  })

  return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)
}

/**
 * Get blocked items
 */
export function getBlockedItems(): ChecklistItem[] {
  const blocked: ChecklistItem[] = []
  const completedItemIds = new Set<string>()

  // First pass: collect all completed item IDs
  mockPhases.forEach((phase) => {
    phase.items.forEach((item) => {
      if (item.completed) {
        completedItemIds.add(item.id)
      }
      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          if (subItem.completed) {
            completedItemIds.add(subItem.id)
          }
        })
      }
    })
  })

  // Second pass: find items blocked by incomplete dependencies
  mockPhases.forEach((phase) => {
    phase.items.forEach((item) => {
      if (!item.completed) {
        const hasUncompletedDependencies = item.dependencies.some(
          (depId) => !completedItemIds.has(depId)
        )
        if (hasUncompletedDependencies) {
          blocked.push(item)
        }
      }
      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          if (!subItem.completed) {
            const hasUncompletedDependencies = subItem.dependencies.some(
              (depId) => !completedItemIds.has(depId)
            )
            if (hasUncompletedDependencies) {
              blocked.push(subItem)
            }
          }
        })
      }
    })
  })

  return blocked
}

/**
 * Get sign-offs
 */
export function getSignOffs(): SignOff[] {
  return mockSignOffs
}

/**
 * Get sign-off for phase
 */
export function getPhaseSignOff(phaseId: string): SignOff | undefined {
  return mockSignOffs.find((s) => s.phaseId === phaseId)
}

/**
 * Check if phase can be signed off (all items completed)
 */
export function canSignOffPhase(phaseId: string): boolean {
  const phase = getPhaseById(phaseId)
  if (!phase) return false

  return phase.items.every((item) => item.completed)
}
