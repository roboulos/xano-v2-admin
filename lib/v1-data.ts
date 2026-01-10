// V1 Workspace Data - AgentDashboards Production (Workspace 1)
// Instance: xmpx-swi5-tlvy.n7c.xano.io
// 251 tables - Complete listing from Xano MCP

export type V1Category =
  | "core"           // Core business entities
  | "aggregation"    // Pre-computed aggregations
  | "fub"            // Follow Up Boss integration
  | "rezen"          // Rezen integration
  | "skyslope"       // SkySlope integration
  | "dotloop"        // DotLoop integration
  | "lofty"          // Lofty integration
  | "stripe"         // Stripe/billing
  | "pagebuilder"    // Page builder system
  | "charts"         // Charts and visualization
  | "lambda"         // Lambda job processing
  | "logs"           // Logging and audit
  | "ai"             // AI/NORA features
  | "staging"        // Staging/import tables
  | "config"         // Configuration tables
  | "other"          // Other/miscellaneous

export interface V1Table {
  id: number
  name: string
  label: string
  category: V1Category
  description: string
  tags?: string[]
}

// V1 Tables - All 251 tables from the production workspace
export const V1_TABLES: V1Table[] = [
  // ═══════════════════════════════════════════════════════════════
  // CORE TABLES (25)
  // ═══════════════════════════════════════════════════════════════
  { id: 36, name: "agent", label: "Agent", category: "core", description: "Agent profiles and identity" },
  { id: 174, name: "agent - real", label: "Agent Real", category: "core", description: "Real agent data" },
  { id: 171, name: "agent_task_history", label: "Agent Task History", category: "core", description: "Agent task tracking" },
  { id: 41, name: "user", label: "User", category: "core", description: "Login accounts with role/view fields" },
  { id: 358, name: "user - 2FA", label: "User 2FA", category: "core", description: "Two-factor authentication" },
  { id: 29, name: "team", label: "Team", category: "core", description: "Team entities" },
  { id: 151, name: "team - admins", label: "Team Admins", category: "core", description: "Team admin roles" },
  { id: 1015, name: "team_admins_permissions", label: "Team Admin Permissions", category: "core", description: "Admin permission assignments" },
  { id: 708, name: "team - member levels", label: "Team Member Levels", category: "core", description: "Member level definitions" },
  { id: 93, name: "team - owners", label: "Team Owners", category: "core", description: "Team ownership records" },
  { id: 97, name: "team - roster", label: "Team Roster", category: "core", description: "Team membership (roster)" },
  { id: 48, name: "network", label: "Network", category: "core", description: "Downline/sponsorship tree" },
  { id: 145, name: "network - change log", label: "Network Change Log", category: "core", description: "Network change audit" },
  { id: 34, name: "transaction", label: "Transaction", category: "core", description: "All transactions" },
  { id: 40, name: "listing", label: "Listing", category: "core", description: "Property listings" },
  { id: 39, name: "participant", label: "Participant", category: "core", description: "Transaction participants" },
  { id: 43, name: "paid participant", label: "Paid Participant", category: "core", description: "Paid participant records" },
  { id: 194, name: "paid participant_temp", label: "Paid Participant Temp", category: "core", description: "Temporary paid participant data" },
  { id: 51, name: "contributions", label: "Contributions", category: "core", description: "Rev share contribution records" },
  { id: 135, name: "contributions - pending", label: "Contributions Pending", category: "core", description: "Pending contributions" },
  { id: 50, name: "contributors", label: "Contributors", category: "core", description: "Contributor records" },
  { id: 109, name: "income", label: "Income", category: "core", description: "Income records" },
  { id: 56, name: "revShare totals", label: "RevShare Totals", category: "core", description: "Aggregated rev share totals" },
  { id: 114, name: "connections", label: "Connections", category: "core", description: "User connections" },
  { id: 83, name: "leads", label: "Leads", category: "core", description: "Lead records" },

  // ═══════════════════════════════════════════════════════════════
  // DIRECTORS/LEADERS/MENTORS (8)
  // ═══════════════════════════════════════════════════════════════
  { id: 92, name: "directors", label: "Directors", category: "core", description: "Director roles" },
  { id: 98, name: "director assignments", label: "Director Assignments", category: "core", description: "Director to team assignments" },
  { id: 88, name: "leaders", label: "Leaders", category: "core", description: "Leader roles" },
  { id: 99, name: "leader assignments", label: "Leader Assignments", category: "core", description: "Leader to team assignments" },
  { id: 94, name: "mentors", label: "Mentors", category: "core", description: "Mentor roles" },
  { id: 100, name: "mentor assignments", label: "Mentor Assignments", category: "core", description: "Mentor to team assignments" },
  { id: 102, name: "domestic partnership", label: "Domestic Partnership", category: "core", description: "Partnership records" },
  { id: 103, name: "domestic partnership roster", label: "Domestic Partnership Roster", category: "core", description: "Partnership membership" },

  // ═══════════════════════════════════════════════════════════════
  // AGGREGATION TABLES (50)
  // ═══════════════════════════════════════════════════════════════
  { id: 963, name: "agg_anomalies_detected", label: "Agg Anomalies Detected", category: "aggregation", description: "AI-detected anomalies", tags: ["ai", "nora"] },
  { id: 970, name: "agg_benchmarks", label: "Agg Benchmarks", category: "aggregation", description: "Performance benchmarks", tags: ["ai"] },
  { id: 1008, name: "agg_calls_by_direction", label: "Agg Calls By Direction", category: "aggregation", description: "FUB calls by direction", tags: ["fub", "v2"] },
  { id: 1009, name: "agg_calls_by_outcome", label: "Agg Calls By Outcome", category: "aggregation", description: "FUB calls by outcome", tags: ["fub", "v2"] },
  { id: 1007, name: "agg_events_by_source", label: "Agg Events By Source", category: "aggregation", description: "Events by source", tags: ["fub", "v2"] },
  { id: 1006, name: "agg_events_by_type", label: "Agg Events By Type", category: "aggregation", description: "Events by type", tags: ["fub", "v2"] },
  { id: 1004, name: "agg_fub_activity_by_agent", label: "Agg FUB Activity By Agent", category: "aggregation", description: "FUB activity leaderboard", tags: ["fub", "leaderboard", "v2"] },
  { id: 1003, name: "agg_fub_activity_by_month", label: "Agg FUB Activity By Month", category: "aggregation", description: "FUB activity by month", tags: ["fub", "v2"] },
  { id: 962, name: "agg_funnel_conversion", label: "Agg Funnel Conversion", category: "aggregation", description: "Funnel conversion metrics", tags: ["ai"] },
  { id: 957, name: "agg_leads_by_agent", label: "Agg Leads By Agent", category: "aggregation", description: "Leads leaderboard", tags: ["fub", "leaderboard"] },
  { id: 953, name: "agg_leads_by_month", label: "Agg Leads By Month", category: "aggregation", description: "Leads by month", tags: ["fub"] },
  { id: 954, name: "agg_leads_by_source", label: "Agg Leads By Source", category: "aggregation", description: "Leads by source", tags: ["fub"] },
  { id: 955, name: "agg_leads_by_stage", label: "Agg Leads By Stage", category: "aggregation", description: "Leads by stage", tags: ["fub"] },
  { id: 956, name: "agg_leads_conversion_funnel", label: "Agg Leads Conversion Funnel", category: "aggregation", description: "Lead conversion funnel", tags: ["fub"] },
  { id: 941, name: "agg_listings_by_agent", label: "Agg Listings By Agent", category: "aggregation", description: "Listings leaderboard", tags: ["listing", "leaderboard"] },
  { id: 940, name: "agg_listings_by_dom_bucket", label: "Agg Listings By DOM Bucket", category: "aggregation", description: "Listings by days on market", tags: ["listing"] },
  { id: 937, name: "agg_listings_by_month", label: "Agg Listings By Month", category: "aggregation", description: "Listings by month", tags: ["listing"] },
  { id: 939, name: "agg_listings_by_property_type", label: "Agg Listings By Property Type", category: "aggregation", description: "Listings by property type", tags: ["listing"] },
  { id: 938, name: "agg_listings_by_stage", label: "Agg Listings By Stage", category: "aggregation", description: "Listings by stage", tags: ["listing"] },
  { id: 952, name: "agg_network_by_geo", label: "Agg Network By Geo", category: "aggregation", description: "Network by geography", tags: ["network"] },
  { id: 948, name: "agg_network_by_month", label: "Agg Network By Month", category: "aggregation", description: "Network recruitment by month", tags: ["network"] },
  { id: 949, name: "agg_network_by_status", label: "Agg Network By Status", category: "aggregation", description: "Network by status", tags: ["network"] },
  { id: 947, name: "agg_network_by_tier", label: "Agg Network By Tier", category: "aggregation", description: "Network by revshare tier", tags: ["network", "revshare"] },
  { id: 974, name: "agg_network_by_week", label: "Agg Network By Week", category: "aggregation", description: "Network by week", tags: ["network", "v2"] },
  { id: 950, name: "agg_network_recruitment_funnel", label: "Agg Network Recruitment Funnel", category: "aggregation", description: "Recruitment funnel", tags: ["network"] },
  { id: 951, name: "agg_network_revshare_by_month", label: "Agg Network Revshare By Month", category: "aggregation", description: "Revshare by month", tags: ["network", "revshare"] },
  { id: 959, name: "agg_pacing_daily", label: "Agg Pacing Daily", category: "aggregation", description: "Daily pacing metrics", tags: ["ai", "nora"] },
  { id: 961, name: "agg_pipeline_velocity", label: "Agg Pipeline Velocity", category: "aggregation", description: "Pipeline velocity", tags: ["ai"] },
  { id: 971, name: "aggregation_jobs", label: "Aggregation Jobs", category: "aggregation", description: "Queue for aggregation tasks", tags: ["queue", "v2"] },
  { id: 945, name: "agg_revenue_by_agent", label: "Agg Revenue By Agent", category: "aggregation", description: "Revenue leaderboard", tags: ["revenue", "leaderboard"] },
  { id: 944, name: "agg_revenue_by_deduction_type", label: "Agg Revenue By Deduction Type", category: "aggregation", description: "Revenue by deduction", tags: ["revenue"] },
  { id: 942, name: "agg_revenue_by_month", label: "Agg Revenue By Month", category: "aggregation", description: "Revenue by month", tags: ["revenue"] },
  { id: 973, name: "agg_revenue_by_week", label: "Agg Revenue By Week", category: "aggregation", description: "Revenue by week", tags: ["revenue", "v2"] },
  { id: 943, name: "agg_revenue_waterfall", label: "Agg Revenue Waterfall", category: "aggregation", description: "Revenue waterfall", tags: ["revenue"] },
  { id: 946, name: "agg_revenue_ytd", label: "Agg Revenue YTD", category: "aggregation", description: "Year to date revenue", tags: ["revenue"] },
  { id: 964, name: "agg_risk_flags_current", label: "Agg Risk Flags Current", category: "aggregation", description: "Current risk flags", tags: ["ai", "nora"] },
  { id: 958, name: "agg_targets", label: "Agg Targets", category: "aggregation", description: "Goals/targets", tags: ["ai"] },
  { id: 979, name: "agg_team_leaderboard", label: "Agg Team Leaderboard", category: "aggregation", description: "Team leaderboard", tags: ["leaderboard"] },
  { id: 1010, name: "agg_texts_by_direction", label: "Agg Texts By Direction", category: "aggregation", description: "Text messages by direction", tags: ["fub", "v2"] },
  { id: 934, name: "agg_transactions_by_agent", label: "Agg Transactions By Agent", category: "aggregation", description: "Transactions leaderboard", tags: ["transaction", "leaderboard"] },
  { id: 935, name: "agg_transactions_by_geo", label: "Agg Transactions By Geo", category: "aggregation", description: "Transactions by geography", tags: ["transaction"] },
  { id: 931, name: "agg_transactions_by_month", label: "Agg Transactions By Month", category: "aggregation", description: "Transactions by month", tags: ["transaction"] },
  { id: 932, name: "agg_transactions_by_stage", label: "Agg Transactions By Stage", category: "aggregation", description: "Transactions by stage", tags: ["transaction"] },
  { id: 933, name: "agg_transactions_by_type", label: "Agg Transactions By Type", category: "aggregation", description: "Transactions by type", tags: ["transaction"] },
  { id: 972, name: "agg_transactions_by_week", label: "Agg Transactions By Week", category: "aggregation", description: "Transactions by week", tags: ["transaction", "v2"] },
  { id: 936, name: "agg_transactions_yoy", label: "Agg Transactions YoY", category: "aggregation", description: "Year over year transactions", tags: ["transaction"] },
  { id: 980, name: "leaderboard_jobs", label: "Leaderboard Jobs", category: "aggregation", description: "Leaderboard aggregation queue", tags: ["queue", "leaderboard"] },

  // ═══════════════════════════════════════════════════════════════
  // FUB - FOLLOW UP BOSS (18)
  // ═══════════════════════════════════════════════════════════════
  { id: 121, name: "FUB - accounts", label: "FUB Accounts", category: "fub", description: "Follow Up Boss account connections" },
  { id: 124, name: "FUB - appointments", label: "FUB Appointments", category: "fub", description: "FUB appointment sync" },
  { id: 117, name: "FUB - calls", label: "FUB Calls", category: "fub", description: "FUB call log sync" },
  { id: 154, name: "FUB - deals", label: "FUB Deals", category: "fub", description: "FUB deals" },
  { id: 156, name: "FUB - events", label: "FUB Events", category: "fub", description: "FUB events" },
  { id: 123, name: "FUB - groups", label: "FUB Groups", category: "fub", description: "FUB groups" },
  { id: 170, name: "FUB - Lambda Coordinator Worker Log", label: "FUB Lambda Coordinator", category: "fub", description: "FUB Lambda job logs" },
  { id: 189, name: "FUB - missing people id", label: "FUB Missing People ID", category: "fub", description: "FUB people with missing IDs" },
  { id: 188, name: "FUB - onboarding jobs", label: "FUB Onboarding Jobs", category: "fub", description: "FUB onboarding job queue" },
  { id: 118, name: "FUB - people", label: "FUB People", category: "fub", description: "FUB contacts sync" },
  { id: 119, name: "FUB - stages", label: "FUB Stages", category: "fub", description: "FUB deal stages" },
  { id: 187, name: "FUB - sync jobs", label: "FUB Sync Jobs", category: "fub", description: "FUB sync job queue" },
  { id: 181, name: "FUB_Temp_Bulk_Appointment_Data", label: "FUB Temp Bulk Appointments", category: "fub", description: "Temp appointment data" },
  { id: 127, name: "FUB - text messages", label: "FUB Text Messages", category: "fub", description: "FUB SMS sync" },
  { id: 78, name: "FUB - users", label: "FUB Users", category: "fub", description: "FUB users" },
  { id: 1011, name: "fub_aggregation_jobs", label: "FUB Aggregation Jobs", category: "fub", description: "FUB aggregation queue", tags: ["queue", "v2"] },
  { id: 213, name: "appointments - fub - onboarding - stage", label: "FUB Appointments Staging", category: "staging", description: "FUB appointment staging" },
  { id: 210, name: "text messages - fub - onboarding - stage", label: "FUB Text Messages Staging", category: "staging", description: "FUB text staging" },

  // ═══════════════════════════════════════════════════════════════
  // REZEN INTEGRATION (12)
  // ═══════════════════════════════════════════════════════════════
  { id: 96, name: "rezen - onboarding jobs", label: "Rezen Onboarding Jobs", category: "rezen", description: "Rezen onboarding job queue" },
  { id: 173, name: "rezen - sync jobs", label: "Rezen Sync Jobs", category: "rezen", description: "Rezen sync job queue" },
  { id: 214, name: "rezen - sync jobs - logs", label: "Rezen Sync Jobs Logs", category: "rezen", description: "Rezen sync logs" },
  { id: 362, name: "contributions - rezen - daily sync - stage", label: "Contributions Rezen Daily Staging", category: "staging", description: "Rezen contribution daily staging" },
  { id: 203, name: "contributions - rezen - onboarding - stage", label: "Contributions Rezen Onboarding Staging", category: "staging", description: "Rezen contribution onboarding staging" },
  { id: 198, name: "listings - rezen - onboarding - stage", label: "Listings Rezen Staging", category: "staging", description: "Rezen listing staging" },
  { id: 202, name: "network downline - rezen - onboarding - stage", label: "Network Rezen Staging", category: "staging", description: "Rezen network staging" },
  { id: 195, name: "transactions - rezen - onboarding - stage", label: "Transactions Rezen Staging", category: "staging", description: "Rezen transaction staging" },
  { id: 206, name: "referral code - rezen", label: "Referral Code Rezen", category: "rezen", description: "Rezen referral codes" },
  { id: 207, name: "process webhook - rezen", label: "Process Webhook Rezen", category: "rezen", description: "Rezen webhook processing" },
  { id: 201, name: "webhooks - registered rezen", label: "Webhooks Registered Rezen", category: "rezen", description: "Registered Rezen webhooks" },
  { id: 359, name: "pending contribution - rezen - stage", label: "Pending Contribution Rezen Staging", category: "staging", description: "Pending Rezen contributions" },

  // ═══════════════════════════════════════════════════════════════
  // SKYSLOPE INTEGRATION (4)
  // ═══════════════════════════════════════════════════════════════
  { id: 175, name: "skyslope - sync jobs", label: "SkySlope Sync Jobs", category: "skyslope", description: "SkySlope sync job queue" },
  { id: 182, name: "listing - skyslope - staging", label: "Listing SkySlope Staging", category: "staging", description: "SkySlope listing staging" },
  { id: 177, name: "transactions - skyslope - staging", label: "Transactions SkySlope Staging", category: "staging", description: "SkySlope transaction staging" },

  // ═══════════════════════════════════════════════════════════════
  // DOTLOOP INTEGRATION (6)
  // ═══════════════════════════════════════════════════════════════
  { id: 713, name: "dotloop_accounts", label: "DotLoop Accounts", category: "dotloop", description: "DotLoop account connections" },
  { id: 716, name: "dotloop_contacts", label: "DotLoop Contacts", category: "dotloop", description: "DotLoop contacts sync" },
  { id: 715, name: "dotloop_loops", label: "DotLoop Loops", category: "dotloop", description: "DotLoop transactions" },
  { id: 714, name: "dotloop_profiles", label: "DotLoop Profiles", category: "dotloop", description: "DotLoop profiles" },
  { id: 718, name: "dotloop_staging", label: "DotLoop Staging", category: "staging", description: "DotLoop import staging" },
  { id: 717, name: "dotloop_sync_state", label: "DotLoop Sync State", category: "dotloop", description: "DotLoop sync tracking" },

  // ═══════════════════════════════════════════════════════════════
  // LOFTY INTEGRATION (4)
  // ═══════════════════════════════════════════════════════════════
  { id: 886, name: "lofty_accounts", label: "Lofty Accounts", category: "lofty", description: "Lofty account connections" },
  { id: 888, name: "lofty_leads", label: "Lofty Leads", category: "lofty", description: "Lofty leads sync" },
  { id: 887, name: "lofty_staging", label: "Lofty Staging", category: "staging", description: "Lofty import staging" },
  { id: 889, name: "lofty_sync_state", label: "Lofty Sync State", category: "lofty", description: "Lofty sync tracking" },

  // ═══════════════════════════════════════════════════════════════
  // STRIPE / BILLING (8)
  // ═══════════════════════════════════════════════════════════════
  { id: 38, name: "stripe - pricing", label: "Stripe Pricing", category: "stripe", description: "Stripe pricing data" },
  { id: 208, name: "stripe - product", label: "Stripe Product", category: "stripe", description: "Stripe products" },
  { id: 150, name: "stripe - subscription packages", label: "Stripe Subscription Packages", category: "stripe", description: "Subscription packages" },
  { id: 37, name: "stripe - subscriptions", label: "Stripe Subscriptions", category: "stripe", description: "Active subscriptions" },
  { id: 894, name: "plan_features", label: "Plan Features", category: "stripe", description: "Pricing plan features" },
  { id: 28, name: "commission payment", label: "Commission Payment", category: "stripe", description: "Commission payments" },
  { id: 75, name: "commission plan", label: "Commission Plan", category: "stripe", description: "Commission plans" },
  { id: 79, name: "outgoing_payments", label: "Outgoing Payments", category: "stripe", description: "Outgoing payment records" },

  // ═══════════════════════════════════════════════════════════════
  // PAGE BUILDER (12)
  // ═══════════════════════════════════════════════════════════════
  { id: 908, name: "pages", label: "Pages", category: "pagebuilder", description: "Page definitions" },
  { id: 909, name: "page_tabs", label: "Page Tabs", category: "pagebuilder", description: "Tab definitions" },
  { id: 910, name: "page_sections", label: "Page Sections", category: "pagebuilder", description: "Section definitions" },
  { id: 911, name: "page_widgets", label: "Page Widgets", category: "pagebuilder", description: "Widget placements" },
  { id: 913, name: "page_filters", label: "Page Filters", category: "pagebuilder", description: "Filter definitions" },
  { id: 914, name: "filter_options", label: "Filter Options", category: "pagebuilder", description: "Filter option values" },
  { id: 1000, name: "page_layouts", label: "Page Layouts", category: "pagebuilder", description: "Grid layouts for code-based pages" },
  { id: 1002, name: "page_chart_assignments", label: "Page Chart Assignments", category: "pagebuilder", description: "Chart to page assignments" },
  { id: 916, name: "widget_viewport_layouts", label: "Widget Viewport Layouts", category: "pagebuilder", description: "Responsive viewport layouts" },
  { id: 915, name: "user_filter_preferences", label: "User Filter Preferences", category: "pagebuilder", description: "User filter settings" },
  { id: 999, name: "user_page_layouts", label: "User Page Layouts", category: "pagebuilder", description: "User layout preferences" },
  { id: 891, name: "user_dashboard_sections", label: "User Dashboard Sections", category: "pagebuilder", description: "Dashboard section config" },

  // ═══════════════════════════════════════════════════════════════
  // CHARTS (8)
  // ═══════════════════════════════════════════════════════════════
  { id: 884, name: "chart_catalog", label: "Chart Catalog", category: "charts", description: "Available charts" },
  { id: 903, name: "chart_types", label: "Chart Types", category: "charts", description: "Chart type definitions" },
  { id: 904, name: "chart_libraries", label: "Chart Libraries", category: "charts", description: "Chart library config" },
  { id: 513, name: "charts", label: "Charts", category: "charts", description: "Chart instances" },
  { id: 998, name: "code_chart_catalog", label: "Code Chart Catalog", category: "charts", description: "Code-based charts" },
  { id: 161, name: "chart - transactions", label: "Chart Transactions", category: "charts", description: "Transaction charts" },
  { id: 885, name: "my_dashboard_configuration", label: "My Dashboard Configuration", category: "charts", description: "User dashboard config" },
  { id: 883, name: "kpi_goals", label: "KPI Goals", category: "charts", description: "KPI goal definitions" },

  // ═══════════════════════════════════════════════════════════════
  // AI / NORA (10)
  // ═══════════════════════════════════════════════════════════════
  { id: 917, name: "ai_chart_conversations", label: "AI Chart Conversations", category: "ai", description: "AI chart conversations" },
  { id: 965, name: "ai_features_agent_period", label: "AI Features Agent Period", category: "ai", description: "AI agent features by period" },
  { id: 967, name: "ai_features_lead_current", label: "AI Features Lead Current", category: "ai", description: "AI lead features" },
  { id: 966, name: "ai_features_pipeline_current", label: "AI Features Pipeline Current", category: "ai", description: "AI pipeline features" },
  { id: 720, name: "nora_conversations", label: "NORA Conversations", category: "ai", description: "NORA AI conversations" },
  { id: 995, name: "user_insights", label: "User Insights", category: "ai", description: "AI-generated user insights" },
  { id: 996, name: "user_actions", label: "User Actions", category: "ai", description: "AI-tracked user actions" },
  { id: 960, name: "snap_metrics_daily", label: "Snap Metrics Daily", category: "ai", description: "Daily metric snapshots" },
  { id: 969, name: "dim_status_mapping", label: "Dim Status Mapping", category: "ai", description: "Status dimension mapping" },
  { id: 968, name: "dim_time_periods", label: "Dim Time Periods", category: "ai", description: "Time period dimensions" },

  // ═══════════════════════════════════════════════════════════════
  // LAMBDA JOBS (6)
  // ═══════════════════════════════════════════════════════════════
  { id: 162, name: "lambda jobs - log", label: "Lambda Jobs Log", category: "lambda", description: "Lambda job logs" },
  { id: 163, name: "lambda jobs - status", label: "Lambda Jobs Status", category: "lambda", description: "Lambda job status tracking" },
  { id: 165, name: "lambda_worker_log", label: "Lambda Worker Log", category: "lambda", description: "Worker-level logs" },
  { id: 167, name: "lambda_failed_record", label: "Lambda Failed Record", category: "lambda", description: "Failed record tracking" },
  { id: 133, name: "api workers", label: "API Workers", category: "lambda", description: "API worker status" },

  // ═══════════════════════════════════════════════════════════════
  // LOGS & AUDIT (14)
  // ═══════════════════════════════════════════════════════════════
  { id: 111, name: "audits", label: "Audits", category: "logs", description: "Audit records" },
  { id: 129, name: "system audit", label: "System Audit", category: "logs", description: "System audit log" },
  { id: 186, name: "error logs", label: "Error Logs", category: "logs", description: "Error logging" },
  { id: 132, name: "event log", label: "Event Log", category: "logs", description: "Event logging" },
  { id: 211, name: "email - logs", label: "Email Logs", category: "logs", description: "Email sending logs" },
  { id: 212, name: "email - master", label: "Email Master", category: "logs", description: "Email master records" },
  { id: 130, name: "log - contributions", label: "Log Contributions", category: "logs", description: "Contribution change log" },
  { id: 131, name: "log - network", label: "Log Network", category: "logs", description: "Network change log" },
  { id: 160, name: "log - api keys", label: "Log API Keys", category: "logs", description: "API key usage log" },
  { id: 975, name: "deleted_records_audit", label: "Deleted Records Audit", category: "logs", description: "Deleted record tracking" },
  { id: 976, name: "transaction_stage_log", label: "Transaction Stage Log", category: "logs", description: "Transaction stage changes" },
  { id: 977, name: "transaction_effective_close_date_log", label: "Transaction Close Date Log", category: "logs", description: "Close date changes" },
  { id: 978, name: "transaction_price_log", label: "Transaction Price Log", category: "logs", description: "Price changes" },
  { id: 719, name: "contact_log", label: "Contact Log", category: "logs", description: "Contact/CRM log" },

  // ═══════════════════════════════════════════════════════════════
  // CONFIG & REFERENCE (20)
  // ═══════════════════════════════════════════════════════════════
  { id: 80, name: "api_keys", label: "API Keys", category: "config", description: "API key management" },
  { id: 81, name: "brokerage", label: "Brokerage", category: "config", description: "Brokerage records" },
  { id: 35, name: "office", label: "Office", category: "config", description: "Office records" },
  { id: 95, name: "global variables", label: "Global Variables", category: "config", description: "Global configuration" },
  { id: 149, name: "permissions", label: "Permissions", category: "config", description: "Permission definitions" },
  { id: 148, name: "modules", label: "Modules", category: "config", description: "Module definitions" },
  { id: 112, name: "state or province", label: "State Province", category: "config", description: "State/province lookup" },
  { id: 49, name: "calendar", label: "Calendar", category: "config", description: "Calendar reference" },
  { id: 143, name: "tags", label: "Tags", category: "config", description: "Tag definitions" },
  { id: 47, name: "integration", label: "Integration", category: "config", description: "Integration configs" },
  { id: 71, name: "rev share payments", label: "Rev Share Payments", category: "config", description: "Revshare payment config" },
  { id: 76, name: "revshare plan", label: "RevShare Plan", category: "config", description: "Revshare plan definitions" },
  { id: 77, name: "sponsor tree", label: "Sponsor Tree", category: "config", description: "Sponsor tree config" },
  { id: 73, name: "real - lifecycle group", label: "Real Lifecycle Group", category: "config", description: "Lifecycle group config" },
  { id: 140, name: "lead source - defaults", label: "Lead Source Defaults", category: "config", description: "Default lead sources" },
  { id: 142, name: "lead source - user", label: "Lead Source User", category: "config", description: "User lead sources" },
  { id: 1005, name: "dashboard_templates", label: "Dashboard Templates", category: "config", description: "Dashboard templates" },
  { id: 1012, name: "report_templates", label: "Report Templates", category: "config", description: "Report templates" },
  { id: 1016, name: "onboarding_progress", label: "Onboarding Progress", category: "config", description: "User onboarding tracking" },

  // ═══════════════════════════════════════════════════════════════
  // LUZMO (3)
  // ═══════════════════════════════════════════════════════════════
  { id: 159, name: "luzmo - charts", label: "Luzmo Charts", category: "charts", description: "Luzmo chart config" },
  { id: 157, name: "luzmo - collections", label: "Luzmo Collections", category: "charts", description: "Luzmo collections" },
  { id: 158, name: "luzmo - dashboards", label: "Luzmo Dashboards", category: "charts", description: "Luzmo dashboards" },

  // ═══════════════════════════════════════════════════════════════
  // EQUITY (3)
  // ═══════════════════════════════════════════════════════════════
  { id: 52, name: "equity - annual", label: "Equity Annual", category: "core", description: "Annual equity records" },
  { id: 68, name: "equity - monthly", label: "Equity Monthly", category: "core", description: "Monthly equity records" },
  { id: 85, name: "equity - transactions", label: "Equity Transactions", category: "core", description: "Equity transaction records" },

  // ═══════════════════════════════════════════════════════════════
  // TITLE/CLOSING (6)
  // ═══════════════════════════════════════════════════════════════
  { id: 45, name: "closing disclosure", label: "Closing Disclosure", category: "core", description: "Closing disclosures" },
  { id: 146, name: "title - closing items", label: "Title Closing Items", category: "core", description: "Title closing items" },
  { id: 141, name: "title - disbursements", label: "Title Disbursements", category: "core", description: "Title disbursements" },
  { id: 152, name: "title - event", label: "Title Event", category: "core", description: "Title events" },
  { id: 138, name: "title - orders", label: "Title Orders", category: "core", description: "Title orders" },
  { id: 139, name: "title - settlement agencies", label: "Title Settlement Agencies", category: "core", description: "Settlement agencies" },
  { id: 153, name: "title - users", label: "Title Users", category: "core", description: "Title company users" },

  // ═══════════════════════════════════════════════════════════════
  // PIPELINE (4)
  // ═══════════════════════════════════════════════════════════════
  { id: 196, name: "pipeline - prospects", label: "Pipeline Prospects", category: "core", description: "CRM prospects" },
  { id: 197, name: "pipeline - stages", label: "Pipeline Stages", category: "core", description: "Pipeline stage definitions" },
  { id: 200, name: "pipeline - prospect defaults", label: "Pipeline Prospect Defaults", category: "config", description: "Default prospect config" },
  { id: 199, name: "pipeline - stages defaults", label: "Pipeline Stages Defaults", category: "config", description: "Default stage config" },

  // ═══════════════════════════════════════════════════════════════
  // NOTIFICATIONS (4)
  // ═══════════════════════════════════════════════════════════════
  { id: 190, name: "notifications - items", label: "Notifications Items", category: "other", description: "Notification items" },
  { id: 204, name: "notification - default categories", label: "Notification Default Categories", category: "config", description: "Default notification categories" },
  { id: 205, name: "notification - user categories", label: "Notification User Categories", category: "config", description: "User notification preferences" },

  // ═══════════════════════════════════════════════════════════════
  // CHECKLISTS (3)
  // ═══════════════════════════════════════════════════════════════
  { id: 183, name: "checklists", label: "Checklists", category: "other", description: "Checklist definitions" },
  { id: 184, name: "checklist items", label: "Checklist Items", category: "other", description: "Checklist item definitions" },
  { id: 185, name: "checklist data", label: "Checklist Data", category: "other", description: "Checklist completion data" },

  // ═══════════════════════════════════════════════════════════════
  // OTHER / MISC (25)
  // ═══════════════════════════════════════════════════════════════
  { id: 191, name: "links", label: "Links", category: "other", description: "User links" },
  { id: 82, name: "bugs and feature request", label: "Bugs Feature Requests", category: "other", description: "Bug tracking" },
  { id: 59, name: "CSV_Imports", label: "CSV Imports", category: "other", description: "CSV import records" },
  { id: 892, name: "csv_mapping_templates", label: "CSV Mapping Templates", category: "other", description: "CSV mapping config" },
  { id: 893, name: "manual_csv_upload", label: "Manual CSV Upload", category: "other", description: "Manual CSV uploads" },
  { id: 113, name: "deduction item", label: "Deduction Item", category: "other", description: "Deduction items" },
  { id: 512, name: "demo_agent_mapping", label: "Demo Agent Mapping", category: "other", description: "Demo agent ID mapping" },
  { id: 1001, name: "demo_sync_log", label: "Demo Sync Log", category: "logs", description: "Demo sync operation log" },
  { id: 53, name: "front line - stats", label: "Front Line Stats", category: "other", description: "Front line statistics" },
  { id: 176, name: "invitations", label: "Invitations", category: "other", description: "User invitations" },
  { id: 72, name: "item", label: "Item", category: "other", description: "Generic items" },
  { id: 84, name: "leads - text messages", label: "Leads Text Messages", category: "other", description: "Lead text messages" },
  { id: 355, name: "metrics - snapshots", label: "Metrics Snapshots", category: "other", description: "Metric snapshots" },
  { id: 136, name: "mortgages", label: "Mortgages", category: "other", description: "Mortgage records" },
  { id: 144, name: "notes", label: "Notes", category: "other", description: "Notes/comments" },
  { id: 147, name: "performance - agent", label: "Performance Agent", category: "other", description: "Agent performance" },
  { id: 361, name: "raffle entries", label: "Raffle Entries", category: "other", description: "Raffle entry records" },
  { id: 1013, name: "user_reports", label: "User Reports", category: "other", description: "User-generated reports" },
  { id: 172, name: "user_task_history", label: "User Task History", category: "other", description: "User task tracking" },
  { id: 509, name: "user - transaction - team_raw_id assignment rules", label: "User Transaction Assignment Rules", category: "config", description: "Transaction assignment rules" },
  { id: 110, name: "waitlist", label: "Waitlist", category: "other", description: "Waitlist entries" },
  { id: 134, name: "webhook - events", label: "Webhook Events", category: "other", description: "Webhook events" },
  { id: 169, name: "website contacts", label: "Website Contacts", category: "other", description: "Website contact form" },
  { id: 511, name: "transaction - batch geocoding requests", label: "Transaction Batch Geocoding", category: "other", description: "Geocoding batch requests" },
  { id: 510, name: "transaction - bulk geocoding queue", label: "Transaction Bulk Geocoding Queue", category: "other", description: "Geocoding queue" },
  { id: 192, name: "transaction_temp", label: "Transaction Temp", category: "staging", description: "Temporary transaction data" },
  { id: 193, name: "temp_csv_data", label: "Temp CSV Data", category: "staging", description: "Temporary CSV data" },
  { id: 209, name: "temp_table", label: "Temp Table", category: "staging", description: "Temporary table" },
  { id: 997, name: "test_avatars", label: "Test Avatars", category: "other", description: "Test avatar data" },
]

export const V1_CATEGORIES = [
  { id: "core", label: "Core Tables", icon: "👤", description: "Core business entities" },
  { id: "aggregation", label: "Aggregation Tables", icon: "📊", description: "Pre-computed aggregations" },
  { id: "fub", label: "Follow Up Boss", icon: "📞", description: "FUB CRM integration" },
  { id: "rezen", label: "Rezen Integration", icon: "🔄", description: "Rezen data sync" },
  { id: "skyslope", label: "SkySlope", icon: "📝", description: "SkySlope integration" },
  { id: "dotloop", label: "DotLoop", icon: "🔗", description: "DotLoop integration" },
  { id: "lofty", label: "Lofty", icon: "🏠", description: "Lofty CRM integration" },
  { id: "stripe", label: "Stripe/Billing", icon: "💳", description: "Payments and subscriptions" },
  { id: "pagebuilder", label: "Page Builder", icon: "🎨", description: "Page builder system" },
  { id: "charts", label: "Charts", icon: "📈", description: "Charts and visualization" },
  { id: "ai", label: "AI/NORA", icon: "🤖", description: "AI and analytics features" },
  { id: "lambda", label: "Lambda Jobs", icon: "⚡", description: "Background job processing" },
  { id: "logs", label: "Logs & Audit", icon: "📋", description: "Logging and audit trails" },
  { id: "staging", label: "Staging/Import", icon: "📥", description: "Import staging tables" },
  { id: "config", label: "Configuration", icon: "⚙️", description: "System configuration" },
  { id: "other", label: "Other", icon: "📦", description: "Miscellaneous tables" },
]

export function getV1Tables(): V1Table[] {
  return V1_TABLES
}

export function getV1TablesByCategory(category: V1Category): V1Table[] {
  return V1_TABLES.filter(t => t.category === category)
}

export function getV1Stats(): Record<string, number> {
  const categories: Record<string, number> = {
    total: V1_TABLES.length
  }
  for (const table of V1_TABLES) {
    categories[table.category] = (categories[table.category] || 0) + 1
  }
  return categories
}

export function getV1CategoriesWithCounts() {
  const stats = getV1Stats()
  return V1_CATEGORIES.map(cat => ({
    ...cat,
    count: stats[cat.id] || 0
  }))
}
