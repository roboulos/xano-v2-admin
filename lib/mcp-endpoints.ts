// MCP Endpoint Mapping
// Maps background tasks to their actual MCP API test endpoints
// These endpoints exist in the MCP: Tasks (api:4psV7fp6) and MCP: Workers (api:4UsTtl3m) groups
//
// KNOWN GAPS (Jan 2026):
// - /test-function-8074-sync-nw-downline: Endpoint does not exist in Xano (use /test-function-8062-network-downline)
// - /test-task-7977: Timeout issues - long-running FUB onboarding task
// - /backfill-all-updated-at: Timeout issues - long-running backfill operation
// - /seed/demo-dataset: 500 error - Xano backend issue (Invalid name: mvpw5:0)
// - /seed/team/count: 500 error - Xano backend issue (Invalid name: mvpw5:365)
// - /clear/all: 500 error - Xano backend seeding function issue
//
// FIXED (Jan 2026):
// - /test-skyslope-account-users-sync: Was returning null (empty stack), now calls function 7966
// - /test-function-8118-lambda-coordinator: Uses `ad_user_id` not `user_id` (ad = Agent Dashboards)
//   Also requires `endpoint_type` parameter: "people", "events", "calls", "appointments", "deals", "textMessages"
//
// PARAMETER NAMING:
// - Most endpoints use `user_id` for the test user parameter
// - FUB Lambda Coordinator (8118) uses `ad_user_id` instead
// - Some endpoints require additional parameters beyond user_id

export interface MCPEndpoint {
  taskId: number // Background task ID
  taskName: string // Human-readable name
  endpoint: string // Actual MCP endpoint path
  apiGroup: 'TASKS' | 'WORKERS' | 'SYSTEM' | 'SEEDING' | 'AUTH' | 'FRONTEND'
  method: 'GET' | 'POST'
  requiresUserId: boolean // Does this endpoint need user_id param?
  requiresAuth?: boolean // Does this endpoint need Authorization header?
  userIdParamName?: string // Custom param name if not 'user_id' (e.g., 'ad_user_id')
  additionalParams?: Record<string, string | number | boolean> // Additional required params
  description: string // What this endpoint does
}

// MCP API Base URLs
export const MCP_BASES = {
  TASKS: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6',
  WORKERS: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m',
  SYSTEM: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN',
  SEEDING: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG',
  AUTH: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x', // API Group 519
  FRONTEND: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I', // API Group 515
} as const

// Known working MCP endpoints (discovered via curl testing)
export const MCP_ENDPOINTS: MCPEndpoint[] = [
  // ============================================================================
  // TASKS GROUP (api:4psV7fp6) - Orchestrators
  // ============================================================================
  {
    taskId: 2466,
    taskName: 'reZEN - Remove Duplicates',
    endpoint: '/test-task-8022',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Remove duplicate network and contribution records',
  },
  {
    taskId: 0, // Daily Update People
    taskName: 'FUB - Daily Update People',
    endpoint: '/test-function-7960-daily-update-people',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Process daily FUB people sync jobs',
  },
  {
    taskId: 0, // Task 7977
    taskName: 'FUB - Onboarding People Worker',
    endpoint: '/test-task-7977',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Process FUB people onboarding',
  },
  {
    taskId: 0, // Task 8023
    taskName: 'reZEN - Process Transactions',
    endpoint: '/test-task-8023',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Process staged reZEN transactions',
  },
  {
    taskId: 0, // Task 8024
    taskName: 'reZEN - Process Listings',
    endpoint: '/test-task-8024',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Process staged reZEN listings',
  },
  {
    taskId: 0, // Task 8025
    taskName: 'reZEN - Process Network',
    endpoint: '/test-task-8025',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Process network downline data',
  },
  {
    taskId: 0, // Task 8026
    taskName: 'reZEN - Process Contributions',
    endpoint: '/test-task-8026',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Process contribution records',
  },
  {
    taskId: 0, // Task 8027
    taskName: 'reZEN - Process RevShare',
    endpoint: '/test-task-8027',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Process revshare totals',
  },
  {
    taskId: 0, // Task 8028
    taskName: 'reZEN - Process Sponsor Tree',
    endpoint: '/test-task-8028',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Build sponsor tree hierarchy',
  },
  {
    taskId: 0, // Task 8029
    taskName: 'reZEN - Network Frontline',
    endpoint: '/test-task-8029',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Process network frontline data',
  },
  {
    taskId: 0, // Task 8030
    taskName: 'reZEN - Network Cap Data',
    endpoint: '/test-task-8030',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description: 'Process network cap data',
  },
  {
    taskId: 0,
    taskName: 'SkySlope - Account Users Sync',
    endpoint: '/test-skyslope-account-users-sync',
    apiGroup: 'TASKS',
    method: 'POST',
    requiresUserId: false,
    description:
      'Sync SkySlope account users - FIXED Jan 2026: endpoint had empty stack returning null, now calls function 7966',
  },

  // ============================================================================
  // WORKERS GROUP (api:4UsTtl3m) - Individual processors
  // ============================================================================
  {
    taskId: 0,
    taskName: 'reZEN - Transactions Sync',
    endpoint: '/test-function-8052-txn-sync',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Sync transactions for a specific user from reZEN API',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Listings Sync',
    endpoint: '/test-function-8053-listings-sync',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Sync listings for a user',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Listings Update',
    endpoint: '/test-function-8054-listings-update',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Update existing listings',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Equity Sync',
    endpoint: '/test-function-8055-equity',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Sync equity/stock award data',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Contributions',
    endpoint: '/test-function-8056-contributions',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Process contributions for a user',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Stage Contributions',
    endpoint: '/test-function-8057-stage-contributions',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Stage contributions for processing',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Network Cap',
    endpoint: '/test-function-8058-network-cap',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Process network cap data',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Network Frontline',
    endpoint: '/test-function-8059-network-frontline',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Process network frontline',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Load Contributions',
    endpoint: '/test-function-8060-load-contributions',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Load contribution records',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Contributors',
    endpoint: '/test-function-8061-contributors',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Process contributor records',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Network Downline',
    endpoint: '/test-function-8062-network-downline',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Sync network downline for a user',
  },
  {
    taskId: 0,
    taskName: 'FUB - Calls Sync',
    endpoint: '/test-function-8065-fub-calls',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Sync FUB calls for a user',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Team Roster',
    endpoint: '/test-rezen-team-roster-sync',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description:
      'Sync team roster data (calls function #8032) - FIXED Jan 2026: headers now use |push pattern',
  },
  {
    taskId: 0,
    taskName: 'FUB - Onboarding Appointments',
    endpoint: '/test-function-8067-onboarding-appointments',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Process FUB appointments',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Cap Data',
    endpoint: '/test-function-8068-cap-data',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Process cap/commission data',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Equity Onboarding',
    endpoint: '/test-function-8069-equity-ob',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Onboarding equity processing',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Sponsor Tree',
    endpoint: '/test-function-8070-sponsor-tree',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Build sponsor tree for user',
  },
  {
    taskId: 0,
    taskName: 'reZEN - RevShare Totals',
    endpoint: '/test-function-8071-revshare-totals',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Calculate revshare totals',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Pending Contributions',
    endpoint: '/test-function-8072-pending-contributions',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Process pending contributions',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Contributions Full',
    endpoint: '/test-function-8073-contributions',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Full contributions processing',
  },
  // REMOVED: /test-function-8074-sync-nw-downline - endpoint does not exist in Xano
  // Function 8074 (Workers/Syncing - Network Downline) needs test endpoint created
  // Use function 8062 (reZEN - Onboarding Process Network Downline) instead for network sync
  {
    taskId: 0,
    taskName: 'FUB - Lambda Coordinator',
    endpoint: '/test-function-8118-lambda-coordinator',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    userIdParamName: 'ad_user_id', // Uses ad_user_id, NOT user_id
    additionalParams: { endpoint_type: 'people' }, // Required: people|events|calls|appointments|deals|textMessages
    description:
      'FUB lambda job coordinator - FIXED Jan 2026: uses ad_user_id param (not user_id), requires endpoint_type',
  },
  {
    taskId: 0,
    taskName: 'FUB - Get Deals',
    endpoint: '/test-function-10022-get-deals',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Get FUB deals for user',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Agent Data',
    endpoint: '/test-function-8051-agent-data',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Get agent profile data',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Create Onboarding Job',
    endpoint: '/trigger-rezen-create-onboarding-job',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description:
      'Create onboarding job for a user (status=New). Required before onboarding can run. Function #8299.',
  },
  {
    taskId: 0,
    taskName: 'Admin - Trigger Onboarding',
    endpoint: '/admin/trigger-onboarding',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: false,
    description: 'Polls for New onboarding jobs and processes them. Does NOT create jobs.',
  },
  {
    taskId: 0,
    taskName: 'reZEN - Onboarding Orchestrator',
    endpoint: '/trigger-rezen-onboarding-orchestrator',
    apiGroup: 'WORKERS',
    method: 'POST',
    requiresUserId: true,
    description: 'Main onboarding orchestrator - runs all 9 steps. Function #8297.',
  },

  // ============================================================================
  // SYSTEM GROUP (api:LIdBL1AN) - Status and Admin
  // ============================================================================
  {
    taskId: 0,
    taskName: 'Table Counts',
    endpoint: '/table-counts',
    apiGroup: 'SYSTEM',
    method: 'GET',
    requiresUserId: false,
    description: 'Get counts for core tables',
  },
  {
    taskId: 0,
    taskName: 'Staging Status',
    endpoint: '/staging-status',
    apiGroup: 'SYSTEM',
    method: 'GET',
    requiresUserId: true,
    description: 'Check staging table status for a user',
  },
  {
    taskId: 0,
    taskName: 'Onboarding Status',
    endpoint: '/onboarding-status',
    apiGroup: 'SYSTEM',
    method: 'GET',
    requiresUserId: true,
    description: 'Check onboarding job status for a user',
  },
  {
    taskId: 0,
    taskName: 'Staging Unprocessed',
    endpoint: '/staging-unprocessed',
    apiGroup: 'SYSTEM',
    method: 'GET',
    requiresUserId: true, // Fixed: needs user_id query param
    description: 'Get unprocessed staging records',
  },
  {
    taskId: 0,
    taskName: 'Reset Transaction Errors',
    endpoint: '/reset-transaction-errors',
    apiGroup: 'SYSTEM',
    method: 'POST',
    requiresUserId: true,
    description: 'Reset transaction error flags',
  },
  {
    taskId: 0,
    taskName: 'Trigger Sponsor Tree',
    endpoint: '/trigger-sponsor-tree',
    apiGroup: 'SYSTEM',
    method: 'POST',
    requiresUserId: true,
    description: 'Trigger sponsor tree rebuild',
  },
  {
    taskId: 0,
    taskName: 'Backfill All Updated At',
    endpoint: '/backfill-all-updated-at',
    apiGroup: 'SYSTEM',
    method: 'POST',
    requiresUserId: false,
    description: 'Backfill updated_at timestamps',
  },

  // ============================================================================
  // SEEDING GROUP (api:2kCRUYxG) - Test Data
  // ============================================================================
  {
    taskId: 18033,
    taskName: 'Clear User Data',
    endpoint: '/clear-user-data',
    apiGroup: 'SEEDING',
    method: 'POST',
    requiresUserId: true,
    additionalParams: { confirm: true },
    description:
      'Clear all V2 data for a user (for fresh onboarding). Requires confirm:true. Preserves user and agent records. Clears: FUB data (people, calls, events, appointments, deals), job records, transactions, listings, contributions, network data. Returns deletion counts per table.',
  },
  {
    taskId: 0,
    taskName: 'Seed Demo Dataset',
    endpoint: '/seed/demo-dataset',
    apiGroup: 'SEEDING',
    method: 'POST',
    requiresUserId: false,
    description: 'Seed demo data for testing',
  },
  {
    taskId: 0,
    taskName: 'Seed User Count',
    endpoint: '/seed/user/count',
    apiGroup: 'SEEDING',
    method: 'GET',
    requiresUserId: false,
    description: 'Get seeded user counts',
  },
  {
    taskId: 0,
    taskName: 'Seed Agent Count',
    endpoint: '/seed/agent/count',
    apiGroup: 'SEEDING',
    method: 'GET',
    requiresUserId: false,
    description: 'Get seeded agent counts',
  },
  {
    taskId: 0,
    taskName: 'Seed Transaction Count',
    endpoint: '/seed/transaction/count',
    apiGroup: 'SEEDING',
    method: 'GET',
    requiresUserId: false,
    description: 'Get seeded transaction counts',
  },
  {
    taskId: 0,
    taskName: 'Seed Team Count',
    endpoint: '/seed/team/count',
    apiGroup: 'SEEDING',
    method: 'GET',
    requiresUserId: false,
    description: 'Get seeded team counts',
  },
  {
    taskId: 0,
    taskName: 'Seed Network Count',
    endpoint: '/seed/network/count',
    apiGroup: 'SEEDING',
    method: 'GET',
    requiresUserId: false,
    description: 'Get seeded network counts',
  },
  {
    taskId: 0,
    taskName: 'Seed Listing Count',
    endpoint: '/seed/listing/count',
    apiGroup: 'SEEDING',
    method: 'GET',
    requiresUserId: false,
    description: 'Get seeded listing counts',
  },
  {
    taskId: 0,
    taskName: 'Clear All',
    endpoint: '/clear/all',
    apiGroup: 'SEEDING',
    method: 'POST',
    requiresUserId: false,
    description: 'Clear all seeded data (DANGEROUS)',
  },

  // ============================================================================
  // AUTH GROUP (api:i6a062_x) - Authentication endpoints
  // CRITICAL: These endpoints must return _fub_users_account for FUB data to work
  // ============================================================================
  {
    taskId: 0,
    taskName: 'Auth - Login',
    endpoint: '/auth/login',
    apiGroup: 'AUTH',
    method: 'POST',
    requiresUserId: false,
    requiresAuth: false,
    additionalParams: { email: 'string', password: 'string' },
    description:
      'Login and get auth token. Returns user object with _fub_users_account addon for FUB data access.',
  },
  {
    taskId: 12687,
    taskName: 'Auth - Me',
    endpoint: '/auth/me',
    apiGroup: 'AUTH',
    method: 'GET',
    requiresUserId: false,
    requiresAuth: true,
    description:
      'Get current authenticated user. CRITICAL: Must include _fub_users_account in response for FUB data to work in frontend.',
  },
  {
    taskId: 0,
    taskName: 'Auth - Logout',
    endpoint: '/auth/logout',
    apiGroup: 'AUTH',
    method: 'POST',
    requiresUserId: false,
    requiresAuth: true,
    description: 'Logout and invalidate auth token.',
  },
  {
    taskId: 0,
    taskName: 'Auth - Refresh Token',
    endpoint: '/auth/refresh',
    apiGroup: 'AUTH',
    method: 'POST',
    requiresUserId: false,
    requiresAuth: true,
    description: 'Refresh authentication token.',
  },
]

// Get endpoints by API group
export function getEndpointsByGroup(group: keyof typeof MCP_BASES): MCPEndpoint[] {
  return MCP_ENDPOINTS.filter((e) => e.apiGroup === group)
}

// Get endpoints that need user_id
export function getEndpointsNeedingUserId(): MCPEndpoint[] {
  return MCP_ENDPOINTS.filter((e) => e.requiresUserId)
}

// Get endpoints that don't need user_id (can run standalone)
export function getStandaloneEndpoints(): MCPEndpoint[] {
  return MCP_ENDPOINTS.filter((e) => !e.requiresUserId)
}
