"use client"

import { useEffect, useRef } from "react"
import {
  X,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  GitBranch,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ActivityLogEntry, ActivityStatus } from "@/lib/types-v2"

interface ActivityLogPanelProps {
  isOpen: boolean
  entries: ActivityLogEntry[]
  onClose: () => void
  onClear: () => void
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function StatusIcon({ status }: { status: ActivityStatus }) {
  switch (status) {
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "pending":
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const variants: Record<ActivityStatus, "default" | "secondary" | "destructive" | "outline"> = {
    running: "default",
    success: "secondary",
    error: "destructive",
    pending: "outline",
  }

  return (
    <Badge variant={variants[status]} className="text-xs uppercase">
      {status}
    </Badge>
  )
}

export function ActivityLogPanel({
  isOpen,
  entries,
  onClose,
  onClear,
}: ActivityLogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to top when new entry added
  useEffect(() => {
    if (scrollRef.current && entries.length > 0) {
      scrollRef.current.scrollTop = 0
    }
  }, [entries.length])

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Activity Log</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={entries.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Entries */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        {entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-xs mt-1">Run a task to see it here</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusIcon status={entry.status} />
                    <span className="font-medium truncate">{entry.taskName}</span>
                  </div>
                  <StatusBadge status={entry.status} />
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{entry.domain}</span>
                  <span className="font-mono">ID:{entry.taskId}</span>
                  <span>{formatTime(entry.startTime)}</span>
                  {entry.duration !== undefined && (
                    <span>{formatDuration(entry.duration)}</span>
                  )}
                </div>

                {entry.callChain && entry.callChain.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <GitBranch className="h-3 w-3" />
                    <span className="truncate">{entry.callChain[0]}</span>
                  </div>
                )}

                {entry.error && (
                  <div className="mt-2 p-2 rounded bg-destructive/10 text-destructive text-xs font-mono">
                    {entry.error}
                  </div>
                )}

                {entry.result !== undefined && entry.status === "success" && (
                  <div className="mt-2 p-2 rounded bg-muted text-xs font-mono overflow-hidden">
                    <pre className="truncate">
                      {typeof entry.result === "object"
                        ? JSON.stringify(entry.result, null, 2).slice(0, 200)
                        : String(entry.result as string | number | boolean)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer stats */}
      <div className="p-3 border-t text-xs text-muted-foreground flex items-center justify-between">
        <span>{entries.length} entries</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            {entries.filter(e => e.status === "success").length}
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            {entries.filter(e => e.status === "error").length}
          </span>
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 text-blue-500" />
            {entries.filter(e => e.status === "running").length}
          </span>
        </div>
      </div>
    </div>
  )
}
