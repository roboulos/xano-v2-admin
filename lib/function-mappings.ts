// Function Mappings for V1 → V2 Migration Orchestrator
// Maps V1 functions (500+) to their V2 equivalents
// Organized by category for easy navigation

import type { FunctionMapping, FunctionCategory, MappingType } from "@/types/mappings"

// ═══════════════════════════════════════════════════════════════
// FUNCTION MAPPINGS - Organized by Category
// ═══════════════════════════════════════════════════════════════

export const FUNCTION_MAPPINGS: FunctionMapping[] = [
  // ═══════════════════════════════════════════════════════════════
  // SYNC FUNCTIONS - FUB, Rezen, SkySlope, DotLoop, Lofty (75+ functions)
  // ═══════════════════════════════════════════════════════════════

  // FUB Sync Functions
  { v1_function: "Workers/sync_fub", v1_id: 10001, v2_functions: ["sync/fub_orchestrator"], v2_ids: [5001], type: "renamed", notes: "Main FUB sync orchestrator", category: "sync", folder: "Workers" },
  { v1_function: "FUB/fetch_people", v1_id: 10002, v2_functions: ["sync/fub/fetch_people"], v2_ids: [5002], type: "direct", notes: "Fetch contacts from FUB API", category: "sync", folder: "FUB" },
  { v1_function: "FUB/fetch_appointments", v1_id: 10003, v2_functions: ["sync/fub/fetch_appointments"], v2_ids: [5003], type: "direct", notes: "Fetch appointments from FUB", category: "sync", folder: "FUB" },
  { v1_function: "FUB/fetch_calls", v1_id: 10004, v2_functions: ["sync/fub/fetch_calls"], v2_ids: [5004], type: "direct", notes: "Fetch call logs from FUB", category: "sync", folder: "FUB" },
  { v1_function: "FUB/fetch_deals", v1_id: 10005, v2_functions: ["sync/fub/fetch_deals"], v2_ids: [5005], type: "direct", notes: "Fetch deals from FUB", category: "sync", folder: "FUB" },
  { v1_function: "FUB/fetch_events", v1_id: 10006, v2_functions: ["sync/fub/fetch_events"], v2_ids: [5006], type: "direct", notes: "Fetch events from FUB", category: "sync", folder: "FUB" },
  { v1_function: "FUB/fetch_groups", v1_id: 10007, v2_functions: ["sync/fub/fetch_groups"], v2_ids: [5007], type: "direct", notes: "Fetch groups from FUB", category: "sync", folder: "FUB" },
  { v1_function: "FUB/fetch_stages", v1_id: 10008, v2_functions: ["sync/fub/fetch_stages"], v2_ids: [5008], type: "direct", notes: "Fetch pipeline stages from FUB", category: "sync", folder: "FUB" },
  { v1_function: "FUB/fetch_text_messages", v1_id: 10009, v2_functions: ["sync/fub/fetch_text_messages"], v2_ids: [5009], type: "direct", notes: "Fetch SMS messages from FUB", category: "sync", folder: "FUB" },
  { v1_function: "FUB/fetch_users", v1_id: 10010, v2_functions: ["sync/fub/fetch_users"], v2_ids: [5010], type: "direct", notes: "Fetch users from FUB", category: "sync", folder: "FUB" },
  { v1_function: "FUB/process_onboarding", v1_id: 10011, v2_functions: ["sync/fub/process_onboarding_job"], v2_ids: [5011], type: "renamed", notes: "Process FUB onboarding jobs", category: "sync", folder: "FUB" },
  { v1_function: "FUB/process_sync_jobs", v1_id: 10012, v2_functions: ["sync/fub/process_sync_job"], v2_ids: [5012], type: "renamed", notes: "Process FUB sync jobs", category: "sync", folder: "FUB" },
  { v1_function: "FUB/upsert_people", v1_id: 10013, v2_functions: ["sync/fub/upsert_people"], v2_ids: [5013], type: "direct", notes: "Upsert FUB contacts", category: "sync", folder: "FUB" },
  { v1_function: "FUB/Lambda_Coordinator", v1_id: 10014, v2_functions: [], v2_ids: [], type: "deprecated", notes: "Lambda coordinator deprecated in V2 - using direct API calls", category: "sync", folder: "FUB" },
  { v1_function: "FUB/bulk_appointment_processing", v1_id: 10015, v2_functions: ["sync/fub/bulk_appointments"], v2_ids: [5015], type: "renamed", notes: "Bulk appointment processing", category: "sync", folder: "FUB" },

  // Rezen Sync Functions
  { v1_function: "Workers/sync_rezen", v1_id: 10020, v2_functions: ["sync/rezen_orchestrator"], v2_ids: [5020], type: "renamed", notes: "Main Rezen sync orchestrator", category: "sync", folder: "Workers" },
  { v1_function: "Rezen/fetch_agents", v1_id: 10021, v2_functions: ["sync/rezen/fetch_agents"], v2_ids: [5021], type: "direct", notes: "Fetch agents from Rezen API", category: "sync", folder: "Rezen" },
  { v1_function: "Rezen/fetch_transactions", v1_id: 10022, v2_functions: ["sync/rezen/fetch_transactions"], v2_ids: [5022], type: "direct", notes: "Fetch transactions from Rezen", category: "sync", folder: "Rezen" },
  { v1_function: "Rezen/fetch_listings", v1_id: 10023, v2_functions: ["sync/rezen/fetch_listings"], v2_ids: [5023], type: "direct", notes: "Fetch listings from Rezen", category: "sync", folder: "Rezen" },
  { v1_function: "Rezen/fetch_contributions", v1_id: 10024, v2_functions: ["sync/rezen/fetch_contributions"], v2_ids: [5024], type: "direct", notes: "Fetch contributions from Rezen", category: "sync", folder: "Rezen" },
  { v1_function: "Rezen/fetch_network", v1_id: 10025, v2_functions: ["sync/rezen/fetch_network"], v2_ids: [5025], type: "direct", notes: "Fetch network/downline from Rezen", category: "sync", folder: "Rezen" },
  { v1_function: "Rezen/process_webhook", v1_id: 10026, v2_functions: ["webhooks/rezen/process"], v2_ids: [5026], type: "renamed", notes: "Process Rezen webhooks", category: "sync", folder: "Rezen" },
  { v1_function: "Rezen/normalize_transaction", v1_id: 10027, v2_functions: ["sync/rezen/normalize_transaction"], v2_ids: [5027], type: "direct", notes: "Normalize Rezen transaction to internal schema", category: "sync", folder: "Rezen" },
  { v1_function: "Rezen/normalize_listing", v1_id: 10028, v2_functions: ["sync/rezen/normalize_listing"], v2_ids: [5028], type: "direct", notes: "Normalize Rezen listing to internal schema", category: "sync", folder: "Rezen" },
  { v1_function: "Rezen/process_onboarding", v1_id: 10029, v2_functions: ["sync/rezen/process_onboarding_job"], v2_ids: [5029], type: "renamed", notes: "Process Rezen onboarding", category: "sync", folder: "Rezen" },
  { v1_function: "Rezen/daily_sync", v1_id: 10030, v2_functions: ["sync/rezen/daily_sync"], v2_ids: [5030], type: "direct", notes: "Daily incremental Rezen sync", category: "sync", folder: "Rezen" },

  // SkySlope Sync Functions
  { v1_function: "Workers/sync_skyslope", v1_id: 10040, v2_functions: ["sync/skyslope_orchestrator"], v2_ids: [5040], type: "renamed", notes: "Main SkySlope sync orchestrator", category: "sync", folder: "Workers" },
  { v1_function: "SkySlope/fetch_transactions", v1_id: 10041, v2_functions: ["sync/skyslope/fetch_transactions"], v2_ids: [5041], type: "direct", notes: "Fetch transactions from SkySlope", category: "sync", folder: "SkySlope" },
  { v1_function: "SkySlope/fetch_listings", v1_id: 10042, v2_functions: ["sync/skyslope/fetch_listings"], v2_ids: [5042], type: "direct", notes: "Fetch listings from SkySlope", category: "sync", folder: "SkySlope" },
  { v1_function: "SkySlope/normalize_transaction", v1_id: 10043, v2_functions: ["sync/skyslope/normalize_transaction"], v2_ids: [5043], type: "direct", notes: "Normalize SkySlope transaction", category: "sync", folder: "SkySlope" },
  { v1_function: "SkySlope/normalize_listing", v1_id: 10044, v2_functions: ["sync/skyslope/normalize_listing"], v2_ids: [5044], type: "direct", notes: "Normalize SkySlope listing", category: "sync", folder: "SkySlope" },
  { v1_function: "SkySlope/process_staging", v1_id: 10045, v2_functions: ["sync/skyslope/process_staging"], v2_ids: [5045], type: "direct", notes: "Process SkySlope staging records", category: "sync", folder: "SkySlope" },

  // DotLoop Sync Functions
  { v1_function: "DotLoop/fetch_loops", v1_id: 10050, v2_functions: ["sync/dotloop/fetch_loops"], v2_ids: [5050], type: "direct", notes: "Fetch loops (transactions) from DotLoop", category: "sync", folder: "DotLoop" },
  { v1_function: "DotLoop/fetch_contacts", v1_id: 10051, v2_functions: ["sync/dotloop/fetch_contacts"], v2_ids: [5051], type: "direct", notes: "Fetch contacts from DotLoop", category: "sync", folder: "DotLoop" },
  { v1_function: "DotLoop/fetch_profiles", v1_id: 10052, v2_functions: ["sync/dotloop/fetch_profiles"], v2_ids: [5052], type: "direct", notes: "Fetch profiles from DotLoop", category: "sync", folder: "DotLoop" },
  { v1_function: "DotLoop/process_staging", v1_id: 10053, v2_functions: ["sync/dotloop/process_staging"], v2_ids: [5053], type: "direct", notes: "Process DotLoop staging records", category: "sync", folder: "DotLoop" },

  // Lofty Sync Functions
  { v1_function: "Lofty/fetch_leads", v1_id: 10060, v2_functions: ["sync/lofty/fetch_leads"], v2_ids: [5060], type: "direct", notes: "Fetch leads from Lofty", category: "sync", folder: "Lofty" },
  { v1_function: "Lofty/process_staging", v1_id: 10061, v2_functions: ["sync/lofty/process_staging"], v2_ids: [5061], type: "direct", notes: "Process Lofty staging records", category: "sync", folder: "Lofty" },

  // Sierra Sync Functions (New in V1 - late addition)
  { v1_function: "sierra/fetch_leads", v1_id: 11150, v2_functions: [], v2_ids: [], type: "new", notes: "New Sierra integration - V1 only for now", category: "sync", folder: "sierra" },
  { v1_function: "sierra/normalize_lead", v1_id: 11151, v2_functions: [], v2_ids: [], type: "new", notes: "New Sierra integration - V1 only", category: "sync", folder: "sierra" },
  { v1_function: "sierra/upsert_lead", v1_id: 11152, v2_functions: [], v2_ids: [], type: "new", notes: "New Sierra integration - V1 only", category: "sync", folder: "sierra" },
  { v1_function: "sierra/process_staging", v1_id: 11153, v2_functions: [], v2_ids: [], type: "new", notes: "New Sierra integration - V1 only", category: "sync", folder: "sierra" },
  { v1_function: "sierra/fetch_and_upsert_lead_by_id", v1_id: 11163, v2_functions: [], v2_ids: [], type: "new", notes: "New Sierra integration - V1 only", category: "sync", folder: "sierra" },

  // ═══════════════════════════════════════════════════════════════
  // AGGREGATION FUNCTIONS (50+ functions)
  // ═══════════════════════════════════════════════════════════════

  // Transaction Aggregations
  { v1_function: "Aggregation/agg_transactions_by_month", v1_id: 10100, v2_functions: ["aggregation/transactions/by_month"], v2_ids: [5100], type: "renamed", notes: "Monthly transaction aggregation", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_transactions_by_stage", v1_id: 10101, v2_functions: ["aggregation/transactions/by_stage"], v2_ids: [5101], type: "renamed", notes: "Transaction stage aggregation", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_transactions_by_type", v1_id: 10102, v2_functions: ["aggregation/transactions/by_type"], v2_ids: [5102], type: "renamed", notes: "Transaction type aggregation", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_transactions_by_agent", v1_id: 10103, v2_functions: ["aggregation/transactions/by_agent"], v2_ids: [5103], type: "renamed", notes: "Agent transaction leaderboard", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_transactions_by_geo", v1_id: 10104, v2_functions: ["aggregation/transactions/by_geo"], v2_ids: [5104], type: "renamed", notes: "Geographic transaction aggregation", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_transactions_by_week", v1_id: 10105, v2_functions: ["aggregation/transactions/by_week"], v2_ids: [5105], type: "renamed", notes: "Weekly transaction aggregation", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_transactions_yoy", v1_id: 10106, v2_functions: ["aggregation/transactions/yoy"], v2_ids: [5106], type: "renamed", notes: "Year-over-year comparison", category: "aggregation", folder: "Aggregation" },

  // Listing Aggregations
  { v1_function: "Aggregation/agg_listings_by_month", v1_id: 10110, v2_functions: ["aggregation/listings/by_month"], v2_ids: [5110], type: "renamed", notes: "Monthly listing aggregation", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_listings_by_stage", v1_id: 10111, v2_functions: ["aggregation/listings/by_stage"], v2_ids: [5111], type: "renamed", notes: "Listing stage aggregation", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_listings_by_agent", v1_id: 10112, v2_functions: ["aggregation/listings/by_agent"], v2_ids: [5112], type: "renamed", notes: "Agent listing leaderboard", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_listings_by_dom_bucket", v1_id: 10113, v2_functions: ["aggregation/listings/by_dom"], v2_ids: [5113], type: "renamed", notes: "Days on market distribution", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_listings_by_property_type", v1_id: 10114, v2_functions: ["aggregation/listings/by_property_type"], v2_ids: [5114], type: "renamed", notes: "Property type distribution", category: "aggregation", folder: "Aggregation" },

  // Revenue Aggregations
  { v1_function: "Aggregation/agg_revenue_by_month", v1_id: 10120, v2_functions: ["aggregation/revenue/by_month"], v2_ids: [5120], type: "renamed", notes: "Monthly revenue aggregation", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_revenue_by_week", v1_id: 10121, v2_functions: ["aggregation/revenue/by_week"], v2_ids: [5121], type: "renamed", notes: "Weekly revenue aggregation", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_revenue_by_agent", v1_id: 10122, v2_functions: ["aggregation/revenue/by_agent"], v2_ids: [5122], type: "renamed", notes: "Agent revenue leaderboard", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_revenue_by_deduction_type", v1_id: 10123, v2_functions: ["aggregation/revenue/by_deduction"], v2_ids: [5123], type: "renamed", notes: "Revenue by deduction type", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_revenue_waterfall", v1_id: 10124, v2_functions: ["aggregation/revenue/waterfall"], v2_ids: [5124], type: "renamed", notes: "Revenue waterfall chart data", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_revenue_ytd", v1_id: 10125, v2_functions: ["aggregation/revenue/ytd"], v2_ids: [5125], type: "renamed", notes: "Year-to-date revenue", category: "aggregation", folder: "Aggregation" },

  // Network Aggregations
  { v1_function: "Aggregation/agg_network_by_month", v1_id: 10130, v2_functions: ["aggregation/network/by_month"], v2_ids: [5130], type: "renamed", notes: "Monthly network growth", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_network_by_week", v1_id: 10131, v2_functions: ["aggregation/network/by_week"], v2_ids: [5131], type: "renamed", notes: "Weekly network growth", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_network_by_status", v1_id: 10132, v2_functions: ["aggregation/network/by_status"], v2_ids: [5132], type: "renamed", notes: "Network by status", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_network_by_tier", v1_id: 10133, v2_functions: ["aggregation/network/by_tier"], v2_ids: [5133], type: "renamed", notes: "Network by tier", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_network_by_geo", v1_id: 10134, v2_functions: ["aggregation/network/by_geo"], v2_ids: [5134], type: "renamed", notes: "Geographic network distribution", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_network_recruitment_funnel", v1_id: 10135, v2_functions: ["aggregation/network/recruitment_funnel"], v2_ids: [5135], type: "renamed", notes: "Recruitment funnel metrics", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_network_revshare_by_month", v1_id: 10136, v2_functions: ["aggregation/network/revshare_by_month"], v2_ids: [5136], type: "renamed", notes: "RevShare by month", category: "aggregation", folder: "Aggregation" },

  // Lead/FUB Aggregations
  { v1_function: "Aggregation/agg_leads_by_month", v1_id: 10140, v2_functions: ["aggregation/leads/by_month"], v2_ids: [5140], type: "renamed", notes: "Monthly lead aggregation", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_leads_by_source", v1_id: 10141, v2_functions: ["aggregation/leads/by_source"], v2_ids: [5141], type: "renamed", notes: "Lead source distribution", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_leads_by_stage", v1_id: 10142, v2_functions: ["aggregation/leads/by_stage"], v2_ids: [5142], type: "renamed", notes: "Lead pipeline stages", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_leads_by_agent", v1_id: 10143, v2_functions: ["aggregation/leads/by_agent"], v2_ids: [5143], type: "renamed", notes: "Agent lead leaderboard", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_leads_conversion_funnel", v1_id: 10144, v2_functions: ["aggregation/leads/conversion_funnel"], v2_ids: [5144], type: "renamed", notes: "Lead conversion funnel", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_fub_activity_by_month", v1_id: 10145, v2_functions: ["aggregation/fub/activity_by_month"], v2_ids: [5145], type: "renamed", notes: "FUB activity by month", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_fub_activity_by_agent", v1_id: 10146, v2_functions: ["aggregation/fub/activity_by_agent"], v2_ids: [5146], type: "renamed", notes: "FUB activity leaderboard", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_events_by_type", v1_id: 10147, v2_functions: ["aggregation/fub/events_by_type"], v2_ids: [5147], type: "renamed", notes: "Events by type distribution", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_events_by_source", v1_id: 10148, v2_functions: ["aggregation/fub/events_by_source"], v2_ids: [5148], type: "renamed", notes: "Events by source", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_calls_by_direction", v1_id: 10149, v2_functions: ["aggregation/fub/calls_by_direction"], v2_ids: [5149], type: "renamed", notes: "Calls by direction", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_calls_by_outcome", v1_id: 10150, v2_functions: ["aggregation/fub/calls_by_outcome"], v2_ids: [5150], type: "renamed", notes: "Calls by outcome", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_texts_by_direction", v1_id: 10151, v2_functions: ["aggregation/fub/texts_by_direction"], v2_ids: [5151], type: "renamed", notes: "Texts by direction", category: "aggregation", folder: "Aggregation" },

  // AI/NORA Aggregations
  { v1_function: "Aggregation/agg_anomalies_detected", v1_id: 10160, v2_functions: ["aggregation/ai/anomalies"], v2_ids: [5160], type: "renamed", notes: "AI-detected anomalies", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_benchmarks", v1_id: 10161, v2_functions: ["aggregation/ai/benchmarks"], v2_ids: [5161], type: "renamed", notes: "Performance benchmarks", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_funnel_conversion", v1_id: 10162, v2_functions: ["aggregation/ai/funnel_conversion"], v2_ids: [5162], type: "renamed", notes: "Funnel conversion metrics", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_pacing_daily", v1_id: 10163, v2_functions: ["aggregation/ai/pacing_daily"], v2_ids: [5163], type: "renamed", notes: "Daily pacing metrics", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_pipeline_velocity", v1_id: 10164, v2_functions: ["aggregation/ai/pipeline_velocity"], v2_ids: [5164], type: "renamed", notes: "Pipeline velocity", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_risk_flags_current", v1_id: 10165, v2_functions: ["aggregation/ai/risk_flags"], v2_ids: [5165], type: "renamed", notes: "Current risk flags", category: "aggregation", folder: "Aggregation" },
  { v1_function: "Aggregation/agg_targets", v1_id: 10166, v2_functions: ["aggregation/ai/targets"], v2_ids: [5166], type: "renamed", notes: "Goals and targets", category: "aggregation", folder: "Aggregation" },

  // SQL-based Aggregations (V2 specific pattern)
  { v1_function: "SQL/refresh_all_aggregations", v1_id: 11148, v2_functions: ["aggregation/refresh_all"], v2_ids: [5170], type: "renamed", notes: "Master aggregation refresh orchestrator", category: "aggregation", folder: "SQL" },
  { v1_function: "SQL/agg_listings_by_stage", v1_id: 11147, v2_functions: ["aggregation/sql/listings_by_stage"], v2_ids: [5171], type: "renamed", notes: "SQL-based listings aggregation", category: "aggregation", folder: "SQL" },

  // Team Leaderboard
  { v1_function: "Aggregation/agg_team_leaderboard", v1_id: 10170, v2_functions: ["aggregation/team/leaderboard"], v2_ids: [5175], type: "renamed", notes: "Team leaderboard aggregation", category: "aggregation", folder: "Aggregation" },

  // ═══════════════════════════════════════════════════════════════
  // WORKER FUNCTIONS (30+ functions)
  // ═══════════════════════════════════════════════════════════════

  { v1_function: "Workers/process_contribution", v1_id: 10200, v2_functions: ["workers/process_contribution"], v2_ids: [5200], type: "direct", notes: "Process contribution records", category: "worker", folder: "Workers" },
  { v1_function: "Workers/process_income", v1_id: 10201, v2_functions: ["workers/process_income"], v2_ids: [5201], type: "direct", notes: "Process income records", category: "worker", folder: "Workers" },
  { v1_function: "Workers/process_equity", v1_id: 10202, v2_functions: ["workers/process_equity"], v2_ids: [5202], type: "direct", notes: "Process equity records", category: "worker", folder: "Workers" },
  { v1_function: "Workers/process_revshare", v1_id: 10203, v2_functions: ["workers/process_revshare"], v2_ids: [5203], type: "direct", notes: "Process revshare calculations", category: "worker", folder: "Workers" },
  { v1_function: "Workers/process_participant", v1_id: 10204, v2_functions: ["workers/process_participant"], v2_ids: [5204], type: "direct", notes: "Process transaction participants", category: "worker", folder: "Workers" },
  { v1_function: "Workers/calculate_agent_metrics", v1_id: 10205, v2_functions: ["workers/calculate_agent_metrics"], v2_ids: [5205], type: "direct", notes: "Calculate agent performance metrics", category: "worker", folder: "Workers" },
  { v1_function: "Workers/calculate_team_metrics", v1_id: 10206, v2_functions: ["workers/calculate_team_metrics"], v2_ids: [5206], type: "direct", notes: "Calculate team performance metrics", category: "worker", folder: "Workers" },
  { v1_function: "Workers/update_network_hierarchy", v1_id: 10207, v2_functions: ["workers/update_network_hierarchy"], v2_ids: [5207], type: "direct", notes: "Update network hierarchy cache", category: "worker", folder: "Workers" },
  { v1_function: "Workers/process_aggregation_queue", v1_id: 10208, v2_functions: ["workers/aggregation/process_queue"], v2_ids: [5208], type: "renamed", notes: "Process aggregation job queue", category: "worker", folder: "Workers" },
  { v1_function: "Workers/process_leaderboard_queue", v1_id: 10209, v2_functions: ["workers/leaderboard/process_queue"], v2_ids: [5209], type: "renamed", notes: "Process leaderboard job queue", category: "worker", folder: "Workers" },
  { v1_function: "Workers/process_fub_aggregation_queue", v1_id: 10210, v2_functions: ["workers/fub/process_aggregation_queue"], v2_ids: [5210], type: "renamed", notes: "Process FUB aggregation queue", category: "worker", folder: "Workers" },
  { v1_function: "Workers/categorize_table", v1_id: 11138, v2_functions: ["workers/categorize_table"], v2_ids: [5215], type: "direct", notes: "Categorize table by name/tags", category: "worker", folder: "Workers" },
  { v1_function: "Workers/get_table_count", v1_id: 11139, v2_functions: ["workers/get_table_count"], v2_ids: [5216], type: "direct", notes: "Get table record count via Meta API", category: "worker", folder: "Workers" },

  // ═══════════════════════════════════════════════════════════════
  // HEALTH CHECK FUNCTIONS (15+ functions)
  // ═══════════════════════════════════════════════════════════════

  { v1_function: "Health/check_fub_sync", v1_id: 10300, v2_functions: ["health/fub_sync"], v2_ids: [5300], type: "renamed", notes: "Check FUB sync health", category: "health", folder: "Health" },
  { v1_function: "Health/check_rezen_sync", v1_id: 10301, v2_functions: ["health/rezen_sync"], v2_ids: [5301], type: "renamed", notes: "Check Rezen sync health", category: "health", folder: "Health" },
  { v1_function: "Health/check_skyslope_sync", v1_id: 10302, v2_functions: ["health/skyslope_sync"], v2_ids: [5302], type: "renamed", notes: "Check SkySlope sync health", category: "health", folder: "Health" },
  { v1_function: "Health/check_aggregation_freshness", v1_id: 10303, v2_functions: ["health/aggregation_freshness"], v2_ids: [5303], type: "renamed", notes: "Check aggregation data freshness", category: "health", folder: "Health" },
  { v1_function: "Health/check_stripe_sync", v1_id: 10304, v2_functions: ["health/stripe_sync"], v2_ids: [5304], type: "renamed", notes: "Check Stripe webhook processing", category: "health", folder: "Health" },
  { v1_function: "Health/validate_data_integrity", v1_id: 10305, v2_functions: ["health/data_integrity"], v2_ids: [5305], type: "renamed", notes: "Validate data integrity checks", category: "health", folder: "Health" },
  { v1_function: "Health/check_chart_health", v1_id: 10306, v2_functions: ["health/charts"], v2_ids: [5306], type: "renamed", notes: "Check chart rendering health", category: "health", folder: "Health" },

  // ═══════════════════════════════════════════════════════════════
  // CLEANUP FUNCTIONS (10+ functions)
  // ═══════════════════════════════════════════════════════════════

  { v1_function: "Cleanup/cleanup_old_logs", v1_id: 10400, v2_functions: ["cleanup/old_logs"], v2_ids: [5400], type: "renamed", notes: "Clean up old log records", category: "cleanup", folder: "Cleanup" },
  { v1_function: "Cleanup/cleanup_staging", v1_id: 10401, v2_functions: ["cleanup/staging"], v2_ids: [5401], type: "renamed", notes: "Clean up processed staging records", category: "cleanup", folder: "Cleanup" },
  { v1_function: "Cleanup/cleanup_orphan_records", v1_id: 10402, v2_functions: ["cleanup/orphan_records"], v2_ids: [5402], type: "renamed", notes: "Clean up orphaned records", category: "cleanup", folder: "Cleanup" },
  { v1_function: "Cleanup/cleanup_temp_data", v1_id: 10403, v2_functions: ["cleanup/temp_data"], v2_ids: [5403], type: "renamed", notes: "Clean up temporary data", category: "cleanup", folder: "Cleanup" },
  { v1_function: "Cleanup/purge_old_notifications", v1_id: 10404, v2_functions: ["cleanup/notifications"], v2_ids: [5404], type: "renamed", notes: "Purge old notifications", category: "cleanup", folder: "Cleanup" },

  // ═══════════════════════════════════════════════════════════════
  // EMAIL FUNCTIONS (10+ functions)
  // ═══════════════════════════════════════════════════════════════

  { v1_function: "Email/send_notification", v1_id: 10500, v2_functions: ["email/send_notification"], v2_ids: [5500], type: "direct", notes: "Send notification email", category: "email", folder: "Email" },
  { v1_function: "Email/send_welcome", v1_id: 10501, v2_functions: ["email/send_welcome"], v2_ids: [5501], type: "direct", notes: "Send welcome email", category: "email", folder: "Email" },
  { v1_function: "Email/send_invitation", v1_id: 10502, v2_functions: ["email/send_invitation"], v2_ids: [5502], type: "direct", notes: "Send invitation email", category: "email", folder: "Email" },
  { v1_function: "Email/send_password_reset", v1_id: 10503, v2_functions: ["email/send_password_reset"], v2_ids: [5503], type: "direct", notes: "Send password reset email", category: "email", folder: "Email" },
  { v1_function: "Email/send_report", v1_id: 10504, v2_functions: ["email/send_report"], v2_ids: [5504], type: "direct", notes: "Send report email", category: "email", folder: "Email" },

  // ═══════════════════════════════════════════════════════════════
  // NOTIFICATION FUNCTIONS (10+ functions)
  // ═══════════════════════════════════════════════════════════════

  { v1_function: "Notifications/create_notification", v1_id: 10600, v2_functions: ["notifications/create"], v2_ids: [5600], type: "renamed", notes: "Create notification", category: "notification", folder: "Notifications" },
  { v1_function: "Notifications/mark_read", v1_id: 10601, v2_functions: ["notifications/mark_read"], v2_ids: [5601], type: "direct", notes: "Mark notification as read", category: "notification", folder: "Notifications" },
  { v1_function: "Notifications/mark_all_read", v1_id: 10602, v2_functions: ["notifications/mark_all_read"], v2_ids: [5602], type: "direct", notes: "Mark all notifications read", category: "notification", folder: "Notifications" },
  { v1_function: "Notifications/get_user_notifications", v1_id: 10603, v2_functions: ["notifications/get_by_user"], v2_ids: [5603], type: "renamed", notes: "Get user notifications", category: "notification", folder: "Notifications" },

  // ═══════════════════════════════════════════════════════════════
  // AUTH FUNCTIONS (15+ functions)
  // ═══════════════════════════════════════════════════════════════

  { v1_function: "Auth/login", v1_id: 10700, v2_functions: ["auth/login"], v2_ids: [5700], type: "direct", notes: "User login", category: "auth", folder: "Auth" },
  { v1_function: "Auth/logout", v1_id: 10701, v2_functions: ["auth/logout"], v2_ids: [5701], type: "direct", notes: "User logout", category: "auth", folder: "Auth" },
  { v1_function: "Auth/refresh_token", v1_id: 10702, v2_functions: ["auth/refresh"], v2_ids: [5702], type: "renamed", notes: "Refresh auth token", category: "auth", folder: "Auth" },
  { v1_function: "Auth/validate_token", v1_id: 10703, v2_functions: ["auth/validate"], v2_ids: [5703], type: "renamed", notes: "Validate auth token", category: "auth", folder: "Auth" },
  { v1_function: "Auth/password_reset", v1_id: 10704, v2_functions: ["auth/password_reset"], v2_ids: [5704], type: "direct", notes: "Password reset", category: "auth", folder: "Auth" },
  { v1_function: "Auth/change_password", v1_id: 10705, v2_functions: ["auth/change_password"], v2_ids: [5705], type: "direct", notes: "Change password", category: "auth", folder: "Auth" },
  { v1_function: "Auth/2fa_enable", v1_id: 10706, v2_functions: ["auth/2fa/enable"], v2_ids: [5706], type: "renamed", notes: "Enable 2FA", category: "auth", folder: "Auth" },
  { v1_function: "Auth/2fa_verify", v1_id: 10707, v2_functions: ["auth/2fa/verify"], v2_ids: [5707], type: "renamed", notes: "Verify 2FA", category: "auth", folder: "Auth" },
  { v1_function: "Auth/2fa_disable", v1_id: 10708, v2_functions: ["auth/2fa/disable"], v2_ids: [5708], type: "renamed", notes: "Disable 2FA", category: "auth", folder: "Auth" },

  // ═══════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS (30+ functions)
  // ═══════════════════════════════════════════════════════════════

  { v1_function: "Utils/format_currency", v1_id: 10800, v2_functions: ["utils/format_currency"], v2_ids: [5800], type: "direct", notes: "Format currency values", category: "util", folder: "Utils" },
  { v1_function: "Utils/format_date", v1_id: 10801, v2_functions: ["utils/format_date"], v2_ids: [5801], type: "direct", notes: "Format date values", category: "util", folder: "Utils" },
  { v1_function: "Utils/parse_address", v1_id: 10802, v2_functions: ["utils/parse_address"], v2_ids: [5802], type: "direct", notes: "Parse address string", category: "util", folder: "Utils" },
  { v1_function: "Utils/normalize_phone", v1_id: 10803, v2_functions: ["utils/normalize_phone"], v2_ids: [5803], type: "direct", notes: "Normalize phone number", category: "util", folder: "Utils" },
  { v1_function: "Utils/normalize_email", v1_id: 10804, v2_functions: ["utils/normalize_email"], v2_ids: [5804], type: "direct", notes: "Normalize email address", category: "util", folder: "Utils" },
  { v1_function: "Utils/calculate_gci", v1_id: 10805, v2_functions: ["utils/calculate_gci"], v2_ids: [5805], type: "direct", notes: "Calculate GCI", category: "util", folder: "Utils" },
  { v1_function: "Utils/calculate_commission_split", v1_id: 10806, v2_functions: ["utils/calculate_commission_split"], v2_ids: [5806], type: "direct", notes: "Calculate commission splits", category: "util", folder: "Utils" },
  { v1_function: "Utils/calculate_revshare_tier", v1_id: 10807, v2_functions: ["utils/calculate_revshare_tier"], v2_ids: [5807], type: "direct", notes: "Calculate revshare tier", category: "util", folder: "Utils" },
  { v1_function: "Utils/geocode_address", v1_id: 10808, v2_functions: ["utils/geocode_address"], v2_ids: [5808], type: "direct", notes: "Geocode address to lat/lng", category: "util", folder: "Utils" },

  // ═══════════════════════════════════════════════════════════════
  // MIGRATION FUNCTIONS (20+ functions)
  // ═══════════════════════════════════════════════════════════════

  { v1_function: "Migration/migrate_user", v1_id: 10900, v2_functions: ["migration/user"], v2_ids: [5900], type: "renamed", notes: "Migrate user record", category: "migration", folder: "Migration" },
  { v1_function: "Migration/migrate_agent", v1_id: 10901, v2_functions: ["migration/agent"], v2_ids: [5901], type: "renamed", notes: "Migrate agent record", category: "migration", folder: "Migration" },
  { v1_function: "Migration/migrate_transaction", v1_id: 10902, v2_functions: ["migration/transaction"], v2_ids: [5902], type: "renamed", notes: "Migrate transaction record", category: "migration", folder: "Migration" },
  { v1_function: "Migration/migrate_listing", v1_id: 10903, v2_functions: ["migration/listing"], v2_ids: [5903], type: "renamed", notes: "Migrate listing record", category: "migration", folder: "Migration" },
  { v1_function: "Migration/migrate_network", v1_id: 10904, v2_functions: ["migration/network"], v2_ids: [5904], type: "renamed", notes: "Migrate network record", category: "migration", folder: "Migration" },
  { v1_function: "Migration/migrate_contribution", v1_id: 10905, v2_functions: ["migration/contribution"], v2_ids: [5905], type: "renamed", notes: "Migrate contribution record", category: "migration", folder: "Migration" },
  { v1_function: "Migration/migrate_fub_data", v1_id: 10906, v2_functions: ["migration/fub_data"], v2_ids: [5906], type: "renamed", notes: "Migrate FUB data", category: "migration", folder: "Migration" },
  { v1_function: "Migration/verify_migration", v1_id: 10907, v2_functions: ["migration/verify"], v2_ids: [5907], type: "renamed", notes: "Verify migration completeness", category: "migration", folder: "Migration" },
  { v1_function: "Migration/rollback_migration", v1_id: 10908, v2_functions: ["migration/rollback"], v2_ids: [5908], type: "renamed", notes: "Rollback migration", category: "migration", folder: "Migration" },
  { v1_function: "Migration/populate_calendar_id", v1_id: 11149, v2_functions: ["migration/populate_calendar_id"], v2_ids: [5909], type: "direct", notes: "Populate calendar_id from effective_close_date", category: "migration", folder: "Migration" },

  // ═══════════════════════════════════════════════════════════════
  // API HANDLER FUNCTIONS (40+ functions)
  // ═══════════════════════════════════════════════════════════════

  // User API
  { v1_function: "API/user/me", v1_id: 11000, v2_functions: ["api/user/me"], v2_ids: [6000], type: "direct", notes: "Get current user", category: "api", folder: "API/user" },
  { v1_function: "API/user/update", v1_id: 11001, v2_functions: ["api/user/update"], v2_ids: [6001], type: "direct", notes: "Update user profile", category: "api", folder: "API/user" },
  { v1_function: "API/user/preferences", v1_id: 11002, v2_functions: ["api/user/preferences"], v2_ids: [6002], type: "direct", notes: "Get/set user preferences", category: "api", folder: "API/user" },

  // Agent API
  { v1_function: "API/agent/get", v1_id: 11010, v2_functions: ["api/agent/get"], v2_ids: [6010], type: "direct", notes: "Get agent by ID", category: "api", folder: "API/agent" },
  { v1_function: "API/agent/search", v1_id: 11011, v2_functions: ["api/agent/search"], v2_ids: [6011], type: "direct", notes: "Search agents", category: "api", folder: "API/agent" },
  { v1_function: "API/agent/metrics", v1_id: 11012, v2_functions: ["api/agent/metrics"], v2_ids: [6012], type: "direct", notes: "Get agent metrics", category: "api", folder: "API/agent" },

  // Transaction API
  { v1_function: "API/transaction/list", v1_id: 11020, v2_functions: ["api/transaction/list"], v2_ids: [6020], type: "direct", notes: "List transactions", category: "api", folder: "API/transaction" },
  { v1_function: "API/transaction/get", v1_id: 11021, v2_functions: ["api/transaction/get"], v2_ids: [6021], type: "direct", notes: "Get transaction by ID", category: "api", folder: "API/transaction" },
  { v1_function: "API/transaction/summary", v1_id: 11022, v2_functions: ["api/transaction/summary"], v2_ids: [6022], type: "direct", notes: "Get transaction summary", category: "api", folder: "API/transaction" },

  // Listing API
  { v1_function: "API/listing/list", v1_id: 11030, v2_functions: ["api/listing/list"], v2_ids: [6030], type: "direct", notes: "List listings", category: "api", folder: "API/listing" },
  { v1_function: "API/listing/get", v1_id: 11031, v2_functions: ["api/listing/get"], v2_ids: [6031], type: "direct", notes: "Get listing by ID", category: "api", folder: "API/listing" },

  // Network API
  { v1_function: "API/network/tree", v1_id: 11040, v2_functions: ["api/network/tree"], v2_ids: [6040], type: "direct", notes: "Get network tree", category: "api", folder: "API/network" },
  { v1_function: "API/network/downline", v1_id: 11041, v2_functions: ["api/network/downline"], v2_ids: [6041], type: "direct", notes: "Get downline list", category: "api", folder: "API/network" },
  { v1_function: "API/network/stats", v1_id: 11042, v2_functions: ["api/network/stats"], v2_ids: [6042], type: "direct", notes: "Get network statistics", category: "api", folder: "API/network" },

  // Team API
  { v1_function: "API/team/roster", v1_id: 11050, v2_functions: ["api/team/roster"], v2_ids: [6050], type: "direct", notes: "Get team roster", category: "api", folder: "API/team" },
  { v1_function: "API/team/stats", v1_id: 11051, v2_functions: ["api/team/stats"], v2_ids: [6051], type: "direct", notes: "Get team statistics", category: "api", folder: "API/team" },
  { v1_function: "API/team/leaderboard", v1_id: 11052, v2_functions: ["api/team/leaderboard"], v2_ids: [6052], type: "direct", notes: "Get team leaderboard", category: "api", folder: "API/team" },

  // Revenue API
  { v1_function: "API/revenue/summary", v1_id: 11060, v2_functions: ["api/revenue/summary"], v2_ids: [6060], type: "direct", notes: "Get revenue summary", category: "api", folder: "API/revenue" },
  { v1_function: "API/revenue/breakdown", v1_id: 11061, v2_functions: ["api/revenue/breakdown"], v2_ids: [6061], type: "direct", notes: "Get revenue breakdown", category: "api", folder: "API/revenue" },

  // Dashboard API
  { v1_function: "API/dashboard/widgets", v1_id: 11070, v2_functions: ["api/dashboard/widgets"], v2_ids: [6070], type: "direct", notes: "Get dashboard widgets", category: "api", folder: "API/dashboard" },
  { v1_function: "API/dashboard/kpis", v1_id: 11071, v2_functions: ["api/dashboard/kpis"], v2_ids: [6071], type: "direct", notes: "Get dashboard KPIs", category: "api", folder: "API/dashboard" },

  // ═══════════════════════════════════════════════════════════════
  // DEPRECATED V1 FUNCTIONS (Functions that don't have V2 equivalents)
  // ═══════════════════════════════════════════════════════════════

  { v1_function: "Legacy/old_report_generator", v1_id: 9001, v2_functions: [], v2_ids: [], type: "deprecated", notes: "Replaced by new reporting system", category: "other", folder: "Legacy" },
  { v1_function: "Legacy/manual_sync", v1_id: 9002, v2_functions: [], v2_ids: [], type: "deprecated", notes: "Replaced by automated sync", category: "other", folder: "Legacy" },
  { v1_function: "Temp/debug_helper", v1_id: 9003, v2_functions: [], v2_ids: [], type: "deprecated", notes: "Development-only function", category: "other", folder: "Temp" },
]

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all function mappings
 */
export function getAllFunctionMappings(): FunctionMapping[] {
  return FUNCTION_MAPPINGS
}

/**
 * Get function mappings by category
 */
export function getFunctionMappingsByCategory(category: FunctionCategory): FunctionMapping[] {
  return FUNCTION_MAPPINGS.filter(m => m.category === category)
}

/**
 * Get function mappings by type
 */
export function getFunctionMappingsByType(type: MappingType): FunctionMapping[] {
  return FUNCTION_MAPPINGS.filter(m => m.type === type)
}

/**
 * Get function mappings by folder
 */
export function getFunctionMappingsByFolder(folder: string): FunctionMapping[] {
  return FUNCTION_MAPPINGS.filter(m => m.folder === folder)
}

/**
 * Search function mappings by name
 */
export function searchFunctionMappings(query: string): FunctionMapping[] {
  const lower = query.toLowerCase()
  return FUNCTION_MAPPINGS.filter(m =>
    m.v1_function.toLowerCase().includes(lower) ||
    m.v2_functions.some(f => f.toLowerCase().includes(lower)) ||
    m.notes.toLowerCase().includes(lower)
  )
}

/**
 * Get function mapping statistics
 */
export function getFunctionMappingStats() {
  const stats = {
    total: FUNCTION_MAPPINGS.length,
    direct: 0,
    renamed: 0,
    split: 0,
    merged: 0,
    deprecated: 0,
    new: 0,
    byCategory: {} as Record<FunctionCategory, number>
  }

  for (const mapping of FUNCTION_MAPPINGS) {
    stats[mapping.type]++
    stats.byCategory[mapping.category!] = (stats.byCategory[mapping.category!] || 0) + 1
  }

  return stats
}

/**
 * Get unique folders
 */
export function getUniqueFolders(): string[] {
  const folders = new Set<string>()
  for (const mapping of FUNCTION_MAPPINGS) {
    if (mapping.folder) folders.add(mapping.folder)
  }
  return Array.from(folders).sort()
}
