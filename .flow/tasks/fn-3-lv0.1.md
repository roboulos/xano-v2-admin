# fn-3-lv0.1 Investigate staging table processing trigger

## Description

Investigate WHY staging tables have ~78K unprocessed records (27K listings, 51K transactions).

**Size:** S
**Files:** lib/mcp-endpoints.ts, lib/workers-inventory.ts

## Approach

1. Find the function(s) that process `stage_listings` → `listing`
2. Find the function(s) that process `stage_transactions` → `transaction`
3. Check if these are background tasks, manual triggers, or webhook-triggered
4. Test the processing endpoint with a small batch
5. Document the trigger mechanism

## Key context

- MCP TASKS endpoint: `api:4psV7fp6`
- Look for endpoints like `test-task-8023`, `test-task-8024` or similar
- Staging tables: `stage_listings_rezen_onboarding`, `stage_transactions_rezen_onboarding`

## Acceptance

- [ ] Identified function that processes staged listings
- [ ] Identified function that processes staged transactions
- [ ] Documented trigger mechanism (scheduled/manual/webhook)
- [ ] Tested processing endpoint successfully
- [ ] Updated `.flow/docs/` with findings

## Done summary

Investigated staging table processing trigger mechanism. Key finding: all staging records are already processed (is_processed=true). The perceived "78K gap" was a misinterpretation comparing total staging counts vs final table counts. Processing is job-based via background tasks running every 60 seconds.

## Evidence

- Commits: 2a447d55b397fea18f67c0ec0a6b45c61c7b5c6a
- Tests: curl staging endpoints, xano-mcp query_table with is_processed filter, curl table-counts endpoint
- PRs:
