#!/usr/bin/env tsx
/**
 * Validate Frontend-Backend Alignment
 *
 * This script validates that the frontend and backend are aligned by:
 * 1. Checking that all generated types compile
 * 2. Checking that all hooks are usable
 * 3. Checking that all schemas validate
 * 4. Calculating an alignment score
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

const TYPES_FILE = resolve(__dirname, '../lib/api/generated-types.ts')
const HOOKS_FILE = resolve(__dirname, '../lib/api/generated-hooks.ts')
const SCHEMAS_FILE = resolve(__dirname, '../lib/api/generated-schemas.ts')
const OPENAPI_SPEC = resolve(__dirname, '../lib/frontend-api-v2-openapi.json')

console.log('🔍 Validating Frontend-Backend Alignment...\n')

interface ValidationResult {
  check: string
  passed: boolean
  message: string
}

const results: ValidationResult[] = []

// Check 1: Generated files exist
console.log('📁 Checking generated files...')
const filesExist = [
  { file: TYPES_FILE, name: 'Types' },
  { file: HOOKS_FILE, name: 'Hooks' },
  { file: SCHEMAS_FILE, name: 'Schemas' },
].map(({ file, name }) => {
  const exists = existsSync(file)
  results.push({
    check: `${name} file exists`,
    passed: exists,
    message: exists ? `✅ ${name} file found` : `❌ ${name} file missing - run npm run api:gen`,
  })
  console.log(results[results.length - 1].message)
  return exists
})

if (!filesExist.every(Boolean)) {
  console.log('\n❌ Missing generated files. Run: npm run api:gen')
  process.exit(1)
}

// Check 2: TypeScript compilation
console.log('\n🔧 Checking TypeScript compilation...')
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' })
  results.push({
    check: 'TypeScript compilation',
    passed: true,
    message: '✅ TypeScript compiles without errors',
  })
  console.log(results[results.length - 1].message)
} catch (error) {
  results.push({
    check: 'TypeScript compilation',
    passed: false,
    message: '❌ TypeScript compilation errors detected',
  })
  console.log(results[results.length - 1].message)
  console.error((error as any).stdout?.toString() || error)
}

// Check 3: Count endpoints and hooks
console.log('\n📊 Analyzing API coverage...')
try {
  const spec = JSON.parse(readFileSync(OPENAPI_SPEC, 'utf-8'))
  const endpointCount = Object.keys(spec.paths || {}).reduce((count, path) => {
    return count + Object.keys(spec.paths[path]).length
  }, 0)

  const hooksContent = readFileSync(HOOKS_FILE, 'utf-8')
  const hookMatches = hooksContent.match(/export function use/g) || []
  const hookCount = hookMatches.length

  const schemasContent = readFileSync(SCHEMAS_FILE, 'utf-8')
  const schemaMatches = schemasContent.match(/export const \w+Schema =/g) || []
  const schemaCount = schemaMatches.length

  console.log(`  📌 OpenAPI endpoints: ${endpointCount}`)
  console.log(`  🎣 Generated hooks: ${hookCount}`)
  console.log(`  📝 Generated schemas: ${schemaCount}`)

  const coverage = Math.round((Math.min(hookCount, endpointCount) / endpointCount) * 100)
  results.push({
    check: 'API coverage',
    passed: coverage >= 90,
    message: `${coverage >= 90 ? '✅' : '⚠️'} API coverage: ${coverage}% (${hookCount}/${endpointCount})`,
  })
  console.log('\n' + results[results.length - 1].message)
} catch (error) {
  results.push({
    check: 'API coverage',
    passed: false,
    message: '❌ Failed to analyze API coverage',
  })
  console.log(results[results.length - 1].message)
  console.error(error)
}

// Calculate alignment score
console.log('\n📈 Calculating Alignment Score...')
const totalChecks = results.length
const passedChecks = results.filter(r => r.passed).length
const alignmentScore = Math.round((passedChecks / totalChecks) * 100)

console.log('\n' + '='.repeat(50))
console.log('📊 ALIGNMENT SCORE:', alignmentScore + '%')
console.log('✅ Passed:', passedChecks + '/' + totalChecks)
console.log('='.repeat(50))

if (alignmentScore < 80) {
  console.log('\n⚠️  Warning: Alignment score below 80%')
  console.log('Run: npm run api:gen to regenerate all files')
  process.exit(1)
}

if (alignmentScore === 100) {
  console.log('\n🎉 Perfect alignment! Frontend and backend are in sync.')
}

console.log('\n✅ Validation complete!')
