# fn-2-riv.1.1 Map V1 Active Functions

## Description

Query V1 workspace to inventory which functions the client actually uses. This establishes the baseline for what V2 must support.

**Size:** M
**Phase:** 1 - V1 vs V2 Comparison

## Approach

1. Query V1 functions via MCP (workspace_id: 1)
2. Categorize by folder:
   - Workers/ - Data sync and processing
   - Tasks/ - Background scheduled jobs
   - Utils/ - Utility functions
   - Archive/ - Deprecated (ignore)
3. Count by category
4. Identify most recently updated (active)
5. Document in structured format

## Query Commands

```bash
# List all V1 functions
mcp xano list_functions --workspace_id 1

# Get function details
mcp xano get_function --workspace_id 1 --function_id {id}
```

## Expected Output

```
V1 Function Inventory:
├─ Workers/     : XXX functions (active)
├─ Tasks/       : XXX functions (active)
├─ Utils/       : XXX functions (active)
├─ Archive/     : XXX functions (deprecated)
└─ Total Active : XXX functions

Top 20 Most Recently Updated:
1. Workers/FUB - Get Deals (2026-01-XX)
2. Workers/reZEN - Get Transactions (2026-01-XX)
...
```

## Acceptance

- [ ] V1 function count by folder documented
- [ ] Recently updated functions identified (last 30 days)
- [ ] Active vs Archive breakdown clear
- [ ] Output saved to .flow/docs/020-v1-function-inventory.md

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
