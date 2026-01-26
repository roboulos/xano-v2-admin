# Contributing to xano-v2-admin

Thank you for your interest in contributing to the V1→V2 Migration Admin Interface.

## Development Setup

### Prerequisites

- Node.js 20 (see `.nvmrc`)
- pnpm package manager

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/xano-v2-admin.git
cd xano-v2-admin

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Start development server
pnpm dev
```

### Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_XANO_BASE_URL` - V2 Xano workspace URL
- `SNAPPY_CLI_PATH` (optional) - Path to snappy CLI for MCP integration

## Development Workflow

### Available Commands

```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage
```

### Validation Commands

Before submitting PRs that affect Xano integration:

```bash
pnpm validate:tables      # Validate table mappings (193 tables)
pnpm validate:functions   # Validate functions (270+ functions)
pnpm validate:endpoints   # Validate endpoints (801+ endpoints)
pnpm validate:references  # Validate table references (156+ refs)
pnpm validate:all         # Run all validators
```

## Code Style

- **Formatting**: Prettier (auto-enforced via pre-commit hook)
- **Linting**: ESLint with Next.js config
- **TypeScript**: Strict mode enabled

Pre-commit hooks automatically run lint-staged, which:

1. Runs ESLint with auto-fix on `.ts` and `.tsx` files
2. Formats all staged files with Prettier

## Pull Request Process

1. **Create a branch** from `main`
2. **Make your changes** following the code style guidelines
3. **Run validation** if your changes affect Xano integration
4. **Ensure tests pass**: `pnpm test`
5. **Ensure build passes**: `pnpm build`
6. **Submit PR** using the pull request template

### PR Checklist

- [ ] Code compiles without errors (`pnpm build`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Tests pass (`pnpm test`)
- [ ] Validation passes (if applicable)
- [ ] PR description explains the changes

## Architecture Overview

See `CLAUDE.md` for detailed architecture documentation including:

- V1 vs V2 workspace comparison
- Table mapping philosophy
- XanoScript patterns
- File structure

## Questions?

If you have questions about the codebase or contribution process, check:

- `CLAUDE.md` - Project architecture and patterns
- `PROJECT_HISTORY.md` - Timeline and context
