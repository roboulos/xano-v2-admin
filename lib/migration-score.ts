/**
 * Single source of truth for migration score calculation
 * Used by both /api/migration/status and /api/validation/reports
 */

export interface MigrationScoreData {
  tables: {
    validated: number
    total: number
    passRate: number
  }
  functions: {
    validated: number
    total: number
    passRate: number
  }
  endpoints: {
    validated: number
    total: number
    passRate: number
  }
  references: {
    validated: number
    total: number
    passRate: number
  }
}

export interface MigrationScore {
  tables: number
  functions: number
  endpoints: number
  references: number
  overall: number
  status: 'READY' | 'NEAR_READY' | 'IN_PROGRESS' | 'NOT_STARTED'
  breakdown: {
    tables_weight: number
    functions_weight: number
    endpoints_weight: number
    references_weight: number
  }
}

/**
 * Known total counts — MUST match validation.config.ts
 *
 * V1 function/endpoint counts are not tracked by validation scripts.
 * We only validate V2. V1 counts are for display context only.
 */
export const KNOWN_TOTALS = {
  V1_TABLES: 251,
  V2_TABLES: 193, // Normalized schema
  V2_TABLES_VALIDATED: 193, // From validation.config.ts stages[0].metrics.total
  V2_FUNCTIONS: 971, // From validation.config.ts stages[1].metrics.total
  V2_FUNCTIONS_ACTIVE: 270, // From validation.config.ts stages[1].metrics.tested
  V2_ENDPOINTS: 801, // From validation.config.ts stages[2].metrics.total
  V2_REFERENCES: 156, // From validation.config.ts stages[3].metrics.total
}

/**
 * Calculate migration score from validation data
 * Weights: tables (20%), functions (30%), endpoints (30%), references (20%)
 */
export function calculateMigrationScore(data: MigrationScoreData): MigrationScore {
  const tableScore = data.tables.passRate
  const functionScore = data.functions.passRate
  const endpointScore = data.endpoints.passRate
  const referenceScore = data.references.passRate

  // Weighted average
  const WEIGHTS = {
    tables: 0.2,
    functions: 0.3,
    endpoints: 0.3,
    references: 0.2,
  }

  const overall = Math.round(
    tableScore * WEIGHTS.tables +
      functionScore * WEIGHTS.functions +
      endpointScore * WEIGHTS.endpoints +
      referenceScore * WEIGHTS.references
  )

  // Determine status
  let status: MigrationScore['status']
  if (overall >= 95) status = 'READY'
  else if (overall >= 80) status = 'NEAR_READY'
  else if (overall > 0) status = 'IN_PROGRESS'
  else status = 'NOT_STARTED'

  return {
    tables: Math.round(tableScore),
    functions: Math.round(functionScore),
    endpoints: Math.round(endpointScore),
    references: Math.round(referenceScore),
    overall,
    status,
    breakdown: {
      tables_weight: WEIGHTS.tables,
      functions_weight: WEIGHTS.functions,
      endpoints_weight: WEIGHTS.endpoints,
      references_weight: WEIGHTS.references,
    },
  }
}

/**
 * Get default score data when no validation reports exist
 */
export function getDefaultScoreData(): MigrationScoreData {
  return {
    tables: {
      validated: 0,
      total: KNOWN_TOTALS.V2_TABLES_VALIDATED,
      passRate: 0,
    },
    functions: {
      validated: 0,
      total: KNOWN_TOTALS.V2_FUNCTIONS,
      passRate: 0,
    },
    endpoints: {
      validated: 0,
      total: KNOWN_TOTALS.V2_ENDPOINTS,
      passRate: 0,
    },
    references: {
      validated: 0,
      total: KNOWN_TOTALS.V2_REFERENCES,
      passRate: 0,
    },
  }
}
