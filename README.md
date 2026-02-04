# V1 to V2 Migration Admin Interface

Admin interface for comparing and tracking migration from V1 Xano workspace (production) to V2 workspace (normalized, refactored).

## Overview

This is a **"Frontend Reveals Backend"** diagnostic tool - migration gaps become immediately visible by comparing two Xano workspaces side-by-side.

### Workspace Comparison

| Workspace           | Instance                                 | Tables | Status               |
| ------------------- | ---------------------------------------- | ------ | -------------------- |
| **V1** (Production) | `xmpx-swi5-tlvy.n7c.xano.io`             | 251    | Live production data |
| **V2** (Refactored) | `x2nu-xcjc-vhax.agentdashboards.xano.io` | 193    | Normalized schema    |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

## Available Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `pnpm dev`          | Start dev server (port 3000) |
| `pnpm build`        | Production build             |
| `pnpm lint`         | Run ESLint                   |
| `pnpm test`         | Run tests (Vitest)           |
| `pnpm validate:all` | Run all 4 validators         |

## Validation Pipeline

```bash
pnpm validate:tables      # 193 V2 tables - schema integrity
pnpm validate:functions   # 270 functions - business logic
pnpm validate:endpoints   # 801 endpoints - API contracts
pnpm validate:references  # 156 foreign keys - data integrity
```

## Tech Stack

- **Framework:** Next.js 16, React 19
- **Styling:** Tailwind CSS 4, ShadCN UI
- **Backend:** Xano via MCP
- **Testing:** Vitest

## Documentation

See [CLAUDE.md](./CLAUDE.md) for comprehensive documentation including:

- Table mapping philosophy
- API automation pipeline
- XanoScript patterns
- Endpoint reference

## Related Projects

- **dashboards2.0** - Production frontend BI platform
- **v0-demo-sync-admin-interface** - Demo data sync admin
