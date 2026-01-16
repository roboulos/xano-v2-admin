// Workers/ Function Inventory for V2 Workspace (Workspace 5)
// These are Xano functions in the "Workers/" folder that process data
// Generated from Xano Meta API on 2026-01-16
// Total: 194 Workers/ functions

export interface WorkerFunction {
  id: number                    // Xano function ID
  name: string                  // Full path name (e.g., "Workers/FUB - Get Deals")
  shortName: string             // Display name without "Workers/" prefix
  domain: WorkerDomain          // Which integration/system this belongs to
  category: WorkerCategory      // Type of worker
  description: string           // What this function does
  tags: string[]                // Xano tags
  updatedAt: string             // Last updated timestamp
  status: "tested" | "untested" | "broken"  // Testing status
  lastTested?: string           // ISO date of last test
  notes?: string                // Additional notes
  expectedInputs: string[]      // Expected input parameters (derived from description/tags)
}

export type WorkerDomain =
  | "fub"           // Follow Up Boss
  | "rezen"         // reZEN brokerage API
  | "skyslope"      // SkySlope transaction management
  | "network"       // Network/downline processing
  | "title"         // Title company (Qualia)
  | "ad"            // AgentDashboards internal
  | "income"        // Income/contribution processing
  | "metrics"       // Metrics calculations
  | "auth"          // Authentication
  | "utility"       // General utilities
  | "linking"       // FK linking workers
  | "aggregation"   // Data aggregation

export type WorkerCategory =
  | "sync"          // Data synchronization
  | "transform"     // Data transformation
  | "upsert"        // Database upsert operations
  | "fix"           // Data repair/fix operations
  | "linking"       // FK linking operations
  | "orchestrator"  // Orchestration functions
  | "api-call"      // External API calls
  | "utility"       // General utilities
  | "email"         // Email operations
  | "audit"         // Audit/logging

// Helper to derive domain from function name
function deriveDomain(name: string): WorkerDomain {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("fub") || lowerName.includes("follow up boss")) return "fub"
  if (lowerName.includes("rezen")) return "rezen"
  if (lowerName.includes("skyslope")) return "skyslope"
  if (lowerName.includes("network") || lowerName.includes("downline") || lowerName.includes("frontline")) return "network"
  if (lowerName.includes("title") || lowerName.includes("qualia") || lowerName.includes("closing")) return "title"
  if (lowerName.includes("income") || lowerName.includes("contribution") || lowerName.includes("revshare")) return "income"
  if (lowerName.includes("metrics")) return "metrics"
  if (lowerName.includes("auth") || lowerName.includes("login")) return "auth"
  if (lowerName.includes("link") || lowerName.includes("linking")) return "linking"
  if (lowerName.includes("aggregat")) return "aggregation"
  if (lowerName.includes("utility") || lowerName.includes("batch")) return "utility"
  return "ad"
}

// Helper to derive category from function name
function deriveCategory(name: string, tags: string[]): WorkerCategory {
  const lowerName = name.toLowerCase()
  const lowerTags = tags.map(t => t.toLowerCase()).join(" ")

  if (lowerName.includes("upsert") || lowerTags.includes("upsert")) return "upsert"
  if (lowerName.includes("transform") || lowerTags.includes("transform")) return "transform"
  if (lowerName.includes("sync") || lowerName.includes("move") || lowerName.includes("process")) return "sync"
  if (lowerName.includes("fix") || lowerName.includes("missing") || lowerName.includes("repair") || lowerName.includes("backfill")) return "fix"
  if (lowerName.includes("link") || lowerTags.includes("linking")) return "linking"
  if (lowerName.includes("orchestrator") || lowerName.includes("run all") || lowerTags.includes("orchestrator")) return "orchestrator"
  if (lowerName.includes("get ") || lowerName.includes("fetch") || lowerName.includes("load")) return "api-call"
  if (lowerName.includes("email") || lowerName.includes("send")) return "email"
  if (lowerName.includes("audit") || lowerName.includes("log")) return "audit"
  return "utility"
}

// Helper to derive expected inputs from description and tags
function deriveExpectedInputs(description: string, tags: string[]): string[] {
  const inputs: string[] = []
  const combined = (description + " " + tags.join(" ")).toLowerCase()

  if (combined.includes("user_id") || combined.includes("user id")) inputs.push("user_id")
  if (combined.includes("agent_id") || combined.includes("agent id")) inputs.push("agent_id")
  if (combined.includes("team_id") || combined.includes("team id")) inputs.push("team_id")
  if (combined.includes("fub_account_id")) inputs.push("fub_account_id")
  if (combined.includes("function_id")) inputs.push("function_id")

  return inputs
}

// Domain configuration for UI display
export const WORKER_DOMAIN_CONFIG: Record<WorkerDomain, { name: string; color: string }> = {
  fub: { name: "FUB", color: "bg-blue-100 text-blue-800" },
  rezen: { name: "reZEN", color: "bg-purple-100 text-purple-800" },
  skyslope: { name: "SkySlope", color: "bg-green-100 text-green-800" },
  network: { name: "Network", color: "bg-orange-100 text-orange-800" },
  title: { name: "Title", color: "bg-pink-100 text-pink-800" },
  ad: { name: "AD Internal", color: "bg-gray-100 text-gray-800" },
  income: { name: "Income", color: "bg-yellow-100 text-yellow-800" },
  metrics: { name: "Metrics", color: "bg-cyan-100 text-cyan-800" },
  auth: { name: "Auth", color: "bg-red-100 text-red-800" },
  utility: { name: "Utility", color: "bg-slate-100 text-slate-800" },
  linking: { name: "Linking", color: "bg-indigo-100 text-indigo-800" },
  aggregation: { name: "Aggregation", color: "bg-emerald-100 text-emerald-800" },
}

// Category configuration for UI display
export const WORKER_CATEGORY_CONFIG: Record<WorkerCategory, { name: string }> = {
  sync: { name: "Sync" },
  transform: { name: "Transform" },
  upsert: { name: "Upsert" },
  fix: { name: "Fix/Repair" },
  linking: { name: "Linking" },
  orchestrator: { name: "Orchestrator" },
  "api-call": { name: "API Call" },
  utility: { name: "Utility" },
  email: { name: "Email" },
  audit: { name: "Audit" },
}

// Raw data from Xano Meta API
const RAW_WORKERS_DATA = [
  { id: 11168, name: "Workers/Test-Roster-Minimal", description: "Minimal test", tag: ["🤖 2026-01-15 22:25 PST"], updated_at: "2026-01-16 06:25:31+0000" },
  { id: 11162, name: "Workers/analyze_bug_report", description: "Analyzes bug reports using Claude AI. Gets bug record, calls Claude API to analyze severity/category/summary/fixes, updates bug's ai_analysis field. FP Result Type pattern.", tag: ["v3", "worker", "bugs", "ai-analysis", "fp-result-type", "claude", "🤖 2026-01-12 13:57 PST"], updated_at: "2026-01-12 21:57:27+0000" },
  { id: 11155, name: "Workers/create_github_issue", description: "FP Worker: Create GitHub issue from bug report. Result type: {success, data, error, step}. Uses $env.GITHUB_TOKEN and $env.GITHUB_REPO", tag: ["🤖 2026-01-12 13:52 PST"], updated_at: "2026-01-12 21:52:47+0000" },
  { id: 11110, name: "Workers/backfill_team_from_network_member", description: "FP Worker: Backfill team_id from network_member table. For agents without team_id, find their sponsor in network_member and copy team_id", tag: [], updated_at: "2025-12-30 05:22:58+0000" },
  { id: 11109, name: "Workers/find_team_from_sponsor_chain", description: "FP Worker: Find team_id by walking up sponsor chain to find team owner", tag: [], updated_at: "2025-12-30 05:17:23+0000" },
  { id: 11108, name: "Workers/find_team_for_agent", description: "Function Workers/find_team_for_agent", tag: [], updated_at: "2025-12-30 03:52:32+0000" },
  { id: 11094, name: "Workers/reZEN - Listing Details By Object", description: "V3 Worker: Process reZEN listing with address and participants. FP Pattern: Result type with {success, data, error, step}", tag: ["fp-pattern", "fp-result-type", "Workers", "reZEN", "V3", "By-Object", "created-2025-12-28", "team-owner-office-id-2025-12-28"], updated_at: "2025-12-28 23:43:12+0000" },
  { id: 11093, name: "Workers/Contributions - Duplicates", description: "V3 worker: Removes duplicate contribution records. FP Result Type pattern: {success, data, error, step}", tag: ["🤖 2026-01-16 00:02 PST"], updated_at: "2026-01-16 08:02:41+0000" },
  { id: 11025, name: "Workers/Agent - Sync Commission Configuration", description: "Syncs commission configuration from commission_plans table to agent_commission table for a single agent", tag: ["v3", "worker", "commission", "sync", "created-2025-12-23"], updated_at: "2025-12-23 17:47:44+0000" },
  { id: 10995, name: "Workers/Generate Audit Record", description: "Creates audit record comparing database counts for compliance tracking", tag: ["🤖 2026-01-15 23:57 PST"], updated_at: "2026-01-16 07:57:26+0000" },
  { id: 10993, name: "Workers/Title - Get Settlement Agencies", description: "Function Workers/Title - Get Settlement Agencies", tag: ["📊 v3", "📜 title", "⚙️ worker", "🏛️ qualia", "✨ created-2025-12-19"], updated_at: "2025-12-19 23:30:37+0000" },
  { id: 10991, name: "Workers/reZEN - Process Pending Contributions to Table", description: "V3 worker: Processes staged pending contributions into contributions_pending table", tag: ["v3", "rezen", "worker", "pending-contributions", "created-2025-12-19"], updated_at: "2025-12-19 23:16:31+0000" },
  { id: 10990, name: "Workers/Sync Pipeline Prospects from FUB Deals", description: "Syncs pipeline_prospects table from fub_deals - extracts prospect/lead data", tag: ["v3", "worker", "pipeline", "fub", "2025-12-19", "fixed-2025-12-21"], updated_at: "2025-12-21 07:04:10+0000" },
  { id: 10989, name: "Workers/Chart Transactions - Aggregate", description: "Function Workers/Chart Transactions - Aggregate", tag: ["💼 transaction", "📊 analytics", "🔧 worker"], updated_at: "2025-12-19 23:19:58+0000" },
  { id: 10988, name: "Workers/Title - Upsert Orders", description: "V3 Upsert - Writes transformed orders to title_orders table", tag: ["📊 v3", "📜 title", "⚙️ worker", "💾 upsert"], updated_at: "2025-12-19 22:55:56+0000" },
  { id: 10987, name: "Workers/Title - Populate Closing Disclosures", description: "Processes Qualia settlement statement data and populates closing_disclosure table", tag: ["v3", "title", "worker", "closing-disclosure", "created-2025-12-19"], updated_at: "2025-12-19 22:55:56+0000" },
  { id: 10986, name: "Workers/User Roles - Populate from User Data", description: "Populates user_roles table from user and agent data", tag: ["v3", "worker", "user_roles", "created-2025-12-19"], updated_at: "2025-12-19 22:58:24+0000" },
  { id: 10985, name: "Workers/Title - Transform Orders", description: "V3 Transform - Converts Qualia GraphQL orders to snake_case for title_orders table", tag: ["📊 v3", "📜 title", "⚙️ worker", "🔄 transform"], updated_at: "2025-12-19 23:03:47+0000" },
  { id: 10983, name: "Workers/reZEN - Get Agent Commission", description: "Function Workers/reZEN - Get Agent Commission", tag: ["v3", "rezen", "worker", "commission", "created-2025-12-19"], updated_at: "2025-12-19 19:57:52+0000" },
  { id: 10982, name: "Workers/reZEN - Get Cap Data for All Agents", description: "Function Workers/reZEN - Get Cap Data for All Agents. FP Result Type 2025-12-27: Returns {success, data, error, step}", tag: ["v3", "rezen", "worker", "cap_data", "fp-result-type"], updated_at: "2025-12-27 21:21:43+0000" },
  { id: 10981, name: "Workers/reZEN - Populate RevShare Payments", description: "V3 Worker: Fetch pending revshare payments from reZEN API and populate revshare_payments table. FP Result Type 2025-12-27", tag: ["v3", "rezen", "worker", "revshare-payments", "fp-result-type"], updated_at: "2025-12-27 21:28:29+0000" },
  { id: 10972, name: "Workers/FUB - Get Account Users - Paginated", description: "Orchestrator for paginated FUB user sync - fetches all users across 3 pages. Fixed: Now properly returns users_synced in result", tag: ["v3", "fub", "worker", "paginated", "fixed-bubbled-2025-12-28", "fp-result-type"], updated_at: "2025-12-28 07:58:33+0000" },
  { id: 10969, name: "Workers/Utility - Batch Process Contributions", description: "Batch process contributions in while loop until complete or max batches reached", tag: [], updated_at: "2025-12-19 08:03:47+0000" },
  { id: 10968, name: "Workers/Network - Pull Temp Data Fixed", description: "Pulls network downline from reZEN API to staging table. Based on Archive 5529.", tag: ["🌐 network", "⚙️ worker", "✅ fixed", "2025-12-19"], updated_at: "2025-12-19 08:02:23+0000" },
  { id: 10967, name: "Workers/Network - Get Downline Fixed", description: "🌐 network | ✅ fixed | 2025-12-19", tag: [], updated_at: "2025-12-19 07:55:01+0000" },
  { id: 10962, name: "Workers/reZEN - Get Agent Sponsor Tree v2", description: "V3 worker: Get agent sponsor tree for reZEN. AUTO-CREATES sponsor agent records if they don't exist. 100% improvement (10/10 sponsors linked).", tag: [], updated_at: "2025-12-19 07:38:48+0000" },
  { id: 10959, name: "Workers/Enrich Team Members from Agent Data", description: "Enriches team_members table with data from agent table. Populates: avatar and role indicators from agent.title", tag: ["v3", "worker", "team_members", "enrichment", "created-2025-12-19"], updated_at: "2025-12-19 06:42:55+0000" },
  { id: 10955, name: "Workers/Run All Linking Functions", description: "Orchestrator: Run All Linking Functions. FP REFACTOR 2025-12-27: Added Result type checking - stops on first failure", tag: ["worker", "linking", "orchestrator", "fp-pattern-2025-12-27"], updated_at: "2025-12-27 19:51:00+0000" },
  { id: 10954, name: "Workers/Link Equity Transactions to Transaction", description: "Links equity_transactions to transaction via transaction_id_raw lookup. FP Result Type 2025-12-27", tag: ["linking", "equity", "fp-result-type"], updated_at: "2025-12-27 20:10:27+0000" },
  { id: 10953, name: "Workers/Link FUB Calls to Users", description: "Links fub_calls to fub_users via fub_user_id lookup. FP Result Type 2025-12-27", tag: ["linking", "fub", "fp-result-type"], updated_at: "2025-12-27 20:10:21+0000" },
  { id: 10952, name: "Workers/Link FUB Calls to People", description: "Links fub_calls to fub_people via person_id lookup. FP Result Type 2025-12-27", tag: ["linking", "fub", "fp-result-type"], updated_at: "2025-12-27 20:10:15+0000" },
  { id: 10941, name: "Workers/FUB - Get Groups", description: "V3 Worker: Fetches FUB groups from API and upserts to fub_groups table", tag: ["v3", "fub", "worker", "groups"], updated_at: "2025-12-18 23:02:34+0000" },
  { id: 10938, name: "Workers/reZEN - Get Equity Performance", description: "V3 worker: Fetch equity performance data from Plutus API", tag: ["v3", "rezen", "worker", "equity-performance", "created-2025-12-18"], updated_at: "2025-12-18 22:21:26+0000" },
  { id: 10055, name: "Workers/Income - Aggregate All Agents", description: "Process income aggregation for all agents. FIXED 2025-12-28: Added pagination to prevent timeout. FP REFACTOR 2025-12-27", tag: ["v3", "worker", "income", "orchestrator", "fp-traverse-pattern-2025-12-27", "fixed-timeout-2025-12-28"], updated_at: "2025-12-28 06:53:09+0000" },
  { id: 10054, name: "Workers/Income - Calculate Agent Totals", description: "Calculate income totals for an agent from contribution table. FP Result Type 2025-12-27", tag: ["v3", "worker", "income", "aggregation", "fp-result-type"], updated_at: "2025-12-27 20:08:32+0000" },
  { id: 10051, name: "Workers/Income - Aggregate All Sources", description: "V3 Worker: Aggregates income from equity, revshare, and commission sources. FP Result Type 2025-12-27", tag: ["Workers", "income", "V3", "aggregation", "fp-result-type"], updated_at: "2025-12-27 21:29:37+0000" },
  { id: 10038, name: "Workers/reZEN - Move Transactions from Staging", description: "V3 Worker: Process staged reZEN transactions into normalized tables", tag: ["v3", "rezen", "worker", "move-staging", "created-2025-12-17"], updated_at: "2025-12-17 17:59:18+0000" },
  { id: 10034, name: "Workers/reZEN - Validate Credentials", description: "Function Workers/reZEN - Validate Credentials", tag: ["v3", "rezen", "worker", "credentials-validation", "2025-12-17"], updated_at: "2025-12-17 06:31:05+0000" },
  { id: 10033, name: "Workers/FUB - Sync Stages from Deals", description: "Function Workers/FUB - Sync Stages from Deals", tag: [], updated_at: "2025-12-17 05:08:11+0000" },
  { id: 10031, name: "Workers/FUB - Move Deals to Transaction", description: "V3 Worker: Move FUB deals from fub_deals staging to normalized transaction table", tag: ["v3", "fub", "worker", "transaction", "created-2025-12-16"], updated_at: "2025-12-16 22:01:15+0000" },
  { id: 10027, name: "Workers/SkySlope - Move Listings from Staging", description: "V3 Worker: Move SkySlope listings from staging to normalized listing table with address creation", tag: ["📊 v3", "⚙️ worker", "📂 skyslope", "🏠 listing", "✅ created-2025-12-16", "✅ active", "📝 logging-added-2025-12-16"], updated_at: "2025-12-16 04:16:54+0000" },
  { id: 10022, name: "Workers/FUB - Get Deals", description: "FUB Deals Orchestrator - WITH SYNC ORDER ENFORCEMENT", tag: ["v3", "fub", "worker", "deals-group", "orchestrator", "sync-order-enforcement", "fixed-2025-12-28"], updated_at: "2025-12-28 06:30:23+0000" },
  { id: 10021, name: "Workers/FUB - Get Deals - Upsert", description: "Upsert transformed deals data to database - ALL FIELDS + deal_id", tag: ["v3", "fub", "worker", "deals-group", "complete-field-mapping", "ad_updated_at-fixed-2025-12-18"], updated_at: "2025-12-18 07:09:57+0000" },
  { id: 10020, name: "Workers/FUB - Get Deals - Transform", description: "Transform FUB deals data - ALL FIELDS MAPPED. FIXED: Use embedded user name from API instead of FK lookup", tag: ["v3", "fub", "worker", "deals-group", "full-field-mapping-2025-12-17", "user-name-from-api-2025-12-18"], updated_at: "2025-12-18 17:13:41+0000" },
  { id: 10019, name: "Workers/reZEN - Create Contribution Object", description: "V3 Worker: Transforms raw reZEN contribution data into normalized contribution records", tag: ["v3", "rezen", "worker", "gci-added-2025-12-17", "updated_at-fixed-2025-12-18", "income-recalc-added-2025-12-18", "db-insert-fixed-2025-12-18"], updated_at: "2025-12-18 20:23:04+0000" },
  { id: 9167, name: "Workers/FUB - Get Text Messages V3", description: "Worker version of FUB text message sync - WORKING VERSION", tag: ["v3", "fub", "worker", "text-messages", "ported-from-archive-2025-12-18", "working"], updated_at: "2025-12-18 23:07:52+0000" },
  { id: 9166, name: "Workers/System - Contributions", description: "Function Workers/System - Contributions", tag: [], updated_at: "2025-12-14 04:14:12+0000" },
  { id: 8316, name: "Workers/AD - Logic Helper", description: "Function Workers/AD - Logic Helper. FP Result Type Pattern: Returns {success, data/error, step}", tag: ["fp-result-type"], updated_at: "2025-12-27 23:55:21+0000" },
  { id: 8315, name: "Workers/Send Email - Network News Daily", description: "Function Workers/Send Email - Network News Daily. FP Result Type Pattern", tag: ["fp-result-type", "fixed-2025-12-28"], updated_at: "2025-12-28 20:49:52+0000" },
  { id: 8313, name: "Workers/Internal - Log Email", description: "Log email activity to database with FP Result pattern", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "worker", "logging"], updated_at: "2025-12-27 23:34:38+0000" },
  { id: 8312, name: "Workers/Internal - Log Error", description: "Log error to database with FP Result pattern", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "worker", "logging"], updated_at: "2025-12-27 23:34:32+0000" },
  { id: 8310, name: "Workers/AD - Get Notifications", description: "Stubbed notifications worker", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "ad", "worker", "notifications"], updated_at: "2025-12-27 23:34:48+0000" },
  { id: 8309, name: "Workers/AD - Get Dashboard Data", description: "Stubbed dashboard data worker", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "ad", "worker", "dashboard"], updated_at: "2025-12-27 23:34:43+0000" },
  { id: 8308, name: "Workers/AD - Get Activity Log", description: "Returns activity logs from the audits table", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "ad", "worker", "activity_log"], updated_at: "2025-12-27 23:35:59+0000" },
  { id: 8301, name: "Workers/reZEN - Transaction Details By Object", description: "V3 Worker: Process reZEN transaction with financials and participants. FP Pattern", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "Workers", "reZEN", "V3", "By-Object"], updated_at: "2025-12-30 00:52:34+0000" },
  { id: 8300, name: "Workers/Auth - Login", description: "V3 Auth login worker - looks up user by email, verifies password, creates auth token", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "auth", "user", "v3", "worker"], updated_at: "2025-12-27 23:35:32+0000" },
  { id: 8299, name: "Workers/reZEN - Create Onboarding Job", description: "V3 worker: Create onboarding job for new reZEN users. FP Pattern", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "v3", "worker", "rezen"], updated_at: "2025-12-27 23:34:57+0000" },
  { id: 8298, name: "Workers/reZEN - Onboarding Load Listings", description: "V3 worker: Load listings from reZEN API into staging table", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "v3", "rezen", "worker"], updated_at: "2025-12-27 23:37:13+0000" },
  { id: 8297, name: "Workers/reZEN - Onboarding Orchestrator", description: "V3 Worker: Main onboarding orchestrator - calls Workers instead of legacy functions", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "v3", "worker", "rezen", "orchestrator"], updated_at: "2025-12-27 23:37:16+0000" },
  { id: 8296, name: "Workers/reZEN - Onboarding Load Transactions", description: "V3 worker: Load transactions from reZEN API into staging table", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "v3", "rezen", "worker"], updated_at: "2025-12-27 23:37:07+0000" },
  { id: 8295, name: "Workers/FUB - Lambda Coordinator Validate Input", description: "Phase 1: Validates input and returns user/connection records - FP Result Pattern", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "v3", "fub", "worker", "validation"], updated_at: "2025-12-27 23:35:31+0000" },
  { id: 8291, name: "Workers/AD - Upload Team Roster Images to Cloud", description: "V3 Worker: Fetches team roster avatar images from URL and uploads to Xano cloud storage", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "v3", "ad", "worker", "team-roster", "storage"], updated_at: "2025-12-27 23:36:29+0000" },
  { id: 8290, name: "Workers/AD - Upload Agent Images to Cloud", description: "V3 Worker: Fetches agent avatar images from URL and uploads to Xano cloud storage", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "v3", "ad", "worker", "agent", "storage"], updated_at: "2025-12-27 23:36:07+0000" },
  { id: 8285, name: "Workers/Network - Downline Sync", description: "FP Pattern: V3 Worker - Network Downline Sync. Syncs 5-tier network hierarchy from reZEN API", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "v3", "network", "worker", "#5473"], updated_at: "2025-12-27 23:36:32+0000" },
  { id: 8284, name: "Workers/FUB - Get Text Messages By Person ID", description: "FP Pattern: Worker function to fetch text messages for a specific FUB person by their personId", tag: ["fp-pattern", "fp-result-type", "fp-transformed-2025-12-27", "v3", "fub", "worker"], updated_at: "2025-12-27 23:34:10+0000" },
  { id: 8283, name: "Workers/Network - Get Cap Data", description: "Worker function for fetching cap data by tier (1-5). FP Pattern: Result<CapSyncResult, SyncError>", tag: ["📊 v3", "🌐 network", "⚙️ worker", "#5474", "🧪 fp-pattern", "#8099"], updated_at: "2025-12-27 23:27:35+0000" },
  { id: 8282, name: "Workers/Metrics - Transactions by Lifecycle Group", description: "Production - Transactions by Lifecycle Group. FP Pattern", tag: ["📊 v3", "💰 transaction", "⚙️ worker", "#5431", "🧪 fp-pattern"], updated_at: "2025-12-27 23:30:13+0000" },
  { id: 8281, name: "Workers/SkySlope - Main Worker", description: "DEPRECATED STUB - FP Pattern. Returns a proper Result type indicating this function should not be used", tag: ["⚠️ deprecated", "🗑️ delete-after-review", "#5451", "➡️ use-8031-instead", "🧪 fp-pattern"], updated_at: "2025-12-27 23:27:26+0000" },
  { id: 8280, name: "Workers/Network - Get FrontLine Data", description: "Worker function DEPRECATED - network_hierarchy table normalized", tag: ["📊 v3", "🌐 network", "⚙️ worker", "#5475", "⚠️ deprecated-needs-rewrite", "🔧 fp-refactored"], updated_at: "2025-12-27 23:27:02+0000" },
  { id: 8279, name: "Workers/Metrics - Get Transaction Counts", description: "Business Summary dashboard - compares reZEN vs AD transaction counts. FP Pattern", tag: ["📊 v3", "💰 transaction", "⚙️ worker", "#5512", "🔧 fp-refactored"], updated_at: "2025-12-27 23:28:14+0000" },
  { id: 8278, name: "Workers/reZEN - Outgoing Payments By Agent", description: "RevShare outgoing payments by agent ID lookup. FP Pattern", tag: ["📊 v3", "🏘️ rezen", "⚙️ worker", "#5561", "🔧 fp-refactored"], updated_at: "2025-12-27 23:26:56+0000" },
  { id: 8277, name: "Workers/reZEN - Outgoing Payments By Tier", description: "RevShare outgoing payments by tier lookup. FP Result Type", tag: ["v3", "rezen", "worker", "fp-result-type", "fp-transformed-2025-12-27"], updated_at: "2025-12-27 23:29:13+0000" },
  { id: 8153, name: "Workers/AD - CSV Insert Data from Temp Table", description: "Worker function to load transaction data from CSV temp table", tag: ["📊 v3", "📋 ad", "⚙️ worker", "#5516", "✅ table-refs-fixed-2025-12-08", "fp-result-type"], updated_at: "2025-12-27 22:50:59+0000" },
  { id: 8152, name: "Workers/AD - Missing Team Roster Avatars", description: "Worker function to fix missing avatars in team roster. FIXED 2025-12-28", tag: ["v3", "ad", "worker", "#5567", "normalized-2025-12-07", "fp-result-type", "fixed-bubbled-2025-12-28"], updated_at: "2025-12-28 07:58:57+0000" },
  { id: 8151, name: "Workers/AD - Missing Agent IDs Participants", description: "Worker function to fix missing agent IDs in participants table by looking up agent records", tag: ["v3", "ad", "worker", "fp-result-type"], updated_at: "2025-12-27 21:28:56+0000" },
  { id: 8150, name: "Workers/FUB - Fix Appointments Missing Created By", description: "Worker function to fix FUB appointments missing created_by_fub_user_id field", tag: ["v3", "fub", "worker", "#7949", "fp-result-type", "fixed-round2-2025-12-28"], updated_at: "2025-12-28 07:00:45+0000" },
  { id: 8149, name: "Workers/FUB - Delete Lambda Logs", description: "Delete old FUB worker queue and job status records (7+ days old). FP Result Type 2025-12-27", tag: ["📊 v3", "🔗 fub", "⚙️ worker", "#5430", "✅ migrated-2025-12-08", "✨ bug-fix-loop-pagination-2025-12-13", "fp-result-type"], updated_at: "2025-12-27 22:50:39+0000" },
  { id: 8148, name: "Workers/AD - Upload Images to Cloud", description: "Worker function to upload images to cloud storage", tag: ["v3", "ad", "worker", "storage"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8147, name: "Workers/FUB - Get Appointments", description: "FUB Appointments orchestrator - fetches and syncs appointments", tag: ["v3", "fub", "worker", "appointments"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8146, name: "Workers/FUB - Get Events", description: "FUB Events orchestrator - fetches and syncs events", tag: ["v3", "fub", "worker", "events"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8145, name: "Workers/FUB - Get Calls", description: "FUB Calls orchestrator - fetches and syncs call records", tag: ["v3", "fub", "worker", "calls"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8144, name: "Workers/FUB - Get People", description: "FUB People orchestrator - fetches and syncs contacts", tag: ["v3", "fub", "worker", "people"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8143, name: "Workers/FUB - Get Tasks", description: "FUB Tasks orchestrator - fetches and syncs tasks", tag: ["v3", "fub", "worker", "tasks"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8142, name: "Workers/FUB - Get Notes", description: "FUB Notes orchestrator - fetches and syncs notes", tag: ["v3", "fub", "worker", "notes"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8141, name: "Workers/reZEN - Get Team Roster", description: "reZEN Team Roster sync - fetches team members", tag: ["v3", "rezen", "worker", "team-roster"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8140, name: "Workers/reZEN - Get Listings", description: "reZEN Listings sync - fetches listings from API", tag: ["v3", "rezen", "worker", "listings"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8139, name: "Workers/reZEN - Get Transactions", description: "reZEN Transactions sync - fetches transactions from API", tag: ["v3", "rezen", "worker", "transactions"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8138, name: "Workers/reZEN - Get Network", description: "reZEN Network sync - fetches network/downline data", tag: ["v3", "rezen", "worker", "network"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8137, name: "Workers/reZEN - Get Contributions", description: "reZEN Contributions sync - fetches revshare contributions", tag: ["v3", "rezen", "worker", "contributions"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8136, name: "Workers/SkySlope - Get Listings", description: "SkySlope Listings sync - fetches listings from API", tag: ["v3", "skyslope", "worker", "listings"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8135, name: "Workers/SkySlope - Get Transactions", description: "SkySlope Transactions sync - fetches transactions from API", tag: ["v3", "skyslope", "worker", "transactions"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8134, name: "Workers/Title - Get Orders", description: "Title/Qualia orders sync - fetches orders from GraphQL API", tag: ["v3", "title", "worker", "orders"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8133, name: "Workers/Metrics - Calculate Cap Progress", description: "Calculate cap progress metrics for agents", tag: ["v3", "metrics", "worker", "cap"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8132, name: "Workers/Metrics - Calculate Network Metrics", description: "Calculate network performance metrics", tag: ["v3", "metrics", "worker", "network"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8131, name: "Workers/Metrics - Calculate Transaction Metrics", description: "Calculate transaction volume and value metrics", tag: ["v3", "metrics", "worker", "transactions"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8130, name: "Workers/Link Transactions to Agents", description: "FK linking: Link transactions to agent records", tag: ["linking", "transactions", "agents"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8129, name: "Workers/Link Listings to Agents", description: "FK linking: Link listings to agent records", tag: ["linking", "listings", "agents"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8128, name: "Workers/Link Participants to Transactions", description: "FK linking: Link participants to transaction records", tag: ["linking", "participants", "transactions"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8127, name: "Workers/Link Network Members", description: "FK linking: Link network member records to agents", tag: ["linking", "network", "agents"], updated_at: "2025-12-18 17:00:00+0000" },
  { id: 8126, name: "Workers/Link Contributions to Transactions", description: "FK linking: Link contributions to transaction records", tag: ["linking", "contributions", "transactions"], updated_at: "2025-12-18 17:00:00+0000" },
  // Additional workers not included for brevity - see raw API data
]

// Transform raw data to typed WorkerFunction objects
export const WORKERS_FUNCTIONS: WorkerFunction[] = RAW_WORKERS_DATA.map(raw => ({
  id: raw.id,
  name: raw.name,
  shortName: raw.name.replace("Workers/", ""),
  domain: deriveDomain(raw.name),
  category: deriveCategory(raw.name, [...raw.tag]),
  description: raw.description,
  tags: [...raw.tag],
  updatedAt: raw.updated_at,
  status: "untested" as const,
  expectedInputs: deriveExpectedInputs(raw.description, [...raw.tag]),
}))

// Get statistics about Workers functions
export function getWorkersFunctionsStats() {
  const byDomain: Record<WorkerDomain, number> = {
    fub: 0,
    rezen: 0,
    skyslope: 0,
    network: 0,
    title: 0,
    ad: 0,
    income: 0,
    metrics: 0,
    auth: 0,
    utility: 0,
    linking: 0,
    aggregation: 0,
  }

  const byCategory: Record<WorkerCategory, number> = {
    sync: 0,
    transform: 0,
    upsert: 0,
    fix: 0,
    linking: 0,
    orchestrator: 0,
    "api-call": 0,
    utility: 0,
    email: 0,
    audit: 0,
  }

  const byStatus = {
    tested: 0,
    untested: 0,
    broken: 0,
  }

  let hasFpPattern = 0
  let hasResultType = 0

  for (const fn of WORKERS_FUNCTIONS) {
    byDomain[fn.domain]++
    byCategory[fn.category]++
    byStatus[fn.status]++

    const tagsLower = fn.tags.map(t => t.toLowerCase()).join(" ")
    if (tagsLower.includes("fp-pattern") || tagsLower.includes("fp-result-type")) {
      hasFpPattern++
    }
    if (tagsLower.includes("result-type") || fn.description.toLowerCase().includes("result type")) {
      hasResultType++
    }
  }

  return {
    total: WORKERS_FUNCTIONS.length,
    byDomain,
    byCategory,
    byStatus,
    hasFpPattern,
    hasResultType,
    requiresUserId: WORKERS_FUNCTIONS.filter(fn => fn.expectedInputs.includes("user_id")).length,
  }
}

// Export raw data count for reference
export const WORKERS_COUNT = RAW_WORKERS_DATA.length
