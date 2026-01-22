# V2 Backend Validation Scripts

Comprehensive validation suite for the V2 Xano workspace migration.

## Overview

These scripts systematically validate ALL V2 backend components:
- ✅ **193 tables** - Schema, record counts, data integrity
- ✅ **971 functions** - Execution, logic, error handling
- ✅ **801 endpoints** - Response codes, performance, structure
- ✅ **Foreign keys** - Reference integrity, no orphans

## Quick Start

```bash
# Install dependencies
pnpm install

# Run all validations
pnpm run validate:all

# Or run individually
pnpm run validate:tables
pnpm run validate:functions
pnpm run validate:endpoints
pnpm run validate:references

# Run automated test suite
pnpm test
```

## Scripts

### 1. Table Validation (`validate-tables.ts`)

Tests all 193 V2 tables for existence, record counts, and schema integrity.

```bash
# Validate all tables
pnpm tsx scripts/validation/validate-tables.ts

# Validate by category
pnpm tsx scripts/validation/validate-tables.ts --category=core_identity
pnpm tsx scripts/validation/validate-tables.ts --category=transactions
pnpm tsx scripts/validation/validate-tables.ts --category=financial
pnpm tsx scripts/validation/validate-tables.ts --category=network

# Validate single table
pnpm tsx scripts/validation/validate-tables.ts --table=user
```

**Categories:**
- `core_identity` - user, agent, team tables (17 tables)
- `transactions` - transaction, participant tables (8 tables)
- `listings` - listing related tables (3 tables)
- `financial` - income, contribution, revshare (8 tables)
- `network` - network hierarchy (7 tables)
- `fub` - Follow Up Boss integration (14 tables)
- `integrations` - Rezen, SkySlope, DotLoop, Lofty (19 tables)
- `system` - audit, logs, jobs (10 tables)
- `configuration` - settings, templates (12 tables)

### 2. Function Validation (`validate-functions.ts`)

Tests all 971 V2 functions for execution without errors.

```bash
# Validate all active functions (skips ~700 archived)
pnpm tsx scripts/validation/validate-functions.ts

# Validate by API group
pnpm tsx scripts/validation/validate-functions.ts --api-group=workers
pnpm tsx scripts/validation/validate-functions.ts --api-group=frontend
pnpm tsx scripts/validation/validate-functions.ts --api-group=tasks
pnpm tsx scripts/validation/validate-functions.ts --api-group=system

# Validate by integration
pnpm tsx scripts/validation/validate-functions.ts --integration=fub
pnpm tsx scripts/validation/validate-functions.ts --integration=rezen
pnpm tsx scripts/validation/validate-functions.ts --integration=skyslope

# Validate by domain
pnpm tsx scripts/validation/validate-functions.ts --domain=transactions
pnpm tsx scripts/validation/validate-functions.ts --domain=network
pnpm tsx scripts/validation/validate-functions.ts --domain=revenue
```

**Function Distribution:**
- WORKERS: ~100 functions (background sync jobs)
- Frontend API v2: ~120 functions (production endpoints)
- TASKS: ~50 functions (orchestration)
- SYSTEM: ~38 functions (admin operations)
- SEEDING: ~24 functions (demo data)
- Archive/*: ~700 functions (reference only, not tested)

### 3. Endpoint Integration Testing (`validate-endpoints.ts`)

Tests all 801 V2 endpoints across 5 API groups.

```bash
# Validate all endpoints
pnpm tsx scripts/validation/validate-endpoints.ts

# Validate by API group
pnpm tsx scripts/validation/validate-endpoints.ts --api-group=frontend
pnpm tsx scripts/validation/validate-endpoints.ts --api-group=workers
pnpm tsx scripts/validation/validate-endpoints.ts --api-group=tasks

# Validate single endpoint
pnpm tsx scripts/validation/validate-endpoints.ts --endpoint=/roster
pnpm tsx scripts/validation/validate-endpoints.ts --endpoint=/transactions/all

# Validate critical production endpoints only
pnpm tsx scripts/validation/validate-endpoints.ts --critical
```

**Endpoint Distribution:**
- Frontend API v2: 200 endpoints (production)
- WORKERS: 374 endpoints (background jobs)
- TASKS: 165 endpoints (orchestration)
- SYSTEM: 38 endpoints (admin)
- SEEDING: 24 endpoints (demo data)

### 4. Table Reference Validation (`validate-references.ts`)

Validates all foreign key relationships in normalized schema.

```bash
# Validate all table references
pnpm tsx scripts/validation/validate-references.ts

# Validate by relationship
pnpm tsx scripts/validation/validate-references.ts --relationship=user
pnpm tsx scripts/validation/validate-references.ts --relationship=agent
pnpm tsx scripts/validation/validate-references.ts --relationship=transaction

# Validate specific table's references
pnpm tsx scripts/validation/validate-references.ts --table=transaction_financials
```

**Key Relationships Tested:**
- `user` → 5 related tables (credentials, settings, roles, subscriptions)
- `agent` → 5 related tables (cap_data, commission, hierarchy, performance)
- `transaction` → 4 related tables (financials, history, participants, tags)
- `team` → 7 related tables (members, settings, admins, owners)
- `listing` → 3 related tables (history, photos)

## Automated Test Suite

Run comprehensive integration tests with vitest:

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run specific test suite
pnpm test -- --grep "Tables"
pnpm test -- --grep "Functions"
pnpm test -- --grep "Endpoints"
pnpm test -- --grep "References"

# Run specific test
pnpm test -- --grep "should have all 193 tables"
```

## Reports

All validation runs generate JSON reports in `validation-reports/`:

```
validation-reports/
├── table-validation-2026-01-22T10-30-00.json
├── function-validation-workers-2026-01-22T10-35-00.json
├── endpoint-validation-2026-01-22T11-00-00.json
└── reference-validation-2026-01-22T11-30-00.json
```

Each report includes:
- Summary (total, passed, failed, pass rate)
- Individual results with metadata
- Duration and performance metrics

## Success Criteria

| Component | Target | Status |
|-----------|--------|--------|
| Tables | 100% valid | ✅ 193/193 |
| Functions | 95%+ pass | 🔄 Testing |
| Endpoints | 96%+ pass | 🔄 Testing |
| References | 100% integrity | 🔄 Testing |
| **Overall** | **98%+ score** | 🔄 In Progress |

## Performance Targets

- **Tables**: < 30s per category
- **Functions**: < 10min per API group
- **Endpoints**: < 2s response time each
- **References**: < 5min for full check

## Troubleshooting

### xano-mcp Not Found

Install Xano MCP CLI:
```bash
npm install -g @xano-mcp/cli
```

### Timeout Errors

Increase timeout in vitest.config.ts:
```typescript
testTimeout: 120000 // 2 minutes
```

### Authentication Errors

Ensure V2_CONFIG.test_user is valid:
- User ID: 60 (David Keener)
- Agent ID: 37208
- Team ID: 1

### Report Not Generated

Check `validation-reports/` directory exists:
```bash
mkdir -p validation-reports
```

## Next Steps

After validation completes:

1. **Phase 2**: Build Backend Validation Dashboard (xano-v2-admin)
2. **Phase 3**: Implement Parallel Integration (dashboards2.0)
3. **Phase 4**: Complete Cutover & V1 Deprecation

See main [Implementation Plan](../../IMPLEMENTATION_PLAN.md) for full details.
