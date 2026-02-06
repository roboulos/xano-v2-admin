/**
 * Gap Detection - Identifies data gaps, endpoint gaps, schema mismatches,
 * and data integrity issues between V1 and V2.
 *
 * Data is derived from known migration state as of Feb 2026.
 */

export interface DataGap {
  id: string
  table: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'missing-records' | 'incomplete-migration' | 'schema-drift' | 'stale-data'
  affectedRecords: number
  resolutionStatus: 'open' | 'in-progress' | 'resolved' | 'wont-fix'
  lastChecked: Date
  owner?: string
}

export interface EndpointGap {
  id: string
  name: string
  method: string
  path: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  expectedParams: string[]
  implementedParams: string[]
  missingParams: string[]
  status: 'open' | 'in-progress' | 'resolved' | 'wont-fix'
  responseContract?: { matches: boolean; details?: string }
}

export interface SchemaMismatch {
  id: string
  table: string
  field: string
  v1Type: string
  v2Type: string
  v1Constraints: string[]
  v2Constraints: string[]
  severity: 'critical' | 'high' | 'medium' | 'low'
  impact: string
  resolutionApproach: string
}

export interface DataIntegrityIssue {
  id: string
  issue: string
  description: string
  checkType: 'null-values' | 'referential-integrity' | 'uniqueness' | 'range-validation'
  affectedTable: string
  recordCount: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  resolution: string
}

export interface GapSummary {
  dataGapsTotal: number
  dataGapsCritical: number
  endpointGapsTotal: number
  endpointGapsCritical: number
  schemaMismatchesTotal: number
  schemaMismatchesCritical: number
  integrityIssuesTotal: number
  integrityIssuesCritical: number
  affectedRecordsTotal: number
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const DATA_GAPS: DataGap[] = [
  {
    id: 'dg-1',
    table: 'equity_annual',
    description: 'V1 equity_annual records not yet migrated to V2 equity tables',
    severity: 'medium',
    type: 'incomplete-migration',
    affectedRecords: 1247,
    resolutionStatus: 'in-progress',
    lastChecked: new Date('2026-02-04'),
    owner: 'Migration Team',
  },
  {
    id: 'dg-2',
    table: 'ai_features_agent_period',
    description: 'AI/NORA feature tables exist in V1 but not targeted for V2 migration',
    severity: 'low',
    type: 'incomplete-migration',
    affectedRecords: 8500,
    resolutionStatus: 'wont-fix',
    lastChecked: new Date('2026-02-04'),
  },
  {
    id: 'dg-3',
    table: 'luzmo_dashboards',
    description: 'Luzmo chart configuration tables deprecated in V2',
    severity: 'low',
    type: 'schema-drift',
    affectedRecords: 45,
    resolutionStatus: 'wont-fix',
    lastChecked: new Date('2026-02-04'),
  },
  {
    id: 'dg-4',
    table: 'page_builder tables',
    description: '12 page builder tables not migrated — replaced by new dashboard system',
    severity: 'low',
    type: 'incomplete-migration',
    affectedRecords: 320,
    resolutionStatus: 'wont-fix',
    lastChecked: new Date('2026-02-04'),
  },
]

const ENDPOINT_GAPS: EndpointGap[] = [
  {
    id: 'eg-1',
    name: 'Equity Annual Summary',
    method: 'GET',
    path: '/equity/annual-summary',
    priority: 'medium',
    expectedParams: ['user_id', 'year', 'team_id'],
    implementedParams: ['user_id', 'year'],
    missingParams: ['team_id'],
    status: 'open',
  },
  {
    id: 'eg-2',
    name: 'Network Hierarchy Export',
    method: 'GET',
    path: '/network/hierarchy-export',
    priority: 'low',
    expectedParams: ['user_id', 'format', 'depth'],
    implementedParams: ['user_id'],
    missingParams: ['format', 'depth'],
    status: 'open',
  },
]

const SCHEMA_MISMATCHES: SchemaMismatch[] = [
  {
    id: 'sm-1',
    table: 'transaction',
    field: 'close_date',
    v1Type: 'text',
    v2Type: 'timestamp',
    v1Constraints: [],
    v2Constraints: ['NOT NULL'],
    severity: 'medium',
    impact:
      'Date parsing required during migration; some V1 records have non-standard date formats',
    resolutionApproach: 'Parse with fallback formats during bulk copy, log failures',
  },
  {
    id: 'sm-2',
    table: 'network_member',
    field: 'status',
    v1Type: 'text (free-form)',
    v2Type: 'enum',
    v1Constraints: [],
    v2Constraints: ['active', 'inactive', 'pending'],
    severity: 'low',
    impact: 'V1 has non-standard status values that need mapping',
    resolutionApproach: 'Map unknown values to "inactive" with audit log entry',
  },
]

const INTEGRITY_ISSUES: DataIntegrityIssue[] = [
  {
    id: 'di-1',
    issue: 'Orphaned participant records',
    description: 'Some V2 participant records reference non-existent transaction IDs',
    checkType: 'referential-integrity',
    affectedTable: 'participant',
    recordCount: 521,
    severity: 'medium',
    resolution: 'Run referential integrity cleanup after next bulk copy batch',
  },
  {
    id: 'di-2',
    issue: 'Null agent_id in network_member',
    description: 'network_member records with null agent_id cannot be linked to agent profiles',
    checkType: 'null-values',
    affectedTable: 'network_member',
    recordCount: 12,
    severity: 'low',
    resolution: 'Backfill agent_id from user table via join on user_id',
  },
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getDataGaps(): DataGap[] {
  return DATA_GAPS
}

export function getEndpointGaps(): EndpointGap[] {
  return ENDPOINT_GAPS
}

export function getSchemaMismatches(): SchemaMismatch[] {
  return SCHEMA_MISMATCHES
}

export function getDataIntegrityIssues(): DataIntegrityIssue[] {
  return INTEGRITY_ISSUES
}

export function getGapSummary(): GapSummary {
  return {
    dataGapsTotal: DATA_GAPS.length,
    dataGapsCritical: DATA_GAPS.filter((g) => g.severity === 'critical').length,
    endpointGapsTotal: ENDPOINT_GAPS.length,
    endpointGapsCritical: ENDPOINT_GAPS.filter((g) => g.priority === 'critical').length,
    schemaMismatchesTotal: SCHEMA_MISMATCHES.length,
    schemaMismatchesCritical: SCHEMA_MISMATCHES.filter((m) => m.severity === 'critical').length,
    integrityIssuesTotal: INTEGRITY_ISSUES.length,
    integrityIssuesCritical: INTEGRITY_ISSUES.filter((i) => i.severity === 'critical').length,
    affectedRecordsTotal: DATA_GAPS.reduce((sum, g) => sum + g.affectedRecords, 0),
  }
}
