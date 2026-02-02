'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Diagram } from '@/components/ui/diagram'
import {
  generateSystemArchitectureDiagram,
  generateUserLoginDataFlow,
  generateTransactionCreationFlow,
  generateDataSyncFlow,
  generateTeamManagementFlow,
  XANO_API_GROUPS,
  SYSTEM_COMPONENTS,
  DATA_FLOWS,
  TECHNOLOGY_STACK,
} from '@/lib/documentation/architecture-diagrams'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex-1 text-left">
          <h3 className="font-semibold flex items-center gap-2">
            {title}
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      </button>

      {isOpen && <div className="px-4 py-3 border-t bg-muted/20">{children}</div>}
    </div>
  )
}

export function ArchitectureTab() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="api-groups">API Groups</TabsTrigger>
          <TabsTrigger value="data-flows">Data Flows</TabsTrigger>
          <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture Diagram</CardTitle>
              <CardDescription>
                High-level overview of all system components and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Diagram mermaidCode={generateSystemArchitectureDiagram()} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Architecture Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">API Groups</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {XANO_API_GROUPS.length} API groups providing{' '}
                    {XANO_API_GROUPS.reduce((sum, g) => sum + g.endpoints_count, 0)} total endpoints
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">System Components</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {SYSTEM_COMPONENTS.length} major components including frontend, backend,
                    database, and integrations
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Data Flows</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {DATA_FLOWS.length} documented data flows covering core business processes
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">External Services</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Stripe, Google Calendar, Cloud Storage, and more
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Points</CardTitle>
              <CardDescription>Where external systems connect to Xano V2</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-700">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Stripe Payments</h4>
                    <p className="text-sm text-muted-foreground">
                      Payment processing, invoice generation, and financial reconciliation via
                      webhook callbacks
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-green-700">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Google Calendar API</h4>
                    <p className="text-sm text-muted-foreground">
                      Event scheduling, meeting synchronization, and calendar notifications
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-purple-700">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Cloud Storage</h4>
                    <p className="text-sm text-muted-foreground">
                      Document storage, file management, and secure file serving
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-orange-700">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Email Services</h4>
                    <p className="text-sm text-muted-foreground">
                      Transactional emails, notifications, and bulk email campaigns
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Groups Tab */}
        <TabsContent value="api-groups" className="space-y-4">
          {XANO_API_GROUPS.map((group) => (
            <CollapsibleSection
              key={group.id}
              title={group.name}
              description={group.description}
              defaultOpen={group.id === 1}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">PATH</p>
                    <code className="text-sm bg-muted p-2 rounded block break-all">
                      {group.path}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">ENDPOINTS</p>
                    <p className="text-lg font-semibold">{group.endpoints_count}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      AUTHENTICATION
                    </p>
                    <Badge variant="secondary">{group.authentication || 'None'}</Badge>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">VERSION</p>
                    <Badge>{group.version}</Badge>
                  </div>
                </div>

                {group.components.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">COMPONENTS</p>
                    <div className="space-y-2">
                      {group.components.map((comp) => (
                        <div
                          key={comp.id}
                          className="flex items-start gap-2 p-2 bg-muted/50 rounded"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{comp.name}</p>
                            <p className="text-xs text-muted-foreground">{comp.description}</p>
                          </div>
                          <Badge variant="outline" className="mt-0.5">
                            {comp.type}
                          </Badge>
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
        <TabsContent value="data-flows" className="space-y-4">
          {DATA_FLOWS.map((flow) => (
            <CollapsibleSection key={flow.id} title={flow.name} description={flow.description}>
              <div className="space-y-4">
                {flow.trigger && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1">TRIGGER</p>
                    <p className="text-sm text-blue-800">{flow.trigger}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">FLOW DIAGRAM</p>
                  {flow.id === 'user-login' && (
                    <Diagram mermaidCode={generateUserLoginDataFlow()} />
                  )}
                  {flow.id === 'transaction-creation' && (
                    <Diagram mermaidCode={generateTransactionCreationFlow()} />
                  )}
                  {flow.id === 'data-sync' && <Diagram mermaidCode={generateDataSyncFlow()} />}
                </div>

                {flow.steps && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">STEPS</p>
                    <ol className="space-y-2">
                      {flow.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-xs font-semibold text-muted-foreground min-w-fit">
                            {idx + 1}.
                          </span>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          ))}
        </TabsContent>

        {/* Tech Stack Tab */}
        <TabsContent value="tech-stack" className="space-y-4">
          {Object.entries(TECHNOLOGY_STACK).map(([key, section]) => (
            <CollapsibleSection key={key} title={section.title}>
              <div className="space-y-2">
                {section.technologies.map((tech, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {tech.name}
                        <span className="text-muted-foreground ml-2 text-xs font-normal">
                          v{tech.version}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">{tech.description}</p>
                    </div>
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
