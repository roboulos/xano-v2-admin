# fn-5-bsl.3 Fix /test-function-8066-team-roster (WORKERS)

## Description

Function returns `success: false` with empty error message. Root cause needs to be verified before implementing fix.

## Implementation Steps

### Step 1: Verify function ID and inspect in Xano console (REQUIRED)

**First, verify function ID is correct:**

```bash
# Search for team roster function by name to confirm ID
mcp__xano-mcp__execute list_functions { workspace_id: 5, search: "team roster" }
```

If function ID differs from 8066, use the correct ID.

**Then inspect the function stack:**

```bash
# Get function details (replace 8066 if different)
mcp__xano-mcp__execute get_function { function_id: 8066 }
```

Look for:

- Inline array patterns: `["header", $variable]` ← Known XanoScript bug
- Error handling: Is `$error` being captured in catch blocks?
- API calls: What external API is being called? Is it timing out?
- Null checks: Are there unguarded property accesses?

### Step 2: Identify actual error source

**Possible causes (check in order):**

1. **XanoScript inline array bug** - If headers use `["x", $var]` pattern, fix with `|push`
2. **API timeout** - reZEN API call exceeding timeout, returns null
3. **Auth failure** - API key not being passed correctly to reZEN
4. **Null reference** - Team or user data is null, causing silent failure
5. **Missing try/catch** - Error not being captured

### Step 3: Apply appropriate fix

**If inline array bug (most likely):**

```xanoscript
// WRONG
var $headers { value = ["Content-Type: application/json", $api_key_header] }

// CORRECT
var $headers { value = []|push:"Content-Type: application/json"|push:$api_key_header }
```

**If error handling issue:**

```xanoscript
// Ensure catch block captures error message
} catch {
  var $error_msg { value = $error|get:"message":"Unknown error" }
}
```

**If API timeout:**

- Increase timeout value
- Add explicit timeout handling with meaningful error

### Step 4: Test with multiple scenarios

| User                      | Expected Result                                   |
| ------------------------- | ------------------------------------------------- |
| User 60 (has team)        | `success: true` with roster data                  |
| User with no team         | `success: true, skipped: true, reason: "No team"` |
| User with invalid API key | `success: false` with clear error message         |

## Acceptance

- [ ] **Prerequisite:** Function ID verified (search by name, may not be 8066)
- [ ] **Prerequisite:** Function stack inspected in Xano
- [ ] **Prerequisite:** Actual error source identified and documented
- [ ] POST with `{"user_id": 60}` returns `success: true`
- [ ] Response includes team roster data (members array)
- [ ] Error messages properly captured if failure occurs (no empty errors)
- [ ] Graceful handling for users without teams
- [ ] Fix pattern documented for future similar issues

## Context

**Function ID:** 8066
**URL:** `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8066-team-roster`

```bash
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/test-function-8066-team-roster" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

**Test user:**

- User ID: 60, Team ID: 1

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
