export interface ValidationResult {
  success: boolean
  name: string
  type: 'table' | 'function' | 'endpoint' | 'reference'
  error?: string
  metadata?: Record<string, any>
  timestamp: string
}

export interface ValidationReport {
  summary: {
    total: number
    passed: number
    failed: number
    passRate: number
  }
  results: ValidationResult[]
  duration: number
  filename?: string
  timestamp?: string
}

export interface ValidationMetrics {
  tables: { total: number; validated: number; passed: number; failed: number }
  functions: { total: number; validated: number; passed: number; failed: number }
  endpoints: { total: number; validated: number; passed: number; failed: number }
  references: { total: number; validated: number; passed: number; failed: number }
}

export interface ValidationIssue {
  component: string
  type: 'table' | 'function' | 'endpoint' | 'reference'
  name: string
  error: string
  severity: 'critical' | 'warning' | 'info'
}

export type ValidationType = 'tables' | 'functions' | 'endpoints' | 'references' | 'all'
