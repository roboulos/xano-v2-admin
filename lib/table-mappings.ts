// Table Mappings: V1 → V2
// Defines how V1 denormalized tables map to V2 normalized tables
// COMPLETE COVERAGE: All 251 V1 tables mapped

export type MappingType =
  | "direct"      // 1:1 mapping, same name
  | "renamed"     // 1:1 but different name in V2
  | "split"       // V1 table split into multiple V2 tables
  | "merged"      // V1 table merged with others in V2
  | "deprecated"  // V1 table has no V2 equivalent
  | "new"         // V2 table has no V1 source

export interface TableMapping {
  v1_table: string
  v1_label: string
  v2_tables: string[]  // Can be multiple for split mappings
  v2_labels: string[]
  type: MappingType
  notes: string
  category?: string  // Category for grouping
  // For comparison - which V2 table holds the "main" record count
  primary_v2_table?: string
}

// Complete mapping of all 251 V1 tables to V2
export const TABLE_MAPPINGS: TableMapping[] = [
  // ═══════════════════════════════════════════════════════════════
  // CORE TABLES (8)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "user",
    v1_label: "Users",
    v2_tables: ["user", "user_credentials", "user_settings", "user_roles", "user_subscriptions"],
    v2_labels: ["User", "User Credentials", "User Settings", "User Roles", "User Subscriptions"],
    type: "split",
    notes: "V1 user split into identity, credentials, settings, roles, and subscriptions in V2",
    primary_v2_table: "user"
  },
  {
    v1_table: "agent",
    v1_label: "Agents",
    v2_tables: ["agent", "agent_cap_data", "agent_commission", "agent_hierarchy", "agent_performance"],
    v2_labels: ["Agent", "Agent Cap Data", "Agent Commission", "Agent Hierarchy", "Agent Performance"],
    type: "split",
    notes: "V1 agent split into profile, caps, commissions, hierarchy, and performance in V2",
    primary_v2_table: "agent"
  },
  {
    v1_table: "team",
    v1_label: "Teams",
    v2_tables: ["team", "team_settings", "team_members"],
    v2_labels: ["Team", "Team Settings", "Team Members"],
    type: "split",
    notes: "Team core record + settings + membership normalized",
    primary_v2_table: "team"
  },
  {
    v1_table: "roster",
    v1_label: "Roster",
    v2_tables: ["team_members"],
    v2_labels: ["Team Members"],
    type: "renamed",
    notes: "V1 roster renamed to team_members in V2",
    primary_v2_table: "team_members"
  },
  {
    v1_table: "network",
    v1_label: "Network",
    v2_tables: ["network_hierarchy", "network_member", "network_user_prefs"],
    v2_labels: ["Network Hierarchy", "Network Member", "Network User Prefs"],
    type: "split",
    notes: "V1 network decomposed into hierarchy, members, and preferences",
    primary_v2_table: "network_member"
  },
  {
    v1_table: "transaction",
    v1_label: "Transactions",
    v2_tables: ["transaction", "transaction_financials", "transaction_history", "transaction_participants", "transaction_tags"],
    v2_labels: ["Transaction", "Transaction Financials", "Transaction History", "Transaction Participants", "Transaction Tags"],
    type: "split",
    notes: "Fully normalized - core record, financials, audit history, participants junction, tags",
    primary_v2_table: "transaction"
  },
  {
    v1_table: "listing",
    v1_label: "Listings",
    v2_tables: ["listing", "listing_history", "listing_photos"],
    v2_labels: ["Listing", "Listing History", "Listing Photos"],
    type: "split",
    notes: "Core listing + price/status history + media separated",
    primary_v2_table: "listing"
  },
  {
    v1_table: "participant",
    v1_label: "Participants",
    v2_tables: ["participant"],
    v2_labels: ["Participant"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "participant"
  },

  // ═══════════════════════════════════════════════════════════════
  // FINANCIAL TABLES (4)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "contribution",
    v1_label: "Contributions",
    v2_tables: ["contribution", "contribution_tiers"],
    v2_labels: ["Contribution", "Contribution Tiers"],
    type: "split",
    notes: "Contribution records + tier definitions separated",
    primary_v2_table: "contribution"
  },
  {
    v1_table: "income",
    v1_label: "Income",
    v2_tables: ["income"],
    v2_labels: ["Income"],
    type: "direct",
    notes: "Direct 1:1 mapping - unified income tracking",
    primary_v2_table: "income"
  },
  {
    v1_table: "revshare_totals",
    v1_label: "RevShare Totals",
    v2_tables: ["revshare_totals", "revshare_payment"],
    v2_labels: ["RevShare Totals", "RevShare Payment"],
    type: "split",
    notes: "Totals + individual payment records separated",
    primary_v2_table: "revshare_totals"
  },
  {
    v1_table: "contributors",
    v1_label: "Contributors",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Merged into contribution table in V2 - no longer separate",
    primary_v2_table: undefined
  },

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS TABLES (8)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "subscription",
    v1_label: "Subscriptions",
    v2_tables: ["stripe_subscriptions", "user_subscriptions"],
    v2_labels: ["Stripe Subscriptions", "User Subscriptions"],
    type: "split",
    notes: "Stripe data + user subscription status separated",
    primary_v2_table: "stripe_subscriptions"
  },
  {
    v1_table: "notifications",
    v1_label: "Notifications",
    v2_tables: ["notification", "notification_items", "notification_defaults", "notification_user_prefs"],
    v2_labels: ["Notification", "Notification Items", "Notification Defaults", "Notification User Prefs"],
    type: "split",
    notes: "Fully normalized notification system",
    primary_v2_table: "notification"
  },
  {
    v1_table: "pipeline_prospects",
    v1_label: "Pipeline Prospects",
    v2_tables: ["pipeline_prospects", "pipeline_prospect_defaults"],
    v2_labels: ["Pipeline Prospects", "Pipeline Prospect Defaults"],
    type: "split",
    notes: "Prospects + default configs separated",
    primary_v2_table: "pipeline_prospects"
  },
  {
    v1_table: "pipeline_stages",
    v1_label: "Pipeline Stages",
    v2_tables: ["pipeline_stages", "pipeline_stage_defaults"],
    v2_labels: ["Pipeline Stages", "Pipeline Stage Defaults"],
    type: "split",
    notes: "Stages + default configs separated",
    primary_v2_table: "pipeline_stages"
  },
  {
    v1_table: "leaders",
    v1_label: "Leaders",
    v2_tables: ["leader", "team_leader_assignments"],
    v2_labels: ["Leader", "Team Leader Assignments"],
    type: "split",
    notes: "Leader records + team assignments junction",
    primary_v2_table: "leader"
  },
  {
    v1_table: "directors",
    v1_label: "Directors",
    v2_tables: ["director", "team_director_assignments"],
    v2_labels: ["Director", "Team Director Assignments"],
    type: "split",
    notes: "Director records + team assignments junction",
    primary_v2_table: "director"
  },
  {
    v1_table: "team_owners",
    v1_label: "Team Owners",
    v2_tables: ["team"],
    v2_labels: ["Team"],
    type: "merged",
    notes: "Team owner info merged into team table in V2",
    primary_v2_table: "team"
  },
  {
    v1_table: "paid_participant",
    v1_label: "Paid Participants",
    v2_tables: ["participant_paid"],
    v2_labels: ["Participant Paid"],
    type: "renamed",
    notes: "Renamed from paid_participant to participant_paid",
    primary_v2_table: "participant_paid"
  },

  // ═══════════════════════════════════════════════════════════════
  // FUB TABLES (9)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "fub_accounts",
    v1_label: "FUB Accounts",
    v2_tables: ["fub_accounts"],
    v2_labels: ["FUB Accounts"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "fub_accounts"
  },
  {
    v1_table: "fub_appointments",
    v1_label: "FUB Appointments",
    v2_tables: ["fub_appointments"],
    v2_labels: ["FUB Appointments"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "fub_appointments"
  },
  {
    v1_table: "fub_deal_stages",
    v1_label: "FUB Deal Stages",
    v2_tables: ["fub_stages"],
    v2_labels: ["FUB Stages"],
    type: "renamed",
    notes: "Renamed from fub_deal_stages to fub_stages",
    primary_v2_table: "fub_stages"
  },
  {
    v1_table: "fub_deals",
    v1_label: "FUB Deals",
    v2_tables: ["fub_deals"],
    v2_labels: ["FUB Deals"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "fub_deals"
  },
  {
    v1_table: "fub_notes",
    v1_label: "FUB Notes",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "FUB notes merged into contact log in V2",
    primary_v2_table: undefined
  },
  {
    v1_table: "fub_people",
    v1_label: "FUB People",
    v2_tables: ["fub_people"],
    v2_labels: ["FUB People"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "fub_people"
  },
  {
    v1_table: "fub_tasks",
    v1_label: "FUB Tasks",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "FUB tasks not migrated to V2",
    primary_v2_table: undefined
  },
  {
    v1_table: "fub_calls",
    v1_label: "FUB Calls",
    v2_tables: ["fub_calls"],
    v2_labels: ["FUB Calls"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "fub_calls"
  },
  {
    v1_table: "fub_texts",
    v1_label: "FUB Texts",
    v2_tables: ["fub_text_messages"],
    v2_labels: ["FUB Text Messages"],
    type: "renamed",
    notes: "Renamed from fub_texts to fub_text_messages",
    primary_v2_table: "fub_text_messages"
  },

  // ═══════════════════════════════════════════════════════════════
  // OTHER TABLES (4)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "links",
    v1_label: "Links",
    v2_tables: ["team_links", "user_links"],
    v2_labels: ["Team Links", "User Links"],
    type: "split",
    notes: "Split into team-specific and user-specific links",
    primary_v2_table: "team_links"
  },
  {
    v1_table: "leads",
    v1_label: "Leads",
    v2_tables: ["leads"],
    v2_labels: ["Leads"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "leads"
  },
  {
    v1_table: "team_admins",
    v1_label: "Team Admins",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Team admin role merged into team_members with role flag in V2",
    primary_v2_table: undefined
  },
  {
    v1_table: "connections",
    v1_label: "Connections",
    v2_tables: ["connections"],
    v2_labels: ["Connections"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "core",
    primary_v2_table: "connections"
  },

  // ═══════════════════════════════════════════════════════════════
  // DIRECTORS/LEADERS/MENTORS (8)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "directors",
    v1_label: "Directors",
    v2_tables: ["director", "team_director_assignments"],
    v2_labels: ["Director", "Team Director Assignments"],
    type: "split",
    notes: "Director records + team assignments junction",
    category: "core",
    primary_v2_table: "director"
  },
  {
    v1_table: "director assignments",
    v1_label: "Director Assignments",
    v2_tables: ["team_director_assignments"],
    v2_labels: ["Team Director Assignments"],
    type: "renamed",
    notes: "Renamed to team_director_assignments",
    category: "core",
    primary_v2_table: "team_director_assignments"
  },
  {
    v1_table: "leaders",
    v1_label: "Leaders",
    v2_tables: ["leader", "team_leader_assignments"],
    v2_labels: ["Leader", "Team Leader Assignments"],
    type: "split",
    notes: "Leader records + team assignments junction",
    category: "core",
    primary_v2_table: "leader"
  },
  {
    v1_table: "leader assignments",
    v1_label: "Leader Assignments",
    v2_tables: ["team_leader_assignments"],
    v2_labels: ["Team Leader Assignments"],
    type: "renamed",
    notes: "Renamed to team_leader_assignments",
    category: "core",
    primary_v2_table: "team_leader_assignments"
  },
  {
    v1_table: "mentors",
    v1_label: "Mentors",
    v2_tables: ["mentor"],
    v2_labels: ["Mentor"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "core",
    primary_v2_table: "mentor"
  },
  {
    v1_table: "mentor assignments",
    v1_label: "Mentor Assignments",
    v2_tables: ["team_mentor_assignments"],
    v2_labels: ["Team Mentor Assignments"],
    type: "renamed",
    notes: "Renamed to team_mentor_assignments",
    category: "core",
    primary_v2_table: "team_mentor_assignments"
  },
  {
    v1_table: "domestic partnership",
    v1_label: "Domestic Partnership",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Feature not migrated to V2",
    category: "core"
  },
  {
    v1_table: "domestic partnership roster",
    v1_label: "Domestic Partnership Roster",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Feature not migrated to V2",
    category: "core"
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL CORE TABLES
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "agent - real",
    v1_label: "Agent Real",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Merged into agent table in V2",
    category: "core"
  },
  {
    v1_table: "agent_task_history",
    v1_label: "Agent Task History",
    v2_tables: ["agent_task_history"],
    v2_labels: ["Agent Task History"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "core",
    primary_v2_table: "agent_task_history"
  },
  {
    v1_table: "user - 2FA",
    v1_label: "User 2FA",
    v2_tables: ["user_credentials"],
    v2_labels: ["User Credentials"],
    type: "merged",
    notes: "2FA merged into user_credentials in V2",
    category: "core",
    primary_v2_table: "user_credentials"
  },
  {
    v1_table: "team - admins",
    v1_label: "Team Admins",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Team admin role merged into team_members with role flag",
    category: "core"
  },
  {
    v1_table: "team_admins_permissions",
    v1_label: "Team Admin Permissions",
    v2_tables: ["team_permissions"],
    v2_labels: ["Team Permissions"],
    type: "renamed",
    notes: "Renamed to team_permissions",
    category: "core",
    primary_v2_table: "team_permissions"
  },
  {
    v1_table: "team - member levels",
    v1_label: "Team Member Levels",
    v2_tables: ["team_member_levels"],
    v2_labels: ["Team Member Levels"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "core",
    primary_v2_table: "team_member_levels"
  },
  {
    v1_table: "network - change log",
    v1_label: "Network Change Log",
    v2_tables: ["network_changelog"],
    v2_labels: ["Network Changelog"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "network_changelog"
  },
  {
    v1_table: "paid participant_temp",
    v1_label: "Paid Participant Temp",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Temporary table not migrated",
    category: "staging"
  },
  {
    v1_table: "contributions - pending",
    v1_label: "Contributions Pending",
    v2_tables: ["contribution_pending"],
    v2_labels: ["Contribution Pending"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "contribution_pending"
  },

  // ═══════════════════════════════════════════════════════════════
  // EQUITY TABLES (3)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "equity - annual",
    v1_label: "Equity Annual",
    v2_tables: ["equity_annual"],
    v2_labels: ["Equity Annual"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "equity_annual"
  },
  {
    v1_table: "equity - monthly",
    v1_label: "Equity Monthly",
    v2_tables: ["equity_monthly"],
    v2_labels: ["Equity Monthly"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "equity_monthly"
  },
  {
    v1_table: "equity - transactions",
    v1_label: "Equity Transactions",
    v2_tables: ["equity_transactions"],
    v2_labels: ["Equity Transactions"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "equity_transactions"
  },

  // ═══════════════════════════════════════════════════════════════
  // TITLE/CLOSING TABLES (7)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "closing disclosure",
    v1_label: "Closing Disclosure",
    v2_tables: ["closing_disclosure"],
    v2_labels: ["Closing Disclosure"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "closing_disclosure"
  },
  {
    v1_table: "title - closing items",
    v1_label: "Title Closing Items",
    v2_tables: ["title_closing_items"],
    v2_labels: ["Title Closing Items"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "title_closing_items"
  },
  {
    v1_table: "title - disbursements",
    v1_label: "Title Disbursements",
    v2_tables: ["title_disbursements"],
    v2_labels: ["Title Disbursements"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "title_disbursements"
  },
  {
    v1_table: "title - event",
    v1_label: "Title Event",
    v2_tables: ["title_events"],
    v2_labels: ["Title Events"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "core",
    primary_v2_table: "title_events"
  },
  {
    v1_table: "title - orders",
    v1_label: "Title Orders",
    v2_tables: ["title_orders"],
    v2_labels: ["Title Orders"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "title_orders"
  },
  {
    v1_table: "title - settlement agencies",
    v1_label: "Title Settlement Agencies",
    v2_tables: ["title_settlement_agencies"],
    v2_labels: ["Title Settlement Agencies"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "title_settlement_agencies"
  },
  {
    v1_table: "title - users",
    v1_label: "Title Users",
    v2_tables: ["title_users"],
    v2_labels: ["Title Users"],
    type: "renamed",
    notes: "Renamed without spaces",
    category: "core",
    primary_v2_table: "title_users"
  },

  // ═══════════════════════════════════════════════════════════════
  // AGGREGATION TABLES (50)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "agg_anomalies_detected",
    v1_label: "Agg Anomalies Detected",
    v2_tables: ["agg_anomalies_detected"],
    v2_labels: ["Agg Anomalies Detected"],
    type: "direct",
    notes: "Direct 1:1 mapping - AI anomaly detection",
    category: "aggregation",
    primary_v2_table: "agg_anomalies_detected"
  },
  {
    v1_table: "agg_benchmarks",
    v1_label: "Agg Benchmarks",
    v2_tables: ["agg_benchmarks"],
    v2_labels: ["Agg Benchmarks"],
    type: "direct",
    notes: "Direct 1:1 mapping - Performance benchmarks",
    category: "aggregation",
    primary_v2_table: "agg_benchmarks"
  },
  {
    v1_table: "agg_calls_by_direction",
    v1_label: "Agg Calls By Direction",
    v2_tables: ["agg_calls_by_direction"],
    v2_labels: ["Agg Calls By Direction"],
    type: "direct",
    notes: "Direct 1:1 mapping - FUB calls by direction",
    category: "aggregation",
    primary_v2_table: "agg_calls_by_direction"
  },
  {
    v1_table: "agg_calls_by_outcome",
    v1_label: "Agg Calls By Outcome",
    v2_tables: ["agg_calls_by_outcome"],
    v2_labels: ["Agg Calls By Outcome"],
    type: "direct",
    notes: "Direct 1:1 mapping - FUB calls by outcome",
    category: "aggregation",
    primary_v2_table: "agg_calls_by_outcome"
  },
  {
    v1_table: "agg_events_by_source",
    v1_label: "Agg Events By Source",
    v2_tables: ["agg_events_by_source"],
    v2_labels: ["Agg Events By Source"],
    type: "direct",
    notes: "Direct 1:1 mapping - Events by source",
    category: "aggregation",
    primary_v2_table: "agg_events_by_source"
  },
  {
    v1_table: "agg_events_by_type",
    v1_label: "Agg Events By Type",
    v2_tables: ["agg_events_by_type"],
    v2_labels: ["Agg Events By Type"],
    type: "direct",
    notes: "Direct 1:1 mapping - Events by type",
    category: "aggregation",
    primary_v2_table: "agg_events_by_type"
  },
  {
    v1_table: "agg_fub_activity_by_agent",
    v1_label: "Agg FUB Activity By Agent",
    v2_tables: ["agg_fub_activity_by_agent"],
    v2_labels: ["Agg FUB Activity By Agent"],
    type: "direct",
    notes: "Direct 1:1 mapping - FUB activity leaderboard",
    category: "aggregation",
    primary_v2_table: "agg_fub_activity_by_agent"
  },
  {
    v1_table: "agg_fub_activity_by_month",
    v1_label: "Agg FUB Activity By Month",
    v2_tables: ["agg_fub_activity_by_month"],
    v2_labels: ["Agg FUB Activity By Month"],
    type: "direct",
    notes: "Direct 1:1 mapping - FUB activity by month",
    category: "aggregation",
    primary_v2_table: "agg_fub_activity_by_month"
  },
  {
    v1_table: "agg_funnel_conversion",
    v1_label: "Agg Funnel Conversion",
    v2_tables: ["agg_funnel_conversion"],
    v2_labels: ["Agg Funnel Conversion"],
    type: "direct",
    notes: "Direct 1:1 mapping - Funnel conversion metrics",
    category: "aggregation",
    primary_v2_table: "agg_funnel_conversion"
  },
  {
    v1_table: "agg_leads_by_agent",
    v1_label: "Agg Leads By Agent",
    v2_tables: ["agg_leads_by_agent"],
    v2_labels: ["Agg Leads By Agent"],
    type: "direct",
    notes: "Direct 1:1 mapping - Leads leaderboard",
    category: "aggregation",
    primary_v2_table: "agg_leads_by_agent"
  },
  {
    v1_table: "agg_leads_by_month",
    v1_label: "Agg Leads By Month",
    v2_tables: ["agg_leads_by_month"],
    v2_labels: ["Agg Leads By Month"],
    type: "direct",
    notes: "Direct 1:1 mapping - Leads by month",
    category: "aggregation",
    primary_v2_table: "agg_leads_by_month"
  },
  {
    v1_table: "agg_leads_by_source",
    v1_label: "Agg Leads By Source",
    v2_tables: ["agg_leads_by_source"],
    v2_labels: ["Agg Leads By Source"],
    type: "direct",
    notes: "Direct 1:1 mapping - Leads by source",
    category: "aggregation",
    primary_v2_table: "agg_leads_by_source"
  },
  {
    v1_table: "agg_leads_by_stage",
    v1_label: "Agg Leads By Stage",
    v2_tables: ["agg_leads_by_stage"],
    v2_labels: ["Agg Leads By Stage"],
    type: "direct",
    notes: "Direct 1:1 mapping - Leads by stage",
    category: "aggregation",
    primary_v2_table: "agg_leads_by_stage"
  },
  {
    v1_table: "agg_leads_conversion_funnel",
    v1_label: "Agg Leads Conversion Funnel",
    v2_tables: ["agg_leads_conversion_funnel"],
    v2_labels: ["Agg Leads Conversion Funnel"],
    type: "direct",
    notes: "Direct 1:1 mapping - Lead conversion funnel",
    category: "aggregation",
    primary_v2_table: "agg_leads_conversion_funnel"
  },
  {
    v1_table: "agg_listings_by_agent",
    v1_label: "Agg Listings By Agent",
    v2_tables: ["agg_listings_by_agent"],
    v2_labels: ["Agg Listings By Agent"],
    type: "direct",
    notes: "Direct 1:1 mapping - Listings leaderboard",
    category: "aggregation",
    primary_v2_table: "agg_listings_by_agent"
  },
  {
    v1_table: "agg_listings_by_dom_bucket",
    v1_label: "Agg Listings By DOM Bucket",
    v2_tables: ["agg_listings_by_dom_bucket"],
    v2_labels: ["Agg Listings By DOM Bucket"],
    type: "direct",
    notes: "Direct 1:1 mapping - Listings by days on market",
    category: "aggregation",
    primary_v2_table: "agg_listings_by_dom_bucket"
  },
  {
    v1_table: "agg_listings_by_month",
    v1_label: "Agg Listings By Month",
    v2_tables: ["agg_listings_by_month"],
    v2_labels: ["Agg Listings By Month"],
    type: "direct",
    notes: "Direct 1:1 mapping - Listings by month",
    category: "aggregation",
    primary_v2_table: "agg_listings_by_month"
  },
  {
    v1_table: "agg_listings_by_property_type",
    v1_label: "Agg Listings By Property Type",
    v2_tables: ["agg_listings_by_property_type"],
    v2_labels: ["Agg Listings By Property Type"],
    type: "direct",
    notes: "Direct 1:1 mapping - Listings by property type",
    category: "aggregation",
    primary_v2_table: "agg_listings_by_property_type"
  },
  {
    v1_table: "agg_listings_by_stage",
    v1_label: "Agg Listings By Stage",
    v2_tables: ["agg_listings_by_stage"],
    v2_labels: ["Agg Listings By Stage"],
    type: "direct",
    notes: "Direct 1:1 mapping - Listings by stage",
    category: "aggregation",
    primary_v2_table: "agg_listings_by_stage"
  },
  {
    v1_table: "agg_network_by_geo",
    v1_label: "Agg Network By Geo",
    v2_tables: ["agg_network_by_geo"],
    v2_labels: ["Agg Network By Geo"],
    type: "direct",
    notes: "Direct 1:1 mapping - Network by geography",
    category: "aggregation",
    primary_v2_table: "agg_network_by_geo"
  },
  {
    v1_table: "agg_network_by_month",
    v1_label: "Agg Network By Month",
    v2_tables: ["agg_network_by_month"],
    v2_labels: ["Agg Network By Month"],
    type: "direct",
    notes: "Direct 1:1 mapping - Network recruitment by month",
    category: "aggregation",
    primary_v2_table: "agg_network_by_month"
  },
  {
    v1_table: "agg_network_by_status",
    v1_label: "Agg Network By Status",
    v2_tables: ["agg_network_by_status"],
    v2_labels: ["Agg Network By Status"],
    type: "direct",
    notes: "Direct 1:1 mapping - Network by status",
    category: "aggregation",
    primary_v2_table: "agg_network_by_status"
  },
  {
    v1_table: "agg_network_by_tier",
    v1_label: "Agg Network By Tier",
    v2_tables: ["agg_network_by_tier"],
    v2_labels: ["Agg Network By Tier"],
    type: "direct",
    notes: "Direct 1:1 mapping - Network by revshare tier",
    category: "aggregation",
    primary_v2_table: "agg_network_by_tier"
  },
  {
    v1_table: "agg_network_by_week",
    v1_label: "Agg Network By Week",
    v2_tables: ["agg_network_by_week"],
    v2_labels: ["Agg Network By Week"],
    type: "direct",
    notes: "Direct 1:1 mapping - Network by week",
    category: "aggregation",
    primary_v2_table: "agg_network_by_week"
  },
  {
    v1_table: "agg_network_recruitment_funnel",
    v1_label: "Agg Network Recruitment Funnel",
    v2_tables: ["agg_network_recruitment_funnel"],
    v2_labels: ["Agg Network Recruitment Funnel"],
    type: "direct",
    notes: "Direct 1:1 mapping - Recruitment funnel",
    category: "aggregation",
    primary_v2_table: "agg_network_recruitment_funnel"
  },
  {
    v1_table: "agg_network_revshare_by_month",
    v1_label: "Agg Network Revshare By Month",
    v2_tables: ["agg_network_revshare_by_month"],
    v2_labels: ["Agg Network Revshare By Month"],
    type: "direct",
    notes: "Direct 1:1 mapping - Revshare by month",
    category: "aggregation",
    primary_v2_table: "agg_network_revshare_by_month"
  },
  {
    v1_table: "agg_pacing_daily",
    v1_label: "Agg Pacing Daily",
    v2_tables: ["agg_pacing_daily"],
    v2_labels: ["Agg Pacing Daily"],
    type: "direct",
    notes: "Direct 1:1 mapping - Daily pacing metrics",
    category: "aggregation",
    primary_v2_table: "agg_pacing_daily"
  },
  {
    v1_table: "agg_pipeline_velocity",
    v1_label: "Agg Pipeline Velocity",
    v2_tables: ["agg_pipeline_velocity"],
    v2_labels: ["Agg Pipeline Velocity"],
    type: "direct",
    notes: "Direct 1:1 mapping - Pipeline velocity",
    category: "aggregation",
    primary_v2_table: "agg_pipeline_velocity"
  },
  {
    v1_table: "aggregation_jobs",
    v1_label: "Aggregation Jobs",
    v2_tables: ["aggregation_jobs"],
    v2_labels: ["Aggregation Jobs"],
    type: "direct",
    notes: "Direct 1:1 mapping - Aggregation task queue",
    category: "aggregation",
    primary_v2_table: "aggregation_jobs"
  },
  {
    v1_table: "agg_revenue_by_agent",
    v1_label: "Agg Revenue By Agent",
    v2_tables: ["agg_revenue_by_agent"],
    v2_labels: ["Agg Revenue By Agent"],
    type: "direct",
    notes: "Direct 1:1 mapping - Revenue leaderboard",
    category: "aggregation",
    primary_v2_table: "agg_revenue_by_agent"
  },
  {
    v1_table: "agg_revenue_by_deduction_type",
    v1_label: "Agg Revenue By Deduction Type",
    v2_tables: ["agg_revenue_by_deduction_type"],
    v2_labels: ["Agg Revenue By Deduction Type"],
    type: "direct",
    notes: "Direct 1:1 mapping - Revenue by deduction",
    category: "aggregation",
    primary_v2_table: "agg_revenue_by_deduction_type"
  },
  {
    v1_table: "agg_revenue_by_month",
    v1_label: "Agg Revenue By Month",
    v2_tables: ["agg_revenue_by_month"],
    v2_labels: ["Agg Revenue By Month"],
    type: "direct",
    notes: "Direct 1:1 mapping - Revenue by month",
    category: "aggregation",
    primary_v2_table: "agg_revenue_by_month"
  },
  {
    v1_table: "agg_revenue_by_week",
    v1_label: "Agg Revenue By Week",
    v2_tables: ["agg_revenue_by_week"],
    v2_labels: ["Agg Revenue By Week"],
    type: "direct",
    notes: "Direct 1:1 mapping - Revenue by week",
    category: "aggregation",
    primary_v2_table: "agg_revenue_by_week"
  },
  {
    v1_table: "agg_revenue_waterfall",
    v1_label: "Agg Revenue Waterfall",
    v2_tables: ["agg_revenue_waterfall"],
    v2_labels: ["Agg Revenue Waterfall"],
    type: "direct",
    notes: "Direct 1:1 mapping - Revenue waterfall",
    category: "aggregation",
    primary_v2_table: "agg_revenue_waterfall"
  },
  {
    v1_table: "agg_revenue_ytd",
    v1_label: "Agg Revenue YTD",
    v2_tables: ["agg_revenue_ytd"],
    v2_labels: ["Agg Revenue YTD"],
    type: "direct",
    notes: "Direct 1:1 mapping - Year to date revenue",
    category: "aggregation",
    primary_v2_table: "agg_revenue_ytd"
  },
  {
    v1_table: "agg_risk_flags_current",
    v1_label: "Agg Risk Flags Current",
    v2_tables: ["agg_risk_flags_current"],
    v2_labels: ["Agg Risk Flags Current"],
    type: "direct",
    notes: "Direct 1:1 mapping - Current risk flags",
    category: "aggregation",
    primary_v2_table: "agg_risk_flags_current"
  },
  {
    v1_table: "agg_targets",
    v1_label: "Agg Targets",
    v2_tables: ["agg_targets"],
    v2_labels: ["Agg Targets"],
    type: "direct",
    notes: "Direct 1:1 mapping - Goals/targets",
    category: "aggregation",
    primary_v2_table: "agg_targets"
  },
  {
    v1_table: "agg_team_leaderboard",
    v1_label: "Agg Team Leaderboard",
    v2_tables: ["agg_team_leaderboard"],
    v2_labels: ["Agg Team Leaderboard"],
    type: "direct",
    notes: "Direct 1:1 mapping - Team leaderboard",
    category: "aggregation",
    primary_v2_table: "agg_team_leaderboard"
  },
  {
    v1_table: "agg_texts_by_direction",
    v1_label: "Agg Texts By Direction",
    v2_tables: ["agg_texts_by_direction"],
    v2_labels: ["Agg Texts By Direction"],
    type: "direct",
    notes: "Direct 1:1 mapping - Text messages by direction",
    category: "aggregation",
    primary_v2_table: "agg_texts_by_direction"
  },
  {
    v1_table: "agg_transactions_by_agent",
    v1_label: "Agg Transactions By Agent",
    v2_tables: ["agg_transactions_by_agent"],
    v2_labels: ["Agg Transactions By Agent"],
    type: "direct",
    notes: "Direct 1:1 mapping - Transactions leaderboard",
    category: "aggregation",
    primary_v2_table: "agg_transactions_by_agent"
  },
  {
    v1_table: "agg_transactions_by_geo",
    v1_label: "Agg Transactions By Geo",
    v2_tables: ["agg_transactions_by_geo"],
    v2_labels: ["Agg Transactions By Geo"],
    type: "direct",
    notes: "Direct 1:1 mapping - Transactions by geography",
    category: "aggregation",
    primary_v2_table: "agg_transactions_by_geo"
  },
  {
    v1_table: "agg_transactions_by_month",
    v1_label: "Agg Transactions By Month",
    v2_tables: ["agg_transactions_by_month"],
    v2_labels: ["Agg Transactions By Month"],
    type: "direct",
    notes: "Direct 1:1 mapping - Transactions by month",
    category: "aggregation",
    primary_v2_table: "agg_transactions_by_month"
  },
  {
    v1_table: "agg_transactions_by_stage",
    v1_label: "Agg Transactions By Stage",
    v2_tables: ["agg_transactions_by_stage"],
    v2_labels: ["Agg Transactions By Stage"],
    type: "direct",
    notes: "Direct 1:1 mapping - Transactions by stage",
    category: "aggregation",
    primary_v2_table: "agg_transactions_by_stage"
  },
  {
    v1_table: "agg_transactions_by_type",
    v1_label: "Agg Transactions By Type",
    v2_tables: ["agg_transactions_by_type"],
    v2_labels: ["Agg Transactions By Type"],
    type: "direct",
    notes: "Direct 1:1 mapping - Transactions by type",
    category: "aggregation",
    primary_v2_table: "agg_transactions_by_type"
  },
  {
    v1_table: "agg_transactions_by_week",
    v1_label: "Agg Transactions By Week",
    v2_tables: ["agg_transactions_by_week"],
    v2_labels: ["Agg Transactions By Week"],
    type: "direct",
    notes: "Direct 1:1 mapping - Transactions by week",
    category: "aggregation",
    primary_v2_table: "agg_transactions_by_week"
  },
  {
    v1_table: "agg_transactions_yoy",
    v1_label: "Agg Transactions YoY",
    v2_tables: ["agg_transactions_yoy"],
    v2_labels: ["Agg Transactions YoY"],
    type: "direct",
    notes: "Direct 1:1 mapping - Year over year transactions",
    category: "aggregation",
    primary_v2_table: "agg_transactions_yoy"
  },
  {
    v1_table: "leaderboard_jobs",
    v1_label: "Leaderboard Jobs",
    v2_tables: ["leaderboard_jobs"],
    v2_labels: ["Leaderboard Jobs"],
    type: "direct",
    notes: "Direct 1:1 mapping - Leaderboard aggregation queue",
    category: "aggregation",
    primary_v2_table: "leaderboard_jobs"
  },

  // ═══════════════════════════════════════════════════════════════
  // FUB - FOLLOW UP BOSS (18)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "FUB - accounts",
    v1_label: "FUB Accounts",
    v2_tables: ["fub_accounts"],
    v2_labels: ["FUB Accounts"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_accounts"
  },
  {
    v1_table: "FUB - appointments",
    v1_label: "FUB Appointments",
    v2_tables: ["fub_appointments"],
    v2_labels: ["FUB Appointments"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_appointments"
  },
  {
    v1_table: "FUB - calls",
    v1_label: "FUB Calls",
    v2_tables: ["fub_calls"],
    v2_labels: ["FUB Calls"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_calls"
  },
  {
    v1_table: "FUB - deals",
    v1_label: "FUB Deals",
    v2_tables: ["fub_deals"],
    v2_labels: ["FUB Deals"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_deals"
  },
  {
    v1_table: "FUB - events",
    v1_label: "FUB Events",
    v2_tables: ["fub_events"],
    v2_labels: ["FUB Events"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_events"
  },
  {
    v1_table: "FUB - groups",
    v1_label: "FUB Groups",
    v2_tables: ["fub_groups"],
    v2_labels: ["FUB Groups"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_groups"
  },
  {
    v1_table: "FUB - Lambda Coordinator Worker Log",
    v1_label: "FUB Lambda Coordinator",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Lambda coordinator merged into standard job logs",
    category: "fub"
  },
  {
    v1_table: "FUB - missing people id",
    v1_label: "FUB Missing People ID",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Diagnostic table not migrated",
    category: "fub"
  },
  {
    v1_table: "FUB - onboarding jobs",
    v1_label: "FUB Onboarding Jobs",
    v2_tables: ["fub_onboarding_jobs"],
    v2_labels: ["FUB Onboarding Jobs"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_onboarding_jobs"
  },
  {
    v1_table: "FUB - people",
    v1_label: "FUB People",
    v2_tables: ["fub_people"],
    v2_labels: ["FUB People"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_people"
  },
  {
    v1_table: "FUB - stages",
    v1_label: "FUB Stages",
    v2_tables: ["fub_stages"],
    v2_labels: ["FUB Stages"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_stages"
  },
  {
    v1_table: "FUB - sync jobs",
    v1_label: "FUB Sync Jobs",
    v2_tables: ["fub_sync_jobs"],
    v2_labels: ["FUB Sync Jobs"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_sync_jobs"
  },
  {
    v1_table: "FUB_Temp_Bulk_Appointment_Data",
    v1_label: "FUB Temp Bulk Appointments",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Temporary table not migrated",
    category: "staging"
  },
  {
    v1_table: "FUB - text messages",
    v1_label: "FUB Text Messages",
    v2_tables: ["fub_text_messages"],
    v2_labels: ["FUB Text Messages"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_text_messages"
  },
  {
    v1_table: "FUB - users",
    v1_label: "FUB Users",
    v2_tables: ["fub_users"],
    v2_labels: ["FUB Users"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "fub",
    primary_v2_table: "fub_users"
  },
  {
    v1_table: "fub_aggregation_jobs",
    v1_label: "FUB Aggregation Jobs",
    v2_tables: ["fub_aggregation_jobs"],
    v2_labels: ["FUB Aggregation Jobs"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "fub",
    primary_v2_table: "fub_aggregation_jobs"
  },

  // ═══════════════════════════════════════════════════════════════
  // REZEN INTEGRATION (12)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "rezen - onboarding jobs",
    v1_label: "Rezen Onboarding Jobs",
    v2_tables: ["rezen_onboarding_jobs"],
    v2_labels: ["Rezen Onboarding Jobs"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "rezen",
    primary_v2_table: "rezen_onboarding_jobs"
  },
  {
    v1_table: "rezen - sync jobs",
    v1_label: "Rezen Sync Jobs",
    v2_tables: ["rezen_sync_jobs"],
    v2_labels: ["Rezen Sync Jobs"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "rezen",
    primary_v2_table: "rezen_sync_jobs"
  },
  {
    v1_table: "rezen - sync jobs - logs",
    v1_label: "Rezen Sync Jobs Logs",
    v2_tables: ["rezen_sync_logs"],
    v2_labels: ["Rezen Sync Logs"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "rezen",
    primary_v2_table: "rezen_sync_logs"
  },
  {
    v1_table: "referral code - rezen",
    v1_label: "Referral Code Rezen",
    v2_tables: ["rezen_referral_codes"],
    v2_labels: ["Rezen Referral Codes"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "rezen",
    primary_v2_table: "rezen_referral_codes"
  },
  {
    v1_table: "process webhook - rezen",
    v1_label: "Process Webhook Rezen",
    v2_tables: ["rezen_webhook_queue"],
    v2_labels: ["Rezen Webhook Queue"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "rezen",
    primary_v2_table: "rezen_webhook_queue"
  },
  {
    v1_table: "webhooks - registered rezen",
    v1_label: "Webhooks Registered Rezen",
    v2_tables: ["rezen_webhooks"],
    v2_labels: ["Rezen Webhooks"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "rezen",
    primary_v2_table: "rezen_webhooks"
  },

  // ═══════════════════════════════════════════════════════════════
  // SKYSLOPE INTEGRATION (4)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "skyslope - sync jobs",
    v1_label: "SkySlope Sync Jobs",
    v2_tables: ["skyslope_sync_jobs"],
    v2_labels: ["SkySlope Sync Jobs"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "skyslope",
    primary_v2_table: "skyslope_sync_jobs"
  },

  // ═══════════════════════════════════════════════════════════════
  // DOTLOOP INTEGRATION (6)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "dotloop_accounts",
    v1_label: "DotLoop Accounts",
    v2_tables: ["dotloop_accounts"],
    v2_labels: ["DotLoop Accounts"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "dotloop",
    primary_v2_table: "dotloop_accounts"
  },
  {
    v1_table: "dotloop_contacts",
    v1_label: "DotLoop Contacts",
    v2_tables: ["dotloop_contacts"],
    v2_labels: ["DotLoop Contacts"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "dotloop",
    primary_v2_table: "dotloop_contacts"
  },
  {
    v1_table: "dotloop_loops",
    v1_label: "DotLoop Loops",
    v2_tables: ["dotloop_loops"],
    v2_labels: ["DotLoop Loops"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "dotloop",
    primary_v2_table: "dotloop_loops"
  },
  {
    v1_table: "dotloop_profiles",
    v1_label: "DotLoop Profiles",
    v2_tables: ["dotloop_profiles"],
    v2_labels: ["DotLoop Profiles"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "dotloop",
    primary_v2_table: "dotloop_profiles"
  },
  {
    v1_table: "dotloop_sync_state",
    v1_label: "DotLoop Sync State",
    v2_tables: ["dotloop_sync_state"],
    v2_labels: ["DotLoop Sync State"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "dotloop",
    primary_v2_table: "dotloop_sync_state"
  },

  // ═══════════════════════════════════════════════════════════════
  // LOFTY INTEGRATION (4)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "lofty_accounts",
    v1_label: "Lofty Accounts",
    v2_tables: ["lofty_accounts"],
    v2_labels: ["Lofty Accounts"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "lofty",
    primary_v2_table: "lofty_accounts"
  },
  {
    v1_table: "lofty_leads",
    v1_label: "Lofty Leads",
    v2_tables: ["lofty_leads"],
    v2_labels: ["Lofty Leads"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "lofty",
    primary_v2_table: "lofty_leads"
  },
  {
    v1_table: "lofty_sync_state",
    v1_label: "Lofty Sync State",
    v2_tables: ["lofty_sync_state"],
    v2_labels: ["Lofty Sync State"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "lofty",
    primary_v2_table: "lofty_sync_state"
  },

  // ═══════════════════════════════════════════════════════════════
  // STRIPE / BILLING (8)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "stripe - pricing",
    v1_label: "Stripe Pricing",
    v2_tables: ["stripe_pricing"],
    v2_labels: ["Stripe Pricing"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "stripe",
    primary_v2_table: "stripe_pricing"
  },
  {
    v1_table: "stripe - product",
    v1_label: "Stripe Product",
    v2_tables: ["stripe_products"],
    v2_labels: ["Stripe Products"],
    type: "renamed",
    notes: "Renamed to snake_case plural",
    category: "stripe",
    primary_v2_table: "stripe_products"
  },
  {
    v1_table: "stripe - subscription packages",
    v1_label: "Stripe Subscription Packages",
    v2_tables: ["stripe_subscription_packages"],
    v2_labels: ["Stripe Subscription Packages"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "stripe",
    primary_v2_table: "stripe_subscription_packages"
  },
  {
    v1_table: "stripe - subscriptions",
    v1_label: "Stripe Subscriptions",
    v2_tables: ["stripe_subscriptions"],
    v2_labels: ["Stripe Subscriptions"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "stripe",
    primary_v2_table: "stripe_subscriptions"
  },
  {
    v1_table: "plan_features",
    v1_label: "Plan Features",
    v2_tables: ["plan_features"],
    v2_labels: ["Plan Features"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "stripe",
    primary_v2_table: "plan_features"
  },
  {
    v1_table: "commission payment",
    v1_label: "Commission Payment",
    v2_tables: ["commission_payments"],
    v2_labels: ["Commission Payments"],
    type: "renamed",
    notes: "Renamed to snake_case plural",
    category: "stripe",
    primary_v2_table: "commission_payments"
  },
  {
    v1_table: "commission plan",
    v1_label: "Commission Plan",
    v2_tables: ["commission_plans"],
    v2_labels: ["Commission Plans"],
    type: "renamed",
    notes: "Renamed to snake_case plural",
    category: "stripe",
    primary_v2_table: "commission_plans"
  },
  {
    v1_table: "outgoing_payments",
    v1_label: "Outgoing Payments",
    v2_tables: ["outgoing_payments"],
    v2_labels: ["Outgoing Payments"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "stripe",
    primary_v2_table: "outgoing_payments"
  },

  // ═══════════════════════════════════════════════════════════════
  // PAGE BUILDER (12)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "pages",
    v1_label: "Pages",
    v2_tables: ["pages"],
    v2_labels: ["Pages"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "pages"
  },
  {
    v1_table: "page_tabs",
    v1_label: "Page Tabs",
    v2_tables: ["page_tabs"],
    v2_labels: ["Page Tabs"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "page_tabs"
  },
  {
    v1_table: "page_sections",
    v1_label: "Page Sections",
    v2_tables: ["page_sections"],
    v2_labels: ["Page Sections"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "page_sections"
  },
  {
    v1_table: "page_widgets",
    v1_label: "Page Widgets",
    v2_tables: ["page_widgets"],
    v2_labels: ["Page Widgets"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "page_widgets"
  },
  {
    v1_table: "page_filters",
    v1_label: "Page Filters",
    v2_tables: ["page_filters"],
    v2_labels: ["Page Filters"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "page_filters"
  },
  {
    v1_table: "filter_options",
    v1_label: "Filter Options",
    v2_tables: ["filter_options"],
    v2_labels: ["Filter Options"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "filter_options"
  },
  {
    v1_table: "page_layouts",
    v1_label: "Page Layouts",
    v2_tables: ["page_layouts"],
    v2_labels: ["Page Layouts"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "page_layouts"
  },
  {
    v1_table: "page_chart_assignments",
    v1_label: "Page Chart Assignments",
    v2_tables: ["page_chart_assignments"],
    v2_labels: ["Page Chart Assignments"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "page_chart_assignments"
  },
  {
    v1_table: "widget_viewport_layouts",
    v1_label: "Widget Viewport Layouts",
    v2_tables: ["widget_viewport_layouts"],
    v2_labels: ["Widget Viewport Layouts"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "widget_viewport_layouts"
  },
  {
    v1_table: "user_filter_preferences",
    v1_label: "User Filter Preferences",
    v2_tables: ["user_filter_preferences"],
    v2_labels: ["User Filter Preferences"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "user_filter_preferences"
  },
  {
    v1_table: "user_page_layouts",
    v1_label: "User Page Layouts",
    v2_tables: ["user_page_layouts"],
    v2_labels: ["User Page Layouts"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "user_page_layouts"
  },
  {
    v1_table: "user_dashboard_sections",
    v1_label: "User Dashboard Sections",
    v2_tables: ["user_dashboard_sections"],
    v2_labels: ["User Dashboard Sections"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "pagebuilder",
    primary_v2_table: "user_dashboard_sections"
  },

  // ═══════════════════════════════════════════════════════════════
  // CHARTS (11)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "chart_catalog",
    v1_label: "Chart Catalog",
    v2_tables: ["chart_catalog"],
    v2_labels: ["Chart Catalog"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "charts",
    primary_v2_table: "chart_catalog"
  },
  {
    v1_table: "chart_types",
    v1_label: "Chart Types",
    v2_tables: ["chart_types"],
    v2_labels: ["Chart Types"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "charts",
    primary_v2_table: "chart_types"
  },
  {
    v1_table: "chart_libraries",
    v1_label: "Chart Libraries",
    v2_tables: ["chart_libraries"],
    v2_labels: ["Chart Libraries"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "charts",
    primary_v2_table: "chart_libraries"
  },
  {
    v1_table: "charts",
    v1_label: "Charts",
    v2_tables: ["charts"],
    v2_labels: ["Charts"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "charts",
    primary_v2_table: "charts"
  },
  {
    v1_table: "code_chart_catalog",
    v1_label: "Code Chart Catalog",
    v2_tables: ["code_chart_catalog"],
    v2_labels: ["Code Chart Catalog"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "charts",
    primary_v2_table: "code_chart_catalog"
  },
  {
    v1_table: "chart - transactions",
    v1_label: "Chart Transactions",
    v2_tables: ["chart_transactions"],
    v2_labels: ["Chart Transactions"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "charts",
    primary_v2_table: "chart_transactions"
  },
  {
    v1_table: "my_dashboard_configuration",
    v1_label: "My Dashboard Configuration",
    v2_tables: ["my_dashboard_configuration"],
    v2_labels: ["My Dashboard Configuration"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "charts",
    primary_v2_table: "my_dashboard_configuration"
  },
  {
    v1_table: "kpi_goals",
    v1_label: "KPI Goals",
    v2_tables: ["kpi_goals"],
    v2_labels: ["KPI Goals"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "charts",
    primary_v2_table: "kpi_goals"
  },
  {
    v1_table: "luzmo - charts",
    v1_label: "Luzmo Charts",
    v2_tables: ["luzmo_charts"],
    v2_labels: ["Luzmo Charts"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "charts",
    primary_v2_table: "luzmo_charts"
  },
  {
    v1_table: "luzmo - collections",
    v1_label: "Luzmo Collections",
    v2_tables: ["luzmo_collections"],
    v2_labels: ["Luzmo Collections"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "charts",
    primary_v2_table: "luzmo_collections"
  },
  {
    v1_table: "luzmo - dashboards",
    v1_label: "Luzmo Dashboards",
    v2_tables: ["luzmo_dashboards"],
    v2_labels: ["Luzmo Dashboards"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "charts",
    primary_v2_table: "luzmo_dashboards"
  },

  // ═══════════════════════════════════════════════════════════════
  // AI / NORA (10)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "ai_chart_conversations",
    v1_label: "AI Chart Conversations",
    v2_tables: ["ai_chart_conversations"],
    v2_labels: ["AI Chart Conversations"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "ai",
    primary_v2_table: "ai_chart_conversations"
  },
  {
    v1_table: "ai_features_agent_period",
    v1_label: "AI Features Agent Period",
    v2_tables: ["ai_features_agent_period"],
    v2_labels: ["AI Features Agent Period"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "ai",
    primary_v2_table: "ai_features_agent_period"
  },
  {
    v1_table: "ai_features_lead_current",
    v1_label: "AI Features Lead Current",
    v2_tables: ["ai_features_lead_current"],
    v2_labels: ["AI Features Lead Current"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "ai",
    primary_v2_table: "ai_features_lead_current"
  },
  {
    v1_table: "ai_features_pipeline_current",
    v1_label: "AI Features Pipeline Current",
    v2_tables: ["ai_features_pipeline_current"],
    v2_labels: ["AI Features Pipeline Current"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "ai",
    primary_v2_table: "ai_features_pipeline_current"
  },
  {
    v1_table: "nora_conversations",
    v1_label: "NORA Conversations",
    v2_tables: ["nora_conversations"],
    v2_labels: ["NORA Conversations"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "ai",
    primary_v2_table: "nora_conversations"
  },
  {
    v1_table: "user_insights",
    v1_label: "User Insights",
    v2_tables: ["user_insights"],
    v2_labels: ["User Insights"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "ai",
    primary_v2_table: "user_insights"
  },
  {
    v1_table: "user_actions",
    v1_label: "User Actions",
    v2_tables: ["user_actions"],
    v2_labels: ["User Actions"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "ai",
    primary_v2_table: "user_actions"
  },
  {
    v1_table: "snap_metrics_daily",
    v1_label: "Snap Metrics Daily",
    v2_tables: ["snap_metrics_daily"],
    v2_labels: ["Snap Metrics Daily"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "ai",
    primary_v2_table: "snap_metrics_daily"
  },
  {
    v1_table: "dim_status_mapping",
    v1_label: "Dim Status Mapping",
    v2_tables: ["dim_status_mapping"],
    v2_labels: ["Dim Status Mapping"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "ai",
    primary_v2_table: "dim_status_mapping"
  },
  {
    v1_table: "dim_time_periods",
    v1_label: "Dim Time Periods",
    v2_tables: ["dim_time_periods"],
    v2_labels: ["Dim Time Periods"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "ai",
    primary_v2_table: "dim_time_periods"
  },

  // ═══════════════════════════════════════════════════════════════
  // LAMBDA JOBS (6)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "lambda jobs - log",
    v1_label: "Lambda Jobs Log",
    v2_tables: ["lambda_job_logs"],
    v2_labels: ["Lambda Job Logs"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "lambda",
    primary_v2_table: "lambda_job_logs"
  },
  {
    v1_table: "lambda jobs - status",
    v1_label: "Lambda Jobs Status",
    v2_tables: ["lambda_job_status"],
    v2_labels: ["Lambda Job Status"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "lambda",
    primary_v2_table: "lambda_job_status"
  },
  {
    v1_table: "lambda_worker_log",
    v1_label: "Lambda Worker Log",
    v2_tables: ["lambda_worker_logs"],
    v2_labels: ["Lambda Worker Logs"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "lambda",
    primary_v2_table: "lambda_worker_logs"
  },
  {
    v1_table: "lambda_failed_record",
    v1_label: "Lambda Failed Record",
    v2_tables: ["lambda_failed_records"],
    v2_labels: ["Lambda Failed Records"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "lambda",
    primary_v2_table: "lambda_failed_records"
  },
  {
    v1_table: "api workers",
    v1_label: "API Workers",
    v2_tables: ["api_workers"],
    v2_labels: ["API Workers"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "lambda",
    primary_v2_table: "api_workers"
  },

  // ═══════════════════════════════════════════════════════════════
  // LOGS & AUDIT (14)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "audits",
    v1_label: "Audits",
    v2_tables: ["audits"],
    v2_labels: ["Audits"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "logs",
    primary_v2_table: "audits"
  },
  {
    v1_table: "system audit",
    v1_label: "System Audit",
    v2_tables: ["system_audit"],
    v2_labels: ["System Audit"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "logs",
    primary_v2_table: "system_audit"
  },
  {
    v1_table: "error logs",
    v1_label: "Error Logs",
    v2_tables: ["error_logs"],
    v2_labels: ["Error Logs"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "logs",
    primary_v2_table: "error_logs"
  },
  {
    v1_table: "event log",
    v1_label: "Event Log",
    v2_tables: ["event_logs"],
    v2_labels: ["Event Logs"],
    type: "renamed",
    notes: "Renamed to snake_case plural",
    category: "logs",
    primary_v2_table: "event_logs"
  },
  {
    v1_table: "email - logs",
    v1_label: "Email Logs",
    v2_tables: ["email_logs"],
    v2_labels: ["Email Logs"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "logs",
    primary_v2_table: "email_logs"
  },
  {
    v1_table: "email - master",
    v1_label: "Email Master",
    v2_tables: ["email_master"],
    v2_labels: ["Email Master"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "logs",
    primary_v2_table: "email_master"
  },
  {
    v1_table: "log - contributions",
    v1_label: "Log Contributions",
    v2_tables: ["contribution_logs"],
    v2_labels: ["Contribution Logs"],
    type: "renamed",
    notes: "Renamed to domain_logs pattern",
    category: "logs",
    primary_v2_table: "contribution_logs"
  },
  {
    v1_table: "log - network",
    v1_label: "Log Network",
    v2_tables: ["network_logs"],
    v2_labels: ["Network Logs"],
    type: "renamed",
    notes: "Renamed to domain_logs pattern",
    category: "logs",
    primary_v2_table: "network_logs"
  },
  {
    v1_table: "log - api keys",
    v1_label: "Log API Keys",
    v2_tables: ["api_key_logs"],
    v2_labels: ["API Key Logs"],
    type: "renamed",
    notes: "Renamed to domain_logs pattern",
    category: "logs",
    primary_v2_table: "api_key_logs"
  },
  {
    v1_table: "deleted_records_audit",
    v1_label: "Deleted Records Audit",
    v2_tables: ["deleted_records_audit"],
    v2_labels: ["Deleted Records Audit"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "logs",
    primary_v2_table: "deleted_records_audit"
  },
  {
    v1_table: "transaction_stage_log",
    v1_label: "Transaction Stage Log",
    v2_tables: ["transaction_stage_logs"],
    v2_labels: ["Transaction Stage Logs"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "logs",
    primary_v2_table: "transaction_stage_logs"
  },
  {
    v1_table: "transaction_effective_close_date_log",
    v1_label: "Transaction Close Date Log",
    v2_tables: ["transaction_close_date_logs"],
    v2_labels: ["Transaction Close Date Logs"],
    type: "renamed",
    notes: "Renamed to shorter plural form",
    category: "logs",
    primary_v2_table: "transaction_close_date_logs"
  },
  {
    v1_table: "transaction_price_log",
    v1_label: "Transaction Price Log",
    v2_tables: ["transaction_price_logs"],
    v2_labels: ["Transaction Price Logs"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "logs",
    primary_v2_table: "transaction_price_logs"
  },
  {
    v1_table: "contact_log",
    v1_label: "Contact Log",
    v2_tables: ["contact_logs"],
    v2_labels: ["Contact Logs"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "logs",
    primary_v2_table: "contact_logs"
  },
  {
    v1_table: "demo_sync_log",
    v1_label: "Demo Sync Log",
    v2_tables: ["demo_sync_logs"],
    v2_labels: ["Demo Sync Logs"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "logs",
    primary_v2_table: "demo_sync_logs"
  },

  // ═══════════════════════════════════════════════════════════════
  // CONFIG & REFERENCE (20)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "api_keys",
    v1_label: "API Keys",
    v2_tables: ["api_keys"],
    v2_labels: ["API Keys"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "config",
    primary_v2_table: "api_keys"
  },
  {
    v1_table: "brokerage",
    v1_label: "Brokerage",
    v2_tables: ["brokerages"],
    v2_labels: ["Brokerages"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "config",
    primary_v2_table: "brokerages"
  },
  {
    v1_table: "office",
    v1_label: "Office",
    v2_tables: ["offices"],
    v2_labels: ["Offices"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "config",
    primary_v2_table: "offices"
  },
  {
    v1_table: "global variables",
    v1_label: "Global Variables",
    v2_tables: ["global_variables"],
    v2_labels: ["Global Variables"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "config",
    primary_v2_table: "global_variables"
  },
  {
    v1_table: "permissions",
    v1_label: "Permissions",
    v2_tables: ["permissions"],
    v2_labels: ["Permissions"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "config",
    primary_v2_table: "permissions"
  },
  {
    v1_table: "modules",
    v1_label: "Modules",
    v2_tables: ["modules"],
    v2_labels: ["Modules"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "config",
    primary_v2_table: "modules"
  },
  {
    v1_table: "state or province",
    v1_label: "State Province",
    v2_tables: ["states_provinces"],
    v2_labels: ["States Provinces"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "config",
    primary_v2_table: "states_provinces"
  },
  {
    v1_table: "calendar",
    v1_label: "Calendar",
    v2_tables: ["calendar"],
    v2_labels: ["Calendar"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "config",
    primary_v2_table: "calendar"
  },
  {
    v1_table: "tags",
    v1_label: "Tags",
    v2_tables: ["tags"],
    v2_labels: ["Tags"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "config",
    primary_v2_table: "tags"
  },
  {
    v1_table: "integration",
    v1_label: "Integration",
    v2_tables: ["integrations"],
    v2_labels: ["Integrations"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "config",
    primary_v2_table: "integrations"
  },
  {
    v1_table: "rev share payments",
    v1_label: "Rev Share Payments",
    v2_tables: ["revshare_payments"],
    v2_labels: ["RevShare Payments"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "config",
    primary_v2_table: "revshare_payments"
  },
  {
    v1_table: "revshare plan",
    v1_label: "RevShare Plan",
    v2_tables: ["revshare_plans"],
    v2_labels: ["RevShare Plans"],
    type: "renamed",
    notes: "Renamed to snake_case plural",
    category: "config",
    primary_v2_table: "revshare_plans"
  },
  {
    v1_table: "sponsor tree",
    v1_label: "Sponsor Tree",
    v2_tables: ["sponsor_tree"],
    v2_labels: ["Sponsor Tree"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "config",
    primary_v2_table: "sponsor_tree"
  },
  {
    v1_table: "real - lifecycle group",
    v1_label: "Real Lifecycle Group",
    v2_tables: ["lifecycle_groups"],
    v2_labels: ["Lifecycle Groups"],
    type: "renamed",
    notes: "Renamed to simpler form",
    category: "config",
    primary_v2_table: "lifecycle_groups"
  },
  {
    v1_table: "lead source - defaults",
    v1_label: "Lead Source Defaults",
    v2_tables: ["lead_source_defaults"],
    v2_labels: ["Lead Source Defaults"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "config",
    primary_v2_table: "lead_source_defaults"
  },
  {
    v1_table: "lead source - user",
    v1_label: "Lead Source User",
    v2_tables: ["lead_source_user"],
    v2_labels: ["Lead Source User"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "config",
    primary_v2_table: "lead_source_user"
  },
  {
    v1_table: "dashboard_templates",
    v1_label: "Dashboard Templates",
    v2_tables: ["dashboard_templates"],
    v2_labels: ["Dashboard Templates"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "config",
    primary_v2_table: "dashboard_templates"
  },
  {
    v1_table: "report_templates",
    v1_label: "Report Templates",
    v2_tables: ["report_templates"],
    v2_labels: ["Report Templates"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "config",
    primary_v2_table: "report_templates"
  },
  {
    v1_table: "onboarding_progress",
    v1_label: "Onboarding Progress",
    v2_tables: ["onboarding_progress"],
    v2_labels: ["Onboarding Progress"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "config",
    primary_v2_table: "onboarding_progress"
  },

  // ═══════════════════════════════════════════════════════════════
  // PIPELINE (4)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "pipeline - prospects",
    v1_label: "Pipeline Prospects",
    v2_tables: ["pipeline_prospects"],
    v2_labels: ["Pipeline Prospects"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "core",
    primary_v2_table: "pipeline_prospects"
  },
  {
    v1_table: "pipeline - stages",
    v1_label: "Pipeline Stages",
    v2_tables: ["pipeline_stages"],
    v2_labels: ["Pipeline Stages"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "core",
    primary_v2_table: "pipeline_stages"
  },
  {
    v1_table: "pipeline - prospect defaults",
    v1_label: "Pipeline Prospect Defaults",
    v2_tables: ["pipeline_prospect_defaults"],
    v2_labels: ["Pipeline Prospect Defaults"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "config",
    primary_v2_table: "pipeline_prospect_defaults"
  },
  {
    v1_table: "pipeline - stages defaults",
    v1_label: "Pipeline Stages Defaults",
    v2_tables: ["pipeline_stage_defaults"],
    v2_labels: ["Pipeline Stage Defaults"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "config",
    primary_v2_table: "pipeline_stage_defaults"
  },

  // ═══════════════════════════════════════════════════════════════
  // NOTIFICATIONS (4)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "notifications - items",
    v1_label: "Notifications Items",
    v2_tables: ["notification_items"],
    v2_labels: ["Notification Items"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "other",
    primary_v2_table: "notification_items"
  },
  {
    v1_table: "notification - default categories",
    v1_label: "Notification Default Categories",
    v2_tables: ["notification_defaults"],
    v2_labels: ["Notification Defaults"],
    type: "renamed",
    notes: "Renamed to simpler form",
    category: "config",
    primary_v2_table: "notification_defaults"
  },
  {
    v1_table: "notification - user categories",
    v1_label: "Notification User Categories",
    v2_tables: ["notification_user_prefs"],
    v2_labels: ["Notification User Prefs"],
    type: "renamed",
    notes: "Renamed to simpler form",
    category: "config",
    primary_v2_table: "notification_user_prefs"
  },

  // ═══════════════════════════════════════════════════════════════
  // CHECKLISTS (3)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "checklists",
    v1_label: "Checklists",
    v2_tables: ["checklists"],
    v2_labels: ["Checklists"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "other",
    primary_v2_table: "checklists"
  },
  {
    v1_table: "checklist items",
    v1_label: "Checklist Items",
    v2_tables: ["checklist_items"],
    v2_labels: ["Checklist Items"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "other",
    primary_v2_table: "checklist_items"
  },
  {
    v1_table: "checklist data",
    v1_label: "Checklist Data",
    v2_tables: ["checklist_data"],
    v2_labels: ["Checklist Data"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "other",
    primary_v2_table: "checklist_data"
  },

  // ═══════════════════════════════════════════════════════════════
  // STAGING TABLES (16)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "appointments - fub - onboarding - stage",
    v1_label: "FUB Appointments Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "text messages - fub - onboarding - stage",
    v1_label: "FUB Text Messages Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "contributions - rezen - daily sync - stage",
    v1_label: "Contributions Rezen Daily Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "contributions - rezen - onboarding - stage",
    v1_label: "Contributions Rezen Onboarding Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "listings - rezen - onboarding - stage",
    v1_label: "Listings Rezen Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "network downline - rezen - onboarding - stage",
    v1_label: "Network Rezen Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "transactions - rezen - onboarding - stage",
    v1_label: "Transactions Rezen Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "pending contribution - rezen - stage",
    v1_label: "Pending Contribution Rezen Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "listing - skyslope - staging",
    v1_label: "Listing SkySlope Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "transactions - skyslope - staging",
    v1_label: "Transactions SkySlope Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "dotloop_staging",
    v1_label: "DotLoop Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "lofty_staging",
    v1_label: "Lofty Staging",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Staging table not migrated",
    category: "staging"
  },
  {
    v1_table: "transaction_temp",
    v1_label: "Transaction Temp",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Temporary table not migrated",
    category: "staging"
  },
  {
    v1_table: "temp_csv_data",
    v1_label: "Temp CSV Data",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Temporary table not migrated",
    category: "staging"
  },
  {
    v1_table: "temp_table",
    v1_label: "Temp Table",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Temporary table not migrated",
    category: "staging"
  },

  // ═══════════════════════════════════════════════════════════════
  // OTHER / MISC (25+)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "bugs and feature request",
    v1_label: "Bugs Feature Requests",
    v2_tables: ["bug_reports"],
    v2_labels: ["Bug Reports"],
    type: "renamed",
    notes: "Renamed to simpler form",
    category: "other",
    primary_v2_table: "bug_reports"
  },
  {
    v1_table: "CSV_Imports",
    v1_label: "CSV Imports",
    v2_tables: ["csv_imports"],
    v2_labels: ["CSV Imports"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "other",
    primary_v2_table: "csv_imports"
  },
  {
    v1_table: "csv_mapping_templates",
    v1_label: "CSV Mapping Templates",
    v2_tables: ["csv_mapping_templates"],
    v2_labels: ["CSV Mapping Templates"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "other",
    primary_v2_table: "csv_mapping_templates"
  },
  {
    v1_table: "manual_csv_upload",
    v1_label: "Manual CSV Upload",
    v2_tables: ["manual_csv_uploads"],
    v2_labels: ["Manual CSV Uploads"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "other",
    primary_v2_table: "manual_csv_uploads"
  },
  {
    v1_table: "deduction item",
    v1_label: "Deduction Item",
    v2_tables: ["deduction_items"],
    v2_labels: ["Deduction Items"],
    type: "renamed",
    notes: "Renamed to snake_case plural",
    category: "other",
    primary_v2_table: "deduction_items"
  },
  {
    v1_table: "demo_agent_mapping",
    v1_label: "Demo Agent Mapping",
    v2_tables: ["demo_agent_mapping"],
    v2_labels: ["Demo Agent Mapping"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "other",
    primary_v2_table: "demo_agent_mapping"
  },
  {
    v1_table: "front line - stats",
    v1_label: "Front Line Stats",
    v2_tables: ["frontline_stats"],
    v2_labels: ["Frontline Stats"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "other",
    primary_v2_table: "frontline_stats"
  },
  {
    v1_table: "invitations",
    v1_label: "Invitations",
    v2_tables: ["invitations"],
    v2_labels: ["Invitations"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "other",
    primary_v2_table: "invitations"
  },
  {
    v1_table: "item",
    v1_label: "Item",
    v2_tables: ["items"],
    v2_labels: ["Items"],
    type: "renamed",
    notes: "Renamed to plural",
    category: "other",
    primary_v2_table: "items"
  },
  {
    v1_table: "leads - text messages",
    v1_label: "Leads Text Messages",
    v2_tables: ["lead_text_messages"],
    v2_labels: ["Lead Text Messages"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "other",
    primary_v2_table: "lead_text_messages"
  },
  {
    v1_table: "metrics - snapshots",
    v1_label: "Metrics Snapshots",
    v2_tables: ["metric_snapshots"],
    v2_labels: ["Metric Snapshots"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "other",
    primary_v2_table: "metric_snapshots"
  },
  {
    v1_table: "mortgages",
    v1_label: "Mortgages",
    v2_tables: ["mortgages"],
    v2_labels: ["Mortgages"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "other",
    primary_v2_table: "mortgages"
  },
  {
    v1_table: "notes",
    v1_label: "Notes",
    v2_tables: ["notes"],
    v2_labels: ["Notes"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "other",
    primary_v2_table: "notes"
  },
  {
    v1_table: "performance - agent",
    v1_label: "Performance Agent",
    v2_tables: ["agent_performance"],
    v2_labels: ["Agent Performance"],
    type: "renamed",
    notes: "Renamed to domain_metric pattern",
    category: "other",
    primary_v2_table: "agent_performance"
  },
  {
    v1_table: "raffle entries",
    v1_label: "Raffle Entries",
    v2_tables: ["raffle_entries"],
    v2_labels: ["Raffle Entries"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "other",
    primary_v2_table: "raffle_entries"
  },
  {
    v1_table: "user_reports",
    v1_label: "User Reports",
    v2_tables: ["user_reports"],
    v2_labels: ["User Reports"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "other",
    primary_v2_table: "user_reports"
  },
  {
    v1_table: "user_task_history",
    v1_label: "User Task History",
    v2_tables: ["user_task_history"],
    v2_labels: ["User Task History"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "other",
    primary_v2_table: "user_task_history"
  },
  {
    v1_table: "user - transaction - team_raw_id assignment rules",
    v1_label: "User Transaction Assignment Rules",
    v2_tables: ["transaction_assignment_rules"],
    v2_labels: ["Transaction Assignment Rules"],
    type: "renamed",
    notes: "Renamed to simpler form",
    category: "config",
    primary_v2_table: "transaction_assignment_rules"
  },
  {
    v1_table: "waitlist",
    v1_label: "Waitlist",
    v2_tables: ["waitlist"],
    v2_labels: ["Waitlist"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    category: "other",
    primary_v2_table: "waitlist"
  },
  {
    v1_table: "webhook - events",
    v1_label: "Webhook Events",
    v2_tables: ["webhook_events"],
    v2_labels: ["Webhook Events"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "other",
    primary_v2_table: "webhook_events"
  },
  {
    v1_table: "website contacts",
    v1_label: "Website Contacts",
    v2_tables: ["website_contacts"],
    v2_labels: ["Website Contacts"],
    type: "renamed",
    notes: "Renamed to snake_case",
    category: "other",
    primary_v2_table: "website_contacts"
  },
  {
    v1_table: "transaction - batch geocoding requests",
    v1_label: "Transaction Batch Geocoding",
    v2_tables: ["geocoding_batch_requests"],
    v2_labels: ["Geocoding Batch Requests"],
    type: "renamed",
    notes: "Renamed to simpler form",
    category: "other",
    primary_v2_table: "geocoding_batch_requests"
  },
  {
    v1_table: "transaction - bulk geocoding queue",
    v1_label: "Transaction Bulk Geocoding Queue",
    v2_tables: ["geocoding_queue"],
    v2_labels: ["Geocoding Queue"],
    type: "renamed",
    notes: "Renamed to simpler form",
    category: "other",
    primary_v2_table: "geocoding_queue"
  },
  {
    v1_table: "test_avatars",
    v1_label: "Test Avatars",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Test table not migrated",
    category: "other"
  },
]

// Get mapping for a specific V1 table
export function getMapping(v1TableName: string): TableMapping | undefined {
  return TABLE_MAPPINGS.find(m => m.v1_table === v1TableName)
}

// Get all mappings by type
export function getMappingsByType(type: MappingType): TableMapping[] {
  return TABLE_MAPPINGS.filter(m => m.type === type)
}

// Get mapping statistics
export function getMappingStats() {
  return {
    total: TABLE_MAPPINGS.length,
    direct: TABLE_MAPPINGS.filter(m => m.type === "direct").length,
    renamed: TABLE_MAPPINGS.filter(m => m.type === "renamed").length,
    split: TABLE_MAPPINGS.filter(m => m.type === "split").length,
    merged: TABLE_MAPPINGS.filter(m => m.type === "merged").length,
    deprecated: TABLE_MAPPINGS.filter(m => m.type === "deprecated").length,
  }
}

// Get all unique V2 tables that have V1 mappings
export function getMappedV2Tables(): string[] {
  const tables = new Set<string>()
  for (const mapping of TABLE_MAPPINGS) {
    for (const v2Table of mapping.v2_tables) {
      tables.add(v2Table)
    }
  }
  return Array.from(tables)
}

// Color coding for mapping types
export const MAPPING_TYPE_COLORS: Record<MappingType, { bg: string; text: string; border: string }> = {
  direct: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  renamed: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  split: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  merged: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  deprecated: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  new: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
}

export const MAPPING_TYPE_LABELS: Record<MappingType, string> = {
  direct: "Direct",
  renamed: "Renamed",
  split: "Split",
  merged: "Merged",
  deprecated: "Deprecated",
  new: "New in V2",
}
