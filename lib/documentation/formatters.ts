/**
 * Documentation Formatting Utilities
 *
 * Conversion and display formatting for documentation structures
 */

import type { EndpointDoc, TableDoc, IntegrationDoc, DataFlow, SystemArchitecture } from './types'

// ============================================================================
// ENDPOINT FORMATTERS
// ============================================================================

export function formatEndpointPath(method: string, path: string): string {
  const methodColor: Record<string, string> = {
    GET: 'text-blue-600',
    POST: 'text-green-600',
    PUT: 'text-yellow-600',
    PATCH: 'text-orange-600',
    DELETE: 'text-red-600',
  }

  return `[${method}] ${path}`
}

export function formatEndpointSignature(endpoint: EndpointDoc): string {
  const params = endpoint.parameters
    .map((p) => `${p.name}: ${p.type}${p.required ? '' : '?'}`)
    .join(', ')

  return `${endpoint.method} ${endpoint.path}(${params})`
}

export function formatEndpointUrl(baseUrl: string, endpoint: EndpointDoc): string {
  return `${baseUrl}${endpoint.path}`
}

export function formatEndpointCurl(baseUrl: string, endpoint: EndpointDoc): string {
  const url = formatEndpointUrl(baseUrl, endpoint)
  let curl = `curl -X ${endpoint.method} "${url}"`

  if (endpoint.authentication?.type === 'bearer') {
    curl += ' \\\n  -H "Authorization: Bearer YOUR_TOKEN"'
  }

  if (endpoint.request_body) {
    curl += ' \\\n  -H "Content-Type: application/json" \\\n  -d \'...\''
  }

  return curl
}

// ============================================================================
// TABLE FORMATTERS
// ============================================================================

export function formatTableSignature(table: TableDoc): string {
  const fields = table.fields.map((f) => `${f.name}: ${f.type}`).join(', ')
  return `table ${table.name} { ${fields} }`
}

export function formatFieldType(fieldType: string): string {
  const typeMap: Record<string, string> = {
    text: 'string',
    number: 'number',
    boolean: 'boolean',
    datetime: 'Date',
    json: 'object',
  }

  return typeMap[fieldType] || fieldType
}

export function formatTableStructure(table: TableDoc): string {
  let structure = `// ${table.name}\n`
  structure += 'interface ' + toPascalCase(table.name) + ' {\n'

  for (const field of table.fields) {
    structure += `  ${field.name}: ${formatFieldType(field.type)}${field.required ? '' : ' | null'}\n`
  }

  structure += '}'
  return structure
}

// ============================================================================
// INTEGRATION FORMATTERS
// ============================================================================

export function formatIntegrationStatus(integration: IntegrationDoc): string {
  const statusEmoji: Record<string, string> = {
    active: '🟢',
    inactive: '🔴',
    deprecated: '⚠️',
  }

  return `${statusEmoji[integration.status]} ${integration.name} (${integration.status})`
}

export function formatSyncJobStatus(lastRun?: string, nextRun?: string): string {
  if (lastRun && nextRun) {
    return `Last: ${new Date(lastRun).toLocaleDateString()} | Next: ${new Date(nextRun).toLocaleDateString()}`
  }
  return 'Not configured'
}

// ============================================================================
// DATA FLOW FORMATTERS
// ============================================================================

export function formatDataFlowSequence(flow: DataFlow): string {
  if (!flow.steps || flow.steps.length === 0) return 'No steps defined'

  return flow.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')
}

export function formatDataFlowMermaid(flow: DataFlow): string {
  if (flow.diagram_mmd) {
    return flow.diagram_mmd
  }

  // Generate basic Mermaid diagram if not provided
  let mermaid = 'graph LR\n'

  for (const node of flow.nodes) {
    const icon = getNodeIcon(node.type)
    mermaid += `  ${node.id}["${icon} ${node.label}"]\n`
  }

  for (const edge of flow.edges) {
    mermaid += `  ${edge.from} -->|${edge.label || 'data'}| ${edge.to}\n`
  }

  return mermaid
}

// ============================================================================
// ARCHITECTURE FORMATTERS
// ============================================================================

export function formatArchitectureOverview(arch: SystemArchitecture): string {
  let overview = `# ${arch.title}\n\n`

  if (arch.description) {
    overview += `${arch.description}\n\n`
  }

  overview += `## API Groups (${arch.api_groups.length})\n`
  for (const group of arch.api_groups) {
    overview += `- **${group.name}** (${group.endpoints_count} endpoints) - ${group.description || 'No description'}\n`
  }

  overview += `\n## Components (${arch.components.length})\n`
  for (const component of arch.components) {
    overview += `- **${component.name}** (${component.type}) - ${component.description || 'No description'}\n`
  }

  return overview
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function getNodeIcon(type: string): string {
  const icons: Record<string, string> = {
    user: '👤',
    service: '⚙️',
    database: '💾',
    external: '🌐',
  }
  return icons[type] || '📦'
}

// ============================================================================
// VALIDATION FORMATTERS
// ============================================================================

export function formatValidationRule(rule: string): string {
  // Parse common validation rule patterns
  if (rule.startsWith('max:')) {
    const max = rule.slice(4)
    return `Maximum length: ${max}`
  }
  if (rule.startsWith('min:')) {
    const min = rule.slice(4)
    return `Minimum length: ${min}`
  }
  if (rule === 'email') {
    return 'Valid email address required'
  }
  if (rule === 'unique') {
    return 'Must be unique in table'
  }
  return rule
}

// ============================================================================
// EXPORT FORMATTERS
// ============================================================================

export function formatAsMarkdownTable<T extends Record<string, any>>(
  data: T[],
  columns: (keyof T)[]
): string {
  if (data.length === 0) return 'No data'

  const headers = columns.join(' | ')
  const separator = columns.map(() => '---').join(' | ')
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col]
        return typeof value === 'object' ? JSON.stringify(value) : String(value)
      })
      .join(' | ')
  )

  return `| ${headers} |\n| ${separator} |\n${rows.map((r) => `| ${r} |`).join('\n')}`
}

export function formatAsJSON(data: any, pretty = true): string {
  return JSON.stringify(data, null, pretty ? 2 : 0)
}

export function formatAsCSV<T extends Record<string, any>>(
  data: T[],
  columns: (keyof T)[]
): string {
  const headers = columns.join(',')
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col]
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(',')
  )

  return `${headers}\n${rows.join('\n')}`
}
