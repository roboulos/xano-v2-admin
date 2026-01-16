"use client"

import { useState } from "react"
import { Users, Clock, RefreshCw, Database, FileCode } from "lucide-react"

import { UsersTab } from "./users-tab"
import { OnboardingTab } from "./onboarding-tab"
import { SyncingTab } from "./syncing-tab"
import { SchemaTab } from "./schema-tab"
import { ApiContractTab } from "./api-contract-tab"

type Machine2Tab = "users" | "onboarding" | "syncing" | "schema" | "api"

const TABS = [
  { id: "users" as Machine2Tab, label: "The Users", icon: Users },
  { id: "onboarding" as Machine2Tab, label: "Onboarding", icon: Clock },
  { id: "syncing" as Machine2Tab, label: "Syncing", icon: RefreshCw },
  { id: "schema" as Machine2Tab, label: "Schema", icon: Database },
  { id: "api" as Machine2Tab, label: "Frontend API", icon: FileCode },
]

export function Machine2View() {
  const [activeTab, setActiveTab] = useState<Machine2Tab>("users")

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "onboarding" && <OnboardingTab />}
      {activeTab === "syncing" && <SyncingTab />}
      {activeTab === "schema" && <SchemaTab />}
      {activeTab === "api" && <ApiContractTab />}
    </div>
  )
}
