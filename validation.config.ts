/**
 * V2 Backend Validation Pipeline Configuration
 *
 * This config defines the entire validation process.
 * Frontend automatically generates UI from this config.
 * Scripts read their metadata from here.
 *
 * SINGLE SOURCE OF TRUTH for validation workflow.
 */

export interface ValidationStage {
  id: string
  name: string
  description: string
  icon: string

  // Execution
  script: string
  command: string
  estimatedDuration: number // seconds
  criticalPath: boolean

  // Business Context
  businessValue: string
  successCriteria: string
  dependencies: string[]
  blockers: string[]

  // Outputs
  outputs: {
    report: string
    artifacts?: string[]
  }

  // Metrics
  metrics: {
    total: number
    tested?: number
    target: number
    threshold: number
  }
}

export interface ValidationConfig {
  name: string
  description: string
  version: string

  stages: ValidationStage[]

  overallSuccessCriteria: {
    minimumScore: number
    criticalStagesMustPass: string[]
  }

  businessContext: {
    purpose: string
    stakeholders: string[]
    risks: string[]
    timeline: string
  }
}

export const validationConfig: ValidationConfig = {
  name: 'V2 Backend Validation',
  description: 'Systematic validation of all V2 Xano workspace components before production migration',
  version: '1.0.0',

  stages: [
    {
      id: 'tables',
      name: 'Table Validation',
      description: 'Validate schema and record counts for all 193 V2 tables',
      icon: 'database',

      script: 'scripts/validation/validate-tables.ts',
      command: 'pnpm run validate:tables',
      estimatedDuration: 30,
      criticalPath: true,

      businessValue: 'Ensures all tables successfully migrated from V1 (251 tables) to V2 (193 normalized tables). Validates schema integrity and data presence.',
      successCriteria: '100% of 193 tables must pass validation with valid schemas and record counts',
      dependencies: [],
      blockers: ['V2 database must be accessible', 'xano-mcp CLI must be installed'],

      outputs: {
        report: 'validation-reports/table-validation-*.json',
        artifacts: ['table-schema-diff.json'],
      },

      metrics: {
        total: 193,
        target: 193,
        threshold: 0, // 0 failures allowed
      },
    },

    {
      id: 'functions',
      name: 'Function Validation',
      description: 'Test execution of 971 functions (270 active, 700 archived)',
      icon: 'code',

      script: 'scripts/validation/validate-functions.ts',
      command: 'pnpm run validate:functions',
      estimatedDuration: 300,
      criticalPath: true,

      businessValue: 'Validates business logic functions execute without errors. Tests WORKERS (background jobs), TASKS (orchestration), Frontend API handlers, SYSTEM operations, and SEEDING functions.',
      successCriteria: '95%+ of 270 active functions must pass (256/270). Archived functions excluded from validation.',
      dependencies: ['tables'],
      blockers: ['API credentials required', 'Test user (User 60) must exist'],

      outputs: {
        report: 'validation-reports/function-validation-*.json',
        artifacts: ['function-error-log.json'],
      },

      metrics: {
        total: 971,
        tested: 270,
        target: 256, // 95% of 270 active functions
        threshold: 14, // Allow 14 failures
      },
    },

    {
      id: 'endpoints',
      name: 'Endpoint Integration Testing',
      description: 'Test HTTP responses for 801 API endpoints across 5 API groups',
      icon: 'globe',

      script: 'scripts/validation/validate-endpoints.ts',
      command: 'pnpm run validate:endpoints',
      estimatedDuration: 600,
      criticalPath: true,

      businessValue: 'Ensures all production API endpoints return 200 OK responses. Tests Frontend API v2 (200), WORKERS (374), TASKS (165), SYSTEM (38), SEEDING (24). Validates performance (< 2s response time).',
      successCriteria: '96%+ endpoints must return 200 OK (770/801). No critical endpoints can fail.',
      dependencies: ['functions'],
      blockers: ['Network access required', 'V2 workspace must be online'],

      outputs: {
        report: 'validation-reports/endpoint-validation-*.json',
        artifacts: ['endpoint-performance-metrics.json', 'failed-endpoints.json'],
      },

      metrics: {
        total: 801,
        target: 769, // 96% of 801
        threshold: 32, // Allow 32 failures
      },
    },

    {
      id: 'references',
      name: 'Reference Integrity Validation',
      description: 'Check foreign key relationships for 156 table references',
      icon: 'link',

      script: 'scripts/validation/validate-references.ts',
      command: 'pnpm run validate:references',
      estimatedDuration: 120,
      criticalPath: true,

      businessValue: 'Validates referential integrity in normalized V2 schema. Prevents orphaned records, data corruption, and broken relationships. Critical for data quality.',
      successCriteria: '100% of 156 foreign key relationships must be valid. Zero orphaned references allowed.',
      dependencies: ['tables'],
      blockers: [],

      outputs: {
        report: 'validation-reports/reference-validation-*.json',
        artifacts: ['orphaned-records.json'],
      },

      metrics: {
        total: 156,
        target: 156,
        threshold: 0, // 0 orphaned references allowed
      },
    },
  ],

  overallSuccessCriteria: {
    minimumScore: 98,
    criticalStagesMustPass: ['tables', 'references'],
  },

  businessContext: {
    purpose: 'Validate V2 Xano backend is production-ready before migrating dashboards2.0 frontend from V1 to V2.',
    stakeholders: [
      'Engineering Team',
      'Product Team',
      'End Users (747 team members, 494K revenue records)',
    ],
    risks: [
      'Data loss if orphaned references exist',
      'Production downtime if endpoints fail',
      'User experience degradation if functions have errors',
    ],
    timeline: 'Complete validation before Phase 3 parallel integration (Weeks 7-10)',
  },
}

// Helper to get stage by ID
export function getStage(stageId: string): ValidationStage | undefined {
  return validationConfig.stages.find(s => s.id === stageId)
}

// Helper to get all stage IDs
export function getStageIds(): string[] {
  return validationConfig.stages.map(s => s.id)
}

// Helper to get stages in dependency order
export function getStagesInOrder(): ValidationStage[] {
  const sorted: ValidationStage[] = []
  const visited = new Set<string>()

  function visit(stage: ValidationStage) {
    if (visited.has(stage.id)) return
    visited.add(stage.id)

    // Visit dependencies first
    for (const depId of stage.dependencies) {
      const dep = getStage(depId)
      if (dep) visit(dep)
    }

    sorted.push(stage)
  }

  validationConfig.stages.forEach(visit)
  return sorted
}
