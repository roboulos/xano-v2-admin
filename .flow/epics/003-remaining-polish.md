# Epic 003: Remaining Polish Items

## Complete All Prime Assessment Recommendations

**Created:** 2026-01-25
**Status:** Draft
**Priority:** P2 - Polish (Non-Blocking)

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                              EPIC OVERVIEW                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ Goal: Complete all remaining polish items from prime assessment             │
│                                                                             │
│ Current State:                                                              │
│   • Agent Readiness: 85%                                                    │
│   • No formatter configured                                                 │
│   • Minimal test coverage                                                   │
│   • No branch protection                                                    │
│   • No pre-commit hooks                                                     │
│                                                                             │
│ Target State:                                                               │
│   • Agent Readiness: 95%+                                                   │
│   • Prettier configured                                                     │
│   • Code coverage tracking                                                  │
│   • Pre-commit hooks active                                                 │
│   • CLAUDE.md fully accurate                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Task Breakdown

### Task 1: Add Prettier Formatter

**Status:** Not Started
**Effort:** 10 min
**Files:** `package.json`, `.prettierrc`, `.prettierignore`

#### Problem

No code formatter configured - creates inconsistent code style and noisy diffs.

#### Solution

1. Install Prettier:

```bash
pnpm add -D prettier
```

2. Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

3. Create `.prettierignore`:

```
.next/
node_modules/
pnpm-lock.yaml
lib/api/generated-*.ts
```

4. Add scripts to `package.json`:

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

#### Verification

```bash
pnpm format:check
```

---

### Task 2: Add Pre-commit Hooks

**Status:** Not Started
**Effort:** 10 min
**Files:** `package.json`, `.husky/pre-commit`

#### Problem

No automated checks before commit - allows violations to slip through.

#### Solution

1. Install Husky and lint-staged:

```bash
pnpm add -D husky lint-staged
npx husky init
```

2. Add lint-staged config to `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

3. Update `.husky/pre-commit`:

```bash
npx lint-staged
```

#### Verification

```bash
# Make a change and commit - hooks should run
git add -A && git commit -m "test" --dry-run
```

---

### Task 3: Add Code Coverage

**Status:** Not Started
**Effort:** 15 min
**Files:** `vitest.config.ts`, `package.json`

#### Problem

No visibility into test coverage - can't measure code quality.

#### Solution

1. Update `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', 'lib/api/generated-*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

2. Add script to `package.json`:

```json
"test:coverage": "vitest run --coverage"
```

#### Verification

```bash
pnpm test:coverage
```

---

### Task 4: Update CLAUDE.md Line Counts

**Status:** Not Started
**Effort:** 5 min
**Files:** `CLAUDE.md`

#### Problem

Generated file line counts in CLAUDE.md don't match actual:

- Hooks: claimed ~12,000, actual 3,298
- Schemas: claimed ~8,500, actual 3,915
- Types: claimed ~8,000, actual 21,361

#### Solution

Update the API Automation Pipeline section with accurate line counts.

#### Verification

```bash
wc -l lib/api/generated-*.ts
```

---

### Task 5: Add CONTRIBUTING.md

**Status:** Not Started
**Effort:** 10 min
**Files:** `CONTRIBUTING.md`

#### Problem

No contributor guidance - new developers don't know the workflow.

#### Solution

Create `CONTRIBUTING.md` with:

- Development setup instructions
- Commit message conventions
- PR process
- Validation requirements
- Code style guidelines

---

### Task 6: Configure CodeQL

**Status:** Not Started
**Effort:** 10 min
**Files:** `.github/workflows/codeql.yml`

#### Problem

No static analysis security scanning configured.

#### Solution

Create `.github/workflows/codeql.yml`:

```yaml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: typescript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

#### Verification

Push to a branch and check Actions tab.

---

### Task 7: Add Devcontainer Configuration

**Status:** Not Started
**Effort:** 10 min
**Files:** `.devcontainer/devcontainer.json`

#### Problem

No containerized development environment - inconsistent setup across machines.

#### Solution

Create `.devcontainer/devcontainer.json`:

```json
{
  "name": "xano-v2-admin",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss"
      ]
    }
  },
  "postCreateCommand": "pnpm install",
  "remoteUser": "node"
}
```

#### Verification

Open in VS Code with Dev Containers extension or GitHub Codespaces.

---

### Task 8: Enable Branch Protection (Manual)

**Status:** Not Started
**Effort:** 5 min
**Files:** N/A (GitHub settings)

#### Problem

Main branch not protected - allows direct pushes without review.

#### Solution (Manual - GitHub Settings)

1. Go to repo Settings > Branches > Add rule
2. Branch name pattern: `main`
3. Enable:
   - Require a pull request before merging
   - Require approvals (1)
   - Require status checks to pass (build job)
   - Do not allow bypassing settings

#### Verification

Try to push directly to main - should be blocked.

---

### Task 9: Enable Dependabot Security Updates

**Status:** Not Started
**Effort:** 2 min
**Files:** `.github/dependabot.yml`

#### Problem

Dependabot is configured for regular updates but NOT security updates.

#### Solution

This is enabled via GitHub Settings, not the dependabot.yml file:

1. Go to repo Settings > Code security and analysis
2. Enable "Dependabot security updates"

#### Verification

Check Settings > Code security - should show enabled.

---

### Task 10: Add Error Tracking (Optional)

**Status:** Not Started
**Effort:** 30 min
**Files:** Multiple (Sentry SDK integration)

#### Problem

No error tracking in production - issues go unnoticed.

#### Solution (Optional)

1. Create Sentry project
2. Install `@sentry/nextjs`
3. Configure sentry.client.config.ts and sentry.server.config.ts
4. Add SENTRY_DSN to environment

**Note:** This is optional and requires Sentry account setup.

---

## Execution Order

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RECOMMENDED SEQUENCE                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 1: Code Quality (can run in parallel)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Task 1: Add Prettier (10 min)                                       │   │
│  │ Task 2: Add Pre-commit Hooks (10 min)                               │   │
│  │ Task 3: Add Code Coverage (15 min)                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Phase 2: Documentation (can run in parallel)                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Task 4: Update CLAUDE.md Line Counts (5 min)                        │   │
│  │ Task 5: Add CONTRIBUTING.md (10 min)                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Phase 3: Security & CI (can run in parallel)                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Task 6: Configure CodeQL (10 min)                                   │   │
│  │ Task 7: Add Devcontainer (10 min)                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Phase 4: Manual GitHub Settings                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Task 8: Enable Branch Protection (Manual - 5 min)                   │   │
│  │ Task 9: Enable Dependabot Security (Manual - 2 min)                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Phase 5: Optional                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Task 10: Add Sentry Error Tracking (Optional - 30 min)              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DEFINITION OF DONE                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ✓ pnpm format:check passes                                                  │
│ ✓ Pre-commit hooks run on commit                                            │
│ ✓ pnpm test:coverage generates report                                       │
│ ✓ CLAUDE.md line counts match actual files                                  │
│ ✓ CONTRIBUTING.md exists with setup instructions                            │
│ ✓ CodeQL workflow runs on PRs                                               │
│ ✓ Devcontainer opens successfully                                           │
│ ✓ Branch protection enabled (manual)                                        │
│ ✓ Dependabot security updates enabled (manual)                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Expected Score After Completion

```
┌─────────────────────────┬─────────┬─────────┬────────────────────────────────┐
│ Category                │ Current │ Target  │ Improvement                    │
├─────────────────────────┼─────────┼─────────┼────────────────────────────────┤
│ CLAUDE.md Quality       │  8.5/10 │ 10/10   │ Accurate line counts           │
│ Build System            │  4.5/5  │  5/5    │ Formatter integrated           │
│ Testing Infrastructure  │  2/5    │  4/5    │ Coverage tracking              │
│ Development Tooling     │  2.5/5  │  5/5    │ Prettier + pre-commit          │
│ Environment Setup       │  3/5    │  5/5    │ Devcontainer                   │
│ CI/CD Workflows         │  4/6    │  5/6    │ CodeQL added                   │
│ Security Configuration  │  4/6    │  6/6    │ Branch protection + security   │
│ Observability           │  1/6    │  3/6    │ Sentry (optional)              │
├─────────────────────────┼─────────┼─────────┼────────────────────────────────┤
│ OVERALL READINESS       │  85%    │  95%+   │ +10%                           │
└─────────────────────────┴─────────┴─────────┴────────────────────────────────┘
```

---

## Notes

- Tasks 8-9 require GitHub admin access and must be done manually
- Task 10 (Sentry) is optional and requires external account setup
- All automated tasks (1-7) can be implemented and committed together
- Pre-commit hooks will enforce formatting going forward

---

## Automatable vs Manual Tasks

| Task                   | Type      | Can Be Automated |
| ---------------------- | --------- | ---------------- |
| 1. Prettier            | Code      | ✓ Yes            |
| 2. Pre-commit          | Code      | ✓ Yes            |
| 3. Coverage            | Code      | ✓ Yes            |
| 4. CLAUDE.md           | Code      | ✓ Yes            |
| 5. CONTRIBUTING.md     | Code      | ✓ Yes            |
| 6. CodeQL              | Code      | ✓ Yes            |
| 7. Devcontainer        | Code      | ✓ Yes            |
| 8. Branch Protection   | GitHub UI | ✗ Manual         |
| 9. Dependabot Security | GitHub UI | ✗ Manual         |
| 10. Sentry             | External  | ✗ Manual         |
