'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CodeBlock } from '@/components/ui/code-block'
import { Diagram } from '@/components/ui/diagram'
import { ChevronDown, ChevronUp, Database } from 'lucide-react'

// Sample core tables (representing the 193 total tables)
const CORE_TABLES = [
  {
    id: 1,
    name: 'users',
    description: 'User accounts and profiles',
    record_count: '150,000+',
    fields: [
      {
        name: 'id',
        type: 'number',
        required: true,
        unique: true,
        indexed: true,
        description: 'Primary key',
      },
      {
        name: 'email',
        type: 'text',
        required: true,
        unique: true,
        indexed: true,
        description: 'Email address',
      },
      { name: 'name', type: 'text', required: true, description: 'Full name' },
      { name: 'password_hash', type: 'text', required: true, description: 'Hashed password' },
      {
        name: 'created_at',
        type: 'datetime',
        required: true,
        indexed: true,
        description: 'Account creation time',
      },
      { name: 'updated_at', type: 'datetime', required: true, description: 'Last update time' },
    ],
    relationships: [],
    indexes: [
      { name: 'idx_users_email', fields: ['email'] },
      { name: 'idx_users_created_at', fields: ['created_at'] },
    ],
    tags: ['core', 'auth'],
    migration_notes: 'V1→V2: Same table, enhanced security with password hashing',
  },
  {
    id: 2,
    name: 'teams',
    description: 'Team/organization records',
    record_count: '50,000+',
    fields: [
      { name: 'id', type: 'number', required: true, unique: true, description: 'Primary key' },
      { name: 'name', type: 'text', required: true, indexed: true, description: 'Team name' },
      {
        name: 'owner_id',
        type: 'number',
        required: true,
        indexed: true,
        description: 'Owner user ID (FK)',
      },
      { name: 'description', type: 'text', required: false, description: 'Team description' },
      { name: 'created_at', type: 'datetime', required: true, description: 'Creation timestamp' },
    ],
    relationships: [
      {
        field: 'owner_id',
        referenced_table: 'users',
        referenced_field: 'id',
        cascade_delete: false,
        type: 'one-to-many',
      },
    ],
    indexes: [{ name: 'idx_teams_owner_id', fields: ['owner_id'] }],
    tags: ['core', 'teams'],
  },
  {
    id: 3,
    name: 'team_members',
    description: 'Team membership records',
    record_count: '200,000+',
    fields: [
      { name: 'id', type: 'number', required: true, unique: true, description: 'Primary key' },
      {
        name: 'team_id',
        type: 'number',
        required: true,
        indexed: true,
        description: 'Team ID (FK)',
      },
      {
        name: 'user_id',
        type: 'number',
        required: true,
        indexed: true,
        description: 'User ID (FK)',
      },
      { name: 'role', type: 'text', required: true, description: 'Role: admin, manager, member' },
      { name: 'joined_at', type: 'datetime', required: true, description: 'Join timestamp' },
    ],
    relationships: [
      {
        field: 'team_id',
        referenced_table: 'teams',
        referenced_field: 'id',
        cascade_delete: true,
        type: 'many-to-one',
      },
      {
        field: 'user_id',
        referenced_table: 'users',
        referenced_field: 'id',
        cascade_delete: false,
        type: 'many-to-one',
      },
    ],
    tags: ['core', 'teams', 'members'],
  },
  {
    id: 4,
    name: 'transactions',
    description: 'Financial transaction records',
    record_count: '5,000,000+',
    fields: [
      {
        name: 'id',
        type: 'number',
        required: true,
        unique: true,
        indexed: true,
        description: 'Primary key',
      },
      {
        name: 'team_id',
        type: 'number',
        required: true,
        indexed: true,
        description: 'Team ID (FK)',
      },
      {
        name: 'amount',
        type: 'number',
        required: true,
        indexed: true,
        description: 'Transaction amount',
      },
      {
        name: 'type',
        type: 'text',
        required: true,
        indexed: true,
        description: 'Type: income, expense, transfer',
      },
      {
        name: 'status',
        type: 'text',
        required: true,
        indexed: true,
        description: 'Status: pending, completed, failed',
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        description: 'Transaction description',
      },
      {
        name: 'created_at',
        type: 'datetime',
        required: true,
        indexed: true,
        description: 'Creation timestamp',
      },
    ],
    relationships: [
      {
        field: 'team_id',
        referenced_table: 'teams',
        referenced_field: 'id',
        cascade_delete: false,
        type: 'many-to-one',
      },
    ],
    indexes: [
      { name: 'idx_transactions_team_id_created_at', fields: ['team_id', 'created_at'] },
      { name: 'idx_transactions_status', fields: ['status'] },
    ],
    tags: ['financials', 'transactions'],
    migration_notes: 'V2 only: New table for enhanced transaction tracking',
  },
]

function TableDetailView({ table, isOpen, onToggle }: any) {
  const tsInterface = `interface ${table.name.charAt(0).toUpperCase() + table.name.slice(1)} {
  ${table.fields.map((f: any) => `${f.name}: ${f.type === 'text' ? 'string' : f.type === 'number' ? 'number' : f.type === 'datetime' ? 'Date' : 'any'}${f.required ? '' : ' | null'}`).join('\n  ')}
}`

  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            <p className="font-semibold">{table.name}</p>
            <Badge variant="secondary" className="text-xs">
              {table.record_count} records
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{table.description}</p>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 py-4 border-t space-y-4 bg-muted/20">
          {/* Fields Table */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              FIELDS ({table.fields.length})
            </p>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left px-2 py-2 font-semibold">Name</th>
                    <th className="text-left px-2 py-2 font-semibold">Type</th>
                    <th className="text-center px-2 py-2 font-semibold">Required</th>
                    <th className="text-center px-2 py-2 font-semibold">Unique</th>
                    <th className="text-left px-2 py-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {table.fields.map((field: any) => (
                    <tr key={field.name} className="border-b hover:bg-background/50">
                      <td className="px-2 py-2 font-mono text-xs">{field.name}</td>
                      <td className="px-2 py-2">
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 text-center">
                        {field.required ? <span className="text-green-600 font-bold">✓</span> : '-'}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {field.unique ? <span className="text-blue-600 font-bold">✓</span> : '-'}
                      </td>
                      <td className="px-2 py-2 text-xs text-muted-foreground">
                        {field.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Relationships */}
          {table.relationships.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                RELATIONSHIPS ({table.relationships.length})
              </p>
              <div className="space-y-2">
                {table.relationships.map((rel: any, idx: number) => (
                  <div key={idx} className="p-2 bg-background rounded border text-sm">
                    <p className="font-semibold">
                      {rel.field} → {rel.referenced_table}.{rel.referenced_field}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {rel.type}
                      </Badge>
                      {rel.cascade_delete && (
                        <Badge variant="destructive" className="text-xs">
                          cascade delete
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TypeScript Interface */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">TYPESCRIPT INTERFACE</p>
            <CodeBlock code={tsInterface} language="typescript" />
          </div>

          {/* Tags */}
          {table.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">TAGS</p>
              <div className="flex flex-wrap gap-2">
                {table.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Migration Notes */}
          {table.migration_notes && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs font-semibold text-blue-900 mb-1">V1 → V2 MIGRATION</p>
              <p className="text-xs text-blue-800">{table.migration_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function DataModelTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTable, setExpandedTable] = useState<number | null>(null)

  const filteredTables = useMemo(() => {
    if (!searchQuery) return CORE_TABLES

    const query = searchQuery.toLowerCase()
    return CORE_TABLES.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.fields.some((f) => f.name.toLowerCase().includes(query)) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  }, [searchQuery])

  const erDiagram = `erDiagram
    USERS ||--o{ TEAMS : owns
    USERS ||--o{ TEAM_MEMBERS : joins
    TEAMS ||--o{ TEAM_MEMBERS : has
    TEAMS ||--o{ TRANSACTIONS : records

    USERS {
        number id PK
        string email UK
        string name
        datetime created_at
    }

    TEAMS {
        number id PK
        string name
        number owner_id FK
        datetime created_at
    }

    TEAM_MEMBERS {
        number id PK
        number team_id FK
        number user_id FK
        string role
        datetime joined_at
    }

    TRANSACTIONS {
        number id PK
        number team_id FK
        number amount
        string type
        string status
        datetime created_at
    }
`

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Data Model Search</CardTitle>
          <CardDescription>Search tables by name, field, or tag</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-3">
            Found {filteredTables.length} table{filteredTables.length !== 1 ? 's' : ''} (Total: 193
            tables in V2)
          </p>
        </CardContent>
      </Card>

      {/* ER Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Entity Relationship Diagram</CardTitle>
          <CardDescription>
            Shows core table relationships (sample of 193 total tables)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Diagram mermaidCode={erDiagram} />
        </CardContent>
      </Card>

      {/* Tables Tab */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Tables</TabsTrigger>
          <TabsTrigger value="core">Core Tables</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {filteredTables.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  No tables found matching your search
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTables.map((table: any) => (
              <TableDetailView
                key={table.id}
                table={table}
                isOpen={expandedTable === table.id}
                onToggle={() => setExpandedTable(expandedTable === table.id ? null : table.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="core" className="space-y-3 mt-4">
          {CORE_TABLES.map((table: any) => (
            <TableDetailView
              key={table.id}
              table={table}
              isOpen={expandedTable === table.id}
              onToggle={() => setExpandedTable(expandedTable === table.id ? null : table.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 border rounded">
                  <p className="text-xs font-semibold text-muted-foreground">Total Tables</p>
                  <p className="text-lg font-bold mt-2">193</p>
                </div>
                <div className="p-3 border rounded">
                  <p className="text-xs font-semibold text-muted-foreground">Core Tables</p>
                  <p className="text-lg font-bold mt-2">{CORE_TABLES.length}</p>
                </div>
                <div className="p-3 border rounded">
                  <p className="text-xs font-semibold text-muted-foreground">Total Records</p>
                  <p className="text-lg font-bold mt-2">5M+</p>
                </div>
                <div className="p-3 border rounded">
                  <p className="text-xs font-semibold text-muted-foreground">Relationships</p>
                  <p className="text-lg font-bold mt-2">400+</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-blue-50">
                <p className="font-semibold text-sm mb-2">About V2 Data Model</p>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  <li>193 fully normalized tables</li>
                  <li>Complex relationship structure with proper foreign keys</li>
                  <li>Comprehensive indexes for performance</li>
                  <li>Audit trails and timestamps on core tables</li>
                  <li>V1 data fully migrated with validation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
