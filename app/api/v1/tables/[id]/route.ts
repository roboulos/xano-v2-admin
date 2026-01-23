import { NextRequest, NextResponse } from "next/server"

// V1 Workspace Configuration
const V1_INSTANCE = "xmpx-swi5-tlvy"
const V1_WORKSPACE_ID = 1

// Static V1 schema data from schema-tab.tsx
// In production, this would come from Xano MCP
const V1_SCHEMA_MAP: Record<string, any> = {
  user: {
    id: 41,
    name: "user",
    fields: [
      { name: "id", type: "int", required: true, unique: true, indexed: true },
      { name: "email", type: "text", required: true, unique: true, indexed: true },
      { name: "password", type: "password", required: true, unique: false, indexed: false },
      { name: "first_name", type: "text", required: false, unique: false, indexed: false },
      { name: "last_name", type: "text", required: false, unique: false, indexed: false },
      { name: "full_name", type: "text", required: false, unique: false, indexed: false },
      { name: "role", type: "enum", required: true, unique: false, indexed: true },
      { name: "view", type: "enum", required: false, unique: false, indexed: false },
      { name: "team_id", type: "int", required: false, unique: false, indexed: true, reference: "team.id" },
      { name: "agent_id", type: "text", required: false, unique: false, indexed: true },
      { name: "organization", type: "text", required: false, unique: false, indexed: false },
      { name: "is_account_admin", type: "bool", required: false, unique: false, indexed: false },
      { name: "is_director", type: "bool", required: false, unique: false, indexed: false },
      { name: "is_team_owner", type: "bool", required: false, unique: false, indexed: false },
      { name: "demo", type: "text", required: false, unique: false, indexed: false },
      { name: "created_at", type: "timestamp", required: true, unique: false, indexed: false },
      { name: "updated_at", type: "timestamp", required: false, unique: false, indexed: false },
    ],
  },
  agent: {
    id: 36,
    name: "agent",
    fields: [
      { name: "id", type: "int", required: true, unique: true, indexed: true },
      { name: "agent_id", type: "text", required: true, unique: true, indexed: true },
      { name: "first_name", type: "text", required: false, unique: false, indexed: false },
      { name: "last_name", type: "text", required: false, unique: false, indexed: false },
      { name: "full_name", type: "text", required: false, unique: false, indexed: true },
      { name: "agent_name", type: "text", required: false, unique: false, indexed: true },
      { name: "email", type: "text", required: false, unique: false, indexed: true },
      { name: "phone", type: "text", required: false, unique: false, indexed: false },
      { name: "user_id", type: "int", required: false, unique: false, indexed: true, reference: "user.id" },
      { name: "team_id", type: "text", required: false, unique: false, indexed: true },
      { name: "sponsor_id", type: "text", required: false, unique: false, indexed: true },
      { name: "status", type: "enum", required: false, unique: false, indexed: true },
      { name: "join_date", type: "date", required: false, unique: false, indexed: false },
      { name: "anniversary_date", type: "date", required: false, unique: false, indexed: false },
      { name: "license_state", type: "text", required: false, unique: false, indexed: false },
      { name: "license_number", type: "text", required: false, unique: false, indexed: false },
      { name: "created_at", type: "timestamp", required: true, unique: false, indexed: false },
    ],
  },
  team: {
    id: 29,
    name: "team",
    fields: [
      { name: "id", type: "int", required: true, unique: true, indexed: true },
      { name: "team_id", type: "text", required: true, unique: true, indexed: true },
      { name: "name", type: "text", required: true, unique: false, indexed: true },
      { name: "type", type: "enum", required: false, unique: false, indexed: true },
      { name: "status", type: "enum", required: false, unique: false, indexed: true },
      { name: "owner_agent_id", type: "text", required: false, unique: false, indexed: true, reference: "agent.agent_id" },
      { name: "brokerage", type: "text", required: false, unique: false, indexed: false },
      { name: "created_at", type: "timestamp", required: true, unique: false, indexed: false },
    ],
  },
  transaction: {
    id: 34,
    name: "transaction",
    fields: [
      { name: "id", type: "int", required: true, unique: true, indexed: true },
      { name: "transaction_id", type: "text", required: true, unique: true, indexed: true },
      { name: "address", type: "text", required: false, unique: false, indexed: false },
      { name: "city", type: "text", required: false, unique: false, indexed: true },
      { name: "state", type: "text", required: false, unique: false, indexed: true },
      { name: "zip", type: "text", required: false, unique: false, indexed: false },
      { name: "price", type: "decimal", required: false, unique: false, indexed: false },
      { name: "close_price", type: "decimal", required: false, unique: false, indexed: false },
      { name: "status", type: "enum", required: false, unique: false, indexed: true },
      { name: "type", type: "enum", required: false, unique: false, indexed: true },
      { name: "close_date", type: "date", required: false, unique: false, indexed: true },
      { name: "team_id", type: "int", required: false, unique: false, indexed: true, reference: "team.id" },
      { name: "transaction_owner_agent_id", type: "text", required: false, unique: false, indexed: true },
      { name: "listing_agent_id", type: "text", required: false, unique: false, indexed: true },
      { name: "buying_agent_id", type: "text", required: false, unique: false, indexed: true },
      { name: "source", type: "enum", required: false, unique: false, indexed: true },
      { name: "created_at", type: "timestamp", required: true, unique: false, indexed: false },
    ],
  },
  listing: {
    id: 40,
    name: "listing",
    fields: [
      { name: "id", type: "int", required: true, unique: true, indexed: true },
      { name: "listing_id", type: "text", required: true, unique: true, indexed: true },
      { name: "address", type: "text", required: false, unique: false, indexed: false },
      { name: "city", type: "text", required: false, unique: false, indexed: true },
      { name: "state", type: "text", required: false, unique: false, indexed: true },
      { name: "zip", type: "text", required: false, unique: false, indexed: false },
      { name: "price", type: "decimal", required: false, unique: false, indexed: false },
      { name: "status", type: "enum", required: false, unique: false, indexed: true },
      { name: "type", type: "enum", required: false, unique: false, indexed: true },
      { name: "team_id", type: "int", required: false, unique: false, indexed: true, reference: "team.id" },
      { name: "agent_id", type: "text", required: false, unique: false, indexed: true, reference: "agent.agent_id" },
      { name: "list_date", type: "date", required: false, unique: false, indexed: true },
      { name: "expire_date", type: "date", required: false, unique: false, indexed: false },
      { name: "created_at", type: "timestamp", required: true, unique: false, indexed: false },
    ],
  },
  network: {
    id: 48,
    name: "network",
    fields: [
      { name: "id", type: "int", required: true, unique: true, indexed: true },
      { name: "user_id", type: "int", required: true, unique: false, indexed: true, reference: "user.id" },
      { name: "agent_id", type: "text", required: false, unique: false, indexed: true },
      { name: "first_name", type: "text", required: false, unique: false, indexed: false },
      { name: "last_name", type: "text", required: false, unique: false, indexed: false },
      { name: "agent_name", type: "text", required: false, unique: false, indexed: true },
      { name: "downline_agent_id", type: "text", required: false, unique: false, indexed: true },
      { name: "downline_agent_name", type: "text", required: false, unique: false, indexed: false },
      { name: "sponsoring_agent_id", type: "text", required: false, unique: false, indexed: true },
      { name: "sponsoring_agent_name", type: "text", required: false, unique: false, indexed: false },
      { name: "tier", type: "int", required: false, unique: false, indexed: true },
      { name: "status", type: "enum", required: false, unique: false, indexed: true },
      { name: "created_at", type: "timestamp", required: true, unique: false, indexed: false },
    ],
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to find schema by name first, then by ID
    let schema = V1_SCHEMA_MAP[id]

    if (!schema) {
      // Try to find by ID
      schema = Object.values(V1_SCHEMA_MAP).find((s) => s.id === parseInt(id))
    }

    if (!schema) {
      return NextResponse.json(
        { error: "Table not found in V1 workspace" },
        { status: 404 }
      )
    }

    return NextResponse.json(schema)
  } catch (error) {
    console.error("Error fetching V1 table schema:", error)
    return NextResponse.json(
      { error: "Failed to fetch V1 table schema" },
      { status: 500 }
    )
  }
}
