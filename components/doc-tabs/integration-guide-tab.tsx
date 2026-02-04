'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CodeBlock } from '@/components/ui/code-block'
import { MetricCard } from '@/components/ui/metric-card'
import { EmptyState } from '@/components/ui/empty-state'
import { SimpleStatusBadge } from '@/components/ui/status-badge'
import {
  ChevronDown,
  ChevronUp,
  Plug,
  Link2,
  Webhook,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

const INTEGRATIONS = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscription management',
    service_url: 'https://stripe.com',
    status: 'active' as const,
    auth: {
      type: 'api_key',
      description: 'API key stored in environment variables',
      setup_url: 'https://dashboard.stripe.com/apikeys',
    },
    endpoints: [
      { name: 'Create Payment', method: 'POST', path: '/v1/charges' },
      { name: 'List Payments', method: 'GET', path: '/v1/charges' },
      { name: 'Get Payment', method: 'GET', path: '/v1/charges/{id}' },
      { name: 'Refund Payment', method: 'POST', path: '/v1/refunds' },
    ],
    data_mapping: {
      'stripe.charge.succeeded': 'transactions table',
      'stripe.customer.created': 'payment_customers table',
      'stripe.subscription.created': 'subscriptions table',
    },
    sync_jobs: [
      {
        name: 'Sync Charges',
        frequency: 'every 1 hour',
        description: 'Sync payment records from Stripe',
        last_run: '2026-02-02T14:30:00Z',
        next_run: '2026-02-02T15:30:00Z',
        status: 'active',
      },
    ],
    webhooks: [
      { event: 'charge.succeeded', endpoint: '/webhooks/stripe/charge-succeeded' },
      { event: 'charge.refunded', endpoint: '/webhooks/stripe/charge-refunded' },
      { event: 'customer.created', endpoint: '/webhooks/stripe/customer-created' },
    ],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Schedule and calendar synchronization',
    service_url: 'https://calendar.google.com',
    status: 'active' as const,
    auth: {
      type: 'oauth',
      description: 'OAuth 2.0 PKCE flow with service account',
      setup_url: 'https://console.cloud.google.com',
    },
    endpoints: [
      { name: 'Create Event', method: 'POST', path: '/calendar/v3/calendars/{id}/events' },
      { name: 'List Events', method: 'GET', path: '/calendar/v3/calendars/{id}/events' },
      {
        name: 'Update Event',
        method: 'PATCH',
        path: '/calendar/v3/calendars/{id}/events/{eventId}',
      },
      {
        name: 'Delete Event',
        method: 'DELETE',
        path: '/calendar/v3/calendars/{id}/events/{eventId}',
      },
    ],
    data_mapping: {
      calendar_events: 'events table',
      attendees: 'event_attendees table',
      reminders: 'event_reminders table',
    },
    sync_jobs: [
      {
        name: 'Sync Calendar Events',
        frequency: 'every 30 minutes',
        description: 'Bidirectional sync of calendar events',
        last_run: '2026-02-02T14:15:00Z',
        next_run: '2026-02-02T14:45:00Z',
        status: 'active',
      },
    ],
    webhooks: [
      { event: 'events.created', endpoint: '/webhooks/calendar/event-created' },
      { event: 'events.updated', endpoint: '/webhooks/calendar/event-updated' },
    ],
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    description: 'Document and file storage',
    service_url: 'https://cloud.google.com/storage',
    status: 'active' as const,
    auth: {
      type: 'api_key',
      description: 'Service account JSON with bucket permissions',
      setup_url: 'https://console.cloud.google.com',
    },
    endpoints: [
      { name: 'Upload File', method: 'POST', path: '/upload/storage/v1/b/{bucket}/o' },
      { name: 'Download File', method: 'GET', path: '/storage/v1/b/{bucket}/o/{object}' },
      { name: 'Delete File', method: 'DELETE', path: '/storage/v1/b/{bucket}/o/{object}' },
      { name: 'List Files', method: 'GET', path: '/storage/v1/b/{bucket}/o' },
    ],
    data_mapping: {
      file_uploads: 'documents table',
      file_metadata: 'document_metadata table',
    },
    sync_jobs: [],
    webhooks: [],
  },
  {
    id: 'email-service',
    name: 'Email Service',
    description: 'Transactional and marketing email',
    service_url: 'https://sendgrid.com',
    status: 'active' as const,
    auth: {
      type: 'api_key',
      description: 'SendGrid API key in environment',
      setup_url: 'https://app.sendgrid.com/settings/api_keys',
    },
    endpoints: [
      { name: 'Send Email', method: 'POST', path: '/v3/mail/send' },
      { name: 'Get Email Stats', method: 'GET', path: '/v3/stats' },
    ],
    data_mapping: {
      email_events: 'email_logs table',
    },
    sync_jobs: [
      {
        name: 'Sync Email Events',
        frequency: 'every 15 minutes',
        description: 'Track email opens, clicks, bounces',
        status: 'active',
      },
    ],
    webhooks: [
      { event: 'email.opened', endpoint: '/webhooks/email/opened' },
      { event: 'email.clicked', endpoint: '/webhooks/email/clicked' },
      { event: 'email.bounced', endpoint: '/webhooks/email/bounced' },
    ],
  },
]

interface IntegrationDetailProps {
  integration: (typeof INTEGRATIONS)[0]
  isOpen: boolean
  onToggle: () => void
}

function IntegrationDetailView({ integration, isOpen, onToggle }: IntegrationDetailProps) {
  const authCode = `// Initialize ${integration.name} integration
const client = new ${integration.name.replace(/\s+/g, '')}Client({
  apiKey: process.env.${integration.id.toUpperCase()}_API_KEY,
})

// Example: Call endpoint
const response = await client.${Object.values(integration.endpoints)[0]?.name.toLowerCase().replace(/\s+/g, '_')}({
  // parameters
})
`

  return (
    <Card className={isOpen ? 'border-primary/30' : ''}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3">
            <Plug className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">{integration.name}</h3>
            <SimpleStatusBadge
              status={integration.status === 'active' ? 'resolved' : 'open'}
              className={integration.status === 'active' ? '' : ''}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <CardContent className="pt-0 space-y-4 bg-muted/20 border-t">
          {/* Service URL */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-1">SERVICE URL</p>
            <a
              href={integration.service_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <Link2 className="h-3 w-3" />
              {integration.service_url}
            </a>
          </div>

          {/* Authentication */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">AUTHENTICATION</p>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <Badge variant="secondary">{integration.auth.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{integration.auth.description}</p>
            <a
              href={integration.auth.setup_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Setup Guide →
            </a>
          </div>

          {/* Endpoints */}
          {integration.endpoints.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                ENDPOINTS ({integration.endpoints.length})
              </p>
              <div className="space-y-2">
                {integration.endpoints.map((ep, idx) => (
                  <div key={idx} className="p-2 bg-background rounded border text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {ep.method}
                      </Badge>
                      <code className="font-mono text-xs flex-1">{ep.path}</code>
                      <span className="text-muted-foreground">{ep.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">ENDPOINTS</p>
              <div className="p-4 bg-background rounded border text-center">
                <p className="text-sm text-muted-foreground">No endpoints documented</p>
              </div>
            </div>
          )}

          {/* Data Mapping */}
          {Object.keys(integration.data_mapping).length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">DATA MAPPING</p>
              <div className="space-y-1 text-sm">
                {Object.entries(integration.data_mapping).map(([source, target], idx) => (
                  <div key={idx} className="p-2 bg-background rounded flex items-center gap-2">
                    <code className="text-xs">{source}</code>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <code className="text-xs">{target}</code>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">DATA MAPPING</p>
              <div className="p-4 bg-background rounded border text-center">
                <p className="text-sm text-muted-foreground">No data mapping configured</p>
              </div>
            </div>
          )}

          {/* Sync Jobs */}
          {integration.sync_jobs.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <RefreshCw className="h-3 w-3" />
                SYNC JOBS ({integration.sync_jobs.length})
              </p>
              <div className="space-y-2">
                {integration.sync_jobs.map((job, idx) => (
                  <div key={idx} className="p-3 bg-background rounded border text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{job.name}</span>
                      <SimpleStatusBadge
                        status={job.status === 'active' ? 'resolved' : 'incomplete'}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{job.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Runs: {job.frequency}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <RefreshCw className="h-3 w-3" />
                SYNC JOBS
              </p>
              <div className="p-4 bg-background rounded border text-center">
                <p className="text-sm text-muted-foreground">No sync jobs configured</p>
              </div>
            </div>
          )}

          {/* Webhooks */}
          {integration.webhooks.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Webhook className="h-3 w-3" />
                WEBHOOKS ({integration.webhooks.length})
              </p>
              <div className="space-y-2">
                {integration.webhooks.map((webhook, idx) => (
                  <div key={idx} className="p-2 bg-background rounded border text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {webhook.event}
                      </Badge>
                      <code className="font-mono text-xs">{webhook.endpoint}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Webhook className="h-3 w-3" />
                WEBHOOKS
              </p>
              <div className="p-4 bg-background rounded border text-center">
                <p className="text-sm text-muted-foreground">No webhooks configured</p>
              </div>
            </div>
          )}

          {/* Code Example */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">CODE EXAMPLE</p>
            <CodeBlock code={authCode} language="typescript" />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function IntegrationGuideTab() {
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null)

  const activeIntegrations = INTEGRATIONS.filter((i) => i.status === 'active')
  const totalEndpoints = INTEGRATIONS.reduce((sum, i) => sum + i.endpoints.length, 0)
  const totalWebhooks = INTEGRATIONS.reduce((sum, i) => sum + i.webhooks.length, 0)
  const totalSyncJobs = INTEGRATIONS.reduce((sum, i) => sum + i.sync_jobs.length, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">External Integrations Guide</h2>
          <p className="text-muted-foreground">
            Configure and manage external service integrations with Xano V2
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Integrations"
            value={INTEGRATIONS.length}
            subtitle="External services"
            icon={<Plug className="h-4 w-4" />}
          />
          <MetricCard
            title="Active"
            value={activeIntegrations.length}
            subtitle={`${Math.round((activeIntegrations.length / INTEGRATIONS.length) * 100)}% active`}
            highlight={activeIntegrations.length === INTEGRATIONS.length}
          />
          <MetricCard
            title="API Endpoints"
            value={totalEndpoints}
            subtitle="Across all integrations"
            icon={<Link2 className="h-4 w-4" />}
          />
          <MetricCard
            title="Webhooks"
            value={totalWebhooks}
            subtitle={`${totalSyncJobs} sync jobs`}
            icon={<Webhook className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Alert if any integration is inactive */}
      {activeIntegrations.length < INTEGRATIONS.length && (
        <Card className="bg-yellow-50 border-yellow-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">
                  {INTEGRATIONS.length - activeIntegrations.length} Inactive Integration(s)
                </h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Some integrations require configuration or have been disabled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="active">Active Only</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {INTEGRATIONS.length > 0 ? (
            INTEGRATIONS.map((integration) => (
              <IntegrationDetailView
                key={integration.id}
                integration={integration}
                isOpen={expandedIntegration === integration.id}
                onToggle={() =>
                  setExpandedIntegration(
                    expandedIntegration === integration.id ? null : integration.id
                  )
                }
              />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={Plug}
                  title="No integrations configured"
                  description="External service integrations will appear here once configured"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-4">
          {activeIntegrations.length > 0 ? (
            activeIntegrations.map((integration) => (
              <IntegrationDetailView
                key={integration.id}
                integration={integration}
                isOpen={expandedIntegration === integration.id}
                onToggle={() =>
                  setExpandedIntegration(
                    expandedIntegration === integration.id ? null : integration.id
                  )
                }
              />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={Plug}
                  title="No active integrations"
                  description="Activate an integration to see it here"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Integration Best Practices
          </CardTitle>
          <CardDescription>
            Security guidelines and recommended patterns for external integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-muted/30 border-0">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-700">1</span>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">API Keys & Secrets</p>
                  <p className="text-sm text-muted-foreground">
                    Always store API keys in environment variables. Never commit secrets to version
                    control.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-0">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-green-700">2</span>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Webhook Security</p>
                  <p className="text-sm text-muted-foreground">
                    Verify webhook signatures to ensure authenticity. Implement retry logic for
                    failed webhooks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-0">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-orange-700">3</span>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Error Handling</p>
                  <p className="text-sm text-muted-foreground">
                    Implement exponential backoff for rate-limited APIs. Log errors for monitoring
                    and debugging.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-0">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-purple-700">4</span>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Data Validation</p>
                  <p className="text-sm text-muted-foreground">
                    Validate all incoming data before storing. Maintain data consistency between
                    systems.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
