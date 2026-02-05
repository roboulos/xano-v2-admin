# fn-14-7cl.2 Build Webhooks story tab component

## Description

Build a Webhooks story tab that shows webhook configuration and recent delivery events for the V2 system. This completes story line 5 of 6 from the original fn-13-iz6 spec.

### What to build

Create `components/story-tabs/webhooks-story-tab.tsx` exporting `WebhooksStoryTab`.

### Content

The V2 system uses Rezen webhooks for real-time data sync. The tab should show:

1. **Webhook Configuration Summary** — Card listing configured webhooks from CLAUDE.md docs:
   - Rezen webhooks (transaction updates, agent changes, network changes)
   - Known webhook endpoints and their purposes
   - Use data from `lib/mcp-endpoints.ts` WORKERS endpoints that handle webhook payloads

2. **Webhook Health Status** — For each webhook:
   - Active/Inactive status badge
   - Last received timestamp (if available from system data)
   - Delivery success rate indicator

3. **Recent Events Feed** — If user is selected via UserContext:
   - Show recent sync job entries (from SYSTEM `/staging-status` endpoint)
   - Show staging table activity as proxy for webhook activity
   - Graceful fallback if endpoint returns 404

4. **Architecture Diagram** — Static visual showing:
   ```
   Rezen API → Webhook → V2 Staging Tables → Processing → V2 Core Tables
   ```

### Patterns to follow

- Follow existing story tab patterns (onboarding-story-tab.tsx is the reference)
- Use `useSelectedUserId()` for user-scoped data
- Use semantic CSS tokens for status colors
- ShadCN components: Card, Badge, Skeleton
- Graceful 404 handling with informative fallback UI
- Loading skeletons during fetch

### Wire into navigation

- Add to `app/page.tsx`: ViewMode `'webhooks-story'`, label "Webhooks", icon `Webhook` from lucide-react
- Add ErrorBoundary-wrapped render in content section

## Acceptance

- [ ] WebhooksStoryTab component renders webhook configuration
- [ ] Shows health status for known webhook integrations
- [ ] User-scoped recent events when user selected
- [ ] Graceful fallback for missing/404 endpoints
- [ ] Wired into page.tsx navigation
- [ ] Zero TypeScript errors, zero new lint errors

## Done summary

Built WebhooksStoryTab component showing 8 configured webhook integrations (reZEN and FUB), webhook health status with active/inactive badges, architecture flow diagram, and user-scoped staging activity feed via /staging-status endpoint with graceful 404 handling. Wired into page.tsx navigation as 'Webhooks' tab.

## Evidence

- Commits: 52123d61d4892454ff376a29b5aed24a4ffc2bd1
- Tests: npx tsc --noEmit, pnpm lint
- PRs:
