/**
 * API Route: Background Tasks
 *
 * GET /api/background-tasks
 * Returns all background tasks from V2 Xano workspace (live fetch)
 *
 * Query params:
 * - workspace: "v1" | "v2" | "both" (default: "v2")
 * - active: "true" | "false" | "all" (default: "all")
 */

import { NextRequest, NextResponse } from "next/server"

// Xano API endpoint for background tasks comparison
const XANO_BASE_URL = "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O"

export interface XanoTask {
  id: number
  name: string
  description: string
  guid: string
  active: boolean
  branch: string
  tag: string[]
  datasource: string
  created_at: string
  updated_at: string
}

export interface TasksResponse {
  success: boolean
  workspace: string
  total: number
  active: number
  inactive: number
  tasks: XanoTask[]
  fetchedAt: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const workspace = searchParams.get("workspace") || "v2"
  const activeFilter = searchParams.get("active") || "all"

  try {
    // Fetch from Xano introspection API
    const response = await fetch(`${XANO_BASE_URL}/background-tasks`, {
      headers: {
        "Content-Type": "application/json",
      },
      // Cache for 5 minutes
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`Xano API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Extract tasks based on workspace param
    let tasks: XanoTask[] = []

    if (workspace === "v1" && data.v1) {
      tasks = data.v1.tasks
    } else if (workspace === "v2" && data.v2) {
      tasks = data.v2.tasks
    } else if (workspace === "both") {
      // Combine both with workspace prefix
      const v1Tasks = (data.v1?.tasks || []).map((t: XanoTask) => ({
        ...t,
        name: `[V1] ${t.name}`,
      }))
      const v2Tasks = (data.v2?.tasks || []).map((t: XanoTask) => ({
        ...t,
        name: `[V2] ${t.name}`,
      }))
      tasks = [...v1Tasks, ...v2Tasks]
    } else {
      // Default to V2
      tasks = data.v2?.tasks || []
    }

    // Apply active filter
    if (activeFilter === "true") {
      tasks = tasks.filter((t: XanoTask) => t.active)
    } else if (activeFilter === "false") {
      tasks = tasks.filter((t: XanoTask) => !t.active)
    }

    // Sort by ID
    tasks.sort((a: XanoTask, b: XanoTask) => a.id - b.id)

    const result: TasksResponse = {
      success: true,
      workspace,
      total: tasks.length,
      active: tasks.filter((t: XanoTask) => t.active).length,
      inactive: tasks.filter((t: XanoTask) => !t.active).length,
      tasks,
      fetchedAt: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching background tasks:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        workspace,
        total: 0,
        active: 0,
        inactive: 0,
        tasks: [],
        fetchedAt: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
