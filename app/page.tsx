'use client'

import { useState } from 'react'
import {
  GitCompare,
  CheckCircle2,
  Activity,
  Code,
  Zap,
  Columns,
  BookOpen,
  Globe,
  Database,
  Plug,
  TrendingUp,
  AlertTriangle,
  Layers,
  AlertCircle,
  Sparkles,
  Shield,
  FlaskConical,
  ListChecks,
  Timer,
  RefreshCw,
  Map,
  Webhook,
  HeartPulse,
  Building2,
  BarChart3,
  Users,
  Package,
} from 'lucide-react'

// UI Components
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { UserPicker } from '@/components/user-picker'

// Tabs
import { SchemaTab } from '@/components/machine-2/schema-tab'
import { BackendValidationTab } from '@/components/machine-2/backend-validation-tab'
import { LiveMigrationStatus } from '@/components/live-migration-status'
import { FunctionsTab } from '@/components/functions-tab'
import { BackgroundTasksTab } from '@/components/background-tasks-tab'
import { ParallelComparisonTab } from '@/components/parallel-comparison-tab'
import { ArchitectureTab } from '@/components/doc-tabs/architecture-tab'
import { EndpointCatalogTab } from '@/components/doc-tabs/endpoint-catalog-tab'
import { DataModelTab } from '@/components/doc-tabs/data-model-tab'
import { IntegrationGuideTab } from '@/components/doc-tabs/integration-guide-tab'
import { StatusDashboardTab } from '@/components/migration-tabs/status-dashboard-tab'
import { GapsTab } from '@/components/migration-tabs/gaps-tab'
import { ChecklistTab } from '@/components/migration-tabs/checklist-tab'
import { BlockersTab } from '@/components/migration-tabs/blockers-tab'
import { BulkMigrationTab } from '@/components/migration-tabs/bulk-migration-tab'
import { TransformationStoryTab } from '@/components/transformation-story-tab'
import { ArchitectureComparisonTab } from '@/components/architecture-comparison-tab'
import { ComparisonPanel } from '@/components/comparison-panel'
import { OnboardingStoryTab } from '@/components/story-tabs/onboarding-story-tab'
import { BackgroundTasksStoryTab } from '@/components/story-tabs/background-tasks-story-tab'
import { SyncPipelinesStoryTab } from '@/components/story-tabs/sync-pipelines-story-tab'
import { SchemaMappingStoryTab } from '@/components/story-tabs/schema-mapping-story-tab'
import { WebhooksStoryTab } from '@/components/story-tabs/webhooks-story-tab'
import { FunctionsStoryTab } from '@/components/story-tabs/functions-story-tab'
import { EcosystemHubTab } from '@/components/ecosystem/ecosystem-hub-tab'
import { RecordCensusTab } from '@/components/ecosystem/record-census-tab'
import { TestUsersTab } from '@/components/ecosystem/test-users-tab'

type ViewMode =
  | 'schema'
  | 'validation'
  | 'live'
  | 'functions'
  | 'tasks'
  | 'parallel'
  | 'architecture'
  | 'endpoints'
  | 'data-model'
  | 'integrations'
  | 'migration-status'
  | 'gaps'
  | 'checklist'
  | 'blockers'
  | 'transformation'
  | 'v1-v2-compare'
  | 'proof-system'
  | 'onboarding-story'
  | 'bg-tasks-story'
  | 'sync-pipelines-story'
  | 'schema-mapping-story'
  | 'webhooks-story'
  | 'functions-story'
  | 'ecosystem-hub'
  | 'record-census'
  | 'test-users'
  | 'bulk-migration'

interface TabEntry {
  id: ViewMode
  label: string
  icon: React.ComponentType<{ className?: string }>
}

type NavItem = TabEntry | { separator: string }

const NAV_ITEMS: NavItem[] = [
  // ── Big Picture ──
  { separator: 'Ecosystem' },
  { id: 'ecosystem-hub', label: 'Overview', icon: Building2 },
  { id: 'record-census', label: 'Record Census', icon: BarChart3 },
  { id: 'test-users', label: 'Test Users', icon: Users },

  // ── The Story ──
  { separator: 'Story' },
  { id: 'transformation', label: 'Transformation', icon: Sparkles },
  { id: 'v1-v2-compare', label: 'V1 vs V2', icon: Shield },

  // ── Live Proof ──
  { separator: 'Proof' },
  { id: 'proof-system', label: 'Proof System', icon: FlaskConical },
  { id: 'onboarding-story', label: 'Onboarding', icon: ListChecks },
  { id: 'schema-mapping-story', label: 'Schema Map', icon: Map },

  // ── Operations ──
  { separator: 'Operations' },
  { id: 'sync-pipelines-story', label: 'Sync Pipelines', icon: RefreshCw },
  { id: 'bg-tasks-story', label: 'Job Queues', icon: Timer },
  { id: 'webhooks-story', label: 'Webhooks', icon: Webhook },
  { id: 'functions-story', label: 'Functions', icon: HeartPulse },

  // ── Migration Management ──
  { separator: 'Migration' },
  { id: 'migration-status', label: 'Phase Tracker', icon: TrendingUp },
  { id: 'gaps', label: 'Gaps', icon: AlertCircle },
  { id: 'checklist', label: 'Checklists', icon: CheckCircle2 },
  { id: 'blockers', label: 'Blockers', icon: AlertTriangle },
  { id: 'bulk-migration', label: 'Bulk Copy', icon: Package },

  // ── Deep Dives ──
  { separator: 'Reference' },
  { id: 'architecture', label: 'Architecture', icon: BookOpen },
  { id: 'data-model', label: 'Data Model', icon: Database },
  { id: 'endpoints', label: 'Endpoints', icon: Globe },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'live', label: 'Live Status', icon: Activity },
  { id: 'parallel', label: 'Parallel Compare', icon: Columns },
  { id: 'functions', label: 'Functions Deep Dive', icon: Code },
  { id: 'tasks', label: 'Background Tasks', icon: Zap },
  { id: 'schema', label: 'Schema Changes', icon: GitCompare },
  { id: 'validation', label: 'Validation', icon: Layers },
]

function isSeparator(item: NavItem): item is { separator: string } {
  return 'separator' in item
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('ecosystem-hub')

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agent Dashboards Command Center</h1>
            <p className="text-muted-foreground">
              3 projects &middot; 2 Xano workspaces &middot; 25.4M records &middot; V1→V2 migration
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <UserPicker />
          </div>
        </div>

        {/* Tab Navigation — grouped with separators */}
        <div className="overflow-x-auto overflow-y-hidden -mx-4 px-4 mb-6">
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
            {NAV_ITEMS.map((item, i) => {
              if (isSeparator(item)) {
                return (
                  <div key={item.separator} className="flex items-center">
                    {i > 0 && <div className="w-px h-6 bg-border mx-1.5" />}
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 select-none">
                      {item.separator}
                    </span>
                  </div>
                )
              }
              return (
                <button
                  key={item.id}
                  onClick={() => setViewMode(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    viewMode === item.id
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          <ErrorBoundary title="Ecosystem Overview">
            {viewMode === 'ecosystem-hub' && <EcosystemHubTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Record Census">
            {viewMode === 'record-census' && <RecordCensusTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Test Users">
            {viewMode === 'test-users' && <TestUsersTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Transformation Story">
            {viewMode === 'transformation' && <TransformationStoryTab />}
          </ErrorBoundary>
          <ErrorBoundary title="V1 vs V2 Comparison">
            {viewMode === 'v1-v2-compare' && <ArchitectureComparisonTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Proof System">
            {viewMode === 'proof-system' && <ComparisonPanel />}
          </ErrorBoundary>
          <ErrorBoundary title="Onboarding Steps">
            {viewMode === 'onboarding-story' && <OnboardingStoryTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Schema Map">
            {viewMode === 'schema-mapping-story' && <SchemaMappingStoryTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Sync Pipelines">
            {viewMode === 'sync-pipelines-story' && <SyncPipelinesStoryTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Job Queues">
            {viewMode === 'bg-tasks-story' && <BackgroundTasksStoryTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Webhooks">
            {viewMode === 'webhooks-story' && <WebhooksStoryTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Function Health">
            {viewMode === 'functions-story' && <FunctionsStoryTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Migration Status">
            {viewMode === 'migration-status' && <StatusDashboardTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Gaps & Issues">{viewMode === 'gaps' && <GapsTab />}</ErrorBoundary>
          <ErrorBoundary title="Checklists">
            {viewMode === 'checklist' && <ChecklistTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Blockers">
            {viewMode === 'blockers' && <BlockersTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Bulk Migration">
            {viewMode === 'bulk-migration' && <BulkMigrationTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Architecture">
            {viewMode === 'architecture' && <ArchitectureTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Data Model">
            {viewMode === 'data-model' && <DataModelTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Endpoint Catalog">
            {viewMode === 'endpoints' && <EndpointCatalogTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Integration Guide">
            {viewMode === 'integrations' && <IntegrationGuideTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Live Status">
            {viewMode === 'live' && <LiveMigrationStatus />}
          </ErrorBoundary>
          <ErrorBoundary title="Parallel Compare">
            {viewMode === 'parallel' && <ParallelComparisonTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Functions">
            {viewMode === 'functions' && <FunctionsTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Background Tasks">
            {viewMode === 'tasks' && <BackgroundTasksTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Schema Changes">
            {viewMode === 'schema' && <SchemaTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Validation">
            {viewMode === 'validation' && <BackendValidationTab />}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
