"use client"

import { useState } from "react"
import { GitCompare, CheckCircle2 } from "lucide-react"

// Only 2 tabs we care about
import { SchemaTab } from "@/components/machine-2/schema-tab"
import { BackendValidationTab } from "@/components/machine-2/backend-validation-tab"

type ViewMode = "schema" | "validation"

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("schema")

  const viewModes = [
    { id: "schema" as ViewMode, label: "Schema Changes", icon: GitCompare },
    { id: "validation" as ViewMode, label: "Validation Status", icon: CheckCircle2 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">V1 → V2 Migration Dashboard</h1>
          <p className="text-muted-foreground">
            Compare schema changes and validate V2 workspace readiness
          </p>
        </div>

        {/* 2-Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg mb-6 w-fit">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${
                viewMode === mode.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <mode.icon className="h-4 w-4" />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {viewMode === "schema" && <SchemaTab />}
          {viewMode === "validation" && <BackendValidationTab />}
        </div>
      </div>
    </div>
  )
}
