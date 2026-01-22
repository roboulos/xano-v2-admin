import { NextResponse } from 'next/server'
import { validationConfig } from '@/validation.config'

/**
 * GET /api/validation/pipeline
 *
 * Returns the validation pipeline configuration
 */
export async function GET() {
  return NextResponse.json({
    config: validationConfig,
    message: 'Validation pipeline configuration',
  })
}
