// Xano V2 Workspace API - Direct Integration
// Uses Xano's internal API to fetch workspace metadata

const XANO_INSTANCE = "x2nu-xcjc-vhax"
const WORKSPACE_ID = 1 // AgentDashboards 2.0

// Types for the raw API responses
interface RawTableResponse {
  tables: Array<{
    id: number
    name: string
    auth_enabled: boolean
    record_count: number | string
    last_modified: string
    tags: string[]
    description: string | null
  }>
  total: number
  workspace: string
  page: number
  next_page: number | null
}

interface RawAPIGroupResponse {
  api_groups: Array<{
    api_group_id: number
    name: string
    canonical: string
    endpoint_count: number | string
    last_modified: string
    tags: string[]
  }>
  total: number
  workspace_id: string
  page: number
  next_page: number | null
}

// Hardcoded data from the Xano MCP exploration
// This is the complete list of tables from the V2 workspace
// In production, this would come from an API endpoint

export const TABLES_DATA = [
  // Page 1
  { id: 692, name: "address", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:44:54+0000", tags: ["📍 location", "🔗 reference", "🏗️ normalized"], description: "Centralized address storage" },
  { id: 670, name: "agent", auth_enabled: false, record_count: "1+", last_modified: "2025-12-26 04:07:38+0000", tags: ["🏢 agent", "🔑 core", "🆔 identity"], description: "Core agent identity and profile" },
  { id: 671, name: "agent_cap_data", auth_enabled: false, record_count: "1+", last_modified: "2025-12-11 08:18:13+0000", tags: ["🏢 agent", "💰 caps", "📅 annual"], description: "Agent cap tracking by year" },
  { id: 672, name: "agent_commission", auth_enabled: false, record_count: "1+", last_modified: "2025-12-11 08:18:15+0000", tags: ["🏢 agent", "💵 commission", "📊 splits"], description: "Agent commission split configuration" },
  { id: 674, name: "agent_hierarchy", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:44:58+0000", tags: ["🏢 agent", "🌳 sponsors", "🔗 network"], description: "Agent sponsor tree relationships" },
  { id: 673, name: "agent_performance", auth_enabled: false, record_count: "1+", last_modified: "2025-12-11 08:18:17+0000", tags: ["🏢 agent", "📊 metrics", "🏆 rankings"], description: "Agent performance metrics" },
  { id: 930, name: "agent_rezen", auth_enabled: false, record_count: "1+", last_modified: "2025-12-31 02:35:23+0000", tags: ["v2", "agent", "rezen", "cap"], description: null },
  { id: 462, name: "agent_task_history", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:44:59+0000", tags: ["🏢 agent", "📋 tasks", "📅 history", "🗂️ original"], description: "Agent task tracking" },
  { id: 983, name: "agg_agent_monthly", auth_enabled: false, record_count: "1+", last_modified: "2025-12-25 07:39:32+0000", tags: ["aggregation", "monthly"], description: null },
  { id: 984, name: "agg_leaderboard", auth_enabled: false, record_count: 0, last_modified: "2025-12-25 07:42:16+0000", tags: ["aggregation", "leaderboard"], description: null },
  { id: 700, name: "audit_log", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:11+0000", tags: ["📝 logs", "🔍 audit", "📊 tracking"], description: "System-wide audit trail" },
  { id: 414, name: "audits", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:28:59+0000", tags: ["📘 log", "🔍 audit", "📊 activity", "🗂️ original"], description: "Audit records for compliance" },
  { id: 395, name: "brokerage", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:15+0000", tags: ["📋 lookup", "🏢 company", "📊 reference", "🗂️ original"], description: "Brokerage company information" },
  { id: 378, name: "calendar", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:16+0000", tags: ["📋 lookup", "📅 calendar", "✨ feature", "🗂️ original"], description: "Date dimension lookup" },
  { id: 912, name: "chart_catalog", auth_enabled: false, record_count: "1+", last_modified: "2025-12-22 05:24:34+0000", tags: [], description: "Catalog of available dashboard charts" },
  { id: 923, name: "chart_libraries", auth_enabled: false, record_count: "1+", last_modified: "2025-12-22 18:26:41+0000", tags: ["charts", "config", "licensing"], description: "Chart library info" },
  { id: 455, name: "chart_transactions", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:18+0000", tags: ["📊 analytics", "💼 transaction", "✨ feature", "🗂️ original"], description: "Transaction data for charts" },
  { id: 922, name: "chart_types", auth_enabled: false, record_count: "1+", last_modified: "2025-12-22 18:25:45+0000", tags: ["charts", "config"], description: "Chart type definitions" },
  { id: 473, name: "checklist_data", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:27+0000", tags: ["📋 lookup", "✅ tasks", "✨ feature", "🗂️ original"], description: "Checklist completion data" },
  { id: 472, name: "checklist_items", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:28+0000", tags: ["📋 lookup", "✅ tasks", "✨ feature", "🗂️ original"], description: "Individual checklist items" },
  { id: 471, name: "checklists", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:30+0000", tags: ["📋 lookup", "✅ tasks", "✨ feature", "🗂️ original"], description: "Master checklist templates" },
  { id: 375, name: "closing disclosure", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:31+0000", tags: ["💰 transaction", "📋 closing", "🏠 listing", "🗂️ original"], description: "Transaction closing disclosures" },
  { id: 364, name: "commission payment", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:32+0000", tags: ["💰 transaction", "💵 commission", "📄 payment", "🗂️ original"], description: "Commission payment tracking" },
  { id: 389, name: "commission plans", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:42+0000", tags: ["📋 lookup", "💰 commission", "📊 reference", "🗂️ original"], description: "Commission structure and plans" },
  { id: 417, name: "connections", auth_enabled: false, record_count: "1+", last_modified: "2025-12-08 23:25:51+0000", tags: ["🔗 integration", "👥 agent", "✨ feature", "🗂️ original"], description: "User connections" },
  { id: 897, name: "contact_log", auth_enabled: false, record_count: "1+", last_modified: "2025-12-20 05:07:02+0000", tags: [], description: null },
  { id: 701, name: "contribution", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:26:09+0000", tags: ["💵 financial", "💰 caps", "📊 tracking"], description: "Rev share contribution records" },
  { id: 431, name: "contributions_pending", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:28:21+0000", tags: ["💵 contributions", "⏳ pending", "💰 revenue", "🗂️ original"], description: "Pending contributions" },
  { id: 691, name: "contribution_tiers", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:47+0000", tags: ["📋 lookup", "💵 contributions", "📊 tiers"], description: "Contribution tier definitions" },
  { id: 890, name: "credentials", auth_enabled: false, record_count: "1+", last_modified: "2025-12-17 02:32:53+0000", tags: ["credentials", "integrations"], description: null },
  { id: 895, name: "csv_mapping_config", auth_enabled: false, record_count: "1+", last_modified: "2025-12-20 04:25:31+0000", tags: [], description: null },
  { id: 416, name: "deduction items", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:45:48+0000", tags: ["📋 reference", "📄 deductions", "📊 tax", "🗂️ original"], description: "Tax deduction items" },
  { id: 707, name: "director", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:26:46+0000", tags: ["👥 team", "🔗 roles", "🏗️ normalized"], description: "Director records" },
  { id: 410, name: "domestic partnership", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:28:31+0000", tags: ["👥 team", "👫 partnership", "🏢 org", "🗂️ original"], description: "Domestic partnership entities" },
  { id: 411, name: "domestic_partnership_members", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:06+0000", tags: ["👥 team", "👫 partnership", "🔗 junction", "🗂️ original"], description: "Partnership member roster" },
  { id: 985, name: "dotloop_accounts", auth_enabled: false, record_count: 0, last_modified: "2025-12-26 05:42:11+0000", tags: ["🔗 DotLoop", "🏢 accounts", "📊 config"], description: "DotLoop account connections" },
  { id: 988, name: "dotloop_contacts", auth_enabled: false, record_count: 0, last_modified: "2025-12-26 05:43:09+0000", tags: ["🔗 DotLoop", "👥 contacts", "📊 CRM"], description: "DotLoop contacts" },
  { id: 987, name: "dotloop_loops", auth_enabled: false, record_count: 0, last_modified: "2025-12-26 05:43:03+0000", tags: ["🔗 DotLoop", "💼 transactions", "📊 CRM"], description: "DotLoop loops (transactions)" },
  { id: 986, name: "dotloop_profiles", auth_enabled: false, record_count: 0, last_modified: "2025-12-26 05:42:55+0000", tags: ["🔗 DotLoop", "👤 profiles", "📊 config"], description: "DotLoop profiles" },
  { id: 990, name: "dotloop_staging", auth_enabled: false, record_count: 0, last_modified: "2025-12-26 05:43:32+0000", tags: ["📥 staging", "🔄 sync", "📦 raw"], description: "DotLoop staging" },
  { id: 989, name: "dotloop_sync_state", auth_enabled: false, record_count: 0, last_modified: "2025-12-26 05:43:29+0000", tags: ["🔗 DotLoop", "⚙️ sync", "📊 tracking"], description: "DotLoop sync state" },
  { id: 499, name: "email_logs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:08+0000", tags: ["📘 log", "📧 email", "🔍 audit", "🗂️ original"], description: "Email delivery logs" },
  { id: 500, name: "email_master", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:10+0000", tags: ["📘 log", "📧 email", "🔍 audit", "🗂️ original"], description: "Master email template" },
  { id: 699, name: "equity_annual", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:27:50+0000", tags: ["💵 financial", "💰 caps", "📊 tracking"], description: "Annual equity summary" },
  { id: 702, name: "equity_monthly", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:27:52+0000", tags: ["💵 financial", "💰 caps", "📊 tracking"], description: "Monthly equity tracking" },
  { id: 399, name: "equity_transactions", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:27:55+0000", tags: ["💵 equity", "💰 transaction", "📈 tracking", "🗂️ original"], description: "Equity transaction ledger" },
  { id: 474, name: "error logs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:32+0000", tags: ["📘 log", "⚠️ error", "🔍 audit", "🗂️ original"], description: "Application error tracking" },
  { id: 428, name: "event log", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:34+0000", tags: ["📘 log", "📊 activity", "🔍 audit", "🗂️ original"], description: "System event logging" },
  { id: 396, name: "feedback", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:43+0000", tags: ["📋 lookup", "💬 communication", "✨ feature", "🗂️ original"], description: "User-submitted feedback" },
  { id: 382, name: "frontline_stats", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:46+0000", tags: ["🌐 network", "📈 stats", "👥 frontline", "🗂️ original"], description: "Frontline agent statistics" },
  // Page 2 - FUB tables
  { id: 421, name: "fub_accounts", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:26:49+0000", tags: ["🔗 FUB", "🏢 accounts", "📊 config", "🗂️ original"], description: "Follow Up Boss account connections" },
  { id: 423, name: "fub_appointments", auth_enabled: false, record_count: "1+", last_modified: "2025-12-16 16:39:26+0000", tags: ["🔗 FUB", "📅 appointments", "📊 calendar", "🗂️ original"], description: "FUB appointment sync" },
  { id: 418, name: "fub_calls", auth_enabled: false, record_count: "1+", last_modified: "2025-12-17 22:22:20+0000", tags: ["🔗 FUB", "📞 calls", "📊 activity", "🗂️ original"], description: "FUB call log sync" },
  { id: 449, name: "fub_deals", auth_enabled: false, record_count: "1+", last_modified: "2025-12-17 22:22:27+0000", tags: ["🔗 FUB", "💰 deals", "📊 pipeline", "🗂️ original"], description: "FUB deal pipeline sync" },
  { id: 450, name: "fub_events", auth_enabled: false, record_count: "1+", last_modified: "2025-12-17 02:47:48+0000", tags: ["🔗 FUB", "📅 events", "📊 activity", "🗂️ original"], description: "FUB event history" },
  { id: 422, name: "fub_groups", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 23:02:06+0000", tags: ["🔗 FUB", "👥 groups", "📊 organization", "🗂️ original"], description: "FUB group definitions" },
  { id: 476, name: "fub_onboarding_jobs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:26:53+0000", tags: ["🔗 FUB", "⚙️ onboarding", "📊 jobs", "🗂️ original"], description: "FUB initial sync jobs" },
  { id: 419, name: "fub_people", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 17:43:34+0000", tags: ["🔗 FUB", "👥 contacts", "📊 CRM", "🗂️ original"], description: "FUB contacts sync" },
  { id: 420, name: "fub_stages", auth_enabled: false, record_count: "1+", last_modified: "2025-12-17 02:47:36+0000", tags: ["🔗 FUB", "📋 stages", "📊 pipeline", "🗂️ original"], description: "FUB pipeline stages" },
  { id: 475, name: "fub_sync_jobs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:05+0000", tags: ["🔗 FUB", "⚙️ sync", "📊 jobs", "🗂️ original"], description: "FUB Sync Jobs" },
  { id: 685, name: "fub_sync_state", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:06+0000", tags: ["🔗 FUB", "⚙️ sync", "📊 tracking"], description: "FUB sync state tracking" },
  { id: 424, name: "fub_text_messages", auth_enabled: false, record_count: 0, last_modified: "2025-12-08 23:53:20+0000", tags: ["🔗 FUB", "💬 messages", "📱 SMS", "🗂️ original"], description: "FUB SMS sync" },
  { id: 392, name: "fub_users", auth_enabled: false, record_count: "1+", last_modified: "2025-12-17 02:47:29+0000", tags: ["🔗 FUB", "👤 users", "📊 agents", "🗂️ original"], description: "FUB user accounts" },
  { id: 709, name: "fub_worker_queue", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:15+0000", tags: ["⏳ jobs", "🔗 fub", "⚙️ worker"], description: null },
  { id: 404, name: "global_variables", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:47:17+0000", tags: ["⚙️ config", "🌐 global", "📦 settings", "🗂️ original"], description: "System-wide configuration" },
  { id: 695, name: "income", auth_enabled: false, record_count: "1+", last_modified: "2025-12-24 23:19:18+0000", tags: ["💵 financial", "💰 caps", "📊 tracking"], description: "Unified income tracking" },
  { id: 376, name: "integrations", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:47:20+0000", tags: ["📋 config", "🔗 integrations", "🌐 external", "🗂️ original"], description: "Third-party integrations" },
  { id: 467, name: "invitations", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:47:21+0000", tags: ["👤 user", "📧 invitations", "🔑 access", "🗂️ original"], description: "User invitation tracking" },
  { id: 693, name: "job_status", auth_enabled: false, record_count: "1+", last_modified: "2025-12-25 07:08:58+0000", tags: ["⏳ jobs", "🔄 sync", "⚙️ system"], description: "Unified job status tracking" },
  { id: 896, name: "kpi_goals", auth_enabled: false, record_count: "1+", last_modified: "2025-12-20 05:06:23+0000", tags: [], description: null },
  { id: 899, name: "lambda_failed_records", auth_enabled: false, record_count: "1+", last_modified: "2025-12-20 05:18:51+0000", tags: [], description: "Tracks failed lambda records" },
  { id: 901, name: "lambda_job_logs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-20 05:18:56+0000", tags: [], description: "Lambda job execution logs" },
  { id: 902, name: "lambda_job_status", auth_enabled: false, record_count: 0, last_modified: "2025-12-20 05:18:59+0000", tags: [], description: "Lambda job status tracking" },
  { id: 900, name: "lambda_worker_logs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-20 05:18:53+0000", tags: [], description: "Lambda worker execution metrics" },
  { id: 705, name: "leader", auth_enabled: false, record_count: "1+", last_modified: "2025-12-24 23:11:47+0000", tags: ["👥 team", "🔗 roles", "🏗️ normalized"], description: "Leader records" },
  { id: 397, name: "leads", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:47:31+0000", tags: ["📋 lookup", "🎯 marketing", "✨ feature", "🗂️ original"], description: "Lead contacts" },
  { id: 398, name: "📋 leads_messages", auth_enabled: false, record_count: 0, last_modified: "2025-12-08 23:22:41+0000", tags: ["📋 lookup", "🎯 marketing", "✨ feature", "🗂️ original"], description: "Lead text messages" },
  { id: 435, name: "lead_source_defaults", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:12+0000", tags: ["📋 lookup", "🎯 marketing", "📊 reference", "🗂️ original"], description: "Default lead source options" },
  { id: 437, name: "lead_source_user", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:14+0000", tags: ["📋 lookup", "🎯 marketing", "📊 reference", "🗂️ original"], description: "User-customized lead sources" },
  { id: 387, name: "ledger_items", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:29:08+0000", tags: ["💰 transaction", "📒 ledger", "📊 accounting", "🗂️ original"], description: "General ledger items" },
  { id: 388, name: "lifecycle_groups", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:17+0000", tags: ["📋 lookup", "👥 agent", "📊 reference", "🗂️ original"], description: "Lifecycle stage groupings" },
  { id: 694, name: "listing", auth_enabled: false, record_count: "1+", last_modified: "2025-12-29 03:12:30+0000", tags: ["🏠 listing", "🔑 core", "📊 tracking"], description: "Core listing record" },
  { id: 680, name: "listing_history", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:29+0000", tags: ["🏠 listing", "📝 audit", "🕐 history"], description: "Listing status/price history" },
  { id: 681, name: "listing_photos", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:31+0000", tags: ["🏠 listing", "📷 media", "🖼️ photos"], description: "Listing photo URLs" },
  { id: 991, name: "lofty_accounts", auth_enabled: false, record_count: 0, last_modified: "2025-12-26 05:50:10+0000", tags: ["🔗 Lofty", "🏢 accounts", "📊 config"], description: "Lofty account connections" },
  { id: 992, name: "lofty_leads", auth_enabled: false, record_count: 0, last_modified: "2025-12-26 05:50:14+0000", tags: ["🔗 Lofty", "👥 leads", "📊 CRM"], description: "Lofty leads" },
  { id: 993, name: "lofty_staging", auth_enabled: false, record_count: 0, last_modified: "2025-12-26 05:50:17+0000", tags: ["📥 staging", "🔄 sync", "📦 raw"], description: "Lofty staging" },
  { id: 994, name: "lofty_sync_state", auth_enabled: false, record_count: 0, last_modified: "2025-12-26 05:50:20+0000", tags: ["🔗 Lofty", "⚙️ sync", "📊 tracking"], description: "Lofty sync state" },
  { id: 454, name: "log_api_keys", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:32+0000", tags: ["📘 log", "🔑 api", "🔍 audit", "🗂️ original"], description: "API key audit log" },
  { id: 426, name: "log_contributions", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:29:02+0000", tags: ["📘 log", "💰 commission", "🔍 audit", "🗂️ original"], description: "Contribution audit log" },
  { id: 427, name: "log_network", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:37+0000", tags: ["📘 log", "👥 agent", "🔍 audit", "🗂️ original"], description: "Network activity log" },
  { id: 453, name: "luzmo_charts", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:48+0000", tags: ["📊 analytics", "📊 pipeline", "✨ feature", "🗂️ original"], description: "Luzmo chart definitions" },
  { id: 451, name: "luzmo_collections", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:50+0000", tags: ["📊 analytics", "📊 pipeline", "✨ feature", "🗂️ original"], description: "Luzmo dashboard collections" },
  { id: 452, name: "luzmo_dashboards", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:51+0000", tags: ["📊 analytics", "📊 pipeline", "✨ feature", "🗂️ original"], description: "Luzmo dashboard configs" },
  { id: 706, name: "mentor", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:26:43+0000", tags: ["👥 team", "🔗 roles", "🏗️ normalized"], description: "Mentor records" },
  { id: 503, name: "metrics_snapshots", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:45:55+0000", tags: ["📊 analytics", "📸 snapshots", "📈 tracking", "🗂️ original"], description: "Performance metrics snapshots" },
  { id: 443, name: "modules", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:46:10+0000", tags: ["📋 lookup", "🔐 access", "📊 reference", "🗂️ original"], description: "System modules" },
  { id: 432, name: "mortgages", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:29:38+0000", tags: ["🏠 property", "💰 mortgages", "🏦 finance", "🗂️ original"], description: "Mortgage tracking" },
  { id: 440, name: "network_change_log", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:27:44+0000", tags: ["📘 log", "👥 agent", "🔍 audit", "🗂️ original"], description: "Network hierarchy changes" },
  { id: 684, name: "network_hierarchy", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:14+0000", tags: ["🌐 network", "🌳 hierarchy", "🔗 downline"], description: "Agent network hierarchy" },
  // Page 3 continued
  { id: 698, name: "network_member", auth_enabled: false, record_count: "1+", last_modified: "2025-12-24 19:38:48+0000", tags: ["🌐 network", "🔗 hierarchy", "💵 revshare"], description: "Network member relationships" },
  { id: 690, name: "network_user_prefs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:31+0000", tags: ["🌐 network", "👤 user", "⚙️ preferences"], description: "Network view preferences" },
  { id: 905, name: "nora_conversations", auth_enabled: false, record_count: "1+", last_modified: "2025-12-20 18:46:22+0000", tags: [], description: "NORA AI conversation storage" },
  { id: 439, name: "notes", auth_enabled: false, record_count: 0, last_modified: "2025-12-30 22:12:23+0000", tags: ["📘 log", "📝 documentation", "✨ feature", "🗂️ original"], description: "User notes and annotations" },
  { id: 703, name: "notification", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:36+0000", tags: ["🔔 notifications", "👤 user", "⚙️ settings"], description: "User notification queue" },
  { id: 492, name: "notification_defaults", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:37+0000", tags: ["📋 lookup", "🔔 notification", "📊 reference", "🗂️ original"], description: "Default notification settings" },
  { id: 478, name: "notification_items", auth_enabled: false, record_count: "1+", last_modified: "2025-12-09 00:03:44+0000", tags: ["🔔 notification", "👥 agent", "✨ feature", "🗂️ original"], description: "Individual notification items" },
  { id: 493, name: "notification_user_prefs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:43+0000", tags: ["📋 lookup", "🔔 notification", "📊 reference", "🗂️ original"], description: "User notification preferences" },
  { id: 367, name: "office", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:55+0000", tags: ["📋 lookup", "🏢 company", "📊 reference", "🗂️ original"], description: "Office locations" },
  { id: 393, name: "outgoing_payments", auth_enabled: false, record_count: "1+", last_modified: "2025-12-30 22:12:05+0000", tags: ["💰 transaction", "💵 outgoing", "📄 payment", "🗂️ original"], description: "Outgoing payment processing" },
  { id: 925, name: "page_filter_options", auth_enabled: false, record_count: "1+", last_modified: "2025-12-22 20:53:47+0000", tags: ["page-builder", "filters"], description: "Filter options for pages" },
  { id: 924, name: "page_filters", auth_enabled: false, record_count: 0, last_modified: "2025-12-22 20:52:55+0000", tags: ["page-builder", "filters"], description: "Admin-configurable filters" },
  { id: 918, name: "pages", auth_enabled: false, record_count: "1+", last_modified: "2025-12-22 18:17:00+0000", tags: ["page-builder", "navigation"], description: "Page definitions" },
  { id: 920, name: "page_sections", auth_enabled: false, record_count: "1+", last_modified: "2025-12-22 18:23:13+0000", tags: ["page-builder", "layout"], description: "Sections within page tabs" },
  { id: 919, name: "page_tabs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-22 20:36:20+0000", tags: ["page-builder", "navigation"], description: "Tabs within pages" },
  { id: 921, name: "page_widgets", auth_enabled: false, record_count: "1+", last_modified: "2025-12-22 20:41:16+0000", tags: ["page-builder", "charts", "layout"], description: "Links charts to sections" },
  { id: 696, name: "participant", auth_enabled: false, record_count: "1+", last_modified: "2025-12-29 01:41:44+0000", tags: ["💰 transaction", "💵 financial", "🔑 core"], description: "Transaction participant details" },
  { id: 374, name: "participant_paid", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:27:16+0000", tags: ["💰 participant", "💵 payments", "💰 transaction", "🗂️ original"], description: "Paid participant records" },
  { id: 444, name: "permissions", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:29:12+0000", tags: ["📋 lookup", "🔐 access", "📊 reference", "🗂️ original"], description: "User role permissions" },
  { id: 488, name: "pipeline_prospect_defaults", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:10+0000", tags: ["📋 lookup", "📊 pipeline", "📊 reference", "🗂️ original"], description: "Default prospect configs" },
  { id: 484, name: "pipeline_prospects", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:11+0000", tags: ["📋 lookup", "📊 pipeline", "✨ feature", "🗂️ original"], description: "Pipeline prospect tracking" },
  { id: 487, name: "pipeline_stage_defaults", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:13+0000", tags: ["📋 lookup", "📊 pipeline", "📊 reference", "🗂️ original"], description: "Default pipeline stages" },
  { id: 485, name: "pipeline_stages", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:14+0000", tags: ["📋 lookup", "📊 pipeline", "📊 reference", "🗂️ original"], description: "Pipeline stage definitions" },
  { id: 697, name: "revshare_payment", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:28:24+0000", tags: ["💵 financial", "💰 caps", "📊 tracking"], description: "Rev share payment distribution" },
  { id: 386, name: "revshare_payments", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:28:25+0000", tags: ["💵 revshare", "📄 payments", "💰 revenue", "🗂️ original"], description: "Revenue sharing payments" },
  { id: 390, name: "revshare_plans", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:28+0000", tags: ["💵 revshare", "📋 plans", "💰 revenue", "🗂️ original"], description: "Revenue share plan definitions" },
  { id: 383, name: "revshare_totals", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:28:28+0000", tags: ["💵 revshare", "📈 totals", "💰 revenue", "🗂️ original"], description: "Revenue share totals" },
  { id: 405, name: "rezen_onboarding_jobs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:31+0000", tags: ["🏘️ reZEN", "📥 integration", "🔄 sync", "🗂️ original"], description: "Rezen initial sync jobs" },
  { id: 495, name: "rezen_process_webhook", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:32+0000", tags: ["🏘️ reZEN", "📥 integration", "🔔 webhooks", "🗂️ original"], description: "Rezen webhook processing" },
  { id: 494, name: "rezen_referral_code", auth_enabled: false, record_count: "1+", last_modified: "2025-12-09 00:06:26+0000", tags: ["🏘️ reZEN", "📥 integration", "🔗 referrals", "🗂️ original"], description: "Rezen referral codes" },
  { id: 464, name: "rezen_sync_jobs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:45+0000", tags: ["🏘️ reZEN", "📥 integration", "🔄 sync", "🗂️ original"], description: "Rezen ongoing sync jobs" },
  { id: 502, name: "rezen_sync_jobs_logs", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:47+0000", tags: ["🏘️ reZEN", "📥 integration", "📝 logs", "🗂️ original"], description: "Rezen sync job logs" },
  { id: 688, name: "rezen_sync_state", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:49+0000", tags: ["🏘️ rezen", "⚙️ sync", "📊 tracking"], description: "Rezen sync state tracking" },
  { id: 489, name: "rezen_webhooks_registered", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:55+0000", tags: ["🏘️ reZEN", "📥 integration", "🔔 webhooks", "🗂️ original"], description: "Rezen webhook registrations" },
  { id: 466, name: "skyslope_connection", auth_enabled: false, record_count: "1+", last_modified: "2025-12-17 06:33:12+0000", tags: ["📂 SkySlope", "📥 integration", "🔄 sync", "🗂️ original"], description: "SkySlope connections" },
  { id: 689, name: "skyslope_sync_state", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:56+0000", tags: ["📂 skyslope", "⚙️ sync", "📊 tracking"], description: "SkySlope sync state" },
  { id: 446, name: "👥 staff", auth_enabled: false, record_count: 0, last_modified: "2025-12-18 05:29:40+0000", tags: ["👥 staff", "🏢 org", "👔 role", "🗂️ original"], description: "Staff member directory" },
  // Staging tables
  { id: 501, name: "stage_appointments_fub_onboarding", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:44:45+0000", tags: ["📥 staging", "🔄 sync", "📦 raw", "🗂️ original"], description: "FUB appointment staging" },
  { id: 507, name: "stage_contributions_rezen_daily_sync", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:44:47+0000", tags: ["📥 staging", "🔄 sync", "📦 raw", "🗂️ original"], description: "Rezen daily contribution staging" },
  { id: 491, name: "stage_contributions_rezen_onboarding", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:44:52+0000", tags: ["📥 staging", "🔄 sync", "📦 raw", "🗂️ original"], description: "Rezen contribution onboarding staging" },
  { id: 710, name: "stage_csv_import", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:44:54+0000", tags: ["⏳ staging", "📊 csv", "📥 import"], description: null },
  { id: 470, name: "stage_listing_skyslope", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:44:56+0000", tags: ["📥 staging", "🔄 sync", "📦 raw", "🗂️ original"], description: "SkySlope listing staging" },
  { id: 486, name: "stage_listings_rezen_onboarding", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:08+0000", tags: ["📥 staging", "🔄 sync", "📦 raw", "🗂️ original"], description: "Rezen listing onboarding staging" },
  { id: 490, name: "stage_network_downline_rezen_onboarding", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:10+0000", tags: ["📥 staging", "🔄 sync", "📦 raw", "🗂️ original"], description: "Rezen downline staging" },
  { id: 505, name: "stage_pending_contribution_rezen", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:12+0000", tags: ["📥 staging", "🔄 sync", "📦 raw", "🗂️ original"], description: "Rezen pending contribution staging" },
  { id: 498, name: "stage_text_messages_fub_onboarding", auth_enabled: false, record_count: "1+", last_modified: "2025-12-08 23:22:22+0000", tags: ["📥 staging", "🔄 sync", "📦 raw", "🗂️ original"], description: "FUB text message staging" },
  { id: 483, name: "stage_transactions_rezen_onboarding", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:14+0000", tags: ["📥 staging", "🔄 sync", "📦 raw", "🗂️ original"], description: "Rezen transaction onboarding staging" },
  { id: 468, name: "stage_transactions_skyslope", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:15+0000", tags: ["📥 staging", "🔄 sync", "📦 raw", "🗂️ original"], description: "SkySlope transaction staging" },
  { id: 415, name: "state_province", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:26+0000", tags: ["📋 lookup", "🌍 location", "📊 reference", "🗂️ original"], description: "State and province reference" },
  { id: 686, name: "stripe_events", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:27+0000", tags: ["💳 stripe", "🔔 webhook", "📝 audit"], description: "Stripe webhook audit trail" },
  // Page 4
  { id: 370, name: "stripe_pricing", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:28+0000", tags: ["💳 stripe", "💵 pricing", "📊 plans", "🗂️ original"], description: "Stripe price configurations" },
  { id: 496, name: "stripe_product", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:45:29+0000", tags: ["💳 stripe", "📦 products", "📊 catalog", "🗂️ original"], description: "Stripe product definitions" },
  { id: 445, name: "stripe_subscription_packages", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:45:31+0000", tags: ["💳 stripe", "📦 packages", "📊 plans", "🗂️ original"], description: "Subscription package bundles" },
  { id: 369, name: "stripe_subscriptions", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:27:20+0000", tags: ["💳 stripe", "💰 subscriptions", "📊 billing", "🗂️ original"], description: "Active subscriptions" },
  { id: 687, name: "stripe_sync_state", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:23+0000", tags: ["💳 stripe", "⚙️ sync", "📊 tracking"], description: "Stripe sync state tracking" },
  { id: 425, name: "system_audit", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:29:06+0000", tags: ["📘 log", "🔒 security", "🔍 audit", "🗂️ original"], description: "System-level audit trail" },
  { id: 438, name: "tags", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:46:32+0000", tags: ["📋 lookup", "🏷️ classification", "📊 reference", "🗂️ original"], description: "User-defined tags" },
  { id: 704, name: "team", auth_enabled: false, record_count: "1+", last_modified: "2025-12-30 20:01:10+0000", tags: ["👥 team", "🔗 roles", "🏗️ normalized"], description: "Core team record" },
  { id: 407, name: "team_director_assignments", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:46+0000", tags: ["👥 team", "🔗 junction", "👥 directors", "🗂️ original"], description: "Director to team assignments" },
  { id: 408, name: "team_leader_assignments", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:47+0000", tags: ["👥 team", "🔗 junction", "👥 leaders", "🗂️ original"], description: "Leader to team assignments" },
  { id: 479, name: "team_links", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:49+0000", tags: ["👥 team", "🔗 links", "📎 resources", "🗂️ original"], description: "Team member links" },
  { id: 683, name: "team_members", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:51+0000", tags: ["👥 team", "🏢 agents", "🔗 membership"], description: "Teams to agents junction" },
  { id: 409, name: "team_mentor_assignments", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:46:52+0000", tags: ["👥 team", "🔗 junction", "👥 mentors", "🗂️ original"], description: "Mentor to agent assignments" },
  { id: 682, name: "team_settings", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:01+0000", tags: ["👥 team", "⚙️ config", "🏛️ settings"], description: "Team configuration" },
  { id: 434, name: "title_agencies", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:03+0000", tags: ["🏛️ title", "🏢 company", "✨ feature", "🗂️ original"], description: "Title companies" },
  { id: 441, name: "title_closing_items", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:04+0000", tags: ["🏛️ title", "✅ tasks", "✨ feature", "🗂️ original"], description: "Closing checklist items" },
  { id: 436, name: "title_disbursements", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:06+0000", tags: ["🏛️ title", "💰 commission", "✨ feature", "🗂️ original"], description: "Title disbursement payments" },
  { id: 447, name: "title_events", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:07+0000", tags: ["🏛️ title", "📊 activity", "✨ feature", "🗂️ original"], description: "Title-related events" },
  { id: 433, name: "title_orders", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:17+0000", tags: ["🏛️ title", "💼 transaction", "✨ feature", "🗂️ original"], description: "Title order tracking" },
  { id: 448, name: "title_users", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:19+0000", tags: ["🏛️ title", "👥 agent", "✨ feature", "🗂️ original"], description: "Title company users" },
  { id: 675, name: "transaction", auth_enabled: false, record_count: "1+", last_modified: "2025-12-29 01:43:29+0000", tags: ["💰 transaction", "🏠 deals", "📋 core"], description: "Core transaction record" },
  { id: 677, name: "transaction_financials", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:58:58+0000", tags: ["💰 transaction", "💵 money", "📊 splits"], description: "Transaction financial details" },
  { id: 678, name: "transaction_history", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:59:02+0000", tags: ["💰 transaction", "📝 audit", "🕐 history"], description: "Transaction status change audit" },
  { id: 676, name: "transaction_participants", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:58:55+0000", tags: ["💰 transaction", "🏢 agents", "🔗 junction"], description: "Transactions to agents junction" },
  { id: 679, name: "transaction_tags", auth_enabled: false, record_count: "1+", last_modified: "2025-12-18 05:59:05+0000", tags: ["💰 transaction", "🏷️ tags", "🔗 junction"], description: "Transaction categorization" },
  { id: 664, name: "user", auth_enabled: true, record_count: "1+", last_modified: "2025-12-19 05:10:51+0000", tags: ["👤 user", "🔑 core", "🆔 identity"], description: "Core user identity" },
  { id: 504, name: "user_2fa", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:47+0000", tags: ["👤 user", "🔒 security", "2FA", "🗂️ original"], description: "Two-factor authentication" },
  { id: 665, name: "user_credentials", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:47:49+0000", tags: ["👤 user", "🔐 auth", "🔑 security"], description: "User authentication credentials" },
  { id: 907, name: "user_dashboard_configuration", auth_enabled: false, record_count: "1+", last_modified: "2025-12-20 20:12:42+0000", tags: [], description: "User dashboard widget config" },
  { id: 906, name: "user_dashboard_sections", auth_enabled: false, record_count: "1+", last_modified: "2025-12-20 20:11:36+0000", tags: [], description: "Dashboard sections for widgets" },
  { id: 926, name: "user_filter_preferences", auth_enabled: false, record_count: 0, last_modified: "2025-12-30 20:10:05+0000", tags: ["page-builder", "filters", "user"], description: "User's saved filter values" },
  { id: 898, name: "user_links", auth_enabled: false, record_count: "1+", last_modified: "2025-12-30 20:13:14+0000", tags: [], description: "User quick links" },
  { id: 929, name: "user_onboarding", auth_enabled: false, record_count: 0, last_modified: "2025-12-23 04:03:00+0000", tags: ["v2", "user", "onboarding"], description: null },
  { id: 711, name: "user_preferences", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:48:04+0000", tags: ["👤 user", "⚙️ preferences", "🎛️ config"], description: "Per-page user preferences" },
  { id: 928, name: "user_rezen", auth_enabled: false, record_count: "1+", last_modified: "2025-12-30 20:11:38+0000", tags: ["v2", "user", "rezen"], description: null },
  { id: 668, name: "user_roles", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:48:06+0000", tags: ["👤 user", "👥 roles", "🏢 hierarchy"], description: "User organizational roles" },
  { id: 667, name: "user_settings", auth_enabled: false, record_count: "1+", last_modified: "2025-12-20 04:16:15+0000", tags: ["👤 user", "⚙️ config", "🎛️ prefs"], description: "User preferences" },
  { id: 666, name: "user_subscriptions", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:48:09+0000", tags: ["👤 user", "💳 billing", "💰 stripe"], description: "User subscription status" },
  { id: 463, name: "user_task_history", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:48:11+0000", tags: ["👤 user", "📋 tasks", "📅 history", "🗂️ original"], description: "User task history" },
  { id: 413, name: "waitlist", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:48:19+0000", tags: ["📋 lists", "⏳ waitlist", "👥 prospects", "🗂️ original"], description: "Product waitlist" },
  { id: 430, name: "webhook_events", auth_enabled: false, record_count: 0, last_modified: "2025-12-15 18:48:21+0000", tags: ["📘 log", "🔗 integration", "🔍 audit", "🗂️ original"], description: "Webhook event log" },
  { id: 460, name: "website_contacts", auth_enabled: false, record_count: "1+", last_modified: "2025-12-15 18:48:23+0000", tags: ["📋 lists", "🌐 website", "📧 contacts", "🗂️ original"], description: "Website contact form submissions" },
  { id: 927, name: "widget_viewport_layouts", auth_enabled: false, record_count: "1+", last_modified: "2025-12-22 20:55:23+0000", tags: ["page-builder", "layouts", "responsive"], description: "Responsive widget layouts" },
]

export const API_GROUPS_DATA = [
  { api_group_id: 650, name: "🔄 Migration: V1 to V2", canonical: "Lrekz_3S", endpoint_count: "1+", last_modified: "2025-12-24 04:54:02+0000", tags: [] },
  { api_group_id: 646, name: "📥 Webhooks", canonical: "XOwEm4wm", endpoint_count: "1+", last_modified: "2025-12-20 01:01:02+0000", tags: ["📥 webhook", "🔗 integration", "⚙️ inbound"] },
  { api_group_id: 574, name: "🔧 MCP: SkySlope Tests", canonical: "6kzol9na", endpoint_count: "1+", last_modified: "2025-12-20 00:56:01+0000", tags: ["🔧 mcp", "📂 skyslope", "🧪 test"] },
  { api_group_id: 536, name: "🔧 MCP: Workers", canonical: "4UsTtl3m", endpoint_count: "1+", last_modified: "2025-12-20 00:55:46+0000", tags: ["🔧 mcp", "⚙️ workers", "🧪 test"] },
  { api_group_id: 535, name: "🔧 MCP: System", canonical: "LIdBL1AN", endpoint_count: "1+", last_modified: "2025-12-20 00:55:51+0000", tags: ["🔧 mcp", "📊 oversight", "⚙️ internal"] },
  { api_group_id: 533, name: "📦 Legacy: Preferences", canonical: "GavJZkAu", endpoint_count: "1+", last_modified: "2025-12-20 00:56:08+0000", tags: ["📦 legacy", "👤 user", "⚙️ settings"] },
  { api_group_id: 532, name: "🔧 MCP: Tasks", canonical: "4psV7fp6", endpoint_count: "1+", last_modified: "2025-12-20 00:55:56+0000", tags: ["🔧 mcp", "📅 tasks", "🧪 test"] },
  { api_group_id: 531, name: "🔧 MCP: Seeding", canonical: "2kCRUYxG", endpoint_count: "1+", last_modified: "2025-12-20 00:55:58+0000", tags: ["🔧 mcp", "📊 data", "🧪 test"] },
  { api_group_id: 519, name: "🔐 Auth", canonical: "i6a062_x", endpoint_count: "1+", last_modified: "2025-12-20 00:55:43+0000", tags: ["🔐 auth", "👤 user", "🔑 security"] },
  { api_group_id: 515, name: "🚀 Frontend API v2", canonical: "pe1wjL5I", endpoint_count: "1+", last_modified: "2025-12-20 04:53:44+0000", tags: ["🚀 frontend", "✨ v2", "📊 all-features"] },
  { api_group_id: 364, name: "📦 Legacy: Auth 2FA", canonical: "js21O_y5", endpoint_count: "1+", last_modified: "2025-12-20 00:56:01+0000", tags: ["📦 legacy", "🔐 auth", "🔒 security"] },
  { api_group_id: 361, name: "📦 Legacy: Notifications", canonical: "PFPOc_Ym", endpoint_count: "1+", last_modified: "2025-12-20 00:56:11+0000", tags: ["📦 legacy", "🔔 notification", "👤 user"] },
  { api_group_id: 344, name: "📦 Legacy: Charts", canonical: "Y2N55_il", endpoint_count: "1+", last_modified: "2025-12-20 00:55:53+0000", tags: ["📦 legacy", "📊 analytics", "📈 charts"] },
  { api_group_id: 337, name: "🗑️ Delete: Auto CRUD", canonical: "rC-g75e2", endpoint_count: "1+", last_modified: "2025-12-20 00:56:16+0000", tags: ["🗑️ delete", "⚙️ system", "📦 unused"] },
  { api_group_id: 340, name: "📥 Webhook: Stripe", canonical: "ihFeqSDq", endpoint_count: "1+", last_modified: "2025-12-20 00:56:44+0000", tags: ["📥 webhook", "💳 stripe", "💰 billing"] },
  { api_group_id: 345, name: "📦 Legacy: Onboarding", canonical: "LxaOlI7l", endpoint_count: "1+", last_modified: "2025-12-20 00:56:07+0000", tags: ["📦 legacy", "📥 onboarding", "👤 user"] },
  { api_group_id: 348, name: "📥 Webhook: FUB", canonical: "sCYsDnFD", endpoint_count: "1+", last_modified: "2025-12-20 00:56:40+0000", tags: ["📥 webhook", "🔗 fub", "🔗 integration"] },
  { api_group_id: 349, name: "📦 Legacy: CSV Import", canonical: "SuvFkHvn", endpoint_count: "1+", last_modified: "2025-12-20 01:24:37+0000", tags: ["📦 legacy", "📝 import"] },
  { api_group_id: 346, name: "📦 Legacy: Workers", canonical: "Cmzol9bx", endpoint_count: "1+", last_modified: "2025-12-20 00:56:13+0000", tags: ["📦 legacy", "⚙️ workers", "🔄 background"] },
  { api_group_id: 342, name: "📦 Legacy: Dashboard", canonical: "3xoq5P6L", endpoint_count: "1+", last_modified: "2025-12-20 00:55:44+0000", tags: ["📦 legacy", "🏠 dashboard", "🎯 frontend"] },
  { api_group_id: 355, name: "📦 Legacy: Luzmo", canonical: "2peMX3H6", endpoint_count: "1+", last_modified: "2025-12-20 01:24:41+0000", tags: ["📦 legacy", "📊 analytics"] },
  { api_group_id: 343, name: "📦 Legacy: Individual", canonical: "YjYZueIH", endpoint_count: "1+", last_modified: "2025-12-20 00:55:46+0000", tags: ["📦 legacy", "👤 user", "📊 data"] },
  { api_group_id: 339, name: "📦 Legacy: Team", canonical: "Dz8JDa7D", endpoint_count: "1+", last_modified: "2025-12-20 00:55:48+0000", tags: ["📦 legacy", "👥 team", "📊 data"] },
  { api_group_id: 341, name: "📦 Legacy: Auth", canonical: "GN3xP4iV", endpoint_count: "1+", last_modified: "2025-12-20 00:55:58+0000", tags: ["📦 legacy", "🔐 auth", "🎯 frontend"] },
]

// Helper functions
export function getAllTables() {
  return TABLES_DATA
}

export function getAllAPIGroups() {
  return API_GROUPS_DATA
}

export function getTableStats() {
  const tables = TABLES_DATA
  const total = tables.length
  const withData = tables.filter(t => t.record_count === "1+" || (typeof t.record_count === "number" && t.record_count > 0)).length
  const empty = tables.filter(t => t.record_count === 0).length

  return { total, withData, empty }
}

export function getAPIStats() {
  const groups = API_GROUPS_DATA
  const total = groups.length
  const legacy = groups.filter(g => g.name.includes("Legacy")).length
  const mcp = groups.filter(g => g.name.includes("MCP")).length
  const webhooks = groups.filter(g => g.name.includes("Webhook")).length

  return { total, legacy, mcp, webhooks }
}
