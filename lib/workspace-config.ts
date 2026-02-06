/**
 * Workspace Configuration
 *
 * Centralized configuration for workspace instances and base URLs.
 * These values should never be exposed directly in client-visible UI text.
 */

export const WORKSPACE_CONFIG = {
  v1: {
    id: '1',
    instance: 'xmpx-swi5-tlvy.n7c.xano.io',
    adminBaseUrl: 'https://xmpx-swi5-tlvy.n7c.xano.io',
  },
  v2: {
    id: '5',
    instance: 'x2nu-xcjc-vhax.agentdashboards.xano.io',
    adminBaseUrl: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io',
    apiGroups: {
      workers: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m',
      tasks: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4psV7fp6',
      system: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN',
      seeding: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:2kCRUYxG',
      sync: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX',
    },
  },
} as const

/**
 * Get admin URL for a workspace (for "Open in Admin" buttons)
 */
export function getAdminUrl(workspace: '1' | '5', path: string): string {
  const config = workspace === '1' ? WORKSPACE_CONFIG.v1 : WORKSPACE_CONFIG.v2
  return `${config.adminBaseUrl}/admin/#/${config.id}/${path}`
}

/**
 * Get V2 API group base URL
 */
export function getV2ApiBase(group: keyof typeof WORKSPACE_CONFIG.v2.apiGroups): string {
  return WORKSPACE_CONFIG.v2.apiGroups[group]
}
