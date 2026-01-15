"use client"

import { Loader2, Play, Clock, Pause, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { BackgroundTask } from "@/lib/types-v2"

interface TaskButtonProps {
  task: BackgroundTask
  isRunning: boolean
  onRun: () => void
  size?: "sm" | "default"
}

export function TaskButton({ task, isRunning, onRun, size = "sm" }: TaskButtonProps) {
  const hasSchedule = task.schedule !== null
  const isInactive = !task.active

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isInactive ? "ghost" : "outline"}
            size={size}
            onClick={onRun}
            disabled={isRunning || isInactive}
            className={`flex items-center gap-2 ${isInactive ? "opacity-50" : ""}`}
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : hasSchedule ? (
              <Clock className="h-3.5 w-3.5 text-blue-500" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            <span className="truncate max-w-[150px]">{task.name.replace(/ V3$/, "").replace(/^(FUB|reZEN|SkySlope|AD|Title|Aggregation|Reporting|Metrics) - /, "")}</span>
            {hasSchedule && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                {task.schedule!.frequencyLabel}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-1">
            <p className="font-semibold">{task.name}</p>
            <p className="text-xs text-muted-foreground">
              Task ID: <span className="font-mono">{task.id}</span>
            </p>
            {task.callsFunction && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                {task.callsFunction}
              </p>
            )}
            {task.schedule && (
              <p className="text-xs text-muted-foreground">
                Schedule: {task.schedule.frequencyLabel} (starting {task.schedule.startsOn})
              </p>
            )}
            {isInactive && (
              <p className="text-xs text-orange-500 flex items-center gap-1">
                <Pause className="h-3 w-3" />
                This task is inactive
              </p>
            )}
            {task.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-1">
                {task.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
