/**
 * Documentation Data Structure Types
 *
 * Unified representations for system documentation, including architecture,
 * data flows, endpoint catalogs, and migration status.
 */

// ============================================================================
// SYSTEM ARCHITECTURE
// ============================================================================

export interface SystemComponent {
  id: string
  name: string
  type: 'service' | 'module' | 'library' | 'external'
  description?: string
  dependencies?: string[]
  version?: string
}

export interface APIGroupDoc {
  id: number
  name: string
  path: string
  description?: string
  endpoints_count: number
  authentication?: string
  version?: string
  components: SystemComponent[]
}

export interface SystemArchitecture {
  title: string
  description?: string
  api_groups: APIGroupDoc[]
  components: SystemComponent[]
  diagram_mmd?: string // Mermaid diagram
  created_at: string
  updated_at: string
}

// ============================================================================
// DATA FLOW
// ============================================================================

export interface DataFlowNode {
  id: string
  label: string
  type: 'user' | 'service' | 'database' | 'external'
  description?: string
}

export interface DataFlowEdge {
  from: string
  to: string
  label?: string
  data_type?: string
  direction: 'request' | 'response' | 'event'
}

export interface DataFlow {
  id: string
  name: string
  description?: string
  trigger?: string
  nodes: DataFlowNode[]
  edges: DataFlowEdge[]
  diagram_mmd?: string // Mermaid diagram
  steps?: string[] // Human-readable steps
}

export interface DataFlowCatalog {
  flows: DataFlow[]
  common_patterns?: Record<string, DataFlow>
}

// ============================================================================
// ENDPOINT CATALOG
// ============================================================================

export interface EndpointDocParameter {
  name: string
  in: 'query' | 'path' | 'body'
  type: string
  required: boolean
  description?: string
  example?: any
}

export interface EndpointDocResponse {
  status: number
  description: string
  schema?: Record<string, any>
  example?: any
}

export interface EndpointDoc {
  id: number
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  name?: string
  description?: string
  api_group?: string
  parameters: EndpointDocParameter[]
  request_body?: {
    description?: string
    schema: Record<string, any>
    example?: any
  }
  responses: Record<string, EndpointDocResponse>
  authentication?: {
    type: 'none' | 'bearer' | 'api_key'
    description?: string
  }
  tags?: string[]
  deprecated?: boolean
  migration_notes?: string // V1->V2 migration info
}

export interface EndpointCatalog {
  endpoints: EndpointDoc[]
  total: number
  version?: string
  last_updated: string
}

// ============================================================================
// DATA MODEL REFERENCE
// ============================================================================

export interface FieldDoc {
  name: string
  type: string
  required: boolean
  unique?: boolean
  indexed?: boolean
  description?: string
  default_value?: any
  validation_rules?: string[]
  example?: any
}

export interface RelationshipDoc {
  field: string
  referenced_table: string
  referenced_field: string
  cascade_delete?: boolean
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
}

export interface TableDoc {
  id: number
  name: string
  description?: string
  record_count?: number
  fields: FieldDoc[]
  relationships: RelationshipDoc[]
  indexes?: Array<{
    name: string
    fields: string[]
  }>
  tags?: string[]
  migration_notes?: string // V1->V2 migration info
}

export interface DataModel {
  tables: TableDoc[]
  total_tables: number
  relationships: Array<{
    from_table: string
    to_table: string
    type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  }>
  diagram_mmd?: string // ER diagram in Mermaid
  version?: string
  last_updated: string
}

// ============================================================================
// INTEGRATION GUIDE
// ============================================================================

export interface IntegrationAuth {
  type: 'oauth' | 'api_key' | 'bearer_token' | 'basic'
  description: string
  setup_url?: string
}

export interface IntegrationEndpoint {
  name: string
  method: string
  path: string
  description?: string
}

export interface SyncJob {
  name: string
  frequency: string
  description?: string
  last_run?: string
  next_run?: string
  status?: 'active' | 'paused' | 'failed'
}

export interface IntegrationDoc {
  id: string
  name: string
  description?: string
  external_service: string
  service_url?: string
  authentication: IntegrationAuth
  endpoints: IntegrationEndpoint[]
  data_mapping?: Record<string, string> // External field -> V2 field
  sync_jobs?: SyncJob[]
  webhooks?: Array<{
    event: string
    endpoint: string
  }>
  status: 'active' | 'inactive' | 'deprecated'
  setup_guide?: string // URL to setup documentation
}

export interface IntegrationGuide {
  integrations: IntegrationDoc[]
  webhook_shared_secret?: string
  rate_limits?: Record<string, string>
}

// ============================================================================
// DOCUMENTATION PACKAGE
// ============================================================================

export interface DocumentationPackage {
  created_at: string
  updated_at: string
  version: string
  architecture: SystemArchitecture
  data_flows: DataFlowCatalog
  endpoints: EndpointCatalog
  data_model: DataModel
  integrations: IntegrationGuide
}
