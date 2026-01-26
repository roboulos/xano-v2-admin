# Task Orchestration Patterns - V2 Backend

> Task 2.2: Document task orchestration patterns

## Orchestration Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ORCHESTRATION PATTERN                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  BACKGROUND TASK (Cron/Webhook Trigger)                                    │    │
│  └───────────────────────────────┬────────────────────────────────────────────┘    │
│                                  │                                                  │
│                                  v                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  TASK ORCHESTRATOR (Tasks/ folder)                                         │    │
│  │  • Validates inputs                                                        │    │
│  │  • Gets user/agent context                                                 │    │
│  │  • Creates/updates job record                                              │    │
│  │  • Calls Workers in sequence                                               │    │
│  │  • Collects errors (continue-on-failure)                                   │    │
│  │  • Updates job status                                                      │    │
│  │  • Returns FP Result type                                                  │    │
│  └───────────────────────────────┬────────────────────────────────────────────┘    │
│                                  │                                                  │
│                    ┌─────────────┼─────────────┐                                   │
│                    │             │             │                                   │
│                    v             v             v                                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                      │
│  │  WORKER 1       │ │  WORKER 2       │ │  WORKER N       │                      │
│  │  (API call)     │ │  (Transform)    │ │  (Upsert)       │                      │
│  │                 │ │                 │ │                 │                      │
│  │  Returns:       │ │  Returns:       │ │  Returns:       │                      │
│  │  {success,      │ │  {success,      │ │  {success,      │                      │
│  │   data,         │ │   data,         │ │   data,         │                      │
│  │   error}        │ │   error}        │ │   error}        │                      │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                      │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Pattern: FP Result Type

All functions return a consistent Result type:

```xanoscript
response = {
  success: bool           // true if operation succeeded
  data: {                 // Result payload (on success)
    ...
  }
  error: text|null        // Error message (on failure)
  meta: {                 // Metadata
    function_name: text
    timestamp: timestamp
    errors: []            // Detailed error array
  }
}
```

---

## Pattern 1: Sequential Orchestrator (Continue-on-Failure)

Used by: `Workers/reZEN - Onboarding Orchestrator` (ID: 8297)

### Characteristics

- Calls multiple workers in sequence
- Continues even if one step fails
- Collects all errors for reporting
- Updates job record after each step

### Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    SEQUENTIAL ORCHESTRATOR PATTERN                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. INITIALIZATION                                                                  │
│     ├── Validate user exists                                                        │
│     ├── Get credentials                                                             │
│     ├── Create/update job record                                                    │
│     └── Send start notification                                                     │
│                                                                                      │
│  2. EXECUTE STEPS (Continue-on-Failure)                                             │
│                                                                                      │
│     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                        │
│     │   STEP 1    │────>│   STEP 2    │────>│   STEP N    │                        │
│     │ Agent Data  │     │ Team Roster │     │  RevShare   │                        │
│     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                        │
│            │                   │                   │                                │
│            v                   v                   v                                │
│     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                        │
│     │ Check Result│     │ Check Result│     │ Check Result│                        │
│     │ Track Error │     │ Track Error │     │ Track Error │                        │
│     │ Update Job  │     │ Update Job  │     │ Update Job  │                        │
│     └─────────────┘     └─────────────┘     └─────────────┘                        │
│                                                                                      │
│  3. COMPLETION                                                                      │
│     ├── Count errors                                                                │
│     ├── Set final status (Complete/Partial)                                         │
│     ├── Send completion notification                                                │
│     └── Return aggregated Result                                                    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### XanoScript Pattern

```xanoscript
// Initialize tracking arrays
var $steps_completed { value = [] }
var $errors { value = [] }
var $failed_steps { value = [] }

// STEP N: Execute worker
db.edit job_table {
  field_name = "user_id"
  field_value = $user_id
  data = {step_n_started: now}
}

function.run "Workers/Step-N" {
  input = {user_id: $user_id}
} as $step_n_result

// Check result and track
conditional {
  if ($step_n_result.success == false) {
    var.update $errors {
      value = $errors|push:({
        |set:"step":"step_n"
        |set:"error":($step_n_result.error ?? "Unknown error")
      })
    }
    var.update $failed_steps {
      value = $failed_steps|push:"step_n"
    }
  }
  else {
    var.update $steps_completed {
      value = $steps_completed|push:"step_n"
    }
  }
}

db.edit job_table {
  field_name = "user_id"
  field_value = $user_id
  data = {step_n: true, step_n_ended: now}
}
```

---

## Pattern 2: Traverse Pattern (Batch Processing)

Used by: `Workers/Income - Aggregate All Agents` (ID: 10055)

### Characteristics

- Processes a collection of items
- Collects successes and failures separately
- Supports pagination for large datasets
- Returns aggregate results

### Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    TRAVERSE PATTERN                                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. QUERY COLLECTION (with pagination)                                              │
│     db.query agents { return = {type: "list"} }                                     │
│                                                                                      │
│  2. INITIALIZE COLLECTORS                                                           │
│     var $successes { value = [] }                                                   │
│     var $failures { value = [] }                                                    │
│                                                                                      │
│  3. FOREACH ITEM                                                                    │
│     ┌──────────────────────────────────────────────────────┐                       │
│     │  foreach ($items) {                                   │                       │
│     │    each as $item {                                    │                       │
│     │      function.run "Worker" { input = {...} }         │                       │
│     │                                                       │                       │
│     │      if (success) → push to $successes               │                       │
│     │      else         → push to $failures                │                       │
│     │    }                                                  │                       │
│     │  }                                                    │                       │
│     └──────────────────────────────────────────────────────┘                       │
│                                                                                      │
│  4. RETURN AGGREGATE RESULT                                                         │
│     response = {                                                                    │
│       success   : $failures|count == 0                                             │
│       processed : $successes|count                                                 │
│       failed    : $failures|count                                                  │
│       successes : $successes                                                       │
│       errors    : $failures                                                        │
│     }                                                                               │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### XanoScript Pattern

```xanoscript
// Query with pagination
db.query items {
  return = {type: "list"}
  limit = $batch_limit
  offset = $batch_offset
} as $items

// FP Pattern: Separate collectors
var $successes { value = [] }
var $failures { value = [] }

foreach ($items) {
  each as $item {
    function.run "Worker" {
      input = {item_id: $item.id}
    } as $result

    conditional {
      if ($result.success ?? true) {
        var.update $successes {
          value = $successes|push:{
            item_id: $item.id,
            data: $result
          }
        }
      }
      else {
        var.update $failures {
          value = $failures|push:{
            item_id: $item.id,
            error: $result.error ?? "Unknown"
          }
        }
      }
    }
  }
}

response = {
  success   : $failures|count == 0
  processed : $successes|count
  failed    : $failures|count
  has_more  : $items|count == $batch_limit
  successes : $successes
  errors    : $failures
}
```

---

## Pattern 3: Job Status Tracking

All orchestrators update a job table for visibility:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    JOB STATUS TRACKING                                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  JOB RECORD FIELDS                                                                  │
│  ─────────────────                                                                  │
│  • status: "Started" | "Processing" | "Partial" | "Complete" | "Error"             │
│  • started: timestamp                                                               │
│  • ended: timestamp                                                                 │
│  • lastupdated: timestamp                                                           │
│                                                                                      │
│  PER-STEP TRACKING                                                                  │
│  ─────────────────                                                                  │
│  • {step}_started: timestamp                                                        │
│  • {step}_ended: timestamp                                                          │
│  • {step}: bool (completed flag)                                                    │
│                                                                                      │
│  EXAMPLE                                                                            │
│  ───────                                                                            │
│  {                                                                                  │
│    status: "Complete",                                                              │
│    started: "2025-12-28T10:00:00Z",                                                │
│    ended: "2025-12-28T10:05:23Z",                                                  │
│    agent_data: true,                                                               │
│    agent_data_started: "2025-12-28T10:00:01Z",                                     │
│    agent_data_ended: "2025-12-28T10:00:45Z",                                       │
│    team_roster: true,                                                              │
│    team_roster_started: "2025-12-28T10:00:46Z",                                    │
│    team_roster_ended: "2025-12-28T10:01:12Z",                                      │
│    ...                                                                              │
│  }                                                                                  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Pattern 4: Error Handling

### Try-Catch with Notification

```xanoscript
try_catch {
  try {
    // Main logic
    function.run "Worker" {...} as $result

    precondition ($result.success) {
      error = "Worker failed: " ~ $result.error
    }
  }

  catch {
    var.update $success { value = false }
    var.update $message { value = "Failed: " ~ $error.message }

    // Track error with context
    var.update $errors {
      value = $errors|push:({
        |set:"step":"exception"
        |set:"error":$error.message
        |set:"code":$error.code
      })
    }

    // Slack notification
    function.run "Archive/slack_webhook_json_pretty_print" {
      input = {
        url: $slack_url,
        json: {
          |set:"module":"Function Name"
          |set:"user_id":$user_id
          |set:"error":$error.message
        }
      }
    }

    // User notification
    db.add notification_items {
      data = {
        user_id: $user_id,
        code: "ERROR",
        message: "An error occurred"
      }
    }
  }
}
```

---

## Pattern 5: Precondition Validation

Early exit with meaningful errors:

```xanoscript
// Get required data
db.get user {
  field_name = "id"
  field_value = $input.user_id
} as $user

// FP Pattern: Early return with Result type
precondition ($user != null && $user.id != null) {
  error = "User not found with id: " ~ $input.user_id
}

precondition ($user.agent_id != null) {
  error = "User has no agent_id set"
}

// Get credentials
db.query credentials {
  where = $db.credentials.user_id == $input.user_id
       && $db.credentials.platform == "REZEN"
       && $db.credentials.active
  return = {type: "single"}
} as $creds

precondition ($creds != null && $creds.api_key != "") {
  error = "No valid API key found for user"
}
```

---

## Pattern 6: FP Object Composition

Building objects using functional filters:

```xanoscript
// Build object with |set: composition
var $result {
  value = {}
    |set:"success":$success
    |set:"data":({}
      |set:"user_id":$user_id
      |set:"steps_completed":$steps_completed
      |set:"error_count":($errors|count)
    )
    |set:"error":($success ? null : $message)
    |set:"meta":({}
      |set:"function_name":"My Function"
      |set:"errors":$errors
      |set:"timestamp":now
    )
}

// Build array with |push:
var.update $errors {
  value = $errors
    |push:({}
      |set:"step":"step_name"
      |set:"error":"Error message"
    )
}
```

---

## Orchestrator Responsibilities

| Responsibility                   | Pattern               |
| -------------------------------- | --------------------- |
| Validate inputs                  | Preconditions         |
| Get context (user, agent, creds) | db.get/db.query       |
| Create/update job                | db.add/db.edit        |
| Call workers                     | function.run          |
| Track success/failure            | Arrays + conditionals |
| Update job per step              | db.edit               |
| Handle exceptions                | try_catch             |
| Send notifications               | function.run + db.add |
| Return Result                    | FP Result type        |

---

## Worker Responsibilities

| Responsibility      | Pattern                         |
| ------------------- | ------------------------------- |
| Validate inputs     | Preconditions                   |
| Single focused task | API call OR transform OR upsert |
| Return Result type  | {success, data, error}          |
| No job tracking     | Orchestrator handles this       |
| No notifications    | Orchestrator handles this       |

---

## Anti-Patterns to Avoid

| Anti-Pattern                         | Better Approach                       |
| ------------------------------------ | ------------------------------------- |
| Workers updating job records         | Orchestrator handles job state        |
| Throwing exceptions for flow control | Return Result type with success=false |
| Silent failures                      | Always return error in Result         |
| Mixing orchestration and work        | Separate Tasks/ from Workers/         |
| Long-running single functions        | Break into batches with pagination    |
| No error collection                  | Use arrays to collect all errors      |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.7_
