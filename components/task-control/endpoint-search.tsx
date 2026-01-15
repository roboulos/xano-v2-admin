"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, Play, X, Clock, Pause, GitBranch } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BACKGROUND_TASKS, searchTasks } from "@/lib/api-v2"
import type { BackgroundTask } from "@/lib/types-v2"

interface EndpointSearchProps {
  isOpen: boolean
  onClose: () => void
  onRunTask: (task: BackgroundTask) => void
  isRunning: (taskId: number) => boolean
}

export function EndpointSearch({
  isOpen,
  onClose,
  onRunTask,
  isRunning,
}: EndpointSearchProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter tasks based on query
  const filteredTasks = useMemo(() => {
    if (!query.trim()) return BACKGROUND_TASKS
    return searchTasks(query)
  }, [query])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex(prev =>
            prev < filteredTasks.length - 1 ? prev + 1 : prev
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          e.preventDefault()
          if (filteredTasks[selectedIndex]) {
            const task = filteredTasks[selectedIndex]
            if (task.active) {
              onRunTask(task)
              onClose()
              setQuery("")
            }
          }
          break
        case "Escape":
          onClose()
          setQuery("")
          break
      }
    },
    [filteredTasks, selectedIndex, onRunTask, onClose]
  )

  // Clear on close
  useEffect(() => {
    if (!isOpen) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isOpen])

  const domainColors: Record<string, string> = {
    fub: "bg-blue-100 text-blue-700",
    rezen: "bg-green-100 text-green-700",
    skyslope: "bg-purple-100 text-purple-700",
    aggregation: "bg-orange-100 text-orange-700",
    title: "bg-amber-100 text-amber-700",
    ad: "bg-slate-100 text-slate-700",
    reporting: "bg-red-100 text-red-700",
    metrics: "bg-cyan-100 text-cyan-700",
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Tasks</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            placeholder="Search tasks by name, function, or tags..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 text-base"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No tasks found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredTasks.map((task, index) => (
                <button
                  key={task.id}
                  onClick={() => {
                    if (task.active) {
                      onRunTask(task)
                      onClose()
                      setQuery("")
                    }
                  }}
                  disabled={!task.active}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    !task.active
                      ? "opacity-50 cursor-not-allowed"
                      : index === selectedIndex
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                  onMouseEnter={() => task.active && setSelectedIndex(index)}
                >
                  <div
                    className={`p-1.5 rounded ${domainColors[task.domain] || "bg-gray-100"}`}
                  >
                    {!task.active ? (
                      <Pause className="h-4 w-4" />
                    ) : task.schedule ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{task.name}</span>
                      {isRunning(task.id) && (
                        <Badge variant="default" className="text-xs animate-pulse">
                          running
                        </Badge>
                      )}
                      {task.schedule && (
                        <Badge variant="outline" className="text-xs text-blue-600">
                          {task.schedule.frequencyLabel}
                        </Badge>
                      )}
                      {!task.active && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          inactive
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      {task.callsFunction ? (
                        <>
                          <GitBranch className="h-3 w-3" />
                          {task.callsFunction}
                        </>
                      ) : (
                        <span className="italic">No function call</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs ${domainColors[task.domain] || ""}`}
                    >
                      {task.domain}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                      ID: {task.id}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground">
          <span>{filteredTasks.length} tasks</span>
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd> to run
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted">Esc</kbd> to close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
