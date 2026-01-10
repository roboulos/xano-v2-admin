// API service for Xano Workspace Introspection
// Fetches LIVE data from V2 endpoints

const BASE_URL = "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O"

export interface XanoTable {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
  tag: string[]
  schema?: Array<{
    name: string
    type: string
    nullable: boolean
    required: boolean
  }>
}

export interface XanoApiGroup {
  id: number
  name: string
  description: string
  canonical: string
  created_at: string
  updated_at: string
  tag: string[]
}

export interface XanoFunction {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
  tag: string[]
}

export interface XanoTask {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
  tag: string[]
}

export interface ComparisonSummary {
  summary: {
    tables: { v1: number; v2: number }
    api_groups: { v1: number; v2: number }
    functions: { v1: number; v2: number }
    background_tasks: { v1: number; v2: number }
  }
  generated_at: number
}

export interface TablesResponse {
  success: boolean
  total: number
  tables: XanoTable[]
}

export interface ApiGroupsResponse {
  v1: { total: number; groups: XanoApiGroup[] }
  v2: { total: number; groups: XanoApiGroup[] }
}

export interface FunctionsResponse {
  v1: { total: number; functions: XanoFunction[] }
  v2: { total: number; functions: XanoFunction[] }
}

export interface TasksResponse {
  v1: { total: number; tasks: XanoTask[] }
  v2: { total: number; tasks: XanoTask[] }
}

// Fetch with timeout and error handling
async function fetchWithTimeout<T>(url: string, timeoutMs = 120000): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`)
    }
    throw error
  }
}

// API Functions
export const introspectionApi = {
  // Get comparison summary (fastest - just counts)
  async getComparisonSummary(): Promise<ComparisonSummary> {
    return fetchWithTimeout<ComparisonSummary>(`${BASE_URL}/comparison-summary`)
  },

  // Get all V1 tables
  async getV1Tables(): Promise<TablesResponse> {
    return fetchWithTimeout<TablesResponse>(`${BASE_URL}/v1-tables`)
  },

  // Get all V2 tables
  async getV2Tables(): Promise<TablesResponse> {
    return fetchWithTimeout<TablesResponse>(`${BASE_URL}/v2-tables`)
  },

  // Get all API groups (V1 and V2)
  async getApiGroups(): Promise<ApiGroupsResponse> {
    return fetchWithTimeout<ApiGroupsResponse>(`${BASE_URL}/api-groups`)
  },

  // Get all functions (V1 and V2)
  async getFunctions(): Promise<FunctionsResponse> {
    return fetchWithTimeout<FunctionsResponse>(`${BASE_URL}/functions`)
  },

  // Get all background tasks (V1 and V2)
  async getBackgroundTasks(): Promise<TasksResponse> {
    return fetchWithTimeout<TasksResponse>(`${BASE_URL}/background-tasks`)
  },
}
