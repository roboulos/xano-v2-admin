/**
 * Documentation Management System
 *
 * Factory functions and utilities for managing documentation structures,
 * serialization, and aggregation.
 */

import type {
  DocumentationPackage,
  SystemArchitecture,
  DataFlowCatalog,
  EndpointCatalog,
  DataModel,
  IntegrationGuide,
  EndpointDoc,
  TableDoc,
  DataFlow,
  APIGroupDoc,
  SystemComponent,
} from './types'

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createEmptyDocumentation(): DocumentationPackage {
  const now = new Date().toISOString()

  return {
    created_at: now,
    updated_at: now,
    version: '1.0.0',
    architecture: {
      title: 'System Architecture',
      api_groups: [],
      components: [],
      created_at: now,
      updated_at: now,
    },
    data_flows: {
      flows: [],
      common_patterns: {},
    },
    endpoints: {
      endpoints: [],
      total: 0,
      version: '1.0.0',
      last_updated: now,
    },
    data_model: {
      tables: [],
      total_tables: 0,
      relationships: [],
      version: '1.0.0',
      last_updated: now,
    },
    integrations: {
      integrations: [],
    },
  }
}

export function createSystemArchitecture(title: string, description?: string): SystemArchitecture {
  return {
    title,
    description,
    api_groups: [],
    components: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function createDataFlowCatalog(): DataFlowCatalog {
  return {
    flows: [],
    common_patterns: {},
  }
}

export function createEndpointCatalog(): EndpointCatalog {
  return {
    endpoints: [],
    total: 0,
    version: '1.0.0',
    last_updated: new Date().toISOString(),
  }
}

export function createDataModel(): DataModel {
  return {
    tables: [],
    total_tables: 0,
    relationships: [],
    version: '1.0.0',
    last_updated: new Date().toISOString(),
  }
}

export function createIntegrationGuide(): IntegrationGuide {
  return {
    integrations: [],
  }
}

// ============================================================================
// SERIALIZATION
// ============================================================================

export function serializeDocumentation(doc: DocumentationPackage): string {
  return JSON.stringify(doc, null, 2)
}

export function deserializeDocumentation(json: string): DocumentationPackage {
  try {
    const data = JSON.parse(json)

    // Validate structure
    if (!data.architecture || !data.endpoints || !data.data_model) {
      throw new Error('Invalid documentation structure')
    }

    return data as DocumentationPackage
  } catch (error) {
    console.error('Failed to deserialize documentation:', error)
    throw new Error('Invalid JSON for documentation package')
  }
}

// ============================================================================
// AGGREGATION & MERGING
// ============================================================================

export function mergeDocumentation(
  base: DocumentationPackage,
  updates: Partial<DocumentationPackage>
): DocumentationPackage {
  const now = new Date().toISOString()

  return {
    ...base,
    ...updates,
    updated_at: now,
    architecture: updates.architecture || base.architecture,
    data_flows: updates.data_flows || base.data_flows,
    endpoints: updates.endpoints || base.endpoints,
    data_model: updates.data_model || base.data_model,
    integrations: updates.integrations || base.integrations,
  }
}

export function addEndpointsToDoc(
  doc: DocumentationPackage,
  endpoints: EndpointDoc[]
): DocumentationPackage {
  const now = new Date().toISOString()

  // Deduplicate by endpoint path + method
  const existingPaths = new Set(doc.endpoints.endpoints.map((e) => `${e.method}:${e.path}`))
  const newEndpoints = endpoints.filter((e) => !existingPaths.has(`${e.method}:${e.path}`))

  return {
    ...doc,
    endpoints: {
      ...doc.endpoints,
      endpoints: [...doc.endpoints.endpoints, ...newEndpoints],
      total: doc.endpoints.endpoints.length + newEndpoints.length,
      last_updated: now,
    },
    updated_at: now,
  }
}

export function addTablesToDoc(
  doc: DocumentationPackage,
  tables: TableDoc[]
): DocumentationPackage {
  const now = new Date().toISOString()

  // Deduplicate by table name
  const existingNames = new Set(doc.data_model.tables.map((t) => t.name))
  const newTables = tables.filter((t) => !existingNames.has(t.name))

  return {
    ...doc,
    data_model: {
      ...doc.data_model,
      tables: [...doc.data_model.tables, ...newTables],
      total_tables: doc.data_model.tables.length + newTables.length,
      last_updated: now,
    },
    updated_at: now,
  }
}

export function addDataFlowsToDoc(
  doc: DocumentationPackage,
  flows: DataFlow[]
): DocumentationPackage {
  const now = new Date().toISOString()

  // Deduplicate by flow ID
  const existingIds = new Set(doc.data_flows.flows.map((f) => f.id))
  const newFlows = flows.filter((f) => !existingIds.has(f.id))

  return {
    ...doc,
    data_flows: {
      ...doc.data_flows,
      flows: [...doc.data_flows.flows, ...newFlows],
    },
    updated_at: now,
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface DocumentationStats {
  total_endpoints: number
  total_tables: number
  total_data_flows: number
  total_integrations: number
  total_api_groups: number
  total_components: number
  last_updated: string
}

export function getDocumentationStats(doc: DocumentationPackage): DocumentationStats {
  return {
    total_endpoints: doc.endpoints.total,
    total_tables: doc.data_model.total_tables,
    total_data_flows: doc.data_flows.flows.length,
    total_integrations: doc.integrations.integrations.length,
    total_api_groups: doc.architecture.api_groups.length,
    total_components: doc.architecture.components.length,
    last_updated: doc.updated_at,
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationError {
  section: string
  message: string
}

export function validateDocumentation(doc: DocumentationPackage): ValidationError[] {
  const errors: ValidationError[] = []

  // Check endpoints
  if (doc.endpoints.endpoints.length === 0) {
    errors.push({
      section: 'endpoints',
      message: 'No endpoints documented',
    })
  }

  // Check data model
  if (doc.data_model.tables.length === 0) {
    errors.push({
      section: 'data_model',
      message: 'No tables documented',
    })
  }

  // Check for duplicate endpoints
  const endpointKeys = doc.endpoints.endpoints.map((e) => `${e.method}:${e.path}`)
  const duplicates = endpointKeys.filter((key, index) => endpointKeys.indexOf(key) !== index)

  if (duplicates.length > 0) {
    errors.push({
      section: 'endpoints',
      message: `Duplicate endpoints found: ${duplicates.join(', ')}`,
    })
  }

  // Check for duplicate tables
  const tableNames = doc.data_model.tables.map((t) => t.name)
  const tableDuplicates = tableNames.filter((name, index) => tableNames.indexOf(name) !== index)

  if (tableDuplicates.length > 0) {
    errors.push({
      section: 'data_model',
      message: `Duplicate tables found: ${tableDuplicates.join(', ')}`,
    })
  }

  // Check endpoint total matches actual count
  if (doc.endpoints.total !== doc.endpoints.endpoints.length) {
    errors.push({
      section: 'endpoints',
      message: `Endpoint count mismatch: total=${doc.endpoints.total}, actual=${doc.endpoints.endpoints.length}`,
    })
  }

  return errors
}

// ============================================================================
// SEARCH & FILTERING
// ============================================================================

export interface SearchResults {
  endpoints: EndpointDoc[]
  tables: TableDoc[]
  data_flows: DataFlow[]
}

export function searchDocumentation(doc: DocumentationPackage, query: string): SearchResults {
  const lowerQuery = query.toLowerCase()

  const endpoints = doc.endpoints.endpoints.filter(
    (e) =>
      e.path.toLowerCase().includes(lowerQuery) ||
      e.name?.toLowerCase().includes(lowerQuery) ||
      e.description?.toLowerCase().includes(lowerQuery) ||
      e.method.toLowerCase().includes(lowerQuery)
  )

  const tables = doc.data_model.tables.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description?.toLowerCase().includes(lowerQuery) ||
      t.fields.some((f) => f.name.toLowerCase().includes(lowerQuery))
  )

  const data_flows = doc.data_flows.flows.filter(
    (f) =>
      f.name.toLowerCase().includes(lowerQuery) || f.description?.toLowerCase().includes(lowerQuery)
  )

  return {
    endpoints,
    tables,
    data_flows,
  }
}

export function filterEndpointsByTag(endpoints: EndpointDoc[], tag: string): EndpointDoc[] {
  return endpoints.filter((e) => e.tags?.includes(tag))
}

export function filterTablesByTag(tables: TableDoc[], tag: string): TableDoc[] {
  return tables.filter((t) => t.tags?.includes(tag))
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './types'
export * from './formatters'
