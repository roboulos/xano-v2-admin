"use client"

import {
  Users,
  Building2,
  FileText,
  BarChart3,
  Settings,
  Database,
  Receipt,
  Bell,
  AlertCircle,
  Activity,
} from "lucide-react"
import { DomainCard } from "./domain-card"
import {
  FUB_TASKS,
  REZEN_TASKS,
  SKYSLOPE_TASKS,
  AGGREGATION_TASKS,
  TITLE_TASKS,
  AD_TASKS,
  REPORTING_TASKS,
  METRICS_TASKS,
} from "@/lib/api-v2"
import type { BackgroundTask } from "@/lib/types-v2"

interface DomainGridProps {
  isRunning: (taskId: number) => boolean
  onRunTask: (task: BackgroundTask) => void
}

export function FubDomain({ isRunning, onRunTask }: DomainGridProps) {
  return (
    <DomainCard
      name="Follow Up Boss"
      description="CRM sync: people, calls, texts, appointments, deals, events"
      icon={<Users className="h-4 w-4 text-blue-600" />}
      color="bg-blue-100"
      tasks={FUB_TASKS}
      isRunning={isRunning}
      onRunTask={onRunTask}
    />
  )
}

export function RezenDomain({ isRunning, onRunTask }: DomainGridProps) {
  return (
    <DomainCard
      name="reZEN"
      description="Brokerage API: transactions, network, contributions, onboarding"
      icon={<Building2 className="h-4 w-4 text-green-600" />}
      color="bg-green-100"
      tasks={REZEN_TASKS}
      isRunning={isRunning}
      onRunTask={onRunTask}
    />
  )
}

export function SkySlopeDomain({ isRunning, onRunTask }: DomainGridProps) {
  return (
    <DomainCard
      name="SkySlope"
      description="Transaction management: listings, transactions, users"
      icon={<FileText className="h-4 w-4 text-purple-600" />}
      color="bg-purple-100"
      tasks={SKYSLOPE_TASKS}
      isRunning={isRunning}
      onRunTask={onRunTask}
    />
  )
}

export function AggregationDomain({ isRunning, onRunTask }: DomainGridProps) {
  return (
    <DomainCard
      name="Aggregation"
      description="Data aggregation: leaderboards, daily/monthly stats"
      icon={<BarChart3 className="h-4 w-4 text-orange-600" />}
      color="bg-orange-100"
      tasks={AGGREGATION_TASKS}
      isRunning={isRunning}
      onRunTask={onRunTask}
    />
  )
}

export function TitleDomain({ isRunning, onRunTask }: DomainGridProps) {
  return (
    <DomainCard
      name="Title"
      description="Title company: Qualia orders, disbursements"
      icon={<Receipt className="h-4 w-4 text-amber-600" />}
      color="bg-amber-100"
      tasks={TITLE_TASKS}
      isRunning={isRunning}
      onRunTask={onRunTask}
    />
  )
}

export function AdDomain({ isRunning, onRunTask }: DomainGridProps) {
  return (
    <DomainCard
      name="AgentDashboards"
      description="Internal: images, avatars, CSV imports, emails"
      icon={<Settings className="h-4 w-4 text-slate-600" />}
      color="bg-slate-100"
      tasks={AD_TASKS}
      isRunning={isRunning}
      onRunTask={onRunTask}
    />
  )
}

export function ReportingDomain({ isRunning, onRunTask }: DomainGridProps) {
  return (
    <DomainCard
      name="Reporting"
      description="Error reporting, Slack notifications"
      icon={<AlertCircle className="h-4 w-4 text-red-600" />}
      color="bg-red-100"
      tasks={REPORTING_TASKS}
      isRunning={isRunning}
      onRunTask={onRunTask}
    />
  )
}

export function MetricsDomain({ isRunning, onRunTask }: DomainGridProps) {
  return (
    <DomainCard
      name="Metrics"
      description="System snapshots and analytics"
      icon={<Activity className="h-4 w-4 text-cyan-600" />}
      color="bg-cyan-100"
      tasks={METRICS_TASKS}
      isRunning={isRunning}
      onRunTask={onRunTask}
    />
  )
}

// Full grid of all domains - ordered by task count
export function DomainGrid({ isRunning, onRunTask }: DomainGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Major domains first */}
      <RezenDomain isRunning={isRunning} onRunTask={onRunTask} />
      <FubDomain isRunning={isRunning} onRunTask={onRunTask} />
      <AdDomain isRunning={isRunning} onRunTask={onRunTask} />

      {/* Medium domains */}
      <SkySlopeDomain isRunning={isRunning} onRunTask={onRunTask} />
      <AggregationDomain isRunning={isRunning} onRunTask={onRunTask} />
      <TitleDomain isRunning={isRunning} onRunTask={onRunTask} />

      {/* Smaller domains */}
      <ReportingDomain isRunning={isRunning} onRunTask={onRunTask} />
      <MetricsDomain isRunning={isRunning} onRunTask={onRunTask} />
    </div>
  )
}
