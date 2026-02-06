'use client'

import { useState, useCallback } from 'react'
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Database,
  Package,
  Table2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import {
  MIGRATION_BATCHES,
  TOTAL_BATCH_TABLES,
  TOTAL_EXPECTED_RECORDS,
  type MigrationBatch,
} from '@/lib/bulk-migration-batches'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BatchStatus = 'idle' | 'running' | 'success' | 'error'

interface BatchState {
  status: BatchStatus
  message: string | null
  result: Record<string, unknown> | null
  durationMs: number | null
}

const INITIAL: BatchState = {
  status: 'idle',
  message: null,
  result: null,
  durationMs: null,
}

// ---------------------------------------------------------------------------
// BatchCard
// ---------------------------------------------------------------------------

function BatchCard({
  batch,
  state,
  onRun,
  disabled,
}: {
  batch: MigrationBatch
  state: BatchState
  onRun: () => void
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const totalRecords = batch.tables.reduce((s, t) => s + t.expectedCount, 0)

  const statusColor: Record<BatchStatus, string> = {
    idle: 'bg-muted text-muted-foreground',
    running: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
    success: 'bg-green-500/15 text-green-700 dark:text-green-400',
    error: 'bg-red-500/15 text-red-700 dark:text-red-400',
  }

  const statusLabel: Record<BatchStatus, string> = {
    idle: 'Idle',
    running: 'Running...',
    success: 'Complete',
    error: 'Error',
  }

  // Extract per-table V1/V2 counts from the Xano result
  const tableCounts: { name: string; v1: number | null; v2: number | null }[] = batch.tables.map(
    (t) => {
      if (!state.result) return { name: t.name, v1: null, v2: null }
      const v1Key = `${t.name}_v1`
      const v2Key = `${t.name}_v2`
      const v1 = typeof state.result[v1Key] === 'number' ? (state.result[v1Key] as number) : null
      const v2 = typeof state.result[v2Key] === 'number' ? (state.result[v2Key] as number) : null
      return { name: t.name, v1, v2 }
    }
  )

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        className={cn(
          'transition-colors',
          state.status === 'error' && 'border-red-500/30',
          state.status === 'success' && 'border-green-500/30'
        )}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {open ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">Batch {batch.id}</span>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {batch.tables.length} tables
                  </Badge>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {fmt(totalRecords)} records
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn('text-[10px]', statusColor[state.status])}>
                  {state.status === 'running' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {state.status === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {state.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {statusLabel[state.status]}
                </Badge>
                {state.durationMs !== null && (
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {(state.durationMs / 1000).toFixed(1)}s
                  </span>
                )}
                <Button
                  size="sm"
                  variant={state.status === 'idle' ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  disabled={disabled || state.status === 'running'}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRun()
                  }}
                >
                  {state.status === 'running' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  <span className="ml-1">Run</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            {/* Table list */}
            <div className="rounded-md border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-3 py-1.5 font-medium">Table</th>
                    <th className="text-right px-3 py-1.5 font-medium">Expected</th>
                    {state.result && (
                      <>
                        <th className="text-right px-3 py-1.5 font-medium">V1</th>
                        <th className="text-right px-3 py-1.5 font-medium">V2</th>
                        <th className="text-center px-3 py-1.5 font-medium">Match</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tableCounts.map((t) => {
                    const match = t.v1 !== null && t.v2 !== null && t.v1 === t.v2
                    return (
                      <tr key={t.name} className="border-b last:border-0">
                        <td className="px-3 py-1.5 font-mono">{t.name}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                          {fmt(batch.tables.find((bt) => bt.name === t.name)?.expectedCount ?? 0)}
                        </td>
                        {state.result && (
                          <>
                            <td className="px-3 py-1.5 text-right tabular-nums">
                              {t.v1 !== null ? fmt(t.v1) : '-'}
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums">
                              {t.v2 !== null ? fmt(t.v2) : '-'}
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              {match ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 inline" />
                              ) : t.v1 !== null ? (
                                <AlertCircle className="h-3.5 w-3.5 text-red-500 inline" />
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Error message */}
            {state.status === 'error' && state.message && (
              <div className="mt-3 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-700 dark:text-red-400">
                {state.message}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ---------------------------------------------------------------------------
// BulkMigrationTab
// ---------------------------------------------------------------------------

export function BulkMigrationTab() {
  const [batchStates, setBatchStates] = useState<Record<number, BatchState>>({})
  const [runAllInProgress, setRunAllInProgress] = useState(false)

  const getBatchState = (batchId: number) => batchStates[batchId] ?? INITIAL

  const setBatchState = useCallback((batchId: number, state: BatchState) => {
    setBatchStates((prev) => ({ ...prev, [batchId]: state }))
  }, [])

  const runBatch = useCallback(
    async (batch: MigrationBatch) => {
      const startedAt = Date.now()
      setBatchState(batch.id, {
        status: 'running',
        message: 'Copying records...',
        result: null,
        durationMs: null,
      })
      try {
        const res = await fetch('/api/bulk-migration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batchSlug: batch.slug }),
        })
        const data = await res.json()
        const durationMs = Date.now() - startedAt
        if (!res.ok || !data.success) {
          setBatchState(batch.id, {
            status: 'error',
            message: data.error ?? `HTTP ${res.status}`,
            result: data.result ?? null,
            durationMs,
          })
          return false
        }
        setBatchState(batch.id, {
          status: 'success',
          message: 'Complete',
          result: data.result ?? null,
          durationMs,
        })
        return true
      } catch (err) {
        setBatchState(batch.id, {
          status: 'error',
          message: err instanceof Error ? err.message : 'Network error',
          result: null,
          durationMs: Date.now() - startedAt,
        })
        return false
      }
    },
    [setBatchState]
  )

  const runAll = useCallback(async () => {
    setRunAllInProgress(true)
    for (const batch of MIGRATION_BATCHES) {
      const ok = await runBatch(batch)
      if (!ok) break
    }
    setRunAllInProgress(false)
  }, [runBatch])

  // Computed stats
  const completedBatches = MIGRATION_BATCHES.filter(
    (b) => getBatchState(b.id).status === 'success'
  ).length
  const errorBatches = MIGRATION_BATCHES.filter(
    (b) => getBatchState(b.id).status === 'error'
  ).length
  const overallProgress = Math.round((completedBatches / MIGRATION_BATCHES.length) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Bulk Migration</h2>
            <p className="text-sm text-muted-foreground">
              12 batch endpoints &mdash; copy remaining V1 tables to V2 via cross-workspace SQL
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={runAllInProgress} size="sm">
              {runAllInProgress ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run All Batches
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Run All 12 Batch Copies?</AlertDialogTitle>
              <AlertDialogDescription>
                This will DELETE then INSERT {fmt(TOTAL_EXPECTED_RECORDS)} records across{' '}
                {TOTAL_BATCH_TABLES} tables from V1 to V2. Existing V2 data in these tables will be
                replaced. Batches run sequentially and stop on first error.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={runAll}>Run All</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Summary hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Table2 className="h-4 w-4" />
              Tables Covered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{TOTAL_BATCH_TABLES}</div>
            <p className="text-xs text-muted-foreground mt-1">across 12 batch endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Expected Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{fmt(TOTAL_EXPECTED_RECORDS)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              V1 record count at time of creation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Batch Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {completedBatches} / {MIGRATION_BATCHES.length}
              {errorBatches > 0 && (
                <span className="text-sm font-normal text-red-500 ml-2">
                  ({errorBatches} errors)
                </span>
              )}
            </div>
            <Progress value={overallProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Batch cards */}
      <div className="space-y-2">
        {MIGRATION_BATCHES.map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            state={getBatchState(batch.id)}
            onRun={() => runBatch(batch)}
            disabled={runAllInProgress && getBatchState(batch.id).status !== 'running'}
          />
        ))}
      </div>
    </div>
  )
}
