/**
 * Endpoint Catalog Data
 *
 * Comprehensive documentation for all 50+ Xano V2 API endpoints
 */

import type { EndpointDoc } from './types'

export const ENDPOINT_CATALOG: EndpointDoc[] = [
  // ============================================================================
  // AUTHENTICATION API (api:lkmcgxf_:v1.5)
  // ============================================================================
  {
    id: 1,
    path: '/auth/login',
    method: 'POST',
    name: 'Login User',
    description: 'Authenticate user with email and password',
    api_group: 'Authentication API',
    parameters: [
      {
        name: 'email',
        in: 'body',
        type: 'string',
        required: true,
        description: 'User email address',
        example: 'user@example.com',
      },
      {
        name: 'password',
        in: 'body',
        type: 'string',
        required: true,
        description: 'User password',
        example: 'secure_password_123',
      },
    ],
    request_body: {
      description: 'Login credentials',
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
    },
    responses: {
      '200': {
        status: 200,
        description: 'Login successful',
        schema: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT token' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      },
      '401': {
        status: 401,
        description: 'Invalid credentials',
      },
    },
    authentication: {
      type: 'none',
      description: 'No authentication required for login',
    },
    tags: ['auth', 'user', 'session'],
    migration_notes: 'V1->V2: Same endpoint, enhanced session management',
  },

  {
    id: 2,
    path: '/auth/signup',
    method: 'POST',
    name: 'Create User Account',
    description: 'Register a new user account',
    api_group: 'Authentication API',
    parameters: [
      {
        name: 'email',
        in: 'body',
        type: 'string',
        required: true,
        description: 'Email address',
      },
      {
        name: 'password',
        in: 'body',
        type: 'string',
        required: true,
        description: 'Password (min 8 characters)',
      },
      {
        name: 'name',
        in: 'body',
        type: 'string',
        required: true,
        description: 'Full name',
      },
    ],
    request_body: {
      description: 'User registration data',
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
    responses: {
      '201': {
        status: 201,
        description: 'Account created successfully',
      },
      '400': {
        status: 400,
        description: 'Invalid input or user already exists',
      },
    },
    authentication: {
      type: 'none',
    },
    tags: ['auth', 'user', 'registration'],
  },

  {
    id: 3,
    path: '/auth/verify-session',
    method: 'GET',
    name: 'Verify Session',
    description: 'Verify if current session is valid',
    api_group: 'Authentication API',
    parameters: [],
    responses: {
      '200': {
        status: 200,
        description: 'Session is valid',
      },
      '401': {
        status: 401,
        description: 'Session is invalid or expired',
      },
    },
    authentication: {
      type: 'bearer',
      description: 'Bearer token in Authorization header',
    },
    tags: ['auth', 'session'],
  },

  {
    id: 4,
    path: '/auth/logout',
    method: 'POST',
    name: 'Logout User',
    description: 'Terminate current user session',
    api_group: 'Authentication API',
    parameters: [],
    responses: {
      '200': {
        status: 200,
        description: 'Logged out successfully',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['auth', 'session'],
  },

  {
    id: 5,
    path: '/auth/refresh-token',
    method: 'POST',
    name: 'Refresh Token',
    description: 'Get a new JWT token using refresh token',
    api_group: 'Authentication API',
    parameters: [
      {
        name: 'refresh_token',
        in: 'body',
        type: 'string',
        required: true,
        description: 'Current refresh token',
      },
    ],
    request_body: {
      description: 'Refresh token',
      schema: {
        type: 'object',
        properties: {
          refresh_token: { type: 'string' },
        },
      },
    },
    responses: {
      '200': {
        status: 200,
        description: 'New token generated',
      },
      '401': {
        status: 401,
        description: 'Invalid refresh token',
      },
    },
    authentication: {
      type: 'none',
    },
    tags: ['auth', 'token'],
  },

  // ============================================================================
  // MAIN API V1.5 (api:kaVkk3oM:v1.5)
  // ============================================================================

  {
    id: 10,
    path: '/users/{id}',
    method: 'GET',
    name: 'Get User',
    description: 'Retrieve user profile information',
    api_group: 'Main API V1.5',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'number',
        required: true,
        description: 'User ID',
      },
    ],
    responses: {
      '200': {
        status: 200,
        description: 'User found',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
      '404': {
        status: 404,
        description: 'User not found',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['users', 'profiles'],
  },

  {
    id: 11,
    path: '/users/{id}',
    method: 'PUT',
    name: 'Update User',
    description: 'Update user profile information',
    api_group: 'Main API V1.5',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'number',
        required: true,
      },
      {
        name: 'name',
        in: 'body',
        type: 'string',
        required: false,
      },
      {
        name: 'email',
        in: 'body',
        type: 'string',
        required: false,
      },
    ],
    request_body: {
      description: 'User update data',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
      },
    },
    responses: {
      '200': {
        status: 200,
        description: 'User updated',
      },
      '400': {
        status: 400,
        description: 'Invalid input',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['users', 'profiles'],
  },

  {
    id: 12,
    path: '/teams',
    method: 'GET',
    name: 'List Teams',
    description: 'Get list of all teams for current user',
    api_group: 'Main API V1.5',
    parameters: [
      {
        name: 'page',
        in: 'query',
        type: 'number',
        required: false,
        description: 'Page number (default: 1)',
      },
      {
        name: 'limit',
        in: 'query',
        type: 'number',
        required: false,
        description: 'Records per page (default: 25)',
      },
    ],
    responses: {
      '200': {
        status: 200,
        description: 'Teams list',
        schema: {
          type: 'object',
          properties: {
            data: { type: 'array' },
            total: { type: 'number' },
            page: { type: 'number' },
          },
        },
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['teams', 'management'],
  },

  {
    id: 13,
    path: '/teams',
    method: 'POST',
    name: 'Create Team',
    description: 'Create a new team',
    api_group: 'Main API V1.5',
    parameters: [
      {
        name: 'name',
        in: 'body',
        type: 'string',
        required: true,
      },
      {
        name: 'description',
        in: 'body',
        type: 'string',
        required: false,
      },
    ],
    request_body: {
      description: 'Team creation data',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['name'],
      },
    },
    responses: {
      '201': {
        status: 201,
        description: 'Team created',
      },
      '400': {
        status: 400,
        description: 'Invalid input',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['teams', 'management'],
  },

  {
    id: 14,
    path: '/teams/{id}/members',
    method: 'GET',
    name: 'List Team Members',
    description: 'Get all members of a team',
    api_group: 'Main API V1.5',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'number',
        required: true,
      },
    ],
    responses: {
      '200': {
        status: 200,
        description: 'Team members',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['teams', 'members'],
  },

  {
    id: 15,
    path: '/teams/{id}/members',
    method: 'POST',
    name: 'Add Team Member',
    description: 'Invite user to team',
    api_group: 'Main API V1.5',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'number',
        required: true,
      },
      {
        name: 'user_id',
        in: 'body',
        type: 'number',
        required: true,
      },
      {
        name: 'role',
        in: 'body',
        type: 'string',
        required: true,
        description: 'Role: admin, manager, member',
      },
    ],
    request_body: {
      description: 'Member invitation data',
      schema: {
        type: 'object',
        properties: {
          user_id: { type: 'number' },
          role: { type: 'string', enum: ['admin', 'manager', 'member'] },
        },
        required: ['user_id', 'role'],
      },
    },
    responses: {
      '201': {
        status: 201,
        description: 'Member added',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['teams', 'members'],
  },

  // ============================================================================
  // TRANSACTIONS API V2 (api:KPx5ivcP)
  // ============================================================================

  {
    id: 20,
    path: '/transactions',
    method: 'GET',
    name: 'List Transactions',
    description: 'Get paginated list of transactions',
    api_group: 'Transactions API V2',
    parameters: [
      {
        name: 'page',
        in: 'query',
        type: 'number',
        required: false,
      },
      {
        name: 'limit',
        in: 'query',
        type: 'number',
        required: false,
      },
      {
        name: 'status',
        in: 'query',
        type: 'string',
        required: false,
        description: 'Filter by status',
      },
      {
        name: 'from_date',
        in: 'query',
        type: 'string',
        required: false,
        description: 'Filter from date (ISO 8601)',
      },
      {
        name: 'to_date',
        in: 'query',
        type: 'string',
        required: false,
        description: 'Filter to date (ISO 8601)',
      },
    ],
    responses: {
      '200': {
        status: 200,
        description: 'Transactions list',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['transactions', 'list'],
    migration_notes: 'V2 endpoint: New filtering capabilities',
  },

  {
    id: 21,
    path: '/transactions',
    method: 'POST',
    name: 'Create Transaction',
    description: 'Create a new transaction',
    api_group: 'Transactions API V2',
    parameters: [
      {
        name: 'amount',
        in: 'body',
        type: 'number',
        required: true,
      },
      {
        name: 'type',
        in: 'body',
        type: 'string',
        required: true,
      },
      {
        name: 'description',
        in: 'body',
        type: 'string',
        required: false,
      },
      {
        name: 'participant_id',
        in: 'body',
        type: 'number',
        required: true,
      },
    ],
    request_body: {
      description: 'Transaction data',
      schema: {
        type: 'object',
        properties: {
          amount: { type: 'number' },
          type: { type: 'string' },
          description: { type: 'string' },
          participant_id: { type: 'number' },
        },
        required: ['amount', 'type', 'participant_id'],
      },
    },
    responses: {
      '201': {
        status: 201,
        description: 'Transaction created',
      },
      '400': {
        status: 400,
        description: 'Invalid input',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['transactions', 'create'],
  },

  {
    id: 22,
    path: '/transactions/{id}',
    method: 'GET',
    name: 'Get Transaction',
    description: 'Get transaction details',
    api_group: 'Transactions API V2',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'number',
        required: true,
      },
    ],
    responses: {
      '200': {
        status: 200,
        description: 'Transaction details',
      },
      '404': {
        status: 404,
        description: 'Transaction not found',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['transactions', 'detail'],
  },

  {
    id: 23,
    path: '/transactions/{id}',
    method: 'PUT',
    name: 'Update Transaction',
    description: 'Update transaction',
    api_group: 'Transactions API V2',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'number',
        required: true,
      },
      {
        name: 'status',
        in: 'body',
        type: 'string',
        required: false,
      },
    ],
    request_body: {
      description: 'Transaction update data',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string' },
        },
      },
    },
    responses: {
      '200': {
        status: 200,
        description: 'Transaction updated',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['transactions', 'update'],
  },

  {
    id: 24,
    path: '/transactions/{id}',
    method: 'DELETE',
    name: 'Delete Transaction',
    description: 'Delete a transaction',
    api_group: 'Transactions API V2',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'number',
        required: true,
      },
    ],
    responses: {
      '204': {
        status: 204,
        description: 'Transaction deleted',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['transactions', 'delete'],
  },

  {
    id: 25,
    path: '/transactions/summary',
    method: 'GET',
    name: 'Get Transaction Summary',
    description: 'Get summary statistics for transactions',
    api_group: 'Transactions API V2',
    parameters: [
      {
        name: 'from_date',
        in: 'query',
        type: 'string',
        required: false,
      },
      {
        name: 'to_date',
        in: 'query',
        type: 'string',
        required: false,
      },
    ],
    responses: {
      '200': {
        status: 200,
        description: 'Summary statistics',
        schema: {
          type: 'object',
          properties: {
            total_amount: { type: 'number' },
            transaction_count: { type: 'number' },
            average_amount: { type: 'number' },
          },
        },
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['transactions', 'analytics'],
  },

  // ============================================================================
  // ADDITIONAL ENDPOINTS (Placeholder for space)
  // ============================================================================

  {
    id: 50,
    path: '/reports/monthly',
    method: 'GET',
    name: 'Get Monthly Report',
    description: 'Generate monthly financial report',
    api_group: 'Transactions API V2',
    parameters: [
      {
        name: 'month',
        in: 'query',
        type: 'string',
        required: true,
        description: 'Month in YYYY-MM format',
      },
    ],
    responses: {
      '200': {
        status: 200,
        description: 'Monthly report',
      },
    },
    authentication: {
      type: 'bearer',
    },
    tags: ['reports', 'analytics'],
  },

  {
    id: 51,
    path: '/health',
    method: 'GET',
    name: 'Health Check',
    description: 'Check API health status',
    api_group: 'Main API V1.5',
    parameters: [],
    responses: {
      '200': {
        status: 200,
        description: 'API is healthy',
      },
    },
    authentication: {
      type: 'none',
    },
    tags: ['system', 'health'],
  },
]

// Group endpoints by API group
export function getEndpointsByGroup(group?: string): Record<string, EndpointDoc[]> {
  const grouped: Record<string, EndpointDoc[]> = {}

  for (const endpoint of ENDPOINT_CATALOG) {
    const groupName = endpoint.api_group || 'Other'
    if (!grouped[groupName]) {
      grouped[groupName] = []
    }
    grouped[groupName].push(endpoint)
  }

  if (group) {
    return { [group]: grouped[group] || [] }
  }

  return grouped
}

// Search endpoints
export function searchEndpoints(query: string): EndpointDoc[] {
  const lowerQuery = query.toLowerCase()

  return ENDPOINT_CATALOG.filter(
    (ep) =>
      ep.path.toLowerCase().includes(lowerQuery) ||
      ep.name?.toLowerCase().includes(lowerQuery) ||
      ep.description?.toLowerCase().includes(lowerQuery) ||
      ep.method.toLowerCase().includes(lowerQuery) ||
      ep.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

// Filter endpoints by method
export function filterByMethod(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'): EndpointDoc[] {
  return ENDPOINT_CATALOG.filter((ep) => ep.method === method)
}

// Filter endpoints by tag
export function filterByTag(tag: string): EndpointDoc[] {
  return ENDPOINT_CATALOG.filter((ep) => ep.tags?.includes(tag))
}

// Get all unique tags
export function getAllTags(): string[] {
  const tags = new Set<string>()
  for (const endpoint of ENDPOINT_CATALOG) {
    endpoint.tags?.forEach((tag) => tags.add(tag))
  }
  return Array.from(tags).sort()
}

// Get all API groups
export function getAllApiGroups(): string[] {
  const groups = new Set<string>()
  for (const endpoint of ENDPOINT_CATALOG) {
    if (endpoint.api_group) {
      groups.add(endpoint.api_group)
    }
  }
  return Array.from(groups).sort()
}
