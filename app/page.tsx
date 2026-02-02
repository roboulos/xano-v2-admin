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
} from 'lucide-react'

// Tabs
import { SchemaTab } from '@/components/machine-2/schema-tab'
import { BackendValidationTab } from '@/components/machine-2/backend-validation-tab'
import { LiveMigrationStatus } from '@/components/live-migration-status'
import { FunctionsTab } from '@/components/functions-tab'
import { BackgroundTasksTab } from '@/components/background-tasks-tab'
import { ParallelComparisonTab } from '@/components/parallel-comparison-tab'
import { ArchitectureTab } from '@/components/doc-tabs/architecture-tab'
import { EndpointCatalogTab } from '@/components/doc-tabs/endpoint-catalog-tab'

type ViewMode =
  | 'schema'
  | 'validation'
  | 'live'
  | 'functions'
  | 'tasks'
  | 'parallel'
  | 'architecture'
  | 'endpoints'

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('live')

  const viewModes = [
    { id: 'architecture' as ViewMode, label: 'Architecture', icon: BookOpen },
    { id: 'endpoints' as ViewMode, label: 'Endpoints', icon: Globe },
    { id: 'live' as ViewMode, label: 'Live Status', icon: Activity },
    { id: 'parallel' as ViewMode, label: 'Parallel Compare', icon: Columns },
    { id: 'functions' as ViewMode, label: 'Functions Deep Dive', icon: Code },
    { id: 'tasks' as ViewMode, label: 'Background Tasks', icon: Zap },
    { id: 'schema' as ViewMode, label: 'Schema Changes', icon: GitCompare },
    { id: 'validation' as ViewMode, label: 'Validation Status', icon: CheckCircle2 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Xano V2 Admin System</h1>
          <p className="text-muted-foreground">
            System documentation, migration tracking, and live verification tools
          </p>
        </div>

        {/* 2-Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg mb-6 w-fit">
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

        {/* Content */}
        <div className="mt-6">
          {viewMode === 'architecture' && <ArchitectureTab />}
          {viewMode === 'endpoints' && <EndpointCatalogTab />}
          {viewMode === 'live' && <LiveMigrationStatus />}
          {viewMode === 'parallel' && <ParallelComparisonTab />}
          {viewMode === 'functions' && <FunctionsTab />}
          {viewMode === 'tasks' && <BackgroundTasksTab />}
          {viewMode === 'schema' && <SchemaTab />}
          {viewMode === 'validation' && <BackendValidationTab />}
        </div>
      </div>
    </div>
  )
}
