/**
 * System Architecture Diagrams
 *
 * Mermaid diagram definitions for Xano V2 system architecture,
 * including API groups, data flows, and integration points.
 */

import type { SystemArchitecture, DataFlow, APIGroupDoc, SystemComponent } from './types'

// ============================================================================
// MERMAID DIAGRAM GENERATORS
// ============================================================================

export function generateSystemArchitectureDiagram(): string {
  return `
graph TB
    subgraph frontend["Frontend Layer"]
        web["Next.js Admin UI"]
        client["Xano MCP Client"]
    end

    subgraph api["API Layer"]
        auth["Auth API"]
        main["Main API V1.5"]
        transactions["Transactions API V2"]
        additional["Additional Groups"]
    end

    subgraph backend["Backend Services"]
        functions["XanoScript Functions"]
        tasks["Background Jobs"]
        hooks["Webhooks & Triggers"]
    end

    subgraph data["Data Layer"]
        tables["193 Tables"]
        cache["Cache Layer"]
    end

    subgraph external["External Services"]
        stripe["Stripe Payments"]
        calendar["Google Calendar"]
        storage["Cloud Storage"]
    end

    web -->|API Calls| client
    client -->|Metadata| auth
    client -->|Core Data| main
    client -->|Transactions| transactions
    client -->|Admin Functions| additional

    auth -->|Authentication| functions
    main -->|Query/Mutate| functions
    transactions -->|Process| functions

    functions -->|Execute| tasks
    functions -->|Trigger| hooks

    tasks -->|Read/Write| tables
    hooks -->|Read/Write| tables

    tables -->|Cache| cache

    functions -->|API Calls| stripe
    functions -->|API Calls| calendar
    functions -->|API Calls| storage

    style web fill:#4A9EFF,stroke:#333,stroke-width:2px,color:#fff
    style client fill:#4A9EFF,stroke:#333,stroke-width:2px,color:#fff
    style auth fill:#50C878,stroke:#333,stroke-width:2px,color:#fff
    style main fill:#50C878,stroke:#333,stroke-width:2px,color:#fff
    style transactions fill:#50C878,stroke:#333,stroke-width:2px,color:#fff
    style additional fill:#50C878,stroke:#333,stroke-width:2px,color:#fff
    style functions fill:#FFB84D,stroke:#333,stroke-width:2px,color:#fff
    style tasks fill:#FFB84D,stroke:#333,stroke-width:2px,color:#fff
    style hooks fill:#FFB84D,stroke:#333,stroke-width:2px,color:#fff
    style tables fill:#FF6B9D,stroke:#333,stroke-width:2px,color:#fff
    style cache fill:#FF6B9D,stroke:#333,stroke-width:2px,color:#fff
    style stripe fill:#6C63FF,stroke:#333,stroke-width:2px,color:#fff
    style calendar fill:#6C63FF,stroke:#333,stroke-width:2px,color:#fff
    style storage fill:#6C63FF,stroke:#333,stroke-width:2px,color:#fff
`.trim()
}

export function generateUserLoginDataFlow(): string {
  return `
sequenceDiagram
    participant User
    participant NextJS as Next.js Frontend
    participant Auth as Auth API
    participant Session as Session Management
    participant DB as Database

    User->>NextJS: 1. Enter credentials
    NextJS->>Auth: 2. POST /login
    Auth->>Session: 3. Validate credentials
    Session->>DB: 4. Query user table
    DB-->>Session: 5. User record
    Session->>DB: 6. Create session
    DB-->>Session: 7. Session created
    Session-->>Auth: 8. Return token + user
    Auth-->>NextJS: 9. Return JWT
    NextJS-->>User: 10. Login successful

    Note over NextJS: Token stored in localStorage
    Note over NextJS: Used for all subsequent API calls
`.trim()
}

export function generateTransactionCreationFlow(): string {
  return `
sequenceDiagram
    participant UI as Admin UI
    participant API as Transactions API
    participant ValidateFn as Validate Transaction
    participant CreateFn as Create & Enrich
    participant DB as Database
    participant WebHook as Webhooks

    UI->>API: 1. POST /transactions
    API->>ValidateFn: 2. Validate input
    ValidateFn->>DB: 3. Check references
    DB-->>ValidateFn: 4. Validation passes
    ValidateFn-->>API: 5. OK
    API->>CreateFn: 6. Create transaction
    CreateFn->>DB: 7. INSERT transaction
    DB-->>CreateFn: 8. Returns record
    CreateFn->>DB: 9. Enrich metadata
    CreateFn->>WebHook: 10. Trigger event
    CreateFn-->>API: 11. Success
    API-->>UI: 12. Return record

    Note over DB: Triggers cascade validation
    Note over WebHook: Notify external systems
`.trim()
}

export function generateDataSyncFlow(): string {
  return `
sequenceDiagram
    participant Scheduler
    participant SyncJob as Sync Job
    participant Source as External API
    participant Transform as Transform & Validate
    participant DB as Database
    participant Logging as Audit Log

    Scheduler->>SyncJob: 1. Start sync job
    SyncJob->>Source: 2. Fetch data
    Source-->>SyncJob: 3. Return data
    SyncJob->>Transform: 4. Transform records
    Transform->>DB: 5. Batch insert/update
    DB-->>Transform: 6. Rows affected
    Transform->>Logging: 7. Log sync event
    Logging->>DB: 8. Write to audit table
    Logging-->>Transform: 9. Logged
    Transform-->>SyncJob: 10. Sync complete

    Note over SyncJob: Runs on schedule, handles errors
    Note over Transform: Handles duplicates, validates data
    Note over Logging: Complete audit trail
`.trim()
}

export function generateTeamManagementFlow(): string {
  return `
graph LR
    subgraph user["User Actions"]
        A["Create Team"]
        B["Invite Member"]
        C["Assign Role"]
        D["Update Permissions"]
    end

    subgraph validation["Validation Layer"]
        V1["Check Auth"]
        V2["Validate Inputs"]
        V3["Check Permissions"]
    end

    subgraph operations["Database Operations"]
        OP1["Insert team"]
        OP2["Insert invitation"]
        OP3["Update role"]
        OP4["Update permissions"]
    end

    subgraph notifications["Notifications"]
        N1["Email notification"]
        N2["In-app alert"]
    end

    A -->|Flow 1| V1
    B -->|Flow 2| V1
    C -->|Flow 3| V1
    D -->|Flow 4| V1

    V1 --> V2
    V2 --> V3

    V3 -->|Valid| OP1
    V3 -->|Valid| OP2
    V3 -->|Valid| OP3
    V3 -->|Valid| OP4

    OP1 --> N1
    OP2 --> N1
    OP2 --> N2
    OP3 --> N2

    style A fill:#4A9EFF,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#4A9EFF,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#4A9EFF,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#4A9EFF,stroke:#333,stroke-width:2px,color:#fff
    style V1 fill:#FFB84D,stroke:#333,stroke-width:2px,color:#fff
    style V2 fill:#FFB84D,stroke:#333,stroke-width:2px,color:#fff
    style V3 fill:#FFB84D,stroke:#333,stroke-width:2px,color:#fff
    style OP1 fill:#50C878,stroke:#333,stroke-width:2px,color:#fff
    style OP2 fill:#50C878,stroke:#333,stroke-width:2px,color:#fff
    style OP3 fill:#50C878,stroke:#333,stroke-width:2px,color:#fff
    style OP4 fill:#50C878,stroke:#333,stroke-width:2px,color:#fff
    style N1 fill:#FF6B9D,stroke:#333,stroke-width:2px,color:#fff
    style N2 fill:#FF6B9D,stroke:#333,stroke-width:2px,color:#fff
`.trim()
}

// ============================================================================
// ARCHITECTURE DATA
// ============================================================================

export const XANO_API_GROUPS: APIGroupDoc[] = [
  {
    id: 1,
    name: 'Authentication API',
    path: 'api:lkmcgxf_:v1.5',
    description: 'User login, signup, session management, and authentication',
    endpoints_count: 8,
    authentication: 'Bearer Token',
    version: '1.5',
    components: [
      {
        id: 'auth-login',
        name: 'Login Endpoint',
        type: 'service',
        description: 'Authenticate user with credentials',
      },
      {
        id: 'auth-session',
        name: 'Session Manager',
        type: 'module',
        description: 'Manage user sessions and tokens',
      },
    ],
  },
  {
    id: 2,
    name: 'Main API V1.5',
    path: 'api:kaVkk3oM:v1.5',
    description: 'Core business logic, user data, team management, and primary operations',
    endpoints_count: 45,
    authentication: 'Bearer Token',
    version: '1.5',
    components: [
      {
        id: 'main-users',
        name: 'User Management',
        type: 'module',
        description: 'CRUD operations for users',
      },
      {
        id: 'main-teams',
        name: 'Team Management',
        type: 'module',
        description: 'Team creation, membership, and permissions',
      },
      {
        id: 'main-core',
        name: 'Core Services',
        type: 'module',
        description: 'Shared utilities and helpers',
      },
    ],
  },
  {
    id: 3,
    name: 'Transactions API V2',
    path: 'api:KPx5ivcP',
    description: 'Transaction processing, accounting, and financial operations',
    endpoints_count: 22,
    authentication: 'Bearer Token',
    version: '2.0',
    components: [
      {
        id: 'trans-create',
        name: 'Transaction Creation',
        type: 'module',
        description: 'Create and validate transactions',
      },
      {
        id: 'trans-process',
        name: 'Processing Pipeline',
        type: 'module',
        description: 'Process and settle transactions',
      },
      {
        id: 'trans-reporting',
        name: 'Reporting',
        type: 'module',
        description: 'Financial reports and analytics',
      },
    ],
  },
  {
    id: 4,
    name: 'Functions & Tasks',
    path: 'functions',
    description: 'Background jobs, scheduled tasks, and utility functions',
    endpoints_count: 120,
    authentication: 'Internal',
    version: '1.0',
    components: [
      {
        id: 'func-jobs',
        name: 'Background Jobs',
        type: 'module',
        description: '120+ XanoScript functions',
      },
      {
        id: 'func-scheduler',
        name: 'Task Scheduler',
        type: 'service',
        description: 'Scheduled execution engine',
      },
      {
        id: 'func-hooks',
        name: 'Webhooks',
        type: 'service',
        description: 'Event-driven functions',
      },
    ],
  },
]

export const SYSTEM_COMPONENTS: SystemComponent[] = [
  {
    id: 'frontend',
    name: 'Admin Frontend',
    type: 'module',
    description: 'Next.js application for system administration and documentation',
    version: 'Next.js 16',
    dependencies: ['Backend API', 'Xano MCP'],
  },
  {
    id: 'backend',
    name: 'Xano Backend',
    type: 'service',
    description: 'BaaS platform hosting all API groups and functions',
    version: 'Xano',
    dependencies: ['Database', 'External Services'],
  },
  {
    id: 'database',
    name: 'Database Layer',
    type: 'service',
    description: 'Relational database with 193 tables',
    version: 'PostgreSQL-compatible',
    dependencies: [],
  },
  {
    id: 'external',
    name: 'External Integrations',
    type: 'external',
    description: 'Stripe, Google Calendar, Cloud Storage, etc.',
    version: 'Various',
    dependencies: [],
  },
  {
    id: 'mcp',
    name: 'Model Context Protocol',
    type: 'library',
    description: 'Interface for AI agents to access Xano metadata',
    version: '1.0',
    dependencies: ['Backend API'],
  },
]

export const DATA_FLOWS = [
  {
    id: 'user-login',
    name: 'User Login Flow',
    description: 'How users authenticate and establish sessions',
    trigger: 'User submits credentials',
    nodes: [
      { id: 'user', label: 'User', type: 'user' },
      { id: 'frontend', label: 'Next.js UI', type: 'service' },
      { id: 'auth-api', label: 'Auth API', type: 'service' },
      { id: 'session', label: 'Session Mgmt', type: 'service' },
      { id: 'db', label: 'Database', type: 'database' },
    ],
    edges: [
      { from: 'user', to: 'frontend', label: 'Login request', direction: 'request' },
      { from: 'frontend', to: 'auth-api', label: 'POST /login', direction: 'request' },
      { from: 'auth-api', to: 'session', label: 'Validate', direction: 'request' },
      { from: 'session', to: 'db', label: 'Query user', direction: 'request' },
      { from: 'db', to: 'session', label: 'User record', direction: 'response' },
      { from: 'session', to: 'db', label: 'Create session', direction: 'request' },
      { from: 'db', to: 'session', label: 'Session token', direction: 'response' },
      { from: 'session', to: 'auth-api', label: 'Token', direction: 'response' },
      { from: 'auth-api', to: 'frontend', label: 'JWT', direction: 'response' },
      { from: 'frontend', to: 'user', label: 'Authenticated', direction: 'response' },
    ],
    steps: [
      'User submits email and password',
      'Frontend sends POST /login to Auth API',
      'Auth API calls Session Management function',
      'Session Management queries user table',
      'User credentials validated',
      'New session record created',
      'JWT token returned to frontend',
      'Token stored in localStorage',
      'User logged in and redirected',
    ],
  },
  {
    id: 'transaction-creation',
    name: 'Transaction Creation Flow',
    description: 'How transactions are created, validated, and enriched',
    trigger: 'Admin creates new transaction',
    nodes: [
      { id: 'ui', label: 'Admin UI', type: 'user' },
      { id: 'api', label: 'Transactions API', type: 'service' },
      { id: 'validate', label: 'Validation', type: 'service' },
      { id: 'create', label: 'Creation', type: 'service' },
      { id: 'db', label: 'Database', type: 'database' },
      { id: 'webhook', label: 'Webhooks', type: 'service' },
    ],
    edges: [
      { from: 'ui', to: 'api', label: 'Transaction data', direction: 'request' },
      { from: 'api', to: 'validate', label: 'Validate', direction: 'request' },
      { from: 'validate', to: 'db', label: 'Check refs', direction: 'request' },
      { from: 'db', to: 'validate', label: 'Valid', direction: 'response' },
      { from: 'validate', to: 'create', label: 'OK', direction: 'response' },
      { from: 'create', to: 'db', label: 'INSERT', direction: 'request' },
      { from: 'db', to: 'create', label: 'Record', direction: 'response' },
      { from: 'create', to: 'webhook', label: 'Trigger', direction: 'event' },
      { from: 'create', to: 'api', label: 'Success', direction: 'response' },
      { from: 'api', to: 'ui', label: 'New record', direction: 'response' },
    ],
    steps: [
      'Admin submits transaction form',
      'Frontend validates client-side',
      'POST to Transactions API',
      'Server-side validation executes',
      'Foreign key references checked',
      'Transaction record inserted',
      'Webhooks triggered for listeners',
      'Audit log created',
      'Response returned to UI',
    ],
  },
  {
    id: 'data-sync',
    name: 'Data Sync Flow',
    description: 'How external data syncs into the system',
    trigger: 'Scheduled sync job runs',
    nodes: [
      { id: 'scheduler', label: 'Scheduler', type: 'service' },
      { id: 'job', label: 'Sync Job', type: 'service' },
      { id: 'source', label: 'External API', type: 'external' },
      { id: 'transform', label: 'Transform', type: 'service' },
      { id: 'db', label: 'Database', type: 'database' },
      { id: 'log', label: 'Audit Log', type: 'database' },
    ],
    edges: [
      { from: 'scheduler', to: 'job', label: 'Start', direction: 'event' },
      { from: 'job', to: 'source', label: 'Fetch', direction: 'request' },
      { from: 'source', to: 'job', label: 'Data', direction: 'response' },
      { from: 'job', to: 'transform', label: 'Transform', direction: 'request' },
      { from: 'transform', to: 'db', label: 'Batch upsert', direction: 'request' },
      { from: 'db', to: 'transform', label: 'Affected rows', direction: 'response' },
      { from: 'transform', to: 'log', label: 'Sync event', direction: 'request' },
      { from: 'log', to: 'transform', label: 'Logged', direction: 'response' },
    ],
    steps: [
      'Scheduler triggers sync job at interval',
      'Job connects to external API',
      'Data retrieved and parsed',
      'Records transformed to local format',
      'Duplicates detected and handled',
      'Batch upsert to database',
      'Sync event logged for audit trail',
      'Success/error notification sent',
    ],
  },
]

// ============================================================================
// TECHNOLOGY STACK
// ============================================================================

export const TECHNOLOGY_STACK = {
  frontend: {
    title: 'Frontend',
    technologies: [
      { name: 'Next.js', version: '16', description: 'React framework' },
      { name: 'React', version: '19', description: 'UI library' },
      { name: 'TypeScript', version: '5.x', description: 'Type safety' },
      { name: 'Tailwind CSS', version: '4', description: 'Styling' },
      { name: 'ShadCN UI', version: 'Latest', description: 'Component library' },
    ],
  },
  backend: {
    title: 'Backend',
    technologies: [
      { name: 'Xano', version: 'Latest', description: 'BaaS platform' },
      { name: 'XanoScript', version: '1.0', description: 'Backend logic' },
      { name: 'PostgreSQL', version: '13+', description: 'Database' },
      { name: 'Node.js', version: '18+', description: 'Runtime' },
    ],
  },
  external: {
    title: 'External Services',
    technologies: [
      { name: 'Stripe', version: 'Latest', description: 'Payments' },
      { name: 'Google Calendar API', version: 'v3', description: 'Calendar integration' },
      { name: 'Cloud Storage', version: 'Latest', description: 'File storage' },
    ],
  },
  tools: {
    title: 'Tools & Protocols',
    technologies: [
      { name: 'MCP', version: '1.0', description: 'Model Context Protocol' },
      { name: 'REST', version: '1.0', description: 'API architecture' },
      { name: 'JSON', version: 'Latest', description: 'Data format' },
      { name: 'Webhooks', version: '1.0', description: 'Event delivery' },
    ],
  },
}
