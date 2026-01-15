"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight,
  ChevronDown,
  Calendar,
  Flag,
  Lightbulb,
  Bug,
  Sparkles,
  Database,
  Zap,
  Link2,
  Rocket,
  TrendingUp,
} from "lucide-react"

import {
  TIMELINE_EVENTS,
  getTimelineStats,
  getWeekSummary,
  getLatestMetrics,
} from "@/lib/timeline-events"
import {
  TIMELINE_CATEGORY_LABELS,
  TIMELINE_CATEGORY_COLORS,
  type TimelineCategory,
} from "@/types/mappings"

// Category icon component
function CategoryIcon({ category }: { category: TimelineCategory }) {
  const icons: Record<TimelineCategory, React.ReactNode> = {
    milestone: <Flag className="h-4 w-4" />,
    decision: <Lightbulb className="h-4 w-4" />,
    fix: <Bug className="h-4 w-4" />,
    feature: <Sparkles className="h-4 w-4" />,
    migration: <Database className="h-4 w-4" />,
    performance: <Zap className="h-4 w-4" />,
    integration: <Link2 className="h-4 w-4" />,
    launch: <Rocket className="h-4 w-4" />,
  }

  return icons[category] || <Flag className="h-4 w-4" />
}

// Category badge component
function CategoryBadge({ category }: { category: TimelineCategory }) {
  const colors = TIMELINE_CATEGORY_COLORS[category]
  const label = TIMELINE_CATEGORY_LABELS[category]

  return (
    <Badge className={`${colors.bg} ${colors.text} ${colors.border} flex items-center gap-1`}>
      <CategoryIcon category={category} />
      {label}
    </Badge>
  )
}

// Impact badge
function ImpactBadge({ impact }: { impact: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-gray-100 text-gray-700 border-gray-200",
  }

  return (
    <Badge variant="outline" className={`${colors[impact]} text-[10px]`}>
      {impact} impact
    </Badge>
  )
}

// Timeline event card
function TimelineEventCard({
  event,
  isExpanded,
  onToggle,
}: {
  event: typeof TIMELINE_EVENTS[0]
  isExpanded: boolean
  onToggle: () => void
}) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex gap-4">
      {/* Date column */}
      <div className="w-24 flex-shrink-0 text-right pt-2">
        <div className="text-sm font-medium text-foreground">{formattedDate}</div>
        <div className="text-xs text-muted-foreground">{event.date}</div>
      </div>

      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${
          event.impact === "high" ? "bg-red-500" :
          event.impact === "medium" ? "bg-amber-500" : "bg-gray-400"
        }`} />
        <div className="w-0.5 flex-grow bg-muted" />
      </div>

      {/* Event card */}
      <Card
        className={`flex-grow mb-4 transition-all duration-200 cursor-pointer ${
          isExpanded
            ? "border-2 border-solid border-primary/30 shadow-md"
            : "border hover:border-primary/20 hover:shadow-sm"
        }`}
        onClick={onToggle}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <CardTitle className="text-base flex items-center gap-2">
                {event.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <CategoryBadge category={event.category} />
                <ImpactBadge impact={event.impact} />
              </div>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

            {/* Metrics if available */}
            {event.metrics && (
              <div className="flex flex-wrap gap-2 mb-3">
                {event.metrics.tables_migrated !== undefined && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <Database className="h-3 w-3 mr-1" />
                    {event.metrics.tables_migrated} tables
                  </Badge>
                )}
                {event.metrics.endpoints_verified !== undefined && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {event.metrics.endpoints_verified} endpoints verified
                  </Badge>
                )}
                {event.metrics.tests_passed !== undefined && event.metrics.test_total !== undefined && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {event.metrics.tests_passed}/{event.metrics.test_total} tests passed
                  </Badge>
                )}
              </div>
            )}

            {/* Artifacts if available */}
            {event.artifacts && event.artifacts.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Related:</span>{" "}
                {event.artifacts.map((a, i) => (
                  <span key={i} className="font-mono">{a}{i < event.artifacts!.length - 1 ? ", " : ""}</span>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

// Week summary card
function WeekSummaryCard({
  weekNum,
  isExpanded,
  onToggle,
}: {
  weekNum: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const summary = getWeekSummary(weekNum)
  if (!summary) return null

  // Calculate week start date from week number
  const startDate = new Date("2025-12-05")
  const weekStartDate = new Date(startDate.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000)
  const weekEndDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000)

  return (
    <Card className={`mb-6 ${isExpanded ? "border-primary/30" : ""}`}>
      <CardHeader
        className="cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Week {weekNum}: {summary.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {
                  weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{summary.events.length} events</Badge>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{summary.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {summary.keyAchievements.map((h, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {h}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Main Timeline Tab component
export function TimelineTab() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)
  const [filterCategory, setFilterCategory] = useState<TimelineCategory | "all">("all")

  const stats = useMemo(() => getTimelineStats(), [])
  const latestMetrics = useMemo(() => getLatestMetrics(), [])

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filterCategory === "all") return TIMELINE_EVENTS
    return TIMELINE_EVENTS.filter(e => e.category === filterCategory)
  }, [filterCategory])

  // Week numbers 1-6 for the 40-day migration period
  const weekNumbers = [1, 2, 3, 4, 5, 6]

  const categories: TimelineCategory[] = [
    "milestone", "decision", "fix", "feature", "migration", "performance", "integration", "launch"
  ]

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">V1 → V2 Migration Journey</h2>
            <p className="text-muted-foreground">December 5, 2025 - January 14, 2026 (40 days)</p>
          </div>

          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">{stats.totalEvents}</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600">{stats.byCategory.milestone || 0}</div>
              <div className="text-sm text-muted-foreground">Milestones</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.byCategory.fix || 0}</div>
              <div className="text-sm text-muted-foreground">Bug Fixes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{stats.byCategory.decision || 0}</div>
              <div className="text-sm text-muted-foreground">Decisions</div>
            </div>
          </div>

          {/* Latest metrics */}
          {latestMetrics && (
            <div className="flex items-center justify-center gap-4 mt-6">
              {latestMetrics.tables_migrated && (
                <Badge className="bg-blue-100 text-blue-700">
                  <Database className="h-3 w-3 mr-1" />
                  {latestMetrics.tables_migrated}+ tables migrated
                </Badge>
              )}
              {latestMetrics.endpoints_verified && (
                <Badge className="bg-green-100 text-green-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {latestMetrics.endpoints_verified}+ endpoints verified
                </Badge>
              )}
            </div>
          )}

          {/* Category filters */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              All ({stats.totalEvents})
            </button>
            {categories.map((cat) => {
              const count = TIMELINE_EVENTS.filter(e => e.category === cat).length
              if (count === 0) return null
              const colors = TIMELINE_CATEGORY_COLORS[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filterCategory === cat
                      ? `${colors.bg} ${colors.text}`
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <CategoryIcon category={cat} />
                  {count}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Week summaries */}
      <div className="space-y-2">
        {weekNumbers.map((weekNum) => (
          <WeekSummaryCard
            key={weekNum}
            weekNum={weekNum}
            isExpanded={expandedWeek === weekNum}
            onToggle={() => setExpandedWeek(expandedWeek === weekNum ? null : weekNum)}
          />
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Timeline
            <Badge variant="secondary" className="ml-2">{filteredEvents.length} events</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {filteredEvents.map((event) => (
              <TimelineEventCard
                key={`${event.date}-${event.title}`}
                event={event}
                isExpanded={expandedEvent === `${event.date}-${event.title}`}
                onToggle={() => setExpandedEvent(
                  expandedEvent === `${event.date}-${event.title}` ? null : `${event.date}-${event.title}`
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
