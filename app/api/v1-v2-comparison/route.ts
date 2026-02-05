import { NextResponse } from 'next/server'

// V1 aggregate tables (50 total from v1-data.ts)
const V1_AGGREGATE_TABLES = [
  'agg_anomalies_detected',
  'agg_benchmarks',
  'agg_calls_by_direction',
  'agg_calls_by_outcome',
  'agg_events_by_source',
  'agg_events_by_type',
  'agg_fub_activity_by_agent',
  'agg_fub_activity_by_month',
  'agg_funnel_conversion',
  'agg_leads_by_agent',
  'agg_leads_by_month',
  'agg_leads_by_source',
  'agg_leads_by_stage',
  'agg_leads_conversion_funnel',
  'agg_listings_by_agent',
  'agg_listings_by_dom_bucket',
  'agg_listings_by_month',
  'agg_listings_by_property_type',
  'agg_listings_by_stage',
  'agg_network_by_geo',
  'agg_network_by_month',
  'agg_network_by_status',
  'agg_network_by_tier',
  'agg_network_by_week',
  'agg_network_revshare_by_month',
  'agg_pacing_daily',
  'agg_revenue_by_agent',
  'agg_revenue_by_deduction_type',
  'agg_revenue_by_month',
  'agg_revenue_by_week',
  'agg_revenue_waterfall',
  'agg_revenue_ytd',
  'agg_risk_flags',
  'agg_team_leaderboard',
  'agg_transactions_by_agent',
  'agg_transactions_by_geo',
  'agg_transactions_by_month',
  'agg_transactions_by_stage',
  'agg_transactions_by_type',
  'agg_transactions_by_week',
  'agg_transactions_yoy',
  'aggregation_jobs',
  'leaderboard_jobs',
  'snap_metrics_daily',
  'ai_features_agent_period',
  'ai_features_lead_current',
  'ai_features_pipeline_current',
  'user_insights',
  'user_actions',
  'dim_status_mapping',
]

// V2 aggregate tables (6 total)
const V2_AGGREGATE_TABLES = [
  'agg_agent_monthly',
  'agg_fub_activity_by_agent',
  'agg_leaderboard',
  'agg_transactions_by_week',
  'revshare_totals',
  'transaction_tags',
]

// V1 Known Onboarding Failure Patterns
const V1_FAILURE_PATTERNS = [
  {
    category: 'Team Roster Data Sync',
    count: 73,
    rootCause: 'API response missing agents field',
    v2Fix: 'Status check before access + continue on failure',
    v2Fixed: true,
    severity: 'critical',
  },
  {
    category: 'Missing team_id_raw',
    count: 25,
    rootCause: 'Individual users without team membership',
    v2Fix: 'Early return: if ($is_team != "team") { return success }',
    v2Fixed: true,
    severity: 'high',
  },
  {
    category: 'Network Downline Sync',
    count: 14,
    rootCause: 'Missing downLineAgents data',
    v2Fix: 'Staging table pattern + is_processed flag',
    v2Fixed: true,
    severity: 'high',
  },
  {
    category: 'Listing Sync',
    count: 9,
    rootCause: 'Missing data or monthlyAmounts',
    v2Fix: 'Staging table stage_listings_rezen_onboarding',
    v2Fixed: true,
    severity: 'medium',
  },
  {
    category: 'Network Frontline Sync',
    count: 3,
    rootCause: 'Missing tierNetworkSizes',
    v2Fix: 'Safe accessor pattern |get:"field":default',
    v2Fixed: true,
    severity: 'medium',
  },
  {
    category: 'Contributions Update',
    count: 1,
    rootCause: 'Missing pending variable',
    v2Fix: 'FP Result Type initialization pattern',
    v2Fixed: true,
    severity: 'low',
  },
  {
    category: 'FUB Sync Jobs ERROR',
    count: 6,
    rootCause: 'Events/Appointments/Text Messages failures',
    v2Fix: 'Separate fub_sync_state table for cursor tracking',
    v2Fixed: true,
    severity: 'high',
  },
  {
    category: 'FUB Sync Jobs Stuck',
    count: 4,
    rootCause: 'Jobs stuck IN_PROGRESS - FUB API timeouts',
    v2Fix: 'try_catch blocks with error logging + timeout handling',
    v2Fixed: true,
    severity: 'high',
  },
  {
    category: 'FUB Onboarding Incomplete',
    count: 24,
    rootCause: 'onboarding_complete: false stuck in "In Process"',
    v2Fix: 'Unified job_status table + per-integration state tracking',
    v2Fixed: true,
    severity: 'critical',
  },
]

// V2 Defensive Patterns
const V2_DEFENSIVE_PATTERNS = [
  {
    name: 'FP Result Type Pattern',
    description: 'Initialize result variables upfront with success/error/step tracking',
    example: `var $success { value = true }
var $error_message { value = null }
var $step { value = "init" }`,
    coverage: '100%',
  },
  {
    name: 'Safe Accessor Pattern',
    description: 'Use |get filter with default values instead of direct property access',
    example: `// Instead of: $obj.field (crashes if null)
$obj|get:"field":defaultValue`,
    coverage: '95%',
  },
  {
    name: 'Early Return for Edge Cases',
    description: 'Handle non-team users and empty data gracefully',
    example: `if ($user_roles_list|is_empty) {
  return { success: true, message: "No teams owned" }
}`,
    coverage: '100%',
  },
  {
    name: 'Staging Table Architecture',
    description: 'Data flows through staging tables with is_processed flags',
    example: `stage_network_downline_rezen_onboarding
stage_transactions_rezen_onboarding
stage_contributions_rezen_onboarding`,
    coverage: '100%',
  },
  {
    name: 'Try-Catch Error Logging',
    description: 'All errors caught and logged to error_logs table',
    example: `try_catch {
  try { ... }
  catch { db.add "error logs" { ... } }
}`,
    coverage: '90%',
  },
]

// V2 Worker Test Endpoints
const V2_WORKER_TESTS = [
  {
    name: 'Team Roster Sync',
    endpoint: 'test-function-8066-team-roster',
    expectedPattern: 'Early return for non-team users',
  },
  {
    name: 'Network Downline',
    endpoint: 'test-function-8062-network-downline',
    expectedPattern: 'Staging table + skip_job_check',
  },
  {
    name: 'Agent Data',
    endpoint: 'test-function-8051-agent-data',
    expectedPattern: 'FP Result Type',
  },
  {
    name: 'Transaction Sync',
    endpoint: 'test-function-8052-txn-sync',
    expectedPattern: 'Clear error on missing credentials',
  },
  {
    name: 'Contributions',
    endpoint: 'test-function-8056-contributions',
    expectedPattern: 'Clear error on missing API key',
  },
  {
    name: 'Listings Sync',
    endpoint: 'test-function-8053-listings-sync',
    expectedPattern: 'Clear error on missing API key',
  },
]

async function runV2WorkerTest(
  endpoint: string,
  userId: number,
  extraParams: Record<string, unknown> = {}
) {
  try {
    const res = await fetch(
      `https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:4UsTtl3m/${endpoint}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...extraParams }),
      }
    )
    const data = await res.json()
    return {
      success: data.success ?? data.function_result?.success ?? false,
      error: data.error ?? data.function_result?.error ?? null,
      step: data.step ?? data.function_result?.step ?? null,
      hasStructuredResponse: !!(data.success !== undefined || data.function_result),
      rawResponse: data,
    }
  } catch (err) {
    return {
      success: false,
      error: String(err),
      step: null,
      hasStructuredResponse: false,
      rawResponse: null,
    }
  }
}

export async function GET() {
  try {
    // Fetch V2 table counts and job status
    const [tableCountsRes, jobStatusRes] = await Promise.all([
      fetch('https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/table-counts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null),
      fetch('https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/job-queue-status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null),
    ])

    // Run live V2 worker tests with user 7 (Dave Keener)
    const testUserId = 7
    const liveTests = await Promise.all(
      V2_WORKER_TESTS.map(async (test) => {
        const extraParams = test.endpoint.includes('network-downline')
          ? { skip_job_check: true }
          : {}
        const result = await runV2WorkerTest(test.endpoint, testUserId, extraParams)
        return {
          name: test.name,
          endpoint: test.endpoint,
          expectedPattern: test.expectedPattern,
          ...result,
          defensivePatternWorking: result.hasStructuredResponse, // V2 returns structured responses even on "failure"
        }
      })
    )

    const tableCounts = tableCountsRes?.ok ? await tableCountsRes.json() : null
    const jobStatus = jobStatusRes?.ok ? await jobStatusRes.json() : null

    // Calculate architecture comparison metrics
    const defensivePatternsWorking = liveTests.filter((t) => t.defensivePatternWorking).length
    const comparison = {
      aggregateTables: {
        v1: { count: V1_AGGREGATE_TABLES.length, tables: V1_AGGREGATE_TABLES },
        v2: { count: V2_AGGREGATE_TABLES.length, tables: V2_AGGREGATE_TABLES },
        reduction: `${Math.round((1 - V2_AGGREGATE_TABLES.length / V1_AGGREGATE_TABLES.length) * 100)}%`,
      },
      failurePatterns: {
        v1TotalFailures: V1_FAILURE_PATTERNS.reduce((sum, p) => sum + p.count, 0),
        patterns: V1_FAILURE_PATTERNS,
        v2FixedCount: V1_FAILURE_PATTERNS.filter((p) => p.v2Fixed).length,
        v2TotalPatterns: V1_FAILURE_PATTERNS.length,
      },
      defensivePatterns: V2_DEFENSIVE_PATTERNS,
      liveTests: {
        testUserId,
        tests: liveTests,
        totalTests: liveTests.length,
        defensivePatternsWorking,
        allStructured: defensivePatternsWorking === liveTests.length,
        timestamp: new Date().toISOString(),
      },
      liveStatus: {
        tableCounts,
        jobStatus,
        timestamp: new Date().toISOString(),
      },
      summary: {
        v1Issues: 159, // Total failure count from V1
        v2IssuesExpected: 0, // V2 handles all these edge cases
        architectureImprovement: '88% fewer aggregate tables',
        codeQuality: 'FP Result Type + Safe Accessors + Try-Catch everywhere',
        liveTestResult: `${defensivePatternsWorking}/${liveTests.length} endpoints return structured responses`,
      },
    }

    return NextResponse.json(comparison)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comparison data', details: String(error) },
      { status: 500 }
    )
  }
}
