# fn-7-wlv.9 Verify all 3 demo accounts work (Michael, Sarah, James)

## Description

TBD

## Acceptance

- [ ] TBD

## Done summary

Verified all 3 demo accounts work: Michael Johnson (ID: 7, Team Owner), Sarah Williams (ID: 256, Team Member), and James Anderson (ID: 133, Network Builder). Login succeeds via both V1 API with X-Data-Source header and V2 demo-auth endpoint. Demo mode confirmed with demo_account=true flag in responses.

## Evidence

- Commits: 866a2a02ceb703f03efe1887da0077086667fd8a
- Tests: curl demo-auth for user 7, curl demo-auth for user 256, curl demo-auth for user 133, curl V1 login for michael@demo, curl V1 login for sarah@demo, curl V1 login for james@demo, curl auth/me with X-Data-Source header
- PRs:
