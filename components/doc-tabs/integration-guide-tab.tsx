'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CodeBlock } from '@/components/ui/code-block'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">{integration.name}</h3>
            <Badge
              className={
                integration.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {integration.status}
            </Badge>
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
        <div className="px-4 py-4 border-t space-y-4 bg-muted/20">
          {/* Service URL */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">SERVICE URL</p>
            <a
              href={integration.service_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {integration.service_url}
            </a>
          </div>

          {/* Authentication */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">AUTHENTICATION</p>
            <Badge variant="secondary" className="mb-2">
              {integration.auth.type}
            </Badge>
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
          {integration.endpoints.length > 0 && (
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
          )}

          {/* Data Mapping */}
          {Object.keys(integration.data_mapping).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">DATA MAPPING</p>
              <div className="space-y-1 text-sm">
                {Object.entries(integration.data_mapping).map(([source, target], idx) => (
                  <div key={idx} className="p-2 bg-background rounded">
                    <code className="text-xs">{source}</code>
                    <span className="mx-2">→</span>
                    <code className="text-xs">{target}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sync Jobs */}
          {integration.sync_jobs.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                SYNC JOBS ({integration.sync_jobs.length})
              </p>
              <div className="space-y-2">
                {integration.sync_jobs.map((job, idx) => (
                  <div key={idx} className="p-2 bg-background rounded border text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{job.name}</span>
                      <Badge
                        className={
                          job.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{job.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Runs: {job.frequency}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Webhooks */}
          {integration.webhooks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
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
          )}

          {/* Code Example */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">CODE EXAMPLE</p>
            <CodeBlock code={authCode} language="typescript" />
          </div>
        </div>
      )}
    </div>
  )
}

export function IntegrationGuideTab() {
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null)

  const activeIntegrations = INTEGRATIONS.filter((i) => i.status === 'active')
  const totalEndpoints = INTEGRATIONS.reduce((sum, i) => sum + i.endpoints.length, 0)
  const totalWebhooks = INTEGRATIONS.reduce((sum, i) => sum + i.webhooks.length, 0)

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>External Integrations Overview</CardTitle>
          <CardDescription>List of all external systems integrated with Xano V2</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded">
              <p className="text-xs font-semibold text-muted-foreground">Total Integrations</p>
              <p className="text-lg font-bold mt-2">{INTEGRATIONS.length}</p>
            </div>
            <div className="p-3 border rounded">
              <p className="text-xs font-semibold text-muted-foreground">Active</p>
              <p className="text-lg font-bold mt-2">{activeIntegrations.length}</p>
            </div>
            <div className="p-3 border rounded">
              <p className="text-xs font-semibold text-muted-foreground">Total Endpoints</p>
              <p className="text-lg font-bold mt-2">{totalEndpoints}</p>
            </div>
            <div className="p-3 border rounded">
              <p className="text-xs font-semibold text-muted-foreground">Webhooks</p>
              <p className="text-lg font-bold mt-2">{totalWebhooks}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="active">Active Only</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {INTEGRATIONS.map((integration) => (
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
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 mt-4">
          {activeIntegrations.map((integration) => (
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
          ))}
        </TabsContent>
      </Tabs>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg">
            <p className="font-semibold text-sm mb-1">API Keys & Secrets</p>
            <p className="text-sm text-muted-foreground">
              Always store API keys in environment variables. Never commit secrets to version
              control.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="font-semibold text-sm mb-1">Webhook Security</p>
            <p className="text-sm text-muted-foreground">
              Verify webhook signatures to ensure authenticity. Implement retry logic for failed
              webhooks.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="font-semibold text-sm mb-1">Error Handling</p>
            <p className="text-sm text-muted-foreground">
              Implement exponential backoff for rate-limited APIs. Log errors for monitoring and
              debugging.
            </p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="font-semibold text-sm mb-1">Data Validation</p>
            <p className="text-sm text-muted-foreground">
              Validate all incoming data before storing. Maintain data consistency between systems.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
