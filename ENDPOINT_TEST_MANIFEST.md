# Endpoint Testing Manifest - xano-v2-admin

**Project:** V1 to V2 Migration Admin Interface
**Generated:** January 21, 2026
**Total Functions:** 22 exported functions
**Base URLs:**
- V2 Workspace: `https://x2nu-xcjc-vhax.agentdashboards.xano.io`
- Introspection API: `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O`

---

## API Groups (V2 Workspace)

| Group | Canonical ID | Endpoints | Purpose |
|-------|-------------|-----------|---------|
| TASKS | `api:4psV7fp6` | 100+ | Run background tasks |
| WORKERS | `api:4UsTtl3m` | 100+ | Run worker functions |
| SYSTEM | `api:LIdBL1AN` | 37 | System status endpoints |
| SEEDING | `api:2kCRUYxG` | 23 | Data seeding/clearing |
| Introspection | `api:g79A_W7O` | 6 | V1/V2 comparison |

---

## Testing Strategy

Following frontend-endpoint-testing skill pattern:

1. **Test ALL 22 functions** - No exceptions
2. **Match frontend exactly** - curl sends EXACTLY what frontend sends
3. **FIX IN XANO** - When test fails, fix the XANO BACKEND
4. **USE FP PATTERNS** - All Xano fixes use functional programming
5. **NO FRONTEND TRANSFORMATIONS** - Backend returns correct format

---

## Functions to Test

### Group 1: Core API Client Functions (2 functions)

#### 1. `runTaskEndpoint()`
- **File:** `lib/api-v2.ts:25`
- **Signature:** `runTaskEndpoint<T>(apiGroup, endpoint, method?, params?, timeoutMs?): Promise<TaskResult<T>>`
- **Purpose:** Generic task runner with timeout handling
- **Test:**
  ```bash
  # Test with SYSTEM health check
  curl -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/health" \
    -H "Content-Type: application/json"
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "data": { "status": "ok" },
    "startTime": 1705858800000,
    "endTime": 1705858801000,
    "duration": 1000
  }
  ```
- **Used By:** All UI components that trigger tasks

#### 2. `getStatus()`
- **File:** `lib/api-v2.ts:93`
- **Signature:** `getStatus<T>(apiGroup, endpoint): Promise<T | null>`
- **Purpose:** Quick helper for GET requests
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/health"
  ```
- **Expected Response:** `{ "status": "ok" }` or `null`
- **Used By:** Status polling components

---

### Group 2: Task Management Functions (2 functions)

#### 3. `runBackgroundTask()`
- **File:** `lib/api-v2.ts:134`
- **Signature:** `runBackgroundTask(taskId: number): Promise<TaskResult>`
- **Purpose:** Run a background task by ID
- **Endpoint:** `POST /api:4psV7fp6/run-task/{taskId}`
- **Test:**
  ```bash
  # Test with task ID 5064 (Update 30-Day Team Transaction Count)
  curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6/run-task/5064" \
    -H "Content-Type: application/json"
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "data": { "message": "Task completed", "records_processed": 280 },
    "duration": 5000
  }
  ```
- **Used By:** Task trigger UI components

#### 4. `runWorker()`
- **File:** `lib/api-v2.ts:144`
- **Signature:** `runWorker(functionId: number): Promise<TaskResult>`
- **Purpose:** Run a worker function by ID
- **Endpoint:** `POST /api:4UsTtl3m/run-worker/{functionId}`
- **Test:**
  ```bash
  # Test with function ID 11001 (Workers/process_fub_people)
  curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/run-worker/11001" \
    -H "Content-Type: application/json"
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "data": { "processed": 100, "skipped": 5 },
    "duration": 3000
  }
  ```
- **Used By:** Worker trigger UI components

---

### Group 3: System Status Functions (4 functions)

#### 5. `getStagingStatus()`
- **File:** `lib/api-v2.ts:183`
- **Signature:** `getStagingStatus(): Promise<StagingStatusResponse | null>`
- **Endpoint:** `GET /api:LIdBL1AN/staging-status`
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/staging-status"
  ```
- **Expected Response:**
  ```json
  {
    "tables": [
      {
        "table_name": "staging_transactions",
        "staging_count": 150,
        "processed_count": 140,
        "error_count": 10
      }
    ],
    "total_staging": 150,
    "total_errors": 10
  }
  ```
- **Used By:** Staging status dashboard

#### 6. `getTableCounts()`
- **File:** `lib/api-v2.ts:188`
- **Signature:** `getTableCounts(): Promise<TableCountsResponse | null>`
- **Endpoint:** `GET /api:LIdBL1AN/table-counts`
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/table-counts"
  ```
- **Expected Response:**
  ```json
  {
    "tables": [
      { "name": "user", "count": 337 },
      { "name": "agent", "count": 35526 },
      { "name": "transaction", "count": 50000 }
    ]
  }
  ```
- **Used By:** Table counts visualization

#### 7. `getOnboardingStatus()`
- **File:** `lib/api-v2.ts:193`
- **Signature:** `getOnboardingStatus(): Promise<OnboardingStatusResponse | null>`
- **Endpoint:** `GET /api:LIdBL1AN/onboarding-status`
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/onboarding-status"
  ```
- **Expected Response:**
  ```json
  {
    "total_users": 337,
    "onboarded": 300,
    "pending": 35,
    "failed": 2
  }
  ```
- **Used By:** Onboarding progress tracker

#### 8. `healthCheck()`
- **File:** `lib/api-v2.ts:198`
- **Signature:** `healthCheck(): Promise<{ status: string } | null>`
- **Endpoint:** `GET /api:LIdBL1AN/health`
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/health"
  ```
- **Expected Response:** `{ "status": "ok" }`
- **Used By:** Health monitoring components

---

### Group 4: Seeding Functions (3 functions)

#### 9. `seedDemoData()`
- **File:** `lib/api-v2.ts:207`
- **Signature:** `seedDemoData(): Promise<TaskResult>`
- **Endpoint:** `POST /api:2kCRUYxG/seed/demo-dataset`
- **Test:**
  ```bash
  curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG/seed/demo-dataset" \
    -H "Content-Type: application/json"
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "data": { "users_created": 3, "transactions_created": 100 },
    "duration": 10000
  }
  ```
- **Used By:** Demo data seeding UI

#### 10. `clearStaging()`
- **File:** `lib/api-v2.ts:212`
- **Signature:** `clearStaging(): Promise<TaskResult>`
- **Endpoint:** `POST /api:2kCRUYxG/clear/staging`
- **Test:**
  ```bash
  curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG/clear/staging" \
    -H "Content-Type: application/json"
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "data": { "records_deleted": 150 },
    "duration": 2000
  }
  ```
- **Used By:** Staging cleanup UI

#### 11. `clearAll()`
- **File:** `lib/api-v2.ts:217`
- **Signature:** `clearAll(): Promise<TaskResult>`
- **Endpoint:** `POST /api:2kCRUYxG/clear/all`
- **Test:**
  ```bash
  curl -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG/clear/all" \
    -H "Content-Type: application/json"
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "data": { "total_deleted": 50000 },
    "duration": 30000
  }
  ```
- **Used By:** Full data reset UI (DANGEROUS)

---

### Group 5: Search Functions (5 functions - Client-side only)

These functions don't make API calls - they operate on client-side data:

#### 12. `searchTasks()`
- **File:** `lib/api-v2.ts:226`
- **Type:** Client-side search
- **Test:** Not applicable (no API call)

#### 13. `getTaskById()`
- **File:** `lib/api-v2.ts:237`
- **Type:** Client-side lookup
- **Test:** Not applicable (no API call)

#### 14. `getScheduledTasks()`
- **File:** `lib/api-v2.ts:242`
- **Type:** Client-side filter
- **Test:** Not applicable (no API call)

#### 15. `getActiveTasks()`
- **File:** `lib/api-v2.ts:249`
- **Type:** Client-side filter
- **Test:** Not applicable (no API call)

#### 16. `getInactiveTasks()`
- **File:** `lib/api-v2.ts:254`
- **Type:** Client-side filter
- **Test:** Not applicable (no API call)

---

### Group 6: Introspection API Functions (6 functions)

#### 17. `introspectionApi.getComparisonSummary()`
- **File:** `lib/api.ts:106`
- **Endpoint:** `GET /api:g79A_W7O/comparison-summary`
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O/comparison-summary"
  ```
- **Expected Response:**
  ```json
  {
    "summary": {
      "tables": { "v1": 251, "v2": 193 },
      "api_groups": { "v1": 6, "v2": 4 },
      "functions": { "v1": 450, "v2": 380 },
      "background_tasks": { "v1": 38, "v2": 38 }
    },
    "generated_at": 1705858800000
  }
  ```
- **Used By:** Comparison dashboard

#### 18. `introspectionApi.getV1Tables()`
- **File:** `lib/api.ts:111`
- **Endpoint:** `GET /api:g79A_W7O/v1-tables`
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O/v1-tables"
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "total": 251,
    "tables": [
      {
        "id": 41,
        "name": "user",
        "description": "User accounts",
        "created_at": "2024-01-01",
        "updated_at": "2024-01-01",
        "tag": ["core"]
      }
    ]
  }
  ```
- **Used By:** V1 tables listing

#### 19. `introspectionApi.getV2Tables()`
- **File:** `lib/api.ts:116`
- **Endpoint:** `GET /api:g79A_W7O/v2-tables`
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O/v2-tables"
  ```
- **Expected Response:**
  ```json
  {
    "success": true,
    "total": 193,
    "tables": [
      {
        "id": 41,
        "name": "user",
        "description": "User accounts",
        "created_at": "2024-01-01",
        "updated_at": "2024-01-01",
        "tag": ["core"]
      }
    ]
  }
  ```
- **Used By:** V2 tables listing

#### 20. `introspectionApi.getApiGroups()`
- **File:** `lib/api.ts:121`
- **Endpoint:** `GET /api:g79A_W7O/api-groups`
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O/api-groups"
  ```
- **Expected Response:**
  ```json
  {
    "v1": {
      "total": 6,
      "groups": [
        {
          "id": 396,
          "name": "Auth",
          "canonical": "api:lkmcgxf_",
          "created_at": "2024-01-01",
          "tag": ["core"]
        }
      ]
    },
    "v2": {
      "total": 4,
      "groups": [...]
    }
  }
  ```
- **Used By:** API groups comparison

#### 21. `introspectionApi.getFunctions()`
- **File:** `lib/api.ts:126`
- **Endpoint:** `GET /api:g79A_W7O/functions`
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O/functions"
  ```
- **Expected Response:**
  ```json
  {
    "v1": {
      "total": 450,
      "functions": [
        {
          "id": 100,
          "name": "calculate_cap",
          "description": "Calculate team cap",
          "created_at": "2024-01-01",
          "tag": ["metrics"]
        }
      ]
    },
    "v2": {
      "total": 380,
      "functions": [...]
    }
  }
  ```
- **Used By:** Functions comparison

#### 22. `introspectionApi.getBackgroundTasks()`
- **File:** `lib/api.ts:131`
- **Endpoint:** `GET /api:g79A_W7O/background-tasks`
- **Test:**
  ```bash
  curl "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O/background-tasks"
  ```
- **Expected Response:**
  ```json
  {
    "v1": {
      "total": 38,
      "tasks": [
        {
          "id": 5064,
          "name": "Update 30-Day Team Transaction Count",
          "description": "Updates team transaction metrics",
          "created_at": "2024-01-01",
          "tag": ["metrics"]
        }
      ]
    },
    "v2": {
      "total": 38,
      "tasks": [...]
    }
  }
  ```
- **Used By:** Background tasks comparison

---

## Testing Summary

| Category | Total Functions | API Calls | Client-side Only |
|----------|----------------|-----------|------------------|
| Core API Client | 2 | 2 | 0 |
| Task Management | 2 | 2 | 0 |
| System Status | 4 | 4 | 0 |
| Seeding | 3 | 3 | 0 |
| Search | 5 | 0 | 5 |
| Introspection | 6 | 6 | 0 |
| **TOTAL** | **22** | **17** | **5** |

---

## Testing Checklist

### Phase 1: Core Infrastructure (2 tests)
- [ ] `runTaskEndpoint()` - Generic task runner
- [ ] `getStatus()` - Quick GET helper

### Phase 2: System Status (4 tests)
- [ ] `getStagingStatus()` - Staging table status
- [ ] `getTableCounts()` - Table counts
- [ ] `getOnboardingStatus()` - Onboarding progress
- [ ] `healthCheck()` - System health

### Phase 3: Introspection (6 tests)
- [ ] `getComparisonSummary()` - V1/V2 summary
- [ ] `getV1Tables()` - V1 tables list
- [ ] `getV2Tables()` - V2 tables list
- [ ] `getApiGroups()` - API groups comparison
- [ ] `getFunctions()` - Functions comparison
- [ ] `getBackgroundTasks()` - Tasks comparison

### Phase 4: Task Execution (2 tests)
- [ ] `runBackgroundTask()` - Run background task
- [ ] `runWorker()` - Run worker function

### Phase 5: Seeding Operations (3 tests - CAREFUL!)
- [ ] `seedDemoData()` - Seed demo dataset
- [ ] `clearStaging()` - Clear staging tables
- [ ] `clearAll()` - Clear all data (DANGEROUS)

---

## Common Failure Modes & Fixes

| Frontend Expects | Backend Returns | Xano Fix |
|------------------|-----------------|----------|
| `{ success: true, data: {...} }` | `{...}` | Wrap in TaskResult structure |
| `{ tables: [...] }` | `[...]` | Wrap: `response = {tables: $data}` |
| `{ status: "ok" }` | `{ result: "success" }` | Change response format |
| 404 error | Missing endpoint | Create endpoint in Xano |
| Timeout after 120s | Long-running task | Optimize query or increase timeout |

---

## Next Steps

1. **Start with System Status endpoints** - These are read-only and safe
2. **Test Introspection API** - Verify V1/V2 comparison works
3. **Test Task Execution** - Use safe task IDs first
4. **Document all failures** - Track which endpoints need Xano fixes
5. **Apply FP patterns** - Use Result type for all Xano fixes

---

**Generated:** January 21, 2026
**Status:** Ready for systematic testing
**Success Criteria:** 17/17 API endpoints return expected responses
