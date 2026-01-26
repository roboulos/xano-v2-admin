/**
 * V2 Pipeline Alerting System
 *
 * Monitors the V2 data pipelines and sends alerts when failures occur:
 * 1. Daily sync failures (FUB, reZEN, SkySlope)
 * 2. Staging backlog thresholds exceeded
 * 3. Background task failures
 * 4. Table count anomalies
 *
 * Alert destinations:
 * - Slack notification via unified webhook API
 * - Console output for local runs
 * - JSON report for CI/monitoring systems
 *
 * Usage:
 *   pnpm tsx scripts/validation/pipeline-alerting.ts           # Run full alert check
 *   pnpm tsx scripts/validation/pipeline-alerting.ts --dry-run # Check without sending alerts
 *   pnpm tsx scripts/validation/pipeline-alerting.ts --report   # Save report only
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

// V2 Configuration
const V2_CONFIG = {
  base_url: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io',
  api_groups: {
    tasks: 'api:4psV7fp6',
    workers: 'api:4UsTtl3m',
    system: 'api:LIdBL1AN',
    webhooks: 'api:XOwEm4wm',
  },
  test_user: { id: 60, name: 'David Keener', agent_id: 37208, team_id: 1 },
}

// Alert thresholds
const THRESHOLDS = {
  staging_backlog: {
    warning: 1000, // Warn if >1000 unprocessed records
    critical: 5000, // Critical if >5000 unprocessed records
  },
  sync_failure_rate: {
    warning: 0.1, // Warn if >10% failure rate
    critical: 0.3, // Critical if >30% failure rate
  },
  table_count_delta: {
    warning: 100, // Warn if daily delta >100
    critical: 500, // Critical if daily delta >500
  },
}

// Alert levels
type AlertLevel = 'info' | 'warning' | 'critical'

interface Alert {
  level: AlertLevel
  category: string
  message: string
  details: Record<string, any>
  timestamp: string
}

interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  message: string
  metrics: Record<string, any>
}

interface AlertReport {
  summary: {
    total_alerts: number
    critical: number
    warning: number
    info: number
    overall_health: 'healthy' | 'degraded' | 'unhealthy'
  }
  alerts: Alert[]
  health_checks: HealthCheck[]
  generated_at: string
  slack_notification_sent: boolean
}

/**
 * Execute curl request
 */
async function curl(
  url: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, any>
): Promise<{ status: number; data: any }> {
  let command: string
  if (method === 'POST' && body) {
    const bodyJson = JSON.stringify(body)
    command = `curl -s -w "\\n%{http_code}" -X POST "${url}" -H "Content-Type: application/json" -d '${bodyJson}'`
  } else {
    command = `curl -s -w "\\n%{http_code}" "${url}"`
  }

  try {
    const { stdout } = await execAsync(command, { timeout: 30000 })
    const lines = stdout.trim().split('\n')
    const status = parseInt(lines[lines.length - 1])
    const responseBody = lines.slice(0, -1).join('\n')

    try {
      return { status, data: JSON.parse(responseBody) }
    } catch {
      return { status, data: { raw: responseBody } }
    }
  } catch (error: any) {
    return { status: 0, data: { error: error.message } }
  }
}

/**
 * Check table counts for health
 */
async function checkTableCounts(): Promise<HealthCheck> {
  const url = `${V2_CONFIG.base_url}/${V2_CONFIG.api_groups.system}/table-counts`
  const { status, data } = await curl(url)

  if (status !== 200) {
    return {
      name: 'Table Counts',
      status: 'unhealthy',
      message: `Failed to fetch table counts: HTTP ${status}`,
      metrics: { error: data.error || 'Unknown error' },
    }
  }

  const metrics: Record<string, number> = {}
  const categories = ['core_tables', 'network_tables', 'staging_tables', 'fub_tables']
  for (const cat of categories) {
    if (data[cat]) {
      Object.entries(data[cat]).forEach(([key, val]) => {
        metrics[key] = val as number
      })
    }
  }

  return {
    name: 'Table Counts',
    status: 'healthy',
    message: `Retrieved counts for ${Object.keys(metrics).length} tables`,
    metrics,
  }
}

/**
 * Check staging table backlog
 */
async function checkStagingBacklog(): Promise<{ health: HealthCheck; alerts: Alert[] }> {
  const url = `${V2_CONFIG.base_url}/${V2_CONFIG.api_groups.system}/staging-unprocessed?user_id=${V2_CONFIG.test_user.id}`
  const { status, data } = await curl(url)

  const alerts: Alert[] = []

  if (status !== 200) {
    return {
      health: {
        name: 'Staging Backlog',
        status: 'unhealthy',
        message: `Failed to check staging: HTTP ${status}`,
        metrics: { error: data.error || 'Unknown error' },
      },
      alerts: [
        {
          level: 'warning',
          category: 'staging',
          message: 'Unable to check staging table backlog',
          details: { status, error: data.error },
          timestamp: new Date().toISOString(),
        },
      ],
    }
  }

  // Parse staging data - format varies based on endpoint response
  const stagingCounts: Record<string, number> = {}
  let totalUnprocessed = 0

  // Handle various response formats
  if (data.unprocessed_counts) {
    Object.entries(data.unprocessed_counts).forEach(([key, val]) => {
      stagingCounts[key] = val as number
      totalUnprocessed += val as number
    })
  } else if (data.summary) {
    stagingCounts.total = data.summary.total_unprocessed || 0
    totalUnprocessed = stagingCounts.total
  } else if (typeof data === 'object') {
    // Try to extract counts from any format
    Object.entries(data).forEach(([key, val]) => {
      if (typeof val === 'number') {
        stagingCounts[key] = val
        totalUnprocessed += val
      }
    })
  }

  // Generate alerts based on thresholds
  let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  if (totalUnprocessed >= THRESHOLDS.staging_backlog.critical) {
    healthStatus = 'unhealthy'
    alerts.push({
      level: 'critical',
      category: 'staging',
      message: `Critical staging backlog: ${totalUnprocessed} unprocessed records`,
      details: { total: totalUnprocessed, breakdown: stagingCounts },
      timestamp: new Date().toISOString(),
    })
  } else if (totalUnprocessed >= THRESHOLDS.staging_backlog.warning) {
    healthStatus = 'degraded'
    alerts.push({
      level: 'warning',
      category: 'staging',
      message: `Staging backlog growing: ${totalUnprocessed} unprocessed records`,
      details: { total: totalUnprocessed, breakdown: stagingCounts },
      timestamp: new Date().toISOString(),
    })
  }

  return {
    health: {
      name: 'Staging Backlog',
      status: healthStatus,
      message:
        totalUnprocessed === 0
          ? 'All staging records processed'
          : `${totalUnprocessed} records pending processing`,
      metrics: stagingCounts,
    },
    alerts,
  }
}

/**
 * Check onboarding job status
 */
async function checkOnboardingStatus(): Promise<{ health: HealthCheck; alerts: Alert[] }> {
  const url = `${V2_CONFIG.base_url}/${V2_CONFIG.api_groups.system}/onboarding-status?user_id=${V2_CONFIG.test_user.id}`
  const { status, data } = await curl(url)

  const alerts: Alert[] = []

  if (status !== 200) {
    return {
      health: {
        name: 'Onboarding Jobs',
        status: 'unhealthy',
        message: `Failed to check onboarding: HTTP ${status}`,
        metrics: { error: data.error || 'Unknown error' },
      },
      alerts: [],
    }
  }

  // Parse onboarding status
  const jobStats = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    failed: 0,
  }

  // Handle various response formats
  if (data.jobs && Array.isArray(data.jobs)) {
    for (const job of data.jobs) {
      const status = (job.status || '').toLowerCase()
      if (status === 'new' || status === 'pending') jobStats.pending++
      else if (status === 'running' || status === 'in_progress') jobStats.in_progress++
      else if (status === 'complete' || status === 'completed') jobStats.completed++
      else if (status === 'failed' || status === 'error') jobStats.failed++
    }
  } else if (data.summary) {
    Object.assign(jobStats, data.summary)
  }

  // Generate alerts for failed jobs
  let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  if (jobStats.failed > 0) {
    healthStatus = 'degraded'
    alerts.push({
      level: 'warning',
      category: 'onboarding',
      message: `${jobStats.failed} onboarding jobs have failed`,
      details: jobStats,
      timestamp: new Date().toISOString(),
    })
  }

  return {
    health: {
      name: 'Onboarding Jobs',
      status: healthStatus,
      message: `${jobStats.completed} completed, ${jobStats.pending} pending, ${jobStats.failed} failed`,
      metrics: jobStats,
    },
    alerts,
  }
}

/**
 * Run daily sync endpoints and check for failures
 */
async function checkDailySyncHealth(): Promise<{ health: HealthCheck; alerts: Alert[] }> {
  const syncEndpoints = [
    {
      name: 'FUB Daily People',
      endpoint: '/test-function-7960-daily-update-people',
      group: 'tasks',
    },
    { name: 'reZEN Transactions', endpoint: '/test-task-8023', group: 'tasks' },
    { name: 'reZEN Listings', endpoint: '/test-task-8024', group: 'tasks' },
    { name: 'reZEN Network', endpoint: '/test-task-8025', group: 'tasks' },
    { name: 'SkySlope Users', endpoint: '/test-skyslope-account-users-sync', group: 'tasks' },
  ]

  const results: Array<{ name: string; success: boolean; error?: string }> = []
  const alerts: Alert[] = []

  for (const sync of syncEndpoints) {
    const url = `${V2_CONFIG.base_url}/${V2_CONFIG.api_groups[sync.group as keyof typeof V2_CONFIG.api_groups]}${sync.endpoint}`
    const { status, data } = await curl(url, 'POST', {})

    const success =
      status === 200 && (data.success === true || data.skipped === true || !data.error)

    results.push({
      name: sync.name,
      success,
      error: !success ? data.error || data.message || `HTTP ${status}` : undefined,
    })

    if (!success) {
      alerts.push({
        level: 'critical',
        category: 'daily_sync',
        message: `Daily sync failed: ${sync.name}`,
        details: { endpoint: sync.endpoint, status, error: data.error || data.message },
        timestamp: new Date().toISOString(),
      })
    }
  }

  const passed = results.filter((r) => r.success).length
  const failed = results.length - passed
  const failureRate = failed / results.length

  let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  if (failureRate >= THRESHOLDS.sync_failure_rate.critical) {
    healthStatus = 'unhealthy'
  } else if (failureRate >= THRESHOLDS.sync_failure_rate.warning) {
    healthStatus = 'degraded'
  }

  return {
    health: {
      name: 'Daily Sync',
      status: healthStatus,
      message: `${passed}/${results.length} sync steps passed`,
      metrics: {
        total: results.length,
        passed,
        failed,
        failure_rate: (failureRate * 100).toFixed(1) + '%',
        failed_steps: results.filter((r) => !r.success).map((r) => r.name),
      },
    },
    alerts,
  }
}

/**
 * Send Slack notification
 */
async function sendSlackAlert(alerts: Alert[]): Promise<boolean> {
  if (alerts.length === 0) return true

  const criticalCount = alerts.filter((a) => a.level === 'critical').length
  const warningCount = alerts.filter((a) => a.level === 'warning').length

  // Build Slack message
  const icon = criticalCount > 0 ? ':rotating_light:' : ':warning:'
  const title =
    criticalCount > 0
      ? `V2 Pipeline Alert: ${criticalCount} Critical Issues`
      : `V2 Pipeline Warning: ${warningCount} Issues Detected`

  let text = `${icon} *${title}*\n\n`

  // Group alerts by category
  const byCategory: Record<string, Alert[]> = {}
  for (const alert of alerts) {
    if (!byCategory[alert.category]) byCategory[alert.category] = []
    byCategory[alert.category].push(alert)
  }

  for (const [category, categoryAlerts] of Object.entries(byCategory)) {
    text += `*${category.toUpperCase()}*\n`
    for (const alert of categoryAlerts) {
      const levelIcon =
        alert.level === 'critical'
          ? ':red_circle:'
          : alert.level === 'warning'
            ? ':yellow_circle:'
            : ':white_circle:'
      text += `${levelIcon} ${alert.message}\n`
    }
    text += '\n'
  }

  text += `_Generated at ${new Date().toISOString()}_`

  const url = `${V2_CONFIG.base_url}/${V2_CONFIG.api_groups.webhooks}/slack/notification`
  const { status, data } = await curl(url, 'POST', { text })

  return status === 200 || status === 202
}

/**
 * Run all health checks and generate alerts
 */
async function runPipelineAlerts(options: {
  dryRun?: boolean
  reportOnly?: boolean
}): Promise<AlertReport> {
  console.log('=' + '='.repeat(79))
  console.log('V2 PIPELINE ALERTING SYSTEM')
  console.log('=' + '='.repeat(79))
  console.log(`\nTimestamp: ${new Date().toISOString()}`)
  console.log(`Mode: ${options.dryRun ? 'DRY RUN' : options.reportOnly ? 'REPORT ONLY' : 'LIVE'}`)
  console.log('')

  const allAlerts: Alert[] = []
  const healthChecks: HealthCheck[] = []

  // 1. Check table counts
  console.log('Checking table counts...')
  const tableHealth = await checkTableCounts()
  healthChecks.push(tableHealth)
  console.log(`  Status: ${tableHealth.status} - ${tableHealth.message}`)

  // 2. Check staging backlog
  console.log('\nChecking staging backlog...')
  const stagingResult = await checkStagingBacklog()
  healthChecks.push(stagingResult.health)
  allAlerts.push(...stagingResult.alerts)
  console.log(`  Status: ${stagingResult.health.status} - ${stagingResult.health.message}`)

  // 3. Check onboarding status
  console.log('\nChecking onboarding status...')
  const onboardingResult = await checkOnboardingStatus()
  healthChecks.push(onboardingResult.health)
  allAlerts.push(...onboardingResult.alerts)
  console.log(`  Status: ${onboardingResult.health.status} - ${onboardingResult.health.message}`)

  // 4. Check daily sync health (quick check, not full validation)
  console.log('\nChecking daily sync health...')
  const syncResult = await checkDailySyncHealth()
  healthChecks.push(syncResult.health)
  allAlerts.push(...syncResult.alerts)
  console.log(`  Status: ${syncResult.health.status} - ${syncResult.health.message}`)

  // Calculate overall health
  const unhealthyCount = healthChecks.filter((h) => h.status === 'unhealthy').length
  const degradedCount = healthChecks.filter((h) => h.status === 'degraded').length
  const overallHealth: 'healthy' | 'degraded' | 'unhealthy' =
    unhealthyCount > 0 ? 'unhealthy' : degradedCount > 0 ? 'degraded' : 'healthy'

  // Summary
  const criticalCount = allAlerts.filter((a) => a.level === 'critical').length
  const warningCount = allAlerts.filter((a) => a.level === 'warning').length
  const infoCount = allAlerts.filter((a) => a.level === 'info').length

  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log(`Overall Health: ${overallHealth.toUpperCase()}`)
  console.log(`Total Alerts: ${allAlerts.length}`)
  console.log(`  Critical: ${criticalCount}`)
  console.log(`  Warning: ${warningCount}`)
  console.log(`  Info: ${infoCount}`)

  // Display alerts
  if (allAlerts.length > 0) {
    console.log('\nAlerts:')
    for (const alert of allAlerts) {
      const icon =
        alert.level === 'critical'
          ? '[CRITICAL]'
          : alert.level === 'warning'
            ? '[WARNING]'
            : '[INFO]'
      console.log(`  ${icon} ${alert.category}: ${alert.message}`)
    }
  }

  // Send Slack notification (if not dry run and not report only)
  let slackSent = false
  if (!options.dryRun && !options.reportOnly && allAlerts.length > 0) {
    console.log('\nSending Slack notification...')
    slackSent = await sendSlackAlert(allAlerts)
    console.log(slackSent ? '  Slack notification sent' : '  Failed to send Slack notification')
  } else if (options.dryRun && allAlerts.length > 0) {
    console.log('\n[DRY RUN] Would send Slack notification with:')
    console.log(`  ${criticalCount} critical, ${warningCount} warning alerts`)
  }

  const report: AlertReport = {
    summary: {
      total_alerts: allAlerts.length,
      critical: criticalCount,
      warning: warningCount,
      info: infoCount,
      overall_health: overallHealth,
    },
    alerts: allAlerts,
    health_checks: healthChecks,
    generated_at: new Date().toISOString(),
    slack_notification_sent: slackSent,
  }

  return report
}

/**
 * Save alert report to file
 */
async function saveAlertReport(report: AlertReport): Promise<string> {
  const reportsDir = path.join(process.cwd(), 'validation-reports')
  await fs.mkdir(reportsDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `pipeline-alert-${timestamp}.json`
  const filepath = path.join(reportsDir, filename)

  await fs.writeFile(filepath, JSON.stringify(report, null, 2))
  console.log(`\nReport saved to: ${filepath}`)

  return filepath
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const reportOnly = args.includes('--report')

  try {
    const report = await runPipelineAlerts({ dryRun, reportOnly })
    await saveAlertReport(report)

    // Exit with error code if critical alerts
    if (report.summary.critical > 0) {
      process.exit(1)
    }
  } catch (error: any) {
    console.error(`\nFatal error: ${error.message}`)
    process.exit(1)
  }
}

main()
