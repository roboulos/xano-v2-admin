/**
 * Snappy CLI Client Wrapper
 *
 * Provides typed interface to snappy CLI for programmatic Xano control
 * All 127 tools available - tables, functions, endpoints, etc.
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Snappy CLI path - configurable via environment variable
const SNAPPY_PATH =
  process.env.SNAPPY_CLI_PATH || '/Users/sboulos/Desktop/ai_projects/snappy-cli/bin/snappy'

export interface SnappyConfig {
  instance?: string
  workspace?: number
  branch?: string
}

export interface XanoTable {
  id: number
  name: string
  auth_enabled: boolean
  record_count: string
  last_modified: string
  tags: string[]
  description: string | null
}

export interface XanoFunction {
  id: number
  name: string
  type: string
  description?: string
  folder?: string
}

export interface XanoEndpoint {
  id: number
  path: string
  method: string
  name: string
  api_group_id: number
}

export interface XanoAPIGroup {
  id: number
  name: string
  path: string
  endpoint_count?: number
}

// ============================================================================
// ENHANCED METADATA TYPES
// ============================================================================

export interface FunctionInput {
  name: string
  type: string
  required: boolean
  description?: string
}

export interface FunctionOutput {
  name: string
  type: string
  description?: string
}

export interface FunctionDetail extends XanoFunction {
  inputs: FunctionInput[]
  outputs: FunctionOutput[]
  xanoscript?: string
  tags: string[]
  version?: number
  created_at?: string
  updated_at?: string
}

export interface EndpointParameter {
  name: string
  in: 'query' | 'path' | 'body'
  type: string
  required: boolean
  description?: string
}

export interface EndpointResponse {
  status: number
  description: string
  schema?: Record<string, any>
}

export interface EndpointDetail extends XanoEndpoint {
  parameters: EndpointParameter[]
  responses: Record<string, EndpointResponse>
  authentication?: string
  description?: string
  tags: string[]
  version?: number
}

export interface TableField {
  name: string
  type: string
  required: boolean
  unique?: boolean
  indexed?: boolean
  description?: string
  default_value?: any
}

export interface TableRelationship {
  field: string
  referenced_table: string
  referenced_field: string
  cascade_delete?: boolean
}

export interface TableDetail extends XanoTable {
  fields: TableField[]
  relationships: TableRelationship[]
  indexes?: string[]
  version?: number
}

export interface MigrationStatus {
  id: string
  name: string
  type: 'table' | 'endpoint' | 'function' | 'api_group'
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  v1_id?: number
  v2_id?: number
  last_sync?: string
  notes?: string
}

/**
 * Execute snappy CLI command and parse JSON output
 */
async function execSnappy(tool: string, args: Record<string, any> = {}): Promise<any> {
  const argsJson = JSON.stringify(args)
  const command = `${SNAPPY_PATH} exec ${tool} --args '${argsJson}' --json`

  try {
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large responses
    })

    // Extract JSON from snappy's formatted output
    const jsonMatch = stdout.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error(`No JSON found in snappy output. stderr: ${stderr}`)
    }

    const wrapper = JSON.parse(jsonMatch[0])

    // Check for error in wrapper
    if (wrapper.error) {
      throw new Error(wrapper.error)
    }

    // Snappy returns data inside content[0].text as JSON string
    if (wrapper.content && wrapper.content[0] && wrapper.content[0].text) {
      const textContent = wrapper.content[0].text
      // Extract the JSON object from the formatted text (skip the header lines)
      const dataMatch = textContent.match(/\{[\s\S]*\}/)
      if (dataMatch) {
        return JSON.parse(dataMatch[0])
      }
    }

    // Fallback to wrapper if no content field
    return wrapper
  } catch (error: any) {
    console.error(`[snappy] ${tool} failed:`, error.message)
    throw error
  }
}

/**
 * Snappy Client - Programmatic Xano Control
 */
export class SnappyClient {
  private config: SnappyConfig

  constructor(config: SnappyConfig = {}) {
    this.config = config
  }

  // ============================================================================
  // TABLES
  // ============================================================================

  async listTables(
    options: {
      search?: string
      limit?: number
      page?: number
    } = {}
  ): Promise<{ tables: XanoTable[]; total: number }> {
    const result = await execSnappy('list_tables', {
      ...this.config,
      ...options,
    })
    return {
      tables: result.tables || [],
      total: result.total || 0,
    }
  }

  async getTableSchema(tableId: number): Promise<any> {
    return execSnappy('get_table_schema', {
      ...this.config,
      table_id: tableId,
    })
  }

  async queryTable(
    tableName: string,
    options: {
      limit?: number
      filters?: Record<string, any>
      search?: string
    } = {}
  ): Promise<any> {
    return execSnappy('query_table', {
      ...this.config,
      table_name: tableName,
      ...options,
    })
  }

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  async listFunctions(
    options: {
      search?: string
      limit?: number
      page?: number
    } = {}
  ): Promise<{ functions: XanoFunction[]; total: number }> {
    const { limit, ...rest } = options
    const result = await execSnappy('list_functions', {
      ...this.config,
      ...rest,
      ...(limit && { per_page: limit }), // Map "limit" to "per_page" for snappy CLI
    })
    return {
      functions: result.functions || [],
      total: result.total || 0,
    }
  }

  async getFunction(functionId: number): Promise<XanoFunction> {
    return execSnappy('get_function', {
      ...this.config,
      function_id: functionId,
    })
  }

  // ============================================================================
  // ENDPOINTS
  // ============================================================================

  async listEndpoints(
    options: {
      api_group_id?: number
      search?: string
      limit?: number
      page?: number
    } = {}
  ): Promise<{ endpoints: XanoEndpoint[]; total: number }> {
    const result = await execSnappy('list_endpoints', {
      ...this.config,
      ...options,
    })
    return {
      endpoints: result.endpoints || [],
      total: result.total || 0,
    }
  }

  async getEndpoint(endpointId: number): Promise<XanoEndpoint> {
    return execSnappy('get_endpoint', {
      ...this.config,
      endpoint_id: endpointId,
    })
  }

  // ============================================================================
  // API GROUPS
  // ============================================================================

  async listAPIGroups(): Promise<{ api_groups: XanoAPIGroup[]; total: number }> {
    const result = await execSnappy('list_api_groups', {
      ...this.config,
    })
    return {
      api_groups: result.api_groups || [],
      total: result.total || 0,
    }
  }

  async getAPIGroup(apiGroupId: number): Promise<XanoAPIGroup> {
    return execSnappy('get_api_group', {
      ...this.config,
      api_group_id: apiGroupId,
    })
  }

  // ============================================================================
  // OPENAPI SPECS
  // ============================================================================

  async getWorkspaceOpenAPI(): Promise<any> {
    return execSnappy('get_workspace_openapi', {
      ...this.config,
    })
  }

  async getAPIGroupOpenAPI(apiGroupId: number): Promise<any> {
    return execSnappy('get_apigroup_openapi', {
      ...this.config,
      api_group_id: apiGroupId,
    })
  }

  // ============================================================================
  // TASKS
  // ============================================================================

  async listTasks(
    options: {
      search?: string
      limit?: number
      page?: number
    } = {}
  ): Promise<any> {
    const { limit, ...rest } = options
    const result = await execSnappy('list_tasks', {
      ...this.config,
      ...rest,
      ...(limit && { per_page: limit }), // Map "limit" to "per_page" for snappy CLI
    })
    return {
      tasks: result.tasks || [],
      total: result.total || 0,
      next_page: result.next_page || null,
    }
  }

  // ============================================================================
  // ENHANCED METADATA METHODS
  // ============================================================================

  async getFunctionDetail(functionId: number): Promise<FunctionDetail> {
    const baseFunc = await this.getFunction(functionId)

    try {
      const detail = await execSnappy('get_function_detail', {
        ...this.config,
        function_id: functionId,
      })

      return {
        ...baseFunc,
        inputs: detail.inputs || [],
        outputs: detail.outputs || [],
        xanoscript: detail.xanoscript,
        tags: detail.tags || [],
        version: detail.version,
        created_at: detail.created_at,
        updated_at: detail.updated_at,
      }
    } catch (error) {
      // Fallback if detailed fetch fails
      console.warn(`[snappy] get_function_detail failed for ${functionId}, using basic info`)
      return {
        ...baseFunc,
        inputs: [],
        outputs: [],
        tags: baseFunc.description ? [baseFunc.description] : [],
      }
    }
  }

  async getEndpointDetail(endpointId: number): Promise<EndpointDetail> {
    const baseEndpoint = await this.getEndpoint(endpointId)

    try {
      const detail = await execSnappy('get_endpoint_detail', {
        ...this.config,
        endpoint_id: endpointId,
      })

      return {
        ...baseEndpoint,
        parameters: detail.parameters || [],
        responses: detail.responses || {},
        authentication: detail.authentication,
        description: detail.description,
        tags: detail.tags || [],
        version: detail.version,
      }
    } catch (error) {
      // Fallback if detailed fetch fails
      console.warn(`[snappy] get_endpoint_detail failed for ${endpointId}, using basic info`)
      return {
        ...baseEndpoint,
        parameters: [],
        responses: {},
        tags: [],
      }
    }
  }

  async getTableDetail(tableId: number): Promise<TableDetail> {
    const baseTable = await this.getTableSchema(tableId)

    try {
      const detail = await execSnappy('get_table_detail', {
        ...this.config,
        table_id: tableId,
      })

      return {
        ...baseTable,
        fields: detail.fields || [],
        relationships: detail.relationships || [],
        indexes: detail.indexes,
        version: detail.version,
      }
    } catch (error) {
      // Fallback if detailed fetch fails
      console.warn(`[snappy] get_table_detail failed for ${tableId}, using basic info`)
      return {
        ...baseTable,
        fields: [],
        relationships: [],
      }
    }
  }

  async getTableRelationships(tableId: number): Promise<TableRelationship[]> {
    try {
      const result = await execSnappy('get_table_relationships', {
        ...this.config,
        table_id: tableId,
      })
      return result.relationships || []
    } catch (error) {
      console.warn(`[snappy] get_table_relationships failed for ${tableId}`)
      return []
    }
  }

  async getMigrationStatus(
    options: {
      type?: 'table' | 'endpoint' | 'function' | 'api_group'
      status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
    } = {}
  ): Promise<MigrationStatus[]> {
    try {
      const result = await execSnappy('get_migration_status', {
        ...this.config,
        ...options,
      })
      return result.migrations || []
    } catch (error) {
      console.warn(`[snappy] get_migration_status failed`)
      return []
    }
  }

  async updateMigrationStatus(
    itemId: string,
    status: MigrationStatus['status'],
    notes?: string
  ): Promise<MigrationStatus> {
    const result = await execSnappy('update_migration_status', {
      ...this.config,
      item_id: itemId,
      status,
      notes,
    })
    return result
  }

  async getAllTableFields(): Promise<Record<number, TableField[]>> {
    try {
      const result = await execSnappy('get_all_table_fields', {
        ...this.config,
      })
      return result.table_fields || {}
    } catch (error) {
      console.warn(`[snappy] get_all_table_fields failed`)
      return {}
    }
  }

  async getAllRelationships(): Promise<
    Array<{ table_id: number; relationships: TableRelationship[] }>
  > {
    try {
      const result = await execSnappy('get_all_relationships', {
        ...this.config,
      })
      return result.relationships || []
    } catch (error) {
      console.warn(`[snappy] get_all_relationships failed`)
      return []
    }
  }
}

// ============================================================================
// PRECONFIGURED CLIENTS
// ============================================================================

// V1 Workspace (Production)
export const v1Client = new SnappyClient({
  instance: 'xmpx-swi5-tlvy.n7c.xano.io',
  workspace: 1,
  branch: 'live',
})

// V2 Workspace (Normalized)
export const v2Client = new SnappyClient({
  instance: 'x2nu-xcjc-vhax.agentdashboards.xano.io',
  workspace: 5,
  branch: 'live',
})
