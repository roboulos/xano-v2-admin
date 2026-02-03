# fn-6-1dg.1 Create /job-queue-status endpoint in Xano SYSTEM group

## Description

TBD

## Acceptance

- [ ] TBD

## Done summary

Endpoint /job-queue-status already exists and works.

- Endpoint ID: 18035
- Returns job counts by status (pending, in_progress, completed, error, failed)
- Plus list of recent 50 jobs

## Evidence

- Commits:
- Tests: curl GET job-queue-status - returns success:true
- PRs:
