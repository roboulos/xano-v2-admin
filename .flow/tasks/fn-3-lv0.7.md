# fn-3-lv0.7 Add alerting for pipeline failures

## Description

Create an alerting system that monitors V2 data pipelines and sends notifications when failures occur. This includes monitoring daily sync failures, staging backlog thresholds, onboarding job failures, and table count anomalies.

**Size:** M
**Files:** scripts/validation/pipeline-alerting.ts, package.json

## Approach

1. Create a pipeline alerting script that checks multiple health metrics
2. Define alert thresholds for staging backlog (warning: 1000, critical: 5000)
3. Monitor daily sync endpoints (FUB, reZEN, SkySlope)
4. Check onboarding job status for failures
5. Send Slack notifications via existing webhook API
6. Generate JSON reports for CI/monitoring integration

## Key context

- Slack webhook endpoint: `/slack/notification` on `api:XOwEm4wm`
- Uses existing SYSTEM endpoints for health data
- Integrates with existing validation patterns
- Supports dry-run mode for testing
- Exit code 1 when critical alerts detected (CI integration)

## Acceptance

- [x] Created pipeline-alerting.ts script
- [x] Monitors staging backlog with configurable thresholds
- [x] Monitors daily sync health (FUB, reZEN, SkySlope)
- [x] Monitors onboarding job status
- [x] Sends Slack notifications for critical/warning alerts
- [x] Generates JSON reports saved to validation-reports/
- [x] Added npm scripts: alert, alert:dry-run, alert:report
- [x] Script tested and functional (detected 2 critical failures)

## Done summary

Created comprehensive pipeline alerting system (scripts/validation/pipeline-alerting.ts) that monitors V2 data pipeline health. The script checks table counts, staging backlog, onboarding jobs, and daily sync health, then sends Slack notifications via the unified webhook API for any critical or warning alerts. Supports dry-run mode for testing and generates JSON reports for CI integration.

## Evidence

- Commits: [to be filled]
- Tests: pnpm tsx scripts/validation/pipeline-alerting.ts --dry-run (executed successfully, detected 2 critical reZEN sync failures)
- PRs:
