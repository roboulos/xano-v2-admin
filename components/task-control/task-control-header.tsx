"use client"

import { Search, History, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TaskControlHeaderProps {
  runningCount: number
  errorCount: number
  onOpenSearch: () => void
  onToggleActivityLog: () => void
  activityLogOpen: boolean
}

export function TaskControlHeader({
  runningCount,
  errorCount,
  onOpenSearch,
  onToggleActivityLog,
  activityLogOpen,
}: TaskControlHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">V2 Task Control Center</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Trigger background tasks and monitor execution
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Status badges */}
        {runningCount > 0 && (
          <Badge variant="default" className="flex items-center gap-1.5 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            {runningCount} running
          </Badge>
        )}
        {errorCount > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" />
            {errorCount} errors
          </Badge>
        )}

        {/* Search button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">Cmd</span>K
          </kbd>
        </Button>

        {/* Activity log toggle */}
        <Button
          variant={activityLogOpen ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleActivityLog}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Activity</span>
        </Button>
      </div>
    </div>
  )
}
