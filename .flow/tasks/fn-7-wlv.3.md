# fn-7-wlv.3 Clean dashboards2.0 major cruft - archive old version dirs, remove large artifacts

## Description

TBD

## Acceptance

- [ ] TBD

## Done summary

Cleaned dashboards2.0 by archiving 68MB of cruft to \_archive/: old version directories (v2/, v3-consolidation-old/, v0-agent-dashboards-2-0/), backup directories (docs.backup/, examples.backup/, backups/, debug-logs/, rebuild/, xano-endpoints/), and large files (33 PDFs, 1 MP4, slack_messages.json, webhook_data.csv). Updated .gitignore with \_archive/, .cursor/, .cursorrules\*. Build passes, lint errors reduced from 993 to 985.

## Evidence

- Commits: 906ed9614fdde83509b291974207bdf4b75add1e
- Tests: pnpm build, pnpm lint (8 fewer errors than baseline)
- PRs:
