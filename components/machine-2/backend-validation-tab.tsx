'use client'

import { ValidationPipelineView } from '@/components/validation-pipeline-view'

/**
 * Backend Validation Tab - Config-Driven Architecture
 *
 * This tab now uses the integrative thinking approach:
 * - validation.config.ts defines ALL business logic
 * - lib/validation-executor.ts handles execution
 * - This component just renders the auto-generated pipeline view
 *
 * No hardcoding. Config is the single source of truth.
 */

export function BackendValidationTab() {
  return <ValidationPipelineView />
}
