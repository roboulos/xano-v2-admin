# fn-9-7vd.4 Verify V2 endpoints work with real user 60

## Description

Verify all V2 WORKERS endpoints work correctly with real user 60 (David Keener).

**Size:** M
**Files:** V2 endpoint testing via curl

## Approach

1. Test each WORKERS endpoint with user_id=60:
   - Team endpoints: team-roster, team-members, team-owners
   - Agent endpoints: agent-data, agent-performance
   - Transaction endpoints: txn-sync, txn-history
   - Network endpoints: network-downline, sponsor-tree
   - FUB endpoints: all 9 FUB-related endpoints
2. Document any failing endpoints
3. Fix endpoint issues if found (or create follow-up tasks)

## Test Template

```bash
curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 60}'
```

## Acceptance

- [ ] Team endpoints return valid data for user 60
- [ ] Agent endpoints return valid data for user 60
- [ ] Network endpoints return valid data for user 60
- [ ] FUB endpoints work (or documented why they can't)
- [ ] All 32+ WORKERS endpoints tested
- [ ] Pass/fail documented for each endpoint

## Done summary

TBD

## Evidence

- Commits:
- Tests:
- PRs:
