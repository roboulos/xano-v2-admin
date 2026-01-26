# Epic 001: Agent Readiness Blockers
## Fix Critical Issues from Prime Assessment

**Created:** 2026-01-25
**Completed:** 2026-01-25
**Status:** DONE
**Priority:** P0 - Blocking Production

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                              EPIC OVERVIEW                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ Goal: Resolve all P0 blockers identified in prime assessment               │
│                                                                             │
│ Current State:                                                              │
│   • Build: FAILS (TypeScript error)                                         │
│   • Security: Hardcoded credentials in source                               │
│   • CI/CD: None configured                                                  │
│   • Environment: No .env.example                                            │
│                                                                             │
│ Target State:                                                               │
│   • Build: Passes                                                           │
│   • Security: Credentials in env vars                                       │
│   • CI/CD: GitHub Actions on every PR                                       │
│   • Environment: Documented and reproducible                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Task Breakdown

### Task 1: Fix Build Failure
**Status:** Not Started
**Effort:** 15 min
**Files:** `components/comparison-modal.tsx`

#### Problem
TypeScript error at line 297:
```typescript
// FunctionMetadata can have inputs/outputs which are Array<{name, type}>
// But FunctionComparison.v1Value expects: string | string[] | null
// When field is "inputs" or "outputs", v1Str becomes Array<{name, type}>
```

#### Root Cause Analysis
```typescript
// Line 285-288:
const v1Value = v1Func[field as keyof FunctionMetadata]  // Could be Array<{name, type}>
const v2Value = v2Func[field as keyof FunctionMetadata]
const v1Str = Array.isArray(v1Value) ? v1Value : String(v1Value || "")
// Problem: v1Str is still Array<{name, type}> if v1Value is inputs/outputs
```

#### Solution
The fields array only includes safe fields, but TypeScript doesn't know that:
```typescript
const fields = ["name", "type", "category", "tags", "last_modified"]
```

Fix by explicitly typing `v1Str` and `v2Str`:
```typescript
const v1Str: string | string[] = Array.isArray(v1Value)
  ? (typeof v1Value[0] === 'string' ? v1Value : v1Value.map(String))
  : String(v1Value || "")
```

Or simpler - cast to the expected type since we control the fields array:
```typescript
v1Value: v1Str as string | string[] | null,
v2Value: v2Str as string | string[] | null,
```

#### Verification
```bash
npm run build  # Should complete without errors
```

---

### Task 2: Remove Hardcoded Credentials
**Status:** Not Started
**Effort:** 20 min
**Files:**
- `scripts/run-endpoint-tests.ts`
- `scripts/compare-response-structures.ts`

#### Problem
Test user password hardcoded in source:
```typescript
// scripts/run-endpoint-tests.ts:21
password: 'Password123!',

// scripts/compare-response-structures.ts:29
password: 'Password123!',
```

#### Solution

**Step 1:** Create `.env.test.local.example`:
```env
# Test User Credentials (User 60 - David Keener)
TEST_USER_EMAIL=dave@premieregrp.com
TEST_USER_PASSWORD=<your-test-password>
TEST_USER_ID=60
TEST_AGENT_ID=37208
TEST_TEAM_ID=1
```

**Step 2:** Update scripts to read from env:
```typescript
import 'dotenv/config'

const TEST_USER = {
  id: parseInt(process.env.TEST_USER_ID || '60'),
  email: process.env.TEST_USER_EMAIL || 'dave@premieregrp.com',
  password: process.env.TEST_USER_PASSWORD,
  agent_id: parseInt(process.env.TEST_AGENT_ID || '37208'),
  team_id: parseInt(process.env.TEST_TEAM_ID || '1'),
}

if (!TEST_USER.password) {
  console.error('ERROR: TEST_USER_PASSWORD not set in environment')
  console.error('Copy .env.test.local.example to .env.test.local and set password')
  process.exit(1)
}
```

**Step 3:** Add to `.gitignore`:
```
.env.test.local
```

#### Verification
```bash
# Should fail without env var
npm run test:endpoints
# ERROR: TEST_USER_PASSWORD not set in environment

# Should work with env var
export TEST_USER_PASSWORD='Password123!'
npm run test:endpoints
```

---

### Task 3: Create Environment Documentation
**Status:** Not Started
**Effort:** 15 min
**Files:**
- `.env.example` (create)
- `.env.test.local.example` (create)
- `.nvmrc` (create)

#### Deliverables

**`.env.example`:**
```env
# Xano V2 API Configuration
# Override to point to different Xano workspace/instance
NEXT_PUBLIC_XANO_BASE_URL=https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I

# Optional: API timeout in milliseconds
# NEXT_PUBLIC_API_TIMEOUT=30000
```

**`.env.test.local.example`:**
```env
# Test User Credentials (User 60 - David Keener)
# DO NOT commit .env.test.local - it contains secrets
TEST_USER_EMAIL=dave@premieregrp.com
TEST_USER_PASSWORD=<set-your-password-here>
TEST_USER_ID=60
TEST_AGENT_ID=37208
TEST_TEAM_ID=1

# V1 Workspace (for comparison testing)
V1_BASE_URL=https://xmpx-swi5-tlvy.n7c.xano.io

# V2 Workspace
V2_BASE_URL=https://x2nu-xcjc-vhax.agentdashboards.xano.io
```

**`.nvmrc`:**
```
20
```

#### Verification
```bash
cat .env.example
cat .env.test.local.example
cat .nvmrc
nvm use  # Should switch to Node 20
```

---

### Task 4: Add GitHub Actions CI
**Status:** Not Started
**Effort:** 30 min
**Files:**
- `.github/workflows/ci.yml` (create)
- `.github/pull_request_template.md` (create)

#### CI Workflow

**`.github/workflows/ci.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm exec tsc --noEmit

      - name: Lint
        run: pnpm lint
        continue-on-error: true  # 603 existing errors

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test --run
```

**`.github/pull_request_template.md`:**
```markdown
## Summary
<!-- Brief description of changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation
- [ ] CI/CD

## Testing
- [ ] `npm run build` passes
- [ ] `npm run test` passes
- [ ] Manual testing completed

## Validation (if applicable)
- [ ] `npm run validate:tables` - Tables: ___/193
- [ ] `npm run validate:functions` - Functions: ___/270
- [ ] `npm run validate:endpoints` - Endpoints: ___/801
- [ ] `npm run validate:references` - References: ___/156
```

#### Verification
```bash
# Verify workflow syntax
cat .github/workflows/ci.yml | head -20

# Test locally (optional)
act -j build  # Requires 'act' tool
```

---

### Task 5: Update CLAUDE.md File Structure
**Status:** Not Started
**Effort:** 20 min
**Files:** `CLAUDE.md`

#### Problem
Lines 208-227 reference non-existent files:
- `components/migration-overview.tsx` - doesn't exist
- `components/table-comparison.tsx` - doesn't exist
- `lib/v1-data.ts`, `lib/v2-data.ts` - structure is different

#### Solution
Update to reflect actual structure:
```markdown
### File Structure
\`\`\`
app/
├── page.tsx              # Main dashboard with tabs
├── layout.tsx            # Root layout
├── globals.css           # Tailwind styles
├── api/v2/               # API routes
│   ├── tables/           # Table endpoints
│   ├── functions/        # Function endpoints
│   ├── endpoints/        # Endpoint health checks
│   └── background-tasks/ # Background task management
lib/
├── api/
│   ├── client.ts         # Axios client with auth
│   ├── generated-*.ts    # Auto-generated types/hooks
│   └── endpoint-tester.ts
├── snappy-client.ts      # MCP tool wrapper
├── frontend-api-v2-openapi.json  # OpenAPI spec (889KB)
├── function-endpoint-mapping.json # Function mappings
└── mcp-endpoints.ts      # Endpoint configuration
components/
├── ui/                   # ShadCN components
├── machine-2/            # Machine 2.0 tab components
├── comparison-modal.tsx  # V1/V2 comparison modal
├── functions-tab.tsx     # Functions management
├── background-tasks-tab.tsx
├── live-migration-status.tsx (65KB - largest)
└── validation-pipeline-view.tsx
scripts/
├── validation/           # Validation scripts
│   ├── validate-tables.ts
│   ├── validate-functions.ts
│   ├── validate-endpoints.ts
│   ├── validate-references.ts
│   └── utils.ts
├── generate-types.ts     # Type generation
├── generate-hooks.ts     # Hook generation
├── generate-schemas.ts   # Zod schema generation
└── run-endpoint-tests.ts # CLI endpoint tester
validation-reports/       # Generated validation JSON
test/
└── v2-integration.test.ts # 280+ test cases
\`\`\`
```

Also add API Automation section:
```markdown
## API Automation Pipeline

Auto-generated code from OpenAPI spec (28,574 lines total):

| Command | Output | Lines |
|---------|--------|-------|
| `npm run types:gen` | `lib/api/generated-types.ts` | ~8,000 |
| `npm run hooks:gen` | `lib/api/generated-hooks.ts` | ~12,000 |
| `npm run schemas:gen` | `lib/api/generated-schemas.ts` | ~8,500 |
| `npm run api:gen` | All three | 28,574 |

**When to regenerate:** After any Xano backend changes, run `npm run api:gen`.
```

#### Verification
```bash
# Check that referenced files exist
ls -la components/comparison-modal.tsx
ls -la components/live-migration-status.tsx
ls -la scripts/validation/
```

---

## Execution Order

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RECOMMENDED SEQUENCE                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Task 1: Fix Build ─────────────────────────┐                              │
│  (15 min)                                   │                              │
│                                             ▼                              │
│  Task 3: Create .env files ─────> Task 2: Remove Hardcoded Creds           │
│  (15 min)                         (20 min - depends on Task 3)             │
│                                             │                              │
│                                             ▼                              │
│  Task 4: Add CI ◄───────────────────────────┘                              │
│  (30 min - depends on Tasks 1, 2, 3)                                       │
│                                             │                              │
│                                             ▼                              │
│  Task 5: Update CLAUDE.md                                                  │
│  (20 min - can run in parallel)                                            │
│                                                                             │
│  Total: ~1.5 hours                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DEFINITION OF DONE                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ✓ npm run build completes without errors                                    │
│ ✓ No hardcoded passwords in any source files                                │
│ ✓ .env.example exists with all required variables documented                │
│ ✓ .nvmrc exists with Node 20                                                │
│ ✓ GitHub Actions CI runs on every PR                                        │
│ ✓ CLAUDE.md file structure matches actual repo                              │
│ ✓ npm run test:endpoints works with env var password                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Build fix breaks functionality | Low | High | Run full validation after fix |
| CI timeout on validate:all | Medium | Medium | Make validation optional in CI |
| Password env var missing in CI | Low | Low | CI doesn't run endpoint tests |
| CLAUDE.md update incomplete | Low | Low | Review against actual files |

---

## Dependencies

- None external
- All tasks can be completed locally
- No Xano backend changes required
