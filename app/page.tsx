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
import { TransformationStoryTab } from '@/components/transformation-story-tab'
import { ArchitectureComparisonTab } from '@/components/architecture-comparison-tab'
import { ComparisonPanel } from '@/components/comparison-panel'
import { OnboardingStoryTab } from '@/components/story-tabs/onboarding-story-tab'
import { BackgroundTasksStoryTab } from '@/components/story-tabs/background-tasks-story-tab'
import { SyncPipelinesStoryTab } from '@/components/story-tabs/sync-pipelines-story-tab'
import { SchemaMappingStoryTab } from '@/components/story-tabs/schema-mapping-story-tab'
import { WebhooksStoryTab } from '@/components/story-tabs/webhooks-story-tab'
import { FunctionsStoryTab } from '@/components/story-tabs/functions-story-tab'

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

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('transformation')

  const viewModes = [
    { id: 'transformation' as ViewMode, label: 'Transformation Story', icon: Sparkles },
    { id: 'v1-v2-compare' as ViewMode, label: 'V1 vs V2', icon: Shield },
    { id: 'proof-system' as ViewMode, label: 'Proof System', icon: FlaskConical },
    { id: 'onboarding-story' as ViewMode, label: 'Onboarding Steps', icon: ListChecks },
    { id: 'bg-tasks-story' as ViewMode, label: 'Job Queues', icon: Timer },
    { id: 'sync-pipelines-story' as ViewMode, label: 'Sync Pipelines', icon: RefreshCw },
    { id: 'schema-mapping-story' as ViewMode, label: 'Schema Map', icon: Map },
    { id: 'webhooks-story' as ViewMode, label: 'Webhooks', icon: Webhook },
    { id: 'migration-status' as ViewMode, label: 'Phase Tracker', icon: TrendingUp },
    { id: 'gaps' as ViewMode, label: 'Gaps & Issues', icon: AlertCircle },
    { id: 'checklist' as ViewMode, label: 'Checklists', icon: CheckCircle2 },
    { id: 'blockers' as ViewMode, label: 'Blockers', icon: AlertTriangle },
    { id: 'architecture' as ViewMode, label: 'Architecture', icon: BookOpen },
    { id: 'endpoints' as ViewMode, label: 'Endpoints', icon: Globe },
    { id: 'data-model' as ViewMode, label: 'Data Model', icon: Database },
    { id: 'integrations' as ViewMode, label: 'Integrations', icon: Plug },
    { id: 'live' as ViewMode, label: 'Live Status', icon: Activity },
    { id: 'parallel' as ViewMode, label: 'Parallel Compare', icon: Columns },
    { id: 'functions' as ViewMode, label: 'Functions Deep Dive', icon: Code },
    { id: 'tasks' as ViewMode, label: 'Background Tasks', icon: Zap },
    { id: 'schema' as ViewMode, label: 'Schema Changes', icon: GitCompare },
    { id: 'validation' as ViewMode, label: 'Validation Status', icon: Layers },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Xano V2 Admin System</h1>
            <p className="text-muted-foreground">
              System documentation, migration tracking, and live verification tools
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <UserPicker />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="overflow-x-auto overflow-y-hidden -mx-4 px-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${
                  viewMode === mode.id
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <mode.icon className="h-4 w-4" />
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
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
          <ErrorBoundary title="Job Queues">
            {viewMode === 'bg-tasks-story' && <BackgroundTasksStoryTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Sync Pipelines">
            {viewMode === 'sync-pipelines-story' && <SyncPipelinesStoryTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Schema Map">
            {viewMode === 'schema-mapping-story' && <SchemaMappingStoryTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Webhooks">
            {viewMode === 'webhooks-story' && <WebhooksStoryTab />}
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
          <ErrorBoundary title="Architecture">
            {viewMode === 'architecture' && <ArchitectureTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Endpoint Catalog">
            {viewMode === 'endpoints' && <EndpointCatalogTab />}
          </ErrorBoundary>
          <ErrorBoundary title="Data Model">
            {viewMode === 'data-model' && <DataModelTab />}
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
