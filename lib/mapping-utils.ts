// Auto-detection utilities for V1 → V2 migration mappings
// Provides algorithms to match functions, tasks, and endpoints between workspaces

import type { MappingType, DetectionPattern, FunctionCategory, TaskCategory } from "@/types/mappings"

// ═══════════════════════════════════════════════════════════════
// NAME NORMALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize a name for comparison
 * - Lowercase
 * - Remove spaces and underscores for comparison
 * - Handle common prefixes
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace(/^(sync|process|update|get|fetch|create|delete|handle)/, "")
}

/**
 * Extract the base name from a folder path
 * "Workers/sync_fub" → "sync_fub"
 * "Tasks/daily_cleanup" → "daily_cleanup"
 */
export function extractBaseName(fullPath: string): string {
  const parts = fullPath.split("/")
  return parts[parts.length - 1]
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

// ═══════════════════════════════════════════════════════════════
// MATCHING ALGORITHMS
// ═══════════════════════════════════════════════════════════════

export interface MatchResult {
  pattern: DetectionPattern
  confidence: "high" | "medium" | "low"
  matchedName?: string
  reason: string
}

/**
 * Find the best match for a V1 name in a list of V2 names
 */
export function findBestMatch(
  v1Name: string,
  v2Names: string[],
  v2Tags?: Map<string, string[]>
): MatchResult {
  const v1Base = extractBaseName(v1Name)
  const v1Normalized = normalizeName(v1Base)
  const v1Camel = snakeToCamel(v1Base)
  const v1Lower = v1Base.toLowerCase()

  // 1. Exact match
  for (const v2Name of v2Names) {
    const v2Base = extractBaseName(v2Name)
    if (v2Base === v1Base) {
      return {
        pattern: "exact_match",
        confidence: "high",
        matchedName: v2Name,
        reason: `Exact name match: "${v1Base}"`
      }
    }
  }

  // 2. Case-insensitive match
  for (const v2Name of v2Names) {
    const v2Base = extractBaseName(v2Name)
    if (v2Base.toLowerCase() === v1Lower) {
      return {
        pattern: "case_insensitive",
        confidence: "high",
        matchedName: v2Name,
        reason: `Case-insensitive match: "${v1Base}" → "${v2Base}"`
      }
    }
  }

  // 3. Snake_case to camelCase conversion
  for (const v2Name of v2Names) {
    const v2Base = extractBaseName(v2Name)
    if (v2Base === v1Camel || snakeToCamel(v2Base) === v1Camel) {
      return {
        pattern: "snake_to_camel",
        confidence: "high",
        matchedName: v2Name,
        reason: `Naming convention: "${v1Base}" → "${v2Base}"`
      }
    }
  }

  // 4. Prefix stripped match (sync_fub → fub, process_rezen → rezen)
  const prefixStripped = v1Base.replace(/^(sync_|process_|update_|get_|fetch_|handle_|create_|delete_)/, "")
  for (const v2Name of v2Names) {
    const v2Base = extractBaseName(v2Name)
    const v2Stripped = v2Base.replace(/^(sync_|process_|update_|get_|fetch_|handle_|create_|delete_)/, "")
    if (prefixStripped.toLowerCase() === v2Stripped.toLowerCase()) {
      return {
        pattern: "prefix_stripped",
        confidence: "medium",
        matchedName: v2Name,
        reason: `Prefix normalization: "${v1Base}" → "${v2Base}"`
      }
    }
  }

  // 5. Folder path matching (Workers/sync → sync)
  if (v1Name.includes("/")) {
    for (const v2Name of v2Names) {
      const v2Base = extractBaseName(v2Name)
      if (v1Base.toLowerCase().includes(v2Base.toLowerCase()) ||
          v2Base.toLowerCase().includes(v1Base.toLowerCase())) {
        return {
          pattern: "folder_match",
          confidence: "medium",
          matchedName: v2Name,
          reason: `Folder path match: "${v1Name}" → "${v2Name}"`
        }
      }
    }
  }

  // 6. Tag-based matching (if tags provided)
  if (v2Tags) {
    // This would require V1 tags to be passed in
    // Placeholder for future enhancement
  }

  // 7. Semantic/fuzzy matching - check if names share significant words
  const v1Words = v1Base.toLowerCase().split(/[_\s-]+/).filter(w => w.length > 2)
  for (const v2Name of v2Names) {
    const v2Base = extractBaseName(v2Name)
    const v2Words = v2Base.toLowerCase().split(/[_\s-]+/).filter(w => w.length > 2)
    const commonWords = v1Words.filter(w => v2Words.includes(w))
    if (commonWords.length >= 2 || (commonWords.length === 1 && commonWords[0].length > 5)) {
      return {
        pattern: "semantic_match",
        confidence: "low",
        matchedName: v2Name,
        reason: `Semantic match (${commonWords.join(", ")}): "${v1Base}" → "${v2Base}"`
      }
    }
  }

  // No match found
  return {
    pattern: "no_match",
    confidence: "low",
    reason: `No V2 equivalent found for "${v1Name}"`
  }
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY DETECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Detect function category from name and tags
 */
export function detectFunctionCategory(name: string, tags?: string[]): FunctionCategory {
  const lower = name.toLowerCase()
  const tagStr = (tags || []).join(" ").toLowerCase()

  // Check tags first
  if (tagStr.includes("fub") || tagStr.includes("follow up boss")) return "sync"
  if (tagStr.includes("rezen")) return "sync"
  if (tagStr.includes("aggregation") || tagStr.includes("agg")) return "aggregation"
  if (tagStr.includes("worker")) return "worker"
  if (tagStr.includes("health")) return "health"
  if (tagStr.includes("email")) return "email"
  if (tagStr.includes("notification")) return "notification"
  if (tagStr.includes("auth")) return "auth"

  // Check name patterns
  if (lower.includes("sync") || lower.includes("fub") || lower.includes("rezen") ||
      lower.includes("skyslope") || lower.includes("dotloop") || lower.includes("lofty")) {
    return "sync"
  }
  if (lower.includes("agg") || lower.includes("aggregate") || lower.includes("rollup")) {
    return "aggregation"
  }
  if (lower.includes("worker") || lower.includes("process") || lower.includes("job")) {
    return "worker"
  }
  if (lower.includes("health") || lower.includes("check") || lower.includes("validate")) {
    return "health"
  }
  if (lower.includes("cleanup") || lower.includes("clean") || lower.includes("purge")) {
    return "cleanup"
  }
  if (lower.includes("email") || lower.includes("mail") || lower.includes("send")) {
    return "email"
  }
  if (lower.includes("notify") || lower.includes("notification") || lower.includes("alert")) {
    return "notification"
  }
  if (lower.includes("auth") || lower.includes("login") || lower.includes("token") ||
      lower.includes("session") || lower.includes("password")) {
    return "auth"
  }
  if (lower.includes("api") || lower.includes("endpoint") || lower.includes("route") ||
      lower.includes("handler")) {
    return "api"
  }
  if (lower.includes("util") || lower.includes("helper") || lower.includes("format") ||
      lower.includes("convert") || lower.includes("parse")) {
    return "util"
  }
  if (lower.includes("migrate") || lower.includes("migration") || lower.includes("transform")) {
    return "migration"
  }

  return "other"
}

/**
 * Detect task category from name and tags
 */
export function detectTaskCategory(name: string, tags?: string[], schedule?: string): TaskCategory {
  const lower = name.toLowerCase()
  const tagStr = (tags || []).join(" ").toLowerCase()

  // Check tags first
  if (tagStr.includes("fub") || tagStr.includes("follow up boss")) return "fub"
  if (tagStr.includes("rezen")) return "rezen"
  if (tagStr.includes("aggregation") || tagStr.includes("agg")) return "aggregation"
  if (tagStr.includes("webhook")) return "webhook"
  if (tagStr.includes("health")) return "health"
  if (tagStr.includes("email")) return "email"
  if (tagStr.includes("report")) return "reports"
  if (tagStr.includes("cleanup") || tagStr.includes("clean")) return "cleanup"

  // Check name patterns
  if (lower.includes("fub") || lower.includes("follow_up")) return "fub"
  if (lower.includes("rezen")) return "rezen"
  if (lower.includes("sync") && (lower.includes("daily") || lower.includes("hourly"))) return "sync"
  if (lower.includes("agg") || lower.includes("aggregate") || lower.includes("rollup")) return "aggregation"
  if (lower.includes("cleanup") || lower.includes("clean") || lower.includes("purge")) return "cleanup"
  if (lower.includes("health") || lower.includes("check")) return "health"
  if (lower.includes("report") || lower.includes("summary")) return "reports"
  if (lower.includes("email") || lower.includes("mail")) return "email"
  if (lower.includes("webhook") || lower.includes("hook")) return "webhook"

  return "other"
}

// ═══════════════════════════════════════════════════════════════
// MAPPING TYPE DETECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Determine the mapping type based on match result and context
 */
export function determineMappingType(
  matchResult: MatchResult,
  v2Count: number = 1
): MappingType {
  if (matchResult.pattern === "no_match") {
    return "deprecated"
  }

  if (matchResult.pattern === "exact_match") {
    return "direct"
  }

  if (matchResult.pattern === "case_insensitive" || matchResult.pattern === "snake_to_camel") {
    return "renamed"
  }

  if (v2Count > 1) {
    return "split"
  }

  if (matchResult.confidence === "low") {
    return "renamed"
  }

  return "direct"
}

// ═══════════════════════════════════════════════════════════════
// FOLDER EXTRACTION
// ═══════════════════════════════════════════════════════════════

/**
 * Extract folder path from full function/task name
 */
export function extractFolder(fullPath: string): string | undefined {
  if (!fullPath.includes("/")) return undefined
  const parts = fullPath.split("/")
  return parts.slice(0, -1).join("/")
}

/**
 * Group items by folder
 */
export function groupByFolder<T extends { name: string }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    const folder = extractFolder(item.name) || "Root"
    const existing = groups.get(folder) || []
    existing.push(item)
    groups.set(folder, existing)
  }

  return groups
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS HELPERS
// ═══════════════════════════════════════════════════════════════

export interface MappingStats {
  total: number
  direct: number
  renamed: number
  split: number
  merged: number
  deprecated: number
  new: number
}

/**
 * Calculate mapping statistics
 */
export function calculateMappingStats(
  mappings: Array<{ type: MappingType }>
): MappingStats {
  const stats: MappingStats = {
    total: mappings.length,
    direct: 0,
    renamed: 0,
    split: 0,
    merged: 0,
    deprecated: 0,
    new: 0,
  }

  for (const mapping of mappings) {
    stats[mapping.type]++
  }

  return stats
}
