"use client"

import { useState } from "react"
import {
  Clock,
  Zap,
  Database,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Play,
  Layers,
  RefreshCw,
  FileCode,
  Server,
  Timer,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  TRIGGER_CHAINS,
  PATTERN_INFO,
  CHAIN_STATS,
  type TriggerChain,
  type TriggerStep,
} from "@/lib/trigger-chains"

// Icons for step types
const stepIcons: Record<TriggerStep["type"], React.ElementType> = {
  background_task: Timer,
  task_function: FileCode,
  worker_function: Zap,
  db_job: Database,
  api_call: Server,
}

const stepColors: Record<TriggerStep["type"], string> = {
  background_task: "bg-blue-500",
  task_function: "bg-purple-500",
  worker_function: "bg-green-500",
  db_job: "bg-orange-500",
  api_call: "bg-red-500",
}

const domainColors: Record<string, string> = {
  aggregation: "bg-orange-100 text-orange-800 border-orange-300",
  fub: "bg-blue-100 text-blue-800 border-blue-300",
  rezen: "bg-green-100 text-green-800 border-green-300",
  skyslope: "bg-purple-100 text-purple-800 border-purple-300",
}

function StepNode({ step, isLast }: { step: TriggerStep; isLast: boolean }) {
  const Icon = stepIcons[step.type]
  const bgColor = stepColors[step.type]

  return (
    <div className="flex items-start gap-3">
      {/* Icon circle */}
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-full ${bgColor} text-white`}>
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && (
          <div className="w-0.5 h-8 bg-gray-300 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{step.name}</span>
          {step.id && (
            <Badge variant="outline" className="text-[10px] px-1">
              ID: {step.id}
            </Badge>
          )}
        </div>
        {step.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {step.description}
          </p>
        )}
      </div>
    </div>
  )
}

function ChainCard({ chain }: { chain: TriggerChain }) {
  const [isOpen, setIsOpen] = useState(false)
  const patternInfo = PATTERN_INFO[chain.pattern]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500 text-white mt-0.5">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                    {chain.name}
                    <Badge className={domainColors[chain.domain]}>
                      {chain.domain.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {chain.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {chain.schedule}
                    </Badge>
                    <Badge className={`text-xs ${patternInfo.color}`}>
                      {patternInfo.icon} {patternInfo.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {chain.steps.length} steps
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Trigger Chain
              </h4>
              <div className="pl-2">
                {chain.steps.map((step, idx) => (
                  <StepNode
                    key={idx}
                    step={step}
                    isLast={idx === chain.steps.length - 1}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function PatternLegend() {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Trigger Patterns</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(PATTERN_INFO).map(([key, info]) => (
            <div
              key={key}
              className={`p-3 rounded-lg border ${info.color}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{info.icon}</span>
                <span className="font-medium text-sm">{info.name}</span>
              </div>
              <p className="text-xs opacity-80">{info.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function StepTypeLegend() {
  const types: { type: TriggerStep["type"]; label: string }[] = [
    { type: "background_task", label: "Scheduled Task" },
    { type: "task_function", label: "Tasks/ Function" },
    { type: "worker_function", label: "Workers/ Function" },
    { type: "db_job", label: "Database Operation" },
    { type: "api_call", label: "External API Call" },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {types.map(({ type, label }) => {
        const Icon = stepIcons[type]
        const bgColor = stepColors[type]
        return (
          <div key={type} className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${bgColor} text-white`}>
              <Icon className="h-3 w-3" />
            </div>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function TriggerChainView() {
  // Group chains by domain
  const chainsByDomain = TRIGGER_CHAINS.reduce((acc, chain) => {
    if (!acc[chain.domain]) acc[chain.domain] = []
    acc[chain.domain].push(chain)
    return acc
  }, {} as Record<string, TriggerChain[]>)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Scheduled</span>
            </div>
            <p className="text-3xl font-bold text-blue-700">{CHAIN_STATS.totalScheduled}</p>
            <p className="text-xs text-blue-600">Entry points (cron jobs)</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">Active Workers</span>
            </div>
            <p className="text-3xl font-bold text-green-700">{CHAIN_STATS.totalActive}</p>
            <p className="text-xs text-green-600">Triggered by schedulers</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Patterns</span>
            </div>
            <p className="text-3xl font-bold text-purple-700">3</p>
            <p className="text-xs text-purple-600">Job Queue, Direct, Loop</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Domains</span>
            </div>
            <p className="text-3xl font-bold text-gray-600">4</p>
            <p className="text-xs text-gray-500">FUB, reZEN, Agg, SkySlope</p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="py-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Play className="h-4 w-4" />
            How Background Tasks Work
          </h3>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Badge variant="outline" className="bg-blue-100">
              <Timer className="h-3 w-3 mr-1" />
              Scheduled Task
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-purple-100">
              <FileCode className="h-3 w-3 mr-1" />
              Tasks/ Function
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-orange-100">
              <Database className="h-3 w-3 mr-1" />
              Query Jobs
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-green-100">
              <Zap className="h-3 w-3 mr-1" />
              Workers/ Function
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            The 8 scheduled tasks act as entry points. They call Tasks/ functions which either
            create job records (picked up by other schedulers) or directly call Workers/ functions.
          </p>
        </CardContent>
      </Card>

      {/* Pattern Legend */}
      <PatternLegend />

      {/* Step Type Legend */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Step Types</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <StepTypeLegend />
        </CardContent>
      </Card>

      {/* Chains by Domain */}
      {Object.entries(chainsByDomain).map(([domain, chains]) => (
        <div key={domain}>
          <div className="flex items-center gap-2 mb-3">
            <Badge className={`${domainColors[domain]} text-sm px-3 py-1`}>
              {domain.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {chains.length} scheduled {chains.length === 1 ? "task" : "tasks"}
            </span>
          </div>
          <div className="space-y-3">
            {chains.map((chain) => (
              <ChainCard key={chain.id} chain={chain} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
