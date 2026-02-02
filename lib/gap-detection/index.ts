/**
 * Gap Detection Library
 * Identifies missing data, incomplete endpoints, and schema mismatches
 */

export interface DataGap {
  id: string
  type: 'missing-data' | 'unmigrated-records' | 'orphaned-data'
  table: string
  description: string
  affectedRecords: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string // V1 or V2
  resolutionStatus: 'unresolved' | 'in-progress' | 'resolved'
  owner?: string
  lastChecked: Date
}

export interface EndpointGap {
  id: string
  name: string
  path: string
  method: string
  status: 'missing' | 'incomplete' | 'deprecated'
  expectedParams: string[]
  implementedParams: string[]
  missingParams: string[]
  responseContract?: {
    expected: Record<string, unknown>
    actual?: Record<string, unknown>
    matches: boolean
  }
  owner?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface SchemaMismatch {
  id: string
  table: string
  field: string
  v1Type: string
  v2Type: string
  v1Constraints: string[]
  v2Constraints: string[]
  impact: string
  resolutionApproach: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface DataIntegrityIssue {
  id: string
  issue: string
  affectedTable: string
  recordCount: number
  description: string
  checkType: 'null-values' | 'referential-integrity' | 'uniqueness' | 'range-validation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolution: string
}

// Mock data for gaps
const mockDataGaps: DataGap[] = [
  {
    id: 'gap-1',
    type: 'unmigrated-records',
    table: 'archived_users',
    description: '234 archived user records not yet migrated to V2',
    affectedRecords: 234,
    severity: 'medium',
    source: 'V1',
    resolutionStatus: 'unresolved',
    owner: 'Data Team',
    lastChecked: new Date('2024-02-01'),
  },
  {
    id: 'gap-2',
    type: 'orphaned-data',
    table: 'transaction_logs',
    description: '45 transaction logs reference deleted users (orphaned)',
    affectedRecords: 45,
    severity: 'high',
    source: 'V1',
    resolutionStatus: 'in-progress',
    owner: 'Data Team',
    lastChecked: new Date('2024-02-01'),
  },
  {
    id: 'gap-3',
    type: 'missing-data',
    table: 'customer_metadata',
    description: 'Custom field values incomplete for 1,200+ records',
    affectedRecords: 1200,
    severity: 'high',
    source: 'V1',
    resolutionStatus: 'unresolved',
    lastChecked: new Date('2024-02-01'),
  },
  {
    id: 'gap-4',
    type: 'unmigrated-records',
    table: 'audit_logs',
    description: 'Historical audit logs (2023) not migrated',
    affectedRecords: 45600,
    severity: 'low',
    source: 'V1',
    resolutionStatus: 'unresolved',
    lastChecked: new Date('2024-02-01'),
  },
]

const mockEndpointGaps: EndpointGap[] = [
  {
    id: 'ep-gap-1',
    name: 'Get User Preferences',
    path: '/api/users/:id/preferences',
    method: 'GET',
    status: 'incomplete',
    expectedParams: ['user_id', 'include_defaults', 'format'],
    implementedParams: ['user_id'],
    missingParams: ['include_defaults', 'format'],
    responseContract: {
      expected: {
        preferences: 'object',
        last_updated: 'ISO8601',
        version: 'number',
      },
      actual: {
        preferences: 'object',
      },
      matches: false,
    },
    priority: 'high',
    owner: 'API Team',
  },
  {
    id: 'ep-gap-2',
    name: 'Bulk Update Records',
    path: '/api/records/bulk',
    method: 'POST',
    status: 'missing',
    expectedParams: ['records', 'validate', 'partial'],
    implementedParams: [],
    missingParams: ['records', 'validate', 'partial'],
    priority: 'critical',
  },
  {
    id: 'ep-gap-3',
    name: 'Export Data',
    path: '/api/export',
    method: 'POST',
    status: 'incomplete',
    expectedParams: ['format', 'filter', 'date_range'],
    implementedParams: ['format', 'filter'],
    missingParams: ['date_range'],
    priority: 'medium',
  },
  {
    id: 'ep-gap-4',
    name: 'Webhooks Management',
    path: '/api/webhooks',
    method: 'GET',
    status: 'missing',
    expectedParams: ['event_type', 'status', 'limit'],
    implementedParams: [],
    missingParams: ['event_type', 'status', 'limit'],
    priority: 'medium',
  },
]

const mockSchemaMismatches: SchemaMismatch[] = [
  {
    id: 'schema-1',
    table: 'users',
    field: 'created_at',
    v1Type: 'TIMESTAMP',
    v2Type: 'DATETIME(6)',
    v1Constraints: ['NOT NULL', 'DEFAULT CURRENT_TIMESTAMP'],
    v2Constraints: ['NOT NULL', 'DEFAULT CURRENT_TIMESTAMP(6)'],
    impact: 'Microsecond precision difference',
    resolutionApproach: 'Update all V1 values to V2 format',
    severity: 'low',
  },
  {
    id: 'schema-2',
    table: 'transactions',
    field: 'amount',
    v1Type: 'DECIMAL(10,2)',
    v2Type: 'DECIMAL(12,2)',
    v1Constraints: ['NOT NULL', 'CHECK (amount > 0)'],
    v2Constraints: ['NOT NULL', 'CHECK (amount >= 0)'],
    impact: 'V2 allows zero amounts, V1 requires positive',
    resolutionApproach: 'Apply stricter validation in application layer',
    severity: 'medium',
  },
  {
    id: 'schema-3',
    table: 'api_keys',
    field: 'last_used',
    v1Type: 'VARCHAR(255)',
    v2Type: 'DATETIME',
    v1Constraints: ['NULLABLE', 'Stores formatted date string'],
    v2Constraints: ['NULLABLE', 'Stores timestamp'],
    impact: 'Data type change requires transformation',
    resolutionApproach: 'Parse all V1 date strings and convert to timestamps',
    severity: 'high',
  },
]

const mockIntegrityIssues: DataIntegrityIssue[] = [
  {
    id: 'integrity-1',
    issue: 'Null values in required fields',
    affectedTable: 'customer_profiles',
    recordCount: 234,
    description: 'email field is NULL in 234 records that should be required',
    checkType: 'null-values',
    severity: 'high',
    resolution: 'Identify affected records and request email data or mark as unverified',
  },
  {
    id: 'integrity-2',
    issue: 'Referential integrity violation',
    affectedTable: 'orders',
    recordCount: 12,
    description: '12 orders reference non-existent customer_ids',
    checkType: 'referential-integrity',
    severity: 'critical',
    resolution: 'Identify orphaned orders and either restore customers or archive orders',
  },
  {
    id: 'integrity-3',
    issue: 'Duplicate unique values',
    affectedTable: 'api_keys',
    recordCount: 3,
    description: '3 pairs of duplicate API keys found',
    checkType: 'uniqueness',
    severity: 'critical',
    resolution: 'Remove duplicate API keys after verification of actual key values',
  },
  {
    id: 'integrity-4',
    issue: 'Out of range values',
    affectedTable: 'user_settings',
    recordCount: 45,
    description: 'notification_frequency values outside valid range (1-7)',
    checkType: 'range-validation',
    severity: 'medium',
    resolution: 'Set invalid values to default (4) or request clarification',
  },
]

/**
 * Get all data gaps
 */
export function getDataGaps(): DataGap[] {
  return mockDataGaps
}

/**
 * Get data gaps by severity
 */
export function getDataGapsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): DataGap[] {
  return mockDataGaps.filter((g) => g.severity === severity)
}

/**
 * Get total affected records across all gaps
 */
export function getTotalAffectedRecords(): number {
  return mockDataGaps.reduce((sum, gap) => sum + gap.affectedRecords, 0)
}

/**
 * Get endpoint gaps
 */
export function getEndpointGaps(): EndpointGap[] {
  return mockEndpointGaps
}

/**
 * Get incomplete endpoints requiring attention
 */
export function getIncompleteEndpoints(): EndpointGap[] {
  return mockEndpointGaps.filter((ep) => ep.status !== 'deprecated')
}

/**
 * Get critical endpoint gaps
 */
export function getCriticalEndpointGaps(): EndpointGap[] {
  return mockEndpointGaps.filter((ep) => ep.priority === 'critical')
}

/**
 * Get schema mismatches
 */
export function getSchemaMismatches(): SchemaMismatch[] {
  return mockSchemaMismatches
}

/**
 * Get high severity schema mismatches
 */
export function getHighSeveritySchemaMismatches(): SchemaMismatch[] {
  return mockSchemaMismatches.filter((m) => m.severity === 'high' || m.severity === 'critical')
}

/**
 * Get data integrity issues
 */
export function getDataIntegrityIssues(): DataIntegrityIssue[] {
  return mockIntegrityIssues
}

/**
 * Get critical integrity issues
 */
export function getCriticalIntegrityIssues(): DataIntegrityIssue[] {
  return mockIntegrityIssues.filter((i) => i.severity === 'critical')
}

/**
 * Get summary of all gaps
 */
export function getGapSummary() {
  return {
    dataGapsTotal: mockDataGaps.length,
    dataGapsCritical: mockDataGaps.filter((g) => g.severity === 'critical').length,
    affectedRecordsTotal: getTotalAffectedRecords(),
    endpointGapsTotal: mockEndpointGaps.length,
    endpointGapsCritical: getCriticalEndpointGaps().length,
    schemaMismatchesTotal: mockSchemaMismatches.length,
    schemaMismatchesCritical: mockSchemaMismatches.filter((m) => m.severity === 'critical').length,
    integrityIssuesTotal: mockIntegrityIssues.length,
    integrityIssuesCritical: getCriticalIntegrityIssues().length,
  }
}
