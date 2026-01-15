"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Clock, Pause } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaskButton } from "./task-button"
import type { BackgroundTask } from "@/lib/types-v2"

interface DomainCardProps {
  name: string
  description: string
  icon: React.ReactNode
  color: string
  tasks: BackgroundTask[]
  isRunning: (taskId: number) => boolean
  onRunTask: (task: BackgroundTask) => void
}

export function DomainCard({
  name,
  description,
  icon,
  color,
  tasks,
  isRunning,
  onRunTask,
}: DomainCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const runningCount = tasks.filter(t => isRunning(t.id)).length
  const scheduledCount = tasks.filter(t => t.schedule !== null).length
  const inactiveCount = tasks.filter(t => !t.active).length
  const activeCount = tasks.filter(t => t.active).length

  // Separate scheduled and on-demand tasks
  const scheduledTasks = tasks.filter(t => t.schedule !== null && t.active)
  const onDemandTasks = tasks.filter(t => t.schedule === null && t.active)
  const inactiveTasks = tasks.filter(t => !t.active)

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer flex flex-row items-center justify-between py-3 px-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {name}
              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>
              {runningCount > 0 && (
                <Badge variant="default" className="text-xs animate-pulse">
                  {runningCount} running
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scheduledCount > 0 && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {scheduledCount}
            </Badge>
          )}
          {inactiveCount > 0 && (
            <Badge variant="outline" className="text-xs text-muted-foreground flex items-center gap-1">
              <Pause className="h-3 w-3" />
              {inactiveCount}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-4 px-4 space-y-3">
          {/* Scheduled Tasks */}
          {scheduledTasks.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Scheduled ({scheduledTasks.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {scheduledTasks.map(task => (
                  <TaskButton
                    key={task.id}
                    task={task}
                    isRunning={isRunning(task.id)}
                    onRun={() => onRunTask(task)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* On-Demand Tasks */}
          {onDemandTasks.length > 0 && (
            <div>
              {scheduledTasks.length > 0 && (
                <p className="text-xs text-muted-foreground mb-2">
                  On-Demand ({onDemandTasks.length})
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {onDemandTasks.map(task => (
                  <TaskButton
                    key={task.id}
                    task={task}
                    isRunning={isRunning(task.id)}
                    onRun={() => onRunTask(task)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Tasks */}
          {inactiveTasks.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Pause className="h-3 w-3" />
                Inactive ({inactiveTasks.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {inactiveTasks.map(task => (
                  <TaskButton
                    key={task.id}
                    task={task}
                    isRunning={isRunning(task.id)}
                    onRun={() => onRunTask(task)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {tasks.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No background tasks in this domain
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
