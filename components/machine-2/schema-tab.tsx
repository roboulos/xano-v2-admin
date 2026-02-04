'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AlertBanner } from '@/components/ui/alert-banner'
import { ExportDropdown } from '@/components/export-dropdown'
import { formatRelativeTime } from '@/lib/utils'
import { exportSummaryToPDF } from '@/lib/exporters'
import {
  getTableMapping,
  getStrategyBadgeColor,
  getStrategyLabel,
  type DetailedTableMapping,
  type MappingStrategy,
} from '@/lib/table-mappings-detailed'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  GitCompare,
  Database,
  ArrowRight,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Columns,
  Key,
  Hash,
  Link2,
  Layers,
  GitBranch,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

type SchemaField = {
  name: string
  type: string
  required: boolean
  unique: boolean
  indexed: boolean
  reference?: string // Foreign key reference (e.g., "user.id")
}

type TableSchema = {
  id: number
  name: string
  fields: SchemaField[]
}

type ComparisonStatus = 'match' | 'missing_in_v2' | 'missing_in_v1' | 'different'

type FieldComparison = {
  fieldName: string
  v1Field: SchemaField | null
  v2Field: SchemaField | null
  status: ComparisonStatus
  differences?: string[]
}

type TableComparison = {
  tableName: string
  tableId: number
  v1FieldCount: number
  v2FieldCount: number
  comparisons: FieldComparison[]
  summary: {
    matching: number
    missingInV2: number
    missingInV1: number
    different: number
  }
}

// ============================================================================
// STATIC V1 SCHEMA DATA (Workspace 1 - Production)
// Based on actual Xano tables from CLAUDE.md
// ============================================================================

const V1_SCHEMA: TableSchema[] = [
  {
    id: 41,
    name: 'user',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      { name: 'email', type: 'text', required: true, unique: true, indexed: true },
      { name: 'password', type: 'password', required: true, unique: false, indexed: false },
      { name: 'first_name', type: 'text', required: false, unique: false, indexed: false },
      { name: 'last_name', type: 'text', required: false, unique: false, indexed: false },
      { name: 'full_name', type: 'text', required: false, unique: false, indexed: false },
      { name: 'role', type: 'enum', required: true, unique: false, indexed: true },
      { name: 'view', type: 'enum', required: false, unique: false, indexed: false },
      {
        name: 'team_id',
        type: 'int',
        required: false,
        unique: false,
        indexed: true,
        reference: 'team.id',
      },
      { name: 'agent_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'organization', type: 'text', required: false, unique: false, indexed: false },
      { name: 'is_account_admin', type: 'bool', required: false, unique: false, indexed: false },
      { name: 'is_director', type: 'bool', required: false, unique: false, indexed: false },
      { name: 'is_team_owner', type: 'bool', required: false, unique: false, indexed: false },
      { name: 'demo', type: 'text', required: false, unique: false, indexed: false },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: false },
      { name: 'updated_at', type: 'timestamp', required: false, unique: false, indexed: false },
    ],
  },
  {
    id: 36,
    name: 'agent',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      { name: 'agent_id', type: 'text', required: true, unique: true, indexed: true },
      { name: 'first_name', type: 'text', required: false, unique: false, indexed: false },
      { name: 'last_name', type: 'text', required: false, unique: false, indexed: false },
      { name: 'full_name', type: 'text', required: false, unique: false, indexed: true },
      { name: 'agent_name', type: 'text', required: false, unique: false, indexed: true },
      { name: 'email', type: 'text', required: false, unique: false, indexed: true },
      { name: 'phone', type: 'text', required: false, unique: false, indexed: false },
      {
        name: 'user_id',
        type: 'int',
        required: false,
        unique: false,
        indexed: true,
        reference: 'user.id',
      },
      { name: 'team_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'sponsor_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'status', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'join_date', type: 'date', required: false, unique: false, indexed: false },
      { name: 'anniversary_date', type: 'date', required: false, unique: false, indexed: false },
      { name: 'license_state', type: 'text', required: false, unique: false, indexed: false },
      { name: 'license_number', type: 'text', required: false, unique: false, indexed: false },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: false },
    ],
  },
  {
    id: 29,
    name: 'team',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      { name: 'team_id', type: 'text', required: true, unique: true, indexed: true },
      { name: 'name', type: 'text', required: true, unique: false, indexed: true },
      { name: 'type', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'status', type: 'enum', required: false, unique: false, indexed: true },
      {
        name: 'owner_agent_id',
        type: 'text',
        required: false,
        unique: false,
        indexed: true,
        reference: 'agent.agent_id',
      },
      { name: 'brokerage', type: 'text', required: false, unique: false, indexed: false },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: false },
    ],
  },
  {
    id: 34,
    name: 'transaction',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      { name: 'transaction_id', type: 'text', required: true, unique: true, indexed: true },
      { name: 'address', type: 'text', required: false, unique: false, indexed: false },
      { name: 'city', type: 'text', required: false, unique: false, indexed: true },
      { name: 'state', type: 'text', required: false, unique: false, indexed: true },
      { name: 'zip', type: 'text', required: false, unique: false, indexed: false },
      { name: 'price', type: 'decimal', required: false, unique: false, indexed: false },
      { name: 'close_price', type: 'decimal', required: false, unique: false, indexed: false },
      { name: 'status', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'type', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'close_date', type: 'date', required: false, unique: false, indexed: true },
      {
        name: 'team_id',
        type: 'int',
        required: false,
        unique: false,
        indexed: true,
        reference: 'team.id',
      },
      {
        name: 'transaction_owner_agent_id',
        type: 'text',
        required: false,
        unique: false,
        indexed: true,
      },
      { name: 'listing_agent_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'buying_agent_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'source', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: false },
    ],
  },
  {
    id: 40,
    name: 'listing',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      { name: 'listing_id', type: 'text', required: true, unique: true, indexed: true },
      { name: 'address', type: 'text', required: false, unique: false, indexed: false },
      { name: 'city', type: 'text', required: false, unique: false, indexed: true },
      { name: 'state', type: 'text', required: false, unique: false, indexed: true },
      { name: 'zip', type: 'text', required: false, unique: false, indexed: false },
      { name: 'price', type: 'decimal', required: false, unique: false, indexed: false },
      { name: 'status', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'type', type: 'enum', required: false, unique: false, indexed: true },
      {
        name: 'team_id',
        type: 'int',
        required: false,
        unique: false,
        indexed: true,
        reference: 'team.id',
      },
      {
        name: 'agent_id',
        type: 'text',
        required: false,
        unique: false,
        indexed: true,
        reference: 'agent.agent_id',
      },
      { name: 'list_date', type: 'date', required: false, unique: false, indexed: true },
      { name: 'expire_date', type: 'date', required: false, unique: false, indexed: false },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: false },
    ],
  },
  {
    id: 48,
    name: 'network',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      {
        name: 'user_id',
        type: 'int',
        required: true,
        unique: false,
        indexed: true,
        reference: 'user.id',
      },
      { name: 'agent_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'first_name', type: 'text', required: false, unique: false, indexed: false },
      { name: 'last_name', type: 'text', required: false, unique: false, indexed: false },
      { name: 'agent_name', type: 'text', required: false, unique: false, indexed: true },
      { name: 'downline_agent_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'downline_agent_name', type: 'text', required: false, unique: false, indexed: false },
      { name: 'sponsoring_agent_id', type: 'text', required: false, unique: false, indexed: true },
      {
        name: 'sponsoring_agent_name',
        type: 'text',
        required: false,
        unique: false,
        indexed: false,
      },
      { name: 'tier', type: 'int', required: false, unique: false, indexed: true },
      { name: 'status', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: false },
    ],
  },
]

// ============================================================================
// STATIC V2 SCHEMA DATA (Workspace 5 - New V2 Backend)
// Includes improvements and new fields for V2 architecture
// ============================================================================

const V2_SCHEMA: TableSchema[] = [
  {
    id: 41,
    name: 'user',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      { name: 'email', type: 'text', required: true, unique: true, indexed: true },
      { name: 'password', type: 'password', required: true, unique: false, indexed: false },
      { name: 'first_name', type: 'text', required: true, unique: false, indexed: false },
      { name: 'last_name', type: 'text', required: true, unique: false, indexed: false },
      { name: 'full_name', type: 'text', required: false, unique: false, indexed: true },
      { name: 'role', type: 'enum', required: true, unique: false, indexed: true },
      { name: 'view', type: 'enum', required: false, unique: false, indexed: true },
      {
        name: 'team_id',
        type: 'int',
        required: false,
        unique: false,
        indexed: true,
        reference: 'team.id',
      },
      { name: 'agent_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'organization', type: 'text', required: false, unique: false, indexed: true },
      { name: 'is_account_admin', type: 'bool', required: false, unique: false, indexed: true },
      { name: 'is_director', type: 'bool', required: false, unique: false, indexed: true },
      { name: 'is_team_owner', type: 'bool', required: false, unique: false, indexed: true },
      { name: 'demo', type: 'text', required: false, unique: false, indexed: true },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: true },
      { name: 'updated_at', type: 'timestamp', required: false, unique: false, indexed: false },
      // New V2 fields
      { name: 'avatar_url', type: 'text', required: false, unique: false, indexed: false },
      { name: 'timezone', type: 'text', required: false, unique: false, indexed: false },
      { name: 'last_login_at', type: 'timestamp', required: false, unique: false, indexed: true },
      { name: 'onboarding_complete', type: 'bool', required: false, unique: false, indexed: true },
    ],
  },
  {
    id: 36,
    name: 'agent',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      { name: 'agent_id', type: 'text', required: true, unique: true, indexed: true },
      { name: 'first_name', type: 'text', required: true, unique: false, indexed: false },
      { name: 'last_name', type: 'text', required: true, unique: false, indexed: false },
      { name: 'full_name', type: 'text', required: false, unique: false, indexed: true },
      { name: 'agent_name', type: 'text', required: false, unique: false, indexed: true },
      { name: 'email', type: 'text', required: false, unique: false, indexed: true },
      { name: 'phone', type: 'text', required: false, unique: false, indexed: false },
      {
        name: 'user_id',
        type: 'int',
        required: false,
        unique: false,
        indexed: true,
        reference: 'user.id',
      },
      { name: 'team_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'sponsor_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'status', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'join_date', type: 'date', required: false, unique: false, indexed: true },
      { name: 'anniversary_date', type: 'date', required: false, unique: false, indexed: false },
      { name: 'license_state', type: 'text', required: false, unique: false, indexed: true },
      { name: 'license_number', type: 'text', required: false, unique: false, indexed: false },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: true },
      // New V2 fields
      { name: 'profile_photo_url', type: 'text', required: false, unique: false, indexed: false },
      { name: 'bio', type: 'text', required: false, unique: false, indexed: false },
      { name: 'specialties', type: 'json', required: false, unique: false, indexed: false },
    ],
  },
  {
    id: 29,
    name: 'team',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      { name: 'team_id', type: 'text', required: true, unique: true, indexed: true },
      { name: 'name', type: 'text', required: true, unique: false, indexed: true },
      { name: 'type', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'status', type: 'enum', required: false, unique: false, indexed: true },
      {
        name: 'owner_agent_id',
        type: 'text',
        required: false,
        unique: false,
        indexed: true,
        reference: 'agent.agent_id',
      },
      { name: 'brokerage', type: 'text', required: false, unique: false, indexed: true },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: true },
      // New V2 fields
      { name: 'logo_url', type: 'text', required: false, unique: false, indexed: false },
      { name: 'website_url', type: 'text', required: false, unique: false, indexed: false },
      { name: 'description', type: 'text', required: false, unique: false, indexed: false },
      { name: 'subscription_tier', type: 'enum', required: false, unique: false, indexed: true },
    ],
  },
  {
    id: 34,
    name: 'transaction',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      { name: 'transaction_id', type: 'text', required: true, unique: true, indexed: true },
      { name: 'address', type: 'text', required: false, unique: false, indexed: true },
      { name: 'city', type: 'text', required: false, unique: false, indexed: true },
      { name: 'state', type: 'text', required: false, unique: false, indexed: true },
      { name: 'zip', type: 'text', required: false, unique: false, indexed: true },
      { name: 'price', type: 'decimal', required: false, unique: false, indexed: true },
      { name: 'close_price', type: 'decimal', required: false, unique: false, indexed: true },
      { name: 'status', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'type', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'close_date', type: 'date', required: false, unique: false, indexed: true },
      {
        name: 'team_id',
        type: 'int',
        required: false,
        unique: false,
        indexed: true,
        reference: 'team.id',
      },
      {
        name: 'transaction_owner_agent_id',
        type: 'text',
        required: false,
        unique: false,
        indexed: true,
      },
      { name: 'listing_agent_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'buying_agent_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'source', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: true },
      // New V2 fields
      {
        name: 'commission_amount',
        type: 'decimal',
        required: false,
        unique: false,
        indexed: false,
      },
      {
        name: 'commission_percent',
        type: 'decimal',
        required: false,
        unique: false,
        indexed: false,
      },
      { name: 'notes', type: 'text', required: false, unique: false, indexed: false },
    ],
  },
  {
    id: 40,
    name: 'listing',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      { name: 'listing_id', type: 'text', required: true, unique: true, indexed: true },
      { name: 'address', type: 'text', required: false, unique: false, indexed: true },
      { name: 'city', type: 'text', required: false, unique: false, indexed: true },
      { name: 'state', type: 'text', required: false, unique: false, indexed: true },
      { name: 'zip', type: 'text', required: false, unique: false, indexed: true },
      { name: 'price', type: 'decimal', required: false, unique: false, indexed: true },
      { name: 'status', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'type', type: 'enum', required: false, unique: false, indexed: true },
      {
        name: 'team_id',
        type: 'int',
        required: false,
        unique: false,
        indexed: true,
        reference: 'team.id',
      },
      {
        name: 'agent_id',
        type: 'text',
        required: false,
        unique: false,
        indexed: true,
        reference: 'agent.agent_id',
      },
      { name: 'list_date', type: 'date', required: false, unique: false, indexed: true },
      { name: 'expire_date', type: 'date', required: false, unique: false, indexed: true },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: true },
      // New V2 fields
      { name: 'bedrooms', type: 'int', required: false, unique: false, indexed: true },
      { name: 'bathrooms', type: 'decimal', required: false, unique: false, indexed: false },
      { name: 'sqft', type: 'int', required: false, unique: false, indexed: true },
      { name: 'photos', type: 'json', required: false, unique: false, indexed: false },
    ],
  },
  {
    id: 48,
    name: 'network',
    fields: [
      { name: 'id', type: 'int', required: true, unique: true, indexed: true },
      {
        name: 'user_id',
        type: 'int',
        required: true,
        unique: false,
        indexed: true,
        reference: 'user.id',
      },
      { name: 'agent_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'first_name', type: 'text', required: false, unique: false, indexed: false },
      { name: 'last_name', type: 'text', required: false, unique: false, indexed: false },
      { name: 'agent_name', type: 'text', required: false, unique: false, indexed: true },
      { name: 'downline_agent_id', type: 'text', required: false, unique: false, indexed: true },
      { name: 'downline_agent_name', type: 'text', required: false, unique: false, indexed: true },
      { name: 'sponsoring_agent_id', type: 'text', required: false, unique: false, indexed: true },
      {
        name: 'sponsoring_agent_name',
        type: 'text',
        required: false,
        unique: false,
        indexed: true,
      },
      { name: 'tier', type: 'int', required: false, unique: false, indexed: true },
      { name: 'status', type: 'enum', required: false, unique: false, indexed: true },
      { name: 'created_at', type: 'timestamp', required: true, unique: false, indexed: true },
      // New V2 fields
      {
        name: 'revenue_share_percent',
        type: 'decimal',
        required: false,
        unique: false,
        indexed: false,
      },
      { name: 'qualified', type: 'bool', required: false, unique: false, indexed: true },
    ],
  },
]

// ============================================================================
// COMPARISON LOGIC
// ============================================================================

function compareFields(
  v1Field: SchemaField | null,
  v2Field: SchemaField | null
): { status: ComparisonStatus; differences: string[] } {
  if (!v1Field && v2Field) {
    return { status: 'missing_in_v1', differences: ['New field in V2'] }
  }
  if (v1Field && !v2Field) {
    return { status: 'missing_in_v2', differences: ['Field removed in V2'] }
  }
  if (!v1Field || !v2Field) {
    return { status: 'match', differences: [] }
  }

  const differences: string[] = []

  if (v1Field.type !== v2Field.type) {
    differences.push(`Type: ${v1Field.type} → ${v2Field.type}`)
  }
  if (v1Field.required !== v2Field.required) {
    differences.push(`Required: ${v1Field.required} → ${v2Field.required}`)
  }
  if (v1Field.unique !== v2Field.unique) {
    differences.push(`Unique: ${v1Field.unique} → ${v2Field.unique}`)
  }
  if (v1Field.indexed !== v2Field.indexed) {
    differences.push(`Indexed: ${v1Field.indexed} → ${v2Field.indexed}`)
  }
  if (v1Field.reference !== v2Field.reference) {
    differences.push(`Reference: ${v1Field.reference || 'none'} → ${v2Field.reference || 'none'}`)
  }

  return {
    status: differences.length > 0 ? 'different' : 'match',
    differences,
  }
}

function compareTable(v1Table: TableSchema, v2Table: TableSchema): TableComparison {
  const v1FieldMap = new Map(v1Table.fields.map((f) => [f.name, f]))
  const v2FieldMap = new Map(v2Table.fields.map((f) => [f.name, f]))

  const allFieldNames = new Set([...v1FieldMap.keys(), ...v2FieldMap.keys()])

  const comparisons: FieldComparison[] = []
  let matching = 0
  let missingInV2 = 0
  let missingInV1 = 0
  let different = 0

  for (const fieldName of allFieldNames) {
    const v1Field = v1FieldMap.get(fieldName) || null
    const v2Field = v2FieldMap.get(fieldName) || null
    const { status, differences } = compareFields(v1Field, v2Field)

    comparisons.push({
      fieldName,
      v1Field,
      v2Field,
      status,
      differences: differences.length > 0 ? differences : undefined,
    })

    switch (status) {
      case 'match':
        matching++
        break
      case 'missing_in_v2':
        missingInV2++
        break
      case 'missing_in_v1':
        missingInV1++
        break
      case 'different':
        different++
        break
    }
  }

  // Sort: match first, then different, then missing
  comparisons.sort((a, b) => {
    const order = { match: 0, different: 1, missing_in_v2: 2, missing_in_v1: 3 }
    return order[a.status] - order[b.status]
  })

  return {
    tableName: v1Table.name,
    tableId: v1Table.id,
    v1FieldCount: v1Table.fields.length,
    v2FieldCount: v2Table.fields.length,
    comparisons,
    summary: { matching, missingInV2, missingInV1, different },
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

type FilterMode = 'all' | 'match' | 'missing' | 'different'

function getFieldTypeIcon(field: SchemaField) {
  if (field.reference) return <Link2 className="h-3 w-3" />
  if (field.unique) return <Key className="h-3 w-3" />
  if (field.indexed) return <Hash className="h-3 w-3" />
  return <Columns className="h-3 w-3" />
}

function countReferences(fields: SchemaField[]): number {
  return fields.filter((f) => f.reference).length
}

export function SchemaTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterMode>('all')
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(['user']))
  const [expandedMappings, setExpandedMappings] = useState<Set<string>>(new Set())
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Compute all table comparisons
  const tableComparisons = useMemo(() => {
    const comparisons: TableComparison[] = []
    for (const v1Table of V1_SCHEMA) {
      const v2Table = V2_SCHEMA.find((t) => t.name === v1Table.name)
      if (v2Table) {
        comparisons.push(compareTable(v1Table, v2Table))
      }
    }
    return comparisons
  }, [])

  // Filter comparisons
  const filteredComparisons = useMemo(() => {
    return tableComparisons
      .map((tc) => {
        let filteredFields = tc.comparisons

        if (searchTerm) {
          const query = searchTerm.toLowerCase()
          if (!tc.tableName.toLowerCase().includes(query)) {
            filteredFields = filteredFields.filter((f) => f.fieldName.toLowerCase().includes(query))
          }
        }

        if (statusFilter !== 'all') {
          filteredFields = filteredFields.filter((f) => {
            switch (statusFilter) {
              case 'match':
                return f.status === 'match'
              case 'missing':
                return f.status === 'missing_in_v1' || f.status === 'missing_in_v2'
              case 'different':
                return f.status === 'different'
              default:
                return true
            }
          })
        }

        return { ...tc, comparisons: filteredFields }
      })
      .filter((tc) => {
        if (searchTerm || statusFilter !== 'all') {
          if (searchTerm) {
            const query = searchTerm.toLowerCase()
            return tc.tableName.toLowerCase().includes(query) || tc.comparisons.length > 0
          }
          return tc.comparisons.length > 0
        }
        return true
      })
  }, [tableComparisons, searchTerm, statusFilter])

  // Calculate overall summary
  const overallSummary = useMemo(() => {
    return tableComparisons.reduce(
      (acc, tc) => ({
        matching: acc.matching + tc.summary.matching,
        missingInV2: acc.missingInV2 + tc.summary.missingInV2,
        missingInV1: acc.missingInV1 + tc.summary.missingInV1,
        different: acc.different + tc.summary.different,
        totalFields: acc.totalFields + tc.comparisons.length,
      }),
      { matching: 0, missingInV2: 0, missingInV1: 0, different: 0, totalFields: 0 }
    )
  }, [tableComparisons])

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev)
      if (next.has(tableName)) {
        next.delete(tableName)
      } else {
        next.add(tableName)
      }
      return next
    })
  }

  const toggleMapping = (tableName: string) => {
    setExpandedMappings((prev) => {
      const next = new Set(prev)
      if (next.has(tableName)) {
        next.delete(tableName)
      } else {
        next.add(tableName)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedTables(new Set(tableComparisons.map((tc) => tc.tableName)))
  }

  const collapseAll = () => {
    setExpandedTables(new Set())
  }

  const getStatusIcon = (status: ComparisonStatus) => {
    switch (status) {
      case 'match':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'missing_in_v1':
        return <Layers className="h-4 w-4 text-blue-500" />
      case 'missing_in_v2':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'different':
        return <XCircle className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusBadgeColor = (status: ComparisonStatus) => {
    switch (status) {
      case 'match':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'missing_in_v1':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'missing_in_v2':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'different':
        return 'bg-orange-50 text-orange-700 border-orange-200'
    }
  }

  const getStatusLabel = (status: ComparisonStatus) => {
    switch (status) {
      case 'match':
        return 'Match'
      case 'missing_in_v1':
        return 'New in V2'
      case 'missing_in_v2':
        return 'Removed'
      case 'different':
        return 'Changed'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Schema Comparison</h2>
            <p className="text-muted-foreground">
              V1 to V2 field-by-field comparison for migration planning
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {formatRelativeTime(lastUpdated)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLastUpdated(new Date())}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <GitCompare className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Schema Comparison</CardTitle>
                <p className="text-sm text-muted-foreground">
                  V1 (Workspace 1) vs V2 (Workspace 5) field-by-field comparison
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{tableComparisons.length} Tables</Badge>
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Flatten the comparison data for export
                  const exportData = filteredComparisons.flatMap((table) =>
                    table.comparisons.map((field) => ({
                      table_name: table.tableName,
                      field_name: field.fieldName,
                      v1_type: field.v1Field?.type || '',
                      v1_required: field.v1Field?.required || false,
                      v1_indexed: field.v1Field?.indexed || false,
                      v1_unique: field.v1Field?.unique || false,
                      v2_type: field.v2Field?.type || '',
                      v2_required: field.v2Field?.required || false,
                      v2_indexed: field.v2Field?.indexed || false,
                      v2_unique: field.v2Field?.unique || false,
                      status: field.status,
                      differences: field.differences?.join('; ') || '',
                    }))
                  )

                  // For PDF, create a summary report
                  const sections = [
                    {
                      title: 'Schema Comparison Summary',
                      content: [
                        `Total Fields: ${overallSummary.totalFields}`,
                        `Matching: ${overallSummary.matching}`,
                        `Changed: ${overallSummary.different}`,
                        `Removed: ${overallSummary.missingInV2}`,
                        `New in V2: ${overallSummary.missingInV1}`,
                      ],
                    },
                    {
                      title: 'Table Comparisons',
                      content: `Comparing ${tableComparisons.length} tables between V1 and V2`,
                      table: exportData.slice(0, 50), // First 50 rows for PDF
                    },
                  ]

                  exportSummaryToPDF(
                    sections,
                    `v1-v2-schema-comparison_${new Date().toISOString().slice(0, 10)}.pdf`,
                    'V1 → V2 Schema Comparison',
                    {
                      title: 'Schema Comparison',
                      timestamp: new Date(),
                      totalRecords: exportData.length,
                      filters: { search: searchTerm, statusFilter },
                    }
                  )
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <ExportDropdown
                data={filteredComparisons.flatMap((table) =>
                  table.comparisons.map((field) => ({
                    table_name: table.tableName,
                    field_name: field.fieldName,
                    v1_type: field.v1Field?.type || '',
                    v1_required: field.v1Field?.required || false,
                    v1_indexed: field.v1Field?.indexed || false,
                    v1_unique: field.v1Field?.unique || false,
                    v2_type: field.v2Field?.type || '',
                    v2_required: field.v2Field?.required || false,
                    v2_indexed: field.v2Field?.indexed || false,
                    v2_unique: field.v2Field?.unique || false,
                    status: field.status,
                    differences: field.differences?.join('; ') || '',
                  }))
                )}
                filename="v1-v2-schema-comparison"
                title="V1 → V2 Schema Comparison"
                metadata={{
                  filters: {
                    search: searchTerm || 'none',
                    statusFilter,
                  },
                }}
                disabled={filteredComparisons.length === 0}
                className="ml-2"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{overallSummary.totalFields}</div>
              <div className="text-sm text-muted-foreground">Total Fields</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-700">{overallSummary.matching}</div>
              <div className="text-sm text-green-600">Matching</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{overallSummary.different}</div>
              <div className="text-sm text-orange-600">Changed</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">{overallSummary.missingInV2}</div>
              <div className="text-sm text-amber-600">Removed</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{overallSummary.missingInV1}</div>
              <div className="text-sm text-blue-600">New in V2</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables or fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {(['all', 'match', 'different', 'missing'] as FilterMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={statusFilter === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(mode)}
                  className="capitalize"
                >
                  {mode === 'all' ? 'All' : mode}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Comparisons */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Table Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on a table to expand and see field-level comparison
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredComparisons.map((table) => {
              const isExpanded = expandedTables.has(table.tableName)
              const isMappingExpanded = expandedMappings.has(table.tableName)
              const v2RefCount = countReferences(
                table.comparisons.filter((c) => c.v2Field).map((c) => c.v2Field!)
              )
              const mapping = getTableMapping(table.tableName)

              return (
                <div key={table.tableName} className="border rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <button
                    className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                    onClick={() => toggleTable(table.tableName)}
                  >
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-muted-foreground" />
                      <span className="font-mono font-medium">{table.tableName}</span>

                      {/* Strategy Badge */}
                      {mapping && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStrategyBadgeColor(mapping.strategy)}`}
                          title={mapping.reason}
                        >
                          <span className="mr-1">{mapping.icon}</span>
                          {getStrategyLabel(mapping.strategy)}
                        </Badge>
                      )}

                      <Badge variant="outline" className="text-xs">
                        V1: {table.v1FieldCount} / V2: {table.v2FieldCount}
                      </Badge>
                      {v2RefCount > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                        >
                          <Link2 className="h-3 w-3 mr-1" />
                          {v2RefCount} FK{v2RefCount > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {table.summary.matching > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {table.summary.matching}
                          </Badge>
                        )}
                        {table.summary.different > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            {table.summary.different}
                          </Badge>
                        )}
                        {table.summary.missingInV2 > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {table.summary.missingInV2}
                          </Badge>
                        )}
                        {table.summary.missingInV1 > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <Layers className="h-3 w-3 mr-1" />
                            {table.summary.missingInV1}
                          </Badge>
                        )}
                      </div>

                      {/* View Mapping Details Button (for split tables) */}
                      {mapping && mapping.strategy === 'split' && mapping.fieldMappings && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMapping(table.tableName)
                          }}
                          className="text-xs"
                        >
                          <GitBranch className="h-3 w-3 mr-1" />
                          View Split Details
                        </Button>
                      )}

                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Mapping Details Section (for split tables) */}
                  {isMappingExpanded &&
                    mapping &&
                    mapping.strategy === 'split' &&
                    mapping.fieldMappings && (
                      <div className="border-t bg-purple-50/30 p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <GitBranch className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-purple-900 mb-1">
                              Split Mapping Details
                            </h4>
                            <p className="text-sm text-purple-700">{mapping.reason}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {mapping.v2Tables.map((v2Table) => (
                                <Badge key={v2Table} variant="outline" className="bg-white">
                                  {v2Table}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Field Mapping Tree */}
                        <div className="bg-white rounded-lg border p-4">
                          <h5 className="text-sm font-medium mb-3">Field Distribution</h5>
                          <div className="space-y-2">
                            {mapping.v2Tables.map((v2Table) => {
                              const fieldsForTable = mapping.fieldMappings!.filter(
                                (fm) => fm.v2Table === v2Table
                              )
                              if (fieldsForTable.length === 0) return null

                              return (
                                <div key={v2Table} className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Database className="h-4 w-4 text-purple-600" />
                                    <span className="font-mono font-medium text-sm">{v2Table}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {fieldsForTable.length} fields
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {fieldsForTable.map((fm) => (
                                      <div
                                        key={fm.v1Field}
                                        className="flex items-center gap-2 text-muted-foreground"
                                      >
                                        <ArrowRight className="h-3 w-3" />
                                        <span className="font-mono">{fm.v1Field}</span>
                                        {fm.v1Field !== fm.v2Field && (
                                          <span className="text-purple-600">→ {fm.v2Field}</span>
                                        )}
                                        {fm.notes && (
                                          <span className="text-amber-600" title={fm.notes}>
                                            ⓘ
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Expanded Field List */}
                  {isExpanded && (
                    <div className="border-t">
                      <table className="w-full">
                        <thead className="bg-muted/20">
                          <tr>
                            <th className="text-left px-4 py-2 text-sm font-medium">Field</th>
                            <th className="text-left px-4 py-2 text-sm font-medium">V1 Type</th>
                            <th className="text-center px-4 py-2 text-sm font-medium"></th>
                            <th className="text-left px-4 py-2 text-sm font-medium">V2 Type</th>
                            <th className="text-left px-4 py-2 text-sm font-medium">Status</th>
                            <th className="text-left px-4 py-2 text-sm font-medium">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {table.comparisons.map((field) => (
                            <tr key={field.fieldName} className="hover:bg-muted/10">
                              <td className="px-4 py-2 font-mono text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    {field.v1Field
                                      ? getFieldTypeIcon(field.v1Field)
                                      : field.v2Field
                                        ? getFieldTypeIcon(field.v2Field)
                                        : null}
                                  </span>
                                  {field.fieldName}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {field.v1Field ? (
                                  <div className="flex items-center gap-1">
                                    <code className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">
                                      {field.v1Field.type}
                                    </code>
                                    {field.v1Field.required && (
                                      <span className="text-red-500">*</span>
                                    )}
                                    {field.v1Field.indexed && (
                                      <Hash className="h-3 w-3 text-blue-500" />
                                    )}
                                    {field.v1Field.unique && (
                                      <Key className="h-3 w-3 text-purple-500" />
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <ArrowRight className="h-4 w-4 text-muted-foreground inline" />
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {field.v2Field ? (
                                  <div className="flex items-center gap-1">
                                    <code className="bg-green-50 px-2 py-0.5 rounded text-green-700">
                                      {field.v2Field.type}
                                    </code>
                                    {field.v2Field.required && (
                                      <span className="text-red-500">*</span>
                                    )}
                                    {field.v2Field.indexed && (
                                      <Hash className="h-3 w-3 text-blue-500" />
                                    )}
                                    {field.v2Field.unique && (
                                      <Key className="h-3 w-3 text-purple-500" />
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(field.status)}
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getStatusBadgeColor(field.status)}`}
                                  >
                                    {getStatusLabel(field.status)}
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-muted-foreground">
                                {field.differences?.join(', ') || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Note */}
      <AlertBanner
        variant="info"
        title="V1 to V2 Schema Migration"
        description="This comparison shows the planned field changes between Workspace 1 (V1 Production) and Workspace 5 (V2 New Backend). V2 includes additional indexed fields for performance, new required constraints, and new fields like avatar_url, timezone, and profile enhancements."
      />

      {/* Legend Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Legend:</span>
            <span className="flex items-center gap-1">
              <span className="text-red-500">*</span> Required
            </span>
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3 text-blue-500" /> Indexed
            </span>
            <span className="flex items-center gap-1">
              <Key className="h-3 w-3 text-purple-500" /> Unique
            </span>
            <span className="flex items-center gap-1">
              <Link2 className="h-3 w-3 text-green-600" /> Foreign Key
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
