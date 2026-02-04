'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle2, Database } from 'lucide-react'
import {
  getDataGaps,
  getEndpointGaps,
  getSchemaMismatches,
  getDataIntegrityIssues,
  getGapSummary,
  type DataGap,
  type EndpointGap,
  type SchemaMismatch,
  type DataIntegrityIssue,
} from '@/lib/gap-detection'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SeverityBadge } from '@/components/ui/severity-badge'
import { SimpleStatusBadge } from '@/components/ui/status-badge'

type GapTab = 'data' | 'endpoints' | 'schema' | 'integrity'

function DataGapCard({ gap }: { gap: DataGap }) {
  return (
    <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{gap.table}</h4>
          <p className="text-sm text-muted-foreground mt-1">{gap.description}</p>
        </div>
        <SeverityBadge severity={gap.severity} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">Affected Records</div>
          <div className="font-semibold text-foreground">
            {gap.affectedRecords.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Type</div>
          <div className="font-semibold text-foreground capitalize">
            {gap.type.replace('-', ' ')}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Resolution</div>
          <SimpleStatusBadge status={gap.resolutionStatus} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Last checked: {gap.lastChecked.toLocaleDateString()}</span>
        {gap.owner && <span>Owner: {gap.owner}</span>}
      </div>
    </div>
  )
}

function EndpointGapCard({ gap }: { gap: EndpointGap }) {
  const completionPercent = (gap.implementedParams.length / gap.expectedParams.length) * 100

  return (
    <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{gap.name}</h4>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {gap.method} {gap.path}
          </p>
        </div>
        <SeverityBadge severity={gap.priority} />
      </div>

      <div className="space-y-2 mb-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Parameter Coverage</span>
            <span className="font-semibold">{Math.round(completionPercent)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {gap.missingParams.length > 0 && (
          <div className="text-xs">
            <span className="text-muted-foreground">Missing:</span>
            <span className="text-orange-600 font-mono ml-1">{gap.missingParams.join(', ')}</span>
          </div>
        )}
      </div>

      {gap.responseContract && !gap.responseContract.matches && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3 text-xs">
          <p className="text-red-800 font-semibold">Response contract mismatch</p>
          <p className="text-red-700 text-xs">Expected vs actual response structure differs</p>
        </div>
      )}

      <SimpleStatusBadge status={gap.status} />
    </div>
  )
}

function SchemaMismatchCard({ mismatch }: { mismatch: SchemaMismatch }) {
  return (
    <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">
            {mismatch.table}.{mismatch.field}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">{mismatch.impact}</p>
        </div>
        <SeverityBadge severity={mismatch.severity} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <div className="text-muted-foreground text-xs font-semibold">V1 Type</div>
          <div className="font-mono text-xs text-foreground">{mismatch.v1Type}</div>
          {mismatch.v1Constraints.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {mismatch.v1Constraints.join(', ')}
            </div>
          )}
        </div>
        <div>
          <div className="text-muted-foreground text-xs font-semibold">V2 Type</div>
          <div className="font-mono text-xs text-foreground">{mismatch.v2Type}</div>
          {mismatch.v2Constraints.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {mismatch.v2Constraints.join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
        <p className="font-semibold text-blue-900">Resolution Approach</p>
        <p className="text-blue-800 mt-1">{mismatch.resolutionApproach}</p>
      </div>
    </div>
  )
}

function IntegrityIssueCard({ issue }: { issue: DataIntegrityIssue }) {
  const iconMap: Record<string, React.ReactNode> = {
    'null-values': <AlertCircle className="h-4 w-4" />,
    'referential-integrity': <Database className="h-4 w-4" />,
    uniqueness: <CheckCircle2 className="h-4 w-4" />,
    'range-validation': <AlertTriangle className="h-4 w-4" />,
  }

  return (
    <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-muted-foreground mt-1">{iconMap[issue.checkType]}</div>
          <div>
            <h4 className="font-semibold text-foreground">{issue.issue}</h4>
            <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
          </div>
        </div>
        <SeverityBadge severity={issue.severity} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">Table</div>
          <div className="font-semibold text-foreground">{issue.affectedTable}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Affected Records</div>
          <div className="font-semibold text-foreground">{issue.recordCount.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
        <p className="font-semibold text-amber-900">Recommended Resolution</p>
        <p className="text-amber-800 mt-1">{issue.resolution}</p>
      </div>
    </div>
  )
}

export function GapsTab() {
  const [activeTab, setActiveTab] = useState<GapTab>('data')
  const summary = useMemo(() => getGapSummary(), [])

  const dataGaps = useMemo(() => getDataGaps(), [])
  const endpointGaps = useMemo(() => getEndpointGaps(), [])
  const schemaMismatches = useMemo(() => getSchemaMismatches(), [])
  const integrityIssues = useMemo(() => getDataIntegrityIssues(), [])

  const criticalCount =
    summary.dataGapsCritical +
    summary.endpointGapsCritical +
    summary.schemaMismatchesCritical +
    summary.integrityIssuesCritical

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Gap Identification Tool</h2>
          <p className="text-muted-foreground">
            Identifies data gaps, incomplete endpoints, schema mismatches, and integrity issues
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card className={`p-3 ${criticalCount > 0 ? 'border-red-200 bg-red-50' : ''}`}>
            <div className="text-xs text-muted-foreground font-semibold">Critical Issues</div>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground font-semibold">Data Gaps</div>
            <div className="text-2xl font-bold text-orange-600">{summary.dataGapsTotal}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground font-semibold">Affected Records</div>
            <div className="text-2xl font-bold text-purple-600">
              {(summary.affectedRecordsTotal / 1000).toFixed(0)}k
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground font-semibold">Endpoint Gaps</div>
            <div className="text-2xl font-bold text-blue-600">{summary.endpointGapsTotal}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground font-semibold">Schema Issues</div>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.schemaMismatchesTotal}
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GapTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data">
            Data Gaps
            {summary.dataGapsCritical > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {summary.dataGapsCritical}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="endpoints">
            Endpoints
            {summary.endpointGapsCritical > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {summary.endpointGapsCritical}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="schema">Schema Mismatches</TabsTrigger>
          <TabsTrigger value="integrity">
            Data Integrity
            {summary.integrityIssuesCritical > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {summary.integrityIssuesCritical}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Data Gaps Tab */}
        <TabsContent value="data" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataGaps.length > 0 ? (
              dataGaps.map((gap) => <DataGapCard key={gap.id} gap={gap} />)
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No data gaps identified
              </div>
            )}
          </div>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endpointGaps.length > 0 ? (
              endpointGaps.map((gap) => <EndpointGapCard key={gap.id} gap={gap} />)
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No endpoint gaps identified
              </div>
            )}
          </div>
        </TabsContent>

        {/* Schema Tab */}
        <TabsContent value="schema" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemaMismatches.length > 0 ? (
              schemaMismatches.map((mismatch) => (
                <SchemaMismatchCard key={mismatch.id} mismatch={mismatch} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No schema mismatches identified
              </div>
            )}
          </div>
        </TabsContent>

        {/* Integrity Tab */}
        <TabsContent value="integrity" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrityIssues.length > 0 ? (
              integrityIssues.map((issue) => <IntegrityIssueCard key={issue.id} issue={issue} />)
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No integrity issues identified
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground">Export Gap Report</h4>
            <p className="text-sm text-muted-foreground">
              Generate a comprehensive gap analysis report for stakeholders
            </p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            Export Report
          </button>
        </div>
      </Card>
    </div>
  )
}
