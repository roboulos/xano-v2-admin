// Pure diff computation utilities for V1/V2 comparison
// IMPORTANT: This file must have ZERO React imports - pure functions only.
// This ensures the core logic is unit-testable without jsdom.

import { type FieldMapping, SPLIT_MAPPINGS } from '@/lib/table-mappings-detailed'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DiffStatus = 'match' | 'modified' | 'added' | 'removed' | 'type_mismatch'

export interface FieldDiff {
  field: string
  v1Value: unknown
  v2Value: unknown
  status: DiffStatus
  /** V1 field path when the field was renamed between V1 and V2 */
  v1Path?: string
  /** V2 field path when the field was renamed between V1 and V2 */
  v2Path?: string
}

export interface DiffSummary {
  total: number
  matches: number
  modified: number
  added: number
  removed: number
  typeMismatches: number
  /** Percentage of fields that match (0-100) */
  matchPercent: number
}

export interface ArrayDiffResult {
  added: unknown[]
  removed: unknown[]
  common: unknown[]
}

// ---------------------------------------------------------------------------
// ISO Date Detection
// ---------------------------------------------------------------------------

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/

/**
 * Returns true if the value looks like an ISO 8601 date string.
 */
export function isISODateString(value: unknown): value is string {
  if (typeof value !== 'string') return false
  return ISO_DATE_REGEX.test(value)
}

// ---------------------------------------------------------------------------
// Type-Coerced Comparison
// ---------------------------------------------------------------------------

/**
 * Compares two values with smart type coercion:
 * - string "60" matches number 60
 * - ISO date strings are compared as timestamps
 * - null/undefined are considered equal
 * - Arrays are compared element-by-element
 * - Objects are compared recursively
 */
export function valuesMatch(a: unknown, b: unknown): boolean {
  // Identical reference or both undefined/null
  if (a === b) return true
  if (a == null && b == null) return true

  // One is null/undefined and the other is not
  if (a == null || b == null) return false

  // ISO date comparison: normalise to timestamps
  if (isISODateString(a) && isISODateString(b)) {
    const ta = new Date(a).getTime()
    const tb = new Date(b).getTime()
    if (!Number.isNaN(ta) && !Number.isNaN(tb)) {
      return ta === tb
    }
  }

  // Numeric coercion: string "60" == number 60
  if (typeof a === 'string' && typeof b === 'number') {
    return !Number.isNaN(Number(a)) && Number(a) === b
  }
  if (typeof a === 'number' && typeof b === 'string') {
    return !Number.isNaN(Number(b)) && a === Number(b)
  }

  // Boolean coercion: boolean true == 1 or "true"
  if (typeof a === 'boolean' && typeof b !== 'boolean') {
    if (typeof b === 'number') return a === (b === 1)
    if (typeof b === 'string') return String(a) === b.toLowerCase()
    return false
  }
  if (typeof b === 'boolean' && typeof a !== 'boolean') {
    return valuesMatch(b, a) // flip to reuse the branch above
  }

  // Array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, i) => valuesMatch(item, b[i]))
  }

  // Object comparison (non-null, non-array)
  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>
    const bObj = b as Record<string, unknown>
    const aKeys = Object.keys(aObj)
    const bKeys = Object.keys(bObj)
    if (aKeys.length !== bKeys.length) return false
    return aKeys.every((key) => key in bObj && valuesMatch(aObj[key], bObj[key]))
  }

  // Fallback: string comparison
  return String(a) === String(b)
}

/**
 * Detects whether two values have a type mismatch that goes beyond simple
 * numeric coercion. For example, an object vs a string is a type mismatch.
 */
export function hasTypeMismatch(a: unknown, b: unknown): boolean {
  if (a == null || b == null) return false

  const typeA = Array.isArray(a) ? 'array' : typeof a
  const typeB = Array.isArray(b) ? 'array' : typeof b

  if (typeA === typeB) return false

  // Allow string <-> number coercion without flagging as type mismatch
  if ((typeA === 'string' && typeB === 'number') || (typeA === 'number' && typeB === 'string')) {
    return false
  }

  // Allow boolean <-> number coercion
  if ((typeA === 'boolean' && typeB === 'number') || (typeA === 'number' && typeB === 'boolean')) {
    return false
  }

  return true
}

// ---------------------------------------------------------------------------
// Field Name Mapping
// ---------------------------------------------------------------------------

/**
 * Looks up whether a V1 field maps to a different V2 field name using
 * the detailed field mappings from table-mappings-detailed.ts.
 *
 * Returns the V2 field name if a mapping exists, or the original field name.
 */
export function resolveFieldName(
  v1TableName: string,
  v1FieldName: string
): { v2FieldName: string; v2TableName?: string } {
  const mapping = SPLIT_MAPPINGS[v1TableName]
  if (!mapping?.fieldMappings) {
    return { v2FieldName: v1FieldName }
  }

  const fieldMap: FieldMapping | undefined = mapping.fieldMappings.find(
    (fm) => fm.v1Field === v1FieldName
  )

  if (!fieldMap) {
    return { v2FieldName: v1FieldName }
  }

  return {
    v2FieldName: fieldMap.v2Field,
    v2TableName: fieldMap.v2Table,
  }
}

/**
 * Builds a lookup map: v2FieldName -> v1FieldName for a given V1 table.
 * Useful for matching fields when iterating V2 data.
 */
export function buildFieldNameMap(v1TableName: string): Map<string, string> {
  const map = new Map<string, string>()
  const mapping = SPLIT_MAPPINGS[v1TableName]
  if (!mapping?.fieldMappings) return map

  for (const fm of mapping.fieldMappings) {
    map.set(fm.v2Field, fm.v1Field)
  }
  return map
}

// ---------------------------------------------------------------------------
// Array Diff
// ---------------------------------------------------------------------------

/**
 * Computes the diff between two arrays, identifying added, removed,
 * and common items. Uses valuesMatch for comparison.
 */
export function diffArrays(v1Array: unknown[], v2Array: unknown[]): ArrayDiffResult {
  const common: unknown[] = []
  const removed: unknown[] = []

  const v2Remaining = [...v2Array]

  for (const v1Item of v1Array) {
    const matchIdx = v2Remaining.findIndex((v2Item) => valuesMatch(v1Item, v2Item))
    if (matchIdx !== -1) {
      common.push(v1Item)
      v2Remaining.splice(matchIdx, 1)
    } else {
      removed.push(v1Item)
    }
  }

  return {
    added: v2Remaining,
    removed,
    common,
  }
}

// ---------------------------------------------------------------------------
// Object Diff (Core Field Comparison)
// ---------------------------------------------------------------------------

/**
 * Compares two records field-by-field and produces a list of FieldDiff
 * results. Handles renamed fields via table mapping lookup.
 *
 * @param v1Record - The V1 record (object)
 * @param v2Record - The V2 record (object)
 * @param v1TableName - Optional V1 table name for field name mapping
 * @returns Array of FieldDiff results, one per unique field
 */
export function compareFields(
  v1Record: Record<string, unknown>,
  v2Record: Record<string, unknown>,
  v1TableName?: string
): FieldDiff[] {
  const diffs: FieldDiff[] = []
  const processedV2Keys = new Set<string>()

  // Build reverse mapping: v1Field -> v2Field
  const fieldNameMap = new Map<string, string>()
  if (v1TableName) {
    const mapping = SPLIT_MAPPINGS[v1TableName]
    if (mapping?.fieldMappings) {
      for (const fm of mapping.fieldMappings) {
        fieldNameMap.set(fm.v1Field, fm.v2Field)
      }
    }
  }

  // Process all V1 fields
  for (const v1Key of Object.keys(v1Record)) {
    const v1Value = v1Record[v1Key]

    // Determine the corresponding V2 key
    const mappedV2Key = fieldNameMap.get(v1Key)

    // Check if the V2 key exists (try mapped name first, then original)
    let actualV2Key: string | undefined
    if (mappedV2Key && mappedV2Key in v2Record) {
      actualV2Key = mappedV2Key
    } else if (v1Key in v2Record) {
      actualV2Key = v1Key
    }

    if (actualV2Key != null) {
      processedV2Keys.add(actualV2Key)
      const v2Value = v2Record[actualV2Key]

      if (hasTypeMismatch(v1Value, v2Value)) {
        diffs.push({
          field: v1Key,
          v1Value,
          v2Value,
          status: 'type_mismatch',
          ...(actualV2Key !== v1Key ? { v1Path: v1Key, v2Path: actualV2Key } : {}),
        })
      } else if (valuesMatch(v1Value, v2Value)) {
        diffs.push({
          field: v1Key,
          v1Value,
          v2Value,
          status: 'match',
          ...(actualV2Key !== v1Key ? { v1Path: v1Key, v2Path: actualV2Key } : {}),
        })
      } else {
        diffs.push({
          field: v1Key,
          v1Value,
          v2Value,
          status: 'modified',
          ...(actualV2Key !== v1Key ? { v1Path: v1Key, v2Path: actualV2Key } : {}),
        })
      }
    } else {
      // Field exists in V1 but not V2 -> removed
      diffs.push({
        field: v1Key,
        v1Value,
        v2Value: undefined,
        status: 'removed',
        v1Path: v1Key,
      })
    }
  }

  // Process V2-only fields (added in V2)
  for (const v2Key of Object.keys(v2Record)) {
    if (!processedV2Keys.has(v2Key) && !(v2Key in v1Record)) {
      diffs.push({
        field: v2Key,
        v1Value: undefined,
        v2Value: v2Record[v2Key],
        status: 'added',
        v2Path: v2Key,
      })
    }
  }

  return diffs
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

/**
 * Computes a summary from an array of FieldDiff results.
 */
export function summarizeDiffs(diffs: FieldDiff[]): DiffSummary {
  const total = diffs.length
  const matches = diffs.filter((d) => d.status === 'match').length
  const modified = diffs.filter((d) => d.status === 'modified').length
  const added = diffs.filter((d) => d.status === 'added').length
  const removed = diffs.filter((d) => d.status === 'removed').length
  const typeMismatches = diffs.filter((d) => d.status === 'type_mismatch').length

  return {
    total,
    matches,
    modified,
    added,
    removed,
    typeMismatches,
    matchPercent: total > 0 ? Math.round((matches / total) * 100) : 100,
  }
}

// ---------------------------------------------------------------------------
// Formatting Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a value for display. Handles null, undefined, objects, arrays,
 * and long strings with truncation.
 */
export function formatValue(value: unknown, maxLength = 80): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)

  if (typeof value === 'string') {
    const strValue = value
    if (ISO_DATE_REGEX.test(strValue)) {
      // Format date strings more readably
      try {
        const d = new Date(strValue)
        return d
          .toISOString()
          .replace('T', ' ')
          .replace(/\.000Z$/, ' UTC')
      } catch {
        return strValue
      }
    }
    return strValue.length > maxLength ? strValue.slice(0, maxLength) + '...' : strValue
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const preview = JSON.stringify(value)
    return preview.length > maxLength ? preview.slice(0, maxLength) + '...' : preview
  }

  if (typeof value === 'object') {
    const preview = JSON.stringify(value)
    return preview.length > maxLength ? preview.slice(0, maxLength) + '...' : preview
  }

  return String(value)
}

/**
 * Returns a human-readable label for a DiffStatus.
 */
export function statusLabel(status: DiffStatus): string {
  switch (status) {
    case 'match':
      return 'Match'
    case 'modified':
      return 'Modified'
    case 'added':
      return 'Added in V2'
    case 'removed':
      return 'Removed in V2'
    case 'type_mismatch':
      return 'Type Mismatch'
  }
}

/**
 * Returns an accessible text icon for each diff status.
 * Used alongside colour to ensure accessibility.
 */
export function statusIcon(status: DiffStatus): string {
  switch (status) {
    case 'match':
      return '=' // equals sign for match
    case 'modified':
      return '~' // tilde for modified
    case 'added':
      return '+' // plus for added
    case 'removed':
      return '-' // minus for removed
    case 'type_mismatch':
      return '!' // exclamation for type mismatch
  }
}
