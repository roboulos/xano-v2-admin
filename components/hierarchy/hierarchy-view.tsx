"use client"

import { useState } from "react"
import {
  Clock,
  Play,
  Loader2,
  GitBranch,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BACKGROUND_TASKS, DOMAIN_INFO } from "@/lib/task-data"
import type { BackgroundTask, TaskDomain } from "@/lib/types-v2"

interface HierarchyViewProps {
  isRunning: (taskId: number) => boolean
  onRunTask: (task: BackgroundTask) => void
}

// Group tasks by execution priority
function groupTasksByExecution(tasks: BackgroundTask[]) {
  const scheduled = tasks.filter(t => t.schedule !== null && t.active)
  const active = tasks.filter(t => t.schedule === null && t.active)
  const inactive = tasks.filter(t => !t.active)

  return { scheduled, active, inactive }
}

// Domain badge colors
const domainColors: Record<TaskDomain, string> = {
  fub: "bg-blue-500",
  rezen: "bg-green-500",
  skyslope: "bg-purple-500",
  aggregation: "bg-orange-500",
  title: "bg-yellow-500",
  ad: "bg-slate-500",
  reporting: "bg-red-500",
  metrics: "bg-cyan-500",
}

function TaskTableRow({
  task,
  isRunning,
  onRunTask,
}: {
  task: BackgroundTask
  isRunning: boolean
  onRunTask: () => void
}) {
  const isInactive = !task.active
  const hasSchedule = task.schedule !== null

  return (
    <TableRow className={isInactive ? "opacity-50 bg-muted/30" : ""}>
      {/* Run Button */}
      <TableCell className="w-[50px]">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRunTask}
          disabled={isRunning || isInactive}
          className="h-8 w-8 p-0"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </TableCell>

      {/* Status */}
      <TableCell className="w-[40px]">
        {isInactive ? (
          <XCircle className="h-5 w-5 text-red-400" />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
      </TableCell>

      {/* Task Name - FULL WIDTH, NO TRUNCATION */}
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <span className="text-sm">{task.name}</span>
          {task.callsFunction && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              <code className="bg-muted px-1 rounded text-[11px]">{task.callsFunction}</code>
            </span>
          )}
        </div>
      </TableCell>

      {/* Domain */}
      <TableCell className="w-[120px]">
        <Badge className={`${domainColors[task.domain]} text-white text-[10px]`}>
          {DOMAIN_INFO[task.domain].name}
        </Badge>
      </TableCell>

      {/* Schedule */}
      <TableCell className="w-[140px]">
        {hasSchedule ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            {task.schedule!.frequencyLabel}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Triggered</span>
        )}
      </TableCell>

      {/* ID */}
      <TableCell className="w-[70px] text-right">
        <span className="font-mono text-xs text-muted-foreground">#{task.id}</span>
      </TableCell>
    </TableRow>
  )
}

function TaskSection({
  title,
  description,
  tasks,
  isRunning,
  onRunTask,
  icon: Icon,
  color,
  defaultOpen = true,
}: {
  title: string
  description: string
  tasks: BackgroundTask[]
  isRunning: (taskId: number) => boolean
  onRunTask: (task: BackgroundTask) => void
  icon: React.ElementType
  color: string
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (tasks.length === 0) return null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className={`flex items-center justify-between p-3 rounded-t-lg cursor-pointer hover:bg-muted/50 border border-b-0 ${isOpen ? 'rounded-b-none' : 'rounded-b-lg border-b'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base flex items-center gap-2">
                {title}
                <Badge variant="secondary">{tasks.length}</Badge>
              </h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 rounded-b-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[50px]">Run</TableHead>
                <TableHead className="w-[40px]">Status</TableHead>
                <TableHead>Task Name & Function</TableHead>
                <TableHead className="w-[120px]">Domain</TableHead>
                <TableHead className="w-[140px]">Schedule</TableHead>
                <TableHead className="w-[70px] text-right">ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map(task => (
                <TaskTableRow
                  key={task.id}
                  task={task}
                  isRunning={isRunning(task.id)}
                  onRunTask={() => onRunTask(task)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function HierarchyView({ isRunning, onRunTask }: HierarchyViewProps) {
  const { scheduled, active, inactive } = groupTasksByExecution(BACKGROUND_TASKS)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Scheduled Entry Points</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{scheduled.length}</p>
          <p className="text-xs text-blue-600">These kick off everything else</p>
        </div>
        <div className="p-4 rounded-lg border bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Active Workers</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{active.length}</p>
          <p className="text-xs text-green-600">Triggered by schedulers or other tasks</p>
        </div>
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-gray-700">Inactive</span>
          </div>
          <p className="text-2xl font-bold text-gray-600">{inactive.length}</p>
          <p className="text-xs text-gray-500">Disabled tasks</p>
        </div>
      </div>

      {/* Scheduled Tasks - THE ORCHESTRATORS */}
      <TaskSection
        title="Scheduled Entry Points"
        description="These run on a schedule and orchestrate everything else"
        tasks={scheduled}
        isRunning={isRunning}
        onRunTask={onRunTask}
        icon={Clock}
        color="bg-blue-500"
        defaultOpen={true}
      />

      {/* Active Workers */}
      <TaskSection
        title="Active Workers"
        description="Triggered by schedulers or called by other tasks"
        tasks={active}
        isRunning={isRunning}
        onRunTask={onRunTask}
        icon={Zap}
        color="bg-green-500"
        defaultOpen={true}
      />

      {/* Inactive */}
      <TaskSection
        title="Inactive Tasks"
        description="These tasks are currently disabled"
        tasks={inactive}
        isRunning={isRunning}
        onRunTask={onRunTask}
        icon={XCircle}
        color="bg-gray-400"
        defaultOpen={false}
      />
    </div>
  )
}
