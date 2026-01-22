#!/usr/bin/env tsx
/**
 * Generate TypeScript types from OpenAPI spec
 *
 * This script uses openapi-typescript to generate types from the Frontend API v2 OpenAPI spec.
 * The generated types provide complete type safety for all 174 endpoints.
 */

import { execSync } from 'child_process'
import { resolve } from 'path'

const INPUT_SPEC = resolve(__dirname, '../lib/frontend-api-v2-openapi.json')
const OUTPUT_FILE = resolve(__dirname, '../lib/api/generated-types.ts')

console.log('🔄 Generating TypeScript types from OpenAPI spec...')
console.log(`📄 Input: ${INPUT_SPEC}`)
console.log(`📝 Output: ${OUTPUT_FILE}`)

try {
  // Use openapi-typescript CLI to generate types
  execSync(
    `npx openapi-typescript "${INPUT_SPEC}" --output "${OUTPUT_FILE}" --export-type`,
    { stdio: 'inherit' }
  )

  console.log('✅ Types generated successfully!')
  console.log(`📊 Generated file: ${OUTPUT_FILE}`)
} catch (error) {
  console.error('❌ Failed to generate types:', error)
  process.exit(1)
}
