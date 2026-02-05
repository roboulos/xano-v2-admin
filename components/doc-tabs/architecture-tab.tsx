'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Diagram } from '@/components/ui/diagram'
import { MetricCard } from '@/components/ui/metric-card'
import {
  generateSystemArchitectureDiagram,
  generateUserLoginDataFlow,
  generateTransactionCreationFlow,
  generateDataSyncFlow,
  XANO_API_GROUPS,
  DATA_FLOWS,
  TECHNOLOGY_STACK,
} from '@/lib/documentation/architecture-diagrams'
import {
  ChevronDown,
  ChevronUp,
  Server,
  Database,
  Globe,
  Layers,
  ArrowRightLeft,
  Zap,
  Shield,
  Clock,
  Code2,
  Workflow,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ReactNode
}

function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = true,
  icon,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <div>
            <h3 className="font-semibold flex items-center gap-2">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {isOpen && <div className="px-4 py-4 border-t bg-muted/10">{children}</div>}
    </div>
  )
}

// V1 vs V2 Comparison Data
const V1_VS_V2_COMPARISON = [
  {
    aspect: 'Tables',
    v1: '251 tables',
    v2: '193 tables',
    change: 'Normalized',
    status: 'improved',
    notes: 'Removed redundancy, proper 3NF normalization',
  },
  {
    aspect: 'API Groups',
    v1: '8 groups',
    v2: '12 groups',
    change: 'Reorganized',
    status: 'improved',
    notes: 'Better separation of concerns, clearer boundaries',
  },
  {
    aspect: 'Functions',
    v1: '~200 functions',
    v2: '270+ functions',
    change: 'Expanded',
    status: 'improved',
    notes: 'Better modularity, reusable components',
  },
  {
    aspect: 'Auth System',
    v1: 'Basic JWT',
    v2: 'Enhanced JWT + Session',
    change: 'Upgraded',
    status: 'improved',
    notes: 'FUB account integration, role-based access',
  },
  {
    aspect: 'Data Sync',
    v1: 'Manual triggers',
    v2: 'Background jobs',
    change: 'Automated',
    status: 'improved',
    notes: 'Scheduled sync, error handling, retry logic',
  },
  {
    aspect: 'Integrations',
    v1: 'FUB, Rezen',
    v2: 'FUB, Rezen, SkySlope, DotLoop, Lofty',
    change: 'Expanded',
    status: 'improved',
    notes: 'Full ecosystem coverage',
  },
]

// API Group Categories
const API_CATEGORIES = [
  {
    name: 'Authentication',
    icon: <Shield className="h-4 w-4" />,
    groups: ['Auth API'],
    description: 'User login, session management, JWT tokens',
  },
  {
    name: 'Core Data',
    icon: <Database className="h-4 w-4" />,
    groups: ['Main API V1.5', 'Transactions API V2'],
    description: 'Users, teams, transactions, listings',
  },
  {
    name: 'Background Jobs',
    icon: <Clock className="h-4 w-4" />,
    groups: ['Functions & Tasks'],
    description: 'Sync jobs, scheduled tasks, webhooks',
  },
  {
    name: 'External Services',
    icon: <Globe className="h-4 w-4" />,
    groups: ['Stripe', 'Google Calendar', 'Cloud Storage'],
    description: 'Third-party integrations',
  },
]

export function ArchitectureTab() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">System Architecture</h2>
          <p className="text-muted-foreground">
            Comprehensive overview of V2 system architecture, API groups, data flows, and technology
            stack
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard
            title="API Groups"
            value={XANO_API_GROUPS.length}
            subtitle={`${XANO_API_GROUPS.reduce((sum, g) => sum + g.endpoints_count, 0)} endpoints`}
            icon={<Server className="h-4 w-4" />}
          />
          <MetricCard
            title="V2 Tables"
            value="193"
            subtitle="Normalized schema"
            icon={<Database className="h-4 w-4" />}
          />
          <MetricCard
            title="Functions"
            value="270+"
            subtitle="XanoScript modules"
            icon={<Code2 className="h-4 w-4" />}
          />
          <MetricCard
            title="Data Flows"
            value={DATA_FLOWS.length}
            subtitle="Documented flows"
            icon={<Workflow className="h-4 w-4" />}
          />
          <MetricCard
            title="Integrations"
            value="5+"
            subtitle="External services"
            icon={<ExternalLink className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="v1-v2">V1 → V2</TabsTrigger>
          <TabsTrigger value="api-groups">API Groups</TabsTrigger>
          <TabsTrigger value="data-flows">Data Flows</TabsTrigger>
          <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Architecture Diagram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                System Architecture Diagram
              </CardTitle>
              <CardDescription>
                High-level overview of all system layers: Frontend → API → Backend → Database →
                External Services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Diagram mermaidCode={generateSystemArchitectureDiagram()} variant="ocean" />
            </CardContent>
          </Card>

          {/* Layer Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Architecture Layers</CardTitle>
              <CardDescription>How data flows through the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Frontend Layer */}
                <div
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    backgroundColor: 'var(--status-info-bg)',
                    borderLeftColor: 'var(--status-info)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Globe
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: 'var(--status-info)' }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--status-info)' }}>
                        1. Frontend Layer
                      </h4>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Next.js 16 admin UI with React 19, Tailwind CSS 4, and ShadCN components.
                        Communicates with backend via REST API calls.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">Next.js 16</Badge>
                        <Badge variant="secondary">React 19</Badge>
                        <Badge variant="secondary">TypeScript</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Layer */}
                <div
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    backgroundColor: 'var(--status-success-bg)',
                    borderLeftColor: 'var(--status-success)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Server
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: 'var(--status-success)' }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--status-success)' }}>
                        2. API Layer
                      </h4>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {XANO_API_GROUPS.length} API groups exposing{' '}
                        {XANO_API_GROUPS.reduce((sum, g) => sum + g.endpoints_count, 0)} REST
                        endpoints. JWT authentication with role-based access control.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">Auth API</Badge>
                        <Badge variant="secondary">Main API</Badge>
                        <Badge variant="secondary">Transactions API</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Backend Layer */}
                <div
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    backgroundColor: 'var(--status-warning-bg)',
                    borderLeftColor: 'var(--status-warning)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Zap
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: 'var(--status-warning)' }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--status-warning)' }}>
                        3. Backend Services
                      </h4>
                      <p className="text-sm mt-1 text-muted-foreground">
                        270+ XanoScript functions handling business logic, background jobs,
                        webhooks, and scheduled tasks. Includes sync pipelines for external data
                        sources.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">XanoScript</Badge>
                        <Badge variant="secondary">Background Jobs</Badge>
                        <Badge variant="secondary">Webhooks</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Layer */}
                <div
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    backgroundColor: 'var(--status-error-bg)',
                    borderLeftColor: 'var(--status-error)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Database
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: 'var(--status-error)' }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--status-error)' }}>
                        4. Data Layer
                      </h4>
                      <p className="text-sm mt-1 text-muted-foreground">
                        193 normalized tables in PostgreSQL-compatible database. Includes proper
                        foreign keys, indexes, and audit trails. Cache layer for performance.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">193 Tables</Badge>
                        <Badge variant="secondary">PostgreSQL</Badge>
                        <Badge variant="secondary">Cache</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* External Layer */}
                <div
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    backgroundColor: 'var(--status-pending-bg)',
                    borderLeftColor: 'var(--status-pending)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <ExternalLink
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: 'var(--status-pending)' }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--status-pending)' }}>
                        5. External Services
                      </h4>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Integration with external APIs: Stripe (payments), FUB (CRM), Rezen,
                        SkySlope, DotLoop, Lofty. Webhook-based communication for real-time updates.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">Stripe</Badge>
                        <Badge variant="secondary">FUB</Badge>
                        <Badge variant="secondary">Rezen</Badge>
                        <Badge variant="secondary">+3 more</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Categories Quick View */}
          <Card>
            <CardHeader>
              <CardTitle>API Category Overview</CardTitle>
              <CardDescription>How APIs are organized by function</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {API_CATEGORIES.map((category) => (
                  <div
                    key={category.name}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-primary">{category.icon}</span>
                      <h4 className="font-semibold">{category.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {category.groups.map((group) => (
                        <Badge key={group} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* V1 vs V2 Comparison Tab */}
        <TabsContent value="v1-v2" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                V1 → V2 Migration Comparison
              </CardTitle>
              <CardDescription>
                Key architectural changes between V1 and V2 workspaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-4 py-3 font-semibold">Aspect</th>
                      <th className="text-left px-4 py-3 font-semibold">V1 (Production)</th>
                      <th className="text-left px-4 py-3 font-semibold">V2 (Refactored)</th>
                      <th className="text-center px-4 py-3 font-semibold">Change</th>
                      <th className="text-left px-4 py-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {V1_VS_V2_COMPARISON.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{row.aspect}</td>
                        <td className="px-4 py-3 font-mono text-xs">{row.v1}</td>
                        <td className="px-4 py-3 font-mono text-xs">{row.v2}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            style={{
                              backgroundColor: 'var(--status-success-bg)',
                              color: 'var(--status-success)',
                              border: '1px solid var(--status-success-border)',
                            }}
                          >
                            {row.change}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Migration Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Migration Benefits</CardTitle>
              <CardDescription>Why the V2 architecture is better</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--status-success-bg)' }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: 'var(--status-success)' }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--status-success)' }}>
                        Data Normalization
                      </h4>
                      <p className="text-sm mt-1">
                        Reduced from 251 to 193 tables through proper 3NF normalization. Eliminates
                        data redundancy and improves consistency.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--status-success-bg)' }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: 'var(--status-success)' }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--status-success)' }}>
                        Better Modularity
                      </h4>
                      <p className="text-sm mt-1">
                        Functions split into Workers and Tasks for better separation. Clearer
                        ownership and easier maintenance.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--status-success-bg)' }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: 'var(--status-success)' }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--status-success)' }}>
                        Enhanced Security
                      </h4>
                      <p className="text-sm mt-1">
                        Improved JWT handling with FUB account integration. Role-based access
                        control with proper permission checks.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--status-success-bg)' }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: 'var(--status-success)' }}
                    />
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--status-success)' }}>
                        Automated Pipelines
                      </h4>
                      <p className="text-sm mt-1">
                        Background job system for data sync. Automatic error handling, retries, and
                        audit logging.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workspace Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" style={{ color: 'var(--status-warning)' }} />
                  V1 Workspace (Production)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instance:</span>
                  <code className="text-xs bg-muted px-2 py-0.5 rounded">
                    xmpx-swi5-tlvy.n7c.xano.io
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workspace ID:</span>
                  <span className="font-mono">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tables:</span>
                  <span className="font-semibold">251</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="secondary">Production</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--status-success)' }} />
                  V2 Workspace (Refactored)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instance:</span>
                  <code className="text-xs bg-muted px-2 py-0.5 rounded">
                    x2nu-xcjc-vhax.agentdashboards.xano.io
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workspace ID:</span>
                  <span className="font-mono">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tables:</span>
                  <span className="font-semibold">193</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    style={{
                      backgroundColor: 'var(--status-success-bg)',
                      color: 'var(--status-success)',
                    }}
                  >
                    Migration Target
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Groups Tab */}
        <TabsContent value="api-groups" className="space-y-4 mt-6">
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">API Groups Summary</CardTitle>
              <CardDescription>
                {XANO_API_GROUPS.length} groups •{' '}
                {XANO_API_GROUPS.reduce((sum, g) => sum + g.endpoints_count, 0)} total endpoints
              </CardDescription>
            </CardHeader>
          </Card>

          {XANO_API_GROUPS.map((group) => (
            <CollapsibleSection
              key={group.id}
              title={group.name}
              description={group.description}
              defaultOpen={group.id === 1}
              icon={<Server className="h-4 w-4" />}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">PATH</p>
                    <code className="text-xs break-all">{group.path}</code>
                  </div>
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">ENDPOINTS</p>
                    <p className="text-lg font-semibold">{group.endpoints_count}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">AUTH</p>
                    <Badge variant="secondary">{group.authentication || 'None'}</Badge>
                  </div>
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">VERSION</p>
                    <Badge>{group.version}</Badge>
                  </div>
                </div>

                {group.components.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      COMPONENTS ({group.components.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.components.map((comp) => (
                        <div
                          key={comp.id}
                          className="flex items-start gap-3 p-3 bg-background rounded-lg border"
                        >
                          <Code2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold truncate">{comp.name}</p>
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {comp.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {comp.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          ))}
        </TabsContent>

        {/* Data Flows Tab */}
        <TabsContent value="data-flows" className="space-y-4 mt-6">
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Documented Data Flows</CardTitle>
              <CardDescription>
                {DATA_FLOWS.length} core business processes with sequence diagrams
              </CardDescription>
            </CardHeader>
          </Card>

          {DATA_FLOWS.map((flow) => (
            <CollapsibleSection
              key={flow.id}
              title={flow.name}
              description={flow.description}
              icon={<Workflow className="h-4 w-4" />}
            >
              <div className="space-y-4">
                {flow.trigger && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--status-info-bg)',
                      border: '1px solid var(--status-info-border)',
                    }}
                  >
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{ color: 'var(--status-info)' }}
                    >
                      TRIGGER
                    </p>
                    <p className="text-sm">{flow.trigger}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    SEQUENCE DIAGRAM
                  </p>
                  {flow.id === 'user-login' && (
                    <Diagram mermaidCode={generateUserLoginDataFlow()} variant="neutral" />
                  )}
                  {flow.id === 'transaction-creation' && (
                    <Diagram mermaidCode={generateTransactionCreationFlow()} variant="forest" />
                  )}
                  {flow.id === 'data-sync' && (
                    <Diagram mermaidCode={generateDataSyncFlow()} variant="sunset" />
                  )}
                </div>

                {flow.steps && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      STEPS ({flow.steps.length})
                    </p>
                    <div className="space-y-2">
                      {flow.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <span
                            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                            style={{
                              backgroundColor: 'var(--status-info-bg)',
                              color: 'var(--status-info)',
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          ))}
        </TabsContent>

        {/* Tech Stack Tab */}
        <TabsContent value="tech-stack" className="space-y-4 mt-6">
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Technology Stack</CardTitle>
              <CardDescription>All technologies powering the V2 system</CardDescription>
            </CardHeader>
          </Card>

          {Object.entries(TECHNOLOGY_STACK).map(([key, section]) => (
            <CollapsibleSection
              key={key}
              title={section.title}
              icon={
                key === 'frontend' ? (
                  <Globe className="h-4 w-4" />
                ) : key === 'backend' ? (
                  <Server className="h-4 w-4" />
                ) : key === 'external' ? (
                  <ExternalLink className="h-4 w-4" />
                ) : (
                  <Zap className="h-4 w-4" />
                )
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.technologies.map((tech, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-background rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm">{tech.name}</p>
                      <Badge variant="outline" className="text-xs">
                        v{tech.version}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{tech.description}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
