"use client"

import { useState, useCallback, useEffect } from "react"
import type { ActivityLogEntry, ActivityStatus } from "@/lib/types-v2"

const STORAGE_KEY = "v2-activity-log"
const MAX_ENTRIES = 100

interface UseActivityLogReturn {
  entries: ActivityLogEntry[]
  isOpen: boolean
  runningCount: number
  errorCount: number
  addEntry: (entry: Omit<ActivityLogEntry, "id">) => string
  updateEntry: (id: string, updates: Partial<ActivityLogEntry>) => void
  clearAll: () => void
  toggle: () => void
  open: () => void
  close: () => void
}

export function useActivityLog(): UseActivityLogReturn {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ActivityLogEntry[]
        // Reset any "running" entries to "error" (browser was closed during execution)
        const restored = parsed.map(entry =>
          entry.status === "running"
            ? { ...entry, status: "error" as ActivityStatus, error: "Interrupted" }
            : entry
        )
        setEntries(restored)
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Save to localStorage when entries change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
    } catch {
      // Ignore storage errors
    }
  }, [entries])

  const addEntry = useCallback((entry: Omit<ActivityLogEntry, "id">): string => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newEntry: ActivityLogEntry = { ...entry, id }
    setEntries(prev => [newEntry, ...prev].slice(0, MAX_ENTRIES))
    return id
  }, [])

  const updateEntry = useCallback((id: string, updates: Partial<ActivityLogEntry>) => {
    setEntries(prev =>
      prev.map(entry => (entry.id === id ? { ...entry, ...updates } : entry))
    )
  }, [])

  const clearAll = useCallback(() => {
    setEntries([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const runningCount = entries.filter(e => e.status === "running").length
  const errorCount = entries.filter(e => e.status === "error").length

  return {
    entries,
    isOpen,
    runningCount,
    errorCount,
    addEntry,
    updateEntry,
    clearAll,
    toggle,
    open,
    close,
  }
}
