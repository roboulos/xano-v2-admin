"use client"

import { useCallback, useState } from "react"
import type { BackgroundTask, ActivityLogEntry } from "@/lib/types-v2"
import { runBackgroundTask } from "@/lib/api-v2"

interface UseTaskRunnerOptions {
  addEntry: (entry: Omit<ActivityLogEntry, "id">) => string
  updateEntry: (id: string, updates: Partial<ActivityLogEntry>) => void
  open: () => void
}

interface UseTaskRunnerReturn {
  run: (task: BackgroundTask) => Promise<void>
  runningTasks: Set<number>
  isRunning: (taskId: number) => boolean
}

export function useTaskRunner({
  addEntry,
  updateEntry,
  open,
}: UseTaskRunnerOptions): UseTaskRunnerReturn {
  const [runningTasks, setRunningTasks] = useState<Set<number>>(new Set())

  const isRunning = useCallback((taskId: number) => runningTasks.has(taskId), [runningTasks])

  const run = useCallback(
    async (task: BackgroundTask) => {
      // Prevent duplicate runs
      if (runningTasks.has(task.id)) return

      // Add to running set
      setRunningTasks(prev => new Set(prev).add(task.id))

      // Create activity log entry
      const entryId = addEntry({
        taskId: task.id,
        taskName: task.name,
        domain: task.domain,
        status: "running",
        startTime: Date.now(),
        callChain: task.callsFunction ? [task.callsFunction] : undefined,
      })

      // Open the activity log panel
      open()

      try {
        // Execute the background task by ID
        const result = await runBackgroundTask(task.id)

        // Update entry with result
        updateEntry(entryId, {
          status: result.success ? "success" : "error",
          endTime: result.endTime,
          duration: result.duration,
          result: result.data,
          error: result.error,
        })
      } catch (error) {
        // Handle unexpected errors
        const endTime = Date.now()
        updateEntry(entryId, {
          status: "error",
          endTime,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      } finally {
        // Remove from running set
        setRunningTasks(prev => {
          const next = new Set(prev)
          next.delete(task.id)
          return next
        })
      }
    },
    [runningTasks, addEntry, updateEntry, open]
  )

  return {
    run,
    runningTasks,
    isRunning,
  }
}
