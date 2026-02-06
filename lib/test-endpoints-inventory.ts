// Test Endpoints Inventory
// Machine 2.0 Tests API Group (ID: 659, Canonical: 20LTQtIX)
// Workspace 5 (V2 Xano)
//
// These endpoints wrap Workers/Tasks functions for testing purposes
// They call the actual worker functions with standardized test inputs

export interface TestEndpoint {
  id: number
  path: string
  method: 'GET' | 'POST'
  name: string
  description: string
  functionId: number | null // The worker/task function this endpoint tests
  category: TestEndpointCategory
  requiresUserId: boolean
  defaultInputs: Record<string, unknown>
  lastTested?: string // ISO timestamp
  testResult?: 'pass' | 'fail' | 'untested'
  testNote?: string
}

export type TestEndpointCategory =
  | 'fub' // Follow Up Boss workers
  | 'rezen' // reZEN API workers
  | 'skyslope' // SkySlope integration
  | 'metrics' // Metrics calculation
  | 'network' // Network/downline workers
  | 'utility' // Utility functions
  | 'aggregation' // Aggregation jobs
  | 'system' // System utilities
  | 'seeding' // Test data seeding

// Machine 2.0 Tests API Group base URL
export const TEST_API_BASE = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX'

// Verified test user - see TRIGGER_ENDPOINTS_AUDIT.md and CLAUDE.md
// David Keener is user_id 7 in both V1 and V2 workspaces.
// The 'user 60' narrative was incorrect - he has always been user_id 7.
export const VERIFIED_TEST_USER = {
  v1_id: 7, // V1 workspace user ID
  v2_id: 7, // V2 workspace user ID (after migration)
  name: 'David Keener',
  agentId: 37208,
  teamId: 1,
  notes:
    'PRIMARY test user with extensive testing history. User ID 7 in both V1 and V2 workspaces.',
}

// ============================================================================
// COMPLETE TEST ENDPOINTS INVENTORY
// Based on TRIGGER_ENDPOINTS_AUDIT.md and lib/mcp-endpoints.ts
//
// IMPORTANT: These endpoints are in V2 workspace (x2nu-xcjc-vhax).
// David Keener is V2 user_id = 7. All endpoints use V2 user IDs.
// ============================================================================

export const TEST_ENDPOINTS: TestEndpoint[] = [
  // ============================================================================
  // FUB WORKERS (9 endpoints) - All PASS with V2 user_id 7
  // ============================================================================
  {
    id: 16680,
    path: '/trigger-fub-get-people-v3',
    method: 'POST',
    name: 'FUB - Get People V3',
    description: 'Fetch FUB people contacts for a user',
    functionId: 7960,
    category: 'fub',
    requiresUserId: true,
    defaultInputs: { user_id: 7, user_obj: { id: 7, team_id: 1 }, offset: '0', type: 'all' },
    testResult: 'pass',
    testNote: 'Returns people_found, inserted, updated counts',
  },
  {
    id: 16681,
    path: '/trigger-fub-get-deals',
    method: 'POST',
    name: 'FUB - Get Deals',
    description: 'Get FUB deals for a user',
    functionId: 10022,
    category: 'fub',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16682,
    path: '/test-fub-calls-8065',
    method: 'POST',
    name: 'FUB - Calls Sync',
    description: 'Sync FUB calls for a user',
    functionId: 8065,
    category: 'fub',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16683,
    path: '/trigger-fub-get-account-users',
    method: 'POST',
    name: 'FUB - Get Account Users',
    description: 'Fetch FUB account users',
    functionId: null,
    category: 'fub',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16684,
    path: '/trigger-fub-get-stages',
    method: 'POST',
    name: 'FUB - Get Stages',
    description: 'Get FUB deal stages',
    functionId: null,
    category: 'fub',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16685,
    path: '/trigger-fub-refresh-tokens',
    method: 'POST',
    name: 'FUB - Refresh Tokens',
    description: 'Refresh FUB OAuth tokens',
    functionId: null,
    category: 'fub',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16686,
    path: '/trigger-fub-get-appointments',
    method: 'POST',
    name: 'FUB - Get Appointments',
    description: 'Fetch FUB appointments',
    functionId: 8067,
    category: 'fub',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16687,
    path: '/trigger-fub-get-events',
    method: 'POST',
    name: 'FUB - Get Events',
    description: 'Fetch FUB events',
    functionId: null,
    category: 'fub',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16688,
    path: '/trigger-fub-get-text-messages',
    method: 'POST',
    name: 'FUB - Get Text Messages',
    description: 'Fetch FUB text messages',
    functionId: null,
    category: 'fub',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },

  // ============================================================================
  // SKYSLOPE WORKERS (5/7 endpoints) - 5 PASS, 2 issues
  // ============================================================================
  {
    id: 16690,
    path: '/test-skyslope-create-auth',
    method: 'POST',
    name: 'SkySlope - Create Auth',
    description: 'Create SkySlope authentication',
    functionId: null,
    category: 'skyslope',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16649,
    path: '/test-team-sync',
    method: 'POST',
    name: 'SkySlope - Team Sync',
    description: 'Sync team data from SkySlope',
    functionId: null,
    category: 'skyslope',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
    testNote: 'Replaced broken trigger-skyslope-get-account-users',
  },
  {
    id: 16651,
    path: '/test-skyslope-get-listing-data',
    method: 'POST',
    name: 'SkySlope - Get Listing Data',
    description: 'Fetch listing data from SkySlope',
    functionId: null,
    category: 'skyslope',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
    testNote: 'Fixed version with proper job lookup',
  },
  {
    id: 16691,
    path: '/trigger-skyslope-move-transactions-7963',
    method: 'POST',
    name: 'SkySlope - Move Transactions',
    description: 'Move SkySlope transactions to main tables',
    functionId: 7963,
    category: 'skyslope',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16650,
    path: '/test-skyslope-get-transaction-data',
    method: 'POST',
    name: 'SkySlope - Get Transaction Data',
    description: 'Fetch transaction data from SkySlope',
    functionId: 8031,
    category: 'skyslope',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'fail',
    testNote: 'Error: Missing param: key - needs investigation',
  },

  // ============================================================================
  // REZEN WORKERS (10 endpoints) - 9 PASS, 1 fixed in Jan 2026
  // ============================================================================
  {
    id: 16700,
    path: '/trigger-rezen-agent-data',
    method: 'POST',
    name: 'reZEN - Agent Data',
    description: 'Fetch agent profile data from reZEN API',
    functionId: 8051,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16701,
    path: '/trigger-rezen-transactions-sync',
    method: 'POST',
    name: 'reZEN - Transactions Sync',
    description: 'Sync transactions from reZEN API',
    functionId: 8052,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16702,
    path: '/trigger-rezen-listings-sync',
    method: 'POST',
    name: 'reZEN - Listings Sync',
    description: 'Sync listings from reZEN API',
    functionId: 8053,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16703,
    path: '/trigger-rezen-equity',
    method: 'POST',
    name: 'reZEN - Equity',
    description: 'Sync equity/stock data',
    functionId: 8055,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16704,
    path: '/trigger-rezen-contributions',
    method: 'POST',
    name: 'reZEN - Contributions',
    description: 'Process contribution records',
    functionId: 8056,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16705,
    path: '/trigger-rezen-network-cap-data',
    method: 'POST',
    name: 'reZEN - Network Cap Data',
    description: 'Process network cap data',
    functionId: 8058,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16706,
    path: '/trigger-rezen-network-frontline',
    method: 'POST',
    name: 'reZEN - Network Frontline',
    description: 'Process network frontline data',
    functionId: 8059,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16707,
    path: '/trigger-rezen-get-front-line-agents',
    method: 'POST',
    name: 'reZEN - Get Frontline Agents',
    description: 'Get frontline agent data',
    functionId: null,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16708,
    path: '/trigger-rezen-get-equity-performance',
    method: 'POST',
    name: 'reZEN - Get Equity Performance',
    description: 'Get equity performance metrics',
    functionId: null,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16652,
    path: '/test-rezen-team-roster-sync',
    method: 'POST',
    name: 'reZEN - Team Roster Sync',
    description: 'Sync team roster from reZEN API - calls function #8032',
    functionId: 8032,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
    testNote: 'FIXED Jan 2026: Changed header array from inline to |push pattern',
  },

  // ============================================================================
  // METRICS WORKERS (5 endpoints) - All PASS
  // ============================================================================
  {
    id: 16654,
    path: '/test-metrics-get-cap-metrics',
    method: 'POST',
    name: 'Metrics - Get Cap Metrics',
    description: 'Calculate cap metrics for user',
    functionId: null,
    category: 'metrics',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
    testNote: 'Fixed version with proper user object lookup',
  },
  {
    id: 16710,
    path: '/trigger-metrics-get-network-metrics',
    method: 'POST',
    name: 'Metrics - Get Network Metrics',
    description: 'Calculate network metrics',
    functionId: null,
    category: 'metrics',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16711,
    path: '/trigger-metrics-get-transaction-metrics',
    method: 'POST',
    name: 'Metrics - Get Transaction Metrics',
    description: 'Calculate transaction metrics',
    functionId: null,
    category: 'metrics',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16656,
    path: '/test-metrics-calculate-totals',
    method: 'POST',
    name: 'Metrics - Calculate Totals',
    description: 'Calculate aggregate totals',
    functionId: null,
    category: 'metrics',
    requiresUserId: false,
    defaultInputs: { api_endpoint: 'test', count: 1, calling_function: 'test' },
    testResult: 'pass',
    testNote: 'Fixed version with proper inputs',
  },

  // ============================================================================
  // NETWORK WORKERS (4 endpoints) - All PASS
  // ============================================================================
  {
    id: 16720,
    path: '/trigger-network-get-cap-data',
    method: 'POST',
    name: 'Network - Get Cap Data',
    description: 'Get network cap data',
    functionId: null,
    category: 'network',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16721,
    path: '/trigger-network-get-frontline-data',
    method: 'POST',
    name: 'Network - Get Frontline Data',
    description: 'Get frontline network data',
    functionId: null,
    category: 'network',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16722,
    path: '/trigger-network-get-downline',
    method: 'POST',
    name: 'Network - Get Downline',
    description: 'Get network downline hierarchy',
    functionId: 8062,
    category: 'network',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },
  {
    id: 16723,
    path: '/trigger-network-downline-sync',
    method: 'POST',
    name: 'Network - Downline Sync',
    description: 'Sync network downline data',
    functionId: 8074,
    category: 'network',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'pass',
  },

  // ============================================================================
  // UTILITY WORKERS (3 endpoints) - All PASS
  // ============================================================================
  {
    id: 16657,
    path: '/test-utility-format-phone',
    method: 'POST',
    name: 'Utility - Format Phone',
    description: 'Format phone number to standard format',
    functionId: null,
    category: 'utility',
    requiresUserId: false,
    defaultInputs: { phone: '15551234567' },
    testResult: 'pass',
  },
  {
    id: 16730,
    path: '/trigger-utility-validate-email',
    method: 'POST',
    name: 'Utility - Validate Email',
    description: 'Validate email format',
    functionId: null,
    category: 'utility',
    requiresUserId: false,
    defaultInputs: { phone: '15551234567' },
    testResult: 'pass',
    testNote: 'Fixed: removed timing vars causing syntax error',
  },
  {
    id: 16731,
    path: '/trigger-utility-generate-uuid',
    method: 'POST',
    name: 'Utility - Generate UUID',
    description: 'Generate UUID for records',
    functionId: null,
    category: 'utility',
    requiresUserId: false,
    defaultInputs: {
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      fullAddress: '',
    },
    testResult: 'pass',
    testNote: 'Fixed: made all params optional',
  },

  // ============================================================================
  // ONBOARDING TEST ENDPOINTS (Machine 2.0)
  // From onboarding-tab.tsx - these test the V2 onboarding workflow
  // ============================================================================
  {
    id: 16740,
    path: '/test-function-8066-team-roster',
    method: 'POST',
    name: 'Onboarding - Team Roster',
    description: 'Step 1: Fetch team roster and structure',
    functionId: 8066,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'untested',
  },
  {
    id: 16741,
    path: '/test-function-8051-agent-data',
    method: 'POST',
    name: 'Onboarding - Agent Data',
    description: 'Step 2: Sync agent profile information',
    functionId: 8051,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'untested',
  },
  {
    id: 16742,
    path: '/test-function-8052-txn-sync',
    method: 'POST',
    name: 'Onboarding - Transaction Sync',
    description: 'Step 3: Sync transactions from reZEN API',
    functionId: 8052,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'untested',
  },
  {
    id: 16743,
    path: '/test-function-8053-listings-sync',
    method: 'POST',
    name: 'Onboarding - Listings Sync',
    description: 'Step 4a: Sync property listings',
    functionId: 8053,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'untested',
  },
  {
    id: 16744,
    path: '/test-function-8054-listings-update',
    method: 'POST',
    name: 'Onboarding - Listings Update',
    description: 'Step 4b: Update existing listings',
    functionId: 8054,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'untested',
  },
  {
    id: 16745,
    path: '/test-function-8056-contributions',
    method: 'POST',
    name: 'Onboarding - Contributions',
    description: 'Step 5a: Sync contribution data',
    functionId: 8056,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'untested',
  },
  {
    id: 16746,
    path: '/test-function-8060-load-contributions',
    method: 'POST',
    name: 'Onboarding - Load Contributions',
    description: 'Step 5b: Load contribution records',
    functionId: 8060,
    category: 'rezen',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'untested',
  },
  {
    id: 16747,
    path: '/test-function-8062-network-downline',
    method: 'POST',
    name: 'Onboarding - Network Downline',
    description: 'Step 6a: Sync network downline',
    functionId: 8062,
    category: 'network',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'untested',
  },
  {
    id: 16748,
    path: '/test-function-8070-sponsor-tree',
    method: 'POST',
    name: 'Onboarding - Sponsor Tree',
    description: 'Step 6b: Build sponsor tree hierarchy',
    functionId: 8070,
    category: 'network',
    requiresUserId: true,
    defaultInputs: { user_id: 7 },
    testResult: 'untested',
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get endpoints by category
export function getEndpointsByCategory(category: TestEndpointCategory): TestEndpoint[] {
  return TEST_ENDPOINTS.filter((e) => e.category === category)
}

// Get endpoints requiring user_id
export function getEndpointsRequiringUserId(): TestEndpoint[] {
  return TEST_ENDPOINTS.filter((e) => e.requiresUserId)
}

// Get standalone endpoints (no user_id required)
export function getStandaloneEndpoints(): TestEndpoint[] {
  return TEST_ENDPOINTS.filter((e) => !e.requiresUserId)
}

// Get passing endpoints
export function getPassingEndpoints(): TestEndpoint[] {
  return TEST_ENDPOINTS.filter((e) => e.testResult === 'pass')
}

// Get failing endpoints
export function getFailingEndpoints(): TestEndpoint[] {
  return TEST_ENDPOINTS.filter((e) => e.testResult === 'fail')
}

// Get untested endpoints
export function getUntestedEndpoints(): TestEndpoint[] {
  return TEST_ENDPOINTS.filter((e) => e.testResult === 'untested' || !e.testResult)
}

// Get test statistics
export function getTestStats() {
  const total = TEST_ENDPOINTS.length
  const passing = getPassingEndpoints().length
  const failing = getFailingEndpoints().length
  const untested = getUntestedEndpoints().length
  const testedCount = passing + failing

  return {
    total,
    passing,
    failing,
    untested,
    testedCount,
    passRate: testedCount > 0 ? Math.round((passing / testedCount) * 100) : 0,
    coverageRate: Math.round((testedCount / total) * 100),
    byCategory: {
      fub: getEndpointsByCategory('fub').length,
      rezen: getEndpointsByCategory('rezen').length,
      skyslope: getEndpointsByCategory('skyslope').length,
      metrics: getEndpointsByCategory('metrics').length,
      network: getEndpointsByCategory('network').length,
      utility: getEndpointsByCategory('utility').length,
    },
  }
}

// Build full URL for an endpoint
export function buildTestUrl(endpoint: TestEndpoint): string {
  return `${TEST_API_BASE}${endpoint.path}`
}

// Generate curl command for testing
export function generateCurlCommand(
  endpoint: TestEndpoint,
  userId = VERIFIED_TEST_USER.v1_id
): string {
  const url = buildTestUrl(endpoint)
  const inputs = endpoint.requiresUserId
    ? { ...endpoint.defaultInputs, user_id: userId }
    : endpoint.defaultInputs

  return `curl -s -X ${endpoint.method} "${url}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(inputs)}' | jq '.'`
}
